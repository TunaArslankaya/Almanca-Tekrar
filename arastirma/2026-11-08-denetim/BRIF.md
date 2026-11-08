# İnceleme brifi (7.11.2026) — 10 inceleme ajanı

## Öğrenci ve uygulama
- Tuna: Türk, Bremen'de, Almanca B1.2 (Goethe A2 var, B1 kur sınavında Sprechen yüzünden B1.2'de kaldı). Bilgisayarda çalışıyor (masaüstü Chrome), bazen telefonda.
- Uygulama: yerel HTML PWA, Almanca kelime / fiil / gramer tekrarı. GitHub Pages'te yayında. Cevaplar `log/log.csv`'ye, ilerleme `log/zustand.json`'a yazılır.
- Repo kopyası (SALT OKUNUR, dosya değiştirme, git komutu çalıştırma): `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/inceleme`
- ÖNCE `CLAUDE.md`'yi baştan sona oku (mimari, log biçimi, bütün kurallar). Sonra `YAPILANLAR.md` (son 4 haftada ne değişti). `TASARIM.md` gerekçeler.
- Kural seti (CLAUDE.md "Kurallar"): her isim artikelli; notu sistem verir; doğruda kendiliğinden geçer, yanlışta Devam; anlam soruları yardımsız; kelimeler Goethe B1 listesinden; vb. Bunlara aykırılık da bulgudur.

## KAPSAM DIŞI (kaldırılıyor, inceleme)
Konuşma tamamen kaldırılıyor (Tuna ayrı uygulamada çalışıyor): `js/konus.js`'in konuşma kısımları, Diğer → Konuşma bölümü (Kalıplar, Söyle, Shadowing, Teil 1/2/3, İlerleme), turdaki "söyle" sorusu, Bugün "2 dk konuş" kartı, mikrofon / kayıt, Prüfung → Sprechen. Bunlarla ilgili bulgu YAZMA.
"Duy-seç" (hoer: minimal çift dinleme) dinleme olarak KALIYOR: onu incele.

## Test araçları
- Playwright + Chromium kurulu: `require('playwright')` her dizinden çalışır, `chromium.launch()` seçeneksiz. `playwright install` ÇALIŞTIRMA.
- Uygulama `file://<repo>/index.html` ile açılır. Ortak sürücü `tests/surucu.js` (sayfa açma, `window.__tekrar.starte(mod, boy)`, `__tekrar.saat(ms)` zaman kaydırma, `__tekrar.Kern`, gerçek kaydı yükleme `zustandOku`). Örnek: `tests/e2e_smoke.js`, `tests/e2e_ui.js`, `tools/film.js` (adım adım ekran görüntüsü).
- Gerçek ilerlemeyle açmak için `log/zustand.json`'ı localStorage'a yükle (sürücüde nasıl yapıldığına bak). GitHub'a ağ isteği yapılmasın / başarısız olsun, sorun değil.
- Kendi betiklerini ve ekran görüntülerini KENDİ klasörüne yaz: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/<adın>/` (repo kopyasına yazma).
- Birim testleri: `node tests/test_kern.js`, `node tests/test_grammatik.js`, `node tests/test_goc.js`, `node tests/test_dinle.js` (repo kopyasında çalıştırılabilir; dosya üretmezler).

## Çıktı
Bulgularını `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/<adın>.md` dosyasına yaz, Türkçe. Her bulgu:

```
### <kısa başlık>
- önem: kritik | yüksek | orta | düşük
- tür: hata | haksız not | içerik hatası | arayüz | kural ihlali | performans | diğer
- yer: dosya:satır ve/veya ekran / bölüm
- kanıt: adım adım yeniden üretme ya da log satırı (zaman damgası + satır) ya da kod yolu
- beklenen / gerçek:
- önerilen düzeltme: (somut; hangi fonksiyon, ne değişmeli)
```

Kurallar:
- Yalnız gerçekten doğruladığın şeyi yaz (yeniden ürettin, log'da gördün ya da kod yolunu baştan sona izledin). Tahmin varsa "doğrulanmadı" yaz.
- Önemli olanı önce yaz. Zevk meselesi / küçük stil tercihi yazma. Tuna'nın gözünden "bu sinir bozucu / yanlış / öğrenmeye zarar" olanı öne çıkar.
- Dosyanın en başına 5–10 satırlık özet koy.
- Son mesajında (bana dönen rapor) yalnız: bulgu sayısı (önem başına) ve en önemli 5 bulgunun tek satırlık başlığı. Ayrıntı dosyada.
