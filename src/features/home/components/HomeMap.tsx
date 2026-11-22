import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAP_THEMES } from '@/features/treasure-map/lib/map-svg';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { getMapSample } from './map-sample';

/** The treasure map as a product: the story on one road, then the four moods it can wear. */
export async function HomeMap() {
  const t = await getTranslations('HomePage.redesign.map');
  const tMoments = await getTranslations('HomePage.map');
  const tMap = await getTranslations('MapPage');
  const main = await getMapSample('ink');
  // the same story in each mood, so the choice in step 2 of the maker is visible before starting
  const moods = await Promise.all(
    MAP_THEMES.map(async (theme) => ({ theme, ...(await getMapSample(theme)) })),
  );
  const [line1, line2] = t('title').split('\n');
  const callouts = [0, 3].map(
    (i) => `${tMoments(`moments.${i}.title`)} · ${tMoments(`moments.${i}.place`)}`,
  );

  return (
    <section id="map" className="py-20">
      <div className="mx-auto space-y-24 px-6 md:px-20">
        <div
          data-animate="reveal"
          className="grid items-center gap-14 md:grid-cols-[0.9fr_1.1fr]"
        >
          {/* the poster, with two of its moments pulled out of the road like notes */}
          <div className="relative mx-auto w-full max-w-88 pb-6 md:order-2 md:mx-0 md:justify-self-start">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.16),transparent_65%)]"
            />
            <MapPoster
              data={main.data}
              labels={main.labels}
              className="relative w-full shadow-[0_40px_90px_-24px_rgba(0,0,0,0.85)] ring-1 ring-[#CEB47B]/30"
            />
            <p className="absolute -start-6 top-[28%] z-10 rounded-lg border border-white/10 bg-[#0e1634]/90 px-3 py-2 text-xs text-[#E8D9B8] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md md:-start-12">
              {callouts[0]}
            </p>
            <p className="absolute -end-4 bottom-[14%] z-10 rounded-lg border border-white/10 bg-[#0e1634]/90 px-3 py-2 text-xs text-[#E8D9B8] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md md:-end-10">
              {callouts[1]}
            </p>
          </div>

          <div className="md:order-1">
            <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.6] text-white md:text-5xl">
              {line1}
              <br />
              {line2}
            </h2>
            <p className="mt-6 max-w-md text-base leading-9 text-[#B9C4DA]">
              {t('body')}
            </p>
            <ul className="mt-7 space-y-3 text-sm text-[#E8D9B8]">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="text-xs text-[#CEB47B]"
                  >
                    {`۰${i + 1}`}
                  </span>
                  {t(`points.${i}`)}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-9 bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              <a href="/map">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div
            data-animate="reveal"
            className="flex flex-wrap items-baseline justify-between gap-2"
          >
            <h3 className="text-2xl font-semibold text-white">
              {t('themesTitle')}
            </h3>
            <p className="text-xs text-[#8F9BB5]">{t('themesSide')}</p>
          </div>
          <ul
            data-animate="stagger"
            className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          >
            {moods.map(({ theme, data, labels }) => (
              <li
                key={theme}
                data-animate-item
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0e1634]/60 p-4 backdrop-blur-md"
              >
                <MapPoster
                  data={data}
                  labels={labels}
                  className="w-14 shrink-0 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.8)] sm:w-16"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {tMap(`theme.${theme}`)}
                  </p>
                  <p className="text-xs capitalize text-[#8F9BB5]">{theme}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
