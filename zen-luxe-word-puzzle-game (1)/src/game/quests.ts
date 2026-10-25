import type { QuestProgressState } from "./types";

export type QuestIcon =
  | "drop"
  | "leaf"
  | "eye"
  | "timer"
  | "crown"
  | "sun"
  | "swords"
  | "map"
  | "flower"
  | "zap";

export interface QuestDef {
  id: string;
  title: string;
  detail: string;
  metric: string;
  target: number;
  reward: number;
  pollen: number;
  icon: QuestIcon;
}

export interface QuestView {
  def: QuestDef;
  value: number;
  ready: boolean;
  claimed: boolean;
}

export const DAILY_QUESTS: QuestDef[] = [
  { id: "dew-60", title: "Gather 60 dewdrops", detail: "Any ritual counts.", metric: "dew", target: 60, reward: 20, pollen: 6, icon: "drop" },
  { id: "solve-3", title: "Gather three words", detail: "Solve any three words today.", metric: "solve", target: 3, reward: 22, pollen: 7, icon: "leaf" },
  { id: "few-4", title: "Clear in four or fewer", detail: "A single sharp solve.", metric: "few_win", target: 1, reward: 18, pollen: 5, icon: "eye" },
  { id: "fever-run", title: "One full Word Fever run", detail: "Sixty seconds of flow.", metric: "fever_run", target: 1, reward: 20, pollen: 6, icon: "timer" },
  { id: "six-win", title: "A six-letter bloom", detail: "Solve a Master word.", metric: "six_win", target: 1, reward: 26, pollen: 8, icon: "crown" },
  { id: "hint-free", title: "Nothing but attention", detail: "Win without a hint.", metric: "hintfree", target: 1, reward: 18, pollen: 5, icon: "sun" },
  { id: "duel-round", title: "Sit across from a friend", detail: "Play a Friend Duel round.", metric: "duel", target: 1, reward: 16, pollen: 5, icon: "swords" },
  { id: "journey-step", title: "One step along the path", detail: "Clear a Journey level.", metric: "journey", target: 1, reward: 26, pollen: 8, icon: "map" },
  { id: "daily-bloom", title: "Tend the Daily Bloom", detail: "Today's shared puzzle.", metric: "daily", target: 1, reward: 30, pollen: 10, icon: "flower" },
  { id: "fever-words", title: "Four words in Fever", detail: "Inside a single run.", metric: "fever_words", target: 4, reward: 24, pollen: 7, icon: "zap" },
];

export const WEEKLY_QUESTS: QuestDef[] = [
  { id: "w-solve-12", title: "Twelve quiet words", detail: "Solve across the week.", metric: "solve", target: 12, reward: 90, pollen: 24, icon: "leaf" },
  { id: "w-few-4", title: "Four swift solves", detail: "Win in four guesses or fewer.", metric: "few_win", target: 4, reward: 80, pollen: 22, icon: "eye" },
  { id: "w-fever-2", title: "Two Fever runs", detail: "Return to the rush.", metric: "fever_run", target: 2, reward: 70, pollen: 20, icon: "timer" },
  { id: "w-journey-3", title: "Three path stones", detail: "Clear three Journey levels.", metric: "journey", target: 3, reward: 100, pollen: 28, icon: "map" },
  { id: "w-dew-400", title: "A fuller jar", detail: "Gather 400 dewdrops.", metric: "dew", target: 400, reward: 80, pollen: 20, icon: "drop" },
  { id: "w-duel-2", title: "Two friendly duels", detail: "Play two duel rounds.", metric: "duel", target: 2, reward: 60, pollen: 18, icon: "swords" },
  { id: "w-bloom-3", title: "Three daily blooms", detail: "Tend the bloom three days.", metric: "daily", target: 3, reward: 90, pollen: 26, icon: "flower" },
];

export interface BloomTier {
  at: number;
  dew?: number;
  gale?: number;
  sunbeam?: number;
  label: string;
}

/** Seasonal weekly track. Pollen resets every Monday, so the loop stays fresh. */
export const BLOOM_TIERS: BloomTier[] = [
  { at: 15, dew: 40, label: "40 dew" },
  { at: 35, gale: 1, label: "1 Gale" },
  { at: 60, dew: 60, label: "60 dew" },
  { at: 90, sunbeam: 1, label: "1 Sunbeam" },
  { at: 125, dew: 80, label: "80 dew" },
  { at: 165, dew: 100, label: "100 dew" },
  { at: 205, gale: 2, label: "2 Gale" },
  { at: 245, dew: 120, label: "120 dew" },
  { at: 285, dew: 160, label: "160 dew" },
  { at: 320, sunbeam: 2, dew: 200, label: "Everbloom cache" },
];

export function todayKey(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ISO week key, e.g. 2026-W18. */
export function weekKey(): string {
  const d = new Date();
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickQuests(pool: QuestDef[], seed: string, count = 3): QuestDef[] {
  const start = hashSeed(seed) % pool.length;
  const step = 3 + (hashSeed(`${seed}-step`) % 3);
  const chosen: QuestDef[] = [];
  let idx = start;
  while (chosen.length < count) {
    const candidate = pool[idx % pool.length];
    if (!chosen.some((q) => q.id === candidate.id)) chosen.push(candidate);
    idx += step;
  }
  return chosen;
}

export function dailyQuestsFor(day: string): QuestDef[] {
  return pickQuests(DAILY_QUESTS, `daily-${day}`, 3);
}

export function weeklyQuestsFor(week: string): QuestDef[] {
  return pickQuests(WEEKLY_QUESTS, `weekly-${week}`, 3);
}

export function ensureQuestCycles(q: QuestProgressState): QuestProgressState {
  const day = todayKey();
  const week = weekKey();
  if (q.day === day && q.week === week) return q;
  const weekChanged = q.week !== week;
  return {
    ...q,
    day,
    week,
    daily: q.day === day ? q.daily : {},
    weekly: weekChanged ? {} : q.weekly,
    claimedDaily: q.day === day ? q.claimedDaily : [],
    claimedWeekly: weekChanged ? [] : q.claimedWeekly,
    claimedTiers: weekChanged ? [] : q.claimedTiers,
    pollen: weekChanged ? 0 : q.pollen,
  };
}

/** Progress counters feed both the daily and weekly active quest sets. */
export function bumpQuestProgress(q: QuestProgressState, deltas: Record<string, number>): QuestProgressState {
  const active = new Set([
    ...dailyQuestsFor(q.day).map((d) => d.metric),
    ...weeklyQuestsFor(q.week).map((d) => d.metric),
  ]);
  const daily = { ...q.daily };
  const weekly = { ...q.weekly };
  let touched = false;
  for (const [key, amount] of Object.entries(deltas)) {
    if (!amount || !active.has(key)) continue;
    daily[key] = (daily[key] ?? 0) + amount;
    weekly[key] = (weekly[key] ?? 0) + amount;
    touched = true;
  }
  if (!touched) return q;
  return { ...q, daily, weekly };
}

export function questViews(q: QuestProgressState, kind: "daily" | "weekly"): QuestView[] {
  const defs = kind === "daily" ? dailyQuestsFor(q.day) : weeklyQuestsFor(q.week);
  const progress = kind === "daily" ? q.daily : q.weekly;
  const claimed = kind === "daily" ? q.claimedDaily : q.claimedWeekly;
  return defs.map((def) => {
    const value = Math.min(progress[def.metric] ?? 0, def.target);
    return { def, value, ready: value >= def.target, claimed: claimed.includes(def.id) };
  });
}

export function claimableQuestCount(q: QuestProgressState): number {
  return [...questViews(q, "daily"), ...questViews(q, "weekly")].filter((v) => v.ready && !v.claimed).length;
}

export function bloomClaims(q: QuestProgressState) {
  return BLOOM_TIERS.map((tier, index) => ({
    tier,
    index,
    claimed: q.claimedTiers.includes(index),
    ready: q.pollen >= tier.at && !q.claimedTiers.includes(index),
  }));
}

export function claimableBloomCount(q: QuestProgressState): number {
  return bloomClaims(q).filter((b) => b.ready).length;
}

export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}
