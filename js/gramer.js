// Gramer bölümü: konu başına tek FSRS kartı, alt kural (teil) istatistiği, hayalet tekrarı (yanlışın kısa süreli dönüşü), karışık tekrar.
// İçerik: quellen/grammatik/<id>.txt → daten/grammatik.js (biçim ve kurallar: quellen/grammatik/FORMAT.md).
// Uygulamaya bağlantı: app.js `Gramer.init(api)` çağırır; bölüm ekranı `Gramer.render()`, tıklamalar `[data-g]` ile `Gramer.klick(e)`.
// Durum: S.gram = { konu: { id: { karte, teil: {kod: {d, y, son}}, gesehen: {n: ts}, lern, acildi } }, ghost: { 'id:teil': {adim, due, dogru} } }
(function (root) {
  'use strict';
  const GR = root.GRAMMATIK || {};
  let api = null, S = null;
  const DAY = 86400000;
  const TUR_AD = { luecke: 'boşluk', wahl: 'seçmeli', ordnen: 'cümle diz', fehler: 'hatayı bul', umform: 'dönüştür', ceviri: 'çeviri', text: 'metin', eslestir: 'eşleştir', kategori: 'grupla', dinle: 'dinle-yaz' };
  // eslestir / kategori seçmeli sayılır; bir sette bunlardan en çok 1
  const SECMELI_EK = new Set(['eslestir', 'kategori']);
  const UMFORM_TR = [[/^Imperativ \((du|ihr|Sie)\)$/, (h, m) => `emir kipine çevir (${m[1]})`], [/^Genitiv$/i, () => 'Genitiv ile yaz'], [/^Plural$/i, () => 'çoğul yap'],
    [/^Komparativ$/i, () => 'Komparativ yap (-er / als)'], [/^Superlativ$/i, () => 'Superlativ yap (am …sten)'], [/^Partizip$/i, () => 'Partizip (sıfat-fiil) ile yaz'], [/^Adjektiv$/i, () => 'sıfatla yaz'],
    [/^(weil|dass|obwohl|wenn|als|damit|ob|nachdem|bevor|während|seit|bis|so dass|falls|trotzdem|deshalb|denn)$/i, h => `„${h}“ ile birleştir`],
    [/^um … zu$|^um \.\.\. zu$/i, () => '„um … zu“ ile birleştir'], [/^Passiv$/i, () => 'Passiv yap'], [/^Perfekt$/i, () => 'Perfekt yap'], [/^Präteritum$/i, () => 'Präteritum yap'],
    [/^Plusquamperfekt$/i, () => 'Plusquamperfekt yap'], [/^Futur( I)?$/i, () => 'Futur I yap'], [/^indirekt$/i, () => 'dolaylı soru yap (Können Sie mir sagen, …?)'],
    [/^Relativsatz$/i, () => 'ilgi cümlesiyle tek cümle yap'], [/^Konjunktiv II$/i, () => 'kibar / dilek cümlesi yap (Konjunktiv II)'], [/^Nebensatz$/i, () => 'yan cümle yap'],
    [/^verneinen$/i, () => 'olumsuz yap (nicht / kein)'], [/^(kein|nicht) … sondern$/i, () => '„nicht/kein …, sondern …“ ile düzelt'],
    [/^je … desto$/i, () => '„je …, desto …“ ile tek cümle yap'], [/^zwar … aber$/i, () => '„zwar …, aber …“ ile birleştir'],
    [/^(danach|dann|deshalb|trotzdem|vorher|außerdem|sonst)$/i, h => `„${h}“ ile ikinci cümleyi bağla`],
    [/^(Wegen|Trotz|Während) /i, h => `„${h.replace(/ …$/, '')}“ ile başla (Genitiv)`],
    [/^(.+?) …$/, h => `„${h.replace(/ …$/, '')}“ ile başlayarak yeniden kur`]];
  const umformYonerge = hedef => { for (const [re, f] of UMFORM_TR) { const m = hedef.match(re); if (m) return f(hedef, m); } // Türkçe yazılmış yönerge (ile yaz, kullan, yap, …) olduğu gibi; yalnız Almanca kalıp kalan hedef "… ile yeniden yaz"
    if (/[çğıöşü]|\b(ile|yaz|kullan|yap|etmeden|yerine|cümle)\b/i.test(hedef)) return hedef.charAt(0).toUpperCase() + hedef.slice(1);
    return `„${hedef}“ ile yeniden yaz`; };

  // ---------- durum ----------
  // S her erişimde app'ten tazelenir (GitHub birleştirmesi S'yi değiştirir; Bugün ekranı sprintDurum'u yenile'den önce okuyabilir)
  const st = () => {
    if (api && api.S) { const s = api.S(); if (s && s !== S) { S = s; gocGerek = true; } }
    const g = S.gram || (S.gram = { konu: {}, ghost: {} });
    if (gocGerek) { gocGerek = false; goc(g); }
    return g;
  };
  let gocGerek = false;
  // açılış göçü: kartı olmayan, bir günden eski açılış (tanıtım okunmuş, giriş seti yapılmamış: tuerkisch-fallen 18.10) kapanır;
  // vadeli sayılmaz, yeniden "yeni konu" olur (eskiden kartsız açık konu hep vadeliydi: ikinci iş her gün "Gramer tekrarı")
  function goc(g) { const t = now(); Object.values(g.konu || {}).forEach(k => { if (k && k.acildi && !k.karte && t - k.acildi > DAY) { k.acildi = 0; k.yarim = (k.yarim || 0) + 1; } }); }
  const konuSt = id => { const g = st(); return g.konu[id] || (g.konu[id] = { karte: null, teil: {}, gesehen: {}, lern: null, acildi: 0 }); };
  const now = () => api.now();
  const gun = (t = now()) => { if (api.tag) return api.tag(t); const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const acik = id => !!st().konu[id] && !!st().konu[id].acildi;
  // vadeli: açık VE kartlı VE vadesi gelmiş (kartsız konu vadeli değil; giriş seti bekliyor)
  const vadeliT = (id, t) => { const k = st().konu[id]; return !!(k && k.acildi && k.karte && k.karte.due <= t); };
  const vadeli = id => vadeliT(id, now());
  const kararlilik = id => { const k = st().konu[id]; return k && k.karte && k.karte.S ? k.karte.S : 0; };
  const aktifKapitel = () => (api.aktifKapitel ? api.aktifKapitel() : null);   // ör. "K9"
  // açılış sırası: aktif Kapitel → goethe 3 → goethe 2 → diğer; @voraus açık olmalı
  function acilabilir() {
    const ids = Object.keys(GR).filter(id => !acik(id));
    const kap = aktifKapitel();
    const puan = id => { const k = GR[id].kopf; return (kap && (k.kapitel || '').includes(kap) ? 100 : 0) + (k.goethe.stufe || 1) * 10 - (k.voraus || []).filter(v => !acik(v)).length * 50; };
    return ids.filter(id => (GR[id].kopf.voraus || []).every(v => acik(v) || !GR[v])).sort((a, b) => puan(b) - puan(a));
  }
  const buHafta = () => Object.values(st().konu).filter(k => k.acildi && k.kaynak !== 'tani' && now() - k.acildi < 7 * DAY).length;

  // ---------- B1 sprinti (28.10 → 9.11): tanı testi, sprint sırası, günün bloğu ----------
  // S.sprint = { hedef: '2026-11-09', son_yeni: '2026-11-05', acik: true } (P2 kurar). Sprintte: günde 1 yeni konu (+1 isteğe bağlı),
  // haftada 2 sınırı yok, son_yeni'den sonra yeni konu yok; konu vadesi hedefe kalan sürenin ~%40'ını aşmaz.
  const SPRINT_SIRA = ['verbstellung', 'satzklammer-tekamolo', 'nebensatz-satzbau', 'weil-dass', 'negation', 'zweiteilig', 'konnektoren-deshalb-trotzdem',
    'nominal-verbal', 'vergleich', 'es-korrelat', 'relativ', 'adjektiv', 'praep-verben', 'praep-nomen-adj', 'zu-infinitiv', 'damit-um-zu', 'passiv',
    'konjunktiv2', 'genitiv', 'n-deklination', 'partizip-adj', 'perfekt', 'praeteritum', 'reflexiv', 'wortbildung'];
  const TANI_OTURUM = 25;   // tanı oturumu ~25 madde (yarım konu bitirilir)
  const sprint = () => { st(); return (S && S.sprint) || null; };
  const sprintAktif = (t = now()) => { const sp = sprint(); return !!(sp && sp.acik !== false && sp.hedef && gun(t) < sp.hedef); };
  const sprintYeniVar = (t = now()) => sprintAktif(t) && (!sprint().son_yeni || gun(t) <= sprint().son_yeni);
  const kalanGun = t => Math.max(0, Math.round((new Date(sprint().hedef + 'T12:00:00') - new Date(gun(t) + 'T12:00:00')) / DAY));
  // sprintte vade sınırı: en çok max(2, %40 × kalan gün) (aralık hedefe kalan sürenin %20–40'ı)
  const sprintVade = (karte, t) => { if (karte && karte.due && sprintAktif(t)) karte.due = Math.min(karte.due, t + Math.max(2, Math.round(0.4 * kalanGun(t))) * DAY); return karte; };
  // sıra: SPRINT_SIRA (yalnız var olan konular) → kalanlar Goethe önemine göre
  const sprintSira = () => { const ic = SPRINT_SIRA.filter(id => GR[id]); return ic.concat(Object.keys(GR).filter(id => !ic.includes(id)).sort((a, b) => (GR[b].kopf.goethe.stufe || 1) - (GR[a].kopf.goethe.stufe || 1))); };
  // ---- tanı testi ----
  // S.gram.tani = { konu: { id: { a: [{ n, teil, u, ip }], s: 'biliyor'|'zayif'|null, t, yanlis: [teil] } }, oturum }
  // konu başına uyarlamalı: 1 yazarak alıştırma (z2, seçeneksiz); doğruysa 2. (z3, başka teil). İkisi de tam doğru (ipucusuz) → biliyor, değilse zayif.
  const taniSt = () => { const g = st(); return g.tani || (g.tani = { konu: {}, oturum: 0 }); };
  const taniUygun = u => (u.z === 2 || u.z === 3) && ((u.tur === 'luecke' && !u.opt) || u.tur === 'umform' || u.tur === 'ceviri' || u.tur === 'ordnen');
  const taniHavuz = id => uebungen(id).filter(taniUygun);
  const taniKonular = () => sprintSira().filter(id => taniHavuz(id).length);
  const taniSonuc = id => { const k = taniSt().konu[id]; return (k && k.s) || null; };
  const taniDurum = () => { const ks = taniKonular(), yap = ks.filter(taniSonuc).length; return { bitti: yap >= ks.length, yapilan: yap, toplam: ks.length }; };
  // sıradaki tanı sorusu: yarım konu (ilk doğru, ikincisi bekliyor) önce, yoksa sırada ilk denenmemiş konu
  function taniSoru() {
    const T = taniSt();
    const id = Object.keys(T.konu).find(x => GR[x] && !T.konu[x].s && (T.konu[x].a || []).length) || taniKonular().find(x => !taniSonuc(x));
    if (!id) return null;
    const onceki = (T.konu[id] || {}).a || [], havuz = taniHavuz(id), teils = new Set(onceki.map(x => x.teil)), nler = new Set(onceki.map(x => x.n));
    const z = onceki.length ? 3 : 2;
    let aday = havuz.filter(u => !teils.has(u.teil) && !nler.has(u.n) && u.z === z);
    if (!aday.length) aday = havuz.filter(u => !teils.has(u.teil) && !nler.has(u.n));
    if (!aday.length) aday = havuz.filter(u => !nler.has(u.n));
    if (!aday.length) { T.konu[id].s = onceki.every(x => x.u === 'richtig' && !x.ip) ? 'biliyor' : 'zayif'; return taniSoru(); }
    return { konu: id, u: secUebung(id, aday, new Set()), sira: onceki.length + 1 };
  }
  // tanı cevabını işle; konu sonuçlandıysa 'biliyor' | 'zayif' döner (yoksa null)
  function taniCevap(id, u, urteil, ipucu, t = now()) {
    const T = taniSt(), k = T.konu[id] || (T.konu[id] = { a: [], s: null });
    k.a.push({ n: u.n, teil: u.teil, u: urteil, ip: !!ipucu });
    const tam = urteil === 'richtig' && !ipucu;
    if (!tam) k.yanlis = [...new Set((k.yanlis || []).concat(u.teil))];
    let son = !tam || k.a.length >= 2;
    if (!son && !taniHavuz(id).some(x => !k.a.some(y => y.n === x.n))) son = true;
    if (!son) return null;
    k.s = tam && k.a.every(x => x.u === 'richtig' && !x.ip) ? 'biliyor' : 'zayif'; k.t = t;
    const ks = konuSt(id);
    if (k.s === 'biliyor') taniAc(id, t);
    else if (ks.acildi && ks.karte) ks.karte.due = Math.min(ks.karte.due, t + DAY);   // açık konu testte zayıf: yarın tekrar
    return k.s;
  }
  // testte bilinen konu açılır; kart KISA vadeli (bedava seviye yok): S ≤ 5, ilk tekrar 4–5 gün sonra (gün içinde dönüşümlü)
  function taniAc(id, t) {
    const ks = konuSt(id);
    if (ks.acildi && ks.karte) return;   // zaten açık ve kartlı: kart değişmez
    const T = taniSt(), bugun = Object.keys(T.konu).filter(x => T.konu[x].s === 'biliyor' && T.konu[x].t && gun(T.konu[x].t) === gun(t)).length;
    const karte = api.FSRS.review({}, 3, t, api.ret ? api.ret() : undefined);
    karte.S = Math.min(karte.S, 5); karte.due = t + (bugun % 2 ? 5 : 4) * DAY;
    ks.karte = karte; ks.acildi = ks.acildi || t; ks.kaynak = 'tani';
  }
  // ---- sprint durumu ----
  // bugün açılan (testten açılanlar sayılmaz)
  const bugunAcilan = (t = now()) => Object.keys(st().konu).filter(id => GR[id] && st().konu[id].acildi && st().konu[id].kaynak !== 'tani' && gun(st().konu[id].acildi) === gun(t)).sort((a, b) => st().konu[a].acildi - st().konu[b].acildi);
  // sıradaki yeni konu: sırada testte zayıf ya da (test bittiyse) denenmemiş ilk kapalı konu; testte bilinenler atlanır
  const sprintAday = () => { const tb = taniDurum().bitti; return sprintSira().find(id => !acik(id) && taniSonuc(id) !== 'biliyor' && (tb || taniSonuc(id) === 'zayif')) || null; };
  function bugunYeni(t = now()) {
    const ac = bugunAcilan(t);
    if (ac.length) return ac[0];
    if (sprintAktif(t)) return sprintYeniVar(t) ? sprintAday() : null;
    if (buHafta() >= 2 || (api.birikme && api.birikme())) return null;
    return acilabilir()[0] || null;
  }
  // blok bitince isteğe bağlı +1 (sprintte günde en çok 2)
  const ekYeni = (t = now()) => (sprintYeniVar(t) && bugunAcilan(t).length === 1 ? sprintAday() : null);
  function konuDurum(id) {
    const k = st().konu[id], ts = taniSonuc(id);
    if (!k || !k.acildi) return ts === 'zayif' ? 'zayif' : ts === 'biliyor' ? 'biliyor' : 'denenmedi';
    const c = k.karte;
    if (!c) return 'ogreniliyor';
    if (c.lastG === 1) return 'zayif';
    if (c.S >= 21 || (ts === 'biliyor' && k.kaynak === 'tani')) return 'biliyor';
    return 'ogreniliyor';
  }
  // günün işi sayacı: S.gram.gun = { g: gün, set, tani } (set sonu ya da tanı oturumu sonu)
  const gunIs = tur => { const g = st(); if (!g.gun || g.gun.g !== gun()) g.gun = { g: gun(), set: 0, tani: 0 }; g.gun[tur] = (g.gun[tur] || 0) + 1; };
  const bugunYapildi = (t = now()) => { const g = st().gun; return !!(g && g.g === gun(t) && (g.set > 0 || g.tani > 0)); };
  function sprintDurum(t = now()) {
    return { tani: taniDurum(), konular: sprintSira().map((id, i) => ({ id, ad: GR[id].kopf.titel, durum: konuDurum(id), oncelik: i + 1 })),
      bugunYeni: bugunYeni(t), vadeli: Object.keys(GR).filter(id => vadeliT(id, t)), bugunYapildi: bugunYapildi(t) };
  }

  // ---------- alıştırma seçimi ----------
  const sesVar = () => typeof root.speechSynthesis !== 'undefined';
  const uebungen = id => (GR[id].uebungen || []).filter(u => !u.aus && u.teil && (u.tur !== 'dinle' || sesVar()));
  const teilBasari = (id, kod) => { const t = konuSt(id).teil[kod] || { d: 0, y: 0 }; return (t.d + 1) / (t.d + t.y + 2); };
  // yazarak üretilen türler (hayalette 'fast' da açılır; tekrar setinde en az biri)
  const YAZARAK = new Set(['umform', 'ordnen', 'fehler', 'ceviri', 'text', 'dinle']);
  const yazarak = u => YAZARAK.has(u.tur) || (u.tur === 'luecke' && !u.opt);
  const ekSecmeliVar = turler => [...turler].some(t => SECMELI_EK.has(t));
  function secUebung(id, aday, kullanilan) {
    const g = konuSt(id).gesehen;
    const c = aday.filter(u => !kullanilan.has(u.n));
    if (!c.length) return null;
    const taze = c.filter(u => !g[u.n] || now() - g[u.n] > 14 * DAY);
    const havuz = taze.length ? taze : c.slice().sort((a, b) => (g[a.n] || 0) - (g[b.n] || 0)).slice(0, Math.max(1, Math.ceil(c.length / 3)));
    return havuz[Math.floor(Math.random() * havuz.length)];
  }
  // tekrar seti: 5 alıştırma (31.10; eskiden 3) — en zayıf teil, en eski teil, rastgele, sonra zayıf ve başka bir teil'den birer yazarak; zorluk kararlılığa göre; üç farklı tür, en az biri yazarak
  // (ceviri / dinle / text / umform / ordnen / fehler / seçeneksiz luecke), eslestir + kategori en çok 1
  function tekrarSeti(id) {
    const all = uebungen(id), ks = konuSt(id), Sg = kararlilik(id);
    const teile = Object.keys(GR[id].teile || {}).filter(k => all.some(u => u.teil === k));
    const ghostlu = new Set(Object.keys(st().ghost).filter(k => k.startsWith(id + ':')).map(k => k.split(':')[1]));
    let t = teile.filter(k => !ghostlu.has(k)); if (t.length < 2) t = teile;
    const zayif = t.slice().sort((a, b) => teilBasari(id, a) - teilBasari(id, b))[0];
    const eski = t.filter(k => k !== zayif).sort((a, b) => ((ks.teil[a] || {}).son || 0) - ((ks.teil[b] || {}).son || 0))[0];
    const kalan = t.filter(k => k !== zayif && k !== eski); const rast = kalan.length ? kalan[Math.floor(Math.random() * kalan.length)] : null;
    const zorluk = Sg < 4 ? [[1, 2], [2], [1, 2]] : Sg < 21 ? [[2, 3], [3], [2, 3]] : [[3], [3], [2, 3]];
    const out = [], used = new Set(), turler = new Set();
    [zayif, eski, rast].filter(Boolean).forEach((kod, i) => {
      const ekOk = u => !(SECMELI_EK.has(u.tur) && ekSecmeliVar(turler));
      let aday = all.filter(u => u.teil === kod && zorluk[i].includes(u.z) && !turler.has(u.tur) && ekOk(u));
      if (!aday.length) aday = all.filter(u => u.teil === kod && !turler.has(u.tur) && ekOk(u));
      if (!aday.length) aday = all.filter(u => !turler.has(u.tur) && ekOk(u) && !used.has(u.n));   // tür farkı teil'den önce gelir
      if (!aday.length) aday = all.filter(u => u.teil === kod && ekOk(u)); if (!aday.length) aday = all.filter(u => u.teil === kod); if (!aday.length) aday = all;
      const u = secUebung(id, aday, used); if (u) { out.push(u); used.add(u.n); turler.add(u.tur); }
    });
    if (out.length && !out.some(yazarak)) {
      const diger = new Set(out.slice(0, -1).map(u => u.tur)), yz = all.filter(u => yazarak(u) && !used.has(u.n));
      const y = secUebung(id, yz.filter(u => !diger.has(u.tur)).length ? yz.filter(u => !diger.has(u.tur)) : yz, used); if (y) { out[out.length - 1] = y; used.add(y.n); }
    }
    [zayif, rast || eski].filter(Boolean).forEach(kod => {
      const yok = u => !used.has(u.n) && !SECMELI_EK.has(u.tur);
      const yeniTur = u => !out.some(x => x.tur === u.tur);
      const aday = [u => u.teil === kod && yazarak(u) && yeniTur(u), u => yazarak(u) && yeniTur(u), u => u.teil === kod && yazarak(u), u => u.teil === kod, () => true].map(f => all.filter(u => f(u) && yok(u))).find(c => c.length) || [];
      const u = secUebung(id, aday, used); if (u) { out.push(u); used.add(u.n); }
    });
    return out;
  }
  // ---------- boylu boyuna çalışma (derin; 31.10, Tuna: "konuyu burada boylu boyuna alıştırmak istiyorum") ----------
  // Konu bölüm (teil) bölüm, kolaydan zora: her teil z1 → z2 → z3; art arda 2 doğru → bir üst zorluk, z3'te 2 doğru → teil tamam.
  // Yanlış → bir alt zorluk + 2 alıştırma sonra aynı teil'e başka alıştırmayla dönüş; küçük hata → seri sıfır, 3 alıştırma sonra dönüş.
  // Teil'ler karışık sırayla (en uzun süredir sorulmayan önce, art arda aynı teil yok); z ≥ 2'de çoğunlukla yazarak. Bütün teil'ler tamam,
  // havuz biter ya da "Bitir" → biter. Konu kartı oturum başına bir kez ("Devam et"le süren oturumda yeniden yazılmaz).
  const DERIN_SERI = 2;
  function derinYeni(id, giris) {
    const all = uebungen(id), teil = {};
    Object.keys(GR[id].teile || {}).filter(k => all.some(u => u.teil === k)).forEach(k => {
      teil[k] = { z: !giris && teilBasari(id, k) >= 0.75 ? 2 : 1, seri: 0, d: 0, y: 0, tamam: false, son: 0 };
    });
    return { teil, kuyruk: [], adim: 0, kul: [], sonKod: null, kart: false };
  }
  function derinSonraki(id, d, rnd = Math.random) {
    const all = uebungen(id), T = d.teil;
    for (;;) {
      const acikT = Object.keys(T).filter(k => !T[k].tamam);
      if (!acikT.length) return null;
      d.adim++;
      const ki = d.kuyruk.findIndex(x => x.at <= d.adim && T[x.kod] && !T[x.kod].tamam);
      let kod;
      if (ki >= 0) kod = d.kuyruk.splice(ki, 1)[0].kod;
      else { const sira = acikT.slice().sort((a, b) => T[a].son - T[b].son); kod = sira.find(k => k !== d.sonKod) || sira[0]; }
      const t = T[kod], kul = new Set(d.kul), bos = u => u.teil === kod && !kul.has(u.n), yazT = t.z >= 2 && rnd() < 0.7;
      const aday = [u => bos(u) && u.z === t.z && (!yazT || yazarak(u)), u => bos(u) && u.z === t.z, u => bos(u) && Math.abs(u.z - t.z) === 1, bos].map(f => all.filter(f)).find(c => c.length);
      if (!aday) { t.tamam = true; t.tukendi = true; continue; }   // bu teil'in alıştırması bitti
      const u = secUebung(id, aday, kul);
      d.kul.push(u.n); t.son = d.adim; d.sonKod = kod;
      return u;
    }
  }
  function derinIsle(id, d, u, n) {
    const t = d.teil[u.teil]; if (!t) return;
    if (n === 3) {
      t.d++; t.seri++;
      if (t.seri >= DERIN_SERI) {
        const kul = new Set(d.kul), ustVar = uebungen(id).some(x => x.teil === u.teil && x.z > t.z && !kul.has(x.n));
        if (t.z < 3 && ustVar) { t.z++; t.seri = 0; } else t.tamam = true;
      }
    } else {
      t.y++; t.seri = 0;
      if (n === 1) t.z = Math.max(1, t.z - 1);
      d.kuyruk.push({ kod: u.teil, at: d.adim + (n === 1 ? 2 : 3) });
    }
  }
  // tamam = ustalaşılan bölüm (alıştırması biten bölüm sayılmaz), kalan = sürecek bölüm
  const derinOzet = d => { const ts = Object.values(d.teil); return { tamam: ts.filter(t => t.tamam && !t.tukendi).length, kalan: ts.filter(t => !t.tamam).length, toplam: ts.length }; };
  function derinBaslat(id, giris, d) {
    if (!GR[id]) return;
    d = d || derinYeni(id, giris);
    const u = derinSonraki(id, d);
    if (!u) { api.toast('Bu konunun bütün bölümleri tamam ✓'); ses = { ekran: 'liste' }; return render(); }
    ses = { ekran: 'ueb', id, art: 'derin', giris: !!giris, set: [u], i: 0, erg: [], q: null, derin: d };
    render();
  }
  function ghostUebung(id, kod, ausser) {
    const all = uebungen(id).filter(u => u.teil === kod);
    const c = all.filter(u => u.n !== ausser); const havuz = c.length ? c : all;
    return havuz.length ? havuz[Math.floor(Math.random() * havuz.length)] : null;
  }
  // bugün vadesi gelen hayalet adımı (oturum içi adım 1'ler zamanı gelince)
  function hayaletHazir(t = now()) {
    const g = st().ghost;
    // adım 1: aynı oturumda ≥ 8 soru sonra; sayaç oturumla sıfırlandıysa (soruSayisi < q: başka oturum) hemen hazır (27.10 denetim: q 63'te kalan hayalet hiç gelmiyordu)
    const sq = api.soruSayisi();
    return Object.keys(g).filter(k => g[k].due <= t && (g[k].adim > 1 || sq < (g[k].q || 0) || sq - (g[k].q || 0) >= 8)).sort((a, b) => g[a].due - g[b].due);
  }

  // ---------- ana turda gramer sorusu (S2/S3) ----------
  // yalnız yazarak türler: seçeneksiz luecke, umform, ceviri, ordnen, fehler (text / dinle uzun ya da sesli: yok)
  const TUR_TUR = new Set(['luecke', 'umform', 'ceviri', 'ordnen', 'fehler']);
  const turUygun = u => TUR_TUR.has(u.tur) && !u.opt;
  const TUR_GUN = 3;   // bir vadeli konu turlarda günde en çok 3 kez (hayalet hariç)
  function turUebung(id, teil, ausser) {
    const tum = uebungen(id).filter(u => turUygun(u) && (!teil || u.teil === teil));
    let aday = tum.filter(u => u.n !== ausser); if (!aday.length) aday = tum;
    if (!aday.length) return null;
    const z = kararlilik(id) >= 4 ? [2, 3] : [2], zli = aday.filter(u => z.includes(u.z)), z2 = aday.filter(u => u.z >= 2);
    return secUebung(id, zli.length ? zli : z2.length ? z2 : aday, new Set());
  }
  const turSayi = (id, t) => { const x = (st().konu[id] || {}).tur; return x && x.g === gun(t) ? x.n : 0; };
  let turCache = null, turEl = null, turOnceki = null;
  // { konu, n, tur, ghost? } | null — açık konuların hazır hayaletleri, sonra vadeli konular (en eski vade önce); haric = bu turda sorulan konular
  function turSorusu(t, haric) {
    if (!api || !Object.keys(GR).length) return null;
    t = t == null ? now() : t;
    const h = new Set(haric || []), key = [...h].sort().join(','), c = turCache;
    if (c && c.key === key && Math.abs(t - c.t) < 10 * 60000 && !h.has(c.soru.konu) && (c.soru.ghost ? !!st().ghost[c.soru.ghost] : vadeliT(c.soru.konu, t))) return c.soru;
    let soru = null;
    for (const k of hayaletHazir(t)) {
      const [id, kod] = k.split(':');
      if (!GR[id] || !acik(id) || h.has(id)) continue;
      const u = turUebung(id, kod, st().ghost[k].son); if (u) { soru = { konu: id, n: u.n, tur: u.tur, ghost: k }; break; }
    }
    if (!soru) {
      const due = Object.keys(GR).filter(id => vadeliT(id, t) && !h.has(id) && turSayi(id, t) < TUR_GUN).sort((a, b) => turSayi(a, t) - turSayi(b, t) || konuSt(a).karte.due - konuSt(b).karte.due);
      for (const id of due) { const u = turUebung(id); if (u) { soru = { konu: id, n: u.n, tur: u.tur }; break; } }
    }
    turCache = soru ? { key, t, soru } : null;
    return soru;
  }
  // soruyu verilen kart elemanına çizer; Devam'dan sonra (doğruda 1,4 sn sonra kendiliğinden) bitti({ urteil, antwort, oneri }) çağrılır.
  // Log satırı, teil istatistiği ve hayalet burada; konu kartı, gün sayacı, xp, fx, tur sayacı app'te (bitti).
  function turRender(elm, soru, bitti) {
    const u = soru && GR[soru.konu] && (GR[soru.konu].uebungen || []).find(x => x.n === soru.n);
    if (!u || !elm) return false;
    if (!(ses && ses.art === 'tur')) turOnceki = ses;   // gramer bölümünde yarım kalan oturum korunur
    turEl = elm; turCache = null;
    ses = { ekran: 'ueb', id: soru.konu, art: 'tur', set: [u], i: 0, erg: [], q: null, turBitti: bitti, ghostKey: soru.ghost || null };
    renderUebung();
    return true;
  }
  const turAktif = () => !!(ses && ses.art === 'tur' && turEl);
  function turKlick(e) {
    if (!turAktif() || !e || !e.target || !e.target.closest) return false;
    const b = e.target.closest('[data-g]');
    if (!b || (turEl.contains && !turEl.contains(b))) return false;
    return klick(e);
  }
  const turTus = e => (turAktif() ? tus(e) : false);

  // ---------- cevap kontrolü ----------
  const norm = s => (s || '').replace(/[„“"«»”]/g, '').replace(/\s+/g, ' ').trim().replace(/\s*[.!?]+$/, '').replace(/\s+([,?.!])/g, '$1');
  const low1 = s => s.charAt(0).toLowerCase() + s.slice(1);
  const fold = s => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/,/g, '');
  function parcaPruef(giris, hedefler) {
    const u = norm(giris);
    for (const h of hedefler) { if (low1(u) === low1(norm(h))) return 'richtig'; }
    for (const h of hedefler) { if (fold(u) === fold(norm(h))) return 'fast'; }
    // kaynaşmış edat (im / in dem, zum / zu dem …): listede yoksa küçük hata (dilbilgisel olarak doğru, yalnız biçim)
    for (const h of hedefler) { if (kaynasAc(fold(u)) === kaynasAc(fold(norm(h)))) return 'fast'; }
    // konuşma dili (FORMAT.md 4.7): Genitiv yerine von + Dativ, wegen / trotz / während + Dativ → doğru Almanca, yazı dilinde Genitiv: küçük hata
    for (const h of hedefler) { if (konusmaDili(u, h)) { konusmaIz = true; return 'fast'; } }
    return 'falsch';
  }
  // 28.10 (Tuna: "von meinen Eltern teknik olarak doğru değil mi"): Genitiv belirleyicisinin Dativ karşılıkları
  let konusmaIz = false;
  const GEN_DAT = { des: ['dem'], eines: ['einem'], keines: ['keinem'], dieses: ['diesem'], jedes: ['jedem'], der: ['der', 'den'], einer: ['einer'], keiner: ['keiner', 'keinen'], dieser: ['dieser', 'diesen'], jeder: ['jeder'] };
  const datVon = g => GEN_DAT[g] || ((m => m ? (m[2] === 'es' ? [m[1] + 'em'] : [m[1] + 'er', m[1] + 'en']) : null)(g.match(/^(mein|dein|sein|ihr|unser|eur)(es|er)$/)));
  const kokAyni = (a, b) => { const k = w => w.replace(/(es|en|s|n)$/, ''); return a === b || k(a) === b || a === k(b) || k(a) === k(b); };
  function konusmaDili(giris, hedef) {
    const a = fold(norm(giris)).split(' '), h = fold(norm(hedef)).split(' ');
    let ai, hi;
    if (a[0] === 'von' && a.length === h.length + 1 && h[0] !== 'von') { ai = 1; hi = 0; }
    else if (['wegen', 'trotz', 'wahrend', 'statt', 'innerhalb', 'ausserhalb'].includes(h[0]) && a[0] === h[0] && a.length === h.length) { ai = 1; hi = 1; }
    else return false;
    const d = datVon(h[hi] || ''); if (!d || !d.includes(a[ai])) return false;
    for (let i = 1; hi + i < h.length; i++) if (!kokAyni(a[ai + i] || '', h[hi + i])) return false;
    return true;
  }
  const KAYNAS = { im: 'in dem', ins: 'in das', am: 'an dem', ans: 'an das', zum: 'zu dem', zur: 'zu der', beim: 'bei dem', vom: 'von dem', aufs: 'auf das', ubers: 'uber das', durchs: 'durch das', furs: 'fur das' };
  const kaynasAc = s => s.replace(/\b(im|ins|am|ans|zum|zur|beim|vom|aufs|ubers|durchs|furs)\b/g, m => KAYNAS[m]);
  const Gx = () => (api && api.G) || root.G;
  // gramer alıştırmasında anlam zarfı / parçacığı eksik ya da fazla (noch, schon, auch …) yapı hatası değildir: küçük hata (28.10, Tuna:
  // "Ich weiß nicht, ob ich die Prüfung bestanden habe" — yalnız "noch" eksik — tam yanlış sayılıp konu testte zayıf çıkıyordu)
  const ZARF = new Set(['noch', 'schon', 'auch', 'nur', 'immer', 'gern', 'gerne', 'sehr', 'wirklich', 'leider', 'jetzt', 'heute', 'gestern', 'morgen', 'bald', 'mal', 'eigentlich', 'vielleicht', 'oft', 'wieder', 'endlich', 'gerade', 'bitte', 'schnell', 'genau', 'etwas', 'sogar']);   // dann / danach / zuerst / trotzdem / so / doch / ja konuların hedefi olabilir: listede değil
  const CEKIM = [['bin', 'bist', 'ist', 'sind', 'seid'], ['habe', 'hast', 'hat', 'haben', 'habt'], ['werde', 'wirst', 'wird', 'werden', 'werdet'], ['war', 'warst', 'waren', 'wart'], ['hatte', 'hattest', 'hatten', 'hattet'], ['kann', 'kannst', 'konnen', 'konnt'], ['muss', 'musst', 'mussen'], ['will', 'willst', 'wollen', 'wollt'], ['darf', 'darfst', 'durfen', 'durft'], ['soll', 'sollst', 'sollen', 'sollt'], ['mochte', 'mochtest', 'mochten', 'mochtet']].map(l => new Set(l));
  const zarfsiz = x => kaynasAc(fold(norm(x))).replace(/[.,!?;:„“"]/g, ' ').split(/\s+/).filter(w => w && !ZARF.has(w)).join(' ');
  function cumlePruef(giris, alts) {
    const r = Gx().pruefen(giris, alts[0], alts.slice(1));
    if (r.urteil === 'falsch' && alts.some(a => kaynasAc(fold(norm(a))) === kaynasAc(fold(norm(giris))))) return { urteil: 'fast', tags: ['kaynaştırma'], diff: r.diff };
    // tek fark aynı fiilin başka kişi çekimi (sind → ist, hat → haben …): özne–fiil uyumu hatası, hedef yapı doğru → küçük hata
    // (28.10, Tuna: "Diese Aufgabe sind nicht lösbar" -bar alıştırmasında tam yanlış + yanlış etiket "yardımcı fiil" alıyordu)
    if (r.urteil === 'falsch') {
      const tk = x => kaynasAc(fold(norm(x))).replace(/[.,!?;:„“"]/g, ' ').split(/\s+/).filter(Boolean);
      const g = tk(giris), cek = alts.map(tk).find(h => h.length === g.length && h.filter((w, i) => w !== g[i]).length === 1);
      if (cek) { const i = cek.findIndex((w, j) => w !== g[j]); if (CEKIM.some(c => c.has(cek[i]) && c.has(g[i]))) return { urteil: 'fast', tags: ['fiil çekimi (özne uyumu)'], diff: r.diff }; }
    }
    if (r.urteil === 'falsch' && alts.some(a => zarfsiz(a) === zarfsiz(giris))) {
      const ga = norm(giris).split(/\s+/).length;
      return { urteil: 'fast', tags: [alts.some(a => norm(a).split(/\s+/).length > ga) ? 'eksik kelime' : 'fazla kelime', 'zarf'], diff: r.diff };
    }
    return { urteil: r.urteil, tags: r.tags || [], diff: r.diff };
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // dinle: noktalama ve büyük/küçük harf yok sayılır; umlaut/ß yazımı ya da uzun kelimede (≥ 5 harf, son iki harf aynı = çekim değil) tek harf → fast
  const dinleNorm = s => String(s || '').replace(/[.,!?;:„“”"«»–]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  function dinlePruef(giris, alts) {
    const u = dinleNorm(giris), hs = alts.map(dinleNorm);
    if (hs.includes(u)) return { urteil: 'richtig', tags: [] };
    for (const h of hs) if (fold(u).replace(/\s+/g, ' ') === fold(h).replace(/\s+/g, ' ')) return { urteil: 'fast', tags: ['umlaut/ß'] };
    const ut = u.split(' ');
    for (const h of hs) {
      const ht = h.split(' ');
      if (ht.length !== ut.length) continue;
      const fark = ht.map((t, i) => [ut[i], t]).filter(([x, t]) => x !== t);
      if (fark.length === 1) { const [x, t] = fark[0]; if (t.length >= 5 && lev(x, t) === 1 && x.slice(-2) === t.slice(-2)) return { urteil: 'fast', tags: ['yazım'] }; }
    }
    const r = Gx().pruefen(u, hs[0], hs.slice(1));
    const tags = (r.tags || []).filter(t => t !== 'yazım' && t !== 'groß/klein');
    return { urteil: 'falsch', tags: tags.length ? tags : ['farklı'] };
  }
  // tek giriş noktası (DOM'suz; testten çağrılır). giris türüne göre:
  // wahl / seçenekli luecke: seçilen metin · luecke / text: boşluk girişleri dizisi · ordnen / umform / ceviri / dinle: cümle
  // eslestir: dizi, giris[i] = sol i'ye eşlenen sağ öğenin dosyadaki sırası (null = eşlenmedi) · kategori: { öğe: grup sırası }
  function pruef(u, giris) {
    const T = u.tur;
    if (T === 'wahl' || (T === 'luecke' && u.opt)) return { urteil: u.cevap.includes(giris) ? 'richtig' : 'falsch', tags: [], antwort: String(giris == null ? '' : giris) };
    if (T === 'luecke' || T === 'text') {
      const parcalar = (giris || []).map(x => (x == null ? '' : String(x)).trim()); konusmaIz = false;
      let hedef, detay;
      if (T === 'text') { hedef = u.parcalar; detay = parcalar.map((p, i) => parcaPruef(p, hedef[i] || [])); }
      else {
        // luecke: her alternatif TAM bir set ("habe ; gearbeitet / bin ; gegangen"); setler karışmasın diye en iyi uyan set seçilir
        const puan = d => d.reduce((a, x) => a + (x === 'richtig' ? 2 : x === 'fast' ? 1 : 0), 0);
        let enIyi = null;
        for (const c of u.cevap) { const set = c.split(' ; '); const d = parcalar.map((p, i) => parcaPruef(p, [set[i] || ''])); if (!enIyi || puan(d) > puan(enIyi.d)) enIyi = { d, set }; }
        detay = enIyi ? enIyi.d : []; hedef = (enIyi ? enIyi.set : []).map(x => [x]);
      }
      const n = (hedef || []).length || 1;
      const konusma = konusmaIz; konusmaIz = false;
      const urteil = detay.length === n && detay.every(x => x === 'richtig') ? 'richtig'
        : T === 'luecke' ? (detay.every(x => x !== 'falsch') ? 'fast' : 'falsch')
        : detay.filter(x => x !== 'falsch').length / n >= 0.5 ? 'fast' : 'falsch';
      return { urteil, tags: konusma && urteil === 'fast' ? ['konuşma dili (yazıda Genitiv)'] : [], antwort: parcalar.join(' ; '), detay };
    }
    if (T === 'ordnen' || T === 'umform' || T === 'ceviri') {
      // ordnen'de parçalar boşlukla birleşir, virgül girilemez: virgül iki tarafta da yok sayılır (eskiden virgüllü her ordnen cevabı yanlış çıkıyordu)
      const antwort = String(giris || ''), virgulsuz = x => x.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
      const r = T === 'ordnen' ? cumlePruef(virgulsuz(antwort), u.cevap.map(virgulsuz)) : cumlePruef(antwort, u.cevap);
      if (T === 'ordnen' && r.urteil === 'fast' && r.tags.every(t => t === 'groß/klein')) r.urteil = 'richtig';
      return { urteil: r.urteil, tags: r.tags, antwort };
    }
    if (T === 'dinle') { const r = dinlePruef(giris, u.cevap); return { urteil: r.urteil, tags: r.tags, antwort: String(giris || '') }; }
    if (T === 'eslestir') {
      const g = giris || [], detay = u.sol.map((_, i) => g[i] === i), yanlis = detay.filter(x => !x).length;
      // bir karışıklık (iki eşin yer değiştirmesi = 2 yanlış eş) küçük hata
      return { urteil: yanlis === 0 ? 'richtig' : yanlis <= 2 ? 'fast' : 'falsch', tags: [], detay,
        antwort: u.sol.map((s, i) => `${s} → ${g[i] != null && u.sag[g[i]] != null ? u.sag[g[i]] : '—'}`).join(' ;; ') };
    }
    if (T === 'kategori') {
      const g = giris || {}, hepsi = u.gruplar.flatMap((gr, gi) => gr.oge.map(o => ({ o, gi })));
      const yanlis = hepsi.filter(x => g[x.o] !== x.gi).length;
      return { urteil: yanlis === 0 ? 'richtig' : yanlis === 1 ? 'fast' : 'falsch', tags: [], detay: hepsi.map(x => g[x.o] === x.gi),
        antwort: u.gruplar.map((gr, gi) => `${gr.ad}: ${hepsi.filter(x => g[x.o] === gi).map(x => x.o).join(', ')}`).join(' ;; ') };
    }
    return { urteil: 'falsch', tags: [], antwort: String(giris || '') };
  }
  // log'daki loesung: antwort ile aynı biçimde
  const loesung = u => u.tur === 'eslestir' ? u.sol.map((s, i) => `${s} → ${u.sag[i]}`).join(' ;; ') : u.cevap[0];
  // text: boşlukları doldurulmuş düz metin (ses ve düzeltme için)
  const textDolu = (u, f) => { let i = 0; return u.soru.replace(/___(\s*\([^)]*\))?/g, () => f(u.parcalar[i++] || [''])); };

  // ---------- oturum ----------
  let ses = null;  // { ekran: 'liste'|'tanit'|'ueb', id, set: [...], i, art: 'giris'|'tekrar'|'ghost'|'kontrast', erg: [], q }
  const reset = () => { ses = null; };
  const el = () => (ses && ses.art === 'tur' && turEl ? turEl : api.kart());
  const esc = s => api.esc(s == null ? '' : String(s));
  const de = s => api.deHTML(s == null ? '' : String(s));
  // "-e mi -en mi?": ek başındaki tire satır sonunda kopmasın (bölünmez tire)
  const tire = s => String(s == null ? '' : s).replace(/(^|[\s(/„"])-(?=\p{L})/gu, '$1\u2011');
  const karistir = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  function render() {
    // turda yarım kalmış gramer sorusu gramer bölümünde çizilmesin (27.10 denetim: Devam'dan sonra kart donuyordu): bölümün kendi oturumuna dön
    if (ses && ses.art === 'tur') { ses = turOnceki; turOnceki = null; turEl = null; }
    if (!ses) ses = { ekran: 'liste' };
    api.durum('');
    if (ses.ekran === 'liste') return renderListe();
    if (ses.ekran === 'tanit') return renderTanit();
    if (ses.ekran === 'ueb') return renderUebung();
    if (ses.ekran === 'son') return renderSon();
    if (ses.ekran === 'tani-giris') return renderTaniGiris();
    if (ses.ekran === 'tani-son') return renderTaniSon();
  }
  // içerikteki "doğrulanmadı" işareti (?) öğrenciye gösterilmez
  const kapTemiz = s => String(s || '').replace(/\s*\?/g, '');
  // ---- konu listesi ----
  function renderListe() {
    const ids = Object.keys(GR);
    if (!ids.length) { el().innerHTML = '<div class="bos">Gramer içeriği yok.</div>'; return; }
    const sp = sprintAktif(), td = taniDurum(), by = bugunYeni();
    const due = ids.filter(id => vadeli(id)), ac = ids.filter(id => acik(id) && !vadeli(id)), yeni = sp ? sprintSira().filter(id => !acik(id) && taniSonuc(id) !== 'biliyor') : acilabilir();
    const ghosts = hayaletHazir();
    const pil = id => { const Sg = kararlilik(id); return !acik(id) ? (taniSonuc(id) === 'zayif' ? '<span class="durum-pil schwach">testte zayıf</span>' : '') : vadeli(id) ? '<span class="durum-pil schwach">tekrar</span>' : Sg >= 21 ? '<span class="durum-pil sitzt">oturdu</span>' : '<span class="durum-pil lernt">öğreniliyor</span>'; };
    const satir = (id, btn) => { const k = GR[id].kopf; return `<div class="oge g-oge"><span class="de">${esc(k.titel)}${k.goethe.stufe === 3 ? ' <span class="soluk">★ sınavda şart</span>' : ''}</span><span class="tr">${esc(k.tr)}${k.kapitel ? ` · <span class="soluk">${esc(kapTemiz(k.kapitel))}</span>` : ''}</span><span class="yan">${pil(id)} ${btn}</span></div>`; };
    const h = [`<div class="tur"><span class="yeni">gramer</span><span>konu başına kısa kural + alıştırma · yanlışlar kısa aralıkla geri gelir</span></div>`];
    if (!td.bitti) h.push(`<div class="kural">📝 Gramer testi: ${td.yapilan}/${td.toplam} konu · bildiğin konular açılır, bilmediklerin sırayla öğretilir <button class="btn mini ana" data-g="tani" type="button">${td.yapilan ? 'Devam et' : 'Başla'}</button></div>`);
    if (sp) h.push(`<div class="sira"><button class="btn${bugunYapildi() ? '' : ' ana'}" data-g="blok" type="button">${bugunYapildi() ? '✓ ' : ''}Günün gramer bloğu${!td.bitti ? ' · test' : by && !(acik(by) && konuSt(by).karte) ? ' · yeni: ' + esc(GR[by].kopf.titel) : ''}</button></div>`);
    if (ghosts.length) h.push(`<div class="kural">⚡ ${ghosts.length} hayalet tekrar hazır (az önce yanlış yaptığın kurallar) <button class="btn mini ana" data-g="ghost-basla" type="button">Çöz</button></div>`);
    if (due.length) h.push(`<h2>Tekrar zamanı (${due.length})</h2>${due.length > 1 ? `<div class="sira"><button class="btn ana" data-g="karisik" type="button">Karışık tekrar · ${due.length} konu</button></div>` : ''}` + due.map(id => satir(id, `<button class="btn mini ana" data-g="tekrar" data-id="${id}" type="button">Tekrar et</button> <button class="btn mini" data-g="derin" data-id="${id}" type="button">Boylu boyuna</button>`)).join(''));
    if (ac.length) h.push(`<h2>Açık konular</h2>` + ac.map(id => satir(id, `<button class="btn mini" data-g="oku" data-id="${id}" type="button">Kural</button> <button class="btn mini" data-g="tekrar" data-id="${id}" type="button">5 alıştırma</button> <button class="btn mini ana" data-g="derin" data-id="${id}" type="button">Boylu boyuna</button>`)).join(''));
    if (yeni.length) {
      // sprintte haftada 2 sınırı yok; günde 2'den fazlası yalnız uyarı
      const sinir = sp ? bugunAcilan().length >= 2 : buHafta() >= 2 || (api.birikme && api.birikme());
      const not = sp ? 'Bugün 2 konu açtın: yenisi yarın daha iyi oturur (istersen yine açabilirsin).' : 'Bu hafta 2 yeni konu açıldı ya da kelime tekrarları birikmiş: yeni konu için biraz bekle (istersen yine açabilirsin).';
      h.push(`<h2>Yeni konu${sp ? ' · sprint sırası' : ''}</h2>${sinir ? `<p class="aciklama">${not}</p>` : ''}` +
        yeni.slice(0, 8).map(id => satir(id, `<button class="btn mini${sinir || (sp && id !== by) ? '' : ' ana'}" data-g="ac" data-id="${id}" type="button">Başla</button>`)).join(''));
    }
    el().innerHTML = h.join('');
  }
  // ---- tanıtım ----
  function renderTanit() {
    const g = GR[ses.id], k = g.kopf;
    const paras = (g.erklaerung || '').split(/\n\s*\n/).map(p => {
      const ls = p.split('\n');
      if (ls.every(l => /^\d+\.\s/.test(l))) return `<ol class="erkl">${ls.map(l => `<li>${de(l.replace(/^\d+\.\s/, ''))}</li>`).join('')}</ol>`;
      return `<p>${de(p)}</p>`;
    }).join('');
    const tablolar = (g.tabellen || []).map(t => `<div class="tablo-kap"><table class="tablo"><caption>${esc(t.titel)}</caption><thead><tr>${t.kopf.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.zeilen.map(z => `<tr>${z.map(c => `<td>${de(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('');
    const bsp = (g.beispiele || []).map(([a, t]) => `<li>${de(a)} <button class="ses-mini" data-g="ses" data-metin="${esc(a)}" type="button" aria-label="dinle">🔊</button><br><span class="soluk">${esc(t)}</span></li>`).join('');
    el().innerHTML = `<div class="tur"><span class="yeni">gramer · kural</span><span>${esc(k.stufe)}${k.kapitel ? ' · ' + esc(kapTemiz(k.kapitel)) : ''}</span></div>
      <div class="soru">${esc(k.titel)}</div><div class="soluk">${esc(k.tr)}</div>
      <div class="kural g-kurz">${de(k.kurz)}</div>
      <div class="g-erkl">${paras}</div>${tablolar}${bsp ? `<ul class="erkl g-bsp">${bsp}</ul>` : ''}
      <div class="sira"><button class="btn ana devam-btn" data-g="${ses.sonra === 'giris' ? 'giris-basla' : 'liste'}" type="button">${ses.sonra === 'giris' ? 'Alıştırmalara geç' : 'Tamam'} <kbd>Enter</kbd></button></div>`;
    ses.tanitBasi = now();
  }
  // ---- alıştırma ----
  function baslatSet(id, art, set) {
    if (!set || !set.length) { api.toast('Bu konuda alıştırma yok.'); ses = { ekran: 'liste' }; return render(); }
    ses = { ekran: 'ueb', id, art, set, i: 0, erg: [], q: null };
    render();
  }
  function renderUebung() {
    const u = ses.set[ses.i], g = GR[ses.id];
    if (!ses.q || ses.q.n !== u.n || ses.q.id !== ses.id) ses.q = { n: u.n, id: ses.id, start: now(), ipucu: false, secim: [], adim: 1, done: false, ok: null };
    const q = ses.q, teil = (g.teile || {})[u.teil] || { name: u.teil };
    const dz = ses.art === 'derin' ? ses.derin : null, dzO = dz && derinOzet(dz);
    const sayac = ses.art === 'tani' ? ` · test ${ses.tani.n + 1}/~${TANI_OTURUM}` : ses.art === 'tur' ? '' : dz ? ` · ${ses.i + 1}. alıştırma · ${dzO.tamam}/${dzO.toplam} bölüm tamam` : ` · ${ses.i + 1}/${ses.set.length}`;
    const ust = `<div class="tur"><span class="yeni">gramer · ${esc(TUR_AD[u.tur] || u.tur)}</span><span>${esc(g.kopf.titel)}${ses.art === 'tani' ? '' : ' · ' + esc(teil.name)}${sayac}${ses.art === 'ghost' || (ses.art === 'tur' && ses.ghostKey) ? ' · hayalet' : ''}</span></div>`
      // boylu boyuna: bölüm çubukları (tamam / zorluk basamağı), istediğin an Bitir
      + (dz ? `<div class="g-derin"><span class="soluk">bölümler</span>${Object.keys(dz.teil).map(k => { const t = dz.teil[k]; return `<span class="g-derin-t${t.tamam ? ' tamam' : k === u.teil ? ' simdi' : ''}" title="${esc((g.teile[k] || {}).name || k)}">${t.tamam && !t.tukendi ? '✓' : t.tamam ? '–' : ['', '●○○', '●●○', '●●●'][t.z]}</span>`; }).join('')}<button class="btn mini" data-g="derin-bitir" type="button">Bitir</button></div>` : '');
    // her türde "Bilmiyorum" (tahmin yerine; Zayıflar → Bilmediklerim listesine girer); yazı kutusu yoksa 0 tuşu
    const bilmBtn = '<button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button>';
    const trVar = u.tr && u.tr !== '-';
    const ipucu = !trVar ? '' : u.z === 1 || q.ipucu ? `<div class="soluk g-tr">${esc(u.tr)}</div>` : `<div class="soluk"><button class="btn mini" data-g="ipucu" type="button">Türkçesi (ipucu)</button></div>`;
    const hover = api.odakla && api.odakla();
    const woerter = (u.woerter || []).filter(w => api.kelimeAnlam && !api.kelimeGesehen(w)).map(w => `<span class="chip" title="${esc(api.kelimeAnlam(w) || '')}">${esc(w)}${api.kelimeAnlam(w) ? ' = ' + esc(api.kelimeAnlam(w)) : ''}</span>`).join('');
    let govde = '';
    if (u.tur === 'wahl' || (u.tur === 'luecke' && u.opt)) {
      if (!q.opts) q.opts = karistir(u.opt);
      govde = `<div class="soru g-soru">${de(tire(u.soru))}</div>${ipucu}<div class="mc${q.opts.every(o => o.length < 14) ? ' kisa' : ''}">${q.opts.map(o => `<button class="mc-opt" data-g="sec" data-v="${esc(o)}" type="button">${de(o)}</button>`).join('')}</div><div class="sira">${bilmBtn.replace('>Bilmiyorum<', '>Bilmiyorum <kbd>0</kbd><')}</div>`;
    } else if (u.tur === 'luecke') {
      const n = (u.soru.match(/___/g) || []).length; let i = 0;
      const html = esc(u.soru).replace(/___/g, () => `<input class="g-inp" data-i="${i++}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="boşluk ${i}">`);
      govde = `<div class="soru g-soru g-luecke">${html}</div>${ipucu}<div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>${n > 1 ? '<div class="soluk">Tab ile sonraki boşluğa geç.</div>' : ''}`;
    } else if (u.tur === 'ordnen') {
      if (!q.parcalar) q.parcalar = karistir(u.soru.split(' / ').map(x => x.trim()));
      const kalan = q.parcalar.map((p, i) => ({ p, i })).filter(x => !q.secim.includes(x.i));
      govde = `<div class="soru g-soru">${ipucu ? '' : ''}Cümleyi diz:</div>${ipucu}<div class="g-dizi">${q.secim.length ? q.secim.map(i => `<button class="chip g-sec" data-g="geri" data-i="${i}" type="button">${esc(q.parcalar[i])}</button>`).join(' ') : '<span class="soluk">parçalara sırayla dokun</span>'}</div>
        <div class="chips">${kalan.map(x => `<button class="chip" data-g="parca" data-i="${x.i}" type="button">${esc(x.p)}</button>`).join('')}</div>
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${kalan.length ? ' disabled' : ''}>Kontrol <kbd>Enter</kbd></button><button class="btn mini" data-g="geri-son" type="button">← geri al</button>${bilmBtn}</div>`;
    } else if (u.tur === 'fehler') {
      const toks = u.soru.split(/(\s+)/);
      const hataVar = u.hata && u.hata !== '-';
      if (q.adim === 1) govde = `<div class="soru g-soru g-fehler">${toks.map((t, i) => /\S/.test(t) ? `<button class="g-tok${q.tok === i ? ' secili' : ''}" data-g="tok" data-i="${i}" type="button">${esc(t)}</button>` : ' ').join('')}</div>${ipucu}
        <p class="aciklama">Hatalı kelimeye dokun; cümle doğruysa „Hata yok“.</p><div class="sira"><button class="btn" data-g="hata-yok" type="button">Hata yok</button>${bilmBtn}</div>`;
      else govde = `<div class="soru g-soru"><s>${esc(u.hata)}</s> hatalı. Cümlenin doğrusunu yaz:</div><div class="soluk">${esc(u.soru)}</div>${ipucu}<div class="cevap"><input id="cevap" class="g-inp g-tam" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div><div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button>${bilmBtn}</div>`;
      if (!hataVar && q.adim === 2) q.adim = 1;
    } else if (u.tur === 'umform') {
      const [kaynak, hedef] = u.soru.split(' → ');
      govde = `<div class="soru g-soru">${de(kaynak)}</div><div class="kural">${esc(umformYonerge((hedef || '').trim()))}</div>${ipucu}<div class="cevap"><input id="cevap" class="g-inp g-tam" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="yeni cümle"></div><div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>`;
    } else if (u.tur === 'ceviri') {
      govde = `<div class="soluk g-yonerge">Almancası</div><div class="soru g-soru g-ceviri">${esc(u.soru)}</div>${ipucu}<div class="cevap"><input id="cevap" class="g-inp g-tam" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Almanca cümle" lang="de"></div><div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>`;
    } else if (u.tur === 'text') {
      let i = 0;
      const html = esc(u.soru).replace(/___(\s*\(([^)]*)\))?/g, (m, p, ip) => { const k = i++; return `<span class="g-bos"><input class="g-inp" data-i="${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="de" aria-label="boşluk ${k + 1}">${ip ? `<span class="g-ip">(${ip})</span>` : ''}</span>`; });
      govde = `<div class="soluk g-yonerge">Metindeki boşlukları doldur</div><div class="soru g-soru g-luecke g-text">${html}</div>${ipucu}<div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>`;
    } else if (u.tur === 'eslestir') {
      if (!q.sagSira) { q.sagSira = karistir(u.sag.map((_, j) => j)); q.es = {}; q.solSec = 0; }
      const solOf = j => { const k = Object.keys(q.es).find(i => q.es[i] === j); return k == null ? null : +k; };
      const tam = Object.keys(q.es).length === u.sol.length;
      const sol = u.sol.map((t, i) => `<button class="g-es g-es-sol${q.solSec === i && !tam ? ' secili' : ''}${q.es[i] != null ? ' eslendi' : ''}" data-g="es-sol" data-i="${i}" type="button"><span class="g-no">${i + 1}</span><span class="g-es-t">${de(t)}</span></button>`).join('');
      const sag = q.sagSira.map((j, k) => { const s0 = solOf(j); return `<button class="g-es g-es-sag${s0 != null ? ' eslendi' : ''}" data-g="es-sag" data-j="${j}" type="button">${s0 != null ? `<span class="g-no">${s0 + 1}</span>` : hover ? `<kbd class="g-kbd">${k + 1}</kbd>` : ''}<span class="g-es-t">${de(u.sag[j])}</span></button>`; }).join('');
      govde = `<div class="soru g-soru">Eşleştir</div><p class="aciklama">Soldakine, sonra sağdaki eşine dokun. Eşi bozmak için yeniden dokun.</p>${ipucu}<div class="g-esle"><div class="g-kol">${sol}</div><div class="g-kol">${sag}</div></div>
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${tam ? '' : ' disabled'}>Kontrol <kbd>Enter</kbd></button>${bilmBtn}</div>`;
    } else if (u.tur === 'kategori') {
      if (!q.ogeler) { q.ogeler = karistir(u.gruplar.flatMap((g2, gi) => g2.oge.map(o => ({ o, gi })))); q.kat = {}; }
      const aktif = q.ogeler.findIndex((_, k) => q.kat[k] == null);
      const rows = q.ogeler.map((x, k) => `<div class="g-kat-oge${q.kat[k] != null ? ' atandi' : ''}${aktif === k ? ' aktif' : ''}" data-k="${k}"><span class="g-kat-ad">${de(x.o)}</span><span class="g-kat-btns">${u.gruplar.map((g2, gi) => `<button class="btn mini g-kat-btn${q.kat[k] === gi ? ' an' : ''}" data-g="kat" data-k="${k}" data-gi="${gi}" type="button">${hover && aktif === k ? `<kbd>${gi + 1}</kbd> ` : ''}${esc(g2.ad)}</button>`).join('')}</span></div>`).join('');
      govde = `<div class="soru g-soru">${de(tire(u.soru))}</div>${ipucu}<div class="g-kat">${rows}</div>
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${aktif === -1 ? '' : ' disabled'}>Kontrol <kbd>Enter</kbd></button>${bilmBtn}</div>`;
    } else if (u.tur === 'dinle') {
      govde = `<div class="soluk g-yonerge">Dinle, duyduğun cümleyi yaz</div><div class="sira g-dinle"><button class="btn buyuk ana" data-g="dinle" type="button">🔊 Dinle</button><button class="btn mini" data-g="dinle" data-hiz="yavas" type="button">🐢 yavaş</button></div>${ipucu}
        <div class="cevap"><input id="cevap" class="g-inp g-tam" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="duyduğun cümle" lang="de"></div><div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>`;
      // ilk gösterimde bir kez kendiliğinden oku (tarayıcı izni: kullanıcı sayfaya dokunduysa)
      if (!q.caldi && root.navigator && root.navigator.userActivation && root.navigator.userActivation.hasBeenActive) { q.caldi = true; api.later(() => { if (ses && ses.q === q && !q.done) api.sprich(u.soru); }, 250); }
    }
    el().innerHTML = ust + govde + (woerter ? `<div class="soluk g-woerter">kelimeler: ${woerter}</div>` : '') + '<div id="g-sonuc"></div>';
    api.tastatur && api.tastatur();
    const inp = el().querySelector('.g-inp'); if (inp && api.odakla()) inp.focus();
  }
  // ---- değerlendirme ----
  // ekrandan / oturumdan türün girişini topla (pruef'in beklediği biçimde)
  function girisTopla(u, q, giris) {
    if ((u.tur === 'luecke' && !u.opt) || u.tur === 'text') return Array.from(el().querySelectorAll('.g-inp')).map(i => i.value);
    if (u.tur === 'ordnen') return q.secim.map(i => q.parcalar[i]).join(' ');
    if (u.tur === 'eslestir') return u.sol.map((_, i) => (q.es && q.es[i] != null ? q.es[i] : null));
    if (u.tur === 'kategori') { const o = {}; (q.ogeler || []).forEach((x, k) => { if (q.kat[k] != null) o[x.o] = q.kat[k]; }); return o; }
    return giris;
  }
  function cevapla(giris, bilmiyorum) {
    const q = ses.q, u = ses.set[ses.i], g = GR[ses.id];
    if (q.done) return;
    let urteil = 'falsch', tags = [], antwort = giris == null ? '' : String(giris);
    q.detay = null;
    if (bilmiyorum) { tags = ['bilmiyorum']; antwort = ''; }
    else if (u.tur === 'fehler') {
      if (q.adim === 1) {
        const hataVar = u.hata && u.hata !== '-';
        const tok = q.tok != null ? u.soru.split(/(\s+)/)[q.tok] : null;
        const temiz = s => (s || '').replace(/[.,!?;:]+$/, '');
        const ok = giris === '-' ? !hataVar : hataVar && u.hata.split(/\s+/).map(temiz).includes(temiz(tok));
        antwort = giris === '-' ? 'hata yok' : tok || '';
        if (ok && hataVar && u.z >= 3) { q.adim = 2; q.tok1 = tok; return renderUebung(); }   // z3: doğrusunu da yaz
        urteil = ok ? 'richtig' : 'falsch'; if (!ok) tags = [ (g.teile[u.teil] || {}).etiket || g.kopf.etiket || 'dilbilgisi' ];
      } else { const r = cumlePruef(antwort, u.cevap); urteil = r.urteil; tags = r.tags; antwort = (q.tok1 || '') + ' → ' + antwort; }
    } else { const r = pruef(u, girisTopla(u, q, antwort)); urteil = r.urteil; tags = r.tags; antwort = r.antwort; q.detay = r.detay || null; }
    q.done = true; q.urteil = urteil; q.antwort = antwort; q.tags = tags; q.sek = Math.round((now() - q.start) / 1000);
    q.oneri = urteil === 'richtig' ? 3 : urteil === 'fast' ? 2 : 1;
    // alternatif sıralama / çeviri olabilir: kendi notunu verebilir (tanı testinde itiraz yok: notu sistem verir)
    const serbest = (u.tur === 'umform' || u.tur === 'ordnen' || u.tur === 'ceviri') && urteil !== 'richtig' && ses.art !== 'tani' && !bilmiyorum;
    const baslik = { richtig: '✓ Doğru', fast: '≈ Küçük hata', falsch: bilmiyorum ? '✗ Bilmiyorum' : '✗ Yanlış' }[urteil];
    el().querySelectorAll('.mc-opt').forEach(b => { b.disabled = true; if (u.cevap.includes(b.dataset.v)) b.classList.add('dogru'); else if (b.dataset.v === antwort) b.classList.add('yanlis'); });
    el().querySelectorAll('.g-inp').forEach((inp, i) => { inp.readOnly = true; if (q.detay && !bilmiyorum && typeof q.detay[i] === 'string') inp.classList.add(q.detay[i] === 'richtig' ? 'dogru' : q.detay[i] === 'fast' ? 'yakin' : 'yanlis'); });
    if (u.tur === 'eslestir') el().querySelectorAll('.g-es').forEach(b => { b.disabled = true; if (b.dataset.i != null && q.detay) b.classList.add(q.detay[+b.dataset.i] ? 'dogru' : 'yanlis'); });
    if (u.tur === 'kategori') el().querySelectorAll('.g-kat-oge').forEach(r => { const x = q.ogeler[+r.dataset.k]; r.classList.add(q.kat[+r.dataset.k] === x.gi ? 'dogru' : 'yanlis'); r.querySelectorAll('button').forEach(b => { b.disabled = true; if (+b.dataset.gi === x.gi) b.classList.add('g-hedef'); }); });
    const dogru = u.tur === 'fehler' && q.adim === 1 ? (u.hata === '-' ? 'Cümle doğru: ' + u.soru : `${u.hata} → ${u.cevap[0]}`) : u.cevap[0];
    const dogruHTML = u.tur === 'text' ? (() => { let i = 0; const seg = u.soru.split(/___(?:\s*\([^)]*\))?/); return seg.map((x, k) => de(x) + (k < seg.length - 1 ? `<b>${esc((u.parcalar[i++] || [''])[0])}</b>` : '')).join(''); })() : null;
    const alt = u.cevap.length > 1 && !(u.tur === 'fehler' && q.adim === 1) ? `<div class="soluk">başka doğru: ${u.cevap.slice(1).map(de).join(' · ')}</div>` : '';
    const sesMetin = u.tur === 'text' ? textDolu(u, p => p[0]) : SECMELI_EK.has(u.tur) ? '' : u.cevap[0];
    const dogruGoster = u.tur === 'text' ? dogruHTML
      : u.tur === 'eslestir' ? u.sol.map((s0, i) => `${de(s0)} → <b>${de(u.sag[i])}</b>`).join('<br>')
      : u.tur === 'kategori' ? u.gruplar.map(g2 => `<b>${esc(g2.ad)}</b>: ${g2.oge.map(de).join(', ')}`).join('<br>')
      : de(dogru);
    el().querySelector('#g-sonuc').innerHTML = `<div class="sonuc ${urteil}"><div class="baslik">${baslik}${tags.length ? `<span class="etiketler">${tags.map(t => `<span class="etiket">${esc(t)}</span>`).join('')}</span>` : ''}</div>
      ${urteil !== 'richtig' ? `<div class="satir"><span class="et">senin</span><span class="deger fark">${esc(antwort).replace(/ ;; /g, '<br>') || '—'}</span></div>` : ''}
      <div class="satir"><span class="et">doğru</span><span class="deger">${dogruGoster}${sesMetin ? ` <button class="ses-mini" data-g="ses" data-metin="${esc(sesMetin)}" type="button" aria-label="dinle">🔊</button>` : ''}</span></div>${alt}
      <div class="satir"><span class="et">neden</span><span class="deger">${de(u.aciklama)}</span></div>
      ${urteil === 'falsch' ? `<div class="kural">${de(g.kopf.kurz)}</div>` : ''}
      ${!(u.z === 1 || q.ipucu) && u.tr && u.tr !== '-' ? `<div class="soluk">${esc(u.tr)}</div>` : ''}
      ${serbest ? `<div class="notlar"><button class="btn ana devam-btn" data-g="not" data-n="${q.oneri}" type="button">Devam <kbd>Enter</kbd></button>${[1, 2, 3].filter(n => n !== q.oneri).map(n => `<button class="btn mini n${n}" data-g="not" data-n="${n}" type="button"><kbd>${n}</kbd> ${['', 'yanlış say', 'küçük hata say', 'aslında doğru'][n]}</button>`).join('')}</div>`
        : `<button class="btn ana devam-btn${urteil === 'richtig' ? ' otomatik' : ''}" data-g="not" data-n="${q.oneri}" type="button">${urteil === 'richtig' ? '<span class="dolum" style="animation-duration:1.4s"></span>' : ''}Devam <kbd>Enter</kbd></button>`}</div>`;
    if (ses.art !== 'tur') api.fx && api.fx(urteil);   // turda fx app'te (bitti)
    if (urteil === 'richtig' && !serbest) api.later(() => { if (ses && ses.q === q) notla(3); }, 1400);
  }
  function notla(n) {
    if (!ses || !ses.q || !ses.set) return;
    const q = ses.q, u = ses.set[ses.i], g = GR[ses.id], ks = konuSt(ses.id);
    if (!q || !q.done || q.notlandi) return;
    q.notlandi = true;
    const urteil = n === 3 ? 'richtig' : n === 2 ? 'fast' : 'falsch';
    // teil istatistiği, görülme
    const t = ks.teil[u.teil] || (ks.teil[u.teil] = { d: 0, y: 0, son: 0 });
    if (n === 3) t.d++; else t.y++; t.son = now(); ks.gesehen[u.n] = now();
    ses.erg.push({ n: u.n, teil: u.teil, not: n, tur: u.tur, z: u.z, konu: ses.id });
    // hayalet: yanlış → aynı teil kısa aralıkla; üretim türünde küçük hata da
    const key = ses.id + ':' + u.teil, gh = st().ghost;
    const ghostModu = ses.art === 'ghost' || (ses.art === 'tur' && ses.ghostKey === key);
    if (ghostModu) {
      const h = gh[key];
      if (h) { if (n === 3) { h.dogru = (h.dogru || 0) + 1; if (h.dogru >= 2) delete gh[key]; else { h.adim = Math.min(3, h.adim + 1); h.due = now() + (h.adim === 2 ? DAY : 3 * DAY); } }
        else { h.dogru = 0; h.deneme = (h.deneme || 0) + 1; h.adim = 1; h.due = now() + 5 * 60000; h.q = api.soruSayisi(); if (h.deneme >= 4) { api.leech && api.leech('g:' + key, g.kopf.titel + ' / ' + ((g.teile[u.teil] || {}).name || u.teil)); delete gh[key]; } } }
    } else if (ses.art !== 'deneme' && (ses.art !== 'tani' || acik(ses.id)) && (n === 1 || (n === 2 && yazarak(u)))) {   // testte kapalı konunun yanlış teil'i: açılınca hayalet
      if (!gh[key]) { if (Object.keys(gh).length >= 6) { const eski = Object.keys(gh).sort((a, b) => gh[a].due - gh[b].due)[0]; delete gh[eski]; }
        gh[key] = { adim: 1, due: now() + 5 * 60000, q: api.soruSayisi(), son: u.n, dogru: 0, deneme: 0 }; }
    }
    const notiz = [`tür:${u.tur}`, `z:${u.z}`].concat(n !== 3 && (g.teile[u.teil] || {}).etiket ? [(g.teile[u.teil] || {}).etiket] : [], q.tags.filter(x => x !== 'bilmiyorum' && x !== (g.teile[u.teil] || {}).etiket), q.tags.includes('bilmiyorum') ? ['bilmiyorum'] : [],
      ghostModu ? ['ghost:' + ((gh[key] || {}).adim || 0)] : [], q.ipucu ? ['ipucu:1'] : [], q.oneri !== n ? [`öneri:${['', 'falsch', 'fast', 'richtig'][q.oneri]}`] : [], [`sek:${q.sek}`]);
    // test: id g:<konu>:tani:<n>, notiz tanı:<konudaki sıra> önde · tur: notiz tur:akis önde
    const onEk = ses.art === 'tani' ? [`tanı:${ses.taniSira}`] : ses.art === 'tur' ? ['tur:akis'] : [];
    // Bilmediklerim: "Bilmiyorum" → listeye; sonra doğru cevaplar (başka günlerde iki kez) "artık biliyorsun"a taşır
    if (api.bilmedik && (q.tags.includes('bilmiyorum') || n === 3)) api.bilmedik(`g:${ses.id}:${u.teil}`, `${g.kopf.titel.split(":")[0]} · ${(g.teile[u.teil] || {}).name || u.teil}`, !q.tags.includes('bilmiyorum'));
    api.logEintrag({ modus: 'gram', id: ses.art === 'tani' ? `g:${ses.id}:tani:${u.n}` : `g:${ses.id}:${u.n}`, item: `${ses.id}/${u.teil}`, frage: u.soru, antwort: q.antwort, ergebnis: urteil, loesung: loesung(u), notiz: onEk.concat(notiz).join(' | ') });
    if (ses.art === 'tur') {   // turda: konu kartı, gün sayacı, xp, fx değişmez (app bitti'de sayar)
      const x = ks.tur && ks.tur.g === gun() ? ks.tur : (ks.tur = { g: gun(), n: 0 }); if (!ghostModu) x.n++;
      api.save && api.save();
      const cb = ses.turBitti, sonuc = { urteil, antwort: q.antwort, oneri: ['', 'falsch', 'fast', 'richtig'][q.oneri] };
      ses = turOnceki; turOnceki = null; turEl = null;
      if (cb) cb(sonuc);
      return;
    }
    if (ses.art === 'tani') {
      // testte konu bilgisi ölçülür: yalnız konuyla ilgisiz küçük hata (zarf eksik/fazla, yazım, büyük/küçük harf, kaynaştırma) konuyu zayıf yapmaz
      const KUCUK = new Set(['zarf', 'eksik kelime', 'fazla kelime', 'yazım', 'büyük/küçük harf', 'kaynaştırma', 'umlaut', 'noktalama']);
      const gecti = urteil === 'richtig' || (urteil === 'fast' && (q.tags || []).length && q.tags.every(x => KUCUK.has(x)));
      const o = ses.tani, sonuc = taniCevap(ses.id, u, gecti ? 'richtig' : urteil, q.ipucu);
      o.n++; if (urteil === 'richtig') o.d++; if (sonuc) o[sonuc].push(ses.id);
    }
    api.heuteM('gram').n++; api.heuteM('gram')[urteil] = (api.heuteM('gram')[urteil] || 0) + 1;
    api.xpEkle(n === 3 ? (u.z >= 3 ? 15 : 10) : n === 2 ? 5 : 0);
    api.sayac && api.sayac(urteil);
    api.save();
    if (ses.art === 'tani') return taniIleri();
    if (ses.art === 'derin') { derinIsle(ses.id, ses.derin, u, n); const nx = derinSonraki(ses.id, ses.derin); if (nx) ses.set.push(nx); }
    ses.i++;
    if (ses.i >= ses.set.length) setBitti(); else { ses.q = null; render(); }
  }
  function setBitti() {
    const g = GR[ses.id], ks = konuSt(ses.id), t = now();
    const puan = ses.erg.reduce((a, e) => a + (e.not === 3 ? 1 : e.not === 2 ? 0.5 : 0), 0), n = ses.erg.length;
    const oran = n ? puan / n : 0;
    // boylu boyuna: konu kartı oturum başına bir kez; yeni konuda giriş gibi (ertesi gün tekrar)
    const girisMi = ses.art === 'giris' || (ses.art === 'derin' && ses.giris);
    const kartYok = ses.art === 'ghost' || ses.art === 'deneme' || !n || (ses.art === 'derin' && ses.derin.kart);
    const setNot = kartYok ? null : oran >= 0.8 ? 3 : oran >= 0.5 ? 2 : 1;
    if (ses.art === 'derin' && setNot) ses.derin.kart = true;
    if (ses.art === 'derin' && !setNot && n) {
      const o = derinOzet(ses.derin);
      api.logEintrag({ modus: 'gram', id: `g:${ses.id}`, item: g.kopf.titel, frage: 'derin', antwort: '', ergebnis: oran >= 0.8 ? 'richtig' : oran >= 0.5 ? 'fast' : 'falsch', loesung: '', notiz: `puan:${puan}/${n} | teil-tamam:${o.tamam}/${o.toplam} | devam` });
    }
    if (setNot) {
      const alt = ks.karte && ks.karte.S ? ks.karte : {};
      ks.karte = api.FSRS.review(alt, setNot, t, api.ret());
      // öğrenme adımları: giriş setinden sonra ertesi gün kesin tekrar; yanlışsa 1 gün içinde
      if (girisMi || setNot === 1) ks.karte.due = Math.min(ks.karte.due, t + DAY);
      if (girisMi) ks.karte.due = t + DAY;
      sprintVade(ks.karte, t);
      // testte yanlış çıkan teil'ler: giriş setinden sonra hayalet (ertesi gün)
      const tk = girisMi && taniSt().konu[ses.id], gh = st().ghost;
      if (tk) (tk.yanlis || []).forEach(kod => { const key = ses.id + ':' + kod; if (!gh[key] && (GR[ses.id].teile || {})[kod]) { if (Object.keys(gh).length >= 6) delete gh[Object.keys(gh).sort((a, b) => gh[a].due - gh[b].due)[0]]; gh[key] = { adim: 2, due: t + DAY, q: api.soruSayisi(), son: 0, dogru: 0, deneme: 0 }; } });
      gunIs('set');
      api.logEintrag({ modus: 'gram', id: `g:${ses.id}`, item: g.kopf.titel, frage: girisMi ? 'giriş' : ses.art === 'derin' ? 'derin' : ses.art === 'kontrast' ? 'kontrast' : 'tekrar', antwort: '', ergebnis: ['', 'falsch', 'fast', 'richtig'][setNot], loesung: '', notiz: `puan:${puan}/${n} | teil:${[...new Set(ses.erg.map(e => e.teil))].join(',')}` + (ses.art === 'derin' ? ` | teil-tamam:${derinOzet(ses.derin).tamam}/${derinOzet(ses.derin).toplam}` : '') });
    }
    api.save();
    ses.ekran = 'son'; ses.puan = puan; ses.n = n; ses.setNot = setNot;
    render();
  }
  function renderSon() {
    const g = GR[ses.id], ks = konuSt(ses.id);
    const gun = ks.karte && ks.karte.due ? Math.max(0, Math.round((ks.karte.due - now()) / DAY)) : 0;
    // teil adı alıştırmanın kendi konusundan (karışık tekrarda konular farklı)
    const zayif = [...new Set(ses.erg.filter(e => e.not < 3).map(e => { const gg = GR[e.konu] || g; return (gg.teile[e.teil] || {}).name || e.teil; }))];
    const dahaDue = Object.keys(GR).filter(id => id !== ses.id && vadeli(id));
    // günün bloğu sürüyor: bugünün yeni konusu henüz öğrenilmedi → ana düğme; giriş setinden sonra sprintte isteğe bağlı +1
    const by = blokYeni(), ek = !by && ses.art === 'giris' ? ekYeni() : null;
    const sonraki = id => { const kk = konuSt(id).karte; const dk = kk && kk.due ? kk.due - now() : 0; return dk < DAY ? (dk < 3600000 ? 'birazdan' : 'yarın') : Math.round(dk / DAY) + ' gün sonra'; };
    const kopf = ses.karisikOzet && ses.karisikOzet.length > 1
      ? `<div class="ts-baslik">Karışık tekrar · ${ses.karisikOzet.length} konu</div>${ses.karisikOzet.map(o => `<div class="oge"><span class="de">${esc(GR[o.id].kopf.titel)}</span><span class="tr">${o.p}/${o.n} puan · sıradaki tekrar ${sonraki(o.id)}</span></div>`).join('')}`
      : `<div class="ts-baslik">${esc(g.kopf.titel)}</div><div class="soluk">${ses.puan}/${ses.n} puan${ses.setNot || ses.art === 'derin' ? ` · sıradaki tekrar ${gun === 0 ? 'yarın' : gun === 1 ? 'yarın' : gun + ' gün sonra'}` : ' · hayalet tekrar'}</div>`;
    // "5 tane daha": bu sette en çok hata yapılan konudan (yoksa bu konudan)
    const hataSay = {}; ses.erg.forEach(e => { if (e.not < 3 && GR[e.konu]) hataSay[e.konu] = (hataSay[e.konu] || 0) + 1; });
    const dahaId = Object.keys(hataSay).sort((a, b) => hataSay[b] - hataSay[a])[0] || (GR[ses.id] ? ses.id : null);
    const dahaBtn = dahaId && ses.art !== 'deneme' && ses.art !== 'derin' ? `<button class="btn" data-g="derin" data-id="${dahaId}" type="button">${esc(GR[dahaId].kopf.titel.split(':')[0])}: boylu boyuna çalış</button>` : '';
    // boylu boyuna oturumu: bölüm bölüm durum + devam
    const dz = ses.art === 'derin' ? ses.derin : null, dzO = dz && derinOzet(dz);
    const derinHTML = dz ? `<div class="g-derin-son">${Object.keys(dz.teil).map(k => { const t = dz.teil[k]; return `<div class="oge"><span class="de">${t.tamam && !t.tukendi ? '✓' : ['', '●○○', '●●○', '●●●'][t.z]} ${esc((g.teile[k] || {}).name || k)}</span><span class="tr">${t.d} doğru · ${t.y} yanlış${t.tukendi ? ' · alıştırma bitti' : ''}</span></div>`; }).join('')}</div>` : '';
    const devamBtn = dz && dzO.kalan ? `<button class="btn ana" data-g="derin-devam" type="button">Devam et (${dzO.kalan} bölüm kaldı)</button>` : '';
    el().innerHTML = `<div class="tur-sonu"><div class="ts-rozet">${ses.setNot === 3 ? '🏆' : ses.setNot === 2 ? '👍' : ses.art === 'ghost' ? '👻' : '🌱'}</div>
      ${kopf}${dz ? `<div class="kural">${dzO.tamam === dzO.toplam ? `Bütün bölümler tamam (${dzO.toplam}/${dzO.toplam}) 🎉` : `${dzO.tamam}/${dzO.toplam} bölüm tamam${dzO.kalan ? '' : ' · kalan bölümlerde alıştırma bitti (gece yenileri yazılır)'}`}</div>${derinHTML}` : ''}
      ${zayif.length ? `<div class="kural">Zayıf kaldı: ${zayif.map(esc).join(', ')} → kısa aralıkla yeniden gelecek.</div>` : ''}
      <div class="sira ts-btns">${devamBtn}${by ? `<button class="btn${devamBtn ? '' : ' ana'}" data-g="ac" data-id="${by}" type="button">Bugünün yeni konusu: ${esc(GR[by].kopf.titel)}</button>` : ''}${dahaDue.length ? `<button class="btn${by || devamBtn ? '' : ' ana'}" data-g="tekrar" data-id="${dahaDue[0]}" type="button">Sıradaki konu: ${esc(GR[dahaDue[0]].kopf.titel)}</button>` : ''}${ek ? `<button class="btn" data-g="ac" data-id="${ek}" type="button">İstersen +1 yeni konu: ${esc(GR[ek].kopf.titel)}</button>` : ''}${dahaBtn}<button class="btn${dahaDue.length || by || devamBtn ? '' : ' ana'}" data-g="liste" type="button">Konu listesi</button><button class="btn" data-g="oku" data-id="${ses.id}" type="button">Kuralı oku</button></div></div>`;
    if (ses.setNot === 3 && api.konfeti) api.konfeti();
  }

  // ---------- olaylar ----------
  function klick(e) {
    const b = e && e.target && e.target.closest('[data-g]'); if (!b) return false;
    const a = b.dataset.g, id = b.dataset.id;
    if (a === 'liste') { ses = { ekran: 'liste' }; render(); }
    else if (a === 'oku') { ses = { ekran: 'tanit', id, sonra: 'liste' }; render(); }
    else if (a === 'ac') yeniAc(id);
    else if (a === 'tani') taniBaslat();
    else if (a === 'tani-basla') { ses = { tani: { n: 0, d: 0, biliyor: [], zayif: [], basla: now() } }; taniIleri(); }
    else if (a === 'blok') blokBaslat();
    else if (a === 'giris-basla') { const sek = ses.tanitBasi ? Math.round((now() - ses.tanitBasi) / 1000) : 0; if (sek) api.logEintrag({ modus: 'gram', id: 'g:' + ses.id, item: GR[ses.id].kopf.titel, frage: 'okudu', antwort: '', ergebnis: 'gelesen', loesung: '', notiz: `sek:${sek}` }); derinBaslat(ses.id, true); }
    else if (a === 'tekrar') baslatSet(id, 'tekrar', tekrarSeti(id));
    else if (a === 'derin') derinBaslat(id, false);
    else if (a === 'derin-devam') derinBaslat(ses.id, false, ses.derin);
    else if (a === 'derin-bitir') { const q = ses.q; if (q && q.done && !q.notlandi) notla(q.oneri); if (ses.ekran === 'ueb' && ses.art === 'derin') { if (ses.erg.length) setBitti(); else { ses = { ekran: 'liste' }; render(); } } }
    else if (a === 'karisik') karisikBaslat();
    else if (a === 'ghost-basla') ghostBaslat();
    else if (a === 'ses') api.sprich(b.dataset.metin);
    else if (a === 'ipucu') { ses.q.ipucu = true; renderUebung(); }
    else if (a === 'sec') cevapla(b.dataset.v);
    else if (a === 'kontrol') kontrol();
    else if (a === 'bilmiyorum') cevapla('', true);
    else if (a === 'parca') { ses.q.secim.push(+b.dataset.i); renderUebung(); }
    else if (a === 'geri') { ses.q.secim = ses.q.secim.filter(i => i !== +b.dataset.i); renderUebung(); }
    else if (a === 'geri-son') { ses.q.secim.pop(); renderUebung(); }
    else if (a === 'tok') { ses.q.tok = +b.dataset.i; cevapla('tok'); }
    else if (a === 'hata-yok') cevapla('-');
    else if (a === 'dinle') { const u = ses.set[ses.i]; api.sprich(u.soru, b.dataset.hiz === 'yavas' ? 0.65 : 0.9); const i = el().querySelector('#cevap'); if (i && api.odakla()) i.focus(); }
    else if (a === 'es-sol') esSol(+b.dataset.i);
    else if (a === 'es-sag') esSag(+b.dataset.j);
    else if (a === 'kat') { if (!ses.q.done) { ses.q.kat[+b.dataset.k] = +b.dataset.gi; renderUebung(); } }
    else if (a === 'not') notla(+b.dataset.n);
    else return false;
    return true;
  }
  // eslestir: sola dokun → seç (eşliyse eşi boz); sağa dokun → seçili solla eşle (eşliyse eşi boz). Sonraki eşsiz sol kendiliğinden seçilir.
  const sonrakiSol = (u, q) => { const i = u.sol.findIndex((_, k) => q.es[k] == null); return i === -1 ? null : i; };
  function esSol(i) {
    const q = ses.q, u = ses.set[ses.i]; if (!q || q.done) return;
    if (q.es[i] != null) delete q.es[i];
    q.solSec = i; renderUebung();
  }
  function esSag(j) {
    const q = ses.q, u = ses.set[ses.i]; if (!q || q.done) return;
    const k = Object.keys(q.es).find(i => q.es[i] === j);
    if (k != null) { delete q.es[k]; q.solSec = +k; return renderUebung(); }
    if (q.solSec == null || q.es[q.solSec] != null) q.solSec = sonrakiSol(u, q);
    if (q.solSec == null) return;
    q.es[q.solSec] = j; q.solSec = sonrakiSol(u, q); renderUebung();
  }
  function kontrol() {
    const q = ses.q, u = ses.set[ses.i];
    if (!q || q.done) return;
    if (u.tur === 'ordnen') { if (q.secim.length === q.parcalar.length) cevapla(); return; }
    if (u.tur === 'eslestir') { if (Object.keys(q.es || {}).length === u.sol.length) cevapla(); return; }
    if (u.tur === 'kategori') { if (q.ogeler && q.ogeler.every((_, k) => q.kat[k] != null)) cevapla(); return; }
    const inp = el().querySelector('.g-tam') || el().querySelector('.g-inp');
    if (u.tur === 'luecke' || u.tur === 'text') { if (Array.from(el().querySelectorAll('.g-inp')).some(i => i.value.trim())) cevapla(''); return; }
    if (u.tur === 'ceviri' || u.tur === 'dinle') { if (inp && inp.value.trim()) cevapla(inp.value.trim()); return; }
    if (inp) cevapla(inp.value.trim());
  }
  function tus(e) {
    if (!ses) return false;
    if (e.key === 'Enter') {
      if (ses.ekran === 'tanit') { e.preventDefault(); klick({ target: el().querySelector('[data-g="giris-basla"], [data-g="liste"]') }); return true; }
      if (ses.ekran === 'son' || ses.ekran === 'tani-son') { e.preventDefault(); const b = el().querySelector('.ts-btns .btn.ana'); if (b) klick({ target: b }); return true; }
      if (ses.ekran === 'tani-giris') { e.preventDefault(); klick({ target: el().querySelector('[data-g="tani-basla"]') }); return true; }
      if (ses.ekran === 'ueb') {
        e.preventDefault();
        if (ses.q && ses.q.done) { notla(ses.q.oneri); return true; }
        // text: odaktaki boşluktan sonra boş kutu varsa ona geç, yoksa kontrol
        const u = ses.set[ses.i];
        if (u && u.tur === 'text' && e.target && e.target.classList && e.target.classList.contains('g-inp')) {
          const ins = Array.from(el().querySelectorAll('.g-inp')), i = ins.indexOf(e.target), bos = ins.slice(i + 1).find(x => !x.value.trim());
          if (bos) { bos.focus(); return true; }
        }
        kontrol(); return true;
      }
    }
    // eslestir: rakam = sağdaki sıradaki öğe (seçili sol ile eşle); kategori: rakam = sıradaki öğenin grubu
    if (ses.ekran === 'ueb' && ses.q && !ses.q.done && /^[1-9]$/.test(e.key) && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
      const u = ses.set[ses.i], q = ses.q, k = +e.key - 1;
      if (u.tur === 'eslestir' && q.sagSira && k < q.sagSira.length) { esSag(q.sagSira[k]); return true; }
      if (u.tur === 'kategori' && q.ogeler && k < u.gruplar.length) { const a = q.ogeler.findIndex((_, i) => q.kat[i] == null); if (a !== -1) { q.kat[a] = k; renderUebung(); } return true; }
    }
    if (ses.ekran === 'ueb' && ses.q && !ses.q.done && e.key === '0' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { cevapla('', true); return true; }
    if (ses.ekran === 'ueb' && ses.art !== 'tani' && ses.q && ses.q.done && /^[123]$/.test(e.key) && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { notla(+e.key); return true; }
    return false;
  }
  // karışık tekrar: vadeli konulardan dönüşümlü (A, B, C, A, …), aynı konudan art arda en çok 2
  // limit: en çok bu kadar konu (vadesi en eski önce); ghostN: araya serpilen hazır hayalet sayısı (günün bloğu)
  function karisikBaslat(limit, ghostN) {
    let due = Object.keys(GR).filter(id => vadeli(id)).sort((a, b) => konuSt(a).karte.due - konuSt(b).karte.due);
    if (limit) due = due.slice(0, limit);
    const ghosts = ghostN ? hayaletHazir().slice(0, ghostN).map(k => { const [id, kod] = k.split(':'); const u = GR[id] ? ghostUebung(id, kod, st().ghost[k].son) : null; return u ? { id, u, ghost: k } : null; }).filter(Boolean) : [];
    if (!due.length && !ghosts.length) return false;
    const setler = due.map(id => ({ id, set: tekrarSeti(id), i: 0 }));
    const sira = []; let kaldi = true;
    while (kaldi) { kaldi = false; setler.forEach(s => { if (s.i < s.set.length) { sira.push({ id: s.id, u: s.set[s.i++] }); kaldi = true; } }); }
    ghosts.forEach((x, i) => sira.splice(Math.min(sira.length, 2 + i * 4), 0, x));
    ses = { ekran: 'ueb', karisik: setler.map(s => ({ id: s.id, erg: [] })), sira, k: 0, sonId: (due[0] || ghosts[0].id) };
    karisikAdim();
    return true;
  }
  function karisikAdim() {
    // her alıştırma kendi konusunun seti gibi tek tek koşulur; set sonunda konu başına FSRS
    const kar = ses.karisik, sira = ses.sira;
    if (ses.k >= sira.length) { karisikBitir(kar); return; }
    const x = sira[ses.k++];
    const erg = x.ghost ? [] : kar.find(s => s.id === x.id).erg;   // hayalet konu kartını değiştirmez
    ses = Object.assign(ses, { ekran: 'ueb', id: x.id, art: x.ghost ? 'ghost' : 'tekrar', set: [x.u], i: 0, erg, q: null, karisikDevam: true });
    render();
  }
  function karisikBitir(kar) {
    const t = now(); let toplam = 0, n = 0;
    const ozetler = [];
    kar.forEach(s => { if (!s.erg.length) return; const ks = konuSt(s.id); const p = s.erg.reduce((a, e) => a + (e.not === 3 ? 1 : e.not === 2 ? 0.5 : 0), 0); const o = p / s.erg.length; const nt = o >= 0.8 ? 3 : o >= 0.5 ? 2 : 1;
      ozetler.push({ id: s.id, p, n: s.erg.length, nt });
      ks.karte = api.FSRS.review(ks.karte && ks.karte.S ? ks.karte : {}, nt, t, api.ret()); if (nt === 1) ks.karte.due = Math.min(ks.karte.due, t + DAY); sprintVade(ks.karte, t);
      api.logEintrag({ modus: 'gram', id: 'g:' + s.id, item: GR[s.id].kopf.titel, frage: 'tekrar', antwort: '', ergebnis: ['', 'falsch', 'fast', 'richtig'][nt], loesung: '', notiz: `puan:${p}/${s.erg.length} | karışık` }); toplam += p; n += s.erg.length; });
    if (ozetler.length) gunIs('set');
    api.save();
    ses = { ekran: 'son', id: ozetler.length ? ozetler[0].id : ses.sonId, erg: kar.flatMap(s => s.erg), puan: toplam, n, setNot: n ? (toplam / n >= 0.8 ? 3 : toplam / n >= 0.5 ? 2 : 1) : null, art: n ? 'tekrar' : 'ghost', karisikOzet: ozetler };
    render();
  }
  function ghostBaslat() {
    const keys = hayaletHazir(); if (!keys.length) return;
    const g = st().ghost, [id, kod] = keys[0].split(':'), u = ghostUebung(id, kod, g[keys[0]].son);
    if (!u) { delete g[keys[0]]; return render(); }
    ses = { ekran: 'ueb', id, art: 'ghost', set: [u], i: 0, erg: [], q: null };
    render();
  }
  // notla → set bitince: karışık moddaysa sıradaki alıştırmaya
  const _setBitti = setBitti;
  setBitti = function () { if (ses && ses.karisikDevam) { karisikAdim(); return; } _setBitti(); };

  // ---------- yeni konu, tanı oturumu, günün bloğu ----------
  function yeniAc(id) {
    if (!GR[id]) return;
    const ks = konuSt(id);
    if (!ks.acildi) { ks.acildi = now(); ks.kaynak = sprintAktif() ? 'sprint' : 'el'; api.save(); api.logEintrag({ modus: 'gram', id: 'g:' + id, item: GR[id].kopf.titel, frage: 'tanıtım', antwort: '', ergebnis: 'neu', loesung: '', notiz: '' }); }
    ses = { ekran: 'tanit', id, sonra: 'giris' }; render();
  }
  function taniBaslat() { ses = { ekran: 'tani-giris' }; render(); }
  // sıradaki test maddesi; oturum ~25 maddede biter (yarım konu tamamlanır)
  function taniIleri() {
    const o = ses.tani, sq = taniSoru();
    if (!sq || !sq.u || (o.n >= TANI_OTURUM && sq.sira === 1)) return taniBitir();
    ses = { ekran: 'ueb', art: 'tani', id: sq.konu, set: [sq.u], i: 0, erg: [], q: null, tani: o, taniSira: sq.sira };
    render();
  }
  function taniBitir() {
    const o = ses.tani, d = taniDurum(), T = taniSt();
    if (o.n) {
      T.oturum = (T.oturum || 0) + 1;
      api.logEintrag({ modus: 'gram', id: 'g:tani', item: 'Gramer testi', frage: `oturum:${T.oturum}`, antwort: '', ergebnis: d.bitti ? 'bitti' : 'ara', loesung: '',
        notiz: `puan:${o.d}/${o.n} | konu:${d.yapilan}/${d.toplam} | biliyor:${o.biliyor.join(',')} | zayif:${o.zayif.join(',')} | dk:${Math.max(1, Math.round((now() - o.basla) / 60000))}` });
      gunIs('tani');
    }
    api.save();
    ses = { ekran: 'tani-son', tani: o }; render();
  }
  function renderTaniGiris() {
    const d = taniDurum();
    el().innerHTML = `<div class="tur"><span class="yeni">gramer · test</span><span>${d.yapilan}/${d.toplam} konu</span></div>
      <div class="soru">Gramer testi</div><div class="soluk">B1'in bütün konuları: ne biliyorsun, ne öğrenilecek?</div>
      <div class="g-erkl"><p>Her konudan 1–2 kısa soru, yazarak. Bilmiyorsan „Bilmiyorum“ de, tahmin etme: test bilmediğini bulmak için.</p>
      <p>İki sorusu da doğru (ipucusuz) olan konu açılır; ilk tekrarı 4–5 gün sonra, orada yine sınanır. Zayıf çıkanlar sprint sırasına girer: her gün biri öğretilir.</p></div>
      <div class="soluk">Bu oturum ~${TANI_OTURUM} soru (~8 dk)${d.yapilan ? ' · kaldığın yerden' : ''}</div>
      <div class="sira"><button class="btn ana devam-btn" data-g="tani-basla" type="button">${d.yapilan ? 'Devam et' : 'Başla'} <kbd>Enter</kbd></button><button class="btn" data-g="liste" type="button">Konu listesi</button></div>`;
  }
  function renderTaniSon() {
    const o = ses.tani, d = taniDurum(), ad = id => esc(GR[id].kopf.titel), y = bugunYeni(), yeni = y && !acik(y) ? y : null;
    const kisa = ids => ids.slice(0, 4).map(ad).join(' · ') + (ids.length > 4 ? ` <span class="soluk">+ ${ids.length - 4} konu</span>` : '');
    el().innerHTML = `<div class="tur-sonu"><div class="ts-rozet">📝</div><div class="ts-baslik">Gramer testi · ${d.bitti ? 'bitti' : `${d.yapilan}/${d.toplam} konu`}</div>
      <div class="soluk">${o.d}/${o.n} soru doğru</div>
      ${o.biliyor.length ? `<div class="kural">Biliyorsun: ${o.biliyor.length} konu (açıldı, ilk tekrar 4–5 gün sonra): ${kisa(o.biliyor)}</div>` : ''}
      ${o.zayif.length ? `<div class="kural">Öğrenilecek: ${o.zayif.length} konu (sprint sırasına girdi): ${kisa(o.zayif)}</div>` : ''}
      ${d.bitti ? '' : `<p class="aciklama">Kalan ${d.toplam - d.yapilan} konu: sonraki gramer bloğunda kaldığın yerden.</p>`}
      <div class="sira ts-btns"><button class="btn ana" data-g="liste" type="button">Tamam</button>${yeni ? `<button class="btn" data-g="ac" data-id="${yeni}" type="button">İstersen yeni konu: ${ad(yeni)}</button>` : ''}${d.bitti ? '' : '<button class="btn" data-g="tani-basla" type="button">İstersen teste devam</button>'}</div></div>`;
  }
  // günün bloğu (S2): test bitmediyse test oturumu (kaldığı yerden); yoksa vadeli konuların karışık tekrarı (en çok 5 konu + 3 hayalet),
  // ardından bugünün yeni konusu (tanıtım + giriş seti). Çağıran: app, starte('gram') sonrası.
  let blok = null;
  const blokYeni = () => { const y = blok && blok.gun === gun() && blok.yeni; return y && GR[y] && !(acik(y) && konuSt(y).karte) ? y : null; };
  function blokBaslat() {
    if (!api) return;
    st();
    if (!taniDurum().bitti) return taniBaslat();
    const y = bugunYeni();
    blok = { gun: gun(), yeni: y && !(acik(y) && konuSt(y).karte) ? y : null };
    if (karisikBaslat(5, 3)) return;
    if (blok.yeni) return yeniAc(blok.yeni);
    ses = { ekran: 'liste' }; render();
  }

  // ---------- Çalış akışı için dış arayüz ----------
  // vadeli konu sayısı / hayalet; Bugün ekranı ve plan buradan okur
  const ozet = () => ({ due: Object.keys(GR).filter(id => vadeli(id)).length, acik: Object.keys(GR).filter(id => acik(id)).length, ghost: hayaletHazir().length, toplam: Object.keys(GR).length });
  function init(a) { api = a; S = null; turCache = null; if (api.S) st(); }
  function yenile() { if (api && api.S) st(); }
  // test / önizleme: belirli alıştırmaları sırayla göster (FSRS'e ve hayalete yazmaz, log'a yazar)
  function dene(id, nler) { const set = (nler || []).map(n => (GR[id].uebungen || []).find(u => u.n === n)).filter(Boolean); baslatSet(id, 'deneme', set); }
  // konunun kural sayfası (Zayıflar → Bilmediklerim'den)
  function oku(id) { if (!GR[id]) return; ses = { ekran: 'tanit', id, sonra: 'liste' }; render(); }
  root.Gramer = { init, yenile, render, klick, tus, ozet, reset, GR, vadeli, acik, pruef, yazarak, loesung, oku, tekrarSeti: id => tekrarSeti(id), dene,
    // B1 sprinti (S2): durum, günün bloğu, ana turda soru
    SPRINT_SIRA, sprintDurum, blokBaslat, turSorusu, turRender, turKlick, turTus,
    // DOM'suz iç işler (test): tanı sorusu / cevabı, sıra, konu durumu, +1 aday
    _ic: { derinYeni, derinSonraki, derinIsle, taniSoru, taniCevap, taniDurum, sprintSira, konuDurum, ekYeni, bugunAcilan, sprintVade, yeniAc, ses: () => ses } };
})(window);
