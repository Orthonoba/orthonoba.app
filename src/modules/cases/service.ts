import type {
  DentalCase,
  CaseStatus,
  CaseActivity,
  CaseDashboardMetrics,
  TreatmentCaseType,
  CasePriority,
} from '@/src/types/case'

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateCaseInput {
  patientId: string
  assignedDoctorId: string
  collaboratingDoctorIds?: string[]
  labId?: string
  treatmentType: TreatmentCaseType
  priority: CasePriority
  title: string
  chiefComplaint: string
  diagnosis?: string
  affectedTeeth?: number[]
  estimatedValue?: number
  currency?: string
  expectedCompletionDate?: string
  notes?: string
  tags?: string[]
}

export type UpdateCaseInput = Partial<
  Pick<
    DentalCase,
    | 'assignedDoctorId'
    | 'collaboratingDoctorIds'
    | 'labId'
    | 'treatmentType'
    | 'priority'
    | 'title'
    | 'chiefComplaint'
    | 'diagnosis'
    | 'affectedTeeth'
    | 'estimatedValue'
    | 'acceptedValue'
    | 'treatmentPlanId'
    | 'expectedCompletionDate'
    | 'notes'
    | 'tags'
  >
>

export interface CaseFilters {
  status?: CaseStatus | CaseStatus[]
  treatmentType?: TreatmentCaseType
  assignedDoctorId?: string
  labId?: string
  patientId?: string
  priority?: CasePriority
  search?: string
  createdAfter?: string
  createdBefore?: string
  page?: number
  limit?: number
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface ICaseService {
  // CRUD
  findById(clinicId: string, caseId: string): Promise<DentalCase | null>
  findAll(clinicId: string, filters?: CaseFilters): Promise<{ data: DentalCase[]; total: number }>
  findByPatient(clinicId: string, patientId: string): Promise<DentalCase[]>
  findByDoctor(clinicId: string, doctorId: string, filters?: CaseFilters): Promise<DentalCase[]>
  create(clinicId: string, data: CreateCaseInput, createdBy: string): Promise<DentalCase>
  update(clinicId: string, caseId: string, data: UpdateCaseInput, updatedBy: string): Promise<DentalCase>

  // Status transitions (enforced workflow)
  transitionStatus(clinicId: string, caseId: string, newStatus: CaseStatus, reason: string, actorId: string): Promise<DentalCase>
  complete(clinicId: string, caseId: string, actorId: string): Promise<DentalCase>
  cancel(clinicId: string, caseId: string, reason: string, actorId: string): Promise<DentalCase>

  // Relations
  linkOrder(clinicId: string, caseId: string, orderId: string): Promise<DentalCase>
  linkAppointment(clinicId: string, caseId: string, appointmentId: string): Promise<DentalCase>
  linkInvoice(clinicId: string, caseId: string, invoiceId: string): Promise<DentalCase>

  // Activity log
  getActivity(clinicId: string, caseId: string): Promise<CaseActivity[]>

  // Analytics (dashboard-ready)
  getDashboardMetrics(clinicId: string, periodStart: string, periodEnd: string): Promise<CaseDashboardMetrics>
  generateCaseNumber(clinicId: string): Promise<string>
}
