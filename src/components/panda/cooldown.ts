const STORAGE_KEY = 'zenu.panda.cooldown.v1';

export type CooldownRecord = {
  recommendationKey: string;
  context?: string;
  sessionId?: string;
  lastShownAt?: number;
  dismissedAt?: number;
  completedAt?: number;
  suppressUntil?: number;
};

const SOFT_SUPPRESS_MS = 90 * 60 * 1000; // shown, no engage
const DISMISS_SUPPRESS_MS = 18 * 60 * 60 * 1000; // Maybe later
const COMPLETE_SUPPRESS_MS = 24 * 60 * 60 * 1000; // finished activity

function readAll(): Record<string, CooldownRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CooldownRecord>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, CooldownRecord>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

function recordKey(recommendationKey: string, context?: string) {
  return context ? `${recommendationKey}::${context}` : recommendationKey;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'zenu.panda.session';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

export function markPandaShown(recommendationKey: string, context?: string) {
  const map = readAll();
  const key = recordKey(recommendationKey, context);
  const now = Date.now();
  map[key] = {
    ...map[key],
    recommendationKey,
    context,
    sessionId: getSessionId(),
    lastShownAt: now,
    suppressUntil: Math.max(map[key]?.suppressUntil ?? 0, now + SOFT_SUPPRESS_MS),
  };
  writeAll(map);
}

export function markPandaDismissed(recommendationKey: string, context?: string) {
  const map = readAll();
  const key = recordKey(recommendationKey, context);
  const now = Date.now();
  map[key] = {
    ...map[key],
    recommendationKey,
    context,
    sessionId: getSessionId(),
    dismissedAt: now,
    suppressUntil: now + DISMISS_SUPPRESS_MS,
  };
  writeAll(map);
}

export function markPandaCompleted(recommendationKey: string, context?: string) {
  const map = readAll();
  const key = recordKey(recommendationKey, context);
  const now = Date.now();
  map[key] = {
    ...map[key],
    recommendationKey,
    context,
    sessionId: getSessionId(),
    completedAt: now,
    suppressUntil: now + COMPLETE_SUPPRESS_MS,
  };
  writeAll(map);
}

export function resetPandaCooldown(recommendationKey?: string, context?: string) {
  if (typeof window === 'undefined') return;
  if (!recommendationKey) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const map = readAll();
  delete map[recordKey(recommendationKey, context)];
  writeAll(map);
}

export type CanShowInput = {
  recommendationKey: string;
  context?: string;
  currentPath?: string;
  activityHref?: string;
};

/**
 * Smart gate: soft suppress after show, longer after dismiss/complete,
 * and never interrupt if the user is already on that activity route.
 */
export function canShowPandaPrompt(input: CanShowInput): boolean {
  const { recommendationKey, context, currentPath, activityHref } = input;

  if (activityHref && currentPath) {
    const path = currentPath.split('?')[0];
    if (path === activityHref || path.startsWith(`${activityHref}/`)) {
      return false;
    }
  }

  const map = readAll();
  const rec = map[recordKey(recommendationKey, context)];
  if (!rec?.suppressUntil) return true;
  return Date.now() >= rec.suppressUntil;
}
