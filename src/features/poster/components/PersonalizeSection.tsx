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
    <section className="space-y-5 rounded-3xl border border-white/10 bg-gradient-to-b from-[#18253f]/90 to-[#111b33]/90 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-6">
      <header className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#CEB47B]/15 text-[#CEB47B]"
        >
          <Icon className="size-4" />
        </span>
        <h2 className="text-base font-bold text-[#E8D9B8]">{title}</h2>
      </header>
      {children}
    </section>
  );
}
