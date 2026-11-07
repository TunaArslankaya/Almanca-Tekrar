# Telaffuz (Aussprache) — Türk konuşucular için araştırma ve uygulama önerisi

Ajan: telaffuz · 6.11.2026

> **Yöntem notu:** Bu oturumda web sayfası okuma (WebFetch) engelliydi (dergipark.org.tr, pub.uni-bielefeld.de, indiana.edu vb. ağ izninde yok). Kaynaklar web aramasının özetlerinden ve alandaki bilinen literatürden. Özetten ya da ikincil kaynaktan gelen sayılar **(ikincil)** diye, bellekten yazdıklarım **(emin değilim)** diye işaretli. Repo salt okunur incelendi, hiçbir dosya değişmedi.

---

## 0. Kısa sonuç

1. **Türk konuşucunun asıl sorunu ü/ö değil.** Türkçede [y] ve [ø] zaten var. Asıl sorunlar şunlar: **gergin/gevşek ve uzun/kısa ünlü ayrımı** (Hüte/Hütte, Miete/Mitte), **vurgu ve ritim** (Türkçede hece zamanlı, sona yakın vurgu; Almancada vurgu zamanlı, gövdenin ilk hecesi, vurgusuz hecede ünlü zayıflar: ə, ɐ), **-er/-e/-en zayıflatma**, **ch [ç]/[x]**, **ünsüz kümelerine ünlü sokma** (Schrank → "şırank"), **yazıya bakarak okuma** (z, s, v, w, sp/st, -ig, -ng, uzatma h'si, ei/ie/eu).
2. **Önce algı, sonra üretim.** Türk çocukların Almanca ünlü karşıtlıklarını *algıda* ana dilliler gibi ayırmadığı, üretimde ise büyük ölçüde doğru olduğu bulunmuş (Darcy & Krüger 2012). Algı eğitiminin (minimal çift dinleme, çok sesli: HVPT) algıyı kesin, üretimi küçük-orta ölçüde iyileştirdiğini meta-analizler gösteriyor.
3. **Prozodi segmentlerden daha önemli.** Hirschfeld'in (1994) Almanca öğrenenlerle yaptığı anlaşılırlık deneyleri **(ikincil)**: vurgu ve cümle vurgusu hataları anlaşılırlığı tek seslerden daha çok bozuyor. Derwing, Munro & Wiebe (1998): prozodi ağırlıklı ders, *serbest konuşmaya* taşınan tek kazanımı verdi. Tuna'nın Sprechen sorunu için kaldıraç burada.
4. **Shadowing işe yarar, ama tek başına aksanı silmez.** Foote & McDonough (2017): 8 hafta mobil shadowing → anlaşılırlık ve akıcılık arttı, aksan derecesi artmadı. Hamada (2016): shadowing ses algısını (bottom-up dinleme) geliştiriyor.
5. **Otomatik telaffuz notu: Tuna'nın şüphesi büyük ölçüde haklı.** Transkript (Web Speech API, Whisper) telaffuzu ölçmez: dil modeli yanlışı düzeltir, uzun/kısa ünlüyü ve vurguyu görmez. Tarayıcıda ücretsiz ve **güvenilir** olarak yapılabilenler akustik ölçümler: perde (pitch) eğrisi, sessizlik/duraklama, süre. Bunlar not için değil, **görsel geri bildirim** ve **akıcılık ölçüsü** için uygun. Fonem düzeyinde puanlama yalnız ücretli bulut servisleriyle mümkün (Azure de-DE fonem puanı veriyor, prozodi puanı yalnız en-US). O da deneysel bir "ikinci görüş" olur.
6. **Uygulamada en çok iş görecek üç şey:** (a) her kelimede **vurgu + uzun/kısa işareti** ve gerçek insan sesi (tanıtım kartında, her gün görülür); (b) tura **dinleyip ayırt etme sorusu** (minimal çift / vurgu; sistem notlar, kural 8'e uygun); (c) Konuşma'da **dinle → tekrarla → kaydet → A/B** döngüsü, pitch eğrisi ve Teil 2 için **duraklama ölçer**. Konuşma bölümü hiç açılmamış (log'da 0 `sprechen`), bu yüzden (a) ve (b) günlük tura girmeli.

---

## 1. Türkçe–Almanca ses farkları: ne, neden, nasıl düzeltilir

Öncelik sırası anlaşılırlığa etkiye göre (prozodi ve ünlü uzunluğu önce). "Türkçe kanca" sütunu Tuna için hafıza ve artikülasyon ipucu.

| # | Konu | Almancada | Türk konuşucu ne yapar | Düzeltme / Türkçe kanca |
|---|---|---|---|---|
| 1 | **Kelime vurgusu** | Çoğu kelimede gövdenin ilk hecesi (ˈar-bei-ten). Ayrılabilen ön ek vurgulu (ˈan-ru-fen), ayrılmayan ön ek (be-, ge-, er-, ver-, zer-, ent-, emp-) vurgusuz (be-ˈsu-chen). Yabancı sonekler vurgulu: -ˈtion, -ˈtät, -ˈie, -ˈieren, -ˈur, -ˈei. | Türkçenin sona yakın vurgusunu taşır (arbei-TEN), ya da bütün heceleri eşit söyler. | Vurgulu heceyi **daha uzun + daha yüksek + daha net** söyle, diğerlerini küçült. Türkçede de sona vurgu kuralı her yerde geçmez: "ANkara", "İSTANbul", "MASa" değil "maSA" ama "PENcere". Yani Türkçede de istisna vurgu var; Almancada bu "istisna" normal kural. Elle masaya vurarak (Klopfen) çalış. |
| 2 | **Ritim ve zayıflatma** | Vurgu zamanlı: vurgusuz hecede -e [ə], -er [ɐ], -en [n̩] çok kısa, "yutulur": *bitte* [ˈbɪtə], *Lehrer* [ˈleːʁɐ], *machen* [ˈmaxn̩]. | Hece zamanlı: her hece tam ünlüyle (bit-te [e], leh-rer [er], ma-hen). "Makineli tüfek" ritmi. | -e ≈ çok kısa, gevşek **ı**: "bittı". -er ≈ kısa **a**: "Leera", "Fenstaa"; r söylenmez. -en ≈ yalnız n: "mahn". Önce mırıldanarak melodiyi çalış (da-DA-da), sonra kelimeleri koy. |
| 3 | **Uzun/kısa + gergin/gevşek ünlü** | Uzun ünlüler gergin ve kapalı [iː yː uː eː øː oː], kısa ünlüler gevşek ve açık [ɪ ʏ ʊ ɛ œ ɔ]. Yalnız süre değil, renk de farklı: *Miete/Mitte, Hüte/Hütte, Höhle/Hölle, Ofen/offen, Staat/Stadt, Beet/Bett, fühlen/füllen, wen/wenn*. | Türkçede ünlü uzunluğu ses birimi değil, bu yüzden ikisini aynı söyler ve **duymakta da zorlanır** (algı geride: Darcy & Krüger 2012; Nimz 2011/2015 aynı konuyu Türk öğrencilerde inceliyor, sonuçlarına erişemedim). | Uzun ünlü = **ğ uzatması**: "dağ" [daː], "öğle" [øːle]. *Sohn* ≈ "soğn", *Hüte* ≈ "hüğte". Kısa gevşek ünlü: ağız biraz daha açık, kas gevşek, ardından ünsüz hemen gelir: *Mitte* "e"ye yakın bir i. Yazım ipucu: çift ünsüz, ck, tz önünde kısa; h, çift ünlü, ie önünde uzun. |
| 4 | **ch: ich-Laut [ç] / ach-Laut [x]** | e, i, ü, ö, ä, ei, eu, ünsüz ve -ig sonrasında [ç] (ich, Milch, König); a, o, u, au sonrasında [x] (Bach, doch, Buch, auch). | [ç] yerine ş (işş), k ya da h. [x] yerine h. | [ç] ≈ **"ihtiyar"**, "ihtimal"deki h (Türkçede ön ünlüden sonra h [ç]'ye kayar; Turkish phonology). Dil ucu alt dişlerde, "ş" deme: dudak yuvarlak değil, gülümse. [x] ≈ "sabah"ın sonundaki h, ama daha arkadan ve hırıltılı. Çift: *Kirche/Kirsche, mich/misch*. |
| 5 | **r** | Hece başında dilcikli [ʁ] (ya da dil ucu titrek, Bremen'de de anlaşılır). Hece sonunda ve -er'de **ünlüleşir** [ɐ]: *Tür* [tyːɐ], *hier* [hiːɐ], *Wort* [vɔɐ̯t]. | Türkçe dil ucu r'sini her yerde, hatta güçlü söyler: *Lehrer* "leh-rer". | Başta r: dil ucu r'si **kabul edilir**, zaman harcama. Asıl iş **sondaki r'yi düşürmek**: *der* ≈ "dea", *hier* ≈ "hia", *Lehrer* ≈ "leera". Anlaşılırlık ve "Almanca gibi" duyulma için en ucuz kazanç. |
| 6 | **Ünsüz kümeleri, ünlü sokma** | Başta: *Strand, Schrank, sprechen, Platz, Kleid, schwer, Zweck*. Sonda: *Herbst, nichts, Obst, du sprichst, Arzt*. | Türkçe başta küme sevmez: tren → "tiren", station → "istasyon" (Turkish phonology). "Şıtrand", "şırank", "pılatz", "kılayt". | Ünlüsüz başla: ünsüzü uzat, sonra ekle: "ssss-trand", "şşş-rank". Geriye doğru kurma: *rank → Schrank*, *latz → Platz*. Fısıltıyla dene (fısıltıda ünlü sokmak zor). |
| 7 | **Neueinsatz (gırtlak vuruşu)** | Ünlüyle başlayan kelime ve kök önünde kısa bir kesik [ʔ]: *ver|einen, be|achten, Ich | esse | einen | Apfel* (bağlama yok). | Türkçedeki gibi bağlar: "i-çes-se-i-nen". | Türkçede de var: **"saat"** [saʔat], **"cemaat"**, **"kıraat"**. O kesiği her ünlü başlangıcına koy. |
| 8 | **Yazıya bakarak okuma (harf-ses)** | **z** = [ts] (*Zeit*), **s** + ünlü başta [z] (*Sonne, sehen*), **ß/ss** [s], **v** = [f] (*Vater, viel*), **w** = [v] (*Wasser*), **sp-/st-** kök başında [ʃp ʃt] (*Sport, Straße, verstehen*), **-ig** [ɪç] (*billig*), **-ng** [ŋ] g'siz (*Zeitung* ≠ "tsaytung-g"), **uzatma h'si** sessiz (*gehen* [ˈɡeːən], *Uhr*), **ei** [aɪ] / **ie** [iː] / **eu, äu** [ɔʏ]. | Türkçe yazım "yazıldığı gibi okunur": z → [z], v → [v], *gehen* "ge-hen", *Zeitung* sonda g. Köksal & Çınar (2020) Türk öğrencilerde sapmaların çoğunu yazı ve önceki dillerden (İngilizce) aktarmaya bağlıyor **(ikincil)**. | Kart üstünde kural notu + minimal çift: *seit/Zeit, Lied/Leid, Wien/Wein, Biene/Beine, Feier/Feuer, vier/für*. |
| 9 | **Auslautverhärtung** | Sondaki b d g → p t k (*Hund* [hʊnt], *Tag* [taːk], *gelb*). | Türkçede de var (kitap/kitabı), yani olumlu aktarım. Sorun yalnız yazıya bakarak *Hund*'u "hund" okumak. | Düşük öncelik: "Türkçedeki kitap gibi". |
| 10 | **Cümle vurgusu ve tonlama** | Cümle vurgusu yeni bilgide, çoğu zaman son içerik kelimede. Evet/hayır sorusunda yükselen (*Kommst du MIT?* ↗), W-sorusunda ve düz cümlede düşen ton. | Türkçede soru "mi" ekiyle yapılır, ton farklı dağılır. Düz, tek tonlu okuma. | Shadowing'de metne önce vurgu ve duraklama işaretle (aşağıda). Pitch eğrisiyle görsel geri bildirim (Hardison 2004). |

**Türkçe konuşucunun avantajları** (motivasyon için): ü, ö, ş, ç, j zaten var; [ç] için Türkçede ses alt yapısı var; gırtlak vuruşu tanıdık; sondaki ötümsüzleşme aynı.

### Kaynaklar (bölüm 1)
- Darcy, I. & Krüger, F. (2012). *Vowel perception and production in Turkish children acquiring L2 German.* Journal of Phonetics 40, 568–581. Türk çocuklar zor karşıtlıkları algıda farklı kategorize ediyor, üretim çoğunlukla hedefe uygun. [PDF](https://psycholinguistics.indiana.edu/papers/DarcyKrueger(2012)vowel-perception-production-in-TurkishL1-GermanL2-children.pdf)
- Nimz, K. (2015). *The Perception of vowel quality and quantity by Turkish learners of German as a Foreign Language.* The Segment in Phonetics and Phonology, 253–266. [kayıt](https://pub.uni-bielefeld.de/record/2909487) · Nimz (2011), ICPhS XVII. [kayıt](https://pub.uni-bielefeld.de/record/2907603) (sonuçlarına erişemedim)
- Köksal & Çınar (2020). Türk çok dilli öğrencilerin Almanca harf-ses hata analizi. [kayıt](https://avesis.gsu.edu.tr/yayin/56666c3e-c310-45fd-ba90-fe064eebc597/the-relationship-of-letters-and-sounds-in-german-an-error-analysis-of-the-pronunciation-of-multilingual-turkish-students) **(ikincil)**
- Hirschfeld, U. & Reinke, K. *Phonetik im Fach Deutsch als Fremd- und Zweitsprache* (3. bs., Erich Schmidt), Türkçe karşılaştırmalı bölüm 5.3.10. [içindekiler](https://www.esv.info/download/inhaltsverzeichnisse/9783503243204.pdf)
- Hirschfeld, U. (1994). *Untersuchungen zur phonetischen Verständlichkeit Deutschlernender.* Forum Phoneticum 57. Bulgu (ikincil): suprasegmental sapmalar segmental olanlardan daha çok anlaşılırlığı bozuyor. [bibliyografya](https://www.uni-bielefeld.de/fakultaeten/linguistik-literaturwissenschaft/studium-lehre/studienfaecher/daf-daz/lehrprojekte-und-material/ausspracheschulung/basisbibliographie.pdf)
- Turkish phonology (h'nin [ç]/[x] alt sesleri, ğ uzatması, ödünç kelimelerde küme kırma). [Wikipedia](https://en.wikipedia.org/wiki/Turkish_phonology) (destek kaynağı)
- Gergin/gevşek karşıtlık (Miete/Mitte, Hüte/Hütte): LMU IPS projesi. [link](https://www.en.phonetik.uni-muenchen.de/research/completed_projects/tensity_en.html)
- Almanca işlevsel yük: yüksek işlevsel yüklü hatalar anlaşılırlığı daha çok bozuyor. [core.ac.uk](https://core.ac.uk/works/150059875) **(ikincil)**

---

## 2. Yöntemlerin kanıtı

| Yöntem | Kanıt | Tuna için anlamı |
|---|---|---|
| **Açık telaffuz öğretimi genel olarak** | Lee, Jang & Plonsky (2015), 86 rapor meta-analizi: orta-büyük etki (ikincil kaynakta d ≈ 0,80). Saito & Plonsky (2019), 77 çalışma: kazanç **kontrollü görevde** (sesli okuma) net, **serbest konuşmada** daha az net. Thomson & Derwing (2015): değerlendirmelerin çoğu sesli okuma. | İşe yarar, ama serbest konuşmaya taşımak için konuşma görevinin içinde de çalışmak gerek (yalnız kelime tekrarı yetmez). |
| **Prozodi ağırlıklı öğretim** | Derwing, Munro & Wiebe (1998): segment grubu da prozodi grubu da sesli okumada iyileşti; **serbest anlatımda yalnız prozodi grubu** iyileşti. Munro & Derwing (1995, 2020): aksan, anlaşılırlık ve anlaşılabilirlik kısmen bağımsız, ağır aksanlı konuşma da çok anlaşılır olabilir. | Hedef "aksansız" değil, **anlaşılır ve akıcı**. Vurgu, ritim ve duraklama önce. |
| **Algı eğitimi / HVPT (çok sesli minimal çift dinleme)** | Sakai & Moorman (2018): algı eğitimi algıyı güçlü geliştiriyor, üretime aktarım küçük-orta ve tutarsız **(ikincil)**. Uchihara, Karas & Thomson (2024), 31 çalışma: algı tabanlı HVPT üretimi de iyileştiriyor; süre, oturum uzunluğu ve fonetik açıklama etkiyi artırıyor. Zhang ve ark. (2021): çok konuşucu, tek konuşucudan biraz daha iyi (küçük etki). | Uygulamaya **dinleyip seçme** sorusu ekle: objektif, sistem notlayabilir, kısa, klavyeyle 1/2. Birden çok ses kullan. |
| **Shadowing** | Foote & McDonough (2017, J. of Second Language Pronunciation 3(1)): 8 hafta iPod shadowing → anlaşılırlık ve akıcılık arttı, **aksan derecesi artmadı**. Hamada (2016, LTR 20(1)): ses algısı arttı (bottom-up dinleme). Kadota/Hamada derlemeleri: kapsamlı bir özet çalışma henüz yok. | Tuna'nın "dinleme önemli" önceliğine de uyuyor. Gerçek insan sesiyle, kısa cümlelerle, önce "dinle-tekrarla" (cümle bitince tekrar) sonra eşzamanlı. |
| **Kendini kaydetme + modelle karşılaştırma** | Dlaska & Krekeler (2008, System 36(4)): Almanca öğrenenler **genel** telaffuzlarını uzmanlarla büyük ölçüde aynı değerlendiriyor (ikincil: ~%85), ama **hangi sesin** sorunlu olduğunu bulamıyor. LMU çalışması: öğrenciler kendi telaffuzlarını abartıyor. Kendi sesinin düzeltilmiş hâlini taklit etme (Golden Speaker / Kusz 2023) küçük örneklerde olumlu. | Kaydet-dinle tek başına zayıf: **tek odaklı** karşılaştırma gerek ("yalnız şu kelimedeki uzun ü'ye bak") ve **arka arkaya** dinleme (model → ben → model). Odak sesleri önce algı sorusuyla eğitilmeli. |
| **Görsel geri bildirim (pitch eğrisi)** | Hardison (2004, LLT 8(1)): gerçek zamanlı pitch eğrisiyle Fransızca prozodi anlamlı iyileşti, öğrenciler farkı "görerek" fark ettiğini söyledi. Chun (1998), Levis & Pickering (2004) de destekliyor. Uyarı: eğri okumayı öğrenmek gerekiyor. | Tonlama ve vurgu için uygun. Ünlü uzunluğu için **süre çubuğu / dalga** daha anlaşılır. |

Kaynaklar: [Lee ve ark. 2015](https://experts.nau.edu/en/publications/the-effectiveness-of-second-language-pronunciation-instruction-a-/) · [Saito & Plonsky 2019 OASIS özeti](https://discovery.ucl.ac.uk/10156232/1/OASIS_Summary_Saito_and_Plonsky_2019.pdf) · [Thomson & Derwing 2015](https://benjamins.com/online/ebop/publications/60375) · [Derwing ve ark. 1998 (atıf)](https://core.ac.uk/download/84321185.pdf) · [Munro & Derwing 2020 redux](https://www.benjamins.com/catalog/bct.121.02mun) · [Uchihara ve ark. 2024 HVPT→üretim](https://www.cambridge.org/core/product/E38D8F5CE65DC708137B0E95F97C6BC7) · [HVPT algı meta-analizi](https://resolve.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6/core-reader) · [Foote & McDonough 2017](https://cir.nii.ac.jp/crid/1363670318626960768) · [Hamada shadowing derlemesi (RELC J.)](https://journals.sagepub.com/doi/10.1177/0033688218771380) · [Hardison 2004](https://core.ac.uk/download/84320966.pdf) · [Dlaska & Krekeler 2008 atıfları](https://core-prod.cambridgecore.org/core/journals/bilingualism-language-and-cognition/article/flawed-selfassessment-investigating-self-and-otherperception-of-second-language-speech/05B422E9B1F104B182710E7E74A0DC8E) · [Kusz, kendini taklit](https://iastatedigitalpress.com/psllt/article/15721/galley/15263/view)

Akıcılık ölçümü için (bellekten, **emin değilim**: ayrıntılar): Suzuki, Kormos & Uchihara (2021, Modern Language Journal) meta-analizi: konuşma hızı ve **duraklama sıklığı** algılanan akıcılıkla güçlü ilişkili. Bu yüzden duraklama ölçümü Sprechen için anlamlı bir nesnel sinyal.

---

## 3. Otomatik telaffuz değerlendirmesi: tarayıcıda, ücretsiz, ne kadar güvenilir?

| Seçenek | Ücretsiz mi | Tarayıcıda mı | Ne verir | Güvenilirlik (Tuna'nın sorunları için) | Karar |
|---|---|---|---|---|---|
| **Web Speech API `SpeechRecognition`** (Chrome) | Evet | Evet. Ses Google sunucusuna gider. Chrome masaüstünde yeni on-device modu var (`processLocally`, dil paketi ~60 MB, `available()/install()`) | Transkript + `confidence` + alternatifler | **Düşük.** Dil modeli beklenen kelimeye çeker ("Three blind mites" hep "mice" duyuluyor). *Hütte*'yi uzun ü ile söylesen de çoğu zaman *Hütte* yazar; vurgu ve -er'i görmez. `confidence` doğrulanmış bir telaffuz ölçüsü değil. | **Not verme.** En fazla, isteğe bağlı "Google bu cümleyi anladı mı?" kaba anlaşılırlık sinyali. Hafızaya ve nota bağlanmamalı. Tuna haklı. |
| **Whisper (transformers.js / WebGPU)** | Evet | Evet. base ~75–200 MB, small ~250–600 MB | Transkript, kelime zamanları | Transkript sorunu aynı (güçlü dil modeli). Düşük güven / alternatif transkriptler hata *ipucu* olabilir (Ballier ve ark., Fransız öğrenciler) ama doğrulanmış bir puan değil. | Şimdilik hayır. Yalnız **build sırasında** DW mp3'lerinin cümle zamanlarını bulmak için iyi (aşağıda P3). |
| **wav2vec2 fonem tanıma** (xlsr-53-espeak-cv-ft vb.) + hizalama (GOP) | Evet | Pratikte hayır: ~300M parametre, fp32 ~1,2 GB. Tarayıcıya uygun Almanca fonem modeli bulamadım (İngilizce ONNX örneği var) | Fonem dizisi → beklenen sesletimle karşılaştırma | Araştırma düzeyi. L2 aksanında fonem tanıma hatası yüksek. Almanca uzun/kısa ünlü ayrımını güvenilir yakaladığına dair kanıt bulamadım. | Hayır. |
| **Azure Pronunciation Assessment** | F0 katmanı ayda 5 saat ücretsiz (kart gerekir) | Speech SDK (JS) tarayıcıdan çalışır, anahtar gerekir | de-DE için kelime / hece / **fonem doğruluk** puanı, akıcılık, tamlık. **Prozodi puanı yalnız en-US.** | Orta. Forumlarda "her şeye 100 veriyor" şikâyetleri (çoğu yanlış uç nokta / kötü ses kaynaklı). Almanca L2 için insan puanıyla uyumuna dair bağımsız veri bulamadım **(emin değilim)**. Ses Microsoft'a gider. | İleride **deneysel "ikinci görüş"**, Tuna'nın kendi anahtarı `localStorage`'da. Hafızaya yazmaz. Düşük öncelik. |
| **Google Cloud Speech** | Kısmi ücretsiz kota | Sunucu gerekir | Telaffuz puanı yok, yalnız transkript | Web Speech ile aynı sorun | Hayır. |
| **SpeechSuper / Speechace** | Yalnız deneme | Sunucu/anahtar | SpeechSuper Almanca puanlama yapıyor | Bilinmiyor, ücretli | Hayır. |
| **Kendi akustik ölçümün** (Web Audio + YIN/MPM pitch, enerji ile sessizlik bulma, süre) | Evet | Evet, birkaç yüz satır, bağımlılık yok | Pitch eğrisi, dalga, duraklama sayısı/süresi, konuşma oranı, hece/vurgu enerji tepeleri | **Yüksek** (ölçtüğü şey için): pitch takibi sesli bölgelerde güvenilir (oktav hatası için düzeltme gerekir), sessizlik ölçümü basit ve sağlam. Ama "doğru telaffuz" demez, yalnız **görünür kılar**. | **Evet:** görsel A/B karşılaştırma ve Teil 2 akıcılık ölçer. Not vermez. |

**Teknik kısıt (önemli):** `speechSynthesis` (uygulamanın şimdiki TTS'i) sesi Web Audio'ya vermiyor. Modelin dalga / pitch eğrisi çizilemez. Görsel karşılaştırma için model **ses dosyası** olmalı: Wikimedia Commons (`De-<kelime>.ogg`, ana dilli kayıtlar, CC BY-SA, dosyaya göre değişir), DW Top-Thema mp3'leri (repo'da 39 metnin 6'sında `audio` var) ya da build sırasında açık kaynak TTS ile üretilmiş dosyalar (Piper, Almanca sesler: thorsten vb., **emin değilim**: kalite ve lisans tek tek kontrol edilmeli). DW akamai mp3'lerinin CORS izni verip vermediğini doğrulayamadım. Vermiyorsa tarayıcıda analiz edilemez, yalnız çalınır.

Kaynaklar: [Web Speech LM yanlılığı örneği](https://ai4k12.org/speech-recognition-in-chrome/) · [Chrome on-device install()](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/install_static) · [Intent to Ship: On-device Web Speech](https://groups.google.com/a/chromium.org/g/blink-dev/c/VNOok2dbmHM) · [Azure pronunciation assessment](https://learn.microsoft.com/en-ca/azure/ai-services/speech-service/how-to-pronunciation-assessment) · [Azure "hep 100" sorunu](https://learn.microsoft.com/en-us/answers/questions/1680083/cognitive-services-pronunciation-assessment-always) · [Azure fiyat](https://azure.microsoft.com/en-au/pricing/details/cognitive-services/speech-services/) · [Whisper ile L2 fonetik teşhis (HAL)](https://www.archives-ouvertes.fr/hal-04547597v1) · [tarayıcıda Whisper boyutları](https://offlinetts.com/blog/browser-speech-recognition-whisper-comparison/) · [tarayıcıda fonem tanıyıcı (İng.)](https://huggingface.co/robg/speako-phoneme-recognizer) · [pitch-detection (YIN, MPM)](https://awesome.ecosyste.ms/projects/github.com%2Faudiojs%2Fpitch-detection) · [Commons De- dosyaları örneği](https://c.enwp.org/wiki/File:De-Sport.ogg)

---

## 4. Repo'da ne var (gözlem)

- **TTS:** `js/app.js` `sprich()` (≈1635) ve `almancaSes()` (≈1620): cihazdaki (yerel) Almanca sesi öne alıyor (24.10 gecikme düzeltmesi). Tuna Chrome masaüstünde: Windows'ta bu büyük olasılıkla eski "Microsoft Hedda/Katja/Stefan" sesleri **(emin değilim; işletim sistemine bağlı)**. Telaffuz modeli olarak prozodisi zayıf. "Google Deutsch" (çevrimiçi) daha doğal ama geç başlıyor. Ses seçimi Ayarlar'da yok.
- **Konuşma bölümü** (`sprechenRender` ≈4398, `spKayitBaslat` ≈4369, `spShadowSatz` ≈4387, `spBitti` ≈4461): shadowing sekmesi TTS ile cümle okuyor (🔊 / 🐢), tek kayıt, `<audio controls>`. Model ile kayıt arka arkaya çalınmıyor, odak yok, görsel yok, ölçüm yok. Log yalnız `gemacht` + `kayıt:Nsn`. `MODI.sprechen` hedef 1, `ISLER_AGIRLIK.sprechen` 3. **Log'da hiç `sprechen` satırı yok.**
- **Tanıtım kartı** `frageTanit` (≈735): `sesBtn` ile kelime ve örnek cümle okunuyor. Vurgu ya da uzun/kısa bilgisi yok. Veride (`daten/*.js`) IPA / vurgu alanı yok.
- Turda `anla`/`metinde` sorularında kelime kendiliğinden okunuyor (≈2650, ≈3970), dikte var (`metin` etkinliği, ünite `diktat`), Gramer'de `dinle` türü var. Yani **dinleme altyapısı var, ayırt etme (algı) sorusu yok.**
- Okuma: DW metinlerinde `audio` oynatıcı (≈1581). Cümle zamanı yok, döngü yok, hız ayarı yok.

---

## 5. Uygulama önerileri

Kural uyumu: kural 8 ("notu sistem verir, öz-değerlendirme yok") → **dinleyip seçme soruları sistemce notlanır**. Kayıt-karşılaştırma notlanmaz, hafızaya (Kern) yazmaz, yalnız log (Cümle atölyesi `kur` gibi). Tuna sabah 05:30'da çalışıyor (evde başkaları uyuyor olabilir): **sesli söyleme adımları isteğe bağlı ve atlanabilir olmalı**. Dinleme adımları kulaklıkla sessiz yapılabilir.

### P1 — Kelimede vurgu + uzun/kısa işareti + gerçek insan sesi (orta: veri aracı · küçük: arayüz)
- **Ne:** Her öğe için IPA'dan türetilen **Duden tarzı işaret**: vurgulu **uzun** ünlünün altı çizgili (Hü̲te), vurgulu **kısa** ünlünün altında nokta (Hụ̈tte). DaF ders kitapları (Netzwerk dahil) bu işareti kullanıyor. Tıklanınca IPA ve tek satır kural ("ch = ich-Laut, ihtiyar'daki h"). Ses düğmesi varsa önce **Commons insan kaydı**, yoksa TTS.
- **Neden:** Vurgu ve ünlü uzunluğu anlaşılırlığın ilk iki kalemi (bölüm 1–2). Tuna her gün tanıtım kartlarını ve çözüm panelini görüyor, Konuşma'ya girmiyor: bilgi akışın içinde olmalı. Maliyet düşük, kalıcı.
- **Nasıl:** yeni `tools/aussprache.py`: Goethe listesi + `nomen_extra` + `woerter` lemmaları için de.wiktionary'den IPA (`{{Lautschrift|…}}`) ve Commons ses dosya adı (`De-<Lemma>.ogg`, Lingua Libre) çeker → `quellen/aussprache.txt` (`lemma | IPA | ses-dosyası | lisans`; elle düzeltilebilir). `tools/build.py` bunu `daten/nomen.js / verben.js / woerter.js` kayıtlarına `ipa`, `ses` alanı olarak ekler. Bulunamayanlar için kural tabanlı tahmin (ayrılmayan ön ek vurgusuz, -ieren/-tion/-tät vurgulu) **"tahmini"** etiketiyle. `js/app.js`: `artHTML` / `frageTanit` / `loesungHTML`'e `vurguHTML(id)`. `sesBtn` → `ses` alanı varsa `new Audio(url)`. Wiktionary kapsamı (B1 kelimelerinin büyük çoğunluğu, **emin değilim**: oran ölçülmeli).
- **Öncelik:** 1.

### P1 — Tura "dinle ve ayırt et" sorusu (orta)
- **Ne:** Yeni soru türü `hoer` (B0, klavye 1/2/3):
  (a) **Minimal çift:** bir kelime çalınır, iki yazımdan hangisi? (*Hüte / Hütte*, *Miete / Mitte*, *Staat / Stadt*, *Kirche / Kirsche*, *seit / Zeit*, *Lied / Leid*, *Feier / Feuer*, *vier / für*, *lesen / lösen*, *Lehrer / Lehre*…);
  (b) **Vurgu:** kelime çalınır, vurgulu heceyi seç (AN·ru·fen / an·RU·fen; ÜBER·set·zen / über·SET·zen; be·SU·chen);
  (c) **-er/-e/-en:** *Lehrer / Lehre*, *Leser / lese*.
  Sistem notlar, doğruysa kendiliğinden geçer (kural 8). Yanlışta iki kelime arka arkaya çalınır + Türkçe kanca (bölüm 1 tablosu).
- **Neden:** Algı, üretimin önünde (Darcy & Krüger 2012) ve algı eğitiminin kanıtı en güçlü kalem (HVPT meta-analizleri). Nesnel ve hızlı (≈5 sn). Tuna "dinleme önemli" diyor. Seçmeli şıkların "eleme ile çözülme" sorunu burada yok: iki şık da gerçek kelime, fark yalnız seste.
- **Nasıl:** `quellen/minimalpaare.txt` (`kontrast | kelime1 | kelime2 | tr1 | tr2`; ~80–120 çift, B1 ağırlıklı, Claude yazar, ilk sürümde Tuna dinleyerek kontrol eder). Build → `daten/hoer.js`. `js/app.js` `frageHoer()`. `Kern.sec`'te turda bir yuva (metin etkinliği gibi, örn. adım 4–6; yalnız `sesAcik()`; klavyesiz / Hızlı turda da olur). Ses: Commons kaydı > TTS. TTS'de **her seferinde farklı Almanca ses** (Chrome'da 2–4 ses: çok konuşuculu eğitim). Durum `S.hoer[kontrast] = { n, d, son }`: en zayıf kontrast önce, 3 gün art arda ≥ %90 olan seyrelir. Log: `modus hoer`, id `mp:<kontrast>:<kelime>` / `vurgu:<öğe>`, ergebnis `richtig`/`falsch`, notiz `kontrast:i-ɪ | ses:commons|tts:<ad> | sek:N`. Kern hafızasına yazmaz (ya da yalnız `S.hoer`). İlerleme'ye "kulak haritası" (kontrast başına doğruluk).
- **Risk:** TTS sesleri uzunluk karşıtlığını her zaman net üretmeyebilir **(emin değilim)**. Commons kaydı olan çiftler önce, şüpheli TTS çifti listeden çıkarılır.
- **Öncelik:** 1.

### P2 — Konuşma → "Telaffuz" sekmesi: dinle → tekrarla → kaydet → A/B (orta–büyük)
- **Ne:** Kısa cümle (6–10 kelime). Akış:
  1. **Dinle** (hız 1,0 / 0,75; Commons/DW/build-TTS dosyası varsa o).
  2. **Odak:** cümlede tek özellik vurgulanır (vurgulu heceler büyük harf, duraklama `|`, odak ses renkli: "bugün: -er").
  3. **Dinle-tekrarla** (cümle bitince, cümle süresi × 1,3 sessizlik). Sonra **shadowing** (eşzamanlı).
  4. **Kaydet** → **"Karşılaştır"** tek düğme: model → ben → model arka arkaya, döngü.
  5. Model bir dosyaysa: iki **pitch eğrisi + dalga** üst üste (DTW ile zaman hizalı ya da yalnız ikisi alt alta).
- **Neden:** Karşılaştırma arka arkaya ve tek odakla olmazsa işe yaramıyor (Dlaska & Krekeler 2008: öğrenci hangi sesin bozuk olduğunu bulamıyor). Pitch eğrisi prozodi için kanıtlı (Hardison 2004). Shadowing anlaşılırlık ve akıcılık için kanıtlı (Foote & McDonough 2017).
- **Nasıl:** `sprechenRender`'e `telaffuz` sekmesi. `spKayitBaslat`'ın blob'u → `AudioContext.decodeAudioData` → `spAnaliz(buf)`: YIN pitch (≈60 satır, bağımlılık yok, 10 ms adım, 75–400 Hz, oktav sıçraması düzeltmesi), RMS enerji → `<canvas>`. Cümle kaynağı: `quellen/prosodie.txt` (`Almanca | Türkçe | odak | işaretli biçim`, örn. `Ich HAbe | meinen SCHLÜSsel verLOren.`; Claude ~60 cümle yazar, öğrenilmiş kelimelerden). Log: `modus aussprache`, id `<öğe>:telaffuz`, ergebnis `gemacht`, notiz `odak:-er | kayıt:3sn | karşılaştır:2 | tekrar:3`. Not ve hafıza yok.
- Ayrıca **Ayarlar → "Telaffuz sesi"**: Almanca sesleri listele, Telaffuz ve minimal çiftte seçilen ses (Google Deutsch'un geç başlaması burada sorun değil). Tur içinde bugünkü yerel ses kalır. (küçük)
- **Öncelik:** 2.

### P2 — Teil 2 kaydında duraklama / akıcılık ölçer (küçük–orta)
- **Ne:** Sunum kaydı bitince: toplam süre, konuşma oranı (%), **1 sn'den uzun duraklama sayısı**, ortalama kesintisiz konuşma bloğu (sn). Gün gün trend İlerleme'de.
- **Neden:** Tuna'nın sınavda zayıf olduğu yer Sprechen. Duraklama sıklığı algılanan akıcılıkla güçlü ilişkili (bölüm 2). Akustik, ASR'siz, güvenilir. Bugünkü 4 maddelik öz-kontrol listesinin ("ähm yok") nesnel karşılığı.
- **Nasıl:** `spKayitBaslat` `onstop` → enerji eşiği (gürültü tabanı + 10 dB, 50 ms pencere) → sessiz bölgeler. `spBitti` notizine `dk | konuşma%:71 | dur1sn:4 | blok:6.2sn`. (Hızı sn başına hece olarak kaba tahmin de mümkün: enerji tepeleri sayımı, **emin değilim** güvenilirliği.)
- **Öncelik:** 2.

### P2 — Konuşmayı günlük akışa sokmak (küçük)
- Bugün ekranındaki sprint "Beceri" dönüşümüne **"Telaffuz 3 dk"** günü ekle (minimal çift seti + 3 cümle dinle-tekrarla-kaydet). Tur sonu ekranına isteğe bağlı "1 cümle sesli tekrar" kartı. `ISLER_AGIRLIK.sprechen` 3 → 10.
- **Neden:** Bölüm var, kullanılmıyor (0 satır). Yeni bölüm açmak yerine Tuna'nın zaten gittiği yere koy.

### P3 — DW gerçek sesiyle cümle cümle shadowing (büyük)
- **Ne:** DW Top-Thema mp3'ünde cümle başı/sonu zamanları → Okuma'da ve Telaffuz'da cümle döngüsü (A-B tekrar, 0,75×, "cümleden sonra sus" modu).
- **Neden:** İnsan sesi, doğal prozodi, yavaş okunmuş ve Tuna'nın dinleme önceliğine uygun. TTS prozodisinden iyi.
- **Nasıl:** `tools/dw_zaman.py`: build/gece işinde (GitHub Actions) faster-whisper kelime zamanları ya da metinle zorlamalı hizalama → `quellen/lesetexte_dw.json`'a `saetze: [{de, t0, t1}]`. Arayüzde `audio.currentTime` ile döngü (CORS gerekmez, yalnız çalma). Şimdi yalnız 6 DW metninde ses var: `tools/dw_topthema.py` ses adresini daha çok metin için yazmalı.
- **Öncelik:** 3.

### P4 — Deneysel: Azure fonem puanı "ikinci görüş" (orta)
- Ayarlar'da Tuna kendi Azure anahtarını girerse Telaffuz sekmesinde fonem düzeyi puan (de-DE). Hafızaya ve nota girmez, log notizine `azure:acc=78`. Ses Microsoft'a gider. Prozodi puanı Almancada yok. **Şimdi önermiyorum.** Önce P1–P2'nin kullanılıp kullanılmadığı görülsün.

### Yapılmamalı
- Web Speech / Whisper transkriptine göre doğru/yanlış notu ve hafıza güncellemesi. Yanlış pozitif ve negatif çok, Tuna'nın güvenini bozar. Kendi gözlemi de bu.
- Sesli cevabı zorunlu kılmak (sabah, sessiz ortam).

---

## 6. Tuna'nın kendi yapacakları (uygulama dışı)

**Günlük 10 dakika (sabah turundan sonra, kulaklıkla):**
1. **3 dk dinle-ayırt et:** Goethe-Institut **Online Aussprachetrainer** (ücretsiz, algı alıştırmalarıyla başlıyor: ses ayırt etme, vurgu bulma): https://www.goethe.de/de/spr/ueb/ast.html. Bu hafta yalnız uzun/kısa ünlü, gelecek hafta ch, sonra vurgu.
2. **5 dk shadowing**, 1 kısa paragraf (DW *Top-Thema* ya da DW *Langsam gesprochene Nachrichten*, metinli ve yavaş). Adımlar:
   a) metinsiz dinle; b) metinle dinle, metne **vurgulu heceleri ve duraklamaları kalemle işaretle**; c) sessizce dudakla eşlik et; d) metne bakarak yüksek sesle shadow; e) metinsiz shadow. Aynı paragraf 3 gün, sonra yenisi.
3. **2 dk kayıt:** paragraftan 1 cümle kaydet, **model → sen → model** arka arkaya dinle. **Tek şeye** bak (bugün: -er "a" gibi mi? r'yi düşürdüm mü?). Hepsine birden bakma: öğrenci hangi sesin bozuk olduğunu kendi bulmakta zorlanıyor.

**Haftalık:**
- **1 Teil 2 sunumu kaydet** (2 dk). Aynı konuyu ertesi gün tekrar kaydet: duraklama sayısı düştü mü?
- Kursta öğretmenden **somut** telaffuz geri bildirimi iste: "Benim en anlaşılmaz 2 sesim hangisi?" Genel "dilini geliştir" yerine. Uni Bremen'de bir **tandem** partnerine haftada 10 dk "beni yalnız telaffuzda düzelt" de.

**Öncelik sırası (Türk konuşucu için):** (1) vurgu + ritim, vurgusuz -e/-er/-en'i zayıflatmak → (2) uzun/kısa ünlü (ğ kancası) → (3) sondaki r'yi düşürmek (-er = a) → (4) ch [ç]/[x] (ihtiyar / sabah) → (5) kümeye ünlü sokmamak (Schrank, Strand, Platz) → (6) kelime başındaki ünlüde kesik (saat kancası) → (7) z, s, v, w, sp/st, -ig, -ng, sessiz h. **Ü ve ö'ye zaman harcama**, onlar zaten Türkçede var. Başta dil ucu r'si de kabul edilir.

**Kendine hatırlatma:** Hedef aksansız olmak değil, **anlaşılır ve akıcı** olmak (Munro & Derwing). Sınavda puan getiren de bu.

---

## 7. Açık noktalar / emin olmadıklarım
- Nimz (2011, 2015): Türk öğrencilerin uzunluk ve nitelik algısı bulgularının ayrıntısına erişemedim.
- Lee ve ark. (2015) etki büyüklüğü (d ≈ 0,80) ve Dlaska & Krekeler (~%85) ikincil kaynaktan.
- Goethe B1 Sprechen değerlendirme formundaki Aussprache puan payını doğrulayamadım (Übungssatz PDF s. 47–48'de "Bewertungskriterien"). Bellekten: Aussprache ayrı ölçüt **(emin değilim)**.
- Chrome masaüstünde Tuna'nın gördüğü Almanca TTS seslerinin adı ve kalitesi işletim sistemine bağlı. Uygulamada `speechSynthesis.getVoices()` listesini Ayarlar'da göstermek bunu netleştirir.
- Commons ses kapsamı ve DW mp3 CORS durumu ölçülmeli.
- Ağ: WebFetch için dergipark.org.tr, pub.uni-bielefeld.de, psycholinguistics.indiana.edu ağ izninde değildi. Tam metinler okunamadı.
