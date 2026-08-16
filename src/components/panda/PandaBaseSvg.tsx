"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import PandaMaster from '@/assets/panda/panda-base.svg';
import type { ComposedPandaVisual, PandaEyeMode } from '@/components/panda/types';
import { cn } from '@/lib/utils';

export type PandaBaseHandle = {
  root: SVGSVGElement | null;
};

type PandaBaseSvgProps = {
  className?: string;
  title?: string;
  visual: ComposedPandaVisual;
};

const EYE_MODES: PandaEyeMode[] = ['open', 'closedPeaceful', 'closedHappy', 'sad'];

function setOpacity(el: Element | null, value: number) {
  if (!el) return;
  el.setAttribute('opacity', String(value));
  (el as HTMLElement).style.pointerEvents = value > 0 ? 'auto' : 'none';
}

function applyComposedVisual(svg: SVGSVGElement, visual: ComposedPandaVisual) {
  const mouthPath = svg.querySelector(
    '[data-part="mouth"] path, [id$="-panda-mouth-path"]',
  );
  if (mouthPath) mouthPath.setAttribute('d', visual.mouthPath);

  const cheeks = svg.querySelectorAll('[data-part="cheeks"] ellipse');
  cheeks.forEach((c) => c.setAttribute('opacity', String(visual.cheekOpacity)));

  EYE_MODES.forEach((mode) => {
    setOpacity(svg.querySelector(`[data-eye="${mode}"]`), mode === visual.eyeMode ? 1 : 0);
  });

  const head = svg.querySelector('[data-part="head"]') as SVGGElement | null;
  if (head) {
    const { x, y, scale } = visual.headLayout;
    head.style.transformOrigin = '100px 90px';
    head.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${visual.headRotate}deg)`;
  }

  setOpacity(svg.querySelector('[data-part="pose-default"]'), visual.pose === 'default' ? 1 : 0);
  setOpacity(svg.querySelector('[data-part="pose-writing"]'), visual.pose === 'writing' ? 1 : 0);

  const meditatingFeet = visual.pose === 'default' && visual.armSet === 'meditating';
  setOpacity(svg.querySelector('[data-part="feet"]'), meditatingFeet ? 0 : visual.pose === 'default' ? 1 : 0);
  setOpacity(svg.querySelector('[data-part="feet-meditating"]'), meditatingFeet ? 1 : 0);

  // Soften ground shadow for writing (lower / wider contact)
  const shadow = svg.querySelector('[data-part="shadow"]') as SVGEllipseElement | null;
  if (shadow) {
    shadow.setAttribute('cy', visual.pose === 'writing' ? '200' : '198');
    shadow.setAttribute('rx', visual.pose === 'writing' ? '56' : '48');
  }

  const accessories = new Set(visual.accessories);
  svg.querySelectorAll('[data-accessory]').forEach((el) => {
    const key = el.getAttribute('data-accessory');
    if (key === 'writing' && visual.pose === 'writing') {
      setOpacity(el, 1);
      return;
    }
    setOpacity(el, key && accessories.has(key) ? 1 : 0);
  });

  svg.querySelectorAll('[data-arm-set]').forEach((el) => {
    const set = el.getAttribute('data-arm-set');
    setOpacity(el, set === visual.armSet ? 1 : 0);
  });

  const body = svg.querySelector('[data-part="body"]') as SVGGElement | null;
  if (body) {
    body.style.transformBox = 'fill-box';
    body.style.transformOrigin = 'center bottom';
    body.style.transform =
      visual.pose === 'default' ? `scale(${visual.bodyScale})` : '';
  }
}

export const PandaBaseSvg = forwardRef<PandaBaseHandle, PandaBaseSvgProps>(
  function PandaBaseSvg({ className, title = 'ZenU Panda', visual }, ref) {
    const reactId = useId().replace(/:/g, '');
    const prefix = `p${reactId}`;
    const svgRef = useRef<SVGSVGElement | null>(null);
    const readyRef = useRef(false);

    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;

      if (!readyRef.current) {
        const idMap = new Map<string, string>();
        svg.querySelectorAll('[id]').forEach((el) => {
          const oldId = el.getAttribute('id');
          if (!oldId) return;
          if (oldId.startsWith(`${prefix}-`)) {
            idMap.set(oldId.slice(prefix.length + 1), oldId);
            return;
          }
          const next = `${prefix}-${oldId}`;
          idMap.set(oldId, next);
          el.setAttribute('id', next);
        });

        svg.querySelectorAll('[fill^="url(#"]').forEach((el) => {
          const fill = el.getAttribute('fill');
          if (!fill?.startsWith('url(#')) return;
          const match = fill.match(/url\(#([^)]+)\)/);
          if (!match) return;
          const mapped = idMap.get(match[1]);
          if (mapped) el.setAttribute('fill', `url(#${mapped})`);
        });

        [
          ['panda-head', 'head'],
          ['panda-body', 'body'],
          ['panda-pose-default', 'pose-default'],
          ['panda-pose-writing', 'pose-writing'],
          ['panda-pen', 'pen'],
          ['panda-mouth', 'mouth'],
          ['panda-cheeks', 'cheeks'],
          ['panda-eyes', 'eyes'],
          ['panda-writing-hand', 'writing-hand'],
          ['panda-drawing-hand', 'drawing-hand'],
          ['panda-brush', 'brush'],
          ['panda-speech-bubble', 'speech-bubble'],
          ['panda-contact-shadow', 'shadow'],
        ].forEach(([suffix, part]) => {
          const el = svg.querySelector(`[id$="-${suffix}"]`);
          if (el && !el.getAttribute('data-part')) el.setAttribute('data-part', part);
        });

        readyRef.current = true;
      }

      applyComposedVisual(svg, visual);
    }, [prefix, visual]);

    useImperativeHandle(ref, () => ({ root: svgRef.current }));

    return (
      <PandaMaster
        ref={svgRef as React.Ref<SVGSVGElement>}
        className={cn('zenu-panda__svg', className)}
        role="img"
        aria-label={title}
      />
    );
  },
);
