const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'tasks.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      period TEXT DEFAULT NULL,
      isToday INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Databases created before the isToday column existed need it added.
  db.all('PRAGMA table_info(tasks)', [], (err, columns) => {
    if (err) {
      console.error('Error reading schema:', err.message);
      return;
    }
    if (!columns.some((column) => column.name === 'isToday')) {
      db.run('ALTER TABLE tasks ADD COLUMN isToday INTEGER NOT NULL DEFAULT 0');
    }
  });
});

module.exports = db;