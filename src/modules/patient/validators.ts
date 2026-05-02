import { z } from 'zod'

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/

export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido.'),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional(),
  gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional(),
  nationalId: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  postalCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default('ES'),
  dentistId: z.string().uuid().optional(),
  source: z.string().optional(),
  gdprConsent: z.literal(true, {
    error: 'El consentimiento GDPR es obligatorio.',
  }),
  marketingConsent: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).max(20).optional(),
})

export const updatePatientSchema = createPatientSchema
  .omit({ gdprConsent: true })
  .partial()

export const scheduleAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  dentistId: z.string().uuid(),
  type: z.enum([
    'first-visit', 'checkup', 'cleaning', 'extraction', 'filling',
    'root-canal', 'crown', 'implant-surgery', 'implant-prosthetic',
    'orthodontics', 'whitening', 'consultation', 'follow-up', 'emergency', 'other',
  ]),
  scheduledAt: z.string().datetime({ offset: true }),
  durationMinutes: z.number().min(15).max(480).default(30),
  notes: z.string().max(1000).optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type ScheduleAppointmentInput = z.infer<typeof scheduleAppointmentSchema>
