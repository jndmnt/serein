import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Tile } from "./Tile";

import type { Evaluation, Reveal, TileStatus, WordLength } from "../game/types";


export function Board({
  length,
  guesses,
  slots,
  cursor = 0,
  reveals,
  status,
  shakeKey,
  symbols,
  className,
  rows = 6,
  onSelectCell,
}: {
  rows?: number;
  length: WordLength;
  guesses: Evaluation[];
  slots: (string | null)[];
  cursor?: number;
  reveals: Reveal[];
  status: "playing" | "won" | "lost";
  shakeKey: number;
  symbols: boolean;
  className?: string;
  onSelectCell?: (index: number) => void;
}) {
  const controls = useAnimationControls();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tile, setTile] = useState(44);

  useEffect(() => {
    if (!shakeKey) return;
    void controls.start({
      x: [0, -10, 8, -7, 5, -3, 0],
      rotate: [0, -0.6, 0.5, -0.3, 0],
      transition: { duration: 0.44, ease: "easeInOut" },
    });
  }, [shakeKey, controls]);

  // Measure the real available area so the entire board always fits without
  // scrolling, growing tiles to fill the space rather than guessing from dvh.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const gap = window.innerWidth < 380 ? 4 : window.innerWidth < 1024 ? 5 : 9;
      // Use the parent panel's height (not the wrapper's) to avoid a feedback
      // loop where growing tiles grow the measured box.
      const rect = wrap.getBoundingClientRect();
      const width = rect.width || wrap.clientWidth;
      const height = rect.height || wrap.clientHeight;
      if (width < 40 || height < 40) return;
      const byWidth = (width - gap * (length - 1)) / length;
      const byHeight = (height - gap * (rows - 1) - 4) / rows;
      const next = Math.max(20, Math.min(60, Math.floor(Math.min(byWidth, byHeight))));
      setTile((prev) => (Math.abs(prev - next) > 0.75 ? next : prev));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(wrap);
    const timer = window.setTimeout(compute, 120);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [length, rows]);

  const pinned = new Set(reveals.map((r) => r.index));
  const currentIndex = guesses.length;
  const gap = length === 6 ? 5 : 6;

  return (
    <div ref={wrapRef} className={`flex min-h-0 w-full flex-1 items-center justify-center ${className ?? ""}`}>
      <motion.div
        animate={controls}
        role="grid"
        aria-label="Word board"
        className="word-board shrink-0"
        style={{ "--cols": length, "--tile": `${tile}px`, gap: `${gap}px` } as CSSProperties}
      >
        {Array.from({ length: rows }).map((_, row) => {
          const guess = guesses[row];
          const isCurrent = !guess && row === currentIndex && status === "playing";
          const isFuture = !guess && row > currentIndex;
          return (
            <div
              key={row}
              role="row"
              className="grid"
              style={{ gridTemplateColumns: `repeat(${length}, ${tile}px)`, gap: `${gap}px` }}
            >
              {Array.from({ length }).map((_, col) => {
                if (guess) {
                  return (
                    <Tile
                      key={`${row}-${col}-${guess.word[col]}`}
                      letter={guess.word[col]}
                      status={guess.states[col] as TileStatus}
                      index={col}
                      delay={0.05}
                      flip
                      symbols={symbols}
                      celebrate={status === "won" && row === guesses.length - 1}
                    />
                  );
                }
                if (isCurrent) {
                  const letter = slots[col] ?? null;
                  const hint = pinned.has(col);
                  return (
                    <button
                      key={`${row}-${col}-${letter ?? "_"}-${hint ? "h" : ""}`}
                      type="button"
                      onClick={() => onSelectCell?.(col)}
                      className="appearance-none rounded-[27%] text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
                      aria-label={`Position ${col + 1}${letter ? `, ${letter.toUpperCase()}` : ", empty"}${hint ? ", revealed by Sunbeam" : ""}`}
                      tabIndex={-1}
                    >
                      <Tile
                        letter={letter}
                        cursor={col === cursor && !letter}
                        focused={col === cursor}
                        index={col}
                        hinted={hint}
                        symbols={symbols}
                      />
                    </button>
                  );
                }
                if (isFuture) return <Tile key={`${row}-${col}`} letter={null} index={col} symbols={symbols} />;
                return <Tile key={`${row}-${col}`} letter={null} index={col} symbols={symbols} />;
              })}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
