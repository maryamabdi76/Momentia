import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const navLinkClass =
  'bg-transparent text-white hover:bg-white/10 hover:text-[#ceb47b] focus:bg-white/10 focus:text-[#ceb47b]';
const ctaButtonClass =
  'h-auto rounded-full bg-[#ceb47b] font-bold text-[#0c142b] hover:bg-[#d6c08a]';

export async function HomeHeader() {
  const t = await getTranslations('HomePage');

  return (
    <header data-animate="header" className="border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm text-white">
        <a className="flex items-center gap-1 font-bold text-white" href="#top">
          <Sparkles className="size-3 text-[#ceb47b]" />
          {t('brand')}
        </a>
        <NavigationMenu viewport={false} className="hidden max-w-none md:flex">
          <NavigationMenuList className="gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink href="#gifts" className={navLinkClass}>
                {t('nav.posters')}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#steps" className={navLinkClass}>
                {t('nav.how')}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#faq" className={navLinkClass}>
                {t('nav.faq')}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button asChild size="sm" className={`${ctaButtonClass} px-5 py-2 text-xs`}>
          <a href="/create">{t('cta')}</a>
        </Button>
      </div>
    </header>
  );
}
