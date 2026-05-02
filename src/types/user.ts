// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'dentist' | 'assistant' | 'lab'

export type UserStatus = 'active' | 'inactive' | 'pending'

// ─── Core Entity ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  /** null = platform-level admin (not scoped to a clinic) */
  clinicId: string | null
  phone?: string
  avatar?: string
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

// ─── Invitations ──────────────────────────────────────────────────────────────

export interface UserInvite {
  id: string
  clinicId: string
  email: string
  role: UserRole
  token: string
  expiresAt: string
  createdAt: string
}
