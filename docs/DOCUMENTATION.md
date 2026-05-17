# Technical Documentation - Dorak

This document provides a deep dive into the technical architecture, design patterns, and logic of the Dorak platform.

---

## 🏛️ Architecture Documentation

Dorak is built on a **Monolithic Next.js Architecture** with a **Custom Node.js Server Wrapper** to support real-time capabilities via Socket.io.

### Design Principles
- **Layered Architecture**: Separation of concerns between UI (Components), Business Logic (Features/Services), and Data (Prisma).
- **Multi-tenancy**: Data isolation at the database level using `shopId` across all critical tables.
- **Real-time First**: State synchronization between staff and customers is handled via WebSockets, with REST as the fallback/initialization layer.

---

## 📊 Database Design

The database is powered by **MySQL** and managed through **Prisma ORM**.

### Core Entities
- **User**: Authentication and RBAC.
- **Shop**: The primary tenant.
- **Branch**: Sub-locations for a shop.
- **Queue**: Logic container for waiting lists.
- **Ticket**: The individual customer entry.
- **Subscription**: Tiered access control.

### Prisma Schema Explanation
The schema uses `cuid()` for IDs to ensure uniqueness across distributed systems. Foreign key constraints are enforced to maintain data integrity, with `onDelete: Cascade` where appropriate (e.g., deleting a shop deletes its branches and queues).

---

## 🔌 API & WebSocket Architecture

### REST API Flow
API routes are located in `src/app/api`. They follow standard RESTful conventions:
- `POST /api/auth/login`: Handles authentication.
- `GET /api/queues`: Fetches queues for a shop.
- `POST /api/tickets`: Joins a queue.

### WebSocket Logic
Implemented in `server.mjs`:
- **Rooms**: When a staff member logs in, they join a `shop:{shopId}` room. When a customer joins a queue, they join a `queue:{queueId}` room.
- **Events**:
  - `ticket:new`: Broadcasted to the shop room when a customer joins.
  - `ticket:update`: Broadcasted to the specific queue room when status changes.

---

## 🔐 RBAC System (Role-Based Access Control)

Roles defined in `UserRole` enum:
1. **SUPER_ADMIN**: Full system access, management of plans and global analytics.
2. **SHOP_OWNER**: Management of their shop, branches, staff, and subscriptions.
3. **SHOP_STAFF**: Operational access to manage queues and call tickets.

### Security Middleware Flow
Middleware (`src/middleware/index.ts`) intercepts requests:
1. Validates JWT from cookies.
2. Decodes claims (role, status).
3. Checks if the account is `ACTIVE`.
4. Redirects unauthorized users or those with `PENDING`/`SUSPENDED` status.

---

## 🚦 Queue Logic & Performance

### State Management
- **Server State**: Managed by Prisma and synchronized via WebSockets.
- **Client State**: Handled using React hooks and contexts for real-time reactivity without full page reloads.

### Performance Optimization
- **Indexing**: Database indexes on `shopId`, `queueId`, and `status` to ensure fast lookups even with thousands of tickets.
- **Caching Strategy**: API responses for static data (like shop settings) can be cached at the edge or client-side.

---

## 🛠️ Extending the Project

### Adding New Features
1. **Model**: Update `prisma/schema.prisma` and run `npx prisma migrate dev`.
2. **API**: Create a new route in `src/app/api`.
3. **Feature**: Add logic to `src/features`.
4. **UI**: Create components in `src/components`.

### Adding Payment Systems
The system is designed to integrate with payment providers like Stripe or Tabby. The `Subscription` model already includes fields for plans and statuses, making it ready for webhook integration.

---

## 📱 Mobile App Integration
Dorak is "API-First". A mobile application (React Native or Flutter) can consume the existing `/api` endpoints and connect to the Socket.io server using a standard client.

---

## 🚀 Scaling Notes
To scale Dorak:
- **Database**: Implement read replicas for analytics.
- **WebSockets**: Use a Redis adapter for Socket.io to support multiple server instances.
- **Storage**: Move images to S3/Cloudinary (currently handled via local paths or URLs).
