'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { MAP_LAYOUTS, MIN_MILESTONES, maxMilestones } from '../lib/map-svg';
import { mapProblems } from '../lib/problems';
import { MAX_LENGTH } from '../lib/sanitize';
import type { TreasureMapValues } from '../lib/schemas';
import { fieldClass } from './field-class';
import { Panel, StepHeader, Toggle } from '@/components/form/FormShell';
import { LayoutChoice } from './LayoutChoice';
import { MapIconPicker, Thumb } from './MapIconPicker';
import { PlacePicker } from './PlacePicker';

const EMPTY_MILESTONE = { title: '', city: '', date: '', art: 'love' as const };

type Props = {
  form: UseFormReturn<TreasureMapValues>;
  onNext: () => void;
};

/** Step 1: which map, and the places on it. */
export function MapStep1({ form, onNext }: Props) {
  const t = useTranslations('MapPage');
  const { control, register, setValue, getValues } = form;
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  // one moment is open at a time; the rest show as a one-line summary
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // a moment just added opens with its title focused
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const { fields, append, remove, move } = useFieldArray({ control, name: 'milestones' });
  const scope = useWatch({ control, name: 'scope' });
  const layout = useWatch({ control, name: 'layout' }) ?? 'single';
  const max = maxMilestones(layout);
  const milestones = useWatch({ control, name: 'milestones' }) ?? [];

  const problems = mapProblems({ layout, milestones });
  const complete = problems.length === 0;

  // the words are optional; a map layout needs the place picked on the map
  const isDone = (m: (typeof milestones)[number] | undefined) => layout === 'road' || (m?.lat !== undefined && m?.lon !== undefined);
  const doneCount = milestones.filter(isDone).length;
  const suggestions = (t.raw('titleSuggestions') as string[]) ?? [];

  const here = pickerFor !== null ? milestones[pickerFor] : undefined;
  const hasHere = here?.lat !== undefined && here?.lon !== undefined;
  const first = milestones.find((m) => m?.lat !== undefined && m?.lon !== undefined);

  return (
    <div className="space-y-6">
      <StepHeader title={t('step1.title')} description={t('step1.description')} />

      <Panel title={t('layoutLabel')}>
        <Controller
          control={control}
          name="layout"
          render={({ field: f }) => <LayoutChoice layouts={MAP_LAYOUTS} value={f.value ?? 'single'} onChange={f.onChange} />}
        />
      </Panel>

      {(layout === 'single' || layout === 'cards') && (
        <Panel title={t('areaTitle')}>
          <div className="grid gap-4 sm:grid-cols-2">
            {layout === 'single' && (
              <div className="space-y-1.5">
                <span className="text-[12px] text-[#AAB6CD]">{t('scopeLabel')}</span>
                <Controller
                  control={control}
                  name="scope"
                  render={({ field: f }) => (
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#0a1226]/80 p-1" role="radiogroup" aria-label={t('scopeLabel')}>
                      {(['city', 'iran'] as const).map((key) => (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={f.value === key}
                          onClick={() => f.onChange(key)}
                          className={`h-9 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60 ${f.value === key ? 'bg-[#CEB47B] font-bold text-[#0c142b]' : 'text-white/70 hover:bg-white/5'}`}
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
                <span className="text-[12px] text-[#AAB6CD]">{t('areaLabel')}</span>
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
          {layout === 'single' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle label={t('showAreaLabel')} inputProps={register('showArea')} />
              <Toggle label={t('showCoordsLabel')} inputProps={register('showCoords')} />
            </div>
          )}
        </Panel>
      )}

      <Panel title={t('milestonesTitle')} hint={t('milestonesHint')}>
        <div className="flex items-center justify-between gap-3 text-[12px] text-[#AAB6CD]">
          <span>
            {t('moment.progress', { done: toPersianDigits(String(doneCount)), total: toPersianDigits(String(milestones.length)) })}
          </span>
          <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <span
              className="block h-full rounded-full bg-[#CEB47B] transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${milestones.length ? (doneCount / milestones.length) * 100 : 0}%` }}
            />
          </span>
        </div>
        {/* the moments hang on one dashed route, in the order they will be drawn */}
        <ol className="space-y-3">
          {fields.map((field, i) => {
            const m = milestones[i];
            const picked = m?.lat !== undefined;
            const done = isDone(m);
            const open = openIndex === i;
            const summary = [m?.city, m?.date].filter(Boolean).join(' · ');
            return (
              <li key={field.id} className="relative ps-14">
                {i < fields.length - 1 && <span aria-hidden className="absolute bottom-[-0.75rem] start-[1.375rem] top-12 border-s-2 border-dashed border-[#CEB47B]/35" />}
                <span
                  className={`absolute start-0 top-1.5 flex size-11 items-center justify-center rounded-full border-2 bg-[#F6F0E4] p-1 text-[#0c142b] transition-colors ${done ? 'border-[#CEB47B]' : 'border-white/20'}`}
                >
                  {layout === 'road' ? <Thumb value={{ icon: m?.icon, art: m?.art, pen: m?.pen }} /> : <MapPin className={`size-5 ${picked ? 'text-[#B4513C]' : 'opacity-40'}`} aria-hidden />}
                </span>
                <div className={`rounded-2xl border transition-colors ${open ? 'border-[#CEB47B]/60 bg-[#CEB47B]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-1 p-1.5">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-start hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">{m?.title?.trim() || t('moment.untitled', { n: toPersianDigits(String(i + 1)) })}</span>
                        <span className="block truncate text-[12px] text-[#AAB6CD]">{summary || t('moment.empty')}</span>
                      </span>
                      {done ? (
                        <Check className="size-4 shrink-0 text-emerald-400" aria-label={t('moment.done')} />
                      ) : (
                        <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] text-amber-300">{t('moment.incomplete')}</span>
                      )}
                      <ChevronDown className={`size-4 shrink-0 text-[#AAB6CD] transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        aria-label={t('moment.moveUp')}
                        disabled={i === 0}
                        onClick={() => {
                          move(i, i - 1);
                          setOpenIndex(i - 1);
                        }}
                        className="rounded p-1 text-[#AAB6CD] hover:bg-white/5 hover:text-white disabled:opacity-25"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={t('moment.moveDown')}
                        disabled={i === fields.length - 1}
                        onClick={() => {
                          move(i, i + 1);
                          setOpenIndex(i + 1);
                        }}
                        className="rounded p-1 text-[#AAB6CD] hover:bg-white/5 hover:text-white disabled:opacity-25"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="space-y-4 border-t border-white/10 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor={`m-title-${field.id}`} className="text-[12px] text-[#AAB6CD]">
                            {t('milestoneTitle')}
                          </label>
                          <Input
                            id={`m-title-${field.id}`}
                            {...register(`milestones.${i}.title`)}
                            maxLength={MAX_LENGTH.momentTitle}
                            autoFocus={justAdded === i}
                            className={fieldClass}
                            placeholder={t('milestonePlaceholder')}
                          />
                          {!m?.title?.trim() && suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {suggestions.map((sug) => (
                                <button
                                  key={sug}
                                  type="button"
                                  onClick={() => setValue(`milestones.${i}.title`, sug, { shouldValidate: true, shouldDirty: true })}
                                  className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-[#E8D9B8] transition-colors hover:border-[#CEB47B]/60 hover:bg-[#CEB47B]/10"
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <label className="block space-y-1.5">
                          <span className="text-[12px] text-[#AAB6CD]">{t('milestonePlace')}</span>
                          <Input {...register(`milestones.${i}.city`)} maxLength={MAX_LENGTH.place} className={fieldClass} placeholder={t('placePlaceholder')} />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="text-[12px] text-[#AAB6CD]">{t('milestoneDate')}</span>
                          <Input {...register(`milestones.${i}.date`)} maxLength={MAX_LENGTH.date} className={fieldClass} placeholder={t('datePlaceholder')} />
                        </label>
                      </div>
                      {layout === 'road' ? (
                        <MapIconPicker
                          value={{ icon: m?.icon, art: m?.art, pen: m?.pen }}
                          onChange={(c) => {
                            setValue(`milestones.${i}.icon`, c.icon, { shouldDirty: true });
                            setValue(`milestones.${i}.art`, c.art, { shouldDirty: true });
                            setValue(`milestones.${i}.pen`, c.pen, { shouldDirty: true });
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPickerFor(i)}
                          className={`h-11 w-full gap-2 rounded-xl bg-transparent text-sm hover:bg-white/5 ${picked ? 'border-white/10 text-white/80' : 'border-dashed border-[#CEB47B]/60 text-[#CEB47B]'}`}
                        >
                          <MapPin className="size-4" />
                          {picked ? t('pickedOnMap') : t('pickOnMap')}
                        </Button>
                      )}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={fields.length <= MIN_MILESTONES}
                          onClick={() => {
                            remove(i);
                            setOpenIndex(null);
                          }}
                          className="h-8 gap-1 text-xs text-[#AAB6CD] hover:bg-white/5 hover:text-white"
                        >
                          <Trash2 className="size-3.5" />
                          {t('remove')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          <li className="relative ps-14">
            <span aria-hidden className="absolute start-0 top-0 flex size-11 items-center justify-center rounded-full border-2 border-dashed border-[#CEB47B]/50 text-[#CEB47B]">
              <Plus className="size-4" />
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={fields.length >= max}
              onClick={() => {
                setJustAdded(fields.length);
                append(EMPTY_MILESTONE);
                setOpenIndex(fields.length);
              }}
              className="h-11 w-full gap-2 rounded-xl border-dashed border-[#CEB47B]/50 bg-transparent text-sm text-[#CEB47B] hover:bg-[#CEB47B]/10"
            >
              {t('add')}
            </Button>
          </li>
        </ol>
        <p className="text-[11px] text-[#AAB6CD]">
          {t('limit', {
            min: toPersianDigits(String(MIN_MILESTONES)),
            max: toPersianDigits(String(max)),
          })}
        </p>
      </Panel>

      <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl border border-white/10 bg-[#0c142b]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur">
        <Button
          type="button"
          onClick={onNext}
          disabled={!complete}
          className="h-12 w-full gap-2 rounded-xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {t('step1.next')}
          <ArrowLeft className="size-4" />
        </Button>
        {problems.map((problem) => (
          <p key={problem} role="status" className="px-2 text-[12px] leading-6 text-[#E8D9B8]">
            {t(`problems.${problem}`, {
              min: toPersianDigits(String(MIN_MILESTONES)),
              max: toPersianDigits(String(max)),
            })}
          </p>
        ))}
        {problems.includes('tooMany') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              remove(Array.from({ length: fields.length - max }, (_, k) => max + k));
              setOpenIndex(0);
            }}
            className="h-8 border-[#CEB47B]/50 bg-transparent text-xs text-[#CEB47B] hover:bg-[#CEB47B]/10"
          >
            {t('problems.trim', { max: toPersianDigits(String(max)) })}
          </Button>
        )}
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
