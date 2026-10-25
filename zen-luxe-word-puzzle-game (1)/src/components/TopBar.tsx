import { motion } from "framer-motion";
import { Flame, Flower2, Gift, Leaf, Map, Settings2, Volume2, VolumeX } from "lucide-react";
import { todayStreak, useGame, type SheetId } from "../game/GameController";
import { Dew, IconButton, Wordmark } from "./Primitives";
import { cn } from "../utils/cn";

export function TopBar() {
  const { progress, level, openSheet, updateSettings, activeSheet, questClaimables, bloomClaimables } = useGame();
  const streak = todayStreak(progress);
  const rewardsReady = questClaimables + bloomClaimables;

  const nav: { label: string; id: SheetId; active: boolean }[] = [
    { label: "Play", id: null, active: activeSheet === null || activeSheet === "modes" || activeSheet === "stats" || activeSheet === "help" },
    { label: "Journey", id: "journey", active: activeSheet === "journey" || activeSheet === "quests" },
    { label: "Garden", id: "garden", active: activeSheet === "garden" || activeSheet === "achievements" },
    { label: "Progress", id: "stats", active: activeSheet === "stats" },
    { label: "Atelier", id: "shop", active: activeSheet === "shop" || activeSheet === "gift" },
  ];

  return (
    <header className="safe-top relative z-20 shrink-0">
      <div className="mx-auto flex h-[54px] w-full max-w-[1480px] items-center justify-between gap-3 px-3.5 sm:px-5 lg:h-[66px] lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <button onClick={() => openSheet("help")} className="shrink-0 text-left" aria-label="About Serein">
            <Wordmark />
          </button>
          <nav className="hidden items-center gap-0.5 rounded-full border border-white/60 bg-white/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                onClick={() => (item.id ? openSheet(item.id) : openSheet("modes"))}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.01em] transition-colors",
                  item.active ? "text-[var(--accent-deep)]" : "text-[#6c7b6e] hover:text-[var(--accent-deep)]",
                )}
              >
                {item.active && (
                  <motion.span
                    layoutId="top-nav-pill"
                    className="absolute inset-0 rounded-full border border-white/80 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-8px_rgba(45,63,49,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {item.label}
                  {item.id === "journey" && rewardsReady > 0 && (
                    <span className="grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[var(--gold)] px-1 text-[7px] font-bold text-white">
                      {rewardsReady}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => openSheet("quests")}
            aria-label="Open today's quests and rewards"
            className="hidden items-center gap-1 rounded-full border border-white/65 bg-white/45 py-1 pl-1.5 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] xs:flex"
          >
            <Flame className="h-3 w-3 text-[#b58c55]" strokeWidth={2.1} />
            <span className="text-[10.5px] font-bold tabular-nums text-[#63765f]">{streak}</span>
          </button>

          <button
            onClick={() => openSheet("shop")}
            aria-label="Dewdrops — open the Atelier"
            className="rounded-full transition-transform active:scale-95"
          >
            <Dew amount={progress.dewdrops} minimal />
          </button>

          {!progress.daily.claimedToday && (
            <IconButton label="Daily gift" onClick={() => openSheet("gift")} badge={1} className="hidden md:grid">
              <Gift className="h-4 w-4" strokeWidth={1.8} />
            </IconButton>
          )}

          <IconButton
            label={progress.sound ? "Mute sound and haptics" : "Unmute sound and haptics"}
            active={progress.sound}
            onClick={() => updateSettings({ sound: !progress.sound, haptics: !progress.sound ? true : progress.haptics })}
            className="hidden md:grid"
          >
            {progress.sound ? <Volume2 className="h-4 w-4" strokeWidth={1.8} /> : <VolumeX className="h-4 w-4" strokeWidth={1.8} />}
          </IconButton>

          <IconButton label="Settings" onClick={() => openSheet("settings")} className="hidden md:grid">
            <Settings2 className="h-4 w-4" strokeWidth={1.8} />
          </IconButton>

          <button
            onClick={() => openSheet("profile")}
            className={cn(
              "relative ml-0.5 grid h-8 w-8 place-items-center rounded-full border text-[10.5px] font-bold text-white transition-transform active:scale-95",
              activeSheet === "profile" || activeSheet === "settings"
                ? "border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0_0_3px_rgba(163,186,155,0.25),0_8px_16px_-8px_rgba(40,66,48,0.8)]"
                : "border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_14px_-8px_rgba(40,66,48,0.8)]",
              "bg-gradient-to-br from-[#8ba38b] to-[#56715e]",
            )}
            aria-label={`${progress.name}, level ${level.level} — open profile`}
          >
            <Leaf className="absolute inset-0 m-auto h-4 w-4 opacity-25" strokeWidth={1.4} />
            <span className="relative">{level.level}</span>
          </button>
        </div>
      </div>

      {/* A whisper of context on phones: where you are and what's waiting. */}
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-3.5 pb-0.5 lg:hidden">
        <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.13em] text-[#8b9788]">
          <span>{progress.name}</span>
          <span className="h-[2px] w-[2px] rounded-full bg-[#a8b2a8]" />
          <span className="text-[#7c8c79]">{level.title}</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em]">
          {rewardsReady > 0 ? (
            <button onClick={() => openSheet("quests")} className="flex items-center gap-1 text-[#9a7c42]">
              <Gift className="h-2.5 w-2.5" /> {rewardsReady} reward{rewardsReady === 1 ? "" : "s"}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[#84907f]">
              <Map className="h-2.5 w-2.5" /> {progress.journey.completed}/24 path
            </span>
          )}
          <span className="flex items-center gap-1 text-[#84907f]">
            <Flower2 className="h-2.5 w-2.5" /> {progress.collection.length}
          </span>
        </div>
      </div>
    </header>
  );
}
