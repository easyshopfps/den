/* ════════════════════════════════
   main.js — App entry point
   Boots everything in order
   ════════════════════════════════ */

async function init() {
  try {
    /* 1. Config (theme/font) must run first so UI looks right immediately */
    await loadConfig();

    /* 2. Banner + announcement + categories can load in parallel */
    const [_, __, cats] = await Promise.all([
      loadBanners(),
      loadAnnouncement(),
      loadCategories()
    ]);

    /* 3. Render category row dynamically */
    _renderCategoryRow(cats);

    /* 4. Products */
    products = await loadProducts();

    /* 5. Render home grid */
    renderGrid(products);
    updateStats();

    /* 6. Handle deep-link URL (e.g. ?p=123 or ?cat=Mobile Legends) */
    handleInitialRoute();

  } catch (err) {
    console.error('[main] init failed:', err);
  } finally {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('hide');
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }
}

/* ── Render category row from DB data ── */
function _renderCategoryRow(cats) {
  const row = document.getElementById('catRow');
  if (!row) return;

  // Fallback if DB returned nothing
  const fallback = [
    { name: 'Mobile Legends', img_url: 'https://img1.pic.in.th/images/7923.jpg' },
    { name: 'Free Fire',      img_url: 'https://img1.pic.in.th/images/7925.png' }
  ];

  const list = (cats && cats.length) ? cats : fallback;

  row.innerHTML = list.map(c => `
    <div class="cat-item" onclick="openCatPage('${c.name.replace(/'/g,"\\'")}')">
      <div class="cat-img">
        ${c.img_url
          ? `<img src="${c.img_url}" alt="${c.name}" loading="lazy" width="600" height="200" onerror="this.style.display='none'"/>`
          : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:.85rem;font-weight:700;color:rgba(255,255,255,0.5)">${c.name}</div>`}
      </div>
    </div>`).join('');
}

/* Boot when DOM is ready */
document.addEventListener('DOMContentLoaded', init);
