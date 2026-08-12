"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';

import { authClient } from '@/lib/authClient';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { ZenPage, ZenContainer, ZenButton, ZenInput } from '@/components/zen';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      setFormError(`Google sign-in did not complete (${oauthError}). Please try again.`);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      setFormError(null);
      await authClient.signIn({
        email: values.email,
        password: values.password,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Sign-in failed', error);
      setFormError(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
      <ZenContainer maxWidth="sm" className="py-16">
        <div className="glass-elevated rounded-zen-2xl shadow-zen-modal p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zen-primary-soft text-zen-primary">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="zen-h1 text-zen-fg">Welcome back</h1>
            <p className="zen-body-sm text-zen-fg-muted">Sign in to continue your ZenU journey.</p>
          </div>

          {formError ? (
            <div
              className="rounded-zen-lg border border-zen-danger/25 bg-zen-danger-soft px-4 py-3 zen-body-sm text-zen-danger"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <ZenInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-2">
              <ZenInput
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-zen-primary hover:text-zen-primary-hover font-medium focus-visible:outline-2 focus-visible:outline-zen-primary"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <ZenButton type="submit" fullWidth loading={isSubmitting}>
              Sign in
            </ZenButton>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zen-border-soft" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 px-2 text-zen-fg-subtle">or</span>
            </div>
          </div>

          <GoogleAuthButton label="Continue with Google" />

          <p className="text-center zen-body-sm text-zen-fg-muted">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-zen-primary hover:text-zen-primary-hover font-medium focus-visible:outline-2 focus-visible:outline-zen-primary"
            >
              Create one
            </Link>
          </p>
        </div>
      </ZenContainer>
    </ZenPage>
  );
};

export default SignInPage;
