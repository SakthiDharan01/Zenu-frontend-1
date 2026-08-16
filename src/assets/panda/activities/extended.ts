import type { ActivityConfig } from '@/components/panda/types';

export const listeningActivity: ActivityConfig = {
  id: 'listening',
  preferredEmotion: 'listening',
  defaultAnimation: 'attentive',
  pose: 'default',
  armSet: 'default',
  accessories: ['listening'],
  headLayout: { x: 0, y: 0, scale: 1, rotate: -5 },
};

export const gratitudeActivity: ActivityConfig = {
  id: 'gratitude',
  preferredEmotion: 'happy',
  defaultAnimation: 'bounce',
  pose: 'default',
  accessories: ['gratitude'],
};

export const releaseActivity: ActivityConfig = {
  id: 'release',
  preferredEmotion: 'happy',
  defaultAnimation: 'bounce',
  pose: 'default',
  accessories: ['release'],
};

export const gardenActivity: ActivityConfig = {
  id: 'garden',
  preferredEmotion: 'calm',
  defaultAnimation: 'breathe',
  pose: 'default',
  accessories: ['garden'],
};

export const celebrationActivity: ActivityConfig = {
  id: 'celebration',
  preferredEmotion: 'happy',
  defaultAnimation: 'bounce',
  pose: 'default',
  accessories: ['celebration'],
};

export const sleepingActivity: ActivityConfig = {
  id: 'sleeping',
  preferredEmotion: 'calm',
  defaultAnimation: 'sleep',
  pose: 'default',
  accessories: ['sleeping'],
  eyeModeOverride: 'closedPeaceful',
};

export const wavingActivity: ActivityConfig = {
  id: 'waving',
  preferredEmotion: 'happy',
  defaultAnimation: 'wave',
  pose: 'default',
  armSet: 'default',
  accessories: ['waving'],
};
