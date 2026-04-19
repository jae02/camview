/**
 * =============================================================================
 * Prisma Seed Script — Camera Specs & Review Community
 * =============================================================================
 * Reads camera data from data/seeds/all_cameras_seed.json, generates realistic
 * user profiles, camera descriptions, and diverse reviews, then upserts
 * everything into the database via Prisma.
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
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL;
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL;
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
// Enum Validators
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
// Deterministic seeded random number generator (Mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Realistic Korean Photography Community Users (20 users)
// ---------------------------------------------------------------------------

const USERS = [
  {
    id: "usr_landscape_01",
    email: "park.jihoon@gmail.com",
    username: "jihoon_park",
    name: "박지훈",
    bio: "풍경 전문 사진작가 | 국립공원 촬영 10년차 | 설악산·지리산·한라산의 사계절을 담습니다",
  },
  {
    id: "usr_portrait_02",
    email: "kim.soojin@naver.com",
    username: "soojin_studio",
    name: "김수진",
    bio: "인물·웨딩 포토그래퍼 | 강남 스튜디오 운영 | 자연광 촬영 전문",
  },
  {
    id: "usr_street_03",
    email: "lee.minhyuk@gmail.com",
    username: "minhyuk_snap",
    name: "이민혁",
    bio: "서울 스트릿 포토그래퍼 | 을지로·익선동·망원동 골목 기록 | 필름 감성을 디지털로",
  },
  {
    id: "usr_wildlife_04",
    email: "choi.yuna@kakao.com",
    username: "yuna_wildlife",
    name: "최유나",
    bio: "야생동물·생태 사진 전문 | 조류 촬영 8년차 | 낙동강 하구 철새 기록자",
  },
  {
    id: "usr_astro_05",
    email: "jung.taewoo@gmail.com",
    username: "taewoo_stars",
    name: "정태우",
    bio: "천체 사진 및 타임랩스 | 영양 자연야유원 단골 | 은하수·별궤적 촬영",
  },
  {
    id: "usr_video_06",
    email: "han.soyeon@naver.com",
    username: "soyeon_film",
    name: "한소연",
    bio: "영상 크리에이터 | 시네마틱 여행 영상 제작 | 4K/LOG 촬영 워크플로우",
  },
  {
    id: "usr_product_07",
    email: "shin.dongho@gmail.com",
    username: "dongho_product",
    name: "신동호",
    bio: "제품·음식 사진 전문 | 쿠팡·네이버 스마트스토어 촬영 파트너 | 라이트박스 마스터",
  },
  {
    id: "usr_sport_08",
    email: "kang.mirae@daum.net",
    username: "mirae_sports",
    name: "강미래",
    bio: "스포츠 전문 포토그래퍼 | KBO 야구·K리그 축구 현장 촬영 | 빠른 AF가 생명",
  },
  {
    id: "usr_travel_09",
    email: "oh.junseok@gmail.com",
    username: "junseok_travel",
    name: "오준석",
    bio: "여행 포토그래퍼 | 40개국 촬영 경험 | 가벼운 장비로 최고의 결과물을 추구합니다",
  },
  {
    id: "usr_wedding_10",
    email: "yoon.hyejin@naver.com",
    username: "hyejin_bridal",
    name: "윤혜진",
    bio: "웨딩 스냅 전문 | 연 150건 이상 스냅 촬영 | 자연스럽고 감성적인 순간을 포착합니다",
  },
  {
    id: "usr_macro_11",
    email: "baek.sangwoo@gmail.com",
    username: "sangwoo_macro",
    name: "백상우",
    bio: "접사·곤충 촬영 전문 | 매크로 렌즈 수집가 | 자연의 미세한 아름다움을 기록합니다",
  },
  {
    id: "usr_reviewer_12",
    email: "lim.eunji@naver.com",
    username: "eunji_review",
    name: "임은지",
    bio: "카메라 장비 리뷰어 | 유튜브 구독자 12만 | 객관적이고 꼼꼼한 비교 리뷰",
  },
  {
    id: "usr_architecture_13",
    email: "song.hyunwoo@gmail.com",
    username: "hyunwoo_archi",
    name: "송현우",
    bio: "건축·인테리어 사진 전문 | 틸트시프트 렌즈 활용 | 한옥부터 현대 건축까지",
  },
  {
    id: "usr_concert_14",
    email: "jang.minjae@daum.net",
    username: "minjae_concert",
    name: "장민재",
    bio: "공연·콘서트 전문 촬영 | 저조도 촬영의 달인 | 음악과 빛의 순간을 담습니다",
  },
  {
    id: "usr_fashion_15",
    email: "hwang.jiyeon@gmail.com",
    username: "jiyeon_fashion",
    name: "황지연",
    bio: "패션·뷰티 포토그래퍼 | 브레이브걸스·서울패션위크 촬영 | 트렌디한 시각",
  },
  {
    id: "usr_beginner_16",
    email: "na.seunghyun@naver.com",
    username: "seunghyun_photo",
    name: "나승현",
    bio: "취미 사진가 3년차 | 일상·반려동물 촬영 | 아직 배우는 중이지만 열정만은 프로급!",
  },
  {
    id: "usr_timelapse_17",
    email: "seo.youngmin@gmail.com",
    username: "youngmin_timelapse",
    name: "서영민",
    bio: "타임랩스·하이퍼랩스 전문 | 서울 야경·계절 변화 기록 | 인내심이 최고의 장비",
  },
  {
    id: "usr_analog_18",
    email: "go.soohee@kakao.com",
    username: "soohee_analog",
    name: "고수희",
    bio: "필름 카메라 & 디지털 하이브리드 촬영 | 감성 사진 에세이 작가 | 빈티지 톤의 매력",
  },
  {
    id: "usr_press_19",
    email: "cha.wonjun@gmail.com",
    username: "wonjun_press",
    name: "차원준",
    bio: "보도·다큐멘터리 사진기자 | 전직 통신사 출신 | 현장의 진실을 렌즈에 담습니다",
  },
  {
    id: "usr_vlog_20",
    email: "yang.dabin@naver.com",
    username: "dabin_vlog",
    name: "양다빈",
    bio: "브이로그·유튜브 크리에이터 | 1인 촬영·편집 시스템 | 가성비 장비 추구",
  },
];

// ---------------------------------------------------------------------------
// Camera Description Generator — generates a Korean editorial description
// based on the actual specs of each camera
// ---------------------------------------------------------------------------

function generateDescription(cam: RawCamera): string {
  const brand = cam.brand;
  const model = cam.model;

  const sensorLabels: Record<string, string> = {
    FULL_FRAME: "풀프레임",
    APS_C: "APS-C",
    MICRO_FOUR_THIRDS: "마이크로 포서드",
    MEDIUM_FORMAT: "중형 포맷",
    ONE_INCH: "1인치",
    OTHER: "",
  };

  const bodyLabels: Record<string, string> = {
    MIRRORLESS: "미러리스",
    DSLR: "DSLR",
    COMPACT: "콤팩트",
    MEDIUM_FORMAT: "중형 포맷",
    CINEMA: "시네마",
    ACTION: "액션",
    OTHER: "",
  };

  const sensor = sensorLabels[cam.sensorSize] || cam.sensorSize;
  const body = bodyLabels[cam.bodyType] || cam.bodyType;
  const mp = cam.megapixels;
  const ibis = cam.imageStabilization;
  const af = cam.afPoints;
  const fps = cam.continuousShootingSpeed;
  const video = cam.maxVideoResolution;
  const weight = cam.weightGrams;
  const weather = cam.weatherSealed;
  const slots = cam.cardSlots;
  const year = cam.releaseDate ? new Date(cam.releaseDate).getFullYear() : "";

  // Build description parts
  const parts: string[] = [];

  // Opening line
  parts.push(
    `${brand} ${model}은(는) ${year}년에 출시된 ${sensor} ${body} 카메라로, ${mp > 0 ? `${mp}MP` : "고성능"} 센서를 탑재하여 뛰어난 이미지 품질을 제공합니다.`
  );

  // AF system
  if (af > 0) {
    parts.push(
      `${af}개의 AF 포인트를 갖춘 고급 오토포커스 시스템은 빠르고 정확한 피사체 추적을 가능하게 합니다.`
    );
  }

  // IBIS
  if (ibis) {
    parts.push(
      `바디 내 이미지 손떨림 보정(IBIS) 기능이 탑재되어 저속 셔터에서도 선명한 결과물을 얻을 수 있습니다.`
    );
  }

  // Continuous shooting
  if (fps > 0) {
    parts.push(
      `최대 ${fps}fps의 연속 촬영 속도로 빠르게 움직이는 피사체도 놓치지 않습니다.`
    );
  }

  // Video
  if (video && video !== "Unknown" && video !== "") {
    parts.push(`동영상은 ${video} 해상도까지 지원하여 영상 크리에이터에게도 적합합니다.`);
  }

  // Build quality
  const buildParts: string[] = [];
  if (weather) buildParts.push("방진방적 처리");
  if (slots > 1) buildParts.push(`듀얼 카드 슬롯(${slots}슬롯)`);
  if (weight > 0 && weight < 500) buildParts.push(`${weight}g의 경량 바디`);
  else if (weight >= 500) buildParts.push(`${weight}g의 견고한 바디`);

  if (buildParts.length > 0) {
    parts.push(`${buildParts.join(", ")}로 다양한 촬영 환경에서 안정적으로 사용할 수 있습니다.`);
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Review Generation — Camera-specific, diverse, and realistic
// ---------------------------------------------------------------------------

// Review archetypes based on user specialty and camera characteristics
interface ReviewTemplate {
  ratingRange: [number, number]; // min, max rating
  titleGen: (brand: string, model: string, userType: string) => string;
  commentGen: (cam: RawCamera, userName: string) => string;
}

// Specialties mapped to user IDs for deterministic assignment
const USER_SPECIALTIES: Record<string, string> = {
  usr_landscape_01: "풍경",
  usr_portrait_02: "인물",
  usr_street_03: "스트릿",
  usr_wildlife_04: "야생동물",
  usr_astro_05: "천체",
  usr_video_06: "영상",
  usr_product_07: "제품",
  usr_sport_08: "스포츠",
  usr_travel_09: "여행",
  usr_wedding_10: "웨딩",
  usr_macro_11: "접사",
  usr_reviewer_12: "리뷰",
  usr_architecture_13: "건축",
  usr_concert_14: "콘서트",
  usr_fashion_15: "패션",
  usr_beginner_16: "입문",
  usr_timelapse_17: "타임랩스",
  usr_analog_18: "감성",
  usr_press_19: "보도",
  usr_vlog_20: "브이로그",
};

// Generates a rating contextualized to how well a camera matches a user's specialty
function computeRating(cam: RawCamera, userId: string, rng: () => number): number {
  const specialty = USER_SPECIALTIES[userId] || "일반";
  let base = 3.5;

  // Landscape photographers love high-res, weather-sealed cameras
  if (specialty === "풍경") {
    if (cam.megapixels >= 40) base += 0.8;
    else if (cam.megapixels >= 24) base += 0.3;
    if (cam.weatherSealed) base += 0.3;
    if (cam.imageStabilization) base += 0.2;
    if (cam.sensorSize === "FULL_FRAME" || cam.sensorSize === "MEDIUM_FORMAT") base += 0.3;
  }

  // Portrait photographers value AF, full-frame, and viewfinder quality
  if (specialty === "인물") {
    if (cam.afPoints > 400) base += 0.5;
    if (cam.sensorSize === "FULL_FRAME") base += 0.5;
    if (cam.viewfinderMagnification && cam.viewfinderMagnification >= 0.75) base += 0.2;
    if (cam.megapixels >= 30) base += 0.3;
  }

  // Street photographers want small, light, quiet cameras
  if (specialty === "스트릿") {
    if (cam.weightGrams < 500) base += 0.7;
    else if (cam.weightGrams < 700) base += 0.3;
    else base -= 0.3;
    if (cam.bodyType === "COMPACT") base += 0.5;
    if (cam.touchscreen) base += 0.1;
  }

  // Wildlife/sports => fast AF, high FPS, weather sealing
  if (specialty === "야생동물" || specialty === "스포츠") {
    if (cam.continuousShootingSpeed >= 20) base += 0.8;
    else if (cam.continuousShootingSpeed >= 10) base += 0.5;
    if (cam.afPoints >= 500) base += 0.5;
    if (cam.weatherSealed) base += 0.3;
  }

  // Astrophotography => high ISO, full frame, low noise
  if (specialty === "천체") {
    if (cam.isoMax >= 51200) base += 0.5;
    if (cam.sensorSize === "FULL_FRAME") base += 0.5;
    if (cam.imageStabilization) base += 0.2;
    if (cam.megapixels >= 40) base += 0.3;
  }

  // Video creators value video specs
  if (specialty === "영상" || specialty === "브이로그") {
    const res = cam.maxVideoResolution.toLowerCase();
    if (res.includes("8k") || res.includes("7680")) base += 0.5;
    else if (res.includes("4k") || res.includes("3840")) base += 0.3;
    if (cam.imageStabilization) base += 0.3;
    if (cam.videoFeatures) base += 0.2;
    if (cam.touchscreen) base += 0.1;
  }

  // Travel photographers want light + versatile
  if (specialty === "여행") {
    if (cam.weightGrams < 500) base += 0.5;
    else if (cam.weightGrams < 700) base += 0.2;
    else base -= 0.2;
    if (cam.wifi) base += 0.2;
    if (cam.weatherSealed) base += 0.2;
  }

  // Wedding — dual slots, AF, full frame, IBIS
  if (specialty === "웨딩") {
    if (cam.cardSlots >= 2) base += 0.5;
    if (cam.afPoints >= 400) base += 0.3;
    if (cam.sensorSize === "FULL_FRAME") base += 0.3;
    if (cam.imageStabilization) base += 0.2;
    if (cam.isoMax >= 51200) base += 0.2;
  }

  // Concert/low-light
  if (specialty === "콘서트") {
    if (cam.isoMax >= 102400) base += 0.5;
    else if (cam.isoMax >= 51200) base += 0.3;
    if (cam.sensorSize === "FULL_FRAME") base += 0.3;
    if (cam.imageStabilization) base += 0.3;
    if (cam.afPoints >= 400) base += 0.2;
  }

  // Reviewer — balanced evaluation
  if (specialty === "리뷰") {
    if (cam.megapixels >= 30) base += 0.2;
    if (cam.afPoints >= 200) base += 0.2;
    if (cam.imageStabilization) base += 0.2;
    if (cam.weatherSealed) base += 0.1;
    if (cam.cardSlots >= 2) base += 0.1;
    const res = cam.maxVideoResolution.toLowerCase();
    if (res.includes("4k") || res.includes("8k")) base += 0.2;
  }

  // Beginner — values ease of use and price
  if (specialty === "입문") {
    if (cam.touchscreen) base += 0.3;
    if (cam.wifi) base += 0.2;
    if (cam.priceMsrp && cam.priceMsrp < 150000) base += 0.5;
    if (cam.weightGrams < 600) base += 0.3;
    if (cam.bodyType === "MIRRORLESS") base += 0.2;
  }

  // Add small random variation
  base += (rng() - 0.5) * 0.8;

  // Clamp to 1–5 and round to integer
  return Math.min(5, Math.max(1, Math.round(base)));
}

// Generate a review title in Korean
function generateReviewTitle(cam: RawCamera, rating: number, specialty: string, rng: () => number): string {
  const brand = cam.brand;
  const model = cam.model;

  const excellentTitles = [
    `${brand} ${model}, ${specialty} 촬영의 완벽한 파트너`,
    `${model} 석 달 사용기 — 기대 이상입니다`,
    `${specialty} 사진가가 본 ${model}의 진가`,
    `${model}, 이 가격에 이 성능이라니`,
    `${brand} ${model}로 작업 효율이 확 달라졌습니다`,
  ];

  const goodTitles = [
    `${model} — 장점이 많지만 아쉬운 점도 있어요`,
    `${specialty} 용도로 ${model} 반년 사용 솔직 후기`,
    `${brand} ${model}, 전반적으로 만족스러운 카메라`,
    `${model} 실사용 후기 — 4점 드리는 이유`,
    `가성비 좋은 ${model}, 하지만 완벽하진 않습니다`,
  ];

  const averageTitles = [
    `${model} — 괜찮지만 ${specialty}에는 아쉽습니다`,
    `${brand} ${model} 솔직 리뷰: 호불호가 갈릴 카메라`,
    `${model}, 기대가 너무 컸을까요?`,
    `2주 사용 후 쓰는 ${model} 솔직 후기`,
    `${specialty} 촬영에 ${model}은 약간 부족합니다`,
  ];

  const poorTitles = [
    `${model} — 이 가격에는 부족한 점이 많습니다`,
    `${specialty} 용도로는 비추, ${brand} ${model}`,
    `${model} 구매 후 후회하고 있습니다`,
    `아쉬움이 큰 ${brand} ${model} 솔직 리뷰`,
  ];

  let pool: string[];
  if (rating >= 5) pool = excellentTitles;
  else if (rating >= 4) pool = goodTitles;
  else if (rating >= 3) pool = averageTitles;
  else pool = poorTitles;

  return pool[Math.floor(rng() * pool.length)];
}

// Generate review comment body
function generateReviewComment(cam: RawCamera, rating: number, specialty: string, rng: () => number): string {
  const brand = cam.brand;
  const model = cam.model;
  const mp = cam.megapixels;
  const af = cam.afPoints;
  const fps = cam.continuousShootingSpeed;
  const weight = cam.weightGrams;
  const ibis = cam.imageStabilization;
  const weather = cam.weatherSealed;
  const video = cam.maxVideoResolution;
  const iso = cam.isoMax;
  const slots = cam.cardSlots;

  const parts: string[] = [];

  // Opening based on usage period
  const periods = ["3개월", "6개월", "1년", "2주", "한 달", "3주"];
  const period = periods[Math.floor(rng() * periods.length)];
  parts.push(`${brand} ${model}을(를) ${specialty} 촬영 용도로 ${period}째 사용하고 있습니다.`);

  // Sensor/image quality comments
  if (rating >= 4) {
    if (mp >= 40) {
      parts.push(`${mp}MP 센서의 해상력은 정말 놀랍습니다. 크롭해도 디테일이 살아있어 ${specialty} 후보정 작업에서 큰 자유도를 줍니다.`);
    } else if (mp >= 24) {
      parts.push(`${mp}MP 센서는 대부분의 ${specialty} 촬영에 충분한 해상도를 제공합니다. 다이나믹 레인지도 만족스럽습니다.`);
    }
  } else {
    if (mp < 24) {
      parts.push(`${mp}MP 해상도가 요즘 기준으로는 다소 아쉽게 느껴집니다. ${specialty} 작업 시 크롭 여유가 부족합니다.`);
    }
  }

  // AF performance
  if (af > 0) {
    if (rating >= 4 && af >= 400) {
      parts.push(`${af}포인트 AF 시스템은 정말 빠르고 정확합니다. ${specialty === "야생동물" || specialty === "스포츠" ? "빠르게 움직이는 피사체도 놓치지 않습니다." : "눈동자 AF가 특히 인상적이었습니다."}`);
    } else if (af < 200) {
      parts.push(`AF 포인트가 ${af}개로 최신 경쟁 모델 대비 부족한 편입니다. 빠른 피사체 추적에 한계가 있습니다.`);
    }
  }

  // IBIS
  if (ibis && rating >= 3) {
    parts.push(`바디 내 손떨림 보정 기능 덕분에 저속 셔터에서도 안정적인 결과물을 얻을 수 있었습니다.`);
  } else if (!ibis && (specialty === "풍경" || specialty === "콘서트" || specialty === "여행")) {
    parts.push(`IBIS가 없는 점이 ${specialty} 촬영 시 아쉽습니다. 삼각대 없이는 저속 셔터를 활용하기 어렵습니다.`);
  }

  // FPS (for relevant specialties)
  if ((specialty === "스포츠" || specialty === "야생동물" || specialty === "리뷰") && fps > 0) {
    if (fps >= 15) {
      parts.push(`${fps}fps 연사 속도는 결정적 순간을 포착하는 데 충분하고도 남습니다.`);
    } else if (fps < 8) {
      parts.push(`연사 속도가 ${fps}fps로 ${specialty} 촬영에는 다소 느린 편입니다.`);
    }
  }

  // Video (for video-related specialties)
  if ((specialty === "영상" || specialty === "브이로그" || specialty === "리뷰") && video) {
    const hasGoodVideo = video.toLowerCase().includes("4k") || video.toLowerCase().includes("8k") || video.includes("3840") || video.includes("7680");
    if (hasGoodVideo && rating >= 3) {
      parts.push(`영상 성능도 우수합니다. ${video} 촬영이 가능해 하이브리드 사용자에게 매력적입니다.`);
    }
  }

  // Weight comments
  if (specialty === "여행" || specialty === "스트릿") {
    if (weight < 500) {
      parts.push(`${weight}g의 가벼운 무게는 하루 종일 들고 다녀도 부담이 없습니다.`);
    } else if (weight >= 800) {
      parts.push(`${weight}g의 무게가 장시간 ${specialty} 촬영 시에는 상당한 부담이 됩니다.`);
    }
  }

  // Weather sealing
  if (weather && (specialty === "풍경" || specialty === "야생동물" || specialty === "보도")) {
    parts.push(`방진방적 처리가 되어 있어 비가 오는 야외에서도 안심하고 촬영할 수 있었습니다.`);
  }

  // ISO performance (for low-light specialties)
  if (specialty === "콘서트" || specialty === "천체" || specialty === "웨딩") {
    if (iso >= 51200) {
      parts.push(`고감도 ISO 성능이 뛰어나 저조도 환경에서도 노이즈가 잘 억제됩니다.`);
    } else if (iso < 25600) {
      parts.push(`ISO ${iso}까지 지원하지만, 고감도에서 노이즈가 눈에 띄어 ${specialty} 현장에서는 아쉽습니다.`);
    }
  }

  // Dual card slots
  if (specialty === "웨딩" || specialty === "보도") {
    if (slots >= 2) {
      parts.push(`듀얼 카드 슬롯은 중요한 ${specialty} 현장에서 백업이 가능해 안심됩니다.`);
    } else {
      parts.push(`싱글 카드 슬롯인 점이 프로 ${specialty} 촬영에서는 불안요소입니다.`);
    }
  }

  // Closing
  if (rating >= 5) {
    parts.push(`결론적으로 ${brand} ${model}은(는) ${specialty} 촬영에 있어 최고의 선택 중 하나라고 자신 있게 말할 수 있습니다. 강력 추천합니다.`);
  } else if (rating >= 4) {
    parts.push(`전반적으로 만족스러운 카메라입니다. 몇 가지 아쉬운 점이 있지만, ${specialty} 용도로 충분히 추천할 만합니다.`);
  } else if (rating >= 3) {
    parts.push(`나쁘지 않은 카메라이지만, ${specialty} 전문 촬영용으로는 경쟁 모델을 함께 고려해 보시길 권합니다.`);
  } else {
    parts.push(`개인적으로 ${specialty} 촬영에는 다른 모델을 추천드립니다. 기대에 미치지 못한 부분이 많았습니다.`);
  }

  return parts.join(" ");
}

// Generate pros/cons text in Korean based on actual camera specs
function generateProsText(cam: RawCamera, rating: number, specialty: string, rng: () => number): string | null {
  const existing = cam._prosCons?.pros || [];
  const pros: string[] = [];

  // Use existing scraped pros first (translate common ones)
  if (existing.length > 0) {
    const count = Math.min(2 + Math.floor(rng() * 2), existing.length);
    for (let i = 0; i < count; i++) {
      pros.push(existing[i]);
    }
  }

  // Add spec-based pros
  if (cam.megapixels >= 40) pros.push("고해상도 센서로 크롭 자유도가 높음");
  if (cam.imageStabilization) pros.push("바디 내 손떨림 보정(IBIS) 탑재");
  if (cam.afPoints >= 500) pros.push("강력한 오토포커스 시스템");
  if (cam.continuousShootingSpeed >= 15) pros.push("빠른 연사 속도");
  if (cam.weatherSealed) pros.push("방진방적 지원");
  if (cam.cardSlots >= 2) pros.push("듀얼 카드 슬롯 지원");
  if (cam.weightGrams < 500) pros.push("가벼운 휴대성");
  if (cam.touchscreen) pros.push("편리한 터치스크린 조작");
  if (cam.wifi) pros.push("Wi-Fi 무선 전송 지원");

  // Limit to reasonable number
  const maxPros = 3 + Math.floor(rng() * 3);
  return pros.slice(0, maxPros).join("\n") || null;
}

function generateConsText(cam: RawCamera, rating: number, specialty: string, rng: () => number): string | null {
  const existing = cam._prosCons?.cons || [];
  const cons: string[] = [];

  if (existing.length > 0) {
    const count = Math.min(1 + Math.floor(rng() * 2), existing.length);
    for (let i = 0; i < count; i++) {
      cons.push(existing[i]);
    }
  }

  // Add spec-based cons
  if (!cam.imageStabilization) cons.push("바디 내 손떨림 보정 미탑재");
  if (cam.cardSlots < 2) cons.push("싱글 카드 슬롯");
  if (cam.weightGrams >= 800) cons.push("무거운 바디");
  if (cam.afPoints > 0 && cam.afPoints < 200) cons.push("AF 포인트 수 부족");
  if (!cam.weatherSealed) cons.push("방진방적 미지원");
  if (cam.megapixels < 24) cons.push("경쟁 모델 대비 낮은 해상도");
  if (!cam.touchscreen) cons.push("터치스크린 미지원");
  if (cam.priceMsrp && cam.priceMsrp > 400000) cons.push("높은 출시 가격");

  const maxCons = 2 + Math.floor(rng() * 2);
  return cons.slice(0, maxCons).join("\n") || null;
}

// Determine which users review which cameras (seeded randomly)
function selectReviewers(cam: RawCamera, allUserIds: string[], rng: () => number): string[] {
  // Each camera gets 3-8 reviews
  const count = 3 + Math.floor(rng() * 6);
  const shuffled = [...allUserIds].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, allUserIds.length));
}

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting database seed with real data...\n");

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

  // ── Seed users ──────────────────────────────────────────────────────────
  console.log("👤 Seeding real users...");
  const userIds: string[] = [];

  for (const user of USERS) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, bio: user.bio, username: user.username },
      create: user,
    });
    userIds.push(created.id);
    console.log(`  ✓ ${created.name} (@${created.username})`);
  }
  console.log(`  총 ${userIds.length}명의 사용자 등록 완료\n`);

  // ── Seed cameras ────────────────────────────────────────────────────────
  console.log("📷 Seeding cameras with descriptions...");
  let successCount = 0;
  let skipCount = 0;
  let totalReviewCount = 0;

  for (const raw of rawData) {
    try {
      // Generate description if missing
      const description = raw.description || generateDescription(raw);

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
        description,
      };

      const camera = await prisma.camera.upsert({
        where: { slug: raw.slug },
        update: cameraData,
        create: cameraData,
      });

      // Generate diverse reviews for this camera
      const rng = mulberry32(hashStr(raw.slug));
      const reviewers = selectReviewers(raw, userIds, rng);
      let cameraReviewCount = 0;

      for (const reviewerId of reviewers) {
        const reviewRng = mulberry32(hashStr(raw.slug + reviewerId));
        const specialty = USER_SPECIALTIES[
          USERS.find((u) => {
            // Find user by matching id pattern in the generated ID
            return userIds.indexOf(reviewerId) === USERS.indexOf(u);
          })?.id || ""
        ] || "일반";

        const rating = computeRating(raw, USERS[userIds.indexOf(reviewerId)]?.id || "", reviewRng);
        const title = generateReviewTitle(raw, rating, specialty, reviewRng);
        const comment = generateReviewComment(raw, rating, specialty, reviewRng);
        const pros = generateProsText(raw, rating, specialty, reviewRng);
        const cons = generateConsText(raw, rating, specialty, reviewRng);

        try {
          await prisma.review.upsert({
            where: {
              authorId_cameraId: {
                authorId: reviewerId,
                cameraId: camera.id,
              },
            },
            update: {
              rating,
              title,
              comment,
              pros,
              cons,
              verified: reviewRng() > 0.3,
              helpful: Math.floor(reviewRng() * 80),
            },
            create: {
              rating,
              title,
              comment,
              pros,
              cons,
              verified: reviewRng() > 0.3,
              helpful: Math.floor(reviewRng() * 80),
              authorId: reviewerId,
              cameraId: camera.id,
            },
          });
          cameraReviewCount++;
        } catch {
          // Skip on constraint violation
        }
      }

      totalReviewCount += cameraReviewCount;
      successCount++;
      console.log(
        `  ✓ ${camera.brand} ${camera.model} (${camera.slug}) + ${cameraReviewCount} reviews`
      );
    } catch (err) {
      skipCount++;
      console.error(`  ✕ Failed: ${raw.slug} —`, err);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  🌱 시드 데이터 등록 완료`);
  console.log(`     ✓ ${successCount}개 카메라 등록`);
  if (skipCount > 0) console.log(`     ✕ ${skipCount}개 카메라 스킵`);
  console.log(`     👤 ${userIds.length}명 사용자`);

  const dbReviewCount = await prisma.review.count();
  console.log(`     📝 ${dbReviewCount}개 리뷰 총 등록`);
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
