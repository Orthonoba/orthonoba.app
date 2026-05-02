import type { LeadSource } from '@/src/types/marketing'

// ─── Demographics ─────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other' | 'undisclosed'

export type PatientStatus =
  | 'active'      // has had visits and is still active
  | 'inactive'    // no visit in last 12 months
  | 'prospect'    // first appointment not yet completed
  | 'archived'
  | 'blocked'

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

// ─── Core Patient Entity ──────────────────────────────────────────────────────

export interface Patient {
  id: string
  /** MANDATORY: every patient belongs to exactly one tenant */
  clinicId: string

  // Identity
  firstName: string
  lastName: string
  /** DNI / NIE / Passport */
  nationalId?: string
  dateOfBirth?: string
  gender?: Gender

  // Contact
  email?: string
  /** Primary phone — required for appointment reminders */
  phone: string
  mobile?: string
  address?: string
  postalCode?: string
  city?: string
  /** ISO 3166-1 alpha-2 country code */
  country?: string

  // Clinical assignment
  status: PatientStatus
  dentistId?: string
  /** Marketing attribution: how they found the clinic */
  source?: LeadSource

  // GDPR / LOPD — mandatory in Spain & EU
  gdprConsent: boolean
  gdprConsentDate?: string
  marketingConsent: boolean

  // Denormalized quick stats (updated by background jobs)
  totalInvoiced?: number
  totalTreatments?: number
  lastVisitDate?: string
  nextAppointmentDate?: string

  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

// ─── Emergency Contact ────────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string
  patientId: string
  clinicId: string
  name: string
  relationship: string
  phone: string
  email?: string
}

// ─── Medical History ──────────────────────────────────────────────────────────

export type AllergyType =
  | 'latex'
  | 'penicillin'
  | 'aspirin'
  | 'ibuprofen'
  | 'local-anesthetic'
  | 'metal-nickel'
  | 'metal-cobalt'
  | 'contrast-dye'
  | 'other'

export interface Allergy {
  type: AllergyType
  description?: string
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic'
}

export interface Medication {
  name: string
  dose?: string
  frequency?: string
  reason?: string
}

export type MedicalConditionType =
  | 'diabetes-type1'
  | 'diabetes-type2'
  | 'hypertension'
  | 'heart-disease'
  | 'heart-pacemaker'
  | 'osteoporosis'
  | 'anticoagulant-therapy'
  | 'bisphosphonate-therapy'
  | 'pregnancy'
  | 'breastfeeding'
  | 'immunosuppressed'
  | 'hepatitis-b'
  | 'hepatitis-c'
  | 'hiv'
  | 'epilepsy'
  | 'asthma'
  | 'other'

export interface MedicalCondition {
  type: MedicalConditionType
  notes?: string
  diagnosedAt?: string
}

export interface MedicalHistory {
  id: string
  patientId: string
  clinicId: string
  bloodType?: BloodType
  smoker: boolean
  alcoholUse: boolean
  allergies: Allergy[]
  medications: Medication[]
  conditions: MedicalCondition[]
  /** Free text for previous dental work not captured in conditions */
  dentalBackground?: string
  lastUpdatedBy: string
  updatedAt: string
}

// ─── Dental Chart — FDI Notation ─────────────────────────────────────────────
// ISO 3950 (FDI): quadrant digit (1–4) + tooth position digit (1–8)
// Permanent: 11–48 | Primary (milk): 51–85

export type ToothFDI =
  // Permanent — Quadrant 1 (upper right)
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18
  // Permanent — Quadrant 2 (upper left)
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28
  // Permanent — Quadrant 3 (lower left)
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38
  // Permanent — Quadrant 4 (lower right)
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48
  // Primary — Quadrant 5 (upper right)
  | 51 | 52 | 53 | 54 | 55
  // Primary — Quadrant 6 (upper left)
  | 61 | 62 | 63 | 64 | 65
  // Primary — Quadrant 7 (lower left)
  | 71 | 72 | 73 | 74 | 75
  // Primary — Quadrant 8 (lower right)
  | 81 | 82 | 83 | 84 | 85

export type ToothCondition =
  | 'healthy'
  | 'caries'
  | 'filled'
  | 'crown'
  | 'bridge-abutment'
  | 'bridge-pontic'
  | 'implant'
  | 'missing'
  | 'root-canal'
  | 'fracture'
  | 'periodontal'
  | 'extraction-indicated'
  | 'impacted'
  | 'under-observation'

export type ToothSurface =
  | 'mesial'
  | 'distal'
  | 'occlusal'
  | 'buccal'
  | 'lingual'
  | 'palatal'
  | 'incisal'

export interface ToothRecord {
  tooth: ToothFDI
  condition: ToothCondition
  surfaces?: ToothSurface[]
  notes?: string
  treatedAt?: string
  treatedBy?: string
}

export interface Odontogram {
  id: string
  patientId: string
  clinicId: string
  teeth: ToothRecord[]
  recordedBy: string
  createdAt: string
  updatedAt?: string
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentType =
  | 'first-visit'
  | 'checkup'
  | 'cleaning'
  | 'extraction'
  | 'filling'
  | 'root-canal'
  | 'crown'
  | 'implant-surgery'
  | 'implant-prosthetic'
  | 'orthodontics'
  | 'whitening'
  | 'consultation'
  | 'follow-up'
  | 'emergency'
  | 'other'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'rescheduled'

export interface Appointment {
  id: string
  clinicId: string
  patientId: string
  dentistId: string
  type: AppointmentType
  status: AppointmentStatus
  scheduledAt: string
  durationMinutes: number
  roomOrChair?: string
  treatmentPlanItemId?: string
  reminderSentAt?: string
  confirmedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Treatment Plan ───────────────────────────────────────────────────────────

export type TreatmentStatus =
  | 'proposed'
  | 'accepted'
  | 'in-progress'
  | 'completed'
  | 'rejected'
  | 'on-hold'

export interface TreatmentItem {
  id: string
  tooth?: ToothFDI
  surface?: ToothSurface
  description: string
  unitPrice: number
  quantity: number
  total: number
  /** ISO 4217 currency code */
  currency: string
  status: TreatmentStatus
  orderId?: string
  completedAt?: string
  notes?: string
}

export interface TreatmentPlan {
  id: string
  clinicId: string
  patientId: string
  dentistId: string
  title: string
  status: TreatmentStatus
  items: TreatmentItem[]
  totalEstimated: number
  currency: string
  validUntil?: string
  acceptedAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────

export type ClinicalNoteType =
  | 'anamnesis'
  | 'visit'
  | 'procedure'
  | 'observation'
  | 'follow-up'
  | 'rx-prescription'
  | 'referral'

export interface ClinicalNote {
  id: string
  clinicId: string
  patientId: string
  appointmentId?: string
  authorId: string
  type: ClinicalNoteType
  content: string
  /** Storage URLs for images, X-rays, etc. */
  attachments?: string[]
  /** Teeth referenced in this note */
  relatedTeeth?: ToothFDI[]
  createdAt: string
  updatedAt?: string
}
