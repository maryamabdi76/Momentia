import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { cn } from 'cn';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { HomePosterPreview } from './HomePosterPreview';
import { getMapSample } from './map-sample';
import { MOON_SAMPLE_BASE, getMoonSamples } from './moon-sample';
import { SAMPLE_NIGHT } from './sample-night';

type ChooseCardKey = 'map' | 'moon' | 'sky';

type ChooseCardProps = {
  cardKey: ChooseCardKey;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  visual: ReactNode;
};

function ChoosePosterCard({
  cardKey,
  eyebrow,
  title,
  description,
  cta,
  href,
  visual,
}: ChooseCardProps) {
  const isMap = cardKey === 'map';

  return (
    // Hover lift uses the `translate` property so it never fights GSAP's
    // scroll-reveal `transform` on this same element.
    <article
      data-animate-item
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border p-6 text-start ease-out',
        'bg-[#0e1634]/60 backdrop-blur-md',
        'motion-safe:transition-[translate,border-color,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1.5',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#CEB47B] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#080f28]',
        isMap
          ? 'border-[#CEB47B]/45 shadow-[0_0_60px_-24px_rgba(206,180,123,0.55)] hover:border-[#CEB47B]/80'
          : 'border-white/10 hover:border-[#CEB47B]/40 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]',
      )}
    >
      {/* the poster itself is the picture, tilted a little like it was just set down */}
      <div className="relative flex min-h-72 items-center justify-center py-4">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CEB47B]/10 blur-3xl"
        />
        <div className="relative w-40 -rotate-3 transform-gpu shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] ease-out motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-105 sm:w-44">
          {visual}
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <p className="text-xs text-[#CEB47B]">{eyebrow}</p>
        <h3 className="text-2xl font-semibold leading-tight text-white">
          {title}
        </h3>
        <p className="text-sm leading-8 text-[#AAB6CD]">{description}</p>
        {/* after:inset-0 stretches the link over the whole card, so the
            entire card is the click target. */}
        <Link
          href={href}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-medium text-[#E8D9B8] transition-colors after:absolute after:inset-0 group-hover:text-[#CEB47B] focus-visible:outline-none"
        >
          {cta}
          <ArrowLeft
            className="size-4 shrink-0 ease-out motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}

export async function HomeChoosePoster() {
  const t = await getTranslations('HomePage.choose');
  const tR = await getTranslations('HomePage.redesign.choose');
  const tHero = await getTranslations('HomePage.hero');
  const tMoon = await getTranslations('HomePage.moon');
  const { data: mapData, labels: mapLabels } = await getMapSample('paper');
  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);
  const sky = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;

  const mapVisual = (
    <MapPoster
      data={mapData}
      labels={mapLabels}
      className="rounded-none shadow-none"
    />
  );
  const moonVisual = moonFacts ? (
    <HomePosterPreview variant="violet" size="product">
      <MoonPoster
        data={{
          ...MOON_SAMPLE_BASE,
          style: 'mono',
          title: tMoon('cardYalda'),
          names: tHero('posterNames'),
          quote: '',
          dateLabel: '۳۰ آذر ۱۴۰۵',
        }}
        facts={moonFacts}
        labels={moonLabels}
      />
    </HomePosterPreview>
  ) : null;
  const skyVisual = (
    <HomePosterPreview
      variant="gold"
      size="product"
      sky={sky}
      layers={{ maxMagnitude: 4 }}
    />
  );

  const cards: Array<{ key: ChooseCardKey; href: string; visual: ReactNode }> =
    [
      { key: 'map', href: '/map', visual: mapVisual },
      { key: 'moon', href: '/moon', visual: moonVisual },
      { key: 'sky', href: '/create', visual: skyVisual },
    ];

  return (
    <section id="choose" className="mx-auto px-6 py-20 md:px-20">
      <div data-animate="reveal" className="max-w-2xl">
        <p className="text-xs text-[#CEB47B]">{tR('eyebrow')}</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold leading-snug text-white md:text-4xl">
          {tR('title')}
        </h2>
        <p className="mt-3 text-sm leading-8 text-[#AAB6CD]">
          {tR('subtitle')}
        </p>
      </div>

      <div
        data-animate="stagger"
        className="mt-12 grid gap-6 lg:grid-cols-3"
      >
        {cards.map(({ key, href, visual }) => (
          <ChoosePosterCard
            key={key}
            cardKey={key}
            eyebrow={tR(key)}
            title={t(`${key}.title`)}
            description={t(`${key}.description`)}
            cta={t(`${key}.cta`)}
            href={href}
            visual={visual}
          />
        ))}
      </div>

      <p
        data-animate="reveal"
        className="mt-6 text-[11px] leading-[1.7] text-[#8F9BB5]"
      >
        {t('footnote')}
      </p>
    </section>
  );
}
