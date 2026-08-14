'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getRecommendations } from '@/lib/signals';
import { cn } from '@/lib/utils';
import { ZenCard, ZenCardContent, ZenCardHeader, ZenCardTitle } from './ZenCard';
import { ZenBadge } from './ZenBadge';
import { ZenSkeleton } from './ZenSkeleton';
import PandaAvatar from '@/components/PandaAvatar';
import { getTheme } from '@/lib/moduleThemes';

const MODULE_ROUTES: Record<string, string> = {
  // New API IDs
  breathing: '/breathing',
  mindfulness: '/meditation',
  diary: '/journal',
  journal_gratitude: '/gratitude',
  doodle_dreams: '/art',
  bubble_canvas: '/bubbles',
  burst_it_out: '/burst',
  scribble_pad: '/scribble',
  chatbot_seviyan: '/chat',
  healing_garden: '/healing-garden',
  inner_compass: '/innercompass',

};

export function ZenRecommendation({ className }: { className?: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getRecommendations>>>(null);
  const [loading, setLoading] = useState(true);
  const theme = getTheme('home');

  useEffect(() => {
    getRecommendations().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <ZenCard variant="glass" className={cn('min-h-[8rem]', className)}>
        <div className="flex items-center gap-4">
          <PandaAvatar state="thinking" size={56} />
          <div className="flex-1 space-y-2">
            <ZenSkeleton className="h-4 w-40" />
            <ZenSkeleton className="h-3 w-56" />
          </div>
        </div>
      </ZenCard>
    );
  }

  if (!data) return null;

  return (
    <ZenCard 
      variant="feature" 
      className={cn(className, 'border')} 
      padding="md"
      style={{ background: theme.cardBg, borderColor: theme.cardBorder, backdropFilter: 'blur(12px)' }}
    >
      <ZenCardHeader className="mb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <PandaAvatar state="idle" size={48} label="Panda recommendations" />
            <ZenCardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zen-joy" aria-hidden="true" />
              For you right now
            </ZenCardTitle>
          </div>
        </div>
      </ZenCardHeader>

      <ZenCardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {data.recommendations.map((rec, i) => {
            const targetId = rec.module_id || (rec as any).id;
            const route = MODULE_ROUTES[targetId] || '/';
            return (
              <Link
                key={targetId + i}
                href={route}
                className={cn(
                  'block text-left p-3 rounded-zen-lg border transition-all duration-zen-fast ease-zen-out',
                  'active:scale-[0.98]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2',
                  'min-h-11'
                )}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderColor: theme.cardBorder 
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: theme.accentColor }}>#{i + 1}</span>
                  <span className="text-xs text-white/50">{rec.duration_min} min</span>
                </div>
                <p className="text-sm font-semibold text-white transition-colors">
                  {rec.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {rec.tags.slice(0, 2).map((tag) => (
                    <ZenBadge key={tag} variant="soft" size="sm">
                      {tag}
                    </ZenBadge>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
        <p className="zen-caption text-zen-fg-subtle text-center mt-4">
          Personalised by ZenU · Updates daily
        </p>
      </ZenCardContent>
    </ZenCard>
  );
}

export default ZenRecommendation;
