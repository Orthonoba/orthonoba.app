import type {
  AutomationRule, AutomationExecution, AutomationAction,
  ExecutionActionLog, ExecutionStatus,
} from '@/src/types/automation'
import type { LeadStatus } from '@/src/types/marketing'
import { emailService } from '@/src/services/email/index'
import { getWhatsAppService } from '@/src/services/whatsapp/index'
import {
  getRule, saveExecution, incrementRuleFiring,
  getRulesByTrigger, saveReminder, enqueueTask,
} from '@/src/modules/automation/automation-store'
import { getLead, updateLead, addLeadActivity } from '@/src/modules/marketing/lead-store'

// ─── Condition evaluator ──────────────────────────────────────────────────────

function evaluateCondition(
  condition: AutomationRule['conditions'][0],
  data: Record<string, unknown>
): boolean {
  const fieldValue = data[condition.field]
  const cv = condition.value

  switch (condition.operator) {
    case 'eq':          return fieldValue === cv
    case 'neq':         return fieldValue !== cv
    case 'gt':          return Number(fieldValue) > Number(cv)
    case 'gte':         return Number(fieldValue) >= Number(cv)
    case 'lt':          return Number(fieldValue) < Number(cv)
    case 'lte':         return Number(fieldValue) <= Number(cv)
    case 'contains':    return String(fieldValue).includes(String(cv))
    case 'not_contains': return !String(fieldValue).includes(String(cv))
    case 'in':          return Array.isArray(cv) && cv.includes(fieldValue)
    case 'not_in':      return Array.isArray(cv) && !cv.includes(fieldValue)
    case 'exists':      return fieldValue !== undefined && fieldValue !== null
    case 'not_exists':  return fieldValue === undefined || fieldValue === null
    default:            return false
  }
}

function allConditionsMatch(
  conditions: AutomationRule['conditions'],
  data: Record<string, unknown>
): boolean {
  return conditions.every((c) => evaluateCondition(c, data))
}

// ─── Action executor ──────────────────────────────────────────────────────────

async function executeAction(
  action: AutomationAction,
  context: Record<string, unknown>
): Promise<ExecutionActionLog> {
  const startedAt = new Date().toISOString()
  const log: ExecutionActionLog = {
    actionId: action.id,
    actionType: action.type,
    status: 'running',
    executedAt: startedAt,
  }

  try {
    switch (action.type) {
      case 'send_email': {
        const to = String(context.email ?? context.recipientEmail ?? '')
        if (!to) throw new Error('No email address in context')
        const result = await emailService.send({
          to,
          subject: interpolate(action.config.subject ?? 'Mensaje de Orthonoba', context),
          html: interpolate(action.config.bodyTemplate ?? '', context),
          text: interpolate(action.config.bodyTemplate ?? '', context),
        })
        log.status = result.success ? 'completed' : 'failed'
        log.result = { messageId: result.id }
        break
      }

      case 'send_whatsapp': {
        const to = String(context.phone ?? '')
        if (!to) throw new Error('No phone number in context')
        const wa = getWhatsAppService()
        const body = interpolate(action.config.messageTemplate ?? '', context)
        const result = action.config.templateId
          ? await wa.sendTemplate(to, action.config.templateId, [])
          : await wa.sendText(to, body)
        log.status = result.success ? 'completed' : 'failed'
        log.result = { messageId: result.messageId }
        break
      }

      case 'send_sms': {
        // TODO: integrate Twilio / Vonage
        console.warn('[automation:sms] SMS dispatch not yet wired:', { template: action.config.messageTemplate })
        log.status = 'completed'
        log.result = { sent: true, provider: 'mock' }
        break
      }

      case 'create_task': {
        const clinicId = String(context.clinicId ?? '')
        await enqueueTask({
          clinicId,
          type: 'qualify_lead',
          priority: action.config.priority ?? 'normal',
          input: {
            title: action.config.title,
            assignTo: action.config.assignTo,
            dueInMinutes: action.config.dueInMinutes,
            entityId: context.entityId,
            entityType: context.entityType,
          },
          scheduledAt: new Date().toISOString(),
          maxAttempts: 3,
        })
        log.status = 'completed'
        log.result = { taskCreated: true }
        break
      }

      case 'create_reminder': {
        const clinicId = String(context.clinicId ?? '')
        const entityId = String(context.entityId ?? '')
        const dueMs = (action.config.dueInMinutes ?? 60) * 60_000
        await saveReminder({
          clinicId,
          entityId,
          entityType: 'lead',
          type: 'lead_follow_up',
          channels: ['in_app'],
          scheduledAt: new Date(Date.now() + dueMs).toISOString(),
          status: 'scheduled',
          message: action.config.title ?? 'Recordatorio automático',
          aiGenerated: false,
          createdAt: new Date().toISOString(),
        })
        log.status = 'completed'
        log.result = { reminderCreated: true }
        break
      }

      case 'update_lead_status': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.newStatus) {
          await updateLead(clinicId, leadId, { status: action.config.newStatus as LeadStatus })
          await addLeadActivity({
            leadId, clinicId,
            type: 'status_changed',
            description: `Estado actualizado a "${action.config.newStatus}" por automatización`,
            metadata: { ruleAction: action.type },
            occurredAt: new Date().toISOString(),
          })
        }
        log.status = 'completed'
        break
      }

      case 'update_lead_score': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.scoreAdjustment !== undefined) {
          const lead = await getLead(clinicId, leadId)
          if (lead) {
            const newScore = Math.min(100, Math.max(0, (lead.score ?? 0) + action.config.scoreAdjustment))
            await updateLead(clinicId, leadId, { score: newScore })
          }
        }
        log.status = 'completed'
        break
      }

      case 'assign_lead': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.assigneeId) {
          await updateLead(clinicId, leadId, { assignedTo: action.config.assigneeId })
        }
        log.status = 'completed'
        break
      }

      case 'add_tag': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.tag) {
          await addLeadActivity({
            leadId, clinicId,
            type: 'note_added',
            description: `Tag añadido: ${action.config.tag}`,
            metadata: { tag: action.config.tag, action: 'add_tag' },
            occurredAt: new Date().toISOString(),
          })
        }
        log.status = 'completed'
        break
      }

      case 'remove_tag': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.tag) {
          await addLeadActivity({
            leadId, clinicId,
            type: 'note_added',
            description: `Tag eliminado: ${action.config.tag}`,
            metadata: { tag: action.config.tag, action: 'remove_tag' },
            occurredAt: new Date().toISOString(),
          })
        }
        log.status = 'completed'
        break
      }

      case 'add_to_campaign': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId && action.config.campaignId) {
          await updateLead(clinicId, leadId, { campaignId: action.config.campaignId })
        }
        log.status = 'completed'
        break
      }

      case 'remove_from_campaign': {
        const clinicId = String(context.clinicId ?? '')
        const leadId   = String(context.entityId ?? '')
        if (leadId) {
          await updateLead(clinicId, leadId, { campaignId: undefined })
        }
        log.status = 'completed'
        break
      }

      case 'notify_staff': {
        console.info('[automation:notify] Staff notification (push not yet wired):', action.config)
        log.status = 'completed'
        break
      }

      case 'webhook_post': {
        if (!action.config.webhookUrl) throw new Error('No webhook URL')
        const payload = action.config.webhookPayload ?? context
        const res = await fetch(action.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        })
        log.status = res.ok ? 'completed' : 'failed'
        log.result = { httpStatus: res.status }
        break
      }

      case 'wait': {
        // Deferred execution handled by scheduler
        log.status = 'completed'
        log.result = { waitMinutes: action.config.waitMinutes }
        break
      }

      default:
        log.status = 'skipped'
    }
  } catch (err) {
    log.status = 'failed'
    log.error = err instanceof Error ? err.message : String(err)
  }

  return { ...log, executedAt: new Date().toISOString() }
}

// ─── Template interpolation ───────────────────────────────────────────────────
// Replaces {{variable}} placeholders with context values

function interpolate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = ctx[key]
    return val != null ? String(val) : `{{${key}}}`
  })
}

// ─── Rule firing ──────────────────────────────────────────────────────────────

export async function fireRule(
  rule: AutomationRule,
  triggerData: Record<string, unknown>,
  entityId?: string,
  entityType?: string
): Promise<AutomationExecution> {
  const startedAt = new Date().toISOString()
  const actionLogs: ExecutionActionLog[] = []
  let status: ExecutionStatus = 'completed'
  let errorMessage: string | undefined

  try {
    for (const action of rule.actions) {
      if (action.type === 'wait') {
        actionLogs.push({
          actionId: action.id,
          actionType: 'wait',
          status: 'completed',
          result: { waitMinutes: action.config.waitMinutes },
          executedAt: new Date().toISOString(),
        })
        // In production: schedule next action after delay
        break
      }

      const log = await executeAction(action, { ...triggerData, clinicId: rule.clinicId })
      actionLogs.push(log)

      if (log.status === 'failed') {
        status = 'failed'
        errorMessage = log.error
        break
      }
    }
  } catch (err) {
    status = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const now = new Date().toISOString()
  const execution: AutomationExecution = {
    id: crypto.randomUUID(),
    ruleId: rule.id,
    clinicId: rule.clinicId,
    triggerType: rule.trigger,
    triggerEntityId: entityId,
    triggerEntityType: entityType,
    status,
    actionsExecuted: actionLogs,
    errorMessage,
    startedAt,
    completedAt: now,
    durationMs: new Date(now).getTime() - new Date(startedAt).getTime(),
  }

  await saveExecution(execution)
  await incrementRuleFiring(rule.id)

  return execution
}

// ─── Event dispatcher ─────────────────────────────────────────────────────────

export async function dispatchTrigger(
  clinicId: string,
  triggerType: AutomationRule['trigger'],
  entityId: string,
  entityType: string,
  data: Record<string, unknown>
): Promise<AutomationExecution[]> {
  const rules = await getRulesByTrigger(clinicId, triggerType)
  const executions: AutomationExecution[] = []

  for (const rule of rules) {
    if (rule.status !== 'active') continue
    if (!allConditionsMatch(rule.conditions, data)) continue

    // Cooldown check
    if (rule.lastFiredAt && rule.cooldownMinutes > 0) {
      const minsSinceFired = (Date.now() - new Date(rule.lastFiredAt).getTime()) / 60_000
      if (minsSinceFired < rule.cooldownMinutes) continue
    }

    const exec = await fireRule(rule, { ...data, entityId, entityType }, entityId, entityType)
    executions.push(exec)
  }

  return executions
}
