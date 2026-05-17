# Deployment Guide - Dorak

This guide provides instructions for deploying Dorak in various environments.

---

## 💻 Local Development Setup

1. **Clone & Install**:
   ```bash
   git clone <repo>
   npm install
   ```

2. **Database**:
   - Install MySQL.
   - Create a database named `dorak`.
   - Update `.env` with your `DATABASE_URL`.

3. **Prisma**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run Server**:
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployment (Vercel + Managed DB)

Since Dorak uses a custom `server.mjs` for Socket.io, standard Vercel deployments might require adjustments (as Vercel functions are stateless). 

### Recommended Approach: VPS (DigitalOcean/Linode/AWS)
For full Socket.io support, a VPS is recommended.

1. **Server Setup**:
   - Install Node.js 20+, MySQL, and PM2.
   - Clone the repo on the server.

2. **Environment Variables**:
   Set production variables in `.env`:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL="mysql://prod_user:prod_pass@host:3306/dorak"
   JWT_SECRET="secure_random_string"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

3. **Build & Start**:
   ```bash
   npm run build
   pm2 start server.mjs --name dorak
   ```

4. **Nginx Reverse Proxy**:
   Configure Nginx to forward traffic to port 3000 and handle WebSocket upgrades.

---

## 🛡️ Security Hardening

- **SSL/TLS**: Always use HTTPS (Certbot/Let's Encrypt).
- **Firewall**: Restrict MySQL access to `localhost` or specific IPs.
- **Rate Limiting**: Implement rate limiting on API endpoints to prevent DDoS.
- **Environment Secrets**: Never commit `.env` files to version control.

---

## 📊 Monitoring & Logging

- **PM2 Logs**: `pm2 logs dorak`.
- **Audit Logs**: Check the `audit_logs` table in the database for system activity.
- **Error Tracking**: Integration with Sentry is recommended for production.

---

## 💾 Backup Strategy

- **Database Backups**: Use `mysqldump` for daily backups.
  ```bash
  mysqldump -u root -p dorak > backup_$(date +%F).sql
  ```
- **Automated Backups**: Setup a cron job to push backups to an off-site storage like AWS S3.
