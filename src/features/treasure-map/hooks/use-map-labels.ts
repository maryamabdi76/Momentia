import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toPersianDigits } from '@/features/poster/lib/digits';
import type { TreasureMapLabels } from '../lib/map-svg';

/** The fixed words printed on the map, in Persian. */
export function useMapLabels(count: number): TreasureMapLabels {
  const t = useTranslations('MapPage');
  return useMemo(
    () => ({
      count: t('poster.count', { count: toPersianDigits(String(count)) }),
      watermark: t('poster.watermark'),
      credit: t('poster.credit'),
      iran: t('poster.iran'),
      alt: t('poster.alt'),
      north: t('poster.north'),
    }),
    [t, count],
  );
}
