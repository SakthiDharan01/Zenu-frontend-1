"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound } from 'lucide-react';

import { authClient } from '@/lib/authClient';
import { ZenPage, ZenContainer, ZenButton, ZenInput, ZenSkeleton } from '@/components/zen';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Fix: use optional chaining
  const email = useMemo(() => searchParams?.get('email') ?? '', [searchParams]);
  const token = useMemo(() => searchParams?.get('token') ?? '', [searchParams]);

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const missingLinkData = !email || !token;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setFormError(null);
      const message = await authClient.resetPassword({
        email,
        token,
        password: values.password,
      });
      setSuccessMessage(message);
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    } catch (error) {
      console.error('Reset password failed', error);
      setFormError(error instanceof Error ? error.message : 'Failed to reset password');
    }
  };

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
      <ZenContainer maxWidth="sm" className="py-16">
        <div className="glass-elevated rounded-zen-2xl shadow-zen-modal p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zen-secondary-soft text-zen-secondary">
              <KeyRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="zen-h1 text-zen-fg">Reset your password</h1>
            <p className="zen-body-sm text-zen-fg-muted">
              Choose a new secure password for your ZenU account.
            </p>
          </div>

          {missingLinkData && (
            <div
              className="rounded-zen-lg border border-zen-warning/25 bg-zen-warning-soft px-4 py-3 zen-body-sm text-zen-warning"
              role="alert"
            >
              This reset link is incomplete. Please request a new reset email.
            </div>
          )}

          {formError && (
            <div
              className="rounded-zen-lg border border-zen-danger/25 bg-zen-danger-soft px-4 py-3 zen-body-sm text-zen-danger"
              role="alert"
            >
              {formError}
            </div>
          )}

          {successMessage && (
            <div
              className="rounded-zen-lg border border-zen-success/25 bg-zen-success-soft px-4 py-3 zen-body-sm text-zen-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <ZenInput
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <ZenInput
              label="Confirm new password"
              type="password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <ZenButton type="submit" fullWidth loading={isSubmitting} disabled={missingLinkData}>
              Reset password
            </ZenButton>
          </form>

          <p className="text-center zen-body-sm text-zen-fg-muted">
            Back to{' '}
            <Link
              href="/signin"
              className="text-zen-primary hover:text-zen-primary-hover font-medium focus-visible:outline-2 focus-visible:outline-zen-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </ZenContainer>
    </ZenPage>
  );
};

const ResetPasswordPage = () => (
  <Suspense
    fallback={
      <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
        <ZenContainer maxWidth="sm" className="py-16">
          <div className="glass-elevated rounded-zen-2xl p-8 space-y-4">
            <ZenSkeleton className="h-8 w-48 mx-auto" />
            <ZenSkeleton className="h-4 w-64 mx-auto" />
            <ZenSkeleton className="h-40 w-full" rounded="xl" />
          </div>
        </ZenContainer>
      </ZenPage>
    }
  >
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPasswordPage;
