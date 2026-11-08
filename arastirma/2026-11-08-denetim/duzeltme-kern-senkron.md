# duzeltme-kern-senkron (8.11.2026)

Worktree: `/home/user/Almanca-Tekrar/.claude/worktrees/agent-ad52a61c1f8f0811b` · dal `worktree-agent-ad52a61c1f8f0811b`
Dokunulan dosyalar: `js/kern.js`, `js/app.js` (yalnız depolama / senkron / log / gün anahtarı / Kern köprüsü; tek satır `auswerten`), `tests/test_kern.js`, `tests/e2e_aksam.js`, yeni `tests/e2e_senkron.js`; build çıktısı `index.html`, `sw.js` (?v= / önbellek sürümü).

## Düzeltilenler

1. **`S.pending` klasörsüz cihazda sınırsız büyüyordu** (kod-1 #1, kod-3 #1). Doğrulandı: `logEintrag` her satırı `S.pending`'e ekliyor, yalnız klasör bağlıyken boşalıyordu; GitHub akışı ayrı kuyruk (`S.ghPending`) kullanıyor ve o zaten yazılınca düşüyor — yani Tuna'nın telefonunda pending hiç boşalmıyordu.
   - `logEintrag`: pending'e yalnız klasör bağlı / izin bekliyor / açılışta klasör durumu henüz bilinmiyorken eklenir. `ordnerLaden` klasör yok (API yok ya da bağlı klasör yok) dediğinde pending boşaltılır (`klasorYok`).
   - `save()`: `pending` ve `ghPending` en çok 3000 satır (S.log ile aynı). Kayıt hatasında önce yerel log kopyası (`almanca-tekrar-log`) silinip 1000 satıra kısaltılarak ana kayıt yeniden yazılır (ilerleme önce); yine olmazsa ekranda kalıcı uyarı çubuğu (`#kayit-cubuk`, "GitHub'a gönder" düğmesi). Kayıt düzelince çubuk kalkar.
   - Klasör değişkenleri (`ordner` …) save/logEintrag'ın açılışta güvenle okuyabilmesi için Durum bölümüne taşındı.
2. **Her gizlenmede `zustand.json` commit'i** (kod-3 #5). `ghSync`: durum özeti (FNV, log / kuyruklar / gespeichert hariç) son yazılan / son birleştirilenle aynıysa ilerleme yazılmaz (uzak dosya da okunmaz); otomatik senkronlar (gizlenme, 3 dk zamanlayıcı, 30 satır) son commit'ten en az 2 dk sonra, arada gelenler zamanlayıcıyla birleşir; `pagehide` ve düğmeler (`gh-simdi`, metin gönder, Claude'a gönder, anahtar kaydet / kopyala, uyarı çubuğu) `zorla` (aralık beklemez, yine yalnız değiştiyse). Özet `localStorage` `almanca-tekrar-ghozet`'te (yeniden açılışta gereksiz yazım yok); `uzakBirlestir` yerel temizse birleşik özeti temiz sayar.
3. **Log tabanlı istatistikler cihaz başına** (kullan-1 #11, kullan-2 "başka cihazda istatistikler boş"). GitHub'daki `log.csv`'nin öbür cihaz satırları yerel `S.log`'a karışır (`logBirlestir`: CSV ayrıştırma, aynı satır bir kez, zaman sırası, son 3000; GitHub / klasör kuyruğuna girmez). Açılışta en çok yarım saatte bir ve her log yazımında (dosya zaten okunuyor).
4. **`Kern.birlestir` cümle geçmişini `t:0` yapıyordu** (log-1 #11, kod-2 #11). Doğrulandı: gerçek `zustand.json`'da 237 kaydın 201'i `t:0`. Eski düz metin ve `t` 0/yok kayıt artık `KX_ESKI` (6.11) sayılır; aynı (cümle, zaman) iki tarafta bir kez, bir tarafta n kez ise n kez kalır. `Kern.kontextOnar` açılışta (`kernAc`) yerel eski kayıtları bir kez düzeltir → bringen cümlesi (t0 + 7.11) artık 30 günde 2 sayılır.
5. **`notVer`: umlaut / hâl / çekim + artikel hatası** (kod-1 #9, kod-2 #4, kullan-3). Bu dallarda da `artEt()` + `a: aNot()`: "der Kuche" → m2 + a1 + `umlaut, artikel der → die`. (Panelde `artYanlis` `not.m >= 3` koşulu başka alanda — aşağıda.)
6. **Akşam tekrarı** (kod-1 #5). Doğrulandı. `aksamDurum`: "bugün yanlış" yalnız hafızaya yazan log biçimlerinden (erk, bed, wort, prod, abr, nsatz, satz, luecke, refl, ndek → anlam; `art` ve artikel etiketi → artikel); duy / hoer / cümle atölyesi / stamm / ayir / gram / paket aday yapmaz; yalnız-artikel fast anlamı yanlış yapmaz. `Kern.aksamHakki(…, tur)` hafıza başına (yalnız artikeli yanlış öğede anlam hafızası yeniden yazılmaz); `uygula` akşam istisnasında vadeyi yarın 04:00'e yalnız bugün yeni öğede, sabah kaydı ya da akşam cevabı yanlış/fast iken çeker (log'dan bildirilen hata + doğru akşam cevabı uzun aralığı çökertmez). `hafizaYaz` `aksamYanlis` / `aksamArtYanlis` ayrı geçer.
7. **Bilmediklerim** (log-1 #10, log-2, log-3 #12). Kelimede: sonraki yanlış (`falsch`, bilmiyorum olmadan) `d`'yi 0'a çeker (`bilmedikIsle(key, null, 'yanlis')`, `y` zamanı; `Kern.birlestir` `max(son, y)` ile yeni olayı kazandırır); "artık biliyorsun"a yalnız üretim biçimi (yaz0/yaz/bos0/bos/cumle/metin/kalip) doğrusu sayar, seçmeli saymaz.
8. **Zor soruda yavaşlık** (log-3 #10). `auswerten`'de yazma cevabının süresi `sonuc.sure` (tek satır; yazma biçimlerinde yalnız zor dalını etkiler): 25 sn üstü zor doğru → m3 + `yavaş`, seviye atlamaz.
9. **Zayıflar'da zor soru** (kullan-2). `Kern.sec` `zorOk` `!o.zayif`; app `sec()` `ot.zayif = m === 'zayif'`.
10. **Gramer hayaletleri birleştirmede diriliyordu** (kod-1 #8; doğrulandı: `Object.assign(b.ghost, a.ghost)`). `ghostBirlestir`: hayaletin son güncellemesi ≈ due − adım aralığı; anahtarı olmayan tarafın o teil'deki son cevabı (`konu[k].teil[t].son`) daha yeniyse hayalet orada çözülmüş/silinmiş sayılır, alınmaz; iki tarafta varsa son güncellenen. `gramer.js`'e dokunmadan.
11. **Arka planda kapanan cevap log'a açılış saatiyle** (kod-1 #7). `bekleyenKaydet` `r.t` = cevap anı (soru açılışı + süre); `logEintrag(e, t)` isteğe bağlı zaman, `hafizaYaz` `opt.zeit`, `yoklamaBildi` zaman.
12. **Gün sınırı 00:00 / 04:00** (kod-1 #6, kod-2 #9, kod-3 #7). `tag()` artık öğrenme günü (`takvim(t − 4 saat)`, Kern.gun4 ile aynı); log zaman damgası (`zeitStr`) takvimde kaldı; `fvTag` çift kaydırmasın diye `tag()`. Sayaçlar, seri, hedef, gün kontrolü, gramer `gun()` (api.tag) 04:00'te değişir. Log'da 00–04 satırı yok: veri göçü gerekmedi.
13. **Yoklamada bm 0 kalıyordu** (kod-1 #2). Kern yoklama dalı `bm: 2, b: 2`.
14. **İpuçlu `bos0` ve yedeğe düşen biçim bm'yi yükseltiyordu** (kod-1 #3). `uygula`: etkin basamak = min(seçim basamağı, sorulan biçimin basamağı `BICIM_B`); `bos0` (yaz0 gibi) ipuçlu: bm yükseltmez (ds değişmedi).
15. **Düzenli fiile kök sorusu** (log-2). Kern bağlamına `duzenli(id)` (Präteritum = kök + -te/-ete; app'teki `stark` kuralıyla aynı); `vadeliler` ve yeni kök seçimi düzenli fiili atlar (veri silinmedi). Gerçek kayıtta 12 kök (blitzen, regnen, stellen, beruhigen, wenden, stimmen, zweifeln, rechnen, reagieren, füllen, rasieren, verletzen).

Testler: `tests/test_kern.js` +26 (notVer artikel, kontext, hayalet, bilmedik birleştirme, yoklama bm, bos0 / yedek biçim bm, akşam hafıza başına + vade, Zayıflar zor yok, düzenli kök); `tests/e2e_aksam.js` yeni kurala göre (hafızaya yazmayan satır aday yapmaz, istisna hafıza başına, vade kuralı); yeni `tests/e2e_senkron.js` (sahte GitHub API: değişiklik yokken yazım yok, 2 dk aralık, birleşik yazım, `gh-simdi` değişiklik yoksa yazmaz, pending boş, öbür cihaz log satırı karışır ve kuyruğa girmez, Bilmediklerim yanlış/seçmeli/üretim, zor soru 30 sn → yavaş, kota: yer açma ve uyarı çubuğu).

## Düzeltilmeyenler (neden)
- log-2 "yanlış sonrası tekrar / ikinci hatırlama çok yakın": `partiBasladi` "mini sorudan ≥ 4 soru sonra" kuralına uyuyor; tur sonunda kuyruğun sırasını beklemeden gelmesi (malzeme yokken) ve uzatma yerleşimi tasarım gereği (CLAUDE.md / yorumlar). Kural ihlali değil, tasarım tercihi: dokunulmadı.
- log-3 #22 (kök / artikel yanlışında turda yeniden sorma yok, momentum notiz bayrağı): yeni özellik; dokunulmadı.

## Başka alana
- `js/gramer.js` `notla`: Bilmediklerim için gramer teil'inde `n === 1` (yanlış) iken `api.bilmedik(key, ad, 'yanlis')` çağrılmalı (API hazır: d sıfırlanır); `wahl` / `eslestir` doğrusu sayılmamalı. es-korrelat/wegfall örneği buradan.
- Sonuç paneli (`sonucPanel` `artYanlis` `not.m >= 3`): artikel hatası artık m2 ile de notlanıyor; panel başlığında "kelime ≈ · artikel ✗" için koşul `not.m >= 2` olmalı (tur-not).
- `ikinciIs` / `gunOzeti` / İlerleme ısı haritası: `tag()` artık öğrenme günü; log `zeit` (takvim) ile `startsWith(tag())` karşılaştırmaları 00–04 arasında satırı ıskalar; `zeitStr(Kern.gunBas4(t))` aralığıyla filtrelenmeli; ısı haritasında `bugun = new Date(t − 4 saat)` (arayüz).
- `CLAUDE.md`: yeni test `node tests/e2e_senkron.js`, akşam istisnasının hafıza başına olması, `almanca-tekrar-ghozet`, `tag()` = öğrenme günü notu eklenebilir (dokunmadım).

## Sonuç
Commit `3709eb7` (dal `worktree-agent-ad52a61c1f8f0811b`, pushlanmadı).
Testler: build ✓, test_grammatik ✓, test_kern 707 ✓, test_goc 76 ✓, test_dinle 13 ✓, stichprobe 1 ✓, stichprobe_module refl ✓, sim_akis ✓;
e2e_smoke ✓, e2e_ui ✓, e2e_aksam ✓, e2e_cumle ✓, e2e_fiil_artikel ✓, e2e_dinle ✓, e2e_ek ✓, e2e_senkron ✓ (bir kez bütün GitHub isteklerinin "Failed to fetch" aldığı tek bir düşüş görüldü, makine başka ajanların testleriyle yüklüyken; sonraki 4 çalıştırma geçti).
Düzeltilen 15 bulgu (tekilleştirilmiş), atlanan 2 (tasarım / özellik), başka alana 4 not.
