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
// 7.11 inceleme: bileşiği ayrı yazmak (duyduğu doğru) küçük hata 'yazım', yanlış kelime değil
r = P('Diese schmerz Tabletten gibt es nur auf Rezept', 'Diese Schmerztabletten gibt es nur auf Rezept.');
ok(r.u === 'fast' && r.tags.includes('yazım') && !r.tags.includes('yanlış kelime') && r.kat.join() === 'yazım' && r.bitisik.join() === 'Schmerztabletten', 'schmerz Tabletten: fast yazım (bitişik)', r);
ok(/schmerz Tabletten/.test(Dinle.farkHTML(r.diff)) && r.diff.length === 7, 'bitişik: farkta tek kalem', r.diff);
r = P('Im nächsten Semester belege ich einen Deutsch Kurs', 'Im nächsten Semester belege ich einen Deutschkurs.');
ok(r.u === 'fast' && r.tags.includes('yazım'), 'Deutsch Kurs: fast yazım', r);
r = P('Ich bin heute zuhause', 'Ich bin heute zu Hause.');
ok(r.u === 'fast' && r.tags.includes('yazım') && r.ayri.join() === 'zu Hause', 'zuhause → zu Hause: fast yazım (ayrı)', r);
r = P('Das ist die Haustür', 'Das ist die Haustür.');
ok(r.u === 'richtig' && !r.bitisik.length, 'doğru bileşik: birleştirme yok', r);
// büyük / küçük harf: not düşürmez ama söylenir (cümle başı hariç)
r = P('wegen des dichten nebels fahren die züge heute langsamer', 'Wegen des dichten Nebels fahren die Züge heute langsamer.');
ok(r.u === 'richtig' && r.tags.includes('büyük/küçük harf') && r.harf.join() === 'Nebels,Züge', 'küçük harfli isimler söylenir', r);
r = P('ich gehe morgen zum Arzt', 'Ich gehe morgen zum Arzt.');
ok(r.u === 'richtig' && !r.harf.length && !r.tags.length, 'yalnız cümle başı küçük: not yok', r);
// ae/oe/ue/ss tam doğru, umlaut düşürme küçük hata
r = P('Die Strasse ist heute gross', 'Die Straße ist heute groß.'); ok(r.u === 'richtig', 'ss = ß', r);
r = P('Ich habe die Prufung bestanden', 'Ich habe die Prüfung bestanden.'); ok(r.u === 'fast' && r.tags.includes('umlaut'), 'Prufung: fast umlaut', r);

// sesli boşluk (boslukPruef): ae/oe/ue/ss doğru; umlaut düşürme fast 'umlaut'; sözlükte başka kelime yanlış
const B = (v, z) => Dinle.boslukPruef(G, v, z);
r = B('Pruefung', 'Prüfung'); ok(r.urteil === 'richtig', 'boşluk: Pruefung = Prüfung', r);
r = B('Strasse', 'Straße'); ok(r.urteil === 'richtig', 'boşluk: Strasse = Straße', r);
r = B('Prufung', 'Prüfung'); ok(r.urteil === 'fast' && r.tags.join() === 'umlaut', 'boşluk: Prufung fast umlaut', r);
r = B('Bremen', 'Bremen'); ok(r.urteil === 'richtig', 'boşluk: doğru', r);
G.lexSetzen(new Set(['verschieben', 'verschrieben', 'kindheit', 'liegt', 'legt']), new Set(['verschieben', 'verschreiben']));
r = B('verschieben', 'verschrieben'); ok(r.urteil === 'falsch', 'boşluk: verschieben ≠ verschrieben (sözlükte başka kelime)', r);
r = B('legt', 'liegt'); ok(r.urteil === 'falsch', 'boşluk: legt ≠ liegt', r);
r = B('verschriben', 'verschrieben'); ok(r.urteil === 'fast' && r.tags.includes('yazım'), 'boşluk: verschriben yazım', r);
ok(Dinle.baskaKelime('Kindhiet', 'Kindheit', null, G) === false && Dinle.baskaKelime('verschieben', 'verschrieben', null, G) === true, 'baskaKelime');
ok(Dinle.baskaKelime('Prufung', 'Prüfung', null, G) === false && Dinle.baskaKelime('stadt', 'Stadt', null, G) === false, 'baskaKelime: umlaut / harf büyüklüğü başka kelime değil');
ok(Dinle.ENTER_BEKLE >= 400 && Dinle.ENTER_BEKLE <= 800, 'erken Enter penceresi');
// fark gösterimi
const h = Dinle.farkHTML(P('Ich mag von allem Obst.', 'Ich mag vor allem Obst.').diff);
ok(/dn-fazla/.test(h) && /dn-eksik/.test(h), 'farkHTML', h);
ok(Array.isArray(Dinle.TURLER) && Dinle.TURLER.join() === 'kelime,bosluk,dikte', 'TURLER');

console.log(fail ? `test_dinle: ${fail} / ${n} test başarısız` : `test_dinle: ${n} test geçti`);
process.exit(fail ? 1 : 0);
