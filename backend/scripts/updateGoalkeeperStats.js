/**
 * Mise à jour des stats de gardiens depuis SofaScore API
 * Récupère clean sheets et saves
 *
 * Usage: node scripts/updateGoalkeeperStats.js
 */

const { initDb, runSql, saveDb, queryAll } = require('../models/database');

// SofaScore API - Ligue 1 saison 2025-2026
const SOFASCORE_API = 'https://api.sofascore.com/api/v1/unique-tournament/34/season/77356/statistics';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// Normaliser les noms pour le matching
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer accents
    .replace(/[^a-z\s]/g, '')
    .trim();
}

async function fetchGoalkeeperStats() {
  const url = `${SOFASCORE_API}?limit=50&order=-saves&accumulation=total&group=goalkeepers&fields=cleanSheet,saves,goalsConceded,appearances`;
  console.log(`Fetching: ${url}\n`);

  const data = await fetchJSON(url);
  const stats = [];

  if (data.results) {
    for (const item of data.results) {
      const player = item.player;
      const team = item.team;

      // Stats sont au niveau racine de l'item, pas dans item.statistics
      if (player && item.saves > 0) {
        stats.push({
          name: player.name,
          club: team?.name || '',
          matches: item.appearances || 0,
          cleanSheets: item.cleanSheet || 0,
          saves: item.saves || 0,
          goalsConceded: item.goalsConceded || 0,
        });
      }
    }
  }

  return stats;
}

async function updateDatabase(gkStats) {
  // Récupérer tous les gardiens de la BDD
  const dbGoalkeepers = queryAll(`
    SELECT id, name, club, matches_played, clean_sheets, saves
    FROM players
    WHERE position = 'Gardien' AND source_season = '2025-2026'
  `);

  console.log(`${dbGoalkeepers.length} gardiens en BDD`);
  console.log(`${gkStats.length} gardiens scrapés depuis FBref\n`);

  let updated = 0;
  let notFound = [];

  for (const gk of gkStats) {
    const normalizedScraped = normalizeName(gk.name);
    const scrapedLastName = gk.name.split(' ').pop().toLowerCase();

    // Chercher le match dans la BDD
    let match = dbGoalkeepers.find(dbGk => {
      const normalizedDb = normalizeName(dbGk.name);
      const dbLastName = dbGk.name.split(' ').pop().toLowerCase();

      return normalizedDb === normalizedScraped ||
             normalizedDb.includes(normalizedScraped) ||
             normalizedScraped.includes(normalizedDb) ||
             dbLastName === scrapedLastName;
    });

    if (match) {
      runSql(`
        UPDATE players
        SET clean_sheets = ?, saves = ?, matches_played = ?
        WHERE id = ?
      `, [gk.cleanSheets, gk.saves, gk.matches, match.id]);

      console.log(`✓ ${match.name}: ${gk.cleanSheets} CS, ${gk.saves} saves, ${gk.matches} matchs`);
      updated++;
    } else {
      notFound.push(`${gk.name} (${gk.club})`);
    }
  }

  saveDb();

  console.log(`\n${updated} gardiens mis à jour`);
  if (notFound.length > 0) {
    console.log(`\nNon trouvés dans BDD (${notFound.length}):`);
    notFound.slice(0, 10).forEach(n => console.log(`  - ${n}`));
    if (notFound.length > 10) console.log(`  ... et ${notFound.length - 10} autres`);
  }
}

async function main() {
  console.log('===========================================');
  console.log('  Mise à jour stats gardiens - SofaScore');
  console.log('===========================================\n');

  await initDb();

  try {
    const gkStats = await fetchGoalkeeperStats();

    if (gkStats.length === 0) {
      console.log('Aucune stat récupérée. Vérifier la structure de la réponse SofaScore.');
      return;
    }

    console.log(`Stats récupérées pour ${gkStats.length} gardiens:\n`);
    gkStats.slice(0, 10).forEach(gk => {
      console.log(`  ${gk.name} (${gk.club}): ${gk.matches}M, ${gk.cleanSheets}CS, ${gk.saves}S`);
    });
    if (gkStats.length > 10) console.log(`  ... et ${gkStats.length - 10} autres\n`);

    console.log('\n--- Mise à jour BDD ---\n');
    await updateDatabase(gkStats);

  } catch (err) {
    console.error('Erreur:', err.message);
    console.error(err.stack);
  }

  console.log('\n===========================================');
  console.log('  TERMINÉ');
  console.log('===========================================');
}

main().catch(console.error);
