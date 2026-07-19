# CrickClash — Project Structure

Fixed reference for where files go. When creating something new, find the matching case below instead of improvising a new convention.

## Backend (`apps/api/src/`)

One folder per feature. For a new feature `foo`:

```
src/foo/
  foo.module.ts
  foo.controller.ts
  foo.service.ts
  dto/                    only if foo has request/response bodies to validate
    create-foo.dto.ts
  strategies/             only if foo needs a Passport strategy
  guards/                 only if foo needs a custom guard
  decorators/             only if foo needs a custom param decorator
```

Rules:
- Scaffold via Nest CLI (`npx nest generate module/controller/service <name>`) — never hand-create these files.
- Naming: kebab-case + type suffix (`foo.module.ts`, `create-foo.dto.ts`).
- Subfolders (`dto/`, `strategies/`, `guards/`, `decorators/`) only get created once a feature actually has more than one file of that kind — don't pre-create empty ones.
- Shared/global pieces (e.g. `PrismaService`) live in their own top-level module (`src/prisma/`), imported by any feature module that needs them.
- `src/app.module.ts` / `src/main.ts` are app wiring only — no feature logic there.

## Prisma schema (`apps/api/prisma/schema/`)

- One `.prisma` file per domain model, named after it in kebab-case: `user.prisma`, `question.prisma`, `quiz-pack.prisma`.
- `schema/schema.prisma` holds only the `generator` and `datasource` blocks — never add models to it.
- `prisma/migrations/` is auto-generated — never hand-edited.
- `prisma/seed.ts` is the single seed entrypoint, registered via `migrations.seed` in `prisma.config.ts`.

## Frontend (`apps/web/`)

```
app/                      Next.js App Router only — page.tsx, layout.tsx, route folders. No components living directly here.
components/
  <feature>/              feature-specific components, once that feature has more than one
  <Generic>.tsx           shared/generic components (not tied to one feature) stay flat here
contexts/                 React Context providers (global client state)
services/                 one file per API domain — functions that call the backend
types/                    one file per API domain — TS interfaces matching backend response shapes
lib/                      shared non-React config/utilities (the axios instance, static data maps)
hooks/                    custom React hooks (reusable client-side stateful logic)
public/images/            static image assets
```

Rules:
- A component moves into `components/<feature>/` once there's more than one file for that feature (e.g. `components/auth/`, `components/quiz/`). A single generic component with no feature ties stays flat at `components/`.
- Every new API domain gets exactly one `types/<domain>.ts` and one `services/<domain>.service.ts`. Never inline a fetch/axios call directly in a component — always go through a service function.
- `'use client'` goes on the smallest component that actually needs interactivity (state, handlers) — never on a whole page just because one child needs it.
- Server Components (the default — no `'use client'`) fetch data by calling `await someService.someFunction()` directly in the component body. No `useEffect`/`useState` for this case — that's only for Client Components reacting to user interaction.
