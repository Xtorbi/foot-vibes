const { initDb, queryAll } = require('../models/database');

async function verify() {
  await initDb();

  console.log('=== Vérification des données ===\n');

  // Quelques joueurs connus
  const stars = ['Dembélé', 'Barcola', 'Greenwood', 'Lacazette', 'Embolo'];

  for (const name of stars) {
    const players = queryAll(`
      SELECT name, club, position, matches_played, goals, assists, photo_url
      FROM players
      WHERE name LIKE ?
    `, [`%${name}%`]);

    if (players.length > 0) {
      const p = players[0];
      console.log(`${p.name} (${p.club})`);
      console.log(`  Position: ${p.position}`);
      console.log(`  Stats: ${p.matches_played} matchs, ${p.goals} buts, ${p.assists} passes D`);
      console.log(`  Photo: ${p.photo_url ? 'OK' : 'MANQUANTE'}`);
      console.log('');
    }
  }

  // Stats globales
  const total = queryAll(`SELECT COUNT(*) as count FROM players WHERE source_season = '2025-2026'`);
  const withPhoto = queryAll(`SELECT COUNT(*) as count FROM players WHERE source_season = '2025-2026' AND photo_url != ''`);
  const withGoals = queryAll(`SELECT COUNT(*) as count FROM players WHERE source_season = '2025-2026' AND goals > 0`);

  console.log('=== Stats globales ===');
  console.log(`Total joueurs: ${total[0].count}`);
  console.log(`Avec photo: ${withPhoto[0].count}`);
  console.log(`Avec buts: ${withGoals[0].count}`);

  // Top buteurs
  console.log('\n=== Top 10 buteurs ===');
  const topScorers = queryAll(`
    SELECT name, club, goals, assists
    FROM players
    WHERE source_season = '2025-2026'
    ORDER BY goals DESC
    LIMIT 10
  `);

  topScorers.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.club}): ${p.goals} buts, ${p.assists} passes`);
  });
}

verify().catch(console.error);
