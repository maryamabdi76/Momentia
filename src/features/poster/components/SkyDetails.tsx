'use client';

import { Controller, type Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Crown, Sparkles } from 'lucide-react';
import { cn } from 'cn';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { MAGNITUDE_PRESETS } from '@/features/sky/lib/layers';
import { formatToman } from '../lib/digits';
import type { PersonalizeValues } from '../lib/schemas';
import { ChoiceGroup } from './ChoiceGroup';
import { PremiumMark } from './PremiumMark';

const LAYER_KEYS = [
  'constellationLines',
  'constellationArt',
  'moonAndPlanets',
  'planetNames',
  'ecliptic',
  'equator',
] as const;

type Props = {
  control: Control<PersonalizeValues>;
  /** What the form currently holds (a partial, while fields are still being filled in). */
  layers: { moonAndPlanets?: boolean; constellationArt?: boolean } | undefined;
  /** Opens the section at first; used when something premium is already switched on in it. */
  startOpen: boolean;
};

/** What the sky map shows. All optional, so it starts folded away. */
export function SkyDetails({ control, layers, startOpen }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={startOpen ? 'sky' : undefined}
      className="rounded-2xl border border-[#33415B] bg-[#142039]/40"
    >
      <AccordionItem value="sky" className="border-0">
        <AccordionTrigger className="items-center gap-2.5 px-4 py-3.5 hover:no-underline sm:px-5">
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#CEB47B]/12 text-[#CEB47B]"
            >
              <Sparkles className="size-4" />
            </span>
            <span className="space-y-0.5 text-start">
              <span className="block text-sm font-semibold text-white">{t('sections.sky')}</span>
              <span className="block text-[11px] font-normal leading-5 text-[#AAB6CD]">
                {t('sections.skyHint')}
              </span>
            </span>
          </span>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-5 px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="space-y-1">
              <p className="text-[13px] font-medium text-[#E8D9B8]">{t('skyLabel')}</p>
              <p className="text-[11px] leading-6 text-[#AAB6CD]">{t('skyHint')}</p>
            </div>

            <div className="space-y-1">
              {LAYER_KEYS.map((key) => (
                <Controller
                  key={key}
                  control={control}
                  name={`layers.${key}`}
                  render={({ field }) => {
                    // planet names only make sense while planets are shown
                    const disabled = key === 'planetNames' && !layers?.moonAndPlanets;
                    return (
                      <div
                        className={cn(
                          'flex items-start justify-start gap-2.5 py-1.5',
                          key === 'planetNames' && 'ps-6',
                          disabled && 'opacity-45',
                        )}
                      >
                        <Checkbox
                          id={`layers-${key}`}
                          checked={field.value}
                          disabled={disabled}
                          onCheckedChange={field.onChange}
                          className="mt-1 border-white/30 data-[state=checked]:border-[#CEB47B] data-[state=checked]:bg-[#CEB47B] data-[state=checked]:text-[#0c142b] dark:data-[state=checked]:border-[#CEB47B] dark:data-[state=checked]:bg-[#CEB47B]"
                        />
                        <Label
                          htmlFor={`layers-${key}`}
                          className="flex-col items-start gap-0.5 text-sm font-normal text-white"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            {t(`sky.${key}.label`)}
                            {key === 'constellationArt' && (
                              <PremiumMark
                                label={t('premium.badge')}
                                tooltip={t('sky.constellationArt.premiumTooltip')}
                              />
                            )}
                          </span>
                          <span className="text-[11px] leading-5 text-[#AAB6CD]">
                            {t(`sky.${key}.hint`)}
                          </span>
                        </Label>
                      </div>
                    );
                  }}
                />
              ))}
            </div>

            {layers?.constellationArt && (
              <p className="flex items-start gap-2 rounded-xl border border-[#CEB47B]/30 bg-[#CEB47B]/5 p-3 text-[11px] leading-5 text-[#E8D9B8]">
                <Crown aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#CEB47B]" />
                <span>
                  {t('sky.constellationArt.premiumNote')}
                  {PREMIUM_PRICE_TOMAN ? (
                    <span className="mt-1 block font-semibold">
                      {t('premium.priceHint', { price: formatToman(PREMIUM_PRICE_TOMAN) })}
                    </span>
                  ) : null}
                </span>
              </p>
            )}

            <Controller
              control={control}
              name="layers.maxMagnitude"
              render={({ field }) => (
                <div className="space-y-2">
                  <ChoiceGroup
                    name="sky-density"
                    legend={t('sky.density.label')}
                    value={String(field.value)}
                    onChange={(v) => field.onChange(Number(v))}
                    className="grid grid-cols-3 gap-2"
                    choiceClassName="px-3 py-2.5 text-center"
                    choices={MAGNITUDE_PRESETS.map((m, i) => ({
                      value: String(m),
                      content: (
                        <span className="text-sm text-white/60 group-has-[:checked]/choice:font-medium group-has-[:checked]/choice:text-white">
                          {t(`sky.density.options.${i}`)}
                        </span>
                      ),
                    }))}
                  />
                  <p className="text-[11px] text-[#AAB6CD]">{t('sky.density.hint')}</p>
                </div>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
