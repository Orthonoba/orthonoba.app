import type { AILeadQualification, LeadQualificationTier, LeadFlag } from '@/src/types/automation'
import type { Lead, LeadActivity } from '@/src/types/marketing'
import { getAIProvider, isAIEnabled } from './provider'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'

const HIGH_VALUE_TREATMENTS = ['implantes-dentales', 'estetica-dental', 'carillas-porcelana', 'ortodoncia-invisible']

// ─── Rule-based qualification (always available) ──────────────────────────────

function qualifyWithRules(
  lead: Lead,
  activities: LeadActivity[]
): AILeadQualification {
  let score = 0
  const flags: LeadFlag[] = []
  const actions: string[] = []

  // Source quality
  const sourceMap: Record<string, number> = {
    'referral-patient': 35, 'referral-doctor': 35, 'walk-in': 30,
    'phone': 28, 'doctoralia': 25, 'topdoctors': 25,
    'google-ads': 20, 'google-organic': 15, 'website-form': 12,
    'facebook': 10, 'instagram': 10, 'whatsapp': 15,
    'email-campaign': 8, 'tiktok': 5, 'other': 3,
  }
  score += sourceMap[lead.source] ?? 5

  // Contact completeness
  if (lead.email && lead.phone) score += 15
  else if (lead.phone) score += 10
  else if (lead.email) score += 5

  // Treatment interest
  const interests = lead.interestedIn ?? []
  const hasHighValue = interests.some((t) => HIGH_VALUE_TREATMENTS.includes(t))
  if (hasHighValue) { score += 25; flags.push('high_value_treatment') }
  else if (interests.length > 0) score += 10

  // Activity signals
  const actTypes = new Set(activities.map((a) => a.type))
  if (actTypes.has('appointment_booked'))    { score += 30; flags.push('ready_to_book') }
  if (actTypes.has('phone_call'))              score += 20
  if (actTypes.has('whatsapp_received'))       score += 15
  if (actTypes.has('email_clicked'))           score += 8
  if (actTypes.has('appointment_no_show'))   { score -= 15; flags.push('appointment_no_show_risk') }

  // Multiple failed contacts
  const failedContacts = activities.filter((a) => a.type === 'phone_call').length
  if (failedContacts >= 3) flags.push('multiple_contacts_failed')

  // Vip referral
  if (lead.source === 'referral-doctor') flags.push('vip_referral')

  // Financing hint from notes
  if (lead.notes?.toLowerCase().match(/financiaci|precio|caro|pagar/)) flags.push('needs_financing')

  // Estimated revenue
  const primaryTreatment = interests[0] ? DENTAL_TREATMENTS[interests[0] as keyof typeof DENTAL_TREATMENTS] : null
  const estimatedRevenue = primaryTreatment?.avgTicketEUR ?? 800
  const estimatedClosingDays = primaryTreatment?.avgClosingDays ?? 14

  score = Math.min(100, score)
  const tier: LeadQualificationTier =
    score >= 70 ? 'hot' :
    score >= 45 ? 'warm' :
    score >= 20 ? 'cold' : 'disqualified'

  const urgency =
    tier === 'hot' ? 'immediate' :
    tier === 'warm' ? 'this-week' :
    tier === 'cold' ? 'this-month' : 'low'

  // Recommended actions
  if (tier === 'hot' && !actTypes.has('appointment_booked')) {
    actions.push('Llamar en las próximas 2 horas para cerrar cita')
  }
  if (flags.includes('needs_financing')) {
    actions.push('Ofrecer plan de financiación sin intereses')
  }
  if (flags.includes('multiple_contacts_failed')) {
    actions.push('Cambiar canal de contacto — intentar WhatsApp')
  }
  if (flags.includes('vip_referral')) {
    actions.push('Asignar al doctor senior — lead de alta calidad')
  }
  if (tier === 'cold') {
    actions.push('Inscribir en secuencia de email nurturing 30 días')
  }

  const nextBestAction = actions[0] ?? 'Enviar email de seguimiento personalizado'

  const reasoning = `Lead calificado como ${tier.toUpperCase()} (score: ${score}/100). ` +
    `Fuente: ${lead.source}. ` +
    (interests.length > 0 ? `Interés en: ${interests.join(', ')}. ` : '') +
    (flags.length > 0 ? `Señales: ${flags.join(', ')}.` : '')

  return {
    leadId: lead.id,
    clinicId: lead.clinicId,
    tier,
    score,
    confidence: isAIEnabled() ? 0.7 : 0.85,
    reasoning,
    recommendedActions: actions,
    estimatedRevenue,
    estimatedClosingDays,
    nextBestAction,
    urgency,
    flags,
    qualifiedAt: new Date().toISOString(),
    providerUsed: 'rule-engine',
  }
}

// ─── AI-powered qualification (when Claude available) ────────────────────────

async function qualifyWithAI(
  lead: Lead,
  activities: LeadActivity[],
  baseQualification: AILeadQualification
): Promise<AILeadQualification> {
  const provider = getAIProvider()

  const activitySummary = activities.slice(-10).map((a) =>
    `${a.type} — ${a.description} (${new Date(a.occurredAt).toLocaleDateString('es-ES')})`
  ).join('\n')

  const prompt = `
Qualify this dental clinic lead. Return JSON only.

Lead data:
- Name: ${lead.name}
- Source: ${lead.source}
- Status: ${lead.status}
- Interested in: ${(lead.interestedIn ?? []).join(', ') || 'unknown'}
- Notes: ${lead.notes ?? 'none'}
- Days since created: ${Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)}
- Rule-engine score: ${baseQualification.score}/100
- Detected flags: ${baseQualification.flags.join(', ') || 'none'}

Recent activity (last 10 events):
${activitySummary || 'No activity recorded'}

Return this JSON:
{
  "tier": "hot|warm|cold|disqualified",
  "score": 0-100,
  "confidence": 0.0-1.0,
  "reasoning": "concise explanation in Spanish",
  "nextBestAction": "single specific action to take now",
  "urgency": "immediate|this-week|this-month|low",
  "estimatedRevenue": number_eur,
  "estimatedClosingDays": number
}`.trim()

  const result = await provider.complete({
    system: 'You are an expert dental clinic CRM advisor. Analyze leads and return structured JSON qualification. Be concise and specific. Always output valid JSON.',
    prompt,
    maxTokens: 512,
    temperature: 0.2,
    responseSchema: { tier: 'string', score: 'number', confidence: 'number', reasoning: 'string', nextBestAction: 'string', urgency: 'string', estimatedRevenue: 'number', estimatedClosingDays: 'number' },
  })

  const parsed = result.parsed as Partial<AILeadQualification> | undefined
  if (!parsed?.tier) return { ...baseQualification, providerUsed: 'rule-engine' }

  return {
    ...baseQualification,
    tier: parsed.tier as LeadQualificationTier,
    score: Number(parsed.score ?? baseQualification.score),
    confidence: Number(parsed.confidence ?? 0.9),
    reasoning: String(parsed.reasoning ?? baseQualification.reasoning),
    nextBestAction: String(parsed.nextBestAction ?? baseQualification.nextBestAction),
    urgency: (parsed.urgency as AILeadQualification['urgency']) ?? baseQualification.urgency,
    estimatedRevenue: Number(parsed.estimatedRevenue ?? baseQualification.estimatedRevenue),
    estimatedClosingDays: Number(parsed.estimatedClosingDays ?? baseQualification.estimatedClosingDays),
    qualifiedAt: new Date().toISOString(),
    providerUsed: 'claude',
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function qualifyLead(
  lead: Lead,
  activities: LeadActivity[] = []
): Promise<AILeadQualification> {
  const base = qualifyWithRules(lead, activities)
  if (!isAIEnabled()) return base

  try {
    return await qualifyWithAI(lead, activities, base)
  } catch {
    return base
  }
}

export async function qualifyLeadBatch(
  leads: { lead: Lead; activities: LeadActivity[] }[]
): Promise<AILeadQualification[]> {
  return Promise.all(leads.map(({ lead, activities }) => qualifyLead(lead, activities)))
}
