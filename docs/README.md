# دورك - Dorak Queue Management Platform

![Dorak Logo](./assets/logo.png)

## 📋 Project Overview
**Dorak** is a high-performance, professional Queue Management Platform designed to streamline customer waiting experiences across various industries. From barbershops and restaurants to clinics and car washes, Dorak provides a seamless interface for businesses to manage their queues in real-time, while offering customers an easy way to join and track their position.

### The Problem it Solves
Traditional waiting lines are inefficient, frustrating for customers, and difficult for businesses to manage. Dorak eliminates physical queues by digitizing the process, providing real-time updates via WebSockets, and offering QR-code-based entries.

### Target Audience
- **Small to Medium Businesses**: Barbershops, Salons, Clinics, Restaurants.
- **Enterprise Clients**: Large service centers with multiple branches.
- **End Customers**: Users looking for a hassle-free waiting experience.

---

## 🚀 Tech Stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: JWT with secure cookies
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🛠️ Installation Guide

### Prerequisites
- Node.js 20+
- MySQL Server
- NPM or PNPM

### Setup Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd dorak
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/dorak"
   JWT_SECRET="your-super-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Database Initialization**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed
   ```

5. **Run the Project**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📁 Project Structure
```txt
/src
  /app            # Next.js App Router (Pages & API Routes)
  /components     # Reusable UI components (Atomic design)
  /contexts       # React Contexts (Socket, Auth)
  /features       # Business logic features (Queue, Shop)
  /hooks          # Custom React hooks
  /lib            # Utility libraries (Prisma client, Axios)
  /middleware     # Auth and Security middleware
  /services       # API service abstractions
  /types          # TypeScript types & interfaces
/prisma           # Database schema & migrations
/public           # Static assets
/docs             # Project documentation
server.mjs        # Custom HTTP server for Socket.io
```

---

## ✨ Features
- **Multi-tenant System**: Support for multiple shops with isolated data.
- **Real-time Updates**: Live ticket status changes via WebSockets.
- **Dynamic QR Codes**: Instant queue entry for customers.
- **Branch Management**: Large businesses can manage multiple locations.
- **Subscription Model**: Tiered plans (Free, Starter, Pro, Enterprise).
- **Advanced Analytics**: Daily metrics on wait times and performance.
- **Audit Logs**: Comprehensive tracking of system actions for security.

---

## 🔄 System Flows

### Authentication Flow
1. User submits login credentials.
2. Server validates via `bcryptjs`.
3. JWT is generated and stored in a secure cookie.
4. Middleware validates the token for protected `/dashboard` routes.

### Queue Flow
1. Customer scans QR code or enters via URL.
2. Customer joins the queue (Ticket created).
3. Staff sees the new ticket in real-time via Socket.io.
4. Staff "Calls" or "Serves" the ticket; status updates instantly for the customer.

### Real-time Flow
- Custom `server.mjs` handles Socket.io connections.
- Rooms are created per `shopId` and `queueId` for targeted event broadcasting.

---

## 🛡️ Security Overview
- **JWT Protection**: Secure, HTTP-only cookies.
- **RBAC**: Role-Based Access Control (Super Admin, Shop Owner, Staff).
- **Data Validation**: Schema validation using `Zod`.
- **Audit Logs**: Every sensitive action is recorded in the `audit_logs` table.
- **Middleware**: Security headers (CSP, XSS Protection, etc.) are enforced.

---

## 📈 Future Improvements
- [ ] Mobile App integration (React Native).
- [ ] Payment gateway integration (Stripe/Tabby).
- [ ] AI-powered wait time predictions.
- [ ] SMS/WhatsApp notifications for ticket alerts.
- [ ] Multi-language support (i18n).

---

## 🚀 Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
