# Tekrar ve seviye dinamiği: 8.11 sürümünden sonra (9–12.11) ve önce (26.10–8.11)

Veri: `log/log.csv` (4386 satır), `log/zustand.json` (12.11 10:49 kaydı, 316 öğe). Betikler: `scratchpad/analiz-tekrar/` (aşağıda).
Dönemler: **P1** = 26.10–8.11 07:30 (13 gün, 89 tur), **P2** = 9–12.11 (4 gün, 17 tur). 8.11 06:00–06:07 arasındaki 4 tur sürüm yayına girerken oynandı. Temiz karşılaştırma için P2 9.11'de başlıyor.

## Özet

1. **P2'de ipucusuz soru neredeyse yok.** Öğe sorularının %2,4'ü ipucusuz: 168 sorudan 4'ü, ikisi `metin`, ikisi `kalip`. Hiç `yaz`, `bos` ya da `cumle` sorulmadı. Soruların %52'si `yaz0`. bm'yi yükseltebilen cevap (ipucusuz, `richtig`, hafızaya yazılmış) 4 günde **1 tane** (der Humor, metin). Bu yüzden turlarda `seviye+:0` görünüyor. P1'de ipucusuz soru payı %14,8'di (143 soru); bm adayı olan cevap 66'ydı.
2. **Asıl sebep, vadeli seçimin sırası.** `vadSira` (6.11'de `VAD_DUSUK` = 0,8) R < 0,8 olan öğeleri her zaman öne alıyor. Bunlar dün yanlış yapılmış zayıf öğeler: S < 4, D ≈ 9. Her akşam R ≈ 0,72 ile geri geliyorlar ve `bicimSec` onlara hep `yaz0` veriyor (`S < 4 || lastG === 1`). Turdaki ~8 vadeli yuvanın hepsi bu havuza gidiyor: P2'de 36 vadeli sorunun 32'sinde R < 0,8, 0,8–0,9 aralığında hiç yok. P1'de aynı soruların 186/312'sinde R ≥ 0,9'du.
3. **Güçlü öğeler yalnız ısınmada ve momentumda görünüyor, ikisi de ipuçlu.** Bu iki dal her zaman `yaz0` veriyor. Örnekler: die Prüfung S 92 bm 2, die Energie S 76 bm 1 pk 0, die Praxis S 90 bm 2. Bu öğeler günün tek kalıcı yazımını ipuçlu bir soruyla harcıyor, sonra 7–14 gün kapıda bekliyor.
4. **Hafıza:** 316 öğenin 152'si bm 1, 127'si bm 2, 37'si bm 3, hiçbiri bm 4. Seviye dağılımı 159 / 121 / 36 / 0 (1 / 2 / 3 / 4). 239 öğe, S'nin vereceği seviyenin altında tutuluyor; bunların 152'sinde sebep bm kapısı. S ≥ 21 olan 96 öğenin 70'i hâlâ seviye 1–2'de. Vadesinde normal seçim yapılsa bile 107 öğenin (%34) ipucusuz biçim alma olasılığı sıfır (hepsi S < 4). Isınma ya da momentumda bu sayı 281 öğe.
5. **Tekrar sıklığı abartılı değil.** P2'de 109 farklı öğe soruldu, öğe başına ortalama 1,6 kez; en çok das Einwohnermeldeamt (5 kez, 4'ü yanlış). P1'de eher 11 kez, die Feuerwehr 10 kez soruluyordu. Aynı cümle P2'de yalnız bir kez tekrarlandı: die Geduld artOb, 2 kez. Artikel yükü cevapların %13'ü (29, 22'si artOb, %81 doğru). P2'de 8 yeni leech çıktı, 7'si 11.11'de 7 dakika içinde.
6. **Vade yükü kapasiteyi aşıyor.** Şu an 164 anlam hafızası vadeli; bugünün sonunda 175, 7 gün içinde 273 (öğelerin %86'sı). Artikelde bugün 45, 7 günde 73. Kararlı durumda günlük vade akışı yaklaşık 98 anlam/gün. P2'de günde ~57 cevap verildi; bunların yalnız ~14'ü vadeli anlam tekrarıydı (yanlış sonrası kuyrukla ~20). Gerisi gramer (8), ses (7), artikel (7), yeni kelime (10) ve ayır (3) oldu. Kota birikme yüzünden 2'ye inmiş (`kota().sebep = 'birikme'`); günde 2–6 tanıtım, 1–4 yoklama.
7. **Turdaki gramer:** P2'de 33 soru, %73 doğru. Hepsi açık 10 konudan geliyor; bu konuların kartı 1–5.11'den beri vadeli ve tur cevabı kartı değiştirmiyor. tuerkisch-fallen payı %12 (4/33, 9 konuya eşit dağılımla beklenen ~%11). 8.11'den beri 5 sorunun 4'ü doğru. Teil istatistiği 3.11'den beri 18 doğru, 5 yanlış. "Hiç hatam yok" tam doğru değil ama son günlerde neredeyse doğru.
8. **Simülasyon (14 gün, gerçek Kern fonksiyonları, gerçek hafıza):** Şimdiki kurallarla 14 günde yalnız **1,7** bm artışı çıkıyor. Bu, P2'deki gerçek değerle uyumlu (4 günde 1). Vadeli sırayı zayıf / güçlü dönüşümlü yapmak tek başına **38** bm artışı veriyor. Isınmada güçlü öğeye ipucusuz soru sormak **15**. Hepsi birlikte (sıra + ısınma + yük azaltma) **54** artış veriyor ve 15. gündeki vadeli sayısını 264'ten 191'e indiriyor. "Bedava seviye yok" ilkesi bozulmuyor: bm yine yalnız ipucusuz, tam doğru cevapla yükseliyor.

---

## 1. Seviye neden yükselmiyor?

### 1.1 Tur özetleri

| dönem | tur | cevap | `seviye+` toplamı | `seviye+ > 0` olan tur |
|---|---|---|---|---|
| P1 26.10–8.11 | 89 | 1094 | 91 | 45 |
| P2 9–12.11 | 17 | 224 | **1** | 1 (12.11 10:47, der Humor `metin` doğru: bm 2 → 3) |

Not: 8.11'de sayaç da değişti. Artık yalnız ipucusuz, tam doğru cevaptaki seviye artışı sayılıyor (app.js `cevapIsle` → `ipucsuzDogru`). P1'deki 91'in bir kısmı ipuçlu cevaplardan, yalnız S'nin büyümesiyle gelen artışlardı.

### 1.2 Biçim dağılımı ve doğruluk (öğe soruları, tanıtım hariç)

| biçim | P1 n | P1 % | P1 doğru / fast / yanlış | P2 n | P2 % | P2 doğru / fast / yanlış |
|---|---|---|---|---|---|---|
| sec | 270 | 27,9 | 93 / 6 / 1 | 19 | 11,3 | 100 / 0 / 0 (16'sı tanıtım mini sorusu) |
| **yaz0** | 221 | 22,8 | 63 / 17 / 20 | **87** | **51,8** | 52 / 21 / 28 |
| artikel | 153 | 15,8 | 75 / 0 / 25 | 7 | 4,2 | 71 / 0 / 29 |
| **yaz** | 80 | 8,3 | 51 / 15 / 34 | **0** | 0 | – |
| metinde / anla | 80 | 8,3 | 94 / 0 / 6 | 1 | 0,6 | – |
| bos0 | 41 | 4,2 | 66 / 15 / 20 | 3 | 1,8 | (hepsi ısınma) |
| metin | 36 | 3,7 | 25 / 8 / 67 | 2 | 1,2 | 50 / 50 / 0 |
| **bos** | 21 | 2,2 | 67 / 5 / 29 | **0** | 0 | – |
| artOb | 20 | 2,1 | 70 / 5 / 25 | 22 | 13,1 | 82 / 0 / 18 |
| kök (kok / kokSatz) | 32 | 3,3 | – | 4 | 2,4 | 100 / 0 / 0 |
| ayir | 6 | 0,6 | 100 | 12 | 7,1 | 92 / 0 / 8 |
| yoklama | 2 | 0,2 | – | 9 | 5,4 | 78 / 11 / 11 |
| kalip | 5 | 0,5 | 20 / 0 / 80 | 2 | 1,2 | 0 / 0 / 100 |
| **cumle** | 1 | 0,1 | – | **0** | 0 | – |
| **ipuçlu (yaz0 + bos0)** | 262 | 27,1 | | 90 | 53,6 | |
| **ipucusuz (yaz, bos, cumle, kalip, metin)** | 143 | 14,8 | | **4** | **2,4** | |
| bm adayı (ipucusuz + `richtig` + hafızaya yazıldı) | 66 | | | **1** | | |

`basamak:` etiketine göre P2: B2 109, B1 32, A (artikel) 29, K 4, **B3 2, B4 0**.
Zor soru: P1'de 8, P2'de **0**. Kapı etiketi P2'de: `kapı:7g` 5, `kapı:14g` 2.

### 1.3 Cevap yuvaları: tur nereye harcanıyor (`a3_slot.py`)

| kaynak | P1 günde | P1 doğru % | P2 günde | P2 doğru % |
|---|---|---|---|---|
| gramer (P1'de bölüm + tanı dahil; P2'de yalnız tur) | 22,0 | 56 | 8,2 | 73 |
| vadeli anlam, R ≥ 0,9 (momentum ya da güçlü vadeli) | 14,3 | 68 | 1,0 | 75 |
| vadeli anlam, normal (R < 0,9) | 9,6 | 66 | 8,0 | **34** |
| artikel (flaş, artOb, mini set) | 13,3 | 73 | 7,3 | 79 |
| yanlış sonrası kuyruk | 7,2 | 86 | 6,0 | 58 |
| ısınma | 5,9 | 95 | 3,0 | 75 |
| kurtarma | 4,9 | 83 | 2,0 | **25** |
| yeni (mini + ikinci + yoklama) | 11,2 | – | 10,2 | – |
| ses (duy / hoer) | 2,3 | 87 | 6,8 | 78 |
| ayır | 0,5 | 100 | 3,0 | 92 |
| metin boşluğu | 2,8 | 24 | 0,5 | 50 |
| **toplam cevap / gün** | **100** | | **57** | |

P2'de bir turun yaklaşık yarısı sabit yük: 2 gramer, 2 ses, 1 ayır, en çok 3 artikel. Bir kısmı da yeni kelime. Vadeli anlam tekrarına turda 2–4 yuva kalıyor.

### 1.4 Hangi vadeli öğeler seçiliyor?

Isınma, kurtarma, kuyruk ve yeni hariç, hafızaya yazılan vadeli sorular (`R:` = sorudan önceki R):

| dönem | n | R < 0,8 | 0,8–0,9 | ≥ 0,9 |
|---|---|---|---|---|
| P1 | 312 | 46 | 80 | 186 |
| P2 | 36 | **32** | 0 | 4 (momentum: Praxis, Vertrag, Dozent) |

12.11 10:51 itibarıyla 164 vadeli anlam hafızasının R dağılımı:

| R kovası | öğe |
|---|---|
| 0,75–0,80 | 23 |
| 0,80–0,85 | 38 |
| 0,85–0,90 | 64 |
| 0,90–0,95 | 27 |
| 0,95–1,00 | 12 |

R < 0,8 olan 23 öğenin medyan S'si 1,8; 16'sı S < 4. R ≥ 0,8 olan 141 öğenin 64'ü S ≥ 4.

**Zincir** (`js/kern.js`):
1. `sec` adım 6 → `vadSira`: R < 0,8 olanlar en düşük R'den önce gelir. Dünün yanlışları (S 0,2–0,6, ertesi gün 04:00 vadeli) akşam R ≈ 0,70–0,76 ile gelir ve sıranın başında olur. Her gün yenileri ekleniyor (P2'de normal vadelinin %44'ü yanlış), bu yüzden havuz hiç tükenmiyor.
2. `basamak`: bu öğelerde b = 1–2.
3. `bicimSec` b = 2: `(h.S || 0) < 4 || h.lastG === 1 ? 'yaz0' : 'yaz'` kuralı yüzünden hep `yaz0`.
4. `uygula`: `IPUCLU_BICIM` (yaz0 / bos0) bm'ye dokunmaz. Doğru cevapta S 0,3'ten 0,9'a çıkar, öğe yine ertesi gün vadeli olur.
5. R ≥ 0,8 güçlü öğeler normal seçime hiç ulaşmıyor. Yalnız iki yoldan gelebiliyorlar:
   - **ısınma** (günün ilk 3 sorusu, en yüksek R): `bag.isinma` → b − 1, zayif → `ipuclu` → yaz0;
   - **momentum** (art arda 2 yanlıştan sonra; log'da etiketi yok): aynı şekilde yaz0.

   Bu iki yol günün tek kalıcı yazımını ipuçlu bir soruyla harcıyor. Sonra `bmAralik` (bm 1 → 7 g, bm 2 → 14 g) yüzünden öğe bir hafta ya da iki hafta yeniden görünmüyor.
6. Zor soru (`zorHedef`) yalnız normal vadeli seçimde ve `ds ≥ 2` öğede devreye giriyor. Normal seçime giren R < 0,8 öğelerde ds 0. Bu yüzden P2'de hiç zor soru yok.
7. `metin` etkinliği (bm ≥ 2 öğeler, B3 ipucusuz) adım 8–9 penceresinde. O pencere kuyruk, ses (adım 9) ve günün ilk metninin dikteye dönmesiyle çakışıyor. P2'de 4 günde 1 kez boşluklu metin geldi.

### 1.5 Hafıza dağılımı: `items[].m`, 316 öğe (`a2_hafiza.py`)

bm × S tablosu:

| bm \ S | < 1 | 1–2 | 2–4 | 4–7 | 7–21 | 21–60 | ≥ 60 | toplam |
|---|---|---|---|---|---|---|---|---|
| 1 | 17 | 21 | 61 | 23 | 21 | 6 | 3 | **152** |
| 2 | 6 | 1 | 7 | 14 | 38 | 42 | 19 | **127** |
| 3 | 0 | 0 | 1 | 0 | 10 | 23 | 3 | **37** |
| 4 | – | – | – | – | – | – | – | **0** |

| alan | dağılım |
|---|---|
| seviye 1 / 2 / 3 / 4 | 159 / 121 / 36 / 0 |
| pk 0 / 1 / 2 / 3+ | 168 / 91 / 42 / 15 |
| ds 0 / 1 / 2 / 3 | 48 / 122 / 124 / 22 |
| lastG 1 / 2 / 3 / 4 | 14 / 8 / 281 / 13 |
| lapses ≥ 2 | 70 |
| ustBasamak 3 / 4 | 104 / 212 |
| bm ≥ ustBasamak (tepede) | 10 |

- **S'nin vereceği seviyenin altında tutulan öğe: 239.** Sebepleri: bm kapısı 152, pk 0 kapısı 41, pk 1 kapısı 43, diğer 3.
- **S ≥ 21 olan 96 öğe:** seviye 1 → 9, seviye 2 → 61, seviye 3 → 26. Bm dağılımı aynı: 9 / 61 / 26. Yani bu öğeleri tutan tek şey bm. Örnekler: die Energie S 76, bm 1, pk 0 → seviye 1; die Kindheit S 59, bm 1 → seviye 1; der Termin S 92, bm 2 → seviye 2.
- **Vadesinde normal seçim yapılsa beklenen biçimler** (öğe başına 400 örnek, `durum.js`): yaz0 103, yaz 77, bos 67, bos0 49, cumle 12, kalip 8 öğe-eşdeğeri.
  - 107 öğede ipucusuz biçim olasılığı **0**. Hepsi S < 4: bm 1 → 97, bm 2 → 9, bm 3 → 1.
  - Isınma ya da momentumda 281 öğe yaz0 alıyor.
- **Zayıf çekirdek (S < 4, 114 öğe):** 55'inde lapses ≥ 2, 30'u leech, 64'ünde D ≥ 8.

Bu öğeler yaz0 bölgesinden çıkabilmek için (S ≥ 4 olmalı) arka arkaya hiç yanlış yapmadan çok sayıda doğru cevap gerekiyor (`buyume2.js`, ret 0,9, her gün vadesinde sorulursa):

| D | yanlıştan önce S 2 | S 5 | S 10 |
|---|---|---|---|
| 6 | 4 doğru / 7 gün | 3 / 6 | 3 / 6 |
| 8 | 5 / 11 | 4 / 7 | 3 / 6 |
| 9 | 6 / 12 | 5 / 11 | 4 / 8 |
| 10 | 7 / 14 | 6 / 13 | 5 / 12 |

P2'de yaz0'da tam doğru oranı %52, yanlış oranı %28 olduğu için bu seri pratikte kurulamıyor.

### 1.6 R'nin kalibrasyonu (26.10–12.11, ilk yazım cevapları; `a6_kalibre.py`)

| biçim | n | ortalama R | gerçek `richtig` | yanlış olmayan (`richtig` + `fast`) |
|---|---|---|---|---|
| yaz0 | 184 | 0,85 | 0,53 | 0,76 |
| yaz | 80 | 0,91 | 0,51 | 0,66 |
| bos0 | 44 | 0,91 | 0,66 | 0,82 |
| bos | 21 | 0,92 | 0,67 | 0,71 |
| metin | 38 | 0,90 | 0,26 | 0,37 |
| artikel | 153 | 0,83 | 0,75 | 0,75 |
| sec | 168 | 0,90 | 0,93 | 0,99 |

R ≥ 0,9 aralığında yaz0'ın tam doğru oranı 0,58, yaz'ınki 0,50: ipucunun kazandırdığı 8 puan. Yani güçlü öğelerde yaz0 yerine yaz sormanın doğruluk maliyeti küçük, ama yalnız yaz bm kazandırabiliyor.

Seviye atlatmayan `fast` cevapların etiketleri: P2'de 20 fast'ın 13'ü yazım / büyük harf, 4'ü yalnız artikel. P1'de 59 fast'ın ~20'si yalnız artikel hatası (kelime doğru).

---

## 2. Tekrar eden öğeler, cümleler, artikel yükü, leech (`a4_tekrar.py`)

**Kaç kez sorulduğu** (gramer, ses ve ayır hariç):

| dönem | farklı öğe | öğe-cevabı | öğe başına | aynı gün öğe başına |
|---|---|---|---|---|
| P1 (13 gün) | 292 | 990 | 3,39 | 1,30 |
| P2 (4 gün) | 109 | 171 | 1,57 | 1,34 |

P2'de soru sayısına göre öğe dağılımı: 1 kez 70, 2 kez 21, 3 kez 14, 4 kez 3, 5 kez 1.

P2'de en sık sorulanlar:

| öğe | kez / gün | sonuç |
|---|---|---|
| das Einwohnermeldeamt | 5 / 2 | 4 yanlış (yaz0 → yaz0 → yaz0 zinciri; leech) |
| die Geduld (artOb) | 4 / 4 | 3 yanlış (das), aynı cümle 2× „Langsam verliere ich ___ Geduld…“ |
| sich fürchten vor | 4 / 2 | 2 yanlış (kalip 0/1) |
| sich wenden an | 4 / 2 | kalip yanlış → yaz0 doğru |
| bereits, die Folge, sich verlaufen, sogar, politisch, die Botschaft, verantwortlich, drüben, der Pate, eben | 3'er | |
| wachsen, erhöhen, erkennen | 3'er | sec, sec, yaz0 (tanıtımdan sonraki ilk tekrar), hepsi doğru |

Aynı gün yanlış → kuyruk zincirleri (yalnız 3+ soru):

| gün | öğe | zincir |
|---|---|---|
| 9.11 | das Einwohnermeldeamt | yaz0 ✗ → yaz0 ✗ → yaz0 ✗ |
| 9.11 | die Botschaft | sec ✓ → yaz0 ✗ → yaz0 ✗ |
| 11.11 | der Pate | yaz0 ✗ → yaz0 ✗ → yaz0 ✓ |
| 11.11 | eben | yaz0 ✗ → yaz0 ✗ → yaz0 ✓ |

Aynı yaz0 biçimi üç kez üst üste geliyor ve öğe yeniden tanıtılmıyor.

**Aynı cümle:** P2'de 30 gün sınırı (`kxSay`) çalışıyor; yalnız Geduld artOb cümlesi 2 kez geldi. Aynı Türkçe ipucu (frage) 2–3 kez görüldü (Einwohnermeldeamt 3×, wachsen / erkennen 3×), ama bunlar cümle değil kelime ipucu.

**P1'de en çok tekrar edilenler:** eher 11 (5 gün), die Feuerwehr 10 (9 gün; 6'sı art), die Art 9, sich wenden an 8, das Ehrenamt 8, vor allem 8, die Regel / Politik / Gewitter / Wetter / Gymnastik 7'şer (çoğu artikel flaşı).

**Artikel yükü:**

| | P1 | P2 |
|---|---|---|
| art satırı | 168 (günde 12,9, %74 doğru) | 29 (günde 7,3, %81 doğru; artOb 22, flaş 7) |
| wort / nsatz satırlarında artikel hatası | – | 7 |

- P2'de en çok gelenler: Geduld 4 (3 yanlış), Rezept 3, Vorurteil / Feuerwehr / Politik 2'şer.
- Artikel hafızası: 148 isim; 26'sında S < 2, 36'sında lapses ≥ 3.
- Vadeli artikel: bugün 45, 7 günde 73.
- Artikel turda en çok 3 (`ART_TUR`); P2'de ortalama ~1,7.

**Leech satırları** (takılanlar):
- 1–8.11 (13 satır): eher, Gymnastik, übertreiben, Schmerz, Feuerwehr, Wetterbericht, drüben, Gewitter, Gleichberechtigung, Service, eben, berichten über, Supermarkt.
- 9–12.11 (8 satır): Einwohnermeldeamt (9.11); Verhalten, Pate, Erziehung, deutlich, Kritik, Aufnahme, Wärme (hepsi 11.11 20:32–20:39).

  11.11'deki bu 7 öğenin hepsi yaz0 kurtarma ya da vadeli olarak R ≈ 0,74 ile soruldu ve yanlış yapıldı. Bunlar 1.4'te anlatılan zayıf çekirdeğin ta kendisi.

---

## 3. Vade yükü ve kapasite (`a5_vade.py`, `a8_kapi.js`)

| gün | yeni vadeli anlam | yeni vadeli artikel | kümülatif anlam | kümülatif artikel |
|---|---|---|---|---|
| 12.11 (geçmiş dahil) | 175 | 45 | 175 | 45 |
| 13.11 | 28 | 7 | 203 | 52 |
| 14.11 | 15 | 1 | 218 | 53 |
| 15.11 | 21 | 8 | 239 | 61 |
| 16.11 | 2 | 1 | 241 | 62 |
| 17.11 | 7 | 3 | 248 | 65 |
| 18.11 | 15 | 5 | 263 | 70 |
| 19.11 | 10 | 3 | 273 | 73 |

- **Gecikme:** şu an vadeli anlamların gecikmesi 0 gün 26, 1 g 27, 2 g 25, 3 g 26, 4 g 24, 5 g 21, 6+ g 15. Birikme her gün ~25 artıyor.
- **Karşılaştırma:** 5.11 kaydında 62 anlam + 37 artikel vadeliydi (VERLAUF). Bir haftada anlam 62 → 164.
- **Kararlı durumda günlük vade akışı** (Σ 1/aralık): şimdiki aralıklarla 98/gün, kapılar (pk / bm) olmasa 81/gün. 157 öğenin aralığı kapıyla kısalıyor (toplam 2996 öğe-gün):

  | pk / bm | öğe |
  |---|---|
  | pk0 bm1 | 52 |
  | pk1 bm2 | 36 |
  | pk2 bm2 | 21 |
  | pk0 bm2 | 17 |
  | pk2 bm3 | 13 |
  | pk1 bm3 | 12 |
  | pk1 bm1 | 6 |

  Akışın büyük kısmı yine 1 günlük aralıklı zayıf öğelerden geliyor (53 öğe < 1,5 gün).
- **Karşılayan:** P2'de günde ~14 vadeli anlam cevabı (ısınma, kurtarma ve momentum dahil; kuyrukla ~20) ve ~7 artikel cevabı. Günde 60–100 cevap bu akışa **yetmiyor**: 57 cevabın yalnız %25–35'i vadeli tekrara gidiyor. Ayarlardaki `ret` 0,90 (Tuna'nın seçimi) kapasiteyi `wRet` = 0,8 ile çarpıyor ve aralıkları kısaltıyor.
- **Yeni kelime kotası:** `kota()` → `q 2, sebep 'birikme'` (birikme 162 > 2 × kap). `ayar4.yeniGunluk` 8 olsa da kota 2'ye iniyor. Gerçekleşen tanıtım: 9.11 6, 10.11 2, 11.11 6, 12.11 2; yoklamada bilinen 4 / 2 / 1 / 1. P1'de günde 2–8 tanıtım vardı.

---

## 4. Turdaki gramer sorusu (`a7_gram.py`; yalnız veri)

| konu | P2 (9–12.11) n | P2 doğru / yanlış | P1b (1–8.11) n | P1b doğru / yanlış |
|---|---|---|---|---|
| reflexiv | 7 (%21) | 5 / 2 | 20 (%20) | 14 / 6 |
| satzklammer-tekamolo | 5 (%15) | 3 / 2 | 7 | 4 / 1 (+2 fast) |
| vergleich | 4 | 3 / 1 | 17 | 12 / 5 |
| **tuerkisch-fallen** | **4 (%12)** | **3 / 1** | 10 (%10) | 7 / 3 |
| verbstellung | 4 | 3 / 0 (+1 fast) | 11 | 9 / 1 |
| es-korrelat | 3 | 3 / 0 | 13 | 5 / 8 |
| adjektiv | 3 | 2 / 1 | 4 | 2 / 2 |
| n-deklination | 2 | 1 / 1 | 6 | 4 / 2 |
| modalverben | 1 | 1 / 0 | 6 | 4 / 2 |
| nominal-verbal, pronomen | 0 | – | 2 + 2 | – |
| **toplam** | **33** | **%73 doğru** | **98** | **%65 doğru** |

- **Havuz:** `S.gram.konu` içinde karti olan (açık) yalnız 10 konu var: reflexiv, tuerkisch-fallen, verbstellung, vergleich, es-korrelat, satzklammer-tekamolo, n-deklination, modalverben, adjektiv, pronomen. Hepsinin kartı 1–5.11'den beri vadeli: `turSorusu` → `vadeliT`, tur cevabı konu kartını değiştirmiyor. Bu yüzden turdaki gramer hep aynı 9–10 konudan dönüyor. adjektiv kartının vadesi 4.11; sprint 9.11'de bitti, 5.11'den beri yeni konu açılmadı.
- **tuerkisch-fallen bütün satırları (26.10–12.11, 25 satır):**
  - 20 doğru, 5 yanlış:

    | tarih | teil / tür | etiket |
    |---|---|---|
    | 3.11 | richtung | hâl |
    | 4.11 | richtung / ceviri | hâl, artikel/çekim |
    | 6.11 | hilfsverb / fehler | yardımcı fiil |
    | 6.11 | hilfsverb / umform | yardımcı fiil |
    | 10.11 | artikel / fehler | hatayı görmedi |

  - 10.11'deki yanlış, 11.11 20:28'de hayalet (`ghost:2`) olarak yeniden geldi (doğru).
  - 8.11'den beri turda 7 sorunun 6'sı doğru (9–12.11 aralığında 4'te 3).
  - Teil istatistiği (d / y): v2 6/0, kasus 5/0, klein 1/0, richtung 2/2, hilfsverb 2/2, artikel 2/1.
  - **Sonuç:** Tuna'nın gözlemi büyük ölçüde doğru. v2 ve kasus teil'leri hatasız ama sürekli geliyor (11 soru, 0 yanlış). Hatalar richtung / hilfsverb / artikel teil'lerinde. Sıklık konu başına eşit payla tutarlı (~1 / 9); fazlalık hissi havuzun 10 konuya sıkışmasından geliyor.

---

## 5. Öneriler (veri ve simülasyonla)

**Simülasyon** (`sim.js`):
- **Kurulum:**
  - 12.11 hafızası, 14 gün, 6 tohum, gerçek `Kern.basamak / bicimSec / notVer / uygula / seviye / vadeliler`.
  - Günde 22 anlam cevabı: ısınma 3, kurtarma ≤ 4, her yanlış +1 kuyruk yuvası.
  - Başarı modeli 1.6'daki kalibrasyon: P(richtig) = σ(logit R + δ_biçim), P(yanlış değil) = σ(logit R + δ'_biçim).
- **Doğrulama:** S0 satırı gerçeğe uyuyor: ~%10 ipucusuz, 14 günde 1,7 bm artışı; gerçekte 4 günde 1.

| senaryo | anlam cevabı (14 g) | ipucusuz | bm artışı | seviyesi artan öğe | seviye 1/2/3/4 (14. g) | bm 1/2/3/4 | 15. gün vadeli | zor soru |
|---|---|---|---|---|---|---|---|---|
| S0 şimdiki | 213 | %10 | **1,7** | 2,7 | 158/122/36/0 | 151/128/37/0 | 264 | 6 |
| S1 ısınma: güçlü öğede ipucusuz | 217 | %21 | 14,8 | 16,2 | 157/110/49/0 | 150/117/50/0 | 257 | 7 |
| S2 yaz0 eşiği S < 4 → S < 2 | 215 | %13 | 1,8 | 3,0 | 158/122/36/0 | 150/129/37/0 | 263 | 6 |
| **S3 vadeli sıra: zayıf / güçlü dönüşümlü** | 233 | %37 | **37,8** | 37,5 | 155/102/56/1 | 144/109/61/3 | 210 | 11 |
| S9 sıra: zayıf en çok 1/3 | 239 | %39 | 42,0 | 41,3 | 157/99/58/1 | 141/109/63/3 | 197 | 11 |
| S4 anlam bütçesi 22 → 30 (sabit yük −8) | 297 | %8 | 2,8 | 3,2 | 159/121/37/0 | 150/129/38/0 | 252 | 7 |
| S5 yalnız artikel hatası bm sayar | 214 | %11 | 2,3 | 3,7 | 157/123/36/0 | 150/129/37/0 | 265 | 7 |
| **S6 = S1 + S2 + S3 + S4** | 310 | %43 | **54,0** | 54,2 | 154/94/66/1 | 138/103/72/3 | **191** | 13 |
| S8 = S6, ret 0,85 | 313 | %42 | 57,5 | 57,5 | 154/90/68/1 | 139/99/74/4 | 175 | 14 |

**Öneri 1, en büyük etki: vadeli sırayı dengele.**
- Yer: `js/kern.js` → `sec`, adım 6, `vadSira` / `VAD_DUSUK`.
- Şimdi: R < 0,8 olanların hepsi önce.
- Önerilen: R < 0,8 havuzundan en çok her 2.–3. vadeli yuva (örneğin `o.zayifSay` sayacıyla zayıf ≤ ⌈vadeli yuva / 3⌉). Kalan yuvalar R azalan sırayla, yani bm + 1'e çıkmaya hazır öğeler.
- Beklenen etki: bm artışı 14 günde 1,7 → 38–42, ipucusuz pay %10 → %37–39, 15. gün vadeli 264 → 197–210.
- Gerekçe: P2'de vadeli yuvaların 32/36'sı R < 0,8'e gitti ve bunlar %34 doğru oldu. Güçlü 141 öğe hiç seçilemedi.

**Öneri 2: ısınma ve momentum güçlü öğeyi ipuçluya düşürmesin.**
- Yer: `js/kern.js` → `basamak`.
- Şimdi: `if (bag.isinma || bag.momentum …) { b -= 1; zayif = true }` → `ipuclu`.
- Önerilen: `h.S ≥ 7 && h.bm ≥ 2 && R ≥ 0,9` ise ne b − 1 ne `ipuclu` uygulansın; normal merdiven ve zor soru (`zorOk`) kalsın. Ya da en azından `ipuclu` yalnız S < 7'de verilsin.
- Beklenen etki: tek başına bm artışı 1,7 → 14,8.
- Gerekçe: P2'deki 12 ısınma sorusunun 10'u R 0,96–0,98 ve S 59–98 öğelerdi; yaz0 ya da bos0 olarak soruldular. Kalan 2'si sec ve metinde idi (S 3–4). Isınma soruları %75 tam doğru, %25 küçük hatalıydı ve hiçbiri seviye atlamadı. Momentum (Praxis, Vertrag, Dozent) de aynı. Bu cevaplar günün tek kalıcı yazımını harcıyor (`uygula` → `h.gun === g`).

**Öneri 3: kapasite sıkışınca sabit yükü kıs** (öneri 1 ile birlikte anlamlı).
- Yer: `js/kern.js` → `sec` (ve `kota().sebep === 'birikme'` durumu).
- Önerilen: birikme varken `GRAM_ADIM` [5, 10] → [5], `SES_ADIM` [4, 9] → [4] (hoer günaşırı), ayır (app.js `ayirKoy`) yok. Turda +3 vadeli yuva.
- Beklenen etki: tek başına küçük (+1 bm), çünkü fazla yuva da R < 0,8 havuzuna gidiyor. Öneri 1 ve 2 ile birlikte (S6) bm artışı 54, 15. gün vadeli 191.
- Gerekçe: P2'de günde 57 cevabın 18'i gramer + ses + ayır. Vade akışı ~98/gün, karşılanan ~14.

**Öneri 4: zayıf çekirdeği yeniden sınamak yerine yeniden öğret.**
- Yer: `js/kern.js` → `basamak` / `sec` kurtarma dalı ve `oturumIsle` kuyruğu.
- Önerilen:
  - lapses ≥ 3 ya da D ≥ 9 olan öğe vadeli olunca önce tanıtım kartı (`yenidenTanit`, şimdi yalnız R < 0,35'te) ve aynı turda yaz0;
  - kuyrukta aynı biçim art arda üçüncü kez gelmesin (deneme 3'te tanıtım ya da seçmeli);
  - bu öğeler günde en çok ~5 yuva alsın, gerisi akşam tekrarına ya da Zayıflar'a.
- Gerekçe:
  - P2'de kurtarma %25 doğru (8 soru).
  - Einwohnermeldeamt 9.11'de üç kez üst üste yaz0 yanlış, 11.11'de yine yanlış.
  - 11.11'de 7 dakikada 7 leech çıktı.
  - S < 4 olan 114 öğeden 64'ünde D ≥ 8; bu D'de yaz0 bölgesinden çıkmak için arka arkaya 5–7 doğru gerekiyor.
- Etki simülasyonda ölçülmedi.

**Öneri 5: B3'e çıkış yolunu aç.**
- Yer: `js/kern.js` → `bicimSec`, b = 3: `(h.S || 0) < 10 ? 'bos0' : 'bos'`.
- Önerilen: bm ≥ 2 ve pk ≥ 1 ise S ≥ 7'de `bos`. Ayrıca `metin` etkinliği adım 8–9 penceresinde ses yuvasıyla (adım 9) ve günün ilk metninin dikteye dönmesiyle çakışıyor; P2'de 4 günde 1 boşluklu metin geldi. Metin penceresi `boy − 3`'e kadar genişletilsin ya da dikte ayrı yuvaya alınsın.
- Gerekçe:
  - Vadesinde 49 öğe-eşdeğeri bos0 alıyor; bos0 bm'yi 3 yapmıyor.
  - bm 2'de S 7–21 olan 38 öğe var.
  - Metin, B3 ipucusuz ve tek doğru cevapla bm 2 → 3 yapabilen biçim (12.11 Humor).

**Düşük etkili ya da ilkeye dokunan, önerilmeyen değişiklikler (veriyle):**
- **bicimSec yaz0 eşiği S < 4 → S < 2 (S2):** +0,1 bm. Zayıf öğe ipucusuz da yapamıyor (R 0,72'de yaz için tahmini doğru ~%19).
- **Yalnız artikel hatasını bm'ye saymak (S5):** +0,6 bm. Etkisi küçük.
- **ret 0,85 (S8):** vadeliyi 191 → 175'e indiriyor, bm etkisi küçük. Ayar Tuna'nın tercihi.

**"Bedava seviye yok" korunuyor.** Önerilerin hiçbiri bm kuralını (`uygula`: yalnız `richtig`, ipucusuz, itirazsız) değiştirmiyor. Seviye, güçlü öğelere ipucusuz soru sorulduğu için ilerliyor.

---

## Ek: betikler (`/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/analiz-tekrar/`)

| betik | ne yapar |
|---|---|
| `ortak.py` | csv okuma, notiz ayrıştırma, öğrenme günü, dönemler |
| `a1_bicim.py` | biçim dağılımı, doğruluk, ipuçlu / ipucusuz, seviye+ |
| `a2_hafiza.py` | bm × S, seviye kapıları, vadesinde biçim dağılımı, vade |
| `a3_slot.py` | cevap yuvaları (kaynak) ve günlük cevap |
| `a4_tekrar.py` | aynı öğe / cümle, artikel yükü, leech, kuyruk zincirleri |
| `a5_vade.py` | 14 günlük vade tahmini (anlam ve artikel) |
| `a6_kalibre.py` | R ile gerçek doğruluk (biçim başına δ) |
| `a7_gram.py` | turdaki gramer konuları, tuerkisch-fallen, gramer kartları |
| `a8_kapi.js` | kapıyla kısalan aralıklar, günlük vade akışı |
| `durum.js` | Playwright: gerçek zustand uygulamada açılır, öğe başına kapı ve biçim olasılıkları (`durum.json`, `m_items.json`) |
| `buyume.js`, `buyume2.js` | zayıf öğenin S ≥ 4'e çıkışı |
| `sim.js` | 14 günlük senaryo simülasyonu |

Depoda hiçbir dosya değiştirilmedi.
