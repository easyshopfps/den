/* ════════════════════════════════
   detail.js — Product detail page
   ════════════════════════════════ */

let currentIdx = 0;

/* Called by router after URL is set */
function _openDetail(idx) {
  currentIdx   = idx;
  const p      = products[idx];
  if (!p) return;
  const isSold = p.status === 'sold';
  const imgs   = (p.imgs && p.imgs.length) ? p.imgs : [];

  /* ── Main image ── */
  const mainImg  = document.getElementById('dMainImg');
  const existImg = mainImg.querySelector('img');
  if (existImg) existImg.remove();
  if (imgs[0]) {
    const img    = document.createElement('img');
    img.src      = imgs[0];
    img.alt      = p.title;
    img.loading  = 'lazy';
    img.onerror  = () => img.style.display = 'none';
    mainImg.prepend(img);
  }

  /* ── Thumbnail strip ── */
  const strip         = document.getElementById('dThumbStrip');
  strip.style.display = imgs.length > 1 ? 'flex' : 'none';
  strip.innerHTML     = imgs.map((src, i) =>
    `<div class="thumb ${i===0?'active':''}" onclick="switchImg('${src}',this)">
      <img src="${src}" alt="" loading="lazy" onerror="this.style.display='none'"/>
    </div>`
  ).join('');

  /* ── Breadcrumb ── */
  document.getElementById('dCrumb').innerHTML = `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    ໜ້າຫຼັກ
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    ${p.game}
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    ${p.title}`;

  /* ── Title ── */
  document.getElementById('dTitle').textContent = p.title;

  /* ── Meta chips ── */
  document.getElementById('dMeta').innerHTML = `
    <div class="dmeta">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="6"/>
        <path d="M6 12h4M8 10v4"/>
      </svg>
      ${p.game}
    </div>
    ${p.isNew ? `<div class="dmeta" style="background:rgba(255,107,26,0.15);color:var(--or)">🆕 NEW</div>` : ''}`;

  /* ── Status row ── */
  document.getElementById('dStatusRow').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
      ${p.date
        ? `<span style="display:flex;align-items:center;gap:4px;font-size:.75rem;color:#aaa;font-weight:600">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
               <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
             </svg>
             ${p.date}
           </span>`
        : ''}
      <div class="detail-status-pill ${p.status}" style="margin-bottom:0">
        ${isSold
          ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
               <rect x="3" y="11" width="18" height="11" rx="2"/>
               <path d="M7 11V7a5 5 0 0110 0v4"/>
             </svg> ປິດແລ້ວ`
          : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
               <polyline points="20 6 9 17 4 12"/>
             </svg> ພ້ອມເສີບ`}
      </div>
    </div>`;

  /* ── Price box ── */
  document.getElementById('dPriceBox').innerHTML = `
    <div class="dp-lbl">ຄ່າໂຕ</div>
    <div>
      <span class="dp-val">${fmt(p.price)}</span>
      <span class="dp-unit">ກຣີບ ✅</span>
    </div>
    ${p.oldPrice ? `<div class="dp-old">${fmt(p.oldPrice)} ກຣີບ ✅</div>` : ''}`;

  /* ── Extras table + description ── */
  const extrasHtml = p.extras && p.extras.length
    ? `<div class="detail-section-title">ລາຍລະອຽດ</div>
       <div class="detail-table">
         ${p.extras.map(e => `<div class="drow"><span class="dk">${e.k}</span><span class="dv">${e.v}</span></div>`).join('')}
       </div>`
    : '';

  const descHtml = p.desc
    ? `<div class="detail-section-title">ລາຍລະອຽດ</div>
       <div style="font-size:.88rem;color:#bbb;line-height:1.75">${p.desc.replace(/\n/g,'<br>')}</div>`
    : `<div class="detail-section-title">ລາຍລະອຽດ</div>
       <div style="font-size:.88rem;color:#bbb;line-height:1.75">ທັກຫາແອັດມິນເພື່ອດູເພີ່ມຕື່ມ</div>`;

  document.getElementById('dNote').innerHTML = extrasHtml + descHtml;

  /* ── Buy button ── */
  document.getElementById('dBuyBtn').innerHTML = isSold
    ? `<button class="buy-btn disabled" disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        ປິດແລ້ວ
      </button>`
    : `<button onclick="handleBuyClick(${idx})" class="buy-btn">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.306A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.031-1.094l-.29-.172-2.952.775.787-2.873-.189-.295A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
        ສັ່ງຊື້ດຽວນີ້ເລີຍ!
      </button>`;

  /* ── Show page ── */
  document.getElementById('detailPage').classList.add('show');
  document.getElementById('homePage').style.visibility = 'hidden';
  document.getElementById('catPage').classList.remove('show');
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
}

/* ── Image switch ── */
function switchImg(src, el) {
  const main = document.querySelector('#dMainImg img');
  if (main) {
    main.classList.add('fading');
    setTimeout(() => {
      main.src   = src;
      main.style.display = '';
      main.classList.remove('fading');
    }, 200);
  }
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ── Detail dark theme ── */
function applyDetailTheme(mode) {
  const styleId = 'detail-dark-style';
  let st = document.getElementById(styleId);
  if (mode === 'dark') {
    if (!st) { st = document.createElement('style'); st.id = styleId; document.head.appendChild(st); }
    st.textContent = `
      #detailPage{background:#0D1B35!important}
      #detailPage .detail-back{background:#122040;border-bottom-color:rgba(255,255,255,0.07);color:#FF8C42}
      #detailPage .detail-img-wrap,#detailPage .thumb-strip{background:#122040}
      #detailPage .detail-title{color:#fff!important}
      #detailPage .detail-table{background:#162444;border-color:rgba(255,255,255,0.07)}
      #detailPage .drow{border-bottom-color:rgba(255,255,255,0.06)}
      #detailPage .drow .dk{color:rgba(255,255,255,0.45)}
      #detailPage .drow .dv{color:#fff}
      #detailPage .detail-footer{background:linear-gradient(to top,#0D1B35 80%,rgba(13,27,53,0))}
      #detailPage .dp-lbl{color:rgba(255,255,255,0.45)}
      #detailPage .detail-crumb{color:rgba(255,255,255,0.35)}
      #detailPage .detail-price-box{background:rgba(255,107,26,0.1);border-color:rgba(255,107,26,0.25)}
      #detailPage #dNote{color:rgba(255,255,255,0.75)!important}`;
  } else {
    if (st) st.remove();
  }
}

/* ── Buy handler ── */
function handleBuyClick(idx) {
  const p = products[idx];
  window.open(`https://wa.me/${WA}?text=${waMsg(p)}`, '_blank');
}

/* ── Dup overlay ── */
function closeDupOverlay(e) {
  if (e && e.target !== document.getElementById('dupOverlay')) return;
  const ov = document.getElementById('dupOverlay');
  ov.style.opacity      = '0';
  ov.style.pointerEvents = 'none';
}
function confirmDupBuy() { closeDupOverlay(); }
