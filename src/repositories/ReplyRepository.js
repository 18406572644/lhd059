const { db } = require('../config/database');

class ReplyRepository {
  create({ bottleId, content, authorNickname, authorAvatar, createdAt }) {
    const stmt = db.prepare(
      'INSERT INTO replies (bottle_id, content, author_nickname, author_avatar, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    return stmt.run(bottleId, content, authorNickname || null, authorAvatar || null, createdAt);
  }

  findByBottleId(bottleId) {
    return db.prepare('SELECT * FROM replies WHERE bottle_id = ? ORDER BY created_at').all(bottleId);
  }
}

module.exports = new ReplyRepository();
