import { Check } from 'lucide-react';
import { cn } from 'cn';
import { toPersianDigits } from '@/features/poster/lib/digits';

type Props = {
  labels: string[];
  /** 1-based step now shown. */
  step: number;
  /** Which steps can be opened: a step is only open once the ones before it are done. */
  canOpen: (n: number) => boolean;
  onOpen: (n: number) => void;
  ariaLabel: string;
};

/**
 * The progress of the form, drawn as a route: pins joined by a dashed line, the line drawn
 * on to the step you are at. The one thing on the page that moves by itself.
 */
export function MapRoute({ labels, step, canOpen, onOpen, ariaLabel }: Props) {
  const last = labels.length - 1;
  // the line runs from the first pin's centre to the last pin's centre
  const progress = last > 0 ? ((step - 1) / last) * 100 : 0;
  return (
    <nav aria-label={ariaLabel} className="mx-auto w-full max-w-xl">
      <ol className="relative flex items-start justify-between">
        <span aria-hidden className="absolute inset-x-5 top-5 h-0 border-t-2 border-dashed border-white/15" />
        <span
          aria-hidden
          className="absolute start-5 top-5 h-0 border-t-2 border-dashed border-[#CEB47B] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `calc((100% - 2.5rem) * ${progress / 100})` }}
        />
        {labels.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          const open = n !== step && canOpen(n);
          return (
            <li key={label} className="relative z-10 flex w-20 flex-col items-center gap-2">
              <button
                type="button"
                disabled={!open}
                aria-current={active ? 'step' : undefined}
                onClick={() => onOpen(n)}
                className="group flex flex-col items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60 disabled:cursor-default"
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 motion-reduce:transition-none',
                    active && 'border-[#CEB47B] bg-[#CEB47B] text-[#0c142b] shadow-[0_0_0_6px_rgba(206,180,123,0.18)]',
                    done && 'border-[#CEB47B] bg-[#0c142b] text-[#CEB47B]',
                    !active && !done && 'border-white/20 bg-[#0c142b] text-[#AAB6CD]',
                    open && 'group-hover:scale-105',
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : toPersianDigits(String(n))}
                </span>
                <span className={cn('text-center text-[12px] leading-4', active ? 'font-bold text-[#E8D9B8]' : 'text-[#AAB6CD]')}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
