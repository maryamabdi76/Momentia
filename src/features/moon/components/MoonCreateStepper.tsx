'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Stepper, type StepItem, type StepStatus } from '@/components/ui/stepper';
import { storePremiumToken } from '@/features/payments/lib/client';
import { Step1Moment } from '@/features/poster/components/Step1Moment';
import { Step3Receive, Step3ReceiveInfo } from '@/features/poster/components/Step3Receive';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { isPosterStyle } from '@/features/poster/lib/themes';
import { useMoonExport } from '../hooks/use-moon-export';
import { loadMoonDraft } from '../lib/draft';
import type { MoonPosterData } from '../lib/moon-svg';
import type { MoonPersonalizeValues } from '../lib/schemas';
import { MoonPreview } from './MoonPreview';
import { MoonStep2 } from './MoonStep2';

const STEP_COUNT = 3;

const DEFAULT_MOMENT: MomentData = {
  city: 'تهران',
  timezone: 'Asia/Tehran',
  day: '30',
  month: 'آذر',
  year: '1405',
  time: '21:00',
  noExactTime: false,
};

const DEFAULT_PERSONAL: MoonPersonalizeValues = {
  title: 'ماهِ همان شب',
  names: 'مریم و جلال',
  quote: 'همان ماه، همان شب؛ برای همیشه.',
  style: 'gold',
  showDate: true,
  showCity: true,
  showDetails: true,
  showStars: true,
};

function parseStep(value: string | null): number {
  const n = Number(value ?? '1');
  return Number.isInteger(n) && n >= 1 && n <= STEP_COUNT ? n : 1;
}

function StepperInner() {
  const t = useTranslations('CreatePage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = parseStep(searchParams.get('step'));

  const [moment, setMoment] = useState<MomentData>(DEFAULT_MOMENT);
  // /moon?style=violet (from the posters page) picks the starting look
  const [personal, setPersonal] = useState<MoonPersonalizeValues>(() => {
    const style = searchParams.get('style');
    return { ...DEFAULT_PERSONAL, ...(isPosterStyle(style) ? { style } : {}) };
  });

  // Coming back from the payment gateway: /moon?step=3&pay=ok#pt=<token>.
  const [payResult, setPayResult] = useState<'ok' | 'cancelled' | 'failed' | null>(null);
  useEffect(() => {
    const pay = new URLSearchParams(window.location.search).get('pay');
    if (pay !== 'ok' && pay !== 'cancelled' && pay !== 'failed') return;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('pt');
    const verified = pay === 'ok' && !!token;
    if (verified) storePremiumToken(token);

    const draft = loadMoonDraft();
    if (draft) {
      setMoment(draft.moment);
      setPersonal({ ...DEFAULT_PERSONAL, ...draft.personal });
    }
    setPayResult(verified || pay !== 'ok' ? pay : 'failed');
    window.history.replaceState(null, '', '/moon?step=3');
  }, []);

  function goTo(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(n));
    router.push(`/moon?${params.toString()}`);
  }

  const { city, day, month, year, time, noExactTime } = moment;
  const moonSky = useMemo(
    () => skyForMoment({ city, day, month, year, time, noExactTime }),
    [city, day, month, year, time, noExactTime],
  );
  const sky = moonSky?.sky ?? null;

  const poster: MoonPosterData = {
    ...personal,
    city: moment.city,
    dateLabel: toPersianDigits(`${moment.day} ${moment.month} ${moment.year}`),
    timeLabel: moment.noExactTime ? '' : toPersianDigits(moment.time),
  };

  const exporter = useMoonExport(poster, sky, { moment, personal });

  const stepItems: StepItem[] = [1, 2, 3].map((n) => {
    const status: StepStatus = step === n ? 'active' : step > n ? 'done' : 'upcoming';
    return { label: t(`steps.${n}`), status };
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
          <section className="col-span-1">
            {step === 1 && (
              <Step1Moment data={moment} onChange={setMoment} onNext={() => goTo(2)} />
            )}
            {step === 2 && (
              <MoonStep2
                data={personal}
                moment={moment}
                onChange={setPersonal}
                onNext={() => goTo(3)}
                onBack={() => goTo(1)}
              />
            )}
            {step === 3 && (
              <Step3Receive
                personal={personal}
                moment={moment}
                exporter={exporter}
                payResult={payResult}
              />
            )}
          </section>

          <MoonPreview
            step={step}
            poster={poster}
            sky={sky}
            moment={moment}
            onBack={() => goTo(2)}
            exporter={exporter}
          />
        </div>

        {step === 3 && <Step3ReceiveInfo />}
      </div>
    </main>
  );
}

export function MoonCreateStepper() {
  return (
    <Suspense>
      <StepperInner />
    </Suspense>
  );
}
