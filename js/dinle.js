// Dinleme (6.11; sözleşme S2): turdaki ses yuvası 'duy' / 'hoer' (duy-seç) ve Okuma'da DW "Dinleme modu". Uygulamaya Dinle.init(api) ile bağlı.
// Tur yuvası: uygulama (js/app.js sesTurFrage) Kern.sec { tur:'ses', alt:'duy' | 'hoer' } verince Dinle.turSorusu(api, sel) çağırır → soru nesnesi
// { id, tur, render(kartEl, bitti), tus(e), klick(e), test(dogru) } ya da null (yuva atlanır). Soru kendini çizer, notu verir, log satırını yazar
// ve bitti({ urteil, antwort }) ile döner; sayaç / puan / oturumIsle / Devam uygulamanın. Öğe hafızasına YAZMAZ.
// duy türleri (bildiği kelimeler: m.S ≥ 1):
//   kelime  sesten tanıma: yazı gizli, ses 1 kez kendiliğinden (+ tekrar / yavaş), şıklar (Türkçe anlam, api.optionen) ses bitince açılır
//   bosluk  cümle tam okunur, ekranda boşluklu; duyduğu çekimli biçimi yazar (boslukPruef: G.bosPruef + ae/oe/ue/ss doğru, umlaut düşürme
//           küçük hata 'umlaut', sözlükte başka kelime yanlış)
//   dikte   bildiği kelimenin cümlesi dinlenip yazılır (diktePruef: G.cumleKontrol; hâl / çekim / yanlış kelime yazım sayılmaz; bileşiği ayrı yazmak
//           küçük hata 'yazım'; isimde büyük / küçük harf not düşürmez, söylenir; rakamlı cümle seçilmez)
//   Boş Enter / Kontrol bir şey yapmaz; soru açıldıktan sonraki ilk ENTER_BEKLE ms'de Enter yok sayılır (önceki sorudan taşan Enter). Bilmiyorum yalnız düğme / 0.
// Log: modus duy, id <öğe>:duy-kelime|duy-bosluk|duy-dikte, notiz `tür:kelime | hız:0.9 | tekrar:N | sek:N` (+ etiketler, dikte:ek|işlev|kelime).
// hoer (duy-seç; 7.11'de js/konus.js'ten taşındı, konuşma kaldırıldı): minimal çift / vurgu (daten/minimalpaare.js); TTS iki kelimeden birini okur
// (her soruda başka Almanca ses), hangisi duyuldu; sistem notlar. Almanca ses ya da çift yoksa null (uygulama duy sorar). S.hoer[kontrast] = { d, y, t },
// son 40 madde S.dinle.hoerSon. Log modus hoer, id hoer:<kontrast>, notiz `cift:a/b | ses:<ad> | dinleme:N | sek:N | kaynak:tur`.
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
  // karşılaştırma anahtarları: acikL ae/oe/ue/ss = ä/ö/ü/ß (küçük harf, noktalama ve tire yok); umlF umlaut düşürülmüş (Prufung = Prüfung)
  const acik = s => String(s || '').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  const tokTemiz = w => String(w || '').replace(/^[„“"(‚‘»«]+|[.,!?;:“"”)…’‘»«]+$/g, '');
  const acikL = s => acik(tokTemiz(s)).toLowerCase().replace(/-/g, '');
  const umlF = s => acikL(s).replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
  const ilkKucuk = s => s.charAt(0).toLowerCase() + s.slice(1);
  // bileşik kelime ayrı ("schmerz Tabletten" → Schmerztabletten) ya da ayrı yazılan bitişik ("zuhause" → zu Hause): duyduğu doğru, yalnız yazım.
  // Girdiyi hedefin token sınırlarına uydurur; döner { metin, bitisik: [{ d: 'Schmerztabletten', w: 'schmerz Tabletten' }], ayri: [{ d: 'zu Hause', w: 'zuhause' }] }
  function bitisikUydur(eingabe, ziel) {
    const P = String(eingabe || '').trim().split(/\s+/).filter(Boolean), T = String(ziel || '').trim().split(/\s+/).filter(Boolean);
    const tk = new Set(T.map(acikL)), bitisik = [], ayri = [], out = [];
    const ciftler = new Map(); for (let j = 0; j + 1 < T.length; j++) ciftler.set(acikL(T[j]) + acikL(T[j + 1]), [T[j], T[j + 1]]);
    for (let i = 0; i < P.length; i++) {
      const k1 = acikL(P[i]);
      if (i + 1 < P.length && k1.length >= 2) {
        const k12 = k1 + acikL(P[i + 1]), hedef = T.find(t => acikL(t) === k12);
        if (hedef && (!tk.has(k1) || !tk.has(acikL(P[i + 1])))) { out.push(P[i] + ilkKucuk(P[i + 1])); bitisik.push({ d: tokTemiz(hedef), w: tokTemiz(P[i]) + ' ' + tokTemiz(P[i + 1]) }); i++; continue; }
      }
      const c = !tk.has(k1) && ciftler.get(k1);
      if (c) {
        let k = 1; while (k < P[i].length && acikL(P[i].slice(0, k)) !== acikL(c[0])) k++;
        if (k < P[i].length) { out.push(P[i].slice(0, k), P[i].slice(k)); ayri.push({ d: tokTemiz(c[0]) + ' ' + tokTemiz(c[1]), w: tokTemiz(P[i]) }); continue; }
      }
      out.push(P[i]);
    }
    return { metin: out.join(' '), bitisik, ayri };
  }
  function diktePruef(G, eingabe, ziel) {
    G = G || root.G;
    if (!String(eingabe || '').trim()) return { u: 'falsch', tags: ['bilmiyorum'], kat: [], diff: [], hinweis: 'bilmiyorum' };
    const bu = bitisikUydur(eingabe, ziel), birlesik = bu.bitisik.length + bu.ayri.length > 0;
    const r = G.cumleKontrol(birlesik ? bu.metin : eingabe, [ziel]);
    let u = r.urteil;
    const tags = r.tags.filter(t => t !== 'farklı cümle' || u === 'falsch');
    if (u === 'richtig') {
      const a = dNorm(eingabe), b = dNorm(ziel);
      if (a.join(' ') !== b.join(' ') && a.slice().sort().join(' ') === b.slice().sort().join(' ')) { u = 'fast'; tags.push('kelime sırası'); }
    }
    let diff = (r.diff || []).map(x => Object.assign({}, x));
    // bitişik / ayrı yazım: küçük hata (yazım); farkta tek kalem
    if (birlesik) {
      if (u === 'richtig') u = 'fast';
      if (!tags.includes('yazım')) tags.unshift('yazım');
      bu.bitisik.forEach(b => { const x = diff.find(y => (y.t === 'ok' || y.t === 'yazim') && !y.bitisik && acikL(y.d) === acikL(b.d)); if (x) Object.assign(x, { t: 'yazim', w: b.w, bitisik: true }); });
      bu.ayri.forEach(b => {
        const [a1, a2] = b.d.split(' '), i = diff.findIndex((x, j) => j + 1 < diff.length && acikL(x.d) === acikL(a1) && acikL(diff[j + 1].d) === acikL(a2));
        if (i >= 0) diff.splice(i, 2, { t: 'yazim', w: b.w, d: b.d, bitisik: true });
      });
    }
    const kat = new Set();
    diff.forEach(x => {
      if (x.t === 'ok' || x.t === 'yer') return;
      if (x.t === 'yazim') { kat.add('yazım'); return; }
      const w = x.w || '', d = x.d || '';
      if (w && d) kat.add(D_PRAEP.test(w) && D_PRAEP.test(d) ? 'işlev' : ekFark(w, d) ? 'ek' : D_ISLEV.test(d) || D_ISLEV.test(w) ? 'işlev' : 'kelime');
      else kat.add(D_ISLEV.test(d || w) ? 'işlev' : 'kelime');
    });
    // büyük / küçük harf: not düşürmez (cümle başı hariç), ama söylenir: diktede isim büyük harfi asıl beceri (7.11 inceleme)
    const harf = [];
    diff.forEach((x, i) => {
      if (i === 0 || x.bitisik || (x.t !== 'ok' && x.t !== 'yazim') || !x.w || !x.d) return;
      const a = tokTemiz(x.w).charAt(0), b = tokTemiz(x.d).charAt(0);
      if (a && b && a !== b && a.toLowerCase() === b.toLowerCase()) harf.push(tokTemiz(x.d));
    });
    const tl = tags.filter(t => t !== 'büyük/küçük harf');
    if (harf.length) tl.push('büyük/küçük harf');
    return { u, tags: tl, kat: [...kat], diff, hinweis: tl.join(', '), harf, bitisik: bu.bitisik.map(b => b.d), ayri: bu.ayri.map(b => b.d) };
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
  // rakamsiz (dikte): rakamlı cümle yok (TTS "10"u "zehn" okur, yazılan "zehn" yanlış kelime sayılırdı; 7.11 inceleme)
  function cumleSec(id, maxW, rakamsiz) {
    const st = durum(), t = A.now(), p = A.satzPool(id) || { own: [], extra: [] };
    const uygun = x => { const n = x.de.split(/\s+/).length; return n >= 4 && n <= maxW && !(rakamsiz && /\d/.test(x.de)) && !(st.satz[x.de] && t - st.satz[x.de] < 20 * DAY) && /[.!?]$/.test(x.de.trim()); };
    const own = shuffle((p.own || []).filter(uygun)), ext = shuffle((p.extra || []).filter(uygun));
    for (const x of own.concat(ext)) { const l = A.wortLuecke(id, x.de); if (l && l.answer) return { de: x.de, tr: x.tr || '', l }; }
    return null;
  }

  // ---------- ortak kart parçaları ----------
  function sesUst(baslik, alt) {
    return `<div class="tur"><span class="yeni">dinle</span><span>${esc(baslik)}</span></div>${alt || ''}
      <div class="dn-ses"><button class="btn buyuk dn-cal" data-dn="cal" type="button">🔊 Dinle<span class="klavye-ipucu"> <kbd>Boşluk</kbd> / <kbd>↑</kbd></span></button><button class="btn dn-yavas" data-dn="yavas" type="button">🐢 yavaş</button></div>`;
  }
  // soru açıldıktan sonraki ilk ENTER_BEKLE ms'de Enter yok sayılır: önceki sorudan (doğru cevap, turdaki gramer sorusunun ikinci Enter'ı)
  // taşan hızlı Enter yeni dinleme sorusunu yakmasın (7.11 inceleme: sek:0 "bilmiyorum"); gerçek saat (test saati kaydırılabilir)
  const ENTER_BEKLE = 600;
  const saat = () => (root.performance && root.performance.now ? root.performance.now() : Date.now());
  const erkenEnter = (q, e) => e.key === 'Enter' && saat() - (q.acilis || 0) < ENTER_BEKLE;
  // tek kelimelik boşlukta "yazım" denen cevap sözlükte başka bir kelime mi (verschieben ↔ verschrieben, legt ↔ liegt, Staat ↔ Stadt):
  // CLAUDE.md yazım hoşgörüsü "yazılan sözlükte başka kelime değilse". Umlaut / ae farkı ve büyük / küçük harf başka kelime sayılmaz.
  function baskaKelime(w, hedef, id, G0) {
    w = tokTemiz(String(w || '').trim()); hedef = tokTemiz(String(hedef || '').trim());
    if (!w || !hedef || /\s/.test(w) || /\s/.test(hedef) || acikL(w) === acikL(hedef) || umlF(w) === umlF(hedef)) return false;
    const bul = x => { try { return (A && A.wortSuchen && (A.wortSuchen(x) || A.wortSuchen(x.charAt(0).toUpperCase() + x.slice(1)))) || null; } catch (e) { return null; } };
    const a = bul(w), b = bul(hedef) || id || null;
    if (a && b && a !== b) return true;
    try { const G = G0 || (A && A.G) || root.G; return !!(G && G.yakin && G.yakin(w, hedef) == null); } catch (e) { return false; }
  }
  // ilk harfin büyük / küçük farkı (cümle ortasındaki boşluk): not düşürmez, söylenir
  // bas: boşluk cümle başında (ilk kelimenin büyük harfi konumdan)
  const harfFarki = (v, z, bas) => { const a = String(v || '').split(/\s+/), b = String(z || '').split(/\s+/); return a.length === b.length ? b.filter((x, i) => !(bas && i === 0) && a[i] && a[i].charAt(0) !== x.charAt(0) && a[i].charAt(0).toLowerCase() === x.charAt(0).toLowerCase()) : []; };
  // sesli boşluk kontrolü: G.bosPruef + ae/oe/ue/ss tam doğru (CLAUDE.md), umlaut düşürme küçük hata 'umlaut', sözlükte başka kelime yazım değil yanlış
  function boslukPruef(G, v, ziel, id) {
    G = G || (A && A.G) || root.G;
    const n = s => acik(String(s || '').trim().replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, ''));
    if (n(v) === n(ziel) || ilkKucuk(n(v)) === ilkKucuk(n(ziel))) return { urteil: 'richtig', tags: [] };
    const r = G.bosPruef(v, ziel) || {};
    let urteil = r.urteil === 'richtig' ? 'richtig' : r.urteil === 'fast' ? 'fast' : 'falsch', tags = (r.tags || []).slice();
    if (urteil === 'richtig') return { urteil, tags: [] };
    const vt = String(v).trim().split(/\s+/), zt = String(ziel).trim().split(/\s+/);
    if (vt.length === zt.length && vt.every((x, i) => umlF(x) === umlF(zt[i])) && vt.some((x, i) => acikL(x) !== acikL(zt[i]))) return { urteil: 'fast', tags: ['umlaut'] };
    if (urteil === 'fast' && tags.includes('yazım') && baskaKelime(v, ziel, id, G)) return { urteil: 'falsch', tags: ['yanlış kelime'] };
    return { urteil, tags };
  }
  const harfNot = l => (l && l.length ? `<div class="kural dn-harf">büyük / küçük harf: <b>${l.map(esc).join(', ')}</b>${l.some(x => /^\p{Lu}/u.test(x)) ? ' (isimler büyük harfle)' : ''}</div>` : '');
  const yazKutu = ph => `<div class="yaz-kutu"><input id="cevap" type="text" enterkeyhint="go" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(ph)}" aria-label="Cevap">${A.umlaut || ''}</div>`;

  // soru nesnesi: ortak akış (ses, tekrar sayısı, süre, bitti, log)
  function soruYap(tur, id, o) {
    const q = { id, tur: 'duy-' + tur, dTur: tur, el: null, bitti: null, tekrar: 0, start: 0, cevaplandi: false, metin: o.metin, yavasMetin: o.metin };
    q.cal = yavas => {
      if (q.calindi) q.tekrar++;
      q.calindi = true;
      A.sprich(q.metin, yavas ? Math.max(0.55, hiz() - 0.25) : hiz(), () => { if (q.sesBitti) q.sesBitti(); });
    };
    // bekle: doğru ama okunacak not var (büyük / küçük harf): uygulama kendiliğinden geçmez, Devam beklenir
    q.sonuc = (urteil, antwort, loesung, etiket, html, bekle) => {
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
      if (yer) yer.innerHTML = `<div class="sonuc ${urteil} dn-sonuc"><div class="baslik">${urteil === 'richtig' ? '✓ Doğru' : urteil === 'fast' ? '≈ Küçük hata' : '✗ Yanlış'}${(etiket || []).filter(x => !/^(dikte:|şık:|bitişik:|ayrı:)/.test(x)).length ? `<span class="etiketler">${(etiket || []).filter(x => !/^(dikte:|şık:|bitişik:|ayrı:)/.test(x)).map(x => `<span class="etiket">${esc(x)}</span>`).join('')}</span>` : ''}</div>${html || ''}</div>`;
      if (q.el) q.el.classList.add('cevaplandi');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      A.save();
      if (q.bitti) q.bitti(Object.assign({ urteil, antwort: antwort || '' }, bekle ? { bekle: true } : {}));
    };
    return q;
  }
  // ortak tuşlar: Boşluk (girdide değilse) dinle, 0 bilmiyorum (girdide değilse)
  function ortakTus(q, e) {
    if (q.cevaplandi) return false;
    if ((e.key === ' ' || e.code === 'Space') && !inInput(e)) { e.preventDefault(); q.cal(false); return true; }
    // yazı kutusundayken: ↑ tekrar dinle (Boşluk boşluk yazar; 6.11 denetim)
    if (e.key === 'ArrowUp' && inInput(e)) { e.preventDefault(); q.cal(false); return true; }
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
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now(); q.acilis = saat();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="kelime">${sesUst('sesten tanı: duyduğun kelime ne demek?', '')}
          <div class="soluk dn-bekle" id="dn-bekle">yazısı gizli · şıklar ses bitince açılır</div></div>
        <div class="q-alt" id="q-alt"><div class="dn-sik" id="dn-sik" hidden>${q.opts.map((o, i) => `<button class="dn-opt" data-dn-sik="${i}" type="button"><kbd>${i + 1}</kbd> ${esc(o.t)}</button>`).join('')}</div>
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum <kbd>0</kbd></button><span class="soluk klavye-ipucu">tekrar dinle: <kbd>Boşluk</kbd></span></div></div>
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
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now(); q.acilis = saat();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="bosluk">${sesUst('cümleyi dinle, boşluğa duyduğunu yaz', '')}
          <div class="soru de dn-satz">${satzHTML()}</div>${c.l.n > 1 ? `<div class="soluk">${c.l.n} boşluk: sırayla, boşlukla ayırarak yaz</div>` : ''}</div>
        <div class="q-alt" id="q-alt">${yazKutu('duyduğun kelime(ler)')}
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum</button><button class="btn ana" data-dn="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      const i = el.querySelector('#cevap'); if (i) i.focus();
      q.cal(false);
    };
    // boş Enter / Kontrol hiçbir şey yapmaz (yalnız odak): "Bilmiyorum" yalnız düğmeyle (7.11 inceleme: boş Enter anında yanlış yazıyordu)
    q.kontrol = () => {
      if (q.cevaplandi) return;
      const i = q.el.querySelector('#cevap'), v = i ? i.value.trim() : '';
      if (!v) { if (i) i.focus(); return; }
      const r = boslukPruef(A.G, v, q.ziel, id);
      const urteil = r.urteil;
      const harf = urteil === 'richtig' ? harfFarki(v, q.ziel, /^\s*_____/.test(c.l.text)) : [];
      const senin = urteil !== 'richtig' ? `<div class="satir"><span class="et">senin</span><span class="deger fark"><s class="dn-fazla">${esc(v)}</s> → <b class="dn-eksik">${esc(q.ziel)}</b></span></div>` : '';
      q.sonuc(urteil, v, q.ziel, urteil === 'richtig' ? (harf.length ? ['büyük/küçük harf'] : []) : r.tags, senin + loesHTML() + harfNot(harf), harf.length > 0);
    };
    const loesHTML = () => { const w = q.ziel.split(' '); let k = 0; return `<div class="satir"><span class="et">cümle</span><span class="deger">${A.deHTML(c.l.text.replace(/_____/g, () => w[k++] || ''))} <button class="btn mini ses-mini" data-sprich="${esc(c.de)}" type="button" aria-label="Dinle">🔊</button></span></div>${c.tr ? `<div class="soluk">${esc(c.tr)}</div>` : ''}<div class="soluk">${A.deItemHTML(id)} = ${esc(A.kurzTr(A.trOf(id)))}</div>`; };
    q.bilmiyorum = () => q.sonuc('falsch', '', q.ziel, ['bilmiyorum'], loesHTML());
    q.tus = e => {
      if (!q.cevaplandi && erkenEnter(q, e)) { e.preventDefault(); return true; }
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
    const c = cumleSec(id, 12, true); if (!c) return null;
    const q = soruYap('dikte', id, { metin: c.de, frage: c.de, satz: c.de });
    q.ziel = c.de;
    q.render = (el, bitti) => {
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now(); q.acilis = saat();
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="dikte">${sesUst('dinle–yaz: duyduğun cümleyi yaz', '<div class="soluk">istediğin kadar dinle; ekleri ve kısa kelimeleri (den / dem, zu, ist) dikkatle dinle</div>')}</div>
        <div class="q-alt" id="q-alt">${yazKutu('duyduğun cümle')}
          <div class="alt-sira"><button class="btn mini bilmiyorum" data-dn="bilmiyorum" type="button">Bilmiyorum</button><button class="btn ana" data-dn="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      const i = el.querySelector('#cevap'); if (i) i.focus();
      q.cal(false);
    };
    const yazimNot = r => {
      const l = (r && r.bitisik || []).map(x => `<b>${esc(x)}</b> bitişik yazılır`).concat((r && r.ayri || []).map(x => `<b>${esc(x)}</b> ayrı yazılır`));
      return l.length ? `<div class="kural dn-bitisik">${l.join(' · ')}</div>` : '';
    };
    const loesHTML = (r, v) => `${v && r && r.u !== 'richtig' ? `<div class="satir"><span class="et">senin</span><span class="deger fark">${farkHTML(r.diff)}</span></div>` : ''}
      <div class="satir"><span class="et">${r && r.u === 'richtig' ? 'cümle' : 'doğru'}</span><span class="deger">${A.deHTML(c.de)} <button class="btn mini ses-mini" data-sprich="${esc(c.de)}" type="button" aria-label="Dinle">🔊</button></span></div>${c.tr ? `<div class="soluk">${esc(c.tr)}</div>` : ''}${yazimNot(r)}${harfNot(r && r.harf)}`;
    q.kontrol = () => {
      if (q.cevaplandi) return;
      const i = q.el.querySelector('#cevap'), v = i ? i.value.trim() : '';
      if (!v) { if (i) i.focus(); return; }
      const r = diktePruef(A.G, v, q.ziel);
      const ek = [].concat(r.bitisik && r.bitisik.length ? ['bitişik:' + r.bitisik.join(',')] : [], r.ayri && r.ayri.length ? ['ayrı:' + r.ayri.join(',')] : []);
      const etiket = r.u === 'richtig' ? r.tags.filter(t => t === 'büyük/küçük harf') : r.tags.concat(ek, r.kat.length ? ['dikte:' + r.kat.join(',')] : []);
      q.sonuc(r.u, v, q.ziel, etiket, loesHTML(r, v), r.u === 'richtig' && r.harf && r.harf.length > 0);
    };
    q.bilmiyorum = () => q.sonuc('falsch', '', q.ziel, ['bilmiyorum'], loesHTML(null, ''));
    q.tus = e => {
      if (!q.cevaplandi && erkenEnter(q, e)) { e.preventDefault(); return true; }
      if (ortakTus(q, e)) return true;
      if (e.key === 'Enter' && !q.cevaplandi && !e.repeat) { e.preventDefault(); q.kontrol(); return true; }
      return false;
    };
    q.klick = e => ortakKlick(q, e);
    q.test = dogru => { const i = q.el.querySelector('#cevap'); if (i) i.value = dogru ? q.ziel : 'ich weiß es nicht'; q.kontrol(); };
    q.cevap = () => q.ziel;
    return q;
  }

  // ---------- (d) duy-seç: minimal çift / vurgu ----------
  const MP = () => root.MINIMALPAARE || { kontrast: {}, ciftler: [], vurgu: [] };
  const ARTRE = /^(der|die|das) /;
  const ttsVar = () => !!(root.speechSynthesis && root.SpeechSynthesisUtterance);
  const deSesler = () => { try { return ttsVar() ? root.speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang)) : []; } catch (e) { return []; } };
  const hoerVar = () => deSesler().length > 0 && (MP().ciftler.length + MP().vurgu.length) > 0;
  const hoerSt = () => { const S = A.S(); return (S.hoer = S.hoer && typeof S.hoer === 'object' ? S.hoer : {}); };
  const kontrastAd = k => ((MP().kontrast[k] || {}).ad || k);
  function hoerMadde(x) {
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
  function hoerSec() {
    const mp = MP(), hs = hoerSt(), gr = {}, st = durum();
    mp.ciftler.forEach((c, i) => (gr[c.k] = gr[c.k] || []).push({ tip: 'cift', i }));
    if (mp.vurgu.length) gr.vurgu = mp.vurgu.map((v, i) => ({ tip: 'vurgu', i }));
    const ks = Object.keys(gr); if (!ks.length) return null;
    const puan = k => { const x = hs[k] || {}, n = (x.d || 0) + (x.y || 0); return ((x.d || 0) + 1) / (n + 2) - (n < 3 ? 0.3 : 0) + Math.random() * 0.35; };
    const k = ks.map(x => [x, puan(x)]).sort((a, b) => a[1] - b[1])[0][0];
    const son = st.hoerSon = Array.isArray(st.hoerSon) ? st.hoerSon : [];
    let aday = gr[k].filter(x => !son.includes(x.tip[0] + x.i));
    if (!aday.length) aday = gr[k];
    const x = aday[Math.floor(Math.random() * aday.length)];
    son.push(x.tip[0] + x.i); if (son.length > 40) son.splice(0, son.length - 40);
    return hoerMadde(x);
  }
  // seçilen Almanca sesle okur (her soruda başka ses); bitince ya da zaman aşımında çözülür
  function hoerOku(q, text) {
    return new Promise(res => {
      if (!ttsVar() || !text) { res(); return; }
      let bitti = false, zt = null;
      const u = new root.SpeechSynthesisUtterance(text);
      const son = () => { if (bitti) return; bitti = true; clearTimeout(zt); res(); };
      u.lang = 'de-DE'; u.rate = Math.min(hiz(), 0.95); if (q.ses) u.voice = q.ses;
      u.onend = u.onerror = son;
      zt = setTimeout(son, 2500 + text.length * 110 / u.rate);
      try { root.speechSynthesis.cancel(); } catch (e) { /* yok */ }
      setTimeout(() => { if (!bitti) { try { root.speechSynthesis.speak(u); } catch (e) { son(); } } }, 40);
    });
  }
  function hoerSoru() {
    if (!hoerVar()) return null;
    const m = hoerSec(); if (!m) return null;
    const q = { id: 'hoer:' + m.k, tur: 'hoer', veri: m, el: null, kok: null, bitti: null, dinleme: 0, start: 0, cevaplandi: false, ses: null };
    const canli = () => !!(q.kok && q.kok.isConnected);
    q.cal = () => { q.dinleme++; return hoerOku(q, m.ses); };
    q.render = (el, bitti) => {
      q.el = el; if (bitti) q.bitti = bitti; q.start = A.now(); q.acilis = saat();
      const l = deSesler(); q.ses = l.length ? l[Math.floor(Math.random() * l.length)] : null;
      el.classList.add('duzen');
      el.innerHTML = `<div class="q-ust dn-kart" data-dn-tur="hoer"><div class="tur"><span class="yeni">duy ve seç</span><span>${esc(kontrastAd(m.k))}</span></div>
          <div class="soru">${m.k === 'vurgu' ? 'Vurgu hangi hecede?' : 'Hangisini duydun?'}</div>
          <div class="dn-ses"><button class="btn buyuk dn-cal" data-dn="cal" type="button">🔊 Tekrar dinle <kbd>Boşluk</kbd></button></div></div>
        <div class="q-alt" id="q-alt"><div class="dn-sik">${m.sec.map((o, i) => `<button class="dn-opt" data-hr-sik="${i}" type="button"><kbd>${i + 1}</kbd> <span class="hr-kelime">${o.art ? `<small class="hr-art">${esc(o.art)}</small> ` : ''}${esc(o.yaz)}</span></button>`).join('')}</div></div>
        <div id="sonuc" class="sonuc-yer"></div>`;
      q.kok = el.querySelector('[data-dn-tur="hoer"]');
      q.cal();
    };
    q.sec = i => {
      if (q.cevaplandi) return;
      const o = m.sec[i]; if (!o) return;
      q.cevaplandi = true;
      const dogru = i === m.dogru, hs = hoerSt(), x = hs[m.k] = hs[m.k] || { d: 0, y: 0 }, urteil = dogru ? 'richtig' : 'falsch';
      if (dogru) x.d = (x.d || 0) + 1; else x.y = (x.y || 0) + 1;
      x.t = A.now();
      A.logEintrag({ modus: 'hoer', id: 'hoer:' + m.k, item: m.item, frage: m.sec[m.dogru].yaz, antwort: o.yaz, ergebnis: urteil, loesung: m.sec[m.dogru].yaz,
        notiz: `cift:${m.item} | ses:${q.ses ? q.ses.name : 'yok'} | dinleme:${q.dinleme} | sek:${Math.round((A.now() - q.start) / 1000)} | kaynak:tur` });
      if (q.el) {
        q.el.querySelectorAll('[data-hr-sik]').forEach((b, j) => { b.disabled = true; if (j === m.dogru) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
        const yer = q.el.querySelector('#sonuc'), kanca = (MP().kontrast[m.k] || {}).kanca || '';
        if (yer) yer.innerHTML = `<div class="sonuc ${urteil} dn-sonuc"><div class="baslik">${dogru ? '✓ Doğru' : `✗ Duyduğun: <b>${esc(m.sec[m.dogru].yaz)}</b>`}</div>
          <div class="hr-ciftler">${m.sec.map((s2, j) => `<button class="btn mini" data-hr-kelime="${j}" type="button">🔊 ${s2.art ? esc(s2.art) + ' ' : ''}${esc(s2.yaz)} <span class="soluk">${esc(s2.tr || '')}</span></button>`).join('')}</div>
          ${!dogru && kanca ? `<div class="hr-kanca">${esc(kanca)}</div>` : ''}</div>`;
        q.el.classList.add('cevaplandi');
      }
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      A.save();
      // yanlışta iki kelime art arda (vurguda doğru vurguyla bir kez daha)
      if (!dogru) (async () => {
        await new Promise(r => setTimeout(r, 250)); if (!canli()) return;
        if (m.k === 'vurgu') { await hoerOku(q, m.ses); return; }
        await hoerOku(q, m.sec[0].yaz); if (!canli()) return;
        await new Promise(r => setTimeout(r, 350)); if (!canli()) return;
        await hoerOku(q, m.sec[1].yaz);
      })();
      if (q.bitti) q.bitti({ urteil, antwort: o.yaz });
    };
    q.tus = e => {
      if (q.cevaplandi || e.repeat) return false;
      if (e.key === '1' || e.key === '2') { e.preventDefault(); q.sec(+e.key - 1); return true; }
      if (e.key === ' ' || e.code === 'Space' || e.key === 'r') { e.preventDefault(); q.cal(); return true; }
      return false;
    };
    q.klick = e => {
      const k = e.target.closest('[data-hr-kelime]');
      if (k) { const o = m.sec[+k.dataset.hrKelime]; if (o) hoerOku(q, m.k === 'vurgu' ? m.ses : o.yaz); return true; }
      if (q.cevaplandi) return false;
      const b = e.target.closest('[data-hr-sik]'); if (b) { q.sec(+b.dataset.hrSik); return true; }
      if (e.target.closest('[data-dn="cal"]')) { q.cal(); return true; }
      return false;
    };
    q.test = dogru => q.sec(dogru ? m.dogru : 1 - m.dogru);
    q.cevap = () => m.dogru;
    return q;
  }

  // ---------- tur yuvası ----------
  // sel.alt 'hoer' → duy-seç (yoksa null: uygulama duy sorar). duy: tür sırası dönüşümlü (kelime → boşluk → dikte);
  // seçilen türde aday yoksa sıradaki tür. sel.dinleTur (test) türü zorlar.
  function turSorusu(api, sel) {
    if (api) A = api;
    if (!A) return null;
    sel = sel || {};
    if (sel.alt === 'hoer') { try { return hoerSoru(); } catch (e) { console.warn('Dinle hoer', e); return null; } }
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
    let satzNo = 0, satzBlank = -1, basta = true, pi0 = 0;
    // 7.11 inceleme: aynı kelime iki kez boşluk olmasın; işlev kelimesi (sich …) ve çok kelimeli ifadenin tek parçası (sich → sich Mühe geben) boşluk olmaz;
    // cümle ortasında büyük harfli kelime yalnız isme bağlanır (Schienen ≠ scheinen, Weile ≠ weil)
    const gor = new Set();
    const cokKelime = id => { try { return A.kind(id) === 'w' && /[\s…]/.test(A.label(id)); } catch (e) { return false; } };
    toks.forEach((t, i) => {
      if (t.ws) return;
      if (t.pi !== pi0) { pi0 = t.pi; basta = true; }
      k++;
      const c = tokRein(t.raw);
      let id = c.length >= 3 && !D_ISLEV.test(c) ? A.wortSuchen(c) : null;
      if (id && (gor.has(id) || cokKelime(id) || (!basta && /^\p{Lu}/u.test(c) && A.kind(id) !== 'n'))) id = null;
      const bilinen = id && S.items[id] && S.items[id].m && (S.items[id].m.S || 0) >= 1 && !S.items[id].a1;
      const b1 = id && A.tierOf(id) === 3;
      if (id && (bilinen || b1) && satzBlank !== satzNo && k - son >= 7 && out.length < 12 && /^[A-Za-zÄÖÜäöüß-]+$/.test(c)) {
        out.push({ i, id, form: c, bilinen: !!bilinen }); son = k; satzBlank = satzNo; gor.add(id);
      }
      basta = /[.!?:]["“”»]?$/.test(t.raw);
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
      // üç durum (7.11 inceleme: küçük hata yeşil "doğru" görünüyordu, doğrusu gösterilmiyordu): doğru yeşil, küçük hata sarı + doğrusu, yanlış kırmızı + doğrusu
      const d = M.sonuc ? M.sonuc[n] : null, sinif = d === 'richtig' ? ' ok' : d === 'fast' ? ' dn-yakin' : d ? ' yanlis' : '';
      out += `${esc(vor)}<input class="u-luecke${sinif}" data-dl="${n}" size="${Math.max(5, c.length + 1)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" value="${esc(w)}"${M.ok ? ' disabled' : ''}>${d && d !== 'richtig' ? ` <b class="u-dogru">${esc(c)}</b>` : ''}${esc(nach)}`;
    });
    return out + '</p>';
  }
  function oynatici() {
    const L = M.L;
    return `<div class="dn-oynat"><audio id="dn-audio" controls preload="auto" src="${esc(L.audio)}" onerror="this.insertAdjacentHTML('afterend','<div class=&quot;soluk dn-ses-hata&quot;>Ses yüklenemedi (bağlantı ya da DW). Metinle okumaya geçebilirsin.</div>')"></audio>
      <div class="dn-dugmeler"><button class="btn dn-geri" data-dnm="geri" type="button">⟲ 5 sn</button>
        <div class="seg dn-hiz" role="radiogroup" aria-label="Hız">${[0.75, 1].map(h => `<button type="button" data-dnm-hiz="${h}" aria-pressed="${M.hiz === h}">${h === 1 ? '1,0' : '0,75'}</button>`).join('')}</div></div></div>`;
  }
  const ADIM_AD = ['tahmin', 'metinsiz dinle', 'boşluklu metin', 'metinle dinle', 'bitti'];
  function modRender() {
    const el = A.kart(), L = M.L;
    const ust = `<div class="tur"><span class="yeni">dinleme modu</span><span>${M.adim < 4 ? `${M.adim + 1} / 4 · ` : ''}${esc(ADIM_AD[M.adim])}</span></div><div class="soru">${esc(L.titel)}</div>`;
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
        <div class="paket-text u-text-body" id="lesen-text">${modMetinHTML('luecke')}</div>${M.ok ? `<div class="sonuc ${M.puan.x === M.puan.y && !M.puan.k ? 'richtig' : M.puan.x >= M.puan.y * 0.6 ? 'fast' : 'falsch'}"><div class="baslik">${M.puan.x} / ${M.puan.y} doğru${M.puan.k ? ` · ${M.puan.k} küçük hata` : ''}</div>${M.puan.x < M.puan.y || M.puan.k ? '<div class="soluk">doğrusu yanında yeşil (sarı kutu: küçük hata)</div>' : ''}</div>` : ''}`;
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
  // boşluk kontrolü: uygulamanın metin boşluğu kontrolü (uPruef); "yazım" denen cevap sözlükte başka kelimeyse yanlış (verschieben ↔ verschrieben)
  function modPruef(w, form, id) {
    w = String(w || '').trim();
    if (!w) return 'falsch';
    const r = A.uPruef(w, form) || {};
    if (r.u === 'fast' && /^yazım/.test(r.hinweis || '') && baskaKelime(w, form, id)) return 'falsch';
    return r.u === 'richtig' ? 'richtig' : r.u === 'fast' ? 'fast' : 'falsch';
  }
  function modKontrol() {
    M.werte = M.blanks.map((b, n) => (document.querySelector(`.u-luecke[data-dl="${n}"]`) || {}).value || '');
    M.sonuc = M.blanks.map((b, n) => modPruef(M.werte[n], b.form, b.id));
    M.ok = M.sonuc.map(u => u !== 'falsch');
    M.puan = { x: M.ok.filter(Boolean).length, y: M.blanks.length, k: M.sonuc.filter(u => u === 'fast').length };
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
      notiz: [`puan:${M.puan.x}/${M.puan.y}`, `hız:${M.hiz}`, `geri:${M.geri}`, `dk:${M.dk}`].concat(M.puan.k ? [`küçük:${M.puan.k}`] : []).concat(M.tahmin && M.tahmin.trim() ? ['tahmin'] : []).join(' | ') });
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
    turSorusu, diktePruef, boslukPruef, baskaKelime, bitisikUydur, farkHTML, modAc, modKlick, modTus, hoerVar, ENTER_BEKLE,
    get mod() { return M; },
    modAcik: () => !!M,
    TURLER,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Dinle;
  else root.Dinle = Dinle;
})(this);
