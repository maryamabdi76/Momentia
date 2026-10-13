'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { DEFAULT_TIME } from '@/features/poster/lib/calendar';

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';

function fromPersianDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)));
}

export function parseTimeValue(value: string): { hour: number; minute: number } | null {
  const normalized = fromPersianDigits(value.trim());
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type TimePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  hourLabel?: string;
  minuteLabel?: string;
  id?: string;
};

function TimeColumn({
  label,
  values,
  selected,
  onSelect,
  format,
}: {
  label: string;
  values: number[];
  selected: number;
  onSelect: (v: number) => void;
  format: (v: number) => string;
}) {
  const selectedRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' });
  }, [selected]);

  return (
    <div className="flex min-w-[4.5rem] flex-col">
      <p className="border-b border-white/10 px-2 py-2 text-center text-[11px] text-white/45">
        {label}
      </p>
      <ScrollArea className="h-56">
        <div className="flex flex-col p-1">
          {values.map((v) => {
            const isSelected = v === selected;
            return (
              <button
                key={v}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                onClick={() => onSelect(v)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-sm tabular-nums transition-colors',
                  isSelected
                    ? 'bg-[#CEB47B] font-semibold text-[#0c142b]'
                    : 'text-white/75 hover:bg-white/10',
                )}
              >
                {toPersianDigits(format(v))}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

/** Popover time picker (shadcn Popover + ScrollArea columns). */
export function TimePicker({
  value = '',
  onChange,
  disabled,
  className,
  placeholder,
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  id,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsed =
    parseTimeValue(value) ?? parseTimeValue(DEFAULT_TIME) ?? { hour: 21, minute: 0 };
  const [hour, setHour] = React.useState(parsed.hour);
  const [minute, setMinute] = React.useState(parsed.minute);

  React.useEffect(() => {
    const next = parseTimeValue(value);
    if (next) {
      setHour(next.hour);
      setMinute(next.minute);
    }
  }, [value]);

  function commit(nextHour: number, nextMinute: number) {
    onChange?.(formatTimeValue(nextHour, nextMinute));
  }

  function pickHour(nextHour: number) {
    setHour(nextHour);
    commit(nextHour, minute);
  }

  function pickMinute(nextMinute: number) {
    setMinute(nextMinute);
    commit(hour, nextMinute);
  }

  const display = value
    ? toPersianDigits(formatTimeValue(hour, minute))
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            'h-14 w-full justify-between rounded-xl border-[#33415B] bg-transparent px-4 text-base font-normal text-white hover:bg-white/5 focus-visible:border-[#CEB47B]/50 focus-visible:ring-[#CEB47B]/15 data-[empty=true]:text-white/35',
            className,
          )}
        >
          <span>{display}</span>
          <Clock className="size-4 shrink-0 text-white/50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto overflow-hidden border-white/15 bg-[#0c1a38] p-0 text-white shadow-xl ring-white/10"
      >
        <div className="flex divide-x divide-white/10 rtl:divide-x-reverse">
          <TimeColumn
            label={hourLabel}
            values={HOURS}
            selected={hour}
            onSelect={pickHour}
            format={(v) => String(v).padStart(2, '0')}
          />
          <TimeColumn
            label={minuteLabel}
            values={MINUTES}
            selected={minute}
            onSelect={pickMinute}
            format={(v) => String(v).padStart(2, '0')}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
