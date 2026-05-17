# API Reference - Dorak

This document lists the available API endpoints for the Dorak platform. All endpoints are prefixed with `/api`.

---

## 🔐 Authentication

### `POST /auth/login`
Authenticates a user and sets a secure cookie.
- **Body**: `{ email, password }`
- **Response**: `200 OK` with user data.

### `POST /auth/register`
Registers a new shop owner.
- **Body**: `{ name, email, password, shopName, category }`
- **Response**: `201 Created`.

---

## 🏢 Shop & Branches

### `GET /admin/shops` (Super Admin Only)
Lists all shops in the system.

### `GET /branches`
Lists branches for the authenticated shop.

---

## 📋 Queues

### `GET /queues`
Fetches all queues for the current shop/branch.

### `POST /queues`
Creates a new queue.
- **Body**: `{ name, nameAr, maxCapacity, avgServiceTime }`

### `PATCH /queues/:id`
Updates queue status (OPEN, PAUSED, CLOSED).

---

## 🎟️ Tickets

### `POST /tickets` (Public)
Joins a queue.
- **Body**: `{ queueId, customerName, customerPhone }`
- **Response**: Ticket details including `customerToken` and `position`.

### `GET /tickets/:id`
Fetches ticket status.

### `PATCH /tickets/:id/status` (Staff Only)
Updates ticket status (CALLED, SERVING, COMPLETED, SKIPPED).
- **Body**: `{ status }`

---

## 📊 Analytics

### `GET /analytics/daily`
Returns daily performance metrics for the shop.

---

## 🎫 Promotions

### `GET /promotions`
Lists active coupons and promotions.

---

## 🛠️ Validation Rules
- All requests are validated using **Zod**.
- Required fields must not be empty.
- Phone numbers must follow local/international formats.

## 🛑 Error Responses
- `400 Bad Request`: Validation errors or invalid logic.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient permissions (RBAC).
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unexpected server errors.
