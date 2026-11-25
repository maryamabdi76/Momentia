import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomePosterPreview } from '@/features/home/components/HomePosterPreview';
import { getMoonSamples, MOON_SAMPLE_BASE } from '@/features/home/components/moon-sample';
import { SAMPLE_NIGHT } from '@/features/home/components/sample-night';
import { YaldaCountdown } from '@/features/home/components/YaldaCountdown';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';
import { toPersianDigits } from '@/features/poster/lib/digits';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('YaldaPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.yalda,
    imageAlt: t('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/yalda',
  });
}

const goldButton =
  'bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]';
const outlineButton =
  'border-white/15 bg-transparent p-6! font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]';

export default async function YaldaPage() {
  const t = await getTranslations('YaldaPage');
  const { labels: moonLabels, factsFor } = await getMoonSamples();
  const moonFacts = factsFor(SAMPLE_NIGHT);

  return (
    <div className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <HomeHeader variant="yalda" />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-48 start-1/2 size-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.12),transparent_65%)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-14 md:grid-cols-2 md:px-16 md:pb-28 md:pt-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CEB47B]/40 bg-[#CEB47B]/10 px-3 py-1 text-xs text-[#E8D9B8]">
                <Moon aria-hidden className="size-3.5 text-[#CEB47B]" />
                {t('eyebrow')}
              </p>
              <h1 className="mt-6 bg-gradient-to-l from-[#FFF6DF] via-[#F3DFAE] to-[#EDB9AE] bg-clip-text text-4xl font-bold leading-[1.5] text-transparent md:text-6xl">
                {t('title')}
              </h1>
              <div aria-hidden className="mt-6 h-px w-16 bg-[#CEB47B]" />
              <p className="mt-6 max-w-lg text-base leading-9 text-[#B9C4DA]">{t('body')}</p>
              <div className="mt-8">
                <YaldaCountdown />
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className={goldButton}>
                  <a href="/create?moment=yalda">
                    {t('cta')}
                    <ArrowLeft data-icon="inline-end" />
                  </a>
                </Button>
                <Button asChild variant="outline" className={outlineButton}>
                  <a href="/moon?moment=yalda">{t('ctaMoon')}</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-[#8F9BB5]">{t('note')}</p>
            </div>

            <div className="relative mx-auto w-full max-w-md" aria-hidden>
              <span className="absolute inset-x-4 top-1/2 h-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.22),transparent_70%)] blur-2xl" />
              <div className="relative aspect-4/5 w-full">
                {moonFacts && (
                  <div className="absolute left-[-6%] top-[4%] z-0 w-[54%] -rotate-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
                    <MoonPoster
                      className="[&>svg]:h-auto [&>svg]:max-w-none"
                      data={{
                        ...MOON_SAMPLE_BASE,
                        style: 'mono',
                        title: t('posterTitle'),
                        names: t('posterNames'),
                        quote: '',
                        dateLabel: '۳۰ آذر ۱۴۰۵',
                      }}
                      facts={moonFacts}
                      labels={moonLabels}
                    />
                  </div>
                )}
                <div className="absolute right-[2%] top-[8%] z-10 w-[64%] rotate-3 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)] ring-1 ring-[#CEB47B]/30">
                  <HomePosterPreview variant="gold" size="hero" />
                </div>
                <p className="absolute inset-x-[14%] bottom-0 z-20 rounded-xl border border-white/10 bg-[#0e1634]/85 px-4 py-3 text-center text-xs font-medium text-[#E8D9B8] backdrop-blur-md">
                  {t('posterCaption')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14 md:px-16">
          <h2 className="text-2xl font-bold text-white md:text-3xl">{t('howTitle')}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131f3d]/90 to-[#0c1530]/90 p-6 pt-8"
              >
                <span
                  aria-hidden
                  className="absolute end-5 top-2 text-6xl font-black text-white/[0.07]"
                >
                  {toPersianDigits(String(i + 1))}
                </span>
                <p className="relative text-[15px] leading-8 text-[#E8D9B8]">{t(`how.${i}`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14 md:px-16">
          <h2 className="text-2xl font-bold text-white md:text-3xl">{t('ideasTitle')}</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="rounded-3xl border border-[#CEB47B]/25 bg-[#CEB47B]/[0.05] p-6"
              >
                <span aria-hidden className="block text-4xl font-black leading-none text-[#CEB47B]/60">
                  “
                </span>
                <p className="mt-2 text-lg leading-9 text-white">{t(`ideas.${i}`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 md:px-16">
          <div className="rounded-[32px] border border-[#CEB47B]/35 bg-gradient-to-l from-[#2a1230]/80 via-[#141c3d] to-[#0c1530] p-8 text-center md:p-14">
            <h2 className="mx-auto max-w-2xl text-2xl font-bold leading-[1.7] text-white md:text-4xl">
              {t('finalTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-[#B9C4DA]">{t('finalBody')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className={goldButton}>
                <a href="/create?moment=yalda">
                  {t('cta')}
                  <ArrowLeft data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild variant="outline" className={outlineButton}>
                <a href="/moon?moment=yalda">{t('ctaMoon')}</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
