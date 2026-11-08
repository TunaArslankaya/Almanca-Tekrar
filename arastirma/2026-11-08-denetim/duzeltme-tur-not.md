# duzeltme-tur-not (8.11.2026) — cevap kontrolü, sonuç paneli, doğru cevapta kendiliğinden geçiş

Worktree: `/home/user/Almanca-Tekrar/.claude/worktrees/agent-a249d9a096e1fe9bf` · dal `worktree-agent-a249d9a096e1fe9bf`.
Dosyalar: `js/app.js`, yeni `tests/e2e_not.js`, `tests/e2e_fiil_artikel.js` (eski kuralı sınayan artOb satırı yeni kurala uyarlandı); build çıktısı `index.html` / `sw.js` (?v= sürümü).

## Düzeltilenler (hepsi yeniden üretildi, `tests/e2e_not.js` sınıyor)

1. **Kendiliğinden geçiş (Tuna 8.11 "çok hızlı")** — `OTO_MS` (1000) ve 900 / 1200'lü bütün yerler tek ayara bağlandı: `S.einst.otoGecis` (1000 / 2000 / 3500 / 0 = elle), varsayılan 2 sn (`otoMs()`). Ayarlar → "Doğru cevapta geçiş" satırı (seg). Merkez `otoGec(q, gec, ms)`: süre zamanlayıcı adımlarıyla sayılır (test 4× hızlı zamanlayıcıyla tutarlı); ses çalıyor ya da sırada (`sesCaliyor` + `speechSynthesis.speaking/pending`) ise bekler, ses bitince en az 0,6 sn daha, en çok 6 sn. Panelde fare gerçekten hareket edince duraklar (dolum `animationPlayState: paused`), çıkınca sürer; panele dokunma / tıklama (Devam dışı) ya da Boşluk sayacı kapatır (dolum kalkar, Enter / Devam). Kullanan yerler: seçmeli, artikel flaşı, ayır, yazma (`auswerten`; eskiden sesi hiç beklemiyordu), itiraz sonrası, paket, metin etkinliği (akt), ses yuvası (stur; `r.bekle` korunuyor), turdaki gramer (gtur: Gramer kendi 1,4 sn'sinden sonra ayarın kalanını bekler, dolum yeniden başlatılır; elle ayarında dolum kalkar). Dolum süresi ayarla aynı. Gramer / Cümle / Dinle API'lerine `otoMs` eklendi (modüller kullanabilsin).
2. **artOb cinsiyet hatası** (log-1 #2, log-2, log-3 #3): sorulan hâlde başka cinsiyetin biçimi (die Geduld ← der, Nom/Akk; die-isme Dat'ta dem) artık falsch + `artikel der → die` (a1); yalnız doğru cinsiyetin başka hâli (der Zug Akk ← dem/der) fast + `hâl`.
3. **uPruef** (kod-1 #4, kod-2 #6, kullan-4, kullan-3, log-1 #1): sözlükte başka kelime olan yazım (legt/liegt, Staat/Stadt, setzen/sitzen, verschieben/verschrieben) artık yanlış (lev ≤ 1 dalına sözlük koşulu; ünite ve metin etkinliği ikisi de); Rezepte / Friere gibi aynı öğenin başka biçimi G.yakin ile 'çekim'; isim boşluğuna başına artikel (die Luft) → fast `fazla artikel`; isteğe bağlı 4. parametre öğe kimliği: aynı fiilin başka biçimi (können → kann) → fast çekim (metin etkinliği verir; dinle.js de verebilir). Cümle başındaki boşlukta yalnız büyük/küçük harf farkı doğru (log-1 #19).
4. **Metin etkinliği sonucu** (kullan-3, kullan-4): küçük hata kutusu sarı (`yakin`, satır içi stil) ve yanında doğrusu; özet "x / n doğru · k küçük hata".
5. **Kök Perfekt yardımcı fiil** (kullan-2, kullan-4): cümledeki yardımcı fiil (frageStammSatz'ta boşluk öncesinden okunur) ile karşılaştırılır: "Wir sind … ___" ← hat gefahren → fast `yardımcı fiil: sein`; cümlesizde v.aux / auxAlt. Birden çok biçim ("nimmt, nahm, hat genommen") → en iyi parça, en çok fast + `tek biçim yaz` (eskiden "yardımcı fiil eksik"). Konjunktiv II (könnte ← konnte) ve sözlükte başka biçim olan yazım (fährst ← fährt) → yanlış. **İçerik ajanının `p2Alt` / `pt3Alt` alanları** (gewandt/gewendet, wandte/wendete): `stammAltHedef` ile kabul ediliyor; alan yoksa güvenli (yalnız asıl biçim).
6. **İsim yazma** (kullan-4): "ein Vorurteil" → fast `artikel eksik`; "dasVorurteil" → fast `yazım, boşluk eksik`; doğru çoğul "die Vorurteile" → fast çekim + `çoğul yazdın: tekil das Vorurteil`, artikel sınanmış sayılmaz; artikel + umlaut / çekim hatası → `notVerF` artikel etiketini ekler (panel + log notiz; kern-senkron'un notVer düzeltmesiyle çift olmaz).
7. **Tam cümlede "kelime sırası / fiil yeri" (cumleYapi)** → "aslında doğru" itirazı çıkar (kod-2 #3).
8. **Paket** (kullan-1 #9, kullan-2, kullan-3): `paketPruefen` artık `bosA` (G.bosPruef + ortak son adım): "die Fahrkarte" fast `fazla artikel` (yanlış "isim büyük harfle" etiketi yok), fiile artikel en çok fast, Zugx / Zucker yanlış (önek kuralı kaldırıldı), harf yer değiştirmesi fast yazım, yanlışta "artikel/çekim" yerine `farklı`; küçük hatada etiket panelde.
9. **Boşlukta umlaut / ae / küçük harf tutarlılığı** (kullan-2, kullan-3, kod-2 #1 app tarafı): `bosSon` (bos0 / bos / Goethe boşluğu, paket): ae / oe / ue / ss tam doğru, yalnız umlaut farkı `umlaut` (yazım değil), umlaut farkıyla sözlükte başka kelime (schon / schön) yanlış, aynı öğenin başka biçimi (Bruder / Brüder) çekim.
10. **Küçük harfli isim** (kullan-2, kullan-3): yazma (pruefWort), boşluk, paket, tam cümle (`büyük/küçük harf` etiketli richtig → fast tip yazim): her yerde fast `büyük harf`, m3, seviye / zor not 4 yok.
11. **Fiil yazma** (kullan-1 #12, kod-2 #7): edatsız fiilde "untersuchen Akk" / "verschreiben D A" doğru; mastar eki eksik ("warte auf") tip `mastar` (m3) — 5.11'den beri 'çekim' (m2) oluyordu; pruefAbr'in kendi urteil'i çekimde fast.
12. **Etiketler / itiraz** (kullan-1 #13, kod-3 #11, log-3 #23): yanlış kararın yanında "artikel / ek" / "çekim" yerine `farklı kelime`; itirazdan sonra `yanlış kelime`, `hedef kelime`, `farklı cümle`, `farklı kelime` de silinir.
13. **Yoklamada çekim hatası** "bilmiyor" sayılmıyor (kod-2 #10).
14. **Panel**: "aslında doğru de" notu doğru panelde yok (kullan-1 #18); "doğrusunu bir kez yaz" kutusu doğrusu satırının hemen altında (kullan-1 #16, kullan-3 mobil); seçmelide çok hızlı basışta başlık "✓ Doğru · çok hızlı: sayılmadı" (kullan-3).
15. **Ses yuvası çift Enter** (kullan-1 #2 app tarafı): yeni dinleme sorusunun ilk 0,4 sn'sinde boş girdiyle Enter yok sayılır (önceki Devam'ın Enter'ı 0 sn'de "bilmiyorum" yapmasın).
16. **Turdaki gramer sorusu (gramer ajanının isteği)**: Gramer'in sonuç paneli görününce yanlış / küçük hatada Devam 2,5 sn kilitli (Gramer'in Devam'ı da kilitlenir, geri sayım), panel görünürken tek Enter / Devam hem notlatır hem geçer (çift Enter gitti); doğruda ayar süresi.
17. **Zor soru yavaşlık** (log-3 #10): koordinatörün notu üzerine `auswerten`'e `sure` EKLEMEDİM (kern-senkron ajanı ekledi, birleştirmede onunki). Benim `auswerten` değişikliklerim aynı bölgede: `kontrolSon(q, q.pruef(input), input)`, etiket eşlemesi (`farklı kelime`), yoklama listesine `cekim`, itirazda `cumleYapi`; `sonuc` nesnesinin `zor:` satırı değişmedi — `sure` o satırın sonuna eklenir.
18. **Kontrol ajanının `G.kelimeSinifi`'si**: varsa `uPruef` tek kelimede onun kararını kullanır (dogru / buyukKucuk / umlaut / yazim / cekim / null = yanlış); yoksa eski sözlüklü yol. Test stub'la sınanıyor.
19. **Panel `artYanlis`** (kern-senkron notu): `not.m >= 2`; m2'de başlık "kelime ≈ · artikel ✗".

## Doğrulanmadı / düzeltilmedi
- "Doğru alternatif çeviriler (Präteritum, ihr) yanlış" — **içerik**: kabul `x.alts` (` || `) üzerinden çalışıyor (`cumlePruef` her alternatifi deniyor); eksik olan alternatif satırları (içerik ajanı ekledi). Otomatik Präteritum / ihr üretimi istenirse `G.cumleKontrol` (grammatik.js) işi.
- Kök "gefahre" (son harf eksik) yanlış: G.yakin 'cekim' veriyor, "gebliebt" ile ayırt edilemiyor; dokunulmadı.
- Metin boşluğuna itiraz düğmesi (log-2): yapılmadı (çok boşluklu panel; küçük değil).
- Kalıp sorusunda "über über + Akk" çip tekrarı (kullan-1 #12 görünüm): yapılmadı (`G.objMuster`).
- Seviye çipi küçük hatada (kullan-1 #17, tur sonu): alanım dışı (tur sonu / kabuk).
- Turdaki gramer cevabı Esc'le kaybolur (kullan-1 #6): `cikisNotla` + Gramer API'si gerekir; yapılmadı.

## Başka alana
- kern.js `notVer` (kern-senkron): umlaut / çekim / hâl dalında artikel notu (a) — bende yalnız etiket. Bildirime göre o tarafta yapıldı; panelde `artYanlis` m ≥ 2'ye indirildi (başlık m2'de "kelime ≈ · artikel ✗").
- gramer.js: doğru cevapta kendi 1,4 sn'lik geçişi (`api.otoMs` kullanabilir), `parcaPruef` yazım / umlaut, 1/2/3 tuşu, `cumlePruef` virgül — gramer ajanı.
- dinle.js: boş Enter = bilmiyorum, Dinleme modu küçük hata gösterimi, dikte küçük harf — dinle ajanı (uPruef'e 4. parametreyle öğe kimliği verebilir).
- cumle.js: doğru cevapta 1400 ms sabit geçiş (`api.otoMs` eklendi; cumle.js'te kullanılmalı).
- grammatik.js: `yakin` umlautlu harf yer değiştirmesi, Feuerwehrman 'cekim', `bosPruef` umlaut (app tarafında `bosSon` ile örtüldü), Vorfeld varyantları — kontrol ajanı.
- Fiil metni (`fvIndex`): metinde alternatif biçim (gewendet) işaretlenmesi için p2Alt / pt3Alt — fiil metni sahibi.
- `e2e_ui` "tanıtım kilidi çok kısa": kilit değişmedi; sürücünün kartı fark etme gecikmesi ölçüye giriyordu (geçiş zamanlaması değişince 946 → ~897 ms, eşik 900). Ölçü artık kartın `kilitT0`'ından (sayfa saati): 1012 ms.

## Sonuç
Commit `fd2952a` (dal `worktree-agent-a249d9a096e1fe9bf`, push yok). Testler: build ✓, test_grammatik ✓, test_kern 665 ✓, test_goc 76 ✓, test_dinle 13 ✓, stichprobe 1 ✓, stichprobe_module refl ✓, e2e_smoke ✓, e2e_fiil_artikel ✓, e2e_dinle ✓, e2e_ek ✓, e2e_cumle ✓, e2e_aksam ✓, e2e_not ✓ (yeni), e2e_ui ✓ (bir koşuda yük altında sprint geçiş kartı tıklaması zaman aşımına düştü; yeniden koşuda geçti).
