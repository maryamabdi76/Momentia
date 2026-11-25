import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePosterPreview } from './HomePosterPreview';
import { YaldaCountdown } from './YaldaCountdown';
import { YaldaOnly } from './YaldaOnly';

/** A nudge toward the Yalda gift page, the biggest gifting night of the year. */
export async function HomeYalda() {
  const t = await getTranslations('HomePage.yalda');

  return (
    <YaldaOnly>
    <section id="yalda" className="py-8">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div
          data-animate="reveal"
          className="relative overflow-hidden rounded-[32px] border border-[#CEB47B]/35 bg-gradient-to-l from-[#2a1230]/80 via-[#141c3d] to-[#0c1530] p-8 md:p-12"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -start-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.18),transparent_65%)]"
          />
          <div className="relative flex flex-col items-center gap-10 md:flex-row md:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CEB47B]/40 bg-[#CEB47B]/10 px-3 py-1 text-xs text-[#E8D9B8]">
                <Moon aria-hidden className="size-3.5 text-[#CEB47B]" />
                {t('eyebrow')}
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-[1.6] text-white md:text-4xl">
                {t('title')}
              </h2>
              <p className="mt-3 text-sm leading-8 text-[#B9C4DA]">{t('body')}</p>
              <div className="mt-6">
                <YaldaCountdown />
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
                >
                  <a href="/yalda">
                    {t('cta')}
                    <ArrowLeft data-icon="inline-end" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/15 bg-transparent p-6! text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
                >
                  <a href="/moon?moment=yalda">{t('ctaMoon')}</a>
                </Button>
              </div>
            </div>
            <div aria-hidden className="w-44 shrink-0 rotate-3 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-[#CEB47B]/30 md:w-56">
              <HomePosterPreview variant="gold" size="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
    </YaldaOnly>
  );
}
