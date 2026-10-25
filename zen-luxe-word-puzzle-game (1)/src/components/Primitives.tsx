import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Droplet,
  Eye,
  Flower2,
  Leaf,
  Swords,
  Trophy,
  Zap,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { Achievement } from "../game/types";

export function Panel({
  children,
  className,
  variant = "glass",
  as: _as,
}: {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "deep" | "inset";
  as?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px]",
        variant === "glass" && "glass",
        variant === "deep" && "glass-deep",
        variant === "inset" && "inset-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex select-none items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[13px] border border-white/70 bg-gradient-to-br from-[#7f9b81] via-[#5b7a62] to-[#3f5b49] shadow-[0_8px_18px_-10px_rgba(42,68,50,0.9),inset_0_1px_0_rgba(255,255,255,0.45)]">
        <Leaf className="h-[17px] w-[17px] text-[#f7f4e9]" strokeWidth={1.7} />
        <span className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/25 blur-[5px]" />
        <span className="pointer-events-none absolute inset-x-1 bottom-0 h-1/2 rounded-b-[12px] bg-gradient-to-t from-black/10 to-transparent" />
      </div>
      <div className="leading-none">
        <div className={cn("font-display tracking-[-0.02em] text-ink", compact ? "text-[23px]" : "text-[27px]")}>
          serein
        </div>
        <div className="mt-[3px] text-[7.5px] font-bold uppercase tracking-[0.3em] text-muted/80">a word ritual</div>
      </div>
    </div>
  );
}

export function Dew({ amount, className, minimal = false }: { amount: number; className?: string; minimal?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/50 py-1 pl-1 pr-2.5 text-[11.5px] font-bold tabular-nums text-[#45604f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
        className,
      )}
    >
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#cfe1d6] to-[#a9c4b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(63,92,72,0.25)]">
        <Droplet className="h-[10px] w-[10px] fill-[#5d8070] text-[#4c6d5d]" strokeWidth={1.6} />
      </span>
      {amount.toLocaleString()}
      {!minimal && <span className="ml-0.5 hidden font-semibold text-muted xs:inline">dew</span>}
    </span>
  );
}

export function IconButton({
  children,
  label,
  onClick,
  className,
  active = false,
  badge,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-full border text-[#526457] transition-colors",
        active
          ? "border-white/70 bg-[var(--accent-soft)] text-[var(--accent-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          : "border-white/70 bg-white/45 hover:bg-white/70",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-8px_rgba(45,63,49,0.6)]",
        className,
      )}
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full border border-white/80 bg-[var(--gold)] px-1 text-[8px] font-bold text-white shadow-sm">
          {badge}
        </span>
      ) : null}
    </motion.button>
  );
}

export function SectionLabel({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2 px-0.5", className)}>
      <span className="eyebrow">{children}</span>
      {action}
    </div>
  );
}

export function Bar({
  value,
  className,
  barClassName,
  animate = true,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  animate?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#4c6553]/10 shadow-[inset_0_1px_2px_rgba(45,62,48,0.12)]", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r from-[#7f9c80] via-[#6c8c72] to-[#54755e]", barClassName)}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={animate ? { type: "spring", stiffness: 90, damping: 20 } : { duration: 0 }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 52,
  stroke = 4,
  children,
  urgent = false,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  urgent?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(58,78,62,0.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={urgent ? "#b1794f" : "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
          style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

const GLYPHS: Record<Achievement["glyph"], LucideIcon> = {
  eye: Eye,
  zap: Zap,
  leaf: Leaf,
  trophy: Trophy,
  sun: Sun,
  flower: Flower2,
  duel: Swords,
  crown: Crown,
};

export function AchievementGlyph({
  glyph,
  unlocked = true,
  size = "md",
}: {
  glyph: Achievement["glyph"];
  unlocked?: boolean;
  size?: "sm" | "md";
}) {
  const Icon = GLYPHS[glyph] ?? Leaf;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[13px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        size === "md" ? "h-10 w-10" : "h-8 w-8",
        unlocked
          ? "border-white/70 bg-gradient-to-br from-[#e7eedd] to-[#cddcc7] text-[#4e6c54]"
          : "border-white/50 bg-white/30 text-[#8b968b] grayscale",
      )}
    >
      <Icon className={size === "md" ? "h-[18px] w-[18px]" : "h-4 w-4"} strokeWidth={1.7} />
      {unlocked && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)] shadow-sm" />}
    </span>
  );
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
  layoutId = "segmented-pill",
  ariaLabel,
}: {
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  layoutId?: string;
  ariaLabel?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("segmented", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(o.value)}
            className="relative min-w-0 flex-1"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full border border-white/80 bg-white/85 shadow-[0_5px_12px_-8px_rgba(45,63,49,0.65),inset_0_1px_0_rgba(255,255,255,0.9)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex min-w-0 flex-col items-center leading-none">
              <span className="flex min-w-0 items-baseline gap-1">
                <span className="truncate">{o.label}</span>
                {o.sub && (
                  <span className="hidden text-[8.5px] font-semibold uppercase tracking-[0.08em] opacity-60 sm:inline">
                    {o.sub}
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SparkleField({ count = 9 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#e6d7b5]"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            left: `${(i * 37 + 11) % 92}%`,
            top: `${(i * 53 + 7) % 88}%`,
          }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.8, 1.2, 0.8], y: [0, -8, 0] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-gradient-to-r from-transparent via-[#4c6553]/15 to-transparent", className)} />;
}
