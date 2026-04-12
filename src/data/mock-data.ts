// =============================================================================
// Mock Data — Realistic Camera Specs & Reviews
// =============================================================================
// Contains production-accurate specifications for three flagship cameras:
//   1. Sony A7R V     — high-resolution landscape/studio beast
//   2. Canon EOS R5   — hybrid photo/video workhorse
//   3. Nikon Z8       — flagship performance in compact body
//
// Plus realistic user reviews with varied ratings and detailed commentary.
// =============================================================================

import { Camera, User, Review } from "@/types";

// ─── Mock Users ──────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: "usr_landscape_dan",
    email: "dan.morrison@example.com",
    username: "landscape_dan",
    name: "Daniel Morrison",
    avatarUrl: null,
    bio: "Landscape photographer based in Colorado. 15 years shooting with Sony.",
  },
  {
    id: "usr_cine_sarah",
    email: "sarah.chen@example.com",
    username: "cine_sarah",
    name: "Sarah Chen",
    avatarUrl: null,
    bio: "Cinematographer & content creator. Canon shooter since the 5D days.",
  },
  {
    id: "usr_street_mike",
    email: "mike.tanaka@example.com",
    username: "street_mike",
    name: "Mike Tanaka",
    avatarUrl: null,
    bio: "Street & documentary photographer. Always looking for the decisive moment.",
  },
  {
    id: "usr_wedding_lisa",
    email: "lisa.park@example.com",
    username: "wedding_lisa",
    name: "Lisa Park",
    avatarUrl: null,
    bio: "Wedding & portrait photographer. Nikon faithful since D700 days.",
  },
  {
    id: "usr_astro_james",
    email: "james.webb@example.com",
    username: "astro_james",
    name: "James Webb",
    avatarUrl: null,
    bio: "Astrophotographer and night-sky enthusiast. Pushing sensors to their limits.",
  },
];

// ─── Mock Reviews ────────────────────────────────────────────────────────────

const sonyReviews: Review[] = [
  {
    id: "rev_sony_1",
    rating: 5,
    title: "The ultimate landscape camera — bar none",
    comment:
      "I've been shooting landscapes for 15 years and the A7R V has completely redefined what I expect from a camera body. The 61MP sensor captures an absurd amount of detail — I've printed images at 40×60 inches with zero visible degradation. The AI-powered autofocus is a game-changer for wildlife encounters on the trail. Even in dim twilight conditions, it locks onto subjects with eerie precision. IBIS lets me shoot handheld at 1/4s and get sharp results. Battery life is finally competitive with DSLRs. This is Sony's masterpiece.",
    pros: "61MP detail is extraordinary for large prints\nAI autofocus tracks birds and animals flawlessly\n8-stop IBIS is best-in-class\nDual card slots (CFexpress Type A + SD)\nExcellent weather sealing for outdoor work",
    cons: "File sizes are massive — budget for fast storage\nMenu system still has room for improvement\nPrice is steep at $3,899",
    verified: true,
    helpful: 47,
    createdAt: "2024-11-15T09:30:00Z",
    author: mockUsers[0],
    cameraId: "cam_sony_a7rv",
  },
  {
    id: "rev_sony_2",
    rating: 4,
    title: "Incredible sensor, but the ergonomics need work",
    comment:
      "Coming from a Canon 5D IV, the image quality jump is staggering. The dynamic range at base ISO is easily 15+ stops, and the color science has matured beautifully since the A7R III days. However, I still find Canon's ergonomics more intuitive — the button layout and menu system feel like they were designed by committee. The EVF is stunning though, and the new 4-axis multi-angle screen is brilliant for low-angle compositions. Overall a phenomenal camera that loses one star purely on usability.",
    pros: "Best-in-class dynamic range\nColor science has improved dramatically\n4-axis tilt screen is innovative\nSuperb EVF with 9.44M dots",
    cons: "Button layout isn't as intuitive as Canon/Nikon\nMenu system can be overwhelming\nSlightly front-heavy with large lenses",
    verified: true,
    helpful: 32,
    createdAt: "2024-10-22T14:15:00Z",
    author: mockUsers[2],
    cameraId: "cam_sony_a7rv",
  },
  {
    id: "rev_sony_3",
    rating: 5,
    title: "Astrophotography perfection",
    comment:
      "For astrophotography, the A7R V is in a league of its own. The 61MP sensor resolves individual stars that lower-resolution cameras simply blur together. Star Eater is finally fixed — long exposure performance is phenomenal. Combined with Sony's bright primes (14mm f/1.8, 24mm f/1.4), this setup produces milky way images that rival medium format. The Bright Monitoring mode in the EVF is a godsend for composing in the dark. Worth every penny.",
    pros: "61MP resolves stars that other cameras miss\nNo more Star Eater issues\nBright Monitoring mode for nighttime EVF use\nExcellent high-ISO noise handling up to ISO 6400",
    cons: "Heavy for backcountry astrophotography trips\nWish it had a built-in intervalometer display\nCFexpress Type A cards are expensive",
    verified: false,
    helpful: 28,
    createdAt: "2025-01-08T22:45:00Z",
    author: mockUsers[4],
    cameraId: "cam_sony_a7rv",
  },
];

const canonReviews: Review[] = [
  {
    id: "rev_canon_1",
    rating: 5,
    title: "The hybrid camera I've been waiting for",
    comment:
      "As someone who shoots both narrative short films and commercial photography, the R5 is the first camera where I don't feel like I'm compromising in either discipline. 8K RAW internal recording is absurd at this price point — the footage grades beautifully and the rolling shutter is very well controlled. For stills, 45MP is the sweet spot: enough resolution for billboard crops without drowning in file sizes. Canon's color science remains king for skin tones. The Dual Pixel CMOS AF II tracks eyes through obstacles like magic. This camera has earned its place in my kit permanently.",
    pros: "8K RAW internal at this price is unmatched\nCanon color science is gorgeous for portraits\nDual Pixel AF II is witchcraft-level good\n45MP sweet spot for files vs. resolution\nCFexpress + SD dual slot flexibility",
    cons: "Overheating in 8K can limit recording to ~20min\nRolling shutter visible in fast pans at 8K\nBattery drains fast in video mode",
    verified: true,
    helpful: 56,
    createdAt: "2024-09-03T11:20:00Z",
    author: mockUsers[1],
    cameraId: "cam_canon_r5",
  },
  {
    id: "rev_canon_2",
    rating: 4,
    title: "Amazing all-rounder, thermals hold it back from perfection",
    comment:
      "The Canon R5 does almost everything right. Image quality is spectacular, autofocus is best-in-class for people, and the build quality is tank-like. I use it for weddings and the eye-AF never misses — even through veils and in candlelit reception halls. The only real issue is thermal management during extended video. If you're primarily a photographer who occasionally shoots video, this is near-perfect. If you're a dedicated videographer doing long-form content, consider the R5 C instead.",
    pros: "Eye-AF works through veils and obstacles\nBuild quality is exceptional\nCanon's lens ecosystem is unmatched\nGreat ergonomics and intuitive menus",
    cons: "Thermal limits on extended 8K/4K HQ recording\nR5 Mark II exists now — this model is aging\nLP-E6NH batteries aren't cheap",
    verified: true,
    helpful: 41,
    createdAt: "2024-12-01T16:45:00Z",
    author: mockUsers[3],
    cameraId: "cam_canon_r5",
  },
];

const nikonReviews: Review[] = [
  {
    id: "rev_nikon_1",
    rating: 5,
    title: "Z9 power in a smaller body — Nikon nailed it",
    comment:
      "The Z8 is essentially a Nikon Z9 without the integrated grip, and I mean that as the highest compliment. 45.7MP stacked sensor with zero blackout shooting at 20fps is extraordinary. The subject detection AF recognizes everything from cars to birds to planes. 8K60 internal recording with no recording limits makes this a true cinema tool. What really sets it apart is the build: it's significantly lighter than the Z9 while retaining the same weather sealing. For wedding and event shooters who want flagship performance without the bulk, this is the one.",
    pros: "Stacked sensor = zero blackout at 20fps\n8K60 internal with no time limits\nSubject detection AF is phenomenal\nSignificantly lighter than Z9\nExpeed 7 processor is blazing fast",
    cons: "No CFexpress Type A support (Type B only)\nEN-EL15c battery life is adequate but not exceptional\nZ-mount lens selection still growing",
    verified: true,
    helpful: 39,
    createdAt: "2025-02-14T08:30:00Z",
    author: mockUsers[3],
    cameraId: "cam_nikon_z8",
  },
  {
    id: "rev_nikon_2",
    rating: 5,
    title: "From Sony to Nikon — zero regrets",
    comment:
      "I switched from a Sony A1 to the Z8 and haven't looked back. The ergonomics are miles ahead — the deep grip and logical button placement make this camera disappear in your hands. Image quality is exceptional with rich colors and outstanding dynamic range. The 3D tracking AF is the best I've ever used for birds in flight. Nikon's Picture Controls give me gorgeous JPEGs straight out of camera. The only thing I miss from Sony is the breadth of native lenses, but Nikon is catching up fast.",
    pros: "Best ergonomics of any mirrorless camera\n3D tracking for birds in flight is elite\nRich, natural color rendering\nDeep grip is supremely comfortable\nPre-release capture feature is revolutionary",
    cons: "Z-mount ecosystem still maturing\nDual CFexpress Type B makes cards expensive\nNo fully articulating screen (tilt only)",
    verified: false,
    helpful: 25,
    createdAt: "2025-03-01T19:00:00Z",
    author: mockUsers[0],
    cameraId: "cam_nikon_z8",
  },
];

// ─── Mock Cameras ────────────────────────────────────────────────────────────

export const mockCameras: Camera[] = [
  {
    id: "cam_sony_a7rv",
    slug: "sony-a7rv",
    brand: "Sony",
    model: "A7R V",
    bodyType: "MIRRORLESS",
    sensorSize: "FULL_FRAME",
    megapixels: 61.0,
    isoMin: 100,
    isoMax: 102400,
    imageStabilization: true,
    afPoints: 693,
    afType: "Hybrid Phase-Detection with AI Processing Unit",
    maxVideoResolution: "8K 24fps",
    videoFeatures: "4K 60fps, S-Log3, S-Cinetone, 10-bit 4:2:2",
    viewfinderType: "OLED EVF",
    viewfinderMagnification: 0.9,
    lcdSize: 3.2,
    lcdResolution: "2.1M dots",
    touchscreen: true,
    mount: "SONY_E",
    continuousShootingSpeed: 10,
    shutterSpeedMin: "1/8000",
    shutterSpeedMax: '30"',
    cardSlots: 2,
    cardType: "CFexpress Type A / SD UHS-II",
    wifi: true,
    bluetooth: true,
    usb: "USB-C 3.2 Gen 2",
    weightGrams: 723,
    dimensions: "131.3 × 96.9 × 82.4 mm",
    weatherSealed: true,
    priceMsrp: 389900,
    releaseDate: "2022-11-01",
    imageUrl: "/images/cameras/sony-a7rv.png",
    thumbnailUrl: "/images/cameras/sony-a7rv.png",
    description:
      "The Sony A7R V pushes the boundaries of resolution with its 61MP back-illuminated Exmor R CMOS sensor and a dedicated AI processing unit that revolutionizes autofocus subject recognition. Featuring 8-stop in-body image stabilization, 8K video capability, and a newly designed 4-axis multi-angle LCD, the A7R V is Sony's most advanced high-resolution camera to date.",
    reviews: sonyReviews,
  },
  {
    id: "cam_canon_r5",
    slug: "canon-eos-r5",
    brand: "Canon",
    model: "EOS R5",
    bodyType: "MIRRORLESS",
    sensorSize: "FULL_FRAME",
    megapixels: 45.0,
    isoMin: 100,
    isoMax: 51200,
    imageStabilization: true,
    afPoints: 1053,
    afType: "Dual Pixel CMOS AF II",
    maxVideoResolution: "8K 30fps RAW",
    videoFeatures: "4K 120fps, Canon Log 3, HDR PQ, 10-bit 4:2:2",
    viewfinderType: "OLED EVF",
    viewfinderMagnification: 0.76,
    lcdSize: 3.2,
    lcdResolution: "2.1M dots",
    touchscreen: true,
    mount: "CANON_RF",
    continuousShootingSpeed: 20,
    shutterSpeedMin: "1/8000",
    shutterSpeedMax: '30"',
    cardSlots: 2,
    cardType: "CFexpress Type B / SD UHS-II",
    wifi: true,
    bluetooth: true,
    usb: "USB-C 3.2 Gen 2",
    weightGrams: 738,
    dimensions: "138.5 × 97.5 × 88.0 mm",
    weatherSealed: true,
    priceMsrp: 389900,
    releaseDate: "2020-07-01",
    imageUrl: "/images/cameras/canon-eos-r5.png",
    thumbnailUrl: "/images/cameras/canon-eos-r5.png",
    description:
      "The Canon EOS R5 is a groundbreaking hybrid mirrorless camera that delivers 45MP stills and internal 8K RAW video recording. Featuring Canon's renowned Dual Pixel CMOS AF II with deep learning-based subject tracking, in-body image stabilization up to 8 stops, and 20fps electronic shutter burst shooting, the EOS R5 bridges the gap between professional photography and cinema production.",
    reviews: canonReviews,
  },
  {
    id: "cam_nikon_z8",
    slug: "nikon-z8",
    brand: "Nikon",
    model: "Z8",
    bodyType: "MIRRORLESS",
    sensorSize: "FULL_FRAME",
    megapixels: 45.7,
    isoMin: 64,
    isoMax: 25600,
    imageStabilization: true,
    afPoints: 493,
    afType: "Hybrid Phase-Detection with 3D Tracking",
    maxVideoResolution: "8K 60fps",
    videoFeatures: "4K 120fps, N-Log, HLG, 12-bit N-RAW, ProRes 422 HQ",
    viewfinderType: "OLED EVF",
    viewfinderMagnification: 0.8,
    lcdSize: 3.2,
    lcdResolution: "2.1M dots",
    touchscreen: true,
    mount: "NIKON_Z",
    continuousShootingSpeed: 20,
    shutterSpeedMin: "1/32000",
    shutterSpeedMax: '900"',
    cardSlots: 2,
    cardType: "CFexpress Type B / SD UHS-II",
    wifi: true,
    bluetooth: true,
    usb: "USB-C 3.2 Gen 2",
    weightGrams: 910,
    dimensions: "144 × 118.5 × 83.5 mm",
    weatherSealed: true,
    priceMsrp: 399500,
    releaseDate: "2023-06-01",
    imageUrl: "/images/cameras/nikon-z8.png",
    thumbnailUrl: "/images/cameras/nikon-z8.png",
    description:
      "The Nikon Z8 packs the power of the flagship Z9 into a more compact, grip-less body. Built around a 45.7MP stacked CMOS sensor with an EXPEED 7 processor, it delivers zero-blackout shooting at 20fps, internal 8K60 video with no recording limits, and Nikon's most sophisticated subject-detection autofocus system. Pre-release capture and pixel-shift shooting round out a truly professional feature set.",
    reviews: nikonReviews,
  },
];

// ─── Helper Utilities ────────────────────────────────────────────────────────

/** Look up a camera by its URL slug. Returns undefined if not found. */
export function getCameraBySlug(slug: string): Camera | undefined {
  return mockCameras.find((c) => c.slug === slug);
}

/** Compute the average star rating for a camera's reviews (0 if no reviews). */
export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/** Format price in cents to a human-readable USD string. */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "Price TBA";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Format a  sensor size enum value to a display string. */
export function formatSensorSize(size: string): string {
  const map: Record<string, string> = {
    FULL_FRAME: "Full Frame (35mm)",
    APS_C: "APS-C",
    MICRO_FOUR_THIRDS: "Micro Four Thirds",
    MEDIUM_FORMAT: "Medium Format",
    ONE_INCH: '1"',
    OTHER: "Other",
  };
  return map[size] || size;
}

/** Format a lens mount enum value to a display string. */
export function formatMount(mount: string): string {
  const map: Record<string, string> = {
    SONY_E: "Sony E-Mount",
    CANON_RF: "Canon RF Mount",
    NIKON_Z: "Nikon Z Mount",
    FUJIFILM_X: "Fujifilm X Mount",
    FUJIFILM_GFX: "Fujifilm GFX Mount",
    MICRO_FOUR_THIRDS: "Micro Four Thirds",
    LEICA_L: "Leica L-Mount",
    LEICA_M: "Leica M Mount",
    CANON_EF: "Canon EF Mount",
    NIKON_F: "Nikon F Mount",
    PENTAX_K: "Pentax K Mount",
    OTHER: "Other",
  };
  return map[mount] || mount;
}

/** Format body type enum to display string. */
export function formatBodyType(type: string): string {
  const map: Record<string, string> = {
    MIRRORLESS: "Mirrorless",
    DSLR: "DSLR",
    COMPACT: "Compact",
    MEDIUM_FORMAT: "Medium Format",
    CINEMA: "Cinema Camera",
    ACTION: "Action Camera",
    OTHER: "Other",
  };
  return map[type] || type;
}
