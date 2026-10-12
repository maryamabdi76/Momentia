'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  Search,
  Check,
  MapPin,
  Clock,
  ArrowLeft,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchCities, type City } from '@/features/poster/lib/cities';
import {
  JALALI_DAYS,
  JALALI_MONTHS,
  JALALI_YEARS,
  DEFAULT_TIME,
} from '@/features/poster/lib/calendar';
import { momentSchema, type MomentValues } from '@/features/poster/lib/schemas';
import type { MomentData } from './CreateStepper';

type Props = {
  data: MomentData;
  onChange: (d: MomentData) => void;
  onNext: () => void;
};

export function Step1Moment({ data, onChange, onNext }: Props) {
  const t = useTranslations('CreatePage.step1');
  const [citySearch, setCitySearch] = useState(data.city);

  const filteredCities = searchCities(citySearch);

  const { control, handleSubmit, setValue, watch } = useForm<MomentValues>({
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

  const noExactTime = watch('noExactTime');
  const selectedCity = watch('city');

  // Live-sync every field change to parent so the poster preview updates in real time
  const watched = useWatch({ control });
  useEffect(() => {
    onChange(watched as MomentValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched.city,
    watched.day,
    watched.month,
    watched.year,
    watched.time,
    watched.noExactTime,
  ]);

  function selectCity(c: City) {
    setValue('city', c.name, { shouldValidate: true });
    setValue('timezone', c.tz);
    setCitySearch(c.name);
    onChange({ ...data, city: c.name, timezone: c.tz });
  }

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          {t('description')}
        </p>
      </div>

      {/* Occasion chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#AAB6CD]">{t('occasionLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => applyOccasion(o.day, o.month, o.year)}
              className="flex items-center gap-2 rounded-full border border-[#CEB47B]/60 px-4 py-2 text-sm text-[#CEB47B] transition-colors hover:bg-[#CEB47B]/10"
            >
              <Sparkles className="size-3" />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* City field */}
      <div>
        <Label className="mb-2.5 text-sm font-medium text-white/80">
          {t('cityLabel')}
        </Label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 end-4 z-10 flex items-center">
            <Search className="size-4 text-white/50" />
          </div>
          <Input
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder={data.city}
            className="h-14 rounded-xl border-[#33415B] bg-transparent ps-4 pe-11 text-base text-white placeholder:text-white/40 focus-visible:border-[#CEB47B]/50 focus-visible:ring-[#CEB47B]/15"
          />
        </div>
        {/* city list */}
        <ul className="mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-[#0c1a38] divide-y divide-white/[0.06]">
          {filteredCities.slice(0, 3).map((c) => {
            const isSelected = c.name === selectedCity;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseDown={() => selectCity(c)}
                  className={[
                    'flex w-full items-center gap-3 px-4 py-3.5 text-right text-sm transition-colors hover:bg-white/5',
                    isSelected ? 'bg-white/[0.06]' : '',
                  ].join(' ')}
                >
                  {isSelected ? (
                    <Check className="size-4 shrink-0 text-[#CEB47B]" />
                  ) : (
                    <MapPin className="size-4 shrink-0 text-white/25" />
                  )}
                  <span
                    className={
                      isSelected ? 'font-semibold text-white' : 'text-white/80'
                    }
                  >
                    {c.name}
                  </span>
                  <span className="mr-auto text-xs text-white/35">
                    {c.province} · {t('iran')}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11px] leading-5 text-white/30">
          {t('cityNote')}
        </p>
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <>
              {field.value && (
                <p className="mt-1 text-[11px] text-white/35">
                  {t('timezoneNote')} {field.value}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Date pickers */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-white/80">
          {t('dateLabel')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {/* Day */}
          <div>
            <p className="mb-1.5 text-xs text-white/40">{t('day')}</p>
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
          {/* Month */}
          <div>
            <p className="mb-1.5 text-xs text-white/40">{t('month')}</p>
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
          {/* Year */}
          <div>
            <p className="mb-1.5 text-xs text-white/40">{t('year')}</p>
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
      </div>

      {/* Time */}
      <div>
        <Label className="mb-2.5 text-sm font-medium text-white/80">
          {t('timeLabel')}
        </Label>
        <Controller
          control={control}
          name="time"
          render={({ field }) => (
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 end-4 z-10 flex items-center">
                <Clock className="size-4 text-white/50" />
              </div>
              <Input
                {...field}
                disabled={noExactTime}
                placeholder={DEFAULT_TIME}
                className="h-14 rounded-xl border-[#33415B] bg-transparent ps-4 pe-11 text-base text-white placeholder:text-white/35 focus-visible:border-[#CEB47B]/50 focus-visible:ring-[#CEB47B]/15 disabled:opacity-40"
              />
            </div>
          )}
        />
        <p className="mt-2 text-[11px] leading-5 text-white/30">
          {t('timeNote')}
        </p>
        <Controller
          control={control}
          name="noExactTime"
          render={({ field }) => (
            <div className="mt-3 flex items-center gap-2.5">
              <Checkbox
                id="noExactTime"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/30 data-[state=checked]:bg-[#CEB47B] data-[state=checked]:border-[#CEB47B] data-[state=checked]:text-[#0c142b]"
              />
              <Label
                htmlFor="noExactTime"
                className="cursor-pointer text-xs text-white/55 font-normal"
              >
                {t('noTimeLabel')}
              </Label>
            </div>
          )}
        />
      </div>

      {/* Night note */}
      <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-xs leading-6 text-white/45">
        <Moon className="mt-0.5 size-4 shrink-0 text-[#CEB47B]" />
        <span>{t('nightNote')}</span>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        className="h-14 w-full rounded-2xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
      >
        {t('cta')}
        <ArrowLeft className="size-4" />
      </Button>

      <p className="text-center text-xs text-white/30">{t('noAccount')}</p>
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
      <SelectTrigger className="h-12 w-full rounded-xl border-white/15 bg-white/[0.06] text-sm text-white focus-visible:border-[#CEB47B]/50 focus-visible:ring-[#CEB47B]/15 [&>svg]:text-white/40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#0c1a38] border-white/15 text-white max-h-64">
        {options.map((o) => (
          <SelectItem
            key={o}
            value={o}
            className="text-white/80 focus:bg-white/10 focus:text-white"
          >
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
