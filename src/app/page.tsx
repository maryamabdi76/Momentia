import { HomeMotion } from '@/features/home/components/HomeMotion';
import { SpaceBackdrop } from '@/features/home/components/SpaceBackdrop';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeHero } from '@/features/home/components/HomeHero';
import { HomeChoosePoster } from '@/features/home/components/HomeChoosePoster';
import { HomeStories } from '@/features/home/components/HomeStories';
import { HomeSteps } from '@/features/home/components/HomeSteps';
import { HomeGifts } from '@/features/home/components/HomeGifts';
import { HomeMoon } from '@/features/home/components/HomeMoon';
import { HomeCreate } from '@/features/home/components/HomeCreate';
import { HomeFaq } from '@/features/home/components/HomeFaq';
import { HomeFinalCta } from '@/features/home/components/HomeFinalCta';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <HomeMotion
      className="relative isolate overflow-hidden bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <SpaceBackdrop />
      <HomeHeader />
      <HomeHero />
      <HomeChoosePoster />
      <Separator />
      <HomeStories />
      <HomeSteps />
      <HomeGifts />
      <HomeMoon />
      <HomeCreate />
      <HomeFaq />
      <HomeFinalCta />
      <Separator />
      <HomeFooter />
    </HomeMotion>
  );
}
