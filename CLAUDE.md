# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Routing Structure — Placeholder Pages

Páginas placeholder creadas (solo routing, sin lógica de negocio):

| Ruta URL | Archivo |
|----------|---------|
| `/orders/new` | `app/(dashboard)/orders/new/page.tsx` |
| `/stl-upload` | `app/(dashboard)/stl-upload/page.tsx` |
| `/stl-library` | `app/(dashboard)/stl-library/page.tsx` |
| `/cad-design` | `app/(dashboard)/cad-design/page.tsx` |
| `/cad-design/exocad` | `app/(dashboard)/cad-design/exocad/page.tsx` |
| `/cad-design/jobs` | `app/(dashboard)/cad-design/jobs/page.tsx` |
| `/marketing` | `app/(dashboard)/marketing/page.tsx` |
| `/marketing/whatsapp` | `app/(dashboard)/marketing/whatsapp/page.tsx` |
| `/marketing/email` | `app/(dashboard)/marketing/email/page.tsx` |
| `/settings/team` | `app/(dashboard)/settings/team/page.tsx` |
| `/ai-automation` | `app/(dashboard)/ai-automation/page.tsx` |
| `/ai-automation/workflows` | `app/(dashboard)/ai-automation/workflows/page.tsx` |
| `/ai-automation/n8n` | `app/(dashboard)/ai-automation/n8n/page.tsx` |
| `/ai-automation/agents` | `app/(dashboard)/ai-automation/agents/page.tsx` |
| `/cases/files` | `app/(dashboard)/cases/files/page.tsx` |
| `/pricing` | `app/pricing/page.tsx` (pública, sin route group) |

**Notas:**
- Todas las páginas `(dashboard)` heredan el layout con sidebar/topbar desde `app/(dashboard)/layout.tsx`
- `app/marketing/page.tsx` (que retornaba `null`) fue eliminado para evitar conflicto de rutas
- `marketing/leads/page.tsx` ya existía con contenido real (Kanban) — no modificada
- `components/footer.tsx` creado con links a las 4 páginas legales
- Footer integrado en `app/page.tsx` (home pública)

---

## UI Minimal Layer (Home)

Archivos creados (solo estructura visual base, sin lógica de negocio):

| Archivo | Propósito |
|---|---|
| `components/navbar.tsx` | Navbar marketing: logo + links + CTA "Solicitar demo" |
| `components/hero.tsx` | Hero section: H1 + subtitle + 2 CTAs |
| `app/page.tsx` | Home page: `<Navbar /> + <main><Hero /></main>` |
| `app/layout.tsx` | Root layout: html/body + Geist fonts + metadata |

**Decisión arquitectónica:** Navbar está en `app/page.tsx` (no en `app/layout.tsx`) para no afectar el dashboard (`app/(dashboard)/layout.tsx`) ni la auth (`app/(auth)/layout.tsx`), que tienen sus propios layouts de pantalla completa.

**Backend-first continúa:** Esta capa de presentación no toca lógica de negocio, APIs, ni stores. Es solo la fachada mínima del home público.

---

## Dashboard UI Layer

Capa visual profesional tipo SaaS para `/dashboard`. **Solo presentación — sin lógica de negocio, sin fetch, sin estado global.**

| Archivo | Propósito |
|---|---|
| `components/dashboard/sidebar.tsx` | Sidebar fija izquierda · `'use client'` · `usePathname` para active state · 10 links estáticos |
| `components/dashboard/topbar.tsx` | Header superior · título + placeholder usuario "Admin" |
| `components/dashboard/stat-card.tsx` | KPI card reutilizable · props: `label`, `value`, `sub`, `trend`, `color` |
| `components/dashboard/activity-feed.tsx` | Feed de actividad reciente · datos hardcoded · lista con dot-indicator |
| `components/dashboard/recent-orders.tsx` | Tabla de órdenes recientes · datos hardcoded · badge de estado por color |
| `app/dashboard/layout.tsx` | Layout `/dashboard` · mantiene `verifySession()` + `StoreHydrator` (seguridad) · usa nuevos componentes visuales |
| `app/dashboard/page.tsx` | Página principal hardcoded · grid: KPIs arriba · RecentOrders + ActivityFeed abajo |

**Datos hardcoded de ejemplo:**
- 124 pacientes · 32 casos activos · €12,400 revenue · 18 nuevos leads
- 5 órdenes recientes con estados (En producción / Revisión / Completado / Pendiente)
- 5 entradas de actividad (paciente registrado / orden creada / STL subido / lead Meta / factura)

**Preparado para integrar con:**
- CRM → swap `activity-feed` con feed real de `src/modules/marketing/lead-store`
- Orders → swap `recent-orders` con query a `src/modules/orders`
- KPIs → swap `stat-card` hardcoded con datos de `src/services/dashboard/*`
- AI → añadir badge de estado IA desde `isAIEnabled()` en topbar

---

## Comandos esenciales

```bash
npm run dev          # Dev server → http://localhost:3000 (Turbopack)
npm run build        # Build de producción
npm run lint         # ESLint sobre todo el proyecto
npx tsc --noEmit     # Verificación TypeScript sin compilar
```

**Objetivo de calidad:** `tsc --noEmit` y `eslint` deben terminar con 0 errores antes de cada commit. Los 16 warnings de `no-console` en `src/services/stripe/webhooks.ts` son intencionados (logs de eventos Stripe).

---

## Stack

| Tecnología | Versión | Nota |
|---|---|---|
| Next.js | 16.2.4 | App Router + Turbopack |
| React | 19 | Server Components por defecto |
| TypeScript | strict | `noImplicitReturns`, `noFallthroughCasesInSwitch` |
| TailwindCSS | v4 | `@tailwindcss/postcss` — usar `bg-linear-to-br` NO `bg-gradient-to-br` |
| Zustand | 5.x | `persist` middleware |
| jose | edge-safe | JWT signing sin Node.js APIs |
| Stripe SDK | v22 `2026-04-22.dahlia` | Breaking changes — ver sección Stripe |
| Zod | v4 | `z.record(keyType, valueType)` obligatorio |
| Sonner | — | Toasts: `toast.success/error/info/warning` |
| lucide-react | — | Todos los iconos — sin `Tooth`, sin `bg-gradient-to-br` |

---

## Path Alias

```
"@/*": ["./*"]  — raíz = carpeta del proyecto, NO src/
```

```
@/src/lib/dal   ✓     @/lib/dal    ✗
@/src/types/user ✓    @/types/user ✗
```

---

## Estructura de rutas

```
app/                             ← Next.js App Router (solo rutas, sin lógica)
  (auth)/                        ← Route group auth — NO añade segmento a la URL
    layout.tsx                   ← Fondo dark + glassmorphism
    login/page.tsx               → /login
    register/page.tsx            → /register
    forgot-password/page.tsx     → /forgot-password
    verify/page.tsx              → /verify

  (dashboard)/                   ← Route group dashboard — NO añade segmento a la URL
    layout.tsx                   ← Sidebar + topbar (dark mode) — rutas: /X
    clinics/page.tsx             → /clinics
    clinics/new/page.tsx         → /clinics/new
    clinics/[id]/page.tsx        → /clinics/:id
    clinics/[id]/cases/          → /clinics/:id/cases
    clinics/[id]/patients/       → /clinics/:id/patients
    clinics/[id]/settings/       → /clinics/:id/settings
    cases/page.tsx               → /cases
    cases/new/page.tsx           → /cases/new
    cases/[id]/page.tsx          → /cases/:id
    cases/[id]/files/page.tsx    → /cases/:id/files
    cases/[id]/notes/page.tsx    → /cases/:id/notes
    patients/page.tsx            → /patients
    patients/new/page.tsx        → /patients/new
    patients/[id]/page.tsx       → /patients/:id
    doctors/page.tsx             → /doctors
    doctors/[id]/page.tsx        → /doctors/:id
    orders/page.tsx              → /orders
    orders/[id]/page.tsx         → /orders/:id
    labs/page.tsx                → /labs
    labs/[id]/page.tsx           → /labs/:id
    courses/page.tsx             → /courses
    courses/new/page.tsx         → /courses/new
    courses/[id]/page.tsx        → /courses/:id
    courses/[id]/lessons/[lessonId]/page.tsx → /courses/:id/lessons/:lessonId
    courses/[id]/students/page.tsx → /courses/:id/students
    automation/page.tsx          → /automation
    automation/rules/page.tsx    → /automation/rules
    automation/reminders/page.tsx → /automation/reminders
    marketing/leads/page.tsx     → /marketing/leads
    marketing/campaigns/page.tsx → /marketing/campaigns
    marketing/funnels/page.tsx   → /marketing/funnels
    marketing/analytics/page.tsx → /marketing/analytics
    ai/page.tsx                  → /ai
    billing/page.tsx             → /billing
    billing/invoices/page.tsx    → /billing/invoices
    billing/plans/page.tsx       → /billing/plans
    admin/users/page.tsx         → /admin/users
    admin/roles/page.tsx         → /admin/roles
    settings/page.tsx            → /settings
    settings/profile/page.tsx    → /settings/profile
    settings/security/page.tsx   → /settings/security
    settings/api-keys/page.tsx   → /settings/api-keys
    executive/page.tsx           → /executive
    sitemap/page.tsx             → /sitemap
    files/stl/page.tsx           → /files/stl

  dashboard/                     ← Ruta explícita legacy
    layout.tsx                   → /dashboard (main dashboard por rol)
    page.tsx                     → /dashboard

  api/v1/                        ← Todos los endpoints REST
    auth/login · logout · me
    billing/ · stripe/ · webhooks/stripe
    ai/ · automation/ · notifications/
    courses/ · certificates/ · instructors/
    clinics/ · patients/ · orders/ · labs/ · cases/ · doctors/ · files/
    dashboard/ · marketing/ · plans/

src/                             ← Toda la lógica, nunca rutas aquí
  middleware.ts                  ← Subdomain + session guard + tenant headers
  app/actions/auth.ts            ← loginAction, logoutAction ('use server')
  store/                         ← Zustand: auth-store, clinic-store, ui-store
  types/                         ← Tipos globales (usar orders.ts, NO order.ts)
  lib/                           ← session, auth, dal, route-guard, mock-*
  services/                      ← ai/, whatsapp/, automation/, dashboard/, email/, stripe/
  modules/                       ← billing/, marketing/, academy/, dashboard/, automation/, orders/, files/
  config/                        ← permissions, roles, site, plans, marketing, academy
  hooks/                         ← useRole, usePlan, useLocale
  components/                    ← ui/, sidebar/, layouts/
```

---

## Reglas de arquitectura

### Routing crítico
- `app/(dashboard)/layout.tsx` — hrefs deben ser `/X` (sin prefijo `/dashboard/`) porque el route group no añade segmento
- `app/dashboard/page.tsx` — es la ÚNICA ruta que usa `/dashboard` como URL
- Nunca mezclar rutas `(dashboard)` con `dashboard/` — son namespaces distintos

### Lógica App vs Src
- `app/` → solo rutas, layouts, páginas, API handlers
- `src/` → toda la lógica, tipos, stores, hooks, componentes, servicios
- Server Actions → `src/app/actions/`, nunca inline en páginas
- No llamar `authService` desde páginas — usar Server Actions o DAL

### Auth flow
1. `src/middleware.ts` descifra JWT cookie → `getRedirectUrl()` (lógica pura)
2. Layout llama `verifySession()` desde `src/lib/dal.ts` (segunda barrera)
3. `StoreHydrator` sincroniza user server → Zustand client
4. Hooks `useRole()` / `usePlan()` para control de acceso en cliente

### Tenant multi-tenant
- Middleware inyecta: `x-clinic-id`, `x-clinic-name`, `x-clinic-type`, `x-subdomain`
- Leer en Server Components: `getTenantContext()` / `getCurrentClinic()` (DAL)
- Todo write debe incluir `clinicId`
- Prod: `{sub}.orthonoba.app` | Dev: `{sub}.localhost` o `{sub}.lvh.me`

### Zustand
- Stores = estado UI reactivo únicamente (no lógica de negocio)
- Verdad del servidor → Zustand vía `StoreHydrator`, no vía fetch cliente

### Componentes `'use client'`
- Usar solo cuando hay interactividad real (useState, event handlers, refs)
- Server Components por defecto para páginas de solo lectura
- `loading.tsx` + `error.tsx` en cada directorio de ruta

### Anti-patrones ESLint activos
- `no-alert` → usar `toast` de Sonner o dialog de estado (nunca `window.confirm/alert`)
- `react-hooks/set-state-in-effect` → usar lazy initializers `useState(() => ...)` o mover lógica a event handlers
- `@next/next/no-html-link-for-pages` → siempre `<Link>` de next/link, nunca `<a href>`
- `@typescript-eslint/no-unused-vars` → prefix `_` para vars intencionalmente no usadas

---

## TailwindCSS v4 — cambios importantes

```
bg-gradient-to-br → bg-linear-to-br   (CSS moderno)
flex-shrink-0     → shrink-0
flex-grow         → grow
```

---

## Roles y permisos

| Rol | Acceso clave |
|---|---|
| `super_admin` | `*` todo + `/executive` |
| `clinic_admin` | patients/orders/billing/marketing/academy manage |
| `lab_admin` | orders/files/lab/billing |
| `doctor` | patients/orders/cad/academy enroll |
| `staff` | patients.read/orders.read/billing.read |
| `instructor` | academy manage/instruct/certificates |

Para añadir un rol: `src/types/user.ts` → `src/config/roles.ts` → `src/lib/route-guard.ts`

---

## Planes SaaS

| Plan | €/mes | Tokens/mes | Academy |
|---|---|---|---|
| Starter | €49 | 500 | Free |
| Growth | €149 | 2.000 | Free + Growth |
| Scale | €399 | 8.000 | Free + Growth + Scale |
| Enterprise | Custom | ∞ | Todo |

Env vars Stripe: `STRIPE_PRICE_{STARTER,GROWTH,SCALE,ENTERPRISE}_{MONTHLY,ANNUAL}`

---

## Stripe SDK v22 (`2026-04-22.dahlia`) — breaking changes

- `current_period_start/end` → en `subscription.items.data[0]`
- `retrieveUpcoming` → eliminado, usar `invoices.createPreview()`
- `PromotionCode.coupon` → ahora `promoCode.promotion.coupon`
- `PromotionCode.create({ promotion: { coupon: id, type: 'coupon' } })`

---

## Zod v4 — reglas críticas

- `z.record(z.string(), z.unknown())` — siempre dos argumentos
- `z.string().regex(/pattern/, 'mensaje')` — mensaje obligatorio
- Nunca `z.record(z.string())` (solo un arg)

---

## AI Provider pattern

```
ANTHROPIC_API_KEY set    → ClaudeProvider (claude-sonnet-4-6 + prompt caching)
ANTHROPIC_API_KEY absent → RuleEngineProvider (determinístico, 0 tokens)
```

`getAIProvider()` en `src/services/ai/provider.ts` — punto de swap único.

Engines: `lead-qualifier.ts` · `campaign-advisor.ts` · `order-predictor.ts` · `retention-engine.ts`

---

## Mock Data → Neon DB (swap points)

- `src/lib/mock-users.ts` → sustituir por query DB
- `src/lib/mock-clinics.ts` → sustituir por query DB
- `src/lib/db.ts` → stub cliente Neon (no conectado)
- Todos los `*-store.ts` en `src/modules/` → swap a Neon queries
- `authService` → swap `MockAuthService` → `ApiAuthService`

---

## WhatsApp + Automatización

```
WHATSAPP_TOKEN + WHATSAPP_PHONE_ID → Meta Cloud API v19
Sin credenciales → MockWhatsAppService (console.log)
WHATSAPP_VERIFY_TOKEN → secret para webhook verification
```

Disparador: `dispatchTrigger(clinicId, trigger, entityId, data)` en `src/services/automation/rule-engine.ts`

---

## Meta Lead Ads Webhook

Endpoint: `app/api/v1/webhooks/meta/route.ts`

```
GET  /api/v1/webhooks/meta  → verificación Meta (hub.mode + hub.verify_token + hub.challenge)
POST /api/v1/webhooks/meta  → recibir leads de Facebook Ads / Instagram Ads
```

**Flujo de lead entrante:**
1. Meta POST → verificar `X-Hub-Signature-256` con `META_APP_SECRET`
2. Extraer `field_data[]` (full_name, email, phone_number)
3. Deduplicación por email via `listLeads(clinicId, { search: email })`
4. `createLead()` → `src/modules/marketing/lead-store.ts` (status: `'new'`, source: `'facebook'`)
5. `dispatchTrigger(clinicId, 'lead.created', ...)` → activa reglas de automatización

**Env vars:**
```
META_VERIFY_TOKEN       → token que Meta valida en GET
META_APP_SECRET         → firma HMAC-SHA256 de cada POST (vacío = skip en dev)
META_ACCESS_TOKEN       → para llamar Graph API (no usado aún)
META_DEFAULT_CLINIC_ID  → clinicId destino hasta que haya mapeo page_id → clinic en DB
```

**Field aliases soportados:**
- Nombre: `full_name`, `name`, `nombre`, `first_name`, `nombre_completo`
- Email: `email`, `correo`, `email_address`
- Teléfono: `phone_number`, `phone`, `telefono`, `mobile`, `celular`

**Pendiente (swap point):**
- Mapeo `page_id → clinicId` en DB para soporte multi-tenant real
- Llamada a Graph API para obtener placement (FB vs IG) y actualizar `source`
- WhatsApp welcome message en `handleNewLead()`

---

## Escalabilidad multi-país

- Locale: `useLocale()` → `'es' | 'en' | 'pt'` (lazy init desde cookie)
- Moneda: todo en EUR cents internamente; formatear con `Intl.NumberFormat`
- Subdomain por tenant: `{clinicId}.orthonoba.app`
- JWT edge-safe (jose) — compatible con Cloudflare Workers / Vercel Edge

---

## Tipos — reglas

- `src/types/orders.ts` ✓ — `src/types/order.ts` ✗ (OBSOLETO)
- Preferir `interface` sobre `type` para entidades
- Nunca `any` — usar `unknown` + narrowing
- Tipos de `src/types/dashboard.ts`: `ClinicDashboard`, `LabDashboard`, `FinanceDashboard`, `ExecutiveReport`, `KPIValue`, `MRRBreakdown`
