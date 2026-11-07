# Yapılanlar (13.10 – 6.11.2026)

Bu oturumda (Claude Code, `claude/relaxed-faraday-v1rtar` → canlı `claude/chat-session-1vghmx`) uygulamaya yapılan her şeyin özeti, tarih sırasıyla.
Ayrıntılı günlük notlar `VERLAUF.md`'de, mimari gerekçeler `TASARIM.md`'de, güncel kurallar `CLAUDE.md`'de.
6.11 araştırmasının 10 raporu: `arastirma/2026-11-06/`.

Site: https://tunaarslankaya.github.io/Almanca-Tekrar/ (yeni sürüm gelmezse Ctrl+Shift+R).

---

## Kısaca

| Tarih | İstek | Sonuç |
|---|---|---|
| 13.10 | "Çok tekrar birikti, yeni kelimeye sıra gelmiyor" | Birikme yayma, Ünite 2 uzatıldı, 56 düzeltme |
| 14.10 | "Uygulamaya girmek gelmiyor, çekici ve verimli olsun" | v4: Bugün ekranı, turlar, seri, puan, PWA |
| 15.10 | "Biliyorum/bilmiyorum kalksın, Almancanın tamamı olsun, Claude gömülsün" | v5: tek hafıza + soru merdiveni, Gramer, Prüfung, Konuşma, gece Claude işi |
| 17.10 | "Niye bu kadar az tekrar" | Yeni kelime kotası düzeltildi |
| 18.10 | "Gramer yavan", "günde 6–7 dk az" | Gramer 29 → 44 konu (~2900 alıştırma), akşam tekrarı |
| 19.10 | "Kelimeler seviye atlamak yerine 60 gün sonraya düşüyor" | Basamak kapısı (`bm`) |
| 24.10 | "Bir yerde hata aldım", ipucu okunmuyor, ses kayıyor | Gece işi düzeldi, ipucu genişledi, ses senkronu |
| 26.10 | "Ne zaman Oturdu'ya geçecek", "bildiğim kelimeler takılıyor, zor sor" | Kota kapasiteye bağlı, zor soru, tam cümle kontrolü, Cümle atölyesi |
| 27.10 | "9 Kasım'da B2 kursu" | B1 sprinti: gramer tanı testi, Bugün'de üç blok, turda gramer |
| 28.10 | "Gerçekten bilmiyorum butonu olsun" | Bilmiyorum her yerde + Bilmediklerim listesi |
| 31.10 | "10 alıştırma bile az, konuyu boylu boyuna çalışmak istiyorum" | Gramer 3208 → 6359 alıştırma, boylu boyuna (derin) mod |
| 5.11 | "Aynı kelimeler geliyor, morgem hata veriyor, çekim hatasına bilmiyorsun diyor" | Kontrol adaleti: yazım / çekim / fazla artikel ayrıldı |
| 6.11 | "B1.2'de kaldım, Sprechen kötü, şıklar kolay, cevabı ezberliyorum" | 10 araştırma ajanı → üretim merkezli tur, ses yuvası, Konuşma, Dinleme |
| 7.11 | "Konuşma kısmı berbat, hepsini kaldır, ayrı uygulamadan çalışıyorum" | Konuşma kaldırıldı; duy-seç dinlemeye taşındı |

---

## 13.10 — Birikme yayma, Ünite 2

- Durum: 535 kartın 359'u gecikmişti; birikme 150'yi aşınca hiç yeni öğe gelmiyordu, Ünite 2'nin 112 kelimesi hiç açılmamıştı.
- **Birikme yayma** (`stauVerteilen`): gecikmiş kartlar günde 45 ile ileri günlere yayılır; birikmede de ünite kelimeleri yarı hızda gelir.
- Ünite 2'nin bitiş tarihi uzatıldı (sonra 15.10'da tarih tamamen kaldırıldı).
- "Metinde" sorusunda dönüşlü fiil yanlış eşleşmesi düzeldi.
- Sonuçlar (332 satır): 56 düzeltme, 10 hafıza kancası, 56 çeviri cümlesi.

## 14.10 — v4 yeniden tasarım

- Ekran kayıtları + 3 Tuna personası + UX ve öğrenme bilimi uzmanı ajanları; 5 konuda web araştırması.
- **Bugün ekranı:** seri 🔥 + dondurucu ❄️, tur halkası, tek "Başla", hızlı / uzun tur, günün işleri, alt gezinti.
- **Tur:** 12 cevap, tur sonu özeti, "bir tur daha", günü kurtar = 10 cevap.
- Puan (emeğe göre), ses / titreşim / konfeti / kombo, ara verip dönünce çift puan.
- Telefonda sonuç paneli altta, büyük Devam, itiraz düğmeleri.
- Notlama düzeltmeleri (yavaş doğru seçmeli artık "zor" sayılmıyor: birikmeyi uygulamanın kendisi büyütüyordu).
- Artikel 60 sn oyunu, İlerleme sayfası, sade Ayarlar.
- **PWA:** manifest, service worker (çevrimdışı açılış), ikonlar, ana ekrana ekleme.

## 15.10 — v5: tek hafıza + soru merdiveni

- Araştırma: öğrenme bilimi, Almanca didaktiği, Anki / WaniKani / Duolingo / Clozemaster incelemesi, log analizi, Goethe B1 sınavı.
- **Çekirdek `js/kern.js`:** her kelimenin tek hafızası (anlam `m`, isimde artikel `art`, düzensiz fiilde kök `S.kok`).
  - Soru merdiveni: seç → yaz → cümlede boşluk → tam cümle.
  - Notu sistem verir; günde tek kalıcı yazım.
  - Eski 547 kart yeni hafızaya taşındı (göç, yedekli).
- "Biliyorum / bilmiyorum" ön testi ve kontrol listeleri kalktı.
- **Gramer bölümü** (`js/gramer.js`): 29 konu / ~870 alıştırma, konu başına FSRS, hayalet tekrar.
- **Prüfung** (`js/pruefung.js`): Lesen tam / mini prova, Schreiben Teil 1–3 süreli, Sprechen sınav akışı.
- **Konuşma:** shadowing, Sprechen Teil 1–3 kartları, Redemittel.
- Okuma: DW metinlerinin gerçek sesi.
- Üniteler: Netzwerk neu K9–K12 (kapalı, Ayarlar'dan açılır).
- **Gece Claude işi** (`.github/workflows/gece.yml`): her gece 04:17'de log'a bakar, düzeltme ve cümle yazar, DW / Klexikon metni çeker. Uygulamada "Claude'a gönder" düğmesi.
- Senin kararların: günlük hedef 2 tur, yeni kelime tavanı 6, Ünite 2 dursun, repo açık kalsın (anahtar yok).
- Son simülasyon: 3 sınayıcı ajan 46 bulgu çıkardı, 15'i kritik / yüksek; hepsi düzeldi. Örnekler: arka planda kapanınca kaybolan cevap, Android geri tuşu, Bilmiyorum'un anlam hafızasını sıfırlaması.

## 17.10 — "Niye bu kadar az tekrar"

- Yeni kelime kotası 2'de takılıydı (genç kelime freni). Fren artık yalnız birikme varken çalışıyor; "+3 yeni" günde 3 kez.
- 11 düzeltme, 14 cümle, 2 kanca.

## 18.10 — Gramer + akşam tekrarı

- **Gramer 29 → 44 konu, ~2900 alıştırma.** Yeni türler: Türkçe → Almanca çeviri, çok boşluklu metin, eşleştir, kategori, dikte.
- Motor: cümle dizmede virgül yok sayılır, kaynaşmamış edat (in dem / im) küçük hata.
- **Akşam tekrarı:** sabah çalıştıysan akşam isteğe bağlı kart çıkar; o gün yeni / yanlış kelimeler bir kez daha.

## 19.10 — Basamak kapısı

- Sorun: göçten gelen yüksek hafıza değerleri ve tek doğru yazma, kelimeyi 57–60 gün sonraya atıyordu; cümle basamağı hiç sorulmadan "Oturdu" görünüyordu.
- Çözüm `m.bm` (kanıtlanan en yüksek basamak):
  - sonraki soru en çok bir basamak yukarı;
  - aralık basamağa göre: 7 / 14 / 30 / 60 gün.
- Eski kayıtlarda 62 kelimenin vadesi kısaldı.

## 24.10 — Hata + ses

- Gece işi GitHub kullanıcı adı değişince ("TunaArslankaya") durmuştu → düzeldi. Uygulama depoyu site adresinden buluyor.
- Metin boşluğu ipucu 24 harfe çıktı, kutu ipucu kadar geniş.
- Ses: yerel Almanca ses öncelikli; bir önceki sorunun sesi artık sonraki soruda çalmıyor.

## 26.10 — Kota, zor soru, tam cümle

- Kota kapasitesi son 7 günün cevap ortalaması (günde ~120 cevapta 4–9 yeni).
- Basamak eşiklerini düşürmeyi istemedin ("aşırı kolay yapma") → geri alındı. Isınma yalnız günün ilk turunda.
- **Zor soru:** art arda 2 doğrudan sonra bir üst basamaktan, ipucusuz soru (turda ≤ 3). Doğruysa seviye atlar.
- **Tam cümle kontrolü** `G.cumleKontrol`:
  - kelime kelime renkli fark ve hata etiketleri (edat, dönüşlü zamir, fiil yeri, kelime sırası …);
  - geçerli başka dizilişler de doğru sayılıyor;
  - ~316 alternatif çeviri eklendi.
- **Cümle atölyesi** (`js/cumle.js`): diz / çevir / kur.
- İçerik: 215 yeni B1 cümlesi + gloss.

## 27.10 — B1 sprinti (B2 kursu öncesi)

- Araştırma: günde 4–15 dk çalışıyordun; cevapların %66'sı tanımaydı; 44 gramer konusundan 42'si hiç açılmamıştı.
- **Gramer tanı testi:** konu başına 1–2 yazarak soru; bildiğin konu açılır, bilmediğin sprint sırasına girer.
- **Bugün'de sprint ekranı:** geri sayım + üç blok (kelime · gramer · beceri), hedef tarihte geçiş kartı.
- Turda 5. ve 10. adımda gramer sorusu.
- 4 yeni konu (nominal-verbal, praep-nomen-adj, es-korrelat, vergleich) → 48 konu, 3208 alıştırma.
- Kelime sırası sıklığa göre ("sık 300").
- Dikte: noktalama eksikliği artık küçük hata değil, doğru. Gece işindeki tırnak hatası düzeldi.

## 28.10 — Bilmiyorum + gramer adaleti

- Gramerde yalnız zarf / parçacık eksikse (noch, schon, auch …) küçük hata; tanı testinde konu dışı küçük hatalar konuyu "zayıf" yapmaz.
- `von + Dativ` / `wegen + Dativ` → küçük hata ("konuşma dili").
- Tek fark fiil çekimiyse (sind → ist) küçük hata.
- **Bilmiyorum düğmesi:** ana tur, gramerin her türü (yazı kutusu yoksa `0` tuşu), Cümle atölyesi.
- **Zayıflar → Bilmediklerim** listesi: başka günlerde iki kez doğru yaparsan "artık biliyorsun". Gece işi bilmediğin gramer bölümlerine 3–5 yeni alıştırma yazar.

## 31.10 — Gramer boylu boyuna

- **Havuz 3208 → 6359 alıştırma.** 8 içerik ajanı yazdı, 8 denetçi ajan satır satır kontrol etti (~163 düzeltme).
- Her konu bölümünde (teil) en az 22 alıştırma: kolay ≥ 4, orta ≥ 9, zor ≥ 7.
- Dönüştürme yönergeleri Türkçe.
- **Boylu boyuna (derin) mod:** konu bölüm bölüm kolaydan zora; ustalaşınca bölüm tamam, yanlışta bölüme dönüş.
  - Giriş seti 10, tekrar seti 5, set sonunda "5 alıştırma daha".
  - Öz denetim aracı: `node tools/gramer_ozkontrol.js`.

## 5.11 — "Sonuçlarıma bak" + kontrol adaleti

- 167 satır incelendi: 39 düzeltme, 19 cümle, 5 kanca (Feuerwehr, Apotheke, Kunst, Toleranz, Missverständnis).
- Haksız "yanlış"lar düzeldi:
  - doğru kelimenin yanlış eki (fett → fette, Schmerzen) artık **çekim hatası** (küçük hata), "kelimeyi bilmiyorsun" değil;
  - yer değiştiren harf (Gerihn, morgem gibi tek harf) **yazım hatası**;
  - boşluğa artikelle yazılan doğru isim → "fazla artikel" (küçük hata);
  - gramer cümlesinde tek kelimelik yazım hatası küçük hata;
  - nokta olmadan cümle doğru.
- "Aynı kelimeler" sorusunun cevabı: çoğu artikel flaşıydı. 21 isimde artikel ≥ 4 kez yanlış (Geduld 12, Rezept 11 …); artikel hafızası sıfırda kalıp her gün geliyordu.
- O gün tekrar yükü: 270 öğe; vadeli 62 anlam + 37 artikel.
- Ayarlar → yeni kelime / gün'e 10 seçeneği.

## 6.11 — B1.2 sonrası büyük değişiklik

### Araştırma (10 ajan, raporlar `arastirma/2026-11-06/`)

- 3 ajan kelime ezberleme: `kelime-1/2/3.md`.
- 4 ajan konuşma, telaffuz, dinleme ve ses tekniği: `konusma-akicilik.md`, `telaffuz.md`, `dinleme.md`, `ses-teknik.md`.
- 3 ajan log analizi: `log-zaman.md`, `log-hafiza.md`, `log-hatalar.md`.

### Teşhis (senin verinden)

- Son 14 günde cevapların %40'ı seçmeli, %93'ü doğru. Şıkların ikisi aynı kelimenin yanlış artikelli / edatlı ikiziydi, yani cevap şıklardan bulunuyordu.
- Seçmeli doğrusu hafızayı büyütüyordu: yazmada %90 beklenirken gerçek %53. Yazma doğruluğu 6 haftadır %53–57.
- Yanlıştan sonraki tekrar, ısınma ve kurtarma hep seçmeliydi; 276 kelimenin ~110'u hiç yazılmamıştı.
- Aynı cümle 8 kereye kadar geldi.
- Düzeltme panelinde ortalama 2 sn kalıyordun.
- Günlük aktif süre 28 → 8 dk düştü; kopmaların çoğu pazartesi.
- Konuşma bölümü hiç açılmamıştı, dinleme günde bir dikteydi.
- Artikel tekrarla düzelmiyordu (%68 → %67); yanlışların yarısı "der" tahmini.

### Uygulandı

**Kelime ve fiil**
- Seçmeli yalnız tanıtım günü, ilk tekrar ve Hızlı turda; zorlandığın yerde ipuçlu yazma.
- Şıklar gizli: "Önce aklından söyle", sonra Enter / Boşluk.
- Yanlış şıklar karıştırdığın kelimelerden ve biçimce benzer kelimelerden geliyor; aynı kelimenin ikizi yok.
- Yanlışta Devam 2,5 sn kilitli, "doğrusunu bir kez yaz" kutusu var. Tanıtım kartı ≥ 4 sn.
- **Cümle çeşitliliği:**
  - aynı cümle 30 günde en çok 2 kez;
  - kalıp cümleleri ve çapraz cümle dizini havuzda;
  - yazma ipucu dönüşümlü (Türkçe kelime → Türkçe cümle → Almanca cümle);
  - 206 kelimeye 660 yeni cümle + gloss (her kelimede ≥ 5 cümle).
- **Yeni soru türleri:**
  - artikel öbek içinde ("mit ___ Rezept" → dem);
  - fiil + edat kalıbı;
  - tek çekim (er-Präsens / Präteritum / Perfekt);
  - artikel yanlışında aynı kuraldan 2–3 isimlik mini set;
  - karışan iki kelimeyi ayırt etme.
- -anz / -enz → die kuralı; der Pate n-Deklination.

**Dinleme** (`js/dinle.js`)
- Turda ses sorusu: sesten kelime tanıma, sesli boşluk, cümle diktesi. ↑ ile tekrar dinle.
- Okuma → **Dinleme modu**: tahmin → metinsiz → boşluklu → metinle; hız 0,75 / 1; 5 sn geri.
- Dikte kontrolü artık hâl / çekim / yanlış kelimeyi ayırıyor ("yazım" saymıyor).

**Konuşma ve telaffuz** (`js/konus.js`)
- Turda ikinci ses sorusu gün gün değişir:
  - **Söyle:** Türkçe cümle → sesli Almanca, sonra doğrusu · senin kaydın · doğrusu; not yok.
  - **Duy-seç:** minimal çift ya da vurgu (Miete / Mitte …); `quellen/minimalpaare.txt`.
- **Konuşma bölümü** sekmeleri:
  - Kalıplar (Türkçe → 3 sn içinde Almanca);
  - Söyle;
  - Shadowing (cümle gizli);
  - Teil 2 4/3/2 (1 dk plan, 3:00 / 2:15 / 1:30; ses-zamanı oranı, duraklama, en uzun akış; kayıt arşivi);
  - Teil 1 / 3, Dinle, İlerleme.
- Transkript (yazıya dökme) yok, çünkü faydalı bulmadın. Öz-değerlendirme listesi kalktı.

**Bugün / İlerleme / Ayarlar**
- "Bugün X dk" çizgisi (hedef 20 dk), pazartesi 1 tur yeter, "2 dk konuş" kartı.
- İlerleme'de haftalık "üretim doğruluğu" (seçmeli hariç).
- Ayarlar: sesli soruları aç / kapa, ses hızı, Almanca ses seçimi.

**Denetim**
- 2 bağımsız denetçi ajan ~20 hata buldu, hepsi düzeldi. Örnekler:
  - yeni kelime turda 6 kez geliyordu → turda en çok 2 yeniden sorma;
  - ses sorusunda kilit yoktu;
  - ipucu cümlesinde cevap görünüyordu;
  - mobilde tablo taşıyordu.

### Simülasyon (14 gün)

- Turda seçmeli %37 → ~%10, yazma %18 → ~%36, ses ~%11.
- Vadeli yük 131 → ~173: üretim zorlaştığı için artar, kota kendiliğinden kısar.
- **Beklenen:** doğruluk oranın ~%90'dan ~%60'a düşecek. Bu normal; artık ezber değil üretim ölçülüyor.

### Testler (son koşu, hepsi geçti)

`test_grammatik`, `test_kern` (665), `test_goc` (76), `test_dinle` (13), `e2e_smoke`, `e2e_ui`, `e2e_aksam`, `e2e_cumle`, `e2e_fiil_artikel`, `e2e_dinle`, `e2e_konus` (7.11'de kaldırıldı), `e2e_ek`, `sim_akis`.

---

## 7.11 — Konuşma kaldırıldı

- Tuna konuşmayı ayrı uygulamada çalışıyor: Konuşma bölümü (Kalıplar, Söyle, Shadowing, Teil 2 4/3/2, Teil 1 / 3, İlerleme, kayıt arşivi), turdaki "söyle" sorusu, mikrofon kodu, Bugün'deki "2 dk konuş" kartı ve Prüfung → Sprechen kaldırıldı (`js/konus.js`, `tests/e2e_konus.js` silindi).
- Duy-seç (minimal çift / vurgu, log `hoer`) dinleme sorusu olarak `js/dinle.js`'e taşındı; turun ikinci ses sorusu artık her gün duy-seç (Almanca ses yoksa dinleme).
- Sprint "Beceri" bloğunda konuşma günü yerine DW Dinleme modu.
- Eski `sprechen` log satırları ve kayıtlı konuşma verisi dokunulmadan duruyor.

## Senin için öneriler (raporlardan)

1. **Önce sesli söyle:** şıkları açmadan cevabı sesli söyle.
2. **Yanlışta 5 saniye:** Devam'a basmadan doğrusunu artikeliyle sesli söyle, kafanda bir cümleye koy.
3. **Günde 20–25 dk:** 8 dakika yetmiyor. Örnek: sabah 15 dk tur, akşam 10 dk konuşma.
4. **Pazartesi 1 tur:** seri ve tekrar zinciri kopmasın diye bilinçli olarak az.
5. **Yazmada 15 sn'yi geçme:** 10–12 sn'de gelmiyorsa "Bilmiyorum"a bas ve doğrusunu oku. 15 sn üstü cevapların %54'ü zaten yanlış.
6. **Dinleme:** DW Top-Thema'yı Dinleme modunda dinle, haftada 2–3 metin.
7. **Sprechen:** haftada 2–3 kez Teil 2 4/3/2, yani aynı konuyu üç kez, giderek kısalan sürede anlat.
8. **Telaffuz:** Goethe Aussprachetrainer (ücretsiz), shadowing.
9. **Artikel:** "der" diye tahmin etme. Sonek kurallarına güven (-ung / -heit / -keit / -schaft / -ion / -anz / -enz → die, -chen / -lein → das); bilmiyorsan Bilmiyorum.
10. **Ölçü:** seçmelideki yüksek doğruluk seviyeni göstermez; asıl ölçü İlerleme'deki üretim doğruluğu.

## Açık kalanlar

- "Bugün X dk" süresi cihaz başına sayılıyor, cihazlar arasında toplanmıyor.
- `e2e_ui`'de güven kartı testi ~8'de 1 zamanlama yüzünden düşüyor; uygulamada en kötü ihtimalle kart bir kez daha görünür.
- Kotayı üretim doğruluğuna bağlamak düşünüldü, yapılmadı.
- 33 DW metninin sesi gece işiyle doluyor.

## Güvenlik

- GitHub anahtarı yalnız tarayıcıda (`localStorage`), Claude anahtarı yalnız GitHub Secrets'ta; repoda anahtar yok. Anahtarları sohbete yapıştırma.
