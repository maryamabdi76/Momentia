'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

type Star = {
  x: number;
  y: number;
  /** Depth, 0.15 (far, slow, dim) … 1 (near, fast, bright). */
  z: number;
  size: number;
  twinkle: number;
  phase: number;
  color: string;
};

type Shooter = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const STAR_COLORS = ['#ffffff', '#cfe0ff', '#f1e6c8', '#ffe9b8'];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Soft coloured clouds, painted once and then only moved. */
function paintNebula(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(width / 2));
  c.height = Math.max(1, Math.round(height / 2));
  const g = c.getContext('2d');
  if (!g) return c;
  g.scale(0.5, 0.5);
  const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color.replace('A', String(alpha)));
    grad.addColorStop(1, color.replace('A', '0'));
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const m = Math.max(width, height);
  blob(width * 0.82, height * 0.12, m * 0.5, 'rgba(206,180,123,A)', 0.1); // gold
  blob(width * 0.1, height * 0.38, m * 0.55, 'rgba(92,60,170,A)', 0.16); // violet
  blob(width * 0.7, height * 0.62, m * 0.6, 'rgba(36,86,170,A)', 0.14); // blue
  blob(width * 0.2, height * 0.9, m * 0.5, 'rgba(150,70,130,A)', 0.1); // rose
  return c;
}

/**
 * The page as seen from space: layered stars that drift with the mouse and
 * stream past as you scroll, an occasional shooting star, a slow nebula and the
 * Moon receding as you travel down the page. Everything sits behind the content.
 */
export function SpaceBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const moon = moonRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let nebula: HTMLCanvasElement | null = null;
    const shooters: Shooter[] = [];

    let scrollY = window.scrollY;
    let velocity = 0; // smoothed scroll speed, px per frame
    let lastScroll = scrollY;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let nextShooter = 2;
    let time = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(280, Math.round((width * height) / 8500));
      stars = Array.from({ length: count }, () => {
        const z = rand(0.15, 1) ** 1.6 * 0.85 + 0.15;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          size: 0.4 + z * 1.5,
          twinkle: rand(0.6, 2.2),
          phase: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
        };
      });
      nebula = paintNebula(width, height * 1.5);
    }

    function spawnShooter() {
      const fromLeft = Math.random() < 0.5;
      const speed = rand(10, 16);
      const angle = rand(0.35, 0.75);
      shooters.push({
        x: fromLeft ? rand(0, width * 0.5) : rand(width * 0.5, width),
        y: rand(0, height * 0.4),
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: rand(40, 70),
      });
    }

    function draw(deltaFrames = 1) {
      time += deltaFrames / 60;
      scrollY = window.scrollY;
      const dv = scrollY - lastScroll;
      lastScroll = scrollY;
      velocity += (dv - velocity) * 0.12;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      ctx!.clearRect(0, 0, width, height);

      if (nebula) {
        const drift = Math.min(scrollY * 0.05, height * 0.5);
        ctx!.globalAlpha = 0.9;
        ctx!.drawImage(nebula, -mouse.x * 10, -drift - mouse.y * 10, width, height * 1.5);
        ctx!.globalAlpha = 1;
      }

      const warp = Math.min(Math.abs(velocity), 70);
      for (const s of stars) {
        // near stars slide past faster than far ones: that is the depth
        const travel = scrollY * (0.06 + 0.5 * s.z) + time * (reduceMotion ? 0 : 2 * s.z);
        let y = (s.y - travel) % height;
        if (y < 0) y += height;
        const x = s.x + mouse.x * 18 * s.z;

        const tw = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time * s.twinkle + s.phase);
        ctx!.globalAlpha = Math.min(1, (0.25 + s.z * 0.75) * tw);
        ctx!.strokeStyle = s.color;
        ctx!.fillStyle = s.color;

        const streak = warp * s.z * 1.4;
        if (streak > 2.5) {
          // scrolling down moves stars up, so the trail points down (and back the other way)
          ctx!.lineWidth = s.size;
          ctx!.lineCap = 'round';
          ctx!.beginPath();
          ctx!.moveTo(x, y);
          ctx!.lineTo(x, y + Math.sign(velocity) * streak);
          ctx!.stroke();
        } else {
          ctx!.beginPath();
          ctx!.arc(x, y, s.size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;

      if (!reduceMotion) {
        nextShooter -= deltaFrames / 60;
        if (nextShooter <= 0) {
          spawnShooter();
          nextShooter = rand(4, 9);
        }
        for (let i = shooters.length - 1; i >= 0; i--) {
          const s = shooters[i]!;
          s.life += deltaFrames;
          s.x += s.vx * deltaFrames;
          s.y += s.vy * deltaFrames;
          const k = 1 - s.life / s.max;
          if (k <= 0) {
            shooters.splice(i, 1);
            continue;
          }
          const tail = 14;
          const grad = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
          grad.addColorStop(0, `rgba(255,244,214,${k})`);
          grad.addColorStop(1, 'rgba(255,244,214,0)');
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.6;
          ctx!.lineCap = 'round';
          ctx!.beginPath();
          ctx!.moveTo(s.x, s.y);
          ctx!.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
          ctx!.stroke();
        }
      }
    }

    const tick = (_time: number, deltaMs: number) =>
      draw(Math.min(deltaMs, 100) / (1000 / 60));

    function onMove(e: PointerEvent) {
      mouse.tx = (e.clientX / width - 0.5) * 2;
      mouse.ty = (e.clientY / height - 0.5) * 2;
    }

    resize();
    window.addEventListener('resize', resize);

    const ctxGsap = gsap.context(() => {
      gsap.from(canvas, { opacity: 0, duration: 2.4, ease: 'power2.out' });

      if (reduceMotion) {
        draw(0);
        return;
      }

      window.addEventListener('pointermove', onMove, { passive: true });
      gsap.ticker.add(tick);

      // the Moon recedes as you travel down the page
      if (moon) {
        gsap.fromTo(
          moon,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 2.6, ease: 'power2.out', delay: 0.4 },
        );
        gsap.to(moon, {
          yPercent: 55,
          xPercent: -18,
          scale: 0.45,
          rotate: 24,
          opacity: 0.3, // by the time you reach the text it is only a glow
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      ctxGsap.revert();
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={moonRef}
        className="absolute -end-24 top-24 size-72 sm:-end-16 sm:size-96 lg:-end-[10%] lg:-top-24 lg:size-[40rem]"
      >
        {/* real photo of the Moon, lit from the side and kept dim so the text stays readable */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            backgroundImage: 'url(/moon/moon-nearside.jpg)',
            backgroundSize: 'cover',
            boxShadow: '0 0 120px 30px rgba(206,180,123,0.12)',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(110deg, rgba(8,15,40,0) 25%, rgba(8,15,40,0.55) 55%, rgba(8,15,40,0.93) 85%)',
          }}
        />
      </div>
    </div>
  );
}
