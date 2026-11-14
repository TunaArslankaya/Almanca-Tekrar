// v5 akış simülasyonu (Playwright gerekir): node tests/sim_akis.js [zustand.json] [gün=14] [K=36] [δ=-0.4] [tohum=3]
// GRAM=0: turdaki gramer yuvası kapalı (varsayılan açık: o.gramVar, cevap tur adımına sayılır, hafızaya yazmaz; birikmede turda 1).
// 12.11: tohum başına 14 günde bm artışı (seviye atlama: yalnız ipucusuz, tam doğru cevap), anlam sorularında ipucusuz / ipuçlu pay,
// GUN + 1. günün vadeli anlam sayısı ve yeniden tanıtım kartı sayısı yazdırılır.
// 14.11: gerçek log (log.csv, son 3000 satır) verilip açılış düzenlemesi (Kern.duzen1411: askı, onarım, emeklilik) yeniden çalıştırılır;
// ek ölçüler: metin boşluğundan gelen bm artışı, gerçek vadeli tekrar payı, askıda, takılan yuvası, aynı öğe günde / turda ≥ 3 kez,
// yeni kelimenin ilk gün görülme sayısı. Simde ısınma yalnız günün ilk 3 cevabında (S.tage[g].n güncellenir).
// Günlük biçim payı (cevap içinde): seçmeli (sec/anla/metinde) · yazma (yaz0/yaz/kalip) · cümle (bos0/bos/cumle) · metin · artikel (flaş/artOb) (14.11: ses yuvası kaldırıldı).
// Gerçek durumun kopyası uygulamada açılır (göç), sonra çekirdek (Kern.sec → notVer → uygula → oturumIsle) günde K cevapla
// (12'lik turlar) simüle edilir. "Gerçek" başarı modeli: σ(logit R + d); seçmeli +0,5, ipuçlu (yaz0 / bos0) δ + 0,2, üretim δ.
// Kabul (tohum ortalaması): vadeli öğe 7. günde ≤ 0,8 × başlangıç; vadeli sayısı 3 gün üst üste artmıyor; kota hiç 0 değil (dönüş turu hariç);
// hafıza başına günde ≤ 1 kalıcı yazım. Günlük sayılar yazdırılır.
const D = require('./surucu');
const path = require('path');
const fs = require('fs');

const arg = process.argv.slice(2);
const dosya = path.resolve(__dirname, '..', arg[0] || 'log/zustand.json');
const GUN = +(arg[1] || 14), K = +(arg[2] || 36), DELTA = +(arg[3] || -0.4), TOHUM = +(arg[4] || 3), GRAM = process.env.GRAM !== '0';

// ';' ayırıcılı, tırnaklı alanlı CSV (log.csv)
function csvOku(t) {
  const out = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ';') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f.replace(/\r$/, '')); out.push(r); r = []; f = ''; }
    else f += c;
  }
  if (f || r.length) { r.push(f); out.push(r); }
  return out;
}
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
      const gunler = [], yazim = {}, ihlal = [], top = { bmArt: 0, ipsz: 0, ipl: 0, mSay: 0, rt: 0, gram: 0, cevap: 0, vadGercek: 0, takilan: 0, gun3: 0, gunOge: 0, gunMax: 0, tur3: 0, turMax: 0, yeniGor: 0, yeniSay: 0 };
      // 14.11: askıda öğe sayısı (açılışta otomatik askı), aynı öğenin günde / turda görülme sayısı (tanıtım ve yeniden tanıtım kartı dahil)
      top.aski = Object.values(S.items).filter(it => it.askida).length;
      const GERCEK = new Set(['vadeli', 'kurtarma', 'isinma', 'momentum', 'takilan']);
      const IPSZ = /^(yaz|bos|cumle|kalip|metin)$/, IPL = /^(yaz0|bos0)$/;
      const bas = Kr.gunBas4(Date.now()) + 15 * 3600000;   // 19:00
      for (let d = 0; d < o.GUN; d++) {
        let t = bas + d * DAY;
        const g = Kr.gun4(t), gs = { g, metin: 0, kok: 0, kokYeni: 0, yoklama: 0, ekYeni: 0, ekYeniTeklif: true, bonus: 0 };
        const vadeli = new Set(Kr.vadeliler(S, t, filtre).map(v => v.id)).size;
        const durum = { S, kap: o.K, gunSay: gs, donus: false };
        const kt = Kr.kota(durum, t);
        let cevap = 0, yeni = 0, dogru = 0, tekrar = 0, zor = 0, zorDogru = 0; const kats = {}, gExp = {}, yeniIds = [];
        const gor = (id, tExp) => { gExp[id] = (gExp[id] || 0) + 1; tExp[id] = (tExp[id] || 0) + 1; };
        const pay = { sec: 0, yaz: 0, cum: 0, met: 0, art: 0, kok: 0 };
        const payOf = b => /^(sec|anla|metinde)$/.test(b) ? 'sec' : /^(yaz0|yaz|kalip|yoklama)$/.test(b) ? 'yaz' : /^(bos0|bos|cumle)$/.test(b) ? 'cum' : /^(artikel|artOb)$/.test(b) ? 'art' : /^kok/.test(b) ? 'kok' : null;
        for (let tur = 0; tur < Math.ceil(o.K / 12); tur++) {
          const ot = { adim: 0, boy: 12, kuyruk: [], gecmis: [], filtre, gramVar: o.GRAM }, tExp = {};
          let n = 0, guard = 0;
          while (n < 12 && cevap < o.K && guard++ < 80) {
            // 14.11: günün cevap sayısı (ısınma yalnız günün ilk 3 cevabında; önceden simde her turun başı ısınmaydı)
            S.tage = S.tage || {}; S.tage[g] = Object.assign({}, S.tage[g], { n: cevap });
            const sel = Kr.sec(durum, ot, t, rnd);
            if (sel.tur === 'bitti') break;
            if (sel.tur === 'gram') { Kr.oturumIsle(ot, sel, { ergebnis: rnd() < 0.7 ? 'richtig' : 'falsch' }, rnd); n++; cevap++; top.gram++; t += 30000; continue; }
            if (sel.tur === 'parti') {
              const ids = [];
              sel.ids.forEach(id => {
                // yoklama: tier-1 / uluslararası adayın %50'si biliniyor
                if ((sel.yoklama || []).includes(id) && rnd() < 0.5) { Kr.uygula(S, id, Kr.notVer({ bicim: 'yoklama', tip: 'yoklama' }), t, {}); n++; cevap++; ot.adim++; return; }
                const it = S.items[id], yarim = !!(it && it.yarim);
                S.items[id] = Object.assign(it || { seit: t }, { tanit: t, yarim: 1 }, yarim ? { yarimGun: g } : { yeni4: g });
                ids.push(id); yeni++; yeniIds.push(id); gor(id, tExp);
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
                  const bm0 = h.bm || 0, out = Kr.uygula(S, id, Kr.notVer({ bicim: 'metin', tip: ok ? 'dogru' : 'yanlis' }), t, { b: 3 });
                  if ((S.items[id].m.bm || 0) > bm0) { top.bmArt++; top.bmMetin = (top.bmMetin || 0) + 1; }
                  if (out.m && out.m.yazildi) { const kk = d + '|' + id + '|m'; yazim[kk] = (yazim[kk] || 0) + 1; }
                }
                n++; cevap++; tekrar++; pay.met++; top.mSay++; top.ipsz++; if (ok) dogru++; ot.adim++; ot.gecmis.push({ id, bicim: 'metin', tur: 'metin' });
                gor(id, tExp); if (h.due <= t) top.vadGercek++;
                t += 15000;
              }
              continue;
            }
            const it = S.items[sel.id] || {};
            let p, sonuc;
            if (sel.tur === 'art') { p = sig(logit(kirp(Kr.R(it.art, t))) - 0.2); const ok = rnd() < p; sonuc = { bicim: sel.bicim, tip: 'flas', dogru: ok, sure: 2000 }; }
            else if (sel.tur === 'kok') { const kk = S.kok[sel.base] || {}; p = kk.S ? sig(logit(kirp(Kr.R(kk, t))) + o.DELTA) : 0.6; sonuc = { bicim: sel.bicim, tip: 'stamm', yanlis: rnd() < p ? 0 : 2 }; }
            else {
              const yeniOge = !(it.m && it.m.S) || sel.neden === 'mini' || sel.neden === 'ikinci';
              const off = sel.b <= 1 ? 0.5 : /0$/.test(sel.bicim) ? o.DELTA + 0.2 : o.DELTA;
              p = yeniOge ? (sel.neden === 'ikinci' ? 0.8 : 0.85) : sig(logit(kirp(Kr.R(it.m, t))) + off);
              const ok = rnd() < p, n_ = T.byId[sel.id] && !T.byId[sel.id].plOnly;
              const artSinandi = n_ && (sel.bicim === 'sec' || /^yaz/.test(sel.bicim));
              sonuc = { bicim: sel.bicim, tip: ok ? 'dogru' : 'yanlis', sure: 3000, zor: !!sel.zor, artikel: artSinandi && ok ? { sinandi: true, dogru: rnd() < (it.art && it.art.S ? sig(logit(kirp(Kr.R(it.art, t))) - 0.2) : 0.6), verilen: 'der', dogrusu: T.byId[sel.id].art } : null };
            }
            let not = Kr.notVer(sonuc);
            if (sel.neden === 'ikinci') not = Object.assign({}, not, { m: null, a: null, k: null });
            const bm0 = (it.m && it.m.bm) || 0;
            const out = Kr.uygula(S, sel.id, not, t, { b: sel.b });
            gor(sel.id, tExp); if (sel.yenidenTanit) gor(sel.id, tExp);
            if (GERCEK.has(sel.kaynak)) top.vadGercek++;
            if (sel.kaynak === 'takilan') top.takilan++;
            if (sel.tur === 'm') {
              top.mSay++; if (IPSZ.test(sel.bicim)) top.ipsz++; else if (IPL.test(sel.bicim)) top.ipl++;
              if (sel.yenidenTanit) top.rt++;
              if (((S.items[sel.id].m && S.items[sel.id].m.bm) || 0) > bm0) top.bmArt++;
            }
            ['m', 'a', 'k'].forEach(x => { if (out[x] && out[x].yazildi) { const kk = d + '|' + (x === 'k' ? sel.base : sel.id) + '|' + x; yazim[kk] = (yazim[kk] || 0) + 1; if (yazim[kk] > 1) ihlal.push(kk); } });
            const erg = not.ergebnis || (sonuc.tip === 'dogru' ? 'richtig' : 'falsch');
            if (sel.zor) { zor++; if (erg === 'richtig') zorDogru++; }
            const kat = sel.tur + ':' + (sel.neden || sel.kaynak) + ':' + sel.bicim; kats[kat] = (kats[kat] || 0) + 1;
            { const pk = payOf(sel.bicim); if (pk) pay[pk]++; }
            Kr.oturumIsle(ot, sel, { ergebnis: erg }, rnd);
            if (sel.tur === 'kok') gs.kok++;
            n++; cevap++;
            if (sel.neden !== 'mini' && sel.neden !== 'ikinci') { tekrar++; if (erg !== 'falsch') dogru++; }
            t += 15000;
          }
          t += 10 * 60000;
          Object.values(tExp).forEach(c => { if (c >= 3) top.tur3++; top.turMax = Math.max(top.turMax, c); });
        }
        top.cevap += cevap;
        Object.values(gExp).forEach(c => { top.gunOge++; if (c >= 3) top.gun3++; top.gunMax = Math.max(top.gunMax, c); });
        yeniIds.forEach(id => { top.yeniSay++; top.yeniGor += gExp[id] || 0; });
        const mVad = Kr.vadeliler(S, t, filtre).filter(v => v.tur === 'm').length, aVad = Kr.vadeliler(S, t, filtre).filter(v => v.tur === 'art').length;
        gunler.push({ d, vadeli, zor, zorDogru, q: kt.q, sebep: kt.sebep, yeni, cevap, pay, dogru: tekrar ? Math.round(dogru / tekrar * 100) : null, kats: o.DBG ? kats : null, son: o.DBG ? [mVad, aVad] : null });
      }
      top.vadSon = Kr.vadeliler(S, bas + o.GUN * DAY, filtre).filter(v => v.tur === 'm').length;
      top.vadSonArt = Kr.vadeliler(S, bas + o.GUN * DAY, filtre).filter(v => v.tur === 'art').length;
      top.askiSon = Object.values(S.items).filter(it => it.askida).length;
      sonuc.push({ tohum, gunler, top, ihlal: Object.entries(yazim).filter(([, v]) => v > 1).map(([k]) => k) });
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
  // 14.11: gerçek log (yanındaki log.csv, son 3000 satır) uygulamaya verilir ve açılış düzenlemesi (Kern.duzen1411: metin boşluğu onarımı)
  // log'la yeniden çalışır (uygulamada S.log açılışta hazırdır; testte localStorage'a yazmak yerine sonradan verilir). LOG=0: log yok.
  const logDosya = path.join(path.dirname(dosya), 'log.csv');
  if (process.env.LOG !== '0' && fs.existsSync(logDosya)) {
    const satir = csvOku(fs.readFileSync(logDosya, 'utf8').replace(/^\uFEFF/, ''));
    const bas = satir.shift() || [], log = satir.slice(-3000).map(r => Object.fromEntries(bas.map((k, i) => [k, r[i] || ''])));
    const d = await p.evaluate(log => { const T = window.__tekrar; T.S.log = log; delete T.S.onarim1411; return T.duzen1411 ? T.duzen1411() : null; }, log);
    if (d) console.log(`açılış düzenlemesi: askı ${(d.aski || []).length} (bu açılışta) · onarım ${(d.onarim || []).length}: ${(d.onarim || []).map(x => x.id + ' ' + x.S0.toFixed(1) + '→' + x.S1.toFixed(1)).join(', ')} · emekli ${d.emekli} · uzatma ${d.uzat}`);
  }
  {
    const ilk = await p.evaluate(() => { const T = window.__tekrar; return T.ilerleme ? T.ilerleme() : null; });
    if (ilk) console.log(`açılışta: askıda ${ilk.askida} (oto ${ilk.askiOto}) · emekli ${ilk.emekli} · takılan ${ilk.takilan} · vadeli anlam ${ilk.vadeli} / artikel ${ilk.vadeliArt} · ipucusuz bilinen ${ilk.ipucusuz} · önemli ${ilk.onemli.n}'den bilinen ${ilk.onemli.bilinen}`);
  }
  const r = await simule(p, { GUN, K, DELTA, TOHUM, GRAM, DBG: !!process.env.DBG });
  const fehler = [];
  // Yük ölçütleri tohumların ORTALAMASI üzerinden: tek tohumun 7. gün değeri gürültülü (aynı kodda 10 tohumda 57–81;
  // HEAD'de bile 10 tohumun 5'i tek başına ölçütü aşıyordu). Tohum başına değerler yazdırılır; kota ve yazım kuralı tohum başına.
  const ort = a => a.reduce((x, y) => x + y, 0) / a.length;
  r.forEach(x => {
    console.log(`tohum ${x.tohum}: gün · vadeli · kota (sebep) · yeni · cevap · doğruluk · zor soru (doğru) · pay %: seçmeli / yazma / cümle / metin / artikel`);
    const yz = (a, c) => c ? Math.round(a / c * 100) : 0;
    x.gunler.forEach(g => console.log(`  ${String(g.d + 1).padStart(2)}  ${String(g.vadeli).padStart(3)}  ${g.q} (${g.sebep})  ${g.yeni}  ${g.cevap}  ${g.dogru == null ? '–' : '%' + g.dogru}  ${g.zor} (${g.zorDogru})  ${['sec', 'yaz', 'cum', 'met', 'art'].map(k => yz(g.pay[k], g.cevap)).join('/')}${g.kats ? '  ' + JSON.stringify(g.kats) + ' gün sonu m/art vadeli ' + g.son : ''}`));
    x.gunler.forEach(g => { if (!g.q) fehler.push(`tohum ${x.tohum}: ${g.d + 1}. gün kota 0`); });
    if (x.ihlal.length) fehler.push(`tohum ${x.tohum}: günde ikinci kalıcı yazım: ${x.ihlal.slice(0, 5).join(', ')}`);
  });
  const gunSay = Math.min(...r.map(x => x.gunler.length));
  const v = Array.from({ length: gunSay }, (_, d) => ort(r.map(x => x.gunler[d].vadeli)));
  console.log(`ortalama vadeli: ${v.map(x => x.toFixed(1)).join(' ')}`);
  {
    const tp = k => ort(r.map(x => x.top[k]));
    console.log(`seviye (tohum ortalaması, ${GUN} gün): bm artışı ${tp('bmArt').toFixed(1)} (metin boşluğundan ${(r.reduce((a, x) => a + (x.top.bmMetin || 0), 0) / r.length).toFixed(1)}) · anlam sorusu ${tp('mSay').toFixed(0)}: ipucusuz %${(100 * tp('ipsz') / (tp('mSay') || 1)).toFixed(0)} · ipuçlu %${(100 * tp('ipl') / (tp('mSay') || 1)).toFixed(0)} · yeniden tanıtım ${tp('rt').toFixed(1)} · gramer ${tp('gram').toFixed(0)} · ${GUN + 1}. gün vadeli anlam ${tp('vadSon').toFixed(0)} (artikel ${tp('vadSonArt').toFixed(0)})`);
    // 14.11 ölçüleri: gerçek vadeli tekrar payı (vadeli / kurtarma / ısınma / momentum / takılan yuvası / vadeli metin boşluğu), askı, takılan yuvası,
    // aynı öğe günde ≥ 3 kez görülen (öğe-gün) payı ve en çok, turda ≥ 3 kez (öğe-tur) sayısı, yeni kelimenin ilk gününde görülme ortalaması
    console.log(`tekrar (tohum ortalaması): gerçek vadeli tekrar %${(100 * tp('vadGercek') / (tp('cevap') || 1)).toFixed(0)} · askıda ${tp('aski').toFixed(0)} → ${tp('askiSon').toFixed(0)} · takılan yuvası ${tp('takilan').toFixed(1)} · aynı öğe günde ≥ 3: %${(100 * tp('gun3') / (tp('gunOge') || 1)).toFixed(1)} (en çok ${Math.max(...r.map(x => x.top.gunMax))}) · turda ≥ 3: ${tp('tur3').toFixed(1)} (en çok ${Math.max(...r.map(x => x.top.turMax))}) · yeni kelime ilk gün ${(tp('yeniGor') / (tp('yeniSay') || 1)).toFixed(1)} kez (${tp('yeniSay').toFixed(0)} yeni)`);
  }
  // turda biçim payı (bütün tohum ve günler): seçmeli ve yazma oranı (6.11, S4: seçmeli yalnız tanıtım günü / ilk tekrar)
  {
    const top = k => r.reduce((a, x) => a + x.gunler.reduce((b, g) => b + (k ? g.pay[k] : g.cevap), 0), 0), N = top(null) || 1, yz = k => (top(k) / N * 100).toFixed(1);
    console.log(`turda biçim payı (cevap ${N}): seçmeli %${yz('sec')} · yazma %${yz('yaz')} · cümle %${yz('cum')} · metin %${yz('met')} · artikel %${yz('art')} · kök %${yz('kok')}`);
  }
  // Ölçütler birikme yüksekken (başlangıç > denge) anlamlı; denge ≈ 2,5 × günlük cevap (K=36 → 90): düşük başlangıçta vadeli dengeye kadar çıkabilir
  const denge = 2.5 * K, tavan = Math.max(v[0], denge);
  // başlangıç durumunun günlük yükü (anlam + artikel hafızası; aralık ≈ 1,9 × S, en çok 60 gün): yük > K ise günde K cevapla vadeli dengeye inemez,
  // o zaman ölçüt "büyümüyor": 2. haftada son gün ≤ 1,1 × 8. gün (gerçek kayıt 18.10: 202 öğe, yük ≈ 40 > 36)
  // anlam + artikel hafızası (artikel flaşı da günlük cevaptan yer; 26.10'da yalnız anlamla yük 33 görünüp vadeli 117'de sabitti)
  const hy = h => h && h.S ? 1 / Math.min(60, Math.max(1, 1.9 * h.S)) : 0;
  const yuk = Object.values(JSON.parse(Z).items || {}).reduce((a, x) => a + hy(x.m) + hy(x.art), 0);
  const asiri = yuk > K;
  console.log(`başlangıç günlük yükü ≈ ${yuk.toFixed(1)} (K=${K})${asiri ? ': kapasite aşılıyor, büyüme ölçütü' : ''}`);
  // birikme inmeli (7. gün ≤ 0,8 × başlangıç): yalnız günlük yük kapasitenin altındayken anlamlı
  if (!asiri && v.length >= 7 && v[0] > denge && v[6] > 0.8 * v[0]) fehler.push(`ortalama: 7. gün vadeli ${v[6].toFixed(1)} > 0,8 × ${v[0].toFixed(1)}`);
  if (asiri && v.length >= 14 && v[13] > 1.1 * v[7]) fehler.push(`ortalama: yük > K iken 2. haftada büyüme: 8. gün ${v[7].toFixed(1)} → 14. gün ${v[13].toFixed(1)}`);
  // yankı dalgası: ilk günlerde cevaplanan kartlar 8–12 gün sonra birlikte döner (+15–25, sonra iner); büyüme sayılmaz.
  // Büyüme ölçütü: ikinci haftanın (8–14. gün) ortalaması başlangıcı aşmasın, son gün başlangıcı aşmasın
  if (!asiri && v.length >= 14 && ort(v.slice(7, 14)) > tavan) fehler.push(`ortalama: 2. hafta ortalama vadeli ${ort(v.slice(7, 14)).toFixed(0)} > tavan ${tavan.toFixed(0)}`);
  if (!asiri && v.length >= 14 && v[13] > tavan) fehler.push(`ortalama: 14. gün vadeli ${v[13].toFixed(1)} > tavan ${tavan.toFixed(0)}`);
  if (p.hatalar.length) fehler.push('sayfa hataları: ' + p.hatalar.join(' | '));
  await b.close();
  if (fehler.length) { console.log('HATA:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log(`sim_akis geçti (${GUN} gün, K=${K}, δ ${DELTA}, ${TOHUM} tohum)`);
})();
