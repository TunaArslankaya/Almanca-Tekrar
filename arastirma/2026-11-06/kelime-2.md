# Kelime ve fiil kalıcı nasıl öğrenilir: araştırma, repo teşhisi, öneriler (kelime-2, 6.11.2026)

Not: Bu oturumda web arama kotası doldu, iki site (Würzburg PDF, PubMed) ağ ayarları yüzünden açılmadı. Arama sonucunda doğrulanan bulgular **[D]** ile, kendi bilgimden olan ama bu oturumda doğrulayamadığım değerler **[H]** ("hatırladığım, emin değilim") ile işaretli. Veri analizleri `log/log.csv` (23.10–6.11, 1.425 satır) ve `log/zustand.json` üzerinde yapıldı. Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/k2/`.

---

## 0. Kısa sonuç

1. **Şıkların kolay olmasının iki somut nedeni kodda var:**
   (a) `optionenDE` (js/app.js ~587) isimde şıklardan birini *doğru ismin yanlış artikelli kopyası* yapıyor (`der Toleranz` / `die Toleranz`), edatlı fiilde *aynı fiilin yanlış edatlı kopyası* (`sorgen nach` / `sorgen für`). Aynı kelimeyi taşıyan iki şık olunca cevap o ikisinden biri: anlamı bilmeden çözülüyor ("convergence" ipucu). Log'da seçmeli yanlışların **50 / 50'si** bu ikiz şıktan (artikel ya da edat), anlam yanlışı yok denecek kadar az.
   (b) Kalan çeldiriciler 2.931 kelimelik listeden neredeyse rastgele; Tuna bunların ~%90'ını hiç görmedi. Doğru şık "tanıdık gelen tek kelime" → tanıdıklık sezgisiyle seçiliyor. Seçmelide doğruluk %94 (yanlış olmayan %99), medyan süre 3 sn, cevapların %81'i ≤ 3 sn.
2. **Hafıza modeli tanımayı ölçüyor, üretimi değil.** Yazma sorusundan önce sistemin tahmin ettiği hatırlama olasılığı ortalama **R = 0,90**, gerçek doğru oranı **%52 (yaz) / %56 (yaz0) / %60 (bos0)**. Tek `m` hafızasını seçmeli başarıları besliyor; aralıklar üretim için fazla uzun. "Cevabı ezberliyorum" hissinin ölçülebilir karşılığı bu.
3. **Seçmelinin çoğu "kolay anlarda" geliyor:** son hafta 206 seçmelinin 55'i yanlıştan 3–5 soru sonra yeniden sorma (cevabı az önce gördü), 36'sı tanıtımdan hemen sonra mini soru, 38'i kurtarma, 16'sı akşam. Yanlış yazılan kelime bir alt basamağa, yani seçmeliye düşüyor (`Kern.oturumIsle`).
4. **Cümle havuzu dar ama genişletmesi ucuz:** çalışılan isimlerde kendi çeviri cümlesi ortalaması 3,1 (53 isimde ≤ 2). `quellen/kaliplar.txt`'teki 1.668 Türkçeli fiil cümlesi cümle havuzuna hiç girmiyor. Eklenirse çalışılan fiillerde ortalama 3,8'den 6,2 cümleye çıkılır. Bütün Türkçeli cümlelerden (5.892) isim geçenler de kullanılırsa isimlerde 3,1'den ~7,4'e çıkılır.
5. **Araştırmanın ana mesajı:** kalıcı ve konuşmada kullanılabilir kelime için zorlayıcı, *üretken* (L1 → L2) geri çağırma gerekir: aralıklı, her seferinde farklı bağlamda ve sesli. Çoktan seçmeli yalnız çeldiriciler gerçekten rekabetçiyse işe yarar. Artikel kural + geri bildirimle, fiil kalıp (chunk) olarak öğrenilir. Konuşma zayıfsa kelime sözlü üretilerek çalışılmalı.

---

## 1. Araştırma: ne biliyoruz

### 1.1 Aralıklı tekrar (spacing)
- **Kim & Webb (2022), meta-analiz, *Language Learning* 72(1), 269–319** [D]: 48 deney, 98 etki büyüklüğü, N = 3.411. Aralıklı çalışmanın L2 öğrenmeye etkisi orta–büyük. Kısa aralık hemen yapılan testte uzun aralık kadar iyi, gecikmeli testte daha zayıf. Eşit ve genişleyen aralık benzer. https://doi.org/10.1111/lang.12479
- **Cepeda, Vul, Rohrer, Wixted & Pashler (2008), *Psychological Science* 19(11)** [D]: en iyi aralık, hedeflenen saklama süresinin 1 haftalık hedefte ~%20–40'ı, 1 yıllık hedefte ~%5–10'u. https://pubmed.ncbi.nlm.nih.gov/19076480/
- Uygulama için: aralık ufku hedefe göre seçilmeli. Bir yıllık kalıcılık için 60 günlük üst sınır (`Kern.MAX_ARALIK`) makul. Asıl sorun aralığın uzunluğu değil, aralığı belirleyen hafızanın **yanlış beceriyle** (tanıma) beslenmesi (bkz. 2.3).

### 1.2 Geri çağırma (retrieval practice / testing effect)
- **Adesope, Trevisan & Sundararajan (2017), *Review of Educational Research* 87(3)** [D]: 118 çalışma. Pratik testi yeniden okumadan ve diğer bütün koşullardan daha etkili; etki test biçimi, geri bildirim ve son test türüyle değişiyor. Genel g ≈ 0,61 [H]. https://doi.org/10.3102/0034654316689306
- **Rowland (2014), *Psychological Bulletin***: g ≈ 0,50; ipucusuz hatırlama tanımadan güçlü [H].
- **Kang, Gollan & Pashler (2013), *Psychonomic Bulletin & Review* 20** [D]: yabancı kelimede "dinle-tekrar et" ile "Türkçeden hatırla, söyle, sonra doğrusunu gör" karşılaştırılmış. Sözlü üretim testinde geri çağırma hem hemen hem gecikmeli testte daha iyi. Öğrenme sırasında telaffuz biraz daha kötü. https://www.learningscientists.org/blog/2025/6/20-1
- **Karpicke & Roediger (2008), *Science*** [H]: doğru hatırlanan kelimeyi testten çıkarmak (yalnız yeniden okutmak) uzun vadeli hatırlamayı çok düşürdü. Tekrar *test* edilmeli.
- **Nakata (2017), *SSLA* 39(4)** [D]: bir oturumda 5 ve 7 geri çağırma, 1 ve 3 geri çağırmadan 1 ve 4 hafta sonra da daha iyi. 5 ile 7 arasında fark yok. https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E
- **Pyc & Rawson (2009), *Journal of Memory and Language*** [H]: zor ama başarılı geri çağırma (araya daha çok soru girmiş) daha kalıcı ("retrieval effort hypothesis"). Kelime az önce görüldüyse geri çağırma kolay, kazanç küçük.
- **Successive relearning, Rawson & Dunlosky** [D]: ilk oturumda ölçüte (≥ 1 doğru) kadar test, sonra birkaç gün arayla yeniden öğrenme oturumları. Yabancı kelimede tek oturuma göre büyük üstünlük. https://link.springer.com/article/10.1007/s10648-023-09809-2

### 1.3 Üretim (L1 → L2) ve tanıma
- **Laufer & Goldstein (2004), *Language Learning* 54(3)** [D]: kelime bilgisinde zorluk sırası: pasif tanıma < aktif tanıma < pasif hatırlama < aktif hatırlama. Bu sıra her sıklık düzeyinde geçerli. Tanıma testinde başarılı olmak üretimi göstermez.
- **Webb (2009)** [D, ikincil kaynak]: alıcı (L2 → L1) öğrenme alıcı anlam bilgisini artırıyor. Üretken (L1 → L2) öğrenme yazım, üretken anlam, sözdizimi ve kullanımda daha geniş kazanç sağlıyor. Tek yöntem seçilecekse üretken. https://cambridge.org/core/journals/studies-in-second-language-acquisition/article/receptive-and-productive-vocabulary-learning-the-effects-of-reading-and-writing-on-word-knowledge/DDF362AE7B13D1949B1CD591DA2F3414
- **Steinel, Hulstijn & Steinel (2007), *SSLA* 29** [D]: öğrenme yönü ile test yönü etkileşiyor. Üretken çalışan üretken testte, alıcı çalışan alıcı testte iyi ("transfer-appropriate processing"). https://scholarlypublications.universiteitleiden.nl/handle/1887/14200
- **Schneider, Healy & Bourne (2002), *JML* 46** [D]: zor yön (L1 → L2) ile öğrenilen kelimeler bir haftada daha az unutuldu ve yeniden öğrenmede daha çok tasarruf sağladı. https://core.ac.uk/download/326666494.pdf
- **Tuna için anlamı:** sorunu *konuşma*, yani aktif hatırlama. Son test konuşma olduğuna göre pratik de çoğunlukla Türkçe → Almanca üretim olmalı; mümkünse sesli ve cümle içinde.

### 1.4 Çoktan seçmeli ve iyi çeldirici
- **Little, Bjork, Bjork & Angello (2012), *Psychological Science* 23(11)** [D]: çeldiriciler *makul (rekabetçi)* ise seçmeli soru da geri çağırmayı tetikler, hatta yanlış şıklara ait bilgiyi de güçlendirir. **Little & Bjork (2015)**: bu fayda çeldiricilerin rekabetçi olmasına bağlı. Rekabetçi şık gerekli ama yeterli değil: öğrencilerin ~%30'u şıkları gerçekten düşünüyor. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf
- **Roediger & Marsh (2005)** [H]: çok sayıda çeldirici yanlış bilgiyi besleyebilir ("negative suggestion"). Geri bildirim bunu büyük ölçüde giderir. Uygulamada geri bildirim var.
- **Soru yazım ilkeleri (Haladyna, Downing & Rodriguez 2002; Butler 2018)** [H]: şıklar içerik ve dil bilgisi bakımından türdeş olmalı, makul olmalı, cevaba ipucu vermemeli. Bilinen bir ipucu türü "yakınsama" (convergence; Smith 1982): öğelerini en çok başka şıklarla paylaşan şık doğrudur. `der X / die X` ikizi tam olarak bu ipucunu üretiyor.
- **Anlamca yakın kelimeleri birlikte *ilk kez* öğrenmek karışıklık yaratır** (Tinkham 1993/1997, Waring 1997 [H]; Nakata & Suzuki 2019, *SSLA* 41(2) bu konuyu yeniden test ediyor, sonuçlar karışık [D]: https://doi.org/10.1017/S0272263118000219). Sonuç: yakın çeldirici **tekrarda** (kelime zaten öğrenilmişken) iyi, **tanıtım günü** kötü.
- **Yorum:** iyi çeldirici şunlardan biri olmalı. (1) Tuna'nın *daha önce gördüğü* kelime; tanıdıklıkla elenemesin. (2) Aynı tür ve aynı alt sınıf (fiil / fiil, sıfat / sıfat). (3) Biçimce benzer: aynı önek (ver-/be-/ent-), benzer uzunluk, kafa karıştıran çift (*verlassen / verlangen / verletzen*). (4) Anlamca aynı alan. (5) Tuna'nın geçmişte karıştırdığı kelime.

### 1.5 Bağlam çeşitliliği (aynı cümleyi ezberleme sorunu)
- **Pagán & Nation (2019), *Cognitive Science* 43(1)** [D]: yetişkinlerde farklı cümlelerde görülen kelime öğrenme sırasında daha yavaş edinildi ama testte daha iyi öğrenilmişti. Geri çağırma özellikle çeşitli bağlamda görülen kelimelere yaradı. https://doi.org/10.1111/cogs.12705
- **Bolger, Balass, Landen & Perfetti (2008); Johns, Dye & Jones (2016)** [H]: anlam, değişen bağlamlardan soyutlanır. Hep aynı bağlam, kelimeyi o cümleye bağlar ("bağlama bağımlı hafıza").
- **Uygulama için:** aynı Türkçe cümle + aynı boşluk birkaç kez gelirse Tuna "bu Türkçe cümle → bu Almanca kelime" eşlemesini ezberler. Bu, kelimeyi bilmek değildir. Her tekrar mümkünse yeni cümleyle gelmeli. Cümle tekrar etmek zorundaysa Türkçe çeviri gizlenmeli ya da biçim değişmeli.

### 1.6 İstenen zorluklar (desirable difficulties)
- **Bjork (1994); Bjork & Bjork (2011)** [H]: aralık, karıştırma, üretim, bağlam değişimi gibi öğrenmeyi yavaşlatan ama kalıcılığı artıran koşullar. Performans ≠ öğrenme: kolay gelen tekrar öğrenme yanılsaması yaratır.
- **Suzuki, Nakata & DeKeyser (2019), *Modern Language Journal* 103(3)** [D]: bu çerçeve L2 pratiğinin kuramsal temeli. Zorluk, öğrencinin düzeyine ve dilsel zorluğa göre ayarlanmalı: fazla zor = başarısız geri çağırma = kazanç yok. https://doi.org/10.1111/modl.12585
- Bu bulgu "hepsini zorlaştır" demiyor. Bir kademe: **başarı oranı ~%70–85 olacak kadar zor**. Şu an seçmeli %94 (fazla kolay), metin boşluğu %33 (fazla zor).

### 1.7 Karışık sıralama (interleaving)
- **Brunmair & Richter (2019), *Psychological Bulletin* 145(11)** [D, kısmi]: 59 çalışmada genel etki orta (g ≈ 0,42 [H]). Ama **kelime öğreniminde ve açıklayıcı metinde dikkat**: kelimelerde etki negatif (g ≈ −0,39 [arama özeti; tam metinde doğrulayamadım]). Fayda, *birbirine benzeyen kategorileri ayırt etmeyi* öğrenirken çıkıyor. https://pubmed.ncbi.nlm.nih.gov/31556629/
- **Nakata & Suzuki (2019b), *MLJ* 103(3)** [D]: L2 gramer alıştırmalarını karıştırmak uzun vadeli kalıcılığı artırdı.
- **Yorum:** kelimeleri konu konu bloklamak ya da karıştırmak tek başına büyük fark yaratmaz. **Artikel (der/die/das) ve edat seçimi ise bir kategori ayırt etme görevi**; burada karışık sıralama uygun (bkz. öneri E).

### 1.8 Anahtar kelime / mnemonik
- **Atkinson & Raugh (1975)** [H]: anahtar kelime yöntemi hemen yapılan testte güçlü.
- **Wang & Thomas (1995); Thomas & Wang (1996)** [D]: anahtar kelimeyle öğrenenler hemen testte daha iyi, 2 gün sonra daha kötü. Kanca anıları kırılgan, ek geri çağırma pratiği açığı kapatıyor. https://stars.library.ucf.edu/facultybib1990/1498
- **Ellis & Beaton (1993)** [H]: anahtar kelime alıcı yönde (Almanca → Türkçe) iyi, üretken yönde (Türkçe → Almanca) tekrar daha iyi.
- **Dunlosky vd. (2013)** [H]: mnemonik teknikleri "düşük fayda" sınıfında.
- **Yorum:** `daten/kancalar.js` yalnız takılan (leech) kelimelerde, ek olarak kalmalı. Kanca kelimeyi "tanıtır", üretimi yine geri çağırma pratiği kurar. Artikel kancası (renk + kural) ayrıca anlamlı.

### 1.9 Kelime + kalıp (Kollokation, Verb + Präposition + Kasus, chunks)
- **Li & Lei (2022), *IRAL*** [D, kayıt kısmen bozuk]: 17 çalışma, N = 3.859. Kollokasyon öğretimi büyük etki d = 1,415 (GA 1,19–1,64). https://www.degruyterbrill.com/document/doi/10.1515/iral-2021-0218/html
- **Boers & Lindstromberg (2012)** [H]: kalıp ifadeler konuşma akıcılığını artırır. Öğrenciler kalıbı kendiliğinden fark etmez, dikkat çekmek gerekir.
- **Yorum:** konuşmada "fiil bilmek" demek "*einen Termin vereinbaren*, *sich um eine Stelle bewerben*, *auf den Bus warten*" gibi parçayı tek seferde çekebilmek demek. Fiili mastar olarak (`sich verlassen auf`) yazmak bu beceriyi tam ölçmez.

### 1.10 İsim cinsiyeti (artikel)
- **Presson, MacWhinney & Tokowicz (2014), *Applied Psycholinguistics* 35(4)** [D]: acemi öğrenciler cinsiyeti öğrenirken **açık kural + doğru/yanlış geri bildirimi**, yalnız geri bildirimden ve kuralsız dikkat çekmeden daha iyi genelleme ve kalıcılık sağladı. https://www.cambridge.org/core/journals/applied-psycholinguistics/article/learning-grammatical-gender-the-use-of-rules-by-novice-learners/5C9F7E93A0F74030C1F04280746745EA
- **Köpcke & Zubin (1984), Köpcke (1982)** [H]: Almanca cinsiyetin büyük bölümü sonek, ses ve anlam ipuçlarıyla tahmin edilebilir (‑ung/‑heit/‑keit/‑ion/‑tät/‑ik/‑anz/‑enz → die; ‑chen/‑lein/‑ment/‑um → das; ‑ling/‑ismus/‑or/‑ig → der; Ge‑ toplu isim → çoğu das).
- **Hopp (2013)** [D, ikincil]: cinsiyet atamasında eğitim alan ileri öğrenciler öngörüsel işlemleme gösterdi. Bu beceri atama doğruluğuyla ilişkili.
- **Renk kodlama: Arzt & Kost (2016); Kohler; Nyikos** [D]: küçük çalışmalarda renk kodlama gecikmeli testte avantaj sağladı. Kanıt zayıf ama maliyet düşük. https://kuscholarworks.ku.edu/handle/1808/10026
- **Türkçe ana dilli öğrenci** [H, genel bulgu]: ana dilinde cinsiyet yoksa artikel kalıcı olarak zordur (L1 transferi yok). İsim artikelsiz depolanmamalı. Artikel hep isimle *birlikte sesli söylenmeli* ve hâl çekimiyle (dem/der/den) kullanılmalı.

### 1.11 Kelime sayısı hedefi (B1 / B2)
- **Milton (2009/2010); Milton & Alexiou** [D, ikincil; X-Lex lemma testi, çoğu İngilizce / Yunanca / Fransızca]: A2 1.500–2.500, **B1 2.500–3.250, B2 3.250–3.750** lemma (tanıma). https://wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists/vocabulary-cefr-and-word-family-size/vocabulary-and-the-cefr-docx
- **GerVLPro (2026, Leibniz-IPN)** [D]: Almanca öğrenicilerin *üretken* kelimesinden çıkarılmış CEFR listesi: A1 611 + A2 1.134 + B1 903 + B2 1.103 lemma. Birikimli olarak B1'e kadar ~2.650, **B2'ye kadar ~3.750 üretken lemma**. https://www.leibniz-ipn.de/en/research/publications/gervlpro
- **Nation (2006)** [H]: konuşulan dili rahat anlamak için ~6–7 bin, yazılı metin için ~8–9 bin kelime ailesi (%98 kapsama).
- **Tuna için:** uygulamadaki liste 2.931 öğe (A1 522, A2 683, B1 1.726). Bunların 276'sı hafızada. A1/A2'nin büyük kısmını muhtemelen biliyor ama sistem bilmiyor. B2'ye geçişte üretken olarak ~3.500 lemma gerçekçi bir hedef. Günde 6 yeniyle B1 listesinin geri kalanı (~1.500) ~250 gün sürer.

### 1.12 Okuma / dinleme ile kendiliğinden kelime (incidental)
- **Uchihara, Webb & Yanagisawa (2019), *Language Learning* 69(3)** [D]: karşılaşma sayısının kendiliğinden öğrenmeye etkisi orta (r = 0,34; 26 çalışma, N = 1.918). Aralıklı karşılaşma ve görsel destek etkiyi düzenliyor. https://zendy.io/title/10.1111/lang.12343
- **de Vos, Schriefers, Nivard & Lemhöfer (2018), *Language Learning* 68(4)** [D]: sözlü girdiden kendiliğinden öğrenmede g = 1,05 (32 çalışma). **Yetişkinler** ve **etkileşimli görevler** (konuşma, karşılıklı) daha iyi. Tanıma testinde kazanç hatırlama testinden yüksek. https://www.mpi.nl/publications/item_3008448
- Başka bir meta-analiz [D, yazar doğrulanmadı]: okuma, dinleme ve okurken dinlemede kelime başına kazanç benzer (~%13–17). https://www.cambridge.org/core/product/B020D5E8D8B4764CFFBD6A97EC0D8F00
- **Webb (2007)** [H]: bir kelimenin kendiliğinden kalıcılaşması için ~10+ karşılaşma gerekir.
- **Yorum:** dinleme Tuna için doğru tercih. Kelime başına kazanç düşük, ama dinlerken *bilinen* kelimeler hızlanır ve sesi oturur. Bilinçli kelime çalışmasının yerini tutmaz, onu tamamlar. En iyisi okurken dinlemek (DW Top-Thema mp3 + metin).

### 1.13 Çıktı: konuşurken kelimeyi kullanmak
- **Swain (Output hypothesis); Laufer & Hulstijn (2001), Involvement Load** [H]; **Yanagisawa & Webb (2021) meta-analiz** [D]: kelimeyi bir görev içinde *kullanmak* (ihtiyaç + arama + değerlendirme) öğrenmeyi artırır. Katılım yükü, görev süresinden daha belirleyici. https://next.sciencegate.app/document/10.1111/lang.12444
- **Üretim etkisi: kelimeyi sesli söylemek.** Icht & Mama (2019), *Language Teaching Research* [D]: sesli söylenerek öğrenilen kelimeler 1 ve 2 hafta sonra daha iyi hatırlandı ve daha yavaş unutuldu. Brown & Roembke (2024) [D]: etki L2'de L1'den büyük. Kaushanskaya & Yoo (2011) ters sonuç buldu, kanıt karışık. https://cris.iucc.ac.il/en/publications/the-effect-of-vocal-production-on-vocabulary-learning-in-a-second/
- **Uchihara & Clenton (2023)** [D]: *sözlü* kelime bilgisi konuşma puanlarıyla ilişkili, *yazılı* kelime bilgisi değil. Konuşma için kelimenin sesli biçimi ve hızlı erişimi lazım. https://eld.bl.uk/catalog/100184186364_0x000001
- **Kang vd. (2013)**: sözlü üretim testinde hatırlayarak söylemek, dinleyip tekrar etmekten (shadowing benzeri taklit) iyi.
- **Barcroft (TOPRA)** [H]: yeni kelimenin *ilk* karşılaşmasında cümle yazdırmak biçim öğrenmesini düşürebilir. Tam cümle üretimini kelime biraz oturduktan sonra (2.–3. tekrar) istemek doğru, ki şu anki merdiven de böyle.

### 1.14 Başarılı uygulamalar ne yapıyor
| Uygulama | Neyi farklı yapıyor | Bu repo için ders |
|---|---|---|
| **Anki (FSRS)** | Hatırla, sonra kendin not ver. Leech: ~8 unutmada kart askıya alınır. Wozniak'ın "en az bilgi" ilkesi [H] | Bu repoda öz-değerlendirme yok (kural 8), doğru. Leech'te kartı *değiştirmek* (kanca, başka biçim) Anki'nin önerisi |
| **Clozemaster** | Bütün içerik *cümle*. Her cümle ayrı tekrar birimi, bir kelime onlarca farklı cümlede gelir. Seçmeli ve yazmalı mod ayrı. Varsayılan aralık 1 / 10 / 30 / 180 gün [D] https://www.clozemaster.com/faq | Bağlam çeşitliliği: kelime başına çok cümle |
| **Lingvist** | Baştan *yazma*: cümlede boşluk + Türkçe karşılık + ipucu, seçmeli yok denecek kadar az [D] https://lingvist.com/blog/learn-with-lingvist-in-three-easy-steps/ | Giriş basamağı seçmeli değil, ipuçlu yazma (yaz0 / bos0) olabilir |
| **Duolingo** | Half-life regression: her kelime için ayrı yarı ömür, biçim bilgisi modelde. Leitner'e göre hata ~yarıya düştü, katılım %12 arttı [D] https://preview.aclanthology.org/fix_video/P16-1174.pdf. Kelime bankası ve dokunmalı alıştırmalar kolaylık nedeniyle sık eleştirilir [H] | Biçimi (tanıma / üretim) hafıza modeline koymak |
| **WaniKani** | **Seçmeli yok, hep yazarak cevap.** Anlam ve okunuş ayrı sorulur. 9 aşama (4 sa, 8 sa, 1 g, 2 g, 1 hf, 2 hf, 1 ay, 4 ay [D, topluluk]). Yanlışta aşama geri düşer. Her öğeye mnemonik [D] https://knowledge.wanikani.com/wanikani/srs-stages/ | Anlam ve artikeli ayrı tutmak (repoda var). Yeni kelimede ilk gün çok kısa adımlar |
| **Memrise** | İlk görüşte seçmeli, birkaç başarıdan sonra hep yazma. Yerli konuşmacı videoları. Karıştırılan kelimeye özel tekrar [H] | Seçmeli yalnız ilk 1–2 karşılaşmada. Ses |
| **Glossika** | Ses ağırlıklı cümle tekrarı: dinle → söyle, aralıklı [H] | Konuşma için sesli cümle, ama taklit tek başına geri çağırmadan zayıf (Kang 2013) |
| **Babbel** | Tekrar yöneticisinde çok biçim, konuşma tanıma ile telaffuz [H] | Chrome'un konuşma tanıması bu repoda da kullanılabilir |

Ortak noktaları: **tanıma yalnız başta**. Kalıcılık ölçütü yazarak ya da sesli **üretim**. İçerik **cümle bolluğu** üzerine kurulu.

---

## 2. Repo teşhisi: şikâyetlerin kodda ve veride karşılığı

### 2.1 "Şıklar çok basit, şıklardan bile çözülüyor": doğrulandı
- `js/app.js` `optionenDE` (~581–613): isimde `out.push({ t: fa + ' ' + lemma, tuzak: 'artikel' })` doğru ismin yanlış artikelli kopyasını şık yapıyor. Edatlı fiilde `tuzak: 'edat'` aynı fiilin başka edatlısını. Diğer iki şık başka kelimeler. **İki şık aynı kelimeyi taşıyınca cevap onlardan biri:** anlam bilgisine gerek yok, soru bir artikel / edat sorusuna dönüşüyor.
- Veri: tüm geçmişte seçmeli `sec` yanlışlarının (50 satır) hepsi `der Toleranz`, `der Vorurteil`, `sorgen nach` türü. Yani anlam hiç yanlış değil, yalnız artikel / edat ikizi seçilmiş. Son 14 gün: `sec` %94 doğru (yanlış olmayan %99), `anla` %93, `metinde` %89.
- Çeldirici havuzu: `nah` (17 geniş B1 konusundan aynı türde 2 kelime, `THEMA_VON`) + `pool` (tüm liste, 2.931 öğe). `optionen` (DE → TR) yalnız 1 "bilinen" kelime alıyor, `optionenDE` hiç almıyor. Tuna listenin %9'unu (276 öğe) gördü: çeldiricilerin çoğu ona yabancı, doğru şık tek tanıdık kelime. `optionenDE`'de diğer kelimelerde (`w`) sözcük sınıfı da karışık (`pool0 = WOERTER` tümü), sıfat / zarf / bağlaç biçimden elenebiliyor.
- Hız: seçmeli medyan 3 sn, %81'i ≤ 3 sn. Düşünmeden tanıma.

### 2.2 Seçmeli nereden geliyor?
Son hafta (30.10–6.11) 206 seçmeli / 570 notlu cevap (%36):
| Kaynak | Sayı | Mekanizma (kern.js) |
|---|---|---|
| `tekrar:1` (yanlıştan 3–5 soru sonra) | 55 | `oturumIsle`: `b: max(1, b−1)`, `bicim: b > 1 ? null : 'sec'`. Yazmada yanlış yapılan kelime **bir alt basamağa, seçmeliye** iner; doğrusu az önce gösterildi |
| vadeli (normal) | 41 | `basamak`: `S < 2 → b = 1`; `r < 0.5 → b = 1` |
| kurtarma | 38 | `basamak(... kurtarma) → b = 1` |
| parti (tanıtımdan hemen sonra mini) | 36 | `partiBasladi`: `bicim: 'sec'`, `at: a` (gecikme 0) |
| ısınma | 20 | 29.10'dan beri günde 3, düzeltilmiş |
| akşam | 16 | |
Yanlışta yeniden sorma ve mini soru, araştırmanın istediği "zor ama başarılı" geri çağırmanın tersi: kısa gecikme + tanıma biçimi.

### 2.3 "Cevabı ezberliyorum": hafıza tanımayla şişiyor
Sorudan önce kaydedilen R (sistemin tahmini) ve gerçek sonuç (23.10–6.11; ikinci, tekrar ve yazılmayan cevaplar hariç):
| biçim | n | tahmin R | doğru | yanlış olmayan |
|---|---|---|---|---|
| sec | 196 | 0,87 | 0,94 | 0,99 |
| yaz | 98 | **0,90** | **0,52** | 0,67 |
| yaz0 | 75 | **0,91** | **0,56** | 0,75 |
| bos0 | 48 | 0,89 | 0,60 | 0,73 |
| bos | 18 | 0,92 | 0,67 | 0,72 |
| metin (gerçek paragraf boşluğu) | 42 | 0,89 | **0,33** | 0,38 |
| artikel | 172 | 0,84 | 0,74 | 0,74 |

Tek `items[id].m` hafızası seçmeli doğrularıyla büyüyor. `OFS.sec = 1.5` büyümeyi azaltıyor ama yetmiyor. Üretimde gerçek hatırlama tahminin 25–35 puan altında, yani aralıklar üretim için çok uzun. Başka göstergeler:
- Seçmeli doğru → ertesi gün ilk üretim: yaz %47, yaz0 %58, bos0 %67 doğru.
- 276 öğenin 143'ünde `pk = 0` (hiç ipucusuz üretmemiş), 125'inde `bm = 1` (yalnız seçmeli kanıtlı). **103 öğe "S < 7, bm 1, pk 0"**: seçmeli döngüsünde.
- Tam cümle (`cumle`) 14 günde 1 kez. Merdivenin üst basamağına çıkılamıyor.

### 2.4 Cümle çeşitliliği
- `satzPool` (app.js ~992): kendi çeviri cümleleri (`SAETZE` / `NSAETZE`) + Goethe örneği + okuma metinlerinden cümle (Türkçesiz). Çalışılan isimlerde kendi cümle ortalaması 3,1, **53 isimde ≤ 2**; fiillerde 3,8. `x` (nomen_extra) öğelerinde 0–2.
- `quellen/kaliplar.txt`: 2.393 satır, 1.793'ü cümle, 1.704'ünde `G.luecke` fiili buluyor, **1.668'i şu an cümle havuzunda değil** (671 fiil). Eklenirse çalışılan fiillerde 3,8 → 6,2 cümle olur.
- Bütün Türkçeli cümlelerden (5.892) hedef ismi içerenler de havuza girerse çalışılan isimlerde ortalama 3,1 → ~7,4 olur (basit regex ile kaba sayım).
- Boşluk sorusu Türkçe cümle çevirisini tam gösteriyor (`frageLueckeStufe`). Cümle tekrar edince "TR cümle → DE kelime" eşlemesi ezberleniyor. Aynı (öğe, cümle) en çok 8 kez gelmiş (`Kennst du ein schönes _____?`). Tekrar sırasına göre doğruluk: 1. görüş %56, 2. %70, 3. %88. Kelime değil cümle hatırlanıyor (n küçük, ihtiyatlı).

### 2.5 Artikel
- Flaş doğruluğu %74, 143 artikel hafızasının 14'ü ≥ 5 kez unutulmuş. En çok yanlış: die Geduld 13, das Rezept 12, das Vorurteil 9, die Praxis 8, die Kunst / die Toleranz / die Gymnastik 7, die Regel / das Missverständnis / die Diskussion 6 …
- Hata yönü: emin değilken **der** (der verilip die doğru 24, der verilip das doğru 13: 84 hatanın 37'si).
- Kural kapsamı: 1.593 ismin 575'inde `regel` var. `-anz` (Toleranz), `-enz` gibi die kuralları eksik. Gymnastik (‑ik), Diskussion / Situation (‑ion) kurallı olduğu hâlde tekrar tekrar yanlış: **kural cevaptan sonra gösteriliyor, önce sorulmuyor ya da kullandırılmıyor**. Bileşikte baş kelime (Vorurteil ← das Urteil, Frühjahr ← das Jahr) aynı durumda.
- Flaş soru artikeli yalnız yalın hâlde, Türkçe anlamla soruyor. Konuşmada lazım olan *dem / der / den* üretimi yok.

### 2.6 Fiil
- Fiil yazma sorusu (`abr`) mastar + edat + hâl düzeyinde (`sich verlassen auf`). Kalıplar (`kaliplar.txt`, fiil başına 3–4) yalnız tanıtımda ve Kalıplar sayfasında *gösteriliyor*, turda **sorulmuyor**.
- Kök (`kok`) %17 doğru ama %92 "yanlış değil": hatalar çoğunlukla biçim karışıklığı (`treffe` ← er/sie formu istenirken, `sich stellt vor`). Soru biçimi belirsiz.

### 2.7 Konuşma ve dinleme
- Ana turda ses kullanan soru yok. TTS yalnız düğme (`sesBtn`), dikte günde 1 (metin etkinliği). Log'da 0 `sprechen` satırı.
- Tuna'nın en zayıf becerisi Sprechen. Araştırma (Uchihara & Clenton 2023; Kang 2013) kelimenin sözlü üretiminin ayrıca çalışılması gerektiğini söylüyor.

### 2.8 Yeni kelime hızı
- Son 14 gün: günde 2–10 yeni, ortalama ~5. Kota 6 (Ayarlar 4/6/8), gençlik / birikme freni 2–4'e indiriyor.
- Yoklama (bilinen kelimeyi hızla eleme) 14 günde 2 kez çalıştı. A1–A2'de 1.131 öğeye hiç dokunulmamış. Sistem Tuna'nın bunları bilip bilmediğini bilmiyor.

---

## 3. Uygulamaya öneriler (öncelik sırasıyla)

Büyüklük: K = küçük (≤ 1 saat, tek fonksiyon), O = orta (yarım gün, birkaç fonksiyon + test), B = büyük (şema / mimari).

### Öncelik 1: hemen (şikâyetin doğrudan nedeni)

**A1. Anlam seçmelisinde artikel / edat ikizini kaldır.** K
- Ne: `optionenDE` içindeki `tuzak: 'artikel'` ve `tuzak: 'edat'` şıklarını kaldır. Anlam sorusunda bütün şıklar artikelli ise hepsi kendi doğru artikeliyle gelsin (artikel ipucu değil, bilgi olsun), istersen anlam sorusunda artikelsiz göster. Artikel ayrı ölçülür (flaş ve yazma zaten ölçüyor).
- Neden: yakınsama ipucu. Log'daki 50 seçmeli yanlışın hepsi ikiz şıktan, anlam sorusu anlamı ölçmüyor.
- Dosya: `js/app.js` `optionenDE`, `frageSecDE` (başlıktaki "· artikeliyle / · edatıyla" yazısı), `notVer`'de `sec` için `ca` (artikel notu) kaldırılır ya da yalnız `art` flaşına bırakılır.

**A2. Edat için ayrı, gerçekten zor seçmeli: aynı fiil, dört edat.** K
- Ne: `warten ___ (auf / für / an / über) + A`, ya da cümlede `Ich warte ___ den Bus.` Bütün şıklar aynı fiili taşır, yalnız edat değişir, böylece ipucu yok.
- Neden: edat Tuna'nın gerçek zorluğu. Bu bir kategori ayırt etme görevi; karışık sıralama burada yararlı (Brunmair & Richter 2019).
- Dosya: yeni `frageEdat` (app.js), `Kern.bicimSec`'e edatlı fiillerde b 1–2'de seçenek olarak.

**A3. Çeldirici seçimini yeniden yaz: tanıdık, aynı sınıf, biçimce / anlamca yakın.** O
- Ne: aday sırası şöyle olsun. (1) Tuna'nın karıştırdığı kelimeler (log'da `antwort ≠ loesung` olan seçmeli ve yazma cevapları, örn. `S.karisik[id] = [x, …]`). (2) `S.items`'ta olan (görülmüş), aynı tür ve aynı alt sınıf (`kl`), biçimce yakın (aynı önek ver-/be-/ent-/an-, `Kern.lev` ≤ 3, uzunluk ±3). (3) Aynı paket / ünite / konu. (4) Sık-300'den aynı sınıf. **Rastgele bilinmeyen kelime son çare**: dört şıktan en çok biri tanınmayan olsun. Türkçe şıklarda (DE → TR) da aynı mantık: çeldiricinin Türkçesi aynı uzunluk ve aynı sözcük türünde olsun ("-mek" fiil / isim karışmasın).
- Ön koşul: tanıtım günü yakın çeldirici yok (Tinkham; Nakata & Suzuki 2019a). Yakın çeldirici yalnız `S ≥ 1` tekrarlarda.
- Neden: Little vd. (2012), Little & Bjork (2015): fayda rekabetçi çeldiriciye bağlı. Tanıdıklık sezgisi engellenmeli.
- Dosya: `js/app.js` `optionen`, `optionenDE`, `ablenkFrei`. `Kern.lev`/`karismaOk` (kern.js 410–440) yeniden kullanılabilir. Test: `tests/test_kern.js`'e çeldirici birim testi.

**A4. Yanlıştan sonra yeniden sorma seçmeliye düşmesin.** K
- Ne: `oturumIsle`'de `deneme 2` için `bicim: secim.b > 1 ? null : 'sec'` → b ≥ 2 ise **aynı basamakta ipuçlu biçim** (yaz0: baş harf + uzunluk; cümle basamağında bos0), b 1 ise yaz0. Üçüncü deneme (tur sonunda) yaz0. Seçmeli yalnız klavyesiz turda.
- Neden: başarısız üretimin düzeltmesi yine üretim olmalı (transfer-appropriate processing). Seçmeli, cevabı az önce görmüşken %92 doğru ve öğretmiyor (Pyc & Rawson 2009).
- Dosya: `js/kern.js` `oturumIsle` (~645), `tests/test_kern.js`, `tests/sim_akis.js`.

**A5. Tanıtımdan sonraki mini soru: ya biraz gecikmeli ya da ipuçlu yazma.** K
- Ne: `partiBasladi`'de mini soruyu `at: a + 2` (araya 2 soru) ve `bicim: 'yaz0'`, ya da güçlü çeldiricili seçmeli (A3). İkinci hatırlama (`ikinci`, yaz0) kalsın, aralığı +4 → +6. Gün içinde akşam tekrarıyla birlikte ilk gün **≥ 3 geri çağırma** olsun (Nakata 2017: 5 ≥ 3).
- Dosya: `js/kern.js` `partiBasladi` (~662).

### Öncelik 2: hafıza ve merdiven (ezber yanılsamasının kökü)

**B1. Seçmeli doğrusu anlam hafızasını sınırlı büyütsün.** K–O
- Ne (en küçük sürüm): seçmeli doğrusunda `m.S`'nin üst sınırı `pk === 0` iken 2–3 gün olsun (`guncelle`'de `bicim` SECMELI ise `S = min(S, 3)`), ya da seçmeli doğru `notVer`'de `m: 2` ("hard") sayılsın. Böylece öğe 1–2 gün içinde yazmaya gelir.
- Ne (daha doğru, B): iki hafıza, `m.rek` (tanıma) ve `m.uret` (üretim). Vade ve merdiven `m.uret`'e göre; seçmeli yalnız `m.rek`'i günceller. Duolingo HLR'nin biçimi modele koyması bunun kanıtı.
- Neden: tablo 2.3. Tahmin 0,90, üretim 0,52–0,60. FSRS hedefi %85 üretim için tutmuyor.
- Dosya: `js/kern.js` `notVer`, `uygula`, `guncelle`, `basamak`, `seviye`. Şema değişirse `Kern.goc` / `birlestir` ve `tests/test_goc.js`.

**B2. Merdivende seçmeli basamağını kısalt.** K
- Ne: `basamak`'ta `S < 2 → b = 1` yerine "tanıtımdan sonraki ilk gün b = 1, sonra en az 2". `r < 0.5 → b = 1` kalsın ama kurtarma da yaz0 olsun (`bag.kurtarma → b = 2`, `yaz0`). Seçmeli payı hedefi: notlu cevapların ≤ %15'i (şu an %36–40).
- Kanıt: Lingvist ve WaniKani'de seçmeli yok ya da çok az. Laufer & Goldstein (2004): tanıma başarısı üretimi göstermez.
- Dosya: `js/kern.js` `basamak` (~241), `bicimSec` (~264).

**B3. Ezber koruması: aynı cümle tekrar ederse biçim değişsin ya da Türkçe gizlensin.** K
- Ne: `satzWahl` tazesi kalmamış cümle (`aeltest`) döndürdüğünde: (a) boşluk sorusunda Türkçe cümleyi gizle, yalnız aranan kelimenin kısa anlamı (`kurzTr`) görünsün; ya da (b) b'yi tam cümleye (başka cümle) çevir ya da (c) yalın `yaz`'a düş. Ayrıca aynı (öğe, cümle) 30 gün içinde ikinci kez gelmesin.
- Neden: Pagán & Nation (2019), bağlam çeşitliliği. Veri: 2. ve 3. görüşte doğruluk %70 ve %88 (cümle hatırlanıyor).
- Dosya: `js/app.js` `satzWahl` (~1008), `frageLueckeStufe`, `S.kontext`.

**B4. Metin boşluğu (%33) fazla zor: kolaylaştır.** K
- Ne: metin boşluğunda aday yalnız `bm ≥ 2` olan öğeler olsun (`Kern.sec` 3. adım). Baş harf ipucu ya da kelime bankası (4–6 kelime) eklensin.
- Neden: Suzuki vd. (2019): başarısız geri çağırma öğretmez. Hedef %70–85.
- Dosya: `js/kern.js` `sec` (metin dalı), app.js metin etkinliği.

### Öncelik 3: cümle çeşitliliği (ucuz, büyük kazanç)

**C1. Kalıp cümlelerini fiil cümle havuzuna kat.** K
- Ne: `satzPool`'da fiil için `KALIPLAR.fiil[id]` içindeki `[.!?]` ile biten ve `wortLuecke` bulunan cümleleri `own`'a ekle (Türkçesi var, tam cümle sorusunda da kullanılabilir). Ölçüm: 1.668 yeni cümle, çalışılan fiillerde 3,8 → 6,2.
- Gerekirse build'de `daten/kaliplar.js` → `SAETZE` birleşimi (`tools/build.py`). Glossen (yardım sözlüğü) eksik olabilir. Gece işi bu cümlelere `glossen.txt` satırı ekleyebilir.
- Dosya: `js/app.js` `satzPool` (~992).

**C2. Çapraz cümle dizini: başka öğelerin cümlelerinde geçen kelime.** O
- Ne: build sırasında her isim / kelime için, bütün Türkçeli cümlelerde (5.892) lemma ya da çoğul biçimiyle geçtiği cümlelerin listesi (`daten/` yeni alan `capraz`). `satzPool` bunları `own`'dan sonra kullanır. Boşluk sorusunda Türkçe cümle tamamıyla gösterilir, hedef kelime işaretlenir.
- Ölçüm: çalışılan isimlerde 3,1 → ~7,4 cümle. Bileşik / yanlış eşleşme için `wortLuecke` sınaması şart.
- Dosya: `tools/build.py`, `js/app.js` `satzPool`.

**C3. İçerik: az cümleli öğelere cümle yazımı gece işine.** O (içerik)
- Ne: çalışılan öğelerden kendi cümlesi ≤ 2 olanlara (53 isim + x öğeleri) 3'er cümle; leech ve "bilmiyorum" öğelerine öncelik. `tools/istem_gece.md`'ye kural olarak (CLAUDE.md 5c / 5d ile uyumlu, "her çalışılan öğede ≥ 4 Türkçeli cümle" hedefi).

### Öncelik 4: fiil = kalıp, artikel = kural + kullanım

**D1. Kalıp sorusu (chunk recall): TR kalıp → DE kalıp yazma.** O
- Ne: `kaliplar.txt`'teki kısa kalıplar (cümle olmayan 600 satır: `jemanden vom Bahnhof abholen` / "birini istasyondan almak") fiilin B2–B3 basamağında yeni biçim olsun: Türkçe kalıp görünür, Almanca kalıp yazılır (`G.cumleKontrol` ile). Fiil hafızasına yazar.
- Neden: Li & Lei (2022) kollokasyon öğretiminde d ≈ 1,4. Konuşma kalıp kalıp üretilir.
- Dosya: `js/app.js` yeni `frageKalip`, `Kern.bicimSec` (b 2–3, fiil), log modus `abr` id `vNNN:kalip` (CLAUDE.md log sözleşmesine ekleme gerekir).

**D2. Kök sorusunu netleştir.** K
- Ne: kök sorusu tek tek biçim istesin, kişiyi yazsın: `er/sie ___ (treffen)`, `gestern ___ er … (Präteritum)`, `er hat ___`. Ya da üç ayrı kutu ve her kutunun başında "er/sie". `treffe` türü hatalar biçim belirsizliğinden.
- Dosya: `js/app.js` `frageStamm`.

**E1. Artikelde kural önce, sonra cevap; kuralları ayrı kart yap.** O
- Ne: (1) Kurallı isimde ilk 2–3 flaşta soru altında soluk ipucu: "‑ion → ?" (cevabı değil kuralı hatırlatır). Kural ipucu kullanıldıysa not `a2`. (2) Sonek kuralları (‑ung, ‑heit, ‑keit, ‑ion, ‑tät, ‑ik, ‑anz, ‑enz, ‑ur, ‑schaft → die; ‑chen, ‑lein, ‑ment, ‑um, ‑ma → das; ‑ling, ‑ismus, ‑or, ‑ig, ‑ich → der; bileşikte baş kelime) **ayrı FSRS kartları**: "‑anz → ?" ve "Toleranz → ?", karışık sırayla. (3) Eksik kurallar `tools/build.py`'ye: `‑anz/‑enz → die` (Toleranz), `Ge‑ … ‑e → das` (istisna olarak Geduld).
- Neden: Presson vd. (2014): kural + geri bildirim > yalnız geri bildirim. Artikel bir kategori görevi, karışık sıralama uygun. Veri: ‑ik, ‑ion, bileşik isimler (kurallı) tekrar tekrar yanlış.
- Dosya: `tools/build.py` (`regel`), `js/app.js` `frageArtikel`, `regelHTML`, `js/kern.js` (kural kartı için yeni tür `r:<sonek>` ya da `S.artKural`).

**E2. Artikeli hâl içinde üret.** O
- Ne: isimde B3 boşluğunda bazen yalnız artikel / ek boşluğu: `Ich habe ___ Geduld verloren` (die), `mit ___ Rezept` (dem). `G.np` zaten çekim üretiyor. Artikel hafızasına yazar.
- Neden: konuşmada artikel yalın değil, hâl çekimli kullanılır. Hopp (2013): atama doğruluğu işlemlemeyle bağlantılı.
- Dosya: `js/app.js` yeni `frageArtikelKasus`, `js/grammatik.js` `np`.

**E3. "der" varsayılanına karşı geri bildirim.** K
- Ne: Tuna kuralı olmayan isimde "der" seçip yanılınca sonuç panelinde: "Emin değilken *der* diyorsun. Bu kelime kuralsız, renkle hatırla: **die** (kırmızı)". 3. yanlışta kanca istenir (zaten leech).
- Dosya: `js/app.js` sonuç paneli, `regelHTML`.

### Öncelik 5: ses (konuşma ve dinleme)

**G1. Sesli cevap biçimi (Chrome konuşma tanıma).** O–B
- Ne: Tuna Chrome masaüstünde çalışıyor; `webkitSpeechRecognition` (`lang = 'de-DE'`) mevcut. Yeni biçim `soyle`: Türkçe kelime / kalıp / kısa cümle → Tuna Almanca söyler → tanıma metni `G.pruefen` / `cumleKontrol` ile hoşgörülü kontrol (yazım hoşgörüsü daha geniş) → sonra doğru ses (TTS) çalar. Notu sistem verir (kural 8 korunur). Tanıma başarısızsa "yazarak cevapla" yedeği, hafızaya yazmaz.
- Neden: Kang vd. (2013): sesli geri çağırma üretimde taklitten iyi. Icht & Mama (2019): sesli üretim kalıcılığı artırır. Uchihara & Clenton (2023): sözlü kelime bilgisi konuşmayla ilişkili. Tuna'nın en zayıf becerisi Sprechen.
- Riskler (emin değilim): öğrenici aksanında tanıma doğruluğu; Chrome sesi Google sunucusuna gönderir (gizlilik notu Ayarlar'da); ağ gerektirir. Önce isteğe bağlı mod olarak ("sesli tur"), log notiz `ses:tanıma`.
- Dosya: `js/app.js` yeni `frageSoyle`, `Kern.bicimSec` (b ≥ 2 biçim seçeneği), CLAUDE.md log sözleşmesi.

**G2. Her cevaptan sonra doğru biçimi otomatik seslendir (isteğe bağlı ayar).** K
- Ne: sonuç panelinde kelime (isimde artikel + çoğul) ve cümle `sprich()` ile otomatik okunsun (Ayarlar'da aç / kapa).
- Neden: kelimenin ses biçimini oturtur. Tuna "dinleme önemli" diyor.
- Dosya: `js/app.js` sonuç paneli (`sonucPanel`).

**G3. Dinle → yaz (dikte) biçimi turda düzenli.** K–O
- Ne: B3'te boşluk yerine bazen "cümleyi dinle, boşluktaki kelimeyi yaz" (TTS ile cümle, metin gösterilmez ya da boşluklu gösterilir). Dikte şu an günde 1. Kelime düzeyinde haftada birkaç kez olabilir.
- Dosya: `js/app.js` `frageLueckeStufe` varyantı.

### Öncelik 6: hız ve hedef

**F1. Hızlı yoklama turu: A1–A2 ve sık-300.** O
- Ne: 2 hafta boyunca günde 20–30 öğelik "biliyor musun" turu, **yazarak** (TR → DE, yaz0), seçmeli değil. Doğru ve hızlı (≤ 8 sn) → uzun aralıkla başlat (bm 2, S ~10). Yanlış → yeni sıraya. Mevcut `yoklama` mekanizması (`frageYoklama`, `yoklamaHak`) günde 4 ile sınırlı, ayrı bir "tarama" turu olarak genişlet.
- Neden: 1.131 A1/A2 öğesi hiç sınanmadı. Bilinen kelimeye günlük tekrar harcamamak, bilinmeyeni bulmak (TASARIM.md "ön test" ilkesi, Kornell vd. 2009).
- Dosya: `js/kern.js` `yeniParti` / `yoklama`, `js/app.js` mod.

**F2. Yeni kelime kotası: önce seçmeliyi azalt, sonra 8–10'a çık.** K
- Ne: A1, A4, B2 uygulanınca günde ~40–60 kolay seçmeli cevap boşa çıkar. `ayar4.yeniGunluk` seçeneğine 10 ekle, varsayılanı 8 yap. Fren mantığı (`kota`) kalsın.
- Hesap (kaba): FSRS %85 hedefte yeni kelime ilk ayda ~6–8 tekrar ister [H]. Günde 10 yeni ≈ 60–80 tekrar, Tuna'nın günde 80–120 cevabına sığar. Bu hızla B1 listesinin geri kalanı ~5 ay.
- B2 hedefi (~3.500–3.750 üretken lemma; Milton, GerVLPro): A1/A2 tarama + B1 + B2 ünite kelimeleri. B2 kursu için Netzwerk B2 ünite listeleri `uniteN.txt` ile eklenmeli.
- Dosya: `js/kern.js` `kota`, Ayarlar UI.

**F3. Aralıklar.** K
- Mevcut: 60 gün üst sınır, bm kapıları 7 / 14 / 30 g, yanlışta ertesi gün 04:00. B1 uygulanınca bunlar makul (Cepeda 2008: 1 yıllık hedefte optimum aralık ~3–5 hafta).
- Öneri: yeni kelimede ilk gün içinde 3 geri çağırma (mini → +6 soru → akşam), sonra 1 g → 3 g → 7 g. WaniKani'nin 4 sa / 8 sa / 1 g / 2 g merdivenine benzer. Yanlışta ertesi gün yeniden öğrenme, ölçüt 1 ipucusuz doğru (successive relearning).

### Ölçme: değişikliklerin işe yarayıp yaramadığı
- `tools/` altında haftalık rapor (ya da Claude'un "sonuçlarıma bak" adımında): biçim başına tahmin R ve gerçek doğru oranı (tablo 2.3), seçmeli payı, seçmeli medyan süresi, aynı (öğe, cümle) tekrar sayısı.
- Hedef: üretimde tahmin ile gerçek arasındaki fark < 10 puan; seçmeli < %15; yaz / bos doğruluğu %70–85; aynı cümle 30 günde ≤ 1.

---

## 4. Tuna'nın kendi yapacakları (uygulama dışı + kullanım alışkanlığı)

1. **Her cevabı önce sesli söyle, sonra yaz ya da seç.** Seçmelide şıklara bakmadan önce cevabı içinden değil *sesli* söyle. Sesli üretim kalıcılığı artırıyor (Icht & Mama 2019) ve konuşma pratiği oluyor.
2. **İsmi hep "artikel + isim + çoğul" olarak, fiili "er-formu + Perfekt + edat/hâl" olarak sesli söyle:** *die Geduld, —*; *treffen – trifft – hat getroffen*; *warten auf + Akk*. Kural varsa kuralı da söyle: "‑ion, die".
3. **Günde 10 dakika kendinle konuşma:** o günün 5–10 kelimesiyle bir şey anlat (dünün, planın, bir haber). 4/3/2 tekniği: aynı konuyu 4 dk, sonra 3 dk, sonra 2 dk anlat [Nation & Newton, H]. Akıcılık ve kelimeye hızlı erişim için. Telefonla kaydet, bir kez dinle.
4. **Okurken dinle:** DW Top-Thema / Langsam gesprochene Nachrichten'te metni sesle birlikte oku (uygulamada mp3 var). Sonra yalnız sesi bir kez daha dinle. Bilinmeyen kelimeye dokun (`lesen-wort`, uygulama sıraya alıyor).
5. **Etkileşimli konuşma:** Bremen'de Sprachcafé / Tandem (Uni Bremen'in tandem programı, kurs arkadaşları). Etkileşimli sözlü girdi, etkileşimsiz dinlemeden daha çok kelime kazandırıyor (de Vos vd. 2018). Haftada 1–2 kez, öncesinde uygulamadaki 5 kelimeyi kullanmayı hedefle.
6. **Kursta duyduğun her yeni kalıbı not et** (fiil + nesne + edat, *einen Antrag stellen*). Claude'a gönder, `kaliplar.txt`'e eklensin.
7. **"Bilmiyorum"u dürüst kullan, tahmin etme;** "aslında doğru" itirazını yalnız gerçekten doğruysa kullan. Kolay doğru, öğrenme yanılsaması yaratır.
8. **Kısa ama dağıtık çalış:** sabah ve akşam iki blok, 12'lik turlar iyi. Gün içinde 2–3 kez kısa tur, bir oturumda 100 cevaptan daha verimli (aralık etkisi).

---

## 5. Kaynaklar (seçme)
- Kim, S. K. & Webb, S. (2022). The effects of spaced practice on second language learning: A meta-analysis. *Language Learning* 72(1). https://doi.org/10.1111/lang.12479
- Cepeda, N. J. vd. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science* 19(11). https://pubmed.ncbi.nlm.nih.gov/19076480/
- Adesope, O. O., Trevisan, D. A. & Sundararajan, N. (2017). Rethinking the use of tests. *RER* 87(3). https://doi.org/10.3102/0034654316689306
- Little, J. L., Bjork, E. L., Bjork, R. A. & Angello, G. (2012). Multiple-choice tests exonerated, at least of some charges. *Psychological Science* 23(11); Little & Bjork (2015). https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf
- Laufer, B. & Goldstein, Z. (2004). Testing vocabulary knowledge: Size, strength, and computer adaptiveness. *Language Learning* 54(3).
- Steinel, M. P., Hulstijn, J. H. & Steinel, W. (2007). *SSLA* 29. https://scholarlypublications.universiteitleiden.nl/handle/1887/14200
- Schneider, V. I., Healy, A. F. & Bourne, L. E. (2002). What is learned under difficult conditions is hard to forget. *JML* 46.
- Webb, S. (2009). Receptive and productive vocabulary learning. https://cambridge.org/core/journals/studies-in-second-language-acquisition/article/receptive-and-productive-vocabulary-learning-the-effects-of-reading-and-writing-on-word-knowledge/DDF362AE7B13D1949B1CD591DA2F3414
- Kang, S. H. K., Gollan, T. H. & Pashler, H. (2013). Don't just repeat after me. *PB&R* 20. https://www.learningscientists.org/blog/2025/6/20-1
- Nakata, T. (2017). Does repeated practice make perfect? *SSLA* 39(4).
- Nakata, T. & Suzuki, Y. (2019a). Effects of massing and spacing on the learning of semantically related and unrelated words. *SSLA* 41(2). https://doi.org/10.1017/S0272263118000219 ; (2019b) Mixing grammar exercises facilitates long-term retention. *MLJ* 103(3).
- Pagán, A. & Nation, K. (2019). Learning words via reading: Contextual diversity, spacing, and retrieval effects in adults. *Cognitive Science* 43(1). https://doi.org/10.1111/cogs.12705
- Brunmair, M. & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin* 145(11). https://pubmed.ncbi.nlm.nih.gov/31556629/
- Suzuki, Y., Nakata, T. & DeKeyser, R. (2019). The desirable difficulty framework… *MLJ* 103(3). https://doi.org/10.1111/modl.12585
- Wang, A. Y. & Thomas, M. H. (1995). Effect of keywords on long-term retention: Help or hindrance? https://stars.library.ucf.edu/facultybib1990/1498
- Li, X. & Lei, L. (2022). Effectiveness of L2 collocation instruction: a meta-analysis. *IRAL*. https://www.degruyterbrill.com/document/doi/10.1515/iral-2021-0218/html
- Presson, N., MacWhinney, B. & Tokowicz, N. (2014). Learning grammatical gender: The use of rules by novice learners. *Applied Psycholinguistics* 35(4).
- Arzt, J. & Kost, C. (2016); Kohler (KU dissertation): renk kodlama. https://kuscholarworks.ku.edu/handle/1808/10026
- Uchihara, T., Webb, S. & Yanagisawa, A. (2019). The effects of repetition on incidental vocabulary learning: A meta-analysis. *Language Learning* 69(3).
- de Vos, J. F. vd. (2018). A meta-analysis and meta-regression of incidental second language word learning from spoken input. *Language Learning* 68(4). https://www.mpi.nl/publications/item_3008448
- Yanagisawa, A. & Webb, S. (2021). To what extent does the Involvement Load Hypothesis predict incidental L2 vocabulary learning? *Language Learning*. https://next.sciencegate.app/document/10.1111/lang.12444
- Icht, M. & Mama, Y. (2019). The effect of vocal production on vocabulary learning in a second language. *LTR*. https://cris.iucc.ac.il/en/publications/the-effect-of-vocal-production-on-vocabulary-learning-in-a-second/
- Uchihara, T. & Clenton, J. (2023). The role of spoken vocabulary knowledge in L2 speaking proficiency. https://eld.bl.uk/catalog/100184186364_0x000001
- Milton (2009/2010), Milton & Alexiou: CEFR kelime büyüklüğü (Nation'ın tablosu). https://wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists/vocabulary-cefr-and-word-family-size/vocabulary-and-the-cefr-docx
- GerVLPro (2026). https://www.leibniz-ipn.de/en/research/publications/gervlpro
- Settles, B. & Meeder, B. (2016). A trainable spaced repetition model for language learning. ACL. https://preview.aclanthology.org/fix_video/P16-1174.pdf
- Clozemaster FAQ https://www.clozemaster.com/faq · Lingvist https://lingvist.com/blog/learn-with-lingvist-in-three-easy-steps/ · WaniKani SRS https://knowledge.wanikani.com/wanikani/srs-stages/
- Rawson & Dunlosky, successive relearning (inceleme). https://link.springer.com/article/10.1007/s10648-023-09809-2
- [H] (bu oturumda doğrulanmadı): Rowland 2014; Karpicke & Roediger 2008; Pyc & Rawson 2009; Roediger & Marsh 2005; Haladyna, Downing & Rodriguez 2002; Smith 1982; Butler 2018; Bolger vd. 2008; Johns vd. 2016; Ellis & Beaton 1993; Dunlosky vd. 2013; Köpcke & Zubin 1984; Nation 2006; Webb 2007; Barcroft (TOPRA); Boers & Lindstromberg 2012; Kornell, Hays & Bjork 2009.
