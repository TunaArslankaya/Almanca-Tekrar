// Arayüz DOM denetimi (Playwright gerekir): node tests/e2e_ui.js
// 390×844 telefon, gerçek durumun KOPYASI (log/zustand.json yalnız okunur). Denetlenenler (spesifikasyon §7, M4):
// güven kartı ilk açılışta var, ikincide yok · alt gezintide 4 düğme (Bugün, Kelimeler, İlerleme, Diğer) · Bugün'de tek birincil
// "Başla" ve vadeli / borç sayısı yok · yatay kaydırma yok · etkileşimli öğeler ≥ 48 px · şıklar / artikel düğmeleri / yazma kutusu
// görünür yüksekliğin ≥ %45'inde · .devam-btn görünür alanın alt %30'unda · #v-calis açıkken #toast hiç görünmez (kuyruk tur sonunda)
// · Kelimeler ve tur sonu çiplerinde her isim artikelli · doğruluk "%NN" · prefers-reduced-motion'da konfeti canvas'ı yok · sayfa hatası 0.
// 6.11 (S5 / S6): seçmeli şıklar gizli başlar (açılmadan seçim yok, Enter açar), ikiz şık yok, log notiz 'şık:a/b/c'; yanlışta Devam kilitli
// (hemen Enter geçmez), yazmada "doğrusunu bir kez yaz" kutusu (yazılmadan Devam yok, log 'düzeltti'); tanıtım kartında Devam ≥ 4 sn kapalı.
const D = require('./surucu');

const fehler = [];
const hata = (ad, m) => { if (fehler.length < 60) fehler.push(`[${ad}] ${m}`); };
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// görünür etkileşimli öğeler (kök içinde) ≥ 48 px; metin içi boşluk kutuları (.u-luecke) hariç
const kucukler = (p, kok) => p.evaluate(kok => {
  const r = [];
  document.querySelectorAll(`${kok} button, ${kok} input:not([type=hidden]), ${kok} select, ${kok} summary`).forEach(e => {
    if (e.closest('[hidden]') || e.classList.contains('u-luecke')) return;
    const b = e.getBoundingClientRect(), st = getComputedStyle(e);
    if (!b.width || !b.height || st.visibility === 'hidden' || st.display === 'none') return;
    // gizli onay kutusu (anahtar): dokunma alanı kutunun kendisi
    if (b.height < 47.5 || b.width < 47.5) r.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${[...e.classList].join('.')} "${(e.innerText || e.value || '').trim().slice(0, 20)}" ${Math.round(b.width)}×${Math.round(b.height)}`);
  });
  return r;
}, kok);
const yatay = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
// sabit (position: fixed) görünür öğeler yan kenarlardan ≥ 16 px içeride (alt gezinti / tam genişlik katmanlar hariç)
const sabitTasma = (p, kok) => p.evaluate(kok => {
  const r = [];
  document.querySelectorAll(`${kok} *`).forEach(e => {
    const st = getComputedStyle(e);
    if (st.position !== 'fixed' || st.display === 'none' || e.closest('[hidden]')) return;
    const b = e.getBoundingClientRect();
    if (!b.width || !b.height || b.width >= innerWidth - 1) return;
    if (b.left < 15.5 || b.right > innerWidth - 15.5) r.push(`${e.tagName.toLowerCase()}.${[...e.classList].join('.')} ${Math.round(b.left)}–${Math.round(b.right)} / ${innerWidth}`);
  });
  return r;
}, kok);
const toastAcik = p => p.evaluate(() => { const t = document.querySelector('#toast'); return !!(t && !t.hidden && t.classList.contains('acik') && getComputedStyle(t).opacity !== '0'); });
const vh = p => p.evaluate(() => window.visualViewport ? visualViewport.height : innerHeight);

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: atlandı'); return; }
  const zustand = D.zustandV3();   // göç + güven kartı: dondurulmuş v3 kaydı
  const p = await D.sayfa(b, { mobil: true, zustand });
  await p.waitForTimeout(300);

  // ---- Bugün ----
  if (!(await p.$('#guven-kart'))) hata('güven', 'ilk açılışta güven kartı yok');
  const nav = await p.$$eval('.alt-nav button', l => l.map(x => x.innerText.trim()));
  if (nav.join('|') !== 'Bugün|Kelimeler|İlerleme|Diğer') hata('gezinti', `alt gezinti: ${nav.join(', ')}`);
  const ana = await p.evaluate(() => {
    const v = document.querySelector('#v-ana');
    const birincil = [...v.querySelectorAll('.btn.ana')].filter(e => e.getClientRects().length && !e.closest('[hidden]'));
    const kopya = v.cloneNode(true); kopya.querySelectorAll('.guven-kart').forEach(x => x.remove());
    return { birincil: birincil.map(e => e.innerText.trim()), metin: kopya.innerText };
  });
  if (ana.birincil.length !== 1 || !/Başla|İlk turun|Devam et|Bonus tur|Sırada:/.test(ana.birincil[0] || '')) hata('bugün', `birincil düğmeler: ${JSON.stringify(ana.birincil)}`);
  // gerçek kayıtta günün hedefi dolmuşsa (bugün zaten çalışmış) düğme "Bonus tur" olur (sprintte: sıradaki blok)
  if (!/Başla|Bonus tur|Sırada:/.test(ana.birincil[0] || '')) hata('bugün', `gerçek kopyada düğme "Başla" / "Bonus tur" değil: ${ana.birincil[0]}`);
  // aynı satırda sayı + kelime (satır sonu sayılmaz: seri pili "🔥 2" + "Tekrar hoş geldin" yanlış yakalanmasın)
  const borc = /\d+[ \t]*(vadeli|tekrar|kart|borç|birikme|bekleyen)\b/i.exec(ana.metin);
  if (borc) hata('bugün', `vadeli / borç sayısı görünüyor: "${borc[0]}"`);
  if (/\d ?%/.test(ana.metin)) hata('bugün', 'yüzde "58%" biçiminde');
  if (await yatay(p) > 1) hata('bugün', 'yatay kaydırma');
  (await sabitTasma(p, '#v-ana')).forEach(x => hata('bugün sabit öğe taşıyor', x));
  { const bb = await p.evaluate(() => { const e = document.querySelector('.basla-sabit'); if (!e) return null; const b = e.getBoundingClientRect(); return { r: b.right, w: innerWidth }; });
    if (bb && bb.r > bb.w - 16) hata('bugün', `Başla sağdan taşıyor: sağ ${Math.round(bb.r)} / ${bb.w}`); }
  (await kucukler(p, '#v-ana')).forEach(x => hata('bugün ≥48', x));
  (await kucukler(p, '.alt-nav')).forEach(x => hata('gezinti ≥48', x));

  // ---- Kelimeler: her isim artikelli ----
  await p.click('.alt-nav [data-v="liste"]'); await p.waitForTimeout(200);
  const liste = await p.$$eval('#liste [data-oge]', l => l.map(x => ({ id: x.dataset.oge, de: x.querySelector('.de').innerText.trim() })));
  if (!liste.length) hata('kelimeler', 'liste boş');
  liste.filter(x => !/^[vwp]/.test(x.id)).forEach(x => { if (!/^(der|die|das) /.test(x.de)) hata('kelimeler', `artikelsiz isim: ${x.de}`); });
  for (const sek of ['ogren', '2', '0']) { await p.click(`#seviye-sekme [data-sekme="${sek}"]`); await p.waitForTimeout(80); }
  if (await yatay(p) > 1) hata('kelimeler', 'yatay kaydırma');
  (await kucukler(p, '#v-liste')).forEach(x => hata('kelimeler ≥48', x));
  await p.click('#liste [data-oge]'); await p.waitForTimeout(150);
  if (await p.$eval('#alt-sayfa', e => e.hidden)) hata('kelimeler', 'alt sayfa açılmadı');
  await p.keyboard.press('Escape'); await p.waitForTimeout(80);

  // ---- İlerleme, Diğer, Ayarlar ----
  await p.click('.alt-nav [data-v="gecmis"]'); await p.waitForTimeout(200);
  const il = await p.$eval('#v-gecmis', e => e.innerText);
  if (/\d ?%/.test(il)) hata('ilerleme', 'yüzde "58%" biçiminde');
  if (!/Artikel aynası/.test(il) || !/B1 yolu/.test(il)) hata('ilerleme', 'artikel aynası / B1 yolu yok');
  if ((await p.$eval('.isi', e => e.getBoundingClientRect().width)) > 461) hata('ilerleme', 'ısı haritası 460 px\'ten geniş');
  if (await yatay(p) > 1) hata('ilerleme', 'yatay kaydırma');
  await p.click('.alt-nav [data-v="diger"]'); await p.waitForTimeout(200);
  const diger = await p.$eval('#diger', e => e.innerText);
  ['Paketler', 'Fiil metni', 'Okuma', 'Yazma', 'Kalıplar', 'Artikel 60 sn', 'Gramer', 'Prüfung', 'Zayıflar', 'Serbest pratik', 'Geçmiş', 'Ayarlar'].forEach(x => { if (!diger.includes(x)) hata('diğer', `${x} yok`); });
  (await kucukler(p, '#v-diger')).forEach(x => hata('diğer ≥48', x));
  await p.click('#diger [data-git="ayar"]'); await p.waitForTimeout(200);
  if (!(await p.$eval('#v-ayar', e => !e.hidden))) hata('ayarlar', 'Diğer → Ayarlar açılmadı');
  (await kucukler(p, '#a-satirlar')).forEach(x => hata('ayarlar ≥48', x));
  if (await yatay(p) > 1) hata('ayarlar', 'yatay kaydırma');
  await p.click('.alt-nav [data-v="ana"]'); await p.waitForTimeout(200);

  // ---- tur ----
  await p.click('[data-act-ana="basla"]'); await p.waitForTimeout(250);
  await p.evaluate(() => window.__tekrar.toast('deneme tostu'));
  let turSonu = false, kontrol = 0, devam = 0, toastGoruldu = 0; const akt = {};
  for (let i = 0; i < 40 && !turSonu; i++) {
    const s = await D.durum(p);
    if (await toastAcik(p)) toastGoruldu++;
    if (s.tur === 'turSonu') { turSonu = true; break; }
    if (s.tur === 'leer' || s.tur === 'yok') break;
    const h = await vh(p);
    const ust = await p.evaluate(() => { const e = document.querySelector('#q-alt:not([hidden]) .mc-opt, #q-alt:not([hidden]) .art-btn, #q-alt:not([hidden]) #cevap, #q-alt:not([hidden]) [data-akt="pruef"]'); return e ? e.getBoundingClientRect().top : null; });
    // metin / dikte: odak düzeninde (q-alt), ä ö ü ß girdiye bağlı (global satır gizli)
    if (s.tur === 'metin' || s.tur === 'diktat') {
      akt[s.tur] = (akt[s.tur] || 0) + 1;
      const d = await p.evaluate(() => ({ qalt: !!document.querySelector('#q-alt:not([hidden])'), ic: !!document.querySelector('#q-alt .klavye.ic'), glob: !document.querySelector('#umlaut').hidden }));
      if (!d.qalt) hata('odak', `${s.tur}: #q-alt yok`);
      if (!d.ic || d.glob) hata('odak', `${s.tur}: ä ö ü ß girdiye bağlı değil (iç ${d.ic}, global ${d.glob})`);
    }
    if (ust != null) { kontrol++; if (ust < 0.45 * h) hata('odak', `${s.tur}: cevap kontrolü üst kenarı ${Math.round(ust)} < %45 (${Math.round(0.45 * h)})`); }
    if (await yatay(p) > 1) hata('odak', `${s.tur}: yatay kaydırma`);
    if (i < 14) (await kucukler(p, '#v-calis')).forEach(x => hata(`odak ≥48 (${s.tur})`, x));
    if (s.tur === 'tanit') {
      const r = await p.$eval('.devam-btn', e => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom }; });
      if (r.top < 0.7 * h || r.bottom > h + 1) hata('tanıtım', `Devam alt %30'da değil: ${Math.round(r.top)}–${Math.round(r.bottom)} / ${h}`);
    }
    await D.adim(p, { dogru: 0.7, rnd, artYanlis: 0.5, yakin: true,
      sonucCek: async () => {
        await p.waitForTimeout(120);
        if (await toastAcik(p)) toastGoruldu++;
        const r = await p.evaluate(() => { const e = document.querySelector('#sonuc .devam-btn'); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom }; });
        if (!r) return;
        devam++;
        if (r.top < 0.7 * h || r.bottom > h + 1) hata('sonuç', `Devam alt %30'da değil: ${Math.round(r.top)}–${Math.round(r.bottom)} / ${Math.round(h)}`);
        (await kucukler(p, '#sonuc')).forEach(x => hata('sonuç ≥48', x));
      } });
  }
  if (!turSonu) hata('tur', 'tur sonuna varılamadı');
  if (Object.keys(akt).length) console.log(`metin etkinliği ölçüldü: ${JSON.stringify(akt)}`);
  if (!kontrol) hata('odak', 'cevap kontrolü hiç ölçülmedi');
  if (!devam) hata('sonuç', 'sonuç panelinde Devam hiç ölçülmedi');
  if (toastGoruldu) hata('tost', `#v-calis açıkken #toast ${toastGoruldu} kez göründü`);
  if (turSonu) {
    await p.waitForTimeout(200);
    const ts = await p.evaluate(() => ({
      dogruluk: (document.querySelector('#ts-dogruluk') || {}).innerText,
      cipler: [...document.querySelectorAll('.ts-chip[data-id]')].map(x => ({ id: x.dataset.id, t: x.innerText.trim() })),
      notlar: (document.querySelector('.ts-notlar') || {}).innerText || '',
      metin: document.querySelector('#kart').innerText,
    }));
    if (!/^(%\d{1,3}|–)$/.test(ts.dogruluk || '')) hata('tur sonu', `doğruluk biçimi: "${ts.dogruluk}"`);
    ts.cipler.filter(x => !/^[vwp]/.test(x.id)).forEach(x => { if (!/^(der|die|das) /.test(x.t)) hata('tur sonu', `artikelsiz isim çipi: ${x.t}`); });
    if (!ts.notlar.includes('deneme tostu')) hata('tost', 'tur içindeki tost tur sonunda gösterilmedi');
    if (/\d ?%/.test(ts.metin)) hata('tur sonu', 'yüzde "58%" biçiminde');
    if (await toastAcik(p)) hata('tost', 'tur sonunda #toast açık');
    (await kucukler(p, '#v-calis')).forEach(x => hata('tur sonu ≥48', x));
    console.log(`tur sonu: doğruluk ${ts.dogruluk} · ${ts.cipler.length} çip · ${kontrol} soru ölçüldü · ${devam} sonuç paneli`);
  }
  // çıkışta kuyruk tost olarak gösterilir (Çalış kapalıyken)
  await p.click('#calis-kapat'); await p.waitForTimeout(200);

  // ---- ikinci açılış: güven kartı yok ----
  await p.waitForTimeout(6000);   // başsız Chromium + file://: art arda büyük localStorage yazımlarından hemen sonra yenilenince yazımlar kaybolabiliyor (diske işleme gecikmesi; 8.11 ölçüldü: 6 sn beklemeyle 6/6)
  await p.reload({ waitUntil: 'load' }); await p.waitForFunction(() => window.__tekrar && document.querySelector('#ana'), null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(800);
  if (await p.$('#guven-kart')) hata('güven', 'ikinci açılışta güven kartı hâlâ görünüyor');
  if (p.hatalar.length) hata('sayfa', p.hatalar.join(' | '));
  await p.ctx.close();

  // ---- tam cümle (B4): zor soru rozeti (yardım yok), kademeli yardım (ilk kelime → kelime bankası), sonuç paneli 390 px'e sığar ----
  {
    const c = await D.sayfa(b, { mobil: true });
    await c.evaluate(() => window.__tekrar.starte('akis')); await c.waitForTimeout(250);
    const id = await c.evaluate(() => Object.keys(SAETZE).find(id => window.__tekrar.gueltig(id + ':x') && SAETZE[id].some(x => x.tr && x.de.split(' ').length >= 6)));
    if (!(await c.evaluate(id => window.__tekrar.frageAc({ id, bicim: 'cumle', zor: true }), id))) hata('cümle', `zor soru açılmadı (${id})`);
    const z = await c.evaluate(() => ({ rozet: !!document.querySelector('.zor-rozet'), yardim: !!document.querySelector('[data-act="cumle-yardim"]'), gloss: /Yardım:/.test(document.querySelector('.q-ust').innerText), voll: !!window.__tekrar.aktuell.voll }));
    if (!z.voll) hata('cümle', 'zor cümle sorusu tam cümle değil');
    // zor soruda hedef kelimeye ipucu yok (rozet, yardım düğmesi yok); diğer bilinmeyen kelimelerin anlamı (glossen) görünür (26.10 karar)
    if (!z.rozet || z.yardim) hata('cümle', `zor soru: rozet ${z.rozet}, yardım düğmesi ${z.yardim}`);
    await c.evaluate(id => window.__tekrar.frageAc({ id, bicim: 'cumle' }), id); await c.waitForTimeout(100);
    await c.click('[data-act="cumle-yardim"]'); await c.click('[data-act="cumle-yardim"]'); await c.waitForTimeout(100);
    const y = await c.evaluate(() => { const a = window.__tekrar.aktuell; return { cip: document.querySelectorAll('.kb-chip').length, kelime: a.ziel.split(/\s+/).length, lv: a.ipucuLv, ip: a.ipucu, deger: document.querySelector('#cevap').value }; });
    if (y.cip !== y.kelime - 1 || y.lv !== 0 || y.ip !== 1 || !y.deger.trim()) hata('cümle', `kelime bankası: ${JSON.stringify(y)}`);
    (await kucukler(c, '#v-calis')).forEach(x => hata('cümle yardım ≥48', x));
    // kelime sırası bozuk cevap (ilk iki kelimenin yeri değişik)
    await c.evaluate(() => { const w = window.__tekrar.aktuell.ziel.split(' '); [w[0], w[1]] = [w[1], w[0]]; document.querySelector('#cevap').value = w.join(' '); });
    await c.press('#cevap', 'Enter'); await c.waitForTimeout(150);
    const s = await c.evaluate(() => ({ panel: !!document.querySelector('#sonuc .sonuc'), cfark: !!document.querySelector('#sonuc .cfark'), cumle: typeof G.cumleKontrol === 'function', yatay: document.documentElement.scrollWidth - innerWidth, tasma: [...document.querySelectorAll('#sonuc .cd, #sonuc .satir')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length }));
    if (!s.panel) hata('cümle', 'sonuç paneli yok');
    if (s.cumle && !s.cfark) hata('cümle', 'G.cumleKontrol var ama kelime kelime fark çizilmedi');
    if (s.yatay > 1 || s.tasma) hata('cümle', `sonuç paneli taşıyor (yatay ${s.yatay}, öğe ${s.tasma})`);
    (await kucukler(c, '#sonuc')).forEach(x => hata('cümle sonuç ≥48', x));
    if (await c.$('#duzelt-inp')) await c.fill('#duzelt-inp', await c.evaluate(() => window.__tekrar.aktuell.ziel));
    await c.click('#sonuc .devam-btn'); await c.waitForTimeout(150);
    const n = await c.evaluate(() => { const l = window.__tekrar.S.log; return (l[l.length - 1] || {}).notiz || ''; });
    if (!/bicim:cumle/.test(n) || !/yardım:ilk,banka/.test(n) || !/ipucu:0/.test(n) || /(^| )zor( |$)/.test(n)) hata('cümle', `log notiz: ${n}`);
    if (c.hatalar.length) hata('cümle sayfa', c.hatalar.join(' | '));
    console.log(`tam cümle: ${id} · banka ${y.cip} çip · cumleKontrol ${s.cumle ? 'var' : 'yok (eski yol)'} · ${n.split(' | ').slice(0, 2).join(' | ')}`);
    await c.ctx.close();
  }

  // ---- seçmeli (S5) ve sonuç paneli (S6) ----
  {
    const c = await D.sayfa(b, { mobil: false });
    await c.evaluate(() => window.__tekrar.starte('akis')); await c.waitForTimeout(250);
    const id = await c.evaluate(() => { const T = window.__tekrar; return Object.keys(T.byId).find(x => T.gueltig(x + ':x') && !T.byId[x].plOnly && T.byId[x].lemma.length >= 5); });
    // TR → DE seçmeli: gizli başlar, ikiz şık yok, şık id'leri soruda
    await c.evaluate(id => window.__tekrar.frageAc({ id, bicim: 'sec', b: 1 }), id);
    const m = await c.evaluate(() => { const a = window.__tekrar.aktuell, lem = o => o.t.replace(/^(der|die|das|sich) /, '').toLowerCase(); return { offen: !!a.offen, kapali: !!document.querySelector('#mc.kapali'), perde: !!document.querySelector('#mc-perde'), t: a.optionen.map(o => o.t), ikiz: new Set(a.optionen.map(lem)).size !== a.optionen.length, sik: a.sik }; });
    if (m.offen || !m.kapali || !m.perde) hata('seçmeli', `şıklar açık başladı: ${JSON.stringify(m)}`);
    if (m.ikiz) hata('seçmeli', `ikiz şık: ${m.t.join(' | ')}`);
    if (!/^[^/]+\/[^/]+\/[^/]+$/.test(m.sik || '')) hata('seçmeli', `şık id'leri: ${m.sik}`);
    (await kucukler(c, '#v-calis')).forEach(x => hata('seçmeli perde ≥48', x));
    await c.waitForTimeout(500);
    await c.keyboard.press('1'); await c.waitForTimeout(40);
    if (await c.evaluate(() => window.__tekrar.aktuell.done)) hata('seçmeli', 'şıklar açılmadan cevaplandı');
    await c.keyboard.press('Enter'); await c.waitForTimeout(60);
    if (!(await c.evaluate(() => window.__tekrar.aktuell.offen))) hata('seçmeli', 'Enter şıkları açmadı');
    await c.waitForTimeout(450);
    const yi = await c.evaluate(() => window.__tekrar.aktuell.optionen.findIndex(o => !o.ok));
    await c.keyboard.press(String(yi + 1)); await c.waitForTimeout(30);
    await c.keyboard.press('Enter'); await c.waitForTimeout(30);   // çift Enter: düzeltme atlanmasın
    const k1 = await c.evaluate(() => ({ islendi: !!window.__tekrar.aktuell.islendi, kilit: !!document.querySelector('#sonuc .devam-btn.kilitli[disabled]'), anlam: !!document.querySelector('#sonuc .sec-anlam') }));
    if (k1.islendi || !k1.kilit) hata('panel', `yanlışta hemen Enter geçti ya da kilit yok: ${JSON.stringify(k1)}`);
    if (!k1.anlam) hata('panel', 'seçilen yanlış şıkkın anlamı gösterilmedi');
    await c.waitForFunction(() => !document.querySelector('#sonuc .devam-btn[disabled]'), null, { timeout: 5000 }).catch(() => hata('panel', 'kilit açılmadı'));
    await c.keyboard.press('Enter'); await c.waitForTimeout(120);
    const n1 = await c.evaluate(() => { const l = window.__tekrar.S.log; return (l[l.length - 1] || {}).notiz || ''; });
    if (!/şık:[^ |/]+\/[^ |/]+\/[^ |/]+ \| çeldirici:/.test(n1)) hata('seçmeli', `log notiz: ${n1}`);
    // yazma yanlış: düzeltme kutusu; doğrusu yazılmadan Devam yok; log 'düzeltti'
    await c.evaluate(id => window.__tekrar.frageAc({ id, bicim: 'yaz', b: 2 }), id);
    const ziel = await c.evaluate(() => window.__tekrar.aktuell.ziel);
    await c.fill('#cevap', 'Quatschwort'); await c.press('#cevap', 'Enter'); await c.waitForTimeout(900);
    const d1 = await c.evaluate(() => ({ kutu: !!document.querySelector('#duzelt-inp'), kapali: !!document.querySelector('#sonuc .devam-btn[disabled]'), odak: (document.activeElement || {}).id }));
    if (!d1.kutu || !d1.kapali) hata('düzeltme', `kutu ya da kapalı Devam yok: ${JSON.stringify(d1)}`);
    if (d1.odak !== 'duzelt-inp') hata('düzeltme', `masaüstünde odak kutuda değil: ${d1.odak}`);
    (await kucukler(c, '#sonuc')).forEach(x => hata('düzeltme ≥48', x));
    await c.keyboard.press('Enter'); await c.waitForTimeout(60);
    if (await c.evaluate(() => window.__tekrar.aktuell.islendi)) hata('düzeltme', 'doğrusu yazılmadan geçti');
    await c.fill('#duzelt-inp', ziel); await c.waitForTimeout(60);
    if (await c.$('#sonuc .devam-btn[disabled]')) hata('düzeltme', 'doğrusu yazıldı ama Devam kapalı');
    await c.press('#duzelt-inp', 'Enter'); await c.waitForTimeout(120);
    const n2 = await c.evaluate(() => { const l = window.__tekrar.S.log; return (l[l.length - 1] || {}).notiz || ''; });
    if (!/(^| )düzeltti( |$)/.test(n2) || !/bicim:yaz/.test(n2)) hata('düzeltme', `log notiz: ${n2}`);
    // metin etkinliği: yanlış boşlukların doğrusu metinde yazılır; yazılmadan Devam yok; özet satırında 'düzeltti'
    const cm = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
    await cm.evaluate(() => window.__tekrar.starte('akis')); await cm.waitForTimeout(200);
    if (await cm.evaluate(() => window.__tekrar.metinAc('luecke'))) {
      const bl = await cm.evaluate(() => window.__tekrar.aktuell.blanks.map(x => x.form));
      for (let i = 0; i < bl.length; i++) await cm.fill(`.u-luecke[data-al="${i}"]`, i === 0 ? 'xxxyz' : bl[i]);
      await cm.click('[data-akt="pruef"]'); await cm.waitForTimeout(60);
      const a1 = await cm.evaluate(() => ({ dz: document.querySelectorAll('.u-duzelt').length, kapali: !!document.querySelector('#sonuc .devam-btn[disabled]') }));
      if (a1.dz !== 1 || !a1.kapali) hata('metin düzeltme', JSON.stringify(a1));
      await cm.waitForTimeout(900); await cm.keyboard.press('Enter'); await cm.waitForTimeout(60);
      if (!(await cm.evaluate(() => window.__tekrar.aktuell.wartet))) hata('metin düzeltme', 'doğrusu yazılmadan geçti');
      await cm.fill('.u-duzelt[data-dz="0"]', bl[0]); await cm.waitForTimeout(60);
      await cm.keyboard.press('Enter'); await cm.waitForTimeout(150);
      const ak = await cm.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'akt').pop() || {});
      if (!/düzeltti/.test(ak.notiz || '')) hata('metin düzeltme', `özet satırı: ${ak.notiz}`);
    } else console.log('metin düzeltme: metin açılmadı (atlandı)');
    if (cm.hatalar.length) hata('metin sayfa', cm.hatalar.join(' | '));
    await cm.ctx.close();
    if (c.hatalar.length) hata('seçmeli sayfa', c.hatalar.join(' | '));
    await c.ctx.close();
    // tanıtım kartı: Devam ≥ 4 sn kapalı (test zamanlayıcıları ×0,25 → ≥ 1 sn)
    const t = await D.sayfa(b, { mobil: true });
    await t.evaluate(() => window.__tekrar.starte('akis')); await t.waitForTimeout(150);
    for (let i = 0; i < 6; i++) { const s = await D.durum(t); if (s.tur === 'tanit') break; if (s.tur === 'leer' || s.tur === 'turSonu') break; await D.adim(t, { dogru: 1 }); }
    const s0 = await D.durum(t);
    if (s0.tur === 'tanit') {
      // süre kartın kendi kilit başlangıcından (kilitT0, sayfa saati): sürücünün kartı fark etme gecikmesi ölçüye girmesin (8.11: geçiş zamanlaması değişince 950 → 900 ms sınırına düşüyordu)
      const t0p = await t.evaluate(() => window.__tekrar.aktuell.kilitT0 || Date.now()), gecen = () => t.evaluate(x => Date.now() - x, t0p);
      if (!(await t.$('[data-act="tanit-devam"][disabled]'))) hata('tanıtım', 'Devam baştan açık');
      await t.keyboard.press('Enter'); await t.waitForTimeout(40);
      if ((await D.durum(t)).id !== s0.id) hata('tanıtım', 'kilitliyken Enter geçti');
      await t.waitForFunction(() => !document.querySelector('[data-act="tanit-devam"][disabled]'), null, { timeout: 12000 }).catch(() => hata('tanıtım', 'kilit açılmadı'));
      const sure = await gecen();
      if (sure < 900) hata('tanıtım', `kilit çok kısa: ${sure} ms`);
      console.log(`seçmeli / panel: şıklar ${m.t.join(' | ')} · tanıtım kilidi ${sure} ms`);
    } else hata('tanıtım', `tanıtım kartı gelmedi (${s0.tur})`);
    await t.ctx.close();
  }

  // ---- B2 hazırlık sprinti (S.sprint): geri sayım + üç blok, gramer bloğu sözleşme API'si, "Bugün tamam" üçü bitince,
  //      Bonus tur yapışkan değil, hedef gününde bir kez geçiş kartı, sonra eski düzen ----
  {
    const ofs = new Date('2026-10-28T09:30:00').getTime() - Date.now();
    const s = await D.sayfa(b, { mobil: true, saatOfs: ofs });
    const bak = () => s.evaluate(() => ({ sp: JSON.stringify(window.__tekrar.S.sprint || null), serit: (document.querySelector('.sprint-serit') || {}).innerText || '',
      bloklar: [...document.querySelectorAll('.sprint-bloklar [data-blok]')].map(e => e.dataset.blok), ii: !!document.querySelector('.ikinci-is:not(.aksam-is)'),
      birincil: [...document.querySelectorAll('#v-ana .btn.ana')].filter(e => e.getClientRects().length).map(e => e.innerText.trim()), sabit: !!document.querySelector('#v-ana .basla-sabit'),
      baslik: (document.querySelector('.hero-baslik') || {}).innerText || '', gecis: !!document.querySelector('#sprint-gecis') }));
    const anaCiz = async () => { await s.click('.alt-nav [data-v="liste"]'); await s.click('.alt-nav [data-v="ana"]'); await s.waitForTimeout(150); };
    let x = await bak();
    if (x.sp !== '{"hedef":"2026-11-09","son_yeni":"2026-11-05","acik":true}') hata('sprint', `S.sprint kurulmadı: ${x.sp}`);
    if (!/B2 kursuna 12 gün/.test(x.serit)) hata('sprint', `geri sayım: "${x.serit}"`);
    if (x.bloklar.length !== 3 || x.bloklar[0] !== 'kelime' || x.bloklar[1] !== 'gram') hata('sprint', `bloklar: ${x.bloklar}`);
    if (x.ii) hata('sprint', 'sprintte ikinci iş kartı görünüyor');
    (await kucukler(s, '#v-ana')).forEach(y => hata('sprint ≥48', y));
    // gramer bloğu: Gramer.sprintDurum (tanı sürüyor) + blokBaslat çağrısı
    await s.evaluate(() => { const G = window.Gramer; G.sprintDurum = () => ({ tani: { bitti: false, yapilan: 3, toplam: 48 }, konular: [], bugunYeni: null, vadeli: [], bugunYapildi: window.__gramBitti === true }); G.blokBaslat = () => { window.__blok = (window.__blok || 0) + 1; }; });
    await anaCiz();
    const gm = await s.$eval('[data-blok="gram"]', e => e.innerText);
    if (!/Gramer testi: 3\/48/.test(gm)) hata('sprint', `gramer bloğu tanı metni: ${gm}`);
    await s.click('[data-blok="gram"]'); await s.waitForTimeout(200);
    const gb = await s.evaluate(() => ({ calis: !document.querySelector('#v-calis').hidden, blok: window.__blok || 0 }));
    if (!gb.calis || gb.blok !== 1) hata('sprint', `gramer bloğu açılmadı / blokBaslat çağrılmadı: ${JSON.stringify(gb)}`);
    await s.click('#calis-kapat'); await s.waitForTimeout(150);
    // kelime bitti → birincil düğme sıradaki blok, başlık "Bugün tamam" değil
    await s.evaluate(() => { const S = window.__tekrar.S, d = new Date(Date.now()), g = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; (S.tageC[g] = S.tageC[g] || {}).cTest = { n: 200, richtig: 200, fast: 0, falsch: 0, neuV: 0, neuN: 0, satz: 0, wort: 0, anlam: 0 }; });
    await anaCiz(); x = await bak();
    if (!/^Sırada: Gramer testi/.test(x.birincil[0] || '') || /Bugün tamam/.test(x.baslik)) hata('sprint', `kelime bitince: düğme ${x.birincil}, başlık ${x.baslik}`);
    // üç blok bitti → Bugün tamam, Bonus tur (yapışkan değil)
    await s.evaluate(() => { window.__gramBitti = true; const d = new Date(Date.now()), g = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; window.__tekrar.S.log.push({ zeit: g + ' 10:00:00', modus: 'cumle', id: 'x:diz', item: '', frage: '', antwort: '', ergebnis: 'richtig', loesung: '', notiz: '' }); });
    await anaCiz(); x = await bak();
    if (!/Bugün tamam/.test(x.baslik) || !/^Bonus tur/.test(x.birincil[0] || '') || x.sabit) hata('sprint', `üç blok bitince: başlık ${x.baslik}, düğme ${x.birincil}, yapışkan ${x.sabit}`);
    // hedef günü: bir kez geçiş kartı, sonra eski düzen
    await s.evaluate(ms => localStorage.setItem('__off', String(ms)), new Date('2026-11-09T10:00:00').getTime() - Date.now());
    await s.waitForTimeout(6000);   // yenilemeden önce localStorage diske işlensin (yukarıdaki not)
    await s.reload(); await s.waitForSelector('[data-act-ana="sprint-gecis"]', { timeout: 8000 }).catch(() => {});   // sayfa yükü (6.11 dosyaları) 400 ms'yi aşabiliyor
    x = await bak();
    if (!x.gecis || x.serit || x.bloklar.length) hata('sprint', `9.11: geçiş kartı ${x.gecis}, şerit "${x.serit}", bloklar ${x.bloklar.length}`);
    await s.click('[data-act-ana="sprint-gecis"]', { timeout: 8000 }); await s.waitForTimeout(150);
    await s.waitForTimeout(6000);
    await s.reload(); await s.waitForTimeout(1200);
    if ((await bak()).gecis) hata('sprint', 'geçiş kartı "Tamam"dan sonra yine görünüyor');
    if (s.hatalar.length) hata('sprint sayfa', s.hatalar.join(' | '));
    await s.ctx.close();
    console.log('sprint: geri sayım, üç blok, gramer bloğu, Bugün tamam, geçiş kartı denetlendi');
  }

  // ---- hareket azaltılmış: konfeti canvas'ı oluşmaz ----
  const ctx = await b.newContext({ viewport: D.GORUNUM.mobil, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const q = await ctx.newPage();
  await q.route(/fonts/, r => r.abort());
  await q.goto(D.URL); await q.waitForTimeout(300);
  await q.evaluate(() => window.__tekrar.konfeti());
  await q.waitForTimeout(100);
  if (await q.$('canvas.konfeti')) hata('hareket', 'prefers-reduced-motion\'da konfeti canvas\'ı oluştu');
  await ctx.close();
  await b.close();

  if (fehler.length) { console.log('ARAYÜZ DENETİMİ KALDI:\n' + fehler.join('\n')); process.exit(1); }
  console.log('arayüz denetimi geçti');
})().catch(e => { console.error(e); process.exit(1); });
