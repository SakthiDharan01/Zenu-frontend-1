"use client";

import { X } from "lucide-react";
import { useToolStore } from "../../store/toolStore";

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
  "#ffc0cb",
  "#a52a2a",
  "#808080",
  "#000080",
  "#008000",
  "#ff4500",
  "#7c3aed",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function ColorPicker({ isOpen, onClose }: ColorPickerProps) {
  const { color, setColor, fillColor, setFillColor } = useToolStore();

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-80 z-50 border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Color Picker</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Stroke Color</h3>
          <div className="grid grid-cols-8 gap-2">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  setColor(c);
                  onClose();
                }}
                className={`w-8 h-8 rounded border-2 ${color === c ? "border-gray-800" : "border-gray-300"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onClose();
            }}
            className="mt-2 w-full h-8 border rounded"
          />
        </div>
        <div>
          <h3 className="font-medium mb-2">Fill Color</h3>
          <div className="grid grid-cols-8 gap-2">
            {["transparent", ...colors].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  setFillColor(c);
                  onClose();
                }}
                className={`w-8 h-8 rounded border-2 ${fillColor === c ? "border-gray-800" : "border-gray-300"}`}
                style={{
                  backgroundColor: c === "transparent" ? "#fff" : c,
                  backgroundImage:
                    c === "transparent"
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : "none",
                  backgroundSize: c === "transparent" ? "4px 4px" : "none",
                }}
              />
            ))}
          </div>
          <input
            type="color"
            value={fillColor === "transparent" ? "#ffffff" : fillColor}
            onChange={(e) => {
              setFillColor(e.target.value);
              onClose();
            }}
            className="mt-2 w-full h-8 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
