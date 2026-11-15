// 15.11 (D2 / D10 / D11 / D12): askıya alma (otomatik askı bilgi kartı + log, Kelimeler → Askıda + geri al, alt sayfa ve sonuç panelinde
// "bu kelime bana gereksiz"), metin boşluğunda eş anlamlı / fazla artikel, tur sonu "ipucusuz bildiğin · bu hafta oturan", Bugün sayıları,
// Claude notları tek satır, Ayarlar hatırlama notu. Gerçek log/zustand.json kopyası (sayfa yenilemeden). Kullanım: node tests/e2e_aski.js [klasör]
const D = require('./surucu');
const fs = require('fs');
const path = require('path');
let hata = 0;
const ok = (k, m) => { if (!k) { hata++; console.log('HATA:', m); } };
const klasor = process.argv[2] || null;
(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('e2e_aski: Playwright yok, atlandı'); return; }
  if (klasor) fs.mkdirSync(klasor, { recursive: true });
  const foto = async (p, ad) => { if (klasor) await p.screenshot({ path: path.join(klasor, ad + '.png'), fullPage: true }); };
  // gerçek kopya: anlamı olan ilk 3 öğe Kern'in otomatik askısındaki gibi işaretli (log satırı yok → uygulama yazar)
  const z = JSON.parse(D.zustandOku());
  const adaylar = Object.keys(z.items).filter(id => /^[nvwx]/.test(id) && z.items[id].m && z.items[id].m.S && !z.items[id].askida);
  const oto = adaylar.slice(0, 3);
  oto.forEach(id => { z.items[id].askida = { t: Date.now() - 60000, neden: 'oto' }; });
  z.aski1411 = { t: Date.now() - 60000, n: oto.length };   // Kern'in bir kerelik otomatik askısı yapılmış sayılır (yoksa gerçek kurala göre ~40 öğe daha askıya alınır)
  z.duzen1511 = { aski: { t: Date.now() - 60000 } };   // 15.11 düzeninin bir kerelik geri alma / küme askısı da yapılmış sayılır (test öğeleri geri alınmasın)
  for (const mobil of [true, false]) {
    const ad = mobil ? 'mobil' : 'masaustu';
    const p = await D.sayfa(b, { mobil, zustand: JSON.stringify(z) });
    await p.waitForTimeout(400);
    const metin = s => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, s);
    const loglar = () => p.evaluate(() => window.__tekrar.S.log.filter(e => /^aski:/.test(e.id)).map(e => ({ id: e.id, ergebnis: e.ergebnis, notiz: e.notiz, modus: e.modus })));
    // 1) otomatik askı: log satırı (akt, aski:<öğe>, askida, neden:oto) ve Bugün'de bilgi kartı
    let L = await loglar();
    ok(oto.every(id => L.some(e => e.id === 'aski:' + id && e.modus === 'akt' && e.ergebnis === 'askida' && e.notiz === 'neden:oto')), `[${ad}] oto askı log satırları: ${JSON.stringify(L)}`);
    const kartM = await metin('.aski-bilgi');
    ok(/3 nadir kelime/.test(kartM || '') && /Askıda/.test(kartM || ''), `[${ad}] askı bilgi kartı: ${kartM}`);
    const say = await metin('.ana-sayilar');
    ok(/tekrar sırada/.test(say || '') && /3 askıda/.test(say || ''), `[${ad}] Bugün sayıları: ${say}`);
    ok(/\d+\/1000 önemli kelime/.test(say || ''), `[${ad}] önemli 1000: ${say}`);
    ok(!/Birikme büyüyor/.test(await metin('#ana') || ''), `[${ad}] suçlayıcı birikme metni`);
    // Claude notları (varsa) tek satır: details kapalı
    const notK = await p.evaluate(() => { const d = document.querySelector('.notlar-kart'); return d ? { tag: d.tagName, acik: d.open, h: d.getBoundingClientRect().height } : null; });
    ok(!notK || (notK.tag === 'DETAILS' && !notK.acik && notK.h < 70), `[${ad}] Claude notları katlı değil: ${JSON.stringify(notK)}`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `[${ad}] Bugün yatay taşma`);
    await foto(p, ad + '-1-bugun');
    // 2) kart → Kelimeler / Askıda; geri al
    await p.click('.aski-bilgi [data-act-ana="aski-git"]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => !document.querySelector('#v-liste').hidden), `[${ad}] Askıda'ya gitmedi`);
    ok(await p.evaluate(() => { const b = document.querySelector('#seviye-sekme [data-sekme="aski"]'); return b && b.getAttribute('aria-selected') === 'true'; }), `[${ad}] Askıda sekmesi seçili değil`);
    let satir = await p.$$eval('#liste .aski-satir', l => l.length);
    ok(satir === 3, `[${ad}] Askıda satırı: ${satir}`);
    ok(!(await p.evaluate(() => window.__tekrar.S.ayar4.gosterildi.askiKart.ok === false)), `[${ad}] bilgi kartı "görüldü" olmadı`);
    await foto(p, ad + '-2-askida');
    const geriId = await p.$eval('#liste .aski-satir [data-aski-geri]', x => x.dataset.askiGeri);
    await p.click(`#liste [data-aski-geri="${geriId}"]`); await p.waitForTimeout(250);
    satir = await p.$$eval('#liste .aski-satir', l => l.length);
    ok(satir === 2, `[${ad}] geri aldıktan sonra Askıda satırı: ${satir}`);
    ok(await p.evaluate(id => window.__tekrar.S.items[id].askida === null, geriId), `[${ad}] geri alınan öğe hâlâ askıda`);
    L = await loglar();
    ok(L.some(e => e.id === 'aski:' + geriId && e.ergebnis === 'geri' && e.notiz === 'neden:oto'), `[${ad}] geri log satırı`);
    // 3) alt sayfa: "Bu kelime bana gereksiz" (Hepsi sekmesinde öğrenilmiş bir kelime)
    const elId = adaylar[5];
    await p.fill('#ara', ''); await p.click('#seviye-sekme [data-sekme="ogren"]'); await p.waitForTimeout(200);
    await p.evaluate(id => { const x = document.querySelector(`[data-oge="${id}"]`); if (x) x.click(); else window.__tekrar.ogeSayfaAc && window.__tekrar.ogeSayfaAc(id); }, elId);
    await p.waitForTimeout(250);
    let alt = await p.evaluate(() => !document.querySelector('#alt-sayfa').hidden);
    if (!alt) { await p.fill('#ara', await p.evaluate(id => { const T = window.__tekrar; const k = T.kind(id); return k === 'v' ? T.VERBEN.find(v => v.id === id).inf : k === 'w' ? T.wById[id].de : T.byId[id].lemma; }, elId)); await p.waitForTimeout(200); await p.click(`[data-oge="${elId}"]`); await p.waitForTimeout(250); }
    ok(await p.$(`#alt-sayfa [data-aski-al="${elId}"]`), `[${ad}] alt sayfada "gereksiz" düğmesi yok`);
    await foto(p, ad + '-3-altsayfa');
    await p.click(`#alt-sayfa [data-aski-al="${elId}"]`); await p.waitForTimeout(250);
    ok(await p.evaluate(id => { const a = window.__tekrar.S.items[id].askida; return !!a && a.neden === 'el'; }, elId), `[${ad}] alt sayfadan askıya alınmadı`);
    ok(await p.$(`#alt-sayfa [data-aski-geri="${elId}"]`), `[${ad}] alt sayfada "geri al" yok`);
    L = await loglar();
    ok(L.some(e => e.id === 'aski:' + elId && e.ergebnis === 'askida' && e.notiz === 'neden:el'), `[${ad}] el askı log satırı`);
    await p.click('#alt-sayfa [data-alt-kapat]').catch(() => {});
    // 4) Ayarlar: hatırlama hedefi notu (değer değişmez)
    const ret0 = await p.evaluate(() => window.__tekrar.S.einst.ret);
    await p.evaluate(() => document.querySelector('.alt-nav button[data-v="diger"]').click()); await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelector('[data-git="ayar"][data-v="ayar"]').click()); await p.waitForTimeout(300);
    await foto(p, ad + '-6-ayar');
    const retNot = await metin('.ret-not');
    ok(/0,90 aralıkları kısaltır; 0,85 tekrar yükünü ~%15 azaltır/.test(retNot || ''), `[${ad}] ret notu: ${retNot}`);
    ok(await p.evaluate(r => window.__tekrar.S.einst.ret === r, ret0), `[${ad}] ret değişti`);
    // 5) tur: sonuç panelinde "bu kelime bana gereksiz" → askıya alır, turda bir daha gelmez; tur sonunda ipucusuz / oturan
    await p.evaluate(() => window.__tekrar.starte('akis', 12)); await p.waitForTimeout(300);
    let askiId = null, sonra = [];
    for (let i = 0; i < 40; i++) {
      const s = await D.durum(p);
      if (s.tur === 'turSonu' || s.tur === 'leer') break;
      if (askiId && s.id) sonra.push(s.id);
      const r = await D.adim(p, { dogru: askiId ? 1 : 0, sonucCek: async s3 => {
        if (askiId || !s3.id) return;
        const btn = await p.$('#kart .sonuc [data-act="aski"]'); if (!btn) return;
        await foto(p, ad + '-4-sonuc');
        await btn.click(); await p.waitForTimeout(80);
        askiId = s3.id;
        ok(await p.$('#kart .sonuc .aski-ok'), `[${ad}] sonuç panelinde "askıda ✓" yok`);
      } });
      if (r.ad === 'leer' || /^bilinmeyen/.test(r.ad)) break;
    }
    ok(!!askiId, `[${ad}] sonuç panelinde "gereksiz" düğmesi hiç çıkmadı`);
    if (askiId) {
      ok(await p.evaluate(id => { const a = window.__tekrar.S.items[id].askida; return !!a && a.neden === 'el'; }, askiId), `[${ad}] sonuç panelinden askıya alınmadı`);
      ok(!sonra.includes(askiId), `[${ad}] askıya alınan öğe turda yine geldi`);
    }
    for (let i = 0; i < 30; i++) { const s = await D.durum(p); if (s.tur === 'turSonu') break; await D.adim(p, { dogru: 1 }); }
    const ts = await p.evaluate(() => ({ ip: document.querySelector('#ts-ipucsuz') && document.querySelector('#ts-ipucsuz').textContent, ot: document.querySelector('#ts-oturan') && document.querySelector('#ts-oturan').textContent, m: (document.querySelector('.tur-sonu') || {}).textContent || '' }));
    ok(ts.ip != null && ts.ot != null && /ipucusuz bildiğin/.test(ts.m) && /bu hafta oturan/.test(ts.m), `[${ad}] tur sonu ilerleme: ${JSON.stringify(ts).slice(0, 200)}`);
    ok(!/seviye atlayanlar · 0/.test(ts.m), `[${ad}] "seviye atlayanlar · 0" görünüyor`);
    const turLog = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'tur').pop());
    ok(turLog && /tekrar:\d+ \| ipucusuz:\d+/.test(turLog.notiz), `[${ad}] tur satırında ipucusuz yok: ${turLog && turLog.notiz}`);
    await foto(p, ad + '-5-tursonu');
    ok(!p.hatalar.length, `[${ad}] sayfa hatası: ` + p.hatalar.join(' | '));
    await p.ctx.close();
  }
  // 6) metin boşluğu kontrolü (uPruef): eş anlamlı küçük hata, dar (modal fiil / başka anlam yanlış), fazla artikel etiketi
  const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
  const u = await p.evaluate(() => {
    const T = window.__tekrar, U = T._not.uPruef, id = (k, x) => k === 'v' ? T.VERBEN.find(v => v.inf === x).id : k === 'w' ? Object.values(T.wById).find(w => w.de === x).id : Object.values(T.byId).find(n => n.lemma === x).id;
    return {
      heiss: U('heiß', 'warm', null, id('w', 'warm')),
      heisse: U('heiße', 'warme', null, id('w', 'warm')),
      veraend: U('Veränderungen', 'Änderungen', null, id('n', 'Änderung')),
      schaffen: U('schaffen', 'bewältigen', null, id('v', 'bewältigen')),
      darf: U('darf', 'kann', null, id('v', 'können')),
      kalt: U('kalt', 'warm', null, id('w', 'warm')),
      haus: U('Wohnung', 'Haus', null, id('n', 'Haus')),
      luft: U('die Luft', 'Luft', null, id('n', 'Luft')),
    };
  });
  ok(u.heiss.u === 'fast' && u.heiss.esAnlam, 'heiß yerine warm: ' + JSON.stringify(u.heiss));
  ok(u.heisse.u === 'fast' && u.heisse.esAnlam, 'heiße yerine warme: ' + JSON.stringify(u.heisse));
  ok(u.veraend.u === 'fast' && u.veraend.esAnlam, 'Veränderungen yerine Änderungen: ' + JSON.stringify(u.veraend));
  ok(u.schaffen.u === 'fast' && u.schaffen.esAnlam, 'schaffen yerine bewältigen: ' + JSON.stringify(u.schaffen));
  ok(u.darf.u === 'falsch', 'darf yerine kann yanlış olmalı: ' + JSON.stringify(u.darf));
  ok(u.kalt.u === 'falsch', 'kalt yerine warm yanlış olmalı: ' + JSON.stringify(u.kalt));
  ok(u.haus.u === 'falsch', 'Wohnung yerine Haus yanlış olmalı (ilk anlam farklı): ' + JSON.stringify(u.haus));
  ok(u.luft.u === 'fast' && u.luft.fazlaArt, 'die Luft: ' + JSON.stringify(u.luft));
  // Bugün → ikinci iş gramer kartı: Gramer.gunOnerisi (alfabetik ilk vadeli konu değil); tıklayınca Gramer o konuyla açılır
  const ii = await p.evaluate(() => { const G = window.Gramer, o = G && G.gunOnerisi ? G.gunOnerisi() : null; return { o, html: window.__tekrar.ikinciIs() }; });
  if (ii.o) {
    ok(ii.html.includes(`data-gram-id="${ii.o.id}"`) && ii.html.includes(ii.o.ad), 'ikinci iş gramer önerisi: ' + ii.html.slice(0, 300));
    await p.evaluate(h => { const d = document.createElement('div'); d.id = 'ii-test'; d.innerHTML = h; document.querySelector('#ana').appendChild(d); }, ii.html);
    await p.click('#ii-test [data-gram-id]'); await p.waitForTimeout(400);
    const g = await p.evaluate(() => ({ modus: !document.querySelector('#v-calis').hidden, ekran: window.Gramer._ic.ses().ekran, id: window.Gramer._ic.ses().id }));
    ok(g.modus && g.ekran !== 'liste', 'gramer kartı konuyu açmadı: ' + JSON.stringify(g));
    await p.evaluate(() => { const x = document.querySelector('.alt-nav button[data-v="ana"]'); if (x) x.click(); });
  } else console.log('(gramer önerisi yok: ikinci iş kartı denetlenmedi)');
  // gerçek metin etkinliği: isim boşluğuna artikelle → log etiketi 'fazla artikel' (yazım değil)
  await p.evaluate(() => window.__tekrar.starte('akis', 12)); await p.waitForTimeout(300);
  let denendi = false;
  for (let i = 0; i < 15 && !denendi; i++) {
    if (!(await p.evaluate(() => window.__tekrar.metinAc('luecke')))) continue;
    const bl = await p.evaluate(() => window.__tekrar.aktuell.blanks.map(b => ({ form: b.form, id: b.id })));
    const j = bl.findIndex(x => /^[nx]/.test(x.id) && /^[A-ZÄÖÜ]/.test(x.form) && !/\s/.test(x.form));
    if (j < 0) continue;
    for (let k = 0; k < bl.length; k++) await p.fill(`.u-luecke[data-al="${k}"]`, k === j ? 'die ' + bl[k].form : bl[k].form);
    await p.click('[data-akt="pruef"]'); await p.waitForTimeout(150);
    const e = await p.evaluate(f => window.__tekrar.S.log.filter(e => e.modus === 'luecke' && e.antwort === 'die ' + f).pop(), bl[j].form);
    ok(e && e.ergebnis === 'fast' && /fazla artikel/.test(e.notiz) && !/yazım/.test(e.notiz), 'metin fazla artikel log: ' + JSON.stringify(e));
    denendi = true;
  }
  ok(denendi, 'isim boşluklu metin bulunamadı');
  ok(!p.hatalar.length, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await p.ctx.close();
  await b.close();
  console.log(hata ? `e2e_aski: ${hata} hata` : 'e2e_aski: geçti (askı, sonuç paneli, Askıda sekmesi, eş anlamlı / fazla artikel, tur sonu ilerlemesi, Bugün sayıları, ret notu)');
  process.exit(hata ? 1 : 0);
})();
