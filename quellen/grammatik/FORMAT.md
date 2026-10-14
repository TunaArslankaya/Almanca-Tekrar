# Gramer bölümü: içerik biçimi ve tekrar kuralları

Kaynak dosyalar: `quellen/grammatik/<id>.txt` (bir dosya = bir konu). Örnek: `ORNEK_nebensatz_weil_dass.txt` (bu klasörde; gerçek adı `weil-dass.txt` olur).
Başvuru denetleyicisi: `pruef_grammatik.py` (bu klasörde; `python3 -I pruef_grammatik.py <dosya> <repo kökü>`). `tools/build.py` aynı kuralları uygulamalı.
Araştırma gerekçeleri: alt bölüm 13 ve araştırma raporu.

---

## 1. Genel

- UTF-8. `#` ile başlayan satır yorumdur. Boş satır serbesttir.
- Alan ayırıcı: ` | ` (dikey çizgi). İçerikte `|` geçmez.
- Dosya adı = `@id` (küçük harf, rakam, tire): `weil-dass.txt`, `passiv.txt`.
- **Alıştırma kimliği dosyadaki sırasıdır** (yalnız alıştırma satırları sayılır; `@` ve `#` satırları sayılmaz). Log kimliği: `g:<id>:<sıra>`, ör. `g:weil-dass:7`.
  - Yeni alıştırma **hep dosyanın sonuna** (son `@teil` altına ya da yeni bir `@teil` açarak sona) eklenir.
  - Var olan satırı düzeltmek serbesttir (yazım düzeltmesi, ek doğru cevap, daha iyi açıklama); satır silinmez, yer değiştirmez.
  - Kaldırmak için tür adının önüne `-` konur (`-luecke | …`): satır sayılır ama gösterilmez.
- Kelime sırası `@teil` grupları içinde görsel düzen içindir; uygulama alıştırmaları teil koduna göre seçer, dosya sırasına göre değil.

## 2. Başlık satırları

| Anahtar | Zorunlu | Biçim / örnek | Uygulamada |
|---|---|---|---|
| `@id` | evet | `weil-dass` | konu kartı `g:weil-dass` |
| `@titel` | evet | `Nebensätze mit weil und dass` | başlık (Almanca) |
| `@tr` | evet | `Yan cümle: weil (çünkü) ve dass (-dığını / ki)` | başlık altı |
| `@stufe` | evet | `A2`, `B1`, `A2–B1` | süzgeç, sıralama |
| `@kapitel` | hayır | `B1 K10` · `A2 giriş · B1 K1–4 tekrar ?` (`?` = doğrulanmadı) | aktif Kapitel'in konuları önce açılır |
| `@goethe` | evet | `3 \| Schreiben 1-2-3 · Sprechen 1-2` | önem: 3 = neredeyse her yazma/konuşma görevinde gerekir; 2 = sık; 1 = daha çok anlama (Lesen/Hören) ya da çeşitlilik artısı |
| `@voraus` | hayır | `perfekt, modalverben` (konu id'leri, virgülle) | önce bunlar açılmış olmalı |
| `@kontrast` | hayır | `konnektoren-deshalb-trotzdem` | "ayırt et" setleri (bkz. 10.5) |
| `@etiket` | hayır | `kelime sırası` | varsayılan hata etiketi (log `notiz`) |
| `@kurz` | evet | tek satır kural özeti | tanıtım başı, yanlıştan sonra, konu listesinde |

## 3. Bloklar

```
@erklaerung
Türkçe serbest metin. Boş satır = yeni paragraf. "1." ile başlayan satırlar numaralı liste.
Metinde geçen her Almanca isim artikelli yazılır: der Nebensatz, die Konjunktion.
@ende

@tabelle <tablo başlığı>
sütun | sütun | sütun          ← ilk satır başlık
değer | değer | değer
@ende

@beispiel <Almanca cümle> | <Türkçesi>     ← istenen sayıda; tanıtımda ve yanlıştan sonra gösterilir
```

- Açıklama kısa tutulur (ekranda kaydırmadan okunacak kadar, ~120–200 kelime): kural, Türkçeyle benzerlik/fark, sınavda nerede gerektiği, konuşma dili tuzağı (varsa).
- Tablolarda bir satırın sütun sayısı başlıkla aynı olmalı.

## 4. Alt kural (teil)

```
@teil <kod> | <Türkçe ad> | <hata etiketi>
```

- `kod`: küçük harf/rakam/tire, dosyada tek (`v-end`, `modal`, `perfekt`, `vorn`, `kontrast`).
- Altındaki her alıştırma bu teil'e aittir. Hata etiketi, log'daki mevcut etiketlerle aynı sözcükler olmalı: `kelime sırası`, `yardımcı fiil`, `dönüşlü zamir`, `edat`, `artikel/çekim`, `hâl`, `bağlaç`, `zaman`.
- Her konuda en az 3 teil; her teil'de en az 2 (tercihen 3+) alıştırma. Karıştırılan iki yapı için bir `kontrast` teil'i önerilir.

## 5. Alıştırma satırı (8 alan)

```
tür | zorluk | soru | cevap | seçenek/hata | Türkçe | açıklama | kelimeler
```

Ortak alanlar:

- **zorluk**: `1` tanıma (seçmeli; anlamı ya da biçimi fark etmek), `2` kontrollü üretim (boşluğu yazmak, dizmek, tek hatayı düzeltmek), `3` dönüştürme / tam cümle üretimi / ince hata.
- **cevap**: doğru cevap; birden çok doğru varsa ` / ` ile ayrılır (ilk yazılan "asıl" çözümdür, düzeltmede o gösterilir).
- **Türkçe**: cümlenin doğal Türkçesi (ipucu; z1'de hep görünür, z2–3'te "ipucu" ile açılır, açılırsa `ipucu:1` loglanır).
- **açıklama**: cevaptan sonra gösterilen en çok iki cümle: neden böyle. Yanlış cevapta `@kurz` ile birlikte.
- **kelimeler**: `;` ile ayrılmış kelime anahtarları; `quellen/verben.txt`, `nomen.txt`, `nomen_extra.txt`, `woerter.txt`, `uniteN.txt` anahtarlarıyla birebir aynı (`anfangen mit`, `der Kurs`, `sich anstrengen`). Boş olabilir. Build bulunamayan anahtarı uyarır.

Türlere göre:

| tür | soru | cevap | 5. alan | ekranda |
|---|---|---|---|---|
| `luecke` | `___` içeren cümle; sonda `(…)` = mastar / yapı ipucu: `(arbeiten · Perfekt)` | boşluğun içeriği. Birden çok boşlukta parçalar ` ; ` ile: `habe ; gearbeitet` | boş → **yazarak**; ` / ` ile seçenekler → **seçmeli** (yalnız tek boşlukta) | boşluk kutusu ya da seçenek düğmeleri |
| `wahl` | boşluklu cümle ya da soru (`Welcher Satz ist richtig?`) | seçeneklerden tam olarak biri | 2–4 seçenek, ` / ` ile (tam cümle olabilir) | düğmeler, karışık sırada |
| `ordnen` | parçalar ` / ` ile; küçük harfle (isim ve `Sie` büyük), noktalama yok; parça birden çok kelime olabilir (`ich finde`, `vom Bahnhof`) | dizilmiş tam cümle(ler); serbest sıralar alternatif olarak yazılır | boş | dokunarak dizme; ilk harf ve noktalama otomatik |
| `fehler` | bir cümle (hatalı ya da doğru) | doğru tam cümle | soruda aynen geçen **hatalı kısım**; cümle doğruysa `-` | 1) hatalı yere dokun ya da "hata yok" de, 2) doğrusunu yaz (z1–2'de yalnız 1. adım yeter) |
| `umform` | kaynak cümle(ler) + ` → ` + hedef | dönüştürülmüş cümle(ler) | boş | kaynak + Türkçe yönerge, yazma kutusu |

`umform` hedefleri (uygulama Türkçe yönergeye çevirir):

| hedef | yönerge |
|---|---|
| `weil`, `dass`, `obwohl`, `wenn`, `als`, `damit`, `um … zu`, `ob` … | "… ile birleştir" |
| `Weil …` (büyük harf + `…`) | "… ile başlayarak birleştir" (cevap bununla başlamalı) |
| `Passiv`, `Perfekt`, `Präteritum`, `Plusquamperfekt`, `Futur` | "… yap" |
| `indirekt` | "dolaylı soru yap (Können Sie mir sagen, …)" |
| `Relativsatz` | "ilgi cümlesiyle tek cümle yap" |
| `Konjunktiv II` | "kibar / dilek cümlesi yap" |

Denetim kuralları (build ve `pruef_grammatik.py`): 8 alan; tür ve zorluk geçerli; `luecke`'de `___` sayısı = cevap parça sayısı; seçenekli `luecke` / `wahl`'da cevap seçenekler arasında; `ordnen` parçalarının kelimeleri = cevabın kelimeleri; `fehler`'de hatalı kısım soruda geçer ve soru ≠ cevap (`-` ise soru = cevap); `umform`'da ` → ` var; zorunlu başlıklar ve `@erklaerung` var.

## 6. İçerik yazma kuralları (Claude için)

1. Konu başına **en az 20** alıştırma; her tür en az 2; zorluk dağılımı kabaca z1 %20–30, z2 %45–55, z3 %20–30.
2. `fehler` alıştırmalarının yaklaşık dörtte biri **hata yok** (`-`): "her cümlede hata var" alışkanlığı olmasın.
3. Çeldiriciler gerçek hatalardan: Türkçe aktarımı (`weil ich bin krank`), Tuna'nın log'undaki hatalar (`gestreitet`, `verlauft`, `Ihren`), karışan yapı (`denn`/`weil`). Saçma çeldirici yok.
4. z1 seçimleri **anlam işletmeli** (processing instruction): doğru seçenek ancak cümlenin anlamına ya da bir ipucuna bakarak bulunur (`denn` mi `weil` mi: arkadaki fiilin yerine bak; Passiv: "işi kim yapıyor?").
5. Kelimeler Goethe B1 listesinden ve öğrencinin gördüğü kelimelerden; aktif ünitenin/Kapitel'in kelimeleri tercih edilir. Cümleler doğal, B1, kısa (≤ 14 kelime; `umform`'da iki kaynak cümle).
6. Emin olunmayan Almanca yazılmaz. Serbest kelime sırası olan cümlelerde bütün doğal sıralar cevapta listelenir.
7. Konuşma dili biçimleri (weil + fiil 2. yerde, `wegen` + Dativ) açıklamada anılır; yazılı sınav ölçütüne göre cevap kabul edilmez (wegen + Dativ: `fast`).
8. Türkçe doğal olur ("hasta olduğum için"), kelime kelime çeviri değil. Açıklamada geçen Almanca isimler artikelli.

## 7. Cevap kontrolü

Karşılaştırmadan önce: baş/son boşluk ve çoklu boşluk atılır, sondaki `. ! ?` atılır, cümlenin ilk harfi küçük/büyük fark etmez.

| sonuç | ne zaman |
|---|---|
| `richtig` | cevap alternatiflerden biriyle aynı |
| `fast` | hedef yapı doğru, yalnız: büyük/küçük harf, umlaut/ß yerine `ae/oe/ue/ss`, eksik virgül, hedef dışı bir kelimede tek harf yazım hatası |
| `falsch` | hedef yapı yanlış: kelime sırası, yardımcı fiil, çekim, zamir, bağlaç, hâl. `luecke`'de boşluğun içeriği dilbilgisel olarak farklıysa (`hat` ≠ `habe`) |

- `umform` ve uzun `ordnen` cevabı alternatiflere uymazsa sistem `falsch` önerir; Tuna kendi notunu verir (1/2/3, kural 8: not sonrası direkt sonraki soru). Not öneriden farklıysa `öneri:X` loglanır. "Sonuçlarıma bak"ta Claude bu satırları inceler; doğru olan yeni bir sıralamayı ilgili satırın cevabına alternatif olarak ekler.
- Mevcut `js/grammatik.js` karşılaştırma yardımcıları (umlaut / büyük harf / yazım farkı) yeniden kullanılır.

## 8. Log (`log/log.csv`)

| durum | modus | id | item | frage | antwort | ergebnis | loesung | notiz |
|---|---|---|---|---|---|---|---|---|
| alıştırma | `gram` | `g:weil-dass:7` | `weil-dass/perfekt` | gösterilen soru | yazdığı / seçtiği | `richtig` `fast` `falsch` | asıl cevap | `tür:luecke \| z:2 \| kelime sırası \| ghost:1 \| ipucu:1 \| öneri:falsch \| sek:12` |
| tanıtım | `gram` | `g:weil-dass` | konu | `tanıtım` | | `neu` | | `sek:N` (okuma süresi) |
| set sonu | `gram` | `g:weil-dass` | konu | `tekrar` / `giriş` / `kontrast` | | `richtig`/`fast`/`falsch` (= set notu) | | `puan:2.5/3 \| teil:v-end,modal,vorn` |
| takılma | `leech` | `g:weil-dass:vorn` | konu/teil | | | `takiliyor` | | |

## 9. Hafıza modeli

- **Konu kartı** `g:<id>`: tek FSRS kartı (mevcut `js/fsrs.js`, hedef hatırlama `S.einst.ret`). Konu "biliyor muyum" sorusunun tek cevabı budur.
- **Teil istatistiği** `S.gram[id].teil[kod] = {d, y, son}` (doğru, yanlış, son görülme): hangi alt kuralın zayıf olduğunu söyler, kart değildir.
- **Alıştırma geçmişi** `S.gram[id].gesehen[sıra] = tarih`: aynı alıştırmanın yakında dönmemesi için.
- **Hayaletler** `S.gram.ghost["<id>:<teil>"] = {adim, due, son}` (bkz. 10.4).

## 10. Aralıklı tekrar kuralları

### 10.1 Konu açma
- Açılış sırası: aktif Kapitel'in konuları (`@kapitel` eşleşmesi) → `@goethe 3` konular → diğerleri. `@voraus` konuları açılmamışsa önce onlar.
- Haftada en çok **2** yeni konu. Birikme sınırı aşıldıysa (`rueckstand > stauGrenze`) yeni konu açılmaz (kelimedeki kuralla aynı).
- Tuna Gramer listesinden bir konuyu elle de açabilir.

### 10.2 Tanıtım (bloklu)
1. `@kurz` → `@erklaerung` → `@tabelle`'ler → `@beispiel`'ler.
2. **Giriş seti**, 5 alıştırma, aynı konudan: 2 × z1, 2 × z2, 1 × z3; mümkünse her biri farklı teil.
3. Set puanı ilk FSRS notudur (10.3'teki çeviri). Öğrenme adımları: ~10 dk sonra aynı oturumda 1 alıştırma (en zayıf teil), ertesi gün 3'lü set, sonra FSRS takvimi.

### 10.3 Tekrar seti (konu vadesi gelince)
Bir tekrar = **3 alıştırma**, her tekrarda başka alıştırma:

- **Teil**: 1) en zayıf teil (başarı `(d+1)/(d+y+2)` en düşük), 2) en uzun süredir görülmeyen teil, 3) kalanlardan rastgele. Hayaleti açık teil bu sete girmez (hayalet kendi yolunda döner).
- **Zorluk**, konu kartının kararlılığına (S, gün) göre: S < 4 → z1–z2 (en az biri z2); 4 ≤ S < 21 → z2–z3 (en az biri z3); S ≥ 21 → en az ikisi z3 / üretim (`umform`, `fehler`, `ordnen`, yazarak `luecke`).
- **Tür**: üç farklı tür; en az biri yazarak; `wahl` en çok 1.
- **Alıştırma**: son 14 günde görülmemiş olan; hepsi görüldüyse en eski görülen. Kelimeleri (`kelimeler`) görülmüş olan alıştırma önce; görülmemiş kelime varsa altında anlamı gösterilir.
- **Not**: richtig = 1, fast = 0,5, falsch = 0. Toplam ≥ 2,5 → 3 (doğru); ≥ 1,5 → 2 (küçük hata); daha az → 1 (yanlış). FSRS set başına **bir kez** güncellenir.

### 10.4 Hayalet (yanlışın kısa süreli dönüşü)
Bunpro'daki "ghost" fikrinin uyarlaması: yanlış yapılan **alt kural**, ana takvimden bağımsız olarak kısa aralıkla yeniden sorulur.

- Açılış: `falsch` alınan her alıştırma; üretim türlerinde (`umform`, `ordnen`, yazarak `luecke`) `fast` da. Hayalet **teil** içindir, cümle için değil.
- Adım 1: aynı oturumda, en az 8 başka sorudan (ve ≥ 5 dk) sonra, aynı teil'den **başka** bir alıştırma (yoksa aynısı).
- Adım 2: ertesi gün (günün kuyruğunda öncelikli). Adım 3: 3 gün sonra.
- Art arda **2 doğru** → hayalet silinir. Hayalette yanlış → adım 1'e döner (oturumda bir teil için en çok bir kez).
- 4 denemede kapanmazsa ya da teil üç ayrı günde yanlışsa → `leech` satırı (`takiliyor`): o teil'in açıklama satırı + tablo yeniden gösterilir; "Sonuçlarıma bak"ta Claude o teil'e 3–5 yeni alıştırma ve gerekirse kanca (`daten/kancalar.js`, anahtar `g:<id>:<teil>`) yazar.
- Hayalet cevapları konu kartının FSRS'ini değiştirmez (ilk yanlış zaten set notunda). Aynı anda en çok **6** hayalet; fazlası açıldığında en eskisi kapatılır ve konu kartının vadesi yarına çekilir.

### 10.5 Karıştırma (interleaving) ve ayırt etme
- İlk tanıtım bloklu; sonraki bütün tekrarlar karışık. Gramer bölümünde birden çok konu vadeliyse alıştırmalar konular arasında dönüşümlü sorulur (A, B, C, A, …); aynı konudan art arda en çok 2.
- `@kontrast` ile bağlı iki konu ikisi de açıksa haftada bir **ayırt et seti**: iki konudan karışık 4 alıştırma, ağırlık `wahl`/`luecke` seçmeli ve `kontrast` teil'leri. Öneriler: weil / denn / deshalb · obwohl / trotzdem · als / wenn · dass / das · werden (Passiv / Futur / würde) · Wechselpräposition Akk / Dat · Relativpronomen / Artikel · Perfekt haben / sein.

### 10.6 Çalış akışında
- Vadeli konu tekrarları Çalış'a "gramer kartı" olarak girer: günde en çok **3 set** (≈ 9 alıştırma); tür dengesinde "cümle" sayılır; aynı tür en fazla 2 kez üst üste kuralı geçerli.
- Hayalet adım 1'leri Çalış'ta da araya girer (tek alıştırma).
- "Gramer" odak bölümünde sınır yok; günlük sayaç `tage[gün].modi.gram`.

## 11. Build önerisi

`tools/build.py`: `quellen/grammatik/*.txt` → `daten/grammatik.js`:

```js
window.GRAMMATIK = { "weil-dass": {
  kopf: {titel, tr, stufe, kapitel, goethe: {stufe: 3, wo: "…"}, voraus: [], kontrast: [], etiket, kurz},
  erklaerung: "…", tabellen: [{titel, kopf: [], zeilen: [[]]}], beispiele: [[de, tr]],
  teile: {"v-end": {name, etiket}},
  uebungen: [{n: 1, tur, z, teil, soru, cevap: [], opt: [] | hata, tr, aciklama, woerter: [], aus: false}]
}}
```

Denetim hatası (bölüm 5) build'i durdurur; dağılım kuralları (bölüm 6) uyarıdır. `index.html` / `sw.js` önbellek listesine `daten/grammatik.js` eklenir.

## 12. Konu kataloğu (öneri)

Kapitel = Netzwerk neu (B1 K1–12; `?` = doğrulanmadı). Goethe: 1–3 (bölüm 2). Öncelik: Tuna için (1 = önce).

| id | konu | Kapitel | Goethe | öncelik |
|---|---|---|---|---|
| `v2-satzbau` | Ana cümlede fiil 2. yerde, inversion, Satzklammer, soru | A1–A2 | 3 | 1 |
| `weil-dass` | weil / dass yan cümle | A2 · B1 tekrar ? | 3 | 1 |
| `perfekt` | Perfekt: Partizip II, haben / sein | A1–A2 | 3 | 1 |
| `reflexiv` | Dönüşlü fiiller (Akk / Dat zamir, yeri) | B1 K8 | 2 | 1 |
| `trennbar` | Ayrılabilen fiiller (ana / yan cümle, Perfekt, zu) | A1–A2 | 2 | 1 |
| `konjunktiv2` | Konjunktiv II: würde, hätte, wäre, könnte, sollte (rica, öneri, tavsiye, dilek) | A2 · Vergangenheit B1 K5–8 ? | 3 | 1 |
| `konnektoren-deshalb-trotzdem` | deshalb, trotzdem, denn, sonst, außerdem, deswegen | B1 K2 (deshalb, so dass) | 3 | 2 |
| `obwohl-wenn` | obwohl / trotzdem, wenn / falls | A2–B1 | 3 | 2 |
| `zu-infinitiv` | Infinitiv mit zu, um … zu / damit | B1 K1–5 ? | 3 | 2 |
| `indirekte-fragen` | ob / W- dolaylı soru | A2 | 3 | 2 |
| `praep-verben` | Edatlı fiiller, wo(r)- / da(r)- | B1 K6 | 2 | 2 |
| `adjektiv` | Sıfat çekimi (belirli / belirsiz / artikelsiz) | A2 · artikelsiz B1 K9 | 2 | 2 |
| `negation` | nicht / kein, nicht … sondern, nicht'in yeri | B1 K9 | 1 | 2 |
| `passiv` | Passiv Präsens / Präteritum / Perfekt / Modalverb ile | B1 K10 | 2 | 2 |
| `relativ` | İlgi cümlesi (N / A / D / edatlı; was, wo) | B1 K6, K11 | 2 | 2 |
| `temporal` | als, wenn, nachdem, bevor, während, seit(dem), bis | B1 K7 | 2 | 3 |
| `praeteritum` | Präteritum (sein, haben, modal fiiller, sık düzensizler) | A2 | 2 | 3 |
| `plusquamperfekt` | Plusquamperfekt | B1 K7 | 1 | 3 |
| `zweiteilig` | zwar … aber, entweder … oder, weder … noch, nicht nur … sondern auch, sowohl … als auch | B1 K8 | 2 | 3 |
| `komparation` | Komparativ / Superlativ, so … wie, als | A2 · B1 K5–8 ? | 2 | 3 |
| `je-desto` | je … desto / umso | B1 K12 | 1 | 3 |
| `genitiv` | Genitiv; wegen, trotz, während, innerhalb, außerhalb | B1 K1–2 | 1 | 3 |
| `wechselpraep` | Wechselpräpositionen; stellen / stehen, legen / liegen | A2 | 2 | 3 |
| `lassen-brauchen` | lassen; nicht / nur brauchen … zu | B1 K2 (lassen) | 1 | 3 |
| `futur` | Futur I; werden'in üç işi | B1 K6 | 1 | 3 |
| `partizip-adj` | Partizip I / II sıfat olarak | B1 K12 | 1 | 4 |
| `nominal-adj` | Adların sıfattan türemesi (der Deutsche, etwas Neues); einer / keiner / irgendein | B1 K9–12 ? | 1 | 4 |
| `wortbildung` | Kelime türetme: -ung, -heit, -keit, -bar, -los | B1 K9 | 1 | 4 |
| (`ndek`) | n-Deklination: mevcut modül; gramer bölümünde yalnız açıklama + bağlantı | — | 1 | — |

## 13. Gerekçe (kısa)

- Açık kural + alıştırma örtük öğretimden etkili (Norris & Ortega 2000; Spada & Tomita 2010) → kısa Türkçe açıklama + tablo, hemen alıştırma.
- Girdi işletme (VanPatten) anlamayı, üretim alıştırması üretimi geliştirir (Shintani 2015) → z1 anlam işletmeli seçmeli, tekrarlar giderek üretim ağırlıklı (Tuna'nın hedefi yazma / konuşma).
- Karışık alıştırma gecikmeli testte bloklu alıştırmadan iyi (Nakata & Suzuki 2019); etki çok oturumlu eğitimde çıkıyor (Pan ve ark. 2019) → ilk tanıtım bloklu, tekrarlar karışık, kontrast setleri.
- Aralıklı tekrar (Kim & Webb 2022 meta-analizi) → konu kartı FSRS'te.
- Düzeltici geri bildirim etkili ve kalıcı (Li 2010; Lyster & Saito 2010; Kang & Han 2015) → hemen doğru biçim + neden + hayaletle kısa sürede yeniden üretim.
- Bunpro hayalet tekrarları: ürün pratiği, araştırması yok; geri çağırma + aralık ilkeleriyle uyumlu olduğu için alındı.
