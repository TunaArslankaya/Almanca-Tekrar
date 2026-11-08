# kullan-2 bulguları (7.11.2026)

## Özet
- Uygulama gerçek kayıtla (log/zustand.json) ve boş kayıtla Playwright'ta Tuna gibi kullanıldı: masaüstü 1280×860 (çoğunluk), telefon 390×844. Sıra: Gramer (derin, tekrar seti, tanı testi, Bilmiyorum) → Cümle atölyesi → Okuma + Dinleme modu → Prüfung (Lesen mini, Schreiben) → Zayıflar / Bilmediklerim, Kelimeler, İlerleme, Ayarlar, Geçmiş → Çalış turları (1 + 3×2 gün, akşam tekrarı, sprint modu) → biçim biçim notlama denemeleri → paket, fiil metni, Artikel 60 sn.
- Konsol: hiç pageerror / console.error yok (yalnız engellenen ağ istekleri). Mobilde taşan öğe yok (seviye sekmeleri kasıtlı yatay kaydırma).
- En ağır sorunlar notlamada: (1) Gramer bölümünde yanlış cevaptan sonra 1 / 2 / 3 tuşu gizli bir öz değerlendirme gibi çalışıyor, her yanlışı "doğru" yapabiliyor; (2) gramer çeviri / dönüştürme geçerli başka dizilişleri yanlış sayıyor (ana turdaki G.cumleKontrol yerine G.pruefen kullanıyor), tanı testinde itiraz da yok; (3) dinleme sorusunda (duy) boş Enter anında "Bilmiyorum / yanlış" yazıyor, hızlı Enter'le bir sonraki dinleme sorusu yanıyor; (4) gramer boşluklarında hiç yazım hoşgörüsü yok.
- Tutarsız notlama: küçük harfle isim, umlaut eksikliği, boşluğa artikelle yazma, harf yer değiştirmesi; modüle göre richtig / fast / falsch arasında değişiyor (ayrıntı aşağıda).
- Kural ihlali: Zayıflar turunda zor soru geliyor (CLAUDE.md'ye göre gelmemeli).
- İçerik: fiil metninde "bietet … an" bieten sanılıyor; übernehmen'in Partizip'i "übernommen." (noktalı) veride; die Praxis (muayenehane) örnek cümlesi başka anlamda.
- Denenemeyen: duy-seç (hoer). Başsız Chromium'da Almanca ses yok (getVoices() = 0), soru hiç açılmıyor; yalnız kod okundu.
- Betikler ve ekran görüntüleri: `bulgular/kullan-2/` (t5 gramer, t9 gizli tuş, t10 atölye, t20 turlar, t22 / t24 / t25 biçimler, t28 / t29 paket ve fiil metni, t30 / t31 çift Enter).

---

### Gramer bölümü: yanlış cevaptan sonra 1 / 2 / 3 tuşu her cevabı "doğru" yapıyor (gizli öz değerlendirme)
- önem: yüksek
- tür: kural ihlali / haksız not
- yer: js/gramer.js `tus()` (satır ~838: `if (ses.ekran === 'ueb' && ses.art !== 'tani' && ses.q && ses.q.done && /^[123]$/.test(e.key) …) { notla(+e.key) }`)
- kanıt (t9.js, gerçek kayıt, Diğer → Gramer → n-Deklination "Tekrar et"): Her soruda bilerek yanlış cevap verildi ("xyz falsch"), odak yazı kutusundan çıkınca `3` tuşuna basıldı. Log:
  `g:n-deklination:15 ; xyz falsch ; richtig ; tür:luecke | z:2 | öneri:falsch`
  `g:n-deklination:101 ; hata yok ; richtig ; tür:fehler | z:2 | öneri:falsch`
  `g:n-deklination:39 ; xyz falsch ; richtig ; tür:dinle | z:2 | yardımcı fiil | öneri:falsch`
  Set sonu: `g:n-deklination ; richtig ; puan:5/5`. Bu türlerde ekranda itiraz düğmesi yok (yalnız Devam). `1`/`2` de notu değiştiriyor. Seçmeli (wahl) soruda tıklamadan sonra odak düğmede kaldığı için tek bir rakam basışı yetiyor. Ana turdaki gramer sorusunda uygulama tuşu önce yakaladığı için sorun çıkmadı (t25.js); sorun Gramer bölümünde, derin ve tekrar setlerinde.
- beklenen / gerçek: Not sistemin; itiraz yalnız "serbest" türlerde (umform / ordnen / ceviri) ve düğmeyle olmalı. Gerçekte konu kartı (FSRS), teil istatistiği ve set puanı tek tuşla "doğru"ya dönüyor. Tuna ana turda seçmeliyi rakam tuşuyla cevaplamaya alışık, kazayla basması kolay.
- önerilen düzeltme: `tus()` içindeki 1/2/3 dalını yalnız `serbest` koşulunda (cevapla()'daki koşulun aynısı: tür umform / ordnen / ceviri, urteil !== 'richtig', Bilmiyorum değil) çalıştır; ayrıca `q.itiraz` gibi tek kullanımlık bir bayrak tut.

### Gramer çeviri / dönüştürme / sıralama: geçerli başka diziliş yanlış, etiketler yanıltıcı (tanı testinde itiraz yok)
- önem: yüksek
- tür: haksız not
- yer: js/gramer.js `cumlePruef()` (satır ~357: `Gx().pruefen(giris, alts[0], alts.slice(1))`); `pruef()` ordnen / umform / ceviri; fehler 2. adım
- kanıt (t6.js / t7.js, `Gramer.pruef` doğrudan):
  - ceviri hedef "Ich habe dem Praktikanten alles erklärt." ← "Dem Praktikanten habe ich alles erklärt." → **falsch** ["kelime sırası","artikel/çekim","groß/klein"]
  - ← "Alles habe ich dem Praktikanten erklärt." → falsch
  - hedef "Ich bin gestern ins Kino gegangen." ← "Gestern bin ich ins Kino gegangen." → falsch ["kelime sırası","groß/klein"]
  - umform hedef "Weil ich krank bin, bleibe ich zu Hause." ← "Ich bleibe zu Hause, weil ich krank bin." → falsch ["kelime sırası","edat","groß/klein"]
  - Aynı cümleler ana turun motoru `G.cumleKontrol` ile: "Gestern bin ich …" richtig, "Ich bleibe zu Hause, weil …" richtig, "Dem Praktikanten habe ich …" fast.
  - Havuz: 948 ceviri, 717 umform, 466 ordnen, 946 fehler. Tanı testinde `serbest` kapalı (`ses.art !== 'tani'`): geçerli cevap yanlış sayılınca konu "zayıf"a düşüyor, itiraz yolu yok.
- beklenen / gerçek: CLAUDE.md'ye göre geçerli başka dizilişler (Vorfeld, yan cümle önde) doğru sayılır. Gramerde yanlış sayılıyor, üstelik "artikel/çekim", "edat" gibi olmayan hataları etiketliyor.
- önerilen düzeltme: `cumlePruef` önce `G.cumleKontrol(giris, alts)` çağırsın (ordnen'de virgülsüz), mevcut kaynaştırma / çekim / zarf kuralları onun sonucuna uygulansın. Umform'da yönerge belli bir başlangıç istiyorsa ("„Jetzt“ ile başlayarak") ilk kelime ayrıca denetlensin. Tanı testinde en azından "aslında doğru" itirazı açılsın (log'a `öneri:`).

### Dinleme sorusu (duy-boşluk / duy-dikte): boş Enter anında "Bilmiyorum"; hızlı Enter bir sonraki dinleme sorusunu yakıyor
- önem: yüksek
- tür: hata / haksız not
- yer: js/dinle.js `boslukSoru` / `dikteSoru` → `q.kontrol` (`if (!v) { q.bilmiyorum(); return; }`), `q.tus` Enter
- kanıt:
  - t31.js: `sesAc('duy','bosluk')`, odak yazı kutusunda, boş Enter → "✗ Yanlış · bilmiyorum", log `v305:duy-bosluk ;  ; falsch ; … | bilmiyorum | sek:0`. Dikte de aynı (`n0360:duy-dikte ; ; falsch`).
  - t30.js (masaüstü ve telefon, ikisinde de): yazma sorusunda doğru cevap + Enter Enter Enter (hızlı) → bir sonraki soru dinleme ise o da cevaplanmış oluyor: `artOb n1082 → duy … | yeni log satırı: 2 ["art:n1082:art:richtig","duy:w0547:duy-bosluk:falsch"]`, `yaz0 n0448 → duy-dikte:falsch`.
  - Karşılaştırma: ana turun yazma sorularında boş Enter yok sayılıyor (t20: `bos` modu → `done:false`).
- beklenen / gerçek: Doğru cevaptan sonra 0,9 sn'de kendiliğinden geçiş var; Tuna aynı anda Devam için Enter'a basarsa Enter yeni dinleme sorusuna düşüyor ve soru sesi bile çalmadan "bilmiyorum" yazılıyor (sek:0). Log ve "Bilmediklerim" kirleniyor; Tuna dinlemeyi hiç yapamamış oluyor.
- önerilen düzeltme: `q.kontrol` boş girdide hiçbir şey yapmasın (yalnız odak). Bilmiyorum yalnız düğme ya da `0` ile olsun. Ek olarak sesTur sorusu çizildikten sonra ilk ~400 ms Enter yok sayılsın (seçmelideki MC_AC_MIN gibi).

### Gramer boşluk (luecke) ve metin (text) türlerinde hiç yazım hoşgörüsü yok
- önem: yüksek
- tür: haksız not
- yer: js/gramer.js `parcaPruef()` (yalnız tam eşleşme, umlaut katlama, kaynaştırma, konuşma dili)
- kanıt (t5.js gerçek oturum + t6.js):
  - n-Deklination luecke "Kennst du schon den neuen ___? (der Dozent)" ← "Doeznten" → ✗ Yanlış, etiket yok, altında "n-Deklination" kural kutusu (sanki konuyu bilmiyormuş gibi).
  - `pruef({tur:'luecke',cevap:['gearbeitet']}, ['gearbiet'])` → falsch; `['gaerbeitet']` → falsch; `habe ; gearbeiett` → falsch; text `Kolelgen ; gegnagen` → falsch.
  - Havuz: 1414 luecke + 439 text (en sık iki tür). Aynı yazım hatası gramer tam cümlesinde (`cumlePruef`) fast "yazım" alıyor, ana turda da fast.
- beklenen / gerçek: 5.11 kararına göre ek farkı olmayan yazım hatası küçük hata (fast + yazım). Gramer boşluğunda tam yanlış; tanı testinde konu bu yüzden zayıf çıkabiliyor, hayalet tekrar açılıyor.
- önerilen düzeltme: `parcaPruef` sonuna `const k = Gx().yakin && Gx().yakin(u, h); if (k === 'yazim') return 'fast';` ekle (ek farkı `cekim` ise gramerde yanlış kalsın: Dozent / Dozenten konunun kendisi). Etiket olarak "yazım" döndür (pruef'te tags'e ekle).

### Umlautlu harfte harf yer değiştirmesi "kelime yanlış" sayılıyor
- önem: orta
- tür: haksız not
- yer: js/grammatik.js `yakin()` / `dlev` (umlaut ae/oe/ue açılımından sonra transpozisyon 2 düzenleme oluyor)
- kanıt (t20 turu + t21.js): yaz0 "ilkbahar" ← "das Frhüjahr" → ✗ Yanlış, "kelime yanlış", m1 (itiraz "yazım hatasıydı" çıkıyor). Doğrudan: `pruefen('Frhüjahr','Frühjahr',lemma)` falsch "farklı", `mdüe`/`müde` falsch, `Wrame`/`Wärme` falsch; aynı kelimede umlautsuz yer değiştirme `Frühjhar` → fast "yazım". bos'ta da `Frhüjahr` → falsch.
- beklenen / gerçek: Harf yer değiştirmesi (5.11: Situaiton) yazım hatası, fast. Umlautlu kelimede Tuna'ya "kelimeyi bilmiyorsun" deniyor.
- önerilen düzeltme: `yakin` / `dlev` karşılaştırmasını umlautları tek harf (ä, ö, ü, ß) tutarak da yap; iki yoldan biri 'yazim' derse yazım say.

### Zayıflar turunda "zor soru" geliyor
- önem: orta
- tür: kural ihlali
- yer: js/kern.js `sec()` adım 6 (`zorOk = !o.klavyesiz && …`, filtre / odak bölüm kontrolü yok); app.js `sec()` `ot.odak` verildiği hâlde Kern'de kullanılmıyor
- kanıt (t14.js, t32.js): Diğer → Zayıflar → "Zayıfları çalış" ilk kart "ZOR SORU · İPUCUSUZ". Zayıflar turunun log'u: `abr v177 … | zor`, `wort x1557 … | zor`, `wort x1547 … | zor` (turda 3 = ZOR_TUR).
- beklenen / gerçek: CLAUDE.md: "ısınma / kurtarma / momentum / kuyruk / akşam / klavyesiz / Zayıflar'da yok". Zayıf kelime ipucusuz ve bir üst basamaktan soruluyor.
- önerilen düzeltme: Kern.sec'te `zorOk` hesabına `&& !o.odak` (ya da `o.zayif`) ekle; app.js `sec()` Zayıflar modunda bunu geçsin.

### İsmi küçük harfle yazmak modüle göre richtig / fast / zor soruda seviye atlatıyor
- önem: orta
- tür: haksız not (tutarsız)
- yer: grammatik.js `pruefen` (lemma) ve `cumleKontrol`; app.js `paketPruefen` (satır ~1930), `uPruef`; gramer `cumlePruef`
- kanıt (t20 / t22 / t24 / t28):
  - yaz0 "die toleranz", "die unterschrift" → richtig, etiket yok; zor soruda "der donner" → richtig **m4** ("zor soru ✓", seviye atlıyor).
  - bos "operation", "dialekt", "frühjahr" → richtig; duy-boşluk "sonne" → richtig; tam cümle küçük harf → richtig + "büyük/küçük harf"; dikte küçük harf → richtig, etiket yok.
  - metin boşluğu "fieber" → fast "yazım, büyük/küçük harf"; paket "seminar", "mensa" → fast "groß/klein: isim büyük harfle"; gramer ceviri küçük harf → fast "groß/klein".
- beklenen / gerçek: Almancada ismin büyük harfi yazım kuralı (B1 Schreiben'de sayılır). Aynı hata bir yerde doğru, bir yerde küçük hata; zor soruda seviye bile atlatıyor (26.10: "yazım / küçük hata seviye atlatmaz").
- önerilen düzeltme: Tek kural seç (öneri: isimde küçük harf = fast + "büyük harf", not 3 ama bm yükseltmez) ve `pruefen`, `bosPruef`, `cumleKontrol`, `uPruef`, `paketPruefen`, gramer `cumlePruef` hepsinde uygula. En azından zor soruda (`sonuc.zor`) küçük harfli isim not 4 almasın.

### Paket: boşluğa artikelle doğru isim → "isim büyük harfle" hatası; "Zu…" ile başlayan her kelime küçük hata; yer değiştirme yanlış
- önem: orta
- tür: haksız not / hata
- yer: js/app.js `paketPruefen()` (satır ~1914–1931)
- kanıt (t28.js, paket p06 "Mit der Bahn" ve p04 log'u):
  - `p06:1 ; die Fahrkarte ; fast ; Fahrkarte ; … | groß/klein: isim büyük harfle`: büyük harf doğru, kural yanlış tetikleniyor (artikel ayıklandıktan sonra küçük harf denetimi hâlâ "die" ile başlayan ham girdiye bakıyor). Aynı yerde fiile artikel: `p06:4 ; die abfahren ; richtig ; … | artikel metinde zaten var` (hiç ceza yok).
  - `p06:0 ; Zugx ; fast ; Zug ; … | biçim: metinde Zug`: önek kuralı `a.slice(0,n) === b.slice(0,n)`, n = min(5, uzunluk−1); "Zug" için n = 2, yani "Zucker", "Zukunft" de küçük hata olur.
  - Yer değiştirme: `p06:5 ; Ducrhsage ; falsch`, `p04:4 ; Doeznt ; falsch`, `p04:9 ; Bilbiothek ; falsch`; buna karşın harf eksiği `Universitäen` → fast "biçim". Paket `G.yakin` kullanmıyor.
- beklenen / gerçek: Metin boşluğu / bos ile aynı kurallar (yazım = fast "yazım", fazla artikel = fast "fazla artikel", başka kelime = falsch).
- önerilen düzeltme: `paketPruefen`'i `G.bosPruef` + `G.yakin` üzerine kur; küçük harf denetimini artikel ayıklanmış girdiyle yap; önek kuralını kaldır ya da `yakin === 'cekim'` ile değiştir.

### Metin boşluğu: boşluğa artikelle yazılan doğru isim tam yanlış (bos'ta küçük hata)
- önem: orta
- tür: haksız not (tutarsız)
- yer: js/app.js `uPruef()` (satır 2196–2213)
- kanıt (t24.js `metinAc`): "Die ___ muss ich dreimal täglich einnehmen" ← "der Tabletten" → `luecke ; n1179:nsatz ; der Tabletten ; falsch`. "Wenn das ___ steigt" ← "der Fieber" → falsch. Aynı şey cümlede boşlukta: "der Operation" → fast "fazla artikel" (t22). Fiil boşluğuna "der verschreiben" → falsch.
- beklenen / gerçek: 5.11'de "boşluğa artikelle yazılan doğru isim → fazla artikel (küçük hata)" kararı uPruef'e uygulanmamış.
- önerilen düzeltme: `uPruef`'te başta artikel varsa ayıkla ve kalanı yeniden dene; doğruysa `{ u: 'fast', hinweis: 'fazla artikel' }`.

### Kök (Perfekt cümlede): yanlış yardımcı fiil yazınca "doğru"
- önem: orta
- tür: haksız not
- yer: js/app.js `stammTekPruef()` tur 'p2' (`if (tur === 'p2' && t.length > 1 && auxLemma(t[0])) govde = t = t.slice(1)`)
- kanıt (t22.js): kokSatz "Wir sind drei Tage in Berlin _____." (bleiben) ← "hat geblieben" → ✓ Doğru. Cümle sein istiyor; yazılan yardımcı fiil hiç denetlenmeden atılıyor.
- beklenen / gerçek: Türkçe konuşanların tipik hatası (haben / sein) burada ödüllendiriliyor. Doğru yardımcı fiil eklenirse sorun yok, yanlışı fast + "yardımcı fiil: sein" olmalı.
- önerilen düzeltme: p2'de atılan yardımcı fiili `v.aux` / `auxAlt` ile karşılaştır; uyuşmuyorsa `yanlis = max(yanlis, 1)` ve etiket `yardımcı fiil: sein|haben`.

### Cümlede boşluk: umlaut eksiği "yazım" (not 3), tekil/çoğul ve başka kelime de "yazım"
- önem: orta
- tür: haksız not (tutarsız)
- yer: js/grammatik.js `bosPruef()` → `yakin()`
- kanıt (t22 / t23): `bosPruef('Fruhjahr','Frühjahr')` → fast ["yazım"] (tip yazim → m3 kısmi); aynı kelime yaz0'da `das Fruhjahr` → fast "umlaut" m2. `bosPruef('Bruder','Brüder')` → fast "yazım" (tekil ↔ çoğul), `bosPruef('schon','schön')` → fast "yazım" (iki ayrı kelime). "der Operation" → etiketler "yazım" + "fazla artikel" (yazım hatası yok).
- beklenen / gerçek: CLAUDE.md: umlaut / hâl / çekim → 2. Boşlukta umlaut 3 alıyor, Brüder / Bruder çekim farkı yazım sayılıyor.
- önerilen düzeltme: `bosPruef`'te yalnız umlaut farkı varsa `tip:'umlaut'`, `tags:['umlaut']`; umlaut değişimi çoğul / anlam yaratıyorsa (sözlükte iki ayrı biçim) `cekim` ya da falsch. "fazla artikel" dalında `tags` yalnız ['fazla artikel'] olsun.

### Gramer log'u: teil'in varsayılan etiketi her yanlışa, küçük hataya ve "Bilmiyorum"a ekleniyor
- önem: orta
- tür: hata (veri kalitesi)
- yer: js/gramer.js `notla()` notiz (`n !== 3 && (g.teile[u.teil] || {}).etiket ? [etiket] : []`)
- kanıt (t8.js tanı testi log'u): `g:verbstellung:tani:78 ; fast ; tanı:2 | tür:umform | z:3 | kelime sırası | yazım`: cevapta yalnız yazım hatası vardı. `g:satzklammer-tekamolo:tani:9 ; falsch ; … | kelime sırası | bilmiyorum`. Turda: `g:tuerkisch-fallen:61 ; falsch ; … | artikel/çekim | bilmiyorum`.
- beklenen / gerçek: "Sonuçlarıma bak" adım 3 hata etiketlerini sayıyor; yazım hatası ve Bilmiyorum "kelime sırası / artikel" hatası gibi sayılıyor, gece analizi şişiyor.
- önerilen düzeltme: teil etiketini yalnız `urteil === 'falsch'` ve Bilmiyorum değilken, motor kendi etiketi vermediyse ekle.

### Gramer dönüştürme: eksik virgül "kaynaştırma" diye etiketleniyor
- önem: düşük
- tür: hata (yanlış etiket)
- yer: js/gramer.js `cumlePruef()` ilk dal (`fold` virgülü siler, sonra `kaynasAc` karşılaştırması)
- kanıt (t6.js): umform hedef "Weil ich krank bin, bleibe ich zu Hause." ← "Weil ich krank bin bleibe ich zu Hause" → fast ["kaynaştırma"].
- beklenen / gerçek: Kaynaştırma yok, eksik olan virgül. Etiket "virgül" / "noktalama" olmalı (ya da ana turdaki gibi doğru sayılmalı).
- önerilen düzeltme: kaynaştırma dalından önce virgülsüz eşitliği ayrı kontrol et → fast + "virgül".

### Fiil metni: ayrılabilir fiil yanlış tanınıyor ("bietet … an" = bieten), "übernommen." veri hatası
- önem: orta
- tür: içerik hatası
- yer: fiil metni tarama (app.js `fiilMetinRender` formen eşleşmesi), `daten/verben.js` v539 (`"p2":"übernommen."`, Goethe satırından nokta kalmış)
- kanıt (t29.js, DW "Deutschland und seine Kolonialverbrechen"):
  - "Sie bietet dem Land 1,1 Milliarden Euro Hilfe, aber keine Reparationen an." → "bietet hangi fiilin formu?" doğru cevap **bieten** (log `v146 ; bieten ; bietet → mastar`). Cümledeki fiil anbieten.
  - übernehmen Perfekt şıkları: "ist übernommen." / "hat übernommen." (noktalı); açıklama "er hat übernommen.". `daten/verben.js` içinde noktalı tek kayıt v539.
  - "wurde gezwungen" (Passiv Präteritum) "gezwungen (Perfekt)" diye etiketleniyor.
- beklenen / gerçek: Tuna yanlış fiili öğreniyor (anbieten ≠ bieten); noktalı biçim kök sorusunda da hedef olabilir.
- önerilen düzeltme: tarama, cümlenin sonundaki ayrılmış öneki (an, ab, auf …) fiile bağlasın (yoksa o fiili atla); build.py Goethe ayrıştırmasında biçimlerin sonundaki noktalamayı sil (v539); `wurde/werden + Partizip` Perfekt sayılmasın.

### die Praxis (muayenehane) kelimesinin örnek cümlesi başka anlamda
- önem: düşük
- tür: içerik hatası
- yer: `quellen/wort_saetze.txt:1105` (n0926)
- kanıt: Turda yaz0 "muayenehane" → die Praxis, örnek "Das ist die Theorie. In der Praxis ist vieles ganz anders. (Bu teori. Pratikte …)". duy-boşlukta aynı cümle "die Praxis = muayenehane" çevirisiyle. Listede ikinci kayıt var: `quellen/nomen.txt:930 die Praxis | 3 | uygulama, pratik`.
- önerilen düzeltme: Satırı "uygulama, pratik" kaydının kimliğine taşı, n0926'ya muayenehane cümlesi yaz (ör. "Die Praxis von Dr. Müller ist am Montag geschlossen." zaten var). Aynı lemma için iki kimliği olan isimlerde örnek cümleleri tara.

### Başka cihazda istatistikler boş: Bugün "90 cevap · 0 yeni kelime · – dakika"
- önem: düşük
- tür: hata (cihazlar arası)
- yer: app.js `gunOzeti`, `aktifSn`, İlerleme (artikel aynası, biçim başına başarı, üretim doğruluğu, haftalık seviye), `karismaTablosu` (çeldiriciler), cumle.js `hataSay`. Hepsi `S.log`'dan okuyor; log/zustand.json `log: []` ile yazılıyor.
- kanıt: Gerçek kayıtla (log yok) açılış: Bugün "90 cevap · %72 · – dakika · 0 yeni kelime · 0 seviye ↑" (tage'de neuV 3 + neuN 5 var), İlerleme "Artikel aynası 0/0/0", "Biçim başına başarı: henüz yeterli cevap yok", DK sütunu hep "–".
- beklenen / gerçek: Tuna telefonda açınca bugünün sayıları çelişkili, telefondaki seçmeli çeldiricileri de karışma tablosu olmadan seçiliyor.
- önerilen düzeltme: Sayıları tage / tageC'den türet (yeni = neuV + neuN; günlük dk ve seviye+ için tageC'ye alan ekle); log'a bağlı kartlarda "bu cihazın verisi" notu göster ya da zustand.json'a son 30 günün özet log'unu (karışma tablosu girdisi) koy.

### Dinleme modu: bitiş ekranında "5 / 4 · bitti"
- önem: düşük
- tür: arayüz
- yer: js/dinle.js `modRender()` (`${M.adim + 1} / 4`; adım 4 = bitti)
- kanıt (t11.js): bitti ekranı başlığı "dinleme modu · 5 / 4 · bitti".
- önerilen düzeltme: `M.adim < 4 ? `${M.adim + 1} / 4 · …` : 'bitti'`.

### Dinleme modu boşlukları: aynı kelime iki kez, işlev kelimesi (sich)
- önem: düşük
- tür: içerik
- yer: js/dinle.js `modBosluklar()`
- kanıt (t11.js, dw79213126): boşluklar `Forschung, Dabei, Dabei, Feldern, Kindheit, Forschung, internationales, sich, …`.
- önerilen düzeltme: Seçilen kimlikleri Set'te tut (bir kelime bir kez); A1 / işlev kelimelerini (sich, dabei …) dışla.

### Cümle atölyesi "kur": durum cümlesi kelimelerle ilgisiz
- önem: düşük
- tür: içerik
- yer: js/cumle.js `gorevKur()` kur dalı (durum konu (tema) üzerinden rastgele)
- kanıt (t10.js): durum "Öğretmenine bir kelimeyi soruyorsun." + kelimeler "geehrt + widersprechen" + yapı "modal fiil". Bir başkası: "Bir iş görüşmesinde kendinden bahsediyorsun." + "flexibel" + Perfekt (bu uygun).
- önerilen düzeltme: Durumları kelimenin kendi örnek cümlesinden ya da kelimeye bağlı listeden seç; uygun durum yoksa durumsuz görev ver.

### Prüfung Lesen Teil 3: aynı ilan birden çok maddeye verilebiliyor
- önem: düşük
- tür: arayüz
- yer: js/pruefung.js `renderLesen` (zu seçenekleri)
- kanıt (t12.js): "Jede Anzeige nur einmal" yönergesine rağmen 7 maddenin hepsine "a" seçilebildi, uyarı yok; "Bitir (N boş)" onaysız tek tıkla sınavı bitiriyor.
- önerilen düzeltme: Kullanılan harfi diğer maddelerde soluk göster (sınavdaki gibi); boş madde varken Bitir'de tek satırlık onay iste.

---

## İyi çalışanlar (kısa, doğrulandı)
- Ana turda yanlış / küçük hatada Devam 2,5 sn kilitli (bütün yanlışlarda "kilitli"); "doğrusunu bir kez yaz" kutusu yanlış ve Bilmiyorum'da açılıyor; "yazım hatasıydı" itirazı fast'e çeviriyor (t20 Frühjahr).
- Seçmelide şıklar gizli; açılmadan rakam basışı sayılmıyor (t30).
- Yanlış → 3–5 soru sonra alt basamaktan başka cümleyle kuyruk; tanıtım → mini soru → ikinci hatırlama akışı; akşam kartı 19:30'da çıktı, tur sonrası ✓; sprint açılınca üç blok ve "Sırada: Gramer" doğru.
- Artikel yanlışında kural ("-tät → hep die", "son parça belirler"), artOb'da doğru cinsiyet yanlış hâl → fast "hâl".
- Konsol hatası yok, telefonda taşma yok.
