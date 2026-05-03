import { z } from 'zod'

// ─── Automation condition ──────────────────────────────────────────────────────

const conditionSchema = z.object({
  field:    z.string().min(1).max(100),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'not_contains', 'in', 'not_in', 'exists', 'not_exists']),
  value:    z.unknown(),
})

// ─── Automation action ────────────────────────────────────────────────────────

const actionConfigSchema = z.object({
  templateId:      z.string().optional(),
  subject:         z.string().max(200).optional(),
  bodyTemplate:    z.string().max(5000).optional(),
  messageTemplate: z.string().max(2000).optional(),
  title:           z.string().max(300).optional(),
  dueInMinutes:    z.number().int().positive().optional(),
  assignTo:        z.string().optional(),
  priority:        z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  newStatus:       z.string().optional(),
  scoreAdjustment: z.number().int().optional(),
  assigneeId:      z.string().optional(),
  tag:             z.string().max(100).optional(),
  webhookUrl:      z.string().url().optional(),
  webhookPayload:  z.record(z.string(), z.unknown()).optional(),
  campaignId:      z.string().uuid().optional(),
  waitMinutes:     z.number().int().min(1).max(43200).optional(),
})

const actionSchema = z.object({
  id:           z.string().uuid(),
  type: z.enum([
    'send_email', 'send_whatsapp', 'send_sms', 'create_task', 'add_tag', 'remove_tag',
    'update_lead_status', 'update_lead_score', 'assign_lead', 'create_reminder',
    'notify_staff', 'webhook_post', 'add_to_campaign', 'remove_from_campaign', 'wait',
  ]),
  config:       actionConfigSchema,
  delayMinutes: z.number().int().nonnegative().default(0),
})

// ─── Automation rule ──────────────────────────────────────────────────────────

export const createRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'paused', 'draft', 'archived']).default('draft'),
  trigger: z.enum([
    'lead.created', 'lead.status_changed', 'lead.score_changed', 'lead.no_contact',
    'patient.appointment_booked', 'patient.appointment_cancelled',
    'patient.appointment_no_show', 'patient.treatment_completed',
    'patient.birthday', 'patient.inactive', 'patient.balance_due',
    'order.created', 'order.status_changed', 'order.overdue', 'order.ready_for_delivery',
    'billing.payment_failed', 'billing.trial_ending', 'billing.subscription_cancelled',
    'academy.enrollment_completed', 'academy.certificate_issued', 'academy.lesson_streak',
    'schedule.daily', 'schedule.weekly', 'schedule.monthly', 'schedule.cron',
  ]),
  conditions:            z.array(conditionSchema).max(10).default([]),
  actions:               z.array(actionSchema).min(1).max(10),
  cronExpression:        z.string().max(100).optional(),
  maxFiringPerEntity:    z.number().int().nonnegative().default(0),
  cooldownMinutes:       z.number().int().nonnegative().default(0),
})

export const updateRuleSchema = createRuleSchema.partial()

// ─── WhatsApp send ────────────────────────────────────────────────────────────

export const sendWhatsAppSchema = z.object({
  to:            z.string().min(10).max(20),
  type:          z.enum(['text', 'template', 'media']).default('text'),
  body:          z.string().max(4096).optional(),
  templateName:  z.string().max(200).optional(),
  templateParams: z.array(z.string()).max(10).optional(),
  mediaUrl:      z.string().url().optional(),
  caption:       z.string().max(1024).optional(),
  entityType:    z.string().optional(),
  entityId:      z.string().optional(),
})

// ─── Reminder ─────────────────────────────────────────────────────────────────

export const createReminderSchema = z.object({
  type: z.enum([
    'appointment_reminder', 'appointment_follow_up', 'treatment_recall',
    'order_status', 'payment_due', 'lead_follow_up', 'birthday_greeting',
    'prescription_refill', 'annual_checkup',
  ]),
  entityType: z.enum(['patient', 'lead', 'order', 'appointment']),
  entityId:   z.string().uuid(),
  channels:   z.array(z.enum(['email', 'whatsapp', 'sms', 'push', 'in_app'])).min(1),
  scheduledAt: z.string().datetime({ offset: true }),
  subject:     z.string().max(200).optional(),
  message:     z.string().min(1).max(2000),
  metadata:    z.record(z.string(), z.unknown()).optional(),
})

// ─── Agent task ───────────────────────────────────────────────────────────────

export const enqueueTaskSchema = z.object({
  type: z.enum([
    'qualify_lead', 'suggest_campaigns', 'predict_orders', 'analyze_retention',
    'generate_report', 'draft_email', 'draft_whatsapp', 'score_lead_batch', 'crm_analysis',
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  input:    z.record(z.string(), z.unknown()),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  maxAttempts: z.number().int().min(1).max(5).default(3),
})

// ─── Lead qualification request ──────────────────────────────────────────────

export const qualifyLeadQuerySchema = z.object({
  leadId:      z.string().uuid(),
  withHistory: z.boolean().default(true),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateRuleInput       = z.infer<typeof createRuleSchema>
export type UpdateRuleInput       = z.infer<typeof updateRuleSchema>
export type SendWhatsAppInput     = z.infer<typeof sendWhatsAppSchema>
export type CreateReminderInput   = z.infer<typeof createReminderSchema>
export type EnqueueTaskInput      = z.infer<typeof enqueueTaskSchema>
export type QualifyLeadQueryInput = z.infer<typeof qualifyLeadQuerySchema>
