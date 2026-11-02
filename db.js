// DATABASE LAYER (SQLite)
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pantry.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS food_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,            -- dairy, vegetable, meat, fruit, grain, ...
    quantity    REAL NOT NULL DEFAULT 1,
    unit        TEXT NOT NULL DEFAULT 'pc',
    expiry_date TEXT NOT NULL,            -- YYYY-MM-DD
    added_date  TEXT NOT NULL DEFAULT (date('now')),
    state       TEXT NOT NULL DEFAULT 'active'   -- active | consumed | wasted
  );

  CREATE TABLE IF NOT EXISTS waste_log (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id   INTEGER,
    name      TEXT NOT NULL,
    quantity  REAL NOT NULL,
    reason    TEXT NOT NULL,
    date      TEXT NOT NULL DEFAULT (date('now'))
  );
`);

module.exports = db;
