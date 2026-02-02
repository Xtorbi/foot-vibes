/**
 * Scraper tous les matchs L1 en utilisant les IDs connus
 * et en explorant autour
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

const CLUBS = {
  'psg': 'Paris Saint-Germain', 'paris-sg': 'Paris Saint-Germain', 'paris': 'Paris Saint-Germain',
  'om': 'Olympique de Marseille', 'marseille': 'Olympique de Marseille',
  'ol': 'Olympique Lyonnais', 'lyon': 'Olympique Lyonnais',
  'monaco': 'AS Monaco',
  'losc': 'LOSC Lille', 'lille': 'LOSC Lille',
  'nice': 'OGC Nice',
  'lens': 'RC Lens',
  'rennes': 'Stade Rennais',
  'brest': 'Stade Brestois 29',
  'strasbourg': 'RC Strasbourg Alsace',
  'toulouse': 'Toulouse FC',
  'nantes': 'FC Nantes',
  'lehavre': 'Le Havre AC', 'havre': 'Le Havre AC',
  'auxerre': 'AJ Auxerre',
  'angers': 'Angers SCO',
  'lorient': 'FC Lorient',
  'parisfc': 'Paris FC',
  'metz': 'FC Metz',
};

const L1_CLUBS = [...new Set(Object.values(CLUBS))];

function normalizeClub(text) {
  const t = text.toLowerCase();
  for (const [key, value] of Object.entries(CLUBS)) {
    if (t.includes(key)) return value;
  }
  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testMatch(page, id) {
  const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/x-live/${id}`;

  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (resp.status() !== 200) return null;

    await sleep(1000);
    const title = await page.title();

    // Vérifier si c'est un match L1 terminé (avec score)
    if (!title.includes('Ligue 1')) return null;

    const scoreMatch = title.match(/([^0-9]+?)\s*(\d+)\s*[-–]\s*(\d+)\s*([^,]+),\s*Ligue 1/);
    if (!scoreMatch) return null;

    const home = normalizeClub(scoreMatch[1]);
    const away = normalizeClub(scoreMatch[4]);

    if (!home || !away) return null;

    return { id, home, away, score: `${scoreMatch[2]}-${scoreMatch[3]}` };
  } catch (err) {
    return null;
  }
}

async function scrapeMatchPlayers(page, matchId, homeTeam, awayTeam) {
  const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/x-live/${matchId}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const players = [];
    const links = $('a[href*="FootballFicheJoueur"]').toArray();
    const mid = Math.floor(links.length / 2);

    links.forEach((el, idx) => {
      const href = $(el).attr('href') || '';
      let name = $(el).text().trim().replace(/\s*\([^)]+\)\s*$/, '');
      const idMatch = href.match(/FootballFicheJoueur(\d+)/);

      if (idMatch && name && name.length > 1 && name.length < 40) {
        players.push({
          id: idMatch[1],
          name,
          club: idx < mid ? homeTeam : awayTeam,
        });
      }
    });

    return players;
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('🚀 Scraping complet matchs L1\n');

  await initDb();

  console.log('🗑️  Vidage base...');
  runSql('DELETE FROM votes');
  runSql('DELETE FROM players');
  saveDb();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // IDs de matchs connus qui fonctionnent
  const knownIds = [675800, 675850, 675900, 675950];

  // Explorer autour de ces IDs pour trouver plus de matchs
  const idsToTest = new Set();
  knownIds.forEach(id => {
    for (let i = -30; i <= 30; i += 3) {
      idsToTest.add(id + i);
    }
  });

  const sortedIds = [...idsToTest].sort((a, b) => a - b);
  console.log(`\n📊 Test de ${sortedIds.length} IDs potentiels...\n`);

  const validMatches = [];

  for (const id of sortedIds) {
    process.stdout.write(`\rTest ID ${id}...`);

    const match = await testMatch(page, id);
    if (match) {
      validMatches.push(match);
      console.log(`\n   ✅ ${match.home} ${match.score} ${match.away}`);
    }

    await sleep(300);
  }

  console.log(`\n\n📦 ${validMatches.length} matchs L1 trouvés\n`);

  // Scraper les joueurs de chaque match
  const allPlayers = new Map();

  for (const match of validMatches) {
    console.log(`\n📄 ${match.home} vs ${match.away}...`);

    const players = await scrapeMatchPlayers(page, match.id, match.home, match.away);
    console.log(`   ${players.length} joueurs`);

    players.forEach(p => {
      if (!allPlayers.has(p.id)) {
        allPlayers.set(p.id, { ...p, matches: 1 });
      } else {
        allPlayers.get(p.id).matches++;
      }
    });

    await sleep(1500);
  }

  console.log(`\n\n📊 ${allPlayers.size} joueurs uniques\n`);

  // Insérer dans la base
  let imported = 0;
  for (const [id, player] of allPlayers) {
    if (L1_CLUBS.includes(player.club)) {
      const parts = player.name.split(' ');
      runSql(`
        INSERT INTO players (
          first_name, last_name, name, club, position,
          matches_played, source_season, api_id
        ) VALUES (?, ?, ?, ?, 'Milieu', ?, ?, ?)
      `, [
        parts.slice(0, -1).join(' ') || parts[0],
        parts[parts.length - 1],
        player.name,
        player.club,
        player.matches,
        CURRENT_SEASON,
        parseInt(id, 10),
      ]);
      imported++;
    }
  }

  saveDb();

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════');
  console.log(`Matchs: ${validMatches.length}`);
  console.log(`Joueurs: ${imported}`);

  const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
  console.log('\nPar club:');
  byClub.forEach(r => console.log(`   ${r.club}: ${r.c}`));

  await browser.close();
  console.log('\n✅ Terminé');
}

main().catch(console.error);
