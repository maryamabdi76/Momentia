'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { SpaceBackdrop } from './SpaceBackdrop';

gsap.registerPlugin(ScrollTrigger);

type Labels = { clock: string; moon: string; lit: string };

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The page as a night you scroll through: a real three.js sky behind everything,
 * where scrolling is time. The HUD shows the clock and the Moon's phase for that
 * moment. Falls back to the canvas backdrop when WebGL is not available.
 */
export function SpaceStage({ labels }: { labels: Labels }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const litRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!webglAvailable()) {
      setFallback(true);
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const [{ createNightScene }, { skyCatalog }] = await Promise.all([
          import('../scene/night-scene'),
          import('@/features/sky/catalog'),
        ]);
        if (disposed) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const scene = createNightScene(canvas, {
          catalog: skyCatalog,
          moonTexture: '/moon/moon-2k.jpg',
        });

        const size = () => scene.resize(window.innerWidth, window.innerHeight);
        size();

        const pointer = { x: 0, y: 0 };
        let progress = 0;
        const sync = () => scene.setTarget(progress, pointer.x, pointer.y);

        const onMove = (e: PointerEvent) => {
          pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
          pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
          sync();
        };

        const hud = () => {
          const { hours, phaseAngle, progress: p } = scene.state;
          const total = Math.round((21 + hours) * 60) % (24 * 60);
          const hh = String(Math.floor(total / 60)).padStart(2, '0');
          const mm = String(total % 60).padStart(2, '0');
          if (clockRef.current) clockRef.current.textContent = toPersianDigits(`${hh}:${mm}`);
          const lit = Math.round(((1 + Math.cos(phaseAngle)) / 2) * 100);
          if (litRef.current) litRef.current.textContent = toPersianDigits(`${lit}٪`);
          if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        };

        const ctx = gsap.context(() => {
          gsap.from(canvas, { opacity: 0, duration: 2.2, ease: 'power2.out' });
          ScrollTrigger.create({
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              progress = self.progress;
              sync();
            },
          });
        });

        const draw = (_t: number, deltaMs: number) => {
          scene.frame(Math.min(deltaMs, 100) / 1000);
          hud();
        };

        window.addEventListener('resize', size);
        if (reduceMotion) {
          // one still frame of the night, no movement
          scene.frame(1);
          hud();
        } else {
          window.addEventListener('pointermove', onMove, { passive: true });
          gsap.ticker.add(draw);
        }

        cleanup = () => {
          window.removeEventListener('resize', size);
          window.removeEventListener('pointermove', onMove);
          gsap.ticker.remove(draw);
          ctx.revert();
          scene.dispose();
        };
        if (disposed) cleanup();
      } catch {
        if (!disposed) setFallback(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  if (fallback) return <SpaceBackdrop />;

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        {/* keeps the text readable wherever the Moon drifts */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,15,40,0)_30%,rgba(8,15,40,0.55)_100%)]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-4 start-4 z-20 hidden select-none items-center gap-4 rounded-full border border-[#CEB47B]/25 bg-[#080f28]/60 px-4 py-2 text-[11px] text-[#AAB6CD] backdrop-blur md:flex"
      >
        <span>
          {labels.clock} <span ref={clockRef} className="font-semibold text-[#CEB47B]">۲۱:۰۰</span>
        </span>
        <span className="h-3 w-px bg-[#CEB47B]/30" />
        <span>
          {labels.moon} <span ref={litRef} className="font-semibold text-[#CEB47B]">۰٪</span>{' '}
          {labels.lit}
        </span>
        <span className="relative h-0.5 w-16 overflow-hidden rounded bg-white/10">
          <div ref={barRef} className="absolute inset-0 origin-right bg-[#CEB47B]" style={{ transform: 'scaleX(0)' }} />
        </span>
      </div>
    </>
  );
}
