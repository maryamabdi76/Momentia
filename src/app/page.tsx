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
const faqs = copy.faq.items.map(({ question, answer }) => [question, answer]);
const trustIcons = [ShieldCheck, Server, UserX];
const stepIcons = [MoonStar, Type, Download];

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
    <main className="overflow-hidden bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm text-white">
          <a
            className="flex gap-1 items-center font-bold text-white"
            href="#top"
          >
            <Sparkles className="size-3 text-[#ceb47b]" />
            {copy.brand}
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="transition hover:text-[#ceb47b]" href="#gifts">
              {copy.nav.posters}
            </a>
            <a className="transition hover:text-[#ceb47b]" href="#steps">
              {copy.nav.how}
            </a>
            <a className="transition hover:text-[#ceb47b]" href="#faq">
              {copy.nav.faq}
            </a>
          </nav>
          <a
            href="#create"
            className="rounded-full bg-[#ceb47b] px-5 py-2 text-xs font-bold text-[#0c142b]"
          >
            {copy.cta}
          </a>
        </div>
      </header>
      <section
        id="top"
        className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24"
      >
        <div className="order-2 md:order-1">
          <p className="mb-5 flex items-center gap-2 text-xs  text-[#ceb47b]">
            <Sparkles className="size-3" />
            {copy.hero.eyebrow}
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold leading-[1.45] tracking-tight text-white md:text-5xl lg:text-6xl">
            {heroTitleLine1}
            <br />
            {heroTitleLine2}
          </h1>
          <div className="mt-6 h-px w-16 bg-[#ceb47b]" />
          <p className="mt-6 max-w-lg text-sm leading-8 text-white/85">
            {copy.hero.description}
          </p>
          <div className="mt-8">
            <a
              href="#create"
              className="inline-flex items-center rounded-full bg-[#ceb47b] px-6 py-3 text-sm font-bold text-[#0c142b]"
            >
              {copy.cta}
              <ArrowLeft className="mr-2 size-4" />
            </a>
            <p className="mt-3 text-xs text-white/50">{copy.hero.benefits}</p>
          </div>
          <p className="mt-10 flex items-start gap-2 text-[11px] leading-6 text-white/40">
            <Orbit className="mt-0.5 size-3.5 shrink-0 text-[#ceb47b]" />
            {copy.hero.disclaimer}
          </p>
        </div>
        <div className="order-1 flex flex-col items-center md:order-2">
          <div className="w-full max-w-[420px]">
            <PosterPreview variant="gold" size="hero" />
          </div>
          <p className="mt-4 text-center text-xs text-white/45">
            {copy.hero.posterCaption}
          </p>
        </div>
      </section>
      <section id="stories" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
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
        <div className="grid gap-5 md:grid-cols-3">
          {moments.map(([label, title, description, image]) => (
            <article key={title}>
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
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold md:text-3xl">
            {copy.steps.title}
          </h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {copy.steps.items.map(({ number, title, body }, index) => {
              const Icon = stepIcons[index];
              return (
                <div key={number} className="text-start">
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
        <div className="mx-auto max-w-6xl">
          <p className="text-xs text-[#9b7d35]">{copy.gifts.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            {copy.gifts.title}
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
            {copy.gifts.items.map(({ title, body }, index) => (
              <div
                key={title}
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
          <p className="mt-10 text-xs text-black/45">{copy.gifts.note}</p>
        </div>
      </section>
      <section id="create" className="px-6 py-24">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
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
              <a
                href="#top"
                className="mt-8 inline-flex items-center rounded-full bg-[#ceb47b] px-6 py-3 text-sm font-bold text-[#0c142b]"
              >
                {copy.cta}
                <ArrowLeft className="mr-2 size-4" />
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-10 border-t border-white/10 pt-12 md:flex-row md:items-center">
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
        className="mx-auto grid max-w-7xl gap-12 py-20 md:grid-cols-[0.75fr_1.25fr] md:gap-16"
      >
        <div>
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
        <div className="border-t border-white/15">
          {faqs.map(([question, answer]) => (
            <div
              key={question}
              className="flex items-start gap-4 border-b border-white/15 py-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{question}</p>
                <p className="mt-3 text-xs leading-7 text-white/55">{answer}</p>
              </div>
              <span className="mt-2.5 h-px w-3.5 shrink-0 bg-[#ceb47b]" />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#0c142b] px-6 py-20 text-center">
        <Sparkles className="mx-auto block size-6 text-[#ceb47b]" />
        <h2 className="mt-5 text-3xl font-semibold text-white">
          {copy.finalCta.title}
        </h2>
        <p className="mt-4 text-sm text-white/55">{copy.finalCta.body}</p>
        <a
          href="#create"
          className="mt-7 inline-flex items-center rounded-full bg-[#ceb47b] px-6 py-3 text-sm font-bold text-[#0c142b]"
        >
          {copy.cta}
          <ArrowLeft className="mr-2 size-4" />
        </a>
      </section>
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
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
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/45">
            <a className="transition hover:text-white" href="#privacy">
              {copy.footer.links.privacy}
            </a>
            <span aria-hidden>·</span>
            <a className="transition hover:text-white" href="#guide">
              {copy.footer.links.guide}
            </a>
            <span aria-hidden>·</span>
            <a className="transition hover:text-white" href="#faq">
              {copy.footer.links.faq}
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
