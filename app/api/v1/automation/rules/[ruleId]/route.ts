import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateRuleSchema } from '@/src/modules/automation/validators'
import { getRule, updateRule, deleteRule, listExecutions } from '@/src/modules/automation/automation-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { ruleId: string }

export const GET = withTenant<Params>(async (_req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const rule = await getRule(params.ruleId)
  if (!rule || rule.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Regla no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }
  const recentExecs = await listExecutions(tenant.clinicId, { ruleId: params.ruleId, limit: 10 })
  return NextResponse.json(ok({ rule, recentExecutions: recentExecs }))
})

export const PATCH = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const rule = await getRule(params.ruleId)
  if (!rule || rule.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Regla no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }
  const body = await req.json().catch(() => ({}))
  const parsed = updateRuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const updated = await updateRule(params.ruleId, parsed.data)
  return NextResponse.json(ok(updated))
})

export const DELETE = withTenant<Params>(async (_req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const rule = await getRule(params.ruleId)
  if (!rule || rule.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Regla no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }
  await deleteRule(params.ruleId)
  return NextResponse.json(ok({ deleted: true }))
})
