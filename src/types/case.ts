import type { UserRole } from '@/src/types/user'

// ─── Treatment Case Classification ───────────────────────────────────────────

export type TreatmentCaseType =
  | 'orthodontics'        // braces, clear aligners
  | 'implantology'        // dental implants & prosthetics
  | 'endodontics'         // root canal treatments
  | 'periodontics'        // gum disease management
  | 'prosthodontics'      // crowns, bridges, dentures
  | 'oral-surgery'        // extractions, bone grafts, biopsies
  | 'cosmetic'            // whitening, veneers, bonding
  | 'pediatric'           // pediatric dentistry
  | 'sleep-medicine'      // sleep apnea, bruxism, night guards
  | 'general'             // routine preventive care
  | 'emergency'           // acute pain / trauma
  | 'multidisciplinary'   // requires multiple specialties
  | 'other'

export type CaseStatus =
  | 'intake'              // initial contact / first appointment pending
  | 'diagnosis'           // assessment in progress
  | 'treatment-planning'  // plan being designed
  | 'treatment'           // active treatment sessions
  | 'pending-lab'         // awaiting lab fabrication
  | 'lab-review'          // lab work returned, fitting pending
  | 'review'              // post-treatment follow-up
  | 'completed'           // all treatment phases done
  | 'on-hold'             // patient requested pause
  | 'cancelled'           // cancelled before treatment began
  | 'archived'

export type CasePriority = 'routine' | 'urgent' | 'emergency'

// ─── Case Source ──────────────────────────────────────────────────────────────

export type CaseOrigin =
  | 'walk-in'
  | 'referral-internal'   // from another doctor in same clinic
  | 'referral-external'   // from outside specialist
  | 'marketing'
  | 'insurance'
  | 'emergency-intake'
  | 'follow-up'

// ─── Core Case Entity ─────────────────────────────────────────────────────────

export interface DentalCase {
  id: string
  /** Human-readable sequential number, e.g. 'CASE-2024-0001' */
  caseNumber: string

  // ── Multi-tenant scope ─────────────────────────────────────────────────────
  clinicId: string

  // ── People ─────────────────────────────────────────────────────────────────
  patientId: string
  assignedDoctorId: string
  /** Secondary doctors (consultants, specialists) */
  collaboratingDoctorIds?: string[]
  /** Assigned lab for this case, if applicable */
  labId?: string

  // ── Clinical classification ────────────────────────────────────────────────
  treatmentType: TreatmentCaseType
  status: CaseStatus
  priority: CasePriority
  origin: CaseOrigin

  title: string
  /** Patient's stated chief complaint in their own words */
  chiefComplaint: string
  /** Clinical diagnosis after assessment */
  diagnosis?: string
  /** Affected teeth (FDI notation numbers) */
  affectedTeeth?: number[]

  // ── Financial ─────────────────────────────────────────────────────────────
  estimatedValue: number
  /** ISO 4217 currency code */
  currency: string
  acceptedValue?: number
  quotedAt?: string
  acceptedAt?: string

  // ── Related entity IDs ─────────────────────────────────────────────────────
  treatmentPlanId?: string
  orderIds: string[]
  appointmentIds: string[]
  invoiceIds: string[]

  // ── Timeline ───────────────────────────────────────────────────────────────
  openedAt: string
  expectedCompletionDate?: string
  completedAt?: string
  closedAt?: string

  // ── CRM metadata ──────────────────────────────────────────────────────────
  lostReason?: string
  notes?: string
  tags?: string[]

  createdAt: string
  updatedAt?: string
}

// ─── Case Activity Log (audit trail) ─────────────────────────────────────────

export type CaseActivityAction =
  | 'case_opened'
  | 'status_changed'
  | 'doctor_assigned'
  | 'lab_assigned'
  | 'note_added'
  | 'order_linked'
  | 'appointment_linked'
  | 'invoice_linked'
  | 'value_updated'
  | 'case_completed'
  | 'case_cancelled'

export interface CaseActivity {
  id: string
  caseId: string
  clinicId: string
  actorId: string
  actorRole: UserRole
  action: CaseActivityAction
  /** Previous value for state-change actions */
  fromValue?: string
  /** New value for state-change actions */
  toValue?: string
  notes?: string
  createdAt: string
}

// ─── CRM Dashboard KPIs ───────────────────────────────────────────────────────

export interface CasePipelineStage {
  status: CaseStatus
  count: number
  totalValue: number
}

export interface CaseDashboardMetrics {
  clinicId: string
  /** ISO date string for the reporting period start */
  periodStart: string
  periodEnd: string

  // Volume
  totalCases: number
  newCasesInPeriod: number
  completedInPeriod: number
  cancelledInPeriod: number

  // Financial
  totalEstimatedValue: number
  totalAcceptedValue: number
  totalInvoicedValue: number
  conversionRate: number

  // Speed
  avgDaysToComplete: number
  avgDaysInTreatment: number

  // Pipeline
  pipeline: CasePipelineStage[]

  // Breakdown by type
  byType: Partial<Record<TreatmentCaseType, { count: number; value: number }>>

  // Breakdown by doctor
  byDoctor: Array<{
    doctorId: string
    caseCount: number
    completedCount: number
    totalValue: number
  }>
}
