'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { MAP_LAYOUTS, MIN_MILESTONES, maxMilestones } from '../lib/map-svg';
import type { TreasureMapValues } from '../lib/schemas';
import { choiceClass, fieldClass } from './field-class';
import { PlacePicker } from './PlacePicker';

const EMPTY_MILESTONE = { title: '', city: '', date: '' };

type Props = {
  form: UseFormReturn<TreasureMapValues>;
  onNext: () => void;
};

/** Step 1: which map, and the places on it. */
export function MapStep1({ form, onNext }: Props) {
  const t = useTranslations('MapPage');
  const { control, register, setValue, getValues } = form;
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });
  const scope = useWatch({ control, name: 'scope' });
  const layout = useWatch({ control, name: 'layout' }) ?? 'single';
  const max = maxMilestones(layout);
  const milestones = useWatch({ control, name: 'milestones' }) ?? [];

  const complete =
    milestones.length >= MIN_MILESTONES &&
    milestones.length <= max &&
    milestones.every((m) => m?.title?.trim() && m?.city?.trim() && m?.lat !== undefined && m?.lon !== undefined);

  const here = pickerFor !== null ? milestones[pickerFor] : undefined;
  const hasHere = here?.lat !== undefined && here?.lon !== undefined;
  const first = milestones.find((m) => m?.lat !== undefined && m?.lon !== undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-[#CEB47B]">{t('step1.stepLabel')}</p>
        <h1 className="text-3xl font-bold text-white">{t('step1.title')}</h1>
        <p className="text-sm leading-7 text-white/55">{t('step1.description')}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#33415B] bg-[#142039] p-5">
        <div className="space-y-2">
          <span className="text-[13px] font-medium text-[#E8D9B8]">{t('layoutLabel')}</span>
          <Controller
            control={control}
            name="layout"
            render={({ field: f }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('layoutLabel')}>
                {MAP_LAYOUTS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={f.value === key}
                    onClick={() => f.onChange(key)}
                    className={`h-auto min-h-10 py-2 ${choiceClass(f.value === key)}`}
                  >
                    {t(`layout.${key}.label`)}
                  </button>
                ))}
              </div>
            )}
          />
          <p className="text-[11px] leading-5 text-[#AAB6CD]">{t(`layout.${layout}.hint`)}</p>
        </div>
        {layout === 'single' && (
        <div className="space-y-2">
          <span className="text-[13px] font-medium text-[#E8D9B8]">{t('scopeLabel')}</span>
          <Controller
            control={control}
            name="scope"
            render={({ field: f }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('scopeLabel')}>
                {(['city', 'iran'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={f.value === key}
                    onClick={() => f.onChange(key)}
                    className={choiceClass(f.value === key)}
                  >
                    {t(`scope.${key}`)}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
        )}
        {(layout === 'cards' || scope !== 'iran') && (
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-[#E8D9B8]">{t('areaLabel')}</span>
            <select {...register('area')} className={fieldClass}>
              {IRAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#CEB47B]">{t('milestonesTitle')}</h2>
        <ol className="space-y-3">
          {fields.map((field, i) => {
            const picked = milestones[i]?.lat !== undefined;
            return (
              <li key={field.id} className="rounded-2xl border border-[#33415B] bg-[#142039] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#CEB47B] text-xs font-bold text-[#0c142b]">
                    {toPersianDigits(String(i + 1))}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={fields.length <= MIN_MILESTONES}
                    onClick={() => remove(i)}
                    className="h-8 gap-1 text-xs text-[#AAB6CD] hover:bg-white/5 hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                    {t('remove')}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-[12px] text-[#AAB6CD]">{t('milestoneTitle')}</span>
                    <Input
                      {...register(`milestones.${i}.title`)}
                      maxLength={24}
                      className={fieldClass}
                      placeholder={t('milestonePlaceholder')}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] text-[#AAB6CD]">{t('milestonePlace')}</span>
                    <Input
                      {...register(`milestones.${i}.city`)}
                      maxLength={22}
                      className={fieldClass}
                      placeholder={t('placePlaceholder')}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] text-[#AAB6CD]">{t('milestoneDate')}</span>
                    <Input
                      {...register(`milestones.${i}.date`)}
                      maxLength={18}
                      className={fieldClass}
                      placeholder={t('datePlaceholder')}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPickerFor(i)}
                      className={`h-10 w-full gap-2 bg-transparent text-sm hover:bg-white/5 ${picked ? 'border-[#33415B] text-white/80' : 'border-dashed border-[#CEB47B]/60 text-[#CEB47B]'}`}
                    >
                      <MapPin className="size-4" />
                      {picked ? t('pickedOnMap') : t('pickOnMap')}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <Button
          type="button"
          variant="outline"
          disabled={fields.length >= max}
          onClick={() => append(EMPTY_MILESTONE)}
          className="h-10 w-full gap-2 border-dashed border-[#CEB47B]/50 bg-transparent text-sm text-[#CEB47B] hover:bg-[#CEB47B]/10"
        >
          <Plus className="size-4" />
          {t('add')}
        </Button>
        <p className="text-[11px] text-[#AAB6CD]">
          {t('limit', {
            min: toPersianDigits(String(MIN_MILESTONES)),
            max: toPersianDigits(String(max)),
          })}
        </p>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          onClick={onNext}
          disabled={!complete}
          className="h-12 w-full gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {t('step1.next')}
          <ArrowLeft className="size-4" />
        </Button>
        {milestones.length > max && (
          <p className="text-[12px] leading-6 text-[#E8D9B8]">{t('layout.tooMany', { max: toPersianDigits(String(max)) })}</p>
        )}
        {!complete && <p className="text-[12px] leading-6 text-[#E8D9B8]">{t('step1.incomplete')}</p>}
      </div>

      <PlacePicker
        open={pickerFor !== null}
        wholeCountry={layout === 'single' && scope === 'iran'}
        onOpenChange={(o) => {
          if (!o) setPickerFor(null);
        }}
        start={
          hasHere
            ? { lat: here!.lat!, lon: here!.lon! }
            : first
              ? { lat: first.lat!, lon: first.lon! }
              : null
        }
        current={hasHere ? { lat: here!.lat!, lon: here!.lon! } : null}
        others={milestones
          .filter((m, i) => i !== pickerFor && m?.lat !== undefined && m?.lon !== undefined)
          .map((m) => ({ lat: m.lat!, lon: m.lon! }))}
        onPick={({ lat, lon, name }) => {
          if (pickerFor === null) return;
          setValue(`milestones.${pickerFor}.lat`, lat, { shouldValidate: true });
          setValue(`milestones.${pickerFor}.lon`, lon, { shouldValidate: true });
          const label = getValues(`milestones.${pickerFor}.city`);
          if (name && !label) {
            setValue(`milestones.${pickerFor}.city`, name.slice(0, 22), { shouldValidate: true });
          }
        }}
      />
    </div>
  );
}
