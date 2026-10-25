import { motion } from "framer-motion";
import { Feather, Flower2, Map, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";
import { useGame } from "../game/GameController";
import { cn } from "../utils/cn";

type Tab = "play" | "journey" | "garden" | "shop" | "profile";

export function BottomNav() {
  const { activeSheet, openSheet, closeSheet, progress, questClaimables, bloomClaimables, dailyBloomInfo } = useGame();

  const items: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "play", label: "Play", icon: Feather },
    { id: "journey", label: "Journey", icon: Map },
    { id: "garden", label: "Garden", icon: Flower2 },
    { id: "shop", label: "Atelier", icon: ShoppingBag },
    { id: "profile", label: "You", icon: UserRound },
  ];

  const activeTab = (): Tab => {
    if (activeSheet === null || activeSheet === "modes" || activeSheet === "stats" || activeSheet === "help") return "play";
    if (activeSheet === "journey" || activeSheet === "quests") return "journey";
    if (activeSheet === "garden" || activeSheet === "achievements") return "garden";
    if (activeSheet === "shop" || activeSheet === "gift") return "shop";
    return "profile";
  };

  const active = activeTab();
  const journeyBadge = questClaimables + bloomClaimables;

  const onTab = (tab: Tab) => {
    if (tab === "play") {
      closeSheet();
      return;
    }
    if (tab === "journey") openSheet("journey");
    else if (tab === "garden") openSheet("garden");
    else if (tab === "shop") openSheet("shop");
    else openSheet("profile");
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-2.5 pb-[max(8px,env(safe-area-inset-bottom))] lg:hidden">
      <nav
        aria-label="Primary"
        className="pointer-events-auto relative flex w-full max-w-[27rem] items-stretch justify-between gap-0.5 rounded-[23px] border border-white/75 bg-[rgba(250,249,242,0.8)] p-1.5 shadow-[0_-10px_40px_-16px_rgba(49,66,51,0.5),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const badge =
            item.id === "journey"
              ? journeyBadge
              : item.id === "shop" && !progress.daily.claimedToday
                ? 1
                : item.id === "garden" && !dailyBloomInfo.done
                  ? 1
                  : 0;
          return (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px] py-1.5 transition-colors",
                isActive ? "text-[var(--accent-deep)]" : "text-[#849183]",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-[18px] border border-white/85 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_-8px_rgba(45,63,49,0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.1 : 1.7} />
                {badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 grid h-3 min-w-3 place-items-center rounded-full border border-white/90 bg-gradient-to-br from-[#d9b77d] to-[#bd934f] px-[3px] text-[6px] font-bold leading-none text-white shadow-[0_1px_3px_rgba(120,90,40,0.4)]">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="relative text-[8px] font-bold tracking-[0.015em]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
