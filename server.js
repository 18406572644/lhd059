const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const IP2Region = require('ip2region').default;

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'bottles.db'));

const ip2region = new IP2Region({
  ipv4db: path.join(__dirname, 'node_modules/ip2region/data/ip2region.db'),
  disableIpv6: true
});

const CHINA_CITY_COORDS = {
  '北京': { lng: 116.4074, lat: 39.9042 },
  '上海': { lng: 121.4737, lat: 31.2304 },
  '广州': { lng: 113.2644, lat: 23.1291 },
  '深圳': { lng: 114.0579, lat: 22.5431 },
  '天津': { lng: 117.2010, lat: 39.0842 },
  '重庆': { lng: 106.5516, lat: 29.5630 },
  '成都': { lng: 104.0668, lat: 30.5728 },
  '杭州': { lng: 120.1551, lat: 30.2741 },
  '武汉': { lng: 114.3054, lat: 30.5931 },
  '西安': { lng: 108.9398, lat: 34.3416 },
  '南京': { lng: 118.7969, lat: 32.0603 },
  '苏州': { lng: 120.5853, lat: 31.2990 },
  '郑州': { lng: 113.6254, lat: 34.7466 },
  '长沙': { lng: 112.9388, lat: 28.2282 },
  '青岛': { lng: 120.3826, lat: 36.0671 },
  '沈阳': { lng: 123.4315, lat: 41.8057 },
  '宁波': { lng: 121.5494, lat: 29.8683 },
  '昆明': { lng: 102.8329, lat: 24.8801 },
  '大连': { lng: 121.6147, lat: 38.9140 },
  '厦门': { lng: 118.0894, lat: 24.4798 },
  '合肥': { lng: 117.2830, lat: 31.8612 },
  '佛山': { lng: 113.1220, lat: 23.0218 },
  '福州': { lng: 119.2965, lat: 26.0745 },
  '哈尔滨': { lng: 126.6425, lat: 45.7567 },
  '济南': { lng: 117.0009, lat: 36.6758 },
  '温州': { lng: 120.6994, lat: 28.0208 },
  '南宁': { lng: 108.3200, lat: 22.8240 },
  '长春': { lng: 125.3245, lat: 43.8868 },
  '泉州': { lng: 118.5894, lat: 24.8741 },
  '石家庄': { lng: 114.5149, lat: 38.0428 },
  '贵阳': { lng: 106.6302, lat: 26.6470 },
  '南昌': { lng: 115.8581, lat: 28.6820 },
  '常州': { lng: 119.9741, lat: 31.8112 },
  '珠海': { lng: 113.5539, lat: 22.2249 },
  '烟台': { lng: 121.4480, lat: 37.4638 },
  '太原': { lng: 112.5492, lat: 37.8570 },
  '嘉兴': { lng: 120.7555, lat: 30.7463 },
  '南通': { lng: 120.8647, lat: 32.0162 },
  '金华': { lng: 119.6473, lat: 29.0845 },
  '珠海': { lng: 113.5539, lat: 22.2249 },
  '惠州': { lng: 114.4161, lat: 23.1115 },
  '徐州': { lng: 117.2841, lat: 34.2045 },
  '海口': { lng: 110.1999, lat: 20.0442 },
  '乌鲁木齐': { lng: 87.6168, lat: 43.8256 },
  '兰州': { lng: 103.8341, lat: 36.0611 },
  '呼和浩特': { lng: 111.7492, lat: 40.8426 },
  '银川': { lng: 106.2782, lat: 38.4664 },
  '西宁': { lng: 101.7782, lat: 36.6171 },
  '拉萨': { lng: 91.1145, lat: 29.6440 },
  '海口': { lng: 110.3312, lat: 20.0319 },
  '三亚': { lng: 109.5119, lat: 18.2528 },
  '桂林': { lng: 110.299, lat: 25.2742 },
  '洛阳': { lng: 112.454, lat: 34.6197 },
  '扬州': { lng: 119.4124, lat: 32.4049 },
  '无锡': { lng: 120.3119, lat: 31.4912 },
  '东莞': { lng: 113.7518, lat: 23.0489 },
  '中山': { lng: 113.3929, lat: 22.5168 },
  '澳门': { lng: 113.5491, lat: 22.1987 },
  '香港': { lng: 114.1694, lat: 22.3193 },
  '台湾': { lng: 121.5654, lat: 25.0330 },
  '内蒙古': { lng: 111.7492, lat: 40.8426 },
  '新疆': { lng: 87.6168, lat: 43.8256 },
  '西藏': { lng: 91.1145, lat: 29.6440 },
  '宁夏': { lng: 106.2782, lat: 38.4664 },
  '广西': { lng: 108.3200, lat: 22.8240 },
  '云南': { lng: 102.8329, lat: 24.8801 },
  '贵州': { lng: 106.6302, lat: 26.6470 },
  '四川': { lng: 104.0668, lat: 30.5728 },
  '湖南': { lng: 112.9388, lat: 28.2282 },
  '湖北': { lng: 114.3054, lat: 30.5931 },
  '河南': { lng: 113.6254, lat: 34.7466 },
  '河北': { lng: 114.5149, lat: 38.0428 },
  '山东': { lng: 117.0009, lat: 36.6758 },
  '山西': { lng: 112.5492, lat: 37.8570 },
  '陕西': { lng: 108.9398, lat: 34.3416 },
  '甘肃': { lng: 103.8341, lat: 36.0611 },
  '青海': { lng: 101.7782, lat: 36.6171 },
  '黑龙江': { lng: 126.6425, lat: 45.7567 },
  '吉林': { lng: 125.3245, lat: 43.8868 },
  '辽宁': { lng: 123.4315, lat: 41.8057 },
  '江苏': { lng: 118.7969, lat: 32.0603 },
  '安徽': { lng: 117.2830, lat: 31.8612 },
  '浙江': { lng: 120.1551, lat: 30.2741 },
  '福建': { lng: 119.2965, lat: 26.0745 },
  '江西': { lng: 115.8581, lat: 28.6820 },
  '广东': { lng: 113.2644, lat: 23.1291 },
  '海南': { lng: 110.3312, lat: 20.0319 }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

db.exec(`
  CREATE TABLE IF NOT EXISTS bottles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'blue',
    author_nickname TEXT,
    author_avatar TEXT,
    created_at TEXT NOT NULL,
    fished_count INTEGER NOT NULL DEFAULT 0,
    is_sunk INTEGER NOT NULL DEFAULT 0,
    throw_city TEXT
  );

  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bottle_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    author_nickname TEXT,
    author_avatar TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (bottle_id) REFERENCES bottles(id)
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT PRIMARY KEY,
    thrown_count INTEGER NOT NULL DEFAULT 0,
    fished_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bottle_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bottle_id INTEGER NOT NULL,
    fished_city TEXT,
    fished_at TEXT NOT NULL,
    FOREIGN KEY (bottle_id) REFERENCES bottles(id)
  );
`);

const pragma = db.prepare("PRAGMA table_info(bottles)").all();
const bottleColumns = pragma.map(c => c.name);
if (!bottleColumns.includes('author_nickname')) {
  db.exec("ALTER TABLE bottles ADD COLUMN author_nickname TEXT");
}
if (!bottleColumns.includes('author_avatar')) {
  db.exec("ALTER TABLE bottles ADD COLUMN author_avatar TEXT");
}
if (!bottleColumns.includes('throw_city')) {
  db.exec("ALTER TABLE bottles ADD COLUMN throw_city TEXT");
}

const replyPragma = db.prepare("PRAGMA table_info(replies)").all();
const replyColumns = replyPragma.map(c => c.name);
if (!replyColumns.includes('author_nickname')) {
  db.exec("ALTER TABLE replies ADD COLUMN author_nickname TEXT");
}
if (!replyColumns.includes('author_avatar')) {
  db.exec("ALTER TABLE replies ADD COLUMN author_avatar TEXT");
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  let ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

function normalizeCityName(city) {
  if (!city) return null;
  city = city.trim();
  city = city.replace(/^(中国)/, '');
  city = city.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔)$/, '');
  if (city.length >= 3) {
    const prefixes = ['内蒙古', '黑龙江'];
    for (const p of prefixes) {
      if (city.startsWith(p)) return p;
    }
  }
  return city.trim() || null;
}

function getCityByIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return null;
  }
  try {
    const result = ip2region.search(ip);
    if (result) {
      const city = normalizeCityName(result.city);
      if (city) return city;
      const province = normalizeCityName(result.province);
      if (province) return province;
      const country = result.country && result.country !== '0' ? result.country : null;
      if (country) return country;
    }
  } catch (e) {
    console.warn('IP定位失败:', ip, e.message);
  }
  return null;
}

function getCityCoords(cityName) {
  if (!cityName) return null;
  if (CHINA_CITY_COORDS[cityName]) return CHINA_CITY_COORDS[cityName];
  for (const [name, coords] of Object.entries(CHINA_CITY_COORDS)) {
    if (cityName.includes(name) || name.includes(cityName)) {
      return coords;
    }
  }
  return null;
}

function getTodayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function incrementDailyStat(type) {
  const today = getTodayStr();
  const row = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(today);
  if (row) {
    if (type === 'thrown') {
      db.prepare('UPDATE daily_stats SET thrown_count = thrown_count + 1 WHERE date = ?').run(today);
    } else if (type === 'fished') {
      db.prepare('UPDATE daily_stats SET fished_count = fished_count + 1 WHERE date = ?').run(today);
    }
  } else {
    if (type === 'thrown') {
      db.prepare('INSERT INTO daily_stats (date, thrown_count, fished_count) VALUES (?, 1, 0)').run(today);
    } else if (type === 'fished') {
      db.prepare('INSERT INTO daily_stats (date, thrown_count, fished_count) VALUES (?, 0, 1)').run(today);
    }
  }
}

app.post('/api/throw', (req, res) => {
  const { content, color, authorNickname, authorAvatar } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  if (content.length > 140) {
    return res.status(400).json({ error: '内容不能超过140字' });
  }

  const colors = ['blue', 'green', 'yellow', 'pink', 'purple'];
  const bottleColor = colors.includes(color) ? color : 'blue';

  const clientIp = getClientIp(req);
  const throwCity = getCityByIp(clientIp);

  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO bottles (content, color, author_nickname, author_avatar, created_at, throw_city) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(content.trim(), bottleColor, authorNickname || null, authorAvatar || null, now, throwCity);

  incrementDailyStat('thrown');

  const throwCoords = getCityCoords(throwCity);

  res.json({
    id: result.lastInsertRowid,
    content: content.trim(),
    color: bottleColor,
    author_nickname: authorNickname || null,
    author_avatar: authorAvatar || null,
    created_at: now,
    throw_city: throwCity,
    throw_coords: throwCoords
  });
});

app.get('/api/fish', (req, res) => {
  const row = db.prepare(`
    SELECT * FROM bottles 
    WHERE is_sunk = 0 AND fished_count < 5 
    ORDER BY RANDOM() 
    LIMIT 1
  `).get();

  if (!row) {
    return res.json(null);
  }

  const clientIp = getClientIp(req);
  const fishedCity = getCityByIp(clientIp);
  const fishedAt = new Date().toISOString();

  db.prepare('INSERT INTO bottle_tracks (bottle_id, fished_city, fished_at) VALUES (?, ?, ?)').run(row.id, fishedCity, fishedAt);
  db.prepare('UPDATE bottles SET fished_count = fished_count + 1 WHERE id = ?').run(row.id);
  incrementDailyStat('fished');

  const updatedBottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(row.id);
  
  if (updatedBottle.fished_count >= 5) {
    db.prepare('UPDATE bottles SET is_sunk = 1 WHERE id = ?').run(row.id);
  }

  const replies = db.prepare('SELECT * FROM replies WHERE bottle_id = ? ORDER BY created_at').all(row.id);
  const tracks = db.prepare('SELECT fished_city, fished_at FROM bottle_tracks WHERE bottle_id = ? ORDER BY fished_at').all(row.id);

  const throwCoords = getCityCoords(updatedBottle.throw_city);
  const trackPoints = tracks.map(t => ({
    city: t.fished_city,
    time: t.fished_at,
    coords: getCityCoords(t.fished_city)
  })).filter(t => t.coords !== null);

  const allTracks = [];
  if (updatedBottle.throw_city && throwCoords) {
    allTracks.push({ city: updatedBottle.throw_city, type: 'throw', coords: throwCoords, time: updatedBottle.created_at });
  }
  trackPoints.forEach(t => allTracks.push({ city: t.city, type: 'fished', coords: t.coords, time: t.time }));

  res.json({
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
  });
});

app.post('/api/reply', (req, res) => {
  const { bottleId, content, authorNickname, authorAvatar } = req.body;

  if (!bottleId || !content || content.trim().length === 0) {
    return res.status(400).json({ error: '参数错误' });
  }
  if (content.length > 50) {
    return res.status(400).json({ error: '回信不能超过50字' });
  }

  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(bottleId);
  if (!bottle) {
    return res.status(404).json({ error: '瓶子不存在' });
  }

  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO replies (bottle_id, content, author_nickname, author_avatar, created_at) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(bottleId, content.trim(), authorNickname || null, authorAvatar || null, now);

  res.json({
    id: result.lastInsertRowid,
    bottle_id: bottleId,
    content: content.trim(),
    author_nickname: authorNickname || null,
    author_avatar: authorAvatar || null,
    created_at: now
  });
});

app.get('/api/stats', (req, res) => {
  const today = getTodayStr();

  const floatingCount = db.prepare('SELECT COUNT(*) as count FROM bottles WHERE is_sunk = 0 AND fished_count < 5').get().count;
  const todayStats = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(today);

  res.json({
    floating_count: floatingCount,
    today_thrown: todayStats ? todayStats.thrown_count : 0,
    today_fished: todayStats ? todayStats.fished_count : 0
  });
});

app.get('/api/bottle/:id', (req, res) => {
  const { id } = req.params;

  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(id);
  if (!bottle) {
    return res.status(404).json({ error: '瓶子不存在' });
  }

  const replies = db.prepare('SELECT * FROM replies WHERE bottle_id = ? ORDER BY created_at').all(id);
  const tracks = db.prepare('SELECT fished_city, fished_at FROM bottle_tracks WHERE bottle_id = ? ORDER BY fished_at').all(id);

  const throwCoords = getCityCoords(bottle.throw_city);
  const trackPoints = tracks.map(t => ({
    city: t.fished_city,
    time: t.fished_at,
    coords: getCityCoords(t.fished_city)
  })).filter(t => t.coords !== null);

  const allTracks = [];
  if (bottle.throw_city && throwCoords) {
    allTracks.push({ city: bottle.throw_city, type: 'throw', coords: throwCoords, time: bottle.created_at });
  }
  trackPoints.forEach(t => allTracks.push({ city: t.city, type: 'fished', coords: t.coords, time: t.time }));

  res.json({
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
  });
});

app.get('/api/bottles', (req, res) => {
  const bottles = db.prepare(`
    SELECT id, color, content, fished_count 
    FROM bottles 
    WHERE is_sunk = 0 AND fished_count < 5 
    ORDER BY RANDOM() 
    LIMIT 10
  `).all();

  res.json(bottles);
});

app.listen(PORT, () => {
  console.log(`漂流瓶服务已启动: http://localhost:${PORT}`);
});
