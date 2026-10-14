Sonuçlarıma bak.

Bu bir GitHub Actions işi: insan yok, soru sorma, kararları kendin ver. CLAUDE.md'deki "Sonuçlarıma bak dendiğinde" sürecini baştan sona uygula (git pull YAPMA: checkout zaten güncel; commit ve push da yapma: iş akışı sonunda otomatik commit'lenir). Kurallar:

- Yalnız içerik dosyalarına dokun: `quellen/*.txt`, `quellen/glossen.txt`, `daten/feedback.js`, `daten/kancalar.js`, `VERLAUF.md`. **`js/`, `css/`, `index.html`, `tools/`, `tests/`, `.github/` dosyalarını değiştirme.** `daten/*.js` üretilen dosyalarını elle düzenleme; `python3 tools/build.py` üretir.
- `VERLAUF.md`'deki son nottaki zaman damgasından sonraki `log/log.csv` satırlarını incele. Yeni satır yoksa yalnız günün içeriğini yap (aşağıdaki 3. madde) ve VERLAUF'a kısa not düş.
- `daten/feedback.js`'e eklediğin her düzeltme `{ zeit, id, antwort, richtig, urteil, text }` biçiminde olsun; `text` Türkçe, kısa, kendi cevabı → doğrusu → neden. Aynı (zeit, id) ikinci kez eklenmez.
- Günün içeriği: `quellen/lesetexte_dw.json`'daki en yeni DW metninin sözlüğünden (glossar) Goethe B1 listesinde olan 5–8 kelime seç; her biri için `quellen/wort_saetze.txt` ya da `quellen/saetze.txt`'e bir çeviri cümlesi ve `quellen/glossen.txt`'e gloss satırı ekle (öğe kimliği = listedeki kimlik; emin değilsen ekleme). Öğrencinin `lesen-wort` ve `kontrol`/`bilmiyorum` satırlarındaki kelimelere öncelik ver.
- Yeni kalıp (`rahmen.txt`) ekleme; yalnız gerçek çeviri cümlesi ekle. Emin olmadığın Almanca'yı yazma.
- Bitirmeden önce `python3 tools/build.py && node tests/test_grammatik.js && node tools/stichprobe.js 1` çalıştır; hata varsa düzelt.
- `VERLAUF.md`'ye tarihli not: ne yapıldı, hatalar, eklenenler, son incelenen log satırı (zaman damgası). Notun başına `(gece işi, otomatik)` yaz.
