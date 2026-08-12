"use client";

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Flame, CloudRain, Waves, TreePine, SlidersHorizontal } from 'lucide-react';
import {
  ZenSheet,
  ZenSheetContent,
  ZenSheetHeader,
  ZenSheetTitle,
} from './ZenSheet';
import { ZenButton } from './ZenButton';
import { AMBIENT_SOURCES } from '@/lib/meditationAudio';
import { cn } from '@/lib/utils';

type SoundType = 'fire' | 'rain' | 'forest' | 'ocean';

const SOUND_CONTROLS = [
  { type: 'fire' as const, label: 'Fire', icon: Flame, tint: 'text-zen-joy', sliderClass: 'slider-fire' },
  { type: 'rain' as const, label: 'Rain', icon: CloudRain, tint: 'text-zen-primary', sliderClass: 'slider-rain' },
  { type: 'forest' as const, label: 'Forest', icon: TreePine, tint: 'text-zen-accent', sliderClass: 'slider-forest' },
  { type: 'ocean' as const, label: 'Ocean', icon: Waves, tint: 'text-zen-secondary', sliderClass: 'slider-ocean' },
];

function SoundscapeControls({
  volumes,
  onChange,
}: {
  volumes: Record<SoundType, number>;
  onChange: (sound: SoundType, value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {SOUND_CONTROLS.map(({ type, label, icon: Icon, tint, sliderClass }) => (
        <label key={type} className="flex items-center gap-3 min-h-11 w-full min-w-0">
          <span className={cn('flex-shrink-0', tint)}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={volumes[type]}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(type, parseInt(e.target.value, 10))
            }
            aria-label={`${label} ambient volume`}
            className={cn(
              'flex-1 min-w-0 w-full h-2 bg-zen-bg-muted rounded-lg appearance-none cursor-pointer slider-thumb',
              sliderClass,
            )}
          />
          <span className="zen-caption text-zen-fg-muted w-12 shrink-0 capitalize">{type}</span>
        </label>
      ))}
    </div>
  );
}

/**
 * Ambient soundscape mixer — desktop glass panel, mobile bottom sheet.
 * Separate from guided meditation narration (ZenGuidedPlayer).
 */
export function ZenSoundscapeBar({ className }: { className?: string }) {
  const [volumes, setVolumes] = useState({ fire: 0, rain: 0, forest: 0, ocean: 0 });
  const [sheetOpen, setSheetOpen] = useState(false);
  const fireRef = useRef<HTMLAudioElement>(null);
  const rainRef = useRef<HTMLAudioElement>(null);
  const forestRef = useRef<HTMLAudioElement>(null);
  const oceanRef = useRef<HTMLAudioElement>(null);

  const handleVolumeChange = (sound: SoundType, newVolume: number) => {
    setVolumes((prev) => ({ ...prev, [sound]: newVolume }));
  };

  useEffect(() => {
    const refs: Record<SoundType, HTMLAudioElement | null> = {
      fire: fireRef.current,
      rain: rainRef.current,
      forest: forestRef.current,
      ocean: oceanRef.current,
    };

    (Object.keys(volumes) as SoundType[]).forEach((sound) => {
      const audio = refs[sound];
      const volume = volumes[sound];
      if (!audio) return;

      if (volume > 0 && audio.paused) {
        audio.play().catch((error) => console.warn(`Could not play ${sound} audio:`, error));
      }
      audio.volume = volume / 100;
      if (volume === 0 && !audio.paused) {
        audio.pause();
      }
    });
  }, [volumes]);

  useEffect(() => {
    return () => {
      [fireRef, rainRef, forestRef, oceanRef].forEach((ref) => {
        ref.current?.pause();
      });
    };
  }, []);

  return (
    <>
      {/* Desktop floating bar */}
      <div
        className={cn(
          'hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-30',
          className,
        )}
      >
        <div className="glass-floating rounded-zen-xl p-5 w-56 max-w-[calc(100vw-2rem)] shadow-zen-floating">
          <p className="zen-label text-zen-fg-subtle mb-1">Ambient</p>
          <p className="zen-caption text-zen-fg-muted mb-4">Layer soft background sound</p>
          <SoundscapeControls volumes={volumes} onChange={handleVolumeChange} />
        </div>
      </div>

      {/* Mobile trigger — clear of ZenBottomNav + safe area (focus mode has no bottom nav) */}
      <div className="md:hidden fixed right-4 z-40 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <ZenButton
          variant="glass"
          size="icon-lg"
          className="rounded-full shadow-zen-floating"
          aria-label="Open ambient soundscape controls"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </ZenButton>
      </div>

      <ZenSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <ZenSheetContent side="bottom" className="md:hidden pb-safe max-h-[85dvh] overflow-y-auto">
          <ZenSheetHeader>
            <ZenSheetTitle>Ambient soundscape</ZenSheetTitle>
          </ZenSheetHeader>
          <div className="mt-4 min-w-0">
            <SoundscapeControls volumes={volumes} onChange={handleVolumeChange} />
          </div>
        </ZenSheetContent>
      </ZenSheet>

      <audio ref={fireRef} src={AMBIENT_SOURCES.fire} loop preload="none" />
      <audio ref={rainRef} src={AMBIENT_SOURCES.rain} loop preload="none" />
      <audio ref={forestRef} src={AMBIENT_SOURCES.forest} loop preload="none" />
      <audio ref={oceanRef} src={AMBIENT_SOURCES.ocean} loop preload="none" />
    </>
  );
}
