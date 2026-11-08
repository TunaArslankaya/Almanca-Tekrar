# duzeltme-gramer (7.11 / 8.11.2026)

Worktree: `/home/user/Almanca-Tekrar/.claude/worktrees/agent-a40103badda01d96c` · dal `worktree-agent-a40103badda01d96c` · commit `7442d01`
Dosyalar: `js/gramer.js`, `quellen/grammatik/*.txt` (33 dosya: fehler aralıkları + vergleich:8), `quellen/grammatik/FORMAT.md` (§7, §8, §10.3, §10.7), yeni `tests/test_gramer.js` (71 test).
Build çıktıları da committe: `daten/grammatik.js`, `index.html` ve `sw.js` (`?v=` / önbellek sürümü). Birleştirmede çakışırsa `python3 tools/build.py` yeniden çalıştırılmalı.

## Düzeltilenler (hepsi önce yeniden üretildi)
1. **1/2/3 tuşu notu değiştiriyordu** (kullan-2, kullan-3, log'da 8 kez). `tus()` içindeki dal kaldırıldı. `serbest` üçlü düğmesinin yerine soru başına **tek itiraz** düğmesi geldi (`itirazTuru` / `itirazEt`):
   - yazarak cevap yanlış ama hedefe ≤ 2 harf yakınsa (5 harften kısa hedefte ≤ 1) "yazım hatasıydı" → fast;
   - tam cümlede (umform / ceviri / ordnen / fehler düzeltmesi) yanlış ya da küçük hataysa "aslında doğru" → richtig.
   Bilmiyorum'dan sonra, tanıda ve seçmeli türlerde itiraz yok. Not `q.son`'dan okunuyor (`notla()` parametreyi dikkate almıyor). Log'a `öneri:` yazılıyor.
2. **cumlePruef → G.cumleKontrol** (kullan-2, log-1 #5–6, log-3 #5, kod-2): geçerli diziliş doğru, eksik virgül / nokta doğru ("kaynaştırma" değil), anlamsız cevapta "farklı cümle". Gramerde hedef yapı sınanmaya devam ediyor: artikel/çekim, yardımcı fiil, fiil yeri, edat, dönüşlü zamir ve eksik / yanlış kelime yanlış.
   Korunan küçük hatalar: yazım, umlaut, kaynaştırma, hitapta büyük/küçük harf, zarf eksik / fazla (yerini değiştirmiş zarf artık sayılmıyor), özne–fiil uyumu. Kelime sırası farkı yalnızsa ve fiil yerindeyse (Dem Praktikanten habe ich …), etiketi kelime sırası / bağlaç olmayan teil'lerde fast; sırayı sınayan teil'lerde yanlış.
   umform yönergesi başlangıç istiyorsa ("„Weil“ ile başla"), o kelimeyle başlamayan cevap yanlış. dinle'nin yanlış etiketleri de cumleKontrol'den geliyor.
3. **parcaPruef** (luecke / text; kullan-1 #8, kullan-2, kullan-3):
   - ae/oe/ue/ss doğru.
   - Umlaut düşürme fast `umlaut`.
   - Tek kelimede yazım hatası fast `yazım` (G.yakin; ayrıca aynı harfler ≤ 2 adım kayınca: Kläte, Aphoteke). Ek farkı yanlış kalıyor.
   - Kaynaştırma ve konuşma dili de artık etiketli.
   - Hitap: cümle ortasında ihnen ↔ Ihnen fast `büyük/küçük harf`. Cümle başındaki boşlukta harf büyüklüğü sayılmıyor.
   - Yeni bulunan hata: eski `fold` "ue"yi "u"ya indiriyordu, bu yüzden neu ↔ neue fast sayılıyordu. Sıfat konusunda ek eksikliği küçük hata görünüyordu; artık yanlış.
4. **Tanı KUCUK listesi** (kod-2 #2): gerçek etiket adları eklendi (`groß/klein`, `umlaut/ß`, `büyük/küçük harf`, `virgül`). Eksik / fazla kelime yalnız `zarf` ile birlikteyse küçük hata sayılıyor. Boşlukların küçük hatası artık etiketli, tanı onu görüyor.
5. **Teil'in sabit etiketi log'a yazılmıyor** (log-1 #9, log-2, log-3 #6): notiz'de yalnız q.tags. fehler dokunmada açıklayıcı etiket var: `yanlış kelime seçildi` / `hatayı görmedi` / `cümle doğruydu`.
6. **Hatayı bul, aralıktaki doğru kelime** (log-3 #13): `fehlerIzin` yalnız değişen kelime(ler)i kabul ediyor. Sıra / fazla kelime hatasında aralığın hepsi kabul. İçerikte 162 hata aralığı çekirdek kelimeye daraltıldı (yalnız 5. alan; satırlar silinmedi, yer değiştirmedi). Daraltma şart: test_grammatik'teki `dogruCevap` aralığın ilk kelimesine dokunuyor.
7. **Konjunktiv II hatte / hätte** (log-3 #8): `umlautBaska` ile umlautsuz yazılınca başka dilbilgisel biçim olan kelimeler yanlış sayılıyor, etiket `umlaut (başka biçim)`. Liste: Konjunktiv ↔ Präteritum (hatte, wurde, konnte …), ihr/er-Präsens (fahrt …), tekil ↔ çoğul (Mutter …), Komparativ (alter ↔ älter). Boşlukta, cümlede ve dikte'de geçerli. schon / schön fast kalıyor (test_grammatik bunu istiyor).
8. **Yanıltıcı etiketler** (kullan-4): qwertz → yalnız "farklı cümle"; luecke yanlışına sahte etiket eklenmiyor.
9. **Diğer gramer bulguları:**
   - text eşiği 0,5 → 2/3 (log-2, log-3 #15). 0,75 test_grammatik'i bozardı (2/3 → fast bekleniyor).
   - Set notu 2 konu aralığını uzatmıyor (`zorAralik`; kullan-1 #10: 3/5 → 31 gün).
   - Gramer bölümünde yanlış / küçük hatada Devam 2,5 sn kilitli (kullan-1 #7). Tanıda kilit yok; tur kısmı app'te.
   - Bilmediklerim (log-1 #10, log-2, log-3 #12): listedeki teil'de yanlış cevap "biliyorsun" sayacını sıfırlıyor; seçmeli / eşleştir / dokunma doğrusu listeyi kapatmıyor.
   - İçerik: vergleich:8'e tekil alternatifler eklendi. tuerkisch-fallen:87'de "Darf ich Ihnen helfen?" zaten vardı.

## Testler
- test_grammatik ✓ (40 kez çalıştırıldı, takılma yok), test_kern 665 ✓, test_goc 76 ✓, test_dinle 13 ✓, test_gramer 71 ✓, stichprobe 1 ✓.
- gramer_ozkontrol: 5433 / 0 sorun. pruef_grammatik: 0 hata, 3 eski uyarı.
- e2e_smoke ✓, e2e_ui ✓. Tarayıcıda elle de denendi: yanlışta Devam kilitli, `3` + Enter etkisiz, "yazım hatasıydı" → fast, log `öneri:falsch`, sayfa hatası yok.

## Düzeltilmeyen / bilerek dokunulmayan
- Tanı testinde itiraz açılmadı (kullan-2 önerisi): CLAUDE.md ve FORMAT.md "itiraz yok" diyor. Geçerli dizilişler artık doğru sayılıyor.
- Ünlü değişimi (gesprechen) gramerde de yazım sayılıyor: G.yakin davranışı, brif ilkesine uygun.

## Başka alana düşenler (yapılmadı)
- **app.js:** turdaki gramer sorusunda Devam kilidi ve çift Enter. Escape / X ile cevabın kaybolması: yeni `Gramer.turBitir()` çağrılmalı. İkinci iş "Gramer tekrarı ✓": `Gramer.bugunYapildi()` kullanılmalı, turdaki `gram` log satırı sayılmamalı. Kelimede Bilmediklerim'i seçmeli doğrunun kapatması da app'te.
- **grammatik.js:** `G.yakin` umlautlu harf kayması (Kläte) ve Feuerwehrman → çekim. Gramer yerelde aynı-harf kuralıyla kısmen kapatıyor.
- **daten/feedback.js:** yanlış / yanıltıcı düzeltmeler (zu + Akk vb.).
