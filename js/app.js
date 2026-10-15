// Almanca Tekrar — uygulama: veri, durum, kuyruk, soru türleri, not verme, log, görünümler.
(function () {
  'use strict';

  // ================= Yardımcılar =================
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // saat: testte kaydırılabilir (window.__tekrar.saat(ms))
  let saatOfs = 0;
  const now = () => Date.now() + saatOfs;
  const DAY = 86400000;
  const tag = (t = now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // Hızlı tur zamanları (baştan savmaya karşı)
  const DENKZEIT = 1200;     // seçenekler 1,2 sn sonra açılır (dokununca hemen): önce aklından söyle
  // (seçenekler açıldıktan sonra 0,4 sn'den hızlı basış okunmamış sayılır: Kern.notVer 'sayılmadı')
  // (seçmelide yavaş-doğru artık "zor" değil: yalnız 15 sn üstü; okuma hızı cezalandırılmasın)
  // senkron koruması: bu kodun anladığı en yeni şema (uzaktaki S.surum bundan büyükse birleştirme ve yazma yok)
  const CODE_SURUM = 4;

  // ================= Veri =================
  const byId = Object.fromEntries(window.NOMEN.liste.map(n => [n.id, n]));
  // tekrar eden / bölgesel maddeler (skip) öğretilmez
  const NL = window.NOMEN.liste.filter(n => !n.skip);
  const OPTS = {
    personen: window.NOMEN.personen.map(r => Object.assign({}, byId[r.id], r, { person: true })),
    adjSache: window.NOMEN.adjSache.map(a => a.de),
    adjPerson: window.NOMEN.adjPerson.map(a => a.de),
  };
  const ADJ_TR = Object.fromEntries(window.NOMEN.adjSache.concat(window.NOMEN.adjPerson).map(a => [a.de, a.tr]));
  const VERBEN = window.VERBEN.map(v => G.rahmenAufloesen(v, byId));
  const vById = Object.fromEntries(VERBEN.map(v => [v.id, v]));
  const WOERTER = window.WOERTER || [];
  const wById = Object.fromEntries(WOERTER.map(w => [w.id, w]));
  const PAKETE = window.PAKETE || [];
  const pById = Object.fromEntries(PAKETE.map(p => [p.id, p]));
  const KANCA = window.KANCA || {};
  const SAETZE = window.SAETZE || {};
  const THEMEN = window.THEMEN || [];   // Goethe B1 konuları: [{id, de, tr, items}]
  const thById = Object.fromEntries(THEMEN.map(t => [t.id, t]));
  const THEMA_VON = {};   // öğe → konular (çeldiriciler aynı konudan)
  THEMEN.forEach(t => t.items.forEach(id => (THEMA_VON[id] = THEMA_VON[id] || []).push(t.id)));
  const SAETZE_REFL = window.SAETZE_REFL || {};
  const NSAETZE = window.NSAETZE || {};
  const GLOSSEN = window.GLOSSEN || {};            // Almanca cümle → "die Regierung = hükümet; …"            // isim / diğer kelime → çeviri cümleleri   // dönüşlü fiil → çeviri cümleleri
  const AUFGABEN = window.AUFGABEN || [];         // serbest yazma görevleri   // fiil → [{de, tr}] Goethe örnekleri, elle çevrildi

  // Öğe türü: v fiil · n isim (n…/x…) · w diğer kelime · p paket
  const kind = id => id[0] === 'v' ? 'v' : id[0] === 'w' ? 'w' : id[0] === 'p' ? 'p' : 'n';
  const trOf = id => ({ v: () => vById[id].tr, w: () => wById[id].tr, p: () => pById[id].titelTr, n: () => byId[id].tr })[kind(id)]();
  const label = id => ({
    v: () => vById[id].anz, w: () => wById[id].de, p: () => pById[id].titel,
    n: () => (byId[id].plOnly ? 'die ' : byId[id].art + ' ') + byId[id].lemma,
  })[kind(id)]();
  const kurzTr = t => String(t).split(';')[0].trim();
  // Türkçe → Almanca soruda: Türkçe anlamın parantezi cevabı içeriyorsa gizle ("-den itibaren (ab Montag)" → "-den itibaren (…)")
  function maskTr(tr, de) {
    const stems = String(de).replace(/^(der|die|das|sich)\s+/i, '').split(/[\s…/]+/).filter(w => w.length >= 2 && !/^(sich|der|die|das|sein|A|D)$/i.test(w))
      .map(w => w.toLowerCase().slice(0, Math.max(2, w.length - 2)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!stems.length) return String(tr);
    const re = new RegExp('(^|[^a-zäöüß])(' + stems.join('|') + ')', 'i');
    return String(tr).replace(/\(([^)]*)\)/g, (m, inner) => re.test(inner) ? '(…)' : m);
  }                                    // "çanta; cep" → "çanta"
  const optTr = t => kurzTr(t).replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();      // seçenek için parantezsiz

  // Dönüşlü alıştırma: aynı fiilin birden çok anlamı varsa (freuen auf / über) yalnız ilki
  const reflGesehen = new Set();
  VERBEN.forEach(v => {
    const k = v.base + v.pre + v.refl;
    if (v.refl && !G.REFL_AUS.includes(v.base) && !reflGesehen.has(k)) { reflGesehen.add(k); v.reflDrill = true; }
  });
  // çekim sorusu da fiil başına bir kez (freuen auf / freuen über aynı çekim)
  // Düzensiz fiiller (Präteritum ünlü değiştiren ya da karışık: ging, brachte); fiil başına bir kez
  const starkGesehen = new Set();
  VERBEN.forEach(v => {
    const pt = (v.pt3 || '').split('/')[0].trim();
    const st = G.stemOf ? G.stemOf(v.base) : '';
    v.ptForm = pt;
    if (pt && !starkGesehen.has(v.inf) && (!/te$/.test(pt) || (st && pt !== st + 'te' && pt !== st + 'ete'))) { v.stark = true; starkGesehen.add(v.inf); }
  });
  const frmGesehen = new Set();
  VERBEN.forEach(v => { const k = v.inf + v.refl; v.frmDrill = !frmGesehen.has(k); frmGesehen.add(k); });

  // Anlamdaşlar: aynı Türkçe karşılık (ilk anlam) → TR→DE sorularında hangisinin istendiği belli olmaz
  const trKey = t => String(t).split(/[;,]/)[0].replace(/\(.*?\)/g, '').trim().toLowerCase();
  const SYN = new Map();
  const addSyn = (id, t) => { const k = trKey(t); (SYN.get(k) || SYN.set(k, []).get(k)).push(id); };
  VERBEN.forEach(v => addSyn(v.id, v.tr));
  NL.forEach(n => addSyn(n.id, n.tr));
  WOERTER.forEach(w => addSyn(w.id, w.tr));
  const synOf = id => (SYN.get(trKey(trOf(id))) || []).filter(x => x !== id && kind(x) === kind(id));
  // anlamdaşlardan ayıran en kısa baş (benötigen / brauchen → "be…")
  const kern = id => ({ v: () => vById[id].anz.replace(/^sich(\(D\))? /, ''), w: () => wById[id].de, n: () => byId[id].lemma, p: () => '' })[kind(id)]();
  function synPraefix(id, syn) {
    const w = kern(id);
    for (let n = 1; n < Math.min(5, w.length); n++) if (!syn.some(x => kern(x).slice(0, n).toLowerCase() === w.slice(0, n).toLowerCase())) return w.slice(0, n);
    return w.slice(0, Math.min(4, w.length));
  }

  // Goethe örneklerinden boşluklar (fiil başına bir kez hesaplanır)
  VERBEN.forEach(v => { v.lueckenListe = (v.bsp || []).map(b => G.luecke(v, b)).filter(Boolean); });

  // Almanca metinde isimleri artikel rengiyle işaretlemek için biçim → artikel
  const FORM = new Map();
  // Aynı biçim hem tekil hem çoğulsa (den Nachbarn) sözlükteki artikel gösterilir
  const addForm = (f, a) => {
    if (!f) return;
    const old = FORM.get(f);
    if (!old || old === a) FORM.set(f, a);
    else if (old === 'pl') FORM.set(f, a);
    else if (a !== 'pl') FORM.set(f, '?');
  };
  NL.forEach(n => {
    if (n.plOnly) { addForm(n.lemma, 'pl'); addForm(n.lemma + 'n', 'pl'); return; }
    addForm(n.lemma, n.art);
    if (n.weak) { addForm(n.lemma + (/(e|Herr|Nachbar|Bauer)$/.test(n.lemma) ? 'n' : 'en'), n.art); }
    if (n.plf && n.plf !== n.lemma) { addForm(n.plf, 'pl'); if (!/[ns]$/.test(n.plf)) addForm(n.plf + 'n', 'pl'); }
  });
  function deHTML(text) {
    return esc(text).replace(/[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?/g, (w, off, full) => {
      const a = FORM.get(w);
      if (!a || a === '?') return w;
      const isStart = off === 0 || /[.!?„]\s*$/.test(full.slice(0, off));
      if (isStart && /^(Die|Der|Das|Sie|Ihr|Ihre|Essen|Leben|Bitte|Danke|Morgen|Abend|Recht)$/.test(w)) return w;
      if (/^(Frau|Herr|Herrn)$/.test(w) && /^\s+[A-ZÄÖÜ]/.test(full.slice(off + w.length))) return w;
      return `<span class="n ${a}">${w}<sup>${a === 'pl' ? 'Pl.' : a}</sup></span>`;
    });
  }
  const artHTML = n => n.plOnly ? `<span class="art art-pl">die</span> ${esc(n.lemma)} <span class="soluk">(çoğul)</span>`
    : `<span class="art art-${n.art}">${n.art}</span> ${esc(n.lemma)}`;
  const deItemHTML = id => kind(id) === 'n' ? artHTML(byId[id]) : `<b>${esc(label(id))}</b>`;
  const KL_TR = { adj: 'sıfat', adv: 'zarf', konj: 'bağlaç', präp: 'edat', pron: 'zamir / belirleyici', andere: 'kelime' };

  // Artikel kuralı (veriden): "-ung → die (%100)" ya da "istisna!"
  function regelHTML(n) {
    // bileşik isimde son parça belirler: en güvenilir kural (listede %95)
    if (n.kopf && n.kopf[1] === n.art) return `<div class="kural">Bileşik isim: <b>son parça belirler</b> · <span class="art art-${n.art}">${n.art}</span> ${esc(n.kopf[0])} → <span class="art art-${n.art}">${n.art}</span> ${esc(n.lemma)}</div>`;
    if (!n.regel) return '';
    const [suf, art, pct, cnt] = n.regel;
    if (n.art === art) return `<div class="kural">Kural: <b>-${esc(suf)}</b> ile bitenler <span class="art art-${art}">${art}</span> <span class="soluk">(listede ${cnt} isim, %${pct})</span></div>`;
    return `<div class="kural istisna"><b>İstisna!</b> <b>-${esc(suf)}</b> ile bitenlerin %${pct}'i <span class="art art-${art}">${art}</span>, ama bu <span class="art art-${n.art}">${n.art}</span></div>`;
  }
  const kancaHTML = id => KANCA[id] ? `<div class="kanca">🪝 <b>Kanca:</b> ${esc(KANCA[id])}</div>` : '';

  // Tanıtım sırası: seviye → (fiil: kalıplı önce) → (isim: kalıplarda geçen önce)
  const inFrames = new Set();
  VERBEN.forEach(v => (v.rahmen || []).forEach(fr => { (fr.s || []).forEach(n => inFrames.add(n.id)); fr.o.forEach(sl => sl.n.forEach(n => n !== 'P' && inFrames.add(n.id))); }));
  OPTS.personen.forEach(p => inFrames.add(p.id));
  // Seviye içinde sabit karıştırma: benzer kelimeler (abfahren, abholen …) art arda gelmesin
  const mix = id => { let h = 2166136261; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const VERB_ORDER = VERBEN.slice().sort((a, b) => b.tier - a.tier || (b.rahmen ? 1 : 0) - (a.rahmen ? 1 : 0) || mix(a.id) - mix(b.id));
  const NOUN_ORDER = NL.slice().sort((a, b) => b.tier - a.tier || (inFrames.has(b.id) ? 1 : 0) - (inFrames.has(a.id) ? 1 : 0) || mix(a.id) - mix(b.id));
  const WORT_ORDER = WOERTER.slice().sort((a, b) => b.tier - a.tier || mix(a.id) - mix(b.id));
  // Hızlı tur sırası: önce B1 (seviye 3), sonra A2, A1; 2 isim : 1 diğer kelime : 1 fiil
  const BLITZ_ORDER = [];
  [3, 2, 1].forEach(t => {
    // fiiller Hızlı tur'da yok: Fiiller bölümünde çekimleriyle öğrenilir
    const n = NOUN_ORDER.filter(x => x.tier === t), w = WORT_ORDER.filter(x => x.tier === t);
    while (n.length || w.length) { BLITZ_ORDER.push(...n.splice(0, 2), ...w.splice(0, 1)); }
  });

  // ================= Durum =================
  const KEY = 'almanca-tekrar-v1';
  // v5: log ayrı anahtarda (her kayıtta bütün log yeniden yazılmasın); cihaz kimliği S'e yazılmaz (cihaz başına gün sayacı, G-Counter)
  const LOG_KEY = 'almanca-tekrar-log', CIHAZ_KEY = 'almanca-tekrar-cihaz';
  const CIHAZ = (() => {
    const yeni = () => 'c' + Math.random().toString(36).slice(2, 10);
    try { let c = localStorage.getItem(CIHAZ_KEY); if (!c) { c = yeni(); localStorage.setItem(CIHAZ_KEY, c); } return c; } catch (e) { return yeni(); }
  })();
  const AYAR4 = { yeniGunluk: 6, uniteHizli: {}, gosterildi: {}, turHedef: 2 };   // Tuna (15.10): günde 2 tur, rutin oturunca artırılır
  const DEF = { karten: {}, items: {}, pakete: {}, tage: {}, log: [], pending: [], ghPending: [], kontext: {},
    einst: { ret: 0.85, modi: {} }, version: 3, kok: {}, tageC: {}, ayar4: AYAR4 };
  // Bölümler: her birinin kendi günlük hedefi (soru) ve yeni öğe sınırı.
  const MODI = {
    akis: { ad: 'Çalış', grup: 'Hepsi karışık', ziel: 80, neu: 10, neuTr: 'yeni kelime / fiil' },
    blitz: { ad: 'Hızlı tur', grup: 'Ezber', ziel: 40, neu: 10, neuTr: 'bilmediğin yeni kelime (bildiklerin sayılmaz)' },
    paket: { ad: 'Paketler', grup: 'Ezber', ziel: 10, neu: 1, neuTr: 'yeni paket (~10 kelime + metin)' },
    normal: { ad: 'Karışık', grup: 'Yazarak', ziel: 20, neu: 4, neuTr: 'yeni öğe (fiil + isim, derin tanıtım)' },
    verben: { ad: 'Fiiller', grup: 'Yazarak', ziel: 15, neu: 3, neuTr: 'yeni fiil (anlam + çekimler + cümle)' },
    woerter: { ad: 'Kelimeler (yazarak)', grup: 'Yazarak', ziel: 20, neu: 0, neuTr: 'yeni isim (0: Hızlı tur\'da öğrendiklerin buraya kendiliğinden gelir)' },
    ndek: { ad: 'n-Deklination', grup: 'Dilbilgisi', ziel: 15, neu: 5, neuTr: 'yeni n-Deklination ismi' },
    refl: { ad: 'Dönüşlü fiiller', grup: 'Dilbilgisi', ziel: 15, neu: 3, neuTr: 'yeni dönüşlü fiil' },
    thema: { ad: 'Konu', grup: 'Ezber', ziel: 30, neu: 15, neuTr: 'seçili konudan yeni kelime' },
    stark: { ad: 'Düzensiz fiiller', grup: 'Dilbilgisi', ziel: 20, neu: 5, neuTr: 'yeni düzensiz fiil (Präteritum + Perfekt)' },
    kalip: { ad: 'Kalıplar', grup: 'Yazma', ziel: 1, neu: 1, neuTr: 'okuma (soru yok)' },
    lesen: { ad: 'Okuma', grup: 'Yazma', ziel: 1, neu: 1, neuTr: 'metin + doğru/yanlış soruları' },
    unite: { ad: 'Ünite', grup: 'Ezber', ziel: 60, neu: 0, neuTr: 'kitaptaki konunun kelimeleri' },
    fiilmetin: { ad: 'Fiil metni', grup: 'Yazma', ziel: 1, neu: 0, neuTr: 'günün metni: fiil çekimleri' },
    yazma: { ad: 'Yazma', grup: 'Yazma', ziel: 1, neu: 1, neuTr: 'metin (3–4 günde bir)' },
    zayif: { ad: 'Zayıflar', grup: '', ziel: 10, neu: 0, neuTr: '' },
    artoyun: { ad: 'Artikel 60 sn', grup: 'Oyun', ziel: 1, neu: 0, neuTr: 'oyun (soru yok)' },
    sprechen: { ad: 'Konuşma', grup: 'Beceri', ziel: 1, neu: 0, neuTr: 'shadowing + kayıt (soru yok)' },
    gram: { ad: 'Gramer', grup: 'Dilbilgisi', ziel: 9, neu: 0, neuTr: 'konu başına kural + alıştırma' },
    pruefung: { ad: 'Prüfung', grup: 'Sınav', ziel: 1, neu: 0, neuTr: 'Goethe B1 provası (soru yok)' },
  };
  // Tek akış: tanıma, yazma, cümle, yeni kelime ve ara etkinlikler tek kuyrukta. Diğer bölümler odak için "Bölüm" listesinde.
  const PLAN = ['akis'];
  const MIN_TAG = 10;  // bu kadar sayılan cevap = gün "çalışılmış" sayılır (seri)

  function normalize(x) {
    const s = Object.assign(JSON.parse(JSON.stringify(DEF)), x || {});
    ['karten', 'items', 'pakete', 'tage', 'kontext', 'kok', 'tageC'].forEach(k => { s[k] = s[k] || {}; });
    s.ayar4 = Object.assign(JSON.parse(JSON.stringify(AYAR4)), s.ayar4);
    // 15.10: hafif rutin (günde 2 tur) bir kez uygulanır; Ayarlar'dan elle seçilmişse (secildi) dokunulmaz
    if (!s.ayar4.rutin) { s.ayar4.rutin = 1; if (!s.ayar4.secildi) s.ayar4.turHedef = 2; }
    ['log', 'pending', 'ghPending'].forEach(k => { s[k] = s[k] || []; });
    s.einst = Object.assign({ ret: 0.9 }, s.einst);
    s.einst.modi = s.einst.modi || {};
    if ((x && x.version || 0) < 3) {
      // v3: kelimeler artık Hızlı tur'dan gelir
      if (s.einst.modi.woerter) s.einst.modi.woerter.neu = 0;
      if (s.einst.modi.normal && s.einst.modi.normal.neu > 4) s.einst.modi.normal.neu = 4;
      s.version = 3;
    }
    Object.keys(MODI).forEach(m => { s.einst.modi[m] = Object.assign({ ziel: MODI[m].ziel, neu: MODI[m].neu }, s.einst.modi[m]); });
    return s;
  }
  // açılış: ana anahtar + ayrı log anahtarı; eski kayıtta (log ana anahtarda) satırlar log anahtarına taşınır
  function yukle() {
    let x = {}, log = null;
    try { x = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { x = {}; }
    try { log = JSON.parse(localStorage.getItem(LOG_KEY) || 'null'); } catch (e) { log = null; }
    if (!Array.isArray(log)) log = [];
    if (Array.isArray(x.log) && x.log.length) {
      const gorulen = new Set(log.map(e => JSON.stringify(e)));
      x.log.forEach(e => { if (!gorulen.has(JSON.stringify(e))) log.push(e); });
    }
    x.log = log;
    return normalize(x);
  }
  let S = yukle();
  // günlük hedef: tur sayısı (Ayarlar, varsayılan 3) × tur boyu; uyarlamalı hedef kalktı. Günü kurtarmak (seri) ayrı: MIN_TAG.
  function gunHedef() {
    return Math.max(1, Math.min(8, +(S.ayar4 && S.ayar4.turHedef) || 2)) * turBoyu();
  }
  const ziel = m => m === 'akis' ? gunHedef() : S.einst.modi[m].ziel;
  const neuMax = m => S.einst.modi[m].neu;
  // log yalnız değiştiyse yazılır (son satır ve uzunluk)
  let logYazilan = { n: -1, son: null };
  function save() {
    try {
      tageTuret(tag());
      if (S.log.length > 3000) S.log = S.log.slice(-3000);
      localStorage.setItem(KEY, JSON.stringify(Object.assign({}, S, { log: [] })));
      const son = S.log[S.log.length - 1] || null;
      if (logYazilan.n !== S.log.length || logYazilan.son !== son) { localStorage.setItem(LOG_KEY, JSON.stringify(S.log)); logYazilan = { n: S.log.length, son }; }
    } catch (e) { console.warn('kaydedilemedi', e); }
  }
  // sayfa kapanırken (Android uygulamayı öldürür, geri tuşu, yenileme): bekleyen cevap (sonuç paneli açık) önce işlenir
  window.addEventListener('pagehide', () => { try { arkaPlanNotla(); } catch (e) { console.warn(e); } save(); });
  // gün sayaçları: her cihaz yalnız kendi sayacını artırır (S.tageC[gün][CIHAZ]); S.tage[gün] = cihazların toplamı (türetilir).
  // heute()/heuteM() yazmak içindir (yerel cihaz); okumak için bugun()/bugunM() (bütün cihazların toplamı)
  const GUN0 = () => ({ n: 0, richtig: 0, fast: 0, falsch: 0, neuV: 0, neuN: 0, satz: 0, wort: 0, anlam: 0 });
  const MOD0 = () => ({ n: 0, richtig: 0, fast: 0, falsch: 0, neu: 0, bekannt: 0, ungezaehlt: 0 });
  const heute = () => { const t = tag(), c = S.tageC[t] = S.tageC[t] || {}; return c[CIHAZ] || (c[CIHAZ] = GUN0()); };
  const heuteM = m => { const d = heute(); d.modi = d.modi || {}; return d.modi[m] || (d.modi[m] = MOD0()); };
  const tageTuret = g => Kern.tageTuret(S, g);
  const bugun = () => { const t = tag(); if (S.tageC[t]) tageTuret(t); return S.tage[t] || GUN0(); };
  const bugunM = m => { const d = bugun(); return (d.modi && d.modi[m]) || MOD0(); };

  // ================= Öğeler (v5: öğe başına tek hafıza m, isimde art, düzensiz fiilde kök; seçim js/kern.js) =================
  const istNdek = id => kind(id) === 'n' && !!byId[id] && !!(byId[id].weak || byId[id].falle);
  const istRefl = id => kind(id) === 'v' && !!vById[id] && !!vById[id].refl;
  const itemOf = uid => uid.split(':')[0];
  const typOf = uid => uid.split(':')[1];

  // ================= Oturum =================
  // ot: Kern.sec'in oturum durumu (adım, kuyruk [yanlış / mini / ikinci], parti, metin, kurtarma, geçmiş); turBaslat'ta sıfırlanır
  const session = { kombo: 0, q: 0, modus: 'normal', son: [], dikkatBis: -1, hinweis: null, ot: null };
  // düzensiz: önce öneksiz temel fiiller (gehen, nehmen …) A1 → B1, sonra önekliler (fiil metni çeldiricileri)
  const STARK_ORDER = VERBEN.filter(v => v.stark).sort((a, b) => (!!a.pre - !!b.pre) || a.tier - b.tier || mix(a.id) - mix(b.id));
  // odak bölümleri: öğe yüklemi (aynı Kern.sec, öğe filtresiyle; yeni öğe ortak kotadan)
  const FILTER = {
    akis: id => kind(id) !== 'p',
    normal: id => kind(id) !== 'p',
    blitz: id => kind(id) === 'n' || kind(id) === 'w',
    verben: id => kind(id) === 'v',
    woerter: id => kind(id) === 'n' || kind(id) === 'w',
    zayif: id => kind(id) !== 'p' && schwach(id),
    ndek: id => istNdek(id),
    refl: id => istRefl(id),
    thema: id => kind(id) !== 'p' && themaSet().has(id),
    stark: id => kind(id) === 'v' && !!(vById[id] || {}).stark,
  };
  ['paket', 'yazma', 'lesen', 'fiilmetin', 'unite', 'kalip', 'artoyun', 'sprechen', 'gram', 'pruefung'].forEach(m => { FILTER[m] = () => false; });
  // seçili konu
  const themaId = () => (thById[S.einst.thema] ? S.einst.thema : (THEMEN[0] && THEMEN[0].id));
  let _thSet = null, _thFor = null;
  const themaSet = () => { const id = themaId(); if (_thFor !== id) { _thFor = id; _thSet = new Set(thById[id] ? thById[id].items : []); } return _thSet; };
  const tierOf = id => ({ v: () => vById[id].tier, w: () => wById[id].tier, p: () => 2, n: () => byId[id].tier })[kind(id)]();
  // Präteritum yalnız bu fiillerde üretilir (sein, haben, werden, modaller, wissen, es gab, sık anlatı fiilleri); diğerlerinde er-Präsens + Perfekt
  const PRAET_URETIM = new Set(['sein', 'haben', 'werden', 'können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen', 'wissen', 'geben', 'gehen', 'kommen',
    'sehen', 'finden', 'stehen', 'liegen', 'sitzen', 'bleiben', 'fahren', 'laufen', 'nehmen', 'denken', 'bringen', 'kennen', 'rufen', 'schreiben', 'sprechen', 'sagen', 'fallen', 'tun', 'werfen']);
  // Ablaut kalıbı (karışma kapısı): mastar / Präteritum / Partizip ünlüleri
  const unlu = w => (String(w || '').toLowerCase().match(/[aeiouäöü]+/g) || []).slice(-2).join('');
  const ablaut = id => { const v = vById[id]; return v && v.stark ? [v.base, v.ptForm, v.p2s].map(unlu).join('-') : ''; };
  // uluslararası kelime (yoklama adayı): Türkçesine çok yakın (Hotel / otel)
  const trSade = s => String(s).toLowerCase().replace(/[çğıöşü]/g, c => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c]).replace(/[^a-z]/g, '');
  const deSade = s => String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');
  function uluslararasi(id) {
    const k = kind(id); if (k === 'p') return false;
    const de = deSade(k === 'n' ? byId[id].lemma : k === 'v' ? vById[id].inf : wById[id].de.split(/[ …]/)[0]);
    const tr = trSade(kurzTr(trOf(id)).split(/[ ,(]/)[0]);
    if (de.length < 3 || tr.length < 3) return false;
    let ortak = 0; while (ortak < Math.min(de.length, tr.length) && de[ortak] === tr[ortak]) ortak++;
    return ortak >= 4 || Kern.lev(de, tr) <= 2;
  }
  // sözlük (yazım hoşgörüsü): lemmalar + çoğullar + fiil biçimleri, küçük harf
  let _lex = null;
  const lexSet = () => {
    if (_lex) return _lex;
    _lex = new Set();
    const ekle = x => { if (x) String(x).split(/[ /]+/).forEach(w => w.length > 1 && _lex.add(w.toLowerCase())); };
    NL.forEach(n => { ekle(n.lemma); ekle(n.plf); });
    WOERTER.forEach(w => ekle(w.de));
    formIdx().forEach((id, f) => ekle(f));
    G.lexSetzen(_lex);
    return _lex;
  };
  // ünite kelimesi (aktif ünitenin dosya sırası) ve bütün ünite kelimeleri (tavan dışı)
  let _uniteIds = null;
  const uniteIds = () => _uniteIds || (_uniteIds = new Set(UNITEN.flatMap(U => U.items.map(uMainId).filter(Boolean))));
  // bütün açık ünitelerin kelimeleri (Kapitel'i büyük olan, yani kitapta şu an işlenen önce)
  const uniteSira = () => [].concat(...uAktivler().map(U => U.items.map(it => it.id in _uMain ? _uMain[it.id] : (_uMain[it.id] = uMainId(it))).filter(id => id && gueltig(id + ':x'))));
  // okurken anlamına bakılan, henüz öğrenilmeyen kelimeler (en yeni önce)
  const lesenWortIds = () => { const g = new Set(), out = []; for (let i = S.log.length - 1; i >= 0 && out.length < 30; i--) { const e = S.log[i]; if (e.modus === 'lesen-wort' && e.id && !g.has(e.id)) { g.add(e.id); if (!S.items[e.id] && gueltig(e.id + ':x') && (() => { try { return tierOf(e.id) >= 2; } catch (x) { return false; } })()) out.push(e.id); } } return out; };   // A1 (tier 1: und, in, man) yeni sıranın başına geçmez
  const lemmaOf = id => ({ v: () => vById[id].inf, w: () => wById[id].de, n: () => byId[id].lemma, p: () => '' })[kind(id)]();
  // v5 çekirdeği (js/kern.js): seçim, merdiven, not, kota, göç, senkron için uygulama bağlamı
  Kern.init({ kind, byId, vById, wById, istNdek, istRefl: id => istRefl(id) && !!vById[id].reflDrill,
    tierOf: id => { try { return tierOf(id); } catch (e) { return 2; } },
    base: id => (vById[id] || {}).base || id, plOnly: id => !!(byId[id] || {}).plOnly,
    trKey: id => { try { return trKey(trOf(id)); } catch (e) { return ''; } }, lemma: id => { try { return lemmaOf(id); } catch (e) { return ''; } },
    uluslararasi: id => { try { return uluslararasi(id); } catch (e) { return false; } },
    uniteKonu: id => uniteIds().has(id), konu: id => (THEMA_VON[id] || [])[0] || '',
    ablaut, stark: id => !!(vById[id] || {}).stark, uniteSira, lesenWort: lesenWortIds,
    BLITZ_ORDER: BLITZ_ORDER.map(x => x.id), VERB_ORDER: VERB_ORDER.map(x => x.id),
    tazeCumle: id => { const h = S.kontext[id] || [], p = satzPool(id); return p.own.concat(p.extra).some(x => !h.includes(x.de)); },
    goetheLuecke: id => !!(vById[id] && vById[id].lueckenListe.length),
    lueckeVar: id => satzPool(id).own.some(x => x.tr && wortLuecke(id, x.de)),
    kontextVar: id => kontextSaetze(id).length > 0,
    LEX: { has: w => lexSet().has(String(w).toLowerCase()) } });

  // vadeli hafızalar (Kern.vadeliler): m, yalnız art, kök; isteğe bağlı öğe filtresi
  const faellig = filterFn => Kern.vadeliler(S, now(), filterFn ? id => gueltig(id + ':x') && filterFn(id) : id => gueltig(id + ':x'));
  // veriden kaldırılmış öğeleri atla
  const gueltig = u => {
    const id = itemOf(u), k = kind(id);
    return k === 'v' ? !!vById[id] : k === 'w' ? !!wById[id] : k === 'p' ? !!pById[id] : !!(byId[id] && !byId[id].skip);
  };
  // zayıf: takılan, unutulmuş ya da son cevabı yanlış (anlam ya da artikel)
  function schwach(id) {
    const it = S.items[id];
    return !!it && (!!it.leech || !!(it.m && it.m.S && ((it.m.lapses || 0) > 0 || it.m.lastG === 1)) || !!(it.art && it.art.lastG === 1));
  }
  const paketFertig = pid => !!(S.pakete[pid] && (S.pakete[pid].fertig || (S.pakete[pid].m && S.pakete[pid].m.S)));
  // ertesi günün başı (gece yarısı)
  function morgen(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1); return d.getTime(); }
  // öğrenme günü sayaçları (04:00'te değişir): metin / dikte / kök / yoklama / ek yeni teklifi / bonus tur
  const gs4 = () => { const g = Kern.gun4(now()); if (!S.gs4 || S.gs4.g !== g) S.gs4 = { g, metin: 0, diktat: 0, kok: 0, kokYeni: 0, yoklama: 0, ekYeni: 0, ekYeniTeklif: false, bonus: 0 }; return S.gs4; };
  // kota (Kern.kota): günlük hedef × ret ağırlığı; bonus turlar; dönüş turu; ünite hızlandırma (Ayarlar, varsayılan kapalı)
  function durum4() {
    const gs = gs4(), U = uAktivler()[0];
    let uniteKalan = null;
    if (U && S.ayar4.uniteHizli && S.ayar4.uniteHizli[U.id] && U.bis) uniteKalan = { kalan: uniteSira().filter(id => !S.items[id]).length, gun: Math.max(1, Math.round((new Date(U.bis + 'T23:59:59') - new Date(now())) / DAY)) };
    return { S, kap: gunHedef(), bonus: gs.bonus, donus: !!(session.ot && session.ot.donus), ekYeni: gs.ekYeni, gunSay: gs, uniteKalan };
  }
  const kota = () => Kern.kota(durum4(), now());
  // "öğrenmeye ekle": yeni sıranın başına (yarım öğe: kısa tanıtım + mini soru, günde en çok 3)
  function ogeYarim(id, quelle) { if (S.items[id] || !gueltig(id + ':x')) return false; S.items[id] = { seit: now(), quelle, yarim: 1 }; return true; }
  // Kern.sec sarmalayıcısı: tur boyu, klavyesiz tur (Hızlı tur / ?tur=kisa: b ≤ 1, metin yok), bölüm filtresi (geçerli öğeler)
  function sec() {
    const ot = session.ot, m = session.modus, f = FILTER[m] || FILTER.akis;
    ot.boy = buTurBoyu(); ot.klavyesiz = m === 'blitz';
    ot.filtre = id => gueltig(id + ':x') && f(id);
    const r = Kern.sec(durum4(), ot, now(), Math.random);
    // Zayıflar: vadesi gelmemiş zayıflar da sorulur (R'si en düşük önce; aynı öğe turda aralıklı; hafıza günde tek yazım kuralıyla)
    if (m === 'zayif' && r.tur === 'bitti') {
      const t = now(), son = (ot.gecmis || []).slice(-(Kern.ARA - 1)).map(x => x.id);
      const R0 = id => { const it = S.items[id]; return it.m && it.m.S ? Kern.R(it.m, t) : it.art && it.art.S ? Kern.R(it.art, t) : 0; };
      const ad = Object.keys(S.items).filter(id => ot.filtre(id) && !son.includes(id) && ((S.items[id].m && S.items[id].m.S) || (kind(id) === 'n' && S.items[id].art && S.items[id].art.S))).sort((a, b) => R0(a) - R0(b));
      for (const id of ad) {
        const it = S.items[id];
        if (!(it.m && it.m.S)) return { tur: 'art', kaynak: 'zayif', id, b: 0, bicim: 'artikel', R: R0(id) };
        const bs = Kern.basamak(it, { id, t }, Math.random), bc = Kern.bicimSec(it, bs.b, { id, t }, Math.random, []);
        if (bc) return { tur: 'm', kaynak: 'zayif', id, b: bs.b, bicim: bc.bicim, uretec: bc.uretec, R: R0(id) };
      }
    }
    return r;
  }

  // ================= Soru üretimi =================
  let aktuell = null;

  // sel (Kern.sec) = { tur, id, b (basamak), bicim, uretec, kaynak, neden, deneme, R } → soru; biçim üreticiye bağlanır (§3)
  // ipucu seviyesi (lv): yaz0 / bos0 → 0 (baş harf + uzunluk / fiil verilir), bos → 1, yaz / cumle → 2
  const IPUCU = { yaz0: 0, yaz: 2, bos0: 0, bos: 1, cumle: 2 };
  function frage(sel) {
    lexSet();   // yazım hoşgörüsünün sözlüğü (G.pruefen lemma kipi) ilk soruda kurulur
    const id = sel.id, k = kind(id), b = sel.bicim;
    if (!id || !gueltig(id + ':x')) return null;
    const base = { sel, id, bicim: b, b: sel.b, start: now() };
    let q = null;
    if (b === 'artikel') q = k === 'n' && !byId[id].plOnly ? frageArtikel(byId[id]) : null;
    else if (b === 'kok' || b === 'kokSatz') q = k === 'v' ? (b === 'kokSatz' ? frageStammSatz(vById[id]) : frageStamm(vById[id])) : null;
    else if (b === 'sec') q = frageSecDE(id);
    else if (b === 'anla') q = frageErkennen(id);
    else if (b === 'metinde') { const ks = kontextSaetze(id); if (ks.length) q = frageKontext(id, pick(ks)); else { q = frageSecDE(id); base.bicim = 'sec'; } }
    else if (b === 'yaz0' || b === 'yaz') q = frageYaz(id, b === 'yaz0');
    else if (b === 'bos0' || b === 'bos' || b === 'cumle') {
      q = frageCumle(id, sel.uretec, IPUCU[b]);
      // cümle bulunamadı: yazma (bir basamak aşağı)
      if (!q) { q = frageYaz(id, false); base.bicim = 'yaz'; }
      else if (q.lvGercek != null) base.bicim = q.lvGercek >= 2 ? 'cumle' : q.lvGercek === 1 ? 'bos' : 'bos0';
    }
    if (!q) return null;
    q = Object.assign(base, q, { bicim: base.bicim });
    q.typ = Kern.eskiTur(id, q.bicim, q.uretecGercek || null) || (k === 'v' ? 'bed' : 'erk');
    if (q.ipucuLv == null) q.ipucuLv = q.lvGercek != null ? q.lvGercek : IPUCU[q.bicim] != null ? IPUCU[q.bicim] : null;
    return q;
  }
  function frageYaz(id, ipuclu) {
    const k = kind(id), lv = ipuclu ? 0 : 2;
    const q = k === 'n' ? frageWort(byId[id], lv) : k === 'v' ? frageAbr(vById[id], lv) : frageProd(wById[id], lv);
    q.ipucu = ipuclu ? 1 : 0;
    return q;
  }
  function frageCumle(id, uretec, lv) {
    const k = kind(id);
    if (uretec === 'ndek' && istNdek(id)) return Object.assign(frageNdek(byId[id], lv), { uretecGercek: 'ndek', lvGercek: Math.min(lv, 1) });
    if (uretec === 'refl' && istRefl(id)) { const q = frageRefl(vById[id], lv); return q && Object.assign(q, { uretecGercek: 'refl' }); }
    if (k === 'v') return frageSatz(vById[id], lv, uretec === 'luecke');
    return frageWortSatz(id, lv);
  }
  // baş harf + uzunluk ipucu
  const ipucuHTML = s => `<div class="soluk">İpucu: <code>${esc(String(s).split(' ').map(w => w[0] + '·'.repeat(Math.max(0, w.length - 1))).join(' '))}</code> <span class="soluk">(${String(s).replace(/\s/g, '').length} harf)</span></div>`;

  // ---------- Tanıma (seçmeli) ----------
  // Çeldiriciler: aynı türden, anlamdaşı olmayan; yarısı tanıdığın kelimelerden (daha zor)
  // şık olarak son 10 soruda çıkan kelime yine şık olmasın (aynı kelimeyi her soruda görme)
  const ABLENK_PAUSE = 10;
  const ablenkFrei = x => { const a = session.ablenk || {}; return a[x] == null || session.q - a[x] >= ABLENK_PAUSE; };
  const ablenkMerke = ids => { const a = session.ablenk = session.ablenk || {}; ids.forEach(x => { a[x] = session.q; }); };
  function optionen(id) {
    const k = kind(id);
    const richtig = optTr(trOf(id));
    let pool;
    if (k === 'v') pool = VERBEN.map(v => v.id);
    else if (k === 'w') { const kl = wById[id].kl; pool = WOERTER.filter(w => w.kl === kl).map(w => w.id); if (pool.length < 12) pool = WOERTER.map(w => w.id); }
    else pool = NL.map(n => n.id);
    const verboten = new Set([trKey(trOf(id))]);
    // önce aynı konudan, aynı türden (Wettervorhersage → Wetterbericht, Temperatur …); sonra genel havuz
    const ths = THEMA_VON[id] || [];
    const nah = shuffle([...new Set(ths.flatMap(t => thById[t].items))].filter(x => kind(x) === k && x !== id && gueltig(x + ':x') && ablenkFrei(x))).slice(0, 2);
    const bekannt = shuffle(pool.filter(x => S.items[x] && ablenkFrei(x)));
    const rest = shuffle(pool.filter(ablenkFrei)).concat(shuffle(pool));
    const out = [], texte = new Set([richtig]), ids = [];
    for (const x of nah.concat(bekannt.slice(0, 1), rest)) {
      if (out.length >= 3) break;
      if (x === id || verboten.has(trKey(trOf(x)))) continue;
      const t = optTr(trOf(x));
      // neredeyse anlamdaş olmasın: Türkçede ortak uzun kelime varsa (hava tahmini / hava raporu) atla
      const w = s => s.toLowerCase().split(/[^a-zçğıöşü]+/).filter(x => x.length >= 4);
      if (w(t).some(x => w(richtig).includes(x))) continue;
      if (!t || texte.has(t)) continue;
      texte.add(t); verboten.add(trKey(trOf(x)));
      out.push({ t, ok: false }); ids.push(x);
    }
    ablenkMerke(ids.concat([id]));
    return shuffle(out.concat([{ t: richtig, ok: true }]));
  }

  function erkPrompt(id, frageText, artikelsiz) {
    const k = kind(id);
    let de = artikelsiz && k === 'n' ? `<b>${esc(byId[id].lemma)}</b>` : deItemHTML(id), alt = '';
    if (k === 'v') { const v = vById[id]; de = `<b>${esc(v.anz)}</b>`; }
    if (k === 'w') alt = `<span class="alt">${esc(KL_TR[wById[id].kl])}</span>`;
    return `<div class="soru de buyuk-kelime">${de}${alt}</div>${frageText ? `<div class="soluk">${esc(frageText)}</div>` : ''}`;
  }

  // TR → DE seçmeli (4 şık): isimde biri doğru ismin yanlış artikelli hâli (die / das isimde hep "der": en sık hata);
  // edatlı fiilde biri aynı fiilin yanlış edatlısı (warten für); kalanlar aynı konudan / aynı türden
  const EDATLAR = ['an', 'auf', 'aus', 'bei', 'für', 'gegen', 'in', 'mit', 'nach', 'über', 'um', 'unter', 'von', 'vor', 'zu', 'zwischen', 'durch', 'ohne'];
  function optionenDE(id) {
    const k = kind(id);
    const ziel = label(id);
    const ths = THEMA_VON[id] || [];
    const nah = shuffle([...new Set(ths.flatMap(t => thById[t].items))].filter(x => kind(x) === k && x !== id && gueltig(x + ':x') && ablenkFrei(x))).slice(0, 2);
    const pool0 = k === 'n' ? NL.map(n => n.id) : k === 'v' ? VERBEN.map(v => v.id) : WOERTER.map(w => w.id);
    const pool = shuffle(pool0.filter(ablenkFrei)).concat(shuffle(pool0));
    const out = [], texte = new Set([ziel]), verboten = new Set([trKey(trOf(id))]), ids = [];
    if (k === 'n' && !byId[id].plOnly) {
      const a = byId[id].art, fa = a === 'der' ? pick(['die', 'das']) : 'der', t = fa + ' ' + byId[id].lemma;
      out.push({ t, ok: false, tuzak: 'artikel', verilen: fa }); texte.add(t);
    }
    if (k === 'v') {
      const v = vById[id], p = (v.obj.find(o => o.p) || {}).p;
      if (p) {
        const yp = pick(['auf', 'für', 'an', 'über', 'mit', 'von', 'zu', 'nach'].filter(x => x !== p && !v.anz.split(' ').includes(x)));
        const t = v.anz.replace(new RegExp('(^|\\s)' + p + '(?=\\s|$)'), '$1' + yp);
        if (t !== ziel) { out.push({ t, ok: false, tuzak: 'edat' }); texte.add(t); }
      }
    }
    for (const x of nah.concat(pool)) {
      if (out.length >= 3) break;
      if (verboten.has(trKey(trOf(x)))) continue;
      const t = label(x);
      if (texte.has(t)) continue;
      texte.add(t); verboten.add(trKey(trOf(x)));
      out.push({ t, ok: false }); ids.push(x);
    }
    ablenkMerke(ids.concat([id]));
    return shuffle(out.concat([{ t: ziel, ok: true }]));
  }
  function frageSecDE(id) {
    const k = kind(id);
    return {
      mc: true, optionen: optionenDE(id),
      html: `<div class="tur"><span>Almancası?${k === 'n' && !byId[id].plOnly ? ' · artikeliyle' : k === 'v' && vById[id].obj.some(o => o.p) ? ' · edatıyla' : ''}</span></div><div class="soru buyuk-kelime">${esc(maskTr(kurzTr(trOf(id)), lemmaOf(id)))}</div>`,
      ziel: label(id), frageText: kurzTr(trOf(id)), modus: k === 'v' ? 'bed' : 'erk', artikelli: k === 'n' && !byId[id].plOnly,
      loesungHTML: () => `${deItemHTML(id)} = <b>${esc(trOf(id))}</b>${k === 'v' && vById[id].obj.length ? ` <span class="chip vurgu">${esc(G.objMuster(vById[id]))}</span>` : ''}`,
      erkl: () => (k === 'n' ? [regelHTML(byId[id])] : k === 'v' ? [hallerTR(vById[id])] : []).concat(infoZeilen(id)).filter(Boolean),
    };
  }
  // edatlı fiilde Türkçe hâl karşılaştırması (warten auf + A ← "-i beklemek")
  const HAL_TR = { A: 'Akkusativ (-i hâli gibi: neyi? kimi?)', D: 'Dativ (-e / -de hâli gibi: kime? nerede?)' };
  const hallerTR = v => v.obj.filter(o => o.p).map(o => `<b>${esc(o.p)}</b> + ${o.k === 'A' ? 'A' : 'D'}: ${HAL_TR[o.k] || ''}`).join(' · ');
  // DE → TR (anlam): fiilde yalnız fiil + edat gösterilir (kural 6)
  function frageErkennen(id) {
    return {
      mc: true, optionen: optionen(id),
      html: `<div class="tur"><span>anlamı ne?</span></div>${erkPrompt(id, '')}`,
      ziel: kurzTr(trOf(id)), frageText: label(id), modus: kind(id) === 'v' ? 'bed' : 'erk',
      loesungHTML: () => `${deItemHTML(id)} = <b>${esc(trOf(id))}</b>`,
      erkl: () => infoZeilen(id),
    };
  }

  // ---------- Metinde gör: okuma metinlerinden gerçek cümle, kelime vurgulu ----------
  let _kontextIdx = null;
  function kontextSaetze(id) {
    if (!_kontextIdx) {
      _kontextIdx = {};
      const m = formIdx();
      LT.forEach(t => (t.text || '').split('\n').forEach(par => par.split(/(?<=[.!?])\s+/).forEach(satz => {
        const ws = satz.split(/\s+/);
        if (ws.length < 5 || ws.length > 24 || /^\d+ |—|@|https?:/.test(satz)) return;
        const gesehen = new Set();
        ws.forEach((w, i) => {
          const c = w.replace(/^[„“"(‚]+|[.,!?;:“"”)…’‘]+$/g, '');
          // büyük harfle küçültme yalnız cümle başında (ortadaki "Schienen" isim, scheinen fiili değil)
          const x = m.get(c) || (i === 0 || /[:„“"]$/.test(ws[i - 1]) || /^[„“"]/.test(w) ? m.get(c.charAt(0).toLowerCase() + c.slice(1)) : null);
          if (!x || gesehen.has(x)) return;
          // dönüşlü fiilin cümlesinde dönüşlü zamir yoksa o fiil değildir ("in einigen Gegenden" ≠ sich einigen, "die Krankheit verläuft" ≠ sich verlaufen)
          if (kind(x) === 'v' && vById[x].refl && !/\b(sich|mich|dich|uns|euch)\b/.test(satz)) return;
          gesehen.add(x);
          const l = _kontextIdx[x] = _kontextIdx[x] || [];
          if (l.length < 6) l.push({ s: satz, w: c, q: t.quelle });
        });
      })));
    }
    return _kontextIdx[id] || [];
  }
  function frageKontext(id, k) {
    const satzHTML = esc(k.s).replace(new RegExp('(^|[^\\wäöüÄÖÜß])(' + k.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\wäöüÄÖÜß])'), '$1<mark>$2</mark>');
    return {
      mc: true, optionen: optionen(id),
      html: `<div class="tur"><span class="yeni">metinde</span><span>bu cümlede işaretli kelime ne demek?</span></div>
        <div class="soru de kontext-satz">${satzHTML}</div><div class="soluk">${esc(k.q || '')}</div>`,
      ziel: kurzTr(trOf(id)), frageText: k.s, modus: kind(id) === 'v' ? 'bed' : 'erk', kontextQ: true,
      loesungHTML: () => `${deItemHTML(id)} = <b>${esc(trOf(id))}</b>`,
      erkl: () => infoZeilen(id),
    };
  }

  // tanıtım ve yanlış cevapta gösterilen kısa bilgi
  // fiilin kalıpları (quellen/kaliplar.txt): tanıtımda ve cevap ekranında da görünsün, Kalıplar sayfasında yavan durmasın
  function kalipListe(id, n, ab) {
    const l = (window.KALIPLAR && window.KALIPLAR.fiil && window.KALIPLAR.fiil[id]) || [];
    if (!l.length) return [];
    const s0 = (ab || 0) % l.length;
    return l.slice(s0).concat(l.slice(0, s0)).slice(0, n);
  }
  const kalipZeile = (id, n = 2) => { const l = kalipListe(id, n, session.q); return l.length ? 'Kalıp: ' + l.map(k => `${deHTML(k.de)} <span class="soluk">(${esc(k.tr)})</span>`).join(' · ') : ''; };
  const kalipKutu = id => { const l = kalipListe(id, 3, 0); return l.length ? `<div class="kalip-kutu"><div class="soluk">Kalıplar · bu fiil günlük dilde böyle kullanılır</div><ul class="ornekler">${l.map(k => `<li>${deHTML(k.de)}<br><span class="soluk">${esc(k.tr)}</span></li>`).join('')}</ul></div>` : ''; };
  // örnek cümle her seferinde aynı olmasın: listedeki örnekler sırayla
  const dreh = l => (l && l.length ? l[session.q % l.length] : null);
  function infoZeilen(id) {
    const k = kind(id), out = [];
    if (k === 'n') {
      const n = byId[id];
      if (n.plf && !n.plOnly) out.push(`Çoğul: die ${esc(n.plf)}`);
      const bsp = dreh(n.bsp); if (bsp) out.push('Örnek: ' + deHTML(bsp));
    } else if (k === 'v') {
      const v = vById[id];
      if (v.obj.length) out.push(esc(G.objMuster(v)));
      out.push(`Perfekt: ${esc(v.aux)} ${v.refl ? 'sich ' : ''}${esc(v.p2)}`);
      const bsp = dreh(v.bsp); if (bsp) out.push('Örnek: ' + deHTML(bsp));
      const kz = kalipZeile(id); if (kz) out.push(kz);
    } else if (k === 'w') {
      const bsp = dreh(wById[id].bsp); if (bsp) out.push('Örnek: ' + deHTML(bsp));
    }
    return out;
  }

  // ---------- der / die / das ----------
  function frageArtikel(n) {
    return {
      artFrage: true, modus: 'art',
      html: `<div class="tur"><span>artikel · der / die / das?</span></div>
        <div class="soru de buyuk-kelime">${esc(n.lemma)}</div><div class="soluk">${esc(kurzTr(n.tr))}</div>`,
      ziel: n.art + ' ' + n.lemma, frageText: n.lemma,
      loesungHTML: () => artHTML(n) + (n.plf ? ` <span class="soluk">· Pl. die ${esc(n.plf)}</span>` : ''),
      erkl: () => [],
    };
  }

  // ---------- Tanıtım kartı (yeni parti) ----------
  // tanıtımda: ünite listesindeki kitap cümlesi (Türkçesiyle) ya da kendi çeviri cümlesi; ses düğmesi
  const _uSatz = {};
  function uniteSatz(id) {
    if (id in _uSatz) return _uSatz[id];
    let r = null;
    for (const U of UNITEN) { const it = U.items.find(x => x.bsp && uMainId(x) === id); if (it) { r = { de: it.bsp, tr: it.bspTr }; break; } }
    return (_uSatz[id] = r);
  }
  const sesBtn = de => `<button class="btn mini ses-mini" data-sprich="${esc(de)}" type="button" aria-label="Dinle">🔊</button>`;
  function tanitCumle(id) {
    const u = uniteSatz(id); if (u) return u;
    const k = kind(id), own = (k === 'v' ? SAETZE[id] : NSAETZE[id]) || [];
    if (own[0]) return { de: own[0].de, tr: own[0].tr };
    const bsp = (k === 'v' ? vById[id].bsp : k === 'n' ? byId[id].bsp : wById[id].bsp) || [];
    return bsp[0] ? { de: bsp[0], tr: '' } : null;
  }
  // girdi ve odak yok: artikel bandı, lemma + çoğul, tek cümle + Türkçesi, kural çipi; fiilde kalıp (+A) ve Perfekt,
  // düzensiz fiilde 3 form (formGesehen); varsa kanca. Devam + küçük "Biliyorum, sonra sor" (yoklama 8 soru sonra).
  // kisa: uzun süredir görülmeyen öğe (R < 0,35) ya da yarım öğe: hatırlatma
  function frageTanit(id, opts) {
    opts = opts || {};
    const k = kind(id), cumle = tanitCumle(id);
    let kopf, chips = '', formlar = '';
    if (k === 'n') {
      const n = byId[id], a = n.plOnly ? 'pl' : n.art;
      kopf = `<div class="art-band art-${a}">${n.plOnly ? 'die · çoğul' : n.art}</div>
        <div class="tanit-bas"><span class="kelime">${artHTML(n)}</span>${sesBtn(label(id))}<span class="tr">${esc(n.tr)}</span></div>
        <div class="soluk">${n.plOnly ? 'yalnız çoğul' : n.plf ? 'Çoğul: die ' + esc(n.plf) : 'çoğulu yok'}</div>`;
      chips = regelHTML(n) || '<div class="kural">Kural yok: artikeli kelimeyle birlikte ezberle (kanca yardımcı olur).</div>';
      if (n.weak) chips += `<div class="kural"><b>n-Deklination:</b> den / dem / des ${esc(G.np(n, 'A', { det: 'def' })[1])}</div>`;
    } else if (k === 'v') {
      const v = vById[id];
      kopf = `<div class="tanit-bas"><span class="kelime">${esc(v.anz)}</span>${sesBtn(v.anz.replace('sich(D)', 'sich'))}<span class="tr">${esc(v.tr)}</span></div>`;
      chips = `<div class="chips">${v.obj.length ? `<span class="chip vurgu">${esc(G.objMuster(v))}</span>` : ''}${v.refl ? `<span class="chip">dönüşlü: sich${v.refl === 'D' ? ' (mir / dir)' : ' (mich / dich)'}</span>` : ''}<span class="chip">Perfekt: ${esc(v.aux)} ${v.refl ? 'sich ' : ''}${esc(v.p2s)}</span></div>`;
      if (v.obj.some(o => o.p)) chips += `<div class="soluk">${hallerTR(v)}</div>`;
      if (v.stark) {
        formlar = `<div class="soluk tanit-formen">${formen(v).map(f => `${esc(f.et)}: er ${esc(f.soll)}`).join(' · ')}</div>`;
        (S.formGesehen = S.formGesehen || {})[id] = tag();
        const bs = v.base; S.kok = S.kok || {}; if (v.frmDrill && !S.kok[bs]) S.kok[bs] = { ornek: id, yeni: 1 };
      }
      const kz = kalipZeile(id, 1); if (kz) chips += `<div class="soluk">${kz}</div>`;
    } else {
      const w = wById[id];
      kopf = `<div class="tanit-bas"><span class="kelime">${esc(w.de)}</span>${sesBtn(w.de)}<span class="tr">${esc(w.tr)}</span></div><div class="soluk">${esc(KL_TR[w.kl] || '')}</div>`;
    }
    const satz = cumle ? `<div class="tanit-satz">${deHTML(cumle.de)} ${sesBtn(cumle.de)}${cumle.tr ? `<div class="soluk">${esc(cumle.tr)}</div>` : ''}</div>` : '';
    // tam çekim tablosu "çekim" düğmesinin arkasında (ilk bakışta yalnız Perfekt / 3 form)
    const cekim = k === 'v' ? `<details class="daha"><summary>çekim</summary>${cekimTablo(vById[id])}</details>` : '';
    const soyle = k === 'n' ? label(id) : k === 'v' ? vById[id].anz.replace('sich(D)', 'sich') : wById[id].de;
    return {
      typ: 'tanit', id, kisa: !!opts.kisa, start: now(),
      html: `<div class="q-ust"><div class="tur"><span class="yeni">${opts.kisa ? 'hatırlatma' : 'yeni kelime'}</span><span>${opts.kisa ? 'kısa bir bakış, birazdan sorulacak' : 'tanış'}</span></div>
        ${kopf}${chips}${formlar}${satz}${cekim}${kancaHTML(id)}
        <div class="sesli-soyle">🗣 Sesli söyle: <b>${esc(soyle)}</b></div></div>
        <div class="q-alt">${devamBtn('act', 'tanit-devam')}${opts.kisa ? '' : '<div class="alt-sira" style="justify-content:center"><button class="btn mini bilmiyorum" data-act="tanit-sor" type="button">Biliyorum, sonra sor</button></div>'}</div>`,
    };
  }
  // tam çekim: Präsens (6 kişi), Präteritum, Perfekt; dönüşlüde zamirle
  function cekimTablo(v) {
    const pr = G.praesensForms(v), pt = v.ptForm ? G.praeteritumForms(v.ptForm) : null, pre = v.pre ? ' ' + v.pre : '';
    const rk = v.refl === 'D' ? 'rD' : 'rA';
    const z = (i, pk) => v.refl ? ' ' + G.PERS[pk][rk] : '';
    const sat = [['ich', 0, 'ich'], ['du', 1, 'du'], ['er / sie / es', 2, 'er'], ['wir', 3, 'wir'], ['ihr', 4, 'ihr'], ['sie / Sie', 5, 'sie_pl']];
    return `<table class="cekim-tablo"><tbody>${sat.map(([l, i, pk]) => `<tr><td>${l}</td><td>${esc(pr[i] + z(i, pk) + pre)}</td>${pt ? `<td>${esc(pt[i] + z(i, pk) + pre)}</td>` : ''}</tr>`).join('')}
      <tr><td>Perfekt</td><td colspan="2">er ${esc(v.aux)}${v.refl ? ' sich' : ''} ${esc(v.p2s || v.p2 || '')}</td></tr></tbody></table><div class="soluk">sütunlar: Präsens${pt ? ' · Präteritum' : ''}</div>`;
  }
  // yoklama: tanıtım göstermeden TR→DE yazma ("Bunu belki biliyorsun"); bilmiyorum yok, Göster var
  function frageYoklama(id, kaynak) {
    const q = frageYaz(id, false);
    q.html = q.html.replace(/<div class="tur">[\s\S]*?<\/div>/, '<div class="tur"><span class="yeni">yoklama</span><span>Bunu belki biliyorsun · Almancası?</span></div>');
    return Object.assign(q, { id, yoklama: true, yoklamaKaynak: kaynak, bicim: 'yoklama', b: 2, typ: Kern.eskiTur(id, 'yoklama'), ipucuLv: 2 });
  }

  function ndekTabelle(n) {
    const f = k => G.np(n, k, { det: 'def' }).join(' ');
    const kopf = n.weak ? `<b>n-Deklination:</b> Nominativ dışında her hâlde <b>-${esc(G.np(n, 'A', { det: 'def' })[1].slice(n.lemma.length))}</b>${/ns$/.test(n.gen || '') ? ', Genitiv\'de ayrıca -s' : ''}`
      : '<b>Dikkat:</b> n-Deklination <b>değil</b>, Akk / Dat ek almaz';
    return `<div class="kural">${kopf}</div><div class="formlar">
      <div><span class="et">Nominativ</span>${esc(f('N'))}</div><div><span class="et">Akkusativ</span>${esc(f('A'))}</div>
      <div><span class="et">Dativ</span>${esc(f('D'))}</div><div><span class="et">Genitiv</span>${esc(f('G'))}</div>
      ${n.plf ? `<div><span class="et">Plural</span>die ${esc(n.plf)}</div>` : ''}</div>`;
  }

  function reflTabelle(v) {
    const pr = G.praesensForms(v);
    const k = v.refl === 'D' ? 'rD' : 'rA';
    const es = v.refl === 'D' ? ' es' : '';
    const pre = v.pre ? ' ' + v.pre : '';
    const zeilen = [['ich', 0, 'ich'], ['du', 1, 'du'], ['er / sie', 2, 'er'], ['wir', 3, 'wir'], ['ihr', 4, 'ihr'], ['sie / Sie', 5, 'sie_pl']]
      .map(([l, i, pk]) => `<div><span class="et">${l}</span>${esc(pr[i] + es + ' ' + G.PERS[pk][k] + pre)}</div>`).join('');
    return `<div class="kural"><b>Dönüşlü (${v.refl === 'D' ? 'Dativ: mir / dir' : 'Akkusativ: mich / dich'})</b>${v.refl === 'D' ? ' · Akk nesne: es / den Film …' : ''} · Perfekt: <b>hat sich ${esc(v.p2)}</b></div>
      <div class="formlar">${zeilen}</div>`;
  }

  // ---------- Üretim (yazarak) ----------
  function frageWort(n, lv) {
    const syn = synOf(n.id);
    const synHint = syn.length ? `<div class="soluk">Anlamdaşı var · başı: <code>${esc(synPraefix(n.id, syn))}…</code></div>` : '';
    return {
      html: `<div class="tur"><span>kelime · Türkçe → Almanca</span></div>
        <div class="soru">${esc(maskTr(n.tr, n.lemma))}<span class="alt">Artikeliyle yaz${n.plOnly ? ' (çoğul isim)' : ''}: der / die / das + isim</span></div>${lv === 0 ? ipucuHTML(n.lemma) : synHint}`,
      syn: inp => synTreffer(syn, inp),
      ziel: (n.plOnly ? 'die ' : n.art + ' ') + n.lemma, input: true, placeholder: 'z. B. der Bahnhof',
      pruef: inp => pruefWort(n, inp),
      loesungHTML: () => `${artHTML(n)}${n.plf && !n.plOnly ? ` <span class="soluk">· Pl. die ${esc(n.plf)}</span>` : ''}`,
      erkl: () => [regelHTML(n)].concat((n.bsp || []).slice(0, 1).map(b => 'Örnek: ' + deHTML(b))).filter(Boolean),
      frageText: n.tr,
    };
  }
  // isim: kelime (yazım hoşgörüsüyle) ve artikel ayrı değerlendirilir → kelime ✓ artikel ✗ = m3 / a1 (fast)
  function pruefWort(n, inp) {
    const art = n.plOnly ? 'die' : n.art, ziel = art + ' ' + n.lemma;
    const t = G.norm(inp).split(' ').filter(Boolean);
    const artIn = t.length > 1 && /^(der|die|das)$/i.test(t[0]) ? t[0].toLowerCase() : null;
    const r = G.pruefen(artIn ? t.slice(1).join(' ') : t.join(' '), n.lemma, n.alt || [], { lemma: true });
    const ganz = G.pruefen(inp, ziel);
    if (r.tip === 'yanlis') return { urteil: 'falsch', tip: 'yanlis', tags: ['kelime yanlış'], diff: ganz.diff, ziel };
    const artikel = n.plOnly ? null : { sinandi: true, dogru: artIn === art, verilen: artIn, dogrusu: art, eksik: !artIn };
    const artOk = !artikel || artikel.dogru;
    return { urteil: r.tip === 'dogru' && artOk ? 'richtig' : 'fast', tip: r.tip, artikel, tags: r.tags.filter(x => x !== 'groß/klein' || r.tip !== 'dogru'), diff: ganz.diff, ziel };
  }

  function frageProd(w, lv) {
    const syn = synOf(w.id);
    return {
      syn: inp => synTreffer(syn, inp),
      html: `<div class="tur"><span>${esc(KL_TR[w.kl])} · Türkçe → Almanca</span></div>
        <div class="soru">${esc(maskTr(w.tr, w.de))}</div>
        ${lv === 0 ? ipucuHTML(w.de) : syn.length ? `<div class="soluk">Anlamdaşı var · başı: <code>${esc(synPraefix(w.id, syn))}…</code></div>` : ''}`,
      ziel: w.de, input: true, placeholder: 'Almanca kelime',
      pruef: inp => G.pruefen(inp, w.de, [w.de.replace(/ … /g, ' ').replace(/…/g, '')], { lemma: true }),
      loesungHTML: () => `<b>${esc(w.de)}</b>`,
      erkl: () => (w.bsp || []).slice(0, 1).map(b => 'Örnek: ' + deHTML(b)),
      frageText: w.tr,
    };
  }

  function frageAbr(v, lv) {
    const preps = v.obj.filter(o => o.p);
    const syn = synOf(v.id);
    return {
      syn: inp => synTreffer(syn, inp),
      html: `<div class="tur"><span>fiil · Türkçe → Almanca</span></div>
        <div class="soru">${esc(maskTr(v.tr, v.inf + ' ' + (G.praesensForms(v)[2] || '') + ' ' + (v.ptForm || '') + ' ' + (v.p2 || '')))}${preps.length ? `<span class="alt">Edatla birlikte yaz, ardından hâli: <b>A</b> (Akk) ya da <b>D</b> (Dat). Örnek: sich freuen auf A</span>` : v.refl ? '<span class="alt">Gerekiyorsa sich ile yaz.</span>' : ''}</div>
        ${lv === 0 ? ipucuHTML(v.anz.replace('sich(D)', 'sich')) : syn.length ? `<div class="soluk">Anlamdaşı var · başı: <code>${esc(synPraefix(v.id, syn))}…</code></div>` : ''}`,
      ziel: v.anz + (v.obj.length ? ' (' + G.objMuster(v) + ')' : ''), input: true,
      placeholder: preps.length ? 'z. B. warten auf A' : 'Almanca fiil',
      pruef: inp => pruefAbr(v, inp),
      loesungHTML: () => `<b>${esc(v.anz)}</b>${v.obj.length ? ` <span class="chip vurgu">${esc(G.objMuster(v))}</span>` : ''}`,
      erkl: () => [(v.refl === 'D' ? 'Dativ dönüşlü: <b>mir / dir / sich</b>' : v.refl ? 'Dönüşlü fiil: <b>mich / dich / sich / uns / euch</b>' : ''), hallerTR(v)].concat(v.bsp && v.bsp[0] ? ['Örnek: ' + deHTML(v.bsp[0])] : [], [kalipZeile(v.id)]).filter(Boolean),
      frageText: v.tr,
    };
  }
  // Başka bir anlamdaşı yazdıysa: yanlış sayılmaz, tekrar denetilir
  function synTreffer(ids, inp) {
    const u = G.norm(inp.replace(/\+/g, ' ')).toLowerCase().replace(/\s+(a|akk|d|dat)$/g, '').replace(/\s+(a|d)\s+/g, ' ');
    for (const id of ids) {
      const k = kind(id);
      const w = k === 'v' ? vById[id].anz.replace('sich(D)', 'sich') : label(id);
      const bare = k === 'n' ? byId[id].lemma : w;
      if (u === w.toLowerCase() || u === bare.toLowerCase() || u === w.replace(/^sich /, '').toLowerCase()) return w;
    }
    return null;
  }

  // fiil (§4.2): hâl (A/D) yanlış → m2 · edat ya da sich yanlış / eksik → m1 · mastar eki eksik → m3 (+0,7) · yazım → m3 (+0,7)
  function pruefAbr(v, inp) {
    const preps = v.obj.filter(o => o.p), zPrep = new Set(preps.map(p => p.p));
    const toks = G.norm(inp.replace(/\+/g, ' ')).split(' ').filter(Boolean);
    const kas = {}, out = [];
    toks.forEach((t, i) => {
      if (/^(a|akk|akkusativ|d|dat|dativ)\.?$/i.test(t) && i > 0 && EDATLAR.includes(toks[i - 1].toLowerCase())) kas[toks[i - 1].toLowerCase()] = t[0].toUpperCase();
      else out.push(t);
    });
    const ziel = v.anz.replace('sich(D)', 'sich');
    const ganz = G.pruefen(out.join(' '), ziel);
    const r = G.pruefen(out.join(' '), ziel, [], { lemma: true });
    let tip = r.tip, tags = r.tip === 'yanlis' ? [] : r.tags.slice();
    if (tip === 'yanlis') {
      // tanı: fiilin kendisi doğru mu (sich ve edatlar çıkarılınca)?
      const ZT = ziel.split(' '), coreZ = ZT.filter(w => w !== 'sich' && !zPrep.has(w)), coreZl = coreZ.map(w => w.toLowerCase());
      const coreU = out.filter(w => !/^sich$/i.test(w) && !(EDATLAR.includes(w.toLowerCase()) && !coreZl.includes(w.toLowerCase())));
      const cr = G.pruefen(coreU.join(' '), coreZ.join(' '), [], { lemma: true });
      const sonU = (coreU[coreU.length - 1] || '').toLowerCase(), sonZ = (coreZ[coreZ.length - 1] || '').toLowerCase();
      const mastar = cr.tip === 'yanlis' && coreU.length === coreZ.length && sonU.length >= 3 && (sonU + 'n' === sonZ || sonU + 'en' === sonZ);
      if (cr.tip !== 'yanlis' || mastar) {
        const uPrep = out.map(w => w.toLowerCase()).filter(w => EDATLAR.includes(w) && !coreZl.includes(w));
        const sichU = out.some(w => /^sich$/i.test(w)), sichZ = ZT.includes('sich');
        if (preps.some(p => !uPrep.includes(p.p)) || uPrep.some(p => !zPrep.has(p))) { tip = 'edat'; tags = [`edat: ${preps.map(p => p.p + ' + ' + (p.k === 'A' ? 'Akk' : 'Dat')).join(', ') || 'edatsız'}`]; }
        else if (sichU !== sichZ) { tip = 'donuslu'; tags = [sichZ ? 'sich eksik' : 'sich fazla']; }
        else if (mastar) { tip = 'mastar'; tags = []; }
        else { tip = cr.tip; tags = cr.tags.slice(); }
      }
    }
    if (['dogru', 'yazim', 'umlaut', 'mastar'].includes(tip)) {
      preps.forEach(p => { if (kas[p.p] && kas[p.p] !== p.k) { tip = 'hal'; tags.push(`hâl: ${p.p} + ${p.k === 'A' ? 'Akk' : 'Dat'}`); } });
    }
    const urteil = tip === 'dogru' ? 'richtig' : ['yazim', 'umlaut', 'mastar', 'hal'].includes(tip) ? 'fast' : 'falsch';
    return { urteil, tip, tags, diff: ganz.diff, ziel };
  }

  // Cümle (fiil): çoğunlukla çeviri cümlesinde boşluk / tam cümle; goethe: Goethe örneğinde boşluk (dörtte bir, Kern); kalıptan görev yedek
  function frageSatz(v, lv, goethe) {
    const hist = S.kontext[v.id] || [];
    const ue = SAETZE[v.id] || [];
    if (!goethe || !v.lueckenListe.length) {
      const q = frageUebersetzen(v, lv, ue);
      if (q) return q;
    }
    if (!v.lueckenListe.length) {
      if (!v.rahmen) return null;
      let u = null;
      for (let i = 0; i < 6; i++) { u = G.uebung(v, Math.min(lv, 1), Math.random, OPTS); if (u && !hist.includes(u.de)) break; }
      return u ? Object.assign(satzAusUebung(v, u, lv), { lvGercek: Math.min(lv, 1) }) : null;
    }
    const cands = v.lueckenListe.filter(l => !hist.includes(l.text));
    const l = cands.length ? pick(cands) : pick(v.lueckenListe);
    const lv1 = Math.min(lv, 1);
    return {
      html: `<div class="tur"><span>cümle · boşluk doldur (Goethe örneği)</span></div>
        <div class="soru">${deHTML(l.text).replace(/_____/g, '<span class="bosluk">_____</span>')}</div>
        <div class="chips"><span class="chip vurgu">${esc(v.tr)}</span>${lv1 === 0 && l.answer.toLowerCase() !== v.inf.toLowerCase() ? `<span class="chip">${esc(v.anz)}</span>` : ''}${l.n > 1 ? `<span class="chip">${l.n} boşluk: sırayla, boşlukla ayırarak yaz</span>` : ''}</div>`,
      ziel: l.answer, input: true, placeholder: 'eksik kelime(ler)', kontext: l.text, modus: 'luecke', lvGercek: lv1,
      pruef: inp => G.pruefen(inp, l.answer),
      loesungHTML: () => { const w = l.answer.split(' '); let i = 0; return deHTML(l.text.replace(/_____/g, () => w[i++] || '')); },
      erkl: () => [`${esc(v.anz)}: ${esc(v.tr)}`, kalipZeile(v.id)],
      frageText: l.text,
    };
  }

  // ---------- Kademeli cümle: 1) yardımlı boşluk 2) yardımsız boşluk 3) sıfırdan cümle ----------
  // kelimenin cümledeki biçimini bul (fiil: çekimli biçim + ayrılan önek; isim: tekil / çoğul / ekli; diğer: sıfat ekli)
  function wortLuecke(id, satz) {
    const k = kind(id);
    if (k === 'v') return G.luecke(vById[id], satz);
    const toks = satz.split(/\s+/);
    const clean = t => t.replace(/^[„“"(]+|[.,!?;:“"”)…]+$/g, '');
    let ok;
    if (k === 'n') {
      const n = byId[id], ls = [n.lemma, n.plf].filter(Boolean);
      ok = c => ls.some(l => c === l || (c.startsWith(l) && c.length - l.length <= 2));
    } else {
      const w = wById[id].de.split(/[ …]+/)[0].toLowerCase();
      if (w.length < 2) return null;
      ok = c => { const lc = c.toLowerCase(); return lc === w || (w.length >= 4 && lc.startsWith(w) && lc.length - w.length <= 3); };
    }
    const i = toks.findIndex(t => ok(clean(t)));
    if (i < 0) return null;
    return { text: toks.map((t, j) => j === i ? t.replace(clean(t), '_____') : t).join(' '), answer: clean(toks[i]), n: 1 };
  }
  // tam cümle sorusunda: cümlede geçen, iyi bilmediğin kelimeler (hedef kelime hariç) Almanca = Türkçe
  let _lemmaIdx = null;
  function lemmaIdx() {
    if (_lemmaIdx) return _lemmaIdx;
    _lemmaIdx = new Map();
    NL.forEach(n => { _lemmaIdx.set((n.plOnly ? 'die ' : n.art + ' ') + n.lemma, n.id); });
    VERBEN.forEach(v => { _lemmaIdx.set(v.inf, v.id); _lemmaIdx.set(v.anz.replace('sich(D)', 'sich'), v.id); });
    WOERTER.forEach(w => _lemmaIdx.set(w.de, w.id));
    return _lemmaIdx;
  }
  const gutBekannt = id => !!S.items[id] && (!!S.items[id].a1 || ((S.items[id].m || {}).S || 0) >= 10);
  function hilfeHTML(de, zielId) {
    const g = GLOSSEN[de];
    if (!g) return '';
    const teile = g.split(/\s*;\s*/).map(x => x.split(/\s*=\s*/)).filter(x => x.length === 2).filter(([d]) => {
      const id = lemmaIdx().get(d.trim());
      return id !== zielId && !(id && gutBekannt(id));
    });
    if (!teile.length) return '';
    return `<div class="chips"><span class="soluk">Yardım:</span>${teile.map(([d, t]) => `<span class="chip">${deHTML(d)} = ${esc(t)}</span>`).join('')}</div>`;
  }
  const STUFE_TR = ['boşluk · ipuçlu', 'boşluk', 'tam cümle'];
  // Cümle havuzu: kendi çeviri cümleleri (Türkçesiyle) + Goethe listesinin örnek cümleleri + okuma metinlerinden gerçek cümleler.
  // Tek cümleli kelimede hep aynı cümle gelince cümle ezberleniyordu, kelime değil. En az kullanılan önce (S.kontext: son 12 cümle).
  const _satzPool = {};
  function satzPool(id) {
    if (_satzPool[id]) return _satzPool[id];
    const k = kind(id);
    const own = ((k === 'v' ? SAETZE[id] : NSAETZE[id]) || []).map(x => ({ de: x.de, tr: x.tr }));
    const seen = new Set(own.map(x => x.de)), extra = [];
    const add = (de, quelle) => {
      if (!de || seen.has(de) || !/[.!?]$/.test(de.trim())) return;
      const n = de.split(/\s+/).length;
      if (n < 4 || n > 22 || !wortLuecke(id, de)) return;
      seen.add(de); extra.push({ de, quelle });
    };
    ((k === 'v' ? vById[id].bsp : k === 'n' ? byId[id].bsp : wById[id].bsp) || []).forEach(de => add(de, 'Goethe-Wortliste'));
    kontextSaetze(id).forEach(x => add(x.s, x.q));
    return (_satzPool[id] = { own, extra });
  }
  // cümle seçimi; kullandığı ipucu seviyesini döndürür (lv: 0 ipuçlu boşluk, 1 boşluk, 2 tam cümle)
  function satzWahl(id, lv) {
    const hist = S.kontext[id] || [], { own, extra } = satzPool(id);
    const frisch = l => l.filter(x => !hist.includes(x.de));
    const aeltest = l => l.slice().sort((a, b) => hist.lastIndexOf(a.de) - hist.lastIndexOf(b.de))[0];
    if (lv >= 2) {
      // tam cümle: Türkçesi olan cümle; hepsi yakın zamanda sorulduysa başka cümlede boşluk (aynı çeviriyi ezberlememek için)
      const f = frisch(own.filter(x => x.tr));
      if (f.length) return { x: pick(f), voll: true, lv: 2 };
      const e = frisch(extra);
      if (e.length) return { x: pick(e), voll: false, lv: 1 };
      const o = own.filter(x => x.tr);
      return o.length ? { x: aeltest(o), voll: true, lv: 2 } : extra.length ? { x: aeltest(extra), voll: false, lv: 1 } : null;
    }
    const alle = own.concat(extra), f = frisch(alle);
    if (f.length) return { x: pick(f), voll: false, lv };
    return alle.length ? { x: aeltest(alle), voll: false, lv } : null;
  }
  function frageLueckeStufe(id, x, lv, hinweisHTML, modus) {
    const l = wortLuecke(id, x.de);
    if (!l) return null;
    return {
      html: `<div class="tur"><span>${esc(STUFE_TR[Math.min(lv, 1)])}${x.tr ? '' : ' · gerçek metinden'}</span></div>
        <div class="soluk">${x.tr ? esc(x.tr) : `aranan: <b>${esc(kurzTr(trOf(id)))}</b>${x.quelle ? ' · ' + esc(x.quelle) : ''}`}</div>
        <div class="soru">${deHTML(l.text).replace(/_____/g, '<span class="bosluk">_____</span>')}</div>
        ${lv === 0 && hinweisHTML ? `<div class="chips">${hinweisHTML}</div>` : ''}${l.n > 1 ? '<div class="soluk">2 boşluk: sırayla, aralarına boşluk koyarak yaz.</div>' : ''}`,
      ziel: l.answer, input: true, placeholder: 'boşluktaki kelime(ler)', kontext: x.de, modus, lvGercek: Math.min(lv, 1),
      pruef: inp => G.pruefen(inp, l.answer),
      loesungHTML: () => deHTML(x.de),
      erkl: () => [`${deItemHTML(id)}: ${esc(trOf(id))}`],
      frageText: l.text,
    };
  }
  // tam cümle: hedef kelimenin cümledeki biçimi (cevapta varsa hata başka yerde → m3, fast)
  const hedefForm = (id, de) => { const l = wortLuecke(id, de); return l ? l.answer : ''; };

  function frageUebersetzen(v, lv, ue) {
    const w = satzWahl(v.id, lv);
    if (!w) return null;
    let x = w.x;
    if (!w.voll) {
      const q = frageLueckeStufe(v.id, x, w.lv, `<span class="chip vurgu">${esc(v.anz)}${v.obj.length ? ' · ' + esc(G.objMuster(v)) : ''}</span>`, 'satz');
      if (q) return q;
      x = x.tr ? x : (ue || []).find(y => y.tr);
      if (!x) return null;
    }
    // tam cümle: ipucu yok (merdivenin en üst basamağı)
    return {
      html: `<div class="tur"><span>${STUFE_TR[2]} · Almancaya çevir</span></div>
        <div class="soru">${esc(x.tr)}</div>${hilfeHTML(x.de, v.id)}`,
      ziel: x.de, input: true, placeholder: 'Almanca cümle', kontext: x.de, modus: 'satz', voll: true, lvGercek: 2, hedefForm: hedefForm(v.id, x.de),
      pruef: inp => G.pruefen(inp, x.de),
      loesungHTML: () => deHTML(x.de),
      erkl: () => [`<b>${esc(v.anz)}</b>${v.obj.length ? ' · ' + esc(G.objMuster(v)) : ''}: ${esc(v.tr)}`, kalipZeile(v.id), 'Farklı ama doğru bir çeviri yazdıysan "aslında doğru" de (Claude log\'dan kontrol eder).'],
      frageText: x.tr,
    };
  }

  // ---------- Kelime cümle içinde: Türkçe cümle → Almanca (isim / diğer kelime) ----------
  function frageWortSatz(id, lv) {
    const ue = NSAETZE[id] || [];
    const w = satzWahl(id, lv);
    if (!w) return null;
    let x = w.x;
    const k = kind(id), wort = k === 'n' ? byId[id].lemma : wById[id].de;
    const art = k === 'n' ? (byId[id].plOnly ? 'die (Pl.)' : byId[id].art) : '';
    // ipucu: 0 → artikel + baş harfler + anlam; 1 → yok (cümle bağlamı)
    const kopf = wort.split(' ').map(w => w.slice(0, 2) + '·'.repeat(Math.max(0, w.length - 2))).join(' ');
    if (!w.voll) {
      const q = frageLueckeStufe(id, x, w.lv, `<span class="chip vurgu">${art ? `<span class="art art-${art.startsWith('die (') ? 'pl' : art}">${esc(art)}</span> ` : ''}${esc(kopf)} · ${esc(kurzTr(trOf(id)))}</span>`, 'nsatz');
      if (q) return q;
      x = x.tr ? x : ue.find(y => y.tr);
      if (!x) return null;
    }
    return {
      html: `<div class="tur"><span>${esc(STUFE_TR[2])} · Almancaya çevir</span></div>
        <div class="soru">${esc(x.tr)}</div>${hilfeHTML(x.de, id)}`,
      ziel: x.de, input: true, placeholder: 'Almanca cümle', kontext: x.de, modus: 'nsatz', voll: true, lvGercek: 2, hedefForm: hedefForm(id, x.de),
      pruef: inp => G.pruefen(inp, x.de),
      loesungHTML: () => deHTML(x.de),
      erkl: () => [`${deItemHTML(id)}: ${esc(trOf(id))}`, 'Farklı ama doğru bir çeviri yazdıysan "aslında doğru" de (Claude log\'dan kontrol eder).'],
      frageText: x.tr,
    };
  }

  function frageNdek(n, lv) {
    const a = G.ndekAufgabe(n, Math.random, lv);
    const text = deHTML(a.text).replace('___', '<span class="bosluk">_____</span>');
    return {
      html: `<div class="tur"><span>n-Deklination · boşluğa isim öbeğini yaz</span></div>
        <div class="soru">${text}</div>
        <div class="chips"><span class="chip vurgu">${artHTML(n)} · ${esc(kurzTr(n.tr))}</span><span class="chip">${esc(a.detTr)}</span>${lv === 0 ? `<span class="chip">${G.KASUS_TR[a.kasus]}</span>` : ''}</div>`,
      ziel: a.antwort, input: true, placeholder: 'z. B. den Kollegen', modus: 'ndek', kontext: a.satz,
      pruef: inp => {
        const r = G.pruefen(inp, a.antwort, a.alts);
        if (r.urteil !== 'richtig') {
          const u = G.norm(inp).split(' ').pop();
          const soll = a.antwort.split(' ').pop();
          if (n.weak && a.kasus !== 'N' && u === n.lemma) r.tags.push('n-Deklination: -n eksik');
          if (!n.weak && u !== soll && u.startsWith(n.lemma) && a.kasus !== 'G') r.tags.push('n-Deklination değil: ek yok');
          if (n.weak && a.kasus === 'N' && u !== n.lemma) r.tags.push('Nominativ: ek yok');
        }
        return r;
      },
      loesungHTML: () => deHTML(a.satz),
      erkl: () => a.erkl,
      frageText: a.text + ' [' + a.detTr + ']',
    };
  }

  // ---------- Düzensiz fiiller: Präteritum + Perfekt ----------
  VERBEN.forEach(v => { v.p2s = String(v.p2 || '').replace(/\s*\(.*$/, '').split('/')[0].trim(); });
  const MODALV = new Set(['können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen', 'möchten']);
  // fiilin 3 temel biçimi: er-Präsens, Präteritum, Perfekt (modal fiillerde Perfekt sorulmaz)
  function formen(v) {
    const f = G.praesensForms(v), sich = v.refl ? ' sich' : '', pre = v.pre ? ' ' + v.pre : '';
    const out = [{ et: 'Präsens (er/sie)', soll: f[2] + sich + pre, ohne: f[2] }, { et: 'Präteritum', soll: v.ptForm + sich + pre, ohne: v.ptForm }];
    if (!MODALV.has(v.inf)) out.push({ et: 'Perfekt', soll: `${v.aux}${sich} ${v.p2s}`, alt: v.auxAlt ? `${v.auxAlt}${sich} ${v.p2s}` : null, ohne: `${v.aux} ${v.p2s}` });
    return out;
  }
  // kök sorusu: Präteritum yalnız PRAET_URETIM fiillerinde (diğerlerinde er-Präsens + Perfekt); modalde Perfekt yok
  const stammFormen = v => PRAET_URETIM.has(v.inf) ? formen(v) : formen(v).filter(x => x.et !== 'Präteritum');
  const stammZiel = v => stammFormen(v).map(x => x.soll).join(', ');
  // kök yeni (S_k < 7): cümlede Perfekt, mastar verili (modalde Präteritum)
  function frageStammSatz(v) {
    const modal = MODALV.has(v.inf), hedef = modal ? v.ptForm : v.p2s;
    if (!hedef) return frageStamm(v);
    const re = new RegExp('(^|[\\s„“"(])(' + hedef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=[\\s.,!?;:“"”)]|$)');
    const ks = (SAETZE[v.id] || []).concat((v.bsp || []).map(de => ({ de, tr: '' }))).filter(x => re.test(x.de) && x.de.split(/\s+/).length <= 18);
    const pr = inp => {
      const r = G.pruefen(inp, hedef, [], { lemma: true });
      const yanlis = r.tip === 'dogru' ? 0 : (r.tip === 'yazim' || r.tip === 'umlaut') ? 1 : 2;
      return { urteil: yanlis === 0 ? 'richtig' : yanlis === 1 ? 'fast' : 'falsch', tip: 'stamm', yanlis, tags: yanlis ? [`${modal ? 'Präteritum' : 'Partizip'}: ${hedef}`] : [], diff: r.diff, ziel: hedef };
    };
    const kopf = `<div class="tur"><span>fiil · ${modal ? 'Präteritum' : 'Perfekt'} · cümlede</span></div>`;
    if (ks.length) {
      const x = pick(ks), text = x.de.replace(re, '$1_____');
      return {
        html: `${kopf}${x.tr ? `<div class="soluk">${esc(x.tr)}</div>` : ''}<div class="soru">${deHTML(text).replace(/_____/g, '<span class="bosluk">_____</span>')}</div>
          <div class="chips"><span class="chip vurgu">${esc(v.inf)}</span><span class="chip">${modal ? 'Präteritum' : 'Partizip II (Perfekt)'}</span></div>`,
        ziel: hedef, input: true, placeholder: modal ? 'z. B. konnte' : 'z. B. gefahren', modus: 'stamm', kontext: x.de,
        pruef: pr, loesungHTML: () => deHTML(x.de),
        erkl: () => [`${esc(v.anz)}: ${stammFormen(v).map(f => 'er ' + esc(f.soll)).join(' · ')}`, modal ? 'Modal fiil: geçmişte Präteritum' : v.aux === 'ist' ? 'Perfekt <b>sein</b> ile (hareket / durum değişikliği)' : 'Perfekt <b>haben</b> ile'],
        frageText: text,
      };
    }
    // yedek: cümle yoksa er / sie + Perfekt (Partizip)
    return {
      html: `${kopf.replace(' · cümlede', '')}<div class="soru de">er / sie ${modal ? '' : esc(v.aux) + (v.refl ? ' sich' : '') + ' '}_____ <span class="soluk">(${esc(v.inf)})</span></div><div class="soluk">${esc(v.tr)}</div>`,
      ziel: hedef, input: true, placeholder: modal ? 'z. B. konnte' : 'z. B. gefahren', modus: 'stamm',
      pruef: pr, loesungHTML: () => `er ${modal ? '' : esc(v.aux) + ' '}<b>${esc(hedef)}</b>`,
      erkl: () => [`${esc(v.anz)}: ${stammFormen(v).map(f => 'er ' + esc(f.soll)).join(' · ')}`],
      frageText: `${v.inf} — ${modal ? 'Präteritum' : 'Perfekt'}`,
    };
  }
  function frageStamm(v) {
    const fs = stammFormen(v);
    return {
      html: `<div class="tur"><span>fiil · çekimler</span></div>
        <div class="soru de">${esc(v.anz)}<span class="alt">${esc(v.tr)}</span></div>
        <div class="chips"><span class="chip vurgu">er / sie · ${fs.map(x => x.et.replace(' (er/sie)', '')).join(', ')}</span></div>`,
      ziel: stammZiel(v), input: true, placeholder: fs.length === 3 ? 'z. B. fährt, fuhr, ist gefahren' : fs[1] && fs[1].et === 'Perfekt' ? 'z. B. fährt, ist gefahren' : 'z. B. kann, konnte', modus: 'stamm',
      pruef: inp => pruefStamm(v, inp),
      loesungHTML: () => fs.map(x => `er <b>${esc(x.soll)}</b>`).join(' · '),
      erkl: () => [MODALV.has(v.inf) ? 'Modal fiil: geçmiş zaman Präteritum ile' : v.aux === 'ist' ? 'Perfekt <b>sein</b> ile (hareket / durum değişikliği)' : 'Perfekt <b>haben</b> ile'].concat((SAETZE[v.id] || []).slice(0, 1).map(x => 'Örnek: ' + deHTML(x.de)), [kalipZeile(v.id, 1)]),
      frageText: `${v.inf} — ${fs.map(x => x.et).join(', ')}`,
    };
  }
  // Stammform: hepsi doğru / biri yanlış (yardımcı fiil dahil) / ikisi ya da fazlası → kök 3 / 2 / 1
  function pruefStamm(v, inp) {
    const fs = stammFormen(v);
    const teile = G.norm(inp).split(/\s*[,;\/–]\s*|\s+-\s+/).map(x => x.replace(/^(er|sie|es)\s+/i, '').trim()).filter(Boolean);
    const tags = [];
    let yanlis = 0;
    fs.forEach((x, i) => {
      const r = G.pruefen(teile[i] || '', x.soll, [x.ohne, x.alt].filter(Boolean));
      if (r.urteil === 'richtig') return;
      if (r.urteil === 'falsch') yanlis++;
      const au = (teile[i] || '').split(' ')[0];
      tags.push(x.et === 'Perfekt' && /^(hat|ist)$/.test(au) && au !== v.aux ? `yardımcı fiil: ${v.aux}` : `${x.et}: ${x.soll}`);
    });
    const urteil = yanlis >= 2 ? 'falsch' : tags.length ? 'fast' : 'richtig';
    const ganz = G.pruefen(teile.join(', '), stammZiel(v));
    return { urteil, tip: 'stamm', yanlis: Math.min(2, yanlis + (yanlis === 0 && tags.length ? 0 : 0)), tags, diff: ganz.diff, ziel: stammZiel(v) };
  }
  // dönüşlü zamir alıştırması (Kern: B3'te üçte bir): kısa cümle, özne ich / du (zamir sich'ten farklı); olmazsa çeviri cümlesi
  function frageRefl(v, lv) {
    if (G.NUR_3.includes(v.base) || v.base === 'einigen') {
      const q = frageUebersetzen(v, lv, SAETZE_REFL[v.id] || SAETZE[v.id] || []);
      if (!q) return null;
      q.html = q.html.replace('Almancaya çevir', 'dönüşlü fiil · Almancaya çevir');
      if (lv <= 1) q.html += `<div class="soluk">Dönüşlü zamir: ${v.refl === 'D' ? 'mir / dir / sich / uns / euch (Dativ)' : 'mich / dich / sich / uns / euch'}</div>`;
      q.modus = 'refl';
      return q;
    }
    const a = G.reflAufgabe(v, Math.random, Object.assign({ ozne: ['ich', 'du'] }, OPTS));
    return {
      html: `<div class="tur"><span>dönüşlü fiil · kısa cümle kur</span></div>
        <div class="gorev">
          <div class="gorev-satir"><span class="et">fiil</span><span><b>${esc(v.anz)}</b><span class="de-ipucu">${esc(v.tr)}</span></span></div>
          <div class="gorev-satir"><span class="et">kim · zaman</span><span><b>${esc(a.tr)}</b></span></div>
          ${a.objZeig ? `<div class="gorev-satir"><span class="et">nesne</span><span>${esc(a.objZeig)}</span></div>` : ''}
        </div>
        ${a.esHinweis ? '<div class="soluk">Akk nesne olarak <b>es</b> kullan (örnek: Ich sehe es mir an).</div>' : ''}`,
      ziel: a.satz, alts: a.alts, input: true, placeholder: a.typ === 'imp' ? 'z. B. Beeil dich!' : 'z. B. ich freue mich', modus: 'refl', kontext: a.satz, lvGercek: Math.min(lv, 1),
      pruef: inp => G.pruefen(inp, a.satz, a.alts),
      loesungHTML: () => deHTML(a.satz),
      erkl: () => a.erkl,
      frageText: `${v.anz} | ${a.tr}${a.objZeig ? ' | ' + a.objZeig : ''}`,
    };
  }

  function satzAusUebung(v, u, lv) {
    const p = u.prompt;
    const obj = p.objs.map(o => {
      if (o.frage) return `<span class="nesne"><b>?</b> <span class="soluk">(bunu soru kelimesiyle sor)</span></span>`;
      if (o.pron) return `<span class="nesne"><b>${esc(o.tr)}</b> <span class="soluk">(zamir)</span></span>`;
      const art = o.art.startsWith('die (Pl') ? 'pl' : o.art;
      const pre = [o.poss ? esc(o.poss) : '', o.indef ? '<span class="soluk">bir</span>' : '', o.adj ? esc(ADJ_TR[o.adj] || o.adj) : ''].filter(Boolean).join(' ');
      return `<span class="nesne">${pre ? pre + ' ' : ''}<b>${esc(kurzTr(o.tr))}</b> <span class="art art-${art}">${esc(o.art)}</span>${o.de ? `<span class="de-ipucu">${esc(o.de)}</span>` : ''}${o.bare ? ' <span class="soluk">(artikelsiz)</span>' : ''}</span>`;
    }).join('');
    let subj = p.subj ? `<b>${esc(p.subj)}</b>` : '';
    if (p.subjNP) { const a = p.subjNP.art.startsWith('die (Pl') ? 'pl' : p.subjNP.art; subj = `<b>${esc(kurzTr(p.subjNP.tr))}</b> <span class="art art-${a}">${esc(p.subjNP.art)}</span>${p.subjNP.de ? `<span class="de-ipucu">${esc(p.subjNP.de)}</span>` : ''}`; }
    return {
      html: `<div class="tur"><span>cümle kur · Türkçe → Almanca</span></div>
        <div class="gorev">
          <div class="gorev-satir"><span class="et">fiil</span><span><b>${esc(p.verb.tr)}</b>${p.verb.de ? `<span class="de-ipucu">${esc(p.verb.de)}</span>` : ''}</span></div>
          <div class="gorev-satir"><span class="et">özne</span><span>${subj}</span></div>
          ${obj ? `<div class="gorev-satir"><span class="et">nesne</span><span>${obj}</span></div>` : ''}
        </div>
        <div class="chips">${p.chips.map((c, i) => `<span class="chip ${i === 0 ? 'vurgu' : c === 'olumsuz' ? 'olumsuz' : ''}">${esc(c)}</span>`).join('')}</div>`,
      ziel: u.de, alts: u.alts, input: true, placeholder: 'Almanca cümle', kontext: u.de, modus: 'satz',
      pruef: inp => G.pruefen(inp, u.de, u.alts),
      loesungHTML: () => deHTML(u.de),
      erkl: () => u.erkl,
      frageText: `${p.verb.tr} | ${p.subj || (p.subjNP && p.subjNP.tr) || ''} | ${p.objs.map(o => o.tr).join(', ')} | ${p.chips.join(', ')}`,
    };
  }

  // ---------- Paketler ----------
  function paketNeu(pid) {
    const t = now();
    const p = pById[pid];
    if (!S.pakete[pid]) {
      S.pakete[pid] = { start: t };
      heuteM('paket').neu++;
      // kelimeler metin okunup boşluklara geçilince yarım öğe olur (paketWeiter); yalnız açıp çıkmak işaretlemez
    }
    save();
    return { typ: 'paket', pid, uid: pid + ':pak', schritt: 'liste', i: 0, erg: [], neuPaket: true, start: t, schrittStart: t };
  }
  function paketWiederholung(pid) {
    return { typ: 'paket', pid, schritt: 'luecke', i: 0, erg: [], neuPaket: false, schrittStart: now() };
  }
  // paket seçimi: yarıda kalan yeni paket → vadesi gelen paket tekrarı (S.pakete[pid].m) → yeni paket (günde bir)
  // paketSec ve Bugün kartı aynı karardan: { tur: 'offen' | 'vadeli' | 'yeni', p } ya da null
  function paketPlan() {
    const t = now();
    const offen = PAKETE.find(p => S.pakete[p.id] && !paketFertig(p.id));
    if (offen) return { tur: 'offen', p: offen };
    const vad = PAKETE.filter(p => S.pakete[p.id] && S.pakete[p.id].m && S.pakete[p.id].m.S && S.pakete[p.id].m.due <= t).sort((a, b) => S.pakete[a.id].m.due - S.pakete[b.id].m.due)[0];
    if (vad) return { tur: 'vadeli', p: vad };
    const bugunAcildi = PAKETE.some(p => S.pakete[p.id] && S.pakete[p.id].start && Kern.gun4(S.pakete[p.id].start) === Kern.gun4(t));
    const yeni = !bugunAcildi && PAKETE.find(p => !S.pakete[p.id]);
    return yeni ? { tur: 'yeni', p: yeni } : null;
  }
  function paketSec() {
    const t = now(), pl = paketPlan();
    if (!pl) return null;
    if (pl.tur === 'offen') return Object.assign(paketNeu(pl.p.id), { neuPaket: !S.pakete[pl.p.id].m });
    if (pl.tur === 'vadeli') return Object.assign(paketWiederholung(pl.p.id), { uid: pl.p.id + ':pak', id: pl.p.id, start: t });
    return paketNeu(pl.p.id);
  }
  function paketTextHTML(q, modus) {
    const p = pById[q.pid];
    return p.teile.map(x => {
      if (typeof x === 'string') return deHTML(x);
      const l = p.luecken[x];
      if (modus === 'lesen') return `<b class="pk-wort">${deHTML(l.form)}</b>`;
      if (x < q.i || (x === q.i && q.warte)) { const e = q.erg[x]; return `<span class="dolu ${e && e.urteil}">${deHTML(l.form)}</span>`; }
      if (x === q.i) return '<span class="bosluk aktiv">_____</span>';
      return '<span class="bosluk">_____</span>';
    }).join('');
  }
  // aktif boşluğun cümlesi (uzun metinde, özellikle telefonda, boşluk ekran dışında kalmasın)
  function aktiverSatz(q) {
    const p = pById[q.pid];
    let txt = '';
    p.teile.forEach(x => { txt += typeof x === 'string' ? x : x === q.i ? '\u0001' : x < q.i ? p.luecken[x].form : '\u0002'; });
    const pos = txt.indexOf('\u0001');
    const re = /[.!?][“”"»]?\s+/g;
    // kısaltma noktası cümle bitirmez (Dr. Becker, Nr. 5, z. B.)
    const kisalt = i => txt[i] === '.' && /(?:^|[\s(„])(?:Dr|Nr|Hr|Fr|Prof|Str|St|bzw|ca|evtl|vgl|z\.\s?B|d\.\s?h|u\.\s?a|[A-Za-zÄÖÜäöü])$/.test(txt.slice(0, i));
    let a = 0, m;
    while ((m = re.exec(txt)) && m.index < pos) if (!kisalt(m.index)) a = m.index + m[0].length;
    re.lastIndex = pos;
    let m2 = re.exec(txt);
    while (m2 && kisalt(m2.index)) m2 = re.exec(txt);
    const satz = txt.slice(a, m2 ? m2.index + m2[0].length : txt.length).trim();
    return deHTML(satz).replace('\u0001', '<span class="bosluk aktiv">_____</span>').replace(/\u0002/g, '<span class="bosluk">___</span>');
  }
  function paketHinweis(id) {
    const k = kind(id);
    if (k === 'n') { const n = byId[id]; return `<span class="chip vurgu">${esc(kurzTr(n.tr))} · <span class="art art-${n.plOnly ? 'pl' : n.art}">${n.plOnly ? 'die (Pl.)' : n.art}</span></span>`; }
    if (k === 'v') return `<span class="chip vurgu">${esc(kurzTr(vById[id].tr))} · fiil (çekimli yaz)</span>`;
    return `<span class="chip vurgu">${esc(kurzTr(wById[id].tr))} · ${esc(KL_TR[wById[id].kl])}</span>`;
  }
  function paketRender(q) {
    const p = pById[q.pid];
    const kopf = `<div class="tur"><span class="${q.neuPaket ? 'yeni' : ''}">${q.neuPaket ? 'yeni paket' : 'paket tekrarı'}</span><span>${esc(p.titel)} · ${esc(p.titelTr)}</span></div>`;
    let h = kopf;
    if (q.schritt === 'liste') {
      h += `<div class="soru">Bu sahnenin kelimeleri</div><div class="paket-liste">${p.items.map(id => `<div><span class="de">${deItemHTML(id)}</span><span class="soluk">${esc(kurzTr(trOf(id)))}</span></div>`).join('')}</div>
        <div class="sira"><button class="btn ana" data-act="paket-weiter" type="button">Metni oku <kbd>Enter</kbd></button><span class="soluk">Bir kez sesli oku, anlamlarına bak.</span></div>`;
    } else if (q.schritt === 'lesen') {
      h += `<div class="paket-text">${paketTextHTML(q, 'lesen')}</div>
        <details class="ceviri"><summary>Türkçesini göster</summary><p>${esc(p.tr)}</p></details>
        <div class="sira"><button class="btn ana" data-act="paket-weiter" type="button">Boşluklara geç <kbd>Enter</kbd></button></div>`;
    } else if (q.schritt === 'luecke') {
      const l = p.luecken[q.i];
      h += `<div class="paket-text">${paketTextHTML(q, 'luecke')}</div>
        <div class="pk-satz">${aktiverSatz(q)}</div>
        <div class="chips"><span class="chip">${q.i + 1} / ${p.luecken.length}</span>${paketHinweis(l.id)}${!q.neuPaket && q.i === 0 && !q.gelesen ? '<button class="btn mini" data-act="paket-lesen" type="button" title="Önce okursan paket notu en fazla “küçük hata” olur">Önce metni oku</button>' : ''}</div>
        <form class="cevap" id="paket-form" autocomplete="off"><input id="cevap" type="text" enterkeyhint="go" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="boşluktaki kelime (metindeki biçimiyle)" aria-label="Boşluk"><button class="btn ana" type="submit">Kontrol <kbd>Enter</kbd></button></form>
        <div id="sonuc"></div>`;
    } else {
      const ok = q.erg.filter(e => e.urteil === 'richtig').length, fast = q.erg.filter(e => e.urteil === 'fast').length;
      h += `<div class="bos"><div class="buyuk">${ok + fast} / ${p.luecken.length}</div>
        <div class="soluk">${ok} doğru, ${fast} küçük hata, ${p.luecken.length - ok - fast} yanlış.${q.neuPaket ? ' Yeni kelimeler tekrar listene eklendi; birkaç gün içinde bu metin tekrar gelecek.' : ''}</div>
        <div class="sira">${devamBtn('act', 'paket-weiter')}</div></div>`;
    }
    kart.innerHTML = h;
    tastatur();
    const i = $('#cevap'); if (i) i.focus();
  }
  function paketWeiter() {
    const q = aktuell;
    if (!q || q.typ !== 'paket') return;
    const t = now();
    if (q.schritt === 'liste' || q.schritt === 'lesen') {
      // okumadan geçmeye karşı: liste 3 sn, metin kelime başına 0,15 sn (6–15 sn)
      const min = q.schritt === 'liste' ? 3000 : Math.min(15000, Math.max(6000, paketWoerter(q.pid) * 150));
      if (t - q.schrittStart < min) { flash('Biraz daha oku…'); return; }
      q.schritt = q.schritt === 'liste' ? 'lesen' : 'luecke'; q.schrittStart = t;
      // pakette yeni olan kelimeler (listede ve metinde görüldü): yarım öğe, yeni sıranın başında kısa tanıtım + mini soru
      if (q.schritt === 'luecke' && q.neuPaket) { pById[q.pid].items.forEach(id => ogeYarim(id, 'paket')); save(); }
      paketRender(q); return;
    }
    if (q.schritt === 'luecke' && q.warte) {
      q.warte = false; q.i++;
      if (q.i >= pById[q.pid].luecken.length) paketAbschluss(q); else paketRender(q);
      return;
    }
    if (q.schritt === 'ende') zeige();
  }
  const paketWoerter = pid => pById[pid].teile.map(x => typeof x === 'string' ? x : 'x').join('').split(/\s+/).filter(Boolean).length;
  function paketPruefen(input) {
    const q = aktuell;
    if (!q || q.schritt !== 'luecke' || q.warte) return;
    const p = pById[q.pid], l = p.luecken[q.i];
    const leer = istMuell(input);
    let r = leer ? { urteil: 'falsch', tags: ['boş / rastgele'] } : G.pruefen(input, l.form);
    if (r.urteil === 'falsch' && !leer) {
      const ohne = input.trim().replace(/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i, '');
      if (ohne !== input.trim()) { const r2 = G.pruefen(ohne, l.form); if (r2.urteil !== 'falsch') r = { urteil: r2.urteil, tags: ['artikel metinde zaten var'] }; }
    }
    // doğru kelime, yanlış biçim (Schmerz → Schmerzen, untersuchen → untersucht): küçük hata
    if (r.urteil === 'falsch' && !leer) {
      const a = G.norm(input).toLowerCase(), b = l.form.toLowerCase(), n = Math.min(5, b.length - 1);
      if (a.length >= 4 && !a.includes(' ') && a.slice(0, n) === b.slice(0, n)) { r.urteil = 'fast'; r.tags = [`biçim: metinde ${l.form}`]; }
    }
    // isim küçük harfle yazıldıysa: küçük hata (pruefen ilk harfi cümle başı sayıp affeder)
    if (r.urteil === 'richtig' && kind(l.id) === 'n' && /^[a-zäöü]/.test(input.trim()) && /^[A-ZÄÖÜ]/.test(l.form)) { r.urteil = 'fast'; r.tags = ['groß/klein: isim büyük harfle']; }
    q.erg[q.i] = { urteil: r.urteil, input };
    q.warte = true;
    session.q++;
    zaehlen({ ungezaehlt: leer, typ: 'pak' }, r.urteil);
    dikkatNotieren(r.urteil !== 'falsch', leer);
    let kopf = '';
    if (!leer && S.items[l.id] && gueltig(l.id + ':x')) {
      const tip = r.urteil === 'richtig' ? 'dogru' : r.urteil === 'fast' ? 'yazim' : 'yanlis';
      kopf = hafizaYaz({ id: l.id, sel: { b: 3 }, bicim: 'metin', antwort: input, ziel: l.form }, { bicim: 'metin', tip }, now(), { yan: true, log: false, kaynak: q.pid }).kopf;
    }
    logEintrag({ modus: 'paket', id: q.pid + ':' + q.i, item: label(l.id), frage: p.titel, antwort: input, ergebnis: r.urteil, loesung: l.form, notiz: [kopf].concat(r.tags, leer ? ['sayılmadı'] : []).filter(Boolean).join(' | ') });
    paketRender(q);
    $('#cevap').disabled = true;
    $('#sonuc').innerHTML = `<div class="sonuc ${r.urteil}"><div class="baslik">${{ richtig: '✓ Doğru', fast: '≈ Küçük hata', falsch: '✗ Yanlış' }[r.urteil]}</div>
      ${r.urteil !== 'richtig' ? `<div class="satir"><span class="et">doğrusu</span><span class="deger">${deHTML(l.form)} <span class="soluk">(${esc(label(l.id))})</span></span></div>${kancaHTML(l.id)}` : ''}
      ${devamBtn('act', 'paket-weiter', r.urteil === 'richtig' ? OTO_MS : 0)}</div>`;
    kart.classList.add('cevaplandi');
    if (r.urteil === 'richtig') { const i0 = q.i; later(() => { if (aktuell === q && q.warte && q.i === i0) paketWeiter(); }, OTO_MS); }
    save();
  }
  function paketAbschluss(q) {
    const t = now(), p = pById[q.pid];
    const punkte = q.erg.reduce((a, e) => a + (e.urteil === 'richtig' ? 1 : e.urteil === 'fast' ? 0.6 : 0), 0) / p.luecken.length;
    let g = punkte >= 0.9 ? 3 : punkte >= 0.6 ? 2 : 1;
    if (q.gelesen && g > 2) g = 2;  // tekrarda önce metni okuduysa: ipuçlu hatırlama
    const uid = q.pid + ':pak';
    // paket hafızası (S.pakete[pid].m): metnin puanından not; günde tek yazım; erken üretim kapısı pakette yok; gölge kart
    const pk = S.pakete[q.pid] = S.pakete[q.pid] || {};
    if (!(pk.m && pk.m.gun === Kern.gun4(t))) {
      const h = pk.m && pk.m.S ? Object.assign({}, pk.m, { pk: 2 }) : null;
      pk.m = Object.assign(Kern.guncelle(h, g, t, S.einst.ret, 0, {}), { gun: Kern.gun4(t) });
      delete pk.m.pk; delete pk.m.pkGun;
      Kern.golge(S, q.pid, 'pak', pk.m, t);
    }
    pk.zuletzt = t; pk.fertig = true;
    q.schritt = 'ende';
    logEintrag({ modus: 'paket', id: uid, item: p.titel, frage: q.neuPaket ? 'yeni paket' : 'paket tekrarı', antwort: '', ergebnis: g === 3 ? 'richtig' : g === 2 ? 'fast' : 'falsch', loesung: '', notiz: `puan:${Math.round(punkte * 100)}${q.gelesen ? ' | önce okudu' : ''}` });
    save();
    paketRender(q);
  }

  // ================= Serbest yazma =================
  // 3–4 günde bir: konu + öğrendiğin kelimelerden 5 zorunlu kelime; metin log'a gider, Claude düzeltir
  const YAZMA_ARA = 1;
  const sonText = () => (S.texte || []).reduce((a, x) => Math.max(a, x.zeit), 0);
  const yazmaFaellig = () => Object.keys(S.items).length >= 30 && now() - sonText() >= YAZMA_ARA * DAY;
  function aufgabeWaehlen(anders) {
    const done = new Set((S.texte || []).map(x => x.id));
    let c = AUFGABEN.filter(a => !done.has(a.id) && a.thema === themaId());
    if (!c.length) c = AUFGABEN.filter(a => !done.has(a.id));
    if (!c.length) c = AUFGABEN.slice();
    if (anders && session.aufgabe) { const f = c.filter(a => a.id !== session.aufgabe.id); if (f.length) c = f; }
    return pick(c);
  }
  // zorunlu kelimeler yalnız görevin konusundan: önce öğrendiklerin (yeniler önde), eksikse konunun diğer kelimeleri
  function pflichtWoerter(a) {
    const th = thById[a.thema];
    if (!th) return [];
    const ids = th.items.filter(id => gueltig(id + ':x'));
    const gelernt = ids.filter(id => S.items[id]).sort((x, y) => S.items[y].seit - S.items[x].seit);
    const rest = shuffle(ids.filter(id => !S.items[id]));
    return shuffle(gelernt.slice(0, 8)).slice(0, 5).concat(rest).slice(0, 5);
  }
  function yazmaRender(anders) {
    if (!AUFGABEN.length) { kart.innerHTML = '<div class="bos">Yazma görevi yok.</div>'; return; }
    if (!session.aufgabe || anders) { session.aufgabe = aufgabeWaehlen(anders); session.pflicht = pflichtWoerter(session.aufgabe); }
    const a = session.aufgabe, teile = a.de.split(' · ');
    aktuell = { typ: 'yazma', id: a.id };
    const heute = bugunM('yazma').n;
    $('#durum-satiri').innerHTML = '';
    kart.innerHTML = `<div class="tur"><span class="yeni">yazma</span><span>${esc({ email: 'arkadaşa e-posta', forum: 'forumda görüş', formell: 'resmî e-posta' }[a.typ] || a.typ)} · en az ${a.min} kelime${thById[a.thema] ? ' · ' + esc(thById[a.thema].tr) : ''}</span></div>
      ${heute ? '<div class="sonuc richtig"><div class="baslik">✓ Bugün bir metin gönderdin.</div><div class="soluk">İstersen bir tane daha yazabilirsin. Claude\'a "sonuçlarıma bak" de, düzeltir.</div></div>' : ''}
      <div class="soru" style="font-size:1.1rem;font-weight:400">${esc(teile[0])}</div>
      ${teile.length > 1 ? `<ul class="erkl">${teile.slice(1).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <div class="soluk">${esc(a.tr)}</div>
      ${session.pflicht.length ? `<div class="chips"><span class="soluk">Şu kelimeleri kullanmaya çalış:</span>${session.pflicht.map(id => `<span class="chip vurgu">${deItemHTML(id)}</span>`).join('')}</div>` : ''}
      <textarea id="metin" rows="9" spellcheck="false" placeholder="Liebe / Lieber …, Sehr geehrte Damen und Herren, …" style="width:100%;font:inherit;font-size:1.05rem;padding:.7rem .9rem;border-radius:10px;border:2px solid var(--line);background:var(--surface-2)"></textarea>
      <div class="sira" style="margin:0"><span class="soluk" id="metin-say">0 kelime</span>
        <button class="btn ana" data-act="metin-gonder" type="button">Gönder</button>
        <button class="btn" data-act="metin-baska" type="button">Başka konu</button>
        <button class="btn" data-act="kalip-panel" type="button">Kalıplar</button></div>
      <div id="kalip-panel" hidden><div class="soluk">Kalıba bas: metne eklenir. Üzerine gelince Türkçesi görünür.</div>${yazmaKalipHTML(a)}</div>`;
    tastatur();
    const ta = $('#metin');
    try { ta.value = localStorage.getItem('almanca-tekrar-taslak-' + a.id) || ''; } catch (e) { /* yok */ }
    const say = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; $('#metin-say').textContent = `${n} kelime${n < a.min ? ` (en az ${a.min})` : ' ✓'}`; return n; };
    ta.addEventListener('input', () => { say(); try { localStorage.setItem('almanca-tekrar-taslak-' + a.id, ta.value); } catch (e) { /* yok */ } });
    say();
  }
  function metinGonder() {
    const a = session.aufgabe, ta = $('#metin');
    if (!a || !ta) return;
    const text = ta.value.trim(), n = text ? text.split(/\s+/).length : 0;
    if (n < Math.round(a.min * 0.6)) { flash(`Biraz daha yaz: en az ${a.min} kelime (şu an ${n}).`); return; }
    const kullan = session.pflicht.filter(id => text.toLowerCase().includes((kind(id) === 'n' ? byId[id].lemma : kind(id) === 'v' ? vById[id].inf.replace(/^sich /, '') : wById[id].de).toLowerCase().slice(0, 5)));
    S.texte = S.texte || [];
    S.texte.push({ zeit: now(), id: a.id });
    heuteM('yazma').n++; xpEkle(50);
    logEintrag({ modus: 'text', id: a.id, item: a.thema, frage: a.de, antwort: text.replace(/\s*\n+\s*/g, ' ¶ '), ergebnis: 'neu', loesung: '',
      notiz: `kelime:${n} | zorunlu:${session.pflicht.map(label).join(', ')} | kullandı:${kullan.length}/${session.pflicht.length}` });
    try { localStorage.removeItem('almanca-tekrar-taslak-' + a.id); } catch (e) { /* yok */ }
    ghSync(true);
    save();
    session.aufgabe = null;
    kart.innerHTML = `<div class="bos"><div class="buyuk">Gönderildi ✓</div><div class="soluk">${n} kelime. Claude cümle cümle düzeltir; düzeltme birkaç dakika sonra Geçmiş'te görünür (gece de kendiliğinden bakar).</div>
      <div class="sira"><button class="btn ana" data-act="claude-gonder" type="button">Claude'a şimdi gönder</button><button class="btn" data-modus="akis" type="button">Çalış'a dön</button></div></div>`;
    renderPlan();
  }

  // ================= Kalıplar =================
  // Fiillerin günlük kullanımı (soru yok): öğrendiğin fiiller önce; "yazmaya ekle" dediklerin yazma ekranında da çıkar
  const KAL = window.KALIPLAR || { yazma: {}, fiil: {} };
  function kalipFiiller() {
    // şimdilik yalnız B1 fiilleri (A1/A2 yok); en son öğrendiğin önce, sonra henüz öğrenmediğin B1 fiilleri
    const ids = Object.keys(KAL.fiil).filter(id => vById[id] && vById[id].tier === 3);
    const gelernt = ids.filter(id => S.items[id]).sort((a, b) => (S.items[b].seit || 0) - (S.items[a].seit || 0));
    return gelernt.concat(ids.filter(id => !S.items[id]));
  }
  function kalipRender() {
    aktuell = { typ: 'kalip' };
    $('#durum-satiri').innerHTML = '';
    const ids = kalipFiiller(), seite = session.kalipSeite || 0, fav = S.kalipFav || {};
    const N = 12, teil = ids.slice(seite * N, seite * N + N);
    kart.innerHTML = `<div class="tur"><span class="yeni">kalıplar</span><span>${ids.length} fiil · ${seite * N + 1}–${Math.min(ids.length, seite * N + N)} · B1 fiilleri, son öğrendiğin önce</span></div>
      <div class="kalip-grid">${teil.map(id => `<div class="kalip-fiil"><div class="soru de" style="font-size:1.2rem">${esc(vById[id].anz)} <span class="soluk" style="font-weight:400">${esc(vById[id].tr)}</span></div>
        <ul class="ornekler">${KAL.fiil[id].map((k, i) => `<li>${deHTML(k.de)}<br><span class="soluk">${esc(k.tr)}</span> <button class="fav-btn${fav[id + ':' + i] ? ' an' : ''}" data-fav="${id}:${i}" type="button" title="Yazma ekranında göster">${fav[id + ':' + i] ? '✓ yazmada' : '+ yazmaya ekle'}</button></li>`).join('')}</ul></div>`).join('')}</div>
      <div class="sira">${seite ? '<button class="btn" data-act="kalip-zurueck" type="button">← Önceki</button>' : ''}${(seite + 1) * N < ids.length ? `<button class="btn ana" data-act="kalip-weiter" type="button">Sonraki ${N} fiil →</button>` : ''}</div>`;
    tastatur();
    if (!session.kalipGesehen) { session.kalipGesehen = true; heuteM('kalip').n++; save(); }
  }
  // yazma ekranı için: görev türü + konu + eklenen fiil kalıpları
  function yazmaKalipHTML(a) {
    const fav = S.kalipFav || {};
    const fl = Object.keys(fav).filter(k => fav[k]).map(k => { const [id, i] = k.split(':'); return (KAL.fiil[id] || [])[+i]; }).filter(Boolean);
    const blok = (titel, l) => l && l.length ? `<div class="soluk" style="margin-top:.4rem">${esc(titel)}</div><div class="chips">${l.map(k => `<button class="chip" data-einfuegen="${esc(k.de)}" type="button" title="${esc(k.tr)}">${esc(k.de)}</button>`).join('')}</div>` : '';
    return blok({ email: 'E-posta kalıpları', forum: 'Görüş kalıpları', formell: 'Resmî e-posta kalıpları' }[a.typ] || 'Kalıplar', KAL.yazma[a.typ]) +
      blok(`Konu: ${thById[a.thema] ? thById[a.thema].tr : a.thema}`, KAL.yazma[a.thema]) + blok('Eklediğin fiil kalıpları', fl);
  }

  // ================= Okuma =================
  // Paket metinleri + doğru/yanlış soruları; kelimeye basınca anlamı. Son günlerde öğrendiğin kelimeleri en çok içeren metin önce.
  const LESEN = window.LESEN || {};
  let _formIdx = null;
  function formIdx() {
    if (_formIdx) return _formIdx;
    const m = _formIdx = new Map();
    const add = (f, id) => { if (f && !m.has(f)) m.set(f, id); };
    NL.forEach(n => { [n.lemma, n.plf].filter(Boolean).forEach(f => ['', 'n', 'en', 's', 'es'].forEach(e => add(f + e, n.id))); });
    // ayrılabilen ya da çok kelimeli fiil (abfahren, bekannt geben): yalnız mastar ve Partizip; çekimli hâli ("fährt … ab") tek kelimeden tanınmaz,
    // yoksa metindeki "fährt" abfahren sanılır. Önce öneksiz fiiller (fahren) kendi formlarını alır.
    const sirali = VERBEN.filter(v => !v.pre).concat(VERBEN.filter(v => v.pre));
    sirali.filter(v => v.frmDrill).concat(sirali).forEach(v => {
      if (v.pre) { [v.inf, v.p2s].forEach(x => add(x, v.id)); return; }
      const f = G.praesensForms(v);
      [v.inf, v.p2s, v.base].concat(f).forEach(x => add(x, v.id));
      if (v.ptForm) ['', 'st', 'n', 'en', 't'].forEach(e => add(v.ptForm + e, v.id));
    });
    WOERTER.forEach(w => { const d = w.de.split(/[ …]+/)[0]; ['', 'e', 'en', 'er', 'es', 'em'].forEach(e => add(d + e, w.id)); });
    return m;
  }
  const wortSuchen = t => { const c = t.replace(/^[„“"(]+|[.,!?;:“"”)…]+$/g, ''); const m = formIdx(); return m.get(c) || m.get(c.charAt(0).toLowerCase() + c.slice(1)) || null; };
  // Okuma metinleri Klexikon, DW ve Goethe'den; seçili konu ve son öğrendiğin kelimelerin konusu önce
  const LT = (window.LESETEXTE || []).map((t, i) => Object.assign({ id: 'k' + i, quelle: 'Klexikon' }, t))
    .concat((window.LESETEXTE_DW || []).map(t => Object.assign({}, t, { id: 'dw' + t.id })))
    .concat((window.GOETHE_LESEN || []));
  const GL_OPT = { rf: () => [['richtig', 'Richtig'], ['falsch', 'Falsch']], jn: () => [['ja', 'Ja'], ['nein', 'Nein']],
    abc: a => a.o.map((o, i) => ['abc'[i], 'abc'[i] + ') ' + o]), zu: () => 'abcdefghi0'.split('').map(x => [x, x]) };
  function lesenWaehlen(anders) {
    const t = now(), g = S.gelesen || {};
    const son = {};
    Object.entries(S.items).forEach(([id, it]) => { if (t - (it.seit || 0) < 3 * DAY) (THEMA_VON[id] || []).forEach(th => { son[th] = (son[th] || 0) + 1; }); });
    // Goethe sınav metinleri Prüfung bölümüne ayrıldı (taze deneme kalsın); okuma havuzunda DW + Klexikon
    const havuz = LT.filter(x => !x.aufgaben);
    const c = havuz.filter(x => !g[x.id] && !(anders && session.lesen && session.lesen.id === x.id));
    const pool = c.length ? c : havuz;
    // Goethe (sınav görevleri), DW (B1 haber metinleri), Klexikon dönüşümlü; konu eşleşirse öne
    const puan = x => (x.thema && x.thema === S.einst.thema ? 5 : 0) + (son[x.thema] || 0) + (x.quelle !== session.lesenQ ? 4 : 0) + (x.aufgaben ? 1 : 0) + Math.random() * 2;
    return pool.slice().sort((a, b) => puan(b) - puan(a))[0];
  }
  function lesenRender(anders) {
    // fiil metninden gelen metin (session.lesenFv) okuma metni sayılmaz: yeniden seç
    if (!session.lesen || !session.lesen.text || anders || session.lesenFv || !session.lesenCevap) { session.lesen = lesenWaehlen(anders); session.lesenQ = session.lesen && session.lesen.quelle; session.lesenCevap = {}; session.lesenFv = false; }
    aktuell = { typ: 'lesen' };
    $('#durum-satiri').innerHTML = '';
    const L = session.lesen;
    if (!L) { kart.innerHTML = '<div class="bos">Okuma metni yok.</div>'; return; }
    const text = L.text.split('\n').map(par => '<p>' + esc(par).split(/(\s+)/).map(w => /\S/.test(w) ? `<span class="lw">${w}</span>` : w).join('') + '</p>').join('');
    const gl = (L.glossar || []).length ? `<details class="ceviri"><summary>DW sözlüğü (${L.glossar.length} kelime, Almanca açıklama)</summary><ul class="erkl">${L.glossar.map(g => `<li><b>${esc(g.de)}</b>: ${esc(g.erkl)}</li>`).join('')}</ul></details>` : '';
    kart.innerHTML = `<div class="tur"><span class="yeni">okuma</span><span>${esc(L.reihe || L.quelle)}${thById[L.thema] ? ' · ' + esc(thById[L.thema].tr) : ''} · bilmediğin kelimeye bas</span></div>
      <div class="soru">${esc(L.titel)}</div>${L.anweisung ? `<div class="soluk">${esc(L.anweisung)}${L.beispiel ? '<br>Beispiel: ' + esc(L.beispiel) : ''}</div>` : ''}
      ${L.audio ? `<div class="dinle"><audio controls preload="none" src="${esc(L.audio)}"></audio><span class="soluk">DW sesi: önce dinle, sonra oku (ya da okurken dinle)</span></div>` : `<div class="sira"><button class="btn mini" data-act="lesen-oku" type="button">🔊 Sesli oku</button><button class="btn mini" data-act="lesen-oku-yavas" type="button">🐢 Yavaş</button></div>`}
      <div class="paket-text" id="lesen-text">${text}</div>
      <div id="lesen-wort" class="kural" hidden></div>
      ${gl}${L.aufgaben ? goetheAufgabenHTML(L) : ''}
      <div class="soluk">Kaynak: ${L.url ? `<a href="${esc(L.url)}" target="_blank" rel="noopener">${esc(L.quelle)}: ${esc(L.titel)}</a>` : esc(L.quelle) + ', ' + esc(L.reihe)}</div>
      <div class="sira">${L.aufgaben ? '' : devamBtn('act', 'lesen-fertig', 0, 'Okudum')}<button class="btn${L.aufgaben && Object.keys(session.lesenCevap).length === L.aufgaben.length ? ' ana' : ''}" data-act="lesen-baska" type="button">Başka metin</button></div>`;
    tastatur();
  }
  // ================= Ünite (kitaptaki konunun kelime listesi: bir günlük yoğun ezber) =================
  // 1) Ayırma: biliyorum / emin değilim / bilmiyorum. 2) Her kelime bir merdivenden geçer:
  //    tanıtım → anlam seçmeli → ters seçmeli (isimde artikelli) → (isim) der/die/das → cümlede boşluk → Türkçeden yazma → (düzensiz fiil) çekim.
  //    Biliyorum: yalnız boşluk + yazma; emin değilim: tanıtımsız. Yanlışta bir basamak geri, araya en az 6 soru.
  // 3) Araya: kelime kutulu boşluklu metin (2. turda kutusuz), eşleştirme, dinle-yaz, cümle dizme. 4) Sonunda yazma görevi ve tekrar sistemine aktarma.
  const UNITEN = window.UNITE || [];
  const uById = {};
  UNITEN.forEach(U => U.items.forEach(it => { uById[it.id] = it; }));
  const U_STUFEN = it => ['intro', 'mc', 'mcrev'].concat(it.typ === 'n' ? ['art'] : [], it.lk ? ['lk'] : [], ['typ'], it.formen ? ['formen'] : []);
  function uState(U) {
    const all = S.unite = S.unite || {};
    return all[U.id] = all[U.id] || { sort: {}, idx: {}, next: {}, done: {}, step: 0, texte: {}, runde: 1, fertig: false, uebernommen: false, sortI: 0 };
  }
  // kapanmış (@geschlossen ya da @bis tarihi geçmiş) ya da aktarılmış ünite artık gösterilmez
  const uZu = U => !!U.geschlossen || (!!U.bis && tag() > U.bis);
  // @inaktiv ünite (kitapta henüz gelmemiş Kapitel): Ayarlar'dan "Aç" denene kadar görünmez
  // elle açma / kapatma kalıcı: S.unite[id].aktiv (true / false) varsa o geçerli; yoksa dosyadaki @inaktiv
  const uOffen = U => { const st = S.unite && S.unite[U.id]; return st && typeof st.aktiv === 'boolean' ? st.aktiv : !U.inaktiv; };
  const uAktiv = U => uOffen(U) && !uZu(U) && !(S.unite && S.unite[U.id] && S.unite[U.id].uebernommen);
  function uAktivler() { return UNITEN.filter(uAktiv).sort((a, b) => (b.kapitel || 0) - (a.kapitel || 0)); }
  // ünite ekranı: birden çok açık ünite varsa seçilen (session.uniteSecili), yoksa kitapta şu an işlenen
  const uAktuell = () => { const l = uAktivler(); return l.find(U => U.id === session.uniteSecili) || l[0] || UNITEN[UNITEN.length - 1]; };
  // ünite kelimesi → ana listedeki öğe (isim / fiil / diğer kelime)
  function uMainId(it) {
    const kand = it.typ === 'n' ? NL.filter(x => label(x.id) === it.de).map(x => x.id)
      : it.typ === 'v' ? VERBEN.filter(v => v.anz === it.de || (v.inf === it.de.replace(/^sich /, '') && v.refl === (/^sich /.test(it.de) ? 'A' : v.refl))).map(v => v.id)
      : WOERTER.filter(w => label(w.id) === it.de).map(w => w.id);
    return kand[0] || null;
  }
  // en iyi Almanca ses: doğal / neural / premium sesler önce
  let _ses = null;
  function almancaSes() {
    if (_ses) return _ses;
    const vs = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(v => /^de/i.test(v.lang));
    const puan = v => (/natural|neural|online|premium|enhanced|siri|google/i.test(v.name) ? 10 : 0) + (/de-DE/i.test(v.lang) ? 2 : 0) + (v.localService ? 0 : 1);
    _ses = vs.sort((a, b) => puan(b) - puan(a))[0] || null;
    return _ses;
  }
  try { if (window.speechSynthesis) speechSynthesis.addEventListener('voiceschanged', () => { _ses = null; }); } catch (e) { /* yok */ }
  function sprich(text, rate) {
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; u.rate = rate || 0.9;
      const v = almancaSes(); if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { flash('Bu tarayıcıda ses yok.'); }
  }
  const uLabel = it => it.de;
  const uNorm = s => (s || '').toLowerCase().replace(/[.,!?;:„“"()…]/g, '').replace(/\s+/g, ' ').trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  // yazma kontrolü: tam doğru / küçük hata (artikel eksik, tek harf, umlaut) / yanlış
  function uPruef(eingabe, ziel, alts) {
    const e = uNorm(eingabe), cands = [ziel].concat(alts || []).map(uNorm);
    if (cands.includes(e)) return { u: (eingabe || '').trim().replace(/\s+/g, ' ') === ziel ? 'richtig' : 'fast', hinweis: (eingabe || '').trim() === ziel ? '' : 'büyük/küçük harf ya da umlaut' };
    for (const c of cands) {
      const ohneArt = c.replace(/^(der|die|das) /, '');
      if (ohneArt !== c && e === ohneArt) return { u: 'fast', hinweis: 'artikel eksik: ' + ziel };
      if (ohneArt !== c && /^(der|die|das) /.test(e) && e.replace(/^(der|die|das) /, '') === ohneArt) return { u: 'falsch', hinweis: 'artikel yanlış: ' + ziel };
      if (Math.abs(c.length - e.length) <= 1 && c.length > 4 && lev(c, e) <= 1) return { u: 'fast', hinweis: 'yazım: ' + ziel };
    }
    return { u: 'falsch', hinweis: '' };
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const uZiel = it => it.de;
  const uAlts = it => {
    const a = [];
    if (/^sich /.test(it.de)) a.push(it.de.replace(/^sich /, ''));
    if (it.de === 'schätzen an') a.push('schätzen');
    if (it.de === 'gehören zu') a.push('gehören');
    if (it.de === 'seitdem') a.push('seit');
    if (/ sein$/.test(it.de)) a.push(it.de.replace(/ sein$/, ''));
    return a;
  };
  function uKarteHTML(it, mitSatz = true) {
    const art = it.typ === 'n' ? `<span class="art art-${it.art}">${it.art}</span> ${esc(it.lemma)}` : `<b>${esc(it.de)}</b>`;
    return `<div class="tanit-bas"><span class="kelime">${art}</span><span class="tr">${esc(it.tr)}</span></div>
      ${it.ex ? `<div class="soluk">${esc(it.ex)}</div>` : ''}
      ${mitSatz && it.bsp ? `<div class="u-satz">${deHTML(it.bsp)} <button class="btn mini" data-sprich="${esc(it.bsp)}" type="button">🔊</button><br><span class="soluk">${esc(it.bspTr)}</span></div>` : ''}`;
  }
  function uOptionen(U, it, feld) {
    const pool = shuffle(U.items.filter(x => x.id !== it.id && x[feld] !== it[feld] && (x.typ === it.typ || Math.random() < 0.3)));
    const out = [], seen = new Set([it[feld]]);
    for (const x of pool) { if (out.length >= 3) break; if (seen.has(x[feld])) continue; seen.add(x[feld]); out.push(x[feld]); }
    return shuffle(out.concat([it[feld]]));
  }
  // ünite metninde boşluk yalnız gördüğün (tanıtılmış / biliyorum dediğin) kelimelerde; görmediğin kelime metinde yazılı durur
  // metindeki çekimli biçim de kelimeye bağlanır (Knödeln → der Knödel, creme → eincremen, oberen → obere)
  function uKand(it) {
    const k = new Set(), add = x => { if (x && x.length >= 3) k.add(x.toLowerCase()); };
    [it.lk, it.lemma, it.de].forEach(add);
    it.de.replace(/^(sich|der|die|das) /, '').split(/[ …]+/).forEach(add);
    (it.ex.match(/[A-Za-zÄÖÜäöüß]+/g) || []).filter(x => !/^(hat|ist|sich|trennbar|Sg|Pl|an|auf|zu|für|von|vor|über|mit|nur|nicht|mir|Infinitiv|[GDA])$/i.test(x)).forEach(add);
    return [...k];
  }
  function uGesehen(U, st, f) {
    const g0 = f.toLowerCase(), gs = [g0].concat(g0.startsWith('ge') ? [g0.slice(2)] : []), stamm = c => c.replace(/(e?n|e?t)$/, '');
    const passt = i => uKand(i).some(c => gs.some(g => g === c || (stamm(c).length >= 4 && g.startsWith(stamm(c)) && g.length - stamm(c).length <= 4)));
    const it = U.items.find(i => i.lk === f || i.lemma === f || i.de === f || i.de.split(' ').slice(-1)[0] === f) || U.items.find(passt);
    return !it || uTanidik(st, it);
  }
  // ünite kelimesi tanıdık: ünitede çalışılmış (eski basamaklar) ya da ana listedeki öğesi tanıtılmış / hafızası var.
  // Bugün iş kartı ve ünite ekranı aynı sayacı kullanır.
  function uTanidik(st, it) {
    if (st.idx[it.id] != null || st.done[it.id]) return true;
    const mid = uMainId(it), x = mid && S.items[mid];
    return !!(x && (x.tanit || (x.m && x.m.S) || x.bekannt));
  }
  const uTanidikSay = U => { const st = uState(U); return U.items.filter(it => uTanidik(st, it)).length; };
  const uLuecken = (U, st, T) => T.teile.filter(x => typeof x !== 'string' && uGesehen(U, st, x.f)).map(x => x.f);
  function uText(U) {
    const st = uState(U);
    // 1. tur: kelime kutulu; 2. tur: kutusuz
    for (let r = st.runde; r <= 2; r++) {
      const i = U.texte.findIndex((t, i) => (st.texte[i] || 0) < r && uLuecken(U, st, t).length >= 3);
      if (i >= 0) { st.runde = r; return i; }
    }
    return null;
  }
  // ---- ekran ----
  function uniteRender() {
    const U = uAktuell();
    $('#durum-satiri').innerHTML = '';
    if (!U) { aktuell = { typ: 'unite' }; kart.innerHTML = '<div class="bos">Ünite yok.</div>'; return; }
    const st = uState(U), items = U.items;
    const tanidikN = uTanidikSay(U);
    const acik = uAktivler();
    const secici = acik.length > 1 ? `<div class="chips">${acik.map(x => `<button class="chip${x.id === U.id ? ' aktif' : ''}" data-unite-sec="${x.id}" type="button">${esc(x.titel)}</button>`).join('')}</div>` : '';
    const kopf = `${secici}<div class="tur"><span class="yeni">ünite</span><span>${esc(U.titel)} · ${tanidikN} / ${items.length} kelime tanıdık</span></div>
      <div class="u-bar"><div style="width:${Math.round(100 * tanidikN / items.length)}%"></div></div>`;
    // v5: "biliyor musun?" ayırması ve ünite basamakları yok; kelimeler turda (yeni sıranın başında) öğrenilir.
    // Burada: kelime listesi + boşluklu metinler + yazma görevleri. Yalnız metin alıştırması st.aktuell olarak sürer.
    const sel = st.aktuell && st.aktuell.art === 'text' ? st.aktuell : (st.aktuell = null);
    if (!sel) { uUebersicht(U, st, kopf); return; }
    aktuell = { typ: 'unite', sel };
    let h = '';
    if (sel.art === 'item') {
      const it = uById[sel.id], stufe = sel.stufe || (sel.stufe = U_STUFEN(it)[st.idx[it.id]]);
      if (stufe === 'intro') h = `<div class="soluk">yeni kelime · oku, sesli söyle</div>${uKarteHTML(it)}<div class="sira"><button class="btn ana" data-act="u-weiter" type="button">Tamam <kbd>Enter</kbd></button></div>`;
      else if (stufe === 'mc' || stufe === 'mcrev' || stufe === 'art') {
        if (!sel.opts) sel.opts = stufe === 'mc' ? uOptionen(U, it, 'tr') : stufe === 'mcrev' ? uOptionen(U, it, 'de') : ['der', 'die', 'das'];
        const frage = stufe === 'mc' ? `<div class="soru buyuk-kelime">${esc(it.de)}</div><div class="soluk">anlamı ne?</div>` : stufe === 'mcrev' ? `<div class="soru buyuk-kelime">${esc(it.tr)}</div><div class="soluk">Almancası? (isimde artikele dikkat)</div>` : `<div class="soru buyuk-kelime">___ ${esc(it.lemma)}</div><div class="soluk">${esc(it.tr)} · der / die / das?</div>`;
        h = frage + `<div class="mc">${sel.opts.map((o, i) => `<button class="mc-opt${sel.cevap != null ? (o === (stufe === 'mc' ? it.tr : stufe === 'mcrev' ? it.de : it.art) ? ' ok' : i === sel.cevap ? ' yanlis' : '') : ''}" data-umc="${i}" type="button"${sel.cevap != null ? ' disabled' : ''}><kbd>${i + 1}</kbd> ${esc(o)}</button>`).join('')}</div>`;
      } else if (stufe === 'lk') {
        const satz = esc(it.bsp).replace(esc(it.lk), '<span class="bosluk">_____</span>');
        h = `<div class="soluk">cümlede boşluk · ${esc(it.tr)}${it.ex ? ' · ' + esc(it.ex) : ''}</div><div class="soru de">${satz} <button class="btn mini" data-sprich="${esc(it.bsp.replace(it.lk, '…'))}" type="button">🔊</button></div><div class="soluk">${esc(it.bspTr)}</div>
          <input id="cevap" class="cevap" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="boşluktaki kelime">`;
      } else if (stufe === 'typ') {
        h = `<div class="soluk">Türkçeden Almancaya yaz${it.typ === 'n' ? ' (artikeliyle)' : ''}</div><div class="soru buyuk-kelime">${esc(it.tr)}</div>${it.typ !== 'n' && it.ex && !it.formen ? `<div class="soluk">${esc(it.ex)}</div>` : ''}
          <input id="cevap" class="cevap" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${it.typ === 'n' ? 'der / die / das …' : 'Almanca'}">`;
      } else if (stufe === 'formen') {
        h = `<div class="soluk">düzensiz fiil · er-Präsens, Präteritum, Perfekt</div><div class="soru buyuk-kelime">${esc(it.de.replace(/^sich /, ''))}</div><div class="soluk">${esc(it.tr)}</div>
          <input id="cevap" class="cevap" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="z. B. fährt, fuhr, ist gefahren">`;
      }
    } else if (sel.art === 'text') {
      const T = U.texte[sel.t], mitBank = st.runde === 1;
      sel.werte = sel.werte || {};
      let k = 0;
      const body = T.teile.map(x => typeof x === 'string' ? esc(x) : !uGesehen(U, st, x.f) ? `<b class="u-frei" title="henüz görmediğin kelime">${esc(x.f)}</b>` : `<input class="u-luecke" data-ul="${k++}" size="${Math.max(6, x.f.length)}" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(sel.werte[k - 1] || '')}">`).join('');
      const bank = shuffle(uLuecken(U, st, T));
      sel.bank = sel.bank || bank;
      h = `<div class="soluk">boşluklu metin · ${mitBank ? 'kelimeler kutuda' : '2. tur: kutu yok, hatırla'} · ${esc(T.tr)}</div><div class="soru">${esc(T.titel)}</div>
        ${mitBank ? `<div class="chips u-bank">${sel.bank.map(w => `<span class="chip">${esc(w)}</span>`).join('')}</div>` : ''}
        <div class="paket-text u-text-body">${body}</div>
        <div class="sira"><button class="btn ana" data-act="u-text-pruef" type="button">Kontrol et</button></div><div id="u-text-erg"></div>`;
    } else if (sel.art === 'match') {
      sel.links = sel.links || shuffle(sel.ids.slice()); sel.rechts = sel.rechts || shuffle(sel.ids.slice()); sel.paare = sel.paare || {};
      h = `<div class="soluk">eşleştir · Almanca ↔ Türkçe (önce soldan seç)</div><div class="u-match"><div>${sel.links.map(id => `<button class="btn u-m${sel.paare[id] ? ' ok' : ''}${sel.wahl === id ? ' aktif' : ''}" data-um="L${id}" type="button"${sel.paare[id] ? ' disabled' : ''}>${esc(uById[id].de)}</button>`).join('')}</div><div>${sel.rechts.map(id => `<button class="btn u-m${sel.paare[id] ? ' ok' : ''}" data-um="R${id}" type="button"${sel.paare[id] ? ' disabled' : ''}>${esc(uById[id].tr)}</button>`).join('')}</div></div>
        ${Object.keys(sel.paare).length === sel.ids.length ? `<div class="kural">Bitti · ${sel.fehler || 0} hata</div><div class="sira">${devamBtn('act', 'u-weiter')}</div>` : ''}`;
    } else if (sel.art === 'diktat') {
      const it = uById[sel.id];
      h = `<div class="soluk">dinle–yaz · 🔊'ye bas, duyduğun cümleyi yaz (istediğin kadar dinle)</div><div class="sira"><button class="btn ana" data-sprich="${esc(it.bsp)}" type="button">🔊 Dinle</button></div>
        <input id="cevap" class="cevap" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="duyduğun cümle">`;
    } else if (sel.art === 'ordnen') {
      const it = uById[sel.id];
      sel.toks = sel.toks || shuffle(it.bsp.replace(/[.!?]$/, '').split(' ').map((w, i) => ({ w, i })));
      sel.gew = sel.gew || [];
      h = `<div class="soluk">cümleyi diz · ${esc(it.bspTr)}</div><div class="soru de u-gebaut">${sel.gew.map(i => esc(sel.toks[i].w)).join(' ') || '…'}</div>
        <div class="chips">${sel.toks.map((t, i) => `<button class="chip" data-uo="${i}" type="button"${sel.gew.includes(i) ? ' disabled' : ''}>${esc(t.w)}</button>`).join('')}</div>
        <div class="sira"><button class="btn mini" data-act="u-ordnen-zurueck" type="button">← sil</button>${sel.gew.length === sel.toks.length ? '<button class="btn ana" data-act="u-ordnen-pruef" type="button">Kontrol et</button>' : ''}</div>`;
    }
    kart.innerHTML = kopf + h + `<div id="u-erg"></div>`;
    tastatur();
    const inp = $('#cevap'); if (inp) inp.focus();
  }
  function uUebersicht(U, st, kopf) {
    aktuell = { typ: 'unite', uebersicht: true };
    const metin = U.texte.map((T, i) => {
      const l = uLuecken(U, st, T).length, ok = l >= 3;
      return `<button class="diger-satir" data-utext="${i}" type="button"${ok ? '' : ' disabled'}><span class="is-ikon" aria-hidden="true">📄</span><span class="is-metin"><b>${esc(T.titel)}</b><span class="soluk">${ok ? `${l} boşluk${st.texte[i] ? ` · ${st.texte[i] >= 2 ? 'iki tur' : 'bir tur'} yapıldı ✓` : ''}` : 'kelimelerini turda öğrendikçe açılır'}</span></span><span class="is-ok">›</span></button>`;
    }).join('');
    const kelime = U.items.map(it => {
      const mid = uMainId(it), tan = uTanidik(st, it);
      const de = it.typ === 'n' ? (mid && byId[mid] ? artHTML(byId[mid]) : `<span class="art art-${it.art}">${esc(it.art)}</span> ${esc(it.lemma)}`) : `<b>${esc(it.de)}</b>`;
      return `<div class="u-kelime${tan ? ' tanidik' : ''}"><span class="de">${de}</span><span class="tr soluk">${esc(it.tr)}</span><span class="yan">${tan ? (mid && S.items[mid] ? noktaHTML(seviyeOf(mid)) : '✓') : '<span class="soluk">yeni</span>'}</span></div>`;
    }).join('');
    const yazma = U.aufgaben.map(a => `<div class="kural"><b>${esc(a.titel)}</b><br>${esc(a.de)}<br><span class="soluk">${esc(a.tr)}</span><br>Kullan: ${a.woerter.map(w => `<span class="chip">${esc(w)}</span>`).join(' ')}
          <textarea class="u-text" data-aufgabe="${a.id}" rows="6" placeholder="Almanca yaz…">${esc((st.texteSchreiben || {})[a.id] || '')}</textarea>
          <button class="btn" data-uaufgabe="${a.id}" type="button">Kaydet (Claude düzeltir)</button></div>`).join('');
    kart.classList.remove('duzen');
    kart.innerHTML = `${kopf}
      <div class="soluk">Ünite kelimeleri turda yeni kelime olarak önce gelir: tanıtım, sonra soru. Burada metinler ve yazma görevleri var.</div>
      <div class="sira" style="margin:.2rem 0"><button class="btn ana buyuk" data-modus="akis" type="button">Turda öğren</button></div>
      <h3>Boşluklu metinler</h3><div class="diger">${metin}</div>
      <h3>Yazma</h3>${yazma}
      <details class="daha"><summary>Kelimeler (${U.items.length})</summary><div class="u-kelimeler">${kelime}</div></details>`;
    tastatur();
  }
  function uTextAc(i) {
    const U = uAktuell(), st = uState(U), T = U.texte[+i];
    if (!T || uLuecken(U, st, T).length < 3) return;
    st.runde = (st.texte[+i] || 0) >= 1 ? 2 : 1;
    st.aktuell = { art: 'text', t: +i };
    save(); uniteRender(); window.scrollTo(0, 0);
  }
  function uLog(sel, it, antwort, erg, loesung) {
    logEintrag({ modus: 'unite', id: it ? it.id : uAktuell().id, item: it ? it.de : sel.art, frage: sel.stufe || sel.art, antwort: antwort || '', ergebnis: erg, loesung: loesung || '', notiz: '' });
  }
  // bir basamak sonucu: doğru → ilerle, yanlış → bir geri; aralık
  function uSchritt(it, ok) {
    const U = uAktuell(), st = uState(U), stufen = U_STUFEN(it);
    let i = st.idx[it.id];
    if (ok) i++; else i = Math.max(1, i - 1);
    if (i >= stufen.length) { st.done[it.id] = true; delete st.idx[it.id]; }
    else st.idx[it.id] = i;
    st.next[it.id] = st.step + (ok ? 4 + i : 6);
    st.letzte = it.id;
  }
  function uWeiter() {
    const U = uAktuell(), st = uState(U);
    const sel = st.aktuell;
    if (sel && sel.art === 'item' && sel.stufe === 'intro') { uSchritt(uById[sel.id], true); }
    st.step++; st.aktuell = null;
    heuteM('unite').n++;
    save(); renderPlan(); uniteRender(); window.scrollTo(0, 0);
  }
  function uZeigeErgebnis(it, ok, hinweis, loes) {
    const box = $('#u-erg');
    box.innerHTML = `<div class="sonuc ${ok === 'richtig' ? 'richtig' : ok === 'fast' ? 'fast' : 'falsch'}">${ok === 'richtig' ? '✓ doğru' : ok === 'fast' ? '≈ küçük hata' : '✗ yanlış'}${hinweis ? ' · ' + esc(hinweis) : ''}${loes ? `<br>Doğrusu: <b>${esc(loes)}</b>` : ''}</div>
      ${ok !== 'richtig' && it ? uKarteHTML(it) : ''}<div class="sira">${devamBtn('act', 'u-weiter')}</div>`;
    aktuell.wartet = true;
  }
  function uMc(i) {
    const st = uState(uAktuell()), sel = st.aktuell; if (!sel || sel.cevap != null) return;
    const it = uById[sel.id], richtig = sel.stufe === 'mc' ? it.tr : sel.stufe === 'mcrev' ? it.de : it.art;
    sel.cevap = i;
    const ok = sel.opts[i] === richtig;
    uSchritt(it, ok); uLog(sel, it, sel.opts[i], ok ? 'richtig' : 'falsch', richtig);
    uniteRender(); uZeigeErgebnis(it, ok ? 'richtig' : 'falsch', '', ok ? '' : richtig);
  }
  function uEingabe() {
    const st = uState(uAktuell()), sel = st.aktuell, inp = $('#cevap'); if (!sel || !inp || sel.geprueft) return;
    const v = inp.value;
    let it = uById[sel.id], r, loes;
    if (sel.art === 'diktat') { r = uPruef(v, it.bsp); if (r.u === 'falsch') { const a = uNorm(v).split(' '), b = uNorm(it.bsp).split(' '); const gleich = a.filter((w, i) => w === b[i]).length; if (gleich >= b.length - 2) r = { u: 'fast', hinweis: 'birkaç kelime farklı' }; } loes = it.bsp; }
    else if (sel.stufe === 'lk') { r = uPruef(v, it.lk); loes = it.lk; }
    else if (sel.stufe === 'typ') { r = uPruef(v, uZiel(it), uAlts(it)); loes = it.de; }
    else if (sel.stufe === 'formen') { r = uPruef(v.replace(/\ber /g, ''), it.formen); loes = it.formen; }
    if (!v.trim()) r = { u: 'falsch', hinweis: 'bilmiyorum' };
    sel.geprueft = true; inp.disabled = true;
    if (sel.art === 'item') uSchritt(it, r.u !== 'falsch');
    uLog(sel, it, v, r.u, loes);
    uZeigeErgebnis(it, r.u, r.hinweis, r.u === 'richtig' ? '' : loes);
    if (sel.art === 'diktat' || sel.stufe === 'lk') sprich(it.bsp);
  }
  function uTextPruef() {
    const U = uAktuell(), st = uState(U), sel = st.aktuell; if (!sel || sel.geprueft) return;
    const T = U.texte[sel.t], soll = uLuecken(U, st, T);
    let r = 0;
    document.querySelectorAll('.u-luecke').forEach(inp => {
      const i = +inp.dataset.ul, ok = uPruef(inp.value, soll[i]).u !== 'falsch';
      if (ok) r++;
      inp.classList.add(ok ? 'ok' : 'yanlis'); inp.disabled = true;
      if (!ok) inp.insertAdjacentHTML('afterend', ` <b class="u-dogru">${esc(soll[i])}</b>`);
    });
    sel.geprueft = true;
    st.texte[sel.t] = Math.max(st.texte[sel.t] || 0, st.runde);
    logEintrag({ modus: 'unite', id: U.id + ':t' + sel.t, item: T.titel, frage: 'metin tur ' + st.runde, antwort: [...document.querySelectorAll('.u-luecke')].map(x => x.value).join(' / '), ergebnis: r === soll.length ? 'richtig' : r >= soll.length * 0.7 ? 'fast' : 'falsch', loesung: soll.join(' / '), notiz: `puan:${r}/${soll.length}` });
    $('#u-text-erg').innerHTML = `<div class="kural"><b>${r} / ${soll.length}</b> doğru</div><div class="sira">${devamBtn('act', 'u-weiter')}</div>`;
    aktuell.wartet = true;
    save();
  }
  function uMatch(code) {
    const st = uState(uAktuell()), sel = st.aktuell; if (!sel) return;
    const seite = code[0], id = code.slice(1);
    if (seite === 'L') { sel.wahl = id; uniteRender(); return; }
    if (!sel.wahl) { flash('Önce soldan seç.'); return; }
    if (sel.wahl === id) { sel.paare[id] = true; sel.wahl = null; }
    else { sel.fehler = (sel.fehler || 0) + 1; flash('✗ ' + uById[sel.wahl].de + ' ≠ ' + uById[id].tr); sel.wahl = null; }
    if (Object.keys(sel.paare).length === sel.ids.length) logEintrag({ modus: 'unite', id: uAktuell().id + ':match', item: 'eşleştirme', frage: sel.ids.map(i => uById[i].de).join(', '), antwort: '', ergebnis: sel.fehler ? 'fast' : 'richtig', loesung: '', notiz: `hata:${sel.fehler || 0}` });
    uniteRender();
  }
  function uOrdnen(i) { const sel = uState(uAktuell()).aktuell; if (!sel || sel.geprueft) return; if (i === 'zurueck') sel.gew.pop(); else if (!sel.gew.includes(i)) sel.gew.push(i); uniteRender(); }
  function uOrdnenPruef() {
    const sel = uState(uAktuell()).aktuell; if (!sel || sel.geprueft) return;
    const it = uById[sel.id], satz = sel.gew.map(i => sel.toks[i].w).join(' '), soll = it.bsp.replace(/[.!?]$/, '');
    const ok = satz === soll;
    sel.geprueft = true;
    uLog(sel, it, satz, ok ? 'richtig' : 'falsch', soll);
    uZeigeErgebnis(it, ok ? 'richtig' : 'falsch', ok ? '' : 'fiilin yerine dikkat', ok ? '' : it.bsp);
    sprich(it.bsp);
  }
  // ünite kelimesi → ana listedeki öğe (önbellek); aktif ünitenin kelimeleri Kern.yeniSira'da önce gelir (uniteSira)
  const _uMain = {};

  // ================= Metin etkinliği (turda bir slot) =================
  // Gerçek metin (DW / Klexikon / Goethe / kitap ünitesi) paragrafında 2–4 boşluk. Boşluk yalnız Kern.sec'in verdiği adaylardan
  // (m.S ≥ 1,5 ve vadeli ya da R < 0,9): her boşluk bir cevap, hafızaya 'metin' biçimiyle yazılır (yan kural, günde tek yazım).
  // Günde bir kez metin yerine dikte (dinle–yaz; hafızaya yazmaz).
  const gesehen = id => !!S.items[id] && !S.items[id].a1 && kind(id) !== 'p' && gueltig(id + ':x') && tierOf(id) >= 2;
  const lernend = id => gesehen(id) && !S.items[id].bekannt && !!(S.items[id].m && S.items[id].m.S);
  const tokRein = w => w.replace(/^[„“"(‚‘»«]+|[.,!?;:“"”)…’‘»«]+$/g, '');
  let _aktSaetze = null;
  // bütün metinler cümle cümle; her kelimenin listedeki karşılığı (formIdx)
  function aktSaetze() {
    if (_aktSaetze) return _aktSaetze;
    const m = formIdx();
    const quellen = LT.map(t => ({ id: t.id, titel: t.titel, quelle: t.reihe || t.quelle, text: t.text || '', glossar: t.glossar }))
      .concat(UNITEN.flatMap(U => U.texte.map((T, i) => ({ id: U.id + ':t' + i, titel: T.titel, quelle: 'Kitap: ' + U.titel, text: T.teile.map(x => typeof x === 'string' ? x : x.f).join('') }))));
    const out = [];
    quellen.forEach(q => q.text.split('\n').forEach((par, pi) => {
      par.split(/(?<=[.!?“])\s+/).filter(x => x.trim()).forEach((satz, si) => {
        if (/https?:|@|^\(aus /.test(satz)) return;
        const toks = satz.split(/\s+/).map(raw => { const c = tokRein(raw); return { raw, c, id: c.length > 2 ? (m.get(c) || m.get(c.charAt(0).toLowerCase() + c.slice(1)) || null) : null }; });
        out.push({ q, pi, si, satz, toks, n: toks.length });
      });
    }));
    return _aktSaetze = out;
  }
  // adaylar: R azalan sıralı öğeler (Kern.sec); maxN: turda kalan cevap (en çok 4)
  function aktLuecke(adaylar, maxN) {
    const A = aktSaetze(), benutzt = S.aktTexte || {}, t = now();
    const gew = new Map(adaylar.map((id, i) => [id, 2 - i / Math.max(1, adaylar.length)]));
    let best = null, bestP = 0;
    for (let a = 0; a < A.length; a++) {
      if (benutzt[A[a].q.id] && t - benutzt[A[a].q.id] < 3 * DAY) continue;
      let w = 0;
      const ids = new Set();
      for (let b = a; b < A.length && b < a + 5; b++) {
        if (A[b].q !== A[a].q || A[b].pi !== A[a].pi) break;
        w += A[b].n;
        if (w > 90) break;
        A[b].toks.forEach(x => { if (x.id && gew.has(x.id)) ids.add(x.id); });
        if (w < 20 || ids.size < 2) continue;
        const p = [...ids].map(id => gew.get(id)).sort((x, y) => y - x).slice(0, maxN).reduce((x, y) => x + y, 0) - w / 60 + Math.random() * 0.5;
        if (p > bestP) { bestP = p; best = A.slice(a, b + 1); }
      }
    }
    if (!best) return null;
    // boşluk: en değerli en çok maxN kelime, her birinin ilk geçtiği yer, metin sırasıyla
    const ids = new Map();
    best.forEach((s, si) => s.toks.forEach((x, ti) => { if (x.id && gew.has(x.id) && !ids.has(x.id)) ids.set(x.id, { si, ti, form: x.c }); }));
    const blanks = [...ids.entries()].sort((x, y) => gew.get(y[0]) - gew.get(x[0])).slice(0, maxN)
      .map(([id, x]) => ({ id, si: x.si, ti: x.ti, form: x.form })).sort((a, b) => a.si - b.si || a.ti - b.ti);
    return blanks.length >= 2 ? { akt: 'luecke', saetze: best, blanks } : null;
  }
  // dikte cümlesi: öğrendiğin kelimelerin kendi cümlelerinden (son 5 günde dikte edilmemiş)
  function aktSatz(art) {
    const maxW = 12, minW = 3, gs = S.aktSaetze || {};
    const kand = [];
    Object.keys(S.items).forEach(id => {
      if (!lernend(id)) return;
      (kind(id) === 'v' ? (SAETZE[id] || []) : (NSAETZE[id] || [])).forEach(x => {
        const n = x.de.split(' ').length;
        if (n <= maxW && n >= minW && !(gs[x.de] && now() - gs[x.de] < 5 * DAY)) kand.push({ id, de: x.de, tr: x.tr, w: (schwach(id) ? 2 : 1) + Math.random() });
      });
    });
    if (!kand.length) return null;
    kand.sort((a, b) => b.w - a.w);
    return { akt: art, satz: kand[0] };
  }
  function aktFrage(sel) {
    const q = Object.assign({ typ: 'akt', art: sel.akt, start: now() }, sel);
    if (q.art === 'luecke') {
      const T = q.saetze[0].q;
      (S.aktTexte = S.aktTexte || {})[T.id] = now();
      session.aktMetin = { titel: T.titel, glossar: T.glossar || [] };
    }
    if (q.art === 'diktat') (S.aktSaetze = S.aktSaetze || {})[q.satz.de] = now();
    return q;
  }
  const AKT_AD = { luecke: 'metinde boşluk', diktat: 'dinle–yaz' };
  // odak düzeni (render ile aynı): metin / dinle düğmeleri üstte (.q-ust), girdi + ä ö ü ß + Kontrol altta (.q-alt, sticky);
  // sonuç #sonuc panelinde (q-alt gizlenir), Devam görünür alanın altında
  function aktRender(q) {
    $('#durum-satiri').innerHTML = '';
    let ust = `<div class="tur"><span class="yeni">gerçek metin</span><span>${esc(AKT_AD[q.art] || q.art)}</span></div>`, alt = '';
    if (q.art === 'luecke') {
      const T = q.saetze[0].q, bl = new Map(q.blanks.map((b, i) => [b.si + ':' + b.ti, i]));
      const body = q.saetze.map((s, si) => s.toks.map((t, ti) => {
        const i = bl.get(si + ':' + ti);
        if (i == null) return `<span class="lw">${esc(t.raw)}</span>`;
        const vor = t.raw.slice(0, t.raw.indexOf(t.c)), nach = t.raw.slice(t.raw.indexOf(t.c) + t.c.length);
        const w = q.werte ? q.werte[i] : '', b = q.blanks[i];
        return `${esc(vor)}<input class="u-luecke${q.ok ? (q.ok[i] ? ' ok' : ' yanlis') : ''}" data-al="${i}" size="${Math.max(6, t.c.length + 1)}" placeholder="${esc(kurzTr(trOf(b.id)).slice(0, 18))}" title="${esc(kurzTr(trOf(b.id)))}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" value="${esc(w || '')}"${q.ok ? ' disabled' : ''}>${q.ok && !q.ok[i] ? ` <b class="u-dogru">${esc(b.form)}</b>` : ''}${esc(nach)}`;
      }).join(' ')).join(' ');
      ust += `<div class="soluk">${q.blanks.length} boşluk: daha önce öğrendiğin kelimeler, metindeki biçimiyle (soluk yazı = anlamı). Bilmediğin kelimeye bas, anlamı çıkar. · ${esc(T.quelle || '')}</div>
        <div class="soru">${esc(T.titel || '')}</div>
        <div class="paket-text u-text-body" id="lesen-text">${body}</div><div id="lesen-wort" class="kural" hidden></div>`;
      alt = `${UMLAUT_IC}<div class="alt-sira"><span class="soluk">${q.blanks.length} boşluk · Enter: sıradaki</span><button class="btn ana" data-akt="pruef" type="button">Kontrol</button></div>`;
    } else if (q.art === 'diktat') {
      ust += `<div class="soluk">Dinle, duyduğun cümleyi yaz (istediğin kadar dinle)</div>
        <div class="sira" style="justify-content:center"><button class="btn buyuk" data-sprich="${esc(q.satz.de)}" type="button">🔊 Dinle</button><button class="btn mini" data-sprich-yavas="${esc(q.satz.de)}" type="button">🐢 yavaş</button></div>`;
      alt = `<div class="yaz-kutu"><input id="cevap" type="text" enterkeyhint="go" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="duyduğun cümle" aria-label="Cevap" value="${esc(q.eingabe || '')}">${UMLAUT_IC}</div>
        <div class="alt-sira"><span></span><button class="btn ana" data-akt="pruef" type="button">Kontrol <kbd>Enter</kbd></button></div>`;
    }
    kart.classList.add('duzen');
    if (q.wartet) kart.classList.add('cevaplandi');
    kart.innerHTML = `<div class="q-ust">${ust}</div><div class="q-alt" id="q-alt"${q.wartet ? ' hidden' : ''}>${alt}</div><div id="sonuc" class="sonuc-yer">${q.wartet ? q.ergHTML || '' : ''}</div>`;
    tastatur();
    if (q.wartet) {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      const b = kart.querySelector('#sonuc .devam-btn');
      if (b) requestAnimationFrame(() => { const r = b.getBoundingClientRect(), vh = window.visualViewport ? visualViewport.height : innerHeight; if (r.bottom > vh - 4 || r.top < 0) b.scrollIntoView({ block: 'end' }); });
      return;
    }
    if (q.art === 'diktat') { const i = $('#cevap'); if (i) i.focus(); if (!q.gesprochen) { q.gesprochen = true; sprich(q.satz.de); } }
    if (q.art === 'luecke') { const i = document.querySelector('.u-luecke'); if (i) i.focus(); }
  }
  // etkinlik bitti: özet log satırı (boşluklar ayrı ayrı sayıldı ve yazıldı; dikte 1 cevap)
  function aktAbschluss(q, urteil, antwort, loesung, notiz, gezaehlt) {
    if (!gezaehlt) { zaehlen({ typ: 'akt' }, urteil); session.q++; if (session.ot) { session.ot.adim = (session.ot.adim || 0) + 1; session.ot.gecmis.push({ id: q.satz && q.satz.id, bicim: 'diktat', tur: 'akt' }); } }
    fxCevap(urteil);
    logEintrag({ modus: 'akt', id: q.art + (q.saetze ? ':' + q.saetze[0].q.id : q.satz ? ':' + q.satz.id : ''), item: AKT_AD[q.art], frage: q.saetze ? q.saetze.map(s => s.satz).join(' ').slice(0, 300) : q.satz ? q.satz.de : '', antwort: antwort || '', ergebnis: urteil, loesung: loesung || '', notiz: notiz || '' });
    q.wartet = true;
    q.ergHTML = `<div class="sonuc ${urteil}">${q.ergHTML || ''}<div class="notlar">${devamBtn('akt', 'weiter', urteil === 'richtig' ? 1200 : 0)}</div></div>`;
    save(); renderHedef(); renderPlan();
    aktRender(q);
    if (urteil === 'richtig') later(() => { if (aktuell === q && q.wartet) zeige(); }, 1200);
  }
  function aktPruef() {
    const q = aktuell; if (!q || q.typ !== 'akt' || q.wartet) return;
    if (q.art === 'luecke') {
      const t = now(), T = q.saetze[0].q;
      q.werte = q.blanks.map((b, i) => (document.querySelector(`.u-luecke[data-al="${i}"]`) || {}).value || '');
      const sonuclar = q.blanks.map((b, i) => {
        const w = q.werte[i].trim(), r = uPruef(w, b.form);
        const tip = !w ? 'bilmiyorum' : r.u === 'richtig' ? 'dogru' : r.u === 'fast' ? 'yazim' : 'yanlis';
        const satz = (q.saetze[b.si] || {}).satz || '';
        const qq = { id: b.id, sel: { b: 3 }, bicim: 'metin', typ: Kern.eskiTur(b.id, 'metin'), antwort: w, ziel: b.form, frageText: satz.replace(b.form, '_____'), modus: 'luecke' };
        const r2 = hafizaYaz(qq, { bicim: 'metin', tip, etiketler: r.hinweis && tip !== 'dogru' ? [r.hinweis] : [] }, t, { yan: true, kaynak: T.id });
        zaehlen({ typ: 'luecke' }, r2.ergebnis);
        session.q++;
        turKelime(b.id, r2.ergebnis === 'richtig' ? 3 : r2.ergebnis === 'fast' ? 2 : 1);
        if (session.ot) { session.ot.adim = (session.ot.adim || 0) + 1; session.ot.gecmis.push({ id: b.id, bicim: 'metin', tur: 'metin' }); }
        if (session.tur && r2.out.seviyeSonra > r2.out.seviyeOnce && r2.out.seviyeOnce > 0) { session.tur.seviye.push(b.id); (session.seviyeCip = session.seviyeCip || []).push({ id: b.id, sv: r2.out.seviyeSonra }); }
        if (session.tur) { session.tur.tekrar = (session.tur.tekrar || 0) + 1; if (r2.ergebnis !== 'falsch') session.tur.tekrarOk = (session.tur.tekrarOk || 0) + (r2.ergebnis === 'richtig' ? 1 : 0.5); }
        return r2.ergebnis;
      });
      q.ok = sonuclar.map(x => x !== 'falsch');
      const r = sonuclar.filter(x => x === 'richtig').length, n = q.blanks.length;
      const dg = q.ok.filter(Boolean).length;
      q.ergHTML = `<div class="baslik">${dg === n ? '✓' : dg ? '≈' : '✗'} ${dg} / ${n} doğru</div>${r < n ? '<div class="soluk">yanlışların doğrusu metinde yeşil</div>' : ''}`;
      aktAbschluss(q, r === n ? 'richtig' : q.ok.filter(Boolean).length >= n * 0.6 ? 'fast' : 'falsch', q.werte.join(' / '), q.blanks.map(b => b.form).join(' / '), `puan:${q.ok.filter(Boolean).length}/${n} | boşluk:${n}`, true);
    } else if (q.art === 'diktat') {
      const i = $('#cevap'); q.eingabe = i ? i.value : '';
      let r = uPruef(q.eingabe, q.satz.de);
      if (r.u === 'falsch') {
        const a = uNorm(q.eingabe).split(' '), b = uNorm(q.satz.de).split(' ');
        const gleich = b.filter((w, k) => a[k] === w).length;
        if (gleich >= b.length - 1 && b.length > 3) r = { u: 'fast', hinweis: 'bir kelime farklı' };
      }
      q.erg = r.u;
      // harf düzeyinde fark (sonuç paneliyle aynı: kırmızı = senin fazlan, yeşil = eksik)
      let fark = '';
      if (r.u !== 'richtig') { try { fark = q.eingabe.trim() ? diffHTML({ diff: G.diff(G.toks(G.norm(q.eingabe)), G.toks(G.norm(q.satz.de))) }) : '<span class="soluk">—</span>'; } catch (e) { fark = esc(q.eingabe); } }
      q.ergHTML = `<div class="baslik">${r.u === 'richtig' ? '✓ Doğru' : r.u === 'fast' ? '≈ Küçük hata' : '✗ Yanlış'}${r.hinweis ? `<span class="etiketler"><span class="etiket">${esc(r.hinweis)}</span></span>` : ''}</div>
        ${fark ? `<div class="satir"><span class="et">senin</span><span class="deger fark">${fark}</span></div>` : ''}
        <div class="satir"><span class="et">${r.u === 'richtig' ? 'cümle' : 'doğru'}</span><span class="deger">${deHTML(q.satz.de)}</span></div>
        <div class="soluk">${esc(q.satz.tr)}</div>`;
      aktAbschluss(q, r.u, q.eingabe, q.satz.de, r.hinweis || '');
    }
  }
  function aktAktion(a) {
    const q = aktuell; if (!q || q.typ !== 'akt') return;
    if (a === 'pruef') aktPruef();
    else if (a === 'weiter') zeige();
  }

  // ================= Günün fiil metni =================
  // Her gün (sabah 4'te değişir) gerçek bir metin (DW / Klexikon / Goethe): tam bilmediğin düzensiz fiillerin çekimli hâllerini en çok içeren.
  // Fiil formları işaretli; basınca mastar + zaman + üç form. Sonra kısa test (hangi zaman?). Görülen fiillerin çekim sorusu ancak bundan sonra açılır.
  const fvTag = () => tag(now() - 4 * 3600000);
  let _fvIdx = null;
  function fvIndex() {
    if (_fvIdx) return _fvIdx;
    _fvIdx = new Map();
    const add = (form, v, zeit, pre) => { if (!form || form === v.inf) return; const l = _fvIdx.get(form) || []; if (!l.some(x => x.id === v.id && x.zeit === zeit)) l.push({ id: v.id, zeit, pre }); _fvIdx.set(form, l); };
    VERBEN.forEach(v => {
      if (!v.stark || !v.frmDrill || v.tier < 2) return;  // A1 fiilleri (gehen, kommen …) zaten biliniyor
      if (/\s/.test(v.inf) || v.sp) return;  // çok kelimeli (bekannt geben, Angst haben): yanlış eşleşir
      const pre = v.pre && !v.sp ? v.pre : '';  // ayrılabilen ön ek: cümlede ayrıca aranır
      const f = G.praesensForms(v);
      [0, 1, 2, 4].forEach(i => add(f[i], v, 'Präsens', pre));
      if (v.ptForm) G.praeteritumForms(v.ptForm).forEach(x => add(x, v, 'Präteritum', pre));
      (v.p2s || v.p2 || '').split(/[ /(]/).filter(x => x && x.length > 3).slice(0, 1).forEach(x => add(x, v, 'Perfekt (Partizip)', ''));
    });
    return _fvIdx;
  }
  // bir cümlede fiil formlarını bul; ayrılabilen fiilde ön ek cümlede yoksa ön eksiz fiil
  function fvImSatz(satz) {
    const idx = fvIndex(), roh = satz.split(/\s+/), toks = roh.map(t => t.replace(/^[„“"(‚]+|[.,!?;:“"”)…’‘]+$/g, ''));
    // ayrılabilen ön ek: yan cümlenin sonunda (noktalamadan hemen önce ya da cümle sonu) — "fällt mir auf," evet, "an der Uni" hayır
    const sonda = new Set(); roh.forEach((t, i) => { if (/[.,!?;:“"”)]$/.test(t) || i === roh.length - 1) sonda.add(i); });
    const out = [];
    toks.forEach((t, i) => {
      const l = idx.get(t); if (!l) return;
      let ende = i + 1; while (ende < toks.length && !sonda.has(ende - 1)) ende++;
      const prefix = sonda.has(i) ? null : toks[Math.min(ende, toks.length) - 1];
      const mitPre = l.filter(x => x.pre && x.pre === prefix), ohne = l.filter(x => !x.pre);
      const x = (mitPre[0] || ohne[0]); if (x) out.push(Object.assign({ form: t }, x));
    });
    return out;
  }
  function fvZiele() {
    // tam bilmediğin: öğrenilmiş ama zayıf (S < 7 gün) ya da hiç öğrenilmemiş B1/A2 fiilleri; çekimini daha önce görmediklerin önce
    const fg = S.formGesehen || {};
    const w = {};
    VERBEN.forEach(v => {
      if (!v.stark || !v.frmDrill) return;
      const c = (S.items[v.id] || {}).m;
      let p = S.items[v.id] ? (c && c.S >= 7 ? 0.5 : 3) : (v.tier >= 3 ? 1.2 : 1);
      if (fg[v.id]) p *= 0.3;
      w[v.id] = p;
    });
    return w;
  }
  function fvWaehlen() {
    const d = fvTag(), h = S.fiilMetin = S.fiilMetin || {};
    // Goethe Übungssatz metinleri (aufgaben'li) Prüfung'a ayrıldı: fiil metni olmaz (daha önce seçildiyse yenisi)
    const kayitli = h[d] && LT.find(x => x.id === h[d].id);
    if (kayitli && !kayitli.aufgaben) return kayitli;
    const benutzt = new Set(Object.values(h).map(x => x.id)), w = fvZiele();
    let best = null, bestP = -1;
    LT.forEach(t => {
      if (benutzt.has(t.id) || t.aufgaben) return;
      const ids = new Set(); (t.text || '').split(/(?<=[.!?])\s+/).forEach(s => fvImSatz(s).forEach(x => ids.add(x.id)));
      const p = [...ids].reduce((a, id) => a + (w[id] || 0), 0) / Math.max(1, Math.sqrt((t.text || '').length / 800)) * (t.quelle === 'Klexikon' ? 0.8 : 1);
      if (ids.size >= 3 && p > bestP) { bestP = p; best = t; }
    });
    if (best) { h[d] = { id: best.id }; save(); }
    return best;
  }
  function fiilMetinRender() {
    const L = fvWaehlen();
    aktuell = { typ: 'lesen' };
    $('#durum-satiri').innerHTML = '';
    if (!L) { kart.innerHTML = '<div class="bos">Fiil metni bulunamadı.</div>'; return; }
    session.lesen = L; session.lesenFv = true;
    const st = session.fv && session.fv.id === L.id && session.fv.tag === fvTag() ? session.fv : (session.fv = { id: L.id, tag: fvTag(), test: null, i: 0, cevap: [] });
    const funde = [];
    const text = L.text.split('\n').map(par => '<p>' + par.split(/(?<=[.!?])\s+/).map(satz => {
      const fs = fvImSatz(satz); fs.forEach(x => funde.push(Object.assign({ satz }, x)));
      const formen = new Set(fs.map(x => x.form));
      return esc(satz).split(/(\s+)/).map(w => { if (!/\S/.test(w)) return w; const c = w.replace(/^[„“"(‚]+|[.,!?;:“"”)…’‘]+$/g, ''); const f = formen.has(c) && fs.find(x => x.form === c); return f ? `<span class="lw fv" data-fv="${f.id}|${esc(f.form)}|${esc(f.zeit)}">${w}</span>` : `<span class="lw">${w}</span>`; }).join('');
    }).join(' ') + '</p>').join('');
    const verbs = [...new Map(funde.map(x => [x.id, x])).values()];
    st.funde = funde;
    const tabelle = `<table class="fv-tab"><tr><th>fiil</th>${formen(vById[verbs[0].id]).map(f => `<th>${esc(f.et)}</th>`).join('')}</tr>${verbs.map(x => { const v = vById[x.id]; return `<tr><td><b>${esc(v.anz)}</b><br><span class="soluk">${esc(v.tr)}</span></td>${formen(v).map(f => `<td>er ${esc(f.soll)}</td>`).join('')}${MODALV.has(v.inf) ? '<td>—</td>' : ''}</tr>`; }).join('')}</table>`;
    let test = '';
    if (st.test) {
      const q = st.test[st.i];
      if (q) {
        const v = vById[q.id], c = st.cevap[st.i];
        const soru = q.ziel === 'mastar' ? `<mark>${esc(q.form)}</mark> hangi fiilin formu?` : `<mark>${esc(q.form)}</mark> <span class="soluk">(${esc(q.zeit)})</span> → aynı fiil, <b>${esc(q.ziel)}</b>: er …?`;
        test = `<div class="kural"><div class="soluk">Test ${st.i + 1} / ${st.test.length} · metinden: „${esc(q.satz)}“</div>
          <div class="soru de">${soru}</div>
          <div class="gl-opts">${q.opts.map((o, i) => `<button class="btn mini gl-opt${c == null ? '' : o === q.ok ? ' ok' : o === c ? ' yanlis' : ''}" data-fvt="${esc(o)}" type="button"${c != null ? ' disabled' : ''}><kbd>${i + 1}</kbd> ${esc(o)}</button>`).join(' ')}</div>
          ${c != null ? `<div>${c === q.ok ? '✓' : '✗'} <b>${esc(q.form)}</b> = ${esc(v.anz)} (${esc(v.tr)}), ${esc(q.zeit)} · ${formen(v).map(f => 'er ' + esc(f.soll)).join(', ')}${q.erkl ? `<div class="soluk">${esc(q.erkl)}</div>` : ''}</div><div class="sira">${devamBtn('act', 'fv-weiter')}</div>` : ''}</div>`;
      } else {
        const r = st.test.filter((q, i) => st.cevap[i] === q.ok).length;
        test = `<div class="kural"><b>${r} / ${st.test.length}</b> doğru. Bu fiillerin çekim soruları yarından itibaren gelecek.</div><div class="sira"><button class="btn ana" data-modus="akis" type="button">Çalış'a dön</button></div>`;
      }
    }
    kart.innerHTML = `<div class="tur"><span class="yeni">günün fiil metni</span><span>${esc(L.reihe || L.quelle)} · ${verbs.length} fiil işaretli · basınca mastarı ve zamanı</span></div>
      <div class="soru">${esc(L.titel)}</div>
      <div class="paket-text" id="lesen-text">${text}</div>
      <div id="lesen-wort" class="kural" hidden></div>
      <details class="ceviri" open><summary>Metindeki fiillerin formları (${verbs.length})</summary>${tabelle}</details>
      ${test}
      ${st.test ? '' : '<div class="sira"><button class="btn ana" data-act="fv-test" type="button">Okudum, teste geç</button></div>'}`;
    tastatur();
  }
  // test: metindeki formdan başka bir zamana geç (Präsens / Präteritum / Perfekt dengeli) ya da mastarı bul.
  // Çeldiriciler tipik hatalar: düzenli sanma (fliehte, geflieht), yanlış yardımcı fiil (hat ↔ ist), ünlü değişmeden Präsens (fahrt), başka zamanın formu.
  const FV_ZEITEN = ['Präsens', 'Präteritum', 'Perfekt'];
  const fvZeitIdx = z => z.startsWith('Perfekt') ? 2 : z === 'Präteritum' ? 1 : 0;
  function fvSchwach(v) {
    const pre = v.pre ? ' ' + v.pre : '', st = v.base.replace(/e?n$/, ''), e = /[td]$/.test(st) ? 'e' : '';
    const untrennbar = /^(be|ge|er|ver|zer|ent|emp|miss)/.test(v.base) || /ieren$/.test(v.base);
    return {
      pt: st + e + 'te' + pre,
      p2: (v.pre || '') + (untrennbar ? '' : 'ge') + st + e + 't',
      p3: st + e + 't' + pre,  // ünlü değişmeden (fährt → fahrt)
    };
  }
  function fvOptionen(v, ziel) {
    const f = formen(v), sw = fvSchwach(v), sich = v.refl ? ' sich' : '';
    const ok = f[ziel].soll, swap = { hat: 'ist', ist: 'hat' }[v.aux];
    const p2 = f[2] ? v.p2s : null;
    let d;
    if (ziel === 2) d = [v.auxAlt ? null : `${swap}${sich} ${p2}`, `${v.aux}${sich} ${sw.p2}`, `${swap}${sich} ${sw.p2}`, f[1].soll];
    else if (ziel === 1) d = [sw.pt, f[0].soll, p2, sw.p3];
    else d = [sw.p3, f[1].soll, sw.pt, p2];
    const alt = f[ziel].alt;
    d = [...new Set(d.filter(x => x && x !== ok && x !== alt))].slice(0, 3);
    return { ok, opts: shuffle(d.concat([ok])) };
  }
  function fvTestStart() {
    const st = session.fv; if (!st || !st.funde) return;
    const seen = new Set(), t = [], zahl = [0, 0, 0];
    shuffle(st.funde.slice()).forEach(x => { if (!seen.has(x.id) && t.length < 6) { seen.add(x.id); t.push(Object.assign({}, x)); } });
    const ids = [...new Set(st.funde.map(x => x.id))];
    t.forEach((q, i) => {
      const v = vById[q.id], von = fvZeitIdx(q.zeit), n = formen(v).length;
      q.zeit = FV_ZEITEN[von];
      // 6 sorudan 2'si mastar (okurken fiili tanımak), diğerleri başka zamana geçiş
      if (i % 3 === 2) {
        const andere = shuffle(ids.filter(x => x !== q.id)).concat(shuffle(STARK_ORDER.filter(w => w.id !== q.id && w.tier >= 2 && w.inf[0] === v.inf[0]).map(w => w.id)), shuffle(STARK_ORDER.map(w => w.id)));
        const opts = [...new Set(andere.filter(x => x !== q.id).map(x => vById[x].inf))].filter(x => x !== v.inf).slice(0, 3);
        Object.assign(q, { ziel: 'mastar', ok: v.inf, opts: shuffle(opts.concat([v.inf])) });
        return;
      }
      const ziel = [0, 1, 2].filter(z => z !== von && z < n).sort((a, b) => zahl[a] - zahl[b] || Math.random() - 0.5)[0];
      zahl[ziel]++;
      Object.assign(q, { ziel: FV_ZEITEN[ziel] }, fvOptionen(v, ziel));
      if (ziel === 2) q.erkl = v.aux === 'ist' ? 'Perfekt sein ile (hareket / durum değişikliği).' : 'Perfekt haben ile.';
    });
    st.test = t; st.i = 0; st.cevap = [];
    fiilMetinRender();
  }
  function fvTestAntwort(z) {
    const st = session.fv, q = st && st.test && st.test[st.i];
    if (!q || st.cevap[st.i] != null) return;
    st.cevap[st.i] = z;
    // seçilen form → kök hafızası (kokSec, c +1,0; yalnız öğrendiğin düzensiz fiilde, yan kural: vadeli ya da R < 0,9)
    let kopf = '';
    const v = vById[q.id], kk = S.kok && v && S.kok[v.base];
    if (S.items[q.id] && kk && kk.S) kopf = hafizaYaz({ id: q.id, sel: {}, bicim: 'kokSec', antwort: z, ziel: q.ok }, { bicim: 'kokSec', tip: 'stamm', yanlis: z === q.ok ? 0 : 2 }, now(), { yan: true, log: false }).kopf;
    logEintrag({ modus: 'fiilmetin', id: q.id, item: vById[q.id].anz, frage: `${q.form} → ${q.ziel} | ${q.satz}`, antwort: z, ergebnis: z === q.ok ? 'richtig' : 'falsch', loesung: q.ok, notiz: [session.lesen.id, kopf].filter(Boolean).join(' | ') });
    fiilMetinRender();
  }
  function fvWeiter() {
    const st = session.fv; if (!st || !st.test) return;
    st.i++;
    if (st.i >= st.test.length && !st.fertig) {
      st.fertig = true;
      const fg = S.formGesehen = S.formGesehen || {}, t = now();
      [...new Set(st.funde.map(x => x.id))].forEach(id => {
        fg[id] = fvTag();
        // kök sorusu: yalnız öğrendiğin düzensiz fiillerde (yeni kök günde en çok 2, Kern.sec)
        const v = vById[id]; S.kok = S.kok || {};
        if (S.items[id] && v && v.stark && v.frmDrill && !S.kok[v.base]) S.kok[v.base] = { ornek: id, yeni: 1 };
      });
      heuteM('fiilmetin').n++;
      logEintrag({ modus: 'fiilmetin', id: session.lesen.id, item: session.lesen.titel, frage: '', antwort: '', ergebnis: 'gelesen', loesung: '', notiz: `puan:${st.test.filter((q, i) => st.cevap[i] === q.ok).length}/${st.test.length}` });
      save(); renderPlan();
    }
    fiilMetinRender();
  }

  function lesenWort(el) {
    const id = wortSuchen(el.textContent), box = $('#lesen-wort');
    document.querySelectorAll('#lesen-text .lw.aktiv').forEach(x => x.classList.remove('aktiv'));
    el.classList.add('aktiv');
    box.hidden = false;
    const LQ = (aktuell && aktuell.typ === 'akt' ? session.aktMetin : session.lesen) || {};
    if (!id) {
      const w = el.textContent.replace(/[.,!?;:“"”„()]/g, '').toLowerCase();
      const g = (LQ.glossar || []).find(x => { const h = x.de.split(/[ ,(]/)[0].replace(/\|/g, '').toLowerCase(); return h.length > 3 && (w.startsWith(h.slice(0, Math.max(4, h.length - 2))) || h.startsWith(w)); });
      box.innerHTML = g ? `<b>${esc(g.de)}</b>: ${esc(g.erkl)} <span class="soluk">(DW sözlüğü)</span>` : `<b>${esc(el.textContent.replace(/[.,!?;:“"”„]/g, ''))}</b>: listede yok`;
      return;
    }
    box.innerHTML = `${deItemHTML(id)} = <b>${esc(trOf(id))}</b>${S.items[id] ? '' : ` <button class="btn mini" data-lernen="${id}" type="button">Öğrenmeye ekle</button>`}`;
    // SPEC §6: okurken bakılan öğe en geç yarın 04:00 sorulur
    const it = S.items[id];
    if (it && it.m && it.m.S) it.m.due = Math.min(it.m.due, Kern.ertesiGun4(now()));
    logEintrag({ modus: 'lesen-wort', id, item: label(id), frage: LQ.titel || '', antwort: '', ergebnis: S.items[id] ? 'bekannt' : 'neu', loesung: trOf(id), notiz: '' });
  }
  // Goethe Übungssatz: orijinal sorular, çözüm cevap kağıdından
  function goetheAufgabenHTML(L) {
    const C = session.lesenCevap || (session.lesenCevap = {}), fertig = Object.keys(C).length === L.aufgaben.length;
    const h = L.aufgaben.map((a, i) => {
      const c = C[i], opts = GL_OPT[L.art](a);
      const btn = opts.map(([v, t]) => {
        const kl = c == null ? '' : v === a.l ? ' ok' : v === c ? ' yanlis' : '';
        return `<button class="btn mini gl-opt${kl}" data-ga="${i}:${v}" type="button"${c != null ? ' disabled' : ''}>${esc(t)}</button>`;
      }).join(L.art === 'abc' ? '<br>' : ' ');
      return `<div class="gl-auf"><div><b>${a.n}</b> ${esc(a.s)}${c == null ? '' : c === a.l ? ' <span class="ok">✓</span>' : ` <span class="yanlis">✗ doğrusu: ${esc(a.l)}</span>`}</div><div class="gl-opts">${btn}</div></div>`;
    }).join('');
    const r = L.aufgaben.filter((a, i) => C[i] === a.l).length;
    return `<div class="gl-aufgaben">${h}</div>${fertig ? `<div class="kural"><b>${r} / ${L.aufgaben.length}</b> doğru</div>` : ''}`;
  }
  function goetheAntwort(i, v) {
    const L = session.lesen, C = session.lesenCevap || (session.lesenCevap = {});
    if (!L || !L.aufgaben || C[i] != null) return;
    C[i] = v;
    const a = L.aufgaben[i];
    logEintrag({ modus: 'lesen', id: L.id + ':' + a.n, item: L.titel, frage: a.s, antwort: v, ergebnis: v === a.l ? 'richtig' : 'falsch', loesung: a.l, notiz: L.reihe });
    if (Object.keys(C).length === L.aufgaben.length) {
      const r = L.aufgaben.filter((x, j) => C[j] === x.l).length;
      (S.gelesen = S.gelesen || {})[L.id] = now(); heuteM('lesen').n++;
      logEintrag({ modus: 'lesen', id: L.id, item: L.titel, frage: L.reihe, antwort: '', ergebnis: 'gelesen', loesung: '', notiz: `puan:${r}/${L.aufgaben.length}` });
      save(); renderPlan();
    }
    const y = window.scrollY; lesenRender(); window.scrollTo(0, y);
  }

  // ================= Baştan savmaya karşı =================
  // boş / rastgele yazılmış cevap: hedefe sayılmaz, "bilmiyorum" gibi işlenir
  function istMuell(input) {
    const s = String(input || '').trim();
    if (s.length < 2) return true;
    if (!/[a-zäöüß]/i.test(s)) return true;
    if (/(.)\1{3,}/.test(s)) return true;
    const letters = s.replace(/[^a-zäöüß]/gi, '');
    if (letters.length >= 4 && !/[aeiouäöüy]/i.test(letters)) return true;
    return false;
  }
  // son 8 cevapta çok yanlış ya da çok "bas geç" → 10 soru boyunca yeni kelime yok, kolay sorular önce
  function dikkatNotieren(ok, schlampig) {
    session.son.push({ ok, schlampig: !!schlampig });
    if (session.son.length > 8) session.son.shift();
    if (session.dikkatBis > session.q || session.son.length < 6) return;
    const falsch = session.son.filter(x => !x.ok).length, schl = session.son.filter(x => x.schlampig).length;
    if (falsch >= 5 || schl >= 3) {
      session.dikkatBis = session.q + 10;
      session.son = [];
      session.hinweisBis = session.dikkatBis;
      session.hinweis = schl >= 3
        ? 'Çok hızlı basıyorsun: acele etme, önce aklından söyle.'
        : 'Zorlanıyorsun gibi: sıradakiler biraz daha kolay. Mola da iyi gelir.';
      logEintrag({ modus: 'dikkat', id: '', item: '', frage: '', antwort: '', ergebnis: schl >= 3 ? 'bas-gec' : 'cok-yanlis', loesung: '', notiz: `son8 yanlış:${falsch} hızlı/boş:${schl}` });
    }
  }
  // takılan kelime: üç ayrı günde yanlış → kanca için işaretle (aynı gün içindeki tekrar hataları bir sayılır)
  const LEECH_TAGE = 3;
  function leechPruefen(id) {
    const it = S.items[id];
    if (!it || it.leech) return;
    const d = tag();
    it.fehlTage = it.fehlTage || [];
    if (!it.fehlTage.includes(d)) it.fehlTage.push(d);
    if (it.fehlTage.length >= LEECH_TAGE) {
      it.leech = now();
      if (session.tur) (session.tur.takilan = session.tur.takilan || []).push(id);   // tur içinde toast yok: tur sonunda
      logEintrag({ modus: 'leech', id, item: label(id), frage: trOf(id), antwort: '', ergebnis: 'takiliyor', loesung: '', notiz: `günler:${it.fehlTage.join(',')}` });
    }
  }

  // ================= Çizim =================
  const kart = $('#kart');
  // ä/ö/ü tuşları yalnız yazma kutusu varken; ana sorularda satır kutuya bitişik (.klavye.ic), genel satır paket / metin / dikte için
  const tastatur = () => { $('#umlaut').hidden = !kart.querySelector('#cevap, .u-luecke') || !!kart.querySelector('.klavye.ic') || !!(aktuell && aktuell.typ === 'einf'); };
  let letzteEingabe = null;
  document.addEventListener('focusin', e => { if (e.target.id === 'cevap' || (e.target.classList && e.target.classList.contains('u-luecke'))) letzteEingabe = e.target; });
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  function flash(msg) {
    const h = $('#hinweis');
    h.textContent = msg; h.hidden = false; h.classList.add('kisa');
    later(() => { h.classList.remove('kisa'); hinweisRender(); }, 1600);
  }
  function hinweisRender() {
    const h = $('#hinweis');
    h.classList.remove('kisa');
    const msgs = [];
    if (session.hinweis && session.q < (session.hinweisBis || 0)) msgs.push(session.hinweis);
    h.hidden = !msgs.length;
    h.innerHTML = msgs.map(m => `<div>${esc(m)}</div>`).join('');
  }
  // tek Devam bileşeni (soru, tanıtım, paket, metin, ünite, okuma): oto (ms) verilirse dolum çizgisi (doğruda 0,8–1,2 sn), yoksa bekler
  const devamBtn = (attr, deger, oto, metin) => `<button class="btn ana devam-btn${oto ? ' otomatik' : ''}" data-${attr}="${deger}" type="button">${oto ? `<span class="dolum" style="animation-duration:${oto}ms"></span>` : ''}<span>${metin || 'Devam'}</span> <kbd>Enter</kbd></button>`;
  // seviye noktaları ●●○○○ (Kern.seviye: 0 yeni … 5 usta)
  const SEVIYE_AD = ['Yeni', 'Tanıyor', 'Yazıyor', 'Cümlede', 'Oturdu', 'Usta'];
  const seviyeOf = id => Kern.seviye(S.items[id], id);
  const noktaHTML = sv => `<span class="seviye-nokta" aria-label="Seviye ${sv}/5: ${SEVIYE_AD[sv]}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= sv ? 'dolu' : ''}"></i>`).join('')}</span>`;
  const seviyeNokta = id => { if (!id || kind(id) === 'p' || !S.items[id]) return ''; const sv = seviyeOf(id); return sv ? `<div>${noktaHTML(sv)}<span class="seviye-nokta"><span>${SEVIYE_AD[sv]}</span></span></div>` : ''; };
  // harf düzeyinde fark (anstrenge → anstrengen: "anstrenge" + yeşil "n"); fazla harf kırmızı üstü çizili, eksik harf yeşil
  function harfFark(a, b) {
    const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, out = '';
    const parca = [];
    const ekle = (op, c) => { const s = parca[parca.length - 1]; if (s && s.op === op) s.t += c; else parca.push({ op, t: c }); };
    while (i < n && j < m) { if (a[i] === b[j]) { ekle('eq', a[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) ekle('ins', a[i++]); else ekle('del', b[j++]); }
    while (i < n) ekle('ins', a[i++]); while (j < m) ekle('del', b[j++]);
    parca.forEach(x => { out += x.op === 'eq' ? esc(x.t) : x.op === 'ins' ? `<span class="h-fazla">${esc(x.t)}</span>` : `<span class="h-eksik">${esc(x.t)}</span>`; });
    return out;
  }
  // tostlar: tur içinde (Çalış görünürken) gösterilmez, kuyruğa alınır; tur sonunda kartın içinde, çıkışta tost olarak
  const toastKuyruk = [];
  const calisAcik = () => !$('#v-calis').hidden;
  const turIcinde = () => calisAcik() && SORU_MODI.has(session.modus);
  function toastBosalt() {
    if (!toastKuyruk.length || calisAcik()) return;
    const l = toastKuyruk.splice(0);
    toast(l.join('<br>'), 2600 + 900 * (l.length - 1));
  }
  // yalnız Çalış görünürken: açılışta gizli bir zeige() tur hakkı / soru yemez
  function zeige() {
    if (!calisAcik()) return;
    clearTimers();
    renderHedef();
    renderPlan();
    themaUI();
    document.body.classList.toggle('genis', session.modus === 'kalip');
    if (session.modus === 'yazma') { yazmaRender(); return; }
    if (session.modus === 'lesen') { lesenRender(); return; }
    if (session.modus === 'fiilmetin') { fiilMetinRender(); return; }
    if (session.modus === 'unite') { uniteRender(); return; }
    if (session.modus === 'kalip') { kalipRender(); return; }
    if (session.modus === 'artoyun') { artOyunRender(); return; }
    if (session.modus === 'sprechen') { sprechenRender(); return; }
    if (session.modus === 'gram') { aktuell = { typ: 'gram' }; Gramer.yenile(); Gramer.render(); tastatur(); return; }
    if (session.modus === 'pruefung') { aktuell = { typ: 'pruefung' }; Pruefung.yenile(); Pruefung.render(); return; }
    const m = session.modus;
    if (!session.tur || session.tur.bitti) { turBaslat(); session.tur.mod = m; }
    if (turBitti()) { turSonuRender(); return; }
    hinweisRender();
    $('#durum-satiri').innerHTML = '';
    if (m === 'paket') {
      const p = paketSec();
      if (p) { aktuell = p; render(p); return; }
      return leerGoster(null);
    }
    const ot = session.ot;
    // partinin sıradaki tanıtım / yoklama kartı
    if (ot.tanitSira && ot.tanitSira.length) { tanitGoster(); return; }
    // tanıtımda "Biliyorum, sonra sor" denen öğe: sırası geldiyse tanıtımsız yoklama
    if (ot.yoklamaErt && ot.yoklamaErt.length) {
      const i = ot.yoklamaErt.findIndex(x => x.at <= (ot.adim || 0));
      if (i >= 0) {
        const x = ot.yoklamaErt.splice(i, 1)[0];
        if (!(S.items[x.id] && S.items[x.id].tanit)) { ot.partiIds = []; aktuell = Object.assign(frageYoklama(x.id, 'tanit'), { start: now() }); render(aktuell); return; }
      }
    }
    // yeniden tanıtılan öğenin bekleyen sorusu
    if (ot.bekleyen) { const s = ot.bekleyen; ot.bekleyen = null; const q = frage(s); if (q) { aktuell = q; render(q); return; } }
    for (let i = 0; i < 5; i++) {
      const sel = sec();
      if (sel.tur === 'parti') { partiKur(sel); tanitGoster(); return; }
      if (sel.tur === 'metin') { ot.metin = true; const q = metinKur(sel); if (q) { aktuell = q; render(q); return; } continue; }
      if (sel.tur === 'bitti') return leerGoster(sel);
      // uzun süredir görülmeyen (R < 0,35): önce kısa yeniden tanıtım
      if (sel.yenidenTanit && sel.tur === 'm') { ot.bekleyen = sel; aktuell = frageTanit(sel.id, { kisa: true }); render(aktuell); return; }
      const q = frage(sel);
      if (q) { aktuell = q; render(q); return; }
      // bu öğeden soru üretilemedi: aralık kuralıyla bu turda yeniden seçilmesin
      (ot.gecmis = ot.gecmis || []).push({ id: sel.id, bicim: sel.bicim, tur: sel.tur });
    }
    leerGoster({ tur: 'bitti' });
  }
  // sırada soru yok: turda cevap varsa tur sonu ("şimdilik bu kadar" + günde bir "+3 yeni"), yoksa boş ekran
  function leerGoster(sel) {
    const m = session.modus, gs = gs4(), teklif = sel && sel.teklif && m === 'akis' ? sel.teklif : null;
    if (teklif) gs.ekYeniTeklif = true;
    if (session.tur && session.tur.n > 0) { turSonuRender('leer', teklif); return; }
    aktuell = { typ: 'leer', teklif };
    let msg;
    if (m === 'zayif' && Object.keys(S.items).some(id => FILTER.zayif(id) && gueltig(id + ':x'))) msg = `<div class="buyuk">Zayıf kelimelerin şimdi dinleniyor</div><div class="soluk">Hepsini az önce sordum; aralıklı tekrar için biraz sonra yeniden gel. Sıradaki tekrar: ${naechsteFaelligkeit()}.</div><div class="sira"><button class="btn ana" data-modus="akis" type="button">Turuna dön</button></div>`;
    else if (m === 'zayif') msg = `<div class="buyuk">Zayıf kelimen yok</div><div class="soluk">Yanlış yaptığın kelimeler burada toplanır ve yeni cümlelerle tekrar edilir.</div><div class="sira"><button class="btn ana" data-modus="akis" type="button">Turuna dön</button></div>`;
    else if (m === 'paket') msg = `<div class="buyuk">Şu an paket tekrarı yok.</div><div class="soluk">${PAKETE.some(p => !S.pakete[p.id]) ? 'Yeni paket yarın açılır.' : 'Claude\'a "yeni paket yaz" de; zayıf kelimelerinden yeni sahneler yazar.'} Sıradaki: ${naechsteFaelligkeit()}.</div><div class="sira"><button class="btn" data-git="ana" type="button">Ana sayfa</button></div>`;
    else msg = `<div class="buyuk">${esc(MODI[m].ad)}: şimdilik bu kadar</div>
        <div class="soluk">Bu bölümde şu an sırası gelen kelime yok. Sıradaki tekrar: ${naechsteFaelligkeit()}.</div>
        <div class="sira">${teklif ? '<button class="btn ana" data-act="ek-yeni" type="button">+3 yeni kelime <kbd>Enter</kbd></button>' : ''}<button class="btn" data-git="ana" type="button">Ana sayfa</button></div>`;
    kart.innerHTML = `<div class="bos">${msg}</div>`;
    tastatur();
  }
  // +3 yeni (günde bir kez): kotayı aşabilir
  function ekYeniAl() { const gs = gs4(); gs.ekYeni = (gs.ekYeni || 0) + 3; save(); const b = session.tur && session.tur.boyu; turBaslat(); session.tur.mod = session.modus; if (b) session.tur.boyu = b; zeige(); }

  // ---------- yeni parti: tanıtım kartları art arda, sonra mini sorular (Kern.partiBasladi) ----------
  function partiKur(sel) {
    const ot = session.ot, gs = gs4(), yk = new Set(sel.yoklama || []);
    ot.tanitSira = sel.ids.map(id => ({ id, yoklama: yk.has(id) }));
    ot.partiIds = [];
    ot.yoklama = (ot.yoklama || 0) + yk.size; gs.yoklama = (gs.yoklama || 0) + yk.size;
    ot.parti = true;
  }
  function tanitGoster() {
    const ot = session.ot, x = ot.tanitSira[0];
    aktuell = x.yoklama ? Object.assign(frageYoklama(x.id, 'parti'), { start: now() }) : frageTanit(x.id, { kisa: !!(S.items[x.id] && S.items[x.id].yarim && S.items[x.id].seit && !S.items[x.id].tanit) });
    render(aktuell);
  }
  // tanıtım bitti: öğe kaydı (kotaya sayılır; yarım öğe sayılmaz), 'yeni;neu' satırı; parti bittiyse mini sorular kuyruğa
  function tanitDevam() {
    const q = aktuell; if (!q || q.typ !== 'tanit') return;
    const ot = session.ot, t = now(), id = q.id, g = Kern.gun4(t);
    if (q.kisa && !(ot.tanitSira && ot.tanitSira.length && ot.tanitSira[0].id === id)) { zeige(); return; }   // yeniden tanıtım: bekleyen soru
    const it = S.items[id], yarim = !!(it && it.yarim && !it.tanit);
    const yeni = S.items[id] = Object.assign(it || { seit: t, quelle: session.modus }, { tanit: t, yarim: 1 });
    if (yarim) yeni.yarimGun = g; else yeni.yeni4 = g;
    if (session.tur) session.tur.neu.push(id);
    const d = heute(); if (kind(id) === 'v') d.neuV = (d.neuV || 0) + 1; else d.neuN = (d.neuN || 0) + 1;
    heuteM(session.modus).neu++;
    logEintrag({ modus: 'yeni', id, item: label(id), frage: 'tanıtım', antwort: '', ergebnis: 'neu', loesung: trOf(id), notiz: `basamak:B0 | bicim:tanit | not:- | parti${yarim ? ' | yarım' : ''}${q.yoklamaDan ? ' | yoklama' : ''} | sek:${Math.round((t - q.start) / 1000)}` });
    ot.partiIds.push(id);
    partiIlerle();
  }
  function partiIlerle(sessiz) {
    const ot = session.ot;
    ot.tanitSira.shift();
    if (!ot.tanitSira.length) Kern.partiBasladi(ot, ot.partiIds || [], Math.random);
    save();
    if (!sessiz) zeige();
  }
  // "Biliyorum, sonra sor": kelime ekranda göründüğü için yoklama hemen açılmaz (gördüğünü yazmak bilmek değil);
  // tanıtım kaydedilmez, öğe partiden çıkar ve YOKLAMA_ARA soru sonra tanıtımsız sorulur. Yanlışsa tanıtım o zaman gelir.
  // Tur o kadar sürmezse öğe yeni kalır (sonraki partide yeniden gelir).
  const YOKLAMA_ARA = 8;
  function tanitSor() {
    const q = aktuell; if (!q || q.typ !== 'tanit' || q.kisa) return;
    const ot = session.ot;
    if (!ot || !ot.tanitSira || !ot.tanitSira.length || ot.tanitSira[0].id !== q.id) return;
    (ot.yoklamaErt = ot.yoklamaErt || []).push({ id: q.id, at: (ot.adim || 0) + YOKLAMA_ARA });
    session.notCip = 'tamam, birazdan soracağım';
    partiIlerle();
  }

  // ---------- metin etkinliği (turda bir): gerçek paragrafta 2–4 boşluk ya da günde bir dikte ----------
  function metinKur(sel) {
    const gs = gs4(), kalan = buTurBoyu() - (session.tur ? session.tur.n : 0);
    if (sel.diktat) { const a = aktSatz('diktat'); if (a) { gs.diktat = 1; gs.metin = (gs.metin || 0) + 1; return aktFrage(a); } }
    const a = aktLuecke(sel.adaylar || [], Math.max(2, Math.min(4, kalan)));
    if (!a) return null;
    gs.metin = (gs.metin || 0) + 1;
    return aktFrage(a);
  }

  // odak ekranı: üst %45 talimat + kelime / cümle + seviye noktaları (.q-ust), alt %55 cevap alanı (.q-alt, başparmak bölgesi);
  // sonuç paneli cevap alanının yerine açılır (#sonuc). Bilmiyorum / Göster hep alt satırın solunda.
  const UMLAUT_IC = `<div class="klavye ic" aria-label="Özel harfler">${['ä', 'ö', 'ü', 'ß'].map(c => `<button type="button" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;
  function render(q) {
    kart.classList.remove('fx-dogru', 'fx-fast', 'fx-yanlis', 'cevaplandi', 'duzen');
    otRender();
    if (q.typ === 'akt') { aktRender(q); return; }
    const info = [];
    const s = q.sel || {};
    if (session.notCip) { info.push(`<span class="chip vurgu">${esc(session.notCip)}</span>`); session.notCip = null; }
    if (s.neden === 'ikinci') info.push('<span class="chip vurgu">bugün öğrendin: hatırla</span>');
    else if (s.neden === 'mini') info.push('<span class="chip vurgu">az önce tanıştın</span>');
    else if (s.neden === 'yanlis') info.push('<span class="chip">tekrar: az önce yanlış</span>');
    // seviye atlama anı (önceki cevaptan): çip + ayrı ses
    if (session.seviyeCip && session.seviyeCip.length) {
      session.seviyeCip.forEach(x => info.push(`<span class="chip seviye-cip">${deItemHTML(x.id)} → ${SEVIYE_AD[x.sv]}</span>`));
      session.seviyeCip = []; ton('seviye');
    }
    // öğenin adı burada gösterilmez: TR→DE sorularında cevabı ele verir
    $('#durum-satiri').innerHTML = info.join(' ');
    if (q.typ === 'paket') { paketRender(q); return; }
    if (q.typ === 'tanit') { kart.classList.add('duzen'); kart.innerHTML = q.html; tastatur(); tanitSes(q); return; }
    let alt = '';
    if (q.mc) {
      alt = `<div class="dolum-cizgi" id="mc-dolum" aria-hidden="true"><span style="animation-duration:${DENKZEIT}ms"></span></div>
        <div class="mc kapali" id="mc">${q.optionen.map((o, i) => `<button class="mc-opt" data-mc="${i}" type="button"><kbd>${i + 1}</kbd> ${esc(o.t)}</button>`).join('')}</div>
        <div class="alt-sira"><button class="btn mini bilmiyorum" type="button" data-act="mc-weiss-nicht">Bilmiyorum <kbd>0</kbd></button><span class="mc-ipucu" id="mc-ipucu">önce aklından söyle · dokun: şıklar <kbd>Boşluk</kbd></span></div>`;
    } else if (q.artFrage) {
      alt = `<div class="art-sec">${['der', 'die', 'das'].map((a, i) => `<button class="btn art-btn art-${a}" data-art="${a}" type="button"><span><span class="sekil" aria-hidden="true"></span>${a}</span><kbd>${i + 1}</kbd></button>`).join('')}</div>`;
    } else if (q.input) {
      alt = `<form class="cevap-form" id="cevap-form" autocomplete="off"><div class="yaz-kutu"><input id="cevap" type="text" enterkeyhint="go" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${esc(q.placeholder || '')}" aria-label="Cevap">${UMLAUT_IC}</div>
        <div class="alt-sira">${q.yoklama ? '<button class="btn mini bilmiyorum" type="button" data-act="goster">Göster</button>' : '<button class="btn mini bilmiyorum" type="button" data-act="weiss-nicht">Bilmiyorum</button>'}<button class="btn ana" type="submit">Kontrol <kbd>Enter</kbd></button></div></form>`;
    }
    kart.classList.add('duzen');
    kart.innerHTML = `<div class="q-ust">${q.html}${seviyeNokta(q.id)}</div><div class="q-alt" id="q-alt">${alt}</div><div id="sonuc" class="sonuc-yer"></div>`;
    tastatur();
    if (q.mc) later(() => mcAufdecken(q), DENKZEIT);
    if (q.artFrage) q.freiAb = now() + 400;
    const inp = $('#cevap');
    if (inp) inp.focus();
  }
  // sonuç paneli: cevap alanının yerine; Devam görünür alanın altında kalsın (uzun panelde sayfa sona kayar)
  function panelGoster(html) {
    const alt = $('#q-alt'); if (alt) alt.hidden = true;
    $('#sonuc').innerHTML = html;
    kart.classList.add('cevaplandi');
    if (document.activeElement && document.activeElement.blur && document.activeElement.id !== 'cevap') document.activeElement.blur();
    const b = kart.querySelector('#sonuc .devam-btn');
    if (b) requestAnimationFrame(() => {
      const r = b.getBoundingClientRect(), vh = window.visualViewport ? visualViewport.height : innerHeight;
      if (r.bottom > vh - 4 || r.top < 0) b.scrollIntoView({ block: 'end' });
    });
  }
  // tanıtım: ses ilk dokunuştan sonra kendiliğinden (tarayıcı izni); her dokunuşta yeniden çalmaz
  function tanitSes(q) {
    if (!session.etkilesim || !sesAcik() || q.sesCaldi) return;
    q.sesCaldi = true;
    later(() => { if (aktuell === q) sprich(label(q.id).replace('sich(D)', 'sich')); }, 300);
  }

  // seçili bölümün en yakın vadesi
  function naechsteFaelligkeit() {
    const f = FILTER[session.modus] || FILTER.akis, ds = [];
    if (session.modus === 'paket') Object.values(S.pakete).forEach(p => { if (p.m && p.m.due) ds.push(p.m.due); });
    else Object.entries(S.items).forEach(([id, it]) => { if (!gueltig(id + ':x') || !f(id)) return; if (it.m && it.m.S) ds.push(it.m.due); if (it.art && it.art.S) ds.push(it.art.due); });
    if (!ds.length) return '—';
    const m = Math.min(...ds);
    const d = m - now();
    if (d <= 0) return 'şimdi';
    if (d < 3600000) return `${Math.max(1, Math.round(d / 60000))} dk sonra`;
    if (d < DAY) return `${Math.round(d / 3600000)} saat sonra`;
    return new Date(m).toLocaleDateString('tr-TR');
  }

  // kelime farkı (G.pruefen diff: eq / ins = senin fazlan / del = eksik); yan yana fazla + eksik kelime çifti harf düzeyinde
  function diffHTML(res) {
    const d = res.diff || [], out = [];
    for (let i = 0; i < d.length; i++) {
      const x = d[i], y = d[i + 1];
      if (x.op === 'eq') { out.push(esc(x.t)); continue; }
      if (y && y.op !== 'eq' && y.op !== x.op) {
        const [u, z] = x.op === 'ins' ? [x.t, y.t] : [y.t, x.t];
        if (Kern.lev(u.toLowerCase(), z.toLowerCase()) <= Math.max(2, Math.floor(z.length / 2))) { out.push(harfFark(u, z)); i++; continue; }
      }
      out.push(x.op === 'ins' ? `<span class="h-fazla">${esc(x.t)}</span>` : `<span class="h-eksik">${esc(x.t)}</span>`);
    }
    return out.join(' ');
  }

  // ---------- seçmeli ----------
  // şıklar 1,2 sn düşünme süresinden sonra açılır (yer baştan ayrılmış: kayma yok); karta dokunmak / Boşluk hemen açar
  function mcAufdecken(q) {
    if (aktuell !== q || q.done || q.offen) return;
    q.offen = true; q.revealAt = now();
    const mc = $('#mc'), d = $('#mc-dolum'), ip = $('#mc-ipucu');
    if (mc) mc.classList.remove('kapali');
    if (d) d.classList.add('bitti');
    if (ip) ip.textContent = '';
  }
  // seçmeli cevap → sonuc (notu sistem verir): doğru · yanlış artikelli şık (kelime ✓ artikel ✗) · edat tuzağı · yanlış · bilmiyorum
  function mcWahl(i, weissNicht) {
    const q = aktuell;
    if (!q || !q.mc || q.done) return;
    if (!weissNicht && !q.offen) return;
    q.done = true;
    clearTimers();
    const t = now();
    const opt = weissNicht ? null : q.optionen[i];
    const ok = !!(opt && opt.ok);
    const rt = q.revealAt ? t - q.revealAt : 99999;
    q.sek = Math.round((t - q.start) / 1000);
    q.antwort = weissNicht ? '' : opt.t;
    // yanlış artikelli şık: kelime ✓ artikel ✗ (m3 / a1, fast); başka isim seçildiyse artikel güncellenmez
    const tuzakArt = !!(opt && opt.tuzak === 'artikel');
    const art = q.artikelli && (ok || tuzakArt) ? { sinandi: true, dogru: ok, verilen: tuzakArt ? opt.verilen : byId[q.id].art, dogrusu: byId[q.id].art } : null;
    const tip = weissNicht ? 'bilmiyorum' : ok || tuzakArt ? 'dogru' : opt.tuzak === 'edat' ? 'edat' : 'yanlis';
    const sonuc = { bicim: q.bicim, tip, sure: weissNicht ? null : rt, artikel: art, etiketler: [] };
    const not = Kern.notVer(sonuc);
    q.sonuc = sonuc; q.not = not;
    const urteil = not.ergebnis || (ok ? 'richtig' : 'falsch');
    dikkatNotieren(urteil !== 'falsch', not.m == null && not.a == null);
    fxCevap(urteil);
    if (urteil === 'richtig') { panelGoster(sonucPanel(q, not, { kisa: true })); later(ilerle, OTO_MS); return; }
    panelGoster(sonucPanel(q, not, { weissNicht, secilen: weissNicht ? null : opt.t }));
  }
  const OTO_MS = 1000;   // doğru cevaptan sonra kendiliğinden geçiş (0,8–1,2 sn)

  // artikel flaşı: ≤ 8 sn doğru → 3; daha yavaş → 3 (+0,7); yanlış → 1
  function artWahl(a) {
    const q = aktuell;
    if (!q || !q.artFrage || q.done || now() < (q.freiAb || 0)) return;
    q.done = true;
    clearTimers();
    const n = byId[q.id], rt = now() - q.start, ok = a === n.art;
    q.antwort = a; q.sek = Math.round(rt / 1000);
    const sonuc = { bicim: 'artikel', tip: 'flas', dogru: ok, sure: rt, etiketler: ok ? [] : [`artikel ${a} → ${n.art}`] };
    if (rt < 450) sonuc.etiketler.push('çok hızlı');
    q.sonuc = sonuc; q.not = Kern.notVer(sonuc);
    dikkatNotieren(ok, rt < 450);
    fxCevap(ok ? 'richtig' : 'falsch');
    panelGoster(sonucPanel(q, q.not, ok ? { oto: /istisna/.test(regelHTML(n)) ? 1200 : 900 } : { secilen: a }));
    if (ok) later(ilerle, /istisna/.test(regelHTML(n)) ? 1200 : 900);
  }

  // yazılı cevabın türü (cümle / boşluk): G.pruefen sonucundan; tam cümlede hedef kelime varsa hata başka yerde (m3, fast)
  function tipAus(r, q) {
    if (r.tip) return r.tip;
    if (r.urteil === 'richtig') return 'dogru';
    if (q.voll) {
      const hedef = q.hedefForm ? q.hedefForm.toLowerCase().split(' ') : [];
      const u = ' ' + G.norm(q.antwort || '').toLowerCase().replace(/[.,!?;:]/g, ' ') + ' ';
      return hedef.length && hedef.every(w => u.includes(' ' + w + ' ')) ? 'cumleFast' : 'cumleYanlis';
    }
    if (r.urteil === 'fast') return r.tags.includes('umlaut/ß') ? 'umlaut' : 'yazim';
    if (r.tags.some(x => x === 'artikel/çekim' || x === 'yardımcı fiil' || x === 'çekim')) return 'cekim';
    return 'yanlis';
  }
  // ---------- yazarak ----------
  function auswerten(input, weissNicht) {
    const q = aktuell;
    if (!q || q.done) return;
    // anlamdaşı yazdıysa: yanlış sayma, tekrar sor (önce kendi cevabı: doğruysa anlamdaş kontrolüne hiç girme)
    const syn = !weissNicht && q.syn && q.pruef(input).urteil !== 'richtig' && q.syn(input);
    if (syn) {
      $('#sonuc').innerHTML = `<div class="sonuc fast"><div class="baslik">≈ ${esc(syn)} da bu anlama geliyor, ama aranan başka bir kelime. Tekrar dene.</div></div>`;
      const i = $('#cevap'); i.value = ''; i.focus();
      return;
    }
    // boş / rastgele: bilmiyorum gibi
    if (!weissNicht && istMuell(input)) { weissNicht = true; q.bos = true; }
    q.done = true;
    q.antwort = input;
    q.sek = Math.round((now() - q.start) / 1000);
    const res = weissNicht ? { urteil: 'falsch', tags: [], diff: [], ziel: q.ziel, tip: q.bos ? 'bos' : 'bilmiyorum' } : q.pruef(input);
    if (res.tags) res.tags = res.tags.map(t => t !== 'artikel/çekim' ? t : kind(q.id) === 'v' ? 'çekim' : kind(q.id) === 'n' ? 'artikel / ek' : 'ek');
    q.res = res;
    let tip = weissNicht ? res.tip : tipAus(res, q);
    // yoklama: kelime biliniyorsa (yazım / umlaut / hâl dahil) "zaten biliyorsun"; değilse tanıtım
    if (q.yoklama) tip = ['dogru', 'yazim', 'umlaut', 'hal', 'mastar'].includes(tip) ? 'yoklama' : weissNicht ? tip : 'yanlis';
    const sonuc = { bicim: q.bicim, tip, artikel: res.artikel || null, etiketler: (res.tags || []).filter(x => !/^bilgi/.test(x) && !['yazım', 'umlaut', 'umlaut/ß'].includes(x)), yanlis: res.yanlis, kokYanlis: res.kokYanlis };
    q.sonuc = sonuc; q.not = Kern.notVer(sonuc);
    // tek itiraz: yanlışta hedefe uzaklık ≤ 2 → "yazım hatasıydı"; tam cümlede fast → "aslında doğru"
    const urteil = q.not.ergebnis || 'falsch';
    if (!weissNicht && !q.yoklama && urteil === 'falsch' && sonuc.tip !== 'stamm' && Kern.lev(G.norm(input), G.norm(String(q.ziel || ''))) <= 2) q.itirazVar = 'yazim';
    else if (!weissNicht && urteil === 'fast' && sonuc.tip === 'cumleFast') q.itirazVar = 'dogru';
    const input$ = $('#cevap'); if (input$) { input$.readOnly = true; input$.blur(); }
    const oto = urteil === 'richtig' ? ((q.erkl && q.erkl().filter(Boolean).length) ? 1200 : 900) : 0;
    panelGoster(sonucPanel(q, q.not, { weissNicht, yazili: true, oto }));
    fxCevap(urteil);
    if (oto) later(ilerle, oto);
  }
  // örnek cümle + Türkçesi; bilinmeyen kelimeler glossen'den (hilfeHTML)
  function ornekHTML(id) {
    const c = tanitCumle(id); if (!c) return '';
    return `<div class="ornek-cumle"><div>${deHTML(c.de)} ${sesBtn(c.de)}</div>${c.tr ? `<div class="soluk">${esc(c.tr)}</div>` : ''}${hilfeHTML(c.de, id)}</div>`;
  }
  // sonuç paneli: başlık + iki parçalı not (kelime ✓ · artikel ✗, turuncu) + harf farkı + doğrusu + kural + Türkçe hâl karşılaştırması
  // + açıklama + örnek cümle + kanca + tek itiraz + Devam (doğruda dolum, yanlışta bekler)
  function sonucPanel(q, not, o) {
    o = o || {};
    const urteil = not.ergebnis || (q.sonuc && q.sonuc.tip === 'dogru' ? 'richtig' : 'falsch');
    const etiket = (not.etiketler || []).filter(x => x !== 'sayılmadı');
    const artYanlis = !!(q.sonuc && q.sonuc.artikel && q.sonuc.artikel.sinandi && !q.sonuc.artikel.dogru && not.m >= 3);
    const titel = artYanlis ? 'kelime ✓ · artikel ✗' : { richtig: '✓ Doğru', fast: '≈ Küçük hata', falsch: o.weissNicht ? '✗ Bilmiyorum' : '✗ Yanlış' }[urteil];
    if (o.kisa) return `<div class="sonuc richtig"><div class="baslik">${titel}</div>${devamBtn('act', 'devam', OTO_MS)}</div>`;
    const k = q.id ? kind(q.id) : null;
    const yanlis = urteil !== 'richtig';
    const halStr = k === 'v' && vById[q.id] ? hallerTR(vById[q.id]) : '';
    const ornek = yanlis && q.id && k !== 'p' && !q.voll ? ornekHTML(q.id) : '';
    const erkl = (q.erkl ? q.erkl() : []).filter(Boolean).filter(e => !/class="kural/.test(e) && !(halStr && e === halStr) && !(ornek && /^Örnek:/.test(e))).slice(0, 3);
    const itiraz = q.itirazVar && !q.itiraz ? `<button class="btn mini itiraz" data-act="itiraz" type="button">${q.itirazVar === 'yazim' ? 'yazım hatasıydı' : 'aslında doğru'}</button>` : '';
    // isim: kural (sonek / bileşik) ya da "kural yok: kanca" — artikel sınandıysa ya da yanlışsa
    const kural = k === 'n' && byId[q.id] && (yanlis || q.artFrage || artYanlis) ? (regelHTML(byId[q.id]) || `<div class="kural">Kural yok: artikeli kelimeyle ezberle${KANCA[q.id] ? ' · kanca aşağıda' : ''}.</div>`) : '';
    const hal = yanlis && halStr ? `<div class="hal-karsi">Türkçe hâlle: ${halStr}</div>` : '';
    let senin = '';
    if (yanlis && o.yazili) senin = `<div class="satir"><span class="et">senin</span><span class="deger fark">${o.weissNicht ? '<span class="soluk">—</span>' : diffHTML(q.res || {})}</span></div>`;
    else if (yanlis && o.secilen) senin = `<div class="satir"><span class="et">senin</span><span class="deger fark"><span class="h-fazla">${esc(o.secilen)}</span></span></div>`;
    return `<div class="sonuc ${urteil}${artYanlis ? ' art-hata' : ''}">
      <div class="baslik">${titel}${etiket.length ? `<span class="etiketler">${etiket.map(t => `<span class="etiket">${esc(t)}</span>`).join('')}</span>` : ''}</div>
      ${senin}
      ${yanlis || q.artFrage ? `<div class="satir"><span class="et">doğru</span><span class="deger">${q.loesungHTML()}</span></div>` : ''}
      ${kural}${hal}
      ${erkl.length && (yanlis || o.yazili) ? `<ul class="erkl">${erkl.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      ${ornek}
      ${yanlis ? kancaHTML(q.id) : ''}
      <div class="notlar">${itiraz}${devamBtn('act', 'devam', urteil === 'richtig' ? (o.oto || OTO_MS) : 0)}</div>
    </div>`;
  }
  // itiraz (soru başına bir kez): sistemin ilk kararı log'da 'öneri:' alanında kalır
  function itirazEt() {
    const q = aktuell; if (!q || !q.done || q.islendi || !q.itirazVar || q.itiraz) return;
    q.itiraz = true;
    q.oneri = q.not.ergebnis;
    // itirazla tanı değişti: "kelime yanlış" / "farklı" gibi yanlış tanısı etiketleri kalmaz (panelde ve log'da çelişmesin)
    const YANLIS_ET = ['kelime yanlış', 'farklı', 'eksik kelime'];
    q.sonuc = Object.assign({}, q.sonuc, { tip: q.itirazVar === 'yazim' ? 'yazim' : 'dogru', etiketler: (q.sonuc.etiketler || []).filter(x => !YANLIS_ET.includes(x)) });
    if (q.itirazVar === 'yazim' && q.sonuc.artikel && q.sonuc.artikel.sinandi && !q.sonuc.artikel.dogru && q.res && q.res.tip === 'yanlis') q.sonuc.artikel = null;
    q.not = Kern.notVer(q.sonuc);
    panelGoster(sonucPanel(q, q.not, { yazili: true }));
    fxCevap(q.not.ergebnis);
    // 'aslında doğru' → richtig: panelin Devam düğmesi dolum animasyonuyla çizilir, gerçekten de geçsin
    if (q.not.ergebnis === 'richtig') later(ilerle, OTO_MS);
  }
  // Devam / kendiliğinden geçiş: cevap işlenir (tek kez), sonraki soru
  function ilerle() {
    const q = aktuell;
    if (!q || !q.done) return;
    // arka planda (uygulama gizlenince) işlenmiş cevap: Devam yalnız sonraki karta geçer
    if (q.islendi) { if (q.arkaPlan) { q.arkaPlan = false; zeige(); } return; }
    cevapIsle(q, q.sonuc);
  }

  // bugünün sayaçları (çok hızlı / boş cevaplar hedefe sayılmaz)
  function zaehlen(q, urteil) {
    const d = heute(), dm = heuteM(session.modus);
    if (q.ungezaehlt) { d.ungezaehlt = (d.ungezaehlt || 0) + 1; dm.ungezaehlt = (dm.ungezaehlt || 0) + 1; tageTuret(tag()); return; }
    d.n++; d[urteil] = (d[urteil] || 0) + 1;
    dm.n++; dm[urteil] = (dm[urteil] || 0) + 1;
    // tur, puan, seri
    if (session.tur && !session.tur.bitti) { session.tur.n++; session.tur[urteil] = (session.tur[urteil] || 0) + 1; }
    xpEkle(xpFuer(q, urteil));
    gunSayac(tageTuret(tag()));
    otRender();
  }

  // ---------- hafıza yazımı (her cevap): Kern.notVer → Kern.uygula (günde tek kalıcı yazım) → gölge kart → log ----------
  // yan: yan kural (metin / paket / oyun / fiil metni): hafıza yalnız vadeliyse ya da R < 0,9 ise
  const f2 = x => (x == null || !isFinite(x) ? '-' : (+x).toFixed(2)), f1 = x => (x == null || !isFinite(x) ? '-' : (+x).toFixed(1));
  function hafizaYaz(q, sonuc, t, opt) {
    opt = opt || {};
    const id = q.id, sel = q.sel || {}, bicim = sonuc.bicim || q.bicim;
    let not = Kern.notVer(sonuc);
    if (sel.neden === 'ikinci' && !opt.zorla) not = Object.assign({}, not, { m: null, a: null, k: null });   // ikinci hatırlama yazılmaz
    if (q.yoklama && not.ergebnis === 'falsch') not = Object.assign({}, not, { m: null, a: null, k: null });   // bilinmeyen: tanıtım + mini kurar
    const it0 = S.items[id], vk = kind(id) === 'v' ? (S.kok || {})[(vById[id] || {}).base] : null;
    const anaH = bicim === 'artikel' ? it0 && it0.art : (bicim === 'kok' || bicim === 'kokSatz' || bicim === 'kokSec') ? vk : it0 && it0.m;
    let yazilabilir = not.m != null || not.a != null || not.k != null;
    if (yazilabilir && opt.yan) {
      const h = anaH;
      if (!(h && h.S) || !(h.due <= t || Kern.R(h, t) < 0.9)) yazilabilir = false;
    }
    let out = { yazildi: false };
    if (yazilabilir) out = Kern.uygula(S, id, not, t, { b: sel.b, ipucu: (q.ipucu || 0) > 0 });
    const it = S.items[id];
    const uretec = q.typ === 'ndek' || q.typ === 'refl' ? q.typ : null;
    const golge = (tur, h, x) => { if (x && x.yazildi && h) Kern.golge(S, id, tur, h, t); };
    if (it) { golge(Kern.eskiTur(id, bicim === 'yoklama' ? 'yaz' : bicim, uretec), it.m, out.m); golge('art', it.art, out.a); }
    if (out.k) golge('stamm', S.kok[vById[id].base], out.k);
    // log satırı (§9): modus / id eşlemesi, zorunlu notiz başı
    const eski = bicim === 'artikel' ? 'art' : (bicim === 'kok' || bicim === 'kokSatz' || bicim === 'kokSec') ? 'stamm' : Kern.eskiTur(id, bicim === 'yoklama' ? 'yaz' : bicim, uretec) || q.typ;
    const modus = bicim === 'metin' || q.modus === 'luecke' ? 'luecke' : eski;
    const ergebnis = not.ergebnis || (sonuc.tip === 'dogru' ? 'richtig' : 'falsch');
    const parca = [], yaz = x => x && x.yazildi;
    if (yaz(out.m)) parca.push('m' + not.m); if (yaz(out.a)) parca.push('a' + not.a); if (yaz(out.k)) parca.push('k' + not.k);
    const ana = bicim === 'artikel' ? out.a : eski === 'stamm' ? out.k : out.m;
    const R0 = ana ? ana.R : anaH && anaH.S ? Kern.R(anaH, t) : null, S1 = ana ? ana.S : anaH && anaH.S ? anaH.S : null;
    const n = [`basamak:${bicim === 'artikel' ? 'A' : eski === 'stamm' ? 'K' : 'B' + (sel.b || q.b || 1)}`, `bicim:${bicim}`, `not:${parca.length ? parca.join(',') : '-'}`, `R:${f2(R0)}`, `S:${f1(S1)}`];
    if (sel.neden === 'yanlis') n.push(`tekrar:${(sel.deneme || 2) - 1}`);
    if (sel.neden === 'ikinci') n.push('ikinci');
    if (sel.neden === 'mini') n.push('parti');
    if (!parca.length && (not.m != null || not.a != null || not.k != null || sel.neden === 'ikinci')) n.push('hafıza:yazılmadı');
    if (bicim === 'yoklama') n.push('yoklama');
    if (sel.kaynak === 'kurtarma') n.push('kurtarma');
    if (sel.kaynak === 'isinma') n.push('ısınma');
    if (['yazim', 'mastar'].includes(sonuc.tip) || (not.etiketler || []).includes('yavaş')) n.push('kısmi');
    if (yaz(out.m) && it && it.m && it.m.lastG >= 2) { const pk0 = it.m.pk || 0, ham = FSRS.intervalDays(it.m.S, S.einst.ret); if (pk0 < 2 && ham > (pk0 ? 14 : 7) && (it.m.due - t) / DAY <= (pk0 ? 14 : 7) + 0.01) n.push(`kapı:${pk0 ? 14 : 7}g`); }
    if (opt.kaynak) n.push('kaynak:' + opt.kaynak);
    if (eski === 'stamm') n.push('kök:' + (vById[id] || {}).base);
    const et = (not.etiketler || []).filter(x => !['yoklama', 'yavaş', 'sayılmadı', 'bilmiyorum'].includes(x));
    if (et.length) n.push(et.join(', '));
    if (q.sek != null) n.push(`sek:${q.sek}`);
    if (q.ipucuLv != null) n.push(`ipucu:${q.ipucuLv}`);
    if (q.oneri) n.push(`öneri:${q.oneri}`);
    if ((not.etiketler || []).includes('sayılmadı')) n.push('sayılmadı');
    if ((not.etiketler || []).includes('yavaş')) n.push('yavaş');
    if ((not.etiketler || []).includes('bilmiyorum')) n.push('bilmiyorum');
    if (opt.log !== false) logEintrag({ modus, id: id + ':' + (modus === 'luecke' ? (kind(id) === 'v' ? 'satz' : 'nsatz') : eski), item: label(id), frage: q.frageText || '', antwort: q.antwort || '', ergebnis, loesung: q.ziel || '', notiz: n.join(' | ') });
    return { not, out, ergebnis, kopf: n.slice(0, 5).join(' | ') + (n.includes('hafıza:yazılmadı') ? ' | hafıza:yazılmadı' : ''), sayilmadi: (not.etiketler || []).includes('sayılmadı') };
  }

  // cevap işlendi: hafıza + gölge + log, sayaçlar (tur, gün, puan, seri), oturum kuyruğu (yanlış → 3–5 soru sonra), takılan kelime
  function cevapIsle(q, sonuc, sessiz) {
    if (!q || q.islendi) return;
    q.islendi = true;
    clearTimers();
    const t = now(), id = q.id, ot = session.ot;
    const r = hafizaYaz(q, sonuc, t);
    const tu = session.tur;
    q.ungezaehlt = r.sayilmadi;
    zaehlen(q, r.ergebnis);
    session.q++;
    if (!q.mc && !q.artFrage) dikkatNotieren(r.ergebnis !== 'falsch', q.bos);
    if (!r.sayilmadi) turKelime(id, r.ergebnis === 'richtig' ? 3 : r.ergebnis === 'fast' ? 2 : 1);
    if (tu) {
      const sel = q.sel || {};
      if (!q.yoklama && sel.neden !== 'mini' && sel.neden !== 'ikinci' && !r.sayilmadi) { tu.tekrar = (tu.tekrar || 0) + 1; if (r.ergebnis !== 'falsch') tu.tekrarOk = (tu.tekrarOk || 0) + (r.ergebnis === 'richtig' ? 1 : 0.5); }
      if (r.out.seviyeSonra > r.out.seviyeOnce && r.out.seviyeOnce > 0) { tu.seviye.push(id); (session.seviyeCip = session.seviyeCip || []).push({ id, sv: r.out.seviyeSonra }); }
    }
    if (q.kontext) { const h = S.kontext[id] || (S.kontext[id] = []); h.push(q.kontext); if (h.length > 12) h.shift(); }
    if (r.ergebnis === 'falsch' && !q.yoklama) leechPruefen(id);
    if (q.yoklama) {
      // yoklama: doğruysa "zaten biliyorsun" (kotaya sayılmaz); yanlışsa tanıtım kartı gelir
      const bildi = r.ergebnis !== 'falsch' && !q.bos;
      if (bildi) {
        logEintrag({ modus: 'yeni', id, item: label(id), frage: 'yoklama', antwort: q.antwort || '', ergebnis: 'bekannt', loesung: trOf(id), notiz: `basamak:B2 | bicim:yoklama | not:${[r.out.m && r.out.m.yazildi ? 'm4' : '', r.out.a && r.out.a.yazildi ? 'a' + r.not.a : ''].filter(Boolean).join(',') || '-'} | yoklama${r.ergebnis === 'fast' ? ' | ' + (r.not.etiketler || []).filter(x => /^artikel/.test(x)).join(', ') : ''}` });
        if (S.items[id]) S.items[id].bekannt = true;
        session.notCip = 'zaten biliyorsun ✓';   // sonraki kartın durum satırında (flash zeige'de hemen gizlenirdi)
        if (ot.tanitSira && ot.tanitSira.length && ot.tanitSira[0].id === id) { partiIlerle(sessiz); return; }
      } else if (ot.tanitSira && ot.tanitSira.length && ot.tanitSira[0].id === id) ot.tanitSira[0] = { id, yoklama: false, yoklamaDan: true };
      else ot.tanitSira = [{ id, yoklama: false, yoklamaDan: true }].concat(ot.tanitSira || []);
      save(); if (!sessiz) zeige(); return;
    }
    if (q.sel && ['m', 'art', 'kok'].includes(q.sel.tur)) {
      Kern.oturumIsle(ot, q.sel, { ergebnis: r.ergebnis }, Math.random);
      if (q.sel.tur === 'kok') { const gs = gs4(); gs.kok = (gs.kok || 0) + 1; if (q.sel.kaynak === 'yeniKok') gs.kokYeni = (gs.kokYeni || 0) + 1; }
    }
    save();
    if (!sessiz) zeige();
  }

  // ================= Log =================
  const CSV_KOPF = 'zeit;modus;id;item;frage;antwort;ergebnis;loesung;notiz';
  const csvZelle = s => { s = String(s == null ? '' : s).replace(/\r?\n/g, ' '); return /[;"]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function zeitStr(t) { const d = new Date(t); return `${tag(t)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`; }
  function logEintrag(e) {
    e.zeit = zeitStr(now());
    S.log.push(e);
    S.pending.push(e);
    if (ghToken()) { (S.ghPending = S.ghPending || []).push(e); if (S.ghPending.length >= 10) ghSync(S.ghPending.length >= 20 || session.q % 30 === 0); }
    save();
    dateiSchreiben();
  }
  const csvZeile = e => [e.zeit, e.modus, e.id, e.item, e.frage, e.antwort, e.ergebnis, e.loesung, e.notiz].map(csvZelle).join(';');

  // ---- Klasör (File System Access API, Chrome/Edge) ----
  let ordner = null, schreibt = false, ordnerWartet = null;
  const idb = (mode, fn) => new Promise((res, rej) => {
    const r = indexedDB.open('almanca-tekrar', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => rej(r.error);
    r.onsuccess = () => { const tx = r.result.transaction('kv', mode); const st = tx.objectStore('kv'); const q = fn(st); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); };
  });
  async function ordnerLaden() {
    if (!window.showDirectoryPicker) { $('#klasor-durum').textContent = 'Bu tarayıcı klasöre yazamıyor. Chrome ya da Edge kullan; ya da log.csv indir.'; return; }
    try {
      const h = await idb('readonly', st => st.get('ordner'));
      if (!h) { $('#klasor-durum').textContent = 'Bağlı klasör yok.'; return; }
      const p = await h.queryPermission({ mode: 'readwrite' });
      if (p === 'granted') { ordner = h; $('#klasor-durum').textContent = `Bağlı: ${h.name}`; dateiSchreiben(); renderPlan(); }
      else { ordnerWartet = h; $('#klasor-durum').textContent = `${h.name}: izin gerekiyor. "Klasörü bağla"ya bas.`; $('#klasor').textContent = 'İzni yenile'; }
    } catch (e) { $('#klasor-durum').textContent = 'Klasör okunamadı.'; }
  }
  async function ordnerVerbinden() {
    try {
      let h = ordnerWartet;
      if (h) { const p = await h.requestPermission({ mode: 'readwrite' }); if (p !== 'granted') return; }
      else h = await window.showDirectoryPicker({ mode: 'readwrite', id: 'almanca-tekrar' });
      ordner = h; ordnerWartet = null;
      await idb('readwrite', st => st.put(h, 'ordner'));
      $('#klasor-durum').textContent = `Bağlı: ${h.name}`;
      $('#klasor').textContent = 'Klasörü değiştir';
      dateiSchreiben(true);
      renderPlan();
    } catch (e) { if (e.name !== 'AbortError') $('#klasor-durum').textContent = 'Bağlanamadı: ' + e.message; }
  }
  async function dateiSchreiben(zustandAuch) {
    if (!ordner || schreibt) return;
    schreibt = true;
    try {
      const dir = await ordner.getDirectoryHandle('log', { create: true });
      if (S.pending.length) {
        const fh = await dir.getFileHandle('log.csv', { create: true });
        const f = await fh.getFile();
        const w = await fh.createWritable({ keepExistingData: true });
        const batch = S.pending.slice();
        let text = batch.map(csvZeile).join('\n') + '\n';
        if (f.size === 0) text = '﻿' + CSV_KOPF + '\n' + text;
        await w.seek(f.size); await w.write(text); await w.close();
        S.pending.splice(0, batch.length);
        save();
      }
      if (zustandAuch || session.q % 10 === 0) {
        const zh = await dir.getFileHandle('zustand.json', { create: true });
        const w2 = await zh.createWritable();
        await w2.write(JSON.stringify(Object.assign({}, S, { log: [], pending: [], gespeichert: zeitStr(now()) })));
        await w2.close();
      }
      schreibt = false;
      if (S.pending.length) setTimeout(dateiSchreiben, 50);
      return;
    } catch (e) { console.warn('log yazılamadı', e); $('#klasor-durum').textContent = 'Yazılamadı: ' + e.message; }
    schreibt = false;
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { try { arkaPlanNotla(); } catch (e) { console.warn(e); } dateiSchreiben(true); ghSync(true); } });

  // ---- GitHub'a doğrudan kayıt (site olarak açıldığında push gerekmez) ----
  const GH = { repo: 'mahmutarsla/Almanca-Tekrar', branch: 'claude/chat-session-1vghmx' };
  const ghToken = () => { try { return localStorage.getItem('almanca-tekrar-gh') || ''; } catch (e) { return ''; } };
  const b64enc = s => btoa(unescape(encodeURIComponent(s)));
  const b64dec = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
  const ghDurum = t => { const el = $('#gh-durum'); if (el) el.textContent = t; };
  async function ghApi(path, opt) {
    // okumalar HTTP önbelleğinden gelmesin (GitHub max-age=60 → eski sha → 409)
    const r = await fetch(`https://api.github.com/repos/${GH.repo}${path}`, Object.assign({ cache: 'no-store' }, opt, {
      headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }));
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 120)}`);
    return r.json();
  }
  async function ghLesen(datei) {
    const m = await ghApi(`/contents/${datei}?ref=${encodeURIComponent(GH.branch)}`);
    if (!m) return { text: null, sha: null };
    // 1 MB üstü dosyalarda içerik gelmez: blob'dan oku
    const b64 = m.content && m.encoding === 'base64' ? m.content : (await ghApi(`/git/blobs/${m.sha}`)).content;
    return { text: b64dec(b64), sha: m.sha };
  }
  async function ghSchreiben(datei, text, sha, msg) {
    return ghApi(`/contents/${datei}`, { method: 'PUT', body: JSON.stringify({ message: msg, content: b64enc(text), branch: GH.branch, sha: sha || undefined }) });
  }
  // Cihazlar arası birleştirme (telefon + bilgisayar): GitHub'daki durumla yerel durum alan alan birleşir (js/kern.js birlestir):
  // hafızalar (m, art, kok, pakete.m) ve kartlar son cevaplanan kazanır, gün sayaçları cihaz başına (G-Counter).
  // Boş bir cihaz (yeni ana ekran uygulaması) böylece uzaktaki ilerlemeyi asla ezemez. Ardından göç + v3Yetis yeniden çalışır.
  function zustandBirlestir(lok, uz) {
    if (!uz || typeof uz !== 'object') return lok;
    return normalize(Kern.birlestir(lok, uz));
  }
  // v5 hafızası: m'si eksik öğe kartlarından kurulur (öğe başına idempotent), eski istemcinin göçten sonraki cevapları uygulanır.
  // İlk göçte bir kez 'akt;goc4' log satırı. Açılışta ve her birleştirmeden sonra.
  function kernAc() {
    // boş cihaz bayrağı, birleştirmeyle eski (v3) kartlar gelince kalkar: göç gerçek veriyle yeniden (rapor + göç kotası)
    // (gölge kartlar, g4 === last, bu cihazın kendi v5 cevaplarıdır: bayrağı kaldırmaz)
    if (S.goc4 && S.goc4.bos && Object.values(S.karten).some(c => c && !(c.g4 && c.g4 === c.last))) delete S.goc4;
    const ilk = !S.goc4;
    const bos = !Object.keys(S.items).length && !Object.keys(S.karten).length;
    if (!bos) {
      const r = Kern.goc(S, now(), S.einst.ret);
      if (ilk && S.goc4) {
        logEintrag({ modus: 'akt', id: 'goc4', item: 'v5 göçü', frage: '', antwort: '', ergebnis: 'gelesen', loesung: '',
          notiz: `öğe:${r.oge} | m:${r.m} | yarım:${r.yarim} | art:${r.art} | kök:${r.kok} | vadeli:${r.vadeli} | ret:${r.ret}` });
      }
    } else {
      // boş durum (yeni cihaz / yeni kullanıcı): taşınacak bir şey yok; bayrak hemen konur (sonradan göç satırı ve göç kotası yok)
      Kern.tageGoc(S); S.surum = Math.max(S.surum || 0, 4);
      if (!S.goc4) S.goc4 = { zaman: now(), rapor: { oge: 0 }, v3Yedek: true, bos: true };
    }
    const n = Kern.v3Yetis(S, now());
    tageTuret();
    return n;
  }
  function uzakBirlestir(uz) {
    S = zustandBirlestir(S, uz);
    kernAc();
    ghUzakZaman = uz.gespeichert || '';
    save();
  }
  let ghUzakZaman = '';  // en son birleştirilen uzak kaydın zamanı
  // "Uygulamayı yenile" çubuğu: yeni SW sürümü devraldıysa ya da GitHub'daki kayıt bu koddan yeni şemadaysa
  function yenileGoster(neden) {
    const c = $('#yenile-cubuk'); if (!c) return;
    if (neden) c.querySelector('span').textContent = neden;
    c.hidden = false;
    try { if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {}); } catch (e) { /* yok */ }
  }
  { const c = $('#yenile-cubuk'); if (c) c.querySelector('button').addEventListener('click', () => { try { cikisNotla(); } catch (e) { /* yok */ } save(); location.reload(); }); }
  // Gece işinin (GitHub Actions'ta Claude) düzeltmeleri: log/feedback.json → Geçmiş'te, index.html yenilenmeden
  const FB_KEY = 'almanca-tekrar-fb';
  let fbUzak = [];
  try { fbUzak = JSON.parse(localStorage.getItem(FB_KEY) || '[]'); } catch (e) { fbUzak = []; }
  const feedbackListe = () => {
    const g = new Set(), out = [];
    (window.FEEDBACK || []).concat(fbUzak).forEach(f => { const k = (f.zeit || '') + '|' + (f.id || ''); if (!g.has(k)) { g.add(k); out.push(f); } });
    return out.sort((a, b) => (a.zeit || '').localeCompare(b.zeit || ''));
  };
  async function fbCek() {
    try {
      const z = await ghLesen('log/feedback.json');
      if (!z.text) return 0;
      const liste = JSON.parse(z.text);
      if (!Array.isArray(liste)) return 0;
      const once = feedbackListe().length;
      fbUzak = liste;
      try { localStorage.setItem(FB_KEY, JSON.stringify(liste)); } catch (e) { /* yer yok */ }
      const yeni = feedbackListe().length - once;
      if (yeni > 0) { session.yeniFeedback = (session.yeniFeedback || 0) + yeni; if (!$('#v-ana').hidden) renderAna(); if (!$('#v-kayit').hidden) renderKayit(); }
      return yeni;
    } catch (e) { return 0; }
  }
  // Uygulamadan Claude'a "bak" demek: gece iş akışını (geribildirim görevi) tetikler; düzeltme birkaç dakika sonra feedback.json'a düşer
  async function claudeGonder() {
    if (!ghToken()) { toast('Önce Ayarlar → GitHub anahtarı.'); return false; }
    await ghSync(true);
    try {
      const r = await fetch(`https://api.github.com/repos/${GH.repo}/actions/workflows/gece.yml/dispatches`, { method: 'POST', cache: 'no-store',
        headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: GH.branch, inputs: { gorev: 'geribildirim' } }) });
      if (r.status === 204) { session.claudeBekliyor = now(); toast('Claude bakıyor: düzeltme birkaç dakika sonra Geçmiş\'e düşer.', 4000); return true; }
      const m = r.status === 404 ? 'iş akışı bulunamadı (repo\'da .github/workflows/gece.yml ve secret kurulu mu?)' : r.status === 403 || r.status === 401 ? 'anahtarın Actions yetkisi yok (fine-grained: Actions → Read and write)' : `${r.status}`;
      toast('Gönderilemedi: ' + m, 5000);
    } catch (e) { toast('Gönderilemedi: ' + e.message, 4000); }
    return false;
  }
  async function ghCek(sessiz) {
    if (!ghToken()) return false;
    fbCek();
    try {
      const z = await ghLesen('log/zustand.json');
      session.senkron = { t: now() };
      if (!z.text) return false;
      const uz = JSON.parse(z.text);
      if (uz.gespeichert && uz.gespeichert === ghUzakZaman) return false;
      const karar = Kern.yazabilir(S, uz, CODE_SURUM);
      if (!karar.birlestir) { if (karar.sebep === 'yeni-sema') yenileGoster('GitHub\'daki ilerleme daha yeni bir sürümle kaydedilmiş.'); return false; }
      const once = Object.keys(S.karten).length;
      uzakBirlestir(uz);
      if (!sessiz) ghDurum(`İlerleme GitHub ile birleştirildi (${uz.gespeichert || ''}).`);
      return Object.keys(S.karten).length >= once;
    } catch (e) { console.warn('çekilemedi', e); return false; }
  }
  // geri dönüş verisi: ilk v4 yazımından önce uzaktaki v3 kaydı (surum yok) bir kez log/zustand_v3.json'a kopyalanır
  async function v3Yedekle(metin, uzSurum) {
    if (!S.goc4 || S.goc4.v3Yedek) return;
    if (metin && !uzSurum) {
      const y = await ghLesen('log/zustand_v3.json');
      if (!y.text) await ghSchreiben('log/zustand_v3.json', metin, null, 'v3 yedeği (v5 göçünden önce)');
    }
    S.goc4.v3Yedek = true;
    save();
  }
  let ghLaeuft = false, ghZuletzt = 0, ghSemaUyari = false, ghBosYerel = false;
  async function ghSync(zustandAuch) {
    if (!ghToken() || ghLaeuft) return;
    const batch = (S.ghPending || []).slice();
    if (!batch.length && !zustandAuch) return;
    ghLaeuft = true; ghSemaUyari = ghBosYerel = false;
    try {
      if (batch.length) {
        for (let versuch = 0; versuch < 2; versuch++) {
          try {
            const alt = await ghLesen('log/log.csv');
            // zaten dosyada olan satırları tekrar yazma (ilk bağlanışta eski log da gönderilir)
            const vorhanden = new Set((alt.text || '').split('\n'));
            const neu = batch.map(csvZeile).filter(l => !vorhanden.has(l));
            if (!neu.length) break;
            const basis = alt.text ? alt.text.replace(/\n?$/, '\n') : '\uFEFF' + CSV_KOPF + '\n';
            const text = basis + neu.join('\n') + '\n';
            await ghSchreiben('log/log.csv', text, alt.sha, `log: ${batch.length} cevap`);
            break;
          } catch (e) { if (versuch || !/^(409|422)/.test(e.message)) throw e; }
        }
        S.ghPending.splice(0, batch.length);
        save();
      }
      if (zustandAuch) {
        for (let versuch = 0; versuch < 2; versuch++) {
          try {
            const alt = await ghLesen('log/zustand.json');
            // önce uzaktakini birleştir (başka cihazda çalışılmış olabilir), sonra yaz.
            // Koruma: uzaktaki yeni şemadaysa (yeni sürüm) dokunma; yerel neredeyse boşsa (yeni cihaz) yalnız birleştir, yazma
            let karar = { birlestir: true, yaz: true, sebep: 'ok' }, uzSurum = 0;
            if (alt.text) {
              try {
                const uz = JSON.parse(alt.text);
                uzSurum = uz.surum || 0;
                karar = Kern.yazabilir(S, uz, CODE_SURUM);
                if (karar.birlestir && uz.gespeichert !== ghUzakZaman) uzakBirlestir(uz);
              } catch (e) { console.warn('uzak durum okunamadı', e); }
            }
            if (karar.sebep === 'yeni-sema') { yenileGoster('GitHub\'daki ilerleme daha yeni bir sürümle kaydedilmiş.'); ghSemaUyari = true; break; }
            if (!karar.yaz) { ghBosYerel = true; break; }
            await v3Yedekle(alt.text, uzSurum);
            const zaman = zeitStr(now());
            await ghSchreiben('log/zustand.json', JSON.stringify(Object.assign({}, S, { log: [], pending: [], ghPending: [], gespeichert: zaman })), alt.sha, 'ilerleme');
            ghUzakZaman = zaman;
            break;
          } catch (e) { if (versuch || !/^(409|422)/.test(e.message)) throw e; }
        }
      }
      ghZuletzt = now();
      session.senkron = ghSemaUyari ? { t: now(), hata: 'uygulamayı yenile (GitHub\'daki kayıt yeni sürümden)' } : { t: now() };
      if (ghSemaUyari) ghDurum('Cevaplar gönderildi; ilerleme yazılmadı: GitHub\'daki kayıt daha yeni bir sürümden. Uygulamayı yenile.');
      else if (ghBosYerel) ghDurum('Cevaplar gönderildi; bu cihazdaki ilerleme GitHub\'dakiyle birleştirildi (ilk eşitleme, bu kez üzerine yazılmadı).');
      else ghDurum(`GitHub'a kaydedildi (${zeitStr(now()).slice(11, 16)}).`);
      ghSemaUyari = ghBosYerel = false;
    } catch (e) { ghDurum('GitHub\'a yazılamadı: ' + e.message); session.senkron = { t: now(), hata: e.message }; console.warn(e); }
    ghLaeuft = false;
    renderPlan();
  }
  // 10 cevapta bir ya da 3 dakikada bir
  setInterval(() => { if ((S.ghPending || []).length && now() - ghZuletzt > 180000) ghSync(true); }, 30000);
  async function ghLaden() {
    if (!ghToken()) { ghDurum('Önce anahtarı kaydet.'); return; }
    try {
      const z = await ghLesen('log/zustand.json');
      if (!z.text) { ghDurum('GitHub\'da kayıtlı ilerleme yok.'); return; }
      const uz = JSON.parse(z.text);
      if (Kern.yazabilir(S, uz, CODE_SURUM).sebep === 'yeni-sema') { yenileGoster('GitHub\'daki ilerleme daha yeni bir sürümle kaydedilmiş.'); ghDurum('Alınmadı: GitHub\'daki ilerleme daha yeni bir uygulama sürümünden. Önce uygulamayı yenile.'); return; }
      uzakBirlestir(uz); renderAyar(); renderHedef();
      if (!$('#v-ana').hidden) renderAna(); else if (!$('#v-calis').hidden) zeige();
      ghDurum(`İlerleme GitHub'dan alındı ve birleştirildi (${uz.gespeichert || ''}).`);
    } catch (e) { ghDurum('Alınamadı: ' + e.message); }
  }

  function herunterladen(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ================= Görünümler =================
  // üstteki sayaç: seçili bölümün bugünkü hedefi
  function renderHedef() {
    const el = $('#hedef'); if (!el) return;   // v5: hedef yalnız Bugün'de (tur halkası); üst çubukta sayaç yok
    const m = session.modus, d = bugunM(m), z = ziel(m);
    $('#hedef-n').textContent = d.n; $('#hedef-z').textContent = z;
    $('#hedef-dolu').style.width = Math.min(100, d.n / z * 100) + '%';
  }

  // Bugünün planı: tek "Çalış" akışı + günün işleri (fiil metni, yazma); odak bölümündeysen o da görünür
  function renderPlan() {
    const us = $('#ust-seri'); if (us) { const n = seriSay(); us.innerHTML = `🔥 <b>${n}</b>`; us.classList.toggle('yandi', gunAktif(tag())); }
    if (!$('#v-ana').hidden) renderAna();
    const d = bugun(), hm = bugunM('akis'), z = ziel('akis'), m = session.modus;
    const chip = (mm, no, ad, sayi, ok, extra) => `<button class="plan-chip ${ok ? 'ok' : ''} ${m === mm ? 'aktif' : ''} ${extra || ''}" data-modus="${mm}" type="button"><span class="no">${ok ? '✓' : no}</span>${ad}${sayi ? ` <span class="sayi">${sayi}</span>` : ''}</button>`;
    let chips = chip('akis', '▶', 'Çalış', `${hm.n}/${z}`, hm.n >= z, 'ana-chip');
    chips += chip('fiilmetin', '+', 'Fiil metni', 'günün', bugunM('fiilmetin').n > 0);
    if (yazmaFaellig() || bugunM('yazma').n) chips += chip('yazma', '+', 'Yazma', 'metin', bugunM('yazma').n > 0);
    if (UNITEN.some(uAktiv)) { const U = uAktivler()[0]; chips += chip('unite', '★', 'Ünite: ' + esc(U.titel), `${U.items.filter(it => uState(U).done[it.id]).length}/${U.items.length}`, false, 'vurgu'); }
    if (!['akis', 'fiilmetin', 'yazma', 'unite'].includes(m) && MODI[m]) chips += `<span class="plan-et">odak:</span>` + chip(m, '·', esc(MODI[m].ad), MODI[m].ziel > 1 ? `${bugunM(m).n}/${ziel(m)}` : '', false);
    const opt = $('#odak option[value="unite"]'); if (opt) opt.hidden = !UNITEN.some(uAktiv);
    const sayildi = gunEs(d) >= MIN_TAG;
    const bitti = hm.n >= z;
    const min = bitti ? `✓ bugün tamam${ghToken() ? ' · Claude\'a "sonuçlarıma bak" de' : ordner ? ' · log\'u pushla, Claude\'a "sonuçlarıma bak" de' : ''}` : sayildi ? '✓ gün sayıldı' : `gün için ${MIN_TAG - gunEs(d)} cevap daha`;
    // log klasörü bağlı değilse cevaplar dosyaya yazılmaz, Claude göremez
    const logUyari = ordner || ghToken() ? '' : `<button class="plan-log" type="button" data-git="ayar" title="Cevaplar log/log.csv'ye yazılmıyor">log kaydedilmiyor: Ayarlar'dan bağla</button>`;
    const kt = kota();
    const neuInfo = `<span class="plan-et" title="Bugünkü yeni kelime kotası (birikme ve genç kelime yüküne göre)">yeni: ${kt.yapilan}/${kt.q + (gs4().ekYeni || 0)}</span>`;
    $('#plan').innerHTML = `<span class="plan-et">bugün</span>${chips}${neuInfo}<span class="plan-min ${sayildi ? 'ok' : ''}" title="En az ${MIN_TAG} sayılan cevap: gün seriye sayılır">${min}</span>${logUyari}`;
  }

  function itemStatus(id) {
    const it = S.items[id];
    if (!it) return 'neu';
    if (schwach(id)) return 'schwach';
    if (it.m && it.m.S >= 21 && (!it.art || !it.art.S || it.art.S >= 7)) return 'sitzt';
    return 'lernt';
  }
  // sıradaki tekrar: "şimdi" / "bugün" / "~5 gün"
  function vadeMetni(id) {
    const it = S.items[id]; if (!it) return '';
    const h = it.m && it.m.S ? it.m : it.art && it.art.S ? it.art : null;
    if (!h) return it.yarim ? 'sırada' : '';
    const d = (h.due - now()) / DAY;
    return d <= 0 ? 'şimdi' : d < 1 ? 'bugün' : `~${Math.round(d)} gün`;
  }
  // satır: renkli artikel + kelime, Türkçe, seviye noktaları, sıradaki tekrar; dokununca alt sayfa
  function itemZeile(id) {
    const k = kind(id), it = S.items[id] || {};
    const de = k === 'v' ? `<b>${esc(vById[id].anz)}</b>${vById[id].obj.length ? ` <span class="soluk">${esc(G.objMuster(vById[id]))}</span>` : ''}`
      : k === 'w' ? `<b>${esc(wById[id].de)}</b>` : artHTML(byId[id]);
    const kanca = it.leech ? '<span title="takılıyor">🪝</span>' : '';
    return `<button class="oge tikla" data-oge="${id}" type="button"><span class="de">${de}</span><span class="tr">${esc(kurzTr(trOf(id)))}</span>
      <span class="yan">${kanca}${S.items[id] ? noktaHTML(seviyeOf(id)) : '<span class="soluk">yeni</span>'}<span class="vade">${vadeMetni(id)}</span></span></button>`;
  }
  // Kelimeler: seviye sekmeleri, arama, tek satır filtre; öğrendiklerin önce (sıradaki tekrara göre)
  const LISTE_SEKME = [['hepsi', 'Hepsi'], ['ogren', 'Öğrendiklerim'], ['1', 'Tanıyor'], ['2', 'Yazıyor'], ['3', 'Cümlede'], ['4', 'Oturdu'], ['5', 'Usta'], ['0', 'Yeni']];
  function renderListe() {
    const sek = session.listeSekme || 'hepsi';
    $('#seviye-sekme').innerHTML = LISTE_SEKME.map(([k, ad]) => `<button type="button" role="tab" data-sekme="${k}" aria-selected="${k === sek}">${ad}</button>`).join('');
    const q = $('#ara').value.trim().toLowerCase(), tur = $('#tur').value;
    const all = NOUN_ORDER.map(n => n.id).concat(VERB_ORDER.map(v => v.id), WORT_ORDER.map(w => w.id));
    const hits = all.filter(id => {
      const k = kind(id);
      if (tur === 'v' && k !== 'v') return false;
      if (tur === 'n' && k !== 'n') return false;
      if (tur === 'w' && k !== 'w') return false;
      if (tur === 'ndek' && !istNdek(id)) return false;
      if (tur === 'refl' && !istRefl(id)) return false;
      if (tur === 'schwach' && !schwach(id)) return false;
      // arama metni varken seviye sekmesi yok sayılır (öğrenilmemiş kelime de bulunur)
      const sv = S.items[id] ? seviyeOf(id) : -1;
      if (!q && sek === 'ogren' && !S.items[id]) return false;
      if (!q && sek === '0' && sv > 0) return false;
      if (!q && /^[1-5]$/.test(sek) && sv !== +sek) return false;
      if (!q) return true;
      return label(id).toLowerCase().includes(q) || trOf(id).toLowerCase().includes(q);
    });
    const vade = id => { const it = S.items[id]; if (!it) return Infinity; const h = it.m && it.m.S ? it.m : it.art && it.art.S ? it.art : null; return h ? h.due : Infinity - 1; };
    hits.sort((a, b) => (S.items[b] ? 1 : 0) - (S.items[a] ? 1 : 0) || (S.items[a] ? vade(a) - vade(b) : 0));
    $('#liste-say').textContent = `${hits.length} kelime${hits.length > 150 ? ' · ilk 150' : ''}`;
    $('#liste').innerHTML = hits.length ? hits.slice(0, 150).map(id => itemZeile(id)).join('') : `<div class="oge"><span class="tr">${q ? 'Bu aramayla kelime bulunamadı.' : 'Bu seviyede kelime yok. Çalıştıkça buraya kelimeler gelir.'}</span></div>`;
  }
  // alt sayfa: formlar, cümleler, kanca, son 5 cevap, "Öğrenmeye ekle" (yeni sıranın başına)
  function ogeSayfa(id) {
    const k = kind(id), it = S.items[id];
    let formlar = '';
    if (k === 'n') { const n = byId[id]; formlar = `<div>${n.plOnly ? 'yalnız çoğul' : n.plf ? `Çoğul: <span class="art art-pl">die</span> ${esc(n.plf)}` : 'çoğulu yok'}</div>${regelHTML(n)}`; }
    else if (k === 'v') { const v = vById[id]; formlar = `<div class="chips">${v.obj.length ? `<span class="chip vurgu">${esc(G.objMuster(v))}</span>` : ''}${formen(v).map(f => `<span class="chip">${esc(f.et)}: ${esc(f.soll)}</span>`).join('')}</div>${v.obj.some(o => o.p) ? `<div class="soluk">${hallerTR(v)}</div>` : ''}`; }
    else formlar = `<div class="soluk">${esc(KL_TR[wById[id].kl] || '')}</div>`;
    const sp = satzPool(id), cumleler = sp.own.concat(sp.extra).slice(0, 3);
    const son = S.log.filter(e => e.id === id || String(e.id).startsWith(id + ':')).slice(-5).reverse();
    const sv = it ? seviyeOf(id) : 0;
    $('#alt-sayfa-ic').innerHTML = `<div class="sira" style="margin:0;justify-content:space-between"><h3>${deItemHTML(id)}</h3><button class="ikon-btn" type="button" data-alt-kapat aria-label="Kapat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div>${esc(trOf(id))}</div>
      <div>${noktaHTML(sv)} <span class="soluk">${SEVIYE_AD[sv]}${vadeMetni(id) ? ' · sıradaki tekrar ' + vadeMetni(id) : ''}</span></div>
      ${formlar}
      ${cumleler.length ? `<ul class="ornekler">${cumleler.map(c => `<li>${deHTML(c.de)}${c.tr ? `<br><span class="soluk">${esc(c.tr)}</span>` : ''}</li>`).join('')}</ul>` : ''}
      ${kancaHTML(id)}
      ${son.length ? `<div class="son5"><b>Son cevaplar</b>${son.map(e => `<div><span class="e-${esc(e.ergebnis)}">${e.ergebnis === 'richtig' ? '✓' : e.ergebnis === 'fast' ? '≈' : e.ergebnis === 'falsch' ? '✗' : '·'}</span> ${esc(e.zeit.slice(5, 16))} · ${esc(e.antwort || e.ergebnis)}</div>`).join('')}</div>` : ''}
      ${it ? '' : `<button class="btn ana buyuk" data-add="${id}" type="button">Öğrenmeye ekle</button>`}`;
    $('#alt-sayfa').hidden = false;
  }
  const altKapat = () => { $('#alt-sayfa').hidden = true; };

  function renderZayif() {
    const ids = Object.keys(S.items).filter(id => kind(id) !== 'p' && gueltig(id + ':x') && schwach(id));
    ids.sort((a, b) => (S.items[b].leech ? 1 : 0) - (S.items[a].leech ? 1 : 0));
    const leech = ids.filter(id => S.items[id].leech).length;
    $('#zayif-say').textContent = ids.length ? `${ids.length} kelime${leech ? ` · ${leech} tanesi takılıyor (🪝)` : ''}` : 'Zayıf kelimen yok: yanlış yaptıkların burada toplanır.';
    $('#zayif-liste').innerHTML = ids.map(id => itemZeile(id)).join('');
  }

  // Geçmiş: Claude'un düzeltmeleri, son 21 gün, son cevaplar
  function renderKayit() {
    const t = now(), tage = [];
    for (let i = 20; i >= 0; i--) { const k = tag(t - i * DAY); tage.push([k, S.tage[k] || { n: 0, richtig: 0, fast: 0, falsch: 0, neuV: 0, neuN: 0 }]); }
    const W = 640, H = 170, pad = 24, bw = (W - pad * 2) / tage.length;
    const max = Math.max(10, ...tage.map(x => x[1].n)) || 1;
    const y = v => H - pad - v / max * (H - pad * 2);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Son 21 günde cevap sayısı"><text x="${pad}" y="${pad - 8}">en çok ${max} cevap</text>`;
    tage.forEach(([k, x], i) => {
      const x0 = pad + i * bw + 2, w = bw - 4;
      let acc = 0;
      [['richtig', 'var(--ok)'], ['fast', 'var(--warn)'], ['falsch', 'var(--bad)']].forEach(([key, col]) => {
        const v = x[key] || 0; if (!v) return;
        svg += `<rect x="${x0}" width="${w}" y="${y(acc + v)}" height="${y(acc) - y(acc + v)}" fill="${col}" rx="1.5"><title>${k}: ${key} ${v}</title></rect>`;
        acc += v;
      });
      if (i % 5 === 0 || i === tage.length - 1) svg += `<text x="${x0 + w / 2}" y="${H - 6}" text-anchor="middle">${k.slice(8)}.${k.slice(5, 7)}</text>`;
    });
    $('#grafik').innerHTML = svg + `<line x1="${pad}" x2="${W - pad}" y1="${H - pad}" y2="${H - pad}" stroke="var(--line)"/></svg>`;
    $('#gun-tablo').innerHTML = `<thead><tr><th>gün</th><th class="num">cevap</th><th class="num">doğru</th><th class="num">küçük h.</th><th class="num">yanlış</th><th class="num">yeni</th><th class="num">sayılmadı</th></tr></thead><tbody>` +
      tage.slice().reverse().filter(([, x]) => x.n || x.neuV || x.neuN || x.ungezaehlt).map(([k, x]) => `<tr><td>${k}</td><td class="num">${x.n}</td><td class="num e-richtig">${x.richtig || 0}</td><td class="num e-fast">${x.fast || 0}</td><td class="num e-falsch">${x.falsch || 0}</td><td class="num">${(x.neuV || 0) + (x.neuN || 0)}</td><td class="num">${x.ungezaehlt || 0}</td></tr>`).join('') + '</tbody>';
    const FEEDBACK = feedbackListe();
    $('#feedback').innerHTML = FEEDBACK.length ? FEEDBACK.slice().reverse().slice(0, 60).map(f => `<div class="oge"><span class="de">${esc(f.antwort || '')} → ${deHTML(f.richtig || '')}</span><span class="tr">${esc(f.text || '')}</span><span class="yan"><span class="durum-pil ${f.urteil === 'richtig' ? 'sitzt' : f.urteil === 'falsch' ? 'schwach' : 'lernt'}">${esc(f.zeit || '')}</span></span></div>`).join('')
      : '<div class="oge"><span class="tr">Henüz düzeltme yok. Claude her gece son cevaplarına bakar.</span></div>';
    $('#son-tablo').innerHTML = `<thead><tr><th>zaman</th><th>tür</th><th>öğe</th><th>cevap</th><th>sonuç</th><th>doğrusu</th></tr></thead><tbody>` +
      S.log.slice(-40).reverse().map(e => `<tr><td class="num">${esc(e.zeit.slice(5, 16))}</td><td>${esc(e.modus)}</td><td>${esc(e.item)}</td><td>${esc(e.antwort)}</td><td class="e-${esc(e.ergebnis)}">${esc(e.ergebnis)}</td><td>${deHTML(e.loesung)}</td></tr>`).join('') + '</tbody>';
    if (FEEDBACK.length && S.ayar4.fbGorulen !== FEEDBACK.length) { S.ayar4.fbGorulen = FEEDBACK.length; save(); }
  }

  // İlerleme: seri takvimi, seviye dağılımı + haftalık atlama, artikel aynası, biçim başına başarı, B1 yolu
  const BICIM_TR = { sec: 'seçmeli', anla: 'anlam (DE→TR)', metinde: 'metinde', yaz0: 'yazma · ipuçlu', yaz: 'yazma', bos0: 'boşluk · ipuçlu', bos: 'boşluk', cumle: 'tam cümle', metin: 'metin boşluğu', artikel: 'artikel', kok: 'kök (çekim)', kokSatz: 'kök · cümlede', kokSec: 'kök · fiil metni', yoklama: 'yoklama' };
  const ARTS = ['der', 'die', 'das'];
  function artikelAynasi() {
    const m = {}; ARTS.forEach(d => { m[d] = { der: 0, die: 0, das: 0 }; });
    S.log.forEach(e => {
      if (!['art', 'wort', 'erk', 'luecke'].includes(e.modus) || kind(String(e.id).split(':')[0]) !== 'n') return;
      const a = String(e.antwort || '').trim().split(/\s+/)[0].toLowerCase(), d = String(e.loesung || '').trim().split(/\s+/)[0].toLowerCase();
      if (m[d] && ARTS.includes(a)) m[d][a]++;
    });
    let cumle = 'Henüz yeterli veri yok: artikel soruları biriktikçe burada en sık karıştırdığın artikel görünür.', en = 0;
    ARTS.forEach(d => { const top = ARTS.reduce((x, a) => x + m[d][a], 0); if (top < 5) return; ARTS.filter(a => a !== d).forEach(a => { const o = m[d][a] / top; if (o > en && m[d][a] >= 2) { en = o; cumle = `<b>${d}</b> isimlerine %${Math.round(o * 100)} <b>${a}</b> diyorsun.`; } }); });
    if (!en && ARTS.some(d => ARTS.reduce((x, a) => x + m[d][a], 0) >= 5)) cumle = 'Artikellerin dengeli: belirgin bir karışma yok.';
    const tablo = `<table class="ayna"><thead><tr><th>doğrusu ↓ · dedin →</th>${ARTS.map(a => `<th><span class="art art-${a}">${a}</span></th>`).join('')}</tr></thead><tbody>${ARTS.map(d => { const top = ARTS.reduce((x, a) => x + m[d][a], 0) || 1; return `<tr><th><span class="art art-${d}">${d}</span></th>${ARTS.map(a => `<td class="${a === d ? 'kosegen' : m[d][a] / top >= 0.2 && m[d][a] >= 2 ? 'koyu' : ''}">${m[d][a]}</td>`).join('')}</tr>`; }).join('')}</tbody></table>`;
    return `${tablo}<p>${cumle}</p>`;
  }
  function bicimBasari() {
    const sinir = zeitStr(now() - 30 * DAY), b = {};
    S.log.forEach(e => {
      if (e.zeit < sinir) return;
      const x = (/bicim:([a-zA-Z0-9]+)/.exec(e.notiz || '') || [])[1]; if (!x || !BICIM_TR[x]) return;
      if (!['richtig', 'fast', 'falsch'].includes(e.ergebnis)) return;
      const o = b[x] = b[x] || { n: 0, ok: 0 }; o.n++; o.ok += e.ergebnis === 'richtig' ? 1 : e.ergebnis === 'fast' ? 0.5 : 0;
    });
    const l = Object.entries(b).filter(([, o]) => o.n >= 3).sort((x, y) => y[1].n - x[1].n);
    return l.length ? `<div class="seviye-dagilim">${l.map(([x, o]) => `<div class="sd-satir"><span>${esc(BICIM_TR[x])}</span><span class="sd-cubuk"><span style="width:${Math.round(o.ok / o.n * 100)}%"></span></span><b>%${Math.round(o.ok / o.n * 100)}</b></div>`).join('')}</div><div class="soluk">son 30 gün · küçük hata yarım sayılır</div>`
      : '<p class="soluk">Henüz yeterli cevap yok: birkaç turdan sonra her soru biçimindeki başarın burada görünür.</p>';
  }
  function renderGecmis() { ilerlemeUst(); }
  function ilerlemeUst() {
    const el = $('#ilerleme-ust'); if (!el) return;
    const t = now(), sr = seriDurum(), seri = seriSay();
    const ogeler = Object.keys(S.items).filter(id => kind(id) !== 'p' && gueltig(id + ':x'));
    const sv = [0, 0, 0, 0, 0, 0]; ogeler.forEach(id => { sv[seviyeOf(id)]++; });
    const toplam = NL.length + VERBEN.length + WOERTER.length, yaziyor = sv[2] + sv[3] + sv[4] + sv[5];
    const b1 = Math.round(yaziyor / toplam * 1000) / 10;
    // son 5 hafta ısı haritası (pazartesiden başlar; seri takvimi geçmişten)
    const bugun = new Date(t); bugun.setHours(12, 0, 0, 0);
    const pzt = new Date(bugun); pzt.setDate(pzt.getDate() - ((pzt.getDay() + 6) % 7) - 28);
    const z = gunHedef();
    let hucre = '';
    for (let i = 0; i < 35; i++) {
      const d = new Date(pzt); d.setDate(pzt.getDate() + i); const k = tag(d.getTime()), x = S.tage[k], n = x ? x.n : 0;
      const sev = d > bugun ? 'gelecek' : n >= z ? 's4' : n >= z / 2 ? 's3' : gunAktif(k) ? 's2' : n > 0 || gunEs(x) > 0 ? 's1' : sr.donmus[k] ? 'donmus' : 's0';
      hucre += `<i class="${sev}${k === tag() ? ' bugun' : ''}" title="${k}: ${n} cevap${sr.donmus[k] ? ' (dondurucu)' : ''}"></i>`;
    }
    // haftalık seviye atlama (son 4 hafta, tur satırlarından)
    const hafta = [3, 2, 1, 0].map(w => { const a = zeitStr(t - (w + 1) * 7 * DAY), b = zeitStr(t - w * 7 * DAY); return S.log.filter(e => e.modus === 'tur' && e.zeit >= a && e.zeit < b).reduce((s, e) => s + (+(/seviye\+:(\d+)/.exec(e.notiz || '') || [])[1] || 0), 0); });
    const hmax = Math.max(1, ...hafta), svMax = Math.max(1, ...sv.slice(1));
    el.innerHTML = `<div class="il-kutular">
        <div><b>🔥 ${seri}</b><span>gün seri · rekor ${Math.max(sr.rekor || 0, seri, enUzunSeri())}</span></div>
        <div><b>❄️ ${sr.frz || 0}</b><span>seri dondurucu</span></div>
        <div><b>${yaziyor}</b><span>kelime yazıyor ve üstü</span></div>
        <div><b>%${b1}</b><span>B1 yolu</span></div>
      </div>
      <h2>Seri takvimi · son 5 hafta</h2>
      <div class="isi"><div class="isi-gunler"><span>Pt</span><span>Sa</span><span>Ça</span><span>Pe</span><span>Cu</span><span>Ct</span><span>Pz</span></div><div class="isi-izgara">${hucre}</div></div>
      <div class="soluk isi-not">koyu yeşil: günlük hedef · açık yeşil: gün seriye sayıldı (${MIN_TAG}+ cevap) · mavi: dondurucu</div>
      <h2>Seviyeler</h2>
      <div class="seviye-dagilim">${[1, 2, 3, 4, 5].map(i => `<div class="sd-satir"><span>${noktaHTML(i)}</span><span class="sd-cubuk" title="${SEVIYE_AD[i]}"><span style="width:${Math.round(sv[i] / svMax * 100)}%"></span></span><b>${sv[i]}</b></div><div class="soluk" style="margin:-.3rem 0 0">${SEVIYE_AD[i]}</div>`).join('')}</div>
      <h2>Haftalık seviye atlama</h2>
      <div class="seviye-dagilim">${hafta.map((n, i) => `<div class="sd-satir"><span>${i === 3 ? 'bu hafta' : `${3 - i} hafta önce`}</span><span class="sd-cubuk"><span style="width:${Math.round(n / hmax * 100)}%"></span></span><b>+${n}</b></div>`).join('')}</div>
      <h2>Artikel aynası</h2>
      ${artikelAynasi()}
      <h2>Biçim başına başarı</h2>
      ${bicimBasari()}
      <h2>B1 yolu</h2>
      <div class="b1-kart"><div class="b1-ust"><b>%${b1} · ${yaziyor} / ${toplam}</b><span>Goethe B1 listesinde "Yazıyor ve üstü"</span></div>
        <div class="b1-cubuk"><span class="b1-oturdu" style="width:${(yaziyor / toplam * 100).toFixed(2)}%"></span></div></div>`;
  }

  // Diğer: yan bölümler, serbest pratik, geçmiş, ayarlar
  function renderDiger() {
    const el = $('#diger'); if (!el) return;
    const U = uAktivler()[0], zayifN = Object.keys(S.items).filter(id => gueltig(id + ':x') && schwach(id)).length;
    const satir = (attr, ik, ad, alt) => `<button class="diger-satir" ${attr} type="button"><span class="ik" aria-hidden="true">${ik}</span><span><b>${esc(ad)}</b><span class="alt">${alt}</span></span><span class="ok" aria-hidden="true">›</span></button>`;
    const pratik = ODAK.filter(([m]) => SORU_MODI.has(m) && m !== 'paket').map(([m, ik, ad]) => `<button class="btn" data-modus="${m}" type="button">${ik} ${esc(ad)}</button>`).join('');
    el.innerHTML = [
      U ? satir('data-modus="unite"', '⭐', 'Ünite: ' + U.titel, 'kitaptaki konunun kelimeleri ve metinleri') : satir('data-git="ayar"', '⭐', 'Ünite', 'açık ünite yok · Ayarlar → Üniteler'),
      satir('data-modus="paket"', '📦', 'Paketler', 'sahne + kısa metin + boşluklar'),
      satir('data-modus="fiilmetin"', '📰', 'Fiil metni', bugunM('fiilmetin').n ? 'bugün okundu ✓' : 'günün gerçek metni + çekim testi'),
      satir('data-modus="lesen"', '📖', 'Okuma', 'Goethe, DW, Klexikon'),
      satir('data-modus="yazma"', '✏️', 'Yazma', '~80 kelime · Claude düzeltir'),
      satir('data-modus="sprechen"', '🎙️', 'Konuşma', 'shadowing · Sprechen Teil 1–3'),
      satir('data-modus="kalip"', '💬', 'Kalıplar', 'fiillerin kullanımı'),
      satir('data-modus="artoyun"', '⏱️', 'Artikel 60 sn', 'der / die / das oyunu'),
      satir('data-modus="gram"', '📐', 'Gramer', 'B1 kuralları + alıştırma'),
      satir('data-modus="pruefung"', '🎓', 'Prüfung', 'Goethe B1 provası'),
      satir('data-git="zayif"', '🎯', 'Zayıflar', zayifN ? `${zayifN} kelime` : 'yanlış yaptıkların burada toplanır'),
      `<details class="diger-pratik"><summary class="diger-satir"><span class="ik" aria-hidden="true">🎲</span><span><b>Serbest pratik</b><span class="alt">aynı akış, tek bir türle</span></span><span class="ok" aria-hidden="true">⌄</span></summary><div class="diger-grup">${pratik}</div></details>`,
      satir('data-git="kayit"', '🗂️', 'Geçmiş', 'Claude\'un düzeltmeleri, son cevaplar'),
      satir('data-git="ayar" data-v="ayar"', '⚙️', 'Ayarlar', 'tempo, yeni kelime, hatırlatıcı, GitHub'),
    ].join('');
  }
  // Ayarlar: satır + anahtar; tempo (hedef hatırlama), yeni kelime / gün, günlük hedef (tur), tur uzunluğu, ses, titreşim
  function renderAyar() {
    const th = turHedefi(), yg = S.ayar4.yeniGunluk || 6, ret = S.einst.ret;
    const seg = (ad, l, sec) => `<div class="seg" role="radiogroup" data-ayar="${ad}">${l.map(([v, t]) => `<button type="button" data-val="${v}" aria-pressed="${String(v) === String(sec)}">${t}</button>`).join('')}</div>`;
    const anahtar = (id, on) => `<label class="anahtar"><input id="${id}" type="checkbox"${on ? ' checked' : ''}><i></i></label>`;
    const satir = (et, alt, kontrol) => `<div class="ayar-satir"><div class="et"><b>${et}</b>${alt ? `<span>${alt}</span>` : ''}</div>${kontrol}</div>`;
    $('#a-satirlar').innerHTML = [
      satir('Tempo', 'hedef hatırlama: Rahat %80 · Dengeli %85 · Sıkı %90', seg('ret', [[0.8, 'Rahat'], [0.85, 'Dengeli'], [0.9, 'Sıkı']], ret)),
      satir('Yeni kelime / gün', (() => { const kt = kota(); return `bugün ${kt.yapilan}${kt.sebep !== 'normal' && kt.q < yg ? ` · şu an günde ${kt.q} (${kt.sebep === 'göç' ? 'yeni düzenin ilk günleri' : kt.sebep === 'dönüş' ? 'aradan dönüş turu' : 'birikme / genç kelime çok'}); seçimin birikme eriyince geçerli` : ' · birikme varken kendiliğinden azalır'}`; })(), seg('yeni', [[4, '4'], [6, '6'], [8, '8']], yg)),
      satir('Günlük hedef', `1 tur = ${turBoyu()} cevap`, seg('hedef', [[2, '2 tur'], [3, '3 tur'], [4, '4 tur'], [5, '5 tur']], th)),
      satir('Tur uzunluğu', '', `<select id="a-tur" aria-label="Tur uzunluğu">${TUR_SECENEK.map(n => `<option value="${n}"${n === turBoyu() ? ' selected' : ''}>${n} cevap${n === 12 ? ' (önerilen)' : ''}</option>`).join('')}</select>`),
      satir('Ses efektleri', '', anahtar('a-ses', sesAcik())),
      satir('Titreşim', 'Android', anahtar('a-titresim', titresimAcik())),
    ].join('');
    const saat = $('#a-saat'); if (saat && document.activeElement !== saat) saat.value = S.ayar4.saat || sikSaat();
    const sv = $('#a-surum');
    if (sv) sv.textContent = `Kod sürümü ${CODE_SURUM} · şema ${S.surum || 3}${S.goc4 ? ' · göç ' + zeitStr(S.goc4.zaman).slice(0, 10) : ''} · çekirdek ${typeof Kern === 'object' ? 'yüklü' : 'yok'}`;
    $('#a-kur').innerHTML = standalone() ? '✓ Uygulama olarak açık.' : iOS ? 'iPhone: Safari\'de Paylaş <b>⬆︎</b> → <b>Ana Ekrana Ekle</b>. Ana ekrandan açınca ilerlemen Safari temizliğinde silinmez.' : 'Android / Chrome: menü (⋮) → <b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b>.';
    // üniteler: kitapta sırası gelmeyen (@inaktiv) Kapitel buradan açılır; açık olan kapatılabilir
    const ua = $('#a-unite');
    if (ua) ua.innerHTML = UNITEN.length ? UNITEN.map(U => {
      const st = S.unite && S.unite[U.id], durum = uZu(U) || (st && st.uebernommen) ? 'bitti' : uOffen(U) ? 'açık' : 'kapalı';
      const n = U.items.length, bis = U.bis ? ` · ${esc(U.bis)}'e kadar` : '';
      return `<div class="oge"><span class="de">${esc(U.titel)}</span><span class="tr">${n} kelime${bis}${U.inaktiv && durum === 'kapalı' ? ' · kitapta sırası gelince aç' : ''}</span><span class="yan">${durum === 'bitti' ? '<span class="durum-pil sitzt">bitti</span>' : `<button class="btn mini" data-unite-ac="${U.id}" type="button">${durum === 'açık' ? 'Kapat' : 'Aç'}</button>`}</span></div>`;
    }).join('') : '<span class="soluk">Ünite yok.</span>';
  }
  // ================= Uygulama kabuğu: Bugün ekranı, tur, seri, puan, efektler =================
  // Tur: kısa ve bitişi belli oturum (varsayılan 20 sayılan cevap ≈ 5 dk). Sonunda özet; "bir tur daha" ya da bitir.
  // Günlük hedef turlara bölünür (hedef / tur boyu). Seri: en az MIN_TAG cevaplı gün; kaçırılan gün dondurucuyla kapanır.
  // Tekrar birikmesi kullanıcıya sayı olarak gösterilmez: Bugün ekranı yalnız bugünkü işi söyler.
  const TUR_SECENEK = [5, 10, 12, 15, 20, 30];
  const turBoyu = () => TUR_SECENEK.includes(S.einst.tur) ? S.einst.tur : 12;
  const buTurBoyu = () => (session.tur && session.tur.boyu) || turBoyu();
  const sesAcik = () => S.einst.ses !== false;
  const titresimAcik = () => S.einst.titresim !== false;
  const SORU_MODI = new Set(['akis', 'blitz', 'paket', 'normal', 'verben', 'woerter', 'ndek', 'refl', 'thema', 'stark', 'zayif']);
  const ODAK = [
    ['artoyun', '⏱️', 'Artikel 60 sn', 'der / die / das oyunu · rekor'],
    ['blitz', '⚡', 'Hızlı tur', 'seçmeli anlam + der/die/das'],
    ['verben', '🔤', 'Fiiller', 'fiil yazma, cümle, çekim'],
    ['stark', '🌀', 'Düzensiz fiiller', 'Präteritum + Perfekt'],
    ['woerter', '✍️', 'Kelime yazma', 'Türkçeden Almancaya'],
    ['refl', '🔁', 'Dönüşlü fiiller', 'mich / mir / sich'],
    ['ndek', '🧩', 'n-Deklination', 'den Kollegen …'],
    ['thema', '🗂️', 'Konular', '17 B1 konusu'],
    ['paket', '📦', 'Paketler', 'sahne + kısa metin'],
    ['normal', '🎲', 'Karışık yazma', 'fiil + isim yazarak'],
    ['kalip', '💬', 'Kalıplar', 'fiillerin kullanımı'],
    ['lesen', '📖', 'Okuma', 'Goethe, DW, Klexikon'],
    ['sprechen', '🎙️', 'Konuşma', 'shadowing · Sprechen Teil 1–3'],
    ['gram', '📐', 'Gramer', 'B1 kuralları + alıştırma'],
    ['pruefung', '🎓', 'Prüfung', 'Goethe B1 provası: Lesen, Schreiben, Sprechen'],
  ];
  // ---- puan (XP) ----
  function xpEkle(n) {
    if (!n) return;
    const d = heute();
    d.xp = (d.xp || 0) + n;
    tageTuret(tag());   // S.xpToplam = Σ tage.xp (türetilir)
    if (session.tur) session.tur.xp += n;
    xpUc(n);
  }
  const XP_TYP = { art: 1, erk: 1, bed: 1, wort: 2, prod: 2, abr: 2, frm: 2, refl: 2, ndek: 2, stamm: 3, satz: 3, nsatz: 3, pak: 3 };
  const xpFuer = (q, urteil) => {
    const w = q && q.typ ? (XP_TYP[q.typ] || 2) : 3;
    return w * (urteil === 'richtig' ? 5 : urteil === 'fast' ? 3 : 1) * (session.donusBonus ? 2 : 1);
  };
  // ---- seri ----
  // gün / seri (SPEC §6): sayılan cevaplar + yan bölümlerin bitmiş işleri cevap eşdeğeriyle
  // (okuma, fiil metni, ünite metni, Prüfung, yazma: 10 · konuşma: 3)
  const ISLER_AGIRLIK = { lesen: 10, fiilmetin: 10, unite: 10, pruefung: 10, yazma: 10, sprechen: 3 };
  function gunEs(d) {
    if (!d) return 0;
    const md = d.modi || {};
    return (d.n || 0) + Object.keys(ISLER_AGIRLIK).reduce((a, m) => a + ISLER_AGIRLIK[m] * ((md[m] && md[m].n) || 0), 0);
  }
  const gunAktif = k => { if (k === tag() && S.tageC && S.tageC[k]) tageTuret(k); return gunEs(S.tage[k]) >= MIN_TAG; };
  // geçmiş günlerdeki en uzun seri (rekor sıfırdan başlamasın)
  function enUzunSeri() {
    const gunler = Object.keys(S.tage).filter(gunAktif).sort();
    let enIyi = 0, n = 0, onceki = null;
    gunler.forEach(d => { n = onceki && Math.round((new Date(d) - new Date(onceki)) / DAY) === 1 ? n + 1 : 1; enIyi = Math.max(enIyi, n); onceki = d; });
    return enIyi;
  }
  const seriDurum = () => {
    if (!S.seri) S.seri = { frz: 1, donmus: {}, rekor: 0 };
    if (!S.seri.rekorGoc) { S.seri.rekor = Math.max(S.seri.rekor || 0, enUzunSeri()); S.seri.rekorGoc = true; }
    return S.seri;
  };
  function seriSay() {
    const sr = seriDurum(), t = now();
    let n = 0;
    for (let i = 0; i < 3650; i++) {
      const d = tag(t - i * DAY);
      if (gunAktif(d)) n++;
      else if (sr.donmus[d]) continue;
      else if (i === 0) continue;   // bugün henüz çalışılmadı: seri dünden sayılır
      else break;
    }
    return n;
  }
  // açılışta: dünden geriye kaçırılan günler dondurucuyla kapanır (yetmezse seri sıfırlanır, dondurucu harcanmaz)
  function seriBakim() {
    const sr = seriDurum(), t = now();
    if (!Object.keys(S.tage).some(gunAktif)) return;
    const bos = [];
    for (let i = 1; i < 400; i++) { const d = tag(t - i * DAY); if (gunAktif(d) || sr.donmus[d]) break; bos.push(d); }
    if (!bos.length) return;
    if (bos.length > (sr.frz || 0)) {
      const once = tag(t - (bos.length + 1) * DAY);
      if (bos.length === 1 && (gunAktif(once) || sr.donmus[once])) sr.onarim = { gun: bos[0], bis: tag() };
      return;
    }
    bos.forEach(d => { sr.donmus[d] = true; });
    sr.frz -= bos.length;
    session.donduruldu = bos.length;
    save();
  }
  // gün içi sayaç arttı: gün kurtarıldı mı, seri onarıldı mı
  // d: bugünün toplamı (bütün cihazlar); MIN_TAG toplam üzerinden
  function gunSayac(d) {
    d = d || bugun();
    if (d.n === MIN_TAG) seriGunTamam();
    const sr = seriDurum();
    if (sr.onarim && sr.onarim.bis === tag() && d.n >= 2 * MIN_TAG) {
      sr.donmus[sr.onarim.gun] = true; delete sr.onarim;
      toast(`🔧 Seri onarıldı: ${seriSay()} gün!`, 3000); ton('seri');
    }
  }
  // gün seriye sayıldı (MIN_TAG. cevap): rekor, her 7 günde bir dondurucu (en çok 2)
  function seriGunTamam() {
    const sr = seriDurum(), n = seriSay();
    sr.rekor = Math.max(sr.rekor || 0, n);
    if (n > 0 && n % 7 === 0 && sr.kazanc !== tag()) { sr.frz = Math.min(2, (sr.frz || 0) + 1); sr.kazanc = tag(); session.dondurucuKazandi = true; }
    if (session.tur) session.tur.seriYeni = n;
    ton('seri'); titret([20, 60, 20]);
  }
  // ---- tur ----
  function turBaslat() {
    const fx = $('#fx'); if (fx) fx.replaceChildren();
    kart.classList.remove('fx-dogru', 'fx-fast', 'fx-yanlis', 'cevaplandi');
    const hedefOnce = bugun().n >= gunHedef();
    // hedeften sonraki tur bonus: kota +2 (günde en çok +4, Kern.kota)
    if (hedefOnce && SORU_MODI.has(session.modus)) gs4().bonus = (gs4().bonus || 0) + 1;
    session.tur = { n: 0, richtig: 0, fast: 0, falsch: 0, xp: 0, start: now(), w: {}, neu: [], seviye: [], takilan: [], tekrar: 0, tekrarOk: 0, hedefOnce, seriOnce: gunAktif(tag()) };
    // Kern.sec oturumu: 3+ gün aradan sonraki ilk turda yeni yok (dönüş turu)
    session.ot = { adim: 0, boy: turBoyu(), kuyruk: [], gecmis: [], tanitSira: [], partiIds: [], donus: Kern.donusMu(S, now()) };
    otRender();
  }
  // tur içinde görülen kelime: en kötü sonucu tutulur (özet: güçlenenler / tekrar gelecekler)
  function turKelime(id, g) {
    const tu = session.tur; if (!tu || !id) return;
    tu.w[id] = tu.w[id] == null ? g : Math.min(tu.w[id], g);
  }
  // tur boyu dolunca: aynı turda yeniden sorulacak yanlış kaldıysa tur en çok 3 cevap uzar (SPEC §4.4 "bir doğruya kadar"),
  // bekleyen yanlışlar hemen sıraya alınır
  const TUR_UZAT = 3;
  function turBitti() {
    const tu = session.tur;
    if (!tu || !SORU_MODI.has(session.modus)) return false;
    const b = buTurBoyu();
    if (tu.n < b) return false;
    const ot = session.ot, bek = ot ? (ot.kuyruk || []).filter(k => k.neden === 'yanlis') : [];
    if (bek.length && tu.n < b + TUR_UZAT) { bek.forEach(k => { k.at = Math.min(k.at, ot.adim || 0); }); return false; }
    return true;
  }
  function otRender() {
    const tu = session.tur, b = buTurBoyu(), n = tu ? Math.min(tu.n, b) : 0;
    const d = $('#ot-dolu'); if (!d) return;
    d.style.width = (n / b * 100) + '%';
    $('#ot-sayi').textContent = SORU_MODI.has(session.modus) ? `${n}/${b}` : '';
    $('#ot-cubuk').hidden = !SORU_MODI.has(session.modus);
    $('#ot-cubuk').setAttribute('aria-valuenow', n); $('#ot-cubuk').setAttribute('aria-valuemax', b);
    $('#ot-mod').textContent = session.modus === 'akis' ? '' : (MODI[session.modus] || {}).ad || '';
    $('#ses-btn').innerHTML = sesAcik() ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  }
  // günlük hedef (tur) ve bugün yapılan tur
  const turHedefi = () => Math.max(1, Math.min(8, +(S.ayar4 && S.ayar4.turHedef) || 2));
  const turYapildi = () => Math.floor(bugun().n / turBoyu());
  // log'daki en sık çalışma saati (çeyreğe yuvarlı): hatırlatıcı önerisi
  function sikSaat() {
    const say = {};
    S.log.forEach(e => { const m = /\d{4}-\d\d-\d\d (\d\d):(\d\d)/.exec(e.zeit || ''); if (m) { const k = m[1] + ':' + String(Math.floor(+m[2] / 15) * 15).padStart(2, '0'); say[k] = (say[k] || 0) + 1; } });
    const en = Object.entries(say).sort((a, b) => b[1] - a[1])[0];
    return en ? en[0] : '19:00';
  }
  function turSonuRender(sebep, teklif) {
    clearTimers();
    kart.classList.remove('fx-dogru', 'fx-fast', 'fx-yanlis', 'cevaplandi', 'duzen');
    const tu = session.tur || { n: 0, richtig: 0, fast: 0, falsch: 0, xp: 0, start: now(), w: {}, neu: [], seviye: [], takilan: [], tekrar: 0, tekrarOk: 0 };
    tu.bitti = true;
    const dk = Math.max(1, Math.round((now() - tu.start) / 60000));
    // doğruluk yalnız tekrarlardan (yeni kelimenin mini / ikinci soruları sayılmaz); tekrar yoksa "–"
    // tekrar sorusu yoksa (paket turu) bütün cevaplardan
    const oran = tu.tekrar ? Math.round(tu.tekrarOk / tu.tekrar * 100) : tu.n ? Math.round(((tu.richtig || 0) + 0.5 * (tu.fast || 0)) / tu.n * 100) : null;
    const yeniIds = [...new Set(tu.neu || [])], seviye = [...new Set(tu.seviye || [])], takilan = [...new Set(tu.takilan || [])];
    const zor = Object.keys(tu.w).filter(id => tu.w[id] <= 1 && !takilan.includes(id));
    const d = bugun(), z = ziel('akis'), turHedef = turHedefi(), turYapilan = Math.min(turHedef, turYapildi());
    const hedefYeni = !tu.hedefOnce && d.n >= z, seriYeni = !tu.seriOnce && gunAktif(tag());
    const seri = seriSay();
    const grup = (et, ids, cls) => ids.length ? `<div class="ts-grup"><div class="ts-et">${et}</div><div class="ts-chips">${ids.slice(0, 6).map(id => `<span class="ts-chip ${cls}" data-id="${esc(id)}">${deItemHTML(id)}</span>`).join('')}${ids.length > 6 ? `<span class="soluk">+${ids.length - 6}</span>` : ''}</div></div>` : '';
    const o = oran == null ? 60 : oran;
    const baslik = sebep === 'leer' ? 'Şimdilik bu kadar' : o >= 85 ? 'Harika tur!' : o >= 60 ? 'Tur tamam' : 'Tur tamam, zor bir turdu';
    // tur içinde biriken notlar (tost yerine)
    const notlar = toastKuyruk.splice(0);
    // ilk turdan sonra bir kez: hatırlatıcı önerisi (+ Android'de kurulum kartı yalnız bu anda)
    const gs = S.ayar4.gosterildi = S.ayar4.gosterildi || {};
    let hatirlat = '';
    if (sebep !== 'leer' && tu.n && !gs.hatirlat) {
      gs.hatirlat = tag(); session.hatirlatSaat = sikSaat();
      hatirlat = `<div class="ts-hatirlat" id="ts-hatirlat"><b>Yarın ${session.hatirlatSaat}'te hatırlatayım mı?</b><span class="soluk">En çok bu saatte çalışıyorsun. Takvimine her gün 10 dakikalık bir etkinlik eklenir.</span>
        <div class="sira" style="margin:0"><button class="btn" data-act="hatirlat-evet" type="button">Google Takvim'e ekle</button><button class="btn mini" data-act="hatirlat-hayir" type="button">Gerek yok</button></div>
        ${kurPrompt && !standalone() ? '<div class="sira" style="margin:0"><button class="btn" data-act="kur" type="button">📲 Ana ekrana ekle</button><span class="soluk">tam ekran, internetsiz de çalışır</span></div>' : ''}</div>`;
    }
    kart.innerHTML = `<div class="tur-sonu">
      <div class="ts-rozet ${o >= 85 && sebep !== 'leer' ? 'altin' : ''}" aria-hidden="true">${sebep === 'leer' ? '☕' : o >= 85 ? '🏆' : o >= 60 ? '💪' : '🌱'}</div>
      <div class="ts-baslik">${baslik}</div>
      ${hatirlat}
      ${sebep === 'leer' ? `<div class="soluk">Şu an sırası gelen tekrar yok.${teklif ? ' İstersen 3 yeni kelime daha öğren.' : ' Yarın yenileri gelir.'}</div>` : ''}
      <div class="ts-istat" style="grid-template-columns:repeat(3,1fr)">
        <div><b>${tu.n}</b><span>cevap</span></div>
        <div><b id="ts-dogruluk">${oran == null ? '–' : '%' + oran}</b><span>doğruluk</span></div>
        <div><b>${dk}</b><span>dakika</span></div>
      </div>
      ${grup(`seviye atlayanlar · ${seviye.length}`, seviye, 'altin')}
      ${grup('tanıştıkların', yeniIds, 'yeni')}
      ${grup('yakında tekrar', zor, 'kehribar')}
      ${grup('takılanlar 🪝 (Claude kanca yazacak)', takilan, 'kehribar')}
      <div class="ts-seri${seriYeni ? ' yeni' : ''}">🔥 <b>${seri} gün</b>${seriYeni ? ' · bugün seriye sayıldı' : ''} · ${hedefYeni || d.n >= z ? `${turHedef}/${turHedef} tur ✓` : `${turYapilan}/${turHedef} tur`}${session.dondurucuKazandi ? ' · ❄️ bir seri dondurucu kazandın' : ''}</div>
      ${hedefYeni ? '<div class="ts-hedef ok">✓ Günlük hedef tamam. Bundan sonraki turlar bonus: yeni kelime getirir.</div>' : ''}
      ${notlar.length ? `<div class="ts-notlar">${notlar.map(m => `<div>${m}</div>`).join('')}</div>` : ''}
      <div class="ts-btns">
        ${teklif ? '<button class="btn ana buyuk" data-act="ek-yeni" type="button">+3 yeni kelime <kbd>Enter</kbd></button>' : sebep === 'leer' ? '' : `<button class="btn ana buyuk" data-act="tur-devam" type="button">Bir tur daha <kbd>Enter</kbd></button>`}
        <button class="btn buyuk" data-git="ana" type="button">${sebep === 'leer' ? 'Ana sayfa' : 'Bitir'}</button>
      </div></div>`;
    aktuell = { typ: 'turSonu', sebep, teklif };
    $('#durum-satiri').innerHTML = '';
    $('#hinweis').hidden = true;
    tastatur();
    otRender();
    session.dondurucuKazandi = false;
    if (session.donusBonus && tu.n) session.donusBonus = false;
    if (sebep !== 'leer') { ton('tur'); if (hedefYeni) konfeti(); }
    if (tu.n) logEintrag({ modus: 'tur', id: session.modus, item: MODI[session.modus] ? MODI[session.modus].ad : '', frage: '', antwort: '', ergebnis: sebep === 'leer' ? 'leer' : 'bitti', loesung: '',
      notiz: `cevap:${tu.n} | doğru:${tu.richtig} | küçük:${tu.fast} | yanlış:${tu.falsch} | puan:${tu.xp} | dk:${dk} | yeni:${yeniIds.length} | seviye+:${seviye.length} | tekrar:${tu.tekrar || 0}` });
    save();
  }
  // ---- efektler: ses, titreşim, kart rengi, uçan puan, konfeti ----
  let _ac = null;
  const SESLER = {
    dogru: [[880, .11, 0, 'sine', .09], [1318.5, .16, .07, 'sine', .08]],
    fast: [[740, .14, 0, 'sine', .08]],
    yanlis: [[233, .16, 0, 'triangle', .1], [196, .2, .1, 'triangle', .08]],
    tur: [[523.25, .12, 0, 'sine', .08], [659.25, .12, .1, 'sine', .08], [783.99, .12, .2, 'sine', .08], [1046.5, .32, .3, 'sine', .09]],
    seri: [[587.33, .1, 0, 'sine', .08], [880, .22, .09, 'sine', .09]],
    tik: [[1046.5, .06, 0, 'sine', .05]],
    seviye: [[659.25, .09, 0, 'triangle', .07], [987.77, .09, .08, 'triangle', .07], [1318.5, .2, .16, 'sine', .08]],
  };
  function ton(ad) {
    if (!sesAcik() || !SESLER[ad]) return;
    try {
      _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
      if (_ac.state === 'suspended') _ac.resume();
      const t0 = _ac.currentTime + .01;
      SESLER[ad].forEach(([f, d, st, typ, vol]) => {
        const o = _ac.createOscillator(), g = _ac.createGain();
        o.type = typ; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + st);
        g.gain.exponentialRampToValueAtTime(vol, t0 + st + .015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d);
        o.connect(g); g.connect(_ac.destination);
        o.start(t0 + st); o.stop(t0 + st + d + .05);
      });
    } catch (e) { /* ses yok */ }
  }
  const titret = p => { try { if (titresimAcik() && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* yok */ } };
  const azHareket = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SES_TYP = new Set(['erk', 'bed', 'art', 'wort', 'prod', 'abr']);
  function komboSay(urteil) {
    session.kombo = urteil === 'richtig' ? (session.kombo || 0) + 1 : 0;
    const k = session.kombo;
    if (k === 3 || k === 5 || k === 10 || (k > 10 && k % 10 === 0)) { const el = $('#ot-sayi'); if (el && !azHareket()) { const r = el.getBoundingClientRect(), d = document.createElement('div'); d.className = 'kombo'; d.textContent = `🔥 ${k} üst üste`; d.style.left = (r.left - 52) + 'px'; d.style.top = (r.top - 2) + 'px'; $('#fx').appendChild(d); setTimeout(() => d.remove(), 1500); } if (session.tur) session.tur.enIyiKombo = Math.max(session.tur.enIyiKombo || 0, k); }
  }
  function fxCevap(urteil) {
    komboSay(urteil);
    ton(urteil === 'richtig' ? 'dogru' : urteil === 'fast' ? 'fast' : 'yanlis');
    const q = aktuell;
    if (sesAcik() && S.einst.otoSes !== false && q && q.id && SES_TYP.has(q.typ) && kind(q.id) !== 'p') setTimeout(() => { if (aktuell === q) sprich(label(q.id).replace('sich(D)', 'sich')); }, 380);
    titret(urteil === 'falsch' ? [12, 50, 12] : 10);
    kart.classList.remove('fx-dogru', 'fx-fast', 'fx-yanlis'); void kart.offsetWidth;
    kart.classList.add(urteil === 'richtig' ? 'fx-dogru' : urteil === 'fast' ? 'fx-fast' : 'fx-yanlis', 'cevaplandi');
  }
  function xpUc(n) {
    const hedef = $('#ot-sayi'); if (!hedef || $('#v-calis').hidden || azHareket()) return;
    const r = hedef.getBoundingClientRect(), el = document.createElement('div');
    el.className = 'xp-uc'; el.textContent = '+' + n;
    el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.bottom + 4) + 'px';
    $('#fx').appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
  function konfeti() {
    if (azHareket()) return;
    const c = document.createElement('canvas'), W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    c.width = W * dpr; c.height = H * dpr; c.className = 'konfeti';
    $('#fx').appendChild(c);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const renk = ['#5b8ff0', '#ec5f55', '#3cc287', '#f5c542', '#a77bf3'];
    const P = Array.from({ length: 120 }, () => ({ x: Math.random() * W, y: -10 - Math.random() * H * .3, vx: (Math.random() - .5) * 3, vy: Math.random() * 2 + 1, r: Math.random() * 6 + 3, c: renk[Math.floor(Math.random() * renk.length)], a: Math.random() * 6, va: (Math.random() - .5) * .35 }));
    const t0 = performance.now();
    (function kare(t) {
      const dt = t - t0; x.clearRect(0, 0, W, H);
      if (!c.isConnected) return;
      P.forEach(p => { p.vy += .12; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - dt / 2400); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
      if (dt < 2400) requestAnimationFrame(kare); else c.remove();
    })(t0);
  }
  function toast(msg, ms) {
    const el = $('#toast'); if (!el) return;
    if (calisAcik()) {
      if (turIcinde()) { toastKuyruk.push(msg); return; }
      flash(String(msg).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()); return;
    }
    el.innerHTML = msg; el.hidden = false; el.classList.add('acik');
    clearTimeout(toast._t); toast._t = setTimeout(() => { el.classList.remove('acik'); setTimeout(() => { el.hidden = true; }, 250); }, ms || 2600);
  }
  // ---- Bugün ekranı ----
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
  let kurPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); kurPrompt = e; if (!$('#v-ana').hidden) renderAna(); });
  // dilimli halka: x/3 tur (sürmekte olan tur dilimi kısmen dolu)
  function halka3(yapilan, hedef, kismi, ic) {
    const r = 46, c = 54, N = Math.max(1, hedef), bosluk = N > 1 ? 16 : 0, dil = 360 / N;
    const nokta = a => { const x = (a - 90) * Math.PI / 180; return [(c + r * Math.cos(x)).toFixed(2), (c + r * Math.sin(x)).toFixed(2)]; };
    const yay = (a0, a1) => { if (a1 - a0 >= 359.9) a1 = a0 + 359.9; const [x0, y0] = nokta(a0), [x1, y1] = nokta(a1); return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
    let p = '';
    for (let i = 0; i < N; i++) {
      const a0 = i * dil + bosluk / 2, a1 = (i + 1) * dil - bosluk / 2;
      p += `<path class="iz" d="${yay(a0, a1)}"/>`;
      const f = i < yapilan ? 1 : i === yapilan ? Math.max(0, Math.min(1, kismi)) : 0;
      if (f > 0.02) p += `<path class="dolu" d="${yay(a0, a0 + (a1 - a0) * f)}"/>`;
    }
    return `<svg class="halka halka3${yapilan >= N ? ' tamam' : ''}" viewBox="0 0 108 108" aria-hidden="true">${p}</svg><div class="halka-ic">${ic}</div>`;
  }
  const selam = () => { const h = new Date(now()).getHours(); return h < 5 ? 'İyi geceler' : h < 11 ? 'Günaydın' : h < 17 ? 'İyi günler' : h < 22 ? 'İyi akşamlar' : 'İyi geceler'; };
  // Bugün'deki bilgi mesajları birikir, birbirini ezmez (hoş geldin, dondurucu, ünite kapandı …)
  function mesajEkle(m) { session.mesajlar = session.mesajlar || []; if (!session.mesajlar.includes(m)) session.mesajlar.push(m); }
  // toparlanma tahmini (Kern.tahmin): günde n tur ile birikmenin bir günlük işe indiği gün; saatlik önbellek
  // bitiş çizgisi her tur sayısında aynı: bugünkü günlük hedefin 0,75'i (3 tur ile 4 tur aynı ölçüyle karşılaştırılır)
  function tahminGun(n) {
    const esik = 0.75 * gunHedef();
    const k = n + '|' + esik + '|' + Math.floor(now() / 3600000) + '|' + Object.keys(S.items).length, o = session.tahmin = session.tahmin || {};
    if (!(k in o)) { try { o[k] = Kern.tahmin(durum4(), n * turBoyu(), now(), esik); } catch (e) { o[k] = null; } }
    return o[k];
  }
  const gunMetni = g => g == null ? '3 haftadan uzun' : g <= 1 ? '~1 gün' : `~${g} gün`;
  // toparlanma cümlesi (Bugün satırı ve güven kartı aynı değerden): n tur ile süre, 4. tur daha kısaysa onu da söyler; 3 haftayı aşan süre yazılmaz
  function toparlanmaMetni(n) {
    const g = tahminGun(n), g4 = n < 4 ? tahminGun(4) : null;
    const hizlanir = g4 != null && (g == null || g4 < g);
    if (g == null) {
      // bu tempoda 3 haftada toparlanmıyor: dürüst söyle, bir tur fazlası ne kadar sürede toparlar
      const g1 = tahminGun(n + 1);
      if (hizlanir) return `bu tempoda birikme büyüyor · 4. tur ${gunMetni(g4)}de toparlar`;
      return g1 != null ? `bu tempoda birikme büyüyor · ${n + 1}. tur ${gunMetni(g1)}de toparlar` : 'bu tempoda birikme büyüyor · tur eklemek eritir';
    }
    return `bu hızla ${gunMetni(g)}${hizlanir ? ` · 4. tur ${gunMetni(g4)}e indirir` : ''}`;
  }
  const dkOnce = t => { const d = Math.round((now() - t) / 60000); return d < 1 ? 'az önce' : d < 60 ? `${d} dk önce` : d < 1440 ? `${Math.round(d / 60)} saat önce` : `${Math.round(d / 1440)} gün önce`; };
  // bu hafta seviye atlayan kelime (tur satırlarındaki seviye+)
  const haftaSeviye = () => { const sinir = zeitStr(now() - 7 * DAY); return S.log.filter(e => e.modus === 'tur' && e.zeit >= sinir).reduce((a, e) => a + (+(/seviye\+:(\d+)/.exec(e.notiz || '') || [])[1] || 0), 0); };
  function renderAna() {
    const el = $('#ana'); if (!el) return;
    const d = bugun(), b = turBoyu(), turHedef = turHedefi(), yapildi = turYapildi(), tamam = d.n >= ziel('akis');
    const sr = seriDurum(), seri = seriSay(), bugunSayildi = gunAktif(tag());
    const ilkGun = !Object.values(S.tage).some(x => x && x.n > 0);
    const gs = S.ayar4.gosterildi = S.ayar4.gosterildi || {};
    const kt = kota(), dk = Math.max(3, Math.round(b / 3));
    const pkT = session.parkTur && session.parkTur.mod === 'akis' ? session.parkTur.tur : null;
    const surT = session.tur && !session.tur.bitti && session.tur.n && session.tur.mod === 'akis' ? session.tur : pkT;
    const surer = !!surT;
    const btnMetin = ilkGun ? `İlk turun · ${b} soru` : surer ? `Devam et · ${surT.n}/${surT.boyu || b}` : tamam ? `Bonus tur · ~${dk} dk` : `Başla · ~${dk} dk`;
    const ic = tamam ? '<span class="halka-ok">✓</span>' : `<b>${Math.min(yapildi, turHedef)}/${turHedef}</b><span>tur</span>`;
    const baslik = ilkGun ? 'Hoş geldin' : tamam ? 'Bugün tamam' : bugunSayildi ? 'Gün seriye sayıldı ✓' : yapildi ? 'İyi gidiyor' : 'Bugünün ilk turu';
    // merak satırı: dün tanıştığın kelimeler ya da turdaki yeni kelimeler (sayı borç değil, merak)
    const dun = Kern.gun4(now() - DAY);
    const dunden = Object.values(S.items).filter(it => it.tanit && Kern.gun4(it.tanit) === dun && it.m && it.m.S && it.m.due <= now() + 6 * 3600000).length;
    const merak = session.ot && session.ot.donus ? 'Önce bildiklerin: kısa bir ısınma turu' : dunden ? `Dünden ${dunden} kelime seni bekliyor` : kt.kalan > 0 ? `İçinde ${Math.min(kt.kalan, 2)} yeni kelime` : tamam ? 'Bonus tur yeni kelime getirir' : 'Bugün eskileri sağlamlaştırıyoruz';
    // toparlanma: yalnız birikme 1,2 günlük işten büyükken; sayı yok, süre var
    const vad = faellig().length, gunIs = 0.75 * gunHedef();
    let toparlanma = '';
    if (vad > 1.2 * gunIs && !ilkGun) {
      toparlanma = `<div class="toparlanma">Toparlanıyor · ${toparlanmaMetni(turHedef)}</div>`;
    }
    // en çok 2 iş kartı: ünite · paket tekrarı · fiil metni
    const isler = [];
    const U = uAktivler()[0];
    if (U) {
      const tanidik = uTanidikSay(U);
      const kalan = U.bis ? Math.max(0, Math.round((new Date(U.bis + 'T23:59:59') - new Date(now())) / DAY)) : null;
      isler.push(`<button class="is-kart" data-modus="unite" type="button"><span class="is-ikon">⭐</span><span class="is-metin"><b>Ünite: ${esc(U.titel)}</b><span>${tanidik}/${U.items.length} kelime tanıdık${kalan != null ? ` · ${kalan} gün kaldı` : ''}</span><span class="is-cubuk"><span style="width:${(tanidik / U.items.length * 100).toFixed(1)}%"></span></span></span><span class="is-ok">›</span></button>`);
    }
    const pPlan = paketPlan();
    if (pPlan && pPlan.tur !== 'yeni') isler.push(`<button class="is-kart" data-modus="paket" type="button"><span class="is-ikon">📦</span><span class="is-metin"><b>${pPlan.tur === 'offen' ? 'Paketi bitir: ' + esc(pPlan.p.titel) : 'Paket tekrarı: ' + esc(pPlan.p.titel)}</b><span>kısa metin + boşluklar · ~3 dk</span></span><span class="is-ok">›</span></button>`);
    const fmOk = bugunM('fiilmetin').n > 0;
    if (LT.length && !fmOk) isler.push(`<button class="is-kart" data-modus="fiilmetin" type="button"><span class="is-ikon">📰</span><span class="is-metin"><b>Günün fiil metni</b><span>gerçek metin + 6 soruluk çekim testi · ~5 dk</span></span><span class="is-ok">›</span></button>`);
    // Claude'un notları: yeni düzeltme varsa (ilk açılışta eskiler görülmüş sayılır)
    const fb = feedbackListe();
    if (S.ayar4.fbGorulen == null) { S.ayar4.fbGorulen = fb.length; save(); }
    const fbYeni = fb.slice(S.ayar4.fbGorulen);
    const notlar = fbYeni.length ? `<div class="ana-kart notlar-kart"><h3>✍️ Claude'un notları · ${fbYeni.length} yeni</h3>${fbYeni.slice(-3).reverse().map(f => `<div class="not-satir"><span>${esc(f.antwort || '—')} → ${deHTML(f.richtig || '')}</span>${f.text ? `<span class="soluk">${esc(f.text)}</span>` : ''}</div>`).join('')}
        <div class="sira" style="margin:0"><button class="btn" data-act-ana="notlar-hepsi" type="button">Hepsini gör</button><button class="btn mini" data-act-ana="notlar-tamam" type="button">Tamam</button></div></div>` : '';
    // ilk açılış (bir kez): güven kartı + "Ne değişti?"
    const eskiK = S.kartenV3 || {}, gz = S.goc4 && S.goc4.zaman;
    // eskiden vadesi gelmiş kart (yayılmış olanlar asıl vadesiyle: urspr)
    const eskiVadeli = gz ? Object.values(eskiK).filter(c => c && c.S && Math.min(c.due, c.urspr || Infinity) <= gz).length : 0;
    if (S.goc4 && Object.keys(eskiK).length && !gs.guven) { gs.guven = tag(); session.guvenAcik = true; save(); }
    const guven = session.guvenAcik ? `<div class="ana-kart guven-kart" id="guven-kart"><h3>Yeni düzen: her kelimenin tek hafızası</h3>
        <div>Eskiden ${eskiVadeli || Object.keys(eskiK).length} kart sırada bekliyordu; artık her kelimenin tek hafızası var: <b>${vad} kelime</b> sırada. Günde ${turHedef} turla: ${toparlanmaMetni(turHedef)}. Yeni kelime şimdilik günde ${kt.q}; birikme eridikçe artar.</div>
        <b>Ne değişti?</b><ul><li>"Biliyor musun?" yok; notu sistem verir.</li><li>Soru, kelimeyi ne kadar bildiğine göre zorlaşır: seç → yaz → cümlede.</li><li>Artikel ayrı izlenir: kelime ✓ · artikel ✗.</li></ul>
        <div class="sira" style="margin:0"><button class="btn" data-act-ana="guven-tamam" type="button">Anladım</button></div></div>` : '';
    const onarim = sr.onarim && sr.onarim.bis === tag() ? `<div class="ana-bilgi onarim">🔧 Dün seriyi kaçırdın. Bugün <b>2 tur</b> yaparsan serin geri gelir.</div>` : '';
    const bilgi = (session.mesajlar || []).map(m => `<div class="ana-bilgi">${esc(m)}</div>`).join('') + onarim;
    const hs = haftaSeviye();
    const sk = session.senkron || {};
    const senkron = ghToken() ? (sk.hata ? `<div class="senkron hata">Eşitlenemedi: ${esc(sk.hata)}</div>` : `<div class="senkron">${sk.t ? 'eşitlendi ' + dkOnce(sk.t) : 'eşitleniyor…'}</div>`) : '<div class="senkron">yalnız bu cihazda kayıtlı · <button class="btn mini" data-git="ayar" type="button">eşitle</button></div>';
    el.innerHTML = `
      <div class="ana-ust">
        <div><div class="selam">${selam()}</div><div class="tarih">${new Date(now()).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
        <div class="seri-pil${bugunSayildi ? ' yandi' : ''}" title="Seri: en az ${MIN_TAG} cevaplı gün. Dondurucu: kaçırdığın bir günü seriden düşürmez (her 7 günde bir kazanılır).">🔥 <b>${seri}</b>${sr.frz ? `<span class="frz">❄️${sr.frz > 1 ? sr.frz : ''}</span>` : ''}</div>
      </div>
      ${bilgi}${guven}
      <div class="hero">
        <div class="halka-kap">${halka3(Math.min(yapildi, turHedef), turHedef, (d.n % b) / b, ic)}</div>
        <div class="hero-metin">
          <div class="hero-baslik">${baslik}</div>
          <div class="merak">${esc(merak)}</div>
          <button class="btn ana buyuk basla-btn basla-sabit" data-act-ana="basla" type="button">${btnMetin}</button>
          ${toparlanma}
        </div>
      </div>
      ${isler.length ? `<div class="isler">${isler.slice(0, 2).join('')}</div>` : ''}
      ${notlar}
      ${hs ? `<div class="hafta-seviye">Bu hafta <b>+${hs}</b> seviye</div>` : ''}
      ${senkron}`;
    rozetGuncelle(gunAktif(tag()) ? 0 : 1);
  }
  function rozetGuncelle(n) {
    try { if (navigator.setAppBadge && standalone()) (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {}); } catch (e) { /* yok */ }
  }
  // Çalış'a geç: tur başlar (bitmiş ya da yoksa yenisi)
  function calisBasla(m, boyu) {
    // soru turu sürerken yan bölüme (fiil metni, gramer, okuma …) geçilirse tur ve oturum kuyruğu saklanır; dönünce sürer
    const tu0 = session.tur;
    if (m && !SORU_MODI.has(m) && tu0 && !tu0.bitti && tu0.n > 0 && SORU_MODI.has(tu0.mod || session.modus)) session.parkTur = { tur: tu0, ot: session.ot, mod: tu0.mod || session.modus };
    if (m) setModus(m);
    const pk = session.parkTur;
    if (pk && !boyu && pk.mod === session.modus && (!session.tur || session.tur.bitti || session.tur.mod !== session.modus)) { session.tur = pk.tur; session.ot = pk.ot; session.parkTur = null; otRender(); }
    else if (!session.tur || session.tur.bitti || boyu || (m && session.tur.mod !== session.modus)) { if (SORU_MODI.has(session.modus)) session.parkTur = null; turBaslat(); session.tur.mod = session.modus; if (boyu) session.tur.boyu = boyu; }
    zeigView('calis');
    window.scrollTo(0, 0);   // ünite / paket / bölüm açılışı sayfanın başından
    zeige();
  }
  // ---- takvim hatırlatıcısı (.ics): her gün seçilen saatte, telefon takvimi bildirir ----
  function hatirlaticiIndir() {
    const saat = ($('#a-saat') && $('#a-saat').value) || '19:00';
    const [hh, mm] = saat.split(':');
    const yarin = new Date(now() + DAY), ymd = `${yarin.getFullYear()}${String(yarin.getMonth() + 1).padStart(2, '0')}${String(yarin.getDate()).padStart(2, '0')}`;
    const url = location.href.split('#')[0].split('?')[0];
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Almanca Tekrar//TR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:almanca-tekrar-gunluk@tekrar', `DTSTAMP:${new Date(now()).toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART:${ymd}T${hh}${mm}00`, 'DURATION:PT10M', 'RRULE:FREQ=DAILY', 'SUMMARY:Almanca: 1 tur (4 dk)',
      `DESCRIPTION:Seri bozulmasın. ${url}`, `URL:${url}`, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Almanca: tek dokunuşla 1 tur, seri bozulmasın', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    herunterladen('almanca-hatirlatici.ics', ics, 'text/calendar;charset=utf-8');
  }

  // Android'de .ics içe aktarılamıyor: Google Takvim'de tek dokunuşla her gün tekrarlayan etkinlik
  function googleTakvim() {
    const saat = ($('#a-saat') && $('#a-saat').value) || '19:00';
    const [hh, mm] = saat.split(':');
    const y = new Date(now() + DAY), ymd = `${y.getFullYear()}${String(y.getMonth() + 1).padStart(2, '0')}${String(y.getDate()).padStart(2, '0')}`;
    const bit = new Date(y.getFullYear(), y.getMonth(), y.getDate(), +hh, +mm + 10);
    const hm2 = `${String(bit.getHours()).padStart(2, '0')}${String(bit.getMinutes()).padStart(2, '0')}`;
    const url = location.href.split('#')[0].split('?')[0];
    const q = new URLSearchParams({ action: 'TEMPLATE', text: 'Almanca: 1 tur (4 dk)', dates: `${ymd}T${hh}${mm}00/${ymd}T${hm2}00`,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin', recur: 'RRULE:FREQ=DAILY', details: `Seri bozulmasın: ${url}?tur=kisa` });
    window.open('https://calendar.google.com/calendar/render?' + q.toString(), '_blank', 'noopener');
  }


  // ================= Konuşma (Sprechen) =================
  // Tek başına konuşma pratiği: (1) shadowing — gerçek cümleyi dinle, hemen ardından yüksek sesle tekrarla, kendini kaydet, karşılaştır;
  // (2) Goethe B1 Sprechen Teil 2 sunum (2 dk, yapı + Redemittel + kayıt); (3) Teil 1 planlama ve Teil 3 geri bildirim kartları.
  // Kayıt tarayıcıda kalır (MediaRecorder), hiçbir yere gönderilmez. Log modus `sprechen`: id `shadow:<öğe>` / `teil2:<konu>` / `teil1` / `teil3`.
  const SP_KONULAR = [
    ['Fast Food – gut oder schlecht?', 'Fast food iyi mi kötü mü?'], ['Leben ohne Auto', 'Arabasız yaşam'], ['Haustiere in der Stadt', 'Şehirde evcil hayvan'],
    ['Online einkaufen', 'İnternetten alışveriş'], ['Fremdsprachen lernen – wie am besten?', 'Yabancı dil en iyi nasıl öğrenilir?'], ['Arbeiten im Ausland', 'Yurt dışında çalışmak'],
    ['Soziale Netzwerke im Alltag', 'Günlük hayatta sosyal ağlar'], ['Bei den Eltern wohnen oder allein?', 'Ailenin yanında mı, tek başına mı?'], ['Urlaub: Meer oder Berge?', 'Tatil: deniz mi dağ mı?'],
    ['Ehrenamt – Zeit für andere', 'Gönüllü çalışma'], ['Müll trennen – wichtig oder nicht?', 'Çöp ayırmak önemli mi?'], ['Sport im Alltag', 'Günlük hayatta spor'],
    ['Frühstück – die wichtigste Mahlzeit?', 'Kahvaltı en önemli öğün mü?'], ['Handy in der Schule', 'Okulda cep telefonu'], ['Geschenke selbst machen oder kaufen?', 'Hediye: el yapımı mı satın mı?'],
  ];
  const SP_PLAN = [
    ['Ein Freund hat Geburtstag: eine Party organisieren', 'Arkadaşın doğum günü: parti düzenleyin (yer, zaman, yemek, kim ne getirir)'],
    ['Ein gemeinsamer Ausflug am Wochenende', 'Hafta sonu ortak gezi (nereye, nasıl gidilecek, ne alınacak)'],
    ['Eine Kollegin ist krank: Besuch und Hilfe planen', 'Hasta bir arkadaşı ziyaret: ne zaman, ne götürülecek, kim arayacak)'],
    ['Ein Abschiedsgeschenk für den Lehrer', 'Öğretmene veda hediyesi (ne, kaç para, kim alacak)'],
    ['Einen Deutsch-Lernabend organisieren', 'Almanca çalışma akşamı düzenleyin (nerede, saat kaçta, ne çalışılacak)'],
  ];
  let spKayit = null;  // { rec, chunks, url, start }
  function spKayitBaslat(btn) {
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Bu tarayıcıda kayıt yok.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const rec = new MediaRecorder(stream), chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        if (spKayit && spKayit.url) URL.revokeObjectURL(spKayit.url);
        spKayit = { url: URL.createObjectURL(blob), sn: Math.round((now() - spKayit.start) / 1000) };
        sprechenRender();
      };
      spKayit = { rec, start: now() };
      rec.start();
      sprechenRender();
    }).catch(() => toast('Mikrofon izni verilmedi.'));
  }
  function spKayitDurdur() { if (spKayit && spKayit.rec && spKayit.rec.state !== 'inactive') spKayit.rec.stop(); }
  function spShadowSatz() {
    // öğrenilmiş öğelerin gerçek cümleleri (kendi çeviri cümleleri önce, sonra metinlerden); son görülenler atlanır
    const ids = Object.keys(S.items).filter(id => kind(id) !== 'p' && gueltig(id + ':x'));
    const gesehen = session.spGesehen = session.spGesehen || new Set();
    for (let i = 0; i < 40 && ids.length; i++) {
      const id = pick(ids), pool = satzPool(id), alle = pool.own.concat(pool.extra);
      const c = alle.filter(x => !gesehen.has(x.de));
      if (c.length) { const x = pick(c); gesehen.add(x.de); return { id, de: x.de, tr: x.tr || '', quelle: x.quelle || '' }; }
    }
    return null;
  }
  const spKalip = typ => (KAL.yazma[typ] || []).map(k => `<li><b>${esc(k.de)}</b> <span class="soluk">${esc(k.tr)}</span></li>`).join('');
  function sprechenRender() {
    aktuell = { typ: 'sprechen' };
    const sp = session.sp = session.sp || { tab: 'shadow' };
    $('#durum-satiri').innerHTML = '';
    const kayitUI = () => {
      const r = spKayit;
      if (r && r.rec && r.rec.state === 'recording') return `<div class="sira"><button class="btn ana" data-act="sp-stop" type="button">⏹ Kaydı bitir</button><span class="soluk sp-rec">● kaydediliyor…</span></div>`;
      return `<div class="sira"><button class="btn ana" data-act="sp-rec" type="button">🎙️ Kendini kaydet</button>${r && r.url ? `<audio controls src="${r.url}"></audio><span class="soluk">${r.sn} sn</span>` : '<span class="soluk">kayıt yalnız bu tarayıcıda kalır</span>'}</div>`;
    };
    const sekme = `<div class="chips sp-sekme">${[['shadow', 'Shadowing'], ['teil2', 'Sunum (Teil 2)'], ['teil1', 'Planlama (Teil 1)'], ['teil3', 'Geri bildirim (Teil 3)']].map(([k, ad]) => `<button class="chip${sp.tab === k ? ' aktif' : ''}" data-sp-tab="${k}" type="button">${ad}</button>`).join('')}</div>`;
    let h = `<div class="tur"><span class="yeni">konuşma</span><span>yüksek sesle · ${esc({ shadow: 'dinle, hemen tekrarla', teil2: '2 dakikalık sunum', teil1: 'birlikte plan yapma', teil3: 'sunuma tepki ve soru' }[sp.tab])}</span></div>${sekme}`;
    if (sp.tab === 'shadow') {
      if (!sp.satz) sp.satz = spShadowSatz();
      const z = sp.satz;
      if (!z) h += '<div class="bos">Önce birkaç kelime öğren; cümleleri buraya gelir.</div>';
      else h += `<div class="sp-kart"><div class="buyuk-kelime sp-cumle">${deHTML(z.de)}</div>${z.tr ? `<div class="soluk">${esc(z.tr)}</div>` : ''}<div class="soluk">${esc(label(z.id))}${z.quelle ? ' · ' + esc(z.quelle) : ''}</div>
        <div class="sira"><button class="btn" data-act="sp-oku" type="button">🔊 Dinle</button><button class="btn" data-act="sp-oku-yavas" type="button">🐢 Yavaş</button><button class="btn mini" data-act="sp-sonraki" type="button">Sıradaki cümle →</button></div>
        <p class="aciklama">Sesi dinlerken ya da hemen ardından aynı anda yüksek sesle söyle (shadowing). 3 kez tekrarla, sonra kendini kaydedip karşılaştır: vurgu, uzun/kısa sesli harfler, cümle melodisi.</p>${kayitUI()}
        <div class="sira"><button class="btn ana" data-act="sp-bitti" type="button">Söyledim ✓</button></div></div>`;
    } else if (sp.tab === 'teil2') {
      if (sp.konuI == null) sp.konuI = Math.floor(Math.random() * SP_KONULAR.length);
      const [de, tr] = SP_KONULAR[sp.konuI];
      const kalan = sp.timerBis ? Math.max(0, Math.round((sp.timerBis - now()) / 1000)) : null;
      h += `<div class="sp-kart"><div class="soru">${esc(de)}</div><div class="soluk">${esc(tr)} · <button class="btn mini" data-act="sp-konu" type="button">başka konu</button></div>
        <ol class="erkl sp-yapi"><li><b>Einleitung:</b> konuyu söyle, yapıyı anlat</li><li><b>Meine Erfahrungen:</b> kendi deneyimin (1–2 örnek)</li><li><b>In meinem Heimatland:</b> Türkiye'de durum</li><li><b>Vor- und Nachteile:</b> en az 2 + 2</li><li><b>Meine Meinung + Schluss:</b> görüşün, teşekkür</li></ol>
        <details class="ceviri"><summary>Redemittel (Teil 2)</summary><ul class="erkl">${spKalip('sprechen2')}</ul></details>
        <div class="sira"><button class="btn" data-act="sp-timer" type="button">⏱ 2 dakika başlat</button>${kalan != null ? `<b class="sp-timer${kalan === 0 ? ' bitti' : ''}">${String(Math.floor(kalan / 60))}:${String(kalan % 60).padStart(2, '0')}</b>` : ''}</div>${kayitUI()}
        <p class="aciklama">Sınavda bu bölüm yaklaşık 3 dakika sürer; hedefin 2 dakika kesintisiz konuşmak. Kaydı dinleyip işaretle:</p>
        <div class="sp-liste">${['5 bölümün hepsi var', 'Cümleler tam, fiil 2. yerde / yan cümlede sonda', 'En az 3 Redemittel kullandım', 'Çok duraklamadım (ähm yok)'].map((t, i) => `<label><input type="checkbox" data-sp-ol="${i}"${sp.ol && sp.ol[i] ? ' checked' : ''}> ${t}</label>`).join('')}</div>
        <div class="sira"><button class="btn ana" data-act="sp-bitti" type="button">Sunumu bitirdim ✓</button></div></div>`;
    } else if (sp.tab === 'teil1') {
      if (sp.planI == null) sp.planI = Math.floor(Math.random() * SP_PLAN.length);
      const [de, tr] = SP_PLAN[sp.planI];
      h += `<div class="sp-kart"><div class="soru">${esc(de)}</div><div class="soluk">${esc(tr)} · <button class="btn mini" data-act="sp-plan" type="button">başka görev</button></div>
        <p class="aciklama">Sınavda partnerinle 4 noktayı birlikte kararlaştırırsın (öneri → tepki → karşı öneri → anlaşma). Burada iki rolü de sen konuş: önce öneri yap, sonra partner gibi cevap ver. Her noktada en az bir öneri + bir tepki.</p>
        <details class="ceviri" open><summary>Redemittel (Teil 1)</summary><ul class="erkl">${spKalip('sprechen1')}</ul></details>${kayitUI()}
        <div class="sira"><button class="btn ana" data-act="sp-bitti" type="button">Planladım ✓</button></div></div>`;
    } else {
      if (sp.konuI == null) sp.konuI = Math.floor(Math.random() * SP_KONULAR.length);
      const [de, tr] = SP_KONULAR[sp.konuI];
      h += `<div class="sp-kart"><div class="soru">Partnerin „${esc(de)}“ sundu.</div><div class="soluk">${esc(tr)} · <button class="btn mini" data-act="sp-konu" type="button">başka konu</button></div>
        <p class="aciklama">Teil 3: sunuma kısa bir tepki ver (ne hoşuna gitti) ve bir soru sor; sonra kendi sunumuna gelen bir soruya cevap ver. 30–45 saniye.</p>
        <details class="ceviri" open><summary>Redemittel (Teil 3)</summary><ul class="erkl">${spKalip('sprechen3')}</ul></details>${kayitUI()}
        <div class="sira"><button class="btn ana" data-act="sp-bitti" type="button">Söyledim ✓</button></div></div>`;
    }
    kart.innerHTML = h;
    tastatur();
    if (sp.timerBis && now() < sp.timerBis) spTimerTik();
  }
  // Teil 2 sayacı: yalnız sayaç metni güncellenir (açılan Redemittel ve kayıt oynatıcısı yerinde kalır);
  // sekme değişince, Söyledim'de ya da bölümden çıkınca durur
  let spTik = null;
  function spTimerTik() {
    if (spTik) clearInterval(spTik);
    spTik = setInterval(() => {
      const s = session.sp, el = document.querySelector('#kart .sp-timer');
      if (!s || !s.timerBis || s.tab !== 'teil2' || !el || $('#v-calis').hidden || session.modus !== 'sprechen') { clearInterval(spTik); spTik = null; return; }
      const k = Math.max(0, Math.round((s.timerBis - now()) / 1000));
      el.textContent = `${Math.floor(k / 60)}:${String(k % 60).padStart(2, '0')}`;
      if (k === 0) { el.classList.add('bitti'); clearInterval(spTik); spTik = null; }
    }, 1000);
  }
  function spBitti() {
    const sp = session.sp || {};
    const id = sp.tab === 'shadow' ? 'shadow:' + ((sp.satz || {}).id || '') : sp.tab === 'teil2' ? 'teil2:' + (sp.konuI ?? '') : sp.tab === 'teil1' ? 'teil1:' + (sp.planI ?? '') : 'teil3:' + (sp.konuI ?? '');
    const frage = sp.tab === 'shadow' ? ((sp.satz || {}).de || '') : sp.tab === 'teil1' ? SP_PLAN[sp.planI || 0][0] : SP_KONULAR[sp.konuI || 0][0];
    const ol = sp.ol ? Object.keys(sp.ol).filter(k => sp.ol[k]).length : 0;
    logEintrag({ modus: 'sprechen', id, item: sp.tab, frage, antwort: spKayit && spKayit.sn ? `kayıt:${spKayit.sn}sn` : '', ergebnis: 'gemacht', loesung: '', notiz: sp.tab === 'teil2' ? `liste:${ol}/4` : '' });
    heuteM('sprechen').n++; xpEkle(sp.tab === 'shadow' ? 5 : 25);
    if (spKayit && spKayit.url) URL.revokeObjectURL(spKayit.url);
    spKayit = null; sp.ol = null; sp.timerBis = null;
    if (sp.tab === 'shadow') sp.satz = spShadowSatz(); else { sp.konuI = null; sp.planI = null; }
    save(); toast(sp.tab === 'shadow' ? '+5 · sıradaki cümle' : '+25 · konuşma kaydedildi (sayı, kayıt değil)');
    sprechenRender();
  }

  // ================= Artikel 60 sn (mini oyun) =================
  // Öğrendiğin isimler (önce vadesi gelen ve zayıf artikel kartları), 60 saniyede olabildiğince çok der/die/das. Kombo, kişisel rekor.
  // Vadesi gelen artikel kartı normal tekrar sayılır (FSRS); vadesi gelmemişte yanlış → kart yarın sorulur, doğru → takvim değişmez.
  const OYUN_SN = 60;
  function oyunHavuz() {
    const t = now();
    const ids = Object.keys(S.items).filter(id => kind(id) === 'n' && byId[id] && !byId[id].plOnly && gueltig(id + ':x') && S.items[id].art && S.items[id].art.S);
    const pr = id => { const c = S.items[id].art; return (c.due <= t ? 0 : 2) + (c.lastG === 1 ? -1 : 0) + Math.random(); };
    return ids.sort((a, b) => pr(a) - pr(b));
  }
  function artOyunRender() {
    const o = session.oyun;
    $('#durum-satiri').innerHTML = ''; $('#hinweis').hidden = true; $('#umlaut').hidden = true;
    otRender(); $('#ot-cubuk').hidden = false; $('#ot-sayi').textContent = '';
    if (!o || o.durum === 'giris') {
      const havuz = oyunHavuz(), rekor = (S.oyun && S.oyun.rekor) || 0;
      session.oyun = { durum: 'giris' };
      aktuell = { typ: 'oyun' };
      kart.innerHTML = `<div class="tur-sonu"><div class="ts-rozet" aria-hidden="true">⏱️</div><div class="ts-baslik">Artikel ${OYUN_SN} sn</div>
        <div class="soluk">Öğrendiğin isimler geliyor: der, die ya da das? Olabildiğince çok, olabildiğince doğru. Tuşlar: <kbd>1</kbd> der · <kbd>2</kbd> die · <kbd>3</kbd> das</div>
        ${havuz.length < 8 ? '<div class="kural">Henüz yeterli isim öğrenmedin (en az 8). Birkaç tur sonra gel.</div>' : `<div class="ts-istat" style="grid-template-columns:repeat(2,1fr)"><div><b>${havuz.length}</b><span>isim</span></div><div><b>${rekor}</b><span>rekor</span></div></div>`}
        <div class="ts-btns">${havuz.length >= 8 ? '<button class="btn ana buyuk" data-act="oyun-basla" type="button">Başla <kbd>Enter</kbd></button>' : ''}<button class="btn buyuk" data-git="ana" type="button">Geri</button></div></div>`;
      return;
    }
    if (o.durum === 'oyun') {
      const id = o.sira[o.i % o.sira.length], n = byId[id];
      aktuell = { typ: 'oyun', id };
      const kalan = Math.max(0, OYUN_SN - (now() - o.start) / 1000);
      kart.innerHTML = `<div class="oyun">
        <div class="oyun-ust"><span>⏱️ <b id="oyun-sn">${Math.ceil(kalan)}</b> sn</span><span>✓ <b>${o.dogru}</b></span><span>${o.kombo >= 3 ? `🔥 ${o.kombo}` : ''}</span></div>
        <div class="oyun-kelime${o.son ? ' son-' + o.son : ''}">${esc(n.lemma)}<span>${esc(kurzTr(n.tr))}</span></div>
        ${o.duzelt ? `<div class="oyun-duzelt">${o.duzelt}</div>` : '<div class="oyun-duzelt"></div>'}
        <div class="art-sec">${['der', 'die', 'das'].map((a, i) => `<button class="btn art-btn art-${a}" data-oyun="${a}" type="button"><kbd>${i + 1}</kbd> ${a}</button>`).join('')}</div></div>`;
      return;
    }
    // sonuç
    const yeniRekor = o.dogru > (o.eskiRekor || 0);
    aktuell = { typ: 'oyun', bitti: true };
    const yanlis = [...new Set(o.yanlis)];
    kart.innerHTML = `<div class="tur-sonu"><div class="ts-rozet ${yeniRekor ? 'altin' : ''}" aria-hidden="true">${yeniRekor ? '🏆' : '⏱️'}</div>
      <div class="ts-baslik">${yeniRekor ? 'Yeni rekor!' : 'Süre doldu'}</div>
      <div class="ts-istat" style="grid-template-columns:repeat(3,1fr)"><div><b>${o.dogru}</b><span>doğru</span></div><div><b>%${o.toplam ? Math.round(o.dogru / o.toplam * 100) : 0}</b><span>doğruluk</span></div><div><b>${o.enKombo}</b><span>en iyi kombo</span></div></div>
      ${yanlis.length ? `<div class="ts-grup"><div class="ts-et">karıştırdıkların</div>${yanlis.slice(0, 10).map(id => `<div class="oyun-ders">${artHTML(byId[id])} <span class="soluk">${esc(kurzTr(byId[id].tr))}</span>${regelHTML(byId[id])}</div>`).join('')}</div>` : ''}
      <div class="ts-btns"><button class="btn ana buyuk" data-act="oyun-basla" type="button">Bir daha <kbd>Enter</kbd></button><button class="btn buyuk" data-git="ana" type="button">Bitir</button></div></div>`;
  }
  function oyunBasla() {
    const sira = oyunHavuz(); if (sira.length < 8) return;
    session.oyun = { durum: 'oyun', sira, i: 0, start: now(), dogru: 0, toplam: 0, kombo: 0, enKombo: 0, yanlis: [], eskiRekor: (S.oyun && S.oyun.rekor) || 0 };
    clearTimers();
    const tik = () => {
      const o = session.oyun; if (!o || o.durum !== 'oyun') return;
      const kalan = OYUN_SN - (now() - o.start) / 1000;
      const el = $('#oyun-sn'); if (el) el.textContent = Math.max(0, Math.ceil(kalan));
      const d = $('#ot-dolu'); if (d) d.style.width = Math.max(0, kalan / OYUN_SN * 100) + '%';
      if (kalan <= 0) { oyunBitir(); return; }
      later(tik, 200);
    };
    artOyunRender(); later(tik, 200);
  }
  function oyunCevap(a) {
    const o = session.oyun; if (!o || o.durum !== 'oyun' || !aktuell || !aktuell.id) return;
    const id = aktuell.id, n = byId[id], ok = a === n.art, t = now();
    if (t - o.start > OYUN_SN * 1000) return oyunBitir();
    if (o.sonT && t - o.sonT < 250) return;  // basılı tutma / çift dokunuş sayılmaz
    const dusunulmus = !o.sonT || t - o.sonT >= 400;
    o.sonT = t;
    o.toplam++; o.i++;
    if (ok) { o.dogru++; o.kombo++; o.enKombo = Math.max(o.enKombo, o.kombo); o.son = 'ok'; o.duzelt = ''; ton(o.kombo % 5 === 0 ? 'seri' : 'tik'); titret(8); }
    else { o.kombo = 0; o.son = 'yanlis'; o.yanlis.push(id); o.duzelt = `${artHTML(n)}`; ton('yanlis'); titret([12, 40, 12]); }
    // artikel hafızası (yan kural): günün ilk cevabı ve (vadeli ya da R < 0,9); < 0,4 sn basış ve basılı tutma yok sayılır
    if (dusunulmus && S.items[id] && S.items[id].art) hafizaYaz({ id, sel: {}, bicim: 'artikel', antwort: a, ziel: n.art + ' ' + n.lemma }, { bicim: 'artikel', tip: 'flas', dogru: ok, sure: t - (o.oncekiT || o.start) }, t, { yan: true, log: false });
    o.oncekiT = t;
    // oyun günlük hedefe / seriye sayılmaz (emek harcamadan dolmasın); yalnız artikel kartlarını ilerletir
    const d = heute(); d.oyun = (d.oyun || 0) + 1; heuteM('artoyun').n++; tageTuret(tag());
    xpEkle(ok ? 2 : 0);
    artOyunRender();
  }
  function oyunBitir() {
    const o = session.oyun; if (!o) return;
    o.durum = 'sonuc';
    S.oyun = S.oyun || {}; S.oyun.rekor = Math.max(S.oyun.rekor || 0, o.dogru); S.oyun.son = o.dogru;
    logEintrag({ modus: 'artoyun', id: 'artikel60', item: 'Artikel 60 sn', frage: '', antwort: '', ergebnis: o.dogru > (o.eskiRekor || 0) ? 'rekor' : 'bitti', loesung: '', notiz: `doğru:${o.dogru} | toplam:${o.toplam} | kombo:${o.enKombo} | yanlış:${[...new Set(o.yanlis)].map(label).join(', ')}` });
    save();
    if (o.dogru > (o.eskiRekor || 0)) { konfeti(); ton('tur'); }
    artOyunRender();
  }

  // sekmeler: Bugün · Kelimeler · İlerleme · Diğer (Zayıflar, Geçmiş, Ayarlar Diğer'in altında; #/zayif, #/ayar adresleri çalışır)
  const SEKME_UST = { zayif: 'diger', ayar: 'diger', kayit: 'diger' };
  function zeigView(v) {
    const sv = SEKME_UST[v] || v;
    altKapat();
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.v === sv ? 'true' : 'false'));
    document.querySelectorAll('.alt-nav button').forEach(b => { if (b.dataset.v === sv) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    document.querySelectorAll('.view').forEach(s => { s.hidden = s.id !== 'v-' + v; });
    document.body.classList.toggle('calis-modu', v === 'calis');
    document.body.dataset.view = v;
    if (v === 'ana') { renderAna(); window.scrollTo(0, 0); }
    if (v === 'liste') renderListe();
    if (v === 'zayif') renderZayif();
    if (v === 'gecmis') renderGecmis();
    if (v === 'ayar') renderAyar();
    if (v === 'diger') renderDiger();
    if (v === 'kayit') renderKayit();
    if (v === 'calis') { const i = $('#cevap'); if (i) i.focus(); }
    else { window.scrollTo(0, 0); toastBosalt(); }
    // Prüfung sayacı yalnız Çalış görünümündeyken çalışır (çıkınca sınav bırakılmış sayılır, boş sınav loglanmaz)
    if (v !== 'calis' && window.Pruefung && Pruefung.reset) Pruefung.reset();
    // adres: #/liste (öğe kimliğiyle çakışmasın: #liste sayfayı o öğeye kaydırıyordu).
    // Bugün dışındaki görünümler geçmişe bir kayıt ekler: Android geri tuşu uygulamayı kapatmaz, Bugün'e döner (popstate)
    try {
      const adres = v === 'ana' ? location.pathname + location.search : '#/' + v;
      if (gecmisPop) history.replaceState(null, '', adres);
      else if (v === 'ana') {
        if (gecmisItildi) { gecmisItildi = false; gecmisYoksay = true; history.back(); }
        else history.replaceState(null, '', adres);
      } else if (gecmisItildi) history.replaceState({ at: 1 }, '', adres);
      else { history.pushState({ at: 1 }, '', adres); gecmisItildi = true; }
    } catch (e) { /* file:// */ }
  }
  var gecmisItildi = false, gecmisYoksay = false, gecmisPop = false;   // var: zeigView açılışta bu satırdan önce de çağrılabilir
  // geri tuşu: alt sayfa açıksa yalnız onu kapatır; tur / bölüm içindeyse bekleyen cevap işlenir, Bugün'e dönülür
  window.addEventListener('popstate', () => {
    if (gecmisYoksay) { gecmisYoksay = false; return; }
    gecmisItildi = false;
    const gorunen = document.body.dataset.view || 'ana';
    if (!$('#alt-sayfa').hidden) {
      altKapat();
      if (gorunen !== 'ana') { try { history.pushState({ at: 1 }, '', '#/' + gorunen); gecmisItildi = true; } catch (e) { /* yok */ } }
      return;
    }
    if (gorunen === 'ana') return;
    if (gorunen === 'calis' && session.modus === 'pruefung' && window.Pruefung && Pruefung.aktifMi && Pruefung.aktifMi() && !confirm('Sınavı yarıda bırak?')) {
      try { history.pushState({ at: 1 }, '', '#/calis'); gecmisItildi = true; } catch (e) { /* yok */ }
      return;
    }
    gecmisPop = true;
    try { if (gorunen === 'calis') { clearTimers(); cikisNotla(); } zeigView('ana'); } finally { gecmisPop = false; }
  });

  // ================= Olaylar =================
  document.addEventListener('click', e => {
    const b = e.target.closest('.tabs button, .alt-nav button, .marke');
    if (!b || !b.dataset.v) return;
    if (b.dataset.v === 'calis') calisBasla(); else zeigView(b.dataset.v);
  });
  // cevaplanmış ama işlenmemiş soru (sonuç paneli açıkken çıkış): sistem notuyla kaydedilir, cevap kaybolmaz
  function cikisNotla() {
    const q = aktuell;
    if (q && q.done && !q.islendi && q.sonuc) { try { cevapIsle(q, q.sonuc, true); } catch (e) { console.warn(e); } }
  }
  // uygulama gizlenirken / kapanırken: bekleyen cevap işlenir ama ekran kalır (dönünce Devam sonraki karta geçer)
  function arkaPlanNotla() {
    const q = aktuell;
    if (q && q.done && !q.islendi && q.sonuc) { cikisNotla(); if (q.islendi) q.arkaPlan = true; }
  }
  // Prüfung: sınav sürerken çıkış onay ister; giriş ekranında sormaz. Sayaç her çıkışta durur
  const pruefungCik = () => {
    if (window.Pruefung && Pruefung.aktifMi && Pruefung.aktifMi() && !confirm('Sınavı yarıda bırak?')) return false;
    if (window.Pruefung) Pruefung.reset();
    return true;
  };
  $('#calis-kapat').addEventListener('click', () => { if (session.modus === 'pruefung' && aktuell && aktuell.typ === 'pruefung' && !pruefungCik()) return; clearTimers(); cikisNotla(); zeigView('ana'); });
  $('#ses-btn').addEventListener('click', () => { S.einst.ses = !sesAcik(); save(); otRender(); if (sesAcik()) ton('dogru'); });
  $('#ana').addEventListener('click', e => {
    const a = e.target.closest('[data-act-ana]'); if (!a) return;
    const act = a.dataset.actAna;
    if (act === 'basla') calisBasla('akis');
    else if (act === 'kisa') calisBasla('blitz', 8);
    else if (act === 'uzun') calisBasla('akis', 25);
    else if (act === 'kur' && kurPrompt) { kurPrompt.prompt(); kurPrompt.userChoice.finally(() => { kurPrompt = null; renderAna(); }); }
    else if (act === 'kur-gizle') { S.einst.kurGizle = true; save(); renderAna(); }
    else if (act === 'guven-tamam') { session.guvenAcik = false; renderAna(); }
    else if (act === 'notlar-tamam' || act === 'notlar-hepsi') { S.ayar4.fbGorulen = feedbackListe().length; save(); if (act === 'notlar-hepsi') zeigView('kayit'); else renderAna(); }
    else if (act === 'token-kopya') { ghSync(true); try { navigator.clipboard.writeText(ghToken()).then(() => toast('Anahtar kopyalandı: ana ekran uygulamasında "Getir"e yapıştır.')); } catch (e) { toast('Kopyalanamadı: Ayarlar → GitHub\'dan al.'); } }
    else if (act === 'getir') {
      const v = ($('#getir-token').value || '').trim(); if (!v) return;
      try { localStorage.setItem('almanca-tekrar-gh', v); } catch (e) { /* yok */ }
      toast('İlerleme GitHub\'dan alınıyor…'); ghLaden().then(() => toast(Object.keys(S.items).length ? 'İlerlemen geldi ✓' : 'Alınamadı: anahtarı ve internet bağlantını kontrol et.', 3500));
    }
  });

  kart.addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#cevap');
    if (e.target.id === 'paket-form') { if (aktuell && aktuell.warte) paketWeiter(); else if (inp && inp.value.trim()) paketPruefen(inp.value); return; }
    if (!inp || !inp.value.trim() || !aktuell || aktuell.done) return;
    auswerten(inp.value);
  });
  kart.addEventListener('mousedown', e => { if (e.target.closest('.klavye.ic')) e.preventDefault(); });
  kart.addEventListener('click', e => {
    const uk = e.target.closest('.klavye.ic button');
    if (uk) { const i = letzteEingabe && kart.contains(letzteEingabe) && letzteEingabe.classList.contains('u-luecke') && !letzteEingabe.disabled ? letzteEingabe : $('#cevap'); if (i && !i.readOnly) { const p = i.selectionStart == null ? i.value.length : i.selectionStart; i.value = i.value.slice(0, p) + uk.dataset.c + i.value.slice(i.selectionEnd == null ? p : i.selectionEnd); i.setSelectionRange(p + 1, p + 1); i.focus(); } return; }
    if (aktuell && aktuell.mc && !aktuell.offen && !aktuell.done && !e.target.closest('[data-act]')) { mcAufdecken(aktuell); return; }
    const fv = e.target.closest('[data-fav]');
    if (fv) { const f = S.kalipFav = S.kalipFav || {}; f[fv.dataset.fav] = !f[fv.dataset.fav]; fv.textContent = f[fv.dataset.fav] ? '✓ yazmada' : '+ yazmaya ekle'; fv.classList.toggle('an', !!f[fv.dataset.fav]); save(); return; }
    const ef = e.target.closest('[data-einfuegen]');
    if (ef) { const ta = $('#metin'); if (ta) { const p0 = ta.selectionStart || ta.value.length; const t = ef.dataset.einfuegen.split(' / ')[0].replace(/ …$|…/g, ''); ta.value = ta.value.slice(0, p0) + t + ' ' + ta.value.slice(p0); ta.focus(); ta.dispatchEvent(new Event('input')); } return; }
    const lw = e.target.closest('.lw');
    const ak = e.target.closest('[data-akt]'); if (ak) { aktAktion(ak.dataset.akt); return; }
    const spy = e.target.closest('[data-sprich-yavas]'); if (spy) { sprich(spy.dataset.sprichYavas, 0.65); return; }
    const usec = e.target.closest('[data-unite-sec]'); if (usec) { session.uniteSecili = usec.dataset.uniteSec; uniteRender(); window.scrollTo(0, 0); return; }
    const ut = e.target.closest('[data-utext]'); if (ut) { uTextAc(ut.dataset.utext); return; }
    const umc = e.target.closest('[data-umc]'); if (umc) { uMc(+umc.dataset.umc); return; }
    const um = e.target.closest('[data-um]'); if (um) { uMatch(um.dataset.um); return; }
    const uo = e.target.closest('[data-uo]'); if (uo) { uOrdnen(+uo.dataset.uo); return; }
    const sp = e.target.closest('[data-sprich]'); if (sp) { sprich(sp.dataset.sprich); return; }
    const ua = e.target.closest('[data-uaufgabe]');
    if (ua) {
      const U = uAktuell(), st = uState(U), a = U.aufgaben.find(x => x.id === ua.dataset.uaufgabe), ta = document.querySelector(`textarea[data-aufgabe="${a.id}"]`), txt = ta.value.trim();
      if (!txt) return;
      (st.texteSchreiben = st.texteSchreiben || {})[a.id] = txt;
      const benutzt = a.woerter.filter(w => txt.toLowerCase().includes(w.replace(/^sich /, '').split(' ').pop().toLowerCase().slice(0, 6)));
      logEintrag({ modus: 'text', id: a.id, item: a.titel, frage: a.de, antwort: txt.replace(/\n+/g, ' ¶ '), ergebnis: 'neu', loesung: '', notiz: `kelime:${txt.split(/\s+/).length} | zorunlu:${benutzt.length}/${a.woerter.length}` });
      // onay düğmenin kendisinde (flash ekranın dışında kalıyordu); ikinci basış çift satır yazmasın
      ua.textContent = 'Kaydedildi ✓ · Claude düzeltir'; ua.disabled = true;
      save(); flash('Kaydedildi. "Sonuçlarıma bak" de, düzelteyim.'); return;
    }
    const fvt = e.target.closest('[data-fvt]');
    if (fvt) { fvTestAntwort(fvt.dataset.fvt); return; }
    if (lw && lw.dataset.fv) { const [id, form, zeit] = lw.dataset.fv.split('|'); const v = vById[id], box = $('#lesen-wort'); document.querySelectorAll('#lesen-text .lw.aktiv').forEach(x => x.classList.remove('aktiv')); lw.classList.add('aktiv'); box.hidden = false; box.innerHTML = `<b>${esc(form)}</b> → <b>${esc(v.anz)}</b> (${esc(v.tr)}) · <b>${esc(zeit)}</b><br>${formen(v).map(f => `${esc(f.et)}: er ${esc(f.soll)}`).join(' · ')}${kalipZeile(id) ? '<br>' + kalipZeile(id) : ''}`; return; }
    if (lw) { lesenWort(lw); return; }
    const ga = e.target.closest('[data-ga]');
    if (ga) { const [i, v] = ga.dataset.ga.split(':'); goetheAntwort(+i, v); return; }
    const ln = e.target.closest('[data-lernen]');
    if (ln) { ogeYarim(ln.dataset.lernen, 'lesen'); save(); ln.replaceWith(Object.assign(document.createElement('span'), { className: 'soluk', textContent: ' eklendi ✓' })); return; }
    const mc = e.target.closest('[data-mc]');
    if (mc) { mcWahl(+mc.dataset.mc); return; }
    if (session.modus === 'gram' && !$('#v-calis').hidden && e.target.closest('[data-g]')) { if (Gramer.klick(e)) return; }
    if (session.modus === 'pruefung' && !$('#v-calis').hidden && e.target.closest('[data-p]')) { if (Pruefung.klick(e)) return; }
    const oy = e.target.closest('[data-oyun]'); if (oy) { oyunCevap(oy.dataset.oyun); return; }
    const spt = e.target.closest('[data-sp-tab]'); if (spt) { session.sp = session.sp || {}; session.sp.tab = spt.dataset.spTab; session.sp.timerBis = null; sprechenRender(); return; }
    const spo = e.target.closest('[data-sp-ol]'); if (spo) { session.sp.ol = session.sp.ol || {}; session.sp.ol[spo.dataset.spOl] = spo.checked; return; }
    const ar = e.target.closest('[data-art]');
    if (ar) { artWahl(ar.dataset.art); return; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'devam') ilerle();
    else if (act === 'itiraz') itirazEt();
    else if (act === 'hatirlat-evet') { const sa = $('#a-saat'); S.ayar4.saat = session.hatirlatSaat || sikSaat(); if (sa) sa.value = S.ayar4.saat; save(); googleTakvim(); const h = $('#ts-hatirlat'); if (h) h.remove(); }
    else if (act === 'hatirlat-hayir') { const h = $('#ts-hatirlat'); if (h) h.remove(); }
    else if (act === 'kur' && kurPrompt) { kurPrompt.prompt(); kurPrompt.userChoice.finally(() => { kurPrompt = null; }); }
    else if (act === 'tanit-devam') tanitDevam();
    else if (act === 'tanit-sor') tanitSor();
    else if (act === 'ek-yeni') ekYeniAl();
    else if (act === 'weiss-nicht' || act === 'goster') auswerten('', true);
    else if (act === 'mc-weiss-nicht') mcWahl(-1, true);
    else if (act === 'mc-ac' && aktuell && aktuell.mc && !aktuell.offen) mcAufdecken(aktuell);
    else if (act === 'paket-weiter') paketWeiter();
    else if (act === 'metin-gonder') metinGonder();
    else if (act === 'claude-gonder') { e.target.disabled = true; claudeGonder().then(ok => { if (!ok) e.target.disabled = false; }); }
    else if (act === 'lesen-baska') lesenRender(true);
    else if (act === 'sp-rec') spKayitBaslat();
    else if (act === 'sp-stop') spKayitDurdur();
    else if (act === 'sp-oku' || act === 'sp-oku-yavas') { const z = session.sp && session.sp.satz; if (z) sprich(z.de, act === 'sp-oku-yavas' ? 0.7 : 0.95); }
    else if (act === 'sp-sonraki') { session.sp.satz = spShadowSatz(); sprechenRender(); }
    else if (act === 'sp-konu') { session.sp.konuI = (session.sp.konuI + 1 + Math.floor(Math.random() * (SP_KONULAR.length - 1))) % SP_KONULAR.length; sprechenRender(); }
    else if (act === 'sp-plan') { session.sp.planI = (session.sp.planI + 1) % SP_PLAN.length; sprechenRender(); }
    else if (act === 'sp-timer') { session.sp.timerBis = now() + 120000; sprechenRender(); }
    else if (act === 'sp-bitti') spBitti();
    else if (act === 'lesen-oku' || act === 'lesen-oku-yavas') { const L = session.lesen; if (L) sprich(L.text.split('\n').slice(0, 12).join('. '), act === 'lesen-oku-yavas' ? 0.75 : 0.95); }
    else if (act === 'fv-test') fvTestStart();
    else if (act === 'u-weiter') uWeiter();
    else if (act === 'u-text-pruef') uTextPruef();
    else if (act === 'u-ordnen-zurueck') uOrdnen('zurueck');
    else if (act === 'u-ordnen-pruef') uOrdnenPruef();
    else if (act === 'fv-weiter') fvWeiter();
    else if (act === 'lesen-fertig') { const L = session.lesen; (S.gelesen = S.gelesen || {})[L.id] = now(); heuteM('lesen').n++; xpEkle(25); logEintrag({ modus: 'lesen', id: L.id, item: L.titel, frage: L.thema, antwort: '', ergebnis: 'gelesen', loesung: '', notiz: L.url }); save(); renderPlan(); lesenRender(true); flash('Okundu ✓ Sıradaki metin.'); }
    else if (act === 'kalip-weiter') { session.kalipSeite = (session.kalipSeite || 0) + 1; kalipRender(); window.scrollTo(0, 0); }
    else if (act === 'kalip-zurueck') { session.kalipSeite = Math.max(0, (session.kalipSeite || 0) - 1); kalipRender(); window.scrollTo(0, 0); }
    else if (act === 'kalip-panel') { const pn = $('#kalip-panel'); pn.hidden = !pn.hidden; }
    else if (act === 'metin-baska') yazmaRender(true);
    else if (act === 'paket-lesen') { aktuell.schritt = 'lesen'; aktuell.gelesen = true; aktuell.schrittStart = now(); paketRender(aktuell); }
    else if (act === 'weiter') zeige();
    else if (act === 'tur-devam') { const b = session.tur && session.tur.boyu; turBaslat(); session.tur.mod = session.modus; if (b) session.tur.boyu = b; zeige(); }
    else if (act === 'oyun-basla') oyunBasla();
  });
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-git]');
    if (g) { zeigView(g.dataset.git); return; }
    const b = e.target.closest('[data-modus]');
    if (!b) return;
    calisBasla(b.dataset.modus);
  });

  // ilk dokunuş: tanıtım kartında ses bundan sonra kendiliğinden çalar (tarayıcı izni)
  const etkilesim = () => { session.etkilesim = true; };
  document.addEventListener('pointerdown', etkilesim, { once: true, capture: true });
  document.addEventListener('keydown', etkilesim, { once: true, capture: true });
  // klavye açıkken görünür yükseklik (yazma kutusu klavyenin üstünde kalsın)
  if (window.visualViewport) { const vv = () => document.documentElement.style.setProperty('--vvh', Math.round(visualViewport.height) + 'px'); visualViewport.addEventListener('resize', vv); vv(); }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#alt-sayfa').hidden) { altKapat(); return; }
    if (!$('#v-ana').hidden && e.key === 'Enter' && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) { e.preventDefault(); calisBasla('akis'); return; }
    if ($('#v-calis').hidden || !aktuell) return;
    const q = aktuell;
    const inInput = /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
    if (q.typ === 'pruefung') { if (e.key === 'Escape') { e.preventDefault(); if (pruefungCik()) { clearTimers(); zeigView('ana'); } } return; }
    if (e.key === 'Escape' && !(q.typ === 'akt' && q.art === 'angebot')) { e.preventDefault(); clearTimers(); cikisNotla(); zeigView('ana'); return; }
    if (q.typ === 'gram') { if (Gramer.tus(e)) return; return; }
    if (q.typ === 'oyun') {
      if (e.repeat) return;
      if (!inInput && /^[123]$/.test(e.key) && session.oyun && session.oyun.durum === 'oyun') { e.preventDefault(); oyunCevap(['der', 'die', 'das'][+e.key - 1]); }
      else if (e.key === 'Enter' && !inInput && (!session.oyun || session.oyun.durum !== 'oyun')) { e.preventDefault(); oyunBasla(); }
      return;
    }
    if (q.typ === 'turSonu') {
      if (e.key === 'Enter' && !inInput) { e.preventDefault(); if (q.teklif) ekYeniAl(); else if (q.sebep === 'leer') zeigView('ana'); else { const b = session.tur && session.tur.boyu; turBaslat(); session.tur.mod = session.modus; if (b) session.tur.boyu = b; zeige(); } }
      return;
    }
    if (q.typ === 'akt') {
      if (e.key !== 'Enter') return;
      if (q.wartet) { e.preventDefault(); zeige(); return; }
      if (e.target.classList && e.target.classList.contains('u-luecke')) { e.preventDefault(); const nx = document.querySelector(`.u-luecke[data-al="${+e.target.dataset.al + 1}"]`); if (nx) nx.focus(); else aktPruef(); return; }
      if (q.art === 'diktat' && e.target.id === 'cevap') { e.preventDefault(); aktPruef(); return; }
      return;
    }
    if (q.typ === 'unite') {
      const st = uState(uAktuell()), sel = st.aktuell;
      if (e.key === 'Enter') {
        if (e.target.classList && e.target.classList.contains('u-luecke')) { e.preventDefault(); const nx = document.querySelector(`.u-luecke[data-ul="${+e.target.dataset.ul + 1}"]`); if (nx) nx.focus(); else uTextPruef(); return; }
        if (e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (q.wartet || (sel && sel.stufe === 'intro') || (sel && sel.art === 'match' && Object.keys(sel.paare || {}).length === sel.ids.length)) { uWeiter(); return; }
        if (e.target.id === 'cevap') { uEingabe(); return; }
        return;
      }
      if (sel && sel.art === 'item' && ['mc', 'mcrev', 'art'].includes(sel.stufe) && sel.cevap == null && !inInput && /^[1-4]$/.test(e.key) && +e.key <= sel.opts.length) { e.preventDefault(); uMc(+e.key - 1); return; }
      return;
    }
    if (q.typ === 'lesen' && session.modus === 'fiilmetin' && e.key === 'Enter' && document.querySelector('[data-act="fv-weiter"]')) { e.preventDefault(); fvWeiter(); return; }
    if (q.typ === 'lesen' && session.modus === 'fiilmetin' && /^[1-4]$/.test(e.key)) { const b = document.querySelectorAll('[data-fvt]:not([disabled])')[+e.key - 1]; if (b) { e.preventDefault(); fvTestAntwort(b.dataset.fvt); return; } }
    if (q.typ === 'yazma' || q.typ === 'lesen' || q.typ === 'kalip') return;
    if (q.typ === 'leer' && e.key === 'Enter' && !inInput) { e.preventDefault(); if (q.teklif) ekYeniAl(); return; }
    if (q.typ === 'tanit') { if (e.key === 'Enter' && !inInput) { e.preventDefault(); tanitDevam(); } return; }
    if (q.typ === 'paket') {
      if (e.key === 'Enter' && (!inInput || q.warte)) { e.preventDefault(); paketWeiter(); }
      return;
    }
    // cevaplandı: Enter = Devam (doğruda zaten kendiliğinden geçer); not tuşları yok, not sistemin
    if (q.done && (!q.islendi || q.arkaPlan)) { if (e.key === 'Enter') { e.preventDefault(); ilerle(); } return; }
    if (q.mc) {
      if (inInput) return;
      if (/^[1-6]$/.test(e.key) && +e.key <= q.optionen.length) { e.preventDefault(); mcWahl(+e.key - 1); }
      else if (e.key === '0') { e.preventDefault(); mcWahl(-1, true); }
      else if (e.key === ' ' && !q.offen) { e.preventDefault(); mcAufdecken(q); }
      return;
    }
    if (q.artFrage) {
      const a = { 1: 'der', 2: 'die', 3: 'das' }[e.key]; if (a) { e.preventDefault(); artWahl(a); }
      return;
    }
  });

  // ä kısayolları
  const KURZ = { 'a:': 'ä', 'o:': 'ö', 'u:': 'ü', 's:': 'ß', 'A:': 'Ä', 'O:': 'Ö', 'U:': 'Ü' };
  kart.addEventListener('input', e => {
    const i = e.target; if (i.id !== 'cevap' && !(i.classList && i.classList.contains('u-luecke'))) return;
    const pos = i.selectionStart, two = i.value.slice(pos - 2, pos);
    if (KURZ[two]) { i.value = i.value.slice(0, pos - 2) + KURZ[two] + i.value.slice(pos); i.setSelectionRange(pos - 1, pos - 1); }
  });
  $('#umlaut').addEventListener('mousedown', e => e.preventDefault());
  $('#umlaut').addEventListener('click', e => {
    const b = e.target.closest('button'); const i = letzteEingabe && document.body.contains(letzteEingabe) ? letzteEingabe : $('#cevap');
    if (!b || !i || i.disabled) return;
    const p = i.selectionStart; i.value = i.value.slice(0, p) + b.dataset.c + i.value.slice(i.selectionEnd); i.setSelectionRange(p + 1, p + 1); i.focus();
  });

  $('#ara').addEventListener('input', renderListe);
  $('#tur').addEventListener('change', renderListe);
  $('#seviye-sekme').addEventListener('click', e => { const b = e.target.closest('[data-sekme]'); if (!b) return; session.listeSekme = b.dataset.sekme; renderListe(); });
  // Kelimeler / Zayıflar satırı → alt sayfa
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-oge]'); if (o) { ogeSayfa(o.dataset.oge); return; }
    if (e.target.closest('[data-alt-kapat]') || e.target.id === 'alt-sayfa') altKapat();
  });  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    ogeYarim(b.dataset.add, 'liste');   // yeni sıranın başına
    save();
    if (!$('#alt-sayfa').hidden) ogeSayfa(b.dataset.add);
    if (!$('#v-liste').hidden) renderListe();
  });
  function setModus(m) {
    if (!MODI[m]) m = 'akis';
    session.modus = m;
    if (m === 'artoyun') session.oyun = null;
    $('#odak').value = m;
    themaUI();
    try { localStorage.setItem('almanca-tekrar-bolum', JSON.stringify({ m, tag: tag() })); } catch (e) { /* yok */ }
    renderHedef();
  }
  function themaUI() {
    const sel = $('#thema-sec');
    if (!sel) return;
    sel.hidden = session.modus !== 'thema';
    if (sel.hidden) return;
    sel.innerHTML = THEMEN.map(t => { const n = t.items.filter(id => S.items[id]).length; return `<option value="${t.id}">${esc(t.tr)} · ${esc(t.de)} (${n}/${t.items.length})</option>`; }).join('');
    sel.value = themaId();
  }
  $('#thema-sec').addEventListener('change', e => { S.einst.thema = e.target.value; save(); session.tur = null; themaUI(); zeige(); });
  $('#zayif-basla').addEventListener('click', () => { setModus('zayif'); zeigView('calis'); zeige(); });
  $('#odak').addEventListener('change', e => { setModus(e.target.value); zeige(); });

  $('#v-ayar').addEventListener('click', e => {
    const b = e.target.closest('[data-ayar] button'); if (!b) return;
    const ad = b.parentElement.dataset.ayar, v = +b.dataset.val;
    if (ad === 'ret') { S.einst.ret = v || 0.85; S.einst.retSecildi = true; }
    else if (ad === 'yeni') { S.ayar4.yeniGunluk = Math.max(2, Math.min(10, v || 6)); S.ayar4.secildi = true; }
    else if (ad === 'hedef') { S.ayar4.turHedef = Math.max(1, Math.min(8, v || 2)); S.ayar4.secildi = true; }
    save(); renderAyar();
  });
  $('#a-saat').addEventListener('change', e => {
    const m = /^(\d{1,2})[:.]?(\d{2})$/.exec(e.target.value.trim());
    if (m && +m[1] < 24 && +m[2] < 60) { S.ayar4.saat = String(+m[1]).padStart(2, '0') + ':' + m[2]; save(); }
    e.target.value = S.ayar4.saat || sikSaat();
  });
  $('#v-ayar').addEventListener('change', e => {
    const id = e.target.id || '';
    const m = id.slice(2);
    void m;
    if (id === 'a-turhedef') S.ayar4.turHedef = Math.max(1, Math.min(8, +e.target.value || 3));
    else if (id === 'a-yeni') S.ayar4.yeniGunluk = Math.max(2, Math.min(10, +e.target.value || 6));
    else if (id === 'a-ret') { S.einst.ret = +e.target.value || 0.85; S.einst.retSecildi = true; }
    else if (id === 'a-tur') { S.einst.tur = +e.target.value; otRender(); }
    else if (id === 'a-ses') S.einst.ses = !!e.target.checked;
    else if (id === 'a-titresim') S.einst.titresim = !!e.target.checked;
    else if (id === 'a-saat') return;
    else return;
    save(); renderHedef(); renderPlan();
  });
  $('#klasor').addEventListener('click', ordnerVerbinden);
  $('#a-hatirlat').addEventListener('click', hatirlaticiIndir);
  $('#a-gtakvim').addEventListener('click', googleTakvim);
  $('#gh-token').value = ghToken() ? '••••••••' : '';
  if (ghToken()) ghDurum('Anahtar kayıtlı: cevaplar GitHub\'a yazılıyor.');
  $('#gh-kaydet').addEventListener('click', async () => {
    const v = $('#gh-token').value.trim();
    if (!v || v.startsWith('•')) return;
    try { localStorage.setItem('almanca-tekrar-gh', v); } catch (e) { /* yok */ }
    $('#gh-token').value = '••••••••';
    ghDurum('Deneniyor…');
    try { await ghApi(''); S.ghPending = S.log.slice(); save(); await ghSync(true); }
    catch (e) { ghDurum('Anahtar çalışmadı: ' + e.message); }
  });
  $('#gh-simdi').addEventListener('click', () => ghSync(true));
  $('#v-ayar').addEventListener('click', e => {
    const b = e.target.closest('[data-unite-ac]'); if (!b) return;
    const U = UNITEN.find(u => u.id === b.dataset.uniteAc); if (!U) return;
    const st = uState(U);
    st.aktiv = !uOffen(U);   // kalıcı (uOffen bunu okur); U nesnesine dokunulmaz
    save(); renderAyar(); renderPlan(); if (!$('#v-ana').hidden) renderAna();
    toast(st.aktiv ? `${U.titel}: açıldı, yeni kelimeleri Çalış'ta gelir.` : `${U.titel}: kapatıldı.`);
  });
  $('#gh-claude').addEventListener('click', e => { e.target.disabled = true; claudeGonder().then(() => { e.target.disabled = false; }); });
  // A1 + modal fiiller: bilinen say (öğrencinin bilmediği dört kelime hariç). İsimlerde yalnız artikel sorulur,
  // ama bariz artikeller atlanır: -e / -ung / -heit / -keit / -ion … kuralına uyan die'ler, -in ile biten kadın isimleri,
  // erkek meslek ve aile isimleri (der), das Bier / das Wasser. Fiilde çekim (1 aya yayılı). Tekrar basılırsa düzeltir.
  const A1_HARIC = new Set(['Bahnsteig', 'Gleis', 'Postleitzahl', 'Stadtplan']);
  const A1_DER_PERSON = new Set(['Arzt', 'Chef', 'Kellner', 'Kollege', 'Lehrer', 'Schüler', 'Student', 'Verkäufer', 'Mann', 'Herr', 'Junge', 'Vater', 'Bruder', 'Sohn', 'Opa', 'Freund', 'Nachbar', 'Türke']);
  function artikelBariz(n) {
    if (n.regel && n.regel[1] === n.art && ['e', 'ung', 'heit', 'keit', 'schaft', 'ion', 'tät', 'ei'].includes(n.regel[0])) return true;
    if (n.art === 'die' && /in$/.test(n.lemma) && NL.some(m => m.art === 'der' && m.lemma + 'in' === n.lemma.replace(/ä/, 'a'))) return true;
    if (n.art === 'die' && /in$/.test(n.lemma) && NL.some(m => m.art === 'der' && n.lemma.startsWith(m.lemma.replace(/e$/, '')))) return true;
    if (n.art === 'der' && A1_DER_PERSON.has(n.lemma)) return true;
    return n.art === 'das' && /^(Bier|Wasser)$/.test(n.lemma);
  }
  $('#a1-bekannt').addEventListener('click', () => {
    const t = now();
    const modal = /^(können|müssen|dürfen|sollen|wollen|mögen|möchten)$/;
    const ids = NL.filter(n => n.tier === 1).map(n => n.id).concat(VERBEN.filter(v => v.tier === 1 || modal.test(v.inf)).map(v => v.id), WOERTER.filter(w => w.tier === 1).map(w => w.id));
    let n = 0, art = 0, bariz = 0, stamm = 0;
    ids.forEach((id, i) => {
      const k = kind(id);
      if (k === 'n' && A1_HARIC.has(byId[id].lemma)) {
        // daha önce yanlışlıkla bilinen sayıldıysa geri al: normal yeni kelime olarak gelsin
        if (S.items[id] && S.items[id].quelle === 'a1' && !(S.items[id].m && S.items[id].m.S)) delete S.items[id];
        return;
      }
      if (S.items[id] && S.items[id].quelle !== 'a1') { S.items[id].a1 = true; return; }
      if (!S.items[id]) { S.items[id] = { seit: t, bekannt: true, a1: true, quelle: 'a1' }; n++; }
      // isim: yalnız artikel hafızası (bariz artikeller atlanır), 2 haftaya yayılı vade
      if (k === 'n' && !byId[id].plOnly) {
        const it = S.items[id];
        if (artikelBariz(byId[id])) bariz++;
        else { if (!it.art) it.art = { S: 2, D: 5, last: t, due: t + (art % 14) * DAY + (i % 24) * 3600000, reps: 1, lapses: 0, lastG: 3 }; art++; }
      }
      // düzensiz fiil: kök (formları görüldü sayılır; yeni kök sırayla açılır)
      const v = vById[id];
      if (k === 'v' && v.stark && v.frmDrill) { S.kok = S.kok || {}; if (!S.kok[v.base]) { S.kok[v.base] = { ornek: id, yeni: 1 }; stamm++; } (S.formGesehen = S.formGesehen || {})[id] = true; }
    });
    save();
    logEintrag({ modus: 'a1', id: '', item: '', frage: '', antwort: '', ergebnis: 'bekannt', loesung: '', notiz: `${n} öğe bilinen sayıldı; ${art} artikel sorulacak, ${bariz} bariz artikel atlandı` });
    $('#a1-durum').textContent = `${n} öğe bilinen sayıldı. ${art} ismin artikeli 2 haftaya yayılarak sorulacak, ${bariz} bariz artikel atlandı, ${stamm} düzensiz fiilin kökü sıraya girdi. Bahnsteig, Gleis, Postleitzahl, Stadtplan normal öğrenilecek.`;
  });
  $('#gh-yukle').addEventListener('click', ghLaden);
  $('#log-indir').addEventListener('click', () => herunterladen('log.csv', '﻿' + CSV_KOPF + '\n' + S.log.map(csvZeile).join('\n') + '\n', 'text/csv;charset=utf-8'));
  $('#yedek-indir').addEventListener('click', () => herunterladen('zustand.json', JSON.stringify(S), 'application/json'));
  $('#yedek-yukle').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { S = normalize(JSON.parse(await f.text())); kernAc(); save(); renderAyar(); renderHedef(); zeige(); }
    catch (err) { $('#klasor-durum').textContent = 'Dosya okunamadı: ' + err.message; }
  });
  $('#sifirla').addEventListener('click', () => { $('#sifirla-onay').hidden = false; });
  $('#sifirla-hayir').addEventListener('click', () => { $('#sifirla-onay').hidden = true; });
  $('#sifirla-evet').addEventListener('click', () => {
    S = normalize({}); save(); $('#sifirla-onay').hidden = true; renderHedef(); zeige();
  });

  // ================= Başlat =================
  // Gramer bölümü (js/gramer.js): uygulama yardımcıları
  (function gramerBagla() {
    const labelIdx = {};
    try { NL.forEach(n => { labelIdx[label(n.id)] = n.id; }); VERBEN.forEach(v => { labelIdx[v.anz || v.inf] = v.id; if (v.inf) labelIdx[v.inf] = labelIdx[v.inf] || v.id; }); WOERTER.forEach(w => { labelIdx[w.de] = w.id; }); } catch (e) { console.warn(e); }
    Gramer.init({
      S: () => S, save, logEintrag, xpEkle, heuteM, toast, sprich, esc, deHTML, now, tag, FSRS, G, later, konfeti, tastatur,
      kart: () => kart, ret: () => S.einst.ret, durum: t => { const d = $('#durum-satiri'); if (d) d.innerHTML = t; },
      fx: u => fxCevap(u), soruSayisi: () => session.q, odakla: () => !!(window.matchMedia && matchMedia('(hover: hover)').matches),
      aktifKapitel: () => { const U = uAktivler()[0]; return U && U.kapitel ? 'K' + U.kapitel : null; },
      birikme: () => faellig().length > 1.2 * kota().kap,
      kelimeAnlam: w => { const id = labelIdx[w]; return id ? trOf(id) : ''; }, kelimeGesehen: w => { const id = labelIdx[w]; return !id || !!S.items[id]; },
      sayac: urteil => { const d = heute(); d.n++; d[urteil] = (d[urteil] || 0) + 1; session.q++; gunSayac(tageTuret(tag())); if (session.tur && !session.tur.bitti) { session.tur.n++; session.tur[urteil]++; otRender(); } },
      leech: (id, ad) => logEintrag({ modus: 'leech', id, item: ad, frage: '', antwort: '', ergebnis: 'takiliyor', loesung: '', notiz: 'gramer' }),
    });
  })();
  (function pruefungBagla() {
    Pruefung.init({ S: () => S, save, logEintrag, xpEkle, heuteM, toast, sprich, esc, now, tag, zeitStr, konfeti, tastatur, kart: () => kart,
      durum: t => { const d = $('#durum-satiri'); if (d) d.innerHTML = t; }, kalipHTML: a => yazmaKalipHTML(a), kalipListe: typ => spKalip(typ), senkron: () => ghSync(true) });
  })();
  (function willkommen() {
    // ara verdiysen: önce birikmişler, kısa tur önerisi
    const tage = Object.keys(S.tage).filter(k => S.tage[k].n > 0).sort();
    const letzter = tage.filter(k => k < tag()).pop();
    if (letzter) {
      const pause = Math.round((new Date(tag()) - new Date(letzter)) / DAY);
      if (pause >= 2) { session.donusBonus = true; mesajEkle('Tekrar hoş geldin! İlk tur çift puan; en iyi hatırladıkların önce gelir.'); }
    }
  })();
  if (!S.retGoc) { if (!S.einst.retSecildi && (S.einst.ret == null || S.einst.ret === 0.9)) S.einst.ret = 0.85; S.retGoc = true; save(); }
  // v5 göçü retGoc'tan SONRA (vadeler son hedef hatırlamayla). Spesifikasyon §8 sırası: ilk göçte, anahtar varsa önce GitHub'daki
  // durum çekilip birleştirilir (en çok 5 sn), göç birleşmiş durumda çalışır: başka cihazın henüz çekilmemiş cevapları göçe girer,
  // uzak zaten göçmüşse ikinci 'akt;goc4' satırı yazılmaz. Çekme zaman aşımına uğrarsa göç yerelde çalışır; geç gelen birleştirme
  // kernAc'i yeniden çalıştırır ve v3Yetis göçün görmediği kartları (kartenV3'e göre) uygular.
  let ghCekZaman = 0, acilisBitti = false;
  const ilkGocBekle = !S.goc4 && !!ghToken() && (Object.keys(S.karten).length > 0 || Object.keys(S.items).length > 0);
  if (ilkGocBekle) {
    ghCekZaman = now();
    { const d = $('#durum-satiri'); if (d) d.textContent = 'GitHub\'daki ilerleme alınıyor…'; }
    // bekleme görünür olsun (Bugün ekranı henüz çizilmedi; alt gezinti de beklesin)
    { const a = $('#ana'); if (a) a.innerHTML = '<div class="ana-kart"><div class="buyuk">İlerlemen getiriliyor…</div><div class="soluk">GitHub\'daki kayıt bu cihazdakiyle birleştiriliyor (en çok birkaç saniye).</div></div>'; }
    { const n = document.querySelector('.alt-nav'); if (n) n.style.pointerEvents = 'none'; }
    const cek = ghCek(true).catch(() => false);
    Promise.race([cek, new Promise(r => setTimeout(r, 5000))]).then(baslat, baslat);
    cek.then(d => { if (d && acilisBitti && !$('#v-ana').hidden) renderAna(); });   // zaman aşımından sonra gelirse ekranı yenile
  } else baslat();
  function baslat() {
  if (acilisBitti) return; acilisBitti = true;
  { const d = $('#durum-satiri'); if (d && /alınıyor…$/.test(d.textContent)) d.textContent = ''; }
  { const n = document.querySelector('.alt-nav'); if (n) n.style.pointerEvents = ''; }
  kernAc(); save();
  seriBakim();
  if (session.donduruldu) mesajEkle(`❄️ Seri dondurucu kullanıldı: kaçırdığın ${session.donduruldu} gün serini bozmadı.`);
  const start = (location.hash || '').replace(/^#\/?/, '');
  zeigView(['zayif', 'liste', 'gecmis', 'ayar', 'diger', 'kayit'].includes(start) ? start : 'ana');
  // başka cihazda çalışıldıysa: açılışta ve uygulamaya dönünce GitHub'daki ilerlemeyle birleştir
  const ghCekVeCiz = () => {
    if (!ghToken() || now() - ghCekZaman < 60000) return;
    ghCekZaman = now();
    ghCek(true).then(d => { if (d && !$('#v-ana').hidden) renderAna(); });
  };
  ghCekVeCiz();
  // gün değişimi: uygulama arka planda açık kalıp ertesi gün dönülünce de seri / yayma / Bugün ekranı yenilenir
  let sonGun = tag();
  function gunKontrol() {
    if (tag() === sonGun) return;
    sonGun = tag();
    seriBakim();
    // sürmekte olan tur (gece yarısını geçen) bozulmaz: tanıtım sırası ve kuyruk kalır, tur sonunda log satırı yazılır
    if (session.tur && (session.tur.bitti || !session.tur.n)) session.tur = null;
    if (!$('#v-ana').hidden) renderAna(); else renderHedef();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { gunKontrol(); ghCekVeCiz(); } });
  window.addEventListener('focus', gunKontrol);
  window.addEventListener('pageshow', gunKontrol);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => console.warn('service worker', e)));
    let sonKontrol = 0, yeniSurum = false;
    // ilk kurulumda (sayfayı henüz SW yönetmiyorken) gelen ilk controllerchange güncelleme değildir; sonrakilerin hepsi güncellemedir
    let ilkKurulum = !navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (ilkKurulum) { ilkKurulum = false; return; }
      yeniSurum = true;
      yenileGoster();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { save(); return; }
      if (yeniSurum && !$('#v-ana').hidden && !session.tur) { location.reload(); return; }
      // sayfa görünür olunca yeni sürüm var mı bak (en çok dakikada bir)
      if (now() - sonKontrol > 60000) { sonKontrol = now(); navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {}); }
    });
  }
  // ana ekran kısayolları: ?tur=kisa (klavyesiz 8), ?tur=artikel (Artikel 60 sn)
  try {
    const sp = new URLSearchParams(location.search), tp = sp.get('tur');
    if (tp) { sp.delete('tur'); history.replaceState(null, '', location.pathname + (sp.toString() ? '?' + sp : '') + location.hash); }
    if (tp === 'kisa') setTimeout(() => calisBasla('blitz', 8), 0); else if (tp === 'artikel') setTimeout(() => calisBasla('artoyun'), 0);
  } catch (e) { /* yok */ }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {}); } catch (e) { /* yok */ }
  // Kapanmış ünite: ünitede çalıştığın (basamağa giren) kelimeler tekrar sistemine; çalışmadıkların alınmaz (B1 listesindeyse sırası gelince gelir)
  (function uniteSchliessen() {
    const t = now();
    UNITEN.forEach(U => {
      const st = S.unite && S.unite[U.id];
      if (!uZu(U) || !st || st.uebernommen) return;
      const gearbeitet = U.items.filter(it => st.idx[it.id] != null || st.done[it.id]);
      const alinan = [], ohne = [];
      gearbeitet.forEach(it => {
        const id = uMainId(it);
        if (!id) { ohne.push(it.de); return; }
        if (ogeYarim(id, 'unite')) alinan.push(label(id));
      });
      st.uebernommen = true; st.ohne = ohne; st.alinan = alinan;
      logEintrag({ modus: 'unite', id: U.id + ':ende', item: U.titel, frage: 'ünite kapandı', antwort: alinan.join(', '), ergebnis: 'gelesen', loesung: '', notiz: `alındı:${alinan.length} listede yok:${ohne.length}` });
      mesajEkle(`Ünite kapandı: çalıştığın ${alinan.length} kelime tekrar listene eklendi (${alinan.slice(0, 6).join(', ')}${alinan.length > 6 ? ' …' : ''}). Çalışmadıkların eklenmedi.`);
      save();
    });
  })();
  (function startModus() {
    // aynı gün içinde son bölüm; yeni günde planın ilk bitmemiş adımı
    let m = null;
    try { const x = JSON.parse(localStorage.getItem('almanca-tekrar-bolum') || 'null'); if (x && x.tag === tag()) m = x.m; } catch (e) { /* eski biçim */ }
    if (!S.akisEingefuehrt) { S.akisEingefuehrt = true; m = null; save(); }  // tek akışa geçiş: ilk açılışta Çalış
    setModus(m && MODI[m] ? m : 'akis');
  })();
  // açılışta soru yalnız Çalış görünürken seçilir (gizli zeige() tur hakkı yemesin)
  if (!$('#v-calis').hidden) zeige();
  ordnerLaden();
  window.__tekrar = { Kern: window.Kern, CODE_SURUM, get S() { return S; }, get aktuell() { return aktuell; }, starte: (m, boyu) => calisBasla(m, boyu), get tur() { return session.tur; }, get ot() { return session.ot; },
    saat: ms => { saatOfs += +ms || 0; return now(); }, kota, UNITE_IT: uById, satzPool, kontextSaetze, formIdx, faellig, gueltig, wortLuecke, uMainId, uKand, UNITEN, VERBEN, byId, wById, pById, G,
    toast, konfeti, mesajEkle,
    // test: metin etkinliğini (art 'luecke' | 'diktat') doğrudan aç; adaylar = hafızası olan öğeler
    metinAc: art => { const ad = Object.keys(S.items).filter(id => S.items[id].m && S.items[id].m.S && kind(id) !== 'p').slice(0, 40); const q = metinKur({ tur: 'metin', adaylar: ad, diktat: art === 'diktat' }); if (!q || (art && q.art !== art)) return false; aktuell = q; render(q); return true; },
    _testOrdner: h => { ordner = h; return dateiSchreiben(true); } };
  }
})();
