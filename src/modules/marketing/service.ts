import type {
  Campaign,
  CampaignMetric,
  Lead,
  ReviewRequest,
  ReferralProgram,
  ReferralLink,
} from '@/src/types/marketing'

export interface LeadFilters {
  status?: Lead['status']
  source?: Lead['source']
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface IMarketingService {
  // Campaigns
  listCampaigns(clinicId: string): Promise<Campaign[]>
  createCampaign(clinicId: string, data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign>
  updateCampaign(clinicId: string, campaignId: string, data: Partial<Campaign>): Promise<Campaign>
  trackMetric(data: Omit<CampaignMetric, 'id' | 'createdAt'>): Promise<CampaignMetric>
  getCampaignROI(clinicId: string, campaignId: string): Promise<{ spend: number; revenue: number; roas: number }>

  // Leads / CRM
  getLead(clinicId: string, leadId: string): Promise<Lead | null>
  listLeads(clinicId: string, filters?: LeadFilters): Promise<{ data: Lead[]; total: number }>
  createLead(clinicId: string, data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>
  updateLeadStatus(clinicId: string, leadId: string, status: Lead['status']): Promise<Lead>
  convertLeadToPatient(clinicId: string, leadId: string): Promise<{ lead: Lead; patientId: string }>

  // Reviews
  requestReview(clinicId: string, data: Omit<ReviewRequest, 'id' | 'createdAt'>): Promise<ReviewRequest>
  updateReviewStatus(reviewId: string, status: ReviewRequest['status'], rating?: number): Promise<ReviewRequest>

  // Referrals
  createReferralProgram(clinicId: string, data: Omit<ReferralProgram, 'id' | 'createdAt' | 'totalUses'>): Promise<ReferralProgram>
  generateReferralLink(programId: string, patientId: string): Promise<ReferralLink>
  trackReferralConversion(code: string, convertedLeadId: string): Promise<void>
}
