# log-3 — Tuna'nın cevapları (26.10 – 7.11.2026), öncelik: gramer, dinleme, tam cümle

**Özet**
- Toplam 23 bulgu: 4 yüksek, 12 orta, 7 düşük. 26.10'dan beri 1348 satır, yeni sürüm (6.11 ~13:09'dan, ilk `ipucu-tür` / `ayir` / `duy` satırları) sonrası 162 satır tek tek okundu. Gramer satırlarının hepsi (`gram`, 135 not alan satır) bugünkü `Gramer.pruef` ile yeniden koşturuldu (`log-3/gram_rerun.js`).
- En zararlı haksız notlar: (1) çok kelimeli "diğer" öğelerde (vor allem, sich Mühe geben, ein bisschen … 27 öğe) cümle boşluğu yalnız ilk kelimeyi siler, tam ifadeyi yazan Tuna yanlış alır; (2) metin boşluğunda büyük harfli isim küçük harfe çevrilip fiile bağlanıyor (Schienen → scheinen, Unternehmen ×19 → unternehmen); (3) metin / boşlukta mastar yazınca (können → kann, löschen → gelöscht) kelimeyi biliyor olsa da m1.
- En zararlı cömertlik: artOb'da dişil isme "der" yazmak "hâl" sayılıp artikel notu 3 alıyor (die Geduld: art hafızasında 13 lapse, Tuna "der Geduld" diye biliyor); Sie/Ihnen boşluğunda küçük harf ("ihnen") tam doğru; Konjunktiv II'de umlautsuz "hatte / Hattest" küçük hata.
- Gramer log etiketleri güvenilmez: her yanlış satırın başına teil'in sabit etiketi yazılıyor (umlaut hatası → "kelime sırası", doğru cümle → "yardımcı fiil"). Gece işinin "tekrarlayan etiket sayımı" bu yüzden bozuk.
- Dinleme (`duy` 9 satır, `hoer` 4 satır) notları adil; tek sorun dikte: bileşik kelimeyi ayrı yazmak ("schmerz Tabletten") tam yanlış + `dikte:kelime`.
- Doğru çalışanlar (doğrulandı): yeni sürümde seçmeli 12/123 cevap (%10), hepsi tanıtım partisi ya da ilk kalıcı tekrar; yanlıştan sonra kuyruk 3–5 soru sonra yaz0 ile geliyor (eher, drüben, anwesend, Gleichberechtigung, sich wenden an); `tage` sayaçları log'la birebir aynı (3.11: 82, 4.11: 134, 5.11: 115, 6.11: 125, 7.11: 90). Aynı cümle / kelime aşırı tekrarı yok (son 2 günde en çok 4 kez: v481, v642, w0119 = kuyruk).
- Gece feedback'inde 3 yanlış ya da tutarsız düzeltme var (vor allem'de Tuna suçlanmış, Schienen hatası sistem hatası olarak görülmemiş, ehrenamt → "sistem haksız" fazla cömert).

---

## YÜKSEK

### 1. Çok kelimeli "diğer" öğelerde cümle boşluğu yalnız ilk kelimeyi siler; tam ifadeyi yazan yanlış alır
- önem: yüksek
- tür: haksız not / içerik hatası
- yer: `js/app.js:1381` `wortLuecke` (k === 'w' dalı: `wById[id].de.split(/[ …]+/)[0]`), `frageLueckeStufe` (`js/app.js:1495`), `G.bosPruef`
- kanıt: log 3444 `2026-11-04 06:48:11;nsatz;w0522:nsatz;vor allem;Grüßen Sie alle von mir, _____ allem Frau Meier.;vor allem;falsch;vor;… farklı`. Tuna öğeyi ("vor allem") doğru yazdı, m1 aldı. Bugünkü kodla yeniden: `G.bosPruef('vor allem','vor')` → `falsch ["farklı"]`. Aynı sorun log 2026-10-24 10:26:49 `w0599:nsatz` ("einspanned sein", boşluk yalnız `eingespannt`). Etkilenen 27 öğe: als ob, ein bisschen (boşluk "ein"), entweder … oder, gar nicht ("gar"), je … desto, jedes Mal, noch mal, ein paar, sowohl … als auch, um … zu, vor allem, weder … noch, wie viel, zwar … aber, eingespannt sein, vor Gericht gehen, zur Verfügung stehen ("zur"), untersagt sein, brauchen … zu, durch den Kopf gehen, zur Seite gehen, einerseits … andererseits, nicht nur … sondern auch, sich Mühe geben (boşluk "sich": "Er gibt _____ große Mühe" → cevap "sich"), eine Entscheidung treffen ("eine"), einen Vertrag schließen, den Faden verlieren.
- beklenen / gerçek: soru ifadenin kendisini sormalı; ya bütün parçalar boşluk olmalı ya da tam ifade kabul edilmeli. Gerçek: anlamsız tek kelimelik boşluk (ein / sich / zur), doğru ifade "farklı".
- önerilen düzeltme: `wortLuecke`'de çok kelimeli `de` için (… olanları parçalara bölüp) her parçayı sırayla cümlede bul, hepsini `_____` yap ve `n` = parça sayısı döndür (fiil dalındaki `G.luecke` gibi); "sein" / "sich" gibi çekimli parçaları (eingespannt *sein*, *sich* Mühe *geben*) içerik kelimesine indir (yalnız eingespannt, Mühe). Ek güvenlik: `G.bosPruef` çağrısında `alts` olarak öğenin tam `de`'sini ver (cevap tam ifadeyse ve cümledeki geri kalan kelimeleri tekrar ediyorsa `fazla kelime` → fast m3, artikel kuralı gibi). Bu düzeltilene kadar `lueckeVar` (`js/app.js:383`) çok kelimeli 'w' öğelerinde false dönsün.

### 2. Metin boşluğunda büyük harfli isim küçük harfe çevrilip fiile / bağlaca bağlanıyor (Schienen → scheinen)
- önem: yüksek
- tür: hata / haksız not
- yer: `js/app.js:2488` `aktSaetze` (`m.get(c) || m.get(c.charAt(0).toLowerCase() + c.slice(1))`), aynı geri dönüş `js/app.js:2091` `wortSuchen` (okumada bakılan kelime); `formIdx` (`js/app.js:2073`) fiil Präteritum'u + ek (`schien`+`en`), woerter + ek (`weil`+`e`)
- kanıt: log 3034 `2026-10-31 16:02:29;luecke;v447:satz;scheinen;Der Name Eisenbahn kommt von den _____, …;scheint;falsch;Schienen` → Tuna'ya "scheinen" ipucuyla (Türkçe anlamı kutuda) "Schienen" boşluğu soruldu, m1 scheinen hafızasına yazıldı. Bütün okuma metinlerinde tarama (`log-3/formidx.js`): cümle içinde büyük harfle geçip yalnız küçük harf geri dönüşüyle eşleşen isimler: Unternehmen ×19 → v558 unternehmen, Schienen ×3 → scheinen, Boten ×3 → bieten, Stand ×2 → stehen, Stahl → stehlen, Zwang → zwingen, Fahrt → fahren, Weile → w0544 weil, Stille → still, Lächeln, Leiden, Aussehen, Versprechen … (113 farklı eşleşmenin önemli kısmı).
- beklenen / gerçek: cümle ortasındaki büyük harfli kelime ancak isimse (nomen listesinde) eşleşmeli. Gerçek: fiilin / bağlacın anlamıyla isim boşluğu soruluyor; Türkçe ipucu yanlış ("girişmek" → das Unternehmen = şirket).
- önerilen düzeltme: `aktSaetze` ve `wortSuchen`'de küçük harf geri dönüşünü yalnız cümlenin ilk tokeninde (ya da `„`/`:` sonrası) yap; cümle ortasında büyük harfli token için yalnız `m.get(c)` ve sonuç isim (`n`/`x`) değilse `null`. `formIdx`'te woerter'e ek eklerken yalnız sıfat sınıfına (kl === 'adj') ek ekle (weil+e = Weile olmasın).

### 3. artOb: dişil isme Nom/Akk boşluğunda "der" yazmak "hâl hatası" sayılıp artikel notu 3 alıyor
- önem: yüksek
- tür: haksız not (fazla cömert)
- yer: `js/app.js:892` `artObPruef` (`AO_BICIM['der'] = ['derN','dieD','dieG']` → `cinsOk` die için true)
- kanıt: log 3845 `2026-11-07 17:17:36;art;n0433:art;die Geduld;Für diese Arbeit fehlt mir einfach ___ Geduld. [Nom/Akk];der;fast;die;… bicim:artOb | not:a3 | … | hâl`. Aynı kelimede Tuna'nın gerçek hatası cinsiyet: 3750 (6.11) `Geduld → der` falsch, 3596 (5.11) `der Geduld` fast a1; zustand `n0433.art`: reps 21, lapses 13, S 0,22. Sistem cinsiyeti "doğru" sayıp art hafızasına 3 yazdı.
- beklenen / gerçek: Nom/Akk yuvasında "der" eril Nominativ'dir; en olası açıklama cinsiyet hatası → falsch a1 `artikel der → die`. Gerçek: fast a3, `hâl`.
- önerilen düzeltme: `artObPruef`'te `u` istenen hâllerden birinde başka bir cinsiyet için geçerli biçimse (`cift.some(c => !c.startsWith(g) && ks.includes(c.slice(-1)))`) önce cinsiyet hatası say (falsch). Yalnız istenen hâllerde hiçbir cinsiyete uymayan ama doğru cinsiyetin başka hâli olan biçim (dem yerine das) `hâl` fast olsun.

### 4. Boşlukta mastar / başka biçim yazmak (können → kann, löschen → gelöscht) tam yanlış, bewegen → bewegt küçük hata: tutarsız
- önem: yüksek
- tür: haksız not
- yer: `js/grammatik.js:699` `G.yakin` (yalnız ek farkı / tek harf; ablaut ve ge- yok), kullananlar `js/app.js:2196` `uPruef` (metin boşluğu), `G.bosPruef`, `pruefenLemma`
- kanıt: Tuna metin boşluklarında sık mastar yazıyor: 3588 `2026-11-05 05:34:36 luecke v347:satz … _____ der Arzt … ;können;falsch;kann` (m1), 2992 `2026-10-30 11:33:33 v378:satz;löschen;falsch;gelöscht` (m1), 3241 `2026-11-01 08:29:33 v429:satz;regnet;falsch;geregnet` (m1), 3330 `2026-11-03 18:45:00 v643:satz;wird;falsch;werden`, 3234 `2026-11-01 kommen → kommt` (o gün falsch). Bugünkü kodla: `G.yakin('können','kann')` → null, `('löschen','gelöscht')` → null, `('regnet','geregnet')` → null, `('wendet','gewendet')` → null; ama `('bewegen','bewegt')` → 'cekim' (log 3935 `2026-11-07 17:45:31` fast m2). Gece işi de 492'de "können → kann: sistem haksız saydı" yazmış.
- beklenen / gerçek: hedef fiilin herhangi bir biçimi (mastar, Präsens, Präteritum, Partizip) yazıldıysa kelime biliniyor: fast `çekim` (m2), anlam m1 değil.
- önerilen düzeltme: `uPruef` / `bosPruef` / `pruefenLemma`'ya öğe kimliği verilebilsin (aktPruef `b.id`'yi biliyor); fiilde girdi `[v.inf, v.p2s, v.ptForm(+st,n,en,t), …praesensForms(v)]` kümesindeyse ve hedef biçimden farklıysa `{ u: 'fast', cekim: true }`. İsimde aynı: lemma / çoğul / +n/+en biçimleri.

---

## ORTA

### 5. Tam cümlede yalnız virgül eksikse "küçük hata + kaynaştırma"
- önem: orta
- tür: haksız not / yanlış etiket
- yer: `js/gramer.js:357` `cumlePruef` ilk satır: `fold()` virgülleri siler, sonra `kaynasAc(fold(...))` eşitliği "kaynaştırma" döner
- kanıt: log 3872 `2026-11-07 17:23:46;gram;g:vergleich:90;…;Es gab mehr Arbeit als ich erwartet habe.;richtig;Es gab mehr Arbeit, als ich erwartet habe.;… kaynaştırma | ghost:0 | öneri:fast | sek:68` — Tuna itiraz etmek zorunda kaldı. Yeniden: `Gr.pruef(vergleich:90, 'Es gab mehr Arbeit als ich erwartet hatte.')` → `fast ["kaynaştırma"]`.
- beklenen / gerçek: virgül farkı ya doğru (ordnen'de olduğu gibi) ya da fast + `virgül`. Gerçek: fast + yanlış etiket "kaynaştırma" (in dem / im ile ilgisi yok).
- önerilen düzeltme: `cumlePruef` başında: `virgulsuz(giris) === virgulsuz(alt)` ise `{ urteil: 'fast', tags: ['virgül'] }` (ya da richtig); kaynaştırma kontrolünü virgülsüz ama kaynaştırma farkı gerçekten olan durumla sınırla (`kaynasAc(x) !== x`).

### 6. Gramer log'unda teil'in sabit etiketi gerçek hata gibi yazılıyor
- önem: orta
- tür: hata (log / analiz)
- yer: `js/gramer.js` `notla` (`notiz = [...].concat(n !== 3 && teil.etiket ? [teil.etiket] : [], q.tags…)`); luecke / text / wahl hiç tanı etiketi üretmez (`pruef` → `tags: []`)
- kanıt: 3815 `2026-11-06 13:11:54 g:satzklammer-tekamolo:67 … nachste Woche ; mit dem Flugzeug;fast;… kelime sırası` — sıra doğru, hata umlaut. 3713 `2026-11-06 09:48:34 g:reflexiv:21` (cümle zaten doğruydu, Tuna "einer"e dokundu) → "yardımcı fiil". 3887 `2026-11-07 17:25:30 g:reflexiv:85` → "dönüşlü zamir | kelime sırası | edat | groß/klein": mir doğruydu (ilk etiket teil'den), "edat" ayrılabilen önek `an` (PRAEP regex'i), groß/klein karolardan gelen küçük "heute". 3896 `vergleich:86 gesagt` → "kelime sırası" (gerçek: yardımcı fiil eksik). 3377 `gefalt` → "kelime sırası". 26.10'dan beri gram falsch/fast satırlarında "kelime sırası" 36 kez; luecke/text/wahl/fehler satırlarındaki 56 etiketin hepsi sabit teil etiketi.
- beklenen / gerçek: etiket hatayı anlatmalı; gece işi CLAUDE.md 3. adımda bu etiketleri sayıyor.
- önerilen düzeltme: teil etiketini ayrı alanla yaz (`teil:kelime sırası`) ya da yalnız `q.tags` boşsa; `parcaPruef` fold eşleşmesinde `umlaut`, kaynaşmada `kaynaştırma`, konuşma dilinde mevcut etiketi döndürsün ve luecke bunları `tags`'e toplasın; `G.pruefen`'deki PRAEP etiketini cümle sonundaki ayrılabilen önekte (`an`, `auf`, `mit` son token) verme.

### 7. Boşlukta ilk harfin büyük/küçüklüğü yok sayılıyor: "ihnen" = "Ihnen" tam doğru
- önem: orta
- tür: haksız not (fazla cömert)
- yer: `js/gramer.js:323` `parcaPruef` (`low1(u) === low1(norm(h))`)
- kanıt: `2026-11-04 06:48:49 g:tuerkisch-fallen:12 | Ich danke ___ für die Einladung. (Sie) | ihnen | richtig | Ihnen`; `2026-11-03 18:55:30 g:tuerkisch-fallen:45` (text) `ihnen ; mir ; Sie` → richtig, doğrusu `Ihnen ; mir ; Sie`. Konu tam da hitap (Sie / Ihnen). Aynı Tuna tam cümlede `Darf ich ihnen helfen?` (3369) için fast + groß/klein aldı: tutarsız.
- beklenen / gerçek: cümle ortasındaki boşlukta (ve isimlerde) harf büyüklüğü anlam taşır; en az fast `büyük/küçük harf`. Gerçek: richtig.
- önerilen düzeltme: `low1` yalnız boşluk cümle başındaysa (`soru` içinde `___` öncesinde yalnız boşluk / `.?!` varsa) uygulansın; diğer durumda büyük/küçük farkı fast + `büyük/küçük harf`, hedef `Sie|Ihnen|Ihr…` ise falsch.

### 8. Konjunktiv II'de umlautsuz biçim (hatte / Hattest) küçük hata
- önem: orta
- tür: haksız not (fazla cömert)
- yer: `js/gramer.js:323` `parcaPruef` (`fold` eşleşmesi → 'fast', etiketsiz)
- kanıt: 2884 `2026-10-28 11:05:59 g:konjunktiv2:tani:33 | ___ du Lust …? (haben · Konjunktiv II) | Hattest | fast | Hättest`; 3124 `2026-10-31 16:10:53 g:konjunktiv2-verg:tani:29 | hatte ; studiert | fast | hätte ; studiert`. Bugün de aynı (`gram_rerun.out`). Benzer: 3461 `fahrt ; zur Arbeit` → fast (fährt; fahrt ihr-biçimi).
- beklenen / gerçek: umlautsuz biçim başka bir dilbilgisel biçimdir (Präteritum); Konjunktiv II konusunun ölçtüğü şey tam bu → falsch (en az etiketli fast `umlaut`). Gerçek: etiketsiz fast; ekranda "≈ Küçük hata", hiçbir açıklama yok.
- önerilen düzeltme: fold eşleşmesinde umlautsuz girdi bilinen bir fiil biçimiyse (hatte, konnte, wurde, musste, durfte, war, fahrt …: `G.lexSetzen` sözlüğü) ya da konu `konjunktiv2*` ise falsch + `umlaut (başka biçim)`; değilse fast + `umlaut`.

### 9. Dikte: bileşik kelimeyi ayrı yazmak tam yanlış + "dikte:kelime"
- önem: orta
- tür: haksız not
- yer: `js/dinle.js:40` `diktePruef` → `G.cumleKontrol`
- kanıt: 3870 `2026-11-07 17:22:07;akt;diktat:n0994;dinle–yaz;Diese Schmerztabletten gibt es nur auf Rezept.;Diese schmerz Tabletten gibt es nur auf Rezept;falsch;…;fazla kelime | yanlış kelime | dikte:kelime`. Yeniden (`log-3/dikte.js`): `schmerz Tabletten` → falsch; `Schmerz-Tabletten` → fast yazım; `Deutsch Kurs` → falsch. Ayrıca `hoche` (hohe) → falsch "yanlış kelime" (4 harfli kelimede yazım hoşgörüsü yok).
- beklenen / gerçek: Tuna sesi doğru duymuş; bitişik yazım hatası fast + `yazım` (dikte:yazım). Gerçek: falsch, dinleme hatası gibi kayıt.
- önerilen düzeltme: `diktePruef`'te `cumleKontrol`'dan önce: girdideki ardışık iki tokenin birleşimi (küçük harfle) hedefteki tek tokene eşitse birleştir ve `bitişik yazım` etiketiyle fast'e indir. Kısa kelimelerde (≤ 4 harf) tek harf farkı ve aynı kök ise `ek` (fast) say.

### 10. Zor soruda yavaşlık kontrolü hiç çalışmıyor (yazma cevaplarında `sure` yok)
- önem: orta
- tür: hata
- yer: `js/app.js:3549` `auswerten` → `sonuc` nesnesinde `sure` yalnız artOb için var; `js/kern.js:128` `ZOR_YAVAS` (`(s.sure || 0) > ZOR_YAVAS[b]`) hep 0 görür
- kanıt: 3890 `2026-11-07 17:26:14;prod;w0165:prod;feucht;…;richtig;… bicim:yaz | not:m4 | … | zor | sek:29` — `ZOR_YAVAS.yaz` = 25 sn, yine de m4 (FSRS "kolay") ve `yavaş` yok. 15.10'dan beri log'da yazma biçimlerinde tek "yavaş" etiketi yok (yalnız seçmelide).
- beklenen / gerçek: 25 sn üstü zor doğru → m3 + `yavaş`; seviye atlamaz.
- önerilen düzeltme: `auswerten`'de `sonuc.sure = weissNicht ? null : now() - q.start` (seçmelide olduğu gibi). Tam cümlede `yardim` zaten var; yazmada CLAUDE.md'deki "yavaş 3 (+0,7)" kuralı da böylece devreye girer.

### 11. `G.yakin` sondaki tek harf eksik / fazlalığı "çekim" sayıyor (Feuerwehrman)
- önem: orta
- tür: haksız not
- yer: `js/grammatik.js:699` `yakin`: ilk kural (ortak önek ≥ 3, kalan '' ve 'n') yazım kontrolünden önce 'cekim' döner
- kanıt: 3869 `2026-11-07 17:21:36;wort;x1563:wort;der Feuerwehrmann;…;der Feuerwehrman;fast;…;not:m2 | … | çekim` (aynı kelime 27.10'da `yazım` m3 almıştı: 2787). Yeniden: `G.yakin('Feuerwehrman','Feuerwehrmann')` → 'cekim'; `('durfter','durfte')` → 'cekim' (kök sorusunda `derece` 'cekim'i 2 sayar → 3891 `2026-11-07 17:26:24 durfter` falsch k1).
- beklenen / gerçek: Mann → Man çift ünsüz eksikliği yazım (m3); isimde "çekim" anlamsız (sorulan biçim Nominativ). Gerçek: m2 + "çekim".
- önerilen düzeltme: `yakin`'de 'cekim' dönmeden önce: fark yalnız sondaki çift harfin tekilleşmesi / bir harf eklenmesi ve girdi sözlükte (`LEX`) yoksa 'yazim'. İsim lemma sorusunda girdi bilinen çoğul / çekimli biçim değilse 'cekim' verme.

### 12. Bilmediklerim: yanlış cevap "artık biliyorsun" sayacını sıfırlamıyor
- önem: orta
- tür: hata
- yer: `js/app.js` `bilmedikIsle` (yalnız "bilmiyorum" d = 0 yapar); `js/gramer.js` `notla` `api.bilmedik(...)` yalnız bilmiyorum ya da n === 3'te çağrılır
- kanıt: zustand `bilmedik["g:es-korrelat:wegfall"] = { d: 2, dt: 6.11 09:47 }` → Zayıflar'da "artık biliyorsun". Aynı teil cevapları: 31.10 falsch ×2, 3.11 falsch, 4.11 richtig, 5.11 falsch ×2, 6.11 richtig, 7.11 17:20 falsch, 17:29 falsch, 17:45 richtig (fehler, tek dokunuş). Son 10 cevabın 7'si yanlış.
- beklenen / gerçek: d yalnız yanlışsız günlerde artmalı; yanlış (bilmiyorum olmadan da) d'yi 0'a çekmeli.
- önerilen düzeltme: `notla`'da `n === 1` iken de `api.bilmedik(key, ad, 'yanlis')` çağır; `bilmedikIsle`'de anahtar varsa ve `dogru === 'yanlis'` ise `d = 0` (n artmadan). Kelimeler için aynı çağrı `hafizaYaz` yanlış dalında.

### 13. "Hatayı bul" (fehler): hata aralığındaki doğru kelimeye dokunmak da doğru
- önem: orta
- tür: haksız not (fazla cömert)
- yer: `js/gramer.js` `cevapla` fehler dalı (`u.hata.split(/\s+/).includes(tok)`); içerik `quellen/grammatik/*.txt` hata alanları
- kanıt: 2944 `2026-10-30 11:28:45 g:adjektiv:57 | In unserer Straße gibt es einen neue Supermarkt. | einen | richtig` (hata = "einen neue"; einen doğru, hatalı kelime neue). 946 fehler alıştırmasının 360'ında hata aralığı çok kelimeli (adjektiv:5 "den neue", adjektiv:107 "einem kleine Dorf", genitiv:41 "des hohen Preis", artikelwoerter:21 "Alle Student muss" …).
- beklenen / gerçek: Tuna artikelin yanlış olduğunu sanıp "einen"e dokundu; sistem "doğru" dedi, yanlış inancı pekiştirdi.
- önerilen düzeltme: z2'de kabul edilen tokenler = soru cümlesinde olup `cevap[0]`'da aynı yerde olmayan tokenler (diff'in `del` tarafı); yalnız ekleme hatasında (fühle heute → fühle mich heute) aralık kalsın. İçerikte aralıkları çekirdek kelimeye daraltmak da olur.

### 14. Tam cümlede tek kelimede iki harf kayması (Aphoteke) "farklı cümle" → tam yanlış
- önem: orta
- tür: haksız not
- yer: `js/gramer.js:357` `cumlePruef` yazım dalı (`yakin(...) === 'yazim'` → `yazimTok`: < 10 harfte yalnız dlev 1)
- kanıt: `2026-10-31 16:23:25 g:es-korrelat:16 | Yakınlarda bir eczane var mı? | Gibt es eine Aphoteke in der Nähe? | richtig (öneri:falsch, itiraz)`. Bugün yeniden: `falsch ["farklı"]` — "Gibt es eine Apotheke in der Nähe?" kabul edilen alternatif, tek fark Aphoteke (h kayması, Damerau 2). Konu es-gibt, hedef yapı kusursuz.
- beklenen / gerçek: fast `yazım`. Gerçek: falsch "farklı" (itiraz edilmezse ghost + teil yanlış).
- önerilen düzeltme: cümle içinde tek içerik kelimesinde (≥ 7 harf, işlev kelimesi değil, sözlükte başka kelime değil) dlev ≤ 2 → fast `yazım`; yalnız konu hedefi o kelime değilse.

### 15. Çok boşluklu metin (text) yarısı yanlışsa küçük hata
- önem: orta
- tür: haksız not (fazla cömert)
- yer: `js/gramer.js` `pruef` text dalı (`detay.filter(x => x !== 'falsch').length / n >= 0.5 ? 'fast'`)
- kanıt: `2026-11-03 18:55:07 g:reflexiv:76 | uns ; sich ; sich ; euer | fast | uns ; euch ; sich ; euch` — 4 dönüşlü zamirin 2'si yanlış (konunun kendisi). `2026-11-04 20:57:19 g:reflexiv:57 | an ; mich ; auf | fast | um ; mich ; auf` (sich bewerben um: edat yanlış; CLAUDE.md'ye göre edat → falsch).
- beklenen / gerçek: konunun hedef boşluğu (zamir, edat) yanlışsa falsch; en az ¾ doğru → fast. Gerçek: %50 → fast.
- önerilen düzeltme: eşik 0.75; ayrıca her boşluk falsch ise ve hedef kelime türü zamir / edatsa toplam falsch.

### 16. treffen'in Türkçesi "sich treffen mit" ile aynı; "sich treffen" yazan yanlış alıyor
- önem: orta
- tür: içerik hatası / haksız not
- yer: `quellen/verben.txt:532` `treffen | A | 1 | (biriyle) buluşmak, karşılaşmak` ve `:533` `sich treffen mit | mit+D | 2 | (biriyle) buluşmak`; `js/app.js` `synTreffer` edatsız yazımı tanımıyor
- kanıt: 3044 `2026-10-31 16:03:05;abr;v527:abr;treffen;(biriyle) buluşmak, karşılaşmak;sich treffen;falsch;treffen (Akk);… dönüşlü, sich fazla`. Gece feedback (365) "karşılıklı anlamda sich treffen ayrı" diyerek yanlışı onaylamış.
- beklenen / gerçek: "(biriyle) buluşmak" için "sich treffen (mit)" doğru Almanca. Gerçek: m1.
- önerilen düzeltme: v527 Türkçesi: `(birine) rastlamak; (birini) görmek, buluşmak (jemanden treffen)` gibi ayırt edici; `synTreffer`'de anlamdaşın edatsız yazımı (`sich treffen` ↔ `sich treffen mit`) da eşleşsin ("başka fiil, tekrar dene").

---

## DÜŞÜK

### 17. wenden — Perfekt yalnız "gewendet"; "sich wenden an"da yaygın biçim "gewandt"
- önem: düşük
- tür: içerik hatası
- yer: `quellen/verben.txt:647` `sich wenden an | an+A | 3 | (birine) başvurmak` (çekim alanı yok → Goethe "wenden, wendete, hat gewendet"); `js/app.js:1657` `stammTekPruef` alternatif kabul etmiyor (`G.pruefen(…, [], {lemma:true})`)
- kanıt: 3807 `2026-11-06 13:11:10 v642:stamm wenden — Perfekt | wendet | falsch | gewendet`, 3863 (7.11) `gewendet` richtig. Gece feedback 545 "gewandt da olur" diyor ama sistem kabul etmez.
- önerilen düzeltme: 5. alana `wendet, wandte/wendete, hat gewandt/gewendet`; `stammTekPruef` hedefte `/` ile ayrılmış alternatifleri `alts` olarak versin.

### 18. vergleich:8 — tekil "Die Miete … ist billiger als in München" kabul edilmiyor; ist/sind "yardımcı fiil" etiketi
- önem: düşük
- tür: içerik hatası
- yer: `quellen/grammatik/vergleich.txt` alıştırma 8 (ceviri, "Bremen'de kiralar Münih'tekinden daha ucuz.")
- kanıt: 3769 `2026-11-06 09:53:57 … Die Miete in Bremen ist günstiger als Münih | falsch` (asıl hata "als Münih": doğru falsch). Yeniden: `Die Miete in Bremen ist billiger als in München.` → falsch ["yardımcı fiil","artikel/çekim"].
- önerilen düzeltme: alternatiflere `Die Miete in Bremen ist billiger als in München. || Die Miete ist in Bremen günstiger als in München. || In Bremen ist die Miete günstiger als in München.` ekle. `G.pruefen`'de kopula `ist/sind` farkını "yardımcı fiil" değil "fiil çekimi" etiketle.

### 19. n1082 cümlesine alternatif eksik; itirazla "die Pizza Service" tam doğru oldu
- önem: düşük
- tür: içerik hatası / kural (itiraz)
- yer: `quellen/wort_saetze.txt:1293` `n1082 | der Service | Rufst du beim Pizza-Service an? | Pizza servisini arıyor musun?`
- kanıt: 3323 `2026-11-03 18:43:53;nsatz;n1082:nsatz;…;Rufst du die Pizza Service an?;richtig;Rufst du beim Pizza-Service an?;… öneri:falsch`. "den Pizza-Service anrufen" de doğru; Tuna'nın tek hatası artikel (die; 6.11'de flaşta da `Service → die` falsch).
- önerilen düzeltme: Almanca alanına `|| Rufst du den Pizza-Service an?` ekle (build → `alts`); böylece "die" fast + `artikel/çekim` alır, itiraz gerekmez.

### 20. "Aslında doğru" itirazı dilbilgisi hatasını da tam doğruya çeviriyor
- önem: düşük
- tür: kural ihlali (not sistemi verir)
- yer: `js/gramer.js` `cevapla` `serbest` düğmeleri; `js/app.js` `auswerten` `itirazVar`
- kanıt: itirazlar (9 satır, 26.10 – 7.11): haklı 5 (Aphoteke, hlifst, schalfen, Montan: tek yazım hatası → ilk karar falsch sertti, 5.11'den sonra 3'ü düzeldi; virgül → bulgu 5); fazla cömert 3: `2026-11-03 18:49:44 tuerkisch-fallen:87 "Darf ich ihnen helfen?"` fast → richtig (ihnen = onlara; hitap konusu), `2026-11-03 18:54:30 es-korrelat:125 "Heute gibt es Viele Leute im Park"` falsch → richtig (hedef "es düşer" yapısı atlanmış), Pizza "die" (bulgu 19); makul 1: `satzklammer:96 zu meinem Bruder` falsch → fast.
- önerilen düzeltme: etiket `groß/klein` ve hedef `Sie/Ihnen/Ihr`'de, ya da etiketler konunun etiketini içeriyorsa "aslında doğru" yerine yalnız "küçük hata say" sunulsun. Gece işi `öneri:` satırlarında bu üçünü düzeltsin.

### 21. Gece feedback'inde yanlış / tutarsız düzeltmeler
- önem: düşük
- tür: içerik hatası
- yer: `daten/feedback.js`
- kanıt: satır 459 (`w0522:nsatz`, 4.11): "Boşluk yalnız vor (allem cümlede zaten var)" — sistem hatası (bulgu 1) Tuna'ya mal edilmiş. Satır 363 (`v447:satz`, 31.10): "scheinen fiil, burada isim gerekirdi" — soru yanlış kelimeye bağlanmış (bulgu 2), not haksız. Satır 507 (`w0625:nsatz`, 5.11): "ehrenamt → ehrenamtlichen: kök doğru, çekim hatası, sistem haksız" — ehrenamt isim, ehrenamtlich sıfat; başka kelime, falsch yerinde. Tutarsızlık: 492 "können → kann: sistem haksız" ama 532 "werden → wird" normal yanlış (aynı hata türü).
- önerilen düzeltme: bu dört kaydın metnini düzelt; `tools/istem_gece.md`'ye "boşluk tek kelimeyse ve öğe çok kelimeliyse sistem hatası say; metin boşluğu öğeyle uyuşmuyorsa (isim ↔ fiil) sistem hatası say" ekle.

### 22. Kök (stamm) ve artikel yanlışlarında tur içinde yeniden sorma yok; momentum log'da görünmüyor
- önem: düşük
- tür: diğer
- yer: `js/kern.js:699` `oturumIsle` (yalnız `secim.tur === 'm'`); momentum / zayıflık bayrağı notiz'e yazılmıyor
- kanıt: "gebliebt" aynı hata 28.10 10:48:22 ve 7.11 17:17:15 (ikisinde de turda tekrar yok); `wenden → wendet` (6.11), `durfter` (7.11) tekrar yok. 6.11 13:11:17 `n0602 die Kasse` S 4,5'te yaz0 (ipuçlu → bm yükselmez) geldi; notiz'de neden yok (önceki iki cevap yanlış → momentum; yalnız kod okunarak bulundu).
- önerilen düzeltme: kök yanlışında aynı turda bir kez `kokSatz` (başka cümle) kuyruğa; ısınma / kurtarma gibi `momentum` ve `zayıf:R<0,5` notiz bayrağı.

### 23. Başka kelime yazınca "artikel / ek" etiketi
- önem: düşük
- tür: yanlış etiket
- yer: `js/grammatik.js` `pruefen` (ilk 3 harfi aynı token çifti → 'artikel/çekim'), `js/app.js:3567` isimde "artikel / ek"e çevrilir
- kanıt: 3792 `2026-11-06 13:08:39 x1567:nsatz der Pate | Patenscahft | falsch | Pate | artikel / ek`; 3243 `2026-11-01 Gemeinsam → Gemeinschaft | artikel / ek`.
- önerilen düzeltme: ilk 3 harf kuralını `G.yakin(x,t) === 'cekim'` ile değiştir; değilse `farklı kelime`.

---

## Kontrol edilip sorun bulunmayanlar
- Dinleme: `duy` 9 satır (kelime 4, boşluk 3, dikte 2; 6–7.11) hepsi richtig ve adil (nokta / büyük harf yok sayılıyor). `hoer` 4 satır: warm/Farm, fühlen/füllen, Fichte/fischte doğru; Zeh/See (7.11 17:28:09) Tuna "See" seçti, okunan Zeh → falsch doğru. Minimal çiftler doğru kurulmuş.
- Seçmeli (S4): 6.11 13:09'dan sonra 12 seçmeli; 10'u tanıtım partisi, 1'i ilk kalıcı tekrar (v481 anla, reps 1), 1'i (w0170 sec, 13:08:31, reps 6) yeni kod yüklenmeden önceki tur (o satırda `şık:` alanı yok). Kural çalışıyor.
- Kuyruk: anlam yanlışından sonra deneme 2 yaz0 3–5 soru sonra (eher +5/+4, drüben +3, anwesend +5, Gleichberechtigung +3, sich wenden an), aynı öğe turda ≤ 2 yeniden sorma.
- Gün sayaçları: `tage[gün].n` log'daki notlu satır sayısıyla aynı (3.11–7.11); `tageC` tek cihaz.
- Tekrar: son 2 günde aynı öğe en çok 4 kez (kuyruk), aynı cümle 2 kez (Tafel cümlesi: duy-bosluk); gram konu dağılımı reflexiv 28, vergleich 21, verbstellung 17, tuerkisch-fallen 17, es-korrelat 16 (3–7.11).
- Leech: 6–7.11'de n1375, w0109, n0474, x1551 → kanca n1375'te var, diğer üçü 7.11'de ilk kez leech (gece işi henüz koşmadı).
- Yeni sürüm sonrası gram satırlarının bugünkü kodla yeniden notlanması log'la aynı (yalnız virgül satırı: itirazla richtig, kod fast).

## Tuna'nın en sık hata türleri (26.10 – 7.11, falsch/fast; içerik eklemek için)
- **Artikel (79):** die → der 15, das → der 14, der → die 14, die → das 11, der → das 10, das → die 8. En çok: die Geduld (4 + artOb; art hafızasında 13 lapse), die Feuerwehr 4, das Rezept 3, das Gewitter, der Wetterbericht, das Missverständnis, die Gymnastik, der Supermarkt (2'şer). "der" tahmini baskın (29).
- **Kelime karıştırma (≈ 47 "farklı / kelime yanlış"):** drüben ↔ drinnen (3), eher ↔ eben (3), eigen ↔ eignen (2), anwesend ↔ allerdings (2), fließend ↔ fleißig, sogar ↔ sonder(n), der Wert ↔ die Würde, unterschreiben ↔ verschreiben, das Verhalten ↔ das Bedürfnis, die Behauptung ↔ die Mahnung, die Wärme ↔ weiß, hageln ↔ donnern, übertreiben ↔ überweisen.
- **Partizip II yanlış kurulum (≈ 10):** gebliebt (2×: 28.10, 7.11), vergelauft, anmeldet, umgesteigt, heiratet, regnet (geregnet), löschen (gelöscht), gebrachten, wendet. → ge- konumu (an-ge-meldet, um-ge-stiegen), ver-/be- öneksiz ge-, düzensiz Partizip -en.
- **Perfekt'te sein/haben (3):** haben gefahren, habe umgesteigt, bin mich verlaufen.
- **"es" düşmesi (es-korrelat/wegfall, 6):** "Dass …, ärgert/freut es mich" ısrarla es koruyor (31.10 ×2, 3.11, 5.11 ×2, 7.11 ×2).
- **als-yan cümlesinde çekimli fiil eksik (4):** "als ich erwartet" (habe yok) 6.11, 5.11, 7.11 ×2.
- **Dönüşlü fiil + edat (4):** sich vorbereiten *auf* (zu), sich kümmern *um* (für), sich bewerben *um* (an), sich anmelden *für* (an); dönüşlü zamir eksik (sich fürchten, sich anmelden) 2; mir/mich (Dativ dönüşlü) 3.
- **Kelime sırası:** deshalb + V2 (deshalb ich gehe) 2; ayrılabilen önek yeri (sehe mir an einen Film) 1.
- **Yazım (21 kısmi):** çift ünsüz (Kommilitone, Wettbewerb, Feuerwehrmann), sch → sc (scweigen, bescichtigen, gescrieben), İngilizce -ed (eingespanned ×3), harf kayması (Aphoteke, schalfen, hlifst).
- **Bilmiyorum (11 satır):** Ehrenamt, bedürftig, verantwortlich, Bedürfnis, deutlich, betreuen, Nachhilfe, Organisation, finanzieren, gram: statt-zu, vergleich/nicht-so, modalverben/praeteritum.

Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/log-3/` (gram_rerun.js + .out, yak.js, dikte.js, formidx.js, new.txt, gram_old.txt, word_old.txt).
