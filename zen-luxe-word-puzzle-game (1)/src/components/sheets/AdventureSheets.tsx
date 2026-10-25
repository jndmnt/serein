import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Droplet,
  Eye,
  Feather,
  Flower2,
  Gift,
  Info,
  Leaf,
  Lock,
  Map,
  Pencil,
  Play,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Swords,
  Timer,
  Trophy,
  Vibrate,
  Volume2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useGame } from "../../game/GameController";
import {
  JOURNEY_CHAPTERS,
  journeySummary,
  isLevelUnlocked,
  levelById,
  masteryFor,
  type JourneyLevel,
} from "../../game/journey";
import {
  bloomClaims,
  formatCountdown,
  msUntilMidnight,
  questViews,
  type QuestIcon,
  type QuestView,
} from "../../game/quests";
import { COMPANION_STAGES, GLAZES, companionStage } from "../../game/cosmetics";
import { SOLUTIONS } from "../../game/DictionaryEngine";
import { ACHIEVEMENTS, achievementValue } from "../../game/achievements";
import type { CollectionEntry, WordLength } from "../../game/types";
import { cn } from "../../utils/cn";
import { Companion } from "../Companion";
import { WordLookup } from "../Meaning";
import {
  AchievementGlyph,
  Bar,
  Dew,
  Divider,
  ProgressRing,
  SegmentedControl,
  SparkleField,
} from "../Primitives";

const QUEST_ICONS: Record<QuestIcon, LucideIcon> = {
  drop: Droplet,
  leaf: Leaf,
  eye: Eye,
  timer: Timer,
  crown: Crown,
  sun: Sun,
  swords: Swords,
  map: Map,
  flower: Flower2,
  zap: Zap,
};

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

function Stars({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(i < count ? "fill-[#c9a05d] text-[#c9a05d]" : "text-[#9baa99]/50")}
          strokeWidth={1.6}
        />
      ))}
    </span>
  );
}

function SoftStat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[15px] border border-white/60 bg-white/38 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[7.5px] font-bold uppercase tracking-[0.11em] text-muted">{label}</span>
        {Icon && <Icon className="h-3 w-3 text-[#98a795]" strokeWidth={1.8} />}
      </div>
      <div className="mt-0.5 font-display text-[20px] leading-none text-[#384d3c]">{value}</div>
      {detail && <div className="mt-0.5 truncate text-[7.5px] font-medium text-muted">{detail}</div>}
    </div>
  );
}

/* ————————————————————————————————— Journey ————————————————————————————————— */

function LevelRow({
  level,
  stars,
  locked,
  current,
  onSelect,
}: {
  level: JourneyLevel;
  stars: number;
  locked: boolean;
  current: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-[15px] border px-2 py-1.5 text-left transition-all",
        current
          ? "border-[#9bb394]/80 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-18px_rgba(45,63,49,0.7)]"
          : locked
            ? "border-white/40 bg-white/20"
            : "border-white/55 bg-white/35 hover:bg-white/55",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          stars > 0
            ? "border-white/70 bg-gradient-to-br from-[#dce9d5] to-[#b5ccb0] text-[#4a6a51]"
            : locked
              ? "border-white/50 bg-white/25 text-[#9ba99a]"
              : "border-white/70 bg-white/55 text-[#5c715e]",
        )}
      >
        {locked ? <Lock className="h-3 w-3" /> : stars > 0 ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : level.number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("truncate text-[10.5px] font-bold", locked ? "text-[#8d9a8b]" : "text-[#3f5444]")}>
            {level.name}
          </span>
          <span className="shrink-0 rounded-full border border-white/60 bg-white/40 px-1 py-[1px] text-[7px] font-bold uppercase tracking-[0.05em] text-[#85917f]">
            {level.length}L
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[8px] font-medium text-muted">
          <span>≤{level.maxGuesses} guesses</span>
          <span className="h-[2px] w-[2px] rounded-full bg-[#98a695]" />
          <span>par {level.par}</span>
          <span className="h-[2px] w-[2px] rounded-full bg-[#98a695]" />
          <span className="text-[#8b9a7f]">+{level.dew} dew</span>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1">
        {stars > 0 && <Stars count={stars} />}
        {locked ? (
          <Lock className="h-3 w-3 text-[#a3afa0]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[#93a08f] transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </button>
  );
}

export function JourneySheet() {
  const game = useGame();
  const { progress, startJourneyLevel, startDailyBloom, openSheet } = game;
  const summary = useMemo(() => journeySummary(progress.journey.stars), [progress.journey.stars]);
  const [selectedId, setSelectedId] = useState(summary.current.id);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => ({
    [summary.current.chapterId]: true,
  }));
  const selected = levelById(selectedId) ?? summary.current;
  const selectedStars = progress.journey.stars[selected.id] ?? 0;
  const selectedUnlocked = isLevelUnlocked(selected.id, progress.journey.stars);
  const stage = companionStage(progress.companionXp);
  const bloom = game.dailyBloomInfo;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/75 bg-gradient-to-br from-[#e9f0df]/90 via-[#eef0e2]/80 to-[#e6e9d8]/80 p-3">
        <SparkleField count={7} />
        <div className="relative flex items-center gap-2.5">
          <div className="relative grid h-[86px] w-[86px] shrink-0 place-items-center">
            <Companion xp={progress.companionXp} size={108} />
          </div>
          <div className="min-w-0 flex-1">
            <Eyebrow>The quiet path</Eyebrow>
            <div className="font-display text-[23px] leading-[1.02] text-[#33483a]">
              {summary.cleared === 0
                ? "A path begins here."
                : `${summary.cleared} ${summary.cleared === 1 ? "stone" : "stones"} placed.`}
            </div>
            <p className="mt-1 text-[8.5px] font-medium leading-relaxed text-[#718171]">
              {stage.stage.note} Six chapters, {summary.total} quiet puzzles, one garden that remembers.
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Bar value={summary.cleared / summary.total} className="h-1.5 flex-1" />
              <span className="shrink-0 text-[8px] font-bold tabular-nums text-[#6d8069]">
                {summary.cleared}/{summary.total}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-2.5 grid grid-cols-3 gap-1.5">
          <div className="flex items-center justify-center gap-1 rounded-[11px] border border-white/60 bg-white/40 py-1.5">
            <Star className="h-3 w-3 fill-[#c9a05d] text-[#c9a05d]" />
            <span className="text-[10px] font-bold tabular-nums text-[#455b48]">{summary.totalStars}</span>
            <span className="text-[7.5px] font-semibold uppercase tracking-[0.05em] text-muted">/ {summary.maxStars}</span>
          </div>
          <div className="flex items-center justify-center gap-1 rounded-[11px] border border-white/60 bg-white/40 py-1.5">
            <Sparkles className="h-3 w-3 text-[#9c8149]" />
            <span className="text-[10px] font-bold tabular-nums text-[#455b48]">{progress.quests.pollen}</span>
            <span className="text-[7.5px] font-semibold uppercase tracking-[0.05em] text-muted">pollen</span>
          </div>
          <div className="flex items-center justify-center gap-1 rounded-[11px] border border-white/60 bg-white/40 py-1.5">
            <Flower2 className="h-3 w-3 text-[#6b8a6c]" />
            <span className="text-[10px] font-bold tabular-nums text-[#455b48]">{progress.collection.length}</span>
            <span className="text-[7.5px] font-semibold uppercase tracking-[0.05em] text-muted">pressed</span>
          </div>
        </div>

        <div className="relative mt-2 flex gap-1.5">
          <button
            onClick={() => startJourneyLevel(summary.current.id)}
            aria-label={`Continue journey at ${summary.current.name}`}
            className="btn-primary flex-1 !py-2 !text-[10px]"
          >
            <Play className="h-3 w-3 fill-current" />
            {summary.cleared === 0 ? "Begin the path" : `Continue · ${summary.current.name}`}
          </button>
          <button
            onClick={() => openSheet("quests")}
            className="btn-ghost !px-2.5 !py-2 !text-[9px]"
            aria-label="Open quests and bloom track"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        onClick={startDailyBloom}
        disabled={bloom.done}
        className={cn(
          "relative flex items-center gap-2.5 overflow-hidden rounded-[19px] border px-3 py-2.5 text-left transition-all",
          bloom.done
            ? "border-white/60 bg-white/35"
            : "border-[#d8c296]/70 bg-gradient-to-r from-[#f3e8d0]/90 to-[#e9ecdc]/85 shadow-[0_12px_26px_-22px_rgba(120,96,52,0.7)]",
        )}
      >
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
            bloom.done
              ? "border-white/70 bg-[#e4eadd] text-[#6b8467]"
              : "border-white/80 bg-gradient-to-br from-[#f0ddb8] to-[#d9bb82] text-[#85672f]",
          )}
        >
          {bloom.done ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Flower2 className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-[#4a5337]">Daily Bloom</span>
            <span className="rounded-full border border-white/60 bg-white/50 px-1.5 py-[1px] text-[7px] font-bold uppercase tracking-[0.06em] text-[#8d7847]">
              shared
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[8.5px] font-medium text-[#7c8468]">
            {bloom.done
              ? `Pressed in ${bloom.bestGuesses} guesses · next tomorrow`
              : `Today's ${bloom.length}-letter word · +30 dew & +8 pollen`}
          </span>
        </span>
        {!bloom.done && <ArrowRight className="h-4 w-4 shrink-0 text-[#9b8654]" />}
      </button>

      <div className="rounded-[20px] border border-white/65 bg-white/38 p-3">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>This stone</Eyebrow>
            <div className="font-display text-[21px] leading-tight text-[#34483a]">{selected.name}</div>
            <div className="text-[8.5px] font-medium text-muted">{selected.chapterTitle} · {selected.note}</div>
          </div>
          <Stars count={selectedStars} size={14} />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[
            { label: "letters", value: selected.length },
            { label: "guesses", value: `≤${selected.maxGuesses}` },
            { label: "par", value: selected.par },
            { label: "pollen", value: `+${selected.pollen}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[10px] border border-white/55 bg-white/35 py-1 text-center">
              <div className="text-[11px] font-bold leading-none text-[#455b48]">{item.value}</div>
              <div className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.06em] text-muted">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1 text-[8px] font-medium text-[#7c8b74]">
            <Star className="h-2.5 w-2.5 fill-[#c9a05d] text-[#c9a05d]" />
            3★ ≤{selected.par - 1} guesses · no hints &nbsp;·&nbsp; 2★ ≤{selected.par}
          </div>
          <button
            onClick={() => startJourneyLevel(selected.id)}
            disabled={!selectedUnlocked}
            aria-label={`Start level ${selected.name}`}
            className="btn-primary !px-3 !py-1.5 !text-[9px] disabled:opacity-40"
          >
            {!selectedUnlocked ? (
              <>
                <Lock className="h-3 w-3" /> Locked
              </>
            ) : selectedStars > 0 ? (
              <>
                <Feather className="h-3 w-3" /> Walk again
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" /> Begin
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {JOURNEY_CHAPTERS.map((chapter) => {
          const meta = summary.chapters.find((c) => c.chapter.id === chapter.id)!;
          const open = Boolean(openChapters[chapter.id]);
          return (
            <div key={chapter.id} className="overflow-hidden rounded-[18px] border border-white/60 bg-white/25">
              <button
                onClick={() => setOpenChapters((prev) => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left"
                aria-expanded={open}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 bg-white/45 font-display text-[13px] text-[#5c725c]">
                  {chapter.numeral}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-display text-[16px] leading-tight text-[#3c5140]">{chapter.title}</span>
                    {meta.cleared === chapter.levels.length && <Check className="h-3 w-3 text-[#6e8b6c]" strokeWidth={2.6} />}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[8px] font-medium text-muted">
                    <span>{chapter.subtitle}</span>
                    <span className="h-[2px] w-[2px] rounded-full bg-[#98a695]" />
                    <span className="tabular-nums">★ {meta.stars}/{meta.max}</span>
                  </span>
                </span>
                <span className="shrink-0 text-[8px] font-bold tabular-nums text-[#8b9984]">
                  {meta.cleared}/{chapter.levels.length}
                </span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 shrink-0 text-[#90a08c] transition-transform", open && "rotate-180")}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 px-2 pb-2">
                      <div className="mb-0.5 rounded-[10px] border border-white/40 bg-white/20 px-2 py-1 text-[7.5px] font-medium italic leading-relaxed text-[#87957f]">
                        {chapter.intro}
                      </div>
                      {chapter.levels.map((level) => (
                        <LevelRow
                          key={level.id}
                          level={level}
                          stars={progress.journey.stars[level.id] ?? 0}
                          locked={!isLevelUnlocked(level.id, progress.journey.stars)}
                          current={level.id === summary.current.id}
                          onSelect={() => setSelectedId(level.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-[16px] border border-white/55 bg-white/28 p-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8a9884]" />
        <p className="text-[8px] leading-relaxed text-[#7e8c79]">
          Stars are earned from restraint, not speed: three for solving under par with no hints. Replaying a stone always
          gives a little dew, but only new stones move the garden forward.
        </p>
      </div>
    </div>
  );
}

/* ————————————————————————————————— Herbarium ————————————————————————————————— */

function rarityFor(best: number) {
  if (best <= 2) return { label: "Rare bloom", color: "text-[#a27e40] bg-[#efe2c6]" };
  if (best === 3) return { label: "Fine specimen", color: "text-[#5e7d63] bg-[#e3ead9]" };
  if (best === 4) return { label: "Everyday", color: "text-[#6d7c6d] bg-[#e7e8dd]" };
  return { label: "Hardy find", color: "text-[#7b7764] bg-[#ece7da]" };
}

function SpecimenCard({ entry, onOpen }: { entry: CollectionEntry; onOpen: () => void }) {
  const rarity = rarityFor(entry.bestGuesses);
  const date = new Date(entry.lastSolved).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return (
    <button
      onClick={onOpen}
      className="group relative overflow-hidden rounded-[15px] border border-white/75 bg-gradient-to-br from-[#fbf8ee]/95 via-[#f3f0e2]/90 to-[#e8ecdb]/85 p-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_-16px_rgba(51,68,48,0.6)] transition-transform active:scale-[0.98]"
    >
      <span className="pointer-events-none absolute -bottom-3 -right-2 h-12 w-12 rotate-[18deg] opacity-[0.16]">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M30 54C12 44 8 24 20 10c14 2 26 14 24 30-1 8-6 12-14 14Z" stroke="#4d6851" strokeWidth="1.6" />
          <path d="M30 54c-2-16 2-30 10-40M30 54c-8-10-12-22-12-34" stroke="#4d6851" strokeWidth="1" />
        </svg>
      </span>
      <div className="relative flex items-start justify-between gap-1">
        <span className="truncate font-display text-[18px] leading-none tracking-[-0.01em] text-[#3b4e3d]">
          {entry.word}
        </span>
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/70 bg-white/55">
          <Leaf className="h-2 w-2 text-[#7b9474]" strokeWidth={2} />
        </span>
      </div>
      <div className="relative mt-1.5 flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.07em] text-[#819078]">
        <span>{entry.bestGuesses} guess{entry.bestGuesses === 1 ? "" : "es"}</span>
        <span className="h-[2px] w-[2px] rounded-full bg-[#93a08c]" />
        <span>{entry.times}×</span>
        <span className="ml-auto normal-case tracking-normal text-[#9aa394]">{date}</span>
      </div>
      <div className={cn("relative mt-1.5 inline-flex rounded-full px-1.5 py-[1px] text-[6.5px] font-bold uppercase tracking-[0.05em]", rarity.color)}>
        {rarity.label}
      </div>
    </button>
  );
}

function SpecimenDetail({ entry, onClose }: { entry: CollectionEntry; onClose: () => void }) {
  const rarity = rarityFor(entry.bestGuesses);
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="absolute inset-0 bg-[#20322a]/35 backdrop-blur-[4px]" onClick={onClose} aria-label="Close specimen" />
      <motion.div
        initial={{ y: 28, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="glass-deep relative w-full max-w-[23rem] overflow-hidden rounded-[26px] p-4 text-center"
      >
        <SparkleField count={6} />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full border border-white/70 bg-white/55 text-[#71836e]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="relative mx-auto -mt-1 h-[86px] w-[110px]">
          <svg viewBox="0 0 120 90" className="h-full w-full">
            <path d="M60 82C28 70 22 36 40 14c28 4 46 26 40 52-2 10-8 14-20 16Z" fill="#e8eddc" stroke="#7e9778" strokeWidth="1" />
            <path d="M60 82c-4-24 2-46 16-64M60 82C48 66 42 48 44 26M62 54l22-12M58 44L38 34" fill="none" stroke="#7e9778" strokeWidth="0.9" />
            {[
              { x: 84, y: 40 },
              { x: 44, y: 36 },
              { x: 66, y: 22 },
            ].map((f, i) => (
              <g key={i} transform={`translate(${f.x} ${f.y})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse key={deg} cx="0" cy="-5" rx="3.6" ry="5" fill="#eddcb8" transform={`rotate(${deg})`} />
                ))}
                <circle r="2.6" fill="#c9a05d" />
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.16em] text-muted">Specimen · {entry.length} letters</div>
        <div className="mt-0.5 font-display text-[34px] leading-none tracking-[-0.02em] text-[#34483a]">{entry.word}</div>
        <div className={cn("mx-auto mt-2 inline-flex rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em]", rarity.color)}>
          {rarity.label}
        </div>
        <div className="mt-2 text-left">
          <WordLookup word={entry.word} variant="inline" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { label: "best", value: entry.bestGuesses },
            { label: "pressed", value: entry.times },
            { label: "source", value: entry.source === "daily" ? "bloom" : entry.source === "versus" ? "duel" : entry.source },
          ].map((item) => (
            <div key={item.label} className="rounded-[11px] border border-white/60 bg-white/40 py-1.5">
              <div className="font-display text-[16px] leading-none text-[#435844]">{item.value}</div>
              <div className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.08em] text-muted">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-1 text-[8px] font-medium text-[#7c8b76]">
          <CalendarDays className="h-2.5 w-2.5" />
          First pressed {new Date(entry.firstSolved).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </div>
        <button onClick={onClose} className="btn-primary mt-3 w-full !py-2 !text-[10.5px]">
          <Leaf className="h-3.5 w-3.5" /> Back to the herbarium
        </button>
      </motion.div>
    </motion.div>
  );
}

export function GardenSheet() {
  const { progress } = useGame();
  const [filter, setFilter] = useState<"all" | "4" | "5" | "6">("all");
  const [selected, setSelected] = useState<CollectionEntry | null>(null);
  const stage = companionStage(progress.companionXp);

  const counts = useMemo(
    () => ({
      4: progress.collection.filter((c) => c.length === 4).length,
      5: progress.collection.filter((c) => c.length === 5).length,
      6: progress.collection.filter((c) => c.length === 6).length,
    }),
    [progress.collection],
  );
  const entries = useMemo(() => {
    const list = filter === "all" ? progress.collection : progress.collection.filter((c) => String(c.length) === filter);
    return [...list].sort((a, b) => new Date(b.lastSolved).getTime() - new Date(a.lastSolved).getTime());
  }, [filter, progress.collection]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/75 bg-gradient-to-br from-[#eaf0e0]/90 via-[#eff0e4]/85 to-[#e7e9d8]/85 p-3">
        <SparkleField count={6} />
        <div className="relative flex items-center gap-2">
          <div className="relative h-[104px] w-[104px] shrink-0">
            <Companion xp={progress.companionXp} size={122} />
          </div>
          <div className="min-w-0 flex-1">
            <Eyebrow>Your garden spirit</Eyebrow>
            <div className="font-display text-[22px] leading-tight text-[#34483a]">{stage.stage.name}</div>
            <p className="mt-0.5 text-[8.5px] font-medium leading-relaxed text-[#718171]">{stage.stage.note}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Bar value={stage.progress} className="h-1.5 flex-1" />
              <span className="shrink-0 text-[7.5px] font-bold tabular-nums text-[#7b8b74]">
                {stage.next ? `${stage.toNext} xp` : "everbloom"}
              </span>
            </div>
            <div className="mt-1 text-[7.5px] font-medium uppercase tracking-[0.06em] text-[#8d9985]">
              {stage.index + 1} of {COMPANION_STAGES.length} stages
            </div>
          </div>
        </div>
        <div className="relative mt-2.5 grid grid-cols-3 gap-1.5">
          <SoftStat label="Pressed" value={progress.collection.length} icon={Leaf} detail="distinct words" />
          <SoftStat label="Journey" value={`${progress.journey.completed}/24`} icon={Map} detail="stones placed" />
          <SoftStat label="Dew" value={progress.dewdrops} icon={Droplet} detail="in the jar" />
        </div>
      </div>

      <div className="rounded-[20px] border border-white/65 bg-white/35 p-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3f5444]">Deck completion</div>
            <div className="text-[8px] font-medium text-muted">Every distinct word becomes a pressed specimen.</div>
          </div>
          <span className="chip !text-[8px]">{[...new Set(progress.collection.map((c) => c.word))].length} unique</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {([4, 5, 6] as WordLength[]).map((len) => {
            const count = counts[len];
            const total = SOLUTIONS[len].length;
            const pct = Math.min(1, count / total);
            return (
              <button
                key={len}
                onClick={() => setFilter(String(len) as "4" | "5" | "6")}
                className="rounded-[13px] border border-white/60 bg-white/35 p-1.5 text-left transition-colors hover:bg-white/55"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#465b49]">{len} letters</span>
                  <span className="text-[7px] font-bold uppercase tracking-[0.04em] text-[#85927f]">
                    {len === 4 ? "snack" : len === 5 ? "classic" : "master"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <ProgressRing value={pct} size={30} stroke={3}>
                    <span className="text-[7px] font-bold tabular-nums text-[#56705a]">{Math.round(pct * 100)}</span>
                  </ProgressRing>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold tabular-nums leading-none text-[#405544]">{count}</div>
                    <div className="mt-0.5 truncate text-[6.5px] font-medium uppercase tracking-[0.05em] text-muted">
                      of {total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Filter specimens"
        layoutId="garden-filter"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "4", label: "4L" },
          { value: "5", label: "5L" },
          { value: "6", label: "6L" },
        ]}
      />

      {entries.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {entries.map((entry) => (
              <SpecimenCard key={`${entry.length}-${entry.word}`} entry={entry} onOpen={() => setSelected(entry)} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 text-[8px] font-medium text-muted">
            <Leaf className="h-2.5 w-2.5" /> {entries.length} specimen{entries.length === 1 ? "" : "s"} · newest first
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-[20px] border border-dashed border-white/80 bg-white/25 px-4 py-7 text-center">
          <div className="mx-auto w-[86px]">
            <Companion xp={progress.companionXp} size={86} glow={false} />
          </div>
          <div className="mt-1 font-display text-[19px] text-[#4b5f4b]">The meadow is still asleep.</div>
          <p className="mx-auto mt-1 max-w-[17rem] text-[8.5px] leading-relaxed text-[#7c8b77]">
            Solve any word — Classic, Journey, Fever or a Duel — and it will be pressed here forever.
          </p>
        </div>
      )}

      <AnimatePresence>{selected && <SpecimenDetail entry={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}

/* ————————————————————————————————— Quests ————————————————————————————————— */

function QuestRow({ view, onClaim }: { view: QuestView; onClaim: () => void }) {
  const Icon = QUEST_ICONS[view.def.icon] ?? Leaf;
  const pct = view.value / view.def.target;
  return (
    <div className={cn("rounded-[17px] border p-2.5 transition-colors", view.claimed ? "border-white/55 bg-white/25" : view.ready ? "border-[#a8bd9f]/70 bg-white/55" : "border-white/55 bg-white/32")}>
      <div className="flex items-start gap-2">
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]", view.ready && !view.claimed ? "bg-gradient-to-br from-[#e2ecd8] to-[#c3d6bd] text-[#547357]" : "bg-white/45 text-[#81917c]")}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] font-bold leading-tight text-[#405544]">{view.def.title}</span>
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#efe5cd]/80 px-1.5 py-[1px] text-[7.5px] font-bold text-[#8b703d]">
              <Droplet className="h-2 w-2" /> {view.def.reward}
            </span>
          </div>
          <div className="mt-0.5 text-[8px] font-medium text-muted">{view.def.detail}</div>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <Bar value={pct} className="h-1.5 flex-1" barClassName={view.claimed ? "from-[#b8c7ae] to-[#9db096]" : undefined} />
        <span className="shrink-0 text-[7.5px] font-bold tabular-nums text-[#7d8b76]">
          {view.value}/{view.def.target}
        </span>
        {view.claimed ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/60 bg-white/45 px-1.5 py-[2px] text-[7px] font-bold uppercase tracking-[0.04em] text-[#788c72]">
            <Check className="h-2 w-2" /> done
          </span>
        ) : view.ready ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClaim}
            className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/30 bg-gradient-to-r from-[#6c8767] to-[#4d6a55] px-2 py-[3px] text-[7.5px] font-bold text-[#fbfaf3] shadow-[0_4px_8px_-5px_rgba(45,74,54,0.8)]"
          >
            Claim <Sparkles className="h-2 w-2" />
          </motion.button>
        ) : (
          <span className="shrink-0 rounded-full border border-white/60 bg-white/35 px-1.5 py-[2px] text-[6.5px] font-bold uppercase tracking-[0.04em] text-[#96a08f]">
            +{view.def.pollen} pollen
          </span>
        )}
      </div>
    </div>
  );
}

export function QuestsSheet() {
  const { progress, claimQuest, claimBloomTier, startDailyBloom, dailyBloomInfo, openSheet } = useGame();
  const daily = questViews(progress.quests, "daily");
  const weekly = questViews(progress.quests, "weekly");
  const bloom = bloomClaims(progress.quests);
  const [until, setUntil] = useState(() => msUntilMidnight());

  useEffect(() => {
    const timer = window.setInterval(() => setUntil(msUntilMidnight()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const dailyDone = daily.filter((q) => q.claimed).length;
  const weeklyDone = weekly.filter((q) => q.claimed).length;
  const nextTier = bloom.find((b) => !b.claimed);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/75 bg-gradient-to-br from-[#f0e7d3]/90 via-[#edecdf]/85 to-[#e4ebdc]/85 p-3">
        <SparkleField count={8} />
        <div className="relative flex items-start justify-between gap-2">
          <div>
            <Eyebrow>Today · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</Eyebrow>
            <div className="font-display text-[23px] leading-tight text-[#394d3c]">A little tending.</div>
            <p className="mt-0.5 text-[8.5px] font-medium text-[#748270]">
              Quests refresh in {formatCountdown(until)} · pollen resets Monday
            </p>
          </div>
          <Dew amount={progress.dewdrops} minimal />
        </div>
        <div className="relative mt-2.5 flex items-center gap-2 rounded-[14px] border border-white/70 bg-white/40 px-2.5 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-[#efdfbd] to-[#d8ba80] text-[#85682f]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8a7441]">Weekly pollen</span>
              <span className="text-[10px] font-bold tabular-nums text-[#4f6448]">{progress.quests.pollen}</span>
            </div>
            <Bar
              value={nextTier ? Math.min(1, progress.quests.pollen / nextTier.tier.at) : 1}
              className="mt-1 h-1.5"
              barClassName="from-[#dcc18c] via-[#cba764] to-[#b48d47]"
            />
            <div className="mt-0.5 text-[7px] font-medium text-[#8b9781]">
              {nextTier ? `${Math.max(0, nextTier.tier.at - progress.quests.pollen)} pollen to ${nextTier.tier.label}` : "Every tier gathered. Everbloom."}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={startDailyBloom}
        disabled={dailyBloomInfo.done}
        className={cn(
          "flex items-center gap-2.5 rounded-[18px] border px-3 py-2.5 text-left",
          dailyBloomInfo.done ? "border-white/60 bg-white/30" : "border-[#d6c095]/70 bg-gradient-to-r from-[#f4ead4]/90 to-[#e8ecd9]/85",
        )}
      >
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border", dailyBloomInfo.done ? "border-white/70 bg-white/45 text-[#6c8568]" : "border-white/80 bg-gradient-to-br from-[#f0ddb9] to-[#d6b77e] text-[#84672f]")}>
          {dailyBloomInfo.done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Flower2 className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold text-[#4b573c]">Daily Bloom · {dailyBloomInfo.length} letters</span>
          <span className="block truncate text-[8px] font-medium text-[#7d856c]">
            {dailyBloomInfo.done ? `Pressed in ${dailyBloomInfo.bestGuesses} guesses.` : "The same word for every player today. +30 dew."}
          </span>
        </span>
        {!dailyBloomInfo.done && <ArrowRight className="h-4 w-4 shrink-0 text-[#9a8552]" />}
      </button>

      <div>
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5 text-[#9c854e]" />
            <span className="text-[10px] font-bold text-[#405544]">Daily quests</span>
            <span className="chip !py-0 !text-[7.5px]">{dailyDone}/{daily.length}</span>
          </div>
          <span className="text-[7.5px] font-semibold uppercase tracking-[0.07em] text-muted">resets at midnight</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {daily.map((view) => (
            <QuestRow key={view.def.id} view={view} onClaim={() => claimQuest("daily", view.def.id)} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#7c8e72]" />
            <span className="text-[10px] font-bold text-[#405544]">Weekly rituals</span>
            <span className="chip !py-0 !text-[7.5px]">{weeklyDone}/{weekly.length}</span>
          </div>
          <span className="text-[7.5px] font-semibold uppercase tracking-[0.07em] text-muted">bigger rewards</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {weekly.map((view) => (
            <QuestRow key={view.def.id} view={view} onClaim={() => claimQuest("weekly", view.def.id)} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#c3a46a]" />
            <span className="text-[10px] font-bold text-[#405544]">The weekly bloom</span>
          </div>
          <span className="text-[7.5px] font-semibold uppercase tracking-[0.07em] text-muted">10 tiers · pollen</span>
        </div>
        <div className="no-scrollbar -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-1">
          {bloom.map(({ tier, index, claimed, ready }) => (
            <div
              key={index}
              className={cn(
                "flex w-[78px] shrink-0 flex-col items-center gap-1 rounded-[14px] border px-1.5 py-2 text-center transition-colors",
                claimed
                  ? "border-white/70 bg-white/50"
                  : ready
                    ? "border-[#c8ad78]/80 bg-gradient-to-b from-[#f4e8ce] to-[#e7d3a8] shadow-[0_8px_16px_-14px_rgba(130,102,49,0.8)]"
                    : "border-white/55 bg-white/28",
              )}
            >
              <ProgressRing value={Math.min(1, progress.quests.pollen / tier.at)} size={30} stroke={2.5} urgent={ready}>
                <span className="text-[7px] font-bold tabular-nums text-[#68785f]">{tier.at}</span>
              </ProgressRing>
              <div className="text-[6.5px] font-bold uppercase leading-tight tracking-[0.04em] text-[#7c876f]">
                {tier.label}
              </div>
              {claimed ? (
                <span className="flex items-center gap-0.5 text-[6.5px] font-bold uppercase tracking-[0.04em] text-[#7b916f]">
                  <Check className="h-2 w-2" /> done
                </span>
              ) : ready ? (
                <button
                  onClick={() => claimBloomTier(index)}
                  className="rounded-full bg-gradient-to-r from-[#7c8e5e] to-[#59714e] px-2 py-[2px] text-[6.5px] font-bold uppercase tracking-[0.05em] text-white"
                >
                  gather
                </button>
              ) : (
                <span className="text-[6.5px] font-bold uppercase tracking-[0.04em] text-[#a3ac9b]">
                  {Math.max(0, tier.at - progress.quests.pollen)} left
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => openSheet("journey")}
        className="flex items-center justify-between rounded-[15px] border border-white/60 bg-white/30 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-[9px] font-bold text-[#4c6150]">
          <Map className="h-3.5 w-3.5 text-[#81937b]" /> Looking for a longer arc? Walk the Quiet Path.
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-[#93a08f]" />
      </button>
    </div>
  );
}

/* ————————————————————————————————— Profile ————————————————————————————————— */

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-300",
        on
          ? "border-[#63825f]/40 bg-gradient-to-r from-[#7f9b80] to-[#5c7b62]"
          : "border-[#5d705f]/20 bg-[#63755f]/20",
      )}
    >
      <motion.span
        initial={false}
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
        className="absolute left-[2px] top-[2px] h-[15px] w-[15px] rounded-full border border-white/80 bg-white shadow-[0_1px_3px_rgba(40,55,40,0.3)]"
      />
    </button>
  );
}

export function ProfileSheet() {
  const { progress, level, setName, updateSettings, openSheet, equipGlaze, buyGlaze } = useGame();
  const [name, setNameLocal] = useState(progress.name);
  const [saved, setSaved] = useState(false);
  const stage = companionStage(progress.companionXp);
  const summary = useMemo(() => journeySummary(progress.journey.stars), [progress.journey.stars]);

  useEffect(() => {
    setNameLocal(progress.name);
  }, [progress.name]);

  const mastery = ([4, 5, 6] as WordLength[]).map((len) => {
    const count = progress.collection.filter((c) => c.length === len).length;
    return { len, count, ...masteryFor(count) };
  });

  const nearest = ACHIEVEMENTS.filter((a) => !progress.unlockedAchievements.includes(a.id))
    .map((a) => ({ a, value: achievementValue(a, progress) }))
    .sort((x, y) => y.value / y.a.target - x.value / x.a.target)
    .slice(0, 4);

  const saveName = () => {
    setName(name);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/75 bg-gradient-to-br from-[#e9f0df]/90 to-[#ececdf]/85 p-3">
        <SparkleField count={6} />
        <div className="relative flex items-start gap-2.5">
          <div className="relative -mt-2 h-[108px] w-[108px] shrink-0">
            <Companion xp={progress.companionXp} size={128} />
          </div>
          <div className="min-w-0 flex-1">
            <Eyebrow>Your profile</Eyebrow>
            <div className="mt-0.5 flex items-center gap-1.5">
              <input
                value={name}
                onChange={(e) => setNameLocal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                }}
                maxLength={16}
                aria-label="Your name"
                enterKeyHint="done"
                className="w-full min-w-0 rounded-[8px] border border-transparent bg-transparent px-0 py-0 font-display text-[24px] leading-tight text-[#2f4337] outline-none transition-colors focus:border-white/80 focus:bg-white/40 focus:px-1.5"
              />
              <button
                onClick={saveName}
                aria-label="Save name"
                className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[#6f856c]", saved ? "border-[#9ab390]/70 bg-[#dfe9d8]" : "border-white/70 bg-white/50")}
              >
                {saved ? <Check className="h-3 w-3" strokeWidth={2.6} /> : <Pencil className="h-2.5 w-2.5" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[8.5px] font-medium text-[#70816d]">
              <span>Level {level.level}</span>
              <span className="h-[2px] w-[2px] rounded-full bg-[#96a492]" />
              <span>{level.title}</span>
              <span className="h-[2px] w-[2px] rounded-full bg-[#96a492]" />
              <span>{stage.stage.name}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Bar value={level.progress} className="h-1.5 flex-1" />
              <span className="shrink-0 text-[7px] font-bold tabular-nums text-[#7c8b76]">
                {level.xpInLevel}/{level.xpToNext} xp
              </span>
            </div>
            <div className="mt-1 text-[7.5px] font-medium text-[#8d9985]">
              {stage.next ? `${stage.toNext} xp until ${stage.next.name.toLowerCase()}` : "Your spirit has reached everbloom."}
            </div>
          </div>
        </div>
        <div className="relative mt-2.5 grid grid-cols-4 gap-1.5">
          <SoftStat label="Wins" value={progress.stats.wins} />
          <SoftStat label="Solve streak" value={progress.stats.currentStreak} />
          <SoftStat label="Specimens" value={progress.collection.length} />
          <SoftStat label="Stars" value={summary.totalStars} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {mastery.map((m) => (
          <div key={m.len} className="rounded-[15px] border border-white/60 bg-white/35 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-muted">{m.len} letters</span>
              <span className="text-[8px] font-bold tabular-nums text-[#7e8d76]">{m.count}</span>
            </div>
            <div className="mt-1 font-display text-[15px] leading-none text-[#405543]">{m.rank}</div>
            <Bar value={m.progress} className="mt-1.5 h-1" />
            <div className="mt-0.5 truncate text-[6.5px] font-medium text-muted">
              {m.nextAt ? `${m.next} at ${m.nextAt}` : "everbloom"}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-white/65 bg-white/35 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3f5444]">Journey</div>
            <div className="text-[8px] font-medium text-muted">
              {summary.cleared} of {summary.total} stones · {summary.perfect} perfect
            </div>
          </div>
          <button onClick={() => openSheet("journey")} className="btn-ghost !px-2.5 !py-1.5 !text-[8.5px]">
            <Map className="h-3 w-3" /> Walk
          </button>
        </div>
        <Bar value={summary.totalStars / summary.maxStars} className="mt-2 h-1.5" />
        <div className="mt-1 flex items-center justify-between text-[7.5px] font-semibold text-muted">
          <span>{summary.totalStars} stars gathered</span>
          <span>next · {summary.current.name}</span>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/65 bg-white/35 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-[#3f5444]">Blossoming badges</div>
            <div className="text-[8px] font-medium text-muted">
              {progress.unlockedAchievements.length} of {ACHIEVEMENTS.length} in bloom
            </div>
          </div>
          <button onClick={() => openSheet("achievements")} className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#7f907a]">
            view all
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {nearest.map(({ a, value }) => (
            <div key={a.id} className="flex items-center gap-2">
              <AchievementGlyph glyph={a.glyph} unlocked={false} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[9.5px] font-bold text-[#425744]">{a.name}</span>
                  <span className="shrink-0 text-[7.5px] font-bold tabular-nums text-muted">
                    {Math.min(value, a.target)}/{a.target}
                  </span>
                </div>
                <Bar value={value / a.target} className="mt-0.5 h-1" />
              </div>
            </div>
          ))}
          {nearest.length === 0 && (
            <div className="rounded-[12px] border border-white/55 bg-white/30 p-2 text-center text-[9px] font-semibold text-[#6f846c]">
              Every badge is in bloom. A beautiful garden.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/65 bg-white/35 p-3">
        <div className="text-[10.5px] font-bold text-[#3f5444]">Comfort</div>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {[
            { on: progress.sound, toggle: () => updateSettings({ sound: !progress.sound }), icon: Volume2, label: "Sound" },
            { on: progress.haptics, toggle: () => updateSettings({ haptics: !progress.haptics }), icon: Vibrate, label: "Haptics" },
            { on: progress.tileSymbols, toggle: () => updateSettings({ tileSymbols: !progress.tileSymbols }), icon: Eye, label: "Symbols" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-1 rounded-[12px] border border-white/55 bg-white/35 px-1.5 py-2">
                <Icon className="h-3.5 w-3.5 text-[#7d9074]" strokeWidth={1.8} />
                <span className="text-[8px] font-bold text-[#4d6150]">{item.label}</span>
                <Toggle on={item.on} onChange={item.toggle} label={item.label} />
              </div>
            );
          })}
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#73836e]">Tile glaze</span>
            <button onClick={() => openSheet("shop")} className="text-[7.5px] font-bold uppercase tracking-[0.06em] text-[#879581]">
              Atelier
            </button>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {GLAZES.map((glaze) => {
              const active = progress.glaze === glaze.id;
              const owned = progress.ownedGlazes.includes(glaze.id);
              return (
                <button
                  key={glaze.id}
                  onClick={() => (owned ? equipGlaze(glaze.id) : buyGlaze(glaze.id))}
                  className={cn(
                    "flex-1 rounded-[11px] border p-1 text-center transition-colors",
                    active ? "border-[#90aa88]/80 bg-white/65" : "border-white/55 bg-white/30",
                  )}
                  aria-label={`${glaze.name}${active ? " selected" : ""}`}
                >
                  <span
                    className="block h-5 w-full rounded-[6px] border border-white/70 shadow-inner"
                    style={{ background: `linear-gradient(145deg, ${glaze.swatches[0]}, ${glaze.swatches[1]})` }}
                  />
                  <span className="mt-0.5 flex items-center justify-center gap-0.5 text-[6px] font-bold uppercase tracking-[0.03em] text-[#6d7e6a]">
                    {!owned && <Lock className="h-1.5 w-1.5" />}
                    {glaze.name.split(" ")[1] ?? glaze.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => openSheet("stats")} className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/32 px-2.5 py-2 text-left">
          <Trophy className="h-3.5 w-3.5 text-[#8a9b80]" />
          <span className="flex-1 text-[9px] font-bold text-[#4b6050]">Quiet progress</span>
          <ChevronRight className="h-3 w-3 text-[#98a492]" />
        </button>
        <button onClick={() => openSheet("gift")} className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/32 px-2.5 py-2 text-left">
          <Gift className="h-3.5 w-3.5 text-[#8a9b80]" />
          <span className="flex-1 text-[9px] font-bold text-[#4b6050]">Daily gift</span>
          <ChevronRight className="h-3 w-3 text-[#98a492]" />
        </button>
        <button onClick={() => openSheet("settings")} className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/32 px-2.5 py-2 text-left">
          <Settings2 className="h-3.5 w-3.5 text-[#8a9b80]" />
          <span className="flex-1 text-[9px] font-bold text-[#4b6050]">All settings</span>
          <ChevronRight className="h-3 w-3 text-[#98a492]" />
        </button>
        <button onClick={() => openSheet("help")} className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/32 px-2.5 py-2 text-left">
          <BookOpen className="h-3.5 w-3.5 text-[#8a9b80]" />
          <span className="flex-1 text-[9px] font-bold text-[#4b6050]">How to play</span>
          <ChevronRight className="h-3 w-3 text-[#98a492]" />
        </button>
      </div>

      <Divider />
      <div className="pb-1 text-center">
        <div className="font-display text-[16px] text-[#6d7d6b]">serein</div>
        <div className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Version 1.1 · a longer quiet</div>
      </div>
    </div>
  );
}
