'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from 'cn';

type Props = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  children: ReactNode;
  /** What the option does, shown as a tooltip on hover. */
  title?: string;
};

/** An on/off option as a small pill with a tick, for things that are shown or hidden. */
export function ToggleChip({ pressed, onPressedChange, children, title }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={title}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50',
        pressed
          ? 'border-[#CEB47B]/70 bg-[#CEB47B]/10 text-white'
          : 'border-[#33415B] text-white/60 hover:border-[#CEB47B]/40',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-4 items-center justify-center rounded-full border',
          pressed ? 'border-[#CEB47B] bg-[#CEB47B] text-[#0c142b]' : 'border-white/25',
        )}
      >
        {pressed && <Check className="size-3" />}
      </span>
      {children}
    </button>
  );
}
