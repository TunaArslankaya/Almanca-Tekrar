// Oturum "filmi": gerçek ilerleme dosyasıyla uygulamayı tarayıcıda açar, her adımda ekran görüntüsü + durum kaydı alır.
// node tools/film.js <çıktı-klasörü> [mobil|masaustu] [adım=40] [doğruluk=0.8] [gün-kaydırma=0] [zustand=log/zustand.json]
// Kullanıcı deneyimi incelemesi ve simülasyon için (tests/ değil: sonuç doğrulamaz, kayıt üretir).
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, '..', 'tests', 'surucu.js')).playwright();
const [out, cihaz = 'mobil', adimS = '40', dogS = '0.8', gunS = '0', zPfad = 'log/zustand.json'] = process.argv.slice(2);
if (!out) { console.log('kullanım: node tools/film.js <klasör> [mobil|masaustu] [adım] [doğruluk] [gün-kaydırma]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const ROOT = path.resolve(__dirname, '..');
const URL = process.env.FILM_URL || 'file://' + path.join(ROOT, 'index.html');
const DAY = 86400000;
const zustand = fs.readFileSync(path.resolve(ROOT, zPfad), 'utf8');
const ADIM = +adimS, DOG = +dogS, GUN = +gunS;
let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(cihaz === 'mobil'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'tr-TR' }
    : { viewport: { width: 1280, height: 860 }, locale: 'tr-TR' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await p.addInitScript(({ z, off }) => {
    if (!localStorage.getItem('__seed')) { localStorage.setItem('almanca-tekrar-v1', z); localStorage.setItem('__seed', '1'); localStorage.setItem('__off', String(off)); }
    const now = Date.now.bind(Date);
    Date.now = () => now() + (+localStorage.getItem('__off') || 0);
    const st = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...a) => st(fn, (ms || 0) * 0.25, ...a);
  }, { z: zustand, off: GUN * DAY });
  await p.goto(URL);
  await p.waitForTimeout(400);
  const wait = ms => p.waitForTimeout(ms);
  const kayit = [];
  let n = 0;
  async function shot(etiket, extra) {
    const f = `${String(n).padStart(3, '0')}-${etiket}.png`;
    await p.screenshot({ path: path.join(out, f), fullPage: false });
    const info = await p.evaluate(() => {
      const t = s => (document.querySelector(s) || {}).innerText || '';
      const a = window.__tekrar && window.__tekrar.aktuell;
      const gor = s => { const e = document.querySelector(s); return !!(e && !e.closest('[hidden]') && e.getClientRects().length); };
      return { typ: a && a.typ, art: a && a.art, uid: a && a.uid, hinweis: t('#hinweis'), kart: gor('#v-calis') ? t('#kart').slice(0, 600) : '', ana: gor('#v-ana') ? t('#v-ana').slice(0, 400) : '', toast: gor('#toast') ? t('#toast') : '' };
    });
    kayit.push(Object.assign({ n, datei: f, etiket }, info, extra || {}));
    n++;
  }
  // önce sekmeler: Bugün · Kelimeler · İlerleme · Diğer; Zayıflar, Geçmiş, Ayarlar Diğer menüsünden
  await shot('acilis');
  const navSel = cihaz === 'mobil' ? '.alt-nav' : 'nav.tabs';
  for (const v of ['liste', 'gecmis', 'diger']) {
    await p.click(`${navSel} [data-v="${v}"]`); await wait(250); await shot('sekme-' + v);
  }
  for (const v of ['zayif', 'kayit', 'ayar']) {
    await p.click(`${navSel} [data-v="diger"]`); await wait(150);
    await p.click(`#diger [data-git="${v}"]`); await wait(250); await shot('diger-' + v);
  }
  await p.click(`${navSel} [data-v="ana"]`); await wait(250);
  await p.click('[data-act-ana="basla"]'); await wait(250);
  // adımlar tests/surucu.js ile (v5 kartları: tanıtım, yoklama, seçmeli, yazma, cümle, metin, dikte, artikel, kök, tur sonu, paket)
  const D = require(path.join(ROOT, 'tests', 'surucu.js'));
  const t0 = Date.now();
  for (let i = 0; i < ADIM; i++) {
    const s = await D.durum(p);
    const dogru = rnd() < DOG;
    await shot(s.tur || 'soru', { dogru, bicim: s.bicim, neden: s.neden, kaynak: s.kaynak, id: s.id });
    if (s.tur === 'leer' || s.tur === 'yok') break;
    try {
      const r = await D.adim(p, { dogru: dogru ? 1 : 0, rnd, itiraz: !dogru && rnd() < 0.3, yakin: rnd() < 0.5, artYanlis: 1,
        sonucCek: async s2 => { if (!dogru) { await wait(320); await shot('sonuc', { id: s2.id, bicim: s2.bicim }); } } });
      if (/^bilinmeyen/.test(r.ad)) { await p.keyboard.press('Enter'); }
    } catch (e) { kayit.push({ n, hata: String(e).slice(0, 200) }); }
    await wait(100);
  }
  fs.writeFileSync(path.join(out, 'kayit.json'), JSON.stringify({ cihaz, adim: ADIM, dogruluk: DOG, gun: GUN, sure_ms: Date.now() - t0, hatalar: errs, kayit }, null, 1));
  await b.close();
  console.log(`${out}: ${n} görüntü, ${errs.length} sayfa hatası`);
})();
