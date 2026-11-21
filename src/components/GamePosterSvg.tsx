import React from 'react';
import type { TrackerGame } from '../data/faztrackerGames';

interface GamePosterSvgProps {
  game: TrackerGame;
}

function renderEmblem(emblem: string, accent: string): React.ReactNode {
  switch (emblem) {
    case 'mask':
      return (
        <>
          <rect x="34" y="34" width="52" height="54" />
          <circle cx="48" cy="54" r="5" fill={accent} />
          <circle cx="72" cy="54" r="5" fill={accent} />
          <circle cx="42" cy="70" r="4" fill="#c93b3b" />
          <circle cx="78" cy="70" r="4" fill="#c93b3b" />
        </>
      );
    case 'spring':
      return (
        <>
          <polygon points="44,44 38,20 50,22 52,44" />
          <polygon points="76,44 82,20 70,22 68,44" />
          <rect x="36" y="44" width="48" height="46" />
          <line x1="44" y1="76" x2="76" y2="76" />
        </>
      );
    case 'fangs':
      return (
        <>
          <polygon points="60,28 32,86 88,86" />
          <polyline points="44,74 52,66 60,74 68,66 76,74" />
        </>
      );
    case 'orbit':
      return (
        <>
          <circle cx="60" cy="60" r="24" />
          <ellipse cx="60" cy="60" rx="38" ry="11" transform="rotate(-20 60 60)" />
        </>
      );
    case 'circus':
      return (
        <>
          <circle cx="60" cy="60" r="26" />
          <line x1="60" y1="34" x2="60" y2="86" />
          <line x1="34" y1="60" x2="86" y2="60" />
        </>
      );
    case 'triangle':
      return (
        <>
          <polygon points="60,30 32,84 88,84" />
          <rect x="52" y="56" width="16" height="16" fill={accent} />
        </>
      );
    case 'grid50':
      return (
        <>
          <rect x="32" y="36" width="56" height="48" />
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fill={accent}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            fontSize="14"
            stroke="none"
          >
            50/20
          </text>
        </>
      );
    case 'visor':
      return (
        <>
          <rect x="30" y="46" width="60" height="28" />
          <circle cx="46" cy="60" r="6" />
          <circle cx="74" cy="60" r="6" />
        </>
      );
    case 'star':
      return (
        <polygon points="60,28 68,48 90,50 73,64 78,86 60,74 42,86 47,64 30,50 52,48" />
      );
    case 'shard':
      return (
        <>
          <polygon points="34,34 86,34 74,86 46,86" />
          <line x1="56" y1="34" x2="66" y2="60" />
          <line x1="66" y1="60" x2="54" y2="86" />
        </>
      );
    case 'dual':
      return (
        <>
          <circle cx="48" cy="60" r="16" />
          <circle cx="72" cy="60" r="16" />
        </>
      );
    case 'pit':
      return (
        <>
          <ellipse cx="60" cy="68" rx="32" ry="14" />
          <circle cx="48" cy="60" r="5" fill={accent} />
          <circle cx="62" cy="56" r="6" />
          <circle cx="74" cy="61" r="4" />
        </>
      );
    case 'mimic':
      return (
        <>
          <rect x="38" y="34" width="44" height="52" />
          <circle cx="50" cy="52" r="5" />
          <circle cx="70" cy="52" r="5" />
          <rect x="46" y="70" width="28" height="8" />
        </>
      );
    case 'cat':
      return (
        <>
          <polygon points="38,44 42,24 54,40" />
          <polygon points="82,44 78,24 66,40" />
          <rect x="36" y="42" width="48" height="44" />
          <line x1="26" y1="62" x2="40" y2="64" />
          <line x1="80" y1="64" x2="94" y2="62" />
        </>
      );
    case 'phone':
      return (
        <>
          <rect x="42" y="34" width="36" height="52" />
          <circle cx="60" cy="52" r="8" />
          <rect x="52" y="70" width="16" height="6" fill={accent} />
        </>
      );
    case 'beam':
      return (
        <>
          <polygon points="60,28 32,86 88,86" fill={accent} fillOpacity="0.12" />
          <circle cx="60" cy="64" r="12" />
        </>
      );
    case 'window':
      return (
        <>
          <rect x="34" y="32" width="52" height="56" />
          <line x1="60" y1="32" x2="60" y2="88" />
          <line x1="34" y1="60" x2="86" y2="60" />
        </>
      );
    case 'hex':
      return (
        <>
          <polygon points="60,30 86,45 86,75 60,90 34,75 34,45" />
          <circle cx="60" cy="60" r="10" />
        </>
      );
    case 'egg':
      return (
        <>
          <ellipse cx="60" cy="60" rx="22" ry="30" />
          <circle cx="52" cy="54" r="3" fill={accent} />
          <circle cx="68" cy="54" r="3" fill={accent} />
        </>
      );
    case 'eye':
      return (
        <>
          <ellipse cx="60" cy="60" rx="32" ry="18" />
          <circle cx="60" cy="60" r="10" fill={accent} />
        </>
      );
    case 'flame':
      return <polygon points="60,28 42,66 54,66 48,88 78,54 64,54" />;
    case 'badge':
      return (
        <>
          <rect x="34" y="38" width="52" height="44" />
          <line x1="34" y1="52" x2="86" y2="52" />
          <rect x="42" y="60" width="14" height="14" fill={accent} />
        </>
      );
    case 'ghost':
      return (
        <>
          <path d="M40 84 V52 A20 20 0 0 1 80 52 V84 L70 76 L60 84 L50 76 Z" />
          <circle cx="52" cy="54" r="3" fill={accent} />
          <circle cx="68" cy="54" r="3" fill={accent} />
        </>
      );
    case 'closet':
      return (
        <>
          <rect x="36" y="30" width="48" height="60" />
          <line x1="60" y1="30" x2="60" y2="90" />
          <rect x="52" y="56" width="3" height="8" />
          <rect x="65" y="56" width="3" height="8" />
        </>
      );
    case 'clock':
      return (
        <>
          <circle cx="60" cy="60" r="26" />
          <polyline points="60,42 60,60 74,66" />
        </>
      );
    case 'bear':
    default:
      return (
        <>
          <circle cx="38" cy="40" r="9" />
          <circle cx="82" cy="40" r="9" />
          <rect x="34" y="42" width="52" height="44" />
          <rect x="48" y="22" width="24" height="14" />
          <circle cx="48" cy="58" r="3" fill={accent} />
          <circle cx="72" cy="58" r="3" fill={accent} />
          <line x1="46" y1="74" x2="74" y2="74" />
        </>
      );
  }
}

export const GamePosterSvg: React.FC<GamePosterSvgProps> = ({ game }) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [game.customCover]);

  if (game.customCover && !imgFailed) {
    return (
      <div className="relative h-full w-full bg-[#0b0c0f]">
        <img
          src={game.customCover}
          alt={game.title}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="block h-full w-full object-cover"
        />
        <div className="crt-scanlines pointer-events-none absolute inset-0" />
        <span className="font-mono-tech absolute top-1.5 left-1.5 border border-white/15 bg-[#0b0c0f]/90 px-1 py-0.5 text-[9px] font-bold text-[#f2efe9]">
          {game.catalogCode}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-[#0e1015] p-2.5">
      <div className="crt-scanlines pointer-events-none absolute inset-0 z-10" />
      <div className="font-mono-tech relative z-20 flex items-center justify-between border-b border-white/10 pb-1 text-[9px] tracking-wider text-[#9ca0ab]">
        <span style={{ color: game.accent }} className="font-bold">
          {game.catalogCode}
        </span>
        <span>{game.year}</span>
      </div>

      <div className="relative z-20 flex flex-1 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full max-h-[115px] w-full">
          <g
            fill="none"
            stroke={game.accent}
            strokeWidth={2}
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            {renderEmblem(game.emblem, game.accent)}
          </g>
        </svg>
      </div>

      <div className="relative z-20 border-t border-white/10 pt-1.5">
        <div className="line-clamp-2 text-[10px] font-extrabold uppercase leading-tight tracking-tight text-[#f2efe9]">
          {game.title}
        </div>
        <div className="font-mono-tech mt-0.5 truncate text-[8px] uppercase tracking-widest text-[#9ca0ab]">
          {game.category === 'official' ? 'OFFICIAL ARCHIVE' : 'FAN ARCHIVE'}
        </div>
      </div>
    </div>
  );
};
