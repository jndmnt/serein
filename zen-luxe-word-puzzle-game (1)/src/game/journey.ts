import type { WordLength } from "./types";

export interface JourneyLevel {
  id: string;
  chapterId: string;
  chapterTitle: string;
  number: number;
  name: string;
  note: string;
  length: WordLength;
  maxGuesses: number;
  par: number;
  dew: number;
  pollen: number;
}

export interface JourneyChapter {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  intro: string;
  levels: JourneyLevel[];
}

type Seed = [name: string, note: string, length: WordLength, maxGuesses: number, par: number];

const CHAPTER_SEEDS: {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  intro: string;
  levels: Seed[];
}[] = [
  {
    id: "ch1",
    numeral: "I",
    title: "First Light",
    subtitle: "Where the garden wakes",
    intro: "Small words, warm light. Learn the language of tiles.",
    levels: [
      ["Dew on Stone", "The very first quiet solve.", 4, 6, 4],
      ["Fern Unfurl", "Let the letters open slowly.", 4, 6, 4],
      ["Quiet Meadow", "A little more attention, a little less noise.", 4, 5, 4],
      ["Morning Hum", "Three guesses for three bright stars.", 4, 4, 3],
    ],
  },
  {
    id: "ch2",
    numeral: "II",
    title: "Still Water",
    subtitle: "A longer exhale",
    intro: "Five letters, one still surface. Let each guess settle before the next.",
    levels: [
      ["River Glass", "Five letters, no hurry.", 5, 6, 4],
      ["Bridge of Moss", "Cross one letter at a time.", 5, 6, 4],
      ["Deep Current", "Four guesses to stay afloat.", 5, 4, 4],
      ["Still Water", "Three guesses. A master's pause.", 5, 3, 3],
    ],
  },
  {
    id: "ch3",
    numeral: "III",
    title: "Amber Hours",
    subtitle: "Honeyed, unhurried",
    intro: "Warmer words for late afternoons. The light gets longer here.",
    levels: [
      ["Amber Light", "A warm five-letter solve.", 5, 6, 4],
      ["Clover Field", "Six letters, soft footing.", 6, 6, 5],
      ["Slow Afternoon", "Five guesses of golden light.", 6, 5, 4],
      ["Golden Hour", "Four guesses before the sun slips.", 6, 4, 4],
    ],
  },
  {
    id: "ch4",
    numeral: "IV",
    title: "Moss & Stone",
    subtitle: "The patient climb",
    intro: "Harder ground. Each level asks for a sharper eye and a calmer mind.",
    levels: [
      ["Stone Garden", "Six letters, weathered edges.", 6, 6, 5],
      ["Cedar Shade", "Four guesses under the canopy.", 6, 4, 4],
      ["Night Fern", "Five guesses in low light.", 6, 5, 4],
      ["Moss Cathedral", "Three guesses. No hints.", 6, 3, 3],
    ],
  },
  {
    id: "ch5",
    numeral: "V",
    title: "River Air",
    subtitle: "Changing currents",
    intro: "Every length returns, shuffled like river stones. Adapt and breathe.",
    levels: [
      ["River Air", "A breezy four-letter solve.", 4, 5, 4],
      ["Driftwood", "Five letters in the current.", 5, 5, 4],
      ["Cloud Shadow", "Six letters, shifting light.", 6, 5, 4],
      ["Wanderer's Rest", "Four letters. Four guesses. Go gently.", 4, 4, 4],
    ],
  },
  {
    id: "ch6",
    numeral: "VI",
    title: "Everbloom",
    subtitle: "For the devoted",
    intro: "The final stretch. Everything you have learned, arranged like flowers.",
    levels: [
      ["Wildflower", "Five letters, wild edges.", 5, 4, 4],
      ["Long Exhale", "Six letters, four guesses.", 6, 4, 4],
      ["Lantern Lake", "Three guesses. A single lantern.", 5, 3, 3],
      ["Everbloom", "The last bloom asks for two.", 6, 3, 2],
    ],
  },
];

export const JOURNEY_CHAPTERS: JourneyChapter[] = CHAPTER_SEEDS.map((chapter, ci) => ({
  ...chapter,
  levels: chapter.levels.map((seed, li) => {
    const [name, note, length, maxGuesses, par] = seed;
    const number = ci * 4 + li + 1;
    return {
      id: `j${String(number).padStart(2, "0")}`,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      number,
      name,
      note,
      length,
      maxGuesses,
      par,
      dew: 32 + ci * 7 + length * 2,
      pollen: 5 + ci,
    };
  }),
}));

export const JOURNEY_LEVELS: JourneyLevel[] = JOURNEY_CHAPTERS.flatMap((c) => c.levels);
export const JOURNEY_MAX_STARS = JOURNEY_LEVELS.length * 3;

export function levelById(id: string | undefined): JourneyLevel | undefined {
  return JOURNEY_LEVELS.find((l) => l.id === id);
}

export function previousLevel(id: string): JourneyLevel | undefined {
  const index = JOURNEY_LEVELS.findIndex((l) => l.id === id);
  return index > 0 ? JOURNEY_LEVELS[index - 1] : undefined;
}

export function isLevelUnlocked(id: string, stars: Record<string, number>): boolean {
  const prev = previousLevel(id);
  if (!prev) return true;
  return (stars[prev.id] ?? 0) > 0;
}

export function nextJourneyLevel(stars: Record<string, number>): JourneyLevel {
  return JOURNEY_LEVELS.find((l) => !(stars[l.id] ?? 0)) ?? JOURNEY_LEVELS[JOURNEY_LEVELS.length - 1];
}

export function starsFor(level: JourneyLevel, guesses: number, hints: number): number {
  if (guesses <= level.par - 1 && hints === 0) return 3;
  if (guesses <= level.par) return 2;
  return 1;
}

export function journeySummary(stars: Record<string, number>) {
  const cleared = JOURNEY_LEVELS.filter((l) => (stars[l.id] ?? 0) > 0).length;
  const totalStars = JOURNEY_LEVELS.reduce((sum, l) => sum + (stars[l.id] ?? 0), 0);
  const perfect = JOURNEY_LEVELS.filter((l) => (stars[l.id] ?? 0) === 3).length;
  return {
    cleared,
    total: JOURNEY_LEVELS.length,
    totalStars,
    maxStars: JOURNEY_MAX_STARS,
    perfect,
    current: nextJourneyLevel(stars),
    chapters: JOURNEY_CHAPTERS.map((chapter) => {
      const chapterCleared = chapter.levels.filter((l) => (stars[l.id] ?? 0) > 0).length;
      const chapterStars = chapter.levels.reduce((sum, l) => sum + (stars[l.id] ?? 0), 0);
      return { chapter, cleared: chapterCleared, stars: chapterStars, max: chapter.levels.length * 3 };
    }),
  };
}

export function chapterForLevel(id: string): JourneyChapter {
  return JOURNEY_CHAPTERS.find((c) => c.levels.some((l) => l.id === id)) ?? JOURNEY_CHAPTERS[0];
}

/** Rank for a given length, based on how many specimens you have pressed. */
export const MASTERY_RANKS = [
  { at: 0, name: "Seedling" },
  { at: 10, name: "Sprout" },
  { at: 25, name: "Wanderer" },
  { at: 50, name: "Cultivator" },
  { at: 90, name: "Wordsmith" },
  { at: 150, name: "Everbloom" },
] as const;

export function masteryFor(count: number) {
  let index = 0;
  for (let i = 0; i < MASTERY_RANKS.length; i++) if (count >= MASTERY_RANKS[i].at) index = i;
  const rank = MASTERY_RANKS[index];
  const next = MASTERY_RANKS[index + 1] ?? null;
  const progress = next ? (count - rank.at) / (next.at - rank.at) : 1;
  return { rank: rank.name, next: next?.name ?? "Everbloom", index, progress: Math.min(1, progress), at: rank.at, nextAt: next?.at ?? null };
}
