# kullan-1 bulguları (7.11.2026)

**Özet.** Uygulamayı Playwright'la Tuna gibi kullandım: gerçek `log/zustand.json` ile 8.11 sabah / öğleden sonra / akşam (akşam tekrarı) ve 9.11 pazartesi (telefon) turları, 9.11'e kaydırınca B1 sprinti geçiş kartı; sonra her soru türünü `__tekrar.frageAc` ile tek tek açıp onlarca cevap biçimiyle notlamayı denedim (laboratuvar: Devam'a basmadan, hafızaya yazmadan). Ayrıca Gramer (tekrar seti, boylu boyuna), Cümle atölyesi, Okuma + Dinleme modu, paket, fiil metni, Prüfung (Lesen mini, Schreiben), Kelimeler / alt sayfa, İlerleme, Zayıflar, Geçmiş, Ayarlar, mobil taşma denetimi. Konsolda pageerror yok (yalnız ağ isteği engellendiği için `ERR_FAILED`).
En önemlileri:
1. **Çok kelimeli ifadeler sıradan kelimelere eşleniyor** (`formIdx`): okumada "eine/einem" → "ein bisschen = biraz", "den" → "den Faden verlieren", "sich" → "sich Mühe geben"; "metinde" sorusunda "Die Luft bewegt **sich** schnell" cümlesinde işaretli "sich" sorulup doğru cevap "çaba göstermek" sayılıyor.
2. **Dinleme sorusunda boş Enter = "Bilmiyorum" (yanlış)**; turda gramer sorusu (adım 5/10) iki Enter istiyor ve hemen ardından gelen ses yuvasında (adım 4/9 penceresi) fazladan bir Enter soruyu 0 sn'de yanlış yapıyor (yeniden üretildi).
3. **Umlaut'lu harfte yer değiştirme yazım hatası sayılmıyor**: "Kläte", "Prfüung", "Gemsüe", "scühtzt" → ✗ Yanlış (yazma, boşluk, tam cümle); panelde çelişkili "ek / çekim / farklı" etiketi. 5.11'deki "morgem" şikâyetinin aynısı umlaut'lu kelimelerde sürüyor.
4. **Kelime sırası tamamen bozuk cümle "≈ Küçük hata"**: "ist. hoch so Bremen in Miete die dass gewundert, mich habe Ich" → fast (m2).
5. **İkinci iş "Gramer tekrarı ✓ bugün yapıldı"** yalnız turdaki 2 gramer sorusuyla; 10 konu vadeli kalırken Bugün'de iş bitmiş görünüyor.
Diğerleri: turdaki gramer cevabı X / Escape'le kaybolur; gramer sonucu Devam kilitsiz; gramer boşluğunda yazım hatası tam yanlış; paket boşluğunda harf yer değiştirmesi yanlış; 3/5 gramer seti konuyu 31 gün sonraya atıyor; log tabanlı her şey (karışma tablosu, üretim doğruluğu, dk, ikinci iş durumu) cihaz başına; emir kipindeki fiillere artikel üstyazısı; fiil "doğrusu" `untersuchen Akk` gösterip aynısını yanlış sayıyor; küçük arayüz sorunları.

Sayılar: kritik 0 · yüksek 3 · orta 8 · düşük 7.

Betikler ve ekran görüntüleri: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/kullan-1/` (`shots/`, `lab*.js`, `esc.js`, `gramEnter.js`, `itiraz.js`, `dbg5.js`, `dbg6.js`, `paket.js`, `gr2.js`).

---

### 1. Çok kelimeli ifadeler (ein bisschen, sich Mühe geben, den Faden verlieren …) sıradan kelimelere eşleniyor: okuma sözlüğü, "metinde" sorusu, metin / dinleme boşlukları yanlış
- önem: yüksek
- tür: içerik hatası / hata
- yer: `js/app.js:2073-2089` `formIdx()` (satır 2087: `WOERTER.forEach(w => { const d = w.de.split(/[ …]+/)[0]; ['', 'e', 'en', 'er', 'es', 'em'].forEach(e => add(d + e, w.id)); })`); kullananlar: `lesenWort` (2857), `kontextSaetze` (728, "metinde" sorusu), `aktSaetze` (2478, turdaki metin boşluğu), `js/dinle.js:302` (Dinleme modu boşlukları, `A.wortSuchen`)
- kanıt:
  - `dbg4.js`: formIdx'te 52 eşleme bir ifadenin ilk kelimesine düşüyor: `ein/eine/einen/einer/eines/einem → ein bisschen`, `sich → sich Mühe geben`, `den/denen → den Faden verlieren`, `zur → zur Verfügung stehen`, `jedes → jedes Mal`, `gar → gar nicht`, `zwar → zwar … aber`, `weder → weder … noch`, `einee/eineen… → eine Entscheidung treffen` …
  - `lesen.js`: Okuma'da Klexikon "Studium" metninde **eine** kelimesine basınca kutu "**ein bisschen = biraz** · Öğrenmeye ekle" gösteriyor; `lesenWort` bunu `lesen-wort` satırı olarak log'a yazar (gece Claude "okurken bilmediği kelime: ein bisschen" sanır) ve hafızadaysa vadesini yarına çeker.
  - `dbg6.js` (ekran `shots/202-metinde-w0636.png`): `frageAc({id:'w0636', bicim:'metinde'})` → "bu cümlede işaretli kelime ne demek? — Die Luft bewegt **sich** schnell, und Schallwellen entstehen." şıklar: çok meşgul olmak / **çaba göstermek** (doğru sayılan) / mahkemeye gitmek / nereden. `w0068` için "…an **einem** bestimmten Ort…" → doğru şık "biraz".
  - `kontextSaetze('w0636')` 6 cümlenin 6'sı ilgisiz "sich" cümlesi; `kontextSaetze('w0068')` 6'sı "ein/eine/einem".
  - Tuna'nın kaydında `w0636 sich Mühe geben` (bm 1) var; "metinde" tanıtım günü / ilk tekrar / Hızlı turda gelir. Metin etkinliği (`aktSaetze`) ve Dinleme modu boşlukları aynı dizini kullanıyor (kod yolu izlendi; ekranda bu ifadeyle boşluk üretmeyi denemedim: doğrulanmadı).
- beklenen / gerçek: ifade yalnız bütün olarak (ya da hiç) eşlenmeli / "sich" cümlesi "sich Mühe geben" sorusu olmamalı.
- önerilen düzeltme: `formIdx`'te `w.de` boşluk ya da "…" içeriyorsa ilk kelimeyi ekleme (yalnız tek kelimelik WOERTER'e ek çekimleri). Çok kelimeli ifadeler için `kontextSaetze`/`aktSaetze`'de ayrı eşleme: cümlede ifadenin bütün kelimeleri (ayrık da olsa: "gebe mir … Mühe") geçiyorsa. Artikel / zamir / edat biçimlerini (der, den, ein…, sich, zur) hiçbir zaman bir WOERTER öğesine bağlama (FUNKTION listesi).

### 2. Dinleme sorusunda boş Enter "Bilmiyorum" sayılıyor; gramer sorusunun çift Enter'ı yanındaki ses sorusunu 0 sn'de yanlış yapıyor
- önem: yüksek
- tür: haksız not / hata
- yer: `js/dinle.js:220` (`boslukSoru` `q.kontrol`: `if (!v) { q.bilmiyorum(); return; }`), dikte sorusunda aynı (`dinle.js` ~253); gramer yuvası `js/app.js:3166-3200` (`gramTurBitti` / `gramTurOlay`); yuvalar `js/kern.js:554-556` (`GRAM_ADIM = [5, 10]`, `SES_ADIM = [4, 9]`, pencere +2 → ikisi art arda düşebiliyor)
- kanıt: `gramEnter.js`: 9.11 09:00, tur açılır, gramer sorusuna kadar ilerle, Bilmiyorum → `Enter 1` (gramer hâlâ ekranda, yalnız kaydedildi: `wartet:true`), `Enter 2` (sıradaki soru: `sesTur` duy-bosluk, girdi odakta), `Enter 3` → log: `duy;w0320:duy-bosluk;In dem Artikel gibt es _____ Behauptungen…;;falsch;tür:bosluk | hız:0.9 | tekrar:0 | bilmiyorum | sek:0`. Ekran `shots/` son `ses-bos-enter`. Ana kelime sorularında boş gönderim yok sayılıyor (`app.js:5394 if (!inp || !inp.value.trim() …) return`), dinlemede sayılmıyor.
- beklenen / gerçek: boş Enter hiçbir şey yapmamalı (ya da "önce yaz" uyarısı); sesi daha duymadan 0 sn'de "Bilmiyorum · Yanlış" + Bilmediklerim'e yazılıyor.
- önerilen düzeltme: `boslukSoru`/`dikteSoru` `q.kontrol`'de boş girdide `return` (Bilmiyorum yalnız düğme / `0` tuşu). Ek olarak soru açıldıktan sonraki ilk ~400 ms Enter'ı yok say (artikel flaşındaki `freiAb` gibi). Gramer yuvasında tek Enter'ın hem kaydedip hem geçmesi (ya da Devam kilidiyle tutarlı iki adım) Tuna'nın ritmini sabitler.

### 3. Umlaut / ß içeren harf yer değiştirmesi yazım hatası sayılmıyor: tam yanlış + çelişkili etiket
- önem: yüksek
- tür: haksız not
- yer: `js/grammatik.js:699-716` `yakin()` → `acik()` (ä→ae) uygulandıktan sonra `dlev`; "Kläte"→"klaete" vs "kaelte" uzaklığı 2 olur, `yazimTok` < 10 harfte yalnız 1'e izin verir. Etkilenen: `pruefenLemma` (yazma), `bosPruef` (cümlede boşluk), `G.cumleKontrol` (tam cümle).
- kanıt (`node -e` ile `G.bosPruef` / `G.pruefen(...,{lemma:true})`, ayrıca uygulamada `lab3.js`, `lab4.js`, `itiraz.js`):
  - Kläte / Kälte → falsch `farklı`; Prfüung / Prüfung → falsch `farklı`; Gemsüe / Gemüse, Behröde / Behörde, flißeend / fließend, Tütüe / Tüte → falsch `artikel/çekim` (panelde "✗ Yanlış · ek" ya da "· çekim").
  - Tam cümle: "Ein dicker Schal scühtzt gut vor der Kälte." → falsch m1 `yanlış kelime`; "Er liest schon ziemlich flißeend, …" → falsch `yanlış kelime, hedef kelime`.
  - Karşılaştırma: aynı tür hata umlaut'suz harflerde fast/yazım: Prüfnug, Universtiät, Bestätiugng, Wudnere, "beschfätigt" (uzun kelime) hepsi "≈ Küçük hata · yazım".
- beklenen / gerçek: 5.11 kuralı ("Situaiton", "morgem" → yazım) umlaut'lu kelimelerde de geçmeli; şu an m1 + hayalet / leech sayacı + "doğrusunu bir kez yaz".
- önerilen düzeltme: `yakin`'de Damerau uzaklığını `acik` öncesi ham küçük harfli dizgide de hesapla (`dlev(x.toLowerCase(), t.toLowerCase()) === 1` → 'yazim'); ya da ä/ö/ü/ß'yi tek karakterle eşleyen bir katlama (ä→ä korunur) ile karşılaştır. `cumleKontrol`'deki kelime düzeyi yazım denetimi de aynı fonksiyonu kullanmalı.

### 4. Kelime sırası tamamen bozuk cümle "≈ Küçük hata" (m2) sayılıyor
- önem: orta
- tür: haksız not (fazla cömert)
- yer: `js/app.js:1515-1524` `cumlePruef` (fast + `fiil yeri`/`kelime sırası` → `cumleYapi`), `js/grammatik.js` `cumleKontrol` (hepsi doğru kelime + yer farkı → fast)
- kanıt: `itiraz.js` "cumle-ters": hedef "Ich habe mich gewundert, dass die Miete in Bremen so hoch ist." — cevap "ist. hoch so Bremen in Miete die dass gewundert, mich habe Ich" → `fast`, not m2, log `satz;…;fast;basamak:B4 | bicim:cumle | not:m2 | … | fiil yeri, kelime sırası, büyük/küçük harf`. `lab4.js`: "Bestanden mein Freund hat die Prüfung." → fast m2.
- beklenen / gerçek: Tuna'nın asıl zayıflığı cümle kurmak (Sprechen); kelimeleri rastgele dizmek "küçük hata" olup tur doğruluğuna yarım sayılmamalı. Tek bir öğenin yeri (zarf, nicht) kayıksa fast mantıklı; fiil 2. yerde değilse ya da birden çok öğe yer değiştirdiyse falsch olmalı.
- önerilen düzeltme: `cumleKontrol`'de `yer` sayısı ≥ 2 ya da çekimli fiil V2 / yan cümlede sonda değilse `urteil='falsch'` (etiket `fiil yeri` kalsın); fast yalnız tek bir `yer` farkında.

### 5. "Günün ikinci işi: Gramer tekrarı ✓ bugün yapıldı" turdaki 2 gramer sorusuyla işaretleniyor
- önem: orta
- tür: hata (yanıltıcı durum)
- yer: `js/app.js:5030-5044` `ikinciIs()` → `bugunYapti('gram')` = bugün herhangi bir `gram` log satırı; turdaki gramer soruları da `modus:'gram'` (`notiz tur:akis`) yazıyor.
- kanıt: 8.11 sabah + öğleden sonra yalnız Çalış turları (her turda 2 gramer sorusu), akşam turuyla günlük hedef dolunca Bugün: "İstersen günün ikinci işi · ✓ Gramer tekrarı · bugün yapıldı · istersen bir daha"; aynı anda Gramer bölümünde "Tekrar zamanı (10)". 9.11'de tek turdan sonra da aynısı.
- beklenen / gerçek: kart, vadeli konu tekrar seti yapılana dek açık kalmalı; Tuna gramer işini bitmiş sanıyor.
- önerilen düzeltme: `bugunYapti('gram')` için `Gramer` gün sayacını kullan (`S.gram.gun.set > 0 || tani > 0`, gramer.js `bugunYapildi`) ya da `notiz` `tur:akis` içeren satırları hariç tut.

### 6. Turdaki gramer sorusu cevaplandıktan sonra X / Escape'le çıkılırsa cevap kaybolur
- önem: orta
- tür: hata (veri kaybı)
- yer: `js/app.js:5351-5355` `cikisNotla()` yalnız `q.done && q.sonuc` olan kelime sorularını işler; `gramTur`'da cevap Gramer'in `notla`'sı (Devam / Enter) çağrılana dek log'a, teil istatistiğine, hayalete, Bilmediklerim'e yazılmaz.
- kanıt: `esc.js gramTur`: gramer sorusunda Bilmiyorum → panel açık → Escape → `S.log` 7 satırda kalıyor (gramer satırı yok), tur sayacı 5 → 5; Başla'ya basınca başka bir gramer sorusu geliyor. Aynı denemede ses sorusu (Dinle cevapta log yazıyor) kaybolmuyor.
- beklenen / gerçek: "Bilmiyorum" gramer bölümü Bilmediklerim'e ve gece Claude'a gitmeli; şimdi iz bırakmıyor.
- önerilen düzeltme: `cikisNotla` / `arkaPlanNotla`'da `q.typ === 'gramTur'` ve Gramer'in aktif sorusu `done` ise `Gramer.turTus({ key: 'Enter' …})` benzeri bir `Gramer.turBitir()` (notla(ses.q.oneri)) çağır.

### 7. Gramer sonucunda Devam kilidi yok (turda ve bölümde)
- önem: orta
- tür: kural ihlali
- yer: `js/gramer.js:640` (sonuç paneli Devam'ı kilitsiz), `js/app.js:3166-3184` `gramTurBitti` (ses yuvası `devamKilitli` kullanıyor, gramer kullanmıyor)
- kanıt: `gramEnter.js`: gramer Bilmiyorum → 300 ms arayla iki Enter → sıradaki soruda. Kelime sorularında ve ses yuvasında yanlış / küçük hatada Devam 2,5 sn kilitli (CLAUDE.md 6.11 S6); gramerde değil.
- beklenen / gerçek: yanlış gramer cevabının açıklaması (kural, "neden") okunmadan geçiliyor; S6'nın gerekçesi (panelde 2 sn kalma) gramerde de geçerli.
- önerilen düzeltme: gramer sonucunda `urteil !== 'richtig'` iken Devam'ı `KILIT_MS` kilitle (app `devamKilitli` / `kilitKur` API'ye verilip `renderUebung` sonucunda kullanılabilir).

### 8. Gramer boşluğunda (luecke / text) yazım hatası tam yanlış, itiraz yok
- önem: orta
- tür: haksız not
- yer: `js/gramer.js` `parcaPruef` (~420): yalnız tam eşleşme, umlaut katlama, kaynaştırma, konuşma dili; harf hatası yok. İtiraz (`serbest`) yalnız umform / ordnen / ceviri'de.
- kanıt: `gr2.js tekrar`: Adjektivdeklination, "Meine ___ Eltern wohnen noch in Ankara. (alt)" → "atlen" → "✗ Yanlış" (etiketsiz), hayalet kuruldu; turdaki gramer sorusunda da aynı `pruef` çalışıyor.
- beklenen / gerçek: sınanan şey ek (-en); ek doğru ve gövdede tek harf yer değiştirmesi varsa küçük hata olmalı (tam cümlede tek kelime yazımı zaten fast: CLAUDE.md "gramer tam cümlesi … tek kelimede yazım → fast").
- önerilen düzeltme: `parcaPruef`'te hedefin son 2–3 harfi (ek) aynı ve gövdede Damerau 1 ise `fast` + `yazım` etiketi; ek farklıysa falsch kalsın.

### 9. Paket boşluğunda harf yer değiştirmesi yanlış; başa artikel yazılan fiil tam doğru
- önem: orta
- tür: haksız not / tutarsızlık
- yer: `js/app.js:1913-1949` `paketPruefen` (`G.pruefen` lemma'sız: düz Levenshtein, transpozisyon 2)
- kanıt: `paket.js` (Mit der Bahn): "Fahkrarte" (Fahrkarte) → "✗ Yanlış"; aynı hata Çalış'ta "≈ Küçük hata · yazım". "die abfahren" (fiil boşluğu) → "✓ Doğru" (Çalış'ta `fazla artikel` fast). Pakette itiraz düğmesi de yok.
- beklenen / gerçek: paket, turdaki metin / boşluk kontrolüyle aynı notu vermeli.
- önerilen düzeltme: `paketPruefen`'de `G.bosPruef(input, l.form)` (yazım / çekim / fazla artikel ayrımı) kullan; `artikel metinde zaten var` yolunda sonuç en çok `fast`.

### 10. 3/5 doğru gramer tekrar seti konuyu 31 gün sonraya atıyor
- önem: orta
- tür: diğer (öğrenme)
- yer: `js/gramer.js:704-711` `setBitti`: `oran >= 0.5 → setNot 2` → `FSRS.review(…, 2)`; Hard notu da aralığı büyütüyor.
- kanıt: `gr2.js tekrar` (Adjektivdeklination, S ≈ 17,8): 5 alıştırmadan 2'si yanlış → son ekran "3/5 puan · sıradaki tekrar **31 gün sonra**" (zayıf teil'ler hayalete gidiyor ama konu kartı 31 gün).
- beklenen / gerçek: %60 başarıda konu aralığı uzamamalı (en çok aynı kalmalı ya da kısalmalı); Tuna B1.2'de ve sıfat çekimi hâlâ zayıf.
- önerilen düzeltme: `setNot === 2` iken `ks.karte.due = min(due, t + eski aralık)` ya da oran < 0,8'de setNot 1; veya Hard için aralığı `S × 0,5`'e sınırla.

### 11. Log tabanlı özellikler cihaz başına: telefonda karışma tablosu, üretim doğruluğu, dk, ikinci iş durumu boş / yanlış
- önem: orta
- tür: hata
- yer: `js/app.js:189, 248, 272` (`S.log` ayrı localStorage anahtarı `almanca-tekrar-log`), `4128` (`zustand.json`'a `log: []` yazılıyor), log.csv uygulamaya geri okunmuyor. Kullananlar: `karismaTablosu` (çeldirici sırası, `ayir` çiftleri), `uretimDogrulugu`, `artikelAynasi`, `bicimBasari`, `aktifSn` ("bugün X dk"), `gunOzeti` (yeni kelime / seviye kutuları), `ikinciIs.bugunYapti`, `haftaSeviye`, Cümle atölyesi `hataSay`.
- kanıt: gerçek kayıt başka bir "cihazda" açılınca (bu oturum) Bugün "bugün 0 dk" ve "Bugün ne yaptın: 90 cevap · – dakika · 0 yeni kelime · 0 seviye ↑" (tageC'de 7.11 için `neu: 8` var); İlerleme "Üretim doğruluğu: 19.10 ve 26.10 haftası –" (o haftalar 600+ cevap). Ekran `shots/001-bugun-gercek.png`.
- beklenen / gerçek: YAPILANLAR yalnız "dk cihaz başına" diyor; aslında 6.11'in ana özelliği olan karışma tablosu (şıklar Tuna'nın karıştırdıklarından) da telefonda / yeni tarayıcıda sıfırdan başlıyor.
- önerilen düzeltme: `zustand.json`'a son 30 günün log özetini (karışma çiftleri, gün başına aktif sn, üretim sayaçları) küçük bir alan olarak ekle ve `Kern.birlestir` ile birleştir; ya da açılışta `log/log.csv`'nin son N satırını çekip S.log'a (cihaz etiketiyle) karıştır.

### 12. Fiil "doğrusu" `untersuchen Akk` / `verschreiben Dat, Akk` gösteriliyor, aynısını yazmak "Yanlış"
- önem: düşük
- tür: haksız not / arayüz
- yer: `js/app.js:1254-1274` `frageAbr` (`loesungHTML` hâl çipini gösterir), `1314-1348` `pruefAbr` (A/D yalnız edattan sonra atılır)
- kanıt: `lab1.js`: v564 "untersuchen Akk" → falsch m1 (etiketsiz, "yazım hatasıydı" önerisiyle); "untersuchen A" → falsch; v605 "verschreiben D A", "verschreiben Dat Akk" → falsch m1. Edatlı fiillerde "sich wundern über A / Akk" doğru. Panelde edatlı fiil "sich wundern über **über + Akk**" (edat iki kez) görünüyor; Kelimeler / Zayıflar listesinde de "sich aufregen über über + Akk".
- beklenen / gerçek: ekranda gösterilen doğrusunu yazan yanlış almamalı; log'da Tuna böyle yazmamış (risk düşük).
- önerilen düzeltme: `pruefAbr`'de edatsız fiilde sondaki `A|Akk|D|Dat|(Akk)` belirteçlerini at; liste / panelde edatlı fiilin çipini yalnız hâl ("+ Akk") olarak yaz.

### 13. Yanlış kararın yanında "çekim / ek" etiketi (çelişkili panel)
- önem: düşük
- tür: arayüz / haksız not
- yer: `js/app.js:3561-3562` (`tipAus` → 'yanlis' ama `res.tags`'teki 'artikel/çekim' → 'çekim' / 'ek' adıyla panelde kalır); `grammatik.js:704` `LEMMA` çakışması (Wunder / wundern)
- kanıt: `lab3.js`: boşluk "wunder" (wundern) → "✗ Yanlış · çekim"; "flißeend" → "✗ Yanlış · ek"; gün 2'de "kaux" (kaum) → "✗ Yanlış · ek"; itirazla düzelen tam cümlede "≈ Küçük hata · yazım · yanlış kelime · hedef kelime" (`itiraz.js`, itirazEt `YANLIS_ET` cümle etiketlerini kapsamıyor).
- beklenen / gerçek: etiket "çekim" ise karar küçük hata olmalı ya da etiket "farklı"; Tuna "çekim hatası yaptım ama yanlış verdi" der (5.11 şikâyeti).
- önerilen düzeltme: `tip === 'yanlis'` iken 'çekim/ek' etiketini düşür; `itirazEt`'te `yanlış kelime`, `hedef kelime`, `farklı cümle` de silinsin. "wunder"/"wundern" gibi biri fiil biri isim çiftinde hedef türüyle karar ver (fiil boşluğunda isim lemması çakışma sayılmasın).

### 14. Cümlede boşlukta ae / oe / ue / ss "≈ umlaut" (m2), yazmada tam doğru
- önem: düşük
- tür: tutarsızlık
- yer: `js/grammatik.js:796` `bosPruef` → `pruefen` (lemma'sız) `fold` → 'umlaut/ß' fast; `pruefenLemma` aynı girdiyi `acik` ile tam doğru sayar (CLAUDE.md: "ae/oe/ue/ss tam doğru").
- kanıt: `bos` "fliessend" (fließend) → fast m2 `umlaut`; "Kaelte", "Pruefung", "Strasse", "gross" → fast; aynı kelimeler yazmada ve tam cümlede richtig (`lab3.js`, `lab4.js`, `node -e`).
- önerilen düzeltme: `bosPruef` başında `acik(u) === acik(n)` ise richtig.

### 15. Cümle başındaki emir kipi fiillerine yanlış artikel üstyazısı
- önem: düşük
- tür: içerik hatası (kural 1'in yanlış uygulanması)
- yer: `js/app.js:121-128` `deHTML` (cümle başı istisnası sabit liste)
- kanıt: Dinle dikte sonucu "**Schreiben**^das Sie bitte deutlich!" (`lab6.js`); veri taraması: "Pass^der bitte auf", "Kauf^der bitte …", "Treffen^das wir uns …", "Wissen^das Sie …", "Ärger^der dich nicht!", "Versuch^der es doch …", "Halt dich gut fest" (≈15 cümle).
- önerilen düzeltme: cümle başındaki kelimenin ardından zamir (Sie, du, wir, ihr, dich, es…) ya da `bitte` geliyorsa ve kelime bir fiil biçimiyse (`formIdx` fiil) işaretleme.

### 16. Telefonda "doğrusunu bir kez yaz" kutusu yapışkan Devam'ın altında kalıyor
- önem: düşük
- tür: arayüz
- yer: sonuç paneli (`.notlar` yapışkan, `.klavye.ic` z-index 5)
- kanıt: 390×844, Bilmiyorum sonrası (`shots/114-116-mob-panel-*.png`): Devam ekranın altına kaydırılıyor, düzeltme girdisi ve ä ö ü ß satırı Devam'ın üstüne / altına biniyor; kaydırınca düzeliyor (`117-mob-panel-asagi.png`). Masaüstünde de girdinin alt yarısı yapışkan Devam'ın arkasında (`043-verb-edat-1.png`).
- önerilen düzeltme: düzeltme kutusu varken `panelGoster` Devam yerine `#duzelt-inp`'i görünür alana kaydırsın; kutu açıkken Devam yapışkan olmasın.

### 17. Seviye çipi küçük hatada ("regne" → "regnen → Yazıyor")
- önem: düşük
- tür: diğer
- yer: `js/kern.js:218` `seviye()` (S eşiği), tur sonu "seviye atlayanlar"
- kanıt: 8.11 öğleden sonra turu: v429 yaz0 (ipuçlu) "regne" → "≈ Küçük hata · çekim" (m2); tur sonu "seviye atlayanlar · 1 · regnen" + seviye sesi.
- beklenen / gerçek: CLAUDE.md "bm yalnız tam doğru, ipucusuz …" ruhuna göre ipuçlu küçük hatada seviye kutlaması yanıltıcı.
- önerilen düzeltme: seviye çipi / "seviye atlayanlar" yalnız `richtig` ve ipucusuz cevapta gösterilsin (hesap aynı kalabilir).

### 18. Doğru tam cümle panelinde gereksiz "aslında doğru de" notu
- önem: düşük
- tür: arayüz
- yer: tam cümle `erkl` (✓ panelde de gösteriliyor)
- kanıt: `lab4.js`, `lab5.js`: her ✓ Doğru tam cümle panelinde "Farklı ama doğru bir çeviri yazdıysan "aslında doğru" de (Claude log'dan kontrol eder)." (düğme yok); 1,2 sn'lik otomatik geçişte okunacak tek satır bu.
- önerilen düzeltme: bu notu yalnız `urteil !== 'richtig'` iken göster.

---

Notlar (bulgu değil):
- Doğru çalışanlar: artikel yanlışı "kelime ✓ · artikel ✗" (fast m3 a1), artikelsiz / çoğul / tek harf hatası (yazma), mastar eki (sich wunder über A → fast), hâl (über D → fast m2), edat / sich eksik (falsch), Bilmiyorum, noktasız ve küçük harfli cümle (richtig), geçerli başka diziliş ("Ich wundere mich über das Wetter" çeşitleri), çift boşluk, itiraz ("yazım hatasıydı" → fast + `öneri:falsch` log'da), Devam kilidi ve "doğrusunu bir kez yaz" (kelime soruları, ses yuvası), tanıtım kartı ≥ 4 sn, akşam tekrarı kartı (8.11 20:00, 15 aday) ve akşam turu, pazartesi "1 tur yeter", dondurucu, sprint açma + 9.11 geçiş kartı, Prüfung Lesen mini / Schreiben kısa metin uyarısı, Dinleme modu 4 adım, mobil taşma (yalnız Kelimeler seviye sekmeleri yatay kayıyor: tasarım gereği).
- `hoer` (duy-seç) başsız Chromium'da Almanca ses olmadığı için turda hiç gelmiyor; sahte sesle açtım: çalışıyor (vurgu ve minimal çift), Bilmiyorum düğmesi yok.
- Test düzeneğinde kalıcı profil + mobil bağlam yüzünden iki kez boş kayıtla açıldı (Gramer "0/48 test", Cümle atölyesi "kelime yok"); düzenek hatası, uygulama hatası değil, bulgu yazmadım.
