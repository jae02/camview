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
  {
    id: "usr_gearhead_21",
    email: "kim.sungmin.slr@gmail.com",
    username: "gearhead_sungmin",
    name: "김성민",
    bio: "장비병 말기 환자 | 신제품은 못 참음 | 중고나라/당근마켓 VIP | 바디만 5개 보유중",
  },
  {
    id: "usr_cynic_22",
    email: "dc.anon.photo@kakao.com",
    username: "cynical_shooter",
    name: "익명사진가",
    bio: "디시 사진갤러리 눈팅족 | 크롭은 죄악이라 믿음 | 차가운 팩트 폭격기",
  },
  {
    id: "usr_collector_23",
    email: "lee.sub_camera@naver.com",
    username: "sub_collector",
    name: "이수빈",
    bio: "서브 카메라 수집가 | 메인은 A7! 서브는 리코 GR! | 가벼움과 감성이 최고",
  },
  {
    id: "usr_purist_24",
    email: "choi.nofilter@gmail.com",
    username: "purist_choi",
    name: "최강석",
    bio: "무보정 JPEG 주의자 | 후보정은 사기다 | 카메라 본연의 색감이 기술력의 척도",
  },
  {
    id: "usr_birding_25",
    email: "kang.bird@daum.net",
    username: "birding_kang",
    name: "강대호",
    bio: "새 사진 전용 계정 | 초망원 단렌즈 소유자 | 연사 속도와 AF-C만 봅니다",
  },
  {
    id: "usr_commercial_26",
    email: "studio.on@naver.com",
    username: "studio_on",
    name: "박진수",
    bio: "상업 스튜디오 운영 | 클라이언트 요구는 법이다 | 고해상도와 듀얼슬롯 필수",
  },
  {
    id: "usr_minimal_27",
    email: "minimal.snap@gmail.com",
    username: "minimal_snap",
    name: "정유진",
    bio: "미니멀리스트 사진가 | 단렌즈 하나로 세상 담기 | 크기와 디자인이 최우선",
  },
  {
    id: "usr_videophile_28",
    email: "cine.maker@kakao.com",
    username: "cinemaker",
    name: "조현진",
    bio: "독립 영화 제작자 | 10-bit 4:2:2 내장 레코딩 필수 🎥 | 렌즈 호흡 보정 사랑함",
  },
  {
    id: "usr_family_29",
    email: "papa.photo@naver.com",
    username: "papa_photo",
    name: "김영수",
    bio: "아빠 진사 | 쑥쑥 크는 아이들 기록용 | 얼굴/눈 검출 AF 없으면 사진 못 찍음",
  },
  {
    id: "usr_student_30",
    email: "photo.major@gmail.com",
    username: "photo_student_k",
    name: "강민지",
    bio: "사진학과 재학생 | 과제에 치여 사는 중 | 가성비 장비와 중고 렌즈 헌터",
  }
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
  usr_gearhead_21: "장비",
  usr_cynic_22: "팩폭",
  usr_collector_23: "서브",
  usr_purist_24: "무보정",
  usr_birding_25: "새사진",
  usr_commercial_26: "상업",
  usr_minimal_27: "디자인",
  usr_videophile_28: "영화",
  usr_family_29: "가족",
  usr_student_30: "가성비"
};

// ---------------------------------------------------------------------------
// Real Insights - Authentic Korean community sentiments for specific cameras
// ---------------------------------------------------------------------------
const REAL_INSIGHTS: Record<string, Array<{title: string, desc: string, rating: number}>> = {
  "sony-alpha-a7-iv": [
    { title: "M4 두 달 써보고 느낀 장단점", desc: "물론 스펙상 하이브리드로 완벽에 가깝지만, 4K 60p에서 1.5배 크롭되는 건 영상 위주로 쓰는 저에겐 너무나 뼈아픈 단점입니다. 광각 렌즈 물리기가 참 애매해지네요. 그리고 스펙 올라가서 그런지 발열 경고도 생각보다 빨리 뜨는 편입니다.", rating: 3.5 },
    { title: "기변병 치료제 A7M4", desc: "이전 세대 대비 색감이나 메뉴 UI가 정말 좋아졌습니다! AF는 말할 필요도 없는 소니 외계인 고문 수준이고요. 다만 3300만 화소라 파일 용량 압박이 확 느껴져서 이번 기회에 HDD를 대거 교체했습니다. 사진 위주면 종결급 바디.", rating: 4.5 },
    { title: "비싸지만 돈값하는 바디", desc: "출시한 지 좀 됐는데도 중고 방어가 너무 잘 되어 있어서 그냥 신품 샀습니다. 그립감이 3세대보다 훨씬 두툼해져서 파지하기 아주 편해요. 배터리는 기능 때문인지 좀 더 빨리 닳는 느낌적인 느낌?", rating: 4.0 }
  ],
  "canon-eos-r5": [
    { title: "R5 1년 실사용기 (발열 이슈 관련)", desc: "처음에 말 많던 발열 이슈는 펌웨어 업데이트 이후 많이 완화되긴 했습니다. 그래도 8K 장시간 촬영은 무리가 있고 4K 고프레임 찍을 땐 컷 단위로 나눠 찍어야 마음이 편합니다. 사진 결과물은 정말 깡패입니다.", rating: 4.0 },
    { title: "캐논 색감 + 미친 AF 조합", desc: "풍경이랑 인물 찍는데 R5만 한 게 없는 것 같습니다. 문제는 유지비네요. CFexpress B타입 메모리카드 가격이 거의 바디 하나 맞먹을 정도로 사악해서 통장이 텅장됐습니다. RF 렌즈들도 너무 비싸구요.", rating: 3.5 },
    { title: "성능은 만점, 가성비는 글쎄", desc: "4500만 화소라 디테일 유지하면서 크롭하기 정말 좋습니다. 손떨림 방지(IBIS)랑 렌즈 IS 결합하면 저속 셔터에서도 핸드헬드로 다 커버되네요.", rating: 4.5 }
  ],
  "fujifilm-x100vi": [
    { title: "감성 하나로 모든 걸 용서하는 카메라", desc: "최신 플래그십 생각하고 사면 AF 속도나 버벅임에 답답함을 느낄 겁니다. 눈 검출 속도도 좀 아쉽고요. 근데 디자인과 클래식 크롬 등 필름 시뮬레이션 하나로 폰카와는 궤를 달리하는 갬성이 나옵니다. 후보정 귀찮아하는 저한텐 최고의 카메라입니다.", rating: 4.5 },
    { title: "컴팩트라기엔 좀 무겁네요", desc: "X100V에서 넘어왔는데 손떨방 들어가면서 체감상 조금 더 무거워졌습니다. 주머니에 쏙 들어가는 사이즈는 확실히 아니고, 배터리 소모가 심해서 외출 시 예비 배터리 2개는 필수입니다.", rating: 3.5 },
    { title: "구할 수가 없어요...", desc: "겨우 피켓팅 성공해서 샀습니다. 가격이 200 언저리인데 이 가격이면 풀프레임을 갈까 수십 번 고민했습니다. 하지만 들고 나갈 때마다 예뻐서 용서가 되네요. 동영상 촬영 시엔 좀 뜨거워집니다.", rating: 4.0 }
  ],
  "nikon-z8": [
    { title: "진정한 팀킬 바디, Z8 만세!", desc: "형님격인 Z9의 거의 모든 기능을 이 사이즈에 우겨넣은 니콘의 실수(?)입니다. 기계식 셔터를 아예 빼버린 센서 기술력은 진짜 혁신적이네요. 롤링 셔터 왜곡이 전혀 안 느껴집니다. 최고!", rating: 5.0 },
    { title: "가벼워졌다지만 여전히 무겁습니다", desc: "Z9보다 다이어트했다고는 하나, 여전히 다른 브랜드 풀프 주력기들 대비 900g대 무게는 상당한 무기(?)입니다. 하루 종일 들고 다니면 어깨 빠질 것 같아요. 성능은 나무랄 데 없습니다.", rating: 4.5 }
  ],
  "sony-alpha-a7r-v": [
    { title: "A7R5 해상력은 진짜 미쳤습니다", desc: "6100만 화소의 디테일은 경이롭습니다. 풍경에서 나뭇잎 하나하나 살아있네요. 새로 들어간 AI 오토포커스 덕분에 곤충이나 새 눈깔 잡는 속도도 어마무시합니다. 스위블 + 틸트 결합된 4축 액정은 브이로그 찍을 때도 매우 편리합니다.", rating: 5.0 },
    { title: "고화소의 딜레마", desc: "사진 품질은 압도적인데, 노이즈가 고감도에서 살짝 아쉬워요. 상업 하시는 분들에겐 압도적인 크롭 마진을 줘서 깡패입니다만 취미용으론 파일 용량이 모니터 터져나갑니다.", rating: 4.0 }
  ],
  "canon-eos-r6-mark-ii": [
    { title: "가성비 따지면 종결 바디", desc: "M1에서 넘어왔는데 기계식 연사도 12연사 훌륭하고, 전자식 40연사는 야생동물이나 스포츠 찍을 때 날아다닙니다. R5까지 필요 없는 저 같은 찍사들에겐 최선의 서택인 듯하네요.", rating: 4.5 }
  ]
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

  if (specialty === "장비") {
    return rating >= 4 ? `기변병 와서 결국 ${model} 들였습니다` : `${model} 써보고 바로 방출했습니다`;
  }
  if (specialty === "팩폭") {
    return rating >= 4 ? `${model} 가격 빼고 다 팩트로 깐다` : `${model} 거품 언제 꺼지냐? 솔직 후기 간다`;
  }
  if (specialty === "가성비" || specialty === "학생") {
    return rating >= 4 ? `학생/취준생 지갑 지켜주는 빛과 소금 ${model}` : `중고로 사도 가성비 안 나옴 비추`;
  }
  if (specialty === "서브") {
    return rating >= 4 ? `무거운 메인 바디 버리고 서브로 기추 완!` : `결국 메인 바디만 쓰게 되네요... 장롱행`;
  }

  const excellentTitles = [
    `${brand} ${model}, ${specialty} 촬영의 완벽한 파트너`,
    `${model} 석 달 사용기 — 완전히 정착했습니다`,
    `${specialty} 사진가가 본 ${model}의 진가`,
    `${model}, 이 가격에 이 성능이라니`,
    `더 이상 바랄 게 없는 완벽한 바디, ${model}`,
  ];

  const goodTitles = [
    `${model} — 장점이 많지만 아쉬운 점도 있어요`,
    `${specialty} 용도로 ${model} 반년 사용 솔직 후기`,
    `${brand} ${model}, 전반적으로 만족스러운 카메라`,
    `${model} 실사용 후기 — 4점 드리는 이유`,
    `명불허전 ${model}, 결점은 살짝 눈감아줄 만합니다`,
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
    `장비 방출 직전 남기는 ${model} 솔직 후기`,
    `아쉬움이 큰 ${brand} ${model} 스펙에 속지 마세요`,
  ];

  let pool: string[];
  if (rating >= 4.5) pool = excellentTitles;
  else if (rating >= 3.5) pool = goodTitles;
  else if (rating >= 2.5) pool = averageTitles;
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
      parts.push(`${mp}MP 고화소라 크롭 여유가 엄청나서 구도 잡기 너무 편하네요.`);
    } else if (mp >= 24) {
      parts.push(`${mp}MP 센서는 웹용이나 일반적인 ${specialty} 환경에서는 넘치는 해상력을 보여줍니다.`);
    }
  } else {
    if (mp < 24) {
      parts.push(`${mp}MP 해상도가 요즘 기준으로는 다소 아쉽게 느껴집니다.`);
    }
  }

  // AF performance
  if (af > 0) {
    if (rating >= 4 && af >= 400) {
      parts.push(`AF 포인트가 ${af}개나 되어서 피사체 추적이 말도 안 되게 빠릅니다. 구석탱이로 이동해도 안 놓쳐요.`);
    } else if (af < 200) {
      parts.push(`AF 포인트가 ${af}개라서 최신기종 치고는 듬성듬성한 느낌입니다. 핀 나갈 때가 종종 있네요.`);
    }
  }

  // IBIS
  if (ibis && rating >= 3) {
    parts.push(`바디 손떨방(IBIS) 덕분에 렌즈에 IS 없어도 셔터스피드 엄청 확보됩니다.`);
  } else if (!ibis && (specialty === "풍경" || specialty === "콘서트" || specialty === "여행")) {
    parts.push(`IBIS가 없는 점이 ${specialty} 촬영 시 아쉽습니다. 수전증 있으시면 렌즈 손떨방 무조건 있어야 버틸 만해요.`);
  }

  // Weight comments
  if (specialty === "여행" || specialty === "스트릿" || specialty === "서브" || specialty === "디자인") {
    if (weight < 500) {
      parts.push(`${weight}g의 가벼운 무게는 하루 종일 들고 다녀도 어깨에 부담이 없어서 맘에 듭니다.`);
    } else if (weight >= 800) {
      parts.push(`무게가 ${weight}g인데 렌즈까지 물리면 하루 종일 들고 다니면 어깨 빠질 것 같습니다.`);
    }
  }

  // Closing
  if (rating >= 4.5) {
    parts.push(`결론적으로 기변병 완치됐습니다. 총알 여유 되시면 무조건 지르시길 강력 추천합니다.`);
  } else if (rating >= 4) {
    parts.push(`자잘한 단점이 있긴 한데 결과물이 워낙 깡패라 꾹 참고 씁니다. 추천할 만해요.`);
  } else if (rating >= 3) {
    parts.push(`돈값은 하는지 모르겠지만 쏘쏘합니다. 중고로 상태 좋은 거 주우시는 걸 추천.`);
  } else {
    parts.push(`스펙시트에 안 나오는 단점들이 실사용 시 스트레스입니다. 다음 바디 나올 때까지 존버하시길 추천.`);
  }

  let finalComment = parts.join(" ");

  // Inject DC/SLR tone
  if (specialty === "장비" || specialty === "팩폭" || specialty === "가성비" || specialty === "무보정") {
    finalComment = finalComment
      .replace(/사용하고 있습니다\./g, "써봄.")
      .replace(/요\./g, "음.")
      .replace(/다\./g, "음.")
      .replace(/추천합니다\./g, "개추함.")
      .replace(/추천\./g, "추천.");
  }

  return finalComment;
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
        
        const actualUserId = USERS.find((u) => userIds.indexOf(reviewerId) === USERS.indexOf(u))?.id || "";
        const specialty = USER_SPECIALTIES[actualUserId] || "일반";

        let rating: number;
        let title: string;
        let comment: string;
        let pros: string | null;
        let cons: string | null;

        const insightsList = REAL_INSIGHTS[raw.slug];

        // Override with real Korean community insights for top cameras if available
        if (insightsList && cameraReviewCount < insightsList.length) {
          const insight = insightsList[cameraReviewCount];
          rating = insight.rating;
          title = insight.title;
          comment = insight.desc;
          pros = generateProsText(raw, rating, specialty, reviewRng);
          cons = generateConsText(raw, rating, specialty, reviewRng);
        } else {
          rating = computeRating(raw, actualUserId, reviewRng);
          title = generateReviewTitle(raw, rating, specialty, reviewRng);
          comment = generateReviewComment(raw, rating, specialty, reviewRng);
          pros = generateProsText(raw, rating, specialty, reviewRng);
          cons = generateConsText(raw, rating, specialty, reviewRng);
        }

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
