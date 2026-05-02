import { hasPermission } from '@/src/config/roles'
import type { UserRole, SessionPayload } from '@/src/types/user'
import type { Permission } from '@/src/config/permissions'

// ─── Route rule schema ────────────────────────────────────────────────────────

export interface RouteRule {
  prefix: string
  requiredRoles?: UserRole[]
  requiredPermissions?: Permission[]
  redirectTo?: string
  guestOnly?: boolean
}

// ─── Route map — longest-prefix wins ─────────────────────────────────────────

const routeRules: RouteRule[] = [
  // Auth routes — redirect authenticated users
  { prefix: '/login',  guestOnly: true, redirectTo: '/dashboard' },
  { prefix: '/signup', guestOnly: true, redirectTo: '/dashboard' },

  // Dashboard — any authenticated role
  {
    prefix: '/dashboard',
    requiredRoles: ['super_admin', 'clinic_admin', 'lab_admin', 'doctor', 'staff'],
  },

  // Feature-gated sub-routes
  {
    prefix: '/dashboard/billing',
    requiredRoles: ['super_admin', 'clinic_admin', 'lab_admin', 'doctor'],
    requiredPermissions: ['billing.read'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/cad',
    requiredRoles: ['super_admin', 'clinic_admin', 'lab_admin', 'doctor'],
    requiredPermissions: ['cad.access'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/lab',
    requiredRoles: ['super_admin', 'lab_admin'],
    requiredPermissions: ['lab.manage'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/staff',
    requiredRoles: ['super_admin', 'clinic_admin', 'lab_admin'],
    requiredPermissions: ['staff.manage'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/cases',
    requiredRoles: ['super_admin', 'clinic_admin', 'doctor', 'staff'],
    requiredPermissions: ['cases.read'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/reports',
    requiredRoles: ['super_admin', 'clinic_admin', 'lab_admin', 'doctor'],
    requiredPermissions: ['reports.view'],
    redirectTo: '/dashboard',
  },

  // Super admin platform area
  {
    prefix: '/admin',
    requiredRoles: ['super_admin'],
    redirectTo: '/dashboard',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchRule(pathname: string): RouteRule | null {
  const candidates = routeRules.filter((r) => pathname.startsWith(r.prefix))
  if (candidates.length === 0) return null
  return candidates.reduce((best, r) =>
    r.prefix.length > best.prefix.length ? r : best
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function canAccess(pathname: string, session: SessionPayload | null): boolean {
  const rule = matchRule(pathname)
  if (!rule) return true

  const { requiredRoles, requiredPermissions, guestOnly } = rule

  if (guestOnly) return !session?.userId
  if (!session?.userId) return false
  if (requiredRoles && !requiredRoles.includes(session.role)) return false

  if (requiredPermissions) {
    const allGranted = requiredPermissions.every((p) => hasPermission(session.role, p))
    if (!allGranted) return false
  }

  return true
}

export function getRedirectUrl(pathname: string, session: SessionPayload | null): string | null {
  if (canAccess(pathname, session)) return null
  const rule = matchRule(pathname)
  if (!session?.userId) return '/login'
  return rule?.redirectTo ?? '/dashboard'
}

export function isProtectedRoute(pathname: string): boolean {
  const rule = matchRule(pathname)
  return !!rule && !rule.guestOnly
}

export function isGuestOnlyRoute(pathname: string): boolean {
  return !!matchRule(pathname)?.guestOnly
}

export function getAllowedRoles(pathname: string): UserRole[] | null {
  const rule = matchRule(pathname)
  if (!rule || rule.guestOnly) return null
  return rule.requiredRoles ?? (['super_admin', 'clinic_admin', 'lab_admin', 'doctor', 'staff'] as UserRole[])
}
