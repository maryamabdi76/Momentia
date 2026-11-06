import type { ReactNode } from 'react';

/**
 * A living-room wall with the poster hung on it, so the buyer sees how big it feels in a
 * home. Pure CSS: the poster is the same preview as everywhere else, just smaller.
 */
export function WallScene({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl"
      style={{ background: 'linear-gradient(180deg,#e7dfd1 0%,#d8cdb9 100%)' }}
    >
      {/* soft light from the side */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(70% 90% at 15% 20%,rgba(255,248,230,.55),transparent 70%)' }}
      />
      {/* skirting board and floor */}
      <div aria-hidden className="absolute inset-x-0 bottom-[16%] h-[2.5%] bg-[#f3eee4]" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[16%]"
        style={{ background: 'linear-gradient(180deg,#a98a67,#8f7152)' }}
      />
      {/* the poster */}
      <div className="absolute start-1/2 top-[9%] w-[34%] -translate-x-1/2 rtl:translate-x-1/2">
        <div className="shadow-[0_14px_22px_-8px_rgba(40,28,10,.55)]">{children}</div>
      </div>
      {/* a low shelf under it, for scale */}
      <div aria-hidden className="absolute inset-x-[24%] bottom-[16%] h-[11%] rounded-t-sm bg-[#6f5a45]" />
      <div aria-hidden className="absolute bottom-[27%] start-[27%] h-[9%] w-[4%] rounded-t-full bg-[#8d9a7a]" />
    </div>
  );
}
