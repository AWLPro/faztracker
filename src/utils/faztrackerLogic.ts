import { DEFAULT_GAMES, type GameCategory, type GameStatus, type TrackerGame } from '../data/faztrackerGames';

export type PlatformFilter = 'all' | 'steam' | 'owned' | 'gamejolt';
export type SortOption =
  | 'default'
  | 'year-desc'
  | 'year-asc'
  | 'progress-desc'
  | 'rating-desc'
  | 'hours-desc'
  | 'name-asc';

export interface ArchiveFilterState {
  category: 'all' | GameCategory;
  status: 'all' | GameStatus;
  platform: PlatformFilter;
  searchQuery: string;
  sortBy: SortOption;
}

export interface ArchiveSummaryStats {
  total: number;
  officialCount: number;
  fanCount: number;
  completedCount: number;
  playingCount: number;
  avgProgress: number;
  totalHours: number;
  avgRating: string;
}

export interface SteamMatchResult {
  game: TrackerGame;
  parsedHours: number | null;
  selected: boolean;
}

export function getGameProgress(game: TrackerGame): number {
  if (typeof game.manualProgress === 'number' && !Number.isNaN(game.manualProgress)) {
    return Math.max(0, Math.min(100, Math.round(game.manualProgress)));
  }
  if (!game.steps || game.steps.length === 0) {
    return game.status === 'completed' ? 100 : 0;
  }
  const done = game.steps.filter((s) => s.done).length;
  return Math.round((done / game.steps.length) * 100);
}

export function computeSummaryStats(games: readonly TrackerGame[]): ArchiveSummaryStats {
  const total = games.length;
  const officialCount = games.filter((g) => g.category === 'official').length;
  const fanCount = games.filter((g) => g.category === 'fangame').length;
  const completedCount = games.filter((g) => g.status === 'completed').length;
  const playingCount = games.filter((g) => g.status === 'playing').length;
  const totalProgressSum = games.reduce((sum, g) => sum + getGameProgress(g), 0);
  const avgProgress = total > 0 ? Math.round(totalProgressSum / total) : 0;
  const totalHours = games.reduce((sum, g) => sum + (Number(g.hours) || 0), 0);
  const ratedGames = games.filter((g) => Number(g.rating) > 0);
  const avgRating =
    ratedGames.length > 0
      ? (ratedGames.reduce((sum, g) => sum + Number(g.rating), 0) / ratedGames.length).toFixed(1)
      : '—';

  return {
    total,
    officialCount,
    fanCount,
    completedCount,
    playingCount,
    avgProgress,
    totalHours,
    avgRating,
  };
}

export interface CategoryCompletionBreakdown {
  totalGames: number;
  completedGames: number;
  overallCompletionPct: number;
  officialTotal: number;
  officialCompleted: number;
  officialAvgPct: number;
  fanTotal: number;
  fanCompleted: number;
  fanAvgPct: number;
  totalSteps: number;
  doneSteps: number;
  totalHours: number;
  totalJumpscares: number;
}

export function computeCategoryBreakdown(
  games: readonly TrackerGame[]
): CategoryCompletionBreakdown {
  const officials = games.filter((g) => g.category === 'official');
  const fans = games.filter((g) => g.category === 'fangame');

  const avgFor = (list: readonly TrackerGame[]) =>
    list.length > 0
      ? Math.round(list.reduce((sum, g) => sum + getGameProgress(g), 0) / list.length)
      : 0;

  let totalSteps = 0;
  let doneSteps = 0;
  let totalHours = 0;
  let totalJumpscares = 0;
  for (const g of games) {
    totalSteps += g.steps.length;
    doneSteps += g.steps.filter((s) => s.done).length;
    totalHours += Number(g.hours) || 0;
    totalJumpscares += Number(g.jumpscares) || 0;
  }

  return {
    totalGames: games.length,
    completedGames: games.filter((g) => g.status === 'completed' || getGameProgress(g) === 100).length,
    overallCompletionPct: avgFor(games),
    officialTotal: officials.length,
    officialCompleted: officials.filter((g) => g.status === 'completed' || getGameProgress(g) === 100).length,
    officialAvgPct: avgFor(officials),
    fanTotal: fans.length,
    fanCompleted: fans.filter((g) => g.status === 'completed' || getGameProgress(g) === 100).length,
    fanAvgPct: avgFor(fans),
    totalSteps,
    doneSteps,
    totalHours,
    totalJumpscares,
  };
}

export function toggleGameStep(game: TrackerGame, stepId: string): TrackerGame {
  const steps = game.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;

  let nextStatus: GameStatus = game.status;
  if (totalCount > 0 && game.manualProgress === null) {
    if (doneCount === totalCount) {
      nextStatus = 'completed';
    } else if (doneCount > 0 && (game.status === 'planned' || game.status === 'completed')) {
      nextStatus = 'playing';
    } else if (doneCount === 0 && game.status === 'completed') {
      nextStatus = 'planned';
    }
  }

  return {
    ...game,
    steps,
    status: nextStatus,
  };
}

export function filterAndSortGames(
  games: readonly TrackerGame[],
  filters: ArchiveFilterState
): TrackerGame[] {
  const q = filters.searchQuery.toLowerCase().trim();

  const filtered = games.filter((g) => {
    if (filters.category !== 'all' && g.category !== filters.category) return false;
    if (filters.status !== 'all' && g.status !== filters.status) return false;
    if (filters.platform === 'steam' && !g.steamAppId) return false;
    if (filters.platform === 'owned' && !g.steamOwned) return false;
    if (filters.platform === 'gamejolt' && g.steamAppId) return false;

    if (q !== '') {
      const inTitle = g.title.toLowerCase().includes(q);
      const inDev = (g.developer || '').toLowerCase().includes(q);
      const inCode = (g.catalogCode || '').toLowerCase().includes(q);
      const inThreats = (g.threats || []).some((t) => t.name.toLowerCase().includes(q));
      if (!inTitle && !inDev && !inCode && !inThreats) return false;
    }
    return true;
  });

  if (filters.sortBy === 'year-desc') {
    filtered.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
  } else if (filters.sortBy === 'year-asc') {
    filtered.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  } else if (filters.sortBy === 'progress-desc') {
    filtered.sort((a, b) => getGameProgress(b) - getGameProgress(a));
  } else if (filters.sortBy === 'rating-desc') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters.sortBy === 'hours-desc') {
    filtered.sort((a, b) => (b.hours || 0) - (a.hours || 0));
  } else if (filters.sortBy === 'name-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  }

  return filtered;
}

const STEAM_TITLE_RULES: Record<string, RegExp[]> = {
  'fnaf-1': [/five nights at freddy'?s(?!\s*(?:2|3|4|:|-|world))/, /\bfnaf\s*1\b/],
  'fnaf-2': [/five nights at freddy'?s\s*2\b/, /\bfnaf\s*2\b/],
  'fnaf-3': [/five nights at freddy'?s\s*3\b/, /\bfnaf\s*3\b/],
  'fnaf-4': [/five nights at freddy'?s\s*4\b/, /\bfnaf\s*4\b/],
  'fnaf-world': [/\bfnaf\s*world\b/],
  'fnaf-sl': [/sister location/],
  'fnaf-ffps': [/pizzeria simulator/, /\bffps\b/],
  'fnaf-ucn': [/ultimate custom night/, /\bucn\b/],
  'fnaf-hw': [/help wanted(?!\s*2)/],
  'fnaf-hw2': [/help wanted\s*2\b/],
  'fnaf-sb': [/security breach(?!\s*[:\-–—]?\s*ruin)/],
  'fnaf-ruin': [/\bruin\b/],
  'fnaf-itp': [/into the pit/],
  'fnaf-sotm': [/secret of the mimic/],
  'fan-popgoes': [/popgoes/],
};

function steamToNumber(s: string): number | null {
  const n = parseFloat(s.replace(/[.,](?=\d{3}(?!\d))/g, '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function steamHoursInLine(line: string): number | null {
  const m =
    line.match(/(\d[\d.,]*)\s*(?:hrs?|hours?|saat)\s*on record/) ||
    line.match(/(\d[\d.,]*)\s*(?:hrs?|hours?|saat)\b/);
  return m ? steamToNumber(m[1]) : null;
}

function steamGameIdForLine(line: string): string | null {
  for (const id of Object.keys(STEAM_TITLE_RULES)) {
    if (STEAM_TITLE_RULES[id].some((rx) => rx.test(line))) return id;
  }
  return null;
}

export function parseSteamPastedText(
  rawText: string,
  games: readonly TrackerGame[]
): SteamMatchResult[] {
  const text = String(rawText || '')
    .toLowerCase()
    .replace(/[’‘´`]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const found = new Map<string, SteamMatchResult>();

  for (const g of games) {
    if (g.steamAppId && new RegExp(`(^|\\D)${g.steamAppId}(\\D|$)`).test(text)) {
      found.set(g.id, { game: g, parsedHours: null, selected: true });
    }
  }

  lines.forEach((line, i) => {
    const id = steamGameIdForLine(line);
    const game = id ? games.find((g) => g.id === id) : undefined;
    if (!game || !id) return;

    let hours = steamHoursInLine(line);
    for (let j = 1; j <= 2 && hours === null && lines[i + j] && !steamGameIdForLine(lines[i + j]); j++) {
      hours = steamHoursInLine(lines[i + j]);
    }
    const prev = found.get(id);
    found.set(id, {
      game,
      parsedHours: hours !== null ? hours : prev ? prev.parsedHours : null,
      selected: true,
    });
  });

  return Array.from(found.values());
}

export function normalizeGameObject(
  item: Partial<TrackerGame> & { id: string; title: string; milestones?: { id: string; label: string; done: boolean }[]; deaths?: number },
  def?: TrackerGame
): TrackerGame {
  const defaultDef = def ?? DEFAULT_GAMES.find((d) => d.id === item.id);
  const steps = Array.isArray(item.milestones)
    ? item.milestones.map((m) => ({ id: m.id, label: m.label, done: !!m.done }))
    : Array.isArray(item.steps)
      ? item.steps
      : defaultDef
        ? JSON.parse(JSON.stringify(defaultDef.steps))
        : [];

  const statusRaw = item.status as string | undefined;
  const status: GameStatus =
    statusRaw === 'hundred'
      ? 'completed'
      : statusRaw === 'playing' || statusRaw === 'completed' || statusRaw === 'dropped' || statusRaw === 'planned'
        ? statusRaw
        : 'planned';

  return {
    id: item.id,
    catalogCode: item.catalogCode || (defaultDef ? defaultDef.catalogCode : 'CUST-01'),
    title: item.title,
    category: item.category || (defaultDef ? defaultDef.category : 'fangame'),
    year: item.year || (defaultDef ? defaultDef.year : '2026'),
    developer: item.developer || (defaultDef ? defaultDef.developer : 'Bağımsız Yapımcı'),
    steamAppId: item.steamAppId !== undefined ? item.steamAppId : defaultDef ? defaultDef.steamAppId : null,
    steamOwned: !!item.steamOwned,
    accent: item.accent || (defaultDef ? defaultDef.accent : '#e59a3c'),
    emblem: item.emblem || (defaultDef ? defaultDef.emblem : 'bear'),
    objective:
      item.objective ||
      (defaultDef
        ? defaultDef.objective
        : 'Bu oyundaki tüm geceleri ve gizli sonları tamamlayarak hayatta kalmak.'),
    story:
      item.story ||
      (defaultDef ? defaultDef.story : 'Arşive eklenmiş özel FNaF / fan yapımı oyun kaydı.'),
    mechanics:
      Array.isArray(item.mechanics) && item.mechanics.length > 0
        ? item.mechanics
        : defaultDef
          ? defaultDef.mechanics
          : ['Hayatta Kalma', 'Gece Vardiyası'],
    threats:
      Array.isArray(item.threats) && item.threats.length > 0
        ? item.threats
        : defaultDef
          ? JSON.parse(JSON.stringify(defaultDef.threats))
          : [],
    status,
    manualProgress: typeof item.manualProgress === 'number' ? item.manualProgress : null,
    rating: Number(item.rating) || 0,
    hours: Number(item.hours) || 0,
    jumpscares: Number(item.jumpscares ?? item.deaths) || 0,
    completedDate: item.completedDate || '',
    customCover: item.customCover || '',
    notes: item.notes || '',
    steps,
  };
}
