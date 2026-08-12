"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';

import { authClient } from '@/lib/authClient';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { ZenPage, ZenContainer, ZenButton, ZenInput } from '@/components/zen';

const optionalFullName = z
  .string()
  .trim()
  .max(120, 'Full name must be 120 characters or fewer')
  .optional()
  .or(z.literal(''));

const optionalUsername = z
  .string()
  .trim()
  .min(2, 'Username must be at least 2 characters')
  .max(32, 'Username must be 32 characters or fewer')
  .optional()
  .or(z.literal(''));

const signUpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: optionalFullName,
  username: optionalUsername,
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', fullName: '', username: '' },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      setFormError(null);
      await authClient.signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName?.trim() ? values.fullName.trim() : undefined,
        username: values.username?.trim() ? values.username.trim() : undefined,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Sign-up failed', error);
      setFormError(error instanceof Error ? error.message : 'Failed to sign up');
    }
  };

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)] flex items-center">
      <ZenContainer maxWidth="sm" className="py-16">
        <div className="glass-elevated rounded-zen-2xl shadow-zen-modal p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zen-secondary-soft text-zen-secondary">
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="zen-h1 text-zen-fg">Create your ZenU account</h1>
            <p className="zen-body-sm text-zen-fg-muted">Join and begin your calm journey.</p>
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
            <ZenInput
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <ZenInput
              label="Full name (optional)"
              type="text"
              placeholder="Sage Traveler"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <ZenInput
              label="Username (optional)"
              type="text"
              placeholder="zenu-traveler"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <ZenButton type="submit" fullWidth loading={isSubmitting}>
              Create account
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
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-zen-primary hover:text-zen-primary-hover font-medium focus-visible:outline-2 focus-visible:outline-zen-primary"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </ZenContainer>
    </ZenPage>
  );
};

export default SignUpPage;
