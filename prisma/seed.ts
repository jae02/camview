/**
 * =============================================================================
 * Prisma Seed Script — Camera Specs & Review Community
 * =============================================================================
 * Reads camera data from data/seeds/all_cameras_seed.json and upserts into
 * the database via Prisma. Also creates demo users and sample reviews
 * from the scraped pros/cons data.
 *
 * Usage:
 *   npx prisma db seed
 *   # or
 *   npx tsx prisma/seed.ts
 * =============================================================================
 */

import "dotenv/config";
import { PrismaClient, SensorSize, LensMount, BodyType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

// Extract the direct PostgreSQL URL
function getDirectUrl(): string {
  // Prefer explicit direct URL
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL;
  // Decode from Prisma Postgres API key
  const raw = process.env.DATABASE_URL || "";
  const match = raw.match(/api_key=([A-Za-z0-9+/=]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
      if (decoded.databaseUrl) return decoded.databaseUrl;
    } catch { /* fall through */ }
  }
  return raw;
}

const pool = new pg.Pool({ connectionString: getDirectUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Types for the raw seed data
// ---------------------------------------------------------------------------

interface ProsCons {
  pros: string[];
  cons: string[];
}

interface RawCamera {
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
  _prosCons?: ProsCons;
  _rawSpecs?: unknown;
  _koreanSpecs?: unknown;
}

// ---------------------------------------------------------------------------
// Enum Validators — ensure values match Prisma enums
// ---------------------------------------------------------------------------

const VALID_SENSOR_SIZES = new Set<string>(Object.values(SensorSize));
const VALID_LENS_MOUNTS = new Set<string>(Object.values(LensMount));
const VALID_BODY_TYPES = new Set<string>(Object.values(BodyType));

function validateSensorSize(val: string): SensorSize {
  return VALID_SENSOR_SIZES.has(val) ? (val as SensorSize) : SensorSize.OTHER;
}

function validateLensMount(val: string): LensMount {
  return VALID_LENS_MOUNTS.has(val) ? (val as LensMount) : LensMount.OTHER;
}

function validateBodyType(val: string): BodyType {
  return VALID_BODY_TYPES.has(val) ? (val as BodyType) : BodyType.OTHER;
}

// ---------------------------------------------------------------------------
// Demo Users — Seeded once for review attribution
// ---------------------------------------------------------------------------

const DEMO_USERS = [
  {
    id: "seed_usr_01",
    email: "alex.rivers@example.com",
    username: "alex_rivers",
    name: "Alex Rivers",
    bio: "Professional landscape photographer with 10+ years of experience.",
  },
  {
    id: "seed_usr_02",
    email: "maya.kim@example.com",
    username: "maya_kim",
    name: "Maya Kim",
    bio: "Hybrid shooter — equal parts stills and cinema. Based in Seoul.",
  },
  {
    id: "seed_usr_03",
    email: "carlos.vega@example.com",
    username: "carlos_vega",
    name: "Carlos Vega",
    bio: "Wedding & events photographer. Nikon loyalist since D3 days.",
  },
  {
    id: "seed_usr_04",
    email: "emma.tanaka@example.com",
    username: "emma_tanaka",
    name: "Emma Tanaka",
    bio: "Street photographer and camera tech reviewer.",
  },
  {
    id: "seed_usr_05",
    email: "james.smith@example.com",
    username: "james_smith",
    name: "James Smith",
    bio: "Astrophotographer and night-sky enthusiast.",
  },
];

// ---------------------------------------------------------------------------
// Review Generator — Creates realistic reviews from pros/cons
// ---------------------------------------------------------------------------

const REVIEW_TEMPLATES = [
  {
    titleTemplate: (brand: string, model: string) =>
      `Excellent choice — the ${brand} ${model} delivers`,
    rating: 5,
    commentTemplate: (brand: string, model: string) =>
      `After months of shooting with the ${brand} ${model}, I can confidently say this is one of the best cameras in its class. The image quality is outstanding, the autofocus system is incredibly responsive, and the build quality inspires confidence. Highly recommended for anyone serious about photography.`,
  },
  {
    titleTemplate: (brand: string, model: string) =>
      `Great camera with minor quirks — ${brand} ${model}`,
    rating: 4,
    commentTemplate: (brand: string, model: string) =>
      `The ${brand} ${model} is a very capable camera that ticks most boxes. Image quality and autofocus performance are top-tier. I knocked one star off for ergonomic nitpicks and some menu complexity, but overall this is an outstanding tool for professionals and enthusiasts alike.`,
  },
  {
    titleTemplate: (_brand: string, model: string) =>
      `Solid performer — ${model} review`,
    rating: 4,
    commentTemplate: (brand: string, model: string) =>
      `I've been using the ${brand} ${model} for event and portrait work. The autofocus tracking is reliable, dynamic range is excellent, and battery life has improved over the predecessor. The video capabilities are a nice bonus. A few UI quirks aside, it's a joy to shoot with.`,
  },
];

function generateReviews(
  camera: RawCamera,
  userIds: string[]
): Array<{
  rating: number;
  title: string;
  comment: string;
  pros: string | null;
  cons: string | null;
  verified: boolean;
  helpful: number;
  authorId: string;
}> {
  const prosCons = camera._prosCons || { pros: [], cons: [] };

  // Generate 2–3 reviews per camera
  const reviewCount = Math.min(REVIEW_TEMPLATES.length, userIds.length);
  const reviews = [];

  for (let i = 0; i < reviewCount; i++) {
    const template = REVIEW_TEMPLATES[i];
    const userId = userIds[i % userIds.length];

    // Take first 3–5 pros/cons for the review
    const topPros = prosCons.pros.slice(0, 3 + Math.floor(Math.random() * 3));
    const topCons = prosCons.cons.slice(0, 2 + Math.floor(Math.random() * 2));

    reviews.push({
      rating: template.rating,
      title: template.titleTemplate(camera.brand, camera.model),
      comment: template.commentTemplate(camera.brand, camera.model),
      pros: topPros.length > 0 ? topPros.join("\n") : null,
      cons: topCons.length > 0 ? topCons.join("\n") : null,
      verified: Math.random() > 0.3, // 70% verified
      helpful: Math.floor(Math.random() * 50),
      authorId: userId,
    });
  }

  return reviews;
}

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Load seed data ──────────────────────────────────────────────────────
  const seedPath = path.resolve(
    __dirname,
    "..",
    "data",
    "seeds",
    "all_cameras_seed.json"
  );

  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`);
    console.error(
      "   Run the scraper first, then merge: npx tsx scripts/merge-seeds.ts"
    );
    process.exit(1);
  }

  const rawData: RawCamera[] = JSON.parse(
    fs.readFileSync(seedPath, "utf-8")
  );
  console.log(`📂 Loaded ${rawData.length} cameras from seed file\n`);

  // ── Seed demo users ─────────────────────────────────────────────────────
  console.log("👤 Seeding demo users...");
  const userIds: string[] = [];

  for (const user of DEMO_USERS) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, bio: user.bio },
      create: user,
    });
    userIds.push(created.id);
    console.log(`  ✓ ${created.username} (${created.email})`);
  }
  console.log();

  // ── Seed cameras ────────────────────────────────────────────────────────
  console.log("📷 Seeding cameras...");
  let successCount = 0;
  let skipCount = 0;

  for (const raw of rawData) {
    try {
      // Validate and sanitize
      const cameraData = {
        slug: raw.slug,
        brand: raw.brand,
        model: raw.model,
        bodyType: validateBodyType(raw.bodyType),
        sensorSize: validateSensorSize(raw.sensorSize),
        megapixels: raw.megapixels || 0,
        isoMin: raw.isoMin || 100,
        isoMax: raw.isoMax || 25600,
        imageStabilization: raw.imageStabilization ?? false,
        afPoints: raw.afPoints || 0,
        afType: raw.afType || "Unknown",
        maxVideoResolution: raw.maxVideoResolution || "Unknown",
        videoFeatures: raw.videoFeatures,
        viewfinderType: raw.viewfinderType || "Unknown",
        viewfinderMagnification: raw.viewfinderMagnification,
        lcdSize: raw.lcdSize || 3.0,
        lcdResolution: raw.lcdResolution || "Unknown",
        touchscreen: raw.touchscreen ?? true,
        mount: validateLensMount(raw.mount),
        continuousShootingSpeed: raw.continuousShootingSpeed || 0,
        shutterSpeedMin: raw.shutterSpeedMin || "1/4000",
        shutterSpeedMax: raw.shutterSpeedMax || '30"',
        cardSlots: raw.cardSlots || 1,
        cardType: raw.cardType || "SD",
        wifi: raw.wifi ?? false,
        bluetooth: raw.bluetooth ?? false,
        usb: raw.usb,
        weightGrams: raw.weightGrams || 0,
        dimensions: raw.dimensions || "Unknown",
        weatherSealed: raw.weatherSealed ?? false,
        priceMsrp: raw.priceMsrp,
        releaseDate: new Date(raw.releaseDate),
        imageUrl: raw.imageUrl,
        thumbnailUrl: raw.thumbnailUrl,
        description: raw.description,
      };

      const camera = await prisma.camera.upsert({
        where: { slug: raw.slug },
        update: cameraData,
        create: cameraData,
      });

      // Generate and seed reviews for this camera
      const reviews = generateReviews(raw, userIds);
      for (const review of reviews) {
        try {
          await prisma.review.upsert({
            where: {
              authorId_cameraId: {
                authorId: review.authorId,
                cameraId: camera.id,
              },
            },
            update: {
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              pros: review.pros,
              cons: review.cons,
            },
            create: {
              ...review,
              cameraId: camera.id,
            },
          });
        } catch {
          // Skip duplicate reviews silently
        }
      }

      successCount++;
      console.log(
        `  ✓ ${camera.brand} ${camera.model} (${camera.slug}) + ${reviews.length} reviews`
      );
    } catch (err) {
      skipCount++;
      console.error(`  ✕ Failed: ${raw.slug} —`, err);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  🌱 SEED COMPLETE`);
  console.log(`     ✓ ${successCount} cameras seeded`);
  if (skipCount > 0) console.log(`     ✕ ${skipCount} cameras skipped`);
  console.log(`     👤 ${userIds.length} demo users`);

  const totalReviews = await prisma.review.count();
  console.log(`     📝 ${totalReviews} reviews total`);
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
