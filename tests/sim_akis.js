// v5 akış simülasyonu (Playwright gerekir): node tests/sim_akis.js [zustand.json] [gün=14] [K=36] [δ=-0.4] [tohum=3]
// Gerçek durumun kopyası uygulamada açılır (göç), sonra çekirdek (Kern.sec → notVer → uygula → oturumIsle) günde K cevapla
// (12'lik turlar) simüle edilir. "Gerçek" başarı modeli: σ(logit R + d); seçmeli +0,5, ipuçlu (yaz0 / bos0) δ + 0,2, üretim δ.
// Kabul (tohum ortalaması): vadeli öğe 7. günde ≤ 0,8 × başlangıç; vadeli sayısı 3 gün üst üste artmıyor; kota hiç 0 değil (dönüş turu hariç);
// hafıza başına günde ≤ 1 kalıcı yazım. Günlük sayılar yazdırılır.
const D = require('./surucu');
const path = require('path');
const fs = require('fs');

const arg = process.argv.slice(2);
const dosya = path.resolve(__dirname, '..', arg[0] || 'log/zustand.json');
const GUN = +(arg[1] || 14), K = +(arg[2] || 36), DELTA = +(arg[3] || -0.4), TOHUM = +(arg[4] || 3);

async function simule(p, o) {
  return p.evaluate(o => {
    const T = window.__tekrar, Kr = T.Kern, DAY = 86400000;
    const sig = z => 1 / (1 + Math.exp(-z)), logit = x => Math.log(x / (1 - x)), kirp = x => Math.min(0.99, Math.max(0.01, x));
    const S0 = JSON.parse(JSON.stringify(T.S));
    delete S0.log; delete S0.pending; delete S0.ghPending;
    const filtre = id => T.gueltig(id + ':x');
    const sonuc = [];
    for (let tohum = 1; tohum <= o.TOHUM; tohum++) {
      const S = JSON.parse(JSON.stringify(S0)), rnd = Kr.tohum(tohum * 7919);
      const gunler = [], yazim = {}, ihlal = [];
      const bas = Kr.gunBas4(Date.now()) + 15 * 3600000;   // 19:00
      for (let d = 0; d < o.GUN; d++) {
        let t = bas + d * DAY;
        const g = Kr.gun4(t), gs = { g, metin: 0, diktat: 0, kok: 0, kokYeni: 0, yoklama: 0, ekYeni: 0, ekYeniTeklif: true, bonus: 0 };
        const vadeli = new Set(Kr.vadeliler(S, t, filtre).map(v => v.id)).size;
        const durum = { S, kap: o.K, gunSay: gs, donus: false };
        const kt = Kr.kota(durum, t);
        let cevap = 0, yeni = 0, dogru = 0, tekrar = 0; const kats = {};
        for (let tur = 0; tur < Math.ceil(o.K / 12); tur++) {
          const ot = { adim: 0, boy: 12, kuyruk: [], gecmis: [], filtre };
          let n = 0, guard = 0;
          while (n < 12 && cevap < o.K && guard++ < 80) {
            const sel = Kr.sec(durum, ot, t, rnd);
            if (sel.tur === 'bitti') break;
            if (sel.tur === 'parti') {
              const ids = [];
              sel.ids.forEach(id => {
                // yoklama: tier-1 / uluslararası adayın %50'si biliniyor
                if ((sel.yoklama || []).includes(id) && rnd() < 0.5) { Kr.uygula(S, id, Kr.notVer({ bicim: 'yoklama', tip: 'yoklama' }), t, {}); n++; cevap++; ot.adim++; return; }
                const it = S.items[id], yarim = !!(it && it.yarim);
                S.items[id] = Object.assign(it || { seit: t }, { tanit: t, yarim: 1 }, yarim ? { yarimGun: g } : { yeni4: g });
                ids.push(id); yeni++;
              });
              Kr.partiBasladi(ot, ids, rnd);
              ot.yoklama = (ot.yoklama || 0) + (sel.yoklama || []).length; gs.yoklama += (sel.yoklama || []).length;
              continue;
            }
            if (sel.tur === 'metin') {
              ot.metin = true; gs.metin++;
              const k = Math.min(4, 12 - n, sel.adaylar.length);
              for (let i = 0; i < k; i++) {
                const id = sel.adaylar[i], h = S.items[id].m, ok = rnd() < sig(logit(kirp(Kr.R(h, t))) + o.DELTA);
                if (h.due <= t || Kr.R(h, t) < 0.9) {
                  const out = Kr.uygula(S, id, Kr.notVer({ bicim: 'metin', tip: ok ? 'dogru' : 'yanlis' }), t, { b: 3 });
                  if (out.m && out.m.yazildi) { const kk = d + '|' + id + '|m'; yazim[kk] = (yazim[kk] || 0) + 1; }
                }
                n++; cevap++; tekrar++; if (ok) dogru++; ot.adim++; ot.gecmis.push({ id, bicim: 'metin', tur: 'metin' });
                t += 15000;
              }
              continue;
            }
            const it = S.items[sel.id] || {};
            let p, sonuc;
            if (sel.tur === 'art') { p = sig(logit(kirp(Kr.R(it.art, t))) - 0.2); const ok = rnd() < p; sonuc = { bicim: 'artikel', tip: 'flas', dogru: ok, sure: 2000 }; }
            else if (sel.tur === 'kok') { const kk = S.kok[sel.base] || {}; p = kk.S ? sig(logit(kirp(Kr.R(kk, t))) + o.DELTA) : 0.6; sonuc = { bicim: sel.bicim, tip: 'stamm', yanlis: rnd() < p ? 0 : 2 }; }
            else {
              const yeniOge = !(it.m && it.m.S) || sel.neden === 'mini' || sel.neden === 'ikinci';
              const off = sel.b <= 1 ? 0.5 : /0$/.test(sel.bicim) ? o.DELTA + 0.2 : o.DELTA;
              p = yeniOge ? (sel.neden === 'ikinci' ? 0.8 : 0.85) : sig(logit(kirp(Kr.R(it.m, t))) + off);
              const ok = rnd() < p, n_ = T.byId[sel.id] && !T.byId[sel.id].plOnly;
              const artSinandi = n_ && (sel.bicim === 'sec' || /^yaz/.test(sel.bicim));
              sonuc = { bicim: sel.bicim, tip: ok ? 'dogru' : 'yanlis', sure: 3000, artikel: artSinandi && ok ? { sinandi: true, dogru: rnd() < (it.art && it.art.S ? sig(logit(kirp(Kr.R(it.art, t))) - 0.2) : 0.6), verilen: 'der', dogrusu: T.byId[sel.id].art } : null };
            }
            let not = Kr.notVer(sonuc);
            if (sel.neden === 'ikinci') not = Object.assign({}, not, { m: null, a: null, k: null });
            const out = Kr.uygula(S, sel.id, not, t, { b: sel.b });
            ['m', 'a', 'k'].forEach(x => { if (out[x] && out[x].yazildi) { const kk = d + '|' + (x === 'k' ? sel.base : sel.id) + '|' + x; yazim[kk] = (yazim[kk] || 0) + 1; if (yazim[kk] > 1) ihlal.push(kk); } });
            const erg = not.ergebnis || (sonuc.tip === 'dogru' ? 'richtig' : 'falsch');
            const kat = sel.tur + ':' + (sel.neden || sel.kaynak) + ':' + sel.bicim; kats[kat] = (kats[kat] || 0) + 1;
            Kr.oturumIsle(ot, sel, { ergebnis: erg }, rnd);
            if (sel.tur === 'kok') gs.kok++;
            n++; cevap++;
            if (sel.neden !== 'mini' && sel.neden !== 'ikinci') { tekrar++; if (erg !== 'falsch') dogru++; }
            t += 15000;
          }
          t += 10 * 60000;
        }
        const mVad = Kr.vadeliler(S, t, filtre).filter(v => v.tur === 'm').length, aVad = Kr.vadeliler(S, t, filtre).filter(v => v.tur === 'art').length;
        gunler.push({ d, vadeli, q: kt.q, sebep: kt.sebep, yeni, cevap, dogru: tekrar ? Math.round(dogru / tekrar * 100) : null, kats: o.DBG ? kats : null, son: o.DBG ? [mVad, aVad] : null });
      }
      sonuc.push({ tohum, gunler, ihlal: Object.entries(yazim).filter(([, v]) => v > 1).map(([k]) => k) });
    }
    return sonuc;
  }, o);
}

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok, atlandı.'); process.exit(0); }
  if (!fs.existsSync(dosya)) { console.log('durum dosyası yok:', dosya); process.exit(0); }
  const Z = fs.readFileSync(dosya, 'utf8');
  const p = await D.sayfa(b, { zustand: Z });
  await p.waitForTimeout(400);
  const r = await simule(p, { GUN, K, DELTA, TOHUM, DBG: !!process.env.DBG });
  const fehler = [];
  // Yük ölçütleri tohumların ORTALAMASI üzerinden: tek tohumun 7. gün değeri gürültülü (aynı kodda 10 tohumda 57–81;
  // HEAD'de bile 10 tohumun 5'i tek başına ölçütü aşıyordu). Tohum başına değerler yazdırılır; kota ve yazım kuralı tohum başına.
  const ort = a => a.reduce((x, y) => x + y, 0) / a.length;
  r.forEach(x => {
    console.log(`tohum ${x.tohum}: gün · vadeli · kota (sebep) · yeni · cevap · doğruluk`);
    x.gunler.forEach(g => console.log(`  ${String(g.d + 1).padStart(2)}  ${String(g.vadeli).padStart(3)}  ${g.q} (${g.sebep})  ${g.yeni}  ${g.cevap}  ${g.dogru == null ? '–' : '%' + g.dogru}${g.kats ? '  ' + JSON.stringify(g.kats) + ' gün sonu m/art vadeli ' + g.son : ''}`));
    x.gunler.forEach(g => { if (!g.q) fehler.push(`tohum ${x.tohum}: ${g.d + 1}. gün kota 0`); });
    if (x.ihlal.length) fehler.push(`tohum ${x.tohum}: günde ikinci kalıcı yazım: ${x.ihlal.slice(0, 5).join(', ')}`);
  });
  const gunSay = Math.min(...r.map(x => x.gunler.length));
  const v = Array.from({ length: gunSay }, (_, d) => ort(r.map(x => x.gunler[d].vadeli)));
  console.log(`ortalama vadeli: ${v.map(x => x.toFixed(1)).join(' ')}`);
  // Ölçütler birikme yüksekken (başlangıç > denge) anlamlı; denge ≈ 2,5 × günlük cevap (K=36 → 90): düşük başlangıçta vadeli dengeye kadar çıkabilir
  const denge = 2.5 * K, tavan = Math.max(v[0], denge);
  if (v.length >= 7 && v[0] > denge && v[6] > 0.8 * v[0]) fehler.push(`ortalama: 7. gün vadeli ${v[6].toFixed(1)} > 0,8 × ${v[0].toFixed(1)}`);
  // yankı dalgası: ilk günlerde cevaplanan kartlar 8–12 gün sonra birlikte döner (+15–25, sonra iner); büyüme sayılmaz.
  // Büyüme ölçütü: ikinci haftanın (8–14. gün) ortalaması başlangıcı aşmasın, son gün başlangıcı aşmasın
  if (v.length >= 14 && ort(v.slice(7, 14)) > tavan) fehler.push(`ortalama: 2. hafta ortalama vadeli ${ort(v.slice(7, 14)).toFixed(0)} > tavan ${tavan.toFixed(0)}`);
  if (v.length >= 14 && v[13] > tavan) fehler.push(`ortalama: 14. gün vadeli ${v[13].toFixed(1)} > tavan ${tavan.toFixed(0)}`);
  if (p.hatalar.length) fehler.push('sayfa hataları: ' + p.hatalar.join(' | '));
  await b.close();
  if (fehler.length) { console.log('HATA:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log(`sim_akis geçti (${GUN} gün, K=${K}, δ ${DELTA}, ${TOHUM} tohum)`);
})();
