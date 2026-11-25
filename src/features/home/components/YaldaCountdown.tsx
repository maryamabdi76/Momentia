'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { toPersianDigits } from '@/features/poster/lib/digits';

/** 30 Azar 1405, 21:00 in Tehran (UTC+3:30, no daylight saving) = 17:30 UTC on 21 Dec 2026. */
const YALDA_AT = Date.UTC(2026, 11, 21, 17, 30);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(id);
}

/** The current minute; a stable number between ticks, as useSyncExternalStore needs. */
const currentMinute = () => Math.floor(Date.now() / MINUTE);

/** Days and hours left until Yalda; renders nothing once it has passed. */
export function YaldaCountdown() {
  const t = useTranslations('YaldaPage');
  // null on the server and during hydration, so the first client render matches
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);

  if (minute === null) return null;
  const left = YALDA_AT - minute * MINUTE;
  if (left <= 0) return null;

  const days = Math.floor(left / (24 * HOUR));
  const hours = Math.floor((left % (24 * HOUR)) / HOUR);

  const units = [
    { value: days, label: t('days') },
    { value: hours, label: t('hours') },
  ];

  return (
    <div role="timer" className="inline-flex items-center gap-4 text-[#E8D9B8]">
      <span className="text-sm text-[#CEB47B]">{t('countdownLabel')}</span>
      <div className="flex gap-2">
        {units.map(({ value, label }) => (
          <span
            key={label}
            className="flex min-w-18 flex-col items-center rounded-2xl border border-[#CEB47B]/35 bg-[#CEB47B]/[0.08] px-4 py-2"
          >
            <span className="text-3xl font-black leading-tight text-white">
              {toPersianDigits(String(value))}
            </span>
            <span className="text-[11px] text-[#CEB47B]">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
