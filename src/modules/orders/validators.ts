import { z } from 'zod'

export const createOrderSchema = z.object({
  patientId: z.string().uuid(),
  labId: z.string().uuid().optional(),
  type: z.enum([
    'aligner', 'retainer', 'mouthguard', 'sleep-apnea',
    'crown', 'bridge', 'implant-crown', 'implant-bar',
    'denture-full', 'denture-partial', 'splint', 'model',
    'surgical-guide', 'veneer', 'inlay-onlay', 'other',
  ]),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  dueDate: z.string().datetime({ offset: true }).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'draft', 'submitted', 'confirmed', 'in-production',
    'quality-check', 'shipped', 'delivered', 'revision-requested', 'cancelled',
  ]),
  reason: z.string().max(500).optional(),
})

export const requestPickupSchema = z.object({
  orderId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime({ offset: true }),
  address: z.string().min(5).max(300),
  contactName: z.string().min(2).max(100),
  contactPhone: z.string().min(7).max(20),
  notes: z.string().max(500).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type RequestPickupInput = z.infer<typeof requestPickupSchema>
