import type { UserRole } from '@/src/types/user'
import type { Permission } from '@/src/config/permissions'

// ─── Role labels (UI display + i18n key) ─────────────────────────────────────

export const roleLabels: Record<UserRole, string> = {
  super_admin:  'Super Administrador',
  clinic_admin: 'Administrador de Clínica',
  lab_admin:    'Administrador de Laboratorio',
  doctor:       'Doctor',
  staff:        'Personal de Clínica',
  instructor:   'Instructor Academy',
}

// ─── Role descriptions ────────────────────────────────────────────────────────

export const roleDescriptions: Record<UserRole, string> = {
  super_admin:  'Acceso total a la plataforma Orthonoba',
  clinic_admin: 'Gestión completa de una clínica dental',
  lab_admin:    'Gestión completa de un laboratorio dental',
  doctor:       'Acceso clínico: pacientes, casos, órdenes y agenda',
  staff:        'Acceso operativo: recepción, agendamiento y seguimiento',
  instructor:   'Instructor de Orthonoba Academy — crea y gestiona cursos',
}

// ─── Permission matrix ────────────────────────────────────────────────────────

export const rolePermissions: Record<UserRole, Array<Permission | '*'>> = {
  super_admin: ['*'],

  clinic_admin: [
    'patients.read', 'patients.write', 'patients.delete', 'patients.export',
    'cases.read', 'cases.write', 'cases.delete', 'cases.assign',
    'doctors.read', 'doctors.write',
    'orders.read', 'orders.write', 'orders.delete',
    'billing.read', 'billing.write', 'billing.export',
    'files.read', 'files.upload', 'files.delete',
    'cad.access', 'cad.export',
    'clinic.manage', 'clinic.settings', 'clinic.integrations',
    'staff.read', 'staff.manage', 'staff.invite',
    'reports.view', 'reports.export',
    'marketing.read', 'marketing.write', 'marketing.campaigns', 'marketing.leads', 'marketing.analytics', 'marketing.social',
    'academy.read', 'academy.enroll', 'academy.manage', 'academy.certificates',
  ],

  lab_admin: [
    'orders.read', 'orders.write',
    'files.read', 'files.upload', 'files.delete',
    'cad.access', 'cad.export',
    'lab.manage', 'lab.production', 'lab.inventory',
    'staff.read', 'staff.manage', 'staff.invite',
    'billing.read', 'billing.write',
    'reports.view',
  ],

  doctor: [
    'patients.read', 'patients.write',
    'cases.read', 'cases.write', 'cases.assign',
    'doctors.read',
    'orders.read', 'orders.write',
    'billing.read',
    'files.read', 'files.upload',
    'cad.access',
    'reports.view',
    'academy.read', 'academy.enroll',
  ],

  staff: [
    'patients.read', 'patients.write',
    'cases.read',
    'doctors.read',
    'orders.read',
    'billing.read',
    'files.read', 'files.upload',
    'staff.read',
    'academy.read', 'academy.enroll',
  ],

  instructor: [
    'academy.read', 'academy.enroll', 'academy.instruct', 'academy.manage', 'academy.certificates',
    'reports.view',
  ],
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = rolePermissions[role] as string[]
  return perms.includes('*') || perms.includes(permission)
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'clinic_admin' || role === 'lab_admin'
}

export function isClinicalRole(role: UserRole): boolean {
  return role === 'doctor' || role === 'clinic_admin'
}

export function isLabRole(role: UserRole): boolean {
  return role === 'lab_admin'
}
