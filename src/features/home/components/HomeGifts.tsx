import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { PosterStyle } from '@/features/poster/lib/themes';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { PosterCard } from './PosterCard';
import { SAMPLE_NIGHT } from './sample-night';

// A taste of the range; every poster lives on /posters.
const FEATURED: PosterStyle[] = ['gold', 'mono', 'black'];

// The cards are ~320px wide, so fewer stars keep them clean and the markup small.
const CARD_LAYERS = { maxMagnitude: 4 };

export async function HomeGifts() {
  const t = await getTranslations('HomePage.gifts');
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;

  const items = FEATURED.map((style) => ({
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
            <PosterCard
              key={style}
              style={style}
              sky={sky}
              layers={CARD_LAYERS}
              title={title}
              body={body}
              className="w-full text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.34rem)]"
            />
          ))}
        </div>
        <div
          data-animate="reveal"
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <Link
            href="/posters"
            className="inline-flex items-center gap-2 rounded-full border border-[#17233B]/40 px-6 py-3 text-sm font-medium transition-colors hover:bg-[#17233B] hover:text-[#F4F0E7]"
          >
            {t('showMore')}
            <ArrowLeft className="size-4" />
          </Link>
          <p className="text-xs">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
