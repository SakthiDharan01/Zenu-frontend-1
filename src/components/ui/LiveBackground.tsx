'use client';

import { useEffect, useRef, memo } from 'react';
import { ModuleTheme } from '@/lib/moduleThemes';

interface Props {
  theme: ModuleTheme;
}

export default memo(function LiveBackground({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const effect = theme.liveEffect;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effect === 'none') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // ── Parse hex/rgb color to rgba ──────────────────────────────
    function hexToRgb(hex: string) {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? {
        r: parseInt(r[1], 16),
        g: parseInt(r[2], 16),
        b: parseInt(r[3], 16)
      } : { r: 255, g: 255, b: 255 };
    }

    const rgb = hexToRgb(theme.particles.color);
    const col = `${rgb.r},${rgb.g},${rgb.b}`;
    const count = theme.particles.count;
    const [sMin, sMax] = theme.particles.size;
    const spd = theme.particles.speed;

    // ── Particle pool ────────────────────────────────────────────
    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      opacity: number;
      phase: number;
      wobble?: number;
    }

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: sMin + Math.random() * (sMax - sMin),
      vx: (Math.random() - 0.5) * spd,
      vy: -Math.random() * spd - 0.05,
      opacity: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      wobble: (Math.random() - 0.5) * 0.01,
    }));

    // ── Aurora ribbons state ─────────────────────────────────────
    const auroraLines = Array.from({ length: 4 }, (_, i) => ({
      y: H * (0.2 + i * 0.15),
      amp: 40 + Math.random() * 60,
      freq: 0.002 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
      hue: 260 + i * 30,
    }));

    let t = 0;

    function drawStars() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.phase += 0.008;
        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.phase));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${col},${alpha})`;
        ctx!.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });
    }

    function drawBubbles() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += Math.sin(p.phase) * 0.5;
        p.phase += p.wobble || 0.01;
        
        if (p.y < -p.r * 2) {
          p.y = H + p.r;
          p.x = Math.random() * W;
        }
        
        const grad = ctx!.createRadialGradient(
          p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1,
          p.x, p.y, p.r
        );
        grad.addColorStop(0, `rgba(255,255,255,0.4)`);
        grad.addColorStop(0.5, `rgba(${col},0.15)`);
        grad.addColorStop(1, `rgba(${col},0.05)`);
        
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
        
        ctx!.strokeStyle = `rgba(${col},0.3)`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      });
    }

    function drawRipples() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.012;
      particles.forEach((p, i) => {
        const age = (t * spd * 30 + i * 2.5) % 6;
        const radius = age * Math.max(W, H) * 0.08;
        const alpha = Math.max(0, 0.25 - age * 0.04);
        
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${col},${alpha})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      });
    }

    function drawLeaves() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += spd * 0.8;
        p.x += Math.sin(p.phase) * 1.2;
        p.phase += 0.02;
        
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.phase);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, p.r * 0.5, p.r, 0, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${col},${p.opacity * 0.7})`;
        ctx!.fill();
        ctx!.restore();
      });
    }

    function drawFireflies() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.phase += 0.04;
        p.x += Math.sin(p.phase * 0.7) * 0.8;
        p.y += Math.cos(p.phase * 0.5) * 0.6;
        
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(p.phase));
        
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(${col},${alpha})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
      });
    }

    function drawPetals() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += spd * 0.6;
        p.x += Math.sin(p.phase) * 0.8;
        p.phase += 0.015;
        
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.phase * 0.5);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, p.r * 0.6, p.r * 1.2, 0, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${col},${p.opacity * 0.6})`;
        ctx!.fill();
        ctx!.restore();
      });
    }

    function drawAurora() {
      ctx!.clearRect(0, 0, W, H);
      auroraLines.forEach(line => {
        line.phase += line.speed;
        
        const gradient = ctx!.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, `hsla(${line.hue},80%,60%,0.03)`);
        gradient.addColorStop(0.5, `hsla(${line.hue},80%,60%,0.08)`);
        gradient.addColorStop(0.7, `hsla(${line.hue + 40},80%,70%,0.05)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx!.beginPath();
        ctx!.moveTo(0, line.y);
        for (let x = 0; x <= W; x += 4) {
          const y = line.y + Math.sin(x * line.freq + line.phase) * line.amp;
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.lineTo(0, H);
        ctx!.closePath();
        ctx!.fillStyle = gradient;
        ctx!.fill();
      });
      // Stars on top of aurora
      drawStars();
    }

    const drawFn: Record<string, () => void> = {
      stars: drawStars,
      bubbles: drawBubbles,
      ripples: drawRipples,
      leaves: drawLeaves,
      fireflies: drawFireflies,
      petals: drawPetals,
      aurora: drawAurora,
      clouds: drawStars,
    };

    const draw = drawFn[effect] || drawStars;

    function loop() {
      draw();
      animRef.current = requestAnimationFrame(loop);
    }
    
    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [effect, theme.particles.color, theme.particles.count, theme.particles.speed, theme.particles.size]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.75,
      }}
    />
  );
});
