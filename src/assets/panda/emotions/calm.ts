import type { EmotionConfig } from '@/components/panda/types';

/** Open relaxed eyes + soft smile — NOT meditation closed eyes. */
export const calmEmotion: EmotionConfig = {
  id: 'calm',
  mouthPath: 'M 93 119 Q 100 123 107 119',
  cheekOpacity: 0.72,
  eyeMode: 'open',
  headRotate: 0,
  defaultAnimation: 'breathe',
};
