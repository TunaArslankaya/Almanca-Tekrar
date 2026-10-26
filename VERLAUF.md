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

## 2026-10-15 — v5: tek hafıza + soru merdiveni, Gramer, Prüfung, Konuşma, gece Claude işi

**İstek (14.10 akşam):** uygulama çekici ve verimli olsun, "biliyorum/bilmiyorum" soruları kalksın, Almanca çalışmanın tamamını kapsasın (gramer, sınav, Netzwerk neu K9–12), Claude gömülsün (düzeltme uygulamadan, içerik her gün yenilensin), her iş 1–2 denetçiden geçsin.

**Araştırma (ajanlar, raporlar scratchpad'de):** öğrenme bilimi (successive relearning, hatırlama > tanıma, ön testin bağlantısız çiftlerde işe yaramaması, FSRS yük eğrisi), Almanca didaktiği (artikel üretimin parçası, edatlı fiil tek birim, Stammform kök başına), uygulama incelemeleri (Anki/WaniKani/Duolingo/Clozemaster/Lingvist), alışkanlık, log analizi (liste sonrası bırakma %55 vs %27; "biliyorum" 84/84 test edilmemiş; 2–4 Ekim'de 147 öğe = birikmenin %78'i), kod haritası, Android, gramer müfredatı, Goethe B1 sınavı, çalışma yöntemleri. 3 tasarım + 2 hakem + sentez: `scratchpad/girdi/SPEC.md`.

**Yapılanlar**
- Çekirdek v5 taş 1–4 bitti (kern.js + göç/senkron + akış + ekranlar; her taş Opus denetçi + düzeltme; commit'ler a38610b…5b889c6). Taş 5 (yan bölümler tek hafızaya: ünite/paket/fiil metni/okuma/oyun) ve son kullanıcı simülasyonu bekliyor. `js/kern.js` (DOM'suz, `tests/test_kern.js` 379, `tests/test_goc.js` 76): öğe başına tek hafıza `m` (+ isimde `art`, düzensiz fiilde kök `S.kok`), basamak (B0 tanı → B1 seç → B2 yaz → B3 cümlede boşluk → B4 tam cümle), notu sistem verir (biçim ofseti, kısmi kredi, günde tek kalıcı yazım), seçim (`Kern.sec`: yeniden sorma → yeni parti → metin → kurtarma → R azalan), kota (genç öğe yüküne bağlı, en az 2), göç (547 kart → öğe; `kartenV3` yedeği, 30 gün gölge yazım, `v3Yetis`, `surum` işareti, boş cihaz yazmaz), cihaz başına gün sayaçları (`tageC`), log ayrı anahtarda. Kontrol listesi / ön test / rastgele kontrol kapalı.
- Gramer bölümü (`quellen/grammatik/*.txt`, `FORMAT.md`, `js/gramer.js`): 29 konu / ~870 alıştırma (5 tür), konu başına FSRS, hayalet tekrar, karışık tekrar; 4 grup Opus denetçiden geçti (satır satır düzeltme).
- Prüfung (`js/pruefung.js`): Lesen tam/mini prova (Übungssatz, süre, puan ×3,33, Teil tablosu, yanlışlar), Schreiben Teil 1–3 süreli, Sprechen sınav akışı (hazırlık 15 dk, partner sesi, 5 slayt, Teil 3 soru), sınav tarihi geri sayımı. Goethe metinleri okuma havuzundan çıktı.
- Konuşma: shadowing (dinle–tekrarla–kaydet), Sprechen Teil 1–3 kartları, Redemittel (`sprechen1/2/3`).
- Okuma: DW ses (`audio`), sesli oku. Üniteler: `@kapitel`, `@inaktiv`, Ayarlar'dan aç/kapa; Netzwerk neu K9–K12 (`unite3..6`, kapalı; kaynak: Klett Glossar OCR dökümleri + web özetleri, Tuna kitapla karşılaştıracak).
- Claude gömme: `.github/workflows/gece.yml` (Claude Code aboneliğiyle; `tools/istem_gece.md`, `istem_geribildirim.md`), `tools/feedback_json.js` → `log/feedback.json`, uygulamada "Claude'a şimdi baktır".
- Senkron/PWA: kart kart birleştirme, `cache: no-store`, kabuk önbellekten anında, manifest `id`, gün değişimi, seri rekoru geçmişten, Google Takvim hatırlatıcı, Artikel oyunu hedefe sayılmaz, toast/kombo/hover/paket Devam düzeltmeleri.

- `tests/sim_akis.js` "3 gün üst üste artış" ölçütü gürültüye karşı gevşetildi (toplam +6'dan az sayılmaz; +2/+3 dalgaları eski kodda da vardı).

**Aksilik:** 14.10 22:30 UTC'de oturum limitine takıldı, 05:00 UTC'ye kadar durdu; sabah 7 hedefi kaçtı, 12:00'ye ertelendi.

**Sorular:** Ünite 2 26.10'a kadar bitmeli mi (hızlandırma)? Günlük hedef 3 mü 4 tur mu? K9–K12 listeleri kitapla uyuyor mu? Sınav tarihi?
Son incelenen log satırı: 2026-10-14 19:35:21 (abr v063).

**15.10 öğle, canlıya alma:** Tuna sabah 09:18'de eski sürümde 25 cevap (14 doğru / 11 yanlış) verdi; canlı daldaki log commit'leri birleştirildi. Son testler: test_kern 379, test_goc 76, gramer, stichprobe, e2e duman (4 senaryo, göç 195 öğe / 70 vadeli), e2e arayüz, 14 günlük simülasyon geçti.
Test ölçütleri gerçek veriye göre düzeltildi: simülasyonda "3 gün üst üste artış" yerine "2. hafta ortalaması ve 14. gün başlangıcı aşmasın" (ilk günlerde cevaplanan kartlar 8–12 gün sonra birlikte dönüyor: yankı dalgası, büyüme değil); ikinci hatırlama sınırı parti boyuna bağlı (4 öğelik partide 7. soru); test sürücüsü kabuk hazır olana dek bekliyor (açılış yarışı).
(Düzeltme: yan bölümler zaten tek hafızaya yazıyordu — `hafizaYaz(…, { yan: true })`; ünite ekranı v5. T5 diye ayrı iş kalmadı.)

**15.10 öğleden sonra — Tuna'nın kararları, son simülasyon ve düzeltmeler**
- Kararlar: Ünite 2 şimdilik dursun (bitiş tarihi kaldırıldı, hızlandırma yok); günlük hedef önce az: 2 tur (`ayar4.rutin` bir kez uygular, Ayarlar'dan seçilince `ayar4.secildi` korur); yeni kelime tavanı 6 kaldı (boş cihazda 4 ile gün tek tura düşüyordu); K9–K12 listelerini Tuna kitapla karşılaştıracak; repo açık kalır, anahtar yok (repo + geçmiş tarandı); sınav tarihi yok, Prüfung çalışma şeması.
- Son simülasyon (3 Opus sınayıcı: telefonda Tuna kişiliği, masaüstünde yan bölümler, kod denetçisi): 46 bulgu, 15 kritik/yüksek. Düzeltildi (f5cfb53, bağımsız doğrulandı): sonuç paneli açıkken arka planda kapanınca cevap kayboluyordu (kritik), Android geri tuşu uygulamayı kapatıyordu, kök sorusunda Bilmiyorum anlam hafızasını sıfırlıyordu, Ünite 3 açılınca gelmiyordu / Ünite 2 kapanmıyordu, Prüfung Escape onaysız, Schreiben taslağı yok, Zayıflar boş, Konuşma sayacı Redemittel'i kapatıyordu, seri yan bölümleri saymıyordu, fiil metni → Okuma çöküyordu, yoklamada yanlış artikel gösterilmiyordu; tur uzatması (yanlış kaldıysa en çok +3), artikel flaşı aralığı, paket kartı, Ayarlar 2–5 tur, tur yan bölüme gidince saklanır, gramer karışık sonu, vb.
- İkinci doğrulamanın bulguları (5130cdb + bu commit): gizlenince cevap İŞLENMEZ, `localStorage` `almanca-tekrar-bekleyen` kaydı; gerçek kapanışta (pagehide) işlenir; arka planda öldürülürse sonraki açılışta bir kez işlenir (`arka planda kapandı`, 3 günden eski atılır, gün sayacı yalnız aynı öğrenme gününde). B2'de pk 0 ve S ≥ 3 öğeye ~%35 fiili/kelimesi verili cümle boşluğu (`bos0`). Tur uzatmasında bekleyen yanlışlar kalan yerlere sondan sığdırılır (kuyruk kaleminde `yer`: kendi sorusundan en az 1 soru sonra; 11+12, 12+13, 8+13 yanlışlarında ikisi de 14. ve 15. cevapta geliyor, tur 15'i aşmaz; sığan yoksa tur biter) — üçüncü doğrulayıcı ilk sürümde ikinci bekleyenin hiç gelmediğini buldu, düzeltildi ve 10 koşuda sınandı. Gelecek tarihli bekleyen kaydı atılır. Kök hatası `fehlTage`/leech'e girmez. Bugün: "Birikme büyüyor · …" (Toparlanıyor ile çelişmez). Yoklama bildi → `yoklamaBildi` (öldürülme yolunda da `yeni;bekannt`).
- Üç bağımsız doğrulama turu (Opus, salt okunur) geçti; kalan küçük notlar: bekleyen cevapta gün sayacı takvim gününe yazılıyor (karşılaştırma öğrenme günü), yoklama yanlışken öldürülme yolunda öğe yeniden yoklama olarak gelir (tanıtım yerine).
- Bilinen / sonraya: 2 turla birikme büyüyor (K=24 simülasyonu 83 → ~105; 3 turla 83 → ~64), Tuna'nın bilinçli kararı, Bugün ekranı söylüyor; yeni kelime kotası genç öğe yükü yüzünden haftalarca 2'de kalır; ünite metni boşlukları hafızaya yazılmıyor (yalnız sayaç); isim boşluğunda yalnız ek hatası (Nebel/Nebels) `falsch`; bileşik isimde `wortLuecke` tutmayınca bos0 yerine tam cümle; `#/liste` ile açılışta adres kalıyor; kök günlük sayacı/`turKelime` bekleyen işlemede güncellenmiyor; `kokYanlis` üreticisi yok.
- Testler: `tests/sim_akis.js` yük ölçütü tohum ortalamasına (yankı dalgası), `e2e_smoke` ikinci hatırlama parti boyu + ara tekrar payı, tur 12–15 cevap, aynı öğe ≥ 7; `e2e_ui` Bonus tur kabul; `tests/surucu.js` kabuk hazır olana dek bekler.

- (geri bildirim, otomatik) 2026-10-15 16:00: 21 düzeltme, son satır 2026-10-15 15:25:26
- (geri bildirim, otomatik) 2026-10-15 16:30: 0 düzeltme, son satır 2026-10-15 15:28:27

**2026-10-16 (gece işi, otomatik)**
- 15.10 16:02–16:20 oturumu: 6 tur (~70 cevap). Seçmeli yanlışlar: schneien/üşümek, sich fürchten vor (edat auf), Artikel karışıkları: Geduld (das→die), Preis (die→der), Praxis (der→die, leech), Rezept (die→das), Erlaubnis (der→die, leech), Wind (das→der). Yazma: Eis, bewölkt (yazım). Kök: bringen → gebracht, zustimmen → zugestimmt.
- Paket p05 (%58) ve p04 (%48) zayıf; 12 düzeltme `feedback.js`'e eklendi (Sonderangebot, Bargeld, Quittung, anmelden, Dozent, Referat, Kommilitone, Mensa …). `lesen-wort` (Schule metni) satırları basit kelimeler (neu), yeni cümle gerekmedi.
- `die Erlaubnis` için kanca eklendi (Praxis'in vardı).
- DW "Autorin: KI" sözlüğünden Goethe listesinde olanlar: Werk, gelingen, ankommen auf (+ metindeki Vorwurf, Zweifel, Qualität, Herkunft, Roman): 8 çeviri cümlesi + gloss.
Son incelenen log satırı: 2026-10-15 16:20:20 (tur akis).

**2026-10-17 (gece işi, otomatik)**
- 16.10 22:46–22:51 oturumu: 5 tur (~60 cevap). Seçmeli/artikel yanlışları: schneien (frieren/scheinen ile karıştı, 3. denemede doğru), Artikel: Preis (die→der), Kunst (der→die), Rezept (die→das, leech: 3 ayrı gün), Geduld (das→die), Diskussion (der→die), Luft (der→die). Kök: bleiben (geliebt), bringen (gebrachen), ausfüllen (ausgefühlt). Dikte: Kälter→Kälte. Yoklamada bilinip sonra yazmada yanlış olan yok; itiraz (`öneri:`) yok.
- 4 düzeltme `feedback.js`'e, Rezept için kanca. DW "Schuluniform" metninden (Forderung, Unterschrift, Schuld, Umfrage, Folge, verbieten, verlängern): 7 çeviri cümlesi + gloss.
Son incelenen log satırı: 2026-10-16 22:51:20 (tur akis).

**2026-10-17 (Tuna: "niye bu kadar az tekrar" + bugünkü cevapların kontrolü)**
- Durum: 186 hafızalı öğe, birikme 0, şu an vadeli yalnız 4 kök; yarın 32, ertesi gün 27 öğe vadeli. Genç (S<7) 95. Kota 2'de takılıydı: ilk 3 gün "göç", sonra "genç > 1,6 × kap" (kap 24 → 38; kap 48 ile bile 77 < 95). Tuna bugün 52 cevabı 5 dakikada bitirip iki kez "şimdilik bu kadar" gördü (tur `leer` ×2).
- Değişiklik (`Kern.kota`): genç freni yalnız birikme varsa 2'ye kısar; birikme 0 ise en çok 4; bonus turda birikme yoksa genç sayısına bakılmaz (+2, en çok +4). "+3 yeni" teklifi birikme yoksa günde 3 kez (`gs4().ekYeniTeklif` sayaç). test_kern 387.
- 17.10 12:55–13:01 (64 satır, 52 cevap, 3 tam tur + 2 boş): yazarak yanlışlar: gebrachen → gebracht (ikinci kez), anwiesig → anwesend, anwiesend → allerdings (önceki kelimeyle karıştı); dikte: "wir sollen" → "wir sollten" + virgül. Artikel 7 yanlış, 5'i "der" varsayımı: Kunst, Rezept, Diskussion (leech), Geduld, Ziel, Sonderangebot (seçmelide), Regen (die → der, leech). 11 düzeltme `feedback.js`, kancalar n0244 / n0973, 14 cümle (treffen, gleichzeitig, anwesend, allerdings, beide, Geduld, Ziel, Diskussion, Regen) + gloss.
- Not: 12 cevap/dk tempo (sek 1–5); seçmelide hızlı. Son incelenen log satırı: 2026-10-17 13:01:26 (prod w0011).

**2026-10-18 (gece işi, otomatik)**
- 17.10 13:01'den sonra yeni cevap yok (yalnız aynı oturumun kapanış satırları 13:01:31–46); düzeltme/kanca gerekmedi.
- En yeni DW metni (Schuluniform) zaten işlenmişti; metinden kalan B1 isimleri için 5 çeviri cümlesi + gloss: Alltag, Gemeinschaft, Opfer, Unterschied, Gesellschaft.
- Build/test: `tools/build.py`, `test_grammatik`, `stichprobe 1` geçti.
Son incelenen log satırı: 2026-10-17 13:01:46 (tur akis).

**2026-10-18 (Tuna: bugünkü alıştırma + "günde 6–7 dk az değil mi?")**
- 11:23–11:31: 60 cevap, 6 tur (2 tam, 4'ü "şimdilik bu kadar": vadeli bitti). 17 tanıtım (Ünite 4 / K10 Werte açılmış: Toleranz, Fairness, Ehrlichkeit, Gerechtigkeit, Gleichberechtigung, Hilfsbereitschaft, Zivilcourage, Solidarität, Würde, Vorurteil; + fahren, entstehen, bewegen, Wert, Erziehung), yoklamada bildi: bereit, der Respekt. Ayarlar: turHedef 4, ret 0,90.
- Yazarak: Tolerans → Toleranz, Gedichkeit → Gerechtigkeit, Gleichbereitschaft → Gleichberechtigung, Soliderität → Solidarität, die Würde → der Wert (aynı partide karıştı), worden → geworden (werden tam fiil), metin boşluğu festgestellt (boş), dikte yalnız noktalama.
- Artikel: dünkü aynı 6 kelime yine yanlış (Sonderangebot, Ziel, Kunst, Rezept, Diskussion, Geduld); Ziel leech → kanca. Seçmelide die Wert, Erziehung bilmiyorum.
- Süre sorusu: vadeli az (bugün 2; yarın 55, 5. gün 33): tur kısa çünkü tekrar bitti, kota 4 + bonus/teklifle 15 yeni açıldı. 8 düzeltme, 13 cümle + gloss.
Son incelenen log satırı: 2026-10-18 11:31:35 (erk n0322).
(geri bildirim, otomatik) 2026-10-18 12:00: 1 düzeltme, son satır 2026-10-18 11:58:42

**2026-10-18 (Tuna: gramer "yavan" + akşam tekrarı)**
- Gramer: 29 → 44 konu, 839 → ~2900 alıştırma. Yeni konular: Perfekt, Modalverben, trennbare Verben, Wechselpräpositionen, Präp. + Dat/Akk, lokale / temporale Präp., Verben mit Präpositionen, Verben mit Dativ, Nomen-Verb-Verbindungen, Partizip als Adjektiv, Konjunktiv II Vergangenheit, Artikelwörter, statt/ohne … zu, Verbstellung. Eski konuların hepsi ~57–90 alıştırmaya çıktı.
- Yeni alıştırma türleri: `ceviri` (Türkçe → Almanca), `text` (çok boşluklu metin), `eslestir`, `kategori`, `dinle` (dikte); eskiler: luecke, wahl, ordnen, fehler, umform. Her içerik grubu ayrı denetçiden geçti; son grubu (Komparation, n-Dekl., Türkçe hatalar, weil/dass) ben denetledim.
- Motor düzeltmeleri: cümle dizmede virgül yok sayılır (virgüllü cevaplar hep yanlış çıkıyordu); kaynaşmamış edat (in dem / im) `fast` + `kaynaştırma`; çok boşluklu soruda seçenekler takım olarak eşleşir (rufe…an / werde…anrufen karışmaz); telefonda kelime çipleri taşmıyor, "-e mi -en mi" tiresi kopmuyor. Öz denetim: 2492 alıştırmanın (fehler hariç) kendi cevabı doğru sayılıyor.
- Akşam tekrarı: ilk cevap 13:00'ten önce ve üzerinden ≥ 8 saat geçtiyse Bugün'de isteğe bağlı kart; bugün yeni / yanlış / R < 0,9 öğeler, akşam en çok 15. Bugün yeni ya da yanlış olanın hafızası akşam bir kez daha yazılır (öğrenme adımı). Test: `tests/e2e_aksam.js`.
- Simülasyon (gerçek kayıt, 202 öğe, günlük yük ≈ 40): günde 48+ cevapta birikme iner; 36'da ~100'de sabit; yalnız hedef (24 cevap) yapılırsa 2. haftada %14 büyür, yeni kelime günde 2'ye kısılır. `sim_akis` ölçütü: yük > K ise "büyümüyor" ölçütü.
- Açık: FORMAT'taki "wegen + Dativ = fast" motorda uygulanmıyor (tam yanlış sayılıyor).

**2026-10-19 (gece işi, otomatik)**
- 18.10 11:58'den sonra: akşam tekrarı (22:20, 15 cevap) + 19.10 sabah 3 tur (07:16–07:22, 39 cevap). Yazarak yanlışlar: Toleranz, Ehrlichkeit, Fairness, Gerechtigkeit (akşam, harf karışması / önceki kelimeyle karışma), Hilfsbereitschaft, Gleichberechtigung (bilmiyorum), Vorurteil (bilmiyorum), Erziehung (bilmiyorum), flexibel (bilmiyorum), ebenfalls (beide ile karıştı), Karriere, Entscheidung (yalnız "die"). Artikel: Vorurteil, Toleranz (der → die/das), Rezept (die → das, üç gündür). Dikte atlandı ("Ich kann nicht hören"). `yeni;bekannt` yok.
- 16 düzeltme `feedback.js`'e (seçmeli artikel yanlışları toplu: Vorurteil, Toleranz). DW "Schuluniform" metni zaten işlenmişti, kalan B1 kelime yok; bunun yerine takılan 10 kelimeye çeviri cümlesi + gloss (Ehrlichkeit, Fairness, Hilfsbereitschaft, Zivilcourage, Toleranz, Karriere, Entscheidung, flexibel, ebenfalls, Rezept). -ung/-keit/-schaft hep die kuralı düzeltmelerde vurgulandı.
- Build/test: tools/build.py, test_grammatik, stichprobe 1 geçti.
Son incelenen log satırı: 2026-10-19 07:22:29 (tur akis).

**2026-10-19 (Tuna: "niye kelimeler level atlamak yerine 60 gün tekrara düşüyor")**
- Sebep 1: göçte eski kartların S'i (v3'te "biliyorum" / kolay işaretli, yalnız seçmelide görülmüş: Nebel, Service … S 17–57) hafızaya aynen geçti ve pk kapısı (pk 0 → 7 g) göçte uygulanmadı: 47 kelime 16–60 gün vadedeydi, seviyesi Tanıyor/Yazıyor'da kaldı.
- Sebep 2: S zaten yüksek bir kelimeye tek doğru yazma (Service, 19.10 22:03) S'i 57'ye çıkarıp 57 gün sonraya attı; cümle basamağı hiç sorulmadan seviye "Oturdu" görünüyordu.
- Düzeltme (`Kern` basamak kapısı): `m.bm` = kanıtlanan en yüksek basamak; sonraki soru en çok bir basamak yukarı; aralık bm 1 → 7 g, 2 → 14 g, 3 → 30 g, üst basamakta 60 g; seviye ≤ bm. Açılışta eski hafızalara uygulanır: 62 kelimenin vadesi kısalır, 17'si hemen vadeli. Görünen seviye kanıtlanan basamağa iner (137 kelime bir basamak: eskiden S'ten hesaplanıyordu). İtiraz düğmesi telefonda 48 px. Duman testinde iki rastgele hata (aynı gün artikel + anlam ayrı hafıza; boş durumda ilk tur leer) giderildi. test_kern 450.

**2026-10-20 (gece işi, otomatik)**
- 19.10 22:00 akşam tekrarı + 20.10 08:30 tur. Yazarak yanlışlar: Minderheit (Mindheit, sonra Meistenschaft), Missverständnis (harf düşmesi), fließend (fleißig ile karıştı), essen (das Essen yazdı), bleiben Partizip (gebliebt), Gemeischaft; dikte "bilmiyom". Artikel flaşı: Kunst, Rezept, Diskussion, Missverständnis yanlış; seçmelide yine der Toleranz / der Vorurteil / der Gedicht / der Sonderangebot / das Umgang (-ung/-keit/-schaft → die; Vorurteil/Gedicht/Sonderangebot → das).
- Yoklamada bilip sonra yanlış: yok. 8 düzeltme `feedback.js`'e. DW metni yeni değil (Schuluniform işlenmişti): bunun yerine takılan kelimelere 9 çeviri cümlesi + gloss (Zusammenleben, Umgang, Minderheit, Gemeinschaft, Kunst).
Son incelenen log satırı: 2026-10-20 08:31:55 (tur akis).

**2026-10-21 (gece işi, otomatik)**
- 20.10 08:31'den sonra yeni log satırı yok; yalnız günün içeriği. DW "Fast-Tech und das Problem mit dem Müll" sözlüğünden Goethe B1 kelimeleri: Gerät, Schaden, Reparatur, Umwelt, Qualität, Energie, verursachen, ersetzen → 9 çeviri cümlesi + gloss.
Son incelenen log satırı: 2026-10-20 08:31:55 (tur akis).

**2026-10-22 (gece işi, otomatik)**
- 21.10 21:13–21:19 arası 5 tur (~63 cevap) + 1 gramer. Yazarak yanlışlar: Wettbewerb (die), vorschlagen → empfehlen, anwesend → allerdings, blitzen boşluğuna donnert, sich wundern über → sich reagieren auf, Antrag → Vertrag, adjektiv: gebrahute. Dikte Erziehung: Erzihung / ihre kinder / verantworlich. Bilmiyorum: Bedürfnis, drüben, fett. Seçmelide: Toleranz ve Vorurteil yine yanlış artikel, Gymnastik, Regel, Wetterbericht artikel karışıklığı, feucht ↔ glatt. Artikel flaşı: Rezept (der), Diskussion (das), Missverständnis (die; `leech`), Bargeld, Service yanlış. Yoklamada bilip sonra yanlış: yok.
- 11 düzeltme `feedback.js`'e. DW metni yeni değil (Fast-Tech işlenmişti): bunun yerine takılanlara 6 cümle + gloss (Bedürfnis ×3, Missverständnis, Gymnastik, Wettbewerb). Build / test_grammatik / stichprobe 1 geçti.
Son incelenen log satırı: 2026-10-21 21:19:49 (gram g:adjektiv:60).

**2026-10-23 (gece işi, otomatik)**
- 22.10 19:10–19:14 arası 4 tur (~48 cevap). Yazarak yanlışlar: mild → nass, drinnen (drünnen), zustimmen kökü (zustimmt), können kökü (yalnız konnte), vorstellt (vorgestellt), dikte "ihm" (eben). Artikel flaşı yanlışları: Regel, Erlaubnis, Wetter, Praxis, Heimat (hepsi das/der → die; Heimat `leech`, 3. gün), Behörde (seçmelide der). Seçmeli artikelde yine -ung/-e/-ik/-is gibi die kalıpları karışıyor. `yeni;bekannt` yok.
- 12 düzeltme `feedback.js`'e, Heimat'a kanca. DW metni yeni değil (Fast-Tech işlenmişti): takılanlara 11 çeviri cümlesi + gloss (Heimat ×2, Erlaubnis, Praxis, Behörde, Wetter, mild, drinnen, zustimmen ×2, vorstellen).
Son incelenen log satırı: 2026-10-22 19:14:37 (leech n0524).

**2026-10-25 (gece işi, otomatik)**
- 22.10 19:14 sonrası: 24.10 sabah turu + 25.10 09:24–09:37 (~3 tur). Yazarak yanlışlar: bringne, einspanned, Semestar / Semester↔Seminar karışıklığı, Traning, Wetervorhersage, Qlique; boş/bilmiyorum: Referat, Tüte, Fall, ebenfalls, beweisen. Benzer/zıt karışıklıklar: trocken↔feucht, entlang↔während, Donner↔donnern, Wettervorhersage↔Wetterbericht. Artikel: Roman (das), Vertrag (die). Metinde boşluk 0/2 (Umgang, entsteht). Tablette cümlede çoğul unutuldu. Leech: Situation, eingespannt sein, Wetter, Tablette, Donner, beweisen (6 kanca). Yoklamada bilip sonra yanlış: yok.
- 30 düzeltme `feedback.js`'e, 16 çeviri cümlesi + gloss (Referat, Tüte, Fall ×2, Gefahr, Donner, Situation, Tablette, eingespannt ×2, beweisen ×2, herausfinden ×2, umgehen mit ×2). DW "Kühlschrank / Bedrohung" metni yeni: Gefahr, herausfinden, umgehen mit işlendi.
Son incelenen log satırı: 2026-10-25 09:37:12 (tur akis).

**2026-10-24 (Tuna: "bir yerde hata aldım" + metin ipucu okunmuyor + ses kayıyor)**
- Hata: 24.10 gece işi başarısız. GitHub kullanıcı adı mahmutarsla → TunaArslankaya oldu; zamanlanmış iş eski adla tetiklendi, claude-code-action adı GitHub'da bulamayıp "bot" saydı ve durdu ("actor not found"). `gece.yml`: `allowed_bots: "mahmutarsla"` (yalnız eski ad). Uygulamanın GitHub deposu artık site adresinden (`sahip.github.io`) türetiliyor; README adresi `tunaarslankaya.github.io`.
- Metinde boşluk: anlam ipucu 18 harfte kesiliyor, kutu kelime boyunda kalıyordu ("(biriyle) il…"). İpucu ilk anlam, en çok 24 harf; kutu ipucu kadar geniş.
- Ses: internetten gelen ses (Google Deutsch / Online Natural) seçiliyordu ve geç başlıyordu; soru değişince yalnız `speaking/pending` doğruysa kesiliyordu, başlamamış ses sonraki soruda çalıyordu (gecikmeli sahte ses motoruyla ölçüldü: eski kodda 16 okumanın 8'i başka soruda). Yerel ses önce, kesme koşulsuz, kendiliğinden geçiş başlamamış sesi de bekler (en çok 2,5 sn): yeni kodda başka soruda çalan 0.
- `Kern.aralikKisalt`: zaten vadeli hafızanın vadesini her açılışta yeniden yazmıyor.
- Simülasyon (gerçek kayıt): 118 vadeli, günlük yük ≈ 37; günde 36 cevapla ~120'de sabit, 60 cevapla 2 haftada ~64. `sim_akis`: yük > K iken 7. gün düşüş ölçütü de uygulanmaz (yalnız büyümeme).
- Log: 22.10 19:14'ten sonra cevap yok (23.10 çalışılmadı, seri dondurucusu kullanıldı; 24.10 açıldı, cevap yok).
Son incelenen log satırı: 2026-10-22 19:14:37 (leech n0524).

**2026-10-26 (Tuna: "ne zaman Oturdu'ya geçecek, ne kadar birikme var, dün 180 tekrarda 2 yeni")**
- 25.10: 166 cevap (12 tur + akşam), 2 yeni (birikme varken kota 2). 84/165 soru seçmeli: 26 ısınma (her turun ilk 3'ü), 15 yanlış sonrası tekrar, 11 kurtarma, 10 akşam. Seviye: bm 1 118, bm 2 83, bm 3 17, B4'e ulaşan yok; ilk Oturdu adayları n0361, v069, n0889 (29 gün sonra tam cümle).
- Basamak eşiklerini düşürme denendi, Tuna istemedi ("aşırı kolay yapma"): geri alındı. Yalnız ısınma günün ilk turuna indi (Tuna onayıyla).
- Akşam istisnası: akşam ilk kez sorulup yanlış yapılan öğenin aynı turdaki yeniden sorusu ikinci kez yazıyordu (e2e_aksam yakaladı); istisna artık yalnız ≥ 4 saat önce yazılmış hafızaya.
- `sim_akis` yük tahmini artikel hafızasını da sayar (anlam+artikel ≈ 58/gün; yalnız anlamla 33 görünüp ölçüt yanlış kalıyordu).
- Kota freni (Tuna: "günde 120 cevap veririm, 2 yeni az"): kapasite artık günlük hedef (24) değil, son 7 günde çalışılan günlerin cevap ortalaması (≥ hedef, ≤ 150). Bugün: 2 → 4 (+ bonus turlarda 2–4). Simülasyon günde 120 cevapla: günde 4–9 yeni, vadeli 89 → ~35.

**2026-10-26 (gece işi, otomatik)**
- 25.10 akşam 22:49–22:52: akşam tekrarı (12 cevap, hepsi doğru) + kısa tur (15 cevap, 3 yanlış). Yazarak yanlışlar: Situaiton (yazım), der Not → die Not, glatt → nass, dürfen Präteritum "dark" (durfte). Metinde eben ↔ drüben karışıklığı. Yoklamada bilip sonra yanlış: yok. Leech yok.
- 5 düzeltme `feedback.js`'e. DW metni yeni değil (Kühlschrank işlenmişti; sözlüğündeki kelimeler Goethe listesinde yok): takılanlara 7 çeviri cümlesi + gloss (Situation ×2, Not, glatt ×2, dürfen ×2).
Son incelenen log satırı: 2026-10-25 22:52:45 (tur akis).

**2026-10-26 (Tuna: "bildiğim kelimeler takılıyor, zor sor; cümle yazma yüzeysel") — 5 ajan + denetçi**
- Teşhis: die Quittung (S 1,8) hep B1 seçmelide döngüde; die Praxis artikel flaşı; artikel ve paket hafızasına yanlışlıkla pk kapısı (≤ 7 g) uygulanıyordu; tam cümle (B4) hiç sorulmamış, tam cümle kontrolü tek referans + G.pruefen.
- A (kern): zor soru (`m.ds` ≥ 2 → bm + 1 ipucusuz, turda ≤ 3, doğruysa not 4); artikel / paket kapısız. B (grammatik.js): `G.cumleKontrol` (kelime hizalama, etiketler, geçerli dizilişler, birden çok hedef). C (app.js): tam cümle sonucu kelime kelime renkli, alternatif çeviriler, kademeli yardım (ilk kelime, kelime bankası; ipucu sayılır), zor soru rozeti. D (içerik): ~430 satır: 14 düzeltme, ~316 alternatif (` || `), 215 yeni B1 cümlesi + glossen. E: Cümle atölyesi (js/cumle.js; diz / çevir / kur; hafızaya yazmaz, kur cümlelerini gece Claude düzeltir).
- Denetçi bulguları ve düzeltmeler: zor soruda yazım hatalı ya da itirazlı cevap seviye atlatıyordu → bm yalnız tam doğru + itirazsız; fiil yeri / kelime sırası fast ama m3 → m2 (`cumleYapi`); soru / emir / bitte cümlelerinde varyant dizilişi doğru sayılıyordu → kapatıldı; özne / nur / sonst eksikliği affediliyordu → falsch; mir ↔ mich → falsch + dönüşlü zamir; Bürgeramt çevirisi (vatandaşlık dairesi → nüfus müdürlüğü / belediye vatandaş bürosu), v466 TR, n1316 Vermieterin cümlesi. Alternatif çeviride hedef kelime her hedefin kendi biçimiyle (geregnet / regnete). Zor soruda glossen görünür (hedef dışı kelimeler).
- Açık (düşük): denetçi bulgusu 6 (listede olmayan doğru çeviriler falsch; itirazla kurtarılır, gece Claude haklı itirazları ` || ` ile ekler); eş anlamlı ayrımı için baş harf ipucu zor yazmada da görünüyor.
- Testler: test_kern 515, test_grammatik, test_goc 76, e2e_smoke / ui / aksam, sim_akis geçti.
