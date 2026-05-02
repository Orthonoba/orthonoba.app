import { z } from 'zod'

const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

export const createClinicSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .toLowerCase()
    .regex(subdomainRegex, 'Subdominio inválido. Solo minúsculas, números y guiones.'),
  type: z.enum(['clinic', 'lab']),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(5).max(300),
  timezone: z.string().default('Europe/Madrid'),
  currency: z.string().length(3).default('EUR'),
  taxId: z.string().optional(),
})

export const updateClinicSchema = createClinicSchema
  .omit({ subdomain: true, type: true, plan: true })
  .partial()

export const addStaffSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['clinic_admin', 'doctor', 'staff']),
})

export type CreateClinicInput = z.infer<typeof createClinicSchema>
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>
export type AddStaffInput = z.infer<typeof addStaffSchema>
