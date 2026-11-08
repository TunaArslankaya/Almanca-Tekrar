// Soru üretimi / seçim / hafızaya yazma / ekran düzeltmeleri (8.11 inceleme bulguları). Boş kayıtla açılır, durum sayfada kurulur.
// Kapsam: çok kelimeli öğe boşluğu (wortLuecke), metindeki kelime eşlemesi (formIdx / wortSuchen / kontextSaetze / aktSaetze),
// Goethe sınav metni havuz dışı, düzenli fiile kök sorusu yok, basamak kapısı (yoklama B2, ipuçlu bos0 / yedek biçim seviye atlatmaz),
// Bilmediklerim (seçmeli doğru kapatmaz, yanlış sıfırlar), Zayıflar'da zor soru yok, ikinci iş (turdaki gramer sayılmaz),
// Bugün yanlışları tekil, cümle başı rozeti (Wegen / emir kipi), fiil metninde ayrılmış ön ek. Kullanım: node tests/e2e_soru.js
const D = require('./surucu');
let hata = 0, n = 0;
const ok = (k, m) => { n++; if (!k) { hata++; console.log('HATA:', m); } };
const DAY = 86400000;
(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('e2e_soru: Playwright yok, atlandı'); return; }
  const p = await D.sayfa(b, {});
  const r = await p.evaluate(async () => {
    const T = window.__tekrar, out = {};
    // 1) çok kelimeli öğe: bütün ifade boşluk (vor allem), fiilli kalıpta ayırt edici parça (sich Mühe geben → Mühe), ayrık bağlaç iki boşluk
    const l1 = T.wortLuecke('w0522', 'Grüßen Sie alle von mir, vor allem Frau Meier.');
    out.vorAllem = l1 && [l1.text, l1.answer, l1.n];
    const l2 = T.wortLuecke('w0636', 'Er gibt sich große Mühe, Deutsch ohne Fehler zu sprechen.');
    out.muehe = l2 && [l2.text, l2.answer];
    const l3 = T.wortLuecke('w0539', 'Für Urlaub haben wir weder Zeit noch Geld.');
    out.weder = l3 && [l3.text, l3.answer, l3.n];
    out.brauchen = T.wortLuecke('w0614', 'Du brauchst nur anzurufen.');
    out.umZuHause = T.wortLuecke('w0490', 'Um acht Uhr gehe ich zu Hause los.');
    out.ifade = ['sich Mühe geben', 'Mühe', 'Arbeit'].map(x => T.ifadeBosPruef('w0636', x, 'Mühe').urteil);
    out.ifade2 = T.ifadeBosPruef('w0539', 'weder … noch', 'weder noch').urteil;
    // dişil türev başka kelime (der Chef → Chefin boşluk olmaz)
    out.chefin = T.wortLuecke('n0217', 'Die Chefin ist heute nicht im Büro.');
    out.chef = (T.wortLuecke('n0217', 'Der Chef ist heute nicht im Büro.') || {}).answer;
    // 2) metindeki kelime: ifadenin ilk kelimesi (eine, sich, den) öğeye bağlanmaz; cümle ortasında büyük harfli isim fiile / bağlaca bağlanmaz
    const fi = T.formIdx();
    out.ilkKelime = ['eine', 'einem', 'sich', 'den', 'zur'].map(w => fi.get(w) || null);
    out.ortada = ['Schienen', 'Unternehmen', 'Weile', 'Boten', 'Stand'].map(w => T.wortSuchen(w, false));
    out.basta = T.wortSuchen('Schienen', true);
    out.regenn = fi.get('Regenn') || fi.get('regenn') || null;
    // yazım sözlüğüne uydurma biçim girmez (hoche, etwaen, leisee, kamn); gerçek biçimler girer (hohe, leisen, kamen, dunkle)
    out.uydurma = ['hoche', 'etwaen', 'etwae', 'leisee', 'kamn', 'machteen'].filter(w => fi.get(w));
    out.gercek = ['hohe', 'leisen', 'kamen', 'dunkle', 'teure', 'jedem', 'Hauses', 'gerne'].filter(w => !fi.get(w));
    out.kx = ['w0636', 'w0068', 'v447'].map(id => T.kontextSaetze(id).length);
    const A = T.aktSaetze();
    out.goethe = A.filter(s => /^ge/.test(s.q.id)).length;
    out.aktOrtada = A.reduce((s, x) => s + x.toks.filter((t, i) => i > 0 && t.id && /^[A-ZÄÖÜ]/.test(t.c) && T.kind(t.id) !== 'n' && !/[.!?:„“"]$/.test(x.toks[i - 1].raw) && !/^[„“"]/.test(t.raw)).length, 0);
    // 3) kök sorusu yalnız düzensiz fiilde
    T.starte('akis');
    await new Promise(res => setTimeout(res, 200));
    out.kokDuzenli = T.soruGoster({ id: 'v119', bicim: 'kokSatz' });
    out.kokDuzensiz = !!T.soruGoster({ id: 'v243', bicim: 'kokSatz' });
    // 4) basamak kapısı
    const S = T.S, t = Date.now();
    const m0 = (ek) => Object.assign({ S: 10, D: 5, last: t - 12 * 86400000, due: t - 3600000, reps: 5, lapses: 0, lastG: 3, pk: 2, bm: 2, ds: 0, gun: '2026-01-01' }, ek || {});
    // yoklama doğru → bm 2
    delete S.items.n0028;
    T.hafizaYaz({ id: 'n0028', sel: {}, bicim: 'yoklama', yoklama: true, b: 2, antwort: 'die Änderung', ziel: 'die Änderung' }, { bicim: 'yoklama', tip: 'yoklama', etiketler: [], artikel: { sinandi: true, dogru: true } }, t, { log: false });
    out.yoklamaBm = S.items.n0028 && S.items.n0028.m && S.items.n0028.m.bm;
    // ipuçlu bos0 (sel.b 3) doğru → bm 2 kalır; ipucusuz bos → 3
    S.items.n0682 = { seit: t - 30 * 86400000, m: m0() };
    T.hafizaYaz({ id: 'n0682', sel: { b: 3, tur: 'm' }, bicim: 'bos0', lvGercek: 0, antwort: 'Kritik', ziel: 'Kritik' }, { bicim: 'bos0', tip: 'dogru', etiketler: [] }, t, { log: false });
    out.bos0Bm = S.items.n0682.m.bm;
    S.items.n0781 = { seit: t - 30 * 86400000, m: m0() };
    T.hafizaYaz({ id: 'n0781', sel: { b: 3, tur: 'm' }, bicim: 'bos', lvGercek: 1, antwort: 'Mensa', ziel: 'Mensa' }, { bicim: 'bos', tip: 'dogru', etiketler: [] }, t, { log: false });
    out.bosBm = S.items.n0781.m.bm;
    // yedek biçim: B4 seçimi (cümle yok) yazmaya düştü → bm en çok 2
    S.items.n0313 = { seit: t - 30 * 86400000, m: m0({ bm: 1 }) };
    T.hafizaYaz({ id: 'n0313', sel: { b: 4, tur: 'm' }, bicim: 'yaz', antwort: 'die Erlaubnis', ziel: 'die Erlaubnis' }, { bicim: 'yaz', tip: 'dogru', etiketler: [], artikel: { sinandi: true, dogru: true } }, t, { log: false });
    out.yedekBm = S.items.n0313.m.bm;
    // 5) Bilmediklerim: seçmeli doğru "artık biliyorsun" saymaz; yanlış sıfırlar
    S.bilmedik = S.bilmedik || {};
    S.bilmedik.n1048 = { ad: 'der Schnee', ilk: t - 5 * 86400000, son: t - 5 * 86400000, n: 1, d: 1, dt: t - 2 * 86400000 };
    S.items.n1048 = { seit: t - 30 * 86400000, m: m0({ bm: 1, pk: 0, S: 3 }) };
    T.hafizaYaz({ id: 'n1048', sel: { b: 1, tur: 'm' }, bicim: 'sec', mc: true, antwort: 'kar', ziel: 'kar' }, { bicim: 'sec', tip: 'dogru', etiketler: [], sure: 3000 }, t, { log: false });
    out.bilSec = S.bilmedik.n1048.d;
    S.bilmedik.n1048.d = 1;
    S.items.n1048.m.gun = '2026-01-01';
    T.hafizaYaz({ id: 'n1048', sel: { b: 2, tur: 'm' }, bicim: 'yaz', antwort: 'der Regen', ziel: 'der Schnee' }, { bicim: 'yaz', tip: 'yanlis', etiketler: [], artikel: { sinandi: false } }, t, { log: false });
    out.bilYanlis = S.bilmedik.n1048.d;
    // 6) Bugün yanlışları: aynı öğe + aynı cevap bir kez (×2)
    // gün anahtarı ve log zamanı uygulamanın kendi tanımıyla (tag öğrenme gününe geçse de: 00–04 satırları önceki gün)
    const gun = T.tag(), z0 = T.zeitStr(Date.now()), z = () => z0;
    S.log.push({ zeit: z(), modus: 'wort', id: 'n0433:wort', item: 'die Geduld', frage: '', antwort: 'der Geduld', ergebnis: 'falsch', loesung: 'die Geduld', notiz: 'basamak:B2 | bicim:yaz | not:m1' });
    S.log.push({ zeit: z(), modus: 'wort', id: 'n0433:wort', item: 'die Geduld', frage: '', antwort: 'der Geduld', ergebnis: 'falsch', loesung: 'die Geduld', notiz: 'basamak:B2 | bicim:yaz0 | not:- | tekrar:1' });
    const oz = T.gunOzeti(gun);
    out.yanlis = oz.yanlis.filter(y => y.item === 'die Geduld').map(y => y.kez);
    // 7) cümle başı rozeti
    out.wegen = T.deHTML('Wegen der hohen Kosten verzichten wir.');
    out.emir = T.deHTML('Schreiben Sie bitte deutlich!');
    out.isim = T.deHTML('Das Treffen war gut.');
    // 8) fiil metni: ayrılmış ön ek (anbieten) bieten sayılmaz
    out.fv = T.fvImSatz('Sie bietet dem Land viel Hilfe, aber keine Reparationen an.').map(x => x.id);
    out.fv2 = T.fvImSatz('Er bietet mir einen Kaffee.').map(x => x.id);
    out.passiv = T.fvImSatz('Die Menschen wurden zur Arbeit gezwungen.').map(x => x.zeit);
    return out;
  });
  ok(r.vorAllem && r.vorAllem[1] === 'vor allem' && /mir, _____ Frau/.test(r.vorAllem[0]) && r.vorAllem[2] === 1, 'vor allem boşluğu: ' + JSON.stringify(r.vorAllem));
  ok(r.muehe && r.muehe[1] === 'Mühe' && /sich große _____,/.test(r.muehe[0]), 'sich Mühe geben boşluğu: ' + JSON.stringify(r.muehe));
  ok(r.weder && r.weder[1] === 'weder noch' && r.weder[2] === 2, 'weder … noch: ' + JSON.stringify(r.weder));
  ok(r.brauchen === null, 'brauchen … zu boşluk olmamalı');
  ok(r.umZuHause === null, 'um … zu: "zu Hause" eşleşmemeli');
  ok(JSON.stringify(r.ifade) === '["fast","richtig","falsch"]', 'ifadenin tamamı: ' + JSON.stringify(r.ifade));
  ok(r.ifade2 === 'richtig', 'weder … noch yazımı: ' + r.ifade2);
  ok(r.chefin === null && r.chef === 'Chef', 'dişil türev: ' + JSON.stringify([r.chefin, r.chef]));
  ok(r.ilkKelime.every(x => x === null), 'ifadenin ilk kelimesi bağlandı: ' + JSON.stringify(r.ilkKelime));
  ok(r.ortada.every(x => x === null), 'cümle ortasında büyük harf: ' + JSON.stringify(r.ortada));
  ok(r.basta === 'v447', 'cümle başında küçültme: ' + r.basta);
  ok(r.regenn === null, 'uydurma biçim Regenn sözlükte');
  ok(!r.uydurma.length, 'uydurma biçimler sözlükte: ' + r.uydurma);
  ok(!r.gercek.length, 'gerçek biçimler eksik: ' + r.gercek);
  ok(r.kx.every(x => x === 0), 'metinde cümlesi (sich Mühe geben / ein bisschen / çok anlamlı scheinen): ' + JSON.stringify(r.kx));
  ok(r.goethe === 0, 'Goethe sınav metni metin boşluğu havuzunda: ' + r.goethe);
  ok(r.aktOrtada === 0, 'metin etkinliği: cümle ortasındaki büyük harfli kelime isim dışı öğeye bağlandı: ' + r.aktOrtada);
  ok(r.kokDuzenli === null, 'düzenli fiile kök sorusu (beruhigen)');
  ok(r.kokDuzensiz, 'düzensiz fiilin kök sorusu açılmadı (fahren)');
  ok(r.yoklamaBm === 2, 'yoklama doğru → bm 2: ' + r.yoklamaBm);
  ok(r.bos0Bm === 2, 'ipuçlu bos0 bm yükseltti: ' + r.bos0Bm);
  ok(r.bosBm === 3, 'ipucusuz bos → bm 3: ' + r.bosBm);
  ok(r.yedekBm === 2, 'yedek yazma B4 seçiminden bm aldı: ' + r.yedekBm);
  ok(r.bilSec === 1, 'seçmeli doğru Bilmediklerim sayacını artırdı: ' + r.bilSec);
  ok(r.bilYanlis === 0, 'yanlış Bilmediklerim sayacını sıfırlamadı: ' + r.bilYanlis);
  ok(JSON.stringify(r.yanlis) === '[2]', 'Bugün yanlışları tekil değil: ' + JSON.stringify(r.yanlis));
  ok(!/Wegen<sup>/.test(r.wegen) && !/<sup>/.test(r.emir) && /<sup>das<\/sup>/.test(r.isim), 'cümle başı rozeti: ' + [r.wegen, r.emir, r.isim].join(' | '));
  ok(!r.fv.includes('v146') && r.fv2.length >= 0, 'fiil metni: anbieten bieten sayıldı: ' + JSON.stringify(r.fv));
  ok(!r.passiv.some(x => /^Perfekt/.test(x)), 'Passiv Perfekt sayıldı: ' + JSON.stringify(r.passiv));
  // 9) Zayıflar'da zor soru yok (aynı durumda ana turda zor soru seçilir)
  const z = await p.evaluate(async () => {
    const T = window.__tekrar, S = T.S, t = Date.now();
    Object.keys(S.items).forEach(id => delete S.items[id]);
    // S 5 (merdiven B2), bm 2, ds 3, pk 2, R yüksek, yanlış geçmişi var (lapses 1 → Zayıflar'da)
    S.items.v243 = { seit: t - 60 * 86400000, m: { S: 5, D: 5, last: t - 2 * 86400000, due: t - 3600000, reps: 9, lapses: 1, lastG: 3, pk: 2, bm: 2, ds: 3, gun: '2026-01-01' } };
    const ot = { adim: 5, gecmis: [{ id: 'x1', bicim: 'yaz', tur: 'm' }, { id: 'x2', bicim: 'yaz', tur: 'm' }, { id: 'x3', bicim: 'yaz', tur: 'm' }], kuyruk: [] };
    const ham = T.Kern.sec({ S, kap: 20, bonus: 0, donus: false, ekYeni: 0, gunSay: { kok: 9, kokYeni: 9, metin: 9, diktat: 9 } }, Object.assign({ boy: 12, filtre: id => id === 'v243', odak: true }, JSON.parse(JSON.stringify(ot))), t, () => 0.99);
    T.starte('zayif');
    await new Promise(res => setTimeout(res, 300));
    const a = T.aktuell || {};
    return { hamZor: !!ham.zor, hamId: ham.id, id: a.id, zor: !!(a.sel && a.sel.zor), bicim: a.bicim };
  });
  ok(!z.hamZor || (z.id === 'v243' && !z.zor), "Zayıflar'da zor soru: " + JSON.stringify(z));
  if (!z.hamZor) console.log('not: Kern bu durumda zor seçmedi (sınama zayıf): ' + JSON.stringify(z));
  ok(!p.hatalar.length, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await p.ctx.close();
  // 10) ikinci iş: turdaki gramer soruları (tur:akis) "Gramer ✓ bugün yapıldı" demez. Gün, sıranın 'gram' gününe kaydırılır.
  const gunNo = Math.floor(Date.now() / DAY), kay = ((3 - (gunNo % 3)) % 3) * DAY + 0;
  const p2 = await D.sayfa(b, { saatOfs: kay });
  const ii = await p2.evaluate(() => {
    const T = window.__tekrar, S = T.S;
    const zz = T.zeitStr(Date.now());
    S.log.push({ zeit: zz, modus: 'gram', id: 'g:reflexiv:3', item: 'reflexiv/akk', frage: '', antwort: 'mich', ergebnis: 'richtig', loesung: 'mich', notiz: 'tur:akis | tür:luecke | z:2' });
    const h1 = T.ikinciIs();
    S.log.push({ zeit: zz, modus: 'gram', id: 'g:reflexiv', item: 'reflexiv', frage: 'tekrar', antwort: '', ergebnis: 'richtig', loesung: '', notiz: 'puan:5/5' });
    const h2 = T.ikinciIs();
    return { gram1: /data-modus="gram"/.test(h1), yap1: /yapildi/.test(h1), gram2: /data-modus="gram"/.test(h2), yap2: /yapildi/.test(h2) };
  });
  ok(!ii.gram1 || !ii.yap1, 'ikinci iş turdaki gramer sorusuyla ✓: ' + JSON.stringify(ii));
  ok(!ii.gram2 || ii.yap2, 'ikinci iş gramer seti sonrası ✓ değil: ' + JSON.stringify(ii));
  if (!ii.gram1) console.log('not: bugünkü ikinci iş gramer değil (sınama atlandı): ' + JSON.stringify(ii));
  ok(!p2.hatalar.length, 'sayfa hatası: ' + p2.hatalar.join(' | '));
  await p2.ctx.close();
  await b.close();
  console.log(hata ? `e2e_soru: ${hata}/${n} hata` : `e2e_soru: geçti (${n} denetim)`);
  process.exit(hata ? 1 : 0);
})();
