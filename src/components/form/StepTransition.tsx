import type { ReactNode } from 'react';

/** A step eases in from below when it opens, so moving on feels like turning a page. */
export function StepTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none">{children}</div>
  );
}
