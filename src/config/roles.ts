import type { UserRole } from '@/src/types/user'
import type { Permission } from '@/src/config/permissions'

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  dentist: 'Dentista',
  assistant: 'Asistente',
  lab: 'Laboratorio',
}

export const rolePermissions: Record<UserRole, Array<Permission | '*'>> = {
  admin: ['*'],
  dentist: [
    'patients.read',
    'patients.write',
    'orders.read',
    'orders.write',
    'billing.read',
    'files.read',
    'files.upload',
    'cad.access',
  ],
  assistant: [
    'patients.read',
    'orders.read',
    'files.read',
  ],
  lab: [
    'orders.read',
    'orders.write',
    'files.upload',
    'files.read',
    'lab.manage',
    'cad.access',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = rolePermissions[role] as string[]
  return perms.includes('*') || perms.includes(permission)
}
