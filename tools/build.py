"""quellen/*.txt + daten/goethe_b1.json  ->  daten/verben.js, daten/nomen.js

Aynı zamanda doğrulama yapar: Goethe'de bulunmayan fiil/isim, artikel uyuşmazlığı,
çözümlenemeyen kalıp ismi vb. Hata varsa çıkış kodu 1.

Kullanım:  python3 tools/build.py
"""
import json, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
PREPS = {"an", "auf", "in", "über", "unter", "vor", "hinter", "neben", "zwischen", "mit", "nach",
         "zu", "von", "bei", "aus", "seit", "für", "um", "gegen", "ohne", "durch"}
errors, warnings = [], []


def lines(path):
    for n, raw in enumerate(open(path, encoding="utf-8"), 1):
        s = raw.strip()
        if s and not s.startswith("#"):
            yield n, s


goethe = json.load(open(P("daten", "goethe_b1.json"), encoding="utf-8"))
g_verbs = {}
for e in goethe:
    if e["typ"] == "verb":
        g_verbs.setdefault(e["lemma"], e)
g_nouns = [e for e in goethe if e["typ"] == "nomen" and not e.get("regional")]

# ---------------- İsimler ----------------
UML = str.maketrans({"a": "ä", "o": "ö", "u": "ü", "A": "Ä", "O": "Ö", "U": "Ü"})


def umlaut(w):
    m = re.match(r"^(.*?)(au|a|o|u|A|O|U)([^aouAOU]*)$", w)
    if not m:
        return w
    v = "äu" if m.group(2) == "au" else m.group(2).translate(UML)
    return m.group(1) + v + m.group(3)


def plural_form(lemma, pl):
    if not pl or "/" in pl:
        return None
    base, suf = lemma, pl
    if suf.startswith("¨"):
        base, suf = umlaut(base), suf[1:]
    return base if suf == "-" else base + suf.lstrip("-")


WEAK_LIST = {"Mensch", "Rabe", "Ehegatte", "Herr", "Nachbar", "Bauer", "Bär", "Held", "Prinz", "Graf", "Kamerad",
             "Soldat", "Automat", "Kandidat", "Pilot", "Architekt", "Präsident", "Student", "Patient",
             "Assistent", "Dozent", "Journalist", "Polizist", "Tourist", "Spezialist", "Praktikant",
             "Elefant", "Migrant", "Fotograf", "Typ", "Kunde", "Kollege", "Junge", "Name", "Experte",
             "Zeuge", "Neffe", "Affe", "Hase", "Löwe", "Gedanke", "Buchstabe", "Friede",
             "Kommilitone", "Psychologe", "Biologe", "Türke", "Franzose", "Grieche", "Russe", "Pole", "Chinese"}
NOT_WEAK = {"See", "Käse", "Staat", "Schmerz", "Professor", "Doktor", "Motor", "Autor", "Direktor",
            "Angehörige", "Angestellte", "Bekannte", "Erwachsene", "Beamte", "Jugendliche", "Kranke",
            "Tote", "Verwandte", "Studierende", "Serviceangestellte"}
ADJ_NOUNS = {"Angehörige", "Angestellte", "Bekannte", "Erwachsene", "Beamte", "Jugendliche", "Kranke",
             "Tote", "Verwandte", "Studierende", "Serviceangestellte"}


def is_weak(art, lemma, pl):
    if art != "der" or lemma in NOT_WEAK:
        return False
    if lemma in WEAK_LIST:
        return True
    # bileşik isimler: Geldautomat, Vorname, Familienname …
    return pl in ("-n", "-en") and any(lemma.endswith(w.lower()) and len(lemma) > len(w) for w in WEAK_LIST)


GEN_NS = ("Name", "Gedanke", "Buchstabe", "Friede", "Glaube", "Wille")
# n almayan eril isimler: n-Deklination alıştırmasında tuzak olarak sorulur
FALLE = {"Lehrer", "Freund", "Arzt", "Chef", "Professor", "Doktor", "Autor", "Direktor", "Sohn", "Onkel",
         "Bruder", "Vater", "Mann", "Kellner", "Partner", "Käse", "See", "Schüler", "Bus", "Hund"}


def genitiv(art, lemma, weak):
    if art == "die":
        return lemma
    if weak:
        if lemma == "Herr":
            return "Herrn"
        if any(lemma.endswith(w.lower()) or lemma == w for w in GEN_NS):
            return lemma + "ns"
        return lemma + ("n" if lemma.endswith("e") or lemma in ("Nachbar", "Bauer") else "en")
    if re.search(r"(s|ß|x|z|sch)$", lemma):
        return lemma + ("ses" if lemma.endswith("us") else "es")
    if re.search(r"[aeiouäöü]$", lemma):
        return lemma + "s"  # des Sees, des Käses → Käse: -s
    # tek heceli: des Arztes, des Mannes (‑s de olur: des Manns)
    if len(re.findall(r"[aeiouäöü]+", lemma.lower())) == 1:
        return lemma + "es"
    return lemma + "s"


def genitiv_alt(art, lemma, weak, gen):
    if art == "die" or weak or not gen.endswith("es") or re.search(r"(s|ß|x|z|sch)$", lemma):
        return None
    return lemma + "s"


# Goethe'deki bozuk / bölgesel / tekrar eden maddeler (kimlikler sabit kalsın diye silinmez, atlanır)
LEMMA_FIX = {"Hinweise": "Hinweis", "Erdgeschoss/ Ergeschoß": "Erdgeschoss", "Hausfrau/der Hausmann": "Hausfrau",
             "Stück/-stück": "Stück", "Zeug/-zeug": "Zeug", "Zahncreme/-pasta": "Zahncreme",
             "Hähnchen/Hühnchen": "Hähnchen", "Müesli/Müsli": "Müsli", "Soße/Sauce": "Soße", "Ski/Schi": "Ski",
             "Fantasie/Phantasie": "Fantasie", "Rezeption/Reception": "Rezeption"}
LEMMA_ALT = {"Zahncreme": ["Zahnpasta"], "Hähnchen": ["Hühnchen"], "Soße": ["Sauce"], "Ski": ["Schi"],
             "Fantasie": ["Phantasie"], "Erdgeschoss": ["Erdgeschoß"], "Müsli": ["Müesli"],
             "Familienname": ["Nachname"]}
SKIP = {"Bancomat/Bankomat", "Bankomat-Karte", "Coiffeur", "Fleischhauer", "Gehsteig", "Trottoir",
        "Serviceangestellte", "Portemonnaie/Port-", "Nord-/Ostsee", "Phantasie/Fantasie"}


nomen = []
tr_lines = list(lines(P("quellen", "nomen.txt")))
if len(tr_lines) != len(g_nouns):
    errors.append(f"nomen.txt {len(tr_lines)} satır, Goethe isim sayısı {len(g_nouns)}")
for (n, s), g in zip(tr_lines, g_nouns):
    parts = [x.strip() for x in s.split("|")]
    key, tier, tr = parts[0], int(parts[1]), parts[2]
    if key != f"{g['art']} {g['lemma']}":
        errors.append(f"nomen.txt:{n}: '{key}' ≠ Goethe '{g['art']} {g['lemma']}'")
        continue
    lemma = re.sub(r"\d+\.$", "", g["lemma"]).strip()
    skip = lemma in SKIP or any(x["art"] == g["art"] and x["lemma"] == LEMMA_FIX.get(lemma, lemma) and x["tr"] == tr for x in nomen)
    lemma = LEMMA_FIX.get(lemma, lemma)
    pl = g.get("pl")
    if lemma == "Hinweis":
        pl = "-e"
    plural_only = pl is None and "çoğul" in tr
    if skip:
        nomen.append({"id": f"n{len(nomen) + 1:04d}", "art": g["art"], "lemma": lemma, "tr": tr, "skip": True, "tier": tier})
        continue
    nomen.append({
        "id": f"n{len(nomen) + 1:04d}", "art": g["art"], "lemma": lemma, "pl": pl,
        "plf": plural_form(lemma, pl), "tr": tr, "tier": tier,
        "weak": is_weak(g["art"], lemma, pl), "adjN": lemma in ADJ_NOUNS,
        "plOnly": plural_only, "bsp": g["bsp"][:4], "g": g["id"],
    })
known = {(x["art"], x["lemma"]) for x in nomen}
for n, s in lines(P("quellen", "nomen_extra.txt")):
    parts = [x.strip() for x in s.split("|")]
    m = re.match(r"^(der|die|das) ([^,]+)(?:, (.+))?$", parts[0])
    if not m:
        errors.append(f"nomen_extra.txt:{n}: biçim hatalı: {parts[0]}")
        continue
    art, lemma, pl = m.group(1), m.group(2).strip(), m.group(3)
    if (art, lemma) in known:
        continue
    nomen.append({
        "id": f"x{len(nomen) + 1:04d}", "art": art, "lemma": lemma, "pl": pl,
        "plf": plural_form(lemma, pl), "tr": parts[2], "tier": int(parts[1]),
        "weak": is_weak(art, lemma, pl), "adjN": False, "plOnly": pl is None and "çoğul" in parts[2],
        "bsp": [], "extra": True,
    })
    known.add((art, lemma))

for x in nomen:
    if x.get("skip"):
        continue
    x["gen"] = genitiv(x["art"], x["lemma"], x.get("weak"))
    ga = genitiv_alt(x["art"], x["lemma"], x.get("weak"), x["gen"])
    if ga:
        x["genAlt"] = ga
    if x["lemma"] in LEMMA_ALT:
        x["alt"] = LEMMA_ALT[x["lemma"]]
    if x["art"] == "der" and x["lemma"] in FALLE:
        x["falle"] = True

by_key = {}
for x in nomen:
    if not x.get("skip"):
        by_key.setdefault((x["art"], x["lemma"]), x)
by_plural = {}
for x in nomen:
    if x.get("plf") and not x.get("skip"):
        by_plural.setdefault(x["plf"], x)


# ---------------- Fiiller ----------------
def split_forms(g, override=None):
    if override:
        praes, praet, perf = [x.strip() for x in override.split(",")]
    else:
        praes, praet, perf = g["praes"], g["praet"], g["perf"]
    strip = lambda s: [t for t in s.split() if t not in ("sich", "etwas", "es")]
    pr = strip(praes.split("/")[0])
    pt = strip(praet.split("/")[0])
    pf = strip(perf)
    aux = pf[0].split("/")[0]
    p2 = " ".join(pf[1:]).split("/")[0]
    return pr, pt, aux, p2


verben = []
anz_map = {}
for n, s in lines(P("quellen", "verben.txt")):
    parts = [x.strip() for x in s.split("|")]
    if len(parts) < 4:
        errors.append(f"verben.txt:{n}: eksik alan")
        continue
    anz, kas, tier, tr = parts[:4]
    override = parts[4] if len(parts) > 4 else None
    refl = ""
    rest = anz
    if rest.startswith("sich(D) "):
        refl, rest = "D", rest[8:]
    elif rest.startswith("sich "):
        refl, rest = "A", rest[5:]
    objs = []
    for tok in kas.split():
        if tok == "-":
            continue
        if "+" in tok:
            p, k = tok.split("+")
            objs.append({"p": p, "k": k})
        else:
            objs.append({"k": tok})
    words = rest.split()
    preps_in = [o["p"] for o in objs if "p" in o]
    while words and words[-1] in PREPS and words[-1] in preps_in:
        words.pop()
    lemma = " ".join(words)
    g = g_verbs.get(lemma)
    if not g and not override:
        errors.append(f"verben.txt:{n}: '{lemma}' Goethe listesinde yok")
        continue
    pr, pt, aux, p2 = split_forms(g, override)
    inf = lemma
    finite = pr[0]
    pre, sp = "", ""
    if len(pr) > 1:
        pre = " ".join(pr[1:])
        sp = " " if inf.startswith(pre + " ") else ""
    base = inf[len(pre):].strip() if pre else inf
    if pre and not inf.startswith(pre):
        errors.append(f"verben.txt:{n}: ön ek '{pre}' mastarda yok ({inf})")
    # yardımcı fiil: dönüşlü fiiller hep haben; Goethe'de "hat/ist" olanlarda ikincisi de kabul
    raw_perf = (override.split(",")[-1] if override else g["perf"]).strip()
    aux_alt = None
    m2 = re.match(r"^(hat|ist)/(hat|ist)\s", raw_perf)
    if m2:
        aux_alt = m2.group(2)
    if refl:
        aux, aux_alt = "hat", None
    elif lemma == "ausziehen":  # (evden) taşınıp çıkmak
        aux, aux_alt = "ist", None
    v = {
        "id": f"v{len(verben) + 1:03d}", "anz": anz, "tr": tr, "tier": int(tier),
        "inf": inf, "base": base, "pre": pre, "sp": sp, "p3": finite, "pt3": pt[0] if pt else "",
        "aux": aux, "auxAlt": aux_alt, "p2": p2, "refl": refl, "obj": objs,
        "bsp": (g["bsp"][:4] if g else []), "goethe": (g["head"] if g else ""),
    }
    if not re.match(r"^(hat|ist)$", aux):
        errors.append(f"verben.txt:{n}: yardımcı fiil okunamadı: {aux}")
    verben.append(v)
    if anz in anz_map:
        errors.append(f"verben.txt:{n}: '{anz}' iki kez tanımlı")
    anz_map[anz] = v


# Goethe örnekleri fiil başına ortak: her anlam yalnızca kendi edatını içeren örnekleri alır
def has_prep(sent, p):
    w = re.findall(r"[A-Za-zÄÖÜäöüß]+", sent.lower())
    comp = {"da" + p, "dar" + p, "wo" + p, "wor" + p}
    contr = {"an": {"am", "ans"}, "in": {"im", "ins"}, "zu": {"zum", "zur"}, "von": {"vom"}, "bei": {"beim"}}.get(p, set())
    return any(x == p or x in comp or x in contr for x in w)


by_lemma = {}
for v in verben:
    by_lemma.setdefault((v["inf"]), []).append(v)
for group in by_lemma.values():
    all_preps = {o["p"] for v in group for o in v["obj"] if "p" in o}
    for v in group:
        mine = {o["p"] for o in v["obj"] if "p" in o}
        if mine:
            v["bsp"] = [b for b in v["bsp"] if all(has_prep(b, p) for p in mine)]
        elif all_preps:
            v["bsp"] = [b for b in v["bsp"] if not any(has_prep(b, p) for p in all_preps)]

# ---------------- Kalıplar ----------------
def resolve_noun(tok, where):
    t = tok.strip()
    flags = {"bare": False, "poss": False, "adj": False, "indef": False, "plural": False}
    if t.startswith("0 "):
        flags["bare"], t = True, t[2:]
    while t and t[-1] in "~*+":
        flags[{"~": "poss", "*": "adj", "+": "indef"}[t[-1]]] = True
        t = t[:-1]
    if t.endswith("(Pl)"):
        flags["plural"], t = True, t[:-4]
    for suf in "~*+":
        if t.endswith(suf):
            flags[{"~": "poss", "*": "adj", "+": "indef"}[suf]] = True
            t = t[:-1]
    m = re.match(r"^(der|die|das) (.+)$", t)
    if not m:
        errors.append(f"{where}: isim biçimi hatalı: '{tok}'")
        return None
    art, lemma = m.group(1), m.group(2)
    x = None
    if flags["plural"]:
        x = by_plural.get(lemma) or by_key.get((art, lemma))
        if x and x["lemma"] == lemma and not x["plOnly"] and x["plf"] != lemma:
            x = None
    else:
        x = by_key.get((art, lemma))
        if not x:
            other = [k for k in by_key if k[1] == lemma]
            if other:
                errors.append(f"{where}: artikel yanlış: '{art} {lemma}' → Goethe: '{other[0][0]} {lemma}'")
                return None
    if not x:
        errors.append(f"{where}: isim bulunamadı: '{t}'")
        return None
    r = {"id": x["id"]}
    for k, v in flags.items():
        if v:
            r[k] = True
    if x["plOnly"]:
        r["plural"] = True
    if x["adjN"]:
        warnings.append(f"{where}: sıfat-isim ({lemma}) üreticide yanlış çekilebilir")
    return r


personen, adj_sache, adj_person = [], [], []
for n, s in lines(P("quellen", "rahmen.txt")):
    where = f"rahmen.txt:{n}"
    if s.startswith("@personen:"):
        for tok in s.split(":", 1)[1].split(","):
            r = resolve_noun(tok, where)
            if r:
                personen.append(r)
        continue
    if s.startswith("@adjektive_"):
        ziel = adj_sache if s.startswith("@adjektive_sache") else adj_person
        for tok in s.split(":", 1)[1].split(","):
            de, tr = tok.split("=", 1)
            ziel.append({"de": de.strip(), "tr": tr.strip()})
        continue
    anz, _, body = s.partition(":")
    anz = anz.strip()
    v = anz_map.get(anz)
    if not v:
        errors.append(f"{where}: fiil '{anz}' verben.txt içinde yok")
        continue
    body = body.strip()
    if body == "-":
        v.setdefault("rahmen", []).append({"o": []})
        continue
    fr = {"o": []}
    for slot in body.split(";"):
        key, _, vals = slot.partition("=")
        key = key.strip()
        if key == "-":  # nesnesiz kalıp + seçenekler ("- ; T = perf")
            continue
        if key == "T":  # izin verilen zamanlar: praes, perf, modal
            fr["t"] = [x.strip() for x in vals.split(",") if x.strip()]
            continue
        if key == "X":  # kapatılan özellikler: keinW (soru kelimesi yok), keineZeit (zaman ifadesi yok)
            fr["x"] = [x.strip() for x in vals.split(",") if x.strip()]
            continue
        noms = []
        for tok in vals.split(","):
            tok = tok.strip()
            if tok == "P":
                noms.append("P")
            elif tok:
                r = resolve_noun(tok, where)
                if r:
                    noms.append(r)
        if not noms:
            errors.append(f"{where}: boş yuva '{key}'")
            continue
        if key == "T":
            continue
        if key == "S":
            fr["s"] = noms
        elif "+" in key:
            p, k = key.split("+")
            fr["o"].append({"p": p, "k": k, "n": noms})
        elif key in ("A", "D"):
            fr["o"].append({"k": key, "n": noms})
        else:
            errors.append(f"{where}: yuva anlaşılamadı '{key}'")
    # kalıp, fiilin hâl bilgisiyle uyumlu mu?
    for o in v["obj"]:
        if not any(x.get("p") == o.get("p") and x["k"] == o["k"] for x in fr["o"]) and "s" not in fr:
            if o.get("p") or len(v["obj"]) == 1:
                warnings.append(f"{where}: {anz} için {o} yuvası kalıpta yok")
    v.setdefault("rahmen", []).append(fr)

# ---------------- Diğer kelimeler (sıfat, zarf, bağlaç, edat …) ----------------
goethe_andere = set()
goethe_stamm = set()
for e in goethe:
    if e["typ"] == "andere":
        h = re.sub(r"\d+\.?$", "", e["head"].lower().replace("(", "").replace(")", ""))
        for teil in re.split(r",\s*|/", h):
            teil = teil.strip()
            goethe_andere.add(teil)
            goethe_andere.add(re.split(r"\s", teil)[0])
            if teil.endswith("-"):
                goethe_stamm.add(teil[:-1])
woerter = []
w_key = {}
KLASSEN = {"adj", "adv", "konj", "präp", "pron", "andere"}
for n, s_ in lines(P("quellen", "woerter.txt")):
    parts = [x.strip() for x in s_.split("|")]
    if len(parts) != 4 or parts[1] not in KLASSEN:
        errors.append(f"woerter.txt:{n}: biçim hatalı: {s_}")
        continue
    de, kl, tier, tr = parts
    w = {"id": f"w{len(woerter) + 1:04d}", "de": de, "kl": kl, "tier": int(tier), "tr": tr}
    if de in w_key:
        errors.append(f"woerter.txt:{n}: '{de}' iki kez")
    w_key[de] = w
    first = re.split(r"[\s…]", de.lower())[0]
    if de.lower() not in goethe_andere and first not in goethe_andere and de.lower() not in ("morgen", "nah") \
            and not any(first.startswith(st) and len(first) - len(st) <= 2 for st in goethe_stamm):
        warnings.append(f"woerter.txt:{n}: '{de}' Goethe listesinde bulunamadı (kontrol et)")
    # Goethe örnek cümleleri (aynı başlık)
    for e in goethe:
        if e["typ"] == "andere":
            h = re.sub(r"\d+\.?$", "", e["head"]).strip()
            # "selb-" → selbe, "ander-" → andere (yalnız sıfat eki); "ein-" → einfach / eingespannt değil
            if h.lower() == de.lower() or h.lower().rstrip("-") == de.lower() or (h.endswith("-") and de.lower().startswith(h.lower()[:-1]) and re.fullmatch(r"(e|er|es|en|em)?", de.lower()[len(h) - 1:])):
                if e["bsp"]:
                    w["bsp"] = e["bsp"][:3]
                    break
    woerter.append(w)

# ---------------- Artikel kuralları (sonek → artikel, veriden) ----------------
SUFFIXE = ["ung", "heit", "keit", "schaft", "ion", "tät", "ei", "ik", "enz", "anz", "ur", "ie", "e",
           "chen", "lein", "ment", "um", "nis", "ma", "ling", "ismus", "ig", "or", "ent", "ant", "ist", "er", "ich", "en", "el"]
lern = [x for x in nomen if not x.get("skip") and not x.get("plOnly") and not x.get("adjN")]
stat = {}
for suf in SUFFIXE:
    hits = [x for x in lern if x["lemma"].lower().endswith(suf) and len(x["lemma"]) > len(suf) + 2]
    if len(hits) < 5:
        continue
    cnt = {}
    for x in hits:
        cnt[x["art"]] = cnt.get(x["art"], 0) + 1
    art, k = max(cnt.items(), key=lambda kv: kv[1])
    acc = k / len(hits)
    if acc >= 0.75:
        stat[suf] = (art, round(acc * 100), len(hits))
regel_n = 0
for x in lern:
    best = None
    for suf in sorted(stat, key=len, reverse=True):
        if x["lemma"].lower().endswith(suf) and len(x["lemma"]) > len(suf) + 2:
            best = suf
            break
    if best:
        art, pct, cnt = stat[best]
        x["regel"] = [best, art, pct, cnt]
        regel_n += 1

# ---------------- Bileşik isim: artikeli son parça belirler (das Jahr → das Frühjahr) ----------------
# Listedeki 223 bileşiğin %95'i baş isimle aynı artikelde. Uymayanlar çoğunlukla sahte bölme (Ant-wort, Ver-lust):
# yalnız artikeli tutan bileşiğe kural yazılır, yanlış kural öğretilmez. İki artikelli başlar hariç.
ZWEI_ART = {"Teil", "See", "Band", "Leiter", "Messer", "Gehalt", "Steuer", "Tor", "Kiefer", "Moment", "Erbe", "Verdienst"}
_lem = {}
for x in lern:
    _lem.setdefault(x["lemma"], x)
kopf_n = 0
for x in lern:
    lem = x["lemma"]
    for i in range(3, len(lem) - 3):
        tail = lem[i:]
        cand = tail[0].upper() + tail[1:]
        k = _lem.get(cand)
        if k is None or cand == lem or cand in ZWEI_ART:
            continue
        if k["art"] == x["art"]:
            x["kopf"] = [cand, k["art"]]
            kopf_n += 1
        break
print(f"bileşik isim kuralı: {kopf_n} isim")

# ---------------- Paketler ----------------
pakete = []
item_by_key = {}
for x in nomen:
    if not x.get("skip"):
        item_by_key.setdefault(f"{x['art']} {x['lemma']}", x["id"])
for v in verben:
    item_by_key.setdefault(v["anz"], v["id"])
for w in woerter:
    item_by_key.setdefault(w["de"], w["id"])
pk = None
modus = None
for n, raw in enumerate(open(P("quellen", "pakete.txt"), encoding="utf-8"), 1):
    line = raw.rstrip("\n")
    if line.startswith("#") and not line.startswith("## "):
        continue
    if line.startswith("## "):
        parts = [x.strip() for x in line[3:].split("|")]
        pk = {"id": parts[0], "titel": parts[1], "titelTr": parts[2], "items": [], "de": "", "tr": "", "zeile": n}
        pakete.append(pk)
        modus = None
        continue
    if pk is None or not line.strip():
        continue
    if line.startswith("wörter:"):
        for k in [x.strip() for x in line.split(":", 1)[1].split(";") if x.strip()]:
            if k not in item_by_key:
                errors.append(f"pakete.txt:{n}: '{k}' bulunamadı")
            else:
                pk["items"].append(item_by_key[k])
        continue
    if line.strip() in ("de:", "tr:"):
        modus = line.strip()[:-1]
        continue
    if modus:
        pk[modus] = (pk[modus] + " " + line.strip()).strip()
for pk in pakete:
    teile, luecken = [], []
    pos = 0
    for m in re.finditer(r"\[\[([^|\]]+)\|([^\]]+)\]\]", pk["de"]):
        teile.append(pk["de"][pos:m.start()])
        form, key = m.group(1), m.group(2)
        iid = item_by_key.get(key)
        if not iid:
            errors.append(f"pakete.txt {pk['id']}: boşluk anahtarı '{key}' bulunamadı")
        elif iid not in pk["items"]:
            errors.append(f"pakete.txt {pk['id']}: '{key}' wörter listesinde yok")
        teile.append(len(luecken))
        luecken.append({"form": form, "id": iid})
        pos = m.end()
    teile.append(pk["de"][pos:])
    for iid in pk["items"]:
        if not any(l["id"] == iid for l in luecken):
            errors.append(f"pakete.txt {pk['id']}: {iid} metinde boşluk olarak geçmiyor")
    if "[[" in "".join(t for t in teile if isinstance(t, str)):
        errors.append(f"pakete.txt {pk['id']}: kapanmamış [[ ]]")
    if not pk["tr"]:
        errors.append(f"pakete.txt {pk['id']}: Türkçe çeviri yok")
    pk["teile"] = teile
    pk["luecken"] = luecken
    del pk["de"], pk["zeile"]
ids = [p_["id"] for p_ in pakete]
if len(ids) != len(set(ids)):
    errors.append("pakete.txt: paket kimliği tekrar ediyor")

# ---------------- Çıktı ----------------
for x in nomen:
    x.pop("g", None)


def dump(name, var, data):
    with open(P("daten", name), "w", encoding="utf-8") as f:
        f.write(f"// OTOMATİK ÜRETİLDİ: tools/build.py — elle düzenleme; quellen/ dosyalarını düzenle.\n")
        f.write(f"window.{var} = ")
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")


# PDF satır kırılmasında yarım kalan Goethe örnekleri ("Herr Huber ist bis zum") gösterilmesin
def tam_satz(b):
    return bool(re.search(r"[.!?…“”\"]$", re.sub(r"(\s*\([^)]*\))+$", "", b.strip())))
def kelime_var(x, b):
    w = (x.get("lemma") or re.split(r"[\s…]", x.get("de") or "")[0] or "").lower()
    return not w or w[:max(3, len(w) - 2)] in b.lower()
for x in verben + nomen + woerter:
    if x.get("bsp"):
        x["bsp"] = [b for b in x["bsp"] if tam_satz(b) and ("inf" in x or kelime_var(x, b))]
dump("verben.js", "VERBEN", verben)
person_ids = {p["id"] for p in personen}
for v in verben:
    for fr in v.get("rahmen", []):
        for sl in fr["o"]:
            for x in sl["n"]:
                if x != "P" and x["id"] in person_ids:
                    x["person"] = True
dump("nomen.js", "NOMEN", {"liste": nomen, "personen": personen, "adjSache": adj_sache, "adjPerson": adj_person})
dump("woerter.js", "WOERTER", woerter)
dump("pakete.js", "PAKETE", pakete)

# Çeviri cümleleri: fiil kimliği | Almanca | Türkçe  (Goethe örnekleri, elle çevrildi)
saetze = {}
vid_set = {v["id"] for v in verben}
sp = P("quellen", "saetze.txt")
if os.path.exists(sp):
    for i, line in enumerate(open(sp, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        if len(parts) != 3 or not all(parts):
            errors.append(f"saetze.txt:{i}: biçim 'fiil | Almanca | Türkçe' olmalı")
            continue
        vid, de, tr = parts
        if vid not in vid_set:
            errors.append(f"saetze.txt:{i}: bilinmeyen fiil {vid}")
            continue
        saetze.setdefault(vid, []).append({"de": de, "tr": tr})
dump("saetze.js", "SAETZE", saetze)

# Dönüşlü fiil cümleleri (aynı biçim)
saetze_refl = {}
rp = P("quellen", "saetze_refl.txt")
if os.path.exists(rp):
    for i, line in enumerate(open(rp, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        if len(parts) != 3 or not all(parts) or parts[0] not in vid_set:
            errors.append(f"saetze_refl.txt:{i}: biçim ya da fiil hatalı")
            continue
        saetze_refl.setdefault(parts[0], []).append({"de": parts[1], "tr": parts[2]})
dump("saetze_refl.js", "SAETZE_REFL", saetze_refl)

# Kelime cümleleri: öğe | hedef kelime | Almanca | Türkçe (isim ve diğer kelimeler; Goethe örnekleri)
nsaetze = {}
np_ = P("quellen", "wort_saetze.txt")
w_ids = {n["id"] for n in nomen} | {w["id"] for w in woerter}
if os.path.exists(np_):
    for i, line in enumerate(open(np_, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        if len(parts) != 4 or not all(parts) or parts[0] not in w_ids:
            errors.append(f"wort_saetze.txt:{i}: biçim ya da öğe hatalı")
            continue
        nsaetze.setdefault(parts[0], []).append({"de": parts[2], "tr": parts[3]})
dump("nsaetze.js", "NSAETZE", nsaetze)

# Cümle sözlüğü: Almanca cümle | "die Regierung = hükümet; …" (tam cümle sorusunda bilinmeyen kelimelere yardım)
glossen = {}
gp = P("quellen", "glossen.txt")
if os.path.exists(gp):
    for line in open(gp, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#") or "|" not in line:
            continue
        de, g = line.rsplit("|", 1)
        de, g = de.strip(), g.strip()
        if g and g != "-":
            glossen[de] = g
dump("glossen.js", "GLOSSEN", glossen)

# Okuma soruları: "## p01" + "ifade | r/f"
lesen, cur = {}, None
lp = P("quellen", "lesen.txt")
if os.path.exists(lp):
    for i, line in enumerate(open(lp, encoding="utf-8"), 1):
        line = line.strip()
        if not line or (line.startswith("#") and not line.startswith("##")):
            continue
        if line.startswith("##"):
            cur = line[2:].strip()
            if cur not in {p["id"] for p in pakete}:
                errors.append(f"lesen.txt:{i}: bilinmeyen paket {cur}")
            lesen[cur] = []
            continue
        satz, rf = [x.strip() for x in line.rsplit("|", 1)]
        if rf not in ("r", "f") or cur is None:
            errors.append(f"lesen.txt:{i}: 'ifade | r/f' olmalı")
            continue
        lesen[cur].append({"s": satz, "r": rf == "r"})
dump("lesen.js", "LESEN", lesen)
# Okuma metinleri: Klexikon, tools ile çekildi
lt = P("quellen", "lesetexte.json")
dump("lesetexte.js", "LESETEXTE", json.load(open(lt, encoding="utf-8")) if os.path.exists(lt) else [])
# DW Top-Thema: tools/dw_topthema.py
lt2 = P("quellen", "lesetexte_dw.json")
dw = json.load(open(lt2, encoding="utf-8")) if os.path.exists(lt2) else []
for x in dw:
    ps = x["text"].split("\n")
    if ps and ps[0].strip() == x["titel"].strip():
        x["text"] = "\n".join(ps[1:])
dump("lesetexte_dw.js", "LESETEXTE_DW", dw)
# Ünite (kitaptaki konu): quellen/unite1*.txt → daten/unite.js
def unite_lesen(nr):
    f = P("quellen", f"unite{nr}.txt")
    if not os.path.exists(f): return None
    U = {"id": f"u{nr}", "titel": "", "items": [], "texte": [], "aufgaben": []}
    gruppe = ""
    for line in open(f, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"): continue
        if line.startswith("@titel "): U["titel"] = line[7:].strip(); continue
        if line.strip() == "@geschlossen": U["geschlossen"] = True; continue
        if line.startswith("@bis "): U["bis"] = line[5:].strip(); continue  # bu gün bitince kendiliğinden kapanır
        if line.strip() == "@inaktiv": U["inaktiv"] = True; continue
        if line.startswith("@kapitel "): U["kapitel"] = line[9:].strip(); continue  # Netzwerk neu Kapitel no (gramer konuları eşleşir)  # Tuna Ayarlar'dan açana kadar kapalı (kitapta henüz gelmemiş Kapitel)
        if line.startswith("@gruppe "): gruppe = line[8:].strip(); continue
        p = [x.strip() for x in line.split("|")]
        if len(p) != 7: errors.append(f"unite{nr}: {line}"); continue
        typ, de, ex, tr, bsp, lk, bsptr = p
        if lk and lk not in bsp: errors.append(f"unite{nr}: boşluk '{lk}' cümlede yok: {bsp}")
        it = {"id": f"u{nr}-{len(U['items'])+1:03d}", "typ": typ, "de": de, "ex": ex, "tr": tr, "bsp": bsp, "lk": lk, "bspTr": bsptr, "gruppe": gruppe}
        if typ == "n":
            it["art"], it["lemma"] = de.split(" ", 1)
        m = re.search(r"([\wäöüß]+(?: [\wäöüß]+)?, [\wäöüß]+(?: [\wäöüß]+)?, (?:hat|ist) [\wäöüß]+)", ex)
        if typ == "v" and m: it["formen"] = m.group(1)
        U["items"].append(it)
    ft = P("quellen", f"unite{nr}_texte.txt")
    if os.path.exists(ft):
        cur = None
        for line in open(ft, encoding="utf-8"):
            line = line.rstrip("\n")
            if line.startswith("#") and not line.startswith("## "): continue
            if line.startswith("## "): cur = {"titel": line[3:].strip(), "tr": None, "teile": []}; U["texte"].append(cur); continue
            if cur is None or not line.strip(): continue
            if cur["tr"] is None: cur["tr"] = line.strip(); continue
            for i, part in enumerate(re.split(r"\[([^\]]+)\]", line)):
                if i % 2: cur["teile"].append({"f": part})
                elif part: cur["teile"].append(part)
    fa = P("quellen", f"unite{nr}_aufgaben.txt")
    if os.path.exists(fa):
        for line in open(fa, encoding="utf-8"):
            if not line.strip() or line.startswith("#"): continue
            t, de, tr, w = [x.strip() for x in line.split("|")]
            U["aufgaben"].append({"id": f"u{nr}-a{len(U['aufgaben'])+1}", "titel": t, "de": de, "tr": tr, "woerter": [x.strip() for x in w.split(";")]})
    return U
_un = [u for u in [unite_lesen(n) for n in range(1, 13)] if u]  # quellen/unite1..12.txt (varsa)
dump("unite.js", "UNITE", _un)
print(f"ünite: {sum(len(u['items']) for u in _un)} kelime, {sum(len(u['texte']) for u in _un)} metin")
# Goethe Zertifikat B1 Übungssatz, Lesen Teil 1–5: orijinal sorular + çözümler
gl = P("quellen", "goethe_lesen.json")
dump("goethe_lesen.js", "GOETHE_LESEN", json.load(open(gl, encoding="utf-8")) if os.path.exists(gl) else [])

# Kalıplar: yazma (tür / konu) ve fiil kalıpları
redemittel, kaliplar = {}, {}
for fn, ziel, gecerli in (("redemittel.txt", redemittel, None), ("kaliplar.txt", kaliplar, vid_set)):
    fp = P("quellen", fn)
    if not os.path.exists(fp):
        continue
    for i, line in enumerate(open(fp, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        if len(parts) != 3 or not all(parts) or (gecerli is not None and parts[0] not in gecerli):
            errors.append(f"{fn}:{i}: 'anahtar | Almanca | Türkçe' olmalı")
            continue
        ziel.setdefault(parts[0], []).append({"de": parts[1], "tr": parts[2]})
dump("kaliplar.js", "KALIPLAR", {"yazma": redemittel, "fiil": kaliplar})

# Serbest yazma görevleri
aufgaben = []
ap = P("quellen", "aufgaben.txt")
if os.path.exists(ap):
    for i, line in enumerate(open(ap, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        if len(parts) != 5:
            errors.append(f"aufgaben.txt:{i}: 5 alan olmalı")
            continue
        aufgaben.append({"id": f"a{len(aufgaben) + 1:02d}", "thema": parts[0], "typ": parts[1], "min": int(parts[2]), "de": parts[3], "tr": parts[4]})
dump("aufgaben.js", "AUFGABEN", aufgaben)

# Konular (Goethe/telc B1 Themen): "@ id | Almanca | Türkçe" tanımlar, "öğe | konu1,konu2" atamalar
themen, th_by = [], {}
tp = P("quellen", "themen.txt")
alle_ids = {n["id"] for n in nomen if not n.get("skip")} | {v["id"] for v in verben} | {w["id"] for w in woerter}
if os.path.exists(tp):
    for i, line in enumerate(open(tp, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("@"):
            tid, de, tr = [x.strip() for x in line[1:].split("|")]
            th_by[tid] = {"id": tid, "de": de, "tr": tr, "items": []}
            themen.append(th_by[tid])
            continue
        iid, ts = [x.strip() for x in line.split("|")]
        if iid not in alle_ids:
            warnings.append(f"themen.txt:{i}: bilinmeyen öğe {iid}")
            continue
        for t in [x.strip() for x in ts.split(",") if x.strip() and x.strip() != "-"]:
            if t not in th_by:
                errors.append(f"themen.txt:{i}: bilinmeyen konu {t}")
            else:
                th_by[t]["items"].append(iid)
dump("themen.js", "THEMEN", themen)

print(f"{len(verben)} fiil anlamı ({sum(1 for v in verben if v.get('rahmen'))} kalıplı), "
      f"{len(nomen)} isim, {len(personen)} kişi, {len(adj_sache) + len(adj_person)} sıfat, "
      f"{len(woerter)} diğer kelime, {len(pakete)} paket, {regel_n} isimde artikel kuralı, "
      f"{sum(len(x) for x in saetze.values())} çeviri cümlesi ({len(saetze)} fiil), "
      f"{sum(len(x) for x in saetze_refl.values())} dönüşlü cümle, {sum(len(x) for x in nsaetze.values())} kelime cümlesi, {len(aufgaben)} yazma görevi, "
      f"{len(themen)} konu: " + ", ".join(f"{t['id']} {len(t['items'])}" for t in themen))
print("artikel kuralları:", ", ".join(f"-{k}→{v[0]} %{v[1]} ({v[2]})" for k, v in sorted(stat.items(), key=lambda kv: -kv[1][1])))
# ================= Gramer: quellen/grammatik/*.txt → daten/grammatik.js =================
# Biçim: quellen/grammatik/FORMAT.md. Alıştırma kimliği dosyadaki sıra (yeni alıştırma hep sona). Hata build'i durdurur, dağılım kuralları uyarı.
G_TUREN = {"luecke", "wahl", "ordnen", "fehler", "umform"}
G_KOPF_PFLICHT = ["id", "titel", "tr", "stufe", "goethe", "kurz"]
G_KOPF_ERLAUBT = set(G_KOPF_PFLICHT) | {"kapitel", "voraus", "kontrast", "etiket"}
def g_norm(x):
    x = re.sub(r"\s+", " ", x.strip()); x = re.sub(r"\s+([,.!?])", r"\1", x); x = x.rstrip(".!?").strip()
    return x[:1].lower() + x[1:]
def g_tokens(x): return sorted(w.lower() for w in re.findall(r"[\wäöüÄÖÜß-]+", x))
def g_alts(f): return [a.strip() for a in f.split(" / ") if a.strip()]
def g_wortschatz():
    keys = set()
    for fn in ("verben.txt", "woerter.txt", "nomen.txt", "nomen_extra.txt"):
        for z in open(P("quellen", fn), encoding="utf-8"):
            if z.strip() and not z.startswith("#") and "|" in z: keys.add(z.split("|")[0].strip())
    for fn in sorted(glob.glob(P("quellen", "unite*.txt"))):
        if "_" in os.path.basename(fn): continue
        for z in open(fn, encoding="utf-8"):
            t = [x.strip() for x in z.split("|")]
            if len(t) >= 4 and t[0] in ("n", "v", "a", "x", "k"): keys.add(t[1])
    return keys
def grammatik_lesen(pfad, ws):
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
                if len(t) != 3 or not re.fullmatch(r"[a-z0-9-]+", t[0]): errors.append(f"{name}:{nr}: @teil 'kod | ad | etiket' olmalı"); continue
                if t[0] in teile: errors.append(f"{name}:{nr}: @teil {t[0]} iki kez")
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
        if not soru or not cevap or not tr or not acik: errors.append(f"{name}:{nr}: soru / cevap / Türkçe / açıklama boş olamaz")
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
    aktiv = [u for u in ueb if not u.get("aus")]
    if len(aktiv) < 20: warnings.append(f"{name}: {len(aktiv)} alıştırma (en az 20)")
    tc = collections.Counter(u["tur"] for u in aktiv)
    for t in G_TUREN:
        if tc[t] < 2: warnings.append(f"{name}: tür '{t}' {tc[t]} kez (en az 2)")
    if tc["fehler"] and not any(u.get("hata") == "-" for u in aktiv if u["tur"] == "fehler"): warnings.append(f"{name}: hiç 'hata yok' alıştırması yok")
    return kopf.get("id", name[:-4]), {
        "kopf": {"titel": kopf.get("titel", ""), "tr": kopf.get("tr", ""), "stufe": kopf.get("stufe", ""), "kapitel": kopf.get("kapitel", ""),
                 "goethe": {"stufe": int(gm.group(1)) if gm else 1, "wo": gm.group(2) if gm else ""},
                 "voraus": [x.strip() for x in kopf.get("voraus", "").split(",") if x.strip()], "kontrast": [x.strip() for x in kopf.get("kontrast", "").split(",") if x.strip()],
                 "etiket": kopf.get("etiket", ""), "kurz": kopf.get("kurz", "")},
        "erklaerung": "\n".join(erkl).strip(), "tabellen": tabellen, "beispiele": beispiele, "teile": teile, "uebungen": ueb}
import glob, collections
_gws = g_wortschatz()
grammatik = {}
for _gf in sorted(glob.glob(P("quellen", "grammatik", "*.txt"))):
    _gid, _g = grammatik_lesen(_gf, _gws)
    grammatik[_gid] = _g
for _gid, _g in grammatik.items():
    for _v in _g["kopf"]["voraus"] + _g["kopf"]["kontrast"]:
        if _v not in grammatik: warnings.append(f"grammatik/{_gid}: @voraus/@kontrast '{_v}' yok")
dump("grammatik.js", "GRAMMATIK", grammatik)
print(f"gramer: {len(grammatik)} konu, {sum(len(g['uebungen']) for g in grammatik.values())} alıştırma")

# index.html: js/css/daten dosyalarına içerik özeti (?v=) → tarayıcı önbelleği eski sürümü göstermez
import hashlib
def _surum(m):
    f = P(m.group(2))
    if not os.path.exists(f): return m.group(0)
    return m.group(1) + m.group(2) + "?v=" + hashlib.md5(open(f, "rb").read()).hexdigest()[:8] + '"'
_ih = P("index.html")
_alt = open(_ih, encoding="utf-8").read()
_neu = re.sub(r'((?:src|href)=")((?:js|css|daten)/[^"?]+)(?:\?v=[0-9a-f]+)?"', _surum, _alt)
if _neu != _alt:
    open(_ih, "w", encoding="utf-8").write(_neu)
# sw.js: önbelleğe alınacak dosyalar (index.html'deki ?v= adresleri + simgeler) ve sürüm (hepsinin özeti)
_assets = ["./", "manifest.webmanifest", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "img/apple-touch-icon.png", "img/icon.svg"]
_assets += re.findall(r'(?:src|href)="((?:js|css|daten)/[^"]+\?v=[0-9a-f]+)"', _neu)
_sw = P("sw.js")
if os.path.exists(_sw):
    _ver = hashlib.md5((_neu + "".join(_assets)).encode("utf-8")).hexdigest()[:10]
    _salt = open(_sw, encoding="utf-8").read()
    _swneu = re.sub(r"/\*VERSION\*/.*?/\*VERSION_END\*/", "/*VERSION*/'" + _ver + "'/*VERSION_END*/", _salt)
    _swneu = re.sub(r"/\*ASSETS\*/.*?/\*ASSETS_END\*/", lambda m: "/*ASSETS*/" + json.dumps(_assets, ensure_ascii=False) + "/*ASSETS_END*/", _swneu, flags=re.S)
    if _swneu != _salt:
        open(_sw, "w", encoding="utf-8").write(_swneu)
for w in warnings:
    print("uyarı:", w)
for e in errors:
    print("HATA:", e)
sys.exit(1 if errors else 0)
