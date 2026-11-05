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
import { ArrowLeft, ArrowRight, Palette, Pencil, PenLine, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  personalizeSchema,
  type PersonalizeValues,
} from '@/features/poster/lib/schemas';
import type { PersonalizeData, MomentData } from './CreateStepper';
import { FramePicker } from './FramePicker';
import { PersonalizeSection } from './PersonalizeSection';
import { PersonalizeTextField } from './PersonalizeTextField';
import { SkyDetails } from './SkyDetails';
import { StylePicker } from './StylePicker';
import { TemplatePicker } from './TemplatePicker';
import { ToggleChip } from './ToggleChip';

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

  const { control, handleSubmit, setValue } = useForm<PersonalizeValues>({
    resolver: zodResolver(personalizeSchema),
    defaultValues: {
      title: data.title,
      names: data.names,
      quote: data.quote,
      style: data.style,
      template: data.template,
      frame: data.frame,
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
    watched.frame,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Step label + title */}
      <div className="space-y-2 pb-1">
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-sm leading-7 text-white/55">
          {t('description', { city: moment.city })}
        </p>
      </div>

      {/* Moment summary row */}
      <div className="flex items-center justify-between rounded-xl bg-[#142039] p-3">
        <span className="text-sm text-[#AAB6CD]">{momentSummary}</span>
        <Button
          type="button"
          variant="link"
          onClick={onEditMoment ?? onBack}
          className="cursor-pointer gap-1 text-xs text-[#CEB47B] transition-colors hover:text-[#e0c180]"
        >
          <Pencil className="size-3" />
          {t('editLabel')}
        </Button>
      </div>

      {/* The poster's words */}
      <PersonalizeSection icon={PenLine} title={t('sections.text')}>
        {/* Starting ideas: an empty text box is the main place people stall */}
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-[#E8D9B8]">{t('ideas.label')}</p>
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

        <PersonalizeTextField
          control={control}
          name="title"
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
        />
        <PersonalizeTextField
          control={control}
          name="names"
          label={t('namesLabel')}
          placeholder={t('namesPlaceholder')}
        />
        <PersonalizeTextField
          control={control}
          name="quote"
          label={t('quoteLabel')}
          placeholder={t('quotePlaceholder')}
          hint={t('quoteHint')}
        />
      </PersonalizeSection>

      {/* How the poster looks */}
      <PersonalizeSection icon={Palette} title={t('sections.look')}>
        <Controller
          control={control}
          name="template"
          render={({ field }) => (
            <TemplatePicker value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="style"
          render={({ field }) => (
            <StylePicker value={field.value} onChange={field.onChange} />
          )}
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

        <fieldset className="min-w-0">
          <legend className="mb-2.5 p-0 text-[13px] font-medium text-[#E8D9B8]">
            {t('frameLabel')}
          </legend>
          <div className="flex flex-wrap gap-2">
            <Controller
              control={control}
              name="showDate"
              render={({ field }) => (
                <ToggleChip pressed={field.value} onPressedChange={field.onChange}>
                  {t('showDate')}
                </ToggleChip>
              )}
            />
            <Controller
              control={control}
              name="showCity"
              render={({ field }) => (
                <ToggleChip pressed={field.value} onPressedChange={field.onChange}>
                  {t('showCity')}
                </ToggleChip>
              )}
            />
          </div>
        </fieldset>
      </PersonalizeSection>

      {/* What the sky map shows: optional, folded away */}
      <SkyDetails
        control={control}
        layers={layers}
        startOpen={!!data.layers?.constellationArt}
      />

      {/* CTA buttons */}
      <div className="flex gap-3 pt-2">
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
