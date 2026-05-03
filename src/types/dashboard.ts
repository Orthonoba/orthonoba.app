import type { PlanTier, TenantType } from '@/src/types/clinic'

// ─── KPI primitives ───────────────────────────────────────────────────────────

export interface KPIValue {
  value: number
  previousValue?: number
  /** Percentage change vs previous period (positive = growth) */
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  /** ISO date range this KPI covers */
  period: string
  formattedValue?: string
}

export interface PeriodComparison {
  current: number
  previous: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

// ─── Core financial KPIs ─────────────────────────────────────────────────────

export interface MRRBreakdown {
  /** Monthly Recurring Revenue in EUR cents */
  mrr: number
  /** Annual Recurring Revenue = MRR × 12 */
  arr: number
  /** New MRR from new customers this period */
  newMRR: number
  /** Expansion MRR from upgrades */
  expansionMRR: number
  /** Churned MRR from cancellations */
  churnedMRR: number
  /** Net new MRR = new + expansion − churned */
  netNewMRR: number
  period: string
}

export interface CACKpi {
  /** Cost per acquired customer in EUR */
  cac: number
  /** Total marketing + sales spend */
  totalSpend: number
  /** New customers in period */
  newCustomers: number
  period: string
}

export interface LTVKpi {
  /** Lifetime Value in EUR */
  ltv: number
  /** Average monthly revenue per customer */
  avgMonthlyRevenue: number
  /** Average customer lifespan in months */
  avgLifespanMonths: number
  /** LTV:CAC ratio (target >3) */
  ltvToCacRatio?: number
}

export interface ChurnKpi {
  /** Monthly churn rate (0–1) */
  monthlyChurnRate: number
  /** Customer churn count */
  churnedCount: number
  /** Revenue churned in EUR cents */
  revenueChurned: number
  /** At-risk count (not yet churned) */
  atRiskCount: number
}

// ─── Conversion & funnel ──────────────────────────────────────────────────────

export interface ConversionFunnel {
  stages: FunnelStage[]
  /** Overall lead → patient conversion rate (0–1) */
  overallConversionRate: number
  /** Avg days from lead created to converted */
  avgConversionDays: number
}

export interface FunnelStage {
  name: string
  count: number
  conversionFromPrevious?: number   // 0–1
  dropoffRate?: number              // 0–1
}

// ─── Order / Production KPIs ──────────────────────────────────────────────────

export interface OrdersKpi {
  total: number
  active: number
  completed: number
  overdue: number
  pendingPickup: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  comparison: PeriodComparison
}

export interface ProductionTimeKpi {
  /** Average turnaround in business days */
  avgTurnaroundDays: number
  /** Median turnaround */
  medianTurnaroundDays: number
  /** On-time delivery rate (0–1) */
  onTimeRate: number
  /** Quality pass rate (0–1) */
  qualityPassRate: number
  /** Revision rate (0–1) */
  revisionRate: number
  /** Trend vs previous period */
  trend: PeriodComparison
  byType: Record<string, { avgDays: number; count: number }>
}

// ─── Clinic Executive Dashboard ───────────────────────────────────────────────

export interface ClinicDashboard {
  clinicId: string
  clinicName: string
  period: string
  generatedAt: string
  planTier: PlanTier

  // Core operational
  orders: OrdersKpi
  productionTime: ProductionTimeKpi

  // Revenue
  revenue: {
    periodEurCents: number
    comparison: PeriodComparison
    avgTicketEurCents: number
    pendingInvoicesEurCents: number
    pendingInvoicesCount: number
  }

  // Patients
  patients: {
    total: number
    newThisPeriod: number
    activeWithTreatmentPlan: number
    atRiskCount: number
    retentionRate: number
    avgLifetimeValueEur: number
  }

  // Leads & CRM
  leads: {
    total: number
    newThisPeriod: number
    funnel: ConversionFunnel
    cac: CACKpi
    hotLeadsCount: number          // grade A
    avgLeadScore: number
  }

  // Academy
  academy: {
    totalEnrollments: number
    completedCourses: number
    certificatesIssued: number
    avgCompletionRate: number
  }

  // Automation
  automation: {
    activeRules: number
    executionsThisPeriod: number
    successRate: number
    pendingReminders: number
  }

  // AI health
  aiHealth: {
    aiEnabled: boolean
    qualificationsThisPeriod: number
    avgConfidence: number
  }
}

// ─── Lab Executive Dashboard ──────────────────────────────────────────────────

export interface LabDashboard {
  labId: string
  labName: string
  period: string
  generatedAt: string
  planTier: PlanTier

  // Production pipeline
  pipeline: {
    totalActive: number
    byStage: Record<string, number>
    overdueCount: number
    dueThisWeek: number
    backlogValue: number           // EUR cents
  }

  // Production performance
  production: ProductionTimeKpi

  // Quality
  quality: {
    overallPassRate: number
    revisionRate: number
    defectRateByType: Record<string, number>
    topRevisionReasons: string[]
  }

  // Revenue
  revenue: {
    periodEurCents: number
    comparison: PeriodComparison
    avgOrderValueEurCents: number
    byClient: { clinicId: string; clinicName: string; orderCount: number; revenueEurCents: number }[]
  }

  // Technicians
  technicians: {
    total: number
    activeCount: number
    avgCasesPerTechnician: number
    busiest: { name: string; activeCases: number } | null
  }

  // Client clinics
  clients: {
    totalClinics: number
    activeThisPeriod: number
    newThisPeriod: number
    churnedThisPeriod: number
  }

  // Delivery
  delivery: {
    onTimeRate: number
    avgDeliveryDays: number
    lateCount: number
  }
}

// ─── Marketing Executive Dashboard ───────────────────────────────────────────

export interface MarketingDashboard {
  clinicId: string
  period: string
  generatedAt: string

  // Lead performance
  leads: {
    total: number
    newThisPeriod: number
    comparison: PeriodComparison
    funnel: ConversionFunnel
    bySource: { source: string; count: number; conversionRate: number }[]
    avgScore: number
    hotCount: number
    warmCount: number
    coldCount: number
  }

  // Acquisition cost
  cac: CACKpi

  // Campaigns
  campaigns: {
    total: number
    active: number
    totalSpendEur: number
    totalRevenueEur: number
    avgROAS: number
    topCampaigns: {
      name: string; type: string; leads: number; conversions: number
      spendEur: number; roas: number
    }[]
  }

  // Social automation
  social: {
    postsThisPeriod: number
    scheduledPosts: number
    totalReach: number
    avgEngagementRate: number
    byPlatform: { platform: string; posts: number; reach: number }[]
  }

  // Reviews
  reviews: {
    avgRating: number
    totalReviews: number
    newThisPeriod: number
    byChannel: { channel: string; count: number; avgRating: number }[]
  }

  // SEO
  seo: {
    publishedPages: number
    indexedPages: number
    avgKeywordPosition?: number
  }

  // Automation
  automationHealth: {
    activeRules: number
    emailsSentThisPeriod: number
    whatsappSentThisPeriod: number
    successRate: number
  }
}

// ─── Finance Executive Dashboard ─────────────────────────────────────────────

export interface FinanceDashboard {
  tenantId: string
  tenantType: TenantType
  period: string
  generatedAt: string
  planTier: PlanTier

  // Recurring revenue
  mrr: MRRBreakdown
  churn: ChurnKpi
  ltv: LTVKpi
  cac: CACKpi

  // Plan subscription
  subscription: {
    plan: PlanTier
    billingCycle: 'monthly' | 'annual' | 'quarterly'
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    monthlyAmountEurCents: number
    annualSavingsEurCents: number
  } | null

  // Invoices
  invoices: {
    totalOutstandingEurCents: number
    outstandingCount: number
    overdueEurCents: number
    overdueCount: number
    paidThisPeriodEurCents: number
    paidThisPeriodCount: number
  }

  // Token usage (ORTHONOBA tokens)
  tokens: {
    monthlyAllocation: number
    usedThisMonth: number
    usagePercent: number
    purchasedBalance: number
    estimatedDaysRemaining: number
  } | null

  // Revenue breakdown
  revenueByMonth: { month: string; revenueEurCents: number }[]

  // Payment health
  paymentHealth: {
    successRate: number
    failedPaymentsCount: number
    avgDaysToPay: number
  }
}

// ─── Role-specific lightweight dashboards ────────────────────────────────────

export interface DoctorDashboard {
  userId: string
  clinicId: string
  period: string
  generatedAt: string

  todayAppointments: number
  pendingOrders: number
  activePatients: number
  pendingTasks: number
  recentPatients: { patientId: string; name: string; lastVisit: string; nextAppointment?: string }[]
  ordersInProgress: { orderId: string; patientName: string; status: string; dueDate?: string }[]
  academy: { inProgress: number; completed: number; certificates: number }
}

export interface StaffDashboard {
  userId: string
  clinicId: string
  generatedAt: string

  todaySchedule: number
  pendingCheckIns: number
  pendingPayments: number
  pendingReminders: number
  recentLeads: { leadId: string; name: string; source: string; score: number; createdAt: string }[]
  urgentTasks: { type: string; description: string; entityId: string; dueAt?: string }[]
}

export interface InstructorDashboard {
  userId: string
  generatedAt: string

  totalCourses: number
  totalStudents: number
  completedStudents: number
  pendingReviews: number
  avgRating: number
  totalCertificatesIssued: number
  totalRevenueEurCents: number
  topCourses: { courseId: string; title: string; enrollments: number; completionRate: number; avgRating: number }[]
  recentActivity: { type: string; courseTitle: string; studentCount: number; date: string }[]
}

// ─── Enterprise Executive Report (super_admin) ───────────────────────────────

export interface PlatformTenantSummary {
  tenantId: string
  tenantName: string
  tenantType: TenantType
  plan: PlanTier
  status: string
  mrrEurCents: number
  createdAt: string
  lastActiveAt?: string
  orderCount: number
}

export interface ExecutiveReport {
  generatedAt: string
  period: string

  // Platform MRR/ARR
  platform: {
    totalMRREurCents: number
    totalARREurCents: number
    activeTenants: number
    clinics: number
    labs: number
    mrrComparison: PeriodComparison
    mrrByPlan: Record<PlanTier, number>
  }

  // Growth
  growth: {
    newTenantsThisPeriod: number
    churnedTenantsThisPeriod: number
    netNewTenants: number
    growthRate: number
    trialToPaidRate: number
  }

  // Top tenants
  topTenants: PlatformTenantSummary[]

  // Plan distribution
  planDistribution: Record<PlanTier, { count: number; percent: number; mrrEurCents: number }>

  // Academy
  academy: {
    totalCourses: number
    totalEnrollments: number
    totalCertificates: number
    totalRevenueEurCents: number
    avgCompletionRate: number
  }

  // Automation & AI
  platform_health: {
    totalAutomationRules: number
    executionsThisPeriod: number
    automationSuccessRate: number
    aiEnabled: boolean
    totalAITasksThisPeriod: number
  }

  // Revenue summary
  revenue: {
    totalPeriodEurCents: number
    comparison: PeriodComparison
    byPlan: Record<PlanTier, number>
  }
}

// ─── Role dashboard union ─────────────────────────────────────────────────────

export type RoleDashboardType =
  | { role: 'super_admin';  data: ExecutiveReport }
  | { role: 'clinic_admin'; data: ClinicDashboard }
  | { role: 'lab_admin';    data: LabDashboard }
  | { role: 'doctor';       data: DoctorDashboard }
  | { role: 'staff';        data: StaffDashboard }
  | { role: 'instructor';   data: InstructorDashboard }

// ─── KPI picker response ──────────────────────────────────────────────────────

export type NamedKPI =
  | 'cac' | 'ltv' | 'mrr' | 'arr' | 'churn'
  | 'conversion' | 'roas' | 'orders' | 'production_time'
  | 'avg_ticket' | 'outstanding_invoices' | 'lead_score'
  | 'patient_retention' | 'on_time_delivery' | 'revision_rate'

export type KPIPickerResult = Partial<Record<NamedKPI, KPIValue>>
