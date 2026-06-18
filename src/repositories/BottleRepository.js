const { db } = require('../config/database');

class BottleRepository {
  create({ content, color, authorNickname, authorAvatar, createdAt, throwCity }) {
    const stmt = db.prepare(
      'INSERT INTO bottles (content, color, author_nickname, author_avatar, created_at, throw_city) VALUES (?, ?, ?, ?, ?, ?)'
    );
    return stmt.run(content, color, authorNickname || null, authorAvatar || null, createdAt, throwCity);
  }

  findById(id) {
    return db.prepare('SELECT * FROM bottles WHERE id = ?').get(id);
  }

  findRandomAvailable() {
    return db.prepare(`
      SELECT * FROM bottles 
      WHERE is_sunk = 0 AND fished_count < 5 
      ORDER BY RANDOM() 
      LIMIT 1
    `).get();
  }

  listFloating(limit = 10) {
    return db.prepare(`
      SELECT id, color, content, fished_count 
      FROM bottles 
      WHERE is_sunk = 0 AND fished_count < 5 
      ORDER BY RANDOM() 
      LIMIT ?
    `).all(limit);
  }

  incrementFishedCount(id) {
    return db.prepare('UPDATE bottles SET fished_count = fished_count + 1 WHERE id = ?').run(id);
  }

  markAsSunk(id) {
    return db.prepare('UPDATE bottles SET is_sunk = 1 WHERE id = ?').run(id);
  }

  countFloating() {
    return db.prepare('SELECT COUNT(*) as count FROM bottles WHERE is_sunk = 0 AND fished_count < 5').get().count;
  }
}

module.exports = new BottleRepository();
