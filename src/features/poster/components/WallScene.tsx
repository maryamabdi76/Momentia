import type { ReactNode } from 'react';
import Image from 'next/image';
import { WALL_MOCKUP, frameBox } from '../lib/wall-mockup';

/**
 * A real room photo with a blank frame; the poster preview is placed inside that frame.
 * The photo and the frame's position come from `wall-mockup.ts`.
 */
export function WallScene({ children, label }: { children: ReactNode; label: string }) {
  const box = frameBox(WALL_MOCKUP);

  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl"
      style={{ aspectRatio: `${WALL_MOCKUP.width} / ${WALL_MOCKUP.height}` }}
    >
      <Image
        src={WALL_MOCKUP.src}
        alt=""
        fill
        sizes="(min-width: 640px) 384px, 100vw"
        className="object-cover"
        priority={false}
      />
      <div
        className="absolute flex justify-center overflow-hidden bg-white"
        style={{
          left: `${box.left}%`,
          top: `${box.top}%`,
          width: `${box.width}%`,
          height: `${box.height}%`,
        }}
      >
        {/* the poster is 2:3; fit it to the frame's height and let the paper show at the sides */}
        <div className="h-full" style={{ aspectRatio: '2 / 3' }}>
          {children}
        </div>
        {/* the wall's light falling on the print */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(120deg,rgba(255,244,225,.10) 0%,rgba(90,60,30,.10) 100%)',
            boxShadow: 'inset 0 0 10px rgba(60,40,20,.20)',
          }}
        />
      </div>
    </div>
  );
}
