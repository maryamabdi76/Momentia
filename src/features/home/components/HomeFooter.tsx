import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

export async function HomeFooter() {
  const t = await getTranslations('HomePage');

  const footerLinks = [
    ['#privacy', t('footer.links.privacy')],
    ['#guide', t('footer.links.guide')],
    ['#faq', t('footer.links.faq')],
  ] as const;

  return (
    <footer className="px-6 py-10">
      <div className="mx-auto flex md:px-20 flex-col gap-8 md:flex-row md:justify-between">
        <div className="max-w-md">
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white"
          >
            {t('brand')}
            <Sparkles className="size-3 text-[#CEB47B]" />
          </a>
          <p className="mt-3 text-xs leading-7 text-[#AAB6CD]">
            {t('footer.description')}
          </p>
        </div>
        <NavigationMenu
          viewport={false}
          className="max-w-none justify-end-safe"
        >
          <NavigationMenuList className="flex-wrap gap-x-3 gap-y-2">
            {footerLinks.map(([href, label]) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  href={href}
                  className="h-auto bg-transparent p-0 text-xs text-[#AAB6CD] hover:bg-transparent hover:text-white focus:bg-transparent"
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </footer>
  );
}
