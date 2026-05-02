import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido.').toLowerCase().trim(),
  password: z.string().min(6, 'Mínimo 6 caracteres.'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres.').max(100).trim(),
  email: z.string().email('Email inválido.').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula.')
    .regex(/[0-9]/, 'Debe incluir un número.'),
})

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['super_admin', 'clinic_admin', 'lab_admin', 'doctor', 'staff']),
  clinicId: z.string().uuid(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
