import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  X,
  AlertTriangle,
  Star,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  DEFAULT_GAMES,
  type GameCategory,
  type GameStatus,
  type TrackerGame,
} from '../data/faztrackerGames';
import {
  computeSummaryStats,
  filterAndSortGames,
  getGameProgress,
  normalizeGameObject,
  parseSteamPastedText,
  type PlatformFilter,
  type SortOption,
  type SteamMatchResult,
} from '../utils/faztrackerLogic';
import { GamePosterSvg } from './GamePosterSvg';

const STATUS_META: Record<GameStatus, { label: string; cls: string }> = {
  planned: {
    label: 'SIRADA',
    cls: 'bg-[#1a1d24] text-[#9ca0ab] border-white/15',
  },
  playing: {
    label: 'OYNANIYOR',
    cls: 'bg-[#e59a3c]/15 text-[#e59a3c] border-[#e59a3c]/40',
  },
  completed: {
    label: 'BİTİRİLDİ',
    cls: 'bg-[#3ba56b]/15 text-[#3ba56b] border-[#3ba56b]/40',
  },
  dropped: {
    label: 'BIRAKILDI',
    cls: 'bg-[#c93b3b]/15 text-[#c93b3b] border-[#c93b3b]/40',
  },
};

interface FaztrackerArchiveSectionProps {
  games: TrackerGame[];
  setGames: React.Dispatch<React.SetStateAction<TrackerGame[]>>;
  detailGameId: string | null;
  setDetailGameId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const FaztrackerArchiveSection: React.FC<FaztrackerArchiveSectionProps> = ({
  games,
  setGames,
  detailGameId,
  setDetailGameId,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'steam'>('library');
  const [category, setCategory] = useState<'all' | GameCategory>('all');
  const [status, setStatus] = useState<'all' | GameStatus>('all');
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const [addOpen, setAddOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Detail modal form helpers
  const [coverUrlDraft, setCoverUrlDraft] = useState('');
  const [newThreatName, setNewThreatName] = useState('');
  const [newThreatCounter, setNewThreatCounter] = useState('');
  const [newStepLabel, setNewStepLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Add game modal state
  const [addTitle, setAddTitle] = useState('');
  const [addCatalog, setAddCatalog] = useState('');
  const [addCategory, setAddCategory] = useState<GameCategory>('fangame');
  const [addYear, setAddYear] = useState('2026');
  const [addAppId, setAddAppId] = useState('');
  const [addDev, setAddDev] = useState('');
  const [addObjective, setAddObjective] = useState('');
  const [addSteps, setAddSteps] = useState('');

  // Backup reset confirm
  const [confirmReset, setConfirmReset] = useState(false);

  // Steam matcher state
  const [steamText, setSteamText] = useState('');
  const [steamMatches, setSteamMatches] = useState<SteamMatchResult[]>([]);

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 2400);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  const stats = useMemo(() => computeSummaryStats(games), [games]);
  const filteredGames = useMemo(
    () =>
      filterAndSortGames(games, {
        category,
        status,
        platform,
        searchQuery,
        sortBy,
      }),
    [games, category, status, platform, searchQuery, sortBy]
  );

  const steamGames = useMemo(() => games.filter((g) => g.steamAppId), [games]);
  const ownedSteamCount = useMemo(
    () => steamGames.filter((g) => g.steamOwned).length,
    [steamGames]
  );

  const detailGame = useMemo(
    () => games.find((g) => g.id === detailGameId) ?? null,
    [games, detailGameId]
  );

  useEffect(() => {
    if (detailGame) {
      setCoverUrlDraft(
        detailGame.customCover && !detailGame.customCover.startsWith('data:')
          ? detailGame.customCover
          : ''
      );
      setConfirmDelete(false);
      setNewThreatName('');
      setNewThreatCounter('');
      setNewStepLabel('');
    }
  }, [detailGame?.id]);

  const updateGame = (id: string, updater: (prev: TrackerGame) => TrackerGame) => {
    setGames((prev) => prev.map((g) => (g.id === id ? updater(g) : g)));
  };

  const handleCoverFileUpload = (file: File) => {
    if (!detailGame) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const targetW = 260;
        const targetH = 390;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const srcRatio = img.width / img.height;
        const dstRatio = targetW / targetH;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (srcRatio > dstRatio) {
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / dstRatio;
          sy = (img.height - sh) / 2;
        }

        ctx.fillStyle = '#0b0c0f';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        updateGame(detailGame.id, (g) => ({ ...g, customCover: compressed }));
        showToast('Özel kapak posteri güncellendi');
      };
      img.src = String(ev.target?.result ?? '');
    };
    reader.readAsDataURL(file);
  };

  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = addTitle.trim();
    if (!title) return;

    const catalogCode =
      addCatalog.trim().toUpperCase() ||
      (addCategory === 'official' ? `FNAF-${games.length + 1}` : `FAN-${games.length + 1}`);
    const stepLabels = addSteps.trim()
      ? addSteps
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['Night 1', 'Night 2', 'Night 3', 'Night 4', 'Night 5', 'Night 6'];

    const newGame: TrackerGame = {
      id: `game-${Date.now()}`,
      catalogCode,
      title,
      category: addCategory,
      year: addYear.trim() || '2026',
      developer: addDev.trim() || 'Bağımsız Yapımcı',
      steamAppId: addAppId.trim() || null,
      steamOwned: false,
      accent: addCategory === 'official' ? '#e59a3c' : '#66c0f4',
      emblem: addCategory === 'official' ? 'bear' : 'cat',
      objective:
        addObjective.trim() ||
        'Bu oyundaki geceleri ve gizli sonları tamamlayarak sabah 6’ya kadar hayatta kalmak.',
      story: 'Fandom arşivine eklenen özel FNaF / fan yapımı oyun kaydı.',
      mechanics:
        addCategory === 'official'
          ? ['Orijinal Seri', 'Hayatta Kalma']
          : ['Fan Yapımı', 'Hayatta Kalma'],
      threats: [],
      status: 'planned',
      manualProgress: null,
      rating: 0,
      hours: 0,
      jumpscares: 0,
      completedDate: '',
      customCover: '',
      notes: '',
      steps: stepLabels.map((lbl, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        label: lbl,
        done: false,
      })),
    };

    setGames((prev) => [newGame, ...prev]);
    setAddTitle('');
    setAddCatalog('');
    setAddAppId('');
    setAddDev('');
    setAddObjective('');
    setAddSteps('');
    setAddOpen(false);
    showToast(`"${title}" arşive eklendi`);
  };

  const handleExportJson = () => {
    const payload = {
      app: 'Fazbear Fandom Archive',
      exportedAt: new Date().toISOString(),
      games,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fazbear-fandom-arsiv-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON yedeği indirildi');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result ?? ''));
        const list = Array.isArray(parsed) ? parsed : parsed.games;
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('Invalid');
        }
        setGames(list.map((item: TrackerGame) => normalizeGameObject(item)));
        setBackupOpen(false);
        showToast('Yedek başarıyla geri yüklendi');
      } catch {
        showToast('Geçersiz JSON yedek dosyası!', true);
      }
    };
    reader.readAsText(file);
  };

  const handleParseSteam = () => {
    const matches = parseSteamPastedText(steamText, games);
    setSteamMatches(matches);
    if (matches.length === 0) {
      showToast('Metinde eşleşen Steam FNaF oyunu bulunamadı.', true);
    }
  };

  const handleApplySteamMatches = () => {
    const selected = steamMatches.filter((m) => m.selected);
    if (selected.length === 0) {
      showToast('Uygulanacak oyun seçilmedi.', true);
      return;
    }
    const patchMap = new Map(selected.map((m) => [m.game.id, m.parsedHours]));
    setGames((prev) =>
      prev.map((g) => {
        if (!patchMap.has(g.id)) return g;
        const hrs = patchMap.get(g.id);
        return {
          ...g,
          steamOwned: true,
          hours: hrs !== null && hrs !== undefined && hrs > 0 ? hrs : g.hours,
        };
      })
    );
    setSteamMatches([]);
    showToast(`${selected.length} Steam oyunu senkronize edildi`);
  };

  return (
    <section
      id="archive"
      aria-labelledby="archive-heading"
      className="border-t border-white/10 bg-[#0b0c0f] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1380px] space-y-5 px-4 sm:px-6">
        {/* Archive Section Header & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono-tech text-xs font-semibold uppercase tracking-widest text-[#e59a3c]">
              FNaF &amp; Fan Oyunu İlerleme Arşivi
            </p>
            <h2
              id="archive-heading"
              className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f2efe9]"
            >
              Oyun Kütüphanesi &amp; Tehdit Rehberleri
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sub-tabs: Kütüphane / Steam Eşleştirme */}
            <div className="inline-flex border border-white/10 bg-[#13151a] p-0.5 rounded-[2px]">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`cursor-pointer whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[1px] transition-colors ${
                  activeTab === 'library'
                    ? 'bg-[#e59a3c] text-[#0b0c0f]'
                    : 'text-[#9ca0ab] hover:text-[#f2efe9]'
                }`}
              >
                Kütüphane
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('steam')}
                className={`cursor-pointer whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[1px] transition-colors ${
                  activeTab === 'steam'
                    ? 'bg-[#66c0f4] text-[#0b0c0f]'
                    : 'text-[#9ca0ab] hover:text-[#66c0f4]'
                }`}
              >
                Steam Eşleştirme
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmReset(false);
                setBackupOpen(true);
              }}
              className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border border-white/10 bg-[#13151a] px-3 py-1.5 text-xs font-medium text-[#f2efe9] rounded-[2px] hover:bg-[#1a1d24]"
            >
              <Download className="h-3.5 w-3.5 text-[#9ca0ab]" />
              <span>Yedekle / İçe Aktar</span>
            </button>

            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap bg-[#e59a3c] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b0c0f] rounded-[2px] hover:bg-[#f0a84b]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Oyun Ekle</span>
            </button>
          </div>
        </div>

        {/* Summary Stats Strip */}
        <div className="grid grid-cols-2 gap-3 border border-white/10 bg-[#13151a] px-4 py-3 rounded-[2px] sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center justify-between border-white/10 pr-2 lg:justify-start lg:gap-3 lg:border-r">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">Toplam Oyun</span>
            <span className="font-mono-tech tabular-nums text-sm font-bold text-[#f2efe9]">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center justify-between border-white/10 pr-2 lg:justify-start lg:gap-3 lg:border-r">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">
              Bitirilen (%100)
            </span>
            <span className="font-mono-tech tabular-nums text-sm font-bold text-[#3ba56b]">
              {stats.completedCount}
            </span>
          </div>
          <div className="flex items-center justify-between border-white/10 pr-2 lg:justify-start lg:gap-3 lg:border-r">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">Oynanıyor</span>
            <span className="font-mono-tech tabular-nums text-sm font-bold text-[#e59a3c]">
              {stats.playingCount}
            </span>
          </div>
          <div className="flex items-center justify-between border-white/10 pr-2 lg:justify-start lg:gap-3 lg:border-r">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">
              Genel İlerleme
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono-tech tabular-nums text-sm font-bold text-[#f2efe9]">
                %{stats.avgProgress}
              </span>
              <div className="hidden h-1.5 w-14 border border-white/10 bg-[#0b0c0f] sm:block">
                <div
                  className="h-full bg-[#e59a3c] transition-all duration-300"
                  style={{ width: `${stats.avgProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-white/10 pr-2 lg:justify-start lg:gap-3 lg:border-r">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">Toplam Süre</span>
            <span className="font-mono-tech tabular-nums text-sm font-bold text-[#f2efe9]">
              {stats.totalHours.toFixed(1)} sa
            </span>
          </div>
          <div className="flex items-center justify-between lg:justify-start lg:gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#9ca0ab]">
              Ortalama Puan
            </span>
            <span className="font-mono-tech tabular-nums text-sm font-bold text-[#e59a3c]">
              {stats.avgRating} / 10
            </span>
          </div>
        </div>

        {/* LIBRARY VIEW */}
        {activeTab === 'library' && (
          <div className="space-y-5">
            {/* Filter & Search Bar */}
            <div className="space-y-3.5 border border-white/10 bg-[#13151a] p-4 rounded-[2px]">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="inline-flex max-w-full self-start overflow-x-auto border border-white/10 bg-[#0b0c0f] p-0.5 rounded-[2px]">
                  {(
                    [
                      ['all', 'Tümü', stats.total],
                      ['official', 'Orijinal Oyunlar', stats.officialCount],
                      ['fangame', 'Fan Oyunları', stats.fanCount],
                    ] as const
                  ).map(([val, label, count]) => {
                    const active = category === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCategory(val)}
                        className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[1px] border ${
                          active
                            ? 'border-white/15 bg-[#1a1d24] text-[#f2efe9]'
                            : 'border-transparent text-[#9ca0ab] hover:text-[#f2efe9]'
                        }`}
                      >
                        {label}{' '}
                        <span className="font-mono-tech ml-1 text-[11px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-1 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center lg:max-w-xl">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9ca0ab]" />
                    <input
                      type="text"
                      aria-label="Oyun, yapımcı veya animatronik ara"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Oyun adı, yapımcı, katalog kodu veya animatronik ara..."
                      className="w-full border border-white/10 bg-[#0b0c0f] py-1.5 pr-3 pl-9 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/60 rounded-[2px] focus:border-[#e59a3c] focus:outline-none sm:text-sm"
                    />
                  </div>

                  <select
                    aria-label="Sıralama ölçütü"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="cursor-pointer border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9] rounded-[2px] focus:border-[#e59a3c] focus:outline-none sm:text-sm"
                  >
                    <option value="default">Sıralama: Arşiv Sırası</option>
                    <option value="year-desc">Çıkış Yılı (Yeni → Eski)</option>
                    <option value="year-asc">Çıkış Yılı (Eski → Yeni)</option>
                    <option value="progress-desc">İlerleme % (Yüksek → Düşük)</option>
                    <option value="rating-desc">Puan (Yüksek → Düşük)</option>
                    <option value="hours-desc">Oynama Süresi (Çok → Az)</option>
                    <option value="name-asc">İsim (A → Z)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-2.5 md:flex-row md:items-center">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="font-mono-tech mr-1 shrink-0 text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                    Durum:
                  </span>
                  {(
                    [
                      ['all', 'Tümü'],
                      ['playing', 'Oynanıyor'],
                      ['completed', 'Bitirildi'],
                      ['planned', 'Sırada'],
                      ['dropped', 'Bırakıldı'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStatus(val)}
                      className={`shrink-0 cursor-pointer whitespace-nowrap px-2.5 py-1 text-xs rounded-[1px] ${
                        status === val
                          ? 'bg-[#f2efe9] font-semibold text-[#0b0c0f]'
                          : 'border border-white/10 bg-[#0b0c0f] font-medium text-[#9ca0ab] hover:text-[#f2efe9]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="font-mono-tech mr-1 shrink-0 text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                    Platform:
                  </span>
                  {(
                    [
                      ['all', 'Tümü'],
                      ['steam', "Steam'de Var"],
                      ['owned', 'Steam Kütüphanemde'],
                      ['gamejolt', 'GameJolt / Ücretsiz'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPlatform(val)}
                      className={`shrink-0 cursor-pointer whitespace-nowrap px-2.5 py-1 text-xs rounded-[1px] ${
                        platform === val
                          ? 'bg-[#f2efe9] font-semibold text-[#0b0c0f]'
                          : 'border border-white/10 bg-[#0b0c0f] font-medium text-[#9ca0ab] hover:text-[#f2efe9]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            {filteredGames.length === 0 ? (
              <div className="space-y-3 border border-white/10 bg-[#13151a] p-10 text-center rounded-[2px]">
                <p className="text-sm font-bold uppercase tracking-wider text-[#f2efe9]">
                  Arşivde Eşleşen Kayıt Bulunamadı
                </p>
                <p className="mx-auto max-w-md text-xs text-[#9ca0ab]">
                  Seçili durum, platform veya arama filtrelerini sıfırlayabilir ya da sağ üstten
                  yeni bir oyun ekleyebilirsin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory('all');
                    setStatus('all');
                    setPlatform('all');
                    setSearchQuery('');
                    setSortBy('default');
                  }}
                  className="cursor-pointer bg-[#e59a3c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0b0c0f] rounded-[2px]"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredGames.map((game) => {
                  const pct = getGameProgress(game);
                  const totalSteps = game.steps.length;
                  const doneSteps = game.steps.filter((s) => s.done).length;
                  const st = STATUS_META[game.status];

                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setDetailGameId(game.id)}
                      className="group flex cursor-pointer overflow-hidden border border-white/10 bg-[#13151a] text-left rounded-[2px] transition-colors hover:border-[#e59a3c]/45 hover:bg-[#161920]"
                    >
                      <div className="w-28 shrink-0 self-stretch border-r border-white/10 bg-[#0b0c0f] sm:w-32">
                        <GamePosterSvg game={game} />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 p-3.5">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[#9ca0ab]">
                              {game.category === 'official' ? 'Orijinal' : 'Fan Oyunu'} ·{' '}
                              {game.steamAppId
                                ? `Steam ${game.steamAppId}${game.steamOwned ? ' ✓' : ''}`
                                : 'GameJolt'}
                            </span>
                            <span
                              className={`font-mono-tech border px-1.5 py-0.5 text-[10px] font-semibold ${st.cls}`}
                            >
                              {st.label}
                            </span>
                          </div>

                          <div>
                            <h3 className="truncate text-sm font-bold text-[#f2efe9] transition-colors group-hover:text-[#e59a3c] sm:text-base">
                              {game.title}
                            </h3>
                            <p className="font-mono-tech truncate text-[11px] text-[#9ca0ab]">
                              {game.year} · {game.developer} · {game.threats.length} Tehdit
                            </p>
                          </div>

                          <p className="line-clamp-2 text-xs leading-relaxed text-[#9ca0ab]">
                            {game.objective}
                          </p>
                        </div>

                        <div className="space-y-2 border-t border-white/10 pt-2">
                          <div className="space-y-1">
                            <div className="font-mono-tech flex items-center justify-between text-[11px]">
                              <span className="text-[#9ca0ab]">
                                {doneSteps}/{totalSteps} Gece / Adım
                              </span>
                              <span
                                className={`font-bold tabular-nums ${
                                  pct === 100 ? 'text-[#3ba56b]' : 'text-[#f2efe9]'
                                }`}
                              >
                                %{pct}
                              </span>
                            </div>
                            <div className="h-1.5 w-full border border-white/10 bg-[#0b0c0f]">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  pct === 100 ? 'bg-[#3ba56b]' : 'bg-[#e59a3c]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <div className="font-mono-tech flex items-center gap-3 text-[11px] tabular-nums text-[#9ca0ab]">
                            <span>{Number(game.hours || 0).toFixed(1)} sa</span>
                            <span className="text-[#c93b3b]">{game.jumpscares || 0} JS</span>
                            <span className="text-[#e59a3c]">
                              {game.rating > 0 ? `${game.rating}/10` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEAM MATCHER VIEW */}
        {activeTab === 'steam' && (
          <div className="space-y-5">
            <div className="space-y-4 border border-white/10 bg-[#13151a] p-5 rounded-[2px]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <h3 className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#f2efe9]">
                  Steam Oyun Listesini Yapıştır &amp; Eşleştir
                </h3>
                <a
                  href="https://steamcommunity.com/my/games?tab=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-tech inline-flex items-center gap-1 text-[11px] text-[#66c0f4] hover:underline"
                >
                  <span>Steam oyun listemi aç</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <p className="text-xs leading-relaxed text-[#9ca0ab]">
                Steam Profilin → Oyunlar sayfasındaki metni veya AppID numaralarını yapıştır;
                oynama süreleri (<span className="font-mono-tech text-[#f2efe9]">hrs on record</span>
                ) otomatik ayrıştırılır.
              </p>

              <textarea
                rows={4}
                aria-label="Steam oyun listesi yapıştırma alanı"
                value={steamText}
                onChange={(e) => setSteamText(e.target.value)}
                placeholder={`Örnek yapıştırma:\nFive Nights at Freddy's 12.4 hrs on record\nFive Nights at Freddy's: Security Breach 34.2 hrs on record\n332800, 871720`}
                className="font-mono-tech w-full resize-none border border-white/10 bg-[#0b0c0f] p-3 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/50 rounded-[2px] focus:border-[#e59a3c] focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSteamText(
                      "Five Nights at Freddy's 14.5 hrs on record\n" +
                        "Five Nights at Freddy's 2 22.0 hrs on record\n" +
                        'Ultimate Custom Night 48.5 hrs on record\n' +
                        "Five Nights at Freddy's: Security Breach 31.2 hrs on record\n" +
                        'POPGOES Arcade 9.5 hrs on record'
                    )
                  }
                  className="font-mono-tech cursor-pointer text-[11px] text-[#9ca0ab] underline underline-offset-4 hover:text-[#f2efe9]"
                >
                  Örnek Steam metni doldur
                </button>
                <button
                  type="button"
                  onClick={handleParseSteam}
                  className="cursor-pointer bg-[#e59a3c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0b0c0f] rounded-[2px] hover:bg-[#f0a84b]"
                >
                  Metni Çözümle &amp; Eşleştir
                </button>
              </div>
            </div>

            {steamMatches.length > 0 && (
              <div className="space-y-4 border border-[#66c0f4]/40 bg-[#1a1d24] p-5 rounded-[2px]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#f2efe9]">
                      Bulunan Steam Eşleşmeleri ({steamMatches.length})
                    </h3>
                    <p className="text-xs text-[#9ca0ab]">
                      Seçili oyunlar kütüphanende işaretlenecek ve oynama süreleri aktarılacak.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSteamMatches([])}
                      className="cursor-pointer border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#9ca0ab] rounded-[2px]"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handleApplySteamMatches}
                      className="cursor-pointer bg-[#3ba56b] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b0c0f] rounded-[2px] hover:bg-[#46b879]"
                    >
                      Seçilenleri Kütüphaneye Uygula
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  {steamMatches.map((m, idx) => (
                    <label
                      key={m.game.id}
                      className="flex cursor-pointer items-center justify-between gap-3 border border-white/15 bg-[#0b0c0f] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={m.selected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSteamMatches((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, selected: checked } : item
                              )
                            );
                          }}
                          className="h-4 w-4 shrink-0 accent-[#66c0f4]"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-[#f2efe9]">
                            {m.game.title}
                          </div>
                          <div className="font-mono-tech text-[11px] text-[#66c0f4]">
                            AppID: {m.game.steamAppId}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-tech shrink-0 text-xs tabular-nums">
                        {m.parsedHours !== null ? (
                          <span className="font-bold text-[#e59a3c]">
                            {m.parsedHours.toFixed(1)} sa
                          </span>
                        ) : (
                          <span className="text-[#9ca0ab]">Süre yok</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-hidden border border-white/10 bg-[#13151a] rounded-[2px]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div>
                  <h3 className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#f2efe9]">
                    Steam Veritabanı &amp; AppID Eşleştirme Tablosu
                  </h3>
                  <p className="text-[11px] text-[#9ca0ab]">
                    Resmi Steam mağaza sayfaları, başarım bağlantıları ve sahiplik durumu
                  </p>
                </div>
                <span className="font-mono-tech border border-[#66c0f4]/30 bg-[#66c0f4]/10 px-2.5 py-1 text-xs tabular-nums text-[#66c0f4]">
                  {ownedSteamCount} / {steamGames.length} Steam Oyunu Sahip Olunan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="font-mono-tech border-b border-white/10 bg-[#0b0c0f] text-[11px] uppercase tracking-wider text-[#9ca0ab]">
                      <th className="px-4 py-2.5">Katalog</th>
                      <th className="px-4 py-2.5">Oyun Adı</th>
                      <th className="px-4 py-2.5">Steam AppID</th>
                      <th className="px-4 py-2.5">Sahiplik</th>
                      <th className="px-4 py-2.5">Kayıtlı Süre</th>
                      <th className="px-4 py-2.5 text-right">Mağaza &amp; Başarımlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs">
                    {steamGames.map((g) => (
                      <tr key={g.id} className="hover:bg-white/[0.02]">
                        <td className="font-mono-tech px-4 py-2.5 text-[11px] text-[#e59a3c]">
                          {g.catalogCode}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-[#f2efe9]">
                          <button
                            type="button"
                            onClick={() => setDetailGameId(g.id)}
                            className="cursor-pointer text-left hover:text-[#e59a3c]"
                          >
                            {g.title}
                          </button>
                        </td>
                        <td className="font-mono-tech px-4 py-2.5 text-[#66c0f4]">
                          {g.steamAppId}
                        </td>
                        <td className="px-4 py-2.5">
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={g.steamOwned}
                              onChange={(e) =>
                                updateGame(g.id, (prev) => ({
                                  ...prev,
                                  steamOwned: e.target.checked,
                                }))
                              }
                              className="h-3.5 w-3.5 accent-[#66c0f4]"
                            />
                            <span
                              className={`font-mono-tech text-[11px] ${
                                g.steamOwned ? 'font-bold text-[#66c0f4]' : 'text-[#9ca0ab]'
                              }`}
                            >
                              {g.steamOwned ? 'KÜTÜPHANEDE' : 'YOK'}
                            </span>
                          </label>
                        </td>
                        <td className="font-mono-tech px-4 py-2.5 tabular-nums text-[#f2efe9]">
                          {Number(g.hours || 0).toFixed(1)} sa
                        </td>
                        <td className="font-mono-tech space-x-2 px-4 py-2.5 text-right">
                          <a
                            href={`https://store.steampowered.com/app/${g.steamAppId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-[#66c0f4]/30 bg-[#0b0c0f] px-2 py-1 text-[11px] text-[#66c0f4] hover:bg-[#66c0f4] hover:text-[#0b0c0f]"
                          >
                            Mağaza
                          </a>
                          <a
                            href={`https://steamcommunity.com/stats/${g.steamAppId}/achievements`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-white/15 bg-[#0b0c0f] px-2 py-1 text-[11px] text-[#9ca0ab] hover:bg-[#f2efe9] hover:text-[#0b0c0f]"
                          >
                            Başarımlar
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GAME DETAIL MODAL */}
      {detailGame && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={detailGame.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailGameId(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-xs sm:p-5"
        >
          <div className="my-auto w-full max-w-5xl overflow-hidden border border-white/15 bg-[#1a1d24] rounded-[2px] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#13151a] px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="font-mono-tech shrink-0 border border-white/15 bg-[#0b0c0f] px-2 py-0.5 text-xs font-bold text-[#e59a3c]">
                  {detailGame.catalogCode}
                </span>
                <h3 className="truncate text-base font-extrabold text-[#f2efe9] sm:text-lg">
                  {detailGame.title}
                </h3>
                <span className="font-mono-tech shrink-0 text-xs text-[#9ca0ab]">
                  ({detailGame.year} · {detailGame.developer})
                </span>
              </div>
              <button
                type="button"
                aria-label="Detay penceresini kapat"
                onClick={() => setDetailGameId(null)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-white/15 bg-[#0b0c0f] text-[#f2efe9] hover:bg-[#c93b3b]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid max-h-[82vh] grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-12">
              {/* Left 4 cols */}
              <div className="space-y-4 lg:col-span-4">
                <div className="space-y-3 border border-white/10 bg-[#13151a] p-3">
                  <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden border border-white/15 bg-[#0b0c0f] sm:w-48">
                    <GamePosterSvg game={detailGame} />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <label className="flex-1 cursor-pointer border border-white/15 bg-[#0b0c0f] px-2.5 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#f2efe9] hover:bg-[#e59a3c] hover:text-[#0b0c0f]">
                        Dosyadan Kapak Yükle
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleCoverFileUpload(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          updateGame(detailGame.id, (g) => ({ ...g, customCover: '' }));
                          showToast('Varsayılan arşiv posterine dönüldü');
                        }}
                        className="font-mono-tech cursor-pointer border border-white/15 bg-[#0b0c0f] px-2.5 py-1.5 text-[11px] text-[#9ca0ab] hover:bg-[#c93b3b]/20 hover:text-[#c93b3b]"
                      >
                        Sıfırla
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={coverUrlDraft}
                        onChange={(e) => setCoverUrlDraft(e.target.value)}
                        placeholder="Veya kapak görseli URL yapıştır..."
                        className="flex-1 border border-white/10 bg-[#0b0c0f] px-2.5 py-1 text-[11px] text-[#f2efe9] placeholder-[#9ca0ab]/60 focus:border-[#e59a3c] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateGame(detailGame.id, (g) => ({
                            ...g,
                            customCover: coverUrlDraft.trim(),
                          }));
                          showToast(
                            coverUrlDraft.trim()
                              ? 'Kapak görseli URL kaydedildi'
                              : 'Kapak görseli temizlendi'
                          );
                        }}
                        className="cursor-pointer border border-white/15 bg-[#13151a] px-2.5 py-1 text-[11px] font-semibold text-[#f2efe9] hover:bg-[#e59a3c] hover:text-[#0b0c0f]"
                      >
                        Uygula
                      </button>
                    </div>
                  </div>
                </div>

                {/* Steam Panel */}
                <div className="space-y-2.5 border border-white/10 bg-[#13151a] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#66c0f4]">
                      Steam Entegrasyonu
                    </span>
                    <span className="font-mono-tech text-[11px] text-[#9ca0ab]">
                      {detailGame.steamAppId
                        ? `AppID: ${detailGame.steamAppId}`
                        : 'GameJolt / Bağımsız'}
                    </span>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 border border-white/10 bg-[#0b0c0f] p-2">
                    <input
                      type="checkbox"
                      checked={detailGame.steamOwned}
                      onChange={(e) =>
                        updateGame(detailGame.id, (g) => ({
                          ...g,
                          steamOwned: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#66c0f4]"
                    />
                    <span className="text-xs font-medium text-[#f2efe9]">
                      Steam Kütüphanemde Var
                    </span>
                  </label>

                  {detailGame.steamAppId && (
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <a
                        href={`https://store.steampowered.com/app/${detailGame.steamAppId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-tech border border-[#66c0f4]/30 bg-[#0b0c0f] px-2 py-1.5 text-center text-[11px] text-[#66c0f4] hover:bg-[#66c0f4] hover:text-[#0b0c0f]"
                      >
                        Steam Mağaza →
                      </a>
                      <a
                        href={`https://steamcommunity.com/stats/${detailGame.steamAppId}/achievements`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-tech border border-[#66c0f4]/30 bg-[#0b0c0f] px-2 py-1.5 text-center text-[11px] text-[#66c0f4] hover:bg-[#66c0f4] hover:text-[#0b0c0f]"
                      >
                        Başarımlar →
                      </a>
                    </div>
                  )}
                </div>

                {/* Status, Rating, Hours, Jumpscares */}
                <div className="space-y-3 border border-white/10 bg-[#13151a] p-3.5">
                  <div>
                    <label
                      htmlFor="detail-status"
                      className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                    >
                      Oyun Durumu
                    </label>
                    <select
                      id="detail-status"
                      value={detailGame.status}
                      onChange={(e) => {
                        const next = e.target.value as GameStatus;
                        updateGame(detailGame.id, (g) => ({
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
                      className="w-full border border-white/15 bg-[#0b0c0f] px-3 py-1.5 text-xs font-semibold text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                    >
                      <option value="planned">Sırada (Oynanacak)</option>
                      <option value="playing">Oynanıyor</option>
                      <option value="completed">Bitirildi (%100)</option>
                      <option value="dropped">Bırakıldı</option>
                    </select>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono-tech text-[11px] uppercase text-[#9ca0ab]">
                        Puanın
                      </span>
                      <span className="font-mono-tech text-xs font-bold text-[#e59a3c]">
                        {detailGame.rating > 0 ? `${detailGame.rating} / 10` : 'Puanlanmadı'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border border-white/10 bg-[#0b0c0f] px-2 py-1.5">
                      {Array.from({ length: 10 }, (_, idx) => idx + 1).map((val) => (
                        <button
                          key={val}
                          type="button"
                          aria-label={`${val} Puan`}
                          onClick={() =>
                            updateGame(detailGame.id, (g) => ({
                              ...g,
                              rating: g.rating === val ? 0 : val,
                            }))
                          }
                          className={`cursor-pointer p-0.5 ${
                            val <= detailGame.rating
                              ? 'text-[#e59a3c]'
                              : 'text-white/20 hover:text-[#9ca0ab]'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="detail-hours"
                        className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                      >
                        Süre (Saat)
                      </label>
                      <input
                        id="detail-hours"
                        type="number"
                        min={0}
                        step={0.5}
                        value={detailGame.hours}
                        onChange={(e) => {
                          const next = Math.max(0, parseFloat(e.target.value) || 0);
                          updateGame(detailGame.id, (g) => ({ ...g, hours: next }));
                        }}
                        className="font-mono-tech w-full border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs font-bold tabular-nums text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]">
                        Jumpscare
                      </span>
                      <div className="flex h-[30px] items-center border border-white/10 bg-[#0b0c0f]">
                        <button
                          type="button"
                          aria-label="Jumpscare azalt"
                          onClick={() =>
                            updateGame(detailGame.id, (g) => ({
                              ...g,
                              jumpscares: Math.max(0, g.jumpscares - 1),
                            }))
                          }
                          className="h-full w-8 cursor-pointer text-xs font-bold text-[#9ca0ab] hover:bg-white/5 hover:text-[#f2efe9]"
                        >
                          -
                        </button>
                        <span className="font-mono-tech flex-1 text-center text-xs font-bold tabular-nums text-[#c93b3b]">
                          {detailGame.jumpscares}
                        </span>
                        <button
                          type="button"
                          aria-label="Jumpscare artır"
                          onClick={() =>
                            updateGame(detailGame.id, (g) => ({
                              ...g,
                              jumpscares: g.jumpscares + 1,
                            }))
                          }
                          className="h-full w-8 cursor-pointer text-xs font-bold text-[#c93b3b] hover:bg-[#c93b3b]/20"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="detail-date"
                      className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                    >
                      Bitirme Tarihi
                    </label>
                    <input
                      id="detail-date"
                      type="date"
                      value={detailGame.completedDate}
                      onChange={(e) =>
                        updateGame(detailGame.id, (g) => ({
                          ...g,
                          completedDate: e.target.value,
                        }))
                      }
                      className="font-mono-tech w-full border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right 8 cols */}
              <div className="space-y-4 lg:col-span-8">
                <div className="space-y-3 border border-white/10 bg-[#13151a] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#e59a3c]">
                      Genel Amaç &amp; Oyun Özeti
                    </span>
                    <span className="font-mono-tech text-[11px] text-[#9ca0ab]">
                      {detailGame.mechanics.join(' · ')}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-[#f2efe9] sm:text-sm">
                    {detailGame.objective}
                  </p>
                  <p className="border-t border-white/10 pt-2.5 text-xs leading-relaxed text-[#9ca0ab]">
                    {detailGame.story}
                  </p>
                </div>

                {/* Threat Guide */}
                <div className="space-y-3 border border-[#c93b3b]/35 bg-[#13151a] p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#c93b3b]" />
                      <h4 className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#f2efe9]">
                        Animatronik &amp; Mekanik Tehdit Rehberi
                      </h4>
                    </div>
                    <span className="font-mono-tech text-[11px] text-[#9ca0ab]">
                      {detailGame.threats.length} Tehdit
                    </span>
                  </div>

                  {detailGame.threats.length === 0 ? (
                    <p className="border border-white/10 bg-[#0b0c0f] p-2.5 text-xs text-[#9ca0ab]">
                      Bu oyun için henüz tehdit kaydı eklenmemiş. Aşağıdan ekleyebilirsin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detailGame.threats.map((t, idx) => (
                        <div
                          key={`${t.name}-${idx}`}
                          className="flex items-start justify-between gap-3 border border-white/10 bg-[#0b0c0f] p-2.5"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="text-xs font-bold uppercase tracking-wide text-[#c93b3b]">
                              {t.name}
                            </div>
                            <p className="text-xs leading-relaxed text-[#f2efe9]/90">{t.counter}</p>
                          </div>
                          <button
                            type="button"
                            aria-label={`${t.name} tehdidini sil`}
                            onClick={() =>
                              updateGame(detailGame.id, (g) => ({
                                ...g,
                                threats: g.threats.filter((_, i) => i !== idx),
                              }))
                            }
                            className="font-mono-tech shrink-0 cursor-pointer px-1.5 py-0.5 text-xs text-[#9ca0ab] hover:text-[#c93b3b]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-2 sm:grid-cols-12">
                    <input
                      type="text"
                      value={newThreatName}
                      onChange={(e) => setNewThreatName(e.target.value)}
                      placeholder="Animatronik / Tehdit adı..."
                      className="border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/60 focus:border-[#c93b3b] focus:outline-none sm:col-span-4"
                    />
                    <input
                      type="text"
                      value={newThreatCounter}
                      onChange={(e) => setNewThreatCounter(e.target.value)}
                      placeholder="Nasıl durdurulur / hayatta kalma taktiği..."
                      className="border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/60 focus:border-[#c93b3b] focus:outline-none sm:col-span-6"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const n = newThreatName.trim();
                        const c = newThreatCounter.trim();
                        if (!n || !c) {
                          showToast('Tehdit adı ve taktik bilgisi girin.', true);
                          return;
                        }
                        updateGame(detailGame.id, (g) => ({
                          ...g,
                          threats: [...g.threats, { name: n, counter: c }],
                        }));
                        setNewThreatName('');
                        setNewThreatCounter('');
                        showToast('Yeni tehdit notu eklendi');
                      }}
                      className="cursor-pointer border border-white/15 bg-[#0b0c0f] px-3 py-1.5 text-xs font-bold uppercase text-[#f2efe9] hover:bg-[#c93b3b] sm:col-span-2"
                    >
                      + Ekle
                    </button>
                  </div>
                </div>

                {/* Steps Checklist */}
                <div className="space-y-3 border border-white/10 bg-[#13151a] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#f2efe9]">
                        Gece, Bölüm &amp; Özel Son Kontrol Listesi
                      </h4>
                      <span className="font-mono-tech text-xs text-[#3ba56b]">
                        {detailGame.steps.filter((s) => s.done).length}/{detailGame.steps.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeof detailGame.manualProgress === 'number' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateGame(detailGame.id, (g) => ({ ...g, manualProgress: null }))
                          }
                          className="font-mono-tech cursor-pointer text-[11px] text-[#e59a3c] hover:underline"
                        >
                          Adımlara Eşitle
                        </button>
                      )}
                      <span className="font-mono-tech text-sm font-bold tabular-nums text-[#e59a3c]">
                        %{getGameProgress(detailGame)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border border-white/10 bg-[#0b0c0f] px-3 py-2">
                    <span className="font-mono-tech shrink-0 text-[11px] text-[#9ca0ab]">
                      İlerleme:
                    </span>
                    <input
                      type="range"
                      aria-label="Manuel ilerleme yüzdesi"
                      min={0}
                      max={100}
                      value={getGameProgress(detailGame)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateGame(detailGame.id, (g) => ({
                          ...g,
                          manualProgress: val,
                          status:
                            val === 100
                              ? 'completed'
                              : val > 0 && g.status === 'planned'
                                ? 'playing'
                                : g.status,
                        }));
                      }}
                      className="flex-1 accent-[#e59a3c]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {detailGame.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between gap-2 border px-2.5 py-2 ${
                          step.done
                            ? 'border-[#3ba56b]/40 bg-[#3ba56b]/10 text-[#f2efe9]'
                            : 'border-white/10 bg-[#0b0c0f] text-[#9ca0ab]'
                        }`}
                      >
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={step.done}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              updateGame(detailGame.id, (g) => {
                                const steps = g.steps.map((s) =>
                                  s.id === step.id ? { ...s, done: checked } : s
                                );
                                const allDone = steps.length > 0 && steps.every((s) => s.done);
                                let nextStatus = g.status;
                                if (checked) {
                                  if (allDone) nextStatus = 'completed';
                                  else if (nextStatus === 'planned') nextStatus = 'playing';
                                }
                                return {
                                  ...g,
                                  steps,
                                  manualProgress: null,
                                  status: nextStatus,
                                  completedDate:
                                    allDone && !g.completedDate
                                      ? new Date().toISOString().slice(0, 10)
                                      : g.completedDate,
                                };
                              });
                            }}
                            className="h-3.5 w-3.5 shrink-0 accent-[#e59a3c]"
                          />
                          <span
                            className={`truncate text-xs font-medium ${
                              step.done ? 'text-[#9ca0ab] line-through' : 'text-[#f2efe9]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </label>
                        <button
                          type="button"
                          aria-label={`${step.label} adımını sil`}
                          onClick={() =>
                            updateGame(detailGame.id, (g) => ({
                              ...g,
                              steps: g.steps.filter((s) => s.id !== step.id),
                              manualProgress: null,
                            }))
                          }
                          className="font-mono-tech shrink-0 cursor-pointer px-1 text-xs text-[#9ca0ab] hover:text-[#c93b3b]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newStepLabel}
                      onChange={(e) => setNewStepLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const lbl = newStepLabel.trim();
                          if (!lbl) return;
                          updateGame(detailGame.id, (g) => ({
                            ...g,
                            steps: [...g.steps, { id: `s-${Date.now()}`, label: lbl, done: false }],
                            manualProgress: null,
                          }));
                          setNewStepLabel('');
                        }
                      }}
                      placeholder="Yeni gece, meydan okuma veya son ekle (örn. 50/20 Mode)..."
                      className="flex-1 border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/60 focus:border-[#e59a3c] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const lbl = newStepLabel.trim();
                        if (!lbl) return;
                        updateGame(detailGame.id, (g) => ({
                          ...g,
                          steps: [...g.steps, { id: `s-${Date.now()}`, label: lbl, done: false }],
                          manualProgress: null,
                        }));
                        setNewStepLabel('');
                      }}
                      className="shrink-0 cursor-pointer border border-white/15 bg-[#0b0c0f] px-3.5 py-1.5 text-xs font-bold uppercase text-[#f2efe9] hover:bg-[#e59a3c] hover:text-[#0b0c0f]"
                    >
                      + Adım Ekle
                    </button>
                  </div>
                </div>

                {/* Notes & Delete */}
                <div className="space-y-3 border border-white/10 bg-[#13151a] p-4">
                  <label
                    htmlFor="detail-notes"
                    className="font-mono-tech block text-xs font-bold uppercase tracking-wider text-[#9ca0ab]"
                  >
                    Kişisel Notlar &amp; Taktik Kayıtları
                  </label>
                  <textarea
                    id="detail-notes"
                    rows={2}
                    value={detailGame.notes}
                    onChange={(e) =>
                      updateGame(detailGame.id, (g) => ({ ...g, notes: e.target.value }))
                    }
                    placeholder="Oyunla ilgili notların, kalan gizli sonlar veya zorluk yorumların..."
                    className="w-full resize-none border border-white/10 bg-[#0b0c0f] p-2.5 text-xs text-[#f2efe9] placeholder-[#9ca0ab]/60 focus:border-[#e59a3c] focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
                    {!confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="font-mono-tech cursor-pointer border border-transparent px-3 py-1.5 text-xs text-[#c93b3b] hover:border-[#c93b3b]/40 hover:bg-[#c93b3b]/15"
                      >
                        Oyunu Arşivden Sil
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#c93b3b]">Kalıcı olarak silinsin mi?</span>
                        <button
                          type="button"
                          onClick={() => {
                            const title = detailGame.title;
                            setGames((prev) => prev.filter((g) => g.id !== detailGame.id));
                            setDetailGameId(null);
                            showToast(`${title} arşivden silindi`);
                          }}
                          className="cursor-pointer bg-[#c93b3b] px-3 py-1 text-xs font-bold text-white"
                        >
                          Evet, Sil
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="cursor-pointer border border-white/10 bg-[#0b0c0f] px-2.5 py-1 text-xs text-[#9ca0ab]"
                        >
                          Vazgeç
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDetailGameId(null);
                        showToast('Değişiklikler kaydedildi');
                      }}
                      className="ml-auto cursor-pointer bg-[#e59a3c] px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b0c0f] hover:bg-[#f0a84b]"
                    >
                      Kaydet ve Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD GAME MODAL */}
      {addOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Yeni Oyun Ekle"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-xs"
        >
          <div className="my-auto w-full max-w-lg space-y-4 border border-white/15 bg-[#1a1d24] p-5 rounded-[2px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#f2efe9]">
                  Yeni Oyun Ekle
                </h3>
                <p className="text-xs text-[#9ca0ab]">
                  Orijinal veya fan yapımı yeni bir FNaF oyununu arşive ekle
                </p>
              </div>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setAddOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center border border-white/10 bg-[#0b0c0f] text-[#9ca0ab] hover:text-[#f2efe9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddGameSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="add-title-input"
                    className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                  >
                    Oyun Adı *
                  </label>
                  <input
                    id="add-title-input"
                    type="text"
                    required
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="Örn: Post-Shift 2"
                    className="w-full border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-code-input"
                    className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                  >
                    Katalog Kodu
                  </label>
                  <input
                    id="add-code-input"
                    type="text"
                    value={addCatalog}
                    onChange={(e) => setAddCatalog(e.target.value)}
                    placeholder="FAN-13"
                    className="font-mono-tech w-full border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs uppercase text-[#f2efe9] focus:border-[#e59a3c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="add-cat-select"
                    className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                  >
                    Kategori
                  </label>
                  <select
                    id="add-cat-select"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value as GameCategory)}
                    className="w-full border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9]"
                  >
                    <option value="fangame">Fan Oyunu</option>
                    <option value="official">Orijinal Oyun</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="add-year-input"
                    className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                  >
                    Çıkış Yılı
                  </label>
                  <input
                    id="add-year-input"
                    type="text"
                    value={addYear}
                    onChange={(e) => setAddYear(e.target.value)}
                    className="font-mono-tech w-full border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-appid-input"
                    className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                  >
                    Steam AppID
                  </label>
                  <input
                    id="add-appid-input"
                    type="text"
                    value={addAppId}
                    onChange={(e) => setAddAppId(e.target.value)}
                    placeholder="Opsiyonel"
                    className="font-mono-tech w-full border border-white/10 bg-[#0b0c0f] px-2.5 py-1.5 text-xs text-[#f2efe9]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="add-dev-input"
                  className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                >
                  Yapımcı
                </label>
                <input
                  id="add-dev-input"
                  type="text"
                  value={addDev}
                  onChange={(e) => setAddDev(e.target.value)}
                  placeholder="Örn: Rjac25"
                  className="w-full border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9]"
                />
              </div>

              <div>
                <label
                  htmlFor="add-obj-input"
                  className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                >
                  Genel Amaç
                </label>
                <textarea
                  id="add-obj-input"
                  rows={2}
                  value={addObjective}
                  onChange={(e) => setAddObjective(e.target.value)}
                  placeholder="Oyundaki temel hayatta kalma veya görev amacı..."
                  className="w-full resize-none border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9]"
                />
              </div>

              <div>
                <label
                  htmlFor="add-steps-input"
                  className="font-mono-tech mb-1 block text-[11px] uppercase text-[#9ca0ab]"
                >
                  Geceler / Bölümler (Virgülle ayır)
                </label>
                <input
                  id="add-steps-input"
                  type="text"
                  value={addSteps}
                  onChange={(e) => setAddSteps(e.target.value)}
                  placeholder="Night 1, Night 2, Night 3, Night 4, Night 5, Night 6"
                  className="w-full border border-white/10 bg-[#0b0c0f] px-3 py-1.5 text-xs text-[#f2efe9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="cursor-pointer border border-white/10 bg-[#0b0c0f] px-4 py-1.5 text-xs text-[#9ca0ab]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-[#e59a3c] px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b0c0f]"
                >
                  Arşive Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BACKUP / IMPORT MODAL */}
      {backupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Veri Yönetimi ve Yedekleme"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBackupOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md space-y-4 border border-white/15 bg-[#1a1d24] p-5 rounded-[2px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#f2efe9]">
                Veri Yönetimi &amp; Yedekleme
              </h3>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setBackupOpen(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center border border-white/10 bg-[#0b0c0f] text-[#9ca0ab] hover:text-[#f2efe9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex w-full cursor-pointer items-center justify-between border border-white/15 bg-[#13151a] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#f2efe9] hover:bg-[#e59a3c] hover:text-[#0b0c0f]"
              >
                <span>JSON Yedeği İndir (Oyunlar)</span>
                <Download className="h-4 w-4" />
              </button>

              <label className="flex w-full cursor-pointer items-center justify-between border border-white/15 bg-[#13151a] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#f2efe9] hover:bg-[#66c0f4] hover:text-[#0b0c0f]">
                <span>JSON Yedeği Yükle</span>
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportJson(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3">
              <p className="text-[11px] text-[#9ca0ab]">
                Tüm ilerleme verilerini silip 26 oyunluk varsayılan arşive dönmek için:
              </p>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="font-mono-tech cursor-pointer border border-[#c93b3b]/40 px-3 py-1.5 text-xs text-[#c93b3b] hover:bg-[#c93b3b]/15"
                >
                  Varsayılan Arşive Sıfırla
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#c93b3b]">
                    Tüm kayıtlar silinecek, emin misin?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setGames(structuredClone(DEFAULT_GAMES));
                      setBackupOpen(false);
                      showToast('Varsayılan 26 oyunluk arşive sıfırlandı');
                    }}
                    className="cursor-pointer bg-[#c93b3b] px-3 py-1 text-xs font-bold text-white"
                  >
                    Sıfırla
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="cursor-pointer border border-white/10 bg-[#0b0c0f] px-2.5 py-1 text-xs text-[#9ca0ab]"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="font-mono-tech fixed right-4 bottom-4 z-50 flex items-center gap-2 border border-white/20 bg-[#1a1d24] px-3.5 py-2 text-xs text-[#f2efe9] shadow-xl"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center ${
              toastMsg.isError ? 'text-[#c93b3b]' : 'text-[#3ba56b]'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <span>{toastMsg.text}</span>
        </div>
      )}
    </section>
  );
};
