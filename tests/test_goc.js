// node tests/test_goc.js — v5 göçü (M2): gerçek durumun KOPYASI ve sentetik senaryolarla Kern.goc / v3Yetis / birlestir / yazabilir / tageC.
// DOM'suz; daten/*.js vm ile yüklenir. log/zustand.json yalnız okunur (yoksa gerçek durum bölümü atlanır). Sayılar yazdırılır, sabitlenmez.
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.resolve(__dirname, '..');
const FSRS = require(path.join(R, 'js/fsrs.js'));
const K = require(path.join(R, 'js/kern.js'));
let fail = 0, n = 0;
const ok = (c, m, x) => { n++; if (!c) { fail++; console.log('✗', m, x !== undefined ? '\n   ' + JSON.stringify(x).slice(0, 400) : ''); } };
const eq = (a, b, m) => ok(a === b, m, { bekl: b, gelen: a });
const kopya = x => JSON.parse(JSON.stringify(x));
const DAY = 86400000, SAAT = 3600000;

// ---------- bağlam (app.js'teki Kern.init ile aynı) ----------
const win = {};
const vctx = vm.createContext({ window: win });
for (const f of ['nomen', 'verben', 'woerter', 'unite']) vm.runInContext(fs.readFileSync(path.join(R, 'daten', f + '.js'), 'utf8'), vctx);
const byId = Object.fromEntries(win.NOMEN.liste.map(x => [x.id, x]));
const vById = Object.fromEntries(win.VERBEN.map(x => [x.id, x]));
const wById = Object.fromEntries(win.WOERTER.map(x => [x.id, x]));
const kind = id => id[0] === 'v' ? 'v' : id[0] === 'w' ? 'w' : id[0] === 'p' ? 'p' : 'n';
const tierOf = id => ((kind(id) === 'v' ? vById : kind(id) === 'w' ? wById : byId)[id] || {}).tier || 2;
K.init({ kind, tierOf, byId, vById, wById, base: id => (vById[id] || {}).base || id, plOnly: id => !!(byId[id] || {}).plOnly });
const PROD = new Set(['wort', 'prod', 'abr', 'nsatz', 'satz', 'refl', 'ndek']), REK = new Set(['erk', 'bed']);
const gecerli = id => !!(kind(id) === 'v' ? vById[id] : kind(id) === 'w' ? wById[id] : kind(id) === 'n' ? byId[id] : null);

// app.js retGoc (aynen): ret seçilmemişse 0,9 → 0,85; göç bundan SONRA
const retGoc = S => { if (!S.retGoc) { if (!S.einst.retSecildi && (S.einst.ret == null || S.einst.ret === 0.9)) S.einst.ret = 0.85; S.retGoc = true; } };

// HEAD'deki (v3, M0 öncesi canlı) zustandBirlestir'in kopyası: eski istemcinin birleştirmesi (normalize = aynen)
function eskiZustandBirlestir(lok, uz) {
  if (!uz || typeof uz !== 'object' || !uz.karten) return lok;
  const m = Object.assign({}, uz, lok);
  const sonra = (a, b) => ((a && a.last) || 0) >= ((b && b.last) || 0) ? a : b;
  const birles = (k, f) => {
    const o = Object.assign({}, uz[k] || {});
    Object.entries(lok[k] || {}).forEach(([key, v]) => { o[key] = o[key] === undefined ? v : f(v, o[key]); });
    m[k] = o;
  };
  birles('karten', sonra);
  birles('items', (a, b) => Object.assign({}, b, a, { fehlTage: [...new Set([...(b.fehlTage || []), ...(a.fehlTage || [])])].sort() }));
  birles('tage', (a, b) => ((a.n || 0) >= (b.n || 0) ? a : b));
  birles('unite', (a, b) => Object.assign({}, b, a, { idx: Object.assign({}, b.idx, a.idx), done: Object.assign({}, b.done, a.done) }));
  ['kontext', 'iz', 'formGesehen', 'gelesen', 'kalipFav', 'aktSaetze', 'aktTexte', 'pakete', 'fiilMetin', 'kontrol'].forEach(k => birles(k, a => a));
  m.xpToplam = Math.max(lok.xpToplam || 0, uz.xpToplam || 0);
  if (uz.seri || lok.seri) { const a = lok.seri || {}, b = uz.seri || {}; m.seri = Object.assign({}, b, a, { rekor: Math.max(a.rekor || 0, b.rekor || 0), donmus: Object.assign({}, b.donmus, a.donmus) }); }
  if (uz.oyun || lok.oyun) m.oyun = Object.assign({}, uz.oyun, lok.oyun, { rekor: Math.max((lok.oyun || {}).rekor || 0, (uz.oyun || {}).rekor || 0) });
  m.einst = lok.einst && Object.keys(lok.karten || {}).length ? lok.einst : (uz.einst || lok.einst);
  m.log = lok.log; m.pending = lok.pending; m.ghPending = lok.ghPending;
  return m;
}
// app.js kernAc'in DOM'suz eşi: göç (öğe başına idempotent) + v3Yetis + gün toplamları
const ac = (S, t) => { K.goc(S, t, S.einst.ret); const y = K.v3Yetis(S, t); K.tageTuret(S); return y; };
// eski istemcinin bir cevabı: FSRS.review ile kart (benoten gibi), gün sayacı tage'e doğrudan
const eskiCevap = (S, u, g, t) => { S.karten[u] = Object.assign(FSRS.review(S.karten[u] || {}, g, t, S.einst.ret), {}); delete S.karten[u].neu; };

// ---------- invariantlar ----------
function nanVeSira(S) {
  let nan = 0, ters = 0;
  const bak = h => { if (!h || !h.S) return; if (!['S', 'D', 'last', 'due'].every(f => Number.isFinite(h[f]))) nan++; if (h.due < h.last) ters++; };
  Object.values(S.items).forEach(it => { bak(it.m); bak(it.art); });
  Object.values(S.kok || {}).forEach(bak);
  Object.values(S.pakete || {}).forEach(p => bak(p && p.m));
  // NaN hiçbir alanda: bütün durum
  const derin = x => { if (typeof x === 'number') { if (Number.isNaN(x)) nan++; } else if (x && typeof x === 'object') Object.values(x).forEach(derin); };
  derin(S);
  return { nan, ters };
}

// göç testleri göç ÖNCESİ (v3) kayıt ister: gerçek log/zustand.json 15.10'dan beri v4 → dondurulmuş kopya tests/fixtures/zustand_v3.json
const ZF = path.join(R, 'tests/fixtures/zustand_v3.json'), ZR = path.join(R, 'log/zustand.json');
const ZP = fs.existsSync(ZF) ? ZF : ZR;
const Z = fs.existsSync(ZP) ? JSON.parse(fs.readFileSync(ZP, 'utf8')) : null;
const T = new Date(2026, 9, 15, 19, 0, 0).getTime();

if (Z) {
  const ham = fs.readFileSync(ZP, 'utf8');
  console.log(`gerçek durum: ${Z.gespeichert} · kart ${Object.keys(Z.karten).length} · öğe ${Object.keys(Z.items).length} · ret ${Z.einst.ret}`);
  for (const ret of [0.85, 0.9]) {
    const S = kopya(Z);
    retGoc(S); S.einst.ret = ret;   // 0,9: "Sıkı" seçilmiş gibi
    const kartOnce = kopya(S.karten), kz = S.kontrol || {};
    const r = K.goc(S, T, ret);
    console.log(`  ret ${ret}: öğe:${r.oge} | m:${r.m} | yarım:${r.yarim} | art:${r.art} | kök:${r.kok} (S'li ${r.kokS}) | paket:${r.pak} | vadeli:${r.vadeli}` +
      ` · m kaynağı üretim ${r.mProd} / tanıma ${r.mRek} (indirimli ${r.mRekIndirim}) / yalnız biliyorum ${r.mSelbst}`);
    const { nan, ters } = nanVeSira(S);
    eq(nan, 0, `gerçek ${ret}: hiçbir alanda NaN yok`);
    eq(ters, 0, `gerçek ${ret}: m / art / kök / paket hafızalarında due ≥ last`);
    eq(JSON.stringify(S.karten), JSON.stringify(kartOnce), `gerçek ${ret}: göçten sonra karten bit bit aynı`);
    eq(JSON.stringify(S.kartenV3), JSON.stringify(kartOnce), `gerçek ${ret}: kartenV3 göç öncesi karten'e eşit`);
    const bir = JSON.stringify(S);
    K.goc(S, T + SAAT, ret);
    eq(JSON.stringify(S), bir, `gerçek ${ret}: göç idempotent (iki kez → aynı durum)`);
    eq(S.surum, 4, `gerçek ${ret}: surum 4`); ok(S.goc4 && S.goc4.zaman === T && S.goc4.v3Yedek === false, `gerçek ${ret}: goc4 bayrağı`, S.goc4);
    // kart grupları
    const kartlar = {};
    Object.entries(kartOnce).forEach(([u, c]) => { const i = u.lastIndexOf(':'); (kartlar[u.slice(0, i)] = kartlar[u.slice(0, i)] || []).push({ t: u.slice(i + 1), c }); });
    const guv = (id, c) => !(c.selbst && kz[id] && c.last === kz[id]);
    let t3 = 0, t3Hata = 0, sb = 0, sbHata = 0, iz = 0, izHata = 0, selbstSonAma = 0;
    Object.entries(S.items).forEach(([id, it]) => {
      if (!gecerli(id)) return;
      const ks = (kartlar[id] || []).filter(k => k.c && k.c.S && (PROD.has(k.t) || REK.has(k.t)));
      const guvP = ks.filter(k => PROD.has(k.t) && guv(id, k.c)), guvR = ks.filter(k => REK.has(k.t) && guv(id, k.c));
      const uretimHedef = kind(id) === 'v' || tierOf(id) <= 2 || it.quelle === 'unite' || !!it.a1;
      // tier-3 tanıma çapası indirimsiz
      if (!guvP.length && guvR.length && !uretimHedef) {
        t3++;
        const q = guvR.sort((a, b) => b.c.last - a.c.last)[0];
        if (!(it.m && it.m.S === q.c.S)) t3Hata++;
      }
      // yalnız "biliyorum"la kapanmış (bütün kanıt güvenilmez) → S ≤ 2, dogrula
      if (ks.length && !guvP.length && !guvR.length) { sb++; if (!(it.m && it.m.S <= 2 && it.m.dogrula === 1)) sbHata++; }
      const son = ks.slice().sort((a, b) => b.c.last - a.c.last)[0];
      if (son && !guv(id, son.c) && (guvP.length || guvR.length)) selbstSonAma++;
      // m'nin kaynağı izlenebilir: frm / stamm / art kartından değil, bir anlam ya da üretim kartından
      if (it.m && it.m.S) { iz++; if (!ks.some(k => k.c.last === it.m.last)) izHata++; }
    });
    ok(t3 > 0 && t3Hata === 0, `gerçek ${ret}: tier-3 tanıma çapası indirimsiz (${t3} öğe)`, { t3, t3Hata });
    ok(sb > 0 && sbHata === 0, `gerçek ${ret}: yalnız biliyorum'la kapanan öğede S ≤ 2, dogrula = 1 (${sb} öğe)`, { sb, sbHata });
    eq(izHata, 0, `gerçek ${ret}: her m bir anlam/üretim kartından (frm taşınmaz; ${iz} öğe)`);
    if (ret === 0.85) console.log(`    bilgi: son cevabı "biliyorum" olup daha eski güvenilir kartı olan ${selbstSonAma} öğe o karttan kuruldu`);
    // kök: 25 stamm fiili → formGesehen, kök hafızası
    const stamm = Object.keys(kartOnce).filter(u => u.endsWith(':stamm')).map(u => u.slice(0, -6));
    eq(stamm.filter(id => S.formGesehen && S.formGesehen[id]).length, stamm.length, `gerçek ${ret}: ${stamm.length} stamm fiilinin hepsinde formGesehen`);
    eq(stamm.filter(id => S.kok[vById[id].base]).length, stamm.length, `gerçek ${ret}: her stamm fiilinin kökü S.kok'ta`);
    const pak = Object.keys(kartOnce).filter(u => u.endsWith(':pak') && kartOnce[u].S).map(u => u.slice(0, -4));
    eq(pak.filter(pid => S.pakete[pid] && S.pakete[pid].m && S.pakete[pid].m.S).length, pak.length, `gerçek ${ret}: ${pak.length} paketin hepsinde pakete[pid].m`);
    const frm = Object.keys(kartOnce).filter(u => u.endsWith(':frm'));
    ok(!Object.keys(S).some(k => /frm/.test(k)) && Object.values(S.kok).every(k => !k.frm), `gerçek ${ret}: frm (${frm.length} kart) taşınmadı`);
    // gün sayaçları: eski günler tageC.v3, toplam aynı
    const gunler = Object.keys(Z.tage);
    eq(gunler.filter(g => S.tageC[g] && S.tageC[g].v3 && S.tage[g].n === Z.tage[g].n).length, gunler.length, `gerçek ${ret}: ${gunler.length} gün tageC.v3, toplamlar korundu`);
    eq(S.xpToplam, Object.values(S.tage).reduce((a, x) => a + (x.xp || 0), 0) + (S.xpTaban || 0), `gerçek ${ret}: xpToplam türetildi`);
  }
  ok(fs.readFileSync(ZP, 'utf8') === ham, 'log/zustand.json değişmedi');

  // ---------- senaryolar (gerçek kopya üzerinde) ----------
  const v4 = (t) => { const S = kopya(Z); retGoc(S); ac(S, t); return S; };
  const ilkOge = (S, tur) => Object.keys(S.karten).filter(u => u.endsWith(':' + tur) && S.karten[u].S && S.items[u.split(':')[0]] && S.items[u.split(':')[0]].m)[0];
  // (a) v3 uzak + v4 yerel: uzakta göçten sonra eski istemci bir cevap yazmış
  {
    const lok = v4(T);
    const uz = kopya(Z); retGoc(uz);
    const u = ilkOge(lok, 'wort'), id = u.split(':')[0];
    eskiCevap(uz, u, 1, T + 2 * SAAT);
    const m = K.birlestir(lok, uz);
    const y1 = ac(m, T + 3 * SAAT);
    eq(y1, 1, '(a) v3 uzak + v4 yerel: uzaktaki yeni cevap v3Yetis ile işlendi');
    eq(m.items[id].m.last, T + 2 * SAAT, '(a) cevabın zamanı öğe hafızasında'); eq(m.items[id].m.lastG, 1, '(a) notu (yanlış) öğede');
    const eksik = Object.keys(m.items).filter(i => gecerli(i) && !('m' in m.items[i]));
    eq(eksik.length, 0, '(a) her geçerli öğede m alanı var (yarım öğede null)');
    const once = JSON.stringify(m);
    eq(ac(m, T + 4 * SAAT), 0, '(a) ikinci çalıştırmada uygulanacak cevap yok (tam bir kez)');
    eq(JSON.stringify(m), once, '(a) ikinci çalıştırma durumu değiştirmez');
  }
  // (b) v4 uzak + eski v3 istemcinin cevabı (eski zustandBirlestir ile yazılmış)
  {
    const uz4 = v4(T);
    const eski = kopya(Z);   // eski cihazın yerel durumu (v3)
    const u = ilkOge(uz4, 'erk'), id = u.split(':')[0];
    const oncekiLast = uz4.items[id].m.last;
    eskiCevap(eski, u, 3, T + 5 * SAAT);
    const yazilan = eskiZustandBirlestir(eski, kopya(uz4));     // eski istemci uzaktakiyle birleştirip GitHub'a yazar
    ok(yazilan.surum === 4 && yazilan.goc4 && yazilan.items[id].m, '(b) eski istemci v4 alanlarını silmedi (surum, goc4, m)');
    const lok = v4(T + SAAT);
    const m = K.birlestir(lok, yazilan);
    const y = ac(m, T + 6 * SAAT);
    ok(y >= 1 && m.items[id].m.last === T + 5 * SAAT && m.items[id].m.last > oncekiLast, '(b) v3Yetis eski istemcinin cevabını öğe hafızasına uyguladı', { y, last: m.items[id].m.last });
    const once = JSON.stringify(m);
    eq(ac(m, T + 7 * SAAT), 0, '(b) ikinci çalıştırma: değişiklik yok'); eq(JSON.stringify(m), once, '(b) ikinci çalıştırma deep-equal');
  }
  // (c) v3 istemci bayat m yazmış: v4 cevabı m + gölge karta yazıldı, eski istemcinin yerel-kazanır birleştirmesi m'yi eskisiyle ezdi
  {
    const eskiYerel = v4(T);                 // eski cihaz bir ara v4 durumunu çekmişti (m'li), sonra eski koda döndü
    const uz = kopya(eskiYerel);
    const u = ilkOge(uz, 'wort'), id = u.split(':')[0];
    const bayat = kopya(uz.items[id].m);
    const yeniM = K.guncelle(uz.items[id].m, 3, T + 8 * SAAT, uz.einst.ret, 0);
    uz.items[id].m = yeniM;
    ok(K.golge(uz, id, 'wort', yeniM, T + 8 * SAAT), '(c) gölge kart yazıldı');
    const yazilan = eskiZustandBirlestir(eskiYerel, uz);
    eq(yazilan.items[id].m.last, bayat.last, '(c) eski istemcinin birleştirmesi m\'yi bayat bıraktı');
    eq(yazilan.karten[u].g4, T + 8 * SAAT, '(c) gölge kart (g4 = last) karten\'de kazandı');
    const y = ac(yazilan, T + 9 * SAAT);
    ok(y >= 1 && yazilan.items[id].m.last === T + 8 * SAAT && yazilan.items[id].m.S === yeniM.S && yazilan.items[id].m.D === yeniM.D, '(c) m gölge karttan onarıldı', { y, m: yazilan.items[id].m, yeniM });
    eq(ac(yazilan, T + 10 * SAAT), 0, '(c) onarım bir kez');
  }
  // (d) boş yerel: yazmaz · (e) uzak surum 5: birleştirmez, yazmaz
  {
    const uz = v4(T);
    const bos = { items: {}, karten: {}, surum: 4 };
    const d = K.yazabilir(bos, uz, 4);
    ok(d.birlestir && !d.yaz && d.sebep === 'bos-yerel', '(d) boş yerel (v4 uzak): yalnız birleştirir, yazmaz', d);
    const d3 = K.yazabilir(bos, kopya(Z), 4);
    ok(d3.birlestir && !d3.yaz, '(d) boş yerel (v3 uzak, kart sayısıyla): yazmaz', d3);
    const az = v4(T); Object.keys(az.items).slice(0, 150).forEach(i => { delete az.items[i]; });
    ok(!K.yazabilir(az, uz, 4).yaz, '(d) m\'li öğesi uzaktakinin yarısından az: yazmaz');
    ok(K.yazabilir(v4(T), uz, 4).yaz, '(d) normal v4 yerel: yazar');
    ok(K.yazabilir(v4(T), kopya(Z), 4).yaz, '(d) v4 yerel + v3 uzak: yazar');
    const e = K.yazabilir(v4(T), Object.assign(kopya(uz), { surum: 5 }), 4);
    ok(!e.birlestir && !e.yaz && e.sebep === 'yeni-sema', '(e) uzak surum 5: birleştirmez, yazmaz', e);
  }
  // (f) göçten ÖNCE başka cihazda verilmiş, bu cihazın göç anında çekmediği cevap (uygulama sırası: kernAc → ghCek → kernAc)
  {
    const lok = kopya(Z); retGoc(lok);
    const uz = kopya(Z); retGoc(uz);
    const u = Object.keys(uz.karten).find(k => k.endsWith(':wort') && uz.karten[k].S && uz.karten[k].last < T - 2 * SAAT), id = u.split(':')[0];
    eskiCevap(uz, u, 1, T - SAAT);
    ac(lok, T);
    const oncekiLast = lok.items[id].m.last;
    const m = K.birlestir(lok, uz);
    const y = ac(m, T + 60000);
    ok(y >= 1 && m.items[id].m.last === T - SAAT && m.items[id].m.lastG === 1 && oncekiLast < T - SAAT, '(f) göç öncesi çekilmemiş uzak cevap m\'ye işlendi', { y, last: m.items[id].m.last, g: m.items[id].m.lastG });
    eq(ac(m, T + 120000), 0, '(f) bir kez');
  }
  // (g) dört adım: masaüstü (eski) cevap → telefon (yeni, bayat) göç + birleştir + yaz → masaüstü eski kabukla çeker, yazar → masaüstü yeni koda geçer
  {
    const tel0 = kopya(Z); retGoc(tel0);
    const masa = kopya(Z); retGoc(masa);
    const u = Object.keys(masa.karten).find(k => k.endsWith(':wort') && masa.karten[k].S && masa.karten[k].last < T - 2 * SAAT), id = u.split(':')[0];
    eskiCevap(masa, u, 1, T - SAAT);
    ac(tel0, T);
    const tel = K.birlestir(tel0, kopya(masa)); ac(tel, T + 60000);
    const masa2 = eskiZustandBirlestir(masa, kopya(tel));
    const uzak = kopya(masa2);
    ac(masa2, T + 3 * SAAT);
    const son = K.birlestir(masa2, uzak); ac(son, T + 3 * SAAT + 60000);
    ok(son.items[id].m.last === T - SAAT && son.items[id].m.lastG === 1, '(g) dört adımlı geçişte masaüstünün yanlış cevabı m\'de', { last: son.items[id].m.last, g: son.items[id].m.lastG });
    ok(tel.items[id].m.last === T - SAAT, '(g) telefon da birleştirmede cevabı uyguladı');
  }
  // (h) yalnız uzakta olan öğe (yerel göç onu görmedi): m birleştirmeden sonra kurulur; göçün atladığı yeni tanıma kartı v3Yetis'te ikinci kez uygulanmaz
  {
    const lok = kopya(Z); retGoc(lok);
    const uz = kopya(Z); retGoc(uz);
    const id = Object.keys(uz.items).find(i => uz.karten[i + ':wort'] && uz.karten[i + ':wort'].S && uz.karten[i + ':erk'] && uz.karten[i + ':erk'].S && !uz.karten[i + ':wort'].selbst && !uz.karten[i + ':erk'].selbst);
    Object.keys(lok.karten).filter(u => u.startsWith(id + ':')).forEach(u => delete lok.karten[u]);
    delete lok.items[id];
    eskiCevap(uz, id + ':wort', 3, T - 3 * SAAT); eskiCevap(uz, id + ':erk', 1, T - SAAT);   // üretim eski, tanıma (yanlış) yeni
    ac(lok, T);
    ok(!lok.items[id], '(h) öğe yerelde yok');
    const m = K.birlestir(lok, uz); ac(m, T + 60000);
    ok(m.items[id].m && m.items[id].m.last === T - 3 * SAAT && m.items[id].m.lastG === 3, '(h) m üretim kartından kuruldu, yeni tanıma kartı uygulanmadı (göç kuralı)', m.items[id].m);
    ok(m.kartenV3[id + ':erk'] && m.kartenV3[id + ':erk'].last === T - SAAT, '(h) tüketilen kartlar kartenV3\'te');
    eq(ac(m, T + 120000), 0, '(h) ikinci çalıştırma: değişiklik yok');
  }
} else console.log('log/zustand.json yok: gerçek durum bölümü atlandı');

// ---------- G-Counter: iki cihaz aynı gün 20 + 30 cevap ----------
{
  const g = '2026-10-16';
  const cihaz = (ad, n, xp) => {
    const S = { items: {}, karten: {}, tage: {}, tageC: {}, einst: { ret: 0.85 }, xpTaban: 0 };
    const d = S.tageC[g] = { [ad]: { n: 0, richtig: 0, xp: 0, modi: { akis: { n: 0 } } } };
    for (let i = 0; i < n; i++) { d[ad].n++; d[ad].richtig++; d[ad].xp += xp; d[ad].modi.akis.n++; K.tageTuret(S, g); }
    return S;
  };
  const A = cihaz('A', 20, 5), B = cihaz('B', 30, 10);
  eq(A.tage[g].n, 20, 'G-Counter: A tek başına 20');
  const AB = K.birlestir(kopya(A), kopya(B)), BA = K.birlestir(kopya(B), kopya(A));
  eq(AB.tage[g].n, 50, 'G-Counter: A ← B birleştirmesi 50'); eq(BA.tage[g].n, 50, 'G-Counter: B ← A birleştirmesi 50');
  eq(AB.tage[g].modi.akis.n, 50, 'G-Counter: modi de toplanır');
  eq(AB.xpToplam, 20 * 5 + 30 * 10, 'G-Counter: xpToplam toplam'); eq(BA.xpToplam, 400, 'G-Counter: xpToplam iki yönde aynı');
  const AA = K.birlestir(kopya(AB), kopya(BA));
  eq(AA.tage[g].n, 50, 'G-Counter: tekrar birleştirmek çift saymaz');
  // A birleştirmeden sonra 5 cevap daha → 55
  AB.tageC[g].A.n += 5; K.tageTuret(AB, g);
  eq(K.birlestir(kopya(BA), AB).tage[g].n, 55, 'G-Counter: sonraki cevaplar eklenir');
  // göç günü: v3 sayacı (eski gün) + yerel
  const S = { items: {}, karten: {}, tage: { [g]: { n: 12, richtig: 10, xp: 40 } }, einst: { ret: 0.85 }, xpToplam: 100 };
  K.tageGoc(S);
  ok(S.tageC[g].v3 && S.tageC[g].v3.n === 12, 'tageGoc: eski gün tageC.v3');
  eq(S.xpTaban, 60, 'tageGoc: günlere dağılmamış puan xpTaban'); eq(S.xpToplam, 100, 'tageGoc: xpToplam korundu');
  S.tageC[g].A = { n: 3, xp: 9 }; K.tageTuret(S, g);
  eq(S.tage[g].n, 15, 'tageC: v3 + yerel toplamı'); eq(S.xpToplam, 109, 'tageC: xpToplam türetildi');
  const tek = JSON.stringify(S); K.tageGoc(S); eq(JSON.stringify(S), tek, 'tageGoc idempotent');
}

console.log(fail ? `test_goc: ${fail}/${n} HATA` : `test_goc: ${n} test geçti`);
process.exit(fail ? 1 : 0);
