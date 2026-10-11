import { getTranslations } from 'next-intl/server';
import { cn } from 'cn';

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
  const frameClass =
    size === 'hero'
      ? 'max-w-[400px] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.35)]'
      : size === 'compact'
        ? 'max-w-[240px] p-2 shadow-lg'
        : 'max-w-[260px] p-2.5 shadow-xl';

  return (
    <div className={cn('w-full rounded-sm border border-white/20', frameClass)}>
      <div
        className={cn(
          'border px-4 py-5 text-center',
          isGold ? 'border-[#c8a85f]/70 bg-[#132346]' : 'border-[#b9b5aa] bg-[#f8f6f0]',
        )}
      >
        <p className={cn('text-[10px]', isGold ? 'text-white/60' : 'text-[#101a35]/50')}>
          {t('posterMap')}
        </p>
        <div
          className={cn(
            'mx-auto mt-3 flex aspect-square items-center justify-center rounded-full border p-3',
            isGold ? 'border-[#c8a85f]/50' : 'border-[#101a35]/15',
          )}
        >
          <img
            src={isGold ? '/images/gold-constellation.png' : '/images/monochrome-constellation.png'}
            alt={isGold ? t('posterAltGold') : t('posterAltMono')}
            className={cn('size-full object-contain', isGold ? 'p-1' : 'opacity-90')}
          />
        </div>
        <p
          className={cn(
            'mt-4 font-semibold',
            size === 'hero' ? 'text-xl' : 'text-sm',
            isGold ? 'text-[#f2e7be]' : 'text-[#101a35]',
          )}
        >
          {t('poster')}
        </p>
        {size === 'hero' && (
          <>
            <p className="mt-2 text-xs text-white/80">{t('posterNames')}</p>
            <p className="mt-1 text-[10px] leading-5 text-white/50">{t('posterMeta')}</p>
          </>
        )}
      </div>
    </div>
  );
}
