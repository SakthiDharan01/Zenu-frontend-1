'use client';

import { motion } from 'framer-motion';
import { ZenButton } from '@/components/zen';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function BurstComposer({
  value,
  onChange,
  onRelease,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  onRelease: () => void;
  disabled?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="w-full max-w-xl"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={
        reducedMotion
          ? { duration: 0.15 }
          : { type: 'spring', bounce: 0, duration: 0.4 }
      }
    >
      <div
        className={cn(
          'rounded-[22px] border border-white/20 bg-white/[0.1] p-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.55)]',
          'backdrop-blur-md focus-within:border-violet-300/45 focus-within:ring-2 focus-within:ring-violet-400/20',
        )}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What’s weighing on you? Pour it out…"
          rows={4}
          maxLength={300}
          disabled={disabled}
          aria-label="Thought to release"
          className={cn(
            'w-full resize-none bg-transparent px-2 py-2',
            'font-ui text-[1rem] leading-relaxed text-white placeholder:text-violet-200/50',
            'outline-none disabled:opacity-50 md:text-[1.0625rem]',
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <span className="font-ui text-xs text-violet-200/70">{value.length}/300</span>
          <ZenButton
            type="button"
            variant="primary"
            size="md"
            onClick={onRelease}
            disabled={disabled || !value.trim()}
            className="rounded-full px-5"
          >
            Release it
          </ZenButton>
        </div>
      </div>
    </motion.div>
  );
}
