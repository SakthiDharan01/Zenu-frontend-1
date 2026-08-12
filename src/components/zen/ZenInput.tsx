"use client";

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenInput — labeled input with error and helper text
   ───────────────────────────────────────────────────────────── */
export interface ZenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  /** Icon rendered on the left inside the input */
  leftIcon?: React.ReactNode;
  /** Icon or element rendered on the right inside the input */
  rightElement?: React.ReactNode;
}

const ZenInput = React.forwardRef<HTMLInputElement, ZenInputProps>(
  ({ label, error, helper, leftIcon, rightElement, className, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="zen-label text-zen-fg-muted"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zen-fg-subtle">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, helper ? helperId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={cn(
              // Base
              'w-full h-11 min-h-11 rounded-zen-sm bg-white border text-zen-fg text-sm',
              'placeholder:text-zen-fg-subtle',
              'transition-[border-color,box-shadow] duration-100',
              // Default state
              !error && 'border-zen-border',
              // Focus
              !error && [
                'focus:outline-none focus:border-zen-border-focus',
                'focus:ring-2 focus:ring-zen-primary/15',
              ],
              // Error state
              error && [
                'border-zen-danger',
                'focus:outline-none focus:border-zen-danger',
                'focus:ring-2 focus:ring-zen-danger/15',
              ],
              // Padding adjustments for icons
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightElement ? 'pr-10' : 'pr-3.5',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zen-bg-subtle',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-zen-fg-subtle">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="zen-caption text-zen-danger flex items-center gap-1">
            {error}
          </p>
        )}

        {!error && helper && (
          <p id={helperId} className="zen-caption text-zen-fg-subtle">
            {helper}
          </p>
        )}
      </div>
    );
  },
);
ZenInput.displayName = 'ZenInput';

/* ─────────────────────────────────────────────────────────────
   ZenTextarea
   ───────────────────────────────────────────────────────────── */
export interface ZenTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const ZenTextarea = React.forwardRef<HTMLTextAreaElement, ZenTextareaProps>(
  ({ label, error, helper, className, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="zen-label text-zen-fg-muted">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, helper ? helperId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            'w-full min-h-[100px] rounded-zen-sm bg-white border text-zen-fg text-sm',
            'placeholder:text-zen-fg-subtle resize-y px-3.5 py-3',
            'transition-[border-color,box-shadow] duration-100',
            !error && 'border-zen-border focus:outline-none focus:border-zen-border-focus focus:ring-2 focus:ring-zen-primary/15',
            error && 'border-zen-danger focus:outline-none focus:border-zen-danger focus:ring-2 focus:ring-zen-danger/15',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zen-bg-subtle',
            className,
          )}
          {...props}
        />

        {error && (
          <p id={errorId} className="zen-caption text-zen-danger">{error}</p>
        )}
        {!error && helper && (
          <p id={helperId} className="zen-caption text-zen-fg-subtle">{helper}</p>
        )}
      </div>
    );
  },
);
ZenTextarea.displayName = 'ZenTextarea';

export { ZenInput, ZenTextarea };
