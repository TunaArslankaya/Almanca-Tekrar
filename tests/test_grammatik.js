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

// Tam cümle kontrolü G.cumleKontrol (sözleşme §3) — cümleler quellen/saetze.txt ve wort_saetze.txt'ten; sözlük (LEX) yukarıda kuruldu, uygulamadaki gibi
{
  const CK = G.cumleKontrol;
  let n = 0;
  // beklenen: urteil; olmalı: etiketler (hepsi bulunmalı); olmamalı: etiketler (hiçbiri bulunmamalı)
  const K = (giris, hedefler, urteil, olmali, olmamali, opts, m) => {
    n++;
    const r = CK(giris, hedefler, opts);
    const ad = `cümle: ${m || giris} → ${r.urteil} [${r.tags.join(', ')}] ${r.skor}`;
    eq(r.urteil, urteil, ad);
    (olmali || []).forEach(t => eq(r.tags.includes(t), true, ad + ' / etiket ' + t));
    (olmamali || []).forEach(t => eq(r.tags.includes(t), false, ad + ' / etiket olmamalı ' + t));
    return r;
  };
  const fark = r => r.diff.filter(x => x.t !== 'ok').map(x => x.t + ':' + x.w + '>' + x.d).join(' ');
  const H1 = 'Ich freue mich schon auf meinen nächsten Urlaub.';
  // 1–5 tam doğru, noktalama, büyük/küçük harf, ae/oe/ue/ss
  let r = K('Ich freue mich schon auf meinen nächsten Urlaub.', [H1], 'richtig', [], ['yazım']);
  eq(r.skor, 1, 'cümle: tam doğru skor 1'); eq(r.diff.every(x => x.t === 'ok'), true, 'cümle: tam doğru diff hep ok'); eq(r.enYakin, H1, 'cümle: enYakin');
  K('ich freue mich schon auf meinen nächsten urlaub', [H1], 'richtig', ['büyük/küçük harf']);
  K('Ich freue mich schon auf meinen naechsten Urlaub!', [H1], 'richtig', [], ['yazım', 'umlaut']);
  K('Ich habe gehört dass Herr Müller im Krankenhaus liegt', ['Ich habe gehört, dass Herr Müller im Krankenhaus liegt.'], 'richtig', [], [], null, 'virgülsüz yan cümle');
  K('„Die Strasse ist sehr schoen.“', ['Die Straße ist sehr schön.'], 'richtig', [], [], null, 'ss = ß, oe = ö, tırnak');
  // 6–7 tek hedef string, boş cevap
  K('Haben Sie meinen Brief bekommen', 'Haben Sie meinen Brief bekommen?', 'richtig', [], [], null, 'hedef string');
  r = K('', ['Haben Sie meinen Brief bekommen?'], 'falsch', ['boş']);
  eq(r.diff.length === 5 && r.diff.every(x => x.t === 'eksik'), true, 'cümle: boş cevap → hepsi eksik');
  // 8–9 alternatif hedef
  r = K('Biegen Sie an der nächsten Kreuzung links ab.', ['An der nächsten Kreuzung müssen Sie links abbiegen.', 'Biegen Sie an der nächsten Kreuzung links ab.'], 'richtig', [], [], { hedefKelime: 'abbiegen' }, 'alternatif hedef');
  eq(r.enYakin, 'Biegen Sie an der nächsten Kreuzung links ab.', 'cümle: enYakin alternatif');
  r = K('An der nächsten Kreuzung müssen Sie links abbigen.', ['An der nächsten Kreuzung müssen Sie links abbiegen.', 'Biegen Sie an der nächsten Kreuzung links ab.'], 'fast', ['yazım'], [], null, 'en yakın hedef seçilir');
  eq(r.enYakin, 'An der nächsten Kreuzung müssen Sie links abbiegen.', 'cümle: enYakin ilk hedef');
  // 10–13 yazım / umlaut
  r = K('Ist hier in der Nähe eine Apoteke?', ['Ist hier in der Nähe eine Apotheke?'], 'fast', ['yazım']);
  eq(fark(r), 'yazim:Apoteke>Apotheke', 'cümle: yazım diff');
  K('Die Frist fur die Anmeldung zum Deutschkurs ist abgelaufen.', ['Die Frist für die Anmeldung zum Deutschkurs ist abgelaufen.'], 'fast', ['umlaut'], ['edat']);
  K('Er liegt schon seit drei Wochen im Krankenhuas.', ['Er liegt schon seit drei Wochen im Krankenhaus.'], 'fast', ['yazım']);
  K('Er liegt schon seit drei Wochen im Hous.', ['Er liegt schon seit drei Wochen im Haus.'], 'falsch', ['yanlış kelime'], ['yazım'], null, 'kısa kelimede lev 1 yazım sayılmaz (Haus)');
  // 14–18 artikel / çekim
  r = K('Der Arzt hat ihn vor das Rauchen gewarnt.', ['Der Arzt hat ihn vor dem Rauchen gewarnt.'], 'fast', ['artikel/çekim']);
  eq(fark(r), 'yanlis:das>dem', 'cümle: artikel diff das > dem');
  K('Ich habe gestern mit meine Mutter telefoniert.', ['Ich habe gestern mit meiner Mutter telefoniert.'], 'fast', ['artikel/çekim']);
  K('Ich brauche einen neue Drucker für meinen Computer.', ['Ich brauche einen neuen Drucker für meinen Computer.'], 'fast', ['artikel/çekim'], [], null, 'sıfat eki');
  K('Mario fahre mit dem Auto zur Arbeit.', ['Mario fährt mit dem Auto zur Arbeit.'], 'fast', ['artikel/çekim'], [], null, 'fiil çekimi fahre/fährt');
  K('Mario fährt mit Auto zur Arbeit.', ['Mario fährt mit dem Auto zur Arbeit.'], 'fast', ['artikel/çekim'], ['eksik kelime'], null, 'artikel eksik');
  // 19–21 kaynaşmış edat
  r = K('Er liegt schon seit drei Wochen in dem Krankenhaus.', ['Er liegt schon seit drei Wochen im Krankenhaus.'], 'fast', ['kaynaştırma']);
  eq(fark(r), 'yazim:in dem>im', 'cümle: kaynaştırma tek diff öğesi');
  K('Mario fährt mit dem Auto zu der Arbeit.', ['Mario fährt mit dem Auto zur Arbeit.'], 'fast', ['kaynaştırma']);
  K('Wir trainieren einmal pro Woche in Sportverein.', ['Wir trainieren einmal pro Woche im Sportverein.'], 'fast', ['artikel/çekim'], ['edat'], null, 'im yerine in (artikel düştü)');
  // 22–24 yardımcı fiil
  r = K('Ich habe gegangen.', ['Ich bin gegangen.'], 'fast', ['yardımcı fiil']);
  eq(fark(r), 'yanlis:habe>bin', 'cümle: yardımcı fiil diff');
  K('Letztes Jahr habe ich in einen Sportverein eingetreten.', ['Letztes Jahr bin ich in einen Sportverein eingetreten.'], 'fast', ['yardımcı fiil']);
  K('Der Sturm ist viele Häuser zerstört.', ['Der Sturm hat viele Häuser zerstört.'], 'fast', ['yardımcı fiil']);
  // 25–29 fiil yeri (yan cümle sonu, V2)
  r = K('Ich habe gehört, dass Herr Müller liegt im Krankenhaus.', ['Ich habe gehört, dass Herr Müller im Krankenhaus liegt.'], 'fast', ['fiil yeri', 'kelime sırası']);
  eq(r.diff.some(x => x.t === 'yer' && x.w === 'liegt'), true, 'cümle: yer öğesi liegt');
  K('Ich bleibe zu Hause, weil ich bin krank.', ['Ich bleibe zu Hause, weil ich krank bin.'], 'fast', ['fiil yeri']);
  K('Letztes Jahr ich bin in einen Sportverein eingetreten.', ['Letztes Jahr bin ich in einen Sportverein eingetreten.'], 'fast', ['fiil yeri']);
  K('Morgen ich gehe ins Kino.', ['Morgen gehe ich ins Kino.'], 'fast', ['fiil yeri']);
  K('Wenn ich Zeit habe, ich komme.', ['Wenn ich Zeit habe, komme ich.'], 'fast', ['fiil yeri']);
  K('Er schon seit drei Wochen im Krankenhaus liegt.', ['Er liegt schon seit drei Wochen im Krankenhaus.'], 'fast', ['fiil yeri']);
  // 31–33 kelime sırası (fiil yeri değil: yanlış pozitif yok)
  K('Er liegt seit drei Wochen schon im Krankenhaus.', ['Er liegt schon seit drei Wochen im Krankenhaus.'], 'fast', ['kelime sırası'], ['fiil yeri']);
  K('Ich gehe ins Kino morgen.', ['Morgen gehe ich ins Kino.'], 'fast', ['kelime sırası'], ['fiil yeri']);
  K('Einen Film habe ich gestern gesehen.', ['Ich habe gestern einen Film gesehen.'], 'fast', ['kelime sırası'], ['fiil yeri']);
  // 34–38 geçerli başka diziliş (Vorfeld / yan cümle yer değiştirir) → doğru
  r = K('Ich gehe morgen ins Kino.', ['Morgen gehe ich ins Kino.'], 'richtig', [], [], null, 'Vorfeld: Ich gehe morgen');
  eq(r.enYakin, 'Ich gehe morgen ins Kino.', 'cümle: değişik diziliş enYakin');
  K('Gestern habe ich mit meiner Mutter telefoniert.', ['Ich habe gestern mit meiner Mutter telefoniert.'], 'richtig', [], [], null, 'Vorfeld: Gestern habe ich');
  K('Ich bin letztes Jahr in einen Sportverein eingetreten.', ['Letztes Jahr bin ich in einen Sportverein eingetreten.'], 'richtig', [], [], null, 'Vorfeld: Ich bin letztes Jahr');
  K('Am Wochenende fahre ich nach Berlin.', ['Ich fahre am Wochenende nach Berlin.'], 'richtig', [], [], null, 'Vorfeld: Am Wochenende');
  K('Weil ich krank bin, bleibe ich zu Hause.', ['Ich bleibe zu Hause, weil ich krank bin.'], 'richtig', [], [], null, 'yan cümle öne');
  K('Ich komme, wenn ich Zeit habe.', ['Wenn ich Zeit habe, komme ich.'], 'richtig', [], [], null, 'yan cümle arkaya');
  // 40–46 eksik / fazla / yanlış kelime
  r = K('Ich freue schon auf meinen nächsten Urlaub.', [H1], 'falsch', ['dönüşlü zamir'], [], { fiil: { base: 'freuen', p3: 'freut', refl: 'A' } }, 'dönüşlü zamir eksik');
  eq(fark(r), 'eksik:>mich', 'cümle: eksik diff');
  K('Der Unfall ereignete am frühen Morgen.', ['Der Unfall ereignete sich am frühen Morgen.'], 'falsch', ['dönüşlü zamir']);
  K('Ich freue mich schon für meinen nächsten Urlaub.', [H1], 'falsch', ['edat']);
  K('Ich habe die Betten noch gemacht.', ['Ich habe die Betten noch nicht gemacht.'], 'falsch', ['eksik kelime'], [], null, 'nicht eksik: anlam değişir');
  K('Ich brauche keinen neuen Drucker für meinen Computer.', ['Ich brauche einen neuen Drucker für meinen Computer.'], 'falsch', ['yanlış kelime'], ['artikel/çekim'], null, 'kein ↔ ein');
  K('Kannst du kurz meine Handtasche halten?', ['Kannst du mal kurz meine Handtasche halten?'], 'fast', ['eksik kelime'], [], null, 'uzun cümlede tek küçük kelime eksik');
  r = K('Ich brauche einen sehr neuen Drucker für meinen Computer.', ['Ich brauche einen neuen Drucker für meinen Computer.'], 'fast', ['fazla kelime']);
  eq(fark(r), 'fazla:sehr>', 'cümle: fazla diff');
  K('Ich brauche einen neuen Drucker.', ['Ich brauche einen neuen Drucker für meinen Computer.'], 'falsch', ['eksik kelime']);
  K('Hier ist Leben teuer.', ['Hier ist das Leben teuer.'], 'fast', ['artikel/çekim'], [], null, 'kısa cümlede artikel eksik');
  K('Hier ist das Essen teuer.', ['Hier ist das Leben teuer.'], 'falsch', ['yanlış kelime'], [], null, 'kısa cümlede tek yanlış kelime');
  K('Ich habe gestern mit meinem Vater telefoniert.', ['Ich habe gestern mit meiner Mutter telefoniert.'], 'falsch', ['yanlış kelime']);
  // 51–52 tamamen başka cümle
  r = K('Gibt es hier eine Apotheke?', ['Ist hier in der Nähe eine Apotheke?'], 'falsch', ['farklı cümle']);
  eq(r.skor < 0.5, true, 'cümle: başka cümle skor düşük');
  K('Das Wetter ist heute schön.', ['Ich habe gestern mit meiner Mutter telefoniert.'], 'falsch', ['farklı cümle']);
  // 53–58 hedef kelime
  K('Ich habe die Quittung verloren.', ['Ich habe die Quittung verloren.'], 'richtig', [], [], { hedefKelime: 'die Quittung' });
  K('Ich habe die Quitung verloren.', ['Ich habe die Quittung verloren.'], 'fast', ['yazım'], ['hedef kelime'], { hedefKelime: 'die Quittung' });
  K('Ich habe den Beleg verloren.', ['Ich habe die Quittung verloren.'], 'falsch', ['hedef kelime'], [], { hedefKelime: 'die Quittung' });
  K('Ich habe verloren.', ['Ich habe die Quittung verloren.'], 'falsch', ['hedef kelime'], [], { hedefKelime: 'Quittung' });
  K('Ich muss morgen früh aufwachen.', ['Ich muss morgen früh aufstehen.'], 'falsch', ['hedef kelime'], [], { hedefKelime: 'aufstehen' });
  K('Ich bin ins Kino gegangen.', ['Ich bin ins Kino gegangen.'], 'richtig', [], [], { hedefKelime: 'gehen' }, 'hedef lemma cümlede bulunmazsa ceza yok');
  K('Ich habe die Quittungen verloren.', ['Ich habe die Quittung verloren.'], 'fast', ['artikel/çekim'], ['hedef kelime'], { hedefKelime: 'Quittung' }, 'hedef kelimenin çekimi yanlış: fast');
  // 60 çok cümleli hedef
  K('Die Operation ist gut gelaufen. Wir können Sie nächste Woche entlassen aus dem Krankenhaus.', ['Die Operation ist gut gelaufen. Wir können Sie nächste Woche aus dem Krankenhaus entlassen.'], 'fast', ['kelime sırası']);
  // diff sırası öğrencinin sırasında, her öğe {t, w, d}
  r = CK('Ich freue mich schon für meinen nächsten Urlaub.', [H1]);
  eq(r.diff.map(x => x.w).filter(Boolean).join(' '), 'Ich freue mich schon für meinen nächsten Urlaub', 'cümle: diff öğrenci sırası');
  eq(r.diff.every(x => 'twd'.split('').every(k => k in x) && ['ok', 'yazim', 'yanlis', 'eksik', 'fazla', 'yer'].includes(x.t)), true, 'cümle: diff biçimi');
  eq(G.pruefen('Ich habe gegangen', 'Ich bin gegangen.').urteil, 'falsch', 'cümle: G.pruefen davranışı değişmedi');
  // performans: 20+ kelimelik cümle, 2 hedef, birkaç hata
  const uzun = 'Wir haben uns gestern Abend nach der Arbeit mit unseren Kollegen in einem kleinen Restaurant in der Stadt getroffen und lange gesprochen.';
  const t0 = Date.now();
  for (let i = 0; i < 100; i++) CK('wir haben gestern Abend uns nach der Arbeit mit unsere Kollegen in einem klein Restaurant in Stadt getroffen und lange gesprochen', [uzun, uzun.replace('gestern Abend', 'am Abend')]);
  const ms = (Date.now() - t0) / 100;
  eq(ms < 25, true, 'cümle: 20+ kelime < 25 ms (' + ms + ' ms; tipik 2–5, yük altında oynak)');
  eq(n >= 40, true, 'cümle: en az 40 vaka (' + n + ')');
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
    if (set.length !== 5 || new Set(turler.slice(0, 3)).size !== 3 || set.filter(Gr.yazarak).length < 2 || new Set(set.map(u => u.n)).size !== 5 || turler.filter(t => t === 'eslestir' || t === 'kategori').length > 1) ihlal++;
    if (turler.includes('dinle')) dinleVar = true;
  }
  eq(ihlal, 0, 'tekrar seti 5 (ilk üçü farklı tür, ≥ 2 yazarak), tekrarsız, eslestir + kategori ≤ 1');
  eq(dinleVar, false, 'ses yoksa dinle seçilmez');
  {   // her konuda tekrar 5; boylu boyuna (derin): hep doğru → her teil z1→z3 tamam, tekrar yok; hep yanlış → teil'e geri döner, havuz bitince biter
    const az = [], D = Gr._ic;
    Object.keys(Gr.GR).forEach(id => { durum.gram.konu[id] = durum.gram.konu[id] || { karte: null, teil: {}, gesehen: {}, lern: null, acildi: 1 };
      if (Gr.tekrarSeti(id).length !== 5) az.push(id + ':tekrar');
      const d = D.derinYeni(id, true); let u, k = 0; const gor = new Set();
      while ((u = D.derinSonraki(id, d)) && k < 400) { if (gor.has(u.n)) { az.push(id + ':yineleme'); break; } gor.add(u.n); D.derinIsle(id, d, u, 3); k++; }
      const ts = Object.values(d.teil);
      if (!ts.every(t => t.tamam) || k < ts.length * 2) az.push(id + ':derin ' + k);
      const d2 = D.derinYeni(id, true); let k2 = 0, ard = 0, onceki = null;
      while ((u = D.derinSonraki(id, d2)) && k2 < 2000) { if (onceki === u.teil && Object.values(d2.teil).filter(t => !t.tamam).length > 1) ard++; onceki = u.teil; D.derinIsle(id, d2, u, 1); k2++; }
      if (k2 !== Gr.GR[id].uebungen.filter(x => !x.aus && x.teil && x.tur !== 'dinle').length) az.push(id + ':derin-yanlis ' + k2);
    });
    eq(az.join(','), '', 'bütün konularda tekrar 5; boylu boyuna: hep doğru → bütün bölümler tamam, hep yanlış → bütün havuz, tekrar yok');
  }

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

// Gramer: B1 sprinti — açılış göçü, tanı testi, sprint sırası / kuralları, ana turda soru (S2 API; sahte DOM ile)
{
  const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
  global.window = global.window || {};
  window.G = G;
  if (!window.GRAMMATIK) eval(fs.readFileSync(ROOT + '/daten/grammatik.js', 'utf8'));
  eval(fs.readFileSync(ROOT + '/js/gramer.js', 'utf8'));
  const Gr = window.Gramer, GR = window.GRAMMATIK, DAY = 86400000;
  const gunStr = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  // sahte DOM: kart elemanı (yalnız gramer.js'in kullandığı kadar)
  const inp = v => ({ value: v, readOnly: false, classList: { add() {} } });
  const mkEl = () => { const e = { innerHTML: '', inputs: [], tam: null, sonuc: { innerHTML: '' },
    querySelector(s) { return s === '#g-sonuc' ? e.sonuc : s === '.g-tam' ? e.tam : s === '.g-inp' ? (e.inputs[0] || e.tam) : null; },
    querySelectorAll(s) { return s === '.g-inp' ? (e.inputs.length ? e.inputs : e.tam ? [e.tam] : []) : []; }, contains: () => true }; return e; };
  const B = (g, ds) => ({ dataset: Object.assign({ g }, ds || {}), closest() { return this; } });
  const ENTER = { key: 'Enter', preventDefault() {}, target: { tagName: 'DIV' } };
  const temiz = s => (s || '').replace(/[.,!?;:]+$/, '');
  // doğru cevabı ekrana "yaz" ve kontrol et (klick: Gr.klick ya da Gr.turKlick)
  function dogruCevap(elm, klick) {
    const s = Gr._ic.ses(), u = s.set[s.i], q = s.q;
    elm.inputs = []; elm.tam = null;
    if (u.tur === 'luecke') { elm.inputs = u.cevap[0].split(' ; ').map(inp); return klick({ target: B('kontrol') }); }
    if (u.tur === 'umform' || u.tur === 'ceviri') { elm.tam = inp(u.cevap[0]); return klick({ target: B('kontrol') }); }
    if (u.tur === 'ordnen') {
      // parçalar birbirinin başı olabilir (ich / ich habe): geri izlemeli eşleme
      const hedef0 = u.cevap[0].replace(/[.!?]+$/, '').replace(/,/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
      const ara = (hedef, secim) => { if (!hedef) return secim.length === q.parcalar.length ? secim : null;
        for (let k = 0; k < q.parcalar.length; k++) { const p = q.parcalar[k].replace(/,/g, '').toLowerCase(); if (secim.includes(k) || !(hedef === p || hedef.startsWith(p + ' '))) continue; const r = ara(hedef.slice(p.length).trim(), secim.concat(k)); if (r) return r; } return null; };
      q.secim = ara(hedef0, []) || []; return klick({ target: B('kontrol') });
    }
    if (u.tur === 'fehler') {
      if (!u.hata || u.hata === '-') return klick({ target: B('hata-yok') });
      const toks = u.soru.split(/(\s+)/), hw = u.hata.split(/\s+/).map(temiz), i = toks.findIndex(t => /\S/.test(t) && hw.includes(temiz(t)));
      klick({ target: B('tok', { i: String(i) }) });
      if (Gr._ic.ses().q.adim === 2) { elm.tam = inp(u.cevap[0]); klick({ target: B('kontrol') }); }
    }
  }
  let saat = new Date(2026, 9, 28, 10).getTime();
  const t0 = saat, logs = [], later = [], hm = {};
  const kartEl = mkEl();
  const D = { sprint: { hedef: '2026-11-09', son_yeni: '2026-11-05', acik: true }, gram: { konu: {
    'tuerkisch-fallen': { karte: null, teil: {}, gesehen: {}, lern: null, acildi: saat - 10 * DAY },
    perfekt: { karte: null, teil: {}, gesehen: {}, lern: null, acildi: saat - 3600000 },
    adjektiv: { karte: { reps: 1, lapses: 0, S: 2.3, D: 2.1, last: saat - 10 * DAY, due: saat - 9 * DAY, lastG: 3 }, teil: {}, gesehen: {}, lern: null, acildi: saat - 10 * DAY } }, ghost: {} } };
  Gr.init({ S: () => D, G, FSRS, now: () => saat, tag: gunStr, ret: () => 0.85, soruSayisi: () => 0, logEintrag: x => logs.push(x), save() {}, heuteM: m => (hm[m] = hm[m] || { n: 0 }),
    xpEkle() {}, sayac() {}, toast() {}, esc: s => String(s), deHTML: s => String(s), kart: () => kartEl, durum() {}, later: f => later.push(f), fx() {}, odakla: () => false, sprich() {} });
  const runLater = () => { while (later.length) later.shift()(); };
  // göç: kartsız, bir günden eski açılış kapanır (vadeli değil); bugün açılmış kartsız konu açık kalır ama vadeli değil
  eq(Gr.acik('tuerkisch-fallen') || Gr.vadeli('tuerkisch-fallen'), false, 'göç: tuerkisch-fallen kapandı, vadeli değil');
  eq(D.gram.konu['tuerkisch-fallen'].yarim, 1, 'göç: yarım işareti');
  eq(Gr.acik('perfekt') && !Gr.vadeli('perfekt'), true, 'kartsız bugünkü açılış: açık ama vadeli değil');
  eq(Gr.sprintDurum().vadeli.join(','), 'adjektiv', 'sprintDurum.vadeli yalnız kartlı vadeli konu');
  eq(Gr._ic.konuDurum('tuerkisch-fallen'), 'denenmedi', 'göçten sonra denenmedi');
  D.gram.konu.perfekt.acildi = 0;
  // sıra (S6)
  const sd0 = Gr.sprintDurum();
  eq(sd0.konular.slice(0, 4).map(k => k.id).join(','), 'verbstellung,satzklammer-tekamolo,nebensatz-satzbau,weil-dass', 'sprint sırası başı');
  eq(sd0.konular.length, Object.keys(GR).length, 'sprint sırası: bütün konular');
  eq(sd0.konular.every((k, i) => k.oncelik === i + 1 && k.ad && ['denenmedi', 'zayif', 'ogreniliyor', 'biliyor'].includes(k.durum)), true, 'konular: oncelik / ad / durum');
  const sira = Gr._ic.sprintSira(), sp = Gr.SPRINT_SIRA.filter(id => GR[id]);
  eq(sira.slice(0, sp.length).join(','), sp.join(','), 'yalnız var olan sprint konuları, sabit sırada');
  eq(sd0.tani.bitti === false && sd0.tani.yapilan === 0 && sd0.tani.toplam >= 40, true, 'tanı başlamadı');
  eq(sd0.bugunYeni, null, 'tanı yokken yeni konu yok');
  eq(sd0.bugunYapildi, false, 'blok yapılmadı');
  // tanı sorusu: yazarak, seçeneksiz, z2–3
  const q1 = Gr._ic.taniSoru();
  eq(q1.konu === 'verbstellung' && q1.sira === 1 && q1.u.z === 2 && ['luecke', 'umform', 'ceviri', 'ordnen'].includes(q1.u.tur) && !q1.u.opt, true, 'tanı: ilk soru z2 yazarak');
  // tanı oturumu (sahte DOM): verbstellung ikisi doğru → biliyor; satzklammer bilmiyorum → zayif; nebensatz doğru + bilmiyorum → zayif; kalanlar bilmiyorum
  Gr.blokBaslat();
  eq(Gr._ic.ses().ekran === 'tani-giris' && kartEl.innerHTML.includes('Gramer testi'), true, 'blok: tanı bitmedi → test girişi');
  Gr.klick({ target: B('tani-basla') });
  let n = 0, tusEngel = true;
  while (Gr._ic.ses() && Gr._ic.ses().ekran === 'ueb' && n < 60) {
    const s = Gr._ic.ses(), id = s.id;
    const dogru = id === 'verbstellung' || (id === 'nebensatz-satzbau' && s.taniSira === 1);
    if (dogru) dogruCevap(kartEl, Gr.klick); else Gr.klick({ target: B('bilmiyorum') });
    eq(Gr._ic.ses().q.done, true, 'tanı: cevaplandı ' + id + ' ' + s.set[0].tur);
    if (Gr.tus({ key: '3', target: { tagName: 'DIV' } })) tusEngel = false;
    Gr.tus(ENTER); n++;
  }
  eq(tusEngel, true, 'tanı: 1/2/3 ile itiraz yok');
  eq(Gr._ic.ses().ekran, 'tani-son', 'tanı: oturum sonu ekranı');
  eq(n >= 25 && n <= 26, true, 'tanı: oturum ~25 madde (' + n + ')');
  const tl = logs.filter(x => /^g:[a-z0-9-]+:tani:\d+$/.test(x.id));
  eq(tl.length, n, 'tanı: madde başına log g:<konu>:tani:<n>');
  eq(tl[0].notiz.startsWith('tanı:1 | tür:') && tl[1].notiz.startsWith('tanı:2 | '), true, 'tanı: notiz tanı:<sıra> önde');
  eq(tl.filter(x => x.id.startsWith('g:verbstellung:')).every(x => x.ergebnis === 'richtig'), true, 'tanı: doğru cevap richtig (' + tl.filter(x => x.id.startsWith('g:verbstellung:')).map(x => x.ergebnis + '/' + x.notiz).join(' ; ') + ')');
  eq(tl.find(x => x.id.startsWith('g:satzklammer-tekamolo:')).notiz.includes('bilmiyorum'), true, 'tanı: bilmiyorum loglandı');
  const son = logs.filter(x => x.id === 'g:tani').pop();
  eq(!!son && son.ergebnis === 'ara' && /^puan:\d+\/\d+ \| konu:\d+\/\d+ \| biliyor:verbstellung \| zayif:satzklammer-tekamolo,nebensatz-satzbau,/.test(son.notiz), true, 'tanı: oturum sonu g:tani (' + (son && son.notiz) + ')');
  const vb = D.gram.konu.verbstellung;
  eq(Gr.acik('verbstellung') && vb.karte.S <= 5 && vb.karte.due - saat >= 4 * DAY && vb.karte.due - saat <= 5 * DAY && !Gr.vadeli('verbstellung'), true, 'biliyor: açıldı, kısa vade (4–5 gün, S ≤ 5)');
  eq(Gr._ic.konuDurum('verbstellung'), 'biliyor', 'biliyor durumu');
  eq(Gr.acik('satzklammer-tekamolo'), false, 'zayif: açılmadı');
  eq(Gr._ic.konuDurum('satzklammer-tekamolo'), 'zayif', 'zayif durumu');
  eq(Object.keys(D.gram.ghost).some(k => k.startsWith('satzklammer-tekamolo:') || k.startsWith('nebensatz-satzbau:')), false, 'kapalı konuya hayalet açılmaz (açılınca)');
  eq(D.gram.tani.konu['nebensatz-satzbau'].yanlis.length, 1, 'zayif: yanlış teil kaydı');
  eq(Object.keys(D.gram.ghost).some(k => k.startsWith('adjektiv:')) || !tl.some(x => x.id.startsWith('g:adjektiv:')), true, 'açık konunun testte yanlış teil\'i hayalet');
  const sd1 = Gr.sprintDurum();
  eq(sd1.bugunYapildi && sd1.tani.yapilan > 0 && !sd1.tani.bitti, true, 'tanı oturumu bitti → bugunYapildi');
  eq(sd1.bugunYeni, 'satzklammer-tekamolo', 'tanı sürerken: sırada ilk zayıf konu');
  // tanının kalanı (DOM'suz): hepsi yanlış
  let guv = 0; for (let q; (q = Gr._ic.taniSoru()) && guv < 200; guv++) Gr._ic.taniCevap(q.konu, q.u, 'falsch', false, saat);
  eq(Gr._ic.taniDurum().bitti, true, 'tanı bitti');
  // günün bloğu: vadeli yok → bugünün yeni konusu (tanıtım + giriş)
  D.gram.konu.adjektiv.karte.due = saat + 3 * DAY;
  Gr.blokBaslat();
  eq(Gr._ic.ses().ekran === 'tanit' && Gr._ic.ses().id === 'satzklammer-tekamolo', true, 'blok: yeni konu tanıtımı');
  eq(logs.some(x => x.id === 'g:satzklammer-tekamolo' && x.ergebnis === 'neu'), true, 'blok: tanıtım logu');
  eq(Gr.sprintDurum().bugunYeni, 'satzklammer-tekamolo', 'bugunYeni: bugün açılan');
  eq(Gr._ic.ekYeni(), 'nebensatz-satzbau', 'isteğe bağlı +1: sıradaki zayıf');
  Gr._ic.yeniAc('nebensatz-satzbau');
  eq(Gr._ic.ekYeni() === null && Gr._ic.bugunAcilan().length === 2, true, 'sprint: günde en çok 2');
  eq(Gr._ic.bugunAcilan().includes('verbstellung'), false, 'testten açılan bugün sayılmaz');
  // son_yeni / hedef
  const s0 = saat;
  saat = new Date(2026, 10, 6, 10).getTime(); eq(Gr.sprintDurum().bugunYeni, null, 'son_yeni sonrası yeni konu yok');
  saat = new Date(2026, 10, 10, 10).getTime(); eq(Gr.sprintDurum().bugunYeni !== null, true, 'sprint bitti: normal kural');
  saat = s0;
  // sprint vadesi: hedefe kalan sürenin ~%40'ı
  eq(Gr._ic.sprintVade({ due: saat + 30 * DAY }, saat).due, saat + 5 * DAY, 'sprintVade: 12 gün kala ≤ 5 gün');
  D.sprint.acik = false; eq(Gr._ic.sprintVade({ due: saat + 30 * DAY }, saat).due, saat + 30 * DAY, 'sprint kapalı: sınır yok'); D.sprint.acik = true;
  // ana turda soru (S2): 5 gün sonra verbstellung ve adjektiv vadeli
  saat = t0 + 5 * DAY + 3600000;
  const kartOnce = JSON.stringify([D.gram.konu.verbstellung.karte, D.gram.konu.adjektiv.karte]);
  const ts1 = Gr.turSorusu(saat, []);
  eq(!!ts1 && ['verbstellung', 'adjektiv'].includes(ts1.konu) && ['luecke', 'umform', 'ceviri', 'ordnen', 'fehler'].includes(ts1.tur) && !GR[ts1.konu].uebungen.find(u => u.n === ts1.n).opt, true, 'turSorusu: vadeli konudan yazarak soru');
  eq(Gr.turSorusu(saat, []), ts1, 'turSorusu: aynı soru (önbellek)');
  const ts2 = Gr.turSorusu(saat, [ts1.konu]);
  eq(!!ts2 && ts2.konu !== ts1.konu, true, 'turSorusu: haric konu atlanır');
  eq(Gr.turSorusu(saat, ['verbstellung', 'adjektiv']), null, 'turSorusu: aday yok → null');
  eq(Gr.turSorusu(t0, []), null, 'turSorusu: vadeli yokken null');
  // turRender: gramer bölümündeki oturum korunur; doğru → bitti richtig, log tur:akis, konu kartı değişmez
  const bolumOnce = Gr._ic.ses(), turEl = mkEl(), sonuclar = [];
  eq(Gr.turKlick({ target: B('kontrol') }), false, 'turKlick: tur yokken false');
  eq(Gr.turRender(turEl, ts1, r => sonuclar.push(r)), true, 'turRender çizdi');
  eq(turEl.innerHTML.length > 0 && kartEl.innerHTML.includes('satzklammer') === kartEl.innerHTML.includes('satzklammer'), true, 'turRender verilen elemana');
  const turU = Gr._ic.ses().set[0], teilOnce = ((D.gram.konu[ts1.konu].teil[turU.teil] || {}).d || 0);
  dogruCevap(turEl, Gr.turKlick); runLater();
  eq(sonuclar.length === 1 && sonuclar[0].urteil === 'richtig', true, 'tur: doğru → bitti richtig (' + JSON.stringify(sonuclar) + ')');
  const tlog = logs[logs.length - 1];
  eq(tlog.modus === 'gram' && tlog.id === `g:${ts1.konu}:${ts1.n}` && tlog.notiz.startsWith('tur:akis | tür:'), true, 'tur: log g:<konu>:<n>, notiz tur:akis');
  eq(JSON.stringify([D.gram.konu.verbstellung.karte, D.gram.konu.adjektiv.karte]), kartOnce, 'tur: konu kartı değişmez');
  eq(D.gram.konu[ts1.konu].teil[turU.teil].d, teilOnce + 1, 'tur: teil istatistiği');
  eq(Gr._ic.ses(), bolumOnce, 'tur: bölüm oturumu geri geldi');
  eq(Gr.turKlick({ target: B('kontrol') }) || Gr.turTus(ENTER), false, 'tur bitti: olay tüketilmez');
  // yanlış → hayalet, bitti falsch
  const ts3 = Gr.turSorusu(saat, []);
  Gr.turRender(turEl, ts3, r => sonuclar.push(r));
  const u3 = Gr._ic.ses().set[0];
  eq(Gr.turKlick({ target: B('bilmiyorum') }), true, 'turKlick: bilmiyorum tüketildi');
  eq(Gr.turTus(ENTER), true, 'turTus: Enter (Devam) tüketildi');
  eq(sonuclar.length === 2 && sonuclar[1].urteil === 'falsch', true, 'tur: bilmiyorum → falsch');
  eq(!!D.gram.ghost[ts3.konu + ':' + u3.teil], true, 'tur: yanlış teil hayalet');
  eq(logs[logs.length - 1].notiz.includes('bilmiyorum'), true, 'tur: bilmiyorum loglandı');
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
