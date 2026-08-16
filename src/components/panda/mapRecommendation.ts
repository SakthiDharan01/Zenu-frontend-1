import type {
  PandaActivity,
  PandaAnimation,
  PandaEmotion,
  PandaPresentation,
} from '@/components/panda/types';

/** Existing module → route map (mirrors ZenRecommendation; do not change ranking). */
export const MODULE_ROUTES: Record<string, string> = {
  breathing: '/breathing',
  mindfulness: '/meditation',
  diary: '/journal',
  journal_gratitude: '/gratitude',
  doodle_dreams: '/art',
  bubble_canvas: '/bubbles',
  burst_it_out: '/burst',
  scribble_pad: '/scribble',
  chatbot_seviyan: '/chat',
  healing_garden: '/healing-garden',
  inner_compass: '/innercompass',
};

type MappedPanda = PandaPresentation & {
  defaultMessage: string;
  actionLabel: string;
  href: string;
  recommendationKey: string;
};

const MODULE_PRESENTATION: Record<
  string,
  { emotion: PandaEmotion; activity: PandaActivity | null; animation: PandaAnimation; message: string; action: string }
> = {
  breathing: {
    emotion: 'calm',
    activity: 'breathing',
    animation: 'breathe',
    message: 'Want to take three minutes to reset?',
    action: 'Start breathing',
  },
  mindfulness: {
    emotion: 'calm',
    activity: 'meditating',
    animation: 'breathe',
    message: 'A short meditation might help you settle.',
    action: 'Meditate',
  },
  diary: {
    emotion: 'thinking',
    activity: 'writing',
    animation: 'writing',
    message: 'Want to jot one quiet thought?',
    action: 'Open journal',
  },
  journal_gratitude: {
    emotion: 'happy',
    activity: 'writing',
    animation: 'bounce',
    message: 'One small gratitude can shift the day.',
    action: 'Write gratitude',
  },
  doodle_dreams: {
    emotion: 'happy',
    activity: 'drawing',
    animation: 'attentive',
    message: 'Feel like drawing something soft?',
    action: 'Open studio',
  },
  scribble_pad: {
    emotion: 'happy',
    activity: 'drawing',
    animation: 'attentive',
    message: 'Scribble it out — no rules.',
    action: 'Open scribble',
  },
  chatbot_seviyan: {
    emotion: 'listening',
    activity: 'talking',
    animation: 'talk',
    message: 'I’m here if you want to talk it through.',
    action: 'Talk to Seviyan',
  },
  bubble_canvas: {
    emotion: 'calm',
    activity: null,
    animation: 'idle',
    message: 'A few calm bubbles might help.',
    action: 'Pop bubbles',
  },
  burst_it_out: {
    emotion: 'happy',
    activity: null,
    animation: 'bounce',
    message: 'Need a quick release?',
    action: 'Burst it out',
  },
  healing_garden: {
    emotion: 'calm',
    activity: null,
    animation: 'breathe',
    message: 'Your garden could use a little care.',
    action: 'Visit garden',
  },
  inner_compass: {
    emotion: 'thinking',
    activity: null,
    animation: 'tilt',
    message: 'Want a gentle direction right now?',
    action: 'Open compass',
  },
};

/**
 * Maps a recommendation module_id into panda presentation + copy.
 * Does not call or alter the recommendation engine.
 */
export function mapRecommendationToPanda(moduleId: string): MappedPanda {
  const preset = MODULE_PRESENTATION[moduleId] ?? {
    emotion: 'neutral' as PandaEmotion,
    activity: null,
    animation: 'idle' as PandaAnimation,
    message: 'Want a small reset together?',
    action: 'Explore',
  };

  const href = MODULE_ROUTES[moduleId] ?? '/';

  return {
    emotion: preset.emotion,
    activity: preset.activity,
    animation: preset.animation,
    message: null,
    defaultMessage: preset.message,
    actionLabel: preset.action,
    href,
    recommendationKey: moduleId,
  };
}
