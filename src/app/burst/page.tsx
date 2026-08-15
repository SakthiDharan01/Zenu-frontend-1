'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trackEngagement } from '@/lib/signals';
import { ZenPage, ZenContainer, ZenButton, ZenTextarea } from '@/components/zen';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

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

type Phase = 'typing' | 'traveling' | 'expanding' | 'popping' | 'affirming';

export default function BurstItOutPage() {
  const [thought, setThought] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');
  const [affirmation, setAff] = useState('');
  const [bubbleSize, setBubbleSize] = useState(80);
  const startTime = useRef(Date.now());

  useEffect(() => {
    trackEngagement('burst_it_out', 'opened');
  }, []);

  useEffect(() => {
    if (phase !== 'typing') return;
    const chars = thought.length;
    const size = Math.min(80 + chars * 1.2, 220);
    setBubbleSize(size);
  }, [thought, phase]);

  const handleRelease = async () => {
    if (!thought.trim() || phase !== 'typing') return;

    const randomAff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAff(randomAff);

    setPhase('traveling');
    await sleep(900);

    setPhase('expanding');
    setBubbleSize(320);
    await sleep(1200);

    setPhase('popping');
    await sleep(600);

    setPhase('affirming');
    trackEngagement(
      'burst_it_out',
      'completed',
      Math.round((Date.now() - startTime.current) / 1000),
    );
  };

  const handleReset = () => {
    setThought('');
    setPhase('typing');
    setBubbleSize(80);
    setAff('');
    startTime.current = Date.now();
  };

  const theme = getTheme('burst');

  return (
    <ModulePage theme={theme}>
      <ZenPage atmosphere="none" className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="xl" className="relative py-10 flex flex-col items-center">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-2 rounded-zen-full glass-floating shadow-zen-floating text-sm font-medium text-zen-fg hover:bg-white/95 active:scale-[0.97] transition-all duration-zen-fast focus-visible:outline-2 focus-visible:outline-zen-primary"
        >
          <ArrowLeft className="w-4 h-4 text-zen-fg-muted" aria-hidden="true" />
          <span className="hidden sm:inline text-zen-fg-muted">ZenU</span>
          <span className="h-3 w-px bg-zen-border hidden sm:block" aria-hidden="true" />
          <span>Burst</span>
        </Link>

        <h1 className="zen-h1 text-zen-fg text-center mt-10 mb-2">Burst it out</h1>
        <p className="zen-body-sm text-zen-fg-muted text-center mb-10 max-w-2xl">
          Type what&apos;s weighing on you. Watch it go into the bubble. Then pop it.
        </p>

        <div className="relative flex flex-col items-center w-full max-w-4xl">
          <div className="relative flex items-center justify-center mb-6" style={{ minHeight: 260 }}>
            <AnimatePresence>
              {phase !== 'affirming' && (
                <motion.div
                  key="bubble"
                  className="relative flex items-center justify-center"
                  animate={
                    phase === 'popping'
                      ? { scale: 1.1, opacity: 0 }
                      : { scale: 1 }
                  }
                  transition={
                    phase === 'popping'
                      ? { duration: 0.08, ease: 'easeOut' }
                      : { type: 'spring', stiffness: 80, damping: 14 }
                  }
                >
                  <motion.svg
                    width={bubbleSize}
                    height={bubbleSize}
                    viewBox="0 0 200 200"
                    animate={{ width: bubbleSize, height: bubbleSize }}
                    transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                  >
                    <defs>
                      <radialGradient id="bubbleGrad" cx="35%" cy="30%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="hsl(262 48% 70%)" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="hsl(262 48% 58%)" stopOpacity="0.3" />
                      </radialGradient>
                      <linearGradient id="rainbowStroke" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--zen-secondary))" />
                        <stop offset="50%" stopColor="hsl(var(--zen-primary))" />
                        <stop offset="100%" stopColor="hsl(var(--zen-accent))" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="100"
                      cy="100"
                      r="95"
                      fill="url(#bubbleGrad)"
                      stroke="hsl(var(--zen-secondary))"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <ellipse
                      cx="70"
                      cy="60"
                      rx="18"
                      ry="10"
                      fill="white"
                      opacity="0.55"
                      transform="rotate(-30 70 60)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="93"
                      fill="none"
                      stroke="url(#rainbowStroke)"
                      strokeWidth="3"
                      opacity="0.35"
                    />
                  </motion.svg>

                  <AnimatePresence>
                    {(phase === 'traveling' || phase === 'expanding') && thought && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center px-4"
                        initial={{ opacity: 1, scale: 1, y: 60 }}
                        animate={
                          phase === 'traveling'
                            ? { opacity: 1, scale: 0.7, y: 10 }
                            : { opacity: 0.6, scale: 0.5, y: 0 }
                        }
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      >
                        <p className="text-center text-xs text-zen-fg font-medium leading-snug max-w-[80%] break-words">
                          {thought.length > 80 ? `${thought.slice(0, 80)}…` : thought}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'popping' && (
                <>
                  <motion.div
                    className="absolute rounded-full border-2 border-zen-secondary/40"
                    style={{ width: bubbleSize, height: bubbleSize }}
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                  {[...Array(24)].map((_, i) => {
                    const angle = (i / 24) * 360;
                    const rad = (angle * Math.PI) / 180;
                    const startRadius = bubbleSize / 2;
                    const endRadius = startRadius + 40 + Math.random() * 60;
                    const startX = Math.cos(rad) * startRadius;
                    const startY = Math.sin(rad) * startRadius;
                    const endX = Math.cos(rad) * endRadius;
                    const endY = Math.sin(rad) * endRadius + (40 + Math.random() * 80);
                    const size = 3 + Math.random() * 5;

                    return (
                      <motion.div
                        key={i}
                        className="absolute rounded-full bg-zen-secondary"
                        style={{ width: size, height: size }}
                        initial={{ x: startX, y: startY, scale: 1, opacity: 0.9 }}
                        animate={{ x: endX, y: endY, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 + Math.random() * 0.25, ease: 'easeOut' }}
                      />
                    );
                  })}
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'affirming' && (
                <motion.div
                  className="flex flex-col items-center text-center px-4"
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.15 }}
                >
                  <p className="zen-h3 text-zen-fg leading-relaxed mb-6 max-w-xs font-serif">
                    {affirmation}
                  </p>
                  <ZenButton variant="secondary" onClick={handleReset}>
                    Release another thought
                  </ZenButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {phase === 'typing' && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                <ZenTextarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="What's on your mind? Pour it all out here…"
                  rows={4}
                  maxLength={300}
                  aria-label="Thought to release"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="zen-caption text-zen-fg-subtle">{thought.length}/300</span>
                  <ZenButton
                    variant="secondary"
                    onClick={handleRelease}
                    disabled={!thought.trim()}
                  >
                    Release it
                  </ZenButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {phase === 'traveling' && (
              <motion.p
                key="traveling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="zen-body-sm text-purple-300 italic mt-4"
              >
                Sending your thought into the bubble…
              </motion.p>
            )}
            {phase === 'expanding' && (
              <motion.p
                key="expanding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="zen-body-sm text-purple-300 italic mt-4"
              >
                The bubble is filling up… ready to pop?
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === 'expanding' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4"
              >
                <ZenButton
                  variant="outline"
                  onClick={async () => {
                    setPhase('popping');
                    await sleep(600);
                    setPhase('affirming');
                    trackEngagement(
                      'burst_it_out',
                      'completed',
                      Math.round((Date.now() - startTime.current) / 1000),
                    );
                  }}
                >
                  Pop it
                </ZenButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ZenContainer>
      </ZenPage>
    </ModulePage>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
