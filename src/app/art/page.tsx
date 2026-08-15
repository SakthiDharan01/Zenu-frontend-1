'use client';
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { ArrowLeft, Undo2, Redo2, Trash2, Download, Pencil, Eraser, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { trackEngagement } from '@/lib/signals';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

const DoodleDreams = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'eraser' | 'fill'>('draw');
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [color, setColor] = useState("#ff4081");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const symmetry = 12;
  const angleStep = (2 * Math.PI) / symmetry;
  const MAX_STACK = 25;

  useEffect(() => {
    trackEngagement('arts_mandala', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('arts_mandala', 'completed', duration);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper scaling for high-DPI displays
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const size = Math.min(container.clientWidth - 32, 700);
        
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        
        // Scale context to match device pixel ratio
        ctx.scale(dpr, dpr);
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Enable anti-aliasing and smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial state
    pushState();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const pushState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (undoStackRef.current.length >= MAX_STACK) {
      undoStackRef.current.shift();
    }
    undoStackRef.current.push(canvas.toDataURL());
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const restoreFromDataURL = (url: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.resetTransform();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };
    img.src = url;
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    redoStackRef.current.push(canvas.toDataURL());
    const state = undoStackRef.current.pop()!;
    restoreFromDataURL(state);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    toast.success("Undone", { duration: 1000 });
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    undoStackRef.current.push(canvas.toDataURL());
    const state = redoStackRef.current.pop()!;
    restoreFromDataURL(state);
    setCanRedo(redoStackRef.current.length > 0);
    setCanUndo(true);
    toast.success("Redone", { duration: 1000 });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    pushState();
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    toast.success("Canvas cleared");
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `mandala-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success("Mandala saved!");
  };

  const drawSymmetricLine = (x1: number, y1: number, x2: number, y2: number, overrideColor?: string, overrideSize?: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const centerX = (canvas.width / dpr) / 2;
    const centerY = (canvas.height / dpr) / 2;
    const dx1 = x1 - centerX, dy1 = y1 - centerY;
    const dx2 = x2 - centerX, dy2 = y2 - centerY;

    ctx.strokeStyle = overrideColor || color;
    ctx.lineWidth = overrideSize || brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.translate(centerX, centerY);
    for (let i = 0; i < symmetry; i++) {
      ctx.rotate(angleStep);
      ctx.beginPath();
      ctx.moveTo(dx1, dy1);
      ctx.lineTo(dx2, dy2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const hexToRgba = (hex: string): [number, number, number, number] => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
  };

  const rotatePoint = (cx: number, cy: number, x: number, y: number, theta: number) => {
    const dx = x - cx, dy = y - cy;
    const c = Math.cos(theta), s = Math.sin(theta);
    return [dx * c - dy * s + cx, dx * s + dy * c + cy];
  };

  const floodFill = (imgData: ImageData, startX: number, startY: number, fillRGBA: number[]) => {
    const w = imgData.width, h = imgData.height;
    const data = imgData.data;
    const startIdx = (startY * w + startX) * 4;

    if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;

    const target = Array.from(data.slice(startIdx, startIdx + 4));
    if (target.every((v, i) => v === fillRGBA[i])) return;

    const stack: [number, number][] = [[startX, startY]];
    while (stack.length) {
      const point = stack.pop();
      if (!point) continue;
      const [x, y] = point;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;

      const idx = (y * w + x) * 4;
      if (target.every((v, i) => Math.abs(data[idx + i] - v) <= 16)) {
        data.set(fillRGBA, idx);
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    pushState();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
    const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'fill') {
      const dpr = window.devicePixelRatio || 1;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < symmetry; i++) {
        const [rx, ry] = rotatePoint((canvas.width / dpr) / 2, (canvas.height / dpr) / 2, x, y, i * angleStep);
        floodFill(imgData, Math.round(rx * dpr), Math.round(ry * dpr), hexToRgba(color));
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    isDrawingRef.current = true;
    lastPosRef.current = { x, y };

    if (activeTool === 'eraser') {
      drawSymmetricLine(x, y, x, y, '#ffffff', eraserSize);
      return;
    }

    drawSymmetricLine(x, y, x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
    const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'eraser') {
      drawSymmetricLine(lastPosRef.current.x, lastPosRef.current.y, x, y, '#ffffff', eraserSize);
    } else {
      drawSymmetricLine(lastPosRef.current.x, lastPosRef.current.y, x, y);
    }
    
    lastPosRef.current = { x, y };
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const theme = getTheme('doodle');

  return (
    <ModulePage theme={theme}>
      <div className="relative min-h-[calc(100dvh-4rem)]" data-zen-atmosphere="none" style={{ background: 'transparent' }}>
      {/* Glass floating chrome — normal shell (nav remains) */}
      <Link
        href="/"
        aria-label="Back to dashboard"
        className="absolute top-6 left-6 lg:left-8 z-40 inline-flex items-center gap-2 px-3 py-2 rounded-zen-full glass-floating shadow-zen-floating text-sm font-medium text-white hover:bg-white/95 active:scale-[0.97] transition-all duration-zen-fast focus-visible:outline-2 focus-visible:outline-zen-primary"
      >
        <ArrowLeft className="w-4 h-4 text-white/70" aria-hidden="true" />
        <span className="hidden sm:inline text-white/70">ZenU</span>
        <span className="h-3 w-px bg-zen-border hidden sm:block" aria-hidden="true" />
        <span>Art</span>
      </Link>

      <div className="pt-8 pb-4 md:pt-10 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="zen-h1 text-white font-serif tracking-wide mb-3">
              Doodle Dreams Studio
            </h1>
            <p className="zen-body-sm text-white/70 max-w-2xl mx-auto">
              12-fold symmetry mandala creator
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto items-center lg:items-start justify-center pb-24">
        {/* Left Sidebar - Tools */}
        <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-4 shrink-0 flex flex-col">
          {/* Tool Selection */}
          <div className="glass rounded-zen-xl p-3 shadow-zen-subtle">
            <h3 className="zen-caption text-white mb-2">Tools</h3>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setActiveTool('draw');
                  toast.success("Pencil selected", { duration: 800 });
                }}
                className={`w-full flex items-center px-4 py-2 rounded-zen-md min-h-11 transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary ${
                  activeTool === 'draw' 
                    ? 'bg-zen-primary text-white' 
                    : 'border border-white/20 hover:border-white/50 text-white/80 hover:text-white'
                }`}
              >
                <Pencil className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Draw</span>
              </button>
              <button
                onClick={() => {
                  setActiveTool('eraser');
                  toast.success("Eraser selected", { duration: 800 });
                }}
                className={`w-full flex items-center px-4 py-2 rounded-zen-md min-h-11 transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary ${
                  activeTool === 'eraser'
                    ? 'bg-zen-primary text-white'
                    : 'border border-white/20 hover:border-white/50 text-white/80 hover:text-white'
                }`}
              >
                <Eraser className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Eraser</span>
              </button>
              <button
                onClick={() => {
                  setActiveTool('fill');
                  toast.success("Fill selected", { duration: 800 });
                }}
                className={`w-full flex items-center px-4 py-2 rounded-zen-md min-h-11 transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary ${
                  activeTool === 'fill'
                    ? 'bg-zen-primary text-white'
                    : 'border border-white/20 hover:border-white/50 text-white/80 hover:text-white'
                }`}
              >
                <Paintbrush className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Fill</span>
              </button>
            </div>
          </div>

          {/* Color & Size Controls */}
          <div className="glass rounded-zen-xl p-3 space-y-3 shadow-zen-subtle">
            <div>
              <h3 className="zen-caption text-white mb-2 flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5" aria-hidden="true" />
                Color
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    toast.success("Color changed", { duration: 500 });
                  }}
                  className="w-16 h-16 rounded-lg cursor-pointer border-2 border-white/20 hover:border-zen-primary/50 transition-all duration-300 hover:scale-105 active:scale-95"
                />
                <div className="flex-1">
                  <div className="text-[10px] text-white/60 font-mono bg-white/10 px-2 py-1.5 rounded">
                    {color.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/20">
              <div>
                <label className="text-[10px] font-medium text-white/80 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    Brush
                  </span>
                  <span className="text-zen-primary font-semibold">{brushSize}px</span>
                </label>
                <input
                  type="range"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  min={1}
                  max={40}
                  step={1}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zen-bg-muted accent-zen-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-white/80 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <Eraser className="w-3 h-3" />
                    Eraser
                  </span>
                  <span className="text-zen-primary font-semibold">{eraserSize}px</span>
                </label>
                <input
                  type="range"
                  value={eraserSize}
                  onChange={(e) => setEraserSize(Number(e.target.value))}
                  min={4}
                  max={120}
                  step={1}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zen-bg-muted accent-zen-primary"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass rounded-zen-xl p-3 space-y-2 shadow-zen-subtle">
            <h3 className="zen-caption text-white mb-2">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                aria-label="Undo"
                className="w-full flex items-center justify-center px-4 py-2 rounded-zen-md min-h-11 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary"
              >
                <Undo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                aria-label="Redo"
                className="w-full flex items-center justify-center px-4 py-2 rounded-zen-md min-h-11 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary"
              >
                <Redo2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Redo
              </button>
            </div>
            <button
              onClick={handleClear}
              aria-label="Clear canvas"
              className="w-full flex items-center justify-center px-4 py-2 rounded-zen-md min-h-11 bg-white/10 hover:bg-white/20 text-white transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary"
            >
              <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Clear Canvas
            </button>
            <button
              onClick={handleSave}
              aria-label="Save mandala"
              className="w-full flex items-center justify-center px-4 py-2 rounded-zen-md min-h-11 bg-zen-primary text-white hover:bg-zen-primary-hover transition-all duration-zen-fast active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-zen-primary"
            >
              <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Save Mandala
            </button>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-zen-xl p-3">
            <p className="text-[10px] text-white/70 leading-relaxed">
              <span className="font-semibold text-white">Tip:</span> Draw from the center outward for best results.
            </p>
          </div>
        </aside>

        <main className="flex-1 w-full max-w-[700px] flex items-center justify-center">
          <div className="glass rounded-zen-2xl p-3 sm:p-4 lg:p-6 w-full shadow-zen-card h-fit">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full rounded-zen-xl shadow-zen-subtle cursor-crosshair touch-none border-2 border-white/20"
              style={{
                aspectRatio: '1/1'
              }}
            />
          </div>
        </main>
      </div>
      </div>
    </ModulePage>
  );
};

export default DoodleDreams;