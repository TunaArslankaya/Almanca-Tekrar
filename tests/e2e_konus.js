// Konuşma + telaffuz (js/konus.js) tarayıcı testi: node tests/e2e_konus.js
// Chromium sahte mikrofonla (--use-fake-device-for-media-stream --use-fake-ui-for-media-stream: izin istemi kendiliğinden kabul, bip sesi);
// TTS sahte (headless'ta Almanca ses yok): iki de-DE ses, okuma 150 ms. Gerçek durumun KOPYASI (log/zustand.json yalnız okunur).
// Denetlenenler: ölçüm (analiz) sentetik dizide · tur yuvası soyle (S2): Türkçe → kayıt → Enter → Almanca görünür → bitti({ urteil: 'gemacht' }), log `sprechen;soyle:`
// gecikme / süre, hafıza (S.items) değişmez · hoer: doğru / yanlış, S.hoer, log `hoer;hoer:<kontrast>`, yanlışta kanca · mikrofon reddedilince aynı kartta hoer'e geçer,
// sonraki soyle null · bölüm: Kalıplar (3 sn, log rm: zamanında), Teil 2 kısa 4/3/2 (3 tur log + IndexedDB), Shadowing (cümle gizlenir), Dinle, İlerleme tablosu ·
// Bugün'de "2 dk konuş" kartı bölümü açar · yatay kaydırma yok (390 px) · sayfa hatası 0.
const D = require('./surucu');
const path = require('path');
const fs = require('fs');
const os = require('os');

// sahte mikrofon sesi: konuşmaya benzer döngü (16 kHz WAV, 6 sn): 0,8 sn sessiz · 1,5 sn "ses" · 1,2 sn sessiz · 1,0 sn "ses" · 1,5 sn sessiz
// ("ses" = 180 + 270 Hz, 4 Hz hece dalgası); Chrome dosyayı döngüde çalar
function sahteSes() {
  const sr = 16000, parcalar = [[0.8, 0], [1.5, 1], [1.2, 0], [1.0, 1], [1.5, 0]], n = Math.round(parcalar.reduce((a, x) => a + x[0], 0) * sr);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  let i = 0;
  parcalar.forEach(([sn, ses]) => { for (let k = 0; k < Math.round(sn * sr); k++, i++) { const t = i / sr, a = ses ? 0.35 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t)) : 0; buf.writeInt16LE(Math.round(32767 * a * (0.6 * Math.sin(2 * Math.PI * 180 * t) + 0.4 * Math.sin(2 * Math.PI * 270 * t))), 44 + i * 2); } });
  const f = path.join(os.tmpdir(), 'konus_sahte_ses.wav');
  fs.writeFileSync(f, buf);
  return f;
}

const fehler = [];
const hata = m => fehler.push(m);
const bekle = ms => new Promise(r => setTimeout(r, ms));

async function sayfaAc(b, o) {
  const ctx = await b.newContext({ viewport: D.GORUNUM[o.mobil ? 'mobil' : 'masaustu'], isMobile: !!o.mobil, hasTouch: !!o.mobil, permissions: ['microphone'] });
  const p = await ctx.newPage();
  p.hatalar = [];
  p.on('pageerror', e => p.hatalar.push(e.message));
  await p.route(/fonts/, r => r.abort());
  await p.addInitScript(({ z }) => {
    if (!localStorage.getItem('__seed')) { if (z) localStorage.setItem('almanca-tekrar-v1', z); localStorage.setItem('__seed', '1'); }
    // sahte TTS: iki Almanca ses, her okuma 150 ms
    const V = [{ name: 'Test Deutsch A', lang: 'de-DE', localService: true, default: false, voiceURI: 'a' }, { name: 'Test Deutsch B', lang: 'de-DE', localService: true, default: false, voiceURI: 'b' }];
    window.__okunan = [];
    const ss = { getVoices: () => V, speaking: false, pending: false, cancel() { this.speaking = false; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
      speak(u) { window.__okunan.push(u.text); setTimeout(() => { u.onstart && u.onstart(); setTimeout(() => { u.onend && u.onend(); }, 150); }, 10); } };
    Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.rate = 1; this.voice = null; };
  }, { z: o.zustand || null });
  await p.goto(D.URL);
  await p.waitForFunction(() => !!window.__tekrar && !!window.Konus, null, { timeout: 8000 });
  await p.waitForTimeout(300);
  p.ctx = ctx;
  return p;
}
const sonLog = (p, f) => p.evaluate(f => { const l = window.__tekrar.S.log; for (let i = l.length - 1; i >= 0; i--) if (new Function('e', 'return ' + f)(l[i])) return l[i]; return null; }, f);
async function bekleKosul(p, fn, arg, ms) { try { await p.waitForFunction(fn, arg, { timeout: ms || 8000 }); return true; } catch (e) { return false; } }

(async () => {
  const pw = D.playwright();
  if (!pw) { console.log('Playwright yok: test atlandı'); return; }
  const b = await pw.chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--use-file-for-fake-audio-capture=' + sahteSes(), '--autoplay-policy=no-user-gesture-required'] });
  const z = D.zustandOku();
  const p = await sayfaAc(b, { zustand: z });

  // ---- 1) ölçüm: sentetik RMS dizisi (50 ms): 1 sn sessiz, 2 sn ses, 1,2 sn sessiz, 1 sn ses, 0,3 sn sessiz, 0,5 sn ses, 0,5 sn sessiz
  const o = await p.evaluate(() => {
    const f = [], ek = (n, v) => { for (let i = 0; i < n; i++) f.push(v); };
    ek(20, 0.004); ek(40, 0.1); ek(24, 0.004); ek(20, 0.1); ek(6, 0.004); ek(10, 0.1); ek(10, 0.004);
    return Konus._analiz(f, 50);
  });
  if (o.gecikme !== 1000) hata(`analiz gecikme ${o.gecikme} (1000)`);
  if (o.duraklama !== 1) hata(`analiz duraklama ${o.duraklama} (1)`);
  if (o.akis !== 2000) hata(`analiz akış ${o.akis} (2000)`);
  if (Math.abs(o.oran - 0.7) > 0.01) hata(`analiz oran ${o.oran} (0,7)`);
  const bos = await p.evaluate(() => Konus._analiz(new Array(40).fill(0.003), 50));
  if (bos.gecikme !== null) hata('sessiz dizide ses bulundu');

  // ---- 2) tur yuvası: soyle (bölüm ekranı açıkken kartın üstüne çizilir; uygulama kancası D ajanının)
  await p.evaluate(() => window.__tekrar.starte('sprechen'));
  await p.waitForTimeout(300);
  const ses = await p.evaluate(() => Konus.sesVar());
  if (!ses.soyle || !ses.hoer) hata(`sesVar ${JSON.stringify(ses)}`);
  const itemsOnce = await p.evaluate(() => JSON.stringify(window.__tekrar.S.items));
  const soyleVar = await p.evaluate(() => {
    const q = Konus.turSorusu({}, { tur: 'ses', alt: 'soyle', kaynak: 'ses' });
    if (!q) return false;
    window.__knSonuc = null; window.__knQ = q;
    q.render(document.querySelector('#kart'), r => { window.__knSonuc = r; });
    return { alt: q.alt, id: q.id };
  });
  if (!soyleVar) hata('turSorusu soyle null (bildiği kelime / cümle yok mu?)');
  else {
    if (!await bekleKosul(p, () => /dinliyorum|konuşuyorsun/.test((document.querySelector('.kn-soyle .kn-not') || {}).textContent || ''))) hata('soyle: kayıt başlamadı');
    const tr = await p.evaluate(() => (document.querySelector('.kn-tr') || {}).textContent || '');
    if (!tr.trim()) hata('soyle: Türkçe cümle yok');
    if (await p.evaluate(() => !document.querySelector('.kn-cevap').hidden)) hata('soyle: Almanca kayıttan önce görünüyor');
    // ses gelir, sessizlikte kendiliğinden biter; bitmediyse Enter
    if (!await bekleKosul(p, () => { const c = document.querySelector('.kn-cevap'); return c && !c.hidden; }, null, 4500)) await p.keyboard.press('Enter');
    if (!await bekleKosul(p, () => { const c = document.querySelector('.kn-cevap'); return c && !c.hidden && !!c.querySelector('.kn-de'); })) hata('soyle: kayıt sonrası Almanca görünmedi');
    if (!await bekleKosul(p, () => !!window.__knSonuc, null, 12000)) hata('soyle: bitti çağrılmadı');
    else {
      const r = await p.evaluate(() => window.__knSonuc);
      if (r.urteil !== 'gemacht') hata(`soyle bitti urteil ${r.urteil}`);
      if (!/^kayıt:\d+sn$/.test(r.antwort || '')) hata(`soyle antwort ${r.antwort}`);
    }
    const e = await sonLog(p, "e.modus === 'sprechen' && /^soyle:/.test(e.id)");
    if (!e) hata('soyle log satırı yok');
    else {
      if (e.ergebnis !== 'gemacht') hata('soyle log ergebnis ' + e.ergebnis);
      if (!/^gecikme:[\d.]+sn \| süre:[\d.]+sn \| konuşma:[\d.]+sn/.test(e.notiz)) hata('soyle notiz (ses algılanmalı) ' + e.notiz);
      if (!/kaynak:tur/.test(e.notiz)) hata('soyle notiz kaynak yok');
      if (!e.loesung || !e.frage) hata('soyle log frage / loesung boş');
    }
    const okunan = await p.evaluate(() => window.__okunan.slice(-3));
    if (okunan.length < 2) hata('soyle: doğrusu okunmadı (ABA)');
    if (await p.evaluate(() => JSON.stringify(window.__tekrar.S.items)) !== itemsOnce) hata('soyle hafızaya (S.items) yazdı');
  }

  // ---- 3) hoer: doğru ve yanlış
  for (const dogruMu of [true, false]) {
    const h = await p.evaluate(dg => {
      const q = Konus.turSorusu({}, { tur: 'ses', alt: 'hoer', kaynak: 'ses' });
      if (!q) return null;
      window.__knSonuc = null;
      q.render(document.querySelector('#kart'), r => { window.__knSonuc = r; });
      return { k: q.veri.k, dogru: q.veri.dogru, tus: String((dg ? q.veri.dogru : 1 - q.veri.dogru) + 1), d0: ((window.__tekrar.S.hoer || {})[q.veri.k] || {}).d || 0, y0: ((window.__tekrar.S.hoer || {})[q.veri.k] || {}).y || 0 };
    }, dogruMu);
    if (!h) { hata('turSorusu hoer null'); break; }
    await p.waitForTimeout(250);
    if (dogruMu) await p.keyboard.press(h.tus);
    else await p.click(`.kn-sik[data-i="${+h.tus - 1}"]`);
    if (!await bekleKosul(p, () => !!window.__knSonuc)) { hata('hoer: bitti çağrılmadı'); continue; }
    const r = await p.evaluate(() => window.__knSonuc);
    if (r.urteil !== (dogruMu ? 'richtig' : 'falsch')) hata(`hoer urteil ${r.urteil} (${dogruMu ? 'richtig' : 'falsch'})`);
    const st = await p.evaluate(k => window.__tekrar.S.hoer[k], h.k);
    if (dogruMu ? st.d !== h.d0 + 1 : st.y !== h.y0 + 1) hata(`S.hoer sayımı ${JSON.stringify(st)}`);
    const e = await sonLog(p, "e.modus === 'hoer'");
    if (!e || e.id !== 'hoer:' + h.k || e.ergebnis !== (dogruMu ? 'richtig' : 'falsch') || !/^cift:.+ \| ses:.+ \| dinleme:\d+ \| sek:\d+ \| kaynak:tur$/.test(e.notiz)) hata('hoer log ' + JSON.stringify(e));
    if (!dogruMu && h.k !== 'vurgu' && !await p.$('.kn-kanca')) hata('hoer yanlışta kanca yok');
  }

  // ---- 4) bölüm: Kalıplar
  await p.evaluate(() => window.__tekrar.starte('sprechen'));
  await p.click('[data-kn-sekme="rm"]');
  if (!await bekleKosul(p, () => !!document.querySelector('.kn-rm') && /dinliyorum|konuşuyorsun/.test(document.querySelector('.kn-rm .kn-not').textContent))) hata('Kalıplar: kayıt başlamadı');
  if (!await bekleKosul(p, () => { const c = document.querySelector('.kn-rm .kn-cevap'); return c && !c.hidden; }, null, 5000)) await p.keyboard.press('Enter');
  if (!await bekleKosul(p, () => { const c = document.querySelector('.kn-rm .kn-cevap'); return c && !c.hidden; })) hata('Kalıplar: cevap görünmedi');
  const rm = await sonLog(p, "e.modus === 'sprechen' && /^rm:sprechen\\d:\\d+$/.test(e.id)");
  if (!rm || !/zamanında:[01]/.test(rm.notiz) || !rm.loesung) hata('Kalıplar log ' + JSON.stringify(rm));
  await p.keyboard.press('Enter');
  if (!await bekleKosul(p, () => /2\/8/.test((document.querySelector('.kn-rm .kn-ust') || {}).textContent || ''))) hata('Kalıplar: sıradaki kalıba geçmedi');

  // ---- 5) bölüm: Teil 2 kısa 4/3/2
  const arsiv0 = await p.evaluate(() => Konus._arsiv().then(l => l.length));
  await p.click('[data-kn-sekme="teil2"]');
  await p.click('[data-kn="mod"][data-m="kisa"]');
  await p.keyboard.press('Enter');   // plan
  if (!await bekleKosul(p, () => !!document.querySelector('.kn-not-alani'))) hata('Teil 2: plan ekranı yok');
  await p.fill('.kn-not-alani', 'Auto teuer, Bus, Fahrrad');
  await p.click('[data-kn="tur"]');
  for (let t = 1; t <= 3; t++) {
    if (!await bekleKosul(p, t => /\d\. tur/.test((document.querySelector('.kn-t2 .kn-ust') || {}).textContent || '') && document.querySelector('.kn-t2 .kn-ust').textContent.includes(t + '. tur') && /konuş/.test(document.querySelector('.kn-t2 .kn-not').textContent), t)) { hata(`Teil 2: ${t}. tur başlamadı`); break; }
    if (await p.$('.kn-not-alani')) hata('Teil 2: konuşurken notlar görünüyor');
    await p.waitForTimeout(t === 1 ? 6500 : 1300);   // 1. tur bir döngü (ses + duraklama) boyunca
    await p.keyboard.press('Enter');
    if (!await bekleKosul(p, () => !!document.querySelector('.kn-t2 .kn-tablo'))) { hata(`Teil 2: ${t}. tur sonrası tablo yok`); break; }
    if (t < 3) { await p.keyboard.press('Enter'); }
  }
  const t2 = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'sprechen' && /^teil2:\d+:t[123]$/.test(e.id)).slice(-3));
  if (t2.length !== 3) hata(`Teil 2 log ${t2.length} satır (3)`);
  if (t2[0] && !(/oran:%([1-9]\d*)/.test(t2[0].notiz) && /duraklama:[1-9]/.test(t2[0].notiz) && /akış:[1-9]/.test(t2[0].notiz) && !/gecikme:yok/.test(t2[0].notiz))) hata('Teil 2 1. tur ölçümü (ses, ≥ 1 sn duraklama, akış bekleniyordu): ' + t2[0].notiz);
  t2.forEach((e, i) => { if (!/^gecikme:.+ \| süre:[\d.]+sn \| konuşma:[\d.]+sn \| oran:%\d+ \| duraklama:\d+ \| akış:[\d.]+sn \| mod:kisa \| tur:\d\/3 \| hedef:\d+sn/.test(e.notiz)) hata('Teil 2 notiz ' + e.notiz); if (!e.notiz.includes(`tur:${i + 1}/3`)) hata('Teil 2 tur sırası ' + e.notiz); });
  if (!await p.evaluate(() => /4\/3\/2 bitti/.test(document.querySelector('#kart').textContent))) hata('Teil 2: özet yok');
  await p.waitForTimeout(400);
  const arsiv1 = await p.evaluate(() => Konus._arsiv().then(l => l.length));
  if (arsiv1 - arsiv0 !== 3) hata(`IndexedDB arşivi ${arsiv1 - arsiv0} kayıt (3)`);

  // ---- 6) bölüm: Shadowing (dinledikten sonra cümle gizlenir)
  await p.click('[data-kn-sekme="shadow"]');
  if (await p.$('.kn-shadow')) {
    await p.keyboard.press('Enter');
    if (!await bekleKosul(p, () => document.querySelector('.kn-sh-cumle').classList.contains('kn-gizli'))) hata('Shadowing: cümle gizlenmedi');
    await bekleKosul(p, () => /sen|konuşuyorsun/.test(document.querySelector('.kn-shadow .kn-not').textContent));
    if (!await bekleKosul(p, () => !document.querySelector('.kn-shadow .kn-cevap').hidden, null, 4000)) await p.keyboard.press('Enter');
    if (!await bekleKosul(p, () => !document.querySelector('.kn-sh-cumle').classList.contains('kn-gizli') && !document.querySelector('.kn-shadow .kn-cevap').hidden)) hata('Shadowing: sonuç yok');
    const sh = await sonLog(p, "e.modus === 'sprechen' && /^shadow:/.test(e.id)");
    if (!sh || !/model:[\d.]+sn/.test(sh.notiz)) hata('Shadowing log ' + JSON.stringify(sh));
  } else hata('Shadowing ekranı yok');

  // ---- 7) bölüm: Dinle (1 soru) ve İlerleme
  await p.click('[data-kn-sekme="hoer"]');
  await p.waitForTimeout(200);
  await p.keyboard.press('1');
  const bh = await sonLog(p, "e.modus === 'hoer'");
  if (!bh || !/kaynak:bolum/.test(bh.notiz)) hata('Dinle (bölüm) log ' + JSON.stringify(bh));
  await p.click('[data-kn-sekme="ilerleme"]');
  if (!await bekleKosul(p, () => document.querySelectorAll('.kn-ilerleme .kn-tablo tbody tr').length >= 1)) hata('İlerleme: haftalık tablo boş');
  if (!await bekleKosul(p, () => document.querySelectorAll('.kn-arsiv-satir').length >= 3)) hata('İlerleme: kayıt arşivi listesi yok');

  // ---- 8) Bugün kartı
  await p.evaluate(() => { location.hash = ''; });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const ana = await p.$('#ana .kn-ana');
  if (!ana) hata('Bugün: "2 dk konuş" kartı yok');
  else {
    const sek = await ana.getAttribute('data-kn-ana');
    await ana.click();
    await p.waitForTimeout(400);
    const acik = await p.evaluate(() => !document.querySelector('#v-calis').hidden && !!document.querySelector('.kn-sekme .chip.aktif'));
    const aktifSek = await p.evaluate(() => (document.querySelector('.kn-sekme .chip.aktif') || {}).dataset || {});
    if (!acik) hata('Bugün kartı Konuşma bölümünü açmadı');
    else if ((sek === 'teil2k' ? 'teil2' : sek) !== aktifSek.knSekme) hata(`Bugün kartı sekmesi ${aktifSek.knSekme} (${sek})`);
  }

  // ---- 9) mikrofon reddi: soyle aynı kartta hoer'e geçer, sonraki soyle null
  const red = await p.evaluate(async () => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error('hayır'), { name: 'NotAllowedError' }));
    const q = Konus.turSorusu({}, { tur: 'ses', alt: 'soyle' });
    if (!q) return { yok: true };
    q.render(document.querySelector('#kart'), () => {});
    await new Promise(r => setTimeout(r, 400));
    return { alt: q.alt, hoerKart: !!document.querySelector('.kn-hoer'), sonra: Konus.turSorusu({}, { tur: 'ses', alt: 'soyle' }) === null };
  });
  if (red.yok) hata('ret testi: soyle sorusu yok');
  else if (red.alt !== 'hoer' || !red.hoerKart || !red.sonra) hata('mikrofon reddi ' + JSON.stringify(red));

  if (p.hatalar.length) hata('sayfa hataları: ' + p.hatalar.join(' | '));
  const ornek = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'sprechen' || e.modus === 'hoer').slice(-12).map(e => `${e.modus};${e.id};${e.ergebnis};${e.notiz}`));
  if (process.env.AYRINTI) console.log(ornek.join('\n'));

  // ---- 10) mobil: yatay kaydırma yok (Teil 2 seçimi, İlerleme)
  const m = await sayfaAc(b, { zustand: z, mobil: true });
  await m.evaluate(() => window.__tekrar.starte('sprechen'));
  for (const s of ['teil2', 'ilerleme', 'rm', 'hoer']) {
    await m.click(`[data-kn-sekme="${s}"]`);
    await m.waitForTimeout(250);
    const t = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (t > 1) hata(`mobil ${s}: yatay taşma ${t} px`);
  }
  if (m.hatalar.length) hata('mobil sayfa hataları: ' + m.hatalar.join(' | '));
  await b.close();

  if (fehler.length) { console.log('HATA (' + fehler.length + '):\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log('e2e_konus: tamam (ölçüm, soyle, hoer, mikrofon reddi, Kalıplar, Teil 2 4/3/2 + arşiv, Shadowing, Dinle, İlerleme, Bugün kartı, mobil)');
})().catch(e => { console.error(e); process.exit(1); });
