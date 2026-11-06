'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { jalaliFieldsFromIso } from '../lib/calendar';
import { gregorianToJalali } from '../lib/jalali';

type Fields = NonNullable<ReturnType<typeof jalaliFieldsFromIso>>;

/** For a date that is only known in the Gregorian calendar: fills the Jalali pickers above it. */
export function GregorianDateField({ onPick }: { onPick: (fields: Fields) => void }) {
  const t = useTranslations('CreatePage.step1');
  const id = useId();
  const [invalid, setInvalid] = useState(false);

  return (
    <details className="mt-3 text-sm text-[#AAB6CD]">
      <summary className="cursor-pointer text-[#CEB47B] underline-offset-4 hover:underline">
        {t('gregorian.toggle')}
      </summary>
      <div className="mt-2.5 space-y-1.5">
        <label htmlFor={id} className="block text-[#E8D9B8]">
          {t('gregorian.label')}
        </label>
        <input
          id={id}
          type="date"
          dir="ltr"
          min="1921-03-21"
          className="h-10 w-full rounded-lg border border-[#33415B] bg-[#0c142b] px-3 text-white [color-scheme:dark]"
          onChange={(e) => {
            const fields = jalaliFieldsFromIso(e.target.value, gregorianToJalali);
            setInvalid(!fields && e.target.value !== '');
            if (fields) onPick(fields);
          }}
        />
        <p className="text-[12px] leading-5">{t('gregorian.hint')}</p>
        {invalid && (
          <p role="alert" className="text-[12px] text-red-300">
            {t('gregorian.invalid')}
          </p>
        )}
      </div>
    </details>
  );
}
