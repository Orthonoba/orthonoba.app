// ─── Roles — 5-tier enterprise RBAC ──────────────────────────────────────────
//
//  super_admin   Platform-wide administrator (Orthonoba team)
//  clinic_admin  Owner / admin of a specific dental clinic
//  lab_admin     Owner / admin of a dental laboratory
//  doctor        Treating dentist / specialist
//  staff         Clinic staff (receptionist, dental assistant, hygienist)

export type UserRole =
  | 'super_admin'
  | 'clinic_admin'
  | 'lab_admin'
  | 'doctor'
  | 'staff'
  | 'instructor'    // Academy instructor — can create/manage courses

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

// ─── Core User Entity ─────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  /**
   * null  = super_admin (not scoped to any tenant)
   * str   = clinicId or labId this user belongs to
   */
  clinicId: string | null
  phone?: string
  avatar?: string
  /** ISO 3166-1 alpha-2, e.g. 'ES' */
  country?: string
  /** Preferred locale, e.g. 'es-ES' */
  locale?: string
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string
  role: UserRole
  clinicId: string | null
  expiresAt: string
}

// ─── Staff Invitations ────────────────────────────────────────────────────────

export interface UserInvite {
  id: string
  clinicId: string
  email: string
  role: UserRole
  token: string
  expiresAt: string
  createdAt: string
}
