'use client';

import { useMemo } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { IRAN_CITIES } from '@/features/poster/lib/cities';

export type CityComboboxItem = {
  value: string;
  label: string;
  province: string;
  tz: string;
};

type Props = {
  value: string;
  onValueChange: (cityName: string, timezone: string) => void;
  placeholder: string;
  emptyLabel: string;
  /** Shown under the empty message: a way to ask for the missing city. */
  missing?: { label: string; href: string };
  provinceSuffix: string;
  id?: string;
};

export function CityCombobox({
  value,
  onValueChange,
  placeholder,
  emptyLabel,
  missing,
  provinceSuffix,
  id,
}: Props) {
  const items = useMemo<CityComboboxItem[]>(
    () =>
      IRAN_CITIES.map((c) => ({
        value: c.name,
        label: c.name,
        province: c.province,
        tz: c.tz,
      })),
    [],
  );

  const selected = items.find((item) => item.value === value);

  return (
    <Combobox
      items={items}
      value={selected ?? null}
      onValueChange={(item) => {
        if (!item || typeof item === 'string') return;
        onValueChange(item.value, item.tz);
      }}
      itemToStringValue={(item) => `${item.label} ${item.province}`}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear={!!value}
        className="h-14 w-full rounded-xl border-[#33415B] bg-transparent text-base text-white shadow-none focus-within:border-[#CEB47B]/50 focus-within:ring-[#CEB47B]/15 dark:bg-transparent [&_input]:text-white [&_input]:placeholder:text-white/45"
      />
      <ComboboxContent className="border-white/15 bg-[#0c1a38] text-white ring-white/10">
        <ComboboxEmpty className="text-white/70 p-3">
          {emptyLabel}
          {missing && (
            <>
              {' '}
              <a href={missing.href} className="text-[#CEB47B] underline-offset-4 hover:underline">
                {missing.label}
              </a>
            </>
          )}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem
              key={item.value}
              value={item}
              className="p-3 text-white/80 cursor-pointer data-selected:bg-[#CEB47B] data-selected:text-[#0c142b] data-highlighted:bg-white/10 data-highlighted:text-white"
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span>{item.label}</span>
                <span className="text-xs text-white/35">
                  {/* {item.province} · {provinceSuffix} */}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
