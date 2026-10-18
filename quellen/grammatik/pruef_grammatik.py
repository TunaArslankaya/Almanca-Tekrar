"""Gramer içerik denetleyicisi ve ayrıştırıcısı (biçim: FORMAT.md, bu klasörde).

Tek kaynak: tools/build.py bu dosyayı yükler (grammatik_lesen) ve aynı kuralları uygular.

Kullanım:  python3 -I quellen/grammatik/pruef_grammatik.py [<dosya.txt> ...] [<repo kökü>]
  Dosya verilmezse quellen/grammatik/*.txt hepsi denetlenir. Hata varsa çıkış kodu 1; uyarılar yalnız yazılır.
"""
import collections, glob, os, re, sys

G_TUREN = {"luecke", "wahl", "ordnen", "fehler", "umform", "ceviri", "text", "eslestir", "kategori", "dinle"}
# yazarak üretilen türler (hayalette 'fast' da açılır; tekrar setinde en az biri); luecke yalnız seçeneksizse
G_YAZARAK = {"umform", "ordnen", "fehler", "ceviri", "text", "dinle"}
G_KOPF_PFLICHT = ["id", "titel", "tr", "stufe", "goethe", "kurz"]
G_KOPF_ERLAUBT = set(G_KOPF_PFLICHT) | {"kapitel", "voraus", "kontrast", "etiket"}
# FORMAT.md §6 dağılım (uyarı): konu başına alıştırma sayısı ve tür başına en az
G_MIN_TOPLAM = 50
G_MIN_TUR = {"luecke": 4, "wahl": 4, "ordnen": 4, "fehler": 4, "umform": 4, "ceviri": 6, "text": 3, "dinle": 3, "eslestir": 1, "kategori": 1}


def g_norm(x):
    x = re.sub(r"\s+", " ", x.strip()); x = re.sub(r"\s+([,.!?])", r"\1", x); x = x.rstrip(".!?").strip()
    return x[:1].lower() + x[1:]
def g_tokens(x): return sorted(w.lower() for w in re.findall(r"[\wäöüÄÖÜß-]+", x))
def g_alts(f): return [a.strip() for a in f.split(" / ") if a.strip()]
def g_liste(f, sep=" ;; "): return [a.strip() for a in f.split(sep.strip()) if a.strip()] if f.strip() else []
def g_dinle_norm(x): return re.sub(r"\s+", " ", re.sub(r"[.,!?;:„“”\"«»–]", " ", x)).strip().lower()


def g_wortschatz(root):
    keys = set()
    for fn in ("verben.txt", "woerter.txt", "nomen.txt", "nomen_extra.txt"):
        p = os.path.join(root, "quellen", fn)
        if not os.path.exists(p): continue
        for z in open(p, encoding="utf-8"):
            if z.strip() and not z.startswith("#") and "|" in z: keys.add(z.split("|")[0].strip())
    for fn in sorted(glob.glob(os.path.join(root, "quellen", "unite*.txt"))):
        if "_" in os.path.basename(fn): continue
        for z in open(fn, encoding="utf-8"):
            t = [x.strip() for x in z.split("|")]
            if len(t) >= 4 and t[0] in ("n", "v", "a", "x", "k"): keys.add(t[1])
    return keys


def g_kategori(cevap):
    """'grup: öğe, öğe ;; grup: öğe' → [{ad, oge}] ya da None (biçim hatası)."""
    out = []
    for g in g_liste(cevap):
        if ":" not in g: return None
        ad, rest = g.split(":", 1)
        out.append({"ad": ad.strip(), "oge": [x.strip() for x in rest.split(",") if x.strip()]})
    return out


def grammatik_lesen(pfad, ws, errors, warnings):
    name = os.path.basename(pfad)
    kopf, teile, ueb, tabellen, beispiele, erkl = {}, {}, [], [], [], []
    teil, block, tab = None, None, None
    for nr, z in enumerate(open(pfad, encoding="utf-8").read().splitlines(), 1):
        if block:
            if z.strip() == "@ende": block, tab = None, None; continue
            if block == "erklaerung": erkl.append(z); continue
            if z.strip():
                cells = [c.strip() for c in z.split("|")]
                if tab["kopf"] is None: tab["kopf"] = cells
                elif len(cells) != len(tab["kopf"]): errors.append(f"{name}:{nr}: tablo satırı {len(cells)} sütun, başlık {len(tab['kopf'])}")
                else: tab["zeilen"].append(cells)
            continue
        if not z.strip() or z.startswith("#"): continue
        if z.startswith("@"):
            m = re.match(r"@(\w+)\s*(.*)", z); k, v = m.group(1), m.group(2).strip()
            if k == "erklaerung": block = "erklaerung"
            elif k == "tabelle": block = "tabelle"; tab = {"titel": v, "kopf": None, "zeilen": []}; tabellen.append(tab)
            elif k == "beispiel":
                t = [x.strip() for x in v.split("|")]
                if len(t) != 2: errors.append(f"{name}:{nr}: @beispiel 'Almanca | Türkçe' olmalı")
                else: beispiele.append(t)
            elif k == "teil":
                t = [x.strip() for x in v.split("|")]
                if len(t) == 1:   # yeniden açma: '@teil <kod>' daha önce tanımlanmış teil'e döner
                    if t[0] in teile: teil = t[0]
                    else: errors.append(f"{name}:{nr}: @teil {t[0] or '?'} tanımsız (yeniden açmak için önce 'kod | ad | etiket' ile tanımlanmalı)")
                    continue
                if len(t) != 3 or not re.fullmatch(r"[a-z0-9-]+", t[0]): errors.append(f"{name}:{nr}: @teil 'kod | ad | etiket' (ya da yeniden açmak için yalnız 'kod') olmalı"); continue
                if t[0] in teile: errors.append(f"{name}:{nr}: @teil {t[0]} iki kez (yeniden açmak için yalnız '@teil {t[0]}')")
                teil = t[0]; teile[teil] = {"name": t[1], "etiket": t[2]}
            elif k in G_KOPF_ERLAUBT:
                if k in kopf: errors.append(f"{name}:{nr}: @{k} iki kez")
                kopf[k] = v
            else: errors.append(f"{name}:{nr}: bilinmeyen başlık @{k}")
            continue
        f = [x.strip() for x in z.split("|")]
        if len(f) != 8: errors.append(f"{name}:{nr}: {len(f)} alan (8 olmalı)"); continue
        tur, zor, soru, cevap, opt, tr, acik, woerter = f
        aus = tur.startswith("-")
        if aus: tur = tur[1:]
        u = {"n": len(ueb) + 1, "tur": tur, "z": int(zor) if zor in ("1", "2", "3") else 0, "teil": teil, "soru": soru, "cevap": g_alts(cevap),
             "tr": tr, "aciklama": acik, "woerter": [w.strip() for w in woerter.split(";") if w.strip()]}
        if aus: u["aus"] = True
        if tur == "fehler": u["hata"] = opt
        elif opt: u["opt"] = g_alts(opt)
        ueb.append(u)
        if teil is None: errors.append(f"{name}:{nr}: alıştırma @teil satırından önce")
        if tur not in G_TUREN: errors.append(f"{name}:{nr}: bilinmeyen tür '{tur}'"); continue
        if not u["z"]: errors.append(f"{name}:{nr}: zorluk 1–3 olmalı")
        if not soru or not cevap or not tr or not acik: errors.append(f"{name}:{nr}: soru / cevap / Türkçe / açıklama boş olamaz ('-' = Türkçe yok)")
        if tur in ("ceviri", "text", "eslestir", "kategori", "dinle") and opt:
            errors.append(f"{name}:{nr}: {tur}'de 5. alan boş olmalı"); u.pop("opt", None)
        alts = u["cevap"]
        if tur == "luecke":
            n = soru.count("___")
            if n == 0: errors.append(f"{name}:{nr}: luecke'de '___' yok")
            for a in alts:
                if len(a.split(" ; ")) != n: errors.append(f"{name}:{nr}: {n} boşluk ama cevapta {len(a.split(' ; '))} parça")
            if opt:
                if n != 1: errors.append(f"{name}:{nr}: seçenekli luecke tek boşluklu olmalı")
                if not any(a in g_alts(opt) for a in alts): errors.append(f"{name}:{nr}: cevap seçenekler arasında yok")
        elif tur == "wahl":
            o = g_alts(opt)
            if len(o) < 2: errors.append(f"{name}:{nr}: wahl en az 2 seçenek")
            if len(alts) != 1 or alts[0] not in o: errors.append(f"{name}:{nr}: wahl'da tek cevap ve seçeneklerden biri olmalı")
            if len(set(o)) != len(o): errors.append(f"{name}:{nr}: aynı seçenek iki kez")
        elif tur == "ordnen":
            parca = g_alts(soru)
            if len(parca) < 3: errors.append(f"{name}:{nr}: ordnen en az 3 parça")
            for a in alts:
                if g_tokens(" ".join(parca)) != g_tokens(a): errors.append(f"{name}:{nr}: parçalar cevapla aynı kelimeler değil: {a}")
        elif tur == "fehler":
            if not opt: errors.append(f"{name}:{nr}: fehler'de hata alanı boş ('-' = hata yok)")
            elif opt == "-":
                if g_norm(soru) != g_norm(alts[0]): errors.append(f"{name}:{nr}: '-' (hata yok) ama cevap sorudan farklı")
            else:
                if opt not in soru: errors.append(f"{name}:{nr}: hatalı kısım '{opt}' soruda geçmiyor")
                if any(g_norm(soru) == g_norm(a) for a in alts): errors.append(f"{name}:{nr}: hatalı cümle cevapla aynı")
        elif tur == "umform":
            if " → " not in soru: errors.append(f"{name}:{nr}: umform'da ' → hedef' yok")
        elif tur == "ceviri":
            if not alts: errors.append(f"{name}:{nr}: ceviri'de cevap boş")
            if "___" in soru: errors.append(f"{name}:{nr}: ceviri'de soru tam Türkçe cümle olmalı ('___' yok)")
        elif tur == "dinle":
            if not alts: errors.append(f"{name}:{nr}: dinle'de cevap boş")
            elif g_dinle_norm(soru) not in [g_dinle_norm(a) for a in alts]: errors.append(f"{name}:{nr}: dinle'de okunan cümle (soru) cevaplardan biri olmalı")
        elif tur == "text":
            parcalar = [g_alts(p) for p in cevap.split(" ; ")]
            n = soru.count("___")
            if n != len(parcalar): errors.append(f"{name}:{nr}: text'te {n} boşluk ama cevapta {len(parcalar)} parça")
            if any(not p for p in parcalar): errors.append(f"{name}:{nr}: text'te boş cevap parçası")
            if not 2 <= n <= 5: warnings.append(f"{name}:{nr}: text'te {n} boşluk (2–5 olmalı)")
            u["parcalar"] = parcalar
            u["cevap"] = [" ; ".join(p[0] for p in parcalar if p)]
        elif tur == "eslestir":
            sol, sag = g_liste(soru), g_liste(cevap)
            if len(sol) != len(sag): errors.append(f"{name}:{nr}: eslestir'de sol {len(sol)}, sağ {len(sag)} öğe (eşit olmalı)")
            if not 3 <= len(sol) <= 5: errors.append(f"{name}:{nr}: eslestir'de 3–5 eş olmalı ({len(sol)})")
            if len(set(sol)) != len(sol) or len(set(sag)) != len(sag): errors.append(f"{name}:{nr}: eslestir'de aynı öğe iki kez")
            u["sol"], u["sag"], u["cevap"] = sol, sag, [cevap]
        elif tur == "kategori":
            gr = g_kategori(cevap)
            if gr is None: errors.append(f"{name}:{nr}: kategori cevabı 'grup: öğe, öğe ;; grup: öğe' olmalı"); gr = []
            else:
                oge = [o for g in gr for o in g["oge"]]
                if not 2 <= len(gr) <= 3: errors.append(f"{name}:{nr}: kategori'de 2–3 grup olmalı ({len(gr)})")
                if any(not g["ad"] or not g["oge"] for g in gr): errors.append(f"{name}:{nr}: kategori'de her grubun adı ve en az 1 öğesi olmalı")
                if len(set(oge)) != len(oge): errors.append(f"{name}:{nr}: kategori'de aynı öğe iki kez")
                if len(set(g["ad"] for g in gr)) != len(gr): errors.append(f"{name}:{nr}: kategori'de aynı grup adı iki kez")
                if not 4 <= len(oge) <= 8: warnings.append(f"{name}:{nr}: kategori'de {len(oge)} öğe (4–8 olmalı)")
            u["gruplar"], u["cevap"] = gr, [cevap]
        for w in u["woerter"]:
            if w not in ws: warnings.append(f"{name}:{nr}: kelime anahtarı listelerde yok: '{w}'")
    for k in G_KOPF_PFLICHT:
        if k not in kopf: errors.append(f"{name}: başlık eksik: @{k}")
    if not erkl: errors.append(f"{name}: @erklaerung bloğu yok")
    if block: errors.append(f"{name}: @ende eksik")
    g = kopf.get("goethe", "")
    gm = re.match(r"([123]) \|\s*(.*)", g)
    if g and not gm: errors.append(f"{name}: @goethe '1–3 | alanlar' olmalı")
    if kopf.get("id") and kopf["id"] + ".txt" != name: errors.append(f"{name}: @id dosya adıyla aynı olmalı")
    # dağılım (FORMAT.md §6): uyarı, konu başına tek satır
    aktiv = [u for u in ueb if not u.get("aus")]
    tc = collections.Counter(u["tur"] for u in aktiv)
    eksik = [f"{t} {tc[t]}/{m}" for t, m in G_MIN_TUR.items() if tc[t] < m]
    if len(aktiv) < G_MIN_TOPLAM or eksik:
        warnings.append(f"{name}: dağılım: {len(aktiv)}/{G_MIN_TOPLAM} alıştırma" + (f"; eksik tür: {', '.join(eksik)}" if eksik else ""))
    if tc["fehler"] and not any(u.get("hata") == "-" for u in aktiv if u["tur"] == "fehler"): warnings.append(f"{name}: hiç 'hata yok' alıştırması yok")
    return kopf.get("id", name[:-4]), {
        "kopf": {"titel": kopf.get("titel", ""), "tr": kopf.get("tr", ""), "stufe": kopf.get("stufe", ""), "kapitel": kopf.get("kapitel", ""),
                 "goethe": {"stufe": int(gm.group(1)) if gm else 1, "wo": gm.group(2) if gm else ""},
                 "voraus": [x.strip() for x in kopf.get("voraus", "").split(",") if x.strip()], "kontrast": [x.strip() for x in kopf.get("kontrast", "").split(",") if x.strip()],
                 "etiket": kopf.get("etiket", ""), "kurz": kopf.get("kurz", "")},
        "erklaerung": "\n".join(erkl).strip(), "tabellen": tabellen, "beispiele": beispiele, "teile": teile, "uebungen": ueb}


def main(argv):
    hier = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(os.path.dirname(hier))
    dateien = []
    for a in argv:
        if os.path.isdir(a): root = os.path.abspath(a)
        else: dateien.append(a)
    if not dateien: dateien = sorted(glob.glob(os.path.join(hier, "*.txt")))
    errors, warnings = [], []
    ws = g_wortschatz(root)
    for d in dateien: grammatik_lesen(d, ws, errors, warnings)
    for w in warnings: print("uyarı:", w)
    for e in errors: print("HATA:", e)
    print(f"{len(dateien)} dosya · {len(errors)} hata · {len(warnings)} uyarı")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
