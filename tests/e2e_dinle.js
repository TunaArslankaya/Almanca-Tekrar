// Dinleme kalıntısı yok (Playwright gerekir): node tests/e2e_dinle.js
// 14.11 (Tuna: "dinleme aşırı zor, dinleme alıştırması kalksın"): turdaki ses yuvası (duy / hoer), günlük dikte, Okuma'da DW Dinleme modu,
// sprint Beceri bloğundaki "Dinleme · DW" günü, Ayarlar'daki "Sesli sorular" ve Gramer'deki dinle (dikte) türü kaldırıldı; js/dinle.js silindi.
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur), 390×844 telefon. Denetlenenler:
// window.Dinle yok · Ayarlar'da "Sesli sorular" yok, "Ses hızı" / "Almanca ses" duruyor · iki turda (sahte Almanca TTS sesiyle, S.einst.sesli = true
// eski kayıtta kalmış olsa da) ses sorusu, dikte, duy / hoer log satırı yok · Okuma'da DW mp3 oynatıcı var, Dinleme modu düğmesi yok ·
// sprint açıkken dört gün Bugün'de "Dinleme" bloğu yok · Gramer tekrar setinde dinle türü yok · tanıtımda seslendirme (sprich) duruyor ·
// konuşma kalıntısı yok (7.11: window.Konus, Bugün kartı, Diğer satırı, Prüfung Sprechen) · Prüfung Lesen Teil 3 "her ilan bir kez" ·
// Bugün / tur / Okuma / Diğer / Ayarlar / Prüfung sayfalarında sayfa hatası ve konsol hatası 0.
const D = require('./surucu');

const fehler = [];
const hata = (ad, m) => { if (fehler.length < 60) fehler.push(`[${ad}] ${m}`); };

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: atlandı'); return; }
  const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
  const konsol = [];
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load resource|ERR_|favicon/i.test(m.text())) konsol.push(m.text()); });
  await p.route(/\.mp3/, r => r.abort());   // DW sesi ağdan çekilmesin (oynatıcı hatasız açılmalı)
  // sahte TTS (iki Almanca ses): seslendirme çalışır, ama dinleme sorusu gelmemeli
  await p.evaluate(() => {
    const V = [{ name: 'Test Deutsch A', lang: 'de-DE', localService: true, default: false, voiceURI: 'a' }, { name: 'Test Deutsch B', lang: 'de-DE', localService: true, default: false, voiceURI: 'b' }];
    window.__okunan = [];
    const ss = { getVoices: () => V, speaking: false, pending: false, cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
      speak(u) { window.__okunan.push(u.text); setTimeout(() => { if (u.onstart) u.onstart(); setTimeout(() => { if (u.onend) u.onend(); }, 40); }, 10); } };
    Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.rate = 1; this.voice = null; };
  });

  // ---- modül ----
  const mod = await p.evaluate(() => ({ dinle: 'Dinle' in window, script: [...document.scripts].some(s => /dinle\.js|minimalpaare\.js/.test(s.src)), sesAc: 'sesAc' in window.__tekrar, kern: 'SES_ADIM' in window.__tekrar.Kern }));
  if (mod.dinle) hata('modül', 'window.Dinle hâlâ var');
  if (mod.script) hata('modül', 'index.html dinle.js / minimalpaare.js yüklüyor');
  if (mod.sesAc) hata('modül', '__tekrar.sesAc hâlâ var');
  if (mod.kern) hata('modül', 'Kern.SES_ADIM hâlâ var');

  // ---- Bugün ----
  await p.click('.alt-nav [data-v="ana"]'); await p.waitForTimeout(150);
  if (/Dinleme/.test(await p.evaluate(() => document.querySelector('#v-ana').innerText))) hata('bugün', '"Dinleme" yazısı var');

  // ---- Ayarlar ----
  await p.click('.alt-nav [data-v="diger"]'); await p.waitForTimeout(150);
  await p.click('#diger [data-git="ayar"]'); await p.waitForTimeout(200);
  const ay = await p.evaluate(() => ({ sesli: !!document.querySelector('#a-sesli'), yazi: /Sesli sorular/.test(document.body.innerText), hiz: !!document.querySelector('[data-ayar="seshiz"]'), sec: !!document.querySelector('#a-sesadi') }));
  if (ay.sesli || ay.yazi) hata('ayarlar', '"Sesli sorular" satırı var');
  if (!ay.hiz) hata('ayarlar', '"Ses hızı" yok (seslendirme için kalmalı)');
  if (!ay.sec) hata('ayarlar', '"Almanca ses" seçici yok (seslendirme için kalmalı)');

  // ---- tur: ses sorusu / dikte yok (eski kayıtta sesli açık kalmış olsa da) ----
  await p.evaluate(() => { window.__tekrar.S.einst.sesli = true; if (window.__tekrar.S.gs4) window.__tekrar.S.gs4.diktat = 0; });
  const logN0 = await p.evaluate(() => window.__tekrar.S.log.length);
  const turler = new Set();
  let tanitOkundu = false;
  for (let tur = 0; tur < 2; tur++) {
    await p.evaluate(() => window.__tekrar.starte('akis', 12));
    await p.waitForTimeout(150);
    for (let i = 0; i < 40; i++) {
      const s = await D.durum(p);
      turler.add(s.typ + ':' + s.tur);
      if (s.typ === 'sesTur' || s.typ === 'dinleMod') hata('tur', 'ses sorusu geldi: ' + s.typ);
      if (s.typ === 'akt' && s.tur !== 'metin') hata('tur', 'metin etkinliği dikte: ' + s.tur);
      if (s.tur === 'tanit') { await p.waitForTimeout(150); if (await p.evaluate(() => window.__okunan.length > 0)) tanitOkundu = true; }
      const r = await D.adim(p, { dogru: 0.8 });
      if (r.ad === 'turSonu' || r.ad === 'leer' || r.ad === 'yok') break;
      if (/^bilinmeyen/.test(r.ad)) { hata('tur', 'tanınmayan soru ' + r.ad); break; }
    }
    const sel = await p.evaluate(() => (window.__tekrar.ot.gecmis || []).filter(x => x.tur === 'ses' || x.bicim === 'diktat').length);
    if (sel) hata('tur', `oturum geçmişinde ${sel} ses / dikte adımı`);
  }
  const yeniLog = await p.evaluate(n => window.__tekrar.S.log.slice(n).filter(e => e.modus === 'duy' || e.modus === 'hoer' || /^diktat/.test(e.id || '') || /:dinle$/.test(e.id || '')).map(e => e.modus + ';' + e.id), logN0);
  if (yeniLog.length) hata('tur', 'dinleme log satırı: ' + yeniLog.slice(0, 3).join(' · '));
  const kern = await p.evaluate(() => {
    const T = window.__tekrar, K = T.Kern, S = T.S, t = Date.now(), out = [];
    const d = { S, kap: 20, bonus: 0, donus: false, ekYeni: 0, gunSay: { kok: 0, kokYeni: 0, metin: 0, yoklama: 0 } };
    for (let a = 0; a < 12; a++) { const r = K.sec(d, { adim: a, boy: 12, kuyruk: [], gecmis: [], parti: true, metin: a !== 8, kurtarma: true, sesVar: true, gramVar: false }, t, Math.random); out.push(r.tur + (r.diktat ? ':diktat' : '')); }
    return out;
  });
  if (kern.some(x => x === 'ses' || /diktat/.test(x))) hata('Kern.sec', 'ses / dikte seçimi: ' + kern.join(' '));
  if (!tanitOkundu && turler.has('tanit:tanit')) hata('seslendirme', 'tanıtımda kelime seslendirilmedi');

  // ---- Okuma: mp3 oynatıcı var, Dinleme modu yok ----
  const dw = await p.evaluate(() => { const L = window.__tekrar.LT.find(x => x.audio); return L ? L.id : null; });
  if (!dw) hata('okuma', 'sesli DW metni yok');
  else {
    await p.evaluate(id => window.__tekrar.lesenAc(id), dw); await p.waitForTimeout(150);
    const o = await p.evaluate(() => ({ audio: !!document.querySelector('#kart audio'), dm: !!document.querySelector('[data-act="dinle-modu"]'), yazi: /Dinleme modu/.test(document.querySelector('#kart').innerText) }));
    if (!o.audio) hata('okuma', 'DW mp3 oynatıcısı yok (kalmalı)');
    if (o.dm || o.yazi) hata('okuma', 'Dinleme modu düğmesi var');
  }

  // ---- sprint Beceri: dört gün "Dinleme" bloğu yok ----
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.evaluate(() => { const S = window.__tekrar.S; S.sprint = { hedef: '2027-01-31', son_yeni: '2027-01-27', acik: true }; });
  const beceriler = new Set();
  for (let g = 0; g < 4; g++) {
    await p.click('.alt-nav [data-v="diger"]'); await p.waitForTimeout(80);
    await p.click('.alt-nav [data-v="ana"]'); await p.waitForTimeout(150);
    const ana = await p.evaluate(() => ({ t: document.querySelector('#v-ana').innerText, blok: [...document.querySelectorAll('#v-ana [data-blok]')].map(x => x.dataset.blok) }));
    if (/Dinleme/.test(ana.t) || ana.blok.includes('dinle')) hata('sprint', `gün ${g}: Dinleme bloğu var (${ana.blok.join(',')})`);
    ana.blok.filter(x => x !== 'kelime' && x !== 'gram').forEach(x => beceriler.add(x));
    await D.ileri(p, D.DAY);
  }
  if (!beceriler.size) hata('sprint', 'Beceri bloğu görünmedi');

  // ---- Gramer: dinle türü seçilmez (ses olsa da) ----
  const gr = await p.evaluate(() => {
    const G = window.Gramer, S = window.__tekrar.S;
    const ids = Object.keys(G.GR).filter(id => (G.GR[id].uebungen || []).some(u => u.tur === 'dinle')).slice(0, 4);
    S.gram = S.gram || { konu: {}, ghost: {} }; S.gram.konu = S.gram.konu || {};
    let dinle = 0, n = 0;
    ids.forEach(id => { if (!S.gram.konu[id]) S.gram.konu[id] = { karte: null, teil: {}, gesehen: {}, lern: null, acildi: 1 }; for (let i = 0; i < 40; i++) { const set = G.tekrarSeti(id); n += set.length; dinle += set.filter(u => u.tur === 'dinle').length; } });
    return { ids: ids.length, n, dinle };
  });
  if (!gr.ids) hata('gramer', 'dinle türü olan konu bulunamadı (içerik dosyaları silinmemeli)');
  if (gr.dinle) hata('gramer', `tekrar setinde ${gr.dinle} dinle alıştırması`);

  // ---- konuşma kalıntısı yok (7.11) ----
  if (await p.evaluate(() => 'Konus' in window)) hata('konuşma', 'window.Konus hâlâ var');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.click('.alt-nav [data-v="ana"]'); await p.waitForTimeout(150);
  if (/data-kn-ana|2 dk konuş/.test(await p.evaluate(() => document.querySelector('#v-ana').innerHTML))) hata('konuşma', 'Bugün\'de "2 dk konuş" kartı var');
  await p.click('.alt-nav [data-v="diger"]'); await p.waitForTimeout(150);
  if (/Konuşma/.test(await p.evaluate(() => document.querySelector('#diger').innerText))) hata('konuşma', 'Diğer\'de Konuşma satırı var');
  await p.evaluate(() => window.__tekrar.starte('pruefung')); await p.waitForTimeout(150);
  const pr = await p.evaluate(() => document.querySelector('#kart').innerHTML);
  if (/data-p="sprechen"|Sprechen/.test(pr)) hata('konuşma', 'Prüfung\'da Sprechen kartı / taktiği var');
  // ---- Prüfung Lesen Teil 3 (zu): "Jede Anzeige nur einmal" — seçilen ilan diğer maddelerde soluk (7.11) ----
  await p.click('#kart [data-p="lesen-tam"]'); await p.waitForTimeout(150);
  await p.click('#kart [data-p="teil"][data-teil="3"]').catch(() => hata('prüfung', 'Teil 3 sekmesi yok')); await p.waitForTimeout(120);
  const zu = await p.evaluate(() => {
    const b = [...document.querySelectorAll('#kart .gl-opt[data-v="a"]')];
    if (b.length < 2) return null;
    b[0].click();
    const k0 = b[0].dataset.k, digerA = [...document.querySelectorAll('#kart .gl-opt[data-v="a"]')].filter(x => x.dataset.k !== k0);
    const sifir = [...document.querySelectorAll('#kart .gl-opt[data-v="0"]')];
    return { soluk: digerA.every(x => x.classList.contains('pr-kullanildi')), kendi: document.querySelector(`#kart .gl-opt[data-k="${k0}"][data-v="a"]`).classList.contains('pr-kullanildi'), sifir: sifir.some(x => x.classList.contains('pr-kullanildi')) };
  });
  if (!zu) hata('prüfung', 'Teil 3 seçenekleri yok');
  else if (!zu.soluk || zu.kendi || zu.sifir) hata('prüfung', 'Teil 3 kullanılan ilan işareti ' + JSON.stringify(zu));
  await p.evaluate(() => { if (window.Pruefung && Pruefung.reset) Pruefung.reset(); });

  if (p.hatalar.length) hata('sayfa', p.hatalar.slice(0, 5).join(' | '));
  if (konsol.length) hata('konsol', konsol.slice(0, 5).join(' | '));
  await b.close();
  if (fehler.length) { console.log(fehler.join('\n')); console.log(`e2e_dinle: ${fehler.length} hata`); process.exit(1); }
  console.log(`görülen soru türleri: ${[...turler].join(' ')} · sprint beceri günleri: ${[...beceriler].join(', ')}`);
  console.log('e2e_dinle: dinleme kalıntısı yok');
})().catch(e => { console.error(e); process.exit(1); });
