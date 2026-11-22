import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeMotion } from '@/features/home/components/HomeMotion';
import { SpaceBackdrop } from '@/features/home/components/SpaceBackdrop';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeHero } from '@/features/home/components/HomeHero';
import { HomeChoosePoster } from '@/features/home/components/HomeChoosePoster';
import { HomeSteps } from '@/features/home/components/HomeSteps';
import { HomeMap } from '@/features/home/components/HomeMap';
import { HomeFaq } from '@/features/home/components/HomeFaq';
import { HomeTrustStrip } from '@/features/home/components/HomeTrustStrip';
import { HomeShare } from '@/features/home/components/HomeShare';
import { HomeFinalCta } from '@/features/home/components/HomeFinalCta';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { Separator } from '@/components/ui/separator';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  return shareMetadata({
    title: t('title'),
    description: t('description'),
    image: SHARE_IMAGES.home,
    imageAlt: t('shareImageAlt'),
    siteName: t('title'),
    path: '/',
  });
}

export default function Home() {
  return (
    <HomeMotion
      className="relative isolate overflow-hidden bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <SpaceBackdrop />
      <HomeHeader />
      <HomeHero />
      <HomeTrustStrip />
      <HomeChoosePoster />
      <HomeMap />
      <Separator />
      <HomeSteps />
      <HomeShare />
      <HomeFaq />
      <HomeFinalCta />
      <Separator />
      <HomeFooter />
    </HomeMotion>
  );
}
