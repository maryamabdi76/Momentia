import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { FULL_SKY_DEPTH } from '@/features/poster/lib/templates';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { HomePosterPreview } from './HomePosterPreview';
import { PosterCard } from './PosterCard';
import { MOON_SAMPLE_BASE, getMoonSamples } from './moon-sample';
import { SAMPLE_NIGHT } from './sample-night';

const CARD_LAYERS = { maxMagnitude: 4 };

/** Circle · full · moon — same sample night as the hero. */
const FRAMES = [
  {
    key: 'circle' as const,
    style: 'mono' as const,
    template: 'circle' as const,
  },
  {
    key: 'full' as const,
    style: 'black' as const,
    template: 'full' as const,
    premium: true,
  },
  { key: 'moon' as const, style: 'violet' as const },
] as const;

export async function HomeGifts() {
  const t = await getTranslations('HomePage.gifts');
  const tHero = await getTranslations('HomePage.hero');
  const tPosters = await getTranslations('PostersPage');
  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;
  const fullSky = skyForMoment(SAMPLE_NIGHT, FULL_SKY_DEPTH)?.sky ?? null;

  const moonPreview = moonFacts ? (
    <HomePosterPreview variant="violet" size="product">
      <MoonPoster
        data={{
          ...MOON_SAMPLE_BASE,
          style: 'violet',
          title: tHero('poster'),
          names: tHero('posterNames'),
          quote: '',
          dateLabel: '۳۰ آذر ۱۴۰۵',
        }}
        facts={moonFacts}
        labels={moonLabels}
      />
    </HomePosterPreview>
  ) : null;

  return (
    <section id="gifts" className="bg-[#F9F7F0] px-6 py-20 text-[#17233B] ">
      <div className="mx-auto px-6 md:px-20">
        <div
          data-animate="reveal"
          className="flex items-start justify-between gap-5 text-start"
        >
          <div>
            <h2 className="text-2xl font-semibold md:text-[1.75rem] md:leading-snug">
              {t('title')}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#69717C]">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/posters"
            className="group flex items-center gap-2 rounded-lg border border-[#69717C] px-4 py-2 transition-colors duration-200 hover:bg-[#69717C]/10 hover:text-[#000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CEB47B]"
          >
            {t('galleryCta')}
            <ArrowLeft
              className="size-4 shrink-0 ease-out motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <div
          data-animate="stagger"
          className="mt-14 grid gap-10 sm:grid-cols-3 lg:gap-8"
        >
          {FRAMES.map(({ key, style, ...rest }) => {
            const isMoon = key === 'moon';
            const template = 'template' in rest ? rest.template : 'circle';
            const cardSky = template === 'full' ? fullSky : sky;

            return (
              <PosterCard
                key={key}
                align="start"
                style={isMoon ? undefined : style}
                template={template}
                sky={isMoon ? undefined : cardSky}
                layers={CARD_LAYERS}
                title={t(`items.${key}.title`)}
                body={t(`items.${key}.body`)}
                preview={isMoon ? moonPreview : undefined}
                premium={
                  'premium' in rest && rest.premium
                    ? {
                        label: tPosters('premiumBadge'),
                        tooltip: tPosters('premiumBar'),
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
