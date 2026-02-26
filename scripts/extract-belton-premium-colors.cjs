const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'assets/data/belton-premium-colors.json');
const BELTON_HTML_DIR = path.join(ROOT, 'color-sources', 'belton-premium');

const LOCALES = [
  { lang: 'en', file: 'en.html' },
  // If you later add localized HTML variants, extend this list
  // { lang: 'es', file: 'es.html' },
];

function parseLocaleFile(lang, fileName, colorsByCode) {
  const filePath = path.join(BELTON_HTML_DIR, fileName);
  const html = fs.readFileSync(filePath, 'utf8');

  // Cada color es un <tr> con style="background: #xxxxxx" o data-color="#xxxxxx",
  // y luego <span class="nombreLotes"> y <span class="referenciaLotes">.
  // El tag <tr> puede tener atributos en varias líneas y en cualquier orden.
  const rowRegex =
    /<tr\s+(?:(?!>)[\s\S])*?(?:style="[^"]*background:\s*#([0-9a-fA-F]{6})[^"]*"|data-color="#([0-9a-fA-F]{6})")(?:(?!>)[\s\S])*?>[\s\S]*?<span\s+class="nombreLotes">([\s\S]*?)<\/span>[\s\S]*?<span\s+class="referenciaLotes">([\s\S]*?)<\/span>/gi;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const hexFromStyle = match[1];
    const hexFromData = match[2];
    const rawName = match[3];
    const rawRef = match[4];

    const hex = `#${(hexFromStyle || hexFromData).toUpperCase()}`;

    // Clean name like "001. Jasmin yellow"
    let nameText = rawName
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Strip leading "001." prefix if present
    nameText = nameText.replace(/^\d+\.\s*/, '').trim();

    // Reference code as in "327.001"
    const codeText = rawRef
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!codeText || !nameText) continue;

    const key = codeText;

    if (!colorsByCode[key]) {
      colorsByCode[key] = {
        seriesId: 'belton-premium',
        hex,
        code: key,
        name: {},
      };
    }

    colorsByCode[key].name[lang] = nameText;
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
  console.log(`Written ${result.length} Belton Premium colors to ${OUTPUT_PATH}`);
}

main();

