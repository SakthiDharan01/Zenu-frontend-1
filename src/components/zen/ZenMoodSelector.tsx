"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { logMood } from '@/lib/signals';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const MOODS = [
  { score: 1, label: 'Low' },
  { score: 2, label: 'Okay' },
  { score: 3, label: 'Calm' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Great' },
] as const;

export interface ZenMoodSelectorProps {
  className?: string;
  onSelect?: (score: number) => void;
  /** Compact chip row for header contexts */
  compact?: boolean;
}

/**
 * Interactive mood check-in. Logs via signals.logMood (fire-and-forget).
 * Apple Design §1 — feedback on pointer-down via active scale.
 */
export function ZenMoodSelector({ className, onSelect, compact = false }: ZenMoodSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const handleSelect = (score: number) => {
    setSelected(score);
    setSaved(true);
    void logMood(score);
    onSelect?.(score);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {!compact && (
        <p className="zen-caption text-zen-fg-muted">
          {saved ? 'Thanks for checking in' : 'How are you feeling?'}
        </p>
      )}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Mood selector"
      >
        {MOODS.map((mood) => {
          const isActive = selected === mood.score;
          return (
            <motion.button
              key={mood.score}
              type="button"
              aria-label={`Mood: ${mood.label}`}
              aria-pressed={isActive}
              onClick={() => handleSelect(mood.score)}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-zen-full border',
                'min-h-11 px-3 py-2 text-sm font-medium zen-touch',
                'transition-colors duration-zen-fast ease-zen-out',
                'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
                isActive
                  ? 'bg-zen-primary-soft border-zen-primary/30 text-zen-primary shadow-zen-subtle'
                  : 'bg-white/80 border-zen-border-soft text-zen-fg-muted hover:border-zen-border hover:text-zen-fg',
              )}
            >
              <span>{mood.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
