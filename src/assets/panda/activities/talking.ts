import type { ActivityConfig } from '@/components/panda/types';

export const talkingActivity: ActivityConfig = {
  id: 'talking',
  preferredEmotion: 'listening',
  defaultAnimation: 'talk',
  pose: 'default',
  armSet: 'talking',
  accessories: ['talking'],
  headLayout: { x: 6, y: 0, scale: 1, rotate: -4 },
};
