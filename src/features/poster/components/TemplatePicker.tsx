'use client';

import { useTranslations } from 'next-intl';
import { Crown } from 'lucide-react';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { formatToman } from '../lib/digits';
import { POSTER_TEMPLATES, isPremiumTemplate, type PosterTemplate } from '../lib/templates';
import { ChoiceGroup } from './ChoiceGroup';
import { PremiumMark } from './PremiumMark';
import { TemplateIcon } from './TemplateIcon';

type Props = {
  value: PosterTemplate;
  onChange: (template: PosterTemplate) => void;
};

/** The layout: the round chart, or the whole page as sky. */
export function TemplatePicker({ value, onChange }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <div className="space-y-3">
      <ChoiceGroup
        name="poster-template"
        legend={t('templateLabel')}
        value={value}
        onChange={onChange}
        className="grid grid-cols-2 gap-2.5"
        choices={POSTER_TEMPLATES.map((tpl) => ({
          value: tpl,
          content: (
            <span className="flex items-center gap-3 p-3">
              <TemplateIcon
                template={tpl}
                className="text-white/40 group-has-[:checked]/choice:text-[#CEB47B]"
              />
              <span className="min-w-0 space-y-1">
                <span className="flex flex-wrap items-center gap-1.5 text-sm text-white/60 group-has-[:checked]/choice:font-medium group-has-[:checked]/choice:text-white">
                  {t(`templates.${tpl}.label`)}
                  {isPremiumTemplate(tpl) && (
                    <PremiumMark label={t('premium.badge')} tooltip={t('premium.tooltip')} />
                  )}
                </span>
                <span className="block text-[11px] leading-5 text-[#AAB6CD]">
                  {t(`templates.${tpl}.hint`)}
                </span>
              </span>
            </span>
          ),
        }))}
      />
      {isPremiumTemplate(value) && (
        <p className="flex items-start gap-2 rounded-xl border border-[#CEB47B]/30 bg-[#CEB47B]/5 p-3 text-[11px] leading-5 text-[#E8D9B8]">
          <Crown aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#CEB47B]" />
          <span>
            {t('premium.note')}
            {PREMIUM_PRICE_TOMAN ? (
              <span className="mt-1 block font-semibold">
                {t('premium.priceHint', { price: formatToman(PREMIUM_PRICE_TOMAN) })}
              </span>
            ) : null}
          </span>
        </p>
      )}
    </div>
  );
}
