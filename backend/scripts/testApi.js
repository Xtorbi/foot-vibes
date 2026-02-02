/**
 * Test de l'API pour diagnostiquer le problème de stats
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = 'v3.football.api-sports.io';

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`https://${API_HOST}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  console.log('URL:', url.toString());

  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  const data = await res.json();
  return data;
}

async function test() {
  console.log('=== TEST API-FOOTBALL ===\n');

  // 1. Tester les saisons disponibles pour la Ligue 1
  console.log('1. Saisons disponibles pour la Ligue 1 (ID 61):');
  const seasons = await apiFetch('/leagues', { id: 61 });
  if (seasons.response && seasons.response[0]) {
    const availableSeasons = seasons.response[0].seasons.slice(-5);
    console.log('   Dernières saisons:', availableSeasons.map(s => s.year).join(', '));
    const current = availableSeasons.find(s => s.current);
    console.log('   Saison courante:', current ? current.year : 'non trouvée');
  }

  // 2. Tester avec un joueur connu (Mbappé - mais il est parti, essayons Barcola)
  console.log('\n2. Test stats joueur (Bradley Barcola, ID probable):');

  // D'abord chercher Barcola
  const searchBarcola = await apiFetch('/players', {
    search: 'Barcola',
    league: 61,
    season: 2024
  });
  console.log('   Recherche Barcola (saison 2024):');
  if (searchBarcola.response && searchBarcola.response.length > 0) {
    const barcola = searchBarcola.response[0];
    console.log('   Trouvé:', barcola.player.name, '- ID:', barcola.player.id);
    console.log('   Stats 2024:', JSON.stringify(barcola.statistics[0]?.games || {}, null, 2));
  } else {
    console.log('   Non trouvé pour 2024');
  }

  // Essayer avec 2025
  console.log('\n3. Test avec saison 2025:');
  const search2025 = await apiFetch('/players', {
    search: 'Barcola',
    league: 61,
    season: 2025
  });
  if (search2025.response && search2025.response.length > 0) {
    const barcola = search2025.response[0];
    console.log('   Trouvé:', barcola.player.name);
    console.log('   Stats 2025:', JSON.stringify(barcola.statistics[0]?.games || {}, null, 2));
  } else {
    console.log('   Non trouvé pour 2025');
    console.log('   Erreurs:', search2025.errors);
  }

  // 4. Tester l'effectif PSG
  console.log('\n4. Effectif PSG (ID 85):');
  const psgSquad = await apiFetch('/players/squads', { team: 85 });
  if (psgSquad.response && psgSquad.response[0]) {
    const players = psgSquad.response[0].players.slice(0, 3);
    console.log('   3 premiers joueurs:');
    players.forEach(p => console.log(`   - ${p.name} (${p.position}), ID: ${p.id}`));

    // Tester stats du premier joueur
    const firstId = players[0].id;
    console.log(`\n5. Stats du joueur ID ${firstId} pour différentes saisons:`);

    for (const season of [2023, 2024, 2025]) {
      const stats = await apiFetch('/players', { id: firstId, league: 61, season });
      if (stats.response && stats.response.length > 0 && stats.response[0].statistics.length > 0) {
        const s = stats.response[0].statistics[0];
        console.log(`   Saison ${season}: ${s.games?.appearences || 0} matchs, ${s.goals?.total || 0} buts`);
      } else {
        console.log(`   Saison ${season}: Pas de données`);
      }
    }
  }

  console.log('\n=== FIN DU TEST ===');
}

test().catch(console.error);
