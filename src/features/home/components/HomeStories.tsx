import { getTranslations } from 'next-intl/server';

const IMAGES = [
  '/images/pomegranate-memory.png',
  '/images/baby-shoes-memory.png',
  '/images/tea-table-memory.png',
];

export async function HomeStories() {
  const t = await getTranslations('HomePage.stories');

  const items = [0, 1, 2].map((i) => ({
    label: t(`items.${i}.label`),
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
    image: IMAGES[i],
  }));

  return (
    <section id="stories" className="mx-auto max-w-7xl px-6 py-20">
      <div data-animate="reveal" className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-3 text-xs text-[#d9b86a]">{t('eyebrow')}</p>
          <h2 className="text-2xl font-semibold md:text-3xl">{t('title')}</h2>
          <p className="mt-4 max-w-xl text-xs leading-6 text-white/50 md:hidden">
            {t('description')}
          </p>
        </div>
        <p className="hidden max-w-xs text-left text-xs leading-6 text-white/50 md:block">
          {t('description')}
        </p>
      </div>
      <div data-animate="stagger" className="grid gap-5 md:grid-cols-3">
        {items.map(({ label, title, description, image }) => (
          <article key={title} data-animate-item>
            <div className="aspect-[1.45] overflow-hidden rounded-lg">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
            <p className="mt-4 text-xs text-[#d9b86a]">{label}</p>
            <h3 className="mt-2 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-6 text-white/55">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
