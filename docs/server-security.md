# ORTHONOBA — Server Security Guide

> Target: Hetzner VPS (Ubuntu 22.04 LTS) running ORTHONOBA via Docker + Cloudflare.
> Follow each section before going to production.

---

## 1. Network Security

### UFW Firewall Rules

```bash
# Reset and enable UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH from trusted IPs only (replace with your IP)
sudo ufw allow from YOUR_ADMIN_IP to any port 22

# Allow HTTP and HTTPS (Cloudflare proxy will terminate TLS)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

### Cloudflare IP Allowlist for HTTP/HTTPS

Only allow Cloudflare proxy IPs to reach ports 80 and 443. This prevents direct VPS access bypassing the WAF.

```bash
# Cloudflare IPv4 ranges (update from https://www.cloudflare.com/ips/)
CF_IPS=(
  "173.245.48.0/20"
  "103.21.244.0/22"
  "103.22.200.0/22"
  "103.31.4.0/22"
  "141.101.64.0/18"
  "108.162.192.0/18"
  "190.93.240.0/20"
  "188.114.96.0/20"
  "197.234.240.0/22"
  "198.41.128.0/17"
  "162.158.0.0/15"
  "104.16.0.0/13"
  "104.24.0.0/14"
  "172.64.0.0/13"
  "131.0.72.0/22"
)

for ip in "${CF_IPS[@]}"; do
  sudo ufw allow from "$ip" to any port 80
  sudo ufw allow from "$ip" to any port 443
done

# Then remove the broad allow rules for 80/443
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
```

### Internal Network Isolation

- Docker networks must be internal and not bound to `0.0.0.0`
- PostgreSQL, Redis: never expose to public interfaces
- App container communicates with DB via Docker internal network only
- Nginx/Caddy reverse proxy is the only container binding public ports

```yaml
# docker-compose.yml excerpt
services:
  app:
    ports: []  # no public port — nginx proxies to app:3000 internally
  postgres:
    ports: []  # no public port — internal only
  redis:
    ports: []  # no public port — internal only
  nginx:
    ports:
      - "80:80"
      - "443:443"
```

---

## 2. SSH Hardening

### Create Non-Root Deploy User

```bash
# On the server
adduser orthonoba
usermod -aG sudo orthonoba
usermod -aG docker orthonoba

# Copy your SSH public key
mkdir -p /home/orthonoba/.ssh
cat /your/public/key.pub >> /home/orthonoba/.ssh/authorized_keys
chmod 700 /home/orthonoba/.ssh
chmod 600 /home/orthonoba/.ssh/authorized_keys
chown -R orthonoba:orthonoba /home/orthonoba/.ssh
```

### SSH Configuration (`/etc/ssh/sshd_config`)

```conf
# Disable password authentication
PasswordAuthentication no
ChallengeResponseAuthentication no
PermitRootLogin no
UsePAM yes

# Only allow deploy user
AllowUsers orthonoba

# Change default port (optional but reduces brute force noise)
# Port 2222

# Key types
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Timeouts
LoginGraceTime 30
MaxAuthTries 3
MaxSessions 5
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable unused features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no
```

```bash
sudo systemctl restart sshd
```

### Fail2Ban Configuration

Install and configure fail2ban to block repeated authentication failures.

```bash
sudo apt install fail2ban -y
```

`/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
backend  = systemd

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s
maxretry = 3
bantime  = 86400

[nginx-http-auth]
enabled  = true
filter   = nginx-http-auth
port     = http,https
logpath  = /var/log/nginx/error.log

[nginx-botsearch]
enabled  = true
filter   = nginx-botsearch
port     = http,https
logpath  = /var/log/nginx/access.log
maxretry = 2
bantime  = 86400
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status
```

---

## 3. Docker Security

### Non-Root Container User

Dockerfile must run as a non-root user:

```dockerfile
# In production Dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs
```

### Resource Limits

Set CPU and memory limits to prevent container resource exhaustion:

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 1.5G
        reservations:
          cpus: "0.5"
          memory: 512M
```

### Read-Only Filesystems

Mount application code read-only where possible:

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
    volumes:
      - app-logs:/app/logs   # writable volume for logs only
```

### Docker Daemon Security (`/etc/docker/daemon.json`)

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "no-new-privileges": true,
  "icc": false,
  "userland-proxy": false
}
```

### Image Hygiene

- Use minimal base images: `node:20-alpine`
- Pin image digests in production: `node:20-alpine@sha256:...`
- Scan images: `docker scout cves orthonoba:latest`
- Never store secrets in Dockerfile or image layers
- Use multi-stage builds to exclude dev dependencies

---

## 4. Application Security

### CORS Policy

In `next.config.ts`, configure strict CORS:

```typescript
const allowedOrigins = [
  'https://orthonoba.app',
  'https://www.orthonoba.app',
  /^https:\/\/[a-z0-9-]+\.orthonoba\.app$/,
]
```

API routes return `Access-Control-Allow-Origin` only for listed origins. Never use wildcard `*` in production for authenticated routes.

### Rate Limiting Zones

| Zone | Limit | Window | Action |
|------|-------|--------|--------|
| Login | 5 req | 15 min | 429 + lockout |
| API general | 100 req | 1 min | 429 |
| File upload | 10 req | 1 min | 429 |
| Webhooks | 50 req | 1 min | 429 |
| Public landing/funnels | 30 req | 1 min | 429 |

Apply rate limiting at Nginx level (or middleware) using `X-Forwarded-For` header (set by Cloudflare).

### API Authentication

- All `/api/v1/*` routes require valid JWT in `Authorization: Bearer <token>` header
- JWT signed with `HS256` using `JWT_SECRET` (minimum 32 bytes entropy)
- JWT expiry: `SESSION_EXPIRY_HOURS` (default 24h)
- Refresh tokens: implement if session extension is needed
- Webhook endpoints (`/api/v1/webhooks/stripe`, `/api/v1/notifications/whatsapp`) use signature verification, not JWT

### Security Headers (Nginx / Next.js)

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(self)" always;
add_header X-XSS-Protection "0" always;  # Disabled in favour of CSP
```

Content-Security-Policy (customize per environment):

```
default-src 'self';
script-src 'self' 'nonce-{RANDOM}' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://files.orthonoba.app;
connect-src 'self' https://api.stripe.com https://api.anthropic.com;
frame-src https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
```

### Input Validation

- All API inputs validated with Zod schemas before processing
- File uploads: validate MIME type server-side (not just extension)
- SQL injection: not applicable (Prisma uses parameterized queries)
- XSS: React escapes by default; never use `dangerouslySetInnerHTML` without sanitization

---

## 5. Database Security

### No Public Exposure

PostgreSQL (whether Neon DB or self-hosted Docker) must never be reachable from the public internet.

- Neon DB: use private networking endpoint where available; restrict source IPs in Neon dashboard
- Docker PostgreSQL: only accessible on internal Docker network
- Connection string must use `sslmode=require` for Neon DB

### Access Control

- Create a dedicated DB user for the application with minimal permissions:

```sql
CREATE USER orthonoba_app WITH PASSWORD 'strong-random-password';
GRANT CONNECT ON DATABASE orthonoba TO orthonoba_app;
GRANT USAGE ON SCHEMA public TO orthonoba_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO orthonoba_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO orthonoba_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO orthonoba_app;
-- Never grant DROP, ALTER, TRUNCATE to application user
```

- A separate migration user (`orthonoba_migrate`) holds DDL privileges for `prisma migrate deploy`
- Backups use a read-only user (`orthonoba_backup`)

### Encrypted Connections

```
DATABASE_URL=postgresql://orthonoba_app:password@host/orthonoba?sslmode=require&sslcert=...
```

Verify SSL in use: `SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid();`

---

## 6. SSL/TLS

### Let's Encrypt Auto-Renewal

If managing SSL directly (not via Cloudflare):

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d orthonoba.app -d "*.orthonoba.app"
# Wildcard requires DNS challenge:
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d orthonoba.app -d "*.orthonoba.app"

# Verify auto-renewal timer
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

### TLS 1.2+ Only (Nginx)

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
```

### HSTS Preload

1. Ensure `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` is set
2. Submit at: `https://hstspreload.org/`
3. Estimated inclusion time: 1–3 months for Chrome/Firefox preload lists

---

## 7. Cloudflare Security

### WAF Managed Rules

In Cloudflare Dashboard → Security → WAF:

- Enable **OWASP Core Ruleset** (paranoia level 2 for SaaS)
- Enable **Cloudflare Managed Ruleset**
- Enable **Cloudflare Exposed Credentials Check**
- Block countries with no expected users (optional, use with caution for dental SaaS)

### DDoS Protection

- Cloudflare DDoS protection is automatic (L3/L4/L7)
- Enable **Under Attack Mode** if volumetric attack detected
- Rate limiting rules (Cloudflare → Security → Rate Limiting):
  - `/api/v1/auth/login`: max 10 req/min per IP → challenge
  - `/api/v1/files/upload`: max 20 req/min per IP → block
  - `/*`: max 500 req/min per IP → challenge

### Bot Score Rules

In Cloudflare → Security → Bots:

- Enable **Bot Fight Mode** (all plans) or **Super Bot Fight Mode** (Pro+)
- Challenge bot score < 30 on API routes
- Allow verified bots (Google, Bing) on marketing/landing pages
- Block automated scrapers on `/api/*`

### Zero Trust for Admin Paths

Use Cloudflare Access to gate sensitive paths:

- `https://orthonoba.app/api/v1/platform/*` → require email OTP for `@orthonoba.app` addresses
- Coolify admin panel → behind Cloudflare Access
- Uptime Kuma admin → behind Cloudflare Access

```
Cloudflare Dashboard → Access → Applications → Add Application
Type: Self-hosted
Domain: orthonoba.app
Path: /api/v1/platform
Policy: Email domain = orthonoba.app
```

### Additional Cloudflare Settings

- **Minimum TLS Version**: 1.2
- **Opportunistic Encryption**: On
- **Automatic HTTPS Rewrites**: On
- **Browser Integrity Check**: On
- **Email Address Obfuscation**: On (marketing pages)
- **Hotlink Protection**: On (protect storage assets)
- **Security Level**: Medium (raise to High or Under Attack if needed)

---

## 8. GDPR / HIPAA Considerations

### Data Residency — EU

- Neon DB: provision in `eu-central-1` (Frankfurt) or `eu-west` (Ireland)
- Hetzner Object Storage: Nuremberg or Helsinki data centers (EU)
- Anthropic API: data sent to Anthropic US — review DPA with Anthropic; use prompt caching to minimize tokens
- Resend email: EU data residency available — select EU region in dashboard
- Never store dental/patient data in US-only services without DPA

### Encryption at Rest

- Neon DB: encryption at rest enabled by default (AES-256)
- Hetzner Object Storage: server-side encryption (SSE-S3)
- Application secrets: stored in environment variables, never in DB or code
- Redis: enable `requirepass` and consider TLS (`rediss://`)

### Audit Logs

- Log all create/update/delete operations on Patient, DentalOrder, DentalScan records
- Include: `userId`, `tenantId`, `action`, `resourceType`, `resourceId`, `timestamp`, `ipAddress`
- Audit logs must be immutable (append-only, separate DB table or external log service)
- Retention: minimum 3 years for medical records (Spanish law LOPD/GDPR Article 30)

### Data Retention Policy

| Data Type | Retention | Basis |
|-----------|-----------|-------|
| Patient records | 5 years after last visit (Spain: Law 41/2002) | Legal obligation |
| Dental images/scans | 5 years | Legal obligation |
| Financial records (invoices) | 6 years | Spanish tax law |
| Marketing leads | 2 years after last contact | Legitimate interest |
| Server access logs | 12 months | Security / fraud |
| Application error logs | 90 days | Operational |

### Right to Erasure (GDPR Article 17)

- Implement a `DELETE /api/v1/patients/:id` endpoint that anonymizes (not hard-deletes) patient records
- Soft-delete: set `name='ANONYMIZED'`, `email=null`, `phone=null`, `nationalId=null`
- Retain DentalOrder records (legal obligation) but strip patient linkage
- Document the erasure procedure in privacy policy

### Consent Management

- Cookie banner required on marketing pages (orthonoba.app)
- Analytics (Google Analytics, Meta Pixel) only after explicit consent
- Use Cloudflare Zaraz or Cookiebot for consent management

### Privacy Policy & DPA

- Publish privacy policy at `https://orthonoba.app/legal/privacidad`
- Publish DPA (Data Processing Agreement) template for B2B tenants
- Sign DPAs with all sub-processors: Neon, Hetzner, Anthropic, Stripe, Resend, Meta

---

## 9. Incident Response

### Detection

Signs of a potential breach:
- Unusual API traffic patterns (spike in 401s, 403s from new IPs)
- Unexpected database queries or data exports
- New admin user created without authorization
- Stripe subscription anomalies
- Fail2ban reporting mass bans from same subnet

### Containment Checklist

- [ ] Enable Cloudflare "Under Attack Mode" immediately
- [ ] Rotate `JWT_SECRET` → invalidates all active sessions
- [ ] Rotate `DATABASE_URL` password → restarts DB connections
- [ ] Rotate `STRIPE_SECRET_KEY` in Stripe Dashboard
- [ ] Revoke and regenerate `ANTHROPIC_API_KEY`
- [ ] Block attacker IPs at Cloudflare → Security → IP Access Rules
- [ ] Take DB snapshot before any cleanup
- [ ] Disable affected tenant accounts if breach is tenant-specific

### Notification Obligations

Under GDPR Article 33, notify the data protection authority (AEPD in Spain) within **72 hours** of becoming aware of a breach if it poses a risk to individuals.

Under GDPR Article 34, notify affected data subjects if the breach poses a **high risk** to their rights and freedoms.

Contact: AEPD (Agencia Española de Protección de Datos) — `https://www.aepd.es`

### Post-Incident

- [ ] Root cause analysis documented
- [ ] Timeline of events recorded
- [ ] Remediation steps applied and verified
- [ ] Affected parties notified (if required)
- [ ] Security controls improved to prevent recurrence
- [ ] Lessons learned shared with team

---

## 10. Security Audit Schedule

| Frequency | Activity |
|-----------|----------|
| On every deploy | Run `npm audit` — fix criticals before deploying |
| Weekly | Review fail2ban logs; check Cloudflare security events |
| Monthly | Rotate non-critical secrets (API keys); review access logs; run `docker scout cves`; check SSL Labs score |
| Quarterly | Full dependency audit (`npm audit`, `trivy`); review UFW rules; test fail2ban jails; review Cloudflare WAF hit rates; review user access list (remove former team members) |
| Annually | External penetration test (engage a third-party security firm); full GDPR compliance review; review and update all DPAs; review and update this security guide |

### Tools

- `npm audit` — Node.js dependency vulnerabilities
- `trivy image orthonoba:latest` — Docker image CVE scan
- `SSL Labs` — `https://www.ssllabs.com/ssltest/`
- `SecurityHeaders.com` — `https://securityheaders.com/?q=orthonoba.app`
- `Mozilla Observatory` — `https://observatory.mozilla.org/analyze/orthonoba.app`
- `OWASP ZAP` — automated web application security scanner
- `fail2ban-client status` — active bans review
