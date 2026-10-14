# Almanca Tekrar

A2 → B1 için yerel çalışma uygulaması. Kelimeler Goethe-Zertifikat B1 listesinden, tekrar zamanlaması FSRS
(Anki'nin algoritması). Cümleler her seferinde yeniden üretilir, böylece cümleyi ezberleyemezsin, fiili bilmen gerekir.

## Kullanım (site)

Uygulama GitHub Pages'ta: **https://mahmutarsla.github.io/Almanca-Tekrar/** — Claude pushlayınca kendiliğinden güncellenir.
Ayarlar → **GitHub'a otomatik kayıt**'a bir kez anahtar girersen cevaplar ve ilerleme repoya yazılır;
sonra Claude'a "sonuçlarıma bak" demen yeter (push yok, telefonda da çalışır).

**Telefona uygulama olarak ekle** (önerilir): iPhone'da Safari → Paylaş ⬆︎ → *Ana Ekrana Ekle*; Android'de Chrome menüsü ⋮ →
*Uygulamayı yükle*. Ana ekrandan tam ekran açılır, internetsiz de çalışır, iPhone'un 7 günlük site verisi temizliği ilerlemeni silmez.
**Günlük hatırlatıcı:** Ayarlar → *Takvime ekle* (seçtiğin saatte her gün takvim bildirimi).

## Günlük akış

Açılışta **Bugün** ekranı: seri 🔥, bugünkü tur halkası ve tek büyük düğme.

- **Tur:** 12 soruluk kısa oturum (~4 dk; Ayarlar'dan 5–30). Bitince özet: doğruluk, puan, güçlenen ve yakında tekrar gelecek kelimeler,
  yarınki tahmini süre; "Bir tur daha" ya da "Bitir". Tur sırasında ekranda yalnız kart ve ilerleme çubuğu var (✕ ya da Esc: Bugün'e dön).
- **Günü kurtar = 1 tur** (en az 10 cevap): gün seriye sayılır. Günlük hedef son 7 gününe göre 3–4 tur; sonrası bonus.
- **Seri dondurucu ❄️:** her 7 günlük seride bir tane (en çok 2); kaçırdığın günü kendiliğinden kapatır. Dondurucu yoksa ve dün kaçtıysa
  bugün 2 tur yaparak seriyi **onarabilirsin**. Ara verip dönünce ilk tur **çift puan**, en iyi hatırladıkların önce gelir.
- **Puan:** emeğe göre (tanıma 5, yazma 10, cümle / çekim 15, okuma 25, yazma görevi 50). Hızlı / boş basılan cevap puan almaz.
- **⚡ klavyesiz · 8 soru:** yorgunsan yalnız dokunarak (seçmeli + der/die/das). **🧘 uzun · 25 soru:** vakit varsa.
- **Günün işleri** kartları: Ünite (kitaptaki konu), günün fiil metni, yazma görevi, Zayıflar. **Odak** kartları: Hızlı tur, Fiiller,
  Düzensiz fiiller, Kelime yazma, Dönüşlü, n-Deklination, Konular, Paketler, Karışık yazma, Kalıplar, Okuma.
- Tur içinde: seçmeli anlam ve der/die/das (en çok 4 şık, şıklar 1,2 sn sonra ya da dokununca açılır), Türkçeden Almancaya yazma,
  cümle çevirisi, her 5 soruda bir **metinde** kartı, her 7 gerçek soruda bir **ara etkinlik** (metinde boşluk, eşleştirme, dinle–yaz, cümle dizme),
  ve **hızlı tekrar**: vadesi gelen 10 kelime tek tek; aklından söyle → *Biliyorum / Emin değilim / Bilmiyorum* (az önceki kelimenin cevabı altta açılır,
  "yanılmışım" ile düzeltilir; "biliyorum"ların dörtte biri hemen gerçek soruyla doğrulanır).
- Cevaptan sonra sonuç telefonda alttan açılır; yanlışta büyük **Devam** sistem notunu kullanır, "küçük hata say" / "aslında doğru" ile düzeltirsin.
  Ses açıksa doğru/yanlış sesi ve kelimenin Almanca okunuşu gelir (sağ üstteki 🔊 ile kapanır); art arda doğrularda 🔥 kombo.
- **İlerleme** sekmesi: seri, puan, 5 haftalık takvim, önümüzdeki 7 günün tekrar yükü, günlük tablo, Claude'un düzeltmeleri.

Tekrar birikirse (ara verdiysen) eski tekrarlar günlere bölünür (günde ~0,8 × hedef), toplam sayı gösterilmez; günün payı bitince ertelenenler öne çekilir.
Birikme sürerken yeni kelime gelmez ve en verimli kısa kartlar (anlam, artikel, kelime yazma) önce gelir; tam cümle ve çekim kartları birikme erince.
Yeni kelime sınırı günde 8 kelime + 2 fiil (Ayarlar → Gelişmiş): tek seferde çok kelime açmak birkaç gün sonra tekrar yığını demek.
Tekrar yükü Ayarlar'dan: Rahat %80 / **Dengeli %85** / Sıkı %90 hatırlama.

## Baştan savma günleri için

Uygulama yorgun ya da isteksiz çalıştığın anları fark edip kendini ayarlar:

- **Önce aklından söyle:** seçenekler 1,2 sn sonra açılır. Açılır açılmaz basılan cevap okunmamış sayılır, hedefe sayılmaz.
- **Boş / rastgele cevap** (`asdf`, `xxxx`, tek harf) "bilmiyorum" sayılır ve hedefe sayılmaz. "Bilmiyorum" deyince kendine not veremezsin.
- **Dikkat uyarısı:** son 8 cevabın 5'i yanlışsa ya da 3'ü çok hızlı / boşsa 10 soru boyunca yeni kelime gelmez, kolay sorular gelir.
- **Okumadan geçme yok:** tanıtım kartı en az 2 sn, paket metni kelime sayısına göre 6–15 sn ekranda kalır.
- **Birikme sınırı:** iki günlük kapasiteden (günlük hedefin 2 katı) fazla tekrar birikmişse yeni kelime gelmez; önce hâlâ hatırladıkların sorulur.
  Karışık'taki yazma tekrarları birikmişse Hızlı tur da yeni kelime vermez (kolay kısmı yapıp zoru atlamaya karşı).
- **Ara verdiysen:** suçlamaz; "tekrar hoş geldin", ilk tur çift puan, kolay kartlarla başlar.
- **Takılan kelime:** üç ayrı günde yanlış yaptığın kelime 🪝 ile işaretlenir; Claude "sonuçlarıma bak"ta ona hafıza kancası yazar,
  kanca o kelime her yanlışta gösterilir.

## Sekmeler

- **Bugün:** seri, tur halkası, Başla, günün işleri, odak bölümleri, bu hafta, B1 yolu.
- **Zayıflar:** yanlış yaptıkların, yeni cümlelerde tekrar. Takılanlar ve kancaları en üstte.
- **Kelimeler:** bütün liste (fiil, isim, diğer), durumlarıyla. İstediğini "Ekle" ile hemen öğrenmeye alabilirsin.
- **İlerleme:** seri, puan, 5 haftalık takvim, 7 günlük yük tahmini, son 21 gün, Claude'un düzeltmeleri, son cevaplar.
- **Ayarlar:** tur uzunluğu, ses, titreşim, tekrar yükü, takvim hatırlatıcısı, ana ekrana ekleme, (gelişmiş) bölüm hedefleri, GitHub kaydı, yedek.

## Kısayollar

Bugün: `Enter` başla · Tur: `Esc` Bugün'e dön · Seçmeli: `1`–`4` seç · `0` bilmiyorum · Artikel: `1` der · `2` die · `3` das ·
Hızlı tekrar: `1` biliyorum · `2` emin değilim · `3` bilmiyorum ·
Yazarak: `Enter` kontrol / geç · `1` `2` `3` not (yanlış / küçük hata / doğru) ·
`a:` → ä, `o:` → ö, `u:` → ü, `s:` → ß

Artikel renkleri: <b>der</b> mavi · <b>die</b> kırmızı · <b>das</b> yeşil · çoğul mor.

Nasıl çalıştığı ve neden: [TASARIM.md](TASARIM.md)
