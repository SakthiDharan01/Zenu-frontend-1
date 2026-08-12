"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import PandaAvatar from '@/components/PandaAvatar';
import {
  ZenBreathingCircle,
  ZenButton,
  ZenDialog,
  ZenDialogContent,
  ZenDialogHeader,
  ZenDialogTitle,
} from '@/components/zen';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: {
    id: string;
    name: string;
    steps: number[];
    defaultMinutes: number;
  };
  onComplete?: (durationSeconds: number) => void;
}

export const BreathingModal = ({ isOpen, onClose, pattern, onComplete }: BreathingModalProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(pattern.defaultMinutes);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState('Inhale');
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedDurationRef = useRef<number>(0);

  const cycleDuration = pattern.steps.reduce((a, b) => a + b, 0);
  const totalDuration = duration * 60;
  const completionLoggedRef = useRef(false);
  const progress = (elapsedTime / totalDuration) * 100;
  const patternId = pattern.id;

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      setIsPaused(false);
      setIsComplete(false);
      setPhase('Inhale');
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      completionLoggedRef.current = false;
    }
  }, [isOpen, patternId, pattern.defaultMinutes]);

  useEffect(() => {
    setDuration(pattern.defaultMinutes);
  }, [pattern.defaultMinutes]);

  useEffect(() => {
    completionLoggedRef.current = false;
  }, [patternId]);

  const playChime = useCallback(
    (type: 'start' | 'end') => {
      if (isMuted) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = type === 'start' ? 440 : 330;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    },
    [isMuted],
  );

  useEffect(() => {
    if (isPaused || !isOpen || isComplete) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current - pausedDurationRef.current) / 1000);
      setElapsedTime(elapsed);

      if (elapsed >= totalDuration) {
        setIsComplete(true);
        playChime('end');
        toast('Nice — you finished! How do you feel?');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isOpen, totalDuration, isComplete, playChime]);

  useEffect(() => {
    if (isComplete && !completionLoggedRef.current) {
      completionLoggedRef.current = true;
      onComplete?.(totalDuration);
    }
  }, [isComplete, onComplete, totalDuration]);

  useEffect(() => {
    if (isPaused) {
      const pauseStart = Date.now();
      return () => {
        pausedDurationRef.current += Date.now() - pauseStart;
      };
    }
  }, [isPaused]);

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
    if (isPaused) playChime('start');
  };

  const skipCycle = () => {
    const cyclesElapsed = Math.floor(elapsedTime / cycleDuration);
    const nextCycleTime = (cyclesElapsed + 1) * cycleDuration;
    setElapsedTime(Math.min(nextCycleTime, totalDuration));
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    toast(`Speed: ${nextSpeed}x`);
  };

  const increaseDuration = () => {
    const presets = [3, 5, 10];
    const currentIndex = presets.indexOf(duration);
    const nextDuration = presets[(currentIndex + 1) % presets.length];
    setDuration(nextDuration);
    toast(`Session length: ${nextDuration} min`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <ZenDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ZenDialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
          <ZenDialogHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between border-b border-zen-border-soft space-y-0">
            <div className="flex items-center gap-3 relative" onMouseLeave={() => setShowHelp(false)}>
              <PandaAvatar state="breathing" size={40} label="Panda breathing with you" />
              <div>
                <ZenDialogTitle>{pattern.name}</ZenDialogTitle>
                <p className="zen-caption text-zen-fg-muted mt-0.5 capitalize">{phase}</p>
              </div>
              <div>
                <ZenButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowHelp((s) => !s)}
                  aria-expanded={showHelp}
                  aria-label="Show help"
                >
                  <HelpCircle className="h-4 w-4" />
                </ZenButton>
                {showHelp ? (
                  <div className="absolute left-0 top-full mt-2 w-80 glass-elevated rounded-zen-lg shadow-zen-elevated p-4 z-50">
                    <h4 className="font-semibold mb-2 text-zen-fg">How breathing helps</h4>
                    <p className="zen-body-sm text-zen-fg-muted">
                      Slow, rhythmic breathing reduces sympathetic activity and engages the
                      parasympathetic system — lowering heart rate and calming the body.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </ZenDialogHeader>

          <div className="flex-1 relative overflow-hidden min-h-0">
            <ZenBreathingCircle
              pattern={pattern.steps}
              cycleDuration={cycleDuration}
              isPaused={isPaused}
              speed={speed}
              onPhaseChange={(nextPhase) => setPhase(nextPhase)}
            />
          </div>

          <div className="px-6 pb-6 space-y-4 border-t border-zen-border-soft pt-4">
            <div className="flex items-center justify-between">
              <div className="zen-metric text-zen-fg">{formatTime(totalDuration - elapsedTime)}</div>
              <div className="zen-body-sm text-zen-fg-muted">{duration} min session</div>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex items-center justify-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ZenButton
                    variant="outline"
                    size="icon-md"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? 'Unmute chimes' : 'Mute chimes'}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </ZenButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? 'Unmute' : 'Mute'} chimes</p>
                </TooltipContent>
              </Tooltip>

              <ZenButton
                size="icon-lg"
                onClick={togglePlayPause}
                disabled={isComplete}
                aria-label={isPaused ? 'Resume' : 'Pause'}
                className="rounded-full h-14 w-14"
              >
                {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </ZenButton>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ZenButton
                    variant="outline"
                    size="icon-md"
                    onClick={skipCycle}
                    disabled={isComplete}
                    aria-label="Skip cycle"
                  >
                    <SkipForward className="h-4 w-4" />
                  </ZenButton>
                </TooltipTrigger>
                <TooltipContent>Skip cycle</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ZenButton variant="outline" size="sm" onClick={cycleSpeed} aria-label="Change speed">
                    {speed}x
                  </ZenButton>
                </TooltipTrigger>
                <TooltipContent>Change speed</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ZenButton
                    variant="outline"
                    size="icon-md"
                    onClick={increaseDuration}
                    aria-label="Change duration"
                  >
                    <Plus className="h-4 w-4" />
                  </ZenButton>
                </TooltipTrigger>
                <TooltipContent>Change duration</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </ZenDialogContent>
      </ZenDialog>
    </TooltipProvider>
  );
};
