"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Brain,
  ClipboardList,
  Compass,
  Heart,
  PartyPopper,
  PenTool,
  Sparkles,
  Sprout,
  TreeDeciduous,
  Wand2,
  Wind,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import type {
  DailyFocus,
  HomeOverview,
  JournalEntry,
  ModuleRecord,
  PSSData,
  StreakData,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { shouldShowPSS, daysUntilNextPSS } from '@/lib/pssSchedule';
import { PSSCheck } from '@/components/PSSCheck';
import PandaAvatar from '@/components/PandaAvatar';
import {
  ZenPage,
  ZenContainer,
  ZenSection,
  ZenGrid,
  ZenBento,
  ZenBentoItem,
  ZenCard,
  ZenCardHeader,
  ZenCardTitle,
  ZenCardDescription,
  ZenCardContent,
  ZenButton,
  ZenMoodSelector,
  ZenQuickCalm,
  ZenStreakGarden,
  ZenRecommendation,
  ZenSkeletonCard,
} from '@/components/zen';

type ModuleVisual = {
  href: string;
  tint: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const moduleVisuals: Record<string, ModuleVisual> = {
  breathing: { href: '/breathing', tint: 'bg-zen-primary-soft text-zen-primary', icon: Wind },
  meditation: { href: '/meditation', tint: 'bg-zen-secondary-soft text-zen-secondary', icon: Brain },
  journal: { href: '/journal', tint: 'bg-zen-joy-soft text-zen-joy', icon: BookOpen },
  gratitude: { href: '/gratitude', tint: 'bg-zen-accent-soft text-zen-accent', icon: Heart },
  mandala: { href: '/art', tint: 'bg-zen-secondary-soft text-zen-secondary', icon: Wand2 },
  bubble: { href: '/bubbles', tint: 'bg-zen-joy-soft text-zen-joy', icon: Sparkles },
  burst: { href: '/burst', tint: 'bg-zen-danger-soft text-zen-danger', icon: PartyPopper },
  scribble: { href: '/scribble', tint: 'bg-zen-secondary-soft text-zen-secondary', icon: PenTool },
  chatbot: { href: '/chat', tint: 'bg-zen-accent-soft text-zen-accent', icon: Bot },
  garden: { href: '/healing-garden', tint: 'bg-zen-success-soft text-zen-success', icon: TreeDeciduous },
  compass: { href: '/innercompass', tint: 'bg-zen-bg-muted text-zen-fg-muted', icon: Compass },
};

const useHomeData = (enabled: boolean) => {
  const [overview, setOverview] = useState<HomeOverview | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [pss, setPss] = useState<PSSData | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!enabled) {
        setOverview(null);
        setStreak(null);
        setPss(null);
        setEntries([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [homeOverview, streakSummary, pssSnapshot, journalList] = await Promise.all([
          apiClient.getHomeOverview(),
          apiClient.getStreak(),
          apiClient.getPSS(),
          apiClient.getJournalEntries({ limit: 3 }),
        ]);

        if (!mounted) return;

        setOverview(homeOverview);
        setStreak(streakSummary);
        setPss(pssSnapshot);
        setEntries(journalList);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load your dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { overview, streak, pss, entries, loading, error, setStreak, setPss };
};

const LandingHero = () => {
  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="xl" className="pt-16 pb-20 md:pt-24">
        <div className="relative overflow-hidden rounded-zen-2xl min-h-[70vh] flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ background: 'var(--zen-atm-bg-tint, linear-gradient(135deg, hsl(228,60%,98%), hsl(240,30%,99%)))' }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--zen-primary)/0.12),transparent_55%)]" aria-hidden="true" />
          <div className="absolute top-8 right-8 opacity-90 hidden sm:block" aria-hidden="true">
            <PandaAvatar state="idle" size={120} />
          </div>

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <p className="zen-label text-zen-primary mb-4">ZenU</p>
            <h1 className="zen-display text-zen-fg">
              Your calm, between classes.
            </h1>
            <p className="zen-body text-zen-fg-muted mt-5 max-w-lg">
              Guided breathing, journaling, and a companion who listens — built for student stress, not generic wellness noise.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ZenButton asChild size="lg">
                <Link href="/signin">
                  Sign in
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </ZenButton>
              <ZenButton asChild variant="outline" size="lg">
                <Link href="/signup">Create account</Link>
              </ZenButton>
            </div>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="flex gap-3">
            <Sprout className="h-5 w-5 text-zen-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="zen-body-sm text-zen-fg-muted">
              Micro-practices under five minutes to reset between lectures.
            </p>
          </div>
          <div className="flex gap-3">
            <TreeDeciduous className="h-5 w-5 text-zen-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="zen-body-sm text-zen-fg-muted">
              Gentle streaks and moods that celebrate growth, not perfection.
            </p>
          </div>
        </div>
      </ZenContainer>
    </ZenPage>
  );
};

const ModuleCard = ({ module }: { module: ModuleRecord }) => {
  const visual = moduleVisuals[module.id] ?? {
    href: '/',
    tint: 'bg-zen-bg-muted text-zen-fg-muted',
    icon: Heart,
  };
  const Icon = visual.icon;

  return (
    <Link href={visual.href} className="block h-full focus-visible:outline-none">
      <ZenCard variant="interactive" className="h-full" padding="md">
        <div className={cn('w-12 h-12 rounded-zen-lg flex items-center justify-center mb-4', visual.tint)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="zen-h3 text-zen-fg mb-1">{module.title}</h3>
        <p className="zen-body-sm text-zen-fg-muted">
          {module.description ?? 'Explore calming practices at your own pace.'}
        </p>
      </ZenCard>
    </Link>
  );
};

const DailyFocusCard = ({ focus }: { focus: DailyFocus }) => {
  const minutes = Math.round(focus.durationSeconds / 60);
  const href = moduleVisuals[focus.moduleId ?? 'breathing']?.href ?? '/breathing';

  return (
    <ZenCard variant="accent" padding="lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="zen-label text-zen-primary">Daily focus</p>
          <h2 className="zen-h2 text-zen-fg mt-2">{focus.title}</h2>
          <p className="zen-body text-zen-fg-muted mt-2 max-w-xl">{focus.description}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <span className="zen-metric text-zen-primary">{minutes} min</span>
          <ZenButton asChild>
            <Link href={href}>
              {focus.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </ZenButton>
        </div>
      </div>
    </ZenCard>
  );
};

const JournalPreview = ({ entries, loading }: { entries: JournalEntry[]; loading: boolean }) => {
  if (loading) return <ZenSkeletonCard className="h-full min-h-[12rem]" />;

  if (!entries.length) {
    return (
      <ZenCard variant="standard" className="h-full">
        <ZenCardHeader>
          <ZenCardTitle>Recent Reflections</ZenCardTitle>
          <ZenCardDescription>Your next entry awaits.</ZenCardDescription>
        </ZenCardHeader>
        <ZenCardContent>
          <ZenButton asChild variant="outline" size="sm">
            <Link href="/journal">Open Journal</Link>
          </ZenButton>
        </ZenCardContent>
      </ZenCard>
    );
  }

  return (
    <ZenCard variant="standard" className="h-full">
      <ZenCardHeader>
        <div className="flex items-center justify-between gap-2">
          <ZenCardTitle>Recent Reflections</ZenCardTitle>
          <Link
            href="/journal"
            className="text-sm text-zen-primary hover:text-zen-primary-hover font-medium"
          >
            Open journal
          </Link>
        </div>
      </ZenCardHeader>
      <ZenCardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-zen-lg bg-zen-bg-subtle p-3">
            <p className="zen-caption text-zen-fg-subtle">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
            <p className="zen-body-sm text-zen-fg mt-1 line-clamp-2 font-serif">{entry.content}</p>
          </div>
        ))}
      </ZenCardContent>
    </ZenCard>
  );
};

const PssNudge = ({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) => {
  const router = useRouter();
  if (!visible) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-zen-xl px-4 py-3',
        'bg-zen-warning-soft border border-zen-warning/25 shadow-zen-subtle',
      )}
      role="status"
    >
      <ClipboardList className="h-5 w-5 text-zen-warning flex-shrink-0" aria-hidden="true" />
      <p className="zen-body-sm text-zen-fg flex-1 min-w-[12rem]">
        Weekly stress check-in is due — takes about two minutes.
      </p>
      <div className="flex items-center gap-2">
        <ZenButton size="sm" variant="accent" onClick={() => router.push('/assessment')}>
          Take PSS
        </ZenButton>
        <ZenButton
          size="icon-sm"
          variant="ghost"
          aria-label="Dismiss stress check reminder"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </ZenButton>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    overview,
    streak,
    pss,
    entries,
    loading: dashboardLoading,
    error,
    setStreak,
  } = useHomeData(Boolean(user));
  const [showPssNudge, setShowPssNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [showPSSCard, setShowPSSCard] = useState(false);
  const [daysNextPSS, setDaysNextPSS] = useState(0);

  const modules = useMemo(() => overview?.modules ?? [], [overview]);
  const displayName =
    user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? 'friend';

  useEffect(() => {
    if (!user || dashboardLoading) {
      setShowPssNudge(false);
      setShowPSSCard(false);
      return;
    }

    const due = shouldShowPSS();
    setShowPSSCard(due);
    setDaysNextPSS(daysUntilNextPSS());
    setShowPssNudge(due && !nudgeDismissed);
  }, [user, dashboardLoading, nudgeDismissed]);

  const handleWaterGarden = async () => {
    try {
      await apiClient.recordActivity('garden');
      const refreshed = await apiClient.getStreak();
      setStreak(refreshed);
    } catch (err) {
      console.error('Failed to water garden', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" aria-busy="true" aria-label="Loading">
        <div className="h-12 w-12 rounded-full border-4 border-zen-primary-soft border-t-zen-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <LandingHero />;

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="xl" className="pt-8 pb-10 md:pt-12">
        <ZenSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
            <PandaAvatar state="idle" size={72} label="Panda greeting" />
            <div className="min-w-0 flex-1">
              <p className="zen-label text-zen-primary">Welcome back</p>
              <h1 className="zen-h1 text-zen-fg mt-1 truncate">
                Hey {displayName}, you&apos;re safe here.
              </h1>
              <p className="zen-body-sm text-zen-fg-muted mt-2">
                Pick a practice below or follow today&apos;s focus.
              </p>
            </div>
          </div>
          <ZenMoodSelector />
        </ZenSection>

        <ZenSection>
          <PssNudge visible={showPssNudge} onDismiss={() => setNudgeDismissed(true)} />
        </ZenSection>

        <ZenSection>
          <ZenRecommendation />
        </ZenSection>

        <ZenSection>
          <ZenQuickCalm />
        </ZenSection>

        {error ? (
          <ZenSection>
            <ZenCard variant="subtle" className="border-zen-danger/30 bg-zen-danger-soft text-center">
              <p className="zen-body text-zen-danger">{error}</p>
            </ZenCard>
          </ZenSection>
        ) : null}

        <ZenSection>
          {overview?.dailyFocus ? (
            <DailyFocusCard focus={overview.dailyFocus} />
          ) : !dashboardLoading ? (
            <ZenCard variant="subtle" className="text-center border-dashed border-zen-primary/30">
              <p className="zen-body text-zen-primary">
                Set your intention anytime — choose a practice while we line up a fresh daily focus.
              </p>
            </ZenCard>
          ) : (
            <ZenSkeletonCard className="min-h-[8rem]" />
          )}
        </ZenSection>

        <ZenSection>
          <ZenBento>
            <ZenBentoItem>
              {streak ? (
                <ZenStreakGarden streakData={streak} onWater={handleWaterGarden} />
              ) : (
                <ZenSkeletonCard className="min-h-[12rem]" />
              )}
            </ZenBentoItem>
            <ZenBentoItem>
              {showPSSCard ? (
                pss ? (
                  <PSSCheck pssData={pss} />
                ) : (
                  <ZenSkeletonCard className="min-h-[12rem]" />
                )
              ) : (
                <ZenCard variant="standard" className="h-full flex items-center justify-center">
                  <p className="zen-body-sm text-zen-fg-muted text-center py-3">
                    Next stress check-in in {daysNextPSS} day{daysNextPSS === 1 ? '' : 's'}
                  </p>
                </ZenCard>
              )}
            </ZenBentoItem>
            <ZenBentoItem>
              <JournalPreview entries={entries} loading={dashboardLoading} />
            </ZenBentoItem>
          </ZenBento>
        </ZenSection>

        <ZenSection>
          <h2 className="zen-h2 text-zen-fg text-center mb-8">Your Wellness Space</h2>
          {dashboardLoading && !modules.length ? (
            <ZenGrid cols={3}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <ZenSkeletonCard key={idx} className="min-h-[10rem]" />
              ))}
            </ZenGrid>
          ) : (
            <ZenGrid cols={3}>
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </ZenGrid>
          )}
        </ZenSection>
      </ZenContainer>
    </ZenPage>
  );
};

export default HomePage;
