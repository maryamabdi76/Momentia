'use client';

import { useState, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
  /** The words on the chip, e.g. "live preview". */
  label: string;
  /** Heading and note of the window that opens. */
  title: string;
  note?: string;
  /** The poster drawn small, so the chip shows the poster as it is right now. */
  thumb: ReactNode;
  /** The poster drawn large, inside the window. */
  children: ReactNode;
};

/**
 * On a phone the poster sits far below the form. This keeps a small live copy of it floating above
 * the bottom bar: every change shows in it as you type, and a tap opens it large. Hidden from
 * medium screens up, where the preview sits beside the form.
 */
export function PreviewPeek({ label, title, note, thumb, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] start-4 z-30 flex items-center gap-2.5 rounded-2xl border border-[#CEB47B]/40 bg-[#0c142b]/90 p-1.5 pe-3.5 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#CEB47B] md:hidden motion-reduce:transition-none"
      >
        <span aria-hidden className="pointer-events-none block w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20">
          {thumb}
        </span>
        <span className="flex flex-col items-start leading-5">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#F1E5C8]">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-[#CEB47B] motion-reduce:animate-none" />
            {label}
          </span>
          <Maximize2 aria-hidden className="size-3 text-[#AAB6CD]" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto border border-[#33415B] bg-[#142039] p-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#CEB47B]">{title}</DialogTitle>
            <DialogDescription className="text-[#AAB6CD]">{note ?? ''}</DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full max-w-sm">{open ? children : null}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
