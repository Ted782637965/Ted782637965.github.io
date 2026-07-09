(function() {
  'use strict';

  let guidesData = null;
  let reviewsData = null;
  let locationMap = null;

  // Location ID to Chinese name mapping (extracted from JS)
  const locationNames = {
    'dongling-shan': '东灵山', 'guanting-reservoir': '官厅水库', 'jiankou-greatwall': '箭扣长城',
    'yudu-shan': '玉渡山', 'cuandixia': '爨底下村', 'shidu': '十渡', 'jinhai-lake': '金海湖',
    'xiangshan': '香山', 'fenghuangling': '凤凰岭', 'baihua-shan': '百花山', 'haiduo-shan': '海坨山',
    'beiling-shan': '北灵山', 'yunmeng-shan': '云蒙山', 'miyun-reservoir': '密云水库',
    'longqing-canyon': '龙庆峡', 'pofengling': '坡峰岭', 'tanzhe-si': '潭柘寺', 'shihua-cave': '石花洞',
    'badaling': '八达岭长城', 'mutianyu-greatwall': '慕田峪长城', 'jindong-canyon': '京东大峡谷',
    'shilinxia': '石林峡', 'labagoumen': '喇叭沟门', 'xishan': '西山森林公园',
    'yongding-river': '永定河峡谷', 'miaofeng-shan': '妙峰山', 'qingliang-valley': '清凉峡',
    'zhenbiancheng': '镇边城', 'xiaowutai': '小五台山', 'wulingshan': '雾灵山',
    'gubei-water town': '古北水镇', 'simatai-greatwall': '司马台长城', 'baiwang-shan': '百望山',
    'yingshan': '银山塔林', 'tianmo-desert': '天漠', 'huangsongyu': '黄松峪',
    'aolinpike-senlin': '奥林匹克森林公园', 'wenyuhe-gongyuan': '北京温榆河公园',
    'jiangfu-gongyuan': '将府公园', 'dongxiaokou-senlin': '东小口森林公园',
    'yongdinghe-senlin': '永定河休闲森林公园', 'nanyuan-shidi': '南苑森林湿地公园',
    'yanqi-xizhan': '雁栖湖西山栈道', 'wucai-qianshan': '舞彩浅山',
    'dayunhe-senlin': '大运河森林公园', 'lvxin-senlin': '城市绿心森林公园',
    'yougu-shentan': '幽谷神潭', 'yunmeng-xia': '云蒙峡', 'qingliang-gu': '清凉谷',
    'tianmen-shan': '天门山', 'baihe-wan': '白河湾', 'baili-shanshui': '百里山水画廊',
    'guyaju': '古崖居', 'yeya-lake': '野鸭湖', 'kangxi-grassland': '康西草原', 'yinhudong': '银狐洞'
  };

  const zoneOrder = ['nw', 'n', 'ne', 'w', 'sw', 'e', 'se'];
  const zoneNames = { 'nw': '西北', 'n': '正北', 'ne': '东北', 'w': '西', 'sw': '西南', 'e': '东', 'se': '东南' };

  // Zone for each location (approximate)
  const locationZones = {
    'dongling-shan': 'w', 'guanting-reservoir': 'nw', 'jiankou-greatwall': 'n', 'yudu-shan': 'nw',
    'cuandixia': 'w', 'shidu': 'sw', 'jinhai-lake': 'ne', 'xiangshan': 'nw', 'fenghuangling': 'nw',
    'baihua-shan': 'w', 'haiduo-shan': 'nw', 'beiling-shan': 'w', 'yunmeng-shan': 'ne',
    'miyun-reservoir': 'ne', 'longqing-canyon': 'nw', 'pofengling': 'sw', 'tanzhe-si': 'w',
    'shihua-cave': 'sw', 'badaling': 'nw', 'mutianyu-greatwall': 'n', 'jindong-canyon': 'ne',
    'shilinxia': 'ne', 'labagoumen': 'n', 'xishan': 'nw', 'yongding-river': 'w',
    'miaofeng-shan': 'w', 'qingliang-valley': 'ne', 'zhenbiancheng': 'w', 'xiaowutai': 'w',
    'wulingshan': 'ne', 'gubei-water town': 'ne', 'simatai-greatwall': 'ne', 'baiwang-shan': 'nw',
    'yingshan': 'n', 'tianmo-desert': 'nw', 'huangsongyu': 'ne', 'aolinpike-senlin': 'c',
    'wenyuhe-gongyuan': 'ne', 'jiangfu-gongyuan': 'ne', 'dongxiaokou-senlin': 'n',
    'yongdinghe-senlin': 'w', 'nanyuan-shidi': 's', 'yanqi-xizhan': 'n', 'wucai-qianshan': 'ne',
    'dayunhe-senlin': 'se', 'lvxin-senlin': 'se',
    'yougu-shentan': 'n', 'yunmeng-xia': 'ne', 'qingliang-gu': 'ne', 'tianmen-shan': 'w',
    'baihe-wan': 'n', 'baili-shanshui': 'nw', 'guyaju': 'nw', 'yeya-lake': 'nw',
    'kangxi-grassland': 'nw', 'yinhudong': 'sw'
  };

  async function loadData() {
    try {
      const [guidesRes, reviewsRes] = await Promise.all([
        fetch('./guides.json'),
        fetch('./reviews.json')
      ]);
      guidesData = await guidesRes.json();
      reviewsData = await reviewsRes.json();
    } catch (e) {
      console.error('Failed to load guide data:', e);
    }
  }

  function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .bo-guide-btn {
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white; border: none; cursor: pointer;
        font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .bo-guide-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
      .bo-guide-panel {
        position: fixed; top: 0; right: -420px; width: 400px; max-width: 90vw;
        height: 100vh; background: #fff; z-index: 10000;
        box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        transition: right 0.3s ease; display: flex; flex-direction: column;
        font-family: 'Noto Sans SC', 'Inter', sans-serif;
      }
      .bo-guide-panel.open { right: 0; }
      .bo-guide-header {
        padding: 16px 20px; background: linear-gradient(135deg, #10b981, #059669);
        color: white; display: flex; align-items: center; justify-content: space-between;
      }
      .bo-guide-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
      .bo-guide-close {
        background: none; border: none; color: white; font-size: 24px; cursor: pointer;
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        border-radius: 50%; transition: background 0.2s;
      }
      .bo-guide-close:hover { background: rgba(255,255,255,0.2); }
      .bo-guide-search {
        padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
      }
      .bo-guide-search input {
        width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
        border-radius: 8px; font-size: 14px; outline: none;
        font-family: inherit; box-sizing: border-box;
      }
      .bo-guide-search input:focus { border-color: #10b981; }
      .bo-guide-list {
        flex: 1; overflow-y: auto; padding: 12px 0;
      }
      .bo-guide-zone {
        margin-bottom: 8px;
      }
      .bo-guide-zone-title {
        padding: 8px 16px; font-size: 13px; font-weight: 600;
        color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;
        background: #f9fafb;
      }
      .bo-guide-item {
        padding: 10px 20px; cursor: pointer; font-size: 14px;
        color: #374151; border-left: 3px solid transparent;
        transition: all 0.15s;
      }
      .bo-guide-item:hover {
        background: #ecfdf5; border-left-color: #10b981; color: #059669;
      }
      .bo-guide-detail {
        flex: 1; overflow-y: auto; padding: 20px; display: none;
      }
      .bo-guide-detail.active { display: block; }
      .bo-guide-detail h4 {
        margin: 0 0 16px 0; font-size: 20px; color: #111827;
        display: flex; align-items: center; gap: 8px;
      }
      .bo-guide-back {
        display: inline-flex; align-items: center; gap: 4px;
        color: #059669; font-size: 14px; cursor: pointer; margin-bottom: 16px;
        padding: 6px 0; font-weight: 500;
      }
      .bo-guide-back:hover { color: #047857; }
      .bo-guide-section {
        margin-bottom: 20px;
      }
      .bo-guide-section-title {
        font-size: 14px; font-weight: 600; color: #059669;
        margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
      }
      .bo-guide-section-content {
        font-size: 13px; line-height: 1.7; color: #4b5563;
        background: #f9fafb; padding: 12px 14px; border-radius: 8px;
      }
      .bo-review-item {
        background: #f9fafb; padding: 12px 14px; border-radius: 8px;
        margin-bottom: 10px; font-size: 13px; line-height: 1.6;
      }
      .bo-review-text { color: #374151; margin-bottom: 6px; }
      .bo-review-source { color: #9ca3af; font-size: 12px; }
      .bo-review-source a { color: #059669; text-decoration: none; }
      .bo-review-source a:hover { text-decoration: underline; }
      .bo-guide-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.3); z-index: 9999; display: none;
      }
      .bo-guide-overlay.open { display: block; }
      @media (max-width: 640px) {
        .bo-guide-panel { width: 100vw; right: -100vw; }
      }
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'bo-guide-overlay';
    overlay.id = 'bo-guide-overlay';
    overlay.addEventListener('click', closePanel);

    const panel = document.createElement('div');
    panel.className = 'bo-guide-panel';
    panel.id = 'bo-guide-panel';
    panel.innerHTML = `
      <div class="bo-guide-header">
        <h3>📖 地点攻略</h3>
        <button class="bo-guide-close" onclick="window.boCloseGuide()">&times;</button>
      </div>
      <div class="bo-guide-search">
        <input type="text" id="bo-guide-search" placeholder="搜索地点..." oninput="window.boSearchGuide(this.value)">
      </div>
      <div class="bo-guide-list" id="bo-guide-list"></div>
      <div class="bo-guide-detail" id="bo-guide-detail"></div>
    `;

    const btn = document.createElement('button');
    btn.className = 'bo-guide-btn';
    btn.innerHTML = '📖';
    btn.title = '查看地点攻略';
    btn.onclick = openPanel;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  function openPanel() {
    document.getElementById('bo-guide-panel').classList.add('open');
    document.getElementById('bo-guide-overlay').classList.add('open');
    renderList();
  }

  window.boCloseGuide = function() {
    document.getElementById('bo-guide-panel').classList.remove('open');
    document.getElementById('bo-guide-overlay').classList.remove('open');
  };

  function closePanel() {
    window.boCloseGuide();
  }

  function renderList(filter = '') {
    const listEl = document.getElementById('bo-guide-list');
    const detailEl = document.getElementById('bo-guide-detail');
    listEl.style.display = 'block';
    detailEl.classList.remove('active');

    const ids = Object.keys(guidesData || {});
    const filtered = ids.filter(id => {
      const name = locationNames[id] || id;
      return name.includes(filter) || id.includes(filter);
    });

    // Group by zone
    const byZone = {};
    for (const id of filtered) {
      const zone = locationZones[id] || 'other';
      if (!byZone[zone]) byZone[zone] = [];
      byZone[zone].push(id);
    }

    let html = '';
    for (const zone of zoneOrder) {
      if (!byZone[zone]) continue;
      html += `<div class="bo-guide-zone"><div class="bo-guide-zone-title">${zoneNames[zone] || zone}</div>`;
      for (const id of byZone[zone]) {
        const name = locationNames[id] || id;
        html += `<div class="bo-guide-item" onclick="window.boShowDetail('${id}')">${name}</div>`;
      }
      html += '</div>';
    }

    if (filtered.length === 0) {
      html = '<div style="padding: 40px; text-align: center; color: #9ca3af;">未找到匹配地点</div>';
    }

    listEl.innerHTML = html;
  }

  window.boSearchGuide = function(value) {
    renderList(value.trim());
  };

  window.boShowDetail = function(id) {
    const listEl = document.getElementById('bo-guide-list');
    const detailEl = document.getElementById('bo-guide-detail');
    listEl.style.display = 'none';
    detailEl.classList.add('active');

    const guide = guidesData[id];
    const reviews = reviewsData[id] || [];
    const name = locationNames[id] || id;

    let html = '';
    html += `<div class="bo-guide-back" onclick="window.boBackToList()"><span>&larr;</span> 返回列表</div>`;
    html += `<h4>${name}</h4>`;

    if (guide) {
      if (guide.drive) {
        html += `<div class="bo-guide-section"><div class="bo-guide-section-title">🚗 自驾路线</div><div class="bo-guide-section-content">${guide.drive}</div></div>`;
      }
      if (guide.transit) {
        html += `<div class="bo-guide-section"><div class="bo-guide-section-title">🚌 公共交通</div><div class="bo-guide-section-content">${guide.transit}</div></div>`;
      }
      if (guide.time) {
        html += `<div class="bo-guide-section"><div class="bo-guide-section-title">⏱ 建议时间</div><div class="bo-guide-section-content">${guide.time}</div></div>`;
      }
      if (guide.overnight) {
        html += `<div class="bo-guide-section"><div class="bo-guide-section-title">🏠 过夜建议</div><div class="bo-guide-section-content">${guide.overnight}</div></div>`;
      }
      if (guide.tips) {
        html += `<div class="bo-guide-section"><div class="bo-guide-section-title">💡 实用贴士</div><div class="bo-guide-section-content">${guide.tips}</div></div>`;
      }
    }

    if (reviews.length > 0) {
      html += `<div class="bo-guide-section"><div class="bo-guide-section-title">💬 用户评价</div>`;
      for (const r of reviews) {
        html += `<div class="bo-review-item"><div class="bo-review-text">${r.content}</div><div class="bo-review-source">${r.source}${r.url ? ` · <a href="${r.url}" target="_blank">查看原文</a>` : ''}</div></div>`;
      }
      html += '</div>';
    }

    detailEl.innerHTML = html;
  };

  window.boBackToList = function() {
    const listEl = document.getElementById('bo-guide-list');
    const detailEl = document.getElementById('bo-guide-detail');
    listEl.style.display = 'block';
    detailEl.classList.remove('active');
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    createStyles();
    createPanel();
    await loadData();
  }
})();
