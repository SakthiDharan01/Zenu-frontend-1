"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const zenBadgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-zen-full',
    'font-medium whitespace-nowrap select-none',
    'transition-colors duration-zen-fast ease-zen-out',
  ],
  {
    variants: {
      variant: {
        soft: 'bg-zen-bg-muted text-zen-fg-muted border border-zen-border-soft',
        primary: 'bg-zen-primary-soft text-zen-primary border border-zen-primary/20',
        secondary: 'bg-zen-secondary-soft text-zen-secondary border border-zen-secondary/20',
        accent: 'bg-zen-accent-soft text-zen-accent border border-zen-accent/20',
        joy: 'bg-zen-joy-soft text-zen-joy border border-zen-joy/25',
        warning: 'bg-zen-warning-soft text-zen-warning border border-zen-warning/25',
        danger: 'bg-zen-danger-soft text-zen-danger border border-zen-danger/20',
        success: 'bg-zen-success-soft text-zen-success border border-zen-success/20',
        glass: 'glass-subtle text-zen-fg',
      },
      size: {
        sm: 'px-2 py-0.5 text-[0.6875rem] min-h-7',
        md: 'px-2.5 py-1 text-xs min-h-8',
        lg: 'px-3 py-1.5 text-sm min-h-11',
      },
      interactive: {
        true: [
          'cursor-pointer active:scale-[0.97] min-h-11',
          'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'soft',
      size: 'md',
      interactive: false,
    },
  },
);

export interface ZenBadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof zenBadgeVariants> {
  as?: 'span' | 'button';
}

export function ZenBadge({
  className,
  variant,
  size,
  interactive,
  as,
  ...props
}: ZenBadgeProps) {
  const isButton = as === 'button' || interactive;
  const Comp = isButton ? 'button' : 'span';

  return (
    <Comp
      className={cn(zenBadgeVariants({ variant, size, interactive: isButton, className }))}
      type={isButton ? 'button' : undefined}
      {...props}
    />
  );
}

export { zenBadgeVariants };
