'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { isYaldaCampaign } from '../lib/yalda-date';

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);

/**
 * Shows its children only while the Yalda campaign runs. The server render and the first client
 * render show nothing (the clock is the visitor's), so the page can stay cached and hydrate cleanly.
 */
export function YaldaOnly({ children }: { children: ReactNode }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  if (minute === null || !isYaldaCampaign(minute * 60_000)) return null;
  return <>{children}</>;
}
