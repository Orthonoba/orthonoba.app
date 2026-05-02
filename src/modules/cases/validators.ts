import { z } from 'zod'

const treatmentTypes = [
  'orthodontics', 'implantology', 'endodontics', 'periodontics',
  'prosthodontics', 'oral-surgery', 'cosmetic', 'pediatric',
  'sleep-medicine', 'general', 'emergency', 'multidisciplinary', 'other',
] as const

const caseStatuses = [
  'intake', 'diagnosis', 'treatment-planning', 'treatment',
  'pending-lab', 'lab-review', 'review', 'completed',
  'on-hold', 'cancelled', 'archived',
] as const

const caseOrigins = [
  'walk-in', 'referral-internal', 'referral-external',
  'marketing', 'insurance', 'emergency-intake', 'follow-up',
] as const

export const createCaseSchema = z.object({
  patientId: z.string().uuid(),
  assignedDoctorId: z.string().uuid(),
  collaboratingDoctorIds: z.array(z.string().uuid()).max(10).optional(),
  labId: z.string().uuid().optional(),

  treatmentType: z.enum(treatmentTypes),
  priority: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  origin: z.enum(caseOrigins).default('walk-in'),

  title: z.string().min(3).max(200).trim(),
  chiefComplaint: z.string().min(5).max(1000).trim(),
  diagnosis: z.string().max(2000).optional(),
  affectedTeeth: z.array(z.number().int().min(11).max(85)).max(32).optional(),

  estimatedValue: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('EUR'),
  expectedCompletionDate: z.string().datetime({ offset: true }).optional(),

  notes: z.string().max(3000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const updateCaseSchema = createCaseSchema
  .omit({ patientId: true })
  .partial()

export const transitionStatusSchema = z.object({
  status: z.enum(caseStatuses),
  reason: z.string().min(1).max(500),
})

export const cancelCaseSchema = z.object({
  reason: z.string().min(5).max(500).trim(),
})

export const linkEntitySchema = z.object({
  entityId: z.string().uuid(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>
export type CancelCaseInput = z.infer<typeof cancelCaseSchema>
