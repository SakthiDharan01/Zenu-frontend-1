export type PandaEmotion =
  | 'neutral'
  | 'happy'
  | 'calm'
  | 'sad'
  | 'thinking'
  | 'listening'
  | 'anxious'
  | 'curious'
  | 'excited'
  | 'tired'
  | 'surprised'
  | 'disappointed'
  | 'angry';

export type PandaActivity =
  | 'breathing'
  | 'meditating'
  | 'writing'
  | 'talking'
  | 'drawing'
  | 'listening'
  | 'gratitude'
  | 'release'
  | 'garden'
  | 'celebration'
  | 'sleeping'
  | 'waving';

export type PandaAnimation =
  | 'idle'
  | 'breathe'
  | 'bounce'
  | 'tilt'
  | 'attentive'
  | 'talk'
  | 'writing'
  | 'wave'
  | 'sleep';

export type PandaMode = 'ambient' | 'responsive' | 'proactive';

export type PandaEyeMode = 'open' | 'closedPeaceful' | 'closedHappy' | 'sad';

export type PandaPose = 'default' | 'writing';

export type PandaArmSet =
  | 'default'
  | 'meditating'
  | 'breathing'
  | 'writing'
  | 'drawing'
  | 'talking';

export type HeadLayout = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

export type PandaMessagePayload = {
  message: string;
  action?: string;
  secondaryAction?: string;
  href?: string;
  recommendationKey?: string;
  /** Session attribution for engagement; not shown in UI. */
  recommendationLogId?: string | null;
  context?: string;
};

export type PandaPresentation = {
  emotion: PandaEmotion;
  activity: PandaActivity | null;
  animation: PandaAnimation;
  message?: PandaMessagePayload | null;
};

export type EmotionConfig = {
  id: PandaEmotion;
  mouthPath: string;
  cheekOpacity: number;
  eyeMode: PandaEyeMode;
  headRotate: number;
  defaultAnimation: PandaAnimation;
};

export type ActivityConfig = {
  id: PandaActivity;
  preferredEmotion: PandaEmotion;
  defaultAnimation: PandaAnimation;
  pose?: PandaPose;
  armSet?: PandaArmSet;
  accessories?: string[];
  eyeModeOverride?: PandaEyeMode;
  bodyScale?: number;
  /** Repositions shared emotion head for activity pose */
  headLayout?: HeadLayout;
};

export type ComposedPandaVisual = {
  presentation: PandaPresentation;
  emotion: EmotionConfig;
  activity: ActivityConfig | null;
  eyeMode: PandaEyeMode;
  mouthPath: string;
  cheekOpacity: number;
  /** Final head rotation = activity layout rotate + emotion headRotate */
  headRotate: number;
  pose: PandaPose;
  armSet: PandaArmSet;
  accessories: string[];
  bodyScale: number;
  headLayout: HeadLayout;
};
