// node tests/test_dinle.js — dikte kontrolü (Dinle.diktePruef, G.cumleKontrol üzerinden): log'daki gerçek dikte hataları (6.11)
const G = require('../js/grammatik.js');
const Dinle = require('../js/dinle.js');
let fail = 0, n = 0;
const ok = (c, m, x) => { n++; if (!c) { fail++; console.log('✗', m, x ? JSON.stringify(x) : ''); } };
const P = (e, z) => Dinle.diktePruef(G, e, z);

// tam doğru; noktalama / büyük-küçük harf / ae-oe-ue hata değil
let r = P('Ich gehe morgen zum Arzt.', 'Ich gehe morgen zum Arzt.'); ok(r.u === 'richtig' && !r.tags.length, 'tam doğru', r);
r = P('ich gehe morgen zum arzt', 'Ich gehe morgen zum Arzt.'); ok(r.u === 'richtig', 'noktalama / harf büyüklüğü', r);
r = P('Er faehrt nach Bremen.', 'Er fährt nach Bremen.'); ok(r.u === 'richtig', 'ae = ä', r);
// boş → bilmiyorum
r = P('  ', 'Ich gehe.'); ok(r.u === 'falsch' && r.tags.includes('bilmiyorum'), 'boş', r);
// hâl: den Keller → dem Keller: yazım DEĞİL, artikel/çekim + dikte:ek
r = P('Wir haben die Fahrräder in dem Keller gestellt.', 'Wir haben die Fahrräder in den Keller gestellt.');
ok(!r.tags.includes('yazım') && r.tags.includes('artikel/çekim') && r.kat.includes('ek'), 'den → dem: çekim, yazım değil', r);
// çekim: hast → hat
r = P('Du hat die Rechnung schon bezahlt.', 'Du hast die Rechnung schon bezahlt.');
ok(!r.tags.includes('yazım') && r.u !== 'richtig' && r.kat.includes('ek'), 'hast → hat: çekim', r);
// edat: vor allem → von allem: falsch, işlev
r = P('Ich mag von allem Obst.', 'Ich mag vor allem Obst.');
ok(r.u === 'falsch' && r.tags.includes('edat') && r.kat.includes('işlev'), 'vor → von: edat falsch', r);
// yanlış kelime: eben → ihm
r = P('Das habe ich ihm gesagt.', 'Das habe ich eben gesagt.');
ok(r.u === 'falsch' && !r.tags.includes('yazım'), 'eben → ihm: yanlış kelime', r);
// gerçek yazım hatası (tek harf, uzun kelime) → fast yazım
r = P('Im nächsten Semestar studiere ich in Bremen.', 'Im nächsten Semester studiere ich in Bremen.');
ok(r.u === 'fast' && r.tags.includes('yazım') && r.kat.includes('yazım'), 'Semestar: yazım', r);
// geçerli başka diziliş dikte'de doğru sayılmaz
r = P('Ich gehe morgen ins Kino.', 'Morgen gehe ich ins Kino.');
ok(r.u === 'fast' && r.tags.includes('kelime sırası'), 'başka diziliş: fast kelime sırası', r);
// eksik işlev kelimesi (zu)
r = P('Ich habe keine Lust, ins Kino gehen.', 'Ich habe keine Lust, ins Kino zu gehen.');
ok(r.u !== 'richtig' && r.kat.includes('işlev'), 'eksik zu: işlev', r);
// fark gösterimi
const h = Dinle.farkHTML(P('Ich mag von allem Obst.', 'Ich mag vor allem Obst.').diff);
ok(/dn-fazla/.test(h) && /dn-eksik/.test(h), 'farkHTML', h);
ok(Array.isArray(Dinle.TURLER) && Dinle.TURLER.join() === 'kelime,bosluk,dikte', 'TURLER');

console.log(fail ? `test_dinle: ${fail} / ${n} test başarısız` : `test_dinle: ${n} test geçti`);
process.exit(fail ? 1 : 0);
