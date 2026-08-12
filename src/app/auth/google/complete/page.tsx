"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/authClient';
import { ZenPage, ZenContainer } from '@/components/zen';

/**
 * Completes OAuth 2.0 Authorization Code handoff:
 * FastAPI callback → ticket → this page → POST /api/auth/google/session via proxy
 * so HttpOnly ZenU cookies are set on the Vercel host.
 */
export default function GoogleOAuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing Google sign-in…');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket');
      if (!ticket) {
        router.replace('/signin?oauth_error=missing_ticket');
        return;
      }

      try {
        await authClient.completeGoogleSession(ticket);
        if (cancelled) return;
        setMessage('Signed in. Redirecting…');
        router.replace('/?auth=google');
        router.refresh();
      } catch (error) {
        console.error('Google OAuth session complete failed', error);
        if (cancelled) return;
        router.replace('/signin?oauth_error=session_failed');
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
      <ZenContainer maxWidth="sm" className="py-16">
        <p className="zen-body text-zen-fg-muted text-center" role="status" aria-live="polite">
          {message}
        </p>
      </ZenContainer>
    </ZenPage>
  );
}
