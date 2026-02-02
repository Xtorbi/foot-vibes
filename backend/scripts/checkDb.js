const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function check() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '../../database/ligue1.db');

  if (!fs.existsSync(dbPath)) {
    console.log('Base de données non trouvée:', dbPath);
    return;
  }

  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // Total joueurs
  const total = db.exec('SELECT COUNT(*) as count FROM players');
  console.log('=== STATISTIQUES BASE DE DONNEES ===');
  console.log('');
  console.log('Total joueurs:', total[0]?.values[0][0] || 0);

  // Par club
  console.log('');
  console.log('--- Joueurs par club ---');
  const byClub = db.exec('SELECT club, COUNT(*) as count FROM players GROUP BY club ORDER BY count DESC');
  if (byClub[0]) {
    byClub[0].values.forEach(row => console.log(row[0] + ': ' + row[1]));
  }

  // Par position
  console.log('');
  console.log('--- Joueurs par position ---');
  const byPos = db.exec('SELECT position, COUNT(*) as count FROM players GROUP BY position ORDER BY count DESC');
  if (byPos[0]) {
    byPos[0].values.forEach(row => console.log(row[0] + ': ' + row[1]));
  }

  // Avec matchs joués
  console.log('');
  console.log('--- Activite ---');
  const withMatches = db.exec('SELECT COUNT(*) FROM players WHERE matches_played > 0');
  console.log('Joueurs avec au moins 1 match:', withMatches[0]?.values[0][0] || 0);

  // Top 5 joueurs (par buts)
  console.log('');
  console.log('--- Top 5 buteurs ---');
  const top = db.exec('SELECT name, club, goals, matches_played FROM players WHERE goals > 0 ORDER BY goals DESC LIMIT 5');
  if (top[0]) {
    top[0].values.forEach(row => console.log(row[0] + ' (' + row[1] + '): ' + row[2] + ' buts en ' + row[3] + ' matchs'));
  }

  // Votes
  console.log('');
  console.log('--- Votes ---');
  const votes = db.exec('SELECT SUM(total_votes) as total, SUM(upvotes) as up, SUM(downvotes) as down FROM players');
  if (votes[0] && votes[0].values[0]) {
    const [totalV, up, down] = votes[0].values[0];
    console.log('Total votes:', totalV || 0);
    console.log('Upvotes:', up || 0);
    console.log('Downvotes:', down || 0);
  }

  // Sample de 5 joueurs
  console.log('');
  console.log('--- Exemple de joueurs ---');
  const sample = db.exec('SELECT id, name, club, position, nationality, matches_played, goals, assists, photo_url FROM players LIMIT 5');
  if (sample[0]) {
    sample[0].values.forEach(row => {
      console.log('ID ' + row[0] + ': ' + row[1]);
      console.log('   Club: ' + row[2] + ' | Poste: ' + row[3] + ' | Nat: ' + row[4]);
      console.log('   Stats: ' + row[5] + ' matchs, ' + row[6] + ' buts, ' + row[7] + ' passes');
      console.log('   Photo: ' + (row[8] ? 'OK' : 'MANQUANTE'));
      console.log('');
    });
  }

  // Saison
  console.log('--- Saison ---');
  const season = db.exec('SELECT DISTINCT source_season FROM players');
  if (season[0]) {
    console.log('Saison(s):', season[0].values.map(r => r[0]).join(', '));
  }
}

check().catch(console.error);
