'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center bg-[#080f28] px-6 py-14 text-[#f7f3e8]"
      dir="rtl"
    >
      <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
      <p className="mt-4 max-w-xl text-sm leading-8 text-[#AAB6CD]">{t('body')}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={reset}
          className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {t('retry')}
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-[#33415B] bg-transparent p-6! font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
        >
          <Link href="/">{t('home')}</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="p-6! text-[#AAB6CD] hover:bg-white/5 hover:text-[#CEB47B]"
        >
          <Link href="/contact">{t('contact')}</Link>
        </Button>
      </div>
    </main>
  );
}
