export type ModuleRecord = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  position: number | null;
};

export type DailyFocus = {
  title: string;
  durationSeconds: number;
  cta: string;
  description: string | null;
  moduleId: string | null;
};

export type HomeOverview = {
  modules: ModuleRecord[];
  dailyFocus: DailyFocus | null;
};

export type StreakData = {
  currentStreak: number;
  plantStage: 'seedling' | 'sapling' | 'tree';
  lastActivity: string | null;
};

export type PSSData = {
  scores: number[];
  last3WeeksHigh: boolean;
  averageScore: number;
  createdAt: string | null;
};

export type JournalEntry = {
  id: string;
  mood: string | null;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type BreathingPattern = {
  id: string;
  name: string;
  description: string | null;
  difficulty: string | null;
  steps: number[];
  defaultMinutes: number;
};

export type Meditation = {
  id: string;
  title: string;
  durationMinutes: number;
  category: string;
  imageUrl: string | null;
  audioUrl: string | null;
  description: string | null;
};

export type ConversationSummary = {
  id: string;
  title: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type GratitudeEntry = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
};

export type GratitudeFeedback = {
  entry: GratitudeEntry;
  thankfulnessScore: number;
  feedback: string;
};

export type GratitudeOverallReview = {
  entriesCount: number;
  review: string;
};
