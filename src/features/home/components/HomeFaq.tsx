import { getTranslations } from 'next-intl/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export async function HomeFaq() {
  const t = await getTranslations('HomePage.faq');
  const [line1, line2] = t('title').split('\n');

  const items = [0, 1, 2, 3, 4].map((i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section
      id="faq"
      className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[0.75fr_1.25fr] md:gap-16"
    >
      <div data-animate="reveal">
        <p className="text-xs text-[#ceb47b]">{t('eyebrow')}</p>
        <h2 className="mt-4 text-3xl font-semibold leading-relaxed text-white">
          {line1}
          <br />
          {line2}
        </h2>
        <p className="mt-5 text-xs leading-7 text-white/55">{t('description')}</p>
      </div>
      <Accordion
        type="single"
        collapsible
        data-animate="stagger"
        className="border-t border-white/15"
      >
        {items.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            value={question}
            data-animate-item
            className="border-white/15"
          >
            <AccordionTrigger className="py-5 text-sm font-semibold text-white hover:no-underline **:data-[slot=accordion-trigger-icon]:text-[#ceb47b]">
              {question}
            </AccordionTrigger>
            <AccordionContent className="text-xs leading-7 text-white/55">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
