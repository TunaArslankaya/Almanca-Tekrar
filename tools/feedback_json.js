// daten/feedback.js (elle yazılan JS dizisi) → log/feedback.json: uygulama GitHub API ile bu dosyayı çeker, Geçmiş'te gösterir
// (gece işinin düzeltmeleri index.html yeniden yüklenmeden de gelsin). Kullanım: node tools/feedback_json.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const kok = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(kok, 'daten', 'feedback.js'), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const fb = ctx.window.FEEDBACK;
if (!Array.isArray(fb)) { console.error('daten/feedback.js: window.FEEDBACK dizisi bulunamadı'); process.exit(1); }
const temiz = fb.filter(f => f && typeof f === 'object').map(f => ({ zeit: String(f.zeit || ''), id: String(f.id || ''), antwort: String(f.antwort || ''), richtig: String(f.richtig || ''), urteil: String(f.urteil || ''), text: String(f.text || '') }));
fs.writeFileSync(path.join(kok, 'log', 'feedback.json'), JSON.stringify(temiz, null, 0) + '\n');
console.log(temiz.length, 'düzeltme → log/feedback.json');
