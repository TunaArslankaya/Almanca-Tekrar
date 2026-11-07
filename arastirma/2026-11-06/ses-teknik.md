# ses-teknik: Konuşma ve dinleme — ne eklenebilir? (teknik + ürün, 6.11.2026)

## 0. Kısaca

- Tuna'nın zayıf yanı Sprechen; uygulamadaki her şey yazı ve seçmeli. Konuşma bölümü var ama hiç açılmamış (log'da 0 `sprechen` satırı). Ses ayrı bölümde kaldıkça kullanılmayacak, **ana tura girmesi gerek**.
- Kanıtı en güçlü ve tarayıcıda gerçekten yapılabilir olan iki şey:
  1. **Pimsleur tarzı sesli hatırlama ("Söyle")**: Türkçe gösterilir → Tuna Almancasını yüksek sesle söyler → sistem ASR (Chrome Web Speech) ile kontrol eder → hemen doğru ses çalınır. Bu, uygulamanın zaten yaptığı geri çağırma pratiğinin sesli biçimi.
  2. **Yalnız sesle tanıma ve dinle-yaz ("Duy")**: metin gösterilmez, yalnız ses çalınır.
- **Telaffuz konusunda dürüst olmak gerek:** tarayıcıda ücretsiz ve güvenilir bir Almanca ses birimi (fonem) puanlaması yok. Gerçekçi seçenekler şunlar: ASR'nin söyleneni anlayıp anlamadığı (anlaşılırlık), model–sen–model art arda dinleme, minimal çift dinleme eğitimi (HVPT, kanıtı güçlü) ve isteğe bağlı Azure Pronunciation Assessment (ücretli servis, ayda 5 saat bedava, anahtar gerekir).
- Glossika tarzı "aynı cümleyi defalarca tekrar et" yöntemine karşıyım. Tuna'nın şikâyeti tam olarak bu: "cevabı ezberliyorum". Cümle hep değişmeli.

---

## 1. Başarılı uygulamalar ne yapıyor, bize ne lazım?

| Uygulama | Konuşma / dinleme özelliği | Bize alınacak | Alınmayacak |
|---|---|---|---|
| **Pimsleur** | Yalnız ses. Soru → **ara (anticipation: önce sen söyle)** → anadili konuşanın doğrusu. "Graduated interval recall" (5 sn, 25 sn, 2 dk, 10 dk …). Az ama çekirdek kelime. | Önce söyle, sonra doğruyu duy döngüsü. Oturum içinde kısa aralıkla yeniden sorma (bizde zaten `kuyruk`). | Sabit büyüyen aralıklar: kanıt, genişleyen aralığın eşit aralıktan üstün olmadığını gösteriyor (§2). FSRS yeterli. |
| **Glossika** | Cümleyi dinle → tekrar et (GMS), aralıklı tekrar, binlerce "rep". | Gerçek cümle sesiyle konuşma hacmi. | Aynı cümleyi defalarca tekrar etmek. Kontrollü çalışma yok; eleştirmenler de "duyduğunu tekrarlamak, yeni cümle kurmak değil" diyor. |
| **Babbel** | Kendi ses verisiyle eğitilmiş konuşma tanıma (web'de Almanca dahil). **Babbel Speak** (Eylül 2025): senaryolu sesli diyaloglar (kafede sipariş vb.). | Kısa, senaryolu sesli cevap. | İncelemelere göre tanıma "hoşgörülü": telaffuz yargıcı değil. |
| **Duolingo** | Kelime / cümle tekrar etme, sesli çeviri, dinle-yaz, "Video Call with Lily" (Max, Almanca var). Tanıma sunucuda, "kaprisli". | Dinle-yaz, sesli çeviri; hata yaptırmayan, düşük baskılı sohbet. | Duolingo'nun kendi Lily araştırması bağımsız değil. |
| **Speechling** | Cümleyi kaydet, insan koç geri bildirimi (Almanca ücretsiz kotada yok), anadili konuşanın kaydıyla yan yana dinleme. | Model ↔ kendi kaydın yan yana (ABA). | İnsan koç (bizde yok). |
| **ELSA** | Ses birimi düzeyinde telaffuz puanı. | Fikir olarak. | **Yalnız İngilizce.** Almanca yok. |
| **Praktika / Babbel Speak / Duolingo Max** | LLM + ASR + TTS ile yapay zekâ konuşma partneri. | İleride Sprechen Teil 1 / 3 partneri. | Sunucusuz PWA'da API anahtarı ve ücret gerekir; Tuna "dökümü kontrol etmek faydalı değil" diyor. |
| **LingQ** | Dinle + oku (anlaşılır girdi), metin + ses, bilinmeyen kelime işaretleme. | Zaten var: DW okuma + `lesen-wort`. DW sesini artırmak (§4). | — |

Kaynaklar: Pimsleur'ün kendi yöntem sayfası ([pimsleur.com](https://www.pimsleur.com/the_pimsleur_method)); Babbel Speak basın bülteni ([uk.babbel.com](https://uk.babbel.com/press/en-gb/releases/babbel-speak)) ve konuşma tanıma bülteni ([babbel.com](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us)); Duolingo'nun konuşma yaklaşımı ([blog.duolingo.com](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-speaking-skills)) ve Video Call raporu ([blog.duolingo.com](https://blog.duolingo.com/video-call-research-report)); Glossika incelemeleri ([fluentu](https://fluentu.com/blog/reviews/glossika), [discoverdiscomfort](https://discoverdiscomfort.com/glossika-review-language-learning-app/), yalnız blog); Speechling ([discoverdiscomfort](https://discoverdiscomfort.com/speechling-review-language-learning-free/), blog).

---

## 2. Kanıt: ne işe yarıyor?

1. **Geri çağırma pratiği sesli de çalışır, ama aralık takvimi önemsiz.** Pimsleur'ün özü "önce sen söyle", yani geri çağırma. Genişleyen aralıklar yalnız hemen yapılan testte üstün; uzun vadede eşit aralık eşit ya da daha iyi (Karpicke & Roediger 2007; 2010 metinde fark yok: [wustl](https://profiles.wustl.edu/en/publications/is-expanding-retrieval-a-superior-method-for-learning-text-materi/), [gwern pdf](https://www.Gwern.net/doc/psychology/spaced-repetition/2010-karpicke.pdf)). Kelime çalışmasında da eşit gecikme daha iyi çıkmış ([Schuetze, CALICO](https://www.uvic.ca/humanities/germanicslavic/assets/docs/RetentionCalico.pdf)). Sonuç: Pimsleur'den sesli geri çağırmayı ve oturum içi yeniden sormayı al, takvimi FSRS'te bırak.
2. **Üretim etkisi (production effect):** yüksek sesle söylenen kelime sessiz okunandan daha iyi hatırlanıyor. Etki asıl **aynı listede sesli ve sessiz karışıkken** güçlü; gruplar arası karşılaştırmada küçük (g ≈ 0,37; Fawcett 2013, MacLeod lab özetleri: [uwaterloo](https://uwaterloo.ca/memory-attention-cognition-lab/sites/default/files/uploads/files/forrin-macleod-2016-cjep.pdf), [Psych Sci derleme](https://journals.sagepub.com/doi/10.1177/0963721417691356)). Bu, sesli soruların ayrı bölümde değil **turun içine karışık** konmasını destekliyor.
3. **Kipe uygunluk (encoding–retrieval match):** sözlü ve yazılı tekrar karşılaştırmalarında, kelime en iyi öğrenildiği kipte geri çağrılıyor. Yazılı tekrar yazılı biçimi kısa vadede biraz daha iyi öğretiyor (Candry vd. 2018, [EuroSLA](https://euroslajournal.org/articles/44); AILA 2021 özeti). Çalışmalar küçük. Yine de mantık açık: Tuna konuşma sınavında kelimeyi **ağızdan** çıkaramıyor, uygulama ise yalnız elle yazdırıyor.
4. **Shadowing (dinlerken tekrar):** 44 çalışmalık sistematik derlemeye göre anlaşılabilirlik, akıcılık ve prozodiye yararlı; ses birimlerine etkisi belirsiz; etki büyüklükleri birleştirilmemiş ([Oxford ORA](https://ora.ox.ac.uk/objects/uuid:3104cae1-3a6b-400a-b173-de44384238d2)). Shao & Saito 2022'de anlaşılabilirlik artmış ([UCL pdf](https://discovery.ucl.ac.uk/10143786/1/TESOL%20Quarterly%20-%202022.pdf)). Kanıt orta, büyük vaat yok.
5. **Algı eğitimi (HVPT, çok konuşmacılı minimal çiftler):** 79 çalışma, algıda orta–büyük etki, yeni uyaranlara da genelleşiyor (Uchihara, Karas & Thomson 2025, [SSLA](https://resolve.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6/core-reader)). Algı eğitiminden üretime de aktarım var ([Applied Psycholinguistics 2024](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/E38D8F5CE65DC708137B0E95F97C6BC7/S0142716424000195a.pdf/does-perceptual-high-variability-phonetic-training-improve-l2-speech-production-a-meta-analysis-of-perception-production-connection.pdf)). **Bu, telaffuz için en sağlam kanıtlı ve otomatik puanlanabilen yol** (sistem notu verir, kural 8'e uyar).
6. **ASR ile telaffuz çalışması:** meta-analizde orta etki g = 0,69 (15 çalışma). Ses birimlerinde büyük, prozodide küçük; tek başına çalışırken etki küçük, akranla büyük (Ngo, Chen & Lai 2024, [ReCALL](https://resolve.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D)). Çalışmaların çoğu İngilizce.
7. **Diyalog sistemleri (yapay zekâ partneri):** konuşmaya orta etki g = 0,61. Çalışmaların çoğu kural tabanlı sistem, üretken yapay zekâ değil (Hou & Min 2025, [ReCALL](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/31847710516602398819C5E594038E7B/S0958344025100268a.pdf/dialogue-based-computer-assisted-language-learning-systems-for-second-language-speaking-development-a-three-level-meta-analysis.pdf)).
8. **Görsel ezgi (pitch) gösterimi:** anadili konuşanın ezgi eğrisini öğrencininkinin üstüne bindiren 3 haftalık eğitimde prozodi gelişmiş, ses birimlerine ve yeni cümlelere genelleşmiş (Hardison 2004, [LLT 8(1)](https://www.lltjournal.org/item/312/)). Küçük örneklem.
9. **Duyduğunu tekrar etme (elicited imitation) bir seviye ölçüsüdür:** genel yeterlikle güçlü ilişkili (Yan vd. 2016, [Language Testing](https://journals.sagepub.com/doi/10.1177/0265532215594643); SSLA meta r = .66). ASR ile puanlanan "dinle–tekrarla" zaman içinde ucuz bir **ilerleme göstergesi** olabilir.
10. **Akıcılık için tekrar + zaman baskısı (4/3/2):** aynı konuyu kısalan sürelerle anlatmak akıcılığı artırıyor ve yeni konulara aktarılıyor (de Jong & Perfetti 2011, Language Learning 61(2); özet: [learnlab](https://learnlab.org/research/wiki/index.php/Fostering_fluency_in_second_language_learning)). Sürenin hangi yönde kısaldığı tartışmalı ([Kwansei](https://kwansei.repo.nii.ac.jp/record/30914/files/2.pdf)).

---

## 3. Tarayıcı tekniği: Chrome masaüstü, GitHub Pages, sunucusuz

| Teknoloji | Durum | Not / risk |
|---|---|---|
| **MediaRecorder + getUserMedia** | Çalışıyor, uygulamada zaten var (`spKayitBaslat`, `js/pruefung.js`). Chrome `audio/webm;codecs=opus` kaydeder, yaklaşık 4 KB/sn. | Mikrofon izni https kökeninde bir kez verilir, Chrome hatırlar. Kayıtlar şu an bellekte, sayfa kapanınca gidiyor. Saklamak için IndexedDB (localStorage değil). **Kayıtları repoya koyma**: Pages için repo büyük olasılıkla herkese açık. |
| **Web Speech: SpeechRecognition (de-DE)** | Chrome'da ücretsiz, `lang='de-DE'`, `maxAlternatives`, `interimResults`, `onspeechstart`. | **Varsayılan olarak ses Google sunucusuna gider**, internet ister ([MDN](https://developer.mozilla.org/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)). Chrome 139'dan beri cihazda tanıma var: `SpeechRecognition.available({langs:['de-DE'], processLocally:true})` → `install()` ([MDN install](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/install_static), [Chromium tartışması](https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss/c/Rlyc2uAsFCY)). **de-DE paketinin cihazda olup olmadığından emin değilim**; kodda denetlenmeli, yoksa sunucuya düşülmeli. |
| ASR doğruluğu (yabancı aksan) | Tuna için Web Speech + Almanca ölçümü yok. Genel bulgu: yabancı aksanda hata oranı belirgin yüksek (Hollandaca ASR çalışması: [TU Delft](https://research.tudelft.nl/en/publications/mitigating-bias-against-non-native-accents); wav2vec2'de %30–50 WER, [AAAI](https://ojs.aaai.org/index.php/AAAI/article/view/30381/32445)). | **Dil modeli "düzeltir"**: tam cümlede `dem/den`, `hat/hast` gibi hataları doğruya çevirebilir; `der/die/das` gibi kısa kelimeler sık yanlış tanınır. Bu yüzden ASR yalnız "**doğru kelimeyi söyledi mi / anlaşıldı mı**" için kullanılmalı, gramer ve artikel yargıcı olarak değil. Bağlamsal yönlendirme (`phrases`, Chrome 140, yalnız cihazda: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/phrases), [blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/FAoeEf5hcTg)) hedef kelimeyi kayırır, kontrolü daha da gevşetir: **kullanma**. |
| **speechSynthesis de-DE** | Uygulamada var (`sprich`, `almancaSes`). | `almancaSes()` cihazdaki sesi önceliyor (24.10, gecikme yüzünden). Windows Chrome'da bu büyük olasılıkla eski Microsoft sesini (Hedda / Katja / Stefan) seçiyor; "Google Deutsch" ağ sesi (`localService:false`, [readlang forumu](https://forum.readlang.com/t/read-aloud-not-working-linux-chrome-brave/105)) çoğu zaman daha doğal. Hangisini seçtiği **doğrulanmadı**: Tuna'nın Chrome'unda `speechSynthesis.getVoices()` bakılmalı. **TTS çıktısı kaydedilemez ve Web Audio ile analiz edilemez** ([W3C listesi](https://lists.w3.org/Archives/Public/public-speech-api/2017Jun/0001.html)); ezgi eğrisi karşılaştırması için gerçek ses dosyası gerekir. |
| **Web Audio (AnalyserNode)** | Mikrofonda ses seviyesi, sessizlik algılama (konuşmaya başlama gecikmesi), otokorelasyon / YIN ile ezgi eğrisi: 100–150 satır, kütüphanesiz yapılabilir. | Başka sunucudaki ses dosyasını analiz etmek için CORS ve `crossOrigin="anonymous"` gerekir. upload.wikimedia.org `Access-Control-Allow-Origin: *` veriyor ([SO](https://kaweah.freedombox.rocks/kiwix/stackoverflow.com_en_all_2023-11/questions/73743022/how-to-predict-or-undo-failure-of-createmediaelementsource)); DW akamai için **bilinmiyor** (buradan denetleyemedim, proxy engelledi). |
| **Whisper tarayıcıda** (transformers.js, WebGPU) | Mümkün: tiny / base, yaklaşık 40–200 MB indirme ([offlinetts karşılaştırması](https://offlinetts.com/blog/browser-speech-recognition-whisper-comparison/)). | Kazancı gizlilik ve çevrimdışı çalışma. Telaffuz yargıcı **değil**; dil modeli Web Speech'ten de güçlü "düzeltir". Şimdilik gereksiz. |
| **Piper TTS** (açık kaynak, `de_DE-thorsten`) | Tarayıcıda WASM ([piper-tts-web](https://github.com/Mintplex-Labs/piper-tts-web)) ya da GitHub Actions'ta **önceden ses dosyası üretmek** ([thorsten modeli](https://huggingface.co/Trelis/piper-de-de-thorsten-medium)). | Aynı kökten gelen ses dosyası çevrimdışı çalışır, analiz edilebilir, ABA dinlemeye ve ezgi eğrisine uygun. Kalitesi Google'dan biraz düşük. |
| **Azure Pronunciation Assessment** | Ses birimi / kelime düzeyinde doğruluk, akıcılık, (bazı dillerde) prozodi. 33 dil ([MS Learn](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-learning-overview), [language support](https://learn.microsoft.com/azure/ai-services/speech-service/language-support)). Bedava katman: ayda 5 saat ses ([fiyat](https://azure.microsoft.com/pricing/details/speech/)). | **Almancadan (de-DE) büyük olasılıkla destekli, tabloda doğrulanmalı.** Anahtar tarayıcıda (localStorage) durur, ses Microsoft'a gider, Azure hesabı gerekir. **Tarayıcıdan gerçek Almanca telaffuz puanı almanın tek gerçekçi yolu bu.** |

---

## 4. Ücretsiz ses kaynakları

- **DW:** Top-Thema mp3'leri (akamai) uygulamada çalıyor, ama `quellen/lesetexte_dw.json`'daki **39 metnin yalnız 6'sında `audio` var**. **Langsam gesprochene Nachrichten** 2026'da hâlâ yayında ([pocketcasts bölümleri](https://pocketcasts.com/podcast/langsam-gesprochene-nachrichten-audios-dw-deutsch-lernen/1abbf4d0-25b5-012e-057d-00163e1b201c/30042026-langsam-gesprochene-nachrichten/7b8867e8-eb5d-4adb-8341-616d65576328)): her gün metni olan yavaş haber sesi, B1 dinleme için ideal. Lisans: DW kullanım koşullarını bulamadım. **Dosyayı kopyalama, DW adresinden `<audio>` ile çal**; çalmak için CORS gerekmez.
- **Wikimedia Commons / Lingua Libre / Wiktionary:** kelime telaffuz dosyaları (`De-Haus.ogg` gibi), CC BY-SA (bazı dosyalarda 3.0 / 4.0 etiketleri çelişiyor; dosya başına bakılmalı: [Lingua Libre](https://en.wikipedia.org/wiki/Lingua_Libre), [Wiktionary/Pronunciations/de](https://meta.wikimedia.org/wiki/Wiktionary/Pronunciations/de)). CORS açık. **Aynı kelimeyi farklı kişiler okumuş, bu da HVPT için gerekli çok konuşmacılı ses demek.** Atıf satırı gerekir.
- **Forvo:** uygun **değil**. Varsayılan koşullar ticari olmayan kullanım; önbelleğe alma yasak; ses bağlantıları 2 saatte doluyor; her çalma bir istek sayılıyor; 2019'dan beri lisans belirsiz ([API koşulları](https://api.forvo.com/documentation/general-information)).
- **Kendi ürettiğimiz ses (Piper):** lisans sorunu yok (Thorsten veri seti bildiğim kadarıyla CC0; model kartında kontrol edilmeli).

---

## 5. Repoda şu an ne var? (salt okunur inceleme)

- `js/app.js:1619–1643` `almancaSes()` + `sprich(text, rate)`: tek TTS yolu. `data-sprich` / `data-sprich-yavas` düğmeleri (4681, 4687). `anla` ve `metinde` biçimlerinde ve tanıtımda kelime kendiliğinden okunuyor (`SES_TYP`, 2650, 3970). Isınma için sessiz konuşma (4311).
- **Konuşma bölümü** (`js/app.js:4350–4470`, `sprechenRender`): shadowing (öğrenilmiş öğelerin cümleleri, `spShadowSatz`), Teil 1 / 2 / 3, MediaRecorder kaydı (kalıcı değil), "Söyledim ✓" (öz-bildirim, not yok). Log'da **0 satır**.
- **Ana turdaki tek ses etkinliği: dinle–yaz (diktat)**, günde 1 (`Kern.sec` 3. adım `diktat: !gs.diktat`, `aktSatz('diktat')`, `aktPruef` 2065). Log'da 30 satır.
- **Hata (küçük ama önemli):** diktat `uPruef` ile kontrol ediliyor. Cümle düzeyinde Levenshtein ≤ 1 olan her fark "`fast` + yazım" sayılıyor (`js/app.js:1661`). Log'dan örnekler:
  - `dass wir dem Keller` (doğrusu `den Keller`): hâl hatası
  - `du … bezahlt hat` (doğrusu `hast`): çekim hatası
  - `von allem` (doğrusu `vor allem`): yanlış kelime

  Üçü de "yazım" diye geçmiş. Dinlemede asıl öğrenilecek bunlar. **Düzeltme:** diktatta `G.cumleKontrol(giris, [satz])` kullanılsın, etiketler (`artikel/çekim`, `yanlış kelime` …) oradan gelsin. Büyüklük: küçük (~15 satır).
- Okuma: DW sesi varsa `<audio controls>` (1581), yoksa TTS "Sesli oku".
- Gramer: `dinle` türü (dikte) `js/gramer.js:781`. Prüfung Sprechen `js/pruefung.js:179` (kayıt + partner TTS).
- B1 sprint "Beceri" bloğunda gün gün "konuşma Teil 2" var, ama log 0: o da yapılmıyor.

---

## 6. Öneriler (öncelik sırasıyla)

### Ö1. "Söyle": Pimsleur tarzı sesli hatırlama, ana turda (öncelik 1, orta–büyük)

**Ne:** Mevcut B2 (`yaz0` / `yaz`) ve B4 (`cumle`) sorularının sesli eşi. Türkçe gösterilir; Tuna Almancasını **yüksek sesle** söyler.

**Ekranda:**
1. Türkçe ipucu büyük harfle (B2: "masa", isimse "· artikeliyle"; B4: Türkçe cümle + hedef kelime).
2. Altında mikrofon halkası; soru açılınca **dinleme kendiliğinden başlar**, tuş gerekmez. Ses seviyesi çubuğu canlı.
3. Sessizlik algılanınca ya da 8 sn dolunca durur.
4. **Hemen ardından doğru ses çalar** (Pimsleur'ün "doğruyu duy" adımı), altında "anlaşılan: …" küçük ve soluk.
5. Doğruysa kendiliğinden geçer; yanlışsa Devam + tek itiraz: "aslında doğru söyledim". İtiraz edilirse `öneri:` log'a, seviye atlatmaz (mevcut kural).
6. Kısayollar: Boşluk = tekrar dinle, `0` = Bilmiyorum, `k` = **yazarak cevapla** (mikrofon yoksa ya da ortam uygun değilse).

**Kontrol (sistem notu verir, kural 8):**
- ASR `maxAlternatives = 5`.
- B2'de hedef lemma alternatiflerden birinde varsa doğru (mevcut `pruefenLemma` / `G.yakin` hoşgörüsüyle).
- Artikel ASR'de duyulduysa ve doğruysa artikel hafızasına da yazılır. Duyulmadıysa ya da yanlışsa **artikel cezalandırılmaz** (ASR kısa kelimede güvenilmez), log'a `artikel:duyulmadı`.
- B4'te `G.cumleKontrol` hedef kelimeyle çalışır; yalnız `hedef kelime` / `eksik kelime` / `farklı cümle` falsch sayılır. Dil modelinin düzelttiği çekim farkları zaten görünmez; bu yüzden B4 sesli soru **en çok B3 sayılır** (bm'yi 4'e çıkarmaz).

**Hafıza (FSRS):**
- ASR doğru → normal kalıcı yazım (`not:m3`, biçim `soyle`; konuşmaya başlama gecikmesi > 4 sn ise `yavaş`, m3 kısmi).
- ASR yanlış ya da boş → **hafızaya yazılmaz** (`hafıza:yazılmadı`). Öğe 3 soru sonra **yazılı** biçimde kuyruğa girer (mevcut `kuyruk` mekanizması) ve hafızayı o yazılı cevap belirler. Böylece ASR'nin yanlış reddi Tuna'nın hafızasını bozmaz.

**Akıcılık ölçüsü:** soru açılışından `onspeechstart`'a kadar geçen süre → notiz `gecikme:1.8sn`. "Sonuçlarıma bak"ta haftalık ortanca: Sprechen'deki ağır kelime bulmanın doğrudan göstergesi.

**Dosyalar:**
- Yeni `js/ses.js` (~180 satır): `Ses.dinle({lang, maxAlt, sure})` → Promise `{alts, gecikme, sure}`; `Ses.mikrofonVar()`, `Ses.asrVar()`, cihazda tanıma denetimi (`processLocally`), seviye çubuğu (AnalyserNode), sessizlik algılama. `sprich` buraya taşınabilir ya da app.js'te kalabilir.
- `js/kern.js`: `bicimSec`'te b = 2 ve b = 4 için `o.sesVar` ise olasılıkla `soyle` / `soyleS`; `ZOR_BICIM` dokunulmaz. `sec`'te tur başına kota.
- `js/app.js`: `frage0`'a `soyle` dalı, `frageSoyle(id, lv)` (~120 satır), sonuç paneli; `Kern.eskiTur` eşlemesi (modus `soyle`, id `öğe:wort|abr|prod|satz`).
- Testler: `tests/test_kern.js` (kota, yazılmama kuralı), `tests/sim_akis.js`.

**Neden:** geri çağırma pratiği + üretim etkisi + kipe uygunluk (§2.1–3). Tuna'nın teşhisi "kelime ve fiil hazinem + konuşmam": bu özellik ikisini birden çalıştırıyor.

### Ö2. "Duy": yalnız sesle tanıma + dinle–boşluk + diktat düzeltmesi (öncelik 2, küçük–orta)

- **Duy (B1):** `anla` biçiminin metinsiz hâli: yalnız 🔊 (kendiliğinden çalar, 🐢 yavaş düğmesi), 4 Türkçe şık. `bicimSec` b ≤ 1'de `anla` / `sec` yerine olasılıkla `duy`. Seçmeli olduğu için şık kalitesi işi öbür ajanların önerisine bağlı; burada en azından metni gizlemek "şıktan çözme"yi zorlaştırır. `frageErkennen`'e `{ sesli: true }` (~30 satır).
- **Dinle–boşluk (B3):** `frageCumle` bos / bos0'da cümle önce **yalnız ses** olarak çalınır, metin boşluklu gösterilir, Türkçe çeviri gizli (dinleyerek anlama). `IPUCU` aynı; notiz `ses:1` (~40 satır).
- **Diktat:** günde 1 → **turda en çok 1** (gün sınırı 3). Kontrol `G.cumleKontrol` ile (§5'teki hata).
- **Dosyalar:** `js/app.js` (`frageErkennen`, `frageCumle`, `aktPruef`), `js/kern.js` (`bicimSec`, `sec` 3. adım gün sayacı).

### Ö3. Ses altyapısı ve ayarlar (öncelik 2, küçük)

- Ayarlar → **Ses**:
  - ses seçici (`getVoices()` de-*, örnek cümleyle dinle; seçim `S.einst.sesAdi`, `almancaSes()` önce bunu dener);
  - "mikrofonu dene" (5 sn kayıt + ASR çıktısı);
  - "Sesli sorular: açık / kapalı / yalnız evdeyken" → `S.einst.sesli`;
  - cihazda tanıma varsa "sesim cihazda kalsın" (gizlilik notu: kapalıysa Chrome sesi Google'a gönderir).
- **Neden:** `almancaSes` ağ sesini geri plana atıyor, Windows'ta eski Microsoft sesi seçiliyor olabilir. Sesli soruların kalitesi buna bağlı.

### Ö4. Tur sonu "sesli tekrar" (ABA + anlaşılırlık), turda 1 (öncelik 3, küçük–orta)

- **Ne:** Tur sonu ekranından hemen önce, turda **doğru yazılmış** bir B3 / B4 cümlesi: 🔊 model → Tuna tekrar eder (kayıt + ASR) → kendiliğinden **model – sen – model** art arda çalar.
- **Puan:** ASR'nin anladığı kelime oranı (`anlaşılır:7/8`). Bu, öz-değerlendirme değil sistem puanı; dinle–tekrarla zaten bir seviye ölçüsü (§2.9).
- **Kayıt:** her ayın ilk kaydı IndexedDB'de saklanır → İlerleme'de "1 ay önceki sesin / bugünkü sesin".
- **Log ve hafıza:** hafızaya yazmaz; log `sprechen;nachspr:<öğe>` notiz `anlaşılır:x/y | sn:N`.
- **Cümle seçimi:** her seferinde **yeni cümle**, Glossika tarzı aynı cümle değil.
- **Dosyalar:** `js/app.js` `turSonuRender` öncesi kanca, `js/ses.js`.

### Ö5. Minimal çift dinleme (HVPT), Türk konuşucuya göre (öncelik 3, orta)

- **Ne:** iki seçenekli "hangisini duydun?": *Staat / Stadt*, *Miete / Mitte*, *Ofen / offen*, *Höhle / Hölle*, *Kirche / Kirsche*, *Lehrer / Lehre*, *fühlen / füllen* …
- **Kontrast seçimi:** Türkçede ses birimi olarak uzun / kısa ünlü ayrımı yok, ich / ach / sch ayrımı ve sondaki -er / -e zor. Bu tipik zorluklar bildiğim kadarıyla doğru ama Türkçe–Almanca için ayrı bir çalışmayla doğrulamadım (**emin değilim**).
- **Konuşmacı çeşitliliği:** Commons / Lingua Libre'de aynı kelimeyi okuyan birkaç kişi + farklı TTS sesleri.
- **Yerleşim:** ana turda gün başına 1–2 madde ("ısınma" yerine ilk turda) ya da 10 maddelik 1 dakikalık blok olarak ikinci iş.
- **Puanlama:** sistem puanlar; log `duy;cift:<kontrast>`. Hafızaya yazmaz; kontrast başına doğruluk İlerleme'de.
- **Dosyalar:** `quellen/ciftler.txt` (elle: kelime çiftleri), `tools/commons_ses.py` (Commons API'den dosya adresi + lisans + konuşmacı → `daten/ciftler.js`, build'e eklenir), `js/app.js` ya da yeni `js/duy.js` (~150 satır).
- **Neden:** algı eğitiminin kanıtı en güçlü (§2.5) ve otomatik puanlanabilir. Tuna'nın "Aussprache önemli" isteğine dürüstçe verilebilecek en iyi cevap bu.

### Ö6. Kısa Sprechen Teil 2 ana akışa: 4/3/2 (60/45/30 sn) (öncelik 3, küçük–orta)

- **Ne:** Haftada 2 kez ikinci iş kartı ya da sprint Beceri bloğu. Aynı konu üç kez: 60 sn, 45 sn, 30 sn. Sayaç kendiliğinden başlar, kayıt + ASR.
- **Sistem puanı:** dakikada kelime, en uzun duraklama, kullanılan Redemittel sayısı (ASR metninde `quellen/redemittel.txt` kalıplarını arar). Gramer düzeltmesi yok; Tuna'nın "döküm faydalı değil" sözüne uygun, yalnız sayılar.
- **Log:** `sprechen;teil2:<konu>` notiz `tur:1/3 | sn:60 | kelime:94 | wpm:94 | duraklama:3.1sn | redemittel:3`.
- **Dosya:** `sprechenRender` Teil 2 dalı + `js/ses.js`.

### Ö7. Önceden üretilmiş cümle sesleri (Piper, GitHub Actions) (öncelik 4, orta)

- **Ne:** Ayrı bir iş akışı. Aktif öğelerin cümlelerini (~1.300) `de_DE-thorsten` ile `ses/<özet>.opus` olarak üretir; yaklaşık 9 KB/cümle, toplam ~12 MB.
- **Kazanç:** çevrimdışı; ABA dinlemede ve ezgi eğrisinde gerçek dalga; TTS gecikme sorunu biter (24.10'daki "ses sonraki soruya kayıyor" hatası).
- **Kısıt:** gece işi `tools/`'a dokunmuyor; bu iş Claude oturumunda kurulur.
- **Sonraki adım:** ezgi eğrisi (Hardison 2004) Ö4 ekranına eklenebilir, ~150 satır.

### Ö8. İsteğe bağlı Azure telaffuz puanı (öncelik 4, orta; Tuna isterse)

- **Ne:** Ö4 ekranında "Aussprache-Check" düğmesi: kelime ve ses birimi düzeyinde kırmızı / yeşil.
- **Kotası:** ayda 5 saat ≈ günde 10 dk, fazlasıyla yeter.
- **Bedeli:** Azure hesabı, anahtar `localStorage`'da, ses Microsoft'a gider. de-DE desteği tabloda doğrulanmadan başlanmamalı.
- **Tek kaynak:** tarayıcıda Almanca için ses birimi geri bildiriminin başka gerçekçi kaynağı yok.

### Ö9. DW dinleme kaynağını genişlet (öncelik 4, küçük)

- `tools/dw_topthema.py` 39 metnin 6'sında ses buluyor. Top-Thema podcast RSS'inden mp3 eşlemesi + **Langsam gesprochene Nachrichten** (her gün; metin + ses) eklenebilir.
- Okuma ekranında "önce yalnız dinle → 3 soru → sonra metin" sırası.
- Dosyalar kopyalanmaz, DW adresinden çalınır.

### Ö10. Yapay zekâ konuşma partneri (öncelik 5, büyük; şimdilik yok)

- **Akış:** ASR → LLM → TTS; Sprechen Teil 1 (birlikte plan yapma) / Teil 3 partneri olarak.
- **Bedeli:** sunucusuz PWA'da API anahtarı tarayıcıda ve ücretli; gecikme 2–4 sn.
- **Kanıt:** g = 0,61, ama çoğu eski sistemler üzerinde.
- **Ne zaman:** Ö1–Ö6 log'da işe yararsa düşünülsün.

---

## 7. Konuşma ve dinleme 12 cevaplık tura nasıl karışır?

Tuna ayrı bölüm açmıyor, bu yüzden her şey `Kern.sec` içinde ve **sabit adımlarda** olmalı (gramer sorusunun `GRAM_ADIM` deseni gibi).

**Önerilen tur (12 adım, `o.sesVar` açıkken):**

| Adım | Soru |
|---|---|
| 1–2 | ısınma (mevcut) — biri **Duy (B1)** olabilir |
| 3 | yeni parti / vadeli |
| **4** | **SÖYLE** (B2 kelime, vadeli öğe; `SES_ADIM[0]`) |
| 5 | gramer (mevcut) |
| 6–7 | vadeli; B3'lerin %30'u **dinle–boşluk** |
| 8 | metin etkinliği ya da **diktat** |
| **9** | **SÖYLE** (bm ≥ 3 öğede B4 cümle, yoksa B2; `SES_ADIM[1]`) |
| 10 | gramer (mevcut) |
| 11–12 | vadeli / kuyruk |
| Tur sonu | **sesli tekrar** (Ö4, ~20 sn) |

**Oranlar:** turda sesli üretim 2 (+1 tekrar), sesli girdi 2–3; toplam ≈ %35. Tur süresi yaklaşık +40–60 sn.

**Kurallar:**
- `SES_ADIM = [4, 9]`, pencere +2 (gramerle çakışırsa bir sonraki adıma kayar).
- Sesli kota: turda ≤ 2, günde ≤ 20.
- Yanlış serisi (momentum), akşam turu, `?tur=kisa` (klavyesiz), Zayıflar'da yok.
- `zor` soru sesli olmaz.
- Mikrofon izni yoksa ya da `S.einst.sesli === false` ise o adım normal yazılı soru olur. Sistem kendiliğinden ayarlar, Tuna ayar yapmak zorunda kalmaz.
- İlk gün tek seferlik kart: "Bugünden itibaren turda 2 soruyu sesli soracağım. Mikrofon izni ver / şimdi değil."
- Hafıza: yalnız ASR doğruysa yazılır; yanlışta yazılı ikinci şans hafızayı belirler (Ö1). Günde tek kalıcı yazım kuralı aynen geçerli.
- Log: modus `soyle` / `duy`, notiz başı yine `basamak:B2 | bicim:soyle | not:m3,a- | R:… | S:…`, ardından `asr:<ilk alternatif> | alt:N | gecikme:1.8sn | cihazda:1`. "Sonuçlarıma bak"ta `soyle` falsch satırları düzeltme listesine girer (ASR metni + doğrusu). CLAUDE.md log bölümüne eklenmeli.
- **Ölçüm planı:** 2 hafta sonra log'dan şunlara bakılır: sesli doğruluk ve yazılı doğruluk (aynı öğede), gecikme ortancası, ASR boş dönme oranı, itiraz oranı. İtiraz %20'yi geçerse ASR gevşetilir ya da sesli soru hafızaya hiç yazmaz.

---

## 8. Abartmamak için: gerçekçi olmayanlar

- "Telaffuzun %87" gibi ücretsiz ve güvenilir bir puan **tarayıcıda yok** (Azure hariç). Web Speech ASR "anlaşıldı / anlaşılmadı" der, o kadar. Dil modeli hataları örter.
- ASR'nin yanlış reddi Tuna'yı sinirlendirebilir (Duolingo ve Babbel kullanıcılarının şikâyeti). Bu yüzden ASR yanlışı hafızayı cezalandırmamalı.
- Sabah 05:30'da yüksek sesle konuşmak her ortamda mümkün değil: "sessiz mod" şart.
- Glossika tarzı tekrar ve Pimsleur'ün aralık takvimi için bağımsız kanıt yok; yararlı olanlar anticipation ve hacim.
- Önceden üretilen TTS sesi ve Google sesi anadili konuşan bir insan kaydı değil; uzun ünlüler ve vurgu genelde doğru, ezgi biraz düz.

---

## 9. Tuna'nın kendi yapacakları (uygulama dışı)

- **Her gün 5 dk:** DW *Langsam gesprochene Nachrichten*'i önce metinsiz dinle, sonra metinle dinle ve **bir paragrafı yüksek sesle shadowing** yap.
- **Haftada 2 kez:** Teil 2 konusunu telefonla kaydet (60 / 45 / 30 sn), ilk ve son kaydı dinle.
- **Kursta:** öğretmenden Sprechen değerlendirmesini ölçüt ölçüt iste (Erfüllung, Kohärenz, Wortschatz, Strukturen, Aussprache; B1 Übungssatz'taki Bewertungskriterien: [goethe.de](https://www.goethe.de/pro/relaunch/prf/materialien/B1/B1_Uebungssatz_Erwachsene.pdf); puan dağılımını doğrulamadım).
- **Bremen'de:** haftada 1 Sprachcafé ya da Tandem. Uni Bremen Sprachenzentrum'un tandem programı olup olmadığını sor (**emin değilim**). Gerçek konuşma partneri hiçbir uygulamayla değiştirilemez.
- Kursta konuşurken bilmediği kelimeyi not edip uygulamada "öğrenmeye ekle" (yarım öğe) yapması, konuşmadan kelime hazinesine en kısa yol.
