/**
 * Returns true when a hex color has luminance > 0.5 (perceptually light background).
 * Use for deciding text/icon color on top of a colored swatch.
 */
export function isLightHex(hex: string): boolean {
  const h = hex.replace(/^#/, "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

/**
 * Returns true for near-white colors (#fff*) that need a ghost border
 * to be distinguishable against a light background.
 */
export function isVeryLightHex(hex: string): boolean {
  const lower = hex.toLowerCase();
  return lower === "#ffffff" || lower.startsWith("#fff");
}

/**
 * Returns a thin ghost border style for very-light swatches.
 * Pass `Accent.outlineVariant` from the theme.
 */
export function swatchGhostBorder(outlineVariant: string) {
  return { borderWidth: 1, borderColor: `${outlineVariant}26` } as const;
}
