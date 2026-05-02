import type { DoctorProfile, DoctorClinicAffiliation, DoctorAvailabilitySlot } from '@/src/types/doctor'
import type { DoctorFilters } from './service'

export interface IDoctorProfileRepository {
  findById(clinicId: string, id: string): Promise<DoctorProfile | null>
  findByUserId(clinicId: string, userId: string): Promise<DoctorProfile | null>
  findAll(clinicId: string, filters?: DoctorFilters): Promise<{ data: DoctorProfile[]; total: number }>
  create(data: Omit<DoctorProfile, 'id' | 'createdAt' | 'updatedAt' | 'totalPatients' | 'activePatients' | 'totalCases' | 'activeCases' | 'completedCasesThisYear' | 'avgCaseValue'>): Promise<DoctorProfile>
  update(clinicId: string, id: string, data: Partial<DoctorProfile>): Promise<DoctorProfile>
  delete(clinicId: string, id: string): Promise<void>
}

export interface IDoctorAffiliationRepository {
  findByDoctor(doctorUserId: string): Promise<DoctorClinicAffiliation[]>
  findByClinic(clinicId: string): Promise<DoctorClinicAffiliation[]>
  create(data: Omit<DoctorClinicAffiliation, 'id'>): Promise<DoctorClinicAffiliation>
  update(id: string, data: Partial<DoctorClinicAffiliation>): Promise<DoctorClinicAffiliation>
  delete(id: string): Promise<void>
}

export interface IDoctorAvailabilityRepository {
  findByDoctor(clinicId: string, doctorUserId: string, dateFrom: string, dateTo: string): Promise<DoctorAvailabilitySlot[]>
  findFreeSlots(clinicId: string, doctorUserId: string, afterDate: string): Promise<DoctorAvailabilitySlot[]>
  create(data: Omit<DoctorAvailabilitySlot, 'id'>): Promise<DoctorAvailabilitySlot>
  update(id: string, data: Partial<DoctorAvailabilitySlot>): Promise<DoctorAvailabilitySlot>
  delete(id: string): Promise<void>
}
