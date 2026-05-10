/* ════════════════════════════════
   seo.js — Meta tag management
   ════════════════════════════════ */

const SITE_NAME = 'ເວັບພໍ່ຄ້າໜ້າຫວານ ຂາຍໄອດີເກມ';
const SITE_DESC = 'ເວັບພໍ່ຄ້າໜ້າຫວານ ຂາຍໄອດີເກມ Mobile Legends, Free Fire ລາຄາຖືກ ພ້ອມເສີບທັນທີ';

function setSEOMeta({ title, description, image, url }) {
  document.title = title || SITE_NAME;
  _setMeta('description', description || SITE_DESC);
  _setMeta('og:title',       title || SITE_NAME,       true);
  _setMeta('og:description', description || SITE_DESC, true);
  _setMeta('og:url',         url,                      true);
  if (image) _setMeta('og:image', image, true);
}

function _setMeta(name, content, isOG = false) {
  const attr = isOG ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
