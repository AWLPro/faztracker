import React from 'react';
import type { HeroGameSlide } from '../data/heroGames';
import type { ProcessedSpriteSheet } from '../utils/spriteSheet';
import {
  computeCropLayout,
  SHADOW_SPECS,
  type LayerName,
  type ViewportMetrics,
  type WordGeometry,
} from '../utils/sliderMath';

export interface SlideLayerRefs {
  section: HTMLElement | null;
  layers: Record<LayerName, HTMLDivElement | null>;
}

interface AnimatronicSlideViewProps {
  slide: HeroGameSlide;
  isActive: boolean;
  isVisible: boolean;
  zIndex: number;
  metrics: ViewportMetrics;
  wordGeo: WordGeometry;
  sheet: ProcessedSpriteSheet | undefined;
  registerRefs: (refs: SlideLayerRefs) => void;
}

export const AnimatronicSlideView: React.FC<AnimatronicSlideViewProps> = ({
  slide,
  isActive,
  isVisible,
  zIndex,
  metrics,
  wordGeo,
  sheet,
  registerRefs,
}) => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const layerRefs = React.useRef<Record<LayerName, HTMLDivElement | null>>({
    word: null,
    shadow: null,
    bottle: null,
    fruit: null,
    corner: null,
  });

  React.useEffect(() => {
    registerRefs({
      section: sectionRef.current,
      layers: layerRefs.current,
    });
  }, [registerRefs]);

  const sheetUrl = sheet?.url ?? slide.sheetUrl;
  const sheetW = sheet?.width ?? 1024;
  const sheetH = sheet?.height ?? 1024;
  const boxes = sheet?.boxes ?? slide.defaultBoxes;
  const { u, frameWidth, frameHeight, frameLeft, frameTop } = metrics;

  const centerpieceLayout = computeCropLayout(
    boxes[0],
    slide.centerpiece.w,
    sheetW,
    sheetH,
    u
  );

  const sharpProps = slide.props.filter((p) => p.layer === 'fruit');
  const cornerProps = slide.props.filter((p) => p.layer === 'corner');

  return (
    <section
      ref={sectionRef}
      data-testid={`slide-${slide.id}`}
      data-active={isActive ? 'true' : 'false'}
      aria-hidden={!isVisible}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: slide.backdrop,
        visibility: isVisible ? 'visible' : 'hidden',
        zIndex,
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${frameLeft}px`,
          top: `${frameTop}px`,
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
        }}
      >
        {/* Layer 1: Giant FNaF game title word */}
        <div
          ref={(el) => {
            layerRefs.current.word = el;
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            data-testid={`word-${slide.id}`}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-white select-none"
            style={{
              fontFamily: "'Poppins', system-ui, sans-serif",
              fontWeight: 700,
              lineHeight: 1,
              fontSize: `${wordGeo.fontSize * u}px`,
              letterSpacing: wordGeo.letterSpacing,
              top: `${wordGeo.top * u}px`,
            }}
          >
            {slide.word}
          </div>
        </div>

        {/* Layer 2: Soft floor shadows */}
        <div
          ref={(el) => {
            layerRefs.current.shadow = el;
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {SHADOW_SPECS.map((sh) => (
            <div
              key={sh.id}
              style={{
                position: 'absolute',
                left: `${(sh.cx - sh.w / 2) * u}px`,
                top: `${(sh.cy - sh.h / 2) * u}px`,
                width: `${sh.w * u}px`,
                height: `${sh.h * u}px`,
                borderRadius: '50%',
                background: 'radial-gradient(closest-side, rgba(0, 0, 0, 0.44), transparent)',
                filter: `blur(${4 * u}px)`,
              }}
            />
          ))}
        </div>

        {/* Layer 3: Centered animatronic centerpiece (never bobs) */}
        <div
          ref={(el) => {
            layerRefs.current.bottle = el;
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            role="img"
            aria-label={`${slide.fullTitle} visual centerpiece`}
            style={{
              position: 'absolute',
              left: `${slide.centerpiece.x * u}px`,
              top: `${slide.centerpiece.y * u}px`,
              width: `${centerpieceLayout.width}px`,
              height: `${centerpieceLayout.height}px`,
              backgroundImage: `url("${sheetUrl}")`,
              backgroundSize: centerpieceLayout.backgroundSize,
              backgroundPosition: centerpieceLayout.backgroundPosition,
              backgroundRepeat: 'no-repeat',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 88%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, #000 88%, transparent 100%)',
            }}
          />
        </div>

        {/* Layer 4: Five sharp mid-size floating horror props */}
        <div
          ref={(el) => {
            layerRefs.current.fruit = el;
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {sharpProps.map((prop) => {
            const crop = computeCropLayout(boxes[prop.item], prop.w, sheetW, sheetH, u);
            return (
              <div
                key={prop.id}
                style={{
                  position: 'absolute',
                  left: `${prop.x * u}px`,
                  top: `${prop.y * u}px`,
                  width: `${crop.width}px`,
                  height: `${crop.height}px`,
                  transform: prop.mirror ? 'scaleX(-1)' : undefined,
                }}
              >
                <div
                  className="prop-bob-inner w-full h-full"
                  style={
                    {
                      backgroundImage: `url("${sheetUrl}")`,
                      backgroundSize: crop.backgroundSize,
                      backgroundPosition: crop.backgroundPosition,
                      backgroundRepeat: 'no-repeat',
                      '--base-rot': `${prop.rotation}deg`,
                      animationDuration: `${prop.bobDuration}s`,
                      animationDelay: `${prop.bobDelay}s`,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Layer 5: Two large blurred foreground corner props */}
        <div
          ref={(el) => {
            layerRefs.current.corner = el;
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {cornerProps.map((prop) => {
            const crop = computeCropLayout(boxes[prop.item], prop.w, sheetW, sheetH, u);
            return (
              <div
                key={prop.id}
                style={{
                  position: 'absolute',
                  left: `${prop.x * u}px`,
                  top: `${prop.y * u}px`,
                  width: `${crop.width}px`,
                  height: `${crop.height}px`,
                  transform: prop.mirror ? 'scaleX(-1)' : undefined,
                  filter: `blur(${9 * u}px)`,
                }}
              >
                <div
                  className="prop-bob-inner w-full h-full"
                  style={
                    {
                      backgroundImage: `url("${sheetUrl}")`,
                      backgroundSize: crop.backgroundSize,
                      backgroundPosition: crop.backgroundPosition,
                      backgroundRepeat: 'no-repeat',
                      '--base-rot': `${prop.rotation}deg`,
                      animationDuration: `${prop.bobDuration}s`,
                      animationDelay: `${prop.bobDelay}s`,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
