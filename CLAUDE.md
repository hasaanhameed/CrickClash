# CrickClash

## What this is

A real-time Pakistan cricket trivia platform, built by Hasaan and a collaborator. Core modes: curated **Quiz Packs** (built) — now gaining a real-time 1v1 layer called **Quiz Pack Arena** (in progress, see Current state), and **Daily Challenge** solo async mode (built). **Quick Match** is a separate, differently-scoped 1v1 mode with its own undecided question suite — not yet designed, and explicitly distinct from Quiz Pack Arena.

## Who's building this

Hasaan (experienced with FastAPI, SQLAlchemy, React, Docker, PostgreSQL) plus a collaborator, both new to Node/NestJS/Next.js/Prisma. Neither has shipped in this stack before.

## How Claude should work here

- **Teaching mode stays on.** Both people on this project are still learning this stack — explain new concepts simply (one at a time, plain language) as they come up in code, relate them to FastAPI/SQLAlchemy/React equivalents with a one-line analogy where useful.
- **Balance of driving**: for genuinely new patterns/scaffolding, let the human type/run it so it sticks. For iterative work once a pattern is established (styling, repeated CRUD-shaped code, refinements), Claude can implement directly — this is how the frontend work actually went in practice, and it's fine to keep doing that.
- **Follow real industry conventions** — see below. "The way real teams do it" matters here, not just the fastest hack.

## Tech stack

- **Monorepo**: `apps/api` (NestJS) + `apps/web` (Next.js), no Nx/Turborepo — kept deliberately simple.
- **Backend**: NestJS, Prisma, PostgreSQL (Docker, host port **5433** — moved off 5432 due to a local conflict on Hasaan's machine, adjust `docker-compose.yml`/`.env` if a collaborator hits the same issue), JWT auth via Passport.
- **Frontend**: Next.js App Router, TypeScript, Tailwind v4 (CSS-first, no `tailwind.config.js` — see `@theme inline` in `globals.css`), React Context for global auth state.

**File/folder structure for both apps is fixed — see `STRUCTURE.md` at the project root before creating any new file.** Don't improvise a new convention; find the matching case there.

## Known gotchas (hit repeatedly during development)

- After any Prisma schema change: run **both** `npx prisma migrate dev --name x` **and** `npx prisma generate` separately — the client's types don't always pick up new models from `migrate` alone.
- Modals must render via a React Portal (`createPortal(..., document.body)`). Any ancestor with `clip-path` breaks `position: fixed` children otherwise (real bug hit with the quiz pack detail modal).
- Native `<button>` elements don't get `cursor: pointer` by default (only `<a>` does) — needs adding explicitly on every custom button.
- Avoid animating `transform: scale()` combined with `overflow: hidden` + `border-radius` on hover — causes visible rendering seams in Chromium. Prefer `box-shadow`/`border-color` transitions for card hover effects.
- Always strip sensitive fields (`password`, `correctAnswer`) before returning data to the client.
- Each app's `.env` is gitignored and never committed — a fresh machine/clone needs its own `apps/api/.env` (`DATABASE_URL`, `JWT_SECRET`), `apps/api/.env.test` (same, pointed at the test database), and `apps/web/.env` (`NEXT_PUBLIC_API_URL`). Missing them shows up as confusing failures (Prisma commands erroring, or the frontend throwing `Invalid URL` from axios) rather than an obvious "file not found."
- A fresh/empty dev database needs `npx prisma db seed` run manually — quiz packs don't appear otherwise.
- `npm install`-ing a new package can silently rewrite or downgrade an unrelated already-pinned dependency version (happened to `prisma` when Socket.io was installed) — check `git diff package.json` after any install, not just the packages you meant to add.
- Socket.io gateways need their own `cors` option (`@WebSocketGateway({ cors: {...} })`) — the HTTP-level `app.enableCors()` in `main.ts` doesn't cover WebSocket handshakes.
- Reject an unauthenticated socket via a Socket.io middleware (`server.use(...)` inside `afterInit`), not by calling `client.disconnect()` inside `handleConnection` — the latter still lets the client's `connect` event fire first, so it briefly appears connected before being kicked.
- `prisma migrate deploy` (not `migrate dev`) is the right command for any non-dev database (test db, CI) — it only applies existing migrations and never prompts or generates new ones.

## Current state

- **Auth**: register/login/JWT/guards on the backend, fully wired on the frontend (`AuthContext`, modals, persisted session, profile chip in nav). `/auth/me` fetches the live user row (not just the JWT payload), so it can return real fields like `streak`.
- **QuizPack + Question models**: built, with a small **starter seed** of cricket trivia (2 questions/pack) — facts are not yet verified against a real source (e.g. ESPNcricinfo) and need real research before this is production content.
- **Homepage**: hero, game mode tiles, quiz pack cards → clicking a pack opens `PackDetailModal` (portal-based, blurred backdrop, fetches full detail client-side).
- **Daily Challenge (solo async mode)**: built end-to-end. Backend: `DailyChallenge` (date + a date-seeded deterministic shuffle of 5 question IDs from the shared `Question` pool, generated lazily on first request per day) + `DailyChallengeAttempt` (one per user per day, enforced by a DB unique constraint) models; `GET /daily-challenge/today` and `POST /daily-challenge/submit`, both behind `JwtAuthGuard`. Frontend: `/play/daily` — rules screen → one-question-at-a-time quiz → results, styled with a shared gold/glow "quiz component" look (`quiz-background.png` header band on each card). Real `streak` field added to `User`, updated on submit, shown in the profile menu.
- **Scoring**: Daily Challenge uses flat difficulty-based points (Easy 10 / Medium 20 / Hard 30, wrong = 0) — implemented and live. Quiz Pack Arena (below) reuses the same base-points table but scales it by answer speed; that scaling is not something Daily Challenge itself does.
- **Quiz Pack Arena** (real-time 1v1 multiplayer over existing Quiz Packs — tracked as issue #6, broken into vertical-slice tickets): in progress.
  - Done — **foundations** (#7): `QuizPackMatch` Prisma model (`status` one of `IN_PROGRESS`/`COMPLETED`/`FORFEITED`/`ABANDONED`, `winnerId` nullable), a `quiz-pack-match` NestJS module with a Socket.io gateway, JWT-authenticated WS handshake (own token extraction from `socket.handshake.auth.token`, since the HTTP `JwtAuthGuard` doesn't apply to sockets).
  - Done — **test infrastructure** (#8), the repo's first real test setup: a disposable test Postgres database (`postgres-test` container, port 5434) used via a real `PrismaService` (not mocked), per-test cleanup via `TRUNCATE ... CASCADE`, and an injectable `ClockService` + Jest fake-timers pattern so timer-driven logic can be tested without sleeping in real time. Proven by rewriting `daily-challenge.service.spec.ts` from a stub into real tests.
  - Next — **#9** (queue/matchmaking: the "Enter the Arena" button, a searching page, FIFO pairing, 2-minute timeout), then **#10** (live question play, speed-scaled scoring, match persistence), then **#11** (disconnect/reconnect/forfeit/abandonment handling).

## Not built yet

- Quiz Pack Arena's remaining pieces (queue/matchmaking UI, live gameplay, disconnect handling) — see Current state above for exact ticket breakdown. The "Enter the Arena" button in the pack detail modal is still a styled no-op until #9 lands.
- Quick Match — a wholly separate 1v1 mode, still undesigned (its own question suite is undecided), explicitly out of scope for Quiz Pack Arena.
- Real, verified question content beyond the starter seed.
- Deployment.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `hasaanhameed/CrickClash`, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
