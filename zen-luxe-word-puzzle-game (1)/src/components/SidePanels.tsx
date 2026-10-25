import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Droplet,
  Feather,
  Flame,
  Flower2,
  Gift,
  Leaf,
  Map,
  Sparkles,
  Star,
  Swords,
  Timer,
  Trophy,
} from "lucide-react";
import { useGame, dailyRewardFor, todayStreak } from "../game/GameController";
import { companionStage } from "../game/cosmetics";
import { journeySummary, levelById } from "../game/journey";
import { bloomClaims, questViews, type QuestIcon } from "../game/quests";
import { cn } from "../utils/cn";
import { Companion } from "./Companion";
import { Bar, SectionLabel, SparkleField } from "./Primitives";

const ICONS: Record<QuestIcon, typeof Leaf> = {
  drop: Droplet,
  leaf: Leaf,
  eye: Sparkles,
  timer: Timer,
  crown: Trophy,
  sun: Sparkles,
  swords: Swords,
  map: Map,
  flower: Flower2,
  zap: Sparkles,
};

const MODE_META = [
  { id: "classic" as const, name: "Zen Classic", sub: "Six quiet guesses", icon: Feather },
  { id: "fever" as const, name: "Word Fever", sub: "60 seconds of flow", icon: Timer },
  { id: "versus" as const, name: "Friend Duel", sub: "Pass & play secrets", icon: Swords },
];

export function RitualSidebar() {
  const { mode, selectMode, openSheet, progress, level, dailyBloomInfo, startDailyBloom, claimDaily } = useGame();
  const stage = companionStage(progress.companionXp);
  const streak = todayStreak(progress);
  const daily = questViews(progress.quests, "daily");
  const reward = dailyRewardFor(progress);

  return (
    <aside className="no-scrollbar hidden min-h-0 flex-col gap-3 overflow-y-auto pb-2 lg:flex">
      <div className="glass rounded-[24px] p-3">
        <SectionLabel
          action={<Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={1.8} />}
          className="mb-2 px-1"
        >
          Choose a ritual
        </SectionLabel>
        <div className="flex flex-col gap-0.5">
          {MODE_META.map((m) => {
            const active = mode === m.id;
            const Icon = m.icon;
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => selectMode(m.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-[14px] border px-1.5 py-1.5 text-left transition-all",
                  active
                    ? "border-white/80 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_-16px_rgba(45,63,49,0.7)]"
                    : "border-transparent hover:border-white/50 hover:bg-white/30",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-[10px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
                    active
                      ? "border-white/60 bg-gradient-to-br from-[#e4ecdd] to-[#bed0ba] text-[#45634d]"
                      : "border-white/60 bg-white/45 text-[#7b8c7d]",
                  )}
                >
                  <Icon className="h-[14px] w-[14px]" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold leading-tight text-ink">
                    {m.name}
                    {active && <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] font-medium text-muted">{m.sub}</span>
                </span>
                <ChevronRight className={cn("h-3 w-3 shrink-0", active ? "text-[var(--accent)]" : "text-[#a3aea4]")} strokeWidth={2} />
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={() => openSheet("modes")}
          className="mt-1.5 flex w-full items-center justify-center gap-1 border-t border-white/50 pt-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#6b7d6e] transition-colors hover:text-[var(--accent-deep)]"
        >
          Ritual details <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <button
        onClick={() => openSheet("garden")}
        className="glass relative overflow-hidden rounded-[24px] p-3 text-left transition-colors hover:bg-white/40"
      >
        <div className="flex items-start justify-between">
          <SectionLabel>Your garden</SectionLabel>
          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted">LVL {level.level}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="relative -ml-2 h-[62px] w-[62px] shrink-0">
            <Companion xp={progress.companionXp} size={74} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[16px] leading-none text-[#34483a]">{stage.stage.name}</div>
            <div className="mt-1 line-clamp-2 text-[8px] font-medium leading-relaxed text-muted">{stage.stage.note}</div>
            <div className="mt-1 flex items-center gap-1">
              <Bar value={stage.progress} className="h-1 flex-1" />
              <span className="shrink-0 text-[6.5px] font-bold text-[#7f8e78]">{stage.next ? `${stage.toNext} xp` : "max"}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 divide-x divide-[#4c6553]/10 border-t border-white/50 pt-1.5 text-center">
          <div>
            <div className="text-[11px] font-bold tabular-nums text-[#3e5342]">{progress.stats.wins}</div>
            <div className="text-[6.5px] font-bold uppercase tracking-[0.08em] text-muted">wins</div>
          </div>
          <div>
            <div className="text-[11px] font-bold tabular-nums text-[#3e5342]">{progress.collection.length}</div>
            <div className="text-[6.5px] font-bold uppercase tracking-[0.08em] text-muted">pressed</div>
          </div>
          <div>
            <div className="text-[11px] font-bold tabular-nums text-[#3e5342]">{journeySummary(progress.journey.stars).totalStars}</div>
            <div className="text-[6.5px] font-bold uppercase tracking-[0.08em] text-muted">stars</div>
          </div>
        </div>
      </button>

      <div className="glass relative overflow-hidden rounded-[24px] p-3">
        <SectionLabel
          action={
            <span className="flex items-center gap-1 text-[8.5px] font-bold text-[#99813f]">
              <Sparkles className="h-2.5 w-2.5" /> {progress.quests.pollen}
            </span>
          }
        >
          Today
        </SectionLabel>

        <button
          onClick={() => (dailyBloomInfo.done ? openSheet("quests") : startDailyBloom())}
          className={cn(
            "mt-2 flex w-full items-center gap-2 rounded-[14px] border px-2 py-1.5 text-left transition-colors",
            dailyBloomInfo.done
              ? "border-white/60 bg-white/30"
              : "border-[#d9c79f]/70 bg-gradient-to-r from-[#f3e8d1]/85 to-[#e9ecdb]/80 hover:from-[#f6ecd8]",
          )}
        >
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
              dailyBloomInfo.done
                ? "border-white/70 bg-white/45 text-[#72896d]"
                : "border-white/80 bg-gradient-to-br from-[#efdcb8] to-[#d6b77e] text-[#82662f]",
            )}
          >
            {dailyBloomInfo.done ? <Check className="h-3 w-3" strokeWidth={2.6} /> : <Flower2 className="h-3 w-3" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-bold text-[#4a583b]">Daily Bloom</div>
            <div className="truncate text-[7.5px] font-medium text-[#7f886d]">
              {dailyBloomInfo.done ? "Pressed for today" : `${dailyBloomInfo.length} letters · +30 dew`}
            </div>
          </div>
          {!dailyBloomInfo.done && <ArrowRight className="h-3 w-3 text-[#9b8550]" />}
        </button>

        <div className="mt-1.5 flex flex-col gap-1">
          {daily.map((view) => {
            const Icon = ICONS[view.def.icon] ?? Leaf;
            const pct = view.value / view.def.target;
            return (
              <div key={view.def.id} className="flex items-center gap-1.5">
                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-[7px] border border-white/70", view.claimed ? "bg-white/35 text-[#9aa595]" : view.ready ? "bg-[#e3ecd8] text-[#5e7d5d]" : "bg-white/45 text-[#7f917b]")}>
                  <Icon className="h-2.5 w-2.5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={cn("truncate text-[8px] font-semibold", view.claimed ? "text-[#909b8a]" : "text-[#506250]")}>{view.def.title}</span>
                    <span className="shrink-0 text-[6.5px] font-bold tabular-nums text-[#8b9781]">
                      {view.value}/{view.def.target}
                    </span>
                  </div>
                  <Bar value={pct} className="mt-0.5 h-[3px]" barClassName={view.claimed ? "from-[#b6c4ae] to-[#a2b49a]" : undefined} />
                </div>
                {view.ready && !view.claimed && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => openSheet("quests")}
          className="mt-2 flex w-full items-center justify-between border-t border-white/50 pt-2 text-[8px] font-bold uppercase tracking-[0.09em] text-[#6e816b]"
        >
          All quests & bloom <ChevronRight className="h-3 w-3" />
        </button>

        <button
          onClick={() => (progress.daily.claimedToday ? openSheet("quests") : claimDaily())}
          disabled={progress.daily.claimedToday}
          className={cn(
            "mt-1.5 flex w-full items-center justify-between rounded-[12px] border px-2 py-1.5 text-left",
            progress.daily.claimedToday ? "border-white/55 bg-white/25" : "border-[#d9c69c]/60 bg-[#f2e7d0]/70",
          )}
        >
          <span className="flex items-center gap-1.5">
            <Gift className="h-3 w-3 text-[#9a8148]" />
            <span className="text-[8px] font-bold text-[#7b6841]">
              {progress.daily.claimedToday ? "Daily dew gathered" : `Daily gift · +${reward}`}
            </span>
          </span>
          <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.06em] text-[#8e7b4c]">
            {streak}d <Flame className="h-2.5 w-2.5" />
          </span>
        </button>
      </div>
    </aside>
  );
}

function SideCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-[24px] p-3", className)}>{children}</div>;
}

const WISDOM = [
  { quote: "The quieter you become, the more you are able to hear.", source: "Zen proverb" },
  { quote: "Nature does not hurry, yet everything is accomplished.", source: "Lao Tzu" },
  { quote: "In the midst of movement and chaos, keep stillness inside of you.", source: "Deepak Chopra" },
  { quote: "One word can hold the weather of a whole day.", source: "Serein field notes" },
  { quote: "Let the letters settle like leaves on still water.", source: "Serein field notes" },
  { quote: "A garden is a conversation between patience and attention.", source: "Serein field notes" },
];

export function InsightSidebar() {
  const { progress, openSheet, startJourneyLevel, startDailyBloom, dailyBloomInfo } = useGame();
  const summary = journeySummary(progress.journey.stars);
  const current = levelById(summary.current.id) ?? summary.current;
  const weekly = questViews(progress.quests, "weekly");
  const bloom = bloomClaims(progress.quests);
  const nextTier = bloom.find((b) => !b.claimed);
  const wisdom = WISDOM[new Date().getDate() % WISDOM.length];
  const recent = [...progress.collection]
    .sort((a, b) => new Date(b.lastSolved).getTime() - new Date(a.lastSolved).getTime())
    .slice(0, 3);
  const chapter = current.chapterTitle;
  const chapterStars = summary.chapters.find((c) => c.chapter.id === current.chapterId);

  return (
    <aside className="no-scrollbar hidden min-h-0 flex-col gap-3 overflow-y-auto pb-2 lg:flex">
      <SideCard className="relative overflow-hidden">
        <SparkleField count={4} />
        <div className="flex items-center justify-between">
          <SectionLabel>The quiet path</SectionLabel>
          <span className="flex items-center gap-1 text-[8px] font-bold text-[#8a9a80]">
            <Star className="h-2.5 w-2.5 fill-[#c9a05d] text-[#c9a05d]" /> {summary.totalStars}
          </span>
        </div>
        <div className="relative mt-1.5 flex items-baseline justify-between gap-1">
          <div className="font-display text-[18px] leading-none text-[#364a3c]">{current.name}</div>
          <div className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-muted">stone {current.number}</div>
        </div>
        <div className="mt-1 text-[8px] font-medium text-muted">
          {chapter} · {current.length} letters · par {current.par}
        </div>
        <div className="relative mt-2">
          <div className="mb-1 flex items-center justify-between text-[7.5px] font-semibold text-[#7d8d77]">
            <span>{summary.cleared} of {summary.total} stones</span>
            <span>{chapterStars ? `${chapterStars.stars}/${chapterStars.max} ★` : ""}</span>
          </div>
          <Bar value={summary.totalStars / summary.maxStars} className="h-1" />
        </div>
        <button onClick={() => startJourneyLevel(current.id)} className="btn-primary relative mt-2 w-full !py-1.5 !text-[9px]">
          <Map className="h-3 w-3" /> Continue the path
        </button>
        <button
          onClick={() => openSheet("journey")}
          className="relative mt-1 flex w-full items-center justify-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-[#7d8e77]"
        >
          View all chapters <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </SideCard>

      <SideCard>
        <div className="flex items-center justify-between">
          <SectionLabel>This week</SectionLabel>
          <span className="text-[8px] font-bold tabular-nums text-[#9a7f45]">{progress.quests.pollen} pollen</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[8px] font-medium text-[#7c8b76]">
          <span>Weekly bloom</span>
          <span className="font-bold text-[#8a7645]">{nextTier ? nextTier.tier.label : "all gathered"}</span>
        </div>
        <Bar
          value={nextTier ? Math.min(1, progress.quests.pollen / nextTier.tier.at) : 1}
          className="mt-1 h-1.5"
          barClassName="from-[#dcc18c] via-[#cba764] to-[#b48d47]"
        />
        <div className="mt-1 flex items-center justify-between text-[7px] font-medium text-muted">
          <span>{nextTier ? `${Math.max(0, nextTier.tier.at - progress.quests.pollen)} pollen to next tier` : "Every tier open"}</span>
          <span>{weekly.filter((v) => v.ready || v.claimed).length}/3 weekly</span>
        </div>
        <button
          onClick={() => openSheet("quests")}
          className="mt-2 flex w-full items-center justify-between rounded-[10px] border border-white/60 bg-white/35 px-2 py-1.5 text-[8px] font-bold text-[#6e8068]"
        >
          <span className="flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-[#b89a5e]" /> Gather quest rewards
          </span>
          <ChevronRight className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={startDailyBloom}
          className="mt-1.5 flex w-full items-center justify-between rounded-[10px] border border-white/60 bg-gradient-to-r from-[#f1e5cc]/70 to-[#e8ecda]/70 px-2 py-1.5 text-[8px] font-bold text-[#7b6a41]"
        >
          <span className="flex items-center gap-1">
            <Flower2 className="h-2.5 w-2.5" /> Daily Bloom
          </span>
          <span className="text-[6.5px] uppercase tracking-[0.08em]">{dailyBloomInfo.done ? "pressed" : "tend now"}</span>
        </button>
      </SideCard>

      <SideCard>
        <div className="flex items-center justify-between">
          <SectionLabel>The herbarium</SectionLabel>
          <span className="text-[8px] font-bold tabular-nums text-[#8a9882]">{progress.collection.length}</span>
        </div>
        <div className="mt-1.5 flex flex-col gap-1">
          {recent.map((entry) => (
            <div key={`${entry.length}-${entry.word}`} className="flex items-center gap-1.5 rounded-[9px] border border-white/50 bg-white/30 px-1.5 py-1">
              <Leaf className="h-2.5 w-2.5 shrink-0 text-[#81977a]" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate font-display text-[12px] leading-none text-[#455a46]">{entry.word}</span>
              <span className="shrink-0 text-[6.5px] font-bold uppercase tracking-[0.05em] text-[#96a08d]">{entry.bestGuesses} guesses</span>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="rounded-[9px] border border-dashed border-white/70 bg-white/20 px-2 py-2 text-center text-[7.5px] font-medium text-[#8b9885]">
              Your first pressed word is waiting.
            </div>
          )}
        </div>
        <button
          onClick={() => openSheet("garden")}
          className="mt-1.5 flex w-full items-center justify-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-[#7c8d76]"
        >
          Open the herbarium <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </SideCard>

      <div className="relative overflow-hidden rounded-[24px] border border-white/60 bg-white/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl">
        <div className="absolute -right-3 -top-4 h-20 w-20 rounded-full bg-[#e7ddc4]/50 blur-2xl" />
        <Leaf className="h-3.5 w-3.5 text-[#8a9c84]" strokeWidth={1.6} />
        <p className="relative mt-1.5 font-display text-[14.5px] leading-[1.4] text-[#465347]">“{wisdom.quote}”</p>
        <p className="mt-1.5 text-[7.5px] font-bold uppercase tracking-[0.16em] text-muted">{wisdom.source}</p>
      </div>
    </aside>
  );
}
