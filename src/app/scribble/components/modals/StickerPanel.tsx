"use client";

import { Cloud, Heart, Moon, Smile, Star, Sun, X, Zap } from "lucide-react";

interface StickerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: string) => void;
  onPlaceSticker: (stickerName: string) => void;
}

const stickers = [
  { icon: Smile, name: "smile" },
  { icon: Heart, name: "heart" },
  { icon: Star, name: "star" },
  { icon: Zap, name: "zap" },
  { icon: Sun, name: "sun" },
  { icon: Moon, name: "moon" },
  { icon: Cloud, name: "cloud" },
  { icon: Smile, name: "cute_face" },
  { icon: Heart, name: "love" },
  { icon: Star, name: "sparkle" },
];

export default function StickerPanel({
  isOpen,
  onClose,
  onSelectSticker,
  onPlaceSticker,
}: StickerPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-24 bg-white shadow-lg rounded-2xl p-3 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Stickers</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {stickers.map((sticker) => (
          <button
            type="button"
            key={sticker.name}
            onClick={() => {
              onSelectSticker(sticker.name);
              onPlaceSticker(sticker.name);
            }}
            className="text-2xl hover:bg-gray-100 rounded p-1"
            title={sticker.name}
          >
            <sticker.icon size={24} />
          </button>
        ))}
      </div>
    </div>
  );
}
