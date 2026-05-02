'use client'
import { useAuthStore } from '@/src/store/auth-store'
import { hasPermission } from '@/src/config/roles'
import type { UserRole } from '@/src/types/user'
import type { Permission } from '@/src/config/permissions'

export function useRole() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role as UserRole | undefined

  function can(permission: Permission): boolean {
    if (!role) return false
    return hasPermission(role, permission)
  }

  function is(targetRole: UserRole): boolean {
    return role === targetRole
  }

  function isAdmin(): boolean {
    return role === 'super_admin' || role === 'clinic_admin' || role === 'lab_admin'
  }

  function isSuperAdmin(): boolean {
    return role === 'super_admin'
  }

  function isDoctor(): boolean {
    return role === 'doctor'
  }

  return { role, can, is, isAdmin }
}
