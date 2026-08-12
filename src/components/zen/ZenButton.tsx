"use client";

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenButton variants
   ───────────────────────────────────────────────────────────── */
const zenButtonVariants = cva(
  // Base
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium leading-none select-none whitespace-nowrap',
    'rounded-zen-lg transition-all',
    'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Instant pointer-down feedback (Apple Design §1)
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-zen-primary text-white shadow-zen-subtle',
          'hover:bg-zen-primary-hover hover:shadow-zen-card',
          'active:bg-zen-primary',
        ],
        secondary: [
          'bg-zen-secondary-soft text-zen-secondary border border-zen-secondary/20',
          'hover:bg-zen-secondary/10 hover:border-zen-secondary/30',
        ],
        outline: [
          'border border-zen-border bg-transparent text-zen-fg',
          'hover:bg-zen-bg-subtle hover:border-zen-border-focus/40',
        ],
        ghost: [
          'bg-transparent text-zen-fg-muted',
          'hover:bg-zen-bg-subtle hover:text-zen-fg',
        ],
        destructive: [
          'bg-zen-danger text-white shadow-zen-subtle',
          'hover:opacity-90',
        ],
        // Soft accent — used for atmospheric CTAs
        accent: [
          'bg-zen-accent text-white shadow-zen-subtle',
          'hover:opacity-90 hover:shadow-zen-card',
        ],
        // Joy — streak milestone, celebration
        joy: [
          'bg-zen-joy text-white shadow-zen-subtle',
          'hover:opacity-90',
        ],
        // Glass — for floating surfaces, modals
        glass: [
          'glass text-zen-fg',
          'hover:bg-white/80',
          'border-white/50',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-zen-md gap-1',
        sm:   'h-10 px-3.5 text-sm min-h-10',
        md:   'h-11 px-5 text-sm min-h-11',
        lg:   'h-11 px-6 text-[0.9375rem] min-h-11',
        xl:   'h-12 px-8 text-base min-h-12',
        // Icon-only sizes — min 44×44 for touch (Apple HIG / WCAG)
        'icon-sm': 'h-11 w-11 min-h-11 min-w-11 rounded-zen-md',
        'icon-md': 'h-11 w-11 min-h-11 min-w-11 rounded-zen-lg',
        'icon-lg': 'h-12 w-12 min-h-12 min-w-12 rounded-zen-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

/* ─────────────────────────────────────────────────────────────
   ZenButton component
   ───────────────────────────────────────────────────────────── */
export interface ZenButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof zenButtonVariants> {
  /** Render as child element (Radix Slot pattern) */
  asChild?: boolean;
  /** Shows a spinner and disables the button */
  loading?: boolean;
}

const ZenButton = React.forwardRef<HTMLButtonElement, ZenButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(zenButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        style={{
          transitionDuration: '100ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          ...props.style,
        }}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0"
              aria-hidden="true"
            />
            {children}
          </>
        ) : children}
      </Comp>
    );
  },
);

ZenButton.displayName = 'ZenButton';

export { ZenButton, zenButtonVariants };
