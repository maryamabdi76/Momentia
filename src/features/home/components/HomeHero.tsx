import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Orbit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePosterPreview } from './HomePosterPreview';

const ctaButtonClass =
  'h-auto rounded-full bg-[#ceb47b] font-bold text-[#0c142b] hover:bg-[#d6c08a]';

export async function HomeHero() {
  const t = await getTranslations('HomePage');
  const [line1, line2] = t('hero.title').split('\n');

  return (
    <section
      id="top"
      className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24"
    >
      <div className="order-2 md:order-1">
        <p data-animate="hero" className="mb-5 flex items-center gap-2 text-xs text-[#ceb47b]">
          <Sparkles className="size-3" />
          {t('hero.eyebrow')}
        </p>
        <h1
          data-animate="hero"
          className="max-w-2xl text-3xl font-semibold leading-[1.45] tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          {line1}
          <br />
          {line2}
        </h1>
        <div data-animate="hero" className="mt-6 h-px w-16 bg-[#ceb47b]" />
        <p data-animate="hero" className="mt-6 max-w-lg text-sm leading-8 text-white/85">
          {t('hero.description')}
        </p>
        <div data-animate="hero" className="mt-8">
          <Button asChild size="lg" className={`${ctaButtonClass} px-6 py-3`}>
            <a href="/create">
              {t('cta')}
              <ArrowLeft data-icon="inline-end" />
            </a>
          </Button>
          <p className="mt-3 text-xs text-white/50">{t('hero.benefits')}</p>
        </div>
        <p
          data-animate="hero"
          className="mt-10 flex items-start gap-2 text-[11px] leading-6 text-white/40"
        >
          <Orbit className="mt-0.5 size-3.5 shrink-0 text-[#ceb47b]" />
          {t('hero.disclaimer')}
        </p>
      </div>
      <div className="order-1 flex flex-col items-center md:order-2">
        <div data-animate="hero-poster" className="w-full max-w-[420px]">
          <HomePosterPreview variant="gold" size="hero" />
        </div>
        <p data-animate="hero" className="mt-4 text-center text-xs text-white/45">
          {t('hero.posterCaption')}
        </p>
      </div>
    </section>
  );
}
