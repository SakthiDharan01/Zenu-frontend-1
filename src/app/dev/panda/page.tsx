"use client";

import { useMemo, useState } from 'react';
import {
  Panda,
  PandaNotification,
  showPandaMessage,
  resetPandaCooldown,
  mapRecommendationToPanda,
  MODULE_ROUTES,
  V1_EMOTIONS,
  V1_ACTIVITIES,
} from '@/components/panda';
import type { PandaActivity, PandaAnimation, PandaEmotion, PandaMode } from '@/components/panda';
import { ZenButton, ZenPage, ZenContainer } from '@/components/zen';
import { cn } from '@/lib/utils';

const ANIMATIONS: PandaAnimation[] = [
  'idle',
  'breathe',
  'bounce',
  'tilt',
  'attentive',
  'talk',
  'writing',
];
const MODES: PandaMode[] = ['ambient', 'responsive', 'proactive'];
const PRODUCTION_MODULE_IDS = Object.keys(MODULE_ROUTES);

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  allowNull,
  nullLabel = 'None',
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
  allowNull?: boolean;
  nullLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="zen-caption font-medium text-zen-fg-muted uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-2">
        {allowNull ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              'min-h-10 px-3 rounded-zen-md text-sm border transition-colors',
              value === null
                ? 'bg-zen-primary text-white border-zen-primary'
                : 'bg-zen-bg-subtle text-zen-fg border-zen-border-soft hover:bg-zen-bg-muted',
            )}
          >
            {nullLabel}
          </button>
        ) : null}
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'min-h-10 px-3 rounded-zen-md text-sm border capitalize transition-colors',
              value === opt
                ? 'bg-zen-primary text-white border-zen-primary'
                : 'bg-zen-bg-subtle text-zen-fg border-zen-border-soft hover:bg-zen-bg-muted',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PandaPlaygroundPage() {
  const [emotion, setEmotion] = useState<PandaEmotion>('neutral');
  const [activity, setActivity] = useState<PandaActivity | null>(null);
  const [animation, setAnimation] = useState<PandaAnimation | null>(null);
  const [mode, setMode] = useState<PandaMode>('responsive');
  const [previewSize, setPreviewSize] = useState(240);
  const [productionModuleId, setProductionModuleId] = useState<string>('breathing');

  const effectiveAnimation = useMemo(() => animation ?? undefined, [animation]);

  const productionMapped = useMemo(
    () => mapRecommendationToPanda(productionModuleId),
    [productionModuleId],
  );

  return (
    <ZenPage atmosphere="home" gradient className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="md" className="py-10 space-y-8">
        <header className="space-y-1 text-center">
          <h1 className="zen-h1 text-zen-fg">Panda Playground</h1>
          <p className="zen-body-sm text-zen-fg-muted">
            Inspect master SVG outlines, emotions, and activity states against the reference sheet.
          </p>
        </header>

        <div className="glass-elevated rounded-zen-2xl p-8 flex flex-col items-center gap-4">
          <div
            className="rounded-zen-xl bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] border border-zen-border-soft flex items-center justify-center"
            style={{ width: Math.max(previewSize + 48, 200), height: Math.max(previewSize + 48, 200) }}
          >
            <Panda
              emotion={emotion}
              activity={activity}
              animation={effectiveAnimation}
              mode={mode === 'proactive' ? 'responsive' : mode}
              size={previewSize}
              animated
              interactive
              label={`Panda ${emotion}`}
            />
          </div>
          <p className="zen-caption text-zen-fg-subtle">
            {emotion}
            {activity ? ` · ${activity}` : ''}
            {` · ${effectiveAnimation ?? 'auto'} · ${mode} · ${previewSize}px`}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[64, 128, 240, 280].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPreviewSize(s)}
                className={cn(
                  'min-h-9 px-3 rounded-zen-md text-xs border',
                  previewSize === s
                    ? 'bg-zen-primary text-white border-zen-primary'
                    : 'bg-zen-bg-subtle border-zen-border-soft',
                )}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>

        <div className="glass-elevated rounded-zen-2xl p-6 space-y-6">
          <ChipGroup
            label="Emotion"
            options={V1_EMOTIONS}
            value={emotion}
            onChange={(v) => v && setEmotion(v)}
          />
          <ChipGroup
            label="Activity"
            options={V1_ACTIVITIES}
            value={activity}
            onChange={(v) => setActivity(v)}
            allowNull
          />
          <ChipGroup
            label="Animation"
            options={ANIMATIONS}
            value={animation}
            onChange={(v) => setAnimation(v)}
            allowNull
            nullLabel="Auto"
          />
          <ChipGroup
            label="Mode"
            options={MODES}
            value={mode}
            onChange={(v) => {
              if (v) setMode(v);
            }}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <ZenButton
              type="button"
              onClick={() => {
                const mapped = mapRecommendationToPanda('breathing');
                showPandaMessage({
                  message: mapped.defaultMessage,
                  action: mapped.actionLabel,
                  secondaryAction: 'Maybe later',
                  href: mapped.href,
                  recommendationKey: mapped.recommendationKey,
                  emotion: mapped.emotion,
                  activity: mapped.activity,
                  animation: mapped.animation,
                  force: true,
                });
              }}
            >
              Test Panda Message
            </ZenButton>
            <ZenButton type="button" variant="outline" onClick={() => resetPandaCooldown()}>
              Reset cooldowns
            </ZenButton>
          </div>
        </div>

        {/* Adapter-only production presentation preview — does not invent ranking */}
        <div className="glass-elevated rounded-zen-2xl p-6 space-y-4">
          <header className="space-y-1">
            <h2 className="zen-h3 text-zen-fg">Preview production presentation</h2>
            <p className="zen-caption text-zen-fg-muted">
              Maps a real backend <code className="text-xs">module_id</code> through{' '}
              <code className="text-xs">mapRecommendationToPanda()</code> only — no frontend ranking.
            </p>
          </header>

          <ChipGroup
            label="module_id"
            options={PRODUCTION_MODULE_IDS}
            value={productionModuleId}
            onChange={(v) => v && setProductionModuleId(v)}
          />

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-zen-xl bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] border border-zen-border-soft flex items-center justify-center p-4">
              <Panda
                emotion={productionMapped.emotion}
                activity={productionMapped.activity}
                animation={productionMapped.animation}
                mode="proactive"
                size={128}
                animated
                label={`Production preview ${productionModuleId}`}
              />
            </div>
            <div className="zen-body-sm text-zen-fg space-y-1 flex-1">
              <p>
                <span className="text-zen-fg-muted">emotion:</span> {productionMapped.emotion}
              </p>
              <p>
                <span className="text-zen-fg-muted">activity:</span>{' '}
                {productionMapped.activity ?? 'null'}
              </p>
              <p>
                <span className="text-zen-fg-muted">animation:</span> {productionMapped.animation}
              </p>
              <p>
                <span className="text-zen-fg-muted">href:</span> {productionMapped.href}
              </p>
              <p>
                <span className="text-zen-fg-muted">message:</span> {productionMapped.defaultMessage}
              </p>
              <p>
                <span className="text-zen-fg-muted">action:</span> {productionMapped.actionLabel}
              </p>
            </div>
          </div>

          <ZenButton
            type="button"
            onClick={() => {
              showPandaMessage({
                message: productionMapped.defaultMessage,
                action: productionMapped.actionLabel,
                secondaryAction: 'Maybe later',
                href: productionMapped.href,
                recommendationKey: productionMapped.recommendationKey,
                emotion: productionMapped.emotion,
                activity: productionMapped.activity,
                animation: productionMapped.animation,
                force: true,
              });
            }}
          >
            Show production message
          </ZenButton>
        </div>
      </ZenContainer>

      <PandaNotification />
    </ZenPage>
  );
}
