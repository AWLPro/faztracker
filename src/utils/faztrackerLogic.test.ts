import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_GAMES } from '../data/faztrackerGames';
import { HERO_GAMES } from '../data/heroGames';
import {
  computeCategoryBreakdown,
  computeSummaryStats,
  filterAndSortGames,
  getGameProgress,
  parseSteamPastedText,
  toggleGameStep,
} from './faztrackerLogic';

test('default catalog ships 14 official and 12 fan games', () => {
  const stats = computeSummaryStats(DEFAULT_GAMES);
  assert.equal(stats.total, 26);
  assert.equal(stats.officialCount, 14);
  assert.equal(stats.fanCount, 12);
});

test('HERO_GAMES includes all 13 original canon FNaF titles with exact FNaF 1-4 character sheets', () => {
  assert.equal(HERO_GAMES.length, 13);
  const byId = new Map(HERO_GAMES.map((g) => [g.id, g]));
  const catalogIds = new Set(DEFAULT_GAMES.filter((g) => g.category === 'official').map((g) => g.id));

  for (const slide of HERO_GAMES) {
    assert.ok(catalogIds.has(slide.id), `${slide.id} missing from DEFAULT_GAMES`);
  }

  assert.match(byId.get('fnaf-1')!.sheetUrl, /fnaf_freddy_sheet/);
  assert.match(byId.get('fnaf-2')!.sheetUrl, /fnaf_toy_bonnie_sheet/);
  assert.match(byId.get('fnaf-3')!.sheetUrl, /fnaf_springtrap_sheet/);
  assert.match(byId.get('fnaf-4')!.sheetUrl, /fnaf_nightmare_fredbear_sheet/);
  assert.match(byId.get('fnaf-sl')!.sheetUrl, /fnaf_circus_baby_sheet/);
  assert.match(byId.get('fnaf-sb')!.sheetUrl, /fnaf_glamrock_freddy_sheet/);
  assert.ok(byId.has('fnaf-sotm'));
});

test('getGameProgress calculates step percentage and respects manual override', () => {
  const base = structuredClone(DEFAULT_GAMES[0]);
  assert.equal(getGameProgress(base), 0);

  base.steps[0].done = true;
  base.steps[1].done = true;
  // 2 / 7 -> 29%
  assert.equal(getGameProgress(base), 29);

  base.manualProgress = 75;
  assert.equal(getGameProgress(base), 75);
});

test('toggleGameStep updates night completion and transitions game status automatically', () => {
  let game = structuredClone(DEFAULT_GAMES[1]); // fnaf-2 has 4 steps
  assert.equal(game.status, 'planned');

  game = toggleGameStep(game, game.steps[0].id);
  assert.equal(game.status, 'playing');
  assert.equal(getGameProgress(game), 25);

  for (const s of game.steps.slice(1)) {
    game = toggleGameStep(game, s.id);
  }
  assert.equal(getGameProgress(game), 100);
  assert.equal(game.status, 'completed');

  // Unchecking one step from completed returns status to playing
  game = toggleGameStep(game, game.steps[0].id);
  assert.equal(getGameProgress(game), 75);
  assert.equal(game.status, 'playing');
});

test('computeCategoryBreakdown aggregates official vs fan completion stats', () => {
  const sample = structuredClone(DEFAULT_GAMES);
  sample[0] = {
    ...sample[0],
    hours: 12.5,
    jumpscares: 9,
    steps: sample[0].steps.map((s) => ({ ...s, done: true })),
    status: 'completed',
  };
  const breakdown = computeCategoryBreakdown(sample);
  assert.equal(breakdown.totalGames, 26);
  assert.equal(breakdown.completedGames, 1);
  assert.equal(breakdown.officialCompleted, 1);
  assert.equal(breakdown.fanCompleted, 0);
  assert.equal(breakdown.totalHours, 12.5);
  assert.equal(breakdown.totalJumpscares, 9);
  assert.ok(breakdown.doneSteps === sample[0].steps.length);
  assert.ok(breakdown.overallCompletionPct > 0);
});

test('filterAndSortGames filters by category, platform, threat search, and sorts by year', () => {
  const steamOnly = filterAndSortGames(DEFAULT_GAMES, {
    category: 'all',
    status: 'all',
    platform: 'steam',
    searchQuery: '',
    sortBy: 'year-desc',
  });
  assert.ok(steamOnly.every((g) => g.steamAppId !== null));
  assert.ok(parseInt(steamOnly[0].year, 10) >= parseInt(steamOnly[steamOnly.length - 1].year, 10));

  const threatMatch = filterAndSortGames(DEFAULT_GAMES, {
    category: 'fangame',
    status: 'all',
    platform: 'all',
    searchQuery: 'Ignited Freddy',
    sortBy: 'default',
  });
  assert.equal(threatMatch.length, 1);
  assert.equal(threatMatch[0].id, 'fan-tjoc');
});

test('parseSteamPastedText extracts game matches, AppIDs, and hours on record', () => {
  const sample = `
    Five Nights at Freddy's 14.5 hrs on record
    Five Nights at Freddy's: Security Breach 31.2 hrs on record
    332800
  `;
  const matches = parseSteamPastedText(sample, DEFAULT_GAMES);
  const byId = new Map(matches.map((m) => [m.game.id, m]));

  assert.equal(byId.get('fnaf-1')?.parsedHours, 14.5);
  assert.equal(byId.get('fnaf-sb')?.parsedHours, 31.2);
  assert.ok(byId.has('fnaf-2'));
});
