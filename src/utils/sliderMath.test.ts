import test from 'node:test';
import assert from 'node:assert/strict';
import {
  coverAt,
  computeParallaxOffset,
  computeOutwardDrift,
  computeViewportMetrics,
  computeWordGeometry,
  computeCropLayout,
  resolveTabDirection,
  stepSlideIndex,
  chromaKeyPixel,
  PARALLAX_FACTORS,
} from './sliderMath';

test('coverAt matches measured boundary and midpoint smoothstep curve', () => {
  assert.equal(coverAt(0), 0);
  assert.equal(coverAt(1), 1);
  assert.equal(coverAt(-0.2), 0);
  assert.equal(coverAt(1.5), 1);

  // At t=0.485 exact control point -> c=0.158
  assert.ok(Math.abs(coverAt(0.485) - 0.158) < 1e-6);
  // At t=0.583 exact control point -> c=0.55
  assert.ok(Math.abs(coverAt(0.583) - 0.55) < 1e-6);
  // Monotonic non-decreasing across [0, 1]
  let prev = 0;
  for (let i = 1; i <= 100; i++) {
    const cur = coverAt(i / 100);
    assert.ok(cur >= prev, `coverAt decreased at ${i / 100}`);
    prev = cur;
  }
});

test('parallax and outward drift follow exact direction and factor rules', () => {
  const frameWidth = 1440;
  // Before t=0.5, incoming layer sits at full factor * frameWidth
  assert.equal(
    computeParallaxOffset(0.25, 1, PARALLAX_FACTORS.word, frameWidth),
    0.4 * 1440
  );
  assert.equal(
    computeParallaxOffset(0.25, -1, PARALLAX_FACTORS.corner, frameWidth),
    -0.75 * 1440
  );
  // Once (t - 0.5) / 0.42 >= 1 (t >= 0.92), incoming layer settles to 0
  assert.equal(computeParallaxOffset(0.92, 1, PARALLAX_FACTORS.fruit, frameWidth), 0);
  assert.equal(computeParallaxOffset(1.0, 1, PARALLAX_FACTORS.bottle, frameWidth), 0);

  // Outward drift translates opposite to direction up to 0.14 * frameWidth
  assert.ok(Math.abs(computeOutwardDrift(1, 1, frameWidth) - -0.14 * 1440) < 1e-6);
  assert.ok(Math.abs(computeOutwardDrift(1, -1, frameWidth) - 0.14 * 1440) < 1e-6);
});

test('viewport metrics handle desktop, landscape mobile, and portrait mobile', () => {
  const desktop = computeViewportMetrics(1440, 900);
  assert.equal(desktop.isMobile, false);
  assert.equal(desktop.u, 1);
  assert.equal(desktop.n, 1);
  assert.equal(desktop.fy, 0);
  assert.equal(desktop.frameLeft, 0);
  assert.equal(desktop.frameTop, 0);

  // Short landscape phone (844 x 390) stays desktop layout with --n floored at 0.5
  const shortLandscape = computeViewportMetrics(844, 390);
  assert.equal(shortLandscape.isMobile, false);
  assert.equal(shortLandscape.n, 0.5);

  // Portrait mobile (390 x 844) switches to mobile layout with n=1, fy=8
  const mobile = computeViewportMetrics(390, 844);
  assert.equal(mobile.isMobile, true);
  assert.equal(mobile.n, 1);
  assert.equal(mobile.fy, 8);
  assert.ok(Math.abs(mobile.u - 390 / 640) < 1e-6);
});

test('word geometry preserves cap-line centering and tightens long words', () => {
  // Short word ("Foxy") stays at 445px with 0.005em tracking on desktop
  const shortWord = computeWordGeometry(false, 1440, 1, 2.3);
  assert.equal(shortWord.fontSize, 445);
  assert.equal(shortWord.letterSpacing, '0.005em');
  assert.ok(Math.abs(shortWord.top - 180.555) < 0.01);

  // Long word exceeding 1330px ink width tightens to -0.035em and shrinks
  const longWord = computeWordGeometry(false, 1440, 1, 3.6, 3.35);
  assert.equal(longWord.letterSpacing, '-0.035em');
  assert.ok(longWord.fontSize < 445);
  assert.ok(Math.abs(longWord.fontSize - 1400 / 3.35) < 0.01);
});

test('crop layout scales sheet coordinates proportionally', () => {
  const crop = computeCropLayout({ bx: 100, by: 50, bw: 200, bh: 400 }, 400, 1024, 1024, 1);
  assert.equal(crop.width, 400);
  assert.equal(crop.height, 800);
  assert.equal(crop.backgroundSize, '2048px 2048px');
  assert.equal(crop.backgroundPosition, '-200px -100px');
});

test('slide indexing and tab direction wrap and orient properly', () => {
  assert.equal(resolveTabDirection(0, 2), 1);
  assert.equal(resolveTabDirection(3, 1), -1);
  assert.equal(stepSlideIndex(3, 1, 4), 0);
  assert.equal(stepSlideIndex(0, -1, 4), 3);
});

test('chromaKeyPixel removes pure greenscreen while keeping dark metal and white teeth', () => {
  const [, , , bgAlpha] = chromaKeyPixel(0, 255, 0);
  assert.equal(bgAlpha, 0);

  const [, , , teethAlpha] = chromaKeyPixel(245, 245, 240);
  assert.equal(teethAlpha, 255);

  const [, , , darkMetalAlpha] = chromaKeyPixel(30, 32, 35);
  assert.equal(darkMetalAlpha, 255);

  const [, , , crimsonAlpha] = chromaKeyPixel(185, 28, 36);
  assert.equal(crimsonAlpha, 255);
});
