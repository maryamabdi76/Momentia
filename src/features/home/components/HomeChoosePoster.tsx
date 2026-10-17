import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { SkyChart } from '@/features/sky/components/SkyChart';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { SAMPLE_NIGHT } from './sample-night';

const VISUAL_SIZE =
  'relative size-[7.25rem] shrink-0 overflow-hidden rounded-full sm:size-[8.25rem] md:size-[9rem]';

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
    <article
      data-animate-item
      className={
        isMoon
          ? 'overflow-hidden rounded-2xl bg-[#162033] text-[#FFFDF8]'
          : 'overflow-hidden rounded-2xl bg-[#FFFCF5] border border-[#DAD4C7] text-[#1A2943]'
      }
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
          <Link
            href={href}
            className={
              isMoon
                ? 'inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-medium text-[#CEB47B] transition hover:text-[#e0c180] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CEB47B]'
                : 'inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-medium text-[#1A2943] transition hover:text-[#CEB47B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CEB47B]'
            }
          >
            {cta}
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
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
