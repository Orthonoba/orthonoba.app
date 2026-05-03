const KPIS = [
  { label: 'Visitas web',     value: '8.420',   change: +12.4, color: 'text-sky-400' },
  { label: 'Leads captados',  value: '624',      change: +8.7,  color: 'text-violet-400' },
  { label: 'Conversiones',    value: '84',       change: +15.2, color: 'text-emerald-400' },
  { label: 'CAC',             value: '€47',      change: -5.3,  color: 'text-amber-400' },
  { label: 'LTV estimado',    value: '€2.840',   change: +3.1,  color: 'text-sky-400' },
  { label: 'ROI Marketing',   value: '342%',     change: +21.0, color: 'text-emerald-400' },
]

const CHANNELS = [
  { name: 'Google Ads',    visits: 3240, leads: 228, conv: 31, spend: 3200 },
  { name: 'Meta Ads',      visits: 2180, leads: 143, conv: 16, spend: 1500 },
  { name: 'SEO Orgánico',  visits: 1840, leads: 118, conv: 22, spend: 0    },
  { name: 'Referral',      visits: 780,  leads: 87,  conv: 11, spend: 0    },
  { name: 'Directo',       visits: 380,  leads: 48,  conv: 4,  spend: 0    },
]

const LANDING_PAGES = [
  { url: '/invisalign',      visits: 2100, leads: 184, conv: 8.8 },
  { url: '/implantes',       visits: 1680, leads: 142, conv: 8.5 },
  { url: '/ortodoncia',      visits: 1240, leads: 98,  conv: 7.9 },
  { url: '/blanqueamiento',  visits: 890,  leads: 67,  conv: 7.5 },
  { url: '/protesis-dental', visits: 510,  leads: 38,  conv: 7.5 },
]

const BAR_HEIGHTS = [30, 45, 55, 40, 65, 50, 70, 58, 80, 62, 75, 90, 68, 55, 72, 84, 60, 78, 65, 88, 74, 52, 69, 83, 71, 60, 77, 90, 68, 85]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics de Marketing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Últimos 30 días · actualizado hace 5 min</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
            <p className={`text-xs font-semibold mt-1 ${k.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {k.change > 0 ? '↑' : '↓'} {Math.abs(k.change)}%
            </p>
          </div>
        ))}
      </div>

      {/* Traffic bar chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Tráfico últimos 30 días</h2>
        <div className="flex items-end gap-1 h-32">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group cursor-pointer">
              <div className="bg-sky-500/60 hover:bg-sky-500 rounded-sm w-full transition-all" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Hace 30 días</span>
          <span>Hoy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channels */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Rendimiento por canal</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                <th className="text-left pb-2">Canal</th>
                <th className="text-right pb-2">Visitas</th>
                <th className="text-right pb-2">Leads</th>
                <th className="text-right pb-2">Conv.</th>
                <th className="text-right pb-2">Gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {CHANNELS.map((c) => (
                <tr key={c.name} className="hover:bg-slate-700/20 transition">
                  <td className="py-2.5 text-slate-200 font-medium">{c.name}</td>
                  <td className="py-2.5 text-right text-slate-400">{c.visits.toLocaleString('es-ES')}</td>
                  <td className="py-2.5 text-right text-sky-400 font-medium">{c.leads}</td>
                  <td className="py-2.5 text-right text-emerald-400 font-bold">{c.conv}</td>
                  <td className="py-2.5 text-right text-slate-300">{c.spend > 0 ? `€${c.spend.toLocaleString('es-ES')}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Landing pages */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Top Landing Pages</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                <th className="text-left pb-2">URL</th>
                <th className="text-right pb-2">Visitas</th>
                <th className="text-right pb-2">Leads</th>
                <th className="text-right pb-2">Conv.%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {LANDING_PAGES.map((p) => (
                <tr key={p.url} className="hover:bg-slate-700/20 transition">
                  <td className="py-2.5 text-sky-400 font-mono text-xs">{p.url}</td>
                  <td className="py-2.5 text-right text-slate-400">{p.visits.toLocaleString('es-ES')}</td>
                  <td className="py-2.5 text-right text-violet-400 font-medium">{p.leads}</td>
                  <td className="py-2.5 text-right text-emerald-400 font-bold">{p.conv}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
