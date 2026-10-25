import definitions from "./data/definitions.json";

export interface Meaning {
  word: string;
  pos: string;
  gloss: string;
  example?: string;
  source: "field-notes" | "librarian" | "fallback";
}

type Dict = Record<string, [string, string]>;
const LOCAL = definitions as unknown as Dict;
const CACHE_KEY = "serein.meanings.v1";

function readCache(): Record<string, Meaning> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, Meaning>;
  } catch {
    return {};
  }
}

function writeCache(word: string, meaning: Meaning): void {
  try {
    const cache = readCache();
    cache[word] = meaning;
    const keys = Object.keys(cache);
    if (keys.length > 250) delete cache[keys[0]];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* memory only */
  }
}

export function localMeaning(word: string): Meaning | null {
  const w = word.trim().toLowerCase();
  const hit = LOCAL[w];
  if (hit) return { word: w, pos: hit[0], gloss: hit[1], source: "field-notes" };
  const cached = readCache()[w];
  if (cached) return cached;
  return null;
}

const POS_NAMES: Record<string, string> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  adverb: "adverb",
  pronoun: "pronoun",
  preposition: "preposition",
  conjunction: "conjunction",
  determiner: "determiner",
  interjection: "interjection",
};

/**
 * Field notes are bundled and instant. If a rarer word is missing, the
 * librarian (dictionaryapi.dev) is consulted once and cached offline.
 */
export async function loadMeaning(word: string): Promise<Meaning | null> {
  const w = word.trim().toLowerCase();
  const local = localMeaning(w);
  if (local) return local;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = (await response.json()) as {
      meanings?: { partOfSpeech?: string; definitions?: { definition?: string; example?: string }[] }[];
    }[];
    const meaning = data?.[0]?.meanings?.find((m) => m.definitions?.some((d) => d.definition));
    const definition = meaning?.definitions?.find((d) => d.definition);
    if (!meaning || !definition?.definition) return null;
    const result: Meaning = {
      word: w,
      pos: POS_NAMES[meaning.partOfSpeech ?? ""] ?? meaning.partOfSpeech ?? "word",
      gloss: definition.definition.trim(),
      example: definition.example?.trim(),
      source: "librarian",
    };
    writeCache(w, result);
    return result;
  } catch {
    return null;
  }
}

export function speak(word: string): boolean {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
    utterance.rate = 0.82;
    utterance.pitch = 1.02;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
