"use client";

import { Grid3x3, Palette, Save, X } from "lucide-react";
import { useToolStore } from "../../store/toolStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { gridEnabled, toggleGrid, gridSize, setGridSize } = useToolStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Grid3x3 size={20} />
              <h3 className="font-medium">Grid Settings</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gridEnabled}
                  onChange={toggleGrid}
                  className="rounded"
                />
                Enable Grid
              </label>
              <div>
                <label htmlFor="grid-size" className="text-sm">
                  Grid Size: {gridSize}px
                </label>
                <input
                  id="grid-size"
                  type="range"
                  min="10"
                  max="50"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={20} />
              <h3 className="font-medium">Color Picker</h3>
            </div>
            <div className="space-y-2">
              <label htmlFor="color-picker" className="text-sm block">
                Select Color
              </label>
              <input
                id="color-picker"
                type="color"
                value={useToolStore.getState().color}
                onChange={(e) =>
                  useToolStore.getState().setColor(e.target.value)
                }
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Save size={20} />
              <h3 className="font-medium">Auto-save</h3>
            </div>
            <p className="text-sm text-gray-600">
              Auto-save is enabled (every 5 seconds)
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={20} />
              <h3 className="font-medium">Theme</h3>
            </div>
            <p className="text-sm text-gray-600">Light theme (default)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
