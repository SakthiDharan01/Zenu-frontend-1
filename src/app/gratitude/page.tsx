"use client";

import PandaJar from '@/components/gratitude/PandaJar';
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

  const [selectedNote, setSelectedNote] = useState<{ id: string; content: string; emoji?: string } | null>(null);

  const handlePickRandom = () => {
    if (!entries || entries.length === 0) return;
    const random = entries[Math.floor(Math.random() * entries.length)];
    setSelectedNote({ id: random.id, content: random.content, emoji: '🌸' });
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

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

        <div className="bg-gradient-to-br from-amber-50 to-pink-50 rounded-3xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold text-amber-800 text-center mb-1">Gratitude Jar</h2>
          <p className="text-sm text-amber-600 text-center mb-6">
            Drop your thankful moments into the jar, then let the panda pick one surprise memory for reflection.
          </p>
          <PandaJar
            notes={entries.map(e => ({ id: e.id, content: e.content, emoji: '🌸' }))}
            onPickRandom={handlePickRandom}
            onAddNew={() => setComposerOpen(true)}
            selectedNote={selectedNote}
            onCloseNote={handleCloseNote}
          />
        </div>
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