'use client';

import { useId, useMemo } from 'react';
import { cn } from 'cn';
import {
  buildMoonPosterSvg,
  type MoonFacts,
  type MoonLabels,
  type MoonPosterData,
} from '../lib/moon-svg';

/**
 * The Moon poster on screen. It is the very SVG the downloads are made from, so
 * what you see is what you get; only the fonts are left to the page.
 */
export function MoonPoster({
  data,
  facts,
  labels,
  watermark = false,
  className,
}: {
  data: MoonPosterData;
  facts: MoonFacts;
  labels: MoonLabels;
  /** Show the site name at the foot, as the free download does. */
  watermark?: boolean;
  className?: string;
}) {
  // several posters can share a page (home cards), so ids must be unique
  const idPrefix = `moon${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svg = useMemo(
    () =>
      buildMoonPosterSvg({ data, facts, labels, watermark, idPrefix }),
    [data, facts, labels, watermark, idPrefix],
  );
  return (
    <div
      className={cn(
        'aspect-[2/3] w-full overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full',
        className,
      )}
      // the markup comes from buildMoonPosterSvg, which escapes every piece of user text
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
