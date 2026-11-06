# DW Top-Thema (B1) metinlerini çeker: RSS'teki son dersler → tam metin + DW sözlüğü + ses adresi (mp3).
# Kaynak her metnin altında. Kullanım: python3 tools/dw_topthema.py
# Ses (6.11): kayıtlı ama sesi olmayan eski metinlerin sesi yeniden aranır: önce RSS'teki <enclosure> (podcast mp3), sonra ders sayfasının
# JSON'u; RSS'ten düşmüş eski kayıtlarda saklı url'deki sayfa. Uygulama sesi DW adresinden çalar, dosya kopyalanmaz.
# Ağ yoksa (ya da sayfa açılmazsa) kayıtlar olduğu gibi kalır.
import json, re, html, os, urllib.request, urllib.parse
UA = {'User-Agent': 'Mozilla/5.0'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(u, safe=':/?=&%'), headers=UA), timeout=30).read().decode('utf-8', 'ignore')
ziel = os.path.join(os.path.dirname(__file__), '..', 'quellen', 'lesetexte_dw.json')
alt = {x['id']: x for x in json.load(open(ziel, encoding='utf-8'))} if os.path.exists(ziel) else {}


def ders(link):
    """ders sayfasındaki gömülü JSON (Apollo durumu)"""
    s = get(link)
    return json.loads(re.search(r'window\.__\w+__\s*=\s*(\{.*?\});?\s*</script>', s, re.S).group(1))


def ses_bul(d):
    """dersin JSON'undaki Audio nesnesi (mp3Src vb.) ya da ham metindeki ilk .mp3 adresi"""
    for v in d.values():
        if isinstance(v, dict) and 'Audio' in str(v.get('__typename', '')):
            for vv in v.values():
                if isinstance(vv, str) and '.mp3' in vv:
                    return vv
    mm = re.search(r'https?://[^"\s]+\.mp3', json.dumps(d))
    return mm.group(0) if mm else ''


try:
    rss = get('https://rss.dw.com/xml/DKpodcast_topthemamitvokabeln_de')
except Exception as e:
    print('RSS açılmadı:', e); rss = ''
rss_ids = set()
for item in rss.split('<item>')[1:]:
    mg = re.search(r'<guid[^>]*>(\d+)</guid>', item)
    if not mg: continue
    lid = mg.group(1); rss_ids.add(lid)
    titel = html.unescape(re.search(r'<title>(.*?)</title>', item, re.S).group(1)).strip()
    link = re.search(r'<link>(.*?)</link>', item).group(1).split('?')[0]
    enc = re.search(r'<enclosure[^>]*\burl="([^"]+\.mp3[^"]*)"', item)
    enc = html.unescape(enc.group(1)) if enc else ''
    if lid in alt:
        if alt[lid].get('audio'): continue
        # kayıtlı ama sessiz: RSS mp3'ü, yoksa ders sayfası
        audio = enc
        if not audio:
            try: audio = ses_bul(ders(alt[lid].get('url') or link))
            except Exception as e: print('ses bulunamadı', titel, e)
        if audio:
            alt[lid]['audio'] = audio; print('ses eklendi', titel)
        continue
    try:
        d = ders(link)
    except Exception as e:
        print('atlandı', titel, e); continue
    les = d.get('Lesson:' + lid, {})
    man = les.get('manuscript') or ''
    paras = [html.unescape(re.sub(r'<[^>]+>', '', p)).strip() for p in re.split(r'</p>|<br\s*/?>', man)]
    paras = [p for p in paras if p and not p.startswith('Arbeitsauftrag') and not p.lower().startswith('autor')]
    gloss = [{'de': html.unescape(v['shortTitle']).strip(), 'erkl': html.unescape(re.sub(r'<[^>]+>', '', v['text'])).strip()}
             for v in d.values() if isinstance(v, dict) and v.get('__typename') == 'Knowledge' and v.get('knowledgeType') == 'GLOSSARY' and v.get('shortTitle')]
    audio = ses_bul(d) or enc
    alt[lid] = {'id': lid, 'quelle': 'DW Top-Thema', 'titel': titel, 'text': '\n'.join(paras), 'glossar': gloss, 'url': link, 'audio': audio}
    print('ok', titel, len(' '.join(paras).split()), 'kelime', len(gloss), 'sözlük', 'ses' if audio else 'sessiz')

# RSS'ten düşmüş sessiz eski kayıtlar: saklı adresteki ders sayfası
for lid, x in alt.items():
    if x.get('audio') or lid in rss_ids or not x.get('url'): continue
    try:
        a = ses_bul(ders(x['url']))
    except Exception as e:
        print('ses bulunamadı', x.get('titel'), e); continue
    if a:
        x['audio'] = a; print('ses eklendi', x.get('titel'))

json.dump(list(alt.values()), open(ziel, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(alt), 'metin,', sum(1 for x in alt.values() if x.get('audio')), 'sesli')
