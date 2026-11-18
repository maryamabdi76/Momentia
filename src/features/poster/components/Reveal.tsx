'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Fades and scales its children in one frame after they first appear (skipped for reduced motion). */
export function Reveal({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={
        'w-full motion-safe:transition-all motion-safe:duration-[1400ms] motion-safe:ease-out ' +
        (shown ? 'opacity-100 motion-safe:scale-100' : 'opacity-0 motion-safe:scale-95')
      }
    >
      {children}
    </div>
  );
}

