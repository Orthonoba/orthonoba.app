import type {
  AutomationRule, AutomationExecution, SmartReminder,
  AgentTask, AgentTaskType, WhatsAppMessage,
} from '@/src/types/automation'

// ─── In-memory stores (swap → Neon DB) ───────────────────────────────────────

const rules      = new Map<string, AutomationRule>()
const executions = new Map<string, AutomationExecution>()
const reminders  = new Map<string, SmartReminder>()
const tasks      = new Map<string, AgentTask>()
const waMessages = new Map<string, WhatsAppMessage>()

// ─── Rules ────────────────────────────────────────────────────────────────────

export async function createRule(
  data: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'totalFirings'>
): Promise<AutomationRule> {
  const rule: AutomationRule = {
    ...data,
    id: crypto.randomUUID(),
    totalFirings: 0,
    createdAt: new Date().toISOString(),
  }
  rules.set(rule.id, rule)
  return rule
}

export async function getRule(id: string): Promise<AutomationRule | null> {
  return rules.get(id) ?? null
}

export async function listRules(clinicId: string): Promise<AutomationRule[]> {
  return Array.from(rules.values())
    .filter((r) => r.clinicId === clinicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateRule(id: string, data: Partial<AutomationRule>): Promise<AutomationRule | null> {
  const r = rules.get(id)
  if (!r) return null
  const updated = { ...r, ...data, updatedAt: new Date().toISOString() }
  rules.set(id, updated)
  return updated
}

export async function deleteRule(id: string): Promise<boolean> {
  return rules.delete(id)
}

export async function getRulesByTrigger(
  clinicId: string,
  triggerType: AutomationRule['trigger']
): Promise<AutomationRule[]> {
  return Array.from(rules.values()).filter(
    (r) => r.clinicId === clinicId && r.trigger === triggerType && r.status === 'active'
  )
}

export async function incrementRuleFiring(id: string): Promise<void> {
  const r = rules.get(id)
  if (!r) return
  rules.set(id, { ...r, totalFirings: r.totalFirings + 1, lastFiredAt: new Date().toISOString() })
}

// ─── Executions ───────────────────────────────────────────────────────────────

export async function saveExecution(exec: AutomationExecution): Promise<AutomationExecution> {
  executions.set(exec.id, exec)
  return exec
}

export async function listExecutions(
  clinicId: string,
  filters: { ruleId?: string; status?: string; limit?: number } = {}
): Promise<AutomationExecution[]> {
  let result = Array.from(executions.values()).filter((e) => e.clinicId === clinicId)
  if (filters.ruleId) result = result.filter((e) => e.ruleId === filters.ruleId)
  if (filters.status) result = result.filter((e) => e.status === filters.status)
  return result
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, filters.limit ?? 100)
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export async function saveReminder(
  data: Omit<SmartReminder, 'id'>
): Promise<SmartReminder> {
  const r: SmartReminder = { ...data, id: crypto.randomUUID() }
  reminders.set(r.id, r)
  return r
}

export async function listReminders(clinicId: string): Promise<SmartReminder[]> {
  return Array.from(reminders.values())
    .filter((r) => r.clinicId === clinicId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
}

export async function listPendingReminders(): Promise<SmartReminder[]> {
  const now = new Date()
  return Array.from(reminders.values()).filter(
    (r) => r.status === 'scheduled' && new Date(r.scheduledAt) <= now
  )
}

export async function markReminderSent(id: string): Promise<void> {
  const r = reminders.get(id)
  if (r) reminders.set(id, { ...r, status: 'sent', sentAt: new Date().toISOString() })
}

export async function cancelReminder(id: string): Promise<void> {
  const r = reminders.get(id)
  if (r) reminders.set(id, { ...r, status: 'cancelled' })
}

// ─── Agent Task Queue ─────────────────────────────────────────────────────────

export async function enqueueTask(
  data: Omit<AgentTask, 'id' | 'createdAt' | 'status' | 'attempts'>
): Promise<AgentTask> {
  const task: AgentTask = {
    ...data,
    id: crypto.randomUUID(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  tasks.set(task.id, task)
  return task
}

export async function getTask(id: string): Promise<AgentTask | null> {
  return tasks.get(id) ?? null
}

export async function listTasks(
  clinicId: string,
  filters: { type?: AgentTaskType; status?: string } = {}
): Promise<AgentTask[]> {
  let result = Array.from(tasks.values()).filter((t) => t.clinicId === clinicId)
  if (filters.type)   result = result.filter((t) => t.type   === filters.type)
  if (filters.status) result = result.filter((t) => t.status === filters.status)
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateTaskStatus(
  id: string,
  status: AgentTask['status'],
  output?: Record<string, unknown>,
  error?: string
): Promise<void> {
  const t = tasks.get(id)
  if (!t) return
  tasks.set(id, {
    ...t, status,
    ...(output ? { output } : {}),
    ...(error ? { errorMessage: error } : {}),
    ...(status === 'processing' ? { startedAt: new Date().toISOString(), attempts: t.attempts + 1 } : {}),
    ...(status === 'completed' || status === 'failed' ? { completedAt: new Date().toISOString() } : {}),
  })
}

// ─── WhatsApp Messages ────────────────────────────────────────────────────────

export async function saveWhatsAppMessage(
  data: Omit<WhatsAppMessage, 'id' | 'createdAt'>
): Promise<WhatsAppMessage> {
  const msg: WhatsAppMessage = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  waMessages.set(msg.id, msg)
  return msg
}

export async function listWhatsAppMessages(clinicId: string, limit = 50): Promise<WhatsAppMessage[]> {
  return Array.from(waMessages.values())
    .filter((m) => m.clinicId === clinicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export async function updateWhatsAppStatus(
  id: string,
  status: WhatsAppMessage['status'],
  waMessageId?: string
): Promise<void> {
  const m = waMessages.get(id)
  if (!m) return
  waMessages.set(id, {
    ...m, status,
    ...(waMessageId ? { whatsappMessageId: waMessageId } : {}),
    ...(status === 'sent'      ? { sentAt:      new Date().toISOString() } : {}),
    ...(status === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}),
    ...(status === 'read'      ? { readAt:      new Date().toISOString() } : {}),
  })
}
