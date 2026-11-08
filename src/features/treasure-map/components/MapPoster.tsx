'use client';

import { useId, useMemo } from 'react';
import { cn } from 'cn';
import type { StreetData } from '../lib/streets';
import {
  buildTreasureMapSvg,
  type TreasureMapData,
  type TreasureMapLabels,
} from '../lib/map-svg';

/** The map on screen: the very SVG the download is made from, with the site mark on it. */
export function MapPoster({
  data,
  labels,
  streets,
  className,
}: {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  streets?: StreetData | null;
  className?: string;
}) {
  const idPrefix = `tmap${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svg = useMemo(
    () => buildTreasureMapSvg({ data, labels, watermark: true, idPrefix, streets }),
    [data, labels, idPrefix, streets],
  );
  return (
    <div
      className={cn(
        'aspect-[2/3] w-full overflow-hidden rounded-sm shadow-2xl shadow-black/50 [&>svg]:block [&>svg]:h-full [&>svg]:w-full',
        className,
      )}
      // the markup comes from buildTreasureMapSvg, which escapes every piece of user text
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
