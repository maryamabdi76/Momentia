import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage');

  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-14 md:py-20">
        <p className="text-sm text-[#CEB47B]" dir="ltr">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-4 max-w-xl text-sm leading-8 text-[#AAB6CD]">
          {t('body')}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
          >
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#33415B] bg-transparent p-6! font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
          >
            <Link href="/create">{t('create')}</Link>
          </Button>
        </div>
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
