import fs from 'fs';
import path from 'path';

export interface CameraWithStats {
  id: string;
  slug: string;
  brand: string;
  model: string;
  bodyType: string;
  sensorSize: string;
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
  mount: string;
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
  avgRating: number;
  reviewCount: number;
}

export interface ReviewWithAuthor {
  id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string | null;
  cons: string | null;
  verified: boolean;
  helpful: number;
  createdAt: string;
  cameraId: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface SlrReview {
  title: string;
  critique_html?: string;
  critique_text?: string;
  critique_summary?: string;
  downloaded_images?: string[];
  url: string;
}

export interface CameraDetail extends CameraWithStats {
  reviews: ReviewWithAuthor[];
  slrReview?: SlrReview;
}

let cachedCameras: CameraWithStats[] | null = null;

function loadCameras(): CameraWithStats[] {
  if (cachedCameras) return cachedCameras;

  const dataPath = path.join(process.cwd(), 'data/seeds/all_cameras_seed.json');
  if (!fs.existsSync(dataPath)) {
    console.warn(`Seed data not found at ${dataPath}`);
    return [];
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const camerasData = JSON.parse(rawData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedCameras = camerasData.map((c: any, index: number) => {
    return {
      id: `cam_${index}`,
      slug: c.slug,
      brand: c.brand,
      model: c.model,
      bodyType: c.bodyType,
      sensorSize: c.sensorSize,
      megapixels: c.megapixels,
      isoMin: c.isoMin,
      isoMax: c.isoMax,
      imageStabilization: c.imageStabilization,
      afPoints: c.afPoints,
      afType: c.afType,
      maxVideoResolution: c.maxVideoResolution,
      videoFeatures: c.videoFeatures,
      viewfinderType: c.viewfinderType,
      viewfinderMagnification: c.viewfinderMagnification,
      lcdSize: c.lcdSize,
      lcdResolution: c.lcdResolution,
      touchscreen: c.touchscreen,
      mount: c.mount,
      continuousShootingSpeed: c.continuousShootingSpeed,
      shutterSpeedMin: c.shutterSpeedMin,
      shutterSpeedMax: c.shutterSpeedMax,
      cardSlots: c.cardSlots,
      cardType: c.cardType,
      wifi: c.wifi,
      bluetooth: c.bluetooth,
      usb: c.usb,
      weightGrams: c.weightGrams,
      dimensions: c.dimensions,
      weatherSealed: c.weatherSealed,
      priceMsrp: c.priceMsrp,
      releaseDate: c.releaseDate ? new Date(c.releaseDate).toISOString() : new Date().toISOString(),
      imageUrl: c.imageUrl,
      thumbnailUrl: c.thumbnailUrl,
      description: c.description,
      avgRating: 0,
      reviewCount: 0,
    };
  });

  return cachedCameras as CameraWithStats[];
}

export async function getAllCameras(): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  return cameras.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}

export async function getFeaturedCameras(limit: number = 6): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  return cameras
    .filter(c => c.megapixels > 0)
    .sort((a, b) => b.megapixels - a.megapixels)
    .slice(0, limit);
}

export async function getCameraBySlug(slug: string): Promise<CameraDetail | null> {
  const cameras = loadCameras();
  const camera = cameras.find(c => c.slug === slug);
  if (!camera) return null;

  let slrReview: SlrReview | undefined = undefined;
  const slrDataPath = path.join(process.cwd(), `data/slrclub/${slug}.json`);
  if (fs.existsSync(slrDataPath)) {
    try {
      const rawSlr = fs.readFileSync(slrDataPath, 'utf-8');
      slrReview = JSON.parse(rawSlr) as SlrReview;
    } catch (e) {
      console.warn(`Failed to parse slr data for ${slug}`);
    }
  }

  return {
    ...camera,
    reviews: [],
    slrReview
  };
}

export async function getCamerasByBrand(brand: string): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  return cameras
    .filter(c => c.brand.toLowerCase() === brand.toLowerCase())
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}

export async function searchCameras(query: string): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  const q = query.toLowerCase();
  return cameras
    .filter(c => 
      c.brand.toLowerCase().includes(q) || 
      c.model.toLowerCase().includes(q) || 
      c.slug.toLowerCase().includes(q)
    )
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 20);
}

export async function getComparisonData(slugs: string[]): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  return cameras.filter(c => slugs.includes(c.slug));
}

export async function getAllCameraSlugs(): Promise<string[]> {
  const cameras = loadCameras();
  return cameras.map(c => c.slug);
}
