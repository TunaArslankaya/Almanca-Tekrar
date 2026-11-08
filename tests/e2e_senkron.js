// Depolama / senkron senaryosu (Playwright gerekir): node tests/e2e_senkron.js
// Sahte GitHub API'si (bellekte dosyalar, commit sayacı) ve gerçek durumun KOPYASI (log/zustand.json yalnız okunur), masaüstü.
// 8.11 (7.11 denetimi): 1) değişiklik yokken gizlenme zustand.json yazmaz (önceden her gizlenmede commit: 37 dk'da 21);
// 2) otomatik senkronlar en az 2 dk arayla (arada gelenler birleşir; sayfa kapanırken bekleyen yazılır); 3) klasör bağlı değilken
// S.pending boşalır / büyümez; 4) localStorage kotası dolunca önce yerel log kısaltılıp ilerleme kaydedilir, olmazsa uyarı çubuğu.
const D = require('./surucu');

const fehler = [];
const hata = m => { if (fehler.length < 60) fehler.push(m); };
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const MIN = 60000;
let faz = 0;

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: e2e_senkron atlandı'); return; }
  const z = D.zustandOku();
  // sahte GitHub: dosya → { text, sha }; PUT sayacı yol başına
  // öbür cihazın log.csv satırı (alıntılı alan, noktalı virgül içeren notiz): açılışta yerel log'a karışmalı, GitHub kuyruğuna girmemeli
  const OBUR = '2026-11-01 09:00:00;wort;n0001:wort;der Test;"a;b";der Tast;fast;der Test;basamak:B2 | bicim:yaz | not:m3 | yazım';
  const dosya = { 'log/zustand.json': { text: z, sha: 's0' }, 'log/log.csv': { text: '\uFEFFzeit;modus;id;item;frage;antwort;ergebnis;loesung;notiz\n' + OBUR + '\n', sha: 'l0' } }, put = {};
  let shaN = 1;
  const p = await D.sayfa(b, { zustand: z, url: undefined });
  if (process.env.DBG) p.on("console", m => console.log(faz, m.type(), m.text().slice(0, 300)));
  const kur = async pg => {
    await pg.route(/api\.github\.com/, async r => {
      const u = new URL(r.request().url()), m = r.request().method();
      const yol = decodeURIComponent(u.pathname.replace(/^\/repos\/[^/]+\/[^/]+\/contents\//, ''));
      if (/\/actions\//.test(u.pathname)) return r.fulfill({ status: 204, body: '' });
      if (!/\/contents\//.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      if (m === 'GET') {
        const f = dosya[yol];
        if (!f) return r.fulfill({ status: 404, body: '{}' });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: f.sha, encoding: 'base64', content: Buffer.from(f.text, 'utf8').toString('base64') }) });
      }
      if (m === 'PUT') {
        const j = JSON.parse(r.request().postData() || '{}');
        dosya[yol] = { text: Buffer.from(j.content, 'base64').toString('utf8'), sha: 's' + (shaN++) };
        put[yol] = (put[yol] || 0) + 1; if (process.env.DBG) console.log("PUT", yol, faz, Date.now() % 100000);
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: { sha: dosya[yol].sha } }) });
      }
      return r.fulfill({ status: 405, body: '' });
    });
  };
  await kur(p);
  await p.evaluate(() => { localStorage.setItem('almanca-tekrar-gh', 'test-anahtar'); });
  await p.reload(); await p.waitForFunction(() => !!window.__tekrar, null, { timeout: 8000 }); await p.waitForTimeout(800);
  const ob = await p.evaluate(() => { const S = window.__tekrar.S, e = S.log.find(x => x.zeit === '2026-11-01 09:00:00' && x.id === 'n0001:wort'); return { e, gh: (S.ghPending || []).some(x => x.id === 'n0001:wort'), sirali: S.log.every((x, i) => !i || S.log[i - 1].zeit <= x.zeit) }; });
  if (!ob.e || ob.e.frage !== 'a;b' || ob.e.antwort !== 'der Tast') hata('log.csv\'deki öbür cihaz satırı yerel log\'a karışmadı: ' + JSON.stringify(ob.e));
  if (ob.gh) hata('öbür cihazın satırı GitHub kuyruğuna girdi');
  if (!ob.sirali) hata('birleşik log zaman sırasında değil');
  const gizle = async () => {
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await p.waitForTimeout(700);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); });
  };
  const zp = () => put['log/zustand.json'] || 0, lp = () => put['log/log.csv'] || 0;

  // 1) ilk gizlenme: yerel özet yok → bir kez yazar; sonra değişiklik yokken yazmaz (aralık geçse de)
  await gizle();
  const z1 = zp();
  if (z1 > 1) hata(`ilk gizlenmede ${z1} zustand yazımı (en çok 1)`);
  await gizle(); await gizle();
  if (zp() !== z1) hata(`değişiklik yokken gizlenme zustand.json yazdı: ${z1} → ${zp()}`);
  await D.ileri(p, 5 * MIN);
  await gizle();
  if (zp() !== z1) hata(`değişiklik yokken (5 dk sonra) gizlenme yazdı: ${z1} → ${zp()}`);

  // 2) cevap ver → gizle: son yazımdan beri 2 dk geçtiyse yazar; hemen ardından yeni cevap + gizle: aralık dolmadan yazmaz
  // (3 dk'lık zamanlayıcı cevaplar sırasında yazmış olabilir: toplam bir yazım beklenir)
  const z2 = zp(), l2 = lp(); faz = 2;
  await p.evaluate(() => window.__tekrar.starte('akis'));
  for (let i = 0; i < 6; i++) await D.adim(p, { dogru: 0.8, rnd });
  const pend = await p.evaluate(() => window.__tekrar.S.pending.length);
  if (pend) hata(`klasör bağlı değilken S.pending boşalmadı: ${pend}`);
  await gizle();
  if (zp() !== z2 + 1) hata(`değişiklikten sonra gizlenme yazmadı (zustand ${z2} → ${zp()})`);
  if (lp() !== l2 + 1) hata(`değişiklikten sonra log.csv yazılmadı (${l2} → ${lp()})`);
  for (let i = 0; i < 3; i++) await D.adim(p, { dogru: 0.8, rnd });
  const z3 = zp(); faz = 3;
  await gizle(); await gizle();
  if (zp() !== z3) hata(`2 dk dolmadan ikinci yazım: ${z3} → ${zp()}`);
  // aralık dolunca (zamanlayıcı ya da sonraki gizlenme) birleşmiş tek yazım
  faz = 4; await D.ileri(p, 3 * MIN);
  await gizle();
  if (zp() !== z3 + 1) hata(`aralık dolunca bekleyen değişiklik yazılmadı: ${z3} → ${zp()}`);
  // yazılan ilerleme log / kuyruk taşımaz, log satırları uzakta
  const uz = JSON.parse(dosya['log/zustand.json'].text);
  if ((uz.log || []).length || (uz.pending || []).length || (uz.ghPending || []).length) hata('zustand.json log / kuyruk taşıyor');
  const satir = (dosya['log/log.csv'] || { text: '' }).text.split('\n').filter(Boolean).length;
  if (satir < 5) hata(`log.csv'de satır az: ${satir}`);
  // Ayarlar → "şimdi kaydet" (zorla): değişiklik yoksa yine yazmaz
  const z4 = zp();
  await p.evaluate(() => document.getElementById('gh-simdi').click()); await p.waitForTimeout(700);
  if (zp() !== z4) hata(`değişiklik yokken "şimdi kaydet" zustand yazdı: ${z4} → ${zp()}`);

  // 3b) Bilmediklerim (8.11): sonraki yanlış d'yi sıfırlar; seçmeli doğrusu saymaz, üretim (yazma) doğrusu sayar.
  //     Zor soruda yavaşlık: 25 sn'den uzun doğru yazma 'yavaş' (not 4 değil)
  const ids = await p.evaluate(() => { const S = window.__tekrar.S; return Object.keys(S.items).filter(id => /^n/.test(id) && S.items[id].m && S.items[id].m.S && !S.items[id].leech).slice(0, 3); });
  const [b1, b2, b3] = ids;
  await p.evaluate(([b1, b2]) => { const S = window.__tekrar.S, t = Date.now() - 3 * 86400000; S.bilmedik = S.bilmedik || {};
    S.bilmedik[b1] = { ad: b1, ilk: t, son: t, n: 1, d: 2, dt: t + 86400000 }; S.bilmedik[b2] = { ad: b2, ilk: t, son: t, n: 1, d: 0, dt: 0 }; }, [b1, b2]);
  const ac = sel => p.evaluate(sel => window.__tekrar.frageAc(sel), sel);
  if (await ac({ id: b1, bicim: 'yaz', b: 2 })) { await D.adim(p, { dogru: 0, rnd }); } else hata('frageAc yaz açılmadı');
  const bx1 = await p.evaluate(id => window.__tekrar.S.bilmedik[id], b1);
  if (!bx1 || bx1.d !== 0 || !bx1.y) hata(`bilmedik: "artık biliyorsun" sonrası yanlış d'yi sıfırlamadı: ${JSON.stringify(bx1)}`);
  if (await ac({ id: b2, bicim: 'sec', b: 1 })) await D.adim(p, { dogru: 1, rnd }); else hata('frageAc sec açılmadı');
  const bx2 = await p.evaluate(id => window.__tekrar.S.bilmedik[id].d, b2);
  if (bx2 !== 0) hata(`bilmedik: seçmeli doğrusu sayıldı (d ${bx2})`);
  if (await ac({ id: b2, bicim: 'yaz', b: 2 })) await D.adim(p, { dogru: 1, rnd }); else hata('frageAc yaz (2) açılmadı');
  const bx3 = await p.evaluate(id => window.__tekrar.S.bilmedik[id].d, b2);
  if (bx3 !== 1) hata(`bilmedik: üretim doğrusu sayılmadı (d ${bx3})`);
  if (await ac({ id: b3, bicim: 'yaz', b: 2, zor: true })) {
    await D.ileri(p, 30000);
    await D.adim(p, { dogru: 1, rnd });
    const son = await p.evaluate(id => window.__tekrar.S.log.filter(e => e.id === id + ':wort').pop(), b3);
    if (!son || !/(^| \| )yavaş( |$)/.test(son.notiz) || !/(^| \| )zor( |$)/.test(son.notiz) || /not:m4/.test(son.notiz)) hata(`zor soru 30 sn: 'yavaş' yok ya da not 4: ${son && son.notiz}`);
  } else hata('frageAc zor açılmadı');

  // 3) kota: ana anahtar ancak log anahtarı silinince sığıyor → ilerleme kaydedilir, uyarı yok; hiç sığmıyorsa uyarı çubuğu
  const k1 = await p.evaluate(() => {
    const orj = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'almanca-tekrar-v1' && localStorage.getItem('almanca-tekrar-log') !== null) { const e = new Error('dolu'); e.name = 'QuotaExceededError'; throw e; } return orj.call(this, k, v); };
    window.__tekrar.S.xpTaban = (window.__tekrar.S.xpTaban || 0) + 1;
    window.dispatchEvent(new Event('pagehide'));
    Storage.prototype.setItem = orj;
    const c = document.getElementById('kayit-cubuk');
    return { uyari: !!(c && !c.hidden && getComputedStyle(c).display !== 'none'), kayit: JSON.parse(localStorage.getItem('almanca-tekrar-v1')).xpTaban === window.__tekrar.S.xpTaban };
  });
  if (!k1.kayit) hata('kota: yer açılıp ilerleme kaydedilmedi');
  if (k1.uyari) hata('kota: yer açılabildiği hâlde uyarı çubuğu');
  const k2 = await p.evaluate(() => {
    const orj = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'almanca-tekrar-v1') { const e = new Error('dolu'); e.name = 'QuotaExceededError'; throw e; } return orj.call(this, k, v); };
    window.__tekrar.S.xpTaban += 1;
    window.dispatchEvent(new Event('pagehide'));
    const c = document.getElementById('kayit-cubuk'), acik = !!(c && !c.hidden && getComputedStyle(c).display !== 'none');
    Storage.prototype.setItem = orj;
    window.__tekrar.S.xpTaban += 1;
    window.dispatchEvent(new Event('pagehide'));
    return { acik, sonra: !!(c && !c.hidden && getComputedStyle(c).display !== 'none') };
  });
  if (!k2.acik) hata('kota: kayıt hiç sığmıyorken uyarı çubuğu görünmedi');
  if (k2.sonra) hata('kota: kayıt yeniden başarılı olunca uyarı kalktı değil');

  if (p.hatalar.length) hata('sayfa hatası: ' + p.hatalar.slice(0, 3).join(' / '));
  console.log(`  zustand yazımı: ${zp()} · log yazımı: ${lp()} · log.csv satırı: ${satir}`);
  await b.close();
  if (fehler.length) { console.log('✗ e2e_senkron:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log('e2e_senkron: geçti');
})().catch(e => { console.error(e); process.exit(1); });
