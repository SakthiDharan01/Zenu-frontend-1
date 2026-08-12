import React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenSkeleton — single shimmer block
   ───────────────────────────────────────────────────────────── */
interface ZenSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const ROUNDED = {
  sm:   'rounded-zen-sm',
  md:   'rounded-zen-md',
  lg:   'rounded-zen-lg',
  xl:   'rounded-zen-xl',
  '2xl':'rounded-zen-2xl',
  full: 'rounded-full',
};

export function ZenSkeleton({ width, height, rounded = 'md', className, style, ...props }: ZenSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-zen-shimmer', ROUNDED[rounded], className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenSkeletonCard — full card placeholder
   ───────────────────────────────────────────────────────────── */
export function ZenSkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading…"
      className={cn(
        'rounded-zen-xl bg-white border border-zen-border shadow-zen-subtle p-5 sm:p-6',
        'flex flex-col gap-3',
        className,
      )}
    >
      <ZenSkeleton height="20px" width="60%" />
      <ZenSkeleton height="14px" width="80%" />
      <ZenSkeleton height="14px" width="40%" />
      <div className="pt-2">
        <ZenSkeleton height="36px" width="120px" rounded="lg" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenSkeletonText — paragraph placeholder
   ───────────────────────────────────────────────────────────── */
export function ZenSkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <ZenSkeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? '60%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}
