import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { assessChurnRisk } from '@/src/services/ai/retention-engine'
import { isAIEnabled } from '@/src/services/ai/provider'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

const patientSchema = z.object({
  patientId:               z.string().uuid(),
  lastVisitDate:           z.string().datetime({ offset: true }).optional(),
  totalVisits:             z.number().int().nonnegative().default(0),
  totalSpentEUR:           z.number().nonnegative().default(0),
  missedAppointments:      z.number().int().nonnegative().default(0),
  cancelledAppointments:   z.number().int().nonnegative().default(0),
  outstandingBalance:      z.number().nonnegative().default(0),
  treatmentPlan:           z.string().optional(),
  age:                     z.number().int().optional(),
})

const batchSchema = z.object({
  patients: z.array(patientSchema).min(1).max(200),
})

// POST /api/v1/ai/retention/risks
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const risks = parsed.data.patients.map((p) => assessChurnRisk({ ...p, clinicId: tenant.clinicId }))

  const summary = {
    total: risks.length,
    critical: risks.filter((r) => r.riskLevel === 'critical').length,
    high:     risks.filter((r) => r.riskLevel === 'high').length,
    medium:   risks.filter((r) => r.riskLevel === 'medium').length,
    low:      risks.filter((r) => r.riskLevel === 'low').length,
    safe:     risks.filter((r) => r.riskLevel === 'safe').length,
    estimatedChurnRevenue: risks
      .filter((r) => ['critical', 'high'].includes(r.riskLevel))
      .reduce((s, r) => s + r.estimatedLifetimeValue * r.churnProbability, 0),
  }

  const prioritized = risks.sort((a, b) => b.riskScore - a.riskScore)

  return NextResponse.json(ok({ risks: prioritized, summary, aiEnabled: isAIEnabled() }))
})
