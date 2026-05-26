/* ════════════════════════════════
   main.js — App entry point
   Boots everything in order
   ════════════════════════════════ */

async function init() {
  try {
    /* 1. Config (theme/font) must run first so UI looks right immediately */
    await loadConfig();

    /* 2. Banner + announcement can load in parallel */
    await Promise.all([loadBanners(), loadAnnouncement()]);

    /* 3. Products */
    products = await loadProducts();

    /* 4. Render home grid */
    renderGrid(products);
    updateStats();

    /* 5. Handle deep-link URL (e.g. ?p=123 or ?cat=Mobile Legends) */
    handleInitialRoute();

  } catch (err) {
    console.error('[main] init failed:', err);
  } finally {
    /* Always hide loader */
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('hide');
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }
}

/* Boot when DOM is ready */
document.addEventListener('DOMContentLoaded', init);
