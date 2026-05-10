/* ════════════════════════════════
   home.js — Home page logic
   ════════════════════════════════ */

/* ── Card HTML template ── */
function cardHTML(p, globalIdx) {
  const imgSrc = p.imgs && p.imgs[0] ? p.imgs[0] : '';
  const isSold = p.status === 'sold';
  const rank   = (p.extras||[]).find(e => ['Rank','rank'].includes(e.k));
  const skin   = (p.extras||[]).find(e => ['Skin','ຈຳນວນ Skin','skins'].includes(e.k));
  const hero   = (p.extras||[]).find(e => ['Hero','ຈຳນວນ Hero','heroes'].includes(e.k));

  /* href keeps URL meaningful for SEO + sharing */
  return `
  <a class="card" href="?p=${p.id}" onclick="openDetail(${globalIdx});return false">
    <div class="card-img-wrap">
      <div class="card-img">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'"/>`
          : GAMESVG}
        <div class="stag ${p.status}">${isSold ? 'ປິດແລ້ວ' : '✓ ພ້ອມເສີບ'}</div>
        ${p.isNew ? `<div class="badge-new">NEW</div>` : ''}
        <div class="card-stats">
          ${hero ? `<div class="cs">👤 ${hero.v}</div>` : ''}
          ${skin ? `<div class="cs">✨ ${skin.v}</div>` : ''}
          ${rank ? `<div class="cs">${rankIcon(rank.v.split(' ')[0])} ${rank.v}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-id">${p.title}</div>
      <div class="card-game">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="6"/>
          <path d="M6 12h4M8 10v4"/>
          <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>
        </svg>
        ${p.game}
      </div>
      <div>
        <span class="card-price">${fmt(p.price)}</span>
        <span style="font-size:.68rem;color:var(--orl);margin-left:3px">ກຣີບ ✅</span>
        ${p.oldPrice ? `<span class="card-price-old">${fmt(p.oldPrice)}</span>` : ''}
      </div>
      <div class="card-date">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        ${p.date || ''}
      </div>
      <div class="${isSold ? 'card-btn sold-btn' : 'card-btn'}">
        ${isSold
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
               <rect x="3" y="11" width="18" height="11" rx="2"/>
               <path d="M7 11V7a5 5 0 0110 0v4"/>
             </svg> ປິດແລ້ວ`
          : `ເບິ່ງລາຍລະອຽດ
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <polyline points="9 18 15 12 9 6"/>
             </svg>`}
      </div>
    </div>
  </a>`;
}

/* ── Intersection Observer for slide-in (เลื่อนลงเท่านั้น) ── */
let _observer = null;

function _initObserver() {
  if (_observer) _observer.disconnect();
  _observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // เข้า viewport → animate แล้วหยุด observe (ไม่ reset เมื่อเลื่อนขึ้น)
        entry.target.classList.add('slide-in');
        _observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
}

/* Re-observe cards เมื่อกลับมาหน้าโฮม */
function reObserveGrid() {
  const g = document.getElementById('grid');
  if (!g) return;
  _initObserver();
  g.querySelectorAll('.card').forEach(card => {
    card.classList.remove('slide-in');
    _observer.observe(card);
  });
}

/* ── Grid ── */
function _setLoader(show) {
  const loader = document.querySelector('#gridWrap .loading-wrap');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

function renderGrid(list) {
  displayList = list;
  const g = document.getElementById('grid');
  _setLoader(false);
  if (!list.length) {
    g.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.25)">ບໍ່ມີລາຍການ</div>`;
    return;
  }
  g.innerHTML = list.map(p => cardHTML(p, products.indexOf(p))).join('');
  _initObserver();
  g.querySelectorAll('.card').forEach(card => _observer.observe(card));
}

/* ── Sort ── */
let currentSort = 'newest';

function sortBy(el, mode) {
  document.querySelectorAll('.sc:not(.cat-sc)').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  applySort(mode);
}

function applySort(mode) {
  if (mode) currentSort = mode;
  let list = [...products];
  _sortList(list, currentSort);
  renderGrid(list);
}

function _sortList(list, mode) {
  if (mode === 'newest')     list.sort((a,b) => new Date(b.created_at||b.date||0) - new Date(a.created_at||a.date||0));
  else if (mode === 'oldest') list.sort((a,b) => new Date(a.created_at||a.date||0) - new Date(b.created_at||b.date||0));
  else if (mode === 'price_asc')  list.sort((a,b) => a.price - b.price);
  else if (mode === 'price_desc') list.sort((a,b) => b.price - a.price);
}

/* ── Price search ── */
function onPriceInput(el) {
  const raw = el.value.replace(/[^0-9]/g, '');
  el.value  = raw ? Number(raw).toLocaleString() : '';
  document.getElementById('priceSearchClear').classList.toggle('show', raw.length > 0);
}

function doPriceSearch() {
  const raw = document.getElementById('priceSearchInput').value.replace(/[^0-9]/g, '');
  if (!raw) { clearPriceSearch(); return; }
  const target = parseInt(raw);
  const tol    = target * 0.20;
  const near   = products
    .filter(p => Math.abs(p.price - target) <= tol)
    .sort((a,b) => Math.abs(a.price - target) - Math.abs(b.price - target));

  const g = document.getElementById('grid');
  if (!near.length) {
    g.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 16px">
        <div style="font-size:2.2rem;margin-bottom:10px">🔍</div>
        <div style="font-size:.88rem;font-weight:700;color:var(--muted);line-height:1.7">
          ບໍ່ມີໄອດີງົບ <span style="color:var(--or)">${Number(target).toLocaleString()}</span> ກຣີບ<br>
          <span style="font-size:.75rem;opacity:.7">ລອງໃສ່ງົບອື່ນ ຫຼື ກົດ ✕ ເພື່ອດູທັງໝົດ</span>
        </div>
      </div>`;
    return;
  }

  const hasExact = near.some(p => p.price === target);
  displayList    = near;
  const badge    = document.getElementById('countBadge');
  if (badge) badge.textContent = near.length;

  g.innerHTML =
    `<div class="price-result-label" style="grid-column:1/-1">
      ${hasExact
        ? `✅ ພົບໄອດີງົບ ${Number(target).toLocaleString()} ກຣີບ (${near.length} ລາຍການ)`
        : `🔎 ໄອດີງົບທີ່ໃກ້ຄຽງ ${Number(target).toLocaleString()} ກຣີບ (${near.length} ລາຍການ)`}
    </div>` +
    near.map(p => cardHTML(p, products.indexOf(p))).join('');

  /* fix: init observer ให้การ์ดใหม่ slide-in ได้ */
  _initObserver();
  g.querySelectorAll('.card').forEach(card => _observer.observe(card));
}

function clearPriceSearch() {
  document.getElementById('priceSearchInput').value = '';
  document.getElementById('priceSearchClear').classList.remove('show');
  renderGrid(products);
}

/* ── Stats (hero counters) ── */
function updateStats() {
  const avail = products.filter(p => p.status === 'avail').length;
  const sold  = products.filter(p => p.status === 'sold').length;
  const sAvail = document.getElementById('sAvail');
  const sTotal = document.getElementById('sTotal');
  const sSold  = document.getElementById('sSold');
  if (sAvail) sAvail.textContent = avail;
  if (sTotal) sTotal.textContent = products.length;
  if (sSold)  sSold.textContent  = sold;
}
