import { getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { WallScene } from '@/features/poster/components/WallScene';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { getMapSample } from './map-sample';

/** The two ways a finished map leaves the site: on a wall, and as a link. */
export async function HomeShare() {
  const t = await getTranslations('HomePage.redesign.share');
  const { data, labels } = await getMapSample('paper');
  const [line1, line2] = t('title').split('\n');

  return (
    <section id="share" className="mx-auto px-6 py-20 md:px-20">
      <div className="grid items-center gap-14 md:grid-cols-2">
        <div data-animate="reveal" className="relative mx-auto w-full max-w-sm">
          <WallScene label={t('wallAlt')}>
            <MapPoster data={data} labels={labels} className="rounded-none shadow-none" />
          </WallScene>
          <p className="absolute inset-x-6 bottom-4 rounded-lg border border-white/10 bg-[#0e1634]/90 px-3 py-2 text-center text-xs text-[#E8D9B8] backdrop-blur-md">
            {t('wallChip')}
          </p>
        </div>

        <div data-animate="reveal">
          <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.6] text-white md:text-4xl">
            {line1}
            <br />
            {line2}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-8 text-[#AAB6CD]">
            {t('body')}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <Check aria-hidden className="size-4 shrink-0 text-[#CEB47B]" />
                {t(`points.${i}`)}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-[#CEB47B]">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
