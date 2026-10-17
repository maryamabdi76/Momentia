import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { cn } from 'cn';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { SkyChart } from '@/features/sky/components/SkyChart';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { SAMPLE_NIGHT } from './sample-night';

const VISUAL_SIZE =
  'relative size-[7.25rem] shrink-0 overflow-hidden rounded-full sm:size-[8.25rem] md:size-[9rem] ease-out motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105 motion-safe:group-hover:rotate-6';

type ChooseCardKey = 'moon' | 'sky';

type ChooseCardProps = {
  cardKey: ChooseCardKey;
  title: string;
  description: string;
  cta: string;
  href: string;
  visual: ReactNode;
};

function ChoosePosterCard({
  cardKey,
  title,
  description,
  cta,
  href,
  visual,
}: ChooseCardProps) {
  const isMoon = cardKey === 'moon';

  return (
    // Hover lift uses the `translate` property so it never fights GSAP's
    // scroll-reveal `transform` on this same element.
    <article
      data-animate-item
      className={cn(
        'group relative overflow-hidden rounded-2xl ease-out',
        'motion-safe:transition-[translate,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#CEB47B] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#F4F0E7]',
        isMoon
          ? 'bg-[#162033] text-[#FFFDF8] hover:shadow-[0_18px_36px_-18px_rgba(22,32,51,0.7)]'
          : 'border border-[#DAD4C7] bg-[#FFFCF5] text-[#1A2943] hover:border-[#CEB47B]/70 hover:shadow-[0_18px_36px_-18px_rgba(26,41,67,0.35)]',
      )}
    >
      <div className="flex min-h-40 items-between sm:min-h-44">
        <div className="flex min-h-40 items-start text-right flex-1 flex-col justify-between gap-5 p-6">
          <div className="space-y-2.5 sm:space-y-3">
            <h3 className="text-xl font-semibold leading-tight sm:text-[1.35rem]">
              {title}
            </h3>
            <p
              className={
                isMoon
                  ? 'max-w-[16rem] text-[0.8125rem] leading-[1.85] text-[#AAB6CD]'
                  : 'max-w-[16rem] text-[0.8125rem] leading-[1.85] text-[#5c6578]'
              }
            >
              {description}
            </p>
          </div>
          {/* after:inset-0 stretches the link over the whole card, so the
              entire card is the click target. */}
          <Link
            href={href}
            className={cn(
              'inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-medium transition-colors after:absolute after:inset-0 focus-visible:outline-none',
              isMoon
                ? 'text-[#CEB47B] group-hover:text-[#e0c180]'
                : 'text-[#1A2943] group-hover:text-[#a8893f]',
            )}
          >
            {cta}
            <ArrowLeft
              className="size-3.5 shrink-0 ease-out motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
        <div className="flex shrink-0 items-center justify-center py-7 ps-6 pe-3 sm:w-[36%] sm:py-8 sm:ps-8 sm:pe-4">
          {visual}
        </div>
      </div>
    </article>
  );
}

function MoonChooseVisual({ alt }: { alt: string }) {
  return (
    <div className={VISUAL_SIZE}>
      <Image
        src="/moon/moon-nearside.jpg"
        alt={alt}
        fill
        quality={95}
        priority
        className="object-cover object-center"
        sizes="(max-width: 768px) 116px, 144px"
      />
    </div>
  );
}

function SkyChooseVisual({
  alt,
  sky,
}: {
  alt: string;
  sky: SkySnapshot | null;
}) {
  if (sky) {
    return (
      <div
        className={`${VISUAL_SIZE} bg-[#0f2147] shadow-[inset_0_0_0_1px_rgba(206,180,123,0.28)]`}
      >
        <SkyChart
          sky={sky}
          variant="gold"
          layers={{ maxMagnitude: 4.35 }}
          ariaLabel={alt}
          className="size-full"
        />
      </div>
    );
  }

  return (
    <div className={VISUAL_SIZE}>
      <Image
        src="/images/gold-constellation.png"
        alt={alt}
        fill
        className="object-cover"
        sizes="144px"
      />
    </div>
  );
}

export async function HomeChoosePoster() {
  const t = await getTranslations('HomePage.choose');
  const skySnapshot = skyForMoment(SAMPLE_NIGHT)?.sky ?? null;

  const cards: Array<{
    key: ChooseCardKey;
    href: string;
    visual: ReactNode;
  }> = [
    {
      key: 'moon',
      href: '/moon',
      visual: <MoonChooseVisual alt={t('moon.imageAlt')} />,
    },
    {
      key: 'sky',
      href: '/create',
      visual: <SkyChooseVisual alt={t('sky.imageAlt')} sky={skySnapshot} />,
    },
  ];

  return (
    <section
      id="choose"
      className="mx-auto px-6 py-12 md:px-20 bg-[#F4F0E7] text-[#17233B]"
    >
      <h2
        data-animate="reveal"
        className="text-balance text-2xl font-semibold md:text-[1.75rem] md:leading-snug"
      >
        {t('title')}
      </h2>

      <div
        data-animate="stagger"
        className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2 md:gap-x-6"
      >
        {cards.map(({ key, href, visual }) => (
          <ChoosePosterCard
            key={key}
            cardKey={key}
            title={t(`${key}.title`)}
            description={t(`${key}.description`)}
            cta={t(`${key}.cta`)}
            href={href}
            visual={visual}
          />
        ))}
      </div>

      <div className="mt-4 flex">
        <p
          data-animate="reveal"
          className="text-[11px] leading-[1.7] text-[#69717C]"
        >
          {t('footnote')}
        </p>
      </div>
    </section>
  );
}
