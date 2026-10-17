'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

gsap.registerPlugin(ScrollTrigger);

type HomeMotionProps = {
  children: ReactNode;
} & ComponentPropsWithoutRef<'main'>;

/** Wraps every word in a clipping mask so it can slide up into place. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const inner: HTMLElement[] = [];
  const nodes = Array.from(el.childNodes);
  el.textContent = '';
  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) {
      el.append(node);
      continue;
    }
    (node.textContent ?? '').split(/\s+/).filter(Boolean).forEach((word, i, all) => {
      const mask = document.createElement('span');
      mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-block:0.12em;margin-block:-0.12em';
      const w = document.createElement('span');
      w.style.display = 'inline-block';
      w.textContent = word;
      mask.append(w);
      el.append(mask);
      if (i < all.length - 1) el.append(' ');
      inner.push(w);
    });
    el.append(' ');
  }
  return inner;
}

export function HomeMotion({ children, ...props }: HomeMotionProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion) {
      gsap.set(root.querySelectorAll('[data-animate]'), {
        clearProps: 'all',
        opacity: 1,
        y: 0,
        scale: 1,
      });
      return;
    }

    const titleEl = root.querySelector<HTMLElement>('[data-split]');
    const titleHtml = titleEl?.innerHTML ?? '';
    const ctx = gsap.context(() => {
      const header = root.querySelector('[data-animate="header"]');
      const heroItems = root.querySelectorAll('[data-animate="hero"]');
      const heroTitle = root.querySelector<HTMLElement>('[data-split]');
      const words = heroTitle ? splitWords(heroTitle) : [];
      const heroPoster = root.querySelector('[data-animate="hero-poster"]');

      gsap.set(header, { opacity: 0, y: -12 });
      gsap.set(heroItems, { opacity: 0, y: 28 });
      gsap.set(heroPoster, { opacity: 0, y: 40, scale: 0.94 });
      gsap.set(words, { yPercent: 115, rotate: 4 });

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      intro
        .to(header, { opacity: 1, y: 0, duration: 0.7 })
        .to(
          words,
          { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' },
          '-=0.35',
        )
        .to(
          heroItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
          },
          '-=0.35',
        )
        .to(
          heroPoster,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
          },
          '-=0.75',
        );

      if (heroPoster) {
        gsap.to(heroPoster, {
          y: -10,
          duration: 3.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: intro.duration(),
        });
      }

      const playIfUnreachable = (self: ScrollTrigger) => {
        const maxScroll = ScrollTrigger.maxScroll(window);
        if (self.start > maxScroll) {
          self.animation?.progress(1);
        }
      };

      root.querySelectorAll('[data-animate="reveal"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
            onRefresh: playIfUnreachable,
          },
        });
      });

      root.querySelectorAll('[data-animate="stagger"]').forEach((group) => {
        const items = group.querySelectorAll('[data-animate-item]');
        gsap.from(items, {
          opacity: 0,
          y: 32,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 92%',
            once: true,
            onRefresh: playIfUnreachable,
          },
        });
      });

      // buttons that lean towards the pointer
      root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * 0.28);
          y((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
      if (titleEl) titleEl.innerHTML = titleHtml;
    };
  }, []);

  return (
    <main ref={rootRef} {...props}>
      {children}
    </main>
  );
}
