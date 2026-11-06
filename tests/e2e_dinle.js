// Dinleme duman testi (Playwright gerekir): node tests/e2e_dinle.js
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur), 390×844 telefon. Denetlenenler:
// Ayarlar'da "Sesli sorular" (varsayılan açık) / "Ses hızı" / "Almanca ses" · ot.sesVar (sec sarmalayıcısı) · ses yuvası (Kern.sec'ten bağımsız
// __tekrar.sesAc ile): duy-kelime (yazı gizli, şıklar sesten sonra; doğru → kendiliğinden geçer), duy-bosluk, duy-dikte (hâl hatası yazım sayılmaz),
// Bilmiyorum, log satırları (modus duy, id <öğe>:duy-…, notiz tür / hız / tekrar / sek), öğe hafızası değişmez, tur sayacı ilerler ·
// Kern.sec { tur:'ses' } verince zeige() dalı (Kern.sec geçici sarmalayıcıyla) ve Konus yoksa yuvanın atlanması · eski dikte (metin etkinliği)
// G.cumleKontrol ile · Okuma'da Dinleme modu (4 adım, boşluk puanı, log lesen <metin>:dinle) · etkileşimli öğeler ≥ 48 px · sayfa hatası 0.
const D = require('./surucu');

const fehler = [];
const hata = (ad, m) => { if (fehler.length < 60) fehler.push(`[${ad}] ${m}`); };
const kucukler = (p, kok) => p.evaluate(kok => {
  const r = [];
  document.querySelectorAll(`${kok} button, ${kok} input:not([type=hidden]), ${kok} select, ${kok} textarea`).forEach(e => {
    if (e.closest('[hidden]') || e.classList.contains('u-luecke')) return;
    const b = e.getBoundingClientRect(), st = getComputedStyle(e);
    if (!b.width || !b.height || st.visibility === 'hidden' || st.display === 'none') return;
    if (b.height < 47.5 || b.width < 47.5) r.push(`${e.tagName.toLowerCase()}.${[...e.classList].join('.')} "${(e.innerText || e.value || '').trim().slice(0, 20)}" ${Math.round(b.width)}×${Math.round(b.height)}`);
  });
  return r;
}, kok);
const sonLog = p => p.evaluate(() => { const l = window.__tekrar.S.log; return l[l.length - 1]; });
const typ = p => p.evaluate(() => window.__tekrar.aktuell && window.__tekrar.aktuell.typ);
async function bekleTyp(p, deg, ms) { for (let i = 0; i < (ms || 3000) / 60; i++) { if ((await typ(p)) !== deg) return true; await p.waitForTimeout(60); } return false; }

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: atlandı'); return; }
  const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
  await p.route(/\.mp3/, r => r.abort());   // DW sesi ağdan çekilmesin (oynatıcı hatasız açılmalı)
  const yuklu = await p.evaluate(() => !!window.Dinle && typeof Dinle.turSorusu === 'function');
  if (!yuklu) hata('modül', 'window.Dinle yüklenmedi');

  // ---- Ayarlar ----
  await p.click('.alt-nav [data-v="diger"]'); await p.waitForTimeout(150);
  await p.click('#diger [data-git="ayar"]'); await p.waitForTimeout(200);
  const ay = await p.evaluate(() => ({ sesli: (document.querySelector('#a-sesli') || {}).checked, hiz: !!document.querySelector('[data-ayar="seshiz"]'), sec: !!document.querySelector('#a-sesadi'), opt: (document.querySelector('#a-sesadi') || { options: [] }).options.length }));
  if (ay.sesli !== true) hata('ayarlar', `"Sesli sorular" varsayılan açık değil: ${ay.sesli}`);
  if (!ay.hiz) hata('ayarlar', '"Ses hızı" yok');
  if (!ay.sec || ay.opt < 1) hata('ayarlar', '"Almanca ses" seçici yok');
  await p.click('[data-ayar="seshiz"] button[data-val="1"]'); await p.waitForTimeout(80);
  if ((await p.evaluate(() => window.__tekrar.S.einst.sesHiz)) !== 1) hata('ayarlar', 'ses hızı 1,0 kaydedilmedi');
  (await kucukler(p, '#a-satirlar')).forEach(x => hata('ayarlar ≥48', x));
  await p.click('#a-sesli + i').catch(() => p.evaluate(() => { const c = document.querySelector('#a-sesli'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }));
  await p.waitForTimeout(80);
  if ((await p.evaluate(() => window.__tekrar.S.einst.sesli)) !== false) hata('ayarlar', '"Sesli sorular" kapatılamadı');
  await p.evaluate(() => window.__tekrar.starte('akis'));
  await p.waitForTimeout(200);
  if ((await p.evaluate(() => window.__tekrar.sesVarMi())) !== false) hata('sesVar', 'kapalıyken ot.sesVar true');
  await p.evaluate(() => { window.__tekrar.S.einst.sesli = true; });
  if ((await p.evaluate(() => window.__tekrar.sesVarMi())) !== true) hata('sesVar', 'açıkken ot.sesVar true değil');

  // ---- duy-kelime: yazı gizli, şıklar sesten sonra, doğru → kendiliğinden geçer ----
  const hafiza = () => p.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(window.__tekrar.S.items).map(([k, v]) => [k, v.m || null]))));
  const h0 = await hafiza(), n0 = await p.evaluate(() => window.__tekrar.tur.n);
  // açılış ve "şıklar kapalı" denetimi aynı anda (ses hatası hızlı gelirse şıklar hemen açılabilir)
  const k = await p.evaluate(() => { const T = window.__tekrar; if (!T.sesAc('duy', 'kelime')) return null; const a = T.aktuell; const lem = T.byId[a.id] ? T.byId[a.id].lemma : a.id[0] === 'v' ? T.VERBEN.find(v => v.id === a.id).inf : T.wById[a.id].de; return { typ: a.typ, id: a.id, lem, kapali: document.querySelector('#dn-sik').hidden, metin: document.querySelector('#kart').innerText }; });
  if (!k) hata('kelime', 'soru açılmadı');
  else {
    if (k.typ !== 'sesTur') hata('kelime', 'aktuell.typ ' + k.typ);
    if (!k.kapali) hata('kelime', 'şıklar ses çalmadan açık');
    if (k.metin.includes(k.lem)) hata('kelime', `kelimenin yazısı ekranda: ${k.lem}`);
    await p.waitForFunction(() => !document.querySelector('#dn-sik').hidden, null, { timeout: 4000 }).catch(() => hata('kelime', 'şıklar açılmadı'));
    (await kucukler(p, '#v-calis')).forEach(x => hata('kelime ≥48', x));
    const dogru = await p.evaluate(() => window.__tekrar.aktuell.soru.cevap());
    await p.keyboard.press(String(dogru + 1));
    await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || l.modus !== 'duy' || l.id !== k.id + ':duy-kelime' || l.ergebnis !== 'richtig') hata('kelime', 'log: ' + JSON.stringify(l));
    if (l && !/^tür:kelime \| hız:1 \| tekrar:0 \| sek:\d+$/.test(l.notiz)) hata('kelime', 'notiz: ' + l.notiz);
    if (!(await bekleTyp(p, 'sesTur', 4000))) hata('kelime', 'doğru cevaptan sonra kendiliğinden geçmedi');
    const ot = await p.evaluate(() => { const o = window.__tekrar.ot, g = o.gecmis[o.gecmis.length - 1]; return { g, n: window.__tekrar.tur.n }; });
    if (!ot.g || ot.g.tur !== 'ses') hata('kelime', 'oturum geçmişinde ses adımı yok: ' + JSON.stringify(ot.g));
    if (ot.n !== n0 + 1) hata('kelime', `tur sayacı ${n0} → ${ot.n}`);
  }
  // ---- Bilmiyorum (0) ----
  if (await p.evaluate(() => window.__tekrar.sesAc('duy', 'kelime'))) {
    await p.waitForFunction(() => !document.querySelector('#dn-sik').hidden, null, { timeout: 4000 }).catch(() => {});
    await p.keyboard.press('0'); await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || l.ergebnis !== 'falsch' || !/bilmiyorum/.test(l.notiz)) hata('bilmiyorum', JSON.stringify(l));
    if (!(await p.$('#kart .devam-btn'))) hata('bilmiyorum', 'Devam yok');
    // yanlış / bilmiyorum: Devam 2,5 sn kilitli (S6); hemen Enter geçmez, kilitten sonra geçer
    await p.waitForTimeout(150); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    if (await p.evaluate(() => (window.__tekrar.aktuell || {}).typ === 'sesTur' && !!(window.__tekrar.aktuell || {}).wartet) !== true) hata('bilmiyorum', 'kilitliyken Enter geçirdi');
    await p.waitForTimeout(2500); await p.keyboard.press('Enter');
    if (!(await bekleTyp(p, 'sesTur', 2000))) hata('bilmiyorum', 'Enter sıradaki soruya geçirmedi');
  }
  // ---- duy-bosluk ----
  if (!(await p.evaluate(() => window.__tekrar.sesAc('duy', 'bosluk')))) hata('bosluk', 'soru açılmadı');
  else {
    const s = await p.evaluate(() => ({ id: window.__tekrar.aktuell.id, z: window.__tekrar.aktuell.soru.cevap(), bos: !!document.querySelector('#kart .bosluk'), inp: !!document.querySelector('#kart #cevap') }));
    if (!s.bos || !s.inp) hata('bosluk', 'boşluk / girdi yok');
    await p.fill('#cevap', s.z); await p.press('#cevap', 'Enter'); await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || l.id !== s.id + ':duy-bosluk' || l.ergebnis !== 'richtig' || !/^tür:bosluk/.test(l.notiz)) hata('bosluk', JSON.stringify(l));
    if (!(await bekleTyp(p, 'sesTur', 4000))) hata('bosluk', 'kendiliğinden geçmedi');
  }
  // ---- duy-dikte: doğru, sonra hâl hatası (yazım sayılmaz) ----
  if (!(await p.evaluate(() => window.__tekrar.sesAc('duy', 'dikte')))) hata('dikte', 'soru açılmadı');
  else {
    const z = await p.evaluate(() => window.__tekrar.aktuell.soru.cevap());
    await p.fill('#cevap', z); await p.keyboard.press('Enter'); await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || !/:duy-dikte$/.test(l.id) || l.ergebnis !== 'richtig') hata('dikte', JSON.stringify(l));
    await bekleTyp(p, 'sesTur', 4000);
  }
  let hal = false;
  for (let i = 0; i < 8 && !hal; i++) {
    if (!(await p.evaluate(() => window.__tekrar.sesAc('duy', 'dikte')))) break;
    const z = await p.evaluate(() => window.__tekrar.aktuell.soru.cevap());
    const m = /\b(den|dem|einen|einem)\b/.exec(z);
    if (!m) { await p.click('#kart [data-dn="bilmiyorum"]'); await p.waitForTimeout(100); await p.keyboard.press('Enter'); await bekleTyp(p, 'sesTur', 2000); continue; }
    hal = true;
    const yanlis = z.replace(m[0], { den: 'dem', dem: 'den', einen: 'einem', einem: 'einen' }[m[0]]);
    await p.fill('#cevap', yanlis); await p.keyboard.press('Enter'); await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || l.ergebnis === 'richtig' || /yazım/.test(l.notiz) || !/artikel\/çekim/.test(l.notiz) || !/dikte:ek/.test(l.notiz)) hata('dikte hâl', JSON.stringify(l));
    await p.waitForTimeout(150); await p.keyboard.press('Enter'); await bekleTyp(p, 'sesTur', 2000);
  }
  if (await hafiza() !== h0) hata('hafıza', 'ses yuvası öğe hafızasına yazdı');

  // ---- Kern.sec { tur:'ses' } → zeige() dalı (geçici sarmalayıcı); Konus yoksa soyle yuvası atlanır ----
  await p.evaluate(() => {
    const K = window.Kern, orig = K.sec;
    window.__kernOrig = orig;
    K.sec = (S, o, t, r) => {
      if (o.sesVar === true && !o.sesYok) {
        if ((o.adim || 0) >= 1 && !o.__duy) { o.__duy = 1; return { tur: 'ses', alt: 'duy', kaynak: 'ses' }; }
        if ((o.adim || 0) >= 3 && !o.__soyle) { o.__soyle = 1; return { tur: 'ses', alt: 'soyle', kaynak: 'ses' }; }
      }
      return orig(S, o, t, r);
    };
    window.__tekrar.starte('akis', 12);   // yeni tur (yeni oturum)
  });
  await p.waitForTimeout(250);
  const adlar = [];
  for (let i = 0; i < 16; i++) { const r = await D.adim(p, { dogru: 1 }); adlar.push(r.ad); if (r.ad === 'leer' || r.ad === 'turSonu' || /^bilinmeyen/.test(r.ad) || (adlar.includes('ses') && adlar.length - adlar.indexOf('ses') > 3)) break; }
  if (!adlar.includes('ses')) hata('Kern dalı', 'Kern.sec ses verdi ama ses sorusu gelmedi: ' + adlar.join(' '));
  const konus = await p.evaluate(() => !!window.Konus);
  const yok = await p.evaluate(() => !!window.__tekrar.ot.sesYok);
  if (!konus && !yok) hata('Kern dalı', 'Konus yokken soyle yuvası atlanmadı (ot.sesYok)');
  if (adlar.some(a => /^bilinmeyen/.test(a))) hata('Kern dalı', 'sürücü tanımadı: ' + adlar.join(' '));
  await p.evaluate(() => { window.Kern.sec = window.__kernOrig; });

  // ---- eski dikte (metin etkinliği) G.cumleKontrol ile ----
  if (await p.evaluate(() => window.__tekrar.metinAc('diktat'))) {
    const z = await p.evaluate(() => window.__tekrar.aktuell.satz.de);
    const m = /\b(den|dem)\b/.exec(z);
    await p.fill('#cevap', m ? z.replace(m[0], m[0] === 'den' ? 'dem' : 'den') : z); await p.press('#cevap', 'Enter'); await p.waitForTimeout(80);
    const l = await sonLog(p);
    if (!l || l.modus !== 'akt') hata('metin diktesi', JSON.stringify(l));
    else if (m && (/yazım/.test(l.notiz) || l.ergebnis === 'richtig')) hata('metin diktesi', 'hâl hatası yazım / doğru sayıldı: ' + JSON.stringify(l));
    else if (!m && l.ergebnis !== 'richtig') hata('metin diktesi', 'doğru dikte doğru sayılmadı: ' + JSON.stringify(l));
    await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  }

  // ---- Okuma: Dinleme modu ----
  const dw = await p.evaluate(() => { const L = window.__tekrar.LT.find(x => x.audio); return L ? L.id : null; });
  if (!dw) hata('dinleme modu', 'sesli DW metni yok');
  else {
    await p.evaluate(id => window.__tekrar.lesenAc(id), dw); await p.waitForTimeout(150);
    if (!(await p.$('[data-act="dinle-modu"]'))) hata('dinleme modu', 'Okuma ekranında düğme yok');
    else {
      await p.click('[data-act="dinle-modu"]'); await p.waitForTimeout(100);
      const a0 = await p.evaluate(() => ({ typ: window.__tekrar.aktuell.typ, mod: !!document.querySelector('#kart .dn-mod'), kw: document.querySelectorAll('.dn-anahtar .chip').length }));
      if (a0.typ !== 'dinleMod' || !a0.mod) hata('dinleme modu', 'açılmadı ' + JSON.stringify(a0));
      if (a0.kw < 1) hata('dinleme modu', 'anahtar kelime yok');
      await p.keyboard.press('Enter'); await p.waitForTimeout(80);   // tahmin → metinsiz dinle
      if ((await p.evaluate(() => Dinle.mod.adim)) !== 1) hata('dinleme modu', 'Enter ile 2. adıma geçmedi');
      if (await p.$('#kart #lesen-text')) hata('dinleme modu', 'metinsiz dinlemede metin görünüyor');
      await p.click('[data-dnm-hiz="0.75"]'); await p.click('[data-dnm="geri"]');
      (await kucukler(p, '#v-calis')).forEach(x => hata('dinleme modu ≥48', x));
      await p.click('.dn-mod-alt .btn.ana'); await p.waitForTimeout(80);   // → boşluklu metin
      const bl = await p.evaluate(() => Dinle.mod.blanks.map(b => b.form));
      if (!bl.length) hata('dinleme modu', 'boşluk yok');
      const inp = await p.$$('#kart .u-luecke');
      for (let i = 0; i < inp.length; i++) await inp[i].fill(i % 2 ? 'xxxyz' : bl[i]);
      await p.click('[data-dnm="kontrol"]'); await p.waitForTimeout(80);
      const pu = await p.evaluate(() => Dinle.mod.puan);
      if (pu.y !== bl.length || pu.x !== Math.ceil(bl.length / 2)) hata('dinleme modu', 'puan ' + JSON.stringify(pu));
      await p.click('[data-dnm="ileri"]'); await p.waitForTimeout(80);   // → metinle dinle
      const lw = await p.$('#kart #lesen-text .lw');
      if (lw) { await lw.click(); await p.waitForTimeout(60); if (await p.$eval('#lesen-wort', e => e.hidden)) hata('dinleme modu', 'kelimeye basınca anlam kutusu açılmadı'); }
      await p.click('[data-dnm="bitir"]'); await p.waitForTimeout(80);
      const l = await sonLog(p);
      if (!l || l.modus !== 'lesen' || l.id !== dw + ':dinle' || l.ergebnis !== 'gelesen' || !new RegExp(`^puan:${pu.x}/${pu.y} \\| hız:0.75`).test(l.notiz)) hata('dinleme modu', 'log ' + JSON.stringify(l));
      await p.click('[data-dnm="don"]'); await p.waitForTimeout(80);
      if ((await typ(p)) !== 'lesen') hata('dinleme modu', 'Okumaya dönmedi');
    }
  }

  if (p.hatalar.length) hata('sayfa', p.hatalar.slice(0, 5).join(' | '));
  await b.close();
  if (fehler.length) { console.log(fehler.join('\n')); console.log(`e2e_dinle: ${fehler.length} hata`); process.exit(1); }
  console.log('e2e_dinle: dinleme duman testi geçti');
})().catch(e => { console.error(e); process.exit(1); });
