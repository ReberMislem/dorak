# Database Documentation - Dorak

Dorak uses a **Relational Database Model** powered by **MySQL** and **Prisma ORM**. The schema is designed for multi-tenancy, high performance, and auditability.

---

## 🏗️ Entity Relationship Diagram (ERD)

The core relationships are as follows:
- **Shop** (1) ↔ (N) **Branch**
- **Branch** (1) ↔ (N) **Queue**
- **Queue** (1) ↔ (N) **Ticket**
- **Shop** (1) ↔ (1) **Subscription**
- **User** (N) ↔ (N) **Shop** (via **ShopMember**)

---

## 📑 Table Schema

### 👤 `users`
Stores user accounts and roles.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key |
| `name` | String | Full name |
| `email` | String | Unique email |
| `role` | Enum | SUPER_ADMIN, SHOP_OWNER, SHOP_STAFF |
| `accountStatus` | Enum | PENDING, ACTIVE, SUSPENDED, DEACTIVATED |

### 🏢 `shops`
The primary tenant entity.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key |
| `name` | String | Business name |
| `slug` | String | Unique URL slug |
| `category` | Enum | BARBERSHOP, RESTAURANT, CLINIC, etc. |

### 📋 `queues`
Defines a specific queue line.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key |
| `shopId` | String | Foreign Key to `shops` |
| `status` | Enum | OPEN, PAUSED, CLOSED |
| `currentNumber` | Int | Last called ticket number |

### 🎟️ `tickets`
Individual queue entries.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key |
| `queueId` | String | Foreign Key to `queues` |
| `status` | Enum | WAITING, CALLED, SERVING, COMPLETED, etc. |
| `customerToken` | String | Unique token for customer access |

---

## ⚡ Performance Optimizations

### Indexes
We use composite indexes to speed up common queries:
- `@@index([email])` on `users` for fast logins.
- `@@index([shopId])` on most tables for multi-tenant data fetching.
- `@@index([queueId, status])` on `tickets` to quickly find waiting customers.

### Constraints
- **Foreign Keys**: Ensure data consistency (e.g., a ticket cannot exist without a queue).
- **Unique Slugs**: Ensures every shop has a unique URL.

---

## 🔄 Migrations & Seeders

### Running Migrations
To apply schema changes:
```bash
npx prisma migrate dev --name describe_the_change
```

### Seeding Data
Initial system roles and dummy data for development:
```bash
npm run db:seed
```
This script creates a `SUPER_ADMIN` and a sample `SHOP_OWNER` with queues and tickets.

---

## 🛡️ Multi-tenancy Isolation
Multi-tenancy is implemented at the **application layer**. Every query to a shop-related table must include a `shopId` filter to prevent data leakage between businesses. This is enforced in the services layer.
