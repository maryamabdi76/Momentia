import type { ReactNode } from 'react';

/**
 * A living-room wall with the poster framed above a sofa, so the buyer sees how big it
 * feels at home. Pure CSS; the poster is the same preview as everywhere else, scaled down.
 * Everything is placed in percentages of the scene so it looks the same at any width.
 */
export function WallScene({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-xl"
      style={{ background: 'linear-gradient(180deg,#ece4d6 0%,#ddd2bf 100%)' }}
    >
      {/* daylight from the left */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(75% 85% at 12% 15%,rgba(255,250,235,.7),transparent 70%)' }}
      />

      {/* floor and skirting board */}
      <div aria-hidden className="absolute inset-x-0 bottom-[15%] h-[2%] bg-[#f6f1e7]" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[15%]"
        style={{ background: 'linear-gradient(180deg,#b08f69,#957653)' }}
      />
      {/* rug */}
      <div aria-hidden className="absolute inset-x-[16%] bottom-[2%] h-[9%] rounded-[50%] bg-[#c9b79c]/70" />

      {/* sofa: back, seat, arms */}
      <div aria-hidden className="absolute inset-x-[17%] bottom-[15.5%] h-[24%]">
        <div className="absolute inset-x-[7%] top-0 h-[62%] rounded-t-[22px] bg-[#6e7b8b]" />
        <div className="absolute inset-x-[7%] bottom-[18%] h-[34%] rounded-md bg-[#7d8a9a]" />
        <div className="absolute inset-y-[22%] start-0 w-[11%] rounded-xl bg-[#667384]" />
        <div className="absolute inset-y-[22%] end-0 w-[11%] rounded-xl bg-[#667384]" />
        <div className="absolute bottom-0 start-[14%] h-[9%] w-[3%] bg-[#3f3a35]" />
        <div className="absolute bottom-0 end-[14%] h-[9%] w-[3%] bg-[#3f3a35]" />
      </div>

      {/* the framed poster, hung above the sofa */}
      <div className="absolute start-1/2 top-[6%] w-[27%] -translate-x-1/2 rtl:translate-x-1/2">
        <div className="bg-[#2a221b] p-[3.5%] shadow-[0_12px_20px_-6px_rgba(40,28,10,.5)]">
          {children}
        </div>
      </div>
    </div>
  );
}
