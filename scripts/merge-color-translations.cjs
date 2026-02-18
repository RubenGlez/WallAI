/**
 * Merge colors-translations.json into colors.json.
 * Each color gets a "name" object: { "en": "...", "de": "...", ... }
 * Run: node scripts/merge-color-translations.cjs
 */

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const COLORS_PATH = path.join(ROOT, 'assets/data/colors.json');
const TRANSLATIONS_PATH = path.join(ROOT, 'assets/data/colors-translations.json');

const colors = JSON.parse(fs.readFileSync(COLORS_PATH, 'utf8'));
const translationsList = JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf8'));

const translationsByColorId = {};
for (const t of translationsList) {
  translationsByColorId[t.id] = t.translations || {};
}

const merged = colors.map((c) => {
  const name = translationsByColorId[c.id] || {};
  return {
    id: c.id,
    seriesId: c.seriesId,
    hex: c.hex,
    code: c.code,
    name: Object.keys(name).length > 0 ? name : undefined,
  };
});

// Remove undefined name to keep JSON smaller (optional: keep {} for consistency)
const output = merged.map((c) => {
  const o = { id: c.id, seriesId: c.seriesId, hex: c.hex, code: c.code };
  if (c.name && Object.keys(c.name).length > 0) o.name = c.name;
  return o;
});

fs.writeFileSync(COLORS_PATH, JSON.stringify(output, null, 2), 'utf8');
console.log('Merged', output.length, 'colors. Colors with name:', output.filter((c) => c.name).length);
