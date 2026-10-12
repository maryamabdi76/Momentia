import { cn } from 'cn';

export type StepStatus = 'done' | 'active' | 'upcoming';

export type StepItem = {
  label: string;
  status: StepStatus;
};

export function Stepper({
  steps,
  onStepClick,
  className,
  ariaLabel = 'مراحل',
}: {
  steps: StepItem[];
  onStepClick?: (index: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {steps.map((step, i) => {
        const isDone = step.status === 'done';
        const isActive = step.status === 'active';
        const clickable = isDone && !!onStepClick;

        return (
          <button
            key={i}
            type="button"
            aria-current={isActive ? 'step' : undefined}
            disabled={!clickable && !isActive}
            onClick={() => clickable && onStepClick(i)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors',
              isActive && 'bg-[#0d1b3e] text-white font-semibold',
              isDone && 'text-white/50 hover:text-white/80 cursor-pointer',
              step.status === 'upcoming' && 'cursor-default text-white/35',
            )}
          >
            <span
              className={cn(
                'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none transition-colors',
                isActive && 'bg-[#CEB47B] text-[#0c142b]',
                isDone && 'bg-white/20 text-white/70',
                step.status === 'upcoming' && 'bg-white/10 text-white/30',
              )}
            >
              {i + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
