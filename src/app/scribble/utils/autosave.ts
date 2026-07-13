import { useEffect } from "react";
import { useCanvasStore } from "../store/canvasStore";

export function useAutosave() {
  const elements = useCanvasStore((state) => state.elements);
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("scribble-pad", JSON.stringify(elements));
    }, 5000);
    return () => clearInterval(interval);
  }, [elements]);
}
