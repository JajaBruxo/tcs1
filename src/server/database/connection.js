const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'websampler.db');
const db = new DatabaseSync(dbPath);

// Ativa a verificação de chaves estrangeiras no SQLite
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  // Entidade 1: Categorias (Estilos Musicais)
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL
    );
  `);

  // Entidade 2: Presets (Relacionada com Categories via category_id)
  db.exec(`
    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bpm INTEGER NOT NULL CHECK (bpm >= 40 AND bpm <= 240),
      category_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );
  `);

  // Inserção inicial (Seed) de categorias caso a tabela esteja vazia
  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCat.run('Hip-Hop', 'Batidas clássicas de BoomBap, Lo-Fi e Trap');
    insertCat.run('Eletrónica', 'Kits de sintetizadores, House, Techno e Synthwave');
    insertCat.run('Rock', 'Baterias acústicas de Garage, Indie e Punk Rock');
    insertCat.run('Experimental', 'Texturas modulares, Glitch e amostras industriais');
  }

  // Inserção inicial (Seed) de presets caso a tabela esteja vazia
  const presetCount = db.prepare('SELECT COUNT(*) AS count FROM presets').get().count;
  if (presetCount === 0) {
    const insertPreset = db.prepare(
      'INSERT INTO presets (name, bpm, category_id) VALUES (?, ?, ?)'
    );
    insertPreset.run('BoomBap Essentials', 90, 1);
    insertPreset.run('Synthwave 80s Kit', 126, 2);
    insertPreset.run('Garage Rock Drums', 140, 3);
    insertPreset.run('Glitch Modular', 110, 4);
  }
}

initDatabase();

module.exports = db;