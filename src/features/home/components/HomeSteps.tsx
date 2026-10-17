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
    <section id="steps" className="bg-[#142039] px-6 py-20">
      <div className="mx-auto md:px-20">
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
              <div key={number} data-animate-item className="group text-center">
                <div className="mx-auto flex size-[4.5rem] items-center justify-center rounded-full border border-[#CEB47B]/25 bg-[#CEB47B]/5 ease-out transition-[translate,background-color,border-color,box-shadow] duration-300 motion-safe:group-hover:-translate-y-1.5 group-hover:border-[#CEB47B]/60 group-hover:bg-[#CEB47B]/10 group-hover:shadow-[0_0_32px_-6px_rgba(206,180,123,0.45)]">
                  <Icon className="size-8 text-[#CEB47B]" />
                </div>
                <h3 className="mt-6 flex items-center justify-center gap-2 text-xl font-semibold text-[#CEB47B]">
                  <div>{title}</div>
                </h3>
                <p className="mt-3 text-xs leading-7 text-[#AAB6CD]">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
