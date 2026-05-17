# PROJECT_MAP for Dorak

## Assumptions
- The project is a SaaS queue-management platform targeting multi-tenant businesses, staff, customers, and super admin users.
- The implementation must remain within the existing feature set described in `PROJECT_SPEC.md` and the codebase; no new product lines or unrelated modules will be added.
- Real-time queue updates are required and must remain compatible with the custom `server.mjs` + Socket.io architecture.
- Authentication is cookie-based JWT with role guards; no OAuth or external identity provider is currently in scope.
- Payment orchestration is implied by subscription plans, but payment gateway integration is not present in the current code and must remain pending unless explicitly requested.
- The codebase is deployed as a Node.js service; serverless deployment is not a current requirement because `server.mjs` uses a custom HTTP server.

## Environment Snapshot
- System date from shell: **2026-05** (May 2026)
- Verified stable npm versions as of May 2026:
  - `next` = **16.2.6**
  - `react` = **19.2.6**
  - `prisma` = **7.8.0**
  - `zod` = **4.4.3**
  - `socket.io` = **4.8.3**
  - `tailwindcss` = **4.3.0**
  - `next-themes` = **0.4.6**
  - `framer-motion` = **12.38.0**
  - `jsonwebtoken` = **9.0.3**

## TECH_STACK
- Framework: `Next.js 16` App Router
- UI: `React 19`, `Tailwind CSS 4`, `Framer Motion`, `Lucide React`, Radix UI primitives
- Backend: Next.js Route Handlers, custom `server.mjs`, `Socket.io` real-time server
- Database: MySQL with `Prisma ORM`
- Auth: JWT access + refresh token, HTTP-only cookies, custom guard middleware
- Validation: `Zod`
- State / context: React Context API for auth, theme, language
- Client HTTP: `Axios`
- Utilities: `date-fns`, `clsx`, `class-variance-authority`, `qrcode`
- Dev tooling: TypeScript, ESLint, `tsx`, Prisma CLI

## SYSTEM_FLOW
### Key user journeys (Verifiable Goals)
1. **Guest Queue Entry**
   - Customer scans QR code → lands on `/q/[code]` → submits join form → `POST /api/tickets` → receives ticket details and unique token.
   - Success criterion: ticket is created, UI shows position and listens on `queue:[id]` socket room.

2. **Staff Ticket Processing**
   - Authenticated staff visits `/dashboard/queues` → selects queue → triggers `POST /api/tickets/[id]/action` or `/api/queues/[id]/call-next`.
   - Success criterion: ticket becomes `CALLED` or `COMPLETED`, `queue:[id]` and/or `shop:[shopId]` receive socket events, clients update without refresh.

3. **Shop Onboarding & Approval**
   - Business owner registers via `/api/auth/register` → shop enters `PENDING` state → Super Admin approves in dashboard.
   - Success criterion: shop cannot access protected dashboard until approved; approval flips status to `ACTIVE`.

4. **Subscription Enforcement**
   - Shop uses selected plan; expiry or suspension blocks dashboard access.
   - Success criterion: access control gates dashboard and API routes based on plan status.

5. **Admin Plan Management**
   - Super Admin manages plans via `/api/admin/plans` and dashboard admin routes.
   - Success criterion: CRUD plan operations persist correctly and affect new shop subscriptions.

### Data flow
- Browser → Next.js page/form → client-side API wrapper (`src/services/apiService.ts`) → route handler (`src/app/api/.../route.ts`) → validators + domain logic → Prisma → MySQL.
- Authentication flow: login/register route creates JWTs, writes HTTP-only cookies, and returns user payload via `auth/me`.
- Real-time flow: `server.mjs` hosts Socket.io; client joins `queue:[id]` or `shop:[shopId]`; API routes emit updates on status changes.
- Middleware flow: `src/middleware/index.ts` inspects cookie JWT, redirects unauthorized users, and prevents auth routes for already authenticated sessions.

## ARCHITECTURE
### Core Domains
- `auth`:
  - `src/app/api/auth/*`
  - `src/lib/jwt.ts`
  - `src/lib/api.ts`
  - `src/middleware/index.ts`
- `queue & ticket management`:
  - `src/app/api/tickets/*`
  - `src/app/api/queues/*`
  - `src/hooks/useQueue.ts`
  - `src/app/q/[code]` and `src/app/ticket/[token]`
- `shop & subscription`:
  - `src/app/api/shops/*`
  - `src/app/api/subscription/upgrade/*`
  - `src/app/dashboard/*`
- `admin`:
  - `src/app/api/admin/*`
  - `src/app/dashboard/admin/*`
- `shared/core utilities`:
  - `src/lib/*` for repeated helpers only
  - `src/constants/index.ts` for runtime API path constants
  - `src/types/index.ts` for shared type contracts

### Architectural principles
- Domain-aligned feature folders, not vertical micro-files.
- Shared utilities only when genuinely reused (`jwt`, `api`, `utils`, `validations`).
- Keep UI components in `src/components` grouped by feature-level usage.
- Custom server is the single real-time entrypoint rather than a separate microservice.
- Use route handlers for requests and only keep side effects in API route scope.

### Logging strategy
- Design a simple async logger abstraction rather than synchronous filesystem writes.
- Minimum levels: `info`, `warn`, `error`.
- Default output: console with structured JSON metadata for requests and domain events.
- Optional extension: a non-blocking buffered write queue to file or external sink; not required until observability demand grows.
- Ensure logging is non-blocking and low-overhead to avoid affecting request latency.

## ORPHANS & PENDING
- `nextjs@0.0.3` exists in dependencies and appears unrelated to actual Next.js usage; validate whether it is required or should be removed.
- `@base-ui/react` and `shadcn` packages are present but may be implementation artifacts; confirm active use before retaining.
- Payment gateway integration is missing from the subscription workflow.
- In-memory rate limiting is not production-safe for horizontal scaling.
- `server.mjs` custom server prevents serverless / edge-first deployment.
- No explicit backup, audit-log, or deployment infra defined in repo.
- Prisma is currently `6.4.1` in code but latest stable is `7.8.0`; upgrade path should be tested.
- No documented CI/CD, no environment schema file (`.env.example`) in repository.
- `api/cron/reset-queues` currently uses raw bearer auth; this is a pending operational concern if cron credentials are required.

## Milestones (Success-Based)
1. **M1 — Core platform validation**
   - Confirm guest can join a queue and receive live updates.
   - Confirm staff can move queue state and broadcast WebSocket events.
   - Confirm JWT auth + cookie guard works end-to-end.

2. **M2 — Tenant lifecycle enforcement**
   - Confirm shop registration enters `PENDING` and cannot use dashboard until approval.
   - Confirm super admin can approve/suspend shops.
   - Confirm subscription status blocks or allows dashboard access correctly.

3. **M3 — Admin SaaS control**
   - Confirm plan CRUD works from admin API and dashboard.
   - Confirm new shop onboarding can attach a valid plan.

4. **M4 — Stability & dependency hygiene**
   - Confirm no deprecated packages remain in core path.
   - Validate `prisma` upgrade path and confirm database schema compatibility.
   - Confirm `server.mjs` WebSocket flow emits correctly and does not block requests.

5. **M5 — Technical debt cleanup**
   - Remove orphan/unneeded dependencies.
   - Document pending integration points and infra assumptions.
   - Add `PROJECT_MAP.md` as the single source of architectural truth.

---

> Notes:
> - This plan is intentionally bounded to the existing project scope and avoids extra product features.
> - The architecture is optimized for the current repo layout: Next.js App Router + Node custom Socket.io server + Prisma MySQL.
> - Any extension beyond this scope should first pass the milestone checkpoints above.
