const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'assets/data/montana-94-colors.json');
const M94_HTML_DIR = path.join(ROOT, 'color-sources', 'montana-94');

const LOCALES = [
  { lang: 'en', file: 'en.html' },
  // Si en el futuro añades variantes localizadas, extiende esta lista.
  // { lang: 'es', file: 'es.html' },
  // { lang: 'de', file: 'de.html' },
];

function parseLocaleFile(lang, fileName, colorsByCode) {
  const filePath = path.join(M94_HTML_DIR, fileName);
  const html = fs.readFileSync(filePath, 'utf8');

  // Estructura: cada color es un div con class m-item_color y style background-color.
  // El tag de apertura puede tener atributos en varias líneas (class, data-id, style),
  // así que buscamos el cierre del tag con (?:(?!>)[\s\S])*?> y permitimos
  // class y style en cualquier orden.
  const blockRegex =
    /<div\s+(?:(?!>)[\s\S])*?(?:style="[^"]*background-color:\s*#([0-9a-fA-F]{6})[^"]*"(?:(?!>)[\s\S])*?class="[^"]*\bm-item_color\b[^"]*"|class="[^"]*\bm-item_color\b[^"]*"(?:(?!>)[\s\S])*?style="[^"]*background-color:\s*#([0-9a-fA-F]{6})[^"]*")(?:(?!>)[\s\S])*?>[\s\S]*?<div\s+class="m-section_color">[\s\S]*?<div\s+class="m-text">([\s\S]*?)<\/div>/gi;

  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const bgHex = match[1] || match[2]; // style puede ir antes o después de class
    const textLineHtml = match[3];

    const hex = `#${bgHex.toUpperCase()}`;

    // Línea tipo: '<a ... class="icon-info"></a> RV-189 Ipanema Yellow'
    let text = textLineHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) continue;

    const parts = text.split(' ');
    if (parts.length < 2) continue;

    const code = parts.shift().trim(); // "RV-189"
    const name = parts.join(' ').trim(); // "Ipanema Yellow"

    if (!code || !name) continue;

    const key = code;

    if (!colorsByCode[key]) {
      colorsByCode[key] = {
        seriesId: 'montana-94',
        hex,
        code: key,
        name: {},
      };
    }

    colorsByCode[key].name[lang] = name;
  }
}

function getUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return [
    crypto.randomBytes(4).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(6).toString('hex'),
  ].join('-');
}

function main() {
  const colorsByCode = {};

  for (const { lang, file } of LOCALES) {
    parseLocaleFile(lang, file, colorsByCode);
  }

  const codes = Object.keys(colorsByCode).sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
  );

  const result = codes.map((code) => {
    const fromHtml = colorsByCode[code];
    const id = getUuid();
    const seriesId = fromHtml.seriesId;
    const hex = fromHtml.hex;

    return {
      id,
      seriesId,
      hex,
      code: code,
      name: fromHtml.name,
    };
  });

  const json = JSON.stringify(result, null, 2);
  fs.writeFileSync(OUTPUT_PATH, json, 'utf8');
  console.log(`Written ${result.length} Montana 94 colors to ${OUTPUT_PATH}`);
}

main();

