# Almanca Tekrar — Claude için çalışma notu

## Öğrenci

- Tuna. Almanca A2 (Goethe A2 var), hedef B1. Bremen'de dil kursu + Uni Bremen Vorbereitungsstudium.
- İletişim: Türkçe, samimi, direkt. Uzatma, tekrar etme, lafı dolandırma.

## Kurallar (hep uy)

1. Her ismin artikeli yanında (der / die / das). Artikelleri bilmiyor.
2. Düzeltmeler soru soru, tam liste: kendi cevabı → doğrusu → kısa açıklama.
3. Her şey yerel HTML'de; cevaplar `log/log.csv`'ye yazılır, Claude oradan okuyup yeni içerik ekler.
4. Günlük hedef (bugün x / 20) ve geçmiş veriler görünür.
5. Ana menü "Çalış": karışık sorular (cümle, kelime, yardımsız anlam).
6. Anlam soruları yardımsız: sadece fiil + edat.
7. Cümlede fiil önce verilir, ipuçları çalıştıkça azalır.
8. Notu sistem verir (öz-değerlendirme yok); doğruda kendiliğinden geçer, yanlışta Devam. Soru başına tek itiraz: "yazım hatasıydı" / "aslında doğru" (ilk karar log'da `öneri:`).
9. Bilmediği kelimeler ayrı başlıkta (Zayıflar), doğru cümlelerde boşluk doldurarak tekrar.
10. Kelimeler Goethe-Zertifikat B1 Wortliste'den.
11. Cümle bol olsun, sürekli yenisi eklensin.
12. Log tutulsun.

## Yapı

- `index.html` + `js/app.js` (arayüz, kuyruk, log) · `js/grammatik.js` (çekim, cümle üretimi, kontrol) · `js/fsrs.js` · `js/cumle.js` (Cümle atölyesi: diz / çevir / kur; app.js'e `Cumle.init(api)` kancasıyla bağlı)
- Uygulama (PWA): `manifest.webmanifest` (`id` `/Almanca-Tekrar/`), `sw.js` (kabuk önbellekten anında, yenisi arka planda; önbellek listesi ve sürümü `tools/build.py` yazar: elle düzenleme), `img/` (ikonlar; kaynak `img/icon.svg`).
  Cihazlar arası: açılışta ve uygulamaya dönünce `log/zustand.json` çekilip kart kart birleştirilir (`zustandBirlestir`: son cevaplanan kazanır), yazmadan önce de birleştirilir; GitHub okumaları `cache: 'no-store'`.
  v5 şeması (`S.surum` 4, `js/kern.js`): açılışta `retGoc` → `kernAc` (`Kern.goc`: öğe hafızası `items[id].m`/`art`, `S.kok`, `pakete[pid].m`; öğe başına idempotent; ilk göçte bir kez `akt;goc4` satırı, `S.kartenV3` dondurulmuş kopya; `Kern.v3Yetis`: göçten sonra `karten`'e yazılan cevaplar hafızaya). Birleştirme `Kern.birlestir` (alan alan; gün sayaçları cihaz başına `S.tageC[gün][cihaz]`, `S.tage` toplamdan türetilir; cihaz kimliği `localStorage` `almanca-tekrar-cihaz`). Yazma koruması `Kern.yazabilir` (uzak surum > 4 → dokunma; yerel neredeyse boş → yalnız birleştir); ilk v4 yazımından önce uzak v3 kaydı bir kez `log/zustand_v3.json`. `S.log` ayrı anahtarda (`almanca-tekrar-log`). Test: `node tests/test_goc.js`.
  Ünite dosyasında `@kapitel N` (Netzwerk neu Kapitel; gramer konuları `@kapitel` ile eşleşir) ve `@inaktiv` (Tuna Ayarlar → Üniteler'den açana kadar kapalı; `S.unite[id].aktiv`). Okuma: DW metinlerinde `audio` (mp3 adresi, `tools/dw_topthema.py`) oynatıcı; yoksa TTS "sesli oku".
  Kabuk (`js/app.js` "Uygulama kabuğu"): Bugün ekranı (`renderAna`), tur (`session.tur`, `turBaslat`, `turSonuRender`, varsayılan 12 cevap, `S.einst.tur`),
  seri (`seriSay`, `seriBakim`: dondurucu `S.seri.frz` her 7 günde +1, en çok 2; dün kaçtıysa bugün 2 turla onarım), puan (`xpEkle`, `S.xpToplam`, `tage[gün].xp`;
  emeğe göre: tanıma 5, yazma 10, cümle/çekim 15, liste kalemi 2, okuma 25, yazma 50; ara verip dönünce ilk tur ×2), efektler (`ton`, `titret`, `konfeti`, kombo),
  günlük hedef = `S.ayar4.turHedef` (varsayılan 2; Tuna 15.10: önce az, rutin oturunca artırılır; `ayar4.rutin` bir kez uygular, `ayar4.secildi` elle seçim) × tur boyu (`gunHedef`; Ayarlar'da 2–5 tur), günü kurtarma = `MIN_TAG` (10) cevap.
  Günün ikinci işi (`ikinciIs`): yalnız günlük hedef bitince Bugün'de, isteğe bağlı: vadeli gramer konusu, yoksa gün gün gramer / okuma / yazma (yazma haftada bir); yapıldıysa ✓.
  B1 sprinti (27.10, B2 kursu 9.11.2026): `S.sprint = { hedef, son_yeni, acik }` (Ayarlar → kurs tarihi / hazırlık modu). Açıkken Bugün'de "B2 kursuna N gün" + üç blok (Kelime turları · Gramer `Gramer.blokBaslat` · Beceri gün gün DW okuma / yazma / konuşma Teil 2 / Cümle atölyesi); "Bugün tamam" üç blok bitince; ikinci iş kartı yok. Hedef tarihte bir kez geçiş kartı, sonra normal mod. İlerleme'de gramer haritası, "sık 300", B1 yolu yalnız seviye 3.
  Gramer sprinti (`js/gramer.js`): tanı testi (konu başına 1–2 yazarak soru, `SPRINT_SIRA`; ikisi doğru → `biliyor`, kısa vade, bedava seviye yok), günde 1 yeni konu (+1 isteğe bağlı), `son_yeni`'den sonra yeni konu yok; API `sprintDurum` / `blokBaslat` / `turSorusu` / `turRender`. Ana turda adım 5 ve 10'da açık konulardan yazarak gramer sorusu (`Kern.sec` `o.gramVar`, `GRAM_ADIM`; öğe hafızasına yazmaz; tur satırında `gram:doğru/toplam`).
  Kelime sırası: build her kayda `frek` (DW + Klexikon + Goethe Lesen metinlerinde geçme) ve `sik` (seviye 3'te en sık 300) yazar; yeni sıra yarım → okurken bakılan → (aktif ünite 2 : sık 1 karışık) → Goethe sırası; aynı ünite grubundan (`alan`) günde ≤ 2 yeni. Artikel yanlışında sonek kuralı / "der değil" notu.
  Akşam tekrarı (`aksamKarti` / `aksamDurum`, bölüm `aksam`, `Kern.aksamAdaylar` / `aksamUygun` / `ilkCevap`): öğrenme gününün ilk cevabı 13:00'ten önce ve üzerinden ≥ 8 saat geçtiyse, aday ≥ 3 ise Bugün'de ikinci iş kartının üstünde isteğe bağlı kart (hedef bitmiş olsun olmasın; sabah görünmez; turu bitince ✓).
  Adaylar (bir akşamda en çok 15, sorulanlar dahil): bugün tanıtılan → bugün yanlış / fast (log ya da hafıza `lastG ≤ 2`, bugün) → R < 0,9 (vadesiz de); oturmuş, bugün doğru, R ≥ 0,9 girmez. Tur `Kern.sec` `o.aksam` dalı (kuyruk → sıradaki aday: bugün yeni olanda %75 `yaz0`, yoksa merdiven → "şimdilik bu kadar", yeni / metin / flaş yok). Hafıza istisnası `Kern.uygula(…, { aksam, aksamYanlis })`: bugün yeni ya da yanlış öğenin m / art'ı akşam bir kez daha yazılır (`h.aksam = gün`, vade ≤ yarın 04:00; yalnız o gün ≥ 4 saat önce yazılmışsa); diğerleri günde tek yazım kuralında. Gün sayacına normal sayılır, bonus kota artmaz. Test: `node tests/e2e_aksam.js [klasör]`.
  Gezinti (v5): Bugün · Kelimeler (`#/liste`, seviye sekmeleri, satıra dokununca alt sayfa) · İlerleme (`#/gecmis`: seri takvimi, seviyeler, artikel aynası, biçim başına başarı, B1 yolu) · Diğer (`#/diger`: yan bölümler, Serbest pratik, Zayıflar `#/zayif`, Geçmiş `#/kayit`, Ayarlar `#/ayar`). Tur içinde tost yok (kuyruk tur sonunda); Devam tek bileşen `.devam-btn` (`devamBtn`).
  Görünüm adresi `#/liste` (öğe kimliğiyle çakışmasın). Testte başlatma: `window.__tekrar.starte(mod, boyu)`; `__tekrar.Kern`, `__tekrar.saat(ms)` (zaman kaydırma), `__tekrar.ot` (oturum).
  Kayıt / inceleme: `node tools/film.js <klasör> mobil|masaustu <adım> <doğruluk> <gün>` her adımın ekran görüntüsünü ve durumunu kaydeder (adımlar `tests/surucu.js` ortak sürücüsüyle).
- Elle düzenlenen kaynaklar: `quellen/verben.txt` (**yeni fiil hep sona**: kimlik satır sırasından; Goethe'de yoksa 5. alanda çekim), `quellen/nomen.txt`, `quellen/nomen_extra.txt` (yeni isim sona), `quellen/rahmen.txt`,
  `quellen/woerter.txt` (sıfat/zarf/bağlaç…, **yalnız sona ekle**: kimlik satır sırasından), `quellen/pakete.txt` (konulu paketler, yeni paket sona),
  `quellen/wort_saetze.txt` (isim / diğer kelime çeviri cümleleri: `öğe | kelime | Almanca | Türkçe`),
  `quellen/saetze_refl.txt` (dönüşlü fiil çeviri cümleleri), `quellen/aufgaben.txt` (serbest yazma görevleri, sona ekle),
  `quellen/themen.txt` (17 B1 konusu ve öğe → konu ataması; "Konu" bölümü bunu kullanır),
  `quellen/saetze.txt` (çeviri cümleleri: `fiil | Almanca | Türkçe`; cümle sorusu Türkçeyi gösterir, Almancasını yazdırır)
- `python3 tools/build.py` index.html'deki js/css/daten bağlantılarına `?v=` sürüm özeti de yazar (önbellek): `js/app.js` ya da `css/stil.css` değişince de çalıştır.
- Üretilen: `daten/verben.js`, `daten/nomen.js`, `daten/woerter.js`, `daten/pakete.js`, `daten/saetze.js` → **elle düzenleme**, `python3 tools/build.py` çalıştır.
- Elle: `daten/feedback.js` (Claude'un düzeltmeleri, Geçmiş sekmesinde görünür), `daten/kancalar.js` (takılan kelimelere hafıza kancası).
- Gece işi (`.github/workflows/gece.yml`, GitHub Actions, Claude Code aboneliğiyle: secret `CLAUDE_CODE_OAUTH_TOKEN`): her gece 04:17 Berlin `tools/istem_gece.md` ile "sonuçlarıma bak" sürecini kendisi yapar, DW/Klexikon metinlerini çeker, build eder, commit'ler. Uygulamadaki "Claude'a gönder" `gorev=geribildirim` ile tetikler (`tools/istem_geribildirim.md`). Düzeltmeler `daten/feedback.js` → `node tools/feedback_json.js` → `log/feedback.json` (uygulama açılışta çeker, Geçmiş'te gösterir). Gece işi `js/`, `css/`, `index.html`, `tools/` dosyalarına dokunmaz.
- `log/log.csv` (uygulama yazar, `;` ayırıcı, UTF-8 BOM): `zeit;modus;id;item;frage;antwort;ergebnis;loesung;notiz`
  - v5 (öğe başına tek hafıza; `basamak:` içeren satır v5 anlamındadır). Biçim → modus / id (`öğe:tür`):
    `sec` / `anla` / `metinde` (B1 seçmeli) → `erk` (isim / diğer) · `bed` (fiil); `yaz0` / `yaz` / `yoklama` (B2 yazma) → `wort` (isim, artikelli) · `abr` (fiil + edat + hâl) · `prod` (diğer);
    `bos0` / `bos` / `cumle` (B3 cümlede boşluk, B4 tam cümle) → `nsatz` · `satz` (n-Dekl. `ndek`, dönüşlü zamir `refl`, Goethe boşluğu modus `luecke` id `:satz`);
    `metin` (tur / paket metninde boşluk) → modus `luecke`, id `:nsatz` / `:satz` (`kaynak:<metin>`); `artikel` (der/die/das flaşı) → `art`; kök → `stamm` (id `fiil:stamm`, notiz `kök:fahren`; yeni kökte cümlede Partizip, sonra er-Präsens + Perfekt, Präteritum yalnız sık fiillerde).
  - Zorunlu notiz başı (bu sırayla): `basamak:B2 | bicim:yaz0 | not:m3,a1 | R:0.84 | S:19.7` (m anlam, a artikel, k kök; R sorudan önce, S sonra; `not:-` = hafızaya yazılmadı).
    İsteğe bağlı: `tekrar:1` (yanlıştan sonra aynı turda yeniden) / `ikinci` (yeni kelimenin ikinci hatırlaması) / `parti` (tanıtımdan sonraki mini soru), `hafıza:yazılmadı` (günde tek kalıcı yazım:
    aynı gün ikinci cevap yalnız log'a), `yoklama`, `kurtarma`, `ısınma`, `akşam` (akşam tekrarı turu; bugün yeni / yanlış öğede `not:` dolu = akşam istisnasıyla ikinci yazım), `zor` (zor soru: ipucusuz, bir üst basamak), `yardım:ilk[,banka]` (tam cümlede ilk kelime / kelime bankası kullanıldı; ipucu sayılır), `kısmi` (yazım / yavaş: not 3 ama büyüme az), `kapı:7g` / `kapı:14g` (erken üretim kapısı), `kaynak:`, `arka planda kapandı` (sonuç paneli açıkken uygulama arka planda kapandı: cevap sonraki açılışta işlendi; `localStorage` `almanca-tekrar-bekleyen`); ardından hata etiketleri, `sek:`, `ipucu:` (gerçek seviye), `öneri:` (itirazda sistemin ilk kararı), `sayılmadı`, `yavaş`, `bilmiyorum`.
  - ergebnis sistemin son kararı: `richtig` / `fast` / `falsch`. Yalnız artikel hatası (kelime doğru) her zaman `fast` + `artikel der → die` ya da `artikel eksik`. Yazım hatası `fast` + `yazım`, umlaut `fast` + `umlaut`, fiilde hâl `fast` + `hâl`, edat / sich `falsch` + `edat` / `dönüşlü`.
  - Yeni kelime: `yeni` (ergebnis `neu` = tanıtım kartı, notiz `bicim:tanit | parti`; `bekannt` = yoklamada bildi). `kontrol` ve `pretest` satırları artık üretilmez (eski satırlar geçmişte kalır).
  - Serbest yazma: `text` (id `a07` = `quellen/aufgaben.txt` görevi; antwort = metin, paragraflar ` ¶ `; notiz: kelime sayısı, zorunlu kelimeler)
  - Kalıplar: `quellen/kaliplar.txt` (fiil | Almanca | Türkçe; "Kalıplar" bölümü, "yazmaya ekle" ile yazma ekranına), `quellen/redemittel.txt` (yazma türü / konu kalıpları)
  - Okuma: `lesen` (Klexikon / DW metni okundu: ergebnis `gelesen`; Goethe Übungssatz görevi `quellen/goethe_lesen.json`: id `ge2:7` = ge2'nin 7. sorusu, antwort seçtiği, loesung doğrusu, görev sonu id `ge2` notiz `puan:2/3`. Metinler: `tools/klexikon.py`, `tools/dw_topthema.py` — okuma metnini ve sorularını Claude yazmaz), `lesen-wort` (metinde anlamına baktığı kelime: bilmediği kelimeler!)
  - Günün fiil metni: `fiilmetin` (her gün 04:00'te değişen gerçek metin, A2/B1 düzensiz fiillerin çekimli hâlleri işaretli; id = fiil, frage `form → hedef | cümle` (hedef: metindekinden başka zaman Präsens / Präteritum / Perfekt, ya da `mastar`), antwort seçtiği form, loesung doğru form; metin sonu id = metin, ergebnis `gelesen`, notiz `puan:x/y`). Çekim (`stamm`) sorusu yalnız düzensiz fiillerde ve formları görüldükten sonra (`S.formGesehen`).
  - Ünite: `unite` (kitaptaki konunun listesi; `quellen/uniteN.txt` + `uniteN_texte.txt` + `uniteN_aufgaben.txt` → `daten/unite.js`; id `u1-005` = kelime, frage = basamak `intro/mc/mcrev/art/lk/typ/formen` ya da `text/match/diktat/ordnen`; id `u1:t3` = 4. boşluklu metin, notiz `puan:x/y`; `u1:sort` ayırma sonucu (eski; v5'te ayırma ve ünite basamakları yok: ünite ekranı kelime listesi + metinler + yazma, kelimeler turda öğrenilir); yazma görevleri modus `text`, id `u1-a1`).
  Yeni ünite: Tuna listeyi verince `quellen/uniteN.txt` (biçim dosyanın başında; `@bis YYYY-MM-DD` = o gün bitince kendiliğinden kapanır), 6–8 boşluklu metin, 2 yazma görevi; `tools/build.py`'de `unite_lesen(N)` ekle.
  Metindeki boşluk çekimli olabilir (Knödeln, creme, gewundert): kelimeye kendiliğinden bağlanır (`uKand`); görmediği kelime boşluk olmaz. Goethe listesinde olmayan isimler `nomen_extra.txt`'e, sıfat/zarf/kalıp `woerter.txt` sonuna (her ünite kelimesinin ana listede karşılığı olsun).
  Aktif ünitenin kelimeleri Çalış'ta yeni öğe olarak önce gelir, metinleri boşluklu metin havuzuna girer. Ünite bitince `@geschlossen` ekle: açılışta ünitede çalışılmış (basamağa girmiş) kelimeler tekrar sistemine alınır, çalışılmayanlar alınmaz, bölüm gizlenir. Ünite 1 kapandı (15 kelime aktarıldı). Ünite 2 (fit und gesund bleiben, 112 kelime, 8 metin) açık, bitiş tarihi yok (Tuna 15.10: şimdilik dursun, hızlandırma yok; kapatmak isterse Ayarlar → Üniteler).
  - Paket: `paket` (id `p01:3` = 1. paketin 4. boşluğu, notiz başında hafıza alanları; paket sonu `p01:pak`, notiz `puan:%`, `önce okudu`; paket hafızası `S.pakete[pid].m`)
  - Gramer: `gram` (id `g:<konu>:<sıra>` alıştırma, item `konu/teil`, notiz `tür:luecke | z:2 | <hata etiketi> | ghost:N | ipucu:1 | öneri:X | sek:N`; `g:<konu>` tanıtım `neu` / okudu `gelesen` / set sonu `giriş`|`tekrar`|`kontrast` → ergebnis set notu, notiz `puan:x/y | teil:…`). İçerik `quellen/grammatik/<konu>.txt` (biçim ve tekrar kuralları: `quellen/grammatik/FORMAT.md`; **yeni alıştırma hep sona**: kimlik satır sırasından), build → `daten/grammatik.js`, motor `js/gramer.js` (konu başına tek FSRS kartı `S.gram.konu[id].karte`, teil istatistiği, hayalet `S.gram.ghost`). Takılan teil: `leech` satırı id `g:<konu>:<teil>` → o teil'e 3–5 yeni alıştırma yaz.
    Tanı testi (B1 sprinti, 28.10): madde id `g:<konu>:tani:<n>` (item `konu/teil`, notiz `tanı:1|2 | tür:… | z:… | <etiket> | bilmiyorum | ipucu:1 | sek:N`; itiraz yok); oturum sonu id `g:tani`, frage `oturum:N`, ergebnis `bitti` (test bitti) / `ara` (devamı var), notiz `puan:x/y | konu:yapılan/toplam | biliyor:<id,…> | zayif:<id,…> | dk:N`. Konu başına 1 yazarak soru (z2), doğruysa 2. (z3, başka teil); ikisi de ipucusuz doğru → `biliyor` (konu açılır, kart S ≤ 5, ilk tekrar 4–5 gün), değilse `zayif` (sprint sırasına; yanlış teil'ler konu açılınca hayalet). Durum `S.gram.tani`. "Sonuçlarıma bak"ta `zayif` konuların yanlış maddelerini de düzelt.
    Ana turda gramer sorusu: modus `gram`, id `g:<konu>:<n>`, notiz `tur:akis | tür:… | …` (konu kartı değişmez; teil istatistiği / hayalet yazılır). Sprint sırası `Gramer.SPRINT_SIRA`, API `Gramer.sprintDurum / blokBaslat / turSorusu / turRender` (FORMAT.md 10.7).
    Boylu boyuna çalışma (31.10, Tuna: "konuyu boylu boyuna alıştırmak istiyorum"; `derin`, FORMAT.md): yeni konu tanıtımdan sonra ve istenince açık konuda; teil teil z1→z3, ustalaşınca teil tamam, yanlışta teil'e dönüş, havuz / Bitir'e kadar; konu kartı oturumda bir kez, log set sonu `frage: giriş|derin` + `teil-tamam:x/y`. Tekrar seti 5. Teil başına hedef havuz ≥ 22 (z1 ≥ 4, z2 ≥ 9, z3 ≥ 7); öz denetim `node tools/gramer_ozkontrol.js [konu]`. 48 konu, 6359 alıştırma (31.10: 8 ajan + 8 denetçi; her teil ≥ 22, z1 ≥ 4, z2 ≥ 9, z3 ≥ 7). Türler: `luecke` (çok boşlukta seçenek takımı `habe ; gearbeitet / bin ; gegangen`, takımlar karışmaz), `wahl`, `ordnen` (virgül yok sayılır), `fehler`, `umform`, `ceviri` (Türkçe → Almanca cümle), `text` (çok boşluklu metin), `eslestir`, `kategori`, `dinle` (dikte). Cümle cevabında kaynaşmamış edat (in dem / im) `fast` + `kaynaştırma`. Doğrulayıcı: `python3 quellen/grammatik/pruef_grammatik.py`.
  - Prüfung: `pruefung` (madde id `pr:<set>:lesen:<teil>:<nr>` ergebnis richtig/falsch notiz `mod:tam|mini`; modül özeti `pr:<set>:lesen` ergebnis `bestanden`/`nicht-bestanden` notiz `puan:73 | roh:22/30 | t1:5/6 … | dk:58/65`; Sprechen `pr:<set>:sprechen:<teil>` ergebnis `selbst` notiz `liste:5/7 | kart:sp1-03`). Schreiben sınavı `text` satırı id `pr:<set>:schreiben:<teil>` (item görev kimliği, notiz `pruefung | kelime:83 | dk:19/20 | maddeler:3/3`) → "sonuçlarıma bak"ta B1 ölçütüyle (Erfüllung, Kohärenz, Wortschatz, Strukturen) puanla. Motor `js/pruefung.js`; Lesen seti `quellen/goethe_lesen.json` (okuma havuzunda değil). Durum `S.pruefung` (sonuçlar, sınav tarihi).
  - Konuşma: `sprechen` (id `shadow:<öğe>` / `teil2:<konu>` / `teil1:<görev>` / `teil3:<konu>`, ergebnis `gemacht`, antwort `kayıt:Nsn`; kayıt tarayıcıda kalır). Redemittel: `quellen/redemittel.txt` türleri `sprechen1/2/3`.
  - Cümle atölyesi (`js/cumle.js`, Diğer → Cümle atölyesi, bölüm `cumle`; oturum 8 görev, kademe karışımı başarıya göre): `cumle` (id `<öğe>:diz|cevir|kur`, item öğe(ler) artikelli, frage Türkçe cümle / kur'da `durum | kelimeler: … | görev: …`, antwort, loesung asıl cümle (kur'da boş)).
    `diz` (karışık parçaları sırala): ergebnis richtig / fast (yalnız zarf yeri) / falsch, notiz `kademe:diz | parça:N | kelime sırası|fiil yeri | sek:N`. `cevir` (Türkçe → tam cümle, hedef kelime verilir; `G.cumleKontrol` + `alts`): richtig / fast / falsch, notiz `kademe:cevir | hedef:<biçim> | <etiketler> | ipucu:1 | öneri:X | sek:N`.
    `kur` (kelime(ler) + Türkçe durum + yapı görevi, serbest cümle): ergebnis `gonderildi` (not yok; Atla → `falsch` + `bilmiyorum`), notiz `kademe:kur | yapı:weil | kelime:9 | hedef:2/2 | hedef-eksik:… | kısa | yapı-eksik | büyük harf | nokta | uyarıya rağmen | ek:<2. öğe> | sek:N`.
    Hafızaya (Kern) yazmaz (ipuçlu: bütün kelimeler / hedef kelime ekranda); yalnız log, gün sayacı ve `S.cumle` (kademe başarısı, kullanılan cümleler). Oturum sonu `tur;cumle` (notiz `cevap | doğru | küçük | yanlış | gönderildi | puan | dk | diz | cevir | kur`, yarım bırakılırsa `yarıda`).
  - Bilmediklerim (28.10, `S.bilmedik`, `bilmedikIsle`): soruda „Bilmiyorum“ (ana tur, Gramer'in her türü — yazı kutusu yoksa `0` tuşu —, Cümle atölyesi) anahtarı listeye yazar `{ ad, ilk, son, n, d, dt }`; sonra başka günlerde iki doğru (`d` ≥ 2, günde bir) → "artık biliyorsun". Kelimeler `FILTER.zayif`'e girer (Zayıfları çalış), gramer satırı konunun kural sayfasını açar (`Gramer.oku`). Birleştirme `Kern.birlestir`: anahtar başına son "bilmiyorum" kazanır. Gramerde Bilmiyorum'dan sonra itiraz yok.
  - Durum: `dikkat` (ergebnis `bas-gec` = çok hızlı/boş, `cok-yanlis`), `leech` (ergebnis `takiliyor`: üç ayrı günde yanlış → kanca yaz)
  - Tur sonu: `tur` (id = bölüm, akşam tekrarında `aksam`; ergebnis `bitti` / `leer`, notiz `cevap:12 | doğru:9 | küçük:1 | yanlış:2 | puan:85 | dk:4 | yeni:2 | seviye+:3 | tekrar:9`): oturum uzunluğu ve sıklığı buradan okunur.
  - Metin etkinliği özeti: `akt` (id `luecke:<metin>` notiz `puan:x/y | boşluk:n`; `diktat:<öğe>`); göç satırı `akt;goc4`.
- `log/zustand.json`: ilerleme yedeği. v5 hafızası: `items[id].m` (anlam; `pk` = farklı günlerde ipucusuz üretim başarısı, `b` son basamak), isimde `items[id].art`, düzensiz fiilde `S.kok[base]`,
  paket `S.pakete[pid].m`; eski `karten` dondurulmuş + 30 gün gölge yazım (`Kern.golge`: hafıza güncellemesi sorulan biçimin eski kartına da, `g4 === last`).
  Ana bölüm **`akis` (Çalış)**: 12 cevaplık tur, seçim `Kern.sec` (`sec()` sarmalayıcısı): 1) oturum kuyruğu (yanlış → 3–5 soru sonra bir alt basamaktan başka cümleyle, 3. deneme tur sonunda seçmeli;
  yeni kelimenin mini sorusu ve ≥ 4 soru sonra ikinci hatırlaması `yaz0`, yazılmaz) 2) yeni parti (turda bir, adım 3 – boy−7; tanıtım kartları art arda, `frageTanit`; tier-1 / uluslararası adaylara yoklama `frageYoklama`)
  3) metin etkinliği (turda bir, adım ≥ 8; gerçek paragrafta 2–4 boşluk, her boşluk bir cevap; günde bir dikte) 4) kurtarma (adım ≥ 6, R'si en düşük) 5) ısınma (yalnız günün ilk turunda, ilk 3) / momentum: R'si en yüksek, bir basamak aşağı
  6) vadeliler R azalan (aynı öğe ≥ 8 soru arayla; artikel flaşı turda ≤ 3; kök turda 1, günde 4, yeni kök günde 2) 7) vadeli yoksa parti, yoksa "şimdilik bu kadar" + günde bir "+3 yeni".
  En uzun tekrar aralığı 60 gün (`Kern.MAX_ARALIK`; açılışta `aralikKisalt` eski uzun vadeleri çeker; %85 hedefte FSRS aralığı ≈ 1,9 × S olduğundan 94 güne çıkıyordu).
  Merdiven (`Kern.basamak`): S < 2 seç, < 7 yaz, < 21 cümlede boşluk, üstü tam cümle; erken üretim kapısı pk 0 → ≤ B2 ve aralık ≤ 7 g, pk 1 → ≤ B3 ve ≤ 14 g; tier-3 isim / diğer (ünite dışı) ≤ B3; A1 anlam sorulmaz.
  Basamak kapısı (19.10): `m.bm` = ipucusuz doğru cevaplanan en yüksek basamak; sonraki soru ≤ bm + 1, aralık bm 1 → 7 g, 2 → 14 g, 3 → 30 g, öğenin üst basamağında (`Kern.ustBasamak`: tier-3 / Goethe boşluğu yok 3, cümlesi yok 2) 60 g; seviye ≤ bm. bm'siz eski hafıza açılışta `aralikKisalt` ile başlatılır (pk 0 → 1, pk ≥ 1 → 2, son doğru basamak).
  bm yalnız tam doğru (`richtig`), ipucusuz, itirazsız cevapla yükselir (26.10; yazım / küçük hata ya da "aslında doğru" seviye atlatmaz).
  Zor soru (26.10, Tuna: "zor sor, ipucusuz sor, bilirsem seviye atlat"): `m.ds` = art arda doğru kalıcı yazım; ds ≥ 2 ve merdiven bm + 1'in altında soracaksa normal vadeli seçimde soru bm + 1'den ipucusuz biçimle (`yaz` / `bos` / `cumle`), `sel.zor`; turda ≤ 3 (`ZOR_TUR`); ısınma / kurtarma / momentum / kuyruk / akşam / klavyesiz / Zayıflar'da yok. Doğru ve yavaş değil → anlam notu 4. Kapılar (pk, tier-3, ustBasamak) geçerli.
  Artikel ve paket hafızasında pk kapısı (≤ 7 / 14 g) yok (`guncelle` `kapisiz`): yalnız FSRS + 60 gün.
  Tam cümle kontrolü `G.cumleKontrol(giris, [asıl, ...alts], { hedefKelime, fiil })` (js/grammatik.js): kelime kelime fark (ok / yazim / yanlis / eksik / fazla / yer), etiketler `yazım`, `umlaut`, `kaynaştırma`, `artikel/çekim`, `yardımcı fiil`, `edat`, `dönüşlü zamir` (falsch), `fiil yeri`, `kelime sırası`, `eksik kelime`, `fazla kelime`, `yanlış kelime`, `hedef kelime`, `farklı cümle`; geçerli başka dizilişler (Vorfeld, yan cümle önde) doğru, soru / emir / bitte cümlelerinde değil. Not: fast + `fiil yeri` / `kelime sırası` → `cumleYapi` (m2), diğer fast → m3. Her alternatif kendi hedef biçimiyle denenir.
  Cümle kaynaklarında Almanca alanı ` || ` ile ayrılmış kabul edilen alternatifler alabilir (ilki asıl: soru, çözüm, glossen anahtarı) → build `alts`.
  Not (`Kern.notVer`): doğru 3 (biçim ofseti: seçmeli büyüme az), yazım / mastar eki / yavaş 3 (+0,7), umlaut / hâl / çekim 2, edat / sich / yanlış 1; isimde anlam ve artikel ayrı (kelime ✓ artikel ✗ = m3 a1).
  Yazım hoşgörüsü (`G.pruefen(…, {lemma:true})`): ae/oe/ue/ss tam doğru; lemma ≥ 5 harf + lev 1, ≥ 10 harf + lev ≤ 2 ve yazılan sözlükte başka kelime değilse (liegen/legen, Stadt/Staat ayrışır).
  Günde tek kalıcı yazım (öğrenme günü 04:00'te başlar). Yeni kota (`Kern.kota`): günde 6 (Ayarlar 4/6/8); fren kapasitesi `kapasite()` = günlük hedef ya da son 7 günde çalışılan günlerin cevap ortalaması (büyük olan, ≤ 150; 26.10 Tuna: günde ~120 cevap); birikme ya da çok genç kelime varken 2–4, göçten sonraki ilk 3 gün 2, hedeften sonraki bonus turda +2;
  yarım öğeler (tanıtıldı, sınanmadı; listeden / okumadan / paketten "öğrenmeye ekle") yeni sıranın başında, günde en çok 3.
  Yan bölümler (paket boşluğu, fiil metni kökü, Artikel 60 sn) hafızaya yalnız vadeliyse ya da R < 0,9 ise ve günün ilk cevabıysa yazar.
  Odak bölümleri (`MODI`, `FILTER` öğe yüklemleri) aynı `Kern.sec`'i filtreyle kullanır; Hızlı tur / `?tur=kisa` klavyesiz (yalnız seçmeli, metin yok). Günlük sayaçlar `tageC[gün][cihaz]` → `tage[gün].modi[bölüm]`.
  Simülasyon: `node tests/sim_akis.js` (gerçek kopya, 14 gün, K=36; `tests/sim_stau.js` sarmalayıcı). Çekirdek testleri: `node tests/test_kern.js`, `node tests/test_goc.js`.
- Mimari ve gerekçeler: `TASARIM.md`.

## "Sonuçlarıma bak" dendiğinde

1. `git pull --rebase` (uygulama `log/` dosyalarını GitHub API ile doğrudan bu dala commit eder; pushlamadan önce de çek). `VERLAUF.md`'deki son notta yazan satırdan sonraki `log/log.csv` satırlarını oku.
2. `satz`, `luecke`, `abr`, `frm`, `wort`, `prod`, `paket`, `cumle` (Cümle atölyesi; `kur` = `gonderildi` satırlarının hepsi, doğruysa kısa onay) denemelerinin her biri için (özellikle `falsch` / `fast`) düzeltmeyi
   tam liste olarak yaz: kendi cevabı, doğrusu (isimler artikelli), kısa açıklama.
   Aynılarını `daten/feedback.js`'e ekle: `{ zeit, id, antwort, richtig, urteil, text }`.
   Seçmeli (`erk`, `bed`, `art`) yanlışlarını tek tek yazma: hangi kelimeler ve hangi artikeller karışıyor, toplu söyle.
3. Tekrarlayan hata etiketlerini say (dönüşlü zamir, edat, artikel/çekim, yardımcı fiil, kelime sırası …).
   Gerekirse o hatayı hedefleyen çeviri cümlesi ekle (`quellen/saetze.txt`, doğal Türkçe + doğru Almanca); kalıp üretici
   (`quellen/rahmen.txt`) yalnız çeviri cümlesi ve Goethe boşluğu olmayan fiillerde kullanılır. Yeni kelimeler B1 (seviye 3) önce gelir.
4. Notu sistem verir; `öneri:` olan satırlar Tuna'nın itiraz ettiği yerler (sistemin ilk kararı `öneri:`'de): itiraz haklı mı, fazla cömert mi söyle.
   Baştan savma işaretleri: `sayılmadı`, `dikkat` satırları, çok kısa `sek:`; varsa kısaca ve suçlamadan söyle.
   `yeni;bekannt` (yoklamada bildi) olup sonra yazmada (`wort`/`prod`/`abr`) yanlış olan kelimeleri belirt (yanlışlıkla bilinen sayılmış).
5. `leech` satırlarındaki her kelimeye `daten/kancalar.js`'e kısa Türkçe hafıza kancası yaz (anahtar: öğe kimliği, log'daki `id`):
   Almanca kelimenin sesine benzeyen Türkçe kelime + anlamla birleşen bir sahne; isimde artikel için kural ya da renk ipucu
   (der mavi, die kırmızı, das yeşil). Tek satır, emin olmadığın Almanca bilgi ekleme.
5b. `text` satırlarındaki her metni cümle cümle düzelt (kendi cümlesi → doğrusu → kısa açıklama), sonunda B1 Schreiben
   ölçütüne göre kısa değerlendirme (görev maddeleri, bağlaçlar, hitap/kapanış) ve düzeltilmiş tam metin. `daten/feedback.js`'e de ekle.
5c. Son günlerde öğrendiği kelime ve fiillerden (log'daki `yeni` / `erk` / `bed` satırları) 10–20 yeni çeviri cümlesi yaz,
   `quellen/saetze.txt`'e (fiil) ya da `quellen/wort_saetze.txt`'e (isim / kelime) ekle: her cümlede bir fiil + en az bir yeni isim ya da kelime; fiil kimliği cümlenin ana fiili.
   Dönüşlü fiil cümleleri `quellen/saetze_refl.txt`'e.
   Her yeni cümle için `quellen/glossen.txt`'e de satır ekle: `Almanca cümle | die Regierung = hükümet; …` (hedef kelime ve A1 kelimeleri hariç;
   tam cümle sorusunda öğrencinin bilmediği kelimeler bu sözlükten gösterilir).
5d. `lesen-wort` satırlarındaki kelimeler öğrencinin okurken bilmediği kelimeler: yeni cümle ve paketlerde öncelik ver.
    `bilmiyorum` etiketli `falsch` satırlarındaki ve `kurtarma` satırlarında yanlış olan kelimeler de öyle: her birine 2–3 yeni çeviri cümlesi yaz (Tuna "bilmiyorum"da daha çok cümle istiyor).
    Gramerde `bilmiyorum` etiketli `gram` satırlarının teil'ine (item `konu/teil`) 3–5 yeni alıştırma yaz (`quellen/grammatik/<konu>.txt` sonuna, leech gibi).
    Bunların listesi `log/zustand.json` → `bilmedik` (Zayıflar → Bilmediklerim; anahtar öğe kimliği ya da `g:<konu>:<teil>`, `d` < 2 = hâlâ bilmiyor).
    Yoklamada bilip (`yeni;bekannt`) sonra yazmada / cümlede yanlış yapılan kelimeleri söyle.
   Yeni okuma metni için `quellen/pakete.txt`'e paket + `quellen/lesen.txt`'e 4 richtig/falsch ifadesi ekle.
6. Paketler bittiyse ya da "yeni paket yaz" denirse `quellen/pakete.txt`'nin sonuna yeni paket ekle: bir sahne (konu değil:
   "postanede", "ev arkadaşıyla" gibi), 10 kelime (Goethe B1 listesinden; zayıf / takılan kelimelere öncelik), ~90–110 kelimelik
   B1 metni (Präsens / Perfekt, yan cümle), Türkçesi. Biçim dosyanın başında.
7. `VERLAUF.md`'ye tarihli not düş: ne yapıldı, hatalar, eklenenler, son incelenen log satırı (zaman damgası).
8. Doğrula ve pushla:
   ```
   python3 tools/build.py && node tests/test_grammatik.js && node tools/stichprobe.js 1 && node tools/stichprobe_module.js refl
   ```
   Build hata verirse (yanlış artikel, bulunamayan isim) düzelt. Yeni kalıpların örnek cümlelerini gözle kontrol et.
   `js/app.js` değiştiyse ve Playwright varsa: `node tests/e2e_smoke.js` (mobil + masaüstü, boş durum gün 1 + ertesi gün, göç senaryosu `tests/fixtures/zustand_v3.json` dondurulmuş v3 kaydıyla; gerçek `log/zustand.json` 15.10'dan beri v4) ve `node tests/sim_akis.js`; arayüz değiştiyse `node tests/e2e_ui.js` (390×844 DOM denetimi).

## İçerik eklerken

- n-Deklination listesi: `tools/build.py` içinde `WEAK_LIST` (bileşikler otomatik), tuzaklar `FALLE`. Cümle şablonları `js/grammatik.js` → `ND_PERSON / ND_TIER / ND_SACHE`.
- Dönüşlü alıştırmadan çıkarılan fiiller: `REFL_AUS` (tümleç zorunlu ya da öznesi şey). Emir kipi yalnız `IMP_OK` fiillerinde.

- Yeni isim Goethe listesinde yoksa `quellen/nomen_extra.txt`'e çoğuluyla ekle.
- Artikel kuralı: bileşik isimde son parça (`kopf`, build.py; yalnız artikeli tutan bileşik, iki artikelli başlar `ZWEI_ART` hariç), yoksa sonek kuralı (`regel`).
- Kalıp satırı biçimi `quellen/rahmen.txt` başında anlatılıyor (`P` kişi, `0` artikelsiz, `~` iyelik, `*` sıfat, `+` belirsiz, `(Pl)` çoğul, `T =` zamanlar, `X =` kapatılan özellikler).
- Anlamsız cümle üreten kombinasyonlardan kaçın. Emin olmadığın Almanca'yı ekleme.
