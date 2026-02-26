/**
 * Add precomputed LAB to color JSON files for faster closest-color matching.
 * Run: node scripts/add-lab-to-colors.cjs
 *
 * Reads each *-colors.json in assets/data, adds a "lab": { "l", "a", "b" } to every
 * color with a valid hex, then writes back. Uses the same formula as colord (CIELAB).
 */

const fs = require('fs');
const path = require('path');
const { colord, extend } = require('colord');
const labPlugin = require('colord/plugins/lab');

extend([labPlugin]);

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets/data');

function hexToLab(hex) {
  const c = colord(hex);
  if (!c.isValid()) return null;
  const lab = c.toLab();
  return { l: Math.round(lab.l * 100) / 100, a: Math.round(lab.a * 100) / 100, b: Math.round(lab.b * 100) / 100 };
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    console.warn('Skip (not an array):', filePath);
    return 0;
  }
  let added = 0;
  const out = data.map((item) => {
    if (!item || typeof item.hex !== 'string') return item;
    const lab = hexToLab(item.hex);
    if (!lab) return item;
    added++;
    return { ...item, lab };
  });
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2), 'utf8');
  return added;
}

const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('-colors.json'));
let total = 0;
for (const f of files) {
  const filePath = path.join(DATA_DIR, f);
  const n = processFile(filePath);
  total += n;
  console.log(f + ': added lab to ' + n + ' colors');
}
console.log('Total: added lab to ' + total + ' colors in ' + files.length + ' files');
