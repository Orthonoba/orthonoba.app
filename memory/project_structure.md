---
name: Orthonoba project structure
description: Critical architectural facts about the Orthonoba Next.js 16 project — which directories are active and where things live
type: project
---

Next.js 16 uses the ROOT `app/` directory (not `src/app/`) for routes. Both exist but only root `app/` is served.

- Routes (pages, layouts): `app/` (root)
- Middleware: `src/middleware.ts`
- Zustand stores: `src/store/`
- Types: `src/types/`
- Lib utilities: `src/lib/`
- Components: `src/components/` (sub-dirs: navbar/, layouts/, sidebar/, ui/)
- Server Actions: `src/app/actions/` (NOT route files, just 'use server' files)
- Config: `src/config/`
- tsconfig paths: `"@/*": ["./*"]` (maps to project root, so `@/src/lib/auth` not `@/lib/auth`)

**Why:** Next.js 16 treats root `app/` as primary when both `app/` and `src/app/` exist.
**How to apply:** Always create route files (page.tsx, layout.tsx) in root `app/`, not `src/app/`.
