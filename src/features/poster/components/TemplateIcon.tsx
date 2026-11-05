import { cn } from 'cn';
import type { PosterTemplate } from '../lib/templates';

/** A tiny schematic of each layout, drawn in the current colour. */
export function TemplateIcon({
  template,
  className,
}: {
  template: PosterTemplate;
  className?: string;
}) {
  const dots =
    template === 'full'
      ? [
          [5, 6], [11, 4], [19, 7], [27, 5], [33, 9], [8, 14], [16, 12], [24, 15],
          [31, 17], [6, 22], [14, 25], [22, 21], [30, 26], [10, 30], [26, 32],
        ]
      : [[14, 12], [20, 9], [26, 13], [18, 18], [24, 21], [15, 24]];
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 56"
      className={cn('h-12 w-9 shrink-0', className)}
      fill="none"
      stroke="currentColor"
    >
      <rect x="0.75" y="0.75" width="38.5" height="54.5" rx="2" strokeWidth={1.2} />
      {template === 'circle' && <circle cx="20" cy="17" r="12" strokeWidth={1} />}
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="currentColor" stroke="none" />
      ))}
      <path d="M9 40h22M12 46h16" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}
