# Görev — 6 ajana birebir aynı görev (bağımsız, paralel)

## Öğrenci ve şikâyeti
Tuna: Türk, Bremen'de, Almanca B1.2 (Goethe A2 var; B2 kursuna başladı), bilgisayarda çalışıyor. Uygulama: kendi Almanca tekrar PWA'sı (kelime / fiil / gramer). Tuna'nın şikâyeti (aynen): "uygulama hiç hoşuma gitmiyor, sikko sikko kelimeleri ezberliyorum gibime geliyor ve sürekli tekrar ediyorum bildiğim halde. Önce önemli kelimeleri mi öğrensem? Dinleme aşırı zor. Türkçeden gelen hatalar ne? TeKaMoLo ne, B2 olduğum hâlde onda hata yapayım? **Sürekli aynı yerde dönüp duruyorum.**"

## Görevin
Uygulamayı ve Tuna'nın loglarını bağımsız olarak incele ve şu soruya cevap ver: **Uygulamanın şu anki hâli Tuna'nın şikâyetlerini çözüyor mu? Özellikle "sürekli aynı yerde dönüp duruyorum" hissi bu sürümde de oluşur mu?** Döngüleri, tekrar hissini, önemsiz kelime yükünü, seviye ilerlemesini, gramer konularının seviyesini ve genel deneyimi değerlendir; kalan sorunları ve yeni ortaya çıkmış sorunları bul.

## Kaynaklar (SALT OKUNUR: hiçbir dosyayı değiştirme, git komutu çalıştırma)
- Repo kopyası (yayındaki sürüm): `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/inceleme3`
- ÖNCE `CLAUDE.md`'yi baştan sona oku (mimari, Kern hafızası, merdiven, log biçimi).
- Log: `log/log.csv` (`;`, tırnaklı alanlar → Python csv modülü), hafıza `log/zustand.json`. Log'lar önceki sürümlerden geliyor; şu anki sürümün davranışını görmek için uygulamayı gerçek kayıtla çalıştır.
- Uygulamayı kullan: Playwright + Chromium kurulu (`require('playwright')`, `chromium.launch()`; `playwright install` ÇALIŞTIRMA); `file://<kopya>/index.html`; ortak sürücü `tests/surucu.js` (gerçek kaydı yükleme `zustandOku`, `window.__tekrar.starte`, `__tekrar.saat` zaman kaydırma, `D.adim` ile cevap). Gerçek kayıtla birkaç gün (zaman kaydırarak), günde 3–6 tur oyna; Tuna'nın gerçek doğruluk oranlarını (log'dan) kullanarak cevap ver. Not: başsız Chromium + file:// sayfa yenilemede (reload) localStorage yazımlarını kaybedebiliyor — günler arası geçişte reload kullanma, uygulama içi gezinti ve `__tekrar.saat` / sürücü yardımcılarıyla ilerle.
- Simülasyon betikleri: `tests/sim_akis.js` ve `js/kern.js` doğrudan node'da da kullanılabilir.
- Kendi betiklerin / ekran görüntülerin: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/sabah/<adın>/`.

## Çıktı
- Rapor: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/sabah/<adın>.md`, Türkçe. Başta 10 satırlık özet ve tek cümlelik hüküm ("şikâyetler çözülmüş / kısmen / çözülmemiş").
- Her bulgu: kanıt (sayı, oynattığın turun adımları, log satırı, kod yolu dosya:fonksiyon), etkisi, önem (kritik / yüksek / orta / düşük), somut öneri.
- Yalnız doğruladığını yaz; tahminse "doğrulanmadı" de.
- Son mesajında yalnız: hüküm + 10 satırlık özet + önem sırasıyla en önemli 8 bulgu (tek satır).
