import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Orbit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePosterPreview } from './HomePosterPreview';

export async function HomeHero() {
  const t = await getTranslations('HomePage');
  const [line1, line2] = t('hero.title').split('\n');

  return (
    <section
      id="top"
      className="mx-auto grid items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-20"
    >
      <div className="order-2 md:order-1">
        <p
          data-animate="hero"
          className="mb-5 flex items-center gap-2 text-xs text-[#CEB47B]"
        >
          <Sparkles className="size-4" />
          {t('hero.eyebrow')}
        </p>
        <h1
          data-split
          className="text-3xl font-semibold leading-[1.45] tracking-tight text-[#FFFDF8] md:text-5xl lg:text-6xl"
        >
          {line1}
          <br />
          {line2}
        </h1>
        <div data-animate="hero" className="mt-6 h-px w-16 bg-[#CEB47B]" />
        <p
          data-animate="hero"
          className="mt-6 text-sm leading-8 text-[#AAB6CD]"
        >
          {t('hero.description')}
        </p>
        <div data-animate="hero" className="mt-8">
          <Button
            asChild
            data-magnetic
            size="lg"
            className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180] px-5 py-2 text-sm"
          >
            <a href="/create">
              {t('cta')}
              <ArrowLeft data-icon="inline-end" />
            </a>
          </Button>
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
      <div className="order-1 w-full flex justify-end rounded-lg overflow-visible md:order-2">
        <div
          data-animate="hero-poster"
          className="relative w-full max-w-115 overflow-visible p-8 flex-col shadow rounded-lg bg-[#1A2943]"
        >
          <HomePosterPreview variant="gold" size="hero" />
          <p
            data-animate="hero"
            className="text-center text-xs mt-6 text-[#AAB6CD]"
          >
            {t('hero.posterCaption')}
          </p>
        </div>
      </div>
    </section>
  );
}
