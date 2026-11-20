// Ön test (yoklama) ve "Biliyorum, sonra sor" (19.11). Kullanım: node tests/e2e_yoklama.js
// 1) tekrar sırası boşken (bütün vadeler ileride) ön test hakkı bitmiş: tanıtımda "Biliyorum, sonra sor" → tur "şimdilik bu kadar"
//    diye bitmeden ertelenen kelime ön testle sorulur; aynı kelime turda yeniden tanıtılmaz (Tuna 19.11: "atıyor, sonra tekrar aynısı")
// 2) ön testi bilemeyince gelen tanıtımda "Biliyorum, sonra sor" yok; tanıtım satırında `yoklama` etiketi
// 3) bilinen ön test: kotadan düşmez, tur sonunda "zaten biliyordun", tur satırında bildi:N
// 4) normal tur (vadeliler var): ertelenen kelime tur bitmeden sorulur
// 5) "çeviri kötü" düğmesi (20.11): cümleli soruda log akt;ceviri:<öğe>
const D = require('./surucu');
let hata = 0;
const ok = (k, m) => { if (!k) { hata++; console.log('HATA:', m); } };
// test günü: kayıttaki son çalışma gününün ertesi (bugünün yeni kelime hakkı dolu olmasın; 3+ gün ara "dönüş turu" yapar: yeni yok)
const GUN = (() => { const z = JSON.parse(D.zustandOku()), son = Object.keys(z.tage || {}).sort().pop() || '2026-11-19', d = new Date(son + 'T12:00:00'); d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(), SAAT = new Date(GUN + 'T10:00:00').getTime();
// gerçek kopya; ileri: true → bütün vadeler 30 gün sonraya (tekrar sırası boş), gs4: o günün sayaçları
function kopya(o) {
  const z = JSON.parse(D.zustandOku());
  if (o.ileri) {
    const ileri = h => { if (h && h.due) h.due = SAAT + 30 * D.DAY; };
    Object.values(z.items || {}).forEach(it => { ileri(it.m); ileri(it.art); });
    Object.values(z.kok || {}).forEach(ileri);
    Object.values(z.pakete || {}).forEach(p => ileri(p.m));
  }
  z.gs4 = Object.assign({ g: GUN, metin: 0, kok: 4, kokYeni: 2, yoklama: 0, ekYeni: 0, ekYeniTeklif: 0, bonus: 0 }, o.gs4 || {});
  return JSON.stringify(z);
}
const durum = p => p.evaluate(() => {
  const T = window.__tekrar, q = T.aktuell, ot = T.ot;
  return { typ: q && q.typ, id: q && q.id, yoklama: !!(q && q.yoklama), kisa: !!(q && q.kisa), sorBtn: !!document.querySelector('[data-act="tanit-sor"]'),
    n: T.tur ? T.tur.n : 0, ert: ((ot && ot.yoklamaErt) || []).map(x => x.id), bos: !!document.querySelector('#kart .bos') };
});
const loglar = p => p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'yeni' || e.modus === 'tur' || /bicim:yoklama/.test(e.notiz || '')).map(e => ({ modus: e.modus, id: e.id, ergebnis: e.ergebnis, frage: e.frage, notiz: e.notiz })));
// ön test ve diğer sorular ortak sürücüyle (surucu.adim: yoklamada fiil yalnız mastar + sich)
const cevapla = (p, s, dogru) => D.adim(p, { dogru: dogru ? 1 : 0 });

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('e2e_yoklama: Playwright yok, atlandı'); return; }

  // 1) tekrar sırası boş + ön test hakkı bitmiş (günde 20): tanıtım → "Biliyorum, sonra sor"
  {
    const p = await D.sayfa(b, { zustand: kopya({ ileri: true, gs4: { yoklama: 20 } }), saatOfs: SAAT - Date.now() });
    await p.waitForTimeout(400);
    await p.evaluate(() => window.__tekrar.starte('akis', 12));
    await p.waitForTimeout(300);
    let s = await durum(p), ertId = null, adimSay = 0, ikinciTanit = false, sorulduYok = false, gorulen = [];
    for (; adimSay < 40; adimSay++) {
      s = await durum(p);
      if (s.typ === 'tanit') gorulen.push(s.id);
      if (s.typ === 'tanit' && ertId && s.id === ertId) ikinciTanit = true;
      if (s.typ === 'tanit' && !s.kisa && !ertId) {
        ok(s.sorBtn, '[1] ön testsiz tanıtımda "Biliyorum, sonra sor" yok');
        ertId = s.id;
        await p.click('[data-act="tanit-sor"]'); await p.waitForTimeout(250);
        continue;
      }
      if (s.yoklama && s.id === ertId) { sorulduYok = true; await cevapla(p, s, true); continue; }
      if (s.typ === 'leer' || s.typ === 'turSonu' || s.bos) break;
      if (s.yoklama) { await cevapla(p, s, true); continue; }
      await D.adim(p, { dogru: 1 });
    }
    ok(ertId, '[1] tanıtım kartı gelmedi (tekrar sırası boşken parti bekleniyordu): ' + JSON.stringify(s));
    ok(sorulduYok, `[1] ertelenen kelime (${ertId}) tur bitmeden ön testle sorulmadı; son: ${JSON.stringify(s)} · görülen tanıtımlar: ${gorulen.join(',')}`);
    ok(!ikinciTanit, `[1] ertelenen kelime (${ertId}) aynı turda yeniden tanıtıldı`);
    const L = await loglar(p);
    ok(L.some(e => e.modus === 'yeni' && e.id === ertId && e.ergebnis === 'bekannt'), `[1] ertelenen kelime bilinince 'yeni;bekannt' satırı yok: ${JSON.stringify(L.filter(e => e.id === ertId))}`);
    ok(!p.hatalar.length, '[1] sayfa hatası: ' + p.hatalar.join(' | '));
    await p.ctx.close();
  }

  // 2) + 3) ön test: ilk kelimeyi bilemez (tanıtımda "Biliyorum, sonra sor" yok, satırda 'yoklama'), kalanları bilir (bildi)
  {
    const p = await D.sayfa(b, { zustand: kopya({ ileri: true }), saatOfs: SAAT - Date.now() });
    await p.waitForTimeout(400);
    await p.evaluate(() => window.__tekrar.starte('akis', 12));
    await p.waitForTimeout(300);
    let ilkYok = null, tanitBtn = null, bildi = [], s;
    for (let i = 0; i < 40; i++) {
      s = await durum(p);
      if (s.typ === 'turSonu' || s.typ === 'leer' || s.bos) break;
      if (s.yoklama) {
        const dogru = !!ilkYok;
        if (!ilkYok) ilkYok = s.id; else bildi.push(s.id);
        await cevapla(p, s, dogru); continue;
      }
      if (s.typ === 'tanit' && s.id === ilkYok && tanitBtn == null) tanitBtn = s.sorBtn;
      await D.adim(p, { dogru: 1 });
    }
    ok(ilkYok, '[2] ön test gelmedi');
    ok(tanitBtn === false, `[2] ön testi bilemediği kelimenin tanıtımında "Biliyorum, sonra sor" var (ya da tanıtım gelmedi): ${tanitBtn}`);
    const L = await loglar(p);
    ok(L.some(e => e.modus === 'yeni' && e.id === ilkYok && e.ergebnis === 'neu' && / \| yoklama \| /.test(e.notiz)), `[2] tanıtım satırında 'yoklama' etiketi yok: ${JSON.stringify(L.filter(e => e.id === ilkYok))}`);
    if (bildi.length) {
      const yeni4 = await p.evaluate(ids => ids.filter(id => window.__tekrar.S.items[id] && window.__tekrar.S.items[id].yeni4), bildi);
      ok(!yeni4.length, '[3] ön testte bilinen kotaya sayıldı: ' + yeni4.join(','));
      const tur = L.filter(e => e.modus === 'tur').pop();
      ok(tur && new RegExp(`bildi:${bildi.length}\\b`).test(tur.notiz), `[3] tur satırında bildi:${bildi.length} yok: ${tur && tur.notiz}`);
    } else console.log('  (3 atlandı: partide ikinci ön test yoktu)');
    ok(!p.hatalar.length, '[2] sayfa hatası: ' + p.hatalar.join(' | '));
    await p.ctx.close();
  }

  // 4) normal tur (gerçek vadeler) + ön test hakkı bitmiş: ertelenen kelime tur sonundan önce sorulur
  {
    const p = await D.sayfa(b, { zustand: kopya({ gs4: { yoklama: 20 } }), saatOfs: SAAT - Date.now() });
    await p.waitForTimeout(400);
    await p.evaluate(() => window.__tekrar.starte('akis', 12));
    await p.waitForTimeout(300);
    let ertId = null, soruldu = false, s, ertN = 0;
    for (let i = 0; i < 40; i++) {
      s = await durum(p);
      if (s.typ === 'turSonu' || s.typ === 'leer' || s.bos) break;
      if (s.typ === 'tanit' && !s.kisa && !ertId && s.sorBtn) { ertId = s.id; ertN = s.n; await p.click('[data-act="tanit-sor"]'); await p.waitForTimeout(250); continue; }
      if (s.yoklama && s.id === ertId) { soruldu = true; await cevapla(p, s, true); continue; }
      if (s.yoklama) { await cevapla(p, s, true); continue; }
      await D.adim(p, { dogru: 1 });
    }
    if (ertId) ok(soruldu || ertN >= 11, `[4] ertelenen kelime (${ertId}, ${ertN}. cevapta) tur bitmeden sorulmadı`);
    else console.log('  (4 atlandı: turda tanıtım yoktu)');
    ok(!p.hatalar.length, '[4] sayfa hatası: ' + p.hatalar.join(' | '));
    await p.ctx.close();
  }

  // 5) "çeviri kötü" (20.11): cümleli soruda sonuç panelinde düğme → log akt;ceviri:<öğe> (Almanca cümle antwort'ta), düğme "not alındı" olur
  {
    const p = await D.sayfa(b, { zustand: kopya({}), saatOfs: SAAT - Date.now() });
    await p.waitForTimeout(400);
    await p.evaluate(() => window.__tekrar.starte('akis', 12));
    await p.waitForTimeout(300);
    let tiklandi = null;
    for (let i = 0; i < 30 && !tiklandi; i++) {
      const s = await durum(p);
      if (s.typ === 'turSonu' || s.typ === 'leer' || s.bos) break;
      const kontext = await p.evaluate(() => { const q = window.__tekrar.aktuell; return q && q.input && q.kontext ? q.kontext : null; });
      if (kontext) {
        await D.adim(p, { dogru: 1, sonucCek: async () => {
          if (await p.$('.sonuc [data-act="ceviri-kotu"]')) { await p.click('.sonuc [data-act="ceviri-kotu"]'); await p.waitForTimeout(80); tiklandi = { kontext, ok: !!(await p.$('.sonuc .cev-ok')) }; }
        } });
        continue;
      }
      await D.adim(p, { dogru: 1 });
    }
    ok(tiklandi && tiklandi.ok, '[5] "çeviri kötü" düğmesi yok ya da "not alındı" olmadı: ' + JSON.stringify(tiklandi));
    if (tiklandi) {
      const L = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'akt' && /^ceviri:/.test(e.id)));
      ok(L.length === 1 && L[0].antwort === tiklandi.kontext && L[0].ergebnis === 'kotu', '[5] çeviri log satırı: ' + JSON.stringify(L));
    }
    ok(!p.hatalar.length, '[5] sayfa hatası: ' + p.hatalar.join(' | '));
    await p.ctx.close();
  }

  await b.close();
  console.log(hata ? `e2e_yoklama: ${hata} hata` : 'e2e_yoklama: geçti (boş sırada "Biliyorum, sonra sor", ön testten gelen tanıtım, bildi, normal tur, çeviri kötü)');
  process.exit(hata ? 1 : 0);
})();
