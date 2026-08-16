import type { ActivityConfig } from '@/components/panda/types';

export const writingActivity: ActivityConfig = {
  id: 'writing',
  preferredEmotion: 'thinking',
  defaultAnimation: 'writing',
  pose: 'writing',
  armSet: 'writing',
  accessories: ['writing'],
  // Shared emotion head lowered/rotated toward the journal (prone pose)
  headLayout: { x: -6, y: 36, scale: 0.76, rotate: -16 },
};
