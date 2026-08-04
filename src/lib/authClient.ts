import { apiFetch } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type AuthUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  fullName?: string | null;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
};

export type ResetPasswordInput = {
  email: string;
  token: string;
  password: string;
};

const AUTH_EVENT = 'zenu:auth-changed';

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

const buildUrl = (path: string) => {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${trimmed}`;
};

const emitAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

const ensureOk = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  const data = await parseJson(response);
  const message = (data && (data.error as string | undefined)) ?? response.statusText;
  throw new Error(message || 'Unexpected error');
};

export const authClient = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiFetch('/api/me', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.status === 401) {
        return null;
      }

      const data = await ensureOk(response).then(parseJson);
      return (data?.user as AuthUser | null) ?? null;
    } catch (error) {
      console.error('Failed to load current user', error);
      return null;
    }
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    const response = await apiFetch('/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await ensureOk(response).then(parseJson);
    const user = data?.user as AuthUser | undefined;
    if (!user) {
      throw new Error('Sign in response missing user');
    }

    emitAuthChange();
    return user;
  },

  async signUp(input: SignUpInput): Promise<AuthUser> {
    const response = await apiFetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await ensureOk(response).then(parseJson);
    const user = data?.user as AuthUser | undefined;
    if (!user) {
      throw new Error('Sign up response missing user');
    }

    emitAuthChange();
    return user;
  },

  async requestPasswordReset(email: string): Promise<string> {
    const response = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    const data = await ensureOk(response).then(parseJson);
    return (data?.message as string | undefined) ?? 'If an account exists for that email, a reset link has been sent.';
  },

  async resetPassword(input: ResetPasswordInput): Promise<string> {
    const response = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await ensureOk(response).then(parseJson);
    return (data?.message as string | undefined) ?? 'Password reset successful.';
  },

  async signOut(): Promise<void> {
    const response = await apiFetch('/api/logout', {
      method: 'POST'
    });

    if (response.status === 401) {
      emitAuthChange();
      return;
    }

    if (!response.ok && response.status !== 204) {
      await ensureOk(response);
    }

    emitAuthChange();
  },

  onAuthChange(callback: () => void) {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const handler = () => callback();
    window.addEventListener(AUTH_EVENT, handler);
    return () => {
      window.removeEventListener(AUTH_EVENT, handler);
    };
  }
};
