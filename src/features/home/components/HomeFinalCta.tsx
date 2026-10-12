import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function HomeFinalCta() {
  const t = await getTranslations('HomePage');

  return (
    <section
      data-animate="reveal"
      className="bg-[#142039] px-6 py-20 text-center"
    >
      <Sparkles className="mx-auto block size-6 text-[#CEB47B]" />
      <h2 className="mt-5 text-3xl font-semibold text-white">
        {t('finalCta.title')}
      </h2>
      <p className="mt-4 text-sm text-[#AAB6CD]">{t('finalCta.body')}</p>
      <Button
        asChild
        className="mt-7 p-6! bg-[#CEB47B] font-bold text-[#0c142b] hover:bg-[#e0c180]"
      >
        <a href="/create">
          {t('cta')}
          <ArrowLeft data-icon="inline-end" />
        </a>
      </Button>
    </section>
  );
}
