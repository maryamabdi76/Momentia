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

Momentia is a **client-side** web app that takes a date and place, then draws that night’s sky as a beautiful SVG poster you can download as PNG.

✨ No backend · 🔐 No accounts · 🖥️ Nothing stored on a server

---

## ✨ Features (roadmap)

|     | Area           | What it does                                                               |
| --- | -------------- | -------------------------------------------------------------------------- |
| 🌌  | **Sky engine** | Sun, moon (with phase), planets, and star positions from date + location   |
| 🖼️  | **Poster**     | Editable title, names, short line, Jalali date, place — SVG → high-res PNG |
| 🇮🇷  | **Locale**     | Persian UI first (`fa`), RTL, Vazirmatn, Jalali calendar                   |
| 🔒  | **Privacy**    | Everything runs in the browser                                             |

---

## 🛠️ Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **[shadcn/ui](https://ui.shadcn.com/docs/components)** (Radix, RTL)
- **[next-intl](https://next-intl.dev)** — Persian only for now
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
  app/                    # App Router pages & layout
  components/ui/          # shadcn/ui primitives
  features/
    sky/                  # Sky math + SVG render
    poster/               # Poster template + export
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

---

## 🌍 Localization

Strings live in `messages/fa.json`.

- Server components → `getTranslations`
- Client components → `useTranslations`

To add another language later: add `messages/<locale>.json`, extend `locales` in `src/i18n/config.ts`, and resolve the locale in `src/i18n/request.ts`.

---

## 📄 License

Private project — all rights reserved.
