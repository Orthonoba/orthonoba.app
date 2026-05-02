import type {
  Campaign, CampaignMetric, CampaignAnalytics,
  GoogleAdsCampaign, MetaCampaign,
  LandingPage, LeadFunnel, FunnelSubmission,
  SeoPage, SocialPost, SocialSchedule,
  MarketingTemplate, MarketingDashboardKPIs,
  ReviewRequest, ReferralProgram, ReferralLink,
} from '@/src/types/marketing'

// ─── In-memory stores (swap → Neon DB) ───────────────────────────────────────

const campaigns      = new Map<string, Campaign>()
const metrics        = new Map<string, CampaignMetric[]>()   // key = campaignId
const googleAds      = new Map<string, GoogleAdsCampaign>()
const metaAds        = new Map<string, MetaCampaign>()
const landingPages   = new Map<string, LandingPage>()
const funnels        = new Map<string, LeadFunnel>()
const submissions    = new Map<string, FunnelSubmission[]>()  // key = funnelId
const seoPages       = new Map<string, SeoPage>()             // key = clinicId:slug
const socialPosts    = new Map<string, SocialPost>()
const schedules      = new Map<string, SocialSchedule>()
const templates      = new Map<string, MarketingTemplate>()
const reviewRequests = new Map<string, ReviewRequest>()
const referrals      = new Map<string, ReferralProgram>()
const referralLinks  = new Map<string, ReferralLink>()

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const now = new Date().toISOString()
  const c: Campaign = { ...data, id: crypto.randomUUID(), createdAt: now }
  campaigns.set(c.id, c)
  return c
}

export async function getCampaign(clinicId: string, id: string): Promise<Campaign | null> {
  const c = campaigns.get(id)
  return c?.clinicId === clinicId ? c : null
}

export async function listCampaigns(clinicId: string): Promise<Campaign[]> {
  return Array.from(campaigns.values())
    .filter((c) => c.clinicId === clinicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateCampaign(clinicId: string, id: string, data: Partial<Campaign>): Promise<Campaign | null> {
  const c = campaigns.get(id)
  if (!c || c.clinicId !== clinicId) return null
  const updated = { ...c, ...data, updatedAt: new Date().toISOString() }
  campaigns.set(id, updated)
  return updated
}

export async function deleteCampaign(clinicId: string, id: string): Promise<boolean> {
  const c = campaigns.get(id)
  if (!c || c.clinicId !== clinicId) return false
  campaigns.delete(id)
  return true
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export async function trackMetric(data: Omit<CampaignMetric, 'id' | 'createdAt'>): Promise<CampaignMetric> {
  const metric: CampaignMetric = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  const existing = metrics.get(data.campaignId) ?? []
  existing.push(metric)
  metrics.set(data.campaignId, existing)
  return metric
}

export async function getCampaignAnalytics(
  clinicId: string,
  campaignId: string,
  period: string
): Promise<CampaignAnalytics> {
  const campaign = campaigns.get(campaignId)
  if (!campaign || campaign.clinicId !== clinicId) {
    return buildEmptyAnalytics(campaignId, clinicId, period)
  }
  const daily = metrics.get(campaignId) ?? []
  return aggregateAnalytics(campaignId, clinicId, period, daily)
}

function aggregateAnalytics(
  campaignId: string, clinicId: string, period: string, daily: CampaignMetric[]
): CampaignAnalytics {
  const impressions = daily.reduce((s, m) => s + (m.impressions ?? 0), 0)
  const clicks      = daily.reduce((s, m) => s + (m.clicks ?? 0), 0)
  const leads       = daily.reduce((s, m) => s + (m.leads ?? 0), 0)
  const conversions = daily.reduce((s, m) => s + (m.conversions ?? 0), 0)
  const spend       = daily.reduce((s, m) => s + (m.spend ?? 0), 0)
  const revenue     = conversions * 500  // TODO: pull from actual invoice data
  return {
    campaignId, clinicId, period,
    impressions, clicks, leads, conversions, spend, revenue,
    ctr:  impressions > 0 ? clicks / impressions : 0,
    cpc:  clicks > 0 ? spend / clicks : 0,
    cpa:  conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? revenue / spend : 0,
    dailyBreakdown: daily,
    attributionModel: 'last-click',
  }
}

function buildEmptyAnalytics(campaignId: string, clinicId: string, period: string): CampaignAnalytics {
  return {
    campaignId, clinicId, period,
    impressions: 0, clicks: 0, leads: 0, conversions: 0,
    spend: 0, revenue: 0, ctr: 0, cpc: 0, cpa: 0, roas: 0,
    dailyBreakdown: [], attributionModel: 'last-click',
  }
}

// ─── Google Ads ───────────────────────────────────────────────────────────────

export async function upsertGoogleAdsCampaign(data: GoogleAdsCampaign): Promise<GoogleAdsCampaign> {
  googleAds.set(data.id, data)
  return data
}

export async function createGoogleAdsCampaign(
  data: Omit<GoogleAdsCampaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GoogleAdsCampaign> {
  const now = new Date().toISOString()
  const c: GoogleAdsCampaign = { ...data, id: crypto.randomUUID(), createdAt: now }
  googleAds.set(c.id, c)
  return c
}

export async function listGoogleAdsCampaigns(clinicId: string): Promise<GoogleAdsCampaign[]> {
  return Array.from(googleAds.values()).filter((c) => c.clinicId === clinicId)
}

// ─── Meta Ads ─────────────────────────────────────────────────────────────────

export async function createMetaCampaign(
  data: Omit<MetaCampaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MetaCampaign> {
  const now = new Date().toISOString()
  const c: MetaCampaign = { ...data, id: crypto.randomUUID(), createdAt: now }
  metaAds.set(c.id, c)
  return c
}

export async function listMetaCampaigns(clinicId: string): Promise<MetaCampaign[]> {
  return Array.from(metaAds.values()).filter((c) => c.clinicId === clinicId)
}

// ─── Landing Pages ────────────────────────────────────────────────────────────

export async function createLandingPage(
  data: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'submissions'>
): Promise<LandingPage> {
  const now = new Date().toISOString()
  const page: LandingPage = { ...data, id: crypto.randomUUID(), views: 0, submissions: 0, createdAt: now }
  landingPages.set(page.id, page)
  return page
}

export async function getLandingPage(id: string): Promise<LandingPage | null> {
  return landingPages.get(id) ?? null
}

export async function getLandingPageBySlug(clinicId: string, slug: string): Promise<LandingPage | null> {
  for (const p of landingPages.values()) {
    if (p.clinicId === clinicId && p.slug === slug) return p
  }
  return null
}

export async function listLandingPages(clinicId: string): Promise<LandingPage[]> {
  return Array.from(landingPages.values()).filter((p) => p.clinicId === clinicId)
}

export async function incrementLandingPageView(id: string): Promise<void> {
  const p = landingPages.get(id)
  if (p) landingPages.set(id, { ...p, views: p.views + 1 })
}

export async function incrementLandingPageSubmission(id: string): Promise<void> {
  const p = landingPages.get(id)
  if (p) {
    const submissions = p.submissions + 1
    landingPages.set(id, {
      ...p,
      submissions,
      conversionRate: p.views > 0 ? submissions / p.views : 0,
    })
  }
}

// ─── Funnels ──────────────────────────────────────────────────────────────────

export async function createFunnel(
  data: Omit<LeadFunnel, 'id' | 'createdAt' | 'updatedAt' | 'totalEntered' | 'totalCompleted' | 'conversionRate'>
): Promise<LeadFunnel> {
  const now = new Date().toISOString()
  const funnel: LeadFunnel = { ...data, id: crypto.randomUUID(), totalEntered: 0, totalCompleted: 0, conversionRate: 0, createdAt: now }
  funnels.set(funnel.id, funnel)
  return funnel
}

export async function getFunnel(clinicId: string, id: string): Promise<LeadFunnel | null> {
  const f = funnels.get(id)
  return f?.clinicId === clinicId ? f : null
}

export async function listFunnels(clinicId: string): Promise<LeadFunnel[]> {
  return Array.from(funnels.values()).filter((f) => f.clinicId === clinicId)
}

export async function recordFunnelSubmission(
  submission: Omit<FunnelSubmission, 'id'>
): Promise<FunnelSubmission> {
  const record: FunnelSubmission = { ...submission, id: crypto.randomUUID() }
  const existing = submissions.get(submission.funnelId) ?? []
  existing.push(record)
  submissions.set(submission.funnelId, existing)

  const funnel = funnels.get(submission.funnelId)
  if (funnel) {
    const entered = funnel.totalEntered + 1
    funnels.set(funnel.id, { ...funnel, totalEntered: entered })
  }
  return record
}

// ─── SEO Pages ────────────────────────────────────────────────────────────────

export async function createSeoPage(
  data: Omit<SeoPage, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SeoPage> {
  const now = new Date().toISOString()
  const page: SeoPage = { ...data, id: crypto.randomUUID(), createdAt: now }
  seoPages.set(`${data.clinicId}:${data.slug}`, page)
  return page
}

export async function getSeoPage(clinicId: string, slug: string): Promise<SeoPage | null> {
  return seoPages.get(`${clinicId}:${slug}`) ?? null
}

export async function listSeoPages(clinicId: string): Promise<SeoPage[]> {
  return Array.from(seoPages.values()).filter((p) => p.clinicId === clinicId)
}

// ─── Social Posts ─────────────────────────────────────────────────────────────

export async function createSocialPost(
  data: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SocialPost> {
  const now = new Date().toISOString()
  const post: SocialPost = { ...data, id: crypto.randomUUID(), createdAt: now }
  socialPosts.set(post.id, post)
  return post
}

export async function listSocialPosts(clinicId: string): Promise<SocialPost[]> {
  return Array.from(socialPosts.values())
    .filter((p) => p.clinicId === clinicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateSocialPostStatus(
  id: string,
  status: SocialPost['status'],
  publishedAt?: string
): Promise<void> {
  const post = socialPosts.get(id)
  if (post) socialPosts.set(id, { ...post, status, publishedAt: publishedAt ?? post.publishedAt, updatedAt: new Date().toISOString() })
}

// ─── Social Schedules ─────────────────────────────────────────────────────────

export async function createSocialSchedule(
  data: Omit<SocialSchedule, 'id' | 'createdAt'>
): Promise<SocialSchedule> {
  const s: SocialSchedule = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  schedules.set(s.id, s)
  return s
}

export async function listSocialSchedules(clinicId: string): Promise<SocialSchedule[]> {
  return Array.from(schedules.values()).filter((s) => s.clinicId === clinicId)
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function listTemplates(clinicId: string, category?: string): Promise<MarketingTemplate[]> {
  return Array.from(templates.values()).filter(
    (t) => (t.clinicId === null || t.clinicId === clinicId) && (!category || t.category === category)
  )
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function createReviewRequest(
  data: Omit<ReviewRequest, 'id' | 'createdAt'>
): Promise<ReviewRequest> {
  const r: ReviewRequest = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  reviewRequests.set(r.id, r)
  return r
}

export async function listReviewRequests(clinicId: string): Promise<ReviewRequest[]> {
  return Array.from(reviewRequests.values()).filter((r) => r.clinicId === clinicId)
}

// ─── Referrals ────────────────────────────────────────────────────────────────

export async function createReferralProgram(
  data: Omit<ReferralProgram, 'id' | 'createdAt' | 'totalUses'>
): Promise<ReferralProgram> {
  const p: ReferralProgram = { ...data, id: crypto.randomUUID(), totalUses: 0, createdAt: new Date().toISOString() }
  referrals.set(p.id, p)
  return p
}

export async function generateReferralLink(
  clinicId: string, programId: string, patientId: string
): Promise<ReferralLink> {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase()
  const link: ReferralLink = {
    id: crypto.randomUUID(),
    clinicId,
    programId,
    referrerPatientId: patientId,
    code,
    uses: 0,
    convertedLeadIds: [],
    createdAt: new Date().toISOString(),
  }
  referralLinks.set(link.id, link)
  return link
}

export async function listReferralPrograms(clinicId: string): Promise<ReferralProgram[]> {
  return Array.from(referrals.values()).filter((p) => p.clinicId === clinicId)
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export async function getMarketingKPIs(
  clinicId: string,
  period: string
): Promise<MarketingDashboardKPIs> {
  // In production: aggregate from DB with proper date filtering
  const allCampaigns = await listCampaigns(clinicId)
  const allReviews   = await listReviewRequests(clinicId)

  const completedReviews = allReviews.filter((r) => r.status === 'completed')
  const avgRating = completedReviews.length > 0
    ? completedReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / completedReviews.length
    : 0

  return {
    clinicId,
    period,
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    avgLeadScore: 0,
    costPerLead: undefined,
    costPerAcquisition: undefined,
    totalAdSpend: 0,
    estimatedRevenue: 0,
    roi: undefined,
    topSources: [],
    campaignPerformance: allCampaigns.map((c) => ({
      campaignId: c.id,
      name: c.name,
      leads: 0,
      spend: c.budget ?? 0,
      roas: 0,
    })),
    funnelStats: [],
    reviewStats: {
      avgRating,
      totalReviews: completedReviews.length,
      newReviews: 0,
    },
    socialStats: [],
  }
}
