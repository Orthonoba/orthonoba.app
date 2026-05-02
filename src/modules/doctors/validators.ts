import { z } from 'zod'

const specialties = [
  'general-dentist', 'orthodontist', 'periodontist', 'endodontist',
  'prosthodontist', 'oral-surgeon', 'oral-maxillofacial', 'pediatric-dentist',
  'implantologist', 'aesthetic-dentist', 'sleep-medicine',
  'forensic-odontology', 'public-health-dentist',
] as const

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export const createDoctorProfileSchema = z.object({
  userId: z.string().uuid(),
  specialties: z.array(z.enum(specialties)).min(1).max(5),
  licenseNumber: z.string().min(3).max(50).trim(),
  licenseCountry: z.string().length(2).toUpperCase(),
  medicalCollegeName: z.string().max(200).optional(),
  graduationYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  consultationDays: z.array(z.enum(weekDays)).min(1).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  consultationStartTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  consultationEndTime: z.string().regex(/^\d{2}:\d{2}$/).default('18:00'),
  avgAppointmentMinutes: z.number().int().min(10).max(240).default(30),
  maxDailyAppointments: z.number().int().min(1).max(50).default(16),
  languages: z.array(z.string().length(2)).max(10).default(['es']),
  bio: z.string().max(2000).optional(),
})

export const updateDoctorProfileSchema = createDoctorProfileSchema
  .omit({ userId: true })
  .partial()

export const blockAvailabilitySchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  reason: z.string().max(200).optional(),
})

export type CreateDoctorProfileInput = z.infer<typeof createDoctorProfileSchema>
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>
export type BlockAvailabilityInput = z.infer<typeof blockAvailabilitySchema>
