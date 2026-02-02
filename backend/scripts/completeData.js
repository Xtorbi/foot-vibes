/**
 * Compléter les données : ajouter Paris FC + photos + positions
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function findParisFC(page) {
  console.log('🔍 Recherche matchs Paris FC...\n');

  // Tester des IDs autour de ceux de la J20 (preview)
  // paris-fc-om-preview/675965
  const idsToTest = [];
  for (let i = 675600; i <= 675970; i += 3) {
    idsToTest.push(i);
  }

  const parisFCMatches = [];

  for (const id of idsToTest) {
    process.stdout.write(`\rTest ID ${id}...`);

    try {
      const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/x-live/${id}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await sleep(500);

      const title = await page.title();

      if (title.includes('Paris FC') && title.includes('Ligue 1')) {
        const scoreMatch = title.match(/([^0-9]+?)\s*(\d+)\s*[-–]\s*(\d+)\s*([^,]+)/);
        if (scoreMatch) {
          const isHome = scoreMatch[1].includes('Paris FC');
          parisFCMatches.push({
            id,
            home: isHome ? 'Paris FC' : scoreMatch[1].trim(),
            away: isHome ? scoreMatch[4].trim() : 'Paris FC',
            score: `${scoreMatch[2]}-${scoreMatch[3]}`,
          });
          console.log(`\n   ✅ ID ${id}: Paris FC match trouvé!`);

          if (parisFCMatches.length >= 3) break;
        }
      }
    } catch (err) {}

    await sleep(200);
  }

  return parisFCMatches;
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

async function updatePlayerDetails(page, playerId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });
    await sleep(800);

    const content = await page.content();
    const $ = cheerio.load(content);

    // Photo
    let photo = '';
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('medias.lequipe.fr') && src.includes('joueur') && !photo) {
        photo = src.replace('{width}', '200');
      }
    });

    // Position - chercher dans le texte de la page
    const bodyText = $('body').text();
    let position = 'Milieu';

    // Patterns plus spécifiques
    if (/Poste\s*:\s*Gardien/i.test(bodyText) || /\bGardien de but\b/i.test(bodyText)) {
      position = 'Gardien';
    } else if (/Poste\s*:\s*Défenseur/i.test(bodyText) || /\bDéfenseur central\b|\bArrière\b|\bLatéral\b/i.test(bodyText)) {
      position = 'Defenseur';
    } else if (/Poste\s*:\s*Attaquant/i.test(bodyText) || /\bAvant-centre\b|\bAilier\b|\bButeur\b/i.test(bodyText)) {
      position = 'Attaquant';
    } else if (/Poste\s*:\s*Milieu/i.test(bodyText) || /\bMilieu de terrain\b|\bMilieu offensif\b|\bMilieu défensif\b/i.test(bodyText)) {
      position = 'Milieu';
    }

    // Nationalité
    const natMatch = bodyText.match(/Nationalité\s*:?\s*([A-Za-zÀ-ÿ]+)/i);
    const nationality = natMatch ? natMatch[1] : '';

    // Âge
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;

    return { photo, position, nationality, age };
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 Complétion des données\n');

  await initDb();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // 1. Ajouter Paris FC
    const parisFCCount = queryOne("SELECT COUNT(*) as c FROM players WHERE club = 'Paris FC'");
    if (!parisFCCount || parisFCCount.c === 0) {
      console.log('📦 Ajout joueurs Paris FC...\n');

      const parisFCMatches = await findParisFC(page);

      if (parisFCMatches.length > 0) {
        for (const match of parisFCMatches) {
          console.log(`\n📄 ${match.home} vs ${match.away}...`);

          const players = await scrapeMatchPlayers(page, match.id, match.home, match.away);
          const parisFCPlayers = players.filter(p => p.club === 'Paris FC');

          console.log(`   ${parisFCPlayers.length} joueurs Paris FC`);

          for (const player of parisFCPlayers) {
            const existing = queryOne('SELECT id FROM players WHERE api_id = ?', [parseInt(player.id, 10)]);
            if (!existing) {
              const parts = player.name.split(' ');
              runSql(`
                INSERT INTO players (first_name, last_name, name, club, position, matches_played, source_season, api_id)
                VALUES (?, ?, ?, 'Paris FC', 'Milieu', 1, ?, ?)
              `, [
                parts.slice(0, -1).join(' ') || parts[0],
                parts[parts.length - 1],
                player.name,
                CURRENT_SEASON,
                parseInt(player.id, 10),
              ]);
            }
          }

          saveDb();
          await sleep(2000);
        }
      }
    } else {
      console.log('✅ Paris FC déjà présent\n');
    }

    // 2. Mettre à jour photos et positions pour tous les joueurs
    console.log('\n📷 Mise à jour photos et positions...\n');

    const players = queryAll('SELECT id, api_id, name, photo_url, position FROM players');
    console.log(`   ${players.length} joueurs à mettre à jour\n`);

    let updated = 0;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      process.stdout.write(`\r   [${i + 1}/${players.length}] ${player.name.substring(0, 25).padEnd(25)}`);

      await sleep(600);

      const details = await updatePlayerDetails(page, player.api_id);

      if (details) {
        runSql(`
          UPDATE players SET
            photo_url = ?,
            position = ?,
            nationality = ?,
            age = ?
          WHERE id = ?
        `, [
          details.photo || player.photo_url || '',
          details.position,
          details.nationality,
          details.age,
          player.id,
        ]);
        updated++;
      }

      if ((i + 1) % 30 === 0) saveDb();
    }

    saveDb();

    // Résumé
    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');

    const total = queryOne('SELECT COUNT(*) as c FROM players');
    const withPhoto = queryOne("SELECT COUNT(*) as c FROM players WHERE photo_url != '' AND photo_url IS NOT NULL");

    console.log(`Total joueurs: ${total?.c || 0}`);
    console.log(`Avec photo: ${withPhoto?.c || 0}`);
    console.log(`Mis à jour: ${updated}`);

    const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
    console.log('\nPar club:');
    byClub.forEach(r => console.log(`   ${r.club}: ${r.c}`));

    const byPos = queryAll('SELECT position, COUNT(*) as c FROM players GROUP BY position ORDER BY c DESC');
    console.log('\nPar position:');
    byPos.forEach(r => console.log(`   ${r.position}: ${r.c}`));

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Terminé');
}

main().catch(console.error);
