# CLAUDE.md — Momentia

This file tells Claude (and any agent) how to work in this repository. Follow it before making changes.

## Project overview

Momentia is a web app built with Next.js and TypeScript.
TODO: one or two sentences on what Momentia does and who it is for.

## Tech stack

- Next.js (App Router) + React
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- TanStack Query for server state
- Zustand for client state
- React Hook Form + Zod for forms and validation
- Jest + React Testing Library for tests
- TODO: package manager (pnpm / npm / yarn), backend/API, i18n, hosting

## Commands

```bash
pnpm install       # install dependencies (adjust to your package manager)
pnpm dev           # start dev server
pnpm build         # production build
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm test          # Jest
```

Before finishing any task, run `lint`, `typecheck` and `test`, and fix what you broke.

## Project structure

```
src/
  app/               # routes, layouts, loading/error states (App Router)
  components/
    ui/              # shadcn/ui primitives — do not hand-edit unless necessary
    ...              # shared, reusable components
  features/<name>/   # feature modules: components, hooks, api, schemas, types
  hooks/             # shared hooks
  lib/               # utilities, API client, constants
  stores/            # Zustand stores
  types/             # shared types
```

Adjust this to match the real layout. Keep feature code inside its feature folder.

## Code conventions

### TypeScript

- Strict mode. No `any`; use `unknown` and narrow, or write a proper type.
- Prefer `type` for unions and props, `interface` for extendable object shapes.
- Derive types from Zod schemas with `z.infer` instead of duplicating them.
- Use named exports. Default exports only where Next.js requires them (pages, layouts, route handlers).

### React / Next.js

- Server Components by default. Add `"use client"` only when you need state, effects, or browser APIs, and keep client components small and at the leaves.
- Function components and hooks only. One component per file, PascalCase file names.
- Do not fetch in `useEffect`; use server components or TanStack Query.
- Every route that loads data needs loading and error states.
- Use `next/image`, `next/link` and `next/font`.

### State and data

- Server state → TanStack Query (stable, typed query keys; keep them in one place per feature).
- Client/UI state → local state first, Zustand only when state is shared across distant components.
- Do not copy server data into Zustand.

### Forms

- React Hook Form + Zod resolver. Define the schema once, reuse it for types and validation.
- Show field-level errors; disable submit while pending.

### Styling

- Tailwind utility classes; no inline styles or new CSS files unless unavoidable.
- Use shadcn/ui components before building custom ones. Compose them rather than forking.
- Use `cn()` for conditional classes. Follow the existing design tokens (colors, spacing, radius) — do not hard-code hex values.
- Mobile-first, responsive.
- TODO: RTL / Persian support rules if applicable (use logical properties such as `ms-*`, `me-*`, `ps-*`, `pe-*` instead of left/right).

### Accessibility

- Semantic HTML, labelled inputs, visible focus states, keyboard-operable interactions.
- Meaningful `alt` text; sufficient color contrast.

### Naming

- Components: `PascalCase`. Hooks: `useThing`. Utilities/variables: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Files: `kebab-case` except component files (`PascalCase.tsx`).

## Testing

- Test behavior, not implementation. Use React Testing Library queries by role/label.
- New logic, hooks and non-trivial components get tests. Bug fixes get a regression test.
- Mock network at the boundary, not internal modules.

## Git and PRs

- Small, focused commits with clear messages (Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`).
- Do not commit secrets, `.env` files, or generated build output.
- Keep PRs scoped to one concern.

## Working rules for agents

- Read the surrounding code and match existing patterns before writing new code.
- Make the smallest change that solves the task; do not refactor unrelated code.
- Do not add dependencies without a clear reason; prefer what is already installed.
- Do not edit `components/ui/*`, lockfiles, or config files unless the task requires it.
- If requirements are ambiguous or a change is risky (data loss, auth, public API), ask before proceeding.
- When done, summarize what changed and anything left undone.

## Environment

- Environment variables live in `.env.local` (never committed). Document new variables in `.env.example`.
- TODO: required env vars and where to get them.
