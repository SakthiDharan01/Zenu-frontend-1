import { getActivityConfig } from '@/assets/panda/activities';
import { getEmotionConfig } from '@/assets/panda/emotions';
import type {
  PandaActivity,
  PandaAnimation,
  PandaEmotion,
  PandaPresentation,
} from '@/components/panda/types';

const EMOTION_SET = new Set<string>([
  'neutral',
  'happy',
  'calm',
  'sad',
  'thinking',
  'listening',
  'anxious',
  'curious',
  'excited',
  'tired',
  'surprised',
  'disappointed',
  'angry',
]);

const ACTIVITY_SET = new Set<string>([
  'breathing',
  'meditating',
  'writing',
  'talking',
  'drawing',
  'listening',
  'gratitude',
  'release',
  'garden',
  'celebration',
  'sleeping',
  'waving',
]);

export type ResolvePandaInput = {
  /** Shorthand: emotion or activity name */
  state?: string;
  emotion?: PandaEmotion;
  activity?: PandaActivity | null;
  animation?: PandaAnimation;
};

/**
 * Builds a full PandaPresentation from explicit props and/or shorthand `state`.
 */
export function resolvePresentation(input: ResolvePandaInput): PandaPresentation {
  let emotion: PandaEmotion = input.emotion ?? 'neutral';
  let activity: PandaActivity | null =
    input.activity === undefined ? null : input.activity;

  if (input.state) {
    const key = input.state.toLowerCase();
    if (EMOTION_SET.has(key) && input.emotion === undefined) {
      emotion = key as PandaEmotion;
    } else if (ACTIVITY_SET.has(key) && input.activity === undefined) {
      activity = key as PandaActivity;
    }
  }

  const activityConfig = getActivityConfig(activity);
  if (activityConfig && input.emotion === undefined && !input.state) {
    emotion = activityConfig.preferredEmotion;
  }
  // Shorthand activity-only: prefer activity's emotion when state was an activity
  if (
    input.state &&
    ACTIVITY_SET.has(input.state.toLowerCase()) &&
    input.emotion === undefined
  ) {
    emotion = activityConfig?.preferredEmotion ?? emotion;
  }

  const emotionConfig = getEmotionConfig(emotion);
  const animation: PandaAnimation =
    input.animation ??
    activityConfig?.defaultAnimation ??
    emotionConfig.defaultAnimation;

  return {
    emotion,
    activity,
    animation,
    message: null,
  };
}
