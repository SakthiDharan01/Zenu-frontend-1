"use client";

import { usePathname } from 'next/navigation';
import { Panda } from '@/components/panda/Panda';
import {
  getPandaContextPresentation,
  shouldShowFloatingCompanion,
} from '@/components/panda/contextPresentation';
import { usePandaStore } from '@/components/panda/store';
import './panda.css';

/**
 * Quiet floating companion (ambient/responsive).
 * Hides when a proactive PandaNotification prompt is active.
 * Presentation comes from route context — never fetches recommendations.
 */
export function PandaCompanionHost() {
  const pathname = usePathname();
  const promptVisible = usePandaStore((s) => Boolean(s.prompt?.visible));

  if (!shouldShowFloatingCompanion(pathname) || promptVisible) {
    return null;
  }

  const presentation = getPandaContextPresentation(pathname);
  if (!presentation) return null;

  return (
    <div
      className="zenu-panda-companion"
      aria-hidden="true"
      data-mode={presentation.mode}
    >
      {/* Size controlled by CSS; width/height attrs keep SVG layout stable */}
      <div className="zenu-panda-companion__stage">
        <Panda
          emotion={presentation.emotion}
          activity={presentation.activity}
          animation={presentation.animation}
          mode={presentation.mode}
          size={64}
          animated
          label="ZenU panda companion"
        />
      </div>
    </div>
  );
}

export default PandaCompanionHost;
