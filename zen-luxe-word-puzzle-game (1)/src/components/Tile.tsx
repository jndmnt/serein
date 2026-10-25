import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { cn } from "../utils/cn";
import type { TileStatus } from "../game/types";

export function Tile({
  letter,
  status,
  cursor = false,
  flip = false,
  delay = 0,
  hinted = false,
  ghostHint = false,
  index,
  symbols = false,
  celebrate = false,
  focused = false,
}: {
  letter: string | null;
  status?: TileStatus | null;
  cursor?: boolean;
  flip?: boolean;
  delay?: number;
  hinted?: boolean;
  ghostHint?: boolean;
  index: number;
  symbols?: boolean;
  celebrate?: boolean;
  focused?: boolean;
}) {
  const hasLetter = Boolean(letter);
  const material = status
    ? `tile-${status}`
    : ghostHint
      ? "tile-ghost"
      : hasLetter || cursor
        ? "tile-active"
        : "tile-empty";

  return (
    <motion.div
      role="gridcell"
      aria-label={`${letter ?? "empty"}${status ? `, ${status}` : ""}`}
      initial={
        flip
          ? { rotateX: -88, opacity: 0.35, scale: 0.97 }
          : hasLetter
            ? { scale: 0.91, opacity: 0.65 }
            : { opacity: 1 }
      }
      animate={
        flip
          ? { rotateX: 0, opacity: 1, scale: 1 }
          : celebrate
            ? { scale: 1, opacity: 1, y: [0, -5, -1, -3, 0] }
            : { scale: 1, opacity: 1, y: 0 }
      }
      transition={
        flip
          ? { duration: 0.52, delay: delay + index * 0.115, ease: [0.2, 0.7, 0.25, 1] }
          : celebrate
            ? { duration: 0.65, delay: index * 0.07, ease: "easeInOut" }
            : { type: "spring", stiffness: 520, damping: 26 }
      }
      style={{ transformPerspective: 900 }}
      className={cn(
        "tile tile-base select-none",
        material,
        hinted && "tile-pinned",
        focused && "tile-focused",
        ghostHint && "opacity-60",
      )}
    >
      {hasLetter ? <span className="relative z-10">{letter?.toUpperCase()}</span> : null}
      {cursor && !hasLetter ? (
        <motion.span
          className="absolute bottom-[16%] left-1/2 h-[2.5px] w-[30%] -translate-x-1/2 rounded-full bg-[var(--accent)]/55"
          animate={{ opacity: [0.3, 0.95, 0.3], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {hinted && (
        <span className="pointer-events-none absolute bottom-[6%] right-[8%] text-[#f4ecd4]/80">
          <Sun className="h-[10px] w-[10px]" strokeWidth={2.2} />
        </span>
      )}
      {symbols && status === "correct" && <span className="tile-symbol !opacity-80" />}
      {symbols && status === "present" && (
        <span className="tile-symbol rotate-45 !rounded-[1px] !opacity-80" />
      )}
      {symbols && status === "absent" && (
        <span className="absolute right-[14%] top-[16%] h-[1.5px] w-[5px] rounded-full bg-current opacity-60" />
      )}
    </motion.div>
  );
}
