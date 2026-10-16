<p align="center">
  <img src="docs/logo.jpg" alt="Momentia logo" width="160" />
</p>

<h1 align="center">Momentia</h1>

<p align="center">
  <strong>Turn a meaningful night into a printable star poster.</strong>
</p>

<p align="center">
  <em>آسمان شب ما — “Our Night Sky”</em>
</p>

<p align="center">
  <a href="#-getting-started"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" alt="Next.js" /></a> 
  <a href="#-getting-started"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a> 
  <a href="#-stack"><img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" /></a> 
  <a href="#-localization"><img src="https://img.shields.io/badge/Locale-fa%20(RTL)-0B1D36?style=flat-square" alt="Persian RTL" /></a>
</p>

---

Momentia takes a date and a place, computes the real sky of that night, and draws it as a poster you can download as PNG or SVG.

✨ No accounts · 🖥️ The sky and the poster are computed in your browser · 💳 Optional premium download via Zarinpal

---

## ✨ Features

|     | Area             | What it does                                                                                                                      |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 🌌  | **Sky engine**   | Stars, constellations, Sun, Moon (with phase), planets, ecliptic and equator from date + location; north up, east on the left      |
| 🎛️  | **Sky options**  | Toggle constellation lines, Moon and planets, planet names, ecliptic, equator, and star density                                   |
| 🖼️  | **Layouts**      | **Round chart** (free) and **Full-page sky** (premium), the whole poster is sky with the text over it                            |
| 🎨  | **Styles**       | Five colour styles: navy & gold, black & white, black & silver, parchment, violet                                                 |
| 📥  | **Downloads**    | Free: watermarked PNG / SVG / share (round layout only). Premium: watermark-free 3000px PNG, available for both layouts          |
| 🌕  | **Moon poster**  | A second product at `/moon`: one big real photo of the Moon with the phase it really had that night (phase name and % lit), same 3-step flow, five styles |
| 🚀  | **Space home**   | The landing page floats in space: a canvas starfield with depth, streaks as you scroll, shooting stars, a nebula and the real Moon receding down the page (GSAP; respects reduced motion) |
| 🗂️  | **Gallery**      | `/posters` lists every layout in every style and opens the create flow with that look preselected                                 |
| 🇮🇷  | **Locale**       | Persian UI (`fa`), RTL, Vazirmatn, Jalali calendar                                                                                |

### Create flow

1. **Moment**: city, Jalali date, optional time.
2. **Personalize**: title, names, short line, layout, style, sky options.
3. **Receive**: download. The full-page layout has no free download; the free buttons are disabled and the watermark-free premium file is offered instead.

`/create?style=violet&template=full` starts the flow with that style and layout.

### Moon poster (`/moon`)

The same three steps (moment → personalize → receive) for a poster that is only the Moon. The phase is computed for the chosen date, time and city; the surface is a real photograph-style disc of the near side (`public/moon/moon-nearside.jpg`) and the unlit part is drawn over it. South of the equator the Moon is turned upside down, as it appears there. Free and premium downloads work as for the sky poster, and the buyer returns to `/moon` after paying.

---

## 🛠️ Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **[shadcn/ui](https://ui.shadcn.com/docs/components)** (Radix, RTL)
- **[next-intl](https://next-intl.dev)** — Persian only for now
- **react-hook-form** + **zod** for the forms
- **Zarinpal** for the premium download (server routes under `src/app/api/payments`)
- **Vazirmatn** via `next/font`
- Root RTL (`dir="rtl"` + `DirectionProvider`)

---

## 📁 Project structure

```text
docs/
  logo.jpg                # Brand mark
messages/
  fa.json                 # UI translations
src/
  app/                    # Pages (/, /create, /posters) and payment API routes
  components/ui/          # shadcn/ui primitives
  features/
    sky/                  # Sky math (projection, ephemeris) + SVG chart
    poster/               # Poster themes, layouts, preview + PNG/SVG export
    payments/             # Zarinpal checkout and premium token
    home/                 # Landing page sections and the posters gallery
  i18n/                   # next-intl config
  lib/                    # Shared utilities
```

---

## 🚀 Getting started

**Requirements:** Node.js 20+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✨

| Script          | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build             |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |
| `npm test`      | Run the unit tests           |

### Premium payments

Copy `.env.example` to `.env.local` and fill it in. Without a payment secret the premium button reports that checkout is unavailable; everything else works.

| Variable                        | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_PREMIUM_PRICE_IRT` | Premium price in tomans                              |
| `ZARINPAL_MERCHANT_ID`          | Merchant id (any UUID works in sandbox)              |
| `ZARINPAL_SANDBOX`              | `true` to use the Zarinpal sandbox                   |
| `PAYMENT_TOKEN_SECRET`          | 32+ random characters, signs the premium token       |
| `SITE_URL`                      | Optional public origin used for the payment callback |

> The free files are generated in the browser, so the lock on the full-page layout is a product gate, not a security boundary. Only the watermark-free premium file is checked against the server-validated token.

---

## 🌕 Moon image

`public/moon/moon-nearside.jpg` is the Earth-facing side of the Moon, projected from the 4096×2048 equirectangular map `textures/moon_4k.jpg` of the [Stellarium](https://github.com/Stellarium/stellarium) repository (orthographic view, north up, contrast stretched). Check that map's licence before using the poster commercially, or replace the image with one you hold the rights to (for example NASA's CGI Moon Kit); the file name and size are all the code relies on.

---

## 🌍 Localization

Strings live in `messages/fa.json`.

- Server components → `getTranslations`
- Client components → `useTranslations`

To add another language later: add `messages/<locale>.json`, extend `locales` in `src/i18n/config.ts`, and resolve the locale in `src/i18n/request.ts`.

---

## 📄 License

Private project — all rights reserved.
