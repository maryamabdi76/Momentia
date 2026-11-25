'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import {
  MAP_THEMES,
  mapPaperColor,
  type MapTheme,
  type TreasureMapData,
  type TreasureMapLabels,
} from '@/features/treasure-map/lib/map-svg';

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

type ProductFilter = 'all' | 'sky' | 'moon' | 'map';
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
    productMap: string;
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
    map: SectionCopy;
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
  mapData: TreasureMapData;
  mapLabels: TreasureMapLabels;
  mapThemeNames: Record<MapTheme, string>;
};

const GOLD_BUTTON =
  'inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#E6CF92] to-[#CEB47B] px-7 text-base font-bold text-[#0c142b] shadow-[0_12px_32px_-12px_rgba(206,180,123,0.75)] transition-all hover:from-[#EBD69E] hover:to-[#D6BC82] active:scale-[0.985] sm:w-auto sm:min-w-56 motion-reduce:transition-none';

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-all duration-200 motion-reduce:transition-none',
        active
          ? 'bg-[#CEB47B] font-bold text-[#0c142b] shadow-[0_6px_18px_-8px_rgba(206,180,123,0.8)]'
          : 'text-[#B9C4DA] hover:bg-white/8 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

/** A round colour sample: the paper of one look, ringed in gold when chosen. */
function Swatch({
  background,
  label,
  selected,
  onSelect,
}: {
  background: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="group flex min-w-0 flex-1 flex-col items-center gap-2 outline-none"
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-full transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-[#CEB47B] motion-reduce:transition-none',
          selected
            ? 'bg-[#CEB47B]/20 ring-2 ring-[#CEB47B] ring-offset-2 ring-offset-[#121c37]'
            : 'ring-1 ring-white/15 group-hover:ring-[#CEB47B]/60',
        )}
      >
        <span
          className={cn(
            'size-8 rounded-full ring-1 ring-black/20 transition-transform duration-200 motion-reduce:transition-none',
            selected ? 'scale-105' : 'group-hover:scale-105',
          )}
          style={{ background }}
        />
      </span>
      <span
        className={cn(
          'text-center text-[11px] leading-snug transition-colors',
          selected ? 'font-semibold text-white' : 'text-[#8F9BB5] group-hover:text-white',
        )}
      >
        {label}
      </span>
    </button>
  );
}

/** One product: its story and colours on one side, the poster on a lit stage on the other. */
function ProductCard({
  index,
  copy,
  premium,
  swatchTitle,
  swatches,
  href,
  personalize,
  note,
  children,
}: {
  index: number;
  copy: SectionCopy;
  premium?: React.ReactNode;
  swatchTitle: string;
  swatches: React.ReactNode;
  href: string;
  personalize: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-5 md:px-22 md:py-7">
      <div
        className={cn(
          'relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#131f3d]/95 to-[#0c1530]/95 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] md:p-10',
          'before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#CEB47B]/70 before:to-transparent',
        )}
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5 text-[14px] font-semibold text-[#E8D9B8]">
            <span aria-hidden className="h-5 w-1 rounded-full bg-[#CEB47B]" />
            {copy.family}
            {premium}
          </span>
          <span className="flex items-baseline gap-3 text-[12px] text-[#8F9BB5]">
            {copy.collection}
            <span aria-hidden className="text-3xl font-black leading-none text-white/10">
              {`۰${index + 1}`}
            </span>
          </span>
        </div>

        <div
          className={cn(
            'flex min-w-0 flex-col gap-10 xl:items-center xl:gap-16',
            index % 2 === 1 ? 'xl:flex-row-reverse' : 'xl:flex-row',
          )}
        >
          {/* on a phone the poster comes first: see it, then read about it */}
          <div className="order-first min-w-0 xl:order-none xl:flex-1">
            <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_32%,rgba(206,180,123,0.22),transparent_62%),linear-gradient(to_bottom,#101b38,#09112a)] px-6 py-10 ring-1 ring-white/10 md:min-h-[30rem]">
              <span
                aria-hidden
                className="absolute inset-x-[22%] bottom-6 h-6 rounded-[50%] bg-black/60 blur-xl"
              />
              <div className="relative w-full max-w-72 transition-transform duration-500 hover:-translate-y-1.5 hover:scale-[1.02] motion-reduce:transition-none">
                {children}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[#8F9BB5]">{note}</p>
          </div>

          <div className="flex min-w-0 flex-col gap-6 xl:max-w-xl xl:flex-1">
            <div>
              <h2 className="text-[30px] font-bold leading-[1.5] text-white md:text-[36px]">
                {copy.title}
              </h2>
              <p className="mt-3 text-[15px] leading-8 text-[#B9C4DA]">{copy.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {copy.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#CEB47B]/30 bg-[#CEB47B]/10 px-3 py-1 text-[11px] text-[#E8D9B8]"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
              <p className="mb-4 text-[13px] font-semibold text-[#E8D9B8]">{swatchTitle}</p>
              <div className="flex gap-2 sm:gap-3">{swatches}</div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={href} className={GOLD_BUTTON}>
                {personalize}
                <ArrowLeft className="size-4" />
              </Link>
              <p className="text-[12px] leading-relaxed text-[#8F9BB5]">{copy.footnote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplateSection({
  index,
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
  index: number;
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

  return (
    <ProductCard
      index={index}
      copy={copy}
      swatchTitle={t('selectedColor', { styleName: styleNames[selectedStyle] })}
      swatches={GALLERY_STYLES.map((s) => (
        <Swatch
          key={s}
          background={paperCss(POSTER_THEMES[s])}
          label={styleNames[s]}
          selected={s === selectedStyle}
          onSelect={() => onStyleChange(s)}
        />
      ))}
      href={href}
      personalize={personalize}
      note={showcaseNote}
    >
      {kind === 'moon' ? (
        moonBlock
      ) : (
        <PosterPreview
          className="max-w-none rounded-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
          size="default"
          showDisclaimer={false}
          sky={template === 'full' ? fullSky : sky}
          labels={posterLabels}
          data={{ style: selectedStyle, template, layers }}
        />
      )}
    </ProductCard>
  );
}

/** The treasure map: its own four looks instead of the five sky colours, and a way into the maker. */
function MapSection({
  index,
  copy,
  theme,
  onThemeChange,
  data,
  labels,
  themeNames,
  showcaseNote,
  personalize,
  premium,
}: {
  index: number;
  copy: SectionCopy;
  theme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  data: TreasureMapData;
  labels: TreasureMapLabels;
  themeNames: Record<MapTheme, string>;
  showcaseNote: string;
  personalize: string;
  premium: { label: string; tooltip: string };
}) {
  const t = useTranslations('PostersPage');

  return (
    <ProductCard
      index={index}
      copy={copy}
      premium={<PremiumMark {...premium} className="text-[#CEB47B]" />}
      swatchTitle={t('selectedColor', { styleName: themeNames[theme] })}
      swatches={MAP_THEMES.map((k) => (
        <Swatch
          key={k}
          background={mapPaperColor(k)}
          label={themeNames[k]}
          selected={k === theme}
          onSelect={() => onThemeChange(k)}
        />
      ))}
      href="/map"
      personalize={personalize}
      note={showcaseNote}
    >
      <MapPoster data={data} labels={labels} className="rounded-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]" />
    </ProductCard>
  );
}

/** Three posters fanned out like cards in a hand: the whole shop at a glance. */
function HeroFan({
  sky,
  posterLabels,
  layers,
  moon,
  mapData,
  mapLabels,
}: {
  sky: SkySnapshot | null;
  posterLabels: PosterLabels;
  layers: Partial<SkyLayers>;
  moon: React.ReactNode;
  mapData: TreasureMapData;
  mapLabels: TreasureMapLabels;
}) {
  const shadow = 'shadow-[0_30px_60px_-18px_rgba(0,0,0,0.95)]';
  return (
    <div aria-hidden className="pointer-events-none relative mx-auto h-[21rem] w-full max-w-sm shrink-0 md:h-[29rem] md:max-w-xl xl:mx-0 xl:w-[34rem]">
      <span className="absolute inset-x-6 top-1/2 h-48 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.25),transparent_70%)] blur-2xl" />
      {moon && (
        <div className="absolute left-[4%] top-12 w-36 -rotate-[9deg] md:w-48">{moon}</div>
      )}
      <div className="absolute right-[4%] top-12 w-36 rotate-[9deg] md:w-48">
        <MapPoster data={{ ...mapData, theme: 'paper', frame: 'minimal' }} labels={mapLabels} className={cn('rounded-none', shadow)} />
      </div>
      <div className="absolute left-1/2 top-0 z-10 w-40 -translate-x-1/2 md:w-60">
        <PosterPreview
          className={cn('max-w-none rounded-none', shadow)}
          size="default"
          showDisclaimer={false}
          sky={sky}
          labels={posterLabels}
          data={{ style: 'gold', template: 'circle', layers }}
        />
      </div>
    </div>
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
  mapData,
  mapLabels,
  mapThemeNames,
}: Props) {
  const [product, setProduct] = useState<ProductFilter>('all');
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all');
  const [styles, setStyles] = useState(DEFAULT_STYLE);
  const [mapTheme, setMapTheme] = useState<MapTheme>('paper');

  const showCircle = useMemo(() => {
    if (product === 'moon' || product === 'map') return false;
    if (templateFilter === 'full') return false;
    return true;
  }, [product, templateFilter]);

  const showFull = useMemo(() => {
    if (product === 'moon' || product === 'map') return false;
    if (templateFilter === 'circle') return false;
    return true;
  }, [product, templateFilter]);

  const showMoon = useMemo(() => {
    if (product === 'sky' || product === 'map') return false;
    if (templateFilter !== 'all') return false;
    return Boolean(moonFacts);
  }, [product, templateFilter, moonFacts]);

  // the treasure map has no sky templates, so a template filter hides it
  const showMap = (product === 'all' || product === 'map') && templateFilter === 'all';

  const descriptionLines = labels.description.split('\n');

  const moonPreview = moonFacts ? (
    <MoonPoster
      className="w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
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

  const fanMoon = moonFacts ? (
    <MoonPoster
      className="w-full shadow-[0_30px_60px_-18px_rgba(0,0,0,0.95)]"
      data={{
        ...moonSample,
        style: 'gold',
        title: 'بلندترین شب، کنار تو',
        names: 'شیرین و فرهاد',
        quote: '',
        dateLabel: '۳۰ آذر ۱۴۰۵',
      }}
      facts={moonFacts}
      labels={moonLabels}
    />
  ) : null;

  // the cards are numbered in the order they are shown
  let shown = 0;
  const next = () => shown++;

  return (
    <div dir="rtl" className="text-start">
      <div className="relative overflow-hidden px-6 pb-20 pt-8 md:px-[88px] md:pb-24">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 start-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(206,180,123,0.10),transparent_65%)]"
        />
        <p className="relative text-[12px] leading-relaxed text-[#8F9BB5]">{labels.breadcrumb}</p>
        <div className="relative mt-5 flex flex-col gap-12 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="bg-gradient-to-b from-white to-[#E8D9B8] bg-clip-text text-[36px] font-black leading-[1.5] text-transparent md:text-[54px]">
              {labels.title}
            </h1>
            <span aria-hidden className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-l from-[#CEB47B] to-[#CEB47B]/0" />
            <div className="mt-5 max-w-xl text-[16px] leading-9 text-[#B9C4DA] md:text-[18px]">
              {descriptionLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-6 inline-flex rounded-full border border-[#CEB47B]/35 bg-[#CEB47B]/10 px-4 py-1.5 text-[13px] text-[#E8D9B8]">
              {labels.statsLine}
            </p>
            <p className="mt-2 max-w-md text-[12px] leading-6 text-[#8F9BB5]">{labels.statsNote}</p>
          </div>
          <HeroFan
            sky={sky}
            posterLabels={posterLabels}
            layers={layers}
            moon={fanMoon}
            mapData={mapData}
            mapLabels={mapLabels}
          />
        </div>
      </div>

      <div className="relative z-10 -mt-8 px-6 md:px-[88px]">
        <div className="min-w-0 rounded-3xl border border-white/10 bg-[#0e1731]/90 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-5">
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-[12px] text-[#CEB47B]">{labels.filters.product}</span>
              <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-white/5 p-1 ring-1 ring-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <FilterChip active={product === 'all'} onClick={() => setProduct('all')}>
                  {labels.filters.productAll}
                </FilterChip>
                <FilterChip active={product === 'sky'} onClick={() => setProduct('sky')}>
                  {labels.filters.productSky}
                </FilterChip>
                <FilterChip active={product === 'moon'} onClick={() => setProduct('moon')}>
                  {labels.filters.productMoon}
                </FilterChip>
                <FilterChip active={product === 'map'} onClick={() => setProduct('map')}>
                  {labels.filters.productMap}
                </FilterChip>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-[12px] text-[#CEB47B]">{labels.filters.template}</span>
              <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-white/5 p-1 ring-1 ring-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <FilterChip active={templateFilter === 'all'} onClick={() => setTemplateFilter('all')}>
                  {labels.filters.templateAll}
                </FilterChip>
                <FilterChip active={templateFilter === 'circle'} onClick={() => setTemplateFilter('circle')}>
                  {labels.filters.templateCircle}
                </FilterChip>
                <FilterChip active={templateFilter === 'full'} onClick={() => setTemplateFilter('full')}>
                  {labels.filters.templateFull}
                </FilterChip>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#8F9BB5]">{labels.filters.paletteHint}</p>
        </div>
      </div>

      <div className="mt-6 px-6 md:mt-8 md:px-[88px]">
        <div className="flex items-center gap-4 rounded-2xl border border-[#CEB47B]/25 bg-[#CEB47B]/[0.07] px-5 py-4">
          <PremiumMark label={labels.premiumBadge} tooltip={labels.premiumBar} className="text-[#CEB47B]" />
          <p className="flex-1 text-[13px] leading-7 text-[#E8D9B8]">{labels.premiumBar}</p>
        </div>
      </div>

      {showCircle && (
        <TemplateSection
          index={next()}
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
          index={next()}
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
          index={next()}
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

      {showMap && (
        <MapSection
          index={next()}
          copy={labels.sections.map}
          theme={mapTheme}
          onThemeChange={setMapTheme}
          data={{ ...mapData, theme: mapTheme, frame: mapTheme === 'ink' ? 'classic' : 'minimal' }}
          labels={mapLabels}
          themeNames={mapThemeNames}
          showcaseNote={labels.showcaseNote}
          personalize={labels.personalize}
          premium={{ label: labels.premiumBadge, tooltip: labels.premiumBar }}
        />
      )}
    </div>
  );
}
