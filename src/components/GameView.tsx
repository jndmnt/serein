import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Droplet,
  Feather,
  Flame,
  Flower2,
  Leaf,
  Map,
  Pause,
  Play,
  SearchX,
  Sparkles,
  Star,
  Sun,
  Swords,
  Timer,
  Wind,
  X,
} from "lucide-react";
import { useGame } from "../game/GameController";
import { keyboardStates } from "../game/DictionaryEngine";
import { journeySummary, levelById } from "../game/journey";
import { questViews } from "../game/quests";
import { cn } from "../utils/cn";
import { Board } from "./Board";
import { Keyboard } from "./Keyboard";
import { Bar, Panel, ProgressRing, SegmentedControl, SparkleField } from "./Primitives";
import { VersusFlow } from "./VersusFlow";

const MODES = [
  { id: "classic" as const, label: "Classic", sub: "zen", icon: Feather },
  { id: "fever" as const, label: "Fever", sub: "60s", icon: Timer },
  { id: "versus" as const, label: "Duel", sub: "2P", icon: Swords },
];

function ModeSwitch() {
  const { mode, selectMode } = useGame();
  return (
    <div className="segmented w-full max-w-[16.5rem]" role="tablist" aria-label="Game mode">
      {MODES.map((m) => {
        const active = mode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => selectMode(m.id)}
            className="relative flex-1 min-w-0 !px-1 !py-1"
          >
            {active && (
              <motion.span
                layoutId="mode-switch-pill"
                className="absolute inset-0 rounded-full border border-white/80 bg-white/85 shadow-[0_5px_12px_-8px_rgba(45,63,49,0.65),inset_0_1px_0_rgba(255,255,255,0.9)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              <Icon className="h-3 w-3 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              <span className="truncate text-[9px] font-bold">{m.label}</span>
              <span className="hidden text-[7px] font-semibold uppercase tracking-[0.05em] opacity-55 xs:inline">{m.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ModeHeading() {
  const { mode, length, selectLength, openSheet, fever, session, progress } = useGame();
  const journeyLevel = session.kind === "journey" ? levelById(session.levelId) : undefined;
  const summary = journeySummary(progress.journey.stars);

  const config =
    session.kind === "journey"
      ? {
          title: journeyLevel?.name.split(" ")[0] ?? "The",
          italic: journeyLevel?.name.split(" ").slice(1).join(" ").toLowerCase() ?? "path",
          icon: Map,
          sub: `Journey ${journeyLevel?.number ?? ""} of ${summary.total} · ${journeyLevel?.chapterTitle ?? ""}`,
        }
      : session.kind === "daily"
        ? { title: "Daily", italic: "bloom", icon: Flower2, sub: "Everyone shares today's word." }
        : mode === "fever"
          ? { title: "Word", italic: "fever", icon: Timer, sub: "Sixty seconds of flow" }
          : { title: "Quiet", italic: "classic", icon: Feather, sub: "Six guesses. One still mind." };

  const onEyebrow = () => {
    if (session.kind === "journey") openSheet("journey");
    else if (session.kind === "daily") openSheet("quests");
    else openSheet("modes");
  };

  if (session.kind === "practice" && mode !== "fever") {
    return (
      <div className="mode-header flex w-full shrink-0 flex-col gap-1.5 px-0.5">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <button
              onClick={() => openSheet("modes")}
              className="group inline-flex max-w-full items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#78877a] transition-colors hover:text-[var(--accent-deep)]"
            >
              <Feather className="h-3 w-3 shrink-0" strokeWidth={2} />
              <span className="truncate">Zen classic</span>
              <span className="hidden h-[3px] w-[3px] shrink-0 rounded-full bg-[#a8b2a8] xs:block" />
              <span className="hidden shrink-0 normal-case tracking-[0.02em] xs:inline">
                {length === 4 ? "Snack" : length === 5 ? "Classic" : "Master"}
              </span>
              <ChevronRight className="hidden h-2.5 w-2.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 xs:block" />
            </button>
            <h1 className="mt-0.5 whitespace-nowrap font-display text-[21px] leading-[0.95] tracking-[-0.01em] text-[#2b3a2f] xs:text-[23px] sm:text-[28px]">
              Quiet <em className="text-[var(--accent)]">classic</em>.
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 pb-0.5">
            <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-muted/80">Letters</span>
            <SegmentedControl
              ariaLabel="Word length"
              layoutId="length-pill"
              className="w-[8.9rem] sm:w-[10.7rem]"
              value={length}
              onChange={(v) => selectLength(v)}
              options={[
                { value: 4, label: "4", sub: "snack" },
                { value: 5, label: "5", sub: "classic" },
                { value: 6, label: "6", sub: "master" },
              ]}
            />
          </div>
        </div>
        <div className="mode-row flex items-center gap-1.5">
          <ModeSwitch />
          <button
            onClick={() => openSheet("quests")}
            aria-label="Open quests"
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-white/65 bg-white/40 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-[#7c8b73]"
          >
            <Sun className="h-2.5 w-2.5 text-[#a98b53]" /> Quests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full shrink-0 items-end justify-between gap-2 px-0.5">
      <div className="min-w-0">
        <button
          onClick={onEyebrow}
          className="group inline-flex max-w-full items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#78877a] transition-colors hover:text-[var(--accent-deep)]"
        >
          <config.icon className="h-3 w-3 shrink-0" strokeWidth={2} />
          <span className="truncate">
            {session.kind === "journey"
              ? `Journey · stone ${journeyLevel?.number ?? ""}`
              : session.kind === "daily"
                ? "Daily bloom · shared"
                : mode === "fever"
                  ? fever.phase === "playing"
                    ? "Word fever · live"
                    : "Word fever"
                  : "Zen classic"}
          </span>
          <span className="hidden h-[3px] w-[3px] shrink-0 rounded-full bg-[#a8b2a8] xs:block" />
          <span className="hidden shrink-0 normal-case tracking-[0.02em] xs:inline">
            {session.kind === "practice"
              ? length === 4
                ? "Snack"
                : length === 5
                  ? "Classic"
                  : "Master"
              : `${length} letters`}
          </span>
          <ChevronRight className="hidden h-2.5 w-2.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 xs:block" />
        </button>
        <h1 className="mt-0.5 whitespace-nowrap font-display text-[21px] leading-[0.95] tracking-[-0.01em] text-[#2b3a2f] xs:text-[23px] sm:text-[28px]">
          {config.title} <em className="text-[var(--accent)]">{config.italic}</em>.
        </h1>
        <p className="mode-sub mt-1 hidden truncate text-[10px] font-medium text-muted sm:block">{config.sub}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 pb-0.5">
        {session.kind === "practice" ? (
          <>
            <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-muted/80">Letters</span>
            <SegmentedControl
              ariaLabel="Word length"
              layoutId="length-pill"
              className="w-[8.9rem] sm:w-[10.7rem]"
              value={length}
              onChange={(v) => selectLength(v)}
              options={[
                { value: 4, label: "4", sub: "snack" },
                { value: 5, label: "5", sub: "classic" },
                { value: 6, label: "6", sub: "master" },
              ]}
            />
          </>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#5f755f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {session.kind === "journey" ? <Map className="h-3 w-3" /> : <Flower2 className="h-3 w-3" />}
            {session.kind === "journey" ? "fixed path" : "shared"}
          </span>
        )}
      </div>
    </div>
  );
}

function SessionBanner() {
  const { session, exitSession, classic, progress } = useGame();
  if (session.kind === "practice") return null;
  const level = levelById(session.levelId);
  const earned = level ? progress.journey.stars[level.id] ?? 0 : 0;
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-[13px] border border-white/65 bg-gradient-to-r from-[#e9f0e1]/80 to-[#f0ebdc]/70 px-2.5 py-1.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/80 bg-white/55 text-[#637d63]">
        {session.kind === "journey" ? <Map className="h-3 w-3" /> : <Flower2 className="h-3 w-3" />}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[9px] font-bold text-[#465b48]">
          {session.kind === "journey"
            ? `${level?.chapterTitle ?? "Journey"} · par ${level?.par ?? 4}`
            : "A shared puzzle · bloom bonus"}
        </div>
        <div className="truncate text-[7.5px] font-medium text-[#7c8b76]">
          {session.kind === "journey"
            ? `Solve within ${classic.maxGuesses} guesses · no hints for three stars`
            : "Same word for everyone · +30 dew · +8 pollen"}
        </div>
      </div>
      {session.kind === "journey" && (
        <span className="flex shrink-0 items-center gap-px">
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              className={cn("h-2.5 w-2.5", i < earned ? "fill-[#c9a05d] text-[#c9a05d]" : "text-[#a8b4a3]")}
              strokeWidth={1.6}
            />
          ))}
        </span>
      )}
      <button
        onClick={exitSession}
        aria-label="Leave this session"
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/70 bg-white/45 text-[#80907c]"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

function TodayStrip() {
  const { progress, openSheet, questClaimables } = useGame();
  const dailyDone = questViews(progress.quests, "daily").filter((q) => q.claimed).length;
  return (
    <button
      onClick={() => openSheet("quests")}
      className="today-strip flex shrink-0 items-center gap-1.5 rounded-full border border-white/60 bg-white/32 px-2.5 py-1 text-left backdrop-blur-sm transition-colors hover:bg-white/50"
    >
      <Sun className="h-2.5 w-2.5 text-[#a98b53]" strokeWidth={2.2} />
      <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#78876e]">Today</span>
      <span className="h-[3px] w-[3px] rounded-full bg-[#a4b09c]" />
      <span className="text-[8px] font-medium text-[#7f8e78]">
        {questClaimables > 0 ? `${questClaimables} reward${questClaimables === 1 ? "" : "s"} ready` : `${dailyDone}/3 quests`}
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#8b7a4f]">
          <Sparkles className="h-2.5 w-2.5" /> {progress.quests.pollen}
        </span>
        <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#667c62]">
          <Flame className="h-2.5 w-2.5 text-[#b58c55]" /> {progress.stats.currentStreak}
        </span>
        <ChevronRight className="h-2.5 w-2.5 text-[#93a08f]" />
      </span>
    </button>
  );
}

function GuessDots({ used, total = 6 }: { used: number; total?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${total - used} guesses remaining`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{
            backgroundColor: i < used ? "var(--accent)" : i === used ? "rgba(201,160,93,0.85)" : "rgba(68,88,71,0.12)",
            width: i === used ? 12 : 4,
          }}
          className="h-1 rounded-full"
        />
      ))}
      <span className="ml-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">{total - used} left</span>
    </div>
  );
}

function HintRow() {
  const { classic, useGale, useSunbeam, progress, mode, newPuzzle } = useGame();
  if (mode !== "classic") return null;
  const playing = classic.status === "playing";
  if (!playing) {
    return (
      <div className="mt-2 flex items-center gap-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded-[14px] border border-white/60 bg-white/35 px-3 py-2">
          <Leaf className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="text-[10px] font-semibold text-[#617565]">
            {classic.status === "won" ? "The word has settled." : `The word was ${classic.word.toUpperCase()}.`}
          </span>
        </div>
        <button onClick={newPuzzle} className="btn-primary !px-3.5 !py-2 !text-[10.5px]">
          Next ritual
        </button>
      </div>
    );
  }
  return (
    <div className="mt-1.5 grid shrink-0 grid-cols-2 gap-1.5">
      <motion.button
        whileTap={{ scale: 0.98, y: 1 }}
        onClick={useGale}
        className="group flex items-center gap-1.5 rounded-[13px] border border-white/65 bg-white/40 px-2 py-1 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-white/65 sm:gap-2 sm:rounded-[15px] sm:px-2.5 sm:py-1.5"
        aria-label="Use Gale hint"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#e6ece3] to-[#cad8c8] text-[#627c66] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] xs:h-7 xs:w-7 xs:rounded-[10px]">
          <Wind className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[10px] font-bold leading-tight text-[#3e5243] xs:text-[10.5px]">Gale</span>
          <span className="hint-detail block text-[8.5px] font-medium text-muted">
            {progress.galeCharges > 0 ? `${progress.galeCharges} gentle gust${progress.galeCharges === 1 ? "" : "s"}` : "Blow 3 grays · 50 dew"}
          </span>
        </span>
        <span className="chip !border-white/70 !bg-white/55 !px-1.5 !py-0.5 !text-[8px]">
          {progress.galeCharges > 0 ? `×${progress.galeCharges}` : "50"}
        </span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.98, y: 1 }}
        onClick={useSunbeam}
        className="group flex items-center gap-1.5 rounded-[13px] border border-white/65 bg-white/40 px-2 py-1 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-white/65 sm:gap-2 sm:rounded-[15px] sm:px-2.5 sm:py-1.5"
        aria-label="Use Sunbeam hint"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#f2e7cf] to-[#e3cda2] text-[#9b7c43] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] xs:h-7 xs:w-7 xs:rounded-[10px]">
          <Sun className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[10px] font-bold leading-tight text-[#3e5243] xs:text-[10.5px]">Sunbeam</span>
          <span className="hint-detail block text-[8.5px] font-medium text-muted">
            {progress.sunbeamCharges > 0 ? `${progress.sunbeamCharges} ray${progress.sunbeamCharges === 1 ? "" : "s"} in the jar` : "Reveal a letter · 100 dew"}
          </span>
        </span>
        <span className="chip !border-white/70 !bg-white/55 !px-1.5 !py-0.5 !text-[8px]">
          {progress.sunbeamCharges > 0 ? `×${progress.sunbeamCharges}` : "100"}
        </span>
      </motion.button>
    </div>
  );
}

function ClassicBoard() {
  const { classic, length, progress, selectCell } = useGame();
  return (
    <>
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="chip !py-[3px] !text-[8.5px]">
            <Leaf className="h-2.5 w-2.5" /> Daily ritual
          </span>
          <span className="hidden text-[9px] font-semibold text-muted sm:inline">
            {length === 6 ? "Master deck" : length === 4 ? "Snack deck" : "Classic deck"}
          </span>
        </div>
        <GuessDots used={classic.guesses.length} total={classic.maxGuesses} />
      </div>
      <Board
        className="min-h-0"
        key={`${length}-${classic.word}-${classic.maxGuesses}`}
        rows={classic.maxGuesses}
        length={length}
        guesses={classic.guesses}
        slots={classic.slots}
        cursor={classic.cursor}
        onSelectCell={selectCell}
        reveals={classic.reveals}
        status={classic.status}
        shakeKey={classic.shakeKey}
        symbols={progress.tileSymbols}
      />
      <HintRow />
    </>
  );
}

function FeverHud() {
  const { fever, feverMultiplier, comboFuel, finishFever } = useGame();
  const time = Math.max(0, Math.ceil(fever.timeLeft));
  const urgent = time <= 10;
  return (
    <Panel className="flex w-full shrink-0 items-center gap-2.5 rounded-[20px] px-2.5 py-2">
      <ProgressRing value={fever.timeLeft / 60} size={42} stroke={3.5} urgent={urgent}>
        <span className={cn("text-[12px] font-bold tabular-nums", urgent ? "text-[#a86f43]" : "text-[#3f5746]")}>
          {time}
        </span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow !text-[8px]">Flow score</span>
          <span className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-muted">
            {fever.solved} solved · best {Math.max(fever.bestCombo, fever.solved)}
          </span>
        </div>
        <div className="mt-0.5 font-display text-[21px] leading-none tabular-nums text-[#354a3b]">
          {fever.score.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Bar value={comboFuel} className="h-1" barClassName="from-[#d9b77d] via-[#c9a05d] to-[#b6873f]" />
          <span className="shrink-0 text-[8px] font-bold text-[#9a7c48]">{Math.round(comboFuel * 8)}s</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.div
          key={feverMultiplier}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={cn(
            "flex h-9 flex-col items-center justify-center rounded-[11px] border px-2 leading-none",
            feverMultiplier > 1
              ? "border-white/50 bg-gradient-to-br from-[#ddc08b] to-[#c29a56] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "border-white/65 bg-white/40 text-[#7d8c7d]",
          )}
        >
          <span className="text-[12.5px] font-extrabold tabular-nums">×{feverMultiplier}</span>
          <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.1em] opacity-80">combo</span>
        </motion.div>
        <button
          onClick={finishFever}
          aria-label="End fever run"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/65 bg-white/40 text-[#73836f] transition-colors hover:bg-white/65"
        >
          <Pause className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </Panel>
  );
}

function FeverBoard() {
  const { fever, length, progress, selectCell } = useGame();
  return (
    <div className="relative">
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-1">
        <span className="chip !py-[3px] !text-[8.5px]">
          <Timer className="h-2.5 w-2.5" /> Rush word {fever.solved + 1}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i < fever.guesses.length ? "w-2.5 bg-[var(--gold)]" : "w-1 bg-[#446047]/15",
              )}
            />
          ))}
          <span className="ml-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
            {6 - fever.guesses.length} left
          </span>
        </div>
      </div>
      <Board
        className="min-h-0"
        key={`${fever.word}-${fever.flashKey}`}
        length={length}
        guesses={fever.guesses}
        slots={fever.slots}
        cursor={fever.cursor}
        onSelectCell={selectCell}
        reveals={[]}
        status="playing"
        shakeKey={fever.shakeKey}
        symbols={progress.tileSymbols}
      />
      <AnimatePresence>
        {fever.status === "solved" && (
          <motion.div
            key={`solved-${fever.flashKey}`}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-gradient-to-r from-[#6e8b70]/95 to-[#4d6b55]/95 px-4 py-2 text-center text-[#faf8ef] shadow-[0_16px_36px_-14px_rgba(38,62,44,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md"
          >
            <div className="font-display text-[20px] leading-none">{fever.lastWord.toUpperCase()}</div>
            <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#dfe8d6]">
              +10 seconds · +{fever.lastGain} flow
            </div>
          </motion.div>
        )}
        {fever.status === "skipped" && (
          <motion.div
            key={`skipped-${fever.flashKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-white/40 bg-[#5f6d62]/95 px-4 py-2 text-center text-[#faf8ef] shadow-xl backdrop-blur-md"
          >
            <div className="font-display text-[18px] leading-none">{fever.lastWord.toUpperCase()}</div>
            <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] opacity-80">Slipped away · next word</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-1.5 flex shrink-0 items-center justify-center gap-1.5 rounded-[14px] border border-white/50 bg-white/25 px-2 py-1.5 text-[9px] font-medium text-[#6c7c6d]">
        <Sparkles className="h-3 w-3 text-[var(--gold)]" />
        Solve a word for <b className="font-bold">+10s</b> · quick solves build your multiplier
      </div>
    </div>
  );
}

function FeverPrelude() {
  const { beginFever, progress, length } = useGame();
  return (
    <Panel className="no-scrollbar relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto rounded-[30px] px-4 py-4 text-center sm:px-5 sm:py-6">
      <SparkleField count={12} />
      <div className="relative">
        <ProgressRing value={1} size={82} stroke={4}>
          <div className="grid place-items-center">
            <Timer className="h-6 w-6 text-[var(--accent)]" strokeWidth={1.6} />
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-muted">60 sec</span>
          </div>
        </ProgressRing>
        <span className="absolute -right-2 top-1 grid h-7 w-7 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#eedfc1] to-[#dabb83] text-[11px] font-bold text-[#81653a] shadow">
          3×
        </span>
      </div>
      <h2 className="relative mt-4 font-display text-[31px] leading-[1.05] text-[#2f4034]">
        Sixty seconds <em className="text-[var(--accent)]">of flow</em>.
      </h2>
      <p className="relative mt-2 max-w-[19rem] text-[11px] leading-relaxed text-[#6b7b6d]">
        Unwind one word after another. Every solve gifts <b className="font-semibold text-[#4d6754]">+10 seconds</b>. Quick
        solves warm the combo bar up to <b className="font-semibold text-[#4d6754]">3×</b>.
      </p>
      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {["1× warm", "1.5× in rhythm", "2× flowing", "3× luminous"].map((tier, i) => (
          <span
            key={tier}
            className={cn(
              "rounded-full border px-2 py-1 text-[8.5px] font-bold",
              i === 3
                ? "border-[#d9bd88] bg-[#f0e3c8]/80 text-[#8b6d36]"
                : "border-white/70 bg-white/45 text-[#77866f]",
            )}
          >
            {tier}
          </span>
        ))}
      </div>
      <div className="relative mt-4 grid w-full max-w-[19rem] grid-cols-3 divide-x divide-[#4c6553]/10 rounded-[18px] border border-white/60 bg-white/30 py-2">
        <div>
          <div className="text-[16px] font-bold tabular-nums text-[#3c5141]">{progress.stats.feverBest}</div>
          <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">best run</div>
        </div>
        <div>
          <div className="text-[16px] font-bold tabular-nums text-[#3c5141]">{progress.stats.feverWordsTotal}</div>
          <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">words</div>
        </div>
        <div>
          <div className="text-[16px] font-bold tabular-nums text-[#3c5141]">{length}</div>
          <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">letters</div>
        </div>
      </div>
      <div className="mode-row relative mt-3 w-full max-w-[17rem]">
        <ModeSwitch />
      </div>
      <button onClick={beginFever} className="btn-primary relative mt-3 w-full max-w-[16rem] !rounded-full !py-2.5">
        <Play className="h-3.5 w-3.5 fill-current" /> Begin the rush
      </button>
      <p className="relative mt-2 text-[8.5px] font-medium text-muted">Dewdrops are gathered at the end of the run</p>
    </Panel>
  );
}

function FieldWhisper() {
  const { fieldNotice, clearFieldNotice, classic, mode } = useGame();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [fieldNotice?.key]);

  if (fieldNotice && !dismissed) {
    return (
      <motion.div
        key={fieldNotice.key}
        initial={{ opacity: 0, y: 5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={cn(
          "flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          fieldNotice.tone === "success"
            ? "border-[#b9cdb2]/80 bg-gradient-to-r from-[#eaf1e2]/95 to-[#e2ecdb]/90 text-[#5d7a5c]"
            : "border-[#dcc6a0]/70 bg-gradient-to-r from-[#f5ead4]/90 to-[#f1e4cd]/85 text-[#7d6840]",
        )}
      >
        {fieldNotice.tone === "success" ? (
          <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2} />
        ) : (
          <SearchX className="h-3 w-3 shrink-0" strokeWidth={2} />
        )}
        <span className="truncate text-[9px] font-bold">{fieldNotice.text}</span>
        {fieldNotice.detail && (
          <span
            className={cn(
              "hidden truncate text-[8px] font-medium xs:inline",
              fieldNotice.tone === "success" ? "text-[#869a80]" : "text-[#9b8761]",
            )}
          >
            · {fieldNotice.detail}
          </span>
        )}
        <button
          onClick={clearFieldNotice}
          aria-label="Dismiss"
          className="ml-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/50 text-muted hover:bg-white"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </motion.div>
    );
  }

  if (mode === "classic" && classic.reveals.length > 0) {
    return (
      <div className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/65 bg-white/35 px-2.5 py-1">
        <Sun className="h-3 w-3 shrink-0 text-[#b2914f]" />
        <span className="text-[8px] font-bold uppercase tracking-[0.09em] text-[#8b7a52]">Sunbeam</span>
        {classic.reveals
          .slice()
          .sort((a, b) => a.index - b.index)
          .map((reveal) => (
            <span
              key={`${reveal.index}-${reveal.letter}`}
              className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/55 px-1.5 py-[1px] text-[7.5px] font-semibold text-[#6e7c66]"
            >
              <span className="text-[6.5px] uppercase tracking-[0.04em] text-[#98a08d]">{reveal.index + 1}</span>
              {reveal.letter.toUpperCase()}
            </span>
          ))}
        <span className="hidden text-[7.5px] font-medium text-muted xs:inline">pinned in place</span>
      </div>
    );
  }

  return null;
}

function GardenStrip() {
  const { level, progress } = useGame();
  return (
    <div className="mobile-garden flex shrink-0 items-center gap-2 rounded-[14px] border border-white/55 bg-white/28 px-2.5 py-1.5 lg:hidden">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#9ab297] to-[#5f7d66] text-[9px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        {level.level}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="truncate font-display text-[12.5px] leading-none text-[#3c5040]">{level.title}</span>
          <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.08em] text-muted">
            {level.xpInLevel}/{level.xpToNext} xp
          </span>
        </div>
        <Bar value={level.progress} className="mt-1 h-1" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-l border-[#4c6553]/10 pl-2">
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#5d725f]">
          <Flame className="h-2.5 w-2.5 text-[#b58c55]" /> {progress.stats.currentStreak}
        </span>
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#5d725f]">
          <Droplet className="h-2.5 w-2.5 text-[#7d9c8c]" /> {progress.dewdrops}
        </span>
      </div>
    </div>
  );
}

export function GameView() {
  const game = useGame();
  const { mode, fever, classic, progress } = game;

  if (mode === "versus") return <VersusFlow />;

  const statuses = keyboardStates(mode === "classic" ? classic.guesses : fever.guesses);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.28, 1] }}
      className="mx-auto flex min-h-0 w-full max-w-[29rem] flex-1 flex-col justify-between gap-1.5 overflow-hidden lg:justify-start lg:gap-2.5"
    >
      <ModeHeading />
      <SessionBanner />

      {mode === "fever" ? (
        fever.phase === "idle" || fever.phase === "ended" ? (
          <FeverPrelude />
        ) : (
          <>
            <FeverHud />
            <div className="glass relative flex min-h-0 w-full flex-1 flex-col rounded-[22px] p-2 sm:rounded-[26px] sm:p-3">
              <FeverBoard />
            </div>
            <FieldWhisper />
            <div className="shrink-0">
              <Keyboard
                statuses={statuses}
                onKey={game.handleKey}
                disabled={fever.phase !== "playing" || fever.status !== "playing"}
                symbols={progress.tileSymbols}
                enterState={game.validation.valid ? "valid" : game.validation.complete ? "invalid" : "incomplete"}
              />
            </div>
            <p className="shrink-0 text-center text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted/70">
              Peak flow · no rush, only rhythm
            </p>
          </>
        )
      ) : (
        <>
          <div className="glass relative flex min-h-0 w-full flex-1 flex-col rounded-[22px] p-2 sm:rounded-[26px] sm:p-3">
            <ClassicBoard />
          </div>
          {game.session.kind === "practice" && <TodayStrip />}
          <FieldWhisper />
          <div className="shrink-0">
          <Keyboard
            statuses={statuses}
            eliminated={classic.eliminated}
            onKey={game.handleKey}
            disabled={classic.status !== "playing"}
            symbols={progress.tileSymbols}
            enterState={
              classic.status !== "playing"
                ? "disabled"
                : game.validation.valid
                  ? "valid"
                  : game.validation.complete
                    ? "invalid"
                    : "incomplete"
            }
          />
          </div>
          <GardenStrip />
          <p className="hidden items-center justify-center gap-1.5 text-center text-[8px] font-medium uppercase tracking-[0.16em] text-muted/70 sm:flex lg:hidden">
            <span className="h-[3px] w-[3px] rounded-full bg-[var(--gold)]" />
            gentle hints · no repeats · no rush
          </p>
        </>
      )}
    </motion.div>
  );
}
