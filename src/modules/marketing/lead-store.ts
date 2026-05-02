import type { Lead, LeadActivity, LeadScore } from '@/src/types/marketing'
import type { LeadFilters } from './service'
import { calculateLeadScore } from './lead-scoring'

// ─── In-memory store (swap → Neon DB) ────────────────────────────────────────

const leads     = new Map<string, Lead>()
const activities = new Map<string, LeadActivity[]>()
const scores    = new Map<string, LeadScore>()

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const now = new Date().toISOString()
  const lead: Lead = { ...data, id: crypto.randomUUID(), createdAt: now }
  leads.set(lead.id, lead)
  const scored = await refreshLeadScore(lead.id)
  return { ...lead, score: scored?.score, scoreGrade: scored?.grade }
}

export async function getLead(clinicId: string, leadId: string): Promise<Lead | null> {
  const lead = leads.get(leadId)
  return lead?.clinicId === clinicId ? lead : null
}

export async function updateLead(clinicId: string, leadId: string, data: Partial<Lead>): Promise<Lead | null> {
  const lead = leads.get(leadId)
  if (!lead || lead.clinicId !== clinicId) return null
  const updated: Lead = { ...lead, ...data, updatedAt: new Date().toISOString() }
  leads.set(leadId, updated)
  return updated
}

export async function listLeads(
  clinicId: string,
  filters: LeadFilters = {}
): Promise<{ data: Lead[]; total: number }> {
  let result = Array.from(leads.values()).filter((l) => l.clinicId === clinicId)

  if (filters.status)     result = result.filter((l) => l.status === filters.status)
  if (filters.source)     result = result.filter((l) => l.source === filters.source)
  if (filters.assignedTo) result = result.filter((l) => l.assignedTo === filters.assignedTo)
  if (filters.campaignId) result = result.filter((l) => l.campaignId === filters.campaignId)
  if (filters.scoreGrade) result = result.filter((l) => l.scoreGrade === filters.scoreGrade)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q)
    )
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const page  = filters.page  ?? 1
  const limit = filters.limit ?? 20
  const total = result.length
  const data  = result.slice((page - 1) * limit, page * limit)

  return { data, total }
}

// ─── Activity log ─────────────────────────────────────────────────────────────

export async function addLeadActivity(
  activity: Omit<LeadActivity, 'id'>
): Promise<LeadActivity> {
  const record: LeadActivity = { ...activity, id: crypto.randomUUID() }
  const existing = activities.get(activity.leadId) ?? []
  existing.push(record)
  activities.set(activity.leadId, existing)
  // Re-score after significant activities
  await refreshLeadScore(activity.leadId)
  return record
}

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  return activities.get(leadId) ?? []
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export async function refreshLeadScore(leadId: string): Promise<LeadScore | null> {
  const lead = leads.get(leadId)
  if (!lead) return null
  const leadActivities = activities.get(leadId) ?? []
  const score = calculateLeadScore(lead, leadActivities)
  scores.set(leadId, score)
  // Persist grade on lead record
  leads.set(leadId, { ...lead, score: score.score, scoreGrade: score.grade })
  return score
}

export async function getLeadScore(leadId: string): Promise<LeadScore | null> {
  return scores.get(leadId) ?? null
}
