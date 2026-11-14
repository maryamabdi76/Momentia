export const fieldClass =
  'h-10 w-full rounded-lg border border-[#33415B] bg-[#0c142b] px-3 text-sm text-white placeholder:text-[#6f7c97] focus-visible:border-[#CEB47B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]/30';

export const choiceClass = (on: boolean) =>
  `h-10 rounded-lg border text-sm transition-colors ${on ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B]' : 'border-[#33415B] text-white/70 hover:bg-white/5'}`;
