'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PosterPreview, type PosterData, type PosterStyle } from './PosterPreview';
import { Step1Moment } from './Step1Moment';
import { Step2Personalize } from './Step2Personalize';
import { Step3Receive } from './Step3Receive';

const STEPS = [
  { n: 1, label: 'انتخاب لحظه' },
  { n: 2, label: 'شخصی‌سازی' },
  { n: 3, label: 'دریافت پوستر' },
];

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
  day: '۳۰',
  month: 'آذر',
  year: '۱۴۰۲',
  time: '۲۱:۰۰',
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

  return (
    <div className="min-h-screen bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white rounded-full px-4"
            onClick={() => router.push('/')}
          >
            <ArrowRight className="size-3.5" />
            بازگشت به خانه
          </Button>

          <nav className="hidden gap-6 text-xs text-white/55 md:flex">
            <a href="/#gifts" className="hover:text-white/80 transition-colors">طرح‌های پوستر</a>
            <a href="/#steps" className="hover:text-white/80 transition-colors">چطور ساخته می‌شود؟</a>
            <a href="/#faq" className="hover:text-white/80 transition-colors">پرسش‌های رایج</a>
          </nav>

          <a href="/" className="flex items-center gap-1.5 font-bold text-white text-sm">
            <Sparkles className="size-3 text-[#ceb47b]" />
            آسمان شب ما
          </a>
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-center gap-0 px-6">
          {STEPS.map(({ n, label }, i) => {
            const active = step === n;
            const done = step > n;
            return (
              <button
                key={n}
                onClick={() => done ? goTo(n) : undefined}
                disabled={!done}
                className={[
                  'flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : done
                    ? 'text-white/50 hover:text-white/75 cursor-pointer'
                    : 'text-white/30 cursor-default',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                    active
                      ? 'bg-[#ceb47b] text-[#0c142b]'
                      : done
                      ? 'bg-white/20 text-white/70'
                      : 'bg-white/10 text-white/30',
                  ].join(' ')}
                >
                  {n}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content: split layout */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1fr_420px] md:gap-12 md:py-14">
        {/* Left: poster preview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-white/45">
            <span>طرح نمایشی</span>
            <span>پیش‌نمایش یادگار شما</span>
          </div>
          <PosterPreview data={posterData} className="max-w-[420px]" />
          {step === 3 && (
            <p className="mt-1 text-xs leading-6 text-white/40 text-center max-w-[420px]">
              نسخه‌ی رایگان؛ نشان کوچک در پایین قاب دارد؛ آرام و کم‌رنگ، بدون پوشاندن طرح.
            </p>
          )}
        </div>

        {/* Right: step content */}
        <div>
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
            />
          )}
          {step === 3 && (
            <Step3Receive
              personal={personal}
              moment={moment}
              onBack={() => goTo(2)}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-xs text-white/35">
          یادگار شما، در مرورگر شما می‌ماند.
        </p>
        <a href="/" className="mt-3 inline-flex items-center gap-1 text-xs text-white/45 hover:text-white/70 transition-colors">
          <Sparkles className="size-2.5 text-[#ceb47b]" />
          آسمان شب ما
        </a>
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
