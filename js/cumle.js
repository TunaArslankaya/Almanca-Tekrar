// Cümle atölyesi: öğrendiğin kelimelerin (S.items, m.S olan) cümleleriyle üç kademe, oturum başına ~8 görev, karışık:
//   1) Diz: Türkçe cümle + karışık Almanca parçalar → doğru sıraya diz (fiil yeri, yan cümlede fiil sonda).
//   2) Çevir: Türkçe → Almanca tam cümle, hedef kelime verilir; kontrol G.cumleKontrol (yoksa G.pruefen), kelime kelime renkli fark.
//   3) Kur: kelime(ler) + kısa Türkçe durum + yapı görevi → serbest cümle; yalnız biçimsel kontrol, not yok ("gönderildi"), gece Claude düzeltir.
// Hafıza: Kern'e YAZMAZ. Diz'de bütün kelimeler ekranda, Çevir'de hedef kelime veriliyor: ikisi de kelimenin ipucusuz hatırlanması değil;
// yazsaydı basamak kapısı (bm) ipuçlu cevapla açılır, "bedava seviye" olurdu. Kur'a not verilmiyor. Atölye yalnız kendi istatistiğini tutar
// (S.cumle: kademe başarısı → görev karışımı, kullanılan cümleler → tekrar etmesin) ve log'a yazar; düzeltmeyi gece Claude yapar.
// Log modus `cumle`: id `<öğe>:diz|cevir|kur`, frage Türkçe / durum, antwort, ergebnis richtig/fast/falsch | gonderildi, loesung asıl cümle,
// notiz `kademe:… | etiketler | sek:N`; oturum sonu `tur;cumle`.
// Bağlantı: app.js `Cumle.init(api)`; ekran `Cumle.render()`, tıklamalar `[data-ca]` → `Cumle.klick(e)`, klavye `Cumle.tus(e)`, çıkış `Cumle.cik()`.
(function (root) {
  'use strict';
  let api = null, S = null, ses = null;
  const DAY = 86400000, BOY = 8;
  const esc = s => api.esc(s == null ? '' : String(s));
  const de = s => api.deHTML(s == null ? '' : String(s));
  const el = () => api.kart();
  const now = () => api.now();
  const kurz = t => String(t || '').split(';')[0].trim();
  const karistir = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const KADEME_AD = { diz: 'Diz', cevir: 'Çevir', kur: 'Kur' };

  // ---------- durum (S.cumle) ----------
  // { son: {cümle: ts}, oge: {id: ts}, ist: { diz: [puan…], cevir: [puan…] }, kur: n }   puan: 1 doğru, 0,5 küçük hata, 0 yanlış (son 20)
  const st = () => {
    const c = S.cumle = (S.cumle && typeof S.cumle === 'object') ? S.cumle : {};
    c.son = c.son || {}; c.oge = c.oge || {}; c.ist = c.ist || {}; c.ist.diz = c.ist.diz || []; c.ist.cevir = c.ist.cevir || []; c.kur = c.kur || 0;
    return c;
  };
  const oran = k => { const l = st().ist[k]; return l.length >= 5 ? l.reduce((a, b) => a + b, 0) / l.length : null; };
  const istEkle = (k, p) => { const l = st().ist[k]; if (!l) return; l.push(p); if (l.length > 20) l.splice(0, l.length - 20); };

  // ---------- kaynak: öğrenilmiş öğeler + çeviri cümleleri ----------
  function cumleler(id) {
    const k = api.kind(id);
    const l = k === 'v' ? (root.SAETZE && root.SAETZE[id] || []).concat(root.SAETZE_REFL && root.SAETZE_REFL[id] || []) : (root.NSAETZE && root.NSAETZE[id] || []);
    const gor = new Set();
    return l.filter(x => x && x.de && x.tr && !gor.has(x.de) && gor.add(x.de)).map(x => ({ de: String(x.de).trim(), tr: x.tr, alts: Array.isArray(x.alts) ? x.alts.filter(a => a && a !== x.de) : [] }));
  }
  // öğe → konular (Türkçe durum için)
  let _tema = null;
  const temaOf = id => {
    if (!_tema) { _tema = {}; (root.THEMEN || []).forEach(t => (t.items || []).forEach(x => (_tema[x] = _tema[x] || []).push(t.id))); }
    return _tema[id] || [];
  };
  // son 14 günde bu öğede yanlış / küçük hata (log): zayıf öğe önce gelir
  function hataSay() {
    const sinir = api.tag(now() - 14 * DAY), out = {};
    (S.log || []).forEach(e => {
      if (!e || !e.zeit || e.zeit.slice(0, 10) < sinir || !e.id || (e.ergebnis !== 'falsch' && e.ergebnis !== 'fast')) return;
      const id = String(e.id).split(':')[0]; out[id] = Math.min(3, (out[id] || 0) + 1);
    });
    return out;
  }
  function havuz() {
    const out = [], hata = hataSay();
    Object.keys(S.items || {}).forEach(id => {
      const it = S.items[id], m = it && it.m;
      if (!m || !m.S || api.kind(id) === 'p') return;
      try { api.label(id); } catch (e) { return; }   // listede olmayan (eski) öğe
      const sz = cumleler(id);
      out.push({ id, S: m.S, bm: m.bm || 0, sz, hata: hata[id] || 0 });
    });
    return out;
  }
  const tazeMi = (x, gun) => !(st().son[x.de] && now() - st().son[x.de] < gun * DAY);

  // ---------- Diz: parçalar ----------
  const DET = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|kein|keine|keinen|keinem|keiner|keines|mein|meine|meinen|meinem|meiner|meines|dein|deine|deinen|deinem|deiner|deines|seine|seinen|seinem|seiner|seines|ihre|ihren|ihrem|ihrer|ihres|unser|unsere|unseren|unserem|unserer|unseres|eure|euren|eurem|eurer|eures|diese|dieser|diesen|diesem|dieses|jede|jeder|jeden|jedem|jedes|welche|welcher|welchen|welchem|welches)$/i;
  const PRAEP = /^(an|am|ans|auf|aufs|aus|bei|beim|durch|für|gegen|hinter|in|im|ins|mit|nach|neben|ohne|über|unter|von|vom|vor|wegen|zu|zum|zur|zwischen)$/i;
  const RESMI = /^(Sie|Ihnen|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres)$/;
  const buyuk = w => /^\p{Lu}/u.test(w);
  let _klein = null;
  // cümle ortasında küçük harfle geçen kelimeler: cümle başındaki parça küçültülür (sırayı ele vermesin); isim ve resmî Sie büyük kalır
  function kleinSet() {
    if (_klein) return _klein;
    _klein = new Set();
    [root.SAETZE, root.NSAETZE, root.SAETZE_REFL].forEach(o => Object.values(o || {}).forEach(l => (l || []).forEach(x => String(x.de || '').split(/\s+/).slice(1).forEach(w => { if (/^\p{Ll}/u.test(w)) _klein.add(w.replace(/[.,!?;:„“"”]+$/g, '')); }))));
    return _klein;
  }
  const temizle = s => String(s || '').replace(/[„“"”«»]/g, '').replace(/,/g, ' ').replace(/\s*[.!?]+\s*$/, '').replace(/\s+/g, ' ').trim();
  const dizNorm = s => temizle(s).toLowerCase();
  function dizParcala(cumle) {
    const t = String(cumle || '').trim();
    const ic = t.replace(/[.!?]+$/, '').replace(/(\p{L})-(\p{L})/gu, '$1$2');
    if (/[:;()–—\-"„“.!?]/.test(ic)) return null;   // iç noktalama (iki cümle, kısaltma, tırnak) parçayı ele verir
    // iki ana cümle virgülle (… , wir sollten …): sıra iki türlü de doğru olabilir → diz'e alınmaz; yan cümle / ilgi cümlesi alınır
    if (/,/.test(t) && !(NS_RE.test(t) || REL_RE.test(t))) return null;
    const son = (t.match(/[.!?]$/) || ['.'])[0];
    const w = temizle(t).split(' ').filter(Boolean);
    if (w.length < 4 || w.length > 14) return null;
    // artikel / iyelik + (sıfat) + isim tek parça: "der nächsten Kreuzung"
    let p = [];
    for (let i = 0; i < w.length; i++) {
      if (DET.test(w[i])) {
        let j = i + 1, ok = -1;
        while (j < w.length && j <= i + 3) { if (buyuk(w[j])) { ok = j; break; } if (DET.test(w[j]) || PRAEP.test(w[j])) break; j++; }
        if (ok > 0) { p.push(w.slice(i, ok + 1).join(' ')); i = ok; continue; }
      }
      p.push(w[i]);
    }
    // çok parça: edat sonraki parçayla birleşir ("an der nächsten Kreuzung")
    if (p.length > 9) {
      const q = [];
      for (let i = 0; i < p.length; i++) { if (PRAEP.test(p[i]) && i + 1 < p.length && (DET.test(p[i + 1].split(' ')[0]) || buyuk(p[i + 1]))) { q.push(p[i] + ' ' + p[i + 1]); i++; } else q.push(p[i]); }
      p = q;
    }
    if (p.length < 4 || p.length > 10) return null;
    const ilk = p[0].split(' '), w0 = ilk[0];
    if (!RESMI.test(w0) && kleinSet().has(w0.charAt(0).toLowerCase() + w0.slice(1))) { ilk[0] = w0.charAt(0).toLowerCase() + w0.slice(1); p[0] = ilk.join(' '); }
    // karıştır: doğru sıra ve ilk parçası yerinde olan karışım olmasın (2 parça aynıysa bir kez daha)
    let k = karistir(p.map((x, i) => i)), deneme = 0;
    while (deneme++ < 12 && (k[0] === 0 || k.every((x, i) => p[x] === p[i]))) k = karistir(k);
    return { parca: k.map(i => p[i]), dogru: p, son };
  }
  // cümlenin yapısından kısa kural notu (doğru olan genel kurallar; yalnız cümlede görülen yapı)
  const NS_RE = /(^|,\s*)(weil|dass|wenn|ob|obwohl|als|damit|nachdem|bevor|während|bis|seit|seitdem|falls|sobald|solange|sodass)\s/i;
  const REL_RE = /,\s*(der|die|das|den|dem|deren|dessen|denen|wo|was)\s/i;
  const W_RE = /^(wer|wen|wem|was|wann|wo|wohin|woher|wie|warum|weshalb|wieso|welche|welcher|welches|welchen|welchem|wozu|womit|worauf|worüber|wofür)\b/i;
  const MODAL_RE = /\b(muss|musst|müssen|müsst|musste|mussten|kann|kannst|können|könnt|konnte|konnten|könnte|könnten|will|willst|wollen|wollt|wollte|wollten|soll|sollst|sollen|sollt|sollte|sollten|darf|darfst|dürfen|dürft|durfte|durften|möchte|möchtest|möchten|möchtet)\b/i;
  const AUX_RE = /\b(habe|hast|hat|haben|habt|hatte|hatten|bin|bist|ist|sind|seid|war|waren)\b/i;
  const PART_RE = /^(\p{L}*ge\p{L}{2,}(t|en)|\p{L}+iert)$/u;
  function kuralNotu(c) {
    const t = String(c || '').trim(), notlar = [], w = temizle(t).split(' ');
    const ns = t.match(NS_RE);
    if (ns) notlar.push(`„${ns[2].toLowerCase()}“ ile başlayan yan cümlede çekimli fiil en sona gider.`);
    else if (REL_RE.test(t)) notlar.push('İlgi cümlesinde (…, der / die / das …) çekimli fiil en sona gider.');
    if (/\?$/.test(t)) notlar.push(W_RE.test(t) ? 'W-sorusu: soru kelimesi başta, çekimli fiil hemen arkasında.' : 'Evet / hayır sorusu: çekimli fiil başta.');
    else if (MODAL_RE.test(t)) notlar.push('Modal fiil (können, müssen …) 2. sırada, mastar en sonda.');
    else if (AUX_RE.test(t) && w.some(x => PART_RE.test(x))) notlar.push('Perfekt: haben / sein 2. sırada, Partizip II en sonda.');
    else if (!ns) notlar.push('Ana cümlede çekimli fiil 2. sırada (başta ne olursa olsun).');
    return notlar.slice(0, 2);
  }

  // ---------- kontrol (sözleşme: G.cumleKontrol; yoksa G.pruefen'den aynı biçim) ----------
  const fold = s => String(s || '').toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
  const kelimeTemiz = w => String(w || '').replace(/^[„“"(]+|[.,!?;:“"”)…]+$/g, '');
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const yakin = (w, d) => { const a = fold(w), b = fold(d); return a === b || (b.length >= 4 && lev(a, b) === 1 && a.slice(-2) === b.slice(-2)); };
  // hedef biçimin her parçası cevapta var mı (büyük/küçük ve umlaut yazımı fark etmez)
  const hedefVar = (giris, hedef) => { if (!hedef) return true; const u = new Set(String(giris).split(/\s+/).map(x => fold(kelimeTemiz(x)))); return String(hedef).split(/\s+/).every(h => u.has(fold(kelimeTemiz(h)))); };
  function kontrol(giris, hedefler, opts) {
    const G = api.G || root.G;
    if (G && typeof G.cumleKontrol === 'function') {
      try { const r = G.cumleKontrol(giris, hedefler, opts || {}); if (r && r.urteil) return Object.assign({ tags: [], diff: [] }, r, { motor: 'cumleKontrol' }); } catch (e) { console.warn('cumleKontrol', e); }
    }
    const r = G.pruefen(giris, hedefler[0], hedefler.slice(1));
    const ops = r.diff || [], out = [];
    for (let i = 0; i < ops.length; i++) {
      const o = ops[i], n = ops[i + 1];
      if (o.op === 'eq') out.push({ t: 'ok', w: o.t, d: o.t });
      else if (o.op === 'ins' && n && n.op === 'del') { out.push({ t: yakin(o.t, n.t) ? 'yazim' : 'yanlis', w: o.t, d: n.t }); i++; }
      else if (o.op === 'del' && n && n.op === 'ins') { out.push({ t: yakin(n.t, o.t) ? 'yazim' : 'yanlis', w: n.t, d: o.t }); i++; }
      else if (o.op === 'ins') out.push({ t: 'fazla', w: o.t, d: '' });
      else out.push({ t: 'eksik', w: '', d: o.t });
    }
    // aynı kelime hem fazla hem eksik: yeri yanlış
    out.forEach(x => {
      if (x.t !== 'fazla') return;
      const k = out.findIndex(y => y.t === 'eksik' && y.d.toLowerCase() === x.w.toLowerCase());
      if (k >= 0) { x.t = 'yer'; x.d = out[k].d; out.splice(k, 1); }
    });
    let urteil = r.urteil, tags = (r.tags || []).map(t => t === 'groß/klein' ? 'büyük/küçük harf' : t);
    if (urteil === 'fast' && tags.every(t => t === 'büyük/küçük harf')) { urteil = 'richtig'; tags = []; }
    const h = opts && opts.hedefKelime;
    if (h && urteil !== 'richtig' && !hedefVar(giris, h)) { urteil = 'falsch'; if (!tags.includes('hedef kelime')) tags.push('hedef kelime'); }
    const ok = out.filter(x => x.t === 'ok').length;
    return { urteil, tags, enYakin: r.ziel || hedefler[0], skor: out.length ? ok / out.length : 0, diff: out, motor: 'pruefen' };
  }
  const ETIKET_TR = {
    'fiil yeri': 'Ana cümlede çekimli fiil 2. sırada; yan cümlede (weil, dass, wenn …) en sonda.',
    'kelime sırası': 'Kelimeler doğru, sırası farklı. Fiil yerine ve zaman – sebep – tarz – yer sırasına bak.',
    'artikel/çekim': 'Artikel ya da ek yanlış: ismin cinsiyetine ve hâline (Akk / Dat) bak.',
    'yazım': 'Küçük yazım hatası.',
    'umlaut': 'ä / ö / ü / ß eksik (ae / oe / ue / ss de doğru sayılır).',
    'umlaut/ß': 'ä / ö / ü / ß eksik (ae / oe / ue / ss de doğru sayılır).',
    'eksik kelime': 'Cümlede kelime eksik (yeşil olanlar).',
    'fazla kelime': 'Fazladan kelime var (üstü çizili olanlar).',
    'edat': 'Edat farklı: fiilin ya da ismin aldığı edatı kalıpla öğren.',
    'yardımcı fiil': 'Perfekt: hareket / durum değişimi çoğunlukla sein, diğerleri haben.',
    'dönüşlü zamir': 'Dönüşlü fiil: mich / dich / sich / uns / euch eksik ya da yanlış.',
    'büyük/küçük harf': 'İsimler büyük harfle yazılır.',
    'nicht': 'Olumsuzluk (nicht / kein) eksik ya da farklı.',
    'hedef kelime': 'Verilen kelimeyi kullanmadın ya da başka biçimde yazdın.',
    'kaynaştırma': 'Edat + artikel kaynaşır: in dem → im, zu der → zur.',
    'farklı': 'Cümle beklenenden çok farklı: doğru çeviriye ve fiil yerine bak.',
    'zarf yeri': 'Yalnız zarfın (schon, heute …) yeri farklı. Almancada zarfın yeri biraz esnektir; asıl cümledeki sıra en doğal olanı.',
  };

  // ---------- Kur: durum + yapı ----------
  const TEMA_DURUM = {
    wetter: ['Arkadaşınla hafta sonu planı yapıyorsun; hava önemli.', 'Ailene Bremen\'in havasını anlatıyorsun.'],
    umwelt: ['Ev arkadaşına çöp ve çevre hakkında bir şey söylüyorsun.', 'Kurs arkadaşınla doğada bir geziyi konuşuyorsun.'],
    wohnen: ['Ev sahibine yazıyorsun.', 'Ev arkadaşınla evdeki bir sorunu konuşuyorsun.', 'Yeni komşuna evini anlatıyorsun.'],
    person: ['Kursta kendini ve aileni tanıtıyorsun.', 'Bir arkadaşına kardeşini anlatıyorsun.'],
    beziehungen: ['Bir arkadaşına doğum günü davetine cevap yazıyorsun.', 'Arkadaşınla bir buluşmayı ayarlıyorsun.'],
    gefuehle: ['Arkadaşına bugün nasıl hissettiğini anlatıyorsun.', 'Öğretmenine sınavdan önceki duygularını söylüyorsun.'],
    gesundheit: ['Doktorun muayenehanesini arıyorsun.', 'Öğretmenine bugün neden gelemediğini yazıyorsun.'],
    essen: ['Restoranda garsonla konuşuyorsun.', 'Arkadaşına akşam ne pişireceğini anlatıyorsun.'],
    einkaufen: ['Mağazada bir ürünü geri vermek istiyorsun.', 'Arkadaşına internetten aldığın bir şeyi anlatıyorsun.'],
    reisen: ['Tren istasyonunda bilet ve bağlantı soruyorsun.', 'Arkadaşına son yolculuğunu anlatıyorsun.'],
    dienst: ['Bürgeramt\'ta randevu ve belgeler hakkında konuşuyorsun.', 'Bankaya ya da postaneye bir sorunu anlatıyorsun.'],
    arbeit: ['Bir iş görüşmesinde kendinden bahsediyorsun.', 'Şefine bir rica yazıyorsun.'],
    ausbildung: ['Uni Bremen\'deki danışmana bir soru soruyorsun.', 'Kurs arkadaşına ödev ve sınavı anlatıyorsun.'],
    sprache: ['Kurs arkadaşına Almanca öğrenme yöntemini anlatıyorsun.', 'Öğretmenine bir kelimeyi soruyorsun.'],
    medien: ['Arkadaşına telefonundaki ya da bilgisayarındaki bir sorunu anlatıyorsun.', 'Bir haberi arkadaşına aktarıyorsun.'],
    freizeit: ['Arkadaşına hafta sonu planını anlatıyorsun.', 'Bir kulübe (spor, müzik) üye olmak istiyorsun.'],
    gesellschaft: ['Kursta bir toplumsal konu hakkında fikrini söylüyorsun.', 'Arkadaşınla bir haberi tartışıyorsun.'],
  };
  const GENEL_DURUM = ['Bir arkadaşına günün nasıl geçtiğini anlatıyorsun.', 'Dil kursundaki öğretmenine bir şey soruyorsun.', 'Bremen\'deki günlük hayatından bir şey anlatıyorsun.'];
  const kelimeSay = t => String(t || '').split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
  const YAPI = [
    { k: 'serbest', tr: 'İstediğin yapıyla; en az 8 kelime.', test: t => kelimeSay(t) >= 8, ad: '8+ kelime', zor: 0 },
    { k: 'modal', tr: 'Bir modal fiil kullan (können, müssen, wollen, sollen, dürfen, möchten).', test: t => MODAL_RE.test(t), ad: 'modal fiil', zor: 0 },
    { k: 'perfekt', tr: 'Geçmiş zamanda anlat (Perfekt: haben / sein + Partizip II).', test: t => AUX_RE.test(t) && t.split(/\s+/).some(w => PART_RE.test(kelimeTemiz(w))), ad: 'Perfekt', zor: 0 },
    { k: 'soru', tr: 'Karşındakine bir soru sor.', test: t => /\?\s*$/.test(t), ad: 'soru (?)', zor: 0 },
    { k: 'weil', tr: '„weil“ ile bir neden ekle (yan cümlede fiil sonda).', test: t => /\bweil\b/i.test(t), ad: 'weil', zor: 1 },
    { k: 'dass', tr: '„dass“ ile kur (ör. Ich finde, dass … / Ich hoffe, dass …).', test: t => /\bdass\b/i.test(t), ad: 'dass', zor: 1 },
    { k: 'wenn', tr: '„wenn“ ile bir koşul ekle.', test: t => /\bwenn\b/i.test(t), ad: 'wenn', zor: 1 },
    { k: 'obwohl', tr: '„obwohl“ ile bir karşıtlık ekle.', test: t => /\bobwohl\b/i.test(t), ad: 'obwohl', zor: 1 },
    { k: 'deshalb', tr: '„deshalb“ ile sonucu söyle (deshalb + çekimli fiil).', test: t => /\bdeshalb\b/i.test(t), ad: 'deshalb', zor: 1 },
  ];
  // hedef kelime cümlede var mı (çekimli de olur: app'in wortLuecke'si; isimde küçük harfle yazılmışsa da bulunur)
  function ogeVar(id, t) {
    const s = /[.!?]$/.test(t.trim()) ? t.trim() : t.trim() + '.';
    try {
      if (api.wortLuecke(id, s)) return true;
      if (api.kind(id) === 'n' && api.wortLuecke(id, s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))) return true;
      if (api.kind(id) !== 'n') { const ilkKucuk = s.charAt(0).toLowerCase() + s.slice(1); if (api.wortLuecke(id, ilkKucuk)) return true; }
    } catch (e) { /* yok */ }
    return false;
  }
  function kurKontrol(t, g) {
    t = String(t || '').trim().replace(/\s+/g, ' ');
    const hedef = g.ids.map(id => ({ id, var: ogeVar(id, t) }));
    const n = kelimeSay(t);
    return { hedef, n, uzun: n >= 5, buyuk: /^\p{Lu}/u.test(t), nokta: /[.!?]$/.test(t), yapi: g.yapi.test(t) };
  }
  const kurEksik = k => k.hedef.some(h => !h.var) || !k.uzun || !k.yapi;

  // ---------- oturum planı ----------
  function plan(adaylar) {
    const o = oran('diz'), c = oran('cevir'), kurOk = adaylar.some(a => a.S >= 7 || a.bm >= 2);
    let p = o != null && o >= 0.85 && c != null && c >= 0.7 ? ['diz', 'cevir', 'kur', 'cevir', 'kur', 'cevir', 'cevir', 'kur']
      : o != null && o >= 0.85 ? ['diz', 'cevir', 'diz', 'cevir', 'kur', 'cevir', 'cevir', 'kur']
        : ['diz', 'diz', 'cevir', 'diz', 'cevir', 'kur', 'cevir', 'kur'];
    if (!kurOk) p = p.map(k => k === 'kur' ? 'cevir' : k);
    return p.slice(0, BOY);
  }
  function agirlikliSec(l, w) {
    const ws = l.map(w), top = ws.reduce((a, b) => a + b, 0);
    if (!(top > 0)) return null;
    let r = Math.random() * top;
    for (let i = 0; i < l.length; i++) { r -= ws[i]; if (r <= 0) return l[i]; }
    return l[l.length - 1];
  }
  // cümle zorluğu: kelime sayısı + yan cümle / modal / Perfekt
  const zorluk = c => temizle(c).split(' ').length + (NS_RE.test(c) || REL_RE.test(c) ? 4 : 0) + (MODAL_RE.test(c) || AUX_RE.test(c) ? 2 : 0);
  function gorevKur(kademe, adaylar, kullanilan, kurSira) {
    const oge = st().oge, t = now();
    const temel = a => (1 + 1.5 * a.hata) * (oge[a.id] && t - oge[a.id] < 2 * DAY ? 0.3 : 1);
    const uygun = adaylar.filter(a => !kullanilan.has(a.id));
    if (kademe === 'diz') {
      const zor = (oran('diz') || 0) >= 0.85;
      const l = uygun.map(a => {
        const sz = a.sz.filter(x => tazeMi(x, 5)).concat(a.sz.filter(x => !tazeMi(x, 5))).map(x => ({ x, d: dizParcala(x.de) })).filter(y => y.d);
        return { a, sz };
      }).filter(y => y.sz.length);
      const s = agirlikliSec(l, y => temel(y.a) * (y.a.bm <= 1 ? 2 : 1));
      if (!s) return null;
      const taze = s.sz.filter(y => tazeMi(y.x, 5)), h = taze.length ? taze : s.sz;
      const y = zor ? h.slice().sort((p, q) => zorluk(q.x.de) - zorluk(p.x.de))[0] : h[Math.floor(Math.random() * h.length)];
      return { kademe, id: s.a.id, x: y.x, d: y.d, secim: [] };
    }
    if (kademe === 'cevir') {
      const l = uygun.map(a => ({ a, sz: a.sz.filter(x => temizle(x.de).split(' ').length <= 18) })).filter(y => y.sz.length);
      const s = agirlikliSec(l, y => temel(y.a) * (y.a.bm >= 2 ? 1.5 : 1));
      if (!s) return null;
      const taze = s.sz.filter(x => tazeMi(x, 5)), h = taze.length ? taze : s.sz;
      const x = h[Math.floor(Math.random() * h.length)];
      let hedef = '';
      try { const lk = api.wortLuecke(s.a.id, x.de); hedef = lk ? lk.answer : ''; } catch (e) { hedef = ''; }
      return { kademe, id: s.a.id, x, hedef };
    }
    // kur: anlamı oturmuş öğe (S ≥ 7 ya da yazma basamağını geçmiş); ikinci kurda aynı konudan ikinci kelime
    const l = uygun.filter(a => a.S >= 7 || a.bm >= 2);
    const s = agirlikliSec(l, a => temel(a) * (a.bm >= 3 ? 2 : 1));
    if (!s) return null;
    const temalar = temaOf(s.id), tema = temalar[Math.floor(Math.random() * temalar.length)] || null;
    const ids = [s.id];
    if (kurSira >= 1 && tema) {
      const th = (root.THEMEN || []).find(x => x.id === tema), set = new Set(th ? th.items : []);
      const ek = adaylar.filter(a => a.id !== s.id && set.has(a.id) && !kullanilan.has(a.id) && a.S >= 3 && api.kind(a.id) !== api.kind(s.id));
      const e2 = ek.length ? ek[Math.floor(Math.random() * ek.length)] : null;
      if (e2) ids.push(e2.id);
    }
    const dl = (tema && TEMA_DURUM[tema]) || GENEL_DURUM, durum = dl[Math.floor(Math.random() * dl.length)];
    const zor = st().kur >= 3 ? 1 : 0, sonYapi = st().sonYapi;
    const yl = YAPI.filter(y => y.zor <= zor && y.k !== sonYapi), yapi = yl[Math.floor(Math.random() * yl.length)] || YAPI[0];
    const thAd = tema ? ((root.THEMEN || []).find(x => x.id === tema) || {}).tr : '';
    return { kademe: 'kur', id: s.id, ids, tema: thAd, durum, yapi, ornek: s.sz.length ? s.sz[Math.floor(Math.random() * s.sz.length)] : null };
  }
  function basla() {
    const adaylar = havuz().filter(a => a.sz.length);
    const p = plan(adaylar), kullanilan = new Set(), gorevler = [];
    let kurSira = 0;
    p.forEach(k => {
      let g = gorevKur(k, adaylar, kullanilan, kurSira);
      if (!g && k !== 'cevir') g = gorevKur('cevir', adaylar, kullanilan, kurSira);
      if (!g) return;
      if (g.kademe === 'kur') kurSira++;
      g.ids ? g.ids.forEach(i => kullanilan.add(i)) : kullanilan.add(g.id);
      gorevler.push(g);
    });
    if (!gorevler.length) { ses = { ekran: 'bos' }; return render(); }
    // eski cümle kayıtlarını temizle (30 gün)
    const c = st(); Object.keys(c.son).forEach(k => { if (now() - c.son[k] > 30 * DAY) delete c.son[k]; });
    ses = { ekran: 'gorev', gorevler, i: 0, erg: [], start: now() };
    render();
  }

  // ---------- çizim ----------
  function render() {
    if (!ses) ses = { ekran: 'giris' };
    api.durum('');
    const k = el();
    k.classList.remove('fx-dogru', 'fx-fast', 'fx-yanlis', 'cevaplandi');
    if (ses.ekran === 'giris' || ses.ekran === 'bos') { k.classList.remove('duzen'); return renderGiris(); }
    if (ses.ekran === 'son') { k.classList.remove('duzen'); return renderSon(); }
    k.classList.add('duzen');
    const g = ses.gorevler[ses.i];
    if (!g.start) g.start = now();
    const ust = `<div class="tur ca-ust"><span class="yeni">cümle atölyesi</span><span>${KADEME_AD[g.kademe]} · ${ses.i + 1}/${ses.gorevler.length}</span></div>`;
    if (g.kademe === 'diz') renderDiz(g, ust);
    else if (g.kademe === 'cevir') renderCevir(g, ust);
    else renderKur(g, ust);
    api.tastatur && api.tastatur();
    if (g.done) sonucGoster(g);
  }
  function renderGiris() {
    const adaylar = havuz(), n = adaylar.filter(a => a.sz.length).length;
    if (ses.ekran === 'bos' || !n) {
      el().innerHTML = `<div class="tur"><span class="yeni">cümle atölyesi</span></div><div class="soru">Henüz cümle kuracak kelime yok</div>
        <p class="aciklama">Atölye, Çalış'ta öğrendiğin kelimelerin cümleleriyle çalışır. Önce birkaç tur yap.</p>
        <div class="sira"><button class="btn ana" data-modus="akis" type="button">Çalış'a git</button></div>`;
      return;
    }
    const p = plan(adaylar.filter(a => a.sz.length)), say = k => p.filter(x => x === k).length;
    const yuzde = k => { const o = oran(k); return o == null ? '' : ` · son ${st().ist[k].length}: %${Math.round(o * 100)}`; };
    el().innerHTML = `<div class="tur"><span class="yeni">cümle atölyesi</span><span>öğrendiğin ${n} kelimenin cümleleri</span></div>
      <div class="soru">Kendi cümleni kur</div>
      <ul class="erkl ca-kademe">
        <li><b>Diz</b>: Türkçe cümle + karışık Almanca parçalar → doğru sıraya diz. Fiil nereye gider?${esc(yuzde('diz'))}</li>
        <li><b>Çevir</b>: Türkçeden Almancaya tam cümle, verilen kelimeyle. Kelime kelime fark gösterilir.${esc(yuzde('cevir'))}</li>
        <li><b>Kur</b>: kelime + kısa durum → kendi cümlen. Not yok: Claude gece düzeltir, Geçmiş'te görürsün.</li>
      </ul>
      <p class="soluk">Bu oturum: ${say('diz')} diz · ${say('cevir')} çevir · ${say('kur')} kur (~8 dk). Kelime hafızana ve seviyelerine yazılmaz.</p>
      <div class="sira">${api.devamBtn('ca', 'basla', 0, `Başla · ${p.length} görev`)}</div>`;
  }
  // Diz: yerleştirilen parçalar (dokun: geri al) + kalan parçalar (rakam tuşu)
  function renderDiz(g, ust) {
    const kalan = g.d.parca.map((p, i) => ({ p, i })).filter(x => !g.secim.includes(x.i));
    const dizi = g.secim.length ? g.secim.map(i => `<button class="chip ca-cip ca-yerlesti" data-ca="geri" data-i="${i}" type="button">${de(g.d.parca[i])}</button>`).join('') + `<span class="ca-son">${esc(g.d.son)}</span>` : '<span class="soluk">parçalara sırayla dokun</span>';
    const tam = g.secim.length === g.d.parca.length;
    el().innerHTML = `<div class="q-ust">${ust}<div class="soluk ca-yonerge">Almanca cümleyi diz</div><div class="soru ca-tr">${esc(g.x.tr)}</div>
      ${g.ipucu ? '<div class="soluk">ipucu: ilk parça yerleştirildi</div>' : ''}</div>
      <div class="q-alt" id="q-alt"${g.done ? ' hidden' : ''}><div class="ca-dizi" aria-label="Senin cümlen">${dizi}</div>
      <div class="ca-cipler">${kalan.map((x, k) => `<button class="chip ca-cip" data-ca="parca" data-i="${x.i}" type="button">${k < 10 ? `<kbd>${(k + 1) % 10}</kbd> ` : ''}${de(x.p)}</button>`).join('')}</div>
      <div class="alt-sira"><button class="btn mini bilmiyorum" data-ca="bilmiyorum" type="button">Bilmiyorum</button>${g.secim.length ? '<button class="btn mini" data-ca="geri-son" type="button">⌫ geri al</button>' : g.ipucu ? '' : '<button class="btn mini" data-ca="ipucu" type="button">İpucu</button>'}<button class="btn ana" data-ca="kontrol" type="button"${tam ? '' : ' disabled'}>Kontrol <kbd>Enter</kbd></button></div></div>
      <div id="sonuc" class="sonuc-yer"></div>`;
  }
  const yazKutu = (rows, ph, deger) => `<div class="yaz-kutu ca-yaz"><textarea id="cevap" rows="${rows}" enterkeyhint="send" spellcheck="false" autocapitalize="sentences" autocomplete="off" lang="de" placeholder="${esc(ph)}" aria-label="Cevap">${esc(deger || '')}</textarea>${api.umlaut}</div>`;
  function renderCevir(g, ust) {
    const hedefHTML = `${api.deItemHTML(g.id)} <span class="soluk">= ${esc(kurz(api.trOf(g.id)))}</span>`;
    let yardim = ''; try { yardim = api.hilfe(g.x.de, g.id) || ''; } catch (e) { yardim = ''; }
    const ilk = temizle(g.x.de).split(' ')[0];
    el().innerHTML = `<div class="q-ust">${ust}<div class="soluk ca-yonerge">Almancaya çevir: tam cümle</div><div class="soru ca-tr">${esc(g.x.tr)}</div>
      <div class="ca-hedef"><span class="soluk">kullan:</span> ${hedefHTML}</div>${yardim}
      ${g.ipucu ? `<div class="kural">ipucu: ilk kelime <b>${esc(ilk)}</b>${g.hedef ? ` · bu cümlede: <b>${esc(g.hedef)}</b>` : ''} · ${temizle(g.x.de).split(' ').length} kelime</div>` : ''}</div>
      <div class="q-alt" id="q-alt"${g.done ? ' hidden' : ''}>${yazKutu(2, 'Almanca cümlen', g.giris)}
      <div class="alt-sira"><button class="btn mini bilmiyorum" data-ca="bilmiyorum" type="button">Bilmiyorum</button>${g.ipucu ? '' : '<button class="btn mini" data-ca="ipucu" type="button">İpucu</button>'}<button class="btn ana" data-ca="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div></div>
      <div id="sonuc" class="sonuc-yer"></div>`;
    odakla();
  }
  function kurListeHTML(g, k) {
    const i = (ok, t) => `<li class="${ok ? 'ca-tamam' : 'ca-eksik-m'}">${ok ? '✓' : '○'} ${t}</li>`;
    return k.hedef.map(h => i(h.var, api.deItemHTML(h.id))).join('') + i(k.uzun, `en az 5 kelime (${k.n})`) + i(k.yapi, esc(g.yapi.ad)) + i(k.buyuk && k.nokta, 'büyük harfle başla, noktayla bitir');
  }
  function renderKur(g, ust) {
    const k = kurKontrol(g.giris || '', g);
    const kelimeler = g.ids.map(id => `<span class="ca-kelime">${api.deItemHTML(id)} <span class="soluk">${esc(kurz(api.trOf(id)))}</span></span>`).join('<span class="soluk"> + </span>');
    el().innerHTML = `<div class="q-ust">${ust}<div class="soluk ca-yonerge">Kendi cümleni kur${g.tema ? ' · ' + esc(g.tema) : ''}</div>
      <div class="soru ca-durum">${esc(g.durum)}</div>
      <div class="ca-hedef">${kelimeler}</div>
      <div class="kural ca-gorev">${esc(g.yapi.tr)}</div></div>
      <div class="q-alt" id="q-alt"${g.done ? ' hidden' : ''}>${yazKutu(3, 'Almanca cümlen (tek ya da iki cümle)', g.giris)}
      <ul class="ca-liste" id="ca-liste">${kurListeHTML(g, k)}</ul>
      ${g.uyari ? '<div class="ca-uyari">Eksikler var (○). Düzeltebilir ya da yine de gönderebilirsin.</div>' : ''}
      <div class="alt-sira"><button class="btn mini bilmiyorum" data-ca="bilmiyorum" type="button">Atla</button><button class="btn ana" data-ca="kontrol" type="button">${g.uyari ? 'Yine de gönder' : 'Gönder'} <kbd>Enter</kbd></button></div>
      <div class="soluk ca-not">Not verilmez; gece Claude cümle cümle düzeltir.</div></div>
      <div id="sonuc" class="sonuc-yer"></div>`;
    const ta = el().querySelector('#cevap');
    if (ta) ta.addEventListener('input', () => {
      g.giris = ta.value; const k2 = kurKontrol(ta.value, g), l = el().querySelector('#ca-liste'); if (l) l.innerHTML = kurListeHTML(g, k2);
      // uyarıdan sonra eksikler giderildiyse uyarı kalkar
      if (g.uyari && !kurEksik(k2)) { g.uyari = false; const u = el().querySelector('.ca-uyari'); if (u) u.remove(); const b = el().querySelector('[data-ca="kontrol"]'); if (b) b.innerHTML = 'Gönder <kbd>Enter</kbd>'; }
    });
    odakla();
  }
  function odakla() {
    const i = el().querySelector('#cevap');
    if (i && !i.readOnly) { i.focus(); try { const n = i.value.length; i.setSelectionRange(n, n); } catch (e) { /* yok */ } }
  }
  // kelime kelime fark (sözleşme diff'i): ok düz, yazım harf farkı, yanlış üstü çizili + doğrusu, eksik yeşil, fazla kırmızı üstü çizili, yer turuncu
  function farkHTML(diff) {
    const noktalama = x => /^[,.!?;:]$/.test(x.w || x.d || '');
    return (diff || []).map(x => {
      if (x.t === 'ok') return `<span class="ca-w ca-ok">${esc(x.w)}</span>`;
      if (x.t === 'yazim') return `<span class="ca-w ca-yazim">${api.harfFark ? api.harfFark(x.w, x.d) : esc(x.w)}</span>`;
      if (x.t === 'yanlis') return `<span class="ca-w ca-yanlis"><s>${esc(x.w)}</s> <ins>${esc(x.d)}</ins></span>`;
      if (x.t === 'eksik') return `<ins class="ca-w ca-eksik">${esc(x.d)}</ins>`;
      if (x.t === 'fazla') return `<s class="ca-w ca-fazla">${esc(x.w)}</s>`;
      if (x.t === 'yer') return `<span class="ca-w ca-yer" title="doğru kelime, yeri yanlış">${esc(x.w)}</span>`;
      return `<span class="ca-w">${esc(x.w || x.d)}</span>`;
    }).map((h, i) => (i && !noktalama(diff[i]) ? ' ' : '') + h).join('');
  }
  const sesBtn = t => `<button class="ses-mini" data-sprich="${esc(t)}" type="button" aria-label="dinle">🔊</button>`;
  function sonucGoster(g) {
    const yer = el().querySelector('#sonuc'); if (!yer) return;
    el().classList.add('cevaplandi');
    if (g.kademe === 'kur') {
      const k = g.kontrol;
      const ornek = g.ornek ? `<div class="satir"><span class="et">örnek</span><span class="deger">${de(g.ornek.de)} ${sesBtn(g.ornek.de)}<br><span class="soluk">${esc(g.ornek.tr)}</span></span></div>` : '';
      yer.innerHTML = g.urteil === 'gonderildi' ? `<div class="sonuc ca-gonder"><div class="baslik">✉️ Gönderildi<span class="soluk ca-alt">Claude gece düzeltir; düzeltme Geçmiş'te</span></div>
        <div class="satir"><span class="et">senin</span><span class="deger">${esc(g.giris)}</span></div>
        <ul class="ca-liste">${kurListeHTML(g, k)}</ul>${ornek}
        <div class="notlar">${api.devamBtn('ca', 'devam')}</div></div>`
        : `<div class="sonuc falsch"><div class="baslik">Atlandı<span class="etiketler"><span class="etiket">bilmiyorum</span></span></div>
        <div class="soluk">Bu kelimeler için Claude yeni cümleler yazar.</div>${ornek}<div class="notlar">${api.devamBtn('ca', 'devam')}</div></div>`;
      return;
    }
    const r = g.r || { tags: [], diff: [] }, u = g.urteil;
    const baslik = { richtig: '✓ Doğru', fast: '≈ Küçük hata', falsch: '✗ Yanlış' }[u];
    const tags = (g.tags || []).filter(t => t !== 'bilmiyorum');
    const neden = [...new Set(tags.map(t => ETIKET_TR[t]).filter(Boolean))];
    const kural = g.kademe === 'diz' || tags.includes('fiil yeri') || tags.includes('kelime sırası') ? kuralNotu(r.enYakin || g.x.de) : [];
    const hedefler = [g.x.de].concat(g.x.alts || []);
    const enYakin = r.enYakin && hedefler.includes(r.enYakin) ? r.enYakin : g.x.de;
    const baska = hedefler.filter(h => h !== enYakin);
    const itiraz = !g.itiraz && u !== 'richtig' && !g.bilmiyorum
      ? `<button class="btn mini n3" data-ca="itiraz" data-n="richtig" type="button">aslında doğru</button>${g.kademe === 'cevir' && u === 'falsch' ? '<button class="btn mini n2" data-ca="itiraz" data-n="fast" type="button">yazım hatasıydı</button>' : ''}` : '';
    yer.innerHTML = `<div class="sonuc ${u}"><div class="baslik">${baslik}${(g.tags || []).length ? `<span class="etiketler">${g.tags.map(t => `<span class="etiket">${esc(t)}</span>`).join('')}</span>` : ''}</div>
      ${g.bilmiyorum ? '' : `<div class="satir"><span class="et">senin</span><span class="deger fark ca-fark">${(u === 'richtig' && !(r.diff || []).some(x => x.t !== 'ok')) || !(r.diff || []).length ? esc(g.antwort) : farkHTML(r.diff)}</span></div>`}
      <div class="satir"><span class="et">doğru</span><span class="deger">${de(enYakin)} ${sesBtn(enYakin)}</span></div>
      ${baska.length ? `<div class="satir"><span class="et">başka doğru</span><span class="deger ca-baska">${baska.map(de).join('<br>')}</span></div>` : ''}
      ${neden.length || kural.length ? `<div class="satir"><span class="et">neden</span><span class="deger ca-neden">${neden.concat(kural).map(esc).join('<br>')}</span></div>` : ''}
      ${g.itiraz ? `<div class="soluk">İtiraz kaydedildi (sistem: ${esc(g.oneri)}); Claude gece bakar.</div>` : ''}
      ${!g.bilmiyorum && u !== 'richtig' && (r.diff || []).some(x => x.t !== 'ok') ? `<div class="soluk ca-lejant">${g.kademe === 'diz' ? '' : '<ins class="ca-eksik">eksik</ins> · <s class="ca-fazla">fazla</s> · '}<span class="ca-yer">yeri yanlış</span></div>` : ''}
      <div class="notlar">${api.devamBtn('ca', 'devam', u === 'richtig' && !g.itiraz ? 1400 : 0)}${itiraz}</div></div>`;
  }

  // ---------- cevap ----------
  function kontrolEt() {
    const g = ses && ses.gorevler && ses.gorevler[ses.i];
    if (!g || g.done) return;
    if (g.kademe === 'diz') {
      if (g.secim.length !== g.d.parca.length) return;
      const giris = g.secim.map(i => g.d.parca[i]).join(' ') + g.d.son;
      return cevapla(g, giris.charAt(0).toUpperCase() + giris.slice(1));
    }
    const ta = el().querySelector('#cevap'), v = ta ? ta.value.trim() : '';
    if (!v) { if (ta) ta.focus(); return; }
    g.giris = v;
    if (g.kademe === 'kur') {
      const k = kurKontrol(v, g);
      if (kurEksik(k) && !g.uyari) { g.uyari = true; render(); return; }
      return cevapla(g, v);
    }
    cevapla(g, v);
  }
  function cevapla(g, giris, bilmiyorum) {
    if (g.done) return;
    g.done = true; g.sek = Math.round((now() - (g.start || now())) / 1000); g.antwort = bilmiyorum ? '' : String(giris || '').trim().replace(/\s+/g, ' ');
    g.bilmiyorum = !!bilmiyorum;
    if (g.kademe === 'kur') {
      g.kontrol = kurKontrol(g.antwort, g);
      g.urteil = bilmiyorum ? 'falsch' : 'gonderildi';
      g.tags = bilmiyorum ? ['bilmiyorum'] : [];
      if (!bilmiyorum) { st().kur++; st().sonYapi = g.yapi.k; }
      render();   // kur notlanmaz: doğru / yanlış efekti ve kombo yok
      return;
    }
    const hedefler = [g.x.de].concat(g.x.alts || []);
    if (bilmiyorum) { g.urteil = 'falsch'; g.tags = ['bilmiyorum']; g.r = { enYakin: g.x.de, diff: [], tags: [] }; }
    else if (g.kademe === 'diz') {
      const dogru = hedefler.some(h => dizNorm(h) === dizNorm(giris));
      // fark parça parça (büyük/küçük harf yok sayılır): en uzun ortak sıradaki parçalar yerinde, diğerleri "yeri yanlış"
      const U = g.secim.map(i => g.d.parca[i]), T = g.d.dogru, lc = x => x.toLowerCase();
      const L = Array.from({ length: U.length + 1 }, () => new Array(T.length + 1).fill(0));
      for (let i = U.length - 1; i >= 0; i--) for (let j = T.length - 1; j >= 0; j--) L[i][j] = lc(U[i]) === lc(T[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const yerinde = new Set(); for (let i = 0, j = 0; i < U.length && j < T.length;) { if (lc(U[i]) === lc(T[j])) { yerinde.add(i); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
      const diff = U.map((w, i) => ({ t: yerinde.has(i) ? 'ok' : 'yer', w: i ? w : w.charAt(0).toUpperCase() + w.slice(1), d: w }));
      // sözleşme motoru varsa yalnız etiket için (fiil yeri / kelime sırası)
      let etiket = [];
      if (!dogru && (api.G || root.G) && typeof (api.G || root.G).cumleKontrol === 'function') { const virgulsuz = x => String(x).replace(/,/g, ''); etiket = (kontrol(virgulsuz(giris), hedefler.map(virgulsuz), {}).tags || []).filter(t => t === 'fiil yeri' || t === 'kelime sırası'); }
      g.r = { enYakin: g.x.de, diff, tags: etiket };
      if (dogru) { g.urteil = 'richtig'; g.tags = []; }
      else {
        g.tags = etiket.slice();
        if (!g.tags.length) g.tags.push('kelime sırası');
        // yalnız zarfın yeri farklı (schon, heute …), baş ve son parça yerinde: küçük hata (zarfın yeri biraz esnek)
        g.urteil = zarfEsnek(g.secim.map(i => g.d.parca[i]), g.d.dogru) ? 'fast' : 'falsch';
        if (g.urteil === 'fast') g.tags.push('zarf yeri');
      }
    } else {
      const r = kontrol(g.antwort, hedefler, g.hedef ? { hedefKelime: g.hedef } : {});
      g.r = r; g.urteil = r.urteil; g.tags = (r.tags || []).slice();
    }
    if (g.ipucu && !g.tags.includes('ipucu')) g.tags.push('ipucu');
    g.oneri = g.urteil;
    render();
    if (api.fx) api.fx(g.urteil);
    if (g.urteil === 'richtig') { const q = g; api.later(() => { if (ses && ses.gorevler && ses.gorevler[ses.i] === q && q.done && !q.loglandi) ilerle(); }, 1400); }
  }
  const ESNEK = /^(schon|auch|noch|heute|morgen|gestern|oft|immer|nie|gern|gerne|bitte|wieder|jetzt|dann|hier|dort|leider|vielleicht|wirklich|bald|gerade|sofort|endlich|natürlich|zusammen|manchmal|selten|abends|morgens|eigentlich|ja|doch|mal|trotzdem|deshalb|danach|später|zuerst)$/i;
  function zarfEsnek(u, t) {
    const lc = l => l.map(x => x.toLowerCase()), U = lc(u), T = lc(t);
    if (U[0] !== T[0] || U[U.length - 1] !== T[T.length - 1]) return false;
    const sade = l => l.filter(x => !ESNEK.test(x)).join(' ');
    return sade(U) === sade(T) && U.some((x, i) => x !== T[i]);
  }
  function itirazEt(n) {
    const g = ses && ses.gorevler && ses.gorevler[ses.i];
    if (!g || !g.done || g.itiraz || g.kademe === 'kur') return;
    g.itiraz = true; g.oneri = g.urteil; g.urteil = n === 'fast' ? 'fast' : 'richtig';
    render();
  }
  // log + sayaç + puan (Devam'da; cevaptan sonra itiraz edilebilsin diye)
  function logla(g) {
    if (!g || !g.done || g.loglandi) return;
    g.loglandi = true;
    const c = st(), t = now();
    const item = (g.ids || [g.id]).map(id => { try { return api.label(id); } catch (e) { return id; } }).join(' + ');
    const notiz = [`kademe:${g.kademe}`];
    let frage, loesung, urteil = g.urteil;
    if (g.kademe === 'kur') {
      const k = g.kontrol || kurKontrol(g.antwort, g);
      frage = `${g.durum} | kelimeler: ${item} | görev: ${g.yapi.tr}`; loesung = '';
      notiz.push(`yapı:${g.yapi.k}`, `kelime:${k.n}`, `hedef:${k.hedef.filter(h => h.var).length}/${k.hedef.length}`);
      k.hedef.filter(h => !h.var).forEach(h => { try { notiz.push('hedef-eksik:' + api.label(h.id)); } catch (e) { /* yok */ } });
      if (!k.uzun) notiz.push('kısa'); if (!k.yapi && !g.bilmiyorum) notiz.push('yapı-eksik'); if (!k.buyuk) notiz.push('büyük harf'); if (!k.nokta) notiz.push('nokta');
      if (g.uyari && !g.bilmiyorum && kurEksik(k)) notiz.push('uyarıya rağmen');
      if (g.ids.length > 1) notiz.push('ek:' + g.ids.slice(1).join(','));
    } else {
      frage = g.x.tr; loesung = g.x.de;
      if (g.kademe === 'diz') notiz.push(`parça:${g.d.parca.length}`);
      if (g.kademe === 'cevir' && g.hedef) notiz.push(`hedef:${g.hedef}`);
      (g.tags || []).filter(x => x !== 'bilmiyorum' && x !== 'ipucu').forEach(x => notiz.push(x));
      if (g.ipucu) notiz.push('ipucu:1');
      if (g.r && g.r.motor === 'pruefen' && g.kademe === 'cevir') notiz.push('motor:pruefen');
      if (g.itiraz) notiz.push(`öneri:${g.oneri}`);
      c.son[g.x.de] = t;
      istEkle(g.kademe, urteil === 'richtig' ? 1 : urteil === 'fast' ? 0.5 : 0);
    }
    if (g.bilmiyorum) notiz.push('bilmiyorum');
    notiz.push(`sek:${g.sek || 0}`);
    (g.ids || [g.id]).forEach(id => { c.oge[id] = t; });
    api.logEintrag({ modus: 'cumle', id: `${g.id}:${g.kademe}`, item, frage, antwort: g.antwort, ergebnis: urteil, loesung, notiz: notiz.join(' | ') });
    const hm = api.heuteM('cumle'); hm.n++; if (g.kademe !== 'kur') hm[urteil] = (hm[urteil] || 0) + 1;
    const xp = g.kademe === 'kur' ? (urteil === 'gonderildi' ? (kurEksik(g.kontrol) ? 10 : 25) : 0)
      : (g.kademe === 'diz' ? 10 : 15) * (urteil === 'richtig' ? 1 : urteil === 'fast' ? 0.5 : 0.1);
    api.xpEkle(Math.round(xp));
    api.sayac && api.sayac(g.kademe === 'kur' ? null : urteil);   // kur notlanmaz: yalnız cevap sayısı
    ses.erg.push({ kademe: g.kademe, urteil, item, id: g.id });
    api.save();
  }
  function ilerle() {
    const g = ses && ses.gorevler && ses.gorevler[ses.i];
    if (!g || !g.done) return;
    logla(g);
    ses.i++;
    if (ses.i >= ses.gorevler.length) return bitir();
    render();
  }
  function turSatiri(yarida) {
    const e = ses.erg, say = u => e.filter(x => x.urteil === u).length;
    const not = e.filter(x => x.kademe !== 'kur'), puan = not.length ? Math.round(not.reduce((a, x) => a + (x.urteil === 'richtig' ? 1 : x.urteil === 'fast' ? 0.5 : 0), 0) / not.length * 100) : 0;
    const dk = Math.max(1, Math.round((now() - ses.start) / 60000)), kd = k => e.filter(x => x.kademe === k).length;
    api.logEintrag({ modus: 'tur', id: 'cumle', item: '', frage: '', antwort: '', ergebnis: 'bitti', loesung: '',
      notiz: [`cevap:${e.length}`, `doğru:${say('richtig')}`, `küçük:${say('fast')}`, `yanlış:${say('falsch')}`, `gönderildi:${say('gonderildi')}`, `puan:${puan}`, `dk:${dk}`, `diz:${kd('diz')}`, `cevir:${kd('cevir')}`, `kur:${kd('kur')}`].concat(yarida ? ['yarıda'] : []).join(' | ') });
    return { puan, dk };
  }
  function bitir() {
    const o = turSatiri(false);
    ses.ekran = 'son'; ses.puan = o.puan; ses.dk = o.dk;
    api.save();
    render();
    if (o.puan >= 80 && ses.erg.some(x => x.kademe !== 'kur') && api.konfeti) api.konfeti();
  }
  function renderSon() {
    const e = ses.erg, isaret = { richtig: '✓', fast: '≈', falsch: '✗', gonderildi: '✉️' };
    const kurN = e.filter(x => x.urteil === 'gonderildi').length, not = e.filter(x => x.kademe !== 'kur');
    const dogru = not.filter(x => x.urteil === 'richtig').length;
    el().innerHTML = `<div class="tur-sonu ca-sonu"><div class="ts-rozet">${ses.puan >= 80 ? '🏆' : ses.puan >= 50 ? '👍' : '🌱'}</div>
      <div class="ts-baslik">Atölye bitti</div>
      <div class="soluk">${not.length ? `${dogru}/${not.length} doğru · ` : ''}${kurN ? `${kurN} cümle gönderildi · ` : ''}${ses.dk} dk</div>
      ${kurN ? '<div class="kural">Kendi cümlelerini Claude gece düzeltir; hemen bakmasını istersen gönder.</div>' : ''}
      <ul class="ca-ozet">${e.map(x => `<li class="ca-oz-${x.urteil}"><span class="ca-oz-i">${isaret[x.urteil] || '·'}</span> <span class="soluk">${KADEME_AD[x.kademe]}</span> ${esc(x.item)}</li>`).join('')}</ul>
      <div class="sira ts-btns">${api.devamBtn('ca', 'basla', 0, 'Bir oturum daha')}${kurN ? '<button class="btn" data-act="claude-gonder" type="button">Claude\'a şimdi gönder</button>' : ''}<button class="btn" data-git="ana" type="button">Ana sayfa</button></div></div>`;
  }

  // ---------- olaylar ----------
  function klick(e) {
    const b = e.target.closest('[data-ca]'); if (!b) return false;
    const a = b.dataset.ca, g = ses && ses.gorevler && ses.gorevler[ses.i];
    if (a === 'basla') basla();
    else if (a === 'devam') ilerle();
    else if (a === 'kontrol') kontrolEt();
    else if (a === 'bilmiyorum') { if (g && !g.done) cevapla(g, '', true); }
    else if (a === 'itiraz') itirazEt(b.dataset.n);
    else if (a === 'ipucu') { if (g && !g.done) { g.ipucu = true; if (g.kademe === 'diz' && !g.secim.length) { const ilk = g.d.parca.indexOf(g.d.dogru[0]); if (ilk >= 0) g.secim.push(ilk); } else if (g.kademe === 'cevir') { const ta = el().querySelector('#cevap'); if (ta) g.giris = ta.value; } render(); } }
    else if (a === 'parca') { if (g && !g.done) { g.secim.push(+b.dataset.i); render(); } }
    else if (a === 'geri') { if (g && !g.done) { g.secim = g.secim.filter(i => i !== +b.dataset.i); render(); } }
    else if (a === 'geri-son') { if (g && !g.done) { g.secim.pop(); render(); } }
    else return false;
    return true;
  }
  function tus(e) {
    if (!ses) return false;
    const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const g = ses.gorevler && ses.gorevler[ses.i];
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.isComposing) return false;
      e.preventDefault();
      if (ses.ekran === 'giris' || ses.ekran === 'son') { if (!e.repeat) basla(); return true; }
      if (ses.ekran === 'gorev' && g) { if (e.repeat) return true; if (g.done) ilerle(); else kontrolEt(); return true; }
      return true;
    }
    if (ses.ekran !== 'gorev' || !g || g.done || g.kademe !== 'diz' || inInput) return false;
    if (/^[0-9]$/.test(e.key)) {
      const k = e.key === '0' ? 9 : +e.key - 1, kalan = g.d.parca.map((p, i) => i).filter(i => !g.secim.includes(i));
      if (k < kalan.length) { e.preventDefault(); g.secim.push(kalan[k]); render(); }
      return true;
    }
    if (e.key === 'Backspace') { e.preventDefault(); if (g.secim.length) { g.secim.pop(); render(); } return true; }
    return false;
  }
  // Çalış'tan çıkış: cevaplanmış ama loglanmamış görev loglanır; yarım oturum `tur;cumle` (yarıda) ile kapanır; sonraki giriş taze başlar
  function cik() {
    if (!ses) return;
    if (ses.ekran === 'gorev') {
      const g = ses.gorevler[ses.i];
      if (g && g.done && !g.loglandi) { logla(g); ses.i++; }
      if (ses.erg.length) turSatiri(true);
      api.save();
    }
    ses = null;
  }
  function init(a) { api = a; S = api.S(); root.addEventListener && root.addEventListener('pagehide', () => { try { const g = ses && ses.gorevler && ses.gorevler[ses.i]; if (g && g.done && !g.loglandi) logla(g); } catch (e) { /* yok */ } }); }
  function yenile() { S = api.S(); }
  // test: oturum durumu (salt okunur kullanım), cümle parçalama ve kontrol
  root.Cumle = { init, yenile, render, klick, tus, cik, oturum: () => ses, dizParcala, kontrol, kuralNotu, kurKontrol: (t, ids, yapiK) => kurKontrol(t, { ids, yapi: YAPI.find(y => y.k === yapiK) || YAPI[0] }), YAPI };
})(window);
