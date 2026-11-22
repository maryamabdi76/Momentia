import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function HomeFinalCta() {
  const t = await getTranslations('HomePage.redesign.finalCta');
  const tChoose = await getTranslations('HomePage.choose');

  return (
    <section
      data-animate="reveal"
      className="relative overflow-hidden border-y border-[#CEB47B]/20 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(104,64,190,0.35),rgba(14,22,52,0.7)_70%)] px-6 py-24 text-center"
    >
      <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
      <h2 className="mt-5 text-3xl font-semibold leading-snug text-white md:text-5xl">
        {t('title')}
      </h2>
      <p className="mt-4 text-sm text-[#B9C4DA]">{t('body')}</p>
      <Button
        asChild
        className="mt-8 bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
      >
        <a href="/map">
          {tChoose('map.cta')}
          <ArrowLeft data-icon="inline-end" />
        </a>
      </Button>
    </section>
  );
}
