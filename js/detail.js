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

  /* ── BG blur layer (Layer 1) ── */
  const bgLayer = document.getElementById('dBgLayer');
  if (bgLayer && imgs[0]) {
    bgLayer.style.backgroundImage = `url('${imgs[0]}')`;
  }

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

  /* ── Share strip ── */
  const rawUrl = window.location.href;
  const pageUrl = encodeURIComponent(rawUrl);
  const shareText = encodeURIComponent(p.title + ' - ' + fmt(p.price) + ' ກຣີບ');
  document.getElementById('dShareStrip').innerHTML = `
    <div class="share-row">
      <span class="share-row-label">ແຊຣ໌ :</span>
      <!-- WhatsApp -->
      <button class="share-btn wa" onclick="window.open('https://wa.me/?text=${shareText}%20${pageUrl}','_blank')" title="WhatsApp">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.306A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.031-1.094l-.29-.172-2.952.775.787-2.873-.189-.295A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
      </button>
      <!-- Messenger — ใช้ Native Share API ถ้าได้ ไม่งั้น fallback fb.me -->
      <button class="share-btn msg" onclick="
        if(navigator.share){
          navigator.share({title:'${p.title}',text:'${p.title} - ${fmt(p.price)} ກຣີບ',url:'${rawUrl}'});
        } else {
          window.open('https://www.facebook.com/dialog/send?link=${pageUrl}&app_id=966242223397117&redirect_uri=${pageUrl}','_blank');
        }" title="Messenger">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 3.048 1.524 5.762 3.908 7.522V22l3.562-1.966c.95.264 1.958.408 3 .408C17.523 20.442 22 16.34 22 11.243 22 6.145 17.523 2 12 2zm1.193 12.244l-2.55-2.718-4.98 2.718 5.481-5.82 2.614 2.719 4.913-2.719-5.478 5.82z"/>
        </svg>
      </button>
      <!-- Facebook -->
      <button class="share-btn fb" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${pageUrl}','_blank')" title="Facebook">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>
      <!-- Copy link -->
      <button class="share-btn copy" id="dCopyBtn" onclick="
        navigator.clipboard.writeText('${rawUrl}').then(()=>{
          const b=document.getElementById('dCopyBtn');
          b.innerHTML='<svg width=20 height=20 viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#16A34A\\' stroke-width=\\'2.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><polyline points=\\'20 6 9 17 4 12\\'/></svg>';
          setTimeout(()=>{b.innerHTML='<svg width=20 height=20 viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'rgba(255,255,255,0.8)\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'9\\' y=\\'9\\' width=\\'13\\' height=\\'13\\' rx=\\'2\\'/><path d=\\'M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1\\'/></svg>'},1800)
        })" title="ຄັດລອກລິ້ງ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
    </div>`;

  /* ── Breadcrumb — กดได้ ── */
  document.getElementById('dCrumb').innerHTML = `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    <a href="." onclick="showHome();return false">ໜ້າຫຼັກ</a>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    <a href="." onclick="showHome();openCatPage('${p.game}');return false">${p.game}</a>
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
  /* dark theme ถูก built-in แล้ว ไม่ต้องทำอะไรเพิ่ม */
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
