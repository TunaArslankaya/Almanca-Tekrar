// Cevap kontrolü + sonuç paneli + doğru cevapta kendiliğinden geçiş (8.11 düzeltmeleri; Playwright gerekir): node tests/e2e_not.js
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur). Denetlenenler:
// artOb: dişil isme Nom/Akk'de der → cinsiyet hatası (falsch), der-isme Akk'ta dem → hâl (fast).
// uPruef (metin boşluğu): sözlükte başka kelime (legt / liegt, Staat / Stadt, verschieben / verschrieben) yanlış; die Luft → fazla artikel;
//   aynı fiilin başka biçimi (können → kann) çekim; metin sonucunda küçük hata sarı + doğrusu.
// İsim yazma: ein Vorurteil / dasVorurteil küçük hata, doğru çoğul artikel hatası değil, küçük harf isim küçük hata, artikel + umlaut → log'da artikel.
// Kök: sein-fiilinde "hat gefahren" küçük hata; birden çok biçim; könnte ≠ konnte. Fiil: "untersuchen Akk" doğru, "warte auf" mastar.
// Boşluk / paket (bosA): fazla artikel, Zugx yanlış, harf yer değiştirmesi yazım, ae / ue tam doğru, umlaut eksik 'umlaut', küçük harf isim.
// Tam cümle: geçerli dizilişe "kelime sırası" verilirse "aslında doğru" itirazı var.
// Kendiliğinden geçiş: varsayılan 2 sn, Boşluk durdurur, fare panelde duraklatır, "Elle" ayarı geçmez, Ayarlar satırı.
const D = require('./surucu');

const fehler = [];
const ok = (kosul, ad, m) => { if (!kosul) fehler.push(`[${ad}] ${m}`); };

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('e2e_not: Playwright yok, atlandı'); return; }
  const p = await D.sayfa(b, { zustand: D.zustandOku() });
  await p.evaluate(() => window.__tekrar.starte('akis'));
  await p.waitForTimeout(200);
  const T = (fn, ...a) => p.evaluate(([fn, a]) => { const N = window.__tekrar._not; const r = N[fn](...a); return r && JSON.parse(JSON.stringify(r)); }, [fn, a]);

  // ---- artOb ----
  let r = await T('artObPruef', 'n0433', 'der', 'die', 'NA');   // die Geduld, Nom/Akk
  ok(r.urteil === 'falsch' && /artikel der/.test(r.tags.join()) && r.artOb && r.artOb.dogru === false, 'artOb', `dişil + der: ${JSON.stringify(r)}`);
  r = await T('artObPruef', 'n0433', 'dem', 'der', 'D');
  ok(r.urteil === 'falsch', 'artOb', `dişil Dat + dem: ${r.urteil}`);
  r = await T('artObPruef', 'n1434', 'dem', 'den', 'A');   // der Zug, Akk
  ok(r.urteil === 'fast' && r.tags.includes('hâl') && r.artOb.dogru === true, 'artOb', `eril Akk + dem: ${JSON.stringify(r.tags)}`);
  r = await T('artObPruef', 'n1434', 'der', 'den', 'A');
  ok(r.urteil === 'fast' && r.tags.includes('hâl'), 'artOb', `eril Akk + der: ${r.urteil}`);

  // ---- uPruef (metin / ünite / dinleme boşluğu) ----
  const v347 = 'v347';
  for (const [a, z] of [['legt', 'liegt'], ['Staat', 'Stadt'], ['verschieben', 'verschrieben'], ['setzen', 'sitzen']]) {
    r = await T('uPruef', a, z);
    ok(r.u === 'falsch', 'uPruef', `${a} / ${z} başka kelime: ${JSON.stringify(r)}`);
  }
  r = await T('uPruef', 'die Luft', 'Luft');
  ok(r.u === 'fast' && /fazla artikel/.test(r.hinweis), 'uPruef', `die Luft: ${JSON.stringify(r)}`);
  r = await T('uPruef', 'Rezpet', 'Rezept');
  ok(r.u === 'fast' && /yazım/.test(r.hinweis), 'uPruef', `Rezpet: ${JSON.stringify(r)}`);
  r = await T('uPruef', 'können', 'kann', null, v347);
  ok(r.u === 'fast' && r.cekim, 'uPruef', `können → kann: ${JSON.stringify(r)}`);
  r = await T('uPruef', 'können', 'kann');
  ok(r.u === 'falsch', 'uPruef', `id'siz können → kann yanlış kalmalı: ${r.u}`);

  // G.kelimeSinifi (kontrol ajanının sözlüklü sınıflandırıcısı) varsa tek kelimede onun kararı; yoksa eski yol (yukarıdaki denetimler)
  const ks = await p.evaluate(() => {
    const T = window.__tekrar, G = T.G, eski = G.kelimeSinifi, N = T._not, out = {};
    G.kelimeSinifi = (x, t) => ({ Prufung: 'umlaut', Rezpet: 'yazim', Rezepte: 'cekim', legt: null, luft: 'buyukKucuk' })[x] === undefined ? null : ({ Prufung: 'umlaut', Rezpet: 'yazim', Rezepte: 'cekim', legt: null, luft: 'buyukKucuk' })[x];
    try { for (const [a, z] of [['Prufung', 'Prüfung'], ['Rezpet', 'Rezept'], ['Rezepte', 'Rezept'], ['legt', 'liegt'], ['luft', 'Luft']]) out[a] = N.uPruef(a, z); }
    finally { if (eski) G.kelimeSinifi = eski; else delete G.kelimeSinifi; }
    return out;
  });
  ok(ks.Prufung.u === 'fast' && ks.Prufung.umlaut && ks.Rezpet.u === 'fast' && ks.Rezepte.cekim && ks.legt.u === 'falsch' && ks.luft.u === 'fast', 'uPruef', `kelimeSinifi yolu: ${JSON.stringify(ks)}`);

  // ---- isim yazma (pruefWort) ----
  r = await T('pruefWort', 'x1557', 'ein Vorurteil');
  ok(r.urteil === 'fast' && r.artikel && r.artikel.eksik && r.tip === 'dogru', 'isim', `ein Vorurteil: ${JSON.stringify(r)}`);
  r = await T('pruefWort', 'x1557', 'dasVorurteil');
  ok(r.urteil === 'fast' && r.tip === 'yazim' && r.artikel.dogru, 'isim', `dasVorurteil: ${JSON.stringify(r)}`);
  r = await T('pruefWort', 'x1557', 'die Vorurteile');
  ok(r.urteil === 'fast' && r.tip === 'cekim' && !r.artikel && /çoğul/.test(r.tags.join()), 'isim', `die Vorurteile: ${JSON.stringify(r)}`);
  r = await T('pruefWort', 'x1557', 'das vorurteil');
  ok(r.urteil === 'fast' && r.tip === 'yazim' && r.tags.includes('büyük harf'), 'isim', `das vorurteil: ${JSON.stringify(r)}`);
  r = await T('pruefWort', 'x1557', 'das Vorurteil');
  ok(r.urteil === 'richtig', 'isim', `das Vorurteil: ${r.urteil}`);
  // artikel + umlaut hatası: not etiketlerinde artikel kalır (panel + log)
  const nv = await p.evaluate(() => { const N = window.__tekrar._not, r = N.pruefWort('n0587', 'der Kalte'); return N.notVerF({ bicim: 'yaz', tip: r.tip, artikel: r.artikel, etiketler: [] }); });
  ok(nv.ergebnis === 'fast' && nv.etiketler.includes('artikel der → die'), 'isim', `der Kalte: ${JSON.stringify(nv)}`);

  // ---- kök (stammTekPruef) ----
  r = await T('stammTekPruef', 'v243', 'gefahren', 'hat gefahren', 'p2', 'Partizip', 'ist');   // "Wir sind mit dem Zug ___."
  ok(r.urteil === 'fast' && r.tags.some(x => /yardımcı fiil: sein/.test(x)), 'kök', `hat gefahren (cümlede sind): ${JSON.stringify(r)}`);
  r = await T('stammTekPruef', 'v148', 'geblieben', 'hat geblieben', 'p2', 'Partizip');   // bleiben: yalnız sein
  ok(r.urteil === 'fast' && r.tags.some(x => /yardımcı fiil: sein/.test(x)), 'kök', `hat geblieben: ${JSON.stringify(r)}`);
  r = await T('stammTekPruef', 'v243', 'gefahren', 'ist gefahren', 'p2', 'Partizip', 'ist');
  ok(r.urteil === 'richtig', 'kök', `ist gefahren: ${r.urteil}`);
  r = await T('stammTekPruef', 'v243', 'gefahren', 'gefahren', 'p2', 'Partizip');
  ok(r.urteil === 'richtig', 'kök', `gefahren: ${r.urteil}`);
  r = await T('stammTekPruef', 'v398', 'hat genommen', 'nimmt, nahm, hat genommen', 'perf', 'Perfekt');
  ok(r.urteil === 'fast' && r.tags.includes('tek biçim yaz') && !r.tags.some(x => /eksik/.test(x)), 'kök', `çok biçim: ${JSON.stringify(r)}`);
  r = await T('stammTekPruef', 'v347', 'konnte', 'könnte', 'fin', 'Präteritum');
  ok(r.urteil === 'falsch' && /Konjunktiv II/.test(r.tags.join()), 'kök', `könnte ← konnte: ${JSON.stringify(r)}`);

  // ikinci doğru biçim (build: p2Alt / pt3Alt; sich wenden an: gewandt / gewendet, wandte / wendete); alan yoksa yalnız asıl biçim
  const w0 = await p.evaluate(() => { const v = window.__tekrar._not.vById('v642'); return { p2s: v.p2s, pt: v.ptForm, p2Alt: v.p2Alt, pt3Alt: v.pt3Alt }; });
  const p2b = w0.p2s === 'gewandt' ? 'gewendet' : 'gewandt', ptb = w0.pt === 'wandte' ? 'wendete' : 'wandte';
  r = await T('stammTekPruef', 'v642', w0.p2s, p2b, 'p2', 'Partizip', 'hat');
  ok(w0.p2Alt ? r.urteil === 'richtig' : r.urteil !== 'richtig', 'kök', `alternatif Partizip (${p2b}) alan ${JSON.stringify(w0.p2Alt)}: ${r.urteil}`);
  await p.evaluate(([a, b]) => { const v = window.__tekrar._not.vById('v642'); v.p2Alt = [a]; v.pt3Alt = [b]; }, [p2b, ptb]);
  r = await T('stammTekPruef', 'v642', w0.p2s, p2b, 'p2', 'Partizip', 'hat');
  ok(r.urteil === 'richtig' && r.ziel === w0.p2s, 'kök', `p2Alt kabul edilmedi: ${JSON.stringify(r)}`);
  r = await T('stammTekPruef', 'v642', 'hat ' + w0.p2s, 'hat ' + p2b, 'perf', 'Perfekt');
  ok(r.urteil === 'richtig', 'kök', `p2Alt Perfekt: ${r.urteil}`);
  r = await T('stammTekPruef', 'v642', w0.pt, ptb, 'fin', 'Präteritum');
  ok(r.urteil === 'richtig', 'kök', `pt3Alt: ${r.urteil}`);
  r = await T('stammTekPruef', 'v642', w0.p2s, 'gewunden', 'p2', 'Partizip', 'hat');
  ok(r.urteil !== 'richtig', 'kök', `uydurma Partizip doğru sayıldı`);
  await p.evaluate(a => { const v = window.__tekrar._not.vById('v642'); if (a.p2Alt === undefined) delete v.p2Alt; else v.p2Alt = a.p2Alt; if (a.pt3Alt === undefined) delete v.pt3Alt; else v.pt3Alt = a.pt3Alt; }, w0);

  // ---- fiil yazma (pruefAbr) ----
  r = await T('pruefAbr', 'v564', 'untersuchen Akk');
  ok(r.urteil === 'richtig', 'fiil', `untersuchen Akk: ${JSON.stringify(r)}`);
  r = await T('pruefAbr', 'v634', 'warte auf');
  ok(r.tip === 'mastar' && r.urteil === 'fast', 'fiil', `warte auf: ${JSON.stringify(r)}`);

  // ---- boşluk / paket (bosA) ----
  const bos = [['die Fahrkarte', 'Fahrkarte', 'n0336', 'fast', /fazla artikel/], ['Zugx', 'Zug', 'n1434', 'falsch', null], ['Fahkrarte', 'Fahrkarte', 'n0336', 'fast', /yazım/],
    ['Pruefung', 'Prüfung', 'n0941', 'richtig', null], ['Prufung', 'Prüfung', 'n0941', 'fast', /umlaut/], ['seminar', 'Seminar', 'n1077', 'fast', /büyük harf/]];
  for (const [a, z, id, u, et] of bos) {
    r = await T('bosA', a, z, null, id);
    ok(r.urteil === u && (!et || et.test((r.tags || []).join())), 'boşluk', `${a} / ${z}: ${JSON.stringify({ u: r.urteil, tip: r.tip, tags: r.tags })}`);
  }

  // ---- tam cümle: "kelime sırası" (cumleYapi) → "aslında doğru" itirazı ----
  let itirazGoruldu = false;
  for (let k = 0; k < 40 && !itirazGoruldu; k++) {
    const kur = await p.evaluate(k => {
      const T = window.__tekrar, ids = Object.keys(T.S.items).filter(id => /^v/.test(id));
      const id = ids[k % ids.length];
      if (!T.frageAc({ id, bicim: 'cumle', b: 4 })) return null;
      const q = T.aktuell; if (!q || !q.voll) return null;
      const w = String(q.ziel).replace(/[.!?]$/, '').split(' ');
      for (let i = 1; i < w.length - 2; i++) {
        const v = w.slice(); [v[i], v[i + 1]] = [v[i + 1], v[i]];
        const s = v.join(' ') + '.', r = q.pruef(s);
        if (r && r.tip === 'cumleYapi') return s;
      }
      return null;
    }, k);
    if (!kur) continue;
    await p.fill('#cevap', kur); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    const st = await p.evaluate(() => { const a = window.__tekrar.aktuell; return { tip: a.sonuc && a.sonuc.tip, itiraz: a.itirazVar, btn: !!document.querySelector('[data-act="itiraz"]') }; });
    ok(st.itiraz === 'dogru' && st.btn, 'cümle', `cumleYapi itiraz yok: ${JSON.stringify(st)}`);
    itirazGoruldu = true;
  }
  ok(itirazGoruldu, 'cümle', 'kelime sırası sonucu veren tam cümle kurulamadı');

  // ---- metin etkinliği: küçük hata sarı + doğrusu ----
  await p.evaluate(() => { window.__tekrar.starte('akis'); });
  await p.waitForTimeout(150);
  let metin = false;
  for (let k = 0; k < 8 && !metin; k++) metin = await p.evaluate(() => window.__tekrar.metinAc('luecke'));
  if (metin) {
    const bl = await p.evaluate(() => window.__tekrar.aktuell.blanks.map(b => b.form));
    const i = bl.findIndex(f => f.length >= 7 && /^[a-zäöüß]+$/i.test(f));
    if (i >= 0) {
      for (let j = 0; j < bl.length; j++) { const f = bl[j]; await p.fill(`.u-luecke[data-al="${j}"]`, j === i ? f.slice(0, 2) + f[3] + f[2] + f.slice(4) : f); }
      await p.click('[data-akt="pruef"]'); await p.waitForTimeout(150);
      const st = await p.evaluate(i => { const a = window.__tekrar.aktuell, el = document.querySelector(`.u-luecke[data-al="${i}"]`); return { d: a.durum && a.durum[i], cls: el && el.className, dogru: !!(el && el.nextElementSibling && el.nextElementSibling.classList.contains('u-dogru')) }; }, i);
      ok(st.d !== 'fast' || (/yakin/.test(st.cls) && st.dogru), 'metin', `küçük hata kutusu: ${JSON.stringify(st)}`);
      console.log(`  metin: yer değiştirmeli boşluk → ${st.d}`);
    }
  }

  // ---- turdaki gramer sorusu: yanlışta Devam 2,5 sn kilitli, kilitten sonra tek Enter notlatır ve geçer ----
  await p.evaluate(() => window.__tekrar.starte('akis')); await p.waitForTimeout(100);
  if (await p.evaluate(() => window.__tekrar.gramAc())) {
    const b0 = await p.$('#kart [data-g="bilmiyorum"]');
    if (b0) {
      await p.evaluate(() => { window.__tekrar.aktuell._test = 1; });
      await b0.click(); await p.waitForTimeout(60);
      const st = await p.evaluate(() => { const a = window.__tekrar.aktuell, b = document.querySelector('#g-sonuc .devam-btn'); return { typ: a.typ, kilit: !!a.kilit, dis: !!(b && b.disabled) }; });
      ok(st.typ === 'gramTur' && st.kilit && st.dis, 'gram', `yanlışta kilit yok: ${JSON.stringify(st)}`);
      await p.keyboard.press('Enter'); await p.waitForTimeout(60);
      ok(await p.evaluate(() => { const a = window.__tekrar.aktuell; return a.typ === 'gramTur' && !a.wartet; }), 'gram', 'kilitliyken Enter notlattı / geçti');
      await p.waitForTimeout(800);   // 2,5 sn × 0,25
      await p.keyboard.press('Enter'); await p.waitForTimeout(150);
      ok(await p.evaluate(() => window.__tekrar.aktuell && !window.__tekrar.aktuell._test), 'gram', 'kilitten sonra tek Enter geçmedi');
    } else ok(false, 'gram', 'Bilmiyorum düğmesi yok');
  } else console.log('  (gramer sorusu açılamadı: atlandı)');

  // ---- kendiliğinden geçiş ----
  const yazAc = () => p.evaluate(() => { const T = window.__tekrar; T.starte('akis'); return T.frageAc({ id: 'x1557', bicim: 'yaz', b: 2 }); });
  const ayniMi = () => p.evaluate(() => { const a = window.__tekrar.aktuell; return !!(a && a.id === 'x1557' && a.done && !a.islendi); });
  ok((await p.evaluate(() => window.__tekrar._not.otoMs())) === 2000, 'oto', 'varsayılan 2 sn değil');
  // (testte zamanlayıcılar 4× hızlı: 2 sn ≈ 0,5 sn gerçek; ses yoksa en çok 6 sn ≈ 1,5 sn)
  if (await yazAc()) {
    await p.fill('#cevap', 'das Vorurteil'); await p.keyboard.press('Enter');
    const anim = await p.evaluate(() => { const d = document.querySelector('#sonuc .devam-btn .dolum'); return d ? d.style.animationDuration : null; });
    ok(anim === '2000ms', 'oto', `dolum süresi: ${anim}`);
    await p.waitForTimeout(200);
    ok(await ayniMi(), 'oto', '2 sn dolmadan geçti');
    let gecti = false;
    for (let i = 0; i < 40 && !gecti; i++) { await p.waitForTimeout(100); gecti = !(await ayniMi()); }
    ok(gecti, 'oto', 'kendiliğinden geçmedi');
  } else ok(false, 'oto', 'x1557 yazma sorusu açılamadı');
  // Boşluk: durur, Enter geçer
  if (await yazAc()) {
    await p.fill('#cevap', 'das Vorurteil'); await p.keyboard.press('Enter'); await p.waitForTimeout(60);
    await p.keyboard.press('Space');
    await p.waitForTimeout(2200);
    const st = await p.evaluate(() => { const a = window.__tekrar.aktuell; return { ayni: a && a.id === 'x1557' && a.done && !a.islendi, dur: a && a.oto && a.oto.dur, dolum: !!document.querySelector('#sonuc .dolum') }; });
    ok(st.ayni && st.dur === 'elle' && !st.dolum, 'oto', `Boşluk durdurmadı: ${JSON.stringify(st)}`);
    await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    ok(!(await ayniMi()), 'oto', 'Boşluktan sonra Enter geçmedi');
  }
  // fare panelde: duraklar, çıkınca sürer
  if (await yazAc()) {
    await p.fill('#cevap', 'das Vorurteil'); await p.keyboard.press('Enter'); await p.waitForTimeout(40);
    const kutu = await p.evaluate(() => { const r = document.querySelector('#sonuc .sonuc').getBoundingClientRect(); return { x: r.left + 10, y: r.top + 5, w: r.width }; });
    await p.mouse.move(kutu.x, kutu.y); await p.mouse.move(kutu.x + 30, kutu.y + 2); await p.waitForTimeout(40);
    const d1 = await p.evaluate(() => { const a = window.__tekrar.aktuell; return a && a.oto && a.oto.dur; });
    ok(d1 === 'fare', 'oto', `fare duraklatmadı: ${d1}`);
    await p.waitForTimeout(1800);
    ok(await ayniMi(), 'oto', 'fare paneldeyken geçti');
    await p.mouse.move(2, 2); await p.waitForTimeout(40);
    const d2 = await p.evaluate(() => { const a = window.__tekrar.aktuell; return a && a.oto ? a.oto.dur : 'bitti'; });
    ok(d2 === '' || d2 === 'bitti', 'oto', `fare çıkınca sürmedi: ${d2}`);
    let gecti = false;
    for (let i = 0; i < 40 && !gecti; i++) { await p.waitForTimeout(100); gecti = !(await ayniMi()); }
    ok(gecti, 'oto', 'fare çıktıktan sonra geçmedi');
  }
  // Elle: geçmez, dolum yok
  await p.evaluate(() => { window.__tekrar.S.einst.otoGecis = 0; });
  if (await yazAc()) {
    await p.fill('#cevap', 'das Vorurteil'); await p.keyboard.press('Enter');
    await p.waitForTimeout(2000);
    ok(await ayniMi(), 'oto', 'Elle ayarında kendiliğinden geçti');
    ok(!(await p.evaluate(() => !!document.querySelector('#sonuc .dolum'))), 'oto', 'Elle ayarında dolum var');
    await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    ok(!(await ayniMi()), 'oto', 'Elle ayarında Enter geçmedi');
  }
  // Ayarlar satırı: 4 seçenek, 3,5 sn seçimi kaydedilir
  await p.evaluate(() => { window.__tekrar.S.einst.otoGecis = 2000; });
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.click('button[data-v="diger"] >> visible=true'); await p.waitForTimeout(200);
  await p.click('[data-git="ayar"][data-v="ayar"]'); await p.waitForTimeout(300);
  const secenek = await p.evaluate(() => [...document.querySelectorAll('[data-ayar="otogecis"] button')].map(b => b.dataset.val + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')));
  ok(secenek.join(',') === '1000,2000*,3500,0', 'ayar', `seçenekler: ${secenek.join(',')}`);
  await p.click('[data-ayar="otogecis"] button[data-val="3500"]'); await p.waitForTimeout(100);
  ok((await p.evaluate(() => window.__tekrar.S.einst.otoGecis)) === 3500, 'ayar', '3,5 sn kaydedilmedi');

  ok(!p.hatalar.length, 'sayfa', 'sayfa hatası: ' + p.hatalar.join(' | '));
  await b.close();
  if (fehler.length) { console.log('e2e_not: ' + fehler.length + ' hata\n' + fehler.join('\n')); process.exit(1); }
  console.log('e2e_not: geçti (artOb, uPruef, isim, kök, fiil, boşluk, cümle itirazı, metin, kendiliğinden geçiş, ayar)');
})();
