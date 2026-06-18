const { db } = require('../config/database');

class DailyStatsRepository {
  findByDate(date) {
    return db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(date);
  }

  create({ date, thrownCount = 0, fishedCount = 0 }) {
    return db.prepare(
      'INSERT INTO daily_stats (date, thrown_count, fished_count) VALUES (?, ?, ?)'
    ).run(date, thrownCount, fishedCount);
  }

  incrementThrown(date) {
    return db.prepare('UPDATE daily_stats SET thrown_count = thrown_count + 1 WHERE date = ?').run(date);
  }

  incrementFished(date) {
    return db.prepare('UPDATE daily_stats SET fished_count = fished_count + 1 WHERE date = ?').run(date);
  }
}

module.exports = new DailyStatsRepository();
