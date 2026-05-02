import { cache } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getSession } from '@/src/lib/auth'
import { mockUsers } from '@/src/lib/mock-users'
import { getClinicById } from '@/src/lib/mock-clinics'
import { hasPermission } from '@/src/config/roles'
import type { User } from '@/src/types/user'
import type { Clinic, TenantContext } from '@/src/types/clinic'
import type { Permission } from '@/src/config/permissions'

// ── Session ────────────────────────────────────────────────────

export const verifySession = cache(async (): Promise<{ userId: string; role: string }> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  return { userId: session.userId, role: session.role }
})

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession()
  if (!session?.userId) return null
  const found = mockUsers.find((u) => u.id === session.userId)
  if (!found) return null
  const { password: _, ...user } = found
  return user
})

// ── Tenant ─────────────────────────────────────────────────────

export const getTenantContext = cache(async (): Promise<TenantContext | null> => {
  const h = await headers()
  const clinicId = h.get('x-clinic-id')
  const subdomain = h.get('x-subdomain')
  const clinicName = h.get('x-clinic-name')
  const clinicType = h.get('x-clinic-type') as TenantContext['type'] | null

  if (!clinicId || !subdomain || !clinicName || !clinicType) return null

  const clinic = getClinicById(clinicId)
  const plan = clinic?.plan ?? 'free'

  return { clinicId, subdomain, clinicName, type: clinicType, plan }
})

export const getCurrentClinic = cache(async (): Promise<Clinic | null> => {
  const ctx = await getTenantContext()
  if (!ctx) return null
  return getClinicById(ctx.clinicId) ?? null
})

/**
 * Verifies that the current user has access to the resolved tenant.
 * - Admin role has access to all tenants.
 * - Other roles must belong to the clinic identified by x-clinic-id.
 */
export const verifyTenantAccess = cache(async (): Promise<{
  userId: string
  clinicId: string
  role: string
}> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const ctx = await getTenantContext()
  if (!ctx) redirect('/login')

  const isAdmin = session.role === 'super_admin'
  const belongsToClinic = session.clinicId === ctx.clinicId

  if (!isAdmin && !belongsToClinic) redirect('/login')

  return { userId: session.userId, clinicId: ctx.clinicId, role: session.role }
})

// ── Authorization ──────────────────────────────────────────────

export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  if (!session?.userId) return false
  return hasPermission(session.role as Parameters<typeof hasPermission>[0], permission)
}

export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await checkPermission(permission)
  if (!allowed) redirect('/dashboard')
}
