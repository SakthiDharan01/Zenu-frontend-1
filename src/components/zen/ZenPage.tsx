/**
 * ZenPage layout primitives
 *
 * Usage:
 *   <ZenPage atmosphere="calm">
 *     <ZenPageHeader title="Breathe" subtitle="Find your rhythm" />
 *     <ZenSection>
 *       <ZenContainer maxWidth="xl">
 *         <ZenGrid cols={3}>
 *           ...cards
 *         </ZenGrid>
 *       </ZenContainer>
 *     </ZenSection>
 *   </ZenPage>
 */

import React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   ZenPage — page root with atmosphere token
   ───────────────────────────────────────────────────────────── */
export type ZenAtmosphere =
  | 'home'
  | 'calm'
  | 'focus'
  | 'reflect'
  | 'renewal'
  | 'release'
  | 'none';

interface ZenPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Atmospheric variant — sets data-zen-atmosphere + bg tint */
  atmosphere?: ZenAtmosphere;
  /** Use the full-height atmospheric gradient as background */
  gradient?: boolean;
}

function ZenPage({ atmosphere = 'none', gradient = false, className, children, ...props }: ZenPageProps) {
  return (
    <div
      data-zen-atmosphere={atmosphere !== 'none' ? atmosphere : undefined}
      className={cn(
        'relative w-full',
        gradient && 'min-h-[calc(100dvh-4rem)]',
        className,
      )}
      style={gradient && atmosphere !== 'none' ? { background: 'var(--zen-atm-bg-tint)' } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenPageHeader — title + subtitle + optional right slot
   ───────────────────────────────────────────────────────────── */
interface ZenPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  /** Use serif font (Journal, Gratitude, Inner Compass) */
  serif?: boolean;
}

function ZenPageHeader({ title, subtitle, rightSlot, serif = false, className, ...props }: ZenPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 mb-8',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className={cn('zen-h1 text-zen-fg truncate', serif && 'font-serif')}>
          {title}
        </h1>
        {subtitle && (
          <p className="zen-body-sm text-zen-fg-muted mt-1">{subtitle}</p>
        )}
      </div>
      {rightSlot && (
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenSection — semantic content block
   ───────────────────────────────────────────────────────────── */
interface ZenSectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

function ZenSection({ as: Tag = 'section', className, ...props }: ZenSectionProps) {
  return (
    <Tag
      className={cn('mb-10 sm:mb-12 last:mb-0', className)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenContainer — max-width constraint
   ───────────────────────────────────────────────────────────── */
const MAX_WIDTHS = {
  sm:  'max-w-screen-sm',
  md:  'max-w-screen-md',
  lg:  'max-w-screen-lg',
  xl:  'max-w-[1600px]', // Expanded from screen-xl
  '2xl': 'max-w-[1920px]',
  full: 'max-w-full',
} as const;

interface ZenContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: keyof typeof MAX_WIDTHS;
}

function ZenContainer({ maxWidth = 'xl', className, ...props }: ZenContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        MAX_WIDTHS[maxWidth],
        className,
      )}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenGrid — responsive card grid
   ───────────────────────────────────────────────────────────── */
const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

interface ZenGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: keyof typeof GRID_COLS;
  gap?: 'sm' | 'md' | 'lg';
}

function ZenGrid({ cols = 3, gap = 'md', className, ...props }: ZenGridProps) {
  return (
    <div
      className={cn(
        'grid',
        GRID_COLS[cols],
        gap === 'sm' && 'gap-3',
        gap === 'md' && 'gap-4',
        gap === 'lg' && 'gap-6',
        className,
      )}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenBento — asymmetric bento layout
   ───────────────────────────────────────────────────────────── */
function ZenBento({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto',
        className,
      )}
      {...props}
    />
  );
}

interface ZenBentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span on lg screens */
  span?: 1 | 2 | 3;
  /** Row span */
  rowSpan?: 1 | 2;
}

const SPANS = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' } as const;
const ROW_SPANS = { 1: '', 2: 'lg:row-span-2' } as const;

function ZenBentoItem({ span = 1, rowSpan = 1, className, ...props }: ZenBentoItemProps) {
  return (
    <div
      className={cn(SPANS[span], ROW_SPANS[rowSpan], className)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenDivider — decorative section separator
   ───────────────────────────────────────────────────────────── */
function ZenDivider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn('border-0 border-t border-zen-border-soft my-8', className)}
      {...props}
    />
  );
}

export {
  ZenPage,
  ZenPageHeader,
  ZenSection,
  ZenContainer,
  ZenGrid,
  ZenBento,
  ZenBentoItem,
  ZenDivider,
};
