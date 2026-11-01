'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PaymentReceipt } from '@/features/payments/components/PaymentReceipt';
import {
  CheckoutError,
  type ClaimResult,
  type OrderInfo,
  claimPremiumToken,
  onOpenPaymentDialog,
  startOrder,
  storePremiumToken,
  submitOrder,
} from '@/features/payments/lib/client';
import { formatToman } from '@/features/poster/lib/digits';
import { formatCard } from '@/lib/support';
import { trackEvent } from '@/lib/track';

type View = 'idle' | 'loading' | 'pay' | 'waiting' | 'paid' | 'rejected' | 'error';

/** While waiting for the owner, ask the server this often. */
const POLL_MS = 10_000;

/**
 * The card-to-card payment window for the watermark-free download.
 *
 *   1. the buyer sees the exact amount and the card, and transfers the money in their bank app
 *   2. "I paid" tells the owner on Telegram, who checks the deposit and approves or rejects it
 *   3. this component asks the server until the order is decided; on approval it stores the
 *      signed token, which unlocks the download button
 *
 * It also shows where the order stands inline, so a buyer who closes the window (or the tab)
 * still sees it. It is opened by `ensurePremiumAccess` through `openPaymentDialog`.
 */
export function PaymentDialog() {
  const t = useTranslations('Payment');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('idle');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [last4, setLast4] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CheckoutError['reason'] | null>(null);
  const [copied, setCopied] = useState<'amount' | 'card' | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(result: ClaimResult) {
    if (result.status === 'paid') {
      storePremiumToken(result.token);
      trackEvent('payment_approved', { method: 'card' });
      setView('paid');
    } else if (result.status === 'submitted') {
      setView((v) => (v === 'paid' ? v : 'waiting'));
    } else if (result.status === 'rejected') {
      setView('rejected');
    }
  }

  async function begin() {
    setOpen(true);
    setError(null);
    setView('loading');
    try {
      const info = await startOrder();
      setOrder(info);
      setView(info.status === 'submitted' ? 'waiting' : 'pay');
    } catch (err) {
      setError(err instanceof CheckoutError ? err.reason : 'unavailable');
      setView('error');
    }
  }

  // `begin` is re-created on every render, so the listener reaches it through a ref.
  const beginRef = useRef(begin);
  useEffect(() => {
    beginRef.current = begin;
  });
  useEffect(() => onOpenPaymentDialog(() => void beginRef.current()), []);

  // Coming back to the page: pick up an order that was approved (or is still waiting).
  useEffect(() => {
    let cancelled = false;
    void claimPremiumToken().then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on load
  }, []);

  // The owner approves by hand, so keep asking while the order waits.
  useEffect(() => {
    if (view !== 'waiting') return;
    const timer = setInterval(() => {
      void claimPremiumToken().then(apply);
    }, POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `apply` only sets state
  }, [view]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  async function copy(what: 'amount' | 'card', value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      // the number is selectable on screen, so a failed copy costs nothing
    }
  }

  async function paid() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitOrder(last4.trim());
      trackEvent('payment_submitted', { method: 'card' });
      setView('waiting');
    } catch (err) {
      setError(err instanceof CheckoutError ? err.reason : 'unavailable');
    } finally {
      setBusy(false);
    }
  }

  const errorText = error
    ? t(
        error === 'rate_limited'
          ? 'errors.rateLimited'
          : error === 'busy'
            ? 'errors.busy'
            : error === 'notify_failed'
              ? 'errors.notifyFailed'
              : error === 'invalid_last4'
                ? 'errors.invalidLast4'
                : 'errors.unavailable',
      )
    : null;

  const copyIcon = (what: 'amount' | 'card') =>
    copied === what ? (
      <Check aria-hidden className="size-3.5" />
    ) : (
      <Copy aria-hidden className="size-3.5" />
    );

  const inlineNote =
    view === 'waiting' ? (
      <div
        role="status"
        className="space-y-2 rounded-lg border border-white/15 px-3 py-2 text-[12px] leading-6 text-white/70"
      >
        <p>{t('inline.waiting')}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[#CEB47B] underline-offset-4 hover:underline"
        >
          {t('inline.details')}
        </button>
      </div>
    ) : view === 'paid' ? (
      <div className="space-y-3">
        <p
          role="status"
          className="rounded-lg border border-[#CEB47B]/40 px-3 py-2 text-[12px] text-[#CEB47B]"
        >
          {t('paid')}
        </p>
        <PaymentReceipt />
      </div>
    ) : view === 'rejected' ? (
      <p
        role="status"
        className="rounded-lg border border-red-300/30 px-3 py-2 text-[12px] leading-6 text-red-300"
      >
        {t('rejected')}{' '}
        <Link href="/contact" className="underline underline-offset-4">
          {t('contact')}
        </Link>
      </p>
    ) : null;

  return (
    <>
      {inlineNote}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-[#33415B] bg-[#142039] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#CEB47B]">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-6 text-[#AAB6CD]">
              {view === 'waiting' ? t('waiting.body') : t('description')}
            </DialogDescription>
          </DialogHeader>

          {view === 'loading' && (
            <p className="flex items-center gap-2 text-[12px] text-[#AAB6CD]">
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {t('loading')}
            </p>
          )}

          {view === 'error' && (
            <div className="space-y-3">
              <p role="alert" className="text-[12px] leading-6 text-red-300">
                {errorText}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void begin()}
                className="h-10 w-full border-[#33415B] bg-transparent text-sm text-white/80 hover:bg-white/5"
              >
                {t('retry')}
              </Button>
            </div>
          )}

          {view === 'pay' && order && (
            <div className="space-y-4">
              <div className="space-y-1.5 rounded-xl border border-[#CEB47B]/30 bg-[#0c142b] p-4">
                <p className="text-[11px] text-[#AAB6CD]">{t('amountLabel')}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-bold text-white">
                    {formatToman(order.amountToman)} {t('toman')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copy('amount', String(order.amountToman))}
                    className="gap-1.5 border-[#33415B] bg-transparent text-xs text-white/80 hover:bg-white/5"
                  >
                    {copyIcon('amount')}
                    {copied === 'amount' ? t('copied') : t('copy')}
                  </Button>
                </div>
                <p className="text-[11px] leading-5 text-[#E8D9B8]">{t('amountNote')}</p>
              </div>

              <div className="space-y-1.5 rounded-xl border border-[#33415B] bg-[#0c142b] p-4">
                <p className="text-[11px] text-[#AAB6CD]">{t('cardLabel')}</p>
                <div className="flex items-center justify-between gap-3">
                  <p dir="ltr" className="select-all font-mono text-base tracking-widest text-white">
                    {formatCard(order.card.number)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copy('card', order.card.number)}
                    className="gap-1.5 border-[#33415B] bg-transparent text-xs text-white/80 hover:bg-white/5"
                  >
                    {copyIcon('card')}
                    {copied === 'card' ? t('copied') : t('copy')}
                  </Button>
                </div>
                {(order.card.holder || order.card.bank) && (
                  <p className="text-[11px] leading-5 text-[#AAB6CD]">
                    {[order.card.bank, order.card.holder].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="payment-last4" className="text-[12px] text-[#E8D9B8]">
                  {t('last4Label')}
                </label>
                <Input
                  id="payment-last4"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  placeholder="1234"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="h-10 border-[#33415B] bg-[#0c142b] text-center font-mono tracking-widest text-white"
                />
                <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('last4Hint')}</p>
              </div>

              {errorText && (
                <p role="alert" className="text-[12px] leading-6 text-red-300">
                  {errorText}
                </p>
              )}
              <Button
                type="button"
                onClick={() => void paid()}
                disabled={busy || (last4 !== '' && last4.length !== 4)}
                className="h-11 w-full gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
              >
                {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {t('submit')}
              </Button>
            </div>
          )}

          {view === 'waiting' && (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#E8D9B8]">
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {t('waiting.title')}
              </p>
              <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('waiting.keep')}</p>
            </div>
          )}

          {view === 'paid' && (
            <div className="space-y-3">
              <p role="status" className="text-sm font-semibold text-[#CEB47B]">
                {t('paid')}
              </p>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 w-full bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
              >
                {t('close')}
              </Button>
            </div>
          )}

          {view === 'rejected' && (
            <div className="space-y-3">
              <p role="alert" className="text-[12px] leading-6 text-red-300">
                {t('rejected')}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void begin()}
                  className="h-10 flex-1 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
                >
                  {t('retry')}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 flex-1 border-[#33415B] bg-transparent text-sm text-white/80 hover:bg-white/5"
                >
                  <Link href="/contact">{t('contact')}</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
