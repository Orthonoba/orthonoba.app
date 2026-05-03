import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getMarketingKPIs, listCampaigns, listSocialPosts } from '@/src/modules/marketing/campaign-store'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { listExecutions } from '@/src/modules/automation/automation-store'
import { buildConversionFunnel, calculateCAC, calculateROAS, compare } from '@/src/services/dashboard/kpi-calculator'
import { currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { MarketingDashboard } from '@/src/types/dashboard'

// GET /api/v1/dashboard/marketing?period=2024-05
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? currentPeriod()
  const periodStart = `${period}-01`

  const [kpis, campaigns, leadsResult, posts, executions] = await Promise.all([
    getMarketingKPIs(tenant.clinicId, period),
    listCampaigns(tenant.clinicId),
    listLeads(tenant.clinicId, { limit: 1000 }),
    listSocialPosts(tenant.clinicId),
    listExecutions(tenant.clinicId, { limit: 500 }),
  ])

  const leads = leadsResult.data
  const stageCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  const totalSpendEur = campaigns
    .filter((c) => ['active', 'completed'].includes(c.status))
    .reduce((s, c) => s + (c.budget ?? 0), 0)
  const convertedCount = stageCounts['converted'] ?? 0

  // Source breakdown
  const sourceMap = leads.reduce<Record<string, { count: number; converted: number }>>((acc, l) => {
    if (!acc[l.source]) acc[l.source] = { count: 0, converted: 0 }
    acc[l.source]!.count++
    if (l.status === 'converted') acc[l.source]!.converted++
    return acc
  }, {})

  const bySource = Object.entries(sourceMap)
    .map(([source, { count, converted }]) => ({
      source,
      count,
      conversionRate: count > 0 ? converted / count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Active / paused campaigns
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')
  const topCampaigns = campaigns
    .filter((c) => c.budget != null && c.budget > 0)
    .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      type: c.type,
      leads: 0,
      conversions: 0,
      spendEur: c.budget ?? 0,
      roas: 0,
    }))

  // Social stats
  const postsThisPeriod   = posts.filter((p) => p.createdAt >= periodStart)
  const scheduledPosts    = posts.filter((p) => p.status === 'scheduled').length
  const totalReach        = postsThisPeriod.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0)
  const totalImpressions  = postsThisPeriod.reduce((s, p) => s + (p.metrics?.impressions ?? 0), 0)
  const avgEngagement     = totalImpressions > 0
    ? postsThisPeriod.reduce((s, p) => s + (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0), 0) / totalImpressions
    : 0

  const platformMap = postsThisPeriod.reduce<Record<string, { posts: number; reach: number }>>((acc, p) => {
    for (const platform of p.platforms) {
      if (!acc[platform]) acc[platform] = { posts: 0, reach: 0 }
      acc[platform]!.posts++
      acc[platform]!.reach += p.metrics?.reach ?? 0
    }
    return acc
  }, {})

  // Automation health
  const periodExecs   = executions.filter((e) => e.startedAt >= periodStart)
  const emailExecs    = periodExecs.filter((e) => e.actionsExecuted.some((a) => a.actionType === 'send_email'))
  const waExecs       = periodExecs.filter((e) => e.actionsExecuted.some((a) => a.actionType === 'send_whatsapp'))
  const successExecs  = periodExecs.filter((e) => e.status === 'completed').length

  const dashboard: MarketingDashboard = {
    clinicId: tenant.clinicId,
    period,
    generatedAt: new Date().toISOString(),

    leads: {
      total: leads.length,
      newThisPeriod: leads.filter((l) => l.createdAt >= periodStart).length,
      comparison: compare(leads.length, Math.floor(leads.length * 0.9)),
      funnel: buildConversionFunnel(stageCounts),
      bySource,
      avgScore: kpis.avgLeadScore,
      hotCount:  leads.filter((l) => l.scoreGrade === 'A').length,
      warmCount: leads.filter((l) => l.scoreGrade === 'B').length,
      coldCount: leads.filter((l) => l.scoreGrade === 'C' || l.scoreGrade === 'D').length,
    },

    cac: calculateCAC(totalSpendEur, convertedCount, period),

    campaigns: {
      total: campaigns.length,
      active: activeCampaigns.length,
      totalSpendEur,
      totalRevenueEur: kpis.estimatedRevenue ?? 0,
      avgROAS: calculateROAS(kpis.estimatedRevenue ?? 0, totalSpendEur),
      topCampaigns,
    },

    social: {
      postsThisPeriod: postsThisPeriod.length,
      scheduledPosts,
      totalReach,
      avgEngagementRate: Math.round(avgEngagement * 10000) / 10000,
      byPlatform: Object.entries(platformMap).map(([platform, s]) => ({ platform, ...s })),
    },

    reviews: {
      avgRating: kpis.reviewStats?.avgRating ?? 0,
      totalReviews: kpis.reviewStats?.totalReviews ?? 0,
      newThisPeriod: kpis.reviewStats?.newReviews ?? 0,
      byChannel: [],
    },

    seo: {
      publishedPages: 0,
      indexedPages: 0,
    },

    automationHealth: {
      activeRules: 0,
      emailsSentThisPeriod: emailExecs.length,
      whatsappSentThisPeriod: waExecs.length,
      successRate: periodExecs.length > 0 ? successExecs / periodExecs.length : 1,
    },
  }

  return NextResponse.json(ok(dashboard))
})
