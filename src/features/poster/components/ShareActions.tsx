'use client';

import { useTranslations } from 'next-intl';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type GiftStatus = 'copied' | 'error' | 'edit' | null;

type Props = {
  /** Copies a link that shows this poster to whoever opens it. */
  onCopyGift: () => void;
  giftStatus: GiftStatus;
  /** Opens Telegram or WhatsApp with the gift link ready to send. */
  onShareGift: (app: 'telegram' | 'whatsapp') => void;
  /** Copies a link that reopens the editor with this poster, to continue later. */
  onCopyEdit?: () => void;
};

/** Sending the poster to someone as a link: the same three ways for the sky, the moon and the map. */
export function ShareActions({ onCopyGift, giftStatus, onShareGift, onCopyEdit }: Props) {
  const t = useTranslations('CreatePage.step3');
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCopyGift}
        className="cursor-pointer p-7! gap-2 rounded-xl border-[#CEB47B]/50 bg-transparent text-sm font-bold text-[#E8D9B8] hover:bg-[#CEB47B]/10 hover:text-[#CEB47B]"
      >
        {giftStatus === 'copied' ? t('giftCopied') : giftStatus === 'error' ? t('giftError') : t('giftLink')}
        <Link2 className="size-4" />
      </Button>
      <div className="grid grid-cols-2 gap-3">
        {(['telegram', 'whatsapp'] as const).map((app) => (
          <Button
            key={app}
            type="button"
            variant="outline"
            onClick={() => onShareGift(app)}
            className="h-11 cursor-pointer rounded-xl border-[#33415B] bg-transparent text-xs font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
          >
            {t(app === 'telegram' ? 'giftShareTelegram' : 'giftShareWhatsapp')}
          </Button>
        ))}
      </div>
      {onCopyEdit && (
        <Button
          type="button"
          variant="ghost"
          onClick={onCopyEdit}
          className="h-10 cursor-pointer text-xs text-[#AAB6CD] hover:bg-white/5 hover:text-[#E8D9B8]"
        >
          {giftStatus === 'edit' ? t('editLinkCopied') : t('editLink')}
        </Button>
      )}
      <p className="text-xs leading-6 text-[#AAB6CD]">{t('giftNote')}</p>
    </>
  );
}
