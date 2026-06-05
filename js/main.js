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
                ? `<img src="${c.img_url}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'" style="width:100%;aspect-ratio:3/1;object-fit:cover;display:block"/>`
                : `<div style="width:100%;aspect-ratio:3/1;background:rgba(255,107,26,0.1);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:rgba(255,255,255,0.5)">${c.name}</div>`}
            </div>
            <div id="catinfo_${c.name.replace(/\s/g,'_')}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#0D1B35">
              <span style="font-size:.92rem;font-weight:800;color:#fff">${c.name}</span>
              <span class="cat-count-${c.name.replace(/\s/g,'_')}" style="font-size:.75rem;font-weight:700;color:rgba(255,255,255,0.45)">... ໄອດີ</span>
            </div>
          </div>`).join('');
      }
    }

    /* 4. Products */
    products = await loadProducts();

    /* 5. Render grid */
    renderGrid(products);
    updateStats();

    /* 5b. Update category product counts now that products are loaded */
    if (cats && cats.length) {
      cats.forEach(c => {
        const key = c.name.replace(/\s/g,'_');
        const els = document.querySelectorAll(`.cat-count-${key}`);
        const count = products.filter(p => p.game === c.name).length;
        els.forEach(el => { el.textContent = 'ມີ' + count + ' ໄອດີ'; });
      });
    }

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

