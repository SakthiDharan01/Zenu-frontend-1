import { useEffect } from "react";
import { useCanvasStore } from "../store/canvasStore";

export function useShortcuts(setTool: (tool: string) => void) {
  const { undo, redo } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            undo();
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
      } else {
        switch (e.key) {
          case "v":
            setTool("Select");
            break;
          case "p":
            setTool("Draw");
            break;
          case "e":
            setTool("Erase");
            break;
          case "r":
            setTool("Rectangle");
            break;
          case "c":
            setTool("Circle");
            break;
          case "t":
            setTool("Text");
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setTool, undo, redo]);
}
