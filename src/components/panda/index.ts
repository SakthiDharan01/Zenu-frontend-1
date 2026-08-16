export { Panda } from '@/components/panda/Panda';
export type { PandaProps } from '@/components/panda/Panda';
export { PandaMessage } from '@/components/panda/PandaMessage';
export { PandaNotification } from '@/components/panda/PandaNotification';
export { PandaBaseSvg } from '@/components/panda/PandaBaseSvg';
export {
  showPandaMessage,
  dismissPandaMessage,
  completePandaMessage,
  hidePandaMessage,
  resetPandaCooldown,
  canShowPandaPrompt,
} from '@/components/panda/controller';
export { mapRecommendationToPanda, MODULE_ROUTES } from '@/components/panda/mapRecommendation';
export {
  getPandaContextPresentation,
  shouldShowFloatingCompanion,
} from '@/components/panda/contextPresentation';
export { PandaCompanionHost } from '@/components/panda/PandaCompanionHost';
export { resolvePresentation } from '@/components/panda/resolvePresentation';
export { composePandaVisual } from '@/components/panda/compose';
export type {
  PandaEmotion,
  PandaActivity,
  PandaAnimation,
  PandaMode,
  PandaPresentation,
  PandaMessagePayload,
  PandaEyeMode,
  PandaPose,
  PandaArmSet,
  ComposedPandaVisual,
} from '@/components/panda/types';
export { V1_EMOTIONS } from '@/assets/panda/emotions';
export { V1_ACTIVITIES } from '@/assets/panda/activities';
