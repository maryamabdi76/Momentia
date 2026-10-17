import type { ReactNode } from 'react';
import { cn } from 'cn';
import { PremiumMark } from '@/features/poster/components/PremiumMark';
import type { PosterTemplate } from '@/features/poster/lib/templates';
import type { PosterStyle } from '@/features/poster/lib/themes';
import type { SkyLayers } from '@/features/sky/lib/layers';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { HomePosterPreview } from './HomePosterPreview';

/** One poster in a showcase: the preview on a mat, then its name and a line about it. */
export function PosterCard({
  style,
  template = 'circle',
  sky,
  layers,
  title,
  body,
  premium,
  preview,
  align = 'center',
  className,
}: {
  style?: PosterStyle;
  template?: PosterTemplate;
  sky?: SkySnapshot | null;
  layers?: Partial<SkyLayers>;
  title: string;
  body: string;
  /** When set, the card carries the premium crown with this label and tooltip. */
  premium?: { label: string; tooltip: string };
  /** Replaces the default sky preview (e.g. Moon poster). */
  preview?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div
      data-animate-item
      className={cn(
        'group',
        centered ? 'text-center' : 'text-start',
        className,
      )}
    >
      {/* Hover effects live on inner nodes (not this GSAP-animated wrapper). */}
      <div className="mx-auto flex justify-center rounded-2xl bg-[#DDD8CD] px-6 py-8 transition-colors duration-300 group-hover:bg-[#D6D0C3] md:px-8 md:py-10">
        <div className="w-full max-w-80 ease-out motion-safe:transition-[transform,filter] motion-safe:duration-500 motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:drop-shadow-[0_22px_28px_rgba(23,35,59,0.28)]">
          {preview ??
            (style ? (
              <HomePosterPreview
                variant={style}
                template={template}
                size="product"
                sky={sky ?? null}
                layers={layers}
              />
            ) : null)}
        </div>
      </div>
      <h3
        className={cn(
          'mt-6 flex gap-2 text-lg font-semibold sm:mt-8 sm:text-xl',
          centered ? 'items-center justify-center' : 'items-center',
        )}
      >
        {title}
        {premium && <PremiumMark {...premium} />}
      </h3>
      <p
        className={cn(
          'mt-2 max-w-xs text-xs leading-6',
          centered ? 'mx-auto' : undefined,
        )}
      >
        {body}
      </p>
    </div>
  );
}
