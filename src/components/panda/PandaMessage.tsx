"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { ZenButton } from '@/components/zen';
import { PANDA_SPRING } from '@/components/panda/animations';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import './panda.css';

export type PandaMessageProps = {
  message: string;
  action?: string;
  secondaryAction?: string;
  visible?: boolean;
  position?: 'bottom-right' | 'inline';
  className?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
};

export function PandaMessage({
  message,
  action,
  secondaryAction,
  visible = true,
  position = 'inline',
  className,
  onAction,
  onSecondaryAction,
}: PandaMessageProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={cn(
            'zenu-panda-message',
            position === 'bottom-right' && 'w-full',
            className,
          )}
          role="dialog"
          aria-live="polite"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
          transition={reduced ? { duration: 0.2 } : PANDA_SPRING}
        >
          <p className="zen-body-sm text-zen-fg leading-relaxed">{message}</p>
          {(action || secondaryAction) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {action ? (
                <ZenButton type="button" size="sm" onClick={onAction}>
                  {action}
                </ZenButton>
              ) : null}
              {secondaryAction ? (
                <ZenButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onSecondaryAction}
                >
                  {secondaryAction}
                </ZenButton>
              ) : null}
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default PandaMessage;
