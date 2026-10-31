'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import {
  paymentCodeFromToken,
  readPremiumToken,
  subscribePremiumToken,
} from '@/features/payments/lib/client';
import { Button } from '@/components/ui/button';

/**
 * The tracking code of the payment that unlocked the premium file. The proof of
 * payment only lives in this tab for a short while, so the buyer keeps this code
 * to get help from /contact if the file never arrives. Nothing is shown without a token.
 */
export function PaymentReceipt() {
  const t = useTranslations('Support.receipt');
  const token = useSyncExternalStore(subscribePremiumToken, readPremiumToken, () => null);
  const code = paymentCodeFromToken(token);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!code) return null;

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // the code is selectable on screen, so a failed copy costs nothing
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-[#33415B] bg-[#0c142b] p-3.5">
      <p className="text-[12px] font-semibold text-[#E8D9B8]">{t('title')}</p>
      <p
        dir="ltr"
        className="select-all break-all text-center font-mono text-[11px] tracking-wider text-white"
      >
        {code}
      </p>
      <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('body')}</p>
      <Button
        type="button"
        variant="outline"
        onClick={copy}
        className="h-9 w-full gap-2 border-[#33415B] bg-transparent text-xs text-white/80 hover:bg-white/5"
      >
        {copied ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
        {copied ? t('copied') : t('copy')}
      </Button>
    </div>
  );
}
