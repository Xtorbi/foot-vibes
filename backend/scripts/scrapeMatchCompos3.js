/**
 * Scraper les compositions de matchs - Version 3
 * Meilleure extraction des noms et positions
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

const CLUBS = {
  'psg': 'Paris Saint-Germain', 'paris-sg': 'Paris Saint-Germain',
  'om': 'Olympique de Marseille', 'marseille': 'Olympique de Marseille',
  'ol': 'Olympique Lyonnais', 'lyon': 'Olympique Lyonnais',
  'monaco': 'AS Monaco', 'asm': 'AS Monaco',
  'losc': 'LOSC Lille', 'lille': 'LOSC Lille',
  'ogcn': 'OGC Nice', 'nice': 'OGC Nice',
  'lens': 'RC Lens', 'rcl': 'RC Lens',
  'rennes': 'Stade Rennais', 'srfc': 'Stade Rennais',
  'brest': 'Stade Brestois 29', 'sb29': 'Stade Brestois 29',
  'strasbourg': 'RC Strasbourg Alsace', 'rcsa': 'RC Strasbourg Alsace',
  'toulouse': 'Toulouse FC', 'tfc': 'Toulouse FC',
  'nantes': 'FC Nantes', 'fcn': 'FC Nantes',
  'lehavre': 'Le Havre AC', 'hac': 'Le Havre AC',
  'auxerre': 'AJ Auxerre', 'aja': 'AJ Auxerre',
  'angers': 'Angers SCO', 'sco': 'Angers SCO',
  'lorient': 'FC Lorient', 'fcl': 'FC Lorient',
  'parisfc': 'Paris FC',
  'metz': 'FC Metz', 'fcm': 'FC Metz',
};

const L1_CLUBS = [...new Set(Object.values(CLUBS))];

function normalizeClubFromSlug(slug) {
  const s = slug.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, value] of Object.entries(CLUBS)) {
    if (s.includes(key.replace('-', ''))) {
      return value;
    }
  }
  return null;
}

function cleanPlayerName(name) {
  // Supprimer le club entre parenthèses s'il existe
  return name.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeMatch(page, matchId, teamsSlug) {
  const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/${teamsSlug}-live/${matchId}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    await sleep(3000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('title').text();

    if (!title.includes('Ligue 1')) {
      return null;
    }

    // Extraire les équipes du slug
    const slugParts = teamsSlug.split('-');
    let homeTeam = null, awayTeam = null;

    for (let i = 0; i < slugParts.length; i++) {
      const partialSlug = slugParts.slice(0, i + 1).join('-');
      const club = normalizeClubFromSlug(partialSlug);
      if (club && !homeTeam) {
        homeTeam = club;
        const rest = slugParts.slice(i + 1).join('-');
        awayTeam = normalizeClubFromSlug(rest);
        break;
      }
    }

    if (!homeTeam || !awayTeam) {
      return null;
    }

    console.log(`   ${homeTeam} vs ${awayTeam}`);

    const homePlayers = [];
    const awayPlayers = [];

    const playerLinks = $('a[href*="FootballFicheJoueur"]').toArray();
    const midpoint = Math.floor(playerLinks.length / 2);

    playerLinks.forEach((el, idx) => {
      const href = $(el).attr('href') || '';
      let text = $(el).text().trim();
      const idMatch = href.match(/FootballFicheJoueur(\d+)/);

      if (!idMatch || !text || text.length < 2) return;

      // Nettoyer le nom
      text = cleanPlayerName(text);

      const playerId = idMatch[1];
      const isHome = idx < midpoint;

      const playerData = {
        id: playerId,
        name: text,
        club: isHome ? homeTeam : awayTeam,
      };

      if (isHome) {
        if (!homePlayers.find(p => p.id === playerId)) {
          homePlayers.push(playerData);
        }
      } else {
        if (!awayPlayers.find(p => p.id === playerId)) {
          awayPlayers.push(playerData);
        }
      }
    });

    return {
      matchId,
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    };

  } catch (err) {
    return null;
  }
}

async function scrapePlayerDetails(page, playerId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('title').text();

    // Nom: prendre juste la partie avant le tiret
    const nameMatch = title.match(/^([^-–]+)/);
    let name = nameMatch ? nameMatch[1].trim() : '';

    // Nettoyer le nom (enlever le club entre parenthèses)
    name = cleanPlayerName(name);

    const parts = name.split(' ').filter(p => p.length > 0);

    // Photo - chercher la première image avec un src valide
    let photo = '';
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('medias') && src.includes('joueur') && !photo) {
        photo = src.replace('{width}', '200');
      }
    });

    // Position - chercher dans des zones spécifiques
    const bodyText = $('body').text();
    let position = 'Milieu'; // Défaut

    // Chercher des patterns plus spécifiques
    if (/\bGardien\b/i.test(bodyText) && !/\bdes gardiens\b/i.test(bodyText)) {
      position = 'Gardien';
    } else if (/\bDéfenseur\b|\bArrière\b|\bLibéro\b/i.test(bodyText)) {
      position = 'Defenseur';
    } else if (/\bAttaquant\b|\bAvant-centre\b|\bAilier\b/i.test(bodyText)) {
      position = 'Attaquant';
    } else if (/\bMilieu\b/i.test(bodyText)) {
      position = 'Milieu';
    }

    // Nationalité
    const natMatch = bodyText.match(/Nationalité\s*:?\s*([A-Za-zÀ-ÿ]+)/i);

    // Âge
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);

    return {
      name,
      firstName: parts.slice(0, -1).join(' ') || parts[0] || '',
      lastName: parts[parts.length - 1] || '',
      position,
      nationality: natMatch ? natMatch[1] : '',
      age: ageMatch ? parseInt(ageMatch[1], 10) : 0,
      photo_url: photo,
    };

  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 Scraping compositions (v3)\n');

  await initDb();

  console.log('🗑️  Vidage de la base...');
  runSql('DELETE FROM votes');
  runSql('DELETE FROM players');
  saveDb();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // Matchs terminés avec IDs corrects
    const matchesToScrape = [
      { id: 675950, slug: 'lens-auxerre' },
      { id: 675900, slug: 'monaco-lens' },
      { id: 675850, slug: 'lyon-toulouse' },
      { id: 675800, slug: 'metz-strasbourg' },
      { id: 675600, slug: 'psg-nantes' },
      { id: 675550, slug: 'marseille-lille' },
      { id: 675500, slug: 'nice-rennes' },
      { id: 675450, slug: 'brest-angers' },
      { id: 675400, slug: 'lorient-auxerre' },
      { id: 675350, slug: 'toulouse-monaco' },
    ];

    const allPlayers = new Map();
    let matchCount = 0;

    for (const match of matchesToScrape) {
      console.log(`\n📄 Match ${match.slug} (ID: ${match.id})...`);

      const matchData = await scrapeMatch(page, match.id, match.slug);

      if (matchData) {
        matchCount++;
        const allMatchPlayers = [...matchData.homePlayers, ...matchData.awayPlayers];
        console.log(`   ${allMatchPlayers.length} joueurs`);

        for (const player of allMatchPlayers) {
          if (!allPlayers.has(player.id)) {
            allPlayers.set(player.id, { ...player, matches: 1 });
          } else {
            allPlayers.get(player.id).matches++;
          }
        }
      }

      await sleep(2000);
    }

    console.log(`\n\n📊 ${allPlayers.size} joueurs uniques de ${matchCount} matchs`);

    console.log('\n👤 Récupération des détails...\n');

    let imported = 0;
    const playersList = Array.from(allPlayers.values());

    for (let i = 0; i < playersList.length; i++) {
      const player = playersList[i];
      process.stdout.write(`\r   [${i + 1}/${playersList.length}] ${player.name.substring(0, 20).padEnd(20)}`);

      await sleep(700);

      const details = await scrapePlayerDetails(page, player.id);

      if (details && player.club && L1_CLUBS.includes(player.club)) {
        runSql(`
          INSERT INTO players (
            first_name, last_name, name, club, position, nationality,
            photo_url, age, number, matches_played, goals, assists,
            clean_sheets, saves, source_season, api_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, 0, 0, 0, ?, ?)
        `, [
          details.firstName,
          details.lastName,
          details.name || player.name,
          player.club,
          details.position,
          details.nationality,
          details.photo_url,
          details.age,
          player.matches,
          CURRENT_SEASON,
          parseInt(player.id, 10),
        ]);
        imported++;
      }

      if ((i + 1) % 20 === 0) saveDb();
    }

    saveDb();

    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');
    console.log(`Matchs analysés: ${matchCount}`);
    console.log(`Joueurs importés: ${imported}`);

    const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
    console.log('\nPar club:');
    byClub.forEach(row => console.log(`   ${row.club}: ${row.c}`));

    const byPos = queryAll('SELECT position, COUNT(*) as c FROM players GROUP BY position ORDER BY c DESC');
    console.log('\nPar position:');
    byPos.forEach(row => console.log(`   ${row.position}: ${row.c}`));

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Terminé');
}

main().catch(console.error);
