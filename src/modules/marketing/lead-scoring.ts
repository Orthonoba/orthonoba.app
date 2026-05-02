import type { Lead, LeadActivity, LeadScore, LeadScoreFactor } from '@/src/types/marketing'
import { LEAD_SCORE_GRADES } from '@/src/config/marketing'

const HIGH_VALUE_TREATMENTS = [
  'implantes-dentales', 'estetica-dental', 'carillas-porcelana',
  'ortodoncia-invisible', 'brackets', 'protesis-dental',
]

const ORTHO_TREATMENTS = ['ortodoncia-invisible', 'brackets']

// ─── Pure scoring function ────────────────────────────────────────────────────

export function calculateLeadScore(lead: Lead, activities: LeadActivity[]): LeadScore {
  const factors: LeadScoreFactor[] = []
  let total = 0

  function add(factor: string, points: number, reason: string) {
    if (points !== 0) {
      factors.push({ factor, points, reason })
      total += points
    }
  }

  // Source quality
  const sourcePoints: Record<string, number> = {
    'referral-patient':  25,
    'referral-doctor':   25,
    'doctoralia':        12,
    'topdoctors':        12,
    'google-ads':        15,
    'google-organic':    10,
    'website-form':      8,
    'facebook':          8,
    'instagram':         8,
    'email-campaign':    6,
    'whatsapp':          10,
    'phone':             12,
    'walk-in':           20,
    'tiktok':            5,
    'other':             3,
  }
  const sp = sourcePoints[lead.source] ?? 3
  add('source', sp, `Fuente: ${lead.source}`)

  // Profile completeness
  if (lead.email) add('has_email', 5, 'Email proporcionado')
  if (lead.phone) add('has_phone', 10, 'Teléfono proporcionado')
  if (lead.email && lead.phone) add('full_contact', 5, 'Email + teléfono (bonus)')

  // Treatment interest
  const interests = lead.interestedIn ?? []
  const hasHighValue = interests.some((t) => HIGH_VALUE_TREATMENTS.includes(t))
  const hasOrtho     = interests.some((t) => ORTHO_TREATMENTS.includes(t))
  if (hasHighValue) add('high_value_treatment', 20, 'Interés en tratamiento de alto valor')
  else if (hasOrtho) add('ortho_treatment', 15, 'Interés en ortodoncia')
  else if (interests.length > 0) add('has_interest', 5, 'Tratamiento de interés declarado')

  // Activity scoring
  const activitySet = new Set(activities.map((a) => a.type))
  if (activitySet.has('form_submitted'))        add('form_submitted', 10, 'Formulario enviado')
  if (activitySet.has('email_opened'))          add('email_opened', 3, 'Email abierto')
  if (activitySet.has('email_clicked'))         add('email_clicked', 8, 'Click en email')
  if (activitySet.has('whatsapp_received'))     add('whatsapp_received', 8, 'Respuesta por WhatsApp')
  if (activitySet.has('phone_call'))            add('phone_call', 15, 'Llamada telefónica')
  if (activitySet.has('appointment_booked'))    add('appointment_booked', 30, 'Cita reservada')
  if (activitySet.has('appointment_attended'))  add('appointment_attended', 20, 'Cita asistida')
  if (activitySet.has('appointment_no_show'))   add('appointment_no_show', -10, 'No presentado')

  // Lead status bonus/penalty
  const statusPoints: Record<string, number> = {
    new:                   0,
    contacted:             5,
    qualified:             15,
    'appointment-scheduled': 25,
    converted:             0,
    nurturing:             -5,
    lost:                  -20,
  }
  const statusPts = statusPoints[lead.status] ?? 0
  add('status', statusPts, `Estado: ${lead.status}`)

  // Recency
  const daysSinceCreated = (Date.now() - new Date(lead.createdAt).getTime()) / 86_400_000
  const lastActivity = activities.length > 0
    ? Math.min(...activities.map((a) => (Date.now() - new Date(a.occurredAt).getTime()) / 86_400_000))
    : daysSinceCreated

  if (lastActivity <= 7)       add('recent_activity', 10, 'Actividad reciente (≤7 días)')
  else if (lastActivity > 30)  add('stale', -15, 'Sin actividad en +30 días')

  // Clamp 0–100
  const score = Math.max(0, Math.min(100, total))
  const grade = LEAD_SCORE_GRADES.find((g) => score >= g.min)?.grade ?? 'D'

  return {
    leadId: lead.id,
    clinicId: lead.clinicId,
    score,
    grade,
    factors,
    lastCalculatedAt: new Date().toISOString(),
  }
}
