import type { CampaignSuggestion } from '@/src/types/automation'
import type { MarketingDashboardKPIs } from '@/src/types/marketing'
import { getAIProvider, isAIEnabled } from './provider'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'

// ─── Rule-based campaign suggestions ─────────────────────────────────────────

function buildRuleSuggestions(
  clinicId: string,
  kpis: Partial<MarketingDashboardKPIs>,
  seasonalMonth: number
): CampaignSuggestion[] {
  const suggestions: CampaignSuggestion[] = []
  const now = new Date().toISOString()

  // Low leads → Google Ads push
  if ((kpis.newLeads ?? 0) < 20) {
    suggestions.push({
      id: crypto.randomUUID(),
      clinicId,
      title: 'Campaña Google Ads urgente — captación de leads',
      type: 'sem-google',
      reasoning: 'El volumen de leads nuevos está por debajo del umbral óptimo (20/mes). Google Search Ads con keywords de alta intención es el canal más eficiente para captación inmediata.',
      expectedLeads: 35,
      expectedConversionRate: 0.15,
      estimatedROI: 4.2,
      suggestedBudgetEUR: 800,
      suggestedDuration: '30 días',
      targetAudience: 'Usuarios buscando tratamientos dentales en radio 15km',
      primaryChannel: 'google-ads',
      keyMessages: ['Primera consulta gratis', 'Tecnología de última generación', 'Financiación disponible'],
      suggestedHeadlines: DENTAL_TREATMENTS['implantes-dentales'].adHeadlines.slice(0, 3),
      urgency: 'high',
      basedOn: ['low_lead_volume'],
      generatedAt: now,
      providerUsed: 'rule-engine',
    })
  }

  // Low conversion rate → nurturing campaign
  if ((kpis.conversionRate ?? 0) < 0.1) {
    suggestions.push({
      id: crypto.randomUUID(),
      clinicId,
      title: 'Secuencia de email nurturing para leads fríos',
      type: 'email',
      reasoning: 'La tasa de conversión es baja. Un 30% de los leads fríos puede recuperarse con secuencias de email educativas y personalizadas.',
      expectedLeads: 0,
      expectedConversionRate: 0.08,
      estimatedROI: 8.5,
      suggestedBudgetEUR: 150,
      suggestedDuration: '60 días',
      targetAudience: 'Leads con status "cold" o "nurturing" en los últimos 90 días',
      primaryChannel: 'email',
      keyMessages: ['Educación sobre tratamientos', 'Casos de éxito', 'Oferta especial'],
      suggestedHeadlines: ['¿Sigues pensando en tu sonrisa?', 'Te guardamos tu presupuesto', 'Últimas plazas del mes'],
      urgency: 'medium',
      basedOn: ['low_conversion_rate'],
      generatedAt: now,
      providerUsed: 'rule-engine',
    })
  }

  // Seasonal: January (new year resolutions) → whitening/ortho
  if (seasonalMonth === 1) {
    suggestions.push({
      id: crypto.randomUUID(),
      clinicId,
      title: 'Campaña "Sonrisa de Año Nuevo" — enero',
      type: 'facebook-ads',
      reasoning: 'Enero es el mes de mayor intención de cambio. Las búsquedas de ortodoncia y blanqueamiento aumentan un 35% en enero vs media anual.',
      expectedLeads: 28,
      expectedConversionRate: 0.18,
      estimatedROI: 5.1,
      suggestedBudgetEUR: 600,
      suggestedDuration: '31 días',
      targetAudience: 'Adultos 25-45, interesados en salud y bienestar, radio 20km',
      primaryChannel: 'facebook-ads',
      keyMessages: ['Empieza el año con tu mejor sonrisa', 'Financiación 0% en enero'],
      suggestedHeadlines: DENTAL_TREATMENTS['ortodoncia-invisible'].adHeadlines.slice(0, 3),
      urgency: 'high',
      basedOn: ['seasonal_january', 'new_year_intent'],
      generatedAt: now,
      providerUsed: 'rule-engine',
    })
  }

  // Summer: June/July → whitening peak
  if ([6, 7].includes(seasonalMonth)) {
    suggestions.push({
      id: crypto.randomUUID(),
      clinicId,
      title: 'Campaña de verano — blanqueamiento dental',
      type: 'instagram-ads',
      reasoning: 'Junio-julio registra el pico anual de búsquedas de blanqueamiento dental (+48%). Instagram es ideal para este tratamiento visual.',
      expectedLeads: 22,
      expectedConversionRate: 0.22,
      estimatedROI: 6.3,
      suggestedBudgetEUR: 400,
      suggestedDuration: '45 días',
      targetAudience: 'Adultos 20-40, interesados en belleza y bienestar',
      primaryChannel: 'instagram-ads',
      keyMessages: ['Sonrisa de verano', 'Resultado en 1 sesión', 'Reserva antes del verano'],
      suggestedHeadlines: DENTAL_TREATMENTS['blanqueamiento-dental'].adHeadlines.slice(0, 3),
      urgency: 'high',
      basedOn: ['seasonal_summer', 'whitening_peak'],
      generatedAt: now,
      providerUsed: 'rule-engine',
    })
  }

  // Low reviews → review request campaign
  if ((kpis.reviewStats?.avgRating ?? 5) < 4.0 || (kpis.reviewStats?.totalReviews ?? 100) < 50) {
    suggestions.push({
      id: crypto.randomUUID(),
      clinicId,
      title: 'Campaña de captación de reseñas Google',
      type: 'whatsapp',
      reasoning: 'Las clínicas con +50 reseñas Google consiguen un 40% más de leads orgánicos. WhatsApp tiene una tasa de apertura del 98%.',
      expectedLeads: 5,
      expectedConversionRate: 0.35,
      estimatedROI: 12.0,
      suggestedBudgetEUR: 0,
      suggestedDuration: '30 días',
      targetAudience: 'Pacientes satisfechos de los últimos 6 meses',
      primaryChannel: 'whatsapp',
      keyMessages: ['Tu opinión nos ayuda a mejorar', 'Solo 30 segundos'],
      suggestedHeadlines: ['¿Nos ayudas con una reseña? 🌟'],
      urgency: 'medium',
      basedOn: ['low_review_count', 'seo_opportunity'],
      generatedAt: now,
      providerUsed: 'rule-engine',
    })
  }

  return suggestions
}

// ─── AI-powered suggestions ───────────────────────────────────────────────────

async function enrichWithAI(
  clinicId: string,
  base: CampaignSuggestion[],
  kpis: Partial<MarketingDashboardKPIs>
): Promise<CampaignSuggestion[]> {
  const provider = getAIProvider()

  const prompt = `
You are a dental marketing expert. Based on this clinic's performance data, suggest 2 additional campaigns NOT already covered.

Current KPIs:
- Total leads: ${kpis.totalLeads ?? 0}
- Conversion rate: ${((kpis.conversionRate ?? 0) * 100).toFixed(1)}%
- Total ad spend: €${kpis.totalAdSpend ?? 0}
- Top lead source: ${kpis.topSources?.[0]?.source ?? 'unknown'}
- Average lead score: ${kpis.avgLeadScore ?? 0}

Already suggested: ${base.map((s) => s.type).join(', ')}

Return JSON array of 2 campaign objects:
[{
  "title": "campaign title in Spanish",
  "type": "seo|sem-google|facebook-ads|instagram-ads|email|whatsapp|referral",
  "reasoning": "why this campaign makes sense (Spanish)",
  "expectedLeads": number,
  "expectedConversionRate": 0.0-1.0,
  "estimatedROI": number,
  "suggestedBudgetEUR": number,
  "suggestedDuration": "X días",
  "targetAudience": "description",
  "primaryChannel": "channel name",
  "keyMessages": ["msg1", "msg2"],
  "suggestedHeadlines": ["h1", "h2"],
  "urgency": "low|medium|high"
}]`.trim()

  const result = await provider.complete({
    system: 'You are a dental marketing expert with deep knowledge of dental patient acquisition in Spain. Always respond with valid JSON only.',
    prompt,
    maxTokens: 1024,
    temperature: 0.4,
    responseSchema: { type: 'array' },
  })

  const parsed = result.parsed as unknown[]
  if (!Array.isArray(parsed)) return base

  const now = new Date().toISOString()
  const aiSuggestions: CampaignSuggestion[] = parsed.slice(0, 2).map((s: unknown) => {
    const item = s as Record<string, unknown>
    return {
      id: crypto.randomUUID(),
      clinicId,
      title: String(item.title ?? ''),
      type: String(item.type ?? 'email'),
      reasoning: String(item.reasoning ?? ''),
      expectedLeads: Number(item.expectedLeads ?? 10),
      expectedConversionRate: Number(item.expectedConversionRate ?? 0.1),
      estimatedROI: Number(item.estimatedROI ?? 3),
      suggestedBudgetEUR: Number(item.suggestedBudgetEUR ?? 300),
      suggestedDuration: String(item.suggestedDuration ?? '30 días'),
      targetAudience: String(item.targetAudience ?? ''),
      primaryChannel: String(item.primaryChannel ?? ''),
      keyMessages: (item.keyMessages as string[]) ?? [],
      suggestedHeadlines: (item.suggestedHeadlines as string[]) ?? [],
      urgency: (item.urgency as 'low' | 'medium' | 'high') ?? 'medium',
      basedOn: ['ai_analysis'],
      generatedAt: now,
      providerUsed: 'claude',
    }
  })

  return [...base, ...aiSuggestions]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getCampaignSuggestions(
  clinicId: string,
  kpis: Partial<MarketingDashboardKPIs> = {}
): Promise<CampaignSuggestion[]> {
  const month = new Date().getMonth() + 1
  const base = buildRuleSuggestions(clinicId, kpis, month)

  if (!isAIEnabled()) return base.slice(0, 5)

  try {
    return await enrichWithAI(clinicId, base, kpis)
  } catch {
    return base.slice(0, 5)
  }
}
