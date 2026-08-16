import type { EmotionConfig } from '@/components/panda/types';

/** Open expressive eyes + wide smile — NOT closed arcs. */
export const happyEmotion: EmotionConfig = {
  id: 'happy',
  mouthPath: 'M 86 114 Q 100 132 114 114',
  cheekOpacity: 0.98,
  eyeMode: 'open',
  headRotate: 0,
  defaultAnimation: 'bounce',
};
