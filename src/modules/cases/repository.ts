import type { DentalCase, CaseActivity, CaseStatus } from '@/src/types/case'
import type { CaseFilters } from './service'

// ─── Case Repository ──────────────────────────────────────────────────────────

export interface ICaseRepository {
  findById(clinicId: string, id: string): Promise<DentalCase | null>
  findAll(clinicId: string, filters?: CaseFilters): Promise<{ data: DentalCase[]; total: number }>
  findByPatient(clinicId: string, patientId: string): Promise<DentalCase[]>
  findByDoctor(clinicId: string, doctorId: string): Promise<DentalCase[]>
  findByStatus(clinicId: string, status: CaseStatus): Promise<DentalCase[]>
  create(data: Omit<DentalCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<DentalCase>
  update(clinicId: string, id: string, data: Partial<DentalCase>): Promise<DentalCase>
  delete(clinicId: string, id: string): Promise<void>
  /**
   * Returns the next sequential number for this clinic.
   * Backed by an atomic counter in DB (e.g. PostgreSQL SEQUENCE or Redis INCR).
   */
  nextCaseNumber(clinicId: string): Promise<number>
}

// ─── Case Activity Repository ─────────────────────────────────────────────────

export interface ICaseActivityRepository {
  findByCase(caseId: string): Promise<CaseActivity[]>
  create(data: Omit<CaseActivity, 'id' | 'createdAt'>): Promise<CaseActivity>
}
