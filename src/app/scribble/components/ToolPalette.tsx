"use client";

import { motion } from "framer-motion";
import {
  Circle,
  Eraser,
  Grid3x3,
  MousePointer,
  Palette,
  Pen,
  RectangleHorizontal,
  Redo,
  Trash2,
  Type,
  Undo,
} from "lucide-react";
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";

const tools = [
  { icon: MousePointer, label: "Select" },
  { icon: Pen, label: "Draw" },
  { icon: Eraser, label: "Erase" },
  { icon: RectangleHorizontal, label: "Rectangle" },
  { icon: Circle, label: "Circle" },
  { icon: Palette, label: "Color" },
  { icon: Type, label: "Text" },
  { icon: Grid3x3, label: "Grid" },
];

export default function ToolPalette() {
  const {
    activeTool,
    setTool,
    toolPaletteVisible,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    gridEnabled,
    toggleGrid,
    textFontFamily,
    setTextFontFamily,
    textFontStyle,
    setTextFontStyle,
    textFontWeight,
    setTextFontWeight,
  } = useToolStore();
  const { undo, redo } = useCanvasStore();

  if (!toolPaletteVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-24 flex flex-col gap-2 bg-white shadow-lg p-3 rounded-2xl max-h-[calc(100vh-120px)] overflow-y-auto z-40"
    >
      <div className="relative flex flex-col gap-2">
        {tools.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => setTool(item.label)}
            className={`p-2 rounded-xl flex items-center justify-center ${activeTool === item.label ? "bg-purple-100 border border-purple-400" : ""}`}
            title={item.label}
          >
            <item.icon size={22} />
          </button>
        ))}
      </div>
      <div className="border-t pt-2 mt-2 flex flex-col gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={undo}
            className="p-1 rounded hover:bg-gray-100"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={redo}
            className="p-1 rounded hover:bg-gray-100"
            title="Redo"
          >
            <Redo size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                "Clear all drawings? This action cannot be undone.",
              );
              if (confirmed) {
                // Clear all elements
                useCanvasStore.setState({
                  elements: [],
                  history: [[]],
                  historyIndex: 0,
                  selectedElement: null,
                });
                useCanvasStore.getState().saveToHistory();
              }
            }}
            className="p-1 rounded hover:bg-red-100"
            title="Clear Canvas"
          >
            <Trash2 size={18} />
          </button>
        </div>
        {activeTool === "Draw" && (
          <div className="space-y-1 min-w-32">
            <div>
              <label htmlFor="brush-size" className="text-xs block">
                Size: {brushSize}px
              </label>
              <input
                id="brush-size"
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="brush-opacity" className="text-xs block">
                Opacity: {opacity}
              </label>
              <input
                id="brush-opacity"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
        {activeTool === "Erase" && (
          <div className="space-y-1 min-w-32">
            <div>
              <label htmlFor="eraser-size" className="text-xs block">
                Size: {brushSize}px
              </label>
              <input
                id="eraser-size"
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
        {activeTool === "Color" && (
          <div className="space-y-1 min-w-32">
            <div>
              <label htmlFor="color-picker" className="text-xs block">
                Color
              </label>
              <input
                id="color-picker"
                type="color"
                value={useToolStore.getState().color}
                onChange={(e) =>
                  useToolStore.getState().setColor(e.target.value)
                }
                className="w-full h-8 border rounded"
              />
            </div>
          </div>
        )}
        {activeTool === "Grid" && (
          <button
            type="button"
            onClick={toggleGrid}
            className={`p-1 rounded text-xs ${gridEnabled ? "bg-purple-100" : ""}`}
          >
            {gridEnabled ? "Hide" : "Show"}
          </button>
        )}
        {activeTool === "Text" && (
          <div className="space-y-1 min-w-32">
            <div>
              <label htmlFor="text-font-size" className="text-xs block">
                Font Size: {brushSize}px
              </label>
              <input
                id="text-font-size"
                type="range"
                min="12"
                max="48"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="text-font-family" className="text-xs block">
                Font Family
              </label>
              <select
                id="text-font-family"
                className="w-full text-xs p-1 border rounded"
                value={textFontFamily}
                onChange={(e) => setTextFontFamily(e.target.value)}
              >
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
                <option>Georgia</option>
                <option>Verdana</option>
              </select>
            </div>
            <div>
              <label htmlFor="text-style" className="text-xs block">
                Style
              </label>
              <select
                id="text-style"
                className="w-full text-xs p-1 border rounded"
                value={`${textFontWeight} ${textFontStyle}`}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "Bold") {
                    setTextFontWeight("bold");
                    setTextFontStyle("normal");
                  } else if (value === "Italic") {
                    setTextFontWeight("normal");
                    setTextFontStyle("italic");
                  } else if (value === "Bold Italic") {
                    setTextFontWeight("bold");
                    setTextFontStyle("italic");
                  } else {
                    setTextFontWeight("normal");
                    setTextFontStyle("normal");
                  }
                }}
              >
                <option>Normal</option>
                <option>Bold</option>
                <option>Italic</option>
                <option>Bold Italic</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
