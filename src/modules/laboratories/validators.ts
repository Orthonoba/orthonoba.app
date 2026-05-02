import { z } from 'zod'

const capabilities = [
  'orthodontics', 'ceramics', 'implants', 'cad-cam',
  'removable-prosthetics', 'surgical-guides', 'models', 'night-guards', 'photography',
] as const

export const updateLabProfileSchema = z.object({
  certifications: z.array(z.string().max(100)).max(20).optional(),
  deliveryCountries: z.array(z.string().length(2).toUpperCase()).min(1).default(['ES']),
  acceptsNewClients: z.boolean().default(true),
  maxActiveOrders: z.number().int().positive().max(10000).optional(),
  capabilities: z
    .array(
      z.object({
        type: z.enum(capabilities),
        turnaroundDays: z.number().int().min(1).max(365),
        acceptsRush: z.boolean().default(false),
        rushSurchargePercent: z.number().min(0).max(200).optional(),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1)
    .max(15)
    .optional(),
})

export const setPriceSchema = z.object({
  orderType: z.string().min(1).max(50),
  description: z.string().min(3).max(300).trim(),
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default('EUR'),
  rushMultiplier: z.number().min(1).max(5).default(1.5),
})

export const stockUpdateSchema = z.object({
  materialId: z.string().uuid(),
  delta: z.number().int(),
  reason: z.string().max(200).optional(),
})

export type UpdateLabProfileInput = z.infer<typeof updateLabProfileSchema>
export type SetPriceInput = z.infer<typeof setPriceSchema>
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>
