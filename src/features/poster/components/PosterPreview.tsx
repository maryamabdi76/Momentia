import { cn } from 'cn';
import Image from 'next/image';
import { SkyChart } from '@/features/sky/components/SkyChart';
import { SkyField } from '@/features/sky/components/SkyField';
import type { SkyLayers } from '@/features/sky/lib/layers';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { FULL_LAYOUT, type PosterTemplate } from '../lib/templates';
import { POSTER_THEMES, paperCss, type PosterStyle } from '../lib/themes';

export type { PosterStyle };

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
  /** `circle` (default): a round chart with the text below. `full`: the whole page is sky. */
  template?: PosterTemplate;
  /** Which parts of the sky are drawn; missing fields take their defaults. */
  layers?: Partial<SkyLayers>;
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

/** A hairline with a small four-point star in the middle. */
function Divider({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-[2.4cqw]"
      style={{ color }}
    >
      <span
        className="h-px w-[16cqw]"
        style={{ background: `linear-gradient(90deg,transparent,${color})` }}
      />
      <svg viewBox="-5 -5 10 10" className="size-[2.8cqw]">
        <path
          d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z"
          fill="currentColor"
        />
      </svg>
      <span
        className="h-px w-[16cqw]"
        style={{ background: `linear-gradient(270deg,transparent,${color})` }}
      />
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
  const t = POSTER_THEMES[p.style];
  // the full template needs a real sky; without one the circle layout stands in
  const full = p.template === 'full' && Boolean(sky);
  const edge = t.paperStops[t.paperStops.length - 1]![1];
  const fade = (alpha: number) => `color-mix(in srgb, ${edge} ${alpha * 100}%, transparent)`;

  const place = p.showCity ? p.city : null;
  const when = p.showDate ? p.dateLabel : null;
  const time = p.showDate && p.timeLabel ? p.timeLabel : null;
  const meta = [
    place && { k: 'place', v: place },
    when && { k: 'date', v: when },
    time && { k: 'time', v: `${l.timeAt} ${time}` },
  ].filter(Boolean) as Array<{ k: string; v: string }>;

  const hasTitle = Boolean(p.title);
  const hasNames = Boolean(p.names);
  const hasQuote = Boolean(p.quote);
  const hasTextBlock = hasTitle || hasNames || hasQuote;
  const showDivider = (hasTitle || hasNames) && hasQuote;
  const hasFooter = meta.length > 0 || Boolean(l.watermark) || showDisclaimer;

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
        style={{ background: paperCss(t), color: t.ink }}
      >
        {/* full template: the sky fills the page and the text sits on a fade */}
        {full && sky && (
          <>
            <SkyField
              sky={sky}
              variant={p.style}
              layers={p.layers}
              {...FULL_LAYOUT}
              compass={{ north: l.north, south: l.south, east: l.east, west: l.west }}
              compassColor={t.muted}
              ariaLabel={l.mapAlt}
              className="absolute inset-0 size-full"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[19.3%]"
              style={{ background: `linear-gradient(to bottom, ${fade(0.85)}, transparent)` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[42.2%]"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${fade(0.55)} 22%, ${fade(0.9)} 45%, ${fade(0.97)} 100%)`,
              }}
            />
          </>
        )}

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
        <Corner
          color={t.frame}
          className="right-[4.6cqw] top-[4.6cqw] -scale-x-100"
        />
        <Corner
          color={t.frame}
          className="bottom-[4.6cqw] left-[4.6cqw] -scale-y-100"
        />
        <Corner
          color={t.frame}
          className="bottom-[4.6cqw] right-[4.6cqw] scale-[-1]"
        />

        <div
          className={cn(
            'relative flex h-full flex-col items-center px-[9cqw] pb-[7cqw] pt-[8cqw]',
            !hasTextBlock && !hasFooter && 'justify-center',
          )}
        >
          {/* eyebrow */}
          <p
            className="text-[3cqw] font-medium tracking-[0.18em]"
            style={{ color: t.accent }}
          >
            {l.headerLine}
          </p>

          {/* chart */}
          {/* The wrapper is the chart's slot: 78% of the column wide, and it gives
              way (min-h-0 + shrink) when a long title or quote needs the room, so the
              text is never pushed off the page. buildPosterSvg does the same sum. */}
          {!full && (
          <div className="mt-[8cqw] flex h-[63.96cqw] min-h-0 w-full shrink justify-center">
          <div className="relative aspect-square h-full">
            {t.glow && (
              <div
                aria-hidden
                className="absolute inset-[-6%] rounded-full"
                style={{
                  background: `radial-gradient(closest-side, color-mix(in srgb, ${t.glow} 16%, transparent), transparent 100%)`,
                }}
              />
            )}

            {/* compass: north on top, east on the left (we are looking up) */}
            {(
              [
                [
                  l.north,
                  'left-1/2 -top-[1.2cqw] -translate-x-1/2 -translate-y-full',
                ],
                [
                  l.south,
                  'left-1/2 -bottom-[1.2cqw] -translate-x-1/2 translate-y-full',
                ],
                [
                  l.east,
                  '-left-[1.6cqw] top-1/2 -translate-x-full -translate-y-1/2',
                ],
                [
                  l.west,
                  '-right-[1.6cqw] top-1/2 translate-x-full -translate-y-1/2',
                ],
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
                layers={p.layers}
                ariaLabel={l.mapAlt}
                className="relative size-full"
              />
            ) : (
              <Image
                src={
                  t.dark
                    ? '/images/gold-constellation.png'
                    : '/images/monochrome-constellation.png'
                }
                alt={l.mapAlt}
                className={cn(
                  'relative size-full object-contain',
                  !t.dark && 'opacity-85',
                )}
                width={360}
                height={360}
              />
            )}
          </div>
          </div>
          )}

          {/* title block — omitted entirely when title/names/quote are empty */}
          {hasTextBlock && (
            <div
              className={cn(
                'flex w-full flex-col items-center text-center',
                full ? 'mt-auto' : 'mt-[9cqw]',
              )}
            >
              {hasTitle && (
                <h3 className="text-balance text-[7.2cqw] font-bold leading-[1.35]">
                  {p.title}
                </h3>
              )}
              {hasNames && (
                <p
                  className={cn(
                    'text-[4.4cqw] font-medium',
                    hasTitle ? 'mt-[1.6cqw]' : undefined,
                  )}
                  style={{ color: t.accent }}
                >
                  {p.names}
                </p>
              )}

              {showDivider && (
                <div className="mt-[3.6cqw]">
                  <Divider color={t.frame} />
                </div>
              )}

              {hasQuote && (
                <p
                  className={cn(
                    'max-w-[88%] text-balance text-[3.5cqw] leading-[1.9]',
                    showDivider || hasTitle || hasNames
                      ? 'mt-[3.4cqw]'
                      : undefined,
                  )}
                  style={{ color: t.muted }}
                >
                  {p.quote}
                </p>
              )}
            </div>
          )}

          {/* meta: place · date · time */}
          {meta.length > 0 && (
            <div
              className={cn(
                'flex w-full items-center justify-center gap-[3cqw] pt-[4cqw] text-[3.1cqw] font-medium',
                full ? 'mt-[4cqw]' : 'mt-auto',
              )}
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

          {l.watermark ? (
            <p
              className={cn(
                'text-[2.2cqw] tracking-[0.2em]',
                // in the full layout the text block already takes the free space above
                meta.length > 0 || (full && hasTextBlock) ? 'mt-[2.6cqw]' : 'mt-auto',
              )}
              style={{ color: t.muted }}
            >
              {l.watermark}
            </p>
          ) : null}

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
