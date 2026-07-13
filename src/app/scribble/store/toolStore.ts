import { create } from "zustand";

interface ToolState {
  activeTool: string;
  setTool: (tool: string) => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  gridEnabled: boolean;
  toggleGrid: () => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  toolPaletteVisible: boolean;
  toggleToolPalette: () => void;
  showStickerPanel: boolean;
  setShowStickerPanel: (show: boolean) => void;
  textFontFamily: string;
  setTextFontFamily: (font: string) => void;
  textFontStyle: string;
  setTextFontStyle: (style: string) => void;
  textFontWeight: string;
  setTextFontWeight: (weight: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: "Draw",
  setTool: (tool) => set({ activeTool: tool }),
  color: "#7c3aed",
  setColor: (color) => set({ color }),
  brushSize: 3,
  setBrushSize: (size) => set({ brushSize: size }),
  opacity: 1,
  setOpacity: (opacity) => set({ opacity }),
  gridEnabled: false,
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  gridSize: 20,
  setGridSize: (size) => set({ gridSize: size }),
  fillColor: "transparent",
  setFillColor: (color) => set({ fillColor: color }),
  strokeWidth: 3,
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  toolPaletteVisible: false,
  toggleToolPalette: () =>
    set((state) => ({ toolPaletteVisible: !state.toolPaletteVisible })),
  showStickerPanel: false,
  setShowStickerPanel: (show) => set({ showStickerPanel: show }),
  textFontFamily: "Arial",
  setTextFontFamily: (font) => set({ textFontFamily: font }),
  textFontStyle: "normal",
  setTextFontStyle: (style) => set({ textFontStyle: style }),
  textFontWeight: "normal",
  setTextFontWeight: (weight) => set({ textFontWeight: weight }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
