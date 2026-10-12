import { cn } from 'cn';

export type StepStatus = 'done' | 'active' | 'upcoming';

export type StepItem = {
  label: string;
  status: StepStatus;
};

type StepperProps = {
  steps: StepItem[];
  /** Called with the zero-based index. Only completed steps are clickable. */
  onStepClick?: (index: number) => void;
  className?: string;
  ariaLabel?: string;
};

export function Stepper({
  steps,
  onStepClick,
  className,
  ariaLabel = 'مراحل',
}: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('w-full', className)}>
      <ol className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
        {steps.map((step, i) => {
          const isActive = step.status === 'active';
          const isDone = step.status === 'done';
          const clickable = isDone && !!onStepClick;

          return (
            <li key={step.label} className="flex">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                disabled={!clickable}
                onClick={() => onStepClick?.(i)}
                className={cn(
                  'group flex items-center gap-3 rounded-full py-1 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#CEB47B]/60',
                  'disabled:cursor-default',
                  clickable && 'cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold leading-none transition-colors',
                    isActive
                      ? 'bg-[#CEB47B] text-[#0c142b]'
                      : 'bg-[#1A2943] text-[#AAB6CD]',
                    clickable && 'group-hover:bg-[#26385a]',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'text-base transition-colors',
                    // On small screens only the current step shows its label.
                    !isActive && 'hidden sm:inline',
                    isActive
                      ? 'font-bold text-[#E8D9B8]'
                      : 'text-[#AAB6CD]',
                    clickable && 'group-hover:text-white',
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
