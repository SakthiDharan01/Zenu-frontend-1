"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Brain,
  Compass,
  Heart,
  PartyPopper,
  PenTool,
  Sparkles,
  Sprout,
  TreeDeciduous,
  Wand2,
  Wind
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import type {
  DailyFocus,
  HomeOverview,
  JournalEntry,
  ModuleRecord,
  PSSData,
  StreakData
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { StreakGarden } from '@/components/StreakGarden';
import { PSSCheck } from '@/components/PSSCheck';

type ModuleVisual = {
  href: string;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const moduleVisuals: Record<string, ModuleVisual> = {
  breathing: { href: '/breathing', color: 'bg-blue-100 text-blue-600', icon: Wind },
  meditation: { href: '/meditation', color: 'bg-purple-100 text-purple-600', icon: Brain },
  journal: { href: '/journal', color: 'bg-rose-100 text-rose-600', icon: BookOpen },
  gratitude: { href: '/gratitude', color: 'bg-emerald-100 text-emerald-600', icon: Heart },
  mandala: { href: '/art', color: 'bg-indigo-100 text-indigo-600', icon: Wand2 },
  bubble: { href: '/bubbles', color: 'bg-yellow-100 text-yellow-600', icon: Sparkles },
  burst: { href: '/burst', color: 'bg-red-100 text-red-600', icon: PartyPopper },
  scribble: { href: '/scribble', color: 'bg-violet-100 text-violet-600', icon: PenTool },
  chatbot: { href: '/chat', color: 'bg-cyan-100 text-cyan-600', icon: Bot },
  garden: { href: '/meditation', color: 'bg-green-100 text-green-600', icon: TreeDeciduous },
  compass: { href: '/innercompass', color: 'bg-slate-100 text-slate-600', icon: Compass }
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
          apiClient.getJournalEntries({ limit: 3 })
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
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return {
    overview,
    streak,
    pss,
    entries,
    loading,
    error,
    setStreak,
    setPss
  };
};

const LandingHero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center">
      <div className="container mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-600 px-4 py-2 text-sm font-medium mb-6">
              <Heart className="h-4 w-4" /> Crafted for Student Calm
            </span>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Breathe in clarity. Breathe out overwhelm.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              ZenU is your sanctuary to manage stress, cultivate resilience, and reconnect with joy. Sign in to unlock guided breathing, mindful art, journaling prompts, and an AI companion who listens without judgement.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-0.5"
              >
                Sign in to begin
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition"
              >
                Create an account
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-6 text-sm text-gray-600">
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm">
                <Sprout className="h-6 w-6 text-emerald-500 mb-2" />
                Micro-practices under 5 minutes to reset between classes.
              </div>
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm">
                <TreeDeciduous className="h-6 w-6 text-purple-500 mb-2" />
                Track streaks, moods, and celebrate gentle growth.
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-3xl blur-3xl opacity-40" />
            <div className="relative bg-white rounded-3xl shadow-xl border border-white/60 p-8 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daily practices on autopilot</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  Box breathing guides, streak garden, and journal prompts curated for you.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                  Chat with Seviyan, a AI-powered companion who remembers your reflections.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-pink-500" />
                  Everything lives in private, encrypted storage — only you can see it.
                </li>
              </ul>
              <Link href="/signin" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                Peek inside ZenU <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, index }: { module: ModuleRecord; index: number }) => {
  const visual = moduleVisuals[module.id] ?? {
    href: '/#',
    color: 'bg-gray-100 text-gray-600',
    icon: Heart
  };
  const Icon = visual.icon;

  return (
    <div
      className="group transition-transform duration-500"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <Link href={visual.href}>
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full cursor-pointer hover:-translate-y-2">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300', visual.color)}>
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            {module.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {module.description ?? 'Explore calming practices at your own pace.'}
          </p>
        </div>
      </Link>
    </div>
  );
};

const DailyFocusCard = ({ focus }: { focus: DailyFocus | null }) => {
  if (!focus) return null;
  const minutes = Math.round(focus.durationSeconds / 60);
  return (
    <div className="bg-white rounded-3xl border border-white/60 shadow-lg p-8 mb-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-blue-500">Daily focus</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2">{focus.title}</h2>
          <p className="text-gray-600 mt-3 max-w-xl">{focus.description}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <span className="text-4xl font-bold text-blue-600">{minutes} min</span>
          <Link
            href={moduleVisuals[focus.moduleId ?? 'breathing']?.href ?? '/breathing'}
            className="inline-flex items-center px-5 py-3 rounded-full bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition"
          >
            {focus.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const JournalPreview = ({ entries, loading }: { entries: JournalEntry[]; loading: boolean }) => {
  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse" />;
  }

  if (!entries.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent reflections</h3>
        <p className="text-sm text-gray-500">Your next entry awaits. Tap the + button in the journal to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Recent reflections</h3>
        <Link href="/journal" className="text-sm text-blue-600 hover:text-blue-700">Open journal</Link>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700 mt-1 line-clamp-2">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    overview,
    streak,
    pss,
    entries,
    loading: dashboardLoading,
    error,
    setStreak
  } = useHomeData(Boolean(user));
  const [showMandatoryPssPrompt, setShowMandatoryPssPrompt] = useState(false);

  const modules = useMemo(() => overview?.modules ?? [], [overview]);

  useEffect(() => {
    if (!user || dashboardLoading) {
      setShowMandatoryPssPrompt(false);
      return;
    }

    const lastCompletedStr = localStorage.getItem('zenu_pss_last_completed');
    if (!lastCompletedStr) {
      setShowMandatoryPssPrompt(true);
      return;
    }

    const lastCompleted = new Date(lastCompletedStr);
    const now = new Date();
    const diffMs = now.getTime() - lastCompleted.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    setShowMandatoryPssPrompt(diffDays >= 7);
  }, [user, dashboardLoading]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="h-14 w-14 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!user && !authLoading) {
    return <LandingHero />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showMandatoryPssPrompt ? (
        <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-3xl bg-white shadow-2xl border border-white/60 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Weekly stress check-in required</h2>
            <p className="text-gray-600 mt-3">
              Please complete this week&apos;s PSS assessment before using other modules.
            </p>
            <button
              type="button"
              onClick={() => router.push('/assessment')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700"
            >
              Start this week&apos;s PSS
            </button>
          </div>
        </div>
      ) : null}

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12">
          <p className="text-sm text-blue-500 font-medium uppercase tracking-widest">Welcome back</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Hey {user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? 'friend'}, you&apos;re safe here.
          </h1>
          <p className="mt-4 text-lg text-gray-600">Pick a practice below or follow today&apos;s focus to keep your nervous system steady.</p>
        </div>

        {error ? (
          <div className="max-w-3xl mx-auto mb-12 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
            {error}
          </div>
        ) : null}

        {overview?.dailyFocus ? (
          <DailyFocusCard focus={overview.dailyFocus} />
        ) : !dashboardLoading ? (
          <div className="bg-white rounded-3xl border border-dashed border-blue-200 text-blue-500 text-center p-10 mb-12 max-w-3xl mx-auto">
            Set your intention anytime — select a practice below while we line up a fresh daily focus for you.
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {streak ? (
            <StreakGarden streakData={streak} onWater={handleWaterGarden} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse" />
          )}
          {pss ? (
            <PSSCheck pssData={pss} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse" />
          )}
          <JournalPreview entries={entries} loading={dashboardLoading} />
        </div>

        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-10">Your wellness toolkit</h2>
        {dashboardLoading && !modules.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <ModuleCard key={module.id} module={module} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;