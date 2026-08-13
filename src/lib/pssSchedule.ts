const PSS_KEY = 'zenu_pss_last_completed';

export function shouldShowPSS(): boolean {
  try {
    const stored = localStorage.getItem(PSS_KEY);
    if (!stored) return true; // never taken → show it
    
    const lastDate = new Date(stored);
    lastDate.setHours(0, 0, 0, 0);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays >= 7; // show only after 7 calendar days
  } catch {
    return true;
  }
}

export function markPSSCompleted(): void {
  try {
    localStorage.setItem(PSS_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}

export function daysUntilNextPSS(): number {
  try {
    const stored = localStorage.getItem(PSS_KEY);
    if (!stored) return 0;
    
    const lastDate = new Date(stored);
    lastDate.setHours(0, 0, 0, 0);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 7 - diffDays);
  } catch {
    return 0;
  }
}
