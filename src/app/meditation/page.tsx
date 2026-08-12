'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import ZenFocusMode from '@/components/layout/ZenFocusMode';
import { apiClient } from '@/lib/apiClient';
import type { Meditation } from '@/lib/types';
import { toast } from 'sonner';
import { Play } from 'lucide-react';
import { trackEngagement } from '@/lib/signals';
import { resolveGuidedAudioUrl } from '@/lib/meditationAudio';
import { cn } from '@/lib/utils';
import {
  ZenPage,
  ZenContainer,
  ZenSection,
  ZenGrid,
  ZenCard,
  ZenCardTitle,
  ZenButton,
  ZenSkeletonCard,
  ZenSoundscapeBar,
  ZenGuidedPlayer,
  ZenDialog,
  ZenDialogContent,
  ZenDialogHeader,
  ZenDialogTitle,
  ZenDialogDescription,
  ZenDialogFooter,
} from '@/components/zen';

interface MeditationPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  meditation: Meditation | null;
  onSessionLogged: (durationSeconds: number) => Promise<void>;
}

const MeditationPlayerModal = ({
  isOpen,
  onClose,
  meditation,
  onSessionLogged,
}: MeditationPlayerModalProps) => {
  const hasLoggedRef = useRef(false);
  const [logged, setLogged] = useState(false);

  const durationSeconds = useMemo(() => {
    const minutes = meditation?.durationMinutes ?? 0;
    return Math.max(60, Math.round(minutes * 60));
  }, [meditation?.durationMinutes]);

  const guidedUrl = meditation
    ? resolveGuidedAudioUrl(meditation.title, meditation.audioUrl)
    : null;

  const resetState = () => {
    hasLoggedRef.current = false;
    setLogged(false);
  };

  const ensureLogged = async () => {
    if (!meditation || hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    setLogged(true);
    await onSessionLogged(durationSeconds);
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
    <ZenDialog open={isOpen} onOpenChange={handleOpenChange}>
      <ZenDialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto w-[calc(100vw-1.5rem)]">
        {meditation ? (
          <>
            <ZenDialogHeader>
              <ZenDialogTitle>{meditation.title}</ZenDialogTitle>
              <ZenDialogDescription>
                {meditation.description ??
                  'Press play to begin. Ambient sounds stay available behind this dialog.'}
              </ZenDialogDescription>
            </ZenDialogHeader>
            <ZenGuidedPlayer
              title={meditation.title}
              audioUrl={guidedUrl}
              category={meditation.category}
              durationMinutes={meditation.durationMinutes}
              onPlayStart={() => {
                void ensureLogged();
              }}
              onComplete={() => {
                toast.success('How do you feel?', {
                  description: 'Take a moment to journal what surfaced.',
                });
              }}
            />
            <ZenDialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
              <ZenButton variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Close
              </ZenButton>
              <ZenButton
                onClick={handleManualComplete}
                disabled={logged}
                className="w-full sm:w-auto"
              >
                {logged ? 'Logged' : 'Mark complete'}
              </ZenButton>
            </ZenDialogFooter>
          </>
        ) : null}
      </ZenDialogContent>
    </ZenDialog>
  );
};

const MeditationCard = ({
  meditation,
  onStart,
}: {
  meditation: Meditation;
  onStart: (meditation: Meditation) => void;
}) => {
  const image = meditation.imageUrl;

  return (
    <button
      type="button"
      onClick={() => onStart(meditation)}
      className="group text-left w-full"
      aria-label={`Start ${meditation.title}`}
    >
      <ZenCard
        variant="interactive"
        padding="none"
        className="overflow-hidden pointer-events-none"
      >
        <div className="relative h-40 w-full bg-zen-secondary-soft">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover opacity-80 group-hover:opacity-95 transition-opacity"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zen-secondary-soft via-zen-primary-soft to-zen-bg" />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-zen-fast bg-zen-fg/10 sm:bg-zen-fg/20">
            <span className="flex items-center justify-center w-14 h-14 min-h-11 min-w-11 bg-zen-primary rounded-full text-white shadow-zen-card">
              <Play className="w-6 h-6 fill-current" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="p-4">
          <ZenCardTitle className="text-base">{meditation.title}</ZenCardTitle>
          <p className="zen-caption text-zen-fg-muted mt-1">
            {meditation.durationMinutes} min · {meditation.category}
          </p>
        </div>
      </ZenCard>
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

  useEffect(() => {
    trackEngagement('meditation_jpmr', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('meditation_jpmr', 'completed', duration);
    };
  }, []);

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

  const handleStartMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMeditation(null);
  };

  const handleSessionLogged = useCallback(
    async (durationSeconds: number) => {
      if (!selectedMeditation) return;

      try {
        await apiClient.logMeditationSession({
          meditationId: selectedMeditation.id,
          durationSeconds,
        });
        await apiClient.recordActivity('meditation', {
          meditationId: selectedMeditation.id,
          durationSeconds,
        });
        toast.success('Meditation saved', {
          description: 'Session added to your streak and insights.',
        });
        handleCloseModal();
      } catch (error) {
        console.error('Failed to record meditation session', error);
        toast.error('We could not save this meditation. Please try again.');
      }
    },
    [selectedMeditation],
  );

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
            <header className="text-center mb-2">
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
              <ZenGrid cols={3} gap="lg">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ZenSkeletonCard key={index} className="min-h-[14rem]" />
                ))}
              </ZenGrid>
            ) : meditations.length ? (
              <ZenGrid cols={3} gap="lg">
                {meditations.map((meditation) => (
                  <MeditationCard
                    key={meditation.id}
                    meditation={meditation}
                    onStart={handleStartMeditation}
                  />
                ))}
              </ZenGrid>
            ) : (
              <div className="rounded-zen-xl border border-dashed border-zen-secondary/30 bg-zen-secondary-soft px-8 py-12 text-center text-zen-secondary">
                No guided meditations are available yet. Check back soon.
              </div>
            )}
          </ZenSection>
        </ZenContainer>

        <MeditationPlayerModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          meditation={selectedMeditation}
          onSessionLogged={handleSessionLogged}
        />
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
