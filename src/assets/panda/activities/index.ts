import { breathingActivity } from '@/assets/panda/activities/breathing';
import { drawingActivity } from '@/assets/panda/activities/drawing';
import {
  celebrationActivity,
  gardenActivity,
  gratitudeActivity,
  listeningActivity,
  releaseActivity,
  sleepingActivity,
  wavingActivity,
} from '@/assets/panda/activities/extended';
import { meditatingActivity } from '@/assets/panda/activities/meditating';
import { talkingActivity } from '@/assets/panda/activities/talking';
import { writingActivity } from '@/assets/panda/activities/writing';
import type { ActivityConfig, PandaActivity } from '@/components/panda/types';

/** Playground / primary V1 activities */
export const V1_ACTIVITIES = [
  'breathing',
  'meditating',
  'writing',
  'talking',
  'drawing',
  'listening',
] as const satisfies readonly PandaActivity[];

/** Full activity registry including reference-sheet activities */
export const ACTIVITY_REGISTRY: Partial<Record<PandaActivity, ActivityConfig>> = {
  breathing: breathingActivity,
  meditating: meditatingActivity,
  writing: writingActivity,
  talking: talkingActivity,
  drawing: drawingActivity,
  listening: listeningActivity,
  gratitude: gratitudeActivity,
  release: releaseActivity,
  garden: gardenActivity,
  celebration: celebrationActivity,
  sleeping: sleepingActivity,
  waving: wavingActivity,
};

export function getActivityConfig(activity: PandaActivity | null): ActivityConfig | null {
  if (!activity) return null;
  return ACTIVITY_REGISTRY[activity] ?? null;
}
