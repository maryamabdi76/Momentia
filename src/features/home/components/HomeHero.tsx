import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Orbit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { HomePosterPreview } from './HomePosterPreview';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { MOON_SAMPLE_BASE, getMoonSamples } from './moon-sample';
import { getMapSample } from './map-sample';
import { SAMPLE_NIGHT } from './sample-night';

export async function HomeHero() {
  const t = await getTranslations('HomePage');
  const tMoon = await getTranslations('HomePage.moon');
  const tChoose = await getTranslations('HomePage.choose');
  const tR = await getTranslations('HomePage.redesign.hero');
  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);
  const { data: mapData, labels: mapLabels } = await getMapSample('ink');
  const [line1, line2] = tR('title').split('\n');

  return (
    <section
      id="top"
      className="mx-auto grid items-center gap-12 px-6 pt-28 md:grid-cols-2 md:gap-16 md:px-20 pb-40"
    >
      <div className="order-2 md:order-1">
        <p
          data-animate="hero"
          className="mb-6 flex items-center gap-3 text-xs text-[#CEB47B]"
        >
          <span className="rounded-full border border-[#CEB47B]/40 bg-[#CEB47B]/10 px-3 py-1 font-medium">
            {tR('eyebrowTag')}
          </span>
          <span aria-hidden className="h-3 w-px bg-[#CEB47B]/40" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            {tR('eyebrow')}
          </span>
        </p>
        <h1
          data-animate="hero"
          className="bg-linear-to-l from-[#FFF6DF] via-[#F3DFAE] to-[#EDB9AE] bg-clip-text text-4xl font-bold leading-[1.5] tracking-tight text-transparent md:text-5xl lg:text-6xl"
        >
          {line1}
          <br />
          {line2}
        </h1>
        <div data-animate="hero" className="mt-6 h-px w-16 bg-[#CEB47B]" />
        <p
          data-animate="hero"
          className="mt-6 max-w-md text-base leading-9 text-[#B9C4DA]"
        >
          {tR('description')}
        </p>
        <div data-animate="hero" className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180] px-5 py-2 text-sm"
            >
              <a href="/map">
                {tChoose('map.cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent p-6! text-sm text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
            >
              <a href="#choose">{t('hero.ctaAll')}</a>
            </Button>
          </div>
          <p className="mt-3 text-xs text-[#AAB6CD]">{t('hero.benefits')}</p>
        </div>
        <p
          data-animate="hero"
          className="mt-10 flex items-start gap-2 text-[11px] leading-6 text-[#AAB6CD]"
        >
          <Orbit className="mt-0.5 size-3.5 shrink-0 text-[#CEB47B]" />
          {t('hero.disclaimer')}
        </p>
      </div>
      <div className="order-1 flex w-full justify-center overflow-visible md:order-2 md:justify-end">
        <div className="relative w-full max-w-115 overflow-visible pb-10 pt-4">
          <div
            data-animate="hero-poster"
            className="relative mx-auto w-full max-w-md sm:max-w-lg"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[42%] aspect-square w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                className="size-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="85"
                  fill="none"
                  stroke="#CEB47B"
                  strokeOpacity="0.25"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth="0.35"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="70"
                  fill="none"
                  stroke="#CEB47B"
                  strokeOpacity="0.12"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth="0.35"
                />
              </svg>
            </div>
            <div className="relative aspect-4/5 w-full">
              <div className="absolute -start-[14%] top-[6%] z-0 w-[56%] -rotate-6 transform-gpu shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)]">
                <HomePosterPreview variant="gold" size="hero" />
              </div>
              {moonFacts ? (
                <div className="absolute -end-[10%] top-[0%] z-0 w-[56%] rotate-6 transform-gpu shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)]">
                  <MoonPoster
                    className="[&>svg]:h-auto [&>svg]:max-w-none"
                    data={{
                      ...MOON_SAMPLE_BASE,
                      style: 'mono',
                      title: tMoon('cardYalda'),
                      names: t('hero.posterNames'),
                      quote: '',
                      dateLabel: '۳۰ آذر ۱۴۰۵',
                    }}
                    facts={moonFacts}
                    labels={moonLabels}
                  />
                </div>
              ) : null}
              <div className="absolute inset-x-[16%] top-[14%] z-20 transform-gpu rounded-sm shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)] ring-1 ring-[#CEB47B]/30">
                <MapPoster data={mapData} labels={mapLabels} className="rounded-none shadow-none" />
              </div>
              <p className="absolute inset-x-[22%] top-[88%] z-30 rounded-xl border border-white/10 bg-[#0e1634]/85 px-4 py-3 text-center text-xs font-medium text-[#E8D9B8] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md">
                {tR('ribbon')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
