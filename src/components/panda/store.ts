"use client";

import { create } from 'zustand';
import type { PandaMessagePayload, PandaPresentation } from '@/components/panda/types';

export type ActivePandaPrompt = {
  id: string;
  presentation: PandaPresentation;
  message: PandaMessagePayload;
  visible: boolean;
  bubbleVisible: boolean;
};

type PandaStore = {
  prompt: ActivePandaPrompt | null;
  setPrompt: (prompt: ActivePandaPrompt | null) => void;
  setBubbleVisible: (visible: boolean) => void;
  hide: () => void;
};

export const usePandaStore = create<PandaStore>((set) => ({
  prompt: null,
  setPrompt: (prompt) => set({ prompt }),
  setBubbleVisible: (bubbleVisible) =>
    set((s) => (s.prompt ? { prompt: { ...s.prompt, bubbleVisible } } : s)),
  hide: () => set({ prompt: null }),
}));
