'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Wind, Sparkles as SparklesIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Type Definitions for Animation Objects ---
type RGBA = [number, number, number, number?];
type Particle = {
  id: number; x: number; y: number; vx: number; vy: number;
  r: number; birth: number; life: number; color: RGBA;
  gravity: number; airResistance: number;
};
type Star = {
  x: number; y: number; r: number; alpha: number;
};
type ShootingStar = {
  x: number; y: number; length: number; speed: number; angle: number; opacity: number; active: boolean; tail: {x: number, y: number}[];
};

// --- Easing Function ---
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

// --- Color Palettes for the Bubble and Effects ---
const PALETTES: RGBA[] = [
  [173, 216, 230], // Light Blue
  [255, 182, 193], // Light Pink
  [144, 238, 144], // Light Green
  [255, 255, 224], // Light Yellow
  [221, 160, 221], // Plum
  [240, 128, 128], // Light Coral
];

// --- The Main React Component ---
export default function ThoughtBubblePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const [thoughtText, setThoughtText] = useState('');
  const [message, setMessage] = useState("Jot down a thought and watch it materialize ✨");
  const [floatingWords, setFloatingWords] = useState<{ id: number; text: string; style: React.CSSProperties }[]>([]);

  // Use a ref to hold all animation-related state to prevent re-renders
  const animState = useRef({
    ctx: null as CanvasRenderingContext2D | null,
    thoughtBubble: null as any,
    particles: [] as Particle[],
    sparkles: [] as any[],
    ripples: [] as any[],
    stars: [] as Star[],
    shootingStars: [] as ShootingStar[],
    lastFrameTime: 0,
  });

  // Main effect to set up and run the canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    animState.current.ctx = ctx;
    let dpr = window.devicePixelRatio || 1;

    // --- Animation Classes (defined inside useEffect to access scope) ---

    class ThoughtBubble {
      x: number; y: number; r: number; targetR: number; minR: number; maxR: number;
      text: string; words: string[]; base: RGBA; alpha: number;
      isPopping: boolean; popStartTime: number; popDuration: number;
      shimmer: number; shimmerSpeed: number; breath: number; breathSpeed: number;

      constructor(W: number, H: number) {
        this.x = W / 2;
        this.y = H / 2 - H * 0.1;
        this.r = 0; // Start from 0 for a nice appear animation
        this.minR = 30;
        this.maxR = 220;
        this.targetR = this.minR;
        this.text = '';
        this.words = [];
        this.base = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        this.alpha = 0.95;
        this.isPopping = false;
        this.popStartTime = 0;
        this.popDuration = 800;
        this.shimmer = rand(0, Math.PI * 2);
        this.shimmerSpeed = rand(0.01, 0.02);
        this.breath = 0;
        this.breathSpeed = 0.02;
      }
      
      updateText(newText: string) {
        this.text = newText;
        this.words = newText.split(/\s+/).filter(word => word.length > 0);
        const textFactor = newText.length * 1.1 + this.words.length * 9;
        this.targetR = this.text ? Math.max(this.minR, Math.min(this.maxR, 40 + textFactor)) : this.minR;
      }

      update(deltaTime: number) {
        const dt = Math.min(2, deltaTime / 16.67);
        this.shimmer += this.shimmerSpeed * dt;
        this.breath += this.breathSpeed * dt;

        if (this.isPopping) {
          const popAge = performance.now() - this.popStartTime;
          const popT = Math.min(1, popAge / this.popDuration);
          if (popT >= 1) {
            this.reset();
            return;
          }
          const popEase = easeOutCubic(popT);
          this.r = this.targetR * (1 + popEase * 0.5);
          this.alpha = (1 - popEase) * 0.95;
          return;
        }

        const diff = this.targetR - this.r;
        this.r += diff * 0.08 * dt;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.r < 1) return;
        const [R, G, B] = this.base;
        const breathOffset = Math.sin(this.breath) * (this.r * 0.02);
        const currentRadius = this.r + breathOffset;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Outer glow effect (large soft blur)
        ctx.shadowBlur = 40;
        ctx.shadowColor = `rgba(${R}, ${G}, ${B}, 0.4)`;
        
        // Main bubble gradient with enhanced colors
        const grad = ctx.createRadialGradient(
          this.x - currentRadius * 0.3, 
          this.y - currentRadius * 0.3, 
          0,
          this.x, 
          this.y, 
          currentRadius
        );
        
        // Multi-stop gradient for depth
        grad.addColorStop(0, `rgba(${Math.min(255, R + 50)}, ${Math.min(255, G + 50)}, ${Math.min(255, B + 50)}, 0.9)`);
        grad.addColorStop(0.4, `rgba(${R}, ${G}, ${B}, 0.6)`);
        grad.addColorStop(0.8, `rgba(${R}, ${G}, ${B}, 0.25)`);
        grad.addColorStop(1, `rgba(${R}, ${G}, ${B}, 0.0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Enhanced aurora shimmer effect
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = this.alpha * (0.25 + 0.15 * Math.sin(this.shimmer));
        const shimmerGrad = ctx.createConicGradient(this.shimmer, this.x, this.y);
        PALETTES.forEach((p, i) => {
          const t = i / PALETTES.length;
          shimmerGrad.addColorStop(t, `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.6)`);
        });
        shimmerGrad.addColorStop(1, `rgba(${PALETTES[0][0]}, ${PALETTES[0][1]}, ${PALETTES[0][2]}, 0.6)`);
        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 1.08, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight for sphere effect
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.alpha * 0.3;
        const highlightGrad = ctx.createRadialGradient(
          this.x - currentRadius * 0.35,
          this.y - currentRadius * 0.35,
          0,
          this.x,
          this.y,
          currentRadius * 0.5
        );
        highlightGrad.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
        highlightGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      pop() {
        if (this.isPopping || !this.text) return;
        this.isPopping = true;
        this.popStartTime = performance.now();
        this.createFloatingWords();
        this.createPopEffects();
      }
      
      createFloatingWords() {
        const newWords = this.words.map((word) => {
            const angle = rand(-Math.PI, Math.PI);
            const distance = rand(0, this.r * 0.5);
            return {
                id: Math.random(),
                text: word,
                style: {
                    left: `${this.x + Math.cos(angle) * distance}px`,
                    top: `${this.y + Math.sin(angle) * distance}px`,
                    fontSize: `${Math.max(14, Math.min(22, this.r * 0.1))}px`,
                    color: `rgba(${this.base[0]}, ${this.base[1]}, ${this.base[2]}, 1)`,
                }
            };
        });
        setFloatingWords(prev => [...prev, ...newWords]);
        setTimeout(() => setFloatingWords([]), 2000); // Clear after animation
      }
      
      createPopEffects() {
        animState.current.ripples.push(new PopRipple(this.x, this.y, this.r, this.base));
        for (let i = 0; i < 30; i++) {
          const angle = rand(0, Math.PI * 2);
          const speed = rand(2, 8);
          animState.current.particles.push({
            id: Math.random(),
            x: this.x, y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - rand(0, 2),
            r: rand(1.5, 4),
            birth: performance.now(),
            life: rand(1000, 2500),
            color: this.base,
            gravity: 0.05,
            airResistance: 0.98,
          });
        }
        for (let i = 0; i < 15; i++) {
            animState.current.sparkles.push(new Sparkle(this.x, this.y, this.base));
        }
      }
      
      reset() {
        this.isPopping = false;
        this.text = '';
        this.words = [];
        this.r = 0;
        this.targetR = this.minR;
        this.alpha = 0.95;
        this.base = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        setThoughtText('');
      }
    }

    class Sparkle {
        x: number; y: number; vx: number; vy: number;
        birth: number; life: number; color: RGBA;
        size: number; angle: number; spin: number;
        constructor(x: number, y: number, color: RGBA) {
            this.x = x; this.y = y;
            this.vx = rand(-2, 2); this.vy = rand(-4, -1);
            this.birth = performance.now(); this.life = rand(800, 1500);
            this.color = color;
            this.size = rand(5, 12);
            this.angle = rand(0, Math.PI * 2);
            this.spin = rand(-0.1, 0.1);
        }
        update(deltaTime: number) {
            const dt = Math.min(2, deltaTime / 16.67);
            this.x += this.vx * dt; this.y += this.vy * dt;
            this.vy += 0.08 * dt; this.vx *= 0.98;
            this.angle += this.spin * dt;
            return performance.now() - this.birth < this.life;
        }
        draw(ctx: CanvasRenderingContext2D) {
            const age = (performance.now() - this.birth) / this.life;
            const alpha = Math.sin((1 - age) * Math.PI);
            const scale = Math.sin(age * Math.PI);
            const [R,G,B] = this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(scale, scale);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < 2; i++) {
                ctx.moveTo(-this.size, 0); ctx.lineTo(this.size, 0);
                ctx.rotate(Math.PI / 2);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    class PopRipple {
      x: number; y: number; r: number; life: number;
      birth: number; color: RGBA;
      constructor(x: number, y: number, r: number, color: RGBA) {
          this.x = x; this.y = y;
          this.r = r; this.life = 600;
          this.birth = performance.now(); this.color = color;
      }
      update() { return performance.now() - this.birth < this.life; }
      draw(ctx: CanvasRenderingContext2D) {
          const age = (performance.now() - this.birth) / this.life;
          const ease = easeOutCubic(age);
          const currentR = this.r + ease * 150;
          const [R,G,B] = this.color;
          ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${1 - ease})`;
          ctx.lineWidth = 10 * (1 - ease);
          ctx.beginPath();
          ctx.arc(this.x, this.y, currentR, 0, Math.PI * 2);
          ctx.stroke();
      }
    }
    
    // --- Resize and Initialization ---
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      
      if (!animState.current.thoughtBubble) {
          animState.current.thoughtBubble = new ThoughtBubble(rect.width, rect.height);
      } else {
          animState.current.thoughtBubble.x = rect.width / 2;
          animState.current.thoughtBubble.y = rect.height / 2 - rect.height * 0.1;
      }

      animState.current.stars = [];
      for(let i=0; i<150; i++) {
        animState.current.stars.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            r: Math.random() * 1.5,
            alpha: Math.random() * 0.8 + 0.2
        });
      }
    };

    // --- Main Animation Loop ---
    const animate = (now: number) => {
      animationFrameId.current = requestAnimationFrame(animate);
      const deltaTime = now - animState.current.lastFrameTime;
      if (deltaTime < 1000 / 65) return; // Cap FPS
      animState.current.lastFrameTime = now;
      
      const { width, height } = canvas;
      const w = width / dpr; const h = height / dpr;
      ctx.clearRect(0, 0, w, h);
      
      // Draw stars
      animState.current.stars.forEach(star => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (0.8 + Math.sin(now/1000 + star.x) * 0.2)})`;
          ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI*2); ctx.fill();
      });

      // Shooting stars logic
      const dtMulti = deltaTime / 16.67;
      if (Math.random() < 0.015 * dtMulti) { // Occasional spawn
          animState.current.shootingStars.push({
              x: Math.random() * w * 1.5 - w * 0.5,
              y: -50,
              length: rand(40, 100),
              speed: rand(10, 20),
              angle: Math.PI / 4 + rand(-0.1, 0.1), // Diagonal moving down-right
              opacity: 1,
              active: true,
              tail: []
          });
      }

      animState.current.shootingStars = animState.current.shootingStars.filter(ss => {
          ss.tail.push({x: ss.x, y: ss.y});
          if (ss.tail.length > 15) ss.tail.shift();
          
          ss.x += Math.cos(ss.angle) * ss.speed * dtMulti;
          ss.y += Math.sin(ss.angle) * ss.speed * dtMulti;
          ss.opacity -= 0.015 * dtMulti;
          
          if (ss.opacity <= 0 || ss.x > w + 200 || ss.y > h + 200) {
              return false;
          }
          
          ctx.save();
          if (ss.tail.length > 1) {
            const grad = ctx.createLinearGradient(ss.tail[0].x, ss.tail[0].y, ss.x, ss.y);
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`);
            ctx.beginPath();
            ctx.moveTo(ss.tail[0].x, ss.tail[0].y);
            for(let i=1; i<ss.tail.length; i++){
               ctx.lineTo(ss.tail[i].x, ss.tail[i].y);
            }
            ctx.lineTo(ss.x, ss.y);
            ctx.lineCap = "round";
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          
          // Draw head glow
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity * 0.3})`;
          ctx.fill();
          ctx.restore();
          
          return true;
      });

      // Update and draw effects
      animState.current.ripples = animState.current.ripples.filter(r => {
          r.draw(ctx); return r.update();
      });
      animState.current.sparkles = animState.current.sparkles.filter(s => {
          s.update(deltaTime); s.draw(ctx); return s.life > performance.now() - s.birth;
      });
      animState.current.particles = animState.current.particles.filter(p => {
          const dt = Math.min(2, deltaTime / 16.67);
          p.vy += p.gravity * dt;
          p.vx *= p.airResistance; p.vy *= p.airResistance;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const age = (performance.now() - p.birth) / p.life;
          const alpha = Math.sin((1 - age) * Math.PI);
          ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.r * (1-age)), 0, Math.PI * 2);
          ctx.fill();
          return age < 1;
      });

      // Update and draw thought bubble
      if (animState.current.thoughtBubble) {
        animState.current.thoughtBubble.update(deltaTime);
        animState.current.thoughtBubble.draw(ctx);
      }
    };
    
    resize();
    window.addEventListener('resize', resize);
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // --- Event Handlers for UI ---
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setThoughtText(newText);
    animState.current.thoughtBubble?.updateText(newText);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  const handlePop = useCallback(() => {
    if (thoughtText.trim().length > 0 && animState.current.thoughtBubble && !animState.current.thoughtBubble.isPopping) {
      animState.current.thoughtBubble.pop();
      const popMessages = ["Thought released!", "Feeling lighter?", "Poof! It's gone.", "A moment of clarity."];
      setMessage(popMessages[Math.floor(Math.random() * popMessages.length)]);
      setTimeout(() => setMessage("Jot down a thought and watch it materialize ✨"), 3000);
    }
  }, [thoughtText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePop();
    }
  }, [handlePop]);
  
  return (
    <>
      <main ref={containerRef} className="container">
        <canvas ref={canvasRef} />

        {floatingWords.map(word => (
          <div key={word.id} className="floating-text" style={word.style}>
            {word.text}
          </div>
        ))}
        
        <div className="ui-overlay">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="absolute top-[80px] left-6 z-50 text-white/80 hover:text-white hover:bg-white/10 pointer-events-auto"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="message-box">
            <p>{message}</p>
          </div>
          <div className="input-container">
            <textarea
              value={thoughtText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              rows={1}
            />
            <button onClick={handlePop} disabled={!thoughtText.trim() || animState.current.thoughtBubble?.isPopping}>
              <Wind size={20} />
              <span>Release</span>
            </button>
          </div>
          <div className="hint">
            <SparklesIcon size={16} />
            <p>Let your thoughts go. Press <strong>Enter</strong> to release.</p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        :root {
          --bg-dark: #0d1117;
          --bg-light: #161b22;
          --border-color: rgba(255, 255, 255, 0.1);
          --text-primary: #e6edf3;
          --text-secondary: #7d8590;
          --accent-glow: rgba(88, 166, 255, 0.3);
        }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: var(--bg-dark);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          color: var(--text-primary);
        }
      `}</style>

      <style jsx>{`
        .container {
          width: 100vw;
          height: 100vh;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .ui-overlay {
          position: fixed;
          z-index: 10;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          pointer-events: none;
          padding-top: 6rem;
          padding-bottom: 0;
        }
        
        .message-box {
          text-align: center;
          padding: 0.8rem 1.5rem;
          background: rgba(22, 27, 34, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          font-weight: 500;
          transition: opacity 0.3s ease;
          pointer-events: auto;
        }

        .input-container {
          pointer-events: all;
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          width: 100%;
          max-width: 600px;
          padding: 0 1rem;
        }

        textarea {
          flex-grow: 1;
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
          resize: none;
          min-height: 54px;
          max-height: 200px;
          line-height: 1.5;
          outline: none;
          box-shadow: 0 0 0 0px var(--accent-glow);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        textarea:focus {
          border-color: #58a6ff;
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        textarea::placeholder {
          color: var(--text-secondary);
        }
        
        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #238636;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 0.9rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(35, 134, 54, 0.2);
        }

        button:hover:not(:disabled) {
          background: #2ea043;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46, 160, 67, 0.3);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }

        button:disabled {
          background: #21262d;
          color: var(--text-secondary);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .hint {
          pointer-events: all;
          position: fixed;
          bottom: 6.5rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: rgba(22, 27, 34, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.875rem;
          z-index: 15;
        }
        
        .hint p { margin: 0; }
        .hint strong { color: var(--text-primary); font-weight: 500; }
        
        .floating-text {
          position: absolute;
          font-weight: 500;
          pointer-events: none;
          z-index: 5;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          animation: floatAway 2s ease-out forwards;
        }
        
        @keyframes floatAway {
          0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.5) rotate(15deg); }
        }

        @media (max-width: 768px) {
          .ui-overlay { padding-top: 5rem; }
          .input-container { flex-direction: column; align-items: stretch; gap: 0.75rem; }
          .message-box { font-size: 0.9rem; }
          .hint { display: none; }
        }
      `}</style>
    </>
  );
}