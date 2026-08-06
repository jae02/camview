// ============================================
// CamView — Camera Filter Simulation Types
// ============================================

export type CameraCategory = 'film' | 'digital';

/**
 * Color curve control points for tone mapping.
 * Each point is [input, output] in 0-255 range.
 */
export type CurvePoint = [number, number];

/**
 * Filter parameters that define a camera's color science.
 * Applied via Canvas API pixel manipulation.
 */
export interface FilterParams {
  /** Color temperature shift (-100 cool to +100 warm) */
  temperature: number;
  /** Tint shift (-100 magenta to +100 green) */
  tint: number;
  /** Contrast adjustment (-100 to +100) */
  contrast: number;
  /** Saturation multiplier (0 = grayscale, 1 = normal, 2 = double) */
  saturation: number;
  /** Brightness adjustment (-100 to +100) */
  brightness: number;
  /** Highlight recovery (-100 to +100) */
  highlights: number;
  /** Shadow lift/crush (-100 to +100) */
  shadows: number;
  /** Black point lift (0-50, higher = more faded blacks) */
  fadedBlacks: number;
  /** Red channel curve points */
  redCurve: CurvePoint[];
  /** Green channel curve points */
  greenCurve: CurvePoint[];
  /** Blue channel curve points */
  blueCurve: CurvePoint[];
  /** Film grain intensity (0 = none, 1 = max) */
  grain: number;
  /** Grain size (1-5) */
  grainSize: number;
  /** Vignette intensity (0 = none, 1 = max) */
  vignette: number;
  /** Sharpness adjustment (0-2, 1 = normal) */
  sharpness: number;
  /** Special effect: halation glow for Cinestill-like looks */
  halation?: number;
  /** Color split toning - highlights */
  splitHighlightHue?: number;
  /** Color split toning - shadows */
  splitShadowHue?: number;
}

/**
 * Radar chart attributes for visualizing filter characteristics.
 */
export interface FilterCharacteristics {
  warmth: number;      // 0-100
  contrast: number;    // 0-100
  saturation: number;  // 0-100
  grain: number;       // 0-100
  sharpness: number;   // 0-100
  vintage: number;     // 0-100
}

/**
 * A camera profile with metadata and filter configuration.
 */
export interface CameraProfile {
  id: string;
  name: string;
  brand: string;
  category: CameraCategory;
  year: number;
  /** One-line tagline */
  tagline: string;
  /** Multi-paragraph description (HTML allowed) */
  description: string;
  /** Key features list */
  features: string[];
  /** Filter parameters for this camera's look */
  filter: FilterParams;
  /** Visual characteristics for radar chart */
  characteristics: FilterCharacteristics;
  /** Accent color for UI (hex) */
  accentColor: string;
  /** Emoji icon */
  icon: string;
}

/**
 * Image upload state for the studio.
 */
export interface UploadedImage {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}
