import { motion } from "framer-motion";
import { Check, Delete, SearchX } from "lucide-react";
import { cn } from "../utils/cn";
import type { TileStatus } from "../game/types";

const ROW_ONE = "qwertyuiop";
const ROW_TWO = "asdfghjkl";
const ROW_THREE = "zxcvbnm";

export function Keyboard({
  statuses,
  eliminated = [],
  onKey,
  disabled = false,
  symbols = false,
  hideEnter = false,
  enterState = "incomplete",
}: {
  statuses: Record<string, TileStatus>;
  eliminated?: string[];
  onKey: (key: string) => void;
  disabled?: boolean;
  symbols?: boolean;
  hideEnter?: boolean;
  enterState?: "incomplete" | "valid" | "invalid" | "disabled";
}) {
  const valid = enterState === "valid";
  const invalid = enterState === "invalid";
  const statusClass = (key: string) => {
    if (eliminated.includes(key)) return "key-eliminated";
    const status = statuses[key];
    if (status === "correct") return "key-correct";
    if (status === "present") return "key-present";
    if (status === "absent") return "key-absent";
    return "";
  };

  const renderKey = (key: string, extraClass?: string) => {
    const status = statuses[key];
    const isEliminated = eliminated.includes(key);
    return (
      <motion.button
        key={key}
        type="button"
        disabled={disabled || isEliminated}
        onClick={(e) => {
          e.preventDefault();
          onKey(key);
        }}
        whileTap={{ scale: 0.94, y: 1 }}
        transition={{ type: "spring", stiffness: 620, damping: 30 }}
        aria-label={`${key.toUpperCase()}${status ? `, ${status}` : ""}${isEliminated ? ", cleared" : ""}`}
        className={cn("key flex-1", statusClass(key), extraClass)}
      >
        <span className={cn("relative z-10", isEliminated && "opacity-50 line-through decoration-[1px]")}>
          {key.toUpperCase()}
        </span>
        {symbols && status && !isEliminated && (
          <span
            className={cn(
              "absolute bottom-[5px] left-1/2 -translate-x-1/2",
              status === "present" && "rotate-45",
              status === "correct" && "h-[3px] w-[3px] rounded-full bg-current opacity-70",
              status === "present" && "h-[3px] w-[3px] rounded-[1px] bg-current opacity-70",
              status === "absent" && "h-[1.5px] w-[4px] rounded-full bg-current opacity-60",
            )}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[30rem] select-none flex-col gap-[clamp(4px,0.9vw,6px)] transition-opacity",
        disabled && "opacity-60",
      )}
      aria-label="On-screen keyboard"
      role="group"
    >
      <div className="flex justify-center gap-[clamp(3px,0.8vw,5px)]">
        {ROW_ONE.split("").map((key) => renderKey(key))}
      </div>
      <div className="mx-auto flex w-[91%] justify-center gap-[clamp(3px,0.8vw,5px)]">
        {ROW_TWO.split("").map((key) => renderKey(key))}
      </div>
      <div className="flex justify-center gap-[clamp(3px,0.8vw,5px)]">
        <motion.button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            onKey("Backspace");
          }}
          whileTap={{ scale: 0.94, y: 1 }}
          className="key flex-[1.45] px-1"
          aria-label="Delete last letter"
        >
          <Delete className="h-[17px] w-[17px] opacity-65" strokeWidth={1.8} />
        </motion.button>
        {ROW_THREE.split("").map((key) => renderKey(key))}
        {!hideEnter && (
          <motion.button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              onKey("Enter");
            }}
            whileTap={{ scale: 0.96, y: 1 }}
            animate={
              valid
                ? {
                    boxShadow: [
                      "0 8px 16px -9px rgba(45,76,55,0.75)",
                      "0 0 0 3px rgba(163,186,155,0.30), 0 10px 20px -8px rgba(45,76,55,0.9)",
                      "0 8px 16px -9px rgba(45,76,55,0.75)",
                    ],
                  }
                : { boxShadow: "0 6px 12px -10px rgba(45,76,55,0.55)" }
            }
            transition={valid ? { duration: 2.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            className={cn(
              "key flex-[1.55] gap-1 px-1 text-[9px] font-bold uppercase leading-none tracking-[0.06em] transition-colors",
              valid && "key-accent ring-1 ring-[#b6cfae]/70",
              invalid && "border-[#d8c29c]/80 bg-gradient-to-br from-[#f4e9d4] to-[#e8d8bb] text-[#8d7547] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_2px_0_rgba(170,146,105,0.28)]",
              enterState === "incomplete" && "text-[#7d8a7a] opacity-80",
            )}
            aria-label={invalid ? "Not a word — press to check" : valid ? "Submit word" : "Enter, word incomplete"}
          >
            {valid ? (
              <>
                <Check className="h-3 w-3" strokeWidth={2.8} /> Enter
              </>
            ) : invalid ? (
              <>
                <SearchX className="h-3 w-3" strokeWidth={2.2} />
                <span className="leading-[1.05]">Not a<br />word</span>
              </>
            ) : (
              "Enter"
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
