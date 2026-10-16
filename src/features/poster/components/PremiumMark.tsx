import { Crown } from 'lucide-react';
import { cn } from 'cn';

/**
 * A small crown that marks a premium option. The explanation shows as a tooltip
 * on hover and keyboard focus, and is always available to screen readers.
 */
export function PremiumMark({
  label,
  tooltip,
  className,
}: {
  label: string;
  tooltip: string;
  className?: string;
}) {
  return (
    <span
      tabIndex={0}
      aria-label={`${label}: ${tooltip}`}
      className={cn(
        'group/premium relative inline-flex items-center gap-1 rounded-full border border-[#CEB47B]/50 bg-[#CEB47B]/10 px-2 py-0.5 text-[10px] font-medium text-[#CEB47B] outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/50',
        className,
      )}
    >
      <Crown aria-hidden className="size-3" />
      {label}
      <span
        role="tooltip"
        className="pointer-events-none absolute start-0 bottom-full z-20 mb-2 w-52 rounded-lg border border-[#CEB47B]/40 bg-[#0c142b] px-3 py-2 text-[11px] font-normal leading-5 text-[#E8D9B8] opacity-0 shadow-lg transition-opacity group-hover/premium:opacity-100 group-focus-visible/premium:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  );
}
