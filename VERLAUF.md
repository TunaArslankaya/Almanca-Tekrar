# Verlauf

Claude'un tuttuğu çalışma günlüğü. Her "sonuçlarıma bak" sonrası tarihli bir not eklenir.
Son incelenen log satırı en alttaki notta yazar.

## 2026-09-27 — sistem kuruldu

- Yeni sistem (bu repo) kuruldu: FSRS-6 zamanlayıcı, üretilen cümleler, Goethe B1 listesi.
- Veri: 671 fiil anlamı (197'si cümle kalıplı), 1481 artikelli isim.
- Önceki sistemden bilinen tekrarlayan hatalar (27.09.2026 durumu), yeni sistem bunları hedefliyor:
  dönüşlü zamiri unutmak · kelime sırası (nicht, nur, überhaupt) · sıfat sonları · Türkçe geçmiş zamanı
  Perfekt yapmamak · "senin" için sein- (doğrusu dein-) · fragen / bitten + Akk · wo? → Dativ ·
  ä yazmamak · wo(r)- soruları · glauben an ↔ denken an, reagieren auf karışıyor.
- Son incelenen log satırı: yok (log henüz boş).

## 2026-09-30 — n-Deklination, dönüşlü fiiller, mantık denetimi

- Yeni odak modları: n-Deklination (50 isim + 20 tuzak), Dönüşlü fiiller (77 fiil; Präsens / Perfekt / emir kipi).
- Düzeltilen hatalar: dönüşlü fiillerde Perfekt sein (sich umziehen → hat), ausziehen (evden) → ist, liegen/sitzen/stehen ist de kabul,
  Genitiv (des Arztes, des Sees), sich einigen tekil özne, eksik n-Deklination işaretleri (Geldautomat, Vorname, Familienname).
- Yapı: anlamdaşlar yanlış sayılmıyor, tanıtımda yazdırma, tekrar eden / bölgesel kelimeler çıkarıldı, ek isimlerde tanıtım çökmesi.
- Son incelenen log satırı: yok (log henüz boş).

## 2026-10-01 — verimlilik turu: Hızlı tur, paketler, kancalar, baştan savmaya karşı

- Yeni bölümler: **Hızlı tur** (seçmeli anlam + der/die/das, yeni kelimede ön test: bilinen kelime yük olmadan geçer),
  **Paketler** (12 sahne × 10 kelime + B1 metni + boşluk). Günlük plan şeridi: Hızlı tur → Paket → Karışık.
- Yeni veri: `quellen/woerter.txt` (592 sıfat / zarf / bağlaç …), `quellen/pakete.txt` (p01–p12), `daten/kancalar.js` (boş),
  isimlerde artikel ek kuralı (533 isim; -ung → die %100, -e → die %87 …).
- Karışık / Fiiller artık yalnız yazarak; seçmeli ve artikel soruları Hızlı tur'da. Hızlı tur'da öğrenilen ismin yazma kartı,
  tanıma / artikel kartı oturunca (S ≥ 3 gün) açılır; fiillerde hemen.
- Baştan savmaya karşı: düşünme süresi (1,2 sn), çok hızlı / boş cevap hedefe sayılmaz, dikkat dedektörü, okuma süreleri,
  birikme sınırı (yazma tekrarları birikince Hızlı tur da yeni kelime vermez), ara sonrası mesaj, gün eşiği (10 cevap).
- Takılan kelime: üç ayrı günde yanlış → log'a `leech`, Claude kanca yazar.
- Düzeltilen eski hata: kartın üstündeki durum satırı TR→DE sorularında cevabı (öğenin Almancasını) gösteriyordu.
- Son incelenen log satırı: yok (log henüz boş).

## 2026-10-02 — cümle sorusu: tam Türkçe cümle → Almanca; B1 önce

- Cümle sorusu artık özne / nesne / fiil parçaları yerine tam Türkçe cümle gösteriyor (`quellen/saetze.txt`: 849 Goethe örneği,
  612 fiil, elle çevrildi). İpucu: seviye 0'da Almanca fiil + hâller, 1'de sadece hâl kalıbı, sonra yok. Kalıp üretici yalnız yedek.
- Yeni kelime sırası B1 → A2 → A1 (Hızlı tur, Karışık, Kelimeler).
- Düzeltmeler: `essen` yazınca "das Essen anlamdaşı" uyarısı (doğru cevap önce kontrol edilir); isim örneğinde boşluk artikel + isim.
- Son incelenen log satırı: yok.

## 2026-10-02 — ilk log incelemesi (2026-09-30 17:12 – 2026-10-02 11:13)

- Hatalar: artikelsiz isim (Geld, Stadt, Urlaub), schenken ↔ schicken, wohnen Perfekt (hat), fahren Partizip (gefahren),
  du fährst, soru cümlesinde fiil başa, verschreiben, Apotheke yazımı. Düzeltmeler `daten/feedback.js`'te.
- Kendine not: 10 kez öneri "yanlış" iken 2–3 verdi (çoğu artikelsiz isim ve yanlış fiil). Nachname gerçekten doğruydu.
- Sistem hataları düzeltildi: essen anlamdaş döngüsü (aynı soru 11 kez geldi; ayrıca az önce cevaplanan kart 2 dk geri gelmez),
  büyük/küçük harf farkı "umlaut" sayılıyordu, tek harf yazım hatası "çekim" sayılıyordu, pakette doğru kelime yanlış biçim → küçük hata,
  artikel 3,5 sn'ye kadar doğru, Familienname için Nachname kabul, Vorname Türkçesi "ön ad".
- Son incelenen log satırı: 2026-10-02 11:13:05.

## 2026-10-02 — log incelemesi (11:13 – 12:34) + ilk yazma metni

- İlk metin (a01, hava, 114 kelime) düzeltildi: wurde/wollte, wenn/als, sıfat çekimi (des schlechten Wetters, das traditionelle Essen),
  sich vorstellen, Hoffe-cümlesinde fiil yeri; 3. madde (öneri) somut değil.
- Hatalar: widersprechen (Dat: Ihnen, Partizip widersprochen), vorschlagen (ayrılan; Prät. schlug), verzichten auf, sich bemühen um,
  artikel: der Nebel (3 kez das), der Schnee/Regen/Himmel, die Wolke/Luft, das Eis/Frühjahr/Training, die Kritik.
- Eklendi: 13 çeviri + 4 dönüşlü cümle (yeni öğrenilen kelimelerle), der Nebel için kanca.
- Son incelenen log satırı: 2026-10-02 12:34:09.

## 2026-10-03 — log incelemesi (2026-10-02 12:34 – 2026-10-03 12:13) + yapı değişiklikleri

- Hatalar: zweifeln an (daran, dass), verzichten auf, sich bemühen um ↔ bewerben, die Kritiken, Partizip'ler (geworden, getroffen + hat,
  brachte/gebracht, blieb), p02 (Anzeige, unterschreiben). Artikel: die Praxis (6× der), der Rat (4× das), der Regen, die Regel, die Geduld.
- Kendine not: 4 satırın hepsinde cömert (fast yerine falsch olmalıydı).
- Yapı: Hızlı tur'da fiil yok; Fiiller günlük plana girdi; çekim sorusu bütün fiillere (er-Präsens, Präteritum, Perfekt; modalda Perfekt yok);
  cümle aşamaları (ipuçlu boşluk → boşluk → tam cümle); Türkçe → Almanca seçmeli %75; yazma her gün; yazma birimi tanımadan bir gün sonra açılır.
- Eklendi: 6 fiil + 6 kelime cümlesi, die Praxis ve der Rat için kanca.
- Son incelenen log satırı: 2026-10-03 12:13:28.

## 2026-10-06 — log incelemesi (2026-10-03 12:13 – 2026-10-06 08:23) + tekrar döngüsü düzeltmesi

- Sorun (Tuna): yanlış yapılan öğe aynı cümleyle art arda geliyordu (sich verlaufen 3 dk'da 3×, reagieren auf, das Gedicht), diğer tekrarlar alta kalıyordu.
  Düzeltme: yanlıştan sonra oturumda yalnız 1 tekrar (6 soru sonra, başka cümleyle; Goethe boşluğu az önce sorulduysa çeviri cümlesi);
  orada da yanlışsa ertesi güne. Bugün yanlış yapılanlar kuyrukta öne geçmez (yalnız önceki günlerin yanlışları öne).
- Cümlesi olmayan 62 fiile 184 çeviri cümlesi (kalıp üreticili "fiil | özne | nesne" sorusu artık çıkmıyor).
- Hatalar: Partizip (verlaufen, gerechnet, geblitzt, vorgeschlagen, ist gekommen, getroffen), sich beschweren bei (3 gün yanlış → kanca),
  das Gedicht ↔ gedacht (kanca), widersprechen, zustimmen, sich wenden an, könnte/konnte, -eln: ich zweifle.
  Artikel: das Amt (2× der), die Operation, die Unterschrift, das Rezept (der/die), das Seminar, die Situation, der Roman, der Regen.
- Kendine not: 30 öneri satırının 27'sinde cömert (24'ünde sistem "yanlış" derken küçük hata / doğru verdi; özellikle çekim: fahrt, trefft, bliebt).
- Eklendi: 46 düzeltme (feedback.js), 2 kanca, 8 Partizip cümlesi.
- Son incelenen log satırı: 2026-10-06 08:23:05.

## 2026-10-06 (akşam) — tekrar düzeni

- Döngü: aynı öğe 12 soru arayla, günde en çok 4 (yeni) / 2 (eski); ekstra / Zayıflar da bu sınıra uyar; şıklar son 10 soruda tekrar etmez.
- Fiil anlamı (`bed`) kartları 3+ gündür alta kalıyordu (yalnız Fiiller bölümünde, tür dengesinde en küçük pay): gecikmiş kartlar artık öne.
- Çekim sınırı (6 soru ara, günde 5). "Metinde" kartı (her 5 soruda bir, gerçek metin cümlesi). Genç kartlara kısa aralık.
- Gerçek ilerleme dosyasıyla test: 175 soruda 1+ gün gecikmiş 199 → 100, öğe günde en çok 2×, en kısa ara 13 soru.

## 2026-10-08 — tek akış (Çalış), ünite 1 kapandı, kalıplar

- Tuna: çok fazla bölüm vardı → tek **Çalış** akışı (hedef 80): tanıma, yazma, cümle, yeni kelime / fiil ve her 7 soruda bir ara etkinlik
  (metinde boşluk — gerçek metinden, yalnız görülmüş kelimeler boşluk; eşleştirme; dinle–yaz; cümle dizme; günde bir paket tekrarı),
  25 cevaptan sonra fiil metni, 45'ten sonra yazma önerisi. Eski bölümler "Bölüm" listesinde odak olarak duruyor.
- Ünite 1 (Freundschaft und Beziehungen) kapandı: ünitede çalışılan 15 kelime tekrar listesine alındı (die Clique, die Mahnung, die Forderung,
  die Erwartung, die Behauptung, eingespannt sein, vor Gericht gehen, feststellen, sich einigen, erleichtern, beweisen, sich aufregen, schweigen,
  übertreiben, verhindern); çalışılmayanlar alınmadı. Ünite metinleri boşluklu metin havuzunda. Ünite metninde görülmemiş kelime artık boşluk olmaz.
- Fiil tanıtımında kalıp kutusu, fiil sorularının açıklamasında kalıp satırı.
- Test: 4 günlük simülasyon (tekrar aralığı ≥ 12 soru, öğe günde ≤ 4), gerçek ilerleme dosyasıyla 93 adım (dengeli tür dağılımı), e2e duman testi.

## 2026-10-08 (akşam) — veri incelemesi: bildiğin kelime neden hâlâ geliyor, cümle neden değişmiyor

- Gerçek ilerleme (2026-10-08 21:25): 249 vadeli kartın 141'i hiç sorulmamış ek birim (ausfüllen'in anlam kartı, der Pass'ın anlam / artikel kartı …),
  ~75'i hiç ya da son 3+ denemede yanlış yapılmamış öğelerden. Sebep: her kelimenin 3–5 ayrı kartı (anlam, artikel, yazma, cümle) ayrı takvimle,
  yeni açılan her kart bilinen kelimede de 2 günde 3 kez soruluyordu; A1 kelimelerin (werden, der Supermarkt) anlamı soruluyordu.
- Düzeltme: kardeş kredisi (yazarak doğru → aynı kelimenin anlam / artikel kartı ileri), öğrenme adımları yalnız bugün tanıtılan kelimede,
  iyi bilinen kelimenin yeni kartı ilk seferde doğruysa ~8 gün sonra, A1 anlam kartları yok, art arda 4+ doğru → 12–21 gün (seri).
  6 günlük simülasyon (günde 80 cevap): eski sistemde birikme 252 → 347, 6. gün 80 sorunun 48'i bilinen kelime; yenisinde 201 → 176, 21.
- Cümle hep aynıydı: 125 öğrenilen öğenin 102'sinde 3'ten az cümle. Cümle havuzu (kendi + Goethe örneği + okuma metinleri, son görülen tekrar seçilmez)
  ve 152 yeni çeviri cümlesi (67 öğe + cümlesi hiç olmayan 11 öğe). Şimdi 125 öğrenilen öğenin 124'ünde 3+ cümle (yalnız vor Gericht gehen'de yok).
- Fiil metni testi: 6 cevabın 6'sı Präteritum'du. Artık metindekinden başka zamana geçiş (Präsens / Präteritum / Perfekt dengeli) ve mastar sorusu,
  şıklar tipik hatalar (fliehte, ist geflieht, hat geflohen, fahrt).
- Küçük hatalar: ayrılabilen fiil dizini (fährt → abfahren sanılıyordu), "metinde" kartında cümle ortasındaki isim fiil sanılıyordu (Schienen → scheinen),
  eingespannt ipucu cevabı gösteriyordu, pakette artikelli cevap yanlış sayılıyordu, Goethe örnekleri yanlış kelimeye bağlanıyordu
  ("ein-" → einfach / eingespannt, "un-" → und) ve yarım örnekler ("Herr Huber ist bis zum") gösteriliyordu.
- Kanca: die Burg, sich beruhigen, sich wenden an, verzichten auf, die Geduld, sich verlaufen.
- Düzeltme listesi (feedback.js) bu notta yazılmadı; son incelenen log satırı hâlâ 2026-10-06 08:23:05.

## 2026-10-09 — "gerçekten biliyor musun?" listesi

- Tuna: 20–30 tekrarda bir rastgele kelime / fiillerle toplu kontrol istedi. Çalış'ta 20–30 cevapta bir 8 kelimelik liste: biliyorum / bilmiyorum, sonra anlamı görünür ("yanılmışım" ile geri alınır).
- Bilmiyorum: 3 örnek cümle (kendi + Goethe + gerçek metin), tanıma kartı unutuldu sayılır, oturumda ~8–12 soru sonra cümle içinde yeniden, bir hafta anlam sorusu cümle içinde, cümle kartı açılır, öteki kartlar en geç yarın.
- "Sonuçlarıma bak"ta `kontrol` / `bilmiyor` kelimelerine yeni cümle yazılacak.
- Aynı gün (Tuna): liste 10–15 kelime olsun, "emin değilim" de olsun, her tekrar böyle değerlendirilsin → **ön kontrol**: vadesi gelen kelime tekrarları önce listede
  (yazma sorusu varsa Türkçesi → Almancası, yoksa Almancası → anlamı), biliyorum = bugünkü tekrar yapılmış, emin değilim = hemen sorulur, bilmiyorum = sıklaşır + cümle.
  Gerçek veriyle: 136 vadeli → 3 liste + 60 soruda 73'e indi. Telefon genişliğinde yatay taşma (Bölüm listesi) da düzeltildi.

## 2026-10-11 — Ünite 2: fit und gesund bleiben

- Tuna'nın kitap listesi (112 kelime / kalıp): `quellen/unite2.txt` (örnek cümle + boşluk + Türkçe), 8 boşluklu metin (Claude yazdı), 2 yazma görevi.
  `@bis 2026-10-13`: o gün bitince ünite kendiliğinden kapanır, çalışılan kelimeler tekrar sistemine geçer (yeni: tarihle kapanma).
- Ana listede karşılığı olmayan 57 kelime eklendi (kimlikler değişmeden, hep sona): 23 isim `nomen_extra.txt`, 10 fiil `verben.txt` (kühlen, eincremen, leiden an,
  krankschreiben, aufbewahren, kämmen, empfinden, betragen, gelangen, kommen auf), 24 kelime / kalıp `woerter.txt`. der Knödel artık bölgesel diye atlanmıyor.
- Ünite metninde çekimli boşluk (Knödeln, creme, gewundert) kelimeye bağlanıyor; "…" yazmadan "entweder oder" kabul.


## 2026-10-09 — sonuçlar 10-06 → 10-08 (yan dalda kalmıştı, 13 Ekim'de bu dala taşındı)

- 320 satır. Çoğu doğru; zayıf noktalar: Partizip (gerechnet, geblitzt, geregnet, verzichtet, widersprochen, bemüht, gestritten),
  benzer kelime karışıklığı (sich verlaufen/verändern/verlieren, eingespannt/entspannt, beweisen/beschweren, aufregen/anstrengen, Gedicht/Geduld, Burg/Kunst),
  artikel (die Kunst, die Unterschrift, die Geduld, die Heimat, das Klima, das Projekt), çekim (werden: wurde, ist geworden; dürfen: durfte).
- Eklendi: 42 düzeltme (feedback.js), kanca (sich bemühen um; ötekiler zaten vardı), 10 çeviri cümlesi + glossen.
- Not: sistem notu bazı yerde cömert (öneri:falsch iken fast: hat verzicht, die Kält, der Kunst). 10-06 21:16 `dikkat cok-yanlis` — hava durumu kelimeleri toplu yanlış.
- Son incelenen log satırı: 2026-10-08 21:32:31.

## 2026-10-13 — birikme yayma, Ünite 2 uzatıldı, sonuçlar 10-09 → 10-11

- Tuna: "çok tekrar birikti, karıştır; yoğun tekrarlar yüzünden hiç dokunamadıklarım var." Durum: 535 kartın 359'unun vadesi geçmiş
  (günlük cevap 10-09'dan beri 174 → 64 → 18 → 0 → 0); birikme 150'yi aşınca hiç yeni öğe gelmediğinden Ünite 2'nin 112 kelimesine hiç sıra gelmemiş,
  ünite 13 Ekim'de kendiliğinden kapanıp 0 kelime aktaracaktı.
- Birikme yayma (`stauVerteilen`, TASARIM.md): vadesi dünden önce geçmiş kartlar günde 45 ile ileri günlere yayılır (o günün vadeli kartları sayılarak;
  önce gerçek tekrarlar en eski vadeden, en sona hiç sorulmamış ek birimler; öğrenme adımındakiler yerinde), asıl vade `urspr`; kuyruk bitince ertelenenler
  öne çekilir; birikmede de ünite kelimeleri gelir (yarı hızda); plan satırında `yayıldı: N tekrar`, açılışta mesaj.
  Gerçek dosyayla simülasyon (`tests/sim_stau.js`): 260 eski tekrar 8 güne yayıldı, bugün 66 tekrar; 90 adımda 22 ünite kelimesi + 5 ön kontrol listesi;
  kuyruk bitince 150 adımda ertelenen 238 → 103; ertesi gün dünden kalan 6. e2e duman testi geçti.
- Ünite 2 `@bis 2026-10-26` (hiç başlanmamıştı).
- "Metinde" cümlesi: dönüşlü fiilin cümlesinde dönüşlü zamir yoksa eşleşmez ("in einigen Gegenden" ≠ sich einigen, "die Krankheit verläuft" ≠ sich verlaufen).
- Sonuçlar (332 satır): düzensiz fiilde -t'li Partizip / -te'li Präteritum (gestreitet, verlauft, gefangt, leihte, nennte, geschah yerine geschehen),
  özne–fiil uyumu (Ihre Augen blitzt, Es folgt die Nachrichten, man fürchten), boşlukta sözlük biçimi (kühl→kühler, Regel→Regeln, nass→nasse),
  -heit/-e türetme (Kinderheit, Kält, Kälter), yakın kelime (frech/feucht, Antrag/Vertrag, einziehen/umziehen, verlassen auf/verzichten auf),
  artikel (das Projekt, die Unterschrift, der Nebel, der Wohnsitz, das Missverständnis; TR→DE şıkta die Politik/Mensa/Quittung).
  Kendine not cömert: folgt (richtig), gezweifelt (hat'sız richtig), Kinderheit, Kälter, Situtation, verlauft; makul: Veränderung, kühl, hâl yazılmadı.
- Eklendi: 56 düzeltme (feedback.js), 10 kanca (blitzen, zweifeln an, zustimmen, vorschlagen, sich eignen für, donnern, nass, die Regel, sich fürchten vor,
  sich verletzen), 56 çeviri cümlesi + glossen (bilmiyorum: eher, die Regel, der Hausmeister, durcheinander, das Sonderangebot, sich verlassen auf,
  sich fürchten vor, sich verlaufen · okuma: allerdings, anwesend, gleichzeitig, der Fall, weltweit · yeni: digital, das Missverständnis, fett, das Ziel,
  die Diskussion, eben, die Politik, folgen · takılan: zustimmen, vorschlagen, sich eignen für, donnern, blitzen, nass).
- Bilinen eksik: fiil metninde "fingen … an" (anfangen) fangen diye soruldu (ayrılabilir ön ek cümle sonunda; dizin tek kelimeye bakıyor).
- Son incelenen log satırı: 2026-10-11 17:45:24.

## 2026-10-14 — uygulama yeniden tasarımı (v4): Bugün ekranı, turlar, seri, PWA, verim

- Tuna: "uygulamaya hiç girmek gelmiyor, 300 tekrar birikti; daha çekici ve verimli olsun, benzer uygulamalara bak, kullanıcı simülasyonu yap."
- Yöntem: gerçek ilerleme dosyasıyla ekran kayıtları (`tools/film.js`: telefon / masaüstü / yeni kullanıcı / ertesi gün), 3 Tuna personası + UX uzmanı +
  öğrenme bilimi uzmanı kayıtları ve log'u inceledi; 5 konuda web araştırması (birikme ve verim, motivasyon, kart arayüzü, Almancaya özgü, PWA). Ayrıntı: TASARIM.md.
- Bulunanlar: telefonda soru kartı ekranın ortasından başlıyordu (üstte çipler, bölüm seçici, "248 tekrar birikmiş"); sonuç ve not düğmeleri ekranın altında;
  sayacın %80'ini öz-değerlendirme listeleri dolduruyordu; seçmelide 3,5 sn'den yavaş doğru "zor" sayılıp 101 cevap 2–4 güne çekilmişti (birikmeyi uygulama büyütüyordu);
  ön testte "biliyorum" 8 gün sonraya atıyordu ama ilk gerçek testte %37 yanlış; 2–3 Ekim'de 128 öğe (547 kart) açılması birikmenin kök nedeni.
- Yapılanlar:
  - Bugün ekranı (seri 🔥 + dondurucu ❄️, tur halkası, tek Başla, ⚡ klavyesiz 8 soru / 🧘 uzun 25 soru, günün işleri: Ünite / fiil metni / yazma / Zayıflar,
    odak kartları, bu hafta, B1 yolu), alt gezinti çubuğu (telefon), çalışırken yalnız kart + tur çubuğu (✕ / Esc).
  - Tur: 12 cevap, tur sonu özeti (doğruluk, puan, dakika, güçlenen / yakında tekrar, yarınki süre, seri), "bir tur daha". Günü kurtar = 10 cevap; günlük hedef uyarlanır (3–4 tur).
  - Seri dondurucu (7 günde 1, en çok 2), dün kaçtıysa bugün 2 turla onarım, ara verip dönünce ilk tur çift puan; puan emeğe göre; ses / titreşim / konfeti / kombo; cevaptan sonra Almanca seslendirme.
  - Telefonda sonuç alttan açılan panelde; yanlışta büyük "Devam" (sistem notu), "küçük hata say" / "aslında doğru" (artikel hatasında "doğru" yok); doğru yazmada panele dokununca geç.
  - Hızlı tekrar listesi tek tek kart (10 kelime), az önceki kelimenin cevabı altta + "yanılmışım"; iki kalem bir cevap; artikel kartı "biliyorum"la kapanmaz;
    "biliyorum"ların dörtte biri (tutma %80'in altındaysa yarısı) gerçek soruyla doğrulanır, tutma oranı gösterilir.
  - Notlama: seçmelide doğru = İyi (zor yalnız 15 sn üstü), artikelde 8 sn; ön test "biliyorum" = İyi (~2 gün) ve artikel gizli; fiil yazmada hâl notasyonu zorunlu değil;
    en çok 4 şık; şıklar 1,2 sn sonra ya da dokununca; tam cümle çevirisi seyrek (en pahalı tür).
  - Verim: yeni sınırı 8 kelime + 2 fiil, hedef hatırlama %85 (Ayarlar: Rahat / Dengeli / Sıkı), birikme eşiği iki günlük kapasite, birikmede kısa kartlar ve R'si yüksek önce,
    kelime başına günde tek kart (önce yazma; yanlışta kardeşler yarına), ilk gün öğrenme adımı kısaldı, ısınma ve art arda iki yanlıştan sonra kolay kart, ara etkinlik her 7 gerçek soruda.
  - Yeni kelime tanıtımı sade (ses düğmesi, ünite kitap cümlesi Türkçesiyle, ayrıntılar "daha fazla" altında, "bir kez yaz" isteğe bağlı), yeni öğrenilen kelime turda sayılır,
    bir fiile en az 3 isim / kelime. Bileşik isim artikel kuralı (son parça belirler, 204 isim).
  - Artikel 60 sn oyunu (kombo, rekor; vadesi gelen artikel kartı tekrar sayılır). İlerleme sayfası (seri, puan, 5 haftalık takvim, 7 günlük yük). Ayarlar sade (tur uzunluğu,
    ses, titreşim, tekrar yükü, takvim hatırlatıcısı .ics, ana ekrana ekleme; bölüm tabloları "Gelişmiş" altında).
  - PWA: manifest (kısayollar), service worker (çevrimdışı açılış, arka plandan dönünce güncelleme), ikonlar; iPhone ana ekran uygulaması ayrı başladığı için "ilerlemeni getir"
    (GitHub anahtarı) ve Safari'de "anahtarı kopyala".
- Testler: `tests/e2e_smoke.js` turlarla güncellendi (paket önce; akış için yeni sınırı testte 25), `tests/sim_stau.js` birikme yayma; ikisi de geçti.
- Son incelenen log satırı değişmedi: 2026-10-11 17:45:24 (bu not uygulama değişikliği).
