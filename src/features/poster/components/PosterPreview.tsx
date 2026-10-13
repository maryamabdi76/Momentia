import { cn } from 'cn';
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
  dateLabel: '۳۰ آذر ۱۴۰۵',
  timeLabel: '۲۱:۰۰',
  showDate: true,
  showCity: true,
  style: 'gold',
};

type Theme = {
  paper: string;
  frame: string;
  frameSoft: string;
  ink: string;
  accent: string;
  muted: string;
};

const THEMES: Record<PosterStyle, Theme> = {
  gold: {
    paper:
      'radial-gradient(120% 70% at 50% 38%, #1a2f5c 0%, #0f2147 45%, #08132b 100%)',
    frame: '#CEB47B',
    frameSoft: 'rgba(206,180,123,0.45)',
    ink: '#F1E6C8',
    accent: '#E3C88A',
    muted: 'rgba(241,230,200,0.62)',
  },
  mono: {
    paper: 'linear-gradient(180deg,#fbf9f4 0%,#f3efe5 100%)',
    frame: '#2a2a28',
    frameSoft: 'rgba(42,42,40,0.35)',
    ink: '#1c1c1a',
    accent: '#1c1c1a',
    muted: 'rgba(28,28,26,0.62)',
  },
};

/** A hairline with a small four-point star in the middle. */
function Divider({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-[2.4cqw]"
      style={{ color }}
    >
      <span className="h-px w-[16cqw]" style={{ background: `linear-gradient(90deg,transparent,${color})` }} />
      <svg viewBox="-5 -5 10 10" className="size-[2.8cqw]">
        <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="currentColor" />
      </svg>
      <span className="h-px w-[16cqw]" style={{ background: `linear-gradient(270deg,transparent,${color})` }} />
    </div>
  );
}

/** Small ornament that sits on each corner of the inner frame. */
function Corner({ color, className }: { color: string; className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn('absolute size-[5cqw]', className)}
      fill="none"
      stroke={color}
      strokeWidth={0.9}
    >
      <path d="M1 19 V6 Q1 1 6 1 H19" />
      <circle cx="6" cy="6" r="1.3" fill={color} stroke="none" />
    </svg>
  );
}

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
  const t = THEMES[p.style];

  const place = p.showCity ? p.city : null;
  const when = p.showDate ? p.dateLabel : null;
  const time = p.showDate && p.timeLabel ? p.timeLabel : null;
  const meta = [
    place && { k: 'place', v: place },
    when && { k: 'date', v: when },
    time && { k: 'time', v: `${l.timeAt} ${time}` },
  ].filter(Boolean) as Array<{ k: string; v: string }>;

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[6px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)]',
        size === 'hero' ? 'max-w-none' : 'max-w-md',
        className,
      )}
    >
      {/* container-type lets every size below scale with the poster's own width */}
      <div
        className="relative aspect-[3/4.5] w-full [container-type:inline-size]"
        style={{ background: t.paper, color: t.ink }}
      >
        {/* outer and inner frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[2.4cqw] border"
          style={{ borderColor: t.frame }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[3.7cqw] border"
          style={{ borderColor: t.frameSoft }}
        />
        <Corner color={t.frame} className="left-[4.6cqw] top-[4.6cqw]" />
        <Corner color={t.frame} className="right-[4.6cqw] top-[4.6cqw] -scale-x-100" />
        <Corner color={t.frame} className="bottom-[4.6cqw] left-[4.6cqw] -scale-y-100" />
        <Corner color={t.frame} className="bottom-[4.6cqw] right-[4.6cqw] scale-[-1]" />

        <div className="relative flex h-full flex-col items-center px-[9cqw] pb-[7cqw] pt-[8cqw]">
          {/* eyebrow */}
          <p
            className="text-[3cqw] font-medium tracking-[0.18em]"
            style={{ color: t.accent }}
          >
            {l.headerLine}
          </p>

          {/* chart */}
          <div className="relative mt-[8cqw] aspect-square w-[78%]">
            {isGold && (
              <div
                aria-hidden
                className="absolute inset-[-6%] rounded-full"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(206,180,123,0.16), rgba(206,180,123,0) 100%)',
                }}
              />
            )}

            {/* compass: north on top, east on the left (we are looking up) */}
            {(
              [
                [l.north, 'left-1/2 -top-[1.2cqw] -translate-x-1/2 -translate-y-full'],
                [l.south, 'left-1/2 -bottom-[1.2cqw] -translate-x-1/2 translate-y-full'],
                [l.east, '-left-[1.6cqw] top-1/2 -translate-x-full -translate-y-1/2'],
                [l.west, '-right-[1.6cqw] top-1/2 translate-x-full -translate-y-1/2'],
              ] as const
            ).map(([text, pos]) => (
              <span
                key={text}
                className={cn('absolute text-[2.6cqw]', pos)}
                style={{ color: t.muted }}
              >
                {text}
              </span>
            ))}

            {sky ? (
              <SkyChart
                sky={sky}
                variant={p.style}
                ariaLabel={l.mapAlt}
                className="relative size-full"
              />
            ) : (
              <Image
                src={
                  isGold
                    ? '/images/gold-constellation.png'
                    : '/images/monochrome-constellation.png'
                }
                alt={l.mapAlt}
                className={cn('relative size-full object-contain', !isGold && 'opacity-85')}
                width={360}
                height={360}
              />
            )}
          </div>

          {/* title block */}
          <div className="mt-[9cqw] flex w-full flex-col items-center text-center">
            <h3 className="text-balance text-[7.2cqw] font-bold leading-[1.35]">
              {p.title}
            </h3>
            <p className="mt-[1.6cqw] text-[4.4cqw] font-medium" style={{ color: t.accent }}>
              {p.names}
            </p>

            <div className="mt-[3.6cqw]">
              <Divider color={t.frame} />
            </div>

            <p
              className="mt-[3.4cqw] max-w-[88%] text-balance text-[3.5cqw] leading-[1.9]"
              style={{ color: t.muted }}
            >
              {p.quote}
            </p>
          </div>

          {/* meta: place · date · time */}
          {meta.length > 0 && (
            <div
              className="mt-auto flex w-full items-center justify-center gap-[3cqw] pt-[4cqw] text-[3.1cqw] font-medium"
              style={{ color: t.ink }}
            >
              {meta.map((m, i) => (
                <span key={m.k} className="flex items-center gap-[3cqw]">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="size-[0.9cqw] rotate-45"
                      style={{ background: t.frame }}
                    />
                  )}
                  {m.v}
                </span>
              ))}
            </div>
          )}

          <p
            className={cn(
              'text-[2.2cqw] tracking-[0.2em]',
              meta.length > 0 ? 'mt-[2.6cqw]' : 'mt-auto',
            )}
            style={{ color: t.muted }}
          >
            {l.watermark}
          </p>

          {showDisclaimer && (
            <p
              className="mt-[1.6cqw] text-center text-[2cqw] leading-[1.6]"
              style={{ color: t.muted }}
            >
              {l.disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
