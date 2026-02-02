const { initDb, queryAll } = require('../models/database');

async function check() {
  await initDb();

  const clubs = queryAll(`
    SELECT club, COUNT(*) as count
    FROM players
    WHERE source_season = '2025-2026'
    GROUP BY club
    ORDER BY club
  `);

  console.log('Clubs dans la base de données:\n');
  clubs.forEach(c => console.log(`  - ${c.club}: ${c.count} joueurs`));
  console.log(`\nTotal: ${clubs.length} clubs`);
}

check().catch(console.error);
