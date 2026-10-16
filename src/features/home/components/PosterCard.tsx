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
  className,
}: {
  style: PosterStyle;
  template?: PosterTemplate;
  sky: SkySnapshot | null;
  layers?: Partial<SkyLayers>;
  title: string;
  body: string;
  /** When set, the card carries the premium crown with this label and tooltip. */
  premium?: { label: string; tooltip: string };
  className?: string;
}) {
  return (
    <div data-animate-item className={className}>
      <div className="mx-auto flex justify-center rounded-2xl bg-[#DDD8CD] px-6 py-8 md:px-8 md:py-10">
        <HomePosterPreview
          variant={style}
          template={template}
          size="product"
          sky={sky}
          layers={layers}
        />
      </div>
      <h3 className="mt-8 flex items-center justify-center gap-2 text-xl">
        {title}
        {premium && <PremiumMark {...premium} />}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-xs leading-6">{body}</p>
    </div>
  );
}
