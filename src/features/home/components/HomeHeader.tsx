import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Moon, Sparkles } from 'lucide-react';
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
   * `create`  – the sky poster maker: Moon maker one tap away, action returns home.
   * `moon`    – the Moon poster maker: sky maker one tap away, action returns home.
   * `posters` – the gallery.
   */
  variant?: 'home' | 'create' | 'moon' | 'posters';
};

export async function HomeHeader({ variant = 'home' }: HomeHeaderProps) {
  const t = await getTranslations('HomePage');
  const tCreate = await getTranslations('CreatePage');
  const isCreate = variant === 'create' || variant === 'moon';
  const isMoon = variant === 'moon';
  const isPosters = variant === 'posters';

  const navLinks: Array<{ href: string; label: string; active?: boolean }> = [
    { href: '/posters', label: t('nav.gallery'), active: isPosters },
  ];

  // The two makers are the two things to do here, so both are buttons: one
  // outlined, one gold. On a maker page the other maker is the outlined one.
  const other = isMoon
    ? { href: '/create', label: t('nav.sky'), icon: Sparkles }
    : { href: '/moon', label: t('nav.moon'), icon: Moon };
  const OtherIcon = other.icon;

  return (
    <header
      data-animate={variant === 'home' ? 'header' : undefined}
      className="border-b border-[#33415B]"
    >
      <div className="mx-auto flex items-center justify-between px-4 text-sm text-white sm:px-6 md:px-20 h-16">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link
            className="flex items-center gap-3 text-xl font-bold whitespace-nowrap text-white md:gap-4 md:text-2xl"
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
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            asChild
            variant="outline"
            className="border-[#CEB47B]/50 bg-transparent px-3! py-5! text-sm font-bold text-[#E8D9B8] hover:border-[#CEB47B] hover:bg-[#CEB47B]/10 hover:text-[#CEB47B] md:px-5!"
          >
            <Link href={other.href} aria-label={other.label}>
              <OtherIcon className="size-4" aria-hidden />
              <span className="hidden md:inline">{other.label}</span>
            </Link>
          </Button>

          {isCreate ? (
            <Button
              asChild
              variant="outline"
              className="border-[#33415B] bg-transparent px-3! py-5! text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B] md:px-5!"
            >
              <Link href="/">{tCreate('back')}</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-[#CEB47B] px-3! py-5! text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] md:px-5!"
            >
              <Link href="/create">{t('nav.sky')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
