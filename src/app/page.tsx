import messages from "../../messages/fa.json";
import {
  ArrowLeft,
  Check,
  Clock3,
  Gift,
  Moon,
  Sparkles,
  UserRound,
} from "lucide-react";

const copy = messages.HomePage;
const moments = [
  [copy.stories.items[0].title, copy.stories.items[0].description, "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AD%D8%A7%D9%84_%D9%88%D9%87%D9%88%D8%A7%DB%8C%20%D8%AE%D8%A7%D8%B7%D8%B1%D9%87-bfox3XkzFXxpn7jlQtU6SOE2VB0gNb.png"],
  [copy.stories.items[1].title, copy.stories.items[1].description, "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AD%D8%A7%D9%84_%D9%88%D9%87%D9%88%D8%A7%DB%8C%20%D8%AE%D8%A7%D8%B7%D8%B1%D9%87%20%282%29-ydHyddAaZ7B74p4NPxLbGuj4IG51Sp.png"],
  [copy.stories.items[2].title, copy.stories.items[2].description, "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AD%D8%A7%D9%84_%D9%88%D9%87%D9%88%D8%A7%DB%8C%20%D8%AE%D8%A7%D8%B7%D8%B1%D9%87%20%281%29-hqqD7cSOOGLZcuLXjKJb7ruDYVeNz8.png"],
];
const faqs = copy.faq.items.map(({ question, answer }) => [question, answer]);

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 text-xs text-white/70">
          <a className="text-sm font-bold text-white" href="#top">
            {copy.brand} <span className="text-[#d9b86a]">✦</span>
          </a>
          <nav className="hidden gap-8 md:flex">
            <a href="#stories">داستان‌های شب</a>
            <a href="#gifts">هدیه‌ای ماندگار</a>
            <a href="#faq">سوالات متداول</a>
          </nav>
          <a
            href="#create"
            className="rounded-md bg-[#d9b86a] px-5 py-2 font-bold text-[#101a35]"
          >
            ساختن شب من
          </a>
        </div>
      </header>
      <section
        id="top"
        className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28"
      >
        <div className="order-2 md:order-1">
          <p className="mb-5 text-xs text-[#d9b86a]">
            یک داستان، یک آسمان، یک خاطره
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.45] tracking-tight text-white md:text-6xl">
            بعضی شب‌ها،
            <br />
            تا همیشه با ما می‌مانند.
          </h1>
          <p className="mt-7 max-w-lg text-sm leading-8 text-white/60">
            آسمان شب ما، لحظه‌های عزیز زندگی‌ات را روی نقشه‌ای از ستاره‌ها ثبت
            می‌کند؛ تا هر بار که به آن نگاه می‌کنی، دوباره به همان شب برگردی.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <a
              href="#create"
              className="rounded-md bg-[#d9b86a] px-6 py-3 text-sm font-bold text-[#101a35]"
            >
              ساختن شب من <ArrowLeft className="mr-2 inline-block size-4" />
            </a>
            <span className="text-xs text-white/50">
              هدیه‌ای شخصی و ماندگار
            </span>
          </div>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative flex aspect-[0.78] w-full max-w-[370px] items-center justify-center rounded-lg bg-[#152441] p-8">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 35%, #7888a8 1px, transparent 1px), radial-gradient(circle at 72% 60%, #7888a8 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <div className="relative aspect-[0.68] w-[78%] border border-[#c8a85f]/70 bg-[#132346] p-5 text-center shadow-2xl">
              <p className="text-[8px] text-white/60">نقشه‌ی آسمان شب</p>
              <div className="mx-auto mt-3 aspect-square rounded-full border border-[#c8a85f]/50 p-4">
                <div className="flex h-full items-center justify-center rounded-full border border-dashed border-white/20">
                  <Moon className="size-8 fill-[#f2e7be] text-[#f2e7be]" />
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold text-[#f2e7be]">
                بهترین شب، کنار تو
              </p>
              <p className="mt-2 text-[8px] leading-5 text-white/60">
                یک خاطره برای تمام شب‌های بعد
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="stories" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs text-[#d9b86a]">
              خاطره‌ای برای هر آسمان
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              {copy.stories.title}
            </h2>
          </div>
          <p className="hidden max-w-xs text-left text-xs leading-6 text-white/50 md:block">
            هر شب قصه‌ای دارد؛ قصه‌ای که ارزش ماندن و دوباره خوانده شدن را دارد.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {moments.map(([title, description, image]) => (
            <article key={title}>
              <div className="aspect-[1.45] overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <p className="mt-4 text-xs text-[#d9b86a]">داستان شب</p>
              <h3 className="mt-2 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-white/55">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#152441] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold">
            از یک خاطره تا یک پوستر در سه قدم
          </h2>
          <div className="mt-12 grid gap-10 text-center md:grid-cols-3">
            {[
              [
                "۱",
                "شب خودت را پیدا کن",
                "تاریخ و مکان لحظه‌ای را که برایت مهم است انتخاب کن.",
              ],
              [
                "۲",
                "کلماتت را از دل بنویس",
                "یک پیام کوتاه اضافه کن تا داستانت کامل شود.",
              ],
              [
                "۳",
                "خاطره‌ات را دریافت کن",
                "پوستر شخصی تو آماده می‌شود؛ برای خودت یا یک عزیز.",
              ],
            ].map(([number, title, body]) => (
              <div key={number}>
                <span className="text-3xl text-[#d9b86a]">{number}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-white/55">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="gifts" className="bg-[#f4f0e7] px-6 py-20 text-[#101a35]">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs text-[#9b7d35]">برای لحظه‌های مهم زندگی</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            شبی که به سلیقه‌ی تو قاب می‌شود
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [
                "مینیمال سیاه‌وسفید",
                "سادگی برای خاطره‌هایی که عمیق‌اند.",
              ],
              [
                "اجوردی و طلایی",
                "برای شب‌هایی که درخشان‌ترند.",
              ],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="rounded-lg bg-[#e5e0d7] p-8 text-center"
              >
                <div
                  className={`mx-auto flex aspect-[0.75] max-w-[220px] items-center justify-center ${index ? "bg-[#132346]" : "bg-[#f8f6f0]"} shadow-xl`}
                >
                  <div
                    className={`aspect-[0.68] w-[78%] border ${index ? "border-[#c8a85f]" : "border-[#b9b5aa]"} p-4`}
                  >
                    <span className="mt-6 flex justify-center">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D9%86%D9%82%D8%B4%20%D8%A2%D8%B3%D9%85%D8%A7%D9%86%20%281%29-QF4WgMfZpi7moKy5ncjHMlIA4nTABk.png"
                        alt="نقش آسمان سیاه‌وسفید"
                        className="size-32 object-contain opacity-80"
                      />
                    </span>
                    <p
                      className={`mt-8 text-sm font-semibold ${index ? "text-[#f2e7be]" : ""}`}
                    >
                      بهترین شب، کنار تو
                    </p>
                  </div>
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-xs text-black/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="create" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-lg border border-white/15 bg-[#111d3a] p-8 md:grid-cols-[1fr_1.35fr] md:p-12">
          <div className="rounded-lg border border-white/15 p-8 text-center">
            <Sparkles className="mx-auto size-6 text-[#d9b86a]" />
            <h3 className="mt-5 text-xl font-semibold">بهترین شب، کنار تو</h3>
            <p className="mt-4 text-xs text-white/60">
              هدیه‌ای که هر بار نگاهش کنی، لبخند می‌زند.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#d9b86a]">هدیه‌ای که داستان دارد</p>
            <h2 className="mt-3 text-3xl font-semibold">
              آسمانِ ما از داستانِ تو
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-white/60">
              لحظه‌های مهمت را روی نقشه‌ی واقعی آسمان ثبت کن؛ یک یادگاری شخصی
              بساز که هیچ‌وقت تکراری نمی‌شود.
            </p>
            <ul className="mt-5 space-y-3 text-xs text-white/70">
              <li>
                <Check className="ml-2 inline size-4 text-[#d9b86a]" />
                ساخته شده برای یک نفر خاص
              </li>
              <li>
                <Check className="ml-2 inline size-4 text-[#d9b86a]" />
                طراحی مینیمال و ماندگار
              </li>
              <li>
                <Check className="ml-2 inline size-4 text-[#d9b86a]" />
                قابل سفارش در چند سبک
              </li>
            </ul>
            <a
              href="#top"
              className="mt-7 inline-block rounded-md bg-[#d9b86a] px-6 py-3 text-sm font-bold text-[#101a35]"
            >
              ساختن شب من <ArrowLeft className="mr-2 inline size-4" />
            </a>
          </div>
        </div>
      </section>
      <section className="bg-[#152441] px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8">
          <h2 className="max-w-sm text-2xl font-semibold">
            خاطرات، پیشِ خودت می‌مانند
          </h2>
          <div className="flex gap-10 text-center text-xs text-white/60">
            <span>
              <UserRound className="mx-auto mb-2 size-5 text-[#d9b86a]" />
              شخصی‌سازی
            </span>
            <span>
              <Clock3 className="mx-auto mb-2 size-5 text-[#d9b86a]" />
              ماندگار
            </span>
            <span>
              <Gift className="mx-auto mb-2 size-5 text-[#d9b86a]" />
              هدیه‌پذ��ر
            </span>
          </div>
        </div>
      </section>
      <section
        id="faq"
        className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[0.7fr_1.3fr]"
      >
        <div>
          <p className="text-xs text-[#d9b86a]">{copy.faq.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-relaxed">
            چند سؤال،
            <br />
            چند جواب روشن
          </h2>
        </div>
        <div>
          {faqs.map(([question, answer]) => (
            <details
              key={question}
              className="group border-b border-white/15 py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                <span>{question}</span>
                <span className="text-2xl font-light text-[#d9b86a] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-xs leading-7 text-white/55">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="bg-[#172d59] px-6 py-20 text-center">
        <Sparkles className="mx-auto size-5 text-[#d9b86a]" />
        <h2 className="mt-5 text-3xl font-semibold">
          یک شب را از گذر زمان جدا کن.
        </h2>
        <p className="mt-4 text-sm text-white/60">
          امشب، یک خاطره را برای همیشه نگه دار.
        </p>
        <a
          href="#create"
          className="mt-7 inline-block rounded-md bg-[#d9b86a] px-6 py-3 text-sm font-bold text-[#101a35]"
        >
          ساختن شب من <ArrowLeft className="mr-2 inline size-4" />
        </a>
      </section>
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <span className="font-semibold text-white">
            {copy.brand} <span className="text-[#d9b86a]">✦</span>
          </span>
          <span>{copy.footer}</span>
          <span>© آسمان شب ما</span>
        </div>
      </footer>
    </main>
  );
}
