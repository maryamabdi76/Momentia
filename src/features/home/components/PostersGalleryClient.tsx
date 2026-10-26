'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import { MoonPoster } from '@/features/moon/components/MoonPoster';
import type {
  MoonFacts,
  MoonLabels,
  MoonPosterData,
} from '@/features/moon/lib/moon-svg';
import {
  PosterPreview,
  type PosterLabels,
  type PosterStyle,
} from '@/features/poster/components/PosterPreview';
import type { PosterTemplate } from '@/features/poster/lib/templates';
import { POSTER_THEMES, paperCss } from '@/features/poster/lib/themes';
import type { SkyLayers } from '@/features/sky/lib/layers';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { PremiumMark } from '@/features/poster/components/PremiumMark';

const GALLERY_STYLES: PosterStyle[] = [
  'gold',
  'black',
  'violet',
  'parchment',
  'mono',
];

const DEFAULT_STYLE: Record<'circle' | 'full' | 'moon', PosterStyle> = {
  circle: 'gold',
  full: 'gold',
  moon: 'gold',
};

type ProductFilter = 'all' | 'sky' | 'moon';
type TemplateFilter = 'all' | 'circle' | 'full';

export type PostersGalleryLabels = {
  breadcrumb: string;
  statsLine: string;
  statsNote: string;
  title: string;
  description: string;
  filters: {
    product: string;
    productAll: string;
    productSky: string;
    productMoon: string;
    template: string;
    templateAll: string;
    templateCircle: string;
    templateFull: string;
    paletteHint: string;
  };
  premiumBar: string;
  premiumBadge: string;
  showcaseNote: string;
  personalize: string;
  styleNames: Record<PosterStyle, string>;
  sections: {
    circle: SectionCopy;
    full: SectionCopy;
    moon: SectionCopy;
  };
};

type SectionCopy = {
  collection: string;
  family: string;
  title: string;
  description: string;
  badges: string[];
  footnote: string;
};

type Props = {
  labels: PostersGalleryLabels;
  posterLabels: PosterLabels;
  sky: SkySnapshot | null;
  fullSky: SkySnapshot | null;
  moonFacts: MoonFacts | null;
  moonLabels: MoonLabels;
  moonSample: Omit<
    MoonPosterData,
    'style' | 'title' | 'names' | 'quote' | 'dateLabel'
  >;
  layers: Partial<SkyLayers>;
};

function FilterChip({
  active,
  dark,
  children,
  onClick,
}: {
  active: boolean;
  dark?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-xl px-4 py-1.5 text-[13px] whitespace-nowrap transition-all duration-200',
        dark
          ? active
            ? 'bg-[#f5f1e8] font-medium text-[#0b1428] shadow-sm'
            : 'bg-white/5 font-normal text-[#b7c0ce] hover:bg-white/10 hover:text-[#f5f1e8]'
          : active
            ? 'bg-[#0b1428] font-medium text-[#f5f1e8] shadow-sm'
            : 'bg-[#0b1428]/5 font-normal text-[#69717c] hover:bg-[#0b1428]/10 hover:text-[#172338]',
      )}
    >
      {children}
    </button>
  );
}

function StyleSwatch({
  style,
  label,
  selected,
  onSelect,
}: {
  style: PosterStyle;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = POSTER_THEMES[style];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="group flex min-w-0 flex-1 flex-col items-center gap-2"
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full transition-all duration-200',
          selected
            ? 'bg-[#c9ae75]/15 ring-2 ring-[#c9ae75] ring-offset-2 ring-offset-[#f5f1e8]'
            : 'ring-1 ring-[#dad4c7]/80 group-hover:ring-[#c9ae75]/50',
        )}
      >
        <span
          className={cn(
            'size-7 rounded-full transition-transform duration-200',
            selected ? 'scale-105' : 'group-hover:scale-105',
          )}
          style={{ background: paperCss(theme) }}
        />
      </span>
      <span
        className={cn(
          'text-center text-[11px] leading-snug transition-colors duration-200',
          selected
            ? 'font-semibold text-[#172338]'
            : 'font-normal text-[#69717c] group-hover:text-[#172338]',
        )}
      >
        {label}
      </span>
    </button>
  );
}

function PreviewPanel({
  note,
  children,
}: {
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-h-90 items-center justify-center rounded-xl bg-gradient-to-b from-[#ebe6dc] to-[#e0dbd0] px-6 py-10 md:min-h-[440px] md:px-12">
        <div className="w-full max-w-70 transition-transform duration-300 hover:scale-[1.02]">
          {children}
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-[#69717c]">{note}</p>
    </div>
  );
}

function TemplateSection({
  copy,
  template,
  kind,
  selectedStyle,
  onStyleChange,
  href,
  sky,
  fullSky,
  layers,
  posterLabels,
  styleNames,
  showcaseNote,
  personalize,
  moonBlock,
}: {
  copy: SectionCopy;
  template: PosterTemplate;
  kind: 'circle' | 'full' | 'moon';
  selectedStyle: PosterStyle;
  onStyleChange: (style: PosterStyle) => void;
  href: string;
  sky: SkySnapshot | null;
  fullSky: SkySnapshot | null;
  layers: Partial<SkyLayers>;
  posterLabels: PosterLabels;
  styleNames: Record<PosterStyle, string>;
  showcaseNote: string;
  personalize: string;
  moonBlock?: React.ReactNode;
}) {
  const t = useTranslations('PostersPage');
  const selectedName = styleNames[selectedStyle];

  return (
    <section className="border-b border-[#dad4c7]/50 p-6 md:px-22">
      <div className="mb-8 flex flex-col gap-1 text-[13px] md:flex-row md:items-center md:justify-between">
        <span className="text-[14px] font-medium tracking-wide text-[#172338]">
          {copy.family}
        </span>
        <span className="text-[#69717c]">{copy.collection}</span>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-14 h-full">
        <div className="flex w-full shrink-0 flex-col gap-6 xl:max-w-2xl">
          <div>
            <h2 className="text-[30px] font-semibold leading-snug tracking-tight text-[#172338] md:text-[34px]">
              {copy.title}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.8] text-[#69717c]">
              {copy.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {copy.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-lg bg-[#0b1428]/90 px-3 py-1 text-[11px] text-[#f5f1e8]"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-[#f5f1e8]/70 p-4 ring-1 ring-[#dad4c7]/60">
            <p className="mb-4 text-[13px] font-medium text-[#172338]">
              {t('selectedColor', { styleName: selectedName })}
            </p>
            <div className="flex gap-2 sm:gap-3">
              {GALLERY_STYLES.map((s) => (
                <StyleSwatch
                  key={s}
                  style={s}
                  label={styleNames[s]}
                  selected={s === selectedStyle}
                  onSelect={() => onStyleChange(s)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <Link
              href={href}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-xl bg-[#c9ae75] px-6 text-[15px] font-semibold text-[#0b1428] transition-all duration-200 hover:bg-[#d5bc83] hover:shadow-md sm:w-auto sm:min-w-[220px]"
            >
              {personalize}
            </Link>
            <p className="text-[12px] leading-relaxed text-[#69717c]">
              {copy.footnote}
            </p>
          </div>
        </div>

        <PreviewPanel note={showcaseNote}>
          {kind === 'moon' ? (
            moonBlock
          ) : (
            <PosterPreview
              className="max-w-none rounded-none shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
              size="default"
              showDisclaimer={false}
              sky={template === 'full' ? fullSky : sky}
              labels={posterLabels}
              data={{ style: selectedStyle, template, layers }}
            />
          )}
        </PreviewPanel>
      </div>
    </section>
  );
}

export function PostersGalleryClient({
  labels,
  posterLabels,
  sky,
  fullSky,
  moonFacts,
  moonLabels,
  moonSample,
  layers,
}: Props) {
  const [product, setProduct] = useState<ProductFilter>('all');
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all');
  const [styles, setStyles] = useState(DEFAULT_STYLE);

  const showCircle = useMemo(() => {
    if (product === 'moon') return false;
    if (templateFilter === 'full') return false;
    return true;
  }, [product, templateFilter]);

  const showFull = useMemo(() => {
    if (product === 'moon') return false;
    if (templateFilter === 'circle') return false;
    return true;
  }, [product, templateFilter]);

  const showMoon = useMemo(() => {
    if (product === 'sky') return false;
    if (templateFilter !== 'all') return false;
    return Boolean(moonFacts);
  }, [product, templateFilter, moonFacts]);

  const descriptionLines = labels.description.split('\n');

  const moonPreview = moonFacts ? (
    <MoonPoster
      className="w-full shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
      data={{
        ...moonSample,
        style: styles.moon,
        title: 'بلندترین شب، کنار تو',
        names: 'شیرین و فرهاد',
        quote: '',
        dateLabel: '۳۰ آذر ۱۴۰۵',
      }}
      facts={moonFacts}
      labels={moonLabels}
    />
  ) : null;

  return (
    <div dir="rtl" className="text-start">
      <div className="bg-[#0b1428] px-6 pb-16 pt-8 md:px-[88px] md:pb-20">
        <p className="text-[12px] leading-relaxed text-[#b7c0ce]">
          {labels.breadcrumb}
        </p>
        <div className="mt-3.5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <h1 className="text-[32px] font-medium leading-snug text-[#f5f1e8] md:text-[46px]">
              {labels.title}
            </h1>
            <div className="mt-2.5 space-y-0 text-[16px] leading-relaxed text-[#b7c0ce] md:text-[18px]">
              {descriptionLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <div className="xl:w-[370px] xl:text-end">
            <p className="text-[15px] text-[#c9ae75]">{labels.statsLine}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#b7c0ce]">
              {labels.statsNote}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-8 px-6 md:-mt-10 md:px-[88px]">
        <div className="rounded-xl bg-[#0b1428] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/10 md:px-8 md:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {' '}
              <span className="me-1 text-[12px] text-[#c9ae75]">
                {labels.filters.product}
              </span>
              <FilterChip
                dark
                active={product === 'all'}
                onClick={() => setProduct('all')}
              >
                {labels.filters.productAll}
              </FilterChip>
              <FilterChip
                dark
                active={product === 'sky'}
                onClick={() => setProduct('sky')}
              >
                {labels.filters.productSky}
              </FilterChip>
              <FilterChip
                dark
                active={product === 'moon'}
                onClick={() => setProduct('moon')}
              >
                {labels.filters.productMoon}
              </FilterChip>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-[12px] text-[#c9ae75]">
                {labels.filters.template}
              </span>
              <FilterChip
                dark
                active={templateFilter === 'all'}
                onClick={() => setTemplateFilter('all')}
              >
                {labels.filters.templateAll}
              </FilterChip>
              <FilterChip
                dark
                active={templateFilter === 'circle'}
                onClick={() => setTemplateFilter('circle')}
              >
                {labels.filters.templateCircle}
              </FilterChip>
              <FilterChip
                dark
                active={templateFilter === 'full'}
                onClick={() => setTemplateFilter('full')}
              >
                {labels.filters.templateFull}
              </FilterChip>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-[12px] text-[#b7c0ce] xl:max-w-xs">
              {labels.filters.paletteHint}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {GALLERY_STYLES.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 text-[11px] text-[#e8e3d9]/90"
                >
                  {labels.styleNames[s]}
                  <span
                    className="size-[17px] rounded-full ring-1 ring-white/15"
                    style={{ background: POSTER_THEMES[s].paperStops[0]![1] }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 bg-[#ede5d4]/80 px-6 py-[18px] md:mt-8 md:px-[88px]">
        <PremiumMark
          label={labels.premiumBadge}
          tooltip={labels.premiumBar}
          className="text-[#172338]"
        />
        <p className="flex-1 text-[13px] leading-relaxed text-[#172338]">
          {labels.premiumBar}
        </p>
      </div>

      {showCircle && (
        <TemplateSection
          copy={labels.sections.circle}
          template="circle"
          kind="circle"
          selectedStyle={styles.circle}
          onStyleChange={(s) => setStyles((prev) => ({ ...prev, circle: s }))}
          href={`/create?style=${styles.circle}&template=circle`}
          sky={sky}
          fullSky={fullSky}
          layers={layers}
          posterLabels={posterLabels}
          styleNames={labels.styleNames}
          showcaseNote={labels.showcaseNote}
          personalize={labels.personalize}
        />
      )}

      {showFull && (
        <TemplateSection
          copy={labels.sections.full}
          template="full"
          kind="full"
          selectedStyle={styles.full}
          onStyleChange={(s) => setStyles((prev) => ({ ...prev, full: s }))}
          href={`/create?style=${styles.full}&template=full`}
          sky={sky}
          fullSky={fullSky}
          layers={layers}
          posterLabels={posterLabels}
          styleNames={labels.styleNames}
          showcaseNote={labels.showcaseNote}
          personalize={labels.personalize}
        />
      )}

      {showMoon && moonPreview && (
        <TemplateSection
          copy={labels.sections.moon}
          template="circle"
          kind="moon"
          selectedStyle={styles.moon}
          onStyleChange={(s) => setStyles((prev) => ({ ...prev, moon: s }))}
          href={`/moon?style=${styles.moon}`}
          sky={sky}
          fullSky={fullSky}
          layers={layers}
          posterLabels={posterLabels}
          styleNames={labels.styleNames}
          showcaseNote={labels.showcaseNote}
          personalize={labels.personalize}
          moonBlock={moonPreview}
        />
      )}
    </div>
  );
}
