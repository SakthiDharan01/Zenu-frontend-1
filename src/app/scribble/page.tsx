"use client";

import { useEffect, useState } from "react";
import BottomBar from "./components/BottomBar";
import CanvasArea from "./components/CanvasArea";
import StickerPanel from "./components/modals/StickerPanel";
import Sidebar from "./components/Sidebar";
import ToolPalette from "./components/ToolPalette";
import { useCanvasStore } from "./store/canvasStore";
import { useToolStore } from "./store/toolStore";
import { useAutosave } from "./utils/autosave";
import { useShortcuts } from "./utils/shortcuts";

export default function Page() {
  const { setTool } = useToolStore();
  const { loadFromLocalStorage } = useCanvasStore();
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const { showStickerPanel, setShowStickerPanel } = useToolStore();

  useAutosave();
  useShortcuts(setTool);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const { darkMode } = useToolStore();

  return (
    <div className={`relative flex h-[calc(100vh-64px)] w-full overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <CanvasArea selectedSticker={selectedSticker} />
      </div>
      <ToolPalette />
      <BottomBar />

      {/* Modals */}
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
  );
}
