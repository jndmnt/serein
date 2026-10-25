import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Droplet,
  Eye,
  Feather,
  Flame,
  Gift,
  Leaf,
  Lock,
  Map,
  Flower2,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Timer,
  Trophy,
  Vibrate,
  Volume2,
  Wind,
  Info,
} from "lucide-react";
import {
  THEME_PRICES,
  dailyRewardFor,
  todayStreak,
  useGame,
} from "../../game/GameController";
import { ACHIEVEMENTS, achievementValue } from "../../game/achievements";
import { SOLUTIONS } from "../../game/DictionaryEngine";
import { GLAZES } from "../../game/cosmetics";
import type { ActivityDay, ThemeId } from "../../game/types";
import { RITUAL_STILL } from "../../assets/ritualStill";
import { cn } from "../../utils/cn";
import { AchievementGlyph, Bar, Dew, Divider, SegmentedControl, SparkleField } from "../Primitives";

/* ——————————————————— Ritual selection ——————————————————— */

const MODES = [
  {
    id: "classic" as const,
    name: "Zen Classic",
    tag: "Untimed",
    icon: Feather,
    desc: "Six quiet guesses. A curated deck that never repeats until every word has been played.",
    bullets: ["Gale & Sunbeam hints", "Dewdrops every solve", "Streak-friendly"],
    accent: "from-[#e3ecdd] to-[#c9dac5]",
  },
  {
    id: "fever" as const,
    name: "Word Fever",
    tag: "60 seconds",
    icon: Timer,
    desc: "A flowing rush. Each solved word gifts ten seconds and warms a multiplier up to three times.",
    bullets: ["+10s per solve", "1.5× · 2× · 3× combo", "Best score kept"],
    accent: "from-[#f1e5cb] to-[#e0cba0]",
  },
  {
    id: "versus" as const,
    name: "Friend Duel",
    tag: "Pass & play",
    icon: Swords,
    desc: "Hide a secret word for a companion, then swap roles. Fewest guesses and least time wins.",
    bullets: ["Best of 3 or 5", "Hidden secret words", "Round-by-round scoreboard"],
    accent: "from-[#e5e4ee] to-[#cfd0df]",
  },
];

export function ModeSheet() {
  const { mode, selectMode, length, selectLength, closeSheet, openSheet, progress, dictionarySize } = useGame();
  const lengths = [
    { value: 4 as const, name: "Snack", desc: "Bite-sized calm", letters: 4 },
    { value: 5 as const, name: "Classic", desc: "The daily ritual", letters: 5 },
    { value: 6 as const, name: "Master", desc: "A longer exhale", letters: 6 },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {MODES.map((m) => {
          const active = mode === m.id;
          const Icon = m.icon;
          return (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                selectMode(m.id);
                closeSheet();
              }}
              className={cn(
                "group relative flex w-full items-start gap-3 overflow-hidden rounded-[20px] border p-3 text-left transition-colors",
                active
                  ? "border-white/90 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_30px_-24px_rgba(45,63,49,0.6)]"
                  : "border-white/55 bg-white/30 hover:bg-white/50",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/70 bg-gradient-to-br text-[#45604d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
                  m.accent,
                )}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#324537]">{m.name}</span>
                  <span className="rounded-full border border-white/70 bg-white/55 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.08em] text-[#74846f]">
                    {m.tag}
                  </span>
                  {active && (
                    <span className="flex items-center gap-0.5 rounded-full bg-[var(--accent-soft)] px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
                      <Check className="h-2.5 w-2.5" /> current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6d7d6f]">{m.desc}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {m.bullets.map((b) => (
                    <span key={b} className="rounded-full border border-white/60 bg-white/35 px-1.5 py-[2px] text-[8px] font-semibold text-[#7d8c7a]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/70 bg-white/45 text-[#849183] transition-transform group-hover:translate-x-0.5">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-[20px] border border-white/60 bg-white/28 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3d5242]">Word length</div>
            <div className="text-[8.5px] font-medium text-muted">Switch any time · a new ritual begins</div>
          </div>
          <span className="chip !text-[8px]">{length}-letter now</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {lengths.map((l) => {
            const active = length === l.value;
            return (
              <button
                key={l.value}
                onClick={() => {
                  selectLength(l.value);
                  closeSheet();
                }}
                className={cn(
                  "rounded-[15px] border px-2 py-2 text-left transition-all",
                  active
                    ? "border-[#8da88a]/70 bg-gradient-to-br from-[#eaf0e2] to-[#d7e4d2] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                    : "border-white/60 bg-white/35 hover:bg-white/55",
                )}
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[24px] leading-none text-[#3c5142]">{l.letters}</span>
                  <span className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#7d8c78]">{l.name}</span>
                </div>
                <div className="mt-1 truncate text-[8px] font-medium text-muted">{l.desc}</div>
                <div className="mt-1 flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.08em] text-[#8b998a]">
                  <BookOpen className="h-2.5 w-2.5" /> {SOLUTIONS[l.value].length} solutions
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => openSheet("journey")}
          className="flex flex-col gap-1 rounded-[15px] border border-white/60 bg-white/30 p-2.5 text-left transition-colors hover:bg-white/50"
        >
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#435a48]">
            <Map className="h-3.5 w-3.5 text-[#7f957b]" /> The quiet path
          </span>
          <span className="text-[7.5px] font-medium leading-snug text-muted">Six chapters, 24 stars</span>
          <span className="mt-auto text-[8px] font-bold tabular-nums text-[#8a9a80]">{progress.journey.completed}/24 stones</span>
        </button>
        <button
          onClick={() => openSheet("quests")}
          className="flex flex-col gap-1 rounded-[15px] border border-white/60 bg-gradient-to-br from-[#f2e8d3]/80 to-[#e8ecdc]/80 p-2.5 text-left transition-colors hover:from-[#f5ecda]"
        >
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#4a593f]">
            <Flower2 className="h-3.5 w-3.5 text-[#9a834e]" /> Quests & bloom
          </span>
          <span className="text-[7.5px] font-medium leading-snug text-[#858d75]">Daily rituals, weekly track</span>
          <span className="mt-auto text-[8px] font-bold tabular-nums text-[#9a8148]">{progress.quests.pollen} pollen</span>
        </button>
      </div>

      <button
        onClick={() => openSheet(progress.daily.claimedToday ? "stats" : "gift")}
        className="flex items-center justify-between rounded-[18px] border border-white/60 bg-gradient-to-r from-[#f2e9d6]/80 to-[#e6ecdd]/80 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/50 text-[#9a8451]">
            <Gift className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[10.5px] font-bold text-[#4a5941]">
              {progress.daily.claimedToday ? "Daily dew gathered" : `Today's gift · +${dailyRewardFor(progress)} dewdrops`}
            </div>
            <div className="text-[8.5px] font-medium text-[#8a967f]">
              {todayStreak(progress)}-day ritual · refreshed at midnight
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-[#879177]" />
      </button>

      <p className="flex items-center justify-center gap-1.5 pb-1 text-center text-[8.5px] font-medium text-muted">
        <ShieldCheck className="h-3 w-3" /> {dictionarySize.toLocaleString()} valid guesses · curated solutions · no repeats
      </p>
    </div>
  );
}

/* ——————————————————— Progress & achievements ——————————————————— */

function StatTile({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail?: string; icon?: typeof Leaf }) {
  return (
    <div className="rounded-[16px] border border-white/60 bg-white/35 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
        {Icon && <Icon className="h-3 w-3 text-[#96a493]" />}
      </div>
      <div className="mt-1 font-display text-[24px] leading-none text-[#35493b]">{value}</div>
      {detail && <div className="mt-1 text-[8px] font-medium text-muted">{detail}</div>}
    </div>
  );
}

function relativeDate(date: string) {
  const then = new Date(date);
  const now = new Date();
  const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ActivityHeatmap({ activity }: { activity: Record<string, ActivityDay> }) {
  const days = 84;
  const cells = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const a = activity[key];
        const score = a ? a.w * 3 + a.d / 30 : 0;
        const level = score === 0 ? 0 : Math.min(4, Math.ceil(score / 2));
        return { key, level, a, date: d };
      }),
    [activity],
  );
  const colors = ["rgba(76,101,83,0.08)", "rgba(140,167,137,0.34)", "rgba(113,145,112,0.55)", "rgba(91,124,96,0.76)", "rgba(70,103,78,0.94)"];
  const activeDays = cells.filter((c) => c.level > 0).length;
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/30 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10.5px] font-bold text-[#3d5242]">Tending pattern</div>
          <div className="text-[8.5px] font-medium text-muted">The last twelve weeks in your garden</div>
        </div>
        <span className="chip !text-[8px]">{activeDays} active days</span>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <div className="flex flex-col justify-between py-0.5 text-[6px] font-bold uppercase tracking-[0.04em] text-muted">
          <span>M</span>
          <span>W</span>
          <span>F</span>
          <span>S</span>
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
          {cells.map((cell) => (
            <div
              key={cell.key}
              title={`${cell.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${cell.a?.w ?? 0} wins · ${cell.a?.d ?? 0} dew`}
              className="aspect-square w-full rounded-[3px] border border-white/30"
              style={{ background: colors[cell.level] }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[7px] font-medium text-muted">
          <Flame className="h-2.5 w-2.5 text-[#b58c55]" /> {cells.reduce((sum, c) => sum + (c.a?.w ?? 0), 0)} wins in this window
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[6.5px] font-semibold uppercase tracking-[0.04em] text-muted">less</span>
          {colors.map((c) => (
            <span key={c} className="h-2 w-2 rounded-[2px] border border-white/40" style={{ background: c }} />
          ))}
          <span className="text-[6.5px] font-semibold uppercase tracking-[0.04em] text-muted">more</span>
        </div>
      </div>
    </div>
  );
}

export function StatsSheet() {
  const { progress, level, openSheet } = useGame();
  const s = progress.stats;
  const winRate = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  const distribution = s.guessDistribution.slice(1, 7);
  const max = Math.max(...distribution, 1);
  const unlocked = progress.unlockedAchievements.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-br from-[#e9efe1]/90 to-[#dbe6d5]/80 p-3.5">
        <SparkleField count={5} />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-[#8ea88b] to-[#55715d] text-[#f7f4e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_20px_-14px_rgba(42,66,48,0.8)]">
            <Leaf className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="eyebrow !text-[#7e8f7a]">Level {level.level}</div>
            <div className="font-display text-[24px] leading-none text-[#35493b]">{level.title}</div>
            <Bar value={level.progress} className="mt-2" />
            <div className="mt-1 flex justify-between text-[8px] font-semibold text-[#7c8b78]">
              <span>{level.xpInLevel} XP</span>
              <span>{level.xpToNext} XP to {level.nextTitle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <StatTile label="Rituals" value={s.played} detail="rounds played" icon={Trophy} />
        <StatTile label="Solved" value={s.wins} detail={`${winRate}% win rate`} icon={Check} />
        <StatTile label="Streak" value={s.currentStreak} detail={`best ${s.bestStreak}`} icon={Flame} />
        <StatTile label="Dewdrops" value={progress.dewdrops} detail={`${s.totalDewdropsEarned} gathered`} icon={Droplet} />
        <StatTile label="Fever best" value={s.feverBest} detail={`${s.feverWordsTotal} total words`} icon={Timer} />
        <StatTile label="Duels" value={`${s.versusWins}/${s.versusPlayed}`} detail="settled / played" icon={Swords} />
      </div>

      <div className="rounded-[18px] border border-white/60 bg-white/30 p-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[9.5px] font-bold text-[#3d5242]">Depth of the garden</span>
          <span className="text-[7px] font-bold uppercase tracking-[0.08em] text-muted">all-time</span>
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {[
            { label: "stars", value: Object.values(progress.journey.stars).reduce((a, b) => a + b, 0), icon: Sparkles },
            { label: "pressed", value: progress.collection.length, icon: Flower2 },
            { label: "pollen", value: progress.quests.pollen, icon: Sparkles },
            { label: "badges", value: unlocked, icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[10px] border border-white/55 bg-white/35 px-1 py-1.5 text-center">
                <Icon className="mx-auto h-3 w-3 text-[#8a9b80]" strokeWidth={1.8} />
                <div className="mt-0.5 text-[12px] font-bold tabular-nums leading-none text-[#3f5444]">{item.value}</div>
                <div className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.05em] text-muted">{item.label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between rounded-[9px] border border-white/50 bg-white/25 px-2 py-1 text-[7.5px] font-medium text-[#748371]">
          <span>Journey · {progress.journey.completed}/24 stones</span>
          <button onClick={() => openSheet("journey")} className="font-bold uppercase tracking-[0.06em] text-[#7d8e74]">
            open path →
          </button>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/60 bg-white/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3d5242]">Guess distribution</div>
            <div className="text-[8.5px] font-medium text-muted">Classic victories by attempts</div>
          </div>
          <span className="chip !text-[8px]">{s.wins} wins</span>
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {distribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 text-[9px] font-bold text-[#7c8b79]">{i + 1}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-[5px] bg-[#4c6553]/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(count ? 10 : 3, (count / max) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.04 }}
                  className={cn(
                    "flex h-full items-center justify-end rounded-[5px] px-1.5 text-[8px] font-bold text-white",
                    count ? "bg-gradient-to-r from-[#89a487] to-[#5f7f66]" : "bg-[#4c6553]/15",
                  )}
                >
                  {count > 0 ? count : ""}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/50 pt-2 text-[8.5px] font-medium text-muted">
          <span>Two-guess wins · {s.twoGuessWins}</span>
          <span>Hints-free wins · {s.hintsFreeWins}</span>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/60 bg-white/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3d5242]">Recent rituals</div>
            <div className="text-[8.5px] font-medium text-muted">Your last few quiet moments</div>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">{progress.history.length} logged</span>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {progress.history.slice(0, 5).map((h, i) => {
            const Icon = h.mode === "fever" ? Timer : h.mode === "versus" ? Swords : Feather;
            return (
              <div key={`${h.date}-${i}`} className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/35 px-2 py-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/70 bg-white/50 text-[#74876f]">
                  <Icon className="h-3 w-3" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-[9.5px] font-bold text-[#445947]">
                    {h.mode === "fever" ? "Word Fever" : h.mode === "versus" ? "Friend Duel" : "Zen Classic"}
                    <span className="ml-1 font-medium text-muted">· {h.detail}</span>
                  </div>
                  <div className="text-[8px] font-medium text-muted">{relativeDate(h.date)}</div>
                </div>
                <span className={cn("text-[8.5px] font-bold tabular-nums", h.dewdrops > 0 ? "text-[#66805f]" : "text-muted")}>
                  {h.dewdrops > 0 ? `+${h.dewdrops}` : "—"}
                </span>
              </div>
            );
          })}
          {progress.history.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/70 bg-white/20 px-3 py-4 text-center">
              <Sparkles className="mx-auto h-4 w-4 text-[#a5af9e]" />
              <div className="mt-1 text-[9.5px] font-semibold text-[#7b8a79]">Your first ritual is waiting</div>
              <div className="text-[8px] text-muted">Solve a word to begin your history.</div>
            </div>
          )}
        </div>
      </div>

      <ActivityHeatmap activity={progress.activity} />

      <div className="flex items-center gap-2 rounded-[18px] border border-white/60 bg-white/30 p-2.5">
        <AchievementGlyph glyph="crown" unlocked={unlocked > 0} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-[#3f5444]">{unlocked} of {ACHIEVEMENTS.length} badges in bloom</div>
          <Bar value={unlocked / ACHIEVEMENTS.length} className="mt-1.5 h-1" />
        </div>
        <button onClick={() => openSheet("achievements")} className="btn-ghost !px-2.5 !py-1.5 !text-[9px]">
          View all
        </button>
      </div>
    </div>
  );
}

export function AchievementsSheet() {
  const { progress } = useGame();
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const au = progress.unlockedAchievements.includes(a.id) ? 1 : 0;
    const bu = progress.unlockedAchievements.includes(b.id) ? 1 : 0;
    return bu - au;
  });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 rounded-[18px] border border-white/60 bg-gradient-to-br from-[#eee4cc]/80 to-[#e1ead8]/80 p-3">
        <AchievementGlyph glyph="trophy" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-[#405443]">
              {progress.unlockedAchievements.length} / {ACHIEVEMENTS.length} badges
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#94824d]">+25 dew each</span>
          </div>
          <Bar value={progress.unlockedAchievements.length / ACHIEVEMENTS.length} className="mt-1.5 h-1.5" />
          <div className="mt-1 text-[8px] font-medium text-muted">Every badge deposits 25 dewdrops into your jar.</div>
        </div>
      </div>

      {sorted.map((a) => {
        const value = achievementValue(a, progress);
        const unlocked = progress.unlockedAchievements.includes(a.id);
        return (
          <div
            key={a.id}
            className={cn(
              "flex items-center gap-2.5 rounded-[17px] border p-2.5 transition-colors",
              unlocked ? "border-white/75 bg-white/55" : "border-white/50 bg-white/25",
            )}
          >
            <AchievementGlyph glyph={a.glyph} unlocked={unlocked} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[10.5px] font-bold text-[#3f5444]">{a.name}</span>
                {unlocked ? (
                  <span className="flex shrink-0 items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#6b8463]">
                    <Check className="h-2.5 w-2.5" /> unlocked
                  </span>
                ) : (
                  <span className="shrink-0 text-[8px] font-bold tabular-nums text-muted">{Math.min(value, a.target)}/{a.target}</span>
                )}
              </div>
              <div className="truncate text-[8.5px] font-medium text-muted">{a.description}</div>
              <Bar value={value / a.target} className="mt-1.5 h-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ——————————————————— Atelier ——————————————————— */

const THEMES: { id: ThemeId; name: string; note: string; swatches: string[] }[] = [
  { id: "sage", name: "Sage Ceremony", note: "The original calm", swatches: ["#dce7d7", "#e9e9dd", "#f3e8d3", "#5d7f64"] },
  { id: "rosewood", name: "Rosewood Dawn", note: "Warm, quiet clay", swatches: ["#eee2d9", "#f3e9df", "#eadccf", "#8a5f57"] },
  { id: "mist", name: "Misted Indigo", note: "Cool river air", swatches: ["#dfe4e8", "#ecece7", "#e4e3ee", "#566b74"] },
  { id: "honey", name: "Honeyed Stone", note: "Late afternoon", swatches: ["#eee6d1", "#f4eee1", "#efe0c4", "#7d6a43"] },
];

export function ShopSheet() {
  const { progress, buyCharges, buyTheme, equipTheme, buyGlaze, equipGlaze, openSheet } = useGame();
  const [tab, setTab] = useState<"helpers" | "glazes" | "atmospheres">("helpers");

  const packs = [
    {
      kind: "gale" as const,
      name: "Gale",
      icon: Wind,
      count: progress.galeCharges,
      desc: "A soft gust that clears three cold gray letters from the keyboard.",
      options: [
        { qty: 1, price: 50 },
        { qty: 3, price: 120, tag: "save 30" },
      ],
      accent: "from-[#e7eee3] to-[#cfdecd]",
    },
    {
      kind: "sunbeam" as const,
      name: "Sunbeam",
      icon: Sun,
      count: progress.sunbeamCharges,
      desc: "One warm ray lifts an unrevealed letter into a green ceramic tile.",
      options: [
        { qty: 1, price: 100 },
        { qty: 2, price: 170, tag: "save 30" },
      ],
      accent: "from-[#f2e8d3] to-[#e4cfa5]",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/60 bg-white/35 p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#d9e8dd] to-[#b3cbbb] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Droplet className="h-4 w-4 text-[#587565]" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">Your dewdrops</div>
            <div className="font-display text-[22px] leading-none text-[#3a5040]">{progress.dewdrops.toLocaleString()}</div>
          </div>
        </div>
        <button onClick={() => openSheet("gift")} className="btn-ghost !px-2.5 !py-1.5 !text-[9px]">
          <Gift className="h-3 w-3" /> Daily gift
        </button>
      </div>

      <SegmentedControl
        ariaLabel="Atelier sections"
        layoutId="shop-pill"
        value={tab}
        onChange={setTab}
        options={[
          { value: "helpers", label: "Helpers" },
          { value: "glazes", label: "Glazes" },
          { value: "atmospheres", label: "Light" },
        ]}
      />

      {tab === "helpers" ? (
        <div className="flex flex-col gap-2">
          {packs.map((pack) => {
            const Icon = pack.icon;
            return (
              <div key={pack.kind} className="rounded-[20px] border border-white/65 bg-white/35 p-3">
                <div className="flex items-start gap-2.5">
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-white/70 bg-gradient-to-br text-[#4d6752] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]", pack.accent)}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[#3b5041]">{pack.name}</span>
                      <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.06em] text-[var(--accent-deep)]">
                        {pack.count} in jar
                      </span>
                    </div>
                    <p className="mt-1 text-[9px] leading-relaxed text-[#6e7e70]">{pack.desc}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {pack.options.map((o) => (
                    <motion.button
                      key={o.qty}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => buyCharges(pack.kind, o.qty, o.price)}
                      className={cn(
                        "relative flex items-center justify-between gap-1 rounded-[13px] border px-2.5 py-2 text-left transition-colors",
                        progress.dewdrops >= o.price
                          ? "border-white/80 bg-white/65 hover:bg-white/85"
                          : "border-white/50 bg-white/25 opacity-70",
                      )}
                    >
                      <span>
                        <span className="block text-[9.5px] font-bold text-[#3f5545]">
                          {o.qty}× {pack.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-0.5 text-[8px] font-semibold text-[#73866f]">
                          <Droplet className="h-2.5 w-2.5" /> {o.price}
                        </span>
                      </span>
                      {o.tag ? (
                        <span className="rounded-full bg-[#e8d8b6] px-1.5 py-[1px] text-[7px] font-bold uppercase tracking-[0.04em] text-[#8b703b]">
                          {o.tag}
                        </span>
                      ) : (
                        <ArrowRight className="h-3 w-3 text-[#93a08e]" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-start gap-2 rounded-[16px] border border-white/60 bg-gradient-to-r from-[#f1e8d6]/80 to-[#e6eee0]/80 p-2.5">
            <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#99814d]" />
            <p className="text-[8.5px] leading-relaxed text-[#7b8772]">
              In a puzzle, charges are spent first — no dew needed. Sunbeam and Gale are intentionally gentle: they help you
              learn, not skip the joy of finding.
            </p>
          </div>
        </div>
      ) : tab === "atmospheres" ? (
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const owned = progress.ownedThemes.includes(theme.id);
            const active = progress.theme === theme.id;
            const price = theme.id === "sage" ? 0 : THEME_PRICES[theme.id];
            return (
              <button
                key={theme.id}
                onClick={() => (owned ? equipTheme(theme.id) : buyTheme(theme.id))}
                className={cn(
                  "relative overflow-hidden rounded-[18px] border p-2.5 text-left transition-all",
                  active ? "border-[#8da88a]/80 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" : "border-white/60 bg-white/30 hover:bg-white/50",
                )}
              >
                <div
                  className="relative h-16 overflow-hidden rounded-[12px] border border-white/70 shadow-inner"
                  style={{ background: `linear-gradient(145deg, ${theme.swatches[0]}, ${theme.swatches[1]} 55%, ${theme.swatches[2]})` }}
                >
                  <span className="absolute left-2 top-2 h-6 w-6 rounded-[8px] border border-white/80 bg-white/70 shadow-[0_3px_6px_-3px_rgba(60,70,55,0.5)]" />
                  <span
                    className="absolute left-6 top-5 h-6 w-6 rounded-[8px] border border-white/40 shadow-[0_3px_6px_-3px_rgba(60,70,55,0.5)]"
                    style={{ background: theme.swatches[3] }}
                  />
                  <span className="absolute bottom-1.5 right-2 h-4 w-4 rounded-full border border-white/70 bg-white/60" />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] font-bold text-[#405443]">{theme.name}</span>
                  {active ? (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-[#62805f]">
                      <Check className="h-2.5 w-2.5" /> in use
                    </span>
                  ) : owned ? (
                    <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#7e8d78]">apply</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#96804f]">
                      <Lock className="h-2.5 w-2.5" /> {price}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[8px] font-medium text-muted">{theme.note}</span>
                  <span className="flex gap-0.5">
                    {theme.swatches.map((c) => (
                      <span key={c} className="h-1.5 w-1.5 rounded-full border border-white/50" style={{ background: c }} />
                    ))}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-[16px] border border-white/60 bg-gradient-to-r from-[#eef1e4]/80 to-[#f0e8d8]/70 p-2.5">
            <Palette className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#819277]" />
            <p className="text-[8.5px] leading-relaxed text-[#78866f]">
              Re-fire your ceramic. Glazes change the feel of cream tiles and keys only — jade, honey and stone keep their
              meaning, so the board always reads clean.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GLAZES.map((glaze) => {
              const owned = progress.ownedGlazes.includes(glaze.id);
              const active = progress.glaze === glaze.id;
              return (
                <button
                  key={glaze.id}
                  onClick={() => (owned ? equipGlaze(glaze.id) : buyGlaze(glaze.id))}
                  className={cn(
                    "relative overflow-hidden rounded-[18px] border p-2.5 text-left transition-all",
                    active ? "border-[#8da88a]/80 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" : "border-white/60 bg-white/30 hover:bg-white/50",
                  )}
                >
                  <div
                    className="relative flex h-16 items-center justify-center gap-1 overflow-hidden rounded-[12px] border border-white/70 shadow-inner"
                    style={{ background: `linear-gradient(145deg, ${glaze.swatches[1]}, ${glaze.swatches[0]})` }}
                  >
                    {[
                      { bg: glaze.swatches[0], letter: "S" },
                      { bg: glaze.swatches[2], letter: "E" },
                      { bg: glaze.swatches[3], letter: "R" },
                    ].map((tile) => (
                      <span
                        key={tile.letter}
                        className="grid h-7 w-7 place-items-center rounded-[7px] border border-white/70 font-display text-[11px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3px_6px_-3px_rgba(50,65,52,0.5)]"
                        style={{ background: tile.bg, color: tile.bg === glaze.swatches[0] ? "#52684f" : "#fbf8ef" }}
                      >
                        {tile.letter}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] font-bold text-[#405443]">{glaze.name}</span>
                    {active ? (
                      <span className="flex shrink-0 items-center gap-0.5 text-[7.5px] font-bold uppercase tracking-[0.05em] text-[#62805f]">
                        <Check className="h-2.5 w-2.5" /> firing
                      </span>
                    ) : owned ? (
                      <span className="shrink-0 text-[7.5px] font-bold uppercase tracking-[0.05em] text-[#7e8d78]">apply</span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-0.5 text-[8px] font-bold text-[#96804f]">
                        <Lock className="h-2.5 w-2.5" /> {glaze.price}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[8px] font-medium text-muted">{glaze.note}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-[18px] border border-white/60 bg-white/30 p-2.5">
        <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7f9779]" />
        <p className="text-[8.5px] leading-relaxed text-[#7c8a79]">
          A kind economy: every dewdrop is earned through play. There is no real-money store, no timed pressure to buy, and no
          ads — only the next quiet word.
        </p>
      </div>
    </div>
  );
}

/* ——————————————————— Settings ——————————————————— */

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
        on
          ? "border-[#63825f]/40 bg-gradient-to-r from-[#7f9b80] to-[#5c7b62] shadow-[inset_0_1px_2px_rgba(30,56,38,0.2)]"
          : "border-[#5d705f]/20 bg-[#63755f]/20 shadow-[inset_0_1px_2px_rgba(50,65,50,0.15)]",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-[3px] h-[18px] w-[18px] rounded-full border border-white/80 bg-white shadow-[0_2px_5px_rgba(40,55,40,0.3)]",
          on ? "right-[3px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Leaf;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[16px] border border-white/60 bg-white/32 p-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-white/70 bg-white/50 text-[#687f69]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold text-[#3f5444]">{label}</div>
        <div className="truncate text-[8.5px] font-medium text-muted">{description}</div>
      </div>
      <Toggle on={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SettingsSheet() {
  const { progress, updateSettings, openSheet, equipTheme, buyTheme, resetProgress, closeSheet } = useGame();
  const [armReset, setArmReset] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <SettingRow
        icon={Volume2}
        label="Sound"
        description="Marimba taps, chimes & shimmering wins"
        checked={progress.sound}
        onChange={() => updateSettings({ sound: !progress.sound })}
      />
      <SettingRow
        icon={Vibrate}
        label="Haptics"
        description="Gentle taps on supported phones"
        checked={progress.haptics}
        onChange={() => updateSettings({ haptics: !progress.haptics })}
      />
      <SettingRow
        icon={Eye}
        label="Tile symbols"
        description="Adds shapes for colour-blind clarity"
        checked={progress.tileSymbols}
        onChange={() => updateSettings({ tileSymbols: !progress.tileSymbols })}
      />

      <Divider />

      <div>
        <div className="flex items-center justify-between">
          <div className="text-[10.5px] font-bold text-[#3f5444]">Atmosphere</div>
          <button onClick={() => openSheet("shop")} className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#788a74]">
            Atelier →
          </button>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {THEMES.map((theme) => {
            const owned = progress.ownedThemes.includes(theme.id);
            const active = progress.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => (owned ? equipTheme(theme.id) : buyTheme(theme.id))}
                className={cn(
                  "rounded-[13px] border p-1 text-center transition-all",
                  active ? "border-[#8da88a]/80 bg-white/60" : "border-white/60 bg-white/30",
                )}
              >
                <span
                  className="block h-8 w-full rounded-[8px] border border-white/70 shadow-inner"
                  style={{ background: `linear-gradient(145deg, ${theme.swatches[0]}, ${theme.swatches[2]})` }}
                />
                <span className="mt-1 flex items-center justify-center gap-0.5 text-[7.5px] font-bold text-[#61755f]">
                  {!owned && <Lock className="h-2 w-2" />}
                  {theme.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1.5">
        <button onClick={() => openSheet("help")} className="flex items-center justify-between rounded-[14px] border border-white/60 bg-white/32 px-3 py-2.5 text-left">
          <span className="flex items-center gap-2 text-[10.5px] font-bold text-[#3f5444]">
            <BookOpen className="h-3.5 w-3.5 text-[#788a74]" /> How to play
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#96a293]" />
        </button>
        <button onClick={() => openSheet("achievements")} className="flex items-center justify-between rounded-[14px] border border-white/60 bg-white/32 px-3 py-2.5 text-left">
          <span className="flex items-center gap-2 text-[10.5px] font-bold text-[#3f5444]">
            <Trophy className="h-3.5 w-3.5 text-[#788a74]" /> Badges & rewards
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#96a293]" />
        </button>
        <button onClick={() => openSheet("gift")} className="flex items-center justify-between rounded-[14px] border border-white/60 bg-white/32 px-3 py-2.5 text-left">
          <span className="flex items-center gap-2 text-[10.5px] font-bold text-[#3f5444]">
            <Gift className="h-3.5 w-3.5 text-[#788a74]" /> Daily dewdrop
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#96a293]" />
        </button>
      </div>

      <div className="rounded-[16px] border border-white/60 bg-white/28 p-2.5">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b9986]" />
          <p className="text-[8.5px] leading-relaxed text-[#7d8b7a]">
            Serein is played entirely on this device. Words, dewdrops and badges live in local storage. Sound is synthesised live
            with the Web Audio API — no audio files, no downloads.
          </p>
        </div>
      </div>

      <Divider />

      <div className={cn("rounded-[16px] border p-2.5 transition-colors", armReset ? "border-[#c79a80]/60 bg-[#f4e5dc]/60" : "border-white/55 bg-white/25")}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold text-[#5f4b40]">Reset the garden</div>
            <div className="text-[8.5px] font-medium text-[#8a7b70]">Erases progress, dewdrops and badges.</div>
          </div>
          <button
            onClick={() => {
              if (!armReset) {
                setArmReset(true);
                return;
              }
              resetProgress();
              setArmReset(false);
              closeSheet();
            }}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[8.5px] font-bold transition-colors",
              armReset ? "border-[#b87a5f]/40 bg-[#c88b6e] text-white" : "border-white/70 bg-white/55 text-[#8a6455]",
            )}
          >
            <RotateCcw className="h-3 w-3" /> {armReset ? "Tap again" : "Reset"}
          </button>
        </div>
      </div>

      <div className="pb-1 text-center">
        <div className="font-display text-[16px] text-[#6d7d6b]">serein</div>
        <div className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-muted">Version 1.0 · a word ritual</div>
      </div>
    </div>
  );
}

/* ——————————————————— Daily gift ——————————————————— */

export function GiftSheet() {
  const { progress, dailyReward, claimDaily, openSheet } = useGame();
  const streak = todayStreak(progress);
  const completed = progress.daily.claimedToday ? Math.min(streak, 7) : Math.min(Math.max(streak - 1, 0), 7);
  const todayIndex = progress.daily.claimedToday ? -1 : Math.min(streak - 1, 6);
  const rewards = Array.from({ length: 7 }, (_, i) => 18 + Math.min(i + 1, 6) * 5 + ((i + 1) % 7 === 0 ? 40 : 0));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/70">
        <img src={RITUAL_STILL} alt="Ceramic ritual tiles with eucalyptus" className="h-36 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f4033]/70 via-[#2f4033]/10 to-transparent" />
        <SparkleField count={6} />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div>
            <div className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-white/70">Daily dew</div>
            <div className="font-display text-[22px] leading-tight text-white">A little gathering</div>
          </div>
          <span className="rounded-full border border-white/40 bg-white/20 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-sm">
            {streak} day streak
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-bold text-[#3f5444]">Seven days of tending</div>
          <div className="text-[8.5px] font-medium text-muted">The seventh day always blooms brighter.</div>
        </div>
        <Dew amount={progress.dewdrops} />
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {rewards.map((reward, i) => {
          const done = i < completed;
          const isToday = i === todayIndex;
          return (
            <div
              key={i}
              className={cn(
                "relative rounded-[13px] border px-1 py-2 text-center transition-all",
                isToday
                  ? "border-[#c3a468]/70 bg-gradient-to-br from-[#f2e5c8] to-[#e5d0a2] shadow-[0_10px_20px_-16px_rgba(140,108,49,0.8)]"
                  : done
                    ? "border-white/70 bg-white/55"
                    : "border-white/50 bg-white/25",
              )}
            >
              {done && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border border-white bg-[#7e9a7a] text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
              <div className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-muted">Day {i + 1}</div>
              <div className="mt-1 flex items-center justify-center gap-0.5 text-[10px] font-bold text-[#4d634f]">
                <Droplet className="h-2.5 w-2.5 text-[#8aa392]" /> {reward}
              </div>
              {i === 6 && <div className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.06em] text-[#9a7b3f]">bonus</div>}
            </div>
          );
        })}
      </div>

      <button
        onClick={claimDaily}
        disabled={progress.daily.claimedToday}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-bold transition-all",
          progress.daily.claimedToday
            ? "border border-white/60 bg-white/35 text-[#7b897a]"
            : "btn-primary !py-2.5",
        )}
      >
        {progress.daily.claimedToday ? (
          <>
            <Check className="h-4 w-4" /> Gathered · return tomorrow
          </>
        ) : (
          <>
            <Gift className="h-4 w-4" /> Claim +{dailyReward} dewdrops
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-[15px] border border-white/60 bg-white/30 p-2.5 text-center">
          <div className="font-display text-[22px] leading-none text-[#3f5444]">{streak}</div>
          <div className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">current streak</div>
        </div>
        <div className="rounded-[15px] border border-white/60 bg-white/30 p-2.5 text-center">
          <div className="font-display text-[22px] leading-none text-[#3f5444]">{progress.daily.bestStreak}</div>
          <div className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">best streak</div>
        </div>
      </div>

      <p className="text-center text-[8.5px] leading-relaxed text-muted">
        Dewdrops fund Gale and Sunbeam helpers, and new atmospheres in the Atelier. A missed day softens the streak back to one —
        there is no punishment beyond that.
      </p>
      <button onClick={() => openSheet("shop")} className="btn-ghost !py-2 !text-[9.5px]">
        <Palette className="h-3 w-3" /> Browse the Atelier
      </button>
    </div>
  );
}

/* ——————————————————— How to play ——————————————————— */

export function HelpSheet() {
  const { closeSheet, length, openSheet } = useGame();
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/70">
        <img src={RITUAL_STILL} alt="Sage ceramic tiles and a eucalyptus sprig" className="h-32 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f4033]/75 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-[21px] leading-tight text-white">Find the word. Keep the calm.</p>
          <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-white/65">No timer · no noise · no shame</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {[
          {
            n: "01",
            title: "Choose a ritual",
            body: "A four-letter snack, a five-letter classic, or a six-letter master. Every deck is curated and never repeats until exhausted.",
          },
          {
            n: "02",
            title: "Guess a word",
            body: "Type with the ceramic keyboard, then Enter. Six guesses in Zen Classic; the word is always a real, everyday word.",
          },
          {
            n: "03",
            title: "Read the tiles",
            body: "Jade means right letter and place. Honey means right letter, new place. River stone means the word has no more of that letter.",
          },
          {
            n: "04",
            title: "Ask the garden",
            body: "Gale blows away three cold letters (50 dew). Sunbeam lifts one unrevealed letter into jade (100 dew). Charges are used first.",
          },
        ].map((step) => (
          <div key={step.n} className="flex gap-2.5 rounded-[16px] border border-white/60 bg-white/32 p-2.5">
            <span className="font-display text-[20px] leading-none text-[#a8b5a2]">{step.n}</span>
            <div>
              <div className="text-[10px] font-bold text-[#3f5444]">{step.title}</div>
              <p className="mt-0.5 text-[8.5px] leading-relaxed text-[#788777]">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[18px] border border-white/60 bg-white/28 p-2.5">
        <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.14em] text-muted">The tile language</div>
        <div className="flex gap-1.5">
          {[
            { label: "Jade", sub: "exact", cls: "tile-correct", letter: "R" },
            { label: "Honey", sub: "misplaced", cls: "tile-present", letter: "I" },
            { label: "Stone", sub: "absent", cls: "tile-absent", letter: "S" },
          ].map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1 rounded-[12px] border border-white/50 bg-white/25 p-1.5">
              <div className={cn("tile tile-base !h-8 !w-8 !text-[13px]", item.cls)}>{item.letter}</div>
              <div className="text-[8.5px] font-bold text-[#4d6151]">{item.label}</div>
              <div className="text-[7.5px] font-medium text-muted">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: Feather, label: "Zen Classic", sub: "untimed" },
          { icon: Timer, label: "Word Fever", sub: "60s +10s" },
          { icon: Swords, label: "Friend Duel", sub: "pass & play" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-[13px] border border-white/55 bg-white/28 p-2 text-center">
              <Icon className="mx-auto h-3.5 w-3.5 text-[#7d927b]" strokeWidth={1.8} />
              <div className="mt-1 text-[8px] font-bold text-[#4d6151]">{m.label}</div>
              <div className="text-[7px] font-medium uppercase tracking-[0.04em] text-muted">{m.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[18px] border border-white/60 bg-white/28 p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">A longer quiet</span>
          <span className="chip !py-0 !text-[7px]">beyond the board</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Map, title: "The Quiet Path", body: "24 puzzles in six chapters. Three stars for restraint." },
            { icon: Flower2, title: "Daily Bloom", body: "One shared word a day, worth bonus dew and pollen." },
            { icon: Sparkles, title: "Quests & bloom", body: "Three daily quests and a ten-tier weekly track." },
            { icon: BookOpen, title: "Field notes", body: "After a solve, tap Meaning for a concise definition." },
            { icon: Palette, title: "The Atelier", body: "Glazes for the ceramic, light for the room." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-1.5 rounded-[12px] border border-white/50 bg-white/30 p-1.5">
                <Icon className="mt-0.5 h-3 w-3 shrink-0 text-[#7f9579]" strokeWidth={1.8} />
                <div>
                  <div className="text-[8px] font-bold text-[#445a48]">{item.title}</div>
                  <div className="text-[7px] leading-snug text-muted">{item.body}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-[10px] border border-white/50 bg-white/25 px-2 py-1 text-[7px] font-medium text-[#7d8c77]">
          <Leaf className="h-2.5 w-2.5" />
          Every solved word is pressed into your herbarium; your garden spirit grows with each one.
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-[16px] border border-white/60 bg-white/28 p-2.5">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7c9379]" />
        <p className="text-[8.5px] leading-relaxed text-[#7b8a78]">
          Guesses are checked against a 40,000+ word English lexicon, while solutions come from a curated, everyday deck. Your
          secrets in Friend Duel never leave this device.
        </p>
      </div>

      <div className="flex gap-1.5">
        <button onClick={() => openSheet("settings")} className="btn-ghost flex-1 !py-2 !text-[9.5px]">
          <Palette className="h-3 w-3" /> Settings
        </button>
        <button onClick={closeSheet} className="btn-primary flex-[1.3] !py-2 !text-[10px]">
          Return to the {length}-letter ritual <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

