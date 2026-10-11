import { cn } from 'cn';

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
  watermark: 'آسمان شب ما ✦',
  disclaimer: 'نقش آسمان و ماه، تصویرسازی مفهومی است؛ نه نقشه‌ی علمی تأییدشده.',
  timeAt: 'ساعت',
};

const DEFAULT_DATA: PosterData = {
  title: 'بلندترین شب، کنار تو',
  names: 'رها و آرمان',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  city: 'تهران',
  dateLabel: '30 آذر 1402',
  timeLabel: '21:00',
  showDate: true,
  showCity: true,
  style: 'gold',
};

export function PosterPreview({
  data,
  labels,
  className,
}: {
  data?: Partial<PosterData>;
  labels?: Partial<PosterLabels>;
  className?: string;
}) {
  const p = { ...DEFAULT_DATA, ...data };
  const l = { ...DEFAULT_LABELS, ...labels };
  const isGold = p.style === 'gold';

  const bg = isGold ? 'bg-[#0e1e3d]' : 'bg-[#f8f6f0]';
  const border = isGold ? 'border-[#c8a85f]/60' : 'border-[#b9b5aa]';
  const textPrimary = isGold ? 'text-[#f2e7be]' : 'text-[#101a35]';
  const textMuted = isGold ? 'text-white/45' : 'text-[#101a35]/45';
  const textFaint = isGold ? 'text-white/25' : 'text-[#101a35]/20';
  const circleBorder = isGold ? 'border-[#c8a85f]/40' : 'border-[#101a35]/12';

  return (
    <div className={cn('max-w-md rounded-lg overflow-hidden shadow-2xl', className)}>
      <div className={cn('border-2 p-5', border, bg)}>

        {/* header line */}
        <p className={cn('mb-1 text-center text-[9px] tracking-widest uppercase', textMuted)}>
          {l.headerLine}
        </p>

        {/* North label */}
        <p className={cn('text-center text-[8px]', textFaint)}>{l.north}</p>

        {/* star map */}
        <div className={cn(
          'relative mx-auto mt-1 flex aspect-square w-full max-w-[280px] items-center justify-center rounded-full border-2',
          circleBorder,
        )}>
          {/* compass labels */}
          <span className={cn('absolute right-2 top-1/2 -translate-y-1/2 text-[8px]', textFaint)}>{l.east}</span>
          <span className={cn('absolute left-2 top-1/2 -translate-y-1/2 text-[8px]', textFaint)}>{l.west}</span>
          {/* moon */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-[#f2e7be]/80">🌙</span>
          <img
            src={isGold ? '/images/gold-constellation.png' : '/images/monochrome-constellation.png'}
            alt={l.mapAlt}
            className={cn('size-[88%] object-contain', !isGold && 'opacity-85')}
          />
        </div>

        {/* South label */}
        <p className={cn('mt-1 text-center text-[8px]', textFaint)}>{l.south}</p>

        {/* divider */}
        <div className={cn('mx-auto mt-4 h-px w-12', isGold ? 'bg-[#c8a85f]/40' : 'bg-[#101a35]/20')} />

        {/* title */}
        <p className={cn('mt-4 text-center text-base font-bold leading-7', textPrimary)}>
          {p.title}
        </p>

        {/* names */}
        <p className={cn('mt-1 text-center text-xs', textMuted)}>{p.names}</p>

        {/* quote */}
        <p className={cn('mt-2 text-center text-[10px] leading-5', textMuted)}>
          {p.quote}
        </p>

        {/* meta */}
        {(p.showDate || p.showCity) && (
          <p className={cn('mt-3 text-center text-[9px]', textFaint)}>
            {[
              p.showCity ? p.city : null,
              p.showDate
                ? [p.dateLabel, p.timeLabel ? `${l.timeAt} ${p.timeLabel}` : null]
                    .filter(Boolean)
                    .join(' · ')
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* watermark */}
        <p className={cn('mt-4 text-center text-[7px] tracking-wider', textFaint)}>
          {l.watermark}
        </p>

        {/* disclaimer */}
        <p className={cn('mt-2 text-center text-[7px] leading-4', textFaint)}>
          {l.disclaimer}
        </p>
      </div>
    </div>
  );
}
