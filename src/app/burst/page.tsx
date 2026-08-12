'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { trackEngagement } from '@/lib/signals';

const AFFIRMATIONS = [
  "That feeling no longer owns you. You released it. 🌸",
  "You are not your thoughts. You are the one who notices them. ✨",
  "Every exhale is a letting go. You did that. 🍃",
  "Lighter now. That burden was never yours to keep forever. 💫",
  "You faced it, you felt it, you freed it. That's courage. 🌊",
  "Releasing is not weakness — it's wisdom. Well done. 🌻",
  "The thought is gone. You remain. Strong, whole, enough. 🌙",
  "You just made space for something better. 🦋",
];

type Phase = 'typing' | 'traveling' | 'expanding' | 'popping' | 'affirming';

export default function BurstItOutPage() {
  const [thought, setThought] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');
  const [affirmation, setAff] = useState('');
  const [bubbleSize, setBubbleSize] = useState(80);
  const startTime = useRef(Date.now());
  const router = useRouter();

  useEffect(() => {
    trackEngagement('burst_it_out', 'opened');
  }, []);

  // Bubble grows as user types
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

    // Phase 1: text travels into bubble
    setPhase('traveling');
    await sleep(900);

    // Phase 2: bubble expands dramatically
    setPhase('expanding');
    setBubbleSize(320);
    await sleep(1200);

    // Phase 3: bubble pops
    setPhase('popping');
    await sleep(600);

    // Phase 4: affirmation appears
    setPhase('affirming');
    trackEngagement('burst_it_out', 'completed', Math.round((Date.now() - startTime.current) / 1000));
  };

  const handleReset = () => {
    setThought('');
    setPhase('typing');
    setBubbleSize(80);
    setAff('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 px-4 py-12">

      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Burst It OUT</h1>
      <p className="text-gray-500 text-sm text-center mb-10 max-w-sm">
        Type what&apos;s weighing on you. Watch it go into the bubble. Then pop it.
      </p>

      {/* Main scene */}
      <div className="relative flex flex-col items-center w-full max-w-md">

        {/* BUBBLE */}
        <div className="relative flex items-center justify-center mb-6" style={{ minHeight: 260 }}>

          {/* Bubble SVG */}
          <AnimatePresence>
            {phase !== 'affirming' && (
              <motion.div
                key="bubble"
                className="relative flex items-center justify-center"
                animate={
                  phase === 'popping'
                    ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                    : phase === 'expanding'
                      ? { scale: 1 }
                      : { scale: 1 }
                }
                transition={
                  phase === 'popping'
                    ? { duration: 0.5, times: [0, 0.4, 1] }
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
                      <stop offset="40%" stopColor="#c4b5fd" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    </radialGradient>
                  </defs>
                  {/* Main bubble */}
                  <circle cx="100" cy="100" r="95" fill="url(#bubbleGrad)" stroke="#a78bfa" strokeWidth="2" />
                  {/* Shine spots */}
                  <ellipse cx="70" cy="60" rx="18" ry="10" fill="white" opacity="0.55" transform="rotate(-30 70 60)" />
                  <ellipse cx="85" cy="48" rx="7" ry="4" fill="white" opacity="0.4" transform="rotate(-30 85 48)" />
                  {/* Rainbow rim */}
                  <circle cx="100" cy="100" r="93" fill="none" stroke="url(#rainbowStroke)" strokeWidth="3" opacity="0.4" />
                  <defs>
                    <linearGradient id="rainbowStroke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f0abfc" />
                      <stop offset="33%" stopColor="#93c5fd" />
                      <stop offset="66%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#fde68a" />
                    </linearGradient>
                  </defs>
                </motion.svg>

                {/* Text traveling into bubble */}
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
                      <p className="text-center text-xs text-purple-800 font-medium leading-snug max-w-[80%] break-words">
                        {thought.length > 80 ? thought.slice(0, 80) + '…' : thought}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* POP PARTICLES */}
          <AnimatePresence>
            {phase === 'popping' && (
              <>
                {[...Array(10)].map((_, i) => {
                  const angle = (i / 10) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 100;
                  const y = Math.sin(rad) * 100;
                  const colors = ['#c4b5fd', '#f0abfc', '#93c5fd', '#6ee7b7', '#fde68a', '#fca5a5'];
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x, y, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  );
                })}
              </>
            )}
          </AnimatePresence>

          {/* AFFIRMATION */}
          <AnimatePresence>
            {phase === 'affirming' && (
              <motion.div
                className="flex flex-col items-center text-center px-4"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
              >
                <div className="text-5xl mb-4">🫧</div>
                <p className="text-xl font-semibold text-purple-800 leading-relaxed mb-6 max-w-xs">
                  {affirmation}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg"
                >
                  Release another thought
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TYPING AREA — only shown in typing phase */}
        <AnimatePresence>
          {phase === 'typing' && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <textarea
                value={thought}
                onChange={e => setThought(e.target.value)}
                placeholder="What&apos;s on your mind? Pour it all out here..."
                rows={4}
                maxLength={300}
                className="w-full rounded-2xl border-2 border-purple-200 bg-white/80 backdrop-blur p-4 text-gray-700 text-sm resize-none focus:outline-none focus:border-purple-400 transition-colors shadow-sm"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-gray-400">{thought.length}/300</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRelease}
                  disabled={!thought.trim()}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Release It 🫧
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase hint text */}
        <AnimatePresence mode="wait">
          {phase === 'traveling' && (
            <motion.p
              key="traveling"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-purple-500 text-sm italic mt-4"
            >
              Sending your thought into the bubble...
            </motion.p>
          )}
          {phase === 'expanding' && (
            <motion.p
              key="expanding"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-purple-500 text-sm italic mt-4"
            >
              The bubble is filling up... ready to pop?
            </motion.p>
          )}
        </AnimatePresence>

        {/* Manual pop button during expanding phase */}
        <AnimatePresence>
          {phase === 'expanding' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={async () => {
                setPhase('popping');
                await sleep(600);
                setPhase('affirming');
                trackEngagement('burst_it_out', 'completed', Math.round((Date.now() - startTime.current) / 1000));
              }}
              className="mt-4 bg-white border-2 border-purple-300 text-purple-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors shadow"
            >
              Pop it! 💥
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}