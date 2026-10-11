'use client';

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { personalizeSchema, type PersonalizeValues } from '@/features/poster/lib/schemas';
import type { PersonalizeData, MomentData } from './CreateStepper';

type Props = {
  data: PersonalizeData;
  moment: MomentData;
  onChange: (d: PersonalizeData) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step2Personalize({ data, moment, onChange, onNext, onBack }: Props) {
  const t = useTranslations('CreatePage.step2');

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

  const style = watch('style');

  const onSubmit: SubmitHandler<PersonalizeValues> = (values) => {
    onChange(values);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#ceb47b]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          {t('description', { city: moment.city })}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2.5 block text-sm font-medium text-white/80">{t('titleLabel')}</label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                placeholder={t('titlePlaceholder')}
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#ceb47b]/50 focus:ring-2 focus:ring-[#ceb47b]/15 transition-colors"
              />
              {fieldState.error && (
                <p className="mt-1 text-[11px] text-red-400">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* Names */}
      <div>
        <label className="mb-2.5 block text-sm font-medium text-white/80">{t('namesLabel')}</label>
        <Controller
          control={control}
          name="names"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                placeholder={t('namesPlaceholder')}
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#ceb47b]/50 focus:ring-2 focus:ring-[#ceb47b]/15 transition-colors"
              />
              {fieldState.error && (
                <p className="mt-1 text-[11px] text-red-400">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* Quote */}
      <div>
        <label className="mb-2.5 block text-sm font-medium text-white/80">{t('quoteLabel')}</label>
        <Controller
          control={control}
          name="quote"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                placeholder={t('quotePlaceholder')}
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#ceb47b]/50 focus:ring-2 focus:ring-[#ceb47b]/15 transition-colors"
              />
              <p className="mt-1.5 text-[11px] text-white/35">{t('quoteHint')}</p>
              {fieldState.error && (
                <p className="mt-1 text-[11px] text-red-400">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* Style picker */}
      <div>
        <p className="mb-3 text-sm font-medium text-white/80">{t('styleLabel')}</p>
        <Controller
          control={control}
          name="style"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {(['mono', 'gold'] as const).map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => field.onChange(s)}
                  className={[
                    'rounded-xl border px-4 py-3 text-sm text-right transition-colors',
                    field.value === s
                      ? 'border-[#ceb47b]/70 bg-[#ceb47b]/10 text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/55 hover:border-white/30',
                  ].join(' ')}
                >
                  {t(`styles.${i}.label`)}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Frame toggles */}
      <div>
        <p className="mb-3 text-sm font-medium text-white/80">{t('frameLabel')}</p>
        <div className="space-y-3">
          <Controller
            control={control}
            name="showDate"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-white/65">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 accent-[#ceb47b]"
                />
                {t('showDate')}
              </label>
            )}
          />
          <Controller
            control={control}
            name="showCity"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-white/65">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 accent-[#ceb47b]"
                />
                {t('showCity')}
                <span className="text-[11px] text-white/30">{t('showCityNote')}</span>
              </label>
            )}
          />
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-2xl border-white/20 bg-transparent text-white/60 hover:bg-white/5 gap-2"
          onClick={onBack}
        >
          <ArrowRight className="size-4" />
          {t('ctaBack')}
        </Button>
        <Button
          type="submit"
          className="h-12 flex-[2] rounded-2xl bg-[#ceb47b] text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a] gap-2"
        >
          {t('ctaNext')}
          <ArrowLeft className="size-4" />
        </Button>
      </div>
    </form>
  );
}
