import { getTranslations } from 'next-intl/server';
import type { PosterStyle } from '@/features/poster/lib/themes';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { HomePosterPreview } from './HomePosterPreview';

// The same sample night as the hero and the create page: Yalda in Tehran, 21:00.
const SAMPLE_NIGHT = {
  city: 'تهران',
  day: '30',
  month: 'آذر',
  year: '1405',
  time: '21:00',
  noExactTime: false,
};

// Gold leads, as it always has; the rest follow the order of the create page.
const ORDER: PosterStyle[] = ['gold', 'mono', 'black', 'parchment', 'violet'];

// The cards are ~320px wide, so fewer stars keep them clean and the markup small.
const CARD_LAYERS = { maxMagnitude: 4 };

export async function HomeGifts() {
  const t = await getTranslations('HomePage.gifts');
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;

  const items = ORDER.map((style) => ({
    style,
    title: t(`items.${style}.title`),
    body: t(`items.${style}.body`),
  }));

  return (
    <section id="gifts" className="bg-[#F4F0E7] px-6 py-24 text-[#17233B]">
      <div className="mx-auto md:px-20">
        <div data-animate="reveal">
          <p className="text-xs">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            {t('title')}
          </h2>
        </div>
        {/* centred wrap: 1 → 2 → 3 per row; the leftovers stay in the middle */}
        <div
          data-animate="stagger"
          className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-12 md:gap-x-8"
        >
          {items.map(({ style, title, body }) => (
            <div
              key={style}
              data-animate-item
              className="w-full text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.34rem)]"
            >
              <div className="mx-auto flex justify-center rounded-2xl bg-[#DDD8CD] px-6 py-8 md:px-8 md:py-10">
                <HomePosterPreview
                  variant={style}
                  size="product"
                  sky={sky}
                  layers={CARD_LAYERS}
                />
              </div>
              <h3 className="mt-8 text-xl">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-6">{body}</p>
            </div>
          ))}
        </div>
        <p data-animate="reveal" className="mt-10 text-xs">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
