'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Palette, Pencil, PenLine, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import { FramePicker } from '@/features/poster/components/FramePicker';
import { PersonalizeSection } from '@/features/poster/components/PersonalizeSection';
import { PersonalizeTextField } from '@/features/poster/components/PersonalizeTextField';
import { StylePicker } from '@/features/poster/components/StylePicker';
import { ToggleChip } from '@/features/poster/components/ToggleChip';
import { moonPersonalizeSchema, type MoonPersonalizeValues } from '../lib/schemas';

type Props = {
  data: MoonPersonalizeValues;
  moment: MomentData;
  onChange: (d: MoonPersonalizeValues) => void;
  onNext: () => void;
  onBack: () => void;
};

const TOGGLES = ['showDate', 'showCity', 'showDetails', 'showStars'] as const;

export function MoonStep2({ data, moment, onChange, onNext, onBack }: Props) {
  const t = useTranslations('MoonPage.step2');
  const tStep2 = useTranslations('CreatePage.step2');
  const tStep1 = useTranslations('CreatePage.step1');

  const { control, handleSubmit } = useForm<MoonPersonalizeValues>({
    resolver: zodResolver(moonPersonalizeSchema),
    defaultValues: data,
  });

  // keep the preview live while typing
  const watched = useWatch({ control });
  useEffect(() => {
    onChange(watched as MoonPersonalizeValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched.title,
    watched.names,
    watched.quote,
    watched.style,
    watched.frame,
    watched.showDate,
    watched.showCity,
    watched.showDetails,
    watched.showStars,
  ]);

  const summary = [
    moment.city,
    `${moment.day} ${moment.month} ${moment.year}`,
    !moment.noExactTime && moment.time ? `ساعت ${moment.time}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const onSubmit: SubmitHandler<MoonPersonalizeValues> = (values) => {
    onChange(values);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2 pb-1">
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-sm leading-7 text-white/55">{t('description')}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[#142039] p-3">
        <span className="text-sm text-[#AAB6CD]">{summary}</span>
        <Button
          type="button"
          variant="link"
          onClick={onBack}
          className="cursor-pointer gap-1 text-xs text-[#CEB47B] transition-colors hover:text-[#e0c180]"
        >
          <Pencil className="size-3" />
          {tStep2('editLabel')}
        </Button>
      </div>

      {/* The poster's words */}
      <PersonalizeSection icon={PenLine} title={tStep2('sections.text')}>
        <PersonalizeTextField
          control={control}
          name="title"
          label={tStep2('titleLabel')}
          placeholder={tStep2('titlePlaceholder')}
        />
        <PersonalizeTextField
          control={control}
          name="names"
          label={tStep2('namesLabel')}
          placeholder={tStep2('namesPlaceholder')}
        />
        <PersonalizeTextField
          control={control}
          name="quote"
          label={tStep2('quoteLabel')}
          placeholder={tStep2('quotePlaceholder')}
          hint={tStep2('quoteHint')}
        />
      </PersonalizeSection>

      {/* How the poster looks, and what is on it */}
      <PersonalizeSection icon={Palette} title={tStep2('sections.look')}>
        <Controller
          control={control}
          name="style"
          render={({ field }) => <StylePicker value={field.value} onChange={field.onChange} />}
        />
        <Controller
          control={control}
          name="frame"
          render={({ field }) => (
            <FramePicker
              value={field.value}
              onChange={field.onChange}
              style={watched.style ?? data.style}
            />
          )}
        />

        <fieldset className="min-w-0 space-y-2.5">
          <legend className="p-0 text-[13px] font-medium text-[#E8D9B8]">{t('showLabel')}</legend>
          <div className="flex flex-wrap gap-2">
            {TOGGLES.map((key) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field }) => (
                  <ToggleChip
                    pressed={field.value}
                    onPressedChange={field.onChange}
                    title={t(`toggles.${key}.hint`)}
                  >
                    {t(`toggles.${key}.label`)}
                  </ToggleChip>
                )}
              />
            ))}
          </div>
          <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('showHint')}</p>
        </fieldset>
      </PersonalizeSection>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2 py-6 text-[#E8D9B8] hover:text-[#E8D9B8]"
          onClick={onBack}
        >
          <ArrowRight className="size-4" />
          {tStep2('ctaBack')}
        </Button>
        <Button
          type="submit"
          className="flex-1 gap-2 bg-[#CEB47B] py-6 text-base font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {tStep2('ctaNext')}
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[#AAB6CD]">
        <ShieldCheck className="size-3.5" />
        {tStep1('noAccount')}
      </p>
    </form>
  );
}
