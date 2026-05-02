import type { User, UserInvite } from '@/src/types/user'

// ─── Repository interface (data-access abstraction) ───────────────────────────
// Current: mock data — Future: Neon DB (swap implementation only)

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByClinic(clinicId: string): Promise<User[]>
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  update(id: string, data: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
}

export interface IUserInviteRepository {
  findByToken(token: string): Promise<UserInvite | null>
  findByClinic(clinicId: string): Promise<UserInvite[]>
  create(data: Omit<UserInvite, 'id'>): Promise<UserInvite>
  delete(id: string): Promise<void>
  deleteExpired(): Promise<number>
}
