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
import { ArrowLeft, ArrowRight, Pencil, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  personalizeSchema,
  type PersonalizeValues,
} from '@/features/poster/lib/schemas';
import type { PersonalizeData, MomentData } from './CreateStepper';

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
    },
  });

  const showDate = watch('showDate');
  const showCity = watch('showCity');

  // Live-sync every field change to parent so the poster preview updates in real time
  const watched = useWatch({ control });
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
      <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3">
        <button
          type="button"
          onClick={onEditMoment ?? onBack}
          className="text-xs text-[#CEB47B] hover:text-[#e0c180] transition-colors"
        >
          {t('editLabel')}
        </button>
        <span className="text-sm text-white/70">{momentSummary}</span>
      </div>

      {/* Title field */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-white/80">
          {t('titleLabel')}
        </Label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <>
              <div className="flex items-center rounded-xl border border-white/12 bg-white/[0.04] px-4 gap-3 focus-within:border-[#CEB47B]/50 focus-within:ring-2 focus-within:ring-[#CEB47B]/10 transition-colors">
                <Pencil className="size-4 shrink-0 text-white/25" />
                <Input
                  {...field}
                  placeholder={t('titlePlaceholder')}
                  className="h-12 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-0 text-right"
                />
              </div>
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
        <Label className="text-sm font-medium text-white/80">
          {t('namesLabel')}
        </Label>
        <Controller
          control={control}
          name="names"
          render={({ field, fieldState }) => (
            <>
              <div className="flex items-center rounded-xl border border-white/12 bg-white/[0.04] px-4 gap-3 focus-within:border-[#CEB47B]/50 focus-within:ring-2 focus-within:ring-[#CEB47B]/10 transition-colors">
                <Pencil className="size-4 shrink-0 text-white/25" />
                <Input
                  {...field}
                  placeholder={t('namesPlaceholder')}
                  className="h-12 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-0 text-right"
                />
              </div>
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
        <Label className="text-sm font-medium text-white/80">
          {t('quoteLabel')}
        </Label>
        <Controller
          control={control}
          name="quote"
          render={({ field, fieldState }) => (
            <>
              <div className="flex items-center rounded-xl border border-white/12 bg-white/[0.04] px-4 gap-3 focus-within:border-[#CEB47B]/50 focus-within:ring-2 focus-within:ring-[#CEB47B]/10 transition-colors">
                <Pencil className="size-4 shrink-0 text-white/25" />
                <Input
                  {...field}
                  placeholder={t('quotePlaceholder')}
                  className="h-12 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-0 text-right"
                />
              </div>
              <p className="text-[11px] text-white/35">{t('quoteHint')}</p>
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
        <p className="text-sm font-medium text-white/80">{t('styleLabel')}</p>
        <Controller
          control={control}
          name="style"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {(['mono', 'gold'] as const).map((s, i) => {
                const isSelected = field.value === s;
                const isGold = s === 'gold';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => field.onChange(s)}
                    className={[
                      'relative flex flex-col items-center gap-3 rounded-xl border p-3 pb-4 transition-colors',
                      isSelected
                        ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8'
                        : 'border-white/12 bg-white/[0.03] hover:border-white/25',
                    ].join(' ')}
                  >
                    {/* Mini poster card — mirrors HomePosterPreview "compact" */}
                    <div
                      className={[
                        'w-full rounded-sm border p-2',
                        isGold
                          ? 'border-[#c8a85f]/60 bg-[#0e1e3d]'
                          : 'border-[#b9b5aa] bg-[#f8f6f0]',
                      ].join(' ')}
                    >
                      <p
                        className={[
                          'mb-1 text-center text-[7px]',
                          isGold ? 'text-white/50' : 'text-[#101a35]/45',
                        ].join(' ')}
                      >
                        نقشه‌ی آسمان شب
                      </p>
                      <div
                        className={[
                          'mx-auto flex aspect-square items-center justify-center rounded-full border p-2',
                          isGold
                            ? 'border-[#c8a85f]/40'
                            : 'border-[#101a35]/15',
                        ].join(' ')}
                      >
                        <img
                          src={
                            isGold
                              ? '/images/gold-constellation.png'
                              : '/images/monochrome-constellation.png'
                          }
                          alt={t(`styles.${i}.label`)}
                          className={[
                            'size-full object-contain',
                            !isGold ? 'opacity-85' : '',
                          ].join(' ')}
                        />
                      </div>
                      <p
                        className={[
                          'mt-2 text-center text-[8px] font-semibold leading-tight',
                          isGold ? 'text-[#f2e7be]' : 'text-[#101a35]',
                        ].join(' ')}
                      >
                        {data.title || 'بلندترین شب، کنار تو'}
                      </p>
                      <p
                        className={[
                          'mt-0.5 text-center text-[7px]',
                          isGold ? 'text-white/50' : 'text-[#101a35]/50',
                        ].join(' ')}
                      >
                        {data.names || 'مریم و جلال'}
                      </p>
                    </div>
                    {/* Label + selection indicator */}
                    <div className="flex w-full items-center justify-between px-1">
                      <span
                        className={
                          isSelected
                            ? 'text-sm font-medium text-white'
                            : 'text-sm text-white/55'
                        }
                      >
                        {t(`styles.${i}.label`)}
                      </span>
                      <span
                        className={[
                          'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                          isSelected
                            ? 'border-[#CEB47B] bg-[#CEB47B]'
                            : 'border-white/20',
                        ].join(' ')}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 10 8"
                            className="size-3 fill-[#0c142b]"
                          >
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Frame toggles */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium text-white/80">{t('frameLabel')}</p>
        <Controller
          control={control}
          name="showDate"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5">
              <div>
                <p className="text-sm text-white/80">{t('showDate')}</p>
                {showDate && (
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {moment.day} {moment.month} {moment.year}
                    {moment.time && !moment.noExactTime
                      ? ` · ساعت ${moment.time}`
                      : ''}
                  </p>
                )}
              </div>
              <Checkbox
                id="showDate"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/30 data-[state=checked]:bg-[#CEB47B] data-[state=checked]:border-[#CEB47B] data-[state=checked]:text-[#0c142b]"
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="showCity"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5">
              <div>
                <p className="text-sm text-white/80">{t('showCity')}</p>
                {showCity && (
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {moment.city} · {t('showCityNote')}
                  </p>
                )}
              </div>
              <Checkbox
                id="showCity"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/30 data-[state=checked]:bg-[#CEB47B] data-[state=checked]:border-[#CEB47B] data-[state=checked]:text-[#0c142b]"
              />
            </div>
          )}
        />
      </div>

      {/* Free copy note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-white/30" />
        <p className="text-[11px] leading-5 text-white/40">{t('freeCopy')}</p>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-13 flex-1 rounded-2xl border-white/20 bg-transparent text-white/60 hover:bg-white/5 gap-2"
          onClick={onBack}
        >
          <ArrowRight className="size-4" />
          {t('ctaBack')}
        </Button>
        <Button
          type="submit"
          className="h-13 flex-[2] rounded-2xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
        >
          {t('ctaNext')}
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/30">
        <ShieldCheck className="size-3.5" />
        {tStep1('noAccount')}
      </p>
    </form>
  );
}
