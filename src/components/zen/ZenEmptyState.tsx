import React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenEmptyState
   ───────────────────────────────────────────────────────────── */
interface ZenEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Emoji or small illustration above the title */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ZenEmptyState({ icon, title, description, action, className, ...props }: ZenEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'px-6 py-16 rounded-zen-xl',
        'bg-zen-bg-subtle border border-zen-border-soft',
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-4xl opacity-60 animate-zen-float">
          {icon}
        </div>
      )}
      <h3 className="zen-h3 text-zen-fg mb-2">{title}</h3>
      {description && (
        <p className="zen-body-sm text-zen-fg-muted max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenErrorState
   ───────────────────────────────────────────────────────────── */
interface ZenErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  retry?: React.ReactNode;
}

export function ZenErrorState({
  title = 'Something went wrong',
  message,
  retry,
  className,
  ...props
}: ZenErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'px-6 py-12 rounded-zen-xl',
        'bg-zen-danger-soft border border-zen-danger/20',
        className,
      )}
      role="alert"
      {...props}
    >
          <div className="mb-3 text-zen-danger" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </div>
      <h3 className="zen-h3 text-zen-danger mb-1.5">{title}</h3>
      {message && (
        <p className="zen-body-sm text-zen-fg-muted max-w-sm">{message}</p>
      )}
      {retry && (
        <div className="mt-5">{retry}</div>
      )}
    </div>
  );
}
