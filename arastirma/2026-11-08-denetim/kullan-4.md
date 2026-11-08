# kullan-4 — kullanarak inceleme (telefon 390×844 + masaüstü 1280×860)

**Özet**
- Telefonda boş kayıtla gün 1 ve gün 2 turları, masaüstünde gerçek kayıtla (log/zustand.json + log.csv'den 3000 satırlık yerel log) turlar, akşam tekrarı (zaman kaydırarak), Gramer (tekrar, boylu boyuna, tanı testi telefonda), Cümle atölyesi, Okuma + Dinleme modu, Prüfung (Lesen mini, Schreiben), Kelimeler alt sayfası, Zayıflar, Geçmiş, Ayarlar, Artikel 60 sn, metin boşluğu, dikte, duy, duy-seç (sahte TTS ile), ayır, artOb, kalıp, kök oynandı. Her türde doğru / tek harf / umlautsuz / yanlış artikel / artikelsiz / yanlış ek / küçük harf / noktasız / boş / Bilmiyorum denendi.
- En ciddi iki sorun: (1) metin boşluğu ve Dinleme modunda "küçük hata" sayılan cevaplar yeşil "doğru" gösteriliyor, doğrusu hiç gösterilmiyor ve başka bir kelime (verschieben ↔ verschrieben) "yazım hatası" sayılıyor; (2) kök sorusunda (Perfekt, cümlede) yanlış yardımcı fiil ("hat gefahren") tam doğru sayılıyor.
- Orta: fiil + edat + hâl sorusunda hâl yazılmasa da tam doğru (zor soruda seviye de atlatıyor); "ein Vorurteil" / "dasVorurteil" kelime yanlış (m1) sayılıyor; doğru çoğul "die Vorurteile" için "die değil → das" artikel uyarısı çıkıyor.
- Sorunsuz bulunanlar: Devam kilidi (2,5 sn) ve "doğrusunu bir kez yaz" kutusu, gizli şıklar (≥ 0,45 sn), üçlü Enter'de tek kayıt, Artikel 60 sn'de çift basış yok sayılıyor, arka planda öldürülen uygulamada bekleyen cevap sonraki açılışta işleniyor ("arka planda kapandı"), çevrimdışı yeniden yükleme (service worker, HTTP üzerinden) çalışıyor, akşam kartı 09:00 turundan sonra 18:30'da çıkıyor ve ✓ oluyor, telefonda yatay taşma yok, sayfa hatası (pageerror) yok.
- Bulgu sayısı: kritik 0 · yüksek 2 · orta 3 · düşük 11.
- Betikler ve ekran görüntüleri: `bulgular/kullan-4/` (img/ altında; ör. `MT-umlautsuz.png`, `A1-07-duy-soru.png`).

---

### Metin boşluğu ve Dinleme modu: küçük hata "doğru" görünüyor, doğrusu gösterilmiyor; başka kelime "yazım" sayılıyor
- önem: yüksek
- tür: haksız not / arayüz
- yer: js/app.js:2196–2213 `uPruef` (satır 2208: `lev(c, e) <= 1` → `fast` 'yazım', sözlük denetimi yok), js/app.js:2647 `q.ok = sonuclar.map(x => x !== 'falsch')`, js/app.js:2562 (doğrusu yalnız `!q.ok[i]` ise gösterilir), js/dinle.js:379 `modKontrol` (aynı mantık)
- kanıt: `kullan-4/metin.js` (gerçek kayıt, `__tekrar.metinAc('luecke')`). Metin "Beim Arzt" (u2:t1): boşluklara `Schmerzen / untersucht / verschieben / Tabletten` yazıldı (doğrusu `verschrieben`). Ekran: dört kutu da yeşil, "✓ 4 / 4 doğru · yanlışların doğrusu metinde yeşil", hiçbir yerde "verschrieben" yazmıyor (`img/MT-umlautsuz.png`). Log: `luecke ; v605:satz ; … ; verschieben ; fast ; verschrieben ; … | kısmi | kaynak:u2:t1 | yazım, yazım: verschrieben`. İlk metinde (Klexikon "Apotheke") `untersuchen` (Partizip `untersucht` olmalı) ve `Rezpet` de yeşil, "4 / 4 doğru". Dinleme modunda (Okuma → DW "Warum eine Kindheit auf dem Bauernhof gesund ist" → 3/4 boşluklu metin) `Felder` (Feldern), `international` (internationales), `Kindhiet` yazıldı: sonuç "8 / 12 doğru", üçü de doğru sayıldı ve düzeltme gösterilmedi (`img/B-lesen-5.png`).
- beklenen / gerçek: verschieben (ertelemek) Tuna'nın bildiği ayrı bir kelime; "yazım" değil yanlış olmalı (CLAUDE.md yazım hoşgörüsü: "yazılan sözlükte başka kelime değilse"). Küçük hata en azından sarı işaretlenip doğrusu yanında gösterilmeli; "metindeki biçimiyle" yazmak bu etkinliğin amacı. Gerçek: hepsi "doğru" görünüyor, Tuna hatasını hiç görmüyor.
- önerilen düzeltme: `uPruef` 2208. satırda lev ≤ 1 kuralına `lexSet().has(e.toLowerCase())` ise yazım sayma (ya da bu satırı kaldırıp yalnız `G.yakin`'e bırak; o zaten LEX'e bakıyor). `metinPruef`'te `q.ok` üç değerli olsun (`richtig` / `fast` / `falsch`); `fast` kutusu `yakin` sınıfıyla sarı ve yanında `<b class="u-dogru">doğrusu</b>`; özet "3 doğru · 1 küçük hata". Aynısı `dinle.js` `modKontrol` / `modRender` için.

### Kök sorusu (Perfekt, cümlede): yanlış yardımcı fiil tam doğru sayılıyor
- önem: yüksek
- tür: haksız not
- yer: js/app.js:1676 `stammTekPruef` (`if (tur === 'p2' && t.length > 1 && auxLemma(t[0])) govde = t = t.slice(1)` — hangi yardımcı fiil olduğuna bakmadan atıyor)
- kanıt: `kullan-4/soru.js s4.json` → `frageAc({ id: 'v243', bicim: 'kokSatz' })`. Soru: "Wir sind mit dem Zug _____." (fahren, Partizip II). Cevap `hat gefahren` → "✓ Doğru". Aynı soruda `ist gefahren` da doğru. Log (aynı yol, doğru cevapta): `stamm ; v243:stamm ; … ; richtig ; gefahren ; basamak:K | bicim:kokSatz | not:k3`.
- beklenen / gerçek: fahren sein ile çekilir; "hat gefahren" Türk öğrencinin en tipik hatası (CLAUDE.md etiketi "yardımcı fiil"). Beklenen en az küçük hata + "yardımcı fiil: sein"; gerçek tam doğru ve kök hafızası k3 ile büyüyor.
- önerilen düzeltme: `stammTekPruef` 'p2' dalında `uAux = auxLemma(t[0])` yazılmışsa ve `uAux !== v.aux` ise `yanlis = max(yanlis, 1)` + etiket `yardımcı fiil: sein/haben` (cümlede zaten varsa yalnız tekrar yazmak sorun değil, yanlışı ise hata).

### Fiil + edat + hâl sorusunda hâl yazılmadan tam doğru (zor soruda seviye de atlıyor)
- önem: orta
- tür: haksız not / kural ihlali
- yer: js/app.js:1314–1345 `pruefAbr` (hâl yalnız yazılmışsa ve yanlışsa `hal`; hiç yazılmamışsa denetim yok)
- kanıt: kalıp sorusu `v634` ("Cevabı uzun süre bekledik. … fiil + edat + hâl (A / D) yaz"), cevap `warten auf` → log `abr ; v634:abr ; warten auf ; richtig ; … | bicim:kalip`. Yazma sorusu `v620` "ZOR SORU · İPUCUSUZ … Edatla birlikte yaz, ardından hâli" → `verzichten auf` → `richtig`, not m3. Aynı akış zor soruda `bm`'yi yükseltir (zor soru doğru → anlam notu 4).
- beklenen / gerçek: soru açıkça hâli istiyor (CLAUDE.md: `abr` = fiil + edat + hâl); hâlsiz cevap en fazla küçük hata olmalı ve seviye atlatmamalı. Gerçek: tam doğru, kapı açılıyor.
- önerilen düzeltme: `pruefAbr`'de `preps.length && preps.some(p => !kas[p.p])` ise `tip = 'hal'` (ya da yeni `hal-eksik`), etiket `hâl yazılmadı: auf + Akk` → fast. Yalnız seçmeli / ipuçlu `yaz0`'da hoşgörü istenirse orada ayrı tutulabilir.

### "ein Vorurteil" ve boşluksuz "dasVorurteil" kelime yanlış (m1) sayılıyor
- önem: orta
- tür: haksız not / kural ihlali
- yer: isim yazma sorusu (`frageWort` → G.pruefen lemma kipi; js/app.js:1230 civarı artikel ayrıştırması yalnız der/die/das)
- kanıt: `frageAc({ id: 'x1557', bicim: 'yaz' })` (das Vorurteil). `ein Vorurteil` → "✗ Yanlış · kelime yanlış", `not={m:1,…}`; `dasVorurteil` → aynı. Karşılaştırma: `Vorurteil` (artikelsiz) → "kelime ✓ · artikel ✗ · artikel eksik" (fast).
- beklenen / gerçek: CLAUDE.md "Yalnız artikel hatası (kelime doğru) her zaman fast + … artikel eksik". "ein Vorurteil"de kelime doğru, yalnız belirli artikel yok; boşluksuz yazım telefonda sık. Gerçek: anlam hafızasına m1 (bilmiyor) yazılıyor.
- önerilen düzeltme: isim cevabında baştaki `ein/eine/einen/einem/einer/kein…` atılıp artikelsiz gibi değerlendirilsin (fast, `artikel eksik: das`); `^(der|die|das)(?=[A-ZÄÖÜ])` bitişikse araya boşluk koyup yeniden dene.

### Doğru çoğul "die Vorurteile" yazınca "die değil → das" artikel uyarısı
- önem: orta
- tür: haksız not / arayüz
- yer: isim yazma sonucu, `artikelNotHTML` (js/app.js:151) ve sonuc.artikel
- kanıt: aynı soru, cevap `die Vorurteile` → "≈ Küçük hata · çekim … die değil → das Vorurteil · son parça belirler: das Urteil"; `q.sonuc.artikel = { sinandi: true, dogru: false, verilen: 'die', dogrusu: 'das' }`.
- beklenen / gerçek: cevap Almancada doğru (çoğul + çoğul artikeli); hata yalnız "tekil iste" talimatına uymamak. "die değil → das" Tuna'ya cinsiyeti yanlış bildiğini söylüyor ve artikel karışma istatistiğine (Artikel aynası, karismaTablosu) yanlış veri sokabilir.
- önerilen düzeltme: cevap çoğul biçimle (`n.plf`) eşleşiyor ve artikel `die` ise `artikel.sinandi = false`; panelde "çoğulunu yazdın: tekil das Vorurteil" notu.

### "Wegen" cümle başında çoğul isim rozeti alıyor ("Wegen Pl.")
- önem: düşük
- tür: içerik hatası / arayüz
- yer: js/app.js:106–129 `FORM` + `deHTML` (der Weg çoğulu Wege + n → "Wegen" = 'pl'; cümle başı istisna listesinde yok)
- kanıt: v620 tam cümle çözümü "Wegen<sup>Pl.</sup> der hohen Kosten verzichten wir …", dikte çözümü "Wegen<sup>Pl.</sup> des dichten Nebels …", Kelimeler → verzichten auf alt sayfası. `kullan-4/form.js` saetze / nsaetze / saetze_refl'de cümle başı işlev kelimesine isim rozeti veren tek kelime: `Wegen` (26 cümle).
- beklenen / gerçek: wegen edat; rozet yok. Gerçek: "Pl." rozeti (isim gibi).
- önerilen düzeltme: `deHTML` cümle başı istisnasına `Wegen` (genel çözüm: cümle başındaki kelime küçük harfle `WOERTER`'de edat / bağlaç olarak varsa rozet koyma).

### Yazım hoşgörüsü sözlüğünde yapay biçimler ("regenn", "zeichenn") gerçek yazım hatasını yanlış yapıyor
- önem: düşük
- tür: haksız not
- yer: js/app.js:2077 `formIdx` (her isme körlemesine `'' / n / en / s / es` ekliyor) → js/app.js:351 `lexSet` bu anahtarları `G.lexSetzen`'e veriyor → js/grammatik.js:690 `yazimTok` (`lex.has(a)` → yazım değil)
- kanıt: `regnen` yazma sorusunda `regenn` (iki harf yer değiştirmiş) → "✗ Yanlış", aynı sorudaki `rgenen` / `regnn` → "≈ yazım". Sayfada `G.yakin('regenn','regnen')` boş sözlükle 'yazim', uygulama sözlüğüyle null; sebep `formIdx`'te "Regen"+"n". Aynı yolla `zeichenn`→zeichnen, `beginnn`→beginnen, `amten`→atmen, `bauchen`→brauchen yanlış (124 aday biçimin bir kısmı çekim yedeğine düşüyor, bunlar düşmüyor). Turda gerçekten oldu: `abr ; v429:abr ; regnen ; … ; regenn ; falsch` (bu kelime aynı turda leech de oldu).
- önerilen düzeltme: `lexSet` sözlüğü `formIdx` yerine gerçek biçimlerden kurulsun (lemma, `plf`, n-Deklination biçimi, fiil biçimleri, sıfat ekleri); isimlere yalnız gerçekten var olan Genitiv / Dativ çoğul ekleri.

### Tam cümlede eksik içerik ismi küçük hata, eklenen "auch" yanlış: tutarsız
- önem: düşük
- tür: haksız not
- yer: js/grammatik.js:1052–1060 `cumleKontrol` (≥ 6 kelimede tek eksik / fazla sıradan kelime fast; `CK_AGIR` 'auch' içeriyor)
- kanıt: v620 tam cümle "Wegen der hohen Kosten verzichten wir dieses Jahr auf den." (nesne ismi Urlaub yok) → "≈ Küçük hata · eksik kelime"; "Ich verzichte auch heute auf den Kaffee." (dilbilgisi doğru, bir zarf fazla) → "✗ Yanlış · fazla kelime".
- beklenen / gerçek: nesnesi düşmüş bozuk cümle doğru cümleden daha iyi not alıyor. En azından eksik isim (CK_DET'ten sonra gelen içerik kelimesi) ağır sayılmalı.
- önerilen düzeltme: eksik kelime büyük harfli içerik kelimesiyse (`ckBuyuk`) `agir = true`.

### Dikte ve dinle-boşlukta büyük / küçük harf hiç söylenmiyor
- önem: düşük
- tür: arayüz / öğrenme
- yer: js/dinle.js dikte sonucu (`diktePruef` → `cumleKontrol`)
- kanıt: `sesAc('duy','dikte')`, cevap `wegen des dichten nebels fahren die züge heute langsamer` (isimler küçük, nokta yok) → "✓ Doğru", hiçbir not yok; log `… ; richtig ; …` (etiket yok). Aynı kontrol tam cümle sorusunda "büyük/küçük harf" notunu gösteriyor.
- beklenen / gerçek: diktede isim büyük harfi asıl beceri; not düşürmese bile panelde "isimler büyük harfle: Nebels, Züge" uyarısı çıkmalı.
- önerilen düzeltme: dikte sonucunda `tags` 'büyük/küçük harf' içeriyorsa (cümle sorusundaki gibi) uyarı satırı göster ve log notiz'e yaz.

### Dokunmatik ekranda gizlenen tuş ipuçları yetim metin bırakıyor ("🔊 Dinle /", "tekrar dinle:")
- önem: düşük
- tür: arayüz
- yer: js/dinle.js:95 (`🔊 Dinle <kbd>Boşluk</kbd> / <kbd>↑</kbd>`), js/dinle.js:164 (`tekrar dinle: <kbd>Boşluk</kbd>`); css/stil.css:586 `@media (pointer: coarse) { .kart kbd { display: none } }`
- kanıt: telefonda turdaki dinle sorusu: düğme "🔊 Dinle /", sağ altta "tekrar dinle:" (devamı boş) (`img/A1-07-duy-soru.png`).
- önerilen düzeltme: ayırıcıyı ve "tekrar dinle:" yazısını `kbd` ile aynı kapsayıcıya (`<span class="tus-ipucu">`) al, dokunmatikte kapsayıcıyı gizle.

### Gramerde tamamen ilgisiz cevaba yanıltıcı hata etiketi
- önem: düşük
- tür: arayüz
- yer: js/gramer.js `cumlePruef` / `pruef` → cevapla() etiketleri
- kanıt: Gramer → Adjektivdeklination → Tekrar et, çeviri sorusuna `qwertz falsch` → "✗ Yanlış · yardımcı fiil"; tanı testinde umform'a `qwertz falsch` → "artikel/çekim"; boşluk sorusunda `Esx` (Es) → "eksik kelime".
- beklenen / gerçek: anlamsız / çok uzak cevapta "farklı cümle"; tek harf fazlası "yazım". Yanlış etiket "Sonuçlarıma bak"taki hata sayımını da bozar.
- önerilen düzeltme: skor çok düşükse (ör. < 0,3) etiketleri "farklı cümle" ile değiştir; tek kelimelik boşlukta `G.yakin` ile yazım ayrımı.

### Kök tek biçim (Perfekt iki boşluk): yardımcı fiil yazılmışken "yardımcı fiil eksik" etiketi
- önem: düşük
- tür: arayüz
- yer: js/app.js:1657 `stammTekPruef` 'perf' dalı (`uAux` yalnız ilk kelimeye bakıyor)
- kanıt: `frageAc({ id: 'v398', bicim: 'kok' })` "Er _____ ein Taxi _____.", cevap `nimmt, nahm, hat genommen` → "✗ Yanlış · Partizip: genommen · yardımcı fiil eksik: hat".
- önerilen düzeltme: birden fazla biçim yazıldıysa "tek biçim yaz" uyarısı ver; `uAux` için cevaptaki herhangi bir yardımcı fiili ara.

### Kökte son harf eksik yanlış, harf yer değişmesi küçük hata
- önem: düşük
- tür: haksız not
- yer: js/app.js:1662 `derece` (yalnız 'yazim' / 'umlaut' = 1; `G.yakin` 'cekim' sonucu 2 = yanlış)
- kanıt: "Wir sind mit dem Zug _____." `gefahre` → "✗ Yanlış", `gefarhen` → "≈ Küçük hata".
- önerilen düzeltme: tek harf eksikliği (dlev 1) `yazim` sayılsın ya da `cekim` derece 1 olsun.

### Çekimsiz kelimeye uydurma ek "çekim" küçük hatası alıyor
- önem: düşük
- tür: haksız not
- yer: js/grammatik.js:713 `yakin` (`a.startsWith(b) && a.length - b.length <= 3` → 'cekim')
- kanıt: telefonda gün 1, `etwa` (zarf) yazma sorusuna `etwaen` → "≈ Küçük hata · çekim" (`prod ; w0149:prod ; … ; etwaen ; fast`).
- önerilen düzeltme: zarf / bağlaç / edat (`WOERTER` kl ∈ adv, konj, präp) hedeflerinde 'cekim' sonucunu kapat.

### Bugün → "Yanlışlar" aynı yanlışı tekrar tekrar listeliyor
- önem: düşük
- tür: arayüz
- yer: Bugün ekranı "Bugün ne yaptın → Yanlışlar" (renderAna)
- kanıt: gerçek kayıt: "eher · eben → eher" iki kez; akşam testinde "sich rasieren · qwertz falsch → sich rasieren" üç kez (ilk cevap + kuyruk tekrarları) (`img/GZ-d-bugun.png`).
- önerilen düzeltme: öğe + cevap çiftine göre tekilleştir, yanına "×3".

### "eher" örnek cümlesi başka anlamda
- önem: düşük
- tür: içerik hatası
- yer: w0119 eher ("daha çok, daha ziyade") cümleleri (Kelimeler alt sayfası)
- kanıt: alt sayfada ilk cümle "Ich stehe meist eher auf als mein Mann. — Genelde kocamdan daha erken kalkarım." Burada eher = daha erken; kartın anlamı "daha çok, daha ziyade". Tuna'nın bugünkü iki yanlışı bu kelimede (eben).
- önerilen düzeltme: bu cümleyi kaldır ya da öğenin anlamına "daha erken" ekle; boşluk sorusunda Türkçe ipucu cümlenin anlamıyla uyuşmalı.

---

Doğrulanan ama sorun çıkmayanlar (tekrar aramaya gerek yok): Bugün'de Enter turu açar, Esc kapatır, Başla'ya çift tık tek tur açar; şıklar 0,45 sn'den önce Enter'la açılmıyor, açılmadan rakam yok sayılıyor; yanlışta Enter 2,5 sn geçmiyor, düzeltme kutusu yazılmadan geçmiyor; doğru + üç Enter tek log satırı; boş cevap ve tek harf "Bilmiyorum" sayılıyor; artikel öbek (artOb) notları kurala uygun (cins doğru hâl yanlış → fast, cins yanlış → yanlış); ayır sorusu karışma tablosundan geliyor, log Devam'da yazılıyor; Prüfung Lesen mini puanlaması ve log satırları doğru; Gramer tanı testi telefonda çalışıyor; arka planda öldürmede bekleyen cevap işleniyor; çevrimdışı açılış çalışıyor; telefonda yatay taşma yok; hiçbir ekranda pageerror yok (tek konsol hatası test ortamında engellenen font isteği).
