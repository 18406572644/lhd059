const API_BASE = '/api';

let currentBottle = null;

const bottleColors = {
  blue: '#4a9eff',
  green: '#4ade80',
  yellow: '#fbbf24',
  pink: '#f472b6',
  purple: '#a78bfa'
};

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
    
    const repliesList = document.getElementById('detailRepliesList');
    if (bottle.replies && bottle.replies.length > 0) {
      repliesList.innerHTML = bottle.replies.map(r => `
        <div class="reply-item">
          ${escapeHtml(r.content)}
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
      body: JSON.stringify({ content, color })
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

async function fishBottle() {
  const fishModal = document.getElementById('fishModal');
  const fishingHook = document.getElementById('fishingHook');
  const bottleDetail = document.getElementById('bottleDetail');
  
  fishModal.classList.add('active');
  fishingHook.classList.remove('animate');
  bottleDetail.classList.remove('show');
  
  void fishingHook.offsetWidth;
  
  fishingHook.classList.add('animate');
  
  try {
    const res = await fetch(`${API_BASE}/fish`);
    const bottle = await res.json();
    
    currentBottle = bottle;
    
    setTimeout(() => {
      if (!bottle) {
        document.getElementById('bottleContentText').textContent = '很遗憾，今天没有捞到瓶子...';
        document.getElementById('repliesList').innerHTML = '';
        document.querySelector('.reply-input-section').style.display = 'none';
      } else {
        document.getElementById('bottleContentText').textContent = bottle.content;
        document.querySelector('.reply-input-section').style.display = 'block';
        document.getElementById('replyContent').value = '';
        document.getElementById('replyCharCount').textContent = '0';
        
        if (bottle.replies && bottle.replies.length > 0) {
          document.getElementById('repliesList').innerHTML = bottle.replies.map(r => `
            <div class="reply-item">
              ${escapeHtml(r.content)}
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
    }, 1800);
    
  } catch (err) {
    console.error('捞瓶子失败:', err);
    setTimeout(() => {
      document.getElementById('bottleContentText').textContent = '捞瓶子失败，请稍后再试';
      bottleDetail.classList.add('show');
    }, 1000);
  }
}

function hideFishModal() {
  document.getElementById('fishModal').classList.remove('active');
  currentBottle = null;
}

async function sendReply() {
  if (!currentBottle) return;
  
  const content = document.getElementById('replyContent').value.trim();
  
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
      body: JSON.stringify({ bottleId: currentBottle.id, content })
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
        ${escapeHtml(reply.content)}
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
  
  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
  });
  
  document.getElementById('replyBtn').addEventListener('click', sendReply);
  
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

function init() {
  initEventListeners();
  loadStats();
  loadBottles();
  
  setInterval(() => {
    loadStats();
    loadBottles();
  }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
