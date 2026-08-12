"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ZenFocusModeProps {
  /** Title shown in the floating pill and page <title> */
  title: string;
  /** Back destination — defaults to '/' */
  backHref?: string;
  /** Extra class on the outer wrapper */
  className?: string;
  children: React.ReactNode;
}

/**
 * ZenFocusMode
 *
 * Wraps immersive pages (Breathing, Meditation). Hides the global ZenNavigation
 * and ZenBottomNav via isZenFocusRoute, replaces them with a floating back pill.
 *
 * Per Apple Design §7 — spatial consistency: the user always knows how to exit.
 * Per Apple Design §16.2 — agency: never trap the user.
 */
export default function ZenFocusMode({
  title,
  backHref = '/',
  className,
  children,
}: ZenFocusModeProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn('relative min-h-dvh w-full', className)}
      data-zen-focus-mode="true"
    >
      <motion.div
        initial={{ opacity: 0, ...(reducedMotion ? {} : { y: -8 }) }}
        animate={{ opacity: 1, ...(reducedMotion ? {} : { y: 0 }) }}
        transition={
          reducedMotion
            ? { duration: 0.2, ease: 'easeOut' }
            : { type: 'spring', stiffness: 320, damping: 28, delay: 0.15 }
        }
        className="fixed top-4 left-4 z-50 zen-fade"
      >
        <Link
          href={backHref}
          aria-label="Exit focus mode and return to ZenU"
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 min-h-11 rounded-zen-full',
            'glass-floating shadow-zen-floating',
            'text-sm font-medium text-zen-fg',
            'hover:bg-white/95 transition-colors duration-100',
            'focus-visible:outline-2 focus-visible:outline-zen-primary',
            'active:scale-[0.97]',
          )}
        >
          <ArrowLeft className="h-4 w-4 text-zen-fg-muted" strokeWidth={2} aria-hidden="true" />
          <span className="hidden sm:inline text-zen-fg-muted">ZenU</span>
          <span className="h-3 w-px bg-zen-border hidden sm:block" aria-hidden="true" />
          <span className="text-zen-fg">{title}</span>
        </Link>
      </motion.div>

      {children}
    </div>
  );
}
