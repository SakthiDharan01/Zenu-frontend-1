"use client";

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Panda } from '@/components/panda/Panda';
import { PandaMessage } from '@/components/panda/PandaMessage';
import {
  completePandaMessage,
  dismissPandaMessage,
} from '@/components/panda/controller';
import { PANDA_SPRING } from '@/components/panda/animations';
import { usePandaStore } from '@/components/panda/store';
import { setRecommendationLaunch } from '@/lib/recommendationAttribution';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import './panda.css';

declare global {
  interface Window {
    __zenuPandaNotifyHost?: string;
  }
}

/**
 * Host for proactive panda prompts.
 * Safe to mount in layout and /dev/panda — only one active host renders.
 */
export function PandaNotification() {
  const instanceId = useId();
  const [isHost, setIsHost] = useState(false);
  const prompt = usePandaStore((s) => s.prompt);
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.__zenuPandaNotifyHost) {
      window.__zenuPandaNotifyHost = instanceId;
      setIsHost(true);
    } else {
      setIsHost(window.__zenuPandaNotifyHost === instanceId);
    }
    return () => {
      if (window.__zenuPandaNotifyHost === instanceId) {
        delete window.__zenuPandaNotifyHost;
      }
    };
  }, [instanceId]);

  if (!isHost) return null;

  return (
    <div className="zenu-panda-notify" aria-live="polite">
      <AnimatePresence>
        {prompt?.visible ? (
          <motion.div
            key={prompt.id}
            className="flex flex-col items-end gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, y: 6 }}
            transition={reduced ? { duration: 0.2 } : PANDA_SPRING}
          >
            <Panda
              mode="proactive"
              emotion={prompt.presentation.emotion}
              activity={prompt.presentation.activity}
              animation={prompt.presentation.animation}
              size={88}
              animated
            />
            <PandaMessage
              position="bottom-right"
              visible={prompt.bubbleVisible}
              message={prompt.message.message}
              action={prompt.message.action}
              secondaryAction={prompt.message.secondaryAction ?? 'Maybe later'}
              onAction={() => {
                const href = prompt.message.href;
                if (href) {
                  setRecommendationLaunch(
                    prompt.message.recommendationLogId,
                    href,
                  );
                }
                completePandaMessage();
                if (href) router.push(href);
              }}
              onSecondaryAction={() => dismissPandaMessage()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default PandaNotification;
