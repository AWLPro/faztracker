import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HERO_GAMES } from './data/heroGames';
import { DEFAULT_GAMES, type TrackerGame } from './data/faztrackerGames';
import { getGameProgress, normalizeGameObject } from './utils/faztrackerLogic';
import { AnimatronicSlideView, type SlideLayerRefs } from './components/AnimatronicSlideView';
import {
  CompletionOverviewSection,
  LoreTimelineSection,
} from './components/CompletionOverviewSection';
import { FaztrackerArchiveSection } from './components/FaztrackerArchiveSection';
import { loadProcessedSpriteSheet, type ProcessedSpriteSheet } from './utils/spriteSheet';
import {
  computeOutwardDrift,
  computeParallaxOffset,
  computeViewportMetrics,
  computeWordGeometry,
  coverAt,
  PARALLAX_FACTORS,
  resolveTabDirection,
  stepSlideIndex,
  WIPE_DURATION_MS,
  type LayerName,
  type WordGeometry,
} from './utils/sliderMath';

const LAYER_ORDER: readonly LayerName[] = ['word', 'shadow', 'bottle', 'fruit', 'corner'];
const STORAGE_KEY_V2 = 'fazbear_tracker_v2';
const LEGACY_KEYS = ['fazbear_tracker_v1', 'fazbearTrackerData'];

function loadInitialGames(): TrackerGame[] {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_GAMES);
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && Array.isArray(parsed.games) && parsed.games.length > 0) {
        return parsed.games.map((item: TrackerGame) => normalizeGameObject(item));
      }
    }
    for (const oldKey of LEGACY_KEYS) {
      const rawOld = window.localStorage.getItem(oldKey);
      if (rawOld) {
        const parsedOld = JSON.parse(rawOld);
        const list = Array.isArray(parsedOld)
          ? parsedOld
          : parsedOld && Array.isArray(parsedOld.games)
            ? parsedOld.games
            : null;
        if (list && list.length > 0) {
          return list.map((item: TrackerGame) => normalizeGameObject(item));
        }
      }
    }
  } catch {
    // Fallback to defaults
  }
  return structuredClone(DEFAULT_GAMES);
}

function measureWordRatios(word: string): { defaultRatio: number; tightRatio: number } {
  if (typeof document === 'undefined') {
    return { defaultRatio: word.length * 0.62, tightRatio: word.length * 0.56 };
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { defaultRatio: word.length * 0.62, tightRatio: word.length * 0.56 };
  }

  ctx.font = '700 100px Poppins, system-ui, sans-serif';
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0.5px';
  }
  const m1 = ctx.measureText(word);
  const w1 = (m1.actualBoundingBoxLeft ?? 0) + (m1.actualBoundingBoxRight ?? m1.width);

  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-3.5px';
  }
  const m2 = ctx.measureText(word);
  const w2 = (m2.actualBoundingBoxLeft ?? 0) + (m2.actualBoundingBoxRight ?? m2.width);

  return {
    defaultRatio: (w1 > 0 ? w1 : m1.width) / 100,
    tightRatio: (w2 > 0 ? w2 : m2.width) / 100,
  };
}

export default function App() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [uiRevealed, setUiRevealed] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [sheets, setSheets] = useState<Record<string, ProcessedSpriteSheet>>({});
  const [underline, setUnderline] = useState({ left: 0, width: 0, animate: false });
  const [transitionSlides, setTransitionSlides] = useState<{ from: number; to: number } | null>(null);

  const [games, setGames] = useState<TrackerGame[]>(loadInitialGames);
  const [detailGameId, setDetailGameId] = useState<string | null>(null);

  const slideRefsMap = useRef<(SlideLayerRefs | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navScrollRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef(false);
  const currentIndexRef = useRef(0);
  const lastInteractionRef = useRef(Date.now());
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_V2,
        JSON.stringify({ version: 2, updatedAt: new Date().toISOString(), games })
      );
    } catch {
      // Ignore storage quota warning
    }
  }, [games]);

  const heroHeight = Math.max(600, viewport.height);
  const metrics = useMemo(
    () => computeViewportMetrics(viewport.width, heroHeight),
    [viewport.width, heroHeight]
  );

  // Apply --u and --n root CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--u', `${metrics.u}px`);
    root.style.setProperty('--n', `${metrics.n}px`);
  }, [metrics.u, metrics.n]);

  // Resize listener
  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load and chroma-key unique canon game 2x2 sprite sheets
  useEffect(() => {
    let cancelled = false;
    const uniqueSpecs = new Map<
      string,
      {
        sheetUrl: string;
        hasCenterCrosshair: boolean;
        defaultBoxes: (typeof HERO_GAMES)[number]['defaultBoxes'];
      }
    >();

    for (const slide of HERO_GAMES) {
      const key = `${slide.sheetUrl}|${slide.hasCenterCrosshair ? '1' : '0'}`;
      if (!uniqueSpecs.has(key)) {
        uniqueSpecs.set(key, {
          sheetUrl: slide.sheetUrl,
          hasCenterCrosshair: slide.hasCenterCrosshair,
          defaultBoxes: slide.defaultBoxes,
        });
      }
    }

    Promise.all(
      Array.from(uniqueSpecs.entries()).map(async ([key, spec]) => {
        const processed = await loadProcessedSpriteSheet(
          spec.sheetUrl,
          spec.hasCenterCrosshair,
          spec.defaultBoxes
        );
        return [key, processed] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const byKey = new Map(entries);
      const map: Record<string, ProcessedSpriteSheet> = {};
      for (const slide of HERO_GAMES) {
        const key = `${slide.sheetUrl}|${slide.hasCenterCrosshair ? '1' : '0'}`;
        const data = byKey.get(key);
        if (data) {
          map[slide.id] = data;
        }
      }
      setSheets(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Word geometries per slide, recomputed once fonts load or viewport changes
  const wordGeometries: WordGeometry[] = useMemo(() => {
    return HERO_GAMES.map((slide) => {
      const { defaultRatio, tightRatio } = measureWordRatios(slide.word);
      return computeWordGeometry(
        metrics.isMobile,
        viewport.width,
        metrics.u,
        defaultRatio,
        tightRatio
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.isMobile, metrics.u, viewport.width, fontsReady]);

  // Measure and position the gliding nav underline under a tab index and center tab in scroll rail
  const syncUnderlineToIndex = useCallback((index: number, animate: boolean) => {
    const btn = tabRefs.current[index];
    if (!btn) return;
    setUnderline({ left: btn.offsetLeft, width: btn.offsetWidth, animate });

    const navEl = navScrollRef.current;
    if (navEl && navEl.scrollWidth > navEl.clientWidth) {
      const targetLeft = Math.max(
        0,
        Math.min(
          navEl.scrollWidth - navEl.clientWidth,
          btn.offsetLeft + btn.offsetWidth / 2 - navEl.clientWidth / 2
        )
      );
      navEl.scrollTo({
        left: targetLeft,
        behavior: animate ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      syncUnderlineToIndex(currentIndex, false);
    });
    return () => cancelAnimationFrame(raf);
  }, [metrics.isMobile, metrics.n, fontsReady, viewport.width, currentIndex, syncUnderlineToIndex]);

  // Opening sequence after document.fonts.ready + 3s failsafe
  useEffect(() => {
    let settled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const runReveal = () => {
      if (settled) return;
      settled = true;
      setFontsReady(true);

      if (reducedMotion) {
        setUiRevealed(true);
        return;
      }

      const firstSlide = slideRefsMap.current[0];
      if (firstSlide) {
        for (const layerName of LAYER_ORDER) {
          const el = firstSlide.layers[layerName];
          if (!el) continue;
          const startX = PARALLAX_FACTORS[layerName] * metrics.frameWidth;
          el.animate(
            [
              { transform: `translate3d(${startX}px, 0, 0)` },
              { transform: 'translate3d(0, 0, 0)' },
            ],
            {
              duration: 900,
              easing: 'cubic-bezier(0.22, 0.8, 0.3, 1)',
              fill: 'both',
            }
          );
        }
      }

      requestAnimationFrame(() => {
        setUiRevealed(true);
      });
    };

    const failsafe = window.setTimeout(() => {
      runReveal();
    }, 3000);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        runReveal();
      });
    } else {
      runReveal();
    }

    return () => {
      window.clearTimeout(failsafe);
    };
    // Run opening sequence once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measured 970 ms panel-wipe & parallax transition
  const goToSlide = useCallback(
    (targetIndex: number, dir: 1 | -1, isUserAction: boolean) => {
      if (isUserAction) {
        lastInteractionRef.current = Date.now();
      }
      const fromIndex = currentIndexRef.current;
      if (targetIndex === fromIndex || isTransitioningRef.current) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      syncUnderlineToIndex(targetIndex, !reducedMotion);

      if (reducedMotion) {
        currentIndexRef.current = targetIndex;
        setCurrentIndex(targetIndex);
        return;
      }

      const slideA = slideRefsMap.current[fromIndex];
      const slideB = slideRefsMap.current[targetIndex];
      if (!slideA?.section || !slideB?.section) {
        currentIndexRef.current = targetIndex;
        setCurrentIndex(targetIndex);
        return;
      }

      isTransitioningRef.current = true;
      setTransitionSlides({ from: fromIndex, to: targetIndex });
      const frameW = computeViewportMetrics(
        window.innerWidth,
        Math.max(600, window.innerHeight)
      ).frameWidth;

      if (slideB.section) {
        slideB.section.style.clipPath = 'none';
      }

      // Initial parallax push for B
      for (const layerName of LAYER_ORDER) {
        const elB = slideB.layers[layerName];
        if (elB) {
          const offset = computeParallaxOffset(0, dir, PARALLAX_FACTORS[layerName], frameW);
          elB.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = elapsed / WIPE_DURATION_MS;
        const c = coverAt(Math.min(1, t));

        // Clip A from right-to-left (forward) or left-to-right (backward)
        const pct = (c * 100).toFixed(4);
        if (slideA.section) {
          slideA.section.style.clipPath =
            dir === 1 ? `inset(0 ${pct}% 0 0)` : `inset(0 0 0 ${pct}%)`;
        }

        // Drift A away
        const driftX = computeOutwardDrift(c, dir, frameW);
        for (const layerName of LAYER_ORDER) {
          const elA = slideA.layers[layerName];
          if (elA) {
            elA.style.transform = `translate3d(${driftX}px, 0, 0)`;
          }
        }

        // Slide B layers in with parallax
        for (const layerName of LAYER_ORDER) {
          const elB = slideB.layers[layerName];
          if (elB) {
            const offset = computeParallaxOffset(t, dir, PARALLAX_FACTORS[layerName], frameW);
            elB.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        }

        const kDone = (t - 0.5) / 0.42 >= 1;
        if (t < 1 || !kDone) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Clean up all clips and transforms
          if (slideA.section) {
            slideA.section.style.clipPath = '';
          }
          if (slideB.section) {
            slideB.section.style.clipPath = '';
          }
          for (const layerName of LAYER_ORDER) {
            const elA = slideA.layers[layerName];
            const elB = slideB.layers[layerName];
            if (elA) elA.style.transform = '';
            if (elB) elB.style.transform = '';
          }

          currentIndexRef.current = targetIndex;
          isTransitioningRef.current = false;
          setTransitionSlides(null);
          setCurrentIndex(targetIndex);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [syncUnderlineToIndex]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStep = useCallback(
    (dir: 1 | -1, isUserAction: boolean) => {
      const next = stepSlideIndex(currentIndexRef.current, dir, HERO_GAMES.length);
      goToSlide(next, dir, isUserAction);
    },
    [goToSlide]
  );

  // Autoplay every 2600 ms when hero is in view, visible, idle for 6 s, and no modal is open
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (document.querySelector('[role="dialog"]')) return;
      if (window.scrollY > window.innerHeight * 0.55) return;
      if (isTransitioningRef.current) return;
      if (Date.now() - lastInteractionRef.current < 6000) return;

      const next = stepSlideIndex(currentIndexRef.current, 1, HERO_GAMES.length);
      goToSlide(next, 1, false);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [goToSlide]);

  // Keyboard ArrowLeft / ArrowRight navigation (ignored inside form inputs or dialogs)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (window.scrollY > window.innerHeight * 0.7) return;

      if (e.key === 'ArrowRight') {
        handleStep(1, true);
      } else if (e.key === 'ArrowLeft') {
        handleStep(-1, true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStep]);

  // Global pointerup for swipe/drag initiated on the hero stage
  useEffect(() => {
    const onPointerUp = (e: PointerEvent) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start || document.querySelector('[role="dialog"]')) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        handleStep(dx < 0 ? 1 : -1, true);
      }
    };
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [handleStep]);

  const scrollToSection = useCallback((sectionId: string) => {
    lastInteractionRef.current = Date.now();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleUpdateGame = useCallback(
    (id: string, updater: (prev: TrackerGame) => TrackerGame) => {
      lastInteractionRef.current = Date.now();
      setGames((prev) => prev.map((g) => (g.id === id ? updater(g) : g)));
    },
    []
  );

  const displayIndex = transitionSlides ? transitionSlides.to : currentIndex;
  const activeSlide = HERO_GAMES[displayIndex];
  const activeGameRecord = games.find((g) => g.id === activeSlide.id) ?? games[0];
  const activeGamePct = activeGameRecord ? getGameProgress(activeGameRecord) : 0;
  const activeDoneSteps = activeGameRecord
    ? activeGameRecord.steps.filter((s) => s.done).length
    : 0;
  const activeTotalSteps = activeGameRecord ? activeGameRecord.steps.length : 0;
  const isMobile = metrics.isMobile;

  return (
    <div className="min-h-screen w-full bg-[#0b0c0f] text-[#f2efe9]">
      <main>
        {/* 100vh FNaF Game Completion Showcase Hero */}
        <section
          id="hero-stage"
          aria-label="FNaF Oyun Tamamlama Vitrini"
          className="relative h-screen min-h-[600px] w-full overflow-hidden select-none"
          data-testid="stage"
          data-active-game={activeSlide.id}
          onPointerDown={(e) => {
            if (document.querySelector('[role="dialog"]')) return;
            swipeStartRef.current = { x: e.clientX, y: e.clientY };
          }}
        >
          {/* Stacked full-viewport slides inside the hero */}
          {HERO_GAMES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            let isVisible = isActive;
            let zIndex = isActive ? 2 : 0;
            if (transitionSlides) {
              if (idx === transitionSlides.from) {
                isVisible = true;
                zIndex = 2;
              } else if (idx === transitionSlides.to) {
                isVisible = true;
                zIndex = 1;
              } else {
                isVisible = false;
                zIndex = 0;
              }
            }

            return (
              <AnimatronicSlideView
                key={slide.id}
                slide={slide}
                isActive={isActive}
                isVisible={isVisible}
                zIndex={zIndex}
                metrics={metrics}
                wordGeo={wordGeometries[idx]}
                sheet={sheets[slide.id]}
                registerRefs={(refs) => {
                  slideRefsMap.current[idx] = refs;
                }}
              />
            );
          })}

          {/* Hero UI Overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 text-white">
            {/* Top Navigation Header */}
            <header
              className="absolute flex items-center"
              style={
                isMobile
                  ? {
                      left: '20px',
                      right: '20px',
                      top: '16px',
                      height: '40px',
                    }
                  : {
                      left: 'calc(50 * var(--n))',
                      right: 'calc(50 * var(--n))',
                      top: 'calc(26 * var(--n))',
                      height: 'calc(50 * var(--n))',
                    }
              }
            >
              {/* Brand Logo */}
              <a
                href="#hero-stage"
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(0, resolveTabDirection(currentIndexRef.current, 0), true);
                  scrollToSection('hero-stage');
                }}
                className="pointer-events-auto ui-shadow ui-reveal whitespace-nowrap shrink-0 text-white no-underline focus-visible:outline-2 focus-visible:outline-white"
                style={{
                  fontFamily: "'Baloo 2', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: isMobile ? '30px' : 'calc(42 * var(--n))',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  opacity: uiRevealed ? 1 : 0,
                  translate: uiRevealed ? '0 0' : '0 14px',
                  transitionDelay: uiRevealed ? '250ms' : '0ms',
                }}
              >
                FazTracker
              </a>

              {/* FNaF Canon Game Tabs (13 Canon Titles, centered flex rail on desktop, scrollable on narrow/mobile) */}
              <div
                className={
                  isMobile
                    ? 'pointer-events-none absolute inset-x-0 top-[46px]'
                    : 'pointer-events-none flex-1 min-w-0 mx-6 flex justify-center'
                }
              >
                <nav
                  ref={navScrollRef}
                  aria-label="FNaF oyun seçimi"
                  className="pointer-events-auto ui-reveal no-scrollbar max-w-full overflow-x-auto"
                  style={
                    isMobile
                      ? {
                          fontSize: '14px',
                          fontWeight: 500,
                          opacity: uiRevealed ? 1 : 0,
                          translate: uiRevealed ? '0 0' : '0 14px',
                          transitionDelay: uiRevealed ? '330ms' : '0ms',
                        }
                      : {
                          fontSize: 'calc(16.5 * var(--n))',
                          fontWeight: 500,
                          opacity: uiRevealed ? 1 : 0,
                          translate: uiRevealed ? '0 0' : '0 14px',
                          transitionDelay: uiRevealed ? '330ms' : '0ms',
                        }
                  }
                >
                  <div
                    className="relative inline-flex items-center px-1"
                    style={{
                      gap: isMobile ? '18px' : 'calc(20 * var(--n))',
                      paddingBottom: isMobile ? '4px' : 'calc(4 * var(--n))',
                    }}
                  >
                    {HERO_GAMES.map((slide, idx) => {
                      const isSelected = idx === displayIndex;
                      return (
                        <button
                          key={slide.id}
                          ref={(el) => {
                            tabRefs.current[idx] = el;
                          }}
                          type="button"
                          aria-current={isSelected ? 'true' : undefined}
                          onClick={() => {
                            const dir = resolveTabDirection(currentIndexRef.current, idx);
                            goToSlide(idx, dir, true);
                          }}
                          className={`ui-shadow cursor-pointer whitespace-nowrap shrink-0 border-0 bg-transparent text-white transition-opacity focus-visible:outline-2 focus-visible:outline-white ${
                            isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{
                            font: 'inherit',
                            padding: isMobile ? '5px 0' : 'calc(5 * var(--n)) 0',
                          }}
                        >
                          {slide.tabLabel}
                        </button>
                      );
                    })}

                    {/* Gliding active tab underline */}
                    <span
                      aria-hidden="true"
                      className={`${underline.animate ? 'nav-underline-glide ' : ''}pointer-events-none absolute left-0 bg-white`}
                      style={{
                        bottom: isMobile ? '1px' : 'calc(1 * var(--n))',
                        height: '2px',
                        borderRadius: '2px',
                        width: `${underline.width}px`,
                        transform: `translateX(${underline.left}px)`,
                      }}
                    />
                  </div>
                </nav>
              </div>

              {/* Tracker Section Links: Kayıt | Arşiv */}
              <div
                className="pointer-events-auto ui-reveal ml-auto flex shrink-0 items-center"
                style={{
                  gap: isMobile ? '10px' : 'calc(18 * var(--n))',
                  fontSize: isMobile ? '15px' : 'calc(18.5 * var(--n))',
                  fontWeight: 500,
                  opacity: uiRevealed ? 1 : 0,
                  translate: uiRevealed ? '0 0' : '0 14px',
                  transitionDelay: uiRevealed ? '410ms' : '0ms',
                }}
              >
                <a
                  href="#progress"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('progress');
                  }}
                  className="ui-shadow cursor-pointer whitespace-nowrap shrink-0 text-white no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
                >
                  Kayıt
                </a>
                <span className="ui-shadow opacity-90 select-none" aria-hidden="true">
                  |
                </span>
                <a
                  href="#archive"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('archive');
                  }}
                  className="ui-shadow cursor-pointer whitespace-nowrap shrink-0 text-white no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white"
                >
                  Arşiv
                </a>
              </div>
            </header>

            {/* Active Game Full Title & Live Completion Readout Strip */}
            <div
              className="pointer-events-auto ui-reveal absolute left-1/2 w-[calc(100%-32px)] max-w-[440px] border border-white/15 bg-black/45 px-4 py-2.5 text-center backdrop-blur-xs rounded-[2px]"
              style={{
                bottom: isMobile ? '72px' : 'calc(84 * var(--n))',
                transform: 'translateX(-50%)',
                opacity: uiRevealed ? 1 : 0,
                translate: uiRevealed ? '0 0' : '0 14px',
                transitionDelay: uiRevealed ? '460ms' : '0ms',
              }}
            >
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold tracking-tight text-white sm:text-sm">
                    {activeSlide.fullTitle}
                  </p>
                  <p className="font-mono-tech truncate text-[10px] uppercase tracking-wider text-white/75">
                    {activeSlide.subtitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="font-mono-tech text-xs font-bold tabular-nums sm:text-sm"
                    style={{ color: activeGamePct === 100 ? '#3ba56b' : '#e59a3c' }}
                  >
                    %{activeGamePct}
                  </p>
                  <p className="font-mono-tech text-[10px] tabular-nums text-white/75">
                    {activeDoneSteps}/{activeTotalSteps} Gece · {String(displayIndex + 1).padStart(2, '0')}/{HERO_GAMES.length}
                  </p>
                </div>
              </div>
              <div className="mt-2 h-1 w-full bg-white/15">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${activeGamePct}%`,
                    backgroundColor: activeGamePct === 100 ? '#3ba56b' : '#e59a3c',
                  }}
                />
              </div>
            </div>

            {/* Bottom Left: Previous Game Arrow */}
            <button
              type="button"
              aria-label="Önceki FNaF oyunu"
              onClick={() => handleStep(-1, true)}
              className="pointer-events-auto ui-shadow ui-reveal absolute flex cursor-pointer items-center justify-center border-0 bg-transparent text-white focus-visible:outline-2 focus-visible:outline-white"
              style={{
                left: isMobile ? '8px' : 'calc(36 * var(--n))',
                bottom: isMobile ? '12px' : 'calc(30 * var(--n))',
                width: isMobile ? '48px' : 'calc(52 * var(--n))',
                height: isMobile ? '48px' : 'calc(52 * var(--n))',
                opacity: uiRevealed ? 1 : 0,
                translate: uiRevealed ? '0 0' : '0 14px',
                transitionDelay: uiRevealed ? '490ms' : '0ms',
              }}
            >
              <svg
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  width: isMobile ? '24px' : 'calc(28 * var(--n))',
                  height: isMobile ? '24px' : 'calc(28 * var(--n))',
                }}
              >
                <path d="M24 14H4 M12 6l-8 8 8 8" />
              </svg>
            </button>

            {/* Bottom Center: KAYDI GÜNCELLE */}
            <a
              href="#progress"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('progress');
              }}
              className="pointer-events-auto ui-shadow ui-reveal absolute left-1/2 whitespace-nowrap text-white no-underline transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-white"
              style={{
                bottom: isMobile ? '20px' : 'calc(32 * var(--n))',
                fontWeight: 600,
                fontSize: isMobile ? '14px' : 'calc(19 * var(--n))',
                letterSpacing: '0.2em',
                padding: isMobile ? '8px 14px' : 'calc(10 * var(--n)) calc(16 * var(--n))',
                transform: 'translateX(-50%)',
                opacity: uiRevealed ? 1 : 0,
                translate: uiRevealed ? '0 0' : '0 14px',
                transitionDelay: uiRevealed ? '570ms' : '0ms',
              }}
            >
              KAYDI GÜNCELLE
            </a>

            {/* Bottom Right: Next Game Arrow */}
            <button
              type="button"
              aria-label="Sonraki FNaF oyunu"
              onClick={() => handleStep(1, true)}
              className="pointer-events-auto ui-shadow ui-reveal absolute flex cursor-pointer items-center justify-center border-0 bg-transparent text-white focus-visible:outline-2 focus-visible:outline-white"
              style={{
                right: isMobile ? '8px' : 'calc(36 * var(--n))',
                bottom: isMobile ? '12px' : 'calc(30 * var(--n))',
                width: isMobile ? '48px' : 'calc(52 * var(--n))',
                height: isMobile ? '48px' : 'calc(52 * var(--n))',
                opacity: uiRevealed ? 1 : 0,
                translate: uiRevealed ? '0 0' : '0 14px',
                transitionDelay: uiRevealed ? '650ms' : '0ms',
              }}
            >
              <svg
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  width: isMobile ? '24px' : 'calc(28 * var(--n))',
                  height: isMobile ? '24px' : 'calc(28 * var(--n))',
                }}
              >
                <path d="M4 14h20 M16 6l8 8-8 8" />
              </svg>
            </button>
          </div>
        </section>

        {/* Below-the-fold Completion Overview & Active Game Checklist */}
        <CompletionOverviewSection
          activeSlide={activeSlide}
          games={games}
          onSelectHeroGame={(idx) => {
            const dir = resolveTabDirection(currentIndexRef.current, idx);
            goToSlide(idx, dir, true);
          }}
          onUpdateGame={handleUpdateGame}
          onOpenDetail={(gameId) => setDetailGameId(gameId)}
        />

        {/* Complete 26-Game FNaF & Fan-Game Archive */}
        <FaztrackerArchiveSection
          games={games}
          setGames={setGames}
          detailGameId={detailGameId}
          setDetailGameId={setDetailGameId}
        />

        {/* Chronological FNaF Universe Timeline */}
        <LoreTimelineSection />
      </main>

      {/* Quiet Tracker Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c0f] py-6">
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-4 text-xs text-[#9ca0ab] sm:px-6">
          <div className="space-y-1">
            <p className="font-mono-tech font-semibold uppercase tracking-wider text-[#f2efe9]">
              FAZTRACKER · FNAF OYUNLARI TAMAMLAMA KAYDI &amp; ARŞİVİ
            </p>
            <p>
              Tüm gece ilerleme kayıtları ve özel kapak görselleri tarayıcında (localStorage)
              yerel olarak saklanır.
            </p>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('hero-stage')}
            className="font-mono-tech cursor-pointer whitespace-nowrap border border-white/15 bg-[#13151a] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#f2efe9] rounded-[2px] transition-colors hover:border-[#e59a3c]/50 hover:text-[#e59a3c]"
          >
            Yukarı Dön ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
