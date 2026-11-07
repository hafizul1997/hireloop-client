<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HireLoop

Job/recruitment application built on Next.js 16 (App Router, `src/` directory) with TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), and MongoDB + Better Auth for authentication. Early stage — the app shell and auth stack are set up; most feature pages were not yet written at the time of writing.

## Commands

```bash
npm run dev     # Start dev server (Turbopack) at http://localhost:3000
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite or formatting script (no Prettier) configured yet.

## Tech stack

- **Next.js 16.4.5** — App Router only, `src/app/` structure. React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — do not add manual `memo`/`useCallback` optimizations unless profiling shows a need.
- **React 19.3** with `react-jsx` transform (no manual `import React`).
- **Tailwind CSS v4** via `@tailwindcss/turbopack` (CSS-first config in `src/app/globals.css`; no `tailwind.config` file). `tw-animate-css` available.
- **shadcn/ui via Base UI** (`@base-ui/react`, style `base-nova`) — components in `src/components/ui/`, added with `npx shadcn`. Icons: `lucide-react`. Class helper: `cn` from `@/lib/utils`.
- **Better Auth 1.7** with the MongoDB adapter (`@better-auth/mongo-adapter`, `mongodb` driver v7). Email/password + Google social provider.
- **TypeScript strict** mode, `@/*` path alias → `./src/*`.

## Key files

- `src/lib/auth.ts` — server-side Better Auth instance (MongoDB adapter, `db("hireloopdb")`).
- `src/lib/auth-client.ts` — client-side auth client (`better-auth/react`).
- `src/app/api/auth/[...all]/route.ts` — catch-all route handler mounting Better Auth (`toNextJsHandler`); exposes `/api/auth/*` (sign-in, sign-up, session, etc.).
- `src/app/globals.css` — Tailwind v4 + shadcn design tokens/CSS variables.
- `src/components/ui/*` — shadcn components (currently only `button.tsx`).
- `components.json` — shadcn config (`base-nova` style, `neutral` base color, lucide icons).

## Environment variables

`.env` (do not commit real secrets):

- `MONGODB_URI` — MongoDB connection string (required by `src/lib/auth.ts`).
- `BETTER_AUTH_SECRET` — auth signing secret.
- `BETTER_AUTH_URL` — auth base URL (e.g. `http://localhost:3000` in dev).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — referenced by `src/lib/auth.ts` but **not yet present in `.env`**; auth startup will fail with `undefined` values until they are added.

## Conventions

- App Router with the `src/` directory; route handlers live under `src/app/api/**/route.ts`.
- Classic `"use client"` boundaries are decided per file; prefer server components by default, client components only where hooks/interactivity are needed.
- Use `@/` alias for all internal imports.
- shadcn/ui primitives come from `@/components/ui/*`; don't hand-roll equivalents.
- Fonts: Geist + Geist Mono loaded via `next/font/google` in `src/app/layout.tsx` — reuse the `--font-geist-sans`/`--font-geist-mono` CSS variables (`font-sans`, `font-mono`).
- Database access currently flows through the shared `MongoClient` in `src/lib/auth.ts`; when adding data access, create a shared client module rather than opening new clients per call.
