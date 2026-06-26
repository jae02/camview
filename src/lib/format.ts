// =============================================================================
// Format Utilities — Display formatting for camera spec values
// =============================================================================
// Extracted from mock-data.ts so they can be used without importing mock data.
// These are pure functions with no data dependencies.
// =============================================================================

/** Format price in cents to a human-readable KRW string. Also handles string MSRP. */
export function formatPrice(cents: number | string | null): string {
  if (cents === null || cents === undefined) return "가격 미정";
  
  let centsNum: number;
  if (typeof cents === 'string') {
    // Handle "$2499.00" format
    const cleaned = cents.replace(/[$,]/g, '');
    const usd = parseFloat(cleaned);
    if (isNaN(usd)) return "가격 미정";
    centsNum = Math.round(usd * 100);
  } else {
    centsNum = cents;
  }
  
  // prices in DB are USD cents. Exchange rate approx 1,400 KRW per 1 USD.
  const exchangeRate = 14; 
  const krwPrice = centsNum * exchangeRate;
  
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
    FULL_FRAME: "풀프레임",
    APS_C: "APS-C",
    MICRO_FOUR_THIRDS: "M4/3",
    MEDIUM_FORMAT: "중형",
    ONE_INCH: '1인치',
    OTHER: "기타",
  };
  // Also handle raw strings from cameradecision
  const raw = size.toLowerCase();
  if (raw.includes('full') || raw.includes('35mm')) return "풀프레임";
  if (raw.includes('aps')) return "APS-C";
  if (raw.includes('four') || raw.includes('4/3')) return "M4/3";
  if (raw.includes('medium')) return "중형";
  if (raw.includes('1"') || raw.includes('1 inch')) return "1인치";
  return map[size] || size;
}

/** Format a lens mount enum value to a display string. */
export function formatMount(mount: string): string {
  const map: Record<string, string> = {
    SONY_E: "Sony E",
    CANON_RF: "Canon RF",
    NIKON_Z: "Nikon Z",
    FUJIFILM_X: "Fuji X",
    FUJIFILM_GFX: "Fuji GFX",
    MICRO_FOUR_THIRDS: "M4/3",
    LEICA_L: "Leica L",
    LEICA_M: "Leica M",
    CANON_EF: "Canon EF",
    NIKON_F: "Nikon F",
    PENTAX_K: "Pentax K",
    OTHER: "기타",
  };
  // Also handle raw mount strings like "Canon RF"
  if (map[mount]) return map[mount];
  const raw = mount.toLowerCase();
  if (raw.includes('sony')) return 'Sony E';
  if (raw.includes('canon rf')) return 'Canon RF';
  if (raw.includes('canon ef')) return 'Canon EF';
  if (raw.includes('nikon z')) return 'Nikon Z';
  if (raw.includes('nikon f')) return 'Nikon F';
  if (raw.includes('fuji') && raw.includes('gfx')) return 'Fuji GFX';
  if (raw.includes('fuji')) return 'Fuji X';
  if (raw.includes('micro') || raw.includes('4/3')) return 'M4/3';
  if (raw.includes('leica l')) return 'Leica L';
  if (raw.includes('leica m')) return 'Leica M';
  if (raw.includes('pentax')) return 'Pentax K';
  return mount || '기타';
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
