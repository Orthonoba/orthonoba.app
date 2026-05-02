import type {
  Campaign, CampaignMetric, CampaignAnalytics,
  Lead, LeadActivity, LeadScore,
  GoogleAdsCampaign, MetaCampaign,
  LandingPage, LeadFunnel, FunnelSubmission,
  SeoPage, SocialPost, SocialSchedule,
  MarketingTemplate, MarketingDashboardKPIs,
  ReviewRequest, ReferralProgram, ReferralLink,
} from '@/src/types/marketing'

export interface LeadFilters {
  status?: Lead['status']
  source?: Lead['source']
  assignedTo?: string
  campaignId?: string
  scoreGrade?: 'A' | 'B' | 'C' | 'D'
  search?: string
  page?: number
  limit?: number
}

export interface IMarketingService {
  // Campaigns
  listCampaigns(clinicId: string): Promise<Campaign[]>
  getCampaign(clinicId: string, id: string): Promise<Campaign | null>
  createCampaign(clinicId: string, data: Omit<Campaign, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<Campaign>
  updateCampaign(clinicId: string, id: string, data: Partial<Campaign>): Promise<Campaign>
  deleteCampaign(clinicId: string, id: string): Promise<void>
  trackMetric(clinicId: string, campaignId: string, data: Omit<CampaignMetric, 'id' | 'clinicId' | 'campaignId' | 'createdAt'>): Promise<CampaignMetric>
  getCampaignAnalytics(clinicId: string, campaignId: string, period: string): Promise<CampaignAnalytics>

  // Google Ads
  createGoogleAdsCampaign(clinicId: string, data: Omit<GoogleAdsCampaign, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<GoogleAdsCampaign>
  listGoogleAdsCampaigns(clinicId: string): Promise<GoogleAdsCampaign[]>

  // Meta Ads
  createMetaCampaign(clinicId: string, data: Omit<MetaCampaign, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<MetaCampaign>
  listMetaCampaigns(clinicId: string): Promise<MetaCampaign[]>

  // SEO Pages
  createSeoPage(clinicId: string, data: Omit<SeoPage, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<SeoPage>
  getSeoPage(clinicId: string, slug: string): Promise<SeoPage | null>
  listSeoPages(clinicId: string): Promise<SeoPage[]>

  // Landing Pages
  createLandingPage(clinicId: string, data: Omit<LandingPage, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'views' | 'submissions'>): Promise<LandingPage>
  getLandingPage(clinicId: string, id: string): Promise<LandingPage | null>
  listLandingPages(clinicId: string): Promise<LandingPage[]>

  // Templates
  listTemplates(clinicId: string, category?: string): Promise<MarketingTemplate[]>

  // Funnels
  createFunnel(clinicId: string, data: Omit<LeadFunnel, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'totalEntered' | 'totalCompleted' | 'conversionRate'>): Promise<LeadFunnel>
  listFunnels(clinicId: string): Promise<LeadFunnel[]>
  submitFunnel(clinicId: string, funnelId: string, data: Omit<FunnelSubmission, 'id' | 'clinicId' | 'funnelId' | 'submittedAt'>): Promise<FunnelSubmission>

  // CRM Leads
  getLead(clinicId: string, leadId: string): Promise<Lead | null>
  listLeads(clinicId: string, filters?: LeadFilters): Promise<{ data: Lead[]; total: number }>
  createLead(clinicId: string, data: Omit<Lead, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<Lead>
  updateLead(clinicId: string, leadId: string, data: Partial<Lead>): Promise<Lead>
  convertLeadToPatient(clinicId: string, leadId: string): Promise<{ lead: Lead; patientId: string }>

  // Lead scoring & activity
  getLeadScore(clinicId: string, leadId: string): Promise<LeadScore | null>
  addLeadActivity(clinicId: string, leadId: string, data: Omit<LeadActivity, 'id' | 'leadId' | 'clinicId'>): Promise<LeadActivity>

  // Social Automation
  createSocialPost(clinicId: string, data: Omit<SocialPost, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<SocialPost>
  listSocialPosts(clinicId: string): Promise<SocialPost[]>
  createSocialSchedule(clinicId: string, data: Omit<SocialSchedule, 'id' | 'clinicId' | 'createdAt'>): Promise<SocialSchedule>
  listSocialSchedules(clinicId: string): Promise<SocialSchedule[]>

  // Reviews
  requestReview(clinicId: string, data: Omit<ReviewRequest, 'id' | 'clinicId' | 'createdAt'>): Promise<ReviewRequest>
  listReviews(clinicId: string): Promise<ReviewRequest[]>

  // Referrals
  createReferralProgram(clinicId: string, data: Omit<ReferralProgram, 'id' | 'clinicId' | 'createdAt' | 'totalUses'>): Promise<ReferralProgram>
  listReferralPrograms(clinicId: string): Promise<ReferralProgram[]>
  generateReferralLink(clinicId: string, programId: string, patientId: string): Promise<ReferralLink>

  // Dashboard
  getDashboardKPIs(clinicId: string, period: string): Promise<MarketingDashboardKPIs>
}
