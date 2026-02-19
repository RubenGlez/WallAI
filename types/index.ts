// Central type definitions

// Language codes for translations
export type LanguageCode = "en" | "es" | "de" | "fr" | "pt";

// --- PRD entities ---

/** Brand entity — Pantalla 1: Selección de marca */
export interface Brand {
  id: string;
  name: string;
  /** Asset path or require() for logo image */
  logo?: string | number | null;
  description?: string;
}

/** Spray pressure type (per series) */
export type PressureType = "low" | "high" | "mixed";

/** Finish type (matte, gloss, metallic, etc.) */
export type FinishType = "matte" | "gloss" | "metallic" | "other";

/** Series entity — Pantalla 2: Series de la marca */
export interface Series {
  id: string;
  name: string;
  brandId: string;
  description?: string;
  /** mate, brillo, metalizado… */
  finishType?: FinishType;
  /** low pressure, high pressure, etc. */
  pressureType?: PressureType;
}

/** Series with computed color count (for Pantalla 2) */
export interface SeriesWithCount extends Series {
  colorCount: number;
}

/** Color entity — Pantalla 3/4: Grid y detalle */
export interface Color {
  id: string;
  seriesId: string;
  hex: string;
  code: string;
  /** Traducciones por código de idioma (es, en, de, fr, pt) */
  name: Partial<Record<LanguageCode, string>>;
  /** null hasta que exista script generador desde hex */
  lab?: { l: number; a: number; b: number } | null;
}

// Overlay config for a single layer (background or sketch)
export interface LayerOverlayConfig {
  opacity: number;
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

// Project entity
export interface Project {
  id: string;
  name: string;
  /** Background layer image (behind sketch) */
  backgroundImageUri?: string;
  /** Sketch layer image (in front) */
  sketchImageUri?: string;
  wallImageUri?: string;
  colorPalette: Color[];
  /** Config for background layer */
  backgroundOverlayConfig?: LayerOverlayConfig;
  /** Config for sketch layer */
  overlayConfig?: LayerOverlayConfig;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Brand with computed total color count (for Pantalla 1) */
export interface BrandWithCount extends Brand {
  colorCount: number;
}

/** User-created palette — Tab Paletas, Pantalla 1 */
export interface Palette {
  id: string;
  name: string;
  /** Colors in this palette (full Color for thumbnail + catalog resolution) */
  colors: Color[];
  createdAt: string; // ISO date string for serialization
}
