import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAP_THEMES } from '@/features/treasure-map/lib/map-svg';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { getMapSample } from './map-sample';

/** The treasure map as a product: the story on one road, four moods, and the three steps to make it. */
export async function HomeMap() {
  const t = await getTranslations('HomePage.map');
  const tMap = await getTranslations('MapPage');
  const main = await getMapSample('paper');
  // the same story in each mood, so the choice in step 2 of the maker is visible before starting
  const moods = await Promise.all(MAP_THEMES.map(async (theme) => ({ theme, ...(await getMapSample(theme)) })));

  return (
    <section id="map" className="py-20">
      <div className="mx-auto space-y-20 px-6 md:px-20">
        <div data-animate="reveal" className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-[#CEB47B]/50 px-3 py-1 text-xs text-[#CEB47B]">{t('eyebrow')}</span>
            <h2 className="mt-4 text-3xl font-semibold leading-snug text-white md:text-4xl">{t('title')}</h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[#AAB6CD]">{t('body')}</p>
            <ul className="mt-6 space-y-4 text-sm text-[#E8D9B8]">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#CEB47B]" />
                  {t(`points.${i}`)}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]">
              <a href="/map">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
            <p className="mt-3 text-xs text-[#AAB6CD]">{t('note')}</p>
          </div>
          <div className="flex justify-center">
            <MapPoster data={main.data} labels={main.labels} className="w-full max-w-80 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]" />
          </div>
        </div>

        <div className="space-y-8">
          <div data-animate="reveal" className="space-y-2 text-center">
            <h3 className="text-2xl font-semibold text-white">{t('themesTitle')}</h3>
            <p className="mx-auto max-w-lg text-sm leading-7 text-[#AAB6CD]">{t('themesHint')}</p>
          </div>
          <ul data-animate="stagger" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8">
            {moods.map(({ theme, data, labels }) => (
              <li key={theme} data-animate-item className="space-y-3 text-center">
                <MapPoster data={data} labels={labels} className="mx-auto w-full max-w-56 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]" />
                <p className="text-sm text-[#E8D9B8]">{tMap(`theme.${theme}`)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-10">
          <h3 data-animate="reveal" className="text-center text-2xl font-semibold text-white">
            {t('flowTitle')}
          </h3>
          {/* the three steps hang on one dashed route, like the map itself */}
          <ol data-animate="stagger" className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute inset-x-[16%] top-5 hidden border-t-2 border-dashed border-[#CEB47B]/35 md:block" />
            {[0, 1, 2].map((i) => (
              <li key={i} data-animate-item className="relative space-y-3 text-center">
                <span className="relative mx-auto flex size-10 items-center justify-center rounded-full border-2 border-[#CEB47B] bg-[#080f28] text-sm font-bold text-[#CEB47B]">
                  {t(`flowNumbers.${i}`)}
                </span>
                <p className="text-lg font-semibold text-white">{t(`flow.${i}.title`)}</p>
                <p className="mx-auto max-w-xs text-xs leading-7 text-[#AAB6CD]">{t(`flow.${i}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
