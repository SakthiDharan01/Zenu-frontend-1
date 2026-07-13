import { AuthUser } from './authClient';
import type {
  BreathingPattern,
  ChatMessage,
  ConversationSummary,
  GratitudeEntry,
  GratitudeFeedback,
  GratitudeOverallReview,
  HomeOverview,
  JournalEntry,
  Meditation,
  PSSData,
  StreakData
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const buildUrl = (path: string) => {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${trimmed}`;
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  if (response.status === 204) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch (_error) {
    return null;
  }
};

const ensureOk = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  const data = await parseJson<{ error?: string }>(response);
  const message = data?.error ?? response.statusText;
  throw new Error(message || 'Unexpected error');
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { headers: initHeaders, ...restInit } = init ?? {};
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...initHeaders
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('zenu_access_token') : null;
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers,
    ...restInit
  });

  const okResponse = await ensureOk(response);
  const data = await parseJson<T>(okResponse);
  return (data as T) ?? ({} as T);
};

export const apiClient = {
  async getHomeOverview(): Promise<HomeOverview> {
    return request<HomeOverview>('/api/dashboard/home', { method: 'GET' });
  },

  async getStreak(): Promise<StreakData> {
    return request<StreakData>('/api/dashboard/streak', { method: 'GET' });
  },

  async recordActivity(module: string, payload?: Record<string, unknown>): Promise<void> {
    await request('/api/dashboard/activity', {
      method: 'POST',
      body: JSON.stringify({ module, payload })
    });
  },

  async getPSS(): Promise<PSSData> {
    return request<PSSData>('/api/dashboard/pss', { method: 'GET' });
  },

  async submitPSS(scores: number[]): Promise<PSSData> {
    return request<PSSData>('/api/dashboard/pss', {
      method: 'POST',
      body: JSON.stringify({ scores })
    });
  },

  async getBreathingPatterns(): Promise<BreathingPattern[]> {
    return request<BreathingPattern[]>('/api/breathing/patterns', { method: 'GET' });
  },

  async logBreathingSession(input: { patternId: string; durationSeconds: number; rating?: number; notes?: string }) {
    await request('/api/breathing/sessions', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async getMeditations(): Promise<Meditation[]> {
    return request<Meditation[]>('/api/meditations', { method: 'GET' });
  },

  async logMeditationSession(input: { meditationId: string; durationSeconds: number }) {
    await request('/api/meditations/sessions', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async getJournalEntries(params: { limit?: number; offset?: number } = {}): Promise<JournalEntry[]> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (typeof params.offset === 'number') {
      search.set('offset', String(params.offset));
    }
    const query = search.toString();
    const path = query ? `/api/journal?${query}` : '/api/journal';
    return request<JournalEntry[]>(path, { method: 'GET' });
  },

  async createJournalEntry(input: { mood?: string | null; title?: string | null; content: string }): Promise<JournalEntry> {
    return request<JournalEntry>('/api/journal', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async updateJournalEntry(id: string, input: { mood?: string | null; title?: string | null; content?: string }): Promise<JournalEntry> {
    return request<JournalEntry>(`/api/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  },

  async deleteJournalEntry(id: string): Promise<void> {
    await request(`/api/journal/${id}`, { method: 'DELETE' });
  },

  async listChatConversations(): Promise<ConversationSummary[]> {
    return request<ConversationSummary[]>('/api/chat/conversations', { method: 'GET' });
  },

  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return request<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages`, { method: 'GET' });
  },

  async sendChatMessage(input: { message: string; conversationId?: string }): Promise<{ conversationId: string; reply: string }> {
    return request<{ conversationId: string; reply: string }>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async getGratitudeEntries(): Promise<GratitudeEntry[]> {
    return request<GratitudeEntry[]>('/api/gratitude/entries', { method: 'GET' });
  },

  async createGratitudeEntry(input: { title?: string | null; content: string }): Promise<GratitudeEntry> {
    return request<GratitudeEntry>('/api/gratitude/entries', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async deleteGratitudeEntry(id: string): Promise<void> {
    await request(`/api/gratitude/entries/${id}`, { method: 'DELETE' });
  },

  async getRandomGratitudeFeedback(): Promise<GratitudeFeedback> {
    return request<GratitudeFeedback>('/api/gratitude/random-feedback', { method: 'GET' });
  },

  async getOverallGratitudeReview(): Promise<GratitudeOverallReview> {
    return request<GratitudeOverallReview>('/api/gratitude/overall-review', { method: 'GET' });
  }
};

export type { AuthUser };
