import { getTranslations } from 'next-intl/server';
import { HomePosterPreview, type PosterVariant } from './HomePosterPreview';

const VARIANTS: PosterVariant[] = ['gold', 'mono'];

export async function HomeGifts() {
  const t = await getTranslations('HomePage.gifts');

  const items = [0, 1].map((i) => ({
    title: t(`items.${i}.title`),
    body: t(`items.${i}.body`),
  }));

  return (
    <section id="gifts" className="bg-[#f2f0e9] px-6 py-24 text-[#101a35]">
      <div className="mx-auto max-w-7xl">
        <div data-animate="reveal">
          <p className="text-xs text-[#9b7d35]">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{t('title')}</h2>
        </div>
        <div
          data-animate="stagger"
          className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8"
        >
          {items.map(({ title, body }, index) => (
            <div
              key={title}
              data-animate-item
              className="rounded-2xl bg-[#e0ddd2] px-8 py-10 text-center"
            >
              <div className="mx-auto flex justify-center">
                <HomePosterPreview variant={VARIANTS[index]} size="product" />
              </div>
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-black/55">{body}</p>
            </div>
          ))}
        </div>
        <p data-animate="reveal" className="mt-10 text-xs text-black/45">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
