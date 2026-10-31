import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { YaldaCountdown } from '@/features/home/components/YaldaCountdown';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('YaldaPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.home,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/yalda',
  });
}

export default async function YaldaPage() {
  const t = await getTranslations('YaldaPage');

  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14 md:py-20">
        <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#AAB6CD]">
          {t('body')}
        </p>

        <div className="mt-8">
          <YaldaCountdown />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
          >
            <a href="/create">
              {t('cta')}
              <ArrowLeft data-icon="inline-end" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#33415B] bg-transparent p-6! font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
          >
            <a href="/moon">{t('ctaMoon')}</a>
          </Button>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold text-[#E8D9B8]">
              {t('howTitle')}
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[#AAB6CD]">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1A2943] text-xs font-bold text-[#CEB47B]">
                    {i + 1}
                  </span>
                  {t(`how.${i}`)}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8D9B8]">
              {t('ideasTitle')}
            </h2>
            <ul className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="rounded-xl bg-[#142039] p-4 text-sm leading-7 text-white/80"
                >
                  {t(`ideas.${i}`)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 text-xs text-[#AAB6CD]">{t('note')}</p>
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
