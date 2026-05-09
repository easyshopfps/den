/* ════════════════════════════════
   category.js — Category page logic
   ════════════════════════════════ */

let currentCat     = 'all';
let catCurrentSort = 'newest';

/* Called by router after URL is set */
function _openCatPage(game) {
  currentCat     = game;
  catCurrentSort = 'newest';

  /* แสดงหน้าก่อนเลย ไม่ต้องรอ render */
  document.getElementById('catPage').classList.add('show');
  document.getElementById('detailPage').classList.remove('show');
  document.getElementById('homePage').style.visibility = 'hidden';
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  /* Set page title */
  document.getElementById('catPageTitle').textContent = game;

  /* Reset sort chips */
  document.querySelectorAll('.cat-sc').forEach(c => c.classList.remove('active'));
  const first = document.querySelector('.cat-sc');
  if (first) first.classList.add('active');

  /* Reset price search */
  const inp = document.getElementById('catPriceSearchInput');
  const clr = document.getElementById('catPriceSearchClear');
  if (inp) inp.value = '';
  if (clr) clr.classList.remove('show');

  /* แสดง dot loader */
  const catLoader = document.getElementById('catLoader');
  const g = document.getElementById('catGrid');
  if (catLoader) catLoader.style.display = 'flex';
  g.innerHTML = '';

  /* render ใน next frame ให้ UI ไม่กระตุก */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      renderCatGrid();
    });
  });
}


/* ── Grid ── */
function renderCatGrid() {
  const catLoader = document.getElementById('catLoader');
  if (catLoader) catLoader.style.display = 'none';
  let list = products.filter(p => p.game === currentCat);
  _sortList(list, catCurrentSort);
  const g = document.getElementById('catGrid');
  if (!list.length) {
    g.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.35)">ບໍ່ມີໄອດີໃນຂະນະນີ້</div>`;
    return;
  }
  g.innerHTML = list.map(p => cardHTML(p, products.indexOf(p))).join('');
  _initObserver();
  g.querySelectorAll('.card').forEach(card => _observer.observe(card));
}

/* ── Sort ── */
function catSortBy(el, mode) {
  document.querySelectorAll('.cat-sc').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  catCurrentSort = mode;
  renderCatGrid();
}

/* ── Close ── */
function closeCatPage() { showHome(); }

/* ── Price search ── */
function onCatPriceInput(el) {
  const raw = el.value.replace(/[^0-9]/g, '');
  el.value  = raw ? Number(raw).toLocaleString() : '';
  document.getElementById('catPriceSearchClear').classList.toggle('show', raw.length > 0);
}

function doCatPriceSearch() {
  const raw = document.getElementById('catPriceSearchInput').value.replace(/[^0-9]/g, '');
  if (!raw) { clearCatPriceSearch(); return; }
  const target      = parseInt(raw);
  const tol         = target * 0.20;
  const catProducts = products.filter(p => p.game === currentCat);
  const near        = catProducts
    .filter(p => Math.abs(p.price - target) <= tol)
    .sort((a,b) => Math.abs(a.price - target) - Math.abs(b.price - target));

  const g = document.getElementById('catGrid');
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
  g.innerHTML =
    `<div class="price-result-label" style="grid-column:1/-1">
      ${hasExact
        ? `✅ ພົບໄອດີງົບ ${Number(target).toLocaleString()} ກຣີບ (${near.length} ລາຍການ)`
        : `🔎 ໄອດີງົບທີ່ໃກ້ຄຽງ ${Number(target).toLocaleString()} ກຣີບ (${near.length} ລາຍການ)`}
    </div>` +
    near.map(p => cardHTML(p, products.indexOf(p))).join('');
}

function clearCatPriceSearch() {
  document.getElementById('catPriceSearchInput').value = '';
  document.getElementById('catPriceSearchClear').classList.remove('show');
  renderCatGrid();
}
