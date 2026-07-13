"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/apiClient';
import type { GratitudeEntry, GratitudeFeedback, GratitudeOverallReview } from '@/lib/types';

const deskFlowers = ['🌸', '🌷', '🪻', '🌼'];

const DeskScene = ({
  entryCount,
  onPickRandom,
  picking,
  hasEntries
}: {
  entryCount: number;
  onPickRandom: () => Promise<void>;
  picking: boolean;
  hasEntries: boolean;
}) => {
  const paperRolls = Math.max(1, Math.min(10, entryCount));

  return (
    <div className="relative rounded-[2.2rem] border border-amber-200/70 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 p-6 shadow-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.65),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,232,187,0.4),transparent_35%)]" />

      <div className="relative z-10 mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-amber-900 sm:text-4xl">Gratitude Jar</h1>
        <p className="mt-2 text-sm text-amber-700 sm:text-base">
          Drop your thankful moments into the jar, then pick one surprise memory for reflection.
        </p>
      </div>

      <div className="relative z-10 mx-auto flex max-w-2xl items-end justify-center gap-4 sm:gap-6">
        {deskFlowers.slice(0, 2).map((flower, index) => (
          <motion.div
            key={flower}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -3, 0] }}
            transition={{ delay: 0.12 * index }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200/70 bg-white/80 text-3xl shadow"
          >
            {flower}
          </motion.div>
        ))}

        <motion.button
          type="button"
          onClick={() => void onPickRandom()}
          disabled={!hasEntries || picking}
          className="group relative h-72 w-52 rounded-[2.2rem] border-0 bg-transparent transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Pick a random gratitude paper roll"
          animate={
            picking
              ? { y: [-1, -4, 0], rotate: [0, -1.1, 1.2, 0], scale: [1, 1.02, 1] }
              : { y: 0, rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.65, ease: 'easeInOut' }}
        >
          {/* Lid — sits flush on top of jar, same width as jar body */}
          <motion.div
            className="absolute inset-x-[1.1rem] top-[4.2rem] z-30 h-[2.1rem] rounded-t-[1.4rem] rounded-b-[0.4rem] border-[2px] border-violet-500 bg-gradient-to-b from-violet-400 via-violet-500 to-violet-600 shadow-[0_6px_16px_rgba(88,28,135,0.35)]"
            style={{ transformOrigin: '50% 100%' }}
            animate={
              picking
                ? { rotate: [0, -6, 0], y: [0, -12, 0] }
                : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="pointer-events-none absolute inset-x-3 top-1 h-3 rounded-full bg-white/20" />
            <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-sm leading-none drop-shadow-sm">🎀</span>
          </motion.div>

          {/* Neck ring — thin strip bridging lid to jar */}
          <div className="absolute inset-x-6 top-[5.2rem] z-20 h-3 rounded-full border border-sky-400/90 bg-sky-200/95 shadow-sm" />

          {/* Jar body */}
          <div className="absolute inset-x-5 bottom-5 top-[5.6rem] rounded-b-[3.5rem] rounded-t-[2.1rem] border-[3px] border-cyan-300 bg-gradient-to-b from-cyan-100/88 to-cyan-200/72 shadow-[inset_0_12px_30px_rgba(255,255,255,0.72),0_20px_32px_rgba(71,85,105,0.2)]" />

          {/* Inner window highlight */}
          <div className="absolute inset-x-8 bottom-10 top-[6.6rem] rounded-[1.5rem] border border-cyan-300/70 bg-white/28" />

          {/* Paper rolls inside jar */}
          <div className="pointer-events-none absolute inset-x-9 bottom-12 top-[7.1rem] z-20 overflow-hidden rounded-[1.15rem]">
            {Array.from({ length: paperRolls }).map((_, index) => (
              <motion.div
                key={index}
                className="absolute flex h-5 w-[2.6rem] items-center justify-center overflow-hidden rounded-sm border border-amber-300/50 bg-gradient-to-b from-amber-100 via-white to-amber-200 shadow-[1px_2px_4px_rgba(0,0,0,0.08),inset_0_-2px_3px_rgba(217,119,6,0.15)]"
                animate={
                  picking
                    ? { y: [0, -6 - (index % 2) * 4, 0], rotate: [0, 7 - (index % 3) * 5, 0] }
                    : { y: 0, rotate: 0 }
                }
                transition={{ duration: 0.5, delay: index * 0.02 }}
                style={{
                  left: `${(index * 17) % 70}%`,
                  top: `${(index * 11) % 82}%`,
                  transform: `rotate(${(index * 16) % 55 - 27}deg)`
                }}
              >
                {/* Red ribbon binding */}
                <div className="absolute top-0 h-full w-[2.5px] bg-red-400/85" />
                {/* Paper curl lines */}
                <div className="absolute right-1 top-0 h-full w-[1px] bg-amber-300/40" />
                <div className="absolute left-1 top-0 h-full w-[1px] bg-white" />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {picking ? (
              <motion.div
                initial={{ opacity: 0, y: 16, rotate: 8, width: 38, height: 20, borderRadius: 999 }}
                animate={{ opacity: 1, y: 6, rotate: 0, width: 116, height: 88, borderRadius: 10 }}
                exit={{ opacity: 0, y: -6, rotate: -6, width: 58, height: 28, borderRadius: 999 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-[8.0rem] z-40 -translate-x-1/2 border border-amber-300 bg-amber-50/98 shadow"
              >
                <div className="mt-2 space-y-1 px-2">
                  <div className="h-[2px] w-full rounded-full bg-amber-300/80" />
                  <div className="h-[2px] w-[84%] rounded-full bg-amber-300/75" />
                  <div className="h-[2px] w-[76%] rounded-full bg-amber-300/70" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="absolute inset-x-0 -bottom-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-cyan-900 drop-shadow-sm">
            {picking ? 'Opening jar...' : hasEntries ? 'Tap a paper roll' : 'Jar is empty'}
          </div>
        </motion.button>

        {deskFlowers.slice(2).map((flower, index) => (
          <motion.div
            key={flower}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -3, 0] }}
            transition={{ delay: 0.12 * (index + 2) }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200/70 bg-white/80 text-3xl shadow"
          >
            {flower}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-6 h-10 max-w-4xl rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 shadow-inner" />
    </div>
  );
};

const EntryComposer = ({
  open,
  onOpenChange,
  onSubmit,
  submitting
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Paper + Pen Moment</DialogTitle>
          <DialogDescription>
            Write what happened today and why you feel thankful for it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="grid gap-2">
            <Label htmlFor="gratitude-title">Short title (optional)</Label>
            <Input
              id="gratitude-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A tiny win from today"
              maxLength={120}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gratitude-content">Your gratitude note</Label>
            <Textarea
              id="gratitude-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Today I felt thankful because..."
              maxLength={5000}
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save to Jar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        content: input.content.trim()
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
        thankfulnessScore: result.thankfulnessScore
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
        entriesCount: result.entriesCount
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_15%,#fff7e7_0%,#ffe9da_35%,#ffe0ec_65%,#fdf8ff_100%)] px-4 pb-16 pt-24 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4 hover:bg-amber-100/50">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <section className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Hello {greetingName}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800">Your desk of tiny thankful moments</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Add one gratitude note at a time, then click the paper rolls in your jar for random reflection.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setComposerOpen(true)}>Add New Journal</Button>
            <Button variant="secondary" onClick={() => void handleRandomPick()} disabled={picking || !entries.length}>
              {picking ? 'Picking...' : 'Pick Random Paper'}
            </Button>
            <Button variant="outline" onClick={() => void handleOverallReview()} disabled={reviewing || !entries.length}>
              {reviewing ? 'Reviewing...' : 'Overall Jar Review'}
            </Button>
          </div>
        </section>

        <DeskScene
          entryCount={entries.length}
          onPickRandom={handleRandomPick}
          picking={picking}
          hasEntries={entries.length > 0}
        />
      </div>

      <EntryComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onSubmit={handleCreateEntry}
        submitting={submitting}
      />

      <Dialog open={pickedDialogOpen} onOpenChange={setPickedDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <Sparkles className="h-5 w-5" />
              Picked Reflection
            </DialogTitle>
            <DialogDescription>
              A random gratitude paper opened from your jar.
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback ? (
            <motion.div
              key={selectedFeedback.entry.id}
              initial={{ opacity: 0, y: 10, rotateX: -12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-amber-700">Paper picked from jar</p>
                <p className="mt-1 text-lg font-medium text-slate-800">{selectedFeedback.entry.title ?? 'Untitled note'}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selectedFeedback.entry.content}</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 shadow-sm">
                <p className="text-sm font-medium text-cyan-800">
                  Thankfulness score: {selectedFeedback.thankfulnessScore}/10
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selectedFeedback.feedback}</p>
              </div>
            </motion.div>
          ) : (
            <Skeleton className="h-40 w-full" />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickedDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteFromPickedDialog()}
              disabled={!selectedFeedback?.entry?.id}
            >
              <Trash2 className="h-4 w-4" />
              Delete This Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-700">
              <WandSparkles className="h-5 w-5" />
              Overall Jar Review
            </DialogTitle>
            <DialogDescription>
              A full summary of your gratitude trend across saved papers.
            </DialogDescription>
          </DialogHeader>

          {overallReview ? (
            <div className="space-y-3">
              <p className="text-sm text-violet-700">Entries analyzed: {overallReview.entriesCount}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{overallReview.review}</p>
            </div>
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function GratitudePage() {
  return (
    <RequireAuth>
      <GratitudePageInner />
    </RequireAuth>
  );
}