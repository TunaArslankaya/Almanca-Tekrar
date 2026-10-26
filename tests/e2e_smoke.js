// Tarayıcı duman testi (Playwright gerekir): node tests/e2e_smoke.js
// v5 akışı: mobil 390×844 ve masaüstü 1280×860; boş durumda gün 1 + ertesi gün; gerçek durumun KOPYASI (log/zustand.json yalnız okunur).
// Denetlenenler: kontrol / pretest satırı yok; tur 12 sayılan cevapta biter; gerçek kopyada turun ilk 3 cevabı vadeli (ısınma);
// tanıtımdan hemen sonra mini soru, ≤ 6 cevap sonra ikinci hatırlama; her tekrar satırında basamak / bicim / not / R / S;
// hafıza başına günde ≤ 1 kalıcı yazım (sonrakiler hafıza:yazılmadı); aynı öğe turda ≥ 8 soru arayla; DOM'da data-note yok,
// itiraz soru başına en çok bir; karten yalnız gölge yazımla değişir (g4 === last); her bölüm starte + 3 adım; sayfa hatası 0.
const D = require('./surucu');
const fs = require('fs');
const path = require('path');

const CEVAP_MODUS = new Set(['erk', 'bed', 'wort', 'abr', 'prod', 'nsatz', 'satz', 'ndek', 'refl', 'luecke', 'art', 'stamm']);
const ZORUNLU = ['basamak:', 'bicim:', 'not:', 'R:', 'S:'];
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const fehler = [];
const hata = (ad, m) => fehler.push(`[${ad}] ${m}`);

// log denetimi (bir sayfanın bütün satırları)
function logDenetle(ad, log, o) {
  o = o || {};
  const n = m => log.filter(e => e.modus === m).length;
  if (n('kontrol') || n('pretest')) hata(ad, `kontrol ${n('kontrol')} / pretest ${n('pretest')} satırı (0 olmalı)`);
  const turlar = log.filter(e => e.modus === 'tur');
  turlar.forEach(e => { const c = +(/cevap:(\d+)/.exec(e.notiz) || [])[1]; if (e.ergebnis === 'bitti' && (c < 12 || c > 15) && !o.boy) hata(ad, `tur satırı cevap:${c} (12, yeniden sorulacak yanlış kaldıysa en çok 15 olmalı)`); if (!/yeni:\d+ \| seviye\+:\d+ \| tekrar:\d+/.test(e.notiz)) hata(ad, 'tur satırında yeni / seviye+ / tekrar yok'); });
  // boş durumda ilk gün 6 yeni kelime ~12 cevap eder: tur kelimeler bitince "şimdilik bu kadar" (leer) kapanabilir; en az 10 cevaplık tur yeter
  const cevapSay = e => +((/cevap:(\d+)/.exec(e.notiz || '') || [])[1] || 0);
  if (!turlar.some(e => e.ergebnis === 'bitti' || (e.ergebnis === 'leer' && cevapSay(e) >= 10))) hata(ad, 'hiç tur bitmedi');
  const cevap = log.filter(e => CEVAP_MODUS.has(e.modus) && /basamak:/.test(e.notiz || ''));
  log.filter(e => CEVAP_MODUS.has(e.modus) && e.modus !== 'luecke' || (e.modus === 'luecke' && /bicim:/.test(e.notiz || ''))).forEach(e => {
    const eksik = ZORUNLU.filter(z => !(e.notiz || '').includes(z));
    if (eksik.length) hata(ad, `tekrar satırında eksik ${eksik.join(' ')}: ${e.modus};${e.id};${e.notiz}`);
  });
  // hafıza başına günde ≤ 1 kalıcı yazım
  const yazim = {};
  cevap.forEach(e => {
    const g = e.zeit.slice(0, 10), oge = e.id.split(':')[0], not = (/not:([^ |]+)/.exec(e.notiz) || [])[1] || '-';
    if (not === '-') return;
    not.split(',').forEach(x => { const k = g + '|' + oge + '|' + x[0]; yazim[k] = (yazim[k] || 0) + 1; if (yazim[k] > 1) hata(ad, `günde ikinci kalıcı yazım: ${k}`); });
  });
  // turlara böl: tanıtım → mini (hemen) → ikinci (≤ 6 cevap); aynı öğe ≥ 8 soru arayla (kuyruk soruları hariç)
  let tur = [];
  const turlarSatir = [];
  log.forEach(e => { if (e.modus === 'tur') { turlarSatir.push(tur); tur = []; } else tur.push(e); });
  turlarSatir.push(tur);
  let tanit = 0, mini = 0, ikinci = 0;
  turlarSatir.forEach(T => {
    const cv = [];   // [satır, cevap sırası]
    T.forEach(e => { if (CEVAP_MODUS.has(e.modus) && /basamak:/.test(e.notiz || '')) cv.push(e); });
    T.forEach((e, i) => {
      if (!(e.modus === 'yeni' && e.ergebnis === 'neu')) return;
      tanit++;
      const sonraki = T.slice(i + 1).filter(x => CEVAP_MODUS.has(x.modus) && /basamak:/.test(x.notiz || ''));
      const blok = T.slice(i + 1).findIndex(x => !(x.modus === 'yeni'));
      const ilk = sonraki[0];
      if (ilk && !/ parti/.test(' ' + ilk.notiz) && blok === 0) hata(ad, `tanıtımdan sonraki ilk cevap mini değil: ${e.id} → ${ilk.id} ${ilk.notiz}`);
      const mi = sonraki.findIndex(x => x.id.startsWith(e.id + ':') && /\| parti/.test(x.notiz));
      if (mi >= 0) { mini++; if (mi > 3) hata(ad, `mini ${mi} cevap sonra: ${e.id}`); }
      const ii = sonraki.findIndex(x => x.id.startsWith(e.id + ':') && /\| ikinci/.test(x.notiz));
      // parti n öğe: son öğenin ikincisi mini'sinden 4 soru sonra = tanıtımdan 3 + n cevap sonra (yanlış tekrarı araya girebilir: +1)
      let n = 1; for (let k = i + 1; k < T.length && T[k].modus === 'yeni'; k++) n++; for (let k = i - 1; k >= 0 && T[k].modus === 'yeni'; k--) n++;
      // araya giren yanlış tekrarları (tekrar:) sıraya göre ikinciden önce gelebilir: her biri +1
      const araTekrar = ii > 0 ? sonraki.slice(0, ii).filter(x => /\| tekrar:/.test(x.notiz || '')).length : 0;
      if (ii >= 0) { ikinci++; if (ii > Math.max(6, 4 + n) + araTekrar) hata(ad, `ikinci hatırlama ${ii} cevap sonra (parti ${n}, ara tekrar ${araTekrar}): ${e.id}`); if (!/hafıza:yazılmadı/.test(sonraki[ii].notiz)) hata(ad, `ikinci hatırlama hafızaya yazdı: ${sonraki[ii].id}`); }
    });
    const son = {};
    cv.forEach((e, k) => {
      const oge = e.id.split(':')[0];
      const kuyruk = /\| (parti|ikinci|tekrar:)/.test(e.notiz) || e.modus === 'luecke';
      // çekirdek son 7 soruya bakar (ARA 8); metin etkinliğinin boşlukları log'da ayrı satır, geçmişte tek giriş: sayım 1 oynayabilir → 7 kabul
      if (!kuyruk && son[oge] != null && k - son[oge] < 7) hata(ad, `aynı öğe ${k - son[oge]} soru arayla: ${oge}`);
      son[oge] = k;
    });
  });
  // aynı gün aynı hafızaya ikinci cevap: yazılmaz (hafıza:yazılmadı ya da not:-); yukarıdaki yazım sayımı hafıza başına denetler
  const ikinciCevap = cevap.filter(e => /\| (ikinci|tekrar:)/.test(e.notiz));
  ikinciCevap.forEach(e => { if (/\| ikinci/.test(e.notiz) && !/hafıza:yazılmadı/.test(e.notiz)) hata(ad, `ikinci hatırlamada hafıza:yazılmadı yok: ${e.id}`); });
  // (aynı gün ikinci cevabın hafızaya yazılmadığını yukarıdaki yazım sayımı hafıza başına denetler: yanlış anlamdan sonraki doğru
  //  tekrar o gün ilk kez artikel hafızasına yazabilir, not:a3 meşrudur)
  return { cevap: cevap.length, tanit, mini, ikinci, tur: turlar.length };
}

async function turlar(p, n, ad, o) {
  o = o || {};
  const adlar = [];
  let bitti = 0, guard = 0, itirazHata = 0;
  await p.evaluate(m => window.__tekrar.starte(m), o.mod || 'akis');
  await p.waitForTimeout(120);
  while (bitti < n && guard++ < 70 * n) {
    const s0 = await D.durum(p);
    const r = await D.adim(p, { dogru: o.dogru == null ? 0.8 : o.dogru, rnd, itiraz: true, yakin: rnd() < 0.3 });
    adlar.push(r.ad + (r.s && r.s.neden ? ':' + r.s.neden : r.s && r.s.kaynak ? ':' + r.s.kaynak : ''));
    const dom = await p.evaluate(() => ({ note: document.querySelectorAll('[data-note]').length, itiraz: document.querySelectorAll('[data-act="itiraz"]').length }));
    if (dom.note) hata(ad, 'DOM\'da data-note düğmesi var');
    if (dom.itiraz > 1) itirazHata++;
    if (r.ad === 'turSonu') { bitti++; if (s0.sebep === 'leer' && !s0.leerTeklif) break; }
    if (r.ad === 'leer' || r.ad === 'yok' || /^bilinmeyen/.test(r.ad)) break;
  }
  if (itirazHata) hata(ad, 'itiraz düğmesi birden çok');
  return adlar;
}

async function senaryo(b, ad, o) {
  const p = await D.sayfa(b, o);
  const karten0 = await p.evaluate(() => JSON.stringify(window.__tekrar.S.karten));
  const adlar1 = await turlar(p, o.tur1 || 2, ad);
  // karten yalnız gölge yazımla değişir
  const g = await p.evaluate(k0 => {
    const k = JSON.parse(k0), S = window.__tekrar.S, kotu = [];
    Object.keys(S.karten).forEach(u => { const a = JSON.stringify(k[u] || null), c = S.karten[u]; if (a !== JSON.stringify(c) && c.g4 !== c.last) kotu.push(u); });
    return kotu;
  }, karten0);
  if (g.length) hata(ad, `gölge dışı değişen kart: ${g.slice(0, 5).join(', ')}`);
  let adlar2 = [];
  if (o.ertesiGun) {
    await D.ileri(p, D.DAY); await p.reload(); await p.waitForTimeout(300);
    adlar2 = await turlar(p, 1, ad + ' gün 2');
  }
  const log = await p.evaluate(() => window.__tekrar.S.log);
  const sonuc = logDenetle(ad, log, o);
  if (o.gercek) {
    // gerçek kopya: ilk turun ilk 3 cevabı vadeli öğe (ısınma)
    const cv = log.filter(e => CEVAP_MODUS.has(e.modus) && /basamak:/.test(e.notiz || '')).slice(0, 3);
    cv.forEach(e => { if (!/ısınma/.test(e.notiz)) hata(ad, `ilk 3 cevap ısınma değil: ${e.id} ${e.notiz}`); });
    const goc = log.filter(e => e.modus === 'akt' && e.id === 'goc4');
    if (goc.length !== 1) hata(ad, `akt;goc4 satırı ${goc.length} (tam bir olmalı)`);
    sonuc.goc = goc[0] && goc[0].notiz;
  }
  const kayit = await p.evaluate(() => ({ ana: (JSON.parse(localStorage.getItem('almanca-tekrar-v1')).log || []).length, ayri: (JSON.parse(localStorage.getItem('almanca-tekrar-log') || '[]')).length,
    tageC: Object.keys(window.__tekrar.S.tageC || {}).length, gt: Object.keys(window.__tekrar.S.tageC).map(g => [g, window.__tekrar.S.tage[g].n, Object.values(window.__tekrar.S.tageC[g]).reduce((a, x) => a + (x.n || 0), 0)]) }));
  if (kayit.ana) hata(ad, `ana anahtarda ${kayit.ana} log satırı`);
  if (!kayit.tageC) hata(ad, 'cihaz sayacı (tageC) yok');
  kayit.gt.forEach(([g, t, c]) => { if (t !== c && !o.gercek) hata(ad, `${g}: tage.n ${t} ≠ cihaz toplamı ${c}`); });
  if (p.hatalar.length) hata(ad, 'sayfa hataları: ' + p.hatalar.join(' | '));
  console.log(`${ad.padEnd(22)} cevap ${sonuc.cevap} · tanıtım ${sonuc.tanit} · mini ${sonuc.mini} · ikinci ${sonuc.ikinci} · tur ${sonuc.tur}${sonuc.goc ? ' · göç: ' + sonuc.goc : ''}`);
  console.log('   adımlar:', adlar1.concat(['|'], adlar2).join(' '));
  return p;
}

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok, atlandı.'); process.exit(0); }
  const Z = D.zustandV3();   // gerçek kopya = dondurulmuş v3 kaydı (göç satırı, güven kartı)
  await senaryo(b, 'boş · masaüstü', { mobil: false, ertesiGun: true, tur1: 2 });
  await senaryo(b, 'boş · mobil', { mobil: true, ertesiGun: true, tur1: 2 });
  if (Z) {
    const p = await senaryo(b, 'gerçek kopya · masaüstü', { mobil: false, zustand: Z, gercek: true, tur1: 2 });
    // Ayarlar'da kod sürümü (Diğer → Ayarlar)
    await p.evaluate(() => { document.querySelector('nav.tabs [data-v="diger"]').click(); document.querySelector('#diger [data-v="ayar"]').click(); });
    await p.waitForTimeout(150);
    const surum = await p.evaluate(() => (document.querySelector('#a-surum') || {}).textContent || '');
    if (!/Kod sürümü 4/.test(surum)) hata('ayarlar', 'kod sürümü görünmüyor');
    // metin etkinliğinden (luecke) sonra Okuma bölümü açılır (session.lesen ezilmez)
    await p.evaluate(() => window.__tekrar.starte('akis')); await p.waitForTimeout(120);
    let metinGeldi = false;
    for (let i = 0; i < 80 && !metinGeldi; i++) {
      metinGeldi = await p.evaluate(() => { const a = window.__tekrar.aktuell; return !!(a && a.typ === 'akt' && a.art === 'luecke'); });
      if (metinGeldi) break;
      const r = await D.adim(p, { dogru: 0.8, rnd });
      if (r.ad === 'turSonu') { await p.evaluate(() => window.__tekrar.starte('akis')); await p.waitForTimeout(80); }
      if (r.ad === 'leer' || r.ad === 'yok' || /^bilinmeyen/.test(r.ad)) break;
    }
    if (metinGeldi) {
      const L = await p.evaluate(() => { try { window.__tekrar.starte('lesen'); return { ok: !!document.querySelector('#lesen-text .lw') && window.__tekrar.aktuell.typ === 'lesen' }; } catch (e) { return { hata: String(e) }; } });
      if (!L.ok) hata('metin → okuma', L.hata || 'Okuma bölümü açılmadı');
      console.log('metin etkinliği → Okuma:', L.ok ? 'açıldı' : 'HATA');
    } else console.log('metin etkinliği → Okuma: metin kartı gelmedi (atlandı)');
    // her bölüm: starte + 3 adım hatasız
    const modi = await p.evaluate(() => Object.keys(window.__tekrar.S.einst.modi));
    for (const m of modi) {
      await p.evaluate(m => window.__tekrar.starte(m), m);
      await p.waitForTimeout(150);
      for (let i = 0; i < 3; i++) { const r = await D.adim(p, { dogru: 0.8, rnd }); if (/^bilinmeyen/.test(r.ad) && !['yazma', 'lesen', 'kalip', 'artoyun', 'sprechen', 'gram', 'pruefung', 'unite', 'fiilmetin', 'cumle'].includes(m)) hata('bölüm ' + m, 'tanınmayan kart ' + r.ad); }
      await p.keyboard.press('Escape'); await p.waitForTimeout(80);
    }
    if (p.hatalar.length) hata('bölümler', 'sayfa hataları: ' + p.hatalar.join(' | '));
    console.log('bölümler:', modi.join(' '), '· starte + 3 adım');
    await senaryo(b, 'gerçek kopya · mobil', { mobil: true, zustand: Z, gercek: true, tur1: 1 });
  }
  await b.close();
  if (fehler.length) { console.log('HATA:\n  ' + fehler.slice(0, 40).join('\n  ') + (fehler.length > 40 ? `\n  … +${fehler.length - 40}` : '')); process.exit(1); }
  console.log('duman testi geçti');
})();
