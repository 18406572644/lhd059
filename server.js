const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'bottles.db'));

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
    is_sunk INTEGER NOT NULL DEFAULT 0
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
`);

const pragma = db.prepare("PRAGMA table_info(bottles)").all();
const bottleColumns = pragma.map(c => c.name);
if (!bottleColumns.includes('author_nickname')) {
  db.exec("ALTER TABLE bottles ADD COLUMN author_nickname TEXT");
}
if (!bottleColumns.includes('author_avatar')) {
  db.exec("ALTER TABLE bottles ADD COLUMN author_avatar TEXT");
}

const replyPragma = db.prepare("PRAGMA table_info(replies)").all();
const replyColumns = replyPragma.map(c => c.name);
if (!replyColumns.includes('author_nickname')) {
  db.exec("ALTER TABLE replies ADD COLUMN author_nickname TEXT");
}
if (!replyColumns.includes('author_avatar')) {
  db.exec("ALTER TABLE replies ADD COLUMN author_avatar TEXT");
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

  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO bottles (content, color, author_nickname, author_avatar, created_at) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(content.trim(), bottleColor, authorNickname || null, authorAvatar || null, now);

  incrementDailyStat('thrown');

  res.json({
    id: result.lastInsertRowid,
    content: content.trim(),
    color: bottleColor,
    author_nickname: authorNickname || null,
    author_avatar: authorAvatar || null,
    created_at: now
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

  db.prepare('UPDATE bottles SET fished_count = fished_count + 1 WHERE id = ?').run(row.id);
  incrementDailyStat('fished');

  const updatedBottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(row.id);
  
  if (updatedBottle.fished_count >= 5) {
    db.prepare('UPDATE bottles SET is_sunk = 1 WHERE id = ?').run(row.id);
  }

  const replies = db.prepare('SELECT * FROM replies WHERE bottle_id = ? ORDER BY created_at').all(row.id);

  res.json({
    id: updatedBottle.id,
    content: updatedBottle.content,
    color: updatedBottle.color,
    author_nickname: updatedBottle.author_nickname,
    author_avatar: updatedBottle.author_avatar,
    created_at: updatedBottle.created_at,
    fished_count: updatedBottle.fished_count,
    is_sunk: updatedBottle.is_sunk === 1,
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

  res.json({
    id: bottle.id,
    content: bottle.content,
    color: bottle.color,
    author_nickname: bottle.author_nickname,
    author_avatar: bottle.author_avatar,
    created_at: bottle.created_at,
    fished_count: bottle.fished_count,
    is_sunk: bottle.is_sunk === 1,
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
