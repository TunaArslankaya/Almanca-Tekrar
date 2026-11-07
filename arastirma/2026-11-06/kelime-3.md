# kelime-3 — Kelime ve fiil nasıl kalıcı öğrenilir + Tuna'nın verisi + öneriler (6.11.2026)

Kapsam: araştırma özeti (meta-analiz / ölçülmüş etki öncelikli) → `log/log.csv` (3 773 satır, 30.09–06.11) ve `log/zustand.json` (276 öğe) üzerinde ölçümler → uygulamada somut değişiklikler → Tuna'nın kendi yapacakları.
Repo'ya dokunulmadı. Ölçüm betikleri: `scratchpad/k3/a1.py … a4.py`.

---

## 0. Kısaca

1. **Tuna'nın teşhisi veride birebir görünüyor.** Son 14 günde kelime sorularının %45'i seçmeli; seçmelide doğruluk %93, ortanca süre 3 sn. Aynı kelimede yazma doğruluğu %49. 76 öğenin 35'inde seçmeli ≥ %85, yazma ≤ %50 (der Donner seçmelide 8/8, yazmada 0/2). Seçmelide doğru cevap verdikten sonra aynı kelimenin yazılması ancak **%59** doğru çıkıyor. Kısacası seçmeli, üretimi pek tahmin etmiyor.
2. **Merdiven bir "seçmeli koşu bandı" kurmuş.** Yazmada yanlış yapılınca aynı kelimenin bir sonraki sorusu **100 durumun 99'unda seçmeli** oluyor (`kern.js` `oturumIsle` 656–657: yanlış → `b − 1`, 3. deneme `sec`). Öğelerin %41'i (112/276) hiç ipucusuz üretilmemiş (`bm 1`, `pk 0`). 15–25.10 arasında giren kelimelerin 2–3 hafta sonra yalnız %32'si üretim kanıtına sahip.
3. **"Cevabı ezberliyorum" ölçülebiliyor.** Boşluklu cümlelerde, daha önce görülmüş öğe **aynı cümlede** sorulunca doğruluk %75–79, **yeni cümlede** %57–59 (yaklaşık 20 puan fark). Bugün tekrarın asıl kaynağı Stammform cümlesi (`frageStammSatz`): bu soruların %64'ü tekrar cümle, bir cümle 8 kez gelmiş. Ana merdivenin cümle seçimi (`satzWahl`) geçmişe bakıyor, `frageStammSatz` bakmıyor.
4. **Yazmadaki yanlışların çoğu komşu kelimeden geliyor:** anwesend ↔ allerdings (3 kez), fließend → fleißig, Antrag → Vertrag, Wert → Würde, Behörde → Amt, übertreiben → überweisen, vorschlagen → empfehlen, hageln → donnern, glatt/mild → nass. Asıl güçlü çeldiriciler bunlar. Bugünkü çeldiriciler ise ya konudan ya rastgele seçiliyor ve çoğunu Tuna hiç görmemiş, bu yüzden tanıdık olanı seçmek yetiyor.
5. **Artikel öğrenilmiyor.** der/die/das flaşında doğruluk ilk görüşte %68, 8. görüşten sonra %67, yani düz. Hataların %51'i "der varsayımı". Kurala uyan isimler de yanlış: Diskussion 6/12, Gymnastik 7/8, Toleranz 7/10.
6. **Araştırmanın genel söylediği:** üretim (L1 → L2 hatırlama) ve ipucusuz geri çağırma, seçmeliye göre hem üretim hem tanıma bilgisini daha çok artırıyor. Seçmeli ancak çeldiriciler rekabetçiyse ve önce zihinden hatırlamaya zorlanıyorsa işe yarıyor. Aynı kelime farklı bağlamlarda çalışılmalı ama her seferinde hatırlama istenmeli. Konuşma için kalıplar ve sesli üretim gerekiyor, tekrar edip dinlemek (imitation) yetmiyor.

---

## 1. Araştırma: ne biliniyor

| Konu | Bulgu (etki) | Kaynak | Tuna için anlamı |
|---|---|---|---|
| Geri çağırma (testing effect) | Test etmek tekrar okumaktan güçlü. Meta-analizlerde orta etki: Rowland 2014 g ≈ 0,50; Adesope vd. 2017 g ≈ 0,6 (118 makale, 272 etki; tam değeri birincil kaynaktan doğrulayamadım). Karpicke & Roediger 2008: tekrar okuma gecikmeli hatırlamaya hiç katkı yapmadı, tekrar test büyük katkı yaptı. | [Rowland 2014, Psych Bull](https://doi.org/10.1037/a0037559) · [Adesope vd. 2017, RER](https://journals.sagepub.com/doi/10.3102/0034654316689306) · [Karpicke & Roediger 2008](https://pubmed.ncbi.nlm.nih.gov/18276894/) | Her soru bir hatırlama olmalı. Tanıtım kartını tekrar tekrar göstermek ya da kopyalatmak boşa. |
| Hatırlama mı, taklit mi | Yabancı kelimede "dinle-tekrar et" yerine "hatırla, sonra geri bildirim al" daha iyi öğretti; telaffuz kalitesinde fark yoktu. | [Kang, Gollan & Pashler 2013, PB&R](https://doi.org/10.3758/s13423-013-0450-z) | Shadowing telaffuz için yararlı ama kelime öğretmez. Önce kelimeyi kendisi söylemeli, sonra sesi dinlemeli. |
| Test biçimi | Geri bildirim varken kısa cevaplı (yazma) ara test, seçmeliden daha iyi kalıcılık sağladı. Yazar yorumu: "geri çağırma ne kadar zorsa kazanç o kadar büyük". | [Kang, McDermott & Roediger 2007](https://www.gwern.net/docs/spaced-repetition/2007-kang.pdf) | Geri bildirim zaten veriliyor, yani yazma seçmeliden üstün olmalı. Seçmeli yalnız yazmanın çoğu zaman başarısız olduğu ilk aşamada mantıklı. |
| Üretim ve tanıma | Laufer & Goldstein 2004 hiyerarşisi: aktif hatırlama > pasif hatırlama > aktif tanıma > pasif tanıma; tanıma bilgisi üretimi garanti etmez. Üretken çalışma (L1 → L2) hem üretim hem tanıma bilgisini artırdı; alıcı çalışma çoğunlukla yalnız alıcı anlam bilgisini artırdı (Webb 2009, Mondria & Wiersma 2004; ikincil özetlerden). Öğrenme yönü test yönünü etkiliyor (Steinel vd. 2007). | Laufer & Goldstein 2004, *Language Learning* 54(3) · [Webb 2009, RELC](https://journals.sagepub.com/doi/10.1177/0033688209343854) · [Mondria & Wiersma 2004](https://benjamins.com/catalog/lllt.10.08mon) · [Steinel, Hulstijn & Steinel 2007, SSLA](https://hdl.handle.net/1887/14200) | Hedef konuşmak, yani L1 → L2 üretim. Tuna'nın açığı (tanıma %92, üretim %49) bu literatürün öngördüğü tablo. |
| Seçmeli ve çeldirici | Rekabetçi (makul) çeldiriciler, öğrenciyi yanlış şıklarla ilgili bilgiyi de geri çağırmaya zorlar ve sonraki testte doğruyu artırır; rekabetçi olmayan şıklar bunu yapmaz. Seçmeli yanlış bilgiyi de öğretebilir (lure etkisi), bu yüzden geri bildirim şart. | [Little, Bjork vd. 2012, Psych Sci](https://doi.org/10.1177/0956797612443370) · [Little & Bjork 2015](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf) · Roediger & Marsh 2005, JEP:LMC · [Butler 2018, JARMAC](https://doi.org/10.1016/j.jarmac.2018.07.002) | Şıklar Tuna'nın **gerçekten karıştırdığı** kelimelerden gelmeli. Hiç görmediği kelime çeldirici olunca eleme yetiyor, öğrenme olmuyor. |
| Şıkları geciktirmek | "Önce soru, birkaç saniye sonra şıklar" (stepwise) biçimi, dört deneyin üçünde birkaç gün sonraki kalıcılığı standart seçmeliye göre artırdı. Etki en çok, öğrenci beklerken gerçekten hatırlamaya çalıştığında görüldü. Saha replikasyonları daha zayıf; kendi hızında açılan bekleme öneriliyor. | [van den Broek vd. 2023, J Educ Psych](https://research-portal.uu.nl/en/publications/optimizing-multiple-choice-questions-for-retrieval-practice-delay/) | Uygulamada 1,2 sn bekleme var ama dokununca hemen açılıyor. Tuna'nın ortanca 3 sn'lik cevabı, beklemenin işlemediğini gösteriyor. |
| Anlamca / biçimce benzer kelimeler | Anlamca ilişkili kelimeleri birlikte öğrenmek karışma (interference) hatalarını artırıyor (Tinkham 1993/1997; Nakata & Suzuki 2019: test puanı aynı, karışma hatası fazla; aralıklı çalışma beklenenin aksine ilişkisiz kelimelere daha çok yaradı). Biçimce benzer kelimeler ("synform", Laufer) kalıcı karışma kaynağı. | [Nakata & Suzuki 2019, SSLA](https://doi.org/10.1017/S0272263118000219) · [Laufer, synforms](https://cris.haifa.ac.il/en/publications/the-concept-of-synforms-similar-lexical-forms-in-vocabulary-acqui/) · Tinkham 1997, *Second Language Research* | Benzer kelimeler **aynı gün tanıtılmamalı** (anwesend/allerdings ikisi de a- ile başlıyor ve aynı dönemde girdi). Ama bir kez karıştırıldıktan sonra yan yana **ayırt etme** sorusu olarak sorulmalı. |
| Bağlam çeşitliliği | Farklı bağlamlarda görülen kelime öğrenme sırasında daha yavaş ama testte daha iyi öğreniliyor (Pagán & Nation 2019; Johns, Dye & Jones 2016). Bilgilendirici bağlam anlamayı kolaylaştırıyor, **kalıcılığı ise geri çağırma** sağlıyor; yeni bağlamda tanıma da geri çağırmayla daha iyi (van den Broek vd. 2018). | [Pagán & Nation 2019, Cogn Sci](https://doi.org/10.1111/cogs.12705) · [Johns, Dye & Jones 2016, PB&R](https://doi.org/10.3758/s13423-015-0980-7) · [van den Broek vd. 2018, Lang Learn](https://pure.mpg.de/pubman/item/item_2506637_4/component/file_2603172/VandenBroek_etal_2018.pdf) | Aynı cümle tekrarlanınca ipucu cümlenin kendisi oluyor (Tuna'nın "cevabı ezberliyorum"u). Her tekrarda yeni cümle, ama cümle cevabı vermemeli. |
| Aralıklı tekrar | L2 meta-analizi (98 etki, 48 deney, N = 3 411): aralıklı çalışmanın etkisi orta-büyük; gecikmeli testte uzun aralık kısadan iyi; **eşit ve genişleyen aralık istatistiksel olarak eşit**. Genel bellekte optimal aralık, hedeflenen saklama süresinin %20–40'ı (1 hafta) ile %5–10'u (1 yıl) arasında. | [Kim & Webb 2022, Lang Learn 72(1)](https://doi.org/10.1111/lang.12479) · [Cepeda vd. 2008, Psych Sci](https://pubmed.ncbi.nlm.nih.gov/19076480/) · Cepeda vd. 2006, Psych Bull | FSRS ve 60 günlük tavan makul; sorun aralıkta değil, **hangi biçimle** sorulduğunda. |
| Oturum içi tekrar sayısı | 5–7 geri çağırma, 1–3'ten daha iyi kalıcılık sağladı; ama harcanan zaman eşitlenince tek geri çağırma en verimlisiydi. | [Nakata 2017, SSLA 39(4)](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E) | Yanlıştan sonra aynı turda bir kez daha sormak yeterli, ama **aynı biçimde** (üretimde) sorulmalı. |
| İstenen zorluklar | Zorluk, başarılabildiği sürece kalıcılığı artırır; çok zor iş (başarısızlık) faydasız. L2 için çerçeve: Suzuki, Nakata & DeKeyser 2019. | Bjork & Bjork 2011 · [Suzuki, Nakata & DeKeyser 2019, MLJ](https://doi.org/10.1111/modl.12581) | Hedef: zor ama çoğunlukla başarılan sorular (yaklaşık %65–85; kesin eşik konusunda emin değilim). Bugün seçmeli %93 (fazla kolay), metin boşluğu %33 (fazla zor). |
| Karışık sıralama (interleaving) | Genel etki orta (g ≈ 0,42), ama **kelime malzemesinde bloklu çalışma daha iyi çıktı (g ≈ −0,39)**. Kategoriler arası benzerlik yüksek ve karışan kategorilerde karıştırmak yararlı. | [Brunmair & Richter 2019, Psych Bull](https://pubmed.ncbi.nlm.nih.gov/31556629/) | Kelime turlarını "karıştırmak" kendi başına kazanç değil. Karıştırma yalnız **ayırt etme** gereken şeylerde yararlı: der/die/das kuralları, haben/sein, liegen/legen. |
| Anahtar kelime (mnemonik) | Hemen sonra hatırlamada güçlü, ama unutma rote öğrenmeden **daha hızlı** (Wang & Thomas 1995). Uzun vadeli sonuçlar karışık (Goñi-Artola & González 2017 derlemesi). Dunlosky vd. 2013 "düşük yarar" diyor. | [Wang & Thomas 1995](https://archive.memory-key.com/research/Wang95) · [Goñi-Artola & González 2017](https://revistas.udc.gal/index.php/reipe/article/download/reipe.2017.0.01.2685/pdf/9948) · Dunlosky vd. 2013, PSPI | Uygulamanın kancayı yalnız takılan kelimede kullanması doğru. Kanca geri çağırma sorusunun yerine geçmemeli. |
| Kalıplar (chunks, Kollokation, fiil + edat + hâl) | Kalıp repertuvarı, hakemlerin sözlü yeterlilik puanıyla ilişkili; kalıp öğretimi alan grup sözlüde daha yüksek puan aldı (küçük örneklem). | [Boers vd. 2006, LTR 10(3)](https://doi.org/10.1191/1362168806lr195oa) · Boers & Lindstromberg 2012, *ARAL* 32 | Tuna'nın asıl zayıflığı Sprechen. Fiiller tek kelime değil, `sich verlassen auf + A` / `einen Antrag stellen` gibi **bütün kalıp** olarak üretilmeli. |
| Artikel | Artikel ile ismi birlikte (bağlam içinde) ilk kez görenler, ismi önce yalın görenlerden hem ismi hem artikeli daha iyi öğrendi (Arnon & Ramscar 2012). Üretim temelli artikel alıştırması, anlama temelliye göre hem anlama hem üretimde daha iyi sonuç verdi (Keppenne, Hopman & Jackson 2021). Sonek ipuçlarının başlangıçta etkisi sınırlı; açık bilgi hızlı kullanıma kendiliğinden geçmiyor. | [Arnon & Ramscar 2012, Cognition](https://doi.org/10.1016/j.cognition.2011.10.009) · [Keppenne vd. 2021, Appl Psycholing](https://doi.org/10.1017/S014271642100014X) · [Bilingualism L&C, gender in German](https://www.cambridge.org/core/product/5895E8C516EF242573A6351D05F6310B) | 2 saniyelik "Supermarkt → der?" flaşı tek başına işe yaramıyor (veride düz %70). Artikel sözcük öbeği içinde **üretilmeli** (`mit ___ Geduld`, `ich brauche ___ Rezept`) ve sesli söylenmeli. |
| Sesli söyleme (production effect) | Sesli söylenen kelime, sessiz okunana göre daha iyi hatırlanıyor (Fawcett 2013 meta-analizi: küçük ama güvenilir etki, g ≈ 0,37 civarı; sonraki güncellemede etki tanımada var, serbest hatırlamada belirsiz). | [MacLeod & Bodner 2017](https://journals.sagepub.com/doi/10.1177/0963721417691356) · Fawcett 2013, *Can J Exp Psych* | Telaffuz ve hafıza aynı hamlede çalışır: her yazma sorusunda kelimeyi sesli de söylemek. |
| Akıcılık (konuşma) | 4/3/2 görevi (aynı konuyu 4, 3, 2 dakikada anlatmak) üç oturumda akıcılığı artırdı ve yeni konulara aktarıldı. | [de Jong & Perfetti 2011, Lang Learn 61(2)](https://www.lrdc.pitt.edu/perfettilab/pubpdfs/de%20Jong%20Language%20Learning.pdf) | Sprechen Teil 2 bölümü bu biçime çok uygun, ama hiç kullanılmamış (0 `sprechen` satırı). |
| Katılım yükü (ihtiyaç / arama / değerlendirme) | 42 çalışma, 398 etki: kelimeyi kullanma ihtiyacı ve kelimeyi bağlamda değerlendirme kalıcılığı artırıyor; katılım yükü, harcanan süreden daha önemli. | [Yanagisawa & Webb 2021, Lang Learn 71(2)](https://doi.org/10.1111/lang.12444) | Kelimeyi kendi cümlesinde kullanmak (Cümle atölyesi "kur") yüksek yüklü bir görev; şu an hiç kullanılmıyor (0 `cumle` satırı). |
| Okuma / dinlemeyle tesadüfi öğrenme | Meta-analiz (24 çalışma): okuma, dinleme ve okurken dinleme benzer, ama mutlak kazanç düşük: hemen %9–18, gecikmeli %6–17. Tekrar sayısının etkisi orta (r = .34). | [Webb, Uchihara & Yanagisawa 2023, Lang Teach](https://www.cambridge.org/core/product/E38E3468FD2090B1FA3051051DE8E70C) · [Uchihara vd. 2019, Lang Learn 69(3)](https://doi.org/10.1111/lang.12343) | Dinleme Tuna'nın sevdiği kanal; kelimeyi sağlamlaştırmaya ve hacme yarar, ama yeni kelimeyi tek başına öğretmez. Dinlerken takıldığı kelime hedefli tekrara girmeli. |
| Kelime sayısı hedefi | İngilizce için X_Lex ölçümüne göre B1 ≈ 2 750–3 250, B2 ≈ 3 250–3 750 kelime (Fransızcada daha düşük). Okumada %98 kapsama için 8–9 bin, konuşmayı anlamak için 6–7 bin kelime ailesi (Nation 2006). Almanca için doğrudan karşılığından emin değilim; Goethe B1 listesi yaklaşık 2 400 madde, Tschirner'in sıklık sözlüğü 4–5 bin kelime. | [Milton & Alexiou 2009](https://www.enl.auth.gr/gala/14th/Papers/English%20papers/Milton&Alexiou.pdf) · [Nation, Vocabulary & CEFR](https://wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists/vocabulary-cefr-and-word-family-size/vocabulary-and-the-cefr-docx) · Nation 2006, CMLR | B2 için tanıma düzeyinde yaklaşık 4 000 kelime; üretimde en sık ~1 500 kelime ve kalıp. Günde 6 yeni kelimeyle 2 400'e bir yıldan fazla gider. Yani **üretim (derin) hattı** dar ve sık kelimelerde tutulmalı, **tanıma hattı** okuma/dinleme ve hızlı yoklamayla genişlemeli. |

---

## 2. Tuna'nın verisi: ölçümler

Kategoriler: seçmeli = `erk` / `bed` (bicim `sec`, `anla`, `metinde`); yazma = `wort` / `abr` / `prod`; cümle = `nsatz` / `satz` / `refl` / `ndek` / `luecke` (metin hariç); metin = `luecke` + `bicim:metin`; artikel = `art`. "Katı" = yalnız `richtig`, "esnek" = `richtig` + `fast`. `sayılmadı` satırları çıkarıldı.

### 2.1 Dağılım ve doğruluk (son 14 gün, 23.10–06.11)

| Tür | Soru | Pay | Katı | Esnek | Ortanca süre |
|---|---|---|---|---|---|
| Seçmeli | 428 | %45 | %93 | %97 | 3 sn |
| Artikel flaşı | 172 | %18 | %74 | – | 2 sn |
| Yazma | 240 | %25 | %57 | %72 | 4–5 sn |
| Cümlede boşluk | 67 | %7 | %63 | %73 | 5–8 sn |
| Metin boşluğu | 42 | %4 | %33 | %38 | – |
| Tam cümle | 1 (v5'ten beri) | ~0 | – | – | – |

Seçmelide süre ve doğruluk: 2–3 sn'de verilen 283 cevabın %96'sı doğru; 5 sn'den uzun sürenlerde %47. Hızlı ve neredeyse kusursuz cevap, hatırlamadan çok tanıdıklığa dayanan seçimi düşündürüyor.

### 2.2 Aynı kelimede tanıma ve üretim

- v5'ten beri (15.10) hem ≥ 2 seçmeli hem ≥ 2 yazma sorusu olan 76 öğe: ortalama **seçmeli %92, yazma %49**. Bütün dönemde (115 öğe): %87'ye %51.
- **35 öğede** seçmeli ≥ %85 ama yazma ≤ %50. En belirgin olanlar:
  der Donner 8/8 → 0/2 · anwesend 8/8 → 0/3 · die Gleichberechtigung 8/8 → 0/2 · allerdings 8/9 → 0/2 · der Fall 6/6 → 0/2 · ebenfalls 6/6 → 0/2 · das Bedürfnis 6/6 → 0/2 · glatt 6/6 → 1/2 · die Gerechtigkeit 5/5 → 0/2 · drüben 5/5 → 0/2 · begleiten 5/5 → 0/2 · die Ehrlichkeit 5/5 → 1/3 · betreuen 4/4 → 0/2 · die Behauptung 4/4 → 0/2 · das Ehrenamt 4/4 → 0/2 · die Aufnahme 4/4 → 0/2 · eigen 4/4 → 0/2 · fließend 4/4 → 1/3 · sich verlassen auf 3/3 → 1/2 · sich wenden an 3/3 → 1/2.
- Seçmeli doğru cevaplandıktan sonra aynı öğenin bir sonraki yazma sorusu: 182 durumun 108'inde doğru (**%59**). Seçmeli yanlışsa: 15'te 3.
- Tekrar sayısına göre: seçmeli doğruluğu tekrarla yükseliyor (1. görüş %77 → 6. görüş ve sonrası %87). Yazma doğruluğu benzer biçimde yükselmiyor (1. %69, 3. %75, 5. ve sonrası %62).

### 2.3 Merdivendeki döngü

- **Yazmada yanlış → sonraki soru seçmeli:** 100 durumun 99'u. Tipik dizi (`n0248` der Donner): `P− R+ R+ R+ P− R+ R+ R+ R+ R+`; `w0109` drüben: `P− R+ R+ R+ P− R+ R+`.
  Nedeni: oturum kuyruğu (`kern.js` 656: `b: max(1, b−1)`, 657: 3. deneme `bicim: 'sec'`); ertesi gün S < 2 → `b = 1`; R < 0,5 → `b = 1`; ısınma ve momentum için `b − 1`.
- `zustand.json`: 276 öğenin **112'si `bm 1` + `pk 0`**, yani yalnız seçmeliyle doğrulanmış. Bunların S ortancası 2,3 gün. `pk 0` toplamda 143 (%52).
- Kohort: 15–25.10 arasında giren 37 kelimenin 12'sinde (%32) `pk ≥ 1`; 26.10–06.11 arasında girenlerin 57'sinde 7.

### 2.4 Ezber: aynı cümle ve yeni cümle

- Bütün boşluklu sorular (326): **aynı öğe + aynı cümle tekrarında %75** doğru (n = 79); **daha önce görülmüş öğe + yeni cümlede %57** (n = 95). v5'ten beri esnek ölçüyle %79'a %59. Aynı öğede (36 öğe) yeni cümle %60, tekrar cümle %81.
- Aynı cümlenin görülme sırasına göre doğruluk: 1. %59 → 2. %77 → 3. %79. Ama aynı öğe yeni cümleye geçince %57'ye düşüyor. Bu tablo, kelimenin değil cümle–cevap eşleşmesinin öğrenildiğini gösteriyor.
- Tekrarın bugünkü kaynağı: v5'ten beri ana merdiven boşluklarında (`bos0`, `bos`) tekrar payı %0–19. **`stamm/kokSatz`'ta %64, en çok 8**: "Die Abendzeitung hat einen Bericht über den Unfall _____." (`v157` bringen) 8 kez sorulmuş (cevaplar: bracht, gebrachen, gebrachen, gebracht … gebrachten). Kod: `js/app.js` `frageStammSatz` (1142–1163): `pick(ks)`, `S.kontext` geçmişine bakmıyor. Çoğu fiilde Partizip'i içeren tek bir cümle var.
- Eski (v3) dönemde "Kennst du ein schönes _____?" (Gedicht) 8 kez sorulmuş.
- Cümle havuzu: çalışılan öğelerde kendi çeviri cümlesi sayısı 0 → 10 öğe, 1 → 25, 2 → 58, 3 → 49, 4 ve üstü → 134. Bütün fiillerin 422'sinde (%62) yalnız 1 cümle var.

### 2.5 Yazmadaki yanlışların içeriği (v5, `wort` / `prod` / `abr`)

- **Komşu kelime karışması** (anlamca ya da biçimce yakın, çoğu aynı ünitede birlikte girmiş): anwesend ↔ allerdings (3 kez, iki yönde), eher → allerdings, fließend → fleißig / Fleßig, der Antrag → der Vertrag, der Wert → die Würde (2 kez), die Behörde → das Amt, das Verhalten → das Bedürfnis, eigen → eignen (2 kez), trocken → feucht, glatt → nass, mild → nass, ebenfalls / bereit → beide, die Minderheit → Meistenschaft, übertreiben → überweisen, vorschlagen → empfehlen, hageln → donnern, sich bemühen um → beschweren, sich wenden an → wundern, der Donner → donnern (2 kez: isim/fiil).
- **Uzun kelimede biçim kodlanmamış:** Gerechtigkeit → Gedichkeit / Gerichtketi; Gleichberechtigung → Gleichbereitschaft; Hilfsbereitschaft → helfbarnchaft; Einwohnermeldeamt → Einwohnersamt / "das E"; Vereinsmitglied → Vermitglied; Ehrenamt → Egenwahr. Anlam biliniyor, biçim parçaları (morfemler) oturmamış.
- Etiketler: `kelime yanlış` 39, `artikel` 24 + 7, `yazım` 15 + 10, `bilmiyorum` 26, Partizip 12. Edat / hâl hatası yazmada az (abr'de 1 dönüşlü). Fiilde asıl sorun fiilin kendisinin gelmemesi.

### 2.6 Artikel

- Flaşta görülme sırasına göre doğruluk: 1. %68, 2. %80, 3. %64, 4. %79, 5. %78, 8. ve sonrası %67 (n = 75). **Öğrenme eğrisi yok.**
- 146 artikel hatası (verilen → doğrusu): der → die 47, der → das 28, die → der 21, die → das 18, das → die 18, das → der 14. Hataların %51'i "der" varsayımı. Doğrusu die olan isimler 65, das olanlar 46, der olanlar 35.
- ≥ 4 hatalı 21 isim: Geduld 13/22, Rezept 12/19, Vorurteil 9/10, Praxis 8/21, Kunst 7/18, Toleranz 7/10, Gymnastik 7/8, Regel 6/18, Diskussion 6/12, Missverständnis 6/11, Nebel 5/12, Wetter 5/11, Feuerwehr 5/8, Regen 5/7, Erlaubnis 4/17, Situation 4/15, Burg 4/14, Frühjahr 4/12, Rat 4/11, Not 4/9, Wetterbericht 4/9.
  - **Kural ya da baş parça ile bulunabilenler** (yine de yanlış): Diskussion, Situation (‑ion %96 die), Gymnastik (‑ik), Missverständnis (‑nis / Verständnis), Vorurteil (Urteil), Frühjahr (Jahr), Wetterbericht (Bericht). `Toleranz` için kural yok, çünkü `build.py` bir kural için ≥ 5 örnek istiyor ve listede ‑anz'lı isim az.
  - Kurala uymayanlar (Geduld, Rezept, Kunst, Regel, Not, Burg …): bunlarda kelimeyle birlikte öğrenmek ve üretmek gerekiyor.

### 2.7 Kullanılmayan bölümler

`sprechen` 0 satır, `cumle` (Cümle atölyesi) 0 satır, `text` 3 satır, tam cümle (B4) v5'ten beri 1 kez. Üretim ve konuşma beceri bloklarına hiç ulaşılmıyor.

### 2.8 Veri sınırları

- Seçmeli şıkları log'a yazılmıyor; hangi çeldiricinin işe yaradığı ölçülemiyor.
- v3 dönemi satırları farklı biçimlerde. Öğe başına sayılar küçük (2–8 soru), yani tek tek öğe yorumları gürültülü; toplu farklar (92/49, 75/57, 99/100) ise net.
- "Yeni cümlede düşüş"ün bir kısmı cümle zorluğu farkı olabilir. Ama aynı öğe içinde karşılaştırmada da fark sürüyor (%81'e %60).

---

## 3. Uygulama önerileri (öncelik sırasıyla)

Büyüklük: K = küçük (birkaç satır), O = orta (bir fonksiyon / yeni soru tipi), B = büyük (yeni bölüm / akış).

### Öncelik 1: seçmeli bandını kır, üretimi merkeze al

| # | Ne | Neden (kanıt / veri) | Nerede | Büyüklük |
|---|---|---|---|---|
| 1.1 | **Yanlıştan sonra yeniden deneme üretimde kalsın.** Yazma ya da boşluk yanlışsa: doğru cevabı göster, 3–5 soru sonra **aynı basamakta, ipuçlu** sor (`yaz0`: ilk harf + harf sayısı, `Ge_______ (9)`). 3. deneme seçmeli olmasın; daha fazla harf açılmış `yaz0` ya da "doğrusunu yaz" (kopya değil: 3 sn gösterilip gizlenir) olsun. | 100 durumun 99'unda yanlış → seçmeli, ardından kolay R+ R+ R+ (§2.3). Seçmeli sonrası yazma ancak %59 (§2.2). Aynı biçimde tekrar geri çağırma: Nakata 2017; Kang vd. 2007. | `js/kern.js` `oturumIsle` içinde kuyruk satırları 656–657 (`b: Math.max(1, b−1)`, `bicim: 'sec'`) → `b: Math.max(2, b)`, `bicim: 'yaz0'`, yeni `ipucuHarf` alanı. `js/app.js` yazma sorusu üreticisinde harf ipucu. | K–O |
| 1.2 | **Merdivende seçmeliyi daralt.** `basamak()`: `b = 1` yalnız tanıtım günü ve sonraki ilk tekrar için olsun (ör. `reps < 2` ya da S < 1). `R < 0,5`, kurtarma, ısınma ve momentum → `b = 2` ipuçlu yazma (`yaz0`), seçmeli değil. Hedef karışım: seçmeli ≤ %20, yazma + cümle ≥ %55. | Seçmeli %45 pay, %93 doğruluk. 112 öğe `bm 1`'de takılı. Üretken öğrenme hem üretim hem tanıma kazandırıyor (Webb 2009; Laufer & Goldstein 2004). | `js/kern.js` `basamak()` (241–262): `S < 2 ? 1`, `if (bag.kurtarma \|\| r < 0.5) b = 1`, `b -= 1`. `tests/sim_akis.js` ile karışım payını kontrol et. | K |
| 1.3 | **Seçmelide üretimi önceleyen biçim:** şıklar ancak Tuna "aklımda" (Enter) ya da "bilmiyorum" diyince açılsın, en geç 4 sn sonra. "Bilmiyorum"la açılırsa doğru seçim not 2 alsın. | van den Broek vd. 2023 (stepwise MC). Şu anki 1,2 sn bekleme dokununca hemen açılıyor; ortanca cevap 3 sn. | `js/app.js` `DENKZEIT` (17) ve seçmeli gösterimi; `Kern.notVer` `secmeli` dalı. | K |
| 1.4 | **Çeldiricileri yeniden tasarla.** Öncelik sırası: (a) Tuna'nın **kendi yanlış cevapları**: log'daki `antwort`'u başka bir öğenin lemmasıyla eşleşen durumlar (anwesend ↔ allerdings, Antrag → Vertrag, Wert → Würde …), çift yönlü bir "karışma" tablosu olarak `S.karisma`'ya; (b) **biçim komşuları**: aynı tür, Levenshtein ≤ 3 ya da aynı önek / sonek (be‑/ver‑/er‑, ‑ung/‑heit, fleißig/fließend); (c) **çalışılmış** (`S.items`), aynı türden, aynı konudan öğeler; (d) yalnız bunlar yetmezse havuz. **Hiç görülmemiş kelime çeldirici olmasın.** İsimde TR → DE şıklarında artikel tuzağı kalsın, ama diğer şıklar mümkünse aynı artikelli olsun (artikel ele vermesin). | Rekabetçi çeldirici gerekli (Little vd. 2012; Little & Bjork 2015). Gerçek karışmalar §2.5'te. Bugün `nah` en çok 2 konu arkadaşı + 1 tanıdık + rastgele; görülmemiş konu arkadaşları eleme ile düşüyor. | `js/app.js` `optionen` (541) ve `optionenDE` (581). Karışma tablosu: cevap işlenirken `antwort` → `formIdx()` eşlemesi; `zustandBirlestir` / `Kern.birlestir` alan alan birleştirmeye ekle. | O |
| 1.5 | **Karışan çiftlere "ayırt et" sorusu:** karışma tablosunda çift oluşunca ertesi turlarda iki kelime yan yana, iki TR anlamıyla eşleştirme ya da her biri için kısa cümlede boşluk ("Alle Teilnehmer waren ___ / ___ war das Wetter schlecht"). Eşleştirme ve boşluk Tuna'nın yazdığı biçimle notlanır. | Benzer kelimeyi ayırt etmede karıştırmak yararlı (Brunmair & Richter 2019). Karışma hataları (Nakata & Suzuki 2019). | Yeni üreteç: `js/app.js` (çift soru), `Kern.sec` kuyruğuna `neden: 'karisma'`. | O |
| 1.6 | **Benzer kelimeleri aynı gün tanıtma.** Yeni parti seçilirken aynı gün tanıtılan / dün yanlış olan bir kelimeyle biçimce (lev ≤ 3, aynı ilk 3 harf) ya da anlamca (aynı konu + aynı tür) yakın olan aday 2–3 gün ertelensin. | anwesend / allerdings / ebenfalls aynı dönemde girdi ve karıştı. Tinkham 1997; Nakata & Suzuki 2019. | `js/kern.js` yeni parti seçimi (`yeniParti`, `alan` kuralının yanına). | K |

### Öncelik 2: ezberi önle, bağlamı çeşitlendir

| # | Ne | Neden | Nerede | Büyüklük |
|---|---|---|---|---|
| 2.1 | **`frageStammSatz` geçmişe baksın:** `S.kontext[v.id]`'de olmayan cümle seçilsin; hiç taze cümle yoksa cümleli soru yerine başka biçim gelsin ("er/sie ___ (bringen)" ya da Präsens + Perfekt); aynı cümle 30 gün içinde en çok 2 kez. `kontext` alanı zaten dönüyor; seçimde kullanılmıyor. | kokSatz'ta %64 tekrar, en çok 8 (§2.4). | `js/app.js` 1146–1155 (`pick(ks)` → `satzWahl` benzeri `frisch`/`aeltest`). | K |
| 2.2 | **Genel kural: aynı cümle 30 günde en çok 2 kez, ardışık iki görüşte hiç.** Taze cümle yoksa aynı öğeyi başka **ipucu biçimiyle** sor: Almanca tanım (B1 sözlük cümlesi), karşıt anlam ("Gegenteil von nass → trocken"), kalıp ipucu ("einen ___ stellen" → Antrag), konu ipucu. `S.kontext` sınırını 12'den 30'a çıkar. | Aynı cümlede %75–79, yeni cümlede %57–59. Bağlam çeşitliliği: Pagán & Nation 2019; Johns vd. 2016. | `js/app.js` `satzWahl` (1008), `tazeCumle` (376), kayıt (3081 / 5154: `h.length > 12`). | O |
| 2.3 | **Cümle havuzunu büyüt:** aktif öğe başına ≥ 5 kendi cümle (bugün 93 öğede ≤ 2, 10 öğede 0). Gece işinin istemine kural ekle: "çalışılan öğelerden cümlesi < 5 olanlara 2 cümle; karışma çiftleri için ayırt edici cümle; `bilmiyorum` / `kelime yanlış` öğelerine 2–3 cümle". | Bağlam çeşitliliği yalnız havuz varsa mümkün. | `tools/istem_gece.md`, `quellen/saetze.txt`, `quellen/wort_saetze.txt`, `quellen/glossen.txt`. | O (içerik) |
| 2.4 | **Yazma sorusunda ipucunu çeşitlendir.** Bugün `yaz` hep aynı TR karşılığını gösteriyor; sırayla TR karşılık / TR cümle içinde (Almanca cümlenin TR'si, kelime boşluklu) / Almanca tanım / kalıp ipucu / resim (varsa) kullanılsın. | Tek bir ipucu–cevap eşleşmesi ezberleniyor; transfer için değişken ipucu. | `js/app.js` yazma sorusu üreticisi (`frageSchreiben` benzeri), `quellen/` yeni sütun gerekmez (tanım için Goethe `bsp` + gloss). | O |
| 2.5 | **Metin boşluğunu başarılabilir yap:** `metin` doğruluğu %33. İlk harf ya da 4 kelimelik banka (aynı metindeki diğer boşlukların cevapları + 1 çeldirici) verilsin; ipucusuz biçim yalnız `bm ≥ 3`'te. | İstenen zorluk başarılabilir olmalı (Bjork; Suzuki vd. 2019). %33 öğretmekten çok yıldırıyor. | `js/app.js` metin etkinliği (`uPruef`, metin üreticisi), `Kern.sec` adım 3. | K |

### Öncelik 3: fiil, kalıp, artikel

| # | Ne | Neden | Nerede | Büyüklük |
|---|---|---|---|---|
| 3.1 | **Fiil = kalıp.** `abr` sorusunda hedef `sich verlassen auf + A` gibi bütün kalıp olsun (bugün çoğu fiilde yalnız mastar soruluyor ve edat hatası az görünüyor, çünkü az soruluyor). B3/B4'te kısa zamirli cümle: "Ich ___ mich ___ dich." Partizip sorusu yardımcı fiille: "hat gebracht" / "ist gefahren" (iki parça notlanır). | Kalıp ve sözlü akıcılık (Boers vd. 2006). Partizip hataları 12, yardımcı fiil hiç sorulmuyor. | `js/app.js` `frageStammSatz` ipucu (`kontrol` → `hat ___`), `abr` üreticisi; `quellen/kaliplar.txt` → kelime kalıpları. | O |
| 3.2 | **Kollokasyon kartı:** isim / fiil için en sık 1–2 eşdizim (`einen Antrag stellen`, `Geduld haben`, `eine Entscheidung treffen`) öğe hafızasına ek biçim olarak ("kalıp boşluğu": `eine Entscheidung ___`). | Konuşmada kelime tek başına değil, eşdizimiyle çağrılır. Karışmaları da azaltır (Antrag ≠ Vertrag: "stellen" vs "abschließen"). | `quellen/kaliplar.txt` genişletme + yeni `bicim:kalip` (Kern `OFS` 0). | O |
| 3.3 | **Artikel flaşının yerine (yarısında) öbek içinde artikel üretimi:** "Ich habe keine ___ (Geduld)" → `keine` doğru, `keinen` yanlış; `mit ___ Rezept` → `dem`. Yalın isimli 2 sn'lik flaş kalabilir ama hata yapılan isimde bir sonraki artikel sorusu öbek içinde olsun. | Flaşta öğrenme eğrisi yok (§2.6). Arnon & Ramscar 2012; Keppenne vd. 2021 (üretim temelli). | `js/kern.js` art hafızası seçimi (`vadeliler` → `tur: 'art'`), `js/app.js` artikel soru üreticisi; `G` çekim tabloları zaten var (`js/grammatik.js`). | O |
| 3.4 | **Kural önce, isim sonra:** artikel yanlış olduğunda isim kurala uyuyorsa bir sonraki turda **3 isimlik sonek mini seti** sorulsun (Diskussion → Situation, Information, Region; hepsi ‑ion). Bileşikte "son parça" seti: Vorurteil → das Urteil. `build.py` sonek tablosuna küçük örnekli ama kesin kuralları elle ekle: ‑anz, ‑enz → die; ‑ik → die; ‑um → das (mümkünse istisnalarla birlikte). | Kurala uyan isimlerde de tekrar tekrar hata (§2.6). Açık kural, alıştırılmadan hızlı kullanıma geçmiyor (gender literatürü). | `tools/build.py` `SUFFIXE` / `stat` (439–464: `len(hits) < 5`), `js/app.js` `artikelNotHTML` (151) + kuyruk. | K–O |
| 3.5 | **Uzun / bileşik kelimede parça ipucu:** `yaz0`'da bileşik ve türetilmiş kelimeler parça parça gösterilsin (`Gleich·berechtig·ung`, `Einwohner·melde·amt`); yanlışta fark (diff) parça düzeyinde. | §2.5'teki biçim hataları: anlam var, form yok. | `js/app.js` yazma ipucu; `kopf` verisi `build.py`'de zaten var. | K |

### Öncelik 4: konuşma ve sesli üretim (Tuna'nın asıl açığı)

| # | Ne | Neden | Nerede | Büyüklük |
|---|---|---|---|---|
| 4.1 | **Sesli üretim sorusu (Chrome).** Yazma sorusunun bir kısmı "söyle" biçiminde olsun: TR ipucu → Tuna Almancayı (kelime + artikel ya da kalıp) **sesli** söyler → `webkitSpeechRecognition` (`lang: 'de-DE'`) metne çevirir → mevcut `G.pruefen` ile notlanır (öz-değerlendirme yok, kural 8) → doğru biçim TTS / varsa mp3 ile çalınır. Tanınmıyorsa "anlaşılmadı" (yeniden dene, en çok 2), not yine sistemden. Önerim bunun **önce kelime / kalıp düzeyinde** yapılması (konuşma metnini denetlemek Tuna'ya göre faydasız; bu soru ise telaffuzun anlaşılırlığını ve hatırlamayı birlikte ölçüyor). | Tuna konuşmada zayıf ve masaüstü Chrome kullanıyor. Hatırlama > taklit (Kang vd. 2013). Sesli söyleme etkisi (MacLeod; Fawcett 2013). Not: Chrome'un ses tanıması Google sunucusuna gidiyor; tanıma kalitesinin Tuna'nın aksanında nasıl olacağından emin değilim, küçük bir denemeyle bakılmalı. | `js/app.js` yeni `bicim:soyle` (Kern `PK_BICIM`'e eklenebilir), `js/kern.js` biçim tablosu (`bicimSec` b = 2 / 3'te %25). | O |
| 4.2 | **Sprechen'i Bugün akışına bağla.** Günde bir kez, hedef bitince "2 dakika konuş" kartı: Teil 2 konusu + o haftanın **5 zayıf kelimesi** (yazmada yanlış olanlar) zorunlu kelime olarak. 4/3/2 biçimi: aynı konuyu üç kez (kısaltarak) anlat, kayıt yalnız tarayıcıda. Log'a `sprechen` satırı: süre, tekrar sayısı, kelime listesi (ses tanıma açıksa hangi zorunlu kelimelerin söylendiği, yalnız bilgi olarak). | 0 `sprechen` satırı. de Jong & Perfetti 2011 (4/3/2). Katılım yükü (Yanagisawa & Webb 2021). | `js/app.js` `ikinciIs` / sprint "Beceri" bloğu, mevcut konuşma bölümü. | O–B |
| 4.3 | **Cümle atölyesi "kur"u zayıf kelimeye bağla:** yazmada iki kez yanlış olan kelime, ertesi gün atölyede `kur` görevinin hedef kelimesi olsun (sesli ya da yazılı). | Kendi cümlesini kurmak en yüksek katılım; 0 `cumle` satırı. | `js/cumle.js` görev seçimi (`Cumle.init(api)` üzerinden zayıf liste). | K |

### Öncelik 5: miktar, aralık, ölçüm

| # | Ne | Neden | Nerede | Büyüklük |
|---|---|---|---|---|
| 5.1 | **Yeni kelime kotasını üretim dönüşümüne bağla.** Kota, son 7 günde tanıtılan kelimelerin ≥ %50'si 7 gün içinde ipucusuz üretilmişse 6 → 8, %30'un altındaysa 4 olsun. Bugün dönüşüm %32 (§2.3), yani artırma değil, 4–6'da tutma zamanı. Ayrıca hızlı **tanıma yoklaması** (sık kelimelerde "biliyor muyum" taraması, yalnız alıcı hat) üretim kotasından ayrı sayılsın. | Kelime hacmi B2 için önemli (Milton & Alexiou), ama üretimsiz eklenen kelime %41'lik bandı büyütüyor. | `js/kern.js` `kota` (`kapasite()` yanına dönüşüm ölçüsü). | K |
| 5.2 | **Seçmeli doğrusu vadeyi uzatmasın:** `pk 0` ve `bm 1` öğede seçmeli doğru cevabın vadesi en çok 2–3 gün olsun; böylece üretim sorusu çabuk geri gelir. Aralık tavanı (60 gün) ve FSRS kalsın: kanıt, eşit ve genişleyen aralığı eşit buluyor (Kim & Webb 2022). | 112 öğe bm1'de ve S ortancası 2,3; seçmeli büyümesi S'i şişiriyor. | `js/kern.js` `guncelle` (`pk 0 → 7 g` kapısı → seçmeli için 3 g). | K |
| 5.3 | **Şıkları log'a yaz:** seçmeli satırında notiz `şık:<id1,id2,id3>` + çeldirici kaynağı (`karisma` / `bicim` / `konu` / `havuz`). Böylece çeldirici türüne göre doğruluk ve sonraki yazma başarısı ölçülebilir. | Bugün çeldiricinin etkisi ölçülemiyor (§2.8). | `js/app.js` `optionen` / `optionenDE` dönüşü + log satırı (CLAUDE.md log sözleşmesine ekle). | K |
| 5.4 | **Panoda dürüst ölçü:** İlerleme ekranında öğe başına "tanıyor / yazıyor / cümlede kullanıyor" ayrımı ve haftalık **üretim doğruluğu** (seçmeli hariç) gösterilsin; günlük hedef cevap sayısı yerine "bugün ipucusuz üretilen kelime" sayısını da göstersin. | Tuna "uygulama bana yardım etmiyor" diyor; görünen %93 yanıltıcı, gerçek açık %49. | `js/app.js` `renderAna`, İlerleme (`#/gecmis`). | O |

### Yapılmasın / dikkat

- Seçmeliyi tamamen kaldırma: tanıtımın hemen ertesinde, yazmanın büyük ölçüde başarısız olacağı aşamada yararlı (Kang vd. 2007: geri bildirimsiz ve çok zor yazma testinde seçmeli eşit ya da daha iyi olabiliyor).
- Anahtar kelime kancasını yaygınlaştırma: unutma daha hızlı (Wang & Thomas 1995). Yalnız takılan kelimede ve geri çağırma sorusuyla birlikte kullan.
- "Karışık sıra" tek başına kazanç değil (kelimede g ≈ −0,39); karıştırma ayırt etme hedefli olmalı.

---

## 4. Tuna için kısa tavsiyeler (uygulama dışı)

1. **Seçmelide şıklara bakmadan önce cevabı içinden (daha iyisi sesli) söyle.** Bulamıyorsan "bilmiyorum" de, sonra şıklara bak. Eleme yaparak bulmak, öğrenme olarak neredeyse hiç sayılmaz.
2. **Her kelimeyi sesli ve bütün söyle:** artikel + kelime + çoğul + bir kalıp. Örneğin "die Geduld — ich habe keine Geduld", "der Antrag — einen Antrag stellen". Fiili edatı ve hâliyle söyle: "sich verlassen auf + Akk: Ich verlasse mich auf dich."
3. **Günde 5 dakika kendi cümleni kur:** o gün yanlış yaptığın 3–5 kelimeyle, kendi hayatından cümleler (kurs, Bremen, üniversite) kur, sesli söyle ve telefona kaydet. Ertesi sabah dinle.
4. **4/3/2 konuşma:** haftada 3 kez bir Sprechen Teil 2 konusunu önce 4, sonra 3, sonra 2 dakikada anlat (aynı konu). Akıcılığı ve kelimeyi bulma hızını en çok bu artırıyor.
5. **Dinlerken oku (reading-while-listening):** DW "Top-Thema" / "Langsam gesprochene Nachrichten" metnini sesle birlikte 2–3 kez dinle. Takıldığın en fazla 5 kelimeyi uygulamaya "öğrenmeye ekle" ile ekle. Dinleme hacmi kelimeyi pekiştirir, ama yeni kelimeyi tek başına öğretmez.
6. **Shadowing'i doğru sırayla yap:** önce kelimeyi / cümleyi kendin hatırla ve söyle, sonra sesi dinleyip tekrar et. Yalnız taklit etmek telaffuza yarar, hafızaya az yarar.
7. **Artikel için önce kuralları öğren:** ‑ung, ‑heit, ‑keit, ‑schaft, ‑tät, ‑ion, ‑ik, ‑anz/‑enz → die; ‑chen, ‑ment, ‑um, ‑nis (çoğu) → das; bileşikte son parça belirler (das Urteil → das Vorurteil). Kuralsız olanları (die Geduld, das Rezept, die Kunst) kırmızı / yeşil / mavi renkle ve cümle içinde ezberle.
8. **Benzer kelimeleri yan yana yaz ve farkını kur:** anwesend (orada olan) ↔ allerdings (ancak), fließend (akıcı) ↔ fleißig (çalışkan), Antrag (başvuru) ↔ Vertrag (sözleşme), Wert (değer) ↔ Würde (onur). Her çift için bir cümle.
9. **Kursta her gün bir yeni kelimeyi gerçekten kullan:** öğretmene ya da arkadaşına sorduğun bir soruda ya da anlattığın bir şeyde.
10. **Hedef:** B2 için tanıma düzeyinde yaklaşık 4 000 kelime (okuma ve dinlemeyle), konuşmada en sık ~1 500 kelime ve onların kalıpları (uygulamayla). "Çok kelime ezberle" tavsiyesi ancak **üreterek** ezberlenirse konuşmaya yansır.

---

## Kaynaklar (seçme)

- Adesope, Trevisan & Sundararajan 2017, *Review of Educational Research* 87(3) — https://journals.sagepub.com/doi/10.3102/0034654316689306
- Arnon & Ramscar 2012, *Cognition* 122(3) — https://doi.org/10.1016/j.cognition.2011.10.009
- Boers vd. 2006, *Language Teaching Research* 10(3)
- Brunmair & Richter 2019, *Psychological Bulletin* 145(11) — https://pubmed.ncbi.nlm.nih.gov/31556629/
- Cepeda vd. 2008, *Psychological Science* 19(11) — https://pubmed.ncbi.nlm.nih.gov/19076480/
- de Jong & Perfetti 2011, *Language Learning* 61(2) — https://www.lrdc.pitt.edu/perfettilab/pubpdfs/de%20Jong%20Language%20Learning.pdf
- Kang, Gollan & Pashler 2013, *Psychonomic Bulletin & Review* 20 — https://doi.org/10.3758/s13423-013-0450-z
- Kang, McDermott & Roediger 2007, *Eur. J. Cognitive Psychology* 19 — https://www.gwern.net/docs/spaced-repetition/2007-kang.pdf
- Keppenne, Hopman & Jackson 2021, *Applied Psycholinguistics* — https://doi.org/10.1017/S014271642100014X
- Kim & Webb 2022, *Language Learning* 72(1) — https://doi.org/10.1111/lang.12479
- Laufer & Goldstein 2004, *Language Learning* 54(3)
- Little, Bjork, Bjork & Angello 2012, *Psychological Science*; Little & Bjork 2015, *Memory & Cognition* — https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf
- Milton & Alexiou 2009 — https://www.enl.auth.gr/gala/14th/Papers/English%20papers/Milton&Alexiou.pdf
- Nakata 2017, *SSLA* 39(4); Nakata & Suzuki 2019, *SSLA* 41(2)
- Pagán & Nation 2019, *Cognitive Science* 43 — https://doi.org/10.1111/cogs.12705
- Steinel, Hulstijn & Steinel 2007, *SSLA* 29 — https://hdl.handle.net/1887/14200
- Suzuki, Nakata & DeKeyser 2019, *Modern Language Journal*
- Uchihara, Webb & Yanagisawa 2019, *Language Learning* 69(3); Webb, Uchihara & Yanagisawa 2023, *Language Teaching* 56(2)
- van den Broek vd. 2018, *Language Learning* 68(2) — https://pure.mpg.de/pubman/item/item_2506637_4/component/file_2603172/VandenBroek_etal_2018.pdf ; van den Broek vd. 2023 (stepwise MC) — https://research-portal.uu.nl/en/publications/optimizing-multiple-choice-questions-for-retrieval-practice-delay/
- Wang & Thomas 1995 — https://archive.memory-key.com/research/Wang95
- Webb 2009, *RELC Journal* 40(3); Mondria & Wiersma 2004 (Bogaards & Laufer, ed.)
- Yanagisawa & Webb 2021, *Language Learning* 71(2) — https://doi.org/10.1111/lang.12444

Doğrulanamayan ayrıntılar: Adesope g ≈ 0,61 ve Rowland g ≈ 0,50 değerleri ikincil kaynaklardan/bellekten (yaklaşık); Brunmair & Richter kelime alt grubu g = −0,39 özet kaynaklardan; Mondria & Wiersma ve Webb 2009 bulguları ikincil özetlerden; van den Broek 2023'teki gecikme süresi (birkaç saniye) tam olarak doğrulanmadı; Chrome ses tanımasının Tuna'nın aksanında doğruluğu bilinmiyor.
