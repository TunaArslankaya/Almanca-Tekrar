"""Genel Almanca sıklık sırası → quellen/rang.txt (bir kerelik; build.py bu dosyayı okur).

Kaynak: FrequencyWords (Hermit Dave), OpenSubtitles 2018, Almanca `de_50k.txt`
(https://github.com/hermitdave/FrequencyWords, lisans CC BY-SA 4.0). Ham liste repoya konmaz;
yalnız bizim öğelerimizin türetilmiş sırası yazılır.

Kullanım:
    python3 tools/build.py                       # daten/*.js güncel olsun (öğe listesi oradan okunur)
    python3 tools/rang_uret.py <yol>/de_50k.txt  # quellen/rang.txt yazar
    python3 tools/build.py                       # rang / onem / nadir kayıtlara

Sıra = öğenin biçimlerinden (listede küçük harf, biçim düzeyinde) en iyisi (en küçük sayı):
  isim: tekil, çoğul (+ Dativ -n), Genitiv -s / -es, n-Dekl. -n / -en, sıfat isim ekleri
  fiil: mastar, Präsens (ich / du / er / ihr), Präteritum, Partizip II; ayrılabilir fiilde yalnız
        ön ekli biçimler (ankommen, ankommt, ankam, angekommen, anzukommen: ayrılmış "kommt … an"
        listeden ayırt edilemez, bu yüzden ayrılabilir fiiller biraz nadir görünür)
  sıfat / zamir: yalın + -e -en -er -es -em
  çok kelimeli öğe (zwar … aber, zur Verfügung stehen, spazieren gehen, ünite kalıbı): yer tutucular
        (sich, etw, jdm …) dışındaki kelimelerin en nadiri.
Listede hiç yoksa sıra "-" (> 50 000).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
YOK = None
YER_TUTUCU = {"sich", "etw", "etwas", "jdm", "jdn", "jds", "jemand", "jemandem", "jemanden", "jmd", "jmdm", "jmdn",
              "mich", "dich", "mir", "dir"}
ADJ_EK = ("", "e", "en", "er", "es", "em")


def js(fn):
    s = open(P("daten", fn), encoding="utf-8").read()
    s = s[s.index("=") + 1:].strip()
    return json.loads(s[:-1] if s.endswith(";") else s)


def oku_liste(yol):
    fr = {}
    for i, line in enumerate(open(yol, encoding="utf-8"), 1):
        p = line.split()
        if p and p[0] not in fr:
            fr[p[0]] = i
    return fr


def main():
    if len(sys.argv) != 2:
        sys.exit("kullanım: python3 tools/rang_uret.py <de_50k.txt>")
    FR = oku_liste(sys.argv[1])

    def en_iyi(bicimler):
        rs = [FR.get(b.lower()) for b in bicimler if b]
        rs = [r for r in rs if r]
        return min(rs) if rs else YOK

    def kelime(tok):   # öbek içindeki tek kelime: büyük harf → isim ekleri, küçük → sıfat / fiil ekleri kabaca
        if tok[:1].isupper():
            return en_iyi([tok] + [tok + e for e in ("s", "es", "n", "en", "e", "er")])
        return en_iyi([tok] + [tok + e for e in ADJ_EK if e])

    def obek(metin):
        toks = [t for t in re.findall(r"[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*", metin) if t.lower() not in YER_TUTUCU]
        if not toks:
            return YOK
        rs = [kelime(t) for t in toks]
        return YOK if any(r is None for r in rs) else max(rs)   # en nadir kelime belirler

    def vstamm(inf):
        if inf.endswith(("eln", "ern")):
            return inf[:-1]
        return inf[:-2] if inf.endswith("en") else inf[:-1] if inf.endswith("n") else inf

    def fiil_bicim(base, p3, pt3, p2):
        st = vstamm(base)
        f = {base, st + "e", st + "st", st + "t", st + "et", st + "est", p3, pt3, p2}
        if p3:
            f |= {p3[:-1] + "st"} if p3.endswith("t") else {p3 + "st", p3 + "t"}
        if pt3:
            f |= {pt3 + "st", pt3 + "t", pt3 + ("n" if pt3.endswith("e") else "en")}
        return {x for x in f if x}

    def fiil(v):
        base, pre, p2 = v["base"], v["pre"], (v["p2"].split()[-1] if v["p2"] else "")
        if not pre:
            return en_iyi(fiil_bicim(base, v["p3"], v["pt3"], p2) | {v["inf"]})
        if v["sp"]:   # spazieren gehen, kennen lernen: iki kelime, en nadiri
            r1 = obek(pre)
            r2 = en_iyi(fiil_bicim(base, v["p3"], v["pt3"], p2))
            return YOK if r1 is None or r2 is None else max(r1, r2)
        fin = fiil_bicim(base, v["p3"], v["pt3"], "")
        return en_iyi({v["inf"], p2, pre + "zu" + base} | {pre + x for x in fin})

    def isim(x):
        l = x["lemma"]
        if " " in l:
            return obek(l)
        f = {l, l + "s", l + "es", x.get("gen")}
        if x.get("plf"):
            f |= {x["plf"]} | (set() if re.search(r"[ns]$", x["plf"]) else {x["plf"] + "n"})
        if x.get("weak"):
            f |= {l + "n", l + "en"}
        if x.get("adjN"):
            f |= {l + "n", l + "r", l + "s", l + "m"}
        for a in x.get("alt") or []:
            f.add(a)
        return en_iyi(f)

    def diger(w):
        de = w["de"]
        if " " in de or "…" in de:
            return obek(de)
        f = {de}
        if w.get("kl") in ("adj", "pron"):
            kok = de[:-1] if de.endswith("e") else de
            f |= {kok + e for e in ADJ_EK if e}
            if re.search(r"[^aeiouäöü](el|er)$", de):
                f |= {de[:-2] + de[-1] + e for e in ADJ_EK if e}
        return en_iyi(f)

    nomen = [x for x in js("nomen.js")["liste"] if not x.get("skip")]
    verben, woerter, unite = js("verben.js"), js("woerter.js"), js("unite.js")
    satir = []
    for x in nomen:
        satir.append((x["id"], f'{x["art"]} {x["lemma"]}', isim(x)))
    for v in verben:
        satir.append((v["id"], v["anz"], fiil(v)))
    for w in woerter:
        satir.append((w["id"], w["de"], diger(w)))

    # ünite kelimeleri: ana kaydı olan (isim artikel + lemma, fiil anz / mastar, diğer kelime) build'de ana kayıttan alır;
    # yalnız ana kaydı olmayanlar (kapalı / açılmamış ünitelerin ders kitabı kelimeleri) burada
    lab = {}
    for x in nomen:
        lab.setdefault(("die " if x.get("plOnly") else x["art"] + " ") + x["lemma"], x)
    wk = {w["de"]: w for w in woerter}
    for u in unite:
        for it in u["items"]:
            t, de = it["typ"], it["de"]
            if t == "n":
                ana = lab.get(de)
            elif t == "v":
                yal, sich = re.sub(r"^sich ", "", de), de.startswith("sich ")
                ana = next((v for v in verben if v["anz"] == de or (v["inf"] == yal and v["refl"] == ("A" if sich else v["refl"]))), None)
            else:
                ana = wk.get(de)
            if ana is not None:
                continue
            if t == "n" and " " in de and de.split(" ", 1)[0] in ("der", "die", "das"):
                l = de.split(" ", 1)[1]
                r = obek(l) if " " in l else en_iyi([l] + [l + e for e in ("s", "es", "e", "en", "n", "er")])
            elif t == "v":
                inf = re.sub(r"^sich ", "", de).split()[0]
                fs = set(re.findall(r"[a-zäöüß]+", (it.get("formen") or "").replace("hat ", "").replace("ist ", "")))
                st = vstamm(inf)
                r = en_iyi({inf, st + "t", st + "st", st + "te", st + "ten", "ge" + st + "t"} | fs)
            elif t == "a":
                r = en_iyi([de] + [de + e for e in ADJ_EK if e]) if " " not in de else obek(de)
            else:
                r = obek(de)
            satir.append((it["id"], de, r))

    with open(P("quellen", "rang.txt"), "w", encoding="utf-8") as f:
        f.write("# Genel Almanca sıklık sırası (küçük = sık), öğe başına; ÜRETİLDİ, elle düzenleme.\n")
        f.write("# Kaynak: FrequencyWords (Hermit Dave), OpenSubtitles 2018, Almanca de_50k — lisans CC BY-SA 4.0\n")
        f.write("#   (FrequencyWords, Hermit Dave, OpenSubtitles 2018); https://github.com/hermitdave/FrequencyWords\n")
        f.write("# Bu dosya o listeden türetilmiştir (aynı lisans). Ham liste repoda yok.\n")
        f.write("# Üretim: python3 tools/rang_uret.py <yol>/de_50k.txt  (önce python3 tools/build.py; biçim eşlemesi betiğin başında)\n")
        f.write("# Biçim: öğe_id | lemma | rang   (rang \"-\" = listede yok, > 50 000)\n")
        f.write("# Yeni öğe eklenince betik yeniden çalıştırılmazsa build o öğeye rang yazmaz (önem yalnız okuma derlemi + seviyeden).\n")
        for oid, lemma, r in satir:
            f.write(f"{oid} | {lemma} | {r if r else '-'}\n")
    yok = sum(1 for s in satir if not s[2])
    print(f"rang.txt: {len(satir)} öğe, listede yok {yok}")


if __name__ == "__main__":
    main()
