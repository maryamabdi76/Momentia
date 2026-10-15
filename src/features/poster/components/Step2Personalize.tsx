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
import { ArrowLeft, ArrowRight, Pencil, ShieldCheck } from 'lucide-react';
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
  POSTER_STYLES,
  POSTER_THEMES,
  paperCss,
} from '@/features/poster/lib/themes';
import { MAGNITUDE_PRESETS } from '@/features/sky/lib/layers';
import { cn } from 'cn';
import { Separator } from '@/components/ui/separator';

type Props = {
  data: PersonalizeData;
  moment: MomentData;
  onChange: (d: PersonalizeData) => void;
  onNext: () => void;
  onBack: () => void;
  onEditMoment?: () => void;
};

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

  const { control, handleSubmit, watch } = useForm<PersonalizeValues>({
    resolver: zodResolver(personalizeSchema),
    defaultValues: {
      title: data.title,
      names: data.names,
      quote: data.quote,
      style: data.style,
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
    watched.showDate,
    watched.showCity,
    layers?.constellationLines,
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
                    {t(`sky.${key}.label`)}
                    <span className="text-[11px] leading-5 text-[#AAB6CD]">
                      {t(`sky.${key}.hint`)}
                    </span>
                  </Label>
                </div>
              );
            }}
          />
        ))}

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
