"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/authClient';

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
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  fullName: optionalFullName,
  username: optionalUsername
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      username: ''
    }
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      setFormError(null);
      await authClient.signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName?.trim() ? values.fullName.trim() : undefined,
        username: values.username?.trim() ? values.username.trim() : undefined
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign-up failed', error);
      setFormError(error instanceof Error ? error.message : 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Create your ZenU account</h1>
          <p className="text-gray-500 text-sm">Join the community and begin your calm journey.</p>
        </div>

        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name (optional)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Sage Traveler"
              autoComplete="name"
              {...register('fullName')}
            />
            {errors.fullName && errors.fullName.message ? (
              <p className="text-sm text-red-600">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username (optional)</Label>
            <Input
              id="username"
              type="text"
              placeholder="zenu-traveler"
              autoComplete="username"
              {...register('username')}
            />
            {errors.username && errors.username.message ? (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
