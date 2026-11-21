import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Star, SlidersHorizontal } from 'lucide-react';
import { HERO_GAMES, type HeroGameSlide } from '../data/heroGames';
import {
  LORE_TIMELINE,
  type GameStatus,
  type TrackerGame,
} from '../data/faztrackerGames';
import {
  computeCategoryBreakdown,
  getGameProgress,
  toggleGameStep,
} from '../utils/faztrackerLogic';
import { GamePosterSvg } from './GamePosterSvg';

interface CompletionOverviewSectionProps {
  activeSlide: HeroGameSlide;
  games: TrackerGame[];
  onSelectHeroGame: (index: number) => void;
  onUpdateGame: (id: string, updater: (prev: TrackerGame) => TrackerGame) => void;
  onOpenDetail: (gameId: string) => void;
}

export const CompletionOverviewSection: React.FC<CompletionOverviewSectionProps> = ({
  activeSlide,
  games,
  onSelectHeroGame,
  onUpdateGame,
  onOpenDetail,
}) => {
  const breakdown = React.useMemo(() => computeCategoryBreakdown(games), [games]);
  const activeGame =
    games.find((g) => g.id === activeSlide.id) ?? games[0];

  const activePct = activeGame ? getGameProgress(activeGame) : 0;
  const doneSteps = activeGame ? activeGame.steps.filter((s) => s.done).length : 0;
  const totalSteps = activeGame ? activeGame.steps.length : 0;

  return (
    <section
      id="progress"
      aria-labelledby="progress-heading"
      className="border-t border-white/10 bg-[#0b0c0f] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1380px] space-y-8 px-4 sm:px-6">
        {/* Top Row: Overall FNaF Completion Dashboard */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono-tech text-xs font-semibold uppercase tracking-widest text-[#e59a3c]">
                Kişisel Tamamlama Kaydı
              </p>
              <h2
                id="progress-heading"
                className="mt-1 text-2xl font-extrabold tracking-tight text-[#f2efe9] sm:text-3xl"
              >
                FNaF Serisi İlerleme Özeti
              </h2>
            </div>

            <p className="font-mono-tech text-xs tabular-nums text-[#9ca0ab]">
              {breakdown.doneSteps} / {breakdown.totalSteps} Gece ve Görev Tamamlandı
            </p>
          </div>

          {/* 4-column Architectural Completion Breakdown */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2.5 border border-white/10 bg-[#13151a] p-4 rounded-[2px]">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                  Genel Tamamlama
                </span>
                <span className="font-mono-tech text-sm font-bold tabular-nums text-[#e59a3c]">
                  %{breakdown.overallCompletionPct}
                </span>
              </div>
              <div className="h-1.5 w-full border border-white/10 bg-[#0b0c0f]">
                <div
                  className="h-full bg-[#e59a3c] transition-all duration-300"
                  style={{ width: `${breakdown.overallCompletionPct}%` }}
                />
              </div>
              <p className="font-mono-tech text-xs tabular-nums text-[#f2efe9]">
                {breakdown.completedGames} / {breakdown.totalGames} Oyun %100 Bitirildi
              </p>
            </div>

            <div className="space-y-2.5 border border-white/10 bg-[#13151a] p-4 rounded-[2px]">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                  Orijinal FNaF Oyunları
                </span>
                <span className="font-mono-tech text-sm font-bold tabular-nums text-[#3ba56b]">
                  %{breakdown.officialAvgPct}
                </span>
              </div>
              <div className="h-1.5 w-full border border-white/10 bg-[#0b0c0f]">
                <div
                  className="h-full bg-[#3ba56b] transition-all duration-300"
                  style={{ width: `${breakdown.officialAvgPct}%` }}
                />
              </div>
              <p className="font-mono-tech text-xs tabular-nums text-[#f2efe9]">
                {breakdown.officialCompleted} / {breakdown.officialTotal} Ana Oyun Tamamlandı
              </p>
            </div>

            <div className="space-y-2.5 border border-white/10 bg-[#13151a] p-4 rounded-[2px]">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                  Fan Yapımı Oyunlar
                </span>
                <span className="font-mono-tech text-sm font-bold tabular-nums text-[#66c0f4]">
                  %{breakdown.fanAvgPct}
                </span>
              </div>
              <div className="h-1.5 w-full border border-white/10 bg-[#0b0c0f]">
                <div
                  className="h-full bg-[#66c0f4] transition-all duration-300"
                  style={{ width: `${breakdown.fanAvgPct}%` }}
                />
              </div>
              <p className="font-mono-tech text-xs tabular-nums text-[#f2efe9]">
                {breakdown.fanCompleted} / {breakdown.fanTotal} Fan Oyunu Tamamlandı
              </p>
            </div>

            <div className="flex flex-col justify-between border border-white/10 bg-[#13151a] p-4 rounded-[2px]">
              <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                Vardiya İstatistikleri
              </span>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-mono-tech text-xl font-bold tabular-nums text-[#f2efe9]">
                  {breakdown.totalHours.toFixed(1)} sa
                </span>
                <span className="font-mono-tech text-xs font-semibold tabular-nums text-[#c93b3b]">
                  {breakdown.totalJumpscares} Jumpscare
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#9ca0ab]">
                Tüm oyunlardaki toplam süre &amp; kayıt
              </p>
            </div>
          </div>
        </div>

        {/* Active Hero Game Spotlight & Direct Night Checklist */}
        {activeGame && (
          <div className="space-y-4 border border-white/10 bg-[#13151a] p-5 rounded-[2px]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tech border border-white/15 bg-[#0b0c0f] px-2 py-0.5 text-[11px] font-bold text-[#e59a3c]">
                    {activeGame.catalogCode}
                  </span>
                  <span className="font-mono-tech text-xs text-[#9ca0ab]">
                    {activeGame.year} · {activeGame.developer}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-[#f2efe9] sm:text-2xl">
                  {activeGame.title}
                </h3>
              </div>

              <div
                role="group"
                aria-label="Vitrin oyunu seçimi"
                className="flex flex-wrap items-center gap-1 self-start border border-white/10 bg-[#0b0c0f] p-1 rounded-[2px] lg:max-w-[660px] lg:justify-end"
              >
                {HERO_GAMES.map((item, idx) => {
                  const selected = item.id === activeSlide.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectHeroGame(idx)}
                      className={`cursor-pointer whitespace-nowrap shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-[1px] transition-colors ${
                        selected
                          ? 'bg-[#e59a3c] text-[#0b0c0f]'
                          : 'text-[#9ca0ab] hover:text-[#f2efe9]'
                      }`}
                    >
                      {item.tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left 3 cols: Poster + Quick Status/Hours/Rating */}
              <div className="space-y-3 lg:col-span-3">
                <div className="mx-auto aspect-[2/3] w-40 overflow-hidden border border-white/15 bg-[#0b0c0f] lg:w-full lg:max-w-[200px]">
                  <GamePosterSvg game={activeGame} />
                </div>

                <div className="space-y-2.5 border border-white/10 bg-[#0b0c0f] p-3">
                  <div>
                    <label
                      htmlFor="spotlight-status"
                      className="font-mono-tech mb-1 block text-[10px] uppercase tracking-wider text-[#9ca0ab]"
                    >
                      Oyun Durumu
                    </label>
                    <select
                      id="spotlight-status"
                      value={activeGame.status}
                      onChange={(e) => {
                        const next = e.target.value as GameStatus;
                        onUpdateGame(activeGame.id, (g) => ({
                          ...g,
                          status: next,
                          manualProgress: next === 'completed' ? null : g.manualProgress,
                          steps:
                            next === 'completed'
                              ? g.steps.map((s) => ({ ...s, done: true }))
                              : g.steps,
                          completedDate:
                            next === 'completed' && !g.completedDate
                              ? new Date().toISOString().slice(0, 10)
                              : g.completedDate,
                        }));
                      }}
                      className="w-full cursor-pointer border border-white/15 bg-[#13151a] px-2.5 py-1.5 text-xs font-semibold text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                    >
                      <option value="planned">Sırada (Oynanacak)</option>
                      <option value="playing">Oynanıyor</option>
                      <option value="completed">Bitirildi (%100)</option>
                      <option value="dropped">Bırakıldı</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="spotlight-hours"
                        className="font-mono-tech mb-1 block text-[10px] uppercase text-[#9ca0ab]"
                      >
                        Süre (Saat)
                      </label>
                      <input
                        id="spotlight-hours"
                        type="number"
                        min={0}
                        step={0.5}
                        value={activeGame.hours}
                        onChange={(e) => {
                          const next = Math.max(0, parseFloat(e.target.value) || 0);
                          onUpdateGame(activeGame.id, (g) => ({ ...g, hours: next }));
                        }}
                        className="font-mono-tech w-full border border-white/10 bg-[#13151a] px-2 py-1 text-xs font-bold tabular-nums text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="font-mono-tech mb-1 block text-[10px] uppercase text-[#9ca0ab]">
                        Jumpscare
                      </span>
                      <div className="flex h-[26px] items-center border border-white/10 bg-[#13151a]">
                        <button
                          type="button"
                          aria-label="Jumpscare azalt"
                          onClick={() =>
                            onUpdateGame(activeGame.id, (g) => ({
                              ...g,
                              jumpscares: Math.max(0, g.jumpscares - 1),
                            }))
                          }
                          className="h-full w-7 cursor-pointer text-xs font-bold text-[#9ca0ab] hover:text-[#f2efe9]"
                        >
                          -
                        </button>
                        <span className="font-mono-tech flex-1 text-center text-xs font-bold tabular-nums text-[#c93b3b]">
                          {activeGame.jumpscares}
                        </span>
                        <button
                          type="button"
                          aria-label="Jumpscare artır"
                          onClick={() =>
                            onUpdateGame(activeGame.id, (g) => ({
                              ...g,
                              jumpscares: g.jumpscares + 1,
                            }))
                          }
                          className="h-full w-7 cursor-pointer text-xs font-bold text-[#c93b3b] hover:bg-[#c93b3b]/20"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 9 cols: Direct Night Checklist + Threat Preview */}
              <div className="flex flex-col justify-between space-y-5 lg:col-span-9">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#e59a3c]" />
                      <h4 className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#f2efe9]">
                        Gece &amp; Özel Mod Kontrol Listesi
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tech text-xs tabular-nums text-[#9ca0ab]">
                        {doneSteps} / {totalSteps} Tamamlandı
                      </span>
                      <span
                        className={`font-mono-tech text-sm font-bold tabular-nums ${
                          activePct === 100 ? 'text-[#3ba56b]' : 'text-[#e59a3c]'
                        }`}
                      >
                        %{activePct}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full border border-white/10 bg-[#0b0c0f]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activePct === 100 ? 'bg-[#3ba56b]' : 'bg-[#e59a3c]'
                      }`}
                      style={{ width: `${activePct}%` }}
                    />
                  </div>

                  <p className="text-xs leading-relaxed text-[#9ca0ab] sm:text-sm">
                    {activeGame.objective}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                    {activeGame.steps.map((step) => (
                      <label
                        key={step.id}
                        className={`flex cursor-pointer items-center gap-2.5 border px-3 py-2.5 transition-colors ${
                          step.done
                            ? 'border-[#3ba56b]/45 bg-[#3ba56b]/12 text-[#f2efe9]'
                            : 'border-white/10 bg-[#0b0c0f] text-[#9ca0ab] hover:border-white/25'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={step.done}
                          onChange={() =>
                            onUpdateGame(activeGame.id, (g) => toggleGameStep(g, step.id))
                          }
                          className="h-4 w-4 shrink-0 accent-[#e59a3c]"
                        />
                        <span
                          className={`truncate text-xs font-semibold ${
                            step.done ? 'text-[#9ca0ab] line-through' : 'text-[#f2efe9]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions & Quick Rating */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                      Puanın:
                    </span>
                    <div className="flex items-center border border-white/10 bg-[#0b0c0f] px-1.5 py-1">
                      {Array.from({ length: 10 }, (_, idx) => idx + 1).map((val) => (
                        <button
                          key={val}
                          type="button"
                          aria-label={`${activeGame.title} için ${val} puan`}
                          onClick={() =>
                            onUpdateGame(activeGame.id, (g) => ({
                              ...g,
                              rating: g.rating === val ? 0 : val,
                            }))
                          }
                          className={`cursor-pointer p-0.5 ${
                            val <= activeGame.rating
                              ? 'text-[#e59a3c]'
                              : 'text-white/20 hover:text-[#9ca0ab]'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono-tech hidden items-center gap-1.5 text-[11px] text-[#9ca0ab] sm:inline-flex">
                      <ShieldAlert className="h-3.5 w-3.5 text-[#c93b3b]" />
                      <span>{activeGame.threats.length} Tehdit Rehberi</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(activeGame.id)}
                      className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border border-white/15 bg-[#0b0c0f] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#f2efe9] rounded-[2px] transition-colors hover:border-[#e59a3c] hover:text-[#e59a3c]"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Detay, Notlar &amp; Tehdit Rehberini Aç</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const LoreTimelineSection: React.FC = () => {
  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="border-t border-white/10 bg-[#0e1015] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1380px] space-y-6 px-4 sm:px-6">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono-tech text-xs font-semibold uppercase tracking-widest text-[#e59a3c]">
              Kronolojik Kayıt
            </p>
            <h2
              id="timeline-heading"
              className="mt-1 text-2xl font-extrabold tracking-tight text-[#f2efe9] sm:text-3xl"
            >
              Fazbear Evreni Zaman Çizelgesi
            </h2>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-[#9ca0ab]">
            <Clock className="h-3.5 w-3.5 text-[#e59a3c]" />
            <span>1973 atölyelerinden Mega Pizzaplex çöküşüne kadar</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {LORE_TIMELINE.map((node, idx) => (
            <article
              key={node.era}
              className="flex flex-col justify-between space-y-3 border border-white/10 bg-[#13151a] p-4 rounded-[2px]"
            >
              <div className="space-y-2">
                <div className="font-mono-tech flex items-center justify-between text-[11px] text-[#e59a3c]">
                  <span className="font-bold">{node.era}</span>
                  <span className="text-[#9ca0ab]">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-sm font-bold leading-snug text-[#f2efe9]">{node.title}</h3>
                <p className="text-xs leading-relaxed text-[#9ca0ab]">{node.summary}</p>
              </div>
              <div className="font-mono-tech border-t border-white/10 pt-2 text-[11px] text-[#9ca0ab]">
                {node.refGame}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
