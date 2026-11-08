# kod-2 — cevap kontrol yolları + kern + app (7.11.2026)

**Özet**
- Birim testleri geçiyor (test_kern 665, test_grammatik, test_goc 76, test_dinle 13). Bulguların hepsi Node betikleriyle yeniden üretildi: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/kod-2/` (`h.js` = G + gerçek sözlük, app'teki `lexSet` ile aynı; `ex.js` = app.js'ten fonksiyon çıkarıcı; `t1`–`t11`).
- En önemli sorun: **aynı cevap, hangi yoldan sorulduğuna göre farklı not alıyor.** `ae/oe/ue/ss` (ß / ä yazamayan klavye) kelime yazmada "doğru", boşlukta / gramerde "küçük hata (umlaut, m2)"; arayüz metni bile "ae / oe / ue / ss de doğru sayılır" diyor.
- Gramer tanı testinde "konuyu zayıf yapmayan küçük hata" listesi yanlış etiket adlarıyla yazılmış: büyük/küçük harf ya da ss yüzünden konu "zayıf" oluyor (log'da gerçek örnek: 28.10 10:55:23).
- Tam cümlede geçerli başka kelime sırası "kelime sırası" (m2, seviye atlamaz) alıyor ve **itiraz düğmesi çıkmıyor**.
- İsim yazmada umlaut / çekim hatası olunca artikel sonucu tamamen atılıyor (Tuna'nın en zayıf yeri artikel).
- `G.yakin` sözlük kontrolü umlautlu kelimelerde çalışmıyor: güçlü fiillerin kişi hatası (fährst ↔ fährt) "yazım" sayılıyor, kök sorusunda bile.
- Metin etkinliği (`uPruef`) sözlüksüz lev ≤ 1: legen/liegen, Staat/Stadt "yazım" (CLAUDE.md'nin açıkça ayırdığı çiftler).
- Sayı: yüksek 3 · orta 3 · düşük 5.

---

### 1. ae / oe / ue / ss boşlukta, dinlemede ve gramerde "küçük hata" (umlaut, m2) — kelime yazmada "doğru"
- önem: yüksek
- tür: haksız not / kural ihlali
- yer: `js/grammatik.js:758-760` (`pruefen`: `fold(u) === fold(best)` → `fast` + `umlaut/ß`), bunu kullanan `bosPruef` (B3 boşluk `frageLueckeStufe`, Goethe boşluğu `frageSatz`, turdaki `duy-bosluk` `js/dinle.js:215`); `js/gramer.js:319-325` (`parcaPruef` fold → `fast`), `gramer.js:356` (`cumlePruef` → `G.pruefen`), `gramer.js:385` (`dinlePruef`)
- kanıt:
  - `t3.js` / `t7.js`: `G.bosPruef('Strasse','Straße')` → fast, `tipAus` → `umlaut` → `Kern.notVer` → **m2 fast**; aynı şekilde `heisst/heißt`, `groesser/größer`, `muede/müde`, `schoenen/schönen`, `faehrt/fährt`. Oysa `G.pruefen('Strasse','Straße',[],{lemma:true})` (kelime yazma) → **richtig** (`t1.js`), `G.cumleKontrol` (tam cümle) de doğru sayıyor.
  - `t10.js` (gerçek `daten/grammatik.js`, gerçek `Gramer.pruef`): cevabında ß/ä/ö/ü olan **158/158 luecke, 269/269 umform, 424/424 ceviri** alıştırması `ss/ae/oe/ue` ile yazılınca `fast` (ör. `adjektiv 26 ["schoenem"] → fast []`, `adjektiv 19 "Ich trinke heissen Tee." → fast ["umlaut/ß"]`).
  - Arayüz kendisiyle çelişiyor: `js/cumle.js` `ETIKET_TR['umlaut/ß']` = "ä / ö / ü / ß eksik (ae / oe / ue / ss de doğru sayılır)".
- beklenen / gerçek: CLAUDE.md "ae/oe/ue/ss tam doğru" → doğru, seviye atlar. Gerçek: küçük hata, anlam notu 2, `bm` yükselmez; gramerde yazarak türlerde hayalet tekrar açılır, tanı testinde konu zayıf (bkz. 2).
- önerilen düzeltme: `G.pruefen` başında `acik(u) === acik(n)` (ve `firstLow(acik(...))`) eşitliğini `richtig` say (pruefenLemma'daki satır 720'nin aynısı); `fold` dalı yalnız gerçek umlaut eksikliğinde (fur → für) `umlaut/ß` versin. `gramer.js parcaPruef` / `dinlePruef` de önce `acik` eşitliğini `richtig` saysın (fold'dan önce).

### 2. Gramer tanı testi: küçük hata listesi yanlış etiket adlarıyla → büyük/küçük harf ya da ss yüzünden konu "zayıf"
- önem: yüksek
- tür: hata / haksız not
- yer: `js/gramer.js:681-683` (`notla`, `ses.art === 'tani'`: `KUCUK = {'zarf','eksik kelime','fazla kelime','yazım','büyük/küçük harf','kaynaştırma','umlaut','noktalama'}`, `gecti = urteil === 'fast' && q.tags.length && q.tags.every(x => KUCUK.has(x))`)
- kanıt:
  - Kontrol fonksiyonlarının ürettiği etiketler `'groß/klein'` ve `'umlaut/ß'` (`G.pruefen`), luecke / text için `parcaPruef` fast'ta **hiç etiket yok** (`tags: []`). Listede bunlar yok → `gecti` false → `taniCevap(..., 'fast')` → `zayif`.
  - Gerçek log: `2026-10-28 10:55:23;gram;g:satzklammer-tekamolo:tani:5;…;Wir haben uns am Abend einen film angesehen;fast;Wir haben uns am Abend einen Film angesehen.;tanı:2 | tür:umform | z:3 | kelime sırası | groß/klein` (`kelime sırası` teil etiketi). Tek fark küçük "film". Aynı oturumun özeti `11:06:34 g:tani … zayif:verbstellung,satzklammer-tekamolo,…` → konu yalnız büyük/küçük harf yüzünden zayıf sayılıp sprint sırasına girdi (ilk sorusu `richtig` idi).
  - `t10.js`: tek bir ismi küçük yazınca 629/629 umform, 834/834 ceviri `fast ["groß/klein"]`.
- beklenen / gerçek: kod yorumu "konuyla ilgisiz küçük hata (… yazım, büyük/küçük harf …) konuyu zayıf yapmaz" → gerçek: yapar.
- önerilen düzeltme: `KUCUK`'a `'groß/klein'`, `'umlaut/ß'` ekle; luecke / text'te `fast` ve `tags` boşsa (yalnız fold / büyük-küçük farkı) parcaPruef'ten bir etiket döndür (`'umlaut/ß'` / `'groß/klein'`) ki tanı onu görebilsin. (Bulgu 1 düzelirse ss kısmı zaten kalkar.)

### 3. Tam cümlede geçerli başka kelime sırası "kelime sırası" (m2) alıyor ve itiraz düğmesi yok
- önem: yüksek
- tür: haksız not / kural ihlali (kural 8: "soru başına tek itiraz")
- yer: `js/app.js` `auswerten` (itiraz: `urteil === 'fast' && sonuc.tip === 'cumleFast'` ya da `urteil === 'falsch' && q.voll`), `cumlePruef` (`fast` + `fiil yeri`/`kelime sırası` → tip `cumleYapi`); `js/grammatik.js` `ckVaryant` yalnız özne ↔ Vorfeld ve ana ↔ yan cümle değişimini üretiyor
- kanıt (`t5.js`, hedef "Ich habe gestern meinen Freund am Bahnhof getroffen."): 
  - "Ich habe meinen Freund gestern am Bahnhof getroffen." → `fast 0.94 kelime sırası` (Almancada geçerli Mittelfeld sırası)
  - hedef "Ich freue mich auf die Ferien.": "Auf die Ferien freue ich mich." → `fast 0.75 kelime sırası` (geçerli Vorfeld).
  - Bu sonuç `tip: 'cumleYapi'` → `Kern.notVer` m2, `bm` yükselmez; `auswerten`'deki üç itiraz koşulundan hiçbiri `cumleYapi` + `fast`'ı kapsamıyor → "aslında doğru" düğmesi çıkmıyor. Tuna'nın doğru cümlesine itiraz yolu yok.
- beklenen / gerçek: doğru cümle doğru sayılmalı ya da en azından "aslında doğru" itirazı açılmalı. Gerçek: m2 + itiraz yok.
- önerilen düzeltme: `auswerten`'de `else if (!weissNicht && urteil === 'fast' && (sonuc.tip === 'cumleFast' || sonuc.tip === 'cumleYapi')) q.itirazVar = 'dogru'`. İsteğe bağlı: `ckVaryant`'a Vorfeld'e edatlı öbek / nesne (ckZarf'ın tanıdığı öbek) taşıma varyantını özne zamiri olmayan cümlelerde de ekle.

### 4. İsim yazmada umlaut ya da çekim hatası varsa artikel sonucu atılıyor
- önem: orta
- tür: hata (öğrenmeye zarar: kural 1, artikel)
- yer: `js/kern.js:135` (`case 'umlaut': return r(2, null, 'fast')`), `kern.js:139` (`case 'cekim': … r(2, null, 'fast', …)`) — `artEt()` / `aNot()` çağrılmıyor; `js/app.js pruefWort` artikeli doğru hesaplıyor ama not bunu kullanmıyor
- kanıt (`t6.js`, gerçek `pruefWort` + `Kern.notVer`):
  - `der Schlüssel` ← "die Schlussel" → tip umlaut → **m2, a null**, etiket yalnız `umlaut` (artikel die → der yok)
  - `die Küche` ← "der Kuche" → m2, a null; `die Apotheke` ← "der Apotheken" → çekim, m2, a null
  - karşılaştırma: "der Apoteke" (yazım) → m3 **a1** + `artikel der → die`; yani yalnız yazım dalında artikel değerlendiriliyor.
  - Panelde `artikelNotHTML` kutusu yine çıkıyor (`artVerilen` `not.m >= 2` istiyor), ama başlık "≈ Küçük hata" (`artYanlis` `not.m >= 3` istiyor, "kelime ✓ · artikel ✗" yok), etiketlerde artikel yok, **log satırında artikel hatası yok** (gece işi / "sonuçlarıma bak" göremez) ve **artikel hafızası cezalanmıyor / doğru artikel ödüllendirilmiyor** (`a` null → `Kern.uygula` art'a yazmaz).
- önerilen düzeltme: `notVer`'de `umlaut` ve `cekim` dallarında `artEt()` çağır ve `a: aNot()` ver (`yazim` dalı gibi); sonucPanel'deki `artYanlis` koşulunu `not.m >= 2` yap.

### 5. `G.yakin` sözlük kontrolü umlautlu kelimede çalışmıyor → güçlü fiilin kişi hatası "yazım"
- önem: orta
- tür: haksız not (fazla cömert) / hata
- yer: `js/grammatik.js:690` (`yazimTok`: `lex.has(a)`), `:712` — `a`, `acik()` uygulanmış biçim (`faehrst`); sözlük (`app.js lexSet`) ise umlautlu biçimleri tutuyor (`fährst`). `lex.has('faehrst')` hep false.
- kanıt (`t7.js`, `t8.js`): 
  - `G.bosPruef('fährst','fährt')` → fast **yazım** (m3, `kısmi`); umlautsuz eşi `machst/macht`, `gehst/geht` → çekim (m2).
  - Kök tek biçim (`stammTekPruef`, hedef er-Präsens): "fährst", "läufst", "schläfst", "trägst" → **fast**; "nimmst", "gibst", "sprichst", "hältst" → **falsch**. Aynı hata türü fiilin harfine göre iki ayrı not alıyor; kök sorusunun ölçtüğü şey tam da bu çekim.
- beklenen / gerçek: kişi eki hatası çekim (m2, kökte falsch); gerçek: umlautlu fiillerde yazım (m3 / kökte fast).
- önerilen düzeltme: `yazimTok` ve `yakin`'de sözlük sorgusunu ham küçük harfli girdiyle de yap: `const lx = lex || LEX; const var = w => lx && (lx.has(w) || lx.has(String(x).toLowerCase()))` (ya da `lexSet`'e `acik` biçimlerini de ekle). Ayrıca `yakin` satır 708'deki "biri ötekinin sonu" istisnası (`st`/`t`) gerçek ek farkını yazıma itiyor; `ra`/`rb` ikisi de EKLER'deyse ve sözlükte ikisi de fiil biçimiyse çekim say.

### 6. Metin etkinliği / Dinleme modu (`uPruef`): sözlüksüz lev ≤ 1 → farklı kelime "yazım"
- önem: orta
- tür: haksız not (fazla cömert) / CLAUDE.md'ye aykırı
- yer: `js/app.js uPruef` (`Math.abs(c.length - e.length) <= 1 && c.length > 4 && lev(c, e) <= 1` → `fast 'yazım'`); kullanıldığı yer: turdaki metin etkinliği `aktPruef` (hafızaya yazar, `bicim:'metin'`, `sel.b = 3`), Dinleme modu `dinle.js modKontrol`, metin düzeltme kutusu
- kanıt (`t4.js`): `legen → liegen`, `Staat → Stadt`, `bitten → bieten`, `leiden → leider`, `wieder → wider` → **fast "yazım"** (m3 + kısmi, hafızaya yazılır). Ayrıca `fahrt → fährt` umlaut değil yazım; `fährst → fährt` yazım.
- beklenen / gerçek: CLAUDE.md "(liegen/legen, Stadt/Staat ayrışır)" → yanlış; gerçek: küçük hata.
- önerilen düzeltme: tek kelimelik boşlukta `uPruef`'in lev dalını kaldırıp yalnız `G.yakin(e, c)` (sözlük kontrollü) kullan; ya da lev dalına `!lexSet().has(eingabe.toLowerCase())` şartı ekle.

### 7. Fiil yazma (`pruefAbr`): mastar eki eksik "çekim" (m2) oluyor, CLAUDE.md "m3" diyor
- önem: düşük
- tür: haksız not
- yer: `js/app.js pruefAbr` — `G.pruefen(..., {lemma:true})` 5.11'den beri "warte"yi `cekim` (fast) döndürüyor; `mastar` dalı yalnız `r.tip === 'yanlis'` iken çalıştığı için atlanıyor
- kanıt (`t2.js`): `warten auf` ← "warte auf A" → tip `cekim` (pruefAbr `urteil:'falsch'`, `tipAus` tip'i alıp `notVer` → fast m2); `sich freuen auf` ← "sich freue auf A" → aynı. Yorum ve CLAUDE.md: "mastar eki eksik → m3 (+0,7)".
- önerilen düzeltme: `pruefAbr`'de `tip === 'cekim'` iken son kelimede `sonU + 'n' === sonZ || sonU + 'en' === sonZ` ise `tip = 'mastar'`. (Yan not: pruefAbr'nin kendi `urteil`'i `cekim`'de `falsch`, notu veren `notVer` `fast`; ikisi çelişiyor, `['yazim','umlaut','mastar','hal','cekim']` yapılmalı.)

### 8. Son harf yazım hatası "çekim" sayılıyor (morgem, Fus)
- önem: düşük
- tür: haksız not
- yer: `js/grammatik.js:706-708` (`yakin`: ortak baştan sonra kalan iki parça EKLER'deyse → `cekim`)
- kanıt (`t1.js`, `t3.js`): `morgem → morgen` → çekim (m2); `Fus → Fuß` → çekim. YAPILANLAR 5.11 "morgem gibi tek harf → yazım hatası" diyor. `m`/`n`, `s`/`` ikisi de EKLER'de olduğundan ilk dal çekim veriyor; zarf / değişmez kelimede (morgen) ek olmaz.
- önerilen düzeltme: ilk dalı yalnız hedef çekimli bir sınıftaysa (isim / fiil / sıfat, `WOERTER` içinde `kl` zarf değilse) uygula; ya da `ra`/`rb` tek harf ve sözlükte `a` yoksa önce `yazimTok`'u dene.

### 9. Gün sınırı: sayaçlar takvim gününde, çekirdek 04:00 gününde
- önem: düşük (log'da 00:00–04:00 arası hiç cevap yok: şu an etkisiz)
- tür: hata / CLAUDE.md'ye aykırı ("öğrenme günü 04:00'te başlar")
- yer: `js/app.js:12` `tag()` (takvim günü) → `heute()`, `bugun()`, `zaehlen`, seri (`gunAktif`, `seriBakim`), gramer `gun()` (`api.tag`); `js/kern.js` ise `S.tage[gun4(t)]` okuyor (ısınma `kern.js:634`, `donusMu`), app `kapasite()` (`app.js:425`) da `S.tage[Kern.gun4(...)]`.
- kanıt: kod yolu: 01:00'de cevap → `S.tageC['<bugün>']`'e yazılır, Kern ısınma kontrolü `S.tage['<dün>'].n`'ye bakar (dün çalışıldıysa ısınma yok); `pazartesi()` 04:00'e göre, hedef sayacı takvime göre.
- önerilen düzeltme: `tag()`'in sayaç / seri kullanımlarını `Kern.gun4(now())` ile değiştir (ya da `tag = t => Kern.gun4(t)`; yalnız log zaman damgası `zeitStr` takvimde kalsın).

### 10. Yoklamada çekim hatası "bilmiyor" sayılıyor
- önem: düşük
- tür: haksız not
- yer: `js/app.js auswerten`: `if (q.yoklama) tip = ['dogru','yazim','umlaut','hal','mastar'].includes(tip) ? 'yoklama' : … 'yanlis'`
- kanıt: kod yolu: yoklamada "die Apotheken" → `pruefWort` tip `cekim` → listede yok → `yanlis` → kelime tanıtım kartına gider (kotadan yer yer), kelimeyi bildiği hâlde.
- önerilen düzeltme: listeye `'cekim'` ekle.

### 11. Birleştirmede eski (düz metin) cümle geçmişi t:0 olur, "30 günde ≤ 2" sayımı sıfırlanır
- önem: düşük (6.12'de kendiliğinden biter)
- tür: veri kaybı (küçük)
- yer: `js/kern.js:1005` (`birlestir` kontext: `typeof e === 'string' ? { s: e, t: 0 }`); app `kxListe` aynı girdiyi `KX_ESKI` (6.11) sayıyor
- kanıt (`t11.js`): `lok.kontext.n1 = ['Ein Satz.','Ein Satz.']` → birleşmiş `[{s:'Ein Satz.', t:0}, …]`: iki görülme bire indi ve t:0 `kxSay`'in 30 gün süzgecinden düşer → cümle hemen yeniden sorulabilir.
- önerilen düzeltme: birleştirmede düz metni `{ s: e, t: Date.UTC(2026,10,6) }` (KX_ESKI) yap ve aynı `s|t` çiftlerini tekilleştirme (sayı korunmalı) ya da düz metinleri olduğu gibi bırak.

---

Not (bulgu değil, gözlem): Cümlede boşlukta Goethe örnekleri dişil biçimi soruyor (`der Arbeiter` → boşluk "Arbeiterin", `der Lehrer` → "Lehrerin", `das Haus` → "Hause"; 83 cümle). "Arbeiter" yazılınca `çekim` (m2) oluyor; kabul edilebilir ama ipucu yalnız "işçi" olduğu için kafa karıştırabilir (`t9.js`).
