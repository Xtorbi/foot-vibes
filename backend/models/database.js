const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/ligue1.db');

let db;
let SQL;

async function getDb() {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

// Auto-save every 30 seconds
setInterval(() => {
  if (db) saveDb();
}, 30000);

// Save on exit
process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });
process.on('SIGTERM', () => { saveDb(); process.exit(); });

async function initDb() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      name TEXT NOT NULL,
      club TEXT NOT NULL,
      position TEXT NOT NULL CHECK(position IN ('Gardien', 'Defenseur', 'Milieu', 'Attaquant')),
      nationality TEXT,
      photo_url TEXT,
      age INTEGER,
      number INTEGER,
      matches_played INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      clean_sheets INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      last_matchday_played INTEGER DEFAULT 0,
      last_match_date TEXT,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      neutral_votes INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      source_season TEXT NOT NULL,
      archived INTEGER DEFAULT 0,
      archived_reason TEXT,
      archived_at TEXT,
      api_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_club ON players(club)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_position ON players(position)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_score ON players(score DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_total_votes ON players(total_votes DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_season ON players(source_season)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_active ON players(source_season, archived)`);

  // Migration: ajouter les nouvelles colonnes si elles n'existent pas
  const columns = db.exec("PRAGMA table_info(players)");
  const columnNames = columns.length > 0 ? columns[0].values.map(row => row[1]) : [];

  if (!columnNames.includes('last_matchday_played')) {
    db.run(`ALTER TABLE players ADD COLUMN last_matchday_played INTEGER DEFAULT 0`);
  }
  if (!columnNames.includes('last_match_date')) {
    db.run(`ALTER TABLE players ADD COLUMN last_match_date TEXT`);
  }

  db.run(`CREATE INDEX IF NOT EXISTS idx_last_matchday ON players(last_matchday_played)`);

  // Table pour tracker la journée actuelle de la ligue
  db.run(`
    CREATE TABLE IF NOT EXISTS league_status (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      current_matchday INTEGER NOT NULL DEFAULT 1,
      season TEXT NOT NULL,
      last_updated TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'neutral', 'down')),
      context TEXT DEFAULT 'ligue1',
      voted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_votes_player ON votes(player_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_votes_context ON votes(context)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(voted_at)`);

  // Migration: ajouter colonne voter_ip si elle n'existe pas
  const votesColumns = db.exec("PRAGMA table_info(votes)");
  const votesColumnNames = votesColumns.length > 0 ? votesColumns[0].values.map(row => row[1]) : [];
  if (!votesColumnNames.includes('voter_ip')) {
    db.run(`ALTER TABLE votes ADD COLUMN voter_ip TEXT`);
  }
  db.run(`CREATE INDEX IF NOT EXISTS idx_votes_ip ON votes(player_id, voter_ip)`);

  saveDb();
  return db;
}

// Helper: run a SELECT and return all rows as array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a SELECT and return first row as object (or null)
function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

// Helper: run INSERT/UPDATE/DELETE
function runSql(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

module.exports = { getDb, initDb, saveDb, queryAll, queryOne, runSql };
