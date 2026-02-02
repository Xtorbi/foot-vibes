/**
 * Import des joueurs de Ligue 1 via Transfermarkt (scraping)
 * Saison 2025-2026
 *
 * Usage: node scripts/importTransfermarkt.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');

const TRANSFERMARKT_BASE = 'https://www.transfermarkt.fr';
const SEASON_ID = '2025';
const CURRENT_SEASON = '2025-2026';

// Headers pour simuler un navigateur
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
};

// Mapping des 18 clubs L1 2025-2026 avec leurs IDs Transfermarkt
// Promus: Lorient, Paris FC, Metz | Relégués: Montpellier, Saint-Étienne, Reims
const L1_CLUBS_TM = [
  { name: 'Paris Saint-Germain', slug: 'paris-saint-germain', tmId: 583 },
  { name: 'Olympique de Marseille', slug: 'olympique-marseille', tmId: 244 },
  { name: 'Olympique Lyonnais', slug: 'olympique-lyon', tmId: 1041 },
  { name: 'AS Monaco', slug: 'as-monaco', tmId: 162 },
  { name: 'LOSC Lille', slug: 'losc-lille', tmId: 1082 },
  { name: 'OGC Nice', slug: 'ogc-nice', tmId: 417 },
  { name: 'RC Lens', slug: 'rc-lens', tmId: 826 },
  { name: 'Stade Rennais', slug: 'stade-rennais-fc', tmId: 273 },
  { name: 'Stade Brestois 29', slug: 'stade-brestois-29', tmId: 3911 },
  { name: 'RC Strasbourg Alsace', slug: 'rc-strasbourg-alsace', tmId: 667 },
  { name: 'Toulouse FC', slug: 'fc-toulouse', tmId: 415 },
  { name: 'FC Nantes', slug: 'fc-nantes', tmId: 995 },
  { name: 'Le Havre AC', slug: 'le-havre-ac', tmId: 738 },
  { name: 'AJ Auxerre', slug: 'aj-auxerre', tmId: 290 },
  { name: 'Angers SCO', slug: 'angers-sco', tmId: 1420 },
  { name: 'FC Lorient', slug: 'fc-lorient', tmId: 1158 },
  { name: 'Paris FC', slug: 'paris-fc', tmId: 1032 },
  { name: 'FC Metz', slug: 'fc-metz', tmId: 347 },
];

// Mapping des positions Transfermarkt vers nos positions
const POSITION_MAP = {
  'gardien de but': 'Gardien',
  'gardien': 'Gardien',
  'défenseur central': 'Defenseur',
  'arrière droit': 'Defenseur',
  'arrière gauche': 'Defenseur',
  'libéro': 'Defenseur',
  'milieu défensif': 'Milieu',
  'milieu central': 'Milieu',
  'milieu offensif': 'Milieu',
  'milieu droit': 'Milieu',
  'milieu gauche': 'Milieu',
  'ailier droit': 'Attaquant',
  'ailier gauche': 'Attaquant',
  'avant-centre': 'Attaquant',
  'attaquant': 'Attaquant',
  'deuxième attaquant': 'Attaquant',
};

function normalizePosition(pos) {
  if (!pos) return 'Milieu';
  const posLower = pos.toLowerCase().trim();
  for (const [key, value] of Object.entries(POSITION_MAP)) {
    if (posLower.includes(key)) {
      return value;
    }
  }
  // Fallback par mots-clés
  if (posLower.includes('gardien') || posLower.includes('goal')) return 'Gardien';
  if (posLower.includes('défen') || posLower.includes('arrière')) return 'Defenseur';
  if (posLower.includes('milieu')) return 'Milieu';
  if (posLower.includes('attaq') || posLower.includes('ailier') || posLower.includes('avant')) return 'Attaquant';
  return 'Milieu';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.text();
}

function extractFirstName(fullName) {
  const parts = fullName.trim().split(' ');
  return parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
}

function extractLastName(fullName) {
  const parts = fullName.trim().split(' ');
  return parts[parts.length - 1];
}

async function scrapeClubSquad(club) {
  const url = `${TRANSFERMARKT_BASE}/${club.slug}/kader/verein/${club.tmId}/saison_id/${SEASON_ID}`;
  console.log(`  Fetching squad: ${url}`);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const players = [];

  $('table.items tbody tr.odd, table.items tbody tr.even').each((i, row) => {
    const $row = $(row);

    // Nom du joueur
    const nameCell = $row.find('td.hauptlink a').first();
    const name = nameCell.text().trim();
    if (!name) return;

    // Photo
    const photoImg = $row.find('img.bilderrahmen-fixed').first();
    let photoUrl = photoImg.attr('data-src') || photoImg.attr('src') || '';
    // Agrandir les thumbnails
    photoUrl = photoUrl.replace('/small/', '/header/').replace('tiny.', 'header.');

    // Position
    const positionCell = $row.find('td.posrela table tr:last-child td').first();
    const positionRaw = positionCell.text().trim();
    const position = normalizePosition(positionRaw);

    // Numéro
    const numberCell = $row.find('div.rn_nummer').first();
    const number = parseInt(numberCell.text().trim()) || 0;

    // Age et nationalité
    let age = 0;
    let nationality = '';

    $row.find('td.zentriert').each((j, cell) => {
      const $cell = $(cell);
      const text = $cell.text().trim();

      // Age
      if (/^\d{2}$/.test(text)) {
        const num = parseInt(text);
        if (num >= 15 && num <= 45) {
          age = num;
        }
      }

      // Nationalité
      const flagImg = $cell.find('img.flaggenrahmen').first();
      if (flagImg.length > 0 && !nationality) {
        nationality = flagImg.attr('title') || '';
      }
    });

    players.push({
      name,
      firstName: extractFirstName(name),
      lastName: extractLastName(name),
      position,
      positionRaw,
      number,
      age,
      nationality,
      photoUrl,
    });
  });

  return players;
}

async function scrapeClubStats(club) {
  const url = `${TRANSFERMARKT_BASE}/${club.slug}/leistungsdaten/verein/${club.tmId}/plus/1?reldata=%26${SEASON_ID}`;
  console.log(`  Fetching stats: ${url}`);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const stats = {};

  $('table.items tbody tr').each((i, row) => {
    const $row = $(row);
    const name = $row.find('td.hauptlink a').first().text().trim();
    if (!name) return;

    const tds = [];
    $row.find('td.zentriert').each((j, td) => {
      tds.push($(td).text().trim());
    });

    // Structure: [0]=numéro, [1]=âge, [2]=nat, [3]=effectif, [4]=matchs, [5]=buts, [6]=assists, ...
    if (tds.length >= 7) {
      stats[name.toLowerCase()] = {
        matches: parseInt(tds[4]) || 0,
        goals: parseInt(tds[5]) || 0,
        assists: parseInt(tds[6]) || 0,
      };
    }
  });

  return stats;
}

async function importAllPlayers() {
  console.log('===========================================');
  console.log('  Import Transfermarkt - Ligue 1 2025-2026');
  console.log('===========================================\n');

  await initDb();
  console.log('Base de données initialisée\n');

  // Vider les anciens joueurs de cette saison (optionnel)
  const existingCount = queryAll(`SELECT COUNT(*) as count FROM players WHERE source_season = ?`, [CURRENT_SEASON]);
  if (existingCount[0]?.count > 0) {
    console.log(`Suppression de ${existingCount[0].count} joueurs existants de la saison ${CURRENT_SEASON}...`);
    runSql(`DELETE FROM players WHERE source_season = ?`, [CURRENT_SEASON]);
  }

  let totalImported = 0;
  let errors = [];

  for (const club of L1_CLUBS_TM) {
    console.log(`\n[${L1_CLUBS_TM.indexOf(club) + 1}/${L1_CLUBS_TM.length}] ${club.name}`);

    try {
      // Récupérer l'effectif
      const players = await scrapeClubSquad(club);
      console.log(`  ${players.length} joueurs trouvés`);

      await sleep(1500); // Pause entre les requêtes

      // Récupérer les stats
      const stats = await scrapeClubStats(club);
      console.log(`  ${Object.keys(stats).length} stats récupérées`);

      // Insérer les joueurs
      for (const player of players) {
        const playerStats = stats[player.name.toLowerCase()] || { matches: 0, goals: 0, assists: 0 };

        runSql(`
          INSERT INTO players (
            first_name, last_name, name, club, position, nationality,
            photo_url, age, number,
            matches_played, goals, assists,
            source_season
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          player.firstName,
          player.lastName,
          player.name,
          club.name,
          player.position,
          player.nationality,
          player.photoUrl,
          player.age,
          player.number,
          playerStats.matches,
          playerStats.goals,
          playerStats.assists,
          CURRENT_SEASON,
        ]);

        totalImported++;
      }

      console.log(`  ✓ ${players.length} joueurs importés`);

      // Pause plus longue entre les clubs
      await sleep(2000);

    } catch (err) {
      console.error(`  ✗ Erreur: ${err.message}`);
      errors.push({ club: club.name, error: err.message });
    }
  }

  saveDb();

  console.log('\n===========================================');
  console.log('  IMPORT TERMINÉ');
  console.log('===========================================');
  console.log(`Total joueurs importés: ${totalImported}`);

  if (errors.length > 0) {
    console.log(`\nErreurs (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e.club}: ${e.error}`));
  }

  // Résumé par club
  console.log('\nRépartition par club:');
  const clubCounts = queryAll(`
    SELECT club, COUNT(*) as count
    FROM players
    WHERE source_season = ?
    GROUP BY club
    ORDER BY count DESC
  `, [CURRENT_SEASON]);

  clubCounts.forEach(row => {
    console.log(`  ${row.club}: ${row.count} joueurs`);
  });
}

importAllPlayers().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
