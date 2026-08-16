"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PANDA_SPRING, SHELL_ANIMATIONS } from '@/components/panda/animations';
import { composePandaVisual } from '@/components/panda/compose';
import { PandaBaseSvg } from '@/components/panda/PandaBaseSvg';
import type {
  PandaActivity,
  PandaAnimation,
  PandaEmotion,
  PandaMode,
} from '@/components/panda/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import './panda.css';

export type PandaProps = {
  state?: string;
  emotion?: PandaEmotion;
  activity?: PandaActivity | null;
  animation?: PandaAnimation;
  mode?: PandaMode;
  size?: number;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  label?: string;
};

/**
 * Activity-local animations (writing paw/pen) are CSS-driven on SVG groups.
 * Whole-shell motion stays subtle and never rewrites emotion.
 */
export function Panda({
  state,
  emotion,
  activity,
  animation,
  mode = 'responsive',
  size = 120,
  className,
  animated = true,
  interactive = false,
  label,
}: PandaProps) {
  const reduced = usePrefersReducedMotion();

  const visual = useMemo(
    () => composePandaVisual({ state, emotion, activity, animation }),
    [state, emotion, activity, animation],
  );

  const { presentation } = visual;
  const anim = presentation.animation;
  const localActivityMotion =
    anim === 'writing' || anim === 'talk' || (presentation.activity === 'drawing' && anim === 'attentive');

  const shell = SHELL_ANIMATIONS[anim] ?? SHELL_ANIMATIONS.idle;
  const shouldAnimate = animated && !reduced && mode !== 'ambient';

  // Writing / drawing / talk: keep shell still; motion lives on SVG groups via CSS
  const loopMotion = !shouldAnimate
    ? { y: 0, scale: 1, rotate: 0 }
    : anim === 'writing'
      ? { y: 0, scale: 1, rotate: 0 }
      : localActivityMotion
        ? {
            y: [0, -1, 0],
            scale: 1,
            rotate: 0,
            transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
          }
        : shell;

  return (
    <div
      className={cn('zenu-panda', className)}
      style={{ width: size, height: size }}
      data-mode={mode}
      data-emotion={presentation.emotion}
      data-activity={presentation.activity ?? 'none'}
      data-animation={anim}
      data-pose={visual.pose}
      data-eye={visual.eyeMode}
      data-local-motion={localActivityMotion && shouldAnimate ? 'true' : 'false'}
      data-interactive={interactive ? 'true' : 'false'}
      role="img"
      aria-label={label ?? `ZenU panda — ${presentation.emotion}`}
    >
      <div className="zenu-panda__shadow" aria-hidden="true" />
      <motion.div
        className="zenu-panda__stage"
        initial={false}
        animate={
          reduced
            ? { y: 0, scale: 1, rotate: 0 }
            : {
                y: loopMotion.y ?? 0,
                scale: loopMotion.scale ?? 1,
                rotate: loopMotion.rotate ?? 0,
              }
        }
        transition={
          reduced
            ? { duration: 0.2 }
            : loopMotion.transition ?? PANDA_SPRING
        }
        whileTap={interactive && !reduced ? { scale: 0.97 } : undefined}
      >
        <PandaBaseSvg title={label ?? 'ZenU Panda'} visual={visual} />
      </motion.div>
    </div>
  );
}

export default Panda;
