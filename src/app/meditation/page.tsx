'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import ZenFocusMode from '@/components/layout/ZenFocusMode';
import { apiClient } from '@/lib/apiClient';
import type { Meditation } from '@/lib/types';
import { toast } from 'sonner';
import { trackEngagement } from '@/lib/signals';
import { cn } from '@/lib/utils';
import {
  ZenPage,
  ZenContainer,
  ZenSection,
  ZenButton,
  ZenSoundscapeBar,
} from '@/components/zen';
import { resolveGuidedAudioUrl } from '@/lib/meditationAudio';

function JPMRPlayer({ session }: { session: Meditation }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedRef = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setLoaded(true);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setCompleted(true);
      trackEngagement('meditation_jpmr', 'completed',
        Math.round((Date.now() - startTime.current) / 1000));
      apiClient.logMeditationSession({
          meditationId: session.id,
          durationSeconds: Math.round(audio.duration || (session.durationMinutes * 60)),
      }).catch(console.error);
    };

    audio.addEventListener('loadeddata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [session.id, session.durationMinutes]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!startedRef.current) {
      trackEngagement('meditation_jpmr', 'opened');
      startedRef.current = true;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const steps = [
    { muscle: 'Hands & Forearms', instruction: 'Clench your fists tightly for 5 seconds, then release completely' },
    { muscle: 'Upper Arms', instruction: 'Flex your biceps, hold for 5 seconds, then let go' },
    { muscle: 'Shoulders', instruction: 'Raise shoulders to ears, hold for 5 seconds, then drop' },
    { muscle: 'Face', instruction: 'Scrunch all facial muscles tightly, hold, then relax' },
    { muscle: 'Chest & Stomach', instruction: 'Take a deep breath, hold and tighten core, then exhale fully' },
    { muscle: 'Legs & Feet', instruction: 'Tense thighs, calves and curl toes, hold, then release' },
  ];

  const audioUrl = resolveGuidedAudioUrl(session.title, session.audioUrl);

  return (
    <div className="max-w-xl mx-auto">
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl || ''} preload="metadata" />

      {/* Main player card */}
      <div className="rounded-3xl overflow-hidden shadow-2xl mb-6"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)' }}>

        {/* Visual: breathing orb */}
        <div className="flex items-center justify-center" style={{ height: 260 }}>
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            {playing && [1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-purple-300"
                style={{ width: 80 + i * 50, height: 80 + i * 50 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.2 }}
              />
            ))}

            {/* Play/pause button orb */}
            <motion.button
              onClick={togglePlay}
              className="relative z-10 flex items-center justify-center rounded-full shadow-2xl"
              style={{
                width: 90, height: 90,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              {playing ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* Track info */}
        <div className="px-6 pb-2 text-center">
          <h2 className="text-lg font-semibold text-white mb-0.5">{session.title}</h2>
          <p className="text-xs text-purple-200">{session.durationMinutes} min · Relaxation · Beginner</p>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-6 mt-4">
          <div
            className="w-full rounded-full cursor-pointer mb-2"
            style={{ height: 6, background: 'rgba(255,255,255,0.15)' }}
            onClick={handleSeek}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-purple-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#f8f6ff', border: '1px solid #e5e7eb' }}>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">About this practice</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{session.description}</p>
      </div>

      {/* Step guide */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#f8f6ff', border: '1px solid #e5e7eb' }}>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Muscle group sequence</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: '#7c3aed' }}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{step.muscle}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.instruction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 text-center mb-6"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}
          >
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="font-semibold text-green-800 mb-1">Session complete</h3>
            <p className="text-sm text-green-700">Your body has been heard and released. Rest in this stillness for a moment.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="rounded-2xl p-5"
        style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <h3 className="text-sm font-semibold text-amber-800 mb-3">Tips for best results</h3>
        <ul className="space-y-1.5">
          {[
            'Lie down or sit in a comfortable chair',
            'Find a quiet space where you won\'t be disturbed',
            'Remove glasses or contacts if comfortable',
            'Practice daily for 2 weeks to see lasting results',
            'Best done before sleep or after a stressful event',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
              <span className="mt-0.5">✦</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const MeditationPageInner = () => {
  const { user } = useAuth();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeditations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getMeditations();
      setMeditations(result);
    } catch (err) {
      console.error('Failed to load meditations', err);
      setError('We could not load guided sessions. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadMeditations();
  }, [user, loadMeditations]);

  const displayName = useMemo(() => {
    if (!user) return 'traveler';
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? 'traveler';
  }, [user]);

  return (
    <ZenFocusMode title="Meditate">
      <ZenPage atmosphere="focus" gradient className="min-h-dvh pt-16">
        <ZenSoundscapeBar />
        <ZenContainer maxWidth="xl" className={cn('py-8 md:pl-56')}>
          <ZenSection>
            <header className="text-center mb-6">
              <p className="zen-label text-zen-secondary">Guided stillness for {displayName}</p>
              <h1 className="zen-h1 text-zen-fg mt-2">Find your inner peace</h1>
              <p className="mt-3 max-w-2xl mx-auto zen-body text-zen-fg-muted">
                Choose a guided practice or layer ambient sounds for the atmosphere you need.
              </p>
            </header>
          </ZenSection>

          {error ? (
            <ZenSection>
              <div className="max-w-xl mx-auto rounded-zen-xl border border-zen-danger/25 bg-zen-danger-soft px-6 py-4 text-center text-zen-danger">
                <p className="mb-4">{error}</p>
                <ZenButton variant="outline" onClick={loadMeditations}>
                  Try again
                </ZenButton>
              </div>
            </ZenSection>
          ) : null}

          <ZenSection>
            {loading ? (
              <div className="text-center text-zen-fg-muted py-20">Loading session...</div>
            ) : meditations.length > 0 ? (
              <JPMRPlayer session={meditations[0]} />
            ) : (
              <div className="rounded-zen-xl border border-dashed border-zen-secondary/30 bg-zen-secondary-soft px-8 py-12 text-center text-zen-secondary">
                No guided meditations are available yet. Check back soon.
              </div>
            )}
          </ZenSection>
        </ZenContainer>
      </ZenPage>
    </ZenFocusMode>
  );
};

export default function MeditationPage() {
  return (
    <RequireAuth>
      <MeditationPageInner />
    </RequireAuth>
  );
}
