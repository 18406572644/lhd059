const dailyStatsRepository = require('../repositories/DailyStatsRepository');
const bottleRepository = require('../repositories/BottleRepository');
const { getTodayStr } = require('../utils/date');

class DailyStatsService {
  incrementStat(type) {
    const today = getTodayStr();
    const row = dailyStatsRepository.findByDate(today);

    if (row) {
      if (type === 'thrown') {
        dailyStatsRepository.incrementThrown(today);
      } else if (type === 'fished') {
        dailyStatsRepository.incrementFished(today);
      }
    } else {
      if (type === 'thrown') {
        dailyStatsRepository.create({ date: today, thrownCount: 1, fishedCount: 0 });
      } else if (type === 'fished') {
        dailyStatsRepository.create({ date: today, thrownCount: 0, fishedCount: 1 });
      }
    }
  }

  getTodayStats() {
    const today = getTodayStr();
    const floatingCount = bottleRepository.countFloating();
    const todayStats = dailyStatsRepository.findByDate(today);

    return {
      floating_count: floatingCount,
      today_thrown: todayStats ? todayStats.thrown_count : 0,
      today_fished: todayStats ? todayStats.fished_count : 0
    };
  }
}

module.exports = new DailyStatsService();
