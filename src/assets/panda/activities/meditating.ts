import type { ActivityConfig } from '@/components/panda/types';

export const meditatingActivity: ActivityConfig = {
  id: 'meditating',
  preferredEmotion: 'calm',
  defaultAnimation: 'breathe',
  pose: 'default',
  armSet: 'meditating',
  accessories: ['meditating'],
  eyeModeOverride: 'closedPeaceful',
  bodyScale: 1.01,
  headLayout: { x: 0, y: 2, scale: 1, rotate: 0 },
};
