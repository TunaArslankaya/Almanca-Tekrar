# Kern düzeltmesi 12.11: seviye atlama ve vade yükü

Dal: `worktree-agent-a8e176e146f6923b5` (push edilmedi). Değişen dosyalar: `js/kern.js`, `js/app.js` (yalnız ayır ve gramer penceresi kapısı), `tests/test_kern.js`, `tests/sim_akis.js`, build çıktısı (`index.html`, `sw.js`: `?v=` sürüm özeti).

## Değişiklikler (js/kern.js)

1. **Vadeli sıra dönüşümü** (`ZAYIF_PAY = 3`, `gucluSira`)
   - Zayıf vadeliler (R < 0,8) turdaki vadeli anlam yuvalarının en çok 1/3'ünü alır. 1., 4., 7. … vadeli yuvada zayıf önce gelir (`vadSira`). Öbür yuvalarda güçlüler önce, R azalan sırayla (`gucluSira`).
   - Havuzlardan biri boşsa öbürü kullanılır.
   - `oturumIsle` her vadeli anlam seçimini geçmişe `vk: 'z' | 'g'` olarak yazar. Kurtarma, ısınma ve kuyruk yuvaları sayılmaz.
2. **Isınma ve momentumda güçlü öğe** (`GUCLU`, `gucluMu`: S ≥ 7, bm ≥ 2, R ≥ 0,9)
   - Böyle bir öğe için ne b − 1 ne de `ipuclu` uygulanır. Normal merdiven geçerli.
   - Zor soru kapısı da geçerli: `sec`, ısınma ve momentum çağrısına `zorOk` verir. ZOR_TUR sınırı aynen duruyor.
   - Zayıf öğede davranış eskisi gibi (bir basamak aşağı, yaz0).
3. **Birikmede sabit yükü kısma**
   - Ölçü: `yukKisMi(kota)` = birikme > kap. Burada birikme, `kota()`'nın dünden kalan vadeli sayısı (anlam ya da artikel); kap = günlük kapasite × wRet.
   - `sec` bu durumu `o.yukKis` olarak işaretler.
   - Birikme varken turda 1 gramer ve 1 ses sorusu gelir. Ses duy / hoer arasında gün gün dönüşümlü. Uygulama birikmede ayır sorusunu koymaz.
   - Birikmede bu tek yuva adım 5 (gramer) ya da 4 (ses) ile boy − 2 arasında açık kalır, böylece parti ve mini sorular adımı 3'ten 6'ya itse de kaybolmaz. Simülasyonda 3 tur/gün senaryosunda, sabit pencereyle ses yuvası hiç gelmiyordu.
   - Bu iş ortak `yuvaAcik` ile yapılıyor. Uygulamanın `gramVarMi` fonksiyonu pencereyi `Kern.gramPencere`'den alır.
   - Birikme yokken davranış bugünkü gibi (testler değişmedi).
4. **Zayıf çekirdek** (`cekirdekMi`: S < 7, R < 0,8, lapses ≥ 3 ya da D ≥ 9)
   - Vadeli ya da kurtarma sorusundan önce mevcut `yenidenTanit` kartı gösterilir.
   - Sınırlar: günde en çok `RT_GUN = 5` öğe, öğe başına günde bir kez. Gün işareti öğede tutulur (`it.rtGun`). R < 0,35 kuralı ayrı ve sınırsız.
   - Kartın hemen ardından gelen günün ilk kalıcı cevabı, büyüme ofsetini `RT_OFS = 1` kadar fazla alır (`uygula`). Kartı yeni görmüş birinin doğrusu S'yi daha az büyütür. bm zaten ipuçlu biçimde değişmiyor.
   - Turda aynı öğeye üst üste üçüncü yaz0 gelmez. Son iki sorusu yaz0 olan öğede deneme 3 önce yeniden tanıtım kartını gösterir. Ardından taze cümle varsa bos0, yoksa seçmeli gelir. `kuyrukSec` `yenidenTanit` bilgisini taşır.
5. **B3 yolu** (`bicimSec` b = 3): bm ≥ 2 ve pk ≥ 1 ise ipucusuz `bos` S ≥ 7'den başlar (önceden S ≥ 10).

**İlke değişmedi:** bm yine yalnız ipucusuz, tam doğru ve itirazsız cevapla yükselir (`uygula` aynı). Testte kontrol edildi: güçlü öğede bos yazım hatası (fast) bm'yi yükseltmiyor.

**Yeni API:** `GUCLU`, `gucluMu`, `ZAYIF_PAY`, `yukKisMi`, `yuvaAcik`, `gramPencere`, `RT_GUN`, `RT_OFS`, `cekirdekMi`.

**js/app.js:**
- `ayirKoy` artık `!ot.yukKis` koşuluyla çalışıyor.
- `gramVarMi` pencereyi `Kern.gramPencere`'den alıyor (Kern'de yoksa eski hesap kullanılıyor).

## Simülasyon (gerçek 12.11 hafızası, 14 gün, 6 tohum)

Betik: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/kern12/sim_tur.js`.
- Gerçek `Kern.sec` → `notVer` → `uygula` → `oturumIsle` zinciri tam turlarla çalışıyor. Gramer, ses, ayır, artikel, kuyruk, metin (günün ilki dikte, kalanların %25'i uygun paragraf buluyor; P2 gözlemi), kurtarma, ısınma, momentum ve yeniden tanıtım dahil.
- Yeni kelime yükü sabit tutuldu.
- Başarı modeli raporun kalibrasyonu (σ(logit R + δ biçim)).
- Eski kod: `kern_eski.js` (HEAD).

| senaryo | bm artışı | ipucusuz pay | ipuçlu pay | 15. gün vadeli anlam (başlangıç 166) | vadeli yuvada zayıf payı | yeniden tanıtım | turda üst üste 3. yaz0 |
|---|---|---|---|---|---|---|---|
| 4 tur/gün (48 cevap, P2'ye en yakın), önce | 10,7 | %13 | %86 | 238 | %100 | 0 | 2,2 |
| 4 tur/gün, sonra | **59,7** | **%34** | %65 | **184** | %42 | 70 | 0 |
| 5 tur/gün (60 cevap), önce | 12,5 | %11 | %86 | 215 | %100 | 0 | 2,5 |
| 5 tur/gün, sonra | **68,2** | **%32** | %67 | **157** | %41 | 71 | 0 |
| 3 tur/gün (36 cevap), önce | 5,2 | %11 | %89 | 256 | %100 | 0 | 1 |
| 3 tur/gün, sonra | **43,5** | **%41** | %59 | **212** | %43 | 68 | 0 |

**Ablasyon** (5 tur/gün, bm artışı / 15. gün vadeli):

| kapatılan | bm artışı | vadeli |
|---|---|---|
| hepsi açık | 67–68 | 147–157 |
| sıra dönüşümü (ZAYIF_PAY 0, eski sıra) | 45,7 | 174 |
| ısınma kuralı | 62,7 | 143 |
| birikmede yük kısma | 57,7 | 179 |
| zayıf çekirdek kartı | 67 | 154 |

Ablasyon ilk pencere düzeltmesinden önce ölçüldü; eğilim aynı.

**Kaynaklar:** bm artışının çoğu vadeli yuvalardan (~45), kalanı zor sorudan (~9), metinden (~8), ısınmadan (~5) ve momentumdan (~2) geliyor.

**Hedefle karşılaştırma:** Hedef raporun S6 satırıydı (bm ~54, vadeli ~191). 4 tur/gün sonucu (59,7 / 184) buna yakın.

**Raporun kendi betiği** (`sim_rapor.js`, anlam bütçesi 22/gün, kendi sırası): yeni Kern ile S0 satırı 1,7 → 14,8 bm (ısınma ve B3 kuralları; raporun S1'iyle aynı).

**`tests/sim_akis.js`** (iyimser model; 3 tohum, K = 36):
- Yeni çıktı satırı: bm artışı, ipucusuz / ipuçlu pay, yeniden tanıtım sayısı, 15. gün vadeli.
- Gramer yuvası artık açık, `GRAM=0` ile kapatılabiliyor.

| | bm artışı | ipucusuz | ipuçlu | 15. gün vadeli |
|---|---|---|---|---|
| önce | 99 | %34 | %52 | 172 |
| sonra | 137 | %47 | %40 | 151 |

Ölçütler iki durumda da geçti.

## Testler (hepsi geçti)

- `python3 tools/build.py`: 0. Uyarılar eski: gramer anahtarı uyarıları.
- `test_grammatik`: geçti.
- `test_kern`: 751. Önceden 707'ydi; 44 yeni test eklendi. Eski testlerin hiçbiri değişmedi.
- `test_goc`: 76.
- `test_dinle`: 32.
- `test_gramer`: 71.
- `e2e_smoke`, `e2e_aksam`, `e2e_soru`, `e2e_not`, `e2e_fiil_artikel`, `e2e_dinle`, `e2e_ek`: geçti.
- `sim_akis`: geçti.

## Notlar

- **CLAUDE.md güncellenmeli** (bu ajanın alanı dışında). Güncellenecek yerler:
  - "Zor soru … ısınma / momentum'da yok": artık güçlü öğede var.
  - "Vadeliler: R < 0,8 olanlar en düşük R'den önce": artık en çok 1/3 dönüşümlü.
  - Ses yuvası ve ayır birikmede kısılıyor.
  - B3 bos eşiği değişti.
  - Zayıf çekirdek için yeniden tanıtım eklendi (RT_GUN 5, RT_OFS).
  - Deneme 3'te bos0 / sec geliyor.
- **`it.rtGun` `sec` içinde işaretleniyor**, yani seçim anında; soru üretilemezse işaret yine kalır. Bunun etkisi küçük: o öğe o gün yeniden kart almaz ve ilk cevabı biraz daha az büyür.
- **Birikme ölçüsü** `kota().birikme > kota().kap`. Gerçek kayıtta (birikme ~162, kap ~80) koşul açık. Simülasyonda 14 günün hepsinde açık kaldı.
