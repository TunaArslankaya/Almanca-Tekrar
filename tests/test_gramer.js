// node tests/test_gramer.js — Gramer bölümü cevap kontrolü ve not akışı (js/gramer.js; 7.11 denetim düzeltmeleri)
// Gr.pruef (DOM'suz) + sahte DOM ile tek tek alıştırma (Gramer.dene): itiraz, Devam kilidi, 1/2/3 tuşu, log etiketleri, hatayı bul, Bilmediklerim.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const G = require('../js/grammatik.js');
const FSRS = require('../js/fsrs.js');
global.window = global.window || {};
window.G = G;
eval(fs.readFileSync(ROOT + '/daten/grammatik.js', 'utf8'));
eval(fs.readFileSync(ROOT + '/js/gramer.js', 'utf8'));
const Gr = window.Gramer, GR = window.GRAMMATIK;
let fail = 0, n = 0;
const ok = (c, m, x) => { n++; if (!c) { fail++; console.log('✗', m, x !== undefined ? JSON.stringify(x) : ''); } };
const U = (id, nr) => GR[id].uebungen.find(u => u.n === nr);
const bul = (id, f) => GR[id].uebungen.find(f);
const P = (u, g) => Gr.pruef(u, g);
const cv = c => ({ tur: 'ceviri', cevap: [].concat(c) }), lk = (soru, c) => ({ tur: 'luecke', soru, cevap: [c] });

// ---------- tam cümle (umform / ceviri / ordnen): G.cumleKontrol ----------
let r = P(cv('Ich bin gestern ins Kino gegangen.'), 'Gestern bin ich ins Kino gegangen.');
ok(r.urteil === 'richtig', 'ceviri: geçerli Vorfeld dizilişi doğru', r);
r = P(cv('Ich bin gestern ins Kino gegangen.'), 'ich bin gestern ins kino gegangen');
ok(r.urteil === 'richtig' && !r.tags.length, 'ceviri: nokta / küçük harf hata değil', r);
r = P(U('vergleich', 90), 'Es gab mehr Arbeit als ich erwartet habe.');
ok(r.urteil === 'richtig' && !r.tags.includes('kaynaştırma'), 'vergleich:90: yalnız virgül eksik → doğru, "kaynaştırma" değil (log 7.11 17:23:46)', r);
r = P(cv('Ich glaube, dass er kommt.'), 'Ich glaube dass er kommt');
ok(r.urteil === 'richtig', 'ceviri: virgül eksik doğru', r);
r = P(cv('Ich bin gestern ins Kino gegangen.'), 'Ich bin gestern in das Kino gegangen.');
ok(r.urteil === 'fast' && r.tags.join() === 'kaynaştırma', 'ceviri: in das ↔ ins → kaynaştırma', r);
r = P(cv('Ich bin gestern ins Kino gegangen.'), 'Ich habe gestern ins Kino gegangen.');
ok(r.urteil === 'falsch' && r.tags.includes('yardımcı fiil'), 'ceviri: yardımcı fiil yanlış', r);
r = P(cv('Ich bin gestern ins Kino gegangen.'), 'Ich gestern bin ins Kino gegangen.');
ok(r.urteil === 'falsch' && r.tags.includes('fiil yeri'), 'ceviri: fiil yeri yanlış (yeri değişen zarf "eksik/fazla zarf" değil)', r);
r = P(cv('Ich habe dem Praktikanten alles erklärt.'), 'qwertz falsch');
ok(r.urteil === 'falsch' && r.tags.join() === 'farklı cümle', 'ceviri: anlamsız cevap → yalnız "farklı cümle"', r);
r = P(cv('Ich trinke heißen Tee.'), 'Ich trinke heissen Tee.');
ok(r.urteil === 'richtig', 'ceviri: ss = ß', r);
r = P(cv('Ich trinke heißen Tee.'), 'Ich trinke heisen Tee.');
ok(r.urteil === 'fast' && r.tags.join() === 'yazım', 'ceviri: tek harf yazım → fast', r);
r = P(cv('Diese Aufgabe ist nicht lösbar.'), 'Diese Aufgabe sind nicht lösbar.');
ok(r.urteil === 'fast' && r.tags.join() === 'fiil çekimi (özne uyumu)', 'ceviri: özne–fiil uyumu → fast (28.10 kuralı korunur)', r);
r = P(cv('Ich weiß nicht, ob ich die Prüfung schon bestanden habe.'), 'Ich weiß nicht, ob ich die Prüfung bestanden habe.');
ok(r.urteil === 'fast' && r.tags.includes('zarf'), 'ceviri: zarf eksik → fast (28.10 kuralı korunur)', r);
r = P(cv('Ich habe gestern einen neuen Kollegen kennengelernt.'), 'Ich habe gestern einen neue Kollegen kennengelernt.');
ok(r.urteil === 'falsch' && r.tags.includes('artikel/çekim'), 'ceviri: sıfat eki (konunun hatası) yanlış kalır', r);
r = P(cv('Wenn ich Zeit hätte, würde ich kommen.'), 'Wenn ich Zeit hatte, würde ich kommen.');
ok(r.urteil === 'falsch' && r.tags.includes('umlaut (başka biçim)'), 'ceviri: hätte → hatte (Präteritum) yanlış', r);
r = P(cv('Wenn ich Zeit hätte, würde ich kommen.'), 'Wenn ich Zeit haette, wuerde ich kommen.');
ok(r.urteil === 'richtig', 'ceviri: haette / wuerde = hätte / würde', r);
r = P(cv('Mein Bruder ist älter als ich.'), 'Mein Bruder ist alter als ich.');
ok(r.urteil === 'falsch', 'ceviri: älter → alter (Komparativ değil) yanlış', r);
r = P(U('es-korrelat', 16), 'Gibt es eine Aphoteke in der Nähe?');
ok(r.urteil === 'fast' && r.tags.join() === 'yazım', 'es-korrelat:16: Aphoteke (harf kayması) → yazım (log 31.10 16:23:25)', r);
r = P(U('tuerkisch-fallen', 87), 'Darf ich ihnen helfen?');
ok(r.urteil === 'fast' && r.tags.join() === 'büyük/küçük harf', 'tuerkisch-fallen:87: ihnen ↔ Ihnen (hitap) → küçük hata', r);
// umform yönergesi başlangıç istiyorsa başka geçerli diziliş dönüştürme sayılmaz
const ufW = { tur: 'umform', soru: 'Ich bin krank. Ich bleibe zu Hause. → Weil …', cevap: ['Weil ich krank bin, bleibe ich zu Hause.'] };
ok(P(ufW, 'Weil ich krank bin bleibe ich zu Hause').urteil === 'richtig', 'umform: virgülsüz doğru');
ok(P(ufW, 'Ich bleibe zu Hause, weil ich krank bin.').urteil === 'falsch', 'umform: "Weil … ile başla" yönergesine uymayan sıra yanlış');
ok(P({ tur: 'umform', soru: 'Ich bin krank. Ich bleibe zu Hause. → weil', cevap: ['Ich bleibe zu Hause, weil ich krank bin.'] }, 'Weil ich krank bin, bleibe ich zu Hause.').urteil === 'richtig', 'umform: "weil ile birleştir" → yan cümle önde de doğru');
// sırayı sınamayan teil'de yalnız kelime sırası farkı küçük hata, sırayı sınayan teil'de yanlış
{
  const sert = bul('satzklammer-tekamolo', u => u.tur === 'ceviri' && GR['satzklammer-tekamolo'].teile[u.teil].etiket === 'kelime sırası');
  const yumusak = bul('n-deklination', u => u.tur === 'ceviri' && /\b\w+ \w+ \w+ \w+ \w+/.test(u.cevap[0]) && GR['n-deklination'].teile[u.teil].etiket !== 'kelime sırası');
  ok(!!sert && !!yumusak, 'örnek alıştırmalar bulundu');
  const sw = s => { const w = s.replace(/[.!?]$/, '').split(' '); const i = w.length - 3; [w[i], w[i - 1]] = [w[i - 1], w[i]]; return w.join(' ') + '.'; };
  const rs = sert && P(sert, sw(sert.cevap[0]));
  ok(!rs || rs.urteil === 'falsch', 'TeKaMoLo teil\'inde sıra hatası yanlış', [sert && sert.cevap[0], rs]);
}

// ---------- boşluk (luecke / text): parcaPruef ----------
r = P(U('temporal-praep', 47), ['Mnoaten']);
ok(r.urteil === 'fast' && r.tags.join() === 'yazım', 'luecke: Mnoaten → yazım (7.11: 573/574 tam yanlıştı)', r);
r = P(bul('n-deklination', u => u.tur === 'luecke' && /Kennst du schon den neuen ___/.test(u.soru)), ['Doeznten']);
ok(r.urteil === 'fast', 'luecke: Doeznten → yazım', r);
r = P(bul('n-deklination', u => u.tur === 'luecke' && /Kennst du schon den neuen ___/.test(u.soru)), ['Dozent']);
ok(r.urteil === 'falsch', 'luecke: Dozent (ek eksik, konunun kendisi) yanlış', r);
r = P(lk('Ich ___ gestern ___.', 'habe ; gearbeitet'), ['habe', 'gearbeiten']);
ok(r.urteil === 'falsch', 'luecke: gearbeiten (ek farkı) yanlış', r);
r = P(lk('Ich mag die ___.', 'Straße'), ['Strasse']);
ok(r.urteil === 'richtig' && !r.tags.length, 'luecke: ss = ß', r);
r = P(lk('Ich ___ gern.', 'hätte'), ['haette']);
ok(r.urteil === 'richtig', 'luecke: ae = ä', r);
r = P(lk('Ich bin ___.', 'müde'), ['mude']);
ok(r.urteil === 'fast' && r.tags.join() === 'umlaut', 'luecke: umlaut düşürme → fast umlaut', r);
r = P(U('konjunktiv2', 1), ['hatte']);
ok(r.urteil === 'falsch' && r.tags.join() === 'umlaut (başka biçim)', 'konjunktiv2: hatte (Präteritum) ≠ hätte → yanlış (log 28.10 / 31.10)', r);
r = P(bul('konjunktiv2', u => u.tur === 'luecke' && /^___ du Lust/.test(u.soru)), ['Hattest']);
ok(!r || r.urteil === 'falsch', 'konjunktiv2: Hattest → yanlış', r);
r = P(lk('Er ___ nach Berlin.', 'fährt'), ['fahrt']);
ok(r.urteil === 'falsch', 'luecke: fahrt (ihr-biçimi) ≠ fährt', r);
r = P(U('adjektiv', 2), ['neu']);
ok(r.urteil === 'falsch', 'adjektiv:2: neu ≠ neue (eski fold "ue"yi u yapıyordu: fast)', r);
r = P(U('tuerkisch-fallen', 12), ['ihnen']);
ok(r.urteil === 'fast' && r.tags.join() === 'büyük/küçük harf', 'tuerkisch-fallen:12: ihnen ↔ Ihnen → küçük hata (log 4.11 06:48:49)', r);
r = P(lk('___ du Lust?', 'Hättest'), ['hättest']);
ok(r.urteil === 'richtig', 'luecke: cümle başı boşlukta büyük/küçük harf sayılmaz', r);
r = P(lk('Wir sind gestern ___ Kino gegangen.', 'ins'), ['in das']);
ok(r.urteil === 'fast' && r.tags.join() === 'kaynaştırma', 'luecke: kaynaştırma etiketli', r);
r = P(U('satzklammer-tekamolo', 67), ['nachste Woche', 'mit dem Flugzeug']);
ok(r.urteil === 'fast' && r.tags.join() === 'umlaut', 'satzklammer:67: etiket "umlaut" (eskiden teil etiketi "kelime sırası", log 6.11 13:11:54)', r);
// text: en az üçte ikisi
r = P(U('reflexiv', 76), ['uns', 'sich', 'sich', 'euer']);
ok(r.urteil === 'falsch', 'reflexiv:76 text: 4 zamirin 2\'si yanlış → yanlış (log 3.11 18:55:07)', r);

// ---------- dinle ----------
const dn = { tur: 'dinle', cevap: ['Ich hoffe, dass das Wetter morgen schön ist.'] };
ok(P(dn, 'ich hoffe dass das wetter morgen schoen ist').urteil === 'richtig', 'dinle: oe = ö');
ok(P(dn, 'ich hoffe dass das wetter morgen schon ist').urteil === 'fast', 'dinle: umlaut düşürme fast');
r = P(dn, 'qwertz falsch'); ok(r.urteil === 'falsch' && !r.tags.includes('yardımcı fiil'), 'dinle: anlamsız cevapta yanıltıcı etiket yok', r);

// ---------- hatayı bul: aralıktaki doğru kelime ----------
{
  const izin = Gr._ic.fehlerIzin;
  const f = { tur: 'fehler', soru: 'In unserer Straße gibt es einen neue Supermarkt.', hata: 'einen neue', cevap: ['In unserer Straße gibt es einen neuen Supermarkt.'] };
  ok([...izin(f)].join() === 'neue', 'fehlerIzin: "einen neue" → yalnız neue', [...izin(f)]);
  const f2 = { tur: 'fehler', soru: 'Deshalb ich gehe nach Hause.', hata: 'ich gehe', cevap: ['Deshalb gehe ich nach Hause.'] };
  ok([...izin(f2)].sort().join() === 'gehe,ich', 'fehlerIzin: sıra hatasında aralığın hepsi', [...izin(f2)]);
  const f3 = { tur: 'fehler', soru: 'Alle Student muss einen Ausweis haben.', hata: 'Alle Student muss', cevap: ['Jeder Student muss einen Ausweis haben.'] };
  ok([...izin(f3)].join() === 'alle', 'fehlerIzin: değişen kelime', [...izin(f3)]);
  // içerik: her "hatayı bul" alıştırmasında hata alanının her kelimesi dokunulabilir (aralık çekirdek kelimeye daraltıldı)
  const bozuk = [];
  Object.keys(GR).forEach(id => GR[id].uebungen.forEach(u => {
    if (u.tur !== 'fehler' || !u.hata || u.hata === '-') return;
    const iz = izin(u), hw = u.hata.split(/\s+/);
    if (!iz.size || !iz.has(hw[0].replace(/^[„“"«»(]+|[.,!?;:„“"«»)]+$/g, '').toLowerCase())) bozuk.push(`${id}:${u.n}`);
  }));
  ok(!bozuk.length, 'fehler: hata aralığının ilk kelimesi hatalı kelime', bozuk.slice(0, 10));
}

// ---------- sahte DOM ile not akışı ----------
const inp = v => ({ value: v, readOnly: false, classList: { add() {} } });
const mkEl = () => { const e = { innerHTML: '', inputs: [], tam: null, sonuc: { innerHTML: '' },
  querySelector(s) { return s === '#g-sonuc' ? e.sonuc : s === '.g-tam' ? e.tam : s === '.g-inp' ? (e.inputs[0] || e.tam) : null; },
  querySelectorAll(s) { return s === '.g-inp' ? (e.inputs.length ? e.inputs : e.tam ? [e.tam] : []) : []; }, contains: () => true }; return e; };
const B = (g, ds) => ({ dataset: Object.assign({ g }, ds || {}), closest() { return this; } });
const KEY = k => ({ key: k, preventDefault() {}, target: { tagName: 'DIV' } });
let saat = new Date(2026, 10, 8, 10).getTime();
const logs = [], later = [], kartEl = mkEl();
const D = { gram: { konu: {}, ghost: {} }, bilmedik: {} };
Gr.init({ S: () => D, G, FSRS, now: () => saat, tag: t => new Date(t).toISOString().slice(0, 10), ret: () => 0.85, soruSayisi: () => 0, logEintrag: x => logs.push(x), save() {},
  heuteM: m => ({ n: 0 }), xpEkle() {}, sayac() {}, toast() {}, esc: s => String(s), deHTML: s => String(s), kart: () => kartEl, durum() {}, later: (f, ms) => later.push({ f, ms }), fx() {}, odakla: () => false, sprich() {},
  bilmedik: (k, ad, dogru) => { const x = D.bilmedik[k]; if (!dogru) D.bilmedik[k] = Object.assign({}, x, { ad, n: ((x && x.n) || 0) + 1, d: 0, dt: 0 }); } });
const runLater = () => { while (later.length) later.shift().f(); };
const ses = () => Gr._ic.ses();
const yaz = v => { kartEl.inputs = []; kartEl.tam = inp(v); Gr.klick({ target: B('kontrol') }); };
const sonLog = () => logs[logs.length - 1];
// 1) çeviri yanlış ama hedefe çok yakın: 1/2/3 tuşu notu değiştirmez; Enter kilitte yok sayılır; tek itiraz "yazım hatasıydı" → fast, öneri:falsch
{
  const u = bul('weil-dass', x => x.tur === 'ceviri' && x.cevap[0].length > 30);
  Gr.dene('weil-dass', [u.n]);
  const hedef = u.cevap[0], bozuk = hedef.replace(/\b(\w)(\w)(\w{4,})\b/, (m, a, b, c) => a + c.slice(0, 1) + b + c.slice(1)).replace(/\bich\b/, 'du');
  yaz(bozuk);
  const q = ses().q;
  ok(q.done && q.urteil === 'falsch', 'akış: yanlış cevap', [bozuk, q.urteil, q.tags]);
  ok(Gr.tus(KEY('3')) === false && q.son === 1 && !q.notlandi, '1/2/3 tuşu notu değiştirmez (kazara yükseltme yok)');
  Gr.tus(KEY('Enter'));
  ok(!q.notlandi, 'yanlışta Devam 2,5 sn kilitli: Enter yok sayılır');
  saat += 3000; runLater();
}
{
  // itiraz: yakın yanlış (tek harf + tek kelime eksik değil: yalnız yazım dışı küçük fark) — "yazım hatasıydı"
  const u = { n: 9001, tur: 'ceviri', teil: 'x', z: 2, soru: 'Bugün evdeyim.', cevap: ['Ich bin heute zu Hause.'], tr: '-', aciklama: '' };
  GR['weil-dass'].uebungen.push(u);
  Gr.dene('weil-dass', [9001]);
  yaz('Ich bin heute zu Hasue.');
  let q = ses().q;
  ok(q.urteil === 'fast', 'Hasue: tek harf kayması zaten küçük hata', q.urteil);
  Gr.dene('weil-dass', [9001]);
  yaz('Ich bin heute zu Hau.');
  q = ses().q;
  ok(q.urteil === 'falsch' && q.itirazVar === 'yazim', 'yakın yanlış → "yazım hatasıydı" itirazı sunulur', [q.urteil, q.itirazVar, q.tags]);
  ok(/data-g="itiraz"/.test(kartEl.sonuc.innerHTML) && !/data-n=/.test(kartEl.sonuc.innerHTML), 'panelde tek itiraz düğmesi, not seçme düğmesi yok');
  Gr.klick({ target: B('itiraz') });
  ok(q.urteil === 'fast' && q.son === 2 && q.itiraz, 'itiraz → küçük hata');
  Gr.klick({ target: B('itiraz') });
  ok(q.son === 2, 'ikinci itiraz yok');
  Gr.tus(KEY('Enter'));
  ok(!q.notlandi, 'itirazla küçük hata: kilit sürer');
  saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  const l = sonLog();
  ok(l.ergebnis === 'fast' && /öneri:falsch/.test(l.notiz) && /yazım/.test(l.notiz), 'log: ergebnis fast, öneri:falsch', l);
  // "aslında doğru": tam cümlede başka çeviri
  Gr.dene('weil-dass', [9001]);
  yaz('Heute bleibe ich daheim.');
  q = ses().q;
  ok(q.urteil === 'falsch' && q.itirazVar === 'dogru', 'tam cümlede yanlış → "aslında doğru" itirazı', [q.urteil, q.itirazVar]);
  Gr.klick({ target: B('itiraz') });
  ok(q.urteil === 'richtig' && !q.tags.length, 'aslında doğru → doğru, etiketsiz');
  runLater();   // doğru: kendiliğinden geçer
  ok(sonLog().ergebnis === 'richtig' && /öneri:falsch/.test(sonLog().notiz), 'log: richtig + öneri:falsch', sonLog());
  // Bilmiyorum: itiraz yok
  Gr.dene('weil-dass', [9001]);
  Gr.klick({ target: B('bilmiyorum') });
  q = ses().q;
  ok(q.urteil === 'falsch' && !q.itirazVar && !/data-g="itiraz"/.test(kartEl.sonuc.innerHTML), 'Bilmiyorum\'dan sonra itiraz yok');
  saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  ok(/bilmiyorum/.test(sonLog().notiz) && !/öneri/.test(sonLog().notiz), 'Bilmiyorum log: öneri yok', sonLog());
  GR['weil-dass'].uebungen.pop();
}
// 2) log: teil'in sabit etiketi gerçek hata gibi yazılmaz; Bilmediklerim yanlışta sıfırlanır
{
  const u = U('satzklammer-tekamolo', 67), key = `g:satzklammer-tekamolo:${u.teil}`;
  D.bilmedik[key] = { ad: 'x', ilk: 1, son: 1, n: 1, d: 2, dt: 5 };
  Gr.dene('satzklammer-tekamolo', [67]);
  kartEl.tam = null; kartEl.inputs = ['nachste Woche', 'mit dem Flugzeug'].map(inp); Gr.klick({ target: B('kontrol') });
  saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  ok(/\| umlaut \|/.test(sonLog().notiz) && !/kelime sırası/.test(sonLog().notiz), 'log: yalnız gerçek etiket (umlaut), teil etiketi yok', sonLog().notiz);
  Gr.dene('satzklammer-tekamolo', [67]);
  Gr.klick({ target: B('bilmiyorum') }); saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  ok(sonLog().notiz.split(' | ').filter(x => !/^(tür|z|sek):/.test(x)).join() === 'bilmiyorum', 'Bilmiyorum log: teil etiketi eklenmez', sonLog().notiz);
  D.bilmedik[key] = { ad: 'x', ilk: 1, son: 1, n: 1, d: 2, dt: 5 };
  Gr.dene('satzklammer-tekamolo', [67]);
  kartEl.inputs = ['xyz', 'abc'].map(inp); Gr.klick({ target: B('kontrol') }); saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  ok(D.bilmedik[key].d === 0 && D.bilmedik[key].n === 1, 'Bilmediklerim: listedeki teil\'de yanlış → "biliyorsun" sayacı sıfır', D.bilmedik[key]);
}
// 3) hatayı bul: aralıktaki doğru kelimeye dokunmak yanlış
{
  const u = U('adjektiv', 57);
  const toks = u.soru.split(/(\s+)/), i = w => toks.findIndex(t => t.replace(/[.,!?]$/, '') === w);
  Gr.dene('adjektiv', [57]); Gr.klick({ target: B('tok', { i: String(i('einen')) }) });
  ok(ses().q.urteil === 'falsch' && ses().q.tags.join() === 'yanlış kelime seçildi', 'fehler: "einen" (doğru kelime) → yanlış', ses().q);
  saat += 3000; runLater(); Gr.tus(KEY('Enter'));
  Gr.dene('adjektiv', [57]); Gr.klick({ target: B('tok', { i: String(i('neue')) }) });
  ok(ses().q.urteil === 'richtig' || ses().q.adim === 2, 'fehler: "neue" → doğru');
  runLater();
}
// 4) tanı testi: küçük hata etiketleri (yazım / büyük-küçük harf) konuyu zayıf yapmaz
{
  const T = Gr._ic;
  D.gram.tani = { konu: {}, oturum: 0 };
  const u = U('temporal-praep', 47), id = 'temporal-praep';
  // DOM'suz: notla'nın tanı kolu taniCevap'a gecti ise 'richtig' verir; ses'i elle kur
  Gr.dene(id, [47]);
  const s = ses(); s.art = 'tani'; s.tani = { n: 0, d: 0, biliyor: [], zayif: [], basla: saat }; s.taniSira = 1;
  kartEl.tam = null; kartEl.inputs = [inp('Mnoaten')]; Gr.klick({ target: B('kontrol') });
  ok(s.q.urteil === 'fast' && s.q.tags.join() === 'yazım' && !s.q.kilitBis, 'tanı: Mnoaten fast yazım, kilit yok', s.q);
  Gr.tus(KEY('Enter'));
  const a = (D.gram.tani.konu[id] || { a: [] }).a;
  ok(a.length === 1 && a[0].u === 'richtig', 'tanı: yazım hatası konuyu zayıf yapmaz', a);
}
// 5) set notu 2 konu aralığını uzatmaz
{
  const t = saat, alt = { S: 30, D: 5, reps: 4, lapses: 0, last: t - 10 * 86400000, due: t, lastG: 3 };
  const yeni = FSRS.review(alt, 2, t, 0.85);
  Gr._ic.zorAralik(yeni, alt, 2, t);
  ok(yeni.due <= t + 10 * 86400000, 'set notu 2: yeni aralık ≤ önceki aralık (10 gün)', (yeni.due - t) / 86400000);
  const iyi = Gr._ic.zorAralik(FSRS.review(alt, 3, t, 0.85), alt, 3, t);
  ok(iyi.due > t + 10 * 86400000, 'set notu 3: aralık büyür');
}
// öz denetim: her alıştırmanın kendi doğru cevabı doğru (fehler dahil: hata kelimesine dokunmak)
{
  const bad = [];
  Object.keys(GR).forEach(id => GR[id].uebungen.forEach(u => {
    if (u.tur !== 'fehler' && ['umform', 'ceviri', 'ordnen'].includes(u.tur)) u.cevap.forEach(c => { const x = P(u, u.tur === 'ordnen' ? c.replace(/,/g, '') : c); if (x.urteil !== 'richtig') bad.push(`${id}:${u.n} ${c}`); });
  }));
  ok(!bad.length, 'bütün alternatifler doğru sayılır', bad.slice(0, 10));
}

console.log(fail ? `\n${fail} / ${n} hata` : `tüm testler geçti (${n})`);
process.exit(fail ? 1 : 0);
