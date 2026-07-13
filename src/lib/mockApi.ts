/**
 * This module previously exposed an in-memory mock API for the ZenU UI.
 * Live integrations now rely on Supabase and Gemini via `apiClient`.
 * Any lingering imports should switch to the real client.
 */

export type User = never;
export type DailyFocus = never;
export type Module = never;
export type StreakData = never;
export type PSSData = never;
export type JournalEntry = never;

type RemovedApi = Record<string, never>;

export const mockApi: RemovedApi = new Proxy(
  {},
  {
    get() {
      throw new Error('mockApi has been removed. Please migrate to apiClient.');
    }
  }
) as RemovedApi;
