const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'assets/data/vice-colors.json');
const VICE_HTML_DIR = path.join(ROOT, 'color-sources', 'vice');

const LOCALES = [
  { lang: 'en', file: 'en.html' },
  // Si en el futuro añades variantes localizadas, extiende esta lista.
  // { lang: 'es', file: 'es.html' },
  // { lang: 'de', file: 'de.html' },
];

function parseLocaleFile(lang, fileName, colorsByCode) {
  const filePath = path.join(VICE_HTML_DIR, fileName);
  const html = fs.readFileSync(filePath, 'utf8');

  // Estructura:
  //
  // <div class="m-item_color" data-id="2340" style="background-color: #f8d696">
  //   ...
  //   <div class="m-info_text">
  //     <div class="m-info_title">
  //       <strong>Color name</strong>
  //       <span> Skinny Yellow </span>
  //     </div>
  //     ...
  //     <strong>HEX</strong><span>#f8d696</span>
  //   </div>
  //   ...
  //   <div class="m-section_color">
  //     <div class="m-text">
  //       <a ... class="icon-info"></a>
  //       Skinny Yellow
  //     </div>
  //   </div>
  // </div>
  //
  // No hay código tipo "RV-..." en Vice, así que usaremos el nombre como code.
  const blockRegex =
    /<div\s+class="[^"]*\bm-item_color\b[^"]*"[^>]*style="[^"]*background-color:\s*#([0-9a-fA-F]{6})[^"]*"[\s\S]*?<div\s+class="m-info_text">([\s\S]*?)<\/div>[\s\S]*?<div\s+class="m-section_color">[\s\S]*?<div\s+class="m-text">([\s\S]*?)<\/div>/gi;

  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const bgHex = match[1];
    const infoTextHtml = match[2];
    const textLineHtml = match[3];

    // HEX preferente desde el bloque de info: <strong>HEX</strong><span>#f8d696</span>
    let hex = null;
    const hexInfoMatch = /<strong>\s*HEX\s*<\/strong>\s*<span>\s*(#[0-9a-fA-F]{6})\s*<\/span>/i.exec(
      infoTextHtml
    );
    if (hexInfoMatch) {
      hex = hexInfoMatch[1].toUpperCase();
    } else {
      hex = `#${bgHex.toUpperCase()}`;
    }

    // Línea tipo: '<a ... class="icon-info"></a> Skinny Yellow'
    let text = textLineHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) continue;

    const name = text;

    // No hay código RV-..., así que usamos el nombre como code.
    const code = name;

    const key = code;

    if (!colorsByCode[key]) {
      colorsByCode[key] = {
        seriesId: 'vice',
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
  console.log(`Written ${result.length} Vice colors to ${OUTPUT_PATH}`);
}

main();

