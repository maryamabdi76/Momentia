'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Share2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MomentData, PersonalizeData } from './CreateStepper';

const INFO_ITEMS = [
  {
    title: 'تصویر PNG',
    body: 'برای دیدن و فرستادن در صفحه مناسب است. در نسخه‌ی کامل با عرض ۳۰۰۰ پیکسل، جزئیات چاپ حفظ می‌شود.',
  },
  {
    title: 'فایل برداری SVG',
    body: 'خطوط هنگام بزرگ‌نمایی نرم می‌مانند؛ مناسب سازگاری با چاپخانه‌ی فارسی.',
  },
  {
    title: 'پیش از چاپ',
    body: 'فایل اصلی را به کامپیوتر بارگذاری کن؛ اندازه‌ی چاپ را با خط و کیفیت چاپخانه هماهنگ کن.',
  },
];

export function Step3Receive({
  personal,
  moment,
  onBack,
}: {
  personal: PersonalizeData;
  moment: MomentData;
  onBack: () => void;
}) {
  const [shipping, setShipping] = useState<'domestic' | 'international'>('domestic');

  return (
    <div className="space-y-6">
      {/* Step label */}
      <div>
        <p className="text-xs text-white/45">قدم ۳ از ۳ · دریافت پوستر</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          این شب، برای نگه‌داشتن آماده است
        </h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          یادگار {personal.names}؛ حالا قاب مناسبش را انتخاب کن.
        </p>
      </div>

      {/* Digital (free) card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-white">یادگار دیجیتال</h2>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/55">رایگان</span>
        </div>
        <p className="text-xs leading-6 text-white/50">
          با نشان کوچک آسمان شب ما در پایین قاب؛ مناسب نگه‌داشتن و فرستادن برای کسی که دوستش داری.
        </p>
        <Button
          size="lg"
          className="h-auto w-full rounded-full bg-[#ceb47b] py-3 text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a]"
        >
          <Download className="size-4" />
          دریافت رایگان PNG
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-auto w-full rounded-full border-white/20 bg-transparent py-3 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          دریافت فایل برداری SVG
        </Button>
        <p className="text-[11px] leading-5 text-white/30">
          هر دو فایل کوچک هستند؛ لازمه‌ها در مرورگر لود می‌شود؛ اتفاقات اضافه به سرور نمی‌رود.
        </p>
      </div>

      {/* Print card */}
      <div className="rounded-2xl border border-[#ceb47b]/25 bg-[#ceb47b]/5 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-white">برای قابی روی دیوار</h2>
          <span className="rounded-full border border-[#ceb47b]/30 px-2.5 py-0.5 text-[11px] text-[#ceb47b]">مسیر درخواست</span>
        </div>
        <p className="text-xs leading-6 text-white/55">
          بدون لوگو؛ با فایل PNG به عرض ۳۰۰۰ پیکسل و حفظ خطوط ظریف؛ فقط فایل دیجیتال؛ پرداخت نهایی در این مرحله انجام می‌شود.
        </p>
        <ul className="space-y-2">
          {[
            'حذف نشان کوچک از پایین پوستر',
            'عرض ۳۰۰۰ پیکسل و حفظ خطوط ظریف',
            'فقط فایل دیجیتال؛ ارسال و چاپ نداریم',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-white/60">
              <CheckCircle2 className="size-3.5 shrink-0 text-[#ceb47b]" />
              {f}
            </li>
          ))}
        </ul>

        {/* Shipping toggle */}
        <div>
          <p className="mb-2 text-xs text-white/45">ارسال یا خارج از کشور</p>
          <div className="flex gap-2">
            {(
              [
                { id: 'domestic', label: 'داخل ایران' },
                { id: 'international', label: 'ارسال خارج از کشور' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setShipping(opt.id)}
                className={[
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                  shipping === opt.id
                    ? 'border-[#ceb47b] bg-[#ceb47b]/10 text-[#ceb47b]'
                    : 'border-white/15 text-white/45 hover:border-white/30',
                ].join(' ')}
              >
                <span
                  className={[
                    'size-2 rounded-full',
                    shipping === opt.id ? 'bg-[#ceb47b]' : 'bg-white/20',
                  ].join(' ')}
                />
                {opt.label}
              </button>
            ))}
          </div>
          {shipping === 'international' && (
            <p className="mt-2 text-[11px] leading-5 text-white/35">
              روی پرداخت مبلغ از خارج از کشور پس از بررسی درخواست هماهنگ می‌شود.
            </p>
          )}
        </div>

        <Button
          size="lg"
          className="h-auto w-full rounded-full bg-[#ceb47b] py-3 text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a]"
        >
          <ArrowLeft className="size-4" />
          حذف لوگو و کیفیت چاپ
        </Button>
        <p className="text-center text-[11px] text-white/30">
          ثبت درخواست؛ مبلغ پرداخت در آن مرحله مشخص می‌شود.
        </p>
      </div>

      {/* Info section */}
      <div className="pt-2">
        <h3 className="mb-5 text-lg font-semibold text-white text-center">
          برای دریافت و چاپ، این نکته‌ها را بدان
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {INFO_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <h4 className="mb-2 text-sm font-semibold text-white">{item.title}</h4>
              <p className="text-xs leading-6 text-white/50">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-auto flex-1 rounded-full border-white/20 bg-transparent py-3 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          <ArrowRight className="size-4" />
          بازگشت به ویرایش
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-auto flex-1 rounded-full border-white/20 bg-transparent py-3 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          <Share2 className="size-4" />
          اشتراک‌گذاری یادگار
        </Button>
      </div>

      <p className="text-center text-xs text-white/30">
        بدون حساب کاربری؛ بدون ذخیره‌سازی روی سرور.
      </p>
    </div>
  );
}
