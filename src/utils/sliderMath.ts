export interface CoverPoint {
  t: number;
  c: number;
}

export interface ItemBox {
  bx: number;
  by: number;
  bw: number;
  bh: number;
}

export interface ViewportMetrics {
  u: number;
  n: number;
  fy: number;
  isMobile: boolean;
  frameWidth: number;
  frameHeight: number;
  frameLeft: number;
  frameTop: number;
}

export interface WordGeometry {
  fontSize: number;
  letterSpacing: string;
  top: number;
}

export interface CropLayout {
  width: number;
  height: number;
  backgroundSize: string;
  backgroundPosition: string;
}

export const DESIGN_WIDTH = 1440;
export const DESIGN_HEIGHT = 900;
export const WIPE_DURATION_MS = 970;

export const PARALLAX_FACTORS = {
  word: 0.4,
  shadow: 0.3,
  bottle: 0.15,
  fruit: 0.55,
  corner: 0.75,
} as const;

export type LayerName = keyof typeof PARALLAX_FACTORS;

export const SHADOW_SPECS = [
  { id: 'left-prop', cx: 345, cy: 650, w: 170, h: 24 },
  { id: 'centerpiece', cx: 720, cy: 708, w: 320, h: 30 },
  { id: 'right-prop', cx: 1318, cy: 638, w: 160, h: 22 },
  { id: 'bottom-right-prop', cx: 1045, cy: 760, w: 150, h: 22 },
] as const;

export const COVER_POINTS: readonly CoverPoint[] = [
  { t: 0, c: 0 },
  { t: 0.031, c: 0.006 },
  { t: 0.134, c: 0.012 },
  { t: 0.206, c: 0.023 },
  { t: 0.278, c: 0.047 },
  { t: 0.34, c: 0.07 },
  { t: 0.412, c: 0.105 },
  { t: 0.485, c: 0.158 },
  { t: 0.546, c: 0.246 },
  { t: 0.583, c: 0.55 },
  { t: 0.62, c: 0.825 },
  { t: 0.69, c: 0.9 },
  { t: 0.79, c: 0.94 },
  { t: 0.85, c: 0.956 },
  { t: 0.93, c: 0.975 },
  { t: 1, c: 1 },
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(k: number): number {
  const x = clamp(k, 0, 1);
  return 3 * x * x - 2 * x * x * x;
}

export function easeOutQuad(k: number): number {
  const x = clamp(k, 0, 1);
  return 1 - (1 - x) * (1 - x);
}

/**
 * Computes clip coverage fraction c in [0, 1] for time fraction t in [0, 1]
 * using the 16-point measured table with smoothstep interpolation.
 */
export function coverAt(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  for (let i = 0; i < COVER_POINTS.length - 1; i++) {
    const p0 = COVER_POINTS[i];
    const p1 = COVER_POINTS[i + 1];
    if (t >= p0.t && t <= p1.t) {
      const span = p1.t - p0.t;
      const localK = span > 0 ? (t - p0.t) / span : 1;
      const s = smoothstep(localK);
      return p0.c + (p1.c - p0.c) * s;
    }
  }
  return 1;
}

/**
 * Computes incoming slide layer translateX in px.
 * Starts pushed toward the incoming side and lands at 0 when (t - 0.5) / 0.42 reaches 1.
 */
export function computeParallaxOffset(
  t: number,
  dir: 1 | -1,
  factor: number,
  frameWidth: number
): number {
  const rawK = clamp((t - 0.5) / 0.42, 0, 1);
  const k = easeOutQuad(rawK);
  return dir * (1 - k) * factor * frameWidth;
}

/**
 * Computes outgoing slide layer drift translateX in px.
 */
export function computeOutwardDrift(
  c: number,
  dir: 1 | -1,
  frameWidth: number
): number {
  return -dir * c * 0.14 * frameWidth;
}

/**
 * Computes responsive --u, --n, frame offset fy, and frame dimensions.
 * Mobile applies when width <= 820 or height > width.
 */
export function computeViewportMetrics(width: number, height: number): ViewportMetrics {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const isMobile = safeW <= 820 || safeH > safeW;

  const baseScale = Math.min(safeW / DESIGN_WIDTH, safeH / DESIGN_HEIGHT);
  const u = isMobile
    ? Math.max(0.25, Math.min(safeW / 640, (safeH - 200) / 620))
    : baseScale;
  const n = isMobile ? 1 : clamp(baseScale, 0.5, 1.3);
  const fy = isMobile ? 8 : 0;

  const frameWidth = DESIGN_WIDTH * u;
  const frameHeight = DESIGN_HEIGHT * u;
  const frameLeft = safeW * 0.5 - 720 * u;
  const frameTop = safeH * 0.5 - 450 * u + fy;

  return {
    u,
    n,
    fy,
    isMobile,
    frameWidth,
    frameHeight,
    frameLeft,
    frameTop,
  };
}

/**
 * Computes the giant background word font size (design px), letter-spacing, and
 * top position (design px) so every word shares the same cap-line center at y=403.5.
 *
 * `inkRatioAt100` is the measured ink width at 100px font size divided by 100.
 */
export function computeWordGeometry(
  isMobile: boolean,
  viewportWidth: number,
  u: number,
  inkRatioDefaultAt100: number,
  inkRatioTightAt100?: number
): WordGeometry {
  const defaultSize = 445;
  const maxWidthDefault = isMobile
    ? Math.min(DESIGN_WIDTH, viewportWidth / Math.max(0.01, u)) * 0.92
    : 1330;
  const targetFitWidth = isMobile
    ? Math.min(DESIGN_WIDTH, viewportWidth / Math.max(0.01, u)) * 0.92
    : 1400;

  const defaultInkWidth = defaultSize * Math.max(0.1, inkRatioDefaultAt100);
  let fontSize = defaultSize;
  let letterSpacing = '0.005em';

  if (defaultInkWidth > maxWidthDefault) {
    letterSpacing = '-0.035em';
    const ratioTight = Math.max(
      0.1,
      inkRatioTightAt100 ?? inkRatioDefaultAt100 * 0.93
    );
    fontSize = Math.min(defaultSize, targetFitWidth / ratioTight);
  }

  const baseline = 403.5 + (0.698 * fontSize) / 2;
  const top = baseline - 0.85 * fontSize;

  return { fontSize, letterSpacing, top };
}

/**
 * Computes CSS background crop geometry for a sheet item [bx, by, bw, bh]
 * at target width W (design px), scaled by u.
 */
export function computeCropLayout(
  box: ItemBox,
  targetDesignWidth: number,
  sheetWidth: number,
  sheetHeight: number,
  u: number
): CropLayout {
  const safeBw = Math.max(1, box.bw);
  const s = targetDesignWidth / safeBw;
  const width = targetDesignWidth * u;
  const height = box.bh * s * u;
  const bgW = sheetWidth * s * u;
  const bgH = sheetHeight * s * u;
  const posX = -box.bx * s * u;
  const posY = -box.by * s * u;

  return {
    width,
    height,
    backgroundSize: `${bgW}px ${bgH}px`,
    backgroundPosition: `${posX}px ${posY}px`,
  };
}

/**
 * Determines shortest forward/backward direction for tab clicks.
 * Clicking a tab to the right goes forward (+1); to the left goes backward (-1).
 */
export function resolveTabDirection(currentIndex: number, targetIndex: number): 1 | -1 {
  return targetIndex >= currentIndex ? 1 : -1;
}

/**
 * Wraps slide index cleanly in either direction.
 */
export function stepSlideIndex(currentIndex: number, dir: 1 | -1, total: number): number {
  return (currentIndex + dir + total) % total;
}

/**
 * Pure chroma-key pixel processor for #00FF00 greenscreen sheets.
 * Removes bright green background with smooth edge feathering and green spill suppression,
 * while preserving whites (teeth/eyes), dark shadows, reds, purples, browns, and golds.
 */
export function chromaKeyPixel(
  r: number,
  g: number,
  b: number
): [number, number, number, number] {
  const maxRB = Math.max(r, b);
  const greenExcess = g - maxRB;

  // Strongly green background pixel -> fully transparent
  if (greenExcess > 52 && g > 110) {
    return [r, maxRB, b, 0];
  }

  // Soft transition edge zone -> smooth alpha + green despill
  if (greenExcess > 14 && g > 75) {
    const t = clamp((greenExcess - 14) / (52 - 14), 0, 1);
    const alpha = Math.round((1 - t) * 255);
    const despilledG = Math.min(g, Math.round(maxRB + (g - maxRB) * (1 - t) * 0.35));
    return [r, despilledG, b, alpha];
  }

  // Subtle spill cleanup on border pixels that remain opaque
  if (greenExcess > 6 && g > 90) {
    const despilledG = Math.round(maxRB + (g - maxRB) * 0.45);
    return [r, despilledG, b, 255];
  }

  return [r, g, b, 255];
}
