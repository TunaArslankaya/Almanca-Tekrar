# log-hafiza: hafıza, kalıcılık ve ezber (log.csv + zustand.json)

Veri: `log/log.csv` 3.773 satır (30.9 – 6.11.2026), bunların 2.543'ü kelime cevabı (tanıma / yazma / cümle / metin / artikel / kök). v5 (öğe başına tek hafıza, `basamak:` alanlı) 15.10'da başlıyor: 1.533 cevap. `log/zustand.json`: 276 öğe (110 isim, 77 fiil, 55 diğer, 34 ünite), 143 artikel hafızası, 53 `leech`.
Analiz betikleri: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/lh/` (Python; repo'ya dokunulmadı).

Gruplar: **tanıma** = `erk`/`bed` (sec, anla, metinde) · **yazma** = `wort`/`abr`/`prod` (yaz0, yaz) · **cümle** = `nsatz`/`satz`/… (bos0, bos, cumle) · **metin** = `luecke` (metin boşluğu) · **artikel** = `art`. "Doğru" = `richtig` (fast hariç).

---

## 0. Beş cümlede sonuç

1. **Seçmeli (TR→DE) anlamı ölçmüyor**: 536 `sec` cevabında anlam yanlışı yalnız **8 (%1,5)**. İsimde şıkların ikisi aynı kelime (doğrusu + "der"li tuzağı), edatlı fiilde ikisi aynı fiil → doğru cevap şık yapısından belli. Tuna'nın "şıklardan çözülüyor" gözlemi veriyle doğrulanıyor.
2. **FSRS'in R tahmini üretim için anlamsız**: R ≈ 0,90 iken yazma doğruluğu **%53**, metin boşluğu %35; R kovası değişse de yazma %45–57 arasında düz. Hafızayı büyüten cevapların çoğu seçmeli, ama sorulan beceri üretim.
3. **B1 tuzağı**: üretimde kalıcı yanlıştan (m1) sonra kelime seçmeliye düşüyor ve geri çıkamıyor. v5'teki 144 m1 olayının **89'unda (%62) hâlâ hiç üretim sorusu gelmedi** (medyan 5,7 gündür). D ≈ 10'a doymuş kelimede seçmeli doğrusu S'yi günde yalnız ×1,5 büyütüyor → S < 2 eşiğini aşmak ~7 gün seçmeli.
4. **Kelime gerçekten öğrenilmiyor, unutulmuyor da**: üretim doğruluğu tanıtım gününden sonra her aralıkta %44–50 (düz eğri). Sorun unutma değil, **ilk kodlama ve üretim pratiği azlığı**. v5'te tanıtılan 86 kelimenin yalnız **34'ü** tanıtım gününden sonra en az bir kez doğru üretildi; 30'u hep yanlış, 22'sine hiç üretim sorusu gelmedi.
5. **Artikel hatası kendini tekrar ediyor (perseverasyon)**: aynı yanlış artikel üst üste seçiliyor (das Vorurteil → "der" 7 kez, das Rezept → "die" 6 kez). 21 isimde ≥ 4 artikel yanlışı.

---

## 1. Soru karışımı ve doğruluk

| dönem | cevap | tanıma | yazma | cümle | metin | artikel | kök |
|---|---|---|---|---|---|---|---|
| v3 (30.9–14.10) | 1010 | %28 · doğru %58 | %18 · %60 | %20 · %62 | %1 · %60 | %26 · %68 | %4 · %52 |
| v5 (15.10–6.11) | 1533 | **%47 · %90** | %22 · **%57** | **%5** · %69 | %3 · **%35** | %16 · %68 | %3 · %48 |
| son 14 gün | 976 | %43 · %93 | %24 · %57 | %6 · %63 | %4 · %34 | %17 · %74 | %2 · %52 |

- v5 ile cümle payı %20'den %5'e düştü; seçmeli %28'den %47'ye çıktı. 26.10 düzeltmesinden sonra seçmeli %53 → %42 indi, ama hâlâ en büyük blok.
- Biçim bazında (v5): yaz0 205 soru %61 · yaz 123 %49 · bos0 59 %66 · bos 19 %63 · **cumle (tam cümle) 1** · metin 74 %35.
- Zaman: son 14 günde düşünme süresi (`sek`, ≤ 60 sn kırpılmış) toplam **64 dk** (günde ~4,6 dk); tur süresi (`tur` satırları `dk`) toplam 119 dk / 85 tur. Seçmeli medyan 3 sn, yazma 5 sn. Günde ~100 cevap = günde ~5 dk gerçek hatırlama çabası.

### Seçmelinin kaynağı (v5, 731 seçmeli)
| kaynak | 15–25.10 | 26.10–6.11 | doğru |
|---|---|---|---|
| ısınma (b − 1) | 144 | 68 | %89 |
| normal vadeli | 120 | 71 | – |
| tekrar (yanlıştan sonra aynı turda) | 49 | 59 | **%91** (122/131'i seçmeli) |
| parti mini sorusu | 38 | 58 | %92 |
| kurtarma (hep B1) | 33 | 45 | %91 |
| akşam | 24 | 22 | %72 (akşam toplamı) |

→ Seçmelinin **~%74'ü "özel yollardan"** geliyor (ısınma, kurtarma, tekrar, parti, akşam); bunların hepsi basamağı zorla 1'e indiriyor. 229 seçmeli (%31) daha önce üretimde doğru bilinmiş kelimeye soruldu.

---

## 2. Kalibrasyon: R (sorudan önce) → gerçek doğruluk
(v5, hafızaya yazılan ilk cevaplar; tekrar / ikinci / parti hariç)

| R kovası | seçmeli n / doğru | yazma n / doğru | cümle n / doğru | metin n / doğru | artikel n / doğru |
|---|---|---|---|---|---|
| < 0,50 | 5 / %60 | 3 / – | – | – | 4 / %75 |
| 0,50–0,70 | 38 / **%87** | – | – | – | 41 / %41 |
| 0,70–0,80 | 76 / %95 | 3 / %33 | – | 2 / %50 | 32 / %50 |
| 0,80–0,85 | 75 / %92 | 23 / %52 | 3 / %67 | 9 / %33 | 50 / %80 |
| 0,85–0,90 | 91 / %89 | 70 / %56 | 35 / %54 | 17 / %59 | 49 / %67 |
| 0,90–0,95 | 112 / %89 | 66 / **%45** | 29 / %76 | 25 / **%20** | 46 / %78 |
| 0,95–1,00 | 87 / %95 | 67 / %57 | 12 / %75 | 1 / – | 36 / %89 |
| **ort. R → gerçek** | 0,85 → 0,91 | **0,90 → 0,53** | 0,90 → 0,66 | 0,88 → 0,35 | 0,82 → 0,69 |
| Brier | 0,09 | **0,41** | 0,28 | 0,52 | 0,22 |

- Seçmelide R az tahmin ediyor (R 0,6'da bile %87): seçmeli R'den bağımsız kolay.
- Yazmada R hiçbir şey söylemiyor (düz %45–57). Üretim için yaklaşık ofset: logit(0,53) − logit(0,90) ≈ **−2,1**.
- Artikel hafızası kabaca kalibre (eğim doğru yönde), ama düşük R'de aşırı iyimser değil, makul.

S çarpanı (doğru cevapta S_sonra / S_önce, medyan): seçmeli ×1,50 · yazma ×2,17 · cümle ×2,53. Ama D dağılımı: 59 öğede D ≥ 8,5 (42'si ≥ 9; bunların 28'i S < 2, 27'si bm 1). Örnek **feucht**: 7 ardışık doğru seçmeli, S 0,1 → 0,3 → 0,6 → 1,2; 12 sorunun 12'si seçmeli, hiç yazma yok. **donnern**: 10 sorunun 10'u seçmeli, 6'sı kurtarma.

---

## 3. Öğrenme eğrisi (tanıtımdan sonra)

### n. maruz kalma (v5'te tanıtılan 86 kelime)
| sıra | tanıma | yazma | cümle | metin |
|---|---|---|---|---|
| 1 | 86 / %90 | – | – | – |
| 2 | 2 / – | 83 / %60 | – | 1 |
| 3 | 39 / %92 | 38 / %61 | – | 3 / %33 |
| 4 | 34 / %91 | 19 / **%37** | 11 / %73 | 2 |
| 5 | 29 / %93 | 11 / %45 | 2 | 4 / %0 |
| 6–7 | 46 / %87 | 3 | 1 | – |
| 8–12 | 25 / %76 | 9 / %67 | 1 | 4 / %0 |

### Tanıtım gününe göre (v5 kelimeleri)
| | gün 0 | gün 1 | gün 2–3 | gün 4–7 | gün 8+ |
|---|---|---|---|---|---|
| tanıma | 114 / %89 | 56 / %93 | 11 / %55 | 41 / %93 | 40 / %88 |
| üretim | 106 / %60 | 25 / **%44** | 7 / %43 | 22 / %50 | 35 / %46 |

- Gün 1'de seçmeli üretimden 2 kat fazla. Üretim doğruluğu gün 1'den sonra yükselmiyor (%44 → %46): öğrenme eğrisi düz.
- Tanıtım gününden sonra: 34 kelime en az bir kez doğru üretildi, **30 hep yanlış**, **22'ye üretim sorusu hiç gelmedi**.
- Yaşa göre (tüm tanıtılanlar, 138): 7–14 günlük 24 kelimeden 7'si ertesi günden sonra yazmada doğru, 5'i cümlede doğru; 21–40 günlüklerde 25/53 ve 26/53.
- İlk kalıcı (ertesi günden sonra) yazma doğrusu: medyan **5. soruda, 6. günde**.
- zustand'da bm: 1 → 125, 2 → 116, 3 → 34, **4 → 0** (tam cümleye ulaşan kelime yok). S medyanı 7, ama S ≥ 21 olan 82 öğenin 60'ı hâlâ bm ≤ 2 (eski göç S'leri).

### Yanlıştan sonra ne oluyor (v5, m1 = kalıcı yanlış, 144 olay)
- İlk yanlış türü: yazma 76, metin 33, cümle 19, tanıma 16.
- Sonra üretim sorusu gelen 55 olay: araya medyan 2 seçmeli, 4,8 gün.
- **Hâlâ gelmeyen 89 olay** (%62), medyan 5,7 gündür bekliyor; aradaki seçmeli sayısı 0–9.
- Yazma yanlışından sonraki ilk yazma: arada 0 seçmeli → %67 (n 6), 1 → %42 (12), 2–3 → %50 (22). **Arada seçmeli yapmak sonraki yazmayı iyileştirmiyor.**

---

## 4. Tanıma–üretim açığı

| önceki (≤ 3 gün) seçmeli | sonraki ilk üretim | n | doğru |
|---|---|---|---|
| doğru | yazma | 38 | %61 |
| doğru | cümle | 30 | %57 |
| doğru | metin | 10 | **%10** |
| yanlış | yazma | 18 | %17 |

**Seçmelide ≥ %85, üretimde ≤ %40** (≥ 3 seçmeli, ≥ 2 üretim): **33 / 127 kelime**. En belirginleri (seçmeli % → üretim %):
ebenfalls 7 soru %100 → 0/2 · drüben %86 → 0/2 · eingespannt sein %100 → 0/5 · schweigen %100 → 0/3 · die Behauptung %100 → 0/2 · der Fall %100 → 0/2 · anwesend 8 soru %100 → 0/3 · allerdings 9 soru %89 → 0/2 · die Gerechtigkeit · die Gleichberechtigung (8 seçmeli %100 → 0/3) · das Missverständnis · die Gemeinschaft · das Bedürfnis · fett · das Ehrenamt · der Feuerwehrmann · die Aufnahme · begleiten · manche · betreuen · das Gehirn · eigen · das Einwohnermeldeamt · essen (üretim 3/13) · sich aufregen über · die Ehrlichkeit · die Solidarität · fließend · übrig · sich verlaufen (4/11).

Yoklamada bilip (`yeni;bekannt`) sonra üretimde yanlış: **der Respekt (+−), kommen (+−), bereit (+−)**.

Seçmeli şık yapısı (`js/app.js` `optionenDE`, ~581): isimde 4 şıktan biri doğru ismin yanlış artikelli hâli (die/das isimde her zaman "der"), edatlı fiilde biri aynı fiilin yanlış edatlısı; diğer 2 şık aynı konudan ya da rastgele. Sonuç: TR→DE'de isim 1 / 283, fiil 4 / 122, diğer 3 / 134 anlam yanlışı. Artikel tuzağına düşme: der-isim %84, die %88, das %78 doğru.

---

## 5. Ezber belirtisi (aynı soru metni)

| grup | 1. görülüş | 2. | 3. | 4. | 5+ |
|---|---|---|---|---|---|
| tanıma | 410 / %77 / 3 sn | 166 / %78 | 128 / %82 | 101 / %90 | 210 / **%88 / 3 sn** |
| yazma | 120 / %55 / 5 sn | 168 / %57 | 102 / %62 | 63 / %60 | 80 / %58 |
| cümle | 217 / %61 / 7 sn | 40 / %68 | 22 / **%82** | 7 / %71 | 9 / %67 |

- Tanımada aynı soru tekrarlandıkça doğruluk %77 → %88–90 çıkıyor, süre 3 sn'de sabit; yazmada (aynı Türkçe ipucu) artış yok (%55 → %58). Yani seçmelideki artış kelime bilgisine taşınmıyor: Tuna'nın "cevabı ezberliyorum" dediği desen bu. (Şıklar log'a yazılmıyor; aynı çeldiricilerin tekrarını doğrudan ölçemedim.)
- Cümle: 125 öğede 295 soru, 227 farklı cümle; 28 öğede aynı cümle tekrar. En çok tekrar: zweifeln an Perfekt **8 kez** (−+−+−+−+: yanlış → aynı oturumda doğru → ertesi gün yine yanlış), das Gedicht "Kennst du ein schönes ___?" **8 kez** (−+−−+−++), rechnen mit 5 (+−−−+), regnen 5. Bu "aynı gün doğru, ertesi gün yanlış" zikzağı kısa süreli ezberin tipik izi.

---

## 6. Unutma (son görülmeden beri geçen süre)

| grup | < 1 g | 1–2 g | 3–6 g | 7–13 g | 14 g+ |
|---|---|---|---|---|---|
| tanıma | 390 / %83 | 170 / %79 | 152 / %77 | 93 / %97 | 5 |
| yazma | 242 / %61 | 44 / %64 | 78 / %56 | 74 / %49 | 18 / %56 |
| cümle | 148 / %61 | 52 / %60 | 18 / %83 | 42 / %64 | 23 / %65 |
| artikel | 125 / %63 | 127 / %65 | 68 / %81 | 54 / %74 | 34 / %82 |

Eğri yataya yakın: aynı gün bile yazma %61. Uzun aralıktaki öğeler seçilmiş (zaten iyi bilinen) olduğu için bu tablo unutma hızını tam ölçmüyor (seçim yanlılığı), ama ana mesaj açık: **darboğaz unutma değil, ilk öğrenme / üretim kodlaması**.

---

## 7. Takılan kelimeler (lapses, leech, artikel)

- m.lapses: 0 → 130, 1 → 90, 2 → 41, ≥ 3 → 15. Art.lapses (143): 0 → 78, ≥ 3 → 29.
- 53 leech: 28 anlam ağırlıklı, 22 artikel ağırlıklı, 3 eşit. 48'inin kancası var (`daten/kancalar.js`). Leech işaretinden sonraki 2+ günde: artikel %50 → %65, üretim %51 → %70 (kısmen ortalamaya dönüş olabilir, emin değilim; yine de kanca işe yarıyor gibi).
- Artikel sınaması toplam 960, %78 doğru. Karışma yönü (verilen → doğru): der→die 47, der→das 28, die→der 21, die→das 18, das→die 18, das→der 14 → **"der" varsayımı ana hata** (75/146). Sonek kuralı olan isimlerde %90, kuralsızlarda %80.
- **≥ 4 artikel yanlışı olan 21 isim** (yanlış / sınama): die Geduld 13/19 · das Rezept 12/16 · das Vorurteil 9/11 · die Praxis 8/17 · die Kunst 7/18 · die Toleranz 7/12 · die Gymnastik 7/9 · die Regel 6/18 · das Missverständnis 6/9 · die Diskussion 6/10 · der Nebel 5/11 · das Wetter 5/11 · der Regen 5/7 · die Feuerwehr 5/8 · die Erlaubnis 4/14 · der Wetterbericht 4/9 · das Frühjahr 4/10 · die Burg 4/12 · der Rat 4/10 · die Situation 4/13 · die Not 4/9.
- **Perseverasyon** (aynı yanlış artikelin tekrar seçilmesi): das Vorurteil: der, der, der, der, der, (flaş) die, die, der, der · das Rezept: die, die, der, die, die, der, der, …, die, die, die (4–6.11) · die Toleranz seçmelide 7 kez "der Toleranz" (her seferinde `fast`, m büyüdü). Seçmelideki artikel tuzağı yanlış cevabı pekiştiriyor: seçmeli `fast` + `artikel` → m3 (anlam hafızası büyür), yalnız a1.

---

## 8. Vadesi gelmiş yük ve birikme

- Şu an (6.11 09:54) vadeli: **m 84 + art 38**; 57 öğe 3 günden fazla gecikmiş (en çok 9,1 gün). Gelecek 7 günde kümülatif vadeli m: bugün 125 → +1 g 160 → +7 g **226 / 276** (%82). Beklenen günlük tekrar ≈ **92 m + 40 artikel = 132** cevap/gün; Tuna'nın ortalaması ~85–100 kelime cevabı → birikme yapısal.
- Aralık dağılımı (m, due − last): 0–6 gün 136, 7 gün 43, 10–14 gün 79, 30 gün 14, 60 gün 2; ort. 8,3 gün. **153 / 276 öğede aralığı FSRS değil kapı (pk / bm) belirliyor** (toplam ~4.500 gün "kesilmiş").
- Seçim (`Kern.sec` adım 6) vadelileri **R azalan** sıralıyor: en yüksek R önce. Gecikmiş, düşük R'li öğeler yalnız kurtarmayla (turda 1, hep B1 seçmeli) geliyor; en çok gecikenler (der Fall, das Hochwasser, sich fürchten vor, trocken, die Wettervorhersage … R ≈ 0,66) haftalarca bekliyor.
- Günlük yeni: v5'te 86 tanıtım / 22 gün ≈ 4/gün (kota 6; fren çalışıyor).

## 9. Kelime başına soru (verimlilik)

- v5'te kelime başına anlam sorusu: 1–3 soru 109 kelime, 4–6 → 110, 7–10 → 46, 11–14 → 11.
- "Çok soru, zaten biliyor" (≥ 6 soru, ≥ %90 doğru): yalnız 4 kelime (25 soru) → klasik "bilinen kelimeye fazla soru" israfı küçük.
- Asıl israf başka: **bilinmeyen kelimeye kolay soru**. En çok sorulanlar: die Hilfsbereitschaft 14 (9 seçmeli), feucht 12 (12 seçmeli, %67), die Toleranz 12 (9 seçmeli, %17), anwesend 11 (8 seçmeli; üretim 0/3), allerdings 11 (9 seçmeli; üretim 0/2), die Gleichberechtigung 11, der Umgang 11, donnern 10 (10 seçmeli). Bunlar seçmelide "doğru" sayılıp hiç üretime geçmeyen kelimeler.
- Hafızaya yazılmayan cevap %12 (ikinci 90, tekrar 81): aynı gün tekrarların çoğu seçmeli (tekrar: 122/131 seçmeli, %91 doğru) → yanlış üretimin düzeltmesi tanıma düzeyinde yapılıyor.

## 10. Metin boşluğu (%35)
35 yanlıştan ~10'u yalnız çekim / büyük harf farkı (löschen → gelöscht, Regel → Regeln, Projekt → Projekten, fahren → fährt, können → kann, manche → Manche, blitzt → Blitz). 5.11'deki `G.yakin` düzeltmesi bir kısmını `fast` yapacak. **Olası hata**: `scheinen` öğesi metindeki "Schienen" boşluğuna bağlanmış (`uKand` eşleşmesi; "Der Name Eisenbahn kommt von den _____") ve `kommen` "feststellen kommt" boşluğunda; boşluk–öğe eşleşmesi kontrol edilmeli (emin değilim, log'dan çıkarım).

---

## 11. Öneriler: uygulama (js/kern.js, js/app.js)

| # | Ne | Neden (veri) | Nerede | Büyüklük | Öncelik |
|---|---|---|---|---|---|
| 1 | **Seçmeli doğru cevabı anlam hafızasını büyütmesin** (ya da çok az: `OFS.sec` 1,5 → ≥ 3 ve tanıtım günü dışında hiç yazmasın). Daha temiz yol: iki hafıza `m.tan` / `m.ur`; basamak, vade ve R yalnız üretimden (`yaz`, `bos`, `cumle`, `metin`). | Yazmada R 0,90 → %53 (Brier 0,41); seçmeli TR→DE'de anlam yanlışı %1,5; R kovası üretimi ayırmıyor. | `notVer` (OFS), `uygula`, `guncelle`; `basamak` | orta (iki hafıza: büyük) | **1** |
| 2 | **B1 tuzağını kaldır**: `basamak`'ta `S < 2 → b = 1` yerine tanıtım günü sonrasında taban **b = 2 (yaz0, ipuçlu)**; `if (bag.kurtarma \|\| r < 0.5) b = 1` → `b = 2` (yaz0, ilk harf + uzunluk); ısınma / momentum'da `b -= 1` yerine aynı basamak + ipucu. Seçmeli yalnız tanıtım günü ve klavyesiz turda. | 144 m1'in %62'si üretime hiç dönmedi; feucht, donnern, die Toleranz 10–12 soru seçmelide; arada seçmeli sonraki yazmayı iyileştirmiyor (%42–50). | `basamak`, `bicimSec` (b ≤ 1 dalı) | küçük | **1** |
| 3 | **Yanlıştan sonraki yeniden sorma (kuyruk) üretim olsun**: "bir alt basamak" yerine aynı biçim, ipuçlu (yaz → yaz0, bos → bos0, metin → yaz0). Doğru cevabı gösterdikten sonra **kopya-yaz** (doğrusunu bir kez yazdır) eklenebilir. | `tekrar` cevaplarının 122/131'i seçmeli, %91 doğru, hafızaya yazılmıyor: düzeltme tanıma düzeyinde kalıyor. | `oturumIsle` (kuyruk `b`), app.js sonuç paneli | küçük | **1** |
| 4 | **Seçmeli şıklarını yeniden kur**: (a) TR→DE'de artikel tuzağını kaldır, şıkların hepsi kendi doğru artikeliyle (artikel ayrı sorulsun) ya da hepsinde aynı tuzak tipi; (b) çeldiriciler aynı konudan / aynı sonek veya biçimce benzer (lev ≤ 3), tercihen öğrenilmiş kelimelerden; (c) edatlı fiilde hepsi edatlı; (d) isteğe bağlı "önce kafanda söyle, sonra şıkları aç" (şıklar 1,5 sn gecikmeli ya da tıklayınca açılır). | Şık yapısı cevabı ele veriyor (aynı lemma iki kez); seçmeli 3 sn, %90–95 doğru; aynı soru 4.–5. kez %88–90. | `js/app.js` `optionenDE` (~581), `optionen` (~541) | orta | **1** |
| 5 | **Artikel perseverasyonu**: artikel yanlışından sonra (a) "das Vorurteil" tam yazdır (artikel + isim, renkli), (b) aynı turda 3–5 soru sonra artikeli yeniden sor, (c) ertesi gün yine. Seçmelide artikel yanlışı (`fast`) m'yi büyütmesin. Leech artikelde kancayı soru anında göster. | 21 isimde ≥ 4 yanlış; Vorurteil 7× "der", Rezept 6× "die", Toleranz seçmelide 7× "der". | `notVer` (dogru + art yanlış → m3 dalı), `oturumIsle` (art kuyruğu), app.js artikel paneli | küçük–orta | 2 |
| 6 | **Vadeli sırası**: R azalan yerine önce **R < 0,8 olanlar en düşük R'den**, sonra kalanlar; ya da "gecikme / aralık" oranıyla. Kurtarma basamağı B1 değil yaz0. | 57 öğe > 3 gün gecikmiş (9 güne kadar); kurtarma 78/78 seçmeli. | `sec` adım 6 `sirali`, adım 4 kurtarma | küçük | 2 |
| 7 | **Kota üretim başarısına bağlansın**: son 3 günün üretim doğruluğu < %60 ya da gecikmiş > 30 ise yeni kota 2–3; ≥ %70 ise 6. Yeni kelime "seçmelide bildi" ile değil "ertesi günden sonra ipucusuz yazdı" ile tamamlanmış sayılsın (B1 sprintinin hedefi). | Beklenen günlük tekrar ≈ 132 > Tuna ~100; 86 yeninin 34'ü üretilebildi. | `kota` | küçük | 2 |
| 8 | **Kapılar seçmeliyle doldurulmasın**: pk / bm kapısı yüzünden erken gelen tekrarda biçim bm + 1 (üretim) olsun; kapı nedeniyle gelip seçmeli sorulursa vadeyi değiştirmesin. | 153/276 öğede aralığı kapı belirliyor; bm 4'e ulaşan 0. | `basamak` (kapı vadesi bayrağı), `guncelle` | küçük | 3 |
| 9 | **Cümle tazeliği**: aynı öğe için aynı boşluklu cümle 7 gün içinde tekrar gelmesin; taze cümle yoksa `yaz`'a düş (zaten `tazeCumle` var, eşiği sıkılaştır). "zweifeln an Perfekt" gibi kök sorularında da 3 farklı cümle. | Aynı cümle 8 kez, −+−+ zikzağı. | `C.tazeCumle`, app.js cümle seçimi; içerik: `quellen/saetze.txt` | küçük + içerik | 3 |
| 10 | **Metin boşluğu eşleşmesini denetle** (scheinen ↔ Schienen, kommen ↔ feststellen kommt) ve çekim farkını `fast` say (5.11'de kısmen yapıldı). | metin %35; ~%30'u yalnız çekim. | app.js `uKand`, `uPruef` | küçük | 3 |
| 11 | **Kalibrasyonu izle**: log'dan biçim başına R → doğruluk tablosunu haftalık hesaplayan küçük araç (ör. `tools/kalibrasyon.py`); üretimde hedef doğruluk %75–85. | Şu an R yalnız seçmeli için anlamlı. | yeni araç | küçük | 3 |

Not: 1–3 birlikte uygulanırsa günlük soruların çoğu üretime kayar; başta doğruluk %90'dan ~%60'a düşer, tur "zor" hissettirir. Bunu ipuçlu (yaz0 / bos0) biçimle yumuşatmak ve Tuna'ya önceden söylemek gerekir.

## 12. Tuna için kısa öneri

- **Seçmelide önce cevabı kafanda (sesli) söyle, sonra şıklara bak.** Şıklar şu an cevabı ele veriyor; şıktan seçmek kelimeyi öğretmiyor.
- **Bilmiyorsan "Bilmiyorum" de**, tahmin etme: tahminle doğru sayılan kelime üretime hiç geçmiyor (anwesend, allerdings, die Gleichberechtigung: seçmeli %100, yazma 0).
- **Artikeli kelimeyle birlikte sesli söyle + yaz** ("das Vorurteil, das Vorurteil"): 21 isimde aynı yanlış artikeli tekrar tekrar seçiyorsun; "der" varsayımı hatanın yarısı. Kanca yazılmış kelimelerde kancayı oku.
- **Günde 5–10 dk üretim**: yazarken kelimeyi yüksek sesle de söyle (konuşma + telaffuz için bedava pratik). Günde 100 hızlı tık yerine 50 yazarak cevap daha çok kazandırır.
- Yeni kelime sayısını şimdilik artırma; önce son 3 haftanın ~50 kelimesini (yukarıdaki tanıma–üretim açığı listesi) yazarak oturt.

## Sınırlılıklar
- Şıklar log'a yazılmıyor: "aynı çeldiricileri ezberleme" doğrudan ölçülemedi; aynı soru metninin tekrarına bakıldı.
- Unutma tablosunda seçim yanlılığı var (uzun aralıktaki öğeler zaten iyi bilinenler).
- v3 satırlarında R yok; kalibrasyon yalnız v5 (15.10 sonrası).
- Kanca etkisi önce / sonra karşılaştırması; ortalamaya dönüş payı bilinmiyor.
