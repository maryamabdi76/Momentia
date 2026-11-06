'use client';

import { useSearchParams } from 'next/navigation';

/** Shown on /contact when the visitor came from "my city is missing" (?topic=city). */
export function CityTopicNote({ text }: { text: string }) {
  if (useSearchParams().get('topic') !== 'city') return null;
  return (
    <p
      role="note"
      className="mt-6 rounded-xl border border-[#CEB47B]/40 bg-[#CEB47B]/5 px-4 py-3 text-sm leading-7 text-[#E8D9B8]"
    >
      {text}
    </p>
  );
}
