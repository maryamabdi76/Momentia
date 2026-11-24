export const fieldClass =
  // 16px on a phone: smaller text makes iOS zoom the page when a field is focused
  'h-12 w-full rounded-2xl border border-white/10 bg-[#0a1226]/85 px-4 text-base text-white shadow-inner shadow-black/30 transition-all placeholder:text-[#6f7c97] hover:border-white/25 focus-visible:border-[#CEB47B] focus-visible:bg-[#0c162d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#CEB47B]/20 md:text-sm';

export const choiceClass = (on: boolean) =>
  `h-12 rounded-2xl border text-sm transition-all ${on ? 'border-[#CEB47B] bg-[#CEB47B]/15 text-[#CEB47B] shadow-[0_0_0_3px_rgba(206,180,123,0.12)]' : 'border-white/10 text-white/70 hover:border-white/25 hover:bg-white/5'}`;
