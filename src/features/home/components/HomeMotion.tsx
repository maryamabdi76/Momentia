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

    const ctx = gsap.context(() => {
      const header = root.querySelector('[data-animate="header"]');
      const heroItems = root.querySelectorAll('[data-animate="hero"]');
      const heroPoster = root.querySelector('[data-animate="hero-poster"]');

      gsap.set(header, { opacity: 0, y: -12 });
      gsap.set(heroItems, { opacity: 0, y: 28 });
      gsap.set(heroPoster, { opacity: 0, y: 40 });

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      intro
        .to(header, { opacity: 1, y: 0, duration: 0.7 })
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

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} {...props}>
      {children}
    </main>
  );
}
