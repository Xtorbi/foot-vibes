const { initDb, queryAll, runSql, saveDb } = require('../models/database');

const L1_CLUBS = [
  'Paris Saint-Germain',
  'Olympique de Marseille',
  'Olympique Lyonnais',
  'AS Monaco',
  'LOSC Lille',
  'OGC Nice',
  'RC Lens',
  'Stade Rennais',
  'Stade Brestois 29',
  'RC Strasbourg Alsace',
  'Toulouse FC',
  'FC Nantes',
  'Le Havre AC',
  'AJ Auxerre',
  'Angers SCO',
  'AS Saint-Étienne',
  'Stade de Reims',
  'Montpellier HSC',
];

async function clean() {
  await initDb();

  // Vérifier s'il y a des joueurs hors L1
  const allClubs = queryAll(`SELECT DISTINCT club FROM players`);
  const nonL1Clubs = allClubs.filter(c => !L1_CLUBS.includes(c.club));

  if (nonL1Clubs.length > 0) {
    console.log('Clubs hors L1 trouvés:');
    nonL1Clubs.forEach(c => console.log(`  - ${c.club}`));

    // Supprimer les joueurs hors L1
    const placeholders = L1_CLUBS.map(() => '?').join(',');
    runSql(`DELETE FROM players WHERE club NOT IN (${placeholders})`, L1_CLUBS);
    console.log('\nJoueurs hors L1 supprimés.');
  } else {
    console.log('Aucun club hors L1 trouvé.');
  }

  // Vérifier s'il y a des anciennes saisons
  const seasons = queryAll(`SELECT DISTINCT source_season, COUNT(*) as count FROM players GROUP BY source_season`);
  console.log('\nSaisons en base:');
  seasons.forEach(s => console.log(`  - ${s.source_season}: ${s.count} joueurs`));

  // Garder uniquement 2025-2026
  const oldSeasons = seasons.filter(s => s.source_season !== '2025-2026');
  if (oldSeasons.length > 0) {
    runSql(`DELETE FROM players WHERE source_season != '2025-2026'`);
    console.log('\nAnciennes saisons supprimées.');
  }

  saveDb();

  // Résumé final
  const finalCount = queryAll(`SELECT COUNT(*) as count FROM players`);
  const finalClubs = queryAll(`SELECT COUNT(DISTINCT club) as count FROM players`);
  console.log(`\nRésultat final: ${finalCount[0].count} joueurs, ${finalClubs[0].count} clubs L1`);
}

clean().catch(console.error);
