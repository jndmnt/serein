import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * A tactile slide-over sheet: bottom drawer on phones, floating panel on
 * desktop. Headers stay fixed while content scrolls beneath.
 */
export function SheetShell({
  onClose,
  eyebrow,
  title,
  italic,
  children,
  wide = false,
}: {
  onClose: () => void;
  eyebrow: string;
  title: string;
  italic?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <motion.button
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-[#223428]/30 backdrop-blur-[4px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: "9%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "7%" }}
        transition={{ type: "spring", stiffness: 300, damping: 33 }}
        className={cn(
          "glass-deep relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border-b-0 sm:max-h-[86dvh] sm:rounded-[32px] sm:border-b",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#48604d]/20 sm:hidden" />
        <header className="flex shrink-0 items-start justify-between gap-4 px-4 pb-3 pt-3 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <div className="eyebrow">{eyebrow}</div>
            <h2 className="mt-1 font-display text-[27px] leading-none tracking-[-0.01em] text-[#2b3a2f] sm:text-[30px]">
              {title} {italic && <em className="text-[var(--accent)]">{italic}</em>}
            </h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/70 bg-white/55 text-[#6b7c6c] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white/80"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </motion.button>
        </header>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(20px,calc(env(safe-area-inset-bottom)+12px))] sm:px-6 sm:pb-6">
          {children}
        </div>
      </motion.section>
    </div>
  );
}
