'use client';

import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FramePicker } from '@/features/poster/components/FramePicker';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { MAX_LENGTH } from '../lib/sanitize';
import { mapFrameColors, mapPaperColor, mapThemeSwatch, MAP_SHAPES, MAP_THEMES } from '../lib/map-svg';
import type { TreasureMapValues } from '../lib/schemas';
import { choiceClass, fieldClass } from './field-class';
import { ActionBar, Panel, StepHeader, ctaPrimary, ctaSecondary } from '@/components/form/FormShell';

type Props = {
  form: UseFormReturn<TreasureMapValues>;
  onNext: () => void;
  onBack: () => void;
};

/** Step 2: the look: title, names, colour, shape and border. */
export function MapStep2({ form, onNext, onBack }: Props) {
  const t = useTranslations('MapPage');
  const { control, register } = form;
  const scope = useWatch({ control, name: 'scope' });
  const layout = useWatch({ control, name: 'layout' });
  const theme = useWatch({ control, name: 'theme' }) ?? 'paper';
  const titleLength = [...(useWatch({ control, name: 'title' }) ?? '')].length;
  const namesLength = [...(useWatch({ control, name: 'names' }) ?? '')].length;
  const counter = (n: number, max: number) => (
    <span className="text-[11px] text-[#AAB6CD]" aria-hidden>
      {toPersianDigits(String(n))}/{toPersianDigits(String(max))}
    </span>
  );

  return (
    <div className="space-y-6">
      <StepHeader title={t('step2.title')} description={t('step2.description')} />

      <Panel title={t('wordsTitle')}>
        <label className="block space-y-1.5">
          <span className="flex items-center justify-between">
            <span className="text-[12px] text-[#AAB6CD]">{t('titleLabel')}</span>
            {counter(titleLength, MAX_LENGTH.title)}
          </span>
          <Input {...register('title')} maxLength={MAX_LENGTH.title} className={`${fieldClass} h-12 text-base`} placeholder={t('titlePlaceholder')} />
        </label>
        <label className="block space-y-1.5">
          <span className="flex items-center justify-between">
            <span className="text-[12px] text-[#AAB6CD]">{t('namesLabel')}</span>
            {counter(namesLength, MAX_LENGTH.names)}
          </span>
          <Input {...register('names')} maxLength={MAX_LENGTH.names} className={fieldClass} placeholder={t('namesPlaceholder')} />
        </label>
      </Panel>

      <Panel title={t('themeLabel')}>
        <Controller
          control={control}
          name="theme"
          render={({ field: f }) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label={t('themeLabel')}>
              {MAP_THEMES.map((key) => {
                const on = f.value === key;
                const c = mapThemeSwatch(key);
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => f.onChange(key)}
                    className={`relative space-y-2 rounded-2xl border p-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60 ${
                      on ? 'border-[#CEB47B] bg-[#CEB47B]/10 shadow-[0_0_0_4px_rgba(206,180,123,0.12)]' : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    {/* a scrap of the map in this theme's own colours */}
                    <svg viewBox="0 0 80 56" className="h-auto w-full rounded-lg" aria-hidden>
                      <rect width="80" height="56" fill={c.bg} />
                      <path d="M0 38Q20 30 36 40T80 34V56H0Z" fill={c.water} />
                      <path d="M46 0H80V20Q62 24 52 14Z" fill={c.park} />
                      <path d="M0 8Q16 4 30 12T40 30Q24 24 0 26Z" fill={c.land} />
                      <path d="M10 46Q30 20 48 30T70 12" fill="none" stroke={c.accent} strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
                      <circle cx="10" cy="46" r="3.4" fill={c.accent} />
                      <circle cx="70" cy="12" r="3.4" fill={c.accent} />
                      <rect x="1" y="1" width="78" height="54" fill="none" stroke={c.ink} strokeOpacity={0.5} strokeWidth="0.8" />
                    </svg>
                    <span className={`block text-[13px] ${on ? 'font-bold text-[#CEB47B]' : 'text-white/80'}`}>{t(`theme.${key}`)}</span>
                    {on && (
                      <span className="absolute end-2 top-2 flex size-5 items-center justify-center rounded-full bg-[#CEB47B] text-[#0c142b]">
                        <Check className="size-3" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Panel>

      {layout !== 'road' && (layout === 'cards' || scope !== 'iran') && (
        <Panel title={t('shapeLabel')}>
          <Controller
            control={control}
            name="shape"
            render={({ field: f }) => (
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={t('shapeLabel')}>
                {MAP_SHAPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={f.value === key}
                    onClick={() => f.onChange(key)}
                    className={`flex flex-col items-center gap-2 py-3 ${choiceClass(f.value === key)} h-auto`}
                  >
                    <svg viewBox="0 0 40 40" className="size-9" aria-hidden fill="currentColor" fillOpacity={0.18} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      {key === 'circle' && <circle cx="20" cy="20" r="15" />}
                      {key === 'square' && <rect x="6" y="6" width="28" height="28" rx="2" />}
                      {key === 'arch' && <path d="M7 35V19a13 13 0 0 1 26 0v16Z" />}
                      {key === 'heart' && <path d="M20 34C8 25 5 18 5 13a8 8 0 0 1 15-3 8 8 0 0 1 15 3c0 5-3 12-15 21Z" />}
                    </svg>
                    <span className="text-[12px]">{t(`shape.${key}`)}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </Panel>
      )}

      <Panel>
        <Controller
          control={control}
          name="frame"
          render={({ field: f }) => (
            <FramePicker
              value={f.value}
              onChange={f.onChange}
              colors={{ paper: mapPaperColor(theme), ...mapFrameColors(theme) }}
            />
          )}
        />
      </Panel>

      <ActionBar>
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button type="button" variant="outline" onClick={onBack} className={`${ctaSecondary} px-5`}>
            <ArrowRight className="size-4" />
            {t('back')}
          </Button>
          <Button type="button" onClick={onNext} className={ctaPrimary}>
            {t('step2.next')}
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </ActionBar>
    </div>
  );
}
