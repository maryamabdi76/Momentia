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
  'bg-transparent text-white hover:bg-white/10 hover:text-[#CEB47B] focus:bg-white/10 focus:text-[#CEB47B]';

export async function HomeHeader() {
  const t = await getTranslations('HomePage');

  return (
    <header data-animate="header" className="border-b border-[#33415B]">
      <div className="mx-auto flex h-16 items-center justify-between px-6 text-sm text-white md:px-20">
        <a
          className="flex items-center gap-4 font-bold text-white text-2xl"
          href="#top"
        >
          <Sparkles className="size-4 text-[#CEB47B]" />
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
        <Button className="bg-[#CEB47B] p-5! font-bold text-[#0c142b] hover:bg-[#e0c180] px-5 py-2 text-sm">
          <a href="/create">{t('cta')}</a>
        </Button>
      </div>
    </header>
  );
}
