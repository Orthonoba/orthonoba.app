import type { Metadata } from 'next'
import { getCurrentUser } from '@/src/lib/dal'
import { getClinicById } from '@/src/lib/mock-clinics'
import { getClinicDashboard } from '@/src/services/dashboard/clinic-dashboard'
import { getLabDashboard } from '@/src/services/dashboard/lab-dashboard'
import { getFinanceDashboard } from '@/src/services/dashboard/finance-dashboard'
import { getExecutiveReport } from '@/src/services/dashboard/executive-report'
import { currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { isAIEnabled } from '@/src/services/ai/provider'

export const metadata: Metadata = { title: 'Dashboard — Orthonoba' }

// ─── KPI Card (server-side) ───────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  trend,
  pct,
  color = 'blue',
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'stable'
  pct?: number
  color?: 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'slate'
}) {
  const colorMap = {
    blue:  { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-500'  },
    teal:  { bg: 'bg-teal-50',  text: 'text-teal-700',  dot: 'bg-teal-500'  },
    green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    red:   { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500'   },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' },
  }
  const c = colorMap[color]
  const trendUp   = trend === 'up'
  const trendDown = trend === 'down'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-500 leading-tight">{label}</p>
        {trend && pct !== undefined && (
          <span
            className={[
              'text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
              trendUp   && 'bg-green-50 text-green-700',
              trendDown && 'bg-red-50 text-red-700',
              !trendUp && !trendDown && 'bg-slate-100 text-slate-500',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {trendUp ? '▲' : trendDown ? '▼' : '–'} {Math.abs(pct).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Funnel row ───────────────────────────────────────────────────────────────

function FunnelBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-slate-500 truncate text-xs">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-slate-700 font-medium text-xs">{count}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user   = await getCurrentUser()
  const period = currentPeriod()
  const clinic = user?.clinicId ? getClinicById(user.clinicId) : null
  const aiOn   = isAIEnabled()

  // ── Clinic / Doctor roles ────────────────────────────────────────────────────
  if (
    user?.role === 'clinic_admin' ||
    user?.role === 'doctor' ||
    user?.role === 'staff'
  ) {
    const [dash, finance] = await Promise.all([
      getClinicDashboard(
        user.clinicId ?? '',
        clinic?.name ?? 'Mi Clínica',
        clinic?.plan ?? 'starter',
        period,
      ),
      getFinanceDashboard(user.clinicId ?? '', 'clinic', period),
    ])

    const mrrEur   = (finance.mrr.mrr / 100).toFixed(0)
    const ltvEur   = finance.ltv.ltv.toFixed(0)
    const funnel   = dash.leads.funnel.stages ?? []
    const total    = funnel[0]?.count ?? 0

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Bienvenido, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {clinic?.name} · Plan{' '}
            <span className="capitalize font-medium text-blue-600">
              {clinic?.plan ?? 'Starter'}
            </span>{' '}
            · {period}
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Leads activos"
            value={String(dash.leads.total)}
            sub={`${dash.leads.hotLeadsCount} hot leads (A)`}
            color="blue"
          />
          <StatCard
            label="Score promedio"
            value={`${dash.leads.avgLeadScore}/100`}
            sub="Calificación IA de leads"
            color="teal"
          />
          <StatCard
            label="MRR"
            value={`€${mrrEur}`}
            sub="Ingreso mensual recurrente"
            trend={finance.mrr.netNewMRR > 0 ? 'up' : 'stable'}
            color="green"
          />
          <StatCard
            label="LTV estimado"
            value={`€${ltvEur}`}
            sub="Valor de vida del cliente"
            color="slate"
          />
        </div>

        {/* Lead funnel + Automation side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Funnel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Pipeline de Leads" sub={`Total: ${total} leads`} />
            <div className="space-y-3">
              {funnel.map((stage, i) => {
                const colors = [
                  'bg-blue-500',
                  'bg-teal-500',
                  'bg-violet-500',
                  'bg-amber-500',
                  'bg-green-500',
                ]
                return (
                  <FunnelBar
                    key={stage.name}
                    label={stage.name.replace(/-/g, ' ')}
                    count={stage.count}
                    total={total || 1}
                    color={colors[i % colors.length] ?? 'bg-slate-400'}
                  />
                )
              })}
              {funnel.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  Sin leads registrados aún
                </p>
              )}
            </div>
          </div>

          {/* Automation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle
              title="Automatización"
              sub={`${dash.automation.activeRules} reglas activas`}
            />
            <dl className="space-y-3">
              {[
                { label: 'Reglas activas',       value: dash.automation.activeRules },
                { label: 'Ejecuciones',           value: dash.automation.executionsThisPeriod },
                {
                  label: 'Tasa de éxito',
                  value: `${(dash.automation.successRate * 100).toFixed(0)}%`,
                },
                { label: 'Reminders pendientes', value: dash.automation.pendingReminders },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>

            <div
              className={[
                'mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg',
                aiOn
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-slate-50 text-slate-500',
              ].join(' ')}
            >
              <span
                className={[
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  aiOn ? 'bg-teal-500' : 'bg-slate-300',
                ].join(' ')}
              />
              {aiOn
                ? 'AI activado · Claude claude-sonnet-4-6'
                : 'AI desactivado · modo reglas deterministas'}
            </div>
          </div>
        </div>

        {/* Finance summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <SectionTitle title="Resumen Financiero" sub={`Período ${period}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'MRR',          value: `€${mrrEur}` },
              { label: 'ARR',          value: `€${((finance.mrr.arr) / 100).toFixed(0)}` },
              { label: 'CAC',          value: `€${finance.cac.cac.toFixed(0)}` },
              { label: 'LTV',          value: `€${ltvEur}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-3 rounded-lg bg-slate-50">
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Lab Admin ────────────────────────────────────────────────────────────────
  if (user?.role === 'lab_admin') {
    const [dash, finance] = await Promise.all([
      getLabDashboard(
        user.clinicId ?? '',
        clinic?.name ?? 'Mi Laboratorio',
        clinic?.plan ?? 'starter',
        period,
      ),
      getFinanceDashboard(user.clinicId ?? '', 'lab', period),
    ])

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Bienvenido, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {clinic?.name} · Plan{' '}
            <span className="capitalize font-medium text-blue-600">
              {clinic?.plan ?? 'Starter'}
            </span>{' '}
            · {period}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Casos activos"        value={String(dash.production.activeCases)}  color="blue" />
          <StatCard label="Completados"          value={String(dash.production.completedCases)} color="green" />
          <StatCard label="On-time rate"         value={`${(dash.quality.onTimeDeliveryRate * 100).toFixed(0)}%`} color="teal" />
          <StatCard label="Tasa de revisión"     value={`${(dash.quality.revisionRate * 100).toFixed(0)}%`} color="amber" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Producción" />
            <dl className="space-y-3">
              {[
                { label: 'Casos activos',      value: dash.production.activeCases },
                { label: 'Completados',        value: dash.production.completedCases },
                { label: 'Vencidos',           value: dash.production.overdueCases },
                { label: 'Tiempo promedio',    value: `${dash.production.avgTurnaroundDays.toFixed(1)} días` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Calidad" />
            <dl className="space-y-3">
              {[
                { label: 'QC pass rate',        value: `${(dash.quality.qualityPassRate * 100).toFixed(0)}%` },
                { label: 'On-time delivery',    value: `${(dash.quality.onTimeDeliveryRate * 100).toFixed(0)}%` },
                { label: 'Revisiones',          value: `${(dash.quality.revisionRate * 100).toFixed(0)}%` },
                { label: 'MRR',                 value: `€${(finance.mrr.mrr / 100).toFixed(0)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    )
  }

  // ── Super Admin ──────────────────────────────────────────────────────────────
  if (user?.role === 'super_admin') {
    const report = await getExecutiveReport(period)

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reporte Ejecutivo</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plataforma Orthonoba · {period} · {user.name}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="MRR Plataforma"   value={`€${(report.platform.totalMRREurCents / 100).toFixed(0)}`}  color="green" />
          <StatCard label="ARR Plataforma"   value={`€${(report.platform.totalARREurCents / 100).toFixed(0)}`}  color="blue"  />
          <StatCard label="Tenants activos"  value={String(report.platform.activeTenants)}                      color="teal"  />
          <StatCard label="Clínicas / Labs"  value={`${report.platform.clinics} / ${report.platform.labs}`}     color="slate" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Crecimiento" sub={period} />
            <dl className="space-y-3">
              {[
                { label: 'Nuevos tenants', value: report.growth.newTenantsThisPeriod },
                { label: 'Churn',          value: report.growth.churnedTenantsThisPeriod },
                { label: 'Net new',        value: report.growth.netNewTenants },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Academy" />
            <dl className="space-y-3">
              {[
                { label: 'Cursos publicados',  value: report.academy.totalCourses },
                { label: 'Matrículas totales', value: report.academy.totalEnrollments },
                { label: 'Certificados',       value: report.academy.totalCertificates },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionTitle title="Automatización" />
            <dl className="space-y-3">
              {[
                { label: 'Reglas activas',    value: report.platform_health.totalAutomationRules },
                { label: 'Ejecuciones',       value: report.platform_health.executionsThisPeriod },
                { label: 'Success rate',      value: `${(report.platform_health.automationSuccessRate * 100).toFixed(0)}%` },
                { label: 'AI',                value: report.platform_health.aiEnabled ? 'Activado' : 'Desactivado' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    )
  }

  // ── Fallback (instructor / staff without dashboard yet) ──────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">
        Bienvenido, {user?.name}
      </h1>
      <p className="text-sm text-slate-500">
        Rol: <span className="capitalize font-medium">{user?.role?.replace(/_/g, ' ')}</span>
      </p>
    </div>
  )
}
