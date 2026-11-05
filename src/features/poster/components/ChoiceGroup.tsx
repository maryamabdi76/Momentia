'use client';

import type { ReactNode } from 'react';
import { cn } from 'cn';

export type Choice<V extends string> = {
  value: V;
  /** Shown as a tooltip on hover. */
  title?: string;
  content: ReactNode;
  /** Extra classes for this one choice. */
  className?: string;
};

type Props<V extends string> = {
  /** Shared by every radio; unique per group on the page. */
  name: string;
  legend: ReactNode;
  value: V;
  onChange: (value: V) => void;
  choices: Choice<V>[];
  /** How the choices are laid out (a grid, or a wrapping row). */
  className?: string;
  /** Extra classes for every choice. */
  choiceClassName?: string;
};

/**
 * A group of options where exactly one is chosen, drawn as selectable tiles.
 * Each tile wraps a real (visually hidden) radio, so arrow keys, focus and screen
 * readers work as for any radio group. Inside a tile, `group-has-[:checked]/choice:`
 * styles the content of the chosen one.
 */
export function ChoiceGroup<V extends string>({
  name,
  legend,
  value,
  onChange,
  choices,
  className,
  choiceClassName,
}: Props<V>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 p-0 text-[13px] font-medium text-[#E8D9B8]">{legend}</legend>
      <div className={className}>
        {choices.map((c) => (
          <label
            key={c.value}
            title={c.title}
            className={cn(
              'group/choice relative cursor-pointer rounded-xl border border-[#33415B] transition-colors',
              'hover:border-[#CEB47B]/40 has-[:checked]:border-[#CEB47B]/70 has-[:checked]:bg-[#CEB47B]/10',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#CEB47B]/50',
              choiceClassName,
              c.className,
            )}
          >
            <input
              type="radio"
              name={name}
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(c.value)}
              className="sr-only"
            />
            {c.content}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
