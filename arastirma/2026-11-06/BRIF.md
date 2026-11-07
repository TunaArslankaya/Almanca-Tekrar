# Araştırma brifi (6.11.2026) — 10 ajan

## Öğrenci: Tuna
- Türk, Bremen. Goethe A2 var. Dil kursu + Uni Bremen Vorbereitungsstudium. 5.11'de B1 kur sınavına (Einstufung) girdi: geçemedi, B1.2'de kalıyor.
  Sınavda Hören iyi, Lesen iyi, Schriftlich (yazılı) çok iyi, **Sprechen kötü**. Öğretmen: "dilini geliştir, daha çok kelime ezberle".
- Kendi teşhisi (aynen): "gramerde o kadar sıkıntım yokmuş, sıkıntı kelime ve fiil hazinemde ve konuşmamda"; "uygulama bana yardım etmiyor";
  "şıklar çok basit, sadece şıklardan bile sorular çözülebiliyor"; "zamanla kelimeleri değil cevabı ezberliyorum"; "telaffuz (Aussprache) önemli,
  konuşmanın yazıya dökülmüş hâlini kontrol etmek çok faydalı değil"; "dinleme önemli, okuma o kadar değil".
- Günde ~50–180 cevap veriyor (çoğu sabah 05:30–09:00 ya da akşam), turlar kısa (12 cevap, çoğu 1–4 dk). Bilgisayarda kullanıyor (Chrome), telefon değil.
- İletişim: Türkçe, direkt, kısa.

## Uygulama (repo: /home/user/Almanca-Tekrar — SALT OKUNUR, hiçbir dosyayı değiştirme, git komutu çalıştırma)
- PWA, GitHub Pages. CLAUDE.md (kurallar, log biçimi, mimari) ve TASARIM.md'yi oku. Ana dosyalar: js/app.js (arayüz, soru türleri, `optionen` seçmeli şık üretimi ~541. satır),
  js/kern.js (FSRS hafıza, basamak merdiveni: B1 seçmeli → B2 yazma → B3 cümlede boşluk → B4 tam cümle; seçim `Kern.sec`), js/grammatik.js (kontrol), js/gramer.js (gramer),
  bölümler: Konuşma (shadowing, Sprechen Teil 1–3, kayıt tarayıcıda), Okuma (DW Top-Thema metinleri + mp3 ses `quellen/lesetexte_dw.json`, Klexikon), Prüfung, Cümle atölyesi.
- Kelime havuzu: Goethe B1 Wortliste (~2.600) + Netzwerk neu ünite listeleri; Tuna şu an ~270 öğe çalışıyor, günde ~6 yeni.
- Veri: `log/log.csv` (bütün cevaplar; sütunlar ve notiz etiketleri CLAUDE.md'de), `log/zustand.json` (hafıza durumu: items[id].m / .art, S, due, lapses, bm…).
- Bilinen gözlemler (6.11, son 14 gün, 1038 kelime cevabı): %40 seçmeli (%93 doğru), %16 der/die/das flaşı; yazmada doğruluk %57, cümlede boşlukta %51,
  tam cümle 14 günde 1 kez. Aynı boşluklu cümle 8 kereye kadar tekrar görülmüş. Konuşma bölümü hiç kullanılmamış (log'da 0 `sprechen` satırı).
  Seçmeli çeldiriciler sözlükten neredeyse rastgele (aynı konu varsa 2 tane), anlamca uzak → eleme ile çözülüyor. 21 isimde artikel ≥ 4 kez yanlış.

## Genel kurallar
- Kaynakları ad + bağlantıyla ver (bilimsel çalışma / meta-analiz / ciddi dil öğretimi kaynağı tercih; blog yalnız destek). Emin olmadığını "emin değilim" diye işaretle.
- Web araştırması için elindeki web arama / sayfa okuma araçlarını kullan.
- Raporunu Türkçe yaz ve şu dosyaya kaydet: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/arastirma/<senin-adın>.md`
  (adın görevinde verildi). Son mesajın: raporun özeti (≤ 600 kelime) + dosya yolu.
- Uygulama önerileri somut olsun: ne, neden (kanıt / veri), hangi dosya / fonksiyon, büyüklük (küçük / orta / büyük), öncelik. Tuna'nın kendi yapacakları (uygulama dışı) ayrı başlıkta.
