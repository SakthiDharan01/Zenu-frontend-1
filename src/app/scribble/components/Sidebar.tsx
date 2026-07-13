"use client";

import { motion } from "framer-motion";
import {
  Download,
  Eraser,
  Shapes,
  Sticker,
  Sun,
} from "lucide-react";
import { useToolStore } from "../store/toolStore";

const icons = [
  { icon: Shapes, label: "Tools", action: "tools" },
  { icon: Eraser, label: "Eraser", action: "eraser" },
  { icon: Sticker, label: "Stickers", action: "stickers" },
  { icon: Sun, label: "Toggle Theme", action: "toggle-theme" },
  { icon: Download, label: "Save", action: "save" },
];

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Sidebar() {
  const {
    toggleToolPalette,
    setShowStickerPanel,
    setTool,
    toggleDarkMode,
    darkMode,
  } = useToolStore();

  const handleClick = (action: string) => {
    switch (action) {
      case "tools":
        toggleToolPalette();
        break;
      case "eraser":
        setTool("Erase");
        break;
      case "stickers":
        setShowStickerPanel(true);
        break;
      case "toggle-theme":
        toggleDarkMode();
        break;
      case "save": {
        // Handle save functionality - export canvas as PNG
        const canvas = document.querySelector("canvas");
        if (canvas) {
          const link = document.createElement("a");
          link.download = "scribble-pad.png";
          link.href = canvas.toDataURL();
          link.click();
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <aside
      className={`flex flex-col items-center py-6 w-20 shadow-lg rounded-r-2xl border border-gray-200 shrink-0 z-50 overflow-visible ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
    >
      <Link href="/" className="mb-6 p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Back to Dashboard">
        <ArrowLeft size={24} className={darkMode ? "text-gray-300" : "text-gray-700"} />
      </Link>
      <div className="w-10 h-px bg-gray-200 mb-6"></div>
      {icons.map((item) => (
        <motion.div
          key={item.action}
          whileHover={{
            scale: 1.1,
            backgroundColor: darkMode ? "#374151" : "#f3f4f6",
          }}
          whileTap={{ scale: 0.95 }}
          className="group flex flex-col items-center mb-6 cursor-pointer p-3 rounded-xl transition-all duration-200 hover:shadow-md"
          onClick={() => handleClick(item.action)}
        >
          <item.icon
            size={24}
            className={
              darkMode
                ? "text-gray-300 group-hover:text-white"
                : "text-gray-700 group-hover:text-gray-900"
            }
          />
        </motion.div>
      ))}
    </aside>
  );
}
