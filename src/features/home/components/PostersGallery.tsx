import { getTranslations } from 'next-intl/server';
import { Server, ShieldCheck, UserX } from 'lucide-react';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { FULL_SKY_DEPTH } from '@/features/poster/lib/templates';
import { POSTER_STYLES, type PosterStyle } from '@/features/poster/lib/themes';
import type { PosterLabels } from '@/features/poster/components/PosterPreview';
import { SAMPLE_NIGHT } from './sample-night';
import { MOON_SAMPLE_BASE, getMoonSamples } from './moon-sample';
import {
  PostersGalleryClient,
  type PostersGalleryLabels,
} from './PostersGalleryClient';

const CARD_LAYERS = { maxMagnitude: 4 };

const TRUST_ICONS = [ShieldCheck, Server, UserX];

export async function PostersGallery() {
  const t = await getTranslations('PostersPage');
  const tHome = await getTranslations('HomePage');
  const tHero = await getTranslations('HomePage.hero');
  const tStep2 = await getTranslations('CreatePage.step2');

  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;
  const fullSky = skyForMoment(SAMPLE_NIGHT, FULL_SKY_DEPTH)?.sky ?? null;

  const styleNames = Object.fromEntries(
    POSTER_STYLES.map((s) => [s, tStep2(`styles.${s}`)]),
  ) as Record<PosterStyle, string>;

  const galleryLabels: PostersGalleryLabels = {
    breadcrumb: t('breadcrumb'),
    statsLine: t('statsLine'),
    statsNote: t('statsNote'),
    title: t('title'),
    description: t('description'),
    filters: {
      product: t('filters.product'),
      productAll: t('filters.productAll'),
      productSky: t('filters.productSky'),
      productMoon: t('filters.productMoon'),
      template: t('filters.template'),
      templateAll: t('filters.templateAll'),
      templateCircle: t('filters.templateCircle'),
      templateFull: t('filters.templateFull'),
      paletteHint: t('filters.paletteHint'),
    },
    premiumBar: t('premiumBar'),
    premiumBadge: t('premiumBadge'),
    showcaseNote: t('showcaseNote'),
    personalize: t('personalize'),
    styleNames,
    sections: {
      circle: {
        collection: t('sections.circle.collection'),
        family: t('sections.circle.family'),
        title: t('sections.circle.title'),
        description: t('sections.circle.description'),
        badges: t.raw('sections.circle.badges') as string[],
        footnote: t('sections.circle.footnote'),
      },
      full: {
        collection: t('sections.full.collection'),
        family: t('sections.full.family'),
        title: t('sections.full.title'),
        description: t('sections.full.description'),
        badges: t.raw('sections.full.badges') as string[],
        footnote: t('sections.full.footnote'),
      },
      moon: {
        collection: t('sections.moon.collection'),
        family: t('sections.moon.family'),
        title: t('sections.moon.title'),
        description: t('sections.moon.description'),
        badges: t.raw('sections.moon.badges') as string[],
        footnote: t('sections.moon.footnote'),
      },
    },
  };

  const posterLabels: PosterLabels = {
    headerLine: tHero('posterHeader'),
    mapAlt: tHero('posterAlt.gold'),
    watermark: tHero('posterWatermark'),
    north: 'شمال',
    south: 'جنوب',
    east: 'شرق',
    west: 'غرب',
    disclaimer: '',
    timeAt: 'ساعت',
  };

  const compareRowLabels = t.raw('compare.rowLabels') as Record<string, string>;
  const compareRows = (['feature', 'colors', 'personalization'] as const).map(
    (key) => ({
      label: compareRowLabels[key],
      cells: t.raw(`compare.rows.${key}`) as Record<string, string>,
    }),
  );

  const trustItems = [0, 1, 2].map((i) => tHome(`trust.items.${i}`));

  return (
    <>
      <PostersGalleryClient
        labels={galleryLabels}
        posterLabels={posterLabels}
        sky={sky}
        fullSky={fullSky}
        moonFacts={moonFacts}
        moonLabels={moonLabels}
        moonSample={MOON_SAMPLE_BASE}
        layers={CARD_LAYERS}
      />

      <section className="px-6 md:px-22 md:py-14" dir="rtl">
        <div className="flex flex-col gap-12 xl:flex-row xl:gap-18">
          <div className="flex w-full shrink-0 flex-col gap-2 xl:max-w-2xl">
            <h2 className="whitespace-pre-line text-start text-[29px] font-medium leading-snug text-[#172338]">
              {t('compare.title')}
            </h2>
            <p className="mt-3 text-start text-[15px] leading-relaxed text-[#69717c]">
              {t('compare.body')}
            </p>
            <p className="mt-3 text-start text-[12px] leading-relaxed text-[#69717c]">
              {t('compare.disclaimer')}
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-[#dad4c7] min-w-0 flex-1 max-w-none ">
            <div className="grid grid-cols-[minmax(5.5rem,1fr)_repeat(3,minmax(0,1fr))] gap-3  bg-[#e8e3d9] px-3 py-3.5 text-[13px] font-semibold text-[#172338] md:gap-5 md:text-[15px]">
              <p className="text-start" />
              <p className="text-center">{t('compare.columns.circle')}</p>
              <p className="text-center">{t('compare.columns.full')}</p>
              <p className="text-center">{t('compare.columns.moon')}</p>
            </div>
            {compareRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[minmax(5.5rem,1fr)_repeat(3,minmax(0,1fr))] gap-3 border-t border-[#dad4c7] px-3 py-3.5 text-[12px] text-[#69717c] md:gap-5 md:text-[13px]"
              >
                <p className="text-start font-medium text-[#172338]">
                  {row.label}
                </p>
                <p className="text-center">{row.cells.circle}</p>
                <p className="text-center">{row.cells.full}</p>
                <p className="text-center">{row.cells.moon}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14223b] px-6 py-8 md:px-22" dir="rtl">
        {/* Trust row */}
        <div
          data-animate="reveal"
          className="flex flex-col bg-[#142039] items-start justify-between gap-10 px-6 md:px-20 py-10 md:flex-row md:items-center"
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {tHome('trust.title')}
            </h2>
            <p className="mt-4 text-xs leading-7 text-[#AAB6CD]">
              {tHome('trust.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-10 text-center text-xs text-[#CEB47B] md:gap-12">
            {trustItems.map((label, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <span key={label} className="min-w-20">
                  <Icon className="mx-auto mb-2 size-5 stroke-[1.5]" />
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
