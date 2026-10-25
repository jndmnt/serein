import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Crown,
  Droplet,
  Flame,
  Flower2,

  Leaf,
  Play,
  Sparkles,
  Map,
  RotateCcw,
  Star,
  Timer,
  Trophy,
  Wind,
  X,
} from "lucide-react";
import { useGame } from "../game/GameController";
import { WordLookup } from "./Meaning";
import { questViews } from "../game/quests";
import { journeySummary } from "../game/journey";
import { RITUAL_STILL } from "../assets/ritualStill";
import { cn } from "../utils/cn";
import { Bar, ProgressRing, SparkleField, Wordmark } from "./Primitives";

function Petals({ count = 14 }: { count?: number }) {
  const colors = ["#cfdcbf", "#e6d3ad", "#b9cdb4", "#e9c9a8", "#f0e6d0"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${(i * 29 + 7) % 96}%`,
            width: 5 + (i % 3) * 2,
            height: 8 + (i % 4) * 2,
            borderRadius: "60% 40% 55% 45%",
            background: colors[i % colors.length],
            opacity: 0.7,
            ["--drift" as string]: `${(i % 2 ? 1 : -1) * (14 + (i % 5) * 9)}px`,
            animation: `petal-fall ${3.4 + (i % 4) * 0.6}s ease-in forwards`,
            animationDelay: `${(i % 7) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function WordTiles({ word, tone = "correct" }: { word: string; tone?: "correct" | "plain" }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {word.split("").map((letter, i) => (
        <motion.div
          key={`${letter}-${i}`}
          initial={{ opacity: 0, rotateX: -60, y: 8 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ delay: 0.15 + i * 0.055, type: "spring", stiffness: 260, damping: 20 }}
          className={cn("tile tile-base grid place-items-center", tone === "correct" ? "tile-correct" : "tile-filled")}
          style={{ width: 40, height: 40, fontSize: 18, transformPerspective: 600 }}
        >
          {letter.toUpperCase()}
        </motion.div>
      ))}
    </div>
  );
}

function NextUp({
  practice,
  isJourney,
  onQuests,
  onJourney,
}: {
  practice: boolean;
  isJourney: boolean;
  onQuests: () => void;
  onJourney: () => void;
}) {
  const { progress, lastRound } = useGame();
  const daily = questViews(progress.quests, "daily");
  const nextQuest = daily.find((q) => !q.claimed) ?? questViews(progress.quests, "weekly").find((q) => !q.claimed);
  const journey = journeySummary(progress.journey.stars);
  const target = journey.current;

  return (
    <div className="relative mt-2 rounded-[14px] border border-white/60 bg-white/28 p-2">
      <div className="mb-1 flex items-center justify-between px-0.5">
        <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-muted">Next in the garden</span>
        <span className="text-[6.5px] font-semibold uppercase tracking-[0.08em] text-[#8a9781]">
          {isJourney ? "the path" : practice ? "the path & quests" : "quests"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {(practice || isJourney || lastRound?.daily) && (
          <button
            onClick={onJourney}
            className="flex items-center gap-1.5 rounded-[10px] border border-white/55 bg-white/40 px-1.5 py-1 text-left transition-colors hover:bg-white/60"
          >
            <Map className="h-3 w-3 shrink-0 text-[#7c9077]" />
            <span className="min-w-0 flex-1 truncate text-[8px] font-bold text-[#4a5f4c]">
              {lastRound?.nextLevel ? `Next stone · ${lastRound.nextLevel}` : `Continue · ${target.name}`}
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-[6.5px] font-bold uppercase tracking-[0.05em] text-[#8a9780]">
              <Star className="h-2 w-2 fill-[#c9a05d] text-[#c9a05d]" /> {journey.totalStars}
            </span>
          </button>
        )}
        {nextQuest && (
          <button
            onClick={onQuests}
            className="flex items-center gap-1.5 rounded-[10px] border border-white/55 bg-white/40 px-1.5 py-1 text-left transition-colors hover:bg-white/60"
          >
            <Sparkles className="h-3 w-3 shrink-0 text-[#a98c53]" />
            <span className="min-w-0 flex-1 truncate text-[8px] font-bold text-[#4a5f4c]">{nextQuest.def.title}</span>
            <span className="shrink-0 text-[6.5px] font-bold tabular-nums text-[#8a9780]">
              {nextQuest.value}/{nextQuest.def.target} · +{nextQuest.def.reward}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ResultOverlay() {
  const {
    resultOpen,
    closeResult,
    mode,
    length,
    classic,
    fever,
    progress,
    beginFever,
    notify,
    level,
    lastRound,
    session,
    advanceAfterClassic,
    openSheet,
    startJourneyLevel,
  } = useGame();

  const show = resultOpen && (mode === "classic" || mode === "fever");
  if (!show) return null;

  const feverDew = fever.solved * 6 + Math.round(fever.score / 200);
  const feverXp = fever.solved * 14 + Math.round(fever.score / 50);
  const won = mode === "classic" ? classic.status === "won" : fever.solved > 0;
  const bestTier = fever.bestCombo >= 6 ? 3 : fever.bestCombo >= 4 ? 2 : fever.bestCombo >= 2 ? 1.5 : 1;
  const isJourney = mode === "classic" && session.kind === "journey";
  const isDaily = mode === "classic" && session.kind === "daily";
  const stars = isJourney ? lastRound?.stars ?? 0 : 0;

  const share = async () => {
    const grid =
      mode === "classic"
        ? classic.guesses
            .map((g) => g.states.map((s) => (s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬜")).join(""))
            .join("\n")
        : `❄ Fever · ${fever.solved} words · ${fever.score} points`;
    const label = isJourney
      ? `Journey · ${lastRound?.title ?? session.title}`
      : isDaily
        ? "Daily Bloom"
        : mode === "classic"
          ? `${length} letters`
          : "Word Fever";
    const text = `serein · a word ritual\n${label} · ${
      mode === "classic" ? `${classic.guesses.length}/${classic.maxGuesses} guesses` : `${fever.solved} words · ${fever.score} points`
    }${isJourney && lastRound?.stars ? ` · ${"★".repeat(lastRound.stars)}` : ""}\n${grid}\n`;
    try {
      await navigator.clipboard.writeText(text);
      notify("Ritual copied", { tone: "success", icon: "sparkle", detail: "Paste it wherever calm lives." });
    } catch {
      notify("Couldn't copy this time", { tone: "error", icon: "wind" });
    }
  };

  const next = () => {
    if (mode === "fever") {
      closeResult();
      beginFever();
    } else {
      advanceAfterClassic();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="result"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          aria-label="Close result"
          className="absolute inset-0 bg-[#1e3026]/35 backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeResult}
        />
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="glass-deep relative max-h-[92dvh] w-full max-w-[25.5rem] overflow-y-auto no-scrollbar rounded-[30px] border-white/90 p-4 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={won ? "Ritual complete" : "Ritual ended"}
        >
          <SparkleField count={won ? 10 : 4} />
          {won && <Petals count={12} />}
          <button
            onClick={closeResult}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/50 text-[#72836f] transition-colors hover:bg-white/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
                won
                  ? "border-white/80 bg-gradient-to-br from-[#d6e4ce] to-[#a9c3a4] text-[#4c6b53]"
                  : "border-white/70 bg-gradient-to-br from-[#e9e2d3] to-[#d3cbb8] text-[#8a806a]",
              )}
            >
              {mode === "fever" ? <Timer className="h-5 w-5" strokeWidth={1.8} /> : won ? <Leaf className="h-5 w-5" strokeWidth={1.8} /> : <Wind className="h-5 w-5" strokeWidth={1.8} />}
            </div>
            <div className="eyebrow mt-2.5">
              {mode === "fever"
                ? "Word fever · run complete"
                : isJourney
                  ? `Journey · ${lastRound?.title ?? session.title}`
                  : isDaily
                    ? "Daily Bloom · shared today"
                    : won
                      ? `Ritual no. ${progress.stats.played + 100}`
                      : "The word slipped by"}
            </div>
            <h2 className="mt-1.5 font-display text-[28px] leading-[1.02] text-[#2c3d30] sm:text-[30px]">
              {mode === "fever"
                ? fever.solved > 0
                  ? "The rush settles."
                  : "A quiet beginning."
                : isJourney
                  ? won
                    ? "The stone is set."
                    : "The path is patient."
                  : isDaily
                    ? won
                      ? "Today's bloom, tended."
                      : "The bloom keeps its secret."
                    : won
                      ? "You found the still word."
                      : "Stillness, another day."}
            </h2>
            <p className="mt-1.5 max-w-[19rem] text-[10px] leading-relaxed text-[#6f7f70]">
              {mode === "fever"
                ? fever.solved > 0
                  ? `You unspooled ${fever.solved} ${fever.solved === 1 ? "word" : "words"} in sixty seconds of flow. ${fever.lastBonus > 0 ? "Beautiful rhythm." : ""}`
                  : "The clock is a companion, not a judge. Begin again whenever you like."
                : isJourney
                  ? won
                    ? `Found in ${classic.guesses.length} ${classic.guesses.length === 1 ? "guess" : "guesses"}${classic.hintsUsed ? " with a little help" : " with nothing but attention"}. ${stars === 3 ? "A perfect stone." : stars === 2 ? "A graceful solve." : "One more stone along the path."}`
                    : `The ${lastRound?.title ?? "stone"} asked for ${classic.maxGuesses} guesses. Retry it whenever you feel ready.`
                  : isDaily
                    ? won
                      ? `Everyone shares today's word — you found it in ${classic.guesses.length} ${classic.guesses.length === 1 ? "guess" : "guesses"}. A bloom bonus is in your jar.`
                      : "The shared word will return to the meadow at midnight. Tomorrow brings another."
                    : won
                      ? `Found in ${classic.guesses.length} ${classic.guesses.length === 1 ? "guess" : "guesses"}${classic.hintsUsed ? " with a little help from the garden" : " with nothing but attention"}.`
                      : "The word was tucked away this time. The deck has already prepared another."}
            </p>
          </div>

          {isJourney && (
            <div className="relative mt-3 flex items-center justify-center gap-2 rounded-[14px] border border-white/60 bg-white/35 px-3 py-2">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0.4, opacity: 0, rotate: -18 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <Star
                      className={cn("h-5 w-5", i < stars ? "fill-[#c9a05d] text-[#c9a05d]" : "text-[#aebba9]")}
                      strokeWidth={1.5}
                    />
                  </motion.span>
                ))}
              </div>
              <div className="h-5 w-px bg-[#4c6553]/12" />
              <span className="text-[8.5px] font-bold uppercase tracking-[0.09em] text-[#6f816d]">
                {lastRound?.journeyCleared ? "new stone placed" : stars === 3 ? "perfect · under par, no hints" : "walked again"}
              </span>
            </div>
          )}

          {!won && isDaily && null}

          <div className="relative z-10 mt-3.5">
            {mode === "fever" ? (
              <>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Flow score", value: fever.score.toLocaleString() },
                  { label: "Words", value: fever.solved },
                  { label: "Best combo", value: `×${bestTier}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-[14px] border border-white/60 bg-white/40 px-1.5 py-2 text-center">
                    <div className="font-display text-[22px] leading-none text-[#354a3b]">{s.value}</div>
                    <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
              {fever.lastWord && (
                <div className="mt-2 flex justify-center">
                  <WordLookup word={fever.lastWord} />
                </div>
              )}
              </>
            ) : (
              <div className="rounded-[18px] border border-white/60 bg-white/35 px-3 py-3">
                <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                  {won ? "The word" : "The quiet word was"}
                </div>
                <div className="mt-2">
                  <WordTiles word={classic.word} tone={won ? "correct" : "plain"} />
                </div>
                <div className="mt-2 flex justify-center">
                  <WordLookup word={classic.word} />
                </div>
              </div>
            )}
          </div>

          {lastRound?.chapterCleared && (
            <div className="relative mt-2 flex items-center gap-2 rounded-[13px] border border-[#d9c495]/70 bg-gradient-to-r from-[#f3e7cf]/85 to-[#e9ecda]/75 px-2.5 py-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/80 bg-white/55 text-[#9a7d40]">
                <Crown className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-[#6d5a33]">Chapter complete · {lastRound.chapterCleared}</div>
                <div className="text-[7.5px] font-medium text-[#8b7f5f]">+110 dewdrops and +20 pollen for the whole chapter.</div>
              </div>
            </div>
          )}

          {(lastRound?.newSpecimens ?? 0) > 0 && (
            <div className="relative mt-2 flex items-center justify-center gap-1.5 rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-[8.5px] font-bold text-[#5b7459]">
              <Flower2 className="h-3 w-3 text-[#7f9779]" />
              {lastRound?.newSpecimens} new specimen{(lastRound?.newSpecimens ?? 0) === 1 ? "" : "s"} pressed in the herbarium
            </div>
          )}

          <div className="relative z-10 mt-2 grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-gradient-to-br from-[#eef0e2]/70 to-[#e5e9d8]/50 px-2.5 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#cfe3d7] to-[#a7c4b4]">
                <Droplet className="h-3.5 w-3.5 text-[#517163]" />
              </span>
              <div className="text-left">
                <div className="text-[13px] font-bold leading-none text-[#3e5444]">
                  +{mode === "fever" ? feverDew : classic.earned}
                </div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.08em] text-muted">dewdrops</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/35 px-2.5 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7ecdc]">
                <Sparkles className="h-3.5 w-3.5 text-[#7d916d]" />
              </span>
              <div className="text-left">
                <div className="text-[13px] font-bold leading-none text-[#3e5444]">
                  +{mode === "fever" ? feverXp : classic.xpEarned}
                </div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.08em] text-muted">experience</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-2 rounded-[14px] border border-white/55 bg-white/25 px-3 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                Level {level.level} · {level.title}
              </span>
              <span className="text-[8px] font-semibold text-muted">{level.xpInLevel}/{level.xpToNext} XP</span>
            </div>
            <Bar value={level.progress} className="mt-1.5 h-1" />
          </div>

          <NextUp
            practice={!isJourney && !isDaily && mode === "classic"}
            isJourney={isJourney}
            onQuests={() => {
              closeResult();
              openSheet("quests");
            }}
            onJourney={() => {
              closeResult();
              if (lastRound?.nextLevel) {
                const level = journeySummary(progress.journey.stars);
                startJourneyLevel(level.current.id);
              } else {
                openSheet("journey");
              }
            }}
          />

          <div className="relative z-10 mt-3.5 flex items-center gap-2">
            <button
              onClick={next}
              className="btn-primary flex-1 !py-2.5 !text-[11px]"
            >
              {mode === "fever" ? (
                <><Play className="h-3.5 w-3.5 fill-current" /> Run again</>
              ) : isJourney ? (
                won ? <><Map className="h-3.5 w-3.5" /> Continue path</> : <><RotateCcw className="h-3.5 w-3.5" /> Retry stone</>
              ) : (
                <><ArrowRight className="h-3.5 w-3.5" /> Next ritual</>
              )}
            </button>
            <button
              onClick={share}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/70 bg-white/50 text-[#6d806d] transition-colors hover:bg-white/80"
              aria-label="Copy result"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mt-2 flex items-center justify-center gap-3 text-[8px] font-medium text-muted">
            <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5" /> {progress.stats.currentStreak} solve streak</span>
            <span className="h-2.5 w-px bg-[#4c6553]/15" />
            <span className="flex items-center gap-1"><Trophy className="h-2.5 w-2.5" /> {progress.stats.wins} total wins</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function WelcomeOverlay() {
  const { progress, dismissIntro, dictionarySize } = useGame();
  if (progress.seenIntro) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-[#20322a]/40 backdrop-blur-[8px]" />
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 26 }}
          className="glass-deep relative flex max-h-[92dvh] w-full max-w-[46rem] flex-col overflow-hidden rounded-[30px] border-white/90 md:flex-row"
        >
          <div className="relative h-36 shrink-0 overflow-hidden md:h-auto md:w-[45%]">
            <img src={RITUAL_STILL} alt="Ceramic ritual tiles with eucalyptus and a dewdrop" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c4033]/55 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#f8f6ee]/30" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-2.5 py-1 backdrop-blur-md">
              <Leaf className="h-3 w-3 text-white" />
              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white">Organic zen · word ritual</span>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar p-5 md:p-6">
            <Wordmark compact />
            <h2 className="mt-4 font-display text-[30px] leading-[1.02] tracking-[-0.01em] text-[#2b3a2f] sm:text-[34px]">
              Welcome to a <em className="text-[var(--accent)]">deeper</em> quiet.
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6f8071]">
              A tactile garden of words that keeps growing. Ceramic tiles, soft marimba chimes, a curated deck that never
              repeats, and a path through six chapters of stillness.
            </p>
            <div className="mt-3.5 flex flex-col gap-1.5">
              {[
                { icon: Leaf, title: "A path that remembers", body: "24 Journey puzzles, three stars each, six calm chapters." },
                { icon: Timer, title: "Daily Bloom & quests", body: "A shared word each day, gentle quests and a weekly bloom track." },
                { icon: Flower2, title: "Your own herbarium", body: "Every solved word is pressed forever; a spirit grows alongside." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-2.5 rounded-[14px] border border-white/60 bg-white/35 p-2">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-white/70 bg-white/55 text-[#688061]">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <div className="text-[9.5px] font-bold text-[#3f5444]">{f.title}</div>
                      <div className="text-[8.5px] leading-relaxed text-muted">{f.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={dismissIntro} className="btn-primary mt-4 w-full !py-2.5 !text-[11px]">
              Enter the garden <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[7.5px] font-medium uppercase tracking-[0.08em] text-muted">
              <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5" /> no account</span>
              <span className="h-2.5 w-px bg-[#4c6553]/15" />
              <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5" /> no ads</span>
              <span className="h-2.5 w-px bg-[#4c6553]/15" />
              <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5" /> {dictionarySize.toLocaleString()} words</span>
              <span className="h-2.5 w-px bg-[#4c6553]/15" />
              <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5" /> 6 chapters</span>
            </div>
          </div>
          <button
            onClick={dismissIntro}
            aria-label="Skip welcome"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/55 text-[#697d69] backdrop-blur-md"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const TOAST_ICON = {
  sparkle: Sparkles,
  drop: Droplet,
  wind: Wind,
  sun: Sparkles,
  leaf: Leaf,
  flower: Flower2,
};

export function ToastStack() {
  const { toasts, dismissToast } = useGame();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-1.5 px-3 lg:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.icon ?? "leaf"] ?? Sparkles;
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={() => dismissToast(t.id)}
              className={cn(
                "pointer-events-auto flex w-full max-w-[24rem] items-center gap-2.5 rounded-[16px] border px-3 py-2 text-left shadow-[0_18px_40px_-22px_rgba(30,45,35,0.7)] backdrop-blur-xl",
                t.tone === "error"
                  ? "border-[#d7b3a2]/70 bg-[#f7ebe3]/90"
                  : t.tone === "success" || t.tone === "reward"
                    ? "border-white/80 bg-[#f3f4e9]/95"
                    : "border-white/80 bg-[#f7f5ec]/95",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                  t.tone === "error"
                    ? "border-[#dfbfae]/60 bg-[#eed9c9] text-[#a06c50]"
                    : "border-white/80 bg-gradient-to-br from-[#e3eddb] to-[#c8dac3] text-[#5b7a5f]",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-bold text-[#3f5243]">{t.text}</span>
                {t.detail && <span className="block truncate text-[8.5px] font-medium text-[#7b8a78]">{t.detail}</span>}
              </span>
              {t.tone === "reward" && (
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e9dcc0] text-[#8a6f3e]">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function MiniTimer({ seconds }: { seconds: number }) {
  return (
    <ProgressRing value={Math.max(0, Math.min(1, seconds / 60))} size={30} stroke={2.5}>
      <span className="text-[8px] font-bold">{Math.ceil(seconds)}</span>
    </ProgressRing>
  );
}
