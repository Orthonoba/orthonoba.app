const FUNNEL_STAGES = [
  { name: 'Visitas web',       count: 8420, pct: 100  },
  { name: 'Leads captados',    count: 624,  pct: 7.4  },
  { name: 'Leads contactados', count: 412,  pct: 66.0 },
  { name: 'Citas programadas', count: 187,  pct: 45.4 },
  { name: 'Pacientes nuevos',  count: 84,   pct: 44.9 },
]

const SOURCES = [
  { name: 'Google Ads',   leads: 228, color: 'bg-amber-500',  pct: 36 },
  { name: 'Meta Ads',     leads: 143, color: 'bg-violet-500', pct: 23 },
  { name: 'Orgánico SEO', leads: 118, color: 'bg-sky-500',    pct: 19 },
  { name: 'Referral',     leads: 87,  color: 'bg-emerald-500', pct: 14 },
  { name: 'Directo',      leads: 48,  color: 'bg-slate-400',  pct: 8  },
]

const MONTHLY = [
  { month: 'Ene', leads: 42, patients: 18 },
  { month: 'Feb', leads: 58, patients: 22 },
  { month: 'Mar', leads: 71, patients: 31 },
  { month: 'Abr', leads: 89, patients: 38 },
  { month: 'May', leads: 95, patients: 41 },
  { month: 'Jun', leads: 78, patients: 34 },
]

export default function FunnelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Funnel de Conversión</h1>
        <p className="text-slate-400 text-sm mt-0.5">Análisis del pipeline de captación de pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-5">Pipeline de conversión</h2>
          <div className="space-y-2">
            {FUNNEL_STAGES.map((stage, i) => {
              const width = Math.max(20, stage.pct === 100 ? 100 : (stage.count / FUNNEL_STAGES[0]!.count) * 100)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{stage.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">{stage.pct}%</span>
                      <span className="text-white font-bold w-12 text-right">{stage.count.toLocaleString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 flex items-center px-3 transition-all"
                      style={{ width: `${width}%` }}
                    >
                      {width > 25 && <span className="text-white text-xs font-medium truncate">{stage.count.toLocaleString('es-ES')}</span>}
                    </div>
                  </div>
                  {i < FUNNEL_STAGES.length - 1 && (
                    <div className="flex justify-center">
                      <span className="text-slate-600 text-xs">↓ {((FUNNEL_STAGES[i+1]!.count / stage.count) * 100).toFixed(0)}% continúan</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-5">Leads por fuente</h2>
          <div className="space-y-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="text-slate-300">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{s.pct}%</span>
                    <span className="text-white font-bold w-8 text-right">{s.leads}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Pie placeholder */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-slate-400">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Conversión por mes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                <th className="text-left pb-3">Mes</th>
                <th className="text-right pb-3">Leads</th>
                <th className="text-right pb-3">Pacientes nuevos</th>
                <th className="text-right pb-3">Tasa conversión</th>
                <th className="text-right pb-3 hidden md:table-cell">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {MONTHLY.map((m, i) => {
                const rate = ((m.patients / m.leads) * 100).toFixed(1)
                const prev = MONTHLY[i - 1]
                const trend = prev ? (m.patients > prev.patients ? '↑' : '↓') : '—'
                const trendColor = prev ? (m.patients > prev.patients ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'
                return (
                  <tr key={m.month} className="hover:bg-slate-700/20 transition">
                    <td className="py-3 text-white font-medium">{m.month}</td>
                    <td className="py-3 text-right text-slate-300">{m.leads}</td>
                    <td className="py-3 text-right text-sky-400 font-bold">{m.patients}</td>
                    <td className="py-3 text-right text-emerald-400 font-medium">{rate}%</td>
                    <td className={`py-3 text-right font-bold hidden md:table-cell ${trendColor}`}>{trend}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
