"use client";

import { Panda } from '@/components/panda/Panda';
import type {
  PandaActivity,
  PandaAnimation,
  PandaEmotion,
} from '@/components/panda/types';
import { cn } from '@/lib/utils';

/**
 * Legacy PandaAvatar states — mapped onto the production Panda presentation system.
 * Visual source of truth is panda-base.svg via <Panda />; this file is a compatibility shim only.
 */
export type PandaState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'breathing'
  | 'reflecting'
  | 'gratitude'
  | 'celebrating'
  | 'resting';

export interface PandaAvatarProps {
  state?: PandaState;
  /** Size in pixels — affects the container, SVG fills it */
  size?: number;
  className?: string;
  /** Aria label for screen readers */
  label?: string;
}

const LEGACY_TO_PRESENTATION: Record<
  PandaState,
  {
    emotion: PandaEmotion;
    activity: PandaActivity | null;
    animation: PandaAnimation;
  }
> = {
  idle: { emotion: 'neutral', activity: null, animation: 'idle' },
  listening: { emotion: 'listening', activity: 'listening', animation: 'attentive' },
  thinking: { emotion: 'thinking', activity: null, animation: 'tilt' },
  breathing: { emotion: 'calm', activity: 'breathing', animation: 'breathe' },
  reflecting: { emotion: 'calm', activity: 'writing', animation: 'idle' },
  gratitude: { emotion: 'happy', activity: 'gratitude', animation: 'bounce' },
  celebrating: { emotion: 'happy', activity: 'celebration', animation: 'bounce' },
  resting: { emotion: 'calm', activity: 'sleeping', animation: 'sleep' },
};

export default function PandaAvatar({
  state = 'idle',
  size = 80,
  className,
  label,
}: PandaAvatarProps) {
  const presentation = LEGACY_TO_PRESENTATION[state];

  return (
    <Panda
      className={cn(className)}
      emotion={presentation.emotion}
      activity={presentation.activity}
      animation={presentation.animation}
      mode="responsive"
      size={size}
      animated
      label={label ?? `Panda companion — ${state}`}
    />
  );
}
