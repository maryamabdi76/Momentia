import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** A short nudge toward the Yalda gift page, the biggest gifting night of the year. */
export async function HomeYalda() {
  const t = await getTranslations('HomePage.yalda');

  return (
    <section id="yalda" className="py-8">
      <div className="mx-auto px-6 md:px-20">
        <div
          data-animate="reveal"
          className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#CEB47B]/40 bg-[#CEB47B]/5 p-8 md:flex-row md:items-center"
        >
          <div className="max-w-xl">
            <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {t('title')}
            </h2>
            <p className="mt-3 text-sm leading-8 text-[#AAB6CD]">{t('body')}</p>
          </div>
          <Button
            asChild
            className="shrink-0 bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
          >
            <a href="/yalda">
              {t('cta')}
              <ArrowLeft data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
