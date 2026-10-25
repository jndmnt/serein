import rawWords from "./data/validWords.json";
import { SOLUTIONS } from "./data/solutions";
import type { TileStatus, WordLength } from "./types";

/**
 * Dual dictionary engine.
 *  - VALID: broad ~40,000 word English corpus (4/5/6 letters) — guesses are never unfairly rejected.
 *  - SOLUTIONS: curated, recognizable everyday words for satisfying puzzles.
 *
 * A small blocklist keeps the broad corpus presentable in a commercial setting.
 */
const BLOCKED = new Set([
  "fuck", "fucks", "fucked", "shit", "shits", "cunt", "cunts", "twat", "twats", "piss",
  "pissed", "dick", "dicks", "cock", "cocks", "slut", "sluts", "whore", "whores", "rape",
  "raped", "rapes", "nazi", "nazis", "damn", "damns", "bitch", "bitches", "ass", "asses",
  "arse", "arses", "bollock", "bugger", "wank", "wanks", "wanker", "penis", "vagina",
  "nigga", "niggas", "nigger", "niggers", "faggot", "fag", "fags", "retard", "retards",
  "porn", "porno", "sex", "sexy", "semen", "horny", "busty", "boobs", "titty", "titties",
]);

const LENGTHS: WordLength[] = [4, 5, 6];

const validSets: Record<WordLength, Set<string>> = {
  4: new Set((rawWords["4"] as string[]).filter((w) => !BLOCKED.has(w))),
  5: new Set((rawWords["5"] as string[]).filter((w) => !BLOCKED.has(w))),
  6: new Set((rawWords["6"] as string[]).filter((w) => !BLOCKED.has(w))),
};

const solutionSets: Record<WordLength, Set<string>> = {
  4: new Set(SOLUTIONS[4]),
  5: new Set(SOLUTIONS[5]),
  6: new Set(SOLUTIONS[6]),
};

export const DICTIONARY_SIZE = LENGTHS.reduce((sum, l) => sum + validSets[l].size, 0);

export function isValidWord(word: string, length?: WordLength): boolean {
  const w = word.trim().toLowerCase();
  if (!/^[a-z]+$/.test(w)) return false;
  if (length) return w.length === length ? validSets[length].has(w) || solutionSets[length].has(w) : false;
  const l = w.length as WordLength;
  if (!LENGTHS.includes(l)) return false;
  return validSets[l].has(w) || solutionSets[l].has(w);
}

export function isCuratedSolution(word: string, length: WordLength): boolean {
  return solutionSets[length].has(word.trim().toLowerCase());
}

/** Standard two-pass evaluation with correct duplicate-letter accounting. */
export function evaluateGuess(guess: string, solution: string): TileStatus[] {
  const n = solution.length;
  const result: TileStatus[] = new Array(n).fill("absent");
  const pool: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    const ch = solution[i];
    if (guess[i] === ch) result[i] = "correct";
    else pool[ch] = (pool[ch] ?? 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if ((pool[ch] ?? 0) > 0) {
      result[i] = "present";
      pool[ch] -= 1;
    }
  }
  return result;
}

const RANK: Record<TileStatus, number> = { absent: 1, present: 2, correct: 3 };

export function keyboardStates(guesses: { word: string; states: TileStatus[] }[]): Record<string, TileStatus> {
  const map: Record<string, TileStatus> = {};
  for (const g of guesses) {
    for (let i = 0; i < g.word.length; i++) {
      const ch = g.word[i];
      const st = g.states[i];
      if (!map[ch] || RANK[st] > RANK[map[ch]]) map[ch] = st;
    }
  }
  return map;
}

/** Letters that are gray everywhere and not in the secret word — valid Gale targets. */
export function coldLetters(
  guesses: { word: string; states: TileStatus[] }[],
  solution: string,
  eliminated: string[],
): string[] {
  const known = new Set<string>();
  for (const g of guesses) {
    g.states.forEach((state, i) => {
      if (state !== "absent") known.add(g.word[i]);
    });
  }
  const secret = new Set(solution.split(""));
  const keyboard = keyboardStates(guesses);
  const candidates = new Set<string>();

  for (const g of guesses) {
    for (let i = 0; i < g.word.length; i++) {
      const ch = g.word[i];
      if (g.states[i] === "absent" && !secret.has(ch) && !known.has(ch)) candidates.add(ch);
    }
  }
  for (const [ch, st] of Object.entries(keyboard)) {
    if (st === "absent" && !secret.has(ch) && !known.has(ch)) candidates.add(ch);
  }
  return Array.from(candidates)
    .filter((c) => !eliminated.includes(c))
    .slice(0, 3);
}

/** Sunbeam: an unrevealed correct position with the letter that belongs there. */
export function unrevealedLetters(
  solution: string,
  guesses: { word: string; states: TileStatus[] }[],
  revealed: number[],
): { index: number; letter: string }[] {
  const knownCorrect = new Set<number>(revealed);
  for (const g of guesses) {
    g.states.forEach((s, i) => {
      if (s === "correct") knownCorrect.add(i);
    });
  }
  const options: { index: number; letter: string }[] = [];
  for (let i = 0; i < solution.length; i++) {
    if (!knownCorrect.has(i)) options.push({ index: i, letter: solution[i] });
  }
  return options;
}

const shuffled: Partial<Record<WordLength, string[]>> = {};

/** Seeded Fisher–Yates so the deck feels hand-ordered but stays stable across sessions. */
export function deckFor(length: WordLength): string[] {
  if (shuffled[length]) return shuffled[length]!;
  const list = [...SOLUTIONS[length]];
  let seed = 9277 + length * 613;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  shuffled[length] = list;
  return list;
}

export function drawSolution(
  length: WordLength,
  used: string[],
): { word: string; used: string[]; exhausted: boolean } {
  const deck = deckFor(length);
  const usedSet = new Set(used);
  const remaining = deck.filter((w) => !usedSet.has(w));
  const exhausted = remaining.length === 0;
  const pool = exhausted ? deck : remaining;
  const word = pool[Math.floor(Math.random() * pool.length)] ?? deck[0];
  return { word, used: exhausted ? [word] : [...used, word], exhausted };
}

/** Everyone receives the same Daily Bloom puzzle for a given date. */
export function dailySolution(day: string): { length: WordLength; word: string } {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const seed = h >>> 0;
  const length = ([4, 5, 6] as WordLength[])[seed % 3];
  const deck = SOLUTIONS[length];
  const word = deck[Math.floor(seed / 7) % deck.length];
  return { length, word };
}

export function emptySlots(length: WordLength): (string | null)[] {
  return new Array(length).fill(null);
}

export function firstOpen(slots: (string | null)[], pinned: Set<number>, from = 0): number {
  for (let i = Math.max(0, from); i < slots.length; i++) if (!slots[i] && !pinned.has(i)) return i;
  for (let i = 0; i < slots.length; i++) if (!slots[i] && !pinned.has(i)) return i;
  return -1;
}

/** Type a letter at the cursor, skipping Sunbeam-pinned cells. */
export function insertLetter(
  slots: (string | null)[],
  cursor: number,
  pinned: Set<number>,
  letter: string,
): { slots: (string | null)[]; cursor: number } {
  let index = cursor;
  if (index < 0 || index >= slots.length || pinned.has(index)) {
    index = firstOpen(slots, pinned, cursor);
  }
  if (index < 0) return { slots, cursor };
  const next = [...slots];
  next[index] = letter;
  const after = firstOpen(next, pinned, index + 1);
  return { slots: next, cursor: after >= 0 ? after : Math.min(index + 1, slots.length - 1) };
}

/** Backspace feels natural: clear the cursor cell, else the nearest filled cell before it. */
export function eraseLetter(
  slots: (string | null)[],
  cursor: number,
  pinned: Set<number>,
): { slots: (string | null)[]; cursor: number } {
  const next = [...slots];
  if (cursor >= 0 && cursor < next.length && next[cursor] && !pinned.has(cursor)) {
    next[cursor] = null;
    return { slots: next, cursor };
  }
  for (let i = Math.min(cursor, next.length) - 1; i >= 0; i--) {
    if (next[i] && !pinned.has(i)) {
      next[i] = null;
      return { slots: next, cursor: i };
    }
  }
  return { slots, cursor: Math.max(0, cursor - 1) };
}

export function rowWord(slots: (string | null)[]): string {
  return slots.map((cell) => cell ?? "").join("");
}

export function rowComplete(slots: (string | null)[]): boolean {
  return slots.every((cell) => Boolean(cell));
}

export function solutionDeckSize(length: WordLength): number {
  return SOLUTIONS[length].length;
}

/**
 * Lays revealed Sunbeam letters into the row, then flows typed letters into
 * the remaining slots. Returns null for empty slots so tiles can show a cursor.
 */
export function fillRow(
  current: string,
  reveals: { index: number; letter: string }[],
  length: number,
): (string | null)[] {
  const cells: (string | null)[] = new Array(length).fill(null);
  for (const r of reveals) if (r.index >= 0 && r.index < length) cells[r.index] = r.letter;
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    if (cells[i] === null) {
      if (cursor < current.length) cells[i] = current[cursor++];
    }
  }
  return cells;
}

export function filledWord(current: string, reveals: { index: number; letter: string }[], length: number): string {
  return fillRow(current, reveals, length)
    .map((c) => c ?? "")
    .join("");
}

export { SOLUTIONS };
