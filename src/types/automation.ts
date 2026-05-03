// ─── Automation Triggers ──────────────────────────────────────────────────────
// Events that can fire an automation rule

export type AutomationTriggerType =
  // Lead events
  | 'lead.created'
  | 'lead.status_changed'
  | 'lead.score_changed'
  | 'lead.no_contact'            // X days without contact
  // Patient events
  | 'patient.appointment_booked'
  | 'patient.appointment_cancelled'
  | 'patient.appointment_no_show'
  | 'patient.treatment_completed'
  | 'patient.birthday'
  | 'patient.inactive'           // X days since last visit
  | 'patient.balance_due'
  // Order events
  | 'order.created'
  | 'order.status_changed'
  | 'order.overdue'
  | 'order.ready_for_delivery'
  // Billing events
  | 'billing.payment_failed'
  | 'billing.trial_ending'
  | 'billing.subscription_cancelled'
  // Academy events
  | 'academy.enrollment_completed'
  | 'academy.certificate_issued'
  | 'academy.lesson_streak'
  // Time-based
  | 'schedule.daily'
  | 'schedule.weekly'
  | 'schedule.monthly'
  | 'schedule.cron'

// ─── Automation Actions ───────────────────────────────────────────────────────

export type AutomationActionType =
  | 'send_email'
  | 'send_whatsapp'
  | 'send_sms'
  | 'create_task'
  | 'add_tag'
  | 'remove_tag'
  | 'update_lead_status'
  | 'update_lead_score'
  | 'assign_lead'
  | 'create_reminder'
  | 'notify_staff'
  | 'webhook_post'
  | 'add_to_campaign'
  | 'remove_from_campaign'
  | 'wait'                       // delay before next action

export interface AutomationActionConfig {
  // send_email
  templateId?: string
  subject?: string
  bodyTemplate?: string
  // send_whatsapp / send_sms
  messageTemplate?: string
  // create_task / create_reminder
  title?: string
  dueInMinutes?: number
  assignTo?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  // update_lead_status
  newStatus?: string
  // update_lead_score
  scoreAdjustment?: number
  // assign_lead
  assigneeId?: string
  // add_tag / remove_tag
  tag?: string
  // webhook_post
  webhookUrl?: string
  webhookPayload?: Record<string, unknown>
  // add_to_campaign
  campaignId?: string
  // wait
  waitMinutes?: number
}

// ─── Automation Rule ──────────────────────────────────────────────────────────

export type AutomationStatus = 'active' | 'paused' | 'draft' | 'archived'

export interface AutomationCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists'
  value: unknown
}

export interface AutomationAction {
  id: string
  type: AutomationActionType
  config: AutomationActionConfig
  /** Delay before this action runs (after previous action) */
  delayMinutes: number
}

export interface AutomationRule {
  id: string
  clinicId: string
  name: string
  description?: string
  status: AutomationStatus
  trigger: AutomationTriggerType
  /** All conditions must match (AND logic) */
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  /** Cron expression for schedule triggers */
  cronExpression?: string
  /** Max times to fire per entity (0 = unlimited) */
  maxFiringPerEntity: number
  /** Cooldown between firings (minutes) */
  cooldownMinutes: number
  totalFirings: number
  lastFiredAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Automation Execution Log ─────────────────────────────────────────────────

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface AutomationExecution {
  id: string
  ruleId: string
  clinicId: string
  triggerType: AutomationTriggerType
  triggerEntityId?: string
  triggerEntityType?: string
  status: ExecutionStatus
  actionsExecuted: ExecutionActionLog[]
  errorMessage?: string
  startedAt: string
  completedAt?: string
  durationMs?: number
}

export interface ExecutionActionLog {
  actionId: string
  actionType: AutomationActionType
  status: ExecutionStatus
  result?: unknown
  error?: string
  executedAt: string
}

// ─── AI Provider Interface ────────────────────────────────────────────────────
// Swap point: Claude, GPT-4, local model — all through this interface

export interface AICompletionRequest {
  system: string
  prompt: string
  maxTokens?: number
  temperature?: number
  /** Structured JSON schema for the response */
  responseSchema?: Record<string, unknown>
}

export interface AICompletionResponse {
  content: string
  /** Parsed JSON if responseSchema was provided */
  parsed?: unknown
  modelUsed: string
  tokensUsed: number
  cached: boolean
}

export interface IAIProvider {
  complete(req: AICompletionRequest): Promise<AICompletionResponse>
  isAvailable(): boolean
}

// ─── AI Lead Qualification ────────────────────────────────────────────────────

export type LeadQualificationTier = 'hot' | 'warm' | 'cold' | 'disqualified'

export interface AILeadQualification {
  leadId: string
  clinicId: string
  tier: LeadQualificationTier
  score: number             // 0–100
  confidence: number        // 0–1
  reasoning: string
  recommendedActions: string[]
  estimatedRevenue: number
  estimatedClosingDays: number
  nextBestAction: string
  urgency: 'immediate' | 'this-week' | 'this-month' | 'low'
  flags: LeadFlag[]
  qualifiedAt: string
  providerUsed: 'claude' | 'rule-engine'
}

export type LeadFlag =
  | 'high_value_treatment'
  | 'multiple_contacts_failed'
  | 'appointment_no_show_risk'
  | 'price_sensitive'
  | 'competitor_mentioned'
  | 'ready_to_book'
  | 'needs_financing'
  | 'vip_referral'

// ─── AI Campaign Suggestions ──────────────────────────────────────────────────

export interface CampaignSuggestion {
  id: string
  clinicId: string
  title: string
  type: string
  reasoning: string
  expectedLeads: number
  expectedConversionRate: number
  estimatedROI: number
  suggestedBudgetEUR: number
  suggestedDuration: string
  targetAudience: string
  primaryChannel: string
  keyMessages: string[]
  suggestedHeadlines: string[]
  urgency: 'low' | 'medium' | 'high'
  basedOn: string[]           // data signals that triggered suggestion
  generatedAt: string
  providerUsed: 'claude' | 'rule-engine'
}

// ─── Order Prediction ─────────────────────────────────────────────────────────

export interface OrderPrediction {
  clinicId: string
  patientId: string
  predictedTreatments: PredictedTreatment[]
  overallProbability: number
  estimatedValue: number
  estimatedTimeframe: string
  recommendedOutreach: string
  basedOn: string[]
  predictedAt: string
  providerUsed: 'claude' | 'rule-engine'
}

export interface PredictedTreatment {
  treatment: string
  probability: number           // 0–1
  estimatedValueEUR: number
  reasoningFactors: string[]
  recommendedOfferDate: string
}

// ─── Patient Retention ───────────────────────────────────────────────────────

export type ChurnRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe'

export interface PatientChurnRisk {
  patientId: string
  clinicId: string
  riskLevel: ChurnRiskLevel
  riskScore: number           // 0–100 (higher = more at risk)
  daysInactive: number
  lastVisitDate?: string
  riskFactors: string[]
  recommendedActions: RetentionAction[]
  estimatedLifetimeValue: number
  churnProbability: number    // 0–1
  assessedAt: string
}

export interface RetentionAction {
  type: 'email' | 'whatsapp' | 'phone_call' | 'special_offer' | 'recall_appointment'
  message: string
  urgency: 'immediate' | 'this-week' | 'this-month'
  estimatedEffectiveness: number  // 0–1
}

// ─── CRM Intelligence ─────────────────────────────────────────────────────────

export interface CRMIntelligenceReport {
  clinicId: string
  period: string
  generatedAt: string

  leadHealth: {
    totalLeads: number
    avgScore: number
    tierBreakdown: Record<LeadQualificationTier, number>
    bottleneck: string          // funnel stage losing most leads
    conversionTrend: 'improving' | 'stable' | 'declining'
  }

  topOpportunities: {
    leadId: string
    name: string
    score: number
    tier: LeadQualificationTier
    nextAction: string
    estimatedRevenue: number
  }[]

  campaignPerformance: {
    bestChannel: string
    worstChannel: string
    avgCPL: number
    avgCPA: number
  }

  patientRetention: {
    atRiskCount: number
    criticalCount: number
    avgDaysInactive: number
    estimatedChurnRevenue: number
  }

  automationHealth: {
    activeRules: number
    executionsLast7d: number
    avgSuccessRate: number
  }

  aiInsights: AIInsight[]
  providerUsed: 'claude' | 'rule-engine'
}

export interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'action_required'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  suggestedAction?: string
  relatedEntityType?: string
  relatedEntityId?: string
  confidence: number
  generatedAt: string
}

// ─── Smart Reminders ─────────────────────────────────────────────────────────

export type ReminderType =
  | 'appointment_reminder'       // 24h/1h before appointment
  | 'appointment_follow_up'      // 24h after appointment
  | 'treatment_recall'           // periodic recall (6 months / 1 year)
  | 'order_status'               // lab order ready
  | 'payment_due'                // invoice payment reminder
  | 'lead_follow_up'             // follow up lead after X days
  | 'birthday_greeting'          // patient birthday
  | 'prescription_refill'        // medication renewal
  | 'annual_checkup'

export type ReminderChannel = 'email' | 'whatsapp' | 'sms' | 'push' | 'in_app'
export type ReminderStatus = 'scheduled' | 'sent' | 'delivered' | 'failed' | 'cancelled' | 'responded'

export interface SmartReminder {
  id: string
  clinicId: string
  type: ReminderType
  entityType: 'patient' | 'lead' | 'order' | 'appointment'
  entityId: string
  channels: ReminderChannel[]
  status: ReminderStatus
  scheduledAt: string
  sentAt?: string
  deliveredAt?: string
  respondedAt?: string
  subject?: string
  message: string
  metadata?: Record<string, unknown>
  aiGenerated: boolean
  createdAt: string
}

// ─── WhatsApp Automation ──────────────────────────────────────────────────────

export type WhatsAppMessageType = 'text' | 'template' | 'interactive' | 'media'
export type WhatsAppStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed'

export interface WhatsAppMessage {
  id: string
  clinicId: string
  to: string                    // E.164 phone number
  type: WhatsAppMessageType
  templateName?: string
  templateParams?: string[]
  body?: string
  mediaUrl?: string
  status: WhatsAppStatus
  whatsappMessageId?: string   // ID from WA Business API
  automationRuleId?: string
  entityType?: string
  entityId?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failureReason?: string
  createdAt: string
}

// ─── Agent Task Queue (future agentic AI) ────────────────────────────────────

export type AgentTaskType =
  | 'qualify_lead'
  | 'suggest_campaigns'
  | 'predict_orders'
  | 'analyze_retention'
  | 'generate_report'
  | 'draft_email'
  | 'draft_whatsapp'
  | 'score_lead_batch'
  | 'crm_analysis'

export type AgentTaskStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface AgentTask {
  id: string
  clinicId: string
  type: AgentTaskType
  status: AgentTaskStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  input: Record<string, unknown>
  output?: Record<string, unknown>
  errorMessage?: string
  attempts: number
  maxAttempts: number
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  providerUsed?: string
  tokensUsed?: number
  createdAt: string
}
