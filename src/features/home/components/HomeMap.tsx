import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapPoster } from '@/features/treasure-map/components/MapPoster';
import { getMapSample } from './map-sample';

/** The treasure map as a product: the illustrated road with the moments of a story, and a way in. */
export async function HomeMap() {
  const t = await getTranslations('HomePage.map');
  const { data, labels } = await getMapSample('ink');

  return (
    <section id="map" className="py-12">
      <div className="mx-auto px-6 md:px-20">
        <div
          data-animate="reveal"
          className="grid items-center gap-12 pb-10 md:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t('title')}</h2>
            <p className="mt-5 text-sm leading-8 text-[#AAB6CD]">{t('body')}</p>
            <ul className="mt-6 space-y-4 text-sm text-[#E8D9B8]">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#CEB47B]" />
                  {t(`points.${i}`)}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 p-6! bg-[#CEB47B] font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              <a href="/map">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
            <p className="mt-3 text-xs text-[#AAB6CD]">{t('note')}</p>
          </div>
          <div className="flex justify-center">
            <MapPoster data={data} labels={labels} className="w-full max-w-80" />
          </div>
        </div>
      </div>
    </section>
  );
}
