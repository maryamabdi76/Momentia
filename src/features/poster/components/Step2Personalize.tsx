'use client';

import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Crown, Pencil, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  personalizeSchema,
  type PersonalizeValues,
} from '@/features/poster/lib/schemas';
import type { PersonalizeData, MomentData } from './CreateStepper';
import {
  POSTER_TEMPLATES,
  isPremiumTemplate,
  type PosterTemplate,
} from '@/features/poster/lib/templates';
import {
  POSTER_STYLES,
  POSTER_THEMES,
  paperCss,
} from '@/features/poster/lib/themes';
import { MAGNITUDE_PRESETS } from '@/features/sky/lib/layers';
import { cn } from 'cn';
import { PremiumMark } from './PremiumMark';
import { Separator } from '@/components/ui/separator';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { formatToman } from '../lib/digits';

type Props = {
  data: PersonalizeData;
  moment: MomentData;
  onChange: (d: PersonalizeData) => void;
  onNext: () => void;
  onBack: () => void;
  onEditMoment?: () => void;
};

/** A tiny schematic of each layout, drawn in the current colour. */
function TemplateIcon({
  template,
  className,
}: {
  template: PosterTemplate;
  className?: string;
}) {
  const dots =
    template === 'full'
      ? [
          [5, 6], [11, 4], [19, 7], [27, 5], [33, 9], [8, 14], [16, 12], [24, 15],
          [31, 17], [6, 22], [14, 25], [22, 21], [30, 26], [10, 30], [26, 32],
        ]
      : [[14, 12], [20, 9], [26, 13], [18, 18], [24, 21], [15, 24]];
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 56"
      className={cn('h-14 w-10 shrink-0', className)}
      fill="none"
      stroke="currentColor"
    >
      <rect x="0.75" y="0.75" width="38.5" height="54.5" rx="2" strokeWidth={1.2} />
      {template === 'circle' && <circle cx="20" cy="17" r="12" strokeWidth={1} />}
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="currentColor" stroke="none" />
      ))}
      <path d="M9 40h22M12 46h16" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function Step2Personalize({
  data,
  moment,
  onChange,
  onNext,
  onBack,
  onEditMoment,
}: Props) {
  const t = useTranslations('CreatePage.step2');
  const tStep1 = useTranslations('CreatePage.step1');

  const { control, handleSubmit, watch, setValue } = useForm<PersonalizeValues>({
    resolver: zodResolver(personalizeSchema),
    defaultValues: {
      title: data.title,
      names: data.names,
      quote: data.quote,
      style: data.style,
      template: data.template,
      showDate: data.showDate,
      showCity: data.showCity,
      layers: data.layers,
    },
  });

  // Live-sync every field change to parent so the poster preview updates in real time
  const watched = useWatch({ control });
  const layers = watched.layers;
  useEffect(() => {
    onChange(watched as PersonalizeValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched.title,
    watched.names,
    watched.quote,
    watched.style,
    watched.template,
    watched.showDate,
    watched.showCity,
    layers?.constellationLines,
    layers?.constellationArt,
    layers?.moonAndPlanets,
    layers?.planetNames,
    layers?.ecliptic,
    layers?.equator,
    layers?.maxMagnitude,
  ]);

  const momentSummary = [
    moment.city,
    `${moment.day} ${moment.month} ${moment.year}`,
    !moment.noExactTime && moment.time ? `ساعت ${moment.time}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const onSubmit: SubmitHandler<PersonalizeValues> = (values) => {
    onChange(values);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          {t('description', { city: moment.city })}
        </p>
      </div>

      {/* Moment summary row */}
      <div className="flex items-center rounded-xl justify-between bg-[#142039] p-3">
        <span className="text-sm text-[#AAB6CD]">{momentSummary}</span>
        <Button
          type="button"
          variant="link"
          onClick={onEditMoment ?? onBack}
          className="text-xs text-[#CEB47B] hover:text-[#e0c180] transition-colors gap-1 cursor-pointer"
        >
          <Pencil className="size-3" />
          {t('editLabel')}
        </Button>
      </div>

      {/* Starting ideas: an empty text box is the main place people stall */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#E8D9B8]">{t('ideas.label')}</p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setValue('title', t(`ideas.items.${i}.title`), { shouldDirty: true });
                setValue('quote', t(`ideas.items.${i}.quote`), { shouldDirty: true });
              }}
              className="cursor-pointer rounded-full border border-[#33415B] px-3 py-1.5 text-xs text-[#E8D9B8] transition-colors hover:border-[#CEB47B]/60 hover:bg-[#CEB47B]/10 focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50 focus-visible:outline-none"
            >
              {t(`ideas.items.${i}.label`)}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('ideas.hint')}</p>
      </div>

      {/* Title field */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#E8D9B8]">
          {t('titleLabel')}
        </Label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <>
              <InputGroup className="h-12 border-white/12 has-[[data-slot=input-group-control]:focus-visible]:border-[#CEB47B]/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[#CEB47B]/10">
                <InputGroupAddon>
                  <Pencil className="size-4 text-white/25" />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  placeholder={t('titlePlaceholder')}
                  className="h-12 text-sm text-white placeholder:text-white/30 text-right"
                />
              </InputGroup>
              {fieldState.error && (
                <p className="text-[11px] text-red-400">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Names field */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#E8D9B8]">
          {t('namesLabel')}
        </Label>
        <Controller
          control={control}
          name="names"
          render={({ field, fieldState }) => (
            <>
              <InputGroup className="h-12 has-[[data-slot=input-group-control]:focus-visible]:border-[#CEB47B]/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[#CEB47B]/10">
                <InputGroupAddon>
                  <Pencil className="size-4 text-white/25" />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  placeholder={t('namesPlaceholder')}
                  className="h-12 text-sm text-white placeholder:text-white/30 text-right"
                />
              </InputGroup>
              {fieldState.error && (
                <p className="text-[11px] text-red-400">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Quote field */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#E8D9B8]">
          {t('quoteLabel')}
        </Label>
        <Controller
          control={control}
          name="quote"
          render={({ field, fieldState }) => (
            <>
              <InputGroup className="h-12 has-[[data-slot=input-group-control]:focus-visible]:border-[#CEB47B]/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[#CEB47B]/10">
                <InputGroupAddon>
                  <Pencil className="size-4 text-white/25" />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  placeholder={t('quotePlaceholder')}
                  className="h-12 text-sm text-white placeholder:text-white/30 text-right"
                />
              </InputGroup>
              <p className="text-[11px] text-[#AAB6CD]">{t('quoteHint')}</p>
              {fieldState.error && (
                <p className="text-[11px] text-red-400">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Layout picker: round chart, or the whole page as sky */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#E8D9B8]">{t('templateLabel')}</p>
        <Controller
          control={control}
          name="template"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              {POSTER_TEMPLATES.map((tpl) => {
                const isSelected = field.value === tpl;
                return (
                  <Label
                    key={tpl}
                    htmlFor={`template-${tpl}`}
                    className={cn(
                      'flex cursor-pointer flex-col items-stretch gap-3 rounded-xl border p-3.5 transition-colors',
                      isSelected
                        ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8'
                        : 'border-[#33415B]',
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <TemplateIcon
                        template={tpl}
                        className={isSelected ? 'text-[#CEB47B]' : 'text-white/40'}
                      />
                      <span className="flex flex-col items-end gap-2">
                      <RadioGroupItem
                        value={tpl}
                        id={`template-${tpl}`}
                        className="border-white/20 data-checked:border-[#CEB47B] data-checked:bg-[#CEB47B] dark:data-checked:border-[#CEB47B] dark:data-checked:bg-[#CEB47B] [&_[data-slot=radio-group-indicator]_span]:bg-[#0c142b]"
                      />
                      {isPremiumTemplate(tpl) && (
                        <PremiumMark
                          label={t('premium.badge')}
                          tooltip={t('premium.tooltip')}
                        />
                      )}
                      </span>
                    </span>
                    <span className="space-y-1">
                      <span
                        className={cn(
                          'block text-sm',
                          isSelected ? 'font-medium text-white' : 'font-normal text-white/60',
                        )}
                      >
                        {t(`templates.${tpl}.label`)}
                      </span>
                      <span className="block text-[11px] font-normal leading-5 text-[#AAB6CD]">
                        {t(`templates.${tpl}.hint`)}
                      </span>
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        />
        {isPremiumTemplate(watched.template as PosterTemplate) && (
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

      {/* Style picker */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#E8D9B8]">{t('styleLabel')}</p>
        <Controller
          control={control}
          name="style"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              {POSTER_STYLES.map((s) => {
                const isSelected = field.value === s;
                return (
                  <Label
                    key={s}
                    htmlFor={`style-${s}`}
                    className={cn(
                      'flex cursor-pointer rounded-xl items-center justify-between border px-4 py-3.5 transition-colors',
                      isSelected
                        ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8'
                        : 'border-[#33415B]',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="size-6 shrink-0 rounded-full border"
                        style={{
                          background: paperCss(POSTER_THEMES[s]),
                          borderColor: POSTER_THEMES[s].frame,
                        }}
                      />
                      <span
                        className={
                          isSelected
                            ? 'text-sm font-medium text-white'
                            : 'text-sm font-normal text-white/55'
                        }
                      >
                        {t(`styles.${s}`)}
                      </span>
                    </span>
                    <RadioGroupItem
                      value={s}
                      id={`style-${s}`}
                      className="border-white/20 data-checked:border-[#CEB47B] data-checked:bg-[#CEB47B] dark:data-checked:border-[#CEB47B] dark:data-checked:bg-[#CEB47B] [&_[data-slot=radio-group-indicator]_span]:bg-[#0c142b]"
                    />
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        />
      </div>

      {/* Frame toggles */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium text-[#E8D9B8]">{t('frameLabel')}</p>
        <Controller
          control={control}
          name="showDate"
          render={({ field }) => (
            <div className="flex items-center justify-start gap-2 py-2">
              <Checkbox
                id="showDate"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/30 data-[state=checked]:border-[#CEB47B] data-[state=checked]:bg-[#CEB47B] data-[state=checked]:text-[#0c142b] dark:data-[state=checked]:border-[#CEB47B] dark:data-[state=checked]:bg-[#CEB47B]"
              />
              <p className="text-sm text-white">{t('showDate')}</p>
            </div>
          )}
        />
        <Controller
          control={control}
          name="showCity"
          render={({ field }) => (
            <div className="flex items-center justify-start gap-2 py-2">
              <Checkbox
                id="showCity"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/30 data-[state=checked]:border-[#CEB47B] data-[state=checked]:bg-[#CEB47B] data-[state=checked]:text-[#0c142b] dark:data-[state=checked]:border-[#CEB47B] dark:data-[state=checked]:bg-[#CEB47B]"
              />
              <p className="text-sm text-white">{t('showCity')}</p>
            </div>
          )}
        />
      </div>

      {/* Sky objects: everything here is optional */}
      <div className="space-y-2.5">
        <div>
          <p className="text-sm font-medium text-[#E8D9B8]">{t('skyLabel')}</p>
          <p className="mt-1 text-[11px] leading-6 text-[#AAB6CD]">
            {t('skyHint')}
          </p>
        </div>

        {(
          [
            'constellationLines',
            'constellationArt',
            'moonAndPlanets',
            'planetNames',
            'ecliptic',
            'equator',
          ] as const
        ).map((key) => (
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
                    'flex items-start justify-start gap-2 py-1.5',
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

        <div className="space-y-2 pt-2">
          <p className="text-sm text-white">{t('sky.density.label')}</p>
          <Controller
            control={control}
            name="layers.maxMagnitude"
            render={({ field }) => (
              <RadioGroup
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
                className="grid grid-cols-3 gap-3"
              >
                {MAGNITUDE_PRESETS.map((m, i) => {
                  const isSelected = field.value === m;
                  return (
                    <Label
                      key={m}
                      htmlFor={`density-${m}`}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 transition-colors',
                        isSelected
                          ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8'
                          : 'border-[#33415B]',
                      )}
                    >
                      <span
                        className={
                          isSelected
                            ? 'text-sm font-medium text-white'
                            : 'text-sm font-normal text-white/55'
                        }
                      >
                        {t(`sky.density.options.${i}`)}
                      </span>
                      <RadioGroupItem
                        value={String(m)}
                        id={`density-${m}`}
                        className="border-white/20 data-checked:border-[#CEB47B] data-checked:bg-[#CEB47B] dark:data-checked:border-[#CEB47B] dark:data-checked:bg-[#CEB47B] [&_[data-slot=radio-group-indicator]_span]:bg-[#0c142b]"
                      />
                    </Label>
                  );
                })}
              </RadioGroup>
            )}
          />
          <p className="text-[11px] text-[#AAB6CD]">{t('sky.density.hint')}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 py-6 text-[#E8D9B8] hover:text-[#E8D9B8] gap-2"
          onClick={onBack}
        >
          <ArrowRight className="size-4" />
          {t('ctaBack')}
        </Button>
        <Button
          type="submit"
          className="flex-1 py-6 bg-[#CEB47B] text-base font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
        >
          {t('ctaNext')}
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      <p className="flex items-center justify-start gap-1.5 text-xs text-[#AAB6CD]">
        <ShieldCheck className="size-3.5" />
        {tStep1('noAccount')}
      </p>
    </form>
  );
}
