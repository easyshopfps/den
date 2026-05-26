/* ════════════════════════════════
   data.js — Supabase data loaders
   ════════════════════════════════ */

/* ── Cache keys ── */
const CACHE_KEY    = 'shop_products_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function _parseProducts(data) {
  return data.map(row => ({
    id:         row.id,
    title:      row.title,
    game:       row.game,
    price:      row.price,
    oldPrice:   row.old_price,
    status:     row.status,
    date:       row.date,
    isNew:      row.is_new,
    imgs:       row.imgs || [],
    desc:       row.description || '',
    extras:     Array.isArray(row.extras) ? row.extras : [],
    created_at: row.created_at || ''
  }));
}

function _saveCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }));
  } catch(e) { /* storage full — ignore */ }
}

function _loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null; // expired
    return data;
  } catch(e) { return null; }
}

/* ── Products ──
   1. ถ้ามี cache → แสดงทันที แล้ว sync ใน background
   2. ถ้าไม่มี cache → โหลดปกติ
*/
async function loadProducts() {
  const cached = _loadCache();

  if (cached) {
    // แสดง cache ก่อนเลย = เร็วมาก
    // แล้ว sync ข้อมูลใหม่ใน background โดยไม่บล็อก UI
    _syncProductsInBackground();
    return cached;
  }

  // ไม่มี cache → โหลดปกติ
  try {
    const data = await sbFetch('/rest/v1/products?select=*&order=created_at.desc');
    const list = _parseProducts(data);
    _saveCache(list);
    return list;
  } catch (e) {
    console.error('[data] loadProducts:', e);
    return [];
  }
}

/* sync ใน background — อัพเดต UI ถ้าข้อมูลเปลี่ยน */
async function _syncProductsInBackground() {
  try {
    const data = await sbFetch('/rest/v1/products?select=*&order=created_at.desc');
    const fresh = _parseProducts(data);
    _saveCache(fresh);
    // เช็คว่าข้อมูลเปลี่ยนไหม (เทียบ id+status คร่าวๆ)
    const oldSig = products.map(p => p.id + p.status).join(',');
    const newSig = fresh.map(p => p.id + p.status).join(',');
    if (oldSig !== newSig) {
      products = fresh;
      renderGrid(products);
      updateStats();
    }
  } catch(e) { /* silent fail — cache ยังใช้ได้ */ }
}

/* ── Banners ── */
let bannerIdx   = 0;
let bannerTotal = 0;
let bannerTimer = null;

async function loadBanners() {
  try {
    // ດຶງ ads ທີ່ is_active = true ກ່ອນ (ລະບົບໂຄສະນາໃໝ່)
    let slides = [];
    try {
      const adsData = await sbFetch('/rest/v1/ads?select=*&is_active=eq.true&order=sort_order.asc');
      if(adsData && adsData.length) {
        slides = adsData.map(a => ({
          img: a.img_url,
          url: a.type === 'internal' && a.product_id ? `?p=${a.product_id}` : (a.dest_url || null)
        })).filter(s => s.img);
      }
    } catch(e) { /* fallback to old banners */ }

    // ຖ້າ ads ຫວ່າງ → ໃຊ້ banners table ເດີມ
    if(!slides.length) {
      const data = await sbFetch('/rest/v1/banners?select=*&order=sort_order.asc');
      slides = (data||[]).map(r => ({ img: r.img_url, url: r.link_url || null })).filter(s => s.img);
    }

    if (!slides.length) { _hideBanner(); return; }
    _renderBanner(slides);
  } catch (e) {
    _hideBanner();
  }
}

function _hideBanner() {
  const w = document.getElementById('bannerWrap');
  if (w) w.style.display = 'none';
}

function _renderBanner(slides) {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  track.innerHTML = slides.map(s =>
    s.url
      ? `<div class="banner-slide" onclick="openLink('${s.url}')" style="cursor:pointer"><img src="${s.img}" alt="banner" loading="lazy"/></div>`
      : `<div class="banner-slide"><img src="${s.img}" alt="banner" loading="lazy"/></div>`
  ).join('');
  bannerTotal = slides.length;
  if (slides.length > 1) {
    if (bannerTimer) clearInterval(bannerTimer);
    bannerTimer = setInterval(() => goBanner((bannerIdx + 1) % slides.length), 3500);
  }
}

function goBanner(n) {
  if (!bannerTotal) return;
  bannerIdx = ((n % bannerTotal) + bannerTotal) % bannerTotal;
  const track = document.getElementById('bannerTrack');
  if (track) track.style.transform = `translateX(-${bannerIdx * 100}%)`;
}

/* ── Announcement ── */
async function loadAnnouncement() {
  try {
    const data = await sbFetch(
      '/rest/v1/announcements?select=*&is_active=eq.true&order=created_at.desc&limit=1'
    );
    if (!data || !data.length) return;
    const el  = document.getElementById('annText');
    const bar = document.getElementById('announceBar');
    if (!el || !bar) return;
    el.textContent  = data[0].message;
    bar.style.display = 'flex';
    requestAnimationFrame(() => {
      const container = el.parentElement;
      const textW     = el.scrollWidth;
      const contW     = container.offsetWidth;
      const duration  = Math.max(10, (textW + contW) / 75);
      el.style.setProperty('--ann-start', contW + 'px');
      el.style.setProperty('--ann-end',   '-' + textW + 'px');
      el.style.animation = `marquee ${duration}s linear infinite`;
    });
  } catch (e) {
    console.warn('[data] loadAnnouncement:', e);
  }
}

/* ── Categories (dynamic from DB) ── */
async function loadCategories() {
  try {
    const data = await sbFetch('/rest/v1/categories?select=*&order=sort_order.asc');
    if (!data || !data.length) return null;
    return data; // [{id, name, img_url, sort_order}]
  } catch(e) {
    console.warn('[data] loadCategories:', e);
    return null;
  }
}

/* ── Contact info (dynamic from DB) ── */
async function loadContactInfo() {
  try {
    const data = await sbFetch('/rest/v1/contacts?select=*&limit=1');
    if (!data || !data.length) return null;
    return data[0];
  } catch(e) {
    console.warn('[data] loadContactInfo:', e);
    return null;
  }
}
 */
async function loadConfig() {
  try {
    const cfg = await sbFetch('/rest/v1/web_config?select=*&limit=1');
    if (!cfg || !cfg.length) return;
    const c = cfg[0];

    if (c.theme === 'light') document.body.classList.add('light-mode');

    if (c.cat_layout === '2col') {
      const row = document.getElementById('catRow');
      if (row) row.classList.add('two-col');
    }

    if (c.card_bg) {
      const st = document.createElement('style');
      const light = isLight(c.card_bg);
      st.textContent = `.card{background:${c.card_bg}!important}
        .card-id{color:${light?'#1a1a1a':'#fff'}!important}
        .card-game{color:${light?'#888':'rgba(255,255,255,0.6)'}!important}`;
      document.head.appendChild(st);
    }

    if (c.sort_bg) {
      const st2 = document.createElement('style');
      const light2 = isLight(c.sort_bg);
      st2.textContent = `.sort-card{background:${c.sort_bg}!important;border-color:${light2?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.1)'}!important}
        .sort-label{color:${light2?'#888':'rgba(255,255,255,0.6)'}!important}`;
      document.head.appendChild(st2);
    }

    if (c.detail_theme) applyDetailTheme(c.detail_theme);

    if (c.font) {
      const fontMap = {
        noto_sans:  "'Noto Sans Lao', sans-serif",
        noto_serif: "'Noto Serif Lao', serif",
        phetsarath: "'Phetsarath OT', 'Noto Sans Lao', sans-serif",
        souliyo:    "'Souliyo Unicode', 'Noto Sans Lao', sans-serif"
      };
      const fv = fontMap[c.font];
      if (fv) {
        const sf = document.createElement('style');
        sf.textContent = `body,.card-id,.card-game,.detail-title,.detail-body,
          .price-search-input,.sort-label,.sc,.wa-btn,.hero p,.logo-main,.logo-sub,
          .sec-title,.all-ids-title,.cat-title,.foot-brand,.card-btn,
          .price-result-label,.ann-text,.price-search-btn,.buy-btn,
          .detail-back,.foot-wa,.cat-page-back{font-family:${fv}!important}`;
        document.head.appendChild(sf);
      }
    }
  } catch (e) {
    /* ignore — use defaults */
  }
}
