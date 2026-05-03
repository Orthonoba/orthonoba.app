# ORTHONOBA — Deployment Checklist

> Use this checklist for every production deployment. Check off items as completed.
> Last updated: 2026-05-03

---

## 1. Pre-Deployment

### DNS & Domains
- [ ] Root domain `orthonoba.app` points to Cloudflare (proxied)
- [ ] Wildcard `*.orthonoba.app` CNAME points to VPS/load balancer (proxied)
- [ ] `www.orthonoba.app` → `orthonoba.app` redirect configured in Cloudflare
- [ ] DNS TTL set to 300s before cutover (revert to 3600s after)
- [ ] MX records verified (email delivery functional)
- [ ] SPF, DKIM, DMARC records present and valid

### SSL / TLS
- [ ] SSL certificate covers `orthonoba.app` and `*.orthonoba.app`
- [ ] Certificate expiry > 30 days (auto-renewal configured)
- [ ] HTTPS redirect enforced (HTTP → HTTPS 301)
- [ ] SSL Labs score A or A+ for `orthonoba.app`

### Environment Variables
- [ ] `.env` file created from `.env.example` on server (never committed)
- [ ] `JWT_SECRET` is at least 32 random characters (use `openssl rand -base64 32`)
- [ ] `DATABASE_URL` and `DIRECT_URL` point to production Neon DB
- [ ] All Stripe price IDs are production (`price_live_...`), not test
- [ ] `STRIPE_SECRET_KEY` is production key (`sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint registered in Stripe Dashboard
- [ ] `ANTHROPIC_API_KEY` set and valid (test with a minimal prompt)
- [ ] `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN` set
- [ ] `RESEND_API_KEY` set; domain verified in Resend dashboard
- [ ] `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` valid
- [ ] `REDIS_URL` reachable from app container
- [ ] `NODE_ENV=production`, `NEXT_PUBLIC_ENV=production`
- [ ] No test/dummy values remain in production `.env`

### Database
- [ ] Neon DB project provisioned in `eu-central-1` region
- [ ] `prisma migrate deploy` run against production DB (zero downtime migration)
- [ ] Migration history matches expected state (`prisma migrate status`)
- [ ] Seed data applied if this is a fresh environment
- [ ] DB connection pool size matches expected concurrency (default: 10)
- [ ] `DIRECT_URL` set to non-pooled connection for migrations

### Backup (Pre-Deploy Snapshot)
- [ ] Manual PostgreSQL dump taken before deployment: `pg_dump $DATABASE_URL > pre-deploy-$(date +%Y%m%d).sql`
- [ ] Dump uploaded to `orthonoba-backups` S3 bucket
- [ ] Dump restoration tested in staging environment within last 7 days

---

## 2. Server Preparation

### Hetzner VPS
- [ ] VPS type: CX21 minimum (2 vCPU, 4GB RAM) for initial launch
- [ ] OS: Ubuntu 22.04 LTS
- [ ] Hostname set: `app.orthonoba.app`
- [ ] SSH key-based access configured (password auth disabled)
- [ ] Non-root deploy user created: `orthonoba`
- [ ] `sudo` granted to deploy user for required commands only

### Firewall (UFW)
- [ ] UFW enabled: `ufw enable`
- [ ] Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open externally
- [ ] Port 22 restricted to known IPs or VPN only
- [ ] All other inbound ports denied by default
- [ ] Docker internal network not exposed to external interfaces
- [ ] `ufw status verbose` output reviewed

### Fail2Ban
- [ ] fail2ban installed and running
- [ ] SSH jail active: max 5 retries, 10-minute ban
- [ ] Nginx jail active for 4xx/5xx rate abuse
- [ ] Email notification configured for bans (optional)

### Docker & Docker Compose
- [ ] Docker Engine 24.x+ installed
- [ ] Docker Compose v2.x installed (`docker compose version`)
- [ ] Deploy user added to `docker` group
- [ ] Docker daemon configured with log rotation (`max-size: 10m`, `max-file: 3`)
- [ ] `docker-compose.yml` (or staging variant) reviewed for production values

### Coolify (if using)
- [ ] Coolify installed and accessible at `https://coolify.orthonoba.app`
- [ ] Coolify admin account secured with strong password + 2FA
- [ ] Source repository connected (GitHub/GitLab)
- [ ] Build environment variables configured in Coolify UI
- [ ] Auto-deploy on `main` branch push configured
- [ ] Health check path set to `/api/health`

---

## 3. Application Deployment

### Docker Build
- [ ] Dockerfile builds without errors: `docker build -t orthonoba:latest .`
- [ ] Image size reasonable (< 1.5 GB)
- [ ] No secrets baked into the image layers
- [ ] `.dockerignore` excludes `node_modules`, `.env`, `.git`
- [ ] Production build: `NODE_ENV=production npm run build` passes without errors
- [ ] TypeScript strict mode: `tsc --noEmit` passes with 0 errors

### Container Startup
- [ ] Application starts: `docker compose up -d`
- [ ] All containers in `Up (healthy)` state: `docker compose ps`
- [ ] Application logs show no ERROR or FATAL level messages on startup
- [ ] Health check endpoint responds: `curl https://orthonoba.app/api/health`
- [ ] Expected response: `{ "status": "ok", ... }`

### Database Connectivity
- [ ] App container can reach Neon DB (check startup logs)
- [ ] `prisma migrate status` shows all migrations applied
- [ ] No pending migrations in production

### Rollback Plan
- [ ] Previous Docker image tagged and retained: `docker tag orthonoba:previous orthonoba:rollback`
- [ ] Rollback command documented: `docker compose down && docker tag orthonoba:rollback orthonoba:latest && docker compose up -d`
- [ ] DB rollback migration prepared (if schema changed): `prisma migrate resolve --rolled-back`
- [ ] Estimated rollback time < 5 minutes

---

## 4. Post-Deployment Verification

### Core API Endpoints
- [ ] `GET /api/health` → `200 OK`, `status: "ok"`
- [ ] `POST /api/v1/auth/login` → `200` with valid credentials, `401` with wrong
- [ ] `POST /api/v1/auth/logout` → `200`
- [ ] `GET /api/v1/auth/me` → `200` when authenticated, `401` when not
- [ ] `GET /api/v1/plans` → `200`, returns plan catalog
- [ ] `GET /api/v1/dashboard/role` → `200` for authenticated clinic_admin

### Auth Flow (End-to-End)
- [ ] Login page loads at `https://orthonoba.app/login`
- [ ] Correct credentials → redirected to `/dashboard`
- [ ] Incorrect credentials → error message shown, no redirect
- [ ] Session cookie present after login (HttpOnly, Secure, SameSite=Strict)
- [ ] Protected route redirects unauthenticated users to `/login`
- [ ] Logout clears session cookie and redirects to `/login`
- [ ] JWT expiry works: expired token → redirect to login

### Multi-Tenant
- [ ] Subdomain routing: `demo.orthonoba.app` resolves to demo tenant
- [ ] `x-clinic-id` header injected by middleware
- [ ] Cross-tenant data isolation: tenant A cannot read tenant B's data

### Stripe Webhooks
- [ ] Stripe webhook endpoint registered: `https://orthonoba.app/api/v1/webhooks/stripe`
- [ ] Webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
- [ ] Test event sent from Stripe Dashboard → received and logged
- [ ] `checkout.session.completed` → subscription created in DB
- [ ] `customer.subscription.deleted` → tenant plan downgraded

### WhatsApp Integration
- [ ] Webhook verification: `GET /api/v1/notifications/whatsapp?hub.mode=subscribe&hub.verify_token=...` → `200`
- [ ] Test WhatsApp message sent to test number (if credentials set)
- [ ] Without credentials: MockWhatsAppService logging to console (no crash)

### Email
- [ ] Transactional email: `POST /api/v1/notifications/email` → `200`
- [ ] Test email received in inbox (not spam)
- [ ] From address shows `noreply@orthonoba.app`
- [ ] SPF/DKIM pass verified via email header inspection

### Storage
- [ ] File upload: `POST /api/v1/files/upload` → `200`, returns URL
- [ ] Uploaded file accessible via CDN URL
- [ ] File size limits enforced (400 KB photos, 100 MB CAD files)

---

## 5. Monitoring Setup

### Uptime Kuma
- [ ] Uptime Kuma deployed and accessible at `https://status.orthonoba.app`
- [ ] Monitor created for `https://orthonoba.app/api/health` (interval: 60s)
- [ ] Monitor created for `https://orthonoba.app` (root page)
- [ ] Monitor created for Neon DB connection (TCP or HTTP ping)
- [ ] Alert notification channels configured: email + WhatsApp/Telegram
- [ ] Status page publicly accessible at `https://status.orthonoba.app`

### Log Monitoring
- [ ] Application logs streaming to persistent volume: `/var/log/orthonoba/`
- [ ] Log rotation configured (max 10MB per file, keep 7 days)
- [ ] Docker logs accessible: `docker compose logs -f app`
- [ ] Error-level logs trigger alert (via log shipper or cron check)
- [ ] Sentry DSN configured (`SENTRY_DSN` env var set)
- [ ] Test Sentry error captured: `throw new Error('sentry-test')` → appears in Sentry dashboard

### Alert Configuration
- [ ] CPU > 80% for 5 min → alert
- [ ] Memory > 85% → alert
- [ ] Disk > 80% → alert
- [ ] Health check failing > 2 consecutive → alert
- [ ] SSL certificate expiry < 14 days → alert
- [ ] DB connection failures → alert
- [ ] Stripe webhook failures → alert (check Stripe Dashboard logs)

---

## 6. Security Audit

### SSL/TLS
- [ ] SSL Labs score A+ at `https://www.ssllabs.com/ssltest/analyze.html?d=orthonoba.app`
- [ ] TLS 1.0 and 1.1 disabled (TLS 1.2+ only)
- [ ] HSTS header present: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] HSTS preload submitted at `https://hstspreload.org/`

### Security Headers
- [ ] `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Content-Security-Policy` header configured and tested (no inline script violations)
- [ ] `Permissions-Policy` header restricts unused browser APIs
- [ ] SecurityHeaders.com score B+ or above

### Rate Limiting
- [ ] Login endpoint: max 5 attempts per IP per 15 minutes
- [ ] API endpoints: max 100 requests per IP per minute (general)
- [ ] File upload: max 10 uploads per minute per tenant
- [ ] Webhook endpoints: max 50 per minute
- [ ] Rate limit headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- [ ] `429 Too Many Requests` returned when limits exceeded (tested)

### WAF Rules (Cloudflare)
- [ ] Cloudflare WAF managed rules enabled (OWASP Core Ruleset)
- [ ] SQL injection protection active
- [ ] XSS protection active
- [ ] Challenge/block high-risk bot traffic
- [ ] Admin paths (`/api/v1/platform/*`) restricted to known IPs

---

## 7. Performance Baseline

### Load Test Targets
- [ ] 50 concurrent users → p95 < 300ms, p99 < 500ms, 0% error rate
- [ ] 200 concurrent users → p95 < 500ms, p99 < 1s, < 0.1% error rate
- [ ] Tool: `k6` or `artillery` (scripts in `scripts/load-test/`)

### Database
- [ ] All critical queries use indexes (no sequential scans on large tables)
- [ ] p99 DB query time < 100ms (measured in production via `pg_stat_statements`)
- [ ] Connection pool not exhausted under load

### Core Web Vitals
- [ ] TTFB (Time to First Byte) < 200ms (measured with `curl -w "%{time_starttransfer}"`)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FID/INP < 100ms
- [ ] Google PageSpeed Insights score > 85 (mobile)

### API Response Times
- [ ] `GET /api/health` < 50ms
- [ ] `POST /api/v1/auth/login` < 200ms
- [ ] `GET /api/v1/dashboard/clinic` < 500ms
- [ ] File upload (< 5MB) < 3s
