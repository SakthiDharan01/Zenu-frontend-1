"use client";

import { useEffect, useState } from "react";
import { trackEngagement } from '@/lib/signals';
import BottomBar from "./components/BottomBar";
import CanvasArea from "./components/CanvasArea";
import StickerPanel from "./components/modals/StickerPanel";
import Sidebar from "./components/Sidebar";
import ToolPalette from "./components/ToolPalette";
import { useCanvasStore } from "./store/canvasStore";
import { useToolStore } from "./store/toolStore";
import { useAutosave } from "./utils/autosave";
import { useShortcuts } from "./utils/shortcuts";
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

export default function Page() {
  const { setTool } = useToolStore();
  const { loadFromLocalStorage } = useCanvasStore();
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const { showStickerPanel, setShowStickerPanel } = useToolStore();

  useAutosave();
  useShortcuts(setTool);

  useEffect(() => {
    trackEngagement('arts_scribble', 'opened');
    const start = Date.now();
    loadFromLocalStorage();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('arts_scribble', 'completed', duration);
    };
  }, [loadFromLocalStorage]);

  const theme = getTheme('scribble');

  return (
    <ModulePage theme={theme}>
      <div
        className="relative flex h-[calc(100dvh-4rem)] w-full overflow-hidden"
        data-zen-atmosphere="none"
        style={{ background: 'transparent' }}
      >
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <CanvasArea selectedSticker={selectedSticker} />
      </div>
      <ToolPalette />
      <BottomBar />

      <StickerPanel
        isOpen={showStickerPanel}
        onClose={() => setShowStickerPanel(false)}
        onSelectSticker={(sticker) => {
          setSelectedSticker(sticker);
          useToolStore.getState().setTool("Sticker");
          setShowStickerPanel(false);
        }}
        onPlaceSticker={(sticker) => {
          setSelectedSticker(sticker);
          useToolStore.getState().setTool("Sticker");
          setShowStickerPanel(false);
        }}
      />
      </div>
    </ModulePage>
  );
}
