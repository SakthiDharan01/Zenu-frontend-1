"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { useToolStore } from "../store/toolStore";

export default function BottomBar() {
  const { zoom, setZoom } = useToolStore();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  return (
    <div className="absolute bottom-4 inset-x-0 flex justify-center items-center px-8">
      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2">
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
