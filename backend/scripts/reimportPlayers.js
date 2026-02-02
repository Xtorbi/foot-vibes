/**
 * Script de réimport complet des joueurs de Ligue 1
 * Vide la table et réimporte tous les joueurs avec stats
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { initDb, runSql, saveDb, queryOne } = require('../models/database');
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

  // Afficher les infos de quota
  const remaining = res.headers.get('x-ratelimit-requests-remaining');
  if (remaining) {
    console.log(`   [API] Requêtes restantes: ${remaining}`);
  }

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

async function reimportAllPlayers() {
  if (!API_KEY) {
    console.error('❌ API_FOOTBALL_KEY manquante dans .env');
    process.exit(1);
  }

  console.log('🚀 Début du réimport complet');
  console.log('   Saison:', CURRENT_SEASON);
  console.log('   API Season:', API_SEASON);
  console.log('   Clubs:', L1_CLUBS.length);
  console.log('');

  await initDb();

  // Vider les tables
  console.log('🗑️  Vidage de la base de données...');
  runSql('DELETE FROM votes');
  runSql('DELETE FROM players');
  runSql('DELETE FROM sqlite_sequence WHERE name="players"');
  runSql('DELETE FROM sqlite_sequence WHERE name="votes"');
  saveDb();
  console.log('   Tables vidées');
  console.log('');

  let totalImported = 0;
  let totalWithStats = 0;
  const errors = [];

  for (let i = 0; i < L1_CLUBS.length; i++) {
    const club = L1_CLUBS[i];
    console.log(`📦 [${i + 1}/${L1_CLUBS.length}] ${club.name}...`);

    try {
      // Récupérer l'effectif
      const squads = await apiFetch('/players/squads', { team: club.api_id });

      if (!squads || squads.length === 0) {
        console.warn(`   ⚠️  Aucun joueur trouvé`);
        errors.push({ club: club.name, error: 'Aucun joueur trouvé' });
        continue;
      }

      const players = squads[0].players;
      console.log(`   ${players.length} joueurs dans l'effectif`);

      let clubImported = 0;
      let clubWithStats = 0;

      for (let j = 0; j < players.length; j++) {
        const player = players[j];

        // Rate limiting - attendre entre chaque requête
        await sleep(350);

        try {
          // Récupérer les stats du joueur
          const statsData = await apiFetch('/players', {
            id: player.id,
            league: L1_LEAGUE_ID,
            season: API_SEASON,
          });

          let stats = { games: {}, goals: {} };
          let nationality = player.nationality || '';
          let age = player.age || 0;

          if (statsData && statsData.length > 0) {
            const playerInfo = statsData[0].player;
            nationality = playerInfo.nationality || nationality;
            age = playerInfo.age || age;

            if (statsData[0].statistics && statsData[0].statistics.length > 0) {
              stats = statsData[0].statistics[0];
            }
          }

          const position = POSITION_MAP[player.position] || 'Milieu';
          const fullName = player.name || `${player.firstname || ''} ${player.lastname || ''}`.trim();

          const matchesPlayed = stats.games?.appearences || 0;
          const goals = stats.goals?.total || 0;
          const assists = stats.goals?.assists || 0;

          runSql(`
            INSERT INTO players (
              first_name, last_name, name, club, position, nationality,
              photo_url, age, number,
              matches_played, goals, assists, clean_sheets, saves,
              last_matchday_played, source_season, api_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            extractFirstName(fullName),
            extractLastName(fullName),
            fullName,
            club.name,
            position,
            nationality,
            player.photo || '',
            age,
            player.number || 0,
            matchesPlayed,
            goals,
            assists,
            stats.games?.cleansheet || 0,
            stats.goals?.saves || 0,
            matchesPlayed, // Approximation pour last_matchday
            CURRENT_SEASON,
            player.id,
          ]);

          clubImported++;
          totalImported++;

          if (matchesPlayed > 0) {
            clubWithStats++;
            totalWithStats++;
          }

          // Afficher progression tous les 5 joueurs
          if ((j + 1) % 5 === 0 || j === players.length - 1) {
            process.stdout.write(`\r   Progression: ${j + 1}/${players.length} joueurs`);
          }

        } catch (playerErr) {
          console.error(`\n   ❌ Erreur joueur ${player.name}: ${playerErr.message}`);
        }
      }

      console.log(`\n   ✅ ${clubImported} importés, ${clubWithStats} avec stats`);
      saveDb();

      // Pause entre les clubs
      await sleep(1000);

    } catch (err) {
      console.error(`   ❌ Erreur: ${err.message}`);
      errors.push({ club: club.name, error: err.message });
    }
  }

  saveDb();

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ DE L\'IMPORT');
  console.log('═══════════════════════════════════════');
  console.log(`Total joueurs importés: ${totalImported}`);
  console.log(`Joueurs avec stats (matchs > 0): ${totalWithStats}`);

  if (errors.length > 0) {
    console.log('');
    console.log('⚠️  Erreurs rencontrées:');
    errors.forEach(e => console.log(`   - ${e.club}: ${e.error}`));
  }

  console.log('');
  console.log('✅ Import terminé !');
}

reimportAllPlayers().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
