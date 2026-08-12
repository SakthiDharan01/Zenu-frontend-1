"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Headphones,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import PandaAvatar from '@/components/PandaAvatar';
import { ZenButton } from '@/components/zen';
import { resolveGuidedScript } from '@/lib/meditationAudio';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

type ZenGuidedPlayerProps = {
  title: string;
  audioUrl: string | null;
  category?: string | null;
  durationMinutes: number;
  onPlayStart?: () => void;
  onComplete?: () => void;
  className?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Guided narration player — distinct from ambient ZenSoundscapeBar.
 * Uses HTMLAudio when a URL exists; SpeechSynthesis as accessible fallback.
 */
export function ZenGuidedPlayer({
  title,
  audioUrl,
  category,
  durationMinutes,
  onPlayStart,
  onComplete,
  className,
}: ZenGuidedPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const script = useMemo(() => resolveGuidedScript(title), [title]);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(Math.max(60, durationMinutes * 60));
  const [loading, setLoading] = useState(Boolean(audioUrl));
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'audio' | 'speech'>(audioUrl ? 'audio' : 'speech');
  const startedRef = useRef(false);

  useEffect(() => {
    setMode(audioUrl ? 'audio' : 'speech');
    setLoading(Boolean(audioUrl));
    setError(null);
    setPlaying(false);
    setCurrent(0);
    startedRef.current = false;
  }, [audioUrl, title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      audioEl?.pause();
    };
  }, []);

  const markStarted = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      onPlayStart?.();
    }
  };

  const togglePlay = async () => {
    setError(null);

    if (mode === 'speech' || !audioUrl) {
      if (!script || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setError('Guided narration is unavailable in this browser.');
        return;
      }
      if (playing) {
        window.speechSynthesis.cancel();
        setPlaying(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(script);
      utter.rate = 0.92;
      utter.onstart = () => {
        setPlaying(true);
        markStarted();
      };
      utter.onend = () => {
        setPlaying(false);
        onComplete?.();
      };
      utter.onerror = () => {
        setPlaying(false);
        setError('Could not start guided narration.');
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      markStarted();
    } catch {
      setError('Playback was blocked. Tap play again or check device sound.');
      setPlaying(false);
    }
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || mode !== 'audio') return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const pandaState = playing ? (reducedMotion ? 'resting' : 'listening') : 'idle';

  return (
    <div
      className={cn(
        'rounded-zen-xl border border-zen-border-soft bg-zen-bg-subtle/80 p-4 space-y-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <PandaAvatar state={pandaState} size={56} label={`Panda ${pandaState}`} />
        <div className="min-w-0 flex-1">
          <p className="zen-label text-zen-secondary">Guided session</p>
          <p className="zen-body font-medium text-zen-fg truncate">{title}</p>
          <p className="zen-caption text-zen-fg-muted">
            {durationMinutes} min{category ? ` · ${category}` : ''}
            {mode === 'speech' ? ' · Voice guide' : ' · Audio bed'}
          </p>
        </div>
      </div>

      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
            setLoading(false);
          }}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onPlay={() => {
            setPlaying(true);
            markStarted();
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            onComplete?.();
          }}
          onError={() => {
            setLoading(false);
            setMode('speech');
            setError('Audio file unavailable — switching to voice guide.');
          }}
        />
      ) : null}

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.1}
          value={Math.min(current, duration)}
          disabled={mode === 'speech'}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Guided session progress"
          className="w-full h-2 accent-zen-primary bg-zen-bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-40"
        />
        <div className="flex justify-between zen-caption text-zen-fg-muted">
          <span>{formatTime(current)}</span>
          <span>{loading ? 'Loading…' : formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ZenButton
          type="button"
          size="lg"
          onClick={() => void togglePlay()}
          aria-label={playing ? 'Pause guided session' : 'Play guided session'}
          className="min-w-11"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          <span className="ml-2">{playing ? 'Pause' : 'Play'}</span>
        </ZenButton>

        <ZenButton
          type="button"
          variant="ghost"
          size="icon-md"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={() => setMuted((m) => !m)}
          disabled={mode === 'speech'}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </ZenButton>

        <label className="flex items-center gap-2 flex-1 min-w-[8rem] min-h-11">
          <span className="sr-only">Guided volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            disabled={mode === 'speech' || muted}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Guided volume"
            className="w-full h-1.5 accent-zen-primary bg-zen-bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-40"
          />
        </label>

        <span className="inline-flex items-center gap-1 zen-caption text-zen-fg-subtle">
          <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
          Guided
        </span>
      </div>

      {error ? (
        <p className="zen-caption text-zen-warning" role="status">
          {error}
        </p>
      ) : null}

      {mode === 'speech' && script ? (
        <p className="zen-body-sm text-zen-fg-muted leading-relaxed border-t border-zen-border-soft pt-3">
          {script}
        </p>
      ) : null}
    </div>
  );
}
