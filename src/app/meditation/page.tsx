'use client';

import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import type { Meditation } from '@/lib/types';
import { toast } from 'sonner';
import { Flame, CloudRain, Waves, TreePine, Play, Headphones, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SoundType = 'fire' | 'rain' | 'forest' | 'ocean';

const FogBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-900">
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
    <div className="absolute top-0 -left-full w-[300%] h-32 bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent blur-3xl animate-fog-drift" style={{ animationDelay: '0s' }} />
    <div className="absolute top-1/3 -left-full w-[300%] h-40 bg-gradient-to-r from-transparent via-teal-900/15 to-transparent blur-3xl animate-fog-drift" style={{ animationDelay: '10s' }} />
    <div className="absolute top-2/3 -left-full w-[300%] h-36 bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent blur-3xl animate-fog-drift" style={{ animationDelay: '20s' }} />
    {[...Array(8)].map((_, i) => (
      <div key={i} className="absolute text-2xl opacity-0 animate-leaf-fall" style={{ left: `${i * 15 + 5}%`, animationDelay: `${i * 1.5}s`, animationDuration: `${12 + (i % 3) * 2}s`, color: 'rgba(110, 231, 183, 0.4)' }}>
        🍂
      </div>
    ))}
  </div>
);

const SoundscapeSliders = () => {
  const [volumes, setVolumes] = useState({ fire: 0, rain: 0, forest: 0, ocean: 0 });
  const fireRef = useRef<HTMLAudioElement>(null);
  const rainRef = useRef<HTMLAudioElement>(null);
  const forestRef = useRef<HTMLAudioElement>(null);
  const oceanRef = useRef<HTMLAudioElement>(null);

  const handleVolumeChange = (sound: SoundType, event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(event.target.value, 10);
    setVolumes((prev) => ({ ...prev, [sound]: newVolume }));
  };

  useEffect(() => {
    Object.entries(volumes).forEach(([sound, volume]) => {
      let audio: HTMLAudioElement | null = null;
      switch (sound as SoundType) {
        case 'fire':
          audio = fireRef.current;
          break;
        case 'rain':
          audio = rainRef.current;
          break;
        case 'forest':
          audio = forestRef.current;
          break;
        case 'ocean':
          audio = oceanRef.current;
          break;
      }

      if (audio) {
        if (volume > 0 && audio.paused) {
          audio.play().catch((error) => console.warn(`Could not play ${sound} audio:`, error));
        }
        audio.volume = volume / 100;
        if (volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [volumes]);

  const soundControls = [
    { type: 'fire', icon: <Flame className="w-5 h-5 text-orange-400" />, sliderClass: 'slider-fire' },
    { type: 'rain', icon: <CloudRain className="w-5 h-5 text-blue-400" />, sliderClass: 'slider-rain' },
    { type: 'forest', icon: <TreePine className="w-5 h-5 text-green-400" />, sliderClass: 'slider-forest' },
    { type: 'ocean', icon: <Waves className="w-5 h-5 text-cyan-400" />, sliderClass: 'slider-ocean' }
  ] as const;

  return (
    <>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 text-gray-300">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            {soundControls.map(({ type, icon, sliderClass }) => (
              <label key={type} className="flex items-center gap-3">
                <span className="flex-shrink-0">{icon}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes[type]}
                  onChange={(e) => handleVolumeChange(type, e)}
                  className={`w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb ${sliderClass}`}
                />
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-widest w-12 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <audio ref={fireRef} src="/audio/fire.mp3" loop preload="none" />
      <audio ref={rainRef} src="/audio/rain.mp3" loop preload="none" />
      <audio ref={forestRef} src="/audio/forest.mp3" loop preload="none" />
      <audio ref={oceanRef} src="/audio/ocean.mp3" loop preload="none" />
    </>
  );
};

interface MeditationPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  meditation: Meditation | null;
  onSessionLogged: (durationSeconds: number) => Promise<void>;
}

const MeditationPlayerModal = ({ isOpen, onClose, meditation, onSessionLogged }: MeditationPlayerModalProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasLoggedRef = useRef(false);

  const durationSeconds = useMemo(() => {
    const minutes = meditation?.durationMinutes ?? 0;
    return Math.max(60, Math.round(minutes * 60));
  }, [meditation?.durationMinutes]);

  const resetState = () => {
    hasLoggedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const ensureLogged = async () => {
    if (!meditation || hasLoggedRef.current) {
      return;
    }

    hasLoggedRef.current = true;
    await onSessionLogged(durationSeconds);
  };

  const handlePlay = async () => {
    await ensureLogged();
  };

  const handleManualComplete = async () => {
    await ensureLogged();
    toast.success('Session marked complete');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {meditation ? (
          <>
            <DialogHeader>
              <DialogTitle>{meditation.title}</DialogTitle>
              <DialogDescription>
                {meditation.description ?? 'Press play to begin and we’ll save this practice for your streak.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900 mb-1">Session details</p>
                <p>{meditation.durationMinutes} min • {meditation.category}</p>
              </div>
              {meditation.audioUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Headphones className="h-4 w-4" /> Bring your best headphones for the full effect.
                  </div>
                  <audio
                    ref={audioRef}
                    className="w-full"
                    controls
                    src={meditation.audioUrl}
                    onPlay={handlePlay}
                    onEnded={() => toast.success('How do you feel?', { description: 'Take a moment to journal what surfaced.' })}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-emerald-700">
                  Audio is coming soon for this session. You can still log it manually below.
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0 sm:justify-between">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handleManualComplete} disabled={hasLoggedRef.current}>
                {hasLoggedRef.current ? 'Logged' : 'Mark complete'}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const MeditationCard = ({ meditation, index, onStart }: { meditation: Meditation; index: number; onStart: (meditation: Meditation) => void }) => {
  const image = meditation.imageUrl;

  return (
    <button
      type="button"
      onClick={() => onStart(meditation)}
      className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/80 shadow-lg transition-all duration-300 hover:border-emerald-500/80 hover:scale-105 text-left"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="relative h-40 w-full">
        {image ? (
          <Image
            src={image}
            alt={meditation.title}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 via-slate-800 to-slate-900" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-lg font-bold text-white">{meditation.title}</h3>
        <p className="text-sm text-gray-300">{meditation.durationMinutes} min • {meditation.category}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="flex items-center justify-center w-16 h-16 bg-emerald-500/80 rounded-full text-white backdrop-blur-sm">
          <Play className="w-8 h-8 fill-current" />
        </span>
      </div>
    </button>
  );
};

const MeditationPageInner = () => {
  const { user } = useAuth();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    if (!user) {
      return;
    }
    void loadMeditations();
  }, [user, loadMeditations]);

  const handleStartMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMeditation(null);
  };

  const handleSessionLogged = useCallback(async (durationSeconds: number) => {
    if (!selectedMeditation) {
      return;
    }

    try {
      await apiClient.logMeditationSession({ meditationId: selectedMeditation.id, durationSeconds });
      await apiClient.recordActivity('meditation', { meditationId: selectedMeditation.id, durationSeconds });
      toast.success('Meditation saved', {
        description: 'Session added to your streak and insights.'
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to record meditation session', error);
      toast.error('We could not save this meditation. Please try again.');
    }
  }, [selectedMeditation]);

  const displayName = useMemo(() => {
    if (!user) return 'traveler';
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? 'traveler';
  }, [user]);

  return (
    <>
      <FogBackground />
      <SoundscapeSliders />
      <main className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:pl-48 xl:pl-64">
        <header className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">Guided stillness for {displayName}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-300 mb-4">
            Find Your Inner Peace
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Select a guided practice below or layer in ambient sounds to craft the perfect meditation atmosphere.
          </p>
        </header>

        {error ? (
          <div className="max-w-xl mx-auto mb-10 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700">
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={loadMeditations}>
              Try again
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4 space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : meditations.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {meditations.map((meditation, index) => (
              <MeditationCard key={meditation.id} meditation={meditation} index={index} onStart={handleStartMeditation} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-emerald-300/40 bg-emerald-400/10 px-8 py-12 text-center text-emerald-100">
            No guided meditations are available yet. Check back soon — new practices arrive regularly.
          </div>
        )}
      </main>

      <MeditationPlayerModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        meditation={selectedMeditation}
        onSessionLogged={handleSessionLogged}
      />
    </>
  );
};

export default function MeditationPage() {
  return (
    <RequireAuth>
      <MeditationPageInner />
    </RequireAuth>
  );
}