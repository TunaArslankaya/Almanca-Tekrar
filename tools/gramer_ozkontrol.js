// Gramer öz denetimi: her alıştırmanın kendi doğru cevabı motorda (js/gramer.js pruef) "richtig" mi; kategori / eslestir yinelenen öğe.
// Kullanım: python3 tools/build.py && node tools/gramer_ozkontrol.js [konu ...]   (konu verilmezse hepsi)
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..');
global.window = {}; window.G = require(ROOT + '/js/grammatik.js');
eval(fs.readFileSync(ROOT + '/daten/grammatik.js', 'utf8')); eval(fs.readFileSync(ROOT + '/js/gramer.js', 'utf8'));
const Gr = window.Gramer, sec = process.argv.slice(2); let n = 0; const bad = [];
for (const id in Gr.GR) {
  if (sec.length && !sec.includes(id)) continue;
  for (const u of Gr.GR[id].uebungen || []) {
    const T = u.tur; let giris;
    if (T === 'wahl' || (T === 'luecke' && u.opt)) giris = u.cevap[0];
    else if (T === 'luecke') giris = u.cevap[0].split(' ; ');
    else if (T === 'text') giris = u.parcalar.map(p => p[0]);
    else if (T === 'eslestir') giris = u.sol.map((_, i) => i);
    else if (T === 'kategori') { giris = {}; u.gruplar.forEach((g, gi) => g.oge.forEach(o => { giris[o] = gi; })); }
    else if (T === 'fehler') continue;
    else giris = u.cevap[0];
    n++; const r = Gr.pruef(u, giris); if (r.urteil !== 'richtig') bad.push(`${id}:${u.n} ${T} ${r.urteil} ${JSON.stringify(giris)}`);
    if (T === 'kategori') { const all = u.gruplar.flatMap(g => g.oge); if (new Set(all).size !== all.length) bad.push(`${id}:${u.n} kategori yinelenen öğe`); }
    if (T === 'eslestir' && new Set(u.sag).size !== u.sag.length) bad.push(`${id}:${u.n} eslestir yinelenen sağ`);
  }
}
console.log(n, 'denendi,', bad.length, 'sorun'); if (bad.length) console.log(bad.slice(0, 60).join('\n'));
process.exit(bad.length ? 1 : 0);
