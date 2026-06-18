const API_BASE = '/api';
const STORAGE_KEY = 'drift_bottle_identity';

let currentBottle = null;
let currentUser = null;

const nicknameAdjectives = [
  '迷路的', '冲浪的', '失眠的', '沉默的', '温柔的', '勇敢的', '孤独的', '快乐的',
  '忧郁的', '神秘的', '自由的', '安静的', '浪漫的', '调皮的', '认真的', '梦幻的',
  '漂泊的', '深沉的', '清澈的', '慵懒的', '倔强的', '明媚的', '淡然的', '执着的'
];

const nicknameNouns = [
  '海星', '企鹅', '水母', '鲸鱼', '海豚', '海鸥', '珊瑚', '贝壳',
  '海龟', '章鱼', '海马', '海藻', '浪花', '潮汐', '灯塔', '船帆',
  '水手', '珍珠', '海螺', '蓝鲸', '白鲨', '飞鱼', '银鱼', '蓝鲸'
];

const avatarColors = [
  ['#FF6B6B', '#FFE66D'],
  ['#4ECDC4', '#45B7D1'],
  ['#A8E6CF', '#FFD93D'],
  ['#FF8B94', '#FFB199'],
  ['#C56CF0', '#7873F5'],
  ['#667EEA', '#764BA2'],
  ['#F093FB', '#F5576C'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#30CFD0', '#330867'],
  ['#A1C4FD', '#C2E9FB']
];

const bottleColors = {
  blue: '#4a9eff',
  green: '#4ade80',
  yellow: '#fbbf24',
  pink: '#f472b6',
  purple: '#a78bfa'
};

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNickname() {
  return randomPick(nicknameAdjectives) + randomPick(nicknameNouns);
}

function generateAvatarColors() {
  const colors = randomPick(avatarColors);
  return JSON.stringify(colors);
}

function createAvatarSVG(colorsJson, size = 40) {
  let colors;
  try {
    colors = JSON.parse(colorsJson);
  } catch (e) {
    colors = ['#4a9eff', '#0c1445'];
  }
  const initial = colors[0].replace('#', '').charAt(0).toUpperCase();
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarGrad-${colors[0].replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]}"/>
          <stop offset="100%" style="stop-color:${colors[1]}"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#avatarGrad-${colors[0].replace('#', '')})"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial, sans-serif">${initial}</text>
    </svg>
  `;
}

function generateUserIdentity() {
  return {
    nickname: generateNickname(),
    avatar: generateAvatarColors()
  };
}

function saveUserIdentity(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function loadUserIdentity() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('读取用户身份失败:', e);
  }
  return null;
}

function getUserIdentity() {
  if (!currentUser) {
    currentUser = loadUserIdentity();
    if (!currentUser) {
      currentUser = generateUserIdentity();
      saveUserIdentity(currentUser);
    }
  }
  return currentUser;
}

function changeUserIdentity() {
  currentUser = generateUserIdentity();
  saveUserIdentity(currentUser);
  renderUserIdentity();
}

function renderUserIdentity() {
  const user = getUserIdentity();
  const avatarEl = document.getElementById('userAvatar');
  const nicknameEl = document.getElementById('userNickname');
  const throwAvatarEl = document.getElementById('throwIdentityAvatar');
  const throwNicknameEl = document.getElementById('throwIdentityNickname');

  if (avatarEl) {
    avatarEl.innerHTML = createAvatarSVG(user.avatar, 44);
  }
  if (nicknameEl) {
    nicknameEl.textContent = user.nickname;
  }
  if (throwAvatarEl) {
    throwAvatarEl.innerHTML = createAvatarSVG(user.avatar, 28);
  }
  if (throwNicknameEl) {
    throwNicknameEl.textContent = user.nickname;
  }
}

function createAuthorHTML(nickname, avatar) {
  if (!nickname) return '';
  return `
    <div class="author-info">
      <div class="author-avatar">${createAvatarSVG(avatar || '["#4a9eff","#0c1445"]', 28)}</div>
      <div class="author-nickname">${escapeHtml(nickname)}</div>
    </div>
  `;
}

function createBottleSVG(color, size = 'normal') {
  const colorHex = bottleColors[color] || bottleColors.blue;
  const width = size === 'small' ? 30 : 50;
  const height = size === 'small' ? 45 : 70;
  
  return `
    <svg class="bottle-svg" viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg" style="width:${width}px;height:${height}px;">
      <defs>
        <linearGradient id="glassGrad-${color}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
          <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
        </linearGradient>
        <linearGradient id="bottleColor-${color}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorHex};stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:${colorHex};stop-opacity:0.4" />
        </linearGradient>
      </defs>
      
      <ellipse cx="25" cy="55" rx="18" ry="12" fill="url(#bottleColor-${color})" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
      
      <rect x="18" y="15" width="14" height="42" rx="7" fill="url(#glassGrad-${color})" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
      
      <rect x="20" y="28" width="10" height="20" rx="2" fill="#f5e6c8" opacity="0.8"/>
      <line x1="22" y1="32" x2="28" y2="32" stroke="#a89070" stroke-width="0.5" opacity="0.5"/>
      <line x1="22" y1="36" x2="28" y2="36" stroke="#a89070" stroke-width="0.5" opacity="0.5"/>
      <line x1="22" y1="40" x2="28" y2="40" stroke="#a89070" stroke-width="0.5" opacity="0.5"/>
      <line x1="22" y1="44" x2="26" y2="44" stroke="#a89070" stroke-width="0.5" opacity="0.5"/>
      
      <rect x="17" y="8" width="16" height="10" rx="3" fill="#c4a67a" stroke="#8B7355" stroke-width="1"/>
      <rect x="19" y="5" width="12" height="5" rx="2" fill="#a88b5a" stroke="#8B7355" stroke-width="1"/>
      
      <ellipse cx="20" cy="35" rx="2" ry="8" fill="white" opacity="0.3"/>
    </svg>
  `;
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    document.getElementById('floatingCount').textContent = data.floating_count;
    document.getElementById('todayThrown').textContent = data.today_thrown;
    document.getElementById('todayFished').textContent = data.today_fished;
  } catch (err) {
    console.error('加载统计数据失败:', err);
  }
}

async function loadBottles() {
  try {
    const res = await fetch(`${API_BASE}/bottles`);
    const bottles = await res.json();
    renderBottles(bottles);
  } catch (err) {
    console.error('加载瓶子失败:', err);
  }
}

function renderBottles(bottles) {
  const container = document.getElementById('bottlesContainer');
  container.innerHTML = '';
  
  const displayBottles = bottles.slice(0, 8);
  
  displayBottles.forEach((bottle, index) => {
    const bottleEl = document.createElement('div');
    bottleEl.className = 'bottle bottle-float';
    bottleEl.style.animationDelay = `${index * 0.5}s`;
    
    const left = 10 + Math.random() * 80;
    const top = 20 + Math.random() * 40;
    
    bottleEl.style.left = `${left}%`;
    bottleEl.style.top = `${top}%`;
    bottleEl.innerHTML = createBottleSVG(bottle.color);
    bottleEl.dataset.id = bottle.id;
    
    bottleEl.addEventListener('click', () => showBottleDetail(bottle.id));
    
    container.appendChild(bottleEl);
  });
}

async function showBottleDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/bottle/${id}`);
    if (!res.ok) throw new Error('瓶子不存在');
    const bottle = await res.json();
    
    document.getElementById('detailContentText').textContent = bottle.content;
    document.getElementById('detailFishedCount').textContent = bottle.fished_count;
    document.getElementById('detailAuthor').innerHTML = createAuthorHTML(bottle.author_nickname, bottle.author_avatar);
    
    const driftMapContainer = document.getElementById('detailDriftMap');
    if (driftMapContainer) {
      driftMapContainer.innerHTML = createDriftMapSVG(bottle.tracks, bottle.color);
    }
    
    const repliesList = document.getElementById('detailRepliesList');
    if (bottle.replies && bottle.replies.length > 0) {
      repliesList.innerHTML = bottle.replies.map(r => `
        <div class="reply-item">
          ${createAuthorHTML(r.author_nickname, r.author_avatar)}
          <div class="reply-content">${escapeHtml(r.content)}</div>
          <div class="reply-time">${formatTime(r.created_at)}</div>
        </div>
      `).join('');
    } else {
      repliesList.innerHTML = '<div class="no-bottles">还没有回信</div>';
    }
    
    document.getElementById('detailModal').classList.add('active');
  } catch (err) {
    console.error('获取瓶子详情失败:', err);
    alert('获取瓶子详情失败');
  }
}

function showThrowModal() {
  renderUserIdentity();
  document.getElementById('throwModal').classList.add('active');
  document.getElementById('throwContent').value = '';
  document.getElementById('throwCharCount').textContent = '0';
}

function hideThrowModal() {
  document.getElementById('throwModal').classList.remove('active');
}

async function throwBottle() {
  const content = document.getElementById('throwContent').value.trim();
  const colorRadio = document.querySelector('input[name="bottleColor"]:checked');
  const color = colorRadio ? colorRadio.value : 'blue';
  const user = getUserIdentity();
  
  if (!content) {
    alert('请输入内容');
    return;
  }
  if (content.length > 140) {
    alert('内容不能超过140字');
    return;
  }
  
  hideThrowModal();
  playThrowAnimation(color);
  
  try {
    const res = await fetch(`${API_BASE}/throw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        color,
        authorNickname: user.nickname,
        authorAvatar: user.avatar
      })
    });
    
    if (res.ok) {
      setTimeout(() => {
        loadStats();
        loadBottles();
      }, 1000);
    } else {
      const data = await res.json();
      alert(data.error || '扔瓶子失败');
    }
  } catch (err) {
    console.error('扔瓶子失败:', err);
    alert('扔瓶子失败');
  }
}

function playThrowAnimation(color) {
  const flyingBottle = document.getElementById('flyingBottle');
  const throwBtn = document.getElementById('throwBtn');
  const btnRect = throwBtn.getBoundingClientRect();
  
  flyingBottle.innerHTML = createBottleSVG(color);
  flyingBottle.style.left = `${btnRect.left}px`;
  flyingBottle.style.top = `${btnRect.top}px`;
  flyingBottle.classList.remove('animate');
  
  void flyingBottle.offsetWidth;
  
  flyingBottle.classList.add('animate');
  
  setTimeout(() => {
    flyingBottle.classList.remove('animate');
  }, 1500);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForAnimationEnd(element, durationMs) {
  return new Promise(resolve => {
    let resolved = false;
    
    const done = () => {
      if (!resolved) {
        resolved = true;
        element.removeEventListener('animationend', onAnimationEnd);
        resolve();
      }
    };
    
    const onAnimationEnd = () => {
      done();
    };
    
    element.addEventListener('animationend', onAnimationEnd);
    
    setTimeout(done, durationMs + 200);
  });
}

async function fishBottle() {
  const fishModal = document.getElementById('fishModal');
  const fishingHook = document.getElementById('fishingHook');
  const bottleDetail = document.getElementById('bottleDetail');
  
  fishModal.classList.add('active');
  fishingHook.classList.remove('animate');
  bottleDetail.classList.remove('show');
  
  void fishingHook.offsetWidth;
  
  fishingHook.classList.add('animate');
  
  const animationPromise = waitForAnimationEnd(fishingHook, 2000);
  
  try {
    const apiPromise = fetch(`${API_BASE}/fish`).then(res => res.json());
    
    const [, bottle] = await Promise.all([animationPromise, apiPromise]);
    
    currentBottle = bottle;
    
    const fishDriftMap = document.getElementById('fishDriftMap');
    
    if (!bottle) {
      document.getElementById('bottleContentText').textContent = '很遗憾，今天没有捞到瓶子...';
      document.getElementById('bottleAuthor').innerHTML = '';
      document.getElementById('repliesList').innerHTML = '';
      document.querySelector('.reply-input-section').style.display = 'none';
      if (fishDriftMap) fishDriftMap.innerHTML = '';
    } else {
      document.getElementById('bottleContentText').textContent = bottle.content;
      document.getElementById('bottleAuthor').innerHTML = createAuthorHTML(bottle.author_nickname, bottle.author_avatar);
      document.querySelector('.reply-input-section').style.display = 'block';
      document.getElementById('replyContent').value = '';
      document.getElementById('replyCharCount').textContent = '0';
      
      if (fishDriftMap) {
        fishDriftMap.innerHTML = createDriftMapSVG(bottle.tracks, bottle.color);
      }
      
      if (bottle.replies && bottle.replies.length > 0) {
        document.getElementById('repliesList').innerHTML = bottle.replies.map(r => `
          <div class="reply-item">
            ${createAuthorHTML(r.author_nickname, r.author_avatar)}
            <div class="reply-content">${escapeHtml(r.content)}</div>
            <div class="reply-time">${formatTime(r.created_at)}</div>
          </div>
        `).join('');
      } else {
        document.getElementById('repliesList').innerHTML = '<div class="no-bottles">还没有回信</div>';
      }
    }
    
    bottleDetail.classList.add('show');
    loadStats();
    loadBottles();
    
  } catch (err) {
    console.error('捞瓶子失败:', err);
    
    await animationPromise;
    
    document.getElementById('bottleContentText').textContent = '捞瓶子失败，请稍后再试';
    document.getElementById('bottleAuthor').innerHTML = '';
    document.getElementById('repliesList').innerHTML = '';
    document.querySelector('.reply-input-section').style.display = 'none';
    bottleDetail.classList.add('show');
  }
}

function hideFishModal() {
  document.getElementById('fishModal').classList.remove('active');
  currentBottle = null;
}

function throwBackBottle() {
  if (!currentBottle) return;
  
  const fishModal = document.getElementById('fishModal');
  const bottleDetail = document.getElementById('bottleDetail');
  
  bottleDetail.style.animation = 'none';
  bottleDetail.offsetHeight;
  bottleDetail.style.animation = 'bottle-reveal 0.3s ease reverse forwards';
  
  setTimeout(() => {
    fishModal.classList.remove('active');
    bottleDetail.classList.remove('show');
    bottleDetail.style.animation = '';
    currentBottle = null;
    loadStats();
    loadBottles();
  }, 300);
}

async function sendReply() {
  if (!currentBottle) return;
  
  const content = document.getElementById('replyContent').value.trim();
  const user = getUserIdentity();
  
  if (!content) {
    alert('请输入回信内容');
    return;
  }
  if (content.length > 50) {
    alert('回信不能超过50字');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bottleId: currentBottle.id, 
        content,
        authorNickname: user.nickname,
        authorAvatar: user.avatar
      })
    });
    
    if (res.ok) {
      const reply = await res.json();
      const repliesList = document.getElementById('repliesList');
      
      if (repliesList.querySelector('.no-bottles')) {
        repliesList.innerHTML = '';
      }
      
      const replyEl = document.createElement('div');
      replyEl.className = 'reply-item';
      replyEl.innerHTML = `
        ${createAuthorHTML(reply.author_nickname, reply.author_avatar)}
        <div class="reply-content">${escapeHtml(reply.content)}</div>
        <div class="reply-time">${formatTime(reply.created_at)}</div>
      `;
      repliesList.appendChild(replyEl);
      
      document.getElementById('replyContent').value = '';
      document.getElementById('replyCharCount').textContent = '0';
    } else {
      const data = await res.json();
      alert(data.error || '发送回信失败');
    }
  } catch (err) {
    console.error('发送回信失败:', err);
    alert('发送回信失败');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function initEventListeners() {
  document.getElementById('throwBtn').addEventListener('click', showThrowModal);
  document.getElementById('throwCancel').addEventListener('click', hideThrowModal);
  document.getElementById('throwConfirm').addEventListener('click', throwBottle);
  
  document.getElementById('fishBtn').addEventListener('click', fishBottle);
  document.getElementById('fishClose').addEventListener('click', hideFishModal);
  document.getElementById('throwBackBtn').addEventListener('click', throwBackBottle);
  
  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
  });
  
  document.getElementById('replyBtn').addEventListener('click', sendReply);
  
  document.getElementById('changeIdentityBtn').addEventListener('click', changeUserIdentity);
  
  document.getElementById('throwContent').addEventListener('input', (e) => {
    document.getElementById('throwCharCount').textContent = e.target.value.length;
  });
  
  document.getElementById('replyContent').addEventListener('input', (e) => {
    document.getElementById('replyCharCount').textContent = e.target.value.length;
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
  });
}

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
  '惠州': { lng: 114.4161, lat: 23.1115 },
  '徐州': { lng: 117.2841, lat: 34.2045 },
  '海口': { lng: 110.3312, lat: 20.0319 },
  '乌鲁木齐': { lng: 87.6168, lat: 43.8256 },
  '兰州': { lng: 103.8341, lat: 36.0611 },
  '呼和浩特': { lng: 111.7492, lat: 40.8426 },
  '银川': { lng: 106.2782, lat: 38.4664 },
  '西宁': { lng: 101.7782, lat: 36.6171 },
  '拉萨': { lng: 91.1145, lat: 29.6440 },
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

function lngLatToXY(lng, lat, width, height) {
  const minLng = 73;
  const maxLng = 136;
  const minLat = 18;
  const maxLat = 54;
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return { x, y };
}

function generateCurvedPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const curveHeight = dist * 0.25;
  const offsetX = Math.cos(angle + Math.PI / 2) * curveHeight;
  const offsetY = Math.sin(angle + Math.PI / 2) * curveHeight;
  const cpX = cx + offsetX;
  const cpY = cy + offsetY;
  return `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;
}

function createDriftMapSVG(tracks, bottleColor) {
  if (!tracks || tracks.length === 0) {
    return `
      <div class="drift-map-placeholder">
        <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="rgba(10,20,60,0.4)" rx="10"/>
          <text x="200" y="140" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="14">漂流地图待生成...</text>
          <text x="200" y="165" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="11">（IP定位后显示漂流轨迹）</text>
        </svg>
      </div>
    `;
  }

  const width = 400;
  const height = 280;
  const color = bottleColors[bottleColor] || bottleColors.blue;
  const uniqueCities = new Map();
  tracks.forEach(t => {
    if (t.coords) {
      uniqueCities.set(t.city, t.coords);
    }
  });

  const cityXY = new Map();
  uniqueCities.forEach((coords, city) => {
    cityXY.set(city, lngLatToXY(coords.lng, coords.lat, width, height));
  });

  const coastOutline = `
    M 78 175 Q 95 145 128 138 Q 158 128 182 122 Q 200 115 222 116 
    Q 245 108 265 106 Q 288 98 308 95 Q 325 92 332 82 
    L 338 68 L 322 58 L 310 52 L 298 47 L 290 38 L 280 30 
    L 265 25 L 248 28 L 238 36 L 228 46 L 215 52 L 200 56 
    L 185 54 L 170 48 L 155 46 L 142 52 L 132 62 L 118 72 
    L 108 85 L 100 100 L 90 115 L 78 130 L 72 152 
    Q 68 168 78 175 Z
  `;

  const hainanOutline = `
    M 188 242 Q 195 235 203 233 Q 213 232 218 236 Q 223 244 217 252 Q 205 260 197 255 Q 185 250 188 242 Z
  `;

  const taiwanOutline = `
    M 320 192 Q 325 184 330 188 Q 335 196 332 208 Q 329 220 324 224 Q 318 218 317 206 Q 316 196 320 192 Z
  `;

  let pathElements = '';
  let pointElements = '';
  let labelElements = '';
  const processedCities = new Set();
  const labelPositions = [];

  for (let i = 0; i < tracks.length - 1; i++) {
    const from = tracks[i];
    const to = tracks[i + 1];
    if (from.coords && to.coords) {
      const p1 = cityXY.get(from.city);
      const p2 = cityXY.get(to.city);
      if (p1 && p2) {
        const pathD = generateCurvedPath(p1.x, p1.y, p2.x, p2.y);
        pathElements += `
          <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-opacity="0.25" stroke-linecap="round"/>
          <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.85" stroke-linecap="round"
            stroke-dasharray="6 4" class="track-dash-path" style="animation-delay: ${i * 0.3}s"/>
        `;
      }
    }
  }

  function isLabelOverlap(x, y, w, h) {
    for (const pos of labelPositions) {
      if (x < pos.x + pos.w + 4 && x + w + 4 > pos.x &&
          y < pos.y + pos.h + 4 && y + h + 4 > pos.y) {
        return true;
      }
    }
    return false;
  }

  tracks.forEach((t, idx) => {
    if (!t.coords || processedCities.has(t.city)) return;
    processedCities.add(t.city);
    const p = cityXY.get(t.city);
    if (!p) return;

    const isThrow = t.type === 'throw';
    const isLast = idx === tracks.length - 1;
    const r = isThrow ? 8 : (isLast ? 7 : 5);
    const fillColor = isThrow ? '#f59e0b' : (isLast ? color : '#ffffff');
    const strokeColor = isThrow ? '#d97706' : color;

    pointElements += `
      <circle cx="${p.x}" cy="${p.y}" r="${r + 6}" fill="${color}" fill-opacity="0.15" class="track-pulse" style="animation-delay: ${idx * 0.2}s"/>
      <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" class="track-point" style="animation-delay: ${idx * 0.15}s"/>
    `;
    if (isThrow) {
      pointElements += `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="white"/>`;
    }
    if (isLast) {
      pointElements += `
        <g class="track-bottle-icon" style="animation: bottleFloat 2s ease-in-out infinite ${0.5 + idx * 0.2}s both;">
          <ellipse cx="${p.x}" cy="${p.y - 16}" rx="3" ry="2" fill="white" opacity="0.6"/>
          <line x1="${p.x}" y1="${p.y - 14}" x2="${p.x}" y2="${p.y - 8}" stroke="white" stroke-width="1" opacity="0.8"/>
          <path d="M ${p.x - 4} ${p.y - 10} L ${p.x + 4} ${p.y - 10} L ${p.x} ${p.y - 14} Z" fill="${color}" opacity="0.9"/>
        </g>
      `;
    }

    const labelW = t.city.length * 12 + 10;
    const labelH = 14;
    
    let labelX = p.x + r + 6;
    let labelY = p.y - r - 4;
    
    if (labelX + labelW > width - 8) {
      labelX = p.x - r - 6 - labelW;
    }
    if (labelY - labelH < 8) {
      labelY = p.y + r + 4 + labelH;
    }
    
    const tries = [
      { x: p.x + r + 6, y: p.y - r - 4 },
      { x: p.x - r - 6 - labelW, y: p.y - r - 4 },
      { x: p.x + r + 6, y: p.y + r + 4 + labelH },
      { x: p.x - r - 6 - labelW, y: p.y + r + 4 + labelH },
      { x: p.x + r + 6, y: p.y - labelH / 2 },
      { x: p.x - r - 6 - labelW, y: p.y - labelH / 2 },
    ];
    
    let chosen = null;
    for (const pos of tries) {
      if (pos.x >= 8 && pos.x + labelW <= width - 8 &&
          pos.y >= 8 && pos.y <= height - 8 &&
          !isLabelOverlap(pos.x, pos.y - labelH, labelW, labelH)) {
        chosen = pos;
        break;
      }
    }
    
    if (chosen) {
      labelX = chosen.x;
      labelY = chosen.y;
    }
    
    labelPositions.push({ x: labelX, y: labelY - labelH, w: labelW, h: labelH });
    
    labelElements += `
      <g class="track-label" opacity="0" style="animation: labelFadeIn 0.5s ease ${0.5 + idx * 0.2}s forwards">
        <rect x="${labelX - 2}" y="${labelY - labelH}" width="${labelW}" height="${labelH}" rx="3" fill="rgba(0,0,0,0.55)"/>
        <text x="${labelX + 3}" y="${labelY - 3}" fill="white" font-size="10" font-family="Source Serif 4, serif" font-weight="600">${escapeHtml(t.city)}</text>
      </g>
    `;
  });

  return `
    <div class="drift-map-container">
      <div class="drift-map-title">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"/>
        </svg>
        漂流轨迹地图
      </div>
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="drift-map-svg">
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1a6fb5" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#0c1445" stop-opacity="0.6"/>
          </radialGradient>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#oceanGrad)" rx="10"/>
        <rect width="${width}" height="${height}" fill="url(#gridPattern)" rx="10"/>

        <path d="${coastOutline}" fill="rgba(245, 230, 200, 0.82)" stroke="rgba(212, 194, 154, 0.85)" stroke-width="1.2"/>
        <path d="${hainanOutline}" fill="rgba(245, 230, 200, 0.82)" stroke="rgba(212, 194, 154, 0.85)" stroke-width="1"/>
        <path d="${taiwanOutline}" fill="rgba(245, 230, 200, 0.82)" stroke="rgba(212, 194, 154, 0.85)" stroke-width="1"/>

        <line x1="0" y1="${height * 0.25}" x2="${width}" y2="${height * 0.25}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>
        <line x1="0" y1="${height * 0.5}" x2="${width}" y2="${height * 0.5}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>
        <line x1="0" y1="${height * 0.75}" x2="${width}" y2="${height * 0.75}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>
        <line x1="${width * 0.25}" y1="0" x2="${width * 0.25}" y2="${height}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>
        <line x1="${width * 0.5}" y1="0" x2="${width * 0.5}" y2="${height}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>
        <line x1="${width * 0.75}" y1="0" x2="${width * 0.75}" y2="${height}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 8"/>

        <g filter="url(#glow)">
          ${pathElements}
        </g>
        <g filter="url(#softShadow)">
          ${pointElements}
        </g>
        ${labelElements}

        <g transform="translate(10, ${height - 30})" opacity="0.7">
          <circle cx="7" cy="7" r="5" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
          <circle cx="7" cy="7" r="1.5" fill="white"/>
          <text x="17" y="11" fill="white" font-size="9" font-family="Source Serif 4, serif">扔出地</text>
        </g>
        <g transform="translate(70, ${height - 30})" opacity="0.7">
          <circle cx="7" cy="7" r="4" fill="white" stroke="${color}" stroke-width="1.5"/>
          <text x="16" y="11" fill="white" font-size="9" font-family="Source Serif 4, serif">途经</text>
        </g>
        <g transform="translate(105, ${height - 30})" opacity="0.7">
          <circle cx="7" cy="7" r="5" fill="${color}" stroke="${color}" stroke-width="1.5"/>
          <ellipse cx="7" cy="2" rx="2" ry="1.5" fill="white" opacity="0.6"/>
          <line x1="7" y1="3" x2="7" y2="6" stroke="white" stroke-width="0.8" opacity="0.8"/>
          <path d="M 5 5 L 9 5 L 7 2 Z" fill="white" opacity="0.9"/>
          <text x="16" y="11" fill="white" font-size="9" font-family="Source Serif 4, serif">当前</text>
        </g>
      </svg>
    </div>
  `;
}

function init() {
  getUserIdentity();
  renderUserIdentity();
  initEventListeners();
  loadStats();
  loadBottles();
  
  setInterval(() => {
    loadStats();
    loadBottles();
  }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
