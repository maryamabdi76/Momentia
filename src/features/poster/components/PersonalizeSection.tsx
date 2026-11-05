import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

/** A titled group of controls on step 2, so a long form reads as a few short ones. */
export function PersonalizeSection({ icon: Icon, title, children }: Props) {
  return (
    <section className="space-y-5 rounded-2xl border border-[#33415B] bg-[#142039]/40 p-4 sm:p-5">
      <header className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#CEB47B]/12 text-[#CEB47B]"
        >
          <Icon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </header>
      {children}
    </section>
  );
}
