/**
 * Session-scoped recommendation → engagement attribution.
 * Not persisted in user profile; cleared when leaving the attributed experience.
 */

const PENDING_KEY = 'zenu.rec_attribution.pending';
const TTL_MS = 30 * 60 * 1000;

export type RecommendationLaunch = {
  logId: string;
  href: string;
  ts: number;
};

/** Active attribution for the current experience visit (in-memory). */
let active: RecommendationLaunch | null = null;

function normalizePath(path: string): string {
  const base = path.split('?')[0].split('#')[0];
  const trimmed = base.replace(/\/$/, '');
  return trimmed || '/';
}

export function pathMatchesHref(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  return path === target || path.startsWith(`${target}/`);
}

function readPending(): RecommendationLaunch | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecommendationLaunch;
    if (!parsed?.logId || !parsed?.href || typeof parsed.ts !== 'number') {
      window.sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    if (Date.now() - parsed.ts > TTL_MS) {
      window.sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(PENDING_KEY);
    return null;
  }
}

function clearPending() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_KEY);
}

/**
 * Call when the user selects a recommended experience (Home card or Panda CTA).
 * Direct navigation must not call this.
 */
export function setRecommendationLaunch(
  logId: string | null | undefined,
  href: string,
): void {
  if (typeof window === 'undefined') return;
  if (!logId) {
    clearPending();
    return;
  }
  const launch: RecommendationLaunch = {
    logId,
    href,
    ts: Date.now(),
  };
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(launch));
}

/**
 * Keep attribution aligned with the current route.
 * - Matching pending → activate for this visit
 * - Left attributed experience → clear (so a later direct open is not attributed)
 */
export function syncRecommendationAttribution(pathname: string): void {
  const pending = readPending();
  if (pending && pathMatchesHref(pathname, pending.href)) {
    active = pending;
    clearPending();
    return;
  }

  if (active && !pathMatchesHref(pathname, active.href)) {
    active = null;
  }
}

/** Log id for engagement on the current path, if this visit came from a recommendation. */
export function resolveRecommendationLogId(
  pathname?: string,
): string | null {
  if (typeof window === 'undefined') return null;
  const path = pathname ?? window.location.pathname;

  syncRecommendationAttribution(path);

  if (active && pathMatchesHref(path, active.href)) {
    return active.logId;
  }
  return null;
}

export function clearRecommendationAttribution(): void {
  active = null;
  clearPending();
}
