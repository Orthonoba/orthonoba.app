import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { enqueueTaskSchema } from '@/src/modules/automation/validators'
import { enqueueTask, listTasks, getTask, updateTaskStatus } from '@/src/modules/automation/automation-store'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { AgentTask } from '@/src/types/automation'

// GET /api/v1/ai/tasks?type=&status=
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const data = await listTasks(tenant.clinicId, {
    type:   (searchParams.get('type') as AgentTask['type']) ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })
  return NextResponse.json(paginated<AgentTask>(data, data.length, 1, 50))
})

// POST /api/v1/ai/tasks — enqueue agent task
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = enqueueTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const task = await enqueueTask({
    clinicId: tenant.clinicId,
    type:     parsed.data.type,
    priority: parsed.data.priority,
    input:    parsed.data.input,
    maxAttempts: parsed.data.maxAttempts,
    scheduledAt: parsed.data.scheduledAt ?? new Date().toISOString(),
  })

  // Auto-execute synchronous tasks immediately
  if (['qualify_lead', 'suggest_campaigns', 'crm_analysis'].includes(task.type)) {
    // Dispatch without blocking the response
    executeTaskAsync(task.id, task.type, task.input, tenant.clinicId).catch(() => {})
  }

  return NextResponse.json(ok(task), { status: 202 })
})

async function executeTaskAsync(
  taskId: string,
  type: AgentTask['type'],
  input: Record<string, unknown>,
  clinicId: string
) {
  await updateTaskStatus(taskId, 'processing')
  const startMs = Date.now()
  try {
    let output: Record<string, unknown> = {}

    if (type === 'qualify_lead') {
      const { getLead, getLeadActivities } = await import('@/src/modules/marketing/lead-store')
      const { qualifyLead } = await import('@/src/services/ai/lead-qualifier')
      const lead = await getLead(clinicId, String(input.leadId))
      if (lead) {
        const acts = await getLeadActivities(lead.id)
        output = { qualification: await qualifyLead(lead, acts) }
      }
    } else if (type === 'suggest_campaigns') {
      const { getCampaignSuggestions } = await import('@/src/services/ai/campaign-advisor')
      const { getMarketingKPIs } = await import('@/src/modules/marketing/campaign-store')
      const kpis = await getMarketingKPIs(clinicId, String(input.period ?? new Date().toISOString().slice(0, 7)))
      output = { suggestions: await getCampaignSuggestions(clinicId, kpis) }
    }

    await updateTaskStatus(taskId, 'completed', { ...output, durationMs: Date.now() - startMs })
  } catch (err) {
    await updateTaskStatus(taskId, 'failed', undefined, err instanceof Error ? err.message : String(err))
  }
}
