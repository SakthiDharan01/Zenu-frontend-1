/**
 * Local guided + ambient audio resolution.
 * DB `audio_url` is preferred when present; otherwise fall back to bundled public assets.
 * No schema change required.
 */

const GUIDED_BY_TITLE: Record<string, string> = {
  'Mindful Breathing': '/audio/meditation/mindful-breathing.wav',
  'Morning Gratitude': '/audio/meditation/morning-gratitude.wav',
  'Focus and Productivity': '/audio/meditation/focus-productivity.wav',
  'Stress & Anxiety Relief': '/audio/meditation/stress-relief.wav',
  'Deep Sleep Relaxation': '/audio/meditation/deep-sleep.wav',
  'Walking Meditation': '/audio/meditation/walking-meditation.wav',
};

/** Soft guided scripts for SpeechSynthesis when narration assets are placeholders */
export const GUIDED_SCRIPTS: Record<string, string> = {
  'Mindful Breathing':
    'Welcome. Find a comfortable seat. Soften your gaze or close your eyes. Breathe in gently through the nose, and out through the mouth. Notice the rise and fall of your chest. If thoughts arrive, greet them kindly and return to the breath. You are safe. You are here.',
  'Morning Gratitude':
    'Good morning. Take one slow breath. Bring to mind one thing you are grateful for today — a person, a place, or a small comfort. Hold that feeling for a few breaths. Let warmth spread through your body. Carry this quiet thanks into your day.',
  'Focus and Productivity':
    'Settle your attention on this moment. Inhale clarity. Exhale distraction. Choose one intention for the next stretch of work. Imagine a calm, steady focus like a quiet flame. Return to it whenever your mind wanders.',
  'Stress & Anxiety Relief':
    'Place a hand on your heart if you like. Breathe in for four counts. Hold for four. Out for six. Feel the ground beneath you. Name one sensation that feels steady. Soften your jaw and shoulders. Anxiety can visit, and you can stay present.',
  'Deep Sleep Relaxation':
    'Let the day dissolve. Unclench your hands. Soften your forehead. With each exhale, sink a little deeper into rest. There is nothing to solve now. Only rest. Only breath. Sleep can find you gently.',
  'Walking Meditation':
    'Stand tall and soft. Feel your feet. As you take a slow step, notice heel, then sole, then toes. Match a calm breath to your pace. The world can wait. Each step is enough.',
};

export function resolveGuidedAudioUrl(title: string, audioUrl?: string | null): string | null {
  if (audioUrl && audioUrl.trim()) return audioUrl.trim();
  return GUIDED_BY_TITLE[title] ?? null;
}

export function resolveGuidedScript(title: string): string | null {
  return GUIDED_SCRIPTS[title] ?? null;
}

export const AMBIENT_SOURCES = {
  fire: '/audio/fire.wav',
  rain: '/audio/rain.wav',
  forest: '/audio/forest.wav',
  ocean: '/audio/ocean.wav',
} as const;
