import { useEffect } from "react";
import { GameProvider, useGame } from "./game/GameController";
import { Ambient } from "./components/Ambient";
import { TopBar } from "./components/TopBar";
import { RitualSidebar, InsightSidebar } from "./components/SidePanels";
import { GameView } from "./components/GameView";
import { BottomNav } from "./components/BottomNav";
import { SheetHost } from "./components/sheets/SheetHost";
import { ResultOverlay, ToastStack, WelcomeOverlay } from "./components/Overlays";
import { Leaf } from "lucide-react";

function AppShell() {
  const {
    activeSheet,
    resultOpen,
    progress,
    handleKey,
    mode,
    classic,
    fever,
    vs,
  } = useGame();

  // Physical keyboard support — ignored while a sheet, dialog or text field is focused.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (activeSheet || resultOpen || !progress.seenIntro) return;
      if (mode === "classic" && classic.status !== "playing") return;
      if (mode === "fever" && fever.phase !== "playing") return;
      if (mode === "versus" && vs.phase !== "playP1" && vs.phase !== "playP2") return;

      if (/^[a-zA-Z]$/.test(event.key) || event.key === "Enter" || event.key === "Backspace") {
        event.preventDefault();
        handleKey(event.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSheet, resultOpen, progress.seenIntro, mode, classic.status, fever.phase, vs.phase, handleKey]);

  return (
    <>
      <Ambient />
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
        <TopBar />

        <main className="relative mx-auto flex min-h-0 w-full flex-1 px-3 pb-[calc(80px+env(safe-area-inset-bottom))] pt-0.5 sm:px-4 lg:px-8 lg:pb-5 lg:pt-1">
          <div className="mx-auto grid h-full min-h-0 w-full max-w-[1480px] flex-1 grid-cols-1 grid-rows-1 gap-4 lg:grid-cols-[14.6rem_minmax(0,1fr)_15.4rem] xl:grid-cols-[16rem_minmax(0,1fr)_16.8rem] xl:gap-5">
            <RitualSidebar />

            <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
              <GameView />
            </div>

            <InsightSidebar />
          </div>
        </main>

        <BottomNav />
      </div>

      <SheetHost />
      <ResultOverlay />
      <WelcomeOverlay />
      <ToastStack />

      <div className="portrait-lock">
        <div className="glass-deep max-w-[22rem] rounded-[28px] px-6 py-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] border border-white/70 bg-gradient-to-br from-[#8ba38b] to-[#56715e] text-[#f7f4e9] shadow-[0_10px_24px_-12px_rgba(40,66,48,0.8)]">
            <Leaf className="h-5 w-5" strokeWidth={1.7} />
          </div>
          <div className="eyebrow mt-3">Serein · portrait ritual</div>
          <h2 className="mt-1 font-display text-[27px] leading-tight text-[#2f4337]">Turn back to portrait.</h2>
          <p className="mt-2 text-[10px] leading-relaxed text-[#6f8071]">
            The garden is grown for one hand and one quiet column. Rotate your device and the tiles will settle back into place.
          </p>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
