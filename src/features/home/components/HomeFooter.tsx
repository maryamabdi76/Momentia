import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

type HomeFooterProps = {
  /**
   * `home`    – brand + description with legal/help links.
   * `create`  – compact bar: brand on one side, the "stays in your browser" note on the other.
   */
  variant?: 'home' | 'create' | 'posters';
};

export async function HomeFooter({ variant = 'home' }: HomeFooterProps) {
  const t = await getTranslations('HomePage');

  if (variant === 'create') {
    const tCreate = await getTranslations('CreatePage');

    return (
      <footer className="border-t border-[#33415B] px-6 py-10">
        <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-4 text-2xl font-bold text-white"
          >
            <Sparkles className="size-4 text-[#CEB47B]" />
            {t('brand')}
          </Link>
          <p className="text-sm text-[#AAB6CD]">{tCreate('footerNote')}</p>
        </div>
      </footer>
    );
  }

  const footerLinks = [
    ['/', t('footer.links.home')],
    ['#privacy', t('footer.links.privacy')],
    ['#guide', t('footer.links.guide')],
    ['#faq', t('footer.links.faq')],
  ] as const;

  return (
    <footer className="px-6 py-10">
      <div className="mx-auto flex flex-col gap-8 md:flex-row md:justify-between md:px-20">
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
