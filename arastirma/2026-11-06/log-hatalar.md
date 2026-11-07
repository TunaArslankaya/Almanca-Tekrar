# log-hatalar — log.csv doğruluk ve hata türleri analizi (6.11.2026)

Veri: `log/log.csv`, 3 773 satır, 30.09–06.11 (32 çalışma günü). Puanlanan cevap (richtig / fast / falsch): **2 969**.
"Küçük" = `fast`. v5 (öğe hafızası, `basamak:` alanı) 15.10'dan beri. Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/lh/` (a1–a9.py, rejudge.js).

## 1. Biçime göre doğruluk

| biçim | n | doğru % | küçük % | yanlış % |
|---|---|---|---|---|
| seçmeli (tümü) | 1015 | 81 | 12 | 7 |
| seçmeli, yalnız v5 (15.10+) | 702 | **91** | 6 | **3** |
| yazma (wort/abr/prod) | 533 | 58 | 12 | 30 |
| artikel flaşı | 531 | 68 | 5 | 27 |
| gramer | 237 | 59 | 5 | 36 |
| cümlede boşluk | 236 | 69 | 8 | 23 |
| metin boşluğu (paket/DW/ünite) | 175 | 50 | 17 | 34 |
| kök (Partizip/çekim) | 92 | 50 | 22 | 28 |
| tam cümle (çeviri) | 32 | **31** | 16 | 53 |
| dikte | 28 | 14 | 57 | 29 |

v5 alt türleri: `sec` 91 %, `metinde` 95 %, `anla` 92 % · `yaz0` 61 %, `yaz` (ipuçsuz/az ipuçlu) 49 % · `bos0` 66 %, `bos` 63 % · `metin` 35 % · `cumle` **1 kez** (15.10'dan beri).
Son 14 günün cevap payı: seçmeli %35, yazma %20, gramer %19, artikel %14, boşluk %5, metin %3, tam cümle %0.

### Zaman içinde (hafta, doğru % (n))

| hafta | seçmeli | artikel | yazma | boşluk | metin | kök | gramer |
|---|---|---|---|---|---|---|---|
| 28.09 | 61 (172) | 65 (192) | 52 (83) | 67 (27) | 64 (55) | 47 | – |
| 05.10 | 54 (109) | 75 (77) | 66 (100) | 69 (118) | 58 (33) | 56 | – |
| 12.10 | 84 (168) | 55 (55) | 63 (63) | 86 (14) | 40 (43) | 47 | 83 (6) |
| 19.10 | 90 (243) | 63 (70) | 54 (92) | 62 (24) | 80 (10) | 42 | – |
| 26.10 | 91 (211) | 74 (77) | 56 (112) | 73 (22) | 28 (18) | 60 | 51 (134) |
| 02.11 | **97** (112) | 80 (60) | **55** (83) | 61 (31) | 19 (16) | 33 | 68 (96) |

(İlk iki haftadaki düşük seçmeli oranı eski sistemin "yavaş doğru = fast" kuralından; v5'te ölçü değişti.)
**Ana bulgu: seçmeli %61 → %97'ye çıktı, üretim (yazma + boşluk + metin + cümle) 5 haftadır %50–60'ta yerinde sayıyor.**
Günlük üretim doğruluğu 2.10'da %55, 6.11'de %53.

### Seçmeli üretime aktarılmıyor
- v5'te seçmelide **hepsi doğru** olan 183 öğenin yazma/boşluk/metin doğruluğu: **%53** (seçmelide hata yapılan 28 öğede %36).
- Seçmelide cevap süresi ≤ 2 sn olanlar %96 doğru (266 cevap): eleme ile hızlı çözülüyor, Tuna'nın "şıklardan çözülüyor" gözlemi veride görünüyor.
- Aynı soru tekrar gelince: boşlukta ilk kez %66 → 2.–3. kez %81 (cevap ezberi); metin boşluğunda ilk kez %41 → 2.–3. kez %63. En çok tekrar eden: `donnern` seçmelisi 12 kez, `nemli` 10, `arsız` 9. Kök sorusu "Die Abendzeitung hat einen Bericht über den Unfall ___" 3 kez, üçünde de yanlış (gebrachen ×2, gebrachten).

## 2. Kelime türü, seviye (tier), konu

Üretim (yazma + boşluk + cümle + metin) doğru %:

| | tier 1 (A1) | tier 2 (A2) | tier 3 (B1) |
|---|---|---|---|
| isim | 89 (92) | 66 (92) | **51** (304) |
| fiil | 69 (80) | 44 (18) | 56 (251) |
| diğer (sıfat/zarf/bağlaç) | 38 (8) | 70 (20) | **48** (100) |

- Seçmelide türler arası fark yok (isim 81, fiil 80, diğer 82). Fark yalnız üretimde.
- Fiilde edatlı / dönüşlü B1 fiiller en zayıf: en çok yanlış öğeler `sich bemühen um` 8/25, `verzichten auf` 7/22, `sich verlaufen` 7/18, `zweifeln an` 6/21, `widersprechen`, `vorschlagen`, `sich beschweren bei`, `sich beruhigen`, `sich wenden an`, `sich fürchten vor` (5'er). Tier 1'de `essen` 10/22 (eski boş cevaplar), `bringen` 6/16, `werden` 5/13 (Partizip).
- Konu (themen.txt), kelime cevapları: Boş zaman/spor/kültür **%49** (Gymnastik, Kunst, Gedicht), Yeme içme 58, Duygular ve algı 62 (dönüşlü duygu fiilleri), Dil ve iletişim 64, Hava ve iklim 66 (**416 cevap, bütün kelime cevaplarının %14'ü**: hava kelimeleri aşırı temsil), en iyi Ev ve yaşam 91, Kişi ve aile 79.

## 3. Hata etiketleri (richtig olmayan cevaplarda)

| etiket | toplam | fast | falsch | nerede |
|---|---|---|---|---|
| artikel (yön: der → die …) | 217 | 71 | 146 | flaş 144, seçmeli 42, yazma 31 |
| artikel/çekim (ek) | 91 | 19 | 72 | boşluk 27, gramer 27, yazma 12 |
| farklı (başka cevap) | 87 | 5 | 82 | yazma 37, boşluk 21, metin 18 |
| kelime yanlış | 53 | 3 | 50 | yazma 52 |
| yazım | 37 | 35 | 2 | yazma 23 |
| kelime sırası | 31 | 2 | 29 | gramer 31 |
| edat | 20 | 3 | 17 | gramer 12 |
| groß/klein | 18 | 8 | 10 | |
| bağlaç | 17 | 0 | 17 | gramer |
| yardımcı fiil | 16 | 3 | 13 | gramer 9, çekim 4 |
| hâl | 13 | 2 | 11 | gramer |
| dönüşlü zamir | 9 | 3 | 6 | |

Uyarı: gramer satırlarında etiket çoğu zaman teil'in **sabit** etiketi (`js/gramer.js` 666. satır: `g.teile[u.teil].etiket` her yanlışa eklenir). Örnek: `gefalt → gefällt` "kelime sırası", `langer → lang` "bağlaç" etiketi almış. Gramer etiket sayıları konuyu gösterir, gerçek hata türünü değil.

### Bayraklara göre
`tekrar:1` (aynı turda yeniden) %91 · `kurtarma` %91 · `ısınma` %89 · `akşam` %72 · `ikinci` (yeni kelimenin ikinci hatırlaması) %67. Aynı tur içi tekrarlar kısa süreli bellekten; doğruluk ortalamasını şişiriyor.

### Süre
Yazma + boşluk: ≤ 3 sn %77 doğru · 4–6 sn %67 · 7–12 sn %56 · > 12 sn **%39**. Uzun düşünmek nadiren kurtarıyor: kelime ya hemen geliyor ya hiç.

## 4. Artikel

- Flaş: 531 cevap, %68 doğru. Tekrarla **iyileşmiyor**: 1. soruluşta %63, 2.–3. %69, 4.–6. %74, 7.+ %65.
- Yanlış seçimler (doğru → seçilen): die → der **47**, das → der 23, die → das 23, das → die 22, der → das 17, der → die 12. Hataların **%49'unda "der"** seçilmiş: emin olmayınca varsayılan "der". Oysa Tuna'nın kelime havuzunda isimlerin %51'i die.
- Yazmada artikel hatası yönü aynı: die → der 27, das → der 18.
- Sonek kuralı biliniyor mu: kurallı isimlerde %76, kuralsızda %64. Ama kurala göre çok farklı: `-ung` %94, `-heit` %100, `-e` (die) %89; **`-ion` %56** (Diskussion, Situation: kural %100 die), **`-ik` %54** (Gymnastik, Politik), **`-nis` %57** (Missverständnis das, Erlaubnis die: istisna), `-tät` %50. `-en` ile biten der-isimler %36 (Regen), `-el` der %50 (Nebel).
- Takılanlar (yanlış / sorulma): die Geduld 14/17 (der 8, das 4), das Rezept 12/16, die Praxis 8/18 (der 7), die Kunst 8/16 (der 7), das Missverständnis 6/7, die Diskussion 6/9, der Nebel 5/10 (das), der Regen 5/8 (das), die Burg 5/11, die Regel 5/15, das Wetter 5/10 (der), die Feuerwehr 5, die Erlaubnis 4, der Rat 4 (das), die Situation 4, die Gymnastik 4/4. 6+ kez sorulup son üçünün ikisi yanlış: Rezept, Geduld, Situation.

## 5. En çok karışan 20 kelime çifti

Kaynak: seçmeli / yazma / boşluk / metin yanlışlarında verilen cevabın sözlükte eşlendiği öğe (589 yanlış/küçük üretim + seçmeli cevabının 305'i aynı kelimenin yazım/ek/artikel hatası, 183'ü başka kelime, 60'ı boş/Bilmiyorum).

| # | çift | kez | nerede | tür |
|---|---|---|---|---|
| 1 | donnern ↔ hageln | 6 | seçmeli 5, yazma 1 | aynı alan (hava) |
| 2 | feucht ↔ nass | 4 | seçmeli | aynı alan |
| 3 | allerdings ↔ anwesend | 4 | yazma | biçim (all-/an-, -end/-ings), ikisi aynı gün öğrenilmiş |
| 4 | verschreiben ↔ unterschreiben | 2 (+1 schreiben) | metin | biçim |
| 5 | schneien ↔ scheinen | 2 | seçmeli | biçim (harf sırası) |
| 6 | das Gedicht ↔ die Geduld | 2 (+ Gedacht) | boşluk | biçim |
| 7 | das Referat ↔ die Präsentation | 2 | metin | anlam |
| 8 | eingespannt sein ↔ entspannt/entspannend | 2 | yazma | biçim |
| 9 | der Antrag ↔ der Vertrag | 2 | metin, yazma | biçim + alan |
| 10 | sich bemühen um ↔ sich beschweren / sich bewerben um | 3 | yazma | biçim (be-) |
| 11 | die Regel ↔ die Geduld | 2 | yazma | ? (aynı gün öğrenilmiş) |
| 12 | glatt ↔ nass | 2 | seçmeli, yazma | aynı alan |
| 13 | das Amt ↔ die Behörde | 2 | metin, yazma | anlam |
| 14 | eben ↔ drüben | 2 | seçmeli | biçim |
| 15 | der Donner ↔ donnern (der Blitz → "der Donnern") | 3 | yazma | isim/fiil |
| 16 | der Wert ↔ die Würde | 2 | yazma | biçim + anlam |
| 17 | fließend ↔ fleißig | 2 | yazma | biçim |
| 18 | feucht ↔ trocken | 2 | seçmeli, yazma | zıt anlam |
| 19 | das Seminar ↔ das Semester | 2 | boşluk, yazma | biçim |
| 20 | eigen ↔ (sich) eignen | 2 | yazma | biçim |

Tek seferlik ama aynı kalıp: die Änderung ↔ die Veränderung, sich verlaufen ↔ sich verlassen, drinnen ↔ drüben, übrig ↔ übrigens, die Kindheit → "Kinderheit", einziehen ↔ umziehen, die Kritik ↔ der Vorschlag, sich eignen für ↔ sich einigen auf, das Fieber ↔ das Feuer. Gramerde trotz ↔ obwohl 4 kez.
**Kalıp:** 20 çiftin ~12'si ses/yazım benzerliği (be-/ver-/unter- önekli fiiller, harf sırası), ~8'i aynı anlam alanı (hava: donnern/hageln/feucht/nass/glatt/trocken; resmî: Amt/Behörde/Antrag/Vertrag). Uygulamanın çeldiricileri ikisini de neredeyse hiç sunmuyor (bkz. 9).

## 6. 5.11 öncesi haksız "yanlış"lar

5.11 04:59 UTC'deki düzeltmeden önceki, boş olmayan ve Bilmiyorum olmayan **240** yazılı yanlışı (yazma 114, boşluk 54, metin 50, kök 22) yeni `G.yakin` / `G.bosPruef` ile yeniden değerlendirdim: **50'si (%21) bugün küçük hata (fast) olurdu.**

| neden | n | örnek |
|---|---|---|
| doğru kelime, yanlış ek (çekim) | 32 | fett → fette, Regel → Regeln, Situation → Situationen, nass → nasse, kühl → kühler, Schmerz → Schmerzen, der Schmerzen (yazma), heiß → heißer, Kält → Kälte, verlauft → verlaufen |
| yer değiştiren / atlanan harf (yazım) | 15 | Situaiton, Schrim, Fariness, beglieten, bringne, Komilitone, Apoteke, Üniverstät, beruigt |
| boşluğa artikelle yazılmış doğru isim | 3 | die Kunst, die Hilfsbereitschaft, die Tablette |

Bunlar düzeltilince yazma + boşluk + metin yanlış oranı yaklaşık **%28 → %23**. Ayrıca 100 itirazın çoğu (aşağıda) aynı haksızlıkları elle düzeltmişti.
Yeni kodda şüpheli kabuller (yanlış pozitif): `eignen` → `eigen` "çekim" (farklı fiil; `yakin`'de gövde dalı sözlüğe bakmıyor; denendi: `G.yakin('eignen','eigen', new Set(['eignen']))` → `cekim`), `mache` → `manche` "yazım" (machen'in biçimi), `übrings` → `übrig` (aslında übrigens ile karışma), `Blitzt` → `Blitz`.

## 7. "Bilmiyorum" ve itirazlar

- Bilmiyorum: 72 cevap (yazma 43, tam cümle 9, metin 5, kök 4, gramer 4). Çoğu ilk haftada (2.–3.10'da 26). Son 2 haftada 0–3/gün. 1–2 harflik "cevap" 55 (46 boş); 7'si Bilmiyorum'suz ("a", "d", "be", "1"): baştan savma değil, bilmemenin işareti.
- İtiraz (`öneri:`): 100 satır, **92'si 15.10'dan önce**; v5'ten sonra 8. İlk karar falsch 75 / fast 25 → son karar richtig 50, fast 46, falsch 4.
  - Haklı (~16): "hâl yazılmadı" (abr'de parantezdeki hâl istenmişti, 11), büyük/küçük harf, Nachname = Familienname.
  - Yazım hatasını **richtig** yapmış (~10; fast olmalıydı): Qlique, Situtation, Traning, Heimet, unterscrift, freuch, Aphoteke, hlifst, schalfen, Montan.
  - Fazla cömert (~14): artikel hatası richtig (der Unterschrift, **der Geduld**: en çok takılan artikel), kök sorusunda biçim hatası richtig (fahrt/gefahren, trefft, bliebt/gelblieben, brach, wurd, hat gestimmte zu: 7 kez; sorunun ölçtüğü şey tam bu), başka kelime richtig (der Name → Vorname, Foranderung → Forderung, "Ich schicke" → schenken, "die Pizza Service an", "Darf ich ihnen").

## 8. Gramer

237 cevap, %59 doğru. Tanı testi %40 (28/70; 48 konunun 5'i "biliyor"), tur içi soru %69, set/derin %65.
Türe göre: **çeviri %30** (27), umform %56, luecke %60, wahl %68, fehler %72, ordnen %74, dikte (dinle) %43. Zorluk: z1 %69, z2 %65, **z3 %23**.

Zayıf teil'ler (n ≥ 3, doğru < %60): es-korrelat/es-gibt 25 %, reflexiv/praep 25 %, es-korrelat/wegfall 29 %, vergleich/nicht-so 33 %, nominal-verbal/trotz 43 %, satzklammer-tekamolo/objekte 43 %, adjektiv/plural, reflexiv/perfekt, tuerkisch-fallen/richtung, vergleich/als-wie, vergleich/satz (50 %), verbstellung/kontrast 57 %.

Cevaplardaki tekrar eden gerçek hatalar:
- **V2 / devrik sıra** (en sık): "Leider heute habe ich", "Heute ich habe frei", "deshalb ich gehe ins Bett", "Vorher ich ins Bett gehen", "seit Mai ; wohne", "Wann der Kurs … anfangen".
- **Satzklammer / orta alan**: "Kannst du mich abholen morgen…", "Ich fahre nach Hamburg morgen mit dem Zug", "Ich zeige morgen die Stadt dir", "zu meinem Bruder … geschrieben".
- **es**: "freut es mich" (es düşmeli), "es geht besser wieder meiner Oma".
- **trotz / obwohl** (ad – yan cümle) 4 kez; **nicht so … wie** yerine "nicht gut als".
- Dönüşlü fiil edatı: kümmern um → an/zu, Perfekt'te haben ("hata yok" deyip `ist` kaçırmak); mir/mich.
- Hâl / yön: "im Bibliothek" → in die, am → ans, euer → euch.
- `fehler` türünde 8 kez "hata yok" denmiş ama hata varmış: hatayı aramadan geçiyor.

Kök (Partizip): aynı hatalar tekrarlanıyor: gebliebt ×3, gebrachen ×2 / bracht / gebrachten, zustimmt / vorstellt (ayrılabilir fiilde -ge- yok), ausgefühlt, worden → geworden; çekim listesinde yardımcı fiil unutuluyor (isst, gegessen → hat gegessen).
Dikte (28): %14 tam doğru, %57 küçük hata: ekler ve hâl (hoche → hohe, dem Keller → den, bezahlt hat → hast, von allem → vor allem, In nächstem Semestar).

## 9. Öneriler: uygulama

| # | ne | neden (veri) | dosya / fonksiyon | boyut | öncelik |
|---|---|---|---|---|---|
| 1 | Seçmeli çeldiricileri **gerçek karışmalardan** üret: (a) log'da karışan çiftler, (b) biçimce yakın lemmalar (aynı önek/kök, Damerau ≤ 2: Gedicht/Geduld, eigen/eignen, schneien/scheinen), (c) aynı anlam alanı. 561. satırdaki "ortak Türkçe kelime varsa atla" filtresi yakın anlamlıları da eliyor: yalnız gerçek eşanlamlıyı atla. | Seçmeli v5 %91, ≤ 2 sn %96; seçmelide kusursuz öğelerde üretim %53; gerçek karışmaların ~%60'ı biçim benzerliği | `js/app.js` `optionen` (541), `optionenDE` (581); karışma listesi için yeni `quellen/karisanlar.txt` → build | orta | yüksek |
| 2 | Seçmeli doğrunun hafızaya etkisini azalt, öğeyi daha erken yazmaya taşı (ör. 2 seçmeli doğru → B2; seçmeli doğru S'yi az büyütsün) | Seçmeli payı %35, aktarım yok; üretim 5 haftadır düz | `js/kern.js` `Kern.basamak`, `Kern.notVer` (seçmeli ofseti) | küçük | yüksek |
| 3 | Tam cümle (B4) ve çeviri daha erken ve daha sık: bm ≥ 2 olan öğelerde turda 1–2 tam cümle; gramer çevirisi tur içi sorulara | v5'te 1 tam cümle; gramer çevirisi %30; Tuna'nın zayıfı konuşma (cümle kurma) | `js/kern.js` `basamak` eşiği (S ≥ 21), `Kern.sec`; `js/gramer.js` `turSorusu` tür seçimi | orta | yüksek |
| 4 | Artikel: (a) flaş yerine yanlışta **kural grubu** gösterimi ve kısa grup alıştırması (-ion/-ik/-tät/-ung/-heit/-keit/-schaft → die; -nis istisnaları), (b) 4+ yanlışlı isimlerde flaş yerine bağlamda üretim ("Ich habe keine ___ Geduld" değil, "___ Geduld ist wichtig" yaz), (c) "der" varsayılan eğilimini tur sonunda göster | 7.+ soruluşta %65; hataların %49'u der; -ion %56, -ik %54 | `js/app.js` artikel flaşı / sonek kuralı notu, `js/kern.js` artikel dalı (`art` hafızası), `daten/kancalar.js` (Geduld, Rezept, Praxis, Kunst, Regen, Nebel, Wetter) | orta | yüksek |
| 5 | `G.yakin` gövde dalında yazılan biçim sözlükte **başka lemmanın** biçimiyse `cekim` deme (eignen ≠ eigen); bunun için LEX'i biçim → lemma haritası yap | Yeniden değerlendirmede yanlış pozitifler | `js/grammatik.js` `yakin` (~699–715), `js/app.js` 356 (`lexSetzen`), `tests/test_grammatik.js`'e eignen/eigen, mache/manche vakası | küçük | yüksek |
| 6 | Aynı cümle tekrarını sınırla: aynı (öğe, cümle) en erken 7 gün sonra; başka cümle varsa onu seç | Boşlukta 2.–3. görüşte %81 (ezber), "Abendzeitung" 3 kez | `js/kern.js` cümle seçimi (`Kern.sec` boşluk / metin dalı) | küçük | orta |
| 7 | "Karışanlar" tekrarı: log'daki çiftler için iki kelimeyi yan yana veren kısa ayırma görevi (iki cümle, hangisi nereye) | 20 çift, çoğu tekrar ediyor | `js/app.js` yeni soru türü ya da Cümle atölyesi `diz`; veri `quellen/karisanlar.txt` | orta | orta |
| 8 | Gramer log etiketi: teil'in sabit etiketi `teil:` olarak, `cumleKontrol`'ün bulduğu gerçek etiket ayrı yazılsın | gefalt → "kelime sırası", langer → "bağlaç" | `js/gramer.js` 614 ve 666 | küçük | orta |
| 9 | İtiraz: sorunun ölçtüğü özellikte (kök sorusunda biçim, yazmada artikel) "aslında doğru" en çok `fast` yapsın; yazım itirazı hep `fast` | 37 itirazdan ~24'ü fazla cömert ya da fast olmalıydı (Geduld artikeli dahil) | `js/app.js` itiraz işleyicisi | küçük | düşük (15.10'dan beri 8 itiraz) |
| 10 | Kök sorusunda yanlışta Partizip kuralını göster (ge-…-t / ge-…-en, ayrılabilir: zu**ge**stimmt, yardımcı fiil zorunlu) ve aynı cümleyi değil yeni cümle sor | gebliebt ×3, gebrachen ×2 aynı cümlede | `js/app.js` kök sonucu, `js/kern.js` kök seçimi | küçük | orta |
| 11 | ~10 sn'de cevap yoksa "Bilmiyorum"u öne çıkar (yanıp sönme değil, vurgula) | > 12 sn cevaplar %39 doğru | `js/app.js` soru ekranı zamanlayıcısı | küçük | düşük |
| 12 | Hava konusunun payını düşür (yeni kelime sırası alan dengesi) | Kelime cevaplarının %14'ü hava; Ünite 2 ve ilk paket mirası | `js/kern.js` yeni sıra / `alan` limiti | küçük | düşük |

## 10. Öneriler: Tuna (uygulama dışı)

1. **Artikelde emin değilsen "die" de**, "der" değil: senin listende isimlerin yarısı die; yanlışlarının yarısında der seçmişsin.
2. Sonek kurallarını bir kez ezberle: -ung, -heit, -keit, -schaft, -ion, -ik, -tät → **die** (Diskussion, Situation, Politik, Gymnastik'te hâlâ hata yapıyorsun). -nis çoğu zaman das (Ergebnis, Zeugnis, Missverständnis) ama die Erlaubnis, die Kenntnis.
3. Takılan artikelleri cümleyle sesli söyle: "Ich habe keine Geduld… die Geduld", "das Rezept vom Arzt", "die Kunst", "die Praxis", "der Regen", "der Nebel", "das Wetter".
4. Karışan çiftleri yan yana öğren, birer cümle kur ve sesli söyle: Gedicht/Geduld, schneien/scheinen, verschreiben/unterschreiben, Antrag/Vertrag, fließend/fleißig, eigen/sich eignen, Seminar/Semester, donnern/hageln, feucht/nass.
5. Konuşurken en sık sıra hatan: zarf ya da "deshalb" ile başlayınca **fiil hemen ikinci**: "Heute **habe** ich…", "Deshalb **gehe** ich…", "Leider **habe** ich heute…". Modal/Perfekt'te ikinci fiil en sona: "Kannst du mich morgen vom Bahnhof **abholen**?". Kursta ve günlük konuşmada bunu bilinçli kontrol et.
6. Seçmeliyi hızlı geçmek seni ilerletmiyor (orada %97'desin, yazarken %55). Yazma sorusunda 5–6 sn'de aklına gelmiyorsa Bilmiyorum de, doğrusunu sesli oku.
7. "Hata yok" demeden önce cümlede fiilin yerini ve yardımcı fiili (haben/sein) kontrol et.
