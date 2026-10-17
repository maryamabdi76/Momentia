import Link from 'next/link';
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

type HomeHeaderProps = {
  /**
   * `home`    – anchors scroll within the landing page, CTA opens /create.
   * `create`  – anchors point back to the landing page, action returns home.
   */
  variant?: 'home' | 'create' | 'posters';
};

export async function HomeHeader({ variant = 'home' }: HomeHeaderProps) {
  const t = await getTranslations('HomePage');
  const tCreate = await getTranslations('CreatePage');
  const isCreate = variant === 'create';
  const isPosters = variant === 'posters';

  // On the create page the sections live on "/", so anchors need the prefix.
  const navLinks: Array<{ href: string; label: string; active?: boolean }> = [
    { href: '/moon', label: t('nav.moon') },
    { href: '/posters', label: t('nav.gallery'), active: isPosters },
  ];

  return (
    <header
      data-animate={variant === 'home' ? 'header' : undefined}
      className="border-b border-[#33415B]"
    >
      <div className="mx-auto flex items-center justify-between px-6 text-sm text-white md:px-20 h-16">
        <Link
          className="flex items-center gap-4 text-2xl font-bold text-white"
          href={'/'}
        >
          <Sparkles className="size-4 text-[#CEB47B]" />
          {t('brand')}
        </Link>

        <NavigationMenu viewport={false} className="hidden max-w-none md:flex">
          <NavigationMenuList className="gap-6">
            {navLinks.map(({ href, label, active }) => (
              <NavigationMenuItem
                key={href}
                className={active ? 'bg-white/10 rounded-lg' : ''}
              >
                <NavigationMenuLink
                  href={href}
                  className={active ? 'text-[#CEB47B]' : navLinkClass}
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {isCreate ? (
          <Button
            asChild
            variant="outline"
            className="border-[#33415B] bg-transparent p-5! text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
          >
            <Link href="/">{tCreate('back')}</Link>
          </Button>
        ) : (
          <Button
            asChild
            className="bg-[#CEB47B] p-5! text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
          >
            <Link href="/create">{t('cta')}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
