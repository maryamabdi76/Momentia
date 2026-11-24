'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ArrowLeft, Moon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionBar, Panel, StepHeader, ctaPrimary } from '@/components/form/FormShell';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { CityCombobox } from './CityCombobox';
import { GregorianDateField } from './GregorianDateField';
import {
  JALALI_DAYS,
  JALALI_MONTHS,
  JALALI_YEARS,
  DEFAULT_TIME,
} from '@/features/poster/lib/calendar';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { momentSchema, type MomentValues } from '@/features/poster/lib/schemas';
import type { MomentData } from './CreateStepper';

type Props = {
  data: MomentData;
  onChange: (d: MomentData) => void;
  onNext: () => void;
};

function occasionIsActive(
  day: string,
  month: string,
  occasion: { day: string; month: string },
): boolean {
  return day === occasion.day && month === occasion.month;
}

export function Step1Moment({ data, onChange, onNext }: Props) {
  const t = useTranslations('CreatePage.step1');

  const { control, handleSubmit, setValue } = useForm<MomentValues>({
    resolver: zodResolver(momentSchema),
    defaultValues: {
      city: data.city,
      timezone: data.timezone,
      day: data.day,
      month: data.month as MomentValues['month'],
      year: data.year,
      time: data.time,
      noExactTime: data.noExactTime,
    },
  });

  const noExactTime = useWatch({ control, name: 'noExactTime' });

  // Live-sync every field change to parent so the poster preview updates in real time
  const watched = useWatch({ control });
  useEffect(() => {
    onChange(watched as MomentValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched.city,
    watched.timezone,
    watched.day,
    watched.month,
    watched.year,
    watched.time,
    watched.noExactTime,
  ]);

  function applyOccasion(day: string, month: string, year: string) {
    if (!day) return;
    setValue('day', day);
    setValue('month', month as MomentValues['month']);
    setValue('year', year);
    onChange({ ...data, day, month, year });
  }

  const onSubmit: SubmitHandler<MomentValues> = (values) => {
    onChange(values);
    onNext();
  };

  const occasions = [0, 1].map((i) => ({
    label: t(`occasions.${i}.label`),
    day: t(`occasions.${i}.day`),
    month: t(`occasions.${i}.month`),
    year: t(`occasions.${i}.year`),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <StepHeader title={t('title')} description={t('description')} />

      {/* City */}
      <Panel title={t('cityLabel')}>
      <div>
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <CityCombobox
              id="moment-city"
              value={field.value}
              placeholder={t('cityPlaceholder')}
              emptyLabel={t('cityEmpty')}
              missing={{ label: t('cityMissing'), href: '/contact?topic=city' }}
              provinceSuffix={t('iran')}
              onValueChange={(name, tz) => {
                field.onChange(name);
                setValue('timezone', tz, { shouldValidate: true });
              }}
            />
          )}
        />
        <p className="mt-2 text-sm leading-5 text-[#AAB6CD]">{t('cityNote')}</p>
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <>
              {field.value && (
                <p className="mt-1 text-sm text-[#AAB6CD]">
                  {t('timezoneNote')} {field.value}
                </p>
              )}
            </>
          )}
        />
      </div>

      </Panel>

      {/* The day: occasions, the three pickers, and a Gregorian shortcut */}
      <Panel title={t('dateLabel')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-[#AAB6CD]">{t('occasionLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((o) => {
            const selected = occasionIsActive(
              watched.day ?? data.day,
              watched.month ?? data.month,
              o,
            );
            return (
              <button
                key={o.label}
                type="button"
                aria-pressed={selected}
                onClick={() => applyOccasion(o.day, o.month, o.year)}
                className={cn(
                  'flex items-center cursor-pointer gap-2 rounded-full border px-4 py-2 text-base font-medium transition-colors',
                  selected
                    ? 'border-[#CEB47B] bg-[#CEB47B] text-[#0c142b] shadow-sm hover:bg-[#e0c180]'
                    : 'border-[#CEB47B]/60 text-[#CEB47B] hover:bg-[#CEB47B]/10',
                )}
              >
                <Sparkles className="size-3 shrink-0" />
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="mb-1.5 text-sm text-[#E8D9B8]">{t('day')}</p>
            <Controller
              control={control}
              name="day"
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  options={JALALI_DAYS}
                />
              )}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm text-[#E8D9B8]">{t('month')}</p>
            <Controller
              control={control}
              name="month"
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  options={JALALI_MONTHS as unknown as string[]}
                />
              )}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm text-[#E8D9B8]">{t('year')}</p>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  options={JALALI_YEARS}
                />
              )}
            />
          </div>
        </div>
        <GregorianDateField
          onPick={({ day, month, year }) => applyOccasion(day, month, year)}
        />
      </div>
      </Panel>

      {/* Time */}
      <Panel title={t('timeLabel')}>
      <div>
        <Controller
          control={control}
          name="time"
          render={({ field }) => (
            <TimePicker
              id="moment-time"
              value={field.value}
              onChange={field.onChange}
              disabled={noExactTime}
              placeholder={toPersianDigits(DEFAULT_TIME)}
              hourLabel={t('timeHour')}
              minuteLabel={t('timeMinute')}
            />
          )}
        />
        <p className="mt-2 text-sm leading-5 text-[#AAB6CD]">{t('timeNote')}</p>
        <Controller
          control={control}
          name="noExactTime"
          render={({ field }) => (
            <div className="mt-3 flex items-center gap-2.5">
              <Checkbox
                id="noExactTime"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked === true) {
                    setValue('time', DEFAULT_TIME, { shouldValidate: true });
                  }
                }}
                className="border-white data-[state=checked]:border-[#CEB47B] data-[state=checked]:bg-[#CEB47B] data-[state=checked]:text-[#0c142b] dark:data-[state=checked]:border-[#CEB47B] dark:data-[state=checked]:bg-[#CEB47B]"
              />
              <Label
                htmlFor="noExactTime"
                className="cursor-pointer text-sm text-white font-normal"
              >
                {t('noTimeLabel')}
              </Label>
            </div>
          )}
        />
      </div>
      </Panel>

      {/* Night note */}
      <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-[#AAB6CD]">
        <Moon className="mt-0.5 size-4 shrink-0 text-[#CEB47B]" />
        <span>{t('nightNote')}</span>
      </div>

      {/* CTA */}
      <ActionBar>
        <Button type="submit" className={`${ctaPrimary} w-full`}>
          {t('cta')}
          <ArrowLeft className="size-4" />
        </Button>
      </ActionBar>

      <p className="flex gap-2 text-sm text-[#AAB6CD]">
        <ShieldCheck className="size-4" /> {t('noAccount')}
      </p>
    </form>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#0a1226]/85 py-6! text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#0c1a38] border-white/15 text-white max-h-64">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
