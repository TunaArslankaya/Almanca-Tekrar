# Düzeltme brifi (7.11.2026) — 6 düzeltme ajanı

10 inceleme ajanı uygulamayı inceledi. Bulgu dosyaları: `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/` → `kullan-1.md … kullan-4.md`, `log-1.md … log-3.md`, `kod-1.md … kod-3.md` (yanlarındaki klasörlerde yeniden üretme betikleri var). Aynı sorunu birden çok ajan yazmış olabilir: tekilleştir.

ÖNEMLİ: incelemeler bir önceki sürüm üzerindeydi; o zamandan beri konuşma kaldırıldı (`js/konus.js` silindi, duy-seç `js/dinle.js`'e taşındı, commit 056ee5e). Satır numaraları kaymış olabilir; fonksiyon adlarıyla bul. Konuşma / söyle / Sprechen bulgularını atla.

## Çalışma
- Sana verilen worktree'de çalış (git worktree; repo kopyası). ÖNCE `CLAUDE.md`'yi oku (kurallar ve log biçimi bağlayıcı).
- SADECE kendi alanındaki bulguları düzelt (alan listesi görev metninde). Alanın dışındaki dosyalara dokunma; başka alanın işi gerekiyorsa yapma, raporunda "başka alana" diye not et. Bu, 6 ajanın değişikliklerinin çakışmadan birleşmesi için şart.
- Her bulguyu önce DOĞRULA (yeniden üret). Doğrulanmayanı düzeltme, raporda "doğrulanmadı" yaz.
- Düzeltme en küçük doğru değişiklik olsun; mevcut davranışın geri kalanını bozma. Her düzelttiğin kontrol / mantık hatası için ilgili birim testine test ekle (`tests/test_grammatik.js`, `tests/test_kern.js`, `tests/test_dinle.js` ya da uygun e2e).
- Notlama ilkesi (Tuna'nın istekleri, bağlayıcı):
  - Doğru kelimenin yazım hatası / yanlış eki / ünlü değişimi = küçük hata (fast), "kelimeyi bilmiyorsun" değil. Sözlükte BAŞKA bir kelime olan yazım (legen/liegen, Stadt/Staat, verschieben/verschreiben) = yanlış.
  - ae/oe/ue/ss her yerde tam doğru (CLAUDE.md: "ae/oe/ue/ss tam doğru"). Umlaut'u tamamen düşürmek (Prufung) = küçük hata `umlaut`.
  - Noktalama (virgül, nokta) gramer hatası değil; yalnız virgül eksikse doğru (gerekirse not olarak gösterilebilir), "kaynaştırma" değil.
  - Geçerli başka diziliş / geçerli alternatif çeviri = doğru.
  - Artikel hatası artikel hatası olarak notlanır ve log'a geçer (başka hata ile birlikte olsa da). Öbek içinde artikel sorusunda (artOb) cinsiyet hatası (dişil isme der) artikel hatasıdır, "hâl" değil.
  - "Bedava seviye yok": ipuçlu cevap seviye (bm) atlatmaz; itiraz / yazım hatası / yavaş cevap seviye atlatmaz.
  - Fiil + edat yazmada hâl notasyonu (A/D) ZORUNLU DEĞİL (Tuna'nın 14.10 kararı) — bunu bulgu sayma, değiştirme.
  - İtiraz: soru başına tek ("yazım hatasıydı" / "aslında doğru"), ilk karar log'da `öneri:`; "Bilmiyorum"dan sonra itiraz yok.
- `log/` klasörüne ASLA dokunma.
- Bitince çalıştır (worktree'de): `python3 tools/build.py && node tests/test_grammatik.js && node tests/test_kern.js && node tests/test_goc.js && node tests/test_dinle.js && node tools/stichprobe.js 1`; alanınla ilgili e2e'ler (`tests/e2e_smoke.js`, `e2e_ui.js`, `e2e_aksam.js`, `e2e_cumle.js`, `e2e_fiil_artikel.js`, `e2e_dinle.js`, `e2e_ek.js`; Playwright + Chromium kurulu, `playwright install` çalıştırma). Hepsi geçmeli. (`e2e_ui`'de "güven kartı ikinci açılışta" ~8'de 1 zamanlama yüzünden düşebilir: bir kez yeniden çalıştır.)
- Commit (Türkçe mesaj, model adı yok) — sonuna tam olarak:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01RHz3z9TKmpqz495aiBfEqT
  ```
  `git add -A -- . ':!log'`. PUSH ETME.
- Raporunu `/tmp/claude-0/-home-user-Almanca-Tekrar/4dea1611-5df9-572d-a6bf-80f842a1b634/scratchpad/bulgular/duzeltme-<adın>.md`'ye yaz: düzeltilen her bulgu (hangi dosyalar / hangi ajanların bulgusu / nasıl), düzeltilmeyenler ve nedeni, başka alana düşenler. Son mesajında: worktree yolu, dal adı, commit SHA'ları, test sonuçları, düzeltilen / atlanan sayısı.
