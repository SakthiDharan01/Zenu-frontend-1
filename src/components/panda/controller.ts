"use client";

import {
  canShowPandaPrompt,
  markPandaCompleted,
  markPandaDismissed,
  markPandaShown,
  resetPandaCooldown,
} from '@/components/panda/cooldown';
import { resolvePresentation } from '@/components/panda/resolvePresentation';
import { usePandaStore } from '@/components/panda/store';
import type {
  PandaActivity,
  PandaAnimation,
  PandaEmotion,
  PandaMessagePayload,
} from '@/components/panda/types';

export type ShowPandaMessageInput = PandaMessagePayload & {
  emotion?: PandaEmotion;
  activity?: PandaActivity | null;
  animation?: PandaAnimation;
  state?: string;
  haptic?: boolean;
  force?: boolean;
  currentPath?: string;
};

function subtleHaptic() {
  try {
    navigator.vibrate?.(10);
  } catch {
    // unsupported
  }
}

/**
 * Proactive panda communication API.
 * Mount <PandaNotification /> (e.g. on /dev/panda) to render prompts.
 */
export function showPandaMessage(input: ShowPandaMessageInput): boolean {
  const recommendationKey = input.recommendationKey ?? 'generic';
  const allowed =
    input.force ||
    canShowPandaPrompt({
      recommendationKey,
      context: input.context,
      currentPath: input.currentPath,
      activityHref: input.href,
    });

  if (!allowed) return false;

  const presentation = resolvePresentation({
    state: input.state,
    emotion: input.emotion,
    activity: input.activity,
    animation: input.animation,
  });

  const message: PandaMessagePayload = {
    message: input.message,
    action: input.action,
    secondaryAction: input.secondaryAction,
    href: input.href,
    recommendationKey,
    recommendationLogId: input.recommendationLogId,
    context: input.context,
  };

  markPandaShown(recommendationKey, input.context);

  usePandaStore.getState().setPrompt({
    id: `${Date.now()}`,
    presentation: { ...presentation, message },
    message,
    visible: true,
    bubbleVisible: false,
  });

  if (input.haptic !== false) {
    window.setTimeout(() => subtleHaptic(), 280);
  }

  // Sequence: panda enters → pause → bubble (handled in PandaNotification)
  window.setTimeout(() => {
    usePandaStore.getState().setBubbleVisible(true);
  }, 420);

  return true;
}

export function dismissPandaMessage() {
  const prompt = usePandaStore.getState().prompt;
  if (prompt?.message.recommendationKey) {
    markPandaDismissed(prompt.message.recommendationKey, prompt.message.context);
  }
  usePandaStore.getState().hide();
}

export function completePandaMessage() {
  const prompt = usePandaStore.getState().prompt;
  if (prompt?.message.recommendationKey) {
    markPandaCompleted(prompt.message.recommendationKey, prompt.message.context);
  }
  usePandaStore.getState().hide();
}

export function hidePandaMessage() {
  usePandaStore.getState().hide();
}

export { resetPandaCooldown, canShowPandaPrompt };
