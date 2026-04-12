// =============================================================================
// Format Utilities — Display formatting for camera spec values
// =============================================================================
// Extracted from mock-data.ts so they can be used without importing mock data.
// These are pure functions with no data dependencies.
// =============================================================================

/** Format price in cents to a human-readable KRW string. */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "가격 미정";
  
  // prices in DB are USD cents. Exchange rate approx 1,400 KRW per 1 USD.
  // formula: (cents / 100) * 1400 = cents * 14
  const exchangeRate = 14; 
  const krwPrice = cents * exchangeRate;
  
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(krwPrice);
}

/** Format a sensor size enum value to a display string. */
export function formatSensorSize(size: string): string {
  const map: Record<string, string> = {
    FULL_FRAME: "풀프레임 (35mm)",
    APS_C: "APS-C",
    MICRO_FOUR_THIRDS: "마이크로 포서드",
    MEDIUM_FORMAT: "중형 포맷",
    ONE_INCH: '1인치',
    OTHER: "기타",
  };
  return map[size] || size;
}

/** Format a lens mount enum value to a display string. */
export function formatMount(mount: string): string {
  const map: Record<string, string> = {
    SONY_E: "소니 E마운트",
    CANON_RF: "캐논 RF마운트",
    NIKON_Z: "니콘 Z마운트",
    FUJIFILM_X: "후지필름 X마운트",
    FUJIFILM_GFX: "후지필름 GFX마운트",
    MICRO_FOUR_THIRDS: "마이크로 포서드",
    LEICA_L: "라이카 L마운트",
    LEICA_M: "라이카 M마운트",
    CANON_EF: "캐논 EF마운트",
    NIKON_F: "니콘 F마운트",
    PENTAX_K: "펜탁스 K마운트",
    OTHER: "기타",
  };
  return map[mount] || mount;
}

/** Format body type enum to display string. */
export function formatBodyType(type: string): string {
  const map: Record<string, string> = {
    MIRRORLESS: "미러리스",
    DSLR: "DSLR",
    COMPACT: "콤팩트",
    MEDIUM_FORMAT: "중형 포맷",
    CINEMA: "시네마 카메라",
    ACTION: "액션 카메라",
    OTHER: "기타",
  };
  return map[type] || type;
}

/** Compute the average star rating for a set of reviews. */
export function computeAverageRating(
  ratings: number[]
): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/** Format a date string or Date to a human-readable release date. */
export function formatReleaseDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
  });
}
