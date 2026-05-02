---
name: Orthonoba authentication system
description: Auth implementation details — JWT cookies + Zustand persist, built 2026-05-02
type: project
---

Auth system implemented 2026-05-02. JWT sessions via jose stored in httpOnly cookies (7 days). Zustand persist for client-side state.

Key files:
- `src/lib/session.ts` — encrypt/decrypt JWT (edge-safe, no cookies)
- `src/lib/auth.ts` — createSession/deleteSession/getSession (uses cookies, server-only)
- `src/lib/dal.ts` — verifySession() (redirects to /login if invalid), getCurrentUser()
- `src/lib/mock-users.ts` — demo users (admin, dentist, assistant)
- `src/store/auth-store.ts` — Zustand with persist ('orthonoba-auth' key)
- `src/types/user.ts` — User, UserRole, SessionPayload types
- `src/middleware.ts` — route protection (protects /dashboard, /admin; redirects /login if authed)
- `src/app/actions/auth.ts` — loginAction, logoutAction Server Actions
- `src/components/ui/login-form.tsx` — client LoginForm with useActionState
- `src/components/ui/store-hydrator.tsx` — syncs Zustand with server session
- `src/components/ui/logout-button.tsx` — calls logoutAction + clears Zustand
- `app/(auth)/login/page.tsx` — /login route
- `app/dashboard/layout.tsx` — protected layout (calls verifySession)
- `app/dashboard/page.tsx` — dashboard home
- `.env.local` — SESSION_SECRET (must change in production)

Demo credentials: admin@orthonoba.app/admin123, dentist@orthonoba.app/dentist123

**Why:** Requested by user for full auth system with login/logout/session/route protection.
**How to apply:** When extending auth (e.g., adding register), follow this same pattern.
