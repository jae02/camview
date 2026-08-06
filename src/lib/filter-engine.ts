// ============================================
// CamView — Canvas-based Filter Engine
// Client-side image processing using Canvas 2D API
// ============================================

import { FilterParams, CurvePoint } from '@/types';

/**
 * Build a 256-entry lookup table from curve control points
 * using monotone cubic interpolation.
 */
function buildCurveLUT(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  const sorted = [...points].sort((a, b) => a[0] - b[0]);

  for (let i = 0; i < 256; i++) {
    // Find surrounding control points
    let p0 = sorted[0];
    let p1 = sorted[sorted.length - 1];

    for (let j = 0; j < sorted.length - 1; j++) {
      if (i >= sorted[j][0] && i <= sorted[j + 1][0]) {
        p0 = sorted[j];
        p1 = sorted[j + 1];
        break;
      }
    }

    if (p0[0] === p1[0]) {
      lut[i] = Math.max(0, Math.min(255, p1[1]));
    } else {
      const t = (i - p0[0]) / (p1[0] - p0[0]);
      // Smooth interpolation using smoothstep
      const smooth = t * t * (3 - 2 * t);
      lut[i] = Math.max(0, Math.min(255, Math.round(p0[1] + (p1[1] - p0[1]) * smooth)));
    }
  }

  return lut;
}

/**
 * Clamp a value between 0 and 255.
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Apply color temperature shift to RGB values.
 * Positive = warm (more red/yellow), Negative = cool (more blue).
 */
function applyTemperature(r: number, g: number, b: number, temp: number): [number, number, number] {
  const t = temp / 100;
  return [
    r + t * 30,
    g + t * 5,
    b - t * 25,
  ];
}

/**
 * Apply tint shift to RGB values.
 * Positive = green, Negative = magenta.
 */
function applyTint(r: number, g: number, b: number, tint: number): [number, number, number] {
  const t = tint / 100;
  return [
    r - t * 10,
    g + t * 15,
    b - t * 10,
  ];
}

/**
 * Apply contrast adjustment.
 * Uses a standard contrast formula centered at 128.
 */
function applyContrast(value: number, contrast: number): number {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return factor * (value - 128) + 128;
}

/**
 * Convert RGB to HSL.
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to RGB.
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;

  if (s === 0) {
    const val = l * 255;
    return [val, val, val];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

/**
 * Apply saturation adjustment.
 */
function applySaturation(r: number, g: number, b: number, saturation: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  const newS = Math.max(0, Math.min(100, s * saturation));
  return hslToRgb(h, newS, l);
}

/**
 * Generate film grain noise for a pixel.
 */
function generateGrain(x: number, y: number, seed: number, intensity: number, size: number): number {
  // Simple pseudo-random based on position
  const bx = Math.floor(x / size);
  const by = Math.floor(y / size);
  const hash = Math.sin(bx * 12.9898 + by * 78.233 + seed) * 43758.5453;
  const noise = (hash - Math.floor(hash)) * 2 - 1;
  return noise * intensity * 50;
}

/**
 * Calculate vignette factor for a given position.
 * Returns a multiplier (0-1) where 1 = no vignette, 0 = full dark.
 */
function calculateVignette(
  x: number,
  y: number,
  width: number,
  height: number,
  intensity: number
): number {
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
  const vignette = 1 - dist * dist * intensity * 1.5;
  return Math.max(0.3, Math.min(1, vignette));
}

/**
 * Main filter application function.
 * Processes an entire canvas with the given filter params and intensity.
 *
 * @param canvas - Target canvas element
 * @param sourceImage - Source image to process
 * @param params - Camera filter parameters
 * @param intensity - Filter strength (0 = no effect, 1 = full effect)
 */
export function applyFilter(
  canvas: HTMLCanvasElement,
  sourceImage: HTMLImageElement,
  params: FilterParams,
  intensity: number = 1
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;

  // Draw the original image
  ctx.drawImage(sourceImage, 0, 0, width, height);

  // If intensity is 0, just show the original
  if (intensity === 0) return;

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Build curve LUTs
  const redLUT = buildCurveLUT(params.redCurve);
  const greenLUT = buildCurveLUT(params.greenCurve);
  const blueLUT = buildCurveLUT(params.blueCurve);

  // Contrast factor
  const contrastVal = params.contrast * (intensity);
  const contrastFactor = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));

  // Brightness
  const brightnessVal = params.brightness * intensity;

  // Grain seed (random per render for organic feel)
  const grainSeed = Math.random() * 1000;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    // Store original for blending
    const origR = r;
    const origG = g;
    const origB = b;

    // 1. Apply brightness
    r += brightnessVal;
    g += brightnessVal;
    b += brightnessVal;

    // 2. Apply contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 3. Apply color temperature
    const temp = params.temperature * intensity;
    r += temp * 0.3;
    g += temp * 0.05;
    b -= temp * 0.25;

    // 4. Apply tint
    const tint = params.tint * intensity;
    r -= tint * 0.1;
    g += tint * 0.15;
    b -= tint * 0.1;

    // 5. Apply highlights/shadows
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const highlightFactor = luminance * params.highlights * intensity * 0.01;
    const shadowFactor = (1 - luminance) * params.shadows * intensity * 0.01;

    r += highlightFactor * 15 + shadowFactor * 15;
    g += highlightFactor * 15 + shadowFactor * 15;
    b += highlightFactor * 15 + shadowFactor * 15;

    // 6. Clamp before curve application
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // 7. Apply color curves (interpolated with intensity)
    const curvedR = redLUT[Math.round(r)];
    const curvedG = greenLUT[Math.round(g)];
    const curvedB = blueLUT[Math.round(b)];

    r = r + (curvedR - r) * intensity;
    g = g + (curvedG - g) * intensity;
    b = b + (curvedB - b) * intensity;

    // 8. Apply saturation
    const sat = 1 + (params.saturation - 1) * intensity;
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    r = gray + (r - gray) * sat;
    g = gray + (g - gray) * sat;
    b = gray + (b - gray) * sat;

    // 9. Apply faded blacks (lift black point)
    const fade = params.fadedBlacks * intensity * 0.8;
    r = r + fade * (1 - r / 255);
    g = g + fade * (1 - g / 255);
    b = b + fade * (1 - b / 255);

    // 10. Apply grain
    if (params.grain > 0) {
      const grainAmount = generateGrain(
        x, y, grainSeed,
        params.grain * intensity,
        params.grainSize
      );
      r += grainAmount;
      g += grainAmount;
      b += grainAmount;
    }

    // 11. Apply vignette
    if (params.vignette > 0) {
      const vignetteFactor = calculateVignette(
        x, y, width, height,
        params.vignette * intensity
      );
      r *= vignetteFactor;
      g *= vignetteFactor;
      b *= vignetteFactor;
    }

    // 12. Apply halation (red glow around bright areas)
    if (params.halation && params.halation > 0) {
      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        const halationStr = params.halation * intensity * ((brightness - 200) / 55);
        r = r + halationStr * 40;
        g = g - halationStr * 5;
        b = b - halationStr * 10;
      }
    }

    // Final clamp and write
    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply a filter to an image and return a data URL.
 * Useful for generating thumbnails / previews.
 */
export function applyFilterToDataUrl(
  sourceImage: HTMLImageElement,
  params: FilterParams,
  intensity: number = 1,
  maxSize: number = 800
): string {
  const canvas = document.createElement('canvas');

  // Calculate dimensions maintaining aspect ratio
  let { width, height } = sourceImage;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  applyFilter(canvas, sourceImage, params, intensity);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Download the filtered image.
 * Uses Web Share API on mobile (iOS/Android) to save to Photos app,
 * falls back to Blob URL download on desktop.
 */
export async function downloadFilteredImage(
  canvas: HTMLCanvasElement,
  filename: string = 'camview-filtered.jpg'
): Promise<void> {
  // Convert canvas to Blob for better mobile compatibility
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95);
  });

  if (!blob) return;

  const file = new File([blob], filename, { type: 'image/jpeg' });

  // Try Web Share API first (works on mobile Safari & Android Chrome → saves to Photos)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'CamView 필터 사진',
        text: 'CamView에서 만든 필터 사진',
      });
      return;
    } catch (err) {
      // User cancelled share — fall through to download
      if ((err as Error).name === 'AbortError') return;
    }
  }

  // Fallback: Blob URL download (works on desktop & most Android browsers)
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up Blob URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
