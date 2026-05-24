const Database = require('better-sqlite3');

const db = new Database('sons.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT,
    type TEXT,
    dealer TEXT,
    bedrag TEXT,
    notitie TEXT,
    gebruiker TEXT,
    datum TEXT
)
`).run();

module.exports = db;