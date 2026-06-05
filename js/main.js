/* ════════════════════════════════
   main.js — App entry point
   Boots everything in order
   ════════════════════════════════ */

async function init() {
  try {
    /* 1. Config (theme/font) first */
    await loadConfig();

    /* 2. WA number + banner + announcement + categories in parallel */
    const [,,,cats] = await Promise.all([
      loadWaNumber(),
      loadBanners(),
      loadAnnouncement(),
      loadCategories()
    ]);

    /* 3. Render category row if DB has data */
    if (cats && cats.length) {
      const row = document.getElementById('catRow');
      if (row) {
        row.innerHTML = cats.map(c => `
          <div class="cat-item" onclick="openCatPage('${c.name.replace(/'/g,"\\'")}')">
            <div class="cat-img">
              ${c.img_url
                ? `<img src="${c.img_url}" alt="${c.name}" loading="lazy" width="600" height="200" onerror="this.style.display='none'"/>`
                : `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:.85rem;font-weight:700;color:rgba(255,255,255,0.5)">${c.name}</span>`}
            </div>
          </div>`).join('');
      }
    }

    /* 4. Products */
    products = await loadProducts();

    /* 5. Render grid */
    renderGrid(products);
    updateStats();

    /* 6. Route */
    handleInitialRoute();

    /* 7. Ads popup — after everything loads (non-blocking) */
    loadAdsPopup();

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

/* Boot when DOM is ready */
document.addEventListener('DOMContentLoaded', init);

