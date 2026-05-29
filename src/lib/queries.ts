import fs from 'fs';
import path from 'path';
import { getReviewsByCameraSlug, getReviewCountAndAvg, findUserById } from '@/lib/db';

// =============================================================================
// Interfaces
// =============================================================================

export interface ProConItem {
  en: string;
  ko: string;
}

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
  // --- New fields from cameradecision reviews ---
  pros: string[];
  cons: string[];
  prosKo: ProConItem[];
  consKo: ProConItem[];
  keySpecs: Record<string, unknown> | null;
  keySpecsKo: Record<string, unknown> | null;
  allSpecs: Record<string, unknown> | null;
  announced: string | null;
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

// =============================================================================
// Helpers — Extract specs from seeds or review data
// =============================================================================

function safeFloat(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const m = val.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
}

function safeInt(val: unknown): number {
  if (typeof val === 'number') return Math.round(val);
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '');
    const m = cleaned.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }
  return 0;
}

function parsePrice(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return Math.round(num * 100); // Store as cents
  }
  return null;
}

function parseDate(val: unknown): string {
  if (typeof val === 'string') {
    if (val.includes('T')) return val;
    return `${val}T00:00:00.000Z`;
  }
  return new Date().toISOString();
}

// =============================================================================
// Data Loading — Merges seeds + cameradecision reviews
// =============================================================================

let cachedCameras: CameraWithStats[] | null = null;

function loadCameras(): CameraWithStats[] {
  if (cachedCameras) return cachedCameras;

  // --- Load existing seeds (rich specs) ---
  const seedsPath = path.join(process.cwd(), 'data/seeds/all_cameras_seed.json');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seedsMap = new Map<string, any>();
  if (fs.existsSync(seedsPath)) {
    try {
      const raw = fs.readFileSync(seedsPath, 'utf-8');
      const seeds = JSON.parse(raw);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const s of seeds) {
        seedsMap.set(s.slug, s);
      }
    } catch {
      console.warn('Failed to load seeds data');
    }
  }

  // --- Load cameradecision reviews (pros/cons/key_specs) ---
  const reviewsPath = path.join(process.cwd(), 'data/cameradecision_reviews/_all_reviews.json');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reviewsData: any[] = [];
  if (fs.existsSync(reviewsPath)) {
    try {
      const raw = fs.readFileSync(reviewsPath, 'utf-8');
      reviewsData = JSON.parse(raw);
    } catch {
      console.warn('Failed to load cameradecision reviews');
    }
  }

  // --- Build review lookup by normalized slug ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewMap = new Map<string, any>();
  for (const r of reviewsData) {
    // cameradecision slug: "Canon-EOS-R5", seeds slug: "canon-eos-r5"
    const normalizedSlug = r.slug.toLowerCase();
    reviewMap.set(normalizedSlug, r);
  }

  // --- Merge: Start with seeds, enrich with review data ---
  const cameras: CameraWithStats[] = [];
  const processedSlugs = new Set<string>();
  let idx = 0;

  // 1) Process all seed cameras (they have rich spec data)
  for (const [slug, seed] of seedsMap) {
    const review = reviewMap.get(slug) || null;
    cameras.push(buildCamera(idx++, seed, review));
    processedSlugs.add(slug);
  }

  // 2) Add cameradecision cameras not in seeds
  for (const review of reviewsData) {
    const normalizedSlug = review.slug.toLowerCase();
    if (processedSlugs.has(normalizedSlug)) continue;

    cameras.push(buildCameraFromReview(idx++, review));
    processedSlugs.add(normalizedSlug);
  }

  cachedCameras = cameras;
  return cameras;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCamera(index: number, seed: any, review: any | null): CameraWithStats {
  return {
    id: `cam_${index}`,
    slug: seed.slug,
    brand: seed.brand,
    model: seed.model,
    bodyType: seed.bodyType || 'MIRRORLESS',
    sensorSize: seed.sensorSize || 'OTHER',
    megapixels: seed.megapixels || 0,
    isoMin: seed.isoMin || 100,
    isoMax: seed.isoMax || 25600,
    imageStabilization: seed.imageStabilization || false,
    afPoints: seed.afPoints || 0,
    afType: seed.afType || '',
    maxVideoResolution: seed.maxVideoResolution || '',
    videoFeatures: seed.videoFeatures || null,
    viewfinderType: seed.viewfinderType || '',
    viewfinderMagnification: seed.viewfinderMagnification || null,
    lcdSize: seed.lcdSize || 3.0,
    lcdResolution: seed.lcdResolution || '',
    touchscreen: seed.touchscreen || false,
    mount: seed.mount || 'OTHER',
    continuousShootingSpeed: seed.continuousShootingSpeed || 0,
    shutterSpeedMin: seed.shutterSpeedMin || '',
    shutterSpeedMax: seed.shutterSpeedMax || '',
    cardSlots: seed.cardSlots || 1,
    cardType: seed.cardType || '',
    wifi: seed.wifi || false,
    bluetooth: seed.bluetooth || false,
    usb: seed.usb || null,
    weightGrams: seed.weightGrams || 0,
    dimensions: seed.dimensions || '',
    weatherSealed: seed.weatherSealed || false,
    priceMsrp: seed.priceMsrp || null,
    releaseDate: seed.releaseDate ? new Date(seed.releaseDate).toISOString() : new Date().toISOString(),
    imageUrl: review?.image_url || seed.imageUrl || seed.thumbnailUrl || null,
    thumbnailUrl: seed.thumbnailUrl || review?.image_url || null,
    description: seed.description || null,
    avgRating: 0,
    reviewCount: 0,
    // Review data
    pros: review?.pros || seed?._prosCons?.pros || [],
    cons: review?.cons || seed?._prosCons?.cons || [],
    prosKo: review?.pros_ko || [],
    consKo: review?.cons_ko || [],
    keySpecs: review?.key_specs || null,
    keySpecsKo: review?.key_specs_ko || null,
    allSpecs: review?.all_specs || seed?._rawSpecs?.['Main Features'] || null,
    announced: review?.key_specs?.Announced || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCameraFromReview(index: number, review: any): CameraWithStats {
  const specs = review.all_specs || {};
  const keySpecs = review.key_specs || {};

  // Extract brand/model from camera_name
  const cameraName: string = review.camera_name || review.slug.replace(/-/g, ' ');
  const brand: string = review.brand || cameraName.split(' ')[0];
  const model: string = cameraName.replace(brand, '').trim() || cameraName;

  // Generate a slug compatible with seeds format
  const slug = review.slug.toLowerCase();

  // Try to extract specs from all_specs
  const bodyTypeRaw = (keySpecs['Body Type'] || specs['Body Type'] || '').toString().toLowerCase();
  let bodyType = 'MIRRORLESS';
  if (bodyTypeRaw.includes('dslr') || bodyTypeRaw.includes('slr') && !bodyTypeRaw.includes('mirrorless')) bodyType = 'DSLR';
  else if (bodyTypeRaw.includes('compact') || bodyTypeRaw.includes('point')) bodyType = 'COMPACT';
  else if (bodyTypeRaw.includes('mirrorless')) bodyType = 'MIRRORLESS';
  else if (bodyTypeRaw.includes('medium')) bodyType = 'MEDIUM_FORMAT';

  // Sensor size
  const sensorRaw = (specs['Sensor Size'] || keySpecs['Sensor Size'] || '').toString().toLowerCase();
  let sensorSize = 'OTHER';
  if (sensorRaw.includes('full') || sensorRaw.includes('35mm')) sensorSize = 'FULL_FRAME';
  else if (sensorRaw.includes('aps')) sensorSize = 'APS_C';
  else if (sensorRaw.includes('four') || sensorRaw.includes('4/3')) sensorSize = 'MICRO_FOUR_THIRDS';
  else if (sensorRaw.includes('medium')) sensorSize = 'MEDIUM_FORMAT';
  else if (sensorRaw.includes('1"') || sensorRaw.includes('1 inch') || sensorRaw.includes('1-inch')) sensorSize = 'ONE_INCH';

  // Lens mount
  const mountRaw = (keySpecs['Lens Mount'] || specs['Lens Mount'] || '').toString().toLowerCase();
  let mount = 'OTHER';
  if (mountRaw.includes('sony e') || mountRaw.includes('sony fe')) mount = 'SONY_E';
  else if (mountRaw.includes('canon rf')) mount = 'CANON_RF';
  else if (mountRaw.includes('canon ef')) mount = 'CANON_EF';
  else if (mountRaw.includes('nikon z')) mount = 'NIKON_Z';
  else if (mountRaw.includes('nikon f')) mount = 'NIKON_F';
  else if (mountRaw.includes('fuji') && mountRaw.includes('x')) mount = 'FUJIFILM_X';
  else if (mountRaw.includes('gfx')) mount = 'FUJIFILM_GFX';
  else if (mountRaw.includes('micro four') || mountRaw.includes('micro 4/3')) mount = 'MICRO_FOUR_THIRDS';
  else if (mountRaw.includes('leica l')) mount = 'LEICA_L';
  else if (mountRaw.includes('leica m')) mount = 'LEICA_M';
  else if (mountRaw.includes('pentax')) mount = 'PENTAX_K';

  return {
    id: `cam_${index}`,
    slug,
    brand,
    model,
    bodyType,
    sensorSize,
    megapixels: safeFloat(specs['Sensor Resolution']),
    isoMin: safeInt(specs['Min Native ISO'] || 100),
    isoMax: safeInt(specs['Max Native ISO'] || 25600),
    imageStabilization: specs['Image Stabilization'] === true,
    afPoints: safeInt(specs['Number of Focus Points']),
    afType: [
      specs['AF Phase Detection'] === true ? 'Phase Detection' : '',
      specs['AF Contrast Detection'] === true ? 'Contrast Detection' : '',
      specs['AF Face Detection'] === true ? 'Face Detection' : '',
    ].filter(Boolean).join(' + ') || '',
    maxVideoResolution: (specs['Max Video Resolution'] || '').toString(),
    videoFeatures: (specs['Video Formats'] || '').toString() || null,
    viewfinderType: (specs['Viewfinder'] || '').toString(),
    viewfinderMagnification: safeFloat(specs['Viewfinder Magnification']) || null,
    lcdSize: safeFloat(keySpecs['Screen Size'] || specs['Screen Size']) || 3.0,
    lcdResolution: (keySpecs['Screen Resolution'] || specs['Screen Resolution'] || '').toString(),
    touchscreen: specs['Touch Screen'] === true || keySpecs['Touch Screen'] === true,
    mount,
    continuousShootingSpeed: safeFloat(specs['Max Continuous Shooting (Mechanical Shutter)'] || specs['Max Continuous Shooting (Electronic Shutter)']),
    shutterSpeedMin: (specs['Max Mechanical Shutter Speed'] || '').toString(),
    shutterSpeedMax: (specs['Min Shutter Speed'] || '').toString(),
    cardSlots: safeInt(specs['Storage Slots']) || 1,
    cardType: (specs['Storage Type'] || '').toString(),
    wifi: specs['Wireless Connectivity'] === 'Built-In' || specs['Wireless Connectivity'] === true,
    bluetooth: specs['Bluetooth'] === true,
    usb: (specs['USB'] || '').toString() || null,
    weightGrams: safeInt(specs['Weight']),
    dimensions: (specs['Physical Dimensions'] || '').toString(),
    weatherSealed: specs['Environmental Sealing'] === true,
    priceMsrp: parsePrice(keySpecs['MSRP'] || specs['MSRP']),
    releaseDate: parseDate(keySpecs['Announced'] || specs['Announced']),
    imageUrl: review.image_url || null,
    thumbnailUrl: review.image_url?.replace('px8060', 'px100_100') || null,
    description: null,
    avgRating: 0,
    reviewCount: 0,
    // Review data
    pros: review.pros || [],
    cons: review.cons || [],
    prosKo: review.pros_ko || [],
    consKo: review.cons_ko || [],
    keySpecs: review.key_specs || null,
    keySpecsKo: review.key_specs_ko || null,
    allSpecs: review.all_specs || null,
    announced: keySpecs['Announced'] || specs['Announced'] || null,
  };
}

// =============================================================================
// Query Functions
// =============================================================================

export async function getAllCameras(): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  return cameras.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}

export async function getFeaturedCameras(limit: number = 6): Promise<CameraWithStats[]> {
  const cameras = loadCameras();
  // Featured = recent cameras with most pros (indicates feature-rich)
  return cameras
    .filter(c => c.megapixels > 0 && c.pros.length > 10)
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
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
    } catch {
      console.warn(`Failed to parse slr data for ${slug}`);
    }
  }

  // Load reviews from DB
  const dbReviews = getReviewsByCameraSlug(slug);
  const reviews: ReviewWithAuthor[] = dbReviews.map(r => {
    const author = findUserById(r.user_id);
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      pros: r.pros,
      cons: r.cons,
      helpful: r.helpful,
      verified: true,
      createdAt: r.created_at,
      cameraId: r.camera_slug,
      author: {
        id: author?.id || '',
        username: author?.username || '탈퇴한 사용자',
        name: author?.name || null,
        avatarUrl: author?.avatar_url || null,
      },
    };
  });

  const { count, avg } = getReviewCountAndAvg(slug);

  return {
    ...camera,
    avgRating: avg,
    reviewCount: count,
    reviews,
    slrReview,
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

export async function getAllBrands(): Promise<{brand: string; count: number}[]> {
  const cameras = loadCameras();
  const brandMap = new Map<string, number>();
  for (const c of cameras) {
    brandMap.set(c.brand, (brandMap.get(c.brand) || 0) + 1);
  }
  return Array.from(brandMap.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);
}
