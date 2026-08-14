"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { trackEngagement } from '@/lib/signals';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

// Calming pastel color palette for zen experience
const PALETTE = {
  skyBlue: { r: 184, g: 227, b: 255 },    // #B8E3FF
  lavender: { r: 224, g: 187, b: 255 },   // #E0BBFF
  peach: { r: 255, g: 216, b: 190 },      // #FFD8BE
  mint: { r: 200, g: 250, b: 204 },       // #C8FACC
  white: { r: 255, g: 255, b: 255 }       // #FFFFFF
};

const COLORS = [PALETTE.skyBlue, PALETTE.lavender, PALETTE.peach, PALETTE.mint];

// Mindful affirmations that appear periodically
const AFFIRMATIONS = [
  "You are enough, just as you are",
  "Breathe in peace, breathe out tension",
  "This moment is all you need",
  "You are worthy of rest and calm",
  "Let go of what no longer serves you",
  "Your presence is your power"
];

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Bubble class - represents individual bubble with depth, shimmer, and gentle movement
 */
class Bubble {
  x: number;
  y: number;
  baseY: number;
  targetR: number;
  r: number;
  vx: number;
  vy: number;
  birth: number;
  life: number;
  color: RGB;
  alpha: number;
  depth: number; // 0-1, closer = larger scale
  shimmer: number;
  shimmerSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  isPopping: boolean;
  popStartTime: number;
  static id = 0;
  id: number;

  constructor(x: number, y: number, targetR: number = 50) {
    this.id = Bubble.id++;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.targetR = targetR;
    this.depth = Math.random(); // Depth for pseudo-3D effect
    this.r = this.targetR * 0.1 * (0.5 + this.depth * 0.5); // Start small, scale by depth
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(0.15 + Math.random() * 0.25) * (0.7 + this.depth * 0.3); // Float upward, depth affects speed
    this.birth = performance.now();
    this.life = 4000 + Math.random() * 3000;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = 0.75 + Math.random() * 0.2;
    this.shimmer = Math.random() * Math.PI * 2;
    this.shimmerSpeed = 0.008 + Math.random() * 0.012;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.002 + Math.random() * 0.003;
    this.isPopping = false;
    this.popStartTime = 0;
  }

  /**
   * Update bubble position and state with easing animations
   */
  update(now: number, deltaTime: number): boolean {
    const dt = deltaTime / 16.67; // Normalize to 60fps
    const age = now - this.birth;

    // Handle popping animation
    if (this.isPopping) {
      const popAge = now - this.popStartTime;
      const popDuration = 600;
      const popProgress = Math.min(1, popAge / popDuration);
      
      // Gentle expansion and fade during pop
      const eased = this.easeOutCubic(popProgress);
      this.r = this.targetR * (0.5 + this.depth * 0.5) * (1 + eased * 0.4);
      this.alpha = (1 - eased) * 0.85;
      
      return popProgress < 1;
    }

    // Check lifetime
    if (age > this.life) {
      this.startPop();
      return true;
    }

    // Gentle growth animation with easing
    const growthProgress = Math.min(1, age / Math.min(1200, this.life * 0.3));
    const growthEased = this.easeOutQuad(growthProgress);
    this.r = this.targetR * (0.5 + this.depth * 0.5) * (0.1 + 0.9 * growthEased);

    // Gentle drift with wobble for organic feel
    this.wobble += this.wobbleSpeed * dt;
    this.shimmer += this.shimmerSpeed * dt;
    
    this.x += (this.vx + Math.sin(this.wobble) * 0.15) * dt;
    this.y += this.vy * dt;

    // Gentle deceleration
    this.vx *= Math.pow(0.995, dt);
    this.vy *= Math.pow(0.998, dt);

    return true;
  }

  /**
   * Render bubble with iridescent gradient, soft glow, and light rays
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { r: R, g: G, b: B } = this.color;
    const shimmerIntensity = 0.4 + 0.3 * Math.sin(this.shimmer);
    
    // Scale by depth for pseudo-3D
    const depthScale = 0.5 + this.depth * 0.5;
    const displayR = this.r;

    ctx.save();

    // Soft outer glow (aura)
    const outerGlow = ctx.createRadialGradient(
      this.x, this.y, displayR * 0.3,
      this.x, this.y, displayR * 1.4
    );
    outerGlow.addColorStop(0, `rgba(${R}, ${G}, ${B}, ${this.alpha * 0.3})`);
    outerGlow.addColorStop(0.6, `rgba(${R}, ${G}, ${B}, ${this.alpha * 0.12})`);
    outerGlow.addColorStop(1, `rgba(${R}, ${G}, ${B}, 0)`);
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayR * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Main bubble gradient (iridescent pastel)
    const mainGrad = ctx.createRadialGradient(
      this.x - displayR * 0.3, this.y - displayR * 0.3, displayR * 0.05,
      this.x, this.y, displayR
    );
    mainGrad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.95})`);
    mainGrad.addColorStop(0.2, `rgba(${R + 30}, ${G + 30}, ${B + 30}, ${this.alpha * 0.85})`);
    mainGrad.addColorStop(0.5, `rgba(${R}, ${G}, ${B}, ${this.alpha * 0.7})`);
    mainGrad.addColorStop(0.85, `rgba(${R * 0.8}, ${G * 0.8}, ${B * 0.8}, ${this.alpha * 0.5})`);
    mainGrad.addColorStop(1, `rgba(${R * 0.6}, ${G * 0.6}, ${B * 0.6}, ${this.alpha * 0.2})`);

    ctx.fillStyle = mainGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayR, 0, Math.PI * 2);
    ctx.fill();

    // Iridescent shimmer overlay
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = shimmerIntensity * 0.4;
    
    const shimmerGrad = ctx.createRadialGradient(
      this.x + Math.cos(this.shimmer) * displayR * 0.3,
      this.y + Math.sin(this.shimmer) * displayR * 0.3,
      0,
      this.x, this.y, displayR * 0.9
    );
    shimmerGrad.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
    shimmerGrad.addColorStop(0.5, `rgba(${PALETTE.lavender.r}, ${PALETTE.lavender.g}, ${PALETTE.lavender.b}, 0.4)`);
    shimmerGrad.addColorStop(1, `rgba(${R}, ${G}, ${B}, 0)`);
    
    ctx.fillStyle = shimmerGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayR * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // Light rays (subtle)
    for (let i = 0; i < 3; i++) {
      const angle = this.shimmer + (i * Math.PI * 2) / 3;
      const rayLength = displayR * 0.6;
      const rayWidth = displayR * 0.15;
      
      const rayGrad = ctx.createLinearGradient(
        this.x, this.y,
        this.x + Math.cos(angle) * rayLength,
        this.y + Math.sin(angle) * rayLength
      );
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.25 * shimmerIntensity})`);
      rayGrad.addColorStop(0.6, `rgba(${R}, ${G}, ${B}, ${this.alpha * 0.15 * shimmerIntensity})`);
      rayGrad.addColorStop(1, `rgba(${R}, ${G}, ${B}, 0)`);
      
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = rayWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + Math.cos(angle) * rayLength,
        this.y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }

    // Highlight spots for realism
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.9})`;
    ctx.beginPath();
    ctx.ellipse(
      this.x - displayR * 0.35,
      this.y - displayR * 0.35,
      displayR * 0.25,
      displayR * 0.18,
      -0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      this.x + displayR * 0.2,
      this.y - displayR * 0.15,
      displayR * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Subtle edge outline
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  startPop() {
    if (!this.isPopping) {
      this.isPopping = true;
      this.popStartTime = performance.now();
    }
  }

  forcePop() {
    this.startPop();
  }

  // Easing functions for smooth animations
  easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}

/**
 * Ripple effect when bubble pops - soft expanding rings
 */
class PopRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: RGB;
  birth: number;

  constructor(x: number, y: number, startRadius: number) {
    this.x = x;
    this.y = y;
    this.radius = startRadius;
    this.maxRadius = startRadius * 3.5;
    this.alpha = 0.7;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.birth = performance.now();
  }

  update(deltaTime: number): boolean {
    const dt = deltaTime / 16.67;
    
    this.radius += 3.5 * dt;
    this.alpha -= 0.018 * dt;
    
    return this.alpha > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { r: R, g: G, b: B } = this.color;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${R + 40}, ${G + 40}, ${B + 40}, 0.8)`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner glow ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  }
}

/**
 * Sparkle particles for pop effect
 */
class Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: RGB;
  alpha: number;
  birth: number;
  life: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 0.5;
    this.size = 1 + Math.random() * 2;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = 0.9;
    this.birth = performance.now();
    this.life = 800 + Math.random() * 600;
  }

  update(deltaTime: number): boolean {
    const dt = deltaTime / 16.67;
    const age = performance.now() - this.birth;
    
    if (age > this.life) return false;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.08 * dt; // Gentle gravity
    this.vx *= Math.pow(0.98, dt);
    
    this.alpha = (1 - age / this.life) * 0.9;
    
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { r: R, g: G, b: B } = this.color;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Star shape
    ctx.strokeStyle = `rgba(${R + 60}, ${G + 60}, ${B + 60}, 0.9)`;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 2, this.y);
    ctx.lineTo(this.x + this.size * 2, this.y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size * 2);
    ctx.lineTo(this.x, this.y + this.size * 2);
    ctx.stroke();
    
    // Core glow
    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

/**
 * Main BubbleCanvas Component
 */
const BubbleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const ripplesRef = useRef<PopRipple[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const [currentAffirmation, setCurrentAffirmation] = useState(AFFIRMATIONS[0]);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    trackEngagement('bubble_simulation', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('bubble_simulation', 'completed', duration);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    let DPR = Math.min(2, window.devicePixelRatio || 1);
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    /**
     * Resize canvas to match container with proper DPR handling
     */
    const resize = () => {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse/touch interaction state
    let isPressed = false;
    let mouseX = 0;
    let mouseY = 0;
    let trailTimer = 0;

    /**
     * Spawn bubbles on click/touch with gentle spread
     */
    const onPointerDown = (ev: PointerEvent) => {
      isPressed = true;
      const rect = canvas.getBoundingClientRect();
      mouseX = ev.clientX - rect.left;
      mouseY = ev.clientY - rect.top;

      // Spawn cluster of bubbles
      const count = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const distance = Math.random() * 40;
        const bubble = new Bubble(
          mouseX + Math.cos(angle) * distance,
          mouseY + Math.sin(angle) * distance,
          40 + Math.random() * 45
        );
        bubblesRef.current.push(bubble);
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ev.clientX - rect.left;
      mouseY = ev.clientY - rect.top;
    };

    const onPointerUp = () => {
      isPressed = false;
    };

    const onPointerLeave = () => {
      isPressed = false;
    };

    /**
     * Keyboard shortcuts for interaction
     */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Spawn cluster at center
        const cx = canvas.width / DPR / 2;
        const cy = canvas.height / DPR - 80;
        const count = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const bubble = new Bubble(
            cx + Math.cos(angle) * 15,
            cy + Math.sin(angle) * 15,
            45 + Math.random() * 40
          );
          bubble.vx = Math.cos(angle) * 0.4;
          bubble.vy = Math.sin(angle) * 0.3 - 0.2;
          bubblesRef.current.push(bubble);
        }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        // Pop all bubbles
        bubblesRef.current.forEach(b => b.forcePop());
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('keydown', onKeyDown);

    /**
     * Main animation loop with performance optimization
     */
    const animate = (now: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Frame throttling for consistent 60fps
      if (now - lastFrameTimeRef.current < frameTime) return;
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const W = canvas.width / DPR;
      const H = canvas.height / DPR;

      // Clear and draw ambient background glow
      ctx.clearRect(0, 0, W, H);
      
      ctx.save();
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 6; i++) {
        const color = COLORS[i % COLORS.length];
        const x = W * (0.15 + Math.random() * 0.7);
        const y = H * (0.3 + Math.random() * 0.5);
        const radius = 80 + Math.random() * 120;
        
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`);
        glow.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.12)`);
        glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Trail bubbles when dragging
      if (isPressed) {
        trailTimer += deltaTime;
        if (trailTimer > 120) {
          trailTimer = 0;
          const bubble = new Bubble(
            mouseX + (Math.random() - 0.5) * 30,
            mouseY + (Math.random() - 0.5) * 30,
            25 + Math.random() * 30
          );
          bubblesRef.current.push(bubble);
        }
      }

      // Update and draw bubbles (depth-sorted for realism)
      bubblesRef.current.sort((a, b) => a.depth - b.depth);
      
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const bubble = bubblesRef.current[i];
        const alive = bubble.update(now, deltaTime);
        
        if (!alive || bubble.y + bubble.r < -200 || bubble.x < -200 || bubble.x > W + 200) {
          // Spawn pop effects
          if (bubble.isPopping) {
            ripplesRef.current.push(new PopRipple(bubble.x, bubble.y, bubble.r));
            for (let j = 0; j < 6; j++) {
              sparklesRef.current.push(new Sparkle(bubble.x, bubble.y));
            }
          }
          bubblesRef.current.splice(i, 1);
          continue;
        }
        
        bubble.draw(ctx);
      }

      // Update and draw ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        if (!ripple.update(deltaTime)) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        ripple.draw(ctx);
      }

      // Update and draw sparkles
      for (let i = sparklesRef.current.length - 1; i >= 0; i--) {
        const sparkle = sparklesRef.current[i];
        if (!sparkle.update(deltaTime)) {
          sparklesRef.current.splice(i, 1);
          continue;
        }
        sparkle.draw(ctx);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cycle affirmations every 5 seconds
    const affirmationInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
      setCurrentAffirmation(AFFIRMATIONS[randomIndex]);
    }, 5000);

    // Hide header after 4 seconds
    const headerTimeout = setTimeout(() => {
      setHeaderVisible(false);
    }, 4000);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(affirmationInterval);
      clearTimeout(headerTimeout);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const theme = getTheme('bubble');

  return (
    <ModulePage theme={theme}>
      <div className="relative w-full min-h-[calc(100dvh-4rem)] overflow-hidden" data-zen-atmosphere="none" style={{ background: 'transparent' }}>
      <Link
        href="/"
        aria-label="Back to dashboard"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-zen-full glass-floating shadow-zen-floating text-sm font-medium text-zen-fg hover:bg-white/95 active:scale-[0.97] transition-all duration-zen-fast focus-visible:outline-2 focus-visible:outline-zen-primary"
      >
        <ArrowLeft className="w-4 h-4 text-zen-fg-muted" aria-hidden="true" />
        <span className="hidden sm:inline text-zen-fg-muted">ZenU</span>
        <span className="h-3 w-px bg-zen-border hidden sm:block" aria-hidden="true" />
        <span>Bubbles</span>
      </Link>

      {/* Header overlay - fades in and out */}
      <div
        className={`absolute top-[38%] left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none transition-opacity duration-1000 ${
          headerVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1 className="zen-display text-zen-fg mb-3 drop-shadow-sm">
          Zen Mode
        </h1>
        <p className="zen-body text-zen-fg-muted">
          Tap to breathe
        </p>
      </div>

      {/* Canvas container — cosmic release surface */}
      <div
        ref={wrapRef}
        className="relative z-10 w-[95vw] h-[min(90vh,calc(100dvh-6rem))] max-w-[1700px] mx-auto my-[4vh] rounded-zen-2xl overflow-hidden shadow-zen-elevated"
        style={{
          boxShadow:
            'inset 0 80px 120px rgba(30,41,90,0.12), 0 16px 40px rgba(30,41,90,0.12)',
          background:
            'radial-gradient(ellipse 1200px 600px at 25% 15%, hsl(var(--zen-secondary) / 0.08), transparent 70%), radial-gradient(ellipse 800px 400px at 75% 85%, hsl(var(--zen-primary) / 0.08), transparent 60%), linear-gradient(135deg, hsl(262 40% 18%) 0%, hsl(240 35% 22%) 50%, hsl(228 40% 16%) 100%)'
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        <div className="absolute top-6 left-1/2 -translate-x-1/2 max-w-[85%] md:max-w-lg text-center">
          <div className="text-lg md:text-xl font-semibold text-white px-6 py-3 bg-black/35 backdrop-blur-xl rounded-zen-xl border border-white/10 shadow-lg">
            {currentAffirmation}
          </div>
        </div>

        <div className="absolute left-4 bottom-4 glass-floating text-zen-fg px-4 py-2.5 rounded-zen-lg text-sm font-medium shadow-zen-card select-none">
          <span className="hidden md:inline">
            Click to spawn · Drag for trails · Press{' '}
            <strong>Space</strong> for clusters ·{' '}
            <strong>Enter</strong> to pop all
          </span>
          <span className="md:hidden">
            Tap to create bubbles · Drag for trails
          </span>
        </div>
      </div>
    </div>
    </ModulePage>
  );
};

export default BubbleCanvas;
