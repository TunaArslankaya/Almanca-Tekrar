# log-zaman: Zaman ve alışkanlık analizi (log.csv + zustand.json, 30.09 → 06.11.2026)

Veri: `log/log.csv` 3.773 satır, bunların 3.044'ü notlu cevap (richtig / fast / falsch). `log/zustand.json`: 276 öğe, `tage` / `tageC` gün sayaçları, `seri`.
Analiz betikleri: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/logzaman/load.py` (+ satır içi Python).

**Yöntem notları (sonuçları okurken önemli)**
- Öğrenme günü 04:00'te başlar (uygulamadaki gibi).
- Log satırının zamanı cevap anı değil, **sonuç panelinden çıkış** (Devam / Enter / doğruda 1 sn sonra kendiliğinden geçiş) anıdır (`ilerle()` → `cevapIsle()` → `logEintrag`, js/app.js 2972–3110). `sek:` = soru ekranı açılışından cevaba kadar geçen süre (tam saniyeye yuvarlanmış). Bu yüzden **panelde geçen süre ≈ (iki satır arası boşluk) − (sonraki satırın sek'i)**; ±1 sn yuvarlama hatası var.
- Oturum = aralarında ≥ 10 dk boşluk olmayan satırlar (5 dk eşikte 72, 10 dk'da 60, 30 dk'da 51 oturum; sonuçlar eşikten pek etkilenmiyor).
- 15.10 öğleden sonra uygulama v5'e geçti (tur yapısı, merdiven). Öncesi (v3) ile sonrası arasındaki farkların bir kısmı uygulama değişikliğidir, alışkanlık değil. Saat / yorgunluk analizlerini yalnız v5 dönemiyle (15.10 15:00 → 06.11, 1.778 cevap) yaptım.
- Brifteki "günde ~50–180 cevap, çoğu 05:30–09:00 ya da akşam" kısmen doğru: son 3 gün öyle, ama 5 haftanın tamamında en yoğun saat 11–13 (aşağıda).

---

## 1. Günler: hangi günler girdi, ne kadar

38 takvim gününün **33'ünde** çalışmış. Boş günler: 01.10 (Per), **05.10 (Pzt), 12.10 (Pzt)**, 23.10 (Cum), **02.11 (Pzt)**. Çok zayıf günler: 11.10 (9 cevap), 13.10 (1), 14.10 (15), 29.10 (14), 20.10 (24).
Çalışılan günler arası boşluk: 27 kez 1 gün, 5 kez 2 gün (hiç 2 günden uzun kopma yok). Seri rekoru 22 (`S.seri.rekor`), 23.10 ve 02.11 dondurucuyla kurtarılmış (`seri.donmus`).

| Hafta günü | gün | boş gün | ort. cevap/gün |
|---|---|---|---|
| Pazartesi | 5 | **3** | **35** |
| Salı | 5 | 0 | 73 |
| Çarşamba | 6 | 0 | 76 |
| Perşembe | 6 | 1 | 78 |
| Cuma | 6 | 1 | 105 |
| Cumartesi | 5 | 0 | 95 |
| Pazar | 5 | 0 | 95 |

**Bulgu:** 5 pazartesinin 3'ü tamamen boş; kopmaların 3/5'i pazartesi. Hafta sonu en verimli.

Günlük cevap (v5, 16.10–06.11, 20 aktif gün): 14 · 24 · 49 · 50 · 52 · 53 · 56 · 64 · 73 · 80 · 83 · 84 · 92 · 98 · 101 · 110 · 117 · 136 · 163 · 168 → medyan **≈ 82**, ortalama 83. Günlük hedef 4 tur × 12 = 48 cevap (`ayar4.turHedef` 4); 20 günün 18'inde hedef aşıldı, 5 günde tam hedefte bırakılmış (49–56).

## 2. Saatler

Bütün cevapların saat dağılımı (n = 3.044):

| saat | % | | saat | % |
|---|---|---|---|---|
| 05 | 3,9 | | 14 | 2,9 |
| 06 | 4,5 | | 15 | 2,0 |
| 07 | 5,4 | | 16 | 6,5 |
| 08 | 6,6 | | 17 | 2,5 |
| 09 | 7,0 | | 18 | 3,9 |
| 10 | 4,3 | | 19 | 2,3 |
| **11** | **15,1** | | 20 | 1,8 |
| **12** | **14,3** | | **21** | **7,3** |
| 13 | 0,8 | | **22** | **6,3** |
|  |  | | 23 | 2,4 |

Üç tepe: sabah 05–09 (%27), öğle 11–12 (%29; çoğu ilk iki hafta, hafta sonu), gece 21–22 (%14). **Son 3 günde sabah 05:30–06:45'e kaydı** (04.11 06:42, 05.11 05:30, 06.11 05:48). Günün tek sabit "yeri" yok: ilk oturum 05:30 ile 22:46 arasında dağılıyor.
33 aktif günün 11'inde iki ayrı blok (ilk ve son oturum ≥ 4 saat arayla), 22'sinde tek blok.

## 3. Oturumlar ve süre

- 60 oturum (10 dk eşik). Oturum süresi medyan **5,8 dk**, ortalama 10,8; oturum başına cevap medyan 47.
- Tur satırları (`tur`, 132 adet, 15.10'dan beri): 12 cevaplık turun `dk` alanı: 87 turda **1 dk**, 36'da 2, 6'da 3, yalnız 3 turda ≥ 5. Yani bir tur ≈ 60–90 sn, cevap başına ≈ 5–7 sn (panel dahil). Oturum başına tur: çoğunlukla 2–6.
- **Günlük aktif süre** (oturum sürelerinin toplamı): v3 (02–15.10) medyan **27,8 dk**/gün → v5 (16.10–06.11) medyan **8,3 dk**/gün (ortalama 11,8). En kısa günler: 20.10 1,6 dk, 29.10 1,8 dk; en uzunlar gramer olan günler (28.10 35 dk, 31.10 31 dk).

Haftalık özet:

| hafta (Pzt) | aktif gün | oturum | toplam dk | cevap | cevap/dk | doğru % | seçmeli payı | yazma payı (doğru %) | gramer | yeni (tanıtım) | seviye+ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 28.09 | 4 | 7 | 179 | 591 | 3,3 | 60 | %29 | %20 (50) | 0 | 50 | – |
| 05.10 | 6 | 16 | 170 | 582 | 3,4 | 63 | %19 | %38 (66) | 0 | 4 | – |
| 12.10 | 6 | 12 | 72 | 388 | 5,4 | 67 | %43 | %19 (66) | 6 | 25 | 58 |
| 19.10 | 6 | 8 | **45** | 463 | **10,3** | 75 | **%52** | %25 (56) | 1 | 15 | 57 |
| 26.10 | 7 | 10 | 110 | 603 | 5,5 | 69 | %35 | %22 (59) | 134 | 38 | 43 |
| 02.11* | 4 | 6 | 59 | 417 | 7,1 | 71 | %27 | %27 (58) | 96 | 20 | 34 |

\* 02.11 haftası yarım (Pzt boş, Cuma sabaha kadar). "seviye+" = tur satırlarındaki `seviye+` toplamı (v5 öncesi yok).

**Bulgu:** Cevap sayısı haftada ~400–600'de sabit kalırken **çalışma süresi 170–180 dk'dan 45–110 dk'ya düştü**; aynı sayıda cevap çok daha kısa sürede veriliyor, çünkü cevapların büyük kısmı seçmeli ve hızlı (bkz. 4). Gramer eklenen hafta (26.10) süre yeniden 110 dk'ya çıktı: süreyi artıran şey zor içerik.

## 4. Cevap süreleri (sek:)

2.720 cevapta `sek` var. Biçime göre (tüm dönem):

| biçim | n | sek medyan | p25–p75 | ≤ 2 sn | doğru % |
|---|---|---|---|---|---|
| sec (seçmeli anlam) | 539 | 3 | 2–3 | %39 | 91 |
| metinde (seçmeli, metinde) | 115 | 3 | 2–4 | %37 | 95 |
| anla (seçmeli) | 48 | 3 | 2–4 | %29 | 92 |
| artikel (der/die/das flaşı) | 258 | 2 | 1–2 | %80 | 69 |
| yaz0 (yazma, ipuçlu) | 205 | 4 | 3–7 | %13 | 61 |
| yaz (yazma) | 123 | 5 | 4–7 | %4 | 49 |
| bos0 / bos (cümlede boşluk) | 78 | 5–8 | 3–12 | %8 | 65 |
| kokSatz / kok (çekim) | 48 | 6 / 15,5 | 4–17 | 0 | 62 / 14 |
| gram (gramer) | 231 | 12 | 7–19 | 0 | 60 |
| cumle (tam cümle) | **1** | 26 | – | – | – |

- **Seçmeli: medyan 3 sn, son hafta %97 doğru** (haftalık: %61 → 54 → 84 → 90 → 91 → **97**; sek medyanı 4 → 3). Dört şıkkı okuyup karar vermek 3 sn'de mümkün oluyorsa, şıklar kelimeyi hatırlamayı değil tanımayı / elemeyi ölçüyor. Tuna'nın "şıklardan çözülebiliyor" şikâyeti veriyle tutarlı.
- Hızlı seçmeli cevap tahmin değil: ≤ 2 sn seçmeli %96 doğru, > 2 sn %87. Yani "baştan savma tahmin" yok; sorun soruların kolaylığı.
- **Yazmada süre uzadıkça doğruluk düşüyor** (bilmeyen uzun düşünüyor; normal):

| yazma sek | n | doğru % | yanlış % |
|---|---|---|---|
| 0–3 | 49 | 76 | 24 |
| 3–5 | 255 | 71 | 22 |
| 5–8 | 255 | 60 | 27 |
| 8–15 | 153 | 46 | 37 |
| ≥ 15 | 59 | **29** | **54** |

- "Bilmiyorum" 68 kez; basma süresi medyan 7 sn (çoğu 2–15 sn): makul, takılınca vazgeçiyor. En çok `abr` (fiil + edat, 17), `yaz0` (12).
- Baştan savma işaretleri az: `dikkat` satırı 9 (hepsi `cok-yanlis`, `hızlı/boş:0`), artikel "çok hızlı" (< 450 ms) etiketi yok. Hız sorunu cevapta değil, **cevaptan sonra** (bkz. 5).

## 5. Düzeltmeyi okuma süresi (en önemli alışkanlık bulgusu)

Sonuç panelinde geçen süre (v5, satır arası boşluk − sonraki sek):

| kendi sonucu | n | medyan | p75 | p90 | ≤ 2 sn |
|---|---|---|---|---|---|
| richtig (otomatik geçiş ~1 sn) | 1.186 | 1 sn | 1 | 2 | %93 |
| **falsch** | 314 | **2 sn** | 4 | 8 | **%62** |
| fast | 111 | 2 sn | 3 | 6 | %73 |

Yanlış / fast cevapta biçime göre panel süresi medyanı: **yaz0 1 sn** (%69'u ≤ 2 sn), yaz 2 sn, artikel 1 sn, sec 1 sn, cümlede boşluk 1 sn; yalnız gramerde 5 sn (%18'i ≤ 2 sn).
Tanıtım kartı (yeni kelime, `yeni;neu`, `bicim:tanit`, 97 kart): ekranda kalma medyanı **2 sn**, %73'ü ≤ 3 sn.

**Bulgu:** Yanlış yazdığı kelimenin doğrusuna çoğunlukla 1–2 sn bakıp Enter'a basıyor (masaüstünde Enter = Kontrol, bir Enter daha = Devam; js/app.js 4830: `q.done` iken Enter hemen `ilerle()`, bekleme yok). Yeni kelime kartına da 2 sn. Hatayı düzelten an (geri bildirim) neredeyse atlanıyor. Bu, "kelimeyi değil cevabı ezberliyorum" ve yazmada 6 haftadır düzelmeyen doğrulukla (haftalık yazma doğruluğu 50 → 66 → 66 → 56 → 59 → 58) uyumlu.

Destekleyen ek veri:
- Yanlıştan sonra aynı turdaki tekrar (`tekrar:1`, 128 soru) **%90'ı seçmeli** (98 sec + 17 metinde; 9 yaz0) → %91 doğru. Yanlış yazılan kelime, birkaç soru sonra şıklardan tanınarak "kapatılıyor".
- Kurtarma (`kurtarma`, 78) **%100 seçmeli** (57 sec, 13 anla, 8 metinde), %91 doğru. Isınma (227 soru) %93'ü seçmeli, %89 doğru.
- Yeni kelimenin ikinci hatırlaması (`ikinci`, yaz0): tanıtımdan medyan 29 sn sonra, %67 doğru. Sonraki günlerdeki ilk sınanmasında 90 kelimenin 67'si doğru (%74).
- Aynı boşluklu cümle tekrar gelince doğruluk artıyor: 1. görüş %66 (n 338) → 2. %78 (63) → 3. %90 (21). En çok tekrar: "Kennst du ein schönes _____?" 8 kez. Cümleye bağlı ezber izi (n küçük, kesin değil).

## 6. Saat, oturum uzunluğu ve doğruluk (yorgunluk / acele)

v5, doğru % (n):

| saat bandı | hepsi | seçmeli | artikel | yazma | gramer |
|---|---|---|---|---|---|
| 05–08 | 71 (263) | 97 (92) | 78 (41) | 53 (81) | 62 (34) |
| 08–12 | 70 (669) | 91 (263) | 63 (93) | 61 (178) | 52 (88) |
| 12–17 | 67 (386) | 92 (145) | 68 (63) | 58 (86) | 49 (49) |
| 17–21 | 75 (239) | 93 (75) | 77 (30) | 55 (58) | 74 (65) |
| 21–24 | 74 (221) | 87 (127) | 65 (31) | 53 (57) | – |

| oturum içindeki sıra | hepsi | seçmeli | artikel | yazma | gramer |
|---|---|---|---|---|---|
| 1–12 | 79 (368) | 93 | 82 | 60 | 79 |
| 13–36 | 72 (577) | 91 | 66 | 58 | 71 |
| 37–72 | 68 (550) | 89 | 64 | 56 | 59 |
| 73+ | 63 (283) | 96 | 74 | 56 | 50 |

**Bulgu:** Saatin belirgin etkisi yok (yazma 53–61 arasında, fark n'e göre gürültü düzeyinde; sabah 05–08 yazma 53 ile en düşüklerden ama 81 cevap). Oturum ilerledikçe toplam doğruluk 79 → 63 düşüyor, ama bu çoğunlukla **karışım etkisi**: oturum başında kolay ısınma / seçmeli, sonlarda gramer (gramer 73+ sırada 113 cevap). Aynı biçim içinde yazma 60 → 56, yani yorgunluk etkisi zayıf (−4 puan). Günün ilk oturumu ile sonrakiler arasında da fark yok (71 / 70). Hafta günleri arasında anlamlı desen yok (Çarşamba–Perşembe 65–67, Pazartesi–Salı 77–79; gramer yoğunluğu farkı).
Sonuç: **Uzun oturum doğruluğu bozmuyor**; günlük süreyi artırmanın önünde veri açısından engel yok.

## 7. Bölüm kullanımı

| bölüm (log modus) | satır | gün | son kullanım |
|---|---|---|---|
| Çalış / ana tur (erk, art, bed, wort, abr, nsatz, satz, prod, stamm, luecke, akt) | ~2.600 | 30+ | 06.11 |
| Gramer (`gram`) | 254 | 11 | 06.11 (tanı testi 70, set 119, turda 65) |
| Akşam tekrarı (`tur;aksam`) | 8 tur | 6 | 04.11 |
| Paket (`paket`) | 121 | 7 | **15.10** |
| Ünite (`unite`) | 36 | 2 | **08.10** |
| Fiil metni (`fiilmetin`) | 20 | 3 | **10.10** |
| Okuma (`lesen`) | 10 (Klexikon 1, DW 1) | 3 | 31.10 |
| Okurken bakılan kelime (`lesen-wort`) | 29 | 6 | 31.10 |
| Serbest yazma (`text`) | 3 | 3 | **18.10** |
| **Konuşma (`sprechen`)** | **0** | 0 | hiç |
| **Prüfung (`pruefung`)** | **0** | 0 | hiç (`S.pruefung` yok) |
| **Cümle atölyesi (`cumle`)** | **0** | 0 | hiç (`S.cumle` yok) |
| Tam cümle sorusu (`bicim:cumle`, B4) | 1 | 1 | – |

`tage.modi`'den: 16.10'dan beri günlük sayaçlarda yalnız `akis`, `gram`, `aksam` (bir kez `lesen`, bir kez `yazma`) var. **Son 3 haftada uygulamanın ~%100'ü Çalış + Gramer.** Zayıf olduğu beceri (Sprechen) için yapılmış bölüm hiç açılmamış; dinleme içeren DW okuma (mp3) bir kez.

## 8. Haftalık ilerleme: yeni kelime ve seviye

- Öğelerin başlangıç tarihi (`items[].seit`) haftalık: 147 (ilk hafta, toplu aktarım) · 45 · 26 · **9** · 31 · 18. v5'te (15.10 → 06.11, 22 gün) 87 öğe → **≈ 4,0/gün**; 19–26.10 arası günde **1** (kota freni). Son 3 gün 5–6/gün.
- Toplam 276 öğe. Basamak tavanı `bm`: 0 → 1, **1 → 125**, 2 → 116, **3 → 34** (yani yalnız 34 öğe cümlede boşlukta ipucusuz doğru; tam cümlede hiçbiri). Son basamak `b`: 1 → 119, 2 → 110, 3 → 41.
- Kararlılık `S`: < 2 gün 61, 2–7 77, 7–21 48, 21–60 77, ≥ 60 13. Artikel kartı olan 143 ismin 21'inde artikel lapses ≥ 4.
- `seviye+` (tur sonu): tam haftalarda 58 / 57 / 43; yeni öğe girişi ile birlikte yavaşlıyor.
- 06.11 10:00 itibarıyla 84 öğe vadesi gelmiş, 142'si gelecek 7 günde.

**Bulgu:** 37 günde 276 öğe ve yalnız 34'ü üretim seviyesinde (cümle). Mevcut hızla (≈ 4 yeni/gün, günde ≈ 8 dk) Goethe B1 listesinin (~2.600) kayda değer kısmına aylar içinde ulaşılamaz; darboğaz günlük süre ve "yeni"nin kota freniyle tutulması.

---

## 9. Öneriler — Tuna (uygulama dışı alışkanlıklar)

1. **Yanlışta 5 saniye kuralı.** Veride yanlış cevaptan sonra panelde medyan 2 sn (yazmada 1 sn). Yanlışta Enter'a basmadan önce doğrusunu artikeliyle **sesli** söyle, bir kez kafanda cümleye koy. Yeni kelime kartında da aynı (şu an 2 sn): kelimeyi artikel + çoğulla iki kez sesli söyle. Bu, "cevabı değil kelimeyi öğrenme"nin en ucuz adımı.
2. **Günde 8 dk → 20–25 dk.** v5'te günlük aktif süre medyanı 8,3 dk; cevap sayısı yüksek görünüyor (≈ 82) çünkü çoğu 3 sn'lik seçmeli. Oturum uzadıkça doğruluk aynı biçimde pek düşmüyor (yazma 60 → 56), yani daha uzun çalışmak sorun değil. Öneri: sabah 05:30–07 bloğu (son 3 gün zaten öyle) 15 dk + akşam 10 dk konuşma (aşağıda).
3. **Pazartesi planı.** Kopmaların 3/5'i pazartesi, pazartesi ortalaması 35 cevap (diğer günler 73–105). Pazartesi için bilinçli olarak "1 tur yeter" kuralı koy (seri ve tekrar zinciri kopmasın); 2 dakikalık 12 soruluk tur bile vadesi gelenleri işler.
4. **Konuşmayı günlük rutine kat.** Log'da 0 `sprechen` satırı; kursun teşhisi Sprechen. Akşam bloğunu konuşmaya ayır: o gün yanlış yaptığın 5 kelimeyle sesli cümle kur, telefonla kaydet, dinle (uygulamanın Konuşma → Teil 2 de olur). DW Top-Thema mp3'lerini (uygulamada var, bir kez açılmış) dinleyip shadowing yap.
5. **Yazmada 15 sn'yi geçme.** ≥ 15 sn düşünülen yazma cevaplarının %54'ü yanlış. 10–12 sn'de gelmiyorsa "Bilmiyorum"a bas ve doğrusunu 5 sn oku: aynı öğrenme, daha az süre.
6. **Seçmeliden tatmin olma.** Son hafta %97: bu senin seviyeni değil, sorunun kolaylığını gösteriyor. Asıl ölçü yazma doğruluğu (6 haftadır %56–59).

## 10. Öneriler — Uygulama (somut değişiklik)

| # | Ne | Neden (veri) | Nerede | Büyüklük | Öncelik |
|---|---|---|---|---|---|
| U1 | **Yanlış / fast panelinde asgari bekleme + doğrusunu yazdırma**: yazma / boşluk biçimlerinde yanlışta Devam 2,5 sn kilitli (sayaç dolumu `devamBtn` `otomatik` stilini kullanabilir); ayrıca yazma biçimlerinde Devam yerine "doğrusunu bir kez yaz" kutusu (kopyalama, notu değiştirmez, log'a `kopya:ok` / süre). | Yanlışta panel medyanı 2 sn, %62 ≤ 2 sn; yaz0'da 1 sn. Enter-Enter ile düzeltme atlanıyor. | js/app.js: keydown 4830 (`q.done` → `ilerle()`), `sonucPanel`, `devamBtn` (2384); `q.freiAb` deseni `artWahl`'da zaten var. | küçük (kilit) / orta (kopya) | yüksek |
| U2 | **Tanıtım kartında asgari süre + ses**: kart ≥ 4 sn ve kelime sesi çalınmadan Enter geçmesin; kartta artikelli biçimi bir kez yazdır. | 97 kartta medyan 2 sn, %73 ≤ 3 sn; sonraki ilk sınamada %26 hata. | js/app.js `frageTanit` (766), `tanitDevam`, keydown 4824. | küçük | yüksek |
| U3 | **Yanlıştan sonraki tekrar ve kurtarma seçmeli olmasın**: `tekrar:1` ve `kurtarma` yaz0 / bos0 ile sorulsun (en azından yanlış biçim yazmaysa). | `tekrar:1` %90 seçmeli → %91 doğru; kurtarma %100 seçmeli; ısınma %93 seçmeli. Yanlış yazılan kelime 3–5 soru sonra tanıma ile "kapanıyor". | js/kern.js `Kern.sec` kuyruk dalı (yanlış → "bir alt basamaktan"), kurtarma / ısınma dalı (584 civarı). | orta | yüksek |
| U4 | **Günlük hedefi cevap sayısından "emek"e çevir**: hedef = yazma / cümle cevabı sayısı (ör. 30 üretim) ya da dakika; seçmeli ve artikel flaşı hedefe yarım sayılsın. Bugün ekranında "bugün X dk" göster. | Haftalık cevap sabit (~400–600) iken süre 170 → 45–110 dk'ya indi; v5 günlük medyan 8,3 dk; hedef 48 cevap ≈ 5 dk. | js/app.js `gunHedef`, `renderAna`, `xpEkle` (puan zaten emeğe göre). | orta | yüksek |
| U5 | **Konuşmayı ana akışa sok**: tur sonu ekranında (ya da Bugün'de hedef bitmeden) 60–90 sn'lik "sesli söyle" adımı: turda yanlış yapılan 2–3 kelimeyle shadowing / kayıt (mevcut Konuşma bölümünün kayıt altyapısı). İkinci iş kartını beklemesin. | `sprechen` 0 satır; Prüfung 0, Cümle atölyesi 0; son 3 hafta yalnız akis + gram. Kurs teşhisi Sprechen. | js/app.js `turSonuRender`, `renderAna`, `ikinciIs`; Konuşma kayıt kodu (~4381 `spKayit`). | orta | yüksek |
| U6 | **Pazartesi / kopma koruması**: bir önceki pazartesi boşsa pazar akşamı Bugün'de "yarın 1 tur yeter" notu; pazartesi hedefi otomatik 1 tur (seri sayılsın). | Boş günlerin 3/5'i pazartesi; pazartesi ort. 35 cevap. | js/app.js `seriBakim`, `gunHedef`, `renderAna`. | küçük | orta |
| U7 | **Yazmada 12 sn sonra "Bilmiyorum"u öne çıkar** (yanıp sönme / ipucu teklifi), ipucu sayılır. | ≥ 15 sn yazma cevaplarının %54'ü yanlış, %29'u doğru. | js/app.js yazma sorusu render (2643 civarı). | küçük | düşük |
| U8 | **Aynı boşluklu cümleyi art arda verme**: öğe başına son N cümleyi `S.kontext`'te tut, yenisi yoksa biçimi değiştir (yaz0). | Aynı cümlede 1. %66 → 3. %90; bir cümle 8 kez. | js/kern.js / app.js cümle seçimi (`S.kontext` zaten var). | küçük | orta |
| U9 | **Yeni kota freni gevşesin** (birikme yoksa en az 4–5/gün). | 19–26.10 günde 1 yeni öğe; v5 ortalaması 4,0/gün; 37 günde 276 öğe, bm 3'te 34. | js/kern.js `Kern.kota`, `kapasite()`. | küçük | orta |

**Yapılmaması gerekenler (veriye göre):** Saat ya da oturum uzunluğuna göre zorluk ayarı gereksiz (saat bandları arasında yazma doğruluğu 53–61, oturum içinde aynı biçimde düşüş ≤ 4 puan). Hızlı seçmeli cevapları "baştan savma" diye cezalandırma: ≤ 2 sn seçmeli %96 doğru, tahmin değil; sorun şıkların kolaylığı (başka ajanın konusu).

## Sınırlar
- `sek` ve zaman damgası saniyeye yuvarlı; panel süresi ±1 sn hatalı. Panel süresi Devam'ın Enter'la mı tıklamayla mı geçildiğini ayırt etmiyor.
- v3 / v5 karşılaştırmasında uygulama tasarımı da değişti (tur yapısı 15.10); "süre düştü" bulgusu alışkanlık + uygulama birlikte.
- Saat bandı ve hafta günü tablolarında hücre başına n 30–260; küçük farklar (< 8 puan) gürültü sayılmalı.
