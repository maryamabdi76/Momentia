import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Check, Server, ShieldCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePosterPreview } from './HomePosterPreview';

const TRUST_ICONS = [ShieldCheck, Server, UserX];
const ctaButtonClass =
  'h-auto rounded-full bg-[#ceb47b] font-bold text-[#0c142b] hover:bg-[#d6c08a]';

export async function HomeCreate() {
  const t = await getTranslations('HomePage');

  const features = [0, 1, 2].map((i) => t(`create.features.${i}`));
  const trustItems = [0, 1, 2].map((i) => t(`trust.items.${i}`));

  return (
    <section id="create" className="px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Create CTA */}
        <div
          data-animate="reveal"
          className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="flex justify-center md:justify-start">
            <HomePosterPreview variant="gold" size="product" />
          </div>
          <div>
            <p className="text-xs text-white/55">{t('create.eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t('create.title')}</h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-white/65">
              {t('create.description')}
            </p>
            <ul className="mt-6 space-y-4 text-sm text-white/85">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#ceb47b]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className={`${ctaButtonClass} mt-8 px-6 py-3`}>
              <a href="/create">
                {t('cta')}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>

        {/* Trust row */}
        <div
          data-animate="reveal"
          className="flex flex-col items-start justify-between gap-10 border-t border-white/10 pt-12 md:flex-row md:items-center"
        >
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold text-white">{t('trust.title')}</h2>
            <p className="mt-4 text-xs leading-7 text-white/55">{t('trust.description')}</p>
          </div>
          <div className="flex flex-wrap gap-10 text-center text-xs text-[#ceb47b] md:gap-12">
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
      </div>
    </section>
  );
}
