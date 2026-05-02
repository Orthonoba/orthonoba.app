import type { User, UserRole, UserInvite } from '@/src/types/user'

// ─── Input types ──────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role?: UserRole
  clinicId?: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface IUserManagementService {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: RegisterInput): Promise<User>
  updateStatus(userId: string, status: User['status']): Promise<User>
  inviteToClinic(clinicId: string, email: string, role: UserRole): Promise<UserInvite>
  revokeInvite(inviteId: string): Promise<void>
  listClinicStaff(clinicId: string): Promise<User[]>
  removeFromClinic(clinicId: string, userId: string): Promise<void>
}
