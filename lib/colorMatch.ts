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

export type Lab = { l: number; a: number; b: number };

function getLab(hex: string): Lab {
  const c = colord(hex);
  if (!c.isValid()) return { l: 0, a: 0, b: 0 };
  const lab = c.toLab();
  return { l: lab.l, a: lab.a, b: lab.b };
}

/**
 * CIEDE2000 between two LAB colors. Returns value in [0, 1] to match colord's delta().
 * Use when both colors already have LAB to avoid hex→LAB conversions.
 */
function deltaE00(lab1: Lab, lab2: Lab): number {
  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;
  const deg = Math.PI / 180;
  const rad2deg = 180 / Math.PI;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1_ = a1 * (1 + G);
  const a2_ = a2 * (1 + G);
  const C1_ = Math.sqrt(a1_ * a1_ + b1 * b1);
  const C2_ = Math.sqrt(a2_ * a2_ + b2 * b2);
  const Cbar_ = (C1_ + C2_) / 2;
  const h1_ = a1_ === 0 && b1 === 0 ? 0 : Math.atan2(b1, a1_) * rad2deg;
  const h2_ = a2_ === 0 && b2 === 0 ? 0 : Math.atan2(b2, a2_) * rad2deg;
  let H1_ = h1_;
  if (H1_ < 0) H1_ += 360;
  let H2_ = h2_;
  if (H2_ < 0) H2_ += 360;
  const dH_ = H2_ - H1_;
  const dH = Math.abs(dH_) <= 180 ? dH_ : dH_ > 0 ? dH_ - 360 : dH_ + 360;
  const Hbar = Math.abs(H1_ - H2_) <= 180 ? (H1_ + H2_) / 2 : (H1_ + H2_ + 360) / 2;
  const T =
    1 -
    0.17 * Math.cos(deg * (Hbar - 30)) +
    0.24 * Math.cos(deg * 2 * Hbar) +
    0.32 * Math.cos(deg * (3 * Hbar + 6)) -
    0.2 * Math.cos(deg * (4 * Hbar - 63));
  const dL_ = L2 - L1;
  const dC_ = C2_ - C1_;
  const dH__ = 2 * Math.sqrt(C1_ * C2_) * Math.sin((deg * dH) / 2);
  const Lbar = (L1 + L2) / 2;
  const SL = 1 + (0.015 * Math.pow(Lbar - 50, 2)) / Math.sqrt(20 + Math.pow(Lbar - 50, 2));
  const SC = 1 + 0.045 * Cbar_;
  const SH = 1 + 0.015 * Cbar_ * T;
  const dTheta = 30 * Math.exp(-Math.pow((Hbar - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cbar_, 7) / (Math.pow(Cbar_, 7) + Math.pow(25, 7)));
  const RT = -RC * Math.sin(deg * 2 * dTheta);
  const dE = Math.sqrt(
    Math.pow(dL_ / SL, 2) + Math.pow(dC_ / SC, 2) + Math.pow(dH__ / SH, 2) + (RT * dC_ * dH__) / (SC * SH)
  );
  return Math.round((dE / 100) * 1000) / 1000; // colord uses dE/100 for [0,1], 3 decimals
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
 * Delta in [0,1] from query to catalog color. Uses precomputed LAB when available for performance.
 */
function getDelta(queryLab: Lab, c: Color): number {
  if (c.lab != null) return deltaE00(queryLab, c.lab);
  return colord(queryLab).delta(c.hex);
}

/**
 * Find the closest catalog color to the given hex (by LAB delta E).
 */
export function findClosestColor(hex: string, catalogColors: Color[]): ColorMatch | null {
  if (catalogColors.length === 0) return null;
  const queryLab = getLab(hex);
  let best: { color: Color; delta: number } | null = null;
  for (const c of catalogColors) {
    const delta = getDelta(queryLab, c);
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

const DEFAULT_TOP_N = 8;

/**
 * Find the top N closest catalog colors to the given hex (by LAB delta E), sorted by similarity descending.
 * Uses precomputed LAB on catalog colors when available for better performance.
 */
export function findClosestColors(
  hex: string,
  catalogColors: Color[],
  limit: number = DEFAULT_TOP_N
): ColorMatch[] {
  if (catalogColors.length === 0) return [];
  const queryLab = getLab(hex);
  const withDelta: { color: Color; delta: number }[] = catalogColors.map((c) => ({
    color: c,
    delta: getDelta(queryLab, c),
  }));
  withDelta.sort((a, b) => a.delta - b.delta);
  return withDelta.slice(0, limit).map(({ color, delta }) => ({
    originalHex: hex,
    catalogColor: color,
    similarity: deltaToSimilarity(delta),
  }));
}

/**
 * For each hex, find closest color in catalog; return in same order.
 */
export function matchPaletteToBrand(hexes: string[], catalogColors: Color[]): ColorMatch[] {
  return hexes
    .map((hex) => findClosestColor(hex, catalogColors))
    .filter((m): m is ColorMatch => m != null);
}
