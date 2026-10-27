# Gramer bölümü: içerik biçimi ve tekrar kuralları

Kaynak dosyalar: `quellen/grammatik/<id>.txt` (bir dosya = bir konu). Örnek: `weil-dass.txt` (sonunda her yeni türden birer örnek).
Denetleyici ve ayrıştırıcı: `pruef_grammatik.py` (bu klasörde; `python3 -I quellen/grammatik/pruef_grammatik.py [<dosya> …] [<repo kökü>]`, dosya verilmezse hepsi). `tools/build.py` bu dosyayı yükler: kurallar tek yerde.
Araştırma gerekçeleri: alt bölüm 13 ve araştırma raporu.

---

## 1. Genel

- UTF-8. `#` ile başlayan satır yorumdur. Boş satır serbesttir.
- Alan ayırıcı: ` | ` (dikey çizgi). İçerikte `|` geçmez.
- Dosya adı = `@id` (küçük harf, rakam, tire): `weil-dass.txt`, `passiv.txt`.
- **Alıştırma kimliği dosyadaki sırasıdır** (yalnız alıştırma satırları sayılır; `@` ve `#` satırları sayılmaz). Log kimliği: `g:<id>:<sıra>`, ör. `g:weil-dass:7`.
  - Yeni alıştırma **hep dosyanın sonuna** eklenir: son `@teil` altına, yeni bir `@teil` açarak ya da `@teil <kod>` (yalnız kod) ile daha önce tanımlanmış bir teil'e dönerek (bkz. 4).
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
- **Yeniden açma**: `@teil <kod>` (yalnız kod; ad ve etiket yok) daha önce tanımlanmış teil'e döner; sonraki alıştırmalar o teil'e ait olur. Böylece eski teil'lere alıştırma dosya **sonuna** eklenir, kimlikler (dosyadaki sıra) değişmez. Tanımsız kodla yalnız-kod satırı hatadır; tam satırı (`kod | ad | etiket`) ikinci kez yazmak da hata.

```
@teil v-end
ceviri | 2 | Bugün evde kalıyorum, çünkü hastayım. | Ich bleibe heute zu Hause, weil ich krank bin. | | - | … | bleiben; krank
```
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
| `ceviri` | Türkçe tam cümle | Almanca; alternatifler ` / ` ile (bütün doğal sıralar) | boş | "Almancası" yönergesi, Türkçe büyük, yazma kutusu. Türkçe alanı `-` |
| `text` | 2–4 cümlelik kısa metin; 2–5 boşluk `___`, her boşluğun ardından isteğe bağlı `(ipucu)`: `___ (werden · Perfekt)` | parçalar ` ; ` ile (boşluk sırasıyla), her parçada alternatifler ` / `: `studieren will ; geworden ist ; bestehe / bestehen werde` | boş | metin içinde küçük giriş kutuları; ipucu kutunun yanında küçük |
| `eslestir` | sol öğeler ` ;; ` ile (3–5; ör. cümle başları) | sağ öğeler ` ;; ` ile, **aynı sırada** doğru eşler | boş | sağ sütun karışık; sola dokun → sağa dokun eşler (eşlenen sönükleşir, yeniden dokununca eş bozulur). Türkçe alanı isteğe bağlı (`-`) |
| `kategori` | yönerge (`Dativ oder Akkusativ?`) | `grup adı: öğe, öğe ;; grup adı: öğe, öğe` (2–3 grup, toplam 4–8 öğe; öğe içinde `,` ve `;;` yok) | boş | öğeler karışık sırada, her öğenin yanında grup düğmeleri. Türkçe `-` olabilir |
| `dinle` | Almanca cümle (TTS ile okunur, **ekranda gösterilmez**) | aynı cümle (alternatifler ` / `) | boş | "Dinle" + "yavaş" düğmeleri, yazma kutusu; Türkçe alanı = Türkçesi (ipucu). Ses yoksa (TTS desteklenmiyorsa) bu tür seçilmez |

`umform` hedefleri (uygulama Türkçe yönergeye çevirir):

| hedef | yönerge |
|---|---|
| `weil`, `dass`, `obwohl`, `wenn`, `als`, `damit`, `um … zu`, `ob` … | "… ile birleştir" |
| `Weil …` (büyük harf + `…`) | "… ile başlayarak birleştir" (cevap bununla başlamalı) |
| `Passiv`, `Perfekt`, `Präteritum`, `Plusquamperfekt`, `Futur` | "… yap" |
| `indirekt` | "dolaylı soru yap (Können Sie mir sagen, …)" |
| `Relativsatz` | "ilgi cümlesiyle tek cümle yap" |
| `Konjunktiv II` | "kibar / dilek cümlesi yap" |

Yazarak / seçmeli: **yazarak** = `umform`, `ordnen`, `fehler`, `ceviri`, `dinle`, `text`, seçeneksiz `luecke`; **seçmeli** = `wahl`, seçenekli `luecke`, `eslestir`, `kategori`.

Denetim kuralları (build ve `pruef_grammatik.py`; hata build'i durdurur): 8 alan; tür ve zorluk geçerli; `luecke`'de `___` sayısı = cevap parça sayısı; seçenekli `luecke` / `wahl`'da cevap seçenekler arasında; `ordnen` parçalarının kelimeleri = cevabın kelimeleri; `fehler`'de hatalı kısım soruda geçer ve soru ≠ cevap (`-` ise soru = cevap); `umform`'da ` → ` var; `ceviri` / `text` / `eslestir` / `kategori` / `dinle`'de 5. alan boş; `ceviri` / `dinle`'de cevap boş değil, `dinle`'de soru cevaplardan biri (noktalama ve büyük harf hariç); `text`'te `___` sayısı = ` ; ` parça sayısı ve parça boş değil; `eslestir`'de sol ve sağ öğe sayısı eşit, 3–5, öğe tekrar yok; `kategori`'de 2–3 grup, her grubun adı ve ≥ 1 öğesi var, öğe ve grup adı tekrar yok; `@teil <kod>` yalnız tanımlı teil'e döner; zorunlu başlıklar ve `@erklaerung` var. Uyarı (durdurmaz): `text` 2–5 boşluk dışında, `kategori` toplam 4–8 öğe dışında.

## 6. İçerik yazma kuralları (Claude için)

1. Konu başına **en az 50** alıştırma. Tür başına en az: `ceviri` 6, `text` 3, `dinle` 3, `eslestir` 2, `kategori` 2 (`eslestir` / `kategori` konuya uymuyorsa 1); eski türler (`luecke`, `wahl`, `ordnen`, `fehler`, `umform`) her biri 4. Zorluk dağılımı kabaca z1 %20–30, z2 %45–55, z3 %20–30. Build bu dağılımı konu başına tek satır **uyarı** olarak verir (hata değil).
   - `ceviri`: Türkçe doğal ve tek anlamlı olsun (hedef yapıyı zorlasın: "hasta olduğum için" → weil); bütün doğal Almanca sıralar cevapta.
   - `text`: 2–4 cümle, bağlamlı küçük bir sahne; boşluklar konunun hedef yapısında (çekimli fiil, bağlaç …), ipucu mastar / zaman.
   - `eslestir`: eşleşme ancak dilbilgisiyle tek olmalı (weil → `ich Fieber habe`, denn → `ich habe Fieber`); anlamca da uyan ikinci eş varsa öğeyi değiştir.
   - `kategori`: gruplar konunun ayırt ettiği şey (Dativ / Akkusativ, fiil sonda / 2. yerde …); öğe tek gruba ait olmalı.
   - `dinle`: ≤ 12 kelime, hedef yapı duyulunca fark edilecek yerde (dass / das, hab / habe); sayı ve özel ad yerine kelime.
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

Yeni türler:

| tür | richtig | fast | falsch |
|---|---|---|---|
| `ceviri` | `umform` gibi (`G.pruefen`, alternatifler) | yazım / umlaut / büyük harf | hedef yapı yanlış; alternatiflere uymazsa Tuna kendi notunu verebilir (`öneri:`) |
| `text` | bütün boşluklar doğru | doğru (ya da küçük hatalı) boşluk oranı ≥ 0,5 | oran < 0,5 |
| `eslestir` | bütün eşler doğru | bir karışıklık (en çok 2 yanlış eş: iki eşin yer değiştirmesi) | daha fazlası |
| `kategori` | bütün öğeler doğru grupta | 1 yanlış öğe | 2 ve üstü |
| `dinle` | noktalama ve büyük/küçük harf yok sayılarak aynı | umlaut/ß yazımı; ya da tek kelimede tek harf (kelime ≥ 5 harf ve son iki harf aynı: çekim değil) | kısa kelimede fark (`das`/`dass`, `hab`/`habe`), sıra, eksik kelime |

- `umform`, `ceviri` ve uzun `ordnen` cevabı alternatiflere uymazsa sistem `falsch` önerir; Tuna kendi notunu verir (1/2/3, kural 8: not sonrası direkt sonraki soru). Not öneriden farklıysa `öneri:X` loglanır. "Sonuçlarıma bak"ta Claude bu satırları inceler; doğru olan yeni bir sıralamayı ilgili satırın cevabına alternatif olarak ekler.
- Mevcut `js/grammatik.js` karşılaştırma yardımcıları (umlaut / büyük harf / yazım farkı) yeniden kullanılır.

## 8. Log (`log/log.csv`)

| durum | modus | id | item | frage | antwort | ergebnis | loesung | notiz |
|---|---|---|---|---|---|---|---|---|
| alıştırma | `gram` | `g:weil-dass:7` | `weil-dass/perfekt` | gösterilen soru | yazdığı / seçtiği | `richtig` `fast` `falsch` | asıl cevap | `tür:luecke \| z:2 \| kelime sırası \| ghost:1 \| ipucu:1 \| öneri:falsch \| sek:12` |
| (yeni türler) | `gram` | `g:weil-dass:35` | | soru alanı (dinle: okunan cümle) | `text`: parçalar ` ; ` · `eslestir`: `sol → seçtiği sağ ;; …` · `kategori`: `grup: öğe, öğe ;; …` · `ceviri` / `dinle`: cümle | | antwort ile aynı biçimde (`eslestir`: `sol → doğru sağ ;; …`) | `tür:ceviri` … |
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
- **Tür**: üç farklı tür (teil tercihinden önce gelir); en az biri yazarak (`ceviri`, `dinle`, `text`, `umform`, `ordnen`, `fehler`, seçeneksiz `luecke`); `eslestir` / `kategori` seçmeli sayılır ve sette bunlardan en çok 1. Giriş setinde de `eslestir` + `kategori` en çok 1.
- **Alıştırma**: son 14 günde görülmemiş olan; hepsi görüldüyse en eski görülen. Kelimeleri (`kelimeler`) görülmüş olan alıştırma önce; görülmemiş kelime varsa altında anlamı gösterilir.
- **Not**: richtig = 1, fast = 0,5, falsch = 0. Toplam ≥ 2,5 → 3 (doğru); ≥ 1,5 → 2 (küçük hata); daha az → 1 (yanlış). FSRS set başına **bir kez** güncellenir.

### 10.4 Hayalet (yanlışın kısa süreli dönüşü)
Bunpro'daki "ghost" fikrinin uyarlaması: yanlış yapılan **alt kural**, ana takvimden bağımsız olarak kısa aralıkla yeniden sorulur.

- Açılış: `falsch` alınan her alıştırma; yazarak türlerde (`umform`, `ordnen`, `fehler`, `ceviri`, `dinle`, `text`, yazarak `luecke`) `fast` da. Hayalet **teil** içindir, cümle için değil.
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
- (28.10) Ana tur (`akis`) adım 5 ve 10'da en çok 2 gramer sorusu (`Kern.sec` → `{ tur: 'gram' }`): `Gramer.turSorusu` açık konuların hazır hayaletlerinden, yoksa vadeli konulardan (en eski vade önce; bir konu turlarda günde ≤ 3) **yalnız yazarak** türde tek alıştırma seçer (seçeneksiz `luecke`, `umform`, `ceviri`, `ordnen`, `fehler`). Konu kartı değişmez (vade yalnız set ile); teil istatistiği ve hayalet yazılır; log notiz `tur:akis | …`.

### 10.7 B1 sprinti: tanı testi ve sprint sırası (28.10 → 9.11.2026)
- `S.sprint = { hedef, son_yeni, acik }`. Sprint açık ve bugün < `hedef` iken: günde en çok **1** yeni konu (günün bloğu bitince isteğe bağlı +1; testten açılanlar sayılmaz), haftada 2 sınırı yok; `son_yeni`'den sonra yeni konu yok. Konu vadesi en çok max(2, %40 × hedefe kalan gün) (set sonunda kısaltılır).
- **Sprint sırası** (`Gramer.SPRINT_SIRA`, yalnız var olan dosyalar): verbstellung, satzklammer-tekamolo, nebensatz-satzbau, weil-dass, negation, zweiteilig, konnektoren-deshalb-trotzdem, nominal-verbal, vergleich, es-korrelat, relativ, adjektiv, praep-verben, praep-nomen-adj, zu-infinitiv, damit-um-zu, passiv, konjunktiv2, genitiv, n-deklination, partizip-adj, perfekt, praeteritum, reflexiv, wortbildung; sonra kalanlar Goethe önemine göre. Sıradaki yeni konu = sırada testte `zayif` (test bittiyse denenmemiş de) ilk kapalı konu; testte `biliyor` olanlar atlanır. `@voraus` sprintte zorunlu değil.
- **Tanı testi**: bütün konular (yeni dosyalar kendiliğinden girer), sprint sırasıyla. Konu başına uyarlamalı: 1 yazarak alıştırma (z2; seçeneksiz `luecke`, `umform`, `ceviri`, `ordnen`), doğruysa 2. (z3, başka teil). İkisi de ipucusuz `richtig` → `biliyor`, değilse `zayif`. Oturum ~25 madde, kaldığı yerden; "Bilmiyorum" var, itiraz / öz-not yok; cevaptan sonra doğrusu ve kural gösterilir.
- Sonuç: `biliyor` → konu açılır, kart **kısa**: S ≤ 5, ilk tekrar 4–5 gün sonra (bedava seviye yok: uzun vade ancak tekrar setiyle). `zayif` → sprint sırasına; açık konuysa vadesi yarına çekilir. Yanlış teil'ler: açık konuda hemen hayalet, kapalı konuda konu açılıp giriş seti bitince hayalet (ertesi gün, adım 2).
- **Günün bloğu** (`Gramer.blokBaslat`): test bitmediyse test oturumu; yoksa vadeli konuların karışık tekrarı (en çok 5 konu, vadesi en eski önce, araya en çok 3 hazır hayalet) → bugünün yeni konusu (tanıtım + giriş seti). `sprintDurum().bugunYapildi` = bugün bir test oturumu ya da en az bir set bitti.
- Açılış göçü: kartı olmayan ve bir günden eski açılış (giriş seti yapılmamış) kapatılır (`yarim` sayacı); kartsız konu vadeli sayılmaz.

## 11. Build önerisi

`tools/build.py`: `quellen/grammatik/*.txt` → `daten/grammatik.js`:

```js
window.GRAMMATIK = { "weil-dass": {
  kopf: {titel, tr, stufe, kapitel, goethe: {stufe: 3, wo: "…"}, voraus: [], kontrast: [], etiket, kurz},
  erklaerung: "…", tabellen: [{titel, kopf: [], zeilen: [[]]}], beispiele: [[de, tr]],
  teile: {"v-end": {name, etiket}},
  uebungen: [{n: 1, tur, z, teil, soru, cevap: [], opt: [] | hata, tr, aciklama, woerter: [], aus: false,
              parcalar: [[alt, …], …] /* text */, sol: [], sag: [] /* eslestir */, gruplar: [{ad, oge: []}] /* kategori */}]
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
