// Dinleme (6.11; sözleşme S2): turdaki ses yuvası 'duy' ve Okuma'da DW "Dinleme modu". Uygulamaya Dinle.init(api) ile bağlı.
// Tur yuvası: uygulama (js/app.js sesTurFrage) Kern.sec { tur:'ses', alt:'duy' } verince Dinle.turSorusu(api, sel) çağırır → soru nesnesi
// { id, tur, render(kartEl, bitti), tus(e), klick(e), test(dogru) } ya da null (yuva atlanır). Soru kendini çizer, notu verir, log satırını yazar
// ve bitti({ urteil, antwort }) ile döner; sayaç / puan / oturumIsle / Devam uygulamanın. Öğe hafızasına YAZMAZ.
// duy türleri (bildiği kelimeler: m.S ≥ 1):
//   kelime  sesten tanıma: yazı gizli, ses 1 kez kendiliğinden (+ tekrar / yavaş), şıklar (Türkçe anlam, api.optionen) ses bitince açılır
//   bosluk  cümle tam okunur, ekranda boşluklu; duyduğu çekimli biçimi yazar (G.bosPruef)
//   dikte   bildiği kelimenin cümlesi dinlenip yazılır (diktePruef: G.cumleKontrol; hâl / çekim / yanlış kelime yazım sayılmaz)
// Log: modus duy, id <öğe>:duy-kelime|duy-bosluk|duy-dikte, notiz `tür:kelime | hız:0.9 | tekrar:N | sek:N` (+ etiketler, dikte:ek|işlev|kelime).
// Dinleme modu (Okuma, ses adresi olan DW metni): tahmin (başlık + 3 anahtar kelime) → metinsiz dinle → boşluklu metin (bildiği + B1 kelimeleri)
// → metinle dinle; hız 0,75 / 1,0; 5 sn geri. Log modus lesen, id <metin>:dinle, ergebnis gelesen, notiz `puan:x/y | hız:… | geri:N | dk:N`.
(function (root) {
  'use strict';
  let A = null;
  const DAY = 86400000;
  const TURLER = ['kelime', 'bosluk', 'dikte'];
  const esc = s => (A && A.esc ? A.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]));
  const shuffle = l => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const okunus = id => A.label(id).replace('sich(D)', 'sich').replace(/\s*…\s*/g, ' ').trim();
  const hiz = () => (A && A.sesHiz ? A.sesHiz() : 0.9);
  const durum = () => { const S = A.S(); return (S.dinle = S.dinle || { i: 0, son: {}, satz: {} }); };
  const inInput = e => /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');

  // ---------- dikte kontrolü (app.js aktPruef / ünite diktesi de kullanır) ----------
  // G.cumleKontrol: yazım / umlaut → fast 'yazım'; hâl / çekim (dem → den, hat → hast) → 'artikel/çekim'; edat (vor → von) ve yanlış kelime → falsch.
  // Dikte duyduğunu yazmaktır: geçerli başka diziliş doğru sayılmaz (fast + 'kelime sırası'). Hata türü: dikte:ek (aynı kök, başka ek),
  // dikte:işlev (kısa işlev kelimesi: artikel, edat, zamir, yardımcı fiil), dikte:kelime (içerik kelimesi), dikte:yazım.
  const D_PRAEP = /^(an|am|ans|auf|aufs|in|im|ins|über|unter|vor|hinter|neben|zwischen|mit|nach|zu|zum|zur|von|vom|bei|beim|aus|seit|für|um|gegen|ohne|durch|bis)$/i;
  const D_ISLEV = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|kein|keine|keinen|keinem|keiner|mein|meine|meinen|meinem|meiner|dein|deine|sein|seine|seinen|seinem|seiner|ihr|ihre|ihren|ihrem|ihrer|unser|unsere|ist|sind|bin|bist|seid|war|waren|hat|hast|habe|haben|hatte|habt|wird|wirst|werden|kann|kannst|muss|musst|will|soll|darf|es|er|sie|ich|du|wir|ihm|ihn|ihnen|mir|mich|dir|dich|uns|euch|sich|man|und|oder|aber|denn|dass|wenn|weil|als|wie|so|zu|nicht|noch|schon|auch|nur|ja|doch|mal|eben|da|dort|hier)$/i;
  const D_EK = /^(e|en|n|s|es|er|ern|r|m|em|t|st|et|est|te|ten|tet)?$/;
  function ekFark(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a === b) return false;
    let c = 0; while (c < a.length && c < b.length && a[c] === b[c]) c++;
    return c >= 2 && D_EK.test(a.slice(c)) && D_EK.test(b.slice(c));
  }
  const dNorm = s => String(s || '').toLowerCase().replace(/[.,!?;:„“"()…«»‚‘’]/g, ' ').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').split(/\s+/).filter(Boolean);
  function diktePruef(G, eingabe, ziel) {
    G = G || root.G;
    if (!String(eingabe || '').trim()) return { u: 'falsch', tags: ['bilmiyorum'], kat: [], diff: [], hinweis: 'bilmiyorum' };
    const r = G.cumleKontrol(eingabe, [ziel]);
    let u = r.urteil;
    const tags = r.tags.filter(t => t !== 'farklı cümle' || u === 'falsch');
    if (u === 'richtig') {
      const a = dNorm(eingabe), b = dNorm(ziel);
      if (a.join(' ') !== b.join(' ') && a.slice().sort().join(' ') === b.slice().sort().join(' ')) { u = 'fast'; tags.push('kelime sırası'); }
    }
    const kat = new Set();
    (r.diff || []).forEach(x => {
      if (x.t === 'ok' || x.t === 'yer') return;
      if (x.t === 'yazim') { kat.add('yazım'); return; }
      const w = x.w || '', d = x.d || '';
      if (w && d) kat.add(D_PRAEP.test(w) && D_PRAEP.test(d) ? 'işlev' : ekFark(w, d) ? 'ek' : D_ISLEV.test(d) || D_ISLEV.test(w) ? 'işlev' : 'kelime');
      else kat.add(D_ISLEV.test(d || w) ? 'işlev' : 'kelime');
    });
    const tl = tags.filter(t => t !== 'büyük/küçük harf' || u !== 'richtig');
    return { u, tags: tl, kat: [...kat], diff: r.diff || [], hinweis: tl.join(', ') };
  }
  // fark gösterimi: doğru kelime düz, yanlış yazılan üstü çizili + doğrusu, eksik yeşil, fazla üstü çizili
  function farkHTML(diff) {
    return (diff || []).map(x => {
      if (x.t === 'ok') return esc(x.w);
      if (x.t === 'yer') return `<span class="dn-yer">${esc(x.w)}</span>`;
      if (x.t === 'eksik') return `<b class="dn-eksik">${esc(x.d)}</b>`;
      if (x.t === 'fazla') return `<s class="dn-fazla">${esc(x.w)}</s>`;
      return `<s class="dn-fazla">${esc(x.w)}</s> <b class="dn-eksik">${esc(x.d)}</b>`;
    }).join(' ');
  }

  // ---------- aday seçimi ----------
  // bildiği kelimeler (m.S ≥ 1, A1 değil, paket değil); turda son 8 soruda geçenler hariç; uzun süredir dinlenmeyen önce
  function adaylar() {
    const S = A.S(), t = A.now(), st = durum(), ot = (A.ot && A.ot()) || {};
    const yakin = new Set((ot.gecmis || []).slice(-8).map(x => x.id).filter(Boolean));
    const l = Object.keys(S.items).filter(id => {
      const it = S.items[id];
      return it && it.m && (it.m.S || 0) >= 1 && !it.a1 && A.kind(id) !== 'p' && A.gueltig(id) && !yakin.has(id);
    });
    const son = id => st.son[id] || 0;
    // 3 günde dinlenmemişler, en eski önce; aynı kümede karışık
    return shuffle(l).sort((a, b) => (t - son(a) < 3 * DAY) - (t - son(b) < 3 * DAY) || son(a) - son(b));
  }
  // cümle: kendi çeviri cümleleri (Türkçesiyle) önce, sonra Goethe / metin cümleleri; 20 günde dinlenmemiş; boşluğu bulunabilen
  function cumleSec(id, maxW) {
    const st = durum(), t = A.now(), p = A.satzPool(id) || { own: [], extra: [] };
    const uygun = x => { const n = x.de.split(/\s+/).length; return n >= 4 && n <= maxW && !(st.satz[x.de] && t - st.satz[x.de] < 20 * DAY) && /[.!?]$/.test(x.de.trim()); };
    const own = shuffle((p.own || []).filter(uygun)), ext = shuffle((p.extra || []).filter(uygun));
    for (const x of own.concat(ext)) { const l = A.wortLuecke(id, x.de); if (l && l.answer) return { de: x.de, tr: x.tr || '', l }; }
    return null;
  }

  // ---------- ortak kart parçaları ----------
  function sesUst(baslik, alt) {
    return `<div class="tur"><span class="yeni">dinle</span><span>${esc(baslik)}</span></div>${alt || ''}
      <div class="dn-ses"><button class="btn buyuk dn-cal" data-dn="cal" type="button">🔊 Dinle <kbd>Boşluk</kbd></button><button class="btn dn-yavas" data-dn="yavas" type="button">🐢 yavaş</button></div>`;
  }
  const yazKutu = ph => `<div class="yaz-kutu"><input id="cevap" type="text" enterkeyhint="go" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(ph)}" aria-label="Cevap">${A.umlaut || ''}</div>`;

  // soru nesnesi: ortak akış (ses, tekrar sayısı, süre, bitti, log)
  function soruYap(tur, id, o) {
    const q = { id, tur: 'duy-' + tur, dTur: tur, el: null, bitti: null, tekrar: 0, start: 0, cevaplandi: false, metin: o.metin, yavasMetin: o.metin };
    q.cal = yavas => {
      if (q.calindi) q.tekrar++;
      q.calindi = true;
      A.sprich(q.metin, yavas ? Math.max(0.55, hiz() - 0.25) : hiz(), () => { if (q.sesBitti) q.sesBitti(); });
    };
    q.sonuc = (urteil, antwort, loesung, etiket, html) => {
      if (q.cevaplandi) return;
      q.cevaplandi = true;
      const st = durum(), sek = Math.round((A.now() - q.start) / 1000);
      st.son[id] = A.now();
      if (o.satz) st.satz[o.satz] = A.now();
      st.n = st.n || {}; st.n[tur] = (st.n[tur] || 0) + 1;
      const notiz = [`tür:${tur}`, `hız:${hiz()}`, `tekrar:${q.tekrar}`].concat(etiket || [], [`sek:${sek}`]).join(' | ');
      A.logEintrag({ modus: 'duy', id: `${id}:duy-${tur}`, item: A.label(id), frage: o.frage || '', antwort: antwort || '', ergebnis: urteil, loesung: loesung || '', notiz });
      const yer = q.el && q.el.querySelector('#sonuc'), alt = q.el && q.el.querySelector('#q-alt');
      if (alt) alt.hidden = true;
      if (yer) yer.innerHTML = `<div class="sonuc ${urteil} dn-sonuc"><div class="baslik">${urteil === 'richtig' ? '✓ Doğru' : urteil === 'fast' ? '≈ Küçük hata' : '✗ Yanlış'}${(etiket || []).filter(x => !/^(dikte:|şık:)/.test(x)).length ? `<span class="etiketler">${(etiket || []).filter(x => !/^(dikte:|şık:)/.test(x)).map(x => `<span class="etiket">${esc(x)}</span>`).join('')}</span>` : ''}</div>${html || ''}</div>`;
      if (q.el) q.el.classList.add('cevaplandi');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      A.save();
      if (q.bitti) q.bitti({ urteil, antwort: antwort || '' });
    };
    return q;
  }
  // ortak tuşlar: Boşluk (girdide değilse) dinle, 0 bilmiyorum (girdide değilse)
  function ortakTus(q, e) {
    if (q.cevaplandi) return false;
    if ((e.key === ' ' || e.code === 'Space') && !inInput(e)) { e.preventDefault(); q.cal(false); return true; }
    if (e.key === '0' && !inInput(e)) { e.preventDefault(); q.bilmiyorum(); return true; }
    return false;
  }
  function ortakKlick(q, e) {
    const b = e.target.closest('[data-dn]'); if (!b || q.cevaplandi) return false;
    const a = b.dataset.dn;
    if (a === 'cal') { q.cal(false); return true; }
    if (a === 'yavas') { q.cal(true); return true; }
    if (a === 'bilmiyorum') { q.bilmiyorum(); return true; }
    if (a === 'kontrol') { q.kontrol(); return true; }
    return false;
  }

  // ---------- (a) sesten kelime tanıma ----------
  function kelimeSoru(id) {
    const opts = A.optionen(id);
    if (!opts || opts.length < 2 || !opts.some(o => o.ok)) return null;
    const q = soruYap('kelime', id, { metin: okunus(id), frage: 'ses: ' + okunus(id) });
    q.opts = opts;
    const ac = () => {
      if (q.acik || !q.el) return;
      q.acik = true;
      const s = q.el.querySelector('#dn-sik'), b = q.el.querySelector('#dn-bekle');
      if (s) s.hidden = false; if (b) b.hidden = true;
    };
    q.sesBitti = () => { if (A.later) A.later(ac, 250); else ac(); };
    q.render = (el, bitti) => {
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="kelime">${sesUst('sesten tanı: duyduğun kelime ne demek?', '')}
          <div class="soluk dn-bekle" id="dn-bekle">yazısı gizli · şıklar ses bitince açılır</div></div>
        <div class="q-alt" id="q-alt"><div class="dn-sik" id="dn-sik" hidden>${q.opts.map((o, i) => `<button class="dn-opt" data-dn-sik="${i}" type="button"><kbd>${i + 1}</kbd> ${esc(o.t)}</button>`).join('')}</div>
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum <kbd>0</kbd></button><span class="soluk">tekrar dinle: <kbd>Boşluk</kbd></span></div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      q.cal(false);
      // ses gelmezse (TTS yok / izin yok) şıklar yine açılır
      if (A.later) A.later(ac, 2600 / Math.max(0.6, hiz())); else setTimeout(ac, 2600);
    };
    q.sec = i => {
      if (q.cevaplandi) return;
      if (!q.acik) { ac(); return; }
      const o = q.opts[i]; if (!o) return;
      const ok = !!o.ok, dogru = q.opts.find(x => x.ok);
      q.el.querySelectorAll('.dn-opt').forEach((b, k) => { b.disabled = true; if (q.opts[k].ok) b.classList.add('dogru'); else if (k === i) b.classList.add('yanlis'); });
      q.sonuc(ok ? 'richtig' : 'falsch', o.t, dogru.t, ok ? [] : [], `<div class="satir"><span class="et">kelime</span><span class="deger">${A.deItemHTML(id)} <button class="btn mini ses-mini" data-sprich="${esc(okunus(id))}" type="button" aria-label="Dinle">🔊</button></span></div><div class="soluk">${esc(dogru.t)}</div>`);
    };
    q.bilmiyorum = () => { const dogru = q.opts.find(x => x.ok); q.sonuc('falsch', '', dogru.t, ['bilmiyorum'], `<div class="satir"><span class="et">kelime</span><span class="deger">${A.deItemHTML(id)}</span></div><div class="soluk">${esc(dogru.t)}</div>`); };
    q.tus = e => {
      if (ortakTus(q, e)) return true;
      if (!q.cevaplandi && /^[1-9]$/.test(e.key) && +e.key <= q.opts.length) { e.preventDefault(); q.sec(+e.key - 1); return true; }
      return false;
    };
    q.klick = e => {
      if (ortakKlick(q, e)) return true;
      const b = e.target.closest('[data-dn-sik]'); if (b && !q.cevaplandi) { q.sec(+b.dataset.dnSik); return true; }
      return false;
    };
    q.test = dogru => { ac(); const i = q.opts.findIndex(o => !!o.ok === !!dogru); q.sec(i < 0 ? 0 : i); };
    q.cevap = () => q.opts.findIndex(o => o.ok);
    return q;
  }

  // ---------- (b) sesli boşluklu cümle ----------
  function boslukSoru(id) {
    const c = cumleSec(id, 16); if (!c) return null;
    const q = soruYap('bosluk', id, { metin: c.de, frage: c.l.text, satz: c.de });
    q.ziel = c.l.answer;
    const satzHTML = () => A.deHTML(c.l.text).replace(/_____/g, '<span class="bosluk">_____</span>');
    q.render = (el, bitti) => {
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="bosluk">${sesUst('cümleyi dinle, boşluğa duyduğunu yaz', '')}
          <div class="soru de dn-satz">${satzHTML()}</div>${c.l.n > 1 ? `<div class="soluk">${c.l.n} boşluk: sırayla, boşlukla ayırarak yaz</div>` : ''}</div>
        <div class="q-alt" id="q-alt">${yazKutu('duyduğun kelime(ler)')}
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum</button><button class="btn ana" data-dn="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      const i = el.querySelector('#cevap'); if (i) i.focus();
      q.cal(false);
    };
    q.kontrol = () => {
      if (q.cevaplandi) return;
      const i = q.el.querySelector('#cevap'), v = i ? i.value.trim() : '';
      if (!v) { q.bilmiyorum(); return; }
      const r = A.G.bosPruef(v, q.ziel);
      const urteil = r.urteil === 'richtig' ? 'richtig' : r.urteil === 'fast' ? 'fast' : 'falsch';
      q.sonuc(urteil, v, q.ziel, urteil === 'richtig' ? [] : (r.tags || []), loesHTML());
    };
    const loesHTML = () => { const w = q.ziel.split(' '); let k = 0; return `<div class="satir"><span class="et">cümle</span><span class="deger">${A.deHTML(c.l.text.replace(/_____/g, () => w[k++] || ''))} <button class="btn mini ses-mini" data-sprich="${esc(c.de)}" type="button" aria-label="Dinle">🔊</button></span></div>${c.tr ? `<div class="soluk">${esc(c.tr)}</div>` : ''}<div class="soluk">${A.deItemHTML(id)} = ${esc(A.kurzTr(A.trOf(id)))}</div>`; };
    q.bilmiyorum = () => q.sonuc('falsch', '', q.ziel, ['bilmiyorum'], loesHTML());
    q.tus = e => {
      if (ortakTus(q, e)) return true;
      if (e.key === 'Enter' && !q.cevaplandi && !e.repeat) { e.preventDefault(); q.kontrol(); return true; }
      return false;
    };
    q.klick = e => ortakKlick(q, e);
    q.test = dogru => { const i = q.el.querySelector('#cevap'); if (i) i.value = dogru ? q.ziel : 'qwertz'; q.kontrol(); };
    q.cevap = () => q.ziel;
    return q;
  }

  // ---------- (c) cümle diktesi ----------
  function dikteSoru(id) {
    const c = cumleSec(id, 12); if (!c) return null;
    const q = soruYap('dikte', id, { metin: c.de, frage: c.de, satz: c.de });
    q.ziel = c.de;
    q.render = (el, bitti) => {
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="dikte">${sesUst('dinle–yaz: duyduğun cümleyi yaz', '<div class="soluk">istediğin kadar dinle; ekleri ve kısa kelimeleri (den / dem, zu, ist) dikkatle dinle</div>')}</div>
        <div class="q-alt" id="q-alt">${yazKutu('duyduğun cümle')}
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum</button><button class="btn ana" data-dn="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      const i = el.querySelector('#cevap'); if (i) i.focus();
      q.cal(false);
    };
    const loesHTML = (r, v) => `${v && r && r.u !== 'richtig' ? `<div class="satir"><span class="et">senin</span><span class="deger fark">${farkHTML(r.diff)}</span></div>` : ''}
      <div class="satir"><span class="et">${r && r.u === 'richtig' ? 'cümle' : 'doğru'}</span><span class="deger">${A.deHTML(c.de)} <button class="btn mini ses-mini" data-sprich="${esc(c.de)}" type="button" aria-label="Dinle">🔊</button></span></div>${c.tr ? `<div class="soluk">${esc(c.tr)}</div>` : ''}`;
    q.kontrol = () => {
      if (q.cevaplandi) return;
      const i = q.el.querySelector('#cevap'), v = i ? i.value.trim() : '';
      if (!v) { q.bilmiyorum(); return; }
      const r = diktePruef(A.G, v, q.ziel);
      q.sonuc(r.u, v, q.ziel, r.u === 'richtig' ? [] : r.tags.concat(r.kat.length ? ['dikte:' + r.kat.join(',')] : []), loesHTML(r, v));
    };
    q.bilmiyorum = () => q.sonuc('falsch', '', q.ziel, ['bilmiyorum'], loesHTML(null, ''));
    q.tus = e => {
      if (ortakTus(q, e)) return true;
      if (e.key === 'Enter' && !q.cevaplandi && !e.repeat) { e.preventDefault(); q.kontrol(); return true; }
      return false;
    };
    q.klick = e => ortakKlick(q, e);
    q.test = dogru => { const i = q.el.querySelector('#cevap'); if (i) i.value = dogru ? q.ziel : 'ich weiß es nicht'; q.kontrol(); };
    q.cevap = () => q.ziel;
    return q;
  }

  // ---------- tur yuvası ----------
  // tür sırası dönüşümlü (kelime → boşluk → dikte); seçilen türde aday yoksa sıradaki tür. sel.dinleTur (test) türü zorlar.
  function turSorusu(api, sel) {
    if (api) A = api;
    if (!A) return null;
    sel = sel || {};
    const st = durum(), ad = adaylar();
    if (!ad.length) return null;
    const bas = (st.i || 0) % TURLER.length;
    const sira = sel.dinleTur && TURLER.includes(sel.dinleTur) ? [sel.dinleTur] : TURLER.slice(bas).concat(TURLER.slice(0, bas));
    for (const tur of sira) {
      for (const id of ad.slice(0, 25)) {
        const q = tur === 'kelime' ? kelimeSoru(id) : tur === 'bosluk' ? boslukSoru(id) : dikteSoru(id);
        if (q) { if (!sel.dinleTur) st.i = TURLER.indexOf(tur) + 1; return q; }
      }
    }
    return null;
  }

  // ================= Dinleme modu (Okuma: DW metni, ses adresi varsa) =================
  // Vandergrift & Goh sırası: 1) tahmin 2) metinsiz dinle 3) boşluklu metin (dinlerken doldur; sistem notlar) 4) metinle dinle (bilmediğin kelimeye bas).
  let M = null;
  const tokRein = w => w.replace(/^[„“"(‚‘»«]+|[.,!?;:“"”)…’‘»«]+$/g, '');
  // boşluklar: bildiği kelimeler (m.S ≥ 1) ve B1 (tier 3) kelimeleri; cümle başına en çok 1, en az 7 kelime arayla, en çok 12; metin sırasıyla
  function modBosluklar(L) {
    const S = A.S(), out = [];
    let son = -99, k = 0;
    const paras = L.text.split('\n');
    const toks = [];
    paras.forEach((par, pi) => par.split(/(\s+)/).forEach(raw => { toks.push({ raw, pi, ws: !/\S/.test(raw) }); }));
    let satzNo = 0, satzBlank = -1;
    toks.forEach((t, i) => {
      if (t.ws) return;
      k++;
      const c = tokRein(t.raw), id = c.length >= 3 ? A.wortSuchen(c) : null;
      const bilinen = id && S.items[id] && S.items[id].m && (S.items[id].m.S || 0) >= 1 && !S.items[id].a1;
      const b1 = id && A.tierOf(id) === 3;
      if (id && (bilinen || b1) && satzBlank !== satzNo && k - son >= 7 && out.length < 12 && /^[A-Za-zÄÖÜäöüß-]+$/.test(c)) {
        out.push({ i, id, form: c, bilinen: !!bilinen }); son = k; satzBlank = satzNo;
      }
      if (/[.!?]["“”»]?$/.test(t.raw)) satzNo++;
    });
    return { toks, blanks: out };
  }
  function modMetinHTML(mod) {
    const bl = new Map((M.blanks || []).map((b, n) => [b.i, n]));
    let out = '<p>', pi = 0;
    M.toks.forEach((t, i) => {
      if (t.pi !== pi) { out += '</p><p>'; pi = t.pi; }
      if (t.ws) { out += t.raw; return; }
      const n = mod === 'luecke' ? bl.get(i) : null;
      if (n == null) { out += `<span class="lw">${esc(t.raw)}</span>`; return; }
      const b = M.blanks[n], c = b.form, vor = t.raw.slice(0, t.raw.indexOf(c)), nach = t.raw.slice(t.raw.indexOf(c) + c.length);
      const w = M.werte ? M.werte[n] || '' : '';
      out += `${esc(vor)}<input class="u-luecke${M.ok ? (M.ok[n] ? ' ok' : ' yanlis') : ''}" data-dl="${n}" size="${Math.max(5, c.length + 1)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" value="${esc(w)}"${M.ok ? ' disabled' : ''}>${M.ok && !M.ok[n] ? ` <b class="u-dogru">${esc(c)}</b>` : ''}${esc(nach)}`;
    });
    return out + '</p>';
  }
  function oynatici() {
    const L = M.L;
    return `<div class="dn-oynat"><audio id="dn-audio" controls preload="auto" src="${esc(L.audio)}"></audio>
      <div class="dn-dugmeler"><button class="btn dn-geri" data-dnm="geri" type="button">⟲ 5 sn</button>
        <div class="seg dn-hiz" role="radiogroup" aria-label="Hız">${[0.75, 1].map(h => `<button type="button" data-dnm-hiz="${h}" aria-pressed="${M.hiz === h}">${h === 1 ? '1,0' : '0,75'}</button>`).join('')}</div></div></div>`;
  }
  const ADIM_AD = ['tahmin', 'metinsiz dinle', 'boşluklu metin', 'metinle dinle', 'bitti'];
  function modRender() {
    const el = A.kart(), L = M.L;
    const ust = `<div class="tur"><span class="yeni">dinleme modu</span><span>${M.adim + 1} / 4 · ${esc(ADIM_AD[M.adim])}</span></div><div class="soru">${esc(L.titel)}</div>`;
    let govde = '', alt = '';
    if (M.adim === 0) {
      const kw = M.anahtar.map(w => `<span class="chip">${esc(w)}</span>`).join('');
      govde = `<div class="soluk">Dinlemeden önce: başlığa ve bu kelimelere bak, metinde ne duyacağını tahmin et.</div><div class="chips dn-anahtar">${kw}</div>
        <textarea id="dn-tahmin" class="dn-tahmin" rows="2" placeholder="tahminin (isteğe bağlı, Türkçe ya da Almanca)">${esc(M.tahmin || '')}</textarea>`;
      alt = `<button class="btn ana" data-dnm="ileri" type="button">Dinlemeye başla <kbd>Enter</kbd></button>`;
    } else if (M.adim === 1) {
      govde = `<div class="soluk">Metni görmeden dinle. Ana fikri yakala; takıldığında 5 sn geri al.</div>${oynatici()}`;
      alt = `<button class="btn ana" data-dnm="ileri" type="button">Boşluklu metne geç</button>`;
    } else if (M.adim === 2) {
      govde = `<div class="soluk">Yeniden dinle ve boşlukları duyduğun biçimle doldur (${M.blanks.length} boşluk: bildiğin ve B1 kelimeleri).</div>${oynatici()}
        <div class="paket-text u-text-body" id="lesen-text">${modMetinHTML('luecke')}</div>${M.ok ? `<div class="sonuc ${M.puan.x === M.puan.y ? 'richtig' : M.puan.x >= M.puan.y * 0.6 ? 'fast' : 'falsch'}"><div class="baslik">${M.puan.x} / ${M.puan.y} doğru</div>${M.puan.x < M.puan.y ? '<div class="soluk">doğrusu yeşil</div>' : ''}</div>` : ''}`;
      alt = M.ok ? `<button class="btn ana" data-dnm="ileri" type="button">Metinle dinle</button>` : `<button class="btn ana" data-dnm="kontrol" type="button">Kontrol</button>`;
    } else if (M.adim === 3) {
      govde = `<div class="soluk">Son kez metinle birlikte dinle. Bilmediğin kelimeye bas.</div>${oynatici()}
        <div class="paket-text" id="lesen-text">${modMetinHTML('tam')}</div><div id="lesen-wort" class="kural" hidden></div>`;
      alt = `<button class="btn ana" data-dnm="bitir" type="button">Bitti</button>`;
    } else {
      govde = `<div class="sonuc ${M.puan.x === M.puan.y ? 'richtig' : 'fast'}"><div class="baslik">🎧 Dinleme bitti · boşluk ${M.puan.x} / ${M.puan.y}</div><div class="soluk">${M.dk} dk · hız ${String(M.hiz).replace('.', ',')}</div></div>`;
      alt = `<button class="btn ana" data-dnm="don" type="button">Okumaya dön</button><button class="btn" data-dnm="baska" type="button">Başka metin</button>`;
    }
    el.classList.remove('cevaplandi', 'fx-dogru', 'fx-fast', 'fx-yanlis', 'duzen');
    const cik = M.adim < 4 ? '<button class="btn" data-dnm="cik" type="button">Okumaya dön</button>' : '';
    el.innerHTML = `<div class="dn-mod">${ust}${govde}<div class="sira dn-mod-alt">${alt}${cik}</div></div>`;
    const au = el.querySelector('#dn-audio');
    if (au) { au.playbackRate = M.hiz; au.addEventListener('ratechange', () => { if (Math.abs(au.playbackRate - M.hiz) > 0.01 && [0.75, 1].includes(au.playbackRate)) M.hiz = au.playbackRate; }); if (M.zaman) { try { au.currentTime = M.zaman; } catch (e) { /* yüklenmedi */ } } }
    if (A.tastatur) A.tastatur();
    if (M.adim === 2 && !M.ok) { const i = el.querySelector('.u-luecke'); if (i) i.focus({ preventScroll: true }); }
  }
  const audio = () => { const el = A && A.kart(); return el && el.querySelector('#dn-audio'); };
  function modAc(L, api) {
    if (api) A = api;
    if (!A || !L || !L.audio) return false;
    const { toks, blanks } = modBosluklar(L);
    const gl = (L.glossar || []).map(g => g.de.split(/[,(]/)[0].replace(/\|/g, '').trim()).filter(Boolean);
    const kw = gl.length >= 3 ? gl.slice(0, 3) : gl.concat(blanks.filter(b => !b.bilinen).map(b => b.form)).slice(0, 3);
    M = { L, adim: 0, hiz: 1, geri: 0, t0: A.now(), toks, blanks, anahtar: kw, werte: null, ok: null, puan: { x: 0, y: blanks.length } };
    modRender();
    return true;
  }
  function modKaydet() { const au = audio(); if (au) { M.zaman = au.currentTime || 0; try { au.pause(); } catch (e) { /* yok */ } } const t = document.getElementById('dn-tahmin'); if (t) M.tahmin = t.value; }
  function modKontrol() {
    M.werte = M.blanks.map((b, n) => (document.querySelector(`.u-luecke[data-dl="${n}"]`) || {}).value || '');
    M.ok = M.blanks.map((b, n) => { const w = M.werte[n].trim(); return !!w && A.uPruef(w, b.form).u !== 'falsch'; });
    M.puan = { x: M.ok.filter(Boolean).length, y: M.blanks.length };
    modKaydet(); modRender();
  }
  function modBitir() {
    modKaydet();
    const L = M.L, S = A.S(), t = A.now();
    if (!M.ok) M.puan = { x: 0, y: M.blanks.length };
    M.dk = Math.max(1, Math.round((t - M.t0) / 60000));
    (S.gelesen = S.gelesen || {})[L.id] = t;
    A.heuteM('lesen').n++;
    A.xpEkle(25);
    A.logEintrag({ modus: 'lesen', id: `${L.id}:dinle`, item: L.titel, frage: L.thema || '', antwort: (M.werte || []).join(' / '), ergebnis: 'gelesen', loesung: M.blanks.map(b => b.form).join(' / '),
      notiz: [`puan:${M.puan.x}/${M.puan.y}`, `hız:${M.hiz}`, `geri:${M.geri}`, `dk:${M.dk}`].concat(M.tahmin && M.tahmin.trim() ? ['tahmin'] : []).join(' | ') });
    A.save();
    M.adim = 4; M.zaman = 0;
    modRender();
  }
  function modKlick(e) {
    if (!M) return false;
    const h = e.target.closest('[data-dnm-hiz]');
    if (h) { M.hiz = +h.dataset.dnmHiz; const au = audio(); if (au) au.playbackRate = M.hiz; h.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === h))); return true; }
    const b = e.target.closest('[data-dnm]'); if (!b) return false;
    const a = b.dataset.dnm, au = audio();
    if (a === 'geri') { if (au) { au.currentTime = Math.max(0, (au.currentTime || 0) - 5); M.geri++; if (au.paused) au.play().catch(() => {}); } return true; }
    if (a === 'ileri') { if (M.adim === 0) { const t = document.getElementById('dn-tahmin'); M.tahmin = t ? t.value : ''; } modKaydet(); if (M.adim < 3) M.adim++; if (M.adim === 2 && !M.blanks.length) M.adim = 3; M.zaman = 0; modRender(); if (M.adim === 1) { const x = audio(); if (x) x.play().catch(() => {}); } return true; }
    if (a === 'kontrol') { modKontrol(); return true; }
    if (a === 'bitir') { modBitir(); return true; }
    if (a === 'don' || a === 'cik') { modKaydet(); M = null; A.lesenGoster(false); return true; }
    if (a === 'baska') { M = null; A.lesenGoster(true); return true; }
    return false;
  }
  function modTus(e) {
    if (!M) return false;
    const au = audio();
    if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('u-luecke')) {
      e.preventDefault();
      const l = [...document.querySelectorAll('#kart .u-luecke:not([disabled])')], i = l.indexOf(e.target);
      if (i >= 0 && i < l.length - 1) l[i + 1].focus(); else modKontrol();
      return true;
    }
    if (inInput(e)) return false;
    if ((e.key === ' ' || e.code === 'Space') && au) { e.preventDefault(); if (au.paused) au.play().catch(() => {}); else au.pause(); return true; }
    if (e.key === 'ArrowLeft' && au) { e.preventDefault(); au.currentTime = Math.max(0, (au.currentTime || 0) - 5); M.geri++; return true; }
    if (e.key === 'Enter' && !e.repeat) {
      const b = A.kart().querySelector('.dn-mod-alt .btn.ana');
      if (b) { e.preventDefault(); b.click(); return true; }
    }
    return false;
  }

  const Dinle = {
    init(api) { A = api; },
    turSorusu, diktePruef, farkHTML, modAc, modKlick, modTus,
    get mod() { return M; },
    modAcik: () => !!M,
    TURLER,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Dinle;
  else root.Dinle = Dinle;
})(this);
