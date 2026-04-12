// =============================================================================
// Data Queries — Server-side data fetching via Prisma
// =============================================================================
// Centralized query layer used by Server Components. All functions return
// plain serializable objects (not Prisma model instances) so they can be
// safely passed as props to Client Components.
// =============================================================================

import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Types for serialized query results
// ---------------------------------------------------------------------------

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

export interface CameraDetail extends CameraWithStats {
  reviews: ReviewWithAuthor[];
}

// ---------------------------------------------------------------------------
// Helper — serialize dates and compute stats
// ---------------------------------------------------------------------------

function serializeCamera(camera: {
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
  releaseDate: Date;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  reviews: Array<{ rating: number }>;
}): CameraWithStats {
  const ratings = camera.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0;

  return {
    id: camera.id,
    slug: camera.slug,
    brand: camera.brand,
    model: camera.model,
    bodyType: camera.bodyType,
    sensorSize: camera.sensorSize,
    megapixels: camera.megapixels,
    isoMin: camera.isoMin,
    isoMax: camera.isoMax,
    imageStabilization: camera.imageStabilization,
    afPoints: camera.afPoints,
    afType: camera.afType,
    maxVideoResolution: camera.maxVideoResolution,
    videoFeatures: camera.videoFeatures,
    viewfinderType: camera.viewfinderType,
    viewfinderMagnification: camera.viewfinderMagnification,
    lcdSize: camera.lcdSize,
    lcdResolution: camera.lcdResolution,
    touchscreen: camera.touchscreen,
    mount: camera.mount,
    continuousShootingSpeed: camera.continuousShootingSpeed,
    shutterSpeedMin: camera.shutterSpeedMin,
    shutterSpeedMax: camera.shutterSpeedMax,
    cardSlots: camera.cardSlots,
    cardType: camera.cardType,
    wifi: camera.wifi,
    bluetooth: camera.bluetooth,
    usb: camera.usb,
    weightGrams: camera.weightGrams,
    dimensions: camera.dimensions,
    weatherSealed: camera.weatherSealed,
    priceMsrp: camera.priceMsrp,
    releaseDate: camera.releaseDate.toISOString(),
    imageUrl: camera.imageUrl,
    thumbnailUrl: camera.thumbnailUrl,
    description: camera.description,
    avgRating,
    reviewCount: camera.reviews.length,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get all cameras with review stats, ordered by release date (newest first). */
export async function getAllCameras(): Promise<CameraWithStats[]> {
  const cameras = await prisma.camera.findMany({
    include: { reviews: { select: { rating: true } } },
    orderBy: { releaseDate: "desc" },
  });
  return cameras.map(serializeCamera);
}

/** Get featured cameras for the homepage (cameras with most data, newest first). */
export async function getFeaturedCameras(
  limit: number = 6
): Promise<CameraWithStats[]> {
  const cameras = await prisma.camera.findMany({
    where: { megapixels: { gt: 0 } }, // Only show cameras with actual spec data
    include: { reviews: { select: { rating: true } } },
    orderBy: { megapixels: "desc" },
    take: limit,
  });
  return cameras.map(serializeCamera);
}

/** Get a single camera by slug with full reviews and author data. */
export async function getCameraBySlug(
  slug: string
): Promise<CameraDetail | null> {
  const camera = await prisma.camera.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!camera) return null;

  const ratings = camera.reviews.map((r: { rating: number }) => r.rating);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
      : 0;

  return {
    id: camera.id,
    slug: camera.slug,
    brand: camera.brand,
    model: camera.model,
    bodyType: camera.bodyType,
    sensorSize: camera.sensorSize,
    megapixels: camera.megapixels,
    isoMin: camera.isoMin,
    isoMax: camera.isoMax,
    imageStabilization: camera.imageStabilization,
    afPoints: camera.afPoints,
    afType: camera.afType,
    maxVideoResolution: camera.maxVideoResolution,
    videoFeatures: camera.videoFeatures,
    viewfinderType: camera.viewfinderType,
    viewfinderMagnification: camera.viewfinderMagnification,
    lcdSize: camera.lcdSize,
    lcdResolution: camera.lcdResolution,
    touchscreen: camera.touchscreen,
    mount: camera.mount,
    continuousShootingSpeed: camera.continuousShootingSpeed,
    shutterSpeedMin: camera.shutterSpeedMin,
    shutterSpeedMax: camera.shutterSpeedMax,
    cardSlots: camera.cardSlots,
    cardType: camera.cardType,
    wifi: camera.wifi,
    bluetooth: camera.bluetooth,
    usb: camera.usb,
    weightGrams: camera.weightGrams,
    dimensions: camera.dimensions,
    weatherSealed: camera.weatherSealed,
    priceMsrp: camera.priceMsrp,
    releaseDate: camera.releaseDate.toISOString(),
    imageUrl: camera.imageUrl,
    thumbnailUrl: camera.thumbnailUrl,
    description: camera.description,
    avgRating,
    reviewCount: camera.reviews.length,
    reviews: camera.reviews.map((r: { id: string; rating: number; title: string; comment: string; pros: string | null; cons: string | null; verified: boolean; helpful: number; createdAt: Date; cameraId: string; author: { id: string; username: string; name: string | null; avatarUrl: string | null } }) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      pros: r.pros,
      cons: r.cons,
      verified: r.verified,
      helpful: r.helpful,
      createdAt: r.createdAt.toISOString(),
      cameraId: r.cameraId,
      author: r.author,
    })),
  };
}

/** Get all cameras for a specific brand. */
export async function getCamerasByBrand(
  brand: string
): Promise<CameraWithStats[]> {
  const cameras = await prisma.camera.findMany({
    where: { brand: { equals: brand, mode: "insensitive" } },
    include: { reviews: { select: { rating: true } } },
    orderBy: { releaseDate: "desc" },
  });
  return cameras.map(serializeCamera);
}

/** Search cameras by brand or model name. */
export async function searchCameras(
  query: string
): Promise<CameraWithStats[]> {
  const cameras = await prisma.camera.findMany({
    where: {
      OR: [
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { reviews: { select: { rating: true } } },
    orderBy: { releaseDate: "desc" },
    take: 20,
  });
  return cameras.map(serializeCamera);
}

/** Get multiple cameras by slug for comparison view. */
export async function getComparisonData(
  slugs: string[]
): Promise<CameraWithStats[]> {
  const cameras = await prisma.camera.findMany({
    where: { slug: { in: slugs } },
    include: { reviews: { select: { rating: true } } },
  });
  return cameras.map(serializeCamera);
}

/** Get all camera slugs (for generateStaticParams). */
export async function getAllCameraSlugs(): Promise<string[]> {
  const cameras = await prisma.camera.findMany({
    select: { slug: true },
  });
  return cameras.map((c: { slug: string }) => c.slug);
}
