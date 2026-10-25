export type Mode = "classic" | "fever" | "versus";
export type WordLength = 4 | 5 | 6;
export type TileStatus = "correct" | "present" | "absent";
export type ThemeId = "sage" | "rosewood" | "mist" | "honey";
export type GlazeId = "porcelain" | "sandstone" | "moss" | "opaline";

export interface Evaluation {
  word: string;
  states: TileStatus[];
  boosted?: number[];
  guessedAt: number;
}

export interface Reveal {
  index: number;
  letter: string;
}

export interface ToastMessage {
  id: number;
  text: string;
  detail?: string;
  tone: "neutral" | "success" | "error" | "reward";
  icon?: "sparkle" | "drop" | "wind" | "sun" | "leaf" | "flower";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  glyph: "eye" | "zap" | "leaf" | "trophy" | "sun" | "flower" | "duel" | "crown";
  target: number;
  metric:
    | "wins"
    | "twoGuess"
    | "feverWords"
    | "streak"
    | "classicStreak"
    | "sixLetter"
    | "versusWins"
    | "hintsFree"
    | "played"
    | "journey"
    | "collection"
    | "dailyBlooms"
    | "pollen";
}

export interface PlayerStats {
  played: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: number[];
  twoGuessWins: number;
  sixLetterWins: number;
  versusWins: number;
  versusPlayed: number;
  feverBest: number;
  feverWordsTotal: number;
  hintsFreeWins: number;
  fastestSolve: number | null;
  totalDewdropsEarned: number;
}

export interface DailyState {
  lastClaim: string | null;
  streak: number;
  bestStreak: number;
  claimedToday: boolean;
}

export interface CollectionEntry {
  word: string;
  length: WordLength;
  bestGuesses: number;
  times: number;
  firstSolved: string;
  lastSolved: string;
  source: Mode | "daily";
}

export interface JourneyProgress {
  stars: Record<string, number>;
  completed: number;
}

export interface QuestProgressState {
  day: string;
  week: string;
  daily: Record<string, number>;
  weekly: Record<string, number>;
  claimedDaily: string[];
  claimedWeekly: string[];
  pollen: number;
  claimedTiers: number[];
}

export interface DailyBloomState {
  lastSolved: string | null;
  completed: number;
  bestGuesses: number | null;
}

export interface ActivityDay {
  p: number;
  w: number;
  d: number;
}

export interface ProgressState {
  name: string;
  dewdrops: number;
  xp: number;
  stats: PlayerStats;
  daily: DailyState;
  unlockedAchievements: string[];
  usedSolutions: Record<"4" | "5" | "6", string[]>;
  theme: ThemeId;
  ownedThemes: ThemeId[];
  glaze: GlazeId;
  ownedGlazes: GlazeId[];
  sound: boolean;
  haptics: boolean;
  tileSymbols: boolean;
  galeCharges: number;
  sunbeamCharges: number;
  seenIntro: boolean;
  history: { date: string; mode: Mode; won: boolean; detail: string; dewdrops: number }[];
  collection: CollectionEntry[];
  journey: JourneyProgress;
  quests: QuestProgressState;
  dailyBloom: DailyBloomState;
  activity: Record<string, ActivityDay>;
  companionXp: number;
}

export interface VersusState {
  phase:
    | "intro"
    | "setP1"
    | "handoffP1"
    | "playP2"
    | "roundResult"
    | "setP2"
    | "handoffP2"
    | "playP1"
    | "matchResult";
  bestOf: 3 | 5;
  round: number;
  scores: { p1: number; p2: number };
  secret: string;
  setter: 1 | 2;
  solver: 1 | 2;
  guesses: Evaluation[];
  slots: (string | null)[];
  cursor: number;
  startedAt: number;
  elapsed: number;
  roundWinner: 1 | 2 | null;
  solvedIn: number | null;
  matchWinner: 1 | 2 | null;
  shakeKey: number;
}
