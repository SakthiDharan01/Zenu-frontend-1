'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { trackEngagement } from '@/lib/signals';
import { ZenPage, ZenButton, ZenBackLink } from '@/components/zen';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { BurstCompanion, type BurstPhase } from './components/BurstCompanion';
import { BurstBubble } from './components/BurstBubble';
import { BurstComposer } from './components/BurstComposer';

const AFFIRMATIONS = [
  'That feeling no longer owns you. You released it.',
  'You are not your thoughts. You are the one who notices them.',
  'Every exhale is a letting go. You did that.',
  'Lighter now. That burden was never yours to keep forever.',
  'You faced it, you felt it, you freed it. That is courage.',
  'Releasing is not weakness — it is wisdom. Well done.',
  'The thought is gone. You remain. Strong, whole, enough.',
  'You just made space for something better.',
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function BurstItOutPage() {
  const reducedMotion = usePrefersReducedMotion();
  const [thought, setThought] = useState('');
  const [phase, setPhase] = useState<BurstPhase>('typing');
  const [affirmation, setAff] = useState('');
  const [bubbleSize, setBubbleSize] = useState(96);
  const startTime = useRef(Date.now());
  const busy = phase !== 'typing' && phase !== 'affirming';

  useEffect(() => {
    trackEngagement('burst_it_out', 'opened');
  }, []);

  useEffect(() => {
    if (phase !== 'typing') return;
    const chars = thought.length;
    setBubbleSize(Math.min(96 + chars * 1.05, 200));
  }, [thought, phase]);

  const finishRelease = () => {
    trackEngagement(
      'burst_it_out',
      'completed',
      Math.round((Date.now() - startTime.current) / 1000),
    );
  };

  const handleRelease = async () => {
    if (!thought.trim() || phase !== 'typing') return;

    setAff(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    setPhase('traveling');
    await sleep(reducedMotion ? 400 : 850);

    setPhase('expanding');
    setBubbleSize(280);
    await sleep(reducedMotion ? 500 : 1100);
    // Wait for user to pop — agency
  };

  const handlePop = async () => {
    if (phase !== 'expanding') return;
    setPhase('popping');
    await sleep(reducedMotion ? 220 : 550);
    setPhase('affirming');
    finishRelease();
  };

  const handleReset = () => {
    setThought('');
    setPhase('typing');
    setBubbleSize(96);
    setAff('');
    startTime.current = Date.now();
  };

  const theme = getTheme('burst');
  const statusLine =
    phase === 'traveling'
      ? 'Sending your thought into the bubble…'
      : phase === 'expanding'
        ? 'The bubble is full. Pop it when you’re ready.'
        : null;

  return (
    <ModulePage theme={theme}>
      <ZenPage
        atmosphere="none"
        className="relative min-h-[calc(100dvh-4rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-10"
      >
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pt-5 sm:px-6 md:pt-8">
          <ZenBackLink section="Burst" className="mb-6 self-start" />

          <header className="text-center">
            <p className="font-ui text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-violet-200/80">
              Let it go
            </p>
            <h1
              className={cn(
                'mt-2 font-display font-medium tracking-[-0.02em] text-white',
                'text-[2rem] leading-[1.15] sm:text-[2.5rem] md:text-[2.75rem]',
              )}
            >
              Burst it out
            </h1>
            <p className="mx-auto mt-2 max-w-md font-ui text-sm leading-relaxed text-violet-100/75 md:text-[0.9375rem]">
              Write what’s heavy. Watch it rise. Pop the bubble and leave it behind.
            </p>
          </header>

          {/* One stage: bubble + companion */}
          <section className="mt-6 flex flex-col items-center md:mt-8">
            <BurstBubble phase={phase} size={bubbleSize} thought={thought} />

            <BurstCompanion
              phase={phase}
              className={cn(
                'mt-1 transition-opacity',
                phase === 'affirming' ? 'opacity-100' : 'opacity-95',
              )}
            />

            <AnimatePresence mode="wait">
              {statusLine ? (
                <motion.p
                  key={statusLine}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 font-ui text-sm italic text-violet-200/80"
                >
                  {statusLine}
                </motion.p>
              ) : (
                <div className="mt-3 h-5" aria-hidden="true" />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'expanding' ? (
                <motion.div
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  className="mt-2"
                >
                  <ZenButton
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => void handlePop()}
                    className="min-w-[8.5rem] rounded-full"
                  >
                    Pop it
                  </ZenButton>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'affirming' ? (
                <motion.div
                  className="mt-2 flex max-w-lg flex-col items-center px-2 text-center"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                >
                  <p className="font-display text-xl leading-relaxed text-white md:text-2xl">
                    {affirmation}
                  </p>
                  <ZenButton
                    type="button"
                    variant="outline"
                    className="mt-6 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                    onClick={handleReset}
                  >
                    Release another thought
                  </ZenButton>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'typing' ? (
                <div className="mt-5 w-full md:mt-6">
                  <BurstComposer
                    value={thought}
                    onChange={setThought}
                    onRelease={() => void handleRelease()}
                    disabled={busy}
                  />
                </div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </ZenPage>
    </ModulePage>
  );
}
