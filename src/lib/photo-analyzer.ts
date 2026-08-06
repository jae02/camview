// ============================================
// CamView — Photo Composition & Quality Analyzer
// Client-side image analysis using Canvas 2D
// ============================================

import { CameraProfile } from '@/types';

export interface PhotoAnalysisResult {
  totalScore: number; // 0 ~ 100
  grade: 'S+' | 'S' | 'A' | 'B' | 'C';
  gradeText: string;
  metrics: {
    centering: { score: number; label: string; desc: string };
    exposure: { score: number; label: string; desc: string };
    sharpness: { score: number; label: string; desc: string };
    colorHarmony: { score: number; label: string; desc: string };
  };
  recommendedCameraId: string;
  recommendedReason: string;
  tips: string[];
}

/**
 * Analyzes an image using HTML Canvas and returns comprehensive scoring & recommendations.
 */
export function analyzePhoto(
  image: HTMLImageElement,
  cameras: CameraProfile[]
): PhotoAnalysisResult {
  const canvas = document.createElement('canvas');
  // Analyze on a normalized 240x240 canvas for fast, consistent processing
  const size = 240;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return getDefaultResult();
  }

  ctx.drawImage(image, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // 1. Calculate Luminance Grid & Center of Mass (Centering & Composition)
  let totalLuminance = 0;
  let weightedX = 0;
  let weightedY = 0;
  let edgeEnergySum = 0;
  let centerEnergySum = 0;

  const histogram = new Array(256).fill(0);
  let saturationSum = 0;
  let warmPixelCount = 0;
  let coolPixelCount = 0;

  const centerX = size / 2;
  const centerY = size / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  // Luminance 2D array for Laplacian edge / sharpness detection
  const lumGrid: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      lumGrid[y][x] = lum;
      histogram[lum]++;

      totalLuminance += lum;
      weightedX += x * lum;
      weightedY += y * lum;

      // Color temperature tendency
      if (r > b + 15) warmPixelCount++;
      else if (b > r + 15) coolPixelCount++;

      // Saturation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      saturationSum += sat;

      // Center vs periphery weight
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxDist;
      if (distFromCenter < 0.4) {
        centerEnergySum += lum;
      }
    }
  }

  // Centering score calculation (Deviation of visual center from geometric center)
  const avgWeightedX = totalLuminance > 0 ? weightedX / totalLuminance : centerX;
  const avgWeightedY = totalLuminance > 0 ? weightedY / totalLuminance : centerY;
  const centerOffset = Math.sqrt(
    ((avgWeightedX - centerX) / size) ** 2 + ((avgWeightedY - centerY) / size) ** 2
  );
  
  // Rule of thirds / balance score
  const centeringScore = Math.min(
    100,
    Math.max(60, Math.round(100 - centerOffset * 180))
  );

  // 2. Sharpness & Detail Calculation (Sobel/Laplacian gradient approximation)
  let laplacianSum = 0;
  let sampleCount = 0;
  for (let y = 2; y < size - 2; y += 2) {
    for (let x = 2; x < size - 2; x += 2) {
      const center = lumGrid[y][x];
      const laplacian = Math.abs(
        lumGrid[y - 1][x] +
        lumGrid[y + 1][x] +
        lumGrid[y][x - 1] +
        lumGrid[y][x + 1] -
        4 * center
      );
      laplacianSum += laplacian;
      sampleCount++;
    }
  }
  const avgLaplacian = sampleCount > 0 ? laplacianSum / sampleCount : 0;
  const sharpnessScore = Math.min(
    100,
    Math.max(65, Math.round(50 + avgLaplacian * 2.8))
  );

  // 3. Exposure Balance (Histogram distribution, lack of clipping)
  const totalPixels = size * size;
  const shadowClipping = (histogram.slice(0, 10).reduce((a, b) => a + b, 0) / totalPixels) * 100;
  const highlightClipping = (histogram.slice(245, 256).reduce((a, b) => a + b, 0) / totalPixels) * 100;
  const avgLum = totalLuminance / totalPixels;

  let exposureScore = 90;
  if (shadowClipping > 15) exposureScore -= shadowClipping * 0.8;
  if (highlightClipping > 15) exposureScore -= highlightClipping * 0.8;
  if (avgLum < 60 || avgLum > 195) exposureScore -= Math.abs(avgLum - 128) * 0.2;
  exposureScore = Math.min(100, Math.max(60, Math.round(exposureScore)));

  // 4. Color Harmony & Richness
  const avgSat = saturationSum / totalPixels;
  const colorHarmonyScore = Math.min(
    100,
    Math.max(65, Math.round(70 + avgSat * 40))
  );

  // 5. Total Weighted Score
  const totalScore = Math.round(
    centeringScore * 0.3 +
    exposureScore * 0.25 +
    sharpnessScore * 0.25 +
    colorHarmonyScore * 0.2
  );

  // Grade determination
  let grade: PhotoAnalysisResult['grade'] = 'A';
  let gradeText = '매우 뛰어난 구도와 완성도';
  if (totalScore >= 95) {
    grade = 'S+';
    gradeText = '전시회 수준의 완벽한 밸런스';
  } else if (totalScore >= 88) {
    grade = 'S';
    gradeText = '황금 비율과 탁월한 명암비';
  } else if (totalScore >= 78) {
    grade = 'A';
    gradeText = '안정적인 구도와 풍부한 색감';
  } else if (totalScore >= 68) {
    grade = 'B';
    gradeText = '자연스러운 데일리 스냅 톤';
  } else {
    grade = 'C';
    gradeText = '독창적인 시선과 개성';
  }

  // 6. Camera Recommendation Logic based on actual photo characteristics
  let recommendedCameraId = 'kodak-portra-400';
  let recommendedReason = '';

  if (avgSat < 0.15 && sharpnessScore > 80) {
    recommendedCameraId = 'ilford-hp5';
    recommendedReason = '명암 대비와 디테일이 강해 클래식 흑백의 묵직한 은염 입자감이 극대화됩니다.';
  } else if (warmPixelCount > coolPixelCount * 1.4 && avgLum > 110) {
    recommendedCameraId = 'kodak-portra-400';
    recommendedReason = '따뜻한 광량과 부드러운 하이라이트 덕분에 포트라 400의 파스텔 인물톤이 가장 돋보입니다.';
  } else if (avgSat > 0.45 && highlightClipping < 10) {
    recommendedCameraId = 'fujifilm-velvia-50';
    recommendedReason = '풍부한 원색 정보가 담겨 있어 벨비아 50의 극적인 고채도 풍경 룩과 최고의 궁합입니다.';
  } else if (avgLum < 90 && (coolPixelCount > warmPixelCount || highlightClipping > 5)) {
    recommendedCameraId = 'cinestill-800t';
    recommendedReason = '어두운 배경과 하이라이트 포인트가 있어 시네스틸의 시네마틱 텅스텐 & 레드 할레이션이 극적으로 연출됩니다.';
  } else if (sharpnessScore >= 85 && exposureScore >= 85) {
    recommendedCameraId = 'leica-q3';
    recommendedReason = '피사체의 마이크로 콘트라스트가 우수하여 라이카 특유의 묵직하고 입체적인 룩을 완벽히 소화합니다.';
  } else {
    recommendedCameraId = 'fujifilm-x100v';
    recommendedReason = '차분하고 편안한 분위기로, 후지필름 클래식 크롬의 감성적인 Muted 톤과 가장 잘 어울립니다.';
  }

  // 7. Actionable Tips
  const tips: string[] = [];
  if (centeringScore >= 85) {
    tips.push('🎯 시각적 중심 균형이 아주 안정적입니다.');
  } else {
    tips.push('📐 피사체의 무게 중심이 한쪽으로 치우쳐 독특하고 역동적인 긴장감을 줍니다.');
  }

  if (exposureScore >= 85) {
    tips.push('💡 명부와 암부의 정보가 손실 없이 훌륭하게 보존되었습니다.');
  } else if (shadowClipping > 20) {
    tips.push('🌑 섀도우가 깊게 떨어져 묵직한 분위기를 연출합니다.');
  }

  if (sharpnessScore >= 85) {
    tips.push('✨ 피사체의 질감과 초점 디테일이 매우 선명합니다.');
  }

  return {
    totalScore,
    grade,
    gradeText,
    metrics: {
      centering: {
        score: centeringScore,
        label: '구도 & 밸런스',
        desc: centeringScore >= 85 ? '안정적인 중심점' : '역동적인 시점',
      },
      exposure: {
        score: exposureScore,
        label: '노출 & 계조',
        desc: exposureScore >= 85 ? '넓은 다이내믹 레인지' : '개성 있는 명암',
      },
      sharpness: {
        score: sharpnessScore,
        label: '선명도 & 디테일',
        desc: sharpnessScore >= 85 ? '초고선명 디테일' : '부드러운 감성 초점',
      },
      colorHarmony: {
        score: colorHarmonyScore,
        label: '색감 조화도',
        desc: colorHarmonyScore >= 85 ? '풍부한 컬러 스펙트럼' : '차분한 톤앤매너',
      },
    },
    recommendedCameraId,
    recommendedReason,
    tips,
  };
}

function getDefaultResult(): PhotoAnalysisResult {
  return {
    totalScore: 88,
    grade: 'S',
    gradeText: '황금 비율과 탁월한 명암비',
    metrics: {
      centering: { score: 88, label: '구도 & 밸런스', desc: '안정적인 중심점' },
      exposure: { score: 85, label: '노출 & 계조', desc: '풍부한 계조' },
      sharpness: { score: 90, label: '선명도 & 디테일', desc: '선명한 디테일' },
      colorHarmony: { score: 87, label: '색감 조화도', desc: '자연스러운 발색' },
    },
    recommendedCameraId: 'kodak-portra-400',
    recommendedReason: '부드러운 하이라이트와 자연스러운 톤으로 포트라 400 필터에 적합합니다.',
    tips: ['🎯 중심 균형이 안정적입니다.', '💡 계조 표현이 우수합니다.'],
  };
}
