import { hasPermission } from '@/src/config/roles'
import type { UserRole, SessionPayload } from '@/src/types/user'
import type { Permission } from '@/src/config/permissions'

// ─── Route rule schema ────────────────────────────────────────────────────────

export interface RouteRule {
  /** URL prefix this rule applies to (most-specific prefix wins). */
  prefix: string
  /** Roles allowed to access this route. Empty = any authenticated user. */
  requiredRoles?: UserRole[]
  /** ALL listed permissions must be satisfied. */
  requiredPermissions?: Permission[]
  /** Where to send users that fail this rule. Defaults to /login or /dashboard. */
  redirectTo?: string
  /** If true, authenticated users are redirected AWAY from this route. */
  guestOnly?: boolean
}

// ─── Route map ────────────────────────────────────────────────────────────────
// Order does not matter — match is done by longest-prefix wins.

const routeRules: RouteRule[] = [
  // Auth routes — redirect authenticated users to their dashboard
  { prefix: '/login',  guestOnly: true, redirectTo: '/dashboard' },
  { prefix: '/signup', guestOnly: true, redirectTo: '/dashboard' },

  // Generic protected — any authenticated role
  { prefix: '/dashboard', requiredRoles: ['admin', 'dentist', 'assistant', 'lab'] },

  // Feature-gated sub-routes
  {
    prefix: '/dashboard/billing',
    requiredRoles: ['admin', 'dentist'],
    requiredPermissions: ['billing.read'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/cad',
    requiredPermissions: ['cad.access'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/lab',
    requiredRoles: ['admin', 'lab'],
    requiredPermissions: ['lab.manage'],
    redirectTo: '/dashboard',
  },
  {
    prefix: '/dashboard/staff',
    requiredPermissions: ['staff.manage'],
    redirectTo: '/dashboard',
  },

  // Admin-only
  {
    prefix: '/admin',
    requiredRoles: ['admin'],
    redirectTo: '/dashboard',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchRule(pathname: string): RouteRule | null {
  const candidates = routeRules.filter((r) => pathname.startsWith(r.prefix))
  if (candidates.length === 0) return null
  // Most-specific (longest) prefix wins
  return candidates.reduce((best, r) =>
    r.prefix.length > best.prefix.length ? r : best
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Pure function — no Next.js deps, fully testable.
 * Returns true when the session is allowed to access the given pathname.
 */
export function canAccess(
  pathname: string,
  session: SessionPayload | null
): boolean {
  const rule = matchRule(pathname)
  if (!rule) return true // no rule → public

  const { requiredRoles, requiredPermissions, guestOnly } = rule

  if (guestOnly) return !session?.userId

  if (!session?.userId) return false

  if (requiredRoles && !requiredRoles.includes(session.role)) return false

  if (requiredPermissions) {
    const allGranted = requiredPermissions.every((p) =>
      hasPermission(session.role, p)
    )
    if (!allGranted) return false
  }

  return true
}

/**
 * Returns the URL to redirect to, or null if no redirect is needed.
 */
export function getRedirectUrl(
  pathname: string,
  session: SessionPayload | null
): string | null {
  if (canAccess(pathname, session)) return null

  const rule = matchRule(pathname)

  if (!session?.userId) return '/login'

  return rule?.redirectTo ?? '/dashboard'
}

/** True if the route requires an active session. */
export function isProtectedRoute(pathname: string): boolean {
  const rule = matchRule(pathname)
  return !!rule && !rule.guestOnly
}

/** True if the route should be inaccessible to authenticated users. */
export function isGuestOnlyRoute(pathname: string): boolean {
  return !!matchRule(pathname)?.guestOnly
}

/** Returns the allowed roles for a route, or null if the route is public. */
export function getAllowedRoles(pathname: string): UserRole[] | null {
  const rule = matchRule(pathname)
  if (!rule || rule.guestOnly) return null
  return rule.requiredRoles ?? (['admin', 'dentist', 'assistant', 'lab'] as UserRole[])
}
