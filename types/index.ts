// Central type definitions

// Language codes for translations
export type LanguageCode = "en" | "es" | "de" | "fr" | "pt";

// --- PRD entities ---

/** Brand entity — Screen 1: Brand selection */
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

/** Series entity — Screen 2: Brand series */
export interface Series {
  id: string;
  name: string;
  brandId: string;
  description?: string;
  /** matte, gloss, metallic, etc. */
  finishType?: FinishType;
  /** low pressure, high pressure, etc. */
  pressureType?: PressureType;
}

/** Series with computed color count (for Screen 2) */
export interface SeriesWithCount extends Series {
  colorCount: number;
}

/** Series with count and brand name (for UI lists) */
export type SeriesWithCountAndBrand = SeriesWithCount & { brandName: string };

/** Color entity — Screen 3/4: Grid and detail */
export interface Color {
  id: string;
  seriesId: string;
  hex: string;
  code: string;
  /** Translations by language code (es, en, de, fr, pt) */
  name: Partial<Record<LanguageCode, string>>;
  lab: { l: number; a: number; b: number };
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

/** Brand with computed total color count (for Screen 1) */
export interface BrandWithCount extends Brand {
  colorCount: number;
}

/** User-created palette — Palettes tab, Screen 1 */
export interface Palette {
  id: string;
  name: string;
  /** Colors in this palette (full Color for thumbnail + catalog resolution) */
  colors: Color[];
  createdAt: string; // ISO date string for serialization
}

/** Doodle project — Doodles tab, Screen 1 (PRD entity) */
export interface Doodle {
  id: string;
  /** Project/spot name */
  name: string;
  /** Wall image (background) */
  wallImageUri?: string;
  /** Sketch image */
  sketchImageUri?: string;
  /** Combined thumbnail (preview or export) */
  thumbnailUri?: string;
  /** Transform data (scale, rotation, perspective, etc.) */
  transformData?: Record<string, unknown>;
  /** Exported image (final PNG) */
  exportImageUri?: string;
  createdAt: string; // ISO date string for serialization
  updatedAt: string;
}
