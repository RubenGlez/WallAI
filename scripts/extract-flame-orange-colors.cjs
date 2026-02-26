const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'assets/data/flame-orange-colors.json');
const FLAME_HTML_DIR = path.join(ROOT, 'color-sources', 'flame-orange');

const LOCALES = [
  { lang: 'en', file: 'en.html' },
  // Si en el futuro añades variantes localizadas, extiende esta lista.
  // { lang: 'de', file: 'de.html' },
  // { lang: 'es', file: 'es.html' },
];

function parseLocaleFile(lang, fileName, colorsByCode) {
  const filePath = path.join(FLAME_HTML_DIR, fileName);
  const html = fs.readFileSync(filePath, 'utf8');

  // Estructura:
  // <div class="flame-color-wrap" data-tooltip="vanilla FO-100">
  //   <span class="flame-color ..." style="background-color: #f0e082"></span>
  // </div>
  //
  // Extraemos:
  // - name: "vanilla"
  // - code: "FO-100"
  // - hex: el valor de background-color (#xxxxxx).
  const blockRegex =
    /class="flame-color-wrap"[^>]*\sdata-tooltip="([\s\S]*?)"[\s\S]*?class="flame-color\b[\s\S]*?style="([\s\S]*?)"/gi;

  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const tooltip = match[1];
    const style = match[2];

    // tooltip: "vanilla FO-100"
    let tooltipText = tooltip.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (!tooltipText) continue;

    const parts = tooltipText.split(' ');
    if (parts.length < 2) continue;
    const code = parts.pop().trim(); // "FO-100"
    const name = parts.join(' ').trim(); // "vanilla"
    if (!code || !name) continue;

    // style: background-color: #f0e082
    const hexMatch =
      /background-color:\s*#([0-9a-fA-F]{6})\b/i.exec(style);
    if (!hexMatch) continue;

    const hex = `#${hexMatch[1].toUpperCase()}`;

    const key = code;

    if (!colorsByCode[key]) {
      colorsByCode[key] = {
        seriesId: 'flame-orange',
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
  console.log(`Written ${result.length} FLAME Orange colors to ${OUTPUT_PATH}`);
}

main();

