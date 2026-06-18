const bottleRepository = require('../repositories/BottleRepository');
const bottleTrackRepository = require('../repositories/BottleTrackRepository');
const replyRepository = require('../repositories/ReplyRepository');
const dailyStatsService = require('./DailyStatsService');
const { getCityCoords } = require('../utils/geo');

class BottleService {
  throwBottle({ content, color, authorNickname, authorAvatar, throwCity }) {
    const now = new Date().toISOString();
    const colors = ['blue', 'green', 'yellow', 'pink', 'purple'];
    const bottleColor = colors.includes(color) ? color : 'blue';

    const result = bottleRepository.create({
      content: content.trim(),
      color: bottleColor,
      authorNickname,
      authorAvatar,
      createdAt: now,
      throwCity
    });

    dailyStatsService.incrementStat('thrown');

    const throwCoords = getCityCoords(throwCity);

    return {
      id: result.lastInsertRowid,
      content: content.trim(),
      color: bottleColor,
      author_nickname: authorNickname || null,
      author_avatar: authorAvatar || null,
      created_at: now,
      throw_city: throwCity,
      throw_coords: throwCoords
    };
  }

  fishBottle({ fishedCity }) {
    const bottle = bottleRepository.findRandomAvailable();
    if (!bottle) {
      return null;
    }

    const fishedAt = new Date().toISOString();

    bottleTrackRepository.create({
      bottleId: bottle.id,
      fishedCity,
      fishedAt
    });

    bottleRepository.incrementFishedCount(bottle.id);
    dailyStatsService.incrementStat('fished');

    const updatedBottle = bottleRepository.findById(bottle.id);

    if (updatedBottle.fished_count >= 5) {
      bottleRepository.markAsSunk(bottle.id);
      updatedBottle.is_sunk = 1;
    }

    const replies = replyRepository.findByBottleId(bottle.id);
    const tracks = bottleTrackRepository.findByBottleId(bottle.id);

    const throwCoords = getCityCoords(updatedBottle.throw_city);
    const trackPoints = tracks.map(t => ({
      city: t.fished_city,
      time: t.fished_at,
      coords: getCityCoords(t.fished_city)
    })).filter(t => t.coords !== null);

    const allTracks = [];
    if (updatedBottle.throw_city && throwCoords) {
      allTracks.push({
        city: updatedBottle.throw_city,
        type: 'throw',
        coords: throwCoords,
        time: updatedBottle.created_at
      });
    }
    trackPoints.forEach(t => allTracks.push({
      city: t.city,
      type: 'fished',
      coords: t.coords,
      time: t.time
    }));

    return {
      id: updatedBottle.id,
      content: updatedBottle.content,
      color: updatedBottle.color,
      author_nickname: updatedBottle.author_nickname,
      author_avatar: updatedBottle.author_avatar,
      created_at: updatedBottle.created_at,
      fished_count: updatedBottle.fished_count,
      is_sunk: updatedBottle.is_sunk === 1,
      throw_city: updatedBottle.throw_city,
      fished_city: fishedCity,
      tracks: allTracks,
      replies: replies.map(r => ({
        id: r.id,
        content: r.content,
        author_nickname: r.author_nickname,
        author_avatar: r.author_avatar,
        created_at: r.created_at
      }))
    };
  }

  getBottleDetail(id) {
    const bottle = bottleRepository.findById(id);
    if (!bottle) {
      return null;
    }

    const replies = replyRepository.findByBottleId(id);
    const tracks = bottleTrackRepository.findByBottleId(id);

    const throwCoords = getCityCoords(bottle.throw_city);
    const trackPoints = tracks.map(t => ({
      city: t.fished_city,
      time: t.fished_at,
      coords: getCityCoords(t.fished_city)
    })).filter(t => t.coords !== null);

    const allTracks = [];
    if (bottle.throw_city && throwCoords) {
      allTracks.push({
        city: bottle.throw_city,
        type: 'throw',
        coords: throwCoords,
        time: bottle.created_at
      });
    }
    trackPoints.forEach(t => allTracks.push({
      city: t.city,
      type: 'fished',
      coords: t.coords,
      time: t.time
    }));

    return {
      id: bottle.id,
      content: bottle.content,
      color: bottle.color,
      author_nickname: bottle.author_nickname,
      author_avatar: bottle.author_avatar,
      created_at: bottle.created_at,
      fished_count: bottle.fished_count,
      is_sunk: bottle.is_sunk === 1,
      throw_city: bottle.throw_city,
      tracks: allTracks,
      replies: replies.map(r => ({
        id: r.id,
        content: r.content,
        author_nickname: r.author_nickname,
        author_avatar: r.author_avatar,
        created_at: r.created_at
      }))
    };
  }

  listFloatingBottles(limit = 10) {
    return bottleRepository.listFloating(limit);
  }

  validateThrowContent(content) {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: '内容不能为空' };
    }
    if (content.length > 140) {
      return { valid: false, error: '内容不能超过140字' };
    }
    return { valid: true };
  }
}

module.exports = new BottleService();
