# kod-1 — kod incelemesi (kern.js, app.js, grammatik.js, gramer.js, dinle.js, cumle.js, fsrs.js, sw.js, build.py, gece.yml)

**Özet**
- 10 bulgu: yüksek 1 · orta 4 · düşük 5. Konuşma (söyle / Teil / mikrofon) kapsam dışı bırakıldı; duy-seç (hoer) ve duy incelendi, hata bulunmadı.
- En önemlisi: klasör bağlı değilken `S.pending` hiç boşalmıyor. Her cevap satırı ana localStorage anahtarına ekleniyor ve her `save()` bunu yeniden yazıyor. ~100 gün içinde kota dolabilir ve ilerleme sessizce kaydedilmez (telefonda kesin).
- Seviye / hafıza tutarsızlıkları: yoklamada "zaten biliyorsun" denen kelimede `bm` 0 kalıyor, sonraki soru seçmeli geliyor. İpuçlu `bos0` ise `bm`'yi 3'e çıkarıyor; log'da gerçek örnekler var: die Mensa, die Kritik, kalt.
- Haksız not (Tuna lehine): metin / ünite / dinleme boşluğu kontrolü (`uPruef`) sözlükteki başka kelimeyi "yazım" sayıyor (legt→liegt, setzen→sitzen, Staat→Stadt). Not fast oluyor, üstelik pk sayılıyor.
- Akşam tekrarı: hafızaya yazmayan satırlar (duy, cümle atölyesi, kök, artikel) öğeyi "bugün yanlış" yapıyor. Akşamki doğru cevap, 52 günlük vadeyi bile yarın 04:00'e çekiyor.
- Birim testleri: test_kern 665 ✓, test_grammatik ✓, test_goc 76 ✓, test_dinle 13 ✓. `e2e_aksam` ✓ ve `e2e_smoke` ✓ (kendi kopyamda). `python3 tools/build.py` hatasız, çıktı depoyla aynı.
- Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/kod-1/` (yoklama_bm.js, aksam_vade.js, aksam_yanlis.js, upruef.js, pending_boyut.js, pending_e2e.js). Hepsi `node <betik> <repo yolu>` ile çalışır.

---

### 1. Klasör bağlı değilken `S.pending` sınırsız büyüyor: localStorage kotası dolunca ilerleme sessizce kaydedilmez
- önem: yüksek
- tür: hata (veri kaybı riski) / performans
- yer: js/app.js:3880 (`S.pending.push(e)` her log satırında), 3920–3935 (`dateiSchreiben`: pending'i yalnız bağlı klasör varsa boşaltır), 268–275 (`save()`: yalnız `S.log`'u 3000'de kırpar, `pending`'e dokunmaz, ana anahtara `Object.assign({}, S, { log: [] })` yazar, yani pending dahil)
- kanıt:
  - Kod yolu: `logEintrag`, `S.pending.push(e)` yapar. `dateiSchreiben()` `if (!ordner || schreibt) return;` ile çıkar. Android Chrome'da `showDirectoryPicker` yok, masaüstünde de klasör bağlı değilse durum aynı. Başka hiçbir yer pending'i boşaltmıyor (`grep pending js/app.js`). GitHub'a giden zustand'da `pending: []` yazılıyor, yani sorun görünmüyor.
  - Tarayıcıda yeniden üretim (`pending_e2e.js`): gerçek kayıtla açıp 1 tur çözünce pending 0'dan 40'a çıktı (log 40). Ana anahtar 397 K'dan 412 K karaktere büyüdü.
  - Boyut (`pending_boyut.js`, log.csv'nin 34 günü): pending JSON ≈ 0,97 M karakter, günde ~28,5 K. Ana durum 0,40 M ve log anahtarı (3000) 0,78 M ile birlikte bugün ~2,15 M. Chrome localStorage sınırı ~5 M karakter (sınır değeri tahmin, doğrulanmadı). Buna göre kalan süre ≈ 100 gün.
  - Kota dolunca `save()` hatayı `console.warn` ile yutar. Bu cihazda sonraki hiçbir cevap kalıcı olmaz ve Tuna'ya uyarı da gösterilmez.
  - Ayrıca her `save()` (cevap başına birkaç kez) büyüyen pending'i yeniden serileştiriyor. Bu da telefonda gereksiz yük.
- beklenen / gerçek: pending yalnız klasöre henüz yazılmamış satırları tutmalı / klasör yokken bütün geçmişi biriktiriyor.
- önerilen düzeltme: `logEintrag`'da `if (ordner || ordnerWartet) S.pending.push(e)` kullanılsın. Ya da `save()`'de `if (!ordner) S.pending = []` (en azından `S.pending.length > 3000` ise baştan kırp). Açılışta (`yukle`/`normalize`) eski şişmiş pending bir kez temizlensin. Ayrıca `save()` catch'inde kota hatası (`QuotaExceededError`) görünür bir uyarıyla gösterilsin.

### 2. Yoklamada "zaten biliyorsun" denen kelimenin basamak kapısı 0 kalıyor: sonraki tekrar seçmeli (B1), seviye "Tanıyor"
- önem: orta
- tür: hata / kural ihlali (bm = "ipucusuz doğru cevaplanan en yüksek basamak")
- yer: js/app.js:1127 (`frageYoklama` soruya `b: 2` koyar ama `sel` yok), 3776 (`Kern.uygula(..., { b: sel.b, ... })`, sel `{}` olduğu için `b` undefined), js/kern.js:180–197 (yoklama dalı; `h.bm == null` için `hOnce` yok, bm 0 olur; `opts.b` yok, yükselmez)
- kanıt: `yoklama_bm.js` (Kern ile): yoklama doğru (`not m4`) sonrası `{ S: 8.3, bm: 0, pk: 1, reps: 1, vade: 7,0 gün }` ve `seviye 1`. Vadede `basamak` `{ b: 1 }` veriyor, `bicimSec` de `sec` (seçmeli) döndürüyor. Log satırı ise `basamak:B2` yazıyor (`sel.b || q.b`), yani log ile hafıza çelişiyor.
- beklenen / gerçek: Tuna kelimeyi ipucusuz yazdı (TR→DE). bm 2 olmalı, sonraki soru yazma / cümle olmalı, seviye "Yazıyor". Gerçekte bm 0, 7 gün sonra seçmeli geliyor ve kelime haftalarca "Tanıyor"da kalıyor. Seçmeli doğru cevabı bile bm'yi ancak 1'e çıkarıyor.
- önerilen düzeltme: `hafizaYaz`'da `b: sel.b != null ? sel.b : q.b` kullanılsın. Ya da `frageYoklama` `sel: { b: 2, tur: 'm', kaynak: 'yoklama' }` koysun. Kern yoklama dalında `bm: opts.b || 2` de olabilir.

### 3. İpuçlu `bos0` (ve yedeğe düşen biçimler) basamak kapısını yükseltiyor: "seviye yalnız ipucusuz cevapla" kuralı delinmiş
- önem: orta
- tür: kural ihlali / haksız not (Tuna lehine, bedava seviye)
- yer: js/app.js:540 (`q.ipucu` yalnız `frageYaz`'da kuruluyor). `frageCumle`, `frageLueckeStufe` ve `frageSatz` lv 0'da ipucu çipi gösteriyor (artikel + ilk iki harf + anlam; fiilde mastar) ama `q.ipucu` koymuyor. js/app.js:3776 `ipucu: (q.ipucu||0) > 0`. js/kern.js:194 `if (not.m >= 3 && richtig && opts.b && !opts.ipucu && !opts.itiraz) h.bm = max(h.bm, opts.b)`.
- kanıt:
  - Log (`basamak:B3 | bicim:bos0 | … | ipucu:0`, richtig): 2026-11-06 13:06:39 n0781 die Mensa, 2026-11-04 06:54:28 n0682 die Kritik, 2026-11-04 06:49:04 w0272 kalt, 2026-10-25 09:31:57 v119 sich beruhigen, 09:32:32 n1048 der Schnee, 09:33:27 n0313 die Erlaubnis. Bu öğelerin hepsinde bugün `m.bm = 3` (log/zustand.json).
  - Aynı mantıkta yaz0 (ipucu 1) bm'yi yükseltmiyor. Tutarsızlık bu yüzden açık: B2'de ipuçlu yazma seviye atlatmıyor, B3'te ipuçlu boşluk atlatıyor.
  - Ek: `hafizaYaz` `opts.b`'yi seçimden (`sel.b`) alıyor, sorulan biçimden değil. `bos`/`cumle` cümle bulamayınca `yaz`'a düşerse (app.js:523–526) ya da `satzWahl` tam cümle yerine boşluk verirse (`lvGercek 1`), bm 3 / 4'e "yazma" ya da "boşluk" cevabıyla çıkabilir. Log'da şimdilik yok (0 satır `B4 | bicim:bos`), kod yolu açık.
- beklenen / gerçek: ipuçlu biçim (`bos0`, ipuçlu yaz0) ve yedeğe düşen soru, sorulan biçimin basamağını aşmamalı / ipucu 0'lı boşluk doğrudan "Cümlede"ye çıkarıyor.
- önerilen düzeltme: `frage0` sonunda `if (q.lvGercek === 0 || q.bicim === 'bos0') q.ipucu = q.ipucu || 1;` (pk ve bm saymaz, notu değişmez). `hafizaYaz`'da `b` sorulan biçimden türetilsin: `{yaz0:2, yaz:2, kalip:2, bos0:3, bos:3, metin:3, cumle:4}[q.bicim]` ile `sel.b`'nin küçüğü.

### 4. Metin / ünite / dinleme boşluğu kontrolü (`uPruef`) sözlükteki başka kelimeyi "yazım" sayıyor: fast + pk
- önem: orta
- tür: haksız not (Tuna lehine; yanlış kelime üretim kanıtı sayılıyor)
- yer: js/app.js:2208 (`Math.abs(c.length - e.length) <= 1 && c.length > 4 && lev(c, e) <= 1` → 'yazım', sözlük denetimi yok). Kullanan yerler: metin etkinliği `aktPruef` 2634 (bicim `metin`, `Kern.PK_BICIM`'de), ünite 2419–2434, dinleme modu dinle.js:379, dikte yedeği 2219.
- kanıt: `upruef.js` app.js'teki fonksiyonu olduğu gibi çalıştırır. Sonuçlar: `legt` (hedef liegt) → `fast, yazım: liegt` · `Staat`/Stadt → fast · `setzen`/sitzen → fast · `Kirsche`/Kirche → fast · `Bitte`/Bitten → fast "yazım". Metin boşluğunda tip `yazim` olur, `notVer` m3 verir, `Kern.uygula` `pkSay` (metin ∈ PK_BICIM, g ≥ 3) ile pk +1 yapar. Böylece yanlış fiil (legen) liegen'in üretim kanıtı sayılıyor ve erken üretim kapısını açıyor. CLAUDE.md §4.3 hoşgörüsü ise "yazılan sözlükte başka kelime değilse" diyor (liegen/legen, Stadt/Staat ayrışır).
- beklenen / gerçek: sözlükte başka kelime olan cevap yanlış olmalı / küçük hata (yazım) ve kalıcı yazımda pk.
- önerilen düzeltme: 2208. satırdaki lev-1 dalına `!lexSet().has(e)` (küçük harf, umlaut açık biçim) koşulu eklensin. Daha iyisi, tek kelimede doğrudan `G.yakin(e, c)` sonucu kullanılsın (zaten sözlüklü). Böylece `pruefenLemma` / `bosPruef` ile aynı kural uygulanır.

### 5. Akşam tekrarı: hafızaya yazmayan satırlar (duy, cümle atölyesi, kök, artikel) öğeyi "bugün yanlış" yapıyor; akşamki doğru cevap uzun vadeyi yarın 04:00'e çekiyor
- önem: orta
- tür: hata / CLAUDE.md ile çelişki ("duy … hafızaya yazmaz", "Cümle atölyesi … Hafızaya (Kern) yazmaz", "kök hatası anlamı takılan yapmaz")
- yer: js/app.js:441–445 (`aksamDurum`: bugünkü HER falsch/fast satırın `itemOf(e.id)`'si `yanlis` kümesine giriyor; `duy` id'si `<öğe>:duy-…`, `cumle` id'si `<öğe>:diz|cevir|kur`, `stamm` id'si `<fiil>:stamm`, `art` id'si `<isim>:art`). 472 (`ot.aksamIst` = yeni + yanlış adaylar). 3775–3776 (`aksamYanlis: ist`). js/kern.js:157 (`opts.aksamYanlis` hakkı her koşulda veriyor), 172 (`yeniGun: yeniGun || ist`: not ne olursa olsun vade ≤ yarın 04:00).
- kanıt:
  - `aksam_vade.js`: sabah tam cümle doğru (S 51,7, vade 52 gün), sonra yalnız bir `duy` satırı yanlış. Akşam doğru cevap verilince `yazildi: true, aksam: true`, S 53,0, vade "Tue Nov 10 04:00" (7 saat sonra). Yani 52 günlük aralık bir dinleme hatası yüzünden 1 güne iniyor, ertesi gün yeniden soruluyor.
  - `aksam_yanlis.js` (gerçek log): akşam tekrarı yapılan 5 günün hepsinde `yanlis` kümesinde yalnız `art` ya da `stamm` satırından gelen öğeler var (ör. 2026-10-25: n0914, n0207, n1088, x1561, n1374, n0496, n0433, n0536 (art) ve v420, v173 (stamm)). `duy` / `cumle` 6.11'de geldi, bundan sonra kümeye onlar da girecek.
- beklenen / gerçek: akşam istisnası (ikinci yazım + vade ≤ yarın) yalnız bugün yeni ya da o hafızası bugün yanlış olan öğede olmalı. Gerçekte hafızası doğru olan ve yalnız dinleme / cümle atölyesi / kök / artikel hatası olan öğenin anlam hafızası da yeniden yazılıyor ve vadesi çöküyor.
- önerilen düzeltme: `aksamDurum`'da `yanlis` yalnız hafıza biçimlerinden kurulsun (`modus ∈ {erk, bed, wort, prod, abr, nsatz, satz, refl, ndek, luecke}` ve notiz'de `not:` dolu). Artikel / kök hatası ayrı tutulsun (yalnız `art` / `kok` hafızasına istisna). Kern.uygula'da `yeniGun || ist` yerine ancak o hafıza bugün yanlışsa (`h.lastG <= 2`) ya da öğe bugün yeniyse vade kısaltılsın. Doğru akşam cevabı aralığı yarına çekmesin.

### 6. Gün sayaçları takvim gününe (00:00), çekirdek öğrenme gününe (04:00) bakıyor
- önem: düşük
- tür: hata (zaman / gün sınırı)
- yer: js/app.js:12 (`tag()` = takvim günü), 294 / 297 (`heute()` / `bugun()` `S.tageC[tag()]`), 425 (`kapasite`: `S.tage[Kern.gun4(…)]`), 4562 ve 4579 (seri takvim günüyle). Buna karşılık js/kern.js:354 (`donusMu`: `S.tage[gun4(t)]`), 634 (ısınma `S.tage[gun4(t)].n`), CLAUDE.md "öğrenme günü 04:00'te başlar".
- kanıt: 00:00–04:00 arası verilen cevaplar `tage[yeni takvim günü]`ne yazılıyor ama `gun4` bir önceki güne bakıyor. O saatlerde ısınma açılmıyor (dünün n'i ≥ 3). 04:00'ten sonra gece cevapları "bugünün" sayılıyor: ısınma ve dönüş turu hesabı, bugün x / 20 ve seri gece yarısında değişiyor, hafıza ve kota ise 04:00'te. Log'da 00–04 arası hiç satır yok (`awk` saat dağılımı), bu yüzden bugün etkisi yok. Tuna gece çalışırsa ortaya çıkar.
- önerilen düzeltme: `heute` / `bugun` / `gunAktif` / `seriSay` / `turBaslat` için `tag(t - 4*3600000)` (ya da doğrudan `Kern.gun4`) kullanılsın. `gs4` ve `pazartesi` zaten 04:00 kullanıyor.

### 7. Bekleyen cevap (uygulama arka planda kapandı) log satırına açılış zamanıyla yazılıyor
- önem: düşük
- tür: log biçimi / zaman
- yer: js/app.js:5897 (`hafizaYaz(r, r.sonuc, r.t, …)`, hafıza cevap anındaki `r.t` ile yazılıyor), 3878 (`logEintrag` her zaman `e.zeit = zeitStr(now())`)
- kanıt: Cevap akşam verildi, uygulama gece öldürüldü, ertesi sabah açıldı. Bu durumda hafıza dünün zamanıyla, log satırı ise bugünün saatiyle yazılır. `aksamDurum` (bugünkü ilk cevap / yanlışlar) ve "sonuçlarıma bak" bu satırı yanlış güne koyar. Notiz `arka planda kapandı` işareti var ama `zeit` yanlış.
- önerilen düzeltme: `logEintrag(e, t)` isteğe bağlı zaman alsın. `hafizaYaz` `opt.zeit`'i (bekleyende `r.t`) iletsin.

### 8. Gramer hayaletleri cihazlar arası birleştirmede dirilir
- önem: düşük
- tür: hata (birleştirme)
- yer: js/kern.js:990 (`ghost: Object.assign({}, b.ghost, a.ghost)`), js/gramer.js:660–661 (çözülen hayalet `delete gh[key]`)
- kanıt (kod yolu): A cihazında hayalet iki doğruyla silinir ve A yazar (uzakta anahtar yok). B'de anahtar hâlâ var. B çekince `Object.assign(uzak, yerel)` anahtarı korur, B yazınca anahtar uzağa geri gelir. A çekince `Object.assign(b = uzak (anahtarlı), a = yerel)` anahtarı A'ya da geri getirir. Çözülmüş teil yeniden sorulur. İki cihazda gramer çalışınca olur. Doğrulanmadı (tarayıcıda iki cihaz senaryosu kurulmadı).
- önerilen düzeltme: silmek yerine `gh[key] = { bitti: t }` mezar taşı. Birleştirmede anahtar başına daha yeni olan (`due` / `t` / `bitti`) kazansın. Okurken `bitti` olanlar atlansın.

### 9. `notVer`: umlaut / hâl / çekim hatasıyla birlikte yapılan artikel hatası kaybolur
- önem: düşük
- tür: haksız not (Tuna lehine) / log eksik
- yer: js/kern.js:135 (`umlaut`), 136 (`hal`), 139 (`cekim`): `artEt()` / `aNot()` çağrılmıyor. Karşılaştırma için 133 (`yazim`) çağırıyor.
- kanıt: isimde "der Madchen" (hedef das Mädchen) için `pruefenLemma` 'umlaut' verir, `notVer` `r(2, null, 'fast')` döner. Artikel notu `a: null`, artikel hafızası güncellenmez, log'da `artikel der → das` etiketi yok. Panel ise `artikelNotHTML` ile artikel yanlışını gösteriyor. Yani ekranda var, log'da ve hafızada yok.
- önerilen düzeltme: bu üç dalda da `artEt()` çağrılsın ve `a: aNot()` döndürülsün (yazım dalındaki gibi).

### 10. Akşam turu sonunda Enter, ekranda düğme yokken yeni tur başlatıyor
- önem: düşük
- tür: arayüz
- yer: js/app.js:5526 (turSonu Enter: `teklif` ya da `leer` değilse koşulsuz `turBaslat`), 4730 (akşamda `aksamKalan` 0 ise "Bir tur daha" düğmesi gösterilmiyor)
- kanıt (kod yolu): Akşam turu 12 cevapla biter (sebep `bitti`, kalan aday 0) ve kartta yalnız "Bitir" vardır. Enter yeni akşam turu açar. `aksamSec` aday bulamaz, ekrana "Akşam tekrarı: şimdilik bu kadar" gelir. Zararsız ama kafa karıştırıcı.
- önerilen düzeltme: Enter, ekrandaki birincil düğmeyi tetiklesin (`kart.querySelector('.ts-btns .btn.ana')`, yoksa `data-git="ana"`).

---

**Bakılıp sorun bulunmayanlar (kısa):**
- fsrs.js (FSRS-6 formülleri ve ofset).
- Kern.sec sırası (kuyruk → parti → gram → ses → metin → kurtarma → ısınma / momentum → vadeli → yeni kök → parti / teklif). zeige döngüsü 5 adımla sınırlı, sonsuz döngü yok.
- `oturumIsle` yeniden sorma sınırları.
- `birlestir`: items / kok / pakete / tageC / bilmedik / kontext / sprint (madde 8 hariç).
- ghSync: log satırı tekilleştirme ve 409 yeniden denemesi.
- bekleyenKaydet / bekleyenIsle alan listesi: hafizaYaz'ın kullandığı bütün alanlar `Q_ALAN`'da.
- sw.js önbellek akışı.
- gece.yml: concurrency, rebase'li push.
- dinle.js `diktePruef`, konus.js duy-seç (hoer) notu ve log satırı.
- cumle.js log / itiraz.
- build.py çıktısı (hatasız, 36 uyarı: Goethe listesinde olmayan sona eklenmiş kelimeler).
