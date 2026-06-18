const { db } = require('../config/database');

class BottleTrackRepository {
  create({ bottleId, fishedCity, fishedAt }) {
    return db.prepare(
      'INSERT INTO bottle_tracks (bottle_id, fished_city, fished_at) VALUES (?, ?, ?)'
    ).run(bottleId, fishedCity, fishedAt);
  }

  findByBottleId(bottleId) {
    return db.prepare(
      'SELECT fished_city, fished_at FROM bottle_tracks WHERE bottle_id = ? ORDER BY fished_at'
    ).all(bottleId);
  }
}

module.exports = new BottleTrackRepository();
