import { getTranslations } from 'next-intl/server';
import { cn } from 'cn';
import { PosterPreview } from '@/features/poster/components/PosterPreview';

export type PosterVariant = 'gold' | 'mono';
export type PosterSize = 'hero' | 'product' | 'compact';

export async function HomePosterPreview({
  variant = 'gold',
  size = 'product',
}: {
  variant?: PosterVariant;
  size?: PosterSize;
}) {
  const t = await getTranslations('HomePage.hero');
  const isGold = variant === 'gold';

  if (size === 'hero') {
    return (
      <div className="w-full">
        <PosterPreview
          size="hero"
          showDisclaimer={false}
          data={{ style: isGold ? 'gold' : 'mono' }}
          labels={{
            headerLine: t('posterHeader'),
            mapAlt: isGold ? t('posterAltGold') : t('posterAltMono'),
            watermark: t('posterWatermark'),
          }}
          className="rounded-none shadow-none"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full max-w-80 p-4',
        isGold ? 'bg-[#132346]' : 'bg-[#f8f6f0]',
      )}
    >
      <PosterPreview
        size="default"
        showDisclaimer={false}
        data={{ style: isGold ? 'gold' : 'mono' }}
        labels={{
          headerLine: t('posterHeader'),
          mapAlt: isGold ? t('posterAltGold') : t('posterAltMono'),
          watermark: t('posterWatermark'),
        }}
        className="rounded-none shadow-none"
      />
    </div>
  );
}
