"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authClient, type AuthUser } from '@/lib/authClient';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    const currentUser = await authClient.getCurrentUser();
    setUser(currentUser);
    if (!silent) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const bootstrapAuth = async () => {
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      if (cancelled) {
        return;
      }

      // If backend is cold (e.g., Render wake-up), run a silent retry shortly
      // so UI becomes interactive quickly but still recovers session state.
      if (!currentUser) {
        retryTimer = setTimeout(() => {
          void loadUser({ silent: true });
        }, 3000);
      }
    };

    void bootstrapAuth();
    const unsubscribe = authClient.onAuthChange(() => {
      void loadUser({ silent: true });
    });

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      unsubscribe();
    };
  }, [loadUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refresh: () => loadUser()
  }), [user, loading, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
