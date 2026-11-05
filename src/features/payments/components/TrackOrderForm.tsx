'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recoverByCode, storePremiumToken } from '@/features/payments/lib/client';

type Outcome = 'paid' | 'submitted' | 'pending' | 'rejected' | 'none' | 'unavailable' | 'rate_limited';

/** Tracking-code box: gets a payment back after the browser tab was lost. */
export function TrackOrderForm() {
  const t = useTranslations('TrackPage');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function find() {
    if (busy || !code.trim()) return;
    setBusy(true);
    setOutcome(null);
    const result = await recoverByCode(code);
    if (result.status === 'paid') storePremiumToken(result.token);
    setOutcome(result.status);
    setBusy(false);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void find();
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor="track-code" className="text-sm text-[#E8D9B8]">
          {t('label')}
        </label>
        <Input
          id="track-code"
          dir="ltr"
          autoComplete="off"
          spellCheck={false}
          maxLength={40}
          placeholder="aB3xY9Qw2Zk7Lm4P"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-11 border-[#33415B] bg-[#0c142b] text-center font-mono tracking-wider text-white"
        />
        <p className="text-[12px] leading-6 text-[#AAB6CD]">{t('hint')}</p>
      </div>

      <Button
        type="submit"
        disabled={busy || !code.trim()}
        className="h-11 w-full gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
      >
        {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {t('submit')}
      </Button>

      {outcome && (
        <div
          role={outcome === 'paid' ? 'status' : 'alert'}
          className="space-y-3 rounded-xl border border-white/15 bg-[#142039] p-4 text-sm leading-7 text-[#E8D9B8]"
        >
          <p>{t(`results.${outcome}`)}</p>
          {outcome === 'paid' && (
            <Button
              asChild
              className="h-11 w-full bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              <Link href="/create?step=3">{t('download')}</Link>
            </Button>
          )}
          {(outcome === 'none' || outcome === 'rejected') && (
            <Link href="/contact" className="text-[#CEB47B] underline-offset-4 hover:underline">
              {t('contact')}
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
