"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenCard variants
   ───────────────────────────────────────────────────────────── */
const zenCardVariants = cva(
  ['relative overflow-hidden rounded-zen-xl transition-all', 'focus-within:ring-2 focus-within:ring-zen-primary/20'],
  {
    variants: {
      variant: {
        // Standard white card
        standard: [
          'bg-white border border-zen-border shadow-zen-subtle',
        ],
        // Clickable / interactive card — lifts on hover
        interactive: [
          'bg-white border border-zen-border shadow-zen-subtle cursor-pointer',
          'hover:shadow-zen-card hover:-translate-y-0.5 hover:border-zen-border-focus/30',
          'active:shadow-zen-subtle active:translate-y-0',
          'transition-[transform,box-shadow,border-color]',
        ],
        // Feature card — prominent, slightly elevated
        feature: [
          'bg-white border border-zen-border shadow-zen-card',
          'hover:shadow-zen-elevated hover:-translate-y-1',
          'transition-[transform,box-shadow]',
        ],
        // Glass — for float-over-background contexts
        glass: [
          'glass',
        ],
        // Glass elevated — for modals, drawers
        'glass-elevated': [
          'glass-elevated',
        ],
        // Subtle — background tint, minimal border
        subtle: [
          'bg-zen-bg-subtle border border-zen-border-soft',
        ],
        // Accent soft — atmospheric tint card
        accent: [
          'bg-zen-primary-soft border border-zen-primary/20',
        ],
        // Compact / flat — no elevation, tight padding
        flat: [
          'bg-zen-bg-subtle border border-transparent',
        ],
      },
      padding: {
        none: '',
        sm:   'p-4',
        md:   'p-5 sm:p-6',
        lg:   'p-6 sm:p-8',
      },
    },
    defaultVariants: {
      variant: 'standard',
      padding: 'md',
    },
  },
);

/* ─────────────────────────────────────────────────────────────
   ZenCard
   ───────────────────────────────────────────────────────────── */
export interface ZenCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof zenCardVariants> {
  as?: React.ElementType;
}

const ZenCard = React.forwardRef<HTMLDivElement, ZenCardProps>(
  ({ className, variant, padding, as: Tag = 'div', ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(zenCardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  },
);
ZenCard.displayName = 'ZenCard';

/* ─────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────── */
const ZenCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 mb-4', className)}
      {...props}
    />
  ),
);
ZenCardHeader.displayName = 'ZenCardHeader';

const ZenCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('zen-h3 text-zen-fg', className)}
      {...props}
    />
  ),
);
ZenCardTitle.displayName = 'ZenCardTitle';

const ZenCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('zen-body-sm text-zen-fg-muted', className)}
      {...props}
    />
  ),
);
ZenCardDescription.displayName = 'ZenCardDescription';

const ZenCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  ),
);
ZenCardContent.displayName = 'ZenCardContent';

const ZenCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 mt-5 pt-4 border-t border-zen-border-soft', className)}
      {...props}
    />
  ),
);
ZenCardFooter.displayName = 'ZenCardFooter';

export {
  ZenCard,
  ZenCardHeader,
  ZenCardTitle,
  ZenCardDescription,
  ZenCardContent,
  ZenCardFooter,
  zenCardVariants,
};
