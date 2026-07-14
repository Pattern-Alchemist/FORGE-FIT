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
4. `bun run db:seed` to repopulate (auto-generates the JSON fixture if missing)

No code changes needed — all queries use Prisma's typed client.

## Production checklist

- [x] Real Prisma schema (12 entities including User/auth, relations, indexes)
- [x] Split persistence: Zustand for UI, React Query + server actions for data
- [x] URL-addressable navigation (deep-linkable, refresh-safe)
- [x] Zod validation shared between client and server
- [x] Server actions for all mutations (with `revalidatePath`)
- [x] Refactored large screen files into feature subcomponents
- [x] Loading + empty states on every data-driven screen
- [x] Light + dark mode
- [x] Mobile-first responsive (bottom nav, 44px tap targets)
- [x] NextAuth integration (credentials provider, JWT sessions, role-based access)
- [x] Role boundaries (coach console vs client mobile app)
- [x] Client mobile app (4 screens: Home, Workout logger, Check-in, Messages)
- [x] Real-time messaging (Socket.io mini-service)
- [x] ⌘K command palette search
- [x] File uploads (progress photos)
- [x] Password reset flow
- [x] Client self-signup
- [x] Email service (Resend with dev fallback)
- [x] Rate limiting on auth + upload endpoints
- [x] Unit tests (77 Vitest tests)
- [x] E2E tests (Playwright suites)
- [x] CI/CD pipeline (GitHub Actions)

## Auth

NextAuth credentials provider with bcrypt-hashed passwords. Two roles:

- **Coach** (`role: 'coach'`) → sees the coach dashboard (all clients, workouts, check-ins, messages)
- **Client** (`role: 'client'`) → sees the client mobile app (own workouts, check-ins, messages)

### Demo accounts

| Role   | Email                      | Password    |
| ------ | -------------------------- | ----------- |
| Coach  | `marcus@forge.coach`       | `forge123`  |
| Client | `elena@client.forge.coach` | `client123` |
| Client | `daichi@client.forge.coach` | `client123` |
| Client | `priya@client.forge.coach` | `client123` |

The login screen has quick-fill buttons for both roles.

### Env vars

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

## Client mobile app

A separate consumer-facing experience at the same `/` route — role detected from session. 4 screens:

1. **Home** — today's workout card with big Start button, streak/adherence/unread stats, quick actions
2. **Workout** — set-by-set logger with rest timer, progress bar, complete button (fires `logWorkoutCompletionAction` → creates habit log + activity event for the coach)
3. **Check-in** — under 5 min: weight + waist inputs, energy/sleep/mood sliders, notes, photo placeholder. Pre-fills from last check-in.
4. **Messages** — simplified chat with coach. Auto-marks coach messages as read on open.

Max-width 480px, bottom nav, 44px tap targets, one primary CTA per screen.

## What's still prototype-grade

- ~~Real-time messaging~~ → ✅ Socket.io mini-service (port 3003 + broadcast on 3004)
- ~~⌘K search~~ → ✅ Command palette with /api/search (clients, templates, exercises)
- ~~File uploads~~ → ✅ /api/upload route + wired into check-in photos (local storage; swap to S3/R2 for prod)
- ~~Password reset~~ → ✅ forgot-password + reset-password endpoints + 4-mode auth screen
- ~~Client self-signup~~ → ✅ /api/auth/signup creates Client + User records
- ~~Email service~~ → ✅ Resend integration with HTML templates (dev: console fallback)
- ~~Rate limiting~~ → ✅ In-memory limiter on auth + upload endpoints (429 with Retry-After)
- ~~Unit tests~~ → ✅ 77 Vitest tests (schemas, store, rate-limit, email, upload)
- ~~E2E tests~~ → ✅ Playwright suites (auth, coach flows, client mobile)
- ~~CI/CD~~ → ✅ GitHub Actions (lint, tsc, unit tests, build, E2E)

### Email service

Resend integration in `src/lib/email/`:
- `sendEmail()` — sends via Resend if `RESEND_API_KEY` is set, otherwise logs to console
- HTML + text templates for password reset and welcome emails
- forgot-password endpoint sends real email with reset link
- signup endpoint sends welcome email to new clients

Env vars (both optional in dev):
```
RESEND_API_KEY=re_xxx
FROM_EMAIL=forge@yourdomain.com
```

### Rate limiting

In-memory sliding-window rate limiter in `src/lib/rate-limit.ts`:
- `rateLimit(identifier, { windowMs, max })` → returns `{ success, limit, remaining, resetTime }`
- `getClientIP(request)` → extracts IP from headers
- `setRateLimitHeaders(res, result)` → adds `X-RateLimit-*` headers

Applied to:
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/forgot-password` | 5 | per hour |
| `/api/auth/reset-password` | 10 | per hour |
| `/api/auth/signup` | 5 | per hour |
| `/api/upload` | 30 | per hour |

Returns `429 Too Many Requests` with `Retry-After` header when exceeded.

Production: swap for Upstash Redis rate limiter for distributed limiting.

### Testing

```bash
# Unit tests (Vitest)
bun run test              # run once
bun run test:watch        # watch mode
bun run test:coverage     # with coverage report

# E2E tests (Playwright)
npx playwright test       # runs all e2e suites
npx playwright test --ui  # interactive UI mode
```

**Unit tests** (77 passing):
- `schemas.test.ts` — Zod validation for all entity types (40 tests)
- `store.test.ts` — Zustand UI store: navigation, builder, filters (19 tests)
- `rate-limit.test.ts` — rate limiter logic (7 tests)
- `email.test.ts` — email template generation (8 tests)
- `upload.test.ts` — uploadFile helper (3 tests)

**E2E tests** (Playwright):
- `auth.spec.ts` — login, signup, forgot-password, demo accounts, invalid creds, role redirect
- `coach.spec.ts` — dashboard KPIs, sidebar nav, ⌘K palette, clients list (search/filter), client detail tabs, workout builder, dark mode
- `client.spec.ts` — client mobile app (home, workout logger, check-in form, messages, sign out)

### CI/CD

GitHub Actions workflows in `.github/workflows/`:

**`ci.yml`** (runs on push + PR to main):
1. Lint & Type Check — `bun run lint` + `npx tsc --noEmit`
2. Unit Tests — `bun run test` with coverage upload
3. Build — `bun run build` (depends on 1 + 2 passing)

**`e2e.yml`** (runs on push + PR to main):
1. Setup DB (push schema + seed)
2. Install Playwright chromium
3. Run E2E tests with seeded DB
4. Upload playwright report as artifact

Both workflows use `oven-sh/setup-bun` and cache dependencies.

Socket.io mini-service in `mini-services/chat-service/`:
- Port 3003: Socket.io server (clients connect via `io('/?XTransformPort=3003')`)
- Port 3004: HTTP broadcast endpoint (server actions POST here after persisting messages)
- Rooms: `conv:{clientId}` for each coach-client conversation
- Events: `new-message`, `typing`
- Both coach and client chat screens invalidate React Query on new-message → instant refresh

Start the chat service: `cd mini-services/chat-service && bun run dev`

### ⌘K Command Palette

Press `⌘K` (or `Ctrl+K`) anywhere in the coach app to open the search palette. Searches:
- Clients (by name, goal, training phase)
- Workout templates (by title, category)
- Exercise library (by name, muscle group, equipment)

Clicking a result navigates directly to the client detail or workout builder.

### File uploads

`POST /api/upload` with multipart form data → saves to `public/uploads/` → returns `{ url, filename, size, type }`.
- Max 10MB
- JPEG, PNG, WebP, GIF
- Wired into client check-in form (progress photos with thumbnail preview + remove)
- Swap to S3/R2: change the route to stream to cloud storage instead of local disk

### Password reset

1. `POST /api/auth/forgot-password` with `{ email }` → generates reset token, stores in DB, logs reset URL
2. User clicks reset link: `/?reset=TOKEN` → login screen switches to reset mode
3. `POST /api/auth/reset-password` with `{ token, password }` → validates token + expiry, updates password

In dev, the forgot-password response includes `_devResetUrl` so you can test without email. In prod, wire to Resend/SMTP.

### Client self-signup

`POST /api/auth/signup` with `{ email, password, fullName, age, goal }`:
1. Validates input (password ≥ 8 chars, age 13-120)
2. Checks email uniqueness
3. Creates `Client` record (assigned to seeded coach, Foundation phase, "New" tag)
4. Creates `User` record (role: client, linked to the new client)
5. Returns `{ ok: true, clientId }`

The login screen has a "Sign up as client" link that switches to signup mode.
