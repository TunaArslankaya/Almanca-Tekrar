// node tests/test_grammatik.js
const G = require('../js/grammatik.js');
const FSRS = require('../js/fsrs.js');
let fail = 0;
const eq = (a, b, m) => { if (a !== b) { fail++; console.log('✗', m, '\n   bekl:', b, '\n   gelen:', a); } };

// Präsens
const V = (base, p3, extra) => Object.assign({ base, p3, pre: '', sp: '' }, extra || {});
eq(G.praesensForms(V('fahren', 'fährt')).join(','), 'fahre,fährst,fährt,fahren,fahrt,fahren', 'fahren');
eq(G.praesensForms(V('halten', 'hält')).join(','), 'halte,hältst,hält,halten,haltet,halten', 'halten');
eq(G.praesensForms(V('lesen', 'liest')).join(','), 'lese,liest,liest,lesen,lest,lesen', 'lesen');
eq(G.praesensForms(V('arbeiten', 'arbeitet')).join(','), 'arbeite,arbeitest,arbeitet,arbeiten,arbeitet,arbeiten', 'arbeiten');
eq(G.praesensForms(V('ändern', 'ändert')).join(','), 'ändere,änderst,ändert,ändern,ändert,ändern', 'ändern');
eq(G.praesensForms(V('sammeln', 'sammelt')).join(','), 'sammle,sammelst,sammelt,sammeln,sammelt,sammeln', 'sammeln');
eq(G.praesensForms(V('öffnen', 'öffnet')).join(','), 'öffne,öffnest,öffnet,öffnen,öffnet,öffnen', 'öffnen');
eq(G.praesensForms(V('tanzen', 'tanzt')).join(','), 'tanze,tanzt,tanzt,tanzen,tanzt,tanzen', 'tanzen');
eq(G.praesensForms(V('nehmen', 'nimmt')).join(','), 'nehme,nimmst,nimmt,nehmen,nehmt,nehmen', 'nehmen');
eq(G.praesensForms(V('laden', 'lädt')).join(','), 'lade,lädst,lädt,laden,ladet,laden', 'laden');
eq(G.praesensForms(V('treten', 'tritt')).join(','), 'trete,trittst,tritt,treten,tretet,treten', 'treten');
eq(G.praesensForms(V('waschen', 'wäscht')).join(','), 'wasche,wäschst,wäscht,waschen,wascht,waschen', 'waschen');
eq(G.praesensForms(V('lassen', 'lässt')).join(','), 'lasse,lässt,lässt,lassen,lasst,lassen', 'lassen');
eq(G.praesensForms(V('heißen', 'heißt')).join(','), 'heiße,heißt,heißt,heißen,heißt,heißen', 'heißen');
eq(G.praesensForms(V('lernen', 'lernt')).join(','), 'lerne,lernst,lernt,lernen,lernt,lernen', 'lernen');
eq(G.praesensForms(V('atmen', 'atmet')).join(','), 'atme,atmest,atmet,atmen,atmet,atmen', 'atmen');

// NP
const N = (art, lemma, x) => Object.assign({ art, lemma, tr: '?' }, x || {});
eq(G.np(N('der', 'Urlaub'), 'A', { det: 'def' }).join(' '), 'den Urlaub', 'den Urlaub');
eq(G.np(N('der', 'Bruder'), 'D', { det: 'poss', poss: 'du' }).join(' '), 'deinem Bruder', 'deinem Bruder');
eq(G.np(N('die', 'Reise'), 'A', { det: 'poss', poss: 'ihr', adj: 'lang' }).join(' '), 'eure lange Reise', 'eure lange Reise');
eq(G.np(N('das', 'Auto'), 'A', { det: 'indef', adj: 'neu' }).join(' '), 'ein neues Auto', 'ein neues Auto');
eq(G.np(N('der', 'Kollege', { weak: true }), 'D', { det: 'def' }).join(' '), 'dem Kollegen', 'weak');
eq(G.np(N('der', 'Herr', { weak: true }), 'A', { det: 'def' }).join(' '), 'den Herrn', 'Herrn');
eq(G.np(N('das', 'Kind', { plf: 'Kinder' }), 'D', { det: 'def', plural: true }).join(' '), 'den Kindern', 'Dat pl');
eq(G.np(N('der', 'Film'), 'D', { det: 'def', adj: 'teuer' }).join(' '), 'dem teuren Film', 'teuer');
eq(G.pluralForm('Bahnhof', '¨-e'), 'Bahnhöfe', 'plural uml');
eq(G.pluralForm('Haus', '¨-er'), 'Häuser', 'plural Haus');
eq(G.pluralForm('Vater', '¨-'), 'Väter', 'plural Vater');
eq(G.withPrep('zu', ['der', 'Ärztin'], true).join(' '), 'zur Ärztin', 'zur');

// Satz
const freuen = { anz: 'sich freuen auf', inf: 'freuen', base: 'freuen', pre: '', sp: '', p3: 'freut', aux: 'hat', p2: 'gefreut', refl: 'A', obj: [{ p: 'auf', k: 'A' }] };
const anrufen = { anz: 'anrufen', inf: 'anrufen', base: 'rufen', pre: 'an', sp: '', p3: 'ruft', aux: 'hat', p2: 'angerufen', refl: '', obj: [{ k: 'A' }] };
const reise = N('die', 'Reise');
const S = cfg => G.bauen(cfg);
eq(S({ v: freuen, subj: { pk: 'wir' }, tempus: 'perf', typ: 'aussage', neg: true, objs: [{ slot: freuen.obj[0], noun: reise, det: 'def' }] }).de,
  'Wir haben uns nicht auf die Reise gefreut.', 'perf neg refl');
eq(S({ v: freuen, subj: { pk: 'du' }, tempus: 'praes', typ: 'frage', objs: [{ slot: freuen.obj[0], noun: reise, det: 'def' }] }).de,
  'Freust du dich auf die Reise?', 'frage');
eq(S({ v: freuen, subj: { pk: 'du' }, tempus: 'perf', typ: 'wfrage', wIdx: 0, objs: [{ slot: freuen.obj[0], noun: reise, det: 'def' }] }).de,
  'Worauf hast du dich gefreut?', 'wfrage');
eq(S({ v: freuen, subj: { pk: 'ich' }, tempus: 'modal', modal: 'können', typ: 'neben', konj: 'weil', objs: [{ slot: freuen.obj[0], noun: reise, det: 'def' }] }).de,
  'weil ich mich auf die Reise freuen kann', 'neben modal');
eq(S({ v: anrufen, subj: { pk: 'ich' }, tempus: 'praes', typ: 'aussage', zeit: { de: 'morgen' }, objs: [{ slot: anrufen.obj[0], pron: 'du' }] }).de,
  'Morgen rufe ich dich an.', 'inversion sep');
eq(S({ v: anrufen, subj: { pk: 'ich' }, tempus: 'praes', typ: 'neben', konj: 'weil', neg: true, objs: [{ slot: anrufen.obj[0], pron: 'du' }] }).de,
  'weil ich dich nicht anrufe', 'neben sep neg');
const r = S({ v: freuen, subj: { name: 'Anna', k: '3sg', pk: 'sie' }, tempus: 'praes', typ: 'aussage', zeit: { de: 'heute' }, objs: [{ slot: freuen.obj[0], noun: reise, det: 'def' }] });
eq(r.de, 'Heute freut sich Anna auf die Reise.', 'name');
eq(r.alts.includes('Heute freut Anna sich auf die Reise.'), true, 'name alt');

eq(G.np(N('der', 'Nachbar', { weak: true }), 'D', { det: 'poss', poss: 'du' }).join(' '), 'deinem Nachbarn', 'Nachbarn');
eq(G.np(N('die', 'Eltern'), 'D', { det: 'poss', poss: 'er', plural: true }).join(' '), 'seinen Eltern', 'Eltern Dat');

// Prüfen
eq(G.pruefen('wir haben uns nicht auf die Reise gefreut', 'Wir haben uns nicht auf die Reise gefreut.').urteil, 'richtig', 'richtig');
eq(G.pruefen('Wir haben nicht auf die Reise gefreut.', 'Wir haben uns nicht auf die Reise gefreut.').tags.includes('dönüşlü zamir'), true, 'refl tag');
eq(G.pruefen('Wir haben uns nicht auf die Reise gefreut', 'Wir haben uns nicht auf den Reise gefreut.').urteil, 'falsch', 'artikel');
eq(G.pruefen('Ich fahre nach Munchen', 'Ich fahre nach München.').urteil, 'fast', 'umlaut');

// Lücke
const abfahren = { inf: 'abfahren', base: 'fahren', pre: 'ab', sp: '', p3: 'fährt', pt3: 'fuhr', p2: 'abgefahren' };
eq(G.luecke(abfahren, 'Wann fährt der Zug ab?').answer, 'fährt ab', 'luecke sep');
eq(G.luecke(abfahren, 'Der Zug ist schon abgefahren.').answer, 'abgefahren', 'luecke p2');

// n-Deklination, Genitiv
eq(G.np(N('der', 'Name', { weak: true, gen: 'Namens' }), 'G', { det: 'def' }).join(' '), 'des Namens', 'Genitiv Namens');
eq(G.np(N('der', 'Student', { weak: true, gen: 'Studenten' }), 'A', { det: 'indef' }).join(' '), 'einen Studenten', 'einen Studenten');
eq(G.np(N('der', 'Lehrer', { gen: 'Lehrers' }), 'D', { det: 'poss', poss: 'ich' }).join(' '), 'meinem Lehrer', 'kein n bei Lehrer');
eq(G.np(N('der', 'Arzt', { gen: 'Arztes' }), 'G', { det: 'def' }).join(' '), 'des Arztes', 'des Arztes');

// Dönüşlü: emir kipi
const IV = (base, p3, x) => Object.assign({ base, p3, pre: '', sp: '' }, x || {});
eq(G.imperativDu(IV('beeilen', 'beeilt')), 'beeil', 'beeil dich');
eq(G.imperativDu(IV('beruhigen', 'beruhigt')), 'beruhige', 'beruhige dich');
eq(G.imperativDu(IV('bewerben', 'bewirbt')), 'bewirb', 'bewirb dich');
eq(G.imperativDu(IV('sehen', 'sieht', { pre: 'an' })), 'sieh', 'sieh es dir an');
eq(G.imperativDu(IV('konzentrieren', 'konzentriert')), 'konzentrier', 'konzentrier dich');
eq(G.imperativDu(IV('kümmern', 'kümmert')), 'kümmere', 'kümmere dich');
eq(G.imperativDu(IV('ziehen', 'zieht', { pre: 'an' })), 'zieh', 'zieh dich an');
eq(G.imperativDu(IV('lesen', 'liest')), 'lies', 'lies');

// v5 §4.3 yazım hoşgörüsü (G.pruefen(…, {lemma:true})): sözlük gerçek veriden (lemmalar + çoğullar + fiil biçimleri)
{
  const fs = require('fs');
  global.window = global.window || {};
  ['verben', 'nomen', 'woerter'].forEach(f => eval(fs.readFileSync(__dirname + '/../daten/' + f + '.js', 'utf8')));
  const LEX = new Set();
  const ekle = x => { if (x) String(x).split(/[ /]+/).forEach(w => w.length > 1 && LEX.add(w.toLowerCase())); };
  window.NOMEN.liste.forEach(n => { ekle(n.lemma); ekle(n.plf); });
  window.VERBEN.forEach(v => { ekle(v.inf); ekle(v.p2); ekle((v.pt3 || '').split('/')[0]); try { G.praesensForms(v).forEach(ekle); } catch (e) { /* yok */ } });
  (window.WOERTER || []).forEach(w => ekle(w.de));
  G.lexSetzen(LEX);
  const L = (inp, ziel) => G.pruefen(inp, ziel, [], { lemma: true });
  // anlam değiştiren çiftler yazım hatası SAYILMAZ (sözlükte başka kelime ya da umlaut farkı)
  [['liegen', 'legen'], ['legen', 'liegen'], ['setzen', 'sitzen'], ['sitzen', 'setzen'], ['bitten', 'bieten'], ['bieten', 'bitten'],
    ['Stadt', 'Staat'], ['Staat', 'Stadt'], ['schon', 'schön'], ['schön', 'schon'], ['zahlen', 'zählen'], ['zählen', 'zahlen'], ['drucken', 'drücken'], ['drücken', 'drucken']]
    .forEach(([a, b]) => { const r = L(a, b); eq(r.tip !== 'yazim' && r.tip !== 'dogru', true, `${a} ≠ ${b} (yazım sayılmaz: ${r.tip})`); });
  eq(L('liegen', 'legen').tip, 'yanlis', 'liegen/legen yanlış');
  eq(L('Staat', 'Stadt').tip, 'yanlis', 'Staat/Stadt yanlış');
  eq(L('schön', 'schon').tip, 'umlaut', 'schon/schön umlaut');
  // umlaut: Mutter/Mütter → fast (m2)
  const mu = L('Mutter', 'Mütter'); eq(mu.tip + ' ' + mu.urteil, 'umlaut fast', 'Mutter/Mütter umlaut fast');
  eq(L('Mütter', 'Mutter').tip, 'umlaut', 'Mütter/Mutter umlaut');
  // ae/oe/ue/ss tam doğru
  eq(L('Strasse', 'Straße').urteil, 'richtig', 'ss = ß');
  eq(L('Gemuese', 'Gemüse').urteil, 'richtig', 'ue = ü');
  eq(L('hoeren', 'hören').urteil, 'richtig', 'oe = ö');
  eq(L('Aerztin', 'Ärztin').urteil, 'richtig', 'Ae = Ä');
  eq(L('Fuehrerschein', 'Führerschein').urteil, 'richtig', 'ue bileşik');
  // uzunluk kuralı: ≥ 5 harf + lev 1, ≥ 10 harf + lev ≤ 2 → yazım; kısa kelimede yanlış
  eq(L('Banhof', 'Bahnhof').tip, 'yazim', 'Bahnhof lev 1 yazım');
  eq(L('Tiscch', 'Tisch').tip, 'yazim', 'Tisch (5) lev 1 yazım');
  eq(L('Krankenhuas', 'Krankenhaus').tip, 'yazim', 'Krankenhaus (11) lev 2 yazım');
  eq(L('Krnkenhuas', 'Krankenhaus').tip, 'yanlis', 'lev 3 yanlış');
  eq(L('Hous', 'Haus').tip, 'yanlis', 'Haus (4) lev 1 yanlış');
  eq(L('Fahrkate', 'Fahrkarte').tip, 'yazim', 'Fahrkarte lev 1 yazım');
  eq(L('Fahrkrate', 'Fahrkarte').tip, 'yanlis', 'Fahrkarte (9) lev 2 yanlış');
  eq(L('Bahnhof', 'Bahnhof').urteil, 'richtig', 'tam doğru');
  eq(L('bahnhof', 'Bahnhof').urteil, 'richtig', 'baş harf küçük');
  eq(L('warten auf', 'warten auf').urteil, 'richtig', 'kalıp');
  eq(L('wartn auf', 'warten auf').tip, 'yazim', 'kalıpta tek yazım');
}

// Gramer bölümü: yeni alıştırma türleri (ceviri, text, eslestir, kategori, dinle) — derleme + kontrol (js/gramer.js Gramer.pruef)
{
  const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
  const ROOT = path.join(__dirname, '..');
  global.window = global.window || {};
  window.G = G;
  eval(fs.readFileSync(ROOT + '/daten/grammatik.js', 'utf8'));
  eval(fs.readFileSync(ROOT + '/js/gramer.js', 'utf8'));
  const Gr = window.Gramer, durum = {};
  let saat = Date.UTC(2026, 9, 18, 10);
  Gr.init({ S: () => durum, G, now: () => saat, soruSayisi: () => 0 });
  const W = window.GRAMMATIK['weil-dass'], U = n => W.uebungen.find(u => u.n === n);
  const bul = tur => W.uebungen.find(u => u.tur === tur && !u.aus);
  // derleme
  const tx = bul('text'), es = bul('eslestir'), kt = bul('kategori'), cv = bul('ceviri'), dn = bul('dinle');
  eq(!!(tx && es && kt && cv && dn), true, 'weil-dass: her yeni türden örnek var');
  eq(tx.parcalar.length, (tx.soru.match(/___/g) || []).length, 'text: parça sayısı = boşluk sayısı');
  eq(JSON.stringify(tx.parcalar[2]), JSON.stringify(['bestehe', 'bestehen werde']), 'text: parçada alternatifler');
  eq(tx.cevap[0], 'studieren will ; geworden ist ; bestehe', 'text: cevap[0] = ilk alternatifler');
  eq(es.sol.length === es.sag.length && es.sol.length >= 3, true, 'eslestir: sol = sağ');
  eq(es.sag[1], 'ich habe hohes Fieber.', 'eslestir: sağ öğe ayrıştırma');
  eq(kt.gruplar.map(g => g.ad + ':' + g.oge.length).join(' '), 'Verb am Ende:3 Verb direkt danach:2 Subjekt + Verb:2', 'kategori: gruplar');
  eq(cv.tr, '-', 'ceviri: Türkçe alanı -');
  eq(U(33).teil, 'v-end', '@teil yeniden açma: v-end');
  eq(U(39).teil, 'dass-das', '@teil yeniden açma: dass-das');
  // ceviri (umform gibi)
  eq(Gr.pruef(cv, 'Weil ich krank bin, bleibe ich heute zu Hause.').urteil, 'richtig', 'ceviri: alternatif doğru');
  eq(Gr.pruef(cv, 'ich bleibe heute zu Hause, weil ich krank bin').urteil, 'richtig', 'ceviri: nokta / baş harf');
  eq(Gr.pruef(cv, 'Ich bleibe heute zu Hause, weil ich bin krank.').urteil, 'falsch', 'ceviri: weil + V2 yanlış');
  eq(Gr.pruef(cv, 'Ich bleibe heute zu Hause, weil ich krank bin.').antwort, 'Ich bleibe heute zu Hause, weil ich krank bin.', 'ceviri: antwort');
  // text
  const T = a => Gr.pruef(tx, a);
  eq(T(['studieren will', 'geworden ist', 'bestehe']).urteil, 'richtig', 'text: hepsi doğru');
  eq(T(['studieren will', 'geworden ist', 'bestehen werde']).urteil, 'richtig', 'text: alternatif');
  eq(T(['studieren will', 'geworden ist', 'bestehen']).urteil, 'fast', 'text: 2/3 doğru → fast');
  eq(T(['will studieren', 'ist geworden', 'bestehe']).urteil, 'falsch', 'text: 1/3 doğru → falsch');
  eq(T(['studieren will', 'geworden ist', 'bestehe']).antwort, 'studieren will ; geworden ist ; bestehe', 'text: antwort ; ile');
  eq(T(['studieren will', 'geworden ist', 'bestehe']).detay.join(','), 'richtig,richtig,richtig', 'text: detay');
  // eslestir: giris[i] = sol i'ye eşlenen sağ öğenin sırası
  eq(Gr.pruef(es, [0, 1, 2]).urteil, 'richtig', 'eslestir: hepsi doğru');
  eq(Gr.pruef(es, [1, 0, 2]).urteil, 'fast', 'eslestir: bir karışıklık → fast');
  eq(Gr.pruef(es, [1, 2, 0]).urteil, 'falsch', 'eslestir: üç yanlış → falsch');
  eq(Gr.pruef(es, [1, 0, 2]).antwort.split(' ;; ')[0], 'Ich gehe heute nicht zur Arbeit, weil → ich habe hohes Fieber.', 'eslestir: antwort eşler');
  eq(Gr.loesung(es).split(' ;; ')[2], 'Ich habe hohes Fieber, deshalb → gehe ich heute nicht zur Arbeit.', 'eslestir: loesung');
  // kategori: { öğe: grup sırası }
  const kDogru = {}; kt.gruplar.forEach((g, gi) => g.oge.forEach(o => { kDogru[o] = gi; }));
  eq(Gr.pruef(kt, kDogru).urteil, 'richtig', 'kategori: hepsi doğru');
  eq(Gr.pruef(kt, Object.assign({}, kDogru, { denn: 0 })).urteil, 'fast', 'kategori: bir yanlış → fast');
  eq(Gr.pruef(kt, Object.assign({}, kDogru, { denn: 0, deshalb: 0 })).urteil, 'falsch', 'kategori: iki yanlış → falsch');
  eq(Gr.pruef(kt, kDogru).antwort, kt.cevap[0], 'kategori: antwort cevapla aynı biçimde');
  // dinle: noktalama / büyük harf yok sayılır; tek harf yazım fast; dass/das gibi kısa kelime yanlış
  const dn2 = U(39), dn1 = U(37);
  eq(Gr.pruef(dn2, 'ich hoffe dass das wetter morgen schön ist').urteil, 'richtig', 'dinle: noktalama ve harf büyüklüğü');
  eq(Gr.pruef(dn2, 'Ich hoffe, das das Wetter morgen schön ist.').urteil, 'falsch', 'dinle: das/dass yanlış');
  eq(Gr.pruef(dn2, 'Ich hoffe, dass das Wetter morgen schon ist.').urteil, 'fast', 'dinle: umlaut fast');
  eq(Gr.pruef(dn1, 'Ich bin müde, weil ich gestern lange gearbetet habe').urteil, 'fast', 'dinle: uzun kelimede tek harf → fast');
  eq(Gr.pruef(dn1, 'Ich bin müde, weil ich gestern lange gearbeitet hab').urteil, 'falsch', 'dinle: hab/habe çekim → falsch');
  eq(Gr.pruef(dn1, 'Ich bin müde, weil ich habe gestern lange gearbeitet').urteil, 'falsch', 'dinle: kelime sırası → falsch');
  // sınıflandırma ve set seçimi
  eq(['ceviri', 'text', 'dinle', 'umform', 'ordnen', 'fehler'].every(t => Gr.yazarak({ tur: t })), true, 'yazarak türler');
  eq(['eslestir', 'kategori', 'wahl'].some(t => Gr.yazarak({ tur: t })) || Gr.yazarak({ tur: 'luecke', opt: ['a', 'b'] }), false, 'seçmeli türler');
  durum.gram = { konu: { 'weil-dass': { karte: null, teil: {}, gesehen: {}, lern: null, acildi: 1 } }, ghost: {} };
  let ihlal = 0, dinleVar = false;
  for (let i = 0; i < 300; i++) {
    const set = Gr.tekrarSeti('weil-dass'), turler = set.map(u => u.tur);
    if (new Set(turler).size !== turler.length || !set.some(Gr.yazarak) || turler.filter(t => t === 'eslestir' || t === 'kategori').length > 1) ihlal++;
    if (turler.includes('dinle')) dinleVar = true;
    const gs = Gr.girisSeti('weil-dass');
    if (gs.filter(u => u.tur === 'eslestir' || u.tur === 'kategori').length > 1) ihlal++;
  }
  eq(ihlal, 0, 'tekrar / giriş seti: farklı türler, en az biri yazarak, eslestir + kategori ≤ 1');
  eq(dinleVar, false, 'ses yoksa dinle seçilmez');
  // build denetimi (quellen/grammatik/pruef_grammatik.py): geçerli dosya + hatalı satırlar
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-')), dosya = path.join(dir, 'test-konu.txt');
  const KOPF = '@id test-konu\n@titel Test\n@tr Test\n@stufe B1\n@goethe 1 | Lesen\n@kurz kısa\n@erklaerung\nmetin\n@ende\n@teil a | A | bağlaç\n@teil b | B | bağlaç\n';
  const pruefe = satirlar => { fs.writeFileSync(dosya, KOPF + satirlar.join('\n') + '\n'); const r = cp.spawnSync('python3', ['-I', ROOT + '/quellen/grammatik/pruef_grammatik.py', dosya, ROOT], { encoding: 'utf8' }); return { kod: r.status, cikti: r.stdout + r.stderr }; };
  const iyi = [
    '@teil a',
    'ceviri | 2 | Hastayım. | Ich bin krank. | | - | açıklama | ',
    'text | 2 | Ich ___ (sein) krank, weil ich Fieber ___ (haben). | bin ; habe | | Hastayım. | açıklama | ',
    'eslestir | 1 | a ;; b ;; c | x ;; y ;; z | | - | açıklama | ',
    'kategori | 1 | Dativ oder Akkusativ? | Dativ: mit, bei ;; Akkusativ: für, ohne | | - | açıklama | ',
    'dinle | 2 | Ich bin krank. | Ich bin krank. | | Hastayım. | açıklama | ',
  ];
  let r0 = pruefe(iyi);
  eq(r0.kod, 0, 'denetim: geçerli dosya (' + r0.cikti.split('\n').filter(x => x.startsWith('HATA')).join(' / ') + ')');
  const hata = (satir, beklenen, m) => { const r = pruefe(['@teil b', satir]); eq(r.kod === 1 && r.cikti.includes(beklenen), true, 'denetim: ' + m + ' → ' + r.cikti.split('\n').filter(x => x.startsWith('HATA')).join(' / ')); };
  hata('text | 2 | Ich ___ krank. | bin ; habe | | - | a | ', "1 boşluk ama cevapta 2 parça", 'text boşluk ≠ parça');
  hata('eslestir | 1 | a ;; b ;; c | x ;; y | | - | a | ', 'sol 3, sağ 2', 'eslestir sol ≠ sağ');
  hata('eslestir | 1 | a ;; b | x ;; y | | - | a | ', '3–5 eş', 'eslestir 2 eş');
  hata('kategori | 1 | ? | Dativ: mit, bei, aus | | - | a | ', '2–3 grup', 'kategori tek grup');
  hata('kategori | 1 | ? | Dativ: mit, bei ;; Akkusativ: mit, für | | - | a | ', 'aynı öğe iki kez', 'kategori öğe tekrarı');
  hata('kategori | 1 | ? | Dativ: mit ;; Akkusativ: | | - | a | ', 'en az 1 öğesi', 'kategori boş grup');
  hata('ceviri | 2 | Hastayım. |  | | - | a | ', 'boş olamaz', 'ceviri boş cevap');
  hata('dinle | 2 | Ich bin krank. | Du bist krank. | | - | a | ', 'cevaplardan biri', 'dinle soru ≠ cevap');
  hata('ceviri | 2 | Hastayım. | Ich bin krank. | x | - | a | ', '5. alan boş', 'ceviri 5. alan dolu');
  const r1 = pruefe(['@teil yok', 'ceviri | 2 | Hastayım. | Ich bin krank. | | - | a | ']);
  eq(r1.kod === 1 && r1.cikti.includes('tanımsız'), true, 'denetim: tanımsız teil yeniden açılamaz');
  fs.rmSync(dir, { recursive: true, force: true });
}

// FSRS
let c = FSRS.review({}, 3, 0);
eq(Math.round(c.S * 100) / 100, 2.31, 'S0 good');
const c2 = FSRS.review(c, 3, c.due);
eq(c2.S > c.S * 2, true, 'S wächst');
const c3 = FSRS.review(c2, 1, c2.due);
eq(c3.S < c2.S, true, 'lapse');

console.log(fail ? `\n${fail} hata` : 'tüm testler geçti');
process.exit(fail ? 1 : 0);
