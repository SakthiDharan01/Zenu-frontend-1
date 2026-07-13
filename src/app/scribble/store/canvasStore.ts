import { create } from "zustand";

export interface DrawingElement {
  type: string;
  points: number[];
  color: string;
  strokeWidth: number;
  opacity?: number;
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  src?: string;
  stickerName?: string;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  id: string;
}

interface CanvasState {
  elements: DrawingElement[];
  history: DrawingElement[][];
  historyIndex: number;
  selectedElement: string | null;
  addElement: (el: DrawingElement) => void;
  updateLastElement: (points: number[]) => void;
  updateElement: (index: number, updates: Partial<DrawingElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setSelectedElement: (id: string | null) => void;
  saveToHistory: () => void;
  loadFromLocalStorage: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  history: [],
  historyIndex: -1,
  selectedElement: null,
  addElement: (el) =>
    set((state) => {
      const newElements = [...state.elements, el];
      get().saveToHistory();
      return { elements: newElements };
    }),
  updateLastElement: (points) =>
    set((state) => {
      const newElements = [...state.elements];
      if (newElements.length > 0) {
        newElements[newElements.length - 1].points = points;
      }
      return { elements: newElements };
    }),
  updateElement: (index, updates) =>
    set((state) => {
      const newElements = [...state.elements];
      if (newElements[index]) {
        newElements[index] = { ...newElements[index], ...updates };
      }
      return { elements: newElements };
    }),
  deleteElement: (id) =>
    set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      get().saveToHistory();
      return { elements: newElements, selectedElement: null };
    }),
  duplicateElement: (id) =>
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (element) {
        const duplicated = {
          ...element,
          id: `${element.id}-dup-${Date.now()}`,
          x: (element.x || 0) + 10,
          y: (element.y || 0) + 10,
        };
        const newElements = [...state.elements, duplicated];
        get().saveToHistory();
        return { elements: newElements };
      }
      return state;
    }),
  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElement: null,
        };
      }
      return state;
    }),
  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElement: null,
        };
      }
      return state;
    }),
  setSelectedElement: (id) => set({ selectedElement: id }),
  saveToHistory: () =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.elements]);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  loadFromLocalStorage: () =>
    set(() => {
      const saved = localStorage.getItem("scribble-pad");
      if (saved) {
        const elements = JSON.parse(saved);
        return { elements, history: [elements], historyIndex: 0 };
      }
      return {};
    }),
}));
