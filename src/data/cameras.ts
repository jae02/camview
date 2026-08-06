import { CameraProfile } from '@/types';

// ============================================
// CamView — 10 Camera Profiles
// 5 Film + 5 Digital, each with tuned filters
// (Tuned based on detailed color science specs)
// ============================================

export const cameras: CameraProfile[] = [
  // ──────────────────────────────────────
  // FILM CAMERAS / FILM STOCKS
  // ──────────────────────────────────────
  {
    id: 'kodak-portra-400',
    name: 'Kodak Portra 400',
    brand: 'Kodak',
    category: 'film',
    year: 1998,
    tagline: '따뜻한 파스텔 톤의 인물 사진 명작',
    description:
      'Kodak Portra 400은 세계에서 가장 사랑받는 인물 촬영용 필름입니다. 부드럽고 따뜻한 색감, 자연스러운 피부톤 재현, 그리고 넓은 노출 관용도가 특징입니다. 웨딩, 패션, 스트리트 포토그래피 등 다양한 장르에서 활용되며, 디지털 시대에도 여전히 많은 사진가들이 선호하는 필름입니다.',
    features: [
      '자연스럽고 따뜻한 피부톤',
      '부드러운 파스텔 색감',
      '넓은 노출 관용도 (±3 stops)',
      '미세한 입자감',
    ],
    filter: {
      temperature: 15, // 따뜻한 옐로우/오렌지 톤 추가
      tint: 0,
      contrast: -10, // 0.9: 약간 낮춤, 부드러운 톤 유지
      saturation: 0.95, // 과하지 않게 살짝 뺌
      brightness: 2,
      highlights: 0,
      shadows: 15, // 섀도우 억제력을 낮춰 계조 확보
      fadedBlacks: 15, // 미세한 파스텔 톤 섀도우
      // Red: 미드톤 살짝 올림, Blue: 섀도우 살짝 내림
      redCurve: [[0, 0], [64, 68], [128, 135], [192, 195], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 58], [128, 128], [192, 192], [255, 255]],
      grain: 0.15, // 자연스럽고 부드러운 입자감
      grainSize: 1.2,
      vignette: 0.1,
      sharpness: 1.0,
    },
    characteristics: {
      warmth: 75,
      contrast: 35,
      saturation: 45,
      grain: 30,
      sharpness: 65,
      vintage: 70,
    },
    accentColor: '#e8a87c',
    icon: '🎞️',
  },
  {
    id: 'fujifilm-velvia-50',
    name: 'Fujifilm Velvia 50',
    brand: 'Fujifilm',
    category: 'film',
    year: 1991,
    tagline: '극도로 선명한 풍경의 보석',
    description:
      'Fujifilm Velvia 50은 풍경 사진가들의 성배로 불리는 슬라이드 필름입니다. 극도로 높은 채도와 선명한 색감, 초미세 입자가 특징이며, 특히 녹색과 파란색의 표현이 압도적입니다. 일출, 일몰, 자연 풍경 촬영에서 드라마틱한 결과물을 만들어냅니다.',
    features: [
      '극도로 높은 색 채도',
      '초미세 입자 (RMS 4.5)',
      '풍부한 녹색/파란색 표현',
      '드라마틱한 풍경 색감',
    ],
    filter: {
      temperature: 0,
      tint: 10, // 마젠타 쪽으로 살짝 이동
      contrast: 30, // 1.3: 매우 강하게
      saturation: 1.4, // 전체적으로 강하게 끌어올림
      brightness: -2,
      highlights: 5,
      shadows: -10,
      fadedBlacks: 0, // 순수 블랙 유지
      // 전형적인 강한 S자 커브
      redCurve: [[0, 0], [64, 50], [128, 128], [192, 210], [255, 255]],
      greenCurve: [[0, 0], [64, 50], [128, 128], [192, 210], [255, 255]],
      blueCurve: [[0, 0], [64, 50], [128, 128], [192, 210], [255, 255]],
      grain: 0.05, // 그레인 거의 보이지 않게 처리
      grainSize: 1,
      vignette: 0.15,
      sharpness: 1.3,
    },
    characteristics: {
      warmth: 45,
      contrast: 80,
      saturation: 95,
      grain: 15,
      sharpness: 90,
      vintage: 40,
    },
    accentColor: '#2dd4bf',
    icon: '🏔️',
  },
  {
    id: 'kodak-ektar-100',
    name: 'Kodak Ektar 100',
    brand: 'Kodak',
    category: 'film',
    year: 2008,
    tagline: '세계에서 가장 미세한 입자의 컬러 네거티브',
    description:
      'Kodak Ektar 100은 세계에서 가장 미세한 입자를 가진 컬러 네거티브 필름입니다. 선명하고 깨끗한 색재현과 높은 채도가 특징이며, Velvia와는 다른 결의 선명함을 보여줍니다. 풍경, 건축, 상품 촬영 등에서 뛰어난 성능을 발휘합니다.',
    features: [
      '세계 최미세 입자 컬러 네거티브',
      '높은 채도와 선명한 색감',
      '뛰어난 스캔 품질',
      '넓은 노출 관용도',
    ],
    filter: {
      temperature: 5, // 살짝 따뜻하게
      tint: 0,
      contrast: 15, // 1.15
      saturation: 1.2, // 벨비아보다는 덜하게
      brightness: 2,
      highlights: 2,
      shadows: -5,
      fadedBlacks: 5, // 아주 약하게
      // Red 하이라이트 올림, Blue 섀도우 유지
      redCurve: [[0, 0], [64, 64], [128, 128], [192, 205], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      grain: 0.08, // 미세 입자
      grainSize: 1,
      vignette: 0.1,
      sharpness: 1.2,
    },
    characteristics: {
      warmth: 55,
      contrast: 70,
      saturation: 80,
      grain: 20,
      sharpness: 85,
      vintage: 30,
    },
    accentColor: '#f97316',
    icon: '🌄',
  },
  {
    id: 'cinestill-800t',
    name: 'CineStill 800T',
    brand: 'CineStill',
    category: 'film',
    year: 2012,
    tagline: '시네마틱 야간 촬영의 아이콘',
    description:
      'CineStill 800T는 Kodak Vision3 시네마 필름에서 레무젯 레이어를 제거하여 스틸 카메라에서 사용할 수 있게 만든 텅스텐 밸런스 필름입니다. 특유의 블루/티일 톤과 레드 할레이션(빛번짐) 효과가 독특한 시네마틱 분위기를 연출합니다. 야간 도시 촬영에서 특히 인상적인 결과물을 만들어냅니다.',
    features: [
      '텅스텐 밸런스 (3200K)',
      '특유의 레드 할레이션 효과',
      '시네마틱 블루/티일 톤',
      '고감도 ISO 800',
    ],
    filter: {
      temperature: -25, // 강한 쿨톤/블루, 텅스텐 밸런스
      tint: 5, // 마젠타 살짝 추가
      contrast: 10,
      saturation: 0.9,
      brightness: -2,
      highlights: 5,
      shadows: 5,
      fadedBlacks: 20, // 영화적인 묵직한 섀도우 질감
      redCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      grain: 0.3, // 투명도 0.3
      grainSize: 2.5, // 크기 크게
      vignette: 0.3, // 강하게 (시네마틱 렌즈 느낌)
      sharpness: 0.9,
      halation: 0.6, // 할레이션 강도 극대화
    },
    characteristics: {
      warmth: 15,
      contrast: 55,
      saturation: 50,
      grain: 70,
      sharpness: 50,
      vintage: 85,
    },
    accentColor: '#38bdf8',
    icon: '🌃',
  },
  {
    id: 'ilford-hp5',
    name: 'Ilford HP5 Plus',
    brand: 'Ilford',
    category: 'film',
    year: 1989,
    tagline: '클래식 흑백의 정수',
    description:
      'Ilford HP5 Plus는 가장 다재다능한 흑백 필름 중 하나입니다. 풍부한 톤 범위와 아름다운 입자감이 특징이며, ISO 400의 기본 감도에서 ISO 3200까지 푸시 현상이 가능합니다. 스트리트, 다큐멘터리, 인물 사진 등 거의 모든 장르에서 탁월한 결과물을 보여줍니다.',
    features: [
      '풍부한 톤 범위',
      '아름다운 필름 그레인',
      'ISO 400-3200 푸시 가능',
      '다재다능한 흑백 필름',
    ],
    filter: {
      temperature: 0,
      tint: 0,
      contrast: 20, // 1.2
      saturation: 0.0, // 완전 흑백 전환
      brightness: 0,
      highlights: 5,
      shadows: -20, // 섀도우를 강하게 눌러 묵직하게
      fadedBlacks: 10, // 블랙 포인트를 살짝 들어 회색빛 감도는 섀도우
      // 강한 S자 커브
      redCurve: [[0, 0], [64, 45], [128, 128], [192, 215], [255, 255]],
      greenCurve: [[0, 0], [64, 45], [128, 128], [192, 215], [255, 255]],
      blueCurve: [[0, 0], [64, 45], [128, 128], [192, 215], [255, 255]],
      grain: 0.4, // 투명도 0.4
      grainSize: 3, // 크기 매우 크게
      vignette: 0.2,
      sharpness: 1.0,
    },
    characteristics: {
      warmth: 50,
      contrast: 75,
      saturation: 0,
      grain: 90,
      sharpness: 60,
      vintage: 80,
    },
    accentColor: '#a1a1aa',
    icon: '⬛',
  },

  // ──────────────────────────────────────
  // DIGITAL CAMERAS
  // ──────────────────────────────────────
  {
    id: 'fujifilm-x100v',
    name: 'Fujifilm X100V',
    brand: 'Fujifilm',
    category: 'digital',
    year: 2020,
    tagline: '클래식 크롬의 필름 같은 디지털',
    description:
      'Fujifilm X100V는 레트로 디자인과 뛰어난 화질을 결합한 프리미엄 컴팩트 카메라입니다. 특히 Classic Chrome 필름 시뮬레이션 모드는 디지털이면서도 필름 같은 독특한 색감을 만들어내며, 전 세계 스트리트 포토그래퍼들에게 큰 사랑을 받고 있습니다.',
    features: [
      'Classic Chrome 필름 시뮬레이션',
      '23mm F2 고정 렌즈',
      '레트로 디자인',
      'APS-C X-Trans CMOS 4',
    ],
    filter: {
      temperature: 5, // 살짝 따뜻하게
      tint: 0,
      contrast: 10, // 1.1: 살짝 높여서 펀치감
      saturation: 0.8, // 0.8: 물 빠진 듯한 저채도
      brightness: 2,
      highlights: -5,
      shadows: 5,
      fadedBlacks: 12, // 필름처럼 블랙을 살짝 띄움
      // 전체적으로 섀도우를 들고 명부에서 Red/Blue 낮춤
      redCurve: [[0, 10], [64, 60], [128, 128], [192, 185], [255, 245]],
      greenCurve: [[0, 10], [64, 60], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 10], [64, 60], [128, 128], [192, 185], [255, 245]],
      grain: 0.1, // 내장 그레인 효과 '약'
      grainSize: 1,
      vignette: 0.1,
      sharpness: 1.1,
    },
    characteristics: {
      warmth: 60,
      contrast: 60,
      saturation: 30,
      grain: 20,
      sharpness: 75,
      vintage: 65,
    },
    accentColor: '#a78bfa',
    icon: '📸',
  },
  {
    id: 'leica-q3',
    name: 'Leica Q3',
    brand: 'Leica',
    category: 'digital',
    year: 2023,
    tagline: '독일 광학의 정수, 깊이 있는 색감',
    description:
      'Leica Q3는 풀프레임 센서와 Summilux 28mm f/1.7 렌즈를 탑재한 프리미엄 컴팩트 카메라입니다. Leica 특유의 높은 대비와 깊이 있는 색감, 그리고 크리미한 보케가 특징입니다. "라이카 룩"이라 불리는 독특한 색 재현은 다른 어떤 카메라와도 구별됩니다.',
    features: [
      '6000만 화소 풀프레임 센서',
      'Summilux 28mm f/1.7 렌즈',
      '높은 대비의 "라이카 룩"',
      '크리미한 보케',
    ],
    filter: {
      temperature: -5, // 차분하고 서늘한 톤
      tint: 0,
      contrast: 25, // 1.25: 상당히 높게 주어 선명한 깊이감
      saturation: 1.05, // 과하게 올리지 않고 묵직하게
      brightness: 0,
      highlights: 5, // 보호
      shadows: -15, // 섀도우 억제하여 암부를 무겁게
      fadedBlacks: 0, // 절대 블랙 유지
      // 강한 S자 커브, 블랙 포인트 근처 가파름
      redCurve: [[0, 0], [64, 55], [128, 130], [192, 205], [255, 255]],
      greenCurve: [[0, 0], [64, 55], [128, 130], [192, 205], [255, 255]],
      blueCurve: [[0, 0], [64, 55], [128, 130], [192, 205], [255, 255]],
      grain: 0.0,
      grainSize: 1,
      vignette: 0.2, // 렌즈 최대 개방 특유의 0.2
      sharpness: 1.15,
    },
    characteristics: {
      warmth: 40,
      contrast: 85,
      saturation: 60,
      grain: 0,
      sharpness: 85,
      vintage: 20,
    },
    accentColor: '#ef4444',
    icon: '🔴',
  },
  {
    id: 'sony-a7c-ii',
    name: 'Sony A7C II',
    brand: 'Sony',
    category: 'digital',
    year: 2023,
    tagline: '깨끗하고 정확한 현대적 색재현',
    description:
      'Sony A7C II는 컴팩트한 바디에 풀프레임 성능을 담은 미러리스 카메라입니다. 뛰어난 AF 성능과 정확한 색재현이 특징이며, S-Cinetone과 같은 크리에이티브 룩으로 영상과 사진 모두에서 뛰어난 결과물을 보여줍니다. 중립적이고 깨끗한 색감이 후보정에 유리합니다.',
    features: [
      '3300만 화소 풀프레임',
      'AI 기반 실시간 AF',
      '깨끗하고 중립적인 색재현',
      '4K 60p 동영상',
    ],
    filter: {
      temperature: 0, // 0
      tint: 2, // 그린 틴트 잡기 위해 미세한 마젠타 더함
      contrast: 0, // 1.0 (기본값)
      saturation: 1.0, // 정확한 발색
      brightness: 0,
      highlights: 0, // 밸런스 유지
      shadows: 0, // 밸런스 유지
      fadedBlacks: 0,
      // 완전히 일자형에 가까운 완만한 커브
      redCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      grain: 0.0, // 0
      grainSize: 1,
      vignette: 0.0, // 0
      sharpness: 1.2, // 디지털 선명함
    },
    characteristics: {
      warmth: 50,
      contrast: 50,
      saturation: 50,
      grain: 0,
      sharpness: 90,
      vintage: 5,
    },
    accentColor: '#fb923c',
    icon: '🟠',
  },
  {
    id: 'canon-eos-r5',
    name: 'Canon EOS R5',
    brand: 'Canon',
    category: 'digital',
    year: 2020,
    tagline: '따뜻한 피부톤의 명가',
    description:
      'Canon EOS R5는 4500만 화소 풀프레임 센서와 8K 동영상을 지원하는 Canon의 플래그십 미러리스 카메라입니다. Canon 특유의 따뜻한 피부톤 재현과 부드러운 하이라이트 롤오프가 특징이며, 인물 촬영에서 특히 뛰어난 결과물을 보여줍니다.',
    features: [
      '4500만 화소 풀프레임',
      '따뜻한 피부톤 재현',
      '부드러운 하이라이트 롤오프',
      '8K RAW 동영상',
    ],
    filter: {
      temperature: 8, // 웜톤
      tint: 5, // 마젠타 추가해 혈색
      contrast: -5, // 0.95: 피부 결 부드럽게
      saturation: 1.1, // 레드 옐로우 계열 발색 화사하게
      brightness: 2,
      highlights: -10, // 부드러운 롤오프
      shadows: 10, // 섀도우를 들어 올려 그늘을 밝혀줌
      fadedBlacks: 2,
      // Red: 미드톤에서 위로 볼록하게
      redCurve: [[0, 0], [64, 70], [128, 138], [192, 198], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      grain: 0.0,
      grainSize: 1,
      vignette: 0.05,
      sharpness: 1.0,
    },
    characteristics: {
      warmth: 65,
      contrast: 40,
      saturation: 65,
      grain: 0,
      sharpness: 75,
      vintage: 10,
    },
    accentColor: '#f43f5e',
    icon: '❤️',
  },
  {
    id: 'hasselblad-x2d',
    name: 'Hasselblad X2D 100C',
    brand: 'Hasselblad',
    category: 'digital',
    year: 2022,
    tagline: '미디엄 포맷의 자연스러운 아름다움',
    description:
      'Hasselblad X2D 100C는 1억 화소 미디엄 포맷 센서를 탑재한 프리미엄 미러리스 카메라입니다. Hasselblad Natural Colour Solution (HNCS)이라 불리는 색 처리 기술로 눈으로 보는 것과 가장 가까운 자연스러운 색재현을 목표로 합니다. 넓은 다이나믹 레인지와 섬세한 색 분리가 특징입니다.',
    features: [
      '1억 화소 미디엄 포맷 센서',
      'HNCS 자연색 재현',
      '16비트 컬러 깊이',
      '넓은 다이나믹 레인지',
    ],
    filter: {
      temperature: 0,
      tint: 0,
      contrast: -15, // 0.85: 촘촘하고 부드러운 연결을 위해 크게 낮춤
      saturation: 1.0, // 과장 없는 색
      brightness: 2,
      highlights: -30, // 억제 최대치
      shadows: 30, // 복구 최대치
      fadedBlacks: 0,
      // 선형 커브 유지
      redCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      greenCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      blueCurve: [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]],
      grain: 0.0,
      grainSize: 1,
      vignette: 0.1,
      sharpness: 1.3,
    },
    characteristics: {
      warmth: 50,
      contrast: 20,
      saturation: 50,
      grain: 0,
      sharpness: 95,
      vintage: 0,
    },
    accentColor: '#8b5cf6',
    icon: '💎',
  },
];

/**
 * Get all cameras or filter by category.
 */
export function getCameras(category?: 'film' | 'digital'): CameraProfile[] {
  if (!category) return cameras;
  return cameras.filter((c) => c.category === category);
}

/**
 * Get a single camera by its ID.
 */
export function getCameraById(id: string): CameraProfile | undefined {
  return cameras.find((c) => c.id === id);
}
