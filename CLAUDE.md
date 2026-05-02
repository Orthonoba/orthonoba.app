# ORTHONOBA — CLAUDE.md

## Stack

- Next.js 16.2.4 (App Router) — React 19, TypeScript strict
- Zustand 5.x con `persist` middleware
- TailwindCSS v4 (`@tailwindcss/postcss`)
- jose (JWT signing, edge-safe)
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
  dashboard/page.tsx
  admin/                       ← panel de administración
  api/
    auth/route.ts
    clinics/route.ts
    orders/route.ts
    pickups/route.ts
    plans/route.ts
    users/route.ts
    webhooks/stripe/route.ts
  marketing/layout.tsx, page.tsx
  layout.tsx, page.tsx

src/                           ← Toda la lógica, tipos, config, stores, hooks
  middleware.ts                ← subdominio + guard sesión + headers tenant
  app/
    actions/auth.ts            ← loginAction, logoutAction  ('use server')
  store/
    auth-store.ts              ← persist 'orthonoba-auth' | AuthStatus state machine
    clinic-store.ts            ← persist 'orthonoba-clinic' | TenantContext
    ui-store.ts                ← estado sidebar (sin persist)
  types/
    user.ts                    ← User, UserRole, UserStatus, SessionPayload, UserInvite
    clinic.ts                  ← Clinic, TenantContext, PlanTier, Address,
                                  BusinessHours, ClinicSettings, ClinicModule,
                                  ClinicIntegration
    lab.ts                     ← LabProfile, LabTechnician, LabMaterial,
                                  LabWorkstation, LabProductionSlot
    patient.ts                 ← Patient, MedicalHistory, Odontogram,
                                  Appointment, TreatmentPlan, ClinicalNote, ToothFDI
    orders.ts                  ← DentalOrder, OrderFile, CadDesign, PickupRequest,
                                  ShipmentTracking, ProductionStage, QualityCheckResult
    billing.ts                 ← Invoice, Payment, Quote, CreditNote,
                                  Subscription, TaxRate, PaymentLink
    marketing.ts               ← Campaign, Lead, UTMParams, ReviewRequest,
                                  ReferralProgram, SeoSnapshot
    order.ts                   ← OBSOLETO — no extender, usar orders.ts
  lib/
    session.ts                 ← encrypt/decrypt JWT (jose, edge-safe, sin cookies)
    auth.ts                    ← createSession / deleteSession / getSession (server-only)
    auth-service.ts            ← IAuthService + MockAuthService singleton (swappable)
    dal.ts                     ← verifySession, getCurrentUser, getTenantContext,
                                  verifyTenantAccess, checkPermission, requirePermission
    route-guard.ts             ← canAccess(), getRedirectUrl() — lógica pura sin Next.js
    mock-users.ts              ← usuarios demo (sustituir por query DB)
    mock-clinics.ts            ← clínicas demo (sustituir por query DB)
    db.ts                      ← stub cliente Neon DB (no conectado)
  config/
    permissions.ts             ← tipo Permission (15 permisos)
    roles.ts                   ← rolePermissions, roleLabels, hasPermission()
    site.ts                    ← siteConfig (baseDomain, devBaseDomain, subdomains)
    plans.ts                   ← planes free | pro | enterprise
    navigation.ts, theme.ts    ← configuración navegación y tema
  hooks/
    use.Role.ts                ← useRole() → { role, can, is, isAdmin }
    use.Plan.ts                ← usePlan() → { plan, hasAccess, isPro, isEnterprise }
    useLocale.ts               ← useLocale() → 'es' | 'en' | 'pt'
  components/
    ui/                        ← button, input, card, badge, modal (primitivos)
    ui/login-form.tsx          ← useActionState + loginAction
    ui/store-hydrator.tsx      ← sincroniza user servidor → Zustand
    ui/logout-button.tsx
    navbar/navbar.tsx
    sidebar/sidebar.tsx
    layouts/dashboard-shell.tsx
    layouts/marketing-shell.tsx
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

### Generación de Código
- Colocar cada archivo en su carpeta de módulo correcta
- Extender código existente antes de reescribir
- No crear carpetas duplicadas sin instrucción explícita

---

## Roles y Permisos

**15 permisos**: `patients.read/write/delete` · `orders.read/write/delete` ·
`billing.read/write` · `files.upload/read/delete` · `clinic.manage` ·
`lab.manage` · `staff.manage` · `cad.access`

| Rol | Estado | Acceso |
|---|---|---|
| `admin` | ✅ implementado | `*` todo |
| `dentist` | ✅ implementado | patients rw · orders rw · billing.read · files r+upload · cad |
| `assistant` | ✅ implementado | patients.read · orders.read · files.read |
| `lab` | ✅ implementado | orders rw · files r+upload · lab.manage · cad |
| `clinic_owner` | 🔲 pendiente | admin limitado a un solo tenant |
| `lab_user` | 🔲 pendiente | renombrar `lab` → `lab_user` |
| `marketing_manager` | 🔲 pendiente | acceso módulo marketing |

Para añadir un rol: `src/types/user.ts` → `src/config/roles.ts` → `src/lib/route-guard.ts`

---

## Alcance Funcional

Ver `src/docs/skills.md` — es la fuente de verdad para el mapa de features.
No duplicar el listado de módulos en este archivo.
