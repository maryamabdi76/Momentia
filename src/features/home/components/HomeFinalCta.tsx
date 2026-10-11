import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ctaButtonClass =
  'h-auto rounded-full bg-[#ceb47b] font-bold text-[#0c142b] hover:bg-[#d6c08a]';

export async function HomeFinalCta() {
  const t = await getTranslations('HomePage');

  return (
    <section data-animate="reveal" className="bg-[#0c142b] px-6 py-20 text-center">
      <Sparkles className="mx-auto block size-6 text-[#ceb47b]" />
      <h2 className="mt-5 text-3xl font-semibold text-white">{t('finalCta.title')}</h2>
      <p className="mt-4 text-sm text-white/55">{t('finalCta.body')}</p>
      <Button asChild size="lg" className={`${ctaButtonClass} mt-7 px-6 py-3`}>
        <a href="/create">
          {t('cta')}
          <ArrowLeft data-icon="inline-end" />
        </a>
      </Button>
    </section>
  );
}
