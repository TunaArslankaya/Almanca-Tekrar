// Cümle çeşitliliği (Playwright gerekir): node tests/e2e_cumle.js
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur). Denetlenenler:
// kalıp cümleleri (KALIPLAR.satz) fiil havuzunda; çapraz dizin (CAPRAZ) az cümleli isim / kelimeye başka öğelerin cümlelerini katar (hepsi wortLuecke'den geçer);
// aynı (öğe, cümle) 30 günde en çok 2 kez (satzWahl → null = yazma; 31 gün sonra serbest), kök cümlesi (kokSatz) de;
// yazma sorusunda ipucu türü dönüşümlü (tr / trcumle / decumle; aynı öğe art arda aynı cümleli türü almaz), cümleli türde boşluktan önce artikel yok;
// turda yazma satırlarında notiz ipucu-tür:; sayfa hatası 0.
const D = require('./surucu');

const fehler = [];
const hata = m => { if (fehler.length < 40) fehler.push(m); };
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: e2e_cumle atlandı'); return; }
  const p = await D.sayfa(b, { zustand: D.zustandOku() });
  const r = await p.evaluate(() => {
    const T = window.__tekrar, S = T.S, out = { hata: [] };
    const h = m => out.hata.push(m);
    const ids = Object.keys(S.items).filter(id => T.VERBEN.find(v => v.id === id) || T.byId[id] || T.wById[id]);
    // 1) kalıp cümleleri ve çapraz dizin
    if (!window.KALIPLAR || !window.KALIPLAR.satz || !Object.keys(window.KALIPLAR.satz).length) h('KALIPLAR.satz yok');
    if (!window.CAPRAZ || !Object.keys(window.CAPRAZ).length) h('CAPRAZ yok');
    let kalip = 0, capraz = 0;
    ids.forEach(id => T.satzPool(id).own.forEach(x => {
      if (x.quelle === 'kalip') kalip++;
      if (x.capraz) { capraz++; if (!T.wortLuecke(id, x.de)) h(`çapraz cümlede kelime yok: ${id} ${x.de}`); }
    }));
    if (kalip < 20) h(`fiil havuzunda kalıp cümlesi az: ${kalip}`);
    if (capraz < 20) h(`havuzda çapraz cümle az: ${capraz}`);
    out.kalip = kalip; out.capraz = capraz;
    // 2) ipucu dönüşümü
    S.ipTur = {};
    const tur = { tr: 0, trcumle: 0, decumle: 0 };
    ids.forEach(id => {
      let son = null;
      for (let i = 0; i < 5; i++) {
        const ip = T.yazIpucu(id);
        tur[ip.tur]++;
        if (ip.tur === son && ip.tur !== 'tr') h(`art arda aynı ipucu türü: ${id} ${ip.tur}`);
        son = S.ipTur[id] = ip.tur;
      }
    });
    if (!tur.trcumle || !tur.tr) h('ipucu türleri çeşitlenmiyor: ' + JSON.stringify(tur));
    out.tur = tur;
    // cümleli soruda boşluktan hemen önce artikel / iyelik görünmesin; cevap sözlük biçimi
    let cumleli = 0;
    ids.filter(id => T.byId[id]).forEach(id => {
      S.ipTur[id] = 'tr';
      const q = T.frageYaz(id, false);
      if (!q.ipucuTur || q.ipucuTur === 'tr') return;
      cumleli++;
      const d = document.createElement('div'); d.innerHTML = q.html;
      const txt = d.querySelector('.soru').firstChild ? d.querySelector('.soru').textContent : '';
      const m = /(\S+)\s+_____/.exec(txt);
      if (m && /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)$/i.test(m[1])) h(`artikel ele veriliyor: ${id} ${txt}`);
      if (!q.kontext) h(`cümleli ipucunda kontext yok: ${id}`);
      if (q.ziel !== T.byId[id].art + ' ' + T.byId[id].lemma && !T.byId[id].plOnly) h(`cevap sözlük biçimi değil: ${id} ${q.ziel}`);
    });
    if (cumleli < 10) h(`cümleli yazma sorusu az: ${cumleli}`);
    // 3) 30 günde en çok 2
    const id0 = ids.find(id => T.byId[id] && T.satzPool(id).own.length >= 2);
    const pl = T.satzPool(id0), hepsi = pl.own.concat(pl.extra);
    hepsi.forEach(x => T.kxEkle(id0, x.de));
    const w1 = T.satzWahl(id0, 1);
    if (!w1) h('bir kez görülmüş cümle seçilmedi');
    hepsi.forEach(x => T.kxEkle(id0, x.de));
    if (T.satzWahl(id0, 1) || T.satzWahl(id0, 2)) h('iki kez görülmüş cümle yine seçildi');
    if (T.tazeCumle && T.tazeCumle(id0)) h('tazeCumle: iki kez görülmüş havuz taze sayıldı');
    T.saat(31 * 86400000);
    if (!T.satzWahl(id0, 1)) h('31 gün sonra cümle serbest olmalı');
    T.saat(-31 * 86400000);
    // 4) kök cümlesi: 8 soruda aynı cümle en çok 2
    T.VERBEN.filter(v => v.stark).slice(0, 40).forEach(v => {
      const c = {};
      for (let i = 0; i < 8; i++) { const q = T.kokSatz(v.id); if (q && q.kontext) { c[q.kontext] = (c[q.kontext] || 0) + 1; T.kxEkle(v.id, q.kontext); } }
      Object.entries(c).forEach(([s, n]) => { if (n > 2) h(`kök cümlesi ${n} kez: ${v.id} ${s}`); });
    });
    return out;
  });
  r.hata.forEach(hata);
  // 5) tur: yazma satırlarında ipucu-tür
  const p2 = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
  const log0 = await p2.evaluate(() => window.__tekrar.S.log.length);
  await p2.evaluate(() => window.__tekrar.starte('akis'));
  for (let i = 0; i < 40; i++) {
    const turBitti = await p2.evaluate(l0 => window.__tekrar.S.log.slice(l0).some(e => e.modus === 'tur'), log0);
    if (turBitti) break;
    const a = await D.adim(p2, { dogru: 0.7, rnd });
    if (a.ad === 'leer' || a.ad === 'yok' || /^bilinmeyen/.test(a.ad)) break;
  }
  const log = await p2.evaluate(l0 => window.__tekrar.S.log.slice(l0), log0);
  const yaz = log.filter(e => /bicim:yaz0?( |\|)/.test(e.notiz || ''));
  yaz.forEach(e => { if (!/ipucu-tür:(tr|trcumle|decumle)/.test(e.notiz)) hata(`yazma satırında ipucu-tür yok: ${e.id} ${e.notiz}`); });
  [p, p2].forEach(x => x.hatalar.forEach(m => hata('sayfa hatası: ' + m)));
  await b.close();
  console.log(`kalıp cümlesi ${r.kalip}, çapraz ${r.capraz}, ipucu türleri ${JSON.stringify(r.tur)}, turda yazma satırı ${yaz.length}`);
  if (fehler.length) { console.log('HATA:\n' + fehler.join('\n')); process.exit(1); }
  console.log('e2e_cumle: geçti');
})();
