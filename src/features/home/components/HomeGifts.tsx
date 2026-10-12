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
    <section id="gifts" className="bg-[#F4F0E7] px-6 py-24 text-[#17233B]">
      <div className="mx-auto md:px-20">
        <div data-animate="reveal">
          <p className="text-xs">{t('eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            {t('title')}
          </h2>
        </div>
        <div
          data-animate="stagger"
          className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8"
        >
          {items.map(({ title, body }, index) => (
            <div key={title} data-animate-item className=" text-center">
              <div className="mx-auto flex justify-center rounded-2xl bg-[#DDD8CD] px-8 py-10">
                <HomePosterPreview variant={VARIANTS[index]} size="product" />
              </div>
              <h3 className="mt-8 text-xl">{title}</h3>
              <p className="mx-auto mt-2 text-xs leading-6">{body}</p>
            </div>
          ))}
        </div>
        <p data-animate="reveal" className="mt-10 text-xs">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
