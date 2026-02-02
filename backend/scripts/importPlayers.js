/**
 * Script d'import des joueurs de Ligue 1 via API-Football
 *
 * Usage: node scripts/importPlayers.js
 *
 * Prerequis:
 * - Cle API-Football dans .env (API_FOOTBALL_KEY)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { initDb, runSql, saveDb } = require('../models/database');
const { L1_CLUBS, L1_LEAGUE_ID, API_SEASON, CURRENT_SEASON, POSITION_MAP } = require('../config/clubs');

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = 'v3.football.api-sports.io';

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`https://${API_HOST}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.response;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractFirstName(fullName) {
  const parts = fullName.split(' ');
  return parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
}

function extractLastName(fullName) {
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

async function importAllPlayers() {
  if (!API_KEY) {
    console.error('API_FOOTBALL_KEY manquante dans .env');
    process.exit(1);
  }

  await initDb();
  console.log('Base de donnees initialisee');

  let totalImported = 0;

  for (const club of L1_CLUBS) {
    console.log(`\nImport ${club.name}...`);

    try {
      const squads = await apiFetch('/players/squads', { team: club.api_id });
      if (!squads || squads.length === 0) {
        console.warn(`  Aucun joueur trouve pour ${club.name}`);
        continue;
      }

      const players = squads[0].players;
      console.log(`  ${players.length} joueurs trouves`);

      for (const player of players) {
        await sleep(500);
        const statsData = await apiFetch('/players', {
          id: player.id,
          league: L1_LEAGUE_ID,
          season: API_SEASON,
        });

        let stats = { games: {}, goals: {} };
        let lastMatchday = 0;
        let lastMatchDate = null;

        if (statsData && statsData.length > 0 && statsData[0].statistics.length > 0) {
          stats = statsData[0].statistics[0];

          // Récupérer la dernière journée jouée depuis les fixtures du joueur
          // L'API /players retourne le nombre de matchs joués, on peut estimer
          // Pour une meilleure précision, on utilise les fixtures
          const appearances = stats.games?.appearences || 0;
          if (appearances > 0) {
            // Estimation: dernière journée = nombre d'apparitions (approximatif)
            // Pour une précision exacte, il faudrait appeler /fixtures?player=id
            lastMatchday = appearances;
          }
        }

        const position = POSITION_MAP[player.position] || 'Milieu';
        const fullName = player.name || `${player.firstname} ${player.lastname}`;

        runSql(`
          INSERT INTO players (
            first_name, last_name, name, club, position, nationality,
            photo_url, age, number,
            matches_played, goals, assists, clean_sheets, saves,
            last_matchday_played, last_match_date,
            source_season, api_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          extractFirstName(fullName),
          extractLastName(fullName),
          fullName,
          club.name,
          position,
          player.nationality || '',
          player.photo || '',
          player.age || 0,
          player.number || 0,
          stats.games?.appearences || 0,
          stats.goals?.total || 0,
          stats.goals?.assists || 0,
          stats.games?.cleansheet || 0,
          stats.goals?.saves || 0,
          lastMatchday,
          lastMatchDate,
          CURRENT_SEASON,
          player.id,
        ]);

        totalImported++;
      }

      console.log(`  Import ${club.name} termine`);
      await sleep(1000);
    } catch (err) {
      console.error(`  Erreur import ${club.name}:`, err.message);
    }
  }

  saveDb();
  console.log(`\nImport termine: ${totalImported} joueurs importes`);
}

importAllPlayers().catch(console.error);
