'use client';

import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MomentData, PersonalizeData } from './CreateStepper';
import type { PosterStyle } from './PosterPreview';

const STYLES: { id: PosterStyle; label: string; img: string }[] = [
  { id: 'mono', label: 'مینیمال سیاه‌وسفید', img: '/images/monochrome-constellation.png' },
  { id: 'gold', label: 'لاجوردی و طلایی', img: '/images/gold-constellation.png' },
];

export function Step2Personalize({
  data,
  moment,
  onChange,
  onNext,
  onBack,
}: {
  data: PersonalizeData;
  moment: MomentData;
  onChange: (d: PersonalizeData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  function set<K extends keyof PersonalizeData>(k: K, v: PersonalizeData[K]) {
    onChange({ ...data, [k]: v });
  }

  return (
    <div className="space-y-7">
      {/* Step label */}
      <div>
        <p className="text-xs text-white/45">قدم ۲ از ۳ · شخصی‌سازی</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          این شب را به زبان خودت بنویس
        </h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          همان لحظه در {moment.city}؛ حالا نوبت کلمه‌ها و سلیقه‌ی توست.
        </p>
      </div>

      {/* City/date summary pill */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs">
        <span className="text-white/55">
          {moment.city} · {moment.day} {moment.month} {moment.year}
          {!moment.noExactTime && moment.time ? ` · ساعت ${moment.time}` : ''}
        </span>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#ceb47b] hover:text-[#d6c08a] transition-colors"
        >
          <Pencil className="size-2.5" />
          ویرایش
        </button>
      </div>

      {/* Title */}
      <Field label="عنوان پوستر">
        <InputRow
          value={data.title}
          onChange={(v) => set('title', v)}
          placeholder="بلندترین شب، کنار تو"
        />
      </Field>

      {/* Names */}
      <Field label="نام‌ها">
        <InputRow
          value={data.names}
          onChange={(v) => set('names', v)}
          placeholder="رها و آرمان"
        />
      </Field>

      {/* Quote */}
      <Field label="یک جمله‌ی کوتاه">
        <InputRow
          value={data.quote}
          onChange={(v) => set('quote', v)}
          placeholder="از آن شب، هر ستاره نشانی از توست."
        />
        <p className="mt-1.5 text-[11px] text-white/30">
          کوتاه و از دل؛ یک جمله برای پایین قاب.
        </p>
      </Field>

      {/* Style */}
      <div>
        <p className="mb-3 text-xs text-white/45">سبک پوستر</p>
        <div className="grid grid-cols-2 gap-3">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => set('style', s.id)}
              className={[
                'relative overflow-hidden rounded-xl border-2 p-3 text-right transition-all',
                data.style === s.id
                  ? 'border-[#ceb47b]'
                  : 'border-white/10 hover:border-white/25',
              ].join(' ')}
            >
              <div
                className={[
                  'mx-auto mb-3 flex aspect-square max-w-[80px] items-center justify-center rounded-full border p-2',
                  s.id === 'gold'
                    ? 'border-[#c8a85f]/50 bg-[#132346]'
                    : 'border-[#101a35]/15 bg-[#f8f6f0]',
                ].join(' ')}
              >
                <img src={s.img} alt={s.label} className="size-full object-contain" />
              </div>
              <p className="text-center text-xs font-medium text-white">{s.label}</p>
              {data.style === s.id && (
                <div className="absolute left-2 top-2 flex size-4 items-center justify-center rounded-full bg-[#ceb47b] text-[#0c142b]">
                  <svg className="size-2.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Frame options */}
      <div>
        <p className="mb-2.5 text-xs text-white/45">چه چیزهایی روی قاب نوشته شود؟</p>
        <div className="space-y-2.5">
          <CheckRow
            checked={data.showDate}
            onChange={(v) => set('showDate', v)}
            label="نمایش تاریخ و ساعت"
            sub={`${moment.day} ${moment.month} ${moment.year}${!moment.noExactTime && moment.time ? ' · ساعت ' + moment.time : ''}`}
          />
          <CheckRow
            checked={data.showCity}
            onChange={(v) => set('showCity', v)}
            label="نمایش نام شهر"
            sub={`${moment.city}؛ بدون نمایش مختصات روی پوستر`}
          />
        </div>
      </div>

      {/* Free copy note */}
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] leading-6 text-white/40">
        نسخه‌ی رایگان؛ نشان کوچک در پایین قاب دارد؛ آرام و کم‌رنگ، بدون پوشاندن طرح.
      </p>

      {/* CTAs */}
      <div className="flex gap-3">
        <Button
          onClick={onNext}
          size="lg"
          className="h-auto flex-1 rounded-full bg-[#ceb47b] py-3.5 text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a]"
        >
          <ArrowLeft className="size-4" />
          دریافت پوستر
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="h-auto rounded-full border-white/20 bg-transparent px-5 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          <ArrowRight className="size-4" />
          بازگشت به لحظه
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs text-white/45">{label}</p>
      {children}
    </div>
  );
}

function InputRow({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <Pencil className="size-3 text-white/30" />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-white/15 bg-white/5 pr-7 text-white placeholder:text-white/25 focus-visible:border-[#ceb47b]/50 focus-visible:ring-[#ceb47b]/20"
      />
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-3.5 accent-[#ceb47b]"
      />
      <span>
        {label}
        {sub && <span className="mt-0.5 block text-xs text-white/35">{sub}</span>}
      </span>
    </label>
  );
}
