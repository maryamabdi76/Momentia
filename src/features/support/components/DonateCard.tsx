'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCard, readSupportConfig } from '@/lib/support';

type Props = {
  /** `compact` is the small note under the download buttons; `full` is the section on /contact. */
  variant?: 'compact' | 'full';
};

/**
 * Optional card-to-card donation. Renders nothing until NEXT_PUBLIC_DONATION_CARD
 * holds a valid 16-digit number, so the number itself lives in the deployment's
 * environment and not in the repository.
 */
export function DonateCard({ variant = 'full' }: Props) {
  const t = useTranslations('Support.donate');
  const { card } = readSupportConfig();
  const [copied, setCopied] = useState<'copied' | 'error' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!card) return null;

  async function copy() {
    if (!card) return;
    try {
      await navigator.clipboard.writeText(card.number);
      setCopied('copied');
    } catch {
      setCopied('error');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2500);
  }

  const compact = variant === 'compact';

  return (
    <div
      id={compact ? undefined : 'donate'}
      className="space-y-3 rounded-2xl border border-[#33415B] bg-[#142039] p-5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-[#E8D9B8]">
        <Heart aria-hidden className="size-4 text-[#CEB47B]" />
        {t('title')}
      </p>
      <p className="text-[12px] leading-6 text-[#AAB6CD]">
        {compact ? t('bodyCompact') : t('body')}
      </p>

      <div className="rounded-xl border border-[#CEB47B]/30 bg-[#0c142b] p-4">
        <p
          dir="ltr"
          className="select-all text-center font-mono text-lg tracking-widest text-white"
        >
          {formatCard(card.number)}
        </p>
        {(card.holder || card.bank) && (
          <p className="mt-2 text-center text-[11px] leading-5 text-[#AAB6CD]">
            {[card.bank, card.holder].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={copy}
        className="h-10 w-full gap-2 border-[#CEB47B]/50 bg-transparent text-sm text-[#E8D9B8] hover:bg-white/5 hover:text-[#CEB47B]"
      >
        {copied === 'copied' ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        {t('copy')}
      </Button>
      <p role="status" className="min-h-4 text-center text-[11px] text-[#CEB47B]">
        {copied === 'copied' ? t('copied') : copied === 'error' ? t('copyError') : ''}
      </p>
      {!compact && (
        <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('note')}</p>
      )}
    </div>
  );
}
