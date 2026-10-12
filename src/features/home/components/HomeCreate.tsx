import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Check, Server, ShieldCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePosterPreview } from './HomePosterPreview';

const TRUST_ICONS = [ShieldCheck, Server, UserX];
const ctaButtonClass =
  'h-auto rounded-full bg-[#CEB47B] font-bold text-[#0c142b] hover:bg-[#e0c180]';

export async function HomeCreate() {
  const t = await getTranslations('HomePage');

  const features = [0, 1, 2].map((i) => t(`create.features.${i}`));
  const trustItems = [0, 1, 2].map((i) => t(`trust.items.${i}`));

  return (
    <section id="create" className="py-24 space-y-16">
      <div className="mx-auto px-6 md:px-20">
        {/* Create CTA */}
        <div
          data-animate="reveal"
          className="grid items-center gap-12 pb-10 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="flex justify-center">
            <HomePosterPreview variant="gold" size="product" />
          </div>
          <div>
            <p className="text-xs text-[#CEB47B]">{t('create.eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {t('create.title')}
            </h2>
            <p className="mt-5 text-sm leading-8 text-[#AAB6CD]">
              {t('create.description')}
            </p>
            <ul className="mt-6 space-y-4 text-sm text-[#E8D9B8]">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#CEB47B]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 p-6! bg-[#CEB47B] font-bold text-[#0c142b] hover:bg-[#e0c180]"
            >
              <a href="/create">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </div>
      {/* Trust row */}
      <div
        data-animate="reveal"
        className="flex flex-col bg-[#142039] items-start justify-between gap-10 px-6 md:px-20 py-10 md:flex-row md:items-center"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {t('trust.title')}
          </h2>
          <p className="mt-4 text-xs leading-7 text-[#AAB6CD]">
            {t('trust.description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-10 text-center text-xs text-[#CEB47B] md:gap-12">
          {trustItems.map((label, index) => {
            const Icon = TRUST_ICONS[index];
            return (
              <span key={label} className="min-w-20">
                <Icon className="mx-auto mb-2 size-5 stroke-[1.5]" />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
