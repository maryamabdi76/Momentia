'use client';

import { useTranslations } from 'next-intl';
import type { MapLayout } from '../lib/map-svg';

const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A tiny drawing of what each layout looks like. */
function Sketch({ layout }: { layout: MapLayout }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16 shrink-0" aria-hidden>
      {layout === 'single' && (
        <>
          <circle cx="32" cy="22" r="17" {...LINE} />
          <path d="M20 30Q27 18 33 24T45 13" {...LINE} strokeDasharray="1 4" />
          <circle cx="20" cy="30" r="2.4" fill="currentColor" />
          <circle cx="45" cy="13" r="2.4" fill="currentColor" />
        </>
      )}
      {layout === 'cards' && (
        <>
          <circle cx="12" cy="22" r="9" {...LINE} />
          <circle cx="32" cy="22" r="9" {...LINE} />
          <circle cx="52" cy="22" r="9" {...LINE} />
        </>
      )}
      {layout === 'road' && (
        <>
          <path d="M58 7Q40 5 24 11T8 22Q14 31 32 31T56 38" {...LINE} strokeWidth={5} opacity={0.35} />
          <path d="M58 7Q40 5 24 11T8 22Q14 31 32 31T56 38" {...LINE} strokeDasharray="2 4" />
          <rect x="35" y="3" width="11" height="9" rx="2" fill="currentColor" opacity={0.85} />
          <rect x="10" y="17" width="11" height="9" rx="2" fill="currentColor" opacity={0.85} />
          <rect x="42" y="27" width="11" height="9" rx="2" fill="currentColor" opacity={0.85} />
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

/** Choose how the map is drawn: each option is a card with a small sketch and one line about it. */
export function LayoutChoice({ layouts, value, onChange }: Props) {
  const t = useTranslations('MapPage');
  return (
    <div role="radiogroup" aria-label={t('layoutLabel')} className="grid gap-2">
      {layouts.map((key) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(key)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50 ${on ? 'border-[#CEB47B] bg-[#CEB47B]/10 text-[#CEB47B]' : 'border-[#33415B] text-white/70 hover:bg-white/5'}`}
          >
            <Sketch layout={key} />
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-medium ${on ? 'text-[#CEB47B]' : 'text-white/90'}`}>{t(`layout.${key}.label`)}</span>
              <span className="mt-0.5 block text-[11px] leading-5 text-[#AAB6CD]">{t(`layout.${key}.hint`)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
