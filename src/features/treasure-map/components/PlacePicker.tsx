'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { LonLat } from '../lib/mercator';
import { searchPlaces, type PlaceHit } from '../lib/places';

const TEHRAN: LonLat = { lon: 51.389, lat: 35.6892 };

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

export type MapFocus = { center: LonLat; zoom: number; nonce: number };

/**
 * The map the user picks on: Leaflet on OpenStreetMap tiles. Leaflet needs `window`,
 * so it is loaded in an effect, never while rendering on the server.
 */
function LeafletMap({
  focus,
  pin,
  others,
  onTap,
}: {
  focus: MapFocus;
  pin: LonLat | null;
  others: LonLat[];
  onTap: (p: LonLat) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const map = useRef<import('leaflet').Map | null>(null);
  const layer = useRef<import('leaflet').LayerGroup | null>(null);
  const tapRef = useRef(onTap);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    tapRef.current = onTap;
  }, [onTap]);

  // create the map once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    void import('leaflet').then((mod) => {
      if (cancelled) return;
      const L = (mod as unknown as { default?: typeof import('leaflet') }).default ?? mod;
      leaflet.current = L;
      const m = L.map(el, { center: [focus.center.lat, focus.center.lon], zoom: focus.zoom, minZoom: 4, maxZoom: 19 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);
      layer.current = L.layerGroup().addTo(m);
      m.on('click', (e) => tapRef.current({ lat: e.latlng.lat, lon: e.latlng.lng }));
      map.current = m;
      // the map opens inside an animating dialog, so its size is only right a moment later
      ro = new ResizeObserver(() => m.invalidateSize());
      ro.observe(el);
      setReady(true);
    });
    return () => {
      cancelled = true;
      ro?.disconnect();
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
    // created once; later view changes go through `focus`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // move to a new place when asked (a search result, or the map opening)
  useEffect(() => {
    map.current?.setView([focus.center.lat, focus.center.lon], focus.zoom);
  }, [focus, ready]);

  // markers: the pending pin and the other milestones' places
  useEffect(() => {
    const L = leaflet.current;
    const g = layer.current;
    if (!L || !g) return;
    g.clearLayers();
    others.forEach((o) =>
      L.circleMarker([o.lat, o.lon], { radius: 6, color: '#ffffff', weight: 2, fillColor: '#7A7684', fillOpacity: 1, interactive: false }).addTo(g),
    );
    if (pin) {
      L.circleMarker([pin.lat, pin.lon], { radius: 10, color: '#ffffff', weight: 3, fillColor: '#B4513C', fillOpacity: 1, interactive: false }).addTo(g);
    }
  }, [pin, others, ready]);

  return <div ref={ref} dir="ltr" className="z-0 h-[340px] w-full overflow-hidden rounded-xl border border-[#33415B] bg-[#e8e4da]" />;
}

export function PlacePicker({ open, onOpenChange, start, current, others = [], onPick }: Props) {
  const t = useTranslations('MapPage.picker');
  const [focus, setFocus] = useState<MapFocus>({ center: start ?? TEHRAN, zoom: start ? 15 : 12, nonce: 0 });
  const [pending, setPending] = useState<PickedPlace | null>(null);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlaceHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);

  // each time it opens: start where this milestone already is, with nothing pending
  useEffect(() => {
    if (!open) return;
    setFocus((f) => ({ center: start ?? TEHRAN, zoom: start ? 15 : 12, nonce: f.nonce + 1 }));
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
    setFocus((f) => ({ center: { lat: h.lat, lon: h.lon }, zoom: 16, nonce: f.nonce + 1 }));
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

        {/* the dialog is mounted only while open, so Leaflet starts with a real size */}
        <LeafletMap focus={focus} pin={pending} others={others} onTap={(p) => setPending({ lat: p.lat, lon: p.lon })} />

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
