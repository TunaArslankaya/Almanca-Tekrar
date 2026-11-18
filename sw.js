// Service worker: uygulama çevrimdışı açılır, telefonda ana ekrana eklenince tam ekran uygulama gibi çalışır.
// index.html önbellekten hemen, yenisi arka planda (sürüm değişince sw.js de değişir, yeni sürüm kurulur); ?v= özetli dosyalar önbellekten.
// GitHub API isteklerine dokunulmaz. VERSION ve ASSETS'i tools/build.py yazar: elle düzenleme.
const VERSION = /*VERSION*/'c3737bac32'/*VERSION_END*/;
const ASSETS = /*ASSETS*/["./", "manifest.webmanifest", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "img/apple-touch-icon.png", "img/icon.svg", "css/stil.css?v=73d87b99", "daten/verben.js?v=fc712c4f", "daten/nomen.js?v=8b0253a0", "daten/woerter.js?v=4d19bae5", "daten/pakete.js?v=954acb6c", "daten/kancalar.js?v=28d556d8", "daten/saetze.js?v=ab653416", "daten/themen.js?v=2c02586c", "daten/saetze_refl.js?v=a85bfdab", "daten/nsaetze.js?v=129c0020", "daten/glossen.js?v=e0a80800", "daten/lesen.js?v=eec5c231", "daten/lesetexte.js?v=464a732b", "daten/lesetexte_dw.js?v=f00be886", "daten/goethe_lesen.js?v=4300c92c", "daten/unite.js?v=c0c66563", "daten/kaliplar.js?v=29754d5c", "daten/capraz.js?v=9f90729a", "daten/aufgaben.js?v=d40b26c2", "daten/grammatik.js?v=353c4919", "daten/feedback.js?v=83cdb3b5", "js/fsrs.js?v=49e28ece", "js/kern.js?v=d8f4f7ba", "js/grammatik.js?v=57086be0", "js/gramer.js?v=3e6755f8", "js/pruefung.js?v=009be1d4", "js/cumle.js?v=132b42ce", "js/app.js?v=18cbe4f8"]/*ASSETS_END*/;
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
