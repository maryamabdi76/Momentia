'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Crown, Download, Loader2, Lock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentDialog } from '@/features/payments/components/PaymentDialog';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { formatToman, toPersianDigits } from '@/features/poster/lib/digits';
import { useMapExport } from '../hooks/use-map-export';
import { loadMapDraft, saveMapDraft } from '../lib/draft';
import { MAX_MILESTONES, MIN_MILESTONES, type TreasureMapLabels } from '../lib/map-svg';
import { treasureMapSchema, type TreasureMapValues } from '../lib/schemas';
import { MapPoster } from './MapPoster';

const SAMPLE: TreasureMapValues = {
  title: 'جایی که قصهٔ ما رقم خورد',
  names: 'شیرین و فرهاد',
  scope: 'city',
  area: 'تهران',
  theme: 'paper',
  shape: 'circle',
  milestones: [
    { title: 'اولین قرار', city: 'کافه نادری', date: '۱۴ مهر ۱۳۹۸' },
    { title: 'خواستگاری', city: 'پارک ملت', date: '۲ اردیبهشت ۱۴۰۰' },
    { title: 'جشن عروسی', city: 'باغ کتاب', date: '۲۰ شهریور ۱۴۰۰' },
  ],
};

const EMPTY_MILESTONE = { title: '', city: '', date: '' };

const fieldClass =
  'h-10 w-full rounded-lg border border-[#33415B] bg-[#0c142b] px-3 text-sm text-white placeholder:text-[#6f7c97] focus-visible:border-[#CEB47B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/30';

export function TreasureMapMaker() {
  const t = useTranslations('MapPage');
  const [ready, setReady] = useState(false);

  const { control, register, reset, setValue, getValues } = useForm<TreasureMapValues>({
    resolver: zodResolver(treasureMapSchema),
    defaultValues: SAMPLE,
    mode: 'onChange',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });
  const watched = useWatch({ control }) as Partial<TreasureMapValues>;

  // a map being edited before the payment trip comes back from this browser's storage
  useEffect(() => {
    const draft = loadMapDraft();
    if (draft) reset(draft);
    setReady(true);
  }, [reset]);

  const current = useMemo<TreasureMapValues>(
    () => ({
      title: watched.title || SAMPLE.title,
      names: watched.names ?? '',
      scope: watched.scope ?? 'city',
      area: watched.area ?? 'تهران',
      theme: watched.theme ?? 'paper',
      shape: watched.shape ?? 'circle',
      milestones: (watched.milestones ?? []).map((m) => ({
        title: m?.title || '…',
        city: m?.city || (watched.scope === 'iran' ? 'تهران' : '…'),
        date: m?.date ?? '',
      })),
    }),
    [watched],
  );

  const labels = useMemo<TreasureMapLabels>(
    () => ({
      kicker: t('poster.kicker'),
      count: t('poster.count', { count: toPersianDigits(String(current.milestones.length)) }),
      watermark: t('poster.watermark'),
      alt: t('poster.alt'),
      north: t('poster.north'),
    }),
    [t, current.milestones.length],
  );

  const exporter = useMapExport(current, labels, current);
  const valid = treasureMapSchema.safeParse(current).success;

  // keep what was typed, so closing the tab to pay does not lose it
  useEffect(() => {
    if (ready && valid) saveMapDraft(current);
  }, [ready, valid, current]);

  const busyIcon = (action: 'png' | 'svg') =>
    exporter.busy === action ? (
      <Loader2 className="size-4 animate-spin" />
    ) : exporter.premiumUnlocked ? (
      <Download className="size-4" />
    ) : (
      <Lock className="size-4" />
    );

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12 lg:py-12">
      <section className="min-w-0 space-y-6" aria-labelledby="map-heading">
        <div className="space-y-2">
          <p className="text-xs tracking-wide text-[#CEB47B]">{t('eyebrow')}</p>
          <h1 id="map-heading" className="text-2xl font-bold leading-tight sm:text-3xl">
            {t('heading')}
          </h1>
          <p className="text-sm leading-7 text-[#AAB6CD]">{t('intro')}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#33415B] bg-[#142039] p-5">
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
                      onClick={() => {
                        f.onChange(key);
                        // a city map names places; an Iran map picks cities, so start each over from a valid value
                        getValues('milestones').forEach((_, i) =>
                          setValue(`milestones.${i}.city`, key === 'iran' ? 'تهران' : '', { shouldValidate: true }),
                        );
                      }}
                      className={`h-10 rounded-lg border text-sm transition-colors ${f.value === key ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B]' : 'border-[#33415B] text-white/70 hover:bg-white/5'}`}
                    >
                      {t(`scope.${key}`)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          {watched.scope !== 'iran' && (
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
          {watched.scope !== 'iran' && (
            <div className="space-y-2">
              <span className="text-[13px] font-medium text-[#E8D9B8]">{t('shapeLabel')}</span>
              <Controller
                control={control}
                name="shape"
                render={({ field: f }) => (
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('shapeLabel')}>
                    {(['circle', 'heart'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={f.value === key}
                        onClick={() => f.onChange(key)}
                        className={`h-10 rounded-lg border text-sm transition-colors ${f.value === key ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B]' : 'border-[#33415B] text-white/70 hover:bg-white/5'}`}
                      >
                        {t(`shape.${key}`)}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          )}
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-[#E8D9B8]">{t('themeLabel')}</span>
            <Controller
              control={control}
              name="theme"
              render={({ field: f }) => (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('themeLabel')}>
                  {(['paper', 'blush', 'night'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={f.value === key}
                      onClick={() => f.onChange(key)}
                      className={`h-10 rounded-lg border text-sm transition-colors ${f.value === key ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B]' : 'border-[#33415B] text-white/70 hover:bg-white/5'}`}
                    >
                      {t(`theme.${key}`)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-[#E8D9B8]">{t('titleLabel')}</span>
            <Input {...register('title')} maxLength={40} className={fieldClass} placeholder={t('titlePlaceholder')} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-[#E8D9B8]">{t('namesLabel')}</span>
            <Input {...register('names')} maxLength={40} className={fieldClass} placeholder={t('namesPlaceholder')} />
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#CEB47B]">{t('milestonesTitle')}</h2>
          <ol className="space-y-3">
            {fields.map((field, i) => (
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
                    <span className="text-[12px] text-[#AAB6CD]">
                      {watched.scope === 'iran' ? t('milestoneCity') : t('milestonePlace')}
                    </span>
                    {watched.scope === 'iran' ? (
                      <select {...register(`milestones.${i}.city`)} className={fieldClass}>
                        {IRAN_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        {...register(`milestones.${i}.city`)}
                        maxLength={22}
                        className={fieldClass}
                        placeholder={t('placePlaceholder')}
                      />
                    )}
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
                </div>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= MAX_MILESTONES}
            onClick={() => append({ ...EMPTY_MILESTONE, city: getValues('scope') === 'iran' ? 'تهران' : '' })}
            className="h-10 w-full gap-2 border-dashed border-[#CEB47B]/50 bg-transparent text-sm text-[#CEB47B] hover:bg-[#CEB47B]/10"
          >
            <Plus className="size-4" />
            {t('add')}
          </Button>
          <p className="text-[11px] text-[#AAB6CD]">
            {t('limit', {
              min: toPersianDigits(String(MIN_MILESTONES)),
              max: toPersianDigits(String(MAX_MILESTONES)),
            })}
          </p>
        </div>
      </section>

      <aside className="min-w-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
        <MapPoster data={current} labels={labels} />

        <div className="space-y-4 rounded-2xl border border-[#CEB47B] bg-[#142039] p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-base font-bold text-[#CEB47B]">
              <Crown aria-hidden className="size-4" />
              {t('premium.title')}
            </p>
            <span className="rounded-full border border-[#CEB47B] px-2.5 py-0.5 text-[10px] text-[#CEB47B]">
              {t('premium.badge')}
            </span>
          </div>
          <PaymentDialog />
          <p className="text-[12px] leading-6 text-[#AAB6CD]">{t('premium.desc')}</p>
          <div className="flex flex-col gap-2.5">
            <Button
              type="button"
              onClick={exporter.downloadPng}
              disabled={!valid || exporter.busy !== null}
              className="h-11 w-full gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              {busyIcon('png')}
              {exporter.premiumUnlocked || !PREMIUM_PRICE_TOMAN
                ? t('premium.downloadPng')
                : t('premium.payBtn', { price: formatToman(PREMIUM_PRICE_TOMAN) })}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exporter.downloadSvg}
              disabled={!valid || exporter.busy !== null}
              className="h-11 w-full gap-2 border-[#33415B] bg-transparent text-sm text-white/80 hover:bg-white/5"
            >
              {busyIcon('svg')}
              {t('premium.downloadSvg')}
            </Button>
          </div>
          {!valid && (
            <p className="text-[12px] leading-6 text-[#E8D9B8]">{t('premium.incomplete')}</p>
          )}
          {exporter.notice && (
            <p role="alert" className="rounded-lg border border-red-300/30 px-3 py-2 text-[12px] leading-6 text-red-300">
              {exporter.notice === 'payment' ? t('premium.paymentUnavailable') : t('premium.error')}
            </p>
          )}
          <p className="text-center text-[11px] leading-5 text-[#AAB6CD]">{t('premium.note')}</p>
        </div>
      </aside>
    </main>
  );
}
