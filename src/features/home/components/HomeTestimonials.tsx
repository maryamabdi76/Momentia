import { getTranslations } from 'next-intl/server';
import { TESTIMONIALS } from '../lib/testimonials';

/** Quotes from buyers; renders nothing until real, approved ones are added to the list. */
export async function HomeTestimonials() {
  if (TESTIMONIALS.length === 0) return null;
  const t = await getTranslations('HomePage.testimonials');

  return (
    <section id="testimonials" className="mx-auto px-6 py-20 md:px-20">
      <p className="mb-3 text-xs text-[#d9b86a]">{t('eyebrow')}</p>
      <h2 className="text-2xl font-semibold md:text-3xl">{t('title')}</h2>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <li key={`${item.who}-${item.quote.slice(0, 20)}`}>
            <figure className="h-full rounded-2xl border border-[#33415B] bg-[#142039] p-6">
              <blockquote className="text-sm leading-8 text-[#E8D9B8]">«{item.quote}»</blockquote>
              <figcaption className="mt-4 text-xs text-[#AAB6CD]">
                {item.who}
                {item.made ? ` · ${item.made}` : ''}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
