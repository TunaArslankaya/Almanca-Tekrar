# kullan-3: Notlama adaleti + genel kullanım (7.11.2026)

## Özet
- Odak notlama adaletiydi. Her soru türünde 3–8 öğe, 8–15 cevap varyantı gerçek arayüzden verildi (yaklaşık 700 cevap). Ek olarak saf kontrol fonksiyonları (dikte, gramer `pruef` 6359 alıştırma üzerinde, `cumleKontrol`) ayrıca sınandı. Tablolar `kullan-3/*.md` ve `*.json` dosyalarında.
- En önemli bulgular:
  - **Gramer'de 1/2/3 tuşu her cevabın notunu değiştiriyor.** "Bilmiyorum" + 3 = richtig, set puanı 5/5. Gerçek log'da 8 kez kullanılmış; hepsi notu yükseltmek için.
  - **Tam cümlede geçerli Almanca dizilişler "kelime sırası" hatası sayılıyor.** Örnekler: "Morgen kann ich dir helfen", "Am Wochenende treffe ich meine Freunde", "Beim Chef habe ich mich beschwert". Not m2, seviye atlamaz.
  - **Gramer boşluklarında tek harf yazım hatası tam yanlış sayılıyor.** Örnekler: Mnoaten, gleesen, ahbolen. 574 denemenin 573'ü falsch çıktı.
  - **ae/oe/ue yazımı bölüme göre farklı notlanıyor.** "Pruefung" kelime yazmada doğru; cümlede boşlukta, sesli boşlukta ve gramerde ise "umlaut" küçük hatası (m2). Umlautsuz yazım ise boşlukta "yazım" (m3) sayılıyor; spesifikasyonun tam tersi.
  - **Kalıp / fiil yazmada hâl (A/D) yazılmasa da tam doğru veriliyor.** Gerçek log'da doğru sayılan edatlı fiil cevaplarının 20/28'inde hâl yok.
- Diğer önemli bulgular:
  - İsimde yanlış artikel + umlaut/çekim hatası birlikte olunca artikel hatası nota ve log'a geçmiyor.
  - Metin boşluğunda "die Luft" tam yanlış sayılıyor (cümlede boşlukta küçük hata).
  - "Okurken (metinde) anlamı" sorusunda yanlış anlam veriliyor (der Rat = belediye meclisi, cevap "tavsiye").
  - Ana turda tam cümle basamağı neredeyse hiç gelmiyor: Kasım'da 1, Ekim'de 0.
- Konsol / sayfa hatası yok. Bu çalıştırmalarda hata çıkmadı: 3 gün masaüstü + 1 gün mobil tur, her bölüm taraması, Gramer, Cümle atölyesi, ses yuvası. Enter / Esc / çift Enter / Devam kilidi / "doğrusunu bir kez yaz" / itiraz düzgün çalışıyor.

Önem dağılımı: yüksek 4 · orta 6 · düşük 10.

### Notlama tutarlılık tablosu (gerçek arayüz, ölçüldü)
| hata türü | yaz (isim/diğer) | kalıp / fiil yaz | cümlede boşluk (bos/bos0, duy-boşluk) | metin boşluğu | paket | tam cümle | dikte | gramer boşluk | gramer cümle | kök |
|---|---|---|---|---|---|---|---|---|---|---|
| doğru | richtig m3 | richtig | richtig | richtig | richtig | richtig | richtig | richtig | richtig | richtig k3 |
| ae/oe/ue (Pruefung) | **richtig** | richtig | **fast m2 "umlaut"** | richtig | fast | richtig | richtig | **fast** | fast | richtig |
| umlautsuz (Prufung) | fast m2 umlaut | fast m2 | **fast m3 "yazım"** | fast "yazım" | fast | fast m3 | fast | fast | fast | fast k2 |
| tek harf (≥5 harf) | fast m3 yazım | fast m3 | fast m3 | fast | fast | fast m3 | fast | **falsch** | fast | fast k2 |
| harf yer değişimi umlautlu kelimede (Kläte, Prfüung, fhärt) | **falsch** | – | **falsch** | – | – | – | – | – | – | **falsch k1** |
| küçük harf isim | richtig | – | richtig | fast | fast | richtig (etiket) | richtig (etiketsiz) | richtig | fast | – |
| başına artikel (die Luft) | (beklenen) | – | fast "fazla artikel" | **falsch** | richtig/fast | – | – | – | – | – |
| yanlış ek (Vertrage, Schmerze) | fast m2 çekim | fast m2 | fast m2 çekim | fast **"yazım"** | fast | fast m3 | fast | falsch | – | falsch |
| noktasız / büyük harf başta | richtig | richtig | richtig | richtig | richtig | richtig | richtig | richtig | richtig | richtig |
| Bilmiyorum | falsch m1 | falsch m1 | falsch m1 | falsch | – | falsch m1 | falsch | falsch (sonra 3 tuşu → richtig!) | aynı | falsch k1 |

Ayrıntılı tablolar: `kullan-3/wort.md`, `abr.md`, `prod.md`, `bos.md`, `cumle.md`, `ao.md`, `gram.txt`.

---

### Gramer: cevaptan sonra 1 / 2 / 3 tuşu notu istenen değere çeviriyor (öz-değerlendirme, sınırsız)
- önem: yüksek
- tür: kural ihlali
- yer: `js/gramer.js:840` (`tus`: `/^[123]$/` → `notla(+e.key)`), `js/gramer.js:620-640` (serbest türlerde "yanlış say / küçük hata say / aslında doğru" düğmeleri). Gramer bölümü, Boylu boyuna, hayalet, karışık tekrar ve ana turdaki gramer sorusunda (`turTus` → `tus`) geçerli. Yalnız tanı testinde yok.
- kanıt:
  - Yeniden üretme: Diğer → Gramer → Adjektivdeklination "Tekrar et".
  - 5 alıştırmanın 5'ine de yanlış cevap ya da "Bilmiyorum" verildi, her birinden sonra `3` tuşuna basıldı.
  - Log satırları: `gram;g:adjektiv:30;warme;richtig;tür:wahl | z:2 | öneri:falsch`, `g:adjektiv:130;Das ist falsch.;richtig;…öneri:falsch`, `g:adjektiv:29;(boş);richtig;… bilmiyorum | öneri:falsch`.
  - Set sonu `g:adjektiv;richtig;puan:5/5` (betik: `kullan-3/gramui2.js`).
  - wahl / luecke / Bilmiyorum'da ekranda düğme bile yok; tuş gizli kısayol. Ayrıca sıradaki seçmeli sorunun şıkkı için basılan rakam, önceki yanlışı "doğru"ya çevirebilir.
  - Gerçek log'da 8 kez kullanılmış, hepsi yükseltme. Örnek: `2026-11-04 06:52:24 g:satzklammer-tekamolo:96 "Ich habe zu meinem Bruder …" fast … öneri:falsch` (yanlış Almanca küçük hataya çıkarılmış). `2026-10-31 16:23:25 … Aphoteke … richtig … öneri:falsch`.
- beklenen / gerçek:
  - Beklenen (CLAUDE.md kural 8): "Notu sistem verir; soru başına tek itiraz", Bilmiyorum'dan sonra itiraz yok.
  - Gerçek: her soruda 1/2/3 ile istenen not veriliyor. Konu FSRS kartı, teil istatistiği ve hayalet bu nota göre güncelleniyor.
- önerilen düzeltme:
  - `tus()`'taki `[123]` dalını kaldır.
  - `cevapla()`'daki `serbest` düğmelerini, ana uygulamadaki gibi tek itiraza indir: "aslında doğru" (ceviri / umform / ordnen) ve "yazım hatasıydı". `bilmiyorum` ve wahl / luecke+opt / eslestir / kategori'de itiraz olmasın.
  - `notla(n)` yalnız `q.oneri` ya da bir kez itirazla yükseltilmiş değeri kabul etsin. Log'da `öneri:` kalsın.

### Tam cümle: geçerli Vorfeld / ters dizilişler "kelime sırası" sayılıp m2 alıyor
- önem: yüksek
- tür: haksız not
- yer: `js/grammatik.js:906-934` (`ckZarf`, `ckVaryant`), `js/app.js:1515` (`cumlePruef`: fast + kelime sırası → `cumleYapi` = m2)
- kanıt (`G.cumleKontrol`, betik `kullan-3/vorfeld.js`; tam cümle sorusunda arayüzden de: "Beim Chef habe ich mich beschwert." → fast m2):
  - hedef "Ich kann dir morgen helfen." ← "Morgen kann ich dir helfen." → fast · kelime sırası
  - "Ich treffe meine Freunde am Wochenende." ← "Am Wochenende treffe ich meine Freunde." → fast
  - "Wir haben uns im Park getroffen." ← "Im Park haben wir uns getroffen." → fast
  - "Ich habe mich gestern beim Chef beschwert." ← "Gestern habe ich mich beim Chef beschwert." → fast
  - "Meine Mutter kocht am Sonntag immer Suppe." ← "Am Sonntag kocht meine Mutter immer Suppe." → fast
  - "Ich freue mich sehr auf den Urlaub." ← "Auf den Urlaub freue ich mich sehr." → fast
  - Yalnız zarf doğrudan çekimli fiilden sonra gelip özne zamir olunca çalışıyor: "Ich habe gestern das Buch gelesen" → "Gestern habe ich …" richtig.
- beklenen / gerçek:
  - Beklenen (CLAUDE.md): "geçerli başka dizilişler (Vorfeld, yan cümle önde) doğru".
  - Gerçek: yaygın ve ders kitabı düzeyinde doğru V2 dizilişleri küçük hata. m2 alıyor, `bm` yükselmiyor, panelde "Ana cümlede çekimli fiil 2. sırada…" açıklaması çıkıyor. Tuna doğru yaptığı devrik cümleyi yanlış sanıyor; Sprechen için tam da öğrenmesi gereken yapı bu.
- önerilen düzeltme:
  - `ckVaryant`'ta Vorfeld adayı yalnız `R[0]` değil, R içindeki her zaman / yer öbeği ve edat öbeği olsun (`ckZarf` her konumda denensin; araya giren dönüşlü / nesne zamiri ve modal + mastar dahil).
  - Özne yalnız `CK_SUBJ` zamirleri değil, artikel + isim öbeği de olabilsin ("meine Mutter").
  - Varyant: `[öbek] + V + özne + kalan (öbek çıkarılmış)`.
  - En azından: kelimeler birebir aynı, çekimli fiil 2. sırada ve fiil sonu (Partizip / mastar) yerindeyse `richtig` (ya da etiketsiz `fast` m3), `cumleYapi` değil.

### Gramer boşluk (luecke) parçalarında tek harf yazım hatası tam yanlış
- önem: yüksek
- tür: haksız not
- yer: `js/gramer.js:323` (`parcaPruef`: yalnız tam eşleşme, `fold` ve kaynaştırma; yazım toleransı yok). 5.11 düzeltmesi yalnız `cumlePruef`'e (umform / ceviri / ordnen) eklenmiş.
- kanıt:
  - Bütün seçeneksiz luecke alıştırmalarında, her boşluğun en uzun (≥ 6 harf) kelimesinde ortadaki iki harf yer değiştirildi: 574 denemenin 573'ü `falsch` (betik `kullan-3/gramsay.js`).
  - Örnekler (`kullan-3/gram.txt`): temporal-praep:47 "Mnoaten" (Monaten), temporal:51 "gleesen ; habe", trennbar:20 "ahbolen", nomen-verb:67 "terffen", temporal:172 "Sboald" → hepsi falsch, etiketsiz.
  - Aynı hata ceviri / umform'da fast "yazım" alıyor.
  - Ana turdaki gramer sorusunda da seçeneksiz luecke çıkıyor (`TUR_TUR`).
- beklenen / gerçek:
  - Beklenen (5.11, Tuna: "morgem yazdım hata veriyor"): konu dışı yazım hatası küçük hata.
  - Gerçek: tam yanlış. Teil hayalete düşüyor, tanı testinde konu "zayıf" çıkabiliyor.
- önerilen düzeltme: `parcaPruef`'e `cumlePruef`'teki gibi tek kelime farkında `G.yakin(x, h) === 'yazim'` → `fast` + `yazım` ekle. Ek farkı (`cekim`) gramer hatası olarak kalsın; boşluğun konusu çoğunlukla ek.

### ae / oe / ue yazımı ve umlaut eksikliği bölüme göre ters notlanıyor
- önem: yüksek
- tür: haksız not
- yer:
  - `js/grammatik.js:796` (`bosPruef` → `pruefen` lemma'sız: `fold` ae → a eşitliği "umlaut/ß" fast; umlautsuz yazım `yakin` → "yazım").
  - `js/app.js:3496` (`tipAus`: `umlaut/ß` → `umlaut` m2).
  - `js/gramer.js:326` (`parcaPruef`: `fold` eşitliği → fast).
  - Aynı yol `js/dinle.js:215` (duy-boşluk) ve `js/app.js:1919` (paket, `G.pruefen`).
- kanıt (arayüzden, `kullan-3/bos.md`):
  - Prüfung-bos: "Pruefung" → fast m2 `umlaut`, "Prufung" → fast m3 `yazım`.
  - Wärme-bos0: "Waerme" → fast m2 umlaut.
  - zuverlässig-bos: "zuverlaessig" → fast m2.
  - Aynı kelimeler yazma sorusunda: "die Kaelte", "die Bestaetigung", "zuverlaessig" → richtig.
  - Tam cümle ve metin boşluğu: ae → richtig.
  - Gramer luecke: ä/ö/ü içeren 65 boşluğun 65'inde ae yazımı fast ("Koenntet", "haette", "an die Tuer").
- beklenen / gerçek:
  - Beklenen (CLAUDE.md "Yazım hoşgörüsü"): ae / oe / ue / ss tam doğru; umlaut farkı m2.
  - Gerçek: cümlede boşluk / sesli boşluk / gramerde ae yazımı cezalı, umlautsuz yazım ise daha hafif (m3) cezalı. Umlaut tuşu olmayan klavyede ae yazan Tuna'yı cezalandırıp hiç yazmayanı ödüllendiriyor.
- önerilen düzeltme:
  - `bosPruef` başında `acik(u) === acik(c)` (büyük / küçük harf duyarsız) → richtig.
  - Tek kelime farkı yalnız umlaut ise (`umlFold(acik)`) → `tip: 'umlaut'` (yazım değil).
  - `parcaPruef`'te ae / oe / ue / ss'yi `fold`'dan önce ayrı kontrol edip richtig ver; umlaut eksikse fast.
  - Hepsi tek yardımcıda toplansın (bkz. tutarlılık tablosu).

### Kalıp / fiil yazma: hâl (A/D) yazılmasa da tam doğru
- önem: orta
- tür: kural ihlali
- yer: `js/app.js:1314-1348` (`pruefAbr`: `kas[p.p] && kas[p.p] !== p.k` yalnız yazılmışsa denetler)
- kanıt:
  - Arayüzden (`kullan-3/abr.md`): kalıp "sich fürchten vor" → "sich fürchten vor" richtig m3. Aynı sonuç "verzichten auf", "sich beschweren bei", yazma "sich wundern über", "zweifeln an" için de çıktı. Yönerge ise "fiil + edat + hâl (A / D) yaz".
  - Gerçek log'da doğru sayılan 28 edatlı fiil cevabının 20'sinde hâl yok. Örnekler: `2026-10-09 12:24:52 verzichten auf → verzichten auf (auf + Akk)`, `2026-10-14 19:35:21 sich aufregen über`.
- beklenen / gerçek:
  - Beklenen: kalıp sorusu (S3) hâli sınar; yazılmamışsa en az fast (m2 ya da m3) + `hâl eksik`.
  - Gerçek: hâl hiç sınanmadan doğru, `bm` yükseliyor.
- önerilen düzeltme: `pruefAbr`'de edatlı fiilde `kas[p.p]` yoksa `tip = 'hal'` (ya da yeni `hal-eksik` → m3 fast) ve etiket `hâl eksik: auf + Akk`. En azından `kalip` biçiminde zorunlu olsun.

### İsim yazma: yanlış artikel + umlaut / çekim hatası birlikteyken artikel hatası kayboluyor
- önem: orta
- tür: haksız not
- yer: `js/kern.js:135,139` (`notVer` `umlaut` ve `cekim` dallarında `artEt()` / `aNot()` yok: `a: null`)
- kanıt (`kullan-3/ek.js`):
  - "der Kalte" (die Kälte) → fast m2, a = null, etiket yalnız `umlaut`.
  - "das Verträge" / "die Vertrages" (der Vertrag) → fast m2 `çekim`, a = null.
  - "der Prufung", "der Anderung" → aynı.
  - Panelde kural kutusu "der değil → die …" görünüyor, ama başlıkta / etikette artikel yok ve artikel hafızası yazılmıyor.
  - Log'da `artikel der → die` etiketi olmadığı için gece analizi de saymıyor. Yalnız artikel yanlışı ise doğru işliyor: fast m3 a1.
- beklenen / gerçek: Beklenen: artikel ayrı değerlendirilir ("kelime ✓ artikel ✗ = m3 a1"); kelimede küçük hata olsa da artikel sınanmış sayılmalı.
- önerilen düzeltme: `notVer`'de `umlaut`, `cekim` (ve `hal`) dallarında da `artEt()` çağır, `a: aNot()` döndür.

### Metin boşluğu: artikelle yazılan isim tam yanlış; küçük hatalı kutular yeşil ve doğrusu gösterilmiyor
- önem: orta
- tür: haksız not / arayüz
- yer: `js/app.js:2196-2216` (`uPruef`), `js/app.js:2560-2563` (`aktRender`: `q.ok[i]` fast'ı da "ok" sayar, `u-dogru` yalnız yanlışta)
- kanıt (`kullan-3/metin.js`):
  - "die Luft", "die Wolken", "die untersucht" → falsch, etiketsiz. Cümlede boşlukta aynı durum fast `fazla artikel`.
  - "veschrieben" (verschrieben), "Bltz", "apotheke" fast oluyor; ama kutu yeşil kalıyor ve doğru yazım hiç gösterilmiyor (ekran: `kullan-3/metin_sonra.png`). Tuna yanlış yazımı doğru sanıyor.
  - "Rezepte" (Rezept) / "Friere" (Frieren) `yazım` etiketi alıyor; doğrusu `çekim`.
- önerilen düzeltme:
  - `uPruef`'e `bosPruef`'teki "başa eklenen artikel → fast" kuralını ekle (ya da metin boşluğunda doğrudan `G.bosPruef` kullan).
  - `lev ≤ 1` kontrolünden önce `G.yakin` ile çekimi ayır.
  - Fast boşluklarda kutu sarı olsun ve yanında doğru biçim (`u-dogru`) gösterilsin.

### "Metinde" sorusu: çok anlamlı kelimede yanlış anlam doğru şık
- önem: orta
- tür: içerik hatası
- yer: `js/app.js:752` (`frageKontext`), `kontextSaetze` (okuma metinlerinden lemma eşleşmesi), `daten/lesetexte.js` (Klexikon)
- kanıt (`kullan-3/mc.txt`):
  - n0957 der Rat, metinde: "Hier trifft sich der Stadtrat oder Rat, das heißt die Volksvertretung der Stadt."
  - Doğru şık "tavsiye, öğüt"; burada Rat = belediye meclisi. Çeldiricilerde "belediye binası" da var.
  - Aynı mekanizma `scheinen` için yorumda zaten not edilmiş, isimlerde önlem yok.
- önerilen düzeltme: metinde sorusu yalnız öğenin kendi / Goethe cümleleriyle ya da anlam etiketli (tek anlamlı) kelimelerde. Ya da `kontextSaetze`'de "Stadtrat / Rathaus" gibi bileşik ve bilinen çok anlamlıları dışla. Rat için Klexikon cümlesini kara listeye al.

### Ana turda tam cümle basamağı neredeyse hiç sorulmuyor
- önem: orta
- tür: diğer
- yer: `js/kern.js` (`basamak` / `bm` kapısı / `secmeliSerbest` / ısınma-kurtarma-momentum yaz0)
- kanıt:
  - Gerçek log'da `bicim:cumle`: Ekim'in tamamında 0, 1–7 Kasım'da 1. `bicim:bos` 10, `yaz0` 105, `sec` 131.
  - 3 günlük simülasyonda (gerçek kayıt, 6 tur, 72 cevap: `kullan-3/gunler.js`) tam cümle 0, `bos` 0, `bos0` 3. Cevapların büyük kısmı ısınma / kurtarma / ikinci / tekrar `yaz0` (ipuçlu), gramer 11, ayır 6, artOb 6, ses 6.
  - Tuna'nın 6.11 hedefi "tanıma değil üretim".
- beklenen / gerçek: Beklenen: merdivenin üstü (B3 / B4) düzenli gelsin. Gerçek: tur ipuçlu yazma ve yan yuvalarla doluyor, cümle düzeyinde üretim yok denecek kadar az.
- önerilen düzeltme:
  - Turda en az 1–2 `bos` / `cumle` yuvası ayır (bm ≥ 2 öğelerden).
  - Isınma / momentum "bir basamak aşağı"yı bm ≥ 3 öğede cümleye indirsin, `yaz0`'a değil.
  - Not: algoritma etkisi doğrulandı (log), nedenin tam dökümü doğrulanmadı.

### Tam cümle: doğru alternatif çeviriler (Präteritum, ihr, Freundin) tam yanlış
- önem: orta
- tür: haksız not
- yer: `js/app.js:1515` (`cumlePruef`), cümle verisi `quellen/saetze.txt` / `wort_saetze.txt` (` || ` alternatifleri eksik)
- kanıt (`kullan-3/cumle.md`):
  - "Arkadaşım sınavı geçti." → "Mein Freund bestand die Prüfung." falsch m1.
  - "Patrona şikâyette bulundum." → "Ich beschwerte mich beim Chef." falsch m1.
  - "İkiniz de sözleşmeyi imzalamalısınız." → "Ihr beide müsst den Vertrag unterschreiben." falsch m1 (Türkçe -sınız ihr de olabilir).
  - "Meine Freundin …" richtig (alternatif varmış).
  - İtiraz "aslında doğru" mevcut, ama bilmeyen Tuna yanlış öğrenir.
- önerilen düzeltme:
  - Fiil cümlelerinde hedef Perfekt ise Präteritum biçimini (en azından sein / haben / modal ve sık düzensizlerde) otomatik alternatif üret ya da fast say.
  - "-siniz / -sınız" cümlelerinde ihr alternatifini build'de ekle. Gece işi için sık itiraz edilen cümleleri `alts`'a ekleme kuralı koy.

### Tam cümlede tek fazla parçacık (auch, noch …) tam yanlış, eksik kelime ise küçük hata
- önem: düşük
- tür: haksız not
- yer: `js/grammatik.js:824` (`CK_AGIR`), `cumleKontrol` "tek büyük hata" dalı
- kanıt:
  - "Ich verzichte auch heute auf den Kaffee." → falsch m1 `fazla kelime`.
  - "Bringen Sie auch mir bitte ein Glas Tee!" → falsch.
  - Buna karşılık "Bringen Sie mir ein Glas Tee!" (bitte eksik) → fast.
- önerilen düzeltme: fazla `auch` / `noch` / `schon` (anlamı az değiştiren parçacık) tek hataysa fast m3 + `fazla kelime`. CK_AGIR yalnız eksiklikte uygulansın.

### Dikte: isimler küçük harfle yazılınca tam doğru, etiket bile yok
- önem: düşük
- tür: haksız not
- yer: `js/dinle.js:38-55` (`diktePruef`: `büyük/küçük harf` etiketi richtig'de siliniyor)
- kanıt:
  - "wir sind mit dem zug gefahren." → richtig, etiket yok.
  - "an der universität bremen …" (duy-dikte, arayüzden) → "✓ Doğru".
  - Tam cümle sorusunda aynı durum en azından etiket gösteriyor.
- önerilen düzeltme: dikte bir yazım alıştırması. İsim küçük harfle yazılmışsa fast + `büyük/küçük harf` (en azından etiket kalsın, panelde "İsimler büyük harfle" notu çıksın).

### Umlautlu kelimede komşu harf yer değişimi tam yanlış (Damerau, acik genişletmesinden sonra bozuluyor)
- önem: düşük
- tür: haksız not
- yer: `js/grammatik.js:699` (`yakin`: önce `acik` ä → ae, sonra `dlev`)
- kanıt:
  - "die Kläte" (Kälte) → falsch, itiraz önerisi çıkıyor.
  - "Prfüung" (Prüfung), "Wräme", "khül", "sich Mhüe geben" → falsch.
  - Kök "fhärt" (fährt) → falsch k1; aynı kelimede "fäert" fast.
  - Umlautsuz kelimelerde yer değişimi fast.
- önerilen düzeltme: `dlev`'i `acik`'ten önce (orijinal harflerle) de dene; ikisinden küçüğünü al.

### Kısa umlaut / ß kelimelerde aşırı hoşgörü: gerçek başka kelime "yazım" sayılıyor
- önem: düşük
- tür: haksız not
- yer: `js/grammatik.js:687-695` (`yazimTok`: uzunluk `acik` sonrası ölçülüyor; `lex.has(a)` acik'li biçimi arıyor)
- kanıt:
  - "hieß" (heiß için; heißen'in Präteritum'u) → fast `yazım`.
  - "heß", "kül" (4 harfli lemma) → fast; spesifikasyon ≥ 5 harf diyor.
  - "der Scherz" (Schmerz) ve "sich bescheren" (beschweren) da yazım: gerçek kelimeler, sözlükte olmadıkları için.
- önerilen düzeltme: uzunluk eşiğini orijinal lemma uzunluğuyla ölç. Sözlük kontrolünü hem orijinal hem acik biçimle yap.

### Paket boşluğu: fiilin önüne artikel yazılınca tam doğru
- önem: düşük
- tür: haksız not
- yer: `js/app.js:1919-1922` (`paketPruefen`: "artikel metinde zaten var" dalı öğe türüne bakmıyor)
- kanıt: "Mit der Bahn" paketinde boşluk `abfahren` → girdi "die abfahren" → "✓ Doğru" (`kullan-3/yan.js`).
- önerilen düzeltme: artikel soyma yalnız isim boşluğunda (`kind(l.id) === 'n'`), ve sonuç en çok `fast` (`fazla artikel`).

### Gramer cümlesinde yalnız virgül eksikliği "kaynaştırma" etiketiyle küçük hata
- önem: düşük
- tür: haksız not
- yer: `js/gramer.js:358` (`cumlePruef`: `fold` virgülü siliyor → kaynaştırma dalı)
- kanıt:
  - vergleich:90 "Es gab mehr Arbeit als ich erwartet habe." → fast `kaynaştırma`.
  - Gerçek log `2026-11-07 17:23:46` (Tuna 3 ile richtig'e çevirmiş).
- önerilen düzeltme: virgül farkını ayrı etiketle (`virgül`). Kaynaştırma dalı yalnız gerçekten `in dem` / `im` farkında çalışsın.

### Gramer cümlesinde "Aphoteke" gibi iki konumluk harf kayması tam yanlış
- önem: düşük
- tür: haksız not
- yer: `js/gramer.js:367-370`, `yakin` (lev 2 yalnız ≥ 10 harf)
- kanıt: es-korrelat:16 "Gibt es eine Aphoteke in der Nähe?" → falsch `farklı` (alternatiflerden biriyle birebir aynı, tek kelimede 'h' kayması). Gerçek log `2026-10-31 16:23:25`'te Tuna 3 ile düzeltmiş. Apotheke yazımı 5.11 notunda da geçiyor (Tuna sık yapıyor).
- önerilen düzeltme: tek kelime farkında ve kelime ≥ 7 harfte, aynı harf kümesi (anagram) + lev 2 → `yazım`.

### Seçmelide şıklar açıldıktan 0,4 sn içinde basılınca "✓ Doğru" görünüyor ama sayılmıyor
- önem: düşük
- tür: arayüz
- yer: `js/app.js:3448-3470` (`mcWahl`), `kern.js` `COK_HIZLI`
- kanıt: `kullan-3/mc2.js`: Enter ile aç, 0,1 sn sonra doğru rakam → panel "✓ Doğru", not `sayılmadı` (m yok). Kullanıcıya hiçbir şey söylenmiyor.
- önerilen düzeltme: `sayılmadı` durumunda başlık "✓ (çok hızlı: sayılmadı)" olsun ya da basış 0,4 sn dolana kadar yok sayılsın.

### Mobil: "Doğrusunu bir kez yaz" kutusu uzun açıklamaların en altında, kilitli Devam'ın altında kalıyor
- önem: düşük
- tür: arayüz
- yer: `js/app.js:3639` (`sonucPanel`: `duzeltHTML` kanca ve örnekten sonra)
- kanıt: 390×844'te tam cümle yanlış. Kutu, Devam düğmesinin altında, iki ekran aşağıda (`kullan-3/panel_m_cumle_yanlis.png`, `_full.png`). Devam'a dokununca odak kutuya gidiyor (çalışıyor), ama ilk bakışta "Devam neden açılmıyor" hissi var.
- önerilen düzeltme: düzeltme kutusunu "doğrusu" satırının hemen altına taşı; açıklama / kanca altta kalsın.

### Kök sorusunda könnte / konnte (Konjunktiv II ↔ Präteritum) yalnız "umlaut" küçük hatası
- önem: düşük
- tür: haksız not
- yer: `js/app.js:1657` (`stammTekPruef`: `derece` umlaut → 1), `pruefenLemma` umlaut dalı sözlüğe bakmıyor
- kanıt:
  - kokSatz können: "könnte" → fast k2.
  - Claude'un kendi notu (Geçmiş) "dürfte Konjunktiv II'dir" diyerek bunu ayrı hata sayıyor.
  - Benzer: zahlen / zählen, schon / schön yazma sorusunda umlaut fast.
- önerilen düzeltme: umlaut farkıyla yazılan biçim sözlükte ya da fiilin bilinen biçimleri arasında başka bir biçimse (`LEX` / `CK_IRR`) `yanlis` + `biçim karıştı: Konjunktiv II`.

---

### Doğrulanan, sorun olmayanlar (kısaca)
- Seçmeli:
  - Şıklar gizli; 0,45 sn'den önce Enter açmıyor, açılmadan rakam yok sayılıyor.
  - 0 → Bilmiyorum.
  - Yanlışta seçilen kelimenin anlamı gösteriliyor.
- Artikel flaşı: 0,4 sn içindeki basış yok sayılıyor; yanlışta "das değil → die …" + kural.
- artOb: cins doğru + hâl yanlış → fast `hâl` (a3); belirsiz artikel → fast; yanlış cins → falsch. Hepsi tutarlı.
- Kök: yardımcı fiil yanlış / eksik → fast k2; Partizip yanlış / zayıf ek (gefahrt, bleibte) → falsch; "ich habe getroffen" / "sie fährt" kabul.
- Devam kilidi 2,5 sn, düzeltme kutusu (küçük harf / noktasız doğru cümleyi de kabul ediyor), itiraz (soru başına bir), çift Enter (boş cevap göndermiyor), Esc (Bugün'e dönüş), Bugün'de Enter (tur başlatıyor): düzgün.
- Sayfa / konsol hatası: tur, ses yuvası (sahte TTS ile duy-kelime / boşluk / dikte, hoer), Gramer, Cümle atölyesi, Okuma, paket, Artikel 60 sn ve bütün bölüm taramalarında 0.

Betikler ve ekran görüntüleri: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/kullan-3/`
