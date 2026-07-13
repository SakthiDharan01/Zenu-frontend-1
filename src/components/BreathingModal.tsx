import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ParticleCanvas } from "./ParticleCanvas";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  HelpCircle,
  Plus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
    (type: "start" | "end") => {
      if (isMuted) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = type === "start" ? 440 : 330;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    },
    [isMuted]
  );

  useEffect(() => {
    if (isPaused || !isOpen || isComplete) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current - pausedDurationRef.current) / 1000);
      setElapsedTime(elapsed);

      if (elapsed >= totalDuration) {
        setIsComplete(true);
        playChime("end");
        toast("Nice — you finished! How do you feel?", {
          action: {
            label: "Save to journal",
            onClick: () => {
              console.log("Saving session:", { pattern: patternId, duration: totalDuration });
            }
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isOpen, totalDuration, isComplete, playChime, patternId]);

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
    if (isPaused) {
      playChime("start");
    }
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TooltipProvider>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="px-6 pt-6 pb-0 flex flex-row items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-3 relative" onMouseLeave={() => setShowHelp(false)}>
            <DialogTitle className="text-2xl font-headline">{pattern.name}</DialogTitle>

            <div>
              <button
                className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={() => setShowHelp((s) => !s)}
                aria-expanded={showHelp}
                aria-label="Show help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>

              {showHelp && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white text-gray-800 rounded-md shadow-lg p-4 border border-gray-200 z-50">
                  <h4 className="font-semibold mb-2">How breathing helps</h4>
                  <p className="text-sm">
                    Slow, rhythmic breathing reduces sympathetic activity and engages the
                    parasympathetic system — lowering heart rate and calming the body. Try the Box
                    for stability and 4-7-8 for deeper relaxation.
                  </p>
                  <div className="absolute left-4 -top-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white" />
                </div>
              )}
            </div>
          </div>
          {/* DialogPrimitive.Close is rendered inside DialogContent; no extra close button here to avoid duplicates */}
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          <ParticleCanvas
            pattern={pattern.steps}
            cycleDuration={cycleDuration}
            isPaused={isPaused}
            speed={speed}
          />
        </div>

        <div className="px-6 pb-6 space-y-4 border-t border-border/30 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-headline font-semibold text-foreground">
              {formatTime(totalDuration - elapsedTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {duration} min session
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute" : "Mute"} chimes</p>
              </TooltipContent>
            </Tooltip>

            <button
              onClick={togglePlayPause}
              className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isComplete}
            >
              {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={skipCycle}
                  disabled={isComplete}
                  className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Skip cycle
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={cycleSpeed}
                  className="h-10 px-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  {speed}x
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Change speed
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={increaseDuration}
                  className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Change duration
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
};
