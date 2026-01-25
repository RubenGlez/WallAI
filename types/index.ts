// Central type definitions
// Will be expanded in later phases

export interface SprayColor {
  id: string;
  brand: string;
  name: string;
  code: string;
  hex: string;
}

export interface Project {
  id: string;
  name: string;
  sketchImageUri?: string;
  wallImageUri?: string;
  colorPalette: SprayColor[];
  overlayConfig?: {
    opacity: number;
    scale: number;
    rotation: number;
    position: { x: number; y: number };
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
