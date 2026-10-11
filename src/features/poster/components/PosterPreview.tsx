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

const DEFAULT: PosterData = {
  title: 'بلندترین شب، کنار تو',
  names: 'رها و آرمان',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  city: 'تهران',
  dateLabel: '۳۰ آذر ۱۴۰۲',
  timeLabel: '۲۱:۰۰',
  showDate: true,
  showCity: true,
  style: 'gold',
};

export function PosterPreview({
  data,
  className,
}: {
  data?: Partial<PosterData>;
  className?: string;
}) {
  const p = { ...DEFAULT, ...data };
  const isGold = p.style === 'gold';

  return (
    <div
      className={cn(
        'w-full rounded-sm border border-white/20 p-2.5 shadow-xl',
        className,
      )}
    >
      <div
        className={cn(
          'border px-4 py-5 text-center',
          isGold
            ? 'border-[#c8a85f]/70 bg-[#132346]'
            : 'border-[#b9b5aa] bg-[#f8f6f0]',
        )}
      >
        {/* direction label */}
        <div className="flex justify-between text-[9px] mb-1">
          <span className={isGold ? 'text-white/40' : 'text-[#101a35]/35'}>جنوب</span>
          <span className={isGold ? 'text-white/40' : 'text-[#101a35]/35'}>شمال</span>
        </div>

        {/* star map circle */}
        <div
          className={cn(
            'mx-auto flex aspect-square items-center justify-center rounded-full border p-3',
            isGold
              ? 'border-[#c8a85f]/50'
              : 'border-[#101a35]/15',
          )}
        >
          <img
            src={
              isGold
                ? '/images/gold-constellation.png'
                : '/images/monochrome-constellation.png'
            }
            alt="نقشه‌ی آسمان شب"
            className={cn('size-full object-contain', isGold ? 'p-1' : 'opacity-90')}
          />
        </div>

        {/* direction label bottom */}
        <div className="flex justify-between text-[9px] mt-1">
          <span className={isGold ? 'text-white/40' : 'text-[#101a35]/35'}>غرب</span>
          <span className={isGold ? 'text-white/40' : 'text-[#101a35]/35'}>شرق</span>
        </div>

        {/* title */}
        <p
          className={cn(
            'mt-4 text-sm font-semibold leading-6',
            isGold ? 'text-[#f2e7be]' : 'text-[#101a35]',
          )}
        >
          {p.title}
        </p>

        {/* names */}
        <p className={cn('mt-1 text-xs', isGold ? 'text-white/75' : 'text-[#101a35]/65')}>
          {p.names}
        </p>

        {/* quote */}
        <p className={cn('mt-2 text-[10px] leading-5 italic', isGold ? 'text-white/50' : 'text-[#101a35]/45')}>
          {p.quote}
        </p>

        {/* meta line */}
        {(p.showDate || p.showCity) && (
          <p className={cn('mt-3 text-[9px]', isGold ? 'text-white/40' : 'text-[#101a35]/35')}>
            {[
              p.showCity ? p.city : null,
              p.showDate ? `${p.dateLabel}${p.timeLabel ? ' · ' + p.timeLabel : ''}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* brand watermark */}
        <p className={cn('mt-3 text-[8px]', isGold ? 'text-white/25' : 'text-[#101a35]/20')}>
          آسمان شب ما ✦
        </p>
      </div>
    </div>
  );
}
