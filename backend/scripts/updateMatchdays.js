/**
 * Script de mise à jour des journées de Ligue 1 via scraping L'Équipe
 *
 * Met à jour:
 * - La journée actuelle dans league_status
 * - Le last_matchday_played des joueurs ayant joué
 *
 * Usage: node scripts/updateMatchdays.js [--day=N]
 *
 * Options:
 *   --day=N    Forcer une journée spécifique (sinon détecte automatiquement)
 *
 * Exécuter après chaque journée de Ligue 1
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { initDb, runSql, queryOne, queryAll, saveDb } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

const BASE_URL = 'https://www.lequipe.fr';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

/**
 * Trouve la dernière journée avec des matchs terminés
 */
async function findLastPlayedMatchday() {
  // Utiliser la journée en base comme point de départ (optimisation)
  const statusRow = queryOne('SELECT current_matchday FROM league_status WHERE id = 1');
  const knownMatchday = statusRow ? statusRow.current_matchday : 0;

  // Chercher à partir de knownMatchday + 3 (pour trouver les nouvelles journées)
  const startFrom = Math.min(knownMatchday + 3, 34);

  console.log(`   Recherche à partir de J${startFrom} (dernière connue: J${knownMatchday})...`);

  // Tester les journées de startFrom vers le bas
  for (let num = startFrom; num >= Math.max(1, knownMatchday - 1); num--) {
    await sleep(300);
    const suffix = num === 1 ? '1re-journee' : `${num}e-journee`;
    const journeeHtml = await fetchPage(`${BASE_URL}/Football/ligue-1/page-calendrier-resultats/${suffix}`);

    // Compter les matchs terminés (URLs contenant -live/)
    const liveMatches = journeeHtml.match(/href="\/Football\/match-direct\/ligue-1\/[^"]*-live\/\d+"/g) || [];

    if (liveMatches.length >= 9) {
      // Journée complète (9 matchs en L1)
      console.log(`   J${num}: ${liveMatches.length} matchs terminés ✓`);
      return num;
    } else if (liveMatches.length > 0) {
      console.log(`   J${num}: ${liveMatches.length}/9 matchs terminés (partiel)`);
    } else {
      console.log(`   J${num}: à venir`);
    }
  }

  // Fallback: retourner la dernière connue
  if (knownMatchday > 0) {
    console.log(`   Fallback: J${knownMatchday}`);
    return knownMatchday;
  }

  throw new Error('Impossible de trouver une journée avec des matchs terminés');
}

/**
 * Récupère les URLs des matchs terminés pour une journée
 */
async function getMatchUrls(matchday) {
  const suffix = matchday === 1 ? '1re-journee' : `${matchday}e-journee`;
  const html = await fetchPage(`${BASE_URL}/Football/ligue-1/page-calendrier-resultats/${suffix}`);

  // Extraire les URLs de matchs terminés (contiennent -live)
  const matches = html.match(/href="(\/Football\/match-direct\/ligue-1\/[^"]*-live\/\d+)"/g) || [];
  const urls = matches.map(m => m.match(/href="([^"]+)"/)[1]);

  return [...new Set(urls)];
}

/**
 * Extrait les joueurs d'une page de match
 */
async function extractPlayersFromMatch(matchUrl) {
  const html = await fetchPage(`${BASE_URL}${matchUrl}`);

  // Décoder les HTML entities
  const decoded = html.replace(/&quot;/g, '"').replace(/&amp;/g, '&');

  // Extraire les noms complets des joueurs
  const pattern = /"nom_complet":"([^"]+)"/g;
  const players = new Set();
  let match;

  while ((match = pattern.exec(decoded)) !== null) {
    const name = match[1].trim();
    // Filtrer les non-joueurs (arbitres, entraîneurs connus, etc.)
    if (name.length > 3 &&
        !name.includes('Vernice') &&
        !name.includes('Turpin') &&
        !name.includes('Bastien') &&
        !name.includes('Letexier') &&
        !isCoach(name)) {
      players.add(name);
    }
  }

  // Extraire aussi la date du match
  const dateMatch = decoded.match(/"date_match":"(\d{4}-\d{2}-\d{2})/);
  const matchDate = dateMatch ? dateMatch[1] : null;

  return { players: [...players], matchDate };
}

/**
 * Liste des entraîneurs connus à filtrer
 */
function isCoach(name) {
  const coaches = [
    'Luis Enrique', 'Roberto De Zerbi', 'Pierre Sage', 'Adi Hütter',
    'Bruno Génésio', 'Franck Haise', 'Julien Stéphan', 'Olivier Dall\'Oglio',
    'Christophe Pelissier', 'Didier Digard', 'Patrick Vieira', 'Antoine Kombouaré',
    'Luka Elsner', 'Eric Roy', 'Carles Martinez', 'Will Still', 'Habib Beye'
  ];
  return coaches.some(coach => name.includes(coach));
}

/**
 * Met à jour league_status
 */
function updateLeagueStatus(matchday) {
  const existing = queryOne('SELECT id FROM league_status WHERE id = 1');

  if (existing) {
    runSql(`
      UPDATE league_status
      SET current_matchday = ?, season = ?, last_updated = datetime('now')
      WHERE id = 1
    `, [matchday, CURRENT_SEASON]);
  } else {
    runSql(`
      INSERT INTO league_status (id, current_matchday, season)
      VALUES (1, ?, ?)
    `, [matchday, CURRENT_SEASON]);
  }
}

/**
 * Met à jour last_matchday_played pour les joueurs par nom
 */
function updatePlayersByName(playerNames, matchday, matchDate) {
  if (playerNames.length === 0) return { updated: 0, notFound: [] };

  let updated = 0;
  const notFound = [];

  for (const fullName of playerNames) {
    // Essayer plusieurs variantes de recherche
    const nameParts = fullName.split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, -1).join(' ');

    // Chercher par nom complet exact
    let player = queryOne(`
      SELECT id, name FROM players
      WHERE name = ? AND source_season = ? AND archived = 0
    `, [fullName, CURRENT_SEASON]);

    // Si pas trouvé, chercher par nom de famille
    if (!player) {
      player = queryOne(`
        SELECT id, name FROM players
        WHERE last_name = ? AND source_season = ? AND archived = 0
      `, [lastName, CURRENT_SEASON]);
    }

    // Si pas trouvé, recherche floue
    if (!player) {
      player = queryOne(`
        SELECT id, name FROM players
        WHERE name LIKE ? AND source_season = ? AND archived = 0
      `, [`%${lastName}%`, CURRENT_SEASON]);
    }

    if (player) {
      runSql(`
        UPDATE players
        SET last_matchday_played = ?, last_match_date = ?, updated_at = datetime('now')
        WHERE id = ? AND (last_matchday_played < ? OR last_matchday_played IS NULL)
      `, [matchday, matchDate, player.id, matchday]);
      updated++;
    } else {
      notFound.push(fullName);
    }
  }

  return { updated, notFound };
}

async function main() {
  // Parser les arguments
  const args = process.argv.slice(2);
  let forcedMatchday = null;

  for (const arg of args) {
    const dayMatch = arg.match(/--day=(\d+)/);
    if (dayMatch) {
      forcedMatchday = parseInt(dayMatch[1]);
    }
  }

  await initDb();
  console.log('Base de données initialisée\n');

  try {
    // 1. Trouver ou utiliser la journée spécifiée
    let matchday;
    if (forcedMatchday) {
      matchday = forcedMatchday;
      console.log(`1. Journée forcée: ${matchday}\n`);
    } else {
      console.log('1. Recherche de la dernière journée jouée...');
      matchday = await findLastPlayedMatchday();
      console.log(`   Journée trouvée: ${matchday}\n`);
    }

    // 2. Mettre à jour league_status
    console.log('2. Mise à jour league_status...');
    updateLeagueStatus(matchday);
    console.log('   OK\n');

    // 3. Récupérer les URLs des matchs
    console.log('3. Récupération des matchs de la journée...');
    await sleep(1000);
    const matchUrls = await getMatchUrls(matchday);
    console.log(`   ${matchUrls.length} matchs trouvés\n`);

    if (matchUrls.length === 0) {
      console.log('   Aucun match terminé trouvé pour cette journée.');
      return;
    }

    // 4. Extraire les joueurs de chaque match
    console.log('4. Extraction des joueurs...');
    const allPlayers = new Set();
    let matchDate = null;

    for (const url of matchUrls) {
      await sleep(1500); // Respecter le serveur
      try {
        const { players, matchDate: date } = await extractPlayersFromMatch(url);
        players.forEach(p => allPlayers.add(p));
        if (date && !matchDate) matchDate = date;
        console.log(`   ${url.split('/').pop()}: ${players.length} joueurs`);
      } catch (err) {
        console.error(`   Erreur pour ${url}: ${err.message}`);
      }
    }

    console.log(`\n   Total: ${allPlayers.size} joueurs uniques\n`);

    // 5. Mettre à jour les joueurs
    console.log('5. Mise à jour des joueurs dans la base...');
    const { updated, notFound } = updatePlayersByName(
      [...allPlayers],
      matchday,
      matchDate || new Date().toISOString().split('T')[0]
    );

    console.log(`   ${updated} joueurs mis à jour`);
    if (notFound.length > 0) {
      console.log(`   ${notFound.length} joueurs non trouvés dans la base:`);
      notFound.slice(0, 10).forEach(n => console.log(`     - ${n}`));
      if (notFound.length > 10) {
        console.log(`     ... et ${notFound.length - 10} autres`);
      }
    }

    // 6. Statistiques finales
    console.log('\n6. Statistiques finales:');
    const stats = queryOne(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN last_matchday_played = ? THEN 1 ELSE 0 END) as current_matchday,
        SUM(CASE WHEN last_matchday_played = ? - 1 THEN 1 ELSE 0 END) as previous_matchday
      FROM players WHERE source_season = ? AND archived = 0
    `, [matchday, matchday, CURRENT_SEASON]);

    if (stats) {
      console.log(`   Total joueurs actifs: ${stats.total}`);
      console.log(`   Joueurs J${matchday} (current): ${stats.current_matchday}`);
      console.log(`   Joueurs J${matchday - 1} (J-1): ${stats.previous_matchday}`);
    }

    saveDb();
    console.log('\nMise à jour terminée avec succès!');

  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

main();
