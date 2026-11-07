# Dinleme (Hören) B1 → B2: araştırma + uygulama önerileri (dinleme ajanı, 6.11.2026)

Not: web sayfalarının çoğu bu oturumda doğrudan açılamadı (goethe.de, hueber.de ağ izni yok); bulgular arama özetlerinden, makale künyeleri doğrulandı. Sayıları kendim doğrulayamadıklarımı "emin değilim" diye işaretledim.

## 0. Tuna'nın durumu (log'dan, 6.11)

- Kur sınavında Hören "iyi". Yani dinleme şu an en zayıf beceri değil. Tuna dinlemeyi önemli buluyor. Dinlemeye yapılan yatırım kelimeyi ve konuşmayı da beslerse (sesten kelime, shadowing) iki işi birden görür.
- Uygulamada dinleme neredeyse yok. 3.774 log satırının içinde:
  - 15 dikte (`akt;diktat`, günde en çok 1, TTS),
  - 7 gramer `tür:dinle`,
  - 2 ünite diktesi,
  - **DW sesiyle tek 1 okuma** (`lesen;dw79669480`, 31.10),
  - 0 `sprechen` (shadowing hiç yapılmamış).
- Kelime soruları sesi gösterir ama kelime hep yazılı da durur. `anla` / `metinde` sorusunda TTS okur, Almancası da ekranda (`app.js` ~2650, `fxCevap` ~3970). Sesten tanıma diye bir soru biçimi yok.
- **Dikte hataları bottom-up çözümleme sorunu gösteriyor.** Doğru → Tuna:
  - *eben → ihm*
  - *vor allem → von allem*
  - *hast → hat*
  - *den Keller → dem Keller*
  - *hohe → hoche*
  - *Im nächsten Semester → In nächstem Semestar*
  - gramer diktesinde *kleinen*, *zu*, *ist* düşmüş; *musst → muss*

  Hepsi vurgusuz işlev kelimesi, çekim eki ya da kişi eki. Bu, dinleme literatüründeki klasik tablo: öğrenci içerik kelimelerini duyar, vurgusuz kısa öğeleri kaçırır (Field 2008). Almancada bu öğeler gramerin kendisi (hâl, kişi ekleri). Dolayısıyla "gramerde sıkıntım yok" yazıda doğru olabilir, kulakta değil.
- DW verisi: `quellen/lesetexte_dw.json` içindeki 39 metinden **yalnız 6'sında `audio` var**. Sebep: `tools/dw_topthema.py` kayıtlı kimliği atlıyor (`if lid in alt: continue`), `audio` alanı sonradan eklendiği için eski 33 kayıt sessiz kalmış.

## 1. Araştırma: neyin kanıtı var

### Güçlü kanıt

1. **Dinlemeyi en çok kelime bilgisi açıklıyor, özellikle kelimenin SESTEN ve HIZLI tanınması.**
   - Vafaee & Suzuki (2020, *SSLA* 42(2)): kelime bilgisi sözdizimine göre yaklaşık iki kat güçlü yordayıcı (β .55 / .28). Üstbilişsel bilgi, çalışma belleği ve kaygı daha küçük. [Cambridge](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/relative-significance-of-syntactic-knowledge-and-vocabulary-knowledge-in-second-language-listening-ability/FF75AE3040EB0D4CE2EA71BE155465BA)
   - Wang & Treffers-Daller (2017, *System* 65): en güçlü yordayıcı kelime büyüklüğü, üstbiliş daha az önemli. [CORE](https://core.ac.uk/download/74252656.pdf)
   - Saito, Uchihara, Takizawa & Suzukida (2023, *SSLA*), 126 öğrenci:
     - kelime değişkenleri modeldeki açıklanan varyansın %77,6'sı;
     - bunun içinde **otomatikleşme** (sesten hızlı erişim) %55,3, fonolojik biçim %20,8;
     - algı, bellek ve üstbiliş küçük katkı.
     - Bir düzeltme notu (corrigendum) var (Mayıs 2026). Ne düzelttiğini göremedim.

     [UCL](https://discovery.ucl.ac.uk/id/eprint/10179170/)
   - Yazılı kelime testi dinlemeyi daha zayıf yordar, sesli kelime testi daha güçlü (Milton & Hopkins 2006; Matthews & Cheng 2015). Yüksek seviyede fark azalıyor. [PolyU özet](https://ira.lib.polyu.edu.hk/bitstream/10397/107978/1/Han_Aural_Vocabulary_Knowledge.pdf)
   - **Sonuç:** Uygulama kelimeyi yalnız yazıyla öğretirse kulağa geçmez. Kelime turuna "sesten tanıma" eklemek dinleme için en kanıtlı ve en ucuz adım.

2. **Kapsama eşiği.** Rahat dinleme için kelimelerin yaklaşık %95'ini, çok iyi anlama için %98'ini bilmek gerekir. %95 kapsama yaklaşık 2–3 bin kelime ailesi demek (van Zeeland & Schmitt 2013, *Applied Linguistics* 34(4)). Yazarlar bunun "en iyi durum" olduğunu söylüyor (kısa, gayriresmî anlatı, tekrar dinleme). [Leeds](https://eprints.whiterose.ac.uk/135476/7/Dang%20%20%20Webb%20fourth%20submission.pdf)
   - Pratik karşılığı: kapsamlı dinleme için seçilen malzemede bilinmeyen kelime 20'de 1'den az olmalı. Daha zorsa yoğun dinleme malzemesidir, kapsamlı değil.

3. **Strateji öğretimi orta düzeyde işe yarıyor.**
   - Dalman & Plonsky (2025, *Language Teaching Research* 29(3)) meta-analizi: 45 çalışma, d = 0.69. [todoele](https://todoele.net/bibliografia/effectiveness-second-language-listening-strategy-instruction-meta-analysis)
   - Vandergrift & Tafaghodtari (2010, *Language Learning* 60(2)), 106 öğrenci: üstbilişsel sıra kontrol grubunu geçti, en çok zayıf dinleyiciler kazandı.
   - Eleştiri: bu yöntemde bottom-up çalışma yok. Onunla birleştirilirse daha geniş etki beklenir. [IJAL](https://ejournal.upi.edu/index.php/IJAL/article/download/20246/10292)
   - Vandergrift & Goh (2012, *Teaching and Learning Second Language Listening*) pedagojik sırası:
     1. tahmin / planlama,
     2. 1. dinleme → doğrulama,
     3. 2. dinleme → doğrulama,
     4. 3. dinleme (metinle),
     5. yansıtma ve hedef.

     [Routledge](https://routledge.com/Teaching-and-Learning-Second-Language-Listening-Metacognition-in-Action/Goh-Vandergrift/p/book/9780367254254)

4. **Altyazı / transkript desteği.** Montero Perez, Van den Noortgate & Desmet (2013, *System* 41) meta-analizi: aynı dilde altyazının dinlemeye ve kelime öğrenmeye **büyük** etkisi var (15 + 10 çalışma). Seviye etkiyi değiştirmiyor. [CORE](https://core.ac.uk/download/84321351.pdf)
   - Okurken dinleme (RWL):
     - Webb, Uchihara & Yanagisawa (2023, *Language Teaching*) meta-analizi: okuma, dinleme ve RWL kazançları benzer (anında yaklaşık %13–17).
     - Başka çalışmalar: yalnız dinlemeden kelime kazancı daha düşük, RWL okumaya eşit ya da üstün (Teng 2018; Vidal 2011: dinleme < okuma).

     [Cambridge](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0261444822000507)
   - **Sonuç:** Yeni kelime için "metinli dinle"; dinleme becerisi için "önce metinsiz, sonra metinli".

5. **TTS yeterli.** Bione & Cardoso (2020, *LLT* 24(1)): metin anlama, dikte ve sesten tanımada TTS ile insan sesi arasında fark çıkmadı. Bu, uygulamanın TTS dikte ve sesten tanıma sorularına meşruiyet veriyor. Doğal bağlantılı konuşma (kaynaşma, düşen e) için gerçek ses ayrıca gerekli. [LLT](https://www.lltjournal.org/item-detail/944/)

### Orta / sınırlı kanıt

6. **Kapsamlı dinleme (extensive listening).** Chang & Millett (2014, *ELT Journal* 68(1), 13 hafta): sesli kademeli okuma kitaplarıyla dinleme akıcılığı arttı, daha hızlı konuşmayı anladılar. Chang, Millett & Renandya (2019, *RELC*) da destekli kapsamlı dinlemenin işe yaradığını gösteriyor. Ama alan küçük. Ivone & Renandya (2019, *TEFLIN*) derlemesi "sert kanıt az" diyor. [TEFLIN](https://libmast.utm.my/Record/doaj.art-1bce510b3f314f57a1101445f74c318d)
   - En iyi destek biçimi: **önce okuyarak dinle, sonra aynı metni yalnız dinle** (tekrar).

7. **Bottom-up eğitim / dikte.**
   - Siegel & Siegel: bottom-up etkinlikler (dikte dahil) yarı deneysel çalışmada yarar sağladı.
   - Farrell (2015, doktora tezi): kelime yakalama (word-spotting), dikte ve bağlantılı konuşma eğitimi birbirine eşit etkili.
   - Matthews, Cheng & O'Toole (2015, *ReCALL* 27(3)): web tabanlı "dinle → yeniden kur (yaz) → geri bildirim" aracı kontrol grubuna göre sesten kelime tanımayı geliştirdi. En çok **orta miktarda** dinleyenler kazandı. Uygulamanın dikte yapısına en yakın kanıt bu. [Cambridge](https://www.cambridge.org/core/journals/recall/article/computermediated-input-output-and-feedback-in-the-development-of-l2-word-recognition-from-speech/14E6C32F8214CD3DC8A836749FE5230C)
   - Field (2008, *Listening in the Language Classroom*): dikte, bağlantılı konuşmanın hangi özelliğinin sorun çıkardığını görünür kılar. Öğrenciler işlev kelimelerini atlar.

8. **Shadowing.** Hamada (2016, *Language Teaching Research* 20), yaklaşık 43–44 üniversite öğrencisi, 4 hafta: ses algısı ve dinleme gelişti, en çok alt seviye kazandı. Örneklem küçük. Tuna için ek değeri: konuşma (Sprechen) zayıf, shadowing iki beceriye birden dokunuyor. [TESL Ontario PDF](https://contact.teslontario.org/wp-content/uploads/2018/08/Hamada-Shadowing.pdf)

9. **Yavaşlatma çelişkili.** Zhao (1997, *Applied Linguistics* 18(1), n = 15): hızı öğrencinin kendisinin ayarlaması anlamayı artırdı. Blau (1990): orta ve ileri seviyede yalnız yavaşlatmak yetmedi. Duraklama eklemek yavaşlatmaktan daha iyi görünüyor.
   - Pratik karşılığı: yavaş hız yalnız iskele olsun. Son dinleme normal hızda yapılmalı. Cümle sonunda duraklama, genel yavaşlatmadan iyi.

### Kanıtı zayıf ya da yok

- Arka planda yarım kulakla dinleme ("radyo açık kalsın"): dikkat yoksa öğrenme kanıtı yok.
- Seviyenin çok üstündeki malzeme (kapsama < %90): anlam çıkmaz, kelime de öğrenilmez.
- Yalnız test soruları çözmek ("comprehension approach"): Field'a göre bu dinlemeyi ölçer, öğretmez. Sınav formatı yalnız alışkanlık için.

### Almancaya özgü çözümleme noktaları

Yaygın dil bilgisi, kaynak taramadım:

- Vurgusuz ekler (-en / -em / -er / -es) ve kısa işlev kelimeleri (den/dem, vor/von, zu, ist, es) azalır.
- Konuşmada düşen e: *haben → ham*, *gehen → gehn*.
- Kaynaşma: *ist es → isses*, *haben wir → hamwa*, *einen → 'n*, *nicht → nich*.
- Ayrılabilen fiilin öneki cümle sonunda gelir (*… zusammen auf|räumen*): dinlerken fiil sonda tamamlanır, beklemeyi öğrenmek gerekir.

Tuna'nın dikte hataları tam bu noktalarda.

### Goethe sınav biçimleri

**B1 Hören:** yaklaşık 40 dk, 4 Teil, 30 madde. Kaynak: kurs ve alıştırma materyalleri, resmî PDF açılamadı.

| Teil | Metin | Madde | Kaç kez dinlenir |
|---|---|---|---|
| 1 | 5 kısa metin (anons, telesekreter, radyo) | her metne 2 madde: richtig/falsch + a/b/c | 2 kez |
| 2 | Vortrag / Führung | 5 madde, a/b/c | 1 kez |
| 3 | gayriresmî konuşma | 7 madde, richtig/falsch | 1 kez |
| 4 | radyo tartışması (moderatör + 2 konuk) | 8 ifade, "kim söyledi" eşleştirme | 2 kez |

[Klett PDF](https://www.klett.gr/media/wysiwyg/dls/SGnbzZD_TBMP3_LHB_web.pdf), [deutsch-pruefung.de](https://deutsch-pruefung.de/goethe/b1/hoeren)

**B2 Hören:** yaklaşık 40 dk, 4 Teil, 30 madde. Metinler: gündelik konuşma / mesajlar, radyo röportajı, radyo konuşması, Vortrag (Hueber "Prüfung Express"). Teil başına madde sayısı ve kaç kez dinlendiği: **emin değilim.** Teil 4'te 8 seçmeli madde olduğu tek kaynakta geçiyor. [goethe.de B2](https://www.goethe.de/ins/ph/de/m/spr/prf/gzb2/wi9.html)

Sınav stratejisi:
- Dinlemeden önce soruları oku ve anahtar kelimeyi işaretle.
- Teil 4'te üç sesi ve adları ayırt et.
- Yalnız bir kez çalan Teil 2 ve 3'te takılınca bırak, sonraki maddeye geç.

## 2. Kaynaklar (Tuna'nın seviyesine göre, B1.2)

| Kaynak | Seviye | Ne işe yarar |
|---|---|---|
| DW **Top-Thema mit Vokabeln** | B1 (DW) | Haftada yaklaşık 2 metin, yavaş okunur, tam metin + sözlük. Uygulamada zaten var. Yoğun dinleme için ideal. |
| DW **Nicos Weg** B1 | A1–B1 | Video + altyazı, gündelik dil, diyaloglar. Teil 1 / 3 türü konuşmalar için iyi. |
| Deutschlandfunk **nachrichtenleicht** | "einfache Sprache" (resmî GER seviyesi yok; B1 civarı sanırım) | Haftalık 5 dk özet + kısa haberler, metinli. Kapsamlı dinleme. |
| **Slow German** (Annik Rubens) | A2–B2 | Tek konu, yavaş, transkriptli. Yürürken. Aynı adlı başka podcast var (Sloeful German, B1/B2); karıştırma. |
| **Easy German** (YouTube sokak röportajları + podcast) | B1+/B2 | Gerçek, hızlı, kaynaşmış konuşma. YouTube'da Almanca altyazı. Podcast B2'ye yakın. |
| DW **Langsam gesprochene Nachrichten** | B2/C1 (DW etiketi) | Günlük haber, yavaş okunur, metinli. Birkaç hafta sonra hedef. |
| ZDF **logo!** | çocuk haberi, net konuşma (seviye etiketi yok) | Kısa video haber. |
| **Netzwerk neu B1** kitap sesleri | kurs | Klett Augmented uygulamasından (sanırım). Kurs konusuyla aynı kelimeler. |
| **Goethe B1 Modellsatz / Übungssatz** Hören sesi | B1 sınav | goethe.de'de ücretsiz. Haftada bir Teil, sınav provası. |

## 3. Uygulamaya eklenebilecek dinleme etkinlikleri

Öncelik: kanıt × Tuna'nın verisi × teknik kolaylık. Hepsi `js/app.js` / `js/kern.js` kodu; gece işi bunlara dokunmaz.

### Ö1. Sesten kelime tanıma (`hor` biçimi) · küçük–orta · **öncelik 1**

- **Ne:** Kelime TTS ile okunur, yazılı hâli gizlidir.
  - `DENKZEIT` (1,2 sn) sonra Türkçe şıklar açılır.
  - "🔊 tekrar" düğmesi var.
  - "yazıyı göster" ipucu sayılır (`ipucu:1`).
  - Sonuç panelinde kelime artikelli yazılır.
- **Neden:** Saito vd. 2023 (sesten otomatik erişim dinleme varyansının yarısından fazlası), Matthews & Cheng 2015, Milton & Hopkins 2006. Şu an sesten tanıma sorusu hiç yok. Ayrıca seçmelinin kolaylığını biraz kırar: kelimenin yazısına bakıp eleme yapılamaz. Asıl çeldirici düzeltmesi başka ajanın işi.
- **Nerede:**
  - `kern.js` `bicimSec`: b ≤ 1 aday listesine `'hor'` (örneğin %30). Ses kapalıysa (`S.einst.ses === false` ya da yeni `S.einst.dinleSoru === false`) çıkar.
  - `SECMELI` ve `OFS`'e `hor: 0.5` (`anla` gibi).
  - `eskiTur` → `erk` / `bed`.
  - `app.js` `frage0`: `b === 'hor'` → `frageErkennen` kopyası. `erkPrompt` yerine 🔊 düğmesi, `sesCaldi` ile otomatik çalma (~2650'deki koşula `hor` ekle).
  - Log `bicim:hor`.
  - Klavyesiz turda da olur, çünkü seçmeli.
- **Ek:** Cevap süresi (`sek:`) zaten var. `hor`'da "hızlı ve doğru" otomatikleşmenin göstergesi. Akşam tekrarında ve İlerleme'de "sesten tanıma hızı" gösterilebilir.

### Ö2. Cümlede sesten boşluk (Hör-Lücke, `hbos`) · küçük · öncelik 2

- **Ne:** Öğrendiği kelimenin cümlesi TTS ile **tam** okunur. Ekranda cümle var, hedef kelime boşluk. Duyduğunu, çekimli hâliyle yazar.
- **Neden:** Kısmi dikte. Matthews vd. 2015'teki "dinle → yaz" döngüsünün tek kelimelik ve hızlı sürümü. Çekim eki kulaktan yakalanır (den/dem hatası). Bugünkü `bos0` / `bos`'taki 🔊 düğmesi boşluğu "…" diye okuyor (~1754), yani çekim duyulmuyor.
- **Nerede:**
  - `frageCumle` varyantı. Okuma metni `it.bsp` / `SAETZE` cümlesi.
  - Kontrol `G.bosPruef`.
  - Hafızaya ya yazmaz (dikte gibi) ya da `bos0` ofsetiyle yazar. Başta yazmaması daha güvenli.
  - Turda en çok 1 (Ö5).

### Ö3. Dikteyi güçlendir · küçük · öncelik 2

Bugün günde 1 cümle dikte var, hata türü kaydedilmiyor.

1. **Hata türü etiketi:** kelime kelime karşılaştırma zaten var (`aktPruef`, `uPruef`, `G.cumleKontrol`'ün `eksik` / `yanlis` farkı). Log'a şu etiketleri yaz:
   - `dikte:ek` (aynı kök, farklı ek: dem/den, hat/hast),
   - `dikte:işlev` (eksik / yanlış kısa kelime: zu, ist, vor/von),
   - `dikte:kelime` (içerik kelimesi).

   "Sonuçlarıma bak" bunları sayar.
2. **Sonuçta farkı ses + renkle göster:** yanlış kelimeye dokununca yalnız o kelime okunsun.
3. **Dikteden hemen sonra shadowing:** "aynı cümleyi 2 kez yüksek sesle söyle" (tek dokunuş, log `sprechen;shadow:<id>`). Hamada 2016. Konuşma bölümü hiç açılmıyor, bu yüzden turun içine taşımak daha iyi.
4. Bonus turda dikte günde 2'ye çıkarılabilir (`gs4.diktat`).

### Ö4. DW dinleme modu (gerçek ses, üstbilişsel sıra) · orta · **öncelik 1**

Önkoşul (küçük): `tools/dw_topthema.py` sessiz kayıtları yeniden çeksin. `if lid in alt and alt[lid].get('audio'): continue` olsun. RSS'ten düşmüş eski kayıtlar için saklı `url`'den sayfa çekilip `mp3` aranır. 39 metinden yalnız 6'sında ses var.

Okuma ekranında (`lesenRender`, ~1570) ses varsa "🎧 Dinleme modu" düğmesi:

1. **Tahmin:** başlık + DW sözlüğünden 3 kelime gösterilir. "Ne duyacağını tahmin et" (yazmak isteğe bağlı, not yok).
2. **1. dinleme metinsiz:** `<audio>` + hız düğmeleri (0,8 / 0,9 / 1,0: `audio.playbackRate`) + "⟲ 5 sn" (`audio.currentTime -= 5`).
3. **2. dinleme + Hör-Lückentext:** metin 8–12 boşlukla görünür. Boşluklar: öğrendiği kelimeler (`aktLuecke` mantığı, bütün metne) + 2–3 işlev kelimesi / çekim eki. Dinlerken doldurur, sistem notlar (`uPruef`). Sorular otomatik, Claude yazmıyor; bu yüzden "okuma metnini ve sorularını Claude yazmaz" kuralına uyuyor.
4. **3. dinleme metinle (RWL):** bilmediği kelimeye dokunur. `lesen-wort` zaten var.
5. **Yansıtma:** "Ne zorladı: hız / bilinmeyen kelime / ekler" tek dokunuş. Log notiz `zor:hız`. Bu öz-not değil, yalnız teşhis.

Log önerisi: modus `hoeren`, id `dw<id>`, notiz `puan:x/y | hız:0.9 | dinleme:3 | dk:9`. Bugün tek bir okuma, oysa sesli metin varken bu daha değerli. Sprint "Beceri" bloğundaki `lesen` kartı (~4121) doğrudan dinleme modunu açsın.

### Ö5. Tura dinleme sorusu karıştırma · küçük · öncelik 2

Ö1 ve Ö2 normal biçim seçimine girerse ayrı yuva gerekmez. Yine de garanti istenirse `GRAM_ADIM` gibi bir `HOR_ADIM` (örneğin adım 7) eklenir: turda en az 1 sesli soru.

Kurallar:
- Ayarlar'da "Dinleme soruları: açık / kapalı (kulaklık yok)" (`S.einst.dinleSoru`). Kütüphanede ya da derste kapanabilmeli.
- Ses yoksa `anla`'ya düşer.

### Ö6. Cümle cümle dinleme · TTS hâli küçük, gerçek ses hâli orta–büyük · öncelik 3

- **(a) TTS, her metinde:** DW, Klexikon, ünite, paket. Metin cümlelere bölünür (`aktSaetze` zaten bölüyor). Oynatıcı düğmeleri: "▶ cümle", "↻ tekrar", "🐢", "göster", "dikte et". Ünite / paket metinlerinde ses olmadığı için en kolay yol bu.
- **(b) DW gerçek sesinde cümle zamanları:** gece işinde `ffmpeg silencedetect` ile sessizlikler bulunup cümle sayısına eşlenir, `zeiten: [...]` alanı yazılır. Uygulama `currentTime` ile o aralığı çalar.
  - Tarayıcıda (Web Audio) yapmak için mp3'ün CORS izni gerekir. akamaihd sunucusunun buna izin verip vermediğini **doğrulayamadım** (ağ engelli).
  - Eşleme hatalı olabilir, önce birkaç metinde elle denetlenmeli.
  - Kazancı: gerçek sesle dikte.

### Ö7. Paket metni dinleme + richtig/falsch (Goethe Teil 3 benzeri) · küçük · öncelik 3

- **Ne:** `quellen/lesen.txt`'te 15 paketin 4'er R/F ifadesi zaten var. Paket metni TTS ile okunur, metin **gösterilmez**, **bir kez** dinlenir (Teil 3 gibi). Sonra 4 R/F, sistem notlar.
- **Sınır:** Tuna bu paketleri okuduysa bellek etkisi var. Yeni paketlerde (CLAUDE.md §6) önce dinleme sırası konabilir.

### Ö8. Hız ayarı ve ses seçimi · küçük · öncelik 2

- `sprich` hızı sabit (0,9; yavaş 0,65–0,75). Ayar `S.einst.sesHiz` (0,8 / 0,9 / 1,0 / 1,1) eklenmeli. Dikte / `hor` doğruluğu yüksekse hız kendiliğinden 0,05 artabilir.
- Yavaş yalnız iskele: Zhao 1997'ye göre öğrenci kontrolü yararlı, Blau 1990'a göre yalnız yavaşlatmak yetmez.
- Uzun metin dinlemede (Ö4, Ö6a) gecikme sorun değil. Orada çevrimiçi doğal ses (Google Deutsch / "Natural") seçilebilir. Turdaki kısa sorularda yerel ses kalsın (24.10 gecikme hatası).

### Ö9. Goethe B1 Hören provası · orta · öncelik 3

- **Ne:** Lesen'deki `goethe_lesen.json` gibi Übungssatz / Modellsatz Hören soruları ayrıştırılır. Ses goethe.de'deki resmî adresten akış olarak çalınır (DW'deki gibi, dosya kopyalanmaz). Teil 1–4 formatı, kaç kez dinlenir kuralı, süre.
- **Belirsiz:** ses adresleri ve kullanım izni. Lesen metinleri uygulamada olduğu için emsal var. Set sayısı az (2–3), sık değil, sınav provası olarak.
- `js/pruefung.js` Hören kartı bugün yalnız yönlendiriyor (~68, ~235).

### Ö10. Dış dinlemeyi kaydetme · küçük · öncelik 2

- **Ne:** Diğer bölümünde "🎧 Dinledim" düğmesi: kaynak (DW / Easy German / nachrichtenleicht / kurs / diğer), dakika, anlama hissi (az / yarı / çoğu). Log `hoeren;dis:<kaynak>` notiz `dk:20 | anlama:çoğu`.
- **Neden:** Kapsamlı dinleme uygulama dışında olacak. Claude "sonuçlarıma bak"ta haftalık dakikayı ve seviyenin uygun olup olmadığını görebilir. Puan ve seri sayılabilir (`xpEkle`).

### Teknik kolaylık sırası

1. Ö8 hız ayarı
2. Ö1 `hor`
3. Ö3 dikte etiketleri + shadowing
4. Ö2 `hbos`
5. Ö10 dış dinleme kaydı
6. DW ses doldurma (`dw_topthema.py`)
7. Ö7 paket dinleme
8. Ö5 tur yuvası
9. Ö4 DW dinleme modu
10. Ö6a TTS cümle oynatıcı
11. Ö9 Goethe Hören
12. Ö6b gerçek ses zamanlama

## 4. Tuna'nın kendi yapacakları (uygulama dışı)

**Günlük (20–30 dk, iki parça):**

1. **Yoğun dinleme (10–15 dk, sabah, masada).** Bir DW Top-Thema (ya da Nicos Weg B1 bölümü):
   1. başlığa bakıp 3 kelime tahmin et;
   2. metinsiz dinle, ana fikri Türkçe tek cümleyle söyle;
   3. tekrar dinle, anahtar kelime not al;
   4. metinle birlikte dinle, bilmediğin kelimeleri işaretle (uygulamada "öğrenmeye ekle");
   5. 3–4 cümleyi shadowing yap (dinle, hemen üstüne söyle; 3 kez);
   6. bir paragrafı dikte et ve metinle karşılaştır.

   Ekleri ve kısa kelimeleri (den/dem, zu, ist) özellikle kontrol et; senin hataların bunlar.
2. **Kapsamlı dinleme (15–30 dk, tramvayda / yürürken).** Neredeyse hepsini anladığın malzeme: nachrichtenleicht, Slow German, eski Top-Thema'lar.
   - Aynı bölümü 2 kez dinle: önce metinle (evde), sonra metinsiz (yolda).
   - Ana fikri yakalayamıyorsan malzeme zor, bir alt seviyeye in.
   - Yalnız arka planda açık bırakmak sayılmaz.

**Haftada 2–3 kez (20 dk):** Almanca altyazılı video: Easy German sokak röportajları, Nicos Weg. Önce altyazılı, sonra aynı videoyu altyazısız. Altyazının kanıtı güçlü; gerçek, hızlı konuşmaya alıştırır.

**Haftada 1 kez:** Goethe B1 Hören'den tek Teil (goethe.de Modellsatz / Übungssatz). Önce soruları oku, anahtar kelimeyi çiz. Teil 2 ve 3 bir kez çalar, takılınca bırak. Teil 4'te konuşanların adlarını not et.

**Kurs:** Netzwerk neu B1 kitap seslerini derse girmeden bir kez dinle (Klett uygulaması, sanırım Klett Augmented). Derste aynı kelimeler gelince tanırsın.

**3–4 hafta sonra hedef:** Top-Thema'yı 1,0 hızda metinsiz anlıyorsan DW Langsam gesprochene Nachrichten'e ve Easy German podcast'ine geç (B2).

**Ölçü:** haftada en az 2 saat dinleme. Dakikayı uygulamaya yaz (Ö10) ki Claude görsün.
