// Service worker: uygulama çevrimdışı açılır, telefonda ana ekrana eklenince tam ekran uygulama gibi çalışır.
// index.html önbellekten hemen, yenisi arka planda (sürüm değişince sw.js de değişir, yeni sürüm kurulur); ?v= özetli dosyalar önbellekten.
// GitHub API isteklerine dokunulmaz. VERSION ve ASSETS'i tools/build.py yazar: elle düzenleme.
const VERSION = /*VERSION*/'e619598884'/*VERSION_END*/;
const ASSETS = /*ASSETS*/["./", "manifest.webmanifest", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "img/apple-touch-icon.png", "img/icon.svg", "css/stil.css?v=889b5485", "daten/verben.js?v=22500474", "daten/nomen.js?v=1974c77d", "daten/woerter.js?v=aebdb6ee", "daten/pakete.js?v=954acb6c", "daten/kancalar.js?v=d77ef170", "daten/saetze.js?v=26bb8d52", "daten/themen.js?v=2c02586c", "daten/saetze_refl.js?v=94a825b1", "daten/nsaetze.js?v=6f6ae75d", "daten/glossen.js?v=bea7f298", "daten/lesen.js?v=eec5c231", "daten/lesetexte.js?v=53237bed", "daten/lesetexte_dw.js?v=dfb85e3f", "daten/goethe_lesen.js?v=4300c92c", "daten/unite.js?v=14e6b357", "daten/kaliplar.js?v=3d97ad9f", "daten/aufgaben.js?v=d40b26c2", "daten/grammatik.js?v=7f0ae77f", "daten/feedback.js?v=469b27f3", "js/fsrs.js?v=49e28ece", "js/kern.js?v=8d9de6da", "js/grammatik.js?v=7101591c", "js/gramer.js?v=01a61962", "js/pruefung.js?v=7b694e0b", "js/app.js?v=88e2d951"]/*ASSETS_END*/;
const CACHE = 'tekrar-' + VERSION;
const FONTS = 'tekrar-fonts';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('tekrar-') && k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function zamanAsimi(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('zaman aşımı')), ms))]); }
async function agOnce(req, anahtar) {
  const c = await caches.open(CACHE);
  try {
    const r = await zamanAsimi(fetch(req), 4000);
    if (r && r.ok) c.put(anahtar || req, r.clone());
    return r;
  } catch (e) {
    const hit = await c.match(anahtar || req, { ignoreSearch: true });
    if (hit) return hit;
    throw e;
  }
}
// uygulama kabuğu: önbellekte varsa hemen (zayıf mobil ağda bekleme yok), yenisi arka planda alınır; bir sonraki açılışta gelir
async function kabuk(e, anahtar) {
  const c = await caches.open(CACHE);
  const hit = await c.match(anahtar);
  const yeni = fetch(e.request).then(r => { if (r && r.ok && (r.headers.get('content-type') || '').includes('text/html')) c.put(anahtar, r.clone()); return r; });
  if (hit) { e.waitUntil(yeni.catch(() => {})); return hit; }
  return yeni.catch(() => agOnce(e.request, anahtar));
}
async function onbellekOnce(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r && r.ok) (await caches.open(CACHE)).put(req, r.clone());
  return r;
}
async function eskiyiVerYenile(req) {
  const c = await caches.open(FONTS);
  const hit = await c.match(req);
  const yeni = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || yeni;
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) {
    if (/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) e.respondWith(eskiyiVerYenile(r));
    return;
  }
  if (r.mode === 'navigate') {
    // yalnız uygulamanın kendisi (kök / index.html) önbellekten hemen açılır, yenisi arka planda gelir; başka sayfalar (ör. log/log.csv) ağdan
    const kok = new URL('./', self.registration.scope);
    if (u.pathname === kok.pathname || u.pathname === kok.pathname + 'index.html') e.respondWith(kabuk(e, kok.href));
    return;
  }
  if (u.searchParams.has('v')) { e.respondWith(onbellekOnce(r)); return; }
  e.respondWith(agOnce(r));
});
