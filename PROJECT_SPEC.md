# Technical Project Specification: Dorak (دورك)

This document provides a comprehensive reverse-engineered technical specification for the **Dorak** platform, a SaaS queue management system.

---

## 1. Project Overview
**Dorak** is a multi-tenant SaaS platform designed to digitize and manage physical queues in service-based businesses (barbershops, restaurants, clinics, etc.).
- **Main Purpose**: Eliminate physical waiting lines by providing a virtual queue system where customers join via QR codes and receive real-time updates on their status.
- **Target Users**:
  - **Business Owners**: Manage queues, staff, and subscriptions.
  - **Staff**: Call the next customer, manage active tickets.
  - **Customers**: Join queues via mobile browsers without app installation.
  - **System Admins**: Oversee the entire platform, manage plans, and approve shops.

---

## 2. System Architecture
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Route Handlers (Edge-compatible logic), Socket.io (Real-time).
- **Database**: MySQL managed via Prisma ORM.
- **Authentication**: Custom JWT implementation (Access & Refresh tokens) stored in HTTP-only cookies.
- **Real-time**: Custom `server.mjs` integrating Next.js with Socket.io for live queue updates.
- **Validation**: Zod for schema validation across API and forms.
- **State Management**: React Context API (Auth, Language, Theme).

---

## 3. Full Feature Breakdown

### Queue Management
- **Join Queue**: Customers scan a QR code, enter their name/phone (optional), and receive a unique `customerToken`.
- **Call Next**: Staff triggers an atomic transaction that completes the current ticket, marks the next as "CALLED", and updates all remaining positions.
- **Real-time Updates**: Socket.io broadcasts `ticket:called` and `position:updated` events to specific rooms (`queue:[id]`).
- **Ticket Tracking**: Customers see their position, estimated wait time, and receive live status updates.

### SaaS Subscription Management
- **Dynamic Plans**: Admin-managed plans with pricing, currencies (SAR, USD, IQD), discounts (Percentage/Fixed), and trial days.
- **Trial System**: Automatic transition to `TRIAL` status upon registration if the plan allows.
- **Access Control**: Subscription guard blocks access if the status is not `ACTIVE` or `TRIAL`.

### Admin Management
- **Shop Approval**: Super Admin must approve new shops before they can operate.
- **Analytics**: Dashboard for Super Admin showing total shops, revenue, and popular plans.
- **Plan Management**: CRUD operations for subscription plans.

---

## 4. User Roles & Permissions

| Role | Accessible Pages | Core Actions | API Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `/dashboard/admin/*` | Manage Plans, Approve/Suspend Shops, Global Analytics. | Full access to `/api/admin/*` |
| **Shop Owner** | `/dashboard/*` | Manage Queues, Staff, Subscriptions, Branches, Settings. | Access to shop-specific APIs |
| **Shop Staff** | `/dashboard/queues`, `/dashboard/analytics` | Call Next, Complete/Skip Tickets, View active stats. | Limited to queue/ticket control |
| **Guest** | `/`, `/pricing`, `/q/[code]`, `/ticket/[token]` | View Landing/Pricing, Join Queue, Track Status. | Public endpoints (Join, Status) |

---

## 5. Database Documentation (Prisma Schema)

### Core Tables
- **User**: Authentication, roles, and account status.
- **Shop**: Multi-tenant business entity.
- **Queue**: Configuration for waiting lines.
- **Ticket**: Individual customer entries in a queue.
- **Subscription**: Current plan status for a shop.
- **Plan**: SaaS product definitions (managed by Super Admin).
- **DailyAnalytics**: Aggregated stats for business reporting.

### Relationships
- `Shop` 1:N `Queue`
- `Queue` 1:N `Ticket`
- `Shop` 1:1 `Subscription`
- `Plan` 1:N `Subscription`
- `User` N:M `Shop` (via `ShopMember`)

---

## 6. API Documentation

| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | User login & cookie setting | No |
| `/api/auth/register` | POST | Shop onboarding & trial activation | No |
| `/api/queues/[id]/call-next` | POST | Call the next customer in line | Yes (Staff/Owner) |
| `/api/tickets` | POST | Publicly join a queue | No (Rate limited) |
| `/api/admin/plans` | GET/POST | Manage subscription plans | Yes (Super Admin) |
| `/api/admin/shops/manage` | POST | Approve/Suspend shop accounts | Yes (Super Admin) |

---

## 7. Security System
- **JWT**: Dual-token system stored in HTTP-only cookies (`accessToken`, `refreshToken`).
- **Middleware**: Edge middleware validates JWT signatures and checks account status (PENDING/SUSPENDED).
- **Auth Guard**: `withAuth` HOC for API routes with role-based access control.
- **Rate Limiting**: In-memory protection for registration and ticket joining (IP-based).
- **Data Security**: Passwords hashed with `bcryptjs` (12 rounds).

---

## 8. Business Rules
- **Account Activation**: Shops start as `PENDING`. Super Admin must approve before they can open queues.
- **Subscription Expiration**: Automatically locks access when `endDate` is reached.
- **Trial Restrictions**: One trial per shop; prevents reuse of trial periods.
- **Queue Logic**: Only one ticket can be `SERVING` or `CALLED` at a time per queue to ensure order.

---

## 9. Rebuild Instructions (Step-by-Step)
1. **Init**: Create Next.js project with Tailwind and Prisma.
2. **Schema**: Apply `schema.prisma` and generate client.
3. **Auth**: Implement JWT logic in `lib/jwt.ts` and cookie-based authentication.
4. **Socket.io**: Set up `server.mjs` for the custom HTTP server + WebSocket integration.
5. **Base API**: Implement `withAuth` and standardized `successResponse`/`errorResponse` helpers.
6. **Dashboard**: Build the multi-tenant UI with role-based sidebar navigation.
7. **Queue Engine**: Implement atomic ticket transactions using Prisma `$transaction`.

---

## 10. Missing Parts & Weaknesses
- **Scalability**: In-memory rate limiting (needs Redis for multi-instance deployment).
- **Reliability**: Socket.io on a custom server (consider Pusher or AWS IoT for serverless).
- **Validation**: Some legacy routes (`_token_deprecated`) need full cleanup.
- **Backups**: No automated database backup logic implemented in the core code.
