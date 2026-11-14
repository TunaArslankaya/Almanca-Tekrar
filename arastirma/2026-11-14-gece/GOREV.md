# Görev (14.11 gece, birinci tur) — 6 ajana birebir aynı görev

## Öğrenci ve şikâyeti
Tuna: Türk, Bremen'de, Almanca B1.2 (Goethe A2 var; B2 kursuna başladı), bilgisayarda çalışıyor. Uygulama: kendi Almanca tekrar PWA'sı (kelime / fiil / gramer). 14.11'de dediği (aynen):

> "uygulama hiç hoşuma gitmiyor, sikko sikko kelimeleri ezberliyorum gibime geliyor ve sürekli tekrar ediyorum bildiğim halde. Önce önemli kelimeleri mi öğrensem? Dinleme aşırı zor (dinleme alıştırması kalksın). Türkçeden gelen hatalar ne? TeKaMoLo ne, B2 olduğum hâlde onda hata yapayım? Sürekli aynı yerde dönüp duruyorum."

Karar verilmiş olanlar (sorgulama, yalnız nasıl yapılacağını öner): dinleme alıştırmaları (turdaki ses yuvası duy / hoer, Dinleme modu) kalkacak.

## Kaynaklar (SALT OKUNUR: hiçbir dosyayı değiştirme, git komutu çalıştırma)
- Repo kopyası: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/inceleme2`
- ÖNCE `CLAUDE.md`'yi baştan sona oku (mimari, Kern hafızası, merdiven, bm / pk kapıları, log biçimi, 8.11 ve 12.11 değişiklikleri). `YAPILANLAR.md` ve `arastirma/2026-11-12-analiz/` (12.11 analizleri) de faydalı.
- Not: kopyadaki kod, yayındaki sürümden biraz yeni (12.11'deki tekrar sırası / turdaki gramer takvimi değişiklikleri içinde, henüz yayında değil). Log'lar yayındaki sürümden (8.11 sürümü) geliyor.
- Log: `log/log.csv` (`;` ayırıcı, tırnaklı alanlar olabilir → Python csv modülü), hafıza: `log/zustand.json`. Bütün geçmişe bak, ağırlık son 2–3 hafta.
- İçerik: `quellen/*.txt` (kelime listeleri, cümleler; `woerter.txt`, `nomen*.txt`, `verben.txt`), `quellen/grammatik/*.txt` (48 gramer konusu), build çıktısı `daten/*.js` (kayıtlarda `frek`, `sik`, Goethe seviyesi `tier` vb.).
- Uygulamayı kullanarak da bakabilirsin: Playwright + Chromium kurulu (`require('playwright')`, `chromium.launch()`; `playwright install` ÇALIŞTIRMA); `file://<kopya>/index.html`; ortak sürücü `tests/surucu.js` (gerçek kaydı yükleme, `window.__tekrar.starte`, `__tekrar.saat` zaman kaydırma). Betiklerin ve çıktıların: kendi klasörün (aşağıda).

## Soruların (hepsini cevapla, veriyle)
1. **"Sikko kelimeler":** Tuna'ya hangi kelimeler öğretiliyor / tekrar ettiriliyor? Bunlar B1–B2'de ne kadar önemli (sıklık, Goethe B1 listesi, günlük kullanım)? Yeni kelime sırası nasıl belirleniyor (`frek`, `sik`, ünite, yarım öğeler…)? Önemsiz / nadir kelimeler ne oranda? Önemli kelimeler önce gelsin diye ne değişmeli; zaten öğrenilmiş önemsiz kelimelerle ne yapılmalı (askıya alma, ağırlığı düşürme)?
2. **"Bildiğim hâlde sürekli tekrar":** Hangi öğeler en çok soruluyor ve Tuna onları ne oranda doğru biliyor? Neden tekrar geliyor (vade, bm / pk kapısı, artikel hafızası ayrı, ısınma, akşam, kuyruk, gölge…)? Bilinen öğeyi sistem neden "bilinmiyor" sayıyor?
3. **"Sürekli aynı yerde dönüp duruyorum":** Döngüleri bul: aynı öğe / aynı cümle / aynı gramer konusu / aynı biçim (ör. hep ipuçlu yaz0) / seviye ilerlemiyor / vade yükü hiç azalmıyor. Hangi mekanizma döngüyü yaratıyor (kod yolunu göster: dosya + fonksiyon)?
4. **Gramer konuları:** Turdaki ve Gramer bölümündeki konular Tuna'nın seviyesine (B1.2 → B2) uygun mu? "Türkçeden gelen hatalar", "TeKaMoLo" gibi temel konular neden geliyor, Tuna bunlarda gerçekten hata yapıyor mu (log)? Hangi konular kalmalı / çıkmalı / öne alınmalı (B2 kursu konuları: Konjunktiv II, Passiv, Relativsätze, Nominalisierung, zweiteilige Konnektoren, Partizipien …)?
5. **Dinleme:** turdan ve uygulamadan nasıl temiz kaldırılır (hangi yerler: Kern ses yuvası, app.js kancaları, Bugün / sprint blokları, Ayarlar, testler); kalırsa yalnız ne kalmalı (ör. doğru cevaptan sonra kelimenin seslendirilmesi bir alıştırma değil)?
6. **Genel deneyim:** Tuna'nın "hiç hoşuma gitmiyor" demesine en çok ne katkı yapıyor (tur yapısı, soru türleri, ipuçları, paneller, zorluk, motivasyon)? Uygulamayı ona göre daha etkili ve keyifli yapacak en önemli 5–10 değişiklik.

## Çıktı
- Raporunu `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/gece1/<adın>.md` dosyasına Türkçe yaz. Betiklerin / ekran görüntülerin: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/gece1/<adın>/`.
- Başta 10 satırlık özet. Her bulgu için: kanıt (sayı, log satırı, kod yolu dosya:fonksiyon), etkisi, somut öneri (dosya + fonksiyon + ne değişmeli, önerilen değer). Öncelik sırasıyla.
- Yalnız doğruladığını yaz; tahminse "doğrulanmadı" de.
- Son mesajında yalnız: 10 satırlık özet + öncelik sırasıyla en önemli 8 öneri (tek satır).
