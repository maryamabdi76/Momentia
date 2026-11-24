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
import { ArrowLeft, ArrowRight, Baby, Cake, Gem, Heart, Moon, Palette, Pencil, PenLine, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { ActionBar, StepHeader, ctaPrimary, ctaSecondary } from '@/components/form/FormShell';
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

/** One icon for each starting idea, in the order of `ideas.items`. */
const IDEA_ICONS = [Heart, Cake, Sparkles, Baby, Gem, Moon] as const;

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <StepHeader title={t('title')} description={t('description', { city: moment.city })} />

      {/* Moment summary row */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2">
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
          {/* a row of cards that scrolls sideways, each showing the sentence it would write */}
          <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 md:-mx-7 md:px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const Icon = IDEA_ICONS[i] ?? Sparkles;
              const on = watched.title === t(`ideas.items.${i}.title`) && watched.quote === t(`ideas.items.${i}.quote`);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setValue('title', t(`ideas.items.${i}.title`), { shouldDirty: true });
                    setValue('quote', t(`ideas.items.${i}.quote`), { shouldDirty: true });
                  }}
                  className={cn(
                    'flex w-40 shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-2xl border p-3.5 text-start outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60 motion-reduce:transition-none',
                    on
                      ? 'border-[#CEB47B] bg-[#CEB47B]/10 shadow-[0_0_0_3px_rgba(206,180,123,0.14)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full',
                      on ? 'bg-[#CEB47B] text-[#0c142b]' : 'bg-[#CEB47B]/15 text-[#CEB47B]',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-bold text-[#F1E5C8]">{t(`ideas.items.${i}.label`)}</span>
                  <span className="line-clamp-2 text-[11px] leading-5 text-[#AAB6CD]">{t(`ideas.items.${i}.quote`)}</span>
                </button>
              );
            })}
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
      <ActionBar>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className={`${ctaSecondary} flex-1`} onClick={onBack}>
            <ArrowRight className="size-4" />
            {t('ctaBack')}
          </Button>
          <Button type="submit" className={`${ctaPrimary} flex-[1.4]`}>
            {t('ctaNext')}
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </ActionBar>

      <p className="flex items-center justify-start gap-1.5 text-xs text-[#AAB6CD]">
        <ShieldCheck className="size-3.5" />
        {tStep1('noAccount')}
      </p>
    </form>
  );
}
