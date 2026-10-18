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
  const UMFORM_TR = [[/^(weil|dass|obwohl|wenn|als|damit|ob|nachdem|bevor|während|seit|bis|so dass|falls|trotzdem|deshalb|denn)$/i, h => `„${h}“ ile birleştir`],
    [/^um … zu$|^um \.\.\. zu$/i, () => '„um … zu“ ile birleştir'], [/^Passiv$/i, () => 'Passiv yap'], [/^Perfekt$/i, () => 'Perfekt yap'], [/^Präteritum$/i, () => 'Präteritum yap'],
    [/^Plusquamperfekt$/i, () => 'Plusquamperfekt yap'], [/^Futur( I)?$/i, () => 'Futur I yap'], [/^indirekt$/i, () => 'dolaylı soru yap (Können Sie mir sagen, …?)'],
    [/^Relativsatz$/i, () => 'ilgi cümlesiyle tek cümle yap'], [/^Konjunktiv II$/i, () => 'kibar / dilek cümlesi yap (Konjunktiv II)'], [/^Nebensatz$/i, () => 'yan cümle yap'],
    [/^verneinen$/i, () => 'olumsuz yap (nicht / kein)'], [/^(kein|nicht) … sondern$/i, () => '„nicht/kein …, sondern …“ ile düzelt'],
    [/^je … desto$/i, () => '„je …, desto …“ ile tek cümle yap'], [/^zwar … aber$/i, () => '„zwar …, aber …“ ile birleştir'],
    [/^(danach|dann|deshalb|trotzdem|vorher|außerdem|sonst)$/i, h => `„${h}“ ile ikinci cümleyi bağla`],
    [/^(Wegen|Trotz|Während) /i, h => `„${h.replace(/ …$/, '')}“ ile başla (Genitiv)`],
    [/^(.+?) …$/, h => `„${h.replace(/ …$/, '')}“ ile başlayarak yeniden kur`]];
  const umformYonerge = hedef => { for (const [re, f] of UMFORM_TR) { const m = hedef.match(re); if (m) return f(hedef, m); } return `hedef: ${hedef}`; };

  // ---------- durum ----------
  const st = () => (S.gram = S.gram || { konu: {}, ghost: {} });
  const konuSt = id => { const g = st(); return g.konu[id] || (g.konu[id] = { karte: null, teil: {}, gesehen: {}, lern: null, acildi: 0 }); };
  const now = () => api.now();
  const acik = id => !!st().konu[id] && !!st().konu[id].acildi;
  const vadeli = id => { const k = st().konu[id]; return !!(k && k.acildi && (!k.karte || k.karte.due <= now())); };
  const kararlilik = id => { const k = st().konu[id]; return k && k.karte && k.karte.S ? k.karte.S : 0; };
  const aktifKapitel = () => (api.aktifKapitel ? api.aktifKapitel() : null);   // ör. "K9"
  // açılış sırası: aktif Kapitel → goethe 3 → goethe 2 → diğer; @voraus açık olmalı
  function acilabilir() {
    const ids = Object.keys(GR).filter(id => !acik(id));
    const kap = aktifKapitel();
    const puan = id => { const k = GR[id].kopf; return (kap && (k.kapitel || '').includes(kap) ? 100 : 0) + (k.goethe.stufe || 1) * 10 - (k.voraus || []).filter(v => !acik(v)).length * 50; };
    return ids.filter(id => (GR[id].kopf.voraus || []).every(v => acik(v) || !GR[v])).sort((a, b) => puan(b) - puan(a));
  }
  const buHafta = () => Object.values(st().konu).filter(k => k.acildi && now() - k.acildi < 7 * DAY).length;

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
  // giriş seti: 2×z1, 2×z2, 1×z3, farklı teil'ler
  function girisSeti(id) {
    const all = uebungen(id), out = [], used = new Set(), teils = new Set();
    [1, 1, 2, 2, 3].forEach(z => {
      const ekOk = u => !(SECMELI_EK.has(u.tur) && ekSecmeliVar(out.map(x => x.tur)));
      let aday = all.filter(u => u.z === z && !teils.has(u.teil) && ekOk(u)); if (!aday.length) aday = all.filter(u => u.z === z && ekOk(u)); if (!aday.length) aday = all.filter(ekOk); if (!aday.length) aday = all;
      const u = secUebung(id, aday, used); if (u) { out.push(u); used.add(u.n); teils.add(u.teil); }
    });
    return out;
  }
  // tekrar seti: 3 alıştırma — en zayıf teil, en eski teil, rastgele; zorluk kararlılığa göre; üç farklı tür, en az biri yazarak
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
      const y = secUebung(id, yz.filter(u => !diger.has(u.tur)).length ? yz.filter(u => !diger.has(u.tur)) : yz, used); if (y) out[out.length - 1] = y;
    }
    return out;
  }
  function ghostUebung(id, kod, ausser) {
    const all = uebungen(id).filter(u => u.teil === kod);
    const c = all.filter(u => u.n !== ausser); const havuz = c.length ? c : all;
    return havuz.length ? havuz[Math.floor(Math.random() * havuz.length)] : null;
  }
  // bugün vadesi gelen hayalet adımı (oturum içi adım 1'ler zamanı gelince)
  function hayaletHazir() {
    const g = st().ghost, t = now();
    return Object.keys(g).filter(k => g[k].due <= t && (g[k].adim > 1 || (api.soruSayisi() - (g[k].q || 0) >= 8))).sort((a, b) => g[a].due - g[b].due);
  }

  // ---------- cevap kontrolü ----------
  const norm = s => (s || '').replace(/[„“"«»”]/g, '').replace(/\s+/g, ' ').trim().replace(/\s*[.!?]+$/, '').replace(/\s+([,?.!])/g, '$1');
  const low1 = s => s.charAt(0).toLowerCase() + s.slice(1);
  const fold = s => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/,/g, '');
  function parcaPruef(giris, hedefler) {
    const u = norm(giris);
    for (const h of hedefler) { if (low1(u) === low1(norm(h))) return 'richtig'; }
    for (const h of hedefler) { if (fold(u) === fold(norm(h))) return 'fast'; }
    return 'falsch';
  }
  const Gx = () => (api && api.G) || root.G;
  function cumlePruef(giris, alts) {
    const r = Gx().pruefen(giris, alts[0], alts.slice(1));
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
      const parcalar = (giris || []).map(x => (x == null ? '' : String(x)).trim());
      const hedef = T === 'text' ? u.parcalar : parcalar.map((_, i) => u.cevap.map(c => c.split(' ; ')[i] || ''));
      const detay = parcalar.map((p, i) => parcaPruef(p, hedef[i] || []));
      const n = (hedef || []).length || 1;
      const urteil = detay.length === n && detay.every(x => x === 'richtig') ? 'richtig'
        : T === 'luecke' ? (detay.every(x => x !== 'falsch') ? 'fast' : 'falsch')
        : detay.filter(x => x !== 'falsch').length / n >= 0.5 ? 'fast' : 'falsch';
      return { urteil, tags: [], antwort: parcalar.join(' ; '), detay };
    }
    if (T === 'ordnen' || T === 'umform' || T === 'ceviri') {
      const antwort = String(giris || ''), r = cumlePruef(antwort, u.cevap);
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
  const el = () => api.kart();
  const esc = s => api.esc(s == null ? '' : String(s));
  const de = s => api.deHTML(s == null ? '' : String(s));
  const karistir = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  function render() {
    if (!ses) ses = { ekran: 'liste' };
    api.durum('');
    if (ses.ekran === 'liste') return renderListe();
    if (ses.ekran === 'tanit') return renderTanit();
    if (ses.ekran === 'ueb') return renderUebung();
    if (ses.ekran === 'son') return renderSon();
  }
  // içerikteki "doğrulanmadı" işareti (?) öğrenciye gösterilmez
  const kapTemiz = s => String(s || '').replace(/\s*\?/g, '');
  // ---- konu listesi ----
  function renderListe() {
    const ids = Object.keys(GR);
    if (!ids.length) { el().innerHTML = '<div class="bos">Gramer içeriği yok.</div>'; return; }
    const due = ids.filter(vadeli), ac = ids.filter(id => acik(id) && !vadeli(id)), yeni = acilabilir();
    const ghosts = hayaletHazir();
    const pil = id => { const Sg = kararlilik(id); return !acik(id) ? '' : vadeli(id) ? '<span class="durum-pil schwach">tekrar</span>' : Sg >= 21 ? '<span class="durum-pil sitzt">oturdu</span>' : '<span class="durum-pil lernt">öğreniliyor</span>'; };
    const satir = (id, btn) => { const k = GR[id].kopf; return `<div class="oge g-oge"><span class="de">${esc(k.titel)}${k.goethe.stufe === 3 ? ' <span class="soluk">★ sınavda şart</span>' : ''}</span><span class="tr">${esc(k.tr)}${k.kapitel ? ` · <span class="soluk">${esc(kapTemiz(k.kapitel))}</span>` : ''}</span><span class="yan">${pil(id)} ${btn}</span></div>`; };
    const h = [`<div class="tur"><span class="yeni">gramer</span><span>konu başına kısa kural + alıştırma · yanlışlar kısa aralıkla geri gelir</span></div>`];
    if (ghosts.length) h.push(`<div class="kural">⚡ ${ghosts.length} hayalet tekrar hazır (az önce yanlış yaptığın kurallar) <button class="btn mini ana" data-g="ghost-basla" type="button">Çöz</button></div>`);
    if (due.length) h.push(`<h2>Tekrar zamanı (${due.length})</h2>${due.length > 1 ? `<div class="sira"><button class="btn ana" data-g="karisik" type="button">Karışık tekrar · ${due.length} konu</button></div>` : ''}` + due.map(id => satir(id, `<button class="btn mini ana" data-g="tekrar" data-id="${id}" type="button">Tekrar et</button>`)).join(''));
    if (ac.length) h.push(`<h2>Açık konular</h2>` + ac.map(id => satir(id, `<button class="btn mini" data-g="oku" data-id="${id}" type="button">Kural</button> <button class="btn mini" data-g="tekrar" data-id="${id}" type="button">Alıştır</button>`)).join(''));
    if (yeni.length) {
      const sinir = buHafta() >= 2 || (api.birikme && api.birikme());
      h.push(`<h2>Yeni konu</h2>${sinir ? '<p class="aciklama">Bu hafta 2 yeni konu açıldı ya da kelime tekrarları birikmiş: yeni konu için biraz bekle (istersen yine açabilirsin).</p>' : ''}` +
        yeni.slice(0, 8).map(id => satir(id, `<button class="btn mini${sinir ? '' : ' ana'}" data-g="ac" data-id="${id}" type="button">Başla</button>`)).join(''));
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
      <div class="sira"><button class="btn ana devam-btn" data-g="${ses.sonra === 'giris' ? 'giris-basla' : 'liste'}" type="button">${ses.sonra === 'giris' ? 'Alıştırmalara geç (5 soru)' : 'Tamam'} <kbd>Enter</kbd></button></div>`;
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
    const ust = `<div class="tur"><span class="yeni">gramer · ${esc(TUR_AD[u.tur] || u.tur)}</span><span>${esc(g.kopf.titel)} · ${esc(teil.name)} · ${ses.i + 1}/${ses.set.length}${ses.art === 'ghost' ? ' · hayalet' : ''}</span></div>`;
    const trVar = u.tr && u.tr !== '-';
    const ipucu = !trVar ? '' : u.z === 1 || q.ipucu ? `<div class="soluk g-tr">${esc(u.tr)}</div>` : `<div class="soluk"><button class="btn mini" data-g="ipucu" type="button">Türkçesi (ipucu)</button></div>`;
    const hover = api.odakla && api.odakla();
    const woerter = (u.woerter || []).filter(w => api.kelimeAnlam && !api.kelimeGesehen(w)).map(w => `<span class="chip" title="${esc(api.kelimeAnlam(w) || '')}">${esc(w)}${api.kelimeAnlam(w) ? ' = ' + esc(api.kelimeAnlam(w)) : ''}</span>`).join('');
    let govde = '';
    if (u.tur === 'wahl' || (u.tur === 'luecke' && u.opt)) {
      if (!q.opts) q.opts = karistir(u.opt);
      govde = `<div class="soru g-soru">${de(u.soru)}</div>${ipucu}<div class="mc${q.opts.every(o => o.length < 14) ? ' kisa' : ''}">${q.opts.map(o => `<button class="mc-opt" data-g="sec" data-v="${esc(o)}" type="button">${de(o)}</button>`).join('')}</div>`;
    } else if (u.tur === 'luecke') {
      const n = (u.soru.match(/___/g) || []).length; let i = 0;
      const html = esc(u.soru).replace(/___/g, () => `<input class="g-inp" data-i="${i++}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="boşluk ${i}">`);
      govde = `<div class="soru g-soru g-luecke">${html}</div>${ipucu}<div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button><button class="btn" data-g="bilmiyorum" type="button">Bilmiyorum</button></div>${n > 1 ? '<div class="soluk">Tab ile sonraki boşluğa geç.</div>' : ''}`;
    } else if (u.tur === 'ordnen') {
      if (!q.parcalar) q.parcalar = karistir(u.soru.split(' / ').map(x => x.trim()));
      const kalan = q.parcalar.map((p, i) => ({ p, i })).filter(x => !q.secim.includes(x.i));
      govde = `<div class="soru g-soru">${ipucu ? '' : ''}Cümleyi diz:</div>${ipucu}<div class="g-dizi">${q.secim.length ? q.secim.map(i => `<button class="chip g-sec" data-g="geri" data-i="${i}" type="button">${esc(q.parcalar[i])}</button>`).join(' ') : '<span class="soluk">parçalara sırayla dokun</span>'}</div>
        <div class="chips">${kalan.map(x => `<button class="chip" data-g="parca" data-i="${x.i}" type="button">${esc(x.p)}</button>`).join('')}</div>
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${kalan.length ? ' disabled' : ''}>Kontrol <kbd>Enter</kbd></button><button class="btn mini" data-g="geri-son" type="button">← geri al</button></div>`;
    } else if (u.tur === 'fehler') {
      const toks = u.soru.split(/(\s+)/);
      const hataVar = u.hata && u.hata !== '-';
      if (q.adim === 1) govde = `<div class="soru g-soru g-fehler">${toks.map((t, i) => /\S/.test(t) ? `<button class="g-tok${q.tok === i ? ' secili' : ''}" data-g="tok" data-i="${i}" type="button">${esc(t)}</button>` : ' ').join('')}</div>${ipucu}
        <p class="aciklama">Hatalı kelimeye dokun; cümle doğruysa „Hata yok“.</p><div class="sira"><button class="btn" data-g="hata-yok" type="button">Hata yok</button></div>`;
      else govde = `<div class="soru g-soru"><s>${esc(u.hata)}</s> hatalı. Cümlenin doğrusunu yaz:</div><div class="soluk">${esc(u.soru)}</div>${ipucu}<div class="cevap"><input id="cevap" class="g-inp g-tam" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div><div class="sira"><button class="btn ana" data-g="kontrol" type="button">Kontrol <kbd>Enter</kbd></button></div>`;
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
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${tam ? '' : ' disabled'}>Kontrol <kbd>Enter</kbd></button></div>`;
    } else if (u.tur === 'kategori') {
      if (!q.ogeler) { q.ogeler = karistir(u.gruplar.flatMap((g2, gi) => g2.oge.map(o => ({ o, gi })))); q.kat = {}; }
      const aktif = q.ogeler.findIndex((_, k) => q.kat[k] == null);
      const rows = q.ogeler.map((x, k) => `<div class="g-kat-oge${q.kat[k] != null ? ' atandi' : ''}${aktif === k ? ' aktif' : ''}" data-k="${k}"><span class="g-kat-ad">${de(x.o)}</span><span class="g-kat-btns">${u.gruplar.map((g2, gi) => `<button class="btn mini g-kat-btn${q.kat[k] === gi ? ' an' : ''}" data-g="kat" data-k="${k}" data-gi="${gi}" type="button">${hover && aktif === k ? `<kbd>${gi + 1}</kbd> ` : ''}${esc(g2.ad)}</button>`).join('')}</span></div>`).join('');
      govde = `<div class="soru g-soru">${de(u.soru)}</div>${ipucu}<div class="g-kat">${rows}</div>
        <div class="sira"><button class="btn ana" data-g="kontrol" type="button"${aktif === -1 ? '' : ' disabled'}>Kontrol <kbd>Enter</kbd></button></div>`;
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
    const serbest = (u.tur === 'umform' || u.tur === 'ordnen' || u.tur === 'ceviri') && urteil !== 'richtig';   // alternatif sıralama / çeviri olabilir: kendi notunu verebilir
    const baslik = { richtig: '✓ Doğru', fast: '≈ Küçük hata', falsch: '✗ Yanlış' }[urteil];
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
    api.fx && api.fx(urteil);
    if (urteil === 'richtig' && !serbest) api.later(() => notla(3), 1400);
  }
  function notla(n) {
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
    if (ses.art === 'ghost') {
      const h = gh[key];
      if (h) { if (n === 3) { h.dogru = (h.dogru || 0) + 1; if (h.dogru >= 2) delete gh[key]; else { h.adim = Math.min(3, h.adim + 1); h.due = now() + (h.adim === 2 ? DAY : 3 * DAY); } }
        else { h.dogru = 0; h.deneme = (h.deneme || 0) + 1; h.adim = 1; h.due = now() + 5 * 60000; h.q = api.soruSayisi(); if (h.deneme >= 4) { api.leech && api.leech('g:' + key, g.kopf.titel + ' / ' + ((g.teile[u.teil] || {}).name || u.teil)); delete gh[key]; } } }
    } else if (ses.art !== 'deneme' && (n === 1 || (n === 2 && yazarak(u)))) {
      if (!gh[key]) { if (Object.keys(gh).length >= 6) { const eski = Object.keys(gh).sort((a, b) => gh[a].due - gh[b].due)[0]; delete gh[eski]; }
        gh[key] = { adim: 1, due: now() + 5 * 60000, q: api.soruSayisi(), son: u.n, dogru: 0, deneme: 0 }; }
    }
    const notiz = [`tür:${u.tur}`, `z:${u.z}`].concat(n !== 3 && (g.teile[u.teil] || {}).etiket ? [(g.teile[u.teil] || {}).etiket] : [], q.tags.filter(x => x !== 'bilmiyorum' && x !== (g.teile[u.teil] || {}).etiket), q.tags.includes('bilmiyorum') ? ['bilmiyorum'] : [],
      ses.art === 'ghost' ? ['ghost:' + ((gh[key] || {}).adim || 0)] : [], q.ipucu ? ['ipucu:1'] : [], q.oneri !== n ? [`öneri:${['', 'falsch', 'fast', 'richtig'][q.oneri]}`] : [], [`sek:${q.sek}`]);
    api.logEintrag({ modus: 'gram', id: `g:${ses.id}:${u.n}`, item: `${ses.id}/${u.teil}`, frage: u.soru, antwort: q.antwort, ergebnis: urteil, loesung: loesung(u), notiz: notiz.join(' | ') });
    api.heuteM('gram').n++; api.heuteM('gram')[urteil] = (api.heuteM('gram')[urteil] || 0) + 1;
    api.xpEkle(n === 3 ? (u.z >= 3 ? 15 : 10) : n === 2 ? 5 : 0);
    api.sayac && api.sayac(urteil);
    api.save();
    ses.i++;
    if (ses.i >= ses.set.length) setBitti(); else { ses.q = null; render(); }
  }
  function setBitti() {
    const g = GR[ses.id], ks = konuSt(ses.id), t = now();
    const puan = ses.erg.reduce((a, e) => a + (e.not === 3 ? 1 : e.not === 2 ? 0.5 : 0), 0), n = ses.erg.length;
    const oran = n ? puan / n : 0;
    const setNot = ses.art === 'ghost' || ses.art === 'deneme' ? null : oran >= 0.8 ? 3 : oran >= 0.5 ? 2 : 1;
    if (setNot) {
      const alt = ks.karte && ks.karte.S ? ks.karte : {};
      ks.karte = api.FSRS.review(alt, setNot, t, api.ret());
      // öğrenme adımları: giriş setinden sonra ertesi gün kesin tekrar; yanlışsa 1 gün içinde
      if (ses.art === 'giris' || setNot === 1) ks.karte.due = Math.min(ks.karte.due, t + DAY);
      if (ses.art === 'giris') ks.karte.due = t + DAY;
      api.logEintrag({ modus: 'gram', id: `g:${ses.id}`, item: g.kopf.titel, frage: ses.art === 'giris' ? 'giriş' : ses.art === 'kontrast' ? 'kontrast' : 'tekrar', antwort: '', ergebnis: ['', 'falsch', 'fast', 'richtig'][setNot], loesung: '', notiz: `puan:${puan}/${n} | teil:${[...new Set(ses.erg.map(e => e.teil))].join(',')}` });
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
    const sonraki = id => { const kk = konuSt(id).karte; const dk = kk && kk.due ? kk.due - now() : 0; return dk < DAY ? (dk < 3600000 ? 'birazdan' : 'yarın') : Math.round(dk / DAY) + ' gün sonra'; };
    const kopf = ses.karisikOzet && ses.karisikOzet.length > 1
      ? `<div class="ts-baslik">Karışık tekrar · ${ses.karisikOzet.length} konu</div>${ses.karisikOzet.map(o => `<div class="oge"><span class="de">${esc(GR[o.id].kopf.titel)}</span><span class="tr">${o.p}/${o.n} puan · sıradaki tekrar ${sonraki(o.id)}</span></div>`).join('')}`
      : `<div class="ts-baslik">${esc(g.kopf.titel)}</div><div class="soluk">${ses.puan}/${ses.n} puan${ses.setNot ? ` · sıradaki tekrar ${gun === 0 ? 'yarın' : gun === 1 ? 'yarın' : gun + ' gün sonra'}` : ' · hayalet tekrar'}</div>`;
    el().innerHTML = `<div class="tur-sonu"><div class="ts-rozet">${ses.setNot === 3 ? '🏆' : ses.setNot === 2 ? '👍' : ses.art === 'ghost' ? '👻' : '🌱'}</div>
      ${kopf}
      ${zayif.length ? `<div class="kural">Zayıf kaldı: ${zayif.map(esc).join(', ')} → kısa aralıkla yeniden gelecek.</div>` : ''}
      <div class="sira ts-btns">${dahaDue.length ? `<button class="btn ana" data-g="tekrar" data-id="${dahaDue[0]}" type="button">Sıradaki konu: ${esc(GR[dahaDue[0]].kopf.titel)}</button>` : ''}<button class="btn${dahaDue.length ? '' : ' ana'}" data-g="liste" type="button">Konu listesi</button><button class="btn" data-g="oku" data-id="${ses.id}" type="button">Kuralı oku</button></div></div>`;
    if (ses.setNot === 3 && api.konfeti) api.konfeti();
  }

  // ---------- olaylar ----------
  function klick(e) {
    const b = e.target.closest('[data-g]'); if (!b) return false;
    const a = b.dataset.g, id = b.dataset.id;
    if (a === 'liste') { ses = { ekran: 'liste' }; render(); }
    else if (a === 'oku') { ses = { ekran: 'tanit', id, sonra: 'liste' }; render(); }
    else if (a === 'ac') { const ks = konuSt(id); ks.acildi = now(); api.save(); api.logEintrag({ modus: 'gram', id: 'g:' + id, item: GR[id].kopf.titel, frage: 'tanıtım', antwort: '', ergebnis: 'neu', loesung: '', notiz: '' }); ses = { ekran: 'tanit', id, sonra: 'giris' }; render(); }
    else if (a === 'giris-basla') { const sek = ses.tanitBasi ? Math.round((now() - ses.tanitBasi) / 1000) : 0; if (sek) api.logEintrag({ modus: 'gram', id: 'g:' + ses.id, item: GR[ses.id].kopf.titel, frage: 'okudu', antwort: '', ergebnis: 'gelesen', loesung: '', notiz: `sek:${sek}` }); baslatSet(ses.id, 'giris', girisSeti(ses.id)); }
    else if (a === 'tekrar') baslatSet(id, 'tekrar', tekrarSeti(id));
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
      if (ses.ekran === 'son') { e.preventDefault(); const b = el().querySelector('.ts-btns .btn.ana'); if (b) klick({ target: b }); return true; }
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
    if (ses.ekran === 'ueb' && ses.q && ses.q.done && /^[123]$/.test(e.key) && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { notla(+e.key); return true; }
    return false;
  }
  // karışık tekrar: vadeli konulardan dönüşümlü (A, B, C, A, …), aynı konudan art arda en çok 2
  function karisikBaslat() {
    const due = Object.keys(GR).filter(vadeli);
    if (!due.length) return;
    const setler = due.map(id => ({ id, set: tekrarSeti(id), i: 0 }));
    const sira = []; let kaldi = true;
    while (kaldi) { kaldi = false; setler.forEach(s => { if (s.i < s.set.length) { sira.push({ id: s.id, u: s.set[s.i++] }); kaldi = true; } }); }
    ses = { ekran: 'ueb', karisik: setler.map(s => ({ id: s.id, erg: [] })), sira, k: 0 };
    karisikAdim();
  }
  function karisikAdim() {
    // her alıştırma kendi konusunun seti gibi tek tek koşulur; set sonunda konu başına FSRS
    const kar = ses.karisik, sira = ses.sira;
    if (ses.k >= sira.length) { karisikBitir(kar); return; }
    const x = sira[ses.k++];
    const erg = kar.find(s => s.id === x.id).erg;
    ses = Object.assign(ses, { ekran: 'ueb', id: x.id, art: 'tekrar', set: [x.u], i: 0, erg, q: null, karisikDevam: true });
    render();
  }
  function karisikBitir(kar) {
    const t = now(); let toplam = 0, n = 0;
    const ozetler = [];
    kar.forEach(s => { if (!s.erg.length) return; const ks = konuSt(s.id); const p = s.erg.reduce((a, e) => a + (e.not === 3 ? 1 : e.not === 2 ? 0.5 : 0), 0); const o = p / s.erg.length; const nt = o >= 0.8 ? 3 : o >= 0.5 ? 2 : 1;
      ozetler.push({ id: s.id, p, n: s.erg.length, nt });
      ks.karte = api.FSRS.review(ks.karte && ks.karte.S ? ks.karte : {}, nt, t, api.ret()); if (nt === 1) ks.karte.due = Math.min(ks.karte.due, t + DAY);
      api.logEintrag({ modus: 'gram', id: 'g:' + s.id, item: GR[s.id].kopf.titel, frage: 'tekrar', antwort: '', ergebnis: ['', 'falsch', 'fast', 'richtig'][nt], loesung: '', notiz: `puan:${p}/${s.erg.length} | karışık` }); toplam += p; n += s.erg.length; });
    api.save();
    ses = { ekran: 'son', id: kar[0].id, erg: kar.flatMap(s => s.erg), puan: toplam, n, setNot: n ? (toplam / n >= 0.8 ? 3 : toplam / n >= 0.5 ? 2 : 1) : null, art: 'tekrar', karisikOzet: ozetler };
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

  // ---------- Çalış akışı için dış arayüz ----------
  // vadeli konu sayısı / hayalet; Bugün ekranı ve plan buradan okur
  const ozet = () => ({ due: Object.keys(GR).filter(vadeli).length, acik: Object.keys(GR).filter(acik).length, ghost: hayaletHazir().length, toplam: Object.keys(GR).length });
  function init(a) { api = a; S = api.S(); }
  function yenile() { S = api.S(); }
  // test / önizleme: belirli alıştırmaları sırayla göster (FSRS'e ve hayalete yazmaz, log'a yazar)
  function dene(id, nler) { const set = (nler || []).map(n => (GR[id].uebungen || []).find(u => u.n === n)).filter(Boolean); baslatSet(id, 'deneme', set); }
  root.Gramer = { init, yenile, render, klick, tus, ozet, reset, GR, vadeli, acik, pruef, yazarak, loesung, tekrarSeti: id => tekrarSeti(id), girisSeti: id => girisSeti(id), dene };
})(window);
