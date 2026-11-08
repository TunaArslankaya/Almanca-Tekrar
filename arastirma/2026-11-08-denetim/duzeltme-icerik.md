# duzeltme-icerik (içerik / veri ajanı, 8.11.2026)

Worktree: `/home/user/Almanca-Tekrar/.claude/worktrees/agent-ab318ecd18bf53fdc`, dal `worktree-agent-ab318ecd18bf53fdc`.
Alan: `quellen/*.txt` (grammatik hariç), `daten/feedback.js`, `daten/kancalar.js`, `tools/build.py` (veri üretimi), `tools/istem_gece.md`, `tools/istem_geribildirim.md`. js/ ve log/ dokunulmadı; `node tools/feedback_json.js` çalıştırılmadı.

## Düzeltilenler (her biri önce yeniden üretildi)

1. **glossen.txt kayması** (kod-3 #2). 841–941 arasındaki her satırın glossu bir sonraki satırdaydı. Gloss sütunu bir satır yukarı alındı, 942 („Warum beschwerst du dich immer?“) `-`. Tüm dosya tarandı: başka blok yok; tek tek yanlış iki satır daha düzeltildi (4000 „Mit dem Foto …“ → `das Foto`; 4001 „Du übertreibst …“ → `das Bild`).
   Kalıcı denetim `tools/build.py` içinde: gloss kendi cümlesinde yoksa, komşu cümlede varsa ve komşunun glossu bu cümleye uyuyorsa (ya da `-` ise) uyarı `glossen.txt:N: gloss kaymış olabilir`. Eski dosyada 62 uyarı veriyor, yeni dosyada 0. Gece istemine de bu uyarıya bakması eklendi.
2. **feedback.js** (log-1 #20, log-2 E, log-3 #21): 25 kayıt düzeltildi.
   - Tuna'yı haksız suçlayanlar artık „Sistem hatasıydı“ diyor: Schienen/scheinen (31.10 16:02), vor allem (4.11 06:48; urteil richtig), Kunst (3.11 18:46; antwort/richtig ters yazılmıştı; urteil richtig), sich treffen (31.10 16:03).
   - Yanlış Almanca bilgi: reflexiv:48 „zu + Akk“ → zu + Dativ (zur = zu der). Uydurma kurallar kaldırıldı: Verein „ver-/ein“, Geduld „-ld/-uld“ (2 kayıt) ve „Ge- çoğu das“, Vorurteil „-teil → das“, Regel „-el çoğu die“, Referat „-at çoğunlukla das“.
   - Ters / yanlış karar: ehrenamt → ehrenamtlichen (başka kelime: sistem haklıydı, „sistem haksız“ silindi), tekamolo:96 „zu meinem Bruder“ (edat hatası: falsch, itiraz haklı değildi), tekamolo:9 Montan (fast, yazım), n0028 Veränderung (doğru kelime + umlaut: fast), vergleich:8 (tekil Miete da doğru), modalverben:56 (Tuna „Bilmiyorum“ demişti, „hata yok“ değil).
   - Tutarlılık: doğru fiilin başka biçimi aynı karar (fast, „fiil doğru, biçim yanlış (çekim)“): v643 wird/werden (2), v429 geregnet, v346 kommt, v243 fährt, v378 gelöscht. v642 kaydı gewandt / gewendet.
3. **kancalar.js**: n0994 „-ept → das / Prinzip“ kuralı kaldırıldı; n0957 Rat'a „kurul, meclis (der Stadtrat)“; v527 treffen / sich treffen mit ayrımı; v642 Perfekt gewandt.
4. **Gece istemleri**: `tools/istem_gece.md`'ye „Düzeltme doğruluğu“ maddesi: antwort / richtig sütunları, „Sistem hatasıydı“ ölçütleri, aynı hata türüne aynı karar, uydurma artikel kuralı listesi, zu / mit / bei … hep Dativ. `tools/istem_geribildirim.md`'ye kısa hâli.
5. **Soru içeriği**:
   - der Rat (kullan-3): `nomen.txt` anlamı „tavsiye, öğüt / kurul, meclis“. `/` kullanıldı; `kurzTr` `;`'de kestiği için iki anlam da şıkta görünür. scheinen de aynı şekilde: „(güneş) parlamak / … gibi görünmek“ (log-2).
   - sich wenden an (log-1 #13, log-2, log-3 #17): verben.txt'e çekim alanı `wendet, wandte/wendete, hat gewandt/gewendet`. Asıl biçim gewandt / wandte (Duden'de bu anlamda yaygın olan; aynı kök kartını paylaşan anwenden de angewandt). build.py artık `/` ile verilen ikinci biçimi `p2Alt` / `pt3Alt` alanına yazıyor (v642, senden v471 sandte / gesandt, anwenden angewendet, hängen hängte / gehängt).
   - treffen v527 (log-2, log-3 #16): „(birine) rastlamak, (birini) görmek“; sich treffen mit „(biriyle) buluşmak“ kaldı.
   - eher (kullan-4): „Ich stehe meist eher auf als mein Mann“ (= daha erken) wort_saetze'den silindi, Goethe örneğinden de build'de çıkarılıyor (`GOETHE_BSP_AUS`).
   - Pizza-Service (log-1 #15, log-2, log-3 #19): `|| Rufst du den Pizza-Service an?`.
   - Kunst n0691 (log-2): „Meine Schwester interessiert sich sehr für moderne Kunst.“ (artikel boşluğa giremez).
   - Präteritum / ihr alternatifleri (kullan-3): Mein Freund bestand die Prüfung, Ich beschwerte mich beim Chef (+ „Beim Chef habe ich mich beschwert.“), Ihr beide müsst den Vertrag unterschreiben.
   - n0028 die Änderung: `LEMMA_ALT` → die Veränderung da kabul.
   - die Praxis (kullan-2) ve aynı lemmalı isimlerin hepsi tarandı. Türkçesi Goethe örneklerinin tersine olan 4 çift: Bank, Eis, Rad, Praxis. Öğrenilen anlam / kimlik değişmesin diye Türkçeye dokunulmadı. wort_saetze cümleleri doğru kimliğe taşındı, Goethe `bsp` build'de yer değiştiriyor (`BSP_TAUSCH`).
   - „übernommen.“ / „festgenommen.“ (kullan-2, kod-3 #8): split_forms sondaki noktalamayı siliyor (v539 p2 artık übernommen). „Cafées“ → „Cafés“ (genitiv, é ünlü sayılır).
   - „Énde des Monats“ (bulunan ek hata): wort_saetze, glossen ve Goethe örneği (`GOETHE_BSP_FIX`).
   - v469 sehen „Warst du schon mal an der Nord/Ostsee?“ (kod-3 #9): sein (v470) kimliğine taşındı, cümle „… an der Nordsee oder an der Ostsee?“ oldu; Goethe örneği sehen'den çıkarıldı.
   - minimalpaare „vier / für“ ei-ie kontrastında (kod-3 #12): satır yoruma alındı (i / ü kontrastı yok).
   - Kendi cümlesi az olan yeni öğeler (log-2): 37 yeni cümle + gloss. selbe 0 → 5, häufig 1 → 5, dagegen 2 → 5, mehrere 2 → 5, Daten 1 → 5, Gefühl 1 → 5, Regierung 3 → 5, herstellen 1 → 5, steigen 1 → 5, führen 1 → 5. bringen'de zaten 7 cümle var: tekrar 30 gün sayım hatasından (kod alanı).

## Testler
`python3 tools/build.py` (0 hata, gloss kayma uyarısı 0) · `test_grammatik` ✓ · `test_kern` 665 ✓ · `test_goc` 76 ✓ · `test_dinle` 13 ✓ · `stichprobe.js 1` ✓ · `stichprobe_module.js refl` ✓ · `pruef_grammatik.py` 0 hata · `node --check` feedback / kancalar ✓ · e2e: `e2e_smoke` ✓, `e2e_fiil_artikel` ✓, `e2e_ek` ✓.

## Düzeltilmeyenler / başka alana
- **js (kod ajanı)**:
  - `stammTekPruef` yeni `v.p2Alt` / `v.pt3Alt` alanlarını kabul etmeli. Şu an asıl biçim gewandt; Tuna'nın 7.11'de doğru sayılan „gewendet“i kod bunu okuyana dek yanlış sayılır.
  - `formIdx` / `lexSet`: yapay „regenn“ biçimleri, çok kelimeli WOERTER'in ilk kelimesi (ein bisschen, sich Mühe geben).
  - `aktSaetze` / `wortSuchen` cümle ortasında küçültme yapıyor (Unternehmen → unternehmen). Bu isimleri nomen_extra'ya eklemedim: Goethe B1 listesinde yoklar ve yeni kelime sırasına girerlerdi.
  - `wortLuecke`: çok kelimeli öğeler; „-in“ dişil türevi eşleşiyor (Chefin ↔ der Chef). Goethe'nin ~38 kadın meslek örneği; cümleler değiştirilmedi.
  - Ayrıca: fiil metni anbieten tanıma, „Wegen“ Pl. rozeti (deHTML), rechnen „rechnt“ (needsE), Goethe Lesen metinleri metin boşluğunda, 30 gün cümle sayımı (t:0).
- **Gramer ajanı (`quellen/grammatik/`)**: vergleich:8 tekil alternatif („Die Miete in Bremen ist günstiger als in München.“), tuerkisch-fallen:87 „Darf ich Ihnen helfen?“.
- **selbe**: öğe adı „selbe“ kaldı (woerter'de alternatif alanı yok). Yazmada „selben“ küçük hata (çekim) alıyor; 5 cümle eklendi, boşluk sorusu artık „im selben / am selben“ biçimini soruyor.
- „Hilfsbereitschaft ↔ Solidarität“, „heiß ↔ warm“ metin boşluğu itirazı: okuma metni (Claude yazmaz) + kod (metin boşluğuna itiraz). Yapılmadı.
