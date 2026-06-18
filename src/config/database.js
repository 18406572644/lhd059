const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', '..', 'bottles.db'));

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bottles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'blue',
      author_nickname TEXT,
      author_avatar TEXT,
      created_at TEXT NOT NULL,
      fished_count INTEGER NOT NULL DEFAULT 0,
      is_sunk INTEGER NOT NULL DEFAULT 0,
      throw_city TEXT
    );

    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bottle_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author_nickname TEXT,
      author_avatar TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bottle_id) REFERENCES bottles(id)
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      thrown_count INTEGER NOT NULL DEFAULT 0,
      fished_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bottle_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bottle_id INTEGER NOT NULL,
      fished_city TEXT,
      fished_at TEXT NOT NULL,
      FOREIGN KEY (bottle_id) REFERENCES bottles(id)
    );
  `);

  const pragma = db.prepare("PRAGMA table_info(bottles)").all();
  const bottleColumns = pragma.map(c => c.name);
  if (!bottleColumns.includes('author_nickname')) {
    db.exec("ALTER TABLE bottles ADD COLUMN author_nickname TEXT");
  }
  if (!bottleColumns.includes('author_avatar')) {
    db.exec("ALTER TABLE bottles ADD COLUMN author_avatar TEXT");
  }
  if (!bottleColumns.includes('throw_city')) {
    db.exec("ALTER TABLE bottles ADD COLUMN throw_city TEXT");
  }

  const replyPragma = db.prepare("PRAGMA table_info(replies)").all();
  const replyColumns = replyPragma.map(c => c.name);
  if (!replyColumns.includes('author_nickname')) {
    db.exec("ALTER TABLE replies ADD COLUMN author_nickname TEXT");
  }
  if (!replyColumns.includes('author_avatar')) {
    db.exec("ALTER TABLE replies ADD COLUMN author_avatar TEXT");
  }
}

module.exports = { db, initDatabase };
