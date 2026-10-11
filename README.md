# آسمان شب ما (Momentia)

وب‌اپ کلاینت‌ساید که تاریخ و مکان یک لحظه را می‌گیرد و آسمان همان شب را به‌صورت پوستر SVG/PNG می‌کشد.

## پشته

- Next.js (App Router) + TypeScript + Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com/docs/components) (Radix + RTL)
- [next-intl](https://next-intl.dev) (فعلاً فقط `fa`)
- فونت Vazirmatn با `next/font`
- راست‌به‌چپ از ریشه (`dir="rtl"` + `DirectionProvider`)

## ساختار

```
messages/
  fa.json              # ترجمه‌ها
src/
  app/                 # App Router
  components/ui/       # shadcn/ui
  features/
    sky/               # محاسبه و رندر آسمان
    poster/            # قالب پوستر و خروجی
  i18n/                # تنظیمات next-intl
  lib/                 # utils مشترک
```

## اجرا

```bash
npm install
npm run dev
```

باز کردن [http://localhost:3000](http://localhost:3000).
