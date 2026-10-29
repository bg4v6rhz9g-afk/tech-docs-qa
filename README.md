# tech-docs-qa

Week-1 backend: a small Hono + PostgreSQL API for creating and reading technical documents. No RAG, auth, or update/delete yet.

## Design decisions

- **UUID primary keys** (`gen_random_uuid()`): document IDs can be referenced across services or imports later without sequence collisions or predictability; the DB mints them.
- **Drizzle + SQL migrations**: strong TypeScript inference and reviewable SQL; stays close to Postgres so we can add embedding/vector columns later without fighting an opaque ORM.
- **`limit` / `offset` pagination**: list returns `{ items, limit, offset }` only (no `total`) to avoid an extra `COUNT(*)` on every list request. Default `limit=20`, max `100`, `offset` defaults to `0`. List order is `created_at DESC` (newest first).
- **Unified errors**: every failure is `{ error: { code, message } }` with `VALIDATION_ERROR` | `NOT_FOUND` | `INTERNAL_ERROR`.

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io/)
- Docker (for Postgres)

## Setup

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Server listens on `http://localhost:3000` (override with `PORT`).

### Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start API with file watching |
| `pnpm start` | Start API once |
| `pnpm db:generate` | Generate SQL migrations from `src/db/schema.ts` (drizzle-kit) |
| `pnpm db:migrate` | Apply migrations in `./drizzle` |
| `pnpm typecheck` | `tsc --noEmit` |

## API

### Create document — `POST /documents`

```bash
curl -sS -X POST http://localhost:3000/documents \
  -H 'content-type: application/json' \
  -d '{
    "title": "Hono intro",
    "content": "Hono is a small web framework.",
    "source_url": "https://hono.dev/"
  }'
```

`source_url` may be omitted or `null`. When present it must be a valid URL.

Success: `201` + document JSON.

### Get by id — `GET /documents/:id`

```bash
curl -sS http://localhost:3000/documents/<uuid>
```

- `200` + document
- `404` → `{ "error": { "code": "NOT_FOUND", "message": "..." } }`
- invalid UUID → `400` `VALIDATION_ERROR`

### List — `GET /documents?limit=&offset=`

```bash
curl -sS 'http://localhost:3000/documents?limit=20&offset=0'
```

Success: `{ "items": [...], "limit": 20, "offset": 0 }` sorted by `created_at` descending.

### Error shape

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Project layout

```text
src/
  index.ts              # server entry
  env.ts                # env validation
  routes/documents.ts   # POST / GET list / GET :id
  db/                   # drizzle client, schema, migrate script
  schemas/documents.ts  # Zod body + query schemas
  middleware/error.ts   # unified error handler
drizzle/                # SQL migrations
```

## Out of scope (this week)

RAG / embeddings, PATCH/DELETE, auth, OpenAPI, test suites, CI.
