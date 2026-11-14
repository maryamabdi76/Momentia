'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Stepper, type StepItem, type StepStatus } from '@/components/ui/stepper';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { DEFAULT_FORMAT_ID, type ExportFormatId } from '@/features/poster/lib/export-formats';
import { useMapExport } from '../hooks/use-map-export';
import { loadMapDraft, saveMapDraft } from '../lib/draft';
import type { TreasureMapLabels } from '../lib/map-svg';
import { treasureMapSchema, type TreasureMapValues } from '../lib/schemas';
import { MapPreview } from './MapPreview';
import { MapStep1 } from './MapStep1';
import { MapStep2 } from './MapStep2';
import { MapStep3 } from './MapStep3';

const STEP_COUNT = 3;

const SAMPLE: TreasureMapValues = {
  title: 'جایی که قصهٔ ما رقم خورد',
  names: 'شیرین و فرهاد',
  layout: 'single',
  scope: 'city',
  area: 'تهران',
  theme: 'paper',
  shape: 'circle',
  frame: 'minimal',
  milestones: [
    { title: 'اولین قرار', city: 'پل طبیعت', date: '۱۴ مهر ۱۳۹۸', lat: 35.7611, lon: 51.4143 },
    { title: 'خواستگاری', city: 'برج آزادی', date: '۲ اردیبهشت ۱۴۰۰', lat: 35.6997, lon: 51.338 },
    { title: 'جشن عروسی', city: 'برج میلاد', date: '۲۰ شهریور ۱۴۰۰', lat: 35.7448, lon: 51.3753 },
  ],
};

function parseStep(value: string | null): number {
  const n = Number(value ?? '1');
  return Number.isInteger(n) && n >= 1 && n <= STEP_COUNT ? n : 1;
}

export function TreasureMapMaker() {
  const t = useTranslations('MapPage');
  const tSteps = useTranslations('MapPage.steps');
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams.get('step'));
  const [ready, setReady] = useState(false);
  const [format, setFormat] = useState<ExportFormatId>(DEFAULT_FORMAT_ID);

  // one form for all three steps, so nothing is lost when moving between them
  const form = useForm<TreasureMapValues>({
    resolver: zodResolver(treasureMapSchema),
    defaultValues: SAMPLE,
    mode: 'onChange',
  });
  const { control, reset } = form;
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
      layout: watched.layout ?? 'single',
      scope: watched.scope ?? 'city',
      area: watched.area ?? 'تهران',
      theme: watched.theme ?? 'paper',
      shape: watched.shape ?? 'circle',
      frame: watched.frame ?? 'minimal',
      milestones: (watched.milestones ?? []).map((m) => ({
        title: m?.title || '…',
        city: m?.city || '…',
        date: m?.date ?? '',
        lat: m?.lat,
        lon: m?.lon,
      })),
    }),
    [watched],
  );

  const labels = useMemo<TreasureMapLabels>(
    () => ({
      kicker: t('poster.kicker'),
      count: t('poster.count', { count: toPersianDigits(String(current.milestones.length)) }),
      watermark: t('poster.watermark'),
      credit: t('poster.credit'),
      iran: t('poster.iran'),
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

  function goTo(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(n));
    router.push(`/map?${params.toString()}`);
  }

  const stepItems: StepItem[] = [1, 2, 3].map((n) => {
    const status: StepStatus = step === n ? 'active' : step > n ? 'done' : 'upcoming';
    return { label: tSteps(String(n)), status };
  });

  return (
    <main className="flex-1">
      <div className="border-b border-[#33415B]">
        <div className="mx-auto flex items-center px-6 py-2 md:px-20">
          <Stepper steps={stepItems} onStepClick={(i) => goTo(i + 1)} ariaLabel={t('stepsNav')} />
        </div>
      </div>

      <div className="mx-auto px-6 py-10 md:px-20 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
          <section className="min-w-0">
            {ready && step === 1 && <MapStep1 form={form} onNext={() => goTo(2)} />}
            {ready && step === 2 && <MapStep2 form={form} onNext={() => goTo(3)} onBack={() => goTo(1)} />}
            {ready && step === 3 && (
              <MapStep3 exporter={exporter} format={format} onFormatChange={setFormat} valid={valid} />
            )}
          </section>
          <MapPreview step={step} data={current} labels={labels} format={format} onBack={() => goTo(2)} />
        </div>
      </div>
    </main>
  );
}
