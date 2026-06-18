const dailyStatsService = require('../services/DailyStatsService');

class StatsController {
  async getStats(req, res) {
    const result = dailyStatsService.getTodayStats();
    res.json(result);
  }
}

module.exports = new StatsController();
