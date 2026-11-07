# Kelime ve fiil kalıcı nasıl öğrenilir: araştırma + uygulama teşhisi (kelime-1, 6.11.2026)

## 0. Kısa sonuç

1. **Şikâyetler doğru ve kodda kanıtı var.** TR→DE seçmelide (`optionenDE`, js/app.js 581) isimde bir çeldirici *aynı kelimenin yanlış artikelli hâli*, fiilde *aynı fiilin yanlış edatlısı*. Aynı kelime iki şıkta geçince cevap o ikisinden biri olmak zorunda: kelimeyi hatırlamaya gerek kalmıyor, soru 50/50'lik artikel sorusuna dönüyor. Log'da seçmelideki 50 yanlışın 42'si bu "aynı kelime, yanlış artikel" şıkkı; anlam yanlışı yalnız 8 (son 14 günde 327 seçmelide %93 doğru). Diğer çeldiriciler büyük bir konudan ya da sözlükten rastgele geliyor, anlamca uzak oldukları için elenebiliyorlar.
2. **Hafıza modeli seçmeliyi gerçek hatırlama sayıyor ve kendini kandırıyor.** Seçmelide doğru cevap S'yi büyütüyor (yalnız ofset 1,5 ile frenli). Sonuç: model yazma sorularında doğru olma olasılığını ortalama **R = 0,91** tahmin ediyor, gerçek tam doğru oranı **%54** (yazım/küçük hata dahil ~%70). Cümlede boşlukta tahmin 0,90, gerçek %51. Doğru bir seçmeliden sonra gelen yazma sorusu yalnız %59 doğru (182 durumdan 108'i).
3. **Seçmelilerin çoğu "özel yuvalardan" geliyor**, merdivenin kendisinden değil: 428 seçmelinin 104'ü ısınma, 83'ü yanlıştan sonra aynı turda yeniden sorma (`tekrar:1`), 62'si parti, 60'ı kurtarma, 26'sı akşam; yalnız 93'ü normal vadeli soru. Örneğin S = 59 gün olan `die Diskussion` ısınmada seçmeli soruldu. Yazmada yanlış yapılan kelime aynı turda seçmeliyle "kurtarılıyor" ve doğru sayılıyor.
4. **Aynı ipucu, aynı cevap.** v5'ten beri (23.10'dan sonra) cümlede boşluk sorularında aynı cümle tekrarlanmamış (109 sorunun hepsi farklı), ama yazma sorusunun ipucu hep aynı Türkçe karşılık. Örneğin "eşit haklılık (kadın–erkek eşitliği)" 10 kez soruldu: 8 seçmelide doğru, 2 yazmada yanlış. Tuna "cevabı ezberliyorum" derken bu "ipucu → cevap" eşleşmesini anlatıyor. Çalışılan 276 öğenin 35'inin 0–1, 58'inin 2 kendi cümlesi var.
5. **Literatür açık:** üretimle hatırlama (L1→L2, yazma ya da söyleme) konuşma için gereken bilgiyi kuran asıl etkinlik. Seçmeli yalnız çeldiriciler *rekabetçi* olduğunda işe yarıyor. Hatırlamada ipucunu değiştirmek (variable retrieval) kalıcılığı artırıyor. Kelimeyi kalıp olarak (fiil + edat + tipik nesne) öğrenmek konuşmaya aktarılıyor. Sesli üretmek (production effect) hafızayı küçük ama güvenilir biçimde güçlendiriyor.

---

## 1. Araştırma: ne biliniyor (etki büyüklükleriyle)

### 1.1 Aralıklı tekrar (spacing)
- **Cepeda vd. 2006** (Psych. Bulletin, 317 deneyin meta-analizi): aralıklı çalışma toplu çalışmadan güvenilir biçimde iyi. **Cepeda vd. 2008** (N > 1.350): en iyi aralık, ne kadar süre hatırlamak istediğine bağlı. 1 haftalık hedefte aralık hedef sürenin ~%20–40'ı, 1 yıllık hedefte ~%5–10'u olmalı. Yani aylarca hatırlamak için aralıklar haftalarla ölçülmeli. 60 günlük üst sınır makul.
- **Kim & Webb 2022** (Language Learning 72(1), ikinci dil öğrenmede aralıklı tekrar meta-analizi, 48 deney, N = 3.411): etki orta-büyük. Kısa aralık hemen yapılan testte uzun aralıkla eşit, gecikmeli testte geride kalıyor. Eşit ve genişleyen aralık takvimleri arasında fark yok. Etki kelimede gramerden güçlü. (Toplam etkinin "küçük-orta" diye aktarıldığı kaynaklar da var; tam sayıyı doğrulayamadım.)
- **Kornell 2009**: katılımcıların ~%90'ı aralıklı çalışmada daha iyiydi, ama ~%72'si toplu çalışmayı daha etkili sandı. Kolay gelen tekrarın "biliyorum" hissi yanıltıcı.
- Uygulamaya anlamı: FSRS zamanlaması doğru yaklaşım. Sorun aralıklarda değil, aralıkları besleyen notta (bkz. 2.2).

### 1.2 Geri çağırma (testing effect), kaç kez, ne biçimde
- **Karpicke & Roediger 2008** (Science; Svahili–İngilizce kelimeler): öğrenilen kelimeyi tekrar okumak yerine tekrar sınamak 1 hafta sonra ~%80'e karşı ~%36 hatırlama getirdi.
- **Adesope vd. 2017** (Rev. Educ. Research, 272 etki büyüklüğü): alıştırma testi g ≈ 0,61. Seçmeli formatta etki büyük çıkmış, ama yazarlar bunun "efor arttıkça kalıcılık artar" bulgularıyla çeliştiğini not ediyor. Biçim alt sonuçlarını tam metinden doğrulamadım.
- **Kang, McDermott & Roediger 2007**: geri bildirim verildiğinde kısa cevaplı (kendin üret) test, gecikmeli sınavda seçmeliden iyi.
- **Pyc & Rawson 2009** (retrieval effort hypothesis): zor ama başarılı geri çağırma (iki deneme arası daha uzun) daha kalıcı.
- **Nakata 2017** (SSLA): 5–7 geri çağırma, 1–3'ten iyi. Ama zaman başına verim azalıyor. **Rawson, Dunlosky & Sciartelli 2013** (successive relearning): oturum içinde birkaç kez *doğru hatırlayana* kadar çalış, sonra birkaç ayrı günde yeniden öğren. Bu, bugüne kadarki en sağlam kalıcılık reçetelerinden biri.
- **Pan & Rickard 2018** (Psych. Bulletin, transfer meta-analizi): test etkisinin başka biçimlere aktarımı ortalama d ≈ 0,40. Sınanan biçim ile kullanılacak biçim benziyorsa aktarım daha iyi. Konuşmada kullanılacak bilgi = L1 anlamdan L2 biçimi hızla üretmek.

### 1.3 Üretim (productive recall) ve tanıma
- **Laufer & Goldstein 2004** (Language Learning 54(3)): kelime bilgisi bir zorluk hiyerarşisi. Kolaydan zora: L2 biçimi tanıma, anlamı tanıma, anlamı hatırlama, **L2 biçimini hatırlama (active recall)**. Ders başarısını en iyi en zor basamak yordadı. Seçmeli doğru = en kolay basamak doğru.
- **Schneider, Healy & Bourne 2002** (JML 46): zor yönde (L1→L2) öğrenmek bir hafta sonraki unutmayı azalttı ve yeniden öğrenmede tasarruf sağladı ("zor koşulda öğrenilen zor unutulur"). **Steinel, Hulstijn & Steinel 2007** (SSLA): öğrenme yönü ile test yönü uyuşunca sonuç en iyi.
- **Nakata 2016** (IRAL): tanıma (seçmeli) biçim–anlam bağının *ilk kurulmasında* işe yarıyor, üretim (recall) yazılış/biçim bilgisinde daha iyi. Yani seçmeli ilk gün için iyi, sonrası için zayıf.
- **Webb, Yanagisawa & Uchihara 2020** (MLJ 104(4); 22 çalışma, 100 etki büyüklüğü): bilinçli kelime etkinliklerinin ortalama kazancı anında anlam hatırlamada ~%60, biçim hatırlamada ~%58,5; gecikmeli testte ~%39 ve ~%25'e düşüyor. Etkinlikler arası fark büyük (%18–77). En verimliler hatırlatan kartlar (flashcard). (TASARIM.md'de "flashcard %77, boşluk doldurma %43" yazıyor; etkinlik bazlı sayıları ben tam metinden doğrulamadım.)

### 1.4 Seçmeli ve çeldirici tasarımı
- **Little, Bjork, Bjork & Angello 2012** (Psych. Science): seçmeli, çeldiriciler *rekabetçi* (makul, neden yanlış olduğunu düşündüren) olduğunda kısa cevap kadar, hatta ondan iyi öğretiyor ve sorulmayan ilgili bilgiyi de güçlendiriyor. Bu fayda çeldiricilerin gerçekten rekabetçi olmasına bağlı.
- **Butler 2018** (JARMC): değerlendirme için iyi seçmeli kuralları öğrenme için de geçerli: 3–4 makul şık, "hiçbiri / hepsi" yok, şıklarda gereksiz karmaşıklık yok, cevaptan sonra geri bildirim.
- **Roediger & Marsh 2005**: çok sayıda ve çekici çeldirici yanlış bilgiyi besleyebilir (negative suggestion), geri bildirim bunu büyük ölçüde siler. Uygulamada geri bildirim var, 4 şık iyi.
- **Test yazım kuralları (Haladyna, Downing & Rodriguez 2002):** şıklar arasında ipucu olmamalı. "İki şık birbirinin varyantıysa cevap onlardan biridir" (convergence) bilinen bir test-bilgiçliği stratejisi. `optionenDE` tam olarak bunu üretiyor.
- Kelimeye özgü iyi çeldirici kaynakları: biçimce benzeyen kelimeler (Laufer 1997 "synforms": bekommen/bekämpfen, Verhalten/Verhältnis, vorstellen/darstellen), anlamca yakın aynı tür kelimeler ve **öğrencinin kendi hataları** (yazmada verdiği yanlış kelime).

### 1.5 Bağlam çeşitliliği, ipucu çeşitliliği
- **Butowska-Buczyńska, Kliś, Zawadzka & Hanczakowski 2024** (PNAS 121(44), 6 deney): yabancı kelimenin anlamı her geri çağırmada *farklı cümle ipucuyla* sorulunca, hep aynı ipucuyla sorulmasından daha iyi öğreniliyor. Fayda 24 saat sonra da var ve aralıklı çalışmada daha büyük. Öğrenciler aynı ipucunu daha etkili sanıyor (metabilişsel yanılsama). Doğrudan "cevabı ezberliyorum" sorununun ilacı.
- **van den Broek vd. 2018** (Language Learning): zengin bağlam anlamayı artırıyor, kalıcılığı ise bağlam desteği olmadan hatırlama getiriyor. Yani bağlam ipucu zamanla kalkmalı.
- Karşı not: bağlam sayısının (1 ya da 3 cümle) fark yaratmadığını bulan çalışmalar da var. Asıl etkin öğe *geri çağırmanın* değişen ipucuyla yapılması, cümle okutmak değil.

### 1.6 İstenen zorluklar, karışık sıralama
- İstenen zorluk (Bjork) = performansı o an düşüren ama kalıcılığı artıran zorluk: aralık, üretim, değişen ipucu. Başarısız deneme bile, ardından doğru cevap görülürse öğrenmeyi artırıyor (**Kornell, Hays & Bjork 2009**). Ama zorluk ancak başarılabiliyorsa "istenen" oluyor: %33 doğrulukla çalışan metin boşluğu (bkz. 2.5) fazla zor.
- **Brunmair & Richter 2019** (Psych. Bulletin, 59 çalışma): karışık sıralamanın genel etkisi g = 0,42. Ama *kelime* malzemesinde blok çalışma daha iyi çıktı (g = −0,39). Karışık sıralama, birbirine benzeyen kategorileri ayırt etmeyi öğretirken işe yarıyor (der/die/das ayrımı, edat ayrımı). Kelime türlerini karıştırmanın kendisi bir kazanç sayılmamalı.
- **Tinkham 1993/1997; Erten & Tekin 2008** (Türk öğrenciler): anlamca aynı kümedeki yeni kelimeleri (meyveler, renkler) birlikte tanıtmak karışmaya yol açıyor. Kümeyi birlikte tanıtmayıp sınavda çeldirici yapmak ise ayırt etmeyi çalıştırıyor. Uygulamada `karismaOk` (kern.js 424) bunu zaten tanıtımda engelliyor, bu doğru.

### 1.7 Anahtar kelime / hafıza kancası
- **Atkinson & Raugh 1975**: zor kelimede anında güçlü etki. **Wang, Thomas & Ouellette 1992**: bir hafta sonra kanca grubu ezber grubundan *daha çok* unuttu. **Wang & Thomas 1995**: düzenli tekrarla bu fazla unutma büyük ölçüde kapanıyor.
- Anlamı: kanca yalnız takılan kelimede ve aralıklı tekrarla birlikte. Uygulamadaki `kancalar.js` + leech yaklaşımı doğru. Genel yöntem yapılmamalı.

### 1.8 Kalıp öğrenme: kollokasyon, fiil + edat + hâl, chunk
- **Laufer & Girsai 2008** (Applied Linguistics 29(4)): L1 ile karşılaştırmalı açık öğretim ve çeviri alıştırması, kollokasyonu sadece anlama odaklı ya da yalnız biçim odaklı öğretimden belirgin biçimde iyi öğretti. Türkçe "-e kızmak" ↔ "sich ärgern über + A" karşılaştırması tam bu.
- **Boers vd. 2006** (Language Teaching Research 10(3)): kalıplara (formulaic sequences) dikkat çekilen öğrenciler sözlü sınavda daha akıcı ve yetkin değerlendirildi. Kalıp kullanımı ile konuşma akıcılığı ilişkisi başka çalışmalarda da var (Wood 2010).
- **Barcroft 2004** (SLR 20(4)) ve TOPRA modeli: yeni kelimeyi *ilk karşılaşmada* cümle kurdurarak çalıştırmak, kelimenin biçimini öğrenmeyi azalttı (anlam işleme biçim işlemenin kaynağını yiyor). Önce biçim (yazma), sonra cümle. Merdivenin sırası doğru.

### 1.9 İsim cinsiyeti (artikel)
- **Arnon & Ramscar 2012** (Cognition 122(3)): ismi önce tek başına görenler, artikel + isim birimiyle başlayanlardan hem artikeli hem ismi daha kötü öğrendi. İsim hep artikeliyle sunulmalı (kural 1 bunu sağlıyor).
- **Köpcke & Zubin 1984** ve sonrası: Almancada cinsiyet büyük ölçüde sonek, bileşiğin son parçası ve anlam kurallarıyla tahmin edilebiliyor. Kesin sonekler (-ung, -heit, -keit, -ion, -tät, -schaft → die; -chen, -lein, -ment, -um → das; -ling, -ismus, -or → der) öğrenciye en çabuk dönen yatırım. Sonek kuralının açık öğretimi üzerine kontrollü deney sayısı az ve sonuçlar karışık (bkz. Henry 2022, LTR). Üretim temelli cinsiyet alıştırmasının (artikeli cümlede çekimli kullanmak) anlamayı da üretimi de geliştirdiği bildiriliyor (Keppenne, Hopman & Jackson 2021). Renk kodlamasının tek başına etkisi zayıf ya da kanıtsız (Dias de Oliveira Santos 2015; sonucunu tam doğrulayamadım, **emin değilim**).

### 1.10 Kaç kelime, hangi sıklık
- **Milton & Alexiou 2009** (İngilizce, alıcı kelime sayısı): B1 ≈ 2.750–3.250, B2 ≈ 3.250–3.750 kelime. Fransızcada B1 ≈ 2.400, B2 ≈ 2.600. Dile göre değişiyor. Almanca için doğrudan eşdeğer bulamadım. Goethe B1 Wortliste ~2.400 madde, yani B1'in *üretimsel* çekirdeği.
- **Nation 2006**: yardımsız okumada %98 kapsama için 8–9 bin, konuşma dili için 6–7 bin kelime ailesi. **van Zeeland & Schmitt 2013**: dinlemede %95 kapsama yetebilir, bu da 2–3 bin aileyle mümkün. Pratik hedef: önce en sık 3.000 lemma tam (üretim düzeyinde), B2 için 4–5 bin alıcı. Almanca birleşik isimler sayıyı şişiriyor, bileşenleri biliyorsan bileşiği çözebilirsin.
- Hız: günde 6 yeni kelime ≈ yılda ~2.000. B1 listesindeki bilinmeyenleri bitirmek için yeterli, B2 için 8–10 gerekebilir. Ama yeni kelime girişi, tekrarların üretim doğruluğu yüksek kaldığı sürece artırılmalı (bkz. 3.6).

### 1.11 Okuma / dinlemeyle kendiliğinden öğrenme (incidental)
- **Uchihara, Webb & Yanagisawa 2019** (Language Learning 69(3), 26 çalışma): karşılaşma sayısı ile öğrenme arasında r = 0,34. **Webb 2007**: kelime başına ~10 karşılaşma gerekiyor. Dinlemeyle kazanç okumadan az (**Vidal 2011**). Metni okurken sesini de dinlemek (reading-while-listening) ikisinden de iyi (**Webb & Chang 2015**, **emin değilim**: sonuç ayrıntısını doğrulamadım).
- **Yanagisawa & Webb 2021** (ILH meta-analizi, 42 çalışma): kelimeyi *değerlendirme* (doğru kelimeyi seçme/kullanma) en çok katkı veren bileşen, *ihtiyaç* ikinci, *arama* (sözlükte bakmak) katkısız.
- Anlamı: DW Top-Thema'yı mp3 ile birlikte okumak Tuna için doğru kanal (dinlemeyi önemsiyor). Bakılan kelimeler (`lesen-wort`) SRS'e girmeli. Bu zaten var.

### 1.12 Çıktı: kelimeyi konuşurken kullanmak, sesli üretim
- **Production effect** (MacLeod; Fawcett 2013 meta-analizi): sesli okunan/söylenen kelime sessiz okunandan daha iyi hatırlanıyor. Denekler arası etki küçük, g ≈ 0,37. İkinci dilde: Esperanto kelimelerini sesli üretenler 1 ve 2 hafta sonra daha iyi hatırladı (Language Teaching Research 2022, "The effect of vocal production on vocabulary learning in a second language").
- Konuşmada kelime, sözlü biçimin *hızla* hatırlanmasını istiyor. Yavaş yazarak hatırlanan kelime konuşmaya geç aktarılıyor. Süre sınırlı tekrar ve 4/3/2 (aynı konuyu 4, 3, 2 dakikada anlatmak; Nation) akıcılık için önerilen klasik yöntemler. (4/3/2 için genel öğretim literatürü, meta-analiz değil.)

---

## 2. Uygulamada teşhis (kod + veri; son 14 gün = 23.10–6.11)

| Biçim | n | tam doğru | not |
|---|---|---|---|
| sec (TR→DE seçmeli) | 327 | %93 | yanlışların 42/50'si "aynı kelime, yanlış artikel" şıkkı |
| metinde / anla (DE→TR seçmeli) | 69 / 32 | %91 / %94 | |
| artikel flaşı (3 şık) | 172 | %74 | şans %33 |
| yaz0 / yaz | 140 / 98 | %61 / %52 | yazım/küçük hata dahil ~%75 / ~%67 |
| bos0 / bos | 48 / 18 | %60 / %67 | |
| metin (gerçek metinde boşluk) | 42 | %33 | S 0,5–1 olan yeni kelimelere B3 |
| kok (3 çekim birden) | 12 | %17 | kokSatz (tek biçim, cümlede) %80 |
| cumle (tam cümle) | 1 | – | 14 günde 1 kez |

### 2.1 Seçmeli şıklar (Tuna: "şıklardan çözülebiliyor")
- `optionenDE` (app.js 581–611): isimde `fa + ' ' + lemma` tuzağı, fiilde edat tuzağı → **convergence ipucu**: cevap tekrarlanan kelimeyi taşıyan iki şıktan biri. Diğer 2 çeldirici: `nah` (THEMA_VON: 17 geniş B1 konusundan ≤ 2, rastgele), sonra bütün havuzdan rastgele. Biçim benzerliği ve öğrencinin hataları hiç kullanılmıyor. Şıklar log'a yazılmıyor, bu yüzden denetlenemiyor.
- `optionen` (DE→TR, 541–568): Türkçe şıklar yine konu ≤ 2 + 1 bilinen + rastgele. Anlamdaşları elemek iyi, ama rastgele şıklar anlamca uzak.
- `DENKZEIT` 1,2 sn: şıklar gecikmeli açılıyor ama dokununca hemen açılıyor. Seçmeli cevapların %44'ü ≤ 2 sn'de verilmiş (medyan 3 sn).

### 2.2 Hafıza seçmeliyi hatırlama sayıyor
- `Kern.notVer` (kern.js 84): seçmeli doğru → m = 3, ofset c = 1,5 → S yine büyüyor. `basamak` (241): S < 2 → seçmeli, S < 7 → yaz… Seçmeli doğru cevaplar S'yi yazma eşiğinin üstüne itebiliyor, ama üretim kanıtı (pk) yok. 276 öğenin 143'ünde pk = 0 (hiç ipucusuz üretmemiş), 125'inde bm = 1 (en yüksek kanıtlanan basamak seçmeli). Buna karşın S medyanı 7 gün ve 90 öğede S ≥ 21.
- **Kalibrasyon:** yazma sorusunda model ortalama R = 0,91 diyor, gerçek tam doğru %54. Boşlukta model 0,90, gerçek %51. Model seçmeli başarılarıyla şişmiş ve üretim için aralıkları fazla uzun hesaplıyor.

### 2.3 Seçmeliyi besleyen yuvalar
- `basamak`: `kurtarma || R < 0.5 → b = 1`, `isinma/momentum/dogrula → b − 1`. Yanlıştan sonra aynı turdaki tekrar bir alt basamaktan geliyor (CLAUDE.md: "bir alt basamaktan başka cümleyle"). Yazmada yanlış → 3–5 soru sonra seçmeli → (cevabı az önce gördüğü için) doğru. Bu tekrar hiçbir şey sınamıyor.
- Örnek zincirler: "eşit haklılık" 8× seçmeli doğru / 2× yazma yanlış. "çok meşgul olmak" leech oldu, sonra 5 kez seçmeli doğru, ilk yazmada yine yanlış (5.11). "(yürürken) yolunu kaybetmek" leech'ten sonra yalnız seçmeli soruldu.

### 2.4 Bağlam ve ipucu çeşitliliği
- `satzWahl` (app.js 1008) son kullanılan cümleleri (`S.kontext`) atlıyor. v5'ten beri boşluk cümlesi tekrarı yok. Ama havuz küçük: 276 öğenin 10'unda 0, 25'inde 1, 58'inde 2 kendi cümlesi var. 60 günlük ufukta 6–10 tekrar olacağı için 2–3 cümle tekrara düşer.
- Yazma (yaz/yaz0) ipucu her seferinde aynı Türkçe karşılık. Tek ipucu → tek cevap eşleşmesi, PNAS 2024'ün "sabit ipucu" koşulu.
- Kök sorusunda aynı Goethe cümlesi 8 kez sorulmuş ("Die Abendzeitung hat einen Bericht über den Unfall _____").

### 2.5 Diğer bulgular
- `metin` boşluğu (`Kern.sec` adım 3) yeni öğeye (S 0,5–1, bm 1) B3 düzeyinde geliyor: %33 doğru. İstenen değil, fazla zorluk.
- `kok` aynı anda 3 biçim istiyor ve tek hata `fast` sayılıyor. %17'nin nedeni çoğunlukla Präsens er/sie biçimi (treffe→trifft, stimme zu→stimmt zu) ve "hat/ist" eksiği. Biçim tek tek, cümle içinde sorulunca %80.
- Artikel: en çok karışanlardan yaklaşık yarısı kurala uyuyor. Sonek: die Diskussion, die Toleranz, die Gymnastik, die Politik, die Behörde (-e). Bileşik son parça: der Wetterbericht, das Sonderangebot, der Supermarkt, das Bargeld, die Feuerwehr. Kural cevaptan *sonra* gösteriliyor (`regelHTML`) ama sorulmuyor. Karışma yönü: die → der 47, das → der 28: "emin değilsen der" stratejisi.
- 6.11'de iki metin boşluğu yanlış notlanmış: `heiß` → `heißer` ve `werden` → `wird` `falsch` verilmiş. `G.yakin` bugün ikisine de `cekim` diyor (node ile denedim). Muhtemelen önbellekte eski sürüm vardı. **Kontrol edilmeli.**
- Konuşma bölümü hiç kullanılmamış. Turda sesli üretim yok. Ses yalnız cevaptan sonra kelimenin TTS'i, cümle sesi yok.

---

## 3. Öneriler (öncelik sırasıyla)

| # | Ne | Neden (kanıt / veri) | Nerede | Büyüklük | Öncelik |
|---|---|---|---|---|---|
| 1 | **Convergence tuzağını kaldır.** TR→DE seçmelide her şık *farklı* kelime ve her biri kendi doğru artikeliyle olsun. Artikel ayrı sınansın (flaş, yazma). Fiilde edat tuzağı ya hiç olmasın ya da 2×2 düzende: iki fiil × iki edat (sich ärgern über / sich ärgern auf / sich freuen über / sich freuen auf), tekrar eden kelime cevabı ele vermesin. | 42/50 seçmeli yanlışı bu şıktan. Kelimeyi bilmeden 50/50'ye iniyor (Haladyna vd. 2002). | app.js `optionenDE` | küçük | 1 |
| 2 | **Rekabetçi çeldirici puanı.** Aday puanı: +3 öğrencinin kendi karışıklığı (log'da yazmada verdiği başka lemma, örn. zuverlässig → "sicher"; leech çiftleri), +2 biçim komşusu (aynı kök ya da önek ailesi: vorstellen/darstellen/herstellen, Verhalten/Verhältnis; dlev ≤ 3), +2 aynı konu ve aynı tür, +1 Tuna'nın zaten çalıştığı öğe. Anlamdaş eleme kalsın, 4 şık kalsın. Komşuluk tablosu build'de üretilsin, karışıklık çiftleri açılışta log'dan. Şıklar log'a yazılsın (`şıklar:a,b,c`). | Little vd. 2012: fayda çeldiricinin rekabetçi olmasına bağlı. Laufer 1997 (synforms). | app.js `optionen`/`optionenDE`; tools/build.py (komşu listesi → `daten/`) | orta | 1 |
| 3 | **Seçmeli doğruyu hatırlama sayma.** Tanıtım günü dışında seçmeli doğru S'yi büyütmesin (yalnız log) ya da en çok not 2 ile (S üst sınırı ~2 gün). S'yi yalnız üretim (yaz/bos/cumle/metin) büyütsün. | Kalibrasyon: yazmada model 0,91, gerçek 0,54. Laufer & Goldstein 2004. | kern.js `notVer` (SECMELI dalı), `uygula` | küçük | 1 |
| 4 | **Seçmeliyi tanıtım gününe indir.** Isınma, `tekrar:1` ve akşam yuvası seçmeli değil üretim olsun. Isınmada R'si yüksek öğe zaten yazılabilir (yaz). Yanlıştan sonraki tekrar *aynı basamakta, başka ipucuyla* gelsin (yaz0: ilk harf + harf sayısı), seçmeliyle değil. Kurtarmada R < 0,3 ise yeniden tanıtım + yaz0, R 0,3–0,5 ise yaz0. Hedef: tur sorularının ≤ %15'i seçmeli (şimdi ~%40). | Rawson & Dunlosky (successive relearning: doğru *hatırlama* ölçütü). Kang vd. 2007. Nakata 2016 (tanıma yalnız ilk bağ için). | kern.js `basamak` (kurtarma/isinma/dogrula), `Kern.sec` adım 1 ve 5, `aksamSec` | küçük-orta | 1 |
| 5 | **Değişen ipucuyla yazma (variable retrieval).** yaz/yaz0'da ipucu dönüşümlü olsun: (a) Türkçe karşılık, (b) yeni bir cümlede Türkçe çeviriyle boşluk, (c) Almanca basit açıklama, eşanlam ya da karşıt anlam ("nicht pünktlich → ?"), (d) **ses**: cümle sesli okunur, boşluktaki kelime yazılır (dinleme + biçim). Son 3 ipucu türü tekrarlanmasın. | Butowska-Buczyńska vd. 2024 (PNAS). Tuna "cevabı ezberliyorum". | app.js yaz soru üreticileri, `S.kontext` benzeri `S.ipucu[id]`; açıklamalar `quellen/` (gece işi yazabilir, Almanca doğruluğu denetlenmeli) | orta | 2 |
| 6 | **Cümle havuzu ≥ 6.** Kendi cümlesi ≤ 3 olan aktif öğelere 3–4 cümle ekle (`wort_saetze.txt`, `saetze.txt` + `glossen.txt`). Gece işi önce en az cümlesi olanı doldursun. Kök cümleleri de çeşitlensin. | 93 öğenin ≤ 2 cümlesi var. 60 günlük ufukta tekrara düşer. | quellen/*, tools/istem_gece.md | orta (içerik) | 2 |
| 7 | **Metin boşluğunu bm ≥ 2 öğeye sınırla.** | %33 doğru, S 0,5–1 öğelere B3. | kern.js `sec` adım 3 aday filtresi | küçük | 2 |
| 8 | **Fiili kalıp olarak öğret.** Fiil kartında fiil + edat + hâl + 1–2 tipik nesne ("einen Antrag ausfüllen", "sich ärgern über den Lärm"). Boşlukta tüm kalıp sorulsun (über den Lärm). Edatlı fiilde Türkçe karşılaştırma ("-e kızmak ↔ über + A") her yanlışta görünsün (kısmen var: `hallerTR`). | Laufer & Girsai 2008. Boers vd. 2006. | quellen/verben.txt (yeni alan: tipik nesne), app.js tanıtım + bos | orta | 2 |
| 9 | **Kökü tek biçim + cümlede sor.** `kok` 3 biçim birden yerine kokSatz ağırlıklı olsun, Präsens 3. tekil (trifft, stimmt zu) ayrı. | kok %17, kokSatz %80. | kern.js `bicimSec` (KOK), app.js kök üreticisi | küçük | 3 |
| 10 | **Artikelde kuralı geri çağırt.** (a) Kurala uyan isimde yanlıştan sonra kısa kural sorusu ("-ion → ?"), ardından aynı kuraldan 2 bilinen isim aynı turda karışık. (b) Bileşikte soruda son parçayı ayır (Super·markt), S büyüyünce ipucu kalksın. (c) Artikeli çekimli kullanma: "mit ___ Supermarkt → dem" (n-Dekl. üretecine benzer), sadece yalın hâli tanımak değil. | Hataların ~yarısı kural/bileşik. Köpcke & Zubin. Arnon & Ramscar. Üretim temelli cinsiyet alıştırması. | app.js `frageArtikel`, `regelHTML`; build.py `kopf` | orta | 2 |
| 11 | **Turda sesli üretim.** Yazma sorularında "önce sesli söyle, sonra yaz" satırı. Cevaptan sonra bütün cümle TTS ile çalsın, "tekrar et" (shadowing) düğmesi olsun. İsteğe bağlı: Chrome `webkitSpeechRecognition` (de-DE) ile söylenen kelime cevap olarak alınabilir. Not sistemin olur, öz-değerlendirme olmaz (kural 8). Gizlilik notu: ses Google'a gider. Tuna yazıya dökülmüş konuşmanın kontrolünü yararsız buldu, bu yüzden telaffuz yargısı değil, yalnız "kelimeyi söyleyebildin mi" denetimi olarak. | Production effect (Fawcett 2013; LTR 2022 L2 deneyi). Sprechen zayıf, Konuşma bölümü hiç kullanılmamış. | app.js `fxCevap`, soru HTML'i | küçük (ses) / orta (ASR) | 2 |
| 12 | **Yeni kelime kotasını üretim doğruluğuna bağla.** Son 7 günde vadeli üretim sorularında (yaz/bos, `tekrar`/`parti` hariç) doğruluk ≥ %80 → kota +2 (en çok 10), < %65 → −2 (en az 4). Şu an ~%60–70: reformlar oturana kadar 6'da kalsın. | Yük ve kalite dengesi. Kalıcılık (Webb vd. 2020: gecikmeli kazanç yarıya iniyor). | kern.js `kota` | küçük | 3 |
| 13 | **FSRS'i kendi verisiyle yeniden kalibre et.** 3. madde uygulandıktan 3–4 hafta sonra üretim soruları için R tahmini ile gerçek doğruluğu karşılaştır (bu raporun betiği gibi). Fark sürüyorsa hedef tutmayı (`ret`) 0,85 → 0,88 yap ya da FSRS ağırlıklarını optimize et. | Şimdiki fark +0,35. | tools/ (rapor betiği), kern.js | küçük | 3 |
| 14 | Metin boşluğu notlamasını doğrula (heiß/heißer, werden/wird `falsch` çıktı). | Log 6.11. | app.js `uPruef`, sw.js önbellek | küçük | 3 |

Not: 3. ve 4. maddeler birlikte günlük cevap süresini artırır (yazma ~6–10 sn, seçmeli ~3 sn). Tur boyu 12 kalsın, cevap sayısı düşer ama her cevap daha çok öğretir.

---

## 4. Tuna için (uygulama dışı, kısa)

1. **Şıklar açılmadan cevabı söyle.** Seçmeli soruda önce kelimeyi artikeliyle *sesli* söyle, sonra şıklara bak. Şıktan bulmak öğrenme sayılmaz.
2. **Her kelimeyi sesli ve kalıbıyla söyle:** "der Supermarkt, im Supermarkt"; "sich ärgern über, ich ärgere mich über den Lärm". Konuşmada lazım olan, kelimenin tek başına değil, kalıbıyla çıkması.
3. **Artikel kurallarını bir kez ezberle:** -ung, -heit, -keit, -ion, -tät, -schaft, -ik, -anz/-enz → die · -chen, -lein, -ment, -um → das · -ling, -ismus, -or → der · bileşikte son parça (Super·markt → der Markt). Emin değilsen "der" deme, kuralı düşün.
4. **Günde 10 dk konuşma:** o günün 5 kelimesiyle bir konu (Sprechen Teil 2) seç, 2 dk anlat, kaydet, dinle, sonra aynı konuyu daha kısa sürede tekrar anlat (4/3/2). Kursta da her derste yeni kelimelerden en az ikisini kullanmayı hedefle.
5. **Dinleme:** DW Top-Thema'yı önce yalnız dinle, sonra metinle birlikte dinle. Bilmediğin kelimeye metinde dokun (uygulamaya girer). Cümleleri yüksek sesle taklit et (shadowing).
6. **Kolay gelmesi iyi işaret değil:** "biliyorum" hissi aynı ipucuyla oluşuyor (PNAS 2024: öğrenciler sabit ipucunu daha etkili sanıyor). Yazma ve cümle soruları zor gelecek, doğru yol o.
7. **Kursta gördüğün kelimeyi aynı gün uygulamaya ekle.** Öğretmenin "kelime ezberle" dediği kelimeler kursun kelimeleri.
8. **Kısa ve sık:** sabah + akşam iki kısa oturum, tek uzun oturumdan iyi (aralık etkisi).

---

## 5. Kaynaklar

- Cepeda vd. 2006, Distributed practice in verbal recall tasks (Psych. Bulletin): https://doi.org/10.1037/0033-2909.132.3.354
- Cepeda, Vul, Rohrer, Wixted & Pashler 2008, Spacing effects in learning: a temporal ridgeline (Psych. Science): https://pubmed.ncbi.nlm.nih.gov/19076480/
- Kim & Webb 2022, The effects of spaced practice on second language learning: a meta-analysis (Language Learning 72(1)): https://doi.org/10.1111/lang.12479
- Kornell 2009, Optimising learning using flashcards: spacing is more effective than cramming (Applied Cognitive Psychology): https://doi.org/10.1002/acp.1537
- Karpicke & Roediger 2008, The critical importance of retrieval for learning (Science): https://doi.org/10.1126/science.1152408
- Adesope, Trevisan & Sundararajan 2017, Rethinking the use of tests (RER): https://doi.org/10.3102/0034654316689306
- Kang, McDermott & Roediger 2007, Test format and corrective feedback modify the effect of testing (EJCP): https://doi.org/10.1080/09541440601056620
- Pyc & Rawson 2009, Testing the retrieval effort hypothesis (JML): https://doi.org/10.1016/j.jml.2009.01.004
- Rawson, Dunlosky & Sciartelli 2013, The power of successive relearning (Educ. Psych. Review): https://doi.org/10.1007/s10648-013-9240-4
- Nakata 2017, Does repeated practice make perfect? (SSLA): https://doi.org/10.1017/S0272263116000280
- Nakata 2016, Effects of retrieval formats on L2 vocabulary learning (IRAL): https://researchmap.jp/nakatata/published_papers/735161?lang=ja
- Pan & Rickard 2018, Transfer of test-enhanced learning (Psych. Bulletin): https://sc-pan.github.io/pdf/PR_2018.pdf
- Laufer & Goldstein 2004, Testing vocabulary knowledge: size, strength, and computer adaptiveness (Language Learning 54(3)): https://doi.org/10.1111/j.0023-8333.2004.00260.x
- Schneider, Healy & Bourne 2002, What is learned under difficult conditions is hard to forget (JML 46): https://doi.org/10.1006/jmla.2001.2813
- Steinel, Hulstijn & Steinel 2007, Second language idiom learning in a paired-associate paradigm (SSLA): https://doi.org/10.1017/S0272263107070258
- Webb, Yanagisawa & Uchihara 2020, How effective are intentional vocabulary-learning activities? (MLJ 104(4)): https://doi.org/10.1111/modl.12671
- Little, Bjork, Bjork & Angello 2012, Multiple-choice tests exonerated (Psych. Science): https://doi.org/10.1177/0956797612443370
- Butler 2018, Multiple-choice testing in education (JARMC): https://profiles.wustl.edu/en/publications/multiple-choice-testing-in-education-are-the-best-practices-for-a/
- Roediger & Marsh 2005, The positive and negative consequences of multiple-choice testing (JEP:LMC): https://doi.org/10.1037/0278-7393.31.5.1155
- Haladyna, Downing & Rodriguez 2002, A review of multiple-choice item-writing guidelines (AME): https://doi.org/10.1207/S15324818AME1503_5
- Butowska-Buczyńska, Kliś, Zawadzka & Hanczakowski 2024, The role of variable retrieval in effective learning (PNAS): https://www.pnas.org/doi/10.1073/pnas.2413511121
- van den Broek vd. 2018, Contextual richness and word learning (Language Learning): https://onlinelibrary.wiley.com/doi/10.1111/lang.12285
- Kornell, Hays & Bjork 2009, Unsuccessful retrieval attempts enhance subsequent learning (JEP:LMC): https://doi.org/10.1037/a0015729
- Brunmair & Richter 2019, Similarity matters: a meta-analysis of interleaved learning (Psych. Bulletin): https://pubmed.ncbi.nlm.nih.gov/31556629/
- Erten & Tekin 2008, Effects on vocabulary acquisition of presenting new words in semantic sets versus semantically unrelated sets (System): https://doi.org/10.1016/j.system.2007.11.003
- Wang, Thomas & Ouellette 1992, Keyword mnemonic and retention of second-language vocabulary words (J. Educ. Psych. 84(4)): https://stars.library.ucf.edu/facultybib1990/601 · Wang & Thomas 1995: https://archive.memory-key.com/research/Wang95
- Laufer & Girsai 2008, Form-focused instruction in L2 vocabulary learning: a case for contrastive analysis and translation (Applied Linguistics 29(4)): https://doi.org/10.1093/applin/amn018
- Boers vd. 2006, Formulaic sequences and perceived oral proficiency (LTR 10(3)): https://doi.org/10.1191/1362168806lr195oa
- Barcroft 2004, Effects of sentence writing in second language lexical acquisition (SLR 20(4)): https://doi.org/10.1191/0267658304sr233oa
- Arnon & Ramscar 2012, Granularity and the acquisition of grammatical gender (Cognition 122(3)): https://escholarship.org/uc/item/86t911bd
- Köpcke & Zubin 1984, Sechs Prinzipien für die Genuszuweisung im Deutschen (Linguistische Berichte 93), bağlantı bulamadım.
- Henry 2022, Processing Instruction and German gender (LTR): https://www.x-mol.com/paper/1538196033789480960 (özetten)
- Milton & Alexiou 2009, Vocabulary size and the CEFR (tablo): https://www.enl.auth.gr/gala/14th/Papers/English%20papers/Milton&Alexiou.pdf
- Nation 2006, How large a vocabulary is needed for reading and listening?: https://www.wgtn.ac.nz/__data/assets/pdf_file/0018/1626120/2006-How-large-a-vocab.pdf
- Uchihara, Webb & Yanagisawa 2019, The effects of repetition on incidental vocabulary learning (Language Learning 69(3)): https://zendy.io/title/10.1111/lang.12343
- Webb 2007, The effects of repetition on vocabulary knowledge (Applied Linguistics 28): https://doi.org/10.1093/applin/aml048
- Vidal 2011, A comparison of the effects of reading and listening on incidental vocabulary acquisition (Language Learning): https://doi.org/10.1111/j.1467-9922.2010.00593.x
- Yanagisawa & Webb 2021, To what extent does the Involvement Load Hypothesis predict incidental L2 vocabulary learning? (Language Learning 71(2)): https://zendy.io/title/10.1111/lang.12444
- Fawcett 2013 (production effect meta-analizi, Can. J. Exp. Psych.): https://doi.org/10.1037/a0032923 · L2 sesli üretim deneyi (LTR 2022): https://cris.iucc.ac.il/en/publications/the-effect-of-vocal-production-on-vocabulary-learning-in-a-second/

Veri analizi betikleri: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/an1.py`, `an2.py`, `an3.py` (log/log.csv ve log/zustand.json, salt okunur).
