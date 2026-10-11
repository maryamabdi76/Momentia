'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { PosterPreview, type PosterData, type PosterStyle } from './PosterPreview';
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

const DEFAULT_MOMENT: MomentData = {
  city: 'تهران',
  timezone: 'Asia/Tehran',
  day: '30',
  month: 'آذر',
  year: '1402',
  time: '21:00',
  noExactTime: false,
};

const DEFAULT_PERSONALIZE: PersonalizeData = {
  title: 'بلندترین شب، کنار تو',
  names: 'رها و آرمان',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  style: 'gold',
  showDate: true,
  showCity: true,
};

function StepperInner() {
  const t = useTranslations('CreatePage');
  const tPoster = useTranslations('Poster');
  const searchParams = useSearchParams();
  const router = useRouter();

  const stepParam = Number(searchParams.get('step') ?? '1');
  const step = stepParam >= 1 && stepParam <= 3 ? stepParam : 1;

  const [moment, setMoment] = useState<MomentData>(DEFAULT_MOMENT);
  const [personal, setPersonal] = useState<PersonalizeData>(DEFAULT_PERSONALIZE);

  function goTo(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(n));
    router.push(`/create?${params.toString()}`);
  }

  const posterData: Partial<PosterData> = {
    title: personal.title,
    names: personal.names,
    quote: personal.quote,
    city: moment.city,
    dateLabel: `${moment.day} ${moment.month} ${moment.year}`,
    timeLabel: moment.noExactTime ? '' : moment.time,
    showDate: personal.showDate,
    showCity: personal.showCity,
    style: personal.style,
  };

  const steps = [
    { n: 1, label: t('steps.1') },
    { n: 2, label: t('steps.2') },
    { n: 3, label: t('steps.3') },
  ];

  const stepItems = steps.map(({ n, label }) => ({
    label,
    status: (step === n ? 'active' : step > n ? 'done' : 'upcoming') as 'active' | 'done' | 'upcoming',
  }));

  return (
    <div className="min-h-screen bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm">
        <a href="/" className="flex items-center gap-1.5 font-bold text-white text-sm">
            <Sparkles className="size-3 text-[#ceb47b]" />
            {t('brand')}
          </a>  

          <nav className="hidden gap-6 text-xs text-white/55 md:flex">
            <a href="/#gifts" className="hover:text-white/80 transition-colors">{t('nav.posters')}</a>
            <a href="/#steps" className="hover:text-white/80 transition-colors">{t('nav.how')}</a>
            <a href="/#faq" className="hover:text-white/80 transition-colors">{t('nav.faq')}</a>
          </nav>

          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-[#ceb47b] hover:bg-white/10 hover:text-[#ceb47b] px-4"
            onClick={() => router.push('/')}
          >
            {t('back')}
          </Button>
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-6">
          <Stepper
            steps={stepItems}
            onStepClick={(i) => goTo(i + 1)}
            ariaLabel={t('stepsNav')}
          />
        </div>
      </div>

      {/* Main layout: poster LEFT (large), form RIGHT */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[540px_1fr] md:items-start md:py-14">

        {/* Right column: step form */}
        <div>
          {step === 1 && (
            <Step1Moment data={moment} onChange={setMoment} onNext={() => goTo(2)} />
          )}
          {step === 2 && (
            <Step2Personalize
              data={personal}
              moment={moment}
              onChange={setPersonal}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
            />
          )}
          {step === 3 && (
            <Step3Receive personal={personal} moment={moment} onBack={() => goTo(2)} />
          )}
        </div>

        {/* Left column: poster + info card */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{t('preview.label')}</span>
            <span>{t('preview.title')}</span>
          </div>
          {/* outer light wrapper matching the design */}
          <div className="rounded-2xl bg-[#f5f0e8] flex justify-center p-4 shadow-2xl">
            <PosterPreview
              data={posterData}
              labels={{
                headerLine: tPoster('headerLine'),
                north: tPoster('north'),
                south: tPoster('south'),
                east: tPoster('east'),
                west: tPoster('west'),
                mapAlt: tPoster('mapAlt'),
                watermark: tPoster('watermark'),
                disclaimer: tPoster('disclaimer'),
                timeAt: tPoster('timeAt'),
              }}
            />
          </div>
          {/* Info card below poster */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <p className="text-xs font-semibold text-white/80">{t('infoCard.title')}</p>
            <p className="mt-1.5 text-[11px] leading-6 text-white/45">{t('infoCard.body')}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            <Sparkles className="size-2.5 text-[#ceb47b]" />
            {t('brand')}
          </a>
          <p className="text-xs text-white/30">{t('footerNote')}</p>
        </div>
      </footer>
    </div>
  );
}

export function CreateStepper() {
  return (
    <Suspense>
      <StepperInner />
    </Suspense>
  );
}
