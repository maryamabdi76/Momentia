import messages from '../../messages/fa.json';
import {
  ArrowLeft,
  Check,
  Download,
  MoonStar,
  Orbit,
  Server,
  ShieldCheck,
  Sparkles,
  Type,
  UserX,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { HomeMotion } from '@/features/home/components/HomeMotion';

const copy = messages.HomePage;
const moments = [
  [
    copy.stories.items[0].label,
    copy.stories.items[0].title,
    copy.stories.items[0].description,
    '/images/pomegranate-memory.png',
  ],
  [
    copy.stories.items[1].label,
    copy.stories.items[1].title,
    copy.stories.items[1].description,
    '/images/baby-shoes-memory.png',
  ],
  [
    copy.stories.items[2].label,
    copy.stories.items[2].title,
    copy.stories.items[2].description,
    '/images/tea-table-memory.png',
  ],
];
const trustIcons = [ShieldCheck, Server, UserX];
const stepIcons = [MoonStar, Type, Download];

const ctaButtonClass =
  'h-auto rounded-full bg-[#ceb47b] font-bold text-[#0c142b] hover:bg-[#d6c08a]';
const navLinkClass =
  'bg-transparent text-white hover:bg-white/10 hover:text-[#ceb47b] focus:bg-white/10 focus:text-[#ceb47b]';

type PosterVariant = 'gold' | 'mono';
type PosterSize = 'hero' | 'product' | 'compact';

function PosterPreview({
  variant = 'gold',
  size = 'product',
}: {
  variant?: PosterVariant;
  size?: PosterSize;
}) {
  const isGold = variant === 'gold';
  const frameClass =
    size === 'hero'
      ? 'max-w-[400px] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.35)]'
      : size === 'compact'
        ? 'max-w-[240px] p-2 shadow-lg'
        : 'max-w-[260px] p-2.5 shadow-xl';

  return (
    <div className={`w-full rounded-sm border border-white/20 ${frameClass}`}>
      <div
        className={`border px-4 py-5 text-center ${isGold ? 'border-[#c8a85f]/70 bg-[#132346]' : 'border-[#b9b5aa] bg-[#f8f6f0]'}`}
      >
        <p
          className={`text-[10px] ${isGold ? 'text-white/60' : 'text-[#101a35]/50'}`}
        >
          {copy.hero.posterMap}
        </p>
        <div
          className={`mx-auto mt-3 flex aspect-square items-center justify-center rounded-full border p-3 ${isGold ? 'border-[#c8a85f]/50' : 'border-[#101a35]/15'}`}
        >
          <img
            src={
              isGold
                ? '/images/gold-constellation.png'
                : '/images/monochrome-constellation.png'
            }
            alt={isGold ? copy.hero.posterAltGold : copy.hero.posterAltMono}
            className={`size-full object-contain ${isGold ? 'p-1' : 'opacity-90'}`}
          />
        </div>
        <p
          className={`mt-4 font-semibold ${size === 'hero' ? 'text-xl' : 'text-sm'} ${isGold ? 'text-[#f2e7be]' : 'text-[#101a35]'}`}
        >
          {copy.hero.poster}
        </p>
        {size === 'hero' ? (
          <>
            <p className="mt-2 text-xs text-white/80">
              {copy.hero.posterNames}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-white/50">
              {copy.hero.posterMeta}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  const [heroTitleLine1, heroTitleLine2] = copy.hero.title.split('\n');
  const [faqTitleLine1, faqTitleLine2] = copy.faq.title.split('\n');

  return (
    <HomeMotion
      className="overflow-hidden bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <header data-animate="header" className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm text-white">
          <a
            className="flex gap-1 items-center font-bold text-white"
            href="#top"
          >
            <Sparkles className="size-3 text-[#ceb47b]" />
            {copy.brand}
          </a>
          <NavigationMenu
            viewport={false}
            className="hidden max-w-none md:flex"
          >
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink href="#gifts" className={navLinkClass}>
                  {copy.nav.posters}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#steps" className={navLinkClass}>
                  {copy.nav.how}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#faq" className={navLinkClass}>
                  {copy.nav.faq}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            asChild
            size="sm"
            className={`${ctaButtonClass} px-5 py-2 text-xs`}
          >
            <a href="#create">{copy.cta}</a>
          </Button>
        </div>
      </header>
      <section
        id="top"
        className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24"
      >
        <div className="order-2 md:order-1">
          <p
            data-animate="hero"
            className="mb-5 flex items-center gap-2 text-xs  text-[#ceb47b]"
          >
            <Sparkles className="size-3" />
            {copy.hero.eyebrow}
          </p>
          <h1
            data-animate="hero"
            className="max-w-2xl text-3xl font-semibold leading-[1.45] tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            {heroTitleLine1}
            <br />
            {heroTitleLine2}
          </h1>
          <div data-animate="hero" className="mt-6 h-px w-16 bg-[#ceb47b]" />
          <p
            data-animate="hero"
            className="mt-6 max-w-lg text-sm leading-8 text-white/85"
          >
            {copy.hero.description}
          </p>
          <div data-animate="hero" className="mt-8">
            <Button asChild size="lg" className={`${ctaButtonClass} px-6 py-3`}>
              <a href="#create">
                {copy.cta}
                <ArrowLeft data-icon="inline-end" />
              </a>
            </Button>
            <p className="mt-3 text-xs text-white/50">{copy.hero.benefits}</p>
          </div>
          <p
            data-animate="hero"
            className="mt-10 flex items-start gap-2 text-[11px] leading-6 text-white/40"
          >
            <Orbit className="mt-0.5 size-3.5 shrink-0 text-[#ceb47b]" />
            {copy.hero.disclaimer}
          </p>
        </div>
        <div className="order-1 flex flex-col items-center md:order-2">
          <div data-animate="hero-poster" className="w-full max-w-[420px]">
            <PosterPreview variant="gold" size="hero" />
          </div>
          <p
            data-animate="hero"
            className="mt-4 text-center text-xs text-white/45"
          >
            {copy.hero.posterCaption}
          </p>
        </div>
      </section>
      <section id="stories" className="mx-auto max-w-7xl px-6 py-20">
        <div
          data-animate="reveal"
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <p className="mb-3 text-xs text-[#d9b86a]">
              {copy.stories.eyebrow}
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              {copy.stories.title}
            </h2>
            <p className="mt-4 max-w-xl text-xs leading-6 text-white/50 md:hidden">
              {copy.stories.description}
            </p>
          </div>
          <p className="hidden max-w-xs text-left text-xs leading-6 text-white/50 md:block">
            {copy.stories.description}
          </p>
        </div>
        <div data-animate="stagger" className="grid gap-5 md:grid-cols-3">
          {moments.map(([label, title, description, image]) => (
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
              <p className="mt-2 text-xs leading-6 text-white/55">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        id="steps"
        className="border-y border-white/5 bg-[#0c142b] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            data-animate="reveal"
            className="text-center text-2xl font-semibold md:text-3xl"
          >
            {copy.steps.title}
          </h2>
          <div
            data-animate="stagger"
            className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10"
          >
            {copy.steps.items.map(({ number, title, body }, index) => {
              const Icon = stepIcons[index];
              return (
                <div key={number} data-animate-item className="text-start">
                  <div className=" flex items-center gap-2">
                    <span className="text-4xl flex-1 font-medium leading-none text-[#ceb47b]">
                      {number}
                    </span>
                    <Icon className="size-6 text-[#ceb47b]" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-xs text-xs leading-7 text-white/55">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="gifts" className="bg-[#f2f0e9] px-6 py-24 text-[#101a35]">
        <div className="mx-auto max-w-7xl">
          <div data-animate="reveal">
            <p className="text-xs text-[#9b7d35]">{copy.gifts.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              {copy.gifts.title}
            </h2>
          </div>
          <div
            data-animate="stagger"
            className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8"
          >
            {copy.gifts.items.map(({ title, body }, index) => (
              <div
                key={title}
                data-animate-item
                className="rounded-2xl bg-[#e0ddd2] px-8 py-10 text-center"
              >
                <div className="mx-auto flex justify-center">
                  <PosterPreview
                    variant={index ? 'mono' : 'gold'}
                    size="product"
                  />
                </div>
                <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-black/55">
                  {body}
                </p>
              </div>
            ))}
          </div>
          <p data-animate="reveal" className="mt-10 text-xs text-black/45">
            {copy.gifts.note}
          </p>
        </div>
      </section>
      <section id="create" className="px-6 py-24">
        <div className="mx-auto max-w-7xl space-y-16">
          <div
            data-animate="reveal"
            className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="flex justify-center md:justify-start">
              <PosterPreview variant="gold" size="product" />
            </div>
            <div>
              <p className="text-xs text-white/55">{copy.create.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {copy.create.title}
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-8 text-white/65">
                {copy.create.description}
              </p>
              <ul className="mt-6 space-y-4 text-sm text-white/85">
                {copy.create.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-[#ceb47b]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className={`${ctaButtonClass} mt-8 px-6 py-3`}
              >
                <a href="#top">
                  {copy.cta}
                  <ArrowLeft data-icon="inline-end" />
                </a>
              </Button>
            </div>
          </div>
          <div
            data-animate="reveal"
            className="flex flex-col items-start justify-between gap-10 border-t border-white/10 pt-12 md:flex-row md:items-center"
          >
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold text-white">
                {copy.trust.title}
              </h2>
              <p className="mt-4 text-xs leading-7 text-white/55">
                {copy.trust.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-10 text-center text-xs text-[#ceb47b] md:gap-12">
              {copy.trust.items.map((label, index) => {
                const Icon = trustIcons[index];
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
      <section
        id="faq"
        className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[0.75fr_1.25fr] md:gap-16"
      >
        <div data-animate="reveal">
          <p className="text-xs text-[#ceb47b]">{copy.faq.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-relaxed text-white">
            {faqTitleLine1}
            <br />
            {faqTitleLine2}
          </h2>
          <p className="mt-5 text-xs leading-7 text-white/55">
            {copy.faq.description}
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          data-animate="stagger"
          className="border-t border-white/15"
        >
          {copy.faq.items.map(({ question, answer }) => (
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
      <section
        data-animate="reveal"
        className="bg-[#0c142b] px-6 py-20 text-center"
      >
        <Sparkles className="mx-auto block size-6 text-[#ceb47b]" />
        <h2 className="mt-5 text-3xl font-semibold text-white">
          {copy.finalCta.title}
        </h2>
        <p className="mt-4 text-sm text-white/55">{copy.finalCta.body}</p>
        <Button
          asChild
          size="lg"
          className={`${ctaButtonClass} mt-7 px-6 py-3`}
        >
          <a href="#create">
            {copy.cta}
            <ArrowLeft data-icon="inline-end" />
          </a>
        </Button>
      </section>
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white"
            >
              {copy.brand}
              <Sparkles className="size-3 text-[#ceb47b]" />
            </a>
            <p className="mt-3 text-xs leading-7 text-white/45">
              {copy.footer.description}
            </p>
          </div>
          <NavigationMenu viewport={false} className="max-w-none">
            <NavigationMenuList className="flex-wrap justify-start gap-x-3 gap-y-2">
              {(
                [
                  ['#privacy', copy.footer.links.privacy],
                  ['#guide', copy.footer.links.guide],
                  ['#faq', copy.footer.links.faq],
                ] as const
              ).map(([href, label]) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    href={href}
                    className="h-auto bg-transparent p-0 text-xs text-white/45 hover:bg-transparent hover:text-white focus:bg-transparent"
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </footer>
    </HomeMotion>
  );
}
