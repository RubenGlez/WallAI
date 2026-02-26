const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'assets/data/aka-writer-colors.json');
const AKA_HTML_DIR = path.join(ROOT, 'color-sources', 'aka-writer');

const LOCALES = [
  { lang: 'de', file: 'de.html' },
  { lang: 'es', file: 'es.html' },
  { lang: 'fr', file: 'fr.html' },
  { lang: 'pt', file: 'pt.html' },
];

function parseLocaleFile(lang, fileName, colorsByCode) {
  const filePath = path.join(AKA_HTML_DIR, fileName);
  const html = fs.readFileSync(filePath, 'utf8');

  // Match each color block by pairing the "text-center color" div with its
  // corresponding "colorSkuDesc" div.
  //
  // 1) First capture block (group 1) starts at class="text-center color"
  //    and contains the style attribute where the background hex lives.
  // 2) Second capture (group 2) is the inner text of the colorSkuDesc div,
  //    e.g. "SCHWARZ AKA100".
  const blockRegex =
    /class="text-center color"([\s\S]*?)class="colorSkuDesc[^"]*"[\s\S]*?>([\s\S]*?)<\/div>/gi;

  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const blockWithStyle = match[1];
    const descInnerHtml = match[2];

    const hexMatch = /background:\s*#([0-9a-fA-F]{6})/i.exec(blockWithStyle);
    if (!hexMatch) continue;
    const hex = `#${hexMatch[1].toUpperCase()}`;

    let raw = descInnerHtml
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!raw) continue;

    const parts = raw.split(' ');
    if (parts.length < 2) continue;

    const code = parts.pop().trim();
    const name = parts.join(' ').trim();
    if (!code || !name) continue;

    const key = code;

    if (!colorsByCode[key]) {
      colorsByCode[key] = {
        seriesId: 'aka-writter',
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
  console.log(`Written ${result.length} AKA Writer colors to ${OUTPUT_PATH}`);
}

main();

