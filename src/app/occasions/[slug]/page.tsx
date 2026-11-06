import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { OCCASION_SLUGS, isOccasionSlug } from '@/features/poster/lib/occasions';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OCCASION_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isOccasionSlug(slug)) return {};
  const t = await getTranslations('Occasions');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t(`${slug}.metaTitle`),
    description: t(`${slug}.metaDescription`),
    image: SHARE_IMAGES.home,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: `/occasions/${slug}`,
  });
}

export default async function OccasionPage({ params }: Props) {
  const { slug } = await params;
  if (!isOccasionSlug(slug)) notFound();
  const t = await getTranslations('Occasions');

  return (
    <div className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <HomeHeader variant="create" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14 md:py-20">
        <p className="text-xs text-[#CEB47B]">{t(`${slug}.eyebrow`)}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-white">{t(`${slug}.title`)}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#AAB6CD]">{t(`${slug}.body`)}</p>

        <Button
          asChild
          className="mt-8 h-12 gap-2 bg-[#CEB47B] px-7 text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          <a href={`/create?occasion=${slug}`}>
            {t('cta')}
            <ArrowLeft className="size-4" aria-hidden />
          </a>
        </Button>

        <section className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-[#E8D9B8]">{t('ideasTitle')}</h2>
            <ul className="mt-4 space-y-3">
              {([0, 1, 2] as const).map((i) => (
                <li key={i} className="rounded-xl border border-[#33415B] bg-[#142039] px-4 py-3 text-sm leading-7 text-[#E8D9B8]">
                  {t(`${slug}.ideas.${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#E8D9B8]">{t('howTitle')}</h2>
            <ol className="mt-4 list-decimal space-y-3 ps-5 text-sm leading-7 text-[#AAB6CD] marker:text-[#CEB47B]">
              {([0, 1, 2] as const).map((i) => (
                <li key={i}>{t(`how.${i}`)}</li>
              ))}
            </ol>
          </div>
        </section>

        <p className="mt-10 text-xs leading-6 text-white/60">{t('note')}</p>

        <nav aria-label={t('moreTitle')} className="mt-12 border-t border-[#33415B] pt-6">
          <p className="text-sm text-[#E8D9B8]">{t('moreTitle')}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {OCCASION_SLUGS.filter((o) => o !== slug).map((o) => (
              <li key={o}>
                <Link
                  href={`/occasions/${o}`}
                  className="inline-block rounded-full border border-[#33415B] px-4 py-1.5 text-xs text-[#AAB6CD] hover:border-[#CEB47B]/60 hover:text-[#CEB47B]"
                >
                  {t(`${o}.label`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/yalda"
                className="inline-block rounded-full border border-[#33415B] px-4 py-1.5 text-xs text-[#AAB6CD] hover:border-[#CEB47B]/60 hover:text-[#CEB47B]"
              >
                شب یلدا
              </Link>
            </li>
          </ul>
        </nav>
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
