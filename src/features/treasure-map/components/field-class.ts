export const fieldClass =
  'h-11 w-full rounded-xl border border-white/10 bg-[#0a1226]/80 px-3.5 text-sm text-white shadow-inner shadow-black/20 transition-colors placeholder:text-[#6f7c97] hover:border-white/20 focus-visible:border-[#CEB47B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#CEB47B]/15';

export const choiceClass = (on: boolean) =>
  `h-11 rounded-xl border text-sm transition-all ${on ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B] shadow-[0_0_0_3px_rgba(206,180,123,0.12)]' : 'border-white/10 text-white/70 hover:border-white/25 hover:bg-white/5'}`;
