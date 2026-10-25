import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Feather, Loader2, Volume2, X } from "lucide-react";
import { loadMeaning, speak, type Meaning } from "../game/meaning";
import { cn } from "../utils/cn";

/**
 * A concise, quiet glossary. Field notes appear instantly; rarer words are
 * looked up once and remembered. Always optional — never interrupts a solve.
 */
export function WordLookup({
  word,
  variant = "pill",
  className,
}: {
  word: string;
  variant?: "pill" | "inline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [meaning, setMeaning] = useState<Meaning | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMeaning(null);
  }, [word]);

  useEffect(() => {
    if (!open || meaning) return;
    let alive = true;
    setLoading(true);
    loadMeaning(word)
      .then((result) => {
        if (alive) setMeaning(result);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, meaning, word]);

  if (variant === "inline") {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-[13px] border border-white/65 bg-white/45 px-2.5 py-1.5 text-left transition-colors hover:bg-white/65"
          aria-expanded={open}
          aria-label={`Meaning of ${word}`}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-[#778b74]" strokeWidth={1.8} />
            <span className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#556953]">Field notes & meaning</span>
          </span>
          <span className="flex items-center gap-1 text-[8px] font-semibold text-[#80907c]">
            {open ? "hide" : "explore word"}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <MeaningBody word={word} meaning={meaning} loading={loading} compact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/45 px-2.5 py-1 text-[8.5px] font-bold text-[#66795f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white/70",
          className,
        )}
        aria-label={`See the meaning of ${word}`}
      >
        <BookOpen className="h-2.5 w-2.5" strokeWidth={2} /> Meaning
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-[#1f3128]/35 backdrop-blur-[5px]"
              onClick={() => setOpen(false)}
              aria-label="Close meaning"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Meaning of ${word}`}
              initial={{ y: 20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="glass-deep relative w-full max-w-[23rem] max-h-[85dvh] overflow-y-auto no-scrollbar rounded-[26px] p-4"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full border border-white/70 bg-white/55 text-[#71836e]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-[9px] border border-white/70 bg-gradient-to-br from-[#e6eddd] to-[#c9dbc4] text-[#5d785d]">
                  <Feather className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[7px] font-bold uppercase tracking-[0.16em] text-muted">From the field notes</div>
                  <div className="font-display text-[14px] leading-none text-[#4b5f4b]">A little context</div>
                </div>
              </div>
              <MeaningBody word={word} meaning={meaning} loading={loading} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MeaningBody({
  word,
  meaning,
  loading,
  compact = false,
}: {
  word: string;
  meaning: Meaning | null;
  loading: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("relative", compact ? "mt-1.5 rounded-[13px] border border-white/60 bg-white/35 p-2.5" : "mt-3")}>
      <div className="flex items-baseline justify-between gap-2">
        <div className={cn("font-display leading-none tracking-[-0.015em] text-[#33483a]", compact ? "text-[23px]" : "text-[34px]")}>
          {word.toLowerCase()}
        </div>
        <button
          onClick={() => speak(word)}
          aria-label={`Hear ${word}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/70 bg-white/50 text-[#74866f] transition-colors hover:bg-white/75"
        >
          <Volume2 className="h-3.5 w-3.5" strokeWidth={1.9} />
        </button>
      </div>

      {loading && !meaning ? (
        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-muted">
          <Loader2 className="h-3 w-3 animate-spin" /> Asking the librarian…
        </div>
      ) : meaning ? (
        <div className="mt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#e4ecdb] px-1.5 py-[1px] text-[7px] font-bold uppercase tracking-[0.09em] text-[#5f7a5f]">
              {meaning.pos}
            </span>
            <span className="text-[7px] font-medium uppercase tracking-[0.08em] text-[#9aa292]">
              {meaning.source === "field-notes" ? "field notes" : meaning.source === "librarian" ? "librarian" : "quiet guess"}
            </span>
          </div>
          <p className={cn("mt-1.5 leading-relaxed text-[#5c6d5b]", compact ? "text-[10px]" : "text-[11.5px]")}>{meaning.gloss}</p>
          {meaning.example && (
            <p className="mt-1.5 rounded-[8px] bg-white/40 px-2 py-1 text-[8.5px] italic leading-relaxed text-[#768673]">
              “{meaning.example}”
            </p>
          )}
        </div>
      ) : (
        <div className="mt-1.5 text-[10px] leading-relaxed text-[#7c8b77]">
          A word from the garden, kept in your herbarium even when the wider lexicon has little to say about it.
        </div>
      )}
      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 rounded-[11px] border border-white/60 bg-white/30 px-2 py-1.5 text-[7.5px] font-medium text-[#87927c]">
          <BookOpen className="h-2.5 w-2.5" /> Meanings are for curiosity, never for solving. Solve from attention alone.
        </div>
      )}
    </div>
  );
}
