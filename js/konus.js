// Konuşma + telaffuz (window.Konus, 6.11). Yazıya dökme (ASR) YOK: ölçüm yalnız ses enerjisinden (Web Audio), not yalnız dinleme sorusunda.
// 1) Turda ses yuvası (sözleşme S2): Konus.turSorusu(api, sel) → soru | null. soru = { alt: 'soyle' | 'hoer', id, render(kart, bitti), tus(e), klick(e), kes() };
//    uygulama `soru.bitti = fn` de verebilir (ya da api.bitti). Gramer deseniyle eş adlar: Konus.turRender(kart, soru, bitti) / turTus(e) / turKlick(e).
//    soyle: bildiği kelimenin (m.bm ≥ 2) Türkçe cümlesi → kayıt (MediaRecorder, kendiliğinden başlar, sessizlikte biter) → doğrusu (TTS, ayardaki hız) → kendi kaydın → doğrusu;
//      not yok, hafızaya yazmaz. Log `sprechen;soyle:<öğe>` ergebnis `gemacht`, notiz `gecikme:Nsn | süre:Nsn | konuşma:Nsn | kaynak:tur`; bitti({ urteil: 'gemacht' }) dinleme bitince.
//      Mikrofon yok / izin reddedildi / "Şimdi sesli olmaz" → aynı kartta hoer sorusuna geçer (bitti richtig/falsch); o da yoksa bitti({ urteil: 'atla' }) (yuva atlanır).
//    hoer: minimal çift / vurgu (daten/minimalpaare.js): TTS iki kelimeden birini okur (her soruda başka Almanca ses), hangisi duyuldu; sistem notlar → bitti richtig/falsch.
//      S.hoer[kontrast] = { d, y, t }; log `hoer;hoer:<kontrast>` notiz `cift:a/b | ses:<ad> | dinleme:N | sek:N | kaynak:tur|bolum`.
// 2) Konuşma bölümü (app.js sprechenRender → Konus.render()): Kalıplar (Redemittel drili: Türkçe → 3 sn içinde sesli) · Söyle · Shadowing (dinledikten sonra cümle gizlenir) ·
//    Teil 2 (4/3/2: aynı konu 3:00 / 2:15 / 1:30 ya da 60 / 45 / 30 sn, önce 1 dk plan) · Teil 1 · Teil 3 · Dinle (ayırt et) · İlerleme (haftalık tablo, kulak haritası, kayıt arşivi).
//    Ölçüm: gecikme (kayıt başı → ilk ses), ses-zamanı oranı (konuşulan / ilk sesten son sese), ≥ 1 sn duraklama sayısı, en uzun kesintisiz konuşma (0,5 sn'den kısa boşluklar sayılmaz).
//    Kayıt arşivi IndexedDB `almanca-tekrar-ses` (yalnız bu tarayıcıda; GitHub'a gitmez): Teil 1/2/3 kayıtları, aynı konunun önceki kaydıyla karşılaştırma.
// 3) Bugün kartı: Konus.anaKart() → "2 dk konuş" (gün gün kalıplar / Teil 2 kısa / shadowing; bugünkü konuşma süresi ≥ 120 sn → ✓).
// Durum: S.konus = { son: {cümle: ts}, oge: {id: ts}, rm: {anahtar: {n, g, t, ok}}, hoerSon: [] }, S.hoer (yukarıda). Kern.birlestir'de özel kural yok (yerel kazanır).
(function (root) {
  'use strict';
  let A = {}, B = { sekme: null };   // A: uygulama yardımcıları (init + turSorusu'nun verdiği), B: bölüm durumu (oturumluk)
  const DAY = 86400000, HEDEF_SN = 120;
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = s => A.esc ? A.esc(s == null ? '' : String(s)) : String(s == null ? '' : s).replace(/[&<>"]/g, c => ESC[c]);
  const deH = s => A.deHTML ? A.deHTML(String(s == null ? '' : s)) : esc(s);
  const now = () => (A.now ? A.now() : Date.now());
  const gunOf = t => (A.tag ? A.tag(t) : new Date(t).toISOString().slice(0, 10));
  const St = () => (typeof A.S === 'function' ? A.S() : A.S || null);
  const kaydet = () => { try { if (A.save) A.save(); } catch (e) { /* yok */ } };
  const log = e => { try { if (A.logEintrag) A.logEintrag(e); } catch (err) { console.warn('Konus log', err); } };
  const xp = n => { try { if (A.xpEkle) A.xpEkle(n); } catch (e) { /* yok */ } };
  const say = () => { try { if (A.heuteM) A.heuteM('sprechen').n++; } catch (e) { /* yok */ } };
  const sn = ms => (Math.max(0, ms || 0) / 1000).toFixed(1);              // log: "1.4"
  const snTR = ms => sn(ms).replace('.', ',');                             // ekran: "1,4"
  const kelimeSay = s => String(s || '').split(/\s+/).filter(Boolean).length;
  const bekle = ms => new Promise(r => setTimeout(r, ms));
  const lab = id => { try { return A.label ? A.label(id) : id; } catch (e) { return id; } };
  const gorunur = el => !!(el && el.isConnected && el.offsetParent !== null);
  const kn = () => {
    const S = St(); if (!S) return { son: {}, oge: {}, rm: {}, hoerSon: [] };
    const k = S.konus = S.konus && typeof S.konus === 'object' ? S.konus : {};
    k.son = k.son || {}; k.oge = k.oge || {}; k.rm = k.rm || {}; k.hoerSon = k.hoerSon || [];
    return k;
  };
  const hoerSt = () => { const S = St(); if (!S) return {}; return (S.hoer = S.hoer && typeof S.hoer === 'object' ? S.hoer : {}); };

  // ================= Ses (TTS) =================
  const ttsVar = () => !!(root.speechSynthesis && root.SpeechSynthesisUtterance);
  const sesler = () => { try { return ttsVar() ? speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang)) : []; } catch (e) { return []; } };
  // ayardaki hız (Dinleme ajanının ayarı: S.einst.sesHiz; eski adlar da okunur), yoksa 0,9
  const hiz = () => { const e = (St() || {}).einst || {}; const h = +(e.sesHiz != null ? e.sesHiz : e.sesHizi != null ? e.sesHizi : e.hiz); return h >= 0.5 && h <= 1.5 ? h : 0.9; };
  const ttsMetin = s => String(s || '').replace(/…/g, ' ').replace(/\s\/\s/g, '. ').replace(/[()„“"]/g, '').replace(/\s+/g, ' ').trim();
  let konusan = null, oynatici = null;
  // okur; okuma bitince (ya da zaman aşımında) çözülür: { ms: gerçek okuma süresi (onstart → onend), 0 = ölçülemedi }
  function oku(text, o) {
    o = o || {};
    return new Promise(res => {
      text = ttsMetin(text);
      if (!ttsVar() || !text) { res({ ms: 0 }); return; }
      let bitti = false, t0 = 0, zt = null;
      const u = new SpeechSynthesisUtterance(text);
      const son = () => { if (bitti) return; bitti = true; clearTimeout(zt); if (konusan === u) konusan = null; res({ ms: t0 ? performance.now() - t0 : 0 }); };
      u.lang = 'de-DE'; u.rate = o.hiz || hiz();
      const v = o.ses || (A.almancaSes && A.almancaSes()) || sesler()[0]; if (v) u.voice = v;
      u.onstart = () => { t0 = performance.now(); }; u.onend = u.onerror = son;
      zt = setTimeout(son, 2500 + text.length * 110 / u.rate);
      try { speechSynthesis.cancel(); } catch (e) { /* yok */ }
      konusan = u;
      setTimeout(() => { if (konusan === u && !bitti) { try { speechSynthesis.speak(u); } catch (e) { son(); } } }, 40);
    });
  }
  function cal(url, ms) {
    return new Promise(res => {
      if (!url) { res(); return; }
      let b = false, zt = null; const a = new Audio(url); oynatici = a;
      const son = () => { if (b) return; b = true; clearTimeout(zt); res(); };
      a.onended = a.onerror = son; zt = setTimeout(son, (ms || 10000) + 1500);
      const p = a.play(); if (p && p.catch) p.catch(son);
    });
  }
  function sus() {
    konusan = null;
    try { if (root.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* yok */ }
    if (oynatici) { try { oynatici.pause(); } catch (e) { /* yok */ } oynatici = null; }
  }

  // ================= Mikrofon, kayıt, ölçüm =================
  let mikIzin = 'bilinmiyor', mikRed = false, aktifKayit = null;
  const mikDestek = () => !!(root.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && root.MediaRecorder);
  const mikVar = () => mikDestek() && mikIzin !== 'denied' && !mikRed;
  function izinIzle() {
    try {
      navigator.permissions.query({ name: 'microphone' }).then(p => {
        mikIzin = p.state;
        p.onchange = () => { mikIzin = p.state; if (p.state === 'granted') mikRed = false; };
      }).catch(() => {});
    } catch (e) { /* yok */ }
  }
  // fr: RMS dizisi (dt ms arayla) → ölçüler. Eşik: gürültü tabanı (alt %15) × 3, en az 0,012. Ses parçaları: 250 ms'den kısa boşluk birleşir, 100 ms'den kısa ses atılır.
  // gecikme: ilk sese kadar; konusma: ilk sesten son sese; ses: sesli toplam; oran: ses / konusma; duraklama: ≥ 1 sn boşluk sayısı; akis: en uzun kesintisiz konuşma (< 0,5 sn boşluk sayılmaz)
  function analiz(fr, dt, o) {
    o = o || {}; dt = dt || 50;
    const n = (fr || []).length, bos = { gecikme: null, sure: n * dt, konusma: 0, ses: 0, oran: 0, duraklama: 0, akis: 0 };
    if (!n) return bos;
    const sirali = fr.slice().sort((a, b) => a - b), taban = sirali[Math.floor(n * 0.15)] || 0;
    const esik = Math.max(o.minEsik || 0.012, taban * 3);
    let seg = [];
    for (let i = 0; i < n; i++) if (fr[i] > esik) { let j = i; while (j < n && fr[j] > esik) j++; seg.push([i, j]); i = j; }
    const bir = [];
    seg.forEach(s => { const x = bir[bir.length - 1]; if (x && (s[0] - x[1]) * dt < 250) x[1] = s[1]; else bir.push(s.slice()); });
    seg = bir.filter(s => (s[1] - s[0]) * dt >= 100);
    if (!seg.length) return bos;
    const ses = seg.reduce((a, s) => a + s[1] - s[0], 0) * dt, bas = seg[0][0] * dt, aralik = seg[seg.length - 1][1] * dt - bas;
    let duraklama = 0, akis = 0, akisBas = seg[0][0];
    seg.forEach((s, i) => {
      const x = seg[i + 1], bosluk = x ? (x[0] - s[1]) * dt : Infinity;
      if (x && bosluk >= 1000) duraklama++;
      if (bosluk >= 500) { akis = Math.max(akis, (s[1] - akisBas) * dt); if (x) akisBas = x[0]; }
    });
    return { gecikme: bas, sure: n * dt, konusma: aralik, ses, oran: aralik ? ses / aralik : 0, duraklama, akis };
  }
  // kayıt aç: Promise<kayıt | null> (null: mikrofon yok / izin yok / hata). o: { enUzun, sessizlik (ses başladıktan sonra bu kadar sessizlik → dur), sesYoksa (hiç ses yoksa dur),
  //   seviye(0..1, sesVar), onSes(ms), onTik(ms), bekci() (false → iptal: kart kapandı) }. kayıt.sonuc: Promise<{ blob, url, ms, olcu } | null (iptal)>
  function kayitAc(o) {
    o = o || {};
    if (!mikVar()) return Promise.resolve(null);
    kayitKes();
    let istek;
    try { istek = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { return Promise.resolve(null); }
    return istek.then(stream => {
      mikIzin = 'granted'; mikRed = false;
      let rec;
      try { rec = new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach(t => t.stop()); return null; }
      if (o.bekci && !o.bekci()) { stream.getTracks().forEach(t => t.stop()); return null; }
      const parca = [], fr = [], AC = root.AudioContext || root.webkitAudioContext;
      let ctx = null, an = null, buf = null;
      try { if (AC) { ctx = new AC(); an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(stream).connect(an); buf = new Float32Array(an.fftSize); if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {}); } } catch (e) { an = null; }
      const t0 = performance.now();
      let sesBas = null, sonSes = null, durdu = false, iptal = false, taban = null, coz = null, iv = null, fr0 = null, frSon = 0;
      const olcuyor = () => !!(an && (!ctx || ctx.state === 'running'));   // askıdaki AudioContext (etkileşimsiz sayfa) sıfır verir: ölçüm yok sayılır
      const sonuc = new Promise(r => { coz = r; });
      const k = {
        t0, sonuc, get sesBas() { return sesBas; }, get ms() { return performance.now() - t0; },
        dur() { if (durdu) return; durdu = true; clearInterval(iv); try { rec.stop(); } catch (e) { stream.getTracks().forEach(t => t.stop()); coz(null); } },
        iptal() { iptal = true; k.dur(); },
      };
      rec.ondataavailable = e => { if (e.data && e.data.size) parca.push(e.data); };
      rec.onstop = () => {
        clearInterval(iv); stream.getTracks().forEach(t => t.stop());
        try { if (ctx) ctx.close(); } catch (e) { /* yok */ }
        if (aktifKayit === k) aktifKayit = null;
        const ms = performance.now() - t0;
        if (iptal) { coz(null); return; }
        const blob = new Blob(parca, { type: rec.mimeType || 'audio/webm' });
        let olcu = null;
        if (fr.length >= 4) { olcu = analiz(fr, (frSon - fr0) / (fr.length - 1) || 50); if (olcu.gecikme != null) olcu.gecikme += fr0; olcu.sure = ms; }
        coz({ blob, url: URL.createObjectURL(blob), ms, olcu });
      };
      iv = setInterval(() => {
        const t = performance.now() - t0;
        if (olcuyor()) {
          if (fr0 == null) fr0 = t; frSon = t;
          an.getFloatTimeDomainData(buf);
          let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
          const r = Math.sqrt(s / buf.length); fr.push(r);
          if (fr.length <= 6) taban = taban == null ? r : Math.min(taban, r);   // ilk 300 ms'nin en sessizi
          const var_ = r > Math.max(0.012, (taban || 0) * 3);
          if (var_) { if (sesBas == null) { sesBas = t; if (o.onSes) o.onSes(t); } sonSes = t; }
          if (o.seviye) o.seviye(Math.min(1, r / 0.12), var_);
        }
        if (o.onTik) o.onTik(t);
        if (o.bekci && !o.bekci()) { k.iptal(); return; }
        if (t >= (o.enUzun || 60000)) k.dur();
        else if (o.sessizlik && sonSes != null && t - sonSes >= o.sessizlik && t - sesBas >= 300) k.dur();
        else if (o.sesYoksa && sesBas == null && fr0 != null && t - fr0 >= o.sesYoksa) k.dur();
      }, 50);
      rec.start(250);
      aktifKayit = k;
      return k;
    }).catch(err => {
      if (err && /NotAllowed|Security|NotFound|NotReadable|Abort/.test(err.name || '')) mikRed = true;
      return null;
    });
  }
  function kayitKes() { const k = aktifKayit; aktifKayit = null; if (k) k.iptal(); }
  const olcuMetni = (o, ms) => {
    if (!o) return `kayıt ${snTR(ms)} sn`;
    if (o.gecikme == null) return 'ses algılanmadı (mikrofon çok sessiz mi?)';
    return `başlama <b>${snTR(o.gecikme)} sn</b> · konuşma ${snTR(o.konusma)} sn`;
  };
  const olcuNotiz = (o, ms) => `gecikme:${o && o.gecikme != null ? sn(o.gecikme) + 'sn' : 'yok'} | süre:${sn(ms)}sn` + (o ? ` | konuşma:${sn(o.konusma)}sn` : '');
  const akiciNotiz = o => (o ? ` | oran:%${Math.round(o.oran * 100)} | duraklama:${o.duraklama} | akış:${sn(o.akis)}sn` : ' | ölçüm:yok');
  // seviye çubuğu (kök içindeki .kn-mik)
  const seviyeCiz = kok => (x, ses) => { const i = kok && kok.querySelector('.kn-seviye i'); if (i) i.style.width = Math.round(x * 100) + '%'; const m = kok && kok.querySelector('.kn-mik'); if (m) m.classList.toggle('ses', !!ses); };
  const mikNot = (kok, t) => { const x = kok && kok.querySelector('.kn-not'); if (x) x.innerHTML = t; };
  const MIK_HTML = '<div class="kn-mik" aria-live="polite"><span class="kn-nokta"></span><span class="kn-seviye"><i></i></span><span class="kn-not">mikrofon açılıyor…</span></div>';

  // ================= Kayıt arşivi (IndexedDB) =================
  function dbIs(mode, fn) {
    return new Promise((res, rej) => {
      if (!root.indexedDB) { rej(new Error('IndexedDB yok')); return; }
      const r = indexedDB.open('almanca-tekrar-ses', 1);
      r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('kayit')) d.createObjectStore('kayit', { keyPath: 'k', autoIncrement: true }); };
      r.onerror = () => rej(r.error);
      r.onsuccess = () => {
        const d = r.result, tx = d.transaction('kayit', mode), q = fn(tx.objectStore('kayit'));
        tx.oncomplete = () => { d.close(); res(q && q.result); };
        tx.onerror = () => { d.close(); rej(tx.error); };
      };
    });
  }
  const arsivHepsi = () => dbIs('readonly', st => st.getAll()).then(l => l || []).catch(() => []);
  // ses dosyası: son 40 kayıt + her konunun ilk kaydı; ötekilerin yalnız ölçümü kalır
  function arsivBuda() {
    return arsivHepsi().then(l => {
      const ilk = {}; l.forEach(r => { const k = r.tur + ':' + r.konu; if (!ilk[k] || r.ts < ilk[k].ts) ilk[k] = r; });
      const tut = new Set(l.slice().sort((a, b) => b.ts - a.ts).slice(0, 40).map(r => r.k)); Object.values(ilk).forEach(r => tut.add(r.k));
      const sil = l.filter(r => r.blob && !tut.has(r.k));
      if (sil.length) return dbIs('readwrite', st => { sil.forEach(r => { r.blob = null; st.put(r); }); });
      return null;
    }).catch(() => {});
  }
  const arsivEkle = rec => dbIs('readwrite', st => st.add(rec)).then(arsivBuda).catch(e => console.warn('ses arşivi', e));

  // ================= Cümle seçimi (söyle / shadowing) =================
  function cumleler(id) {
    const k = id[0] === 'v' ? 'v' : 'n';
    const l = k === 'v' ? [].concat((root.SAETZE || {})[id] || [], (root.SAETZE_REFL || {})[id] || []) : ((root.NSAETZE || {})[id] || []);
    return l.filter(x => x && x.de && x.tr);
  }
  function bildikler(minBm) {
    const S = St(), out = [];
    Object.keys((S && S.items) || {}).forEach(id => {
      const m = S.items[id] && S.items[id].m;
      if (!m || !m.S || id[0] === 'p' || (m.bm || 0) < minBm) return;
      try { if (A.label) A.label(id); } catch (e) { return; }   // listede olmayan (eski) öğe
      out.push(id);
    });
    return out;
  }
  // o: { maxKelime, minBm, gorulen: Set } — son 30 günde söylenen cümle yok; son 7 günde söylenmemiş öğe önce
  function cumleSec(o) {
    o = o || {};
    const k = kn(), t = now(), sinir = t - 30 * DAY;
    let ids = bildikler(o.minBm || 0);
    if (!ids.length && o.minBm) ids = bildikler(0);
    const sira = ids.map(id => ({ id, w: Math.random() + ((k.oge[id] || 0) > t - 7 * DAY ? 1 : 0) })).sort((a, b) => a.w - b.w);
    for (const { id } of sira.slice(0, 80)) {
      const c = cumleler(id).filter(x => kelimeSay(x.de) <= (o.maxKelime || 12) && !((k.son[x.de] || 0) > sinir) && !(o.gorulen && o.gorulen.has(x.de)));
      if (c.length) { const x = c[Math.floor(Math.random() * c.length)]; return { id, de: String(x.de).trim(), tr: x.tr }; }
    }
    return null;
  }
  function cumleKullan(x) {
    const k = kn(); k.son[x.de] = now(); k.oge[x.id] = now();
    const ks = Object.keys(k.son);
    if (ks.length > 400) ks.sort((a, b) => k.son[a] - k.son[b]).slice(0, ks.length - 400).forEach(z => { delete k.son[z]; });
  }

  // ================= Dinle ve ayırt et (minimal çift / vurgu) =================
  const MP = () => root.MINIMALPAARE || { kontrast: {}, ciftler: [], vurgu: [] };
  const ARTRE = /^(der|die|das) /;
  const hoerVar = () => ttsVar() && sesler().length > 0 && (MP().ciftler.length + MP().vurgu.length) > 0;
  function madde(x) {
    const mp = MP();
    if (x.tip === 'vurgu') {
      const v = mp.vurgu[x.i], yanlis = v.v === v.h.length - 1 ? 0 : v.h.length - 1;
      const yaz = j => v.h.map((h, i) => (i === j ? h.toUpperCase() : h)).join('·');
      const d = { yaz: yaz(v.v), art: v.art, tr: v.tr }, w = { yaz: yaz(yanlis), art: v.art, tr: v.tr };
      const ilk = Math.random() < 0.5;
      return { k: 'vurgu', anahtar: 'v' + x.i, item: v.h.join('·'), ses: v.h.join(''), sec: ilk ? [d, w] : [w, d], dogru: ilk ? 0 : 1 };
    }
    const c = mp.ciftler[x.i], o = w => ({ yaz: w.replace(ARTRE, ''), art: (ARTRE.exec(w) || [])[1] || '' });
    const a = Object.assign(o(c.a), { tr: c.ta }), b = Object.assign(o(c.b), { tr: c.tb }), d = Math.random() < 0.5 ? 0 : 1;
    return { k: c.k, anahtar: 'c' + x.i, item: `${a.yaz}/${b.yaz}`, ses: (d ? b : a).yaz, sec: [a, b], dogru: d };
  }
  // en zayıf kontrast önce (az görülen öne), içinde son 40 soruda olmayan madde
  function hoerSec(gorulen) {
    const mp = MP(), hs = hoerSt(), gr = {};
    mp.ciftler.forEach((c, i) => (gr[c.k] = gr[c.k] || []).push({ tip: 'cift', i }));
    if (mp.vurgu.length) gr.vurgu = mp.vurgu.map((v, i) => ({ tip: 'vurgu', i }));
    const ks = Object.keys(gr); if (!ks.length) return null;
    const puan = k => { const x = hs[k] || {}, n = (x.d || 0) + (x.y || 0); return ((x.d || 0) + 1) / (n + 2) - (n < 3 ? 0.3 : 0) + Math.random() * 0.35; };
    const k = ks.map(x => [x, puan(x)]).sort((a, b) => a[1] - b[1])[0][0];
    const son = kn().hoerSon;
    let aday = gr[k].filter(x => !son.includes(x.tip[0] + x.i) && !(gorulen && gorulen.has(x.tip[0] + x.i)));
    if (!aday.length) aday = gr[k];
    const x = aday[Math.floor(Math.random() * aday.length)];
    son.push(x.tip[0] + x.i); if (son.length > 40) son.splice(0, son.length - 40);
    if (gorulen) gorulen.add(x.tip[0] + x.i);
    return madde(x);
  }
  const rastgeleSes = () => { const l = sesler(); return l.length ? l[Math.floor(Math.random() * l.length)] : null; };
  const kontrastAd = k => ((MP().kontrast[k] || {}).ad || k);

  // ================= Soru nesnesi (tur yuvası ve bölüm aynı çizimi kullanır) =================
  let aktif = null;   // ekrandaki soru / etkinlik: { kok, tus(e), eylem(ad, el) }
  const ISLENDI = new WeakSet();
  function soruYap(alt, veri, kaynak) {
    const q = { modul: 'konus', alt, veri, kaynak, id: alt === 'soyle' ? 'soyle:' + veri.id : 'hoer:' + veri.k, bitti: null };
    q.render = (kart, bitti) => { if (typeof bitti === 'function') q.bitti = bitti; q.kart = kart; (q.alt === 'soyle' ? soyleCiz : hoerCiz)(q); };
    q.tus = e => ISLENDI.has(e) || (aktif === q && tusIsle(q, e));
    q.klick = e => ISLENDI.has(e);
    q.kes = () => { if (aktif === q) aktif = null; kayitKes(); sus(); };
    return q;
  }
  function bitir(q, r) {
    if (q.bittiCagrildi) return; q.bittiCagrildi = true;
    const f = q.bitti || (q.kaynak === 'tur' ? A.bitti : null);
    if (typeof f === 'function') { try { f(Object.assign({ alt: q.alt, id: q.id }, r)); } catch (e) { console.warn('Konus bitti', e); } }
  }
  const yasiyor = q => aktif === q && gorunur(q.kok);

  // ---------- söyle ----------
  function soyleCiz(q) {
    const v = q.veri; q.durum = 'kayit'; q.t0 = now();
    q.kart.innerHTML = `<div class="kn kn-soyle" data-kn-kok>
      <div class="kn-ust">${q.kaynak === 'tur' ? '' : '<span class="chip vurgu">söyle</span>'}<span class="soluk">Almancasını yüksek sesle söyle · not yok</span></div>
      <div class="soru kn-tr">${esc(v.tr)}</div>
      <div class="kn-ipucu">kelime: <b>${deH(lab(v.id))}</b></div>
      ${MIK_HTML}
      <div class="kn-cevap" hidden></div>
      <div class="sira kn-dugmeler"><button class="btn ana" data-kn="dur" type="button">⏹ Söyledim <kbd>Enter</kbd></button><button class="btn" data-kn="sessiz" type="button">Şimdi sesli olmaz</button></div>
    </div>`;
    q.kok = q.kart.querySelector('[data-kn-kok]'); aktif = q;
    q.eylem = ad => {
      if (ad === 'dur' && q.durum === 'kayit') { if (q.kayit) q.kayit.dur(); return true; }
      if (ad === 'sessiz' && q.durum === 'kayit') { kayitKes(); q.kayit = null; sesliOlmaz(q); return true; }
      if (ad === 'model') { oku(v.de); return true; }
      if (ad === 'kendi') { if (q.url) cal(q.url, q.ms); return true; }
      if (ad === 'aba') { aba(q); return true; }
      if (ad === 'gec' && q.bittiCagrildi) return false;   // turda: bitti çağrıldıysa Enter / Devam uygulamanın
      if ((ad === 'gec' || ad === 'sonraki') && q.durum === 'sonuc') { sus(); q.abaNesil = (q.abaNesil || 0) + 1; bitir(q, { urteil: 'gemacht', antwort: q.antwort || '' }); if (q.sonraki) q.sonraki(); return true; }
      return false;
    };
    kayitAc({ enUzun: 15000, sessizlik: 1800, sesYoksa: 9000, seviye: seviyeCiz(q.kok), bekci: () => yasiyor(q) && q.durum === 'kayit',
      onSes: () => mikNot(q.kok, '● konuşuyorsun…') }).then(k => {
      if (!yasiyor(q) || q.durum !== 'kayit') { if (k) k.iptal(); return; }
      if (!k) { sesliOlmaz(q, true); return; }
      q.kayit = k; mikNot(q.kok, 'dinliyorum: söyle (sessizlikte kendiliğinden biter)');
      k.sonuc.then(r => { if (r && yasiyor(q)) soyleSonuc(q, r); });
    });
  }
  // mikrofon yok / kullanılamaz: turda dinleme sorusuna geç; bölümde cevabı göster
  function sesliOlmaz(q, mikYok) {
    if (q.kaynak === 'tur') {
      const m = hoerVar() ? hoerSec() : null;
      if (m) { q.alt = 'hoer'; q.veri = m; q.id = 'hoer:' + m.k; q.not = mikYok ? 'Mikrofon kullanılamıyor: bunun yerine dinleme sorusu.' : 'Sessiz soru: dinle ve ayırt et (kulaklıkla).'; hoerCiz(q); return; }
      bitir(q, { urteil: 'atla', antwort: '' });
      return;
    }
    soyleSonuc(q, null, mikYok ? 'mikrofon yok' : 'sessiz');
  }
  function soyleSonuc(q, r, neden) {
    const v = q.veri; q.durum = 'sonuc';
    q.url = r && r.url; q.ms = r ? r.ms : 0; q.antwort = r ? `kayıt:${Math.round(r.ms / 1000)}sn` : '';
    cumleKullan(v);
    if (r) log({ modus: 'sprechen', id: 'soyle:' + v.id, item: lab(v.id), frage: v.tr, antwort: q.antwort, ergebnis: 'gemacht', loesung: v.de, notiz: olcuNotiz(r.olcu, r.ms) + ` | kaynak:${q.kaynak}` });
    if (r && q.kaynak !== 'tur') { say(); xp(10); }
    kaydet();
    const m = q.kok.querySelector('.kn-mik'); if (m) m.hidden = true;
    const c = q.kok.querySelector('.kn-cevap'); c.hidden = false;
    c.innerHTML = `<div class="kn-de">${deH(v.de)}</div>
      <div class="kn-olcu soluk">${r ? olcuMetni(r.olcu, r.ms) : neden === 'sessiz' ? 'sesli söylemeden geçtin' : 'mikrofon kullanılamıyor: içinden söyle, sonra dinle'}</div>
      <div class="sira kn-dinle"><button class="btn" data-kn="model" type="button">🔊 Doğrusu</button>${q.url ? '<button class="btn" data-kn="kendi" type="button">▶ Kaydın</button><button class="btn" data-kn="aba" type="button">🔁 Doğrusu · sen · doğrusu</button>' : ''}</div>`;
    const d = q.kok.querySelector('.kn-dugmeler');
    d.innerHTML = `<button class="btn ana" data-kn="${q.kaynak === 'tur' ? 'gec' : 'sonraki'}" type="button">${q.kaynak === 'tur' ? 'Tamam' : 'Sıradaki'} <kbd>Enter</kbd></button>`;
    aba(q);
  }
  // doğrusu → kendi kaydın → doğrusu (art arda; tek odaklı karşılaştırma). Turda bitti bu dinleme bitince çağrılır.
  function aba(q) {
    const nesil = q.abaNesil = (q.abaNesil || 0) + 1, de = q.veri.de;
    const devam = () => yasiyor(q) && q.abaNesil === nesil;
    (async () => {
      await oku(de); if (!devam()) return;
      if (q.url) { await bekle(300); if (!devam()) return; await cal(q.url, q.ms); if (!devam()) return; await bekle(300); if (!devam()) return; await oku(de); if (!devam()) return; }
      if (q.kaynak === 'tur') bitir(q, { urteil: 'gemacht', antwort: q.antwort || '' });
    })();
  }

  // ---------- dinle ve ayırt et ----------
  function hoerCiz(q) {
    const m = q.veri; q.durum = 'soru'; q.dinleme = 0; q.t0 = now(); q.ses = rastgeleSes(); q.cevap = null;
    q.kart.innerHTML = `<div class="kn kn-hoer" data-kn-kok>
      <div class="kn-ust"><span class="chip vurgu">dinle · ayırt et</span><span class="soluk">${esc(kontrastAd(m.k))}</span></div>
      ${q.not ? `<div class="soluk kn-uyari">${esc(q.not)}</div>` : ''}
      <div class="soru">${m.k === 'vurgu' ? 'Vurgu hangi hecede?' : 'Hangisini duydun?'}</div>
      <div class="sira"><button class="btn" data-kn="dinle" type="button">🔊 Tekrar dinle <kbd>Boşluk</kbd></button></div>
      <div class="kn-sikler">${m.sec.map((o, i) => `<button class="btn kn-sik" data-kn="sec" data-i="${i}" type="button"><kbd>${i + 1}</kbd><span class="kn-kelime">${o.art ? `<small class="kn-art">${esc(o.art)}</small> ` : ''}${esc(o.yaz)}</span></button>`).join('')}</div>
      <div class="kn-sonuc" hidden></div>
      <div class="sira kn-dugmeler"></div>
    </div>`;
    q.kok = q.kart.querySelector('[data-kn-kok]'); aktif = q;
    q.eylem = (ad, el) => {
      if (ad === 'dinle') { dinlet(q); return true; }
      if (ad === 'sec' && q.cevap == null) { hoerCevap(q, +el.dataset.i); return true; }
      if (ad === 'kelime') { const o = m.sec[+el.dataset.i]; oku(m.k === 'vurgu' ? m.ses : o.yaz, { ses: q.ses }); return true; }
      if (ad === 'sonraki' && q.cevap != null && q.sonraki) { q.sonraki(); return true; }
      return false;
    };
    dinlet(q);
  }
  function dinlet(q) { q.dinleme++; return oku(q.veri.ses, { ses: q.ses, hiz: Math.min(hiz(), 0.95) }); }
  function hoerCevap(q, i) {
    const m = q.veri, dogru = i === m.dogru, hs = hoerSt(), x = hs[m.k] = hs[m.k] || { d: 0, y: 0 };
    q.cevap = i; q.durum = 'sonuc';
    if (dogru) x.d = (x.d || 0) + 1; else x.y = (x.y || 0) + 1;
    x.t = now();
    log({ modus: 'hoer', id: 'hoer:' + m.k, item: m.item, frage: m.sec[m.dogru].yaz, antwort: m.sec[i].yaz, ergebnis: dogru ? 'richtig' : 'falsch', loesung: m.sec[m.dogru].yaz,
      notiz: `cift:${m.item} | ses:${q.ses ? q.ses.name : 'yok'} | dinleme:${q.dinleme} | sek:${Math.round((now() - q.t0) / 1000)} | kaynak:${q.kaynak}` });
    if (q.kaynak !== 'tur') { say(); xp(2); }
    kaydet();
    q.kok.querySelectorAll('.kn-sik').forEach((b, j) => { b.disabled = true; b.classList.toggle('dogru', j === m.dogru); b.classList.toggle('yanlis', j === i && !dogru); });
    const s = q.kok.querySelector('.kn-sonuc'); s.hidden = false;
    const kanca = (MP().kontrast[m.k] || {}).kanca || '';
    s.innerHTML = `<div class="kn-karar ${dogru ? 'iyi' : 'kotu'}">${dogru ? '✓ Doğru' : `✗ Duyduğun: <b>${esc(m.sec[m.dogru].yaz)}</b>`}</div>
      <div class="kn-ciftler">${m.sec.map((o, j) => `<button class="btn kn-cift" data-kn="kelime" data-i="${j}" type="button">🔊 ${o.art ? esc(o.art) + ' ' : ''}${esc(o.yaz)} <span class="soluk">${esc(o.tr)}</span></button>`).join('')}</div>
      ${!dogru && kanca ? `<div class="kn-kanca">${esc(kanca)}</div>` : ''}`;
    if (q.kaynak !== 'tur') q.kok.querySelector('.kn-dugmeler').innerHTML = `<button class="btn ana" data-kn="sonraki" type="button">Sıradaki <kbd>Enter</kbd></button>`;
    // yanlışta iki kelime art arda (vurguda doğru vurguyla bir kez daha)
    if (!dogru) (async () => { await bekle(250); if (!yasiyor(q)) return; if (m.k === 'vurgu') { await oku(m.ses, { ses: q.ses }); return; } await oku(m.sec[0].yaz, { ses: q.ses }); if (!yasiyor(q)) return; await bekle(350); if (!yasiyor(q)) return; await oku(m.sec[1].yaz, { ses: q.ses }); })();
    bitir(q, { urteil: dogru ? 'richtig' : 'falsch', antwort: m.sec[i].yaz });
    if (q.kaynak !== 'tur' && dogru && q.sonraki) { const sq = q.sonraki; setTimeout(() => { if (yasiyor(q)) sq(); }, 1100); }
  }

  // ================= Olaylar (tek yer: belge düzeyinde, yakalama aşamasında) =================
  function tusIsle(q, e) {
    if (!q || !q.kok || !gorunur(q.kok)) return false;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return false;
    const k = e.key;
    if (q.tusOzel && q.tusOzel(e)) return true;
    if (q.alt === 'hoer') {
      if (q.cevap == null && (k === '1' || k === '2')) return q.eylem('sec', { dataset: { i: String(+k - 1) } });
      if (k === ' ' || k === 'r') return q.eylem('dinle');
      if (k === 'Enter' && q.cevap != null && q.kaynak !== 'tur') return q.eylem('sonraki');
      return false;
    }
    if (k === 'Enter') {
      // kayıt başladıktan sonraki ilk 1,5 sn Enter yok sayılır (önceki karttan kalan çift Enter konuşma denemesini kesmesin; 6.11 denetim)
      if (q.durum === 'kayit') return q.t0 && now() - q.t0 < 1500 ? true : q.eylem('dur');
      if (q.durum === 'sonuc') return q.eylem(q.kaynak === 'tur' ? 'gec' : 'sonraki');
    }
    return false;
  }
  function olaylariBagla() {
    if (olaylariBagla.oldu || typeof document === 'undefined') return; olaylariBagla.oldu = true;
    document.addEventListener('click', e => {
      const t = e.target && e.target.closest ? e.target : null; if (!t) return;
      const an = t.closest('[data-kn-ana]');
      if (an) { sekme(an.dataset.knAna); return; }   // Bugün kartı: sekmeyi seç, bölümü uygulama açar (data-modus)
      const b = t.closest('[data-kn]');
      if (!b || !aktif || !aktif.kok || !aktif.kok.contains(b) && !(aktif.dis && aktif.dis.contains(b))) return;
      if (b.disabled) return;
      if (aktif.eylem && aktif.eylem(b.dataset.kn, b, e)) ISLENDI.add(e);
    }, true);
    document.addEventListener('keydown', e => {
      if (e.repeat || !aktif || e.ctrlKey || e.metaKey || e.altKey) return;
      if (tusIsle(aktif, e)) { ISLENDI.add(e); e.preventDefault(); }
    }, true);
  }

  // ================= Tur yuvası (S2) =================
  function turSorusu(api, sel) {
    if (api && typeof api === 'object' && api !== A) A = Object.assign({}, A, api);
    if (!St()) return null;
    olaylariBagla();
    const alt = sel && sel.alt;
    try {
      if (alt === 'soyle') {
        if (!mikVar() || !ttsVar()) return null;
        const c = cumleSec({ maxKelime: 12, minBm: 2 });
        return c ? soruYap('soyle', c, 'tur') : null;
      }
      if (alt === 'hoer') {
        if (!hoerVar()) return null;
        const m = hoerSec();
        return m ? soruYap('hoer', m, 'tur') : null;
      }
    } catch (e) { console.warn('Konus.turSorusu', e); }
    return null;
  }

  // ================= Konuşma bölümü =================
  const SEKMELER = [['rm', 'Kalıplar'], ['soyle', 'Söyle'], ['shadow', 'Shadowing'], ['teil2', 'Teil 2 · 4/3/2'], ['teil1', 'Teil 1'], ['teil3', 'Teil 3'], ['hoer', 'Dinle · ayırt et'], ['ilerleme', 'İlerleme']];
  const ALT = { rm: 'Türkçesini gör, 3 sn içinde Almancasını sesli söyle', soyle: 'Türkçe cümle → Almancasını sesli söyle', shadow: 'dinle, cümle gizlenir, tekrarla',
    teil2: 'aynı konu üç kez, her seferinde daha kısa', teil1: 'birlikte plan yapma', teil3: 'sunuma tepki ve soru', hoer: 'iki kelimeden hangisini duydun?', ilerleme: 'haftalık tablo · kulak haritası · kayıtlar' };
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
    ['Eine Kollegin ist krank: Besuch und Hilfe planen', 'Hasta bir arkadaşı ziyaret: ne zaman, ne götürülecek, kim arayacak'],
    ['Ein Abschiedsgeschenk für den Lehrer', 'Öğretmene veda hediyesi (ne, kaç para, kim alacak)'],
    ['Einen Deutsch-Lernabend organisieren', 'Almanca çalışma akşamı düzenleyin (nerede, saat kaçta, ne çalışılacak)'],
  ];
  const T2_YAPI = ['<b>Einleitung:</b> konuyu söyle, yapıyı anlat', '<b>Meine Erfahrungen:</b> kendi deneyimin (1–2 örnek)', '<b>In meinem Heimatland:</b> Türkiye\'de durum', '<b>Vor- und Nachteile:</b> en az 2 + 2', '<b>Meine Meinung + Schluss:</b> görüşün, teşekkür'];
  const T2_SURE = { uzun: [180, 135, 90], kisa: [60, 45, 30] };
  const RM_TUR = { sprechen0: 'zaman kazan', sprechen1: 'Teil 1 · planlama', sprechen2: 'Teil 2 · sunum', sprechen3: 'Teil 3 · tepki' };
  const saat = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const kalipListe = typ => ((root.KALIPLAR || {}).yazma || {})[typ] || [];
  const kalipHTML = typ => kalipListe(typ).map(k => `<li><b>${esc(k.de)}</b> <span class="soluk">${esc(k.tr)}</span></li>`).join('');

  function sekme(k) {
    if (k === 'teil2k') { B.sekme = 'teil2'; B.t2 = { asama: 'sec', mod: 'kisa' }; return; }
    if (SEKMELER.some(x => x[0] === k)) { B.sekme = k; if (k === 'teil2' && B.t2 && B.t2.asama !== 'sec') B.t2 = null; }
  }
  // bugünkü konuşma süresi (sn): bugünkü `sprechen` satırlarının süre:'leri
  function bugunSn() {
    const g = gunOf(now()), S = St();
    return Math.round(((S && S.log) || []).filter(e => e && e.modus === 'sprechen' && e.zeit && e.zeit.slice(0, 10) === g).reduce((a, e) => a + (al(e.notiz, 'süre') || 0), 0));
  }
  const al = (n, k) => { const m = new RegExp('(?:^|\\| )' + k + ':%?(-?[\\d.]+)').exec(n || ''); return m ? +m[1] : null; };

  function render() {
    const kart = A.kart && A.kart(); if (!kart) return;
    olaylariBagla();
    kayitKes(); sus(); saatKes();
    if (!B.sekme) B.sekme = gunlukIs().sekme === 'teil2k' ? 'teil2' : gunlukIs().sekme;
    if (A.durum) A.durum('');
    const bs = bugunSn();
    kart.innerHTML = `<div class="tur"><span class="yeni">konuşma</span><span>${esc(ALT[B.sekme] || '')}</span></div>
      <div class="chips kn-sekme">${SEKMELER.map(([k, ad]) => `<button class="chip${B.sekme === k ? ' aktif' : ''}" data-kn-sekme="${k}" type="button">${ad}</button>`).join('')}</div>
      <div class="kn-bugun soluk">bugün <b>${saat(bs)}</b> konuştun · hedef 2:00${bs >= HEDEF_SN ? ' ✓' : ''}${mikDestek() ? (mikVar() ? '' : ' · <span class="kn-uyari">mikrofon izni yok: tarayıcının adres çubuğundan izin ver</span>') : ' · <span class="kn-uyari">bu tarayıcıda kayıt yok</span>'}</div>
      <div class="kn-govde"></div>`;
    kart.querySelectorAll('[data-kn-sekme]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.knSekme; B.sekme = k; if (k === 'teil2') B.t2 = null; render(); }));
    const g = kart.querySelector('.kn-govde');
    try { ({ rm: rmCiz, soyle: bSoyle, shadow: shCiz, teil2: t2Ciz, teil1: t13Ciz, teil3: t13Ciz, hoer: bHoer, ilerleme: ilCiz })[B.sekme](g); }
    catch (e) { console.warn('Konus', e); g.innerHTML = '<div class="bos">Bu bölüm açılamadı.</div>'; }
  }
  const govde = () => { const k = A.kart && A.kart(); return k && k.querySelector('.kn-govde'); };
  // bölüm içi zamanlayıcı (plan / Teil 2 sayacı): kart kapanınca durur
  let saatIv = null;
  const saatKes = () => { if (saatIv) clearInterval(saatIv); saatIv = null; };

  // ---------- Söyle (bölüm) ----------
  function bSoyle(g) {
    const gorulen = B.soyleGor = B.soyleGor || new Set();
    const c = cumleSec({ maxKelime: 14, minBm: 2, gorulen });
    if (!c) { g.innerHTML = '<div class="bos">Önce birkaç kelimeyi yazarak öğren; cümleleri buraya gelir.</div>'; return; }
    gorulen.add(c.de);
    const q = soruYap('soyle', c, 'bolum');
    q.sonraki = () => bSoyle(govde() || g);
    q.render(g);
  }
  // ---------- Dinle (bölüm): 10 soruluk set ----------
  function bHoer(g) {
    if (!hoerVar()) { g.innerHTML = `<div class="bos">${ttsVar() ? 'Bu cihazda Almanca ses yok: Ayarlar → Almanca ses' : 'Bu tarayıcıda ses yok.'}</div>`; return; }
    const h = B.hoer = B.hoer && B.hoer.n < 10 ? B.hoer : { n: 0, d: 0, gor: new Set() };
    const m = hoerSec(h.gor); if (!m) { g.innerHTML = '<div class="bos">Liste boş.</div>'; return; }
    const q = soruYap('hoer', m, 'bolum');
    q.bitti = r => { h.n++; if (r.urteil === 'richtig') h.d++; };
    q.sonraki = () => { const gg = govde() || g; if (h.n >= 10) hoerOzet(gg); else bHoer(gg); };
    q.render(g);
    const ust = g.querySelector('.kn-ust .soluk'); if (ust) ust.textContent += ` · ${h.n + 1}/10`;
  }
  function hoerOzet(g) {
    const h = B.hoer, hs = hoerSt();
    B.hoer = null;
    g.innerHTML = `<div class="kn" data-kn-kok><div class="buyuk-kelime">${h.d}/${h.n} doğru</div>${kulakHaritasi(hs)}<div class="sira"><button class="btn ana" data-kn="yeni" type="button">10 soru daha <kbd>Enter</kbd></button></div></div>`;
    const kok = g.querySelector('[data-kn-kok]');
    aktif = { kok, eylem: ad => { if (ad === 'yeni') { bHoer(govde() || g); return true; } return false; }, tusOzel: e => e.key === 'Enter' && aktif.eylem('yeni') };
  }
  function kulakHaritasi(hs) {
    const ks = Object.keys(MP().kontrast);
    const satir = ks.map(k => { const x = hs[k] || {}, n = (x.d || 0) + (x.y || 0); return n ? `<tr><td>${esc(kontrastAd(k))}</td><td>${x.d || 0}/${n}</td><td><span class="kn-cubuk"><i style="width:${Math.round((x.d || 0) / n * 100)}%"></i></span></td></tr>` : ''; }).join('');
    return satir ? `<div class="kn-tablo-kap"><table class="kn-tablo"><thead><tr><th>kontrast</th><th>doğru</th><th></th></tr></thead><tbody>${satir}</tbody></table></div>` : '<div class="soluk">Henüz dinleme sorusu yok.</div>';
  }

  // ---------- Redemittel drili ----------
  function rmHavuz() {
    const out = [];
    Object.keys(RM_TUR).forEach(typ => kalipListe(typ).forEach((x, i) => { if (kelimeSay(x.de) <= 14) out.push({ typ, i, de: x.de, tr: x.tr, key: typ + ':' + i }); }));
    return out;
  }
  function rmSet() {
    const k = kn(), t = now();
    const puan = x => { const s = k.rm[x.key]; if (!s) return Math.random() * 0.3; return 1 + (s.ok ? 0.6 : 0) - Math.min(1, (t - (s.t || 0)) / (7 * DAY)) * 0.6 - Math.min(0.5, (s.g || 0) / 10000) + Math.random() * 0.3; };
    return rmHavuz().map(x => [x, puan(x)]).sort((a, b) => a[1] - b[1]).slice(0, 8).map(x => x[0]);
  }
  function rmCiz(g) {
    if (!B.rm || B.rm.i >= B.rm.l.length) B.rm = { l: rmSet(), i: 0, sonuc: [] };
    const R = B.rm;
    if (!R.l.length) { g.innerHTML = '<div class="bos">Kalıp listesi boş (quellen/redemittel.txt).</div>'; return; }
    const x = R.l[R.i];
    g.innerHTML = `<div class="kn kn-rm" data-kn-kok>
      <div class="kn-ust"><span class="chip">${esc(RM_TUR[x.typ])}</span><span class="soluk">${R.i + 1}/${R.l.length}</span></div>
      <div class="soru kn-tr">${esc(x.tr)}</div>
      <div class="kn-sayac"><i></i><span>3 sn içinde başla</span></div>
      ${MIK_HTML}
      <div class="kn-cevap" hidden></div>
      <div class="sira kn-dugmeler"><button class="btn ana" data-kn="dur" type="button">⏹ Söyledim <kbd>Enter</kbd></button></div>
    </div>`;
    const kok = g.querySelector('[data-kn-kok]');
    const q = aktif = { kok, durum: 'kayit', t0: performance.now() };
    const zamaninda = () => { const s = kok.querySelector('.kn-sayac'); if (s) s.classList.add('tamam'); };
    const sonuc = r => {
      if (q.durum !== 'kayit') return; q.durum = 'sonuc';
      const o = r && r.olcu, g0 = o && o.gecikme, ok = g0 != null && g0 <= 3000;
      const s = kok.querySelector('.kn-sayac'); if (s) { s.classList.add(r ? (ok ? 'tamam' : 'gec') : 'bitti'); s.querySelector('span').textContent = r ? (ok ? `✓ ${snTR(g0)} sn'de başladın` : g0 == null ? 'ses algılanmadı' : `${snTR(g0)} sn: biraz geç`) : 'süre doldu'; }
      const mk = kok.querySelector('.kn-mik'); if (mk) mk.hidden = true;
      const c = kok.querySelector('.kn-cevap'); c.hidden = false;
      c.innerHTML = `<div class="kn-de">${deH(x.de)}</div><div class="sira kn-dinle"><button class="btn" data-kn="model" type="button">🔊 Doğrusu</button>${r ? '<button class="btn" data-kn="kendi" type="button">▶ Kaydın</button>' : ''}</div>`;
      kok.querySelector('.kn-dugmeler').innerHTML = `<button class="btn ana" data-kn="sonraki" type="button">${R.i + 1 < R.l.length ? 'Sıradaki' : 'Bitir'} <kbd>Enter</kbd></button>`;
      q.url = r && r.url; q.ms = r ? r.ms : 0;
      const st = kn().rm[x.key] = Object.assign(kn().rm[x.key] || { n: 0 }, { t: now(), g: g0 != null ? Math.round(g0) : 9999, ok });
      st.n++;
      R.sonuc.push({ x, g: g0, ok, kayit: !!r });
      log({ modus: 'sprechen', id: `rm:${x.key}`, item: x.typ, frage: x.tr, antwort: r ? `kayıt:${Math.round(r.ms / 1000)}sn` : 'kayıt:yok', ergebnis: 'gemacht', loesung: x.de,
        notiz: (r ? olcuNotiz(o, r.ms) : `gecikme:yok | süre:${sn(performance.now() - q.t0)}sn`) + ` | zamanında:${ok ? 1 : 0}` + (r ? '' : ' | kayıt:yok') });
      say(); xp(5); kaydet();
      (async () => { await oku(x.de); if (aktif !== q || !gorunur(kok) || !q.url) return; await bekle(300); if (aktif !== q || !gorunur(kok)) return; await cal(q.url, q.ms); })();
    };
    q.eylem = ad => {
      if (ad === 'dur' && q.durum === 'kayit') { if (q.kayit) q.kayit.dur(); else sonuc(null); return true; }
      if (ad === 'model') { oku(x.de); return true; }
      if (ad === 'kendi') { if (q.url) cal(q.url, q.ms); return true; }
      if (ad === 'sonraki' && q.durum === 'sonuc') { sus(); R.i++; const gg = govde() || g; if (R.i >= R.l.length) rmOzet(gg); else rmCiz(gg); return true; }
      if (ad === 'yeni') { B.rm = null; rmCiz(govde() || g); return true; }
      return false;
    };
    q.tusOzel = e => e.key === 'Enter' && (q.eylem(q.durum === 'kayit' ? 'dur' : 'sonraki'));
    kayitAc({ enUzun: 10000, sessizlik: 1500, sesYoksa: 6000, seviye: seviyeCiz(kok), bekci: () => aktif === q && gorunur(kok) && q.durum === 'kayit',
      onSes: t => { if (t <= 3000) zamaninda(); mikNot(kok, '● konuşuyorsun…'); } }).then(k => {
      if (aktif !== q || q.durum !== 'kayit') { if (k) k.iptal(); return; }
      if (!k) { mikNot(kok, 'kayıt yok: sesli söyle, 4 sn sonra doğrusu gelir'); setTimeout(() => { if (aktif === q && q.durum === 'kayit') sonuc(null); }, 4000); return; }
      q.kayit = k; mikNot(kok, 'dinliyorum…');
      k.sonuc.then(r => { if (r && aktif === q && gorunur(kok)) sonuc(r); });
    });
  }
  function rmOzet(g) {
    const R = B.rm, l = R.sonuc, ok = l.filter(x => x.ok).length, gs = l.filter(x => x.g != null).map(x => x.g).sort((a, b) => a - b);
    const med = gs.length ? gs[Math.floor(gs.length / 2)] : null;
    g.innerHTML = `<div class="kn" data-kn-kok><div class="buyuk-kelime">${ok}/${l.length} zamanında</div>
      <div class="soluk">${med != null ? `ortanca başlama ${snTR(med)} sn · ` : ''}3 sn'yi geçenler sonraki sette önce gelir</div>
      <ul class="erkl">${l.filter(x => !x.ok).map(x => `<li><b>${esc(x.x.de)}</b> <span class="soluk">${esc(x.x.tr)}</span></li>`).join('')}</ul>
      <div class="sira"><button class="btn ana" data-kn="yeni" type="button">Yeni set <kbd>Enter</kbd></button></div></div>`;
    const kok = g.querySelector('[data-kn-kok]');
    aktif = { kok, eylem: ad => { if (ad === 'yeni') { B.rm = null; rmCiz(govde() || g); return true; } return false; }, tusOzel: e => e.key === 'Enter' && aktif.eylem('yeni') };
  }

  // ---------- Shadowing: dinle → cümle gizlenir → söyle → doğrusu · sen · doğrusu ----------
  function shCiz(g) {
    const gorulen = B.shGor = B.shGor || new Set();
    const c = cumleSec({ maxKelime: 14, minBm: 0, gorulen });
    if (!c) { g.innerHTML = '<div class="bos">Önce birkaç kelime öğren; cümleleri buraya gelir.</div>'; return; }
    gorulen.add(c.de);
    g.innerHTML = `<div class="kn kn-shadow" data-kn-kok>
      <div class="kn-ust"><span class="chip">shadowing</span><span class="soluk">${deH(lab(c.id))}</span></div>
      <div class="kn-de kn-sh-cumle">${deH(c.de)}</div><div class="soluk kn-sh-tr">${esc(c.tr)}</div>
      ${MIK_HTML}
      <div class="kn-cevap" hidden></div>
      <div class="sira kn-dugmeler"><button class="btn ana" data-kn="basla" type="button">🔊 Dinle, sonra tekrarla <kbd>Enter</kbd></button><button class="btn" data-kn="yavas" type="button">🐢 Yavaş</button><button class="btn" data-kn="sonraki" type="button">Başka cümle</button></div>
    </div>`;
    const kok = g.querySelector('[data-kn-kok]'), q = aktif = { kok, durum: 'hazir', veri: c };
    kok.querySelector('.kn-mik').hidden = true;
    const goster = gizli => { kok.querySelector('.kn-sh-cumle').classList.toggle('kn-gizli', gizli); kok.querySelector('.kn-sh-tr').classList.toggle('kn-gizli', gizli); };
    const basla = async yavas => {
      if (q.durum !== 'hazir') return; q.durum = 'dinle';
      kok.querySelector('.kn-dugmeler').innerHTML = '<span class="soluk">dinle…</span>';
      const r = await oku(c.de, yavas ? { hiz: 0.7 } : {}); q.model = r.ms;
      if (aktif !== q || !gorunur(kok)) return;
      goster(true); q.durum = 'kayit';
      kok.querySelector('.kn-dugmeler').innerHTML = '<button class="btn ana" data-kn="dur" type="button">⏹ Söyledim <kbd>Enter</kbd></button>';
      const mk = kok.querySelector('.kn-mik'); mk.hidden = false;
      const k = await kayitAc({ enUzun: Math.max(6000, (q.model || 2500) * 2.5 + 3000), sessizlik: 1500, sesYoksa: 6000, seviye: seviyeCiz(kok), bekci: () => aktif === q && gorunur(kok) && q.durum === 'kayit',
        onSes: () => mikNot(kok, '● konuşuyorsun…') });
      if (aktif !== q || q.durum !== 'kayit') { if (k) k.iptal(); return; }
      if (!k) { mikNot(kok, 'kayıt yok: ezberden söyle, 4 sn sonra cümle görünür'); await bekle(4000); if (aktif === q && q.durum === 'kayit') bitti(null); return; }
      q.kayit = k; mikNot(kok, 'şimdi sen: ezberden söyle');
      const res = await k.sonuc; if (res && aktif === q && gorunur(kok)) bitti(res);
    };
    const bitti = r => {
      if (q.durum !== 'kayit') return; q.durum = 'sonuc'; goster(false);
      kok.querySelector('.kn-mik').hidden = true;
      q.url = r && r.url; q.ms = r ? r.ms : 0;
      cumleKullan(c);
      const o = r && r.olcu;
      log({ modus: 'sprechen', id: 'shadow:' + c.id, item: lab(c.id), frage: c.de, antwort: r ? `kayıt:${Math.round(r.ms / 1000)}sn` : 'kayıt:yok', ergebnis: 'gemacht', loesung: c.de,
        notiz: (r ? olcuNotiz(o, r.ms) : 'gecikme:yok | süre:0sn') + (q.model ? ` | model:${sn(q.model)}sn` : '') });
      say(); xp(5); kaydet();
      const c2 = kok.querySelector('.kn-cevap'); c2.hidden = false;
      c2.innerHTML = `<div class="kn-olcu soluk">${r ? olcuMetni(o, r.ms) : ''}${o && o.konusma && q.model ? ` · model ${snTR(q.model)} sn` : ''}</div>
        <div class="sira kn-dinle"><button class="btn" data-kn="model" type="button">🔊 Doğrusu</button>${q.url ? '<button class="btn" data-kn="kendi" type="button">▶ Kaydın</button><button class="btn" data-kn="aba" type="button">🔁 Doğrusu · sen · doğrusu</button>' : ''}</div>`;
      kok.querySelector('.kn-dugmeler').innerHTML = '<button class="btn ana" data-kn="sonraki" type="button">Sıradaki cümle <kbd>Enter</kbd></button>';
      if (q.url) abaCal();
    };
    const abaCal = async () => {
      const n = q.nesil = (q.nesil || 0) + 1, dv = () => aktif === q && gorunur(kok) && q.nesil === n;
      await oku(c.de); if (!dv()) return; await bekle(300); if (!dv()) return; await cal(q.url, q.ms); if (!dv()) return; await bekle(300); if (!dv()) return; await oku(c.de);
    };
    q.eylem = ad => {
      if (ad === 'basla') { basla(false); return true; }
      if (ad === 'yavas') { basla(true); return true; }
      if (ad === 'dur' && q.durum === 'kayit') { if (q.kayit) q.kayit.dur(); else bitti(null); return true; }
      if (ad === 'model') { oku(c.de); return true; }
      if (ad === 'kendi') { if (q.url) cal(q.url, q.ms); return true; }
      if (ad === 'aba') { abaCal(); return true; }
      if (ad === 'sonraki' && q.durum !== 'dinle' && q.durum !== 'kayit') { sus(); shCiz(govde() || g); return true; }
      return false;
    };
    q.tusOzel = e => e.key === 'Enter' && q.eylem(q.durum === 'hazir' ? 'basla' : q.durum === 'kayit' ? 'dur' : 'sonraki');
  }

  // ---------- Teil 2: 4/3/2 ----------
  function t2Ciz(g) {
    const T = B.t2 = B.t2 || { asama: 'sec', mod: 'uzun' };
    if (T.konuI == null) T.konuI = Math.floor(Math.random() * SP_KONULAR.length);
    const [de, tr] = SP_KONULAR[T.konuI], sure = T2_SURE[T.mod];
    saatKes();
    if (T.asama === 'sec') {
      const once = oncekiT2(T.konuI);
      g.innerHTML = `<div class="kn kn-t2" data-kn-kok>
        <div class="soru">${esc(de)}</div><div class="soluk">${esc(tr)} · <button class="btn mini" data-kn="konu" type="button">başka konu</button></div>
        <div class="kn-mod">${['uzun', 'kisa'].map(m => `<button class="chip${T.mod === m ? ' aktif' : ''}" data-kn="mod" data-m="${m}" type="button">${m === 'uzun' ? '4/3/2 · 3:00 → 2:15 → 1:30' : 'kısa · 60 → 45 → 30 sn'}</button>`).join('')}</div>
        <ol class="erkl sp-yapi">${T2_YAPI.map(x => `<li>${x}</li>`).join('')}</ol>
        <details class="ceviri"><summary>Redemittel (Teil 2)</summary><ul class="erkl">${kalipHTML('sprechen2')}</ul></details>
        <p class="aciklama">Önce 1 dakika plan (yalnız anahtar kelime not al), sonra aynı sunumu üç kez yap: her turda süre kısalır, notların gizlenir. Ölçülen: ses-zamanı oranı, 1 sn'den uzun duraklamalar, en uzun kesintisiz konuşma. Kayıtlar bu tarayıcıda kalır.</p>
        ${once}
        <div class="sira kn-dugmeler"><button class="btn ana" data-kn="plan" type="button">1 dk plan → başla <kbd>Enter</kbd></button></div></div>`;
      const kok = g.querySelector('[data-kn-kok]');
      aktif = { kok, eylem: (ad, el) => {
        if (ad === 'konu') { T.konuI = (T.konuI + 1 + Math.floor(Math.random() * (SP_KONULAR.length - 1))) % SP_KONULAR.length; t2Ciz(govde() || g); return true; }
        if (ad === 'mod') { T.mod = el.dataset.m; t2Ciz(govde() || g); return true; }
        if (ad === 'plan') { T.asama = 'plan'; T.planBit = now() + 60000; T.oturum = now(); T.sonuc = []; T.not = ''; t2Ciz(govde() || g); return true; }
        if (ad === 'onceki') { oncekiCal(T.konuI); return true; }
        return false;
      }, tusOzel: e => e.key === 'Enter' && aktif.eylem('plan') };
      return;
    }
    if (T.asama === 'plan') {
      g.innerHTML = `<div class="kn kn-t2" data-kn-kok>
        <div class="kn-ust"><span class="chip vurgu">plan · 1 dk</span><b class="kn-saat">1:00</b></div>
        <div class="soru">${esc(de)}</div>
        <ol class="erkl sp-yapi">${T2_YAPI.map(x => `<li>${x}</li>`).join('')}</ol>
        <textarea class="kn-not-alani" rows="5" placeholder="anahtar kelimeler (cümle değil)">${esc(T.not || '')}</textarea>
        <div class="sira kn-dugmeler"><button class="btn ana" data-kn="tur" type="button">Hazırım → 1. tur (${saat(sure[0])})</button></div></div>`;
      const kok = g.querySelector('[data-kn-kok]'), ta = kok.querySelector('textarea');
      ta.addEventListener('input', () => { T.not = ta.value; });
      const turaGec = () => { saatKes(); T.asama = 'tur'; T.no = 1; t2Ciz(govde() || g); };
      aktif = { kok, eylem: ad => { if (ad === 'tur') { turaGec(); return true; } return false; } };
      saatIv = setInterval(() => {
        if (!gorunur(kok)) { saatKes(); return; }
        const k = Math.max(0, Math.round((T.planBit - now()) / 1000)), el = kok.querySelector('.kn-saat'); if (el) el.textContent = saat(k);
        if (k <= 0) turaGec();
      }, 250);
      return;
    }
    if (T.asama === 'tur') {
      const hedef = sure[T.no - 1];
      g.innerHTML = `<div class="kn kn-t2" data-kn-kok>
        <div class="kn-ust"><span class="chip vurgu">${T.no}. tur / 3</span><b class="kn-saat">${saat(hedef)}</b></div>
        <div class="soru">${esc(de)}</div>
        <ol class="erkl sp-yapi kn-yapi-kucuk">${T2_YAPI.map(x => `<li>${x}</li>`).join('')}</ol>
        ${MIK_HTML}
        <div class="sira kn-dugmeler"><button class="btn ana" data-kn="dur" type="button">⏹ Bitir <kbd>Enter</kbd></button></div></div>`;
      const kok = g.querySelector('[data-kn-kok]'), q = aktif = { kok, durum: 'kayit' };
      const t0 = performance.now();
      const bitti = r => {
        if (q.durum !== 'kayit') return; q.durum = 'bitti'; saatKes();
        const ms = r ? r.ms : performance.now() - t0, o = r && r.olcu;
        const x = { no: T.no, hedef, ms, olcu: o, url: r && r.url };
        T.sonuc.push(x);
        log({ modus: 'sprechen', id: `teil2:${T.konuI}:t${T.no}`, item: 'teil2', frage: de, antwort: r ? `kayıt:${Math.round(ms / 1000)}sn` : 'kayıt:yok', ergebnis: 'gemacht', loesung: '',
          notiz: olcuNotiz(o, ms) + akiciNotiz(o) + ` | mod:${T.mod} | tur:${T.no}/3 | hedef:${hedef}sn` + (T.no === 1 && T.not ? ' | plan:not' : '') });
        say(); xp(15); kaydet();
        if (r) arsivEkle({ tur: 'teil2', konu: T.konuI, konuDe: de, mod: T.mod, no: T.no, oturum: T.oturum, ts: now(), ms, olcu: o, blob: r.blob });
        T.asama = T.no >= 3 ? 'ozet' : 'ara';
        t2Ciz(govde() || g);
      };
      q.eylem = ad => { if (ad === 'dur' && q.durum === 'kayit') { if (q.kayit) q.kayit.dur(); else bitti(null); return true; } return false; };
      q.tusOzel = e => e.key === 'Enter' && q.eylem('dur');
      const tik = t => { const el = kok.querySelector('.kn-saat'); if (el) { const k = Math.max(0, hedef - t / 1000); el.textContent = saat(Math.ceil(k)); el.classList.toggle('az', k <= 15); } };
      kayitAc({ enUzun: hedef * 1000, seviye: seviyeCiz(kok), onTik: tik, bekci: () => aktif === q && gorunur(kok) && q.durum === 'kayit', onSes: () => mikNot(kok, '● konuşuyorsun') }).then(k => {
        if (aktif !== q || q.durum !== 'kayit') { if (k) k.iptal(); return; }
        if (!k) {
          mikNot(kok, 'kayıt yok: süreyle konuş (ölçüm olmaz)');
          saatIv = setInterval(() => { if (!gorunur(kok)) { saatKes(); return; } const t = performance.now() - t0; tik(t); if (t >= hedef * 1000) bitti(null); }, 250);
          return;
        }
        q.kayit = k; mikNot(kok, 'konuş: notların gizli');
        k.sonuc.then(r => { if (r && aktif === q && gorunur(kok)) bitti(r); });
      });
      return;
    }
    // ara / özet: tur tur tablo
    const tablo = l => `<div class="kn-tablo-kap"><table class="kn-tablo"><thead><tr><th>tur</th><th>süre</th><th>ses-zamanı</th><th>duraklama ≥ 1 sn</th><th>en uzun akış</th></tr></thead><tbody>${l.map(x => `<tr><td>${x.no}</td><td>${saat(Math.round(x.ms / 1000))} / ${saat(x.hedef)}</td><td>${x.olcu ? '%' + Math.round(x.olcu.oran * 100) : '–'}</td><td>${x.olcu ? x.olcu.duraklama : '–'}</td><td>${x.olcu ? snTR(x.olcu.akis) + ' sn' : '–'}</td></tr>`).join('')}</tbody></table></div>`;
    const dinle = T.sonuc.map((x, i) => (x.url ? `<button class="btn" data-kn="tdinle" data-i="${i}" type="button">▶ ${x.no}. tur</button>` : '')).join('');
    if (T.asama === 'ara') {
      g.innerHTML = `<div class="kn kn-t2" data-kn-kok><div class="soru">${esc(de)}</div>${tablo(T.sonuc)}
        <p class="aciklama">Aynı sunumu şimdi daha kısa sürede yap: aynı fikirler, daha az duraklama.</p>
        <div class="sira kn-dinle">${dinle}</div>
        <div class="sira kn-dugmeler"><button class="btn ana" data-kn="tur" type="button">${T.no + 1}. tur (${saat(sure[T.no])}) <kbd>Enter</kbd></button></div></div>`;
    } else {
      g.innerHTML = `<div class="kn kn-t2" data-kn-kok><div class="buyuk-kelime">4/3/2 bitti ✓</div><div class="soru">${esc(de)}</div>${tablo(T.sonuc)}
        <div class="kn-once"></div>
        <div class="sira kn-dinle">${dinle}</div>
        <p class="aciklama">2–4 gün sonra aynı konuyu bir kez daha anlat (sabit süre, doğruluğa dikkat: fiil 2. yerde, weil'de sonda).</p>
        <div class="sira kn-dugmeler"><button class="btn ana" data-kn="yeni" type="button">Yeni konu <kbd>Enter</kbd></button><button class="btn" data-kn="ilerleme" type="button">Haftalık tablo</button></div></div>`;
      oturumKarsilastir(g.querySelector('.kn-once'), T);
    }
    const kok = g.querySelector('[data-kn-kok]');
    aktif = { kok, eylem: (ad, el) => {
      if (ad === 'tur' && T.asama === 'ara') { T.no++; T.asama = 'tur'; t2Ciz(govde() || g); return true; }
      if (ad === 'tdinle') { const x = T.sonuc[+el.dataset.i]; sus(); if (x && x.url) cal(x.url, x.ms); return true; }
      if (ad === 'yeni') { B.t2 = { asama: 'sec', mod: T.mod }; t2Ciz(govde() || g); return true; }
      if (ad === 'ilerleme') { B.sekme = 'ilerleme'; render(); return true; }
      if (ad === 'onceki') { oncekiCal(T.konuI, T.oturum); return true; }
      return false;
    }, tusOzel: e => e.key === 'Enter' && aktif.eylem(T.asama === 'ara' ? 'tur' : 'yeni') };
  }
  // log'dan aynı konunun önceki 4/3/2 oturumları (son turun ölçüsü)
  function oncekiT2(konuI) {
    const S = St(), l = ((S && S.log) || []).filter(e => e && e.modus === 'sprechen' && new RegExp(`^teil2:${konuI}:t\\d$`).test(e.id || ''));
    if (!l.length) return '';
    const son = l[l.length - 1];
    return `<div class="soluk kn-once-ozet">Bu konuyu ${l.length} tur anlattın · son: ${son.zeit.slice(0, 10)}, ses-zamanı %${al(son.notiz, 'oran') ?? '–'}, duraklama ${al(son.notiz, 'duraklama') ?? '–'} · <button class="btn mini" data-kn="onceki" type="button">▶ önceki kayıt</button></div>`;
  }
  function oncekiCal(konuI, haric) {
    arsivHepsi().then(l => {
      const r = l.filter(x => x.tur === 'teil2' && x.konu === konuI && x.blob && x.oturum !== haric).sort((a, b) => b.ts - a.ts)[0];
      if (!r) { if (A.toast) A.toast('Bu konunun önceki kaydı bu tarayıcıda yok.'); return; }
      sus(); const u = URL.createObjectURL(r.blob); cal(u, r.ms).then(() => URL.revokeObjectURL(u));
    });
  }
  // aynı konunun bir önceki oturumu (IndexedDB): tur tur ölçü karşılaştırması
  function oturumKarsilastir(el, T) {
    if (!el) return;
    arsivHepsi().then(l => {
      const onc = l.filter(x => x.tur === 'teil2' && x.konu === T.konuI && x.oturum !== T.oturum).sort((a, b) => b.ts - a.ts);
      if (!onc.length || !el.isConnected) return;
      const ot = onc[0].oturum, eski = onc.filter(x => x.oturum === ot).sort((a, b) => a.no - b.no);
      const ort = (L, f) => { const v = L.map(f).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
      const yeniO = ort(T.sonuc, x => x.olcu && x.olcu.oran), eskiO = ort(eski, x => x.olcu && x.olcu.oran);
      const yeniD = ort(T.sonuc, x => x.olcu && x.olcu.duraklama / Math.max(0.5, x.ms / 60000)), eskiD = ort(eski, x => x.olcu && x.olcu.duraklama / Math.max(0.5, x.ms / 60000));
      const f = (a, b, yuzde, azIyi) => (a == null || b == null ? '–' : `${yuzde ? '%' + Math.round(b * 100) : b.toFixed(1)} → <b>${yuzde ? '%' + Math.round(a * 100) : a.toFixed(1)}</b> ${(azIyi ? a < b : a > b) ? '✓' : ''}`);
      el.innerHTML = `<div class="kn-karsilastir"><b>Önceki oturumla</b> (${new Date(onc[0].ts).toLocaleDateString('tr-TR')}): ses-zamanı ${f(yeniO, eskiO, true)} · duraklama/dk ${f(yeniD, eskiD, false, true)}
        ${onc[0].blob ? ' · <button class="btn mini" data-kn="onceki" type="button">▶ önceki kayıt</button>' : ''}</div>`;
    });
  }

  // ---------- Teil 1 / Teil 3 (kayıt + ölçüm; öz-değerlendirme yok) ----------
  function t13Ciz(g) {
    const t1 = B.sekme === 'teil1';
    const X = B[B.sekme] = B[B.sekme] || {};
    if (X.i == null) X.i = Math.floor(Math.random() * (t1 ? SP_PLAN : SP_KONULAR).length);
    const [de, tr] = (t1 ? SP_PLAN : SP_KONULAR)[X.i], enUzun = t1 ? 240000 : 90000;
    g.innerHTML = `<div class="kn kn-t13" data-kn-kok>
      <div class="soru">${t1 ? esc(de) : `Partnerin „${esc(de)}“ sundu.`}</div><div class="soluk">${esc(tr)} · <button class="btn mini" data-kn="baska" type="button">başka ${t1 ? 'görev' : 'konu'}</button></div>
      <p class="aciklama">${t1 ? 'Sınavda partnerinle 4 noktayı birlikte kararlaştırırsın (öneri → tepki → karşı öneri → anlaşma). Burada iki rolü de sen konuş; her noktada en az bir öneri + bir tepki.' : 'Teil 3: sunuma kısa bir tepki ver (ne hoşuna gitti) ve bir soru sor; sonra kendi sunumuna gelen bir soruya cevap ver. 30–45 saniye.'}</p>
      <details class="ceviri"${t1 ? ' open' : ''}><summary>Redemittel (Teil ${t1 ? 1 : 3})</summary><ul class="erkl">${kalipHTML(t1 ? 'sprechen1' : 'sprechen3')}</ul></details>
      ${MIK_HTML}
      <div class="kn-cevap" hidden></div>
      <div class="sira kn-dugmeler"><button class="btn ana" data-kn="kayit" type="button">🎙️ Başla (kayıt) <kbd>Enter</kbd></button></div></div>`;
    const kok = g.querySelector('[data-kn-kok]'), q = aktif = { kok, durum: 'hazir' };
    kok.querySelector('.kn-mik').hidden = true;
    const bitti = r => {
      if (q.durum !== 'kayit') return; q.durum = 'sonuc';
      const o = r && r.olcu; q.url = r && r.url; q.ms = r ? r.ms : 0;
      log({ modus: 'sprechen', id: `${B.sekme}:${X.i}`, item: B.sekme, frage: de, antwort: r ? `kayıt:${Math.round(r.ms / 1000)}sn` : 'kayıt:yok', ergebnis: 'gemacht', loesung: '', notiz: olcuNotiz(o, q.ms) + akiciNotiz(o) });
      say(); xp(t1 ? 25 : 15); kaydet();
      if (r) arsivEkle({ tur: B.sekme, konu: X.i, konuDe: de, no: 1, oturum: now(), ts: now(), ms: r.ms, olcu: o, blob: r.blob });
      kok.querySelector('.kn-mik').hidden = true;
      const c = kok.querySelector('.kn-cevap'); c.hidden = false;
      c.innerHTML = `<div class="kn-olcu">${o ? `süre ${saat(Math.round(r.ms / 1000))} · ses-zamanı %${Math.round(o.oran * 100)} · duraklama ≥ 1 sn: ${o.duraklama} · en uzun akış ${snTR(o.akis)} sn` : 'kayıt yok'}</div>${q.url ? '<div class="sira"><button class="btn" data-kn="kendi" type="button">▶ Kaydın</button></div>' : ''}`;
      kok.querySelector('.kn-dugmeler').innerHTML = `<button class="btn ana" data-kn="baska" type="button">Başka ${t1 ? 'görev' : 'konu'} <kbd>Enter</kbd></button>`;
    };
    q.eylem = ad => {
      if (ad === 'baska' && q.durum !== 'kayit') { X.i = (X.i + 1) % (t1 ? SP_PLAN : SP_KONULAR).length; t13Ciz(govde() || g); return true; }
      if (ad === 'kendi') { if (q.url) cal(q.url, q.ms); return true; }
      if (ad === 'dur' && q.durum === 'kayit') { if (q.kayit) q.kayit.dur(); else bitti(null); return true; }
      if (ad === 'kayit' && q.durum === 'hazir') {
        q.durum = 'kayit';
        kok.querySelector('.kn-mik').hidden = false;
        kok.querySelector('.kn-dugmeler').innerHTML = '<button class="btn ana" data-kn="dur" type="button">⏹ Bitir <kbd>Enter</kbd></button>';
        kayitAc({ enUzun, seviye: seviyeCiz(kok), bekci: () => aktif === q && gorunur(kok) && q.durum === 'kayit', onSes: () => mikNot(kok, '● konuşuyorsun') }).then(k => {
          if (aktif !== q || q.durum !== 'kayit') { if (k) k.iptal(); return; }
          if (!k) { mikNot(kok, 'kayıt yok: yine de sesli konuş, bitince Bitir'); return; }
          q.kayit = k; mikNot(kok, 'konuş');
          k.sonuc.then(r => { if (r && aktif === q && gorunur(kok)) bitti(r); });
        });
        return true;
      }
      return false;
    };
    q.tusOzel = e => e.key === 'Enter' && q.eylem(q.durum === 'hazir' ? 'kayit' : q.durum === 'kayit' ? 'dur' : 'baska');
  }

  // ---------- İlerleme: haftalık tablo (log'dan), kulak haritası, kayıt arşivi ----------
  const haftaBasi = z => { const d = new Date(z.slice(0, 10) + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
  function haftalik() {
    const S = St(), h = {};
    ((S && S.log) || []).forEach(e => {
      if (!e || !e.zeit || (e.modus !== 'sprechen' && e.modus !== 'hoer')) return;
      const w = h[haftaBasi(e.zeit)] = h[haftaBasi(e.zeit)] || { sn: 0, t2: 0, oran: [], dur: [], akis: 0, gec: [], hd: 0, hn: 0 };
      if (e.modus === 'hoer') { w.hn++; if (e.ergebnis === 'richtig') w.hd++; return; }
      const sure = al(e.notiz, 'süre') || 0; w.sn += sure;
      if (/^teil2:/.test(e.id || '')) {
        w.t2++;
        const o = al(e.notiz, 'oran'), d = al(e.notiz, 'duraklama'), a = al(e.notiz, 'akış');
        if (o != null) w.oran.push(o); if (d != null && sure > 5) w.dur.push(d / (sure / 60)); if (a != null) w.akis = Math.max(w.akis, a);
      }
      if (/^(soyle|rm|shadow):/.test(e.id || '')) { const g = al(e.notiz, 'gecikme'); if (g != null) w.gec.push(g); }
    });
    return Object.keys(h).sort().reverse().slice(0, 8).map(k => Object.assign({ hafta: k }, h[k]));
  }
  function ilCiz(g) {
    const ort = l => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : null), med = l => { if (!l.length) return null; const s = l.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
    const hl = haftalik();
    const tablo = hl.length ? `<div class="kn-tablo-kap"><table class="kn-tablo"><thead><tr><th>hafta</th><th>konuşma</th><th>Teil 2 turu</th><th>ses-zamanı</th><th>duraklama/dk</th><th>en uzun akış</th><th>başlama (ortanca)</th><th>dinleme</th></tr></thead><tbody>${hl.map(w => `<tr><td>${new Date(w.hafta + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</td><td>${saat(Math.round(w.sn))}</td><td>${w.t2 || '–'}</td><td>${w.oran.length ? '%' + Math.round(ort(w.oran)) : '–'}</td><td>${w.dur.length ? ort(w.dur).toFixed(1).replace('.', ',') : '–'}</td><td>${w.akis ? snTR(w.akis * 1000) + ' sn' : '–'}</td><td>${w.gec.length ? snTR(med(w.gec) * 1000) + ' sn' : '–'}</td><td>${w.hn ? `${w.hd}/${w.hn}` : '–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="soluk">Henüz konuşma kaydı yok.</div>';
    g.innerHTML = `<div class="kn kn-ilerleme" data-kn-kok>
      <h3>Haftalık</h3>${tablo}
      <p class="aciklama">Ses-zamanı yükselmeli, duraklama/dk ve başlama süresi düşmeli. Ölçüm yalnız sesin enerjisinden: ne söylediğini değil, ne kadar akıcı söylediğini gösterir.</p>
      <h3>Kulak haritası</h3>${kulakHaritasi(hoerSt())}
      <h3>Kayıtlar</h3><div class="kn-arsiv soluk">yükleniyor…</div></div>`;
    const kok = g.querySelector('[data-kn-kok]'), urls = [];
    aktif = { kok, eylem: (ad, el) => { if (ad === 'arsiv') { const u = urls[+el.dataset.i]; sus(); if (u) cal(u.url, u.ms); return true; } return false; } };
    arsivHepsi().then(l => {
      const el = kok.querySelector('.kn-arsiv'); if (!el || !el.isConnected) return;
      const son = l.filter(r => r.blob).sort((a, b) => b.ts - a.ts).slice(0, 12);
      if (!son.length) { el.textContent = 'Bu tarayıcıda kayıt yok.'; return; }
      el.classList.remove('soluk');
      el.innerHTML = son.map((r, i) => { urls.push({ url: URL.createObjectURL(r.blob), ms: r.ms }); return `<div class="kn-arsiv-satir"><button class="btn" data-kn="arsiv" data-i="${i}" type="button">▶</button><span>${new Date(r.ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · ${esc(r.tur === 'teil2' ? `Teil 2 · ${r.no}. tur` : r.tur === 'teil1' ? 'Teil 1' : 'Teil 3')} · ${esc(r.konuDe || '')}${r.olcu ? ` · %${Math.round(r.olcu.oran * 100)} · ${r.olcu.duraklama} duraklama` : ''}</span></div>`; }).join('');
    });
  }

  // ================= Bugün kartı: "2 dk konuş" =================
  const GUNLUK = [
    { sekme: 'rm', b: '2 dk konuş · kalıplar', alt: '8 Redemittel: Türkçesini gör, 3 sn içinde sesli söyle' },
    { sekme: 'teil2k', b: '2 dk konuş · Teil 2 kısa', alt: 'aynı konu 60 → 45 → 30 sn (önce 1 dk plan)' },
    { sekme: 'shadow', b: '2 dk konuş · shadowing', alt: 'dinle, cümle gizlenir, ezberden tekrarla' },
  ];
  function gunlukIs() { const g = gunOf(now()), n = Math.round(new Date(g + 'T12:00:00').getTime() / DAY); return GUNLUK[((n % 3) + 3) % 3]; }
  function anaKart() {
    if (!St()) return '';
    olaylariBagla();
    const x = gunlukIs(), s = bugunSn(), tamam = s >= HEDEF_SN;
    return `<div class="isler kn-ana-kap"><button class="is-kart kn-ana${tamam ? ' bitti' : ''}" data-modus="sprechen" data-kn-ana="${x.sekme}" type="button"><span class="is-ikon">${tamam ? '✓' : '🎙️'}</span><span class="is-metin"><b>${esc(x.b)}</b><span>${tamam ? `bugün ${saat(s)} konuştun ✓` : esc(x.alt) + (s ? ` · ${saat(s)} / 2:00` : '')}</span>${tamam ? '' : `<span class="is-cubuk"><span style="width:${Math.min(100, s / HEDEF_SN * 100).toFixed(0)}%"></span></span>`}</span><span class="is-ok">›</span></button></div>`;
  }

  // ================= Dışa açılan =================
  function init(api) {
    A = Object.assign({}, A, api || {});
    olaylariBagla(); izinIzle();
    try { if (ttsVar()) speechSynthesis.getVoices(); } catch (e) { /* yok */ }
  }
  root.Konus = {
    init, turSorusu, render, sekme, anaKart,
    turRender: (kart, soru, bitti) => soru && soru.render(kart, bitti),
    turTus: e => !!(aktif && aktif.modul === 'konus' && aktif.tus(e)), turKlick: e => ISLENDI.has(e),
    klick: e => ISLENDI.has(e), tus: e => ISLENDI.has(e),
    cik: () => { aktif = null; kayitKes(); sus(); saatKes(); },
    sesVar: () => ({ soyle: mikVar() && ttsVar(), hoer: hoerVar(), mikrofon: mikDestek() ? (mikVar() ? mikIzin : 'red') : 'yok' }),
    // test / araç
    _analiz: analiz, _hoerSec: hoerSec, _cumleSec: cumleSec, _bugunSn: bugunSn, _haftalik: haftalik, get _aktif() { return aktif; }, _arsiv: arsivHepsi,
  };
})(typeof window !== 'undefined' ? window : globalThis);
