import { calmEmotion } from '@/assets/panda/emotions/calm';
import { happyEmotion } from '@/assets/panda/emotions/happy';
import { listeningEmotion } from '@/assets/panda/emotions/listening';
import { neutralEmotion } from '@/assets/panda/emotions/neutral';
import { sadEmotion } from '@/assets/panda/emotions/sad';
import { thinkingEmotion } from '@/assets/panda/emotions/thinking';
import type { EmotionConfig, PandaEmotion } from '@/components/panda/types';

export const V1_EMOTIONS = [
  'neutral',
  'happy',
  'calm',
  'sad',
  'thinking',
  'listening',
] as const satisfies readonly PandaEmotion[];

export const EMOTION_REGISTRY: Record<(typeof V1_EMOTIONS)[number], EmotionConfig> = {
  neutral: neutralEmotion,
  happy: happyEmotion,
  calm: calmEmotion,
  sad: sadEmotion,
  thinking: thinkingEmotion,
  listening: listeningEmotion,
};

export function getEmotionConfig(emotion: PandaEmotion): EmotionConfig {
  if (emotion in EMOTION_REGISTRY) {
    return EMOTION_REGISTRY[emotion as (typeof V1_EMOTIONS)[number]];
  }
  return neutralEmotion;
}
