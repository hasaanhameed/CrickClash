# CrickClash

## What this is

A real-time Pakistan cricket trivia platform, built by Hasaan and a collaborator. Core modes: curated **Quiz Packs** (built), **Quick Match** 1v1 real-time battles (not built yet), **Daily Challenge** solo async mode (not built yet).

## Who's building this

Hasaan (experienced with FastAPI, SQLAlchemy, React, Docker, PostgreSQL) plus a collaborator, both new to Node/NestJS/Next.js/Prisma. Neither has shipped in this stack before.

## How Claude should work here

- **Teaching mode stays on.** Both people on this project are still learning this stack — explain new concepts simply (one at a time, plain language) as they come up in code, relate them to FastAPI/SQLAlchemy/React equivalents with a one-line analogy where useful.
- **Balance of driving**: for genuinely new patterns/scaffolding, let the human type/run it so it sticks. For iterative work once a pattern is established (styling, repeated CRUD-shaped code, refinements), Claude can implement directly — this is how the frontend work actually went in practice, and it's fine to keep doing that.
- **Follow real industry conventions** — see below. "The way real teams do it" matters here, not just the fastest hack.

## Tech stack & architecture

- **Monorepo**: `apps/api` (NestJS) + `apps/web` (Next.js), no Nx/Turborepo — kept deliberately simple.
- **Backend**: NestJS, Prisma (multi-file schema under `prisma/schema/`, one file per domain), PostgreSQL (Docker, host port **5433** — moved off 5432 due to a local conflict on Hasaan's machine, adjust `docker-compose.yml`/`.env` if a collaborator hits the same issue), JWT auth via Passport.
- **Frontend**: Next.js App Router, TypeScript, Tailwind v4 (CSS-first, no `tailwind.config.js` — see `@theme inline` in `globals.css`), React Context for global auth state.
- **Folder conventions**:
  - Backend: one folder per feature (`auth/`, `quiz-packs/`) with `module`/`controller`/`service`, plus `dto/`, `strategies/`, `guards/`, `decorators/` subfolders once a feature needs more than one of that type.
  - Frontend: `components/` (grouped into feature subfolders once >1 related file), `services/` (API calls), `lib/` (shared config like the axios instance), `types/`, `contexts/`, `hooks/`.

## Known gotchas (hit repeatedly during development)

- After any Prisma schema change: run **both** `npx prisma migrate dev --name x` **and** `npx prisma generate` separately — the client's types don't always pick up new models from `migrate` alone.
- Modals must render via a React Portal (`createPortal(..., document.body)`). Any ancestor with `clip-path` breaks `position: fixed` children otherwise (real bug hit with the quiz pack detail modal).
- Native `<button>` elements don't get `cursor: pointer` by default (only `<a>` does) — needs adding explicitly on every custom button.
- Avoid animating `transform: scale()` combined with `overflow: hidden` + `border-radius` on hover — causes visible rendering seams in Chromium. Prefer `box-shadow`/`border-color` transitions for card hover effects.
- Always strip sensitive fields (`password`, `correctAnswer`) before returning data to the client.

## Current state

- **Auth**: register/login/JWT/guards on the backend, fully wired on the frontend (`AuthContext`, modals, persisted session, profile chip in nav).
- **QuizPack + Question models**: built, with a small **starter seed** of cricket trivia (2 questions/pack) — facts are not yet verified against a real source (e.g. ESPNcricinfo) and need real research before this is production content.
- **Homepage**: hero, game mode tiles, quiz pack cards → clicking a pack opens `PackDetailModal` (portal-based, blurred backdrop, fetches full detail client-side).
- **Scoring system (designed, not yet implemented in gameplay logic)**: base points by difficulty (Easy 10 / Medium 20 / Hard 30), 30-second timer per question, correct answers scale from 50%–100% of base value depending on answer speed, wrong answers = 0.

## Not built yet

- Quick Match real-time gameplay (NestJS Gateway + Socket.io, matchmaking, live scoring) — this is the core real-time feature and the biggest remaining piece.
- Daily Challenge.
- The "Enter the Arena" button in the pack detail modal is currently a styled no-op — not wired to real gameplay yet.
- Real, verified question content beyond the starter seed.
- Deployment.
