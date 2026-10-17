// node tests/test_kern.js — v5 çekirdeği (js/kern.js): DOM'suz, sentetik bağlam ve sentetik durumla
const FSRS = require('../js/fsrs.js');
const K = require('../js/kern.js');
let fail = 0, n = 0;
const ok = (c, m, x) => { n++; if (!c) { fail++; console.log('✗', m, x !== undefined ? '\n   ' + JSON.stringify(x) : ''); } };
const eq = (a, b, m) => ok(a === b, m, { bekl: b, gelen: a });
const yakin = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m, { bekl: b, gelen: +a.toFixed(3) });
const DAY = 86400000, SAAT = 3600000;
const T = new Date(2026, 9, 15, 19, 0, 0).getTime();   // 15.10.2026 19:00 (yerel)
const W = FSRS.W, DECAY = -W[20], FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
const gecen = (S, R) => S / FACTOR * (Math.pow(R, 1 / DECAY) - 1);   // R'ye inmek için geçen gün

// ---------- sentetik bağlam ----------
const byId = {
  n1: { id: 'n1', art: 'der', lemma: 'Tisch', tier: 2 }, n2: { id: 'n2', art: 'die', lemma: 'Praxis', tier: 3 },
  n3: { id: 'n3', art: 'das', lemma: 'Fenster', tier: 3 }, n4: { id: 'n4', art: 'die', lemma: 'Rechnung', tier: 1 },
  n5: { id: 'n5', art: 'der', lemma: 'Kollege', tier: 2 }, n6: { id: 'n6', art: 'die', lemma: 'Leute', tier: 2, plOnly: true },
};
const vById = { v1: { id: 'v1', base: 'fahren', tier: 2 }, v2: { id: 'v2', base: 'warten', tier: 2 }, v3: { id: 'v3', base: 'abfahren', tier: 3 } };
const wById = { w1: { id: 'w1', tier: 3, lemma: 'ziemlich' }, w2: { id: 'w2', tier: 1, lemma: 'oft' } };
const kind = id => id[0] === 'v' ? 'v' : id[0] === 'w' ? 'w' : id[0] === 'p' ? 'p' : 'n';
const tierOf = id => (byId[id] || vById[id] || wById[id] || { tier: 2 }).tier;
const UNITE = new Set(['n3']);
const ctx = {
  kind, tierOf, byId, vById, wById, base: id => (vById[id] || {}).base || id, plOnly: id => !!(byId[id] || {}).plOnly,
  trKey: id => ({ n1: 'masa', n2: 'muayenehane' })[id] || id, lemma: id => (byId[id] || wById[id] || {}).lemma || (vById[id] || {}).base || id,
  uluslararasi: id => id === 'n2', uniteKonu: id => UNITE.has(id), stark: id => id === 'v1',
  BLITZ_ORDER: ['n7', 'n8', 'n9', 'n10'], VERB_ORDER: ['v7', 'v8'], tierOf_: tierOf,
  LEX: new Set(['legen', 'liegen', 'staat', 'stadt']),
};
K.init(ctx);
const yeniS = (items, extra) => Object.assign({ items, einst: { ret: 0.85 }, tage: {}, karten: {} }, extra || {});
const h = (S, R, x) => Object.assign({ S, D: 5, last: T - gecen(S, R) * DAY, due: T - 1000, reps: 3, lapses: 0, lastG: 3, pk: 2 }, x || {});
const R99 = () => 0.99;

// ---------- fsrs geriye uyum: opts'suz çağrı eski (HEAD) formülle bit bit aynı ----------
function reviewEski(card, g, now, retention) {
  retention = retention || 0.9;
  const clampD = d => Math.min(10, Math.max(1, d)), initS = g => Math.max(W[g - 1], 0.01), initD = g => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);
  const nextD = (D, g) => clampD(W[7] * initD(4) + (1 - W[7]) * (D + (-W[6] * (g - 3)) * (10 - D) / 9));
  const sRecall = (D, S, R, g) => S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
  const sForget = (D, S, R) => Math.min(W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)), S / Math.exp(W[17] * W[18]));
  const sShort = (S, g) => { let s = S * Math.exp(W[17] * (g - 3 + W[18])) * Math.pow(S, -W[19]); if (g >= 3) s = Math.max(s, S); return s; };
  const c = Object.assign({ reps: 0, lapses: 0 }, card);
  if (!c.S) { c.S = initS(g); c.D = initD(g); } else {
    const el = (now - c.last) / DAY;
    if (el < 1) c.S = sShort(c.S, g); else { const R = Math.pow(1 + FACTOR * el / c.S, DECAY); c.S = g === 1 ? sForget(c.D, c.S, R) : sRecall(c.D, c.S, R, g); }
    c.D = nextD(c.D, g);
  }
  c.reps += 1; if (g === 1) c.lapses += 1; c.last = now;
  c.due = g === 1 ? now + 10 * 60000 : now + Math.min(3650, Math.max(1, Math.round(c.S / FACTOR * (Math.pow(retention, 1 / DECAY) - 1)))) * DAY;
  c.lastG = g; return c;
}
{
  const rnd = K.tohum(42); let fark = 0;
  for (let i = 0; i < 2000; i++) {
    const kart = rnd() < 0.1 ? {} : { S: 0.1 + rnd() * 60, D: 1 + rnd() * 9, last: T - rnd() * 40 * DAY, reps: 3, lapses: 1 };
    const g = 1 + Math.floor(rnd() * 4), ret = [undefined, 0.8, 0.85, 0.9][i % 4];
    const a = FSRS.review(kart, g, T, ret), b = reviewEski(kart, g, T, ret);
    if (JSON.stringify(a) !== JSON.stringify(b)) fark++;
    const c0 = FSRS.review(kart, g, T, ret, { c: 0 });   // c = 0 da aynı
    if (JSON.stringify(c0) !== JSON.stringify(b)) fark++;
  }
  eq(fark, 0, 'fsrs: opts\'suz ve c=0 çağrılar HEAD formülüyle bit bit aynı');
}
// opts.uzun: elapsed < 1 olsa da sShortTerm kullanılmaz
{
  const kart = { S: 5, D: 5, last: T - 0.3 * DAY, reps: 2, lapses: 0 };
  const u = FSRS.review(kart, 1, T, 0.85, { uzun: true }), k = FSRS.review(kart, 1, T, 0.85);
  ok(u.S !== k.S, 'fsrs uzun: kısa ara dalı (sShortTerm) atlandı', { u: u.S, k: k.S });
}

// ---------- §4.1 biçim ofseti: D=5, S=4, R=0,85, ret 0,85 ----------
const ornek = (bicim, ek) => K.guncelle({ S: 4, D: 5, last: T - gecen(4, 0.85) * DAY, reps: 3, lapses: 0, pk: 2 }, 3, T, 0.85, K.OFS[bicim] + (ek || 0));
yakin(K.R({ S: 4, last: T - gecen(4, 0.85) * DAY }, T), 0.85, 1e-9, 'R = 0,85 kurulumu');
yakin(ornek('sec').S, 7.8, 0.1, '§4.1 sec → S 7,8');
['anla', 'metinde', 'yaz0', 'bos0'].forEach(b => yakin(ornek(b).S, 13.9, 0.1, `§4.1 ${b} → S 13,9`));
['yaz', 'bos', 'cumle', 'metin'].forEach(b => yakin(ornek(b).S, 19.7, 0.1, `§4.1 ${b} → S 19,7`));
eq(Math.round((ornek('sec').due - T) / DAY), 15, '§4.1 sec aralığı 15 g');
eq(Math.round((ornek('yaz').due - T) / DAY), 38, '§4.1 yaz aralığı 38 g (pk ≥ 2)');
// yanlış: S 8 → 1,24, D 5 → 8,3 (spec örneği R ≈ 0,9), vade yarın 04:00
{
  const y = K.guncelle({ S: 8, D: 5, last: T - gecen(8, 0.9) * DAY, reps: 4, lapses: 0, pk: 1 }, 1, T, 0.85, 1.5);
  yakin(y.S, 1.24, 0.1, '§4.1 yanlış: S 8 → 1,24');
  yakin(y.D, 8.3, 0.1, '§4.1 yanlış: D 5 → 8,3');
  eq(y.due, new Date(2026, 9, 16, 4, 0, 0).getTime(), '§4.1 yanlış: vade ertesi gün 04:00');
  const y0 = K.guncelle({ S: 8, D: 5, last: T - gecen(8, 0.9) * DAY, reps: 4, lapses: 0 }, 1, T, 0.85, 0);
  eq(y.S, y0.S, 'yanlışta c kullanılmaz');
}
// kısmi kredi: +0,7 ofset, D değişmez (tam doğruyla aynı, öncekine çok yakın)
{
  const tam = ornek('yaz'), kismi = ornek('yaz', K.KISMI);
  ok(kismi.S < tam.S && kismi.S > ornek('sec').S, 'kısmi kredi büyümeyi azaltır', { tam: tam.S, kismi: kismi.S });
  eq(kismi.D, tam.D, 'kısmi kredi: D tam doğruyla aynı');
  yakin(kismi.D, 5, 0.01, 'kısmi kredi: D değişmez');
  const iki = K.guncelle({ S: 4, D: 5, last: T - gecen(4, 0.85) * DAY, reps: 3, lapses: 0 }, 2, T, 0.85, 0);
  ok(iki.D > 6.5, 'not 2 D\'yi artırır (kısmi krediden farklı)', iki.D);
}
// pk tavanları ve günde en çok +1
{
  const buyuk = pk => K.guncelle({ S: 30, D: 3, last: T - 40 * DAY, reps: 5, lapses: 0, pk }, 3, T, 0.85, 0);
  ok(buyuk(0).due - T <= 7 * DAY, 'pk0 → aralık ≤ 7 g', (buyuk(0).due - T) / DAY);
  ok(buyuk(1).due - T <= 14 * DAY && buyuk(1).due - T > 7 * DAY, 'pk1 → aralık ≤ 14 g', (buyuk(1).due - T) / DAY);
  ok(buyuk(2).due - T > 14 * DAY, 'pk2 → tavan yok', (buyuk(2).due - T) / DAY);
  // kapı bu cevaptan sonraki pk ile: ilk üretim başarısı (pk 0 → 1) aralığı ≤ 14 g'e açar; kanıtsız doğru ≤ 7 g'de kalır
  const ilk = K.guncelle({ S: 30, D: 3, last: T - 40 * DAY, reps: 5, lapses: 0, pk: 0 }, 3, T, 0.85, 0, { pkSay: true });
  ok(ilk.pk === 1 && ilk.due - T > 7 * DAY && ilk.due - T <= 14 * DAY, 'pk0 + üretim başarısı → pk 1, aralık ≤ 14 g', (ilk.due - T) / DAY);
  let x = { S: 5, D: 5, last: T - 6 * DAY, reps: 2, lapses: 0, pk: 0 };
  x = K.guncelle(x, 3, T, 0.85, 0, { pkSay: true }); eq(x.pk, 1, 'pk +1 (sayılan biçim)');
  x = K.guncelle(x, 3, T + SAAT, 0.85, 0, { pkSay: true }); eq(x.pk, 1, 'pk aynı gün ikinci kez artmaz');
  x = K.guncelle(x, 3, T + DAY, 0.85, 0, { pkSay: true }); eq(x.pk, 2, 'pk farklı gün +1');
  x = K.guncelle(x, 1, T + 3 * DAY, 0.85, 0, { pkSay: true }); eq(x.pk, 2, 'pk yanlışta artmaz');
  const yg = K.guncelle({ S: 30, D: 3, last: T - 40 * DAY, reps: 5, lapses: 0, pk: 2 }, 3, T, 0.85, 0, { yeniGun: true });
  eq(yg.due, K.ertesiGun4(T), 'yeni öğe günü → vade en geç ertesi gün 04:00');
}

// ---------- §4.2 sonuç → not tablosu ----------
const NT = [
  ['tam doğru (isim, artikel sınandı)', { bicim: 'yaz', tip: 'dogru', artikel: { sinandi: true, dogru: true } }, { m: 3, a: 3, k: null, c: 0, ergebnis: 'richtig', et: '' }],
  ['tam doğru (fiil)', { bicim: 'sec', tip: 'dogru', sure: 3000 }, { m: 3, a: null, k: null, c: 1.5, ergebnis: 'richtig', et: '' }],
  ['seçmelide doğru > 15 sn', { bicim: 'sec', tip: 'dogru', sure: 16000, artikel: { sinandi: true, dogru: true } }, { m: 3, a: 3, c: 2.2, ergebnis: 'richtig', et: 'yavaş' }],
  ['yazım hatası', { bicim: 'yaz', tip: 'yazim', artikel: { sinandi: true, dogru: true } }, { m: 3, a: 3, c: 0.7, ergebnis: 'fast', et: 'yazım' }],
  ['yazım + artikel yanlış', { bicim: 'yaz', tip: 'yazim', artikel: { sinandi: true, dogru: false, verilen: 'der', dogrusu: 'die' } }, { m: 3, a: 1, c: 0.7, ergebnis: 'fast', et: 'yazım,artikel der → die' }],
  ['mastar eki eksik', { bicim: 'yaz0', tip: 'mastar' }, { m: 3, a: null, c: 1.2, ergebnis: 'fast', et: 'mastar eki' }],
  ['isim doğru, artikel yanlış', { bicim: 'yaz', tip: 'dogru', artikel: { sinandi: true, dogru: false, verilen: 'der', dogrusu: 'die' } }, { m: 3, a: 1, c: 0, ergebnis: 'fast', et: 'artikel der → die' }],
  ['isim doğru, artikel eksik', { bicim: 'yaz', tip: 'dogru', artikel: { sinandi: true, dogru: false, eksik: true } }, { m: 3, a: 1, ergebnis: 'fast', et: 'artikel eksik' }],
  ['seçmelide yanlış artikelli şık', { bicim: 'sec', tip: 'dogru', sure: 2000, artikel: { sinandi: true, dogru: false, verilen: 'der', dogrusu: 'das' } }, { m: 3, a: 1, c: 1.5, ergebnis: 'fast', et: 'artikel der → das' }],
  ['umlaut', { bicim: 'yaz', tip: 'umlaut' }, { m: 2, a: null, ergebnis: 'fast', et: 'umlaut' }],
  ['hâl yanlış', { bicim: 'yaz', tip: 'hal' }, { m: 2, ergebnis: 'fast', et: 'hâl' }],
  ['edat yanlış', { bicim: 'yaz', tip: 'edat' }, { m: 1, ergebnis: 'falsch', et: 'edat' }],
  ['dönüşlü: sich yok', { bicim: 'yaz', tip: 'donuslu' }, { m: 1, ergebnis: 'falsch', et: 'dönüşlü' }],
  ['çekim yanlış', { bicim: 'bos', tip: 'cekim' }, { m: 2, k: null, ergebnis: 'fast', et: 'çekim' }],
  ['Partizip kökü yanlış', { bicim: 'bos', tip: 'cekim', kokYanlis: true, etiketler: ['yardımcı fiil'] }, { m: 2, k: 1, ergebnis: 'fast', et: 'yardımcı fiil' }],
  ['tam cümle: hata başka yerde', { bicim: 'cumle', tip: 'cumleFast', etiketler: ['kelime sırası'] }, { m: 3, ergebnis: 'fast', et: 'kelime sırası' }],
  ['tam cümle: hedef yok', { bicim: 'cumle', tip: 'cumleYanlis' }, { m: 1, ergebnis: 'falsch', et: '' }],
  ['yanlış (isim) → artikel güncellenmez', { bicim: 'yaz', tip: 'yanlis', artikel: { sinandi: true, dogru: true } }, { m: 1, a: null, ergebnis: 'falsch', et: '' }],
  ['boş', { bicim: 'yaz', tip: 'bos' }, { m: 1, ergebnis: 'falsch', et: 'bilmiyorum' }],
  ['Göster', { bicim: 'yaz0', tip: 'goster' }, { m: 1, ergebnis: 'falsch', et: 'bilmiyorum' }],
  ['Bilmiyorum', { bicim: 'sec', tip: 'bilmiyorum', sure: 5000 }, { m: 1, ergebnis: 'falsch', et: 'bilmiyorum' }],
  ['seçmelide < 0,4 sn', { bicim: 'sec', tip: 'dogru', sure: 300 }, { m: null, a: null, ergebnis: null, et: 'sayılmadı' }],
  ['Stammform hepsi doğru', { bicim: 'kok', tip: 'stamm', yanlis: 0 }, { m: null, k: 3, ergebnis: 'richtig' }],
  ['Stammform biri yanlış', { bicim: 'kok', tip: 'stamm', yanlis: 1 }, { m: null, k: 2, ergebnis: 'fast' }],
  ['Stammform ikisi yanlış', { bicim: 'kok', tip: 'stamm', yanlis: 2 }, { m: null, k: 1, ergebnis: 'falsch' }],
  ['yoklama doğru (artikel doğru)', { bicim: 'yoklama', tip: 'yoklama', artikel: { sinandi: true, dogru: true } }, { m: 4, a: 4, ergebnis: 'richtig', et: 'yoklama' }],
  ['yoklama doğru (artikel yanlış)', { bicim: 'yoklama', tip: 'yoklama', artikel: { sinandi: true, dogru: false } }, { m: 4, a: 1, ergebnis: 'fast', et: 'yoklama,artikel eksik' }],
  ['kök Bilmiyorum', { bicim: 'kokSatz', tip: 'bilmiyorum' }, { m: null, k: 1, ergebnis: 'falsch', et: 'bilmiyorum' }],
  ['artikel flaşı ≤ 8 sn doğru', { bicim: 'artikel', tip: 'flas', dogru: true, sure: 2000 }, { m: null, a: 3, ca: 0.5, ergebnis: 'richtig', et: '' }],
  ['artikel flaşı yavaş doğru', { bicim: 'artikel', tip: 'flas', dogru: true, sure: 9000 }, { m: null, a: 3, ca: 1.2, ergebnis: 'richtig', et: 'yavaş' }],
  ['artikel flaşı yanlış', { bicim: 'artikel', tip: 'flas', dogru: false, sure: 2000 }, { m: null, a: 1, ergebnis: 'falsch' }],
];
NT.forEach(([ad, girdi, bekl]) => {
  const r = K.notVer(girdi);
  ['m', 'a', 'k', 'ergebnis'].forEach(k => { if (k in bekl) eq(r[k], bekl[k], `§4.2 ${ad}: ${k}`); });
  if ('c' in bekl) yakin(r.c, bekl.c, 1e-9, `§4.2 ${ad}: c`);
  if ('ca' in bekl) yakin(r.ca, bekl.ca, 1e-9, `§4.2 ${ad}: ca`);
  if ('et' in bekl) eq(r.etiketler.join(','), bekl.et, `§4.2 ${ad}: etiket`);
});

// ---------- günde tek kalıcı yazım; gun4 sınırı 03:59 / 04:01 ----------
{
  const S = yeniS({ n1: { seit: T - 20 * DAY, m: h(5, 0.85, { pk: 0 }), art: h(5, 0.9) } });
  const not = K.notVer({ bicim: 'yaz', tip: 'dogru', artikel: { sinandi: true, dogru: true } });
  const r1 = K.uygula(S, 'n1', not, T);
  ok(r1.yazildi && r1.m.yazildi && r1.a.yazildi, 'ilk cevap yazılır');
  eq(S.items.n1.m.pk, 1, 'uygula: yaz başarısı pk +1');
  const S1 = S.items.n1.m.S;
  const r2 = K.uygula(S, 'n1', K.notVer({ bicim: 'yaz', tip: 'yanlis' }), T + 2 * SAAT);
  ok(!r2.yazildi && S.items.n1.m.S === S1, 'aynı gün ikinci cevap yazılmaz', r2);
  const gece359 = new Date(2026, 9, 16, 3, 59).getTime(), gece401 = new Date(2026, 9, 16, 4, 1).getTime();
  eq(K.gun4(gece359), K.gun4(T), 'gun4: 03:59 hâlâ önceki öğrenme günü');
  ok(K.gun4(gece401) !== K.gun4(T), 'gun4: 04:01 yeni öğrenme günü');
  ok(!K.uygula(S, 'n1', not, gece359).yazildi, '03:59: yazılmaz (aynı öğrenme günü)');
  ok(K.uygula(S, 'n1', not, gece401).yazildi, '04:01: yazılır (yeni gün)');
  eq(K.ertesiGun4(gece359), new Date(2026, 9, 16, 4, 0).getTime(), 'ertesiGun4(03:59) = aynı sabah 04:00');
  eq(K.ertesiGun4(gece401), new Date(2026, 9, 17, 4, 0).getTime(), 'ertesiGun4(04:01) = ertesi sabah 04:00');
  // yoklama: S 8,3, pk 1
  const S2 = yeniS({});
  K.uygula(S2, 'n4', K.notVer({ bicim: 'yoklama', tip: 'yoklama' }), T);
  yakin(S2.items.n4.m.S, 8.3, 0.01, 'yoklama doğru → S 8,3');
  eq(S2.items.n4.m.pk, 1, 'yoklama doğru → pk 1');
  // kök
  const S3 = yeniS({ v1: { m: h(10, 0.9) } });
  K.uygula(S3, 'v1', K.notVer({ bicim: 'kokSatz', tip: 'stamm', yanlis: 0 }), T);
  ok(S3.kok && S3.kok.fahren && S3.kok.fahren.S > 0 && S3.kok.fahren.ornek === 'v1', 'kök hafızası base ile yazılır');
  // seçmelide < 0,4 sn: hiçbir şey yazılmaz
  const S4 = yeniS({ n1: { m: h(5, 0.85) } });
  ok(!K.uygula(S4, 'n1', K.notVer({ bicim: 'sec', tip: 'dogru', sure: 200 }), T).yazildi, 'sayılmadı → yazılmaz');
  // plOnly isimde artikel hafızası yok
  const S5 = yeniS({ n6: { m: h(5, 0.85) } });
  K.uygula(S5, 'n6', K.notVer({ bicim: 'yaz', tip: 'dogru', artikel: { sinandi: true, dogru: true } }), T);
  ok(!S5.items.n6.art, 'plOnly: art yok');
}

// ---------- §3 basamak tablosu ----------
{
  const bs = (S, x, bag, rnd) => K.basamak(Object.assign({ m: h(S, 0.97, x && x.m) }, x && x.it), Object.assign({ id: (x && x.id) || 'n1', t: T }, bag), rnd || R99).b;
  eq(bs(1.99), 1, 'S 1,99 → B1'); eq(bs(2), 2, 'S 2 → B2'); eq(bs(6.99), 2, 'S 6,99 → B2'); eq(bs(7), 3, 'S 7 → B3');
  eq(bs(20.99), 3, 'S 20,99 → B3'); eq(bs(21), 4, 'S 21 → B4');
  eq(bs(30, { m: { pk: 0 } }), 2, 'pk0 → ≤ B2'); eq(bs(30, { m: { pk: 1 } }), 3, 'pk1 → ≤ B3');
  eq(bs(30, { id: 'n2' }), 3, 'tier-3 isim → tavan B3'); eq(bs(30, { id: 'w1' }), 3, 'tier-3 diğer → tavan B3');
  eq(bs(30, { id: 'n3' }), 4, 'tier-3 ünite kelimesi → B4'); eq(bs(30, { id: 'v3' }), 4, 'tier-3 fiil → B4');
  eq(bs(1, { it: { a1: 1 } }), 2, 'A1 tabanı B2');
  eq(bs(1, { it: { a1: 1 } }, { kurtarma: true }), 1, 'A1 kurtarmada B1 serbest');
  eq(bs(30, null, { kurtarma: true }), 1, 'kurtarma → B1');
  const eski = { m: Object.assign(h(30, 0.97), { last: T - gecen(30, 0.45) * DAY }) };
  eq(K.basamak(eski, { id: 'n1', t: T }, R99).b, 1, 'R < 0,5 → B1');
  ok(!K.basamak(eski, { id: 'n1', t: T }, R99).yenidenTanit, 'R 0,45: yeniden tanıtım yok');
  const cokEski = { m: Object.assign(h(30, 0.97), { last: T - gecen(30, 0.3) * DAY }) };
  ok(K.basamak(cokEski, { id: 'n1', t: T }, R99).yenidenTanit, 'R < 0,35 → yeniden tanıtım');
  eq(bs(10, null, { isinma: true }), 2, 'ısınma −1'); eq(bs(10, null, { momentum: true }), 2, 'momentum −1');
  eq(bs(10, { m: { dogrula: 1 } }), 2, 'dogrula −1');
  eq(bs(10, null, null, () => 0.1), 2, 'b ≥ 3: %20 olasılıkla −1');
  K.init(Object.assign({}, ctx, { tazeCumle: () => false })); eq(bs(10), 2, 'taze cümle yok → −1'); K.init(ctx);
  K.init(Object.assign({}, ctx, { lueckeVar: () => false })); eq(bs(30), 3, 'G.luecke bulamıyorsa B4 → B3'); K.init(ctx);
  eq(bs(30, null, { klavyesiz: true }), 1, 'klavyesiz tur → B1');
  // seviye
  eq(K.seviye({}), 0, 'seviye 0'); eq(K.seviye({ m: { S: 1 } }), 1, 'seviye 1'); eq(K.seviye({ m: { S: 3 } }), 2, 'seviye 2');
  eq(K.seviye({ m: { S: 10, pk: 1 } }), 3, 'seviye 3'); eq(K.seviye({ m: { S: 30, pk: 2 } }), 4, 'seviye 4'); eq(K.seviye({ m: { S: 100, pk: 2 } }), 5, 'seviye 5');
  // kapılar basamakla aynı (§3): pk 0 → ≤ 2, pk 1 → ≤ 3
  eq(K.seviye({ m: { S: 10 } }), 2, 'seviye: pk 0 → en çok 2 (seçmeliyle Cümlede olmaz)'); eq(K.seviye({ m: { S: 100, pk: 1 } }), 3, 'seviye: pk 1 → en çok 3');
  eq(K.seviye({ m: { S: 100, pk: 3 } }, 'n2'), 3, 'seviye: tier-3 isim (ünite dışı) → en çok 3'); eq(K.seviye({ m: { S: 100, pk: 3 } }, 'n3'), 5, 'seviye: tier-3 ünite kelimesi tavansız');
  eq(K.seviye({ m: { S: 100, pk: 3 } }, 'v3'), 5, 'seviye: tier-3 fiil tavansız');
}
// biçim tablosu
{
  const it = (S, x) => ({ m: Object.assign(h(S, 0.9), x || {}) });
  const say = (id, it_, b, N) => { const r = K.tohum(7), c = {}; for (let i = 0; i < N; i++) { const x = K.bicimSec(it_, b, { id }, r, []); c[x.bicim + (x.uretec ? '/' + x.uretec : '')] = (c[x.bicim + (x.uretec ? '/' + x.uretec : '')] || 0) + 1; } return c; };
  const isim = say('n1', it(1), 1, 4000);
  yakin(isim.sec / 4000, 0.6, 0.03, 'isim B1: sec %60'); yakin(isim.metinde / 4000, 0.4, 0.03, 'isim B1: metinde %40');
  const fiil = say('v1', it(1), 1, 4000);
  yakin(fiil.sec / 4000, 0.5, 0.03, 'fiil B1: sec %50'); yakin(fiil.anla / 4000, 0.2, 0.03, 'fiil B1: anla %20'); yakin(fiil.metinde / 4000, 0.3, 0.03, 'fiil B1: metinde %30');
  eq(K.bicimSec(it(3), 2, { id: 'n1' }, R99, []).bicim, 'yaz0', 'B2: S < 4 → yaz0');
  eq(K.bicimSec(it(5, { lastG: 1 }), 2, { id: 'n1' }, R99, []).bicim, 'yaz0', 'B2: son not 1 → yaz0');
  eq(K.bicimSec(it(5), 2, { id: 'n1' }, R99, []).bicim, 'yaz', 'B2: S ≥ 4 → yaz');
  eq(K.bicimSec(it(9), 3, { id: 'n1' }, R99, []).bicim, 'bos0', 'B3: S < 10 → bos0');
  eq(K.bicimSec(it(10), 3, { id: 'n1' }, R99, []).bicim, 'bos', 'B3: S ≥ 10 → bos');
  eq(K.bicimSec(it(30), 4, { id: 'n1' }, R99, []).bicim, 'cumle', 'B4 → cumle');
  K.init(Object.assign({}, ctx, { istNdek: () => true, istRefl: () => true, goetheLuecke: () => true }));
  const nd = say('n5', it(12), 3, 3000); yakin((nd['bos/ndek'] || 0) / 3000, 1 / 3, 0.03, 'n-Dekl. üçte bir');
  const rf = say('v1', it(12), 3, 3000); yakin((rf['bos/refl'] || 0) / 3000, 1 / 3, 0.03, 'dönüşlü üçte bir');
  yakin((rf['bos/luecke'] || 0) / 3000, 2 / 3 / 4, 0.03, 'Goethe boşluğu (kalanın) dörtte biri');
  K.init(ctx);
  eq(K.bicimSec(it(5), 2, { id: 'n1' }, R99, ['yaz', 'yaz']), null, 'aynı biçim 3. kez üst üste olmaz');
  eq(K.bicimSec(it(1), 1, { id: 'n1' }, () => 0.1, ['sec', 'sec']).bicim, 'metinde', 'B1: sec iki kez olduysa metinde');
  eq(K.bicimSec({ a1: 1, m: h(1, 0.9) }, 1, { id: 'n4' }, () => 0.9, []).bicim, 'sec', 'A1 B1 yalnız sec');
}

// ---------- §5.2 kota ----------
{
  const doldur = (n, f) => { const o = {}; for (let i = 0; i < n; i++) o['n' + (100 + i)] = f(i); return o; };
  const b4 = K.gunBas4(T);
  const eskiVade = () => ({ m: { S: 10, D: 5, last: b4 - 20 * DAY, due: b4 - 2 * DAY } });
  const genc = () => ({ m: { S: 3, D: 5, last: T - DAY, due: T + 2 * DAY } });
  const oturmus = () => ({ m: { S: 40, D: 5, last: T - DAY, due: T + 30 * DAY } });
  const q = (items, x) => K.kota(Object.assign({ S: yeniS(items), kap: 36 }, x || {}), T).q;
  eq(q(doldur(73, eskiVade)), 2, 'kota: birikme > 2·kap → 2');
  eq(q(doldur(58, genc)), 4, 'kota: genç > 1,6·kap, birikme yok → 4');
  eq(q(Object.assign(doldur(59, genc), { x1: eskiVade() })), 2, 'kota: genç > 1,6·kap ve birikme var → 2');
  eq(K.kota({ S: yeniS(doldur(58, genc)), kap: 36, bonus: 1 }, T).q, 6, 'kota: genç çok ama birikme yok → bonus tur +2');
  eq(q(doldur(40, genc)), 4, 'kota: genç > 1,1·kap → 4');
  eq(q(doldur(39, genc)), 6, 'kota: diğer → 6');
  eq(q(doldur(100, oturmus)), 6, 'kota: oturmuş öğe çok ama genç az → 6');
  yakin(K.wRet(0.8), 1.15, 1e-9, 'w(.80) = 1,15'); yakin(K.wRet(0.85), 1, 1e-9, 'w(.85) = 1'); yakin(K.wRet(0.9), 0.8, 1e-9, 'w(.90) = 0,8');
  const S90 = yeniS(doldur(33, genc)); S90.einst.ret = 0.9;
  eq(K.kota({ S: S90, kap: 36 }, T).q, 4, 'ret .90: eşikler ×0,8 (33 genç → 4)');
  eq(q(doldur(33, genc)), 6, 'ret .85: 33 genç → 6');
  eq(q({}, { bonus: 1 }), 8, 'bonus tur +2');
  eq(q({}, { bonus: 3 }), 10, 'bonus en çok +4');
  eq(q(Object.assign(doldur(73, genc), { x1: eskiVade() }), { bonus: 2 }), 2, 'bonus yok: genç ≥ 2·kap ve birikme var');
  eq(q(doldur(73, genc), { bonus: 2 }), 8, 'bonus: birikme yoksa genç çok olsa da +4');
  const Sg = yeniS({}, { goc4: { zaman: T - DAY } });
  eq(K.kota({ S: Sg, kap: 36 }, T).q, 2, 'göçten sonraki ilk 3 gün ≤ 2');
  eq(K.kota({ S: yeniS({}, { goc4: { zaman: T - 3 * DAY } }), kap: 36 }, T).q, 6, 'göçten 3 gün sonra normal');
  eq(q({}, { donus: true }), 0, '3+ gün aradan sonra ilk tur: 0');
  const St = yeniS({}); St.tage = { [K.gun4(T - 4 * DAY)]: { n: 30 } };
  ok(K.donusMu(St, T), 'donusMu: 4 gün ara → dönüş turu');
  St.tage[K.gun4(T)] = { n: 5 }; ok(!K.donusMu(St, T), 'donusMu: bugün cevap varsa dönüş değil');
  const S1 = yeniS({}); S1.tage = { [K.gun4(T - DAY)]: { n: 30 } }; ok(!K.donusMu(S1, T), 'donusMu: dün çalıştıysa değil');
  // dönüş turu dışında hiçbir zaman < 2
  const rnd = K.tohum(3); let alt = 0;
  for (let i = 0; i < 300; i++) {
    const it = doldur(Math.floor(rnd() * 150), () => rnd() < 0.5 ? eskiVade() : genc());
    const S = yeniS(it, rnd() < 0.3 ? { goc4: { zaman: T - rnd() * 5 * DAY } } : {}); S.einst.ret = [0.8, 0.85, 0.9][i % 3];
    S.ayar4 = { yeniGunluk: [1, 4, 6, 8][i % 4] };
    if (K.kota({ S, kap: 12 + Math.floor(rnd() * 48), bonus: i % 3 }, T).q < 2) alt++;
  }
  eq(alt, 0, 'kota dönüş turu dışında hiçbir zaman < 2');
  const ku = K.kota({ S: yeniS({}), kap: 36, uniteKalan: { kalan: 80, gun: 10 } }, T);
  eq(ku.qUnite, 8, 'ünite hızlandır: max(q, min(10, ⌈kalan/gün⌉))');
  eq(K.kota({ S: yeniS({}), kap: 36, uniteKalan: { kalan: 200, gun: 5 } }, T).qUnite, 10, 'ünite hızlandır en çok 10');
  // bugün tanıtılanlar kalandan düşer
  const Sy = yeniS({ n7: { yeni4: K.gun4(T), m: { S: 2.3, last: T, due: T + DAY } } });
  eq(K.kota({ S: Sy, kap: 36 }, T).kalan, 5, 'kota: bugün tanıtılan düşer');
  // §5.2: yarım öğeler kotaya sayılmaz (ayrı sınır günde 3)
  const Syr = yeniS({ n7: { yarim: 1, tanit: T, yarimGun: K.gun4(T), m: { S: 2.3, last: T, due: T + DAY } }, n8: { yarim: 1, tanit: T, yarimGun: K.gun4(T), m: { S: 2.3, last: T, due: T + DAY } } });
  eq(K.kota({ S: Syr, kap: 36 }, T).kalan, 6, 'kota: bugün açılan yarım öğeler kotadan düşmez');
}

// ---------- §5.3 yeni sıra ve karışma kapısı ----------
{
  K.init(Object.assign({}, ctx, { BLITZ_ORDER: ['n1', 'n2', 'n4', 'n5', 'n3'], VERB_ORDER: ['v1', 'v3'], uniteSira: () => ['n3'], lesenWort: () => ['w1'] }));
  const S = yeniS({ n9: { yarim: 1, m: null } });
  const ys = K.yeniSira(S);
  eq(ys.slice(0, 3).join(','), 'n9,w1,n3', 'yeni sıra: yarım → okurken bakılan → ünite');
  eq(ys.slice(3).join(','), 'n2,n1,v3,n4,n5,v1', 'Goethe sırası: tier-3 önce, her 3 yeniden biri fiil');
  // §5.2: yarım kotadan bağımsız; parti n yeni + yarimHak yarım; günde en çok 3 yarım
  { const p = K.yeniParti(S, T, 2, { yarimHak: 1, yoklamaHak: 0 }); eq(p.ids.join(','), 'n9,w1,n3', 'parti: yarım kota yerini yemez (1 yarım + 2 yeni)'); }
  { const p = K.yeniParti(S, T, 0, { yarimHak: 1 }); eq(p.ids.join(','), 'n9', 'parti: kota 0 iken yarım yine gelir'); }
  { const p = K.yeniParti(S, T, 2, { yarimHak: 1, yarimGunluk: 1, yarimKotadan: true, yoklamaHak: 0 }); eq(p.ids.join(','), 'n9,w1', 'parti (kota kısık): yarım kotadan bir yer alır'); }
  { const S3 = yeniS({ n9: { yarim: 1, m: null }, x1: { yarimGun: K.gun4(T) }, x2: { yarimGun: K.gun4(T) }, x3: { yarimGun: K.gun4(T) } }); eq(K.yeniParti(S3, T, 0, { yarimHak: 1 }).ids.length, 0, 'parti: günde en çok 3 yarım'); }
  K.init(Object.assign({}, ctx, { trKey: id => ({ a: 'gitmek', b: 'gitmek' })[id] || id, lemma: id => ({ c: 'liegen', d: 'legen', e: 'Haus', f: 'Maus', x1: 'Apfelbaum', y1: 'Zeitung', y2: 'Bahnhof' })[id] || id, konu: id => 'k1', ablaut: id => ({ g: 'ie-o-o', h: 'ie-o-o' })[id] || '' }));
  ok(!K.karismaOk('b', ['a']), 'karışma: aynı trKey');
  ok(!K.karismaOk('d', ['c']), 'karışma: lev ≤ 2');
  ok(!K.karismaOk('h', ['g']), 'karışma: aynı Ablaut');
  ok(!K.karismaOk('x1', ['y1', 'y2']), 'karışma: aynı konudan 2\'den fazla değil');
  ok(K.karismaOk('x1', ['y1']), 'karışma: aynı konudan 2 olur');
  K.init(Object.assign({}, ctx, { base: id => ({ v1: 'fahren', v9: 'fahren' })[id] || id, lemma: id => id + 'xxxxx' + id, konu: () => '' }));
  ok(!K.karismaOk('v9', ['v1']), 'karışma: aynı kök');
  K.init(ctx);
}

// ---------- §5.1 seçim önceliği ----------
const oturum = x => Object.assign({ adim: 0, boy: 12, kuyruk: [], gecmis: [] }, x || {});
{
  // vadeli üç öğe: n1 (R .80), n5 (R .70), v1 (R .55, 4 gün gecikmiş); yeni aday var (BLITZ_ORDER)
  const items = () => ({
    n1: { m: h(10, 0.8, { due: T - DAY }) }, n5: { m: h(10, 0.7, { due: T - DAY }) },
    v1: { m: h(10, 0.55, { due: T - 4 * DAY }) },
  });
  const d = (x, o) => K.sec(Object.assign({ S: yeniS(items()), kap: 36 }, x || {}), oturum(o), T, R99);
  eq(d({}, { kuyruk: [{ id: 'n5', neden: 'yanlis', at: 2, b: 1, bicim: 'sec', deneme: 2 }], adim: 2 }).kaynak, 'kuyruk', '1) oturum kuyruğu önce');
  eq(d({}, { kuyruk: [{ id: 'n5', neden: 'yanlis', at: 5, b: 1, deneme: 2 }], adim: 2 }).kaynak, 'isinma', 'kuyruk: sırası gelmemişse beklenir');
  eq(d({}, { adim: 3 }).tur, 'parti', '2) yeni parti (adım 3)');
  eq(d({}, { adim: 2 }).kaynak, 'isinma', 'parti adım 3\'ten önce gelmez');
  eq(d({}, { adim: 6, boy: 12 }).tur === 'parti', false, 'parti adım > boy − 7 ise gelmez');
  eq(d({}, { adim: 8, parti: true }).tur, 'metin', '3) metin etkinliği (adım 8)');
  eq(d({}, { adim: 8, parti: true, klavyesiz: true }).tur === 'metin', false, 'klavyesiz turda metin yok');
  eq(d({ gunSay: { metin: 3 } }, { adim: 8, parti: true }).tur === 'metin', false, 'metin günde en çok 3');
  const ku = d({}, { adim: 6, parti: true });
  eq(ku.kaynak, 'kurtarma', '4) kurtarma (adım ≥ 6)'); eq(ku.id, 'v1', 'kurtarma: R\'si en düşük'); eq(ku.b, 1, 'kurtarma B1');
  const is = d({}, { adim: 0 });
  eq(is.kaynak, 'isinma', '5) ısınma'); eq(is.id, 'n1', 'ısınma: R\'si en yüksek');
  eq(d({}, { adim: 5, parti: true, kurtarma: true, yanlisSeri: 2 }).kaynak, 'momentum', '5) momentum (art arda 2 yanlış)');
  const v = d({}, { adim: 5, parti: true, kurtarma: true });
  eq(v.kaynak, 'vadeli', '6) vadeli'); eq(v.id, 'n1', 'vadeli: R azalan');
  eq(d({}, { adim: 5, parti: true, kurtarma: true, gecmis: [{ id: 'n1', bicim: 'yaz' }] }).id, 'n5', 'vadeli: yakın zamanda sorulan atlanır');
  // vadeli yok: kota varsa parti, yoksa bitti + teklif
  const bos = (x, o) => K.sec(Object.assign({ S: yeniS({ n1: { m: h(10, 0.97, { due: T + 5 * DAY }) } }), kap: 36 }, x || {}), oturum(o), T, R99);
  eq(bos({}, { adim: 10 }).tur, 'parti', '7) vadeli yok → parti');
  const bt = bos({ donus: true }, { adim: 10 });
  eq(bt.tur, 'bitti', '7) kota yok → bitti'); eq(bt.teklif, '+3', '+3 yeni teklifi');
  eq(bos({ donus: true, gunSay: { ekYeniTeklif: 1 } }, { adim: 10 }).teklif, '+3', '+3 teklifi: birikme yoksa ikinci kez de sunulur');
  eq(bos({ donus: true, gunSay: { ekYeniTeklif: 3 } }, { adim: 10 }).teklif, null, '+3 teklifi: birikme yoksa günde en çok üç');
  // artikel flaşı: der olmayan önce, turda en çok 3
  const art = () => ({ n1: { m: h(10, 0.97, { due: T + 9 * DAY }), art: h(5, 0.8, { due: T - DAY }) }, n2: { m: h(10, 0.97, { due: T + 9 * DAY }), art: h(5, 0.7, { due: T - DAY }) } });
  const a = K.sec({ S: yeniS(art()), kap: 36, donus: true }, oturum({ adim: 5, parti: true, kurtarma: true }), T, R99);
  eq(a.tur, 'art', 'yalnız artikeli vadeli → artikel flaşı'); eq(a.id, 'n2', 'der olmayan isim önce');
  const a3 = K.sec({ S: yeniS(art()), kap: 36, donus: true }, oturum({ adim: 5, parti: true, kurtarma: true, gecmis: [{ id: 'x', tur: 'art' }, { id: 'y', tur: 'art' }, { id: 'z', tur: 'art' }] }), T, R99);
  eq(a3.tur, 'bitti', 'artikel flaşı turda en çok 3');
  // kök: turda 1, günde 4
  const kokS = () => yeniS({ v1: { m: h(10, 0.97, { due: T + 9 * DAY }) } }, { kok: { fahren: Object.assign(h(5, 0.8, { due: T - DAY }), { ornek: 'v1' }) } });
  const k = K.sec({ S: kokS(), kap: 36, donus: true }, oturum({ adim: 5, parti: true, kurtarma: true }), T, R99);
  eq(k.tur, 'kok', 'vadeli kök'); eq(k.bicim, 'kokSatz', 'kök S < 7 → cümlede Perfekt');
  eq(K.sec({ S: kokS(), kap: 36, donus: true, gunSay: { kok: 4 } }, oturum({ adim: 5, parti: true, kurtarma: true }), T, R99).tur, 'bitti', 'kök günde en çok 4');
  eq(K.sec({ S: kokS(), kap: 36, donus: true }, oturum({ adim: 5, parti: true, kurtarma: true, gecmis: [{ id: 'v2', tur: 'kok' }] }), T, R99).tur, 'bitti', 'kök turda en çok 1');
  const yk = yeniS({ v1: { m: h(3, 0.97, { due: T + 9 * DAY }) } }, { kok: { fahren: { ornek: 'v1', yeni: 1 } } });
  eq(K.sec({ S: yk, kap: 36, donus: true }, oturum({ adim: 5, parti: true }), T, R99).kaynak, 'yeniKok', 'yeni kök açılır');
  eq(K.sec({ S: yk, kap: 36, donus: true, gunSay: { kokYeni: 2 } }, oturum({ adim: 5, parti: true }), T, R99).tur, 'bitti', 'yeni kök günde en çok 2');
}
// parti + oturum kuyruğu: mini sorular hemen, ikinci hatırlama 4 soru sonra; yanlış → 3–5 soru sonra bir alt basamak
{
  const o = oturum({ adim: 3 });
  K.partiBasladi(o, ['n7', 'n8'], K.tohum(1));
  eq(o.kuyruk.filter(k => k.neden === 'mini' && k.at === 3).length, 2, 'parti: mini sorular hemen');
  const ik = o.kuyruk.filter(k => k.neden === 'ikinci');
  ok(ik.length === 2 && ik.every(k => k.at >= 7 && k.at <= 9 && k.bicim === 'yaz0'), 'parti: ikinci hatırlama ≥ 4 soru sonra, yaz0', ik);
  const S = yeniS({ n7: { m: h(2.3, 0.99) }, n8: { m: h(2.3, 0.99) } });
  const s1 = K.sec({ S, kap: 36 }, o, T, R99);
  eq(s1.neden, 'mini', 'kuyruk: mini'); eq(s1.bicim, 'sec', 'mini sec');
  K.oturumIsle(o, s1, { ergebnis: 'falsch' }, R99);
  const y = o.kuyruk.find(k => k.neden === 'yanlis');
  ok(y && y.at >= 4 + 3 && y.at <= 4 + 5 && y.deneme === 2, 'yanlış → 3–5 soru sonra yeniden', y);
  eq(o.kuyruk.filter(k => k.neden === 'mini').length, 1, 'cevaplanan kuyruk girdisi silinir');
  eq(o.yanlisSeri, 1, 'art arda yanlış sayılır');
}
// aynı öğe ≥ 8 soru arayla; tohumla belirlenimcilik
function simTur(seed, gun) {
  const rnd = K.tohum(seed);
  const items = {};
  for (let i = 0; i < 25; i++) items['n' + (200 + i)] = { m: h(2 + i, 0.6 + i * 0.012, { due: T - DAY, pk: i % 3 }) };
  const S = yeniS(items), dizi = [];
  const gs = {};
  for (let tur = 0; tur < (gun || 3); tur++) {
    const o = oturum({ boy: 12 });
    for (let a = 0; a < 12; a++) {
      const t = T + tur * 900000 + a * 20000;
      const s = K.sec({ S, kap: 36, donus: false, gunSay: gs }, o, t, rnd);
      if (s.tur === 'bitti') break;
      if (s.tur === 'parti') { K.partiBasladi(o, s.ids, rnd); s.ids.forEach(id => { S.items[id] = { tanit: t, yeni4: K.gun4(t), m: null }; }); dizi.push('parti:' + s.ids.join('+')); a--; continue; }
      if (s.tur === 'metin') { o.metin = true; gs.metin = (gs.metin || 0) + 1; dizi.push('metin'); a--; continue; }
      const dogru = rnd() < 0.75;
      const not = s.tur === 'art' ? K.notVer({ bicim: 'artikel', tip: 'flas', dogru, sure: 2000 }) : K.notVer({ bicim: s.bicim, tip: dogru ? 'dogru' : 'yanlis', sure: 3000 });
      K.uygula(S, s.id, not, t, { b: s.b });
      K.oturumIsle(o, s, not, rnd);
      dizi.push(`${s.kaynak}:${s.id}:${s.bicim}`);
    }
  }
  return dizi;
}
{
  const a = simTur(11), b = simTur(11), c = simTur(12);
  eq(JSON.stringify(a), JSON.stringify(b), 'aynı tohum aynı soru dizisini verir');
  ok(JSON.stringify(a) !== JSON.stringify(c), 'farklı tohum farklı dizi');
  // ≥ 8 soru aralığı (kuyruk dışı seçimler)
  let ihlal = 0;
  for (const seed of [1, 2, 3, 4, 5]) {
    const d = simTur(seed, 4).filter(x => !x.startsWith('parti') && x !== 'metin');
    const son = {};
    d.forEach((x, i) => { const [kaynak, id] = x.split(':'); if (kaynak !== 'kuyruk' && son[id] != null && i - son[id] < 8) ihlal++; son[id] = i; });
  }
  eq(ihlal, 0, 'aynı öğe ≥ 8 soru arayla (kuyruk hariç)');
}

// ---------- yazım hoşgörüsü (§4.3) ----------
eq(K.yazimMi('Rechnug', 'Rechnung'), true, 'yazım: lev 1, ≥ 5 harf');
eq(K.yazimMi('Hus', 'Haus'), false, 'yazım: < 5 harf değil');
eq(K.yazimMi('Mutter', 'Mütter'), false, 'yazım: umlaut farkı yazım değil');
eq(K.yazimMi('legen', 'liegen'), false, 'yazım: sözlükteki başka kelime değil');
eq(K.yazimMi('Muetter', 'Mütter'), false, 'yazım: ue = ü tam doğru (yazım değil)');
eq(K.yazimMi('Wohnungstuer', 'Wohnungstür'), false, 'yazım: ue yazımı tam doğru');
eq(K.yazimMi('Krankenversicherug', 'Krankenversicherung'), true, 'yazım: uzun kelime lev 1');
eq(K.yazimMi('Krankenversichrug', 'Krankenversicherung'), true, 'yazım: ≥ 10 harf lev 2');

// ---------- senkron koruması ----------
{
  const kart = n => { const o = {}; for (let i = 0; i < n; i++) o['n' + i + ':erk'] = { S: 1, last: 1 }; return o; };
  const y1 = K.yazabilir({ karten: kart(100) }, { surum: 4, karten: kart(100) }, 3);
  ok(!y1.birlestir && !y1.yaz && y1.sebep === 'yeni-sema', 'yazabilir: yeni şema → birleştirmez, yazmaz', y1);
  const y2 = K.yazabilir({ karten: kart(10) }, { karten: kart(547) }, 3);
  ok(y2.birlestir && !y2.yaz && y2.sebep === 'bos-yerel', 'yazabilir: boş yerel → yalnız birleştirir, yazmaz', y2);
  const y3 = K.yazabilir({ karten: kart(540) }, { karten: kart(547) }, 3);
  ok(y3.birlestir && y3.yaz && y3.sebep === 'ok', 'yazabilir: normal → yazar', y3);
  ok(K.yazabilir({ karten: kart(1) }, null, 3).yaz, 'yazabilir: uzak yok → yazar');
  ok(K.yazabilir({ karten: kart(100) }, { surum: 3, karten: kart(100) }, 3).yaz, 'yazabilir: aynı şema → yazar');
  // T2: m'si olan öğe sayısı
  const m = n => { const o = {}; for (let i = 0; i < n; i++) o['n' + i] = { m: { S: 2 } }; return o; };
  eq(K.yazabilir({ surum: 4, items: m(5) }, { surum: 4, items: m(174), karten: kart(10) }, 4).sebep, 'bos-yerel', 'yazabilir v4: m sayısıyla');
}

// ---------- göç (§8), v3Yetis, gölge, birleştirme: sentetik ----------
{
  const tk = T - 2 * DAY;
  const kart = (S, last, x) => Object.assign({ S, D: 4, last, due: last + 3 * DAY, reps: 3, lapses: 0, lastG: 3 }, x || {});
  const S = yeniS({
    n1: { seit: T - 20 * DAY }, n2: { seit: T - 20 * DAY }, n4: { seit: T - 20 * DAY }, n5: { seit: T - 20 * DAY },
    v1: { seit: T - 20 * DAY }, w1: { seit: T - 9 * DAY }, xx: { seit: 1 },
  }, { kontrol: { n4: tk }, pakete: { p01: { fertig: 1 } } });
  S.karten = {
    'n1:wort': kart(10, T - 5 * DAY, { reps: 4, lapses: 1, lastG: 3 }), 'n1:erk': kart(30, T - 3 * DAY), 'n1:art': kart(6, T - 5 * DAY),
    'n2:erk': kart(12, T - 4 * DAY),                    // tier 3: tanıma aynen
    'n5:erk': kart(12, T - 4 * DAY, { D: 3 }),           // tier 2: S × 0,5, D ≥ 5
    'n4:erk': kart(20, tk, { selbst: 1 }), 'n4:art': kart(9, tk, { selbst: 1 }),   // yalnız "biliyorum"
    'v1:bed': kart(8, T - 6 * DAY), 'v1:stamm': kart(4, T - 6 * DAY), 'p01:pak': kart(5, T - 3 * DAY),
    'w1:erk': { neu: 1, due: T },
  };
  const once = JSON.stringify(S.karten);
  const r = K.goc(S, T, 0.85);
  eq(JSON.stringify(S.karten), once, 'göç: karten değişmez');
  eq(JSON.stringify(S.kartenV3), once, 'göç: kartenV3 dondurulmuş kopya');
  yakin(S.items.n1.m.S, 10, 1e-9, 'göç (a): en yeni üretim kartı aynen'); eq(S.items.n1.m.pk, 2, 'göç (a): pk 2');
  yakin(S.items.n2.m.S, 12, 1e-9, 'göç (b): tier-3 tanıma çapası indirimsiz');
  yakin(S.items.n5.m.S, 6, 1e-9, 'göç (b): üretim hedefli öğede S × 0,5'); eq(S.items.n5.m.D, 5, 'göç (b): D = max(D, 5)');
  ok(S.items.n4.m.S <= 2 && S.items.n4.m.dogrula === 1, 'göç (c): selbst-son → S ≤ 2, dogrula', S.items.n4.m);
  ok(S.items.n4.art.S <= 2, 'göç: güvenilmez art → S ≤ 2');
  ok(S.items.w1.m === null && S.items.w1.yarim === 1, 'göç (d): S yok → yarım');
  // göç bittikten sonra bilerek m'siz kurulan öğeler (A1 düğmesi, kartsız) yeniden açılışta yarım olmaz
  S.items.n3 = { seit: T, bekannt: true, a1: true, quelle: 'a1' }; S.items.w2 = { seit: T, quelle: 'lesen' };
  K.goc(S, T + DAY, 0.85);
  ok(!S.items.n3.yarim && !S.items.n3.m, 'göç: A1 öğesi yarım olmaz');
  ok(!S.items.w2.yarim, 'göç: göçten sonra kurulan kartsız öğeye dokunulmaz');
  ok(!K.yeniSira(S).includes('n3'), 'yeni sıra: A1 öğesi yok');
  { const S2 = JSON.parse(JSON.stringify(S)); delete S2.goc4; S2.items.v2 = { seit: T, a1: true, quelle: 'a1', yarim: 1 }; K.goc(S2, T, 0.85); ok(!S2.items.v2.yarim, 'göç: ilk göçte de A1 öğesi yarım olmaz (eski işaret silinir)'); }
  ok(S.items.v1.m && S.items.v1.m.pk === 0, 'göç: fiil tanımadan pk 0');
  ok(S.kok.fahren && S.kok.fahren.S === 4 && S.formGesehen.v1, 'göç: stamm → kök, formGesehen');
  ok(S.pakete.p01.m && S.pakete.p01.fertig === 1, 'göç: pak → pakete.m (öteki alanlar korunur)');
  ok(!S.items.xx.m, 'göç: geçersiz öğe dokunulmaz'); eq(r.olu, 1, 'göç raporu: ölü öğe');
  eq(S.surum, 4, 'göç: surum 4'); ok(S.goc4 && S.goc4.zaman === T, 'göç: goc4 bayrağı');
  let nan = 0, sira = 0;
  Object.values(S.items).forEach(it => ['m', 'art'].forEach(k => { const x = it[k]; if (!x) return; if (['S', 'D', 'last', 'due'].some(f => !Number.isFinite(x[f]))) nan++; if (x.due < x.last) sira++; }));
  eq(nan, 0, 'göç: NaN yok'); eq(sira, 0, 'göç: due ≥ last');
  // idempotent
  const ilk = JSON.stringify(S.items);
  K.goc(S, T + SAAT, 0.85);
  eq(JSON.stringify(S.items), ilk, 'göç idempotent');
  // kendini onarma: eski istemci m'yi sildiyse yeniden kurulur
  delete S.items.n2.m; K.goc(S, T + SAAT, 0.85); yakin(S.items.n2.m.S, 12, 1e-9, 'göç: m\'si eksik öğe yeniden kurulur');
  // v3Yetis: göçten sonra eski istemci n1:wort'a cevap yazdı
  S.karten['n1:wort'] = Object.assign({}, S.karten['n1:wort'], { last: T + 2 * SAAT, lastG: 1 });
  const nY = K.v3Yetis(S, T + 3 * SAAT);
  eq(nY, 1, 'v3Yetis: bir cevap uygulandı'); eq(S.items.n1.m.lastG, 1, 'v3Yetis: notu öğeye geçti'); eq(S.items.n1.m.last, T + 2 * SAAT, 'v3Yetis: zamanı');
  eq(K.v3Yetis(S, T + 3 * SAAT), 0, 'v3Yetis: iki kez sayılmaz');
  // gölge yazım
  ok(K.golge(S, 'n1', K.eskiTur('n1', 'yaz', null), S.items.n1.m, T + 3 * SAAT), 'gölge yazıldı');
  eq(S.karten['n1:wort'].g4, S.items.n1.m.last, 'gölge: g4 = last');
  eq(K.eskiTur('v1', 'bos0', 'refl'), 'refl', 'eşleme: dönüşlü'); eq(K.eskiTur('n1', 'artikel'), 'art', 'eşleme: artikel');
  eq(K.eskiTur('w1', 'sec'), 'erk', 'eşleme: diğer sec → erk'); eq(K.eskiTur('v1', 'yaz'), 'abr', 'eşleme: fiil yaz → abr');
  ok(!K.golge(S, 'n1', 'wort', S.items.n1.m, T + 31 * DAY), 'gölge 30 günden sonra kapanır');
  eq(K.v3Yetis(S, T + 4 * SAAT), 0, 'v3Yetis: gölge kart sayılmaz');
  // birleştirme
  const lok = { items: { n1: { m: { S: 5, last: 10 }, fehlTage: ['a'], seit: 5 } }, karten: { 'n1:erk': { last: 3 } }, tageC: { d1: { A: { n: 5, richtig: 4 } } }, tage: {}, surum: 4, log: [1] };
  const uz = { items: { n1: { m: { S: 9, last: 20 }, art: { S: 2, last: 1 }, fehlTage: ['b'], leech: true, seit: 2 }, n2: { m: { S: 1, last: 1 } } }, karten: { 'n1:erk': { last: 7 } }, tageC: { d1: { B: { n: 7, richtig: 5 }, A: { n: 3 } } }, tage: { d1: { n: 7 } }, log: [2] };
  const bm = K.birlestir(lok, uz);
  eq(bm.items.n1.m.S, 9, 'birleştir: m last\'ı büyük kazanır'); eq(bm.items.n1.art.S, 2, 'birleştir: art korunur');
  eq(bm.items.n1.fehlTage.join(','), 'a,b', 'birleştir: fehlTage birleşim'); ok(bm.items.n1.leech, 'birleştir: leech VEYA'); eq(bm.items.n1.seit, 2, 'birleştir: seit en küçük');
  ok(bm.items.n2, 'birleştir: yalnız uzaktaki öğe'); eq(bm.karten['n1:erk'].last, 7, 'birleştir: karten last');
  eq(bm.tage.d1.n, 12, 'birleştir: tage = cihaz toplamı'); eq(bm.tageC.d1.A.n, 5, 'birleştir: cihaz sayacı en büyüğü'); eq(bm.surum, 4, 'birleştir: surum');
  eq(bm.log[0], 1, 'birleştir: log yerelden');
  // zustandBirlestir'in (v3) alanları kaybolmaz
  const l2 = { karten: { 'n1:erk': { last: 1 } }, tage: { '2026-10-14': { n: 30 } }, xpToplam: 100, seri: { rekor: 3, frz: 1 },
    oyun: { rekor: 4 }, unite: { u2: { idx: { a: 1 }, done: { x: 1 } } }, kontext: { s1: 5 }, iz: { n1: 2 }, formGesehen: { v1: true },
    gelesen: { k1: 1 }, fiilMetin: { a: 1 }, einst: { ret: 0.9 } };
  const u2 = { karten: { 'n1:erk': { last: 2 } }, tage: { '2026-10-13': { n: 40 }, '2026-10-14': { n: 50 } }, xpToplam: 900, seri: { rekor: 9 },
    oyun: { rekor: 7 }, unite: { u2: { idx: { b: 2 }, done: { y: 1 } }, u3: { idx: { c: 1 } } }, kontext: { s2: 6 }, iz: { n9: 1 },
    formGesehen: { v2: true }, gelesen: { k2: 1 }, fiilMetin: { b: 1 }, einst: { ret: 0.8 } };
  const b2 = K.birlestir(l2, u2);
  eq(b2.tage['2026-10-13'].n, 40, 'birleştir: yerelde olmayan uzak gün korunur'); eq(b2.tage['2026-10-14'].n, 50, 'birleştir: gün başına en büyük');
  eq(b2.xpToplam, 900, 'birleştir: xpToplam en büyük'); eq(b2.seri.rekor, 9, 'birleştir: seri.rekor en büyük'); eq(b2.seri.frz, 1, 'birleştir: seri yerel alanı');
  eq(b2.oyun.rekor, 7, 'birleştir: oyun.rekor');
  eq(JSON.stringify(b2.unite.u2.idx), '{"b":2,"a":1}', 'birleştir: ünite idx birleşim'); ok(b2.unite.u2.done.x && b2.unite.u2.done.y, 'birleştir: ünite done birleşim');
  ok(b2.unite.u3, 'birleştir: yalnız uzaktaki ünite');
  ok(b2.kontext.s1 && b2.kontext.s2 && b2.iz.n1 && b2.iz.n9 && b2.formGesehen.v1 && b2.formGesehen.v2 && b2.gelesen.k1 && b2.gelesen.k2 && b2.fiilMetin.a && b2.fiilMetin.b, 'birleştir: kontext/iz/formGesehen/gelesen/fiilMetin birleşim');
  eq(b2.einst.ret, 0.9, 'birleştir: dolu yerelin ayarı');
  eq(K.birlestir({ einst: { ret: 0.85 } }, u2).einst.ret, 0.8, 'birleştir: boş yerel uzaktaki ayarı alır');
  // göç günü: eski istemci 20 + v5 12 cevap; tageC yalnız v5'i biliyor → sayaç düşmez
  const g = '2026-10-16';
  const b3 = K.birlestir({ tage: { [g]: { n: 32, richtig: 25 } }, tageC: { [g]: { mobil: { n: 12, richtig: 9 } } } }, { tage: {} });
  eq(b3.tage[g].n, 32, 'birleştir: göç günü sayacı silinmez'); eq(b3.tage[g].richtig, 25, 'birleştir: göç günü doğru sayısı');
  const b4 = K.birlestir({ tage: { [g]: { n: 10, richtig: 8, modi: { akis: 10 } } }, tageC: { [g]: { mobil: { n: 10, richtig: 8 } } } },
    { tage: { [g]: { n: 9 } }, tageC: { [g]: { masa: { n: 9, richtig: 2 } } } });
  eq(b4.tage[g].n, 19, 'birleştir: iki cihaz toplamı büyükse alınır'); eq(b4.tage[g].richtig, 10, 'birleştir: alan alan'); ok(b4.tage[g].modi, 'birleştir: gün ek alanları kalır');
}

// ---------- toparlanma tahmini ----------
{
  const items = {};
  for (let i = 0; i < 90; i++) items['n' + (300 + i)] = { m: { S: 3 + (i % 20), D: 5, last: T - (5 + i % 10) * DAY, due: T - DAY, reps: 3, lapses: 0, lastG: 3, pk: i % 3 } };
  for (let i = 0; i < 100; i++) items['n' + (500 + i)] = { m: { S: 30, D: 4, last: T - 2 * DAY, due: T + 20 * DAY, reps: 5, lapses: 0, lastG: 3, pk: 2 } };
  const S = yeniS(items);
  const t36 = K.tahmin({ S, kap: 36 }, 36, T), t48 = K.tahmin({ S, kap: 48 }, 48, T), t12 = K.tahmin({ S, kap: 12 }, 12, T);
  ok(t36 === null || (t36 >= 1 && t36 <= 21), 'tahmin: gün ya da null', t36);
  console.log(`  tahmin (sentetik 90 vadeli): 12 cevap → ${t12}, 36 → ${t36}, 48 → ${t48} gün`);
  ok(t48 !== null && (t36 === null || t48 <= t36), 'tahmin: daha çok cevap daha erken toparlar', { t36, t48 });
  eq(t12, null, 'tahmin: günde 12 cevapla 3 haftadan uzun');
  eq(K.tahmin({ S: yeniS({ n1: { m: h(10, 0.99, { due: T + 5 * DAY }) } }), kap: 36 }, 36, T), 0, 'tahmin: birikme yoksa 0');
  eq(K.tahmin({ S, kap: 36 }, 36, T), t36, 'tahmin belirlenimci');
  // aynı bitiş çizgisiyle (esik) karşılaştırma: 4 tur 3 turdan geç bitemez
  const e36 = K.tahmin({ S, kap: 36 }, 36, T, 27), e48 = K.tahmin({ S, kap: 48 }, 48, T, 27);
  ok(e48 !== null && (e36 === null || e48 <= e36), 'tahmin: aynı eşikte 48 cevap ≤ 36 cevap', { e36, e48 });
}

console.log(fail ? `${fail}/${n} test BAŞARISIZ` : `test_kern: ${n} test geçti`);
process.exit(fail ? 1 : 0);
