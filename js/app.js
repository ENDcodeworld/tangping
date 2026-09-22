/* ============ 躺平 · SPA 核心逻辑（纯前端 / hash 路由 / localStorage） ============ */
'use strict';

/* ---------- 工具 ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtMoney = n => '¥' + (Number(n) || 0).toLocaleString('zh-CN');
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };

/* ---------- localStorage 数据层（tp_ 前缀，静默写入） ---------- */
const store = {
  get(key, def) { try { const v = localStorage.getItem('tp_' + key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(key, val) { try { localStorage.setItem('tp_' + key, JSON.stringify(val)); } catch (e) {} }
};
const getStr = k => { try { return localStorage.getItem('tp_' + k) || ''; } catch (e) { return ''; } };
const setStr = (k, v) => { try { localStorage.setItem('tp_' + k, v); } catch (e) {} };

/* 打卡 */
const getCheckins = () => store.get('checkins', []);
const saveCheckins = c => store.set('checkins', c);
/* 购物车 */
const getCart = () => store.get('cart', []);
const saveCart = c => store.set('cart', c);
const cartCount = () => getCart().reduce((s, x) => s + (x.qty || 0), 0);
const cartDetail = () => getCart().map(it => ({ prod: TP_PRODUCTS.find(p => p.id === it.id), qty: it.qty })).filter(x => x.prod);
const cartTotal = () => cartDetail().reduce((s, x) => s + x.prod.price * x.qty, 0);
function addToCart(id, qty = 1) {
  const cart = getCart();
  const hit = cart.find(x => x.id === id);
  if (hit) hit.qty += qty; else cart.push({ id, qty });
  saveCart(cart); syncCartUI();
}
function setCartQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(x => x.id !== id);
  else { const h = cart.find(x => x.id === id); if (h) h.qty = qty; }
  saveCart(cart);
}
/* 收藏商品 */
const getFavs = () => store.get('favs', []);
const isFav = id => getFavs().includes(id);
function toggleFav(id) {
  const f = getFavs(); const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  store.set('favs', f);
}
/* 文章点赞（双击正文） */
const getLikes = () => store.get('likes', []);
const isLiked = id => getLikes().includes(id);
function toggleLike(id) {
  const l = getLikes(); const i = l.indexOf(id);
  if (i >= 0) l.splice(i, 1); else l.push(id);
  store.set('likes', l);
}
/* 测试结果 */
const getQuizResult = () => store.get('quiz_result', null);
/* FIRE 配置 */
const getFireProfile = () => store.get('fire_profile', { pv: 100000, expense: 4000, income: 10000, rate: 4, age: 25, retireAge: 45 });
/* 昵称 / 头像 / 体重 */
const getNickname = () => getStr('nickname') || '躺平新人';
const getAvatar = () => getStr('avatar') || '🛌';
const getWeight = () => { const w = parseFloat(getStr('weight')); return w > 0 ? w : 65; };
/* 躺平树洞 */
const getFeedPosts = () => store.get('feed_posts', []);
const getFeedLikes = () => store.get('feed_likes', []);
const getFeedComments = () => store.get('feed_comments', {});
function allFeedPosts() { return [...getFeedPosts()].reverse().concat(window.TP_FEED || []); }
function toggleFeedLike(id) {
  const l = getFeedLikes(); const i = l.indexOf(id);
  if (i >= 0) l.splice(i, 1); else l.push(id);
  store.set('feed_likes', l);
}
const getFeedCLikes = () => store.get('feed_clikes', {});
function toggleFeedCLike(key) {
  const m = getFeedCLikes(); m[key] = !m[key]; store.set('feed_clikes', m);
}

function addFeedComment(id, text) {
  const cm = getFeedComments();
  (cm[id] = cm[id] || []).push({ author: getNickname(), avatar: getAvatar(), text, mins: '刚刚' });
  store.set('feed_comments', cm);
}
function addFeedPost(text) {
  const posts = getFeedPosts();
  posts.push({ id: 'u' + Date.now(), author: getNickname(), avatar: getAvatar(), mins: '刚刚', text, likes: 0, comments: [] });
  store.set('feed_posts', posts);
}

/* 修为等级 */
const CULTIVATION = [
  { min: 100, name: '躺平宗师', emoji: '🧙' },
  { min: 30,  name: '大躺无形', emoji: '😌' },
  { min: 7,   name: '躺平有道', emoji: '😎' },
  { min: 1,   name: '小有所成', emoji: '🙂' },
  { min: 0,   name: '初入躺门', emoji: '🐣' }
];
function cultivationOf(days) { return CULTIVATION.find(c => days >= c.min) || CULTIVATION[CULTIVATION.length - 1]; }

/* 统计 */
const checkinDays = () => getCheckins().length;
const totalHours = () => getCheckins().reduce((s, c) => s + (c.hours || 0), 0);
const totalKcal = () => getCheckins().reduce((s, c) => s + (c.kcal || 0), 0);
function streakDays() {
  const set = new Set(getCheckins().map(c => c.date));
  const d = new Date();
  const fmt = () => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  if (!set.has(fmt())) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(fmt())) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* 一键打卡：静默写入；返回是否今天第一次 */
function recordToday(hours) {
  const cks = getCheckins();
  const today = todayStr();
  const exist = cks.findIndex(c => c.date === today);
  const weight = getWeight();
  const kcal = hours * 65 * (weight / 65);
  const rec = { date: today, hours, index: 7, kcal, note: '' };
  if (exist >= 0) { cks[exist] = rec; saveCheckins(cks); return false; }
  cks.push(rec); saveCheckins(cks); return true;
}

/* ============ 路由 ============ */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segs = pathPart.split('/').filter(Boolean);
  return { page: segs[0] || '', arg: segs[1] ? decodeURIComponent(segs[1]) : null, params: new URLSearchParams(queryPart || '') };
}
function goto(page, params) {
  const qs = params ? params.toString() : '';
  location.hash = '#/' + page + (qs ? '?' + qs : '');
}

/* ============ 页面：首页 ============ */
function pageHome() {
  const ck = getCheckins();
  const today = todayStr();
  const todayRec = ck.find(c => c.date === today);
  const weight = getWeight();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const rec = ck.find(c => c.date === key);
    days.push({ key, label: ['日','一','二','三','四','五','六'][d.getDay()], hours: rec ? rec.hours : 0, isToday: key === today });
  }
  const maxH = Math.max(...days.map(d => d.hours), 1);
  const chartHTML = ck.length === 0
    ? '<div class="empty"><span class="e-ico">🌱</span>还没记录，今天先躺一会儿</div>'
    : '<div class="barchart">' + days.map(d =>
        '<div class="col' + (d.isToday ? ' today' : '') + '">' +
          '<span class="h">' + (d.hours ? d.hours + 'h' : '') + '</span>' +
          '<div class="bar" style="height:' + Math.round(d.hours / maxH * 100) + '%"></div>' +
          '<span class="day">' + d.label + '</span>' +
        '</div>').join('') + '</div>';

  const ckHours = todayRec ? todayRec.hours : 8;
  const hourOpts = [6, 8, 10];
  const QUOTES = ['慢慢来，谁都有自己的时区', '今天不努力，明天也不努力', '休息是最好的进步'];
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return `
  <div class="anim">
    <section class="hero hero-quiet">
      <div class="hero-inner">
        <div class="tiny">今日金句</div>
        <h1 class="hero-quote">${quote}</h1>
        <p>今天也辛苦了，躺一会儿吧。</p>
      </div>
    </section>

    <div class="panel checkin-panel">
      <button class="big-checkin ${todayRec ? 'done' : ''}" id="bigCheckin">
        ${todayRec ? `✅ 已打卡 · 今天躺了 ${todayRec.hours} 小时` : '😌 今日已躺平'}
      </button>
      <div class="hour-row">
        <span class="tiny">今天躺了</span>
        ${hourOpts.map(h => `<button class="hour-tag ${h === ckHours ? 'active' : ''}" data-hours="${h}">${h}h</button>`).join('')}
      </div>
      <div class="tiny" style="text-align:center;margin-top:8px">${todayRec ? `摸鱼 ${todayRec.index}/10 · 约 ${Math.round(todayRec.kcal)} 大卡` : `摸鱼 7/10 · 按体重 ${weight}kg 估算`}</div>
    </div>

    <div class="panel">
      <h3>最近 7 天</h3>
      ${chartHTML}
    </div>

    <a class="report-link" href="#/report">📊 今日躺平战报 →</a>
    <h3 class="sec-title">随便看看</h3>
    <div class="quick-grid">
      <a class="quick-item" href="#/articles"><span class="qi">📖</span><b>反内卷</b><span>摸鱼 / 低消费 / 不看群</span></a>
      <a class="quick-item" href="#/quiz"><span class="qi">🎯</span><b>你有多躺？</b><span>随便测测</span></a>
      <a class="quick-item" href="#/shop"><span class="qi">🛍️</span><b>躺平商店</b><span>随便逛逛</span></a>
      <a class="quick-item" href="#/fire"><span class="qi">🔥</span><b>FIRE 计算器</b><span>算算几岁能退</span></a>
      <a class="quick-item" href="#/feed"><span class="qi">💬</span><b>躺平树洞</b><span>随便说点什么</span></a>
    </div>
  </div>`;
}

/* ============ 页面：文章列表 / 详情 ============ */
function pageArticles(params) {
  const cat = params.get('cat') || 'all';
  const list = cat === 'all' ? TP_ARTICLES : TP_ARTICLES.filter(a => a.cat === cat);
  const chips = TP_ARTICLE_CATS.map(c =>
    `<button class="chip ${cat === c.key ? 'active' : ''}" data-cat="${c.key}">${c.emoji ? c.emoji + ' ' : ''}${c.name}</button>`).join('');
  const cards = list.map(a => {
    const catMeta = TP_ARTICLE_CATS.find(c => c.key === a.cat);
    return `<div class="art-card" data-open-article="${a.id}">
      <div class="art-emoji">${a.emoji}</div>
      <div class="art-body">
        <div class="art-title">${esc(a.title)}</div>
        <div class="art-sum">${esc(a.summary)}</div>
        <div class="art-meta">
          <span class="tag">${catMeta.name}</span>
          <span class="tiny">约 ${a.mins} 分钟 · 双击点赞</span>
        </div>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="anim">
    <h3 class="sec-title">📖 反内卷</h3>
    <div class="filter-row">${chips}</div>
    <div class="art-list">${cards || '<div class="empty"><span class="e-ico">🍃</span>暂无内容</div>'}</div>
  </div>`;
}

function pageArticleDetail(id) {
  const a = TP_ARTICLES.find(x => x.id === id);
  if (!a) return '<div class="empty"><span class="e-ico">🤔</span>文章不存在</div>';
  const catMeta = TP_ARTICLE_CATS.find(c => c.key === a.cat);
  const liked = isLiked(a.id);
  const related = TP_ARTICLES.filter(x => x.cat === a.cat && x.id !== a.id).slice(0, 3);
  return `
  <div class="anim">
    <a class="back-link" href="#/articles">← 返回</a>
    <div class="panel">
      <span class="tag">${catMeta.emoji} ${catMeta.name}</span>
      <h2 style="font-size:22px;font-weight:900;margin:12px 0 6px">${a.emoji} ${esc(a.title)}</h2>
      <div class="tiny">约 ${a.mins} 分钟 · ${liked ? '❤️ 已点赞' : '双击正文可点赞'}</div>
      <div class="art-detail-body" style="margin-top:18px">
        ${a.body.map(p => '<p>' + esc(p) + '</p>').join('')}
      </div>
    </div>
    ${related.length ? `<h3 class="sec-title">再看看</h3>
      <div class="art-list">${related.map(r => `<div class="art-card" data-open-article="${r.id}">
        <div class="art-emoji">${r.emoji}</div>
        <div class="art-body"><div class="art-title">${esc(r.title)}</div>
        <div class="art-sum">${esc(r.summary)}</div></div></div>`).join('')}</div>` : ''}
  </div>`;
}

/* ============ 页面：你有多躺？ ============ */
let quizIdx = 0;
let quizAnswers = [];
function pageQuiz() {
  const total = TP_QUIZ.questions.length;
  if (quizIdx >= total) return renderQuizResult();
  const q = TP_QUIZ.questions[quizIdx];
  const opts = q.options.map((o, i) =>
    `<button class="quiz-opt" data-opt="${i}">${esc(o.t)}</button>`).join('');
  return `
  <div class="anim panel" style="max-width:680px;margin:18px auto">
    <div class="tiny" style="margin-bottom:6px">第 ${quizIdx + 1} / ${total} 题</div>
    <div class="quiz-progress"><i style="width:${Math.round(quizIdx / total * 100)}%"></i></div>
    <div class="quiz-q">${quizIdx + 1}. ${esc(q.q)}</div>
    <div class="quiz-opts">${opts}</div>
    <div class="quiz-nav">
      <button class="btn btn-ghost" id="quizPrev" ${quizIdx === 0 ? 'disabled' : ''}>← 上一题</button>
    </div>
  </div>`;
}

function renderQuizResult() {
  const total = TP_QUIZ.questions.length;
  let score = 0;
  const dimScore = {};
  TP_QUIZ.dimensions.forEach(d => dimScore[d.key] = 0);
  TP_QUIZ.questions.forEach((q, i) => {
    const oi = quizAnswers[i];
    if (oi == null) return;
    const s = q.options[oi].s;
    score += s;
    dimScore[q.dim] += s;
  });
  const grade = window.TP_GRADES(score);
  store.set('quiz_result', { score, grade: grade.title, date: todayStr(), dim: dimScore });

  const dims = TP_QUIZ.dimensions;
  const cx = 120, cy = 120, R = 80;
  const n = dims.length;
  const pt = (i, r) => {
    const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const rings = [0.33, 0.66, 1].map(k => {
    const pts = Array.from({length: n}, (_, i) => pt(i, R * k).join(',')).join(' ');
    return `<polygon class="ring" points="${pts}"/>`;
  }).join('');
  const axes = Array.from({length: n}, (_, i) => {
    const [x, y] = pt(i, R);
    return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
  }).join('');
  const dataPts = dims.map((d, i) => {
    const max = TP_QUIZ.questions.filter(q => q.dim === d.key).length * 10;
    const v = Math.min((dimScore[d.key] || 0) / max, 1);
    const [x, y] = pt(i, R * (0.15 + v * 0.85));
    return [x.toFixed(1), y.toFixed(1)];
  }).map(p => p.join(',')).join(' ');
  const labels = dims.map((d, i) => {
    const [x, y] = pt(i, R + 16);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${d.emoji}${d.name}</text>`;
  }).join('');

  return `
  <div class="anim" style="max-width:680px;margin:18px auto">
    <div class="panel" style="text-align:center">
      <div style="font-size:56px">${grade.emoji}</div>
      <h2 style="font-size:24px;font-weight:900;margin:8px 0">${esc(grade.title)}</h2>
      <div class="tiny">${score} / 100</div>
      <p class="muted" style="margin-top:14px;line-height:1.8">${esc(grade.desc)}</p>
      <div class="radar-wrap">
        <svg class="radar" viewBox="0 0 240 240">${rings}${axes}<polygon class="poly" points="${dataPts}"/>${labels}</svg>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px">
        <button class="btn btn-outline" id="shareQuiz">复制结果</button>
        <button class="btn btn-ghost" id="retakeQuiz">再来一次</button>
      </div>
    </div>
  </div>`;
}

/* ============ 页面：商店 ============ */
let shopState = { cat: '全部', sort: 'default' };
function pageShop(params) {
  shopState.cat = params.get('cat') || '全部';
  shopState.sort = params.get('sort') || 'default';
  let list = shopState.cat === '全部' ? [...TP_PRODUCTS] : TP_PRODUCTS.filter(p => p.category === shopState.cat);
  if (shopState.sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  if (shopState.sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  if (shopState.sort === 'sales') list.sort((a, b) => b.sales - a.sales);
  if (shopState.sort === 'rating') list.sort((a, b) => b.rating - a.rating);

  const catChips = TP_PRODUCT_CATS.map(c =>
    `<button class="chip ${shopState.cat === c ? 'active' : ''}" data-scat="${c}">${c}</button>`).join('');
  const sortChips = [
    ['default', '综合'], ['sales', '销量'], ['rating', '评分'], ['priceAsc', '价格↑'], ['priceDesc', '价格↓']
  ].map(([k, n]) => `<button class="chip sm ${shopState.sort === k ? 'active' : ''}" data-ssort="${k}">${n}</button>`).join('');

  const cards = list.map(p => `
    <div class="pd-card" data-open-product="${p.id}">
      <div class="pd-emoji">${p.emoji}</div>
      <div class="pd-body">
        <div class="pd-name">${esc(p.name)}</div>
        <div class="pd-rate"><span class="stars">★★★★★</span><span class="stars-v">${p.rating}</span></div>
        <div class="pd-foot">
          <div class="pd-price"><b>${fmtMoney(p.price)}</b><s>${fmtMoney(p.origPrice)}</s></div>
          <button class="cart-add-btn" data-addcart="${p.id}" aria-label="加入购物车">+</button>
        </div>
      </div>
    </div>`).join('');

  return `
  <div class="anim">
    <h3 class="sec-title">🛍️ 躺平商店</h3>
    <div class="filter-row">${catChips}</div>
    <div class="filter-row" style="margin-bottom:18px"><span class="tiny">排序</span>${sortChips}</div>
    <div class="pd-grid">${cards || '<div class="empty"><span class="e-ico">🫙</span>空空如也</div>'}</div>
  </div>`;
}

function pageProductDetail(id) {
  const p = TP_PRODUCTS.find(x => x.id === id);
  if (!p) return '<div class="empty"><span class="e-ico">🤔</span>商品不存在</div>';
  const fav = isFav(p.id);
  return `
  <div class="anim">
    <a class="back-link" href="#/shop">← 返回</a>
    <div class="pd-detail">
      <div class="pd-detail-media">${p.emoji}</div>
      <div class="pd-detail-info">
        <span class="tag">${p.category}</span>
        <div class="pd-detail-title">${esc(p.name)}</div>
        <div class="pd-detail-desc">${esc(p.desc)}</div>
        <div class="pd-rate"><span class="stars">★★★★★</span><span class="stars-v">${p.rating}</span><span class="tiny">已售 ${p.sales}</span></div>
        <div class="pd-detail-price"><span class="num">${fmtMoney(p.price)}</span><s>${fmtMoney(p.origPrice)}</s></div>
        <div class="service-tags" style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.tags.map(t => `<span style="background:var(--bg-soft);padding:5px 11px;border-radius:999px;font-size:12px;color:var(--ink-2)">#${esc(t)}</span>`).join('')}
        </div>
        <div class="buy-row">
          <div class="qty">
            <button id="pdMinus">−</button>
            <input id="pdQty" type="number" value="1" min="1" max="99">
            <button id="pdPlus">＋</button>
          </div>
          <button class="btn btn-outline" id="pdFav">${fav ? '❤️ 已收藏' : '🤍 收藏'}</button>
          <button class="btn btn-green" id="pdAdd" style="flex:1">加入购物车</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ============ 页面：购物车 ============ */
function pageCart() {
  const items = cartDetail();
  if (!items.length) {
    return `<div class="anim empty" style="padding-top:80px">
      <span class="e-ico">🛒</span>空空如也<br><br>
      <a class="btn btn-green" href="#/shop">随便看看</a>
    </div>`;
  }
  const rows = items.map(({ prod, qty }) => `
    <div class="cart-item">
      <div class="ci-emoji" data-open-product="${prod.id}">${prod.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${esc(prod.name)}</div>
        <div class="ci-price">${fmtMoney(prod.price)} × ${qty}</div>
      </div>
      <div class="qty sm">
        <button data-cart-minus="${prod.id}">−</button>
        <input type="number" value="${qty}" readonly>
        <button data-cart-plus="${prod.id}">＋</button>
      </div>
    </div>`).join('');
  return `
  <div class="anim">
    <h3 class="sec-title">购物车</h3>
    ${rows}
    <div class="cart-foot">
      <div class="total">合计 <b>${fmtMoney(cartTotal())}</b></div>
      <button class="btn btn-green" id="checkoutBtn" style="margin-left:auto">结算</button>
    </div>
  </div>`;
}

/* ============ 页面：FIRE 计算器 ============ */
function pageFire() {
  const f = getFireProfile();
  return `
  <div class="anim">
    <h3 class="sec-title">🔥 FIRE 计算器</h3>
    <div class="panel">
      <p class="muted" style="margin-bottom:16px;font-size:13.5px">4% 法则：年支出 × 25 即躺平目标金额。改任何数字，下面立刻出结果。</p>
      <div class="fire-grid">
        <div class="field"><label>当前存款（元）</label><input type="number" id="fPv" value="${f.pv}" min="0" step="10000"></div>
        <div class="field"><label>月支出（元）</label><input type="number" id="fExpense" value="${f.expense}" min="0" step="100"></div>
        <div class="field"><label>月收入（元）</label><input type="number" id="fIncome" value="${f.income}" min="0" step="100"></div>
        <div class="field"><label>年化收益率（%）</label><input type="number" id="fRate" value="${f.rate}" min="0" max="20" step="0.5"></div>
        <div class="field"><label>当前年龄</label><input type="number" id="fAge" value="${f.age}" min="18" max="80"></div>
        <div class="field"><label>目标退休年龄</label><input type="number" id="fRetireAge" value="${f.retireAge}" min="30" max="100"></div>
      </div>
    </div>
    <div id="fireResult"></div>
    <div class="tip-box" style="background:var(--orange-soft);color:var(--orange-deep);margin-top:18px">💛 小提示：FIRE 不是为了无所事事，是为了把时间花在喜欢的事上。</div>
    <div class="panel">
      <h3>🌿 低消费小贴士</h3>
      <div class="tip-box" style="margin-top:4px">① 外食变成"仪式"而不是"默认"，每月轻松省下上千元。</div>
      <div class="tip-box">② 先扔东西再买收纳，别让收纳用品制造新消费。</div>
      <div class="tip-box">③ 商品放进购物车，三天后还想买再下单。</div>
      <div class="tip-box">④ 通勤多走十分钟换房租便宜一千块，很划算。</div>
      <div class="tip-box">⑤ 留一笔"快乐基金"随便花，计划才撑得下去。</div>
    </div>
  </div>`;
}

function computeFire() {
  const pv = parseFloat($('#fPv').value) || 0;
  const expense = parseFloat($('#fExpense').value) || 0;
  const income = parseFloat($('#fIncome').value) || 0;
  const ratePct = parseFloat($('#fRate').value) || 4;
  const age = parseFloat($('#fAge').value) || 25;
  const retireAge = parseFloat($('#fRetireAge').value) || 45;
  store.set('fire_profile', { pv, expense, income, rate: ratePct, age, retireAge });

  const box = $('#fireResult');
  if (!box) return;
  if (expense <= 0) { box.innerHTML = ''; return; }
  const monthlySave = income - expense;
  const annualExpense = expense * 12;
  const target = annualExpense * 25;
  const r = ratePct / 100;
  const annualSave = monthlySave * 12;
  if (monthlySave <= 0) {
    box.innerHTML = `<div class="fire-result tip-box warn">月结余为 ${fmtMoney(monthlySave)}，复利还没有起点。先增加收入或降低支出，每月存下一点。</div>`;
    return;
  }
  let n;
  if (r === 0) n = Math.max(0, (target - pv) / annualSave);
  else {
    const denom = pv + annualSave / r;
    const x = (target + annualSave / r) / denom;
    n = x <= 1 ? 0 : Math.log(x) / Math.log(1 + r);
  }
  const projAge = age + n;
  const progress = Math.min(pv / target, 1) * 100;

  let tip = '';
  if (n > 0) {
    const exp2 = Math.max(0, expense - 1000);
    const target2 = exp2 * 12 * 25;
    let n2;
    if (r === 0) n2 = (target2 - pv) / annualSave;
    else { const x2 = (target2 + annualSave / r) / (pv + annualSave / r); n2 = x2 <= 1 ? 0 : Math.log(x2) / Math.log(1 + r); }
    const saved = Math.max(0, n - n2);
    tip = `<div class="tip-box">每月少花 ¥1,000，预计提前 <b>${saved.toFixed(1)}</b> 年躺平。</div>`;
  }

  box.innerHTML = `
    <div class="fire-result anim">
      <div class="tiny">躺平目标（年支出 × 25）</div>
      <div class="fire-big">${fmtMoney(target)}</div>
      <div style="margin-top:12px;font-size:14px">当前进度 <b style="color:var(--green)">${progress.toFixed(1)}%</b></div>
      <div class="fire-progress"><i style="width:${progress}%"></i></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;text-align:center">
        <div><div class="tiny">月结余</div><b style="font-size:17px;color:var(--green)">${fmtMoney(monthlySave)}</b></div>
        <div><div class="tiny">预计</div><b style="font-size:17px">${n < 1 ? '已达成' : n.toFixed(1) + ' 年后'}</b></div>
        <div><div class="tiny">年龄</div><b style="font-size:17px;color:var(--orange-deep)">${Math.round(projAge)} 岁</b></div>
      </div>
      <div class="tip-box" style="margin-top:16px">${n <= 0 ? '你已经存够了，可以认真考虑退休。' : (projAge <= retireAge ? '比目标 ' + retireAge + ' 岁还早，可以安心躺了。' : '比目标晚 ' + Math.round(projAge - retireAge) + ' 年，可提高储蓄率。')}</div>
      ${tip}
    </div>`;
}

/* ============ 页面：个人中心 ============ */
function pageProfile() {
  const days = checkinDays();
  const cult = cultivationOf(days);
  const qr = getQuizResult();
  const favCount = getFavs().length;
  const recs = getCheckins().slice().reverse().slice(0, 10);
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return `
  <div class="anim">
    <div class="profile-head">
      <div class="profile-avatar">${getAvatar()}</div>
      <div style="flex:1">
        <div style="font-size:19px;font-weight:900">${esc(getNickname())}</div>
        <span class="badge-level">${cult.emoji} ${cult.name}</span>
        <div class="tiny" style="margin-top:4px">累计打卡 ${days} 天</div>
      </div>
    </div>

    <div class="stats" style="margin-top:16px">
      <div class="stat-card"><b>${days}<span class="u">天</span></b><span>打卡</span></div>
      <div class="stat-card"><b>${Math.round(totalHours())}<span class="u">h</span></b><span>躺平时长</span></div>
      <div class="stat-card"><b>${Math.round(totalKcal())}<span class="u">kcal</span></b><span>消耗</span></div>
      <div class="stat-card"><b>${favCount}<span class="u">件</span></b><span>收藏</span></div>
    </div>

    <div class="panel">
      <h3>我的</h3>
      <div class="set-row" id="editName"><span class="sr-ico">✏️</span><div><div class="sr-t">昵称</div><div class="sr-d">点击修改，自动保存</div></div><span class="sr-v">${esc(getNickname())} ›</span></div>
      <div class="set-row" id="themeRow"><span class="sr-ico">🌙</span><div><div class="sr-t">深色模式</div><div class="sr-d">换个安静的底色</div></div><div class="switch ${dark ? 'on' : ''}" id="themeSwitch"></div></div>
      <div class="set-row" id="installRow"><span class="sr-ico">📲</span><div><div class="sr-t">安装到主屏幕</div><div class="sr-d">像 App 一样离线用</div></div><span class="sr-v">›</span></div>
      <a class="set-row" href="#/fire"><span class="sr-ico">🔥</span><div><div class="sr-t">FIRE 计算器</div><div class="sr-d">算算几岁能躺</div></div><span class="sr-v">›</span></a>
    </div>

    <div class="panel">
      <h3>最近测试</h3>
      ${qr ? `<div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:34px">${window.TP_GRADES(qr.score).emoji}</div>
        <div><b style="font-size:16px">${esc(qr.grade)}</b><div class="tiny">${qr.score} 分 · ${qr.date || ''}</div></div>
        <a class="btn btn-outline btn-sm" href="#/quiz" style="margin-left:auto">重测</a>
      </div>` : `<div class="tiny" style="padding:6px 0">还没测过，<a href="#/quiz" style="color:var(--green);font-weight:700">测测你有多躺 →</a></div>`}
    </div>

    <div class="panel">
      <h3>打卡记录</h3>
      ${recs.length ? recs.map(r => `<div class="set-row"><span class="sr-ico">😴</span><div><div class="sr-t">${r.date} · ${r.hours}h</div><div class="sr-d">摸鱼 ${r.index}/10 · ${Math.round(r.kcal)} 大卡</div></div></div>`).join('') : '<div class="tiny" style="padding:6px 0">还没有记录。</div>'}
    </div>
  </div>`;
}

/* ============ 页面：躺平树洞 ============ */
function pageFeed() {
  const posts = allFeedPosts();
  const likes = getFeedLikes();
  const allCmts = getFeedComments();
  const clikes = getFeedCLikes();
  const cards = posts.map(p => {
    const liked = likes.includes(p.id);
    const lk = (p.likes || 0) + (liked ? 1 : 0);
    const cs = (allCmts[p.id] || p.comments || []);
    return `<article class="feed-card">
      <div class="feed-head"><span class="feed-ava">${p.avatar}</span>
        <div><div class="feed-author">${esc(p.author)}</div><div class="tiny">${esc(p.mins)}</div></div></div>
      <p class="feed-text">${esc(p.text)}</p>
      <div class="feed-actions">
        <button class="feed-like ${liked ? 'on' : ''}" data-like="${p.id}">${liked ? '❤️' : '🤍'} ${lk}</button>
        <button class="feed-cmt" data-cmt="${p.id}">💬 ${cs.length} 条</button>
      </div>
      <div class="feed-cbox" id="cbox-${p.id}">
        ${cs.map((c, ci) => { const key = p.id + ':' + ci; const kon = clikes[key]; const cn = (c.likes || 0) + (kon ? 1 : 0); return `<div class="feed-c"><div class="feed-c-top"><b>${c.avatar} ${esc(c.author)}</b><span class="tiny">${esc(c.mins || '')}</span></div><div class="feed-c-text">${esc(c.text)}</div><button class="feed-clike ${kon ? 'on' : ''}" data-clike="${key}">${kon ? '❤️' : '🤍'} ${cn}</button></div>`; }).join('') || '<div class="tiny" style="padding:6px 0">还没人说，抢个沙发</div>'}
        <div class="feed-cinput"><input type="text" placeholder="说点什么…" data-cinput="${p.id}"><button data-csend="${p.id}">发</button></div>
      </div>
    </article>`;
  }).join('');
  return `
  <div class="anim">
    <h3 class="sec-title">💬 躺平树洞</h3>
    <div class="panel feed-compose">
      <textarea id="feedText" rows="2" placeholder="随便说点什么，这里没人认识你…"></textarea>
      <button class="btn btn-green" id="feedSend">说出来</button>
    </div>
    <div class="feed-list">${cards}</div>
  </div>`;
}

/* ============ 页面：今日躺平战报 ============ */
function pageReport() {
  const cks = getCheckins();
  const today = todayStr();
  const rec = cks.find(c => c.date === today);
  const streak = streakDays();
  const hours = Math.round(totalHours() * 10) / 10;
  const kcal = Math.round(totalKcal());
  const todayH = rec ? rec.hours : 0;
  const todayIdx = rec ? rec.index : 0;
  const todayK = rec ? Math.round(rec.kcal) : 0;
  const beat = Math.min(95, 35 + streak * 7 + Math.round(hours * 0.6));
  const grade = cultivationOf(cks.length);
  let line;
  if (streak >= 7) line = '连续躺平一周，已渐入佳境。';
  else if (streak >= 3) line = '势头不错，保持这个节奏。';
  else if (rec) line = '今天开了个好头，明天继续。';
  else line = '今天还没躺，现在开始也不晚。';
  const share = `【躺平战报】今天躺了 ${todayH} 小时，摸鱼 ${todayIdx}/10，约消耗 ${todayK} 大卡。已连续躺平 ${streak} 天，累计 ${hours} 小时，超过了 ${beat}% 的打工人。${grade.emoji} ${grade.name}。今天也辛苦了。`;
  return `
  <div class="anim report-wrap">
    <div class="report-card">
      <div class="report-deco">🛌</div>
      <div class="tiny" style="text-align:center">今日躺平战报</div>
      <h2 style="text-align:center;font-size:22px;font-weight:900;margin:6px 0 4px">${grade.emoji} ${grade.name}</h2>
      <div class="tiny" style="text-align:center">${today}</div>
      <div class="report-big">${todayH}<span class="u">h</span></div>
      <div class="tiny" style="text-align:center">今天躺了 ${todayH} 小时 · 摸鱼 ${todayIdx}/10 · 约 ${todayK} 大卡</div>
      <div class="report-stats">
        <div><b>${streak}<span class="u">天</span></b><span>连续</span></div>
        <div><b>${hours}<span class="u">h</span></b><span>累计</span></div>
        <div><b>${kcal}<span class="u">kcal</span></b><span>总消耗</span></div>
      </div>
      <div class="beat-bar"><i style="width:${beat}%"></i></div>
      <div class="tiny" style="text-align:center;margin-top:6px">超过了 <b style="color:var(--green)">${beat}%</b> 的打工人</div>
      <p class="report-line">${line}</p>
    </div>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
      <button class="btn btn-green" id="reportShare">复制战报</button>
      <a class="btn btn-ghost" href="#/">回到首页</a>
    </div>
  </div>`;
}

/* ============ 路由表 ============ */
const routes = {
  '': pageHome,
  'articles': pageArticles,
  'article': id => pageArticleDetail(id),
  'quiz': () => pageQuiz(),
  'shop': pageShop,
  'product': id => pageProductDetail(id),
  'cart': () => pageCart(),
  'fire': () => pageFire(),
  'feed': () => pageFeed(),
  'report': () => pageReport(),
  'profile': () => pageProfile()
};

function render() {
  const { page, arg, params } = parseHash();
  const main = $('#main');
  const fn = routes[page] || pageHome;
  main.innerHTML = fn(arg || params);
  bindPageEvents(page);
  syncNav(page);
  syncCartUI();
  window.scrollTo(0, 0);
}

function syncNav(page) {
  const map = { article: 'articles', product: 'shop', cart: 'shop' };
  const key = map[page] || page || 'home';
  $$('.nav-pc a, .tab-item').forEach(a => a.classList.toggle('active', a.dataset.nav === key));
}
function syncCartUI() {
  const n = cartCount();
  const el = $('#cartCnt');
  if (el) { el.textContent = n; el.style.display = n ? 'grid' : 'none'; }
}

/* ============ 事件绑定 ============ */
function bindPageEvents(page) {
  /* 一键打卡 */
  const bigBtn = $('#bigCheckin');
  if (bigBtn) bigBtn.addEventListener('click', () => {
    const rec = getCheckins().find(c => c.date === todayStr());
    const first = recordToday(rec ? rec.hours : 8);
    if (first) toast('今天也辛苦了 😌');
    render();
  });
  $$('[data-hours]').forEach(b => b.addEventListener('click', () => {
    recordToday(parseInt(b.dataset.hours, 10));
    render();
  }));

  /* 文章分类 */
  $$('[data-cat]').forEach(b => b.addEventListener('click', () => {
    const p = new URLSearchParams(); p.set('cat', b.dataset.cat); goto('articles', p);
  }));
  $$('[data-scat]').forEach(b => b.addEventListener('click', () => {
    const p = new URLSearchParams(); p.set('cat', b.dataset.scat); p.set('sort', shopState.sort); goto('shop', p);
  }));
  $$('[data-ssort]').forEach(b => b.addEventListener('click', () => {
    const p = new URLSearchParams(); p.set('cat', shopState.cat); p.set('sort', b.dataset.ssort); goto('shop', p);
  }));

  $$('[data-open-article]').forEach(el => el.addEventListener('click', () => { location.hash = '#/article/' + el.dataset.openArticle; }));
  $$('[data-open-product]').forEach(el => el.addEventListener('click', () => { location.hash = '#/product/' + el.dataset.openProduct; }));

  /* 双击文章正文点赞 */
  const detailBody = $('.art-detail-body');
  if (detailBody) {
    const aid = parseHash().arg;
    detailBody.addEventListener('dblclick', () => { toggleLike(aid); toast(isLiked(aid) ? '❤️ 已点赞' : '已取消点赞'); render(); });
  }

  /* 商品 */
  const pdQty = $('#pdQty');
  const pdMinus = $('#pdMinus'), pdPlus = $('#pdPlus');
  const pid = parseHash().arg;
  if (pdMinus) pdMinus.addEventListener('click', () => { pdQty.value = Math.max(1, (parseInt(pdQty.value, 10) || 1) - 1); });
  if (pdPlus) pdPlus.addEventListener('click', () => { pdQty.value = Math.min(99, (parseInt(pdQty.value, 10) || 1) + 1); });
  const pdAdd = $('#pdAdd');
  if (pdAdd) pdAdd.addEventListener('click', () => { addToCart(pid, parseInt(pdQty.value, 10) || 1); toast('已加入购物车'); });
  const pdFav = $('#pdFav');
  if (pdFav) pdFav.addEventListener('click', () => { toggleFav(pid); render(); });
  $$('[data-addcart]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); addToCart(b.dataset.addcart, 1); toast('已加入购物车');
  }));

  /* 购物车 */
  $$('[data-cart-plus]').forEach(b => b.addEventListener('click', () => {
    const c = getCart(); const h = c.find(x => x.id === b.dataset.cartPlus); if (h) h.qty++; saveCart(c); render();
  }));
  $$('[data-cart-minus]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.cartMinus; const h = getCart().find(x => x.id === id);
    if (h) { h.qty--; if (h.qty <= 0) setCartQty(id, 0); else saveCart(getCart()); }
    render();
  }));
  const checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    saveCart([]); toast('演示项目，不产生真实交易 🛌'); render();
  });

  /* 测试：选完自动跳下一题 */
  $$('.quiz-opt').forEach(b => b.addEventListener('click', () => {
    quizAnswers[quizIdx] = parseInt(b.dataset.opt, 10);
    setTimeout(() => { quizIdx++; render(); }, 200);
  }));
  const quizPrev = $('#quizPrev');
  if (quizPrev) quizPrev.addEventListener('click', () => { if (quizIdx > 0) { quizIdx--; render(); } });
  const retake = $('#retakeQuiz');
  if (retake) retake.addEventListener('click', () => { quizIdx = 0; quizAnswers = []; render(); });
  const shareQuiz = $('#shareQuiz');
  if (shareQuiz) shareQuiz.addEventListener('click', () => {
    const qr = getQuizResult(); const g = window.TP_GRADES(qr.score);
    copyText(`【躺平测试】我测出「${g.title}」（${qr.score}/100）${g.emoji}——${g.desc}`);
  });

  /* FIRE：oninput 自动算 */
  ['#fPv','#fExpense','#fIncome','#fRate','#fAge','#fRetireAge'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('input', computeFire);
  });
  if ($('#fPv')) computeFire();
  /* 战报 */
  const reportShare = $('#reportShare');
  if (reportShare) reportShare.addEventListener('click', () => {
    const rec = getCheckins().find(c => c.date === todayStr());
    const grade = cultivationOf(getCheckins().length);
    const hours = Math.round(totalHours() * 10) / 10;
    const streak = streakDays();
    const beat = Math.min(95, 35 + streak * 7 + Math.round(hours * 0.6));
    const todayH = rec ? rec.hours : 0, todayIdx = rec ? rec.index : 0, todayK = rec ? Math.round(rec.kcal) : 0;
    copyText(`【躺平战报】今天躺了 ${todayH} 小时，摸鱼 ${todayIdx}/10，约消耗 ${todayK} 大卡。已连续躺平 ${streak} 天，累计 ${hours} 小时，超过了 ${beat}% 的打工人。${grade.emoji} ${grade.name}。今天也辛苦了。`);
  });

  /* 树洞 */
  const feedSend = $('#feedSend');
  if (feedSend) feedSend.addEventListener('click', () => {
    const ta = $('#feedText'); const v = (ta.value || '').trim();
    if (!v) { toast('写两个字再发'); return; }
    addFeedPost(v); toast('说出来就轻松了'); render();
  });
  $$('[data-like]').forEach(b => b.addEventListener('click', () => { toggleFeedLike(b.dataset.like); render(); }));
  $$('[data-cmt]').forEach(b => b.addEventListener('click', () => {
    const box = $('#cbox-' + b.dataset.cmt);
    if (box) box.classList.toggle('open');
  }));
    $$('[data-clike]').forEach(b => b.addEventListener('click', () => { toggleFeedCLike(b.dataset.clike); render(); }));
$$('[data-csend]').forEach(b => b.addEventListener('click', () => {
    const inp = document.querySelector('[data-cinput="' + b.dataset.csend + '"]');
    const v = (inp && inp.value || '').trim();
    if (!v) return;
    addFeedComment(b.dataset.csend, v); toast('已回复'); render();
  }));

  /* 个人中心 */
  const editName = $('#editName');
  if (editName) editName.addEventListener('click', () => {
    const v = prompt('起个新昵称：', getNickname());
    if (v && v.trim()) { setStr('nickname', v.trim().slice(0, 12)); render(); }
  });
  const themeRow = $('#themeRow');
  if (themeRow) themeRow.addEventListener('click', () => $('#themeToggle').click());
  const installRow = $('#installRow');
  if (installRow) installRow.addEventListener('click', () => {
    if (deferredInstall) deferredInstall.prompt();
    else toast('用浏览器菜单选「添加到主屏幕」');
  });
}

/* ---------- 复制 ---------- */
function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(() => toast('已复制')).catch(() => fallbackCopy(t));
  } else fallbackCopy(t);
}
function fallbackCopy(t) {
  const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta);
  ta.select(); try { document.execCommand('copy'); toast('已复制'); } catch (e) {}
  document.body.removeChild(ta);
}

/* ---------- Toast（仅关键操作） ---------- */
let toastTimer = null;
function toast(msg) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---------- PWA 安装 ---------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });

/* ---------- 启动 ---------- */
function boot() {
  const backTop = $('#backTop');
  window.addEventListener('scroll', () => { if (backTop) backTop.classList.toggle('show', window.scrollY > 400); });
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const themeBtn = $('#themeToggle');
  const applyTheme = t => {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  };
  try { const saved = getStr('theme'); if (saved) applyTheme(saved); } catch (e) {}
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(cur); setStr('theme', cur);
  });

  window.addEventListener('hashchange', render);
  render();
  syncCartUI();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}

document.addEventListener('DOMContentLoaded', boot);
