"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Bot, Brain, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    href: '/breathing',
    label: 'Breathe',
    description: 'Reset in minutes',
    icon: Wind,
    tint: 'bg-zen-primary-soft text-zen-primary',
  },
  {
    href: '/meditation',
    label: 'Meditate',
    description: 'Guided calm',
    icon: Brain,
    tint: 'bg-zen-secondary-soft text-zen-secondary',
  },
  {
    href: '/chat',
    label: 'Seviyan',
    description: 'Talk it through',
    icon: Bot,
    tint: 'bg-zen-accent-soft text-zen-accent',
  },
  {
    href: '/journal',
    label: 'Journal',
    description: 'Write it down',
    icon: BookOpen,
    tint: 'bg-zen-joy-soft text-zen-joy',
  },
] as const;

export interface ZenQuickCalmProps {
  className?: string;
}

export function ZenQuickCalm({ className }: ZenQuickCalmProps) {
  return (
    <div className={cn('w-full', className)}>
      <p className="zen-label text-zen-fg-subtle mb-3">Quick calm</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map(({ href, label, description, icon: Icon, tint }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex flex-col items-start gap-3 rounded-zen-xl p-4',
              'bg-white border border-zen-border shadow-zen-subtle',
              'hover:shadow-zen-card hover:-translate-y-0.5 hover:border-zen-border-focus/30',
              'active:scale-[0.98] active:translate-y-0',
              'transition-all duration-zen-fast ease-zen-out',
              'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
              'min-h-[5.5rem]',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-zen-lg',
                tint,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-zen-fg">{label}</span>
              <span className="block text-xs text-zen-fg-muted mt-0.5">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
