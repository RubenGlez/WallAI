/**
 * SprayDeck Design System — "High-Utility Obsidian"
 * Creative North Star: "The Neon Architect"
 */

// ─── Surface layers (tonal depth, no borders) ───────────────────────────────
export const Surface = {
  lowest: '#000000',   // absolute void — page background
  low: '#111414',      // primary container background
  base: '#171a1a',     // card / module default
  high: '#1c2020',     // elevated card / section
  highest: '#222727',  // active/hovered surface, glass base
  bright: '#282d2d',   // pressed / focus ring
} as const;

// ─── Accent & semantic colors ────────────────────────────────────────────────
export const Accent = {
  primary: '#a1ffc2',           // neon green — default accent
  primaryContainer: '#00fc9a',  // stronger neon — CTA gradient end
  primaryDim: '#00ec90',        // glow shadow color
  onPrimary: '#00643a',         // text on primary button
  secondary: '#65f9c3',         // status / ready indicators
  outlineVariant: '#464848',    // ghost border — use at 15% opacity only
  onSurface: '#edeeed',         // body text (never pure white)
  onSurfaceMuted: '#8a9090',    // secondary / placeholder text
  error: '#ff716c',             // destructive / low-stock alert
  success: '#32D74B',
  warning: '#FF9F0A',
} as const;

// ─── Unified theme object (dark-only app) ───────────────────────────────────
export const Colors = {
  // kept for backward compat with components that still reference Colors.dark / Colors.light
  dark: {
    text: Accent.onSurface,
    background: Surface.lowest,
    tint: Accent.primary,
    icon: Accent.onSurface,
    tabIconDefault: Accent.onSurfaceMuted,
    tabIconSelected: Accent.primary,
    border: Accent.outlineVariant,
    card: Surface.base,
    error: Accent.error,
    success: Accent.success,
    warning: Accent.warning,
    textSecondary: Accent.onSurfaceMuted,
    backgroundSecondary: Surface.high,
  },
  light: {
    // app is dark-only; light mirrors dark so any stale light references don't break
    text: Accent.onSurface,
    background: Surface.lowest,
    tint: Accent.primary,
    icon: Accent.onSurface,
    tabIconDefault: Accent.onSurfaceMuted,
    tabIconSelected: Accent.primary,
    border: Accent.outlineVariant,
    card: Surface.base,
    error: Accent.error,
    success: Accent.success,
    warning: Accent.warning,
    textSecondary: Accent.onSurfaceMuted,
    backgroundSecondary: Surface.high,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  touchTarget: 44,
  touchTargetLarge: 56,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
    label: 1.5,  // uppercase labels
  },
} as const;

// ─── Font families ────────────────────────────────────────────────────────────
// SpaceGrotesk is loaded via useFonts in app/_layout.tsx
export const FontFamily = {
  // Decorative / heading — Space Grotesk
  displayBold: 'SpaceGrotesk_700Bold',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayMedium: 'SpaceGrotesk_500Medium',
  // Body / readable — system default
  body: undefined,  // React Native system font
} as const;

// ─── Shadows (neon glow style) ────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  neonGlow: {
    shadowColor: Accent.primaryDim,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

// ─── Glassmorphism ────────────────────────────────────────────────────────────
export const Glass = {
  backgroundColor: Surface.highest,  // #222727
  backgroundOpacity: 0.6,
  blurAmount: 24,
  borderColor: Accent.outlineVariant,
  borderOpacity: 0.15,
} as const;
