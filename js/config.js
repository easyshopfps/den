/* ════════════════════════════════
   config.js — App config + Supabase
   ════════════════════════════════ */

const SB_URL = 'https://wsklbzywuzvsdhmmvhiy.supabase.co';
const SB_KEY = 'sb_publishable_YpJBgsuYZoKgEIsz3lJp_w_1PpK7nrz';

/* WA ເບີ — ໂຫລດຈາກ DB ກ່ອນ ຖ້າໂຫລດບໍ່ໄດ້ໃຊ້ fallback */
let WA = '8562096034114'; // fallback default

const RANK_ICON = {
  'Mythic Glory': '👑',
  'Mythic':       '🔮',
  'Legend':       '⚡',
  'Epic':         '💜',
  'Heroic':       '🔥',
  'King':         '👑'
};

const GAMESVG = `<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="6" width="20" height="12" rx="6"/>
  <path d="M6 12h4M8 10v4"/>
  <circle cx="16" cy="11" r="1.5" fill="rgba(255,255,255,0.25)" stroke="none"/>
  <circle cx="18" cy="13" r="1.5" fill="rgba(255,255,255,0.25)" stroke="none"/>
</svg>`;

/* ── Shared state ── */
let products    = [];
let displayList = [];

/* ── Supabase fetch ── */
async function sbFetch(path, opts = {}) {
  const res = await fetch(SB_URL + path, {
    headers: {
      'apikey':        SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'Content-Type':  'application/json',
      ...opts.headers
    },
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ── Helpers ── */
function fmt(n)      { return Number(n).toLocaleString(); }
function rankIcon(r) { return RANK_ICON[r] || '🎮'; }
function isLight(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 128;
}
function waMsg(p) {
  return encodeURIComponent(
    `ສະບາຍດີ! ສົນໃຈຊື້ໄອດີ: ${p.title}\nເກມ: ${p.game}\nລາຄາ: ${fmt(p.price)} ກຣີບ 🙏`
  );
}
