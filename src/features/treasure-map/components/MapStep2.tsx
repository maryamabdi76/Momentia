'use client';

import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FramePicker } from '@/features/poster/components/FramePicker';
import { mapFrameColors, mapPaperColor, MAP_THEMES } from '../lib/map-svg';
import type { TreasureMapValues } from '../lib/schemas';
import { choiceClass, fieldClass } from './field-class';

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
  const title = useWatch({ control, name: 'title' });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-[#CEB47B]">{t('step2.stepLabel')}</p>
        <h1 className="text-3xl font-bold text-white">{t('step2.title')}</h1>
        <p className="text-sm leading-7 text-white/55">{t('step2.description')}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#33415B] bg-[#142039] p-5">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-[#E8D9B8]">{t('titleLabel')}</span>
          <Input {...register('title')} maxLength={40} className={fieldClass} placeholder={t('titlePlaceholder')} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-[#E8D9B8]">{t('namesLabel')}</span>
          <Input {...register('names')} maxLength={40} className={fieldClass} placeholder={t('namesPlaceholder')} />
        </label>

        <div className="space-y-2">
          <span className="text-[13px] font-medium text-[#E8D9B8]">{t('themeLabel')}</span>
          <Controller
            control={control}
            name="theme"
            render={({ field: f }) => (
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('themeLabel')}>
                {MAP_THEMES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={f.value === key}
                    onClick={() => f.onChange(key)}
                    className={`flex items-center justify-center gap-2 ${choiceClass(f.value === key)}`}
                  >
                    <span
                      aria-hidden
                      className="size-4 rounded-full border border-white/30"
                      style={{ background: mapPaperColor(key) }}
                    />
                    {t(`theme.${key}`)}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {(layout === 'cards' || scope !== 'iran') && (
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-[#E8D9B8]">{t('shapeLabel')}</span>
            <Controller
              control={control}
              name="shape"
              render={({ field: f }) => (
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('shapeLabel')}>
                  {(['circle', 'heart'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={f.value === key}
                      onClick={() => f.onChange(key)}
                      className={choiceClass(f.value === key)}
                    >
                      {t(`shape.${key}`)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        )}

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
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 gap-2 border-[#33415B] bg-transparent px-5 text-sm text-[#E8D9B8] hover:bg-white/5"
        >
          <ArrowRight className="size-4" />
          {t('back')}
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!title?.trim()}
          className="h-12 gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {t('step2.next')}
          <ArrowLeft className="size-4" />
        </Button>
      </div>
    </div>
  );
}
