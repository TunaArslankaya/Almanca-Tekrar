# kod-3: kod + veri incelemesi (7.11.2026)

**Özet**
- Birim testleri geçiyor: test_kern 665, test_grammatik, test_goc 76, test_dinle 13. `pruef_grammatik.py`: 0 hata, 3 uyarı. `gramer_ozkontrol.js`: 5433 alıştırmada 0 sorun. Ama `fehler` türünü (946 alıştırma) hiç denemiyor; onları ayrıca denetledim, sorun çıkmadı. `build.py` kopyada aynı çıktıyı üretiyor.
- **Veri kaybı riski (yüksek):** klasör bağlı değilken `S.pending` hiç boşalmıyor. Bütün log localStorage'daki ana kayıtta birikiyor; kota dolunca `save()` sessizce başarısız olur.
- **İçerik (yüksek):** `quellen/glossen.txt` 842–942. satırlar bir satır kaymış. Yaklaşık 60 cümlede tam cümle sorusunun "Yardım" çipleri başka cümleye ait.
- **Haksız not (orta-yüksek):** fiil ile zarf arasında dönüşlü zamir ya da `gern` varsa geçerli Vorfeld dizilişi (Gestern habe ich mich …) "kelime sırası" sayılıyor. Sonuç: fast + m2.
- **Çekim hatası (orta):** rechnen / berechnen / zeichnen / unterzeichnen için ihr biçimi "rechnt" üretiliyor (stichprobe: "Rechnt ihr mit dem Regen?").
- **Senkron (orta):** uygulama her gizlendiğinde, değişiklik olmasa da `log/zustand.json` commit'leniyor. 7.11'de 37 dakikada 21 "ilerleme" commit'i oldu.
- Ayrıca: sayılar ("10" / "zehn") yanlış kelime sayılıyor. Gün sınırı 00:00 ile 04:00 arasında karışık. Goethe ayrıştırma artıkları var ("übernommen.", "Cafées"). Küçük içerik hataları da var.

---

### 1. `S.pending` klasör bağlı değilken sınırsız büyüyor → localStorage kotası → sessiz kayıt kaybı
- önem: yüksek
- tür: hata (veri kaybı) / performans
- yer: `js/app.js:3877-3885` (`logEintrag`: `S.pending.push(e)`), `js/app.js:3922-3946` (`dateiSchreiben`: yalnız `ordner` varken `S.pending.splice`), `js/app.js:268-277` (`save`: `S` `pending` dahil bütünüyle `almanca-tekrar-v1`'e yazılıyor; yalnız `S.log` 3000'de kesiliyor), `js/kern.js:1044` (`birlestir` yerel `pending`'i aynen taşıyor).
- kanıt: `S.pending` yalnız File System Access klasörü bağlıyken boşalıyor. Telefonda bu API yok; masaüstünde de klasör bağlanmadıysa her log satırı sonsuza dek `pending`'de kalıyor. Playwright ile denedim (`bulgular/kod-3/pend.js`): gerçek `zustand.json` yüklendi, 14 adım cevaplandı, sonra localStorage'daki `pending` 0'dan 15'e çıktı ve hiç azalmadı. GitHub'a giden `zustand.json` `pending: []` yazdığı için uzakta görünmüyor; yalnız cihazda büyüyor. `log.csv`'de bugüne kadar 3941 satır var (≈ 300 karakter/satır). Kotayı ana kayıt (≈ 400 K) + `almanca-tekrar-log` (3000 satır ≈ 0,9 M) + `pending` paylaşıyor; günde ~100–150 satırla birkaç ay içinde 5 M karakter sınırına varılır. Ondan sonra `save()` yalnız `console.warn('kaydedilemedi')` der: o andan sonraki bütün ilerleme sayfa yenilenince kaybolur. Ayrıca her cevapta (`logEintrag` → `save`) büyüyen `pending` dizisi yeniden `JSON.stringify` ediliyor.
- beklenen / gerçek: `pending` yalnız klasör hedefi için tutulmalı. Gerçekte bütün log ana kayıtta birikiyor.
- önerilen düzeltme: `logEintrag`'da `S.pending.push` yalnız `ordner || ordnerWartet` varken yapılsın. Ya da `save()`'de `pending` bir üst sınırla kesilsin (ör. son 3000 satır). Açılışta (`baslat`) klasör yoksa `S.pending = []`. `save` hata verirse kullanıcıya görünür uyarı gösterilsin (toast / durum satırı), yalnız konsol yetmez.

### 2. `glossen.txt` 842–942. satırlar: gloss bir satır aşağı kaymış (yanlış "Yardım")
- önem: yüksek
- tür: içerik hatası
- yer: `quellen/glossen.txt:842-942` (→ `daten/glossen.js`). Gösterim: `js/app.js` `hilfeHTML` (tam cümle sorusu, tanıtım örnek cümlesi).
- kanıt: Her satırın glossu bir önceki cümleye ait. Satırlar arasında komşu karşılaştırması yaptım (`bulgular/kod-3/shift.js`); 842–942 arasında 60 satırda gloss anahtarı o cümlede yok, bir önceki cümlede var. Örnekler:
  - 842 `Wollen Sie einen Kaffee? | der Arzt = doktor` (841 "Peter will Arzt werden. | -")
  - 845 `Wünsch mir Glück! | der Geburtstag`
  - 846 `Herr Ober, zahlen bitte! | das Glück`
  - 866 `Ich zweifle nicht an deiner Geduld. | recht haben`
  - 867 `Viele Leute zweifeln an der Wettervorhersage … | die Geduld = sabır`
  - 870 `Wir haben uns auf der Party gut amüsiert. | hungrig = aç`
  - 875 `Hast du dich für die Prüfung angemeldet? | der Deutschkurs`
  - 888 `Ich ziehe mich schnell an. | die Prüfung = sınav; bestehen = geçmek`
  - 942 `Warum beschwerst du dich immer? | der Nachbar; laut`
  
  Blok `saetze.txt`'in sonunu (wo… → zw…) ve `saetze_refl.txt`'in başını (amüsieren → beschweren) kapsıyor. Bu cümlelerde Tuna tam cümle yazarken alakasız kelime yardımı görüyor; asıl gereken gloss ise bir sonraki cümlede kalıyor.
- beklenen / gerçek: her cümlenin kendi glossu olmalı. Gerçekte gloss bir önceki cümleninki.
- önerilen düzeltme: 842–942 aralığında gloss sütununu bir satır yukarı kaydır: 841'in glossu = 842'deki, …, 941'in glossu = 942'deki; 942 için yeni gloss yaz. Sonra `build.py`. Kalıcı koruma için `build.py`'de gloss anahtarlarının (lemma kökü) cümlede geçmesini denetleyen bir uyarı ekle. Ayrılabilir fiil ve umlautlu çoğul için gevşek eşleşme gerekir; benim sezgisel denetimim 426 aday verdi, çoğu ayrılabilir fiil yüzünden yanlış pozitifti.

### 3. Tam cümle: dönüşlü zamir (ya da gern) varken geçerli Vorfeld dizilişi "kelime sırası" → fast, m2
- önem: orta-yüksek
- tür: haksız not
- yer: `js/grammatik.js:906-912` (`ckZarf`), `913-935` (`ckVaryant`). Not etkisi `js/app.js:1523` (`yapi` → `cumleYapi`) ve `js/kern.js:141` (m2).
- kanıt (`G.cumleKontrol(giris, [hedef], { fiil })`, node):
  - hedef "Ich habe mich gestern für die Prüfung angemeldet." / giriş "Gestern habe ich mich für die Prüfung angemeldet." → **fast, kelime sırası**
  - "Er hat sich nach dem Unfall nicht bewegt." (`saetze_refl`) / "Nach dem Unfall hat er sich nicht bewegt." → **fast, kelime sırası**
  - "Ich melde mich morgen für den Kurs an." / "Morgen melde ich mich für den Kurs an." → **fast**
  - "Wir haben uns lange mit dem Problem beschäftigt." / "Lange haben wir uns mit dem Problem beschäftigt." → **fast**
  - "Ich fahre gern mit dem Zug." / "Gern fahre ich mit dem Zug." → **fast**
  - karşılaştırma: "Ich habe gestern das Formular ausgefüllt." / "Gestern habe ich das Formular ausgefüllt." → richtig.
  
  Nedeni: `ckZarf(R)`, fiilden sonraki ilk öğe (`mich`, `sich`, `uns`) işlev kelimesi olunca 0 döndürüyor, bu yüzden varyant hiç üretilmiyor. `gern` de zarf olarak tanınmıyor. Dönüşlü cümleler ayrı bir havuz (345 cümle); bu yapıda yazılan doğru cümleler "küçük hata" ve m2 alıyor. CLAUDE.md'deki "geçerli başka dizilişler (Vorfeld …) doğru" sözüne aykırı.
- beklenen / gerçek: richtig bekleniyor; gerçekte fast + `kelime sırası`, hafızada m2 (tekrar aralığı kısalıyor).
- önerilen düzeltme: `ckVaryant`'ta `R`'nin başındaki zamir nesneleri (CK_REFL / CK_PRON: mich, dich, sich, uns, euch, mir, dir, ihm, ihr …) atlansın. Zarf öbeği bu zamirlerden sonra aransın; yeni sıra `[zarf] V [özne] [zamirler] [kalan]` olsun. `gern` / `gerne` / `lange` / `oft` gibi zarflar `ckZarf`'ın ilk dalına (tek kelimelik zarf) girsin.

### 4. rechnen / berechnen / zeichnen / unterzeichnen: ihr biçimi "rechnt" (doğrusu "rechnet")
- önem: orta
- tür: hata (yanlış Almanca üretimi)
- yer: `js/grammatik.js:53` `needsE = st => /[dt]$/.test(st) || /[^aeiouäöülrhmn][mn]$/.test(st)`. Gövde `rechn` / `zeichn`: n'den önceki harf `h` ve dışlanan sınıfta. `praesensForms` (67-82) yalnız er (`p3`) ve du biçimlerini düzeltiyor, ihr biçimi `regular`'dan geliyor.
- kanıt: `node tools/stichprobe.js 1` çıktısında "rechnen mit — **Rechnt ihr mit dem Regen?**" var. `G.praesensForms` bütün fiillerde denendi; hatalı olanlar:
  - v116 berechnen → `berechnt`
  - v425 rechnen → `rechnt`
  - v659 zeichnen → `zeichnt`
  - v695 unterzeichnen → `unterzeichnt`
  
  `rahmen` üreteci, `uebung`, `reflAufgabe` ve tam cümle kontrolündeki `ckYapi` fiil biçimleri bu tabloyu kullanıyor. Üretilen soruda Tuna yanlış biçimi görüyor; doğru biçimi ("rechnet") yazarsa da yanlış sayılabilir.
- önerilen düzeltme: `needsE`'ye `|| /(ch|ck)[mn]$/.test(st)` ekle. Daha genel çözüm: `[mn]`'den önce ünsüz varsa ve bu `h`'den önce ünlü olan bir uzunluk h'si değilse e ekle (wohnen → wohnt korunur). Sonra `test_grammatik`'e rechnen / zeichnen için ihr biçimi testi ekle.

### 5. Uygulama her gizlendiğinde, değişiklik olmasa da `zustand.json` commit'leniyor
- önem: orta
- tür: performans / diğer (Pages yayını, repo şişmesi)
- yer: `js/app.js:3947` (`visibilitychange` hidden → `ghSync(true)`), `js/app.js:4078-4140` (`ghSync`: `zustandAuch` true ise her seferinde oku → birleştir → `ghSchreiben('log/zustand.json', …)`; "değişti mi" denetimi yok).
- kanıt: GitHub (mahmutarsla/almanca-tekrar, dal `claude/chat-session-1vghmx`, yol `log/zustand.json`) üzerinde 7.11 16:16–16:53 arasında 21 "ilerleme" commit'i var, bazıları 7–13 sn arayla (16:53:28, 16:53:35, 16:53:48). 6.11'de de 15 tane. Her commit ~400 KB'lık JSON. `logEintrag`'daki yorum, sık commit'in GitHub Pages yayınını sürekli iptal ettirdiğini kendisi söylüyor; burada aynı şey alt-tab / sekme değişiminde oluyor. Her senkronda `log.csv` (611 KB) ve `zustand.json` baştan indirilip yazılıyor.
- beklenen / gerçek: yalnız ilerleme değiştiyse ve en fazla birkaç dakikada bir yazılmalı. Gerçekte her gizlenmede yazılıyor.
- önerilen düzeltme: `ghSync`'te son yazılan durumun özetini (ör. `S.log` uzunluğu + son satırın `zeit`'i ya da `JSON.stringify` uzunluğu / hash) sakla. Değişmediyse ya da son yazım 2–3 dakikadan yeniyse zustand'ı yazma; `visibilitychange`'de yalnız `ghPending` doluysa çağır. Bekleyen cevap kaybolmasın diye `pagehide`'daki kayıt yerel kalabilir.

### 6. Rakam ↔ sayı kelimesi farkı "yanlış kelime" (falsch) sayılıyor: tam cümle ve dikte
- önem: orta
- tür: haksız not
- yer: `js/grammatik.js` `cumleKontrol` / `ckTok` (sayı normalleştirmesi yok); dikte `js/dinle.js:38` `diktePruef` → `cumleKontrol`.
- kanıt:
  - `G.cumleKontrol('Wir machen zehn Minuten Pause.', ['Wir machen 10 Minuten Pause.'])` → **falsch, yanlış kelime**
  - tersi de (dikte: TTS "zehn" okur, cümle "10" ise ya da kullanıcı rakam yazarsa) aynı sonucu verir.
  
  Havuzda 151 cümle rakam, 167 cümle sayı kelimesi içeriyor (SAETZE + NSAETZE + SAETZE_REFL, toplam 5185). Saat (23.15 / 23:15) doğru kabul ediliyor, sayılar edilmiyor.
- önerilen düzeltme: `ckTok`'ta 0–100 arası rakamları kelimeye çevir (eins/ein, zwei, … zwanzig, dreißig …) ve iki tarafı aynı biçimde karşılaştır. Dikte cümle seçiminde (`dinle.js` `cumleSec`) rakamlı cümleler dışlanabilir.

### 7. Gün sınırı karışık: sayaç / seri / hedef 00:00'da, hafıza / kota / ısınma 04:00'te
- önem: düşük-orta
- tür: hata (tutarsızlık) / belge-kod
- yer: `js/app.js:12` `tag()` takvim günü. Bunu kullananlar: `heute()` (`tageC[tag()]`), `seriSay`, `seriBakim`, `gunSayac`, `seriGunTamam`, `gunKontrol`. `pazartesi()` (260) ise −4 saatle, `gs4` / `kapasite` `Kern.gun4` ile, `Kern.sec` ısınma `S.tage[gun4(t)]` (`js/kern.js` 6. adım `gunN`) ile çalışıyor.
- kanıt (kod yolu): 00:00–04:00 arasında:
  - (a) Bugün ekranı ve seri yeni günü sayar; hafıza (günde tek yazım) ve `gs4` hâlâ dünü sayar.
  - (b) `isinma` `S.tage[dün].n`'yi okur (≥ 3), bu yüzden gece yarısından sonraki ilk turda ısınma olmaz.
  - (c) Pazartesi 00:00–04:00 arası hedef 2 tur görünür ama sayaç pazartesi kovasına yazılır; 04:00'ten sonra hedef 1 tura iner.
  
  YAPILANLAR / CLAUDE.md "öğrenme günü 04:00'te başlar" diyor. Tuna gece yarısını geçen bir turda gün sayacının ikiye bölündüğünü görür; seri bunu yanlış sayabilir (ör. 23:50 ile 00:10 arasındaki 12 cevap iki güne dağılır, hiçbir gün `MIN_TAG`'e ulaşmaz).
- önerilen düzeltme: `tag()` öğrenme günü olsun (`t - 4h`), ya da gün sayaçları / seri `Kern.gun4` kullansın. Eski `tageC` anahtarları zaten takvim günü; geçiş günü için not düş.

### 8. Goethe ayrıştırma artıkları: `übernommen.` (nokta) ve `Cafées`
- önem: düşük
- tür: içerik hatası
- yer: `daten/verben.js` v539 `"p2":"übernommen."` (kaynak `daten/goethe_b1.json:31606` "hat übernommen."); `daten/nomen.js` n0214 `"gen":"Cafées"`. Modallerde `p2` "gedurft (hat dürfen" gibi; `p2s` parantezden sonrasını kestiği için zararsız.
- kanıt: Playwright `kokSatz('v539')` → `ziel: "übernommen."`; cümle "Sie hat das Geschäft ihres Vaters _____" sondaki noktayı kaybediyor. Tanıtım çipi "Perfekt: hat übernommen." gösteriyor. Not doğru (normalleştiriliyor). `G.luecke` "übernommen" bulamadığı için SAETZE v539 cümlesi boşluklu soruya hiç girmiyor. `Cafées`, Genitiv üretiminde "des Cafées" verir.
- önerilen düzeltme: `tools/build.py` Goethe ayrıştırmasında `p2`'nin sonundaki noktalamayı temizle (`rstrip('.,;')`); `Cafés` genitivini düzelt ya da `nomen_extra` / override ile ver.

### 9. v469 sehen: cümle havuzunda fiili içermeyen cümle
- önem: düşük
- tür: içerik hatası
- yer: `daten/saetze.js` v469: "Warst du schon mal an der Nord/Ostsee?" (Goethe örneği yanlış maddeye eşlenmiş).
- kanıt: `G.luecke` bütün SAETZE / SAETZE_REFL cümlelerinde denendi. 69 cümlede boşluk bulunamadı; çoğu emir kipi ya da adlaştırma (meşru). Bu cümle ise "sehen" içermiyor ve tam cümle sorusunda "sehen" hedefiyle sorulabilir.
- önerilen düzeltme: cümleyi v469'dan kaldır (ya da "sein" maddesine taşı). İsterseniz `build.py`'de "fiil kimliği cümlenin ana fiili" kuralını `G.luecke` / tam biçim taramasıyla uyarıya bağlayın (emir kipi istisnasıyla).

### 10. İsim boşluğunda dişil türev eşleşiyor: "der Chef" sorusunda cevap "Chefin"
- önem: düşük
- tür: haksız not / içerik
- yer: `js/app.js` `wortLuecke` (isim: `c.startsWith(l) && c.length - l.length <= 2`).
- kanıt: NSAETZE taramasında 7 madde çıktı:
  - n0217 Chef → "Chefin"
  - n0221 Cousin → "Cousine"
  - n0610 Kellner → "Kellnerin"
  - n0721 Lehrer → "Lehrerin"
  - n0827 Nachbar → "Nachbarin"
  - n1309 Verkäufer → "Verkäuferin"
  - (Friede → Frieden doğru)
  
  Boşluk "die _____" olarak geliyor; "der Chef" maddesi sorulurken doğru cevap "Chefin" oluyor. Tuna "Chef" yazarsa çekim farkı gibi küçük hata alır, artikel bağlamı da yanlış öğretilir.
- önerilen düzeltme: `wortLuecke`'de `-in` / `-innen` / `-e` (Cousine) ekini eşleşmeden çıkar ya da bu cümleleri maddeden kaldır.

### 11. Etiket adları yanıltıcı (log ve panel)
- önem: düşük
- tür: arayüz / log
- yer: `js/app.js` `auswerten` etiket çevirisi (`'artikel/çekim'` → `'artikel / ek'`); `G.cumleKontrol`.
- kanıt:
  - log 2026-11-06 13:08:39 `nsatz;x1567:nsatz;der Pate;…;Patenscahft;falsch;Pate;… | artikel / ek` → başka kelime (Patenschaft) yazılmış ama etiket "artikel / ek".
  - `cumleKontrol('Ich fahre gerne mit dem Zug.', ['Ich fahre gern mit dem Zug.'])` → **fast, artikel/çekim**. gern / gerne eşdeğer; burada haksız küçük hata da var.
  - `'Wo treffen uns wir?'` → fast "artikel/çekim" (aslında kelime sırası).
- önerilen düzeltme: bosPruef / cumleKontrol `artikel/çekim` etiketini yalnız artikel ya da aynı kökün eki farklıysa versin (`ckKok`). gern / gerne çiftini eşdeğer kabul et.

### 12. minimalpaare: "vier / für" yanlış kontrastta
- önem: düşük
- tür: içerik hatası
- yer: `quellen/minimalpaare.txt` `ei-ie | vier | für` (kontrast "ei / ie / eu").
- kanıt: vier [iː] ile für [yː] arasındaki fark i / ü; ei / ie ile ilgisi yok. Yanlışta gösterilen kanca ("ei = ay, ie = uzun i …") yanıltıcı olur.
- önerilen düzeltme: bu çifti kaldır ya da yeni bir "i / ü" kontrastına taşı (Türkçede i / ü ayrımı olduğu için zaten kolay).

---

## Doğrulanıp sorun bulunmayanlar (kısaca)
- Gramer: 150 alıştırma örneklemi dil açısından okundu, ciddi hata yok. `fehler` türünün 946 maddesinde `hata` belirteçleri cümlede var; "hata yok" maddelerinde soru = cevap.
- Çeviri cümleleri: 150 örnek (SAETZE / NSAETZE / SAETZE_REFL) okundu. Almanca ve Türkçe genelde doğru; aynı maddede çift cümle yok.
- Gloss: 60 örnekten yalnız kaymış blok (bulgu 2) sorunlu.
- sw.js, Kern.birlestir (alan alan), bekleyen cevap (`bekleyenKaydet` / `bekleyenIsle`), FSRS: mantık hatası bulmadım.
- Dikte von / vor: eskiden "yazım" sayılıyordu (log 6.11 09:50), güncel kodda "edat" (falsch) veriyor, yani düzelmiş.

Betikler ve çıktılar: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/kod-3/` (`pend.js`, `kok.js`, `shift.js`, `glosscheck.js`, `sample.js`, `gsample.js`, `satz150.txt`, `g150r.txt`, `stichprobe.txt`).
