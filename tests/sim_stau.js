// Birikme simülasyonu (Playwright gerekir; e2e_smoke ile aynı anda çalıştırma): node tests/sim_stau.js [log/zustand.json]
// v5: birikme yayma (stauVerteilen) kalktı; vadeliler R sırasıyla erir, yeni kelime kotası birikmeye bağlı.
// Bu dosya tests/sim_akis.js'in gerçek durum kopyasıyla ince sarmalayıcısıdır: 14 gün, K=36, δ −0,4, 3 tohum.
const path = require('path');
const { spawnSync } = require('child_process');
const r = spawnSync(process.execPath, [path.join(__dirname, 'sim_akis.js'), process.argv[2] || 'log/zustand.json', '14', '36', '-0.4', '3'], { stdio: 'inherit' });
process.exit(r.status == null ? 1 : r.status);
