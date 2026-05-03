import type { OrderPrediction, PredictedTreatment } from '@/src/types/automation'
import { getAIProvider, isAIEnabled } from './provider'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'

interface PatientContext {
  patientId: string
  clinicId: string
  age?: number
  lastVisitDate?: string
  previousTreatments: string[]
  appointmentHistory: { type: string; date: string; attended: boolean }[]
  currentBalance?: number
  notes?: string
}

// ─── Rule-based order prediction ─────────────────────────────────────────────

function predictWithRules(ctx: PatientContext): OrderPrediction {
  const predictions: PredictedTreatment[] = []
  const now = new Date()
  const basedOn: string[] = []

  const daysSinceVisit = ctx.lastVisitDate
    ? (now.getTime() - new Date(ctx.lastVisitDate).getTime()) / 86_400_000
    : 365

  // Annual checkup (every 6-12 months)
  if (daysSinceVisit > 150) {
    predictions.push({
      treatment: 'Revisión y profilaxis',
      probability: 0.85,
      estimatedValueEUR: 120,
      reasoningFactors: [`${Math.round(daysSinceVisit)} días sin visita`],
      recommendedOfferDate: new Date(now.getTime() + 7 * 86_400_000).toISOString().slice(0, 10),
    })
    basedOn.push('long_inactive')
  }

  // Whitening after cleaning
  const hadCleaning = ctx.previousTreatments.some((t) =>
    t.toLowerCase().includes('profilaxis') || t.toLowerCase().includes('limpieza')
  )
  if (hadCleaning && !ctx.previousTreatments.some((t) => t.toLowerCase().includes('blanqueamiento'))) {
    predictions.push({
      treatment: DENTAL_TREATMENTS['blanqueamiento-dental'].name,
      probability: 0.45,
      estimatedValueEUR: DENTAL_TREATMENTS['blanqueamiento-dental'].avgTicketEUR,
      reasoningFactors: ['Profilaxis reciente — momento ideal para blanqueamiento'],
      recommendedOfferDate: new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10),
    })
    basedOn.push('post_cleaning_upsell')
  }

  // Age-based: implants for older patients
  if ((ctx.age ?? 0) >= 45 && !ctx.previousTreatments.some((t) => t.toLowerCase().includes('implante'))) {
    predictions.push({
      treatment: DENTAL_TREATMENTS['implantes-dentales'].name,
      probability: 0.3,
      estimatedValueEUR: DENTAL_TREATMENTS['implantes-dentales'].avgTicketEUR,
      reasoningFactors: [`Paciente de ${ctx.age} años — alta prevalencia de pérdida dental`],
      recommendedOfferDate: new Date(now.getTime() + 30 * 86_400_000).toISOString().slice(0, 10),
    })
    basedOn.push('age_implant_risk')
  }

  // Orthodontics for young adults
  if ((ctx.age ?? 0) >= 16 && (ctx.age ?? 0) <= 35 &&
      !ctx.previousTreatments.some((t) => t.toLowerCase().includes('ortodoncia'))) {
    predictions.push({
      treatment: DENTAL_TREATMENTS['ortodoncia-invisible'].name,
      probability: 0.25,
      estimatedValueEUR: DENTAL_TREATMENTS['ortodoncia-invisible'].avgTicketEUR,
      reasoningFactors: ['Rango de edad con alta demanda de ortodoncia invisible'],
      recommendedOfferDate: new Date(now.getTime() + 21 * 86_400_000).toISOString().slice(0, 10),
    })
    basedOn.push('age_ortho_potential')
  }

  // Outstanding balance = existing treatment to complete
  if ((ctx.currentBalance ?? 0) > 0) {
    predictions.push({
      treatment: 'Continuación de tratamiento en curso',
      probability: 0.75,
      estimatedValueEUR: ctx.currentBalance ?? 0,
      reasoningFactors: [`Saldo pendiente: €${ctx.currentBalance}`],
      recommendedOfferDate: new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10),
    })
    basedOn.push('outstanding_balance')
  }

  const sorted = predictions.sort((a, b) => b.probability - a.probability)
  const estimatedValue = sorted.reduce((s, p) => s + p.estimatedValueEUR * p.probability, 0)
  const overallProbability = sorted[0]?.probability ?? 0

  return {
    clinicId: ctx.clinicId,
    patientId: ctx.patientId,
    predictedTreatments: sorted,
    overallProbability,
    estimatedValue: Math.round(estimatedValue),
    estimatedTimeframe: overallProbability > 0.6 ? 'próximos 30 días' : 'próximos 3 meses',
    recommendedOutreach: overallProbability > 0.7
      ? 'Llamada proactiva esta semana'
      : overallProbability > 0.4
      ? 'Email personalizado en los próximos 7 días'
      : 'Incluir en campaña de reactivación mensual',
    basedOn,
    predictedAt: now.toISOString(),
    providerUsed: 'rule-engine',
  }
}

// ─── AI-enhanced prediction ───────────────────────────────────────────────────

async function predictWithAI(
  ctx: PatientContext,
  base: OrderPrediction
): Promise<OrderPrediction> {
  const provider = getAIProvider()

  const prompt = `
Dental patient treatment prediction. Return JSON only.

Patient profile:
- Age: ${ctx.age ?? 'unknown'}
- Last visit: ${ctx.lastVisitDate ?? 'unknown'}
- Previous treatments: ${ctx.previousTreatments.join(', ') || 'none'}
- Outstanding balance: €${ctx.currentBalance ?? 0}
- Rule-engine top prediction: ${base.predictedTreatments[0]?.treatment ?? 'none'} (${((base.predictedTreatments[0]?.probability ?? 0) * 100).toFixed(0)}%)

Add 1-2 additional predictions the rules may have missed. Return JSON:
{
  "additionalPredictions": [{
    "treatment": "treatment name in Spanish",
    "probability": 0.0-1.0,
    "estimatedValueEUR": number,
    "reasoningFactors": ["factor1"],
    "recommendedOfferDate": "YYYY-MM-DD"
  }],
  "recommendedOutreach": "specific outreach message in Spanish"
}`.trim()

  const result = await provider.complete({
    system: 'You are a dental treatment prediction expert. Analyze patient data and predict likely treatments. Return valid JSON only.',
    prompt,
    maxTokens: 512,
    temperature: 0.3,
    responseSchema: { additionalPredictions: 'array', recommendedOutreach: 'string' },
  })

  const parsed = result.parsed as { additionalPredictions?: PredictedTreatment[]; recommendedOutreach?: string } | undefined
  if (!parsed?.additionalPredictions) return { ...base, providerUsed: 'rule-engine' }

  return {
    ...base,
    predictedTreatments: [...base.predictedTreatments, ...parsed.additionalPredictions].slice(0, 5),
    recommendedOutreach: parsed.recommendedOutreach ?? base.recommendedOutreach,
    predictedAt: new Date().toISOString(),
    providerUsed: 'claude',
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function predictOrders(ctx: PatientContext): Promise<OrderPrediction> {
  const base = predictWithRules(ctx)
  if (!isAIEnabled() || base.predictedTreatments.length === 0) return base
  try {
    return await predictWithAI(ctx, base)
  } catch {
    return base
  }
}
