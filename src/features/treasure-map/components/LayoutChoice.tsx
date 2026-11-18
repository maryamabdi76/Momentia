'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MapLayout } from '../lib/map-svg';

const INK = '#2A2733';
const CLAY = '#B4513C';
const LINE = { fill: 'none', stroke: INK, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A small drawing of the finished poster, on paper, for each layout. */
function Sketch({ layout }: { layout: MapLayout }) {
  const landscape = layout === 'cards';
  return (
    <svg viewBox={landscape ? '0 0 120 84' : '0 0 84 120'} className={landscape ? 'h-[84px] w-[120px]' : 'h-[120px] w-[84px]'} aria-hidden>
      <rect width="100%" height="100%" rx="4" fill="#F6F0E4" />
      <rect x="4" y="4" width={landscape ? 112 : 76} height={landscape ? 76 : 112} rx="2" fill="none" stroke={INK} strokeOpacity={0.35} strokeWidth="0.8" />
      {layout === 'single' && (
        <>
          <rect x="26" y="12" width="32" height="4" rx="2" fill={INK} />
          <circle cx="42" cy="52" r="26" fill="#EFE6D5" stroke={INK} strokeWidth="1.6" />
          <path d="M26 64Q34 44 44 54T58 36" {...LINE} stroke={CLAY} strokeDasharray="1 3.5" strokeWidth="2" />
          <circle cx="26" cy="64" r="3" fill={CLAY} />
          <circle cx="44" cy="54" r="3" fill={CLAY} />
          <circle cx="58" cy="36" r="3" fill={CLAY} />
          <rect x="22" y="90" width="40" height="3" rx="1.5" fill={INK} opacity={0.5} />
          <rect x="16" y="98" width="52" height="3" rx="1.5" fill={INK} opacity={0.25} />
          <rect x="16" y="105" width="52" height="3" rx="1.5" fill={INK} opacity={0.25} />
        </>
      )}
      {layout === 'cards' && (
        <>
          <rect x="44" y="11" width="32" height="4" rx="2" fill={INK} />
          {[24, 60, 96].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="44" r="14" fill="#EFE6D5" stroke={INK} strokeWidth="1.4" />
              <circle cx={cx} cy="44" r="2.6" fill={CLAY} />
              <rect x={cx - 11} y="64" width="22" height="3" rx="1.5" fill={INK} opacity={0.55} />
              <rect x={cx - 8} y="70" width="16" height="2.4" rx="1.2" fill={INK} opacity={0.25} />
            </g>
          ))}
        </>
      )}
      {layout === 'road' && (
        <>
          <path d="M60 24Q74 32 62 42T24 54Q12 62 28 72T62 92" fill="none" stroke={CLAY} strokeOpacity={0.35} strokeWidth="5" strokeLinecap="round" />
          <path d="M60 24Q74 32 62 42T24 54Q12 62 28 72T62 92" {...LINE} stroke={CLAY} strokeDasharray="1.5 3.5" strokeWidth="1.4" />
          {[[60, 24], [34, 50], [60, 74]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="10" fill="#FBF8F1" />
              <rect x={x! - 5.5} y={y! - 5.5} width="11" height="11" rx="2.5" fill={CLAY} opacity={0.85} />
            </g>
          ))}
          <rect x="22" y="10" width="40" height="4" rx="2" fill={INK} />
          <rect x="26" y="104" width="32" height="3" rx="1.5" fill={INK} opacity={0.4} />
        </>
      )}
    </svg>
  );
}

type Props = {
  layouts: readonly MapLayout[];
  value: MapLayout;
  onChange: (layout: MapLayout) => void;
};

/** Choose how the map is drawn: each option is a card showing the finished poster, with one line about it. */
export function LayoutChoice({ layouts, value, onChange }: Props) {
  const t = useTranslations('MapPage');
  return (
    <div role="radiogroup" aria-label={t('layoutLabel')} className="grid gap-3 sm:grid-cols-3">
      {layouts.map((key) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(key)}
            className={`group relative flex items-center gap-4 rounded-2xl border p-3 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60 sm:flex-col sm:items-stretch sm:gap-3 ${
              on ? 'border-[#CEB47B] bg-[#CEB47B]/10 shadow-[0_0_0_4px_rgba(206,180,123,0.12)]' : 'border-white/10 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/5 motion-reduce:hover:translate-y-0'
            }`}
          >
            <span className="flex shrink-0 items-center justify-center rounded-xl bg-[#0a1226]/70 p-2 sm:py-4">
              <Sketch layout={key} />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className={`block text-sm font-bold ${on ? 'text-[#CEB47B]' : 'text-white/90'}`}>{t(`layout.${key}.label`)}</span>
              <span className="block text-[12px] leading-5 text-[#AAB6CD]">{t(`layout.${key}.hint`)}</span>
            </span>
            {on && (
              <span className="absolute end-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#CEB47B] text-[#0c142b]">
                <Check className="size-3" aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
