# log-2: Tuna'nın cevapları (26.10 – 7.11, öncelik 6.11 10:50 sonrası)

**Özet**
- İncelenen: 26.10'dan bugüne 1348 satır; yeni sürümde (6.11 13:06 – 7.11 17:45) notlanan 125 cevap tek tek okundu. Sürüm 6.11 13:06–13:08 arasında hâlâ önbellekteki eski koddu (seçmeli `sec` satırları, `şık:` / `ipucu-tür:` yok). Yeni kod 13:09'dan itibaren çalışıyor.
- Yeni sürümde seçmeli oranı %9,6 (12/125): 10'u tanıtım mini sorusu, 1'i ilk tekrar, 1'i eski koddan. Kurtarma ve ısınma artık ipuçlu yazma (`yaz0`). Gün sayaçları log'la tutuyor.
- **En ciddi haksız notlar.** (1) `artOb`'da dişil isme "der" yazmak cinsiyet hatası sayılmıyor, `fast` + artikel notu 3 alıyor; Geduld'ün 13. hatası "doğru" sayıldı. (2) Gramer cümlesinde yalnız virgül eksikse `fast` + "kaynaştırma" geliyor. (3) Aynı fiilin ünlüsü değişen çekimi (können/kann, regnet/geregnet, liest/lesen) hâlâ `falsch`; fährt/fahren ise `fast`. (4) Bileşik isimde son çift harf eksikse "çekim" (m2) sayılıyor, oysa yazım hatası. (5) Dikte'de bileşiği ayrı yazmak (schmerz Tabletten) `falsch`.
- **En ciddi içerik / soru hataları.** (1) Metin boşluğu ve kelime arama, cümle ortasındaki büyük harfli ismi küçültüp fiile bağlıyor: Schienen → scheinen, Unternehmen → unternehmen (19 geçiş), Weile → weil. (2) Çok kelimeli 27 öğede boşluk yalnız ilk kelimeyi siliyor ("_____ allem", "sich Mühe geben"de "sich"). (3) Düzenli fiillere kök (stamm) sorusu soruluyor: 11 düzenli kök, 26.10'dan beri 28 stamm sorusunun 6'sı. (4) sich wenden an'da yalnız "gewendet" kabul ediliyor, "gewandt" kabul edilmiyor. (5) Son tanıtılan 10 kelimenin kendi cümlesi 0–3 (selbe: 0).
- **Gramerde log kirliliği.** Teil'in varsayılan etiketi her yanlış / küçük hatada log'a ekleniyor (umlaut hatasına "kelime sırası" gibi). Bu yüzden hata istatistikleri ve gece işinin etiket sayımı yanlış.
- **Bilmediklerim.** Liste seçmeli doğrularla da "artık biliyorsun"a geçiyor (Patenschaft ve Nachhilfe hiç yeniden yazılmadan kapandı).
- **Gece işi (feedback.js).** 7 hatalı ya da yanıltıcı düzeltme bulundu. Örnek: Kunst satırında cevap ile doğrusu ters yazılmış; "zu + Akk" yazılmış.
- Bulgu sayısı: yüksek 5 · orta 11 · düşük 5 (toplam 21).

---

## A. Haksız not (kontrol fonksiyonları)

### artOb: dişil isme "der" yazmak cinsiyet hatası sayılmıyor, `fast` + artikel notu 3 alıyor
- önem: yüksek
- tür: haksız not (fazla cömert)
- yer: `js/app.js:892-905` `artObPruef`, `AO_BICIM` (`js/app.js:814-819`), `notVerF` (`js/app.js:908-917`)
- kanıt: `2026-11-07 17:17:36;art;n0433:art;die Geduld;Für diese Arbeit fehlt mir einfach ___ Geduld. [Nom/Akk];der;fast;die;… not:a3 … | hâl:Nom/Akk | hâl`. Geduld'de artikel 13. kez yanlış: `zustand.json` `items.n0433.art` = `lapses 13, lastG 3, gun 2026-11-07`. Tuna'nın klasik hatası "der Geduld" (11-05 05:35 yazmada da "der Geduld").
  Kod yolu: `AO_BICIM['der'] = ['derN','dieD','dieG']`, `g='die'` → `cinsOk = true` (dieD) → `fast` + 'hâl' + `artOb.dogru = true` → `notVerF` artikel notunu 3 bırakıyor.
  Aynı belirsizlik der/das isimlerde 'dem' / 'des' için de var. Asıl zarar şurada: Nom/Akk sorulan **her die-isminde** "der" yazmak cinsiyet bilgisi doğru sayılıyor. Oysa "der" Tuna'nın en sık yanlış tahmini.
- beklenen / gerçek: cinsiyet yanlış → `falsch`, a1 bekleniyor; gerçekte `fast` + a3 verildi ve artikel hafızası büyüdü.
- önerilen düzeltme: `artObPruef`'te `cinsOk` aramadan önce şuna bak: yazılan biçim, **sorulan hâlde** başka bir cinsiyetin doğru biçimi mi (`cift.some(c => !c.startsWith(g) && ks.includes(c.slice(-1)))`)? Öyleyse `falsch` + `artikel der → die`. Yalnız sorulan hâlde hiçbir cinsiyete uymuyorsa ve doğru cinsiyetin başka bir hâline uyuyorsa (der-ismi Akk'ta "dem") `fast` + 'hâl' kalsın.

### Gramer cümlesinde yalnız virgül eksik → `fast` + "kaynaştırma"
- önem: yüksek
- tür: haksız not + yanlış etiket
- yer: `js/gramer.js:356-358` `cumlePruef` (`fold` virgülleri siliyor: `js/gramer.js:322`)
- kanıt: `2026-11-07 17:23:46;gram;g:vergleich:90;… → als;Es gab mehr Arbeit als ich erwartet habe.;richtig;Es gab mehr Arbeit, als ich erwartet habe.;… | kaynaştırma | ghost:0 | öneri:fast | sek:68`. Sistem önce `fast` dedi, Tuna itiraz etti ("aslında doğru"), haklıydı.
  Yeniden üretme: `Gramer.pruef({tur:'umform', cevap:['Es gab mehr Arbeit, als ich erwartet habe.']}, 'Es gab mehr Arbeit als ich erwartet habe.')` → `{urteil:'fast', tags:['kaynaştırma']}`. `ceviri` için de aynı (`'Ich glaube dass er kommt'` → `fast` / kaynaştırma).
  Sebep: `G.pruefen` virgülü ayrı token sayıp `falsch` diyor. Ardından kaynaştırma denetimi `fold` ile karşılaştırıyor; `fold` virgülleri sildiği için iki cümle eşit çıkıyor ve sonuç "kaynaştırma" oluyor. Bütün umform / ceviri alıştırmalarında virgüllü hedef cümle bu hatayı üretir (ordnen'de virgül zaten yok sayılıyor).
- beklenen / gerçek: virgül eksikliği yapı hatası değil (nokta için de 5.11'de "doğru" kararı verildi) → `richtig` bekleniyor; gerçekte `fast` + yanlış etiket.
- önerilen düzeltme: `cumlePruef`'in başında `virgulsuz` (gramer.js `pruef` içindeki fonksiyon) karşılaştırması yap; eşitse `richtig` (isteğe bağlı bilgi etiketi 'virgül'). Kaynaştırma denetimi yalnız gerçekten `im` / `in dem` farkı varken etiket koysun.

### Aynı fiilin ünlüsü değişen çekimi boşlukta hâlâ `falsch` (können→kann, regnet→geregnet, liest→lesen)
- önem: yüksek
- tür: haksız not
- yer: `js/grammatik.js:699-715` `yakin`; kullananlar: `bosPruef` (`grammatik.js:796`), `uPruef` (`app.js:2196`), `tipAus` (`app.js:3506`)
- kanıt: `2026-11-05 05:34:…;luecke;v347:satz;können;In bestimmten Fällen _____ der Arzt …;können;falsch;kann`. Gece işi bunu "sistem haksız saydı" diye işaretledi (feedback 11-05 05:34), ama hâlâ düzelmedi. Diğer örnekler: `2026-11-01 08:29 v429:satz regnet → geregnet falsch`, `2026-10-30 11:33 v378:satz löschen → gelöscht falsch`.
  Bugünkü kodla `G.bosPruef` sonuçları: kann/können, geregnet/regnet, gibt/geben, nimmt/nehmen, liest/lesen, gelöscht/löschen, ist/sein → `falsch`. Buna karşılık fährt/fahren, wird/werden, kommt/kommen → `fast` çekim. Tuna'nın 5.11 şikâyeti ("kelimeyi biliyorum, çekimde hata yapıyorum, bilmiyorsun diyor") bu fiillerde hâlâ geçerli.
- beklenen / gerçek: aynı fiilin başka çekimi → `fast` + 'çekim' (m2) bekleniyor; gerçekte `falsch` m1, hafıza sıfırlanıyor.
- önerilen düzeltme: `yakin`'e (ya da `bosPruef` / `uPruef` öncesine) sözlük adımı ekle: yazılan ve beklenen biçim aynı fiilin biçimleri mi? Bunun için `formIdx()` (`app.js:2073`) her ikisini aynı fiil kimliğine bağlıyorsa ya da `G.praesensForms(v)` + `ptForm` + `p2s` + `inf` kümesinde ikisi de varsa → 'cekim'. `G.lexSetzen` ile biçim → lemma haritası verilebilir.

### Bileşik isimde son çift harf eksik → "çekim" (m2), yazım hatası değil
- önem: orta
- tür: haksız not + yanlış etiket
- yer: `js/grammatik.js:707` (`yakin`: `(!ra || !rb || …)` → 'cekim')
- kanıt: `2026-11-07 17:21:36;wort;x1563:wort;der Feuerwehrmann;…;der Feuerwehrman;fast;der Feuerwehrmann;… not:m2 … | kurtarma | çekim`. Aynı cevap 10-27 20:25'te (eski kod) `yazım` sayılmıştı.
  `G.yakin('Feuerwehrman','Feuerwehrmann')` → 'cekim'. Sebep: ortak baştan sonra `ra=''`, `rb='n'`; 'n' de EKLER listesinde olduğu için koşul `!ra` ile hemen doğru çıkıyor. Yorumdaki "biri ötekinin sonuysa harf atlamadır" kuralı bu dalda hiç çalışmıyor. Aynı yolla "durfter" (durfte, 7.11 17:26:28) da 'cekim' oluyor.
- beklenen / gerçek: tek harf eksik, lemma ≥ 10 harf → yazım (m3, +0,7) bekleniyor; gerçekte m2.
- önerilen düzeltme: ek dalından önce şunu dene: yazılan biçim sözlükte (`LEX`) yoksa ve `yazimTok` doğruysa → 'yazim'. Ya da özel kural: fark tek harf ve bu harf bir önceki harfin tekrarıysa (mann/man, Komma/Koma) → 'yazim'.

### Dikte: bileşik ayrı yazılınca `falsch` (fazla kelime + yanlış kelime)
- önem: orta
- tür: haksız not
- yer: `js/dinle.js:38` `diktePruef` → `G.cumleKontrol` (`js/grammatik.js:1040`)
- kanıt: `2026-11-07 17:22:07;akt;diktat:n0994;dinle–yaz;Diese Schmerztabletten gibt es nur auf Rezept.;Diese schmerz Tabletten gibt es nur auf Rezept;falsch;…;fazla kelime | yanlış kelime | dikte:kelime`. Yeniden üretme: `G.cumleKontrol('Diese schmerz Tabletten gibt es nur auf Rezept', ['Diese Schmerztabletten …'])` → `falsch`, skor 0,75.
- beklenen / gerçek: duyduğu bütün kelimeler doğru; bitişik / ayrı yazım bir yazım hatası → `fast` + 'yazım' bekleniyor; gerçekte `falsch`.
- önerilen düzeltme: `cumleKontrol` hizalamasından önce şu birleştirmeyi yap: girişte yan yana iki token birleşince (büyük/küçük harf yok sayılarak) hedefte bir token'a eşitse, ikisini tek token'a indir ve 'yazım' (bitişik yazım) etiketi ver. Tam cümle (`cumle`) soruları da aynı fonksiyonu kullandığı için onlar da düzelir.

### Metin boşluğunda bağlama uyan başka kelime hep `falsch`, itiraz düğmesi yok
- önem: orta
- tür: haksız not
- yer: metin etkinliği `js/app.js` (`uPruef` 2196; akt kontrolü ~2610–2640; itiraz yok)
- kanıt: `2026-10-30 11:33 luecke x1554:nsatz "Die _____ im Dorf war wirklich groß: Jeder hat geholfen …" → Hilfsbereitschaft falsch (L Solidarität)`: Tuna'nın cevabı birebir uyuyor. `2026-10-26 11:24 luecke w0536:nsatz "Es wird also meistens nicht sehr kalt und nicht sehr _____" → heiß falsch (L warm)`: "nicht sehr heiß" doğal Almanca.
- beklenen / gerçek: geçerli başka kelime en azından itirazla düzeltilebilmeli; gerçekte `falsch` m1 veriliyor ve itiraz yolu yok.
- önerilen düzeltme: metin boşluğuna da tek itiraz ("aslında doğru", log'da `öneri:`) ekle. Ek olarak, yazılan kelime Tuna'nın bildiği bir öğe ve `SYN` / Türkçe anlamı hedefe yakınsa "anlamdaşı da olur, aranan başka" mesajıyla yeniden sor (yazma sorusundaki `q.syn` gibi).

### Gramer `text` türü: boşlukların yarısı yanlışsa bile `fast`
- önem: düşük
- tür: haksız not (fazla cömert)
- yer: `js/gramer.js:421`
- kanıt: `2026-11-03 18:55 gram g:reflexiv:76 (text, z3) "uns ; sich ; sich ; euer" ↔ "uns ; euch ; sich ; euch" → fast`. Dönüşlü zamir konusunda dört zamirin ikisi yanlış.
- beklenen / gerçek: konunun hedef yapısında %50 hata → `falsch` bekleniyor; gerçekte `fast` (hayalet tekrar yine açılıyor ama set notu şişiyor).
- önerilen düzeltme: `text` için eşik ≥ 0,75 olsun, ya da konu etiketine giren hata (dönüşlü zamir konusunda zamir yanlışı) varsa `falsch`.

### Kalıp sorusu: Tuna cümleyi çeviriyor (soru belirsiz)
- önem: düşük
- tür: arayüz / soru belirsiz
- yer: `js/app.js:1282-1300` `frageKalip`
- kanıt: `2026-11-07 17:41:40;abr;v642:abr;…;Kime başvurabilirim? | (birine) başvurmak;wer kann ich wenden;falsch`. Tuna kalıbı ("sich wenden an A") değil cümleyi çevirmeye çalıştı. 6.11 13:10:01'de ise kalıp biçimini doğru anladı ("fürchten vor d").
- beklenen / gerçek: büyük Türkçe cümle "çevir" çağrışımı yapıyor.
- önerilen düzeltme: Türkçe cümleyi küçük / soluk yaz, yönergeyi büyük ("fiil + edat + hâl yaz, cümle değil"). İstenirse tam cümle yazılırsa içinden fiil + edat çıkarılıp kontrol edilsin.

---

## B. Soru içeriği / üretim hataları

### Metin boşluğu ve kelime arama, cümle ortasındaki büyük harfli ismi fiile / zarfa bağlıyor (Schienen → scheinen, Unternehmen → unternehmen, Weile → weil)
- önem: yüksek
- tür: içerik hatası (kod)
- yer: `js/app.js:2487` `aktSaetze` (metin etkinliği), `js/app.js:2090` `wortSuchen` (okumada kelimeye basma ve `js/dinle.js:302`). Aynı hata `kontextSaetze`'de 10.10'dan sonra düzeltildi (`app.js:739-740`, yorum: "ortadaki Schienen isim, scheinen fiili değil"), bu iki yere uygulanmadı.
- kanıt: `2026-10-31 16:02:29;luecke;v447:satz;scheinen;Der Name Eisenbahn kommt von den _____, auf denen sie fährt …;scheint;falsch;Schienen`. Tuna'ya "scheinen" fiili için boşluk diye "Schienen" (raylar) soruldu, `falsch` m1 aldı. Gece işi de Tuna'yı suçladı (feedback 10-31 16:02).
  DW + Klexikon metinlerinde aynı yolla yanlış bağlanan kelimeler (betik: `bulgular/log-2/formidx.js`): Unternehmen → unternehmen ×19, Schienen → scheinen ×3, Boten → bieten ×3, Stand → stehen ×2, Stahl → stehlen, Zwang → zwingen, Weile → weil, Fahrt → fahren, Laufe → laufen, Stille → still.
- beklenen / gerçek: isim fiilin boşluğu olmamalı; gerçekte yanlış öğeye yanlış boşluk soruluyor ve hafıza m1 yazılıyor.
- önerilen düzeltme: `aktSaetze` ve `wortSuchen`'de büyük harften küçültmeyi yalnız cümle başında ya da tırnak / iki noktadan sonra yap (kontextSaetze'deki kural; `wortSuchen` için çağıran cümle konumunu da versin). `das Unternehmen`, `die Weile`, `der Stand` gibi isimleri `quellen/nomen_extra.txt`'e ekle; formIdx onları önce isim olarak alır.

### Çok kelimeli 27 öğede boşluk yalnız ilk kelimeyi siliyor
- önem: yüksek
- tür: içerik hatası (kod)
- yer: `js/app.js:1391-1397` `wortLuecke` (`wById[id].de.split(/[ …]+/)[0]`)
- kanıt: `2026-11-04 06:48:11;nsatz;w0522:nsatz;vor allem;Grüßen Sie alle von mir, _____ allem Frau Meier.;vor allem;falsch;vor`. Tuna öğeyi ("vor allem") yazdı, sistem yalnız "vor" bekliyordu. `2026-10-24 10:26:49 w0599:nsatz … sehr _____, …;einspanned sein;falsch`: Tuna yine öğenin tamamını yazdı.
  Etkilenen öğeler (27): als ob, ein bisschen, entweder … oder, gar nicht, je … desto, jedes Mal, noch mal, ein paar, sowohl … als auch, um … zu, vor allem, weder … noch, wie viel, zwar … aber, eingespannt sein, vor Gericht gehen, zur Verfügung stehen, untersagt sein, brauchen … zu, durch den Kopf gehen, zur Seite gehen, einerseits … andererseits, nicht nur … sondern auch, sich Mühe geben, eine Entscheidung treffen, einen Vertrag schließen, den Faden verlieren.
  Örnek: "sich Mühe geben" cümlesinde "sich" boşluk olur, "ein paar"da "ein", "zur Verfügung stehen"de "zur". Bunlar öğeyi sınamaz. `G.bosPruef('vor allem','vor')` → `falsch`.
- beklenen / gerçek: boşluk öğenin ayırt edici kısmını (vor allem → "vor allem", sich Mühe geben → "Mühe … gegeben", ein paar → "paar") ya da bütün ifadeyi kapsamalı; gerçekte ilk kelime boşluk ve öğenin tamamını yazmak yanlış sayılıyor.
- önerilen düzeltme: çok kelimeli öğede ardışık kelimeler cümlede yan yanaysa hepsini tek boşluk yap (`answer` = "vor allem"). Aralıklı ifadelerde (entweder … oder) iki boşluk açılsın, ya da öğe bos basamağından çıkarılsın. Geçiş için `bosPruef`'e şu kural eklenebilir: cevap = boşluk + cümlede hemen arkasından gelen token'lar ise `richtig`.

### Düzenli fiillere kök (stamm) sorusu soruluyor
- önem: orta
- tür: kural ihlali
- yer: `js/kern.js:802-806` (göç: eski `:stamm` kartından `S.kok`'a `stark` denetimi olmadan), `js/kern.js:662-665` ve `679-682` (Kern.sec kök seçimi `stark` filtrelemiyor)
- kanıt: `zustand.json` `kok` anahtarlarının 11'i düzenli fiil: beruhigen, blitzen, füllen, rasieren, reagieren, rechnen, regnen, stellen, stimmen, verletzen, zweifeln (`G.stemOf` + `pt3` ile doğrulandı: hepsi `-te`). 26.10'dan bu yana 28 stamm sorusunun 6'sı bunlardan (15.10'dan beri 55'in 14'ü). Örnekler: `2026-11-06 13:09:26 v119:stamm sich beruhigen "Das Baby hat sich endlich _____."`, `11-05 05:37 zustimmen`, `11-03 18:47 rasieren`, `10-31 16:04 vorstellen`.
  CLAUDE.md: "Çekim (stamm) sorusu yalnız düzensiz fiillerde."
- beklenen / gerçek: düzenli fiilin çekimi ayrı soru olmamalı (yer ve gün kotasını yiyor); gerçekte günde ≤ 4 kök hakkının bir kısmı bunlara gidiyor.
- önerilen düzeltme: Kern.sec'te kök adayını `C.stark(id)` ile süz. Açılışta `S.kok`'tan stark olmayan kökleri sil (ya da `pasif` işaretle). `goc`'ta da aynı denetimi ekle.

### sich wenden an: Partizip yalnız "gewendet"; "gewandt" kabul edilmiyor
- önem: orta
- tür: içerik hatası
- yer: `quellen/verben.txt:647` (5. alan yok → `daten/verben.js` v642 `pt3: wendete, p2: gewendet`); `stammTekPruef` (`js/app.js:1657`) tek hedef kabul ediyor
- kanıt: `2026-11-06 13:11:10 v642:stamm "wenden — Perfekt" wendet → falsch (L gewendet)`, `2026-11-07 17:19:48 gewendet richtig`. "sich an jemanden wenden" anlamında yaygın biçim **wandte / gewandt** (Duden ikisini de verir, bu anlamda gewandt daha sık). Tuna "gewandt" yazsaydı `falsch` alırdı. Gece işi düzeltmesi (11-06 13:11) "ya da gewandt" diyor, ama uygulama kabul etmiyor.
- beklenen / gerçek: iki biçim de kabul edilmeli; bu anlam için gewandt öğretilmeli.
- önerilen düzeltme: `verben.txt:647`'ye `wendet, wandte, hat gewandt` ekle. `stammTekPruef`'e alternatif Partizip / Präteritum desteği ekle (`p2Alt`: gewendet, `ptAlt`: wendete). Aynı ikili düzen `senden` için de geçerli; kontrol edilsin.

### Son tanıtılan kelimelerin kendi cümlesi yok ya da çok az (selbe: 0)
- önem: orta
- tür: içerik hatası (kural 11)
- yer: `quellen/wort_saetze.txt`, `quellen/saetze.txt`, `daten/capraz.js`
- kanıt: `zustand.json`'daki 286 öğeden ≥ 5 kendi cümlesi olmayanların hepsi 6.11 13:11 – 7.11 tanıtılanlar: w0597 selbe 0 (çapraz 0), v317 herstellen 1, v500 steigen 1, v276 führen 1, w0227 häufig 1 (çapraz 0), n0229 Daten 1, n0436 Gefühl 1, w0081 dagegen 2 (çapraz 0), w0320 mehrere 2, x1575 Regierung 3. 6.11'deki "+660 cümle" o günkü öğeleri kapsadı; yeni sıradaki kelimeler cümlesiz giriyor. Bunlar B3 / B4'e çıkınca 30 günde ≤ 2 kuralıyla havuz hemen bitecek.
  Ayrıca `w0597 selbe` lemması tek başına kullanılmaz ("im selben Haus", "derselbe / dieselbe / dasselbe"). Yazmada "selben" → `fast` çekim aldı (7.11 17:28:05).
- beklenen / gerçek: yeni sıraya girmeden önce ≥ 5 cümle olmalı; gerçekte 0–3.
- önerilen düzeltme: build'e denetim ekle: yeni sıranın ilk 30 öğesinde < 5 cümle varsa uyarı versin (gece işi doldursun). Kern.yeniParti < 3 cümleli öğeyi atlayabilir. selbe'yi "derselbe / dieselbe / dasselbe (aynı)" olarak düzenle (kimlik değişmesin).

### metinde / anla: çok anlamlı kelimede hep ilk anlam soruluyor (scheinen → "parlamak")
- önem: orta
- tür: içerik hatası (kod)
- yer: `js/app.js:752-762` `frageKontext` (`ziel: kurzTr(trOf(id))`), `kurzTr` `js/app.js:57`
- kanıt: `2026-11-01 08:28 bed v447:bed "Um das Jahr 1570 scheint sie zum ersten Mal nach Spanien gekommen zu sein." → parlamak richtig (L "(güneş) parlamak")`. Cümlede scheinen "… gibi görünmek" anlamında; verben.txt:452'de iki anlam da var, ama doğru şık ilk anlam. Tuna bu cümlede yanlış anlamı "doğru" diye pekiştirdi.
- beklenen / gerçek: bağlamdaki anlam ya da bütün anlam satırı gösterilmeli.
- önerilen düzeltme: metinde sorusunda doğru şık `trOf(id)`'nin tamamı olsun ("parlamak; … gibi görünmek"). Çeldiriciler de aynı uzunlukta tam anlam satırından seçilsin. "zu + Infinitiv" ile geçen scheinen için özel kural da düşünülebilir.

### "sich treffen" yazınca `falsch` ("(biriyle) buluşmak" iki fiile aynı Türkçe)
- önem: düşük
- tür: içerik hatası / haksız not
- yer: `quellen/verben.txt:532-533` (treffen | A | "(biriyle) buluşmak, karşılaşmak" ve sich treffen mit | "(biriyle) buluşmak"), `synTreffer` (`js/app.js:1302`)
- kanıt: `2026-10-31 16:03 abr v527:abr "(biriyle) buluşmak, karşılaşmak" → "sich treffen" falsch, etiket "dönüşlü, sich fazla"`. `synTreffer` "sich treffen" ile "sich treffen mit"i eşlemiyor, çünkü edat atılmıyor.
- önerilen düzeltme: v527 Türkçesi "(birine) rastlamak; (birini) görmek (Akk)" olsun. `synTreffer` karşılaştırmada sondaki edatı (mit / an / auf …) atsın.

### Alternatif eksikleri (Tuna'nın cevabı da doğru olabilir)
- önem: düşük
- tür: içerik hatası
- yer / kanıt / düzeltme:
  - `quellen/grammatik/vergleich.txt:58` (vergleich:8, 6.11 09:53): tekil "Die Miete in Bremen ist billiger/günstiger als in München." ekle (Türkçe "kiralar" ama tekil de doğal; feedback "Çoğul → sind" diyerek tekili yanlış gösteriyor).
  - `quellen/grammatik/tuerkisch-fallen.txt` (tuerkisch-fallen:87, 3.11 18:49): "Darf ich Ihnen helfen?" ekle (itirazla `richtig` oldu).
  - `quellen/wort_saetze.txt:1293` n1082: "Rufst du den Pizza-Service an?" ekle (3.11 18:43: Tuna "die Pizza Service" yazdı, itirazla `richtig` oldu, oysa artikel yanlış).
  - n0028 die Änderung (3.11 18:44 "die Veranderung" → `falsch`): "die Veränderung" da "değişiklik". Alternatif olarak kabul edilsin (Tuna'nın cevabı yalnız umlaut eksik → `fast`).
  - n0691 (3.11 18:46 "Meine Schwester interessiert sich für _____." → "die Kunst" falsch): "für die Kunst" de doğru. Bugün `bosPruef` → `fast` 'fazla artikel'. Burada artikel opsiyonel; `richtig` olmalı ya da cümle "für moderne _____" gibi değiştirilmeli.

---

## C. Tekrar örüntüsü, kuyruk, basamak, sayaçlar

### Yanlış sonrası tekrar ve "ikinci hatırlama" çok yakın (tur sonunda kuyruk sırası yok sayılıyor)
- önem: orta
- tür: hata
- yer: `js/kern.js:547` ve `691` (tur sonunda `bek` → `at` bakılmadan en erken kuyruk girdisi), `js/kern.js:734` (`ikinci` = `a + 4 + i`)
- kanıt:
  - Yanlış tekrarı: `17:18:48 w0109 drüben falsch` → `17:19:21 tekrar:1` (araya 2 soru); `17:32:19 x1551 falsch (düzeltti)` → `17:33:06 tekrar:1` (araya 2 soru). İkisi de turun 12. adımından sonra (tur 15 cevaba uzadı). CLAUDE.md "3–5 soru sonra" diyor; "doğrusunu bir kez yaz" kutusundan hemen sonra gelince kısa süreli bellekten kopya oluyor (Gleichberechtigung 2. denemede yine yanlış yazıldı).
  - İkinci hatırlama: `17:16:16–28` üç tanıtım → `17:16:32–37` üç mini seçmeli → `17:16:42–47` üç `yaz0` "ikinci" (tanıtımdan 20–25 sn, mini sorudan 10 sn sonra; aradaki soruların ikisi öteki yeni kelimelerin seçmelisi). Hepsi doğru, tur "12/12 doğru" görünüyor (17:16:57). Aynı desen 6.11 13:11–13:12 ve 7.11 17:30–17:31'de de var.
- beklenen / gerçek: araya yeni olmayan en az 3 soru girmeli; gerçekte saniyeler sonra ve aynı yeni kelime öbeğinin içinde soruluyor.
- önerilen düzeltme: tur sonunda kuyruk boşaltılırken `at`'ı bekleyen girdiler için araya vadeli soru koy (tur 1–2 cevap uzasın), ya da 2 adım kala gelen yanlışın tekrarını bir sonraki tura taşı. `partiBasladi`'da ikinci hatırlamayı `a + 4 + n` (n = parti boyu) yap, ki ilk ikinci tüm mini sorulardan ≥ 3 vadeli soru sonra gelsin.

### Bilmediklerim, seçmeli doğruyla "artık biliyorsun"a geçiyor
- önem: orta
- tür: hata
- yer: `js/app.js:3819-3820` (`ergebnis === 'richtig'` → biçime bakmadan `bilmedikIsle(id, null, true)`)
- kanıt: `zustand.bilmedik.x1566` (Patenschaft): 10-31 16:00 yazmada "Bilmiyorum" → `d:2`. Sayılan iki doğru `11-01 08:29 erk sec` ve `11-06 09:52 erk sec kurtarma`, yani ikisi de seçmeli; kelime o günden beri hiç yazılmadı. `n0830` (Nachhilfe): 11-01 17:49 yazmada Bilmiyorum → `d:2`, sayılanlar `11-05 05:32 sec` ve `11-06 09:52 sec`.
- beklenen / gerçek: "bilmiyorum"u kapatan doğru, üretim biçiminde olmalı (`URETIM_B`); gerçekte tanıma yeterli sayılıyor.
- önerilen düzeltme: 3820'de `URETIM_B.has(q.bicim)` koşulu ekle. Gramerde (gramer.js:671) `wahl` / `eslestir` doğrusu sayılmasın.

### Durum: seçmeli oranı, ısınma / kurtarma, basamak, sayaçlar (bulgu yok, doğrulama)
- Seçmeli (yeni kod, 6.11 13:08:20 – 7.11): 12/125 (%9,6). 10'u parti mini sorusu; 7.11 17:19:54 `v481 anla` ilk kalıcı tekrar (`reps` 1, kural içinde); 6.11 13:08:31 `w0170 sec` önbellekteki eski koddan (reps 7, yeni kodda `secmeliSerbest` engellerdi). Eski dönem (30.10–6.11 sabah): 206/731 (%28).
- Kurtarma ve ısınma `yaz0` ipuçlu: 6.11 13:10:22 trocken, 7.11 17:16:02 gleichzeitig, 17:18:48 drüben. Zor soru: 7.11 17:26:14 feucht `yaz` m4. Kurallara uygun.
- Basamak / hafıza: `x1555` Würde (`bm 2`, `pk 0`, `ds 2`, vade = son + 7 g, `kapı:7g`), `w0119` eher (`lapses 4`, `S 0,16`, yanlış sonrası vade ertesi gün 04:00) tutarlı. Ancak Geduld artikel hafızası, artOb hatası yüzünden yanlış büyüdü (yukarıda).
- Gün sayaçları: `tage['2026-11-06'].n` 125 / log 124 + 1 dikte `akt` satırı; `tage['2026-11-07'].n` 90 / log 89 + 1 dikte. 30.10'dan beri her gün ±1 içinde tutarlı.
- Aynı cümle: "Die Abendzeitung hat einen Bericht über den Unfall _____." 15.10'dan beri 9 kez (bringen'in tek kendi cümlesi). `kontext.v157`'deki ilk kayıt `t:0` (göç tohumu), yani eski kullanımlar 30 gün sayımına girmiyor. Yeni kural bundan sonra sınırlayacak; bringen için 2–3 cümle daha eklenmeli.

---

## D. Etiketler ve itirazlar

### Gramerde teil'in varsayılan etiketi her yanlış / küçük hatada log'a yazılıyor (gerçek hata başka)
- önem: orta
- tür: hata (log / istatistik)
- yer: `js/gramer.js:666` (`n !== 3 && etiket` → notiz'e), `js/gramer.js:614` (fehler türünde ekranda da yalnız teil etiketi)
- kanıt:
  - `2026-11-06 13:11:54 g:satzklammer-tekamolo:67 "nachste Woche ; mit dem Flugzeug" fast | kelime sırası`: sıra doğru, hata yalnız umlaut.
  - `2026-11-07 17:26:45 g:vergleich:86 "gesagt" falsch | kelime sırası`: hata yardımcı fiil eksikliği.
  - `2026-11-06 09:53:57 g:vergleich:8 … | bağlaç | yardımcı fiil | …`: "als" doğru; "yardımcı fiil" de `G.pruefen`'in `sind`'i (koşaç) yardımcı fiil sayması.
  - `2026-11-06 09:48:34 g:reflexiv:21` cümle zaten doğruydu; Tuna "einer"e bastı. Ekranda ve log'da "yardımcı fiil" yazdı.
  - `2026-11-07 17:29:59 g:es-korrelat:139 "…, ärgert es mich" | kelime sırası | farklı`: hata fazla "es".
  
  26.10'dan beri 'kelime sırası' etiketli 36 hatalı satırın büyük kısmı bu yoldan geliyor. Gece işi "tekrarlayan hata etiketlerini say" adımında yanlış sonuç çıkarıyor.
- önerilen düzeltme: teil etiketini ayrı alana yaz (`teil:kelime sırası`) ya da yalnız başka etiket yokken ekle. `luecke` / `text` için `parcaPruef` küçük hatanın türünü de döndürsün (umlaut / kaynaştırma / konuşma dili). `fehler` + `hata '-'` yanlışında etiket "cümle doğruydu" olsun.

### İtirazlar (öneri: satırları)
- önem: düşük
- tür: diğer
- kanıt ve değerlendirme:
  - 7.11 17:23:46 vergleich:90 (virgül) → `richtig`: **haklı**, sistem hatası (yukarıda).
  - 4.11 06:52 satzklammer:96 "Ich habe zu meinem Bruder … geschrieben" `falsch` → `fast`: **haksız / cömert**. "zu meinem Bruder schreiben" yanlış (meinem Bruder / an meinen Bruder). Gece işi "itiraz haklı" dedi, katılmıyorum.
  - 3.11 18:43 n1082 cumle "Rufst du die Pizza Service an?" `falsch` → `richtig`: **fazla cömert**. "den Pizza-Service anrufen" geçerli, ama "die" yanlış artikel → `fast` olmalıydı. "aslında doğru" itirazı tam cümlede doğrudan `richtig` veriyor.
  - 3.11 18:54 es-korrelat:125 "Heute gibt es Viele Leute im Park" → `richtig`: gramer doğru ama hedef yapı (Vorfeld'de es düşer: "Heute sind …") atlandı. Sınırda.
  - 3.11 18:49 tuerkisch-fallen:87 "Darf ich ihnen helfen?" → `richtig`: "Darf" geçerli. "ihnen" (onlara) ile "Ihnen" (size) anlam farkı yaratır; küçük harf burada gerçek bir hata.
  - 31.10 16:23 es-korrelat:16 "Aphoteke", 31.10 17:26 "hlifst", 4.11 06:54 "schalfen", 5.11 05:45 "Montan" → `richtig`: tek harf yazım hatası. 5.11'den beri sistem bunlara zaten `fast` veriyor; itirazla `richtig` biraz cömert, zararsız.
- önerilen düzeltme: tam cümlede "aslında doğru" itirazı, cevap ile en yakın hedef arasında artikel / çekim farkı varsa en çok `fast` versin.

---

## E. Gece işinin düzeltmeleri (daten/feedback.js)

### feedback.js'te yanlış ya da yanıltıcı 7 düzeltme
- önem: orta
- tür: içerik hatası
- yer: `daten/feedback.js` (satırlar zaman damgasıyla)
- kanıt / düzeltme:
  1. `2026-11-03 18:46 n0691:nsatz`: `antwort: "Kunst", richtig: "die Kunst", "Artikel unutulmaz"`. **Ters**: log'da Tuna "die Kunst" yazdı, sistem "Kunst" bekledi. "für die Kunst" de doğru. Düzelt: antwort "die Kunst", richtig "Kunst", metin "boşluğun önünde artikel yok; für Kunst da für die Kunst da doğru".
  2. `2026-11-05 05:41 w0625:nsatz`: "ehrenamt → ehrenamtlichen: aslında çekim hatası (sistem haksız saydı)". Yanlış: Ehrenamt isim, ehrenamtlich sıfat; bu türetme hatası, sistem haklıydı.
  3. `2026-11-06 13:07 g:reflexiv:48`: "edat für ya da zu + Akk". zu her zaman Dativ: "zur Prüfung" (zu + der). Düzelt: "für + Akk ya da zu + Dat".
  4. `2026-11-06 13:13 g:modalverben:56`: `antwort: "hata yok"`, `urteil: "falsch"`. Tuna "Bilmiyorum" dedi (boş); "hata yok" zaten doğru cevaptı. Geçmiş'te "senin: hata yok ✗" görünür. Düzelt: antwort "(Bilmiyorum)", metin "Cümlede hata yoktu: durfte doğru Präteritum".
  5. `2026-10-31 16:02 v447:satz` (Schienen): "scheinen fiil, burada isim gerekirdi" diyerek Tuna'yı suçluyor. Gerçekte sistem hatası; metin "Bu boşluk hatalıydı (Schienen = raylar, scheinen değil), sayılmamalı" olmalı.
  6. `2026-11-03 18:44 n0028:wort`: "Veränderung ayrı, daha uzun bir kelime". die Veränderung da "değişiklik"; Tuna'nın tek hatası umlaut.
  7. `2026-11-06 09:53 g:vergleich:8`: "Çoğul Mieten → sind" tekili yanlış gösteriyor; "Die Miete in Bremen ist günstiger als in München" da doğru (eksik olan "in" ve "München").
- Ayrıca `daten/kancalar.js` n0994: "-ept ile biten Rezept/Konzept/Prinzip hep das". Prinzip -ept ile bitmiyor ve "-ept → das" bilinen bir kural değil. "das Rezept, das Konzept" diye somut tutulsun (kural uydurma).
- önerilen düzeltme: yukarıdaki satırları düzelt. Gece işi istemine (`tools/istem_gece.md`) şunu ekle: "sistemin boşluk / öğe eşleşmesi saçmaysa (isim ↔ fiil) Tuna'yı değil sistemi işaretle; antwort / loesung alanlarını log'dan birebir kopyala".

---

## F. Tuna'nın en sık hata türleri (26.10 – 7.11; 332 hatalı satır: 249 `falsch`, 83 `fast`)

- **Gramer (107):** es-korrelat 13 (dass-cümlesi başta iken "es" bırakmak: "…, ärgert es mich", "finde ich es toll"), reflexiv 12 (mir / mich: "Ich muss mich das Video ansehen", "mir vorstellen"; sich + edat), vergleich 10 (als-yan cümlede fiil sonda: "als ich habe erwartet"; yardımcı fiil eksik "gesagt"), satzklammer / TeKaMoLo 8, verbstellung 7 (deshalb + özne-fiil: "deshalb ich gehe"). Tür: luecke 30, ceviri 21, umform 13, fehler 13 (fehler'de "hata yok" denip hata kaçırılan 6 satır), ordnen 8.
- **Artikel (78 satır):** yazdığı → doğrusu: die→der 15, das→der 14, der→die 14, die→das 11, der→das 10, das→die 8. Yani "der tahmini" tek başına baskın değil; üç yöne de dağılıyor. En çok: die Feuerwehr 6, die Geduld 5, die Gymnastik 5, der Wetterbericht 4, das Vorurteil 4, der Humor / das Gewitter / das Missverständnis / der Supermarkt / der Verein / das Rezept 3. artOb'da hâl hatası yok; hatalar cinsiyet hatası (Burg→dem, Gewitter→die, Feuerwehr→des, Wetterbericht→das).
- **Partizip / yardımcı fiil:** gebliebt (×2), gebrachen (×2), gebrachten, vergelauft, umgesteigt, (an)meldet, heiratet; haben ↔ sein: gefahren, umgestiegen, "bin mich verlaufen" (hata yok sanıldı). İçerik önerisi: ge-…-en düzensiz Partizip ve sein-fiilleri için kısa mini set.
- **Karışan kelime çiftleri (yazmada):** drüben ↔ drinnen (×3), eher ↔ eben / allerdings (×3), anwesend ↔ allerdings (×2), eigen ↔ eignen (×2), der Wert ↔ die Würde, das Verhalten ↔ das Bedürfnis, das Bedürfnis ↔ die Bedeutung, fließend ↔ fleißig, übertreiben ↔ überweisen, zuverlässig ↔ zufällig, sogar ↔ sonder(n), Gericht ↔ gerecht, Behauptung ↔ Mahnung, verschreiben ↔ unterschreiben. `ayir` ve `karismaTablosu` için hazır liste; çiftlerin ilk dördü için yan yana cümle yazılmalı.
- **Edat (15):** sich kümmern für (um), sich vorbereiten zu (auf), sich bewerben an (um), "zu meinem Bruder schreiben", bei/zur Prüfung anmelden.
- **Bilmiyorum (16):** Ehrenamt, bedürftig, verantwortlich, Bedürfnis(se), deutlich, Nachhilfe, betreuen, finanzieren; gramer: statt…zu, nicht so … wie, modal Präteritum. 2–3'er yeni cümle önceliği.
- **Takılanlar (leech, 6–7.11):** der Wetterbericht (kanca var), drüben, das Gewitter, die Gleichberechtigung (7.11'dekiler için kanca henüz yok: gece işi bu gece yazacak).

Yardımcı betikler: `bulgular/log-2/t1.js` (kontrol fonksiyonu yeniden üretimleri), `bulgular/log-2/formidx.js` (büyük harfli isim → fiil eşleşmeleri), `bulgular/log-2/gr.py` (gramer alıştırmasını kaynakta bulma), `bulgular/log-2/eski_fehler.txt` (26.10 – 6.11 hatalı üretim satırları).
