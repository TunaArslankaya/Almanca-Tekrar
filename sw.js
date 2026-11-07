// Service worker: uygulama çevrimdışı açılır, telefonda ana ekrana eklenince tam ekran uygulama gibi çalışır.
// index.html önbellekten hemen, yenisi arka planda (sürüm değişince sw.js de değişir, yeni sürüm kurulur); ?v= özetli dosyalar önbellekten.
// GitHub API isteklerine dokunulmaz. VERSION ve ASSETS'i tools/build.py yazar: elle düzenleme.
const VERSION = /*VERSION*/'4cb0a2ce0c'/*VERSION_END*/;
const ASSETS = /*ASSETS*/["./", "manifest.webmanifest", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "img/apple-touch-icon.png", "img/icon.svg", "css/stil.css?v=698c98f7", "daten/verben.js?v=ee5346d9", "daten/nomen.js?v=da8f9efd", "daten/woerter.js?v=373307fe", "daten/pakete.js?v=954acb6c", "daten/kancalar.js?v=d96c69f3", "daten/saetze.js?v=b124219d", "daten/themen.js?v=2c02586c", "daten/saetze_refl.js?v=73286ad9", "daten/nsaetze.js?v=ee267076", "daten/glossen.js?v=062ee9fb", "daten/lesen.js?v=eec5c231", "daten/lesetexte.js?v=464a732b", "daten/lesetexte_dw.js?v=36c693ac", "daten/goethe_lesen.js?v=4300c92c", "daten/unite.js?v=14e6b357", "daten/kaliplar.js?v=e55288a4", "daten/capraz.js?v=7adbcc32", "daten/minimalpaare.js?v=a7e98728", "daten/aufgaben.js?v=d40b26c2", "daten/grammatik.js?v=1db2ae18", "daten/feedback.js?v=9b45a0c3", "js/fsrs.js?v=49e28ece", "js/kern.js?v=c53c68cc", "js/grammatik.js?v=8e71d6c1", "js/gramer.js?v=df7412ad", "js/pruefung.js?v=2245226d", "js/cumle.js?v=5f3594fa", "js/dinle.js?v=3d3acf4b", "js/app.js?v=dfd4d11a"]/*ASSETS_END*/;
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
