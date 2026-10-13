'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Stepper,
  type StepItem,
  type StepStatus,
} from '@/components/ui/stepper';
import { skyForMoment } from '../lib/sky-for-moment';
import { CreatePreview } from './CreatePreview';
import type { PosterData, PosterStyle } from './PosterPreview';
import { Step1Moment } from './Step1Moment';
import { Step2Personalize } from './Step2Personalize';
import { Step3Receive } from './Step3Receive';

export type MomentData = {
  city: string;
  timezone: string;
  day: string;
  month: string;
  year: string;
  time: string;
  noExactTime: boolean;
};

export type PersonalizeData = {
  title: string;
  names: string;
  quote: string;
  style: PosterStyle;
  showDate: boolean;
  showCity: boolean;
};

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

const DEFAULT_PERSONALIZE: PersonalizeData = {
  title: 'بلندترین شب، کنار تو',
  names: 'مریم و جلال',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  style: 'gold',
  showDate: true,
  showCity: true,
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
  const [personal, setPersonal] =
    useState<PersonalizeData>(DEFAULT_PERSONALIZE);

  function goTo(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(n));
    router.push(`/create?${params.toString()}`);
  }

  // The real sky for the chosen city, date and time. Recomputed (a few ms) only
  // when one of those fields changes, not when the title or names are edited.
  const { city, day, month, year, time, noExactTime } = moment;
  const moonSky = useMemo(
    () => skyForMoment({ city, day, month, year, time, noExactTime }),
    [city, day, month, year, time, noExactTime],
  );

  const posterData: Partial<PosterData> = {
    ...personal,
    city: moment.city,
    dateLabel: `${moment.day} ${moment.month} ${moment.year}`,
    timeLabel: moment.noExactTime ? '' : moment.time,
  };

  const stepItems: StepItem[] = [1, 2, 3].map((n) => {
    const status: StepStatus =
      step === n ? 'active' : step > n ? 'done' : 'upcoming';
    return { label: t(`steps.${n}`), status };
  });

  return (
    <main className="flex-1">
      {/* Step indicator */}
      <div className="border-b border-[#33415B]">
        <div className="mx-auto flex items-center px-6 py-2 md:px-20">
          <Stepper
            steps={stepItems}
            onStepClick={(i) => goTo(i + 1)}
            ariaLabel={t('stepsNav')}
          />
        </div>
      </div>

      {/* Form on the start side (right in RTL), live preview on the other */}
      <div className="mx-auto grid gap-10 px-6 py-10 md:grid-cols-2 md:items-start md:gap-16 md:px-20 md:py-16">
        <section>
          {step === 1 && (
            <Step1Moment
              data={moment}
              onChange={setMoment}
              onNext={() => goTo(2)}
            />
          )}
          {step === 2 && (
            <Step2Personalize
              data={personal}
              moment={moment}
              onChange={setPersonal}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
              onEditMoment={() => goTo(1)}
            />
          )}
          {step === 3 && <Step3Receive personal={personal} />}
        </section>

        <CreatePreview
          step={step}
          poster={posterData}
          sky={moonSky?.sky ?? null}
          moment={moment}
          onBack={() => goTo(2)}
        />
      </div>
    </main>
  );
}

export function CreateStepper() {
  return (
    <Suspense>
      <StepperInner />
    </Suspense>
  );
}
