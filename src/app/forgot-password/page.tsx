"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';

import { authClient } from '@/lib/authClient';
import { ZenPage, ZenContainer, ZenButton, ZenInput } from '@/components/zen';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setFormError(null);
      const message = await authClient.requestPasswordReset(values.email);
      setSuccessMessage(message);
    } catch (error) {
      console.error('Password reset request failed', error);
      setFormError(error instanceof Error ? error.message : 'Failed to send reset email');
    }
  };

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
      <ZenContainer maxWidth="sm" className="py-16">
        <div className="glass-elevated rounded-zen-2xl shadow-zen-modal p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zen-primary-soft text-zen-primary">
              <MailCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="zen-h1 text-zen-fg">Forgot password?</h1>
            <p className="zen-body-sm text-zen-fg-muted">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </div>

          {formError ? (
            <div
              className="rounded-zen-lg border border-zen-danger/25 bg-zen-danger-soft px-4 py-3 zen-body-sm text-zen-danger"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          {successMessage ? (
            <div
              className="rounded-zen-lg border border-zen-success/25 bg-zen-success-soft px-4 py-3 zen-body-sm text-zen-success"
              role="status"
            >
              {successMessage}
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

            <ZenButton type="submit" fullWidth loading={isSubmitting}>
              Send reset link
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

export default ForgotPasswordPage;
