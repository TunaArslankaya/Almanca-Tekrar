# Süre ve davranış analizi: 8.11 düzeltmesinden sonra (8.11 06:00 – 12.11 10:48), 26.10–7.11 ile karşılaştırma

Betikler: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/analiz-sure/` (`ortak.py`, `s1_gunler.py` … `s9_aktif.py`, `s5_yeniden.js`; çıktılar `s1.out`, `s2.out`, `s3.out`, `s4.out`, `s6.out`).

## Özet

1. **Yeni dönemde çalışma azaldı.** Düzeltmeden sonraki 9–11.11'de günde ortalama **71 cevap / ~10,5 aktif dk** var. Önceki dönemde çalışılan gün başına **101 cevap / 15,5 dk** idi. 12.11'deki oturum gün içinde hâlâ sürüyor. Seri bozulmadı: 8–12.11 arası her gün çalışıldı, oturumlar akşama kaydı (18:20–20:40).
2. **Günlük hedef bir "dur" işareti gibi çalışıyor.** 9.11 ve 10.11'de tam **4 tur** yapıldı; bu, `ayar4.turHedef` = 4 değerine eşit. Hedef dolunca bırakıldı. Bugün ekranındaki 20 dk hedefine yeni dönemde hiçbir gün ulaşılmadı (8,1 / 8,5 / 15,0 dk). İki hedef birbiriyle çelişiyor.
3. **Soruların biçimi değişti, "seviye atlama" neredeyse bitti.** Yeni dönemde cevapların %37'si ipuçlu `yaz0`. Önceki dönemde seçmeli %22, `yaz0` %14 idi. Tur başına seviye atlayan öğe önceden 84/74 turdu, 9–12.11'de **1/17** tura indi. Nedeni: vadesi gelen öğelerin S değeri düşük (yaz0'da medyan 0,85). `Kern` S < 4 için `yaz0` seçiyor (`js/kern.js:329`), 8.11'den beri de ipuçlu biçim bm'yi yükseltmiyor (`js/kern.js:204–212`). Tur sonunda her seferinde "seviye atlayanlar · 0" görünüyor.
4. **Cevap süreleri sağlıklı ve hızla doğruluk arasında güçlü bir ilişki var.** Toplam medyan 4 sn. 0–4 sn içindeki cevapların %83–85'i doğru, 8–11 sn'de %41, 20 sn üstünde %30. Hızlı cevaplar baştan savma değil, bilinen öğeler. ≤ 2 sn'deki 8 hatanın 5'i artikel flaşı ya da artOb tahmini.
5. **Doğru cevaptan sonra panelde neredeyse hiç durmuyor.** Doğrudan sonraki panel 0–1 sn (%95). Yani Tuna otomatik geçişi (2 sn) beklemiyor, hemen Enter'a basıyor. Bu yüzden `otoGecis` ayarı masaüstünde pratikte etkisiz.
6. **Yanlış ve küçük hatada süreyi kilit belirliyor.** Panelde kalma 2–4 sn (medyan 3), kilit 2,5 sn. Yani kilit açılınca geçiyor. Gramer yanlışında panel medyanı 4 sn, açıklama ve kural kutusu bu sürede okunamaz. Düzeltme kutusuna uyum tam: **29/29 "düzeltti"**, hiç "geç" yok, yazma dahil medyan 5 sn.
7. **Bilmiyorum oranı düşük ve dürüst: %1,5** (4/271). 8.11 06:00'dan bu yana itiraz 6 tane, hepsi gramerde. 2'si haklı (ordnen ×2: sistem geçerli dizilişi yanlış saydı), 2'sinde son not fazla cömert ama aslında küçük hata olmalıydı ("die die", "besuche"), 2'si haksız (adjektiv:78, verbstellung:54 → yine de `richtig` aldı).
8. **Notlamada kalan birkaç pürüz:**
   - TeKaMoLo `fehler`'de yer değiştiren öteki kelime ("morgen") yanlış sayılıyor ve itiraz düğmesi yok.
   - `ordnen`'de Türkçe gösterilmiyor ama renklerin yer değiştirmesi yanlış sayılıyor.
   - `kalip` 7 denemede 1 doğru; Tuna tam cümle çeviriyor, yani biçim anlaşılmıyor.
   - Boşlukta doğru artikelle yazılan isim "yazım, fazla artikel" alıyor, oysa yaz0'da "artikel eksik" cezası var. İki kural birbirine ters.

---

## 1. Günler, saatler, oturumlar

Bir oturum, aralarında 10 dakikadan az boşluk olan cevap satırlarından oluşur. Aktif dk, uygulamanın kendi yöntemiyle hesaplandı (`aktifSn`: 3 dakikadan uzun ara sayılmaz).

| gün | oturum (saat) | tur | cevap | aktif dk | not |
|---|---|---|---|---|---|
| 26.10 | 11:20–11:25 | 6 | 73 | 5,6 | |
| 27.10 | 14:10–14:16, 20:24–20:25 | 9 | 100 | 7,5 | |
| 28.10 | 10:43–11:19 | 4 | 118 | 30,1 | gramer tanı testi |
| 29.10 | 18:10–18:12 | 1 | 17 | 1,8 | |
| 30.10 | 11:27–11:33 | 4 | 55 | 5,9 | |
| 31.10 | 15:58–16:23, 17:26–17:29 | 8 | 175 | 31,0 | gramer derin |
| 1.11 | 08:23–08:45, 17:48–17:50 | 7 | 103 | 15,4 | akşam tekrarı |
| 2.11 | — | — | — | — | seri dondurucu |
| 3.11 | 18:41–18:58 | 4 | 83 | 16,8 | |
| 4.11 | 06:42–06:55, 20:54–20:58 | 10 | 139 | 18,1 | akşam tekrarı |
| 5.11 | 05:30–05:45 | 9 | 120 | 15,0 | |
| 6.11 | 05:48, 09:45–09:54, 13:06–13:13 | 9 | 132 | 16,1 | |
| 7.11 | 17:16–17:45 | 7 | 97 | 25,3 | |
| **8.11** | 05:41–06:07 | 11 | 146 | 26,2 | 06:00'dan sonraki 4 tur büyük olasılıkla düzeltme öncesi (gece işi bu satırları 8.11'de "eski" diye inceledi) |
| **9.11** | 18:20–18:28 | 4 | 63 | 8,1 | tam hedefte durdu |
| **10.11** | 18:19–18:23, 18:34–18:38 | 4 | 59 | 8,5 | 11 dk ara; tam hedefte durdu |
| **11.11** | 20:25–20:40 | 7 | 97 | 15,0 | `dikkat cok-yanlis` 20:40 |
| **12.11** | 10:44–10:48 | 2 | 33 | 3,8 | gün sürüyor |

Karşılaştırma:

| | A: 26.10–7.11 | B: 8.11 06:00 – 12.11 | yalnız düzeltme sonrası (9–11.11, 3 tam gün) |
|---|---|---|---|
| çalışılan gün | 12 / 13 | 5 / 5 | 3 / 3 |
| cevap / çalışılan gün | 101 (medyan 101) | 80 (medyan 63) | 71 |
| aktif dk / gün | 15,5 | 12,3 | 10,5 |
| tur / gün | 6,5 | 5,6 | 5,0 |
| oturum / gün | 1,5 | 1,2 | 1,3 |
| tur süresi (ilk cevap → tur satırı) | medyan 1,45 dk | medyan 2,0 dk | — |
| cevap döngüsü (iki cevap satırı arası) | medyan 5 sn | medyan 6 sn | — |
| tur arası (tur sonu ekranı) | medyan 2 sn | medyan 1 sn | — |
| tur doğruluğu (ortalama) | %74 | %69 | — |
| seviye+ | 84 / 74 tur | 3 / 21 tur | 1 / 17 tur |

Gözlemler:
- **Zamanın dağılımı.** A'da 182 dakikanın %67'si cevabı düşünmekle, %24'ü panel ve geçişle, %6'sı tur arasıyla geçti. B'de oranlar aynı (%71 / %24 / %4). Akışta boşa giden zaman yok. Süre, cevap sayısının azalmasıyla düştü.
- **Saat.** A'da çoğu oturum sabah ya da öğlen (05:30, 06:42, 08:23, 09:45, 10:43, 11:20). B'de akşam (18:19–20:40). Akşam tekrarı ancak ilk cevap 13:00'ten önce verildiyse açılıyor (`aksamDurum`). Bu yüzden B'de hiç açılmadı. A'da açıldığı iki akşamda doğruluk 13/18 ve 13/18 idi.
- **Yorgunluk.** Uzun oturumlarda (A, 60. cevaptan sonra) üretim doğruluğu %60'tan %51'e iniyor. B'de oturumlar kısa olduğu için düşüş yok (%62 → %60).
- **Hedef davranışı.** `S.ayar4.turHedef` = 4 ve tur boyu 12 (varsayılan, `S.einst.tur` yok), yani hedef 48 cevap. 9.11 ve 10.11'de tam 4 tur yapılıp bırakıldı. Bugün ekranındaki dk hedefi (`DK_HEDEF` 20, `js/app.js:5396`) B'de hiç dolmadı. Tuna "hedef tamam" konfetisini görüp kapatıyor; 20 dk çizgisi ona işlemiyor.
- **Tur sonu "dakika" şişiyor.** `js/app.js:5201` `dk = now − tu.start` molayı da sayıyor. 10.11 18:34 turunda `dk:12` yazıyor ama 11 dk'sı mola. Tur sonundaki dakika ve `tur` satırındaki `dk:` aktif süre değil. Aktif süre için `aktifSn` doğru.
- **Seviye atlama yok.** B'deki yaz0'ların 42'si normal vadeli soru, 26'sı yanlış sonrası tekrar, 12'si kurtarma, 16'sı yeni kelimenin ikinci hatırlaması. İpucusuz üretimde doğru sayısı A'da 52, B'de 10. Zor soru (`zor`) A'da 5 kez sorulmuş, B'de hiç. Sonuç: bm yükselemiyor ve "seviye atlayanlar" grubu sürekli boş.

## 2. Cevap süreleri (`sek:`), biçime göre

Tanıtım kartları hariç. r/f/x = richtig / fast / falsch.

**B (8.11 06:00 – 12.11):**

| biçim | n | medyan | p25–p75 | p90 | r/f/x | ≤ 2 sn: n (doğru) | ≥ 15 sn: n (doğru) |
|---|---|---|---|---|---|---|---|
| yaz0 | 106 | 6 | 3–9 | 13 | 57/22/27 | 7 (%86) | 7 (%29) |
| artOb | 23 | 3 | 3–6 | 6 | 19/0/4 | 5 (%80) | 0 |
| seçmeli (sec) | 19 | 2 | 2–3 | 3 | 19/0/0 | 12 (%100) | 1 |
| hoer | 15 | 2 | 2–3 | 4 | 13/0/2 | 8 (%88) | 0 |
| gram luecke | 14 | 8,5 | 7–10 | 11 | 8/0/6 | 0 | 0 |
| artikel flaşı | 13 | 1 | 1–2 | 3 | 9/0/4 | 11 (%64) | 0 |
| ayir | 12 | 2 | 2–2 | 3 | 11/0/1 | 9 (%89) | 0 |
| gram fehler | 9 | 5 | 4–10 | 10 | 6/0/3 | 0 | 1 |
| yoklama | 9 | 3 | 3–6 | 6 | 7/1/1 | 1 | 0 |
| gram ordnen | 7 | 14 | 12–19 | 19 | 7/0/0 | 0 | 3 (%100) |
| kök | 6 | 7 | 6–11 | 12 | 6/0/0 | 0 | 0 |
| gram umform | 6 | 17,5 | 13–32 | 34 | 6/0/0 (2'si itirazla) | 0 | 4 |
| duy dikte | 6 | 21 | 19–29 | 32 | 1/1/4 | 0 | 6 (%17) |
| duy kelime / boşluk | 6 / 6 | 4 / 5,5 | | | 6/0/0, 6/0/0 | 0 | 0 |
| gram ceviri | 4 | 12 | 10–14 | 18 | 2/1/1 | 0 | 1 |
| bos0 | 4 | 4 | | | 2/2/0 | 0 | 0 |
| yaz | 3 | 4 | | | 3/0/0 | 0 | 0 |
| kalip | 2 | 15 | | | 0/0/2 | 0 | 1 |
| **toplam** | **271** | **4** | **3–8** | **14** | | 53 (%85) | 12 |

**A (26.10–7.11):** Toplam medyan 4 sn (p90 15). Seçmeli 3 sn, yaz0 4 sn, yaz 5 sn, artikel 2 sn, gram luecke 10 sn, gram ceviri 21 sn, umform 24 sn.

Hızla doğruluk ilişkisi (A / B):

| sek | 0–2 | 3–4 | 5–7 | 8–11 | 12–19 | 20–39 | 40+ |
|---|---|---|---|---|---|---|---|
| A doğru | %88 | %83 | %65 | %59 | %49 | %38 | %18 |
| B doğru | %85 | %83 | %64 | %41 | %65 | %30 | (2) |

- **Çok hızlı cevaplar (≤ 2 sn) gerçek bilgi.** B'de 53 tane, %85'i doğru. 8 hatanın 5'i artikel flaşı ya da artOb tahmini: das Supermarkt (06:00:50), das Flohmarkt, der Art (10.11 18:36:20), das Gymnastik (11.11 20:38:56), dem Kritik (20:38:49). Diğerleri: hoer sieht/zieht, ayir glatt/nass, yaz0 "eher" (eben yerine). Artikel flaşında 1 sn'de tahmin edip yanılma alışkanlığı sürüyor: B'de flaşta ≤ 2 sn'deki doğruluk %64, A'da %80.
- **Yavaş cevaplar (≥ 15 sn).** Doğruluk düşük (%29–42), çoğu gerçekten zorlanma. Gramer umform/ordnen bunun dışında: uzun ama doğru (4/4, 3/3). Dikte 6 sorunun 6'sı ≥ 15 sn ve yalnız 1'i doğru. Hatalar: das/dass, Sterne am Himmel, Fabrik/Autoteile, erfüllt/streiken. Dikte en zor biçim.
- **yaz0 yavaşladı.** Medyan A'da 4 sn, B'de 6 sn. Neden: B'de yaz0 sorusu zayıf öğelere gidiyor (S medyanı 2,3 → 0,85), doğruluk %54.

## 3. Sonuç panelinde kalma

Yöntem: Ana tur satırları (`hafizaYaz` → `cevapIsle`) ve gramer satırları Devam'a basıldığı ya da otomatik geçişin olduğu anda yazılıyor. `duy` ve `hoer` satırları ise cevap anında yazılıyor. `q.start` soru ekrana gelince başlıyor. Bu yüzden panel süresi ≈ (t_i − t_{i−1}) − sek_i (±1 sn yuvarlama). Hesap yalnız iki tarafı da Devam anında yazılan satır çiftlerinde yapıldı.

| panel (sn) | A medyan (p75) | B medyan (p75) |
|---|---|---|
| seçmeli / dokunma doğru | 0,5 (1) | 0 (1) |
| yazma doğru | 1 (1) | 0 (1) |
| gramer doğru | 1 (1) | 0,5 (1) |
| artikel doğru | 1 (1) | 0 (1) |
| yazma küçük hata (kilit 2,5 sn) | 2 (3) | 3 (3) |
| yazma yanlış + "düzeltti" | 9 (n=7) | **5 (7), n=26** |
| artikel yanlış | 1 (2) | 3,5 (4) |
| gramer yanlış | 5 (7) | 4 (4) |
| duy/hoer + sonraki panel (üst sınır) | 2 | 3 |
| tanıtım kartı (kartta geçen `sek`) | 2 | 5 (kilit 4 sn) |

- **Doğruda otomatik geçiş neredeyse hiç çalışmıyor.** B'deki 117 doğru cevabın panel dağılımı: 0 sn 67, 1 sn 40, 2 sn 5, 3 sn ve üstü 5. Tuna 2 sn'lik sayacı beklemeden Enter'a basıyor (masaüstünde çift Enter alışkanlığı). "Otomatik geçme bazen çok hızlı" şikâyeti büyük olasılıkla doğru cevabın panelinde okunacak bir şey olduğu durumlarla ilgili: yazım hoşgörüsü notu, artikel, "başka doğru". Bu durumlar 8.11'den beri sarı "küçük hata" oldu ve kilitleniyor.
- **Yanlış ve küçük hatada kilit belirleyici.** B'de 64 yanlış/küçük hata panelinin hepsi ≥ 2 sn: kilit gerçekten işliyor. A'da 271 panelin 93'ü < 2 sn idi, kilit o zaman yoktu. Ama panel ancak 3–4 sn sürüyor, yani Tuna kilit açılır açılmaz geçiyor. Gramer yanlışında panelde "senin / doğru / neden" satırları ve kural kutusu var; 4 sn'de okunacak gibi değil.
- **Düzeltme kutusu (`DUZELT_BICIM`).** B'de 29 yanlış yazmanın 29'unda "düzeltti", 0 "geç". A'da kutu 6.11'de geldi: 74 yanlışın 7'si "düzeltti", 67'si kutusuz. Kutu kabul görmüş ve paneli anlamlı biçimde uzatıyor (yazarak 5 sn).
- **Aynı turdaki tekrarın doğruluğu (`tekrar:1`).** A'da %88 (67/76), B'de %58 (15/26). İkisi karşılaştırılamaz: A'da tekrar sorusu bir alt basamaktan, çoğunlukla seçmeliydi. 6.11'den beri ipuçlu yaz0. Panel süresiyle tekrar doğruluğu arasında anlamlı bir ilişki çıkmadı (n küçük: < 4 sn %80, 4–7 sn %65, 8–14 sn %71).
- **Bilmiyorum.** A'da %1,2 (13/1089), B'de %1,5 (4/271):
  - 10.11 18:34:01 gram ceviri TeKaMoLo (4 sn)
  - 10.11 18:34:53 drüben (14 sn)
  - 11.11 20:34:17 vergleich nicht so … wie (10 sn)
  - 11.11 20:37:10 deutlich (32 sn)

  Hepsi düşünüp verilmiş cevaplar, baştan savma yok. `sayılmadı` yok. `dikkat` satırı B'de bir kez var (11.11 20:40 `cok-yanlis`, son 8 cevapta 5 yanlış). Bu, oturumun son turunda kurtarma ve kuyruk sorularının üst üste gelmesinden.

## 4. Notlama adaleti: son 4 gün

### 4a. İtirazlar (`öneri:`): hepsi gramerde

| zaman | alıştırma | Tuna | doğrusu | sistem → itiraz | hüküm |
|---|---|---|---|---|---|
| 8.11 06:06:10 (düzeltme öncesi) | adjektiv:82 ordnen z3 | ich finde den **roten** Rock schöner als den **blauen** | Ich finde den blauen Rock schöner als den roten. | falsch ("kelime sırası, groß/klein") → richtig | **İtiraz haklı, sistem hatası.** z3'te Türkçe yalnız "ipucu" düğmesiyle görünüyor, kartlarla kurulabilecek iki cümle de doğru. "groß/klein" kartın küçük harfli olmasından geliyor (düzeltildi: büyük/küçük harf → doğru, `gramer.js:570`). Bugünkü kod hâlâ **fast "kelime sırası"** veriyor (`s5_yeniden.js`). |
| 8.11 06:07:19 (düzeltme öncesi) | pronomen:29 ordnen | diese sind bequemer als meine alten Schuhe | Diese Schuhe sind bequemer als meine alten. | falsch → richtig | **İtiraz haklı.** Geçerli Almanca, anlam aynı (diese = zamir). Bugünkü kod: fast "kelime sırası". İçerik eksik: alternatif cevap yok. |
| 10.11 18:20:32 | reflexiv:40 umform | Ich habe mir **die die** Ausstellung angesehen | … mir die Ausstellung angesehen. | falsch → richtig | **Son not fazla cömert, ilk karar fazla sert.** Tek kelime iki kez yazılmış, açıkça klavye hatası; adil not **fast (yazım)**. `yakinCevap` harf mesafesi > 2 olduğu için "yazım hatasıydı" sunulmadı, yalnız "aslında doğru" çıktı. Bugünkü kod hâlâ falsch, üstelik yanlış etiketle ("artikel/çekim"). |
| 10.11 18:21:59 | adjektiv:78 umform z3 "→ Adjektiv" | Die Kinder, die laut sind, spielen im Hof | Die lauten Kinder spielen im Hof. | falsch → richtig | **İtiraz haksız.** Cümle dilbilgisi olarak doğru ama görev sıfat çekimiydi (lauten); yan cümleyle görevden kaçılmış. Sistemin `falsch` kararı doğruydu. Gece işinin "kabul" demesi bence cömert. |
| 10.11 18:36:02 | verbstellung:54 ceviri | Ich bin **Krank**, deshalb gehe ich heute nicht **den Sport**. | Ich bin heute krank, deshalb gehe ich nicht zum Sport. | falsch → richtig | **İtiraz haksız.** Hedef yapı (deshalb + devrik fiil) doğru, ama "den Sport" edat/hâl hatası (zum). Adil not yanlış ya da en fazla küçük hata, doğru değil. Bugünkü kodun verdiği etiket yanıltıcı: "fiil yeri" (fiil yeri doğruydu; sorun yalnız "heute"nin yerinin değişmesi). |
| 11.11 20:33:15 | verbstellung:77 ceviri | Am Wochenende **besuche** meine Familie mich. | … besucht mich meine Familie. (alternatif: besucht meine Familie mich) | falsch → fast ("yazım") | **Sonuç adil, etiket yanlış.** Devrik yapı doğru; tek hata özne–fiil uyumu (besuche/besucht). `cumlePruef`'teki uyum kuralı (`CEKIM`) yalnız sein/haben/werden/modal fiilleri kapsıyor, bu yüzden ilk karar falsch "artikel/çekim" oldu. `G.kelimeSinifi('besuche','besucht')` = `cekim`: bu, kuralın genellenmesi için yeterli. Etiket "yazım" değil "fiil çekimi (özne uyumu)" olmalı. |

Toplam: 2 haklı itiraz (sistem hatası), 2 kısmen haklı (adil not fast), 2 haksız itiraz (yine de doğru sayıldı). Ana turda (kelime soruları) B'de hiç itiraz yok.

Önceki dönemden (bağlam için):
- **Aphoteke, hlifst, schalfen, Montan:** bugünkü kod `fast` veriyor, düzeltme işe yaramış.
- **"Rufst du die Pizza Service an?" (3.11):** itirazla `richtig` olmuş; artikel hatası (der Service) var, adil not fast.
- **"zu meinem Bruder" (4.11):** hâlâ falsch "edat", doğru karar.

### 4b. Haksız sert görünenler

| zaman | satır | Tuna → doğrusu | sorun | yapan fonksiyon (tahmin) |
|---|---|---|---|---|
| 9.11 18:22:07 | gram fehler TeKaMoLo:109 "Ich fahre nach Hause morgen mit dem Bus." | hatalı kelime olarak **morgen** seçti → falsch "yanlış kelime seçildi" | Kelime sırası hatasında yer değiştiren iki öğeden biri seçildi. "morgen" da yanlış yerde (nach Hause'nin önünde olmalı). Hata olarak yalnız `hata` alanındaki kelimeler (nach Hause) kabul ediliyor. 1. adımda itiraz da yok. | `js/gramer.js` `fehlerIzin` (~597–603: hata kelimelerinin hepsi doğru cümlede de varsa yalnız onlar kabul ediliyor); `itirazTuru` fehler 1. adımda null döndürüyor |
| 10.11 18:20:04 | bos0 "bekommst du eine _____" | **die Mahnung** → fast "yazım, fazla artikel" (m3) | Artikel de cinsiyet de doğru, isim doğru yazılmış. Aynı günlerde yaz0'da "… _____" boşluğuna artikelsiz yazdığı için "artikel eksik" (fast) aldı (Umgang, Wärme, Botschaft, Verhalten). Tuna iki yönden de ceza alıyor. "yazım" etiketi de yanlış. | `js/grammatik.js:934` (`tip:'yazim'`, `fazla artikel`), `js/app.js:2496` |
| 10.11 18:36:16 | yaz0 abr, ipucu cümlesi "Viele Menschen _____ sich … Spinnen." | **fürcten** → falsch "edat" (m1) | Cümle ipucu boşluğa yalnız fiil yazılacakmış gibi görünüyor. "…" (edatın yeri) ile cevabın tüm kalıp (sich fürchten vor) olması gerektiği ekranda açık değil. Yazım hatası (h eksik) da var. Kurala göre doğru karar (edat yok → yanlış), ama biçim belirsiz. | `frageAbr` + `yazIpucu` (`trcumle`) |
| 10.11 18:38:14 ve 12.11 10:47:57 | kalip "sich wenden an", "sich fürchten vor" | "Wenn sie eine frage haben, bitte **melden sie sich bei** Amt." / "fürchten vor d" → falsch | Kalıp sorusunda Tuna Türkçe cümleyi çeviriyor ya da cümleyi tamamlamaya çalışıyor (A'da "wer kann ich wenden"). Toplam **1/7 doğru**. Bu bir biçim anlaşılmama sorunu. "sich melden bei" geçerli bir eş anlamlı kalıp ama eş anlamlı uyarısı (yazmadaki "≈ … da bu anlama geliyor") kalıp sorusunda yok. | `kalip` biçimi (`js/app.js`, Kern `kalip` seçimi `b 2'de %50`) |
| 10.11 18:23:04 | duy dikte | "Die Wahrheit ist **das** ich …" → falsch | 12 kelimelik dikte, tek hata das/dass (virgül hata değil). falsch katı ama dilbilgisi olarak savunulabilir. Hafızaya yazılmadığı için etkisi az. | `diktatPruef` → `G.cumleKontrol` |

### 4c. Fazla cömert görünenler

| zaman | satır | not |
|---|---|---|
| 10.11 18:20:32, 18:21:59, 18:36:02 | gramer itirazları | yukarıda: 1 tanesi fast olmalıydı, 2'si yanlış kalmalıydı |
| 10.11 18:35:28, 11.11 20:38:44 | yaz0 drüben ← **drüber** | Her ikisi `fast "yazım"`. drüber gerçek (konuşma dilinde) bir kelime (= darüber) ve drüben/drüber karışıklığı bir anlam karışıklığı (gece işi 8.11'de drinnen ↔ drüben ↔ drüber karışmasını not etmişti). `G.kelimeSinifi('drüber','drüben')` = `cekim` döndürüyor. Sözlükte (lex) drüber olmadığı için ayrışmıyor. Sınırda; `ayir` çiftine eklenebilir. |
| 8.11 06:06:46 | bos0 **Sonnenangebot** → Sonderangebot `fast yazım` | ≥ 10 harf + lev 2 kuralı. Sınırda ama kural gereği. |
| 10.11 18:36:39 | kök wenden **gewendet** → gewandt `richtig` | Doğru karar: iki biçim de geçerli (`p2Alt`). |

8.11 06:00–06:08 arasındaki etiket sorunları ("haben ; es" → "eksik kelime", "in der Türkei" → "kelime sırası") düzeltme öncesine ait. Bugünkü kod ikisini de etiketsiz `falsch` veriyor: kontrol ettim, düzelmiş.

## 5. Öneriler

### Ayar ve akış (dosya / fonksiyon / değer)

1. **Seviye atlamayı geri getir** (`js/kern.js`).
   - Sorun: Ardışık 2 kez ipucusuz-benzeri doğru `yaz0` cevabı (`ipucu:0`, yani başharf ipucuna ek ipucu istenmemiş) olsa bile sonraki soru `yaz0` kalıyor (`aday = S < 4 || lastG === 1 ? 'yaz0' : 'yaz'`, satır 329).
   - Öneri: `m.ds ≥ 1` ve `lastG ≥ 3` ise S < 4'te de `yaz` sorulsun. Ya da `zor` eşiği (`ZOR_DS` 2) yaz0 doğrularını da saysın.
   - Kanıt: B'de 17 turda 1 seviye+, 0 zor soru, ipucusuz doğru üretim 10. Tur sonunda sürekli "seviye atlayanlar · 0" görünüyor.
2. **Günlük hedefi tek ve biraz daha büyük yap** (`S.ayar4.turHedef` 4 → **5**; `DK_HEDEF` 20 → **12–15**, `js/app.js:5396`).
   - Kanıt: Hedef bir dur işareti (9.11 ve 10.11'de tam 4 turda bıraktı). Rutin oturmuş durumda: 26.10'dan beri boş geçen tek gün 2.11 (o da dondurucuyla seriye sayıldı). CLAUDE.md'deki 15.10 notu da "rutin oturunca artırılır" diyor. 5 tur ≈ 60 cevap ≈ 10–11 dk; dk hedefi de buna uyarsa Bugün ekranında iki çelişen çizgi kalmaz.
   - Tur boyu 12 kalsın: tur 2 dk, tur arası 1 sn, oturum içinde yorulma görülmüyor.
3. **Kilidi biçime göre ayarla** (`js/app.js:4083` `KILIT_MS`; `gramSonucGor` 3511–3518; `js/gramer.js:767`).
   - Gramer yanlışında **4 sn**: panelde "neden" ve kural kutusu var, şu an 4 sn'de geçiyor.
   - Seçmeli / artikel yanlışında 2,5 sn kalsın.
   - Yazma yanlışında kilit pratikte düzeltme kutusuyla zaten uzuyor (medyan 5 sn), dokunma.
   - Kanıt: B'de yanlış panelleri 2–4 sn; kilit açılınca geçiyor.
4. **Düzeltme kutusunu artikel küçük hatasına da genişlet** (`duzeltHTML` koşulu: `falsch` → `falsch || (fast && artikel etiketi)`).
   - Kanıt: 29/29 düzeltti, Tuna kutuyu kabul ediyor. Artikel en sık hata (die Vertrag, die Umgang, das Bedürfnis, die Recht, die Donner).
5. **Otomatik geçiş ayarı (`S.einst.otoGecis`, `OTO_VARSAYILAN` 2000) değişmesin.**
   - Masaüstünde Tuna doğruda zaten hemen Enter'a basıyor (%95'i 0–1 sn), yani sorun geçiş süresi değil.
   - Doğru ama notlu panellerde (yazım hoşgörüsü, "başka doğru", fazla artikel) `otoGec` hiç başlamasın, Enter beklensin. Şu an yalnız `r.bekle` (Dinle) ve gramer doğrusu için böyle.
6. **Tur sonu "dakika"yı aktif süreyle göster** (`js/app.js:5201`: `dk` yerine turun satırlarından `aktifSn` benzeri hesap). 10.11'deki `dk:12` 11 dk mola içeriyor.
7. **Sabah ilk turu ve akşam tekrarı.** `aksamDurum` 13:00 koşulu akşamcı düzende hiç tetiklenmiyor.
   - Bugün ekranında "sabah 1 tur → akşam tekrarı açılır" ipucu göster.
   - Ya da akşamcı günler için ters yön: akşam oturumundan ≥ 8 saat sonra ertesi sabah kısa "sabah tekrarı". Bu bir tasarım kararı, Tuna'ya sorulmalı.

### Notlama düzeltmeleri

8. **`js/gramer.js` `fehlerIzin`.** Saf kelime sırası hatasında (hata kelimelerinin hepsi doğru cümlede de varsa) soru ile doğru cümle arasındaki LCS dışında kalan, yeri değişen bütün öğeler kabul edilsin (TeKaMoLo:109 "morgen"). Ya da 1. adımda "aslında doğru" itirazı sunulsun.
9. **`js/gramer.js` `pruef` ordnen.**
   - Teil sırayı sınamıyorsa (`!siraSinar(u)`: adjektiv/bestimmt, pronomen/dieser) ve tek fark "kelime sırası" ise → `richtig`.
   - Ya da z ≥ 2 ordnen'de Türkçeyi (`u.tr`) baştan göster; ordnen'in hedefi anlam değil, sıra.
   - İçerik: pronomen:29'a "Diese sind bequemer als meine alten Schuhe." alternatifi.
10. **`yakinCevap` (gramer).** Tek fazladan ya da tekrarlanan kelime ("die die") için "yazım hatasıydı" (fast) sunulsun, harf mesafesi > 2 olsa bile. `cumlePruef` özne uyumu (`CEKIM`) her fiile genellensin (`G.kelimeSinifi === 'cekim'` ve aynı lemma) → `fast "fiil çekimi (özne uyumu)"` (verbstellung:77).
11. **Fazla artikel** (`js/grammatik.js:934`, `js/app.js:2496`). Doğru cinsiyetli fazla artikel → `richtig` + not ("boşlukta artikel zaten var"). En azından "yazım" etiketi düşsün. yaz0'daki "… _____" (artikel cevaba dahil) ile boşluktaki "eine _____" farkı soru metninde tek satırla açıklansın.
12. **Kalıp sorusu.**
    - Soru satırına "yalnız kalıbı yaz: sich … an + Akk" örneği eklensin.
    - Tam cümle cevabı gelirse içinden fiil + edat + sich çıkarılıp ona göre notlansın.
    - Eş anlamlı kalıp (sich melden bei) için yazmadaki "≈ … da bu anlama geliyor, tekrar dene" uyarısı gösterilsin.
    - Kanıt: 7 denemede 1 doğru.
13. **`ayir`'a drüben ~ drüber çiftini ekle.** Şu an drüber `fast yazım` alıyor. Gece işi drinnen / drüben / drüber karışmasını iki kez not etti.

### Tuna'ya alışkanlık önerileri (2–3)

- **Yanlışta kilit açılınca hemen geçme, doğrusunu bir kez sesli söyle.** Verilere göre yanlış sonrası panelde 3–4 sn kalıyorsun, gramer açıklaması bu sürede okunmaz. Düzeltme kutusunu her seferinde doldurman (29/29) çok iyi; aynısını gramer panelinde "neden" satırı için de yap.
- **Artikel flaşında 1 saniyede tahmin etme.** Son 4 günde 1–2 sn'lik artikel cevaplarının üçte biri yanlıştı (Supermarkt, Art, Gymnastik, Kritik). Emin değilsen sonek kuralını (‑ik, ‑markt …) bir an düşün ya da 0 / Bilmiyorum'a bas; yanlış tahmin kelimeyi "takılan" listesine iter.
- **Güne sabah tek bir turla başla, asıl çalışmayı akşam yap.** Sabah 2 dakikalık bir tur akşam tekrarını açıyor. Akşam tekrarında doğruluğun %72 idi (13/18, iki kez), uykudan önce aynı kelimeleri bir kez daha görmek en ucuz tekrar. Tanıtım kartında da kilit açılır açılmaz (4–5 sn) geçmek yerine kelimeyi artikeliyle bir cümle içinde sesli söyle.
