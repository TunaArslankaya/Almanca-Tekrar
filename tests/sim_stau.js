// Birikme yayma simülasyonu (Playwright gerekir; e2e_smoke ile aynı anda çalıştırma): node tests/sim_stau.js [log/zustand.json]
// Gerçek ilerleme dosyasıyla açılış: vadesi geçmiş kartlar günlere yayılmış mı, bugünkü kuyruk STAU_KAP civarında mı,
// birikmeye rağmen aktif ünitenin kelimeleri geliyor mu, kuyruk bitince ertelenenler öne çekiliyor mu, ertesi gün yeniden yayılıyor mu.
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  try { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
  catch (e2) { console.log('Playwright yok, atlandı.'); process.exit(0); }
}
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const DAY = 86400000;
const KAP = 45;  // stauKap(): 0,8 × günlük hedef, en az 30 (gerçek dosyada 38)
const zustand = fs.readFileSync(path.resolve(__dirname, '..', process.argv[2] || 'log/zustand.json'), 'utf8');
const gespeichert = JSON.parse(zustand).gespeichert || '2026-10-13 17:12:40';
// simülasyon saati: kaydedildikten 1 saat sonra, yerel saat
const ziel = new Date(gespeichert.replace(' ', 'T')).getTime() + 3600000;
const off0 = ziel - Date.now();

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts/, r => r.abort());
  await p.addInitScript(({ z, off0 }) => {
    if (!localStorage.getItem('__seed')) { localStorage.setItem('almanca-tekrar-v1', z); localStorage.setItem('__seed', '1'); localStorage.setItem('__off', String(off0)); }
    const now = Date.now.bind(Date);
    Date.now = () => now() + (+localStorage.getItem('__off') || 0);
    const st = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...a) => st(fn, (ms || 0) * 0.25, ...a);
  }, { z: zustand, off0 });
  await p.goto(URL);
  const bump = ms => p.evaluate(ms => localStorage.setItem('__off', String((+localStorage.getItem('__off') || 0) + ms)), ms);
  const wait = ms => p.waitForTimeout(ms);
  const stat = () => p.evaluate(() => {
    const T = window.__tekrar, S = T.S, t = Date.now();
    const alle = Object.keys(S.karten).filter(u => u.split(':')[1] !== 'pak' && T.gueltig(u));
    const h = new Date(t); h.setHours(0, 0, 0, 0);
    const je = {};
    alle.forEach(u => { const d = S.karten[u].due; const k = d < h.getTime() ? -1 : Math.floor((d - h.getTime()) / 86400000); je[k] = (je[k] || 0) + 1; });
    return { alt: alle.filter(u => S.karten[u].due < h.getTime() && S.karten[u].lern == null).length, faellig: alle.filter(u => S.karten[u].due <= t).length, ertelenmis: alle.filter(u => S.karten[u].urspr != null && S.karten[u].due > t).length, je, tag: S.verteiltTag, items: Object.keys(S.items).length, hinweis: document.querySelector('#hinweis').innerText, plan: document.querySelector('#plan').innerText };
  });
  const st = () => p.evaluate(() => {
    const a = window.__tekrar.aktuell; if (!a) return {};
    return { typ: a.typ, id: a.id, uid: a.uid, mc: !!a.mc, art: !!a.artFrage, input: !!a.input, done: !!a.done, wartet: !!a.wartet,
      ziel: a.ziel, abschreib: a.abschreib, leer: a.sebep === 'leer', schritt: a.schritt, warte: !!a.warte, ok: a.optionen ? a.optionen.findIndex(o => o.ok) : -1, akt: a.art };
  });
  let k = 0;
  const gesehen = [];
  async function schritt() {
    const s = await st();
    gesehen.push(s.typ === 'akt' ? 'akt:' + s.akt : s.typ === 'pretest' || s.typ === 'einf' || s.typ === 'licht' ? s.typ + ':' + s.id : s.typ);
    if (s.typ === 'leer' || s.typ === 'pause') return s.typ;
    if (s.typ === 'turSonu') { if (s.leer) return 'leer'; await p.keyboard.press('Enter'); await wait(120); return 'turSonu'; }
    if (s.typ === 'akt') {
      const a = await p.evaluate(() => { const q = window.__tekrar.aktuell; return { art: q.art, wartet: !!q.wartet, blanks: q.blanks ? q.blanks.map(b => b.form) : null, ids: q.ids || null, satz: q.satz ? q.satz.de : null, order: q.toks ? q.toks.map((t, i) => [t.i, i]).sort((x, y) => x[0] - y[0]).map(x => x[1]) : null }; });
      if (a.wartet) { await p.keyboard.press('Enter'); }
      else if (a.art === 'angebot') await p.keyboard.press('0');
      else {
        if (a.art === 'luecke') { for (let i = 0; i < a.blanks.length; i++) await p.fill(`.u-luecke[data-al="${i}"]`, a.blanks[i]); await p.click('[data-akt="pruef"]'); }
        else if (a.art === 'match') { for (const id of a.ids) { await p.click(`[data-am="L${id}"]`); await p.click(`[data-am="R${id}"]`); } }
        else if (a.art === 'diktat') { await p.fill('#cevap', a.satz); await p.press('#cevap', 'Enter'); }
        else if (a.art === 'ordnen') { for (const i of a.order) await p.click(`[data-ao="${i}"]`); await p.click('[data-akt="pruef"]'); }
        else if (a.art === 'kontrol') { for (let i = 0; i < a.ids.length; i++) { await p.keyboard.press('1112113'[i % 7]); await wait(30); } await p.keyboard.press('Enter'); }
        await wait(60); await p.keyboard.press('Enter');
      }
      await wait(80);
      return 'akt-' + a.art;
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
      if (s.typ === 'pretest' && k++ % 3 === 0) await p.keyboard.press('0'); else await p.keyboard.press(String(s.ok + 1));
      await wait(350);
      const s2 = await st(); if (s2.mc && s2.wartet) await p.keyboard.press('Enter');
    } else if (s.art) {
      await wait(600);
      const a = await p.evaluate(id => window.__tekrar.byId[id].art, s.id);
      await p.keyboard.press(String(['der', 'die', 'das'].indexOf(a) + 1));
      await wait(450);
    } else if (s.input) {
      let ans = s.ziel;
      if (s.uid && s.uid.endsWith(':abr')) ans = await p.evaluate(() => { const a = window.__tekrar.aktuell; const v = window.__tekrar.VERBEN.find(v => v.id === a.id); return v.anz.replace('sich(D)', 'sich').split(' ').map(w => { const o = v.obj.find(o => o.p === w); return o ? w + ' ' + o.k : w; }).join(' '); });
      await p.fill('#cevap', ans); await p.keyboard.press('Enter'); await wait(60); await p.keyboard.press('Enter');
    } else { await p.keyboard.press('Enter'); }
    await wait(80);
    return s.typ || 'soru';
  }
  async function lauf(n) {
    let r = '';
    for (let i = 0; i < n; i++) { r = await schritt(); if (r === 'leer') break; if (r === 'pause') { await p.keyboard.press('Enter'); await wait(100); } }
    return r;
  }
  const fehler = [];
  const s0 = await stat();
  console.log('açılış: vadeli', s0.faellig, '· ertelenmiş', s0.ertelenmis, '· gün yükleri', JSON.stringify(s0.je));
  console.log('mesaj:', s0.hinweis.replace(/\n/g, ' | '));
  console.log('plan:', s0.plan.replace(/\n/g, ' '));
  if (s0.ertelenmis < 100) fehler.push('ertelenen kart yok / az: ' + s0.ertelenmis);
  if (s0.alt > KAP) fehler.push('bugünkü eski kuyruk hâlâ büyük: ' + s0.alt);
  if (!/yayıldı/.test(s0.plan)) fehler.push('plan satırında "yayıldı" yok');
  const uIds = await p.evaluate(() => { const T = window.__tekrar; const U = T.UNITEN.find(u => !u.geschlossen); return U ? U.items.map(it => T.uMainId(it)).filter(Boolean) : []; });
  console.log('aktif ünite kelimeleri (ana listede):', uIds.length);
  await p.evaluate(() => window.__tekrar.starte('akis')); await wait(100);
  const r1 = await lauf(90);
  const s1 = await stat();
  const neuU = gesehen.filter(g => /^(pretest|einf):/.test(g) && uIds.includes(g.split(':')[1])).length;
  const tri = gesehen.filter(g => g === 'akt:kontrol').length;
  const dagilim = gesehen.reduce((a, g) => { const key = g.split(':')[0]; a[key] = (a[key] || 0) + 1; return a; }, {});
  console.log('gün 1:', gesehen.length, 'adım, son:', r1, '· ünite kelimesi', neuU, '· ön kontrol listesi', tri, '·', JSON.stringify(dagilim));
  console.log('gün 1 sonu: vadeli', s1.faellig, '· ertelenmiş', s1.ertelenmis, '· öğe', s1.items);
  const ilkYeni = gesehen.findIndex(g => /^(pretest|einf|licht):/.test(g) || g === 'pretest' || g === 'einf' || g === 'licht');
  console.log('ilk yeni kelime kaçıncı adımda:', ilkYeni, gesehen.slice(0, 20).join(','));
  // not: simülasyon ön kontrolde hep "biliyorum" der, birikme hızla 150'nin altına iner; yeni kelime ondan sonra gelir (bilgi amaçlı)
  // kuyruk bitince öne çekme: 150 adım daha
  gesehen.length = 0;
  const r2 = await lauf(150);
  const s2 = await stat();
  console.log('gün 1 devam:', gesehen.length, 'adım, son:', r2, '· vadeli', s2.faellig, '· ertelenmiş', s2.ertelenmis);
  if (s2.ertelenmis > s1.ertelenmis - 30) fehler.push(`kuyruk bitince ertelenenler öne çekilmedi (${s1.ertelenmis} → ${s2.ertelenmis}, son: ${r2})`);
  // ertesi gün: yeniden yayma
  await bump(DAY); await p.reload(); await wait(300);
  const s3 = await stat();
  console.log('gün 2 açılış: vadeli', s3.faellig, '(dünden kalan', s3.alt + ')', '· ertelenmiş', s3.ertelenmis, '· gün yükleri', JSON.stringify(s3.je), '· verteiltTag', s3.tag);
  // dünden kalan (öğrenme adımı dışındaki) kartlar yeniden yayılmış olmalı; bugün vadesi gelenler (dünkü cevapların tekrarı) yerinde kalır
  if (s3.alt > KAP) fehler.push('2. gün dünden kalanlar yayılmadı: ' + s3.alt);
  gesehen.length = 0;
  const r3 = await lauf(60);
  const s4 = await stat();
  console.log('gün 2:', gesehen.length, 'adım, son:', r3, '· vadeli', s4.faellig, '· ertelenmiş', s4.ertelenmis);
  if (errs.length) fehler.push('sayfa hataları: ' + errs.join(' | '));
  await b.close();
  if (fehler.length) { console.log('HATA:', fehler.join('; ')); process.exit(1); }
  console.log('yayma simülasyonu geçti');
})();
