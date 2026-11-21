import { chromaKeyPixel, type ItemBox } from './sliderMath';

export interface ProcessedSpriteSheet {
  url: string;
  width: number;
  height: number;
  boxes: [ItemBox, ItemBox, ItemBox, ItemBox];
}

const sheetCache = new Map<string, Promise<ProcessedSpriteSheet>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Strips any dark center crosshair divider lines (present on 2x2 sheets)
 * and applies seeded flood-fill + 2px edge feathering chroma key to produce
 * crisp transparent PNG cutouts while preserving green irises (Toy Bonnie, Circus Baby)
 * and olive-green fur (Springtrap), plus clearing enclosed pure #00FF00 mask eyeholes.
 */
async function processSheetInternal(
  sheetUrl: string,
  hasCenterCrosshair: boolean,
  fallbackBoxes: [ItemBox, ItemBox, ItemBox, ItemBox]
): Promise<ProcessedSpriteSheet> {
  const img = await loadImage(sheetUrl);
  const w = img.naturalWidth || 1024;
  const h = img.naturalHeight || 1024;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { url: sheetUrl, width: w, height: h, boxes: fallbackBoxes };
  }

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const midX = Math.floor(w / 2);
  const midY = Math.floor(h / 2);
  const seamMargin = hasCenterCrosshair ? Math.max(6, Math.round(w * 0.007)) : 0;
  const totalPixels = w * h;

  const isSeamPixel = new Uint8Array(totalPixels);
  const isBg = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let qHead = 0;
  let qTail = 0;

  const isFloodScreenColor = (idx4: number): boolean => {
    const r = data[idx4];
    const g = data[idx4 + 1];
    const b = data[idx4 + 2];
    const greenExcess = g - Math.max(r, b);
    return g > 130 && greenExcess > 60;
  };

  const isPureNeonSeed = (idx4: number): boolean => {
    const r = data[idx4];
    const g = data[idx4 + 1];
    const b = data[idx4 + 2];
    const maxRB = Math.max(r, b);
    const greenExcess = g - maxRB;
    return g > 175 && greenExcess > 118 && maxRB < 95;
  };

  const enqueue = (p: number) => {
    if (isBg[p]) return;
    isBg[p] = 1;
    queue[qTail++] = p;
  };

  // Mark crosshair divider seams & seed flood-fill from image borders, seam borders, and pure #00FF00 enclosed holes
  for (let y = 0; y < h; y++) {
    const nearHorizSeam = hasCenterCrosshair && Math.abs(y - midY) <= seamMargin;
    const adjHorizSeam = hasCenterCrosshair && Math.abs(y - midY) === seamMargin + 1;
    const isOuterEdgeY = y === 0 || y === h - 1;

    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const nearVertSeam = hasCenterCrosshair && Math.abs(x - midX) <= seamMargin;
      const adjVertSeam = hasCenterCrosshair && Math.abs(x - midX) === seamMargin + 1;

      if (nearHorizSeam || nearVertSeam) {
        isSeamPixel[p] = 1;
        isBg[p] = 1;
        continue;
      }

      const idx4 = p * 4;
      const onBoundary = isOuterEdgeY || x === 0 || x === w - 1 || adjHorizSeam || adjVertSeam;

      if ((onBoundary && isFloodScreenColor(idx4)) || isPureNeonSeed(idx4)) {
        enqueue(p);
      }
    }
  }

  // 4-connected BFS flood fill through green screen region
  while (qHead < qTail) {
    const p = queue[qHead++];
    const x = p % w;
    const y = (p - x) / w;

    if (x > 0) {
      const n = p - 1;
      if (!isBg[n] && !isSeamPixel[n] && isFloodScreenColor(n * 4)) enqueue(n);
    }
    if (x + 1 < w) {
      const n = p + 1;
      if (!isBg[n] && !isSeamPixel[n] && isFloodScreenColor(n * 4)) enqueue(n);
    }
    if (y > 0) {
      const n = p - w;
      if (!isBg[n] && !isSeamPixel[n] && isFloodScreenColor(n * 4)) enqueue(n);
    }
    if (y + 1 < h) {
      const n = p + w;
      if (!isBg[n] && !isSeamPixel[n] && isFloodScreenColor(n * 4)) enqueue(n);
    }
  }

  // Mark 2-pixel fringe ring adjacent to background for smooth feathering + despill
  const fringeDist = new Uint8Array(totalPixels);
  for (let p = 0; p < totalPixels; p++) {
    if (!isBg[p] || isSeamPixel[p]) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0 && !isBg[p - 1]) fringeDist[p - 1] = 1;
    if (x + 1 < w && !isBg[p + 1]) fringeDist[p + 1] = 1;
    if (y > 0 && !isBg[p - w]) fringeDist[p - w] = 1;
    if (y + 1 < h && !isBg[p + w]) fringeDist[p + w] = 1;
  }
  for (let p = 0; p < totalPixels; p++) {
    if (fringeDist[p] !== 1) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0 && !isBg[p - 1] && fringeDist[p - 1] === 0) fringeDist[p - 1] = 2;
    if (x + 1 < w && !isBg[p + 1] && fringeDist[p + 1] === 0) fringeDist[p + 1] = 2;
    if (y > 0 && !isBg[p - w] && fringeDist[p - w] === 0) fringeDist[p - w] = 2;
    if (y + 1 < h && !isBg[p + w] && fringeDist[p + w] === 0) fringeDist[p + w] = 2;
  }

  // Tight bounds for each quadrant: [minX, minY, maxX, maxY]
  const bounds: [number, number, number, number][] = [
    [w, h, 0, 0], // Q0: top-left
    [w, h, 0, 0], // Q1: top-right
    [w, h, 0, 0], // Q2: bottom-left
    [w, h, 0, 0], // Q3: bottom-right
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const idx = p * 4;

      if (isBg[p] || isSeamPixel[p]) {
        data[idx + 3] = 0;
        continue;
      }

      let alpha = 255;
      if (fringeDist[p] > 0) {
        const [nr, ng, nb, na] = chromaKeyPixel(data[idx], data[idx + 1], data[idx + 2]);
        data[idx] = nr;
        data[idx + 1] = ng;
        data[idx + 2] = nb;
        data[idx + 3] = na;
        alpha = na;
      } else {
        data[idx + 3] = 255;
      }

      if (alpha > 32) {
        const q = (y >= midY ? 2 : 0) + (x >= midX ? 1 : 0);
        const b = bounds[q];
        if (x < b[0]) b[0] = x;
        if (y < b[1]) b[1] = y;
        if (x > b[2]) b[2] = x;
        if (y > b[3]) b[3] = y;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const computedBoxes = bounds.map((b, idx): ItemBox => {
    if (b[2] <= b[0] || b[3] <= b[1]) {
      return fallbackBoxes[idx];
    }
    const pad = 2;
    const qMinX = idx % 2 === 1 ? midX : 0;
    const qMaxX = idx % 2 === 1 ? w : midX;
    const qMinY = idx >= 2 ? midY : 0;
    const qMaxY = idx >= 2 ? h : midY;

    const bx = Math.max(qMinX, b[0] - pad);
    const by = Math.max(qMinY, b[1] - pad);
    const maxX = Math.min(qMaxX, b[2] + pad);
    const maxY = Math.min(qMaxY, b[3] + pad);

    return {
      bx,
      by,
      bw: Math.max(10, maxX - bx),
      bh: Math.max(10, maxY - by),
    };
  }) as [ItemBox, ItemBox, ItemBox, ItemBox];

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((res) => resolve(res), 'image/png')
  );
  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');

  return {
    url,
    width: w,
    height: h,
    boxes: computedBoxes,
  };
}

export function loadProcessedSpriteSheet(
  sheetUrl: string,
  hasCenterCrosshair: boolean,
  fallbackBoxes: [ItemBox, ItemBox, ItemBox, ItemBox]
): Promise<ProcessedSpriteSheet> {
  const key = `${sheetUrl}|${hasCenterCrosshair ? '1' : '0'}`;
  const existing = sheetCache.get(key);
  if (existing) return existing;

  const promise = processSheetInternal(sheetUrl, hasCenterCrosshair, fallbackBoxes).catch(() => ({
    url: sheetUrl,
    width: 1024,
    height: 1024,
    boxes: fallbackBoxes,
  }));
  sheetCache.set(key, promise);
  return promise;
}
