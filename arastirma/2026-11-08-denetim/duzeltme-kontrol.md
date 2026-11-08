# duzeltme-kontrol: cevap kontrolünün çekirdeği (js/grammatik.js, tests/test_grammatik.js)

Worktree: /home/user/Almanca-Tekrar/.claude/worktrees/agent-af5dc74d30e02c832 · dal `worktree-agent-af5dc74d30e02c832` · commit `181e4a4`
(index.html ve sw.js yalnız build.py'nin ?v= / önbellek sürümü; birleştirirken build'i yeniden çalıştırmak yeter)

## Yeni dışa açık yardımcılar (öteki modüller için)
- `G.kelimeSinifi(yazilan, hedef, { lex }?)` → `'dogru' | 'buyukKucuk' | 'umlaut' | 'yazim' | 'cekim' | null`
  - dogru: aynı, ae/oe/ue/ss yazımı, gern = gerne · buyukKucuk: yalnız harf büyüklüğü · umlaut: ä/ö/ü düşmüş (Prufung)
  - yazim: tek harf / yer değiştirme (umlautlu harfte de: Kläte), çift harf (Feuerwehrman), ß → s (Strase, gros), 4 harfte fazla harf / yer değiştirme (hoche, mdüe)
  - cekim: aynı kelimenin başka eki / biçimi (kann ↔ können, liest ↔ lesen, geregnet, gelöscht, Häuser ↔ Haus, Apotheken)
  - null: başka kelime (legt/liegt, Staat/Stadt, verschieben/verschrieben, hieß/heiß, Hous/Haus, zarfa ek: etwaen)
  - Girdi HAM verilmeli (umlautlu, tek kelime). uPruef gibi önceden uNorm (acik + küçük harf) uygulanmış dizgiyle çağırmak umlaut ayrımını kaybettirir.
- `G.veriSetzen({ verben, nomen, woerter })` (isteğe bağlı): fiil / isim ailesi ve ek almayan kelime kümesi. Verilmezse `window.VERBEN / NOMEN / WOERTER` ilk kullanımda okunur (uygulamada çağırmaya gerek yok). `lexSetzen` çağrısı bu önbellekleri sıfırlar.
- `G.yakin` sözleşmesi aynı ('yazim' | 'cekim' | null); yalnız umlaut farkı hâlâ 'yazim' döner (eski çağıranlar bozulmasın diye) — umlaut ayrımı için kelimeSinifi.

## Düzeltilenler (doğrulandı, her birine test)
1. **ae/oe/ue/ss boşlukta / gramerde / dinlemede küçük hata** (kod-2 #1, kullan-1 #14, kullan-3 tablo/ae, log-*): `G.pruefen` artık acik eşitliğini tam doğru sayıyor → `G.bosPruef`, gramer `cumlePruef`, `dinle` duy-boşluk, paket (`G.pruefen` kullananlar) otomatik düzeldi. Gramer `parcaPruef` / `dinlePruef` kendi `fold`'unu kullanıyor: BAŞKA ALANA (gramer.js).
2. **Virgül eksik → gramerde "kaynaştırma"** (log-1 #5, log-2, log-3 #5, kullan-2, kullan-3): `G.pruefen` virgül farkını saymıyor → gramer `cumlePruef` artık richtig döner (gerçek log 7.11 17:23:46 vergleich:90 dahil 7 satır falsch → richtig).
3. **Boşlukta umlaut düşmesi "yazım" (m3), umlaut dalı m2'den hafif** (kullan-2, kullan-3): `bosPruef` tek kelime farkında kelimeSinifi; Prufung → tip 'umlaut', etiket 'umlaut/ß'.
4. **Umlautlu harfte yer değiştirme tam yanlış** (kullan-1 #3, kullan-2, kullan-3): Kläte, Prfüung, Gemsüe, Behröde, flißeend, Frhüjahr, scühtzt, fhärt, Wrame → yazım (yazma, boşluk, tam cümle `ckIliski`). Uzunluk eşiği hedefin kendi harf sayısıyla (ä tek harf).
5. **Sözlüğe acik biçimle bakılıyordu** (kod-2 #5, kullan-3): fährst/fährt, läufst/läuft, hieß/heiß artık yazım değil (fährst → çekim; hieß → yanlış). `lexHas` umlautlu ve açık biçimle bakar.
6. **Ünlü değişimi / ge- önekli biçim yanlış** (log-1 #1, log-2, log-3 #4): können→kann, werden→wird, regnet→geregnet, liest→lesen, gelöscht→löschen, gibt/geben, nimmt/nehmen, wendet/gewendet → çekim (fast m2). Fiil / isim ailesi haritası + genel ge- kuralı. Gerçek log: 18 boşluk satırı falsch → fast/çekim.
7. **Sözlükte iki ayrı kelime "yazım"** (kod-1 #4'ün çekirdek kısmı, kod-2 #6, kullan-4): legen/liegen, Staat/Stadt, verschieben/verschrieben, setzen/sitzen, bitten/bieten, wieder/wider, Gedacht/Gedicht → `G.pruefen` / `bosPruef`'te yanlış (eski `pruefen` sözlüksüz lev-1 yazım kuralı kaldırıldı). `uPruef`'in kendi lev-1 dalı app.js'te: BAŞKA ALANA.
8. **morgem / Feuerwehrman / Fus** (kod-2 #8, log-1 #7, log-2, log-3 #11): morgem → yazım (ek almayan hedef: zarf/bağlaç/edat, WOERTER `kl`), Feuerwehrman / Komilitone / Schmerztableten → yazım (çift harf; `yakin` ve `ckIliski`), ß → s (Fus, Strase, gros) → yazım (koordinatör eki: ss tam doğru, tek s yazım).
9. **Zarfa uydurma ek "çekim"** (kullan-4: etwaen) → yanlış.
10. **Geçerli devrik dizilişler "kelime sırası"** (kod-2 #3, kod-3 #3, kullan-3): `ckVaryant` genişletildi: Vorfeld'e her zarf / edat öbeği taşınabilir (dönüşlü / nesne zamiri araya girse de), `gern` / `lange` / `oft` … zarf, özne isim öbeği (Am Sonntag kocht meine Mutter ↔ Meine Mutter kocht am Sonntag), ad (Mario). Morgen kann ich dir helfen · Am Wochenende treffe ich meine Freunde · Im Park haben wir uns getroffen · Beim Chef habe ich mich beschwert · Gestern habe ich mich … angemeldet · Nach dem Unfall hat er sich nicht bewegt · Auf den Urlaub freue ich mich sehr · Gern fahre ich mit dem Zug → richtig. Yanlış pozitifler için korumalar: öbek bölünmez (bei Herrn Müller, für Kinder und Senioren, Genitiv), edat öbeğinin içinden taşınmaz (von zu Hause), odak / olumsuzluk kapsamı (nicht immer, erst heute), immer wieder / lange genug / heute Abend birlikte, bağlaçtan sonraki öğe taşınmaz, "alle" fiil adayı değil. 5185 cümlelik havuzda tarandı (göz denetimi: kabul edilen yeni dizilişler dilbilgisel).
11. **Tamamen ters / karışık cümle küçük hata** (kullan-1 #4): kırılma + ters çift oranı ölçüsü → falsch (ters cümlelerin %93'ü artık falsch); tek öbek taşıma (Bestanden mein Freund hat …, Einen Film habe ich gestern gesehen) fast kalır.
12. **Bileşik isim ayrı yazılınca yanlış** (log-1 #8, log-2, log-3 #9): `ckBirlesik` → "schmerz Tabletten" fast + yazım (dikte ve tam cümle).
13. **Rakam ↔ sayı kelimesi** (kod-3 #6, koordinatör eki): 0–20, onlar, hundert, tausend; zehn = 10 (eins ↔ 1; artikel "ein" eşlenmez). Rakam ↔ kelimede yanlış "büyük/küçük harf" etiketi de kalktı.
14. **gern / gerne "artikel/çekim"** (kod-3 #11) → eşdeğer.
15. **Tam cümlede eksik içerik ismi küçük hata, fazla auch yanlış** (kullan-3, kullan-4): eksik isim (… auf den.) ağır → falsch; fazladan auch / noch / schon tek hata → fast.
16. **"Başka kelime" için yanlış 'artikel/çekim' etiketi** (log-3 #23, kullan-1 #13 kısmen): `pruefen` aynı ilk 3 harf kuralı artık kelimeSinifi'ne bağlı (Patenscahft / Pate, Staat / Stadt → farklı).
17. **needsE** (kod-3 #4): rechnen / berechnen / zeichnen / unterzeichnen → rechnet (stichprobe'da "Rechnt" kalmadı); wohnen / lehnen etkilenmedi.

Gerçek log yeniden notlama (943 cevap, eski ↔ yeni): değişen 41 satır, hepsi beklenen yönde (boşlukta çekim 18, virgülsüz gramer cümlesi 7 doğru, gramer tek kelime yazım 4, umlaut 2, Gedacht/Gedicht yanlış 1, kök sorusunda ge- eksik Partizip yazım → çekim 2: kökte zaten derece 2 = yanlış).

## Düzeltilmeyenler / sınırlar
- **Aphoteke (iki konum kayması, 8 harf) yazım değil**: CLAUDE.md "≥ 10 harf + lev ≤ 2" kuralı ve mevcut test (Fahrkrtae → yanlış) bunu açıkça istiyor; aynı yapıda iki hata. Kural değişikliği Tuna / koordinatör kararı.
- **Nesne / Mittelfeld yer değişimi** (Dem Praktikanten habe ich alles erklärt; Ich habe meinen Freund gestern …): fast + kelime sırası kalıyor (mevcut test "Einen Film habe ich gestern gesehen → fast" korunuyor). İtiraz yolu app.js'te (kod-2 #3: `cumleYapi` için itiraz) — BAŞKA ALANA.
- **durfter → durfte** çekim kalıyor (belirsiz; yazım mı ek mi ayırt edilemiyor).
- **Kirsche/Kirche, Scherz/Schmerz** hâlâ yazım: Kirsche / Scherz sözlükte (B1 listeleri) yok.
- **könnte / konnte, hatte / hätte** umlaut küçük hatası kalıyor (mevcut test schön/schon = umlaut); Konjunktiv II konusunda sertlik gramer.js'te (log-3 #8) — BAŞKA ALANA.
- **hoche → hohe uygulamada hâlâ yanlış**: app.js `formIdx` sözlüğe yapay biçimler ekliyor (hoch+e = "hoche", Regen+n = "regenn", etwa+en, zeichen+n). G doğru çalışıyor (test sözlüğüyle yazım), ama uygulama sözlüğünde "hoche" var sayılıyor → `lexSet()` gerçek biçimlerden kurulmalı (kullan-4) — BAŞKA ALANA (app.js).
- **scheint ↔ Schienen** artık "çekim" (Schienen = schien+en, scheinen ailesinde). Asıl hata metin boşluğunun ismi fiile bağlaması (app.js `aktSaetze`) — BAŞKA ALANA.

## Başka alana düşenler (G yardımcısıyla kolaylaşır)
- app.js `uPruef`: lev-1 dalı sözlüksüz (legt/liegt yazım); ham girdiyle `G.kelimeSinifi(eingabe, ziel)` kullanılmalı (uNorm'dan önce), başa artikel → fast 'fazla artikel' (bosPruef gibi).
- app.js `paketPruefen`: `G.bosPruef` + kelimeSinifi; fiil boşluğuna artikel richtig olmamalı.
- app.js `lexSet` / `formIdx`: yapay biçimler (hoche, regenn, etwaen).
- app.js `pruefAbr`: `cekim` sonucunda mastar eki eksikse 'mastar' (warte auf → m3); yoklamada 'cekim' de bildi sayılmalı (kod-2 #7, #10).
- app.js `stammTekPruef`: yanlış yardımcı fiil (hat gefahren) atılıyor (kullan-2, kullan-4).
- gramer.js `parcaPruef` / `dinlePruef`: kendi `fold`'u (ss → umlaut fast, harf hatası yanlış); `G.kelimeSinifi` ile tek boşlukta yazım / umlaut / ae-ss doğru ayrımı; tanı `KUCUK` listesine 'groß/klein', 'umlaut/ß'; 1/2/3 tuşu; teil etiketi log kirliliği.
- kern.js `notVer`: umlaut / çekim dalında artikel (`artEt` / `aNot`).

## Testler
`python3 tools/build.py` ✓ · `node tests/test_grammatik.js` ✓ (60+ yeni vaka) · `test_kern` 665 ✓ · `test_goc` 76 ✓ · `test_dinle` 13 ✓ · `tools/stichprobe.js 1` ✓ ("Rechnt" yok) · `stichprobe_module.js refl` ✓ · `gramer_ozkontrol.js` 5433 / 0 sorun · e2e: `e2e_smoke` ✓, `e2e_cumle` ✓, `e2e_dinle` ✓, `e2e_fiil_artikel` ✓, `e2e_ek` ✓ (e2e_ui / e2e_aksam arayüz / çekirdek: alanım dışında, çalıştırılmadı).
Performans: 20+ kelimelik cümle testi < 25 ms (ckIliski'de umlautlu uzaklık yalnız gerektiğinde hesaplanıyor).

Yeniden üretme / regresyon betikleri: /tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/kontrol/ (h.js uygulama sözlüğü, repro.js, reg.js gerçek log eski↔yeni, var.js yeni kabul edilen dizilişler, shuf.js ters / karışık, ek.js koordinatör vakaları).
