const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function list() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '../../database/ligue1.db');
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  const result = db.exec('SELECT DISTINCT nationality FROM players WHERE nationality IS NOT NULL AND nationality != "" ORDER BY nationality');
  if (result[0]) {
    console.log('Nationalités en base:');
    result[0].values.forEach(row => console.log(row[0]));
  }
}

list().catch(console.error);
