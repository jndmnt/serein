import type { GlazeId } from "./types";

export interface Glaze {
  id: GlazeId;
  name: string;
  note: string;
  price: number;
  swatches: string[];
}

/**
 * Tile glazes change the ceramic material only — never the semantics of jade,
 * honey and stone, so readability is preserved across every cosmetic set.
 */
export const GLAZES: Glaze[] = [
  {
    id: "porcelain",
    name: "Oat Porcelain",
    note: "The original warm ceramic.",
    price: 0,
    swatches: ["#fdfaf3", "#f3eee2", "#5d7f64", "#c9a05d"],
  },
  {
    id: "sandstone",
    name: "River Sandstone",
    note: "Sun-warmed, softly grained.",
    price: 420,
    swatches: ["#fbf3e4", "#efe0c8", "#6b8468", "#c29a58"],
  },
  {
    id: "moss",
    name: "Moss Glaze",
    note: "Cool celadon, quiet shine.",
    price: 540,
    swatches: ["#eff3e6", "#dce6d3", "#577c64", "#c1a468"],
  },
  {
    id: "opaline",
    name: "Opaline Mist",
    note: "Pearlescent, almost weightless.",
    price: 680,
    swatches: ["#fbfcf9", "#e9eef0", "#5f7f74", "#c8a874"],
  },
];

export const GLAZE_PRICES: Record<GlazeId, number> = GLAZES.reduce(
  (acc, g) => ({ ...acc, [g.id]: g.price }),
  {} as Record<GlazeId, number>,
);

export function glazeById(id: GlazeId): Glaze {
  return GLAZES.find((g) => g.id === id) ?? GLAZES[0];
}

export interface CompanionStage {
  at: number;
  name: string;
  note: string;
}

export const COMPANION_STAGES: CompanionStage[] = [
  { at: 0, name: "Sleeping seed", note: "A quiet beginning." },
  { at: 45, name: "First sprout", note: "Something stirs in the soil." },
  { at: 120, name: "Tender leaves", note: "It leans toward the light." },
  { at: 260, name: "Rising stem", note: "Reaching, unhurried." },
  { at: 470, name: "Budding", note: "A small green promise." },
  { at: 760, name: "First bloom", note: "The garden notices you." },
  { at: 1150, name: "In flower", note: "Every word becomes weather." },
  { at: 1650, name: "Everbloom", note: "It will never stop growing." },
];

export function companionStage(xp: number) {
  let index = 0;
  for (let i = 0; i < COMPANION_STAGES.length; i++) if (xp >= COMPANION_STAGES[i].at) index = i;
  const stage = COMPANION_STAGES[index];
  const next = COMPANION_STAGES[index + 1] ?? null;
  const floor = stage.at;
  const ceiling = next?.at ?? stage.at + 1;
  return {
    stage,
    index,
    next,
    progress: next ? Math.min(1, (xp - floor) / (ceiling - floor)) : 1,
    xp,
    toNext: next ? Math.max(0, next.at - xp) : 0,
  };
}
