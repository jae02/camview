// =============================================================================
// Shared TypeScript types for the Camera Specs & Review Community
// =============================================================================
// These types mirror the Prisma schema but are used on the client side
// without requiring a direct dependency on @prisma/client in components.
// =============================================================================

export type SensorSize =
  | "FULL_FRAME"
  | "APS_C"
  | "MICRO_FOUR_THIRDS"
  | "MEDIUM_FORMAT"
  | "ONE_INCH"
  | "OTHER";

export type LensMount =
  | "SONY_E"
  | "CANON_RF"
  | "NIKON_Z"
  | "FUJIFILM_X"
  | "FUJIFILM_GFX"
  | "MICRO_FOUR_THIRDS"
  | "LEICA_L"
  | "LEICA_M"
  | "CANON_EF"
  | "NIKON_F"
  | "PENTAX_K"
  | "OTHER";

export type BodyType =
  | "MIRRORLESS"
  | "DSLR"
  | "COMPACT"
  | "MEDIUM_FORMAT"
  | "CINEMA"
  | "ACTION"
  | "OTHER";

export interface Camera {
  id: string;
  slug: string;
  brand: string;
  model: string;
  bodyType: BodyType;
  sensorSize: SensorSize;
  megapixels: number;
  isoMin: number;
  isoMax: number;
  imageStabilization: boolean;
  afPoints: number;
  afType: string;
  maxVideoResolution: string;
  videoFeatures: string | null;
  viewfinderType: string;
  viewfinderMagnification: number | null;
  lcdSize: number;
  lcdResolution: string;
  touchscreen: boolean;
  mount: LensMount;
  continuousShootingSpeed: number;
  shutterSpeedMin: string;
  shutterSpeedMax: string;
  cardSlots: number;
  cardType: string;
  wifi: boolean;
  bluetooth: boolean;
  usb: string | null;
  weightGrams: number;
  dimensions: string;
  weatherSealed: boolean;
  priceMsrp: number | null;
  releaseDate: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  reviews: Review[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string | null;
  cons: string | null;
  verified: boolean;
  helpful: number;
  createdAt: string;
  author: User;
  cameraId: string;
}

/** A single row in the specs table */
export interface SpecRow {
  label: string;
  value: string | number | boolean;
  unit?: string;
}

/** A named group of spec rows (e.g. "Sensor & Image") */
export interface SpecGroup {
  title: string;
  icon?: string;
  specs: SpecRow[];
}
