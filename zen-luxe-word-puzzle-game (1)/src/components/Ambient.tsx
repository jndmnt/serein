import { useEffect, useRef } from "react";

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  alpha: number;
  warm: boolean;
}

/**
 * Breathing ambient background: layered gradient blobs + a canvas of drifting
 * dust motes. Deliberately low contrast and slow — atmosphere, not decoration.
 */
export function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let frame = 0;

    const seed = () => {
      const count = width < 700 ? 22 : 36;
      motes = Array.from({ length: count }, () => {
        const warm = Math.random() > 0.62;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.6 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.04 - Math.random() * 0.14,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.14 + Math.random() * 0.32,
          warm,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        if (!reduced) {
          m.x += m.vx + Math.sin(t * 0.00016 + m.phase) * 0.09;
          m.y += m.vy;
          if (m.y < -12) {
            m.y = height + 12;
            m.x = Math.random() * width;
          }
          if (m.x < -14) m.x = width + 14;
          if (m.x > width + 14) m.x = -14;
        }
        const twinkle = 0.65 + Math.sin(t * 0.0009 + m.phase) * 0.35;
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4.2);
        const tint = m.warm ? "216, 192, 152" : "246, 247, 238";
        grad.addColorStop(0, `rgba(${tint}, ${m.alpha * twinkle})`);
        grad.addColorStop(0.45, `rgba(${tint}, ${m.alpha * twinkle * 0.4})`);
        grad.addColorStop(1, `rgba(${tint}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="ambient-base" aria-hidden />
      <div className="ambient-blob ambient-blob-a" aria-hidden />
      <div className="ambient-blob ambient-blob-b" aria-hidden />
      <div className="ambient-blob ambient-blob-c" aria-hidden />
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="pointer-events-none fixed -bottom-24 -right-20 z-[-1] h-[52vh] w-[52vh] opacity-[0.13]"
        fill="none"
      >
        <path
          d="M300 520C180 470 120 350 160 240c30-84 120-140 220-118 92 20 156 108 148 200-8 104-110 178-228 198Z"
          stroke="var(--accent-deep)"
          strokeWidth="1"
        />
        <path d="M300 520c-20-140 10-260 80-380M300 520c-90-90-130-200-140-300" stroke="var(--accent-deep)" strokeWidth="0.7" />
        <path d="M270 340c-50-14-86-50-100-96 52 2 92 30 100 96ZM318 300c10-58 46-98 100-118-16 62-46 100-100 118Z" stroke="var(--accent-deep)" strokeWidth="0.7" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none fixed -left-16 top-24 z-[-1] h-[38vh] w-[38vh] opacity-[0.1]"
        fill="none"
      >
        <circle cx="200" cy="200" r="150" stroke="var(--accent-deep)" strokeWidth="0.6" strokeDasharray="2 7" />
        <circle cx="200" cy="200" r="112" stroke="var(--accent-deep)" strokeWidth="0.6" />
        <path d="M200 88c-44 44-44 92 0 136 44-44 44-92 0-136Z" stroke="var(--accent-deep)" strokeWidth="0.7" />
        <path d="M200 224c-30 20-46 48-48 88 34-14 52-40 48-88Z" stroke="var(--accent-deep)" strokeWidth="0.7" />
      </svg>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[-1]" />
      <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-[-1] opacity-[0.045] mix-blend-multiply" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[-1] h-40 bg-gradient-to-b from-white/40 to-transparent"
      />
    </>
  );
}
