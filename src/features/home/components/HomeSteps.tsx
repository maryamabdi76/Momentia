import { getTranslations } from 'next-intl/server';

/** The three steps hang on one dashed route, like the map itself. */
export async function HomeSteps() {
  const t = await getTranslations('HomePage.redesign.steps');

  const items = [0, 1, 2].map((i) => ({
    number: `۰${i + 1}`,
    title: t(`items.${i}.title`),
    body: t(`items.${i}.body`),
  }));

  return (
    <section id="steps" className="border-y border-white/10 bg-[#0a1230]/70 px-6 py-20 backdrop-blur-sm">
      <div className="mx-auto md:px-20">
        <h2
          data-animate="reveal"
          className="text-2xl font-semibold leading-snug text-white md:text-4xl"
        >
          {t('title')}
        </h2>
        <ol
          data-animate="stagger"
          className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-10"
        >
          <span
            aria-hidden
            className="absolute inset-x-[8%] top-7 hidden border-t-2 border-dashed border-[#CEB47B]/30 md:block"
          />
          {items.map(({ number, title, body }) => (
            <li key={number} data-animate-item className="relative text-start">
              <span className="relative inline-block bg-[#0a1230] pe-4 text-4xl font-bold text-[#CEB47B]">
                {number}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-8 text-[#AAB6CD]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
