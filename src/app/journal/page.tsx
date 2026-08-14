"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, Trash2, X, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import PandaAvatar from '@/components/PandaAvatar';
import { apiClient } from '@/lib/apiClient';
import type { JournalEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ZenPage,
  ZenContainer,
  ZenSection,
  ZenButton,
  ZenInput,
  ZenTextarea,
  ZenBadge,
  ZenSkeleton,
  ZenDialog,
  ZenDialogContent,
  ZenDialogHeader,
  ZenDialogTitle,
  ZenDialogDescription,
  ZenDialogFooter,
} from '@/components/zen';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MOOD_OPTIONS = ['Calm', 'Happy', 'Okay', 'Anxious', 'Overwhelmed', 'Drained'] as const;

type EntryFormMode = 'create' | 'edit';
interface EntryFormState {
  id?: string;
  mood: string | null;
  title: string;
  content: string;
}
const defaultFormState: EntryFormState = { mood: null, title: '', content: '' };

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getExcerpt = (content: string) => {
  if (!content) return '';
  return content.length > 80 ? `${content.slice(0, 77)}…` : content;
};

const parchment = 'bg-[#fdfbf7]';

const JournalContent = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<EntryFormMode>('create');
  const [formValues, setFormValues] = useState<EntryFormState>(defaultFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getJournalEntries({ limit: 100 });
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal entries', err);
      toast.error('Could not load your diary right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadEntries();
  }, [user, loadEntries]);

  const openCreateDialog = () => {
    setFormMode('create');
    setFormValues(defaultFormState);
    setFormOpen(true);
  };

  const openEditDialog = (entry: JournalEntry) => {
    setFormMode('edit');
    setFormValues({
      id: entry.id,
      mood: entry.mood ?? null,
      title: entry.title ?? '',
      content: entry.content ?? '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormSubmitting(false);
  };

  const handleFormSubmit = async () => {
    if (!formValues.content.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    setFormSubmitting(true);
    try {
      if (formMode === 'create') {
        const created = await apiClient.createJournalEntry({
          mood: formValues.mood || null,
          title: formValues.title || null,
          content: formValues.content,
        });
        setEntries((prev) => [created, ...prev]);
        setSelectedEntry(created);
        toast.success('Reflection saved in your diary.');
      } else if (formValues.id) {
        const updated = await apiClient.updateJournalEntry(formValues.id, {
          mood: formValues.mood || null,
          title: formValues.title || null,
          content: formValues.content,
        });
        setEntries((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
        setSelectedEntry(updated);
        toast.success('Reflection updated.');
      }
      closeForm();
    } catch (err) {
      console.error('Failed to save journal entry', err);
      toast.error('Unable to save your entry.');
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteJournalEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (selectedEntry?.id === deleteTarget.id) setSelectedEntry(null);
      toast.success('Entry erased.');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete journal entry', err);
      toast.error('Could not erase this entry.');
    } finally {
      setDeleting(false);
    }
  };

  const greetingName =
    user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? 'Friend';

  const entryList = (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="font-serif text-xl text-zen-fg mb-4 border-b border-zen-border-soft pb-2">
        Table of Contents
      </h3>
      {loading ? (
        <div className="space-y-3">
          <ZenSkeleton className="h-16 w-full" rounded="lg" />
          <ZenSkeleton className="h-16 w-full" rounded="lg" />
          <ZenSkeleton className="h-16 w-full" rounded="lg" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-zen-fg-muted italic zen-body-sm font-serif">
          Your diary is empty. Write your first reflection when ready.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedEntry(entry)}
              className={cn(
                'w-full text-left p-3 rounded-zen-lg transition-all duration-zen-fast min-h-11',
                'active:scale-[0.99]',
                'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
                selectedEntry?.id === entry.id
                  ? 'bg-zen-primary-soft border border-zen-primary/20 shadow-zen-subtle'
                  : 'hover:bg-zen-bg-subtle border border-transparent',
              )}
            >
              <div className="flex justify-between items-baseline gap-2 mb-1">
                <span className="font-medium text-zen-fg font-serif truncate">
                  {entry.title || 'Untitled'}
                </span>
                <span className="text-xs text-zen-fg-subtle flex-shrink-0">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <p className="text-sm text-zen-fg-muted line-clamp-2 font-serif">
                {getExcerpt(entry.content)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const readingPane = (
    <div className="relative flex flex-col h-full min-h-0 zen-serif">
      {selectedEntry ? (
        <div className="relative z-10 flex flex-col h-full min-h-0">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-zen-border-soft pb-4">
            <div className="min-w-0">
              <h3 className="font-serif text-2xl text-zen-fg truncate">
                {selectedEntry.title || 'Reflection'}
              </h3>
              <p className="text-sm text-zen-fg-muted mt-1">{formatDate(selectedEntry.createdAt)}</p>
              {selectedEntry.mood ? (
                <ZenBadge variant="soft" size="sm" className="mt-2">
                  {selectedEntry.mood}
                </ZenBadge>
              ) : null}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ZenButton
                variant="ghost"
                size="icon-md"
                aria-label="Clear selection"
                onClick={() => setSelectedEntry(null)}
              >
                <X className="h-4 w-4" />
              </ZenButton>
              <ZenButton
                variant="ghost"
                size="icon-md"
                aria-label="Edit entry"
                onClick={() => openEditDialog(selectedEntry)}
              >
                <Edit3 className="h-4 w-4" />
              </ZenButton>
              <ZenButton
                variant="ghost"
                size="icon-md"
                aria-label="Delete entry"
                onClick={() => setDeleteTarget(selectedEntry)}
              >
                <Trash2 className="h-4 w-4" />
              </ZenButton>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto whitespace-pre-wrap leading-loose text-zen-fg font-serif zen-body">
            {selectedEntry.content}
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-full flex-col items-center justify-center py-10">
          <button
            type="button"
            onClick={openCreateDialog}
            className={cn(
              'group flex flex-col items-center gap-4 text-zen-fg-muted',
              'transition-colors hover:text-zen-primary active:scale-[0.98]',
              'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2 rounded-zen-xl',
            )}
          >
            <div className="rounded-full border-2 border-dashed border-zen-border p-6 group-hover:border-zen-primary/40 group-hover:bg-zen-primary-soft min-h-11 min-w-11 flex items-center justify-center">
              <Plus className="h-8 w-8" aria-hidden="true" />
            </div>
            <span className="font-serif text-xl">Write a new reflection</span>
          </button>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 opacity-[0.12] hidden md:block"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--zen-border)) 31px, hsl(var(--zen-border)) 32px)',
        }}
        aria-hidden="true"
      />
    </div>
  );

  const theme = getTheme('diary');

  return (
    <ModulePage theme={theme}>
      <ZenPage atmosphere="none" className="min-h-[calc(100dvh-4rem)] flex flex-col pt-8">
      <ZenContainer maxWidth="xl" className="pt-8 pb-10 md:pt-12 relative">
        <div className="absolute top-0 left-4 md:left-0 z-20 mt-4 md:mt-0">
          <Link href="/" tabIndex={-1}>
            <ZenButton variant="ghost" size="sm" className="text-zen-fg-muted hover:text-zen-fg">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </ZenButton>
          </Link>
        </div>
        <ZenSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 glass rounded-zen-xl p-6">
            <PandaAvatar state="reflecting" size={64} label="Panda reflecting" />
            <div>
              <p className="zen-label text-zen-primary">My Diary</p>
              <h1 className="zen-h1 text-zen-fg font-serif mt-1">
                {greetingName}&apos;s private space
              </h1>
              <p className="zen-body-sm text-zen-fg-muted mt-2 max-w-xl">
                Reflect on your day, record your thoughts, and release what&apos;s on your mind.
              </p>
            </div>
          </div>
        </ZenSection>

        <ZenSection>
          <div className="relative flex items-center justify-center py-4 md:py-8">
            <AnimatePresence mode="wait">
              {!isDiaryOpen ? (
                <motion.button
                  key="closed-diary"
                  type="button"
                  onClick={() => setIsDiaryOpen(true)}
                  aria-label="Open diary"
                  className={cn(
                    'group relative h-[22rem] w-64 sm:w-72 md:w-80',
                    'rounded-r-3xl rounded-l-md',
                    'bg-gradient-to-r from-zen-fg via-[hsl(228,28%,22%)] to-zen-fg',
                    'shadow-zen-elevated',
                  )}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                >
                  <div className="absolute left-0 top-0 h-full w-8 rounded-l-md bg-zen-fg shadow-[inset_-2px_0_4px_rgba(0,0,0,0.35)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="rounded-lg border-2 border-white/15 p-6">
                      <h2 className="font-serif text-3xl tracking-widest text-white/90">DIARY</h2>
                    </div>
                    <p className="mt-8 text-sm uppercase tracking-widest text-white/50">Tap to open</p>
                  </div>
                  <div className="absolute -bottom-3 right-12 h-14 w-3.5 bg-zen-danger shadow-md" aria-hidden="true" />
                </motion.button>
              ) : (
                <motion.div
                  key="open-diary"
                  className="relative w-full max-w-4xl"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                  <ZenButton
                    variant="glass"
                    size="icon-md"
                    className="absolute right-2 top-2 z-20 md:right-0 md:-top-3"
                    aria-label="Close diary"
                    onClick={() => {
                      setIsDiaryOpen(false);
                      setSelectedEntry(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </ZenButton>

                  {/* Mobile: vertical stack */}
                  <div className="flex flex-col gap-4 md:hidden">
                    <div className={cn(parchment, 'rounded-zen-xl p-5 shadow-zen-card border border-zen-border-soft max-h-[40vh] overflow-hidden flex flex-col')}>
                      {entryList}
                    </div>
                    <div className={cn(parchment, 'rounded-zen-xl p-5 shadow-zen-card border border-zen-border-soft min-h-[16rem]')}>
                      {readingPane}
                    </div>
                  </div>

                  {/* Desktop: 3D book spread */}
                  <div className="hidden md:flex h-[32rem] w-full shadow-zen-elevated rounded-zen-2xl overflow-hidden">
                    <div
                      className={cn(
                        parchment,
                        'h-full w-1/2 overflow-hidden p-8',
                        'shadow-[inset_-12px_0_20px_rgba(0,0,0,0.03)] border-r border-zen-border-soft',
                      )}
                    >
                      {entryList}
                    </div>
                    <div
                      className={cn(
                        parchment,
                        'h-full w-1/2 p-8 relative overflow-hidden',
                        'shadow-[inset_12px_0_20px_rgba(0,0,0,0.03)]',
                      )}
                    >
                      {readingPane}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ZenSection>
      </ZenContainer>

      <ZenDialog open={formOpen} onOpenChange={(open) => (!open ? closeForm() : setFormOpen(open))}>
        <ZenDialogContent className={cn('sm:max-w-xl', parchment)}>
          <ZenDialogHeader>
            <ZenDialogTitle className="font-serif text-2xl">
              {formMode === 'create' ? 'Dear Diary…' : 'Edit reflection'}
            </ZenDialogTitle>
            <ZenDialogDescription>
              Capture what you&apos;re feeling right now. Only you can see this.
            </ZenDialogDescription>
          </ZenDialogHeader>

          <div className="space-y-4 my-2">
            <ZenInput
              label="Title"
              placeholder="A thought for today…"
              value={formValues.title}
              onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="zen-label text-zen-fg-muted" htmlFor="journal-mood">
                Mood
              </label>
              <Select
                value={formValues.mood ?? undefined}
                onValueChange={(val) =>
                  setFormValues((prev) => ({ ...prev, mood: val === 'none' ? null : val }))
                }
              >
                <SelectTrigger
                  id="journal-mood"
                  className="bg-white border-zen-border rounded-zen-sm h-10 focus:ring-zen-primary/15"
                >
                  <SelectValue placeholder="How are you arriving?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No label</SelectItem>
                  {MOOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ZenTextarea
              label="Reflection"
              rows={8}
              placeholder="Start writing here…"
              value={formValues.content}
              onChange={(e) => setFormValues((prev) => ({ ...prev, content: e.target.value }))}
              className="font-serif leading-relaxed"
            />
          </div>

          <ZenDialogFooter>
            <ZenButton variant="outline" onClick={closeForm} disabled={formSubmitting}>
              Cancel
            </ZenButton>
            <ZenButton onClick={handleFormSubmit} loading={formSubmitting}>
              {formMode === 'create' ? 'Save entry' : 'Update entry'}
            </ZenButton>
          </ZenDialogFooter>
        </ZenDialogContent>
      </ZenDialog>

      <ZenDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ZenDialogContent>
          <ZenDialogHeader>
            <ZenDialogTitle>Erase this entry?</ZenDialogTitle>
            <ZenDialogDescription>
              This removes the reflection permanently. This cannot be undone.
            </ZenDialogDescription>
          </ZenDialogHeader>
          <ZenDialogFooter>
            <ZenButton variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Keep it
            </ZenButton>
            <ZenButton variant="destructive" onClick={confirmDelete} loading={deleting}>
              Erase entry
            </ZenButton>
          </ZenDialogFooter>
        </ZenDialogContent>
      </ZenDialog>
      </ZenPage>
    </ModulePage>
  );
};

export default function JournalPage() {
  return (
    <RequireAuth>
      <JournalContent />
    </RequireAuth>
  );
}
