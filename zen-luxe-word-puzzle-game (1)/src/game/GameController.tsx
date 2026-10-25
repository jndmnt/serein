import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sound } from "../audio/SoundEngine";
import {
  coldLetters,
  DICTIONARY_SIZE,
  dailySolution,
  drawSolution,
  emptySlots,
  eraseLetter,
  firstOpen,
  insertLetter,
  rowComplete,
  rowWord,
  evaluateGuess,
  isValidWord,
  solutionDeckSize,
  unrevealedLetters,
} from "./DictionaryEngine";
import { ACHIEVEMENTS, achievementById, applyAchievements } from "./achievements";
import { GLAZE_PRICES } from "./cosmetics";
import {
  BLOOM_TIERS,
  bumpQuestProgress,
  claimableBloomCount,
  claimableQuestCount,
  ensureQuestCycles,
  questViews,
  todayKey,
  weekKey,
} from "./quests";
import {
  JOURNEY_LEVELS,
  chapterForLevel,
  isLevelUnlocked,
  levelById,
  starsFor,
} from "./journey";
import type {
  ActivityDay,
  CollectionEntry,
  DailyState,
  Evaluation,
  GlazeId,
  Mode,
  PlayerStats,
  ProgressState,
  Reveal,
  ThemeId,
  TileStatus,
  ToastMessage,
  VersusState,
  WordLength,
} from "./types";

export type SheetId =
  | "modes"
  | "stats"
  | "shop"
  | "settings"
  | "gift"
  | "achievements"
  | "help"
  | "journey"
  | "garden"
  | "quests"
  | "profile"
  | null;
export type LengthKey = "4" | "5" | "6";

const STORAGE_KEY = "serein.progress.v1";
const XP_PER_LEVEL = 240;

export interface ClassicState {
  word: string;
  guesses: Evaluation[];
  slots: (string | null)[];
  cursor: number;
  status: "playing" | "won" | "lost";
  reveals: Reveal[];
  eliminated: string[];
  hintsUsed: number;
  startedAt: number;
  shakeKey: number;
  earned: number;
  xpEarned: number;
  maxGuesses: number;
}

export interface FeverState {
  phase: "idle" | "playing" | "ended";
  status: "playing" | "solved" | "skipped";
  word: string;
  guesses: Evaluation[];
  slots: (string | null)[];
  cursor: number;
  timeLeft: number;
  score: number;
  solved: number;
  combo: number;
  bestCombo: number;
  comboExpires: number;
  flashKey: number;
  lastWord: string;
  lastGain: number;
  lastBonus: number;
  startedAt: number;
  settled: boolean;
  shakeKey: number;
  solvedWords: { word: string; guesses: number }[];
}

export type SessionKind = "practice" | "journey" | "daily";

export interface SessionState {
  kind: SessionKind;
  levelId?: string;
  title: string;
  maxGuesses: number;
}

export interface RoundSummary {
  win: boolean;
  word: string;
  length: WordLength;
  attempts: number;
  newSpecimens: number;
  bonusDew: number;
  stars?: number;
  journeyCleared?: boolean;
  daily?: boolean;
  title?: string;
  chapterCleared?: string;
  nextLevel?: string;
}

export interface LevelMeta {
  level: number;
  title: string;
  progress: number;
  xpInLevel: number;
  xpToNext: number;
  nextTitle: string;
}

function rowWithReveals(length: WordLength, reveals: Reveal[]): (string | null)[] {
  const slots = emptySlots(length);
  for (const reveal of reveals) if (reveal.index < length) slots[reveal.index] = reveal.letter;
  return slots;
}

const PALETTE_TITLES = [
  "Curious Sprout",
  "Still Water",
  "Moss Wanderer",
  "Quiet Sage",
  "Word Alchemist",
  "Garden Keeper",
  "Zen Arborist",
  "Celadon Master",
];

export function levelMeta(xp: number): LevelMeta {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInLevel = xp % XP_PER_LEVEL;
  const title = PALETTE_TITLES[(level - 1) % PALETTE_TITLES.length];
  const nextTitle = PALETTE_TITLES[level % PALETTE_TITLES.length];
  return {
    level,
    title,
    xpInLevel,
    xpToNext: XP_PER_LEVEL,
    progress: xpInLevel / XP_PER_LEVEL,
    nextTitle,
  };
}

export const THEME_PRICES: Record<Exclude<ThemeId, "sage">, number> = {
  rosewood: 300,
  mist: 420,
  honey: 360,
};

export { GLAZE_PRICES };

const defaultStats = (): PlayerStats => ({
  played: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0, 0],
  twoGuessWins: 0,
  sixLetterWins: 0,
  versusWins: 0,
  versusPlayed: 0,
  feverBest: 0,
  feverWordsTotal: 0,
  hintsFreeWins: 0,
  fastestSolve: null,
  totalDewdropsEarned: 0,
});

const defaultDaily = (): DailyState => ({
  lastClaim: null,
  streak: 0,
  bestStreak: 0,
  claimedToday: false,
});

export const defaultProgress = (): ProgressState => ({
  name: "Wanderer",
  dewdrops: 340,
  xp: 70,
  stats: defaultStats(),
  daily: defaultDaily(),
  unlockedAchievements: [],
  usedSolutions: { "4": [], "5": [], "6": [] },
  theme: "sage",
  ownedThemes: ["sage"],
  glaze: "porcelain",
  ownedGlazes: ["porcelain"],
  sound: true,
  haptics: true,
  tileSymbols: false,
  galeCharges: 1,
  sunbeamCharges: 1,
  seenIntro: false,
  history: [],
  collection: [],
  journey: { stars: {}, completed: 0 },
  quests: {
    day: todayKey(),
    week: weekKey(),
    daily: {},
    weekly: {},
    claimedDaily: [],
    claimedWeekly: [],
    pollen: 0,
    claimedTiers: [],
  },
  dailyBloom: { lastSolved: null, completed: 0, bestGuesses: null },
  activity: {},
  companionXp: 48,
});

const dayKey = todayKey;

/** Keeps meta cycles fresh at midnight / Monday, even if the app stays open. */
function normalizeProgress(p: ProgressState): ProgressState {
  const quests = ensureQuestCycles(p.quests);
  if (quests === p.quests) return p;
  return { ...p, quests };
}

/** Adds a pressed specimen; duplicates only polish their record. */
function addSpecimen(
  list: CollectionEntry[],
  word: string,
  length: WordLength,
  guesses: number,
  source: Mode | "daily",
): CollectionEntry[] {
  const now = new Date().toISOString();
  const index = list.findIndex((e) => e.word === word && e.length === length);
  if (index >= 0) {
    return list.map((entry, i) =>
      i === index
        ? {
            ...entry,
            times: entry.times + 1,
            bestGuesses: Math.min(entry.bestGuesses, guesses),
            lastSolved: now,
          }
        : entry,
    );
  }
  return [{ word, length, bestGuesses: guesses, times: 1, firstSolved: now, lastSolved: now, source }, ...list].slice(0, 800);
}

function hasSpecimen(list: CollectionEntry[], word: string, length: WordLength): boolean {
  return list.some((e) => e.word === word && e.length === length);
}

function noteActivity(
  activity: Record<string, ActivityDay>,
  played: number,
  wins: number,
  dew: number,
): Record<string, ActivityDay> {
  const key = dayKey();
  const current = activity[key] ?? { p: 0, w: 0, d: 0 };
  return {
    ...activity,
    [key]: { p: current.p + played, w: current.w + wins, d: current.d + dew },
  };
}

function loadProgress(): ProgressState {
  const base = defaultProgress();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<ProgressState>;
    const merged: ProgressState = {
      ...base,
      ...saved,
      stats: { ...base.stats, ...(saved.stats ?? {}) },
      daily: { ...base.daily, ...(saved.daily ?? {}) },
      usedSolutions: {
        "4": saved.usedSolutions?.["4"] ?? [],
        "5": saved.usedSolutions?.["5"] ?? [],
        "6": saved.usedSolutions?.["6"] ?? [],
      },
      ownedThemes: Array.from(new Set([...(saved.ownedThemes ?? []), "sage"])),
      history: (saved.history ?? []).slice(0, 12),
      name: saved.name?.trim() || base.name,
      glaze: saved.glaze ?? base.glaze,
      ownedGlazes: Array.from(new Set([...(saved.ownedGlazes ?? []), "porcelain"])) as ProgressState["ownedGlazes"],
      collection: (saved.collection ?? []).slice(0, 800),
      journey: {
        ...base.journey,
        ...(saved.journey ?? {}),
        stars: { ...(saved.journey?.stars ?? {}) },
      },
      quests: {
        ...base.quests,
        ...(saved.quests ?? {}),
        daily: { ...(saved.quests?.daily ?? {}) },
        weekly: { ...(saved.quests?.weekly ?? {}) },
        claimedDaily: saved.quests?.claimedDaily ?? [],
        claimedWeekly: saved.quests?.claimedWeekly ?? [],
        claimedTiers: saved.quests?.claimedTiers ?? [],
      },
      dailyBloom: { ...base.dailyBloom, ...(saved.dailyBloom ?? {}) },
      activity: saved.activity ?? {},
      companionXp: saved.companionXp ?? base.companionXp,
    };
    if (merged.stats.guessDistribution.length !== 7) merged.stats.guessDistribution = base.stats.guessDistribution;
    merged.daily.claimedToday = merged.daily.lastClaim === dayKey();
    merged.quests = ensureQuestCycles(merged.quests);
    return merged;
  } catch {
    return base;
  }
}

function emptyClassic(word = "", maxGuesses = 6, length: WordLength = 5): ClassicState {
  return {
    word,
    guesses: [],
    slots: emptySlots(length),
    cursor: 0,
    status: "playing",
    reveals: [],
    eliminated: [],
    hintsUsed: 0,
    startedAt: Date.now(),
    shakeKey: 0,
    earned: 0,
    xpEarned: 0,
    maxGuesses,
  };
}

function emptyFever(word = "", length: WordLength = 5): FeverState {
  return {
    phase: "idle",
    status: "playing",
    word,
    guesses: [],
    slots: emptySlots(length),
    cursor: 0,
    timeLeft: 60,
    score: 0,
    solved: 0,
    combo: 0,
    bestCombo: 0,
    comboExpires: 0,
    flashKey: 0,
    lastWord: "",
    lastGain: 0,
    lastBonus: 0,
    startedAt: Date.now(),
    settled: false,
    shakeKey: 0,
    solvedWords: [],
  };
}

function emptyVersus(length: WordLength = 5): VersusState {
  return {
    phase: "intro",
    bestOf: 3,
    round: 1,
    scores: { p1: 0, p2: 0 },
    secret: "",
    setter: 1,
    solver: 2,
    guesses: [],
    slots: emptySlots(length),
    cursor: 0,
    startedAt: Date.now(),
    elapsed: 0,
    roundWinner: null,
    solvedIn: null,
    matchWinner: null,
    shakeKey: 0,
  };
}

const keyOf = (length: WordLength): LengthKey => String(length) as LengthKey;

function nextStreakFor(daily: DailyState): number {
  if (daily.claimedToday) return Math.max(1, daily.streak);
  if (daily.lastClaim === dayKey(-1)) return daily.streak + 1;
  return 1;
}

export function dailyRewardFor(progress: ProgressState): number {
  const streak = nextStreakFor(progress.daily);
  return 18 + Math.min(streak, 6) * 5 + (streak % 7 === 0 ? 40 : 0);
}

export function todayStreak(progress: ProgressState): number {
  return nextStreakFor(progress.daily);
}

function mergeUsed(
  a: Record<LengthKey, string[]>,
  b: Record<LengthKey, string[]>,
): Record<LengthKey, string[]> {
  return {
    "4": Array.from(new Set([...a["4"], ...b["4"]])),
    "5": Array.from(new Set([...a["5"], ...b["5"]])),
    "6": Array.from(new Set([...a["6"], ...b["6"]])),
  };
}

function feverMultiplierFor(combo: number): number {
  if (combo >= 6) return 3;
  if (combo >= 4) return 2;
  if (combo >= 2) return 1.5;
  return 1;
}

interface ControllerValue {
  progress: ProgressState;
  mode: Mode;
  length: WordLength;
  classic: ClassicState;
  fever: FeverState;
  vs: VersusState;
  activeSheet: SheetId;
  resultOpen: boolean;
  toasts: ToastMessage[];
  level: LevelMeta;
  feverMultiplier: number;
  comboFuel: number;
  dailyReward: number;
  winsNeeded: number;
  puzzleNo: number;
  dictionarySize: number;
  deckSize: number;
  session: SessionState;
  lastRound: RoundSummary | null;
  questClaimables: number;
  bloomClaimables: number;
  dailyBloomInfo: { day: string; length: WordLength; done: boolean; completed: number; bestGuesses: number | null };
  notify: (text: string, opts?: Partial<Omit<ToastMessage, "id" | "text">>) => void;
  dismissToast: (id: number) => void;
  openSheet: (sheet: SheetId) => void;
  closeSheet: () => void;
  selectMode: (mode: Mode) => void;
  selectLength: (length: WordLength) => void;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  selectCell: (index: number) => void;
  fieldNotice: { text: string; detail?: string; tone: "error" | "success"; key: number } | null;
  clearFieldNotice: () => void;
  validation: { complete: boolean; valid: boolean; word: string };
  meaningOpen: string | null;
  openMeaning: (word: string | null) => void;
  submit: () => void;
  handleKey: (key: string) => void;
  newPuzzle: () => void;
  useGale: () => void;
  useSunbeam: () => void;
  beginFever: () => void;
  finishFever: () => void;
  claimDaily: () => void;
  buyTheme: (theme: ThemeId) => void;
  equipTheme: (theme: ThemeId) => void;
  buyCharges: (kind: "gale" | "sunbeam", qty: number, price: number) => void;
  updateSettings: (patch: Partial<Pick<ProgressState, "sound" | "haptics" | "tileSymbols">>) => void;
  resetProgress: () => void;
  dismissIntro: () => void;
  closeResult: () => void;
  vsStart: (bestOf: 3 | 5) => void;
  vsSetSecret: (word: string) => { ok: boolean; error?: string };
  vsHandoff: () => void;
  vsSubmit: () => void;
  vsNextRound: () => void;
  vsExit: () => void;
  claimQuest: (kind: "daily" | "weekly", id: string) => void;
  claimBloomTier: (index: number) => void;
  startJourneyLevel: (levelId: string) => void;
  startDailyBloom: () => void;
  exitSession: () => void;
  advanceAfterClassic: () => void;
  setName: (name: string) => void;
  buyGlaze: (glaze: GlazeId) => void;
  equipGlaze: (glaze: GlazeId) => void;
}

const ControllerContext = createContext<ControllerValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const initial = useRef<ProgressState | null>(null);
  if (!initial.current) initial.current = loadProgress();

  const boot = useRef<{ classic: ClassicState; used: Record<LengthKey, string[]> } | null>(null);
  if (!boot.current) {
    const length: WordLength = 5;
    const key = keyOf(length);
    const draw = drawSolution(length, initial.current.usedSolutions[key]);
    boot.current = {
      classic: emptyClassic(draw.word, 6, length),
      used: { ...initial.current.usedSolutions, [key]: draw.used },
    };
  }

  const [progress, setProgress] = useState<ProgressState>(initial.current);
  const [mode, setMode] = useState<Mode>("classic");
  const [length, setLength] = useState<WordLength>(5);
  const [classic, setClassic] = useState<ClassicState>(boot.current.classic);
  const [fever, setFever] = useState<FeverState>(emptyFever("", length));
  const [vs, setVs] = useState<VersusState>(emptyVersus(length));
  const [session, setSession] = useState<SessionState>({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
  const [lastRound, setLastRound] = useState<RoundSummary | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetId>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastId = useRef(0);
  const toastTimers = useRef<number[]>([]);
  const usedRef = useRef<Record<LengthKey, string[]>>(boot.current.used);
  const roundToken = useRef(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const notify = useCallback((text: string, opts?: Partial<Omit<ToastMessage, "id" | "text">>) => {
    const id = ++toastId.current;
    const toast: ToastMessage = {
      id,
      text,
      tone: opts?.tone ?? "neutral",
      detail: opts?.detail,
      icon: opts?.icon,
    };
    setToasts((prev) => [...prev.slice(-2), toast]);
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
    toastTimers.current.push(timer);
  }, []);

  useEffect(
    () => () => {
      toastTimers.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const commit = useCallback((updater: (prev: ProgressState) => ProgressState) => {
    setProgress((prev) => {
      const base = normalizeProgress(prev);
      return applyAchievements(normalizeProgress(updater(base)));
    });
  }, []);

  // Unlock audio on the first gesture, as iOS requires.
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    sound.setEnabled(progress.sound);
    sound.setHaptics(progress.haptics);
  }, [progress.sound, progress.haptics]);

  useEffect(() => {
    const root = document.documentElement;
    if (progress.theme === "sage") delete root.dataset.theme;
    else root.dataset.theme = progress.theme;
    root.dataset.glaze = progress.glaze;
  }, [progress.theme, progress.glaze]);

  // Roll the daily/weekly cycles even if Serein is left open overnight.
  useEffect(() => {
    const refresh = () => commit((p) => p);
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [commit]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* private browsing — run in-memory */
    }
  }, [progress]);

  // Persist the boot puzzle in the used deck.
  useEffect(() => {
    commit((p) => ({ ...p, usedSolutions: mergeUsed(p.usedSolutions, usedRef.current) }));
  }, [commit]);

  const knownUnlocks = useRef(new Set(progress.unlockedAchievements));
  useEffect(() => {
    const fresh = progress.unlockedAchievements.filter((id) => !knownUnlocks.current.has(id));
    knownUnlocks.current = new Set(progress.unlockedAchievements);
    if (fresh.length === 0) return;
    for (const id of fresh) {
      const achievement = achievementById(id);
      if (!achievement) continue;
      notify(`Badge · ${achievement.name}`, {
        tone: "reward",
        detail: `${achievement.description}  +25 dewdrops`,
        icon: "leaf",
      });
    }
    window.setTimeout(() => sound.reward(), 200);
  }, [progress.unlockedAchievements, notify]);

  const drawFresh = useCallback(
    (len: WordLength): string => {
      const key = keyOf(len);
      const { word, used } = drawSolution(len, usedRef.current[key]);
      usedRef.current = { ...usedRef.current, [key]: used };
      commit((p) => ({
        ...p,
        usedSolutions: { ...p.usedSolutions, [key]: Array.from(new Set([...p.usedSolutions[key], ...used])) },
      }));
      return word;
    },
    [commit],
  );

  const openSheet = useCallback((sheet: SheetId) => {
    sound.sheet(true);
    setActiveSheet(sheet);
  }, []);

  const closeSheet = useCallback(() => {
    sound.sheet(false);
    setActiveSheet(null);
  }, []);

  const newPuzzle = useCallback(() => {
    roundToken.current += 1;
    const word = drawFresh(length);
    setClassic(emptyClassic(word));
    setSession({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
    setResultOpen(false);
  }, [drawFresh, length]);

  const selectMode = useCallback(
    (next: Mode) => {
      sound.click();
      setActiveSheet(null);
      setResultOpen(false);
      roundToken.current += 1;
      setMode(next);
      if (next === "classic") {
        if (mode === "classic" && classic.status === "playing") {
          setActiveSheet(null);
          return;
        }
        const word = drawFresh(length);
        setClassic(emptyClassic(word, 6, length));
        setSession({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
      } else if (next === "fever") {
        if (fever.phase !== "playing") setFever(emptyFever("", length));
      } else if (next === "versus") {
        if (vs.phase === "intro" || vs.phase === "matchResult") setVs(emptyVersus(length));
      }
    },
    [classic.status, drawFresh, fever.phase, length, mode, vs.phase],
  );

  const selectLength = useCallback(
    (next: WordLength) => {
      if (next === length) return;
      sound.click();
      roundToken.current += 1;
      setLength(next);
      setResultOpen(false);
      const stayInVersus = mode === "versus" && (vs.phase === "intro" || vs.phase === "matchResult");
      setMode(stayInVersus ? "versus" : "classic");
      const word = drawFresh(next);
      setClassic(emptyClassic(word, 6, next));
      setSession({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
      setFever(emptyFever("", length));
      setVs(emptyVersus(length));
      notify(`${next}-letter ${next === 4 ? "Snack" : next === 5 ? "Classic" : "Master"} ritual`, {
        tone: "neutral",
        icon: "leaf",
      });
    },
    [drawFresh, length, mode, notify, vs.phase],
  );

  const appendLetter = useCallback(
    (letter: string) => {
      if (!/^[a-z]$/.test(letter)) return;
      const safeLetter = letter.toLowerCase();
      if (mode === "classic") {
        setClassic((c) => {
          if (c.status !== "playing") return c;
          const pinned = new Set(c.reveals.map((r) => r.index));
          const result = insertLetter(c.slots, c.cursor, pinned, safeLetter);
          if (result.slots === c.slots) return c;
          sound.tap(result.cursor);
          return { ...c, slots: result.slots, cursor: result.cursor };
        });
      } else if (mode === "fever") {
        setFever((f) => {
          if (f.phase !== "playing" || f.status !== "playing") return f;
          const result = insertLetter(f.slots, f.cursor, new Set(), safeLetter);
          if (result.slots === f.slots) return f;
          sound.tap(result.cursor);
          return { ...f, slots: result.slots, cursor: result.cursor };
        });
      } else if (mode === "versus") {
        setVs((v) => {
          if (v.phase !== "playP1" && v.phase !== "playP2") return v;
          const result = insertLetter(v.slots, v.cursor, new Set(), safeLetter);
          if (result.slots === v.slots) return v;
          sound.tap(result.cursor);
          return { ...v, slots: result.slots, cursor: result.cursor };
        });
      }
    },
    [mode],
  );

  const backspace = useCallback(() => {
    if (mode === "classic") {
      setClassic((c) => {
        if (c.status !== "playing") return c;
        const pinned = new Set(c.reveals.map((r) => r.index));
        const result = eraseLetter(c.slots, c.cursor, pinned);
        return result.slots === c.slots ? c : { ...c, slots: result.slots, cursor: result.cursor };
      });
    } else if (mode === "fever") {
      setFever((f) => {
        if (f.phase !== "playing" || f.status !== "playing") return f;
        const result = eraseLetter(f.slots, f.cursor, new Set());
        return result.slots === f.slots ? f : { ...f, slots: result.slots, cursor: result.cursor };
      });
    } else {
      setVs((v) => {
        if (v.phase !== "playP1" && v.phase !== "playP2") return v;
        const result = eraseLetter(v.slots, v.cursor, new Set());
        return result.slots === v.slots ? v : { ...v, slots: result.slots, cursor: result.cursor };
      });
    }
  }, [mode]);

  /** Tapping a tile moves the cursor there — no need to erase the whole word. */
  const selectCell = useCallback(
    (index: number) => {
      if (mode === "classic") {
        setClassic((c) => (c.status === "playing" && index < c.slots.length ? { ...c, cursor: index } : c));
      } else if (mode === "fever") {
        setFever((f) => (f.phase === "playing" && f.status === "playing" ? { ...f, cursor: index } : f));
      } else {
        setVs((v) =>
          v.phase === "playP1" || v.phase === "playP2" ? { ...v, cursor: index } : v,
        );
      }
      sound.tap(index);
    },
    [mode],
  );

  const [fieldNotice, setFieldNotice] = useState<{
    text: string;
    detail?: string;
    tone: "error" | "success";
    key: number;
  } | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const showFieldNotice = useCallback(
    (text: string, detail: string | undefined, tone: "error" | "success", ms = 2800) => {
      setFieldNotice({ text, detail, tone, key: Date.now() });
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setFieldNotice(null), ms);
    },
    [],
  );

  /** Invalid guesses stay in the play surface: a quiet inline whisper, never a toast over the keys. */
  const flashInvalid = useCallback(
    (message = "Not in the garden's lexicon", detail = "Try another arrangement.") => {
      sound.invalid();
      sound.haptic([34, 30, 34]);
      setClassic((c) => ({ ...c, shakeKey: c.shakeKey + 1 }));
      setFever((f) => ({ ...f, shakeKey: f.shakeKey + 1 }));
      setVs((v) => ({ ...v, shakeKey: v.shakeKey + 1 }));
      showFieldNotice(message, detail, "error");
    },
    [showFieldNotice],
  );

  const clearFieldNotice = useCallback(() => {
    setFieldNotice(null);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
  }, []);

  const submitClassic = useCallback(() => {
    if (classic.status !== "playing") return;
    const guess = rowWord(classic.slots);
    if (!rowComplete(classic.slots)) {
      flashInvalid("A few more letters", "Fill every ceramic tile to complete the word.");
      return;
    }
    if (!isValidWord(guess, length)) {
      flashInvalid(`“${guess.toUpperCase()}” isn't in our lexicon`, "The Enter key checks every guess against 40,000+ words.");
      return;
    }

    const maxGuesses = classic.maxGuesses ?? 6;
    const states = evaluateGuess(guess, classic.word);
    const evaluation: Evaluation = { word: guess, states, guessedAt: Date.now() };
    const nextGuesses = [...classic.guesses, evaluation];
    const won = guess === classic.word;
    const lost = !won && nextGuesses.length >= maxGuesses;
    setClassic((c) => ({
      ...c,
      guesses: nextGuesses,
      slots: rowWithReveals(length, c.reveals),
      cursor: firstOpen(rowWithReveals(length, c.reveals), new Set(c.reveals.map((r) => r.index))),
      shakeKey: c.shakeKey,
      status: won ? "won" : lost ? "lost" : "playing",
    }));

    states.forEach((state, index) => {
      window.setTimeout(() => sound.flip(state as TileStatus, index), index * 120);
    });
    window.setTimeout(() => sound.haptic([10, 24, 10]), states.length * 90);

    if (won) {
      const guessCount = nextGuesses.length;
      const level = session.kind === "journey" ? levelById(session.levelId) : undefined;
      const isDaily = session.kind === "daily";
      const stars = level ? starsFor(level, guessCount, classic.hintsUsed) : undefined;
      const journeyFirst = level ? !progressRef.current.journey.stars[level.id] : false;
      const chapter = level ? chapterForLevel(level.id) : null;
      const chapterProgress = chapter
        ? chapter.levels.filter((l) => (progressRef.current.journey.stars[l.id] ?? 0) > 0).length
        : 0;
      const chapterBonus = chapter && chapterProgress === chapter.levels.length - 1 ? 110 : 0;
      const journeyBonus = (level ? (journeyFirst ? level.dew : 6) : 0) + chapterBonus;
      const dailyBonus = isDaily ? 30 : 0;
      const baseReward =
        18 +
        Math.max(0, 6 - guessCount) * 3 +
        Math.min(progressRef.current.stats.currentStreak, 4) * 2 +
        (length === 6 ? 6 : 0) +
        (classic.hintsUsed === 0 ? 4 : 0);
      const reward = baseReward + journeyBonus + dailyBonus;
      const xpEarned = 35 + (6 - guessCount) * 6 + (length === 6 ? 15 : 0) + (level ? 20 : 0) + (isDaily ? 15 : 0);
      const pollenGain = 2 + (level && journeyFirst ? level.pollen : 0) + (isDaily ? 8 : 0) + (chapterBonus ? 20 : 0);
      const isNew = !hasSpecimen(progressRef.current.collection, classic.word, length);
      const roundTitle = level ? level.name : isDaily ? "Daily Bloom" : `${length} letters`;
      const journeyXp = level ? 4 : 0;
      setClassic((c) => ({ ...c, earned: reward, xpEarned }));
      setLastRound({
        win: true,
        word: classic.word,
        length,
        attempts: guessCount,
        newSpecimens: isNew ? 1 : 0,
        bonusDew: journeyBonus + dailyBonus,
        stars,
        journeyCleared: Boolean(level && journeyFirst),
        daily: isDaily,
        title: roundTitle,
        chapterCleared: chapterBonus && chapter ? chapter.title : undefined,
        nextLevel: level ? JOURNEY_LEVELS[level.number]?.name : undefined,
      });
      commit((p) => {
        const nextStars = level
          ? { ...p.journey.stars, [level.id]: Math.max(p.journey.stars[level.id] ?? 0, stars ?? 1) }
          : p.journey.stars;
        const completed = level ? JOURNEY_LEVELS.filter((l) => (nextStars[l.id] ?? 0) > 0).length : p.journey.completed;
        let next: ProgressState = {
          ...p,
          dewdrops: p.dewdrops + reward,
          xp: p.xp + xpEarned,
          companionXp: p.companionXp + 10 + journeyXp + (isDaily ? 6 : 0),
          journey: { stars: nextStars, completed },
          stats: {
            ...p.stats,
            played: p.stats.played + 1,
            wins: p.stats.wins + 1,
            currentStreak: p.stats.currentStreak + 1,
            bestStreak: Math.max(p.stats.bestStreak, p.stats.currentStreak + 1),
            guessDistribution: p.stats.guessDistribution.map((n, i) => (i === guessCount ? n + 1 : n)),
            twoGuessWins: p.stats.twoGuessWins + (guessCount <= 2 ? 1 : 0),
            sixLetterWins: p.stats.sixLetterWins + (length === 6 ? 1 : 0),
            hintsFreeWins: p.stats.hintsFreeWins + (classic.hintsUsed === 0 ? 1 : 0),
            totalDewdropsEarned: p.stats.totalDewdropsEarned + reward,
          },
          history: [
            {
              date: new Date().toISOString(),
              mode: "classic" as Mode,
              won: true,
              detail:
                session.kind === "journey"
                  ? `Journey · ${roundTitle} · ${guessCount} guesses`
                  : isDaily
                    ? `Daily Bloom · ${guessCount} guesses`
                    : `${length} letters · ${guessCount} guesses`,
              dewdrops: reward,
            },
            ...p.history,
          ].slice(0, 12),
          collection: addSpecimen(p.collection, classic.word, length, guessCount, isDaily ? "daily" : "classic"),
          activity: noteActivity(p.activity, 1, 1, reward),
          dailyBloom: isDaily
            ? {
                lastSolved: dayKey(),
                completed: p.dailyBloom.completed + 1,
                bestGuesses:
                  p.dailyBloom.bestGuesses === null ? guessCount : Math.min(p.dailyBloom.bestGuesses, guessCount),
              }
            : p.dailyBloom,
        };
        next = {
          ...next,
          quests: bumpQuestProgress(
            { ...next.quests, pollen: next.quests.pollen + pollenGain },
            {
              solve: 1,
              few_win: guessCount <= 4 ? 1 : 0,
              six_win: length === 6 ? 1 : 0,
              hintfree: classic.hintsUsed === 0 ? 1 : 0,
              dew: reward,
              journey: level ? 1 : 0,
              daily: isDaily ? 1 : 0,
            },
          ),
        };
        return next;
      });
      const token = roundToken.current;
      window.setTimeout(() => {
        if (roundToken.current !== token) return;
        setResultOpen(true);
        sound.win();
      }, 700);
      if (chapterBonus && chapter)
        window.setTimeout(() => {
          notify(`Chapter complete · ${chapter.title}`, {
            tone: "reward",
            icon: "flower",
            detail: `All four stones placed. +110 dew and +20 pollen gathered.`,
          });
        }, 1500);
    } else if (lost) {
      const level = session.kind === "journey" ? levelById(session.levelId) : undefined;
      const roundTitle = level ? level.name : session.kind === "daily" ? "Daily Bloom" : `${length} letters`;
      setLastRound({
        win: false,
        word: classic.word,
        length,
        attempts: nextGuesses.length,
        newSpecimens: 0,
        bonusDew: 0,
        daily: session.kind === "daily",
        title: roundTitle,
      });
      commit((p) => ({
        ...p,
        stats: {
          ...p.stats,
          played: p.stats.played + 1,
          currentStreak: 0,
          guessDistribution: p.stats.guessDistribution.map((n, i) => (i === 6 ? n + 1 : n)),
        },
        history: [
          {
            date: new Date().toISOString(),
            mode: "classic" as Mode,
            won: false,
            detail:
              session.kind === "journey"
                ? `Journey · ${roundTitle} · path paused`
                : `${length} letters · out of guesses`,
            dewdrops: 0,
          },
          ...p.history,
        ].slice(0, 12),
        activity: noteActivity(p.activity, 1, 0, 0),
      }));
      const token = roundToken.current;
      window.setTimeout(() => {
        if (roundToken.current !== token) return;
        setResultOpen(true);
        sound.lose();
      }, 760);
    }
  }, [classic.guesses, classic.hintsUsed, classic.maxGuesses, classic.reveals, classic.slots, classic.status, classic.word, commit, flashInvalid, length, session]);

  const submitFever = useCallback(() => {
    if (fever.phase !== "playing" || fever.status !== "playing") return;
    const guess = rowWord(fever.slots);
    if (!rowComplete(fever.slots)) {
      flashInvalid("A few more letters", "Fill every tile before checking.");
      return;
    }
    if (!isValidWord(guess, length)) {
      flashInvalid(`“${guess.toUpperCase()}” isn't in our lexicon`, "Try a more familiar arrangement.");
      return;
    }
    const states = evaluateGuess(guess, fever.word);
    const evaluation: Evaluation = { word: guess, states, guessedAt: Date.now() };
    const won = guess === fever.word;
    const outOfGuesses = !won && fever.guesses.length + 1 >= 6;
    const nextCombo = won ? fever.combo + 1 : 0;
    const multiplier = feverMultiplierFor(nextCombo);

    states.forEach((state, index) => window.setTimeout(() => sound.flip(state, index), index * 100));
    sound.haptic([8, 20, 8]);

    if (won) {
      const gained = Math.round(100 * multiplier + Math.max(0, Math.round(fever.timeLeft)) * 2);
      setFever((f) => ({
        ...f,
        guesses: [...f.guesses, evaluation],
        slots: emptySlots(length),
        cursor: 0,
        status: "solved",
        score: f.score + gained,
        solved: f.solved + 1,
        combo: nextCombo,
        bestCombo: Math.max(f.bestCombo, nextCombo),
        comboExpires: Date.now() + 8000,
        timeLeft: Math.min(99, f.timeLeft + 10),
        lastWord: f.word,
        lastGain: gained,
        lastBonus: 10,
        flashKey: f.flashKey + 1,
        solvedWords: [...f.solvedWords, { word: f.word, guesses: f.guesses.length + 1 }],
      }));
      sound.feverSolve(nextCombo);
    } else if (outOfGuesses) {
      setFever((f) => ({
        ...f,
        guesses: [...f.guesses, evaluation],
        slots: emptySlots(length),
        cursor: 0,
        status: "skipped",
        combo: 0,
        comboExpires: 0,
        lastWord: f.word,
        lastGain: 0,
        lastBonus: 0,
        flashKey: f.flashKey + 1,
      }));
      sound.lose();
    } else {
      setFever((f) => ({ ...f, guesses: [...f.guesses, evaluation], slots: emptySlots(length), cursor: 0 }));
    }
  }, [fever, flashInvalid, length]);

  const vsSubmit = useCallback(() => {
    if (vs.phase !== "playP1" && vs.phase !== "playP2") return;
    const guess = rowWord(vs.slots);
    if (!rowComplete(vs.slots)) {
      flashInvalid("A few more letters", "Fill every tile before checking.");
      return;
    }
    if (!isValidWord(guess, length)) {
      flashInvalid(`“${guess.toUpperCase()}” isn't in our lexicon`, "Secrets must be everyday words.");
      return;
    }
    const states = evaluateGuess(guess, vs.secret);
    const evaluation: Evaluation = { word: guess, states, guessedAt: Date.now() };
    const nextGuesses = [...vs.guesses, evaluation];
    const won = guess === vs.secret;
    states.forEach((state, index) => window.setTimeout(() => sound.flip(state, index), index * 110));

    if (!won && nextGuesses.length < 6) {
      setVs((v) => ({ ...v, guesses: nextGuesses, slots: emptySlots(length), cursor: 0 }));
      return;
    }

    const elapsed = Math.max(1, Math.round((Date.now() - vs.startedAt) / 1000));
    const roundWinner = won ? vs.solver : vs.setter;
    const scores = {
      p1: vs.scores.p1 + (roundWinner === 1 ? 1 : 0),
      p2: vs.scores.p2 + (roundWinner === 2 ? 1 : 0),
    };
    const winsNeeded = Math.ceil(vs.bestOf / 2);
    const matchWinner = scores.p1 >= winsNeeded ? 1 : scores.p2 >= winsNeeded ? 2 : null;
    const reward = won ? 26 : 8;
    const xpGain = won ? 48 : 16;

    setVs((v) => ({
      ...v,
      guesses: nextGuesses,
      slots: emptySlots(length),
      cursor: 0,
      elapsed,
      roundWinner,
      solvedIn: won ? nextGuesses.length : null,
      scores,
      phase: matchWinner ? "matchResult" : "roundResult",
      matchWinner,
    }));

    commit((p) => {
      let next: ProgressState = {
        ...p,
        dewdrops: p.dewdrops + reward,
        xp: p.xp + xpGain,
        companionXp: p.companionXp + (won ? 8 : 3),
        collection: won ? addSpecimen(p.collection, vs.secret, length, nextGuesses.length, "versus") : p.collection,
        activity: noteActivity(p.activity, 1, won ? 1 : 0, reward),
        stats: {
          ...p.stats,
          played: p.stats.played + 1,
          totalDewdropsEarned: p.stats.totalDewdropsEarned + reward,
          versusPlayed: p.stats.versusPlayed + (matchWinner ? 1 : 0),
          versusWins: p.stats.versusWins + (matchWinner ? 1 : 0),
        },
        history: [
          {
            date: new Date().toISOString(),
            mode: "versus" as Mode,
            won,
            detail: `Player ${roundWinner} took round ${vs.round}${matchWinner ? " · match settled" : ""}`,
            dewdrops: reward,
          },
          ...p.history,
        ].slice(0, 12),
      };
      next = {
        ...next,
        quests: bumpQuestProgress(
          { ...next.quests, pollen: next.quests.pollen + (won ? 2 : 0) },
          { duel: 1, solve: won ? 1 : 0, few_win: won && nextGuesses.length <= 4 ? 1 : 0, dew: reward },
        ),
      };
      return next;
    });

    if (won) {
      sound.win();
    } else {
      sound.lose();
    }
  }, [commit, flashInvalid, length, vs]);

  const submit = useCallback(() => {
    if (mode === "classic") submitClassic();
    else if (mode === "fever") submitFever();
    else vsSubmit();
  }, [mode, submitClassic, submitFever, vsSubmit]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "Enter") {
        submit();
      } else if (key === "Backspace" || key === "Del") {
        backspace();
      } else if (/^[a-zA-Z]$/.test(key)) {
        appendLetter(key.toLowerCase());
      }
    },
    [appendLetter, backspace, submit],
  );

  const useGale = useCallback(() => {
    if (mode !== "classic" || classic.status !== "playing") {
      notify("Gale is a Zen Classic whisper", { tone: "neutral", icon: "wind" });
      return;
    }
    const targets = coldLetters(classic.guesses, classic.word, classic.eliminated);
    if (targets.length === 0) {
      notify("The keyboard is already clear", { tone: "neutral", icon: "wind" });
      return;
    }
    const useCharge = progressRef.current.galeCharges > 0;
    if (!useCharge && progressRef.current.dewdrops < 50) {
      notify("You need 50 dewdrops for Gale", { tone: "error", icon: "drop", detail: "Visit the Atelier to top up." });
      openSheet("shop");
      return;
    }
    setClassic((c) => ({ ...c, eliminated: [...c.eliminated, ...targets], hintsUsed: c.hintsUsed + 1 }));
    commit((p) => ({
      ...p,
      galeCharges: useCharge ? p.galeCharges - 1 : p.galeCharges,
      dewdrops: useCharge ? p.dewdrops : p.dewdrops - 50,
    }));
    sound.gale();
    showFieldNotice(`Gale clears ${targets.map((t) => t.toUpperCase()).join(" · ")}`, "Those letters are not in the word.", "success");
  }, [classic.eliminated, classic.guesses, classic.status, classic.word, commit, mode, notify, openSheet, showFieldNotice]);

  const useSunbeam = useCallback(() => {
    if (mode !== "classic" || classic.status !== "playing") {
      notify("Sunbeam is a Zen Classic whisper", { tone: "neutral", icon: "sun" });
      return;
    }
    const options = unrevealedLetters(classic.word, classic.guesses, classic.reveals.map((r) => r.index));
    if (options.length === 0) {
      notify("Every letter is already in the light", { tone: "neutral", icon: "sun" });
      return;
    }
    const useCharge = progressRef.current.sunbeamCharges > 0;
    if (!useCharge && progressRef.current.dewdrops < 100) {
      notify("You need 100 dewdrops for Sunbeam", { tone: "error", icon: "drop", detail: "The Atelier has bundles." });
      openSheet("shop");
      return;
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    setClassic((c) => {
      const slots = [...c.slots];
      slots[pick.index] = pick.letter;
      const pinned = new Set([...c.reveals.map((r) => r.index), pick.index]);
      const cursor = firstOpen(slots, pinned, pick.index + 1);
      return {
        ...c,
        reveals: [...c.reveals, pick],
        slots,
        cursor: cursor >= 0 ? cursor : Math.min(pick.index + 1, length - 1),
        hintsUsed: c.hintsUsed + 1,
      };
    });
    commit((p) => ({
      ...p,
      sunbeamCharges: useCharge ? p.sunbeamCharges - 1 : p.sunbeamCharges,
      dewdrops: useCharge ? p.dewdrops : p.dewdrops - 100,
    }));
    sound.sunbeam();
    showFieldNotice(
      `Sunbeam lights ${pick.letter.toUpperCase()} in position ${pick.index + 1}`,
      "Pinned in place — keep it for every guess.",
      "success",
    );
    void notify;
  }, [classic.guesses, classic.reveals, classic.status, classic.word, commit, length, mode, notify, openSheet, showFieldNotice]);

  const beginFever = useCallback(() => {
    const word = drawFresh(length);
    setFever({ ...emptyFever(word, length), phase: "playing", startedAt: Date.now() });
    setResultOpen(false);
    sound.reward();
  }, [drawFresh, length]);

  const finishFever = useCallback(() => {
    setFever((f) => (f.phase === "playing" ? { ...f, phase: "ended", timeLeft: Math.max(0, f.timeLeft) } : f));
  }, []);

  const loadNextFeverWord = useCallback(() => {
    const word = drawFresh(length);
    setFever((f) => ({
      ...f,
      word,
      guesses: [],
      slots: emptySlots(length),
      cursor: 0,
      status: "playing",
      lastWord: "",
      lastGain: 0,
      lastBonus: 0,
      startedAt: Date.now(),
    }));
  }, [drawFresh, length]);

  // Countdown + combo decay
  useEffect(() => {
    if (fever.phase !== "playing" || resultOpen || activeSheet) return;
    const interval = window.setInterval(() => {
      setFever((f) => {
        if (f.phase !== "playing") return f;
        const timeLeft = Math.max(0, f.timeLeft - 0.25);
        const combo = f.comboExpires > 0 && Date.now() > f.comboExpires ? 0 : f.combo;
        return {
          ...f,
          timeLeft,
          combo,
          phase: timeLeft <= 0 ? "ended" : f.phase,
        };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [fever.phase, resultOpen, activeSheet]);

  // Next word after a solve or skip
  useEffect(() => {
    if (fever.phase !== "playing" || fever.status === "playing") return;
    const timer = window.setTimeout(loadNextFeverWord, 850);
    return () => clearTimeout(timer);
  }, [fever.status, fever.flashKey, fever.phase, loadNextFeverWord]);

  // Settle a finished Fever run exactly once
  useEffect(() => {
    if (fever.phase !== "ended" || fever.settled) return;
    setFever((f) => ({ ...f, settled: true }));
    const dewdrops = fever.solved * 6 + Math.round(fever.score / 200);
    const xpGain = fever.solved * 14 + Math.round(fever.score / 50);
    const solvedWords = fever.solvedWords;
    const newSpecimens = solvedWords.filter((w) => !hasSpecimen(progressRef.current.collection, w.word, length)).length;
    setLastRound({
      win: fever.solved > 0,
      word: fever.lastWord || solvedWords[solvedWords.length - 1]?.word || "",
      length,
      attempts: 0,
      newSpecimens,
      bonusDew: 0,
      title: "Word Fever",
    });
    commit((p) => {
      let collection = p.collection;
      for (const entry of solvedWords) collection = addSpecimen(collection, entry.word, length, entry.guesses, "fever");
      let next: ProgressState = {
        ...p,
        dewdrops: p.dewdrops + dewdrops,
        xp: p.xp + xpGain,
        companionXp: p.companionXp + fever.solved * 8,
        collection,
        activity: noteActivity(p.activity, fever.solved, fever.solved, dewdrops),
        stats: {
          ...p.stats,
          played: p.stats.played + fever.solved,
          wins: p.stats.wins + fever.solved,
          feverBest: Math.max(p.stats.feverBest, fever.solved),
          feverWordsTotal: p.stats.feverWordsTotal + fever.solved,
          totalDewdropsEarned: p.stats.totalDewdropsEarned + dewdrops,
        },
        history: [
        {
          date: new Date().toISOString(),
          mode: "fever" as Mode,
          won: fever.solved > 0,
            detail: `${fever.solved} words · ${fever.score} points`,
            dewdrops,
          },
          ...p.history,
        ].slice(0, 12),
      };
      next = {
        ...next,
        quests: bumpQuestProgress(
          { ...next.quests, pollen: next.quests.pollen + fever.solved + 2 },
          {
            solve: fever.solved,
            fever_words: fever.solved,
            fever_run: 1,
            dew: dewdrops,
            six_win: length === 6 ? fever.solved : 0,
          },
        ),
      };
      return next;
    });
    setResultOpen(true);
    if (fever.solved > 0) sound.win();
    else sound.lose();
  }, [commit, fever.phase, fever.settled, fever.solved, fever.solvedWords, fever.score, fever.lastWord, length]);

  /********* VS Mode *********/
  const vsStart = useCallback(
    (bestOf: 3 | 5) => {
      setVs({ ...emptyVersus(length), bestOf, phase: "setP1", setter: 1, solver: 2 });
      setResultOpen(false);
      sound.reward();
    },
    [length],
  );

  const vsSetSecret = useCallback(
    (word: string) => {
      const clean = word.trim().toLowerCase();
      if (clean.length !== length) return { ok: false, error: `Your secret needs ${length} letters.` };
      if (!isValidWord(clean, length)) return { ok: false, error: "That word isn't in the lexicon yet." };
      setVs((v) => ({
        ...v,
        secret: clean,
        phase: v.setter === 1 ? "handoffP1" : "handoffP2",
        guesses: [],
        slots: emptySlots(length),
        cursor: 0,
      }));
      sound.reward();
      return { ok: true };
    },
    [length],
  );

  const vsHandoff = useCallback(() => {
    setVs((v) => {
      if (v.phase === "handoffP1" || v.phase === "handoffP2") {
        return {
          ...v,
          phase: v.phase === "handoffP1" ? "playP2" : "playP1",
          guesses: [],
          slots: emptySlots(length),
          cursor: 0,
          startedAt: Date.now(),
          elapsed: 0,
        };
      }
      return v;
    });
    sound.click();
  }, []);

  const vsNextRound = useCallback(() => {
    setVs((v) => {
      if (v.phase === "matchResult") return v;
      return {
        ...v,
        round: v.round + 1,
        setter: v.setter === 1 ? 2 : 1,
        solver: v.solver === 1 ? 2 : 1,
        secret: "",
        guesses: [],
        slots: emptySlots(length),
        cursor: 0,
        roundWinner: null,
        solvedIn: null,
        elapsed: 0,
        phase: v.setter === 1 ? "setP2" : "setP1",
      };
    });
    sound.click();
  }, []);

  const vsExit = useCallback(() => {
    setVs(emptyVersus(length));
    sound.sheet(false);
  }, [length]);

  useEffect(() => {
    if (vs.phase !== "playP1" && vs.phase !== "playP2") return;
    const interval = window.setInterval(() => {
      setVs((v) => ({
        ...v,
        elapsed: Math.max(0, Math.floor((Date.now() - v.startedAt) / 1000)),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [vs.phase]);

  // Clear empty rows queued on new versus rounds
  useEffect(() => {
    if (vs.phase === "setP1" || vs.phase === "setP2") {
      setVs((v) => (v.guesses.length || v.slots.some(Boolean) ? { ...v, guesses: [], slots: emptySlots(length), cursor: 0, roundWinner: null } : v));
    }
  }, [vs.phase]);

  const claimDaily = useCallback(() => {
    if (progressRef.current.daily.claimedToday) {
      notify("Today's dewdrop is already gathered", { tone: "neutral", icon: "drop" });
      return;
    }
    const streak = nextStreakFor(progressRef.current.daily);
    const reward = dailyRewardFor(progressRef.current);
    commit((p) => {
      let next: ProgressState = {
        ...p,
        dewdrops: p.dewdrops + reward,
        xp: p.xp + 12,
        daily: {
          lastClaim: dayKey(),
          streak,
          bestStreak: Math.max(p.daily.bestStreak, streak),
          claimedToday: true,
        },
        quests: { ...p.quests, pollen: p.quests.pollen + 4 },
        stats: { ...p.stats, totalDewdropsEarned: p.stats.totalDewdropsEarned + reward },
      };
      next = { ...next, quests: bumpQuestProgress(next.quests, { dew: reward }) };
      return next;
    });
    sound.reward();
    sound.haptic([12, 30, 16, 30, 24]);
    notify(`Daily gift · +${reward} dewdrops`, {
      tone: "reward",
      icon: "drop",
      detail: `${streak}-day ritual${streak === 1 ? "" : "s"} tending the garden.`,
    });
  }, [commit, notify]);

  const buyTheme = useCallback(
    (theme: ThemeId) => {
      const owned = progressRef.current.ownedThemes.includes(theme);
      if (owned) {
        commit((p) => ({ ...p, theme }));
        sound.reward();
        return;
      }
      const price = theme === "sage" ? 0 : THEME_PRICES[theme as Exclude<ThemeId, "sage">];
      if (progressRef.current.dewdrops < price) {
        notify("Not enough dewdrops yet", { tone: "error", icon: "drop", detail: "Solve rituals and claim the daily gift." });
        sound.invalid();
        return;
      }
      commit((p) => ({
        ...p,
        dewdrops: p.dewdrops - price,
        ownedThemes: [...p.ownedThemes, theme],
        theme,
      }));
      sound.reward();
      notify("New atmosphere unfurled", { tone: "success", icon: "sparkle" });
    },
    [commit, notify],
  );

  const equipTheme = useCallback(
    (theme: ThemeId) => {
      if (!progressRef.current.ownedThemes.includes(theme)) {
        buyTheme(theme);
        return;
      }
      commit((p) => ({ ...p, theme }));
      sound.click();
    },
    [buyTheme, commit],
  );

  const buyCharges = useCallback(
    (kind: "gale" | "sunbeam", qty: number, price: number) => {
      if (progressRef.current.dewdrops < price) {
        notify("Not enough dewdrops yet", { tone: "error", icon: "drop", detail: "Try the daily gift or a Fever run." });
        sound.invalid();
        return;
      }
      commit((p) => ({
        ...p,
        dewdrops: p.dewdrops - price,
        galeCharges: p.galeCharges + (kind === "gale" ? qty : 0),
        sunbeamCharges: p.sunbeamCharges + (kind === "sunbeam" ? qty : 0),
      }));
      sound.reward();
      notify(`${qty > 1 ? `${qty}× ` : ""}${kind === "gale" ? "Gale" : "Sunbeam"} tucked away`, {
        tone: "reward",
        icon: kind === "gale" ? "wind" : "sun",
      });
    },
    [commit, notify],
  );

  const updateSettings = useCallback(
    (patch: Partial<Pick<ProgressState, "sound" | "haptics" | "tileSymbols">>) => {
      commit((p) => ({ ...p, ...patch }));
      sound.click();
    },
    [commit],
  );

  const claimQuest = useCallback(
    (kind: "daily" | "weekly", id: string) => {
      let claimed: { reward: number; pollen: number; title: string } | null = null;
      commit((p) => {
        const view = questViews(p.quests, kind).find((v) => v.def.id === id);
        if (!view || !view.ready || view.claimed) return p;
        claimed = { reward: view.def.reward, pollen: view.def.pollen, title: view.def.title };
        return {
          ...p,
          dewdrops: p.dewdrops + view.def.reward,
          xp: p.xp + 10,
          stats: { ...p.stats, totalDewdropsEarned: p.stats.totalDewdropsEarned + view.def.reward },
          quests: {
            ...p.quests,
            pollen: p.quests.pollen + view.def.pollen,
            claimedDaily: kind === "daily" ? [...p.quests.claimedDaily, id] : p.quests.claimedDaily,
            claimedWeekly: kind === "weekly" ? [...p.quests.claimedWeekly, id] : p.quests.claimedWeekly,
          },
        };
      });
      window.setTimeout(() => {
        if (!claimed) return;
        sound.reward();
        notify(`Quest gathered · +${claimed.reward} dew`, {
          tone: "reward",
          icon: "leaf",
          detail: `+${claimed.pollen} pollen for the Bloom track.`,
        });
      }, 0);
    },
    [commit, notify],
  );

  const claimBloomTier = useCallback(
    (index: number) => {
      const tier = BLOOM_TIERS[index];
      if (!tier) return;
      let ok = false;
      commit((p) => {
        if (p.quests.claimedTiers.includes(index) || p.quests.pollen < tier.at) return p;
        ok = true;
        return {
          ...p,
          dewdrops: p.dewdrops + (tier.dew ?? 0),
          galeCharges: p.galeCharges + (tier.gale ?? 0),
          sunbeamCharges: p.sunbeamCharges + (tier.sunbeam ?? 0),
          stats: { ...p.stats, totalDewdropsEarned: p.stats.totalDewdropsEarned + (tier.dew ?? 0) },
          quests: { ...p.quests, claimedTiers: [...p.quests.claimedTiers, index] },
        };
      });
      window.setTimeout(() => {
        if (!ok) return;
        sound.reward();
        sound.haptic([12, 30, 20]);
        notify(`Bloom tier · ${tier.label}`, { tone: "reward", icon: "sparkle", detail: "Gathered from the weekly garden." });
      }, 0);
    },
    [commit, notify],
  );

  const startJourneyLevel = useCallback(
    (levelId: string) => {
      const level = levelById(levelId);
      if (!level) return;
      if (!isLevelUnlocked(levelId, progressRef.current.journey.stars)) {
        notify("The path is still sleeping", {
          tone: "neutral",
          icon: "leaf",
          detail: "Clear the previous stone to wake this one.",
        });
        return;
      }
      roundToken.current += 1;
      const word = drawFresh(level.length);
      setLength(level.length);
      setMode("classic");
      setSession({ kind: "journey", levelId, title: level.name, maxGuesses: level.maxGuesses });
      setClassic(emptyClassic(word, level.maxGuesses, level.length));
      setLastRound(null);
      setResultOpen(false);
      setActiveSheet(null);
      sound.reward();
      notify(`Journey · ${level.name}`, {
        tone: "neutral",
        icon: "leaf",
        detail: `${level.length} letters · solve within ${level.maxGuesses} guesses · par ${level.par}`,
      });
    },
    [drawFresh, notify],
  );

  const startDailyBloom = useCallback(() => {
    const daily = dailySolution(todayKey());
    if (progressRef.current.dailyBloom.lastSolved === todayKey()) {
      notify("Today's bloom is already pressed", {
        tone: "neutral",
        icon: "flower",
        detail: "A new shared puzzle arrives at midnight.",
      });
      setActiveSheet("quests");
      return;
    }
    roundToken.current += 1;
    setLength(daily.length);
    setMode("classic");
    setSession({ kind: "daily", title: "Daily Bloom", maxGuesses: 6 });
    setClassic(emptyClassic(daily.word, 6, daily.length));
    setLastRound(null);
    setResultOpen(false);
    setActiveSheet(null);
    sound.reward();
    notify("Daily Bloom", {
      tone: "success",
      icon: "flower",
      detail: `${daily.length} letters · everyone shares today's word · +30 dew bonus`,
    });
  }, [notify]);

  const exitSession = useCallback(() => {
    roundToken.current += 1;
    const word = drawFresh(length);
    setClassic(emptyClassic(word, 6, length));
    setSession({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
    setResultOpen(false);
    setActiveSheet(null);
    sound.click();
  }, [drawFresh, length]);

  const advanceAfterClassic = useCallback(() => {
    setResultOpen(false);
    if (session.kind === "journey") {
      if (lastRound?.win) {
        openSheet("journey");
      } else if (session.levelId) {
        startJourneyLevel(session.levelId);
      } else {
        newPuzzle();
      }
      return;
    }
    newPuzzle();
  }, [lastRound?.win, newPuzzle, openSheet, session, startJourneyLevel]);

  const setName = useCallback(
    (name: string) => {
      const clean = name.trim().slice(0, 16) || "Wanderer";
      commit((p) => ({ ...p, name: clean }));
      sound.click();
    },
    [commit],
  );

  const buyGlaze = useCallback(
    (glaze: GlazeId) => {
      const owned = progressRef.current.ownedGlazes.includes(glaze);
      if (owned) {
        commit((p) => ({ ...p, glaze }));
        sound.reward();
        return;
      }
      const price = GLAZE_PRICES[glaze];
      if (progressRef.current.dewdrops < price) {
        notify("Not enough dewdrops for this glaze", {
          tone: "error",
          icon: "drop",
          detail: "Try the Daily Bloom or a quest.",
        });
        sound.invalid();
        return;
      }
      commit((p) => ({
        ...p,
        dewdrops: p.dewdrops - price,
        ownedGlazes: [...p.ownedGlazes, glaze],
        glaze,
      }));
      sound.reward();
      notify("A new ceramic glaze", { tone: "success", icon: "sparkle", detail: "Your tiles have been re-fired." });
    },
    [commit, notify],
  );

  const equipGlaze = useCallback(
    (glaze: GlazeId) => {
      if (!progressRef.current.ownedGlazes.includes(glaze)) {
        buyGlaze(glaze);
        return;
      }
      commit((p) => ({ ...p, glaze }));
      sound.click();
    },
    [buyGlaze, commit],
  );

  const resetProgress = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    const fresh = defaultProgress();
    setProgress(fresh);
    commit(() => fresh);
    setMode("classic");
    setLength(5);
    setActiveSheet(null);
    roundToken.current += 1;
    const word = drawFresh(5);
    setClassic(emptyClassic(word, 6, 5));
    setFever(emptyFever("", length));
    setVs(emptyVersus(length));
    setSession({ kind: "practice", title: "Zen Classic", maxGuesses: 6 });
    setLastRound(null);
    setResultOpen(false);
    notify("A fresh garden", { tone: "success", icon: "leaf", detail: "All progress has been reset." });
  }, [commit, drawFresh, notify]);

  const dismissIntro = useCallback(() => {
    commit((p) => ({ ...p, seenIntro: true }));
  }, [commit]);

  const closeResult = useCallback(() => setResultOpen(false), []);

  const [meaningOpen, setMeaningOpen] = useState<string | null>(null);
  const openMeaning = useCallback((word: string | null) => {
    setMeaningOpen(word);
    if (word) sound.sheet(true);
  }, []);

  const validation = useMemo(() => {
    const slots = mode === "classic" ? classic.slots : mode === "fever" ? fever.slots : vs.slots;
    const complete = rowComplete(slots);
    const word = rowWord(slots);
    return { complete, valid: complete && isValidWord(word, length), word };
  }, [mode, classic.slots, fever.slots, vs.slots, length]);

  const level = useMemo(() => levelMeta(progress.xp), [progress.xp]);
  const questClaimables = claimableQuestCount(progress.quests);
  const bloomClaimables = claimableBloomCount(progress.quests);
  const bloomDay = todayKey();
  const dailyBloomInfo = useMemo(
    () => ({
      day: bloomDay,
      length: dailySolution(bloomDay).length,
      done: progress.dailyBloom.lastSolved === bloomDay,
      completed: progress.dailyBloom.completed,
      bestGuesses: progress.dailyBloom.bestGuesses,
    }),
    [bloomDay, progress.dailyBloom],
  );
  const feverMultiplier = feverMultiplierFor(fever.combo);
  const comboFuel =
    fever.comboExpires > 0 ? Math.max(0, Math.min(1, (fever.comboExpires - Date.now()) / 8000)) : 0;
  const winsNeeded = Math.ceil(vs.bestOf / 2);
  const puzzleNo = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const day = Math.floor((Date.now() - start.getTime()) / 86400000);
    return 100 + day;
  }, []);

  const value: ControllerValue = {
    progress,
    mode,
    length,
    classic,
    fever,
    vs,
    activeSheet,
    resultOpen,
    toasts,
    level,
    feverMultiplier,
    comboFuel,
    dailyReward: dailyRewardFor(progress),
    winsNeeded,
    puzzleNo,
    dictionarySize: DICTIONARY_SIZE,
    deckSize: solutionDeckSize(length),
    session,
    lastRound,
    questClaimables,
    bloomClaimables,
    dailyBloomInfo,
    notify,
    dismissToast,
    openSheet,
    closeSheet,
    selectMode,
    selectLength,
    typeLetter: appendLetter,
    backspace,
    selectCell,
    fieldNotice,
    clearFieldNotice,
    validation,
    meaningOpen,
    openMeaning,
    submit,
    handleKey,
    newPuzzle,
    useGale,
    useSunbeam,
    beginFever,
    finishFever,
    claimDaily,
    buyTheme,
    equipTheme,
    buyCharges,
    updateSettings,
    resetProgress,
    dismissIntro,
    closeResult,
    vsStart,
    vsSetSecret,
    vsHandoff,
    vsSubmit,
    vsNextRound,
    vsExit,
    claimQuest,
    claimBloomTier,
    startJourneyLevel,
    startDailyBloom,
    exitSession,
    advanceAfterClassic,
    setName,
    buyGlaze,
    equipGlaze,
  };

  return <ControllerContext.Provider value={value}>{children}</ControllerContext.Provider>;
}

export function useGame(): ControllerValue {
  const ctx = useContext(ControllerContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export { ACHIEVEMENTS, dayKey };
