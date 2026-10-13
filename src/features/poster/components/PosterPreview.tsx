import { cn } from 'cn';
import { Sparkles } from 'lucide-react';
import { vazirmatnVariable } from 'next-persian-fonts/vazirmatn-variable';
import Image from 'next/image';
import { SkyChart } from '@/features/sky/components/SkyChart';
import type { SkySnapshot } from '@/features/sky/lib/types';

export type PosterStyle = 'gold' | 'mono';

export type PosterData = {
  title: string;
  names: string;
  quote: string;
  city: string;
  dateLabel: string;
  timeLabel: string;
  showDate: boolean;
  showCity: boolean;
  style: PosterStyle;
};

export type PosterLabels = {
  headerLine: string;
  north: string;
  south: string;
  east: string;
  west: string;
  mapAlt: string;
  watermark: string;
  disclaimer: string;
  timeAt: string;
};

const DEFAULT_LABELS: PosterLabels = {
  headerLine: 'یادگار یک شب؛ برای همیشه',
  north: 'شمال',
  south: 'جنوب',
  east: 'شرق',
  west: 'غرب',
  mapAlt: 'نقشه‌ی آسمان شب',
  watermark: 'آسمان شب ما',
  disclaimer: 'نقش آسمان و ماه، تصویرسازی مفهومی است؛ نه نقشه‌ی علمی تأییدشده.',
  timeAt: 'ساعت',
};

const DEFAULT_DATA: PosterData = {
  title: 'بلندترین شب، کنار تو',
  names: 'مریم و جلال',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  city: 'تهران',
  dateLabel: '30 آذر 1405',
  timeLabel: '21:00',
  showDate: true,
  showCity: true,
  style: 'gold',
};

export function PosterPreview({
  data,
  labels,
  className,
  size = 'default',
  showDisclaimer = true,
  sky,
}: {
  data?: Partial<PosterData>;
  labels?: Partial<PosterLabels>;
  className?: string;
  size?: 'default' | 'hero';
  showDisclaimer?: boolean;
  /** The real sky for the chosen moment. Without it the static illustration is shown. */
  sky?: SkySnapshot | null;
}) {
  const p = { ...DEFAULT_DATA, ...data };
  const l = { ...DEFAULT_LABELS, ...labels };
  const isGold = p.style === 'gold';

  const bg = isGold ? 'bg-[#0e1e3d]' : 'bg-[#f8f6f0]';
  const border = isGold ? 'border-[#CEB47B]' : 'border-[#b9b5aa]';
  const textPrimary = isGold ? 'text-[#E8D9B8]' : 'text-[#222222]';

  const isHero = size === 'hero';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg shadow-2xl',
        isHero ? 'max-w-none' : 'max-w-md',
        className,
      )}
    >
      <div className={cn('border p-5', border, bg)}>
        {/* header line */}
        <p
          className={cn(
            'mb-1 text-center tracking-widest text-[9px] uppercase',
            textPrimary,
          )}
        >
          {l.headerLine}
        </p>

        {/* North label */}
        <p className={cn('text-center top-4 relative text-[8px]', textPrimary)}>
          {l.north}
        </p>

        {/* star map */}
        <div
          className={cn(
            'relative mx-auto mt-1 flex aspect-square w-full items-center justify-center',
          )}
        >
          {/* compass labels — looking up with north on top, east is on the left */}
          <span
            className={cn(
              'absolute -left-2 top-1/2 -translate-y-1/2 text-[8px]',
              textPrimary,
            )}
          >
            {l.east}
          </span>
          <span
            className={cn(
              'absolute -right-2 top-1/2 -translate-y-1/2 text-[8px]',
              textPrimary,
            )}
          >
            {l.west}
          </span>

          {sky ? (
            <SkyChart
              sky={sky}
              variant={isGold ? 'gold' : 'mono'}
              ariaLabel={l.mapAlt}
              className="size-[92%]"
            />
          ) : (
            <Image
              src={
                isGold
                  ? '/images/gold-constellation.png'
                  : '/images/monochrome-constellation.png'
              }
              alt={l.mapAlt}
              className={cn('size-[92%] object-contain', !isGold && 'opacity-85')}
              width={360}
              height={360}
            />
          )}
        </div>

        {/* South label */}
        <p
          className={cn('text-center -top-2 relative text-[8px]', textPrimary)}
        >
          {l.south}
        </p>

        {/* title */}
        <p
          className={cn(
            'mt-4 text-center font-bold leading-7',
            isHero ? 'text-2xl' : 'text-base',
            textPrimary,
          )}
        >
          {p.title}
        </p>

        {/* names */}
        <p className={cn('mt-1 text-center text-xs', textPrimary)}>{p.names}</p>

        {/* quote */}
        <p className={cn('mt-2 text-center leading-5 text-[9px]', textPrimary)}>
          {p.quote}
        </p>

        {/* meta */}
        {(p.showDate || p.showCity) && (
          <p className={cn('mt-3 text-center text-[9px]', textPrimary)}>
            {[
              p.showCity ? p.city : null,
              p.showDate
                ? [
                    p.dateLabel,
                    p.timeLabel ? `${l.timeAt} ${p.timeLabel}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* watermark */}
        <p
          className={cn(
            'flex gap-1 items-center justify-center mt-4 text-center tracking-wider text-[7px]',
            textPrimary,
          )}
        >
          <Sparkles className="size-2" />
          {l.watermark}
        </p>

        {/* disclaimer */}
        {showDisclaimer && (
          <p
            className={cn('mt-2 text-center text-[7px] leading-4', textPrimary)}
          >
            {l.disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}
