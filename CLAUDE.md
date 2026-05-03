# ORTHONOBA — CLAUDE.md

## Stack

- Next.js 16.2.4 (App Router) — React 19, TypeScript strict
- Zustand 5.x con `persist` middleware
- TailwindCSS v4 (`@tailwindcss/postcss`)
- jose (JWT signing, edge-safe)
- Stripe SDK v22 (`2026-04-22.dahlia`) — billing + subscriptions
- Zod v4 — `z.record(keyType, valueType)` obligatorio, `.regex(re, msg)` con mensaje
- Mock data — DB no conectada, preparada para Neon DB
- Sin ORM ni proveedor de auth externo

---

## Path Alias

`"@/*": ["./*"]` — la raíz es la carpeta del proyecto, **no** `src/`.

```
@/src/lib/dal      ✓      @/lib/dal      ✗
@/src/types/user   ✓      @/types/user   ✗
```

---

## Mapa de Directorios

```
app/                           ← Rutas Next.js únicamente (no lógica aquí)
  (auth)/login/page.tsx        ← /login
  dashboard/layout.tsx         ← verifySession() + StoreHydrator
  api/v1/
    auth/login · logout · me
    clinics/[clinicId]
    orders/[orderId]
    patients/[patientId]
    labs/[labId]
    cases/[caseId]
    doctors/[doctorId]
    files/upload
    plans/                     ← GET catálogo público de planes
    billing/                   ← GET subscription + invoices
      subscriptions · upgrade · cancel · portal · coupons · invoices
    stripe/checkout · webhooks
    webhooks/stripe             ← endpoint canónico webhooks
    marketing/
      campaigns/[id]/metrics
      leads/[id]/score · convert
      seo/[slug]
      google-ads · meta-ads
      landing-pages · funnels/[id]/submit
      social/posts · social/schedule
      templates · reviews · referrals/[id]/link
      analytics
    courses/                   ← Orthonoba Academy (LMS)
      categories · my
      [courseId]/
        enroll · progress · certificate · students · analytics
        sections/[sectionId]/lessons
        lessons/[lessonId]/complete · quiz · quiz/submit
    certificates/[certId]      ← verificación pública de certificados
    instructors/               ← gestión de instructores

src/                           ← Toda la lógica, tipos, config, stores, hooks
  middleware.ts                ← subdominio + guard sesión + headers tenant
  app/
    actions/auth.ts            ← loginAction, logoutAction  ('use server')
  store/
    auth-store.ts              ← persist 'orthonoba-auth' | AuthStatus state machine
    clinic-store.ts            ← persist 'orthonoba-clinic' | TenantContext
    ui-store.ts                ← estado sidebar (sin persist)
  types/
    user.ts                    ← User, UserRole (6 roles), UserStatus, SessionPayload
    clinic.ts                  ← Clinic, TenantContext, PlanTier, Address, BusinessHours,
                                  ClinicSettings, ClinicModule, ClinicIntegration
    lab.ts                     ← LabProfile, LabTechnician, LabMaterial, LabWorkstation
    delivery.ts                ← PickupJob, DeliveryDriver, DeliveryRoute,
                                  DriverLocationUpdate, DeliveryRouteStop
    tracking.ts                ← TrackingEvent, OrderTimeline, OrderTrackingKPIs
    patient.ts                 ← Patient, MedicalHistory, Odontogram,
                                  Appointment, TreatmentPlan, ClinicalNote, ToothFDI
    orders.ts                  ← DentalOrder, OrderFile, CadDesign, PickupRequest,
                                  ShipmentTracking, ProductionStage, QualityCheckResult
    billing.ts                 ← Invoice, Payment, Quote, CreditNote, Subscription,
                                  TaxRate, PaymentLink, Coupon, BillingCycle,
                                  TokenBalance, TokenTransaction, UsageRecord
    marketing.ts               ← Campaign, Lead, GoogleAdsCampaign, MetaCampaign,
                                  LandingPage, LeadFunnel, LeadScore, SocialPost,
                                  MarketingTemplate, MarketingDashboardKPIs
    academy.ts                 ← Course, Lesson, CourseSection, Instructor, Quiz,
                                  CourseEnrollment, LessonProgress, Certificate,
                                  CourseReview, LiveSession, AcademyDashboardKPIs
    order.ts                   ← OBSOLETO — no extender, usar orders.ts
  lib/
    session.ts                 ← encrypt/decrypt JWT (jose, edge-safe, sin cookies)
    auth.ts                    ← createSession / deleteSession / getSession (server-only)
    auth-service.ts            ← IAuthService + MockAuthService singleton (swappable)
    dal.ts                     ← verifySession, getCurrentUser, getTenantContext,
                                  verifyTenantAccess, checkPermission, requirePermission
    route-guard.ts             ← canAccess(), getRedirectUrl() — lógica pura sin Next.js
    mock-users.ts              ← usuarios demo (sustituir por query DB)
    mock-clinics.ts            ← clínicas demo: plan=starter/growth/enterprise
    db.ts                      ← stub cliente Neon DB (no conectado)
  services/
    stripe/index.ts            ← lazy Stripe client proxy (edge-safe)
    stripe/billing.ts          ← checkout, portal, changePlan, previewPlanChange
    stripe/webhooks.ts         ← verifySignature + 15 event handlers
    stripe/coupons.ts          ← validate, apply, create promotion codes
  modules/
    billing/
      service.ts               ← IBillingService interface
      validators.ts            ← Zod: checkout, upgrade, cancel, coupon, portal
      subscription-store.ts    ← in-memory sub store (swap → Neon DB)
    marketing/
      service.ts               ← IMarketingService interface
      validators.ts            ← Zod: lead, campaign, SEO, Google Ads, Meta Ads…
      lead-store.ts            ← CRUD leads + actividades + scoring automático
      lead-scoring.ts          ← motor puro: score 0–100, grade A/B/C/D
      campaign-store.ts        ← campaigns, funnels, landing pages, social, reviews
    academy/
      validators.ts            ← Zod: course, lesson, quiz, enrollment, instructor
      course-store.ts          ← courses, sections, lessons, quizzes, instructors
      enrollment-store.ts      ← enrollments, progress, quiz attempts, certificates
    orders/
      service.ts               ← IOrderService interface
      repository.ts            ← IOrderRepository + IPickupRepository
    files/
      service.ts               ← IFileService, MAX_FILE_SIZES, ALLOWED_FILE_TYPES
  config/
    permissions.ts             ← Permission type (marketing.* + academy.* incluidos)
    roles.ts                   ← rolePermissions, roleLabels, hasPermission()
    site.ts                    ← siteConfig (baseDomain, devBaseDomain, subdomains)
    plans.ts                   ← PlanConfig, PLANS, getStripePriceId, TOKEN_ALLOCATIONS
                                  Starter | Growth | Scale | Enterprise
    marketing.ts               ← DENTAL_TREATMENTS (13), LEAD_SCORING_RULES,
                                  buildDentistSchema, buildFAQSchema, DENTAL_HASHTAGS
    academy.ts                 ← ACADEMY_CATEGORIES (8), PLAN_ACADEMY_ACCESS,
                                  canAccessCourse, CERTIFICATE_TEMPLATES
    navigation.ts, theme.ts    ← configuración UI
  hooks/
    use.Role.ts                ← useRole() → { role, can, is, isAdmin }
    use.Plan.ts                ← usePlan() → { plan, hasAccess, isGrowth, isScale }
    useLocale.ts               ← useLocale() → 'es' | 'en' | 'pt'
  components/
    ui/                        ← button, input, card, badge, modal (primitivos)
    ui/login-form.tsx · store-hydrator.tsx · logout-button.tsx
    navbar/navbar.tsx
    sidebar/sidebar.tsx
    layouts/dashboard-shell.tsx · marketing-shell.tsx
  styles/
    globals.css, variables.css, theme.css
  docs/skills.md               ← mapa funcional canónico (fuente de verdad de alcance)
```

---

## Reglas de Arquitectura

### Rutas vs Lógica
- `app/` → solo rutas, layouts, páginas, handlers API
- `src/` → toda la lógica, tipos, config, stores, hooks, componentes
- Server Actions → `src/app/actions/`, nunca inline en páginas
- Rutas API → `app/api/` (raíz), **no** `src/app/api/`

### Flujo Auth
1. `middleware.ts` descifra JWT cookie → llama `getRedirectUrl()` (lógica pura)
2. Layout llama `verifySession()` desde `src/lib/dal.ts` como segunda barrera
3. `StoreHydrator` sincroniza user resuelto servidor → Zustand cliente
4. Nunca llamar `authService` desde una página — usar Server Actions o DAL

### Tenant Multi-tenant
- Middleware inyecta headers: `x-clinic-id`, `x-clinic-name`, `x-clinic-type`, `x-subdomain`
- Leer tenant en Server Components vía `getTenantContext()` / `getCurrentClinic()` (DAL)
- Todo write de datos debe incluir `clinicId`
- Producción: `{subdomain}.orthonoba.app` | Dev: `{subdomain}.localhost` o `{subdomain}.lvh.me`

### Zustand
- Stores = estado reactivo UI únicamente, sin lógica de negocio
- Verdad del servidor → Zustand vía `StoreHydrator`, no vía fetch cliente
- Usar `useRole()` y `usePlan()` para control de acceso

### Tipos
- Usar `src/types/orders.ts` — nunca extender `src/types/order.ts` (obsoleto)
- Preferir `interface` sobre `type` para entidades
- Nunca usar `any` — usar `unknown` + narrowing

### Mock Data
- No conectar DB real. `src/lib/db.ts` permanece como stub
- Al integrar Neon DB: sustituir lookups en `mock-users.ts` / `mock-clinics.ts`
- `authService` diseñado para swap: `MockAuthService` → `ApiAuthService`

### Zod v4 — reglas críticas
- `z.record(z.string(), z.string())` — siempre dos argumentos (keyType, valueType)
- `z.string().regex(/pattern/, 'mensaje')` — mensaje obligatorio
- `z.record(z.string(), z.unknown())` para `Record<string, unknown>`

### Stripe SDK v22 (`2026-04-22.dahlia`) — breaking changes
- `current_period_start/end` → ahora en `subscription.items.data[0]`
- `retrieveUpcoming` → eliminado, usar `invoices.createPreview()`
- `PromotionCode.coupon` → ahora en `promoCode.promotion.coupon`
- `PromotionCode.create({ promotion: { coupon: id, type: 'coupon' } })` — nuevo formato

---

## Roles y Permisos

**Permisos activos**: `patients.*` · `orders.*` · `billing.*` · `files.*` · `cad.*` ·
`clinic.*` · `lab.*` · `staff.*` · `reports.*` · `marketing.*` · `academy.*` · `platform.*`

| Rol | Estado | Acceso clave |
|---|---|---|
| `super_admin` | ✅ | `*` todo |
| `clinic_admin` | ✅ | patients rw · orders rw · billing rw · marketing · academy manage |
| `lab_admin` | ✅ | orders rw · files · lab · billing |
| `doctor` | ✅ | patients rw · orders rw · billing.read · cad · academy enroll |
| `staff` | ✅ | patients rw · orders.read · billing.read · academy enroll |
| `instructor` | ✅ | academy manage · academy instruct · academy certificates |

Para añadir un rol: `src/types/user.ts` → `src/config/roles.ts` → `src/lib/route-guard.ts`

---

## Planes SaaS

| Plan | €/mes | Tokens/mes | Academy access |
|------|-------|-----------|----------------|
| Starter | €49 | 500 | Cursos free |
| Growth | €149 | 2,000 | Free + Growth |
| Scale | €399 | 8,000 | Free + Growth + Scale |
| Enterprise | Custom | ∞ | Todo |

Env vars Stripe: `STRIPE_PRICE_{STARTER,GROWTH,SCALE,ENTERPRISE}_{MONTHLY,ANNUAL}`

---

## Academy — Orthonoba LMS

**8 categorías**: Exocad · Dental Marketing · Sleep Dentistry · Web Design ·
AI Automation · Clinical Skills · Practice Management · Orthodontics

**Acceso**: `canAccessCourse(planTier, accessLevel)` en `src/config/academy.ts`

**Flujo de certificado**:
1. Alumno completa ≥90% lecciones → `checkCourseCompletion()` automático
2. O alumno llama `GET /courses/:id/certificate` manualmente
3. Certificado emitido con `verificationId` UUID público
4. Verificación pública: `GET /api/v1/certificates/:verificationId`

**Stores en memoria** (swap → Neon DB):
- `course-store.ts` → courses, sections, lessons, quizzes, instructors
- `enrollment-store.ts` → enrollments, lessonProgress, quizAttempts, certificates

---

## Marketing Engine

**Lead scoring**: 0–100 pts, grade A/B/C/D — `src/modules/marketing/lead-scoring.ts`

**Stores en memoria** (swap → Neon DB):
- `lead-store.ts` → leads + actividades + re-scoring automático
- `campaign-store.ts` → campaigns, landing pages, funnels, social, reviews, referrals

**Funnel submit** (`POST /funnels/:id/submit`) — endpoint público, crea lead automáticamente

---

## Alcance Funcional

Ver `src/docs/skills.md` — fuente de verdad para el mapa de features.
