/**
 * Script pour récupérer les photos manquantes depuis FotMob
 * Fallback pour les joueurs avec default.jpg de Transfermarkt
 *
 * Usage: node scripts/fixMissingPhotos.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { initDb, runSql, saveDb, queryAll } = require('../models/database');

const CURRENT_SEASON = '2025-2026';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Recherche un joueur sur FotMob
 */
async function searchFotMob(playerName) {
  const url = `https://www.fotmob.com/api/search/suggest?term=${encodeURIComponent(playerName)}&lang=fr`;

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;

    const data = await res.json();

    // Chercher dans les suggestions
    for (const group of data) {
      for (const suggestion of group.suggestions || []) {
        if (suggestion.type === 'player') {
          return {
            id: suggestion.id,
            name: suggestion.name,
            teamName: suggestion.teamName,
          };
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`  Erreur recherche FotMob: ${err.message}`);
    return null;
  }
}

/**
 * Vérifie si une photo existe sur FotMob
 */
async function checkFotMobPhoto(playerId) {
  const url = `https://images.fotmob.com/image_resources/playerimages/${playerId}.png`;

  try {
    const res = await fetch(url, { method: 'HEAD', headers: HEADERS });
    return res.ok ? url : null;
  } catch (err) {
    return null;
  }
}

/**
 * Normalise un nom pour la comparaison
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Vérifie si deux noms correspondent (fuzzy match)
 */
function namesMatch(name1, name2) {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  // Match exact
  if (n1 === n2) return true;

  // Un nom contient l'autre
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Match sur le nom de famille (dernier mot)
  const lastName1 = n1.split(' ').pop();
  const lastName2 = n2.split(' ').pop();
  if (lastName1 === lastName2 && lastName1.length > 3) return true;

  return false;
}

async function fixMissingPhotos() {
  console.log('===========================================');
  console.log('  Fix Photos Manquantes via FotMob');
  console.log('===========================================\n');

  await initDb();

  // Trouver les joueurs avec photo manquante ou default
  const playersToFix = queryAll(`
    SELECT id, name, club, photo_url
    FROM players
    WHERE source_season = ?
      AND (photo_url IS NULL
           OR photo_url = ''
           OR photo_url LIKE '%default.jpg%'
           OR photo_url LIKE '%placeholder%')
    ORDER BY club, name
  `, [CURRENT_SEASON]);

  console.log(`${playersToFix.length} joueurs sans photo trouvés\n`);

  if (playersToFix.length === 0) {
    console.log('Aucun joueur à corriger !');
    return;
  }

  let fixed = 0;
  let notFound = 0;
  let errors = [];

  for (let i = 0; i < playersToFix.length; i++) {
    const player = playersToFix[i];
    console.log(`[${i + 1}/${playersToFix.length}] ${player.name} (${player.club})`);

    // Recherche sur FotMob
    const fotmobPlayer = await searchFotMob(player.name);

    if (!fotmobPlayer) {
      console.log(`  ✗ Non trouvé sur FotMob`);
      notFound++;
      await sleep(500);
      continue;
    }

    // Vérifier que c'est le bon joueur (fuzzy match sur le nom)
    if (!namesMatch(player.name, fotmobPlayer.name)) {
      console.log(`  ✗ Nom ne correspond pas: "${fotmobPlayer.name}"`);
      notFound++;
      await sleep(500);
      continue;
    }

    // Vérifier si la photo existe
    const photoUrl = await checkFotMobPhoto(fotmobPlayer.id);

    if (!photoUrl) {
      console.log(`  ✗ Pas de photo sur FotMob (ID: ${fotmobPlayer.id})`);
      notFound++;
      await sleep(500);
      continue;
    }

    // Mettre à jour la BDD
    try {
      runSql(
        `UPDATE players SET photo_url = ? WHERE id = ?`,
        [photoUrl, player.id]
      );
      console.log(`  ✓ Photo mise à jour: ${photoUrl}`);
      fixed++;
    } catch (err) {
      console.log(`  ✗ Erreur BDD: ${err.message}`);
      errors.push({ player: player.name, error: err.message });
    }

    // Pause pour éviter le rate limiting
    await sleep(800);
  }

  saveDb();

  console.log('\n===========================================');
  console.log('  RÉSULTAT');
  console.log('===========================================');
  console.log(`Photos corrigées: ${fixed}`);
  console.log(`Non trouvés: ${notFound}`);
  console.log(`Erreurs: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErreurs:');
    errors.forEach(e => console.log(`  - ${e.player}: ${e.error}`));
  }

  // Liste des joueurs toujours sans photo
  const stillMissing = queryAll(`
    SELECT name, club
    FROM players
    WHERE source_season = ?
      AND (photo_url IS NULL
           OR photo_url = ''
           OR photo_url LIKE '%default.jpg%'
           OR photo_url LIKE '%placeholder%')
    ORDER BY club, name
  `, [CURRENT_SEASON]);

  if (stillMissing.length > 0) {
    console.log(`\nJoueurs toujours sans photo (${stillMissing.length}):`);
    stillMissing.forEach(p => console.log(`  - ${p.name} (${p.club})`));
  }
}

fixMissingPhotos().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
