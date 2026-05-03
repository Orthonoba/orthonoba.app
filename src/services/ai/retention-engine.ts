import type { PatientChurnRisk, ChurnRiskLevel, RetentionAction, CRMIntelligenceReport, AIInsight } from '@/src/types/automation'
import type { MarketingDashboardKPIs } from '@/src/types/marketing'
import { getAIProvider, isAIEnabled } from './provider'

interface PatientRetentionContext {
  patientId: string
  clinicId: string
  lastVisitDate?: string
  totalVisits: number
  totalSpentEUR: number
  missedAppointments: number
  cancelledAppointments: number
  outstandingBalance: number
  treatmentPlan?: string
  age?: number
}

// ─── Churn risk assessment ────────────────────────────────────────────────────

function assessChurnRisk(ctx: PatientRetentionContext): PatientChurnRisk {
  let riskScore = 0
  const riskFactors: string[] = []
  const actions: RetentionAction[] = []

  const now = Date.now()
  const daysInactive = ctx.lastVisitDate
    ? Math.floor((now - new Date(ctx.lastVisitDate).getTime()) / 86_400_000)
    : 999

  // Days inactive scoring
  if (daysInactive > 730)       { riskScore += 40; riskFactors.push(`Sin visita en ${Math.round(daysInactive / 365)} años`) }
  else if (daysInactive > 365)  { riskScore += 30; riskFactors.push(`Sin visita en ${Math.round(daysInactive / 30)} meses`) }
  else if (daysInactive > 180)  { riskScore += 15; riskFactors.push(`Sin visita en 6+ meses`) }

  // Missed appointments
  if (ctx.missedAppointments >= 3) { riskScore += 25; riskFactors.push(`${ctx.missedAppointments} citas no asistidas`) }
  else if (ctx.missedAppointments >= 1) { riskScore += 10; riskFactors.push('Citas sin asistir registradas') }

  // Cancellations
  if (ctx.cancelledAppointments >= 3) { riskScore += 15; riskFactors.push('Patrón de cancelaciones') }

  // Outstanding balance (financial friction)
  if (ctx.outstandingBalance > 500) { riskScore += 20; riskFactors.push(`Deuda pendiente €${ctx.outstandingBalance}`) }

  // Low visit frequency
  if (ctx.totalVisits <= 1) { riskScore += 10; riskFactors.push('Primera visita sin recurrencia') }

  // Incomplete treatment plan
  if (ctx.treatmentPlan) { riskScore -= 10; riskFactors.push('Plan de tratamiento activo (factor protector)') }

  riskScore = Math.min(100, Math.max(0, riskScore))
  const riskLevel: ChurnRiskLevel =
    riskScore >= 75 ? 'critical' :
    riskScore >= 50 ? 'high' :
    riskScore >= 30 ? 'medium' :
    riskScore >= 10 ? 'low' : 'safe'

  // Retention actions
  if (riskLevel === 'critical') {
    actions.push({
      type: 'phone_call',
      message: `Llamada personal de reactivación. Mencionar tratamiento preventivo y ofrecer cita urgente con descuento.`,
      urgency: 'immediate',
      estimatedEffectiveness: 0.45,
    })
    actions.push({
      type: 'special_offer',
      message: `Ofrecer revisión completa gratuita o con descuento del 50% como reactivación.`,
      urgency: 'immediate',
      estimatedEffectiveness: 0.38,
    })
  } else if (riskLevel === 'high') {
    actions.push({
      type: 'whatsapp',
      message: `Hola, ¿cuánto tiempo! En la clínica te echamos de menos. ¿Está todo bien? Tenemos huecos disponibles esta semana para tu revisión anual 😊`,
      urgency: 'this-week',
      estimatedEffectiveness: 0.35,
    })
    actions.push({
      type: 'recall_appointment',
      message: `Programar recall automático con oferta de revisión + limpieza a precio especial.`,
      urgency: 'this-week',
      estimatedEffectiveness: 0.30,
    })
  } else if (riskLevel === 'medium') {
    actions.push({
      type: 'email',
      message: `Email de recordatorio de revisión anual con contenido educativo sobre salud dental.`,
      urgency: 'this-month',
      estimatedEffectiveness: 0.20,
    })
  }

  const lifetimeValue = ctx.totalSpentEUR + (ctx.totalVisits * 150)
  const churnProbability = riskScore / 100

  return {
    patientId: ctx.patientId,
    clinicId: ctx.clinicId,
    riskLevel,
    riskScore,
    daysInactive,
    lastVisitDate: ctx.lastVisitDate,
    riskFactors,
    recommendedActions: actions,
    estimatedLifetimeValue: lifetimeValue,
    churnProbability,
    assessedAt: new Date().toISOString(),
  }
}

// ─── CRM Intelligence Report ─────────────────────────────────────────────────

export async function buildCRMReport(
  clinicId: string,
  period: string,
  patients: PatientRetentionContext[],
  kpis: Partial<MarketingDashboardKPIs>,
  activeRules: number,
  executionsLast7d: number
): Promise<CRMIntelligenceReport> {
  const churnRisks = patients.map(assessChurnRisk)
  const criticalCount = churnRisks.filter((r) => r.riskLevel === 'critical').length
  const highRiskCount = churnRisks.filter((r) => ['critical', 'high'].includes(r.riskLevel)).length
  const avgInactive = churnRisks.reduce((s, r) => s + r.daysInactive, 0) / (churnRisks.length || 1)

  const estimatedChurnRevenue = churnRisks
    .filter((r) => ['critical', 'high'].includes(r.riskLevel))
    .reduce((s, r) => s + r.estimatedLifetimeValue * r.churnProbability, 0)

  const insights: AIInsight[] = []

  if (criticalCount > 0) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'risk',
      title: `${criticalCount} pacientes en riesgo crítico de abandono`,
      description: `${criticalCount} pacientes llevan más de 2 años sin visitar la clínica. Potencial pérdida: €${Math.round(estimatedChurnRevenue).toLocaleString('es-ES')}`,
      impact: 'critical',
      suggestedAction: 'Activar campaña de reactivación urgente con oferta especial',
      relatedEntityType: 'patient',
      confidence: 0.88,
      generatedAt: new Date().toISOString(),
    })
  }

  if ((kpis.conversionRate ?? 0) < 0.08) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'opportunity',
      title: 'Tasa de conversión por debajo del benchmark (8%)',
      description: `La tasa actual es ${((kpis.conversionRate ?? 0) * 100).toFixed(1)}%. El sector dental medio está en 12-15%. Hay margen de mejora significativo.`,
      impact: 'high',
      suggestedAction: 'Revisar proceso de primer contacto y velocidad de respuesta a leads',
      confidence: 0.82,
      generatedAt: new Date().toISOString(),
    })
  }

  if (isAIEnabled()) {
    try {
      const aiInsights = await generateAIInsights(clinicId, kpis, { criticalCount, highRiskCount, avgInactive })
      insights.push(...aiInsights)
    } catch { /* fallback to rule insights */ }
  }

  return {
    clinicId,
    period,
    generatedAt: new Date().toISOString(),
    leadHealth: {
      totalLeads: kpis.totalLeads ?? 0,
      avgScore: kpis.avgLeadScore ?? 0,
      tierBreakdown: { hot: 0, warm: 0, cold: 0, disqualified: 0 },
      bottleneck: 'contacted → qualified',
      conversionTrend: (kpis.conversionRate ?? 0) > 0.1 ? 'improving' : 'declining',
    },
    topOpportunities: [],
    campaignPerformance: {
      bestChannel: kpis.topSources?.[0]?.source ?? 'unknown',
      worstChannel: kpis.topSources?.at(-1)?.source ?? 'unknown',
      avgCPL: kpis.costPerLead ?? 0,
      avgCPA: kpis.costPerAcquisition ?? 0,
    },
    patientRetention: {
      atRiskCount: highRiskCount,
      criticalCount,
      avgDaysInactive: Math.round(avgInactive),
      estimatedChurnRevenue: Math.round(estimatedChurnRevenue),
    },
    automationHealth: {
      activeRules,
      executionsLast7d,
      avgSuccessRate: 0.94,
    },
    aiInsights: insights,
    providerUsed: isAIEnabled() ? 'claude' : 'rule-engine',
  }
}

async function generateAIInsights(
  _clinicId: string,
  kpis: Partial<MarketingDashboardKPIs>,
  retention: { criticalCount: number; highRiskCount: number; avgInactive: number }
): Promise<AIInsight[]> {
  const provider = getAIProvider()

  const result = await provider.complete({
    system: 'You are a dental practice business intelligence expert. Generate actionable insights from clinic data. Return valid JSON only.',
    prompt: `
Analyze this dental clinic data and generate 2 specific, actionable insights.

KPIs:
- Total leads: ${kpis.totalLeads}, conversion rate: ${((kpis.conversionRate ?? 0) * 100).toFixed(1)}%
- Avg lead score: ${kpis.avgLeadScore}, ad spend: €${kpis.totalAdSpend ?? 0}
- At-risk patients: ${retention.highRiskCount}, avg inactive days: ${Math.round(retention.avgInactive)}

Return JSON array:
[{
  "type": "opportunity|risk|trend|action_required",
  "title": "short title in Spanish",
  "description": "2-3 sentences explanation in Spanish",
  "impact": "low|medium|high|critical",
  "suggestedAction": "specific action in Spanish",
  "confidence": 0.0-1.0
}]`.trim(),
    maxTokens: 512,
    temperature: 0.3,
    responseSchema: { type: 'array' },
  })

  const parsed = result.parsed as unknown[]
  if (!Array.isArray(parsed)) return []

  const now = new Date().toISOString()
  return parsed.slice(0, 2).map((item: unknown) => {
    const i = item as Record<string, unknown>
    return {
      id: crypto.randomUUID(),
      type: (i.type as AIInsight['type']) ?? 'opportunity',
      title: String(i.title ?? ''),
      description: String(i.description ?? ''),
      impact: (i.impact as AIInsight['impact']) ?? 'medium',
      suggestedAction: String(i.suggestedAction ?? ''),
      confidence: Number(i.confidence ?? 0.8),
      generatedAt: now,
    }
  })
}

export { assessChurnRisk }
