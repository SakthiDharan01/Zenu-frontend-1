'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaperNote {
  id: string;
  content: string;
  emoji?: string;
}

interface PandaJarProps {
  notes: PaperNote[];
  onPickRandom: () => void;
  onAddNew: () => void;
  selectedNote: PaperNote | null;
  onCloseNote: () => void;
}

type Phase = 'idle' | 'walking_to' | 'opening' | 'reaching' | 'presenting' | 'putting_back' | 'closing' | 'walking_back';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export default function PandaJar({ notes, onPickRandom, onAddNew, selectedNote, onCloseNote }: PandaJarProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const noteCount = notes.length;
  const paperColors = ['#fef3c7', '#fce7f3', '#dbeafe', '#dcfce7', '#ede9fe', '#fee2e2'];

  const handlePick = async () => {
    if (noteCount === 0 || phase !== 'idle') return;
    setPhase('walking_to');
    await sleep(900);
    setPhase('opening');
    await sleep(700);
    setPhase('reaching');
    await sleep(600);
    setPhase('presenting');
    onPickRandom();
  };

  const handleClose = async () => {
    setPhase('putting_back');
    await sleep(600);
    setPhase('closing');
    await sleep(600);
    setPhase('walking_back');
    await sleep(900);
    setPhase('idle');
    onCloseNote();
  };

  // Panda X position across phases
  const pandaX = {
    idle: 0,
    walking_to: 95,
    opening: 110,
    reaching: 110,
    presenting: 110,
    putting_back: 110,
    closing: 110,
    walking_back: 0,
  }[phase];

  const lidY = (phase === 'opening' || phase === 'reaching' || phase === 'presenting')
    ? -28
    : phase === 'putting_back' || phase === 'closing'
      ? -10
      : 0;

  const lidRotate = (phase === 'opening' || phase === 'reaching' || phase === 'presenting')
    ? -15
    : phase === 'putting_back' || phase === 'closing'
      ? -5
      : 0;

  // Right arm angle for reaching into jar
  const rightArmRotate = (phase === 'reaching' || phase === 'presenting')
    ? 130
    : phase === 'putting_back'
      ? 120
      : phase === 'opening' || phase === 'closing'
        ? 70
        : 0;
  // Left arm angle
  const leftArmRotate = (phase === 'opening' || phase === 'reaching' || phase === 'presenting')
    ? -65
    : phase === 'closing' || phase === 'putting_back'
      ? -40
      : 0;

  const isWalking = phase === 'walking_to' || phase === 'walking_back';
  const facingRight = phase === 'walking_back';

  return (
    <div className="relative w-full flex flex-col items-center" style={{ minHeight: 420 }}>

      {/* Scene container */}
      <div className="relative w-full max-w-lg mx-auto" style={{ height: 360 }}>

        {/* Ground */}
        <div className="absolute bottom-10 left-0 right-0 h-0.5 bg-amber-200 rounded-full opacity-60" />

        {/* JAR — anchored to center-right */}
        <div className="absolute bottom-10 left-1/2 flex flex-col items-center" style={{ width: 130, marginLeft: 25 }}>

          {/* Lid */}
          <motion.div
            animate={{ y: lidY, rotate: lidRotate }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="relative z-20"
            style={{ transformOrigin: 'right center' }}
          >
            {/* Lid knob */}
            <div className="mx-auto w-8 h-4 bg-purple-500 rounded-full -mb-1 shadow" />
            {/* Lid body */}
            <div className="w-28 h-7 bg-purple-600 rounded-t-2xl shadow-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1 left-3 w-10 h-2 bg-white rounded-full opacity-20" />
              <div className="flex gap-1 text-[10px]">
                <span>❤️</span><span>❤️</span><span>❤️</span>
              </div>
            </div>
          </motion.div>

          {/* Jar neck */}
          <div className="w-24 h-4 bg-amber-200 border border-amber-300 z-10 -mt-0.5" />

          {/* Jar body */}
          <div
            className="relative w-28 rounded-b-3xl border-2 border-amber-300 overflow-hidden z-10 shadow-sm"
            style={{
              height: 120,
              background: 'linear-gradient(135deg, rgba(254,249,220,0.95) 0%, rgba(253,230,138,0.7) 60%, rgba(245,225,180,0.9) 100%)'
            }}
          >
            {/* Glass shine */}
            <div className="absolute top-2 left-2 w-2 h-16 bg-white rounded-full opacity-40" />
            <div className="absolute top-2 left-6 w-1 h-10 bg-white rounded-full opacity-25" />

            {/* Paper rolls */}
            <div className="absolute bottom-3 left-0 right-0 flex flex-wrap justify-center gap-1.5 px-3">
              {Array.from({ length: Math.min(noteCount, 6) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="w-8 h-5 rounded-full border border-amber-400 flex items-center justify-center text-[10px] shadow-sm"
                  style={{ backgroundColor: paperColors[i % paperColors.length] }}
                >
                  ⭐
                </motion.div>
              ))}
              {noteCount === 0 && (
                <p className="text-amber-400 text-xs italic text-center w-full mt-6">empty</p>
              )}
            </div>
          </div>

          {/* Badge */}
          {noteCount > 0 && (
            <div className="absolute -top-2 -right-2 z-30 bg-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              {noteCount}
            </div>
          )}
        </div>

        {/* ── PANDA ── anchored to center-left */}
        <motion.div
          className="absolute bottom-10 left-1/2 drop-shadow-sm" 
          animate={{ x: pandaX }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 1.4 }}
          style={{ marginLeft: -155, scaleX: facingRight ? -1 : 1 }}
        >
          <PandaCharacter
            phase={phase}
            isWalking={isWalking}
            rightArmRotate={rightArmRotate}
            leftArmRotate={leftArmRotate}
          />
        </motion.div>

        {/* ── PRESENTED NOTE ── */}
        <AnimatePresence>
          {phase === 'presenting' && selectedNote && (
            <motion.div
              className="absolute z-40"
              style={{ top: 8, right: 0, left: 'auto', width: 220 }}
              initial={{ opacity: 0, y: 20, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: 2 }}
              exit={{ opacity: 0, y: -16, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-2xl p-5 w-56 text-center relative">
                {/* Ruled lines */}
                <div className="absolute inset-x-5 top-14 bottom-8 flex flex-col justify-around pointer-events-none">
                  {[0, 1, 2].map(i => <div key={i} className="border-b border-amber-200 opacity-50" />)}
                </div>
                <div className="text-3xl mb-2">{selectedNote.emoji || '🌸'}</div>
                <p className="text-gray-700 text-xs font-medium leading-relaxed relative z-10 mb-3">
                  {selectedNote.content}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="text-xs text-amber-600 underline hover:text-amber-800"
                >
                  Put it back 🐼
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase label — small, subtle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            className="absolute bottom-0 left-0 right-0 text-center text-xs text-amber-500 font-medium italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {phase === 'idle' && '🐼 Tap "Pick a memory" to let the panda find one for you'}
            {phase === 'walking_to' && 'Panda is heading to the jar...'}
            {phase === 'opening' && 'Opening the jar...'}
            {phase === 'reaching' && 'Reaching in...'}
            {phase === 'presenting' && 'Found one! 🌸'}
            {phase === 'putting_back' && 'Putting it back...'}
            {phase === 'closing' && 'Closing the jar...'}
            {phase === 'walking_back' && 'Panda is heading back...'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={onAddNew}
          className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg"
        >
          + Add a moment
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={handlePick}
          disabled={noteCount === 0 || phase !== 'idle'}
          className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          🐼 Pick a memory
        </motion.button>
      </div>
    </div>
  );
}

/* ── Full illustrated Panda SVG with animated limbs and smaller original eyes ── */
function PandaCharacter({
  phase,
  isWalking,
  rightArmRotate,
  leftArmRotate,
}: {
  phase: Phase;
  isWalking: boolean;
  rightArmRotate: number;
  leftArmRotate: number;
}) {
  return (
    <svg width="125" height="162" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── LEGS ── */}
      {/* Left leg */}
      <motion.g
        animate={isWalking ? { rotate: [0, 30, 0, -20, 0] } : { rotate: 0 }}
        transition={{ repeat: isWalking ? Infinity : 0, duration: 0.45, ease: 'easeInOut' }}
        style={{ originX: '35px', originY: '100px' }}
      >
        <ellipse cx="35" cy="112" rx="13" ry="9" fill="#1a1a1a" />
        <ellipse cx="35" cy="118" rx="15" ry="7" fill="#1a1a1a" />
        {/* paw pads */}
        <circle cx="29" cy="120" r="2.5" fill="#ff8fa3" opacity="0.9" />
        <circle cx="35" cy="122" r="3" fill="#ff8fa3" opacity="0.9" />
        <circle cx="41" cy="120" r="2.5" fill="#ff8fa3" opacity="0.9" />
      </motion.g>

      {/* Right leg */}
      <motion.g
        animate={isWalking ? { rotate: [0, -30, 0, 20, 0] } : { rotate: 0 }}
        transition={{ repeat: isWalking ? Infinity : 0, duration: 0.45, ease: 'easeInOut' }}
        style={{ originX: '65px', originY: '100px' }}
      >
        <ellipse cx="65" cy="112" rx="13" ry="9" fill="#1a1a1a" />
        <ellipse cx="65" cy="118" rx="15" ry="7" fill="#1a1a1a" />
        <circle cx="59" cy="120" r="2.5" fill="#ff8fa3" opacity="0.9" />
        <circle cx="65" cy="122" r="3" fill="#ff8fa3" opacity="0.9" />
        <circle cx="71" cy="120" r="2.5" fill="#ff8fa3" opacity="0.9" />
      </motion.g>

      {/* ── BODY ── */}
      {/* White with subtle grey stroke for boundary contrast */}
      <ellipse cx="50" cy="95" rx="28" ry="24" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Body black patches sides */}
      <ellipse cx="23" cy="98" rx="11" ry="17" fill="#1a1a1a" />
      <ellipse cx="77" cy="98" rx="11" ry="17" fill="#1a1a1a" />
      {/* Body center white overlay */}
      <ellipse cx="50" cy="95" rx="19" ry="21" fill="#ffffff" />
      {/* Subtle Belly shadow/tone */}
      <ellipse cx="50" cy="102" rx="14" ry="9" fill="#f0f0f0" />

      {/* ── LEFT ARM ── */}
      <motion.g
        animate={{ rotate: leftArmRotate }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        style={{ originX: '24px', originY: '88px' }}
      >
        <rect x="14" y="88" width="13" height="27" rx="6.5" fill="#1a1a1a" />
        {/* Left paw */}
        <ellipse cx="20.5" cy="116" rx="8.5" ry="6.5" fill="#1a1a1a" />
        <circle cx="15" cy="117" r="2" fill="#ff8fa3" opacity="0.9" />
        <circle cx="20.5" cy="119.5" r="2" fill="#ff8fa3" opacity="0.9" />
        <circle cx="26" cy="117" r="2" fill="#ff8fa3" opacity="0.9" />
      </motion.g>

      {/* ── RIGHT ARM ── */}
      <motion.g
        animate={{ rotate: rightArmRotate }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        style={{ originX: '76px', originY: '88px' }}
      >
        <rect x="73" y="88" width="13" height="27" rx="6.5" fill="#1a1a1a" />
        {/* Right paw */}
        <ellipse cx="79.5" cy="116" rx="8.5" ry="6.5" fill="#1a1a1a" />
        <circle cx="74" cy="117" r="2" fill="#ff8fa3" opacity="0.9" />
        <circle cx="79.5" cy="119.5" r="2" fill="#ff8fa3" opacity="0.9" />
        <circle cx="85" cy="117" r="2" fill="#ff8fa3" opacity="0.9" />
      </motion.g>

      {/* ── HEAD ── */}
      {/* Ears */}
      <circle cx="20" cy="31" r="13.5" fill="#1a1a1a" />
      <circle cx="80" cy="31" r="13.5" fill="#1a1a1a" />
      <circle cx="20" cy="31" r="7" fill="#2a2a2a" />
      <circle cx="80" cy="31" r="7" fill="#2a2a2a" />

      {/* Head Main (Pure White) with subtle grey stroke for boundary contrast */}
      <ellipse cx="50" cy="54" rx="34" ry="31" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />

      {/* ── SMALLER ORIGINAL STYLE EYES ── */}
      {/* Eye patches - Lowered slightly, widened angle */}
      <ellipse cx="35" cy="49" rx="8.5" ry="7.5" fill="#1a1a1a" transform="rotate(-15 35 49)" />
      <ellipse cx="65" cy="49" rx="8.5" ry="7.5" fill="#1a1a1a" transform="rotate(15 65 49)" />

      {/* Eyes white */}
      <ellipse cx="35" cy="49" rx="3.5" ry="4" fill="white" />
      <ellipse cx="65" cy="49" rx="3.5" ry="4" fill="white" />

      {/* Pupils */}
      <motion.circle
        cx="35.5" cy="49" r="2.2"
        fill="#1a1a1a"
        animate={phase === 'presenting' ? { cy: 47.5, r: 2.6 } : { cy: 49, r: 2.2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />
      <motion.circle
        cx="64.5" cy="49" r="2.2"
        fill="#1a1a1a"
        animate={phase === 'presenting' ? { cy: 47.5, r: 2.6 } : { cy: 49, r: 2.2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />

      {/* Eye shine */}
      <circle cx="36.5" cy="48" r="0.9" fill="white" />
      <circle cx="63.5" cy="48" r="0.9" fill="white" />

      {/* Nose - Wider and cuter */}
      <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#1a1a1a" />
      <ellipse cx="50" cy="60" rx="2" ry="1" fill="#4a4a4a" />

      {/* Mouth — distinct 'w' shape */}
      {phase === 'presenting' ? (
        <path d="M43 66 Q50 75 57 66" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : isWalking ? (
        <path d="M44 66 Q47 70 50 66 Q53 70 56 66" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M44 66 Q47 70 50 66 Q53 70 56 66" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      {/* Blush cheeks */}
      <ellipse cx="23" cy="63" rx="7" ry="4" fill="#ffb3c1" opacity="0.7" />
      <ellipse cx="77" cy="63" rx="7" ry="4" fill="#ffb3c1" opacity="0.7" />

      {/* Heart on chest — only when presenting */}
      <AnimatePresence>
        {phase === 'presenting' && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ originX: '50px', originY: '95px' }}
          >
            <path
              d="M44 91 Q44 85 50 88 Q56 85 56 91 Q56 97 50 102 Q44 97 44 91Z"
              fill="#ff6b8a"
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Paper note in paw when presenting */}
      <AnimatePresence>
        {phase === 'presenting' && (
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <rect x="60" y="70" width="28" height="22" rx="3" fill="#fef3c7" stroke="#d4a867" strokeWidth="1" />
            <line x1="64" y1="77" x2="84" y2="77" stroke="#d4a867" strokeWidth="0.8" />
            <line x1="64" y1="82" x2="84" y2="82" stroke="#d4a867" strokeWidth="0.8" />
            <line x1="64" y1="87" x2="78" y2="87" stroke="#d4a867" strokeWidth="0.8" />
          </motion.g>
        )}
      </AnimatePresence>

    </svg>
  );
}