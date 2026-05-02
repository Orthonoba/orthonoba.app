import type { Clinic, StaffMember } from '@/src/types/clinic'
import type { PaginationQuery } from '@/src/types/api'

export interface IClinicRepository {
  findById(id: string): Promise<Clinic | null>
  findBySubdomain(subdomain: string): Promise<Clinic | null>
  findAll(filters?: PaginationQuery & { type?: Clinic['type']; status?: Clinic['status'] }): Promise<{
    data: Clinic[]
    total: number
  }>
  create(data: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Clinic>
  update(id: string, data: Partial<Clinic>): Promise<Clinic>
  delete(id: string): Promise<void>
  existsBySubdomain(subdomain: string): Promise<boolean>
}

export interface IStaffRepository {
  findByClinic(clinicId: string): Promise<StaffMember[]>
  findById(id: string): Promise<StaffMember | null>
  findByUserId(clinicId: string, userId: string): Promise<StaffMember | null>
  create(data: Omit<StaffMember, 'id' | 'joinedAt'>): Promise<StaffMember>
  update(id: string, data: Partial<StaffMember>): Promise<StaffMember>
  delete(id: string): Promise<void>
}
