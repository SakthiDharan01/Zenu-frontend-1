import { getActivityConfig } from '@/assets/panda/activities';
import { getEmotionConfig } from '@/assets/panda/emotions';
import { resolvePresentation, type ResolvePandaInput } from '@/components/panda/resolvePresentation';
import type { ComposedPandaVisual, HeadLayout } from '@/components/panda/types';

const DEFAULT_HEAD: HeadLayout = { x: 0, y: 0, scale: 1, rotate: 0 };

/**
 * Emotion owns face. Activity owns pose/arms/props/head placement.
 * Animation never mutates either.
 */
export function composePandaVisual(input: ResolvePandaInput): ComposedPandaVisual {
  const presentation = resolvePresentation(input);
  const emotion = getEmotionConfig(presentation.emotion);
  const activity = getActivityConfig(presentation.activity);
  const headLayout = activity?.headLayout ?? DEFAULT_HEAD;

  return {
    presentation,
    emotion,
    activity,
    eyeMode: activity?.eyeModeOverride ?? emotion.eyeMode,
    mouthPath: emotion.mouthPath,
    cheekOpacity: emotion.cheekOpacity,
    headRotate: headLayout.rotate + emotion.headRotate,
    pose: activity?.pose ?? 'default',
    armSet: activity?.armSet ?? 'default',
    accessories: activity?.accessories ?? [],
    bodyScale: activity?.bodyScale ?? 1,
    headLayout,
  };
}
