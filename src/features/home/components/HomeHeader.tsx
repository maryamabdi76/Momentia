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
   * `home`   – anchors scroll within the landing page, CTA opens /create.
   * `create` – anchors point back to the landing page, action returns home.
   */
  variant?: 'home' | 'create';
};

export async function HomeHeader({ variant = 'home' }: HomeHeaderProps) {
  const t = await getTranslations('HomePage');
  const tCreate = await getTranslations('CreatePage');
  const isCreate = variant === 'create';

  // On the create page the sections live on "/", so anchors need the prefix.
  const anchorBase = isCreate ? '/' : '';
  const navLinks = [
    ['gifts', t('nav.posters')],
    ['steps', t('nav.how')],
    ['faq', t('nav.faq')],
  ] as const;

  return (
    <header
      data-animate={isCreate ? undefined : 'header'}
      className="border-b border-[#33415B]"
    >
      <div
        className={`mx-auto flex items-center justify-between px-6 text-sm text-white md:px-20 ${
          isCreate ? 'h-16 md:h-20' : 'h-16'
        }`}
      >
        <Link
          className="flex items-center gap-4 text-2xl font-bold text-white"
          href={isCreate ? '/' : '#top'}
        >
          <Sparkles className="size-4 text-[#CEB47B]" />
          {t('brand')}
        </Link>

        <NavigationMenu viewport={false} className="hidden max-w-none md:flex">
          <NavigationMenuList className="gap-6">
            {navLinks.map(([id, label]) => (
              <NavigationMenuItem key={id}>
                <NavigationMenuLink
                  href={`${anchorBase}#${id}`}
                  className={navLinkClass}
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
            className="h-11 rounded-xl border-[#33415B] bg-transparent px-5 text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
          >
            <Link href="/">{tCreate('back')}</Link>
          </Button>
        ) : (
          <Button
            asChild
            className="bg-[#CEB47B] p-5! px-5 py-2 text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
          >
            <Link href="/create">{t('cta')}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
