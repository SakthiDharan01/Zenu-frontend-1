"use client";

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import type { JournalEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getExcerpt = (content: string) => {
  if (!content) return '';
  return content.length > 80 ? `${content.slice(0, 77)}…` : content;
};

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
      content: entry.content ?? ''
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
          content: formValues.content
        });
        setEntries((prev) => [created, ...prev]);
        setSelectedEntry(created);
        toast.success('Reflection saved in your diary.');
      } else if (formValues.id) {
        const updated = await apiClient.updateJournalEntry(formValues.id, {
          mood: formValues.mood || null,
          title: formValues.title || null,
          content: formValues.content
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

  const handleDeleteEntry = async (entry: JournalEntry) => {
    if (!window.confirm('Erase this entry from your diary? This cannot be undone.')) return;
    try {
      await apiClient.deleteJournalEntry(entry.id);
      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
      if (selectedEntry?.id === entry.id) setSelectedEntry(null);
      toast.success('Entry erased.');
    } catch (err) {
      console.error('Failed to delete journal entry', err);
      toast.error('Could not erase this entry.');
    }
  };

  const greetingName = user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? 'Friend';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#f0f9ff_0%,#e0f2fe_35%,#eef2ff_75%,#f8fafc_100%)] px-4 pb-16 pt-24 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-white/70 bg-white/50 p-6 shadow-xl backdrop-blur-md sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">My Diary</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800">{greetingName}&apos;s Private Space</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Reflect on your day, record your thoughts, and release what&apos;s on your mind.
          </p>
        </section>

        {/* The Diary Desk Scene */}
        <div className="relative mt-12 flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {!isDiaryOpen ? (
              <motion.button
                key="closed-diary"
                onClick={() => setIsDiaryOpen(true)}
                className="group relative h-[25rem] w-72 md:w-80 rounded-r-3xl rounded-l-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-[20px_20px_40px_rgba(0,0,0,0.2),inset_4px_0_10px_rgba(255,255,255,0.1)] transition-transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                {/* Diary Spine */}
                <div className="absolute left-0 top-0 h-full w-8 rounded-l-md bg-gradient-to-r from-slate-900 to-slate-800 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.4)]" />
                
                {/* Title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="rounded-lg border-[2px] border-slate-500/30 p-6 backdrop-blur-sm">
                    <h3 className="font-serif text-3xl tracking-widest text-slate-200/90">DIARY</h3>
                  </div>
                  <p className="mt-8 text-sm uppercase tracking-widest text-slate-400">Tap to open</p>
                </div>

                {/* Bookmark ribbon */}
                <div className="absolute -bottom-4 right-12 h-16 w-4 bg-red-800 shadow-md" />
              </motion.button>
            ) : (
              <motion.div
                key="open-diary"
                className="relative flex h-[35rem] w-full max-w-4xl flex-col md:flex-row shadow-[20px_20px_40px_rgba(0,0,0,0.15)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsDiaryOpen(false);
                    setSelectedEntry(null);
                  }}
                  className="absolute -right-4 -top-4 z-50 rounded-full bg-slate-800 p-2 text-white shadow-lg hover:bg-slate-700"
                >
                  <X size={20} />
                </button>

                {/* Left Page (Entries List) */}
                <div className="h-1/2 md:h-full w-full md:w-1/2 overflow-y-auto rounded-t-xl md:rounded-tr-none md:rounded-l-3xl bg-[#fdfbf7] p-8 shadow-[inset_-12px_0_20px_rgba(0,0,0,0.03)] border-b md:border-b-0 md:border-r border-slate-200/50">
                  <h3 className="font-serif text-2xl text-slate-800 mb-6 border-b border-slate-200 pb-2">Table of Contents</h3>
                  
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                  ) : entries.length === 0 ? (
                    <p className="text-slate-500 italic">Your diary is empty. The right page awaits your first entry.</p>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          className={`w-full text-left p-4 rounded-xl transition-all ${selectedEntry?.id === entry.id ? 'bg-blue-50/80 border border-blue-100 shadow-sm' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-medium text-slate-800">{entry.title || 'Untitled'}</span>
                            <span className="text-xs text-slate-400 font-mono">{formatDate(entry.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 pr-4">
                            {getExcerpt(entry.content)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Page (Selected Entry or Blank Page) */}
                <div className="h-1/2 md:h-full w-full md:w-1/2 rounded-b-xl md:rounded-bl-none md:rounded-r-3xl bg-[#fdfbf7] p-8 shadow-[inset_12px_0_20px_rgba(0,0,0,0.03)] relative overflow-y-auto">
                  {selectedEntry ? (
                    <div className="h-full z-10 relative">
                      <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-4">
                        <div>
                          <h3 className="font-serif text-2xl text-slate-800">{selectedEntry.title || 'Reflection'}</h3>
                          <p className="text-sm text-slate-500 mt-1 font-mono">{formatDate(selectedEntry.createdAt)}</p>
                          {selectedEntry.mood && (
                            <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {selectedEntry.mood}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600 mb-2" title="Close reflection">
                            <X size={16} />
                          </button>
                          <button onClick={() => openEditDialog(selectedEntry)} className="text-slate-400 hover:text-blue-500" title="Edit entry">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteEntry(selectedEntry)} className="text-slate-400 hover:text-red-500" title="Delete entry">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose">
                        {selectedEntry.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center z-10 relative">
                      <button
                        onClick={openCreateDialog}
                        className="group flex flex-col items-center gap-4 text-slate-400 transition-colors hover:text-blue-500"
                      >
                        <div className="rounded-full border-2 border-dashed border-slate-300 p-6 group-hover:border-blue-300 group-hover:bg-blue-50">
                          <Plus size={32} />
                        </div>
                        <span className="font-serif text-xl">Write a new reflection</span>
                      </button>
                    </div>
                  )}

                  {/* Page Lines overlay purely for aesthetics */}
                  <div className="pointer-events-none absolute inset-x-8 top-8 bottom-8 opacity-[0.15]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => (!open ? closeForm() : setFormOpen(open))}>
        <DialogContent className="sm:max-w-xl bg-[#fdfbf7] border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-slate-800">{formMode === 'create' ? 'Dear Diary...' : 'Edit Reflection'}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Capture what you&apos;re feeling right now. Only you can see this.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 my-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-600">Title</Label>
              <Input
                id="title"
                placeholder="A thought for today..."
                value={formValues.title}
                onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/50 border-slate-200 focus-visible:ring-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mood" className="text-slate-600">Mood</Label>
              <Select
                value={formValues.mood ?? undefined}
                onValueChange={(val) => setFormValues(prev => ({ ...prev, mood: val === 'none' ? null : val }))}
              >
                <SelectTrigger className="bg-white/50 border-slate-200 focus-visible:ring-slate-400">
                  <SelectValue placeholder="How are you arriving?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No label</SelectItem>
                  {MOOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content" className="text-slate-600">Reflection</Label>
              <Textarea
                id="content"
                rows={8}
                placeholder="Start writing here..."
                value={formValues.content}
                onChange={(e) => setFormValues(prev => ({ ...prev, content: e.target.value }))}
                className="resize-none bg-white/50 leading-relaxed border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={formSubmitting} className="border-slate-200 text-slate-600">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} disabled={formSubmitting} className="bg-slate-800 text-white hover:bg-slate-700">
              {formSubmitting ? 'Saving...' : formMode === 'create' ? 'Save Entry' : 'Update Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function JournalPage() {
  return (
    <RequireAuth>
      <JournalContent />
    </RequireAuth>
  );
}
