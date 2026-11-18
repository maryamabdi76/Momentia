import { getTranslations } from 'next-intl/server';
import type { TreasureMapData, TreasureMapLabels } from '@/features/treasure-map/lib/map-svg';

/** What the home page needs to draw a sample treasure map: the illustrated road, on paper or in pen. */
export async function getMapSample(theme: TreasureMapData['theme'] = 'paper') {
  const t = await getTranslations('HomePage.map');
  const tMap = await getTranslations('MapPage');

  const data: TreasureMapData = {
    title: t('sampleTitle'),
    names: t('sampleNames'),
    layout: 'road',
    scope: 'city',
    area: 'تهران',
    theme,
    shape: 'circle',
    frame: theme === 'ink' ? 'classic' : 'minimal',
    showArea: true,
    showCoords: false,
    milestones: [
      { title: t('moments.0.title'), city: t('moments.0.place'), date: t('moments.0.date'), art: 'cafe' },
      { title: t('moments.1.title'), city: t('moments.1.place'), date: t('moments.1.date'), art: 'ring' },
      { title: t('moments.2.title'), city: t('moments.2.place'), date: t('moments.2.date'), art: 'cake' },
      { title: t('moments.3.title'), city: t('moments.3.place'), date: t('moments.3.date'), art: 'home' },
    ],
  };
  const labels: TreasureMapLabels = {
    count: '',
    watermark: tMap('poster.watermark'),
    credit: tMap('poster.credit'),
    iran: tMap('poster.iran'),
    alt: t('posterAlt'),
    north: tMap('poster.north'),
  };
  return { data, labels };
}
