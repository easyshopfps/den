/* ════════════════════════════════
   router.js — URL routing
   URLs:
     /         → home
     ?p=ID     → detail
     ?cat=GAME → category
   ════════════════════════════════ */

function getParams() {
  return new URLSearchParams(window.location.search);
}

function pushState(params, stateObj = {}) {
  const url = params ? `?${params.toString()}` : location.pathname;
  history.pushState(stateObj, '', url);
}

/* Called on browser back/forward */
window.addEventListener('popstate', () => {
  const params = getParams();
  const pid    = params.get('p');
  const cat    = params.get('cat');
  if (pid) {
    const idx = products.findIndex(p => String(p.id) === pid);
    if (idx !== -1) { _openDetail(idx); return; }
  }
  if (cat) { _openCatPage(cat); return; }
  _showHomeNoHistory();
});

/* Navigate to detail (updates URL) */
function openDetail(idx) {
  const p = products[idx];
  if (!p) return;
  const params = new URLSearchParams();
  params.set('p', p.id);
  pushState(params, { page: 'detail', idx });
  setSEOMeta({
    title:       `${p.title} · ${p.game} · ພໍ່ຄ້າໜ້າຫວານ`,
    description: `ໄອດີ ${p.game} ລາຄາ ${fmt(p.price)} ກຣີບ · ${p.status === 'avail' ? 'ພ້ອມເສີບ' : 'ປິດແລ້ວ'}`,
    image:       p.imgs && p.imgs[0] ? p.imgs[0] : '',
    url:         location.href
  });
  _openDetail(idx);
}

/* Navigate to category (updates URL) */
function openCatPage(game) {
  const params = new URLSearchParams();
  params.set('cat', game);
  pushState(params, { page: 'cat', game });
  setSEOMeta({
    title:       `${game} · ພໍ່ຄ້າໜ້າຫວານ`,
    description: `ໄອດີ ${game} ທັງໝົດ ລາຄາຖືກ`,
    image:       '',
    url:         location.href
  });
  _openCatPage(game);
}

/* Navigate home (updates URL + resets SEO) */
function showHome() {
  pushState(null);
  setSEOMeta({
    title:       'ພໍ່ຄ້າໜ້າຫວານ · Game ID Shop',
    description: 'ຮ້ານຂາຍໄອດີເກມ ລາຄາຖືກ ຈ່າຍໄດ້ທັນທີ',
    image:       '',
    url:         location.pathname
  });
  _showHomeNoHistory();
}

/* Internal: show home without touching history */
function _showHomeNoHistory() {
  document.getElementById('detailPage').classList.remove('show');
  document.getElementById('catPage').classList.remove('show');
  document.getElementById('homePage').style.visibility = '';
  document.body.style.overflow = '';
  window.scrollTo(0, 0);
  // Re-observe cards ให้ animation ทำงานอีกครั้ง
  if (typeof reObserveGrid === 'function') reObserveGrid();
}

/* Handle deep-link on first load */
function handleInitialRoute() {
  const params = getParams();
  const pid    = params.get('p');
  const cat    = params.get('cat');
  if (pid) {
    const idx = products.findIndex(p => String(p.id) === pid);
    if (idx !== -1) { _openDetail(idx); return; }
  }
  if (cat) { _openCatPage(cat); return; }
}
