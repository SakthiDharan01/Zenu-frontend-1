"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
}

interface ParticleCanvasProps {
  pattern: number[];
  cycleDuration: number;
  isPaused: boolean;
  speed: number;
  onCycleComplete?: () => void;
  onPhaseChange?: (phase: string, seconds: number) => void;
}

const DEFAULT_COLORS = {
  primary: "hsl(221, 83%, 53%)",
  accent: "hsl(280, 87%, 65%)",
  secondary: "hsl(217, 91%, 60%)"
} as const;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const ParticleCanvas = ({
  pattern,
  cycleDuration,
  isPaused,
  speed,
  onCycleComplete,
  onPhaseChange,
}: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const cycleCounterRef = useRef<number>(0);
  const lastPhaseRef = useRef<string>("");
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;
  const [currentStep, setCurrentStep] = useState<string>("Inhale");
  const [stepTime, setStepTime] = useState(pattern[0]);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const getParticleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) return 30;
    if (width < 1024) return 60;
    return 120;
  }, []);

  const getCSSColor = useCallback((varName: string): string => {
    try {
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(varName).trim();
      if (!value) return DEFAULT_COLORS.primary;

      if (value.startsWith("hsl") || value.startsWith("rgb") || value.startsWith("#")) {
        return value;
      }

      const [h, s, l] = value.split(" ").map((segment) => parseFloat(segment.replace("%", "")));
      if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
        return DEFAULT_COLORS.primary;
      }
      return `hsl(${h}, ${s}%, ${l}%)`;
    } catch (error) {
      console.warn(`Error parsing color for ${varName}, using fallback`, error);
      return DEFAULT_COLORS.primary;
    }
  }, []);

  const colors = useMemo(
    () => [
      getCSSColor("--zen-primary"),
      getCSSColor("--zen-accent"),
      getCSSColor("--zen-secondary")
    ],
    [getCSSColor]
  );

  const patternTotal = useMemo(() => pattern.reduce((total, value) => total + value, 0), [pattern]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = getParticleCount();

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const distance = 60 + Math.random() * 180;
        const x = canvas.width / 2 + Math.cos(angle) * distance;
        const y = canvas.height / 2 + Math.sin(angle) * distance;

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: 1 + Math.random() * 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1
        });
      }

      particlesRef.current = particles;
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [colors, getParticleCount]);

  useEffect(() => {
    if (isPaused) {
      pausedTimeRef.current = Date.now();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    if (pausedTimeRef.current > 0) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pauseDuration;
      pausedTimeRef.current = 0;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) * speed;
      const adjustedCycleDuration = cycleDuration * 1000;
      const cycleProgress = (elapsed % adjustedCycleDuration) / adjustedCycleDuration;
      const cycleIndex = Math.floor(elapsed / adjustedCycleDuration);

      if (cycleIndex !== cycleCounterRef.current) {
        cycleCounterRef.current = cycleIndex;
        onCycleComplete?.();
      }

      let cumulativeTime = 0;
      let currentStepIndex = 0;
      const stepLabels = pattern.length === 4
        ? ["Inhale", "Hold", "Exhale", "Hold"]
        : ["Inhale", "Hold", "Exhale"];

      for (let i = 0; i < pattern.length; i++) {
        const stepDuration = pattern[i] / patternTotal;
        if (cycleProgress < cumulativeTime + stepDuration) {
          currentStepIndex = i;
          break;
        }
        cumulativeTime += stepDuration;
      }

      const phaseLabel = stepLabels[currentStepIndex];
      const phaseSeconds = pattern[currentStepIndex];
      if (phaseLabel !== lastPhaseRef.current) {
        lastPhaseRef.current = phaseLabel;
        setCurrentStep(phaseLabel);
        setStepTime(phaseSeconds);
        onPhaseChangeRef.current?.(phaseLabel, phaseSeconds);
      }

      let breathExpansion = 0;
      if (currentStepIndex === 0) {
        const stepProgress = (cycleProgress - cumulativeTime) / (pattern[0] / patternTotal);
        breathExpansion = easeInOutCubic(stepProgress);
      } else if (pattern.length >= 3 && currentStepIndex === 2) {
        const stepStart = pattern.slice(0, currentStepIndex).reduce((total, value) => total + value, 0) / patternTotal;
        const stepProgress = (cycleProgress - stepStart) / (pattern[currentStepIndex] / patternTotal);
        breathExpansion = 1 - easeInOutCubic(stepProgress);
      } else {
        breathExpansion = currentStepIndex === 1 ? 1 : 0;
      }

      const primaryColor = getCSSColor("--zen-primary");
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );

      const hslMatch = primaryColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      const backgroundColor = hslMatch
        ? `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, 0.08)`
        : "hsla(221, 83%, 53%, 0.08)";

      gradient.addColorStop(0, backgroundColor);
      gradient.addColorStop(1, "hsla(225, 40%, 99%, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (prefersReducedMotion.current) {
        const haloColor = getCSSColor("--zen-primary");
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
        const alpha = 0.1 + breathExpansion * 0.15;
        const haloMatch = haloColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        const haloColorWithAlpha = haloMatch
          ? `hsla(${haloMatch[1]}, ${haloMatch[2]}%, ${haloMatch[3]}%, ${alpha})`
          : `hsla(221, 83%, 53%, ${alpha})`;

        ctx.fillStyle = haloColorWithAlpha;
        ctx.fill();
      } else {
        const scale = 1 + 0.25 * breathExpansion;
        const glowIntensity = breathExpansion;
        ctx.globalCompositeOperation = "lighter";

        particlesRef.current.forEach((particle) => {
          const dx = particle.baseX - canvas.width / 2;
          const dy = particle.baseY - canvas.height / 2;

          particle.x = canvas.width / 2 + dx * scale + particle.speedX * breathExpansion * 10;
          particle.y = canvas.height / 2 + dy * scale + particle.speedY * breathExpansion * 10;

          const particleSize = particle.size * (1 + breathExpansion * 1.5);
          const glowSize = particleSize * (3 + glowIntensity * 2);

          const glowGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowSize
          );
          glowGradient.addColorStop(0, particle.color);
          const glowColor = particle.color.replace(")", `, ${glowIntensity * 0.3})`).replace("hsl", "hsla");
          glowGradient.addColorStop(0.5, glowColor);
          glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = "source-over";
      }

      const ringColor = getCSSColor("--zen-primary");
      const ringAlpha = 0.3 + breathExpansion * 0.4;
      const ringMatch = ringColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      const ringColorWithAlpha = ringMatch
        ? `hsla(${ringMatch[1]}, ${ringMatch[2]}%, ${ringMatch[3]}%, ${ringAlpha})`
        : `hsla(221, 83%, 53%, ${ringAlpha})`;

      ctx.strokeStyle = ringColorWithAlpha;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        80 + breathExpansion * 60,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, speed, pattern, cycleDuration, getCSSColor, patternTotal, onCycleComplete]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="relative z-10 text-center">
        <div className="zen-display text-zen-primary mb-2">
          {currentStep}
        </div>
      </div>
    </div>
  );
};
