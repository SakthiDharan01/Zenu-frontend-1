import type { Transition } from 'framer-motion';
import type { PandaAnimation } from '@/components/panda/types';

/** Apple-style critically damped defaults — calm, interruptible. */
export const PANDA_SPRING: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.4,
};

export const PANDA_SOFT_SPRING: Transition = {
  type: 'spring',
  bounce: 0.12,
  duration: 0.45,
};

export type ShellMotion = {
  y?: number | number[];
  scale?: number | number[];
  rotate?: number | number[];
  transition?: Transition;
};

export const SHELL_ANIMATIONS: Record<PandaAnimation, ShellMotion> = {
  idle: {
    y: [0, -2.5, 0],
    transition: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
  },
  breathe: {
    scale: [1, 1.018, 1],
    y: [0, -1.5, 0],
    transition: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
  },
  bounce: {
    y: [0, -5, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 1.25, repeat: Infinity, ease: 'easeInOut' },
  },
  tilt: {
    rotate: [0, 2.5, -1.5, 0],
    transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
  },
  attentive: {
    y: [0, -1.5, 0],
    scale: [1, 1.01, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  talk: {
    scale: [1, 1.008, 1],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
  // Shell stays nearly still — pen/paw motion is CSS on SVG groups
  writing: {
    y: 0,
    scale: 1,
    rotate: 0,
  },
  wave: {
    rotate: [0, 2, 0, -1, 0],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
  sleep: {
    y: [0, -1.2, 0],
    scale: [1, 1.008, 1],
    transition: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' },
  },
};
