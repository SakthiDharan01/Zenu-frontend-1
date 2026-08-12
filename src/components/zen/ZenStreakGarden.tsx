"use client";

import React from 'react';
import { Sprout, Leaf, TreeDeciduous } from 'lucide-react';
import type { StreakData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ZenCard, ZenCardContent, ZenCardHeader, ZenCardTitle, ZenCardDescription } from './ZenCard';
import { ZenButton } from './ZenButton';

interface ZenStreakGardenProps {
  streakData: StreakData;
  onWater: () => void;
  className?: string;
}

export function ZenStreakGarden({ streakData, onWater, className }: ZenStreakGardenProps) {
  const { currentStreak, plantStage } = streakData;

  const getPlantIcon = (stage: string, index: number) => {
    const isActive =
      (stage === 'seedling' && index === 0) ||
      (stage === 'sapling' && index <= 1) ||
      (stage === 'tree' && index <= 2);

    const icons = [Sprout, Leaf, TreeDeciduous];
    const Icon = icons[index];

    return (
      <Icon
        className={cn(
          'w-7 h-7 transition-all duration-zen-base ease-zen-out',
          isActive ? 'text-zen-joy scale-100' : 'text-zen-fg-subtle/40 scale-90',
        )}
        aria-hidden="true"
      />
    );
  };

  return (
    <ZenCard
      variant="standard"
      className={cn('h-full', className)}
      role="button"
      tabIndex={0}
      aria-label="Water your healing garden"
      onClick={onWater}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onWater();
        }
      }}
    >
      <ZenCardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <ZenCardTitle>Healing Garden</ZenCardTitle>
            <ZenCardDescription>
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} of growth
            </ZenCardDescription>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-zen-full bg-zen-joy-soft border border-zen-joy/20"
            aria-hidden="true"
          >
            {[0, 1, 2].map((index) => (
              <div key={index}>{getPlantIcon(plantStage, index)}</div>
            ))}
          </div>
        </div>
      </ZenCardHeader>

      <ZenCardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="zen-body-sm text-zen-fg-muted">Keep your streak alive</p>
          <ZenButton
            variant="joy"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onWater();
            }}
            aria-label="Water garden"
          >
            Water
          </ZenButton>
        </div>
      </ZenCardContent>
    </ZenCard>
  );
}
