import { AnimatePresence } from "framer-motion";
import { useGame } from "../../game/GameController";
import { SheetShell } from "./SheetShell";
import {
  AchievementsSheet,
  GiftSheet,
  HelpSheet,
  ModeSheet,
  SettingsSheet,
  ShopSheet,
  StatsSheet,
} from "./SheetContent";
import { GardenSheet, JourneySheet, ProfileSheet, QuestsSheet } from "./AdventureSheets";

const META = {
  modes: { eyebrow: "The ritual", title: "Choose your", italic: "stillness", wide: false },
  stats: { eyebrow: "Your journey", title: "Quiet", italic: "progress", wide: true },
  shop: { eyebrow: "Kind economy", title: "The", italic: "Atelier", wide: true },
  settings: { eyebrow: "Make it yours", title: "Tend the", italic: "ritual", wide: false },
  gift: { eyebrow: "Daily dew", title: "A small", italic: "gathering", wide: false },
  achievements: { eyebrow: "In bloom", title: "Your", italic: "badges", wide: true },
  help: { eyebrow: "Welcome to Serein", title: "A quiet", italic: "word ritual", wide: false },
  journey: { eyebrow: "Chapters I–VI", title: "The quiet", italic: "path", wide: true },
  garden: { eyebrow: "Your collection", title: "The", italic: "herbarium", wide: true },
  quests: { eyebrow: "Daily tending", title: "Quests &", italic: "bloom", wide: true },
  profile: { eyebrow: "Your garden", title: "A quiet", italic: "self", wide: true },
} as const;

export function SheetHost() {
  const { activeSheet, closeSheet } = useGame();
  const meta = activeSheet ? META[activeSheet] : META.help;

  return (
    <AnimatePresence>
      {activeSheet && (
        <SheetShell
          key={activeSheet}
          onClose={closeSheet}
          eyebrow={meta.eyebrow}
          title={meta.title}
          italic={meta.italic}
          wide={meta.wide}
        >
          {activeSheet === "modes" && <ModeSheet />}
          {activeSheet === "stats" && <StatsSheet />}
          {activeSheet === "shop" && <ShopSheet />}
          {activeSheet === "settings" && <SettingsSheet />}
          {activeSheet === "gift" && <GiftSheet />}
          {activeSheet === "achievements" && <AchievementsSheet />}
          {activeSheet === "help" && <HelpSheet />}
          {activeSheet === "journey" && <JourneySheet />}
          {activeSheet === "garden" && <GardenSheet />}
          {activeSheet === "quests" && <QuestsSheet />}
          {activeSheet === "profile" && <ProfileSheet />}
        </SheetShell>
      )}
    </AnimatePresence>
  );
}
