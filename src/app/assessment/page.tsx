"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/components/providers/AuthProvider';
import { OPTIONS, PSS_QUESTIONS } from './questions';

type Status = 'IDLE' | 'SUBMITTING';

export default function StressAssessmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Status>('IDLE');
  const [selected, setSelected] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => ((currentQIndex + 1) / PSS_QUESTIONS.length) * 100, [currentQIndex]);

  const calculateScoredAnswers = (finalAnswers: Record<number, number>) => {
    return PSS_QUESTIONS.map((question) => {
      const value = finalAnswers[question.id] ?? 0;
      return question.isReverse ? 4 - value : value;
    });
  };

  const submitResults = async (finalAnswers: Record<number, number>) => {
    setStatus('SUBMITTING');
    setError(null);

    try {
      const scoredAnswers = calculateScoredAnswers(finalAnswers);

      await apiClient.submitPSS(scoredAnswers);
      router.push('/');
      router.refresh();
    } catch (submitError) {
      console.error('Failed to submit PSS assessment', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit assessment');
      setStatus('IDLE');
    }
  };

  const handleAnswerSelect = async (rawValue: number) => {
    if (isTransitioning || status === 'SUBMITTING') {
      return;
    }

    const currentQuestion = PSS_QUESTIONS[currentQIndex];
    if (!currentQuestion) {
      return;
    }

    const updatedAnswers = { ...answers, [currentQuestion.id]: rawValue };
    setAnswers(updatedAnswers);
    setSelected(null);
    setIsTransitioning(true);

    if (currentQIndex < PSS_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 250);
      return;
    }

    await submitResults(updatedAnswers);
    setIsTransitioning(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to take your PSS check-in</h1>
          <p className="text-gray-600 mt-3">We save your results privately to track your stress trends over time.</p>
          <button
            type="button"
            onClick={() => router.push('/signin')}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = PSS_QUESTIONS[currentQIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Stress Assessment</h1>
          <p className="text-gray-600 mt-2">Reflect on how you felt over the last month.</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Question {currentQIndex + 1} of {PSS_QUESTIONS.length} • {Math.round(progress)}% complete
          </p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={`bg-white rounded-3xl border border-gray-100 shadow-lg p-8 transition-all duration-300 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}>
          <p className="text-xl text-gray-900 leading-relaxed">{currentQuestion?.text}</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OPTIONS.map((option, index) => {
              const isSelected = selected === index;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={status === 'SUBMITTING' || isTransitioning}
                  onClick={() => {
                    if (status === 'SUBMITTING' || isTransitioning) return;
                    setSelected(index);
                    setTimeout(() => {
                      void handleAnswerSelect(option.value);
                    }, 120);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">🔒 Your responses are private and linked to your account only.</p>
        {status === 'SUBMITTING' ? (
          <p className="text-center text-sm text-blue-600 mt-3">Submitting your check-in...</p>
        ) : null}
      </div>
    </div>
  );
}
