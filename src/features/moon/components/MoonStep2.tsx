'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Pencil, ShieldCheck } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import { POSTER_STYLES, POSTER_THEMES, paperCss } from '@/features/poster/lib/themes';
import { moonPersonalizeSchema, type MoonPersonalizeValues } from '../lib/schemas';

type Props = {
  data: MoonPersonalizeValues;
  moment: MomentData;
  onChange: (d: MoonPersonalizeValues) => void;
  onNext: () => void;
  onBack: () => void;
};

const checkboxClass =
  'border-white/30 data-[state=checked]:border-[#CEB47B] data-[state=checked]:bg-[#CEB47B] data-[state=checked]:text-[#0c142b] dark:data-[state=checked]:border-[#CEB47B] dark:data-[state=checked]:bg-[#CEB47B]';
const inputGroupClass =
  'h-12 border-white/12 has-[[data-slot=input-group-control]:focus-visible]:border-[#CEB47B]/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[#CEB47B]/10';

const TEXT_FIELDS = [
  { name: 'title', hint: false },
  { name: 'names', hint: false },
  { name: 'quote', hint: true },
] as const;

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('description')}</p>
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

      {TEXT_FIELDS.map(({ name, hint }) => (
        <div key={name} className="space-y-1.5">
          <Label className="text-sm font-medium text-[#E8D9B8]">{tStep2(`${name}Label`)}</Label>
          <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
              <>
                <InputGroup className={inputGroupClass}>
                  <InputGroupAddon>
                    <Pencil className="size-4 text-white/25" />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    placeholder={tStep2(`${name}Placeholder`)}
                    className="h-12 text-right text-sm text-white placeholder:text-white/30"
                  />
                </InputGroup>
                {hint && <p className="text-[11px] text-[#AAB6CD]">{tStep2('quoteHint')}</p>}
                {fieldState.error && (
                  <p className="text-[11px] text-red-400">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      ))}

      <div className="space-y-3">
        <p className="text-sm font-medium text-[#E8D9B8]">{tStep2('styleLabel')}</p>
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
                const selected = field.value === s;
                return (
                  <Label
                    key={s}
                    htmlFor={`moon-style-${s}`}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 transition-colors',
                      selected ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8' : 'border-[#33415B]',
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
                          selected
                            ? 'text-sm font-medium text-white'
                            : 'text-sm font-normal text-white/55'
                        }
                      >
                        {tStep2(`styles.${s}`)}
                      </span>
                    </span>
                    <RadioGroupItem
                      value={s}
                      id={`moon-style-${s}`}
                      className="border-white/20 data-checked:border-[#CEB47B] data-checked:bg-[#CEB47B] dark:data-checked:border-[#CEB47B] dark:data-checked:bg-[#CEB47B] [&_[data-slot=radio-group-indicator]_span]:bg-[#0c142b]"
                    />
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        />
      </div>

      <div className="space-y-2.5">
        <div>
          <p className="text-sm font-medium text-[#E8D9B8]">{t('showLabel')}</p>
          <p className="mt-1 text-[11px] leading-6 text-[#AAB6CD]">{t('showHint')}</p>
        </div>
        {TOGGLES.map((key) => (
          <Controller
            key={key}
            control={control}
            name={key}
            render={({ field }) => (
              <div className="flex items-start gap-2 py-1.5">
                <Checkbox
                  id={`moon-${key}`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn('mt-1', checkboxClass)}
                />
                <Label
                  htmlFor={`moon-${key}`}
                  className="flex-col items-start gap-0.5 text-sm font-normal text-white"
                >
                  {t(`toggles.${key}.label`)}
                  <span className="text-[11px] leading-5 text-[#AAB6CD]">
                    {t(`toggles.${key}.hint`)}
                  </span>
                </Label>
              </div>
            )}
          />
        ))}
      </div>

      <div className="flex gap-3">
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
