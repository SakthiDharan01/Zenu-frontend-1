"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/* ─────────────────────────────────────────────────────────────
   Panda state type
   ───────────────────────────────────────────────────────────── */
export type PandaState =
  | 'idle'        // neutral sitting — default
  | 'listening'   // leaning forward, attentive — user typing
  | 'thinking'    // paw on chin — AI processing
  | 'breathing'   // belly expanding — synced to breathing circle
  | 'reflecting'  // eyes soft-closed — journal / inner compass
  | 'gratitude'   // arms open, warm — gratitude moment
  | 'celebrating' // arms up — streak milestone
  | 'resting';    // eyes fully closed — empty states

/* ─────────────────────────────────────────────────────────────
   SVG Panda illustrations — one per state
   Each is a self-contained SVG at 80×80 viewBox.
   ───────────────────────────────────────────────────────────── */

const PandaIdle = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Ears */}
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    {/* Head */}
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    {/* Eye patches */}
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes */}
    <circle cx="29" cy="32" r="3.5" fill="white" />
    <circle cx="53" cy="32" r="3.5" fill="white" />
    <circle cx="30" cy="32" r="2" fill="#1a1a2e" />
    <circle cx="54" cy="32" r="2" fill="#1a1a2e" />
    {/* Eye shine */}
    <circle cx="31" cy="31" r="0.8" fill="white" />
    <circle cx="55" cy="31" r="0.8" fill="white" />
    {/* Nose */}
    <ellipse cx="40" cy="41" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Mouth — gentle smile */}
    <path d="M36 44 Q40 48 44 44" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Body */}
    <ellipse cx="40" cy="65" rx="18" ry="14" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    {/* Belly patch */}
    <ellipse cx="40" cy="66" rx="10" ry="8" fill="#f0f0f8" />
    {/* Arms */}
    <ellipse cx="22" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-15 22 62)" />
    <ellipse cx="58" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(15 58 62)" />
  </svg>
);

const PandaListening = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Ears */}
    <ellipse cx="18" cy="20" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="20" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="20" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="20" rx="5" ry="5" fill="#3a3a5c" />
    {/* Head — leaned slightly forward (translate down) */}
    <ellipse cx="40" cy="36" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    {/* Eye patches — wider / more attentive */}
    <ellipse cx="28" cy="33" rx="9" ry="8.5" fill="#1a1a2e" />
    <ellipse cx="52" cy="33" rx="9" ry="8.5" fill="#1a1a2e" />
    {/* Eyes — wider */}
    <circle cx="29" cy="33" r="4" fill="white" />
    <circle cx="53" cy="33" r="4" fill="white" />
    <circle cx="30" cy="33" r="2.5" fill="#1a1a2e" />
    <circle cx="54" cy="33" r="2.5" fill="#1a1a2e" />
    <circle cx="31" cy="32" r="1" fill="white" />
    <circle cx="55" cy="32" r="1" fill="white" />
    {/* Nose */}
    <ellipse cx="40" cy="42" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Smile — bigger */}
    <path d="M35 45 Q40 50 45 45" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Body */}
    <ellipse cx="40" cy="66" rx="18" ry="13" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="40" cy="67" rx="10" ry="8" fill="#f0f0f8" />
    <ellipse cx="22" cy="63" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-10 22 63)" />
    <ellipse cx="58" cy="63" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(10 58 63)" />
  </svg>
);

const PandaThinking = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — looking up-right (thinking) */}
    <circle cx="30" cy="30" r="3.5" fill="white" />
    <circle cx="54" cy="30" r="3.5" fill="white" />
    <circle cx="31" cy="29" r="2" fill="#1a1a2e" />
    <circle cx="55" cy="29" r="2" fill="#1a1a2e" />
    <circle cx="32" cy="28.5" r="0.8" fill="white" />
    <circle cx="56" cy="28.5" r="0.8" fill="white" />
    {/* Nose */}
    <ellipse cx="40" cy="41" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Mouth — neutral / pondering */}
    <path d="M37 44 Q40 46 43 44" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Thought bubbles */}
    <circle cx="52" cy="16" r="2" fill="#d4d4f0" opacity="0.7" />
    <circle cx="58" cy="11" r="2.8" fill="#d4d4f0" opacity="0.6" />
    <circle cx="65" cy="6" r="3.5" fill="#d4d4f0" opacity="0.5" />
    {/* Body */}
    <ellipse cx="40" cy="65" rx="18" ry="14" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="40" cy="66" rx="10" ry="8" fill="#f0f0f8" />
    {/* Right arm raised to chin */}
    <ellipse cx="58" cy="57" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-40 58 57)" />
    <ellipse cx="22" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-15 22 62)" />
  </svg>
);

const PandaBreathing = () => (
  <motion.svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — half-closed, peaceful */}
    <path d="M26 33 Q30 30 34 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M50 33 Q54 30 58 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="41" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Serene smile */}
    <path d="M36 44 Q40 49 44 44" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Body — animated belly */}
    <motion.ellipse
      cx="40"
      cy="65"
      rx="18"
      ry="14"
      fill="white"
      stroke="#e8e8f0"
      strokeWidth="1"
      animate={{ ry: [14, 16, 14], cy: [65, 64, 65] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.ellipse
      cx="40"
      cy="66"
      rx="10"
      ry="8"
      fill="#e8f4ff"
      animate={{ ry: [8, 10, 8], cy: [66, 65, 66] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <ellipse cx="22" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-15 22 62)" />
    <ellipse cx="58" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(15 58 62)" />
  </motion.svg>
);

const PandaReflecting = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — softly closed, crescent shape */}
    <path d="M24 33 Q28 28.5 32 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M48 33 Q52 28.5 56 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="41" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Gentle close-mouthed smile */}
    <path d="M37 44 Q40 47 43 44" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Stars / sparkles for reflection */}
    <text x="62" y="20" fontSize="7" fill="#a78bfa" opacity="0.8">✦</text>
    <text x="8" y="26" fontSize="5" fill="#a78bfa" opacity="0.6">✦</text>
    <ellipse cx="40" cy="65" rx="18" ry="14" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="40" cy="66" rx="10" ry="8" fill="#f5f0ff" />
    <ellipse cx="22" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-15 22 62)" />
    <ellipse cx="58" cy="62" rx="6" ry="10" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(15 58 62)" />
  </svg>
);

const PandaGratitude = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#ffe0e8" strokeWidth="1.5" />
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — happy crescents */}
    <path d="M24 34 Q28 29 32 34" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M48 34 Q52 29 56 34" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="41" rx="4" ry="3" fill="#ff9eb5" />
    {/* Big warm smile */}
    <path d="M33 45 Q40 52 47 45" stroke="#c0708c" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Rosy cheeks */}
    <ellipse cx="23" cy="40" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
    <ellipse cx="57" cy="40" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
    {/* Heart */}
    <text x="35" y="15" fontSize="10" fill="#ff6b8a">♥</text>
    {/* Body — arms open */}
    <ellipse cx="40" cy="65" rx="18" ry="13" fill="white" stroke="#ffe0e8" strokeWidth="1.5" />
    <ellipse cx="40" cy="66" rx="10" ry="8" fill="#fff0f3" />
    {/* Arms open wide */}
    <ellipse cx="18" cy="58" rx="6" ry="10" fill="white" stroke="#ffe0e8" strokeWidth="1.5" transform="rotate(40 18 58)" />
    <ellipse cx="62" cy="58" rx="6" ry="10" fill="white" stroke="#ffe0e8" strokeWidth="1.5" transform="rotate(-40 62 58)" />
  </svg>
);

const PandaCelebrating = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="35" rx="24" ry="22" fill="white" stroke="#ffd700" strokeWidth="1.5" />
    <ellipse cx="28" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="32" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — super happy crescents */}
    <path d="M23 34 Q28 28 33 34" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M47 34 Q52 28 57 34" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Open mouth smile */}
    <path d="M32 44 Q40 54 48 44" stroke="#c07090" strokeWidth="2" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="48" rx="5" ry="2.5" fill="#ff9eb5" opacity="0.5" />
    <ellipse cx="23" cy="40" rx="5" ry="3" fill="#ffb3c6" opacity="0.6" />
    <ellipse cx="57" cy="40" rx="5" ry="3" fill="#ffb3c6" opacity="0.6" />
    {/* Party sparkles */}
    <text x="3" y="18" fontSize="9" fill="#fbbf24">✨</text>
    <text x="60" y="14" fontSize="9" fill="#fbbf24">✨</text>
    <text x="32" y="8" fontSize="8" fill="#f97316">🎉</text>
    {/* Body */}
    <ellipse cx="40" cy="65" rx="18" ry="13" fill="white" stroke="#ffd700" strokeWidth="1.5" />
    <ellipse cx="40" cy="66" rx="10" ry="8" fill="#fffbeb" />
    {/* Arms raised */}
    <ellipse cx="15" cy="52" rx="6" ry="10" fill="white" stroke="#ffd700" strokeWidth="1.5" transform="rotate(70 15 52)" />
    <ellipse cx="65" cy="52" rx="6" ry="10" fill="white" stroke="#ffd700" strokeWidth="1.5" transform="rotate(-70 65 52)" />
  </svg>
);

const PandaResting = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="18" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="62" cy="22" rx="9" ry="9" fill="#1a1a2e" />
    <ellipse cx="18" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="62" cy="22" rx="5" ry="5" fill="#3a3a5c" />
    <ellipse cx="40" cy="36" rx="24" ry="22" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="28" cy="33" rx="8" ry="8" fill="#1a1a2e" />
    <ellipse cx="52" cy="33" rx="8" ry="8" fill="#1a1a2e" />
    {/* Eyes — fully closed lines */}
    <line x1="24" y1="33" x2="32" y2="33" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <line x1="48" y1="33" x2="56" y2="33" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="40" cy="42" rx="4" ry="2.5" fill="#ffb3c1" />
    {/* Peaceful small smile */}
    <path d="M38 45 Q40 47 42 45" stroke="#c0a0a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Zzz */}
    <text x="55" y="14" fontSize="12" fill="#c4b5fd" opacity="0.7">z</text>
    <text x="62" y="9" fontSize="9" fill="#c4b5fd" opacity="0.5">z</text>
    {/* Body */}
    <ellipse cx="40" cy="66" rx="18" ry="13" fill="white" stroke="#e8e8f0" strokeWidth="1" />
    <ellipse cx="40" cy="67" rx="10" ry="8" fill="#f5f0ff" />
    {/* Arms folded / resting */}
    <ellipse cx="22" cy="64" rx="6" ry="9" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(-5 22 64)" />
    <ellipse cx="58" cy="64" rx="6" ry="9" fill="white" stroke="#e8e8f0" strokeWidth="1" transform="rotate(5 58 64)" />
  </svg>
);

const PANDA_SVGS: Record<PandaState, React.FC> = {
  idle:        PandaIdle,
  listening:   PandaListening,
  thinking:    PandaThinking,
  breathing:   PandaBreathing,
  reflecting:  PandaReflecting,
  gratitude:   PandaGratitude,
  celebrating: PandaCelebrating,
  resting:     PandaResting,
};

/* ─────────────────────────────────────────────────────────────
   PandaAvatar — main component
   ───────────────────────────────────────────────────────────── */
export interface PandaAvatarProps {
  state?: PandaState;
  /** Size in pixels — affects the container, SVG fills it */
  size?: number;
  className?: string;
  /** Aria label for screen readers */
  label?: string;
}

const STATE_MOTION: Record<PandaState, object> = {
  idle:        {},
  listening:   { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  thinking:    { rotate: [0, 2, -2, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  breathing:   { scale: [1, 1.04, 1], transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } },
  reflecting:  { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  gratitude:   { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  celebrating: { y: [0, -8, 0], scale: [1, 1.05, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' } },
  resting:     { y: [0, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
};

const spring = { type: 'spring' as const, stiffness: 260, damping: 28 };
const fadeOnly = { duration: 0.2, ease: 'easeOut' as const };

export default function PandaAvatar({ state = 'idle', size = 80, className, label }: PandaAvatarProps) {
  const PandaSVG = PANDA_SVGS[state];
  const motionProps = STATE_MOTION[state];
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn('relative flex items-center justify-center flex-shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Panda companion — ${state}`}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/8 blur-md"
        style={{ width: size * 0.7, height: size * 0.15 }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, ...(reducedMotion ? {} : { scale: 0.9 }) }}
          animate={{
            opacity: 1,
            ...(reducedMotion ? {} : { scale: 1, ...motionProps }),
          }}
          exit={{ opacity: 0, ...(reducedMotion ? {} : { scale: 0.92 }) }}
          transition={reducedMotion ? fadeOnly : spring}
          style={{ width: size, height: size }}
          className="relative z-10 zen-fade"
        >
          <PandaSVG />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
