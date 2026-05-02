import type { Clinic, StaffMember, ClinicSettings, BusinessHours } from '@/src/types/clinic'

export interface CreateClinicInput {
  name: string
  subdomain: string
  type: Clinic['type']
  plan: Clinic['plan']
  email: string
  phone: string
  address: string
  timezone?: string
  currency?: string
  taxId?: string
}

export type UpdateClinicInput = Partial<
  Pick<Clinic, 'name' | 'address' | 'phone' | 'email' | 'logo' | 'website' | 'taxId' | 'timezone' | 'currency'>
>

export interface IClinicService {
  findById(id: string): Promise<Clinic | null>
  findBySubdomain(subdomain: string): Promise<Clinic | null>
  create(data: CreateClinicInput, ownerUserId: string): Promise<Clinic>
  update(clinicId: string, data: UpdateClinicInput): Promise<Clinic>
  suspend(clinicId: string, reason: string): Promise<Clinic>
  activate(clinicId: string): Promise<Clinic>
  getSettings(clinicId: string): Promise<ClinicSettings>
  updateSettings(clinicId: string, data: Partial<ClinicSettings>): Promise<ClinicSettings>
  getBusinessHours(clinicId: string): Promise<BusinessHours | null>
  setBusinessHours(clinicId: string, hours: Omit<BusinessHours, 'clinicId'>): Promise<BusinessHours>
  listStaff(clinicId: string): Promise<StaffMember[]>
  addStaff(clinicId: string, userId: string, role: StaffMember['role']): Promise<StaffMember>
  removeStaff(clinicId: string, staffId: string): Promise<void>
  isSubdomainAvailable(subdomain: string): Promise<boolean>
}
