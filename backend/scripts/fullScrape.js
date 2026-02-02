/**
 * Scraping complet : matchs + joueurs + photos + positions
 * Tout en une seule passe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll, queryOne } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

const CLUBS = {
  'psg': 'Paris Saint-Germain', 'paris-sg': 'Paris Saint-Germain',
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
  'parisfc': 'Paris FC', 'paris-fc': 'Paris FC',
  'metz': 'FC Metz',
};

const L1_CLUBS = [...new Set(Object.values(CLUBS))];

function normalizeClub(text) {
  const t = text.toLowerCase();
  // Paris FC doit être testé avant Paris (PSG)
  if (t.includes('paris fc') || t.includes('paris-fc')) return 'Paris FC';
  for (const [key, value] of Object.entries(CLUBS)) {
    if (t.includes(key)) return value;
  }
  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testMatch(page, id) {
  try {
    const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/x-live/${id}`;
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (resp.status() !== 200) return null;

    await sleep(800);
    const title = await page.title();

    if (!title.includes('Ligue 1')) return null;

    // Match terminé avec score
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

async function scrapeMatchWithDetails(page, matchId, homeTeam, awayTeam) {
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

async function getPlayerDetails(page, playerId) {
  try {
    const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });
    await sleep(600);

    const content = await page.content();
    const $ = cheerio.load(content);
    const bodyText = $('body').text();

    // Photo
    let photo = '';
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('medias.lequipe.fr') && !photo) {
        photo = src.replace('{width}', '200');
      }
    });

    // Position - utiliser le pattern "Poste : X" qui est fiable
    let position = 'Milieu';
    const posteMatch = bodyText.match(/Poste\s*:\s*(Gardien|Défenseur|Milieu|Attaquant)/i);
    if (posteMatch) {
      const pos = posteMatch[1].toLowerCase();
      if (pos.includes('gardien')) position = 'Gardien';
      else if (pos.includes('défenseur')) position = 'Defenseur';
      else if (pos.includes('attaquant')) position = 'Attaquant';
      else position = 'Milieu';
    }

    // Nationalité & âge
    const natMatch = bodyText.match(/Nationalité\s*:\s*([A-Za-zÀ-ÿ]+)/i);
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);

    // Stats saison 2025-2026
    const matchsMatch = bodyText.match(/Matchs?\s*joués?\s*:\s*(\d+)/i);
    const butsMatch = bodyText.match(/Buts?\s*marqués?\s*:\s*(\d+)/i);
    const passesMatch = bodyText.match(/Passes?\s*décisives?\s*:\s*(\d+)/i);
    const numMatch = bodyText.match(/Numéro\s*:\s*(\d+)/i);

    return {
      photo,
      position,
      nationality: natMatch ? natMatch[1] : '',
      age: ageMatch ? parseInt(ageMatch[1], 10) : 0,
      matches_played: matchsMatch ? parseInt(matchsMatch[1], 10) : 0,
      goals: butsMatch ? parseInt(butsMatch[1], 10) : 0,
      assists: passesMatch ? parseInt(passesMatch[1], 10) : 0,
      number: numMatch ? parseInt(numMatch[1], 10) : 0,
    };
  } catch (err) {
    return { photo: '', position: 'Milieu', nationality: '', age: 0, matches_played: 0, goals: 0, assists: 0, number: 0 };
  }
}

async function main() {
  console.log('🚀 SCRAPING COMPLET L1\n');

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

  // === ÉTAPE 1: Trouver les matchs ===
  console.log('\n📊 ÉTAPE 1: Recherche des matchs L1...\n');

  const knownIds = [675797, 675800, 675850, 675900, 675950];
  const idsToTest = new Set();

  knownIds.forEach(id => {
    for (let i = -40; i <= 40; i += 2) {
      idsToTest.add(id + i);
    }
  });

  const sortedIds = [...idsToTest].sort((a, b) => a - b);
  const validMatches = [];

  for (const id of sortedIds) {
    process.stdout.write(`\rTest ID ${id}...`);
    const match = await testMatch(page, id);
    if (match) {
      validMatches.push(match);
      console.log(`\n   ✅ ${match.home} ${match.score} ${match.away}`);
    }
    await sleep(250);
  }

  console.log(`\n\n📦 ${validMatches.length} matchs trouvés\n`);

  // === ÉTAPE 2: Récupérer les joueurs de chaque match ===
  console.log('📊 ÉTAPE 2: Extraction des joueurs...\n');

  const allPlayers = new Map();

  for (const match of validMatches) {
    process.stdout.write(`\r${match.home} vs ${match.away}...                    `);
    const players = await scrapeMatchWithDetails(page, match.id, match.home, match.away);

    players.forEach(p => {
      if (!allPlayers.has(p.id)) {
        allPlayers.set(p.id, { ...p, matches: 1 });
      } else {
        allPlayers.get(p.id).matches++;
      }
    });

    await sleep(1000);
  }

  console.log(`\n\n📦 ${allPlayers.size} joueurs uniques\n`);

  // === ÉTAPE 3: Récupérer photos et positions ===
  console.log('📊 ÉTAPE 3: Photos et positions...\n');

  let imported = 0;
  const playersList = Array.from(allPlayers.entries());

  for (let i = 0; i < playersList.length; i++) {
    const [id, player] = playersList[i];
    process.stdout.write(`\r   [${i + 1}/${playersList.length}] ${player.name.substring(0, 20).padEnd(20)}`);

    if (!L1_CLUBS.includes(player.club)) continue;

    await sleep(500);
    const details = await getPlayerDetails(page, id);

    const parts = player.name.split(' ');
    runSql(`
      INSERT INTO players (
        first_name, last_name, name, club, position, nationality,
        photo_url, age, matches_played, goals, assists, number, source_season, api_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parts.slice(0, -1).join(' ') || parts[0],
      parts[parts.length - 1],
      player.name,
      player.club,
      details.position,
      details.nationality,
      details.photo,
      details.age,
      details.matches_played,
      details.goals,
      details.assists,
      details.number,
      CURRENT_SEASON,
      parseInt(id, 10),
    ]);

    imported++;
    if ((i + 1) % 30 === 0) saveDb();
  }

  saveDb();

  // === RÉSUMÉ ===
  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ FINAL');
  console.log('═══════════════════════════════════════');
  console.log(`Matchs analysés: ${validMatches.length}`);
  console.log(`Joueurs importés: ${imported}`);

  const withPhoto = queryOne("SELECT COUNT(*) as c FROM players WHERE photo_url != ''");
  console.log(`Avec photo: ${withPhoto?.c || 0}`);

  const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
  console.log('\nPar club:');
  byClub.forEach(r => console.log(`   ${r.club}: ${r.c}`));

  const byPos = queryAll('SELECT position, COUNT(*) as c FROM players GROUP BY position ORDER BY c DESC');
  console.log('\nPar position:');
  byPos.forEach(r => console.log(`   ${r.position}: ${r.c}`));

  const topScorers = queryAll('SELECT name, club, goals, matches_played FROM players WHERE goals > 0 ORDER BY goals DESC LIMIT 5');
  console.log('\n🏆 Top 5 buteurs:');
  topScorers.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (${p.club}): ${p.goals} buts en ${p.matches_played} matchs`));

  const topAssisters = queryAll('SELECT name, club, assists, matches_played FROM players WHERE assists > 0 ORDER BY assists DESC LIMIT 5');
  console.log('\n🎯 Top 5 passeurs:');
  topAssisters.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (${p.club}): ${p.assists} passes en ${p.matches_played} matchs`));

  await browser.close();
  console.log('\n✅ TERMINÉ');
}

main().catch(console.error);
