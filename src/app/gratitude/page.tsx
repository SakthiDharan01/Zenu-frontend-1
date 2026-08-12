"use client";

import PandaJar from '@/components/gratitude/PandaJar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { trackEngagement } from '@/lib/signals';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import PandaAvatar from '@/components/PandaAvatar';
import { apiClient } from '@/lib/apiClient';
import type { GratitudeEntry, GratitudeFeedback, GratitudeOverallReview } from '@/lib/types';
import {
  ZenPage,
  ZenContainer,
  ZenSection,
  ZenButton,
  ZenInput,
  ZenTextarea,
  ZenSkeleton,
  ZenDialog,
  ZenDialogContent,
  ZenDialogHeader,
  ZenDialogTitle,
  ZenDialogDescription,
  ZenDialogFooter,
} from '@/components/zen';

const EntryComposer = ({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { title: string; content: string }) => Promise<void>;
  submitting: boolean;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle('');
      setContent('');
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Write a few lines before saving your gratitude note.');
      return;
    }
    await onSubmit({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <ZenDialog open={open} onOpenChange={handleClose}>
      <ZenDialogContent className="sm:max-w-xl">
        <ZenDialogHeader>
          <ZenDialogTitle className="font-serif">Add a gratitude note</ZenDialogTitle>
          <ZenDialogDescription>
            Write what happened today and why you feel thankful for it.
          </ZenDialogDescription>
        </ZenDialogHeader>

        <div className="space-y-4 my-2">
          <ZenInput
            label="Short title (optional)"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="A tiny win from today"
            maxLength={120}
          />
          <ZenTextarea
            label="Your gratitude note"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Today I felt thankful because…"
            maxLength={5000}
            rows={8}
            className="font-serif"
          />
        </div>

        <ZenDialogFooter>
          <ZenButton variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </ZenButton>
          <ZenButton variant="accent" onClick={() => void handleSave()} loading={submitting}>
            Save to jar
          </ZenButton>
        </ZenDialogFooter>
      </ZenDialogContent>
    </ZenDialog>
  );
};

const GratitudePageInner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [picking, setPicking] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<GratitudeFeedback | null>(null);
  const [overallReview, setOverallReview] = useState<GratitudeOverallReview | null>(null);
  const [pickedDialogOpen, setPickedDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    id: string;
    content: string;
    emoji?: string;
  } | null>(null);

  useEffect(() => {
    trackEngagement('journal_gratitude', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('journal_gratitude', 'completed', duration);
    };
  }, []);

  const handlePickRandom = () => {
    if (!entries?.length) return;
    const random = entries[Math.floor(Math.random() * entries.length)];
    setSelectedNote({ id: random.id, content: random.content });
  };

  const handleCloseNote = () => setSelectedNote(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setSelectedFeedback(null);
    setOverallReview(null);
    setPickedDialogOpen(false);
    setReviewDialogOpen(false);
    try {
      const data = await apiClient.getGratitudeEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load gratitude entries', error);
      toast.error('Unable to load your gratitude jar right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadEntries();
  }, [user, loadEntries]);

  const handleCreateEntry = async (input: { title: string; content: string }) => {
    setSubmitting(true);
    try {
      const created = await apiClient.createGratitudeEntry({
        title: input.title.trim() ? input.title.trim() : null,
        content: input.content.trim(),
      });
      setEntries((prev) => [created, ...prev]);
      setComposerOpen(false);
      toast.success('Gratitude note saved in your jar.');
      await apiClient.recordActivity('gratitude', { entryId: created.id });
    } catch (error) {
      console.error('Failed to create gratitude entry', error);
      toast.error('Could not save this gratitude note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRandomPick = async () => {
    if (!entries.length) {
      toast.message('Your jar is still empty. Add your first gratitude note.');
      return;
    }
    setPicking(true);
    setOverallReview(null);
    setReviewDialogOpen(false);
    try {
      const result = await apiClient.getRandomGratitudeFeedback();
      setSelectedFeedback(result);
      setPickedDialogOpen(true);
      await apiClient.recordActivity('gratitude', {
        action: 'random_reflection',
        entryId: result.entry.id,
        thankfulnessScore: result.thankfulnessScore,
      });
    } catch (error) {
      console.error('Failed to fetch random gratitude feedback', error);
      toast.error('Could not pull a random reflection right now.');
    } finally {
      setPicking(false);
    }
  };

  const handleOverallReview = async () => {
    if (!entries.length) {
      toast.message('Add a few entries first to generate an overall review.');
      return;
    }
    setReviewing(true);
    setSelectedFeedback(null);
    setPickedDialogOpen(false);
    try {
      const result = await apiClient.getOverallGratitudeReview();
      setOverallReview(result);
      setReviewDialogOpen(true);
      await apiClient.recordActivity('gratitude', {
        action: 'overall_review',
        entriesCount: result.entriesCount,
      });
    } catch (error) {
      console.error('Failed to fetch overall gratitude review', error);
      toast.error('Could not generate the overall review now.');
    } finally {
      setReviewing(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await apiClient.deleteGratitudeEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setSelectedFeedback((prev) => (prev?.entry.id === id ? null : prev));
      toast.success('Entry removed from your jar.');
    } catch (error) {
      console.error('Failed to delete gratitude entry', error);
      toast.error('Could not delete this entry.');
    }
  };

  const handleDeleteFromPickedDialog = async () => {
    if (!selectedFeedback?.entry?.id) return;
    await handleDeleteEntry(selectedFeedback.entry.id);
    setPickedDialogOpen(false);
  };

  const greetingName = useMemo(() => {
    if (!user) return 'friend';
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? 'friend';
  }, [user]);

  return (
    <ZenPage atmosphere="renewal" gradient className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="xl" className="pt-8 pb-10 md:pt-12">
        <ZenSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 glass rounded-zen-xl p-6 sm:p-8">
            <PandaAvatar state="gratitude" size={72} label="Panda celebrating gratitude" />
            <div className="min-w-0 flex-1">
              <p className="zen-label text-zen-accent">Hello {greetingName}</p>
              <h1 className="zen-h1 text-zen-fg font-serif mt-1">Your gratitude jar</h1>
              <p className="zen-body-sm text-zen-fg-muted mt-2 max-w-xl">
                Add one thankful note at a time. Tap the jar to rediscover a moment you saved.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ZenButton variant="accent" size="lg" onClick={() => setComposerOpen(true)}>
                  Add gratitude note
                </ZenButton>
                <ZenButton
                  variant="ghost"
                  onClick={() => void handleRandomPick()}
                  loading={picking}
                  disabled={!entries.length}
                >
                  Pick a paper
                </ZenButton>
                <ZenButton
                  variant="outline"
                  onClick={() => void handleOverallReview()}
                  loading={reviewing}
                  disabled={!entries.length}
                >
                  Jar review
                </ZenButton>
              </div>
            </div>
          </div>
        </ZenSection>

        <ZenSection>
          {loading ? (
            <ZenSkeleton className="h-80 w-full" rounded="2xl" />
          ) : (
            <div className="rounded-zen-2xl bg-zen-accent-soft/60 border border-zen-accent/15 p-6 shadow-zen-subtle">
              <PandaJar
                notes={entries.map((e) => ({ id: e.id, content: e.content }))}
                onPickRandom={handlePickRandom}
                onAddNew={() => setComposerOpen(true)}
                selectedNote={selectedNote}
                onCloseNote={handleCloseNote}
              />
            </div>
          )}
        </ZenSection>
      </ZenContainer>

      <EntryComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onSubmit={handleCreateEntry}
        submitting={submitting}
      />

      <ZenDialog open={pickedDialogOpen} onOpenChange={setPickedDialogOpen}>
        <ZenDialogContent className="sm:max-w-2xl">
          <ZenDialogHeader>
            <ZenDialogTitle className="flex items-center gap-2 font-serif">
              <Sparkles className="h-5 w-5 text-zen-accent" aria-hidden="true" />
              Picked reflection
            </ZenDialogTitle>
            <ZenDialogDescription>A random gratitude paper opened from your jar.</ZenDialogDescription>
          </ZenDialogHeader>

          {selectedFeedback ? (
            <motion.div
              key={selectedFeedback.entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-zen-xl border border-zen-accent/20 bg-zen-accent-soft p-4">
                <p className="zen-caption text-zen-accent">Paper from jar</p>
                <p className="mt-1 zen-h3 text-zen-fg font-serif">
                  {selectedFeedback.entry.title ?? 'Untitled note'}
                </p>
                <p className="mt-2 whitespace-pre-wrap zen-body-sm text-zen-fg font-serif">
                  {selectedFeedback.entry.content}
                </p>
              </div>
              <div className="rounded-zen-xl border border-zen-primary/20 bg-zen-primary-soft p-4">
                <p className="zen-body-sm font-medium text-zen-primary">
                  Thankfulness score: {selectedFeedback.thankfulnessScore}/10
                </p>
                <p className="mt-2 whitespace-pre-wrap zen-body-sm text-zen-fg">
                  {selectedFeedback.feedback}
                </p>
              </div>
            </motion.div>
          ) : (
            <ZenSkeleton className="h-40 w-full" rounded="xl" />
          )}

          <ZenDialogFooter>
            <ZenButton variant="outline" onClick={() => setPickedDialogOpen(false)}>
              Close
            </ZenButton>
            <ZenButton
              variant="destructive"
              onClick={() => void handleDeleteFromPickedDialog()}
              disabled={!selectedFeedback?.entry?.id}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete note
            </ZenButton>
          </ZenDialogFooter>
        </ZenDialogContent>
      </ZenDialog>

      <ZenDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <ZenDialogContent className="sm:max-w-2xl">
          <ZenDialogHeader>
            <ZenDialogTitle className="flex items-center gap-2 font-serif">
              <WandSparkles className="h-5 w-5 text-zen-secondary" aria-hidden="true" />
              Overall jar review
            </ZenDialogTitle>
            <ZenDialogDescription>
              A summary of your gratitude trend across saved papers.
            </ZenDialogDescription>
          </ZenDialogHeader>

          {overallReview ? (
            <div className="space-y-3">
              <p className="zen-body-sm text-zen-secondary">
                Entries analyzed: {overallReview.entriesCount}
              </p>
              <p className="whitespace-pre-wrap zen-body-sm text-zen-fg font-serif">
                {overallReview.review}
              </p>
            </div>
          ) : (
            <ZenSkeleton className="h-40 w-full" rounded="xl" />
          )}
        </ZenDialogContent>
      </ZenDialog>
    </ZenPage>
  );
};

export default function GratitudePage() {
  return (
    <RequireAuth>
      <GratitudePageInner />
    </RequireAuth>
  );
}
