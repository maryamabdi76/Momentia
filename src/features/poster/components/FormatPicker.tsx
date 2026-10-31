'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import { formatDecimal, toPersianDigits } from '../lib/digits';
import {
  EXPORT_FORMATS,
  formatGeometry,
  formatSpec,
  getExportFormat,
  type ExportFormat,
  type ExportFormatId,
  type FormatSpec,
} from '../lib/export-formats';

const GROUPS = ['digital', 'print'] as const;
type Group = (typeof GROUPS)[number];

const groupOf = (format: ExportFormat): Group => (format.kind === 'pdf' ? 'print' : 'digital');

/** A width × height pair; kept left-to-right so it reads the same in any script. */
function Dims({ w, h, cm }: { w: number; h: number; cm?: boolean }) {
  const text = cm
    ? `${formatDecimal(w / 10)}×${formatDecimal(h / 10)}`
    : `${toPersianDigits(String(Math.round(w)))}×${toPersianDigits(String(Math.round(h)))}`;
  return <bdi dir="ltr">{text}</bdi>;
}

/** The page and the poster on it, drawn to scale. */
function Thumb({ format, selected }: { format: ExportFormat; selected: boolean }) {
  const { pageW, pageH, poster } = formatGeometry(format);
  const height = 60;
  const width = Math.round((height * pageW) / pageH);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${pageW} ${pageH}`}
      width={width}
      height={height}
      className="shrink-0 rounded-[3px]"
    >
      <rect width={pageW} height={pageH} fill={selected ? '#3a4d78' : '#26385a'} />
      <rect
        x={poster.x}
        y={poster.y}
        width={poster.w}
        height={poster.h}
        fill="#0f2147"
        stroke="#CEB47B"
        strokeWidth={pageW * 0.012}
      />
    </svg>
  );
}

function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-[11px] text-[#AAB6CD]">{label}</dt>
      <dd className="text-end text-[12px] font-semibold text-white">{children}</dd>
    </div>
  );
}

function Specs({ id }: { id: ExportFormatId }) {
  const t = useTranslations('CreatePage.step3.formats');
  const format = getExportFormat(id);
  const spec: FormatSpec = formatSpec(format);

  const quality = (dpi: number) => (dpi >= 300 ? 'great' : dpi >= 180 ? 'good' : 'fair');

  return (
    <div className="rounded-xl border border-[#33415B] bg-[#0f1a31] px-4 py-2">
      <p className="pt-1 text-[11px] font-semibold text-[#E8D9B8]">{t('specsTitle')}</p>
      <dl className="divide-y divide-[#33415B]/60">
        {spec.kind === 'raster' ? (
          <>
            <SpecRow label={t('specs.image')}>
              <Dims w={spec.page.w} h={spec.page.h} /> {t('units.px')}
            </SpecRow>
            {id !== 'poster' && (
              <SpecRow label={t('specs.posterInImage')}>
                <Dims w={spec.poster.w} h={spec.poster.h} /> {t('units.px')}
              </SpecRow>
            )}
            <SpecRow label={t('specs.ratio')}>{t(`items.${id}.ratio`)}</SpecRow>
            <SpecRow label={t('specs.fileType')}>{t('fileTypes.png')}</SpecRow>
          </>
        ) : (
          <>
            <SpecRow label={t('specs.paper')}>
              <Dims w={spec.page.w} h={spec.page.h} cm /> {t('units.cm')}
            </SpecRow>
            <SpecRow label={t('specs.posterOnPaper')}>
              <Dims w={spec.poster.w} h={spec.poster.h} cm /> {t('units.cm')}
            </SpecRow>
            <SpecRow label={t('specs.margin')}>
              {spec.gapX < 0.5 && spec.gapY < 0.5
                ? t('specs.noMargin')
                : t('specs.marginValue', {
                    x: formatDecimal(spec.gapX / 10),
                    y: formatDecimal(spec.gapY / 10),
                  })}
            </SpecRow>
            <SpecRow label={t('specs.quality')}>
              {t('specs.dpiValue', {
                dpi: toPersianDigits(String(spec.dpi)),
                quality: t(`quality.${quality(spec.dpi)}`),
              })}
            </SpecRow>
            <SpecRow label={t('specs.fileType')}>{t('fileTypes.pdf')}</SpecRow>
          </>
        )}
      </dl>
    </div>
  );
}

type Props = {
  value: ExportFormatId;
  onChange: (id: ExportFormatId) => void;
};

/**
 * Which file to download. Two groups (image, print), each format drawn as a
 * page with the poster on it to scale, and the exact sizes of the chosen one below.
 */
export function FormatPicker({ value, onChange }: Props) {
  const t = useTranslations('CreatePage.step3.formats');
  const current = getExportFormat(value);
  const group = groupOf(current);
  const options = EXPORT_FORMATS.filter((f) => groupOf(f) === group);

  return (
    <fieldset className="space-y-3">
      <legend className="text-[12px] font-semibold text-[#E8D9B8]">{t('title')}</legend>

      <div
        role="tablist"
        aria-label={t('title')}
        className="grid grid-cols-2 gap-1 rounded-xl bg-[#0f1a31] p-1"
      >
        {GROUPS.map((g) => {
          const active = g === group;
          return (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (!active) onChange(EXPORT_FORMATS.find((f) => groupOf(f) === g)!.id);
              }}
              className={cn(
                'cursor-pointer rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50 focus-visible:outline-none',
                active ? 'bg-[#CEB47B] text-[#0c142b]' : 'text-[#AAB6CD] hover:text-white',
              )}
            >
              {t(`groups.${g}`)}
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label={t(`groups.${group}`)} className="space-y-2">
        {options.map((f) => {
          const selected = f.id === value;
          const spec = formatSpec(f);
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(f.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-start transition-colors focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50 focus-visible:outline-none',
                selected
                  ? 'border-[#CEB47B]/80 bg-[#CEB47B]/10'
                  : 'border-[#33415B] hover:border-[#CEB47B]/40',
              )}
            >
              <Thumb format={f} selected={selected} />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-[13px] font-semibold',
                    selected ? 'text-white' : 'text-white/75',
                  )}
                >
                  {t(`items.${f.id}.label`)}
                </span>
                <span className="block text-[11px] leading-5 text-[#AAB6CD]">
                  {t(`items.${f.id}.hint`)}
                </span>
              </span>
              <span className="shrink-0 text-end text-[11px] leading-5 text-[#E8D9B8]">
                <Dims w={spec.page.w} h={spec.page.h} cm={spec.kind === 'pdf'} />
                <span className="block text-[10px] text-[#AAB6CD]">
                  {spec.kind === 'pdf' ? t('units.cm') : t('units.px')}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Specs id={value} />
      <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('note')}</p>
      {group === 'print' && (
        <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('printNote')}</p>
      )}
    </fieldset>
  );
}
