// Central type definitions

// Language codes for translations
export type LanguageCode = "en" | "es" | "de" | "fr" | "pt";

// Brand entity from brands.json
export interface Brand {
  id: string;
  name: string;
  description: string;
}

// Series entity from series.json
export interface Series {
  id: string;
  name: string;
  brandId: string;
  description: string;
}

// Color entity from colors.json
export interface Color {
  id: string;
  seriesId: string;
  hex: string;
  code: string;
}

// Color translations from colors-translations.json
export interface ColorTranslations {
  id: string;
  translations: Partial<Record<LanguageCode, string>>;
}

// Combined color with translations (for application use)
export interface ColorWithTranslations {
  id: string;
  seriesId: string;
  code: string;
  hex: string;
  translations?: Partial<Record<LanguageCode, string>>;
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
  colorPalette: ColorWithTranslations[];
  /** Config for background layer */
  backgroundOverlayConfig?: LayerOverlayConfig;
  /** Config for sketch layer */
  overlayConfig?: LayerOverlayConfig;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
