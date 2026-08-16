import { resolveRecommendationLogId } from '@/lib/recommendationAttribution';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export type EventType = 'opened' | 'started' | 'completed' | 'skipped' | 'abandoned';

export async function trackEngagement(
  moduleId: string,
  eventType: EventType,
  durationSec?: number,
  /** Explicit override; omit to use session recommendation attribution when present. */
  recommendationLogId?: string | null,
): Promise<void> {
  try {
    const resolvedLogId =
      recommendationLogId !== undefined
        ? recommendationLogId
        : resolveRecommendationLogId();

    await fetch(`${API}/api/signals/engagement`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module_id:    moduleId,
        event_type:   eventType,
        duration_sec: durationSec,
        ...(resolvedLogId ? { recommendation_log_id: resolvedLogId } : {}),
      }),
    });
  } catch (e) {
    // Fire-and-forget — never block the UI for analytics
    console.warn('Signal tracking failed silently:', e);
  }
}

export async function logMood(moodScore: number, note?: string): Promise<void> {
  try {
    await fetch(`${API}/api/signals/mood`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_score: moodScore, note }),
    });
  } catch (e) {
    console.warn('Mood log failed silently:', e);
  }
}

export async function logPSS(rawScore: number): Promise<void> {
  try {
    await fetch(`${API}/api/signals/pss`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_score: rawScore }),
    });
  } catch (e) {
    console.warn('PSS log failed silently:', e);
  }
}

export type RecommendationTodayResponse = {
  log_id?: string | null;
  recommendations: Array<{
    module_id: string;
    name: string;
    rank_score: number;
    duration_min: number;
    tags: string[];
  }>;
  context: {
    avg_mood_7d: number;
    dominant_tone: string;
    time_of_day: string;
    stress_level: string;
  };
};

export async function getRecommendations(): Promise<RecommendationTodayResponse | null> {
  try {
    const res = await fetch(`${API}/api/recommendations/today`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function submitRecommendationFeedback(
  logId: string,
  acceptedModuleIds: string[]
): Promise<void> {
  try {
    await fetch(`${API}/api/recommendations/${logId}/feedback`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules_accepted: acceptedModuleIds }),
    });
  } catch (e) {
    console.warn('Feedback submit failed silently:', e);
  }
}
