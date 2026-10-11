import { getTranslations } from 'next-intl/server';
import { Download, MoonStar, Type } from 'lucide-react';

const STEP_ICONS = [MoonStar, Type, Download];

export async function HomeSteps() {
  const t = await getTranslations('HomePage.steps');

  const items = [0, 1, 2].map((i) => ({
    number: t(`items.${i}.number`),
    title: t(`items.${i}.title`),
    body: t(`items.${i}.body`),
  }));

  return (
    <section id="steps" className="border-y border-white/5 bg-[#0c142b] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2
          data-animate="reveal"
          className="text-center text-2xl font-semibold md:text-3xl"
        >
          {t('title')}
        </h2>
        <div
          data-animate="stagger"
          className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10"
        >
          {items.map(({ number, title, body }, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div key={number} data-animate-item className="text-start">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-4xl font-medium leading-none text-[#ceb47b]">
                    {number}
                  </span>
                  <Icon className="size-6 text-[#ceb47b]" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 max-w-xs text-xs leading-7 text-white/55">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
