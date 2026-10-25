import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Eye,
  Lock,
  RotateCcw,
  ScanEye,
  ShieldQuestion,
  Shuffle,
  SearchX,
  Swords,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useGame } from "../game/GameController";
import { SOLUTIONS, keyboardStates } from "../game/DictionaryEngine";
import { cn } from "../utils/cn";
import { Board } from "./Board";
import { Keyboard } from "./Keyboard";
import { Panel, SegmentedControl, SparkleField } from "./Primitives";

function timeLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlayerBadge({ player, role, active }: { player: 1 | 2; role: string; active?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", active ? "opacity-100" : "opacity-70")}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full border text-[10px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
          player === 1
            ? "border-white/70 bg-gradient-to-br from-[#d9e5d4] to-[#b6cbb3] text-[#4b6a51]"
            : "border-white/70 bg-gradient-to-br from-[#eddfc5] to-[#d8c195] text-[#806a3f]",
        )}
      >
        P{player}
      </span>
      <div className="leading-tight">
        <div className="text-[10.5px] font-bold text-[#425546]">Player {player}</div>
        <div className="text-[8.5px] font-medium text-muted">{role}</div>
      </div>
    </div>
  );
}

function Scoreboard({ p1, p2, winsNeeded }: { p1: number; p2: number; winsNeeded: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/65 bg-white/40 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#6d8871] text-[10px] font-bold text-white">P1</span>
      <span className="text-[12px] font-bold tabular-nums text-[#3e5243]">{p1}</span>
      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted">first to {winsNeeded}</span>
      <span className="text-[12px] font-bold tabular-nums text-[#3e5243]">{p2}</span>
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#c9a05d] text-[10px] font-bold text-white">P2</span>
    </div>
  );
}

function SecretEntry({ setter }: { setter: 1 | 2 }) {
  const { length, vsSetSecret, vs, notify } = useGame();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSecret("");
    setError(null);
  }, [vs.setter, vs.round]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        event.preventDefault();
        confirm();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setError(null);
        setSecret((s) => s.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        setError(null);
        setSecret((s) => (s.length >= length ? s : s + event.key.toLowerCase()));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const confirm = () => {
    const result = vsSetSecret(secret);
    if (!result.ok) {
      setError(result.error ?? "That word can't be used.");
      return;
    }
    setSecret("");
  };

  const handle = (key: string) => {
    setError(null);
    if (key === "Enter") {
      confirm();
    } else if (key === "Backspace") {
      setSecret((s) => s.slice(0, -1));
    } else if (/^[a-z]$/i.test(key)) {
      setSecret((s) => (s.length >= length ? s : s + key.toLowerCase()));
    }
  };

  const borrow = () => {
    const pool = SOLUTIONS[length];
    setSecret(pool[Math.floor(Math.random() * pool.length)]);
    setError(null);
    notify("A word borrowed from the garden", { tone: "neutral", icon: "leaf" });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/40 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#6c7d6e]">
          <ScanEye className="h-3 w-3" /> Player {setter === 1 ? 2 : 1}, look away
        </div>
        <h2 className="mt-2 font-display text-[27px] leading-[1.05] text-[#2e3f33]">
          Player {setter}, whisper <em className="text-[var(--accent)]">a secret</em>.
        </h2>
        <p className="mx-auto mt-1.5 max-w-[17rem] text-[10.5px] leading-relaxed text-[#6f8071]">
          Choose any {length}-letter word from the lexicon. Only the two of you will know it — it stays hidden with stars.
        </p>
      </div>

      <div className="relative rounded-[20px] border border-white/60 bg-white/28 p-2.5">
        <div className="flex justify-center gap-1.5">
          {Array.from({ length }).map((_, i) => {
            const filled = i < secret.length;
            return (
              <div
                key={i}
                className={cn(
                  "tile tile-base grid place-items-center",
                  filled ? "tile-filled" : i === secret.length ? "tile-active" : "tile-empty",
                )}
                style={{
                  width: length === 6 ? 36 : length === 4 ? 46 : 42,
                  height: length === 6 ? 36 : length === 4 ? 46 : 42,
                  fontSize: 18,
                }}
                aria-label={filled ? "Secret letter" : "Empty secret slot"}
              >
                {filled ? (
                  <span className="select-none text-[#536557]">✱</span>
                ) : i === secret.length ? (
                  <span className="h-2 w-[2px] animate-pulse rounded bg-[var(--accent)]/50" />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex min-h-4 items-center justify-center gap-1.5">
          {error ? (
            <span className="text-[9.5px] font-semibold text-[#a5624c]">{error}</span>
          ) : secret.length === length ? (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-[#6f876d]">
              <Check className="h-3 w-3" /> Tucked away — nobody can see it
            </span>
          ) : (
            <span className="text-[9px] font-medium text-muted">{length - secret.length} letters still hidden</span>
          )}
        </div>
      </div>

      <Keyboard statuses={{}} onKey={handle} hideEnter />

      <div className="flex items-center gap-1.5">
        <button onClick={borrow} className="btn-ghost flex-1 !py-2 !text-[10px]">
          <Shuffle className="h-3.5 w-3.5" /> Borrow a word
        </button>
        <button
          onClick={confirm}
          disabled={secret.length !== length}
          className="btn-primary flex-[1.5] !py-2 !text-[10.5px] disabled:opacity-40"
        >
          <Lock className="h-3.5 w-3.5" /> Seal the secret
        </button>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-center text-[8.5px] font-medium text-muted">
        <Eye className="h-3 w-3" /> Your word is validated against {length === 6 ? "the Master" : "the"} lexicon
      </p>
    </div>
  );
}

function DuelPlay() {
  const { vs, length, progress, handleKey, vsExit, winsNeeded, selectCell, validation, fieldNotice, clearFieldNotice } = useGame();
  const statuses = keyboardStates(vs.guesses);
  const setterLabel = `Set the word`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Swords className="h-3 w-3" /> Friend duel · round {vs.round}
          </div>
          <h2 className="mt-0.5 font-display text-[23px] leading-none text-[#2e3f33]">
            Player {vs.solver}, <em className="text-[var(--accent)]">find it</em>.
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full border border-white/65 bg-white/40 px-2 py-1 text-[10.5px] font-bold tabular-nums text-[#4c6453]">
            <Timer className="h-3 w-3" /> {timeLabel(vs.elapsed)}
          </div>
          <button
            onClick={vsExit}
            aria-label="Leave duel"
            className="grid h-7 w-7 place-items-center rounded-full border border-white/65 bg-white/40 text-[#7c8a7c]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-[16px] border border-white/60 bg-white/30 px-2.5 py-1.5">
        <PlayerBadge player={1 as 1 | 2} role={vs.setter === 1 ? "keeper of the word" : "guessing now"} active={vs.solver === 1} />
        <span className="font-display text-[13px] italic text-[#97a294]">vs</span>
        <PlayerBadge player={2} role={vs.setter === 2 ? "keeper of the word" : "guessing now"} active={vs.solver === 2} />
      </div>

      <div className="glass rounded-[24px] p-2.5">
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <span className="chip !py-[3px] !text-[8px]">
            <Lock className="h-2.5 w-2.5" /> Secret sealed
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i < vs.guesses.length ? "w-2.5 bg-[var(--accent)]" : "w-1 bg-[#446047]/15",
                )}
              />
            ))}
            <span className="ml-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
              {6 - vs.guesses.length} left
            </span>
          </div>
        </div>
        <Board
          className="max-h-[min(38dvh,300px)]"
          key={`${vs.round}-${vs.secret}`}
          length={length}
          guesses={vs.guesses}
          slots={vs.slots}
          cursor={vs.cursor}
          onSelectCell={selectCell}
          reveals={[]}
          status="playing"
          shakeKey={vs.shakeKey}
          symbols={progress.tileSymbols}
        />
        <div className="mt-2 flex items-center justify-between rounded-[12px] border border-white/50 bg-white/25 px-2.5 py-1.5">
          <span className="text-[8.5px] font-medium text-[#6e7f70]">{setterLabel} by Player {vs.setter}</span>
          <Scoreboard p1={vs.scores.p1} p2={vs.scores.p2} winsNeeded={winsNeeded} />
        </div>
      </div>

      {fieldNotice && (
        <motion.div
          key={fieldNotice.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[26px] items-center justify-center gap-1.5 rounded-full border border-[#dcc6a0]/70 bg-[#f5ead4]/90 px-3 py-1 text-[#7d6840]"
        >
          <SearchX className="h-3 w-3 shrink-0" />
          <span className="truncate text-[9px] font-bold">{fieldNotice.text}</span>
          <button onClick={clearFieldNotice} aria-label="Dismiss" className="ml-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/50">
            <X className="h-2.5 w-2.5" />
          </button>
        </motion.div>
      )}
      <Keyboard
        statuses={statuses}
        onKey={handleKey}
        symbols={progress.tileSymbols}
        enterState={validation.valid ? "valid" : validation.complete ? "invalid" : "incomplete"}
      />
      <p className="hidden text-center text-[8px] font-medium uppercase tracking-[0.16em] text-muted/70 sm:block">
        Best of {vs.bestOf} · fastest solves win the duel
      </p>
    </div>
  );
}

function Handoff() {
  const { vs, vsHandoff } = useGame();
  const nextPlayer = vs.solver;
  return (
    <motion.div key="handoff" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <Panel className="relative overflow-hidden rounded-[28px] px-5 py-7 text-center">
        <SparkleField count={8} />
        <div className="relative mx-auto flex w-fit items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#dbe7d6] to-[#b8cdb5] text-[13px] font-bold text-[#4b6a51] shadow">
            P1
          </span>
          <span className="font-display text-[18px] italic text-[#8a998b]">vs</span>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#efe2c8] to-[#d8c195] text-[13px] font-bold text-[#806a3f] shadow">
            P2
          </span>
        </div>
        <div className="eyebrow mt-3">Round {vs.round} · secret sealed</div>
        <h2 className="mt-1.5 font-display text-[30px] leading-[1.05] text-[#2e3f33]">
          Pass the phone to <em className="text-[var(--accent)]">Player {nextPlayer}</em>.
        </h2>
        <p className="mx-auto mt-2 max-w-[19rem] text-[10.5px] leading-relaxed text-[#6f8071]">
          Player {vs.setter}'s secret is tucked away. Player {nextPlayer} has six guesses and the clock is watching.
        </p>
        <div className="mt-4 flex items-center justify-center">
          <Scoreboard p1={vs.scores.p1} p2={vs.scores.p2} winsNeeded={Math.ceil(vs.bestOf / 2)} />
        </div>
        <button onClick={vsHandoff} className="btn-primary relative mt-4 !px-6 !py-2.5 !text-[11px]">
          I'm Player {nextPlayer} · begin <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <p className="relative mt-2.5 flex items-center justify-center gap-1 text-[8.5px] font-medium text-muted">
          <ShieldQuestion className="h-3 w-3" /> Hand over the device before you continue
        </p>
      </Panel>
    </motion.div>
  );
}

function ResultWord({ word }: { word: string }) {
  return (
    <div className="flex justify-center gap-1.5">
      {word.split("").map((letter, i) => (
        <div
          key={`${letter}-${i}`}
          className="tile tile-base tile-correct grid place-items-center"
          style={{ width: 38, height: 38, fontSize: 17 }}
        >
          {letter.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function RoundResult() {
  const { vs, vsNextRound, winsNeeded } = useGame();
  const winner = vs.roundWinner ?? 1;
  const solverWon = winner === vs.solver;
  return (
    <motion.div key="round" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <Panel className="relative overflow-hidden rounded-[28px] px-5 py-6 text-center">
        <SparkleField count={10} />
        <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#eee1c5] to-[#d3b783] text-[#856a37] shadow">
          <Trophy className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="eyebrow mt-3">Round {vs.round} · settled</div>
        <h2 className="mt-1 font-display text-[28px] leading-[1.05] text-[#2e3f33]">
          Player {winner} takes it.
        </h2>
        <p className="mt-1 text-[10.5px] font-medium text-[#6f8071]">
          {solverWon ? `Six guesses were enough in ${vs.solvedIn}.` : `Player ${vs.solver} ran out of guesses — the setter keeps the point.`}
        </p>
        <div className="mt-4">
          <div className="mb-2 text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted">The word was</div>
          <ResultWord word={vs.secret} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 text-[9.5px] font-semibold text-[#687b6b]">
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" /> {timeLabel(vs.elapsed)}
          </span>
          <span className="h-3 w-px bg-[#4c6553]/15" />
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3" /> {vs.solvedIn ?? "0"} / 6 guesses
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          <Scoreboard p1={vs.scores.p1} p2={vs.scores.p2} winsNeeded={winsNeeded} />
        </div>
        <button onClick={vsNextRound} className="btn-primary mt-4 w-full !py-2.5 !text-[11px]">
          <Swords className="h-3.5 w-3.5" /> Next round · roles swap
        </button>
      </Panel>
    </motion.div>
  );
}

function MatchResult() {
  const { vs, vsStart, vsExit } = useGame();
  const winner = vs.matchWinner ?? 1;
  return (
    <motion.div key="match" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <Panel className="relative overflow-hidden rounded-[28px] px-5 py-7 text-center">
        <SparkleField count={14} />
        <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-[#f0e2c3] to-[#d4b476] text-[#7e6130] shadow-[0_10px_24px_-12px_rgba(122,95,49,0.8)]">
          <Crown className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <div className="eyebrow mt-3">Best of {vs.bestOf} · settled</div>
        <h2 className="mt-1 font-display text-[31px] leading-[1.05] text-[#2e3f33]">
          Player {winner}, <em className="text-[var(--accent)]">luminous</em>.
        </h2>
        <p className="mt-1.5 text-[10.5px] font-medium text-[#6f8071]">
          {vs.scores.p1} — {vs.scores.p2} after {vs.round} rounds. A lovely little duel.
        </p>
        <div className="mt-4 flex justify-center">
          <Scoreboard p1={vs.scores.p1} p2={vs.scores.p2} winsNeeded={Math.ceil(vs.bestOf / 2)} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="chip">+dewdrops gathered</span>
          <span className="chip">badge progress</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={vsExit} className="btn-ghost flex-1 !py-2.5 !text-[10.5px]">
            <ArrowLeft className="h-3.5 w-3.5" /> Leave
          </button>
          <button onClick={() => vsStart(vs.bestOf)} className="btn-primary flex-[1.4] !py-2.5 !text-[10.5px]">
            <RotateCcw className="h-3.5 w-3.5" /> Rematch
          </button>
        </div>
      </Panel>
    </motion.div>
  );
}

export function VersusFlow() {
  const { vs, length, selectLength, vsStart } = useGame();
  const [bestOf, setBestOf] = useState<3 | 5>(vs.bestOf);

  const startRound = () => {
    if (vs.phase === "intro") vsStart(bestOf);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto flex min-h-0 w-full max-w-[29rem] flex-1 flex-col gap-2"
    >
      <div className="flex items-end justify-between gap-2 px-0.5">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Swords className="h-3 w-3" /> Pass & play
          </div>
          <h1 className="mt-1 font-display text-[24px] leading-none tracking-[-0.01em] text-[#2b3a2f] sm:text-[28px]">
            Friend <em className="text-[var(--accent)]">duel</em>.
          </h1>
        </div>
        {(vs.phase === "intro" || vs.phase === "matchResult") && (
          <SegmentedControl
            ariaLabel="Word length"
            layoutId="vs-length-pill"
            className="w-[8.9rem] sm:w-[10.7rem]"
            value={length}
            onChange={(v) => selectLength(v)}
            options={[
              { value: 4, label: "4", sub: "snack" },
              { value: 5, label: "5", sub: "classic" },
              { value: 6, label: "6", sub: "master" },
            ]}
          />
        )}
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pb-1">
        <AnimatePresence mode="wait">
          {vs.phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Panel className="relative overflow-hidden rounded-[28px] px-4 py-4">
                <SparkleField count={8} />
                <div className="relative flex items-center justify-between gap-2 rounded-[20px] border border-white/60 bg-white/30 p-3">
                  <PlayerBadge player={1} role="sets the first secret" active />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-display text-[20px] italic leading-none text-[#8f9c90]">vs</span>
                    <ShieldQuestion className="h-3.5 w-3.5 text-[#a3ad9f]" />
                  </div>
                  <PlayerBadge player={2} role="solves first" />
                </div>

                <div className="relative mt-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10.5px] font-bold text-[#455a49]">Duel length</div>
                    <div className="text-[9px] font-medium text-muted">First to {Math.ceil(bestOf / 2)} rounds</div>
                  </div>
                  <SegmentedControl
                    ariaLabel="Duel length"
                    layoutId="bestof-pill"
                    className="w-[8.5rem]"
                    value={bestOf}
                    onChange={(v) => setBestOf(v)}
                    options={[
                      { value: 3, label: "Best of 3" },
                      { value: 5, label: "Best of 5" },
                    ]}
                  />
                </div>

                <div className="relative mt-3 space-y-1.5 rounded-[16px] border border-white/55 bg-white/25 p-2.5">
                  {[
                    { n: 1, t: "Player 1 hides a word", d: `${length} letters · sealed with stars` },
                    { n: 2, t: "Player 2 solves it", d: "Six guesses · fastest solve wins" },
                    { n: 3, t: "Roles swap each round", d: "Best record takes the garden" },
                  ].map((step) => (
                    <div key={step.n} className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/70 bg-white/55 text-[9px] font-bold text-[#617a63]">
                        {step.n}
                      </span>
                      <div className="leading-tight">
                        <div className="text-[10px] font-bold text-[#415646]">{step.t}</div>
                        <div className="text-[8.5px] font-medium text-muted">{step.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={startRound} className="btn-primary relative mt-3.5 w-full !py-2.5 !text-[11px]">
                  <Swords className="h-3.5 w-3.5" /> Begin the duel
                </button>
                <p className="relative mt-2 text-center text-[8.5px] font-medium text-muted">
                  One device · one secret at a time · dewdrops for both
                </p>
              </Panel>
            </motion.div>
          )}

          {(vs.phase === "setP1" || vs.phase === "setP2") && (
            <motion.div key={vs.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Panel className="rounded-[28px] px-4 py-4">
                <SecretEntry setter={vs.phase === "setP1" ? 1 : 2} />
              </Panel>
            </motion.div>
          )}

          {(vs.phase === "handoffP1" || vs.phase === "handoffP2") && <Handoff />}

          {(vs.phase === "playP1" || vs.phase === "playP2") && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DuelPlay />
            </motion.div>
          )}

          {vs.phase === "roundResult" && <RoundResult />}
          {vs.phase === "matchResult" && <MatchResult />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
