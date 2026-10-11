'use client';

import { useState } from 'react';
import { Sparkles, MapPin, Check, Clock, ArrowLeft, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MomentData } from './CreateStepper';

const OCCASIONS = [
  { label: 'شب یلدا', day: '۳۰', month: 'آذر', year: '۱۴۰۲' },
  { label: 'نوروز', day: '۱', month: 'فروردین', year: '۱۴۰۳' },
  { label: 'تولد', day: '', month: '', year: '' },
  { label: 'سالگرد', day: '', month: '', year: '' },
];

const CITIES = [
  { name: 'تهران', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'شیراز', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'اصفهان', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'مشهد', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'تبریز', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'کرج', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'اهواز', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'قم', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'کرمانشاه', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'رشت', country: 'ایران', tz: 'Asia/Tehran' },
  { name: 'دوبی', country: 'امارات', tz: 'Asia/Dubai' },
  { name: 'استانبول', country: 'ترکیه', tz: 'Europe/Istanbul' },
  { name: 'لندن', country: 'بریتانیا', tz: 'Europe/London' },
  { name: 'پاریس', country: 'فرانسه', tz: 'Europe/Paris' },
  { name: 'تورنتو', country: 'کانادا', tz: 'America/Toronto' },
  { name: 'لس‌آنجلس', country: 'آمریکا', tz: 'America/Los_Angeles' },
];

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const DAYS = Array.from({ length: 31 }, (_, i) =>
  (i + 1).toLocaleString('fa-IR'),
);

const YEARS = Array.from({ length: 20 }, (_, i) =>
  (1395 + i).toLocaleString('fa-IR'),
).reverse();

export function Step1Moment({
  data,
  onChange,
  onNext,
}: {
  data: MomentData;
  onChange: (d: MomentData) => void;
  onNext: () => void;
}) {
  const [citySearch, setCitySearch] = useState(data.city);
  const [showCityList, setShowCityList] = useState(false);

  const filtered = CITIES.filter(
    (c) =>
      c.name.includes(citySearch) || c.country.includes(citySearch),
  );

  function selectCity(c: (typeof CITIES)[0]) {
    onChange({ ...data, city: c.name, timezone: c.tz });
    setCitySearch(c.name);
    setShowCityList(false);
  }

  function set<K extends keyof MomentData>(k: K, v: MomentData[K]) {
    onChange({ ...data, [k]: v });
  }

  return (
    <div className="space-y-7">
      {/* Step label */}
      <div>
        <p className="text-xs text-white/45">قدم ۱ از ۳ · انتخاب لحظه</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">آن شب، کجا بودی؟</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          یک شهر، یک تاریخ و اگر می‌دانی، یک ساعت. از همین‌جا شروع می‌کنیم.
        </p>
      </div>

      {/* Quick occasion chips */}
      <div>
        <p className="mb-2.5 text-xs text-white/45">شروع با یک مناسبت</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                if (o.day) onChange({ ...data, day: o.day, month: o.month, year: o.year });
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:border-[#ceb47b]/50 hover:text-[#ceb47b] transition-colors"
            >
              <Sparkles className="size-2.5" />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* City search */}
      <div>
        <p className="mb-2 text-xs text-white/45">شهر یا مکان</p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <MapPin className="size-3.5 text-white/35" />
          </div>
          <Input
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setShowCityList(true);
            }}
            onFocus={() => setShowCityList(true)}
            placeholder="تهران"
            className="border-white/15 bg-white/5 pr-8 text-white placeholder:text-white/30 focus-visible:border-[#ceb47b]/50 focus-visible:ring-[#ceb47b]/20"
          />
          {showCityList && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-white/15 bg-[#0c1a38] py-1 shadow-xl">
              {filtered.slice(0, 6).map((c) => (
                <li key={c.name}>
                  <button
                    onMouseDown={() => selectCity(c)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-right text-sm hover:bg-white/5"
                  >
                    {c.name === data.city ? (
                      <Check className="size-3.5 text-[#ceb47b] shrink-0" />
                    ) : (
                      <MapPin className="size-3.5 text-white/30 shrink-0" />
                    )}
                    <span className="text-white">{c.name}</span>
                    <span className="mr-auto text-xs text-white/35">{c.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-white/30">
          جست‌وجو در فهرست ثابت شهرهای ایران و جهان؛ بدون نقشه و بدون دسترسی به موقعیت دستگاه.
        </p>
        {data.timezone && (
          <p className="mt-1 text-[11px] text-white/35">
            منطقه‌ی زمانی شهر: {data.timezone}
          </p>
        )}
      </div>

      {/* Date pickers */}
      <div>
        <p className="mb-2 text-xs text-white/45">تاریخ آن شب · تقویم شمسی</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Day */}
          <div>
            <p className="mb-1 text-[11px] text-white/35">روز</p>
            <div className="relative">
              <select
                value={data.day}
                onChange={(e) => set('day', e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ceb47b]/50 focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d} className="bg-[#0c1a38]">{d}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/35 text-xs">▾</span>
            </div>
          </div>
          {/* Month */}
          <div>
            <p className="mb-1 text-[11px] text-white/35">ماه</p>
            <div className="relative">
              <select
                value={data.month}
                onChange={(e) => set('month', e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ceb47b]/50 focus:outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m} className="bg-[#0c1a38]">{m}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/35 text-xs">▾</span>
            </div>
          </div>
          {/* Year */}
          <div>
            <p className="mb-1 text-[11px] text-white/35">سال</p>
            <div className="relative">
              <select
                value={data.year}
                onChange={(e) => set('year', e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ceb47b]/50 focus:outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-[#0c1a38]">{y}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/35 text-xs">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time */}
      <div>
        <p className="mb-2 text-xs text-white/45">ساعت محلی · اختیاری</p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <Clock className="size-3.5 text-white/35" />
          </div>
          <Input
            value={data.time}
            onChange={(e) => set('time', e.target.value)}
            disabled={data.noExactTime}
            placeholder="۲۱:۰۰"
            className="border-white/15 bg-white/5 pr-8 text-white placeholder:text-white/30 focus-visible:border-[#ceb47b]/50 focus-visible:ring-[#ceb47b]/20 disabled:opacity-40"
          />
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-white/30">
          اگر ساعت دقیق را نمی‌دانی، ۹ شب آغاز آرامی است.
        </p>
        {/* no exact time checkbox */}
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs text-white/55">
          <input
            type="checkbox"
            checked={data.noExactTime}
            onChange={(e) => set('noExactTime', e.target.checked)}
            className="mt-0.5 size-3.5 accent-[#ceb47b]"
          />
          ساعت دقیق را نمی‌دانم؛ از ۹ شب استفاده کن
        </label>
      </div>

      {/* Night note */}
      <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-xs leading-6 text-white/45">
        <Moon className="mt-0.5 size-3.5 shrink-0 text-[#ceb47b]" />
        <span>
          این یادگار برای آسمان شب است. اگر خاطره‌ی روز همان تاریخ انتخاب کنی، شب همان شهر و همان تاریخ در نظر گرفته می‌شود.
        </span>
      </div>

      {/* CTA */}
      <Button
        onClick={onNext}
        size="lg"
        className="h-auto w-full rounded-full bg-[#ceb47b] py-3.5 text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a]"
      >
        <ArrowLeft className="size-4" />
        ادامه و شخصی‌سازی پوستر
      </Button>

      <p className="text-center text-xs text-white/30">
        بدون حساب کاربری؛ بدون ذخیره‌سازی روی سرور.
      </p>
    </div>
  );
}
