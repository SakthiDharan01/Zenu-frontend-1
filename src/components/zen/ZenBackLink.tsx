'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared module Back control — navigates home by default.
 */
export function ZenBackLink({
  href = '/',
  label = 'Back',
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label === 'Back' ? 'Back to home' : label}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-zen-sm px-2',
        'font-ui text-sm text-zen-fg-muted transition-colors',
        'hover:text-zen-fg',
        'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
