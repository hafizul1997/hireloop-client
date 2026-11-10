<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HireLoop

Job/recruitment application built on Next.js 16 (App Router, `src/` directory) with TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), and MongoDB + Better Auth for authentication. Early stage — the app shell, auth stack, and site navbar are set up; most feature pages were not yet written at the time of writing.

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
- **Tailwind CSS v4** via `@tailwindcss/turbopack` (CSS-first config in `src/app/globals.css`; no `tailwind.config` file). `tw-animate-css` available. The loader is also wired explicitly in `next.config.ts` under `turbopack.rules`.
- **shadcn/ui via Base UI** (`@base-ui/react`, style `base-nova`) — components in `src/components/ui/`, added with `npx shadcn`. Icons: `lucide-react`. Class helper: `cn` from `@/lib/utils`.
- **Better Auth 1.7** with the MongoDB adapter (`@better-auth/mongo-adapter`, `mongodb` driver v7). Email/password + Google social provider.
- **TypeScript strict** mode, `@/*` path alias → `./src/*`.

## Key files

- `src/lib/auth.ts` — server-side Better Auth instance (MongoDB adapter, `db("hireloopdb")`).
- `src/lib/auth-client.ts` — client-side auth helpers (`better-auth/react`), created as `createAuthClient<typeof auth>()` for type inference; exports `authClient` plus `signIn`/`signUp`/`signOut`/`useSession` from the single configured client (same-origin default).
- `src/app/api/auth/[...all]/route.ts` — catch-all route handler mounting Better Auth (`toNextJsHandler`); exposes `/api/auth/*` (sign-in, sign-up, session, etc.).
- `src/components/site-navbar.tsx` — `SiteNavbar` header (dark theme, branded Logo, links to `/jobs`, `/company`, `/pricing`, plus Sign In / Get Started CTAs). Server component, rendered in the root layout on every page.
- `src/app/globals.css` — Tailwind v4 + shadcn design tokens/CSS variables.
- `src/components/ui/*` — shadcn-style components (`button.tsx`, `input.tsx`, `sonner.tsx` toaster wrapper). `src/components/logo.tsx` holds the shared `Logo` (used by navbar + auth pages).
- `components.json` — shadcn config (`base-nova` style, `neutral` base color, lucide icons).

Routes referenced by the navbar (`/jobs`, `/company`, `/pricing`) do **not** exist yet — creating them is pending work. `/sign-in` and `/sign-up` exist (`src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`, rendering client forms from `src/components/auth/`): email/password auth, Google OAuth (which lands on `/auth/redirect` to resolve the session first), and a three-role picker on sign-up (employee/employer/admin, stored as `role` via Better Auth `user.additionalFields`, default `employee`). After auth, users are redirected by role via `getRoleHome` in `src/lib/role-redirect.ts`: employee → `/`, employer → `/employer`, admin → `/admin`. `/employer` and `/admin` are server components guarded by session role (redirect mismatches) with a shared `SignOutButton`; they are placeholders pending real dashboards. Errors/successes across auth flows use sonner toasts (`Toaster` from `src/components/ui/sonner.tsx`, mounted in the root layout). `src/app/page.tsx` renders `Hero` from `src/components/hero.tsx` (badge, headline, job search form linking to `/jobs`, popular-search tags, planet-glow backdrop, and a stats strip).

## Environment variables

`.env` (do not commit real secrets):

- `MONGODB_URI` — MongoDB connection string (required by `src/lib/auth.ts`).
- `BETTER_AUTH_SECRET` — auth signing secret.
- `BETTER_AUTH_URL` — auth base URL (e.g. `http://localhost:3000` in dev).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — referenced by `src/lib/auth.ts`; keys exist in `.env` but are empty until real Google OAuth credentials are added (Google sign-in fails at request time until then; email/password works regardless).

## Conventions

- App Router with the `src/` directory; route handlers live under `src/app/api/**/route.ts`.
- Classic `"use client"` boundaries are decided per file; prefer server components by default, client components only where hooks/interactivity are needed.
- Use `@/` alias for all internal imports.
- shadcn/ui primitives come from `@/components/ui/*`; don't hand-roll equivalents.
- Fonts: Geist + Geist Mono loaded via `next/font/google` in `src/app/layout.tsx` — reuse the `--font-geist-sans`/`--font-geist-mono` CSS variables (`font-sans`, `font-mono`).
- Database access currently flows through the shared `MongoClient` in `src/lib/auth.ts`; when adding data access, create a shared client module rather than opening new clients per call.
