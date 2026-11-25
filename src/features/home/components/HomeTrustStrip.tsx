import { getTranslations } from 'next-intl/server';

/** One quiet line under the hero: what the keepsake is, and what you get. */
export async function HomeTrustStrip() {
  const t = await getTranslations('HomePage.redesign.strip');

  return (
    <div
      data-animate="reveal"
      className="mx-auto mb-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-y border-white/10 px-6 py-4 text-xs md:mx-16 md:px-0 xl:mx-auto xl:max-w-6xl"
    >
      <p className="font-medium text-[#CEB47B]">{t('start')}</p>
      <p className="text-[#AAB6CD]">{t('end')}</p>
    </div>
  );
}
