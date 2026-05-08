/* ════════════════════════════════
   seo.js — Meta tag management
   ════════════════════════════════ */

function setSEOMeta({ title, description, image, url }) {
  document.title = title;
  _setMeta('description', description);
  _setMeta('og:title',       title,       true);
  _setMeta('og:description', description, true);
  _setMeta('og:url',         url,         true);
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
