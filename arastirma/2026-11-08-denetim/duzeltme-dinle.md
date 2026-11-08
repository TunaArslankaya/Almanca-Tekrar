# duzeltme-dinle (alan: js/dinle.js, js/cumle.js, js/pruefung.js, test_dinle / e2e_dinle / e2e_cumle, CSS .dn-* .pr-*)

Worktree: /home/user/Almanca-Tekrar/.claude/worktrees/agent-ab5e7bb72e71ec7ab · dal `worktree-agent-ab5e7bb72e71ec7ab` · commit `942ca6e` (push yok)

## Düzeltilenler (11)

1. **Boş Enter = Bilmiyorum; taşan hızlı Enter dinleme sorusunu sek:0 ile yakıyor** (kullan-1 #2, kullan-2 "Dinleme sorusu"). Doğrulandı (kod: `q.kontrol` `if (!v) q.bilmiyorum()`).
   `js/dinle.js` boslukSoru / dikteSoru: boş girdide yalnız odak; Bilmiyorum yalnız düğme (girdi dışında `0`). `ENTER_BEKLE = 600` ms: soru çizildikten (`q.acilis`, gerçek saat `performance.now`) sonraki Enter yutulur. Sürücü (`tests/surucu.js`) `soru.test()` kullandığı için diğer e2e'ler etkilenmez.
2. **duy-bosluk: ae/oe/ue/ss küçük hata, umlaut düşürme "yazım"** (kod-2 #1, kullan-3 ae tablosu). Doğrulandı (`G.bosPruef('Pruefung','Prüfung')` → fast umlaut/ß; `Prufung` → fast yazım).
   Yeni `boslukPruef` (G.bosPruef sarmalayıcısı): acik eşitliği → richtig; yalnız umlaut farkı → fast `umlaut`. (G.bosPruef'in kendisi grammatik ajanının alanı; orada düzelirse sarmalayıcı zararsız.)
3. **Sözlükte başka kelime "yazım" sayılıyor (verschieben/verschrieben)** — Dinleme modu (kullan-4 #1, kod-1 #4, kod-2 #6) ve duy-bosluk. Doğrulandı (uygulamada `uPruef` / `bosPruef` fast yazım).
   `baskaKelime(w, hedef, id)`: tek kelimede `A.wortSuchen` başka öğeye bağlıyorsa ya da `G.yakin` (sözlüklü) null ise → yanlış (`yanlış kelime`); umlaut / harf büyüklüğü farkı hariç. Uygulamada denendi: verschieben, legt/liegt, Staat/Stadt, setzen/sitzen → falsch; Kindhiet, Rezpet, Bltz → fast yazım; Felder → fast çekim; Prufung → fast umlaut. `uPruef` (app.js) değişmedi: oradaki lev ≤ 1 dalı metin etkinliğinde sürüyor → başka alana.
4. **Dinleme modunda küçük hata yeşil "doğru", doğrusu gösterilmiyor** (kullan-4 #1, kullan-3 "Metin boşluğu" yarısı). Doğrulandı. `M.sonuc` üç durum: doğru yeşil, küçük hata sarı (`.u-luecke.dn-yakin`) + doğrusu, yanlış kırmızı + doğrusu; özet "x / y doğru · k küçük hata"; log notiz'e `küçük:k` (puan:x/y anlamı aynı).
5. **Dinleme modu bitişinde "5 / 4 · bitti"** (kullan-2). Doğrulandı, düzeltildi.
6. **Dinleme modu boşlukları: aynı kelime iki kez, işlev kelimesi (sich)** (kullan-2) + cümle ortasındaki büyük harfli kelimenin fiile bağlanması (log-2 "Schienen → scheinen", dinle.js tarafı). `modBosluklar`: öğe başına bir boşluk, `D_ISLEV` kelimeleri yok, çok kelimeli WOERTER ifadesinin tek parçası yok, cümle ortasında büyük harfli kelime yalnız isme bağlanır. (Kökteki `formIdx` / `wortSuchen` hatası app.js'te: başka alana.)
7. **Dikte: bileşiği ayrı yazmak tam yanlış + dikte:kelime** (log-1 #8, log-2, log-3 #9). Doğrulandı (log 7.11 17:22:07). `bitisikUydur`: girdideki iki token birleşince hedefteki tokene eşitse (ya da tersi: zuhause → zu Hause) hizalanır → fast + `yazım`, kat `yazım`, log'da `bitişik:Schmerztabletten` / `ayrı:zu Hause`, panelde "… bitişik yazılır", farkta tek kalem. "Deutsch Kurs" de fast.
8. **Dikte / sesli boşlukta büyük-küçük harf hiç söylenmiyor** (kullan-3, kullan-4). Doğrulandı. Not düşürmez (mevcut test: küçük harfli cümle doğru), ama cümle başı dışındaki farklar `harf` listesi → etiket `büyük/küçük harf` (log'da da), panelde "büyük / küçük harf: Nebels, Züge (isimler büyük harfle)". Bu durumda doğru cevap `bitti({ bekle: true })` ile kendiliğinden geçmez (app.js'in mevcut `bekle` bayrağı; geçiş süresine dokunulmadı).
9. **Dokunmatikte yetim metin "🔊 Dinle /", "tekrar dinle:"** (kullan-4). Doğrulandı (kod + CSS 586). Tuş ipuçları `span.klavye-ipucu` içinde (mevcut kural dokunmatikte gizler).
10. **Rakam ↔ sayı kelimesi diktede yanlış kelime** (kod-3 #6, dikte kısmı). Doğrulandı (`zehn` / `10` → falsch). Dikte cümle seçimi (`cumleSec(…, rakamsiz)`) rakamlı cümleyi almaz. (`cumleKontrol`'de sayı normalleştirmesi grammatik alanı.)
11. **Prüfung Lesen Teil 3: aynı ilan birden çok maddeye** (kullan-2). Doğrulandı. Başka maddede seçilmiş ilan soluk + üstü çizili (`.gl-opt.pr-kullanildi`; seçmeyi engellemez, 0 hariç).

Ek: Cümle atölyesi etiket metni "ae / oe / ue / ss de doğru sayılır" — kontrol edildi: `G.cumleKontrol` ae'yi doğru, düşürmeyi `umlaut` sayıyor, uyumlu. Yalnız (kullanılmayan) yedek `G.pruefen` yolu ae'yi `umlaut/ß` sayıyordu; acik eşitliği doğru yapıldı. "kur" durumu ilgisiz (kullan-2): `sprache` konusuna yazışma / tartışma durumları eklendi (geehrt, widersprechen bu konuda) — kısmi.

## Doğrulanmayan / atlanan
- Prüfung "Bitir (N boş) onaysız bitiriyor" (kullan-2): kodda `confirm('N soru boş. Yine de bitir?')` var; doğrulanmadı.
- hoer'de Bilmiyorum düğmesi yok (kullan-1 notu, bulgu değil): değiştirilmedi.

## Başka alana
- `G.bosPruef` / `G.pruefen` (grammatik.js): ae/oe/ue/ss küçük hata (Çalış'taki bos, Goethe boşluğu, gramer); umlaut düşürme "yazım"; lemma'sız lev-1 "yazım" sözlüksüz. Dinle kendi sarmalayıcısıyla korunuyor.
- `G.yakin` (grammatik.js): umlautlu harf yer değiştirmesi (Kläte) yanlış; sondaki çift harf "çekim" (Schmerztableten diktede `artikel/çekim` + dikte:ek); ß → s (Strase, gros) `artikel/çekim`; 4 harfli kelime (hoche) toleranssız.
- `cumleKontrol` sayı normalleştirmesi (tam cümle) — grammatik.js.
- `uPruef` (app.js): lev ≤ 1 dalı sözlüksüz (metin etkinliği / ünite); metin etkinliği fast kutusu yeşil (`aktRender`); `formIdx` çok kelimeli ifade / büyük harf eşlemesi (wortSuchen, okuma sözlüğü, aktSaetze).
- `quellen/minimalpaare.txt` "vier / für" yanlış kontrastta (kod-3 #12): içerik dosyası, alanımda değil.
- app.js `deHTML` emir kipi fiiline artikel üstyazısı (dikte sonucunda görünen "Schreiben^das Sie") — app.js.

## Testler (worktree'de)
`python3 tools/build.py` ✓ · test_grammatik ✓ · test_kern 665 ✓ · test_goc 76 ✓ · test_dinle 32 ✓ (13 → 32) · stichprobe 1 ✓ · e2e_smoke ✓ · e2e_ui ✓ · e2e_aksam ✓ · e2e_cumle ✓ · e2e_fiil_artikel ✓ · e2e_dinle ✓ (yeni denetimler çalıştı: harf notu, Dinleme modu küçük hata, Teil 3) · e2e_ek ✓
