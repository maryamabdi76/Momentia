'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveSkyLayers } from '@/features/sky/lib/layers';
import { toPersianDigits } from '../lib/digits';
import { readGiftHash } from '../lib/gift-link';
import { skyForMoment } from '../lib/sky-for-moment';
import { DEFAULT_TEMPLATE, FULL_SKY_DEPTH } from '../lib/templates';
import { PosterPreview, type PosterData } from './PosterPreview';
import { Reveal } from './Reveal';
import { MoonGiftView } from '@/features/moon/components/MoonGiftView';
import { MapGiftView } from '@/features/treasure-map/components/MapGiftView';
import { readGiftToken } from '../lib/gift-link';

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** What the person who received a gift link sees: the poster, revealed on screen. */
function SkyGiftView() {
  const t = useTranslations('GiftPage');
  const tPoster = useTranslations('Poster');
  // null on the server: the fragment never leaves the browser
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => null,
  );
  const draft = useMemo(() => (hash === null ? undefined : readGiftHash(hash)), [hash]);

  const template = draft?.personal.template ?? DEFAULT_TEMPLATE;
  const depth = template === 'full' ? FULL_SKY_DEPTH : undefined;

  const moonSky = useMemo(() => {
    if (!draft) return null;
    const { city, day, month, year, time, noExactTime } = draft.moment;
    return skyForMoment({ city, day, month, year, time, noExactTime }, depth);
  }, [draft, depth]);

  if (draft === undefined) return null;

  const cta = (
    <Button
      asChild
      className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]"
    >
      <a href="/create">
        {t('cta')}
        <ArrowLeft data-icon="inline-end" />
      </a>
    </Button>
  );

  if (!draft) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">{t('invalidTitle')}</h1>
        <p className="text-sm leading-7 text-[#AAB6CD]">{t('invalidBody')}</p>
        {cta}
      </div>
    );
  }

  const { moment, personal } = draft;
  const poster: PosterData = {
    ...personal,
    layers: resolveSkyLayers(personal.layers),
    template,
    city: moment.city,
    dateLabel: toPersianDigits(`${moment.day} ${moment.month} ${moment.year}`),
    timeLabel: moment.noExactTime ? '' : toPersianDigits(moment.time),
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
      <div>
        <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-white">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#AAB6CD]">{t('body')}</p>
      </div>

      <Reveal>
        <PosterPreview
          data={poster}
          sky={moonSky?.sky ?? null}
          showDisclaimer={false}
          labels={{
            headerLine: tPoster('headerLine'),
            north: tPoster('north'),
            south: tPoster('south'),
            east: tPoster('east'),
            west: tPoster('west'),
            mapAlt: tPoster('mapAlt'),
            watermark: tPoster('watermark'),
            disclaimer: tPoster('disclaimer'),
            timeAt: tPoster('timeAt'),
          }}
        />
      </Reveal>

      {cta}
    </div>
  );
}

/** What the person who received a gift link sees: the sky, the moon or the map, revealed on screen. */
export function GiftView() {
  // null on the server: the fragment never leaves the browser
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => null,
  );
  const product = hash === null ? null : (readGiftToken(hash)?.product ?? 'sky');
  if (product === 'moon') return <MoonGiftView hash={hash ?? ''} />;
  if (product === 'map') return <MapGiftView hash={hash ?? ''} />;
  return <SkyGiftView />;
}
