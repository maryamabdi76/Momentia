import { getTranslations } from 'next-intl/server';
import { PosterPreview } from '@/features/poster/components/PosterPreview';
import { POSTER_THEMES, type PosterStyle } from '@/features/poster/lib/themes';
import type { SkyLayers } from '@/features/sky/lib/layers';
import type { SkySnapshot } from '@/features/sky/lib/types';

export type PosterVariant = PosterStyle;
export type PosterSize = 'hero' | 'product' | 'compact';

export async function HomePosterPreview({
  variant = 'gold',
  size = 'product',
  sky,
  layers,
}: {
  variant?: PosterVariant;
  size?: PosterSize;
  /** A real sky for the card; without it the static illustration is shown. */
  sky?: SkySnapshot | null;
  /** Lighter charts keep small cards from becoming heavy markup. */
  layers?: Partial<SkyLayers>;
}) {
  const t = await getTranslations('HomePage.hero');

  const preview = (
    <PosterPreview
      size={size === 'hero' ? 'hero' : 'default'}
      showDisclaimer={false}
      sky={sky}
      data={{ style: variant, layers }}
      labels={{
        headerLine: t('posterHeader'),
        mapAlt: t(`posterAlt.${variant}`),
        watermark: t('posterWatermark'),
      }}
      className="rounded-none shadow-none"
    />
  );

  if (size === 'hero') return <div className="w-full">{preview}</div>;

  return (
    <div
      className="w-full max-w-80 p-4"
      style={{ backgroundColor: POSTER_THEMES[variant].mat }}
    >
      {preview}
    </div>
  );
}
