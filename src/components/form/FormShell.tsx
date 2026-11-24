import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from 'cn';

/** The heading of a step: a large title and one line saying what to do. */
export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-3">
      <h1 className="bg-gradient-to-b from-white to-[#E8D9B8] bg-clip-text text-3xl font-black leading-[1.5] text-transparent md:text-4xl">
        {title}
      </h1>
      <span aria-hidden className="block h-1 w-12 rounded-full bg-gradient-to-l from-[#CEB47B] to-[#CEB47B]/0" />
      <p className="max-w-[34rem] text-[15px] leading-8 text-[#B9C4DA]">{description}</p>
    </header>
  );
}

/** A soft glass surface that groups one decision, with its own heading. */
export function Panel({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative space-y-5 rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1a2745]/95 to-[#0f1830]/95 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur md:p-7',
        // a thin line of gold light along the top edge
        'before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#CEB47B]/70 before:to-transparent',
        className,
      )}
    >
      {title && (
        <div className="space-y-1.5">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-[#F1E5C8]">
            <span aria-hidden className="h-5 w-1 rounded-full bg-[#CEB47B]" />
            {title}
          </h2>
          {hint && <p className="ps-3.5 text-[13px] leading-7 text-[#AAB6CD]">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A switch row: a label and a short note on the left, the switch on the other side. */
export function Toggle({
  label,
  note,
  inputProps,
}: {
  label: string;
  note?: string;
  inputProps: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/20 has-[:checked]:border-[#CEB47B]/50 has-[:checked]:bg-[#CEB47B]/[0.07] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#CEB47B]/50">
      <span className="min-w-0">
        <span className="block text-sm text-white/90">{label}</span>
        {note && <span className="mt-0.5 block text-[11px] text-[#AAB6CD]">{note}</span>}
      </span>
      <input type="checkbox" role="switch" {...inputProps} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition-colors after:absolute after:start-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#CEB47B] peer-checked:after:translate-x-[-1.25rem] motion-reduce:transition-none motion-reduce:after:transition-none"
      />
    </label>
  );
}

/** The main button of a step: gold, with a soft glow, tall enough for a thumb. */
export const ctaPrimary =
  'h-13 gap-2 rounded-2xl bg-gradient-to-b from-[#E6CF92] to-[#CEB47B] text-base font-bold text-[#0c142b] shadow-[0_12px_32px_-12px_rgba(206,180,123,0.75)] transition-all hover:from-[#EBD69E] hover:to-[#D6BC82] active:scale-[0.985] motion-reduce:transition-none';

/** The quieter button beside it (back). */
export const ctaSecondary =
  'h-13 gap-2 rounded-2xl border-white/12 bg-white/[0.03] text-[#E8D9B8] hover:bg-white/8 hover:text-[#E8D9B8]';

/**
 * The row of buttons at the foot of a step. On a phone it stays at the bottom of the screen on a
 * frosted bar, so the next step is always one tap away however long the form is; on a wide screen
 * it simply sits under the form.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-6 space-y-2 border-t border-white/10 bg-[#080f28]/85 px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl',
        'md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none',
        className,
      )}
    >
      {children}
    </div>
  );
}
