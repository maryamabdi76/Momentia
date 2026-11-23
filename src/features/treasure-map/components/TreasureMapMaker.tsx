'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { DEFAULT_FORMAT_ID, type ExportFormatId } from '@/features/poster/lib/export-formats';
import { trackEvent } from '@/lib/track';
import { shareLink, type ShareApp } from '@/features/poster/lib/share-links';
import type { GiftStatus } from '@/features/poster/components/ShareActions';
import { useMapExport } from '../hooks/use-map-export';
import { useMapLabels } from '../hooks/use-map-labels';
import { mapGiftUrl } from '../lib/gift-link';
import { loadMapDraft, saveMapDraft } from '../lib/draft';
import { mapProblems } from '../lib/problems';
import { mapAspect } from '../lib/map-svg';
import { treasureMapSchema, type TreasureMapValues } from '../lib/schemas';
import { StepRoute } from '@/components/form/StepRoute';
import { MapPreview } from './MapPreview';

import { MobilePreview } from './MobilePreview';
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
  showArea: true,
  showCoords: false,
  milestones: [
    { title: 'اولین قرار', city: 'پل طبیعت', date: '۱۴ مهر ۱۳۹۸', art: 'cafe', lat: 35.7611, lon: 51.4143 },
    { title: 'خواستگاری', city: 'برج آزادی', date: '۲ اردیبهشت ۱۴۰۰', art: 'ring', lat: 35.6997, lon: 51.338 },
    { title: 'جشن عروسی', city: 'برج میلاد', date: '۲۰ شهریور ۱۴۰۰', art: 'cake', lat: 35.7448, lon: 51.3753 },
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
      // what is drawn and exported has no stray spaces around the words
      title: (watched.title ?? '').trim(),
      names: (watched.names ?? '').trim(),
      layout: watched.layout ?? 'single',
      scope: watched.scope ?? 'city',
      area: watched.area ?? 'تهران',
      theme: watched.theme ?? 'paper',
      shape: watched.shape ?? 'circle',
      frame: watched.frame ?? 'minimal',
      showArea: watched.showArea ?? true,
      showCoords: watched.showCoords ?? false,
      milestones: (watched.milestones ?? []).map((m) => ({
        title: (m?.title ?? '').trim(),
        city: (m?.city ?? '').trim(),
        date: (m?.date ?? '').trim(),
        lat: m?.lat,
        lon: m?.lon,
        icon: m?.icon,
        art: m?.art,
      })),
    }),
    [watched],
  );

  const labels = useMapLabels(current.milestones.length);

  const exporter = useMapExport(current, labels, current);
  const problems = mapProblems(current);
  const valid = problems.length === 0 && treasureMapSchema.safeParse(current).success;
  // a later step is only open once the map can be made: a link or a click cannot skip ahead
  const activeStep = problems.length > 0 ? 1 : step;

  // keep what was typed, so closing the tab to pay does not lose it
  useEffect(() => {
    if (ready && valid) saveMapDraft(current);
  }, [ready, valid, current]);

  const [giftStatus, setGiftStatus] = useState<GiftStatus>(null);
  const giftLink = () => mapGiftUrl(window.location.origin, current);

  async function copyGiftLink() {
    trackEvent('gift_link', { product: 'map' });
    try {
      await navigator.clipboard.writeText(giftLink());
      setGiftStatus('copied');
    } catch {
      setGiftStatus('error');
    }
  }

  function shareGift(app: ShareApp) {
    trackEvent('gift_share', { product: 'map', app });
    window.open(shareLink(app, t('step3.giftMessage'), giftLink()), '_blank', 'noopener,noreferrer');
  }

  function goTo(n: number) {
    if (n > 1 && problems.length > 0) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(n));
    router.push(`/map?${params.toString()}`);
  }

  const stepLabels = [1, 2, 3].map((n) => tSteps(String(n)));

  return (
    <main className="flex-1 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(206,180,123,0.08),transparent)]">
      <div className="border-b border-white/10 bg-[#0c142b]/80 backdrop-blur">
        <div className="mx-auto px-6 pb-3 pt-5 md:px-20">
          <StepRoute
            labels={stepLabels}
            step={activeStep}
            // only steps already passed can be opened by clicking, as before
            canOpen={(n) => n < activeStep}
            onOpen={goTo}
            ariaLabel={t('stepsNav')}
          />
        </div>
      </div>

      <div className="mx-auto px-6 py-10 md:px-20 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
          <section className="min-w-0">
            <div className="mb-6 md:hidden">
              <MobilePreview data={current} labels={labels} />
            </div>
            {ready && activeStep === 1 && <MapStep1 form={form} onNext={() => goTo(2)} />}
            {ready && activeStep === 2 && <MapStep2 form={form} onNext={() => goTo(3)} onBack={() => goTo(1)} />}
            {ready && activeStep === 3 && (
              <MapStep3
                exporter={exporter}
                format={format}
                onFormatChange={setFormat}
                valid={valid}
                problems={problems}
                data={current}
                onEdit={goTo}
                aspect={mapAspect(current.layout)}
              />
            )}
          </section>
          <MapPreview
            step={activeStep}
            data={current}
            labels={labels}
            format={format}
            onBack={() => goTo(2)}
            onCopyGift={copyGiftLink}
            giftStatus={giftStatus}
            onShareGift={shareGift}
          />
        </div>
      </div>
    </main>
  );
}
