// Almanca Tekrar v5 çekirdeği: tek hafıza (m) + artikel (art) + kök (kok), soru merdiveni, sistem notu, seçim, kota, göç.
// DOM'suz ve saf: tarayıcıda global `Kern`, Node'da module.exports. Rastgelelik dışarıdan (rnd) verilir.
// Tasarım: TASARIM.md / v5 spesifikasyonu (§3 merdiven, §4 puanlama, §5 seçim, §8 göç).
(function (root, factory) {
  const FSRS = root.FSRS || (typeof require === 'function' ? require('./fsrs.js') : null);
  const api = factory(FSRS);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Kern = api;
})(this, function (FSRS) {
  'use strict';

  const DAY = 86400000, SAAT = 3600000;
  const MAX_ARALIK = 60;   // gün: hiçbir tekrar aralığı bundan uzun olmaz (17.10, Tuna: 94 gün çok uzun)
  const sig = z => 1 / (1 + Math.exp(-z));
  const logit = p => Math.log(p / (1 - p));
  const kirp = (x, a, b) => Math.min(b, Math.max(a, x));

  // ================= Bağlam (uygulamadan) =================
  // kind(id) 'n'|'v'|'w'|'p' · tierOf · byId/vById/wById · istNdek · istRefl · base(id) (fiil kökü) · plOnly ·
  // trKey (Türkçe anlam anahtarı) · lemma · uluslararasi · uniteKonu (ünite ya da konu kelimesi) · konu(id) ·
  // ablaut(id) · stark(id) (düzensiz) · uniteSira() · BLITZ_ORDER · VERB_ORDER · tazeCumle · goetheLuecke ·
  // lueckeVar (hedef G.luecke ile cümlede bulunur) · kontextVar · lesenWort() · LEX (has)
  const VARSAY = {
    kind: id => id[0] === 'v' ? 'v' : id[0] === 'w' ? 'w' : id[0] === 'p' ? 'p' : 'n',
    tierOf: () => 2, byId: {}, vById: {}, wById: {},
    istNdek: () => false, istRefl: () => false, base: id => id, plOnly: () => false,
    trKey: () => '', lemma: () => '', uluslararasi: () => false, uniteKonu: () => false, konu: () => '',
    ablaut: () => '', stark: () => false, uniteSira: () => [], BLITZ_ORDER: [], VERB_ORDER: [],
    tazeCumle: () => true, goetheLuecke: () => false, lueckeVar: () => true, kontextVar: () => true,
    lesenWort: () => [], LEX: { has: () => false },
  };
  let C = Object.assign({}, VARSAY);
  function init(ctx) { C = Object.assign({}, VARSAY, ctx || {}); return api; }

  // ================= Zaman: öğrenme günü 04:00'te başlar =================
  const tagStr = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const gun4 = t => tagStr(t - 4 * SAAT);
  // öğrenme gününün başı (04:00) ve ertesi öğrenme günü 04:00
  const gunBas4 = t => { const d = new Date(t - 4 * SAAT); d.setHours(4, 0, 0, 0); return d.getTime(); };
  const ertesiGun4 = t => { const d = new Date(t - 4 * SAAT); d.setDate(d.getDate() + 1); d.setHours(4, 0, 0, 0); return d.getTime(); };
  const gunFark = (a, b) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / DAY);

  const R = (h, t) => h && h.S ? FSRS.retrievability(Math.max(0, (t - h.last) / DAY), h.S) : 0;

  // ================= Puanlama (§4) =================
  // biçim ofseti c: doğru cevapta büyüme R_ef = σ(logit R + c) ile; zor biçime negatif c yok
  const OFS = { sec: 1.5, anla: 0.5, metinde: 0.5, yaz0: 0.5, bos0: 0.5, yaz: 0, bos: 0, cumle: 0, metin: 0, yoklama: 0, artikel: 0.5, kokSec: 1.0, kok: 0, kokSatz: 0 };
  const KISMI = 0.7;                      // yazım / yavaşlık: not 3, büyüme biraz az, D değişmez
  const PK_BICIM = new Set(['yaz', 'bos', 'cumle', 'metin', 'yoklama']);
  const SECMELI = new Set(['sec', 'anla', 'metinde']);
  const KOK_BICIM = new Set(['kok', 'kokSatz', 'kokSec']);
  const YAVAS = 15000, COK_HIZLI = 400, FLAS_SURE = 8000;
  // zor soru (26.10): ipucusuz biçim ve bu sürede doğruysa anlam notu 4; daha yavaşsa normal 3 + 'yavaş'
  const ZOR_YAVAS = { yaz: 25000, bos: 40000, cumle: 120000 };
  const W_RET = { 0.8: 1.15, 0.85: 1, 0.9: 0.8 };

  // §4.5: FSRS + c, yanlışta yarın 04:00, yeni öğe gününde en geç yarın, pk kapısı (pk0 → 7 g, pk1 → 14 g)
  // opts: { yeniGun, pkSay, kapisiz } — pk/pkGun yalnız pkSay (sayılan biçim, ipucusuz, başarılı) ise ve günde en çok +1.
  // kapisiz: pk kapısı yok (artikel hafızası: pk'si hiç artmaz, 26.10'a kadar hiçbir artikel 7 günü aşamıyordu); yine ≤ MAX_ARALIK
  function guncelle(h, g, t, ret, c, opts) {
    opts = opts || {};
    ret = ret || 0.85;
    const eski = h && h.S ? h : null;
    const f = FSRS.review(eski || {}, g, t, ret, { c: g >= 2 ? (c || 0) : 0, uzun: true });
    const n = Object.assign({}, h || {}, { S: f.S, D: f.D, last: t, reps: f.reps, lapses: f.lapses, lastG: g });
    const pk0 = (h && h.pk) || 0;
    n.pk = pk0;
    if (opts.pkSay && g >= 3 && n.pkGun !== gun4(t)) { n.pk = pk0 + 1; n.pkGun = gun4(t); }
    let due;
    if (g === 1) due = ertesiGun4(t);
    else {
      let gun = Math.min(FSRS.intervalDays(n.S, ret), MAX_ARALIK);   // en uzun aralık 60 gün (B1 ufku; %85 hedefte aralık ≈ 1,9 × S olur, 94 gün çok uzun)
      // kapı bu cevaptan sonraki pk ile: bu cevap üretim kanıtıysa (pk 0 → 1) aralık ≤ 14 g; kanıtsız ≤ 7 g
      if (!opts.kapisiz) { if (n.pk === 0) gun = Math.min(gun, 7); else if (n.pk === 1) gun = Math.min(gun, 14); }
      due = t + gun * DAY;
    }
    if (opts.yeniGun) due = Math.min(due, ertesiGun4(t));
    n.due = Math.max(due, t);
    return n;
  }

  // §4.2 sonuç → not. sonuc: { bicim, tip, sure (ms), artikel: {sinandi, dogru, verilen, dogrusu, eksik}, etiketler[], yanlis (Stammform), kokYanlis }
  // tip: dogru | yazim | mastar | umlaut | hal | edat | donuslu | cekim | cumleFast | cumleYanlis | yanlis | bos | goster | bilmiyorum | yoklama | flas | stamm
  function notVer(sonuc) {
    const s = sonuc || {}, b = s.bicim, c = OFS[b] || 0, et = (s.etiketler || []).slice();
    const art = s.artikel || null;
    const aNot = () => art && art.sinandi ? (art.dogru ? 3 : 1) : null;
    const artEt = () => { if (art && art.sinandi && !art.dogru) et.push(art.eksik || !art.verilen ? 'artikel eksik' : `artikel ${art.verilen} → ${art.dogrusu}`); };
    const r = (m, a, ergebnis, x) => Object.assign({ bicim: b, m, a, k: null, c, ca: b === 'sec' ? OFS.artikel : 0, ck: 0, ergebnis, etiketler: et }, x || {});
    const secmeli = SECMELI.has(b);
    switch (s.tip) {
      case 'flas': {
        if (!s.dogru) return r(null, 1, 'falsch', { ca: OFS.artikel });
        const yavas = (s.sure || 0) > FLAS_SURE;
        if (yavas) et.push('yavaş');
        return r(null, 3, 'richtig', { ca: OFS.artikel + (yavas ? KISMI : 0) });
      }
      case 'stamm': {
        const y = s.yanlis || 0;
        return r(null, null, y === 0 ? 'richtig' : y === 1 ? 'fast' : 'falsch', { k: y === 0 ? 3 : y === 1 ? 2 : 1, ck: OFS[b] || 0 });
      }
      case 'yoklama': {
        et.push('yoklama');
        // kelime biliniyor; artikel yanlışsa log sözleşmesi: fast + 'artikel der → die' (yine de "zaten biliyorsun")
        if (art && art.sinandi && !art.dogru) { artEt(); return r(4, 1, 'fast', { c: 0 }); }
        return r(4, art && art.sinandi ? 4 : null, 'richtig', { c: 0 });
      }
    }
    // kök (çekim) sorusunda bilmiyorum / boş / göster: kök hafızası cezalanır, anlam hafızası değil
    if (KOK_BICIM.has(b) && ['bos', 'goster', 'bilmiyorum'].includes(s.tip)) { et.push('bilmiyorum'); return r(null, null, 'falsch', { k: 1, ck: OFS[b] || 0 }); }
    if (secmeli && s.sure != null && s.sure < COK_HIZLI) { et.push('sayılmadı'); return r(null, null, null); }
    switch (s.tip) {
      case 'dogru':
        if (art && art.sinandi && !art.dogru) { artEt(); return r(3, 1, 'fast'); }
        if (secmeli && (s.sure || 0) > YAVAS) { et.push('yavaş'); return r(3, aNot(), 'richtig', { c: c + KISMI }); }
        // zor soru (sözleşme §2): ipucusuz biçim, doğru, yavaş değil → 4 (FSRS kolay); yavaşsa normal 3
        if (s.zor === true && ZOR_YAVAS[b]) {
          if ((s.sure || 0) > ZOR_YAVAS[b]) { et.push('yavaş'); return r(3, aNot(), 'richtig'); }
          return r(4, aNot(), 'richtig', { zor: true });
        }
        return r(3, aNot(), 'richtig');
      case 'yazim': et.unshift('yazım'); artEt(); return r(3, aNot(), 'fast', { c: c + KISMI });
      case 'mastar': et.unshift('mastar eki'); return r(3, null, 'fast', { c: c + KISMI });
      case 'umlaut': et.unshift('umlaut'); return r(2, null, 'fast');
      case 'hal': et.unshift('hâl'); return r(2, null, 'fast');
      case 'edat': et.unshift('edat'); return r(1, null, 'falsch');
      case 'donuslu': et.unshift('dönüşlü'); return r(1, null, 'falsch');
      case 'cekim': if (!et.length) et.push('çekim'); return r(2, null, 'fast', s.kokYanlis ? { k: 1 } : null);
      case 'cumleFast': return r(3, null, 'fast');
      case 'cumleYapi': return r(2, null, 'fast');   // fiil yeri / kelime sırası: kelimeler doğru ama yapı yanlış (26.10 denetim: m3 doğruyla aynıydı)
      case 'cumleYanlis': return r(1, null, 'falsch');
      case 'bos': case 'goster': case 'bilmiyorum': et.push('bilmiyorum'); return r(1, null, 'falsch');
      default: return r(1, null, 'falsch');   // yanlış: isim yanlışsa artikel güncellenmez
    }
  }

  // günde tek kalıcı yazım: her hafıza (m, art, kok) öğrenme gününün ilk değerlendirilen cevabıyla güncellenir
  // opts: { ipucu, b, yeniGun, aksam, aksamYanlis } → { yazildi, aksam, m:{R, S}, a, k, seviyeOnce, seviyeSonra }
  // Akşam istisnası (opts.aksam): bugün tanıtılan ya da bugün yanlış / fast cevaplanan öğede (hafıza lastG ≤ 2 ve bugün yazılmış,
  // ya da uygulamanın log'dan bildirdiği opts.aksamYanlis) m ve art hafızası bugün yazılmış olsa da akşam BİR kez daha yazılır
  // (öğrenme adımı: vade en geç ertesi gün 04:00). Kök hafızası ve diğer öğeler kurala bağlı kalır.
  function aksamHakki(S, id, t, opts) {
    const it = S.items[id], g = gun4(t);
    if (!it) return false;
    if (it.tanit && gun4(it.tanit) === g) return true;
    if (opts && opts.aksamYanlis) return true;
    return [it.m, it.art].some(h => h && h.S && h.gun === g && (h.lastG || 3) <= 2);
  }
  function uygula(S, id, not, t, opts) {
    opts = opts || {};
    const it = S.items[id] = S.items[id] || { seit: t };
    const ret = (S.einst && S.einst.ret) || 0.85, g = gun4(t), out = { yazildi: false, aksam: false, seviyeOnce: seviye(it, id) };
    const yeniGun = opts.yeniGun != null ? opts.yeniGun : !!(it.tanit && gun4(it.tanit) === g);
    const aksam = !!opts.aksam && aksamHakki(S, id, t, opts);
    const yaz = (h, not_, c, pkSay, aksamOk, kapisiz) => {
      const once = R(h, t);
      // istisna yalnız günün daha erken bir oturumunda (≥ 4 saat önce) yazılmış hafızaya: akşam ilk kez sorulup yanlış yapılan öğenin
      // aynı turdaki yeniden sorusu ikinci kez yazmasın (26.10, e2e_aksam)
      const ist = aksamOk && h && h.S && h.gun === g && h.aksam !== g && t - h.last >= 4 * SAAT;
      if (h && h.gun === g && !ist) return { h, r: { R: once, S: h.S, yazildi: false } };
      const n = guncelle(h, not_, t, ret, c, { yeniGun: yeniGun || ist, pkSay, kapisiz });
      n.gun = g;
      if (ist) { n.aksam = g; out.aksam = true; }
      out.yazildi = true;
      return { h: n, r: { R: once, S: n.S, yazildi: true, aksam: !!ist } };
    };
    if (not.m != null) {
      let x;
      if (not.m === 4 && (not.etiketler || []).includes('yoklama') && !(it.m && it.m.S)) {
        // yoklama doğru: kolay başlangıç, pk=1 (kotaya sayılmaz)
        const f = FSRS.review({}, 4, t, ret);
        x = { h: Object.assign({}, it.m || {}, { S: f.S, D: f.D, last: t, due: Math.min(t + FSRS.intervalDays(f.S, ret) * DAY, t + 14 * DAY), reps: 1, lapses: 0, lastG: 4, pk: 1, pkGun: g, gun: g }), r: { R: 0, S: f.S, yazildi: true } };
        out.yazildi = true;
      } else x = yaz(it.m, not.m, not.c, PK_BICIM.has(not.bicim) && !opts.ipucu, aksam);
      const hOnce = it.m;
      it.m = x.h; out.m = x.r;
      if (x.r.yazildi) {
        delete it.m.dogrula; delete it.yarim;
        // basamak kapısı: doğru ve ipucusuz cevap bm'yi o basamağa çıkarır; vade bm aralığını aşmaz
        const h = it.m;
        if (h.bm == null) h.bm = hOnce && hOnce.S ? bmBaslat(hOnce) : 0;
        // seviye yalnız tam doğru, ipucusuz ve itirazsız cevapla (26.10: yazım hatalı / küçük hatalı ya da itirazla kazanılan cevap seviye atlatmaz)
        if (not.m >= 3 && not.ergebnis === 'richtig' && opts.b && !opts.ipucu && !opts.itiraz) h.bm = Math.max(h.bm, opts.b);
        // art arda doğru kalıcı yazım (zor soru kapısı): doğru ve ipucusuz +1, yanlış / fast (not < 3) 0, ipuçlu doğru değiştirmez
        h.ds = not.m < 3 ? 0 : opts.ipucu ? dsOf(hOnce) : dsOf(hOnce) + 1;
        if (not.m >= 2 && h.S) h.due = Math.max(t, Math.min(h.due, h.last + bmAralik(h, id) * DAY));
      }
      if (opts.b) it.m.b = opts.b;
    }
    if (not.a != null && C.kind(id) === 'n' && !C.plOnly(id)) { const x = yaz(it.art, not.a, not.ca, false, aksam, true); it.art = x.h; out.a = x.r; }
    if (not.k != null) {
      const bs = C.base(id), kk = S.kok = S.kok || {};
      const x = yaz(kk[bs] && kk[bs].S ? kk[bs] : null, not.k, not.ck);
      kk[bs] = Object.assign({}, kk[bs] || {}, x.h, { ornek: (kk[bs] && kk[bs].ornek) || id });
      delete kk[bs].yeni;
      out.k = x.r;
    }
    out.seviyeSonra = seviye(it, id);
    return out;
  }

  // ================= Merdiven (§3) =================
  // kapılar basamakla aynı (§3): pk 0 → en çok 2 (Yazıyor), pk 1 → en çok 3 (Cümlede); id verilirse tier-3 isim/diğer
  // (ünite/konu dışı) → en çok 3. Seçmeli / metinde doğrusu S'i büyütse de kelimeyi "Cümlede" yapmaz.
  const seviye = (it, id) => {
    const h = it && it.m;
    if (!h || !h.S) return 0;
    let sv = h.S < 2 ? 1 : h.S < 7 ? 2 : h.S < 21 ? 3 : h.S < 90 ? 4 : (h.pk || 0) >= 2 ? 5 : 4;
    const pk = h.pk || 0;
    if (pk === 0) sv = Math.min(sv, 2); else if (pk === 1) sv = Math.min(sv, 3);
    // "Yazıyor" en az iki değerlendirilmiş cevaptan sonra (tanıtım + tek seçmeli kelimeyi yazıyor yapmasın)
    if (sv === 2 && h.reps != null && h.reps < 2 && !(h.lastG >= 3 && pk >= 1)) sv = 1;
    if (id && C) { try { const k = C.kind(id); if ((k === 'n' || k === 'w') && C.tierOf(id) === 3 && !C.uniteKonu(id)) sv = Math.min(sv, 3); } catch (e) { /* bilinmeyen öğe */ } }
    // seviye kanıtlanan basamağı aşmaz (bm 2 = yazdı → en çok Yazıyor); en üst basamağına çıkmış öğe S'e göre Oturdu / Usta olur
    if (h.bm != null && h.bm < ustBasamak(id)) sv = Math.min(sv, Math.max(1, h.bm));
    return sv;
  };
  // Zor soru (26.10, Tuna: "neredeyse hep biliyorum ama seviye atlamıyor; zor sor, ipucusuz sor, bilirsem seviye atlat"):
  // anlam hafızasında art arda ≥ 2 doğru kalıcı yazım (ds) varken S eşikleri soruyu bm + 1'in altına itiyorsa soru bm + 1'den,
  // ipucusuz biçimle gelir (yaz / bos / cumle). Kapılar (pk, tier-3, ustBasamak, taze cümle, Goethe boşluğu) aynen; S eşikleri
  // normal seçimde değişmez. Seviye yalnız zor soru doğru (not 4, bm yükselir) olunca çıkar.
  const ZOR_DS = 2;
  // eski hafızada ds yoksa son not ≥ 3 → 1
  const dsOf = h => h && h.S ? (h.ds != null ? h.ds : (h.lastG || 0) >= 3 ? 1 : 0) : 0;
  // zor soru basamağı (0 = aday değil)
  function zorHedef(it, id, t) {
    const h = (it && it.m) || {};
    if (!h.S || h.bm == null || h.dogrula || dsOf(h) < ZOR_DS || R(h, t) < 0.5) return 0;
    const pk = h.pk || 0, k = C.kind(id);
    let b = h.bm + 1;
    if (pk === 0) b = Math.min(b, 2); else if (pk === 1) b = Math.min(b, 3);
    if ((k === 'n' || k === 'w') && C.tierOf(id) === 3 && !C.uniteKonu(id)) b = Math.min(b, 3);
    b = Math.min(b, ustBasamak(id));
    if (b >= 3 && !C.tazeCumle(id)) b -= 1;
    if (b === 4 && !C.lueckeVar(id)) b = 3;
    return b >= 2 ? b : 0;
  }
  const ZOR_BICIM = { 2: 'yaz', 3: 'bos', 4: 'cumle' };
  // bag: { id, t, isinma, momentum, kurtarma, klavyesiz, zorOk } → { b, yenidenTanit, zor?, bNormal? }
  // zorOk yalnız normal vadeli seçimde (sec adım 6); kurtarma / ısınma / momentum / klavyesiz turda zor soru yok
  function basamak(it, bag, rnd) {
    bag = bag || {}; rnd = rnd || Math.random;
    const id = bag.id, h = it.m || {}, S = h.S || 0, r = R(h, bag.t), pk = h.pk || 0, k = C.kind(id);
    let b = S < 2 ? 1 : S < 7 ? 2 : S < 21 ? 3 : 4;
    if (pk === 0) b = Math.min(b, 2); else if (pk === 1) b = Math.min(b, 3);
    if ((k === 'n' || k === 'w') && C.tierOf(id) === 3 && !C.uniteKonu(id)) b = Math.min(b, 3);
    if (h.S && h.bm != null) b = Math.min(b, h.bm + 1);   // basamak kapısı: en çok bir basamak yukarı
    const yenidenTanit = !!(h.S && r < 0.35);
    if (bag.kurtarma || r < 0.5) b = 1;
    if (bag.isinma || bag.momentum || h.dogrula) b -= 1;
    if (b >= 3 && rnd() < 0.2) b -= 1;
    if (b >= 3 && !C.tazeCumle(id)) b -= 1;
    if (b === 4 && !C.lueckeVar(id)) b = 3;
    if (bag.klavyesiz) b = 1;
    b = Math.max(1, b);
    if (it.a1 && !bag.kurtarma && !bag.klavyesiz) b = Math.max(2, b);   // A1: anlam sorulmaz (kurtarmada ve klavyesiz turda 'sec' serbest, artikeli sınar)
    if (bag.zorOk && !bag.kurtarma && !bag.isinma && !bag.momentum && !bag.klavyesiz) {
      const zh = zorHedef(it, id, bag.t);
      if (zh > b) return { b: zh, yenidenTanit, zor: true, bNormal: b };
    }
    return { b, yenidenTanit };
  }
  // §3 biçim tablosu; son: son sorulan biçimler (aynı biçim en çok 2 kez üst üste) → { bicim, uretec } ya da null
  function bicimSec(it, b, bag, rnd, son) {
    bag = bag || {}; rnd = rnd || Math.random; son = son || [];
    const id = bag.id, h = it.m || {}, k = C.kind(id), kx = C.kontextVar(id);
    const tekrarli = x => son.length >= 2 && son[son.length - 1] === x && son[son.length - 2] === x;
    // zor soru: yalnız ipucusuz biçim, üreteç yok (düz boşluk / tam cümle); aynı biçim 3. kez üst üste gelecekse null
    if (bag.zor) { const z = ZOR_BICIM[b]; return z && !tekrarli(z) ? { bicim: z, uretec: null } : null; }
    let aday;
    if (b <= 1) {
      const u = rnd();
      if (it.a1) aday = ['sec'];
      else if (k === 'v') aday = u < 0.5 ? ['sec', 'metinde', 'anla'] : u < 0.7 ? ['anla', 'sec', 'metinde'] : ['metinde', 'sec', 'anla'];
      else aday = u < 0.6 ? ['sec', 'metinde'] : ['metinde', 'sec'];
      if (!kx) aday = aday.filter(x => x !== 'metinde');
    } else if (b === 2) {
      // erken üretim kapısında (pk 0) tutulan, oturmaya başlamış öğe (S ≥ 3): ara sıra fiili / kelimeyi verilen cümle boşluğu (bos0; pk saymaz),
      // böylece göçten sonra da turda cümle gelir (kural 7, 11)
      if ((h.pk || 0) === 0 && (h.S || 0) >= 3 && h.lastG !== 1 && C.tazeCumle(id) && rnd() < 0.35) aday = ['bos0', (h.S || 0) < 4 ? 'yaz0' : 'yaz'];
      else aday = [(h.S || 0) < 4 || h.lastG === 1 ? 'yaz0' : 'yaz'];
    }
    else if (b === 3) aday = [(h.S || 0) < 10 ? 'bos0' : 'bos'];
    else aday = ['cumle'];
    const bicim = aday.find(x => !tekrarli(x));
    if (!bicim) return null;
    let uretec = null;
    if (b === 3) {
      if (k === 'n' && C.istNdek(id) && rnd() < 1 / 3) uretec = 'ndek';
      else if (k === 'v' && C.istRefl(id) && rnd() < 1 / 3) uretec = 'refl';
      else if (k === 'v' && C.goetheLuecke(id) && rnd() < 1 / 4) uretec = 'luecke';
    }
    return { bicim, uretec };
  }

  // ================= Seçim (§5) =================
  const wRet = ret => W_RET[ret] != null ? W_RET[ret] : ret <= 0.8 ? 1.15 : ret >= 0.9 ? 0.8 : ret < 0.85 ? 1.15 - (ret - 0.8) * 3 : 1 - (ret - 0.85) * 4;
  // vadeli hafızalar: m (anlam), yalnız art (artikel flaşı), kok (kök)
  function vadeliler(S, t, filtre) {
    const out = [];
    Object.entries(S.items || {}).forEach(([id, it]) => {
      if (filtre && !filtre(id)) return;
      if (C.kind(id) === 'p') return;
      if (it.m && it.m.S && it.m.due <= t) out.push({ id, tur: 'm', R: R(it.m, t), due: it.m.due });
      else if (it.art && it.art.S && it.art.due <= t) out.push({ id, tur: 'art', R: R(it.art, t), due: it.art.due });
    });
    Object.entries(S.kok || {}).forEach(([bs, k]) => {
      if (!k.S || k.due > t || !k.ornek || (filtre && !filtre(k.ornek))) return;
      out.push({ id: k.ornek, tur: 'kok', base: bs, R: R(k, t), due: k.due });
    });
    return out;
  }
  // bugün kotadan açılan yeni öğe (§5.2): yalnız tanıtılan yeni öğeler (yoklamada kalanlar dahil). Yarım öğeler ve yoklamayı
  // geçenler kotaya sayılmaz; yarımların ayrı sınırı günde en çok 3 (YARIM_GUN, yeniParti)
  const bugunYeni = (S, t) => Object.values(S.items || {}).filter(it => it.yeni4 === gun4(t)).length;
  const YARIM_GUN = 3;
  const bugunYarim = (S, t) => Object.values(S.items || {}).filter(it => it.yarimGun === gun4(t)).length;
  // A1 düğmesinin kurduğu öğe (bilerek m'siz: yalnız artikel hafızası). Düğmenin a1 işaretlediği eski öğe (quelle başka) yarımsa yarım kalır
  const a1Mi = it => !!(it && it.quelle === 'a1');
  // 3+ gün aradan sonra bugün henüz cevap yoksa: dönüş turu (o turda yeni yok)
  function donusMu(S, t) {
    const g = gun4(t), tage = S.tage || {};
    if (tage[g] && tage[g].n) return false;
    const once = Object.keys(tage).filter(d => d < g && tage[d] && tage[d].n).sort().pop();
    return !!once && gunFark(g, once) >= 3;
  }
  // §5.2 kota. durum: { S, kap (günlük hedef, cevap), bonus (bugünkü bonus tur), donus, uniteKalan {kalan, gun} }
  // Basamak kapısı (19.10, Tuna: "kelimeler seviye atlamak yerine 60 gün tekrara düşüyor"): anlam hafızasında bm = doğru (ipucusuz)
  // cevaplanan en yüksek basamak. Aralık bm'ye göre sınırlı (B1 7 g, B2 14 g, B3 30 g, öğenin en üst basamağına ulaştıysa 60 g) ve sonraki
  // soru en çok bir basamak yukarıdan gelir: tek doğru yazma / eski "biliyorum" işareti kelimeyi 2 ay ortadan kaldırmaz, önce cümleye çıkar.
  const BM_ARALIK = [7, 7, 14, 30, MAX_ARALIK];
  // öğenin çıkabileceği en üst basamak: tier-3 isim / diğer (ünite dışı) ve Goethe boşluğu / cümlesi olmayan öğe 3, cümlesi hiç olmayan 2
  function ustBasamak(id) {
    if (!id || !C) return 4;
    try {
      const k = C.kind(id);
      if (C.cumleVar && !C.cumleVar(id)) return 2;
      if ((k === 'n' || k === 'w') && C.tierOf(id) === 3 && !C.uniteKonu(id)) return 3;
      if (C.lueckeVar && !C.lueckeVar(id)) return 3;
    } catch (e) { /* bilinmeyen öğe */ }
    return 4;
  }
  // bm'si olmayan (göçten ya da bu kuraldan önce yazılmış) hafıza: pk 0 → 1, pk ≥ 1 → 2; son cevap doğruysa o basamak
  const bmBaslat = h => Math.max((h.pk || 0) === 0 ? 1 : 2, h.b && h.lastG >= 3 ? h.b : 0);
  const bmAralik = (h, id) => (h.bm || 1) >= ustBasamak(id) ? MAX_ARALIK : BM_ARALIK[Math.max(1, h.bm || 1)];
  // Mevcut hafızalarda MAX_ARALIK'tan uzun aralık varsa (eski %85 hesabı) vadeyi last + 60 güne çeker; anlam hafızasında pk kapısını
  // (pk 0 → 7 g, pk 1 → 14 g: göçte uygulanmamıştı) ve basamak kapısını (bm) da uygular; idempotent, her açılışta ucuz
  function aralikKisalt(S, t) {
    let n = 0; const kes = (h, gun) => { if (!(h && h.S && h.due && h.last)) return; const yeni = Math.max(h.last + gun * DAY, t); if (h.due - h.last > gun * DAY && h.due > yeni) { h.due = yeni; n++; } };   // zaten vadeliyse dokunmaz (her açılışta yeniden yazmasın)
    Object.entries(S.items || {}).forEach(([id, it]) => {
      const h = it.m;
      if (h && h.S) {
        if (h.bm == null) h.bm = bmBaslat(h);
        const pk = h.pk || 0;
        kes(h, Math.min(MAX_ARALIK, pk === 0 ? 7 : pk === 1 ? 14 : MAX_ARALIK, bmAralik(h, id)));
      }
      kes(it.art, MAX_ARALIK);
    });
    Object.values(S.kok || {}).forEach(h => kes(h, MAX_ARALIK));
    Object.values(S.pakete || {}).forEach(p => kes(p.m, MAX_ARALIK));
    return n;
  }

  function kota(durum, t) {
    const S = durum.S, ret = (S.einst && S.einst.ret) || 0.85;
    const kap = (durum.kap || 36) * wRet(ret), b4 = gunBas4(t);
    const L = Object.values(S.items || {});
    const genc = L.filter(it => it.m && it.m.S && it.m.S < 7).length;
    const birikme = L.filter(it => (it.m && it.m.S && it.m.due < b4) || (it.art && it.art.S && it.art.due < b4)).length;
    const taban = ((S.ayar4 || {}).yeniGunluk) || 6;
    // Genç kelime freni yalnız birikme oluşuyorsa tam kısar (2); birikme sıfırsa (tekrarlar günü gününe yapılıyor) en çok 4'e iner:
    // 17.10: Tuna birikmesiz 50+ cevapla günü bitiriyordu ve kota haftalarca 2'de kalacaktı (genç 95 > 1,6 × kap)
    let q, sebep;
    if (birikme > 2 * kap) { q = 2; sebep = 'birikme'; }
    else if (genc > 1.6 * kap) { q = birikme > kap / 4 ? 2 : Math.min(taban, 4); sebep = 'genç'; }   // birkaç gecikmiş öğe (sabah) kotayı yarıya indirmez
    else if (genc > 1.1 * kap) { q = Math.min(taban, 4); sebep = 'genç'; }
    else { q = taban; sebep = 'normal'; }
    if (durum.bonus && (genc < 2 * kap || birikme <= kap / 4)) q += Math.min(4, 2 * durum.bonus);   // bonus tur: birikme yoksa genç sayısına bakılmaz
    if (S.goc4 && S.goc4.zaman && !S.goc4.bos && gunFark(gun4(t), gun4(S.goc4.zaman)) < 3) { q = Math.min(q, 2); sebep = 'göç'; }
    q = Math.max(2, q);
    let qUnite = q;
    const uh = durum.uniteKalan;
    if (uh && uh.gun > 0) qUnite = Math.max(q, Math.min(10, Math.ceil(uh.kalan / uh.gun)));
    if (durum.donus) { q = 0; qUnite = 0; sebep = 'dönüş'; }
    // kota kısılmışken (sebep ≠ normal) o günün yarımı kotadan sayılır (sec → partiAc ile aynı kural)
    const yapilan = bugunYeni(S, t) + (sebep !== 'normal' && sebep !== 'dönüş' ? Math.min(1, bugunYarim(S, t)) : 0);
    return { q, qUnite, kalan: Math.max(0, q + (durum.ekYeni || 0) - yapilan), kap, genc, birikme, sebep, yapilan };
  }
  // §5.3 yeni sıra: yarım → okurken bakılan → aktif ünite → sık B1 (build: sik, frek azalan) → Goethe sırası (B1 önce, her 3 yeniden biri fiil)
  // (B1 sprinti 28.10: okuma metinlerinde en sık 300 B1 kelimesi listenin geri kalanından önce; kota değişmez)
  const kayit = id => (C.byId || {})[id] || (C.vById || {})[id] || (C.wById || {})[id] || null;
  function yeniSira(S) {
    const yarim = Object.keys(S.items || {}).filter(id => S.items[id].yarim && !a1Mi(S.items[id]) && !(S.items[id].m && S.items[id].m.S));
    const onde = new Set();
    const ilk = [].concat(C.lesenWort() || [], C.uniteSira() || []).filter(id => !S.items[id]);
    ilk.forEach(id => onde.add(id));
    const yeniMi = id => !S.items[id] && !onde.has(id);
    const sik = [].concat(C.BLITZ_ORDER || [], C.VERB_ORDER || []).filter(id => yeniMi(id) && (kayit(id) || {}).sik)
      .map((id, i) => [id, i]).sort((a, b) => ((kayit(b[0]).frek || 0) - (kayit(a[0]).frek || 0)) || a[1] - b[1]).map(x => x[0]);
    const t3 = l => l.filter(yeniMi).map((id, i) => [id, i]).sort((a, b) => (C.tierOf(a[0]) === 3 ? 0 : 1) - (C.tierOf(b[0]) === 3 ? 0 : 1) || a[1] - b[1]).map(x => x[0]);
    const nv = t3(C.BLITZ_ORDER || []), vv = t3(C.VERB_ORDER || []), karisik = [];
    while (nv.length || vv.length) karisik.push(karisik.length % 3 === 2 && vv.length ? vv.shift() : nv.length ? nv.shift() : vv.shift());
    // aktif ünite ile sık B1 kelimeleri karışık: her 2 ünite kelimesine 1 sık kelime (27.10: ünite 120+ kelimeyle sırayı doldurunca sık kelime sprintte hiç gelmiyordu)
    const lw = (C.lesenWort() || []).filter(id => !S.items[id]), un = (C.uniteSira() || []).filter(id => !S.items[id]), sk = sik.slice(), unSik = [];
    while (un.length || sk.length) unSik.push(unSik.length % 3 === 2 && sk.length ? sk.shift() : un.length ? un.shift() : sk.shift());
    const g = new Set(), out = [];
    yarim.concat(lw, unSik, karisik).forEach(id => { if (!g.has(id)) { g.add(id); out.push(id); } });
    return out;
  }
  function lev(a, b) {
    a = String(a || '').toLowerCase(); b = String(b || '').toLowerCase();
    if (a === b) return 0;
    let p = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const q = [i];
      for (let j = 1; j <= b.length; j++) q[j] = Math.min(p[j] + 1, q[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = q;
    }
    return p[b.length];
  }
  // §5.4 karışma kapısı: aynı anlam, aynı kök / Ablaut, benzer lemma (lev ≤ 2), aynı konudan (themen.txt) ya da aynı anlam alanından
  // (ünite @gruppe'u, build: alan) 2'den fazla öğe birlikte (aynı gün) girmez — 18.10: "Werte" kümesinden 9 kelime aynı gün, konusuzdu
  const alanOf = id => (kayit(id) || {}).alan || '';
  function karismaOk(id, digerleri) {
    const tk = C.trKey(id), bs = C.kind(id) === 'v' ? C.base(id) : '', ab = C.ablaut(id), lm = C.lemma(id), kn = C.konu(id), al = alanOf(id);
    let ayniKonu = 0, ayniAlan = 0;
    for (const o of digerleri) {
      if (tk && C.trKey(o) === tk) return false;
      if (bs && C.kind(o) === 'v' && C.base(o) === bs) return false;
      if (ab && C.ablaut(o) === ab) return false;
      if (lm && C.lemma(o) && lev(lm, C.lemma(o)) <= 2) return false;
      if (kn && C.konu(o) === kn) ayniKonu++;
      if (al && alanOf(o) === al) ayniAlan++;
    }
    return ayniKonu < 2 && ayniAlan < 2;
  }
  const yoklamaAday = (S, id) => !S.items[id] && (C.tierOf(id) === 1 || C.uluslararasi(id));
  // yeni parti: kotadan n yeni öğe + kotadan bağımsız en çok opts.yarimHak yarım öğe (günde en çok YARIM_GUN);
  // bugün tanıtılanlarla birlikte karışma kapısından geçer
  function yeniParti(S, t, n, opts) {
    opts = opts || {};
    const bugun = Object.keys(S.items || {}).filter(id => S.items[id].tanit && gun4(S.items[id].tanit) === gun4(t));
    const sec = [], yoklama = [];
    const yHak = Math.max(0, Math.min(opts.yarimHak == null ? YARIM_GUN : opts.yarimHak, (opts.yarimGunluk == null ? YARIM_GUN : opts.yarimGunluk) - bugunYarim(S, t)));
    let yeniSay = 0, yarimSay = 0;
    const kotadan = !!opts.yarimKotadan, dolu = () => yeniSay + (kotadan ? yarimSay : 0) >= n;
    for (const id of yeniSira(S)) {
      if (dolu() && (kotadan || yarimSay >= yHak)) break;
      if (opts.filtre && !opts.filtre(id)) continue;
      const yarim = !!(S.items[id] && S.items[id].yarim);
      if (yarim ? (yarimSay >= yHak || (kotadan && dolu())) : dolu()) continue;
      if (!karismaOk(id, bugun.concat(sec))) continue;
      sec.push(id);
      if (yarim) yarimSay++;
      else { yeniSay++; if (yoklama.length < (opts.yoklamaHak == null ? 2 : opts.yoklamaHak) && yoklamaAday(S, id)) yoklama.push(id); }
    }
    // yoklama kartları önce: tanıtım kartları art arda kalsın, ardından mini sorular (anlam alanı kapısı sırayı karıştırınca
    // yoklama adayı iki tanıtımın arasına düşebiliyordu)
    return { ids: yoklama.concat(sec.filter(id => !yoklama.includes(id))), yoklama };
  }

  // ================= Akşam tekrarı =================
  // Sabah çalışıp akşam unuttuğunu hisseden öğrenci için: yeni ve yanlış yapılan öğelerde aynı gün ikinci hatırlama + uykudan önce tekrar.
  // Oturmuş (bugün doğru bilinen, R ≥ 0,9) öğeleri 12 saat sonra yeniden sormak boşa: girmez.
  const AKSAM = { MAX: 15, MIN: 3, SAAT_SINIR: 13, ARA_SAAT: 8, YAZ0: 0.75 };
  // bugünün (öğrenme günü) ilk cevabı, hafızadan: bugün yazılmış m / art'ın last'ı (günde tek yazımda last = o günün ilk cevabı;
  // akşam yazımı last'ı değiştirir, o yüzden akşam yazılmış hafıza sayılmaz) ve bugünkü tanıtımlar. Uygulama log'la birlikte min alır.
  function ilkCevap(S, t) {
    const g = gun4(t); let ilk = Infinity;
    Object.values(S.items || {}).forEach(it => {
      [it.m, it.art].forEach(h => { if (h && h.S && h.gun === g && h.aksam !== g && h.last < ilk) ilk = h.last; });
      if (it.tanit && gun4(it.tanit) === g && it.tanit < ilk) ilk = it.tanit;
    });
    return ilk === Infinity ? null : ilk;
  }
  // adaylar (öncelik): 1) bugün tanıtılan (yeni / yarım) 2) bugün yanlış ya da fast (opts.yanlis: log'dan; hafızada lastG ≤ 2 ve bugün yazılmış)
  // 3) R(şimdi) < 0,9 (vadesi gelmemiş olsa da). Grup içinde R artan. opts: { yanlis: Set|Array, haric: Set|Array (bu akşam sorulanlar), filtre,
  // max (varsayılan 15; uygulama 15 − bu akşam sorulan verir: akşam bir kez 15 öğe, birikme akşamı sonsuz tura çevirmesin) }
  function aksamAdaylar(S, t, opts) {
    opts = opts || {};
    const g = gun4(t), yanlis = new Set(opts.yanlis || []), haric = new Set(opts.haric || []), out = [];
    Object.entries(S.items || {}).forEach(([id, it]) => {
      if (C.kind(id) === 'p' || haric.has(id) || (opts.filtre && !opts.filtre(id))) return;
      const h = it.m && it.m.S ? it.m : null, r = h ? R(h, t) : 0;
      let neden = null;
      if (it.tanit && gun4(it.tanit) === g) neden = 'yeni';
      else if (!h) return;   // anlam hafızası yok (A1 düğmesi: yalnız artikel): akşam turu anlam sorar
      else if (yanlis.has(id) || [it.m, it.art].some(x => x && x.S && x.gun === g && (x.lastG || 3) <= 2)) neden = 'yanlis';
      else if (h && r < 0.9) neden = 'dusukR';
      if (!neden) return;
      out.push({ id, neden, R: r });
    });
    const sira = { yeni: 0, yanlis: 1, dusukR: 2 };
    return out.sort((a, b) => sira[a.neden] - sira[b.neden] || a.R - b.R).slice(0, Math.max(0, opts.max != null ? opts.max : AKSAM.MAX));
  }
  // kart koşulu: ilk cevap öğrenme gününde 13:00'ten önce, üzerinden ≥ 8 saat geçmiş, aday ≥ 3
  function aksamUygun(ilk, t, adaySay) {
    if (ilk == null || gun4(ilk) !== gun4(t)) return false;
    if (new Date(ilk).getHours() >= AKSAM.SAAT_SINIR || ilk < gunBas4(t)) return false;
    return t - ilk >= AKSAM.ARA_SAAT * SAAT && adaySay >= AKSAM.MIN;
  }
  // akşam turunda seçim (sec, o.aksam = aday kimlikleri sırayla): kuyruk (yanlış → yeniden) → sıradaki sorulmamış aday
  // (yeni öğrenilende çoğunlukla yaz0, yoksa normal merdiven) → bekleyen kuyruk → bitti (teklif yok: akşam yeni kelime yok)
  function aksamSec(S, o, t, rnd, kuyrukSec) {
    const gecmis = o.gecmis || [], sorulan = new Set(gecmis.map(x => x.id)), sonBicim = gecmis.map(x => x.bicim), g = gun4(t);
    for (const id of o.aksam) {
      if (sorulan.has(id) || (o.filtre && !o.filtre(id))) continue;
      const it = S.items[id]; if (!it) continue;
      const yeni = !!(it.tanit && gun4(it.tanit) === g), r = R(it.m, t);
      if (yeni && !o.klavyesiz && rnd() < AKSAM.YAZ0) return { tur: 'm', kaynak: 'aksam', id, b: 2, bicim: 'yaz0', uretec: null, R: r };
      const bs = basamak(it, { id, t, klavyesiz: o.klavyesiz }, rnd);
      const bc = bicimSec(it, bs.b, { id, t }, rnd, sonBicim) || bicimSec(it, bs.b, { id, t }, rnd, []);
      if (bc) return { tur: 'm', kaynak: 'aksam', id, b: bs.b, bicim: bc.bicim, uretec: bc.uretec, R: r };
    }
    const son1 = gecmis.length ? gecmis[gecmis.length - 1].id : null;
    const bek = (o.kuyruk || []).filter(k => (!o.filtre || o.filtre(k.id)) && k.id !== son1).sort((a, b) => a.at - b.at)[0];
    if (bek) return kuyrukSec(bek);
    return { tur: 'bitti', kaynak: 'bitti', teklif: null };
  }

  // oturum: { adim, boy, kuyruk[{id, neden, at, deneme, tur, b, bicim}], parti, metin, kurtarma, yanlisSeri, gecmis[{id, bicim, tur}], klavyesiz, filtre }
  // durum:  { S, kap, bonus, donus, ekYeni, gunSay: {kok, kokYeni, metin, diktat, yoklama, ekYeniTeklif} }
  const ARA = 8, ART_TUR = 3, ZOR_TUR = 3, GRAM_ADIM = [5, 10];   // gramer sorusu: turun 1. ve 2. gramer adımı (S3)
  function sec(durum, oturum, t, rnd) {
    rnd = rnd || Math.random;
    const S = durum.S, o = oturum, adim = o.adim || 0, boy = o.boy || 12, gs = durum.gunSay || {};
    const gecmis = o.gecmis || [], sonIds = gecmis.slice(-(ARA - 1)).map(x => x.id), sonBicim = gecmis.map(x => x.bicim);
    const yakin = id => sonIds.includes(id);
    const m1 = (id, kaynak, bag) => {
      const it = S.items[id];
      let bs = basamak(it, Object.assign({ id, t, klavyesiz: o.klavyesiz }, bag), rnd);
      let bc = bicimSec(it, bs.b, { id, t, zor: bs.zor }, rnd, sonBicim);
      // zor biçimi üst üste kuralına takıldıysa normal merdiven
      if (!bc && bs.zor) { bs = basamak(it, Object.assign({ id, t, klavyesiz: o.klavyesiz }, bag, { zorOk: false }), rnd); bc = bicimSec(it, bs.b, { id, t }, rnd, sonBicim); }
      if (!bc) return null;
      const x = { tur: 'm', id, kaynak, b: bs.b, bicim: bc.bicim, uretec: bc.uretec, yenidenTanit: bs.yenidenTanit, R: R(it.m, t) };
      // zor soru: sel.zor (sözleşme §1), bNormal = merdivenin vereceği basamak (log: zor)
      if (bs.zor) Object.assign(x, { zor: true, bNormal: bs.bNormal });
      return x;
    };
    // 1) oturum kuyruğu: yanlış (yeniden sorma), mini, ikinci; ilk gelen ilk çıkar
    const kuyrukSec = kq => {
      const it = S.items[kq.id] || {}, bc = kq.bicim ? { bicim: kq.bicim, uretec: null } : bicimSec(it, kq.b || 1, { id: kq.id, t }, rnd, []);
      return { tur: 'm', kaynak: 'kuyruk', neden: kq.neden, id: kq.id, b: kq.b || 1, bicim: bc.bicim, uretec: bc.uretec, deneme: kq.deneme || 1, R: R(it.m, t), _k: kq };
    };
    const kq = (o.kuyruk || []).filter(k => k.at <= adim && (!o.filtre || o.filtre(k.id))).sort((a, b) => a.at - b.at)[0];   // en erken sırası gelen
    if (kq) return kuyrukSec(kq);
    if (o.aksam) return aksamSec(S, o, t, rnd, kuyrukSec);
    const kt = kota(durum, t);
    const partiAc = () => {
      // §5.2: yarımlar kotaya sayılmaz; partide kotanın yanında en çok 1 (25'likte 2) yarım, günde en çok 3.
      // Bilinçli sapma: kota kısılmışken (göç / genç / birikme) günde 1 yarım ve o yarım kotadan bir yer alır
      // (yük kapısı §11: 7. gün vadeli ≤ 0,8 × başlangıç; ünite kelimesi yine her gün en az 1 gelir)
      const kis = kt.sebep !== 'normal', n = Math.min(kt.kalan, boy >= 25 ? 5 : 3), yh = durum.donus ? 0 : (boy >= 25 ? 2 : 1);
      if (n <= 0 && (yh <= 0 || kis)) return null;
      const p = yeniParti(S, t, n, { yarimHak: yh, yarimGunluk: kis ? 1 : YARIM_GUN, yarimKotadan: kis, filtre: o.filtre, yoklamaHak: o.klavyesiz ? 0 : Math.min(2 - (o.yoklama || 0), 4 - (gs.yoklama || 0)) });
      return p.ids.length ? { tur: 'parti', kaynak: 'parti', ids: p.ids, yoklama: p.yoklama } : null;
    };
    // 2) yeni parti: turda bir kez, 3 ≤ adım ≤ boy − 7
    if (!o.parti && adim >= 3 && adim <= boy - 7) { const p = partiAc(); if (p) return p; }
    // 2b) gramer sorusu (B1 sprinti, sözleşme S3): ana turda adım 5 ve 10 (sırası gelmiş kuyruk / parti önce gelirse en çok
    //     2 adım kayar: pencere 5–7, 10–12), pencere başına 1, turda en çok 2; o.gramVar === true ise (uygulama: Gramer.turSorusu bir soru verdi).
    //     Klavyesiz / akşam (yukarıda döndü) / momentum (art arda 2 yanlış) turunda yok; ısınma (adım < 3) zaten dışarıda.
    //     Odak bölümünde (o.odak; uygulama orada gramVar da vermez) yok. Gram cevabı tur adımına sayılır (oturumIsle), öğe hafızasına yazmaz.
    if (o.gramVar === true && !o.klavyesiz && !o.aksam && !o.odak && (o.yanlisSeri || 0) < 2) {
      // gi: sorulan gramlerin adımı (oturumIsle'nin kaydı; yoksa geçmişteki sırası)
      const gi = gecmis.reduce((a, x, i) => (x.tur === 'gram' ? a.concat(x.a != null ? x.a : i) : a), []), ga = GRAM_ADIM.find(a => adim >= a && adim <= a + 2);
      // her pencerede bir soru (o pencerenin başından beri gram yoksa); ilki kaçtıysa ikincisi yine gelir
      if (ga != null && gi.length < GRAM_ADIM.length && !gi.some(i => i >= ga)) return { tur: 'gram', kaynak: 'gram' };
    }
    const vad = vadeliler(S, t, o.filtre).filter(v => !yakin(v.id));
    const mVad = vad.filter(v => v.tur === 'm');
    // 3) metin etkinliği: turda bir, günde en çok 3; 8 ≤ adım ≤ boy − 3; boşluklar m.S ≥ 1,5 ve (vadeli ya da R < 0,9)
    if (!o.metin && !o.klavyesiz && adim >= 8 && adim <= boy - 3 && (gs.metin || 0) < 3) {
      const ad = Object.keys(S.items).filter(id => { const h = S.items[id].m; return h && h.S >= 1.5 && (h.due <= t || R(h, t) < 0.9) && !yakin(id) && C.kind(id) !== 'p' && (!o.filtre || o.filtre(id)); })
        .sort((a, b) => (S.items[b].m.due <= t) - (S.items[a].m.due <= t) || R(S.items[b].m, t) - R(S.items[a].m, t));   // vadeliler önce
      if (ad.length >= 2) return { tur: 'metin', kaynak: 'metin', adaylar: ad.slice(0, 8), diktat: !gs.diktat };
    }
    // 4) kurtarma: turda bir, adım ≥ 6; R < 0,6 ya da 3 gündür bekleyen vadeli öğelerden R'si en düşük, B1
    if (!o.kurtarma && adim >= 6) {
      const k = mVad.filter(v => v.R < 0.6 || t - v.due >= 3 * DAY).sort((a, b) => a.R - b.R)[0];
      if (k) { const x = m1(k.id, 'kurtarma', { kurtarma: true }); if (x) return x; }
    }
    // 5) ısınma (ilk 3) ve momentum (art arda 2 yanlış): R'si en yüksek vadeli öğe, bir basamak aşağıdan
    // 26.10: ısınma yalnız günün ilk turunda (günün ilk 3 cevabı); her turda olunca çok turlu günde onlarca soru seçmeliye düşüyordu (25.10: 12 turda 26)
    const gunN = (S.tage && S.tage[gun4(t)] && S.tage[gun4(t)].n) || 0, isinma = adim < 3 && gunN < 3;
    if (isinma || (o.yanlisSeri || 0) >= 2) {
      const kaynak = isinma ? 'isinma' : 'momentum';
      for (const v of mVad.slice().sort((a, b) => b.R - a.R)) { const x = m1(v.id, kaynak, { isinma, momentum: kaynak === 'momentum' }); if (x) return x; }
    }
    // 6) vadeli öğeler, R azalan; artikel flaşı turda ≤ 3 (der olmayan önce); kök turda 1, günde 4
    const artSay = gecmis.filter(x => x.tur === 'art').length, kokSay = gecmis.filter(x => x.tur === 'kok').length;
    // zor soru turda en çok ZOR_TUR (tur ezici olmasın); klavyesiz turda yok
    const zorOk = !o.klavyesiz && gecmis.filter(x => x.zor).length < ZOR_TUR;
    const derMi = id => ((C.byId[id] || {}).art || '') === 'der';
    const sirali = vad.slice().sort((a, b) => b.R - a.R);
    const artlar = sirali.filter(v => v.tur === 'art').sort((a, b) => (derMi(a.id) ? 1 : 0) - (derMi(b.id) ? 1 : 0) || b.R - a.R);
    // flaşlar art arda blok olmasın: son 2 soruda flaş varsa önce başka soru (başka aday yoksa yine flaş)
    const sonArt = gecmis.slice(-2).some(x => x.tur === 'art');
    let ilkAday = null, artYedek = null;
    for (const v of sirali) {
      if (v.tur === 'art') {
        if (artSay >= ART_TUR) continue;
        const a = artlar[0];
        if (sonArt) { artYedek = artYedek || a; continue; }
        return { tur: 'art', kaynak: 'vadeli', id: a.id, b: 0, bicim: 'artikel', R: a.R };
      }
      if (v.tur === 'kok') {
        if (o.klavyesiz || kokSay >= 1 || (gs.kok || 0) >= 4) continue;
        const k = S.kok[v.base];
        return { tur: 'kok', kaynak: 'vadeli', id: v.id, base: v.base, b: 0, bicim: k.S < 7 ? 'kokSatz' : 'kok', R: v.R };
      }
      const x = m1(v.id, 'vadeli', { zorOk });
      if (x) return x;
      ilkAday = ilkAday || v;
    }
    // biçim kuralı hiçbir adaya uymadıysa ilk aday kuralsız
    if (ilkAday) {
      const it = S.items[ilkAday.id], bs = basamak(it, { id: ilkAday.id, t, klavyesiz: o.klavyesiz }, rnd);
      const bc = bicimSec(it, bs.b, { id: ilkAday.id, t }, rnd, []);
      return { tur: 'm', kaynak: 'vadeli', id: ilkAday.id, b: bs.b, bicim: bc.bicim, uretec: bc.uretec, R: ilkAday.R };
    }
    if (artYedek) return { tur: 'art', kaynak: 'vadeli', id: artYedek.id, b: 0, bicim: 'artikel', R: artYedek.R };
    // 6b) yeni kök: günde en çok 2 (düzensiz fiil, formları görülmüş, m.S ≥ 2)
    if (!o.klavyesiz && kokSay < 1 && (gs.kok || 0) < 4 && (gs.kokYeni || 0) < 2) {
      const tanir = it => !!it && !(it.tanit && gun4(it.tanit) === gun4(t)) && (!!it.a1 || !!(it.m && it.m.S >= 2));
      const yk = Object.entries(S.kok || {}).find(([, k]) => !k.S && k.ornek && tanir(S.items[k.ornek]) && !yakin(k.ornek) && (!o.filtre || o.filtre(k.ornek)));
      if (yk) return { tur: 'kok', kaynak: 'yeniKok', id: yk[1].ornek, base: yk[0], b: 0, bicim: 'kokSatz', R: 0 };
    }
    // 7) vadeli yoksa: kota varsa parti (kota kalmışsa turun ikinci partisi de olabilir); kuyrukta bekleyen soru varsa
    //    sırasını beklemeden (son 2 sorudaki öğe hariç); yoksa tur biter (+3 yeni teklifi günde bir, birikme yoksa üç)
    //    (önceki partinin mini / ikinci soruları bitmeden yeni parti açılmaz: ikinci hatırlama tanıtımdan ≤ 6 soru sonra kalsın)
    //    Malzeme yokken (yalnız bekleyen kuyruk) son sorulan öğe dışındaki en erken kuyruk sorusu sırasını beklemeden gelir.
    const son1 = gecmis.length ? gecmis[gecmis.length - 1].id : null;
    const bekleyen = (o.kuyruk || []).filter(k => !o.filtre || o.filtre(k.id));
    if (!bekleyen.some(k => k.neden === 'ikinci' || k.neden === 'mini')) { const p = partiAc(); if (p) return p; }
    const bek = bekleyen.filter(k => k.id !== son1).sort((a, b) => a.at - b.at)[0];
    if (bek) return kuyrukSec(bek);
    { const p = partiAc(); if (p) return p; }
    // "+3 yeni" teklifi: günde bir; birikme sıfırsa (tekrarlar günü gününe) günde üç kez
    const teklifSay = +gs.ekYeniTeklif || 0, teklifHak = kt.birikme <= kt.kap / 4 ? 3 : 1;   // sayaç kabulde artar (ekYeniAl)
    return { tur: 'bitti', kaynak: 'bitti', teklif: teklifSay < teklifHak ? '+3' : null };
  }
  // cevaptan sonra oturumu ilerlet: adım, geçmiş, art arda yanlış, yeniden sorma kuyruğu (§4.4)
  function oturumIsle(o, secim, sonuc, rnd) {
    rnd = rnd || Math.random;
    o.kuyruk = o.kuyruk || []; o.gecmis = o.gecmis || [];
    const i = o.kuyruk.indexOf(secim._k); if (i >= 0) o.kuyruk.splice(i, 1);
    o.adim = (o.adim || 0) + 1;
    o.gecmis.push(Object.assign({ id: secim.id, bicim: secim.bicim, tur: secim.tur }, secim.zor ? { zor: true } : null, secim.tur === 'gram' ? { a: o.adim - 1 } : null));
    if (secim.kaynak === 'kurtarma') o.kurtarma = true;
    const yanlis = sonuc && sonuc.ergebnis === 'falsch';
    o.yanlisSeri = yanlis ? (o.yanlisSeri || 0) + 1 : 0;
    if (yanlis && secim.tur === 'm') {
      const d = secim.deneme || 1;
      if (d === 1) o.kuyruk.push({ id: secim.id, neden: 'yanlis', at: o.adim + 3 + Math.floor(rnd() * 3), yer: o.adim - 1, deneme: 2, b: Math.max(1, (secim.b || 1) - 1), bicim: secim.b > 1 ? null : 'sec' });
      else if (d === 2) o.kuyruk.push({ id: secim.id, neden: 'yanlis', at: Math.max(o.adim + 1, (o.boy || 12) - 1), yer: o.adim - 1, deneme: 3, b: 1, bicim: 'sec' });
    }
    return o;
  }
  // parti başladı: tanıtımlar (sayılmaz) art arda; mini sorular karışık sırayla hemen, ikinci hatırlama ≥ 4 soru sonra
  function partiBasladi(o, ids, rnd) {
    rnd = rnd || Math.random;
    o.parti = true; o.kuyruk = o.kuyruk || [];
    const a = o.adim || 0, karisik = ids.slice();
    for (let i = karisik.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [karisik[i], karisik[j]] = [karisik[j], karisik[i]]; }
    karisik.forEach(id => o.kuyruk.push({ id, neden: 'mini', at: a, b: 1, bicim: 'sec', deneme: 1 }));
    // ikinci hatırlama mini sorusuyla aynı sırada, ondan 4 soru sonra
    karisik.forEach((id, i) => o.kuyruk.push({ id, neden: 'ikinci', at: a + 4 + i, b: 2, bicim: o.klavyesiz ? 'sec' : 'yaz0', deneme: 1 }));
    return o;
  }

  // §4.3 yazım hoşgörüsü: lemma ≥ 5 ve lev 1 ya da ≥ 10 ve lev ≤ 2; umlaut farkı değil; yazılan sözlükte başka kelime değil
  const UML = s => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
  const ACIK = s => s.toLowerCase().replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/ss/g, 'ß');
  function yazimMi(yazilan, hedef) {
    const y = String(yazilan || '').trim().toLowerCase(), h = String(hedef || '').trim().toLowerCase();
    if (!y || y === h || ACIK(y) === ACIK(h)) return false;
    if (UML(y) === UML(h)) return false;
    if (C.LEX && C.LEX.has(y)) return false;
    const d = lev(y, h);
    return (h.length >= 5 && d === 1) || (h.length >= 10 && d <= 2);
  }

  // ================= Göç (§8) =================
  const PROD = new Set(['wort', 'prod', 'abr', 'nsatz', 'satz', 'refl', 'ndek']);
  const REK = new Set(['erk', 'bed']);
  const TUR_OFS = { erk: 0.5, bed: 0.5, art: 0.5, wort: 0, prod: 0, abr: 0, nsatz: 0, satz: 0, refl: 0, ndek: 0, stamm: 0, pak: 0, luecke: 0 };
  const gecerli = id => { const k = C.kind(id); return k === 'v' ? !!C.vById[id] : k === 'w' ? !!C.wById[id] : k === 'n' ? !!C.byId[id] : false; };
  const hafiza = (c, S_) => ({ S: S_ == null ? c.S : S_, D: c.D, last: c.last, reps: c.reps || 0, lapses: c.lapses || 0, lastG: c.lastG || 3 });
  // öğe başına idempotent: m'si olmayan her öğe kendi kartlarından kurulur (eski istemcinin birleştirmesine karşı kendini onarır)
  function goc(S, t, ret) {
    ret = ret || (S.einst && S.einst.ret) || 0.85;
    const K = S.karten || {}, kz = S.kontrol || {}, items = S.items = S.items || {};
    const kartlar = {};
    Object.keys(K).forEach(u => { const i = u.lastIndexOf(':'), id = u.slice(0, i); (kartlar[id] = kartlar[id] || []).push({ t: u.slice(i + 1), c: K[u] }); });
    const selbstSon = (id, c) => !!(c.selbst && kz[id] && c.last === kz[id]);
    const uretimHedef = (id, it) => C.kind(id) === 'v' || C.tierOf(id) <= 2 || it.quelle === 'unite' || !!it.a1;
    const vade = h => { h.due = h.last + Math.min(FSRS.intervalDays(h.S, ret), MAX_ARALIK) * DAY; return h; };
    const r = { oge: 0, m: 0, mProd: 0, mRek: 0, mRekIndirim: 0, mSelbst: 0, yarim: 0, art: 0, artSelbst: 0, kok: 0, kokS: 0, pak: 0, olu: 0 };
    if (!S.kartenV3 && Object.keys(K).length) S.kartenV3 = JSON.parse(JSON.stringify(K));   // dondurulmuş kopya (geri dönüş)
    Object.keys(items).forEach(id => {
      const it = items[id];
      if (!gecerli(id)) { r.olu++; return; }
      r.oge++;
      const ks = (kartlar[id] || []).filter(k => k.c && k.c.S);
      const a1 = a1Mi(it);
      // A1 düğmesiyle (bilerek m'siz) kurulan öğe yarım olmaz; buggy sürümün yazdığı yarım işareti de silinir
      if (a1 && it.yarim && !it.tanit && !(it.m && it.m.S)) delete it.yarim;
      // m'siz öğe kendi kartlarından kurulur; kartı olmayan öğe yalnız ilk göçte yarım olur (sonra bilerek m'siz kurulanlar
      // — A1, okurken eklenen, bugün tanıtılan — dokunulmaz)
      if (!(it.m && it.m.S) && !a1 && (ks.length || !S.goc4)) {
        const guv = k => !selbstSon(id, k.c);
        const son = l => l.sort((a, b) => b.c.last - a.c.last)[0];
        const p = son(ks.filter(k => PROD.has(k.t) && guv(k)));
        const q = son(ks.filter(k => REK.has(k.t) && guv(k)));
        const sb = son(ks.filter(k => (PROD.has(k.t) || REK.has(k.t)) && !guv(k)));
        let m = null;
        if (p) { const c = p.c; m = Object.assign(hafiza(c), { pk: c.lastG >= 2 ? ((c.reps || 0) - (c.lapses || 0) >= 2 ? 2 : 1) : 0 }); r.mProd++; }
        else if (q) { const c = q.c, ind = uretimHedef(id, it); m = Object.assign(hafiza(c, ind ? c.S * 0.5 : c.S), { pk: 0 }); if (ind) { m.D = Math.max(c.D, 5); r.mRekIndirim++; } r.mRek++; }
        else if (sb) { const c = sb.c; m = Object.assign(hafiza(c, Math.min(c.S, 2)), { pk: 0, dogrula: 1 }); r.mSelbst++; }
        if (m) { it.m = vade(m); delete it.yarim; } else { it.m = null; it.yarim = 1; }
        // kartenV3 = göçün tükettiği kartlar: sonradan (birleştirmeyle gelen öğede) kurulan m'nin kartları da eklenir,
        // v3Yetis onları ikinci kez uygulamasın (göç kuralları: üretim önce, "biliyorum" güvenilmez)
        if (S.kartenV3) ks.forEach(k => { const u = id + ':' + k.t, v = S.kartenV3[u]; if (!v || (v.last || 0) < k.c.last) S.kartenV3[u] = JSON.parse(JSON.stringify(k.c)); });
      }
      if (it.m && it.m.S) r.m++; else if (it.yarim) r.yarim++;
      const ak = K[id + ':art'];
      if (!it.art && C.kind(id) === 'n' && !C.plOnly(id) && ak && ak.S) {
        const s = selbstSon(id, ak);
        it.art = vade(hafiza(ak, s ? Math.min(ak.S, 2) : ak.S));
        if (s) r.artSelbst++;
      }
      if (it.art) r.art++;
      const st = K[id + ':stamm'];
      if (st && C.kind(id) === 'v') {
        const bs = C.base(id), kk = S.kok = S.kok || {};
        if (!kk[bs] || (!kk[bs].S && st.S)) kk[bs] = st.S ? Object.assign(vade(hafiza(st)), { ornek: id }) : { ornek: id, yeni: 1 };
        (S.formGesehen = S.formGesehen || {})[id] = true;
      }
    });
    Object.keys(K).filter(u => u.endsWith(':pak')).forEach(u => {
      const pid = u.slice(0, -4), c = K[u], pk = S.pakete = S.pakete || {};
      if (!c.S) return;
      pk[pid] = pk[pid] || {};
      if (!pk[pid].m) { pk[pid].m = vade(hafiza(c)); r.pak++; }
    });
    r.kok = Object.keys(S.kok || {}).length; r.kokS = Object.values(S.kok || {}).filter(k => k.S).length;
    r.vadeli = Object.values(items).filter(it => (it.m && it.m.S && it.m.due <= t) || (it.art && it.art.S && it.art.due <= t)).length;
    r.ret = ret;
    tageGoc(S);
    if (!S.goc4) S.goc4 = { zaman: t, rapor: r, v3Yedek: false };
    S.surum = Math.max(S.surum || 0, 4);
    return r;
  }
  // gün sayaçları (M6): tageC'si olmayan gün (v3'ün ya da eski istemcinin saydığı) tageC[gün].v3 olur; toplamlar korunur.
  // xpToplam türetilir (Σ tage.xp + xpTaban); günlere dağılmamış eski puan bir kez xpTaban'a yazılır
  function tageGoc(S) {
    const tg = S.tage = S.tage || {}, tc = S.tageC = S.tageC || {};
    Object.keys(tg).forEach(g => { if (!tc[g] && tg[g]) tc[g] = { v3: JSON.parse(JSON.stringify(tg[g])) }; });
    if (S.xpTaban == null) S.xpTaban = Math.max(0, (S.xpToplam || 0) - Object.values(tg).reduce((a, x) => a + ((x && x.xp) || 0), 0));
    tageTuret(S);
  }
  // G-Counter: her cihaz yalnız kendi sayacını artırır; gün toplamı = cihazların toplamı (alan alan, modi dahil).
  // tage[g] hiçbir alanda düşmez (göç günü eski istemcinin tage'e doğrudan yazdıkları silinmez)
  function gunEkle(top, v) {
    Object.entries(v || {}).forEach(([k, x]) => {
      if (typeof x === 'number' && Number.isFinite(x)) top[k] = (top[k] || 0) + x;
      else if (k === 'modi' && x && typeof x === 'object') { top.modi = top.modi || {}; Object.entries(x).forEach(([m, o]) => { top.modi[m] = top.modi[m] || {}; gunEkle(top.modi[m], o); }); }
    });
    return top;
  }
  function gunMax(a, b) {
    const x = Object.assign({}, a || {});
    Object.entries(b || {}).forEach(([k, v]) => {
      if (typeof v === 'number') x[k] = Math.max(typeof x[k] === 'number' ? x[k] : 0, v);
      else if (k === 'modi' && v && typeof v === 'object') { x.modi = Object.assign({}, x.modi); Object.entries(v).forEach(([m, o]) => { x.modi[m] = gunMax(x.modi[m], o); }); }
      else if (x[k] === undefined) x[k] = v;
    });
    return x;
  }
  function tageTuret(S, g) {
    const tg = S.tage = S.tage || {}, tc = S.tageC || {};
    (g ? [g] : Object.keys(tc)).forEach(d => {
      if (!tc[d]) return;
      const top = {};
      Object.values(tc[d]).forEach(v => gunEkle(top, v));
      tg[d] = gunMax(tg[d], top);
    });
    S.xpToplam = Object.values(tg).reduce((a, x) => a + ((x && x.xp) || 0), 0) + (S.xpTaban || 0);
    return g ? tg[g] : tg;
  }
  // eski istemcinin (v3) yazdığı ve göçün görmediği kart cevaplarını hafızaya uygular (zaman sırasıyla, kartın notu + tür ofseti).
  // Süzgeç kart başına: kartenV3'te (göçün tükettiği kartlar) olmayan ya da ondan yeni cevap. goc4.zaman'a bakılmaz: göçten ÖNCE
  // başka cihazda verilip bu cihazın göç anında henüz çekmediği cevaplar da uygulanır (hedefin last'ından yeniyse).
  // Gölge kart (g4 === last) iki kez sayılmaz; ama hedefi kartınkinden eskiyse (eski istemcinin yerel-kazanır birleştirmesi
  // bayat m / kok / pakete yazdı) hedef kartın değerlerinden onarılır. Döner: uygulanan + onarılan sayısı
  const HAF = ['S', 'D', 'last', 'due', 'reps', 'lapses', 'lastG'];
  function v3Yetis(S, t) {
    if (!S.goc4 || !S.karten) return 0;
    const ret = (S.einst && S.einst.ret) || 0.85, V3 = S.kartenV3;
    const gorulmedi = (u, c) => !V3 || !V3[u] || c.last > (V3[u].last || 0);
    const l = Object.entries(S.karten).filter(([u, c]) => c && c.S && !c.selbst && gorulmedi(u, c)).sort((a, b) => a[1].last - b[1].last);
    let n = 0;
    l.forEach(([u, c]) => {
      const i = u.lastIndexOf(':'), id = u.slice(0, i), tur = u.slice(i + 1), g = c.lastG || 3, ofs = TUR_OFS[tur] || 0;
      // hedef: { al: () => hafıza, koy: h => yaz, pk }
      let al, koy, pkSay = false;
      if (tur === 'pak') {
        const p = (S.pakete || {})[id]; if (!p) return;
        al = () => p.m; koy = h => { p.m = h; };
      } else if (tur === 'stamm') {
        if (C.kind(id) !== 'v') return;
        const bs = C.base(id), kk = S.kok = S.kok || {};
        al = () => (kk[bs] && kk[bs].S ? kk[bs] : null);
        koy = h => { kk[bs] = Object.assign({}, kk[bs] || {}, h, { ornek: (kk[bs] && kk[bs].ornek) || id }); delete kk[bs].yeni; };
      } else {
        const it = S.items[id]; if (!it) return;
        const anah = tur === 'art' ? 'art' : 'm';
        if (anah === 'm' && !PROD.has(tur) && !REK.has(tur)) return;
        al = () => (it[anah] && it[anah].S ? it[anah] : null);
        koy = h => { it[anah] = h; if (anah === 'm') { delete it.yarim; delete it.m.dogrula; } };
        pkSay = anah === 'm' && PROD.has(tur) && g >= 3;
      }
      const h = al();
      if (h && c.last <= h.last) return;
      if (c.g4 != null && c.g4 === c.last) {
        // gölge kart: aynı cevap zaten bir hafızaya yazılmıştı; hedef bayatsa kartın değerleriyle onar
        const x = Object.assign({}, h || {});
        HAF.forEach(k => { if (c[k] !== undefined) x[k] = c[k]; });
        koy(x); n++;
        return;
      }
      if (c.g4 != null && c.last < c.g4) return;
      koy(guncelle(h, g, c.last, ret, ofs, { pkSay, kapisiz: tur === 'art' }));
      n++;
    });
    return n;
  }
  // gölge yazım (göçten sonra 30 gün): hafıza güncellemesi sorulan biçimin eski kartına da yazılır (v3'e dönüş veri kaybetmesin)
  const ESKI = { n: { sec: 'erk', anla: 'erk', metinde: 'erk', yaz0: 'wort', yaz: 'wort', yoklama: 'wort', bos0: 'nsatz', bos: 'nsatz', cumle: 'nsatz', metin: 'nsatz' },
    v: { sec: 'bed', anla: 'bed', metinde: 'bed', yaz0: 'abr', yaz: 'abr', yoklama: 'abr', bos0: 'satz', bos: 'satz', cumle: 'satz', metin: 'satz' },
    w: { sec: 'erk', anla: 'erk', metinde: 'erk', yaz0: 'prod', yaz: 'prod', yoklama: 'prod', bos0: 'nsatz', bos: 'nsatz', cumle: 'nsatz', metin: 'nsatz' } };
  function eskiTur(id, bicim, uretec) {
    if (bicim === 'artikel') return 'art';
    if (bicim === 'kok' || bicim === 'kokSatz' || bicim === 'kokSec') return 'stamm';
    if (uretec === 'ndek' || uretec === 'refl') return uretec;
    return (ESKI[C.kind(id)] || ESKI.w)[bicim] || null;
  }
  function golge(S, id, tur, h, t) {
    if (!S.karten || !h || !h.S || !tur) return false;
    if (S.goc4 && t - S.goc4.zaman > 30 * DAY) return false;
    const u = (tur === 'stamm' && h.ornek ? h.ornek : id) + ':' + tur;
    S.karten[u] = Object.assign({}, S.karten[u] || {}, { S: h.S, D: h.D, last: h.last, due: h.due, lastG: h.lastG, reps: h.reps, lapses: h.lapses, g4: h.last });
    ['neu', 'lern', 'urspr', 'selbst', 'kredi', 'dogrula'].forEach(k => delete S.karten[u][k]);
    return true;
  }

  // ================= Senkron =================
  // uzaktaki kayıt bu koddan yeni şemadaysa dokunma; yerel neredeyse boşsa (yeni cihaz) yalnız birleştir, yazma
  function yazabilir(lok, uz, kodSurum) {
    if (!uz) return { birlestir: false, yaz: true, sebep: 'ok' };
    if ((uz.surum || 0) > kodSurum) return { birlestir: false, yaz: false, sebep: 'yeni-sema' };
    // benzer benzerle: uzak v4 ise m'li öğe sayısı, uzak v3 ise kart sayısı (yerel v4 de karten'i korur)
    const v4 = kodSurum >= 4 && (uz.surum || 0) >= 4;
    const say = s => v4 ? Object.values((s && s.items) || {}).filter(it => it && it.m && it.m.S).length : Object.keys((s && s.karten) || {}).length;
    if (say(lok) < say(uz) / 2) return { birlestir: true, yaz: false, sebep: 'bos-yerel' };
    return { birlestir: true, yaz: true, sebep: 'ok' };
  }
  const sonra = (a, b) => (!a ? b : !b ? a : ((a.last || 0) >= (b.last || 0) ? a : b));
  // alan alan birleştirme; app.js zustandBirlestir'in (v3) bütün alanlarını kapsar, üstüne v5 alanları (m/art/kok/pakete.m/tageC):
  // hafızalarda last'ı büyük olan; tage gün başına en büyük (yerelde olmayan uzak gün korunur); unite idx/done birleşim;
  // xpToplam / seri.rekor / oyun.rekor en büyük; fehlTage birleşim, leech VEYA, seit en küçük; tageC cihaz başına (G-Counter),
  // tage[g] yalnız cihaz toplamı daha büyükse değişir (göç günü eski istemcinin saydığı cevaplar silinmez). normalize çağıran yapar.
  const SADE = ['kontext', 'iz', 'formGesehen', 'gelesen', 'kalipFav', 'aktSaetze', 'aktTexte', 'fiilMetin', 'kontrol'];
  const TOP_ALAN = ['n', 'richtig', 'fast', 'falsch', 'xp'];
  function birlestir(lok, uz) {
    if (!uz || typeof uz !== 'object') return lok;
    lok = lok || {};
    const m = Object.assign({}, uz, lok);
    const her = (k, f) => {
      if (lok[k] === undefined && uz[k] === undefined) return;
      const o = Object.assign({}, uz[k] || {});
      Object.entries(lok[k] || {}).forEach(([x, v]) => { o[x] = o[x] === undefined ? v : f(v, o[x]); });
      m[k] = o;
    };
    her('karten', sonra);
    her('items', (a, b) => {
      const x = Object.assign({}, b, a);
      x.m = sonra(a.m, b.m); x.art = sonra(a.art, b.art);
      if (!x.m) x.m = a.m === undefined ? b.m : a.m;
      if (x.m && x.m.S) delete x.yarim;
      x.fehlTage = [...new Set([...(b.fehlTage || []), ...(a.fehlTage || [])])].sort();
      if (a.leech || b.leech) x.leech = true;
      if (a.seit || b.seit) x.seit = Math.min(a.seit || Infinity, b.seit || Infinity);
      ['m', 'art'].forEach(k => { if (x[k] === undefined) delete x[k]; });
      return x;
    });
    her('kok', (a, b) => Object.assign({}, b, a, sonra(a.S ? a : null, b.S ? b : null) || {}));
    her('pakete', (a, b) => { const x = Object.assign({}, b, a); const h = sonra(a.m, b.m); if (h) x.m = h; return x; });
    her('tage', (a, b) => ((a.n || 0) >= (b.n || 0) ? a : b));
    her('unite', (a, b) => Object.assign({}, b, a, { idx: Object.assign({}, b.idx, a.idx), done: Object.assign({}, b.done, a.done) }));
    SADE.forEach(k => her(k, a => a));
    if (lok.xpToplam !== undefined || uz.xpToplam !== undefined) m.xpToplam = Math.max(lok.xpToplam || 0, uz.xpToplam || 0);
    if (uz.seri || lok.seri) {
      const a = lok.seri || {}, b = uz.seri || {};
      m.seri = Object.assign({}, b, a, { rekor: Math.max(a.rekor || 0, b.rekor || 0), donmus: Object.assign({}, b.donmus, a.donmus) });
    }
    if (uz.oyun || lok.oyun) m.oyun = Object.assign({}, uz.oyun, lok.oyun, { rekor: Math.max((lok.oyun || {}).rekor || 0, (uz.oyun || {}).rekor || 0) });
    // ayarlar: yerelde ilerleme varsa yerelinki (yeni cihazın varsayılanları uzaktakini ezmesin)
    const dolu = s => Object.keys((s && s.karten) || {}).length || Object.values((s && s.items) || {}).some(it => it && it.m && it.m.S);
    if (lok.einst || uz.einst) m.einst = lok.einst && dolu(lok) ? lok.einst : (uz.einst || lok.einst);
    if (lok.ayar4 || uz.ayar4) {
      const a = lok.ayar4 || {}, b = uz.ayar4 || {};
      m.ayar4 = Object.assign({}, lok.ayar4 && dolu(lok) ? Object.assign({}, b, a) : Object.assign({}, a, b), { gosterildi: Object.assign({}, b.gosterildi, a.gosterildi) });
    }
    if (lok.xpTaban != null || uz.xpTaban != null) m.xpTaban = Math.max(lok.xpTaban || 0, uz.xpTaban || 0);
    if (lok.tageC || uz.tageC) {
      // cihaz başına, alan başına en büyük (her cihaz yalnız kendi sayacını artırır)
      const tc = {};
      [uz.tageC || {}, lok.tageC || {}].forEach(src => Object.entries(src).forEach(([g, cs]) => Object.entries(cs || {}).forEach(([cih, v]) => {
        tc[g] = tc[g] || {};
        tc[g][cih] = gunMax(tc[g][cih], v);
      })));
      m.tageC = tc;
      m.tage = Object.assign({}, m.tage || {});
      tageTuret(m);
    }
    m.surum = Math.max(lok.surum || 0, uz.surum || 0) || undefined;
    if (m.surum === undefined) delete m.surum;
    if (lok.goc4 || uz.goc4) {
      const a = lok.goc4, b = uz.goc4;
      m.goc4 = !a ? b : !b ? a : Object.assign({}, a.zaman <= b.zaman ? a : b, { v3Yedek: !!(a.v3Yedek || b.v3Yedek) });
    }
    m.log = lok.log; m.pending = lok.pending; m.ghPending = lok.ghPending;
    ['log', 'pending', 'ghPending'].forEach(k => { if (m[k] === undefined) delete m[k]; });
    return m;
  }

  // ================= Toparlanma tahmini (§5.6) =================
  // sim5 mantığı: günde kap cevap, üretimde gerçek başarı modelden δ = −0,4 logit düşük; 3 tohum, medyan.
  // Döner: günün başındaki vadeli öğe sayısının ≤ esik'e indiği ilk gün (0 = bugün), ya da null (3 haftadan uzun).
  // esik: bitiş çizgisi (cevap); farklı tur sayılarını karşılaştırırken hepsinde AYNI olmalı (varsayılan 0,75·kap)
  function tohum(seed) { let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
  function tahmin(durum, kap, t, esik) {
    if (!(esik > 0)) esik = 0.75 * kap;
    const S = durum.S, ret = (S.einst && S.einst.ret) || 0.85, delta = -0.4, GUN = 21;
    const tek = seed => {
      const rnd = tohum(seed);
      const A = Object.entries(S.items || {}).filter(([id]) => C.kind(id) !== 'p').map(([id, it]) => {
        let t3 = false; try { t3 = C.kind(id) !== 'v' && C.tierOf(id) === 3 && !C.uniteKonu(id); } catch (e) { /* bilinmeyen öğe */ }
        return { id, t3, m: it.m && it.m.S ? Object.assign({}, it.m) : null, a: it.art && it.art.S ? Object.assign({}, it.art) : null };
      });
      const bas = (h, r) => { let b = h.S < 2 ? 1 : h.S < 7 ? 2 : h.S < 21 ? 3 : 4; const pk = h.pk || 0; if (pk === 0) b = Math.min(b, 2); else if (pk === 1) b = Math.min(b, 3); if (r < 0.5) b = 1; if (b >= 3 && rnd() < 0.2) b--; return b; };
      let q0 = kota(Object.assign({}, durum, { donus: false }), t).q;
      for (let d = 0; d < GUN; d++) {
        const t0 = t + d * DAY;
        const vad = A.filter(x => (x.m && x.m.due <= t0) || (x.a && x.a.due <= t0));
        if (vad.length <= esik) return d;
        let butce = kap;
        // yeni kelime: tanıtım + mini + ikinci ≈ 2 cevap (ilk 3 gün göç kotası)
        const q = d < 3 ? Math.min(q0, 2) : q0;
        for (let i = 0; i < q && butce > 2; i++) { const ok = rnd() < 0.9; A.push({ id: 'y' + d + i, t3: false, m: Object.assign(FSRS.review({}, ok ? 3 : 1, t0, ret), { pk: 0, due: ertesiGun4(t0) }), a: null }); butce -= ok ? 2 : 3; }
        const sira = vad.map(x => ({ x, r: x.m && x.m.due <= t0 ? R(x.m, t0) : R(x.a, t0) })).sort((a, b) => b.r - a.r);
        for (const { x } of sira) {
          if (butce <= 0) break;
          const tt = t0 + 60000;
          if (x.m && x.m.due <= t0) {
            let b = bas(x.m, R(x.m, tt)); if (x.t3) b = Math.min(b, 3);
            const bic = b === 1 ? 'sec' : b === 2 ? (x.m.S < 4 ? 'yaz0' : 'yaz') : b === 3 ? (x.m.S < 10 ? 'bos0' : 'bos') : 'cumle';
            const dd = b === 1 ? 0.5 : bic.endsWith('0') ? delta + 0.2 : delta;
            const ok = rnd() < sig(logit(kirp(R(x.m, tt), 0.01, 0.99)) + dd);
            x.m = guncelle(x.m, ok ? 3 : 1, tt, ret, OFS[bic], { pkSay: ok && PK_BICIM.has(bic) });
            butce -= ok ? 1 : 2;
            if (x.a && x.a.due <= t0 && ok && b <= 2) { const okA = rnd() < sig(logit(kirp(R(x.a, tt), 0.01, 0.99)) - 0.2); x.a = guncelle(x.a, okA ? 3 : 1, tt, ret, OFS.artikel, { kapisiz: true }); }
          } else {
            const okA = rnd() < sig(logit(kirp(R(x.a, tt), 0.01, 0.99)) - 0.2);
            x.a = guncelle(x.a, okA ? 3 : 1, tt, ret, OFS.artikel, { kapisiz: true });
            butce -= okA ? 1 : 2;
          }
        }
      }
      return null;
    };
    const r = [1, 2, 3].map(tek).map(x => x == null ? Infinity : x).sort((a, b) => a - b)[1];
    return r === Infinity ? null : r;
  }

  const api = { aralikKisalt, MAX_ARALIK, BM_ARALIK, ustBasamak, zorHedef, dsOf, ZOR_DS, ZOR_TUR, ZOR_YAVAS,
    init, get ctx() { return C; },
    DAY, OFS, KISMI, PK_BICIM, ARA, GRAM_ADIM,
    gun4, gunBas4, ertesiGun4, R, wRet, lev, tohum,
    guncelle, notVer, uygula, seviye, basamak, bicimSec,
    vadeliler, kota, donusMu, yeniSira, karismaOk, yeniParti, sec, oturumIsle, partiBasladi, yazimMi,
    AKSAM, ilkCevap, aksamAdaylar, aksamUygun, aksamHakki,
    goc, tageGoc, tageTuret, v3Yetis, eskiTur, golge, yazabilir, birlestir, tahmin,
  };
  return api;
});
