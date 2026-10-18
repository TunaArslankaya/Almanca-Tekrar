// Akşam tekrarı senaryosu (Playwright gerekir): node tests/e2e_aksam.js [ekran görüntüsü klasörü]
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur), mobil 390×844, saat kaydırma (surucu: localStorage __off).
// Yarın 08:00: Bugün'de akşam kartı yok → 2 tur Çalış (yeni öğeler + birkaç yanlış) → 10:00: kart yok → 18:00: kart var;
// adaylar yalnız bugün yeni / yanlış-fast / R < 0,9 öğeler (≤ 15), bugün doğru bilinen ve R ≥ 0,9 öğe yok;
// akşam turu: her cevap satırında 'akşam', tur satırı id 'aksam'; bugün yeni / yanlış öğe (aksamIst) hafızaya bir kez daha yazılır
// (m.aksam = gün, vade ≤ yarın 04:00), bugün doğru cevaplanmış diğer öğeler 'hafıza:yazılmadı'; gün sayacı artar; sonra kart ✓; sayfa hatası 0.
const D = require('./surucu');
const fs = require('fs');
const path = require('path');

const fehler = [];
const hata = m => { if (fehler.length < 60) fehler.push(m); };
let seed = 5;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const SAAT = 3600000;
const klasor = process.argv[2] || null;
const foto = async (p, ad) => { if (klasor) { fs.mkdirSync(klasor, { recursive: true }); await p.screenshot({ path: path.join(klasor, ad + '.png'), fullPage: false }); } };
const kartVar = p => p.evaluate(() => { const e = document.getElementById('aksam-kart'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; });
const anaya = async p => { await p.reload(); await p.waitForFunction(() => !!window.__tekrar, null, { timeout: 8000 }); await p.waitForTimeout(200); };

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: e2e_aksam atlandı'); return; }
  // yarın 08:00 (yerel)
  const hedef = new Date(); hedef.setDate(hedef.getDate() + 1); hedef.setHours(8, 0, 0, 0);
  const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku(), saatOfs: hedef.getTime() - Date.now() });
  await anaya(p);
  if (await kartVar(p)) hata('08:00 (henüz cevap yok): akşam kartı görünmemeli');

  // sabah: 2 tur
  const log0 = await p.evaluate(() => window.__tekrar.S.log.length);
  await p.evaluate(() => window.__tekrar.starte('akis'));
  for (let i = 0; i < 120; i++) {
    const turSay = await p.evaluate(l0 => window.__tekrar.S.log.slice(l0).filter(e => e.modus === 'tur').length, log0);
    if (turSay >= 2) break;
    const r = await D.adim(p, { dogru: 0.75, rnd });
    if (r.ad === 'leer' || r.ad === 'yok' || /^bilinmeyen/.test(r.ad)) { hata('sabah turu durdu: ' + r.ad); break; }
  }
  // 10:00: kart yok (8 saat dolmadı)
  await D.ileri(p, 2 * SAAT);
  await anaya(p);
  if (await kartVar(p)) hata('10:00: akşam kartı görünmemeli');
  await foto(p, '1-sabah-1000');
  // 18:00: kart var
  await D.ileri(p, 8 * SAAT);
  await anaya(p);
  const kart = await kartVar(p);
  if (!kart) hata('18:00: akşam kartı görünmeli');
  else if (!/Akşam tekrarı/.test(kart) || !/sabah öğrendiklerin/.test(kart)) hata('kart metni: ' + kart);
  // kart ikinci iş kartının üstünde
  const sira = await p.evaluate(() => { const a = document.getElementById('aksam-kart'), i = document.querySelector('.ikinci-is:not(.aksam-is)'); return !a || !i ? null : a.getBoundingClientRect().top < i.getBoundingClientRect().top; });
  if (sira === false) hata('akşam kartı ikinci iş kartının üstünde olmalı');
  await foto(p, '2-aksam-1800-bugun');

  // adaylar: kural denetimi
  const A = await p.evaluate(() => {
    const T = window.__tekrar, S = T.S, t = Date.now(), K = T.Kern, g = K.gun4(t), d = T.aksamDurum();
    const bas = new Date(K.gunBas4(t)), z = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}:00`;
    const bugunLog = S.log.filter(e => e.zeit >= z(bas));
    const yanlisLog = new Set(bugunLog.filter(e => e.ergebnis === 'falsch' || e.ergebnis === 'fast').map(e => e.id.split(':')[0]));
    const dogruLog = new Set(bugunLog.filter(e => e.ergebnis === 'richtig').map(e => e.id.split(':')[0]));
    const neden = id => {
      const it = S.items[id] || {}, h = it.m;
      if (it.tanit && K.gun4(it.tanit) === g) return 'yeni';
      if (yanlisLog.has(id) || [it.m, it.art].some(x => x && x.S && x.gun === g && x.lastG <= 2)) return 'yanlis';
      if (h && h.S && K.R(h, t) < 0.9) return 'dusukR';
      return null;
    };
    const ad = d.adaylar.map(x => ({ id: x.id, neden: x.neden, bekl: neden(x.id) }));
    // bugün doğru bilinen, oturmuş (R ≥ 0,9), yeni / yanlış olmayan öğeler
    const oturmus = [...dogruLog].filter(id => S.items[id] && !neden(id));
    return { ad, oturmus, goster: d.goster, g, n0: (S.tage[T.Kern.gun4(t)] || {}).n || 0, items0: JSON.parse(JSON.stringify(S.items)) };
  });
  console.log(`  adaylar: ${A.ad.length} (${['yeni', 'yanlis', 'dusukR'].map(k => `${k} ${A.ad.filter(x => x.neden === k).length}`).join(', ')}) · bugün doğru + oturmuş: ${A.oturmus.length}`);
  if (A.ad.length < 3 || A.ad.length > 15) hata(`aday sayısı ${A.ad.length} (3–15)`);
  A.ad.forEach(x => { if (!x.bekl) hata(`aday kurala uymuyor: ${x.id} (${x.neden})`); else if (x.bekl !== x.neden) hata(`aday nedeni ${x.neden}, beklenen ${x.bekl}: ${x.id}`); });
  if (!A.ad.some(x => x.neden === 'yeni')) hata('bugün tanıtılan öğe aday değil');
  const adSet = new Set(A.ad.map(x => x.id));
  A.oturmus.forEach(id => { if (adSet.has(id)) hata('oturmuş, bugün doğru öğe aday: ' + id); });
  // öncelik: yeni → yanlış → düşük R
  const sr = { yeni: 0, yanlis: 1, dusukR: 2 };
  A.ad.forEach((x, i) => { if (i && sr[A.ad[i - 1].neden] > sr[x.neden]) hata('aday sırası öncelikli değil: ' + A.ad.map(y => y.neden).join(',')); });

  // akşam turu
  const logBas = await p.evaluate(() => window.__tekrar.S.log.length);
  await p.click('#aksam-kart');
  await p.waitForTimeout(200);
  const ist = await p.evaluate(() => (window.__tekrar.ot.aksamIst || []).slice());
  let ilkFoto = false, son = null;
  for (let i = 0; i < 40; i++) {
    const s = await D.durum(p);
    if (!ilkFoto && (s.input || s.mc)) { await foto(p, '3-aksam-soru'); ilkFoto = true; }
    if (s.tur === 'turSonu' || s.tur === 'leer') { son = s; break; }
    const r = await D.adim(p, { dogru: 0.8, rnd });
    if (/^bilinmeyen/.test(r.ad) || r.ad === 'yok') { hata('akşam turu: ' + r.ad); break; }
  }
  if (!son) hata('akşam turu bitmedi');
  await foto(p, '4-aksam-tur-sonu');
  const B = await p.evaluate(bas => { const T = window.__tekrar, S = T.S; return { log: S.log.slice(bas), items: JSON.parse(JSON.stringify(S.items)), n1: (S.tage[T.Kern.gun4(Date.now())] || {}).n || 0, ertesi: T.Kern.ertesiGun4(Date.now()) }; }, logBas);
  const cevap = B.log.filter(e => /basamak:/.test(e.notiz || ''));
  const tur = B.log.filter(e => e.modus === 'tur');
  console.log(`  akşam turu: ${cevap.length} cevap, tur satırı: ${tur.map(e => `${e.id};${e.ergebnis};${e.notiz}`).join(' / ')}`);
  if (!cevap.length) hata('akşam turunda cevap yok');
  if (!tur.length || tur[0].id !== 'aksam') hata('tur satırı id aksam olmalı');
  if (B.log.some(e => e.modus === 'yeni')) hata('akşam turunda yeni kelime tanıtıldı');
  const gorulen = new Set();
  cevap.forEach(e => {
    const id = e.id.split(':')[0], et = e.notiz.split(' | ');
    if (!et.includes('akşam')) hata('akşam etiketi yok: ' + e.id + ' ' + e.notiz);
    if (!adSet.has(id)) hata('aday dışı öğe soruldu: ' + id);
    const yazilmadi = et.includes('hafıza:yazılmadı'), notM = /not:([^ |]*)/.exec(e.notiz)[1];
    const once = A.items0[id] || {}, bugunYazildi = once.m && once.m.gun === A.g;
    const ilk = !gorulen.has(id); gorulen.add(id);
    if (ilk && ist.includes(id) && bugunYazildi && !/m\d/.test(notM) && !et.includes('sayılmadı')) hata(`akşam istisnası yazmadı: ${id} ${e.notiz}`);
    if (ilk && !ist.includes(id) && bugunYazildi && !yazilmadi) hata(`istisna dışı, bugün yazılmış öğe yazıldı: ${id} ${e.notiz}`);
    if (ilk && !bugunYazildi && /m\d/.test(notM) && et.includes('hafıza:yazılmadı')) hata(`çelişkili satır: ${e.notiz}`);
    if (!ilk && /m\d/.test(notM)) hata(`akşamda aynı öğe ikinci kez yazıldı: ${id} ${e.notiz}`);
  });
  // hafıza: istisnayla yazılanlar aksam işaretli, vade ≤ yarın 04:00
  let istYazilan = 0;
  ist.forEach(id => {
    const h = B.items[id] && B.items[id].m, h0 = A.items0[id] && A.items0[id].m;
    if (!h || !h0 || !gorulen.has(id) || h0.gun !== A.g) return;
    if (h.aksam === A.g) { istYazilan++; if (h.due > B.ertesi) hata(`istisna yazımında vade yarın 04:00'ten sonra: ${id}`); }
  });
  console.log(`  istisnayla yazılan: ${istYazilan} / aday içinde yeni-yanlış: ${ist.length}`);
  if (!istYazilan) hata('hiçbir öğe akşam istisnasıyla yazılmadı');
  Object.keys(B.items).forEach(id => { const h = B.items[id].m; if (h && h.aksam === A.g && !ist.includes(id)) hata('istisna dışı öğede aksam işareti: ' + id); });
  // gün sayacı normal sayılır
  const sayilan = cevap.filter(e => !e.notiz.split(' | ').includes('sayılmadı')).length;
  if (B.n1 - A.n0 !== sayilan) hata(`gün sayacı ${A.n0} → ${B.n1}, sayılan akşam cevabı ${sayilan}`);
  // Bugün: kart ✓ yapıldı
  await anaya(p);
  const kart2 = await kartVar(p);
  if (!kart2 || !/yapıldı/.test(kart2)) hata('akşam turundan sonra kart ✓ yapıldı olmalı: ' + kart2);
  await foto(p, '5-aksam-yapildi');
  if (p.hatalar.length) hata('sayfa hatası: ' + p.hatalar.slice(0, 3).join(' / '));
  await b.close();
  if (fehler.length) { console.log('✗ e2e_aksam:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log('e2e_aksam: geçti');
})().catch(e => { console.error(e); process.exit(1); });
