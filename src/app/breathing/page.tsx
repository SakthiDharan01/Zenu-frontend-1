'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { trackEngagement } from '@/lib/signals';

import { BreathingSelector } from '@/components/BreathingSelector';
import { BreathingModal } from '@/components/BreathingModal';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/providers/AuthProvider';
import ZenFocusMode from '@/components/layout/ZenFocusMode';
import { apiClient } from '@/lib/apiClient';
import type { BreathingPattern } from '@/lib/types';
import { ZenPage, ZenContainer, ZenButton } from '@/components/zen';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

const Breathing = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<BreathingPattern[]>([]);
  const [loading, setLoading] = useState(true);
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
    trackEngagement('breathing_box', 'opened');
    if (!user) return;
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
    if (!selectedPattern) return;
    const patternId = selectedPattern.id;

    try {
      await apiClient.logBreathingSession({ patternId, durationSeconds });
      await apiClient.recordActivity('breathing', { patternId, durationSeconds });
      trackEngagement('breathing_box', 'completed', durationSeconds);
      toast.success('Session saved', {
        description: 'Your breathing practice has been logged and added to your streak.',
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

  const theme = getTheme('breathing');

  return (
    <RequireAuth>
      <ZenFocusMode title="Breathe">
        <ModulePage theme={theme}>
          <ZenPage atmosphere="none" className="min-h-dvh pt-16">
          <ZenContainer maxWidth="xl" className="py-8">
            {error ? (
              <div className="max-w-xl mx-auto mb-8 rounded-zen-xl border border-zen-danger/25 bg-zen-danger-soft px-6 py-4 text-center text-zen-danger">
                <p className="mb-4">{error}</p>
                <ZenButton variant="outline" onClick={loadPatterns}>
                  Try again
                </ZenButton>
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
          </ZenContainer>
          </ZenPage>
        </ModulePage>
      </ZenFocusMode>
    </RequireAuth>
  );
};

export default Breathing;
