const db = require('../database/connection');

class PresetsRepository {
  // Listar todas as categorias
  findAllCategories() {
    const stmt = db.prepare('SELECT id, name, description FROM categories ORDER BY id ASC');
    return stmt.all();
  }

  // Procurar categoria pelo nome ou pelo ID
  findCategory(categoryIdentifier) {
    if (typeof categoryIdentifier === 'number' || !isNaN(Number(categoryIdentifier))) {
      const stmt = db.prepare('SELECT id, name, description FROM categories WHERE id = ?');
      return stmt.get(Number(categoryIdentifier));
    }
    const stmt = db.prepare('SELECT id, name, description FROM categories WHERE LOWER(name) = LOWER(?)');
    return stmt.get(String(categoryIdentifier).trim());
  }

  // Consulta Geral (GET) com INNER JOIN entre presets e categories
  findAll(categoryFilter = null) {
    if (categoryFilter && categoryFilter !== 'Todos') {
      const stmt = db.prepare(`
        SELECT p.id, p.name, p.bpm, p.category_id, c.name AS category, p.created_at
        FROM presets p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE LOWER(c.name) = LOWER(?)
        ORDER BY p.id DESC
      `);
      return stmt.all(categoryFilter);
    }

    const stmt = db.prepare(`
      SELECT p.id, p.name, p.bpm, p.category_id, c.name AS category, p.created_at
      FROM presets p
      INNER JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    return stmt.all();
  }

  // Consulta Individual por ID (GET /:id)
  findById(id) {
    const stmt = db.prepare(`
      SELECT p.id, p.name, p.bpm, p.category_id, c.name AS category, p.created_at
      FROM presets p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `);
    return stmt.get(id);
  }

  // Criação de Preset na Base de Dados (POST)
  create({ name, bpm, categoryId }) {
    const stmt = db.prepare(`
      INSERT INTO presets (name, bpm, category_id)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, bpm, categoryId);
    return this.findById(Number(result.lastInsertRowid));
  }

  // Atualização de Preset na Base de Dados (PUT)
  update(id, { name, bpm, categoryId }) {
    const stmt = db.prepare(`
      UPDATE presets
      SET name = ?, bpm = ?, category_id = ?
      WHERE id = ?
    `);
    const result = stmt.run(name, bpm, categoryId, id);
    if (result.changes === 0) return null;
    return this.findById(id);
  }

  // Exclusão de Preset na Base de Dados (DELETE)
  delete(id) {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = db.prepare('DELETE FROM presets WHERE id = ?');
    stmt.run(id);
    return existing;
  }
}

module.exports = new PresetsRepository();