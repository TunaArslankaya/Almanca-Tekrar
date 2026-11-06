// Fiil + artikel + ayırt soruları (Playwright gerekir): node tests/e2e_fiil_artikel.js
// Gerçek durumun KOPYASI (log/zustand.json yalnız okunur). Denetlenenler:
// artOb (artikel öbek içinde): doğru biçim → richtig, cinsiyet doğru hâl yanlış → fast + 'hâl', cinsiyet yanlış → falsch + artikel kuralı;
//   log modus art, notiz bicim:artOb | hâl:…; yalnız artikel hafızası (anlam hafızası değişmez).
// artset: kurallı isimde artikel yanlışı → kuyrukta aynı kuraldan 2–3 isim (turda bir set), sırası gelince artikel flaşı.
// kalip: Türkçe kalıp → fiil + edat + hâl (pruefAbr), log bicim:kalip. kök: tek biçim (er-Präsens / Präteritum / Perfekt), 'biçim karıştı'.
// ayir: iki düğme, doğru tuş → richtig, log modus ayir id a~b, öğe hafızası değişmez. Sayfa hatası 0.
const D = require('./surucu');

const fehler = [];
const hata = (ad, m) => { fehler.push(`[${ad}] ${m}`); };
const ok = (kosul, ad, m) => { if (!kosul) hata(ad, m); };

(async () => {
  const b = await D.tarayici();
  if (!b) { console.log('Playwright yok: atlandı'); return; }
  const p = await D.sayfa(b, { mobil: true, zustand: D.zustandOku() });
  await p.evaluate(() => window.__tekrar.starte('akis'));
  await p.waitForTimeout(200);
  const sonLog = () => p.evaluate(() => { const l = window.__tekrar.S.log; return l[l.length - 1]; });
  const cevapla = async metin => { await p.fill('#cevap', metin); await p.keyboard.press('Enter'); await p.waitForTimeout(80); };
  // Devam: yanlış / küçük hatada 2,5 sn kilit (S6) ve varsa "doğrusunu bir kez yaz" kutusu: kilit açılana dek dene
  const devam = async () => {
    for (let i = 0; i < 60; i++) {
      const st = await p.evaluate(() => {
        const a = window.__tekrar.aktuell; if (!a || !a.done || a.islendi) return 'ok';
        const d = document.querySelector('#duzelt-inp'); if (d && !d.value) { d.value = a.ziel; d.dispatchEvent(new Event('input', { bubbles: true })); }
        const b = document.querySelector('#sonuc .devam-btn'); if (b && !b.disabled) b.click(); return 'bekle';
      });
      if (st === 'ok') break;
      await p.waitForTimeout(100);
    }
    await p.waitForTimeout(120);
  };
  const aktuell = () => p.evaluate(() => { const a = window.__tekrar.aktuell; return a && { bicim: a.bicim, typ: a.typ, ziel: a.ziel, done: !!a.done, urteil: a.not && a.not.ergebnis, et: a.not && a.not.etiketler, html: document.querySelector('#kart').innerText }; });

  // ---- artOb ----
  const isim = await p.evaluate(() => {
    const T = window.__tekrar, S = T.S;
    // kurallı (sonek) isim, artikel hafızası olan
    const l = Object.keys(S.items).filter(id => T.byId[id] && !T.byId[id].plOnly && S.items[id].art && S.items[id].art.S);
    const kurali = l.find(id => T.byId[id].regel && T.byId[id].regel[1] === T.byId[id].art && T.byId[id].regel[0] === 'ion') || l.find(id => T.byId[id].regel && T.byId[id].regel[1] === T.byId[id].art);
    return { kurali, herhangi: l[0], n: l.length };
  });
  ok(isim.kurali, 'artOb', 'kurallı artikel hafızalı isim bulunamadı');
  const FORM = { der: { N: 'der', A: 'den', D: 'dem', G: 'des' }, die: { N: 'die', A: 'die', D: 'der', G: 'der' }, das: { N: 'das', A: 'das', D: 'dem', G: 'des' } };
  let gorduOb = 0;
  for (let deneme = 0; deneme < 6; deneme++) {
    const id = isim.kurali;
    const m0 = await p.evaluate(id => JSON.stringify(window.__tekrar.S.items[id].m || null), id);
    const g = await p.evaluate(id => window.__tekrar.soruGoster({ id, bicim: 'artOb', tur: 'art' }), id);
    ok(g && g.bicim === 'artOb' && g.typ === 'art', 'artOb', `soru üretilmedi: ${JSON.stringify(g)}`);
    if (!g) break;
    const art = await p.evaluate(id => window.__tekrar.byId[id].art, id);
    const html = await p.evaluate(() => document.querySelector('#kart').innerHTML);
    ok(/class="bosluk"/.test(html) && /id="cevap"/.test(html), 'artOb', 'boşluk ya da yazma kutusu yok');
    const ziel = g.ziel.toLowerCase(), kas = (g.frageText.match(/\[([^\]]+)\]/) || [])[1] || '';
    if (deneme === 0) {   // doğru
      await cevapla(g.ziel);
      const a = await aktuell();
      ok(a.urteil === 'richtig', 'artOb', `doğru biçim richtig değil: ${a.urteil} (${g.ziel})`);
      await devam();
      const e = await sonLog();
      ok(e.modus === 'art' && /bicim:artOb/.test(e.notiz) && /hâl:/.test(e.notiz), 'artOb', `log: ${e.modus} ${e.notiz}`);
      const m1 = await p.evaluate(id => JSON.stringify(window.__tekrar.S.items[id].m || null), id);
      ok(m0 === m1, 'artOb', 'anlam hafızası değişti');
      gorduOb++;
    } else if (deneme === 1) {   // cinsiyet doğru, hâl yanlış
      const ks = Object.keys(FORM[art]).filter(k => FORM[art][k] !== ziel);
      if (!ks.length) continue;
      await cevapla(FORM[art][ks[0]]);
      const a = await aktuell();
      ok(a.urteil === 'fast' && (a.et || []).includes('hâl'), 'artOb', `hâl yanlışı fast + hâl değil: ${a.urteil} ${JSON.stringify(a.et)} (${FORM[art][ks[0]]} ↔ ${ziel} ${kas})`);
      await devam();
    } else if (deneme === 2) {   // cinsiyet yanlış → falsch + kural + artset kuyruğu
      const yanlisArt = ['der', 'die', 'das'].find(x => x !== art);
      const yf = Object.values(FORM[yanlisArt]).find(f => !Object.values(FORM[art]).includes(f));
      await p.evaluate(() => { window.__tekrar.ot.artSet = false; });
      await cevapla(yf);
      const a = await aktuell();
      ok(a.urteil === 'falsch', 'artOb', `cinsiyet yanlışı falsch değil: ${a.urteil} (${yf})`);
      ok(/değil/.test(a.html) || /Kural|kural/.test(a.html), 'artOb', 'yanlışta artikel kuralı / karşıt not yok');
      ok(!/aslında doğru|yazım hatasıydı/.test(a.html), 'artOb', 'artOb yanlışında itiraz düğmesi var');
      await devam();
      const ky = await p.evaluate(() => window.__tekrar.ot.kuyruk.filter(k => k.neden === 'artset').map(k => ({ id: k.id, kural: k.kural, bicim: k.bicim })));
      ok(ky.length >= 2 && ky.every(k => k.bicim === 'artikel'), 'artset', `artset kuyruğu: ${JSON.stringify(ky)}`);
      // set sırası gelince: artikel flaşı + "aynı kural" çipi
      const s = await D.durum(p);
      ok(s.art && s.neden === 'artset', 'artset', `sıradaki soru artset flaşı değil: ${JSON.stringify({ tur: s.tur, neden: s.neden })}`);
      const cip = await p.evaluate(() => document.querySelector('#durum-satiri').innerText);
      ok(/aynı kural/.test(cip), 'artset', `çip yok: ${cip}`);
      // set flaşını cevapla: log notiz artset, yeniden kuyruğa girmez
      await D.adim(p, { dogru: 0 });
      const e = await sonLog();
      ok(e.modus === 'art' && /artset/.test(e.notiz), 'artset', `log: ${e.modus} ${e.notiz}`);
      const yeniden = await p.evaluate(id => window.__tekrar.ot.kuyruk.filter(k => k.neden === 'yanlis' && k.id === id).length, s.id);
      ok(!yeniden, 'artset', 'yanlış set flaşı yeniden kuyruğa girdi');
      const set2 = await p.evaluate(() => { const T = window.__tekrar; T.ot.artSet = true; return T.ot.kuyruk.filter(k => k.neden === 'artset').length; });
      ok(set2 <= 2, 'artset', 'set büyüdü (turda bir set)');
    }
  }
  // edat öbeği (cümle yoksa): Rezept gibi
  const obek = await p.evaluate(() => {
    const T = window.__tekrar, out = [];
    for (let i = 0; i < 30; i++) { const g = T.soruGoster({ id: 'n0994', bicim: 'artOb', tur: 'art' }); if (g) out.push(g.frageText + ' = ' + g.ziel); }
    return out;
  });
  ok(obek.length === 30 && obek.every(x => /^(mit|ohne|für|wegen) ___ Rezepts? \[(Dat|Akk|Gen)\] = (dem|das|des)$/.test(x) || /___/.test(x)), 'artOb', `öbek: ${obek.slice(0, 4).join(' · ')}`);
  ok(obek.some(x => /^mit ___ Rezept \[Dat\] = dem$/.test(x)), 'artOb', `mit + Dat yok: ${obek.slice(0, 6).join(' · ')}`);

  // ---- kalip ----
  const kal = await p.evaluate(() => {
    const T = window.__tekrar, v = T.VERBEN.find(v => v.id === 'v091') || T.VERBEN.find(v => v.obj.some(o => o.p));
    const g = T.soruGoster({ id: v.id, bicim: 'kalip', b: 2 });
    const ziel = v.anz.replace('sich(D)', 'sich').split(' ').map(w => { const o = v.obj.find(o => o.p === w); return o ? w + ' ' + o.k : w; }).join(' ');
    return { g, ziel, html: document.querySelector('#kart').innerText };
  });
  ok(kal.g && kal.g.bicim === 'kalip' && kal.g.typ === 'abr', 'kalip', `soru: ${JSON.stringify(kal.g)}`);
  ok(/fiil \+ edat \+ hâl/.test(kal.html), 'kalip', 'başlık yok');
  await cevapla(kal.ziel);
  { const a = await aktuell(); ok(a.urteil === 'richtig', 'kalip', `doğru kalıp richtig değil: ${a.urteil} (${kal.ziel})`); }
  await devam();
  { const e = await sonLog(); ok(e.modus === 'abr' && /bicim:kalip/.test(e.notiz), 'kalip', `log: ${e.modus} ${e.notiz}`); }
  // hâl yanlış → fast + hâl
  await p.evaluate(() => window.__tekrar.soruGoster({ id: 'v091', bicim: 'kalip', b: 2 }));
  await cevapla('sich bedanken bei A für A');
  { const a = await aktuell(); ok(a.urteil === 'fast' && (a.et || []).includes('hâl'), 'kalip', `hâl yanlışı: ${a.urteil} ${JSON.stringify(a.et)}`); }
  await devam();
  // edatsız fiilde kalip → yazma
  { const g = await p.evaluate(() => { const T = window.__tekrar, v = T.VERBEN.find(v => !v.obj.some(o => o.p)); return T.soruGoster({ id: v.id, bicim: 'kalip', b: 2 }); }); ok(g && g.bicim === 'yaz', 'kalip', `edatsız fiilde yazma değil: ${JSON.stringify(g)}`); }

  // ---- kök: tek biçim ----
  const kok = await p.evaluate(() => {
    const T = window.__tekrar, out = [];
    T.VERBEN.filter(v => v.stark && v.p2).slice(0, 40).forEach(v => { const g = T.soruGoster({ id: v.id, bicim: 'kok', tur: 'kok' }); if (g) out.push({ id: v.id, ziel: g.ziel, ft: g.frageText, p2: v.p2s, inf: v.inf }); });
    return out;
  });
  ok(kok.length >= 20, 'kök', `kök soruları: ${kok.length}`);
  ok(kok.every(k => !/,/.test(k.ziel)), 'kök', `birden çok biçim soruluyor: ${kok.filter(k => /,/.test(k.ziel)).slice(0, 3).map(k => k.ziel).join(' · ')}`);
  ok(kok.some(k => / — Perfekt/.test(k.ft)) && kok.some(k => / — Präsens/.test(k.ft)), 'kök', `biçim çeşidi yok: ${[...new Set(kok.map(k => k.ft.split(' | ')[0].split(' — ')[1]))].join(', ')}`);
  ok(kok.every(k => !/ — Perfekt/.test(k.ft) || k.ziel.split(' ').length === 2), 'kök', 'Perfekt yardımcı fiil + Partizip değil');
  // doğru cevap → richtig; Präsens sorusuna Partizip → 'biçim karıştı'
  const pr = kok.find(k => / — Präsens/.test(k.ft));
  if (pr) {
    for (let i = 0; i < 10; i++) { const g = await p.evaluate(id => window.__tekrar.soruGoster({ id, bicim: 'kok', tur: 'kok' }), pr.id); if (g && / — Präsens/.test(g.frageText)) break; }
    await cevapla(pr.p2);
    const a = await aktuell();
    ok(a.urteil === 'falsch' && (a.et || []).some(x => /biçim karıştı/.test(x)), 'kök', `Präsens'e Partizip: ${a.urteil} ${JSON.stringify(a.et)}`);
    await devam();
    const e = await sonLog();
    ok(e.modus === 'stamm' && /bicim:kok/.test(e.notiz) && /biçim karıştı/.test(e.notiz), 'kök', `log: ${e.modus} ${e.notiz}`);
  }
  const pf = kok.find(k => / — Perfekt/.test(k.ft));
  if (pf) {
    for (let i = 0; i < 10; i++) { const g = await p.evaluate(id => window.__tekrar.soruGoster({ id, bicim: 'kok', tur: 'kok' }), pf.id); if (g && / — Perfekt/.test(g.frageText)) { pf.ziel = g.ziel; break; } }
    await cevapla(pf.ziel);
    const a = await aktuell();
    ok(a.urteil === 'richtig', 'kök', `Perfekt doğru cevap: ${a.urteil} (${pf.ziel})`);
    await devam();
    // yalnız Partizip (yardımcı fiil yok) → fast
    for (let i = 0; i < 10; i++) { const g = await p.evaluate(id => window.__tekrar.soruGoster({ id, bicim: 'kok', tur: 'kok' }), pf.id); if (g && / — Perfekt/.test(g.frageText)) { pf.ziel = g.ziel; break; } }
    await cevapla(pf.ziel.split(' ').slice(1).join(' '));
    const a2 = await aktuell();
    ok(a2.urteil === 'fast' && (a2.et || []).some(x => /yardımcı fiil/.test(x)), 'kök', `yardımcı fiilsiz: ${a2.urteil} ${JSON.stringify(a2.et)}`);
    await devam();
  }
  // kokSatz (yeni kök): Partizip; yardımcı fiili de yazsa doğru
  const ks = await p.evaluate(() => { const T = window.__tekrar, v = T.VERBEN.find(v => v.stark && v.p2 && v.inf === 'fahren') || T.VERBEN.find(v => v.stark && v.p2); const g = T.soruGoster({ id: v.id, bicim: 'kokSatz', tur: 'kok' }); return { g, aux: v.aux }; });
  if (ks.g) {
    await cevapla(`${ks.aux} ${ks.g.ziel}`);
    const a = await aktuell();
    ok(a.urteil === 'richtig', 'kökSatz', `yardımcı fiil + Partizip: ${a.urteil} (${ks.aux} ${ks.g.ziel})`);
    await devam();
  }

  // ---- ayir ----
  // cihaz log'u (son 3000 satır) zustand.json'da yok: yazmada iki kez "die Regel" (hedef Geduld), bir kez yazım hatası (Gedult: karışma değil)
  await p.evaluate(() => {
    const T = window.__tekrar, S = T.S, id = l => Object.values(T.byId).find(n => n.lemma === l).id, ge = id('Geduld'), re = id('Regel');
    const satir = (a, ant) => ({ zeit: '2026-11-05 10:00:00', modus: 'wort', id: a + ':wort', item: '', frage: '', antwort: ant, ergebnis: 'falsch', loesung: '', notiz: '' });
    S.log.push(satir(ge, 'die Regel'), satir(ge, 'die Regel'), satir(ge, 'die Gedult'));
    [ge, re].forEach(x => { if (!S.items[x]) S.items[x] = { seit: Date.now(), tanit: Date.now() - 86400000 }; });
  });
  const cift = await p.evaluate(() => { const l = window.__tekrar.ayirCiftleri(); return { n: l.length, ilk: l.slice(0, 8).map(x => `${x.a}~${x.b}:${x.n}`) }; });
  ok(cift.n === 1 && /:2$/.test(cift.ilk[0]), 'ayir', `log'dan çift: ${JSON.stringify(cift)}`);
  console.log(`karışan çiftler (log'dan): ${cift.n} · ${cift.ilk.join(' ')}`);
  const ay = await p.evaluate(() => {
    const T = window.__tekrar, S = T.S, ids = Object.keys(S.items).filter(id => /^n/.test(id) && T.byId[id] && S.items[id].m);
    const a = ids[0], b = ids.find(x => x !== a && T.byId[x].tr.split(';')[0] !== T.byId[a].tr.split(';')[0]);
    const once = JSON.stringify([S.items[a], S.items[b]]);
    const g = T.soruGoster({ id: a, bicim: 'ayir', diger: b });
    const q = T.aktuell;
    return { a, b, g, ok: q.ayir && q.ayir.ok, once, html: document.querySelector('#kart').innerHTML };
  });
  ok(ay.g && ay.g.bicim === 'ayir', 'ayir', `soru: ${JSON.stringify(ay.g)}`);
  ok((ay.html.match(/data-ayir=/g) || []).length === 2, 'ayir', 'iki düğme yok');
  await p.waitForTimeout(450);
  await p.keyboard.press(String(ay.ok + 1));
  await p.waitForTimeout(60);
  { const a = await aktuell(); ok(a.urteil === 'richtig', 'ayir', `doğru tuş richtig değil: ${a.urteil}`); }
  await devam(); await p.waitForTimeout(300);
  { const e = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'ayir').pop()); ok(e && e.id === `${ay.a}~${ay.b}` && e.ergebnis === 'richtig' && /bicim:ayir/.test(e.notiz), 'ayir', `log: ${JSON.stringify(e)}`); }
  { const sonra = await p.evaluate(([a, b]) => JSON.stringify([window.__tekrar.S.items[a], window.__tekrar.S.items[b]]), [ay.a, ay.b]); ok(sonra === ay.once, 'ayir', 'öğe hafızası değişti'); }
  // yanlış tuş → falsch, iki kelimenin anlamı panelde
  await p.evaluate(([a, b]) => window.__tekrar.soruGoster({ id: a, bicim: 'ayir', diger: b }), [ay.a, ay.b]);
  await p.waitForTimeout(450);
  { const okI = await p.evaluate(() => window.__tekrar.aktuell.ayir.ok); await p.keyboard.press(String(2 - okI)); }
  await p.waitForTimeout(60);
  { const a = await aktuell(); ok(a.urteil === 'falsch' && (a.html.match(/=/g) || []).length >= 2, 'ayir', `yanlış: ${a.urteil}`); }
  await devam();
  // turda kuyruğa koyma (log'da çift varsa)
  if (cift.n) {
    const k = await p.evaluate(() => { const T = window.__tekrar; T.S.gs4 && (T.S.gs4.ayir = 0); T.S.log = T.S.log.filter(e => e.modus !== 'ayir'); return { koy: T.ayirKoy(), k: T.ot.kuyruk.filter(x => x.neden === 'ayir').length }; });
    console.log(`ayirKoy: ${JSON.stringify(k)}`);
    ok(k.koy && k.k === 1, 'ayir', `kuyruk: ${JSON.stringify(k)}`);
    // turda: ekrandaki soru cevaplanınca sıradaki ayir (sürücü 1 / 2 tuşu)
    let gordu = false;
    for (let i = 0; i < 4 && !gordu; i++) { const s = await D.durum(p); if (s.tur === 'ayir') { gordu = true; const r = await D.adim(p, { dogru: 1 }); ok(r.ad === 'ayir', 'ayir', `sürücü: ${r.ad}`); } else await D.adim(p, { dogru: 1 }); }
    ok(gordu, 'ayir', 'kuyruktaki ayır sorusu turda gelmedi');
    const e = await p.evaluate(() => window.__tekrar.S.log.filter(e => e.modus === 'ayir').pop());
    ok(e && /~/.test(e.id) && e.ergebnis === 'richtig', 'ayir', `tur log: ${JSON.stringify(e)}`);
  }

  ok(!p.hatalar.length, 'sayfa', p.hatalar.slice(0, 3).join(' | '));
  await b.close();
  if (fehler.length) { console.log(fehler.join('\n')); console.log(`e2e_fiil_artikel: ${fehler.length} hata`); process.exit(1); }
  console.log('e2e_fiil_artikel: tamam');
})().catch(e => { console.error(e); process.exit(1); });
