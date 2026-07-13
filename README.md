# Forge — Coaching OS

A premium, mobile-first MVP for solo fitness coaches managing 15–20 clients. Built as a real product, not a demo: Prisma-backed data model, server actions for mutations, React Query for cache, URL-addressable navigation, and Zod validation shared across client and server.

## Stack

| Layer            | Tech                                                            |
| ---------------- | --------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router, Turbopack)                              |
| Language         | TypeScript 5                                                    |
| Styling          | Tailwind CSS 4 + shadcn/ui (New York)                           |
| Database         | Prisma ORM + SQLite (sandbox) — portable to Postgres            |
| Server state     | React Query (`@tanstack/react-query`)                           |
| UI state         | Zustand (UI-only: nav, builder draft, filters)                  |
| Validation       | Zod (shared schemas)                                            |
| Drag-and-drop    | @dnd-kit                                                        |
| Charts           | Recharts                                                        |
| Animation        | Framer Motion                                                   |
| Theme            | next-themes (light / dark / system)                             |

## Architecture

```
src/
├── app/
│   ├── api/                    # Route handlers (read endpoints)
│   │   ├── coach/              # GET /api/coach
│   │   ├── clients/            # GET /api/clients (?id=)
│   │   ├── program/            # GET /api/program?clientId=
│   │   ├── templates/          # GET /api/templates (?id=)
│   │   ├── exercises/          # GET /api/exercises
│   │   ├── check-ins/          # GET /api/check-ins?clientId=
│   │   ├── messages/           # GET /api/messages?clientId=
│   │   ├── saved-replies/      # GET /api/saved-replies
│   │   ├── tasks/              # GET /api/tasks
│   │   ├── activity/           # GET /api/activity
│   │   └── stats/              # GET /api/stats (aggregated KPIs)
│   ├── layout.tsx              # Root layout (ThemeProvider + QueryProvider)
│   ├── page.tsx                # Single-route shell (screen switcher)
│   └── globals.css             # Design tokens (OKLCH), light + dark
│
├── components/
│   ├── app-shell.tsx           # Sidebar + top bar + mobile bottom nav
│   ├── providers/
│   │   └── query-provider.tsx  # React Query client
│   ├── shared.tsx              # StatusTag, GoalTag, AdherenceRing, KPI cards
│   ├── theme-provider.tsx      # next-themes wrapper
│   ├── client-detail/          # Subcomponents for the detail screen
│   │   ├── overview-tab.tsx
│   │   ├── workouts-tab.tsx
│   │   ├── checkins-tab.tsx
│   │   ├── progress-tab.tsx
│   │   ├── notes-tab.tsx
│   │   └── chat-tab.tsx
│   ├── workout-builder/        # Subcomponents for the builder screen
│   │   ├── exercise-library.tsx
│   │   ├── sortable-block.tsx
│   │   ├── exercise-editor.tsx
│   │   ├── assign-dialog.tsx
│   │   └── constants.ts
│   └── screens/                # Top-level screens
│       ├── dashboard.tsx
│       ├── clients.tsx
│       ├── client-detail.tsx   # Orchestrator only (~170 lines)
│       ├── workout-builder.tsx # Orchestrator only (~200 lines)
│       ├── check-ins.tsx
│       ├── messages.tsx
│       └── settings.tsx
│
└── lib/
    ├── actions/                # 'use server' — mutations
    ├── api-client.ts           # fetch() wrappers for /api/*
    ├── db.ts                   # Prisma client singleton
    ├── hooks/                  # React Query hooks (useClients, useClient, …)
    ├── queries/                # Server-side read functions (Prisma → types)
    ├── schemas/                # Zod schemas (shared client + server)
    ├── store.ts                # Zustand UI-only store
    ├── types.ts                # UI-facing domain types
    └── url-state.ts            # URL ↔ store sync (deep-linkable)
```

### Data flow

```
Browser ──(React Query)──▶ /api/* ──▶ Prisma ──▶ SQLite
   │
   └──(mutations)──▶ Server Actions ──▶ Prisma ──▶ revalidatePath
                                                          │
                                              React Query invalidates ──▶ refetch
```

**Reads**: React Query hooks (`useClients`, `useClient(id)`, `useCheckIns(id)`, …) call `fetch('/api/…')`, which hits route handlers that call Prisma.

**Writes**: Mutations (`useSendMessage`, `useToggleTask`, `useSaveWorkoutTemplate`, …) call server actions (`'use server'` functions in `src/lib/actions/`). Each action validates input with Zod, mutates via Prisma, calls `revalidatePath('/')`, and returns an `ActionResult<T>`. The mutation's `onSuccess` invalidates the relevant React Query keys.

**Navigation**: UI state (selected screen, client, tab, conversation) lives in a Zustand store that self-hydrates from URL search params on first render. `?screen=client-detail&client=cl2&tab=progress` deep-links directly to Daichi's Progress tab.

## Database schema

11 entities with proper relations, indexes, and cascade rules:

- `Coach` (1) ─┬─ `Client` (many)
- `Coach` (1) ─┼─ `WorkoutTemplate` (many) ─┬─ `WorkoutBlock` (many) ─┬─ `Exercise` (many)
- `Coach` (1) ─┼─ `SavedReply` (many)
- `Coach` (1) ─┼─ `Task` (many) ─── `Client` (many)
- `Coach` (1) ─┴─ `ActivityEvent` (many) ─── `Client` (many)
- `Client` (1) ── `Program` (many) ──┐
- `Client` (1) ── `CheckIn` (many)   ├── `WorkoutTemplateAssignment` (many-to-many)
- `Client` (1) ── `Message` (many)   │   between `Program` and `WorkoutTemplate`
- `Client` (1) ── `HabitLog` (many)  ┘
- `ExerciseLibrary` (per coach) — canonical exercise list, separate from per-block `Exercise` rows

See `prisma/schema.prisma` for the full schema.

## Getting started

```bash
# 1. Install deps
bun install

# 2. Copy env
cp .env.example .env

# 3. Apply schema to DB
bun run db:push

# 4. Seed demo data (1 coach, 12 clients, 6 templates, ~91 check-ins, …)
bun run db:seed

# 5. Start dev server
bun run dev
```

Open http://localhost:3000 — you'll land on the dashboard with all KPIs populated from the DB.

## Scripts

| Script                | What it does                                            |
| --------------------- | ------------------------------------------------------- |
| `bun run dev`         | Next.js dev server on port 3000                         |
| `bun run lint`        | ESLint                                                  |
| `bun run db:push`     | Apply Prisma schema to DB                               |
| `bun run db:generate` | Regenerate Prisma Client                                |
| `bun run db:seed`     | Seed demo data (idempotent via upserts)                 |
| `bun run db:reset`    | Drop and recreate DB (uses Prisma migrate)              |

## Migrating to Postgres

1. Change `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma`
2. Set `DATABASE_URL=postgresql://…` in `.env`
3. `bun run db:push` (or `bun run db:migrate dev --name init_postgres`)
4. `bun run db:seed` to repopulate

No code changes needed — all queries use Prisma's typed client.

## Production checklist

- [x] Real Prisma schema (11 entities, relations, indexes)
- [x] Split persistence: Zustand for UI, React Query + server actions for data
- [x] URL-addressable navigation (deep-linkable, refresh-safe)
- [x] Zod validation shared between client and server
- [x] Server actions for all mutations (with `revalidatePath`)
- [x] Refactored large screen files into feature subcomponents
- [x] Loading + empty states on every data-driven screen
- [x] Light + dark mode
- [x] Mobile-first responsive (bottom nav, 44px tap targets)
- [ ] NextAuth integration (deps installed, not wired)
- [ ] Role boundaries (coach vs client views)
- [ ] Rate limiting on API routes
- [ ] Unit tests for store logic and selectors
- [ ] E2E tests for main user paths
- [ ] CI/CD pipeline

## What's still prototype-grade

- **Auth**: `COACH_ID = 'c1'` is hardcoded in `src/lib/queries/index.ts` and `src/lib/actions/index.ts`. Replace with `next-auth` session user id.
- **Client mobile view**: The current app is the coach console. A separate client-facing mobile flow (today's workout → mark complete → check-in → message) is the next big build.
- **Search**: The top-bar `⌘K` search input is visual only — wire it to a `/api/search` endpoint.
- **Real-time**: Messages are poll-based via React Query refetch. For true real-time, add Socket.io (deps installed, see `examples/websocket/`).
- **File uploads**: Progress photos and message attachments are placeholders. Wire to S3/Cloudflare R2.
