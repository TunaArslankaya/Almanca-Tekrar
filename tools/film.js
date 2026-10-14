// Oturum "filmi": gerçek ilerleme dosyasıyla uygulamayı tarayıcıda açar, her adımda ekran görüntüsü + durum kaydı alır.
// node tools/film.js <çıktı-klasörü> [mobil|masaustu] [adım=40] [doğruluk=0.8] [gün-kaydırma=0] [zustand=log/zustand.json]
// Kullanıcı deneyimi incelemesi ve simülasyon için (tests/ değil: sonuç doğrulamaz, kayıt üretir).
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
}
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
  const bump = ms => p.evaluate(ms => localStorage.setItem('__off', String((+localStorage.getItem('__off') || 0) + ms)), ms);
  const wait = ms => p.waitForTimeout(ms);
  const kayit = [];
  let n = 0;
  async function shot(etiket, extra) {
    const f = `${String(n).padStart(3, '0')}-${etiket}.png`;
    await p.screenshot({ path: path.join(out, f), fullPage: false });
    const info = await p.evaluate(() => {
      const t = s => (document.querySelector(s) || {}).innerText || '';
      const a = window.__tekrar && window.__tekrar.aktuell;
      return { typ: a && a.typ, art: a && a.art, uid: a && a.uid, hinweis: t('#hinweis'), plan: t('#plan'), hedef: t('#hedef'), kart: t('#kart').slice(0, 600) };
    });
    kayit.push(Object.assign({ n, datei: f, etiket }, info, extra || {}));
    n++;
  }
  // önce sekmeler
  await shot('acilis');
  const navSel = cihaz === 'mobil' ? '.alt-nav' : 'nav.tabs';
  for (const v of ['zayif', 'liste', 'gecmis', 'ayar']) {
    await p.click(`${navSel} [data-v="${v}"]`); await wait(250); await shot('sekme-' + v);
  }
  await p.click(`${navSel} [data-v="ana"]`); await wait(250);
  await p.click('[data-act-ana="basla"]'); await wait(250);
  const st = () => p.evaluate(() => {
    const a = window.__tekrar.aktuell; if (!a) return {};
    return { typ: a.typ, id: a.id, uid: a.uid, mc: !!a.mc, art: !!a.artFrage, input: !!a.input, done: !!a.done, wartet: !!a.wartet,
      ziel: a.ziel, abschreib: a.abschreib, schritt: a.schritt, warte: !!a.warte, ok: a.optionen ? a.optionen.findIndex(o => o.ok) : -1, nopt: a.optionen ? a.optionen.length : 0, akt: a.art };
  });
  const t0 = Date.now();
  for (let i = 0; i < ADIM; i++) {
    const s = await st();
    const dogru = rnd() < DOG;
    await shot('soru', { dogru });
    if (s.typ === 'leer') break;
    if (s.typ === 'pause' || s.typ === 'turSonu') { await p.keyboard.press('Enter'); await wait(150); continue; }
    try {
      if (s.typ === 'akt') {
        const a = await p.evaluate(() => { const q = window.__tekrar.aktuell; return { art: q.art, wartet: !!q.wartet, blanks: q.blanks ? q.blanks.map(b => b.form) : null, ids: q.ids || null, satz: q.satz ? q.satz.de : null, order: q.toks ? q.toks.map((t, i) => [t.i, i]).sort((x, y) => x[0] - y[0]).map(x => x[1]) : null }; });
        if (a.wartet) { await p.keyboard.press('Enter'); }
        else if (a.art === 'angebot') await p.keyboard.press('0');
        else {
          if (a.art === 'luecke') { for (let k = 0; k < a.blanks.length; k++) await p.fill(`.u-luecke[data-al="${k}"]`, dogru ? a.blanks[k] : a.blanks[k].slice(0, -1)); await p.click('[data-akt="pruef"]'); }
          else if (a.art === 'match') { for (const id of a.ids) { await p.click(`[data-am="L${id}"]`); await p.click(`[data-am="R${id}"]`); } }
          else if (a.art === 'diktat') { await p.fill('#cevap', dogru ? a.satz : a.satz.replace(/\.$/, '').toLowerCase()); await p.press('#cevap', 'Enter'); }
          else if (a.art === 'ordnen') { for (const k of a.order) await p.click(`[data-ao="${k}"]`); await p.click('[data-akt="pruef"]'); }
          else if (a.art === 'kontrol') { for (let k = 0; k < a.ids.length; k++) { await p.keyboard.press(rnd() < DOG ? '1' : rnd() < 0.5 ? '2' : '3'); await wait(30); } await wait(100); await shot('kontrol-dolu'); await p.keyboard.press('Enter'); }
          await wait(120); await shot('sonuc'); await p.keyboard.press('Enter');
        }
        await wait(120);
        continue;
      }
      if (s.typ === 'licht') { await bump(2500); await p.keyboard.press('Enter'); }
      else if (s.typ === 'einf') { await p.fill('#cevap', s.abschreib); await p.keyboard.press('Enter'); }
      else if (s.typ === 'paket') {
        if (s.schritt === 'luecke' && !s.warte) {
          const f = await p.evaluate(() => { const a = window.__tekrar.aktuell; return window.__tekrar.pById[a.pid].luecken[a.i].form; });
          await p.fill('#cevap', f);
        } else await bump(16000);
        await p.keyboard.press('Enter');
      } else if (s.mc) {
        await p.waitForFunction(() => { const a = window.__tekrar.aktuell; return !a.mc || a.offen || a.done; });
        await wait(520);
        const wahl = dogru ? s.ok : (s.ok + 1) % Math.max(2, s.nopt);
        if (s.typ === 'pretest' && !dogru) await p.keyboard.press('0'); else await p.keyboard.press(String(wahl + 1));
        await wait(300); await shot('sonuc');
        const s2 = await st(); if (s2.mc && s2.wartet) await p.keyboard.press('Enter');
      } else if (s.art) {
        await wait(600);
        const a = await p.evaluate(id => window.__tekrar.byId[id].art, s.id);
        const arts = ['der', 'die', 'das']; const k = dogru ? arts.indexOf(a) : (arts.indexOf(a) + 1) % 3;
        await p.keyboard.press(String(k + 1));
        await wait(400); await shot('sonuc');
      } else if (s.input) {
        let ans = s.ziel || '';
        if (s.uid && s.uid.endsWith(':abr')) ans = await p.evaluate(() => { const a = window.__tekrar.aktuell; const v = window.__tekrar.VERBEN.find(v => v.id === a.id); return v.anz.replace('sich(D)', 'sich').split(' ').map(w => { const o = v.obj.find(o => o.p === w); return o ? w + ' ' + o.k : w; }).join(' '); });
        if (!dogru) ans = ans.length > 4 ? ans.slice(0, -2) + 'e' : 'weiß nicht';
        await p.fill('#cevap', ans); await p.keyboard.press('Enter'); await wait(150); await shot('sonuc'); await p.keyboard.press(dogru ? 'Enter' : '1');
      } else { await p.keyboard.press('Enter'); }
    } catch (e) { kayit.push({ n, hata: String(e).slice(0, 200) }); }
    await wait(100);
  }
  fs.writeFileSync(path.join(out, 'kayit.json'), JSON.stringify({ cihaz, adim: ADIM, dogruluk: DOG, gun: GUN, sure_ms: Date.now() - t0, hatalar: errs, kayit }, null, 1));
  await b.close();
  console.log(`${out}: ${n} görüntü, ${errs.length} sayfa hatası`);
})();
