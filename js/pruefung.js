// Prüfung bölümü: Goethe-Zertifikat B1 provası.
// Lesen: Übungssatz'ın 5 Teil'i süreli, cevap kâğıdı, puan (ham/30 × 3,33; 60 geçer), yanlışlar tek tek.
// Schreiben: Teil 1/2/3 süreli (20/25/15 dk), ~80/80/40 kelime, görev maddeleri işaretlenir; gönderim log `text` ile → Claude düzeltir.
// Sprechen: 15 dk hazırlık (not alanı) → Teil 1 planlama (TTS partner replikleri) → Teil 2 sunum 5 slayt → Teil 3 soru/geri bildirim; kayıt tarayıcıda.
// Hören: resmî ses yok; DW metinleriyle dinleme alıştırmasına yönlendirir (Okuma'daki ses). Durum: S.pruefung = { sonuc: [...], tarih }.
// Bağlantı: app.js `Pruefung.init(api)`; ekran `Pruefung.render()`; tıklama `[data-p]` → `Pruefung.klick(e)`; tuş `Pruefung.tus(e)`.
(function (root) {
  'use strict';
  let api = null, S = null;
  const SET = { id: 'ue-erw', titel: 'Goethe B1 Übungssatz Erwachsene' };
  const LESEN_DK = { 1: 10, 2: 20, 3: 10, 4: 15, 5: 10 };
  const SCHREIBEN = { 1: { dk: 20, woerter: 80, typ: 'email', ad: 'Teil 1 · arkadaşa e-posta', tr: 'Arkadaşına (du) ~80 kelime: 3 maddenin hepsine değin.' }, 2: { dk: 25, woerter: 80, typ: 'forum', ad: 'Teil 2 · forum görüşü', tr: 'Bir foruma görüşünü yaz (~80 kelime): görüş + gerekçe + örnek.' }, 3: { dk: 15, woerter: 40, typ: 'formell', ad: 'Teil 3 · resmî e-posta', tr: 'Resmî/yarı resmî kısa e-posta (Sie, ~40 kelime): hitap, neden, rica, kapanış.' } };
  const T1 = [
    ['sp1-01', 'Ihr Deutschkurs ist bald zu Ende. Sie möchten zusammen ein Abschiedsfest für die Gruppe organisieren.', ['Wann und wo feiern?', 'Essen und Getränke?', 'Geschenk für die Lehrerin?', 'Wer macht was?'], 'Kursun veda partisini birlikte planlayın.'],
    ['sp1-02', 'Ein Freund aus Ihrem Kurs zieht am Samstag in eine neue Wohnung. Sie möchten ihm zusammen beim Umzug helfen.', ['Wann treffen Sie sich?', 'Wie transportieren Sie die Möbel?', 'Was bringen Sie mit?', 'Wer kümmert sich um das Essen?'], 'Kurstan bir arkadaşın taşınmasına birlikte yardım edin.'],
    ['sp1-03', 'Sie möchten zusammen am Wochenende einen Tagesausflug an die Nordsee machen.', ['Wann fahren Sie los?', 'Wie fahren Sie hin?', 'Was möchten Sie dort machen?', 'Was nehmen Sie mit?'], 'Hafta sonu Kuzey Denizi\'ne günübirlik gezi planlayın.'],
    ['sp1-04', 'Eine Kollegin hat nächste Woche Geburtstag. Sie möchten zusammen eine kleine Überraschung für sie planen.', ['Wann und wo?', 'Wen laden Sie ein?', 'Welches Geschenk?', 'Wer übernimmt welche Aufgabe?'], 'İş arkadaşınıza doğum günü sürprizi planlayın.'],
    ['sp1-05', 'Sie möchten sich zusammen auf die B1-Prüfung vorbereiten und eine Lerngruppe gründen.', ['Wann und wie oft?', 'Wo lernen (Bibliothek, online …)?', 'Was üben Sie zuerst?', 'Wer kann noch mitmachen?'], 'B1 sınavı için birlikte çalışma grubu kurun.'],
    ['sp1-06', 'Ihre ältere Nachbarin ist krank und kann eine Woche lang nicht aus dem Haus gehen. Sie möchten ihr zusammen helfen.', ['Wer kauft wann ein?', 'Was braucht sie?', 'Wer geht mit ihrem Hund spazieren?', 'Wann besuchen Sie sie?'], 'Hasta komşunuza bir hafta birlikte yardım edin.'],
  ];
  const T2 = [['sp2-01', 'Online lernen oder im Kursraum lernen?', 'Online mı, sınıfta mı öğrenmek?'], ['sp2-02', 'Brauchen wir in der Stadt noch ein eigenes Auto?', 'Şehirde hâlâ kendi arabamıza ihtiyacımız var mı?'], ['sp2-03', 'Allein wohnen oder in einer Wohngemeinschaft?', 'Yalnız mı, öğrenci evinde mi yaşamak?'], ['sp2-04', 'Wie viel Sport braucht man, um gesund zu bleiben?', 'Sağlıklı kalmak için ne kadar spor gerekir?'], ['sp2-05', 'Sollten Kinder schon in der Grundschule ein Smartphone haben?', 'Çocukların ilkokulda akıllı telefonu olmalı mı?'], ['sp2-06', 'Selbst kochen oder Essen bestellen?', 'Kendin mi pişirmeli, yemek mi sipariş etmeli?'], ['sp2-07', 'Fast Food – gut oder schlecht?', 'Fast food iyi mi kötü mü?'], ['sp2-08', 'Arbeiten im Ausland – eine gute Idee?', 'Yurt dışında çalışmak iyi fikir mi?']];
  const FOLIEN = ['Thema vorstellen: Worum geht es? Wie ist die Präsentation aufgebaut?', 'Meine Erfahrungen / meine Situation', 'Die Situation in meinem Heimatland (mit Beispielen)', 'Vor- und Nachteile und meine Meinung (mit Beispielen)', 'Abschluss und Dank'];
  const T3_FRAGEN = ['Was ist für Sie persönlich der wichtigste Punkt?', 'Hat sich Ihre Meinung dazu in Deutschland geändert?', 'Was würden Sie einem Freund oder einer Freundin raten?'];
  const PARTNER = ['Was schlägst du vor?', 'Gute Idee. Und was machen wir mit dem nächsten Punkt?', 'Ich bin nicht sicher. Hast du noch eine andere Idee?', 'Okay, einverstanden. Und wer macht das?'];
  const LISTE = { 1: ['4 maddenin hepsine değindim', 'En az 2 öneri yaptım (Wie wäre es …? / Wir könnten …)', 'Partnerin önerisine tepki verdim (Gute Idee, aber … / Einverstanden.)', 'Sonunda karar verdik (wer macht was)', 'Konjunktiv II kullandım (könnte, würde, hätte)', '~3 dakika konuştum, uzun duraksama yoktu'],
    2: ['5 slaytın hepsi', 'Giriş + yapı cümlesi (Zuerst …, dann …, zum Schluss …)', 'Kendi deneyimim (Perfekt / Präteritum)', 'Ülkemden somut örnek', 'Artı ve eksi + görüşüm + gerekçe (weil / obwohl / deshalb)', 'Kapanış + teşekkür', '~3 dakika'],
    3: ['Soruya doğrudan cevap verdim', 'Partnere geri bildirim (Mir hat gefallen, dass … / Neu war für mich, dass …)', 'Bir soru sordum'] };
  const GL_OPT = { rf: () => [['richtig', 'Richtig'], ['falsch', 'Falsch']], jn: () => [['ja', 'Ja'], ['nein', 'Nein']], abc: a => a.o.map((o, i) => ['abc'[i], 'abc'[i] + ') ' + o]), zu: () => 'abcdefghi0'.split('').map(x => [x, x]) };

  const st = () => (S.pruefung = S.pruefung || { sonuc: [], tarih: '' });
  const now = () => api.now();
  const el = () => api.kart();
  const esc = s => api.esc(s == null ? '' : String(s));
  const dk = ms => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
  const lesenSet = () => (root.GOETHE_LESEN || []).filter(x => x.aufgaben && x.aufgaben.length);
  const puan100 = (roh, n) => Math.round(roh / n * 100 / 3.33 * 3.33) ;
  const goethePuan = (roh, n) => Math.min(100, Math.round(roh * (100 / n)));
  let ses = null;   // { ekran, ... }
  let tik = null;
  const tikBasla = () => { tikDur(); tik = setInterval(() => { if (!ses) return tikDur(); if (ses.bitis && now() >= ses.bitis && !ses.bitti) { sureDoldu(); return; } const t = el().querySelector('.pr-zaman'); if (t && ses.bitis) t.textContent = dk(Math.max(0, ses.bitis - now())); }, 1000); };
  const tikDur = () => { if (tik) clearInterval(tik); tik = null; };

  // ---------- ana ekran ----------
  function render() {
    if (!ses) ses = { ekran: 'ana' };
    api.durum('');
    ({ ana: renderAna, lesen: renderLesen, lesenSon: renderLesenSon, schreiben: renderSchreiben, sprechen: renderSprechen, hoeren: renderHoeren })[ses.ekran]();
    api.tastatur && api.tastatur();
  }
  function sonPuan(modul) { const l = st().sonuc.filter(x => x.modul === modul); return l.length ? l[l.length - 1] : null; }
  function renderAna() {
    tikDur();
    const p = st(), tarih = p.tarih, gun = tarih ? Math.round((new Date(tarih) - new Date(api.tag())) / 86400000) : null;
    const kart = (modul, ad, ikon, alt, btn) => { const s = sonPuan(modul); return `<div class="pr-kart"><div class="pr-kart-ust"><span class="pr-ikon">${ikon}</span><b>${ad}</b>${s ? `<span class="durum-pil ${s.puan >= 60 ? 'sitzt' : 'schwach'}">son: ${s.puan}</span>` : '<span class="soluk">henüz yok</span>'}</div><div class="soluk">${alt}</div><div class="sira">${btn}</div></div>`; };
    el().innerHTML = `<div class="tur"><span class="yeni">prüfung</span><span>Goethe-Zertifikat B1 provası · her modül 100 puan, 60 geçer</span></div>
      <div class="pr-tarih">${tarih ? (gun >= 0 ? `📅 Sınava <b>${gun}</b> gün (${esc(tarih)})` : `📅 Sınav tarihi geçti (${esc(tarih)})`) : '📅 Sınav tarihi: <button class="btn mini" data-p="tarih" type="button">gir</button>'}${tarih ? ' <button class="btn mini" data-p="tarih" type="button">değiştir</button>' : ''}</div>
      ${kart('lesen', 'Lesen', '📖', '5 Teil, 30 madde, 65 dk. Übungssatz\'ın gerçek metinleri. Mini: tek Teil (10–20 dk).', `<button class="btn ana" data-p="lesen-tam" type="button">Tam Lesen · 65 dk</button><button class="btn" data-p="lesen-mini" type="button">Mini: en zayıf Teil</button>`)}
      ${kart('hoeren', 'Hören', '🎧', 'Resmî ses dosyası uygulamada yok (telif). Dinleme kası için: Okuma\'daki DW metinlerini önce dinle, sonra oku; Goethe\'nin ücretsiz Modellsatz sesini goethe.de\'den dinle.', `<button class="btn" data-p="hoeren" type="button">Dinleme alıştırması</button>`)}
      ${kart('schreiben', 'Schreiben', '✏️', 'Teil 1 e-posta (20 dk, 80 kelime) · Teil 2 forum (25 dk, 80) · Teil 3 resmî (15 dk, 40). Claude düzeltir ve puanlar.', `<button class="btn ana" data-p="schreiben" data-teil="1" type="button">Teil 1</button><button class="btn" data-p="schreiben" data-teil="2" type="button">Teil 2</button><button class="btn" data-p="schreiben" data-teil="3" type="button">Teil 3</button>`)}
      ${kart('sprechen', 'Sprechen', '🎙️', '15 dk hazırlık → Teil 1 birlikte planlama (partner sesi) → Teil 2 sunum (5 slayt, 3 dk) → Teil 3 soru ve geri bildirim. Kendini kaydet, listeyle değerlendir.', `<button class="btn ana" data-p="sprechen" type="button">Sınav modu</button>`)}
      ${p.sonuc.length ? `<h2>Geçmiş</h2><div class="pr-gecmis">${p.sonuc.slice(-8).reverse().map(s => `<div class="oge"><span class="de">${esc(s.modul)} · ${s.mod === 'mini' ? 'mini' : 'tam'}</span><span class="tr">${esc(s.zeit)} · ${s.roh != null ? `${s.roh}/${s.n} doğru · ` : ''}${s.puan != null ? `<b>${s.puan}</b> puan` : esc(s.not || '')}</span></div>`).join('')}</div>` : ''}
      <details class="ceviri"><summary>Taktikler</summary><ul class="erkl"><li><b>Lesen:</b> Teil 2'ye 20 dk ayır; Teil 3'te her ilan bir kez kullanılır, bir durumun cevabı 0; Teil 4'te kişinin görüşü sorulur (ja/nein), olgu değil.</li><li><b>Hören:</b> dinlemeden önce soruyu oku, anahtar kelimeyi işaretle; seste sorudaki kelime değil eş anlamlısı geçer; Teil 2–3 tek dinleme.</li><li><b>Schreiben:</b> 3 maddenin hepsi (eksik madde = büyük kayıp), B1 yapıları (weil/dass/obwohl, Konjunktiv II), uzun yazma; du/Sie karıştırma.</li><li><b>Sprechen:</b> Teil 1'de öneri + tepki + karar; Teil 2'de 5 slayt sırayla, 2–3 dk; Teil 3'te soruya doğrudan cevap.</li></ul></details>`;
  }
  // ---------- Lesen ----------
  function lesenBaslat(mod, teil) {
    const alle = lesenSet();
    const texte = mod === 'mini' ? alle.filter(x => +x.teil === teil) : alle;
    if (!texte.length) { api.toast('Lesen seti yok.'); return; }
    const sure = mod === 'mini' ? LESEN_DK[teil] : 65;
    ses = { ekran: 'lesen', mod, teil: mod === 'mini' ? teil : 1, texte, cevap: {}, start: now(), bitis: now() + sure * 60000, sure };
    render(); tikBasla();
  }
  function sureDoldu() { if (ses && ses.ekran === 'lesen') { ses.bitti = true; api.toast('Süre doldu: cevaplar değerlendiriliyor.'); lesenBitir(); } else if (ses && ses.ekran === 'schreiben') { api.toast('Süre doldu! Gönder.'); tikDur(); const t = el().querySelector('.pr-zaman'); if (t) t.textContent = '0:00'; } else if (ses && ses.ekran === 'sprechen') { ses.bitis = null; tikDur(); sprechenIleri(); } }
  function renderLesen() {
    const teiller = [...new Set(ses.texte.map(x => +x.teil))];
    const texte = ses.texte.filter(x => +x.teil === ses.teil);
    const cevaplanan = ses.texte.reduce((a, L) => a + L.aufgaben.filter((_, i) => ses.cevap[L.id + ':' + i] != null).length, 0), toplam = ses.texte.reduce((a, L) => a + L.aufgaben.length, 0);
    const sekme = teiller.length > 1 ? `<div class="chips pr-teiller">${teiller.map(t => `<button class="chip${t === ses.teil ? ' aktif' : ''}" data-p="teil" data-teil="${t}" type="button">Teil ${t} <span class="soluk">${LESEN_DK[t]} dk</span></button>`).join('')}</div>` : '';
    const metin = texte.map(L => `<div class="pr-metin"><div class="soru">${esc(L.titel)}</div><div class="soluk">${esc(L.anweisung || '')}${L.beispiel ? `<br>Beispiel: ${esc(L.beispiel)}` : ''}</div>
      <div class="paket-text">${L.text.split('\n').map(par => `<p>${esc(par)}</p>`).join('')}</div>
      <div class="gl-aufgaben">${L.aufgaben.map((a, i) => { const k = L.id + ':' + i, c = ses.cevap[k]; const opts = GL_OPT[L.art](a); return `<div class="gl-auf"><div><b>${a.n}</b> ${esc(a.s)}</div><div class="gl-opts">${opts.map(([v, t]) => `<button class="btn mini gl-opt${c === v ? ' secili' : ''}" data-p="cevap" data-k="${esc(k)}" data-v="${esc(v)}" type="button">${esc(t)}</button>`).join(L.art === 'abc' ? '<br>' : ' ')}</div></div>`; }).join('')}</div></div>`).join('');
    el().innerHTML = `<div class="tur"><span class="yeni">lesen · ${ses.mod === 'mini' ? 'mini' : 'tam sınav'}</span><span>${cevaplanan}/${toplam} cevaplandı</span><span class="pr-zaman">${dk(Math.max(0, ses.bitis - now()))}</span></div>${sekme}${metin}
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="lesen-bitir" type="button">${cevaplanan < toplam ? `Bitir (${toplam - cevaplanan} boş)` : 'Bitir ve puanla'}</button><button class="btn" data-p="iptal" type="button">Vazgeç</button></div>`;
  }
  function lesenBitir() {
    tikDur();
    const t = now(), zeit = api.zeitStr(t), teile = {};
    let roh = 0, n = 0;
    const yanlis = [];
    ses.texte.forEach(L => {
      const tk = +L.teil; teile[tk] = teile[tk] || { d: 0, n: 0 };
      L.aufgaben.forEach((a, i) => {
        const c = ses.cevap[L.id + ':' + i], ok = c === a.l; n++; teile[tk].n++; if (ok) { roh++; teile[tk].d++; } else yanlis.push({ L, a, c });
        api.logEintrag({ modus: 'pruefung', id: `pr:${SET.id}:lesen:${tk}:${a.n}`, item: SET.titel, frage: a.s, antwort: c == null ? '' : c, ergebnis: ok ? 'richtig' : 'falsch', loesung: a.l, notiz: `mod:${ses.mod}${c == null ? ' | boş' : ''}` });
      });
    });
    const puan = goethePuan(roh, n), kullanilan = Math.round((t - ses.start) / 60000);
    const sonuc = { zeit, modul: 'lesen', mod: ses.mod, roh, n, puan, teile, dk: kullanilan };
    st().sonuc.push(sonuc);
    api.logEintrag({ modus: 'pruefung', id: `pr:${SET.id}:lesen${ses.mod === 'mini' ? ':' + ses.teil : ''}`, item: SET.titel, frage: ses.mod, antwort: '', ergebnis: puan >= 60 ? 'bestanden' : 'nicht-bestanden', loesung: '', notiz: `puan:${puan} | roh:${roh}/${n} | ${Object.keys(teile).map(k => `t${k}:${teile[k].d}/${teile[k].n}`).join(' ')} | dk:${kullanilan}/${ses.sure} | mod:${ses.mod}` });
    api.heuteM('pruefung').n++; api.xpEkle(ses.mod === 'mini' ? 30 : 80);
    api.save();
    ses = { ekran: 'lesenSon', sonuc, yanlis };
    render();
    if (puan >= 60 && api.konfeti) api.konfeti();
  }
  function renderLesenSon() {
    const s = ses.sonuc, gecti = s.puan >= 60;
    const zayif = Object.keys(s.teile).map(k => [k, s.teile[k]]).sort((a, b) => a[1].d / a[1].n - b[1].d / b[1].n)[0];
    el().innerHTML = `<div class="tur-sonu"><div class="ts-rozet">${gecti ? '🏆' : '🌱'}</div><div class="ts-baslik">Lesen: <b>${s.puan}</b> / 100 · ${gecti ? 'bestanden' : 'noch nicht'}</div>
      <div class="ts-istatlar"><div class="ts-istat"><b>${s.roh}/${s.n}</b>doğru</div><div class="ts-istat"><b>${s.dk}</b>dakika</div><div class="ts-istat"><b>${Object.keys(s.teile).length}</b>Teil</div></div>
      <div class="tablo-kap"><table class="tablo"><thead><tr><th>Teil</th><th class="num">doğru</th><th>not</th></tr></thead><tbody>${Object.keys(s.teile).map(k => `<tr><td>Teil ${k}</td><td class="num">${s.teile[k].d}/${s.teile[k].n}</td><td>${s.teile[k].d / s.teile[k].n >= 0.6 ? '✓' : 'çalış'}</td></tr>`).join('')}</tbody></table></div>
      ${!gecti ? `<div class="kural">60 için ${Math.ceil(18 - s.roh * 30 / s.n)} doğru daha gerekiyordu${zayif ? `; en zayıf Teil ${zayif[0]} (${zayif[1].d}/${zayif[1].n})` : ''}.</div>` : ''}
      ${ses.yanlis.length ? `<h2>Yanlışlar</h2>${ses.yanlis.map(({ L, a, c }) => `<div class="oge"><span class="de"><b>${a.n}</b> ${esc(a.s)}${a.o ? `<br><span class="soluk">${a.o.map((o, i) => 'abc'[i] + ') ' + esc(o)).join(' · ')}</span>` : ''}</span><span class="tr">senin: <s>${esc(c == null ? '—' : c)}</s> → doğru: <b>${esc(a.l)}</b> <span class="soluk">(${esc(L.titel)})</span></span></div>`).join('')}` : '<div class="kural">Hepsi doğru!</div>'}
      <div class="sira ts-btns"><button class="btn ana" data-p="ana" type="button">Prüfung</button><button class="btn" data-git="ana" type="button">Bugün</button></div></div>`;
  }
  // ---------- Schreiben ----------
  function schreibenBaslat(teil) {
    const T = SCHREIBEN[teil];
    const A = (root.AUFGABEN || []).filter(a => a.typ === T.typ);
    if (!A.length) { api.toast('Bu türde görev yok.'); return; }
    const done = new Set(((S.texte) || []).map(x => x.id));
    const c = A.filter(a => !done.has(a.id)); const a = (c.length ? c : A)[Math.floor(Math.random() * (c.length ? c : A).length)];
    ses = { ekran: 'schreiben', teil, a, start: now(), bitis: now() + T.dk * 60000, kalip: false, madde: {} };
    render(); tikBasla();
  }
  function renderSchreiben() {
    const T = SCHREIBEN[ses.teil], a = ses.a, teile = a.de.split(' · '), text = ses.metin || '';
    const n = text.trim() ? text.trim().split(/\s+/).length : 0;
    el().innerHTML = `<div class="tur"><span class="yeni">schreiben · ${esc(T.ad)}</span><span>${T.woerter} kelime</span><span class="pr-zaman">${dk(Math.max(0, ses.bitis - now()))}</span></div>
      <div class="soru">${esc(teile[0])}</div>${teile.length > 1 ? `<div class="pr-madde">${teile.slice(1).map((m, i) => `<label><input type="checkbox" data-p="madde" data-i="${i}"${ses.madde[i] ? ' checked' : ''}> ${esc(m)}</label>`).join('')}</div>` : ''}
      <div class="soluk">${esc(a.tr)} · ${esc(T.tr)}</div>
      <textarea id="pr-metin" class="pr-text" rows="9" placeholder="Hier schreiben …" spellcheck="false">${esc(text)}</textarea>
      <div class="sira"><span class="soluk pr-say"><b>${n}</b> kelime</span><button class="btn mini" data-p="kalip" type="button">${ses.kalip ? 'Redemittel gizle' : 'Redemittel (sınavda yok)'}</button></div>
      ${ses.kalip && api.kalipHTML ? `<div class="pr-kalip">${api.kalipHTML(a)}</div>` : ''}
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="schreiben-gonder" type="button">Gönder</button><button class="btn" data-p="iptal" type="button">Vazgeç</button></div>`;
    const ta = el().querySelector('#pr-metin'); if (ta) { ta.addEventListener('input', () => { ses.metin = ta.value; const s = el().querySelector('.pr-say b'); if (s) s.textContent = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; }); }
  }
  function schreibenGonder() {
    const T = SCHREIBEN[ses.teil], a = ses.a, text = (ses.metin || '').trim(), n = text ? text.split(/\s+/).length : 0;
    if (n < Math.round(T.woerter * 0.5)) { api.toast(`Çok kısa: en az ${T.woerter} kelime hedefle (şu an ${n}).`); return; }
    tikDur();
    const teile = a.de.split(' · ').length - 1, isaretli = Object.values(ses.madde).filter(Boolean).length, kullanilan = Math.round((now() - ses.start) / 60000);
    S.texte = S.texte || []; S.texte.push({ zeit: now(), id: a.id, pruefung: ses.teil });
    api.logEintrag({ modus: 'text', id: `pr:${SET.id}:schreiben:${ses.teil}`, item: a.id, frage: a.de, antwort: text.replace(/\s*\n+\s*/g, ' ¶ '), ergebnis: 'neu', loesung: '', notiz: `pruefung | kelime:${n} | dk:${kullanilan}/${T.dk} | maddeler:${isaretli}/${teile || 0}` });
    st().sonuc.push({ zeit: api.zeitStr(now()), modul: 'schreiben', mod: 'teil' + ses.teil, not: `Teil ${ses.teil} · ${n} kelime · ${kullanilan} dk · Claude puanlar` });
    api.heuteM('pruefung').n++; api.heuteM('yazma').n++; api.xpEkle(50);
    api.save(); if (api.senkron) api.senkron();
    el().innerHTML = `<div class="bos"><div class="buyuk">Gönderildi ✓</div><div class="soluk">${n} kelime, ${kullanilan}/${T.dk} dk. Claude B1 ölçütüyle (Erfüllung, Kohärenz, Wortschatz, Strukturen) düzeltir; düzeltme Geçmiş'te görünür.</div>
      <div class="sira"><button class="btn ana" data-act="claude-gonder" type="button">Claude'a şimdi gönder</button><button class="btn" data-p="ana" type="button">Prüfung</button></div></div>`;
    ses = { ekran: 'ana' };
  }
  // ---------- Sprechen ----------
  let kayit = null;
  function kayitBaslat() {
    if (!navigator.mediaDevices || !root.MediaRecorder) { api.toast('Bu tarayıcıda kayıt yok.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const rec = new MediaRecorder(stream), chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); if (kayit && kayit.url) URL.revokeObjectURL(kayit.url); kayit = { url: URL.createObjectURL(blob), sn: Math.round((now() - kayit.start) / 1000) }; render(); };
      kayit = { rec, start: now() }; rec.start(); render();
    }).catch(() => api.toast('Mikrofon izni verilmedi.'));
  }
  const kayitDurdur = () => { if (kayit && kayit.rec && kayit.rec.state !== 'inactive') kayit.rec.stop(); };
  const kayitUI = () => { const r = kayit; if (r && r.rec && r.rec.state === 'recording') return `<div class="sira"><button class="btn ana" data-p="kayit-stop" type="button">⏹ Kaydı bitir</button><span class="soluk sp-rec">● kaydediliyor…</span></div>`; return `<div class="sira"><button class="btn ana" data-p="kayit" type="button">🎙️ Kaydet</button>${r && r.url ? `<audio controls src="${r.url}"></audio><span class="soluk">${r.sn} sn</span>` : ''}</div>`; };
  function sprechenBaslat() {
    const t1 = T1[Math.floor(Math.random() * T1.length)], t2 = T2[Math.floor(Math.random() * T2.length)];
    let p2 = T2[Math.floor(Math.random() * T2.length)]; if (p2[0] === t2[0]) p2 = T2[(T2.indexOf(t2) + 1) % T2.length];
    ses = { ekran: 'sprechen', adim: 'vorbereitung', t1, t2, p2, not: '', bitis: now() + 15 * 60000, liste: {}, partnerI: 0, folie: 0 };
    render(); tikBasla();
  }
  function sprechenIleri() {
    const sira = ['vorbereitung', 'teil1', 'teil2', 'teil3', 'son'];
    const i = sira.indexOf(ses.adim);
    if (ses.adim !== 'vorbereitung' && ses.adim !== 'son') {
      const n = +ses.adim.slice(-1), ol = Object.keys(ses.liste).filter(k => k.startsWith(n + ':') && ses.liste[k]).length;
      api.logEintrag({ modus: 'pruefung', id: `pr:${SET.id}:sprechen:${n}`, item: SET.titel, frage: n === 1 ? ses.t1[1] : n === 2 ? ses.t2[1] : ses.p2[1], antwort: kayit && kayit.sn ? `kayıt:${kayit.sn}sn` : '', ergebnis: 'selbst', loesung: '', notiz: `liste:${ol}/${LISTE[n].length} | kart:${n === 1 ? ses.t1[0] : n === 2 ? ses.t2[0] : ses.p2[0]}` });
      if (kayit && kayit.url) URL.revokeObjectURL(kayit.url); kayit = null;
    }
    ses.adim = sira[Math.min(sira.length - 1, i + 1)];
    ses.bitis = ses.adim === 'teil2' ? now() + 3 * 60000 : ses.adim === 'teil1' ? now() + 3 * 60000 : null;
    if (ses.adim === 'son') { tikDur(); st().sonuc.push({ zeit: api.zeitStr(now()), modul: 'sprechen', mod: 'tam', not: `Teil 1–3 yapıldı · ${ses.t2[1]}` }); api.heuteM('pruefung').n++; api.heuteM('sprechen').n++; api.xpEkle(60); api.save(); }
    else tikBasla();
    render();
  }
  function listeHTML(n) { return `<div class="sp-liste">${LISTE[n].map((t, i) => `<label><input type="checkbox" data-p="liste" data-k="${n}:${i}"${ses.liste[n + ':' + i] ? ' checked' : ''}> ${esc(t)}</label>`).join('')}</div>`; }
  function renderSprechen() {
    const zaman = ses.bitis ? `<span class="pr-zaman">${dk(Math.max(0, ses.bitis - now()))}</span>` : '';
    const ust = ad => `<div class="tur"><span class="yeni">sprechen · ${ad}</span><span>${ses.adim === 'vorbereitung' ? '15 dk hazırlık' : 'yüksek sesle'}</span>${zaman}</div>`;
    const kalip = typ => api.kalipListe ? `<details class="ceviri"><summary>Redemittel</summary><ul class="erkl">${api.kalipListe(typ)}</ul></details>` : '';
    if (ses.adim === 'vorbereitung') el().innerHTML = `${ust('Vorbereitung')}<div class="kural">Sınavdaki gibi: 15 dakikada üç bölüme hazırlan. Yalnız anahtar kelime not al (cümle yazma).</div>
      <div class="pr-metin"><b>Teil 1 · birlikte planlama:</b> ${esc(ses.t1[1])}<ul class="erkl">${ses.t1[2].map(x => `<li>${esc(x)}</li>`).join('')}</ul><span class="soluk">${esc(ses.t1[3])}</span></div>
      <div class="pr-metin"><b>Teil 2 · sunum:</b> ${esc(ses.t2[1])} <span class="soluk">(${esc(ses.t2[2])})</span><ol class="erkl">${FOLIEN.map(f => `<li>${esc(f)}</li>`).join('')}</ol></div>
      <textarea id="pr-not" class="pr-text" rows="6" placeholder="Notlar (anahtar kelimeler) …">${esc(ses.not)}</textarea>
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="sp-ileri" type="button">Hazırım → Teil 1</button><button class="btn" data-p="iptal" type="button">Vazgeç</button></div>`;
    else if (ses.adim === 'teil1') el().innerHTML = `${ust('Teil 1 · gemeinsam planen')}<div class="soru">${esc(ses.t1[1])}</div><ul class="erkl">${ses.t1[2].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="kural">Partner yerine ses konuşur: her replikten sonra ~30 sn cevap ver (öneri yap, tepki ver, karar ver). <button class="btn mini" data-p="partner" type="button">🔊 Partner konuşsun (${ses.partnerI + 1}/${PARTNER.length})</button></div>
      ${kalip('sprechen1')}${ses.not ? `<details class="ceviri"><summary>Notlarım</summary><pre class="pr-notlar">${esc(ses.not)}</pre></details>` : ''}${kayitUI()}${listeHTML(1)}
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="sp-ileri" type="button">Bitti → Teil 2</button></div>`;
    else if (ses.adim === 'teil2') el().innerHTML = `${ust('Teil 2 · Präsentation')}<div class="soru">${esc(ses.t2[1])}</div>
      <div class="pr-folien">${FOLIEN.map((f, i) => `<button class="pr-folie${i === ses.folie ? ' aktif' : ''}" data-p="folie" data-i="${i}" type="button"><b>Folie ${i + 1}</b><span>${esc(f)}</span></button>`).join('')}</div>
      ${kalip('sprechen2')}${ses.not ? `<details class="ceviri"><summary>Notlarım</summary><pre class="pr-notlar">${esc(ses.not)}</pre></details>` : ''}${kayitUI()}${listeHTML(2)}
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="sp-ileri" type="button">Bitti → Teil 3</button></div>`;
    else if (ses.adim === 'teil3') el().innerHTML = `${ust('Teil 3 · Fragen und Feedback')}<div class="kural">1) Sınav görevlisi senin sunumuna soru sorar: <button class="btn mini" data-p="frage" type="button">🔊 Soru</button> → doğrudan cevap ver.<br>2) Partnerin sunumu: „${esc(ses.p2[1])}“ (5 slayt). Geri bildirim ver + bir soru sor.</div>
      ${kalip('sprechen3')}${kayitUI()}${listeHTML(3)}
      <div class="sira pr-alt"><button class="btn ana devam-btn" data-p="sp-ileri" type="button">Bitir</button></div>`;
    else el().innerHTML = `<div class="tur-sonu"><div class="ts-rozet">🎙️</div><div class="ts-baslik">Sprechen provası tamam</div><div class="soluk">Üç bölüm de yapıldı. Kaydını dinleyip listeyi dürüstçe işaretledinse en zayıf bölümünü biliyorsun; onu Konuşma bölümünde tekrar çalış.</div>
      <div class="sira ts-btns"><button class="btn ana" data-p="ana" type="button">Prüfung</button><button class="btn" data-modus="sprechen" type="button">Konuşma bölümü</button></div></div>`;
    const ta = el().querySelector('#pr-not'); if (ta) ta.addEventListener('input', () => { ses.not = ta.value; });
  }
  function renderHoeren() {
    el().innerHTML = `<div class="tur"><span class="yeni">hören</span><span>dinleme alıştırması</span></div>
      <div class="kural">Goethe'nin ses dosyaları uygulamaya konmuyor (telif). Sınavdaki gibi çalışmak için: <a href="https://www.goethe.de/ins/ee/de/spr/prf/gzb1/ueb.html" target="_blank" rel="noopener">goethe.de Übungsmaterialien</a> sayfasındaki Modellsatz/Übungssatz Hören sesini aç, PDF'teki cevap kâğıdını kullan (sorular için 10 sn, Teil 1 ve 4 iki kez, Teil 2 ve 3 bir kez).</div>
      <div class="kural">Günlük dinleme kası: Okuma'daki DW Top-Thema metinlerinde ses var → önce <b>dinle</b> (okumadan), sonra metinle karşılaştır; Konuşma'daki shadowing cümlelerini de dinleyip tekrarla.</div>
      <div class="sira"><button class="btn ana" data-modus="lesen" type="button">DW metnine git</button><button class="btn" data-modus="sprechen" type="button">Shadowing</button><button class="btn" data-p="ana" type="button">Prüfung</button></div>`;
  }
  // ---------- olaylar ----------
  function klick(e) {
    const b = e.target.closest('[data-p]'); if (!b) return false;
    const a = b.dataset.p;
    if (a === 'ana') { tikDur(); ses = { ekran: 'ana' }; render(); }
    else if (a === 'tarih') { const v = prompt('Sınav tarihi (YYYY-AA-GG):', st().tarih || ''); if (v != null) { st().tarih = /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : ''; api.save(); render(); } }
    else if (a === 'lesen-tam') lesenBaslat('tam');
    else if (a === 'lesen-mini') { const l = st().sonuc.filter(x => x.modul === 'lesen' && x.mod === 'tam'); let teil = 1; if (l.length) { const s = l[l.length - 1]; teil = +Object.keys(s.teile).sort((x, y) => s.teile[x].d / s.teile[x].n - s.teile[y].d / s.teile[y].n)[0]; } else teil = [1, 3, 5][Math.floor(Math.random() * 3)]; lesenBaslat('mini', teil); }
    else if (a === 'teil') { ses.teil = +b.dataset.teil; render(); }
    else if (a === 'cevap') {
      ses.cevap[b.dataset.k] = b.dataset.v;
      b.parentElement.querySelectorAll('.gl-opt').forEach(x => x.classList.toggle('secili', x === b));
      const n = ses.texte.reduce((x, L) => x + L.aufgaben.filter((_, i) => ses.cevap[L.id + ':' + i] != null).length, 0), top = ses.texte.reduce((x, L) => x + L.aufgaben.length, 0);
      const say = el().querySelector('.tur span:nth-child(2)'); if (say) say.textContent = `${n}/${top} cevaplandı`;
      const bt = el().querySelector('[data-p="lesen-bitir"]'); if (bt) bt.textContent = n < top ? `Bitir (${top - n} boş)` : 'Bitir ve puanla';
    }
    else if (a === 'lesen-bitir') { const bos = ses.texte.reduce((x, L) => x + L.aufgaben.filter((_, i) => ses.cevap[L.id + ':' + i] == null).length, 0); if (!bos || confirm(`${bos} soru boş. Yine de bitir?`)) lesenBitir(); }
    else if (a === 'iptal') { if (confirm('Sınavı yarıda bırak?')) { tikDur(); ses = { ekran: 'ana' }; render(); } }
    else if (a === 'schreiben') schreibenBaslat(+b.dataset.teil);
    else if (a === 'madde') ses.madde[b.dataset.i] = b.checked;
    else if (a === 'kalip') { ses.kalip = !ses.kalip; render(); }
    else if (a === 'schreiben-gonder') schreibenGonder();
    else if (a === 'sprechen') sprechenBaslat();
    else if (a === 'sp-ileri') sprechenIleri();
    else if (a === 'partner') { api.sprich(PARTNER[ses.partnerI % PARTNER.length]); ses.partnerI++; const y = root.scrollY; render(); root.scrollTo(0, y); }
    else if (a === 'frage') api.sprich(T3_FRAGEN[Math.floor(Math.random() * T3_FRAGEN.length)]);
    else if (a === 'folie') { ses.folie = +b.dataset.i; const y = root.scrollY; render(); root.scrollTo(0, y); }
    else if (a === 'liste') ses.liste[b.dataset.k] = b.checked;
    else if (a === 'kayit') kayitBaslat();
    else if (a === 'kayit-stop') kayitDurdur();
    else if (a === 'hoeren') { ses = { ekran: 'hoeren' }; render(); }
    else return false;
    return true;
  }
  function tus(e) { return false; }
  const ozet = () => { const p = S.pruefung || { sonuc: [], tarih: '' }; const gun = p.tarih ? Math.round((new Date(p.tarih) - new Date(api.tag())) / 86400000) : null; return { gun, son: p.sonuc.slice(-1)[0] || null, n: p.sonuc.length }; };
  function init(a) { api = a; S = api.S(); }
  function yenile() { S = api.S(); }
  function reset() { tikDur(); ses = null; }
  root.Pruefung = { init, yenile, render, klick, tus, ozet, reset };
})(window);
