// Bugün aktif süre çizgisi, pazartesi kuralı (hedef 1 tur, not), İlerleme "üretim doğruluğu" kartı (6.11).
// Gerçek log/zustand.json kopyası + sentetik log satırları; saat sabit tarihlere kaydırılır. Kullanım: node tests/e2e_ek.js
const D = require('./surucu');
let hata = 0;
const ok = (k, m) => { if (!k) { hata++; console.log('HATA:', m); } };
const satir = (zeit, modus, ergebnis, notiz) => ({ zeit, modus, id: 'x', item: 'x', frage: '', antwort: '', ergebnis, loesung: '', notiz });
(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('e2e_ek: Playwright yok, atlandı'); return; }
  const ac = async (zaman, log) => {
    const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku(), saatOfs: new Date(zaman).getTime() - Date.now() });
    if (log) { await p.evaluate(l => localStorage.setItem('almanca-tekrar-log', JSON.stringify(l)), log); await p.reload(); }
    await p.waitForTimeout(500);
    return p;
  };
  const metin = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, s);
  // pazartesi: aktif süre (30 + 120 + 120) + (30 + 20 + 10 + 10) = 340 sn ≈ 6 dk (36 dk.lık ara sayılmaz); hedef 1 tur; not görünür; Ayarlar asıl seçimi gösterir
  const g = '2026-11-16';
  const log = [
    satir(g + ' 10:00:00', 'wort', 'richtig', 'basamak:B2 | bicim:yaz | not:m3 | sek:30'),
    satir(g + ' 10:02:00', 'wort', 'richtig', 'basamak:B2 | bicim:yaz0 | not:m3 | sek:5'),
    satir(g + ' 10:04:00', 'satz', 'fast', 'basamak:B3 | bicim:bos | not:m3 | yazım | sek:5'),
    satir(g + ' 10:40:00', 'wort', 'falsch', 'basamak:B2 | bicim:yaz | not:m1 | sek:30'),
    satir(g + ' 10:40:20', 'wort', 'falsch', 'basamak:B1 | bicim:yaz0 | not:- | tekrar:1 | sek:8'),
    satir(g + ' 10:40:30', 'erk', 'richtig', 'basamak:B1 | bicim:sec | not:m3 | sek:2'),
    satir(g + ' 10:40:40', 'art', 'falsch', 'basamak:- | bicim:artikel | not:a1 | sek:1'),
  ];
  let p = await ac(g + 'T10:41:00', log);
  const dk = await metin(p, '.dk-satir');
  ok(/bugün 6 dk/.test(dk || ''), `aktif süre: ${dk}`);
  ok(/20 dk/.test(dk || ''), `dk hedefi: ${dk}`);
  const halka = await metin(p, '.halka-ic');
  ok(/\/1/.test(halka || '') || /✓/.test(halka || ''), `pazartesi hedef 1 tur: ${halka}`);
  const pzt = await metin(p, '.ana-bilgi.pazartesi');
  ok(/1 tur/.test(pzt || ''), `pazartesi notu: ${pzt}`);
  const gh = await p.evaluate(() => window.__tekrar.S.ayar4.turHedef);
  // İlerleme: bu hafta üretim (yaz r, yaz0 r, bos fast, yaz f) = 2,5/4 → %63; tekrar:1 ve artikel hariç; seçmeli 1/1 → %100
  await p.click('.alt-nav button[data-v="gecmis"]'); await p.waitForTimeout(400);
  const bu = await metin(p, '.ud-satir.bu');
  ok(/bu hafta/.test(bu || '') && /%63/.test(bu || '') && /%100/.test(bu || ''), `üretim doğruluğu: ${bu}`);
  ok(/Asıl ölçü üretim/.test(await metin(p, '#ilerleme-ust') || ''), 'açıklama yok');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'İlerleme yatay taşma');
  // Ayarlar: pazartesi de asıl seçim (S.ayar4.turHedef) işaretli
  await p.click('.alt-nav button[data-v="diger"]'); await p.waitForTimeout(200);
  await p.click('[data-git="ayar"][data-v="ayar"]'); await p.waitForTimeout(300);
  const sec = await p.evaluate(() => { const b = document.querySelector('[data-ayar="hedef"] [aria-pressed="true"]'); return b ? +b.dataset.val : null; });
  ok(gh == null || sec === Math.max(1, Math.min(8, +gh || 2)), `Ayarlar günlük hedef: ${sec} (ayar ${gh})`);
  ok(!p.hatalar.length, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await p.ctx.close();
  // pazar akşamı: "yarın pazartesi" notu; cumartesi: not yok, hedef asıl seçim
  p = await ac('2026-11-15T19:00:00');
  // 6.11 denetim: hedef bitmeden "yarın 1 tur yeter" yanıltıcı → not yalnız pazarın hedefi bitince
  ok(!/Yarın pazartesi/.test(await metin(p, '.ana-bilgi.pazartesi') || ''), 'pazar akşamı hedef bitmeden not var');
  await p.ctx.close();
  p = await ac('2026-11-14T10:00:00');
  ok(!(await metin(p, '.ana-bilgi.pazartesi')), 'cumartesi pazartesi notu çıktı');
  const h2 = await metin(p, '.halka-ic');
  ok(!/\/1tur/.test((h2 || '').replace(/\s/g, '')) || gh === 1, `cumartesi hedef: ${h2}`);
  await p.ctx.close();
  await b.close();
  console.log(hata ? `e2e_ek: ${hata} hata` : 'e2e_ek: geçti (aktif süre, pazartesi, üretim doğruluğu)');
  process.exit(hata ? 1 : 0);
})();
