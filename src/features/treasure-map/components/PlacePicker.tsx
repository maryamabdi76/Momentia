'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Minus, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TILE, lonLatToWorld, worldToLonLat, type LonLat } from '../lib/mercator';
import { searchPlaces, type PlaceHit } from '../lib/streets';

const TEHRAN: LonLat = { lon: 51.389, lat: 35.6892 };
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;
const MAP_HEIGHT = 340;

export type PickedPlace = { lat: number; lon: number; name?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the map opens: the place already picked for this milestone, or another one. */
  start?: LonLat | null;
  /** The place picked now, shown as a marker. */
  current?: LonLat | null;
  /** The other milestones' places, shown as small dots for orientation. */
  others?: LonLat[];
  onPick: (place: PickedPlace) => void;
};

/** A small slippy map on OpenStreetMap tiles: drag to move, tap to place a pin. */
function TileMap({
  center,
  zoom,
  pin,
  others,
  onMove,
  onZoom,
  onTap,
}: {
  center: LonLat;
  zoom: number;
  pin: LonLat | null;
  others: LonLat[];
  onMove: (c: LonLat) => void;
  onZoom: (z: number) => void;
  onTap: (p: LonLat) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth || 320));
    ro.observe(el);
    setWidth(el.clientWidth || 320);
    return () => ro.disconnect();
  }, []);

  // the wheel zooms; it has to be a non-passive listener so the page does not scroll too
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current + (e.deltaY < 0 ? 1 : -1))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onZoom]);

  const c = lonLatToWorld(center, zoom);
  const left0 = c.x - width / 2;
  const top0 = c.y - MAP_HEIGHT / 2;
  const n = 2 ** zoom;
  const tiles: Array<{ key: string; src: string; x: number; y: number }> = [];
  for (let ty = Math.floor(top0 / TILE); ty <= Math.floor((top0 + MAP_HEIGHT) / TILE); ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(left0 / TILE); tx <= Math.floor((left0 + width) / TILE); tx++) {
      const wrapped = ((tx % n) + n) % n;
      tiles.push({
        key: `${zoom}/${tx}/${ty}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png`,
        x: tx * TILE - left0,
        y: ty * TILE - top0,
      });
    }
  }
  const at = (p: LonLat) => {
    const w = lonLatToWorld(p, zoom);
    return { x: w.x - left0, y: w.y - top0 };
  };

  return (
    <div
      ref={ref}
      className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-xl border border-[#33415B] bg-[#e8e4da] active:cursor-grabbing"
      style={{ height: MAP_HEIGHT }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.moved += Math.abs(dx) + Math.abs(dy);
        d.x = e.clientX;
        d.y = e.clientY;
        const w = lonLatToWorld(center, zoom);
        onMove(worldToLonLat(w.x - dx, w.y - dy, zoom));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d || d.moved > 6) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onTap(worldToLonLat(left0 + (e.clientX - rect.left), top0 + (e.clientY - rect.top), zoom));
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      {tiles.map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={t.key}
          src={t.src}
          alt=""
          draggable={false}
          width={TILE}
          height={TILE}
          className="pointer-events-none absolute max-w-none"
          style={{ left: t.x, top: t.y }}
        />
      ))}
      {others.map((o, i) => {
        const p = at(o);
        return <span key={i} className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#7A7684]" style={{ left: p.x, top: p.y }} />;
      })}
      {pin && (
        <span
          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#B4513C] shadow-lg"
          style={{ left: at(pin).x, top: at(pin).y }}
        />
      )}
      <div className="absolute start-2 top-2 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
        <button type="button" aria-label="+" disabled={zoom >= MAX_ZOOM} onClick={() => onZoom(zoom + 1)} className="flex size-9 items-center justify-center rounded-md bg-white text-[#0c142b] shadow disabled:opacity-40">
          <Plus className="size-4" />
        </button>
        <button type="button" aria-label="−" disabled={zoom <= MIN_ZOOM} onClick={() => onZoom(zoom - 1)} className="flex size-9 items-center justify-center rounded-md bg-white text-[#0c142b] shadow disabled:opacity-40">
          <Minus className="size-4" />
        </button>
      </div>
      <span className="pointer-events-none absolute end-1 bottom-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-[#333]" dir="ltr">
        © OpenStreetMap contributors
      </span>
    </div>
  );
}

export function PlacePicker({ open, onOpenChange, start, current, others = [], onPick }: Props) {
  const t = useTranslations('MapPage.picker');
  const [center, setCenter] = useState<LonLat>(start ?? TEHRAN);
  const [zoom, setZoom] = useState(start ? 15 : 12);
  const [pending, setPending] = useState<PickedPlace | null>(null);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlaceHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);

  // each time it opens: start where this milestone already is, with nothing pending
  useEffect(() => {
    if (!open) return;
    setCenter(start ?? TEHRAN);
    setZoom(start ? 15 : 12);
    setPending(current ? { lat: current.lat, lon: current.lon } : null);
    setHits(null);
    setFailed(false);
    setQuery('');
    // only when it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setFailed(false);
    try {
      setHits(await searchPlaces(q));
    } catch {
      setHits(null);
      setFailed(true);
    } finally {
      setSearching(false);
    }
  };

  const choose = (h: PlaceHit) => {
    setPending({ lat: h.lat, lon: h.lon, name: h.name });
    setCenter({ lat: h.lat, lon: h.lon });
    setZoom(16);
    setHits(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto border border-[#33415B] bg-[#142039] p-5 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#CEB47B]">{t('title')}</DialogTitle>
          <DialogDescription className="text-[12px] leading-6 text-[#AAB6CD]">{t('hint')}</DialogDescription>
        </DialogHeader>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-10 border-[#33415B] bg-[#0c142b] text-sm text-white"
          />
          <Button type="submit" disabled={searching || !query.trim()} className="h-10 gap-1 bg-[#CEB47B] text-[#0c142b] hover:bg-[#e0c180]">
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {t('search')}
          </Button>
        </form>
        {failed && <p role="alert" className="text-[12px] text-red-300">{t('searchFailed')}</p>}
        {hits && (
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#33415B] p-1">
            {hits.length === 0 && <li className="px-2 py-1.5 text-[12px] text-[#AAB6CD]">{t('noResults')}</li>}
            {hits.map((h, i) => (
              <li key={i}>
                <button type="button" onClick={() => choose(h)} className="w-full rounded-md px-2 py-1.5 text-start text-[13px] hover:bg-white/5">
                  <span className="block font-medium">{h.name}</span>
                  <span className="block truncate text-[11px] text-[#AAB6CD]">{h.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <TileMap
          center={center}
          zoom={zoom}
          pin={pending}
          others={others}
          onMove={setCenter}
          onZoom={setZoom}
          onTap={(p) => setPending({ lat: p.lat, lon: p.lon })}
        />

        <Button
          type="button"
          disabled={!pending}
          onClick={() => {
            if (!pending) return;
            onPick({ lat: Math.round(pending.lat * 1e5) / 1e5, lon: Math.round(pending.lon * 1e5) / 1e5, name: pending.name });
            onOpenChange(false);
          }}
          className="h-11 w-full bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
        >
          {pending ? t('confirm') : t('tapToPlace')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
