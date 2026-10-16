import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import {
  FULL_SKY_DEPTH,
  POSTER_TEMPLATES,
  isPremiumTemplate,
} from '@/features/poster/lib/templates';
import { POSTER_STYLES } from '@/features/poster/lib/themes';
import { SAMPLE_NIGHT } from './sample-night';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { PosterCard } from './PosterCard';
import { MOON_SAMPLE_BASE, getMoonSamples } from './moon-sample';

const CARD_LAYERS = { maxMagnitude: 4 };

/** Every poster we make: each layout in every colour style. */
export async function PostersGallery() {
  const t = await getTranslations('PostersPage');
  const tGifts = await getTranslations('HomePage.gifts');
  const tTpl = await getTranslations('CreatePage.step2');

  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;
  // the full-page layout also draws the sky below the horizon
  const fullSky = skyForMoment(SAMPLE_NIGHT, FULL_SKY_DEPTH)?.sky ?? null;

  return (
    <div className="bg-[#F4F0E7] px-6 py-16 text-[#17233B] md:px-20">
      <div className="mx-auto">
        <p className="text-xs">{t('eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-semibold">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7">{t('description')}</p>

        {POSTER_TEMPLATES.map((template) => {
          const premium = isPremiumTemplate(template);
          return (
            <section key={template} className="mt-16">
              <h2 className="text-xl font-semibold">
                {tTpl(`templates.${template}.label`)}
              </h2>
              <p className="mt-1 text-xs leading-6">
                {tTpl(`templates.${template}.hint`)}
                {premium && ` ${t('premiumNote')}`}
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-12 md:gap-x-8">
                {POSTER_STYLES.map((style) => (
                  <Link
                    key={style}
                    href={`/create?style=${style}&template=${template}`}
                    className="group block w-full text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.34rem)]"
                  >
                    <PosterCard
                      style={style}
                      template={template}
                      sky={premium ? fullSky : sky}
                      layers={CARD_LAYERS}
                      title={tGifts(`items.${style}.title`)}
                      body={tGifts(`items.${style}.body`)}
                      premium={
                        premium
                          ? {
                              label: tTpl('premium.badge'),
                              tooltip: tTpl('premium.tooltip'),
                            }
                          : undefined
                      }
                    />
                    <span className="mt-4 inline-block text-xs underline-offset-4 group-hover:underline">
                      {t('use')}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {moonFacts && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold">{t('moonTitle')}</h2>
            <p className="mt-1 text-xs leading-6">{t('moonHint')}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-12 md:gap-x-8">
              {POSTER_STYLES.map((style) => (
                <Link
                  key={style}
                  href={`/moon?style=${style}`}
                  className="group block w-full text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.34rem)]"
                >
                  <div className="mx-auto flex justify-center rounded-2xl bg-[#DDD8CD] px-6 py-8 md:px-8 md:py-10">
                    <MoonPoster
                      className="max-w-72 shadow-xl"
                      data={{
                        ...MOON_SAMPLE_BASE,
                        style,
                        title: tGifts(`items.${style}.title`),
                        names: 'مریم و جلال',
                        quote: '',
                        dateLabel: '۳۰ آذر ۱۴۰۵',
                      }}
                      facts={moonFacts}
                      labels={moonLabels}
                    />
                  </div>
                  <h3 className="mt-8 text-xl">{tGifts(`items.${style}.title`)}</h3>
                  <span className="mt-4 inline-block text-xs underline-offset-4 group-hover:underline">
                    {t('moonUse')}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
