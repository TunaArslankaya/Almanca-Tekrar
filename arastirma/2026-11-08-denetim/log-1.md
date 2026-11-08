# log-1 — Tuna'nın cevapları (26.10 – 7.11.2026), odak 6.11 10:50 sonrası

**Özet**
- İncelenen: 26.10'dan bu yana 1342 satır (sprechen hariç), yeni sürümden sonra 138 notlu cevap. Notlar çoğunlukla adil; 6.11 sonrası seçmeli oranı %32 → ~%10. Seçmeli yalnız tanıtım günü ve ilk tekrarda geliyor. Yanlıştan sonra kuyruk 3–5 soru sonra yaz0 ile soruyor, gün sayaçları log'la tutuyor.
- En ağır haksızlık: metin boşluğunda ve fiil boşluğunda **doğru fiilin başka biçimi** (können → kann, werden → wird, regnet → geregnet) hâlâ `falsch` + m1 alıyor. 5.11 düzeltmesi yalnız düzenli ekleri kapsıyor. Gece işi bunu "sistem haksız saydı" diye yazmış ama kod düzelmemiş.
- En ağır cömertlik: artikel öbek sorusunda (artOb) dişil isme Nom/Akk bağlamında "der" yazmak `fast` + **artikel notu 3** alıyor (Geduld, artikelde 13 kez unutulmuş, 7.11 17:17:36).
- İçerik / eşleme: metin boşluğu, büyük harfli isimleri fiile bağlıyor (Schienen → scheinen, Unternehmen → unternehmen, Stand → stehen …). `kontextSaetze`'de bu düzeltilmişti ama `aktSaetze`'de düzeltilmemiş. Çok kelimeli öğede (vor allem) yalnız ilk kelime boşluk yapılıyor. Goethe sınav metinleri (ge1–ge6) metin boşluğuna giriyor.
- Gramer kontrolü (`cumlePruef` → `G.pruefen`): eksik virgül `fast` + "kaynaştırma" sayılıyor (7.11 17:23:46, Tuna'nın itirazı haklı). Log'daki etiketlerde teil etiketi gerçek hata gibi yazılıyor ("kelime sırası" ama hata umlaut).
- `G.yakin` gerilemesi: sondaki çift harf eksikse (Feuerwehrman) "yazım" yerine "çekim" çıkıyor (m2). Aynı yazım hatası 27.10'da m3 almıştı.
- Cümle geçmişi (30 günde ≤ 2): `Kern.birlestir` eski kayıtları `t:0` yapıyor ve bunlar sayılmıyor. 236 kaydın 217'si sayım dışı. Bu yüzden bringen cümlesi 9. kez sorulmuş (4'ü son 10 günde).
- Bulgu sayısı: yüksek 3 · orta 10 · düşük 5. Ek bölümler: itiraz değerlendirmesi, feedback.js denetimi, tekrar örüntüsü, hata türleri.

---

## A. Haksız not / kontrol hataları

### 1. Doğru fiilin başka biçimi (düzensiz / modal) metin ve fiil boşluğunda "yanlış" + m1
- önem: yüksek
- tür: haksız not
- yer: `js/app.js:2194–2212` `uPruef` (metin boşluğu `aktPruef` 2633, yalnız `b.form` ile karşılaştırır) · `js/grammatik.js:699` `G.yakin` · `js/grammatik.js:798` `G.bosPruef` (fiil boşluğu)
- kanıt (log):
  - `2026-11-06 09:52:23;luecke;v643:satz;werden;Deswegen _____ oft nicht an diese Menschen … gedacht;werden;falsch;wird;… not:m1` (yeni çekirdek, 5.11 düzeltmesinden sonra)
  - `2026-11-05 05:34:36;luecke;v347:satz;können;In bestimmten Fällen _____ der Arzt …;können;falsch;kann;not:m1`
  - `2026-11-01 08:29:33;luecke;v429:satz;regnen;Es hat gestern den ganzen Tag _____.;regnet;falsch;geregnet;farklı`
  - ayrıca 3.11 18:45:00 (wird ↔ werden) ve 4.11 06:45:25 (darf ↔ kann: bu başka fiil, adil)
  - Harness (`bulgular/log-1/h.js`): `G.yakin('können','kann')` = null, `('werden','wird')` = null, `('regnet','geregnet')` = null. Yani bugün de `falsch`.
  - Gece işi `daten/feedback.js` (5.11 05:34, v347:satz) bunu "fast … sistem haksız saydı" diye yazmış, ama kod değişmemiş.
- beklenen / gerçek: Tuna doğru fiili yazıyor, çekimi yanlış. 5.11 kararına göre bu `fast` + "çekim" (m2) olmalı. Gerçekte `falsch` + m1 alıyor ve fiilin anlam hafızası düşüyor.
- önerilen düzeltme: metin boşluğunda öğe kimliği biliniyor (`b.id`). `uPruef(w, b.form)`'a öğeyi geçin. Cevap `formIdx().get(w)` (ya da küçük harfli hâli) `=== b.id` ise, ya da fiilin `inf / praesensForms / praeteritumForms(ptForm) / p2s` kümesindeyse sonuç `{ u:'fast', cekim:true, hinweis:'çekim: '+form }` olsun. Aynısı `G.bosPruef`'te fiil boşluğu için (`frageBos`, `G.luecke(v, …)`) yapılsın: `bosPruef(inp, l.answer, alts, { fiil: v })` ile fiilin biçim kümesine bakılsın.

### 2. artOb: dişil isme Nom/Akk ipucuyla "der" yazmak `fast` sayılıyor, artikel hafızası 3 alıyor
- önem: yüksek
- tür: haksız not (fazla cömert)
- yer: `js/app.js:892–905` `artObPruef` (`cinsOk = cift.some(c => c.startsWith(g))`), `js/app.js:908–916` `notVerF`
- kanıt: `2026-11-07 17:17:36;art;n0433:art;die Geduld;Für diese Arbeit fehlt mir einfach ___ Geduld. [Nom/Akk];der;fast;die;… not:a3 | hâl:Nom/Akk | hâl`
  - Geduld artikelde 13 kez unutulmuş (`zustand.json` `items.n0433.art.lapses = 13`). Tuna'nın bilinen hatası "der Geduld" (feedback 5.11 05:35: "der Geduld → die").
  - Soru hâli açıkça veriyor ([Nom/Akk]). Kelimenin dişil olduğunu bilen biri "der" yazmaz. "der" burada eril Nominativ'e (derN) tam uyuyor.
- beklenen / gerçek: beklenen `falsch` + "artikel der → die", a1. Gerçekte `fast` + "hâl", a3 aldı: artikel hafızası ödüllendirildi.
- önerilen düzeltme: `artObPruef`'te sırayla bakın. (1) Yazılan biçim, istenen hâllerde (`ks`) başka bir cinsiyete uyuyorsa (`cift.some(c => !c.startsWith(g) && ks.includes(c.slice(-1)))`), sonuç `falsch` + "artikel u → z", `artOb.dogru = false` olsun. (2) Yalnız doğru cinsiyete başka hâlde uyuyorsa `fast` + "hâl" kalsın. Aynı belirsizlik eril isimde "die" için de var: "die" dişil Nom/Akk mı, çoğul mu? Ama Dat/Gen ipucunda eril "der" yazmak (dişil Dat) da cinsiyet hatası sayılmalı.

### 3. Metin boşluğu, büyük harfli isimleri fiil / sıfat sanıyor (yanlış öğeye m1)
- önem: yüksek
- tür: içerik hatası + haksız not
- yer: `js/app.js:2487` `aktSaetze` (`m.get(c) || m.get(c.charAt(0).toLowerCase() + c.slice(1))`: cümle ortasında da küçültüyor). Aynı dosya `kontextSaetze` 739'da bu **düzeltilmiş** ("büyük harfle küçültme yalnız cümle başında (ortadaki "Schienen" isim, scheinen fiili değil)") ve dönüşlü fiil süzgeci (742) de var. `aktSaetze`'de ikisi de yok.
- kanıt:
  - `2026-10-31 16:02:29;luecke;v447:satz;scheinen;Der Name Eisenbahn kommt von den _____, auf denen sie fährt …;scheint;falsch;Schienen;… not:m1`. Tuna'nın scheinen hafızası, hiç öğrenmediği die Schiene yüzünden m1 aldı.
  - Bütün metinlerde ayrıştırma (harness `bulgular/log-1/t3.js`, cümle ortasında büyük harfli, isim sözlüğünde olmayan, küçültünce eşleşen): Unternehmen → unternehmen (19 geçiş), Schienen → scheinen (3), Boten → bieten (3), Stand → stehen (2), Stahl → stehlen, Zwang → zwingen, Weile → weil, Fahrt → fahren, (im) Laufe → laufen, Stille → still, Versprechen → versprechen …
- beklenen / gerçek: boşluk yalnız gerçekten o öğenin biçimine açılmalı. Gerçekte başka kelime boşluk oluyor ve yanlış öğenin hafızası düşüyor.
- önerilen düzeltme: `aktSaetze`'deki eşlemeyi `kontextSaetze` ile aynı yapın (küçültme yalnız `i === 0`, iki nokta / tırnak sonrası; dönüşlü fiil cümlede zamir yoksa eşleme yok). Ortak bir `tokEsle(ws, i)` yardımcısı iki yerde de kullanılsın. Ayrıca `das Unternehmen` (Goethe B1'de var) `nomen_extra.txt`'e eklenebilir.

### 4. Çok kelimeli öğede (vor allem) yalnız ilk kelime boşluk oluyor, tam cevap "yanlış"
- önem: orta
- tür: haksız not / içerik hatası
- yer: `js/app.js:1381–1398` `wortLuecke` (`w = wById[id].de.split(/[ …]+/)[0]`, tek token boşluk)
- kanıt: `2026-11-04 06:48:11;nsatz;w0522:nsatz;vor allem;Grüßen Sie alle von mir, _____ allem Frau Meier.;vor allem;falsch;vor;… not:m1 | farklı`
- beklenen / gerçek: soru "vor allem" kalıbını soruyor. Tuna kalıbın tamamını doğru yazdı ama `falsch` + m1 aldı.
- önerilen düzeltme: öğenin bütün kelimeleri cümlede art arda geçiyorsa hepsini tek boşluk yapın (`answer = 'vor allem'`). Ayrıca `bosPruef`'te giriş "cevap + boşluktan sonra metinde zaten yazılı kelime(ler)" ise `richtig` sayılsın. Etkilenen öğeler: woerter.txt'teki boşluklu öğeler (vor allem, jedes Mal, sich Mühe geben, eingespannt sein, vor Gericht gehen …).

### 5. Gramer cümlesinde eksik virgül → `fast` + "kaynaştırma"
- önem: orta
- tür: haksız not (yanlış etiket)
- yer: `js/gramer.js:356–358` `cumlePruef`: `G.pruefen` virgülü ayrı token sayıyor → `falsch`. Sonra gramer `fold` virgülü siliyor (`.replace(/,/g,'')`) ve sonuç `fast` + `['kaynaştırma']` oluyor.
- kanıt: `2026-11-07 17:23:46;gram;g:vergleich:90;…;Es gab mehr Arbeit als ich erwartet habe.;richtig;Es gab mehr Arbeit, als ich erwartet habe.;… kaynaştırma | ghost:0 | öneri:fast | sek:68`. Tuna "aslında doğru" dedi, itirazı haklı. Harness: `Gr.pruef(vergleich:90, …)` hâlâ `fast ["kaynaştırma"]`. `G.cumleKontrol` aynı cevaba `richtig` veriyor.
- beklenen / gerçek: CLAUDE.md'ye göre noktalama sayılmaz (5.11: "nokta olmadan doğru"). Beklenen `richtig` (ya da `fast` + "virgül"). Gerçekte `fast` + "kaynaştırma" çıktı; bu etiket in dem / im içindir.
- önerilen düzeltme: `cumlePruef`'in başında, iki tarafta virgüller atılmış hâlleri karşılaştırın. Eşitse `richtig` dönsün. Kaynaştırma kontrolü yalnız `kaynasAc(...)` gerçekten bir şey değiştirdiyse "kaynaştırma" etiketi versin.

### 6. Gramer `ceviri` / `umform` kontrolü eski `G.pruefen`'i kullanıyor: Çalış'taki ölçütle tutarsız
- önem: orta
- tür: haksız not
- yer: `js/gramer.js:354` `cumlePruef` → `Gx().pruefen(...)`. Çalış'ın tam cümlesi `G.cumleKontrol` kullanıyor.
- kanıt (harness, `bulgular/log-1/t4.js`, `t5.js`):
  - `reflexiv:48` "Ich habe mich gestern für **eine** Prüfung angemeldet" sonucu `falsch` (tek artikel farkı). `cumleKontrol`'de bu `fast` olur.
  - eksik virgül (bulgu 5) `cumleKontrol`'de `richtig`.
  - `es-korrelat:139` (7.11 17:29:59) "…, ärgert **es** mich" için etiket "farklı" (`pruefen` 'fazla kelime' etiketi tanımıyor: `grammatik.js:788`). `cumleKontrol` "fazla kelime" diyor.
  - `reflexiv:85` (7.11 17:25:30) ayrılan önek "an" için "edat" etiketi çıkıyor (`PRAEP` regex'i).
- beklenen / gerçek: aynı cümle hatası iki bölümde farklı not ve etiket alıyor.
- önerilen düzeltme: `cumlePruef`'te `G.cumleKontrol(giris, alts)` ile hizalayın ve etiketleri ondan alın. Konuya özgü sertlik (ör. kasus konusunda artikel hatası `falsch`) teil etiketine göre ayrıca yükseltilsin. Mevcut ek kurallar (zarf, özne uyumu, konuşma dili) korunsun.

### 7. `G.yakin` gerilemesi: sondaki çift harf eksikse "çekim" (m2) çıkıyor
- önem: orta
- tür: haksız not (gerileme)
- yer: `js/grammatik.js:707–708` (`p >= 3 && ekMi(ra) && ekMi(rb) && (!ra || …)` → `ra = ''`, `rb = 'n'` iken 'cekim'). `pruefenLemma` önce `yakin === 'yazim'` döngüsüne giriyor ama `yakin` 'cekim' döndüğü için yazım hiç denenmiyor. `cumleKontrol`'deki `ckKok` (`grammatik.js:858`) de yazım hoşgörüsünden önce çalışıyor.
- kanıt:
  - `2026-11-07 17:21:36;wort;x1563:wort;der Feuerwehrmann;…;der Feuerwehrman;fast;…;not:m2 | kurtarma | çekim`
  - Aynı yazım hatası: `2026-10-27 20:25;wort;…;der Feuerwehrman;fast;… kısmi | yazım` (m3).
  - Harness: `yakin('Feuerwehrman','Feuerwehrmann')` = 'cekim'. Dikte örneği "Diese Schmerztableten …": `Dinle.diktePruef` sonucu `fast ["artikel/çekim"]`, kat 'ek' (doğrusu yazım).
- beklenen / gerçek: beklenen "yazım" (m3, kısmi). Gerçekte "çekim" (m2) çıkıyor ve etiket Tuna'ya yanlış ders veriyor.
- önerilen düzeltme: `yakin`'de ek kuralından önce şu kontrol olsun: kısa olan uzunun bir harfi silinmiş hâliyse ve silinen harf komşusunun tekrarıysa (mm → m, nn → n, tt → t), sonuç `yazim`. `ckKok`'ta da aynı kontrol yapılsın, ya da `dlev = 1` ve çift harf farkı yazım sayılsın.

### 8. Dikte: bileşik isim ayrı yazılınca "yanlış"
- önem: orta
- tür: haksız not
- yer: `js/dinle.js:38` `diktePruef` → `G.cumleKontrol` (token hizalaması birleşik kelimeyi tanımıyor)
- kanıt: `2026-11-07 17:22:07;akt;diktat:n0994;…;Diese schmerz Tabletten gibt es nur auf Rezept;falsch;Diese Schmerztabletten …;fazla kelime | yanlış kelime | dikte:kelime`. Harness da aynı sonucu veriyor.
- beklenen / gerçek: duyduğunu doğru yazmış, yalnız bitişik yazmamış (ve küçük harf). Beklenen `fast` + "yazım (bitişik)", gerçek `falsch`.
- önerilen düzeltme: `cumleKontrol`'ün `ckTok` sonrasında, öğrencinin art arda iki tokeninin birleşimi (küçük harf) hedefteki bir tokene eşitse ikisini tek token yapın ve 'yazim' ilişkisi verin.

### 9. Gramer log'unda teil etiketi gerçek hata gibi yazılıyor
- önem: orta
- tür: hata (log / analiz)
- yer: `js/gramer.js` `notla` notiz: `n !== 3 && teil.etiket ? [teil.etiket] : []` (q.tags'ten önce)
- kanıt:
  - `2026-11-06 13:11:54 g:satzklammer-tekamolo:67` "nachste Woche ; mit dem Flugzeug" → `fast | kelime sırası`. Sıra doğru, hata umlaut. Ekranda etiket yoktu.
  - `2026-11-07 17:26:45 g:vergleich:86` "gesagt" → "kelime sırası". Gerçek hata: yardımcı fiil eksik.
  - `2026-11-06 13:07:17 g:reflexiv:48` → "yardımcı fiil". habe doğruydu.
  - `2026-11-07 17:29:59 g:es-korrelat:139` → "kelime sırası | farklı". Gerçek hata: fazla es.
- beklenen / gerçek: CLAUDE.md "Sonuçlarıma bak 3. tekrarlayan hata etiketlerini say" bu etiketlere dayanıyor. Bu yüzden sayım bozuluyor (gece notu 5.11: "kelime sırası ×5").
- önerilen düzeltme: teil etiketini `konu:<etiket>` önekiyle yazın ya da hiç yazmayın. Bulunan etiket yoksa ve cevap yazılı türdeyse `G.cumleKontrol` etiketleri eklensin.

### 10. "Bilmediklerim": iki doğrudan sonra gelen yanlışlar listeyi geri açmıyor
- önem: orta
- tür: hata
- yer: `js/gramer.js` `notla`: `api.bilmedik(...)` yalnız Bilmiyorum'da ya da `n === 3`'te çağrılıyor. `js/app.js:403` `bilmedikIsle`.
- kanıt: `zustand.json` `bilmedik["g:es-korrelat:wegfall"] = { d: 2, dt: 6.11 }` ("artık biliyorsun"). Sonra aynı teil'de iki yanlış var: `2026-11-07 17:20:33 g:es-korrelat:113 falsch` ve `17:29:59 g:es-korrelat:139 falsch`. Liste değişmedi.
- beklenen / gerçek: Tuna yine bilmiyor ama listede "biliyorsun" yazıyor.
- önerilen düzeltme: `falsch` cevapta, kayıt varsa `d = 0, dt = 0` yapın (kelimelerde de aynısı: ana turda falsch → `bilmedikIsle(id, ad, false)` ama `n` artmasın).

### 11. 30 gün cümle kuralı eski kayıtları saymıyor (birleştirme t:0 yapıyor)
- önem: orta
- tür: hata (tekrar)
- yer: `js/kern.js:1005` `Kern.birlestir` (`typeof e === 'string' ? { s: e, t: 0 }`). `js/app.js:1430` `kxListe` yalnız düz metni `KX_ESKI` sayıyor; `t:0` nesnesi `kxSay`'de 30 günün dışında kalıyor.
- kanıt: `zustand.json` `kontext`: 236 kaydın 217'si `t:0`. `v157` (bringen) "Die Abendzeitung hat einen Bericht über den Unfall _____." 9. kez soruldu: 15.10, 16.10, 17.10, 18.10, 19.10, 28.10, 31.10, 1.11 ve **7.11 17:24:15**. Son 30 günde 3 kez sorulmuşken yine geldi. Kayıtta `{s:…, t:0}` + `{s:…, t:7.11}`.
- beklenen / gerçek: 6.11'de söz verilen "aynı cümle 30 günde ≤ 2" kuralı geçmişi görmüyor.
- önerilen düzeltme: `birlestir`'de düz metni `{ s, t: KX_ESKI }` yapın, `kxListe`'de `t < KX_ESKI` olanları `KX_ESKI` sayın. Daha iyisi: açılışta bir kez `S.log`'dan `(id, frage)` ile geçmişi doldurun (boşluklu cümle → doğru cümle).

### 12. Goethe sınav metinleri (Prüfung Lesen seti) metin boşluğuna ve "metinde" sorusuna giriyor
- önem: orta
- tür: kural ihlali
- yer: `js/app.js:2481` `aktSaetze` ve `js/app.js:733` `kontextSaetze`, `LT`'nin hepsini kullanıyor (`GOETHE_LESEN` dahil). `lesenWaehlen` `!x.aufgaben` ile süzüyor, bu ikisi süzmüyor. `js/pruefung.js:35` aynı seti sınavda kullanıyor.
- kanıt: `2026-11-07 17:45:31;luecke;v140:satz;bewegen;In der Sendung ging es um das Sitzen …;… kaynak:ge1` (ge1 = Goethe-Institut Übungssatz). Daha önce de `2026-10-16 22:48:31 … kaynak:ge…`.
- beklenen / gerçek: CLAUDE.md: "Goethe Übungssatz … okuma havuzunda değil", "taze deneme kalsın". Gerçekte sınav metninin cümleleri alıştırmada görünüyor.
- önerilen düzeltme: iki yerde de `LT.filter(x => !x.aufgaben)` kullanın.

## B. İçerik hataları

### 13. sich wenden an: Partizip / Präteritum yalnız "gewendet / wendete"
- önem: orta
- tür: içerik hatası
- yer: `quellen/verben.txt:647` (`sich wenden an`, `daten/verben.js` v642: `p2 gewendet, pt3 wendete`). `js/app.js:1657` `stammTekPruef` yalnız `hedef` ile karşılaştırıyor.
- kanıt: kök sorusu `2026-11-06 13:11:10` ve `2026-11-07 17:19:48` ("wenden — Perfekt", loesung "gewendet"). "sich an jemanden wenden" anlamında yaygın biçim "hat sich … **gewandt** / wandte sich" (gece düzeltmesi 6.11 13:11 de bunu yazmış). Kodda "gewandt" `falsch` olur (kod yolu izlendi; log'da henüz yazılmadı, doğrulanmadı).
- önerilen düzeltme: v642 için p2 `gewandt` (alternatif `gewendet`), pt `wandte / wendete`. `stammTekPruef`'e alternatif biçim listesi (`v.p2alt`, `v.ptalt`) eklensin.

### 14. Öğe "selbe" tek başına kullanılmaz
- önem: düşük
- tür: içerik hatası
- yer: `quellen/woerter.txt:601` `selbe | pron | 3 | aynı (im selben Haus)`. Goethe listesinde "selb-" ve "derselbe, dieselbe, dasselbe" var.
- kanıt: `2026-11-07 17:28:05;prod;w0597:prod;selbe;…;selben;fast;… çekim`. Tuna ipucundaki biçimi (im selben) yazdı, küçük hata aldı.
- önerilen düzeltme: öğe "derselbe / dieselbe / dasselbe" olsun ya da yazma sorusu yerine cümlede boşluk sorulsun (im ___ Haus → selben). Kısa vadede `selben` alternatif olarak kabul edilsin.

### 15. Service cümlesine "den Pizza-Service anrufen" alternatifi eksik
- önem: düşük
- tür: içerik hatası
- yer: `quellen/wort_saetze.txt:1293` `n1082 | der Service | Rufst du beim Pizza-Service an? | Pizza servisini arıyor musun?`
- kanıt: `2026-11-03 18:43:53 … Rufst du die Pizza Service an?; richtig (öneri:falsch)`. Türkçe "servisini arıyor musun" doğrudan Akkusativ çağrıştırıyor. Tuna'nın cevabı yine yanlıştı: artikel "die" (der Service, bu kelime artikelde takılıyor), itirazla m3 aldı.
- önerilen düzeltme: `Rufst du beim Pizza-Service an? || Rufst du den Pizza-Service an?`. Ayrıca itirazla "aslında doğru" deyince fark edilen artikel hatası notta görünsün (bkz. D).

## C. Düşük önemli bulgular

### 16. Gramer etiket kalitesi (`G.pruefen`)
- önem: düşük · tür: hata · yer: `js/grammatik.js:766–788`
- kanıt: yalnız fazla kelime → "farklı" (17:29:59). Ayrılan önek `an` → "edat" (17:25:30). Ordnen'de parçalar küçük harfle verildiği hâlde "groß/klein" etiketi çıkıyor. Bulgu 6 uygulanırsa çözülür.

### 17. Fiil boşluğunda "çekim" etiketi + "Yanlış" başlığı bir arada
- önem: düşük · tür: arayüz
- kanıt: `2026-11-06 13:07:46 satz v590 "vergelauft" → falsch | çekim`. `tipAus` 'yanlis' veriyor ama `artikel/çekim` → "çekim" çevirisi (`app.js:3566`) etiketi korunuyor. Başlık ✗, etiket çekim: çelişkili mesaj.
- öneri: `tip === 'yanlis'` iken "çekim" etiketi "yanlış biçim" ya da "Partizip: verlaufen" olsun.

### 18. Yayından sonraki ilk oturum eski kodla çalıştı
- önem: düşük · tür: diğer (çıkarım: doğrulandı sayılmaz)
- kanıt: 6.11 13:06–13:08:39 satırlarında `ipucu-tür` yok. Aynı aralıkta reps 6 olan `der Schatten` (13:07:52) ve `fließend` (13:08:31) seçmeli, `der Fall` kurtarmada "metinde" (13:07:26) olarak sorulmuş. Yeni `Kern.basamak` bunlara izin vermez (`kern.js:254, 280`). 13:08:39'dan sonra tur yarıda kalıyor (log'da tur satırı yok) ve 13:09:26'dan itibaren yeni biçimler (artOb, ayir, duy) başlıyor. Service worker "kabuk önbellekten" eski sürümü bir oturum boyunca sundu.
- öneri: yeni sürüm hazır olunca Bugün ekranında "güncelle" düğmesi gösterilsin ya da tur başında `skipWaiting` + yeniden yükleme yapılsın.

### 19. Küçük harfle başlayan metin boşluğu (cümle başı)
- önem: düşük · tür: haksız not
- kanıt: `2026-11-04 06:47 luecke w0315 "manche" (cümle başı Manche) → fast | yazım, büyük/küçük harf` (m3 kısmi). `uPruef` 2200: yalnız harf büyüklüğü farkı `fast`.
- öneri: boşluk cümlenin ilk kelimesiyse büyük / küçük harf farkı `richtig` sayılsın.

### 20. feedback.js'te yanlış / yanıltıcı bilgiler (gece işi)
- önem: düşük (orta: ilk madde yanlış Almanca öğretiyor)
- tür: içerik hatası
- yer / kanıt:
  - `daten/feedback.js:537` (g:reflexiv:48): "edat für ya da zu + **Akk**". Yanlış: zu + **Dativ** (zur Prüfung = zu der). Alıştırmanın kendi açıklaması doğru ("zu + Dativ").
  - `daten/feedback.js:541` (der Verein): "ver-/ein kelimesi gibi: der Verein, der Eingang". Böyle bir kural yok, yanıltıcı.
  - `daten/feedback.js:475` (die Geduld): "-ld ile değil, -uld: die Geduld; Schuld da die". Uydurma kural (CLAUDE.md: emin olmadığın Almanca ekleme).
  - `daten/feedback.js` 5.11 05:34 (v347:satz können → kann) ve diğer "sistem haksız saydı" notları "fast" diyor, ama kod yalnız düzenli ekler için düzeldi (bulgu 1). Geçmiş sekmesinde Tuna "küçük hata" görüyor, uygulama "yanlış" sayıyor.
  - VERLAUF 4.11: satzklammer-tekamolo:96 itirazı "haklı (fast adil)" denmiş. "Ich habe **zu** meinem Bruder eine lange Nachricht geschrieben" bir edat hatası; kurala göre `falsch` doğru karardı, itiraz haklı değildi.
- öneri: 537'deki Akk → Dat olsun, 541 ve 475'teki kurallar silinsin.

---

## D. İtirazlar (`öneri:`), 26.10'dan beri 9 satır

| zaman | soru | cevap | sistem → Tuna | değerlendirme |
|---|---|---|---|---|
| 10-31 16:23:25 | es-korrelat:16 | Gibt es eine Aphoteke in der Nähe? | falsch → richtig | Cümle geçerli (alternatiflerde var), Aphoteke yazım hatası (h yer değiştirmiş, dlev 2). Doğrusu `fast`; itiraz biraz cömert, sistem sert (bugün de `falsch`). |
| 10-31 17:26:41 | es-korrelat:24 | … dass du mir hlifst | falsch → richtig | Yazım hatası. Bugünkü kod `fast` veriyor (doğru). İtiraz biraz cömert. |
| 11-03 18:43:53 | Service cümle | Rufst du die Pizza Service an? | falsch → richtig | İtiraz cömert: die Service artikel hatası. İçerikte "den Pizza-Service" alternatifi eksik (bulgu 15). |
| 11-03 18:49:44 | tuerkisch-fallen:87 | Darf ich ihnen helfen? | fast → richtig | ihnen / Ihnen anlamı değiştiriyor, `fast` adildi. İtiraz cömert. |
| 11-03 18:54:30 | es-korrelat:125 | Heute gibt es Viele Leute im Park | falsch → richtig | Geçerli Almanca ama hedef yapı (es düşer → "Heute sind") yok. `fast` makul, `richtig` cömert. |
| 11-04 06:52:24 | tekamolo:96 | … zu meinem Bruder … | falsch → fast | Edat hatası: `falsch` doğruydu. İtiraz (ve gece onayı) cömert. |
| 11-04 06:54:11 | modalverben:51 | … schalfen … | falsch → richtig | Yazım hatası. Bugün `fast` (doğru). İtiraz biraz cömert. |
| 11-05 05:45:26 | tekamolo:9 | … am Montan … | falsch → richtig | Aynı durum. Bugün `fast`. |
| 11-07 17:23:46 | vergleich:90 | … Arbeit als ich … (virgülsüz) | fast → richtig | **İtiraz haklı**: sistem virgülü "kaynaştırma" saydı (bulgu 5). İtirazdan sonra log'da "kaynaştırma" etiketi kalmış. |

Sistem itirazdan sonra notu doğru uyguladı (ergebnis = Tuna'nın seçimi, `öneri:` = ilk karar). Tek tutarsızlık: itiraz edilen satırda eski etiketler duruyor. İtirazların çoğu yazım hatalarında "aslında doğru" seçilmesi; bugünkü kodda bunlar `fast` olduğu için bu tür itiraz azalmalı.

## E. Tekrar örüntüsü / ilerleme / sayaçlar

- **Seçmeli oranı:** 26.10 – 6.11 10:50 arasında %32 (1020 cevabın 323'ü). Yeni sürümde ~%10 (138'in 14'ü). Yeni kodla gelenlerin hepsi tanıtım günü (`parti`, reps ≤ 1) ya da ilk kalıcı tekrar (sorgen für, reps 1 → 2). Eski kodla gelen 3 istisna için bkz. bulgu 18.
- **Kuyruk:** yanlıştan sonra 3–5 soru sonra yaz0 ile yeniden soruluyor: eher 17:17:49 → 17:18:27 → 17:19:04 (tekrar:2 doğru), drüben, anwesend, Gleichberechtigung, sich wenden an, sich fürchten vor, sich verlaufen. Turda öğe başına ≤ 2 yeniden sorma kuralına uyuluyor. eher 3 dakikada 4 kez sorulmuş (3 yazma + 1 ayır); bu tasarım gereği.
- **ayır ile aktarım:** drinnen ~ drüben ayırmasında doğru (17:17:58), 50 sn sonra drüben yazmasında "drinnen" (17:18:48, leech). Seçmeli ayırt etme, üretime aktarılmıyor.
- **Basamak / hafıza:** log ile `zustand.json` tutarlı. feucht zor `yaz` doğru → m4, bm 2, ds 3. Gleichberechtigung leech, S 0,4. Geduld: anlam S 70 ama artikel S 0,22 / 13 lapses; Feuerwehr: artikel 6 lapses; Wetterbericht: artikel 5 lapses. Artikel, hafızanın en zayıf yeri. Bulgu 2 yüzünden Geduld'un artikel hafızası bir kez haksız büyüdü.
- **Gün sayaçları:** 7.11 `tage.n = 90` = 7 tur satırının cevap toplamı (12+15+12+12+12+15+12). doğru 61, küçük 7, yanlış 22 de birebir tutuyor. 6.11'de 125 = 9 tur (112) + yarıda kalan 4 (eski kod) + bitmeyen son 6 + 3 akt. Tutarlı.
- **Aynı cümle:** bringen kök cümlesi 9 kez sorulmuş, kural çalışmıyor (bulgu 11). Gleichberechtigung seçmeli Türkçe istemi 8 kez soruldu, bu eski kodda.

## F. En sık hata türleri (26.10 – 7.11, 332 fast / falsch, sprechen ve akt hariç)

| tür | sayı | örnekler |
|---|---|---|
| Artikel (flaş + öbek) | 42 | Rezept (die ×3), Feuerwehr (das / der / des ×4), Geduld (der / das ×3), Gewitter (die ×2), Vorurteil, Missverständnis (die), Supermarkt (das), Gymnastik (das), Regel (der), Wetterbericht, Humor / Roman (das) |
| Artikel yazmada (kelime doğru) | 20 | Humor, Wetterbericht, Feuerwehr, Geduld, Respekt (das), Wohnsitz, Wert, Art, Verein, Preis (die) |
| Kelime karıştırma (yazma) | ~45 | eigen / eignen ×3, drinnen / drüben ×3, anwesend → allerdings ×2, übrig / übrigens ×2, eher / eben, fließend / fleißig, zuverlässig / zufällig, überweisen / übertreiben, unter- / verschreiben, Wert / Würde, Wärme / Weiß, Verhalten / Bedürfnis, Behauptung / Mahnung |
| Metin boşluğu | 22 | çoğu çekim (kann, wird, fährt, Projekten, Apotheken): bulgu 1 |
| Yazım / umlaut | 20 | Gehirn, Kommilitone, Wettbewerb, Feuerwehrmann, Gleichberechtigung, schweigen, besichtigen |
| Seçmeli anlam | 23 | (yeni sürümde 1) |
| Bilmiyorum / boş | 16 | Ehrenamt, bedürftig, Patenschaft, Nachhilfe, betreuen, verantwortlich, Bedürfnis, deutlich, finanzieren |
| Çekim / ek (doğru kelime) | 15 | fett → fette, heiß → heißer, Partizip (bleibt, unterschreibt) |
| Kök (stamm) | 13 | gebliebt ×2, durfter, wendet, gebrachten, Präsens er/sie (trifft, stimmt zu, rasiert sich) |
| Gramer | ~100 | reflexiv 12 (mir / mich, sich eksik, edat: um / auf / für), es-korrelat 12 (wegfall: dass-cümlesi başta es kalıyor), vergleich 9 (als + yan cümlede fiil sonda: "erwartet habe", "gesagt haben"), satzklammer / verbstellung 15 (deshalb + V-S, TeKaMoLo), Perfekt'te sein (umsteigen, fahren), n-Deklination (Fotografen, Polizisten) |

İçerik önerisi: (1) karışan çiftlere ayır yerine yazma ile karşıtlık cümleleri (eigen / eignen, drinnen / drüben, übrig / übrigens, anwesend / allerdings); (2) artikel leech'leri (Geduld, Feuerwehr, Rezept, Wetterbericht, Gewitter, Vorurteil) için öbek içinde cümleler; (3) es-korrelat wegfall ve vergleich/satz teil'lerine z2 yazma alıştırması; (4) sich + Dativ / Akkusativ (mir / mich) çiftleri.

---
Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/log-1/` (h.js harness, t1–t5.js kontrol yeniden çalıştırma, t3.js metin eşleme taraması, a1–a5.py log analizi).
