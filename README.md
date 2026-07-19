# CrickClash

Real-time Pakistan cricket trivia platform. See `CLAUDE.md` for project context and `STRUCTURE.md` for file/folder conventions.

## Prerequisites

- Node.js 20+ (developed on v24)
- Docker Desktop (for Postgres)

## Setup

**1. Clone and install dependencies** (both apps have their own `package.json`):

```
git clone <repo-url>
cd CrickClash
cd apps/api && npm install
cd ../web && npm install
```

**2. Set up environment variables**

Create `apps/api/.env`:
```
DATABASE_URL="postgresql://crickclash:crickclash@localhost:5433/crickclash"
JWT_SECRET="any-random-string-for-local-dev"
```

Create `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**3. Start Postgres** (from the project root):

```
docker compose up -d
```

Confirm it's running: `docker ps` should show a `postgres` container on port `5433`.

> If port `5433` is already in use on your machine, change the port mapping in `docker-compose.yml` and update `DATABASE_URL` in `apps/api/.env` to match.

**4. Set up the database** (from `apps/api`):

```
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

**5. Run both apps** (in two separate terminals):

```
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

## URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 (Next.js falls back off 3000 since the API takes it) |
| Backend API | http://localhost:3000 |
| Prisma Studio (DB GUI) | `npx prisma studio` from `apps/api`, opens in browser |

## Useful commands

- `npx prisma studio` (from `apps/api`) — browse/edit the database directly
- `docker exec -it crickclash-postgres-1 psql -U crickclash -d crickclash` — raw SQL shell into Postgres
- After any Prisma schema change: `npx prisma migrate dev --name <description>` **then** `npx prisma generate` (see `CLAUDE.md` gotchas — these are two separate steps)
