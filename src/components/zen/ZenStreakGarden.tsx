"use client";

import React, { useEffect, useState } from 'react';
import { Sprout, TreeDeciduous } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ZenCard, ZenCardContent, ZenCardHeader, ZenCardTitle, ZenCardDescription } from './ZenCard';
import { ZenButton } from './ZenButton';

interface ZenStreakGardenProps {
  className?: string;
  // Kept for backward compatibility with existing usage if any, though ignored
  streakData?: any;
  onWater?: () => void;
}

export function ZenStreakGarden({ className }: ZenStreakGardenProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<{ completed: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${API}/api/healing-garden/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const trees = tasks.filter(t => t.completed).length;
  const seeds = tasks.filter(t => !t.completed).length;

  return (
    <ZenCard
      variant="standard"
      className={cn('h-full cursor-pointer hover:border-zen-success/30 transition-colors', className)}
      role="button"
      tabIndex={0}
      aria-label="Visit Healing Garden"
      onClick={() => router.push('/healing-garden')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push('/healing-garden');
        }
      }}
    >
      <ZenCardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <ZenCardTitle>Healing Garden</ZenCardTitle>
            <ZenCardDescription>
              {loading ? 'Loading garden...' : `${trees} tree${trees !== 1 ? 's' : ''} grown`}
            </ZenCardDescription>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-zen-full bg-zen-success-soft border border-zen-success/20"
            aria-hidden="true"
          >
            <TreeDeciduous className="w-5 h-5 text-zen-success" />
            <span className="text-sm font-semibold text-zen-success mr-1">{trees}</span>
            <Sprout className="w-5 h-5 text-zen-success ml-1" />
            <span className="text-sm font-semibold text-zen-success">{seeds}</span>
          </div>
        </div>
      </ZenCardHeader>

      <ZenCardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="zen-body-sm text-zen-fg-muted">A quiet place for finished work</p>
          <ZenButton
            variant="ghost"
            size="sm"
            className="text-zen-success hover:bg-zen-success-soft"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/healing-garden');
            }}
          >
            Visit
          </ZenButton>
        </div>
      </ZenCardContent>
    </ZenCard>
  );
}
