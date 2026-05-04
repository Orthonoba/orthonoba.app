import { TrendingUp, Users, DollarSign, Zap, GraduationCap, Brain } from 'lucide-react'

const REPORT = {
  platform: { totalMRR: 28400, totalARR: 340800, activeTenants: 47, clinics: 38, labs: 9 },
  growth: { newThisPeriod: 6, churnedThisPeriod: 1, netNew: 5, growthRate: 14.7 },
  topTenants: [
    { name: 'Clínica Dental Norte',  plan: 'enterprise', mrr: 890 },
    { name: 'OrthoSmile Barcelona',  plan: 'scale',      mrr: 399 },
    { name: 'Sonrisa Perfecta',      plan: 'growth',     mrr: 149 },
    { name: 'Dental Vanguard',       plan: 'growth',     mrr: 149 },
    { name: 'Dental Excellence',     plan: 'growth',     mrr: 149 },
  ],
  academy: { courses: 24, enrollments: 312, certificates: 87, completionRate: 72 },
  health: { automationRules: 156, executions: 4280, successRate: 97.3, aiEnabled: true },
}

const PLAN_COLORS: Record<string, string> = {
  enterprise: 'bg-violet-500/20 text-violet-400',
  scale: 'bg-sky-500/20 text-sky-400',
  growth: 'bg-emerald-500/20 text-emerald-400',
  starter: 'bg-slate-500/20 text-slate-400',
}

export default function ExecutivePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reporte Ejecutivo</h1>
        <p className="text-slate-400 text-sm mt-0.5">Plataforma Orthonoba · {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR Plataforma',   value: `€${(REPORT.platform.totalMRR / 100).toFixed(0)}`,    icon: DollarSign, color: 'text-emerald-400', sub: `ARR €${(REPORT.platform.totalARR / 100).toFixed(0)}` },
          { label: 'Tenants activos',  value: String(REPORT.platform.activeTenants),               icon: Users,      color: 'text-sky-400',     sub: `${REPORT.platform.clinics} clínicas · ${REPORT.platform.labs} labs` },
          { label: 'Crecimiento MoM',  value: `+${REPORT.growth.growthRate}%`,                      icon: TrendingUp, color: 'text-violet-400',  sub: `+${REPORT.growth.netNew} netos este mes` },
          { label: 'IA activa',        value: REPORT.health.aiEnabled ? 'Claude' : 'Reglas',       icon: Brain,      color: 'text-amber-400',   sub: `${REPORT.health.executions.toLocaleString()} ejecuciones` },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Crecimiento mensual
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Nuevos tenants',   value: REPORT.growth.newThisPeriod,    color: 'text-emerald-400' },
              { label: 'Churned',          value: REPORT.growth.churnedThisPeriod, color: 'text-red-400' },
              { label: 'Net new tenants',  value: REPORT.growth.netNew,           color: 'text-sky-400' },
              { label: 'Tasa de crecimiento', value: `${REPORT.growth.growthRate}%`, color: 'text-violet-400' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{r.label}</span>
                <span className={`font-bold ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tenants */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Top tenants por MRR
          </h2>
          <div className="space-y-2">
            {REPORT.topTenants.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-4 text-right font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[t.plan]}`}>{t.plan}</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">€{t.mrr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academy + Automation */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" /> Academy
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Cursos', v: REPORT.academy.courses },
                { l: 'Matrículas', v: REPORT.academy.enrollments },
                { l: 'Certificados', v: REPORT.academy.certificates },
                { l: 'Completados', v: `${REPORT.academy.completionRate}%` },
              ].map((s) => (
                <div key={s.l} className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-white">{s.v}</p>
                  <p className="text-[10px] text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" /> Automatización
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { l: 'Reglas activas', v: REPORT.health.automationRules },
                { l: 'Ejecuciones', v: REPORT.health.executions.toLocaleString('es-ES') },
                { l: 'Tasa éxito', v: `${REPORT.health.successRate}%` },
              ].map((r) => (
                <div key={r.l} className="flex justify-between">
                  <span className="text-slate-400">{r.l}</span>
                  <span className="font-semibold text-white">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
