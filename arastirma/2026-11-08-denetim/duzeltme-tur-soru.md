# duzeltme-tur-soru (8.11.2026)

Worktree: /home/user/Almanca-Tekrar/.claude/worktrees/agent-abf23fda1ea3e81be · dal `worktree-agent-abf23fda1ea3e81be`
Dosyalar: `js/app.js` (soru üretimi, seçim sarmalayıcısı, hafızaya yazma çağrısı, ekranlar), `tests/e2e_soru.js` (yeni, 32 denetim), build çıktısı `index.html` / `sw.js` (?v= / önbellek sürümü).
`js/kern.js`, `js/gramer.js`, `js/dinle.js`, `log/`, içerik dosyaları değişmedi.

## Düzeltilenler (hepsi önce yeniden üretildi)

1. **Çok kelimeli öğe boşluğu** (log-1 #4, log-2, log-3 #1; kod-3 #10). Dosya: `wortLuecke` + yeni `wlParcalar`.
   - Bitişik ifadede bütün ifade tek boşluk: vor allem, ein bisschen, gar nicht, als ob, jedes Mal.
   - "…" ile ayrılan bağlaç iki boşluk: entweder … oder, weder … noch, sowohl … als auch, um … zu. "um … zu"da zu'dan sonra mastar gelmeli, "zu Hause" eşleşmez.
   - Fiilli kalıpta ayırt edici parça boşluk olur, sich / fiil / baştaki artikel cümlede kalır: sich Mühe geben → Mühe, eingespannt sein → eingespannt, vor Gericht gehen → vor Gericht, eine Entscheidung treffen → Entscheidung.
   - Ayırt edici parça kalmazsa boşluk yok: brauchen … zu.
   - Kontrol tarafında en küçük ek (`ifadeBosPruef`, yalnız `frageLueckeStufe`'nin pruef'i):
     - "…" ya da "..." yazılırsa yok sayılır.
     - İfadenin tamamı yazılırsa (sich Mühe geben) fast + `fazla kelime`, tip yazim; "fazla artikel" kuralının aynısı.
   - İsim boşluğunda dişil türev artık eşleşmiyor (Chef → Chefin, Lehrer → Lehrerin, Cousin → Cousine).
2. **Metindeki kelime eşlemesi** (kullan-1 #1, log-1 #3, log-2, log-3 #2, kullan-4 "regenn"). Dosyalar: `formIdx`, yeni `metinEsle` / `cumleBasi` / `tokTemiz` / `lwCumle`, `wortSuchen(t, basta, satz)`, `kontextSaetze`, `aktSaetze`, `lesenWort`.
   - Büyük harften küçük harfe çevirme yalnız cümle başında yapılıyor. Schienen, Unternehmen, Weile, Boten, Stand artık fiile / bağlaca bağlanmıyor. Okuma ekranı cümle konumunu DOM komşularından buluyor.
   - Dönüşlü fiilde zamir denetimi her yerde var: cümlede zamir yoksa eşleşme olmaz.
   - Çok kelimeli ifadenin ilk kelimesi (eine, sich, den, zur, zwar) öğeye bağlanmıyor.
   - Diğer kelimelere ek yalnız sıfat / zamirde ekleniyor, zarfta yalnız -e. Böylece weil+e ≠ Weile, seit+e ≠ Seite.
   - İsimde uydurma biçimler kaldırıldı (Regenn, Beginnn, Zeichenn). -n / -en yalnız n-Deklination'da, çoğul + n yalnız -n / -s ile bitmeyen çoğulda.
   - `lexSet` sözlüğü formIdx'ten kurulduğu için yazım hoşgörüsü de düzeldi. Kontrol ajanının isteğiyle sözlükte artık yalnız gerçek biçimler var (`wBicimler`):
     - sıfat: hoch → hohe; leise → leisen ("leisee" değil); dunkel → dunkle; teuer → teure.
     - zamir: dieser → diese / jedem; andere → anderen.
     - zarfta ek yok (yalnız gerne).
     - isim: Genitiv yalnız der / das isimde.
     - Präteritum: kamen / machten ("kamn", "machteen" değil).
     - hoche, etwaen, regenn, leisee artık sözlükte değil; G bunları yazım hatası sayabilir.
   - Dinle.js `A.wortSuchen(c)`'yi konumsuz çağırıyor. Bu durumda küçük harfe çevirme hiç yapılmıyor (güvenli taraf).
3. **"Metinde" sorusunda yanlış anlam** (kullan-3, log-2 scheinen). Kod tarafındaki önlemler (`kontextSaetze`):
   - Türkçesinde ';' olan çok anlamlı öğe (55 fiil, ör. scheinen) için okuma metni cümlesi kullanılmıyor. Soru seçmeliye düşüyor.
   - Cümle aynı ismin bir bileşiğini açıklıyorsa ("der Stadtrat oder Rat") o cümle isim için kullanılmıyor.
   - der Rat'ın Türkçesine "meclis" anlamı eklemek içerik ajanının işi.
4. **Goethe sınav metinleri** metin boşluğundan ve "metinde" havuzundan çıkarıldı (log-1 #12): `aktSaetze` ve `kontextSaetze`'de `LT.filter(t => !t.aufgaben)`.
5. **Düzenli fiile kök sorusu yok** (log-2). `frage0` kök / kokSatz sorusunu yalnız `v.duzensiz` için kuruyor. Bu yeni bayrak fiil başına bir kez sayılan `v.stark`'tan bağımsız; aynı fiilin ikinci anlamı da düzensiz sayılıyor. Düzenli fiilde soru null olur, bu turun kök sırası kapanır.
6. **Basamak kapısı / bedava seviye** (kod-1 #2, #3). `hafizaYaz` artık şunu geçiriyor:
   - `b`: sorulan biçimin basamağı (`BICIM_B`; yoklama 2, bos 3, cumle 4 …) ile `sel.b`'nin küçüğü. Yedeğe düşen soru (cümle yok → yazma, tam cümle yerine boşluk) seçimin basamağını almıyor.
   - `ipucu`: yaz0, bos0 ya da lv 0 ise ipucu var sayılıyor.
   - Sonuç: yoklamada bilinen kelime bm 2 oluyor; ipuçlu bos0 bm'yi 3'e çıkarmıyor. Log'daki `basamak:B…` alanı da sorulan basamak.
7. **Bilmediklerim** (log-2, log-3 #12, kelime tarafı):
   - "artık biliyorsun" sayacı yalnız üretim biçimindeki doğru cevapla artıyor (`URETIM_B` + yoklama).
   - Yanlış cevap kayıtlı öğede d'yi sıfırlıyor: `bilmedikIsle(key, null, 'yanlis')`, n artmıyor.
8. **Zayıflar'da zor soru yok** (kullan-2): `sec()` Zayıflar'da Kern'in zor seçimini `zorsuz()` ile normal merdivene çeviriyor. Test aynı durumda ham Kern'in zor seçtiğini, uygulamanın seçmediğini gösteriyor.
9. **Bugün ekranı**:
   - İkinci iş kartı turdaki gramer sorularını (notiz `tur:akis`) saymıyor (kullan-1 #5). Gramer dalı birleşince `Gramer.bugunYapildi()` de kullanılacak; çağrı güvenli yazıldı (koordinatör isteği).
   - Yanlışlar listesinde aynı öğe + aynı cevap bir kez gösteriliyor, yanında ×N (kullan-4).
   - "yeni kelime" kutusu log'da kayıt yoksa gün sayacını (neuV + neuN) kullanıyor (kullan-1 #11, kullan-2; kısmi).
10. **Akşam turu sonunda Enter** (kod-1 #10): ekranda "Bir tur daha" yoksa ana sayfaya dönüyor.
11. **Gramer sorusu X / Escape** (kullan-1 #6, koordinatör isteği): `cikisNotla` turdaki gramer sorusunda `Gramer.turBitir()`'i güvenli çağırıyor (`typeof` kontrolü). Bu worktree'de API yok, test birleştirmeden sonra.
12. **Cümle başı rozeti** (kullan-4 Wegen, kullan-1 #15) `deHTML`'de:
    - Cümle başındaki edat / bağlaç / zarf / zamir (Wegen) isim rozeti almıyor.
    - Ardından zamir ya da bitte / doch / mal gelen emir veya soru fiili de almıyor (Schreiben Sie, Pass bitte, Treffen wir).
13. **Sesli söyle metinleri kaldırıldı**: tanıtım kartındaki "🗣 Sesli söyle" satırı gitti, ünite tanıtımı artık "oku, dinle" diyor. Seçmeli perdedeki "Önce aklından söyle" kaldı: konuşma değil, akılda hatırlama.
14. **Fiil metni** (kullan-2):
    - Cümle ilerisinde ayrılmış ön ek varsa ("bietet … Hilfe, aber keine Reparationen an") ön eksiz fiil (bieten) sayılmıyor.
    - Passiv (wurde … gezwungen) Perfekt diye etiketlenmiyor (`fvImSatz`).
15. **"über über + Akk"** (kullan-1 #12, gösterim): yalnız fiil adının hemen yanında yazıldığı yerlerde edat tekrar edilmiyor (`objGoster`). Bunlar Kelimeler / Zayıflar listesi, yazma ve kalıp çözümü, cümle çipi ve erkl. Ayrı çiplerde eski biçim duruyor.
16. **Seviye kutlaması** (kullan-1 #17): tur sonundaki "seviye atlayanlar" yalnız tam doğru ve ipucusuz cevapta sayılıyor.
17. **Log günü** (kern-senkron ajanının tag() değişikliği için): yeni `logGun(e)`, log zamanını `tag()` ile aynı tanımla güne çeviriyor. Kullananlar: `gunOzeti`, `aktifSn`, `ikinciIs`, `beceriBugun`, sprint gramer yedeği, üretim doğruluğu haftaları. Böylece tag() 04:00'e geçince 00–04 satırları doğru güne düşüyor.

## B4 (tam cümle) neden neredeyse hiç gelmiyor: tasarım, hata değil
Gerçek kayıtla ölçüm (292 öğe): S ≥ 21 olan 93 öğenin yalnız 15'inde B4 kapısı açık. Engeller:
- pk ≤ 1 (farklı günlerde ipucusuz üretim yok): pk0 156 öğe → ≤ B2, pk1 80 öğe → ≤ B3.
- bm 2 (B3'te ipucusuz `bos` doğrusu yok).
- tier-3 isim / diğer (ünite dışı) ≤ B3: kural gereği.
- `ustBasamak` 3.
Ek nedenler:
- bm 3 öğenin aralığı 30 gün, B4'e hazır öğe günde ≈ 0,5 vadeli oluyor.
- Basamak %20 olasılıkla bir indiriliyor; ısınma / momentum da indiriyor.
- Tur yan yuvalarla (ses, metin, gramer, artikel) doluyor.
- Log: B4 hiç yok, `B3 | bicim:bos` 22, `bos0` 64.
Benim düzeltmem bos0 bedava bm 3'ü kapattığı için B4 daha da seyrekleşecek. B4 isteniyorsa tasarım kararı (Kern, başka alan):
- turda 1 `bos` / `cumle` yuvası (bm ≥ 2 öğeden), ya da
- tier-3 sınırını gevşetmek.

## Testler (worktree'de, son değişikliklerden sonra)
- build ✓ · test_grammatik ✓ · test_kern 665 ✓ · test_goc 76 ✓ · test_dinle 13 ✓ · stichprobe 1 ✓
- e2e_soru (yeni, 34) ✓ · e2e_smoke ✓ · e2e_ui ✓ · e2e_aksam ✓ · e2e_ek ✓ · e2e_cumle ✓ · e2e_fiil_artikel ✓ · e2e_dinle ✓ · sim_akis ✓ (son tam koşum dosyası: scratchpad/turso/e2e_son.txt)

## kern-senkron ile çakışan / ikisinin de yaptığı (birleştirmede seçilecek)
Kern-senkron (3709eb7) aynı bulguları Kern tarafında düzeltmiş. Ben uygulama tarafında yaptım:
- yoklama bm 2 ve ipuçlu bos0 / yedek biçim: `hafizaYaz` `BICIM_B` + ipucu. O: Kern `uygula`.
- düzenli kök: `frage0` `v.duzensiz`. O: Kern `duzenli`.
- Zayıflar zor: `sec()` `zorsuz`. O: `ot.zayif`.
İkisi birlikte de çalışır (aynı yönde, zararsız). Kern sürümü alınırsa benim `zorsuz` / `duzensiz` bekçilerim yedek olarak kalabilir ya da atılabilir. `BICIM_B` (sorulan biçimin basamağı) Kern'de yoksa tutulmalı.

## Düzeltilmeyenler / başka alana
- **tur-not** (kontrol / panel):
  - uPruef sözlüksüz lev 1, artikelli isim, fast kutusu yeşil; cümle başı küçük harf.
  - artObPruef cinsiyet; stammTekPruef yardımcı fiil.
  - pruefAbr hâl, mastar; yoklamada çekim; zor soruda yavaşlık `sonuc.sure`.
  - Tam cümle: "aslında doğru" notu ✓ panelde görünüyor (erkl metni duruyor, gösterim kararı sonucPanel'de).
  - Kalıp sorusunun belirsiz görünümü.
- **Gramer (gramer.js)**:
  - Bilmediklerim'de yanlışta sıfırlama için `api.bilmedik(key, ad, 'yanlis')` çağrısı. app tarafı `'yanlis'` değerini kabul ediyor.
  - 1/2/3 gizli tuş, parcaPruef yazım, teil etiketi, virgül.
- **dinle.js**: Dinleme modu "5 / 4 · bitti"; aynı kelimenin iki kez boşluk olması. sich artık formIdx'te olmadığı için kendiliğinden düzeldi.
- **kern.js**:
  - ikinci hatırlama / tur sonu kuyruğu çok yakın.
  - Kök sırası: düzenli kök seçilince bu turun kök hakkı yanıyor; `C.stark` / `duzenli` filtresi Kern'de olmalı. Kern-senkron yaptı.
- **İçerik**:
  - der Rat "meclis" anlamı, eher / Praxis cümleleri, selbe, wenden gewandt, yeni kelimelerin < 5 cümlesi.
  - `das Unternehmen` / `die Weile` nomen_extra'ya eklenebilir; metinde isim olarak tanınırlar.
- **Cihaz başına log** (karışma tablosu, dk, üretim doğruluğu): zustand'a log özeti gerekiyor (senkron, tasarım). Yalnız yeni kelime sayısını düzelttim.
