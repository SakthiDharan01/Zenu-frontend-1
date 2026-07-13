'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { BreathingSelector } from '@/components/BreathingSelector';
import { BreathingModal } from '@/components/BreathingModal';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import type { BreathingPattern } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const Breathing = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<BreathingPattern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getBreathingPatterns();
      setPatterns(data);
    } catch (err) {
      console.error('Failed to load breathing patterns', err);
      setError('Unable to load breathing exercises right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    void loadPatterns();
  }, [user, loadPatterns]);

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPattern(null);
  };

  const handleSessionComplete = async (durationSeconds: number) => {
    if (!selectedPattern) {
      return;
    }

    const patternId = selectedPattern.id;

    try {
      await apiClient.logBreathingSession({ patternId, durationSeconds });
      await apiClient.recordActivity('breathing', { patternId, durationSeconds });
      toast.success('Session saved', {
        description: 'Your breathing practice has been logged and added to your streak.'
      });
    } catch (err) {
      console.error('Failed to record breathing session', err);
      toast.error('We could not sync this session. Please try again.');
    }
  };

  const displayName = useMemo(() => {
    if (!user) return undefined;
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? undefined;
  }, [user]);

  const content = (
    <div className="relative container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {error ? (
        <div className="max-w-xl mx-auto mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700">
          <p className="mb-4">{error}</p>
          <Button variant="outline" onClick={loadPatterns}>
            Try again
          </Button>
        </div>
      ) : null}

      <BreathingSelector
        firstName={displayName}
        patterns={patterns}
        loading={loading}
        onSelectPattern={handleSelectPattern}
      />

      {selectedPattern ? (
        <BreathingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pattern={selectedPattern}
          onComplete={handleSessionComplete}
        />
      ) : null}
    </div>
  );

  return <RequireAuth>{content}</RequireAuth>;
};

export default Breathing;