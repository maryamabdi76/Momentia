import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from 'cn';

/** The heading of a step: a large title and one line saying what to do. */
export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-black leading-tight text-white md:text-4xl">{title}</h1>
      <p className="max-w-[34rem] text-sm leading-7 text-white/60">{description}</p>
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
        'space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-[#18253f]/90 to-[#111b33]/90 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-6',
        className,
      )}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#E8D9B8]">{title}</h2>
          {hint && <p className="text-[12px] leading-6 text-[#AAB6CD]">{hint}</p>}
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
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/20 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#CEB47B]/50">
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
