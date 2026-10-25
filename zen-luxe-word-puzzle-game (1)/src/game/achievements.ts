import type { Achievement, ProgressState } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bloom",
    name: "First Bloom",
    description: "Solve your very first puzzle.",
    glyph: "flower",
    metric: "wins",
    target: 1,
  },
  {
    id: "eagle-eye",
    name: "Eagle Eye",
    description: "Find the word in only two guesses.",
    glyph: "eye",
    metric: "twoGuess",
    target: 1,
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Solve 5 words in a single Word Fever run.",
    glyph: "zap",
    metric: "feverWords",
    target: 5,
  },
  {
    id: "zen-master",
    name: "Zen Master",
    description: "Tend a 7-day ritual streak.",
    glyph: "sun",
    metric: "streak",
    target: 7,
  },
  {
    id: "moss-streak",
    name: "Moss Streak",
    description: "Win 5 Classic puzzles in a row.",
    glyph: "leaf",
    metric: "classicStreak",
    target: 5,
  },
  {
    id: "sunchaser",
    name: "Sun Chaser",
    description: "Win a six-letter Master puzzle.",
    glyph: "crown",
    metric: "sixLetter",
    target: 1,
  },
  {
    id: "clear-water",
    name: "Clear Water",
    description: "Win 5 puzzles without using a hint.",
    glyph: "flower",
    metric: "hintsFree",
    target: 5,
  },
  {
    id: "wordsmith",
    name: "Wordsmith",
    description: "Solve 10 puzzles.",
    glyph: "trophy",
    metric: "wins",
    target: 10,
  },
  {
    id: "duelist",
    name: "Duelist",
    description: "Settle a friendly Best-of-Three duel.",
    glyph: "duel",
    metric: "versusWins",
    target: 1,
  },
  {
    id: "devoted",
    name: "Devoted",
    description: "Complete 25 rounds across all modes.",
    glyph: "leaf",
    metric: "played",
    target: 25,
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    description: "Clear five levels of the Journey.",
    glyph: "crown",
    metric: "journey",
    target: 5,
  },
  {
    id: "deep-roots",
    name: "Deep Roots",
    description: "Clear twelve Journey levels.",
    glyph: "leaf",
    metric: "journey",
    target: 12,
  },
  {
    id: "botanist",
    name: "Botanist",
    description: "Press 25 words into the herbarium.",
    glyph: "flower",
    metric: "collection",
    target: 25,
  },
  {
    id: "everbloom",
    name: "Everbloom",
    description: "Collect 75 distinct specimens.",
    glyph: "flower",
    metric: "collection",
    target: 75,
  },
  {
    id: "bloomkeeper",
    name: "Bloomkeeper",
    description: "Tend three Daily Blooms.",
    glyph: "sun",
    metric: "dailyBlooms",
    target: 3,
  },
  {
    id: "pollen-drunk",
    name: "Pollen Collector",
    description: "Gather 200 pollen in one season.",
    glyph: "zap",
    metric: "pollen",
    target: 200,
  },
];

export const ACHIEVEMENT_REWARD = 25;

export function achievementValue(a: Achievement, p: ProgressState): number {
  switch (a.metric) {
    case "wins":
      return p.stats.wins;
    case "twoGuess":
      return p.stats.twoGuessWins;
    case "feverWords":
      return p.stats.feverBest;
    case "streak":
      return p.daily.bestStreak;
    case "classicStreak":
      return p.stats.bestStreak;
    case "sixLetter":
      return p.stats.sixLetterWins;
    case "versusWins":
      return p.stats.versusWins;
    case "hintsFree":
      return p.stats.hintsFreeWins;
    case "played":
      return p.stats.played;
    case "journey":
      return p.journey.completed;
    case "collection":
      return p.collection.length;
    case "dailyBlooms":
      return p.dailyBloom.completed;
    case "pollen":
      return p.quests.pollen;
    default:
      return 0;
  }
}

/** Pure: unlocks any newly earned badges and deposits their dewdrop reward. */
export function applyAchievements(next: ProgressState): ProgressState {
  const unlocked = new Set(next.unlockedAchievements);
  const fresh: string[] = [];

  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && achievementValue(a, next) >= a.target) {
      unlocked.add(a.id);
      fresh.push(a.id);
    }
  }
  if (fresh.length === 0) return next;

  return {
    ...next,
    unlockedAchievements: Array.from(unlocked),
    dewdrops: next.dewdrops + fresh.length * ACHIEVEMENT_REWARD,
    xp: next.xp + fresh.length * 20,
    stats: {
      ...next.stats,
      totalDewdropsEarned: next.stats.totalDewdropsEarned + fresh.length * ACHIEVEMENT_REWARD,
    },
  };
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
