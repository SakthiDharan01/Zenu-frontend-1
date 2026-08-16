import type { ActivityConfig } from '@/components/panda/types';

export const drawingActivity: ActivityConfig = {
  id: 'drawing',
  preferredEmotion: 'happy',
  defaultAnimation: 'attentive',
  pose: 'default',
  armSet: 'drawing',
  accessories: ['drawing'],
  headLayout: { x: 6, y: 2, scale: 0.97, rotate: 5 },
};
