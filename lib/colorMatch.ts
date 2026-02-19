import { colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';
import type { Color } from '@/types';

extend([labPlugin]);

/**
 * Extract 5-8 unique hex colors from react-native-image-colors result.
 */
export function extractHexPalette(result: {
  dominant?: string;
  average?: string;
  vibrant?: string;
  darkVibrant?: string;
  lightVibrant?: string;
  darkMuted?: string;
  lightMuted?: string;
  muted?: string;
  background?: string;
  primary?: string;
  secondary?: string;
  detail?: string;
}): string[] {
  const hexes: string[] = [];
  const keys = [
    'dominant',
    'primary',
    'secondary',
    'vibrant',
    'darkVibrant',
    'lightVibrant',
    'muted',
    'darkMuted',
    'lightMuted',
    'average',
    'background',
    'detail',
  ] as const;
  const seen = new Set<string>();
  for (const k of keys) {
    const v = result[k];
    if (v && typeof v === 'string' && /^#([0-9a-f]{3}){1,2}$/i.test(v) && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      hexes.push(v);
      if (hexes.length >= 8) break;
    }
  }
  return hexes;
}

function getLab(hex: string): { l: number; a: number; b: number } {
  const c = colord(hex);
  if (!c.isValid()) return { l: 0, a: 0, b: 0 };
  const lab = c.toLab();
  return { l: lab.l, a: lab.a, b: lab.b };
}

/**
 * Delta E (0-1 from colord) -> similarity percentage 0-100.
 * delta 0 => 100%, delta 1 => 0%.
 */
function deltaToSimilarity(delta: number): number {
  return Math.round(Math.max(0, Math.min(100, (1 - delta) * 100)));
}

export type ColorMatch = {
  originalHex: string;
  catalogColor: Color;
  similarity: number;
};

/**
 * Find the closest catalog color to the given hex (by LAB delta E).
 */
export function findClosestColor(hex: string, catalogColors: Color[]): ColorMatch | null {
  if (catalogColors.length === 0) return null;
  const lab = getLab(hex);
  let best: { color: Color; delta: number } | null = null;
  for (const c of catalogColors) {
    const catalogLab = c.lab ?? getLab(c.hex);
    const delta = colord(hex).delta(c.hex);
    if (best === null || delta < best.delta) {
      best = { color: c, delta };
    }
  }
  if (!best) return null;
  return {
    originalHex: hex,
    catalogColor: best.color,
    similarity: deltaToSimilarity(best.delta),
  };
}

/**
 * For each hex, find closest color in catalog; return in same order.
 */
export function matchPaletteToBrand(hexes: string[], catalogColors: Color[]): ColorMatch[] {
  return hexes
    .map((hex) => findClosestColor(hex, catalogColors))
    .filter((m): m is ColorMatch => m != null);
}
