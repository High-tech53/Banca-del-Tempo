# Banca del Tempo — Full Stack MVP 

A community mutual-aid platform where neighbors offer time and skills for free — no money, no algorithms, just real people nearby.

This repository contains a **working MVP** with a complete **admin panel**:

- **Backend** (`/backend`) — Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend** (`/frontend`) — React + Vite + TypeScript + Tailwind + TanStack Query
- **Admin panel** — 10 pages for moderation, user management, and analytics
- **Database** — Docker Compose with PostgreSQL 16

> ⚠️ **This is an MVP, not the finished product.** It covers the core flows (browse → sign up → create offer → moderate → approve) and provides the schema, auth, and infrastructure to grow from. See **What's not built yet** below.

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 20 LTS or later | Runs both backend and frontend |
| **npm** | 10+ | Comes with Node |
| **Docker Desktop** | Latest | Runs the PostgreSQL container (no need to install PostgreSQL on your PC) |
| **Git** | Any | Source control |
| **VS Code** | Latest | Recommended editor |

Check versions:
```bash
node -v
npm -v
docker --version
```

---

## First-time setup (run once)

Open a terminal in the project root (`Banca del Tempo/`) and run:

```bash
# 1. Start the database (Docker Desktop must be open first)
docker compose up -d

# 2. Install backend dependencies
cd backend
npm install

# 3. Verify backend/.env exists (it ships with working dev defaults)
#    If missing: cp .env.example .env

# 4. Create the database schema
npx prisma migrate dev --name init

# 5. Fill the database with demo data
npm run db:seed

# 6. Install frontend dependencies
cd ../frontend
npm install
```

Setup done. The database now contains 3 demo users, 3 sample offers, 2 sample requests, and 1 sample flag — enough to test every screen including the admin panel.

---

## Running the app

You need **two terminal windows** open at the same time.

**Terminal 1 — Backend (port 4000):**
```bash
cd backend
npm run dev
```
Expected output: `🚀 Banca del Tempo API listening on http://localhost:4000`

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```
Expected output: Vite ready at `http://localhost:5173`

Open **http://localhost:5173** in your browser. 🎉

---

## Demo accounts

All accounts use the password **`demo1234`**:

| Email | Role | What to test with it |
|---|---|---|
| `marco@vicini.it` | USER (offerer) | Has 2 published offers + 1 pending review |
| `sofia@vicini.it` | USER (requester) | Has 2 requests (1 pending review) |
| `giulia@vicini.it` | **MODERATOR** | **Sees the "Admin" link in the header → full admin panel** |

---

## The Admin Panel

Log in as **giulia@vicini.it** and click **Admin** in the header. Only users with role `MODERATOR` or `ADMIN` can see the link or access the routes — both in the UI (route guard) and in the API (middleware). Regular users get redirected/403.

### The 10 admin pages

| Page | Route | What it does |
|---|---|---|
| **Dashboard** | `/admin` | Live KPIs (pending review, active matches, approved today, open flags), 30-day submission chart, quick-action links |
| **Offerte** | `/admin/offerte` | All offers filtered by status. Approve ✓ / Reject ✗ buttons on pending items |
| **Richieste** | `/admin/richieste` | All requests with urgency badges. Approve/reject |
| **Match** | `/admin/match` | All matches with affinity score and both parties |
| **Utenti** | `/admin/utenti` | User list with search, verification status, flag counts. Suspend/restore accounts |
| **Moderazione** | `/admin/moderazione` | Combined queue of pending offers + requests. Two-pane review: click an item, read it, add an internal note, approve or reject |
| **Segnalazioni** | `/admin/segnalazioni` | User reports with severity. Resolve or dismiss |
| **Categorie** | `/admin/categorie` | Create new categories, activate/deactivate existing ones |
| **Analytics** | `/admin/analytics` | Supply vs demand per category, offer status breakdown, weekly user growth |
| **Log attività** | `/admin/log` | Audit trail — every admin action is recorded automatically with actor, action, and timestamp |

### Suggested test flow

1. Log in as giulia → **Admin** → **Moderazione**
2. You'll see Marco's pending offer and Sofia's pending request
3. Click one → read the content → type an internal note → **Approva**
4. Check **Log attività** — your action is recorded
5. Open a new private/incognito window, visit `/esplora` — the approved offer is now public
6. Go to **Categorie** → add a new category → log out, log in as marco → **Crea** → your new category appears in the dropdown

### Sidebar badges

The numbers on **Offerte**, **Richieste**, and **Moderazione** in the sidebar are live counts of pending items, refreshed every 60 seconds and immediately after any approve/reject action.

---

## What works in this MVP

**User side:**
- ✅ Registration (role: offerer / requester / both) + Code of Care acceptance
- ✅ Login with JWT (15-min access token) + refresh token (httpOnly cookie, 30 days), auto-refresh
- ✅ Browse offers with category filter + text search
- ✅ Offer detail page with owner profile sidebar
- ✅ Create offer (category, days, time window, zone)
- ✅ "My offers" list with status badges
- ✅ Profile page, personal dashboard

**Admin side:**
- ✅ Role-protected admin area (API middleware + frontend route guard)
- ✅ All 10 pages listed above, wired to real data
- ✅ Offer/request approval workflow
- ✅ User suspension
- ✅ Flag resolution
- ✅ Category management
- ✅ Automatic audit logging of every admin action
- ✅ Live analytics from real DB aggregates

---

## What's NOT built yet (deliberate scope cut)

These have **schema support** but no UI/logic yet:

- ❌ **Apply-to-help flow** — the "Chiedi aiuto" button on offer pages doesn't yet create a `Match`. This is the recommended next feature: it's what makes matches (and then chat) exist
- ❌ **Real-time chat** — `Conversation`/`Message` tables exist, no Socket.IO yet
- ❌ **Automatic match engine** — matches can be listed in admin, but no scoring job creates them
- ❌ **Email sending** — registration works but sends no verification email
- ❌ **File uploads** (profile photos) — schema field exists, no S3 wiring
- ❌ **Endorsements** after match completion — schema only
- ❌ **In-app notifications** — schema only
- ❌ **Map view / PostGIS proximity search** — lat/lng columns exist, no geo queries yet
- ❌ **User-facing flag submission** — admins can manage flags; the "report" button for users isn't wired

---

## Project layout

```
Banca del Tempo/
├── docker-compose.yml            # PostgreSQL container config
├── README.md                     # This file
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      # Local secrets (never commit)
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma         # Full DB schema (13 tables)
│   │   └── seed.ts               # Demo users, offers, requests, flag
│   └── src/
│       ├── index.ts              # Express entry
│       ├── lib/                  # Prisma client, JWT helpers
│       ├── middleware/           # requireAuth, requireRole, error handler
│       └── routes/
│           ├── auth.ts           # register / login / refresh / logout
│           ├── me.ts             # current user
│           ├── categories.ts     # public category list
│           ├── offers.ts         # public + owner offer routes
│           ├── requests.ts       # public + owner request routes
│           └── admin.ts          # 14 admin endpoints (role-protected)
└── frontend/
    ├── package.json
    ├── vite.config.ts            # dev proxy: /api → localhost:4000
    ├── tailwind.config.js        # Vicini design tokens (terracotta/sage/ink)
    └── src/
        ├── main.tsx              # Router + React Query setup
        ├── App.tsx               # Routes incl. nested /admin/* with role guard
        ├── components/Header.tsx # Unified nav (Admin link for moderators)
        ├── lib/api.ts            # Axios + automatic token refresh
        ├── store/auth.ts         # Zustand auth store
        ├── types/                # Shared TS types
        └── pages/
            ├── Home.tsx, Esplora.tsx, OfferDetail.tsx
            ├── Accedi.tsx, Registrati.tsx
            ├── Dashboard.tsx, Crea.tsx, MieOfferte.tsx, Profilo.tsx
            └── admin/
                ├── AdminLayout.tsx        # Dark sidebar + <Outlet/>
                ├── ui.tsx                 # Shared badges/tables/KPI cards
                ├── AdminDashboard.tsx
                ├── AdminOfferte.tsx
                ├── AdminRichieste.tsx
                ├── AdminMatch.tsx
                ├── AdminUtenti.tsx
                ├── AdminModerazione.tsx
                ├── AdminSegnalazioni.tsx
                ├── AdminCategorie.tsx
                ├── AdminAnalytics.tsx
                └── AdminLog.tsx
```

---

## Common commands

### Backend (`cd backend`)
```bash
npm run dev          # Dev server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled output
npm run db:migrate   # Apply new migrations
npm run db:seed      # Reseed demo data
npm run db:studio    # Prisma Studio (DB GUI) at localhost:5555
npm run db:reset     # ⚠️ Drop DB, re-run migrations, reseed — kills all data
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Vite dev server with HMR
npm run build        # Production build
npm run preview      # Preview the production build
```

### Database (project root)
```bash
docker compose up -d        # Start PostgreSQL
docker compose ps           # Check it's healthy
docker compose down         # Stop (keeps data)
docker compose down -v      # ⚠️ Stop AND delete all data
docker compose logs db      # Tail PostgreSQL logs
```

---

## API overview

All endpoints are under `http://localhost:4000/api`. The frontend dev server proxies `/api/*` there automatically.

### Public
```
GET  /health                    Service check
POST /api/auth/register         Create account
POST /api/auth/login            Log in → accessToken + refresh cookie
POST /api/auth/refresh          New access token from refresh cookie
POST /api/auth/logout           Revoke session
GET  /api/categories            Active categories
GET  /api/offers                Approved offers (?category=&q=&limit=&cursor=)
GET  /api/offers/:id            Offer detail
GET  /api/requests              Approved/waiting requests
GET  /api/requests/:id          Request detail
```

### Authenticated (Bearer token)
```
GET    /api/me                  Current user + profile
POST   /api/offers              Create offer (→ PENDING_REVIEW)
GET    /api/offers/mine/list    My offers
DELETE /api/offers/:id          Withdraw my offer
POST   /api/requests            Create request (→ PENDING_REVIEW)
GET    /api/requests/mine/list  My requests
```

### Admin (MODERATOR or ADMIN role required)
```
GET   /api/admin/stats            Dashboard KPIs + submission chart
GET   /api/admin/offers           All offers (?status=)
PATCH /api/admin/offers/:id       { action: "approve"|"reject", note? }
GET   /api/admin/requests         All requests (?status=)
PATCH /api/admin/requests/:id     { action: "approve"|"reject", note? }
GET   /api/admin/matches          All matches
GET   /api/admin/users            All users (?q= search)
PATCH /api/admin/users/:id        { suspended: boolean }
GET   /api/admin/flags            All flags
PATCH /api/admin/flags/:id        { status, resolution? }
GET   /api/admin/categories       Categories with counts
POST  /api/admin/categories       { name, slug, icon }
PATCH /api/admin/categories/:id   Partial update (e.g. { active: false })
GET   /api/admin/analytics        Aggregates for the analytics page
GET   /api/admin/audit-log        Last 100 admin actions
```

Every admin mutation automatically writes an `AuditLog` row.

---

## Troubleshooting

**"Port 5433 already in use"** — Edit `docker-compose.yml`: change `5433:5432` to e.g. `5434:5432`, and update the port in `backend/.env` `DATABASE_URL`.

**"Cannot connect to database"** — Docker Desktop must be running (green whale icon). Run `docker compose ps` — the container should say `healthy`. Wait ~10s after `docker compose up -d` before migrating.

**"Admin link doesn't appear"** — You're logged in as a regular user. Log out and log in as `giulia@vicini.it`. If you registered your own account and want it to be admin, open Prisma Studio (`npm run db:studio`), find your user, and set `role` to `ADMIN`.

**Visiting `/admin` redirects to `/dashboard`** — Same cause: your current user's role is `USER`. The route guard is working as intended.

**Admin pages look empty** — You're on the old seed data. Run `npm run db:reset` in `backend/` to get the v2 seed (adds a pending request + a flag).

**"401 Unauthorized" loops** — Delete the `vicini-auth` entry in your browser's localStorage (DevTools → Application → Local Storage) and log in again.

**CORS errors** — `CORS_ORIGINS` in `backend/.env` must include `http://localhost:5173`; restart the backend after changing it.

**VS Code red squiggles** — Run `npm install` in both folders first, then Ctrl+Shift+P → "TypeScript: Restart TS Server".

---

## Recommended VS Code extensions

The project suggests these automatically (see `.vscode/extensions.json`):

- **ESLint** — linting
- **Prisma** — schema highlighting/formatting
- **Tailwind CSS IntelliSense** — class autocomplete
- **Prettier** — formatting

---

## What to build next

Recommended order, based on what unlocks what:

1. **Apply-to-help flow** ⭐ next — "Chiedi aiuto" button creates a `Match` (status `PENDING`), the offerer accepts/declines. This makes the Match admin page come alive and is the prerequisite for chat
2. **Chat** — once a match is `ACCEPTED`, create a `Conversation`; start with polling, upgrade to Socket.IO later
3. **Endorsements** — after a match is marked `COMPLETED`, both parties rate each other; updates `ratingAverage`
4. **Email verification** — Resend or AWS SES on register
5. **User-facing report button** — creates a `Flag` that shows up in the admin panel you already have
6. **Match engine** — background job (BullMQ + Redis) that auto-suggests matches by category + zone + availability overlap
7. **PostGIS** — real "within X km" queries
8. **Deployment** — AWS: RDS (database) + Elastic Beanstalk (backend) + Amplify (frontend), same pattern as your Eolab project. Change only `DATABASE_URL`, JWT secrets, and `CORS_ORIGINS` in production env vars

---

## Production notes (when you deploy)

- Generate strong JWT secrets: `openssl rand -hex 64` (one for access, one for refresh)
- Set `NODE_ENV=production` so refresh cookies become `secure`
- Use `npx prisma migrate deploy` (not `migrate dev`) against the production DB
- Set `CORS_ORIGINS` to your real frontend domain
- Never commit `.env` — use Elastic Beanstalk environment properties

---

