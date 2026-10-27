// Ortak Playwright adım sürücüsü (tests/e2e_smoke.js, tests/sim_akis.js, tools/film.js): ekrandaki kartı tanır ve cevaplar.
// Adımlar: tanit, yoklama, sec, anla, metinde, yaz0, yaz, bos0, bos, cumle, metin, diktat, artikel, kok (kok / kokSatz), itiraz, turSonu, paket, leer.
// Kullanım: const D = require('./surucu'); const b = await D.tarayici(); const p = await D.sayfa(b, { mobil: true, zustand }); await D.adim(p, { dogru: 0.8 });
const path = require('path');
const fs = require('fs');

function playwright() {
  const yollar = ['playwright', '/opt/node-tools/node_modules/playwright'];
  for (const y of yollar) { try { return require(y); } catch (e) { /* sıradaki */ } }
  try { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } catch (e) { return null; }
}
const URL = process.env.TEKRAR_URL || 'file://' + path.resolve(__dirname, '..', 'index.html');
const DAY = 86400000;
const GORUNUM = { mobil: { width: 390, height: 844 }, masaustu: { width: 1280, height: 860 } };

async function tarayici() {
  const pw = playwright();
  if (!pw) return null;
  return pw.chromium.launch();
}
// yeni bağlam + sayfa: saat kaydırma (localStorage __off), 4× hızlı zamanlayıcılar, isteğe bağlı başlangıç durumu (zustand: JSON metni)
async function sayfa(b, o) {
  o = o || {};
  const ctx = await b.newContext({ viewport: GORUNUM[o.mobil ? 'mobil' : 'masaustu'], isMobile: !!o.mobil, hasTouch: !!o.mobil });
  const p = await ctx.newPage();
  p.hatalar = [];
  p.on('pageerror', e => p.hatalar.push(e.message));
  await p.route(/fonts/, r => r.abort());
  await p.addInitScript(({ z, off }) => {
    if (!localStorage.getItem('__seed')) {
      if (z) localStorage.setItem('almanca-tekrar-v1', z);
      if (off) localStorage.setItem('__off', String(off));
      localStorage.setItem('__seed', '1');
    }
    const now = Date.now.bind(Date);
    Date.now = () => now() + (+localStorage.getItem('__off') || 0);
    const st = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...a) => st(fn, (ms || 0) * 0.25, ...a);
  }, { z: o.zustand || null, off: o.saatOfs || 0 });
  await p.goto(o.url || URL);
  await p.waitForFunction(() => !!window.__tekrar, null, { timeout: 8000 }).catch(() => {});   // uygulama kabuğu hazır olana dek (açılışta zustand/feedback çekimi gecikebilir)
  await p.waitForTimeout(150);
  p.ctx = ctx;
  return p;
}
const ileri = (p, ms) => p.evaluate(ms => localStorage.setItem('__off', String((+localStorage.getItem('__off') || 0) + ms)), ms);

// ekrandaki kart: tür ve cevabı
const durum = p => p.evaluate(() => {
  const T = window.__tekrar, a = T && T.aktuell;
  if (!a) return { tur: 'yok' };
  const s = a.sel || {};
  const ad = a.typ === 'tanit' ? 'tanit' : a.typ === 'turSonu' ? 'turSonu' : a.typ === 'leer' ? 'leer' : a.typ === 'paket' ? 'paket'
    : a.typ === 'akt' ? (a.art === 'luecke' ? 'metin' : a.art) : a.yoklama ? 'yoklama' : a.bicim === 'kokSatz' ? 'kok' : a.bicim || a.typ;
  const r = { tur: ad, typ: a.typ, id: a.id, bicim: a.bicim, neden: s.neden || null, kaynak: s.kaynak || null, mc: !!a.mc, art: !!a.artFrage, input: !!a.input,
    done: !!a.done, islendi: !!a.islendi, offen: !!a.offen, wartet: !!a.wartet, ziel: a.ziel, leerTeklif: !!a.teklif, sebep: a.sebep,
    yoklama: !!a.yoklama, ok: a.optionen ? a.optionen.findIndex(o => o.ok) : -1, tuzakArt: a.optionen ? a.optionen.findIndex(o => o.tuzak === 'artikel') : -1, nopt: a.optionen ? a.optionen.length : 0, schritt: a.schritt, warte: !!a.warte, itirazVar: a.itirazVar && !a.itiraz };
  if (a.typ === 'akt') { r.blanks = a.blanks ? a.blanks.map(b => b.form) : null; r.satz = a.satz ? a.satz.de : null; }
  if (a.typ === 'paket' && a.schritt === 'luecke') r.form = T.pById[a.pid].luecken[a.i].form;
  if (a.artFrage) r.artikel = T.byId[a.id].art;
  // fiil yazma: fiil + edat + hâl (warten auf A)
  if (a.input && a.typ === 'abr' && !a.yoklama) { const v = T.VERBEN.find(v => v.id === a.id); r.ziel = v.anz.replace('sich(D)', 'sich').split(' ').map(w => { const o = v.obj.find(o => o.p === w); return o ? w + ' ' + o.k : w; }).join(' '); }
  if (a.input && a.yoklama && a.typ === 'abr') { const v = T.VERBEN.find(v => v.id === a.id); r.ziel = v.anz.replace('sich(D)', 'sich'); }
  return r;
});
const bekle = ms => new Promise(r => setTimeout(r, ms));
// cevaptan sonra: doğruda kendiliğinden geçişi bekle, yoksa Devam (Enter); kart değişene kadar
async function sonra(p, once) {
  for (let i = 0; i < 40; i++) {
    const s = await durum(p);
    if (s.tur !== once.tur || s.id !== once.id || (!s.done && !s.wartet && once.done !== undefined && s.typ !== once.typ)) return s;
    if (s.done && !s.islendi && i > 3) await p.keyboard.press('Enter');
    if (s.islendi) return s;
    await p.waitForTimeout(60);
  }
  return durum(p);
}
// tek adım. o: { dogru: 0..1 (doğru cevap olasılığı), rnd, itiraz: true (yanlışta itiraz düğmesi varsa bas),
//   artYanlis: 0..1 (yanlışta isimde yalnız artikeli yanlış ver: kelime ✓ · artikel ✗), sonucCek: async (durum) => {} (sonuç paneli açıkken, Devam'dan önce) }
// Döner: { ad, id, dogru }
async function adim(p, o) {
  o = o || {};
  const rnd = o.rnd || Math.random, dogruMu = rnd() < (o.dogru == null ? 1 : o.dogru);
  const s = await durum(p);
  const ad = s.tur;
  if (ad === 'leer' || ad === 'yok') return { ad, s };
  if (ad === 'turSonu') { await p.keyboard.press('Enter'); await p.waitForTimeout(150); return { ad, s }; }
  if (ad === 'tanit') { await p.click('[data-act="tanit-devam"]'); await p.waitForTimeout(80); return { ad, s }; }
  // turdaki gramer sorusu (Gramer.turRender): yazarak türlerde doğru cevabı gerçek girdiye yaz, yoksa / yanlışta Bilmiyorum; sonra Devam (Enter)
  if (s.typ === 'gramTur') {
    const cevap = await p.evaluate(() => { const a = window.__tekrar.aktuell, G = window.Gramer, so = a && a.soru; const u = so && G && G.GR[so.konu] && (G.GR[so.konu].uebungen || []).find(x => x.n === so.n); return u && ['luecke', 'umform', 'ceviri'].includes(u.tur) ? String(G.loesung(u)).split(' ;; ')[0].split(' ; ') : null; });
    const inp = await p.$$('#kart input:not([disabled])');
    if (dogruMu && cevap && inp.length) { for (let i = 0; i < inp.length; i++) await inp[i].fill(cevap[i] || cevap[0]); await p.keyboard.press('Enter'); }
    else { const b = await p.$('#kart [data-g="bilmiyorum"]'); if (b) await b.click(); else await p.evaluate(() => { const a = window.__tekrar.aktuell; if (a && a.bitti) a.bitti({ urteil: 'falsch', antwort: 'test' }); }); }
    for (let i = 0; i < 50; i++) { await p.waitForTimeout(80); const t = await p.evaluate(() => window.__tekrar.aktuell && window.__tekrar.aktuell.typ); if (t !== 'gramTur') break; if (i > 3 && i % 3 === 0) await p.keyboard.press('Enter'); }
    return { ad: 'gram', s };
  }
  if (ad === 'paket') {
    if (s.schritt === 'luecke' && !s.warte) await p.fill('#cevap', dogruMu ? s.form : 'xxxyz');
    else await ileri(p, 16000);
    await p.keyboard.press('Enter'); await p.waitForTimeout(80);
    return { ad, s };
  }
  if (ad === 'metin') {
    for (let i = 0; i < s.blanks.length; i++) await p.fill(`.u-luecke[data-al="${i}"]`, rnd() < (o.dogru == null ? 1 : o.dogru) ? s.blanks[i] : 'xxxyz');
    await p.click('[data-akt="pruef"]'); await p.waitForTimeout(60);
    if (o.sonucCek) await o.sonucCek(await durum(p));
    await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    return { ad, s };
  }
  if (ad === 'diktat') {
    await p.fill('#cevap', dogruMu ? s.satz : 'ich weiß nicht'); await p.press('#cevap', 'Enter'); await p.waitForTimeout(60);
    if (o.sonucCek) await o.sonucCek(await durum(p));
    await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    return { ad, s };
  }
  if (s.mc) {
    await p.waitForFunction(() => { const a = window.__tekrar.aktuell; return !a.mc || a.offen || a.done; }, null, { timeout: 5000 });
    await p.waitForTimeout(460);   // açıldıktan sonra < 0,4 sn basış sayılmaz
    const yanlis = !dogruMu && s.tuzakArt >= 0 && rnd() < (o.artYanlis || 0) ? s.tuzakArt : (s.ok + 1) % s.nopt === s.tuzakArt && s.nopt > 2 ? (s.ok + 2) % s.nopt : (s.ok + 1) % s.nopt;
    await p.keyboard.press(String((dogruMu ? s.ok : yanlis) + 1));
  } else if (s.art) {
    await p.waitForTimeout(480);
    const a = dogruMu ? s.artikel : ['der', 'die', 'das'].find(x => x !== s.artikel);
    await p.keyboard.press(String(['der', 'die', 'das'].indexOf(a) + 1));
  } else if (s.input) {
    const artSwap = !dogruMu && s.typ === 'wort' && !s.yoklama && /^(der|die|das) /.test(String(s.ziel)) && rnd() < (o.artYanlis || 0);
    const yanlisMetin = artSwap ? String(s.ziel).replace(/^(der|die|das)/, a => a === 'der' ? 'die' : 'der') : o.yakin ? String(s.ziel).slice(0, -1) + 'q' : 'qwertz falsch';
    await p.fill('#cevap', dogruMu ? s.ziel : yanlisMetin);
    await p.keyboard.press('Enter');
    await p.waitForTimeout(60);
    const s2 = await durum(p);
    if (o.itiraz && s2.itirazVar) { await p.click('[data-act="itiraz"]'); await p.waitForTimeout(40); }
  } else return { ad: 'bilinmeyen:' + s.typ, s };
  if (o.sonucCek) { const s3 = await durum(p); if (s3.done && !s3.islendi) await o.sonucCek(s3); }
  await sonra(p, s);
  await p.waitForTimeout(40);
  return { ad, s, dogru: dogruMu };
}
// n adım (leer'de durur); adım adlarını döndürür
async function adimlar(p, n, o) {
  const out = [];
  for (let i = 0; i < n; i++) { const r = await adim(p, o); out.push(r); if (r.ad === 'leer' || r.ad === 'yok' || /^bilinmeyen/.test(r.ad)) break; }
  return out;
}
const zustandOku = dosya => fs.readFileSync(dosya || path.resolve(__dirname, '..', 'log', 'zustand.json'), 'utf8');
// göç senaryoları için dondurulmuş v3 kaydı (Tuna'nın cihazı 15.10'da v5'e geçti; gerçek log/zustand.json artık surum 4): tests/fixtures/zustand_v3.json
const zustandV3 = () => { const f = path.resolve(__dirname, 'fixtures', 'zustand_v3.json'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : zustandOku(); };

module.exports = { playwright, tarayici, sayfa, durum, adim, adimlar, ileri, URL, DAY, GORUNUM, zustandOku, zustandV3 };
