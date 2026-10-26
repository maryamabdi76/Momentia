import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { MOON_SAMPLE_BASE as BASE, getMoonSamples } from './moon-sample';
import { SAMPLE_NIGHT } from './sample-night';

const NOWRUZ_NIGHT = { ...SAMPLE_NIGHT, day: '1', month: 'فروردین' };

/** The Moon poster as a product: two real nights, a few lines and a way in. */
export async function HomeMoon() {
  const t = await getTranslations('HomePage.moon');
  const { labels, factsFor } = await getMoonSamples();

  const cards = [
    {
      key: 'yalda',
      night: SAMPLE_NIGHT,
      data: {
        ...BASE,
        style: 'gold',
        title: t('cardYalda'),
        names: 'شیرین و فرهاد',
        quote: '',
        dateLabel: '۳۰ آذر ۱۴۰۵',
      },
    },
  ] as const;

  const rendered = cards.flatMap((card) => {
    const facts = factsFor(card.night);
    return facts ? [{ ...card, facts }] : [];
  });

  return (
    <section id="moon" className="py-12">
      <div className="mx-auto px-6 md:px-20">
        <div
          data-animate="reveal"
          className="grid items-center gap-12 pb-10 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="flex justify-center">
            <MoonPoster
              data={rendered[0].data}
              facts={rendered[0].facts}
              labels={labels}
              className="w-full max-w-80"
            />
          </div>
          <div>
            <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {t('title')}
            </h2>
            <p className="mt-5 text-sm leading-8 text-[#AAB6CD]">{t('body')}</p>
            <ul className="mt-6 space-y-4 text-sm text-[#E8D9B8]">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#CEB47B]" />
                  {t(`points.${i}`)}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 p-6! bg-[#CEB47B] font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              <a href="/moon">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
