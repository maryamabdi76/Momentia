import { getTranslations } from 'next-intl/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export async function HomeFaq() {
  const t = await getTranslations('HomePage.faq');
  const tR = await getTranslations('HomePage.redesign.faq');
  const [line1, line2] = tR('title').split('\n');

  // the treasure map's own questions first, then the older ones
  const items = [7, 8, 6, 0, 1, 2, 3, 4, 5].map((i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section
      id="faq"
      className="mx-auto grid md:px-20 gap-12 px-6 pb-16 md:grid-cols-[0.75fr_1.25fr] md:gap-16"
    >
      <div data-animate="reveal">
        <p className="text-xs text-[#CEB47B]">{tR('eyebrow')}</p>
        <h2 className="mt-4 text-3xl font-semibold leading-relaxed text-white md:text-4xl">
          {line1}
          <br />
          {line2}
        </h2>
        <p className="mt-5 text-xs leading-7 text-white/55">
          {tR('description')}
        </p>
      </div>
      <Accordion type="multiple" data-animate="stagger" className="space-y-3">
        {items.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            value={question}
            data-animate-item
            className="rounded-2xl border border-white/10 bg-[#0e1634]/60 px-5 backdrop-blur-md data-[state=open]:border-[#CEB47B]/40"
          >
            <AccordionTrigger className="py-5 text-sm font-semibold text-white hover:no-underline **:data-[slot=accordion-trigger-icon]:text-[#CEB47B]">
              {question}
            </AccordionTrigger>
            <AccordionContent className="text-xs leading-7 text-[#AAB6CD]">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
