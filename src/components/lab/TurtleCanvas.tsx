import { useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, Gauge, Grid, Pause, Play, RotateCcw } from 'lucide-react';
import type { TurtleCommand } from '../../types/lab';

interface TurtleCanvasProps {
  commands: TurtleCommand[];
  runSignal: number;
  theme: 'light' | 'dark';
}

type SpeedPreset = 'slow' | 'normal' | 'fast' | 'instant';

const PIXELS_PER_SECOND: Record<SpeedPreset, number> = {
  slow: 120,
  normal: 260,
  fast: 700,
  instant: Number.POSITIVE_INFINITY,
};

type Segment =
  | {
      kind: 'line';
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      penDown: boolean;
      penColor: string;
      penSize: number;
      headingDeg: number;
      cost: number;
    }
  | {
      kind: 'rotate';
      x: number;
      y: number;
      startHeading: number;
      deltaAngle: number;
      cost: number;
    }
  | {
      kind: 'arc';
      centerX: number;
      centerY: number;
      radius: number;
      alpha0: number;
      sweepRad: number;
      startHeading: number;
      extentDeg: number;
      sign: number;
      penDown: boolean;
      penColor: string;
      penSize: number;
      cost: number;
    }
  | {
      kind: 'fill';
      points: { x: number; y: number }[];
      fillColor: string;
      penColor: string;
      penSize: number;
      cost: number;
    }
  | {
      kind: 'dot';
      x: number;
      y: number;
      size: number;
      color: string;
      cost: number;
    }
  | {
      kind: 'write';
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color: string;
      cost: number;
    }
  | {
      kind: 'bgcolor';
      color: string;
      cost: number;
    }
  | {
      kind: 'visibility';
      visible: boolean;
      cost: number;
    }
  | {
      kind: 'clear';
      cost: number;
    };

function compileSegments(commands: TurtleCommand[], defaultBg: string): Segment[] {
  const segments: Segment[] = [];
  let x = 0;
  let y = 0;
  let headingDeg = 0;
  let penDown = true;
  let penColor = '#1D4ED8';
  let fillColor = '#C6F64D';
  let penSize = 3;
  let filling = false;
  let fillPoints: { x: number; y: number }[] = [];

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'move': {
        const rad = (headingDeg * Math.PI) / 180;
        const nx = x + cmd.distance * Math.cos(rad);
        const ny = y + cmd.distance * Math.sin(rad);
        const dist = Math.abs(cmd.distance);
        segments.push({
          kind: 'line',
          x0: x,
          y0: y,
          x1: nx,
          y1: ny,
          penDown,
          penColor,
          penSize,
          headingDeg,
          cost: Math.max(12, dist),
        });
        if (filling) fillPoints.push({ x: nx, y: ny });
        x = nx;
        y = ny;
        break;
      }
      case 'goto': {
        const dist = Math.hypot(cmd.x - x, cmd.y - y);
        segments.push({
          kind: 'line',
          x0: x,
          y0: y,
          x1: cmd.x,
          y1: cmd.y,
          penDown,
          penColor,
          penSize,
          headingDeg,
          cost: Math.max(10, dist),
        });
        if (filling) fillPoints.push({ x: cmd.x, y: cmd.y });
        x = cmd.x;
        y = cmd.y;
        break;
      }
      case 'turn': {
        const cost = Math.max(8, Math.abs(cmd.angle) * 0.4);
        segments.push({
          kind: 'rotate',
          x,
          y,
          startHeading: headingDeg,
          deltaAngle: cmd.angle,
          cost,
        });
        headingDeg = (headingDeg + cmd.angle) % 360;
        break;
      }
      case 'setheading': {
        let diff = ((cmd.angle - headingDeg + 540) % 360) - 180;
        if (Math.abs(diff) > 0.1) {
          segments.push({
            kind: 'rotate',
            x,
            y,
            startHeading: headingDeg,
            deltaAngle: diff,
            cost: Math.max(8, Math.abs(diff) * 0.4),
          });
        }
        headingDeg = cmd.angle % 360;
        break;
      }
      case 'pen':
        penDown = cmd.down;
        break;
      case 'color':
        penColor = cmd.penColor;
        if (cmd.fillColor) fillColor = cmd.fillColor;
        break;
      case 'fillcolor':
        fillColor = cmd.fillColor;
        break;
      case 'pensize':
        penSize = Math.max(1, cmd.size);
        break;
      case 'begin_fill':
        filling = true;
        fillPoints = [{ x, y }];
        break;
      case 'end_fill':
        if (filling && fillPoints.length >= 2) {
          segments.push({
            kind: 'fill',
            points: [...fillPoints],
            fillColor,
            penColor,
            penSize,
            cost: 28,
          });
        }
        filling = false;
        fillPoints = [];
        break;
      case 'circle': {
        const r = Math.abs(cmd.radius);
        const extent = cmd.extent ?? 360;
        const sign = cmd.radius >= 0 ? 1 : -1;
        const perpAngle = ((headingDeg + sign * 90) * Math.PI) / 180;
        const centerX = x + r * Math.cos(perpAngle);
        const centerY = y + r * Math.sin(perpAngle);
        const alpha0 = Math.atan2(y - centerY, x - centerX);
        const sweepRad = (sign * extent * Math.PI) / 180;
        const arcLen = Math.max(18, r * Math.abs(sweepRad));

        segments.push({
          kind: 'arc',
          centerX,
          centerY,
          radius: r,
          alpha0,
          sweepRad,
          startHeading: headingDeg,
          extentDeg: sign * extent,
          sign,
          penDown,
          penColor,
          penSize,
          cost: arcLen,
        });

        if (filling) {
          const steps = 16;
          for (let s = 1; s <= steps; s += 1) {
            const th = alpha0 + (sweepRad * s) / steps;
            fillPoints.push({
              x: centerX + r * Math.cos(th),
              y: centerY + r * Math.sin(th),
            });
          }
        }

        const endTheta = alpha0 + sweepRad;
        x = centerX + r * Math.cos(endTheta);
        y = centerY + r * Math.sin(endTheta);
        headingDeg = (headingDeg + sign * extent) % 360;
        break;
      }
      case 'dot':
        segments.push({
          kind: 'dot',
          x,
          y,
          size: Math.max(3, cmd.size ?? penSize * 2),
          color: cmd.color ?? penColor,
          cost: 6,
        });
        break;
      case 'write':
        segments.push({
          kind: 'write',
          x,
          y,
          text: cmd.text,
          fontSize: cmd.fontSize ?? 14,
          color: penColor,
          cost: 12,
        });
        break;
      case 'bgcolor':
        segments.push({ kind: 'bgcolor', color: cmd.color, cost: 0 });
        break;
      case 'visibility':
        segments.push({ kind: 'visibility', visible: cmd.visible, cost: 0 });
        break;
      case 'clear':
        segments.push({ kind: 'clear', cost: 0 });
        segments.push({ kind: 'bgcolor', color: defaultBg, cost: 0 });
        x = 0;
        y = 0;
        headingDeg = 0;
        break;
      case 'speed':
        break;
    }
  }

  return segments;
}

export function TurtleCanvas({
  commands,
  runSignal,
  theme,
}: TurtleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [speed, setSpeed] = useState<SpeedPreset>('normal');
  const [showGrid, setShowGrid] = useState(true);
  const [replayTick, setReplayTick] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [paused, setPaused] = useState(false);
  const [animProgress, setAnimProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const speedRef = useRef<SpeedPreset>(speed);
  speedRef.current = speed;
  const pausedRef = useRef<boolean>(paused);
  pausedRef.current = paused;

  const defaultBg = theme === 'dark' ? '#0B1222' : '#FFFFFF';
  const segments = useMemo(
    () => (cleared ? [] : compileSegments(commands, defaultBg)),
    [commands, cleared, defaultBg]
  );

  useEffect(() => {
    setCleared(false);
    setPaused(false);
  }, [commands, runSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const totalCost = segments.reduce((acc, s) => acc + s.cost, 0);
    let currentCost =
      speedRef.current === 'instant' || totalCost === 0 ? totalCost : 0;
    let rafId = 0;
    let lastTs = performance.now();

    setIsAnimating(currentCost < totalCost);
    setAnimProgress(totalCost === 0 ? 1 : currentCost / totalCost);

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(240, Math.floor(rect.width));
      const h = Math.max(220, Math.floor(rect.height));
      if (
        canvas.width !== Math.floor(w * dpr) ||
        canvas.height !== Math.floor(h * dpr)
      ) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      return { w, h, dpr };
    };

    const drawFrame = (targetCost: number, timeNow: number) => {
      const { w, h, dpr } = resizeCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cari warna background aktif berdasarkan progress
      let activeBg = defaultBg;
      let scan = 0;
      for (const seg of segments) {
        if (scan > targetCost) break;
        if (seg.kind === 'bgcolor') activeBg = seg.color;
        scan += seg.cost;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Latar kanvas
      ctx.fillStyle = activeBg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const toScreenX = (tx: number) => cx + tx;
      const toScreenY = (ty: number) => cy - ty;

      // Grid koordinat opsional
      if (showGrid) {
        const darkBg =
          activeBg.toLowerCase() === '#0f172a' || theme === 'dark';
        ctx.strokeStyle = darkBg
          ? 'rgba(148, 163, 184, 0.14)'
          : 'rgba(29, 78, 216, 0.08)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let gx = cx % step; gx < w; gx += step) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
          ctx.stroke();
        }
        for (let gy = cy % step; gy < h; gy += step) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(29, 78, 216, 0.45)';
        ctx.fill();
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let turtleX = 0;
      let turtleY = 0;
      let turtleHeading = 0;
      let turtleVisible = true;
      let consumed = 0;

      for (const seg of segments) {
        const segStart = consumed;
        consumed += seg.cost;

        if (segStart > targetCost) break;

        const t =
          seg.cost === 0
            ? 1
            : Math.min(1, Math.max(0, (targetCost - segStart) / seg.cost));

        switch (seg.kind) {
          case 'line': {
            const curX = seg.x0 + (seg.x1 - seg.x0) * t;
            const curY = seg.y0 + (seg.y1 - seg.y0) * t;
            if (seg.penDown && t > 0) {
              ctx.beginPath();
              ctx.strokeStyle = seg.penColor;
              ctx.lineWidth = seg.penSize;
              ctx.moveTo(toScreenX(seg.x0), toScreenY(seg.y0));
              ctx.lineTo(toScreenX(curX), toScreenY(curY));
              ctx.stroke();
            }
            turtleX = curX;
            turtleY = curY;
            turtleHeading = seg.headingDeg;
            break;
          }
          case 'rotate': {
            turtleX = seg.x;
            turtleY = seg.y;
            turtleHeading = seg.startHeading + seg.deltaAngle * t;
            break;
          }
          case 'arc': {
            const curSweep = seg.sweepRad * t;
            if (seg.penDown && Math.abs(curSweep) > 0.001) {
              const steps = Math.max(8, Math.ceil(Math.abs(curSweep) * 20));
              ctx.beginPath();
              ctx.strokeStyle = seg.penColor;
              ctx.lineWidth = seg.penSize;
              for (let s = 0; s <= steps; s += 1) {
                const th = seg.alpha0 + (curSweep * s) / steps;
                const px = seg.centerX + seg.radius * Math.cos(th);
                const py = seg.centerY + seg.radius * Math.sin(th);
                if (s === 0) ctx.moveTo(toScreenX(px), toScreenY(py));
                else ctx.lineTo(toScreenX(px), toScreenY(py));
              }
              ctx.stroke();
            }
            const endTh = seg.alpha0 + curSweep;
            turtleX = seg.centerX + seg.radius * Math.cos(endTh);
            turtleY = seg.centerY + seg.radius * Math.sin(endTh);
            turtleHeading = seg.startHeading + seg.extentDeg * t;
            break;
          }
          case 'fill': {
            if (seg.points.length >= 2) {
              ctx.save();
              ctx.globalAlpha = t;
              ctx.beginPath();
              ctx.moveTo(toScreenX(seg.points[0].x), toScreenY(seg.points[0].y));
              for (let p = 1; p < seg.points.length; p += 1) {
                ctx.lineTo(
                  toScreenX(seg.points[p].x),
                  toScreenY(seg.points[p].y)
                );
              }
              ctx.closePath();
              ctx.fillStyle = seg.fillColor;
              ctx.fill();
              ctx.strokeStyle = seg.penColor;
              ctx.lineWidth = seg.penSize;
              ctx.stroke();
              ctx.restore();
            }
            break;
          }
          case 'dot': {
            ctx.beginPath();
            ctx.arc(
              toScreenX(seg.x),
              toScreenY(seg.y),
              (seg.size / 2) * Math.max(0.4, t),
              0,
              Math.PI * 2
            );
            ctx.fillStyle = seg.color;
            ctx.fill();
            break;
          }
          case 'write': {
            ctx.save();
            ctx.globalAlpha = t;
            ctx.font = `700 ${seg.fontSize}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle = seg.color;
            ctx.fillText(
              seg.text,
              toScreenX(seg.x) + 8,
              toScreenY(seg.y) - 6
            );
            ctx.restore();
            break;
          }
          case 'visibility':
            turtleVisible = seg.visible;
            break;
          case 'clear': {
            ctx.fillStyle = defaultBg;
            ctx.fillRect(0, 0, w, h);
            turtleX = 0;
            turtleY = 0;
            turtleHeading = 0;
            break;
          }
          case 'bgcolor':
            break;
        }
      }

      // Gambar kursor Kiko-Turtle dengan halo lembut saat menggambar
      if (turtleVisible) {
        const sx = toScreenX(turtleX);
        const sy = toScreenY(turtleY);

        if (targetCost < totalCost) {
          const pulse = 13 + Math.sin(timeNow / 130) * 3.5;
          ctx.beginPath();
          ctx.arc(sx, sy, pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(198, 246, 77, 0.35)';
          ctx.fill();
        }

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((-turtleHeading * Math.PI) / 180);

        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-9, -7.5);
        ctx.lineTo(-4.5, 0);
        ctx.lineTo(-9, 7.5);
        ctx.closePath();

        ctx.fillStyle = '#C6F64D';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#0F172A';
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    const tick = (now: number) => {
      const dtSec = Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
      lastTs = now;

      const baseRate = PIXELS_PER_SECOND[speedRef.current];
      const maxDurationSec =
        speedRef.current === 'slow' ? 7 : speedRef.current === 'normal' ? 3.4 : 1.2;
      const rate = Number.isFinite(baseRate)
        ? Math.max(baseRate, totalCost / maxDurationSec)
        : baseRate;
      if (!pausedRef.current && currentCost < totalCost) {
        if (!Number.isFinite(rate)) {
          currentCost = totalCost;
        } else {
          currentCost = Math.min(totalCost, currentCost + rate * dtSec);
        }
      }

      drawFrame(currentCost, now);

      const pct = totalCost === 0 ? 1 : currentCost / totalCost;
      setAnimProgress(pct);

      if (currentCost < totalCost) {
        setIsAnimating(true);
        rafId = window.requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };

    drawFrame(currentCost, performance.now());
    if (currentCost < totalCost) {
      rafId = window.requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      drawFrame(currentCost, performance.now());
    });
    observer.observe(container);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [segments, showGrid, theme, replayTick, runSignal, defaultBg]);

  const progressPct = Math.round(animProgress * 100);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar Kanvas Turtle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#F4F7FC] px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-blue-400" />
          <span className="text-[11px] font-bold text-[#0F172A] dark:text-slate-200">
            Kecepatan:
          </span>
          <div className="inline-flex rounded-full bg-white p-0.5 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            {(
              [
                ['slow', 'Pelan'],
                ['normal', 'Normal'],
                ['fast', 'Cepat'],
                ['instant', 'Instan'],
              ] as [SpeedPreset, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSpeed(key)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                  speed === key
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
              showGrid
                ? 'border-blue-300 bg-blue-50 text-[#1D4ED8] dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Grid className="h-3 w-3" />
            <span>Grid</span>
          </button>

          {isAnimating && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-[#EEFFC2] px-2.5 py-1 text-[11px] font-extrabold text-[#0F172A] transition hover:bg-[#D7FF73]"
            >
              {paused ? (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span>Lanjut</span>
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Jeda</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setCleared(false);
              setPaused(false);
              setReplayTick((t) => t + 1);
            }}
            disabled={commands.length === 0}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] transition hover:border-blue-300 hover:bg-blue-50/70 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Putar Ulang</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCleared(true);
              setIsAnimating(false);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Eraser className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Area Canvas */}
      <div
        ref={containerRef}
        className="relative min-h-[250px] flex-1 overflow-hidden bg-white dark:bg-[#0B1222]"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {/* Status Pill Animasi Kiko */}
        {segments.length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100">
            {isAnimating ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-[#1D4ED8]" />
                <span>
                  {paused
                    ? `⏸ Dijeda (${progressPct}%)`
                    : `✨ Kiko menggambar... ${progressPct}%`}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-[#C6F64D] ring-2 ring-[#0F172A]/20" />
                <span>✅ Selesai digambar!</span>
              </>
            )}
          </div>
        )}

        {segments.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="kodie-card-blue rounded-2xl border border-blue-200/80 px-4 py-3 text-center shadow-sm">
              <p className="text-xs font-extrabold text-[#0F172A]">
                🎨 Kanvas Kiko Siap Digambari!
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-700">
                Tekan tombol <strong>Jalankan</strong> untuk melihat Kiko bergerak langkah demi langkah.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
