'use client'
import { useState } from 'react'
import { Plus, TrendingUp, Mail, MessageSquare, Globe, Search } from 'lucide-react'
import { toast } from 'sonner'

const CAMPAIGNS = [
  { id: '1', name: 'Campaña Invisalign Primavera', channel: 'email',    status: 'active',   sent: 1240, opened: 380, conversions: 24, budget: 800  },
  { id: '2', name: 'Google Ads Implantes',          channel: 'google',   status: 'active',   sent: 0,    opened: 0,   conversions: 18, budget: 2400 },
  { id: '3', name: 'Meta Ads Blanqueamiento',       channel: 'meta',     status: 'paused',   sent: 0,    opened: 0,   conversions: 9,  budget: 600  },
  { id: '4', name: 'WhatsApp Recordatorio Citas',  channel: 'whatsapp', status: 'active',   sent: 340,  opened: 298, conversions: 61, budget: 0    },
  { id: '5', name: 'Newsletter Mensual Abril',      channel: 'email',    status: 'completed',sent: 2100, opened: 756, conversions: 42, budget: 0    },
  { id: '6', name: 'Google Ads Ortodoncia',         channel: 'google',   status: 'active',   sent: 0,    opened: 0,   conversions: 31, budget: 3200 },
  { id: '7', name: 'Meta Retargeting Prótesis',    channel: 'meta',     status: 'active',   sent: 0,    opened: 0,   conversions: 7,  budget: 900  },
  { id: '8', name: 'Email Bienvenida Nuevos',       channel: 'email',    status: 'active',   sent: 89,   opened: 78,  conversions: 15, budget: 0    },
]

const CHANNEL_ICONS: Record<string, React.ElementType> = { email: Mail, google: Search, meta: Globe, whatsapp: MessageSquare }
const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-sky-500/15 text-sky-400', google: 'bg-amber-500/15 text-amber-400',
  meta: 'bg-violet-500/15 text-violet-400', whatsapp: 'bg-emerald-500/15 text-emerald-400',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400', paused: 'bg-amber-500/15 text-amber-400', completed: 'bg-slate-500/15 text-slate-400',
}
const STATUS_LABELS: Record<string, string> = { active: 'Activa', paused: 'Pausada', completed: 'Completada' }

export default function CampaignsPage() {
  const [filter, setFilter] = useState('')

  const filtered = CAMPAIGNS.filter((c) => !filter || c.channel === filter || c.status === filter)
  const totalLeads = CAMPAIGNS.reduce((s, c) => s + c.conversions, 0)
  const totalBudget = CAMPAIGNS.reduce((s, c) => s + c.budget, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campañas de Marketing</h1>
          <p className="text-slate-400 text-sm mt-0.5">{CAMPAIGNS.length} campañas · {totalLeads} conversiones totales</p>
        </div>
        <button onClick={() => toast.info('Nueva campaña')} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nueva campaña
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Campañas activas', value: CAMPAIGNS.filter((c) => c.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Total conversiones', value: totalLeads, color: 'text-sky-400' },
          { label: 'Presupuesto total', value: `€${totalBudget.toLocaleString('es-ES')}`, color: 'text-amber-400' },
          { label: 'Emails enviados', value: CAMPAIGNS.filter((c) => c.channel === 'email').reduce((s, c) => s + c.sent, 0), color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Performance chart (simple bars) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-300">Rendimiento por campaña (conversiones)</h2>
        </div>
        <div className="space-y-2.5">
          {CAMPAIGNS.slice(0, 6).map((c) => {
            const Icon = CHANNEL_ICONS[c.channel] ?? Globe
            const pct = Math.round((c.conversions / 70) * 100)
            return (
              <div key={c.id} className="flex items-center gap-3 text-xs">
                <Icon className={`w-4 h-4 shrink-0 ${CHANNEL_COLORS[c.channel]?.split(' ')[1] ?? 'text-slate-400'}`} />
                <span className="w-52 text-slate-400 truncate">{c.name}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-slate-300 font-bold">{c.conversions}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'email', 'google', 'meta', 'whatsapp', 'active', 'paused', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f === filter ? '' : f)} className={['px-3 py-1.5 rounded-full text-xs font-medium border transition capitalize', filter === f ? 'bg-sky-500/20 border-sky-500/40 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'].join(' ')}>
            {f || 'Todas'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Canal</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3 hidden sm:table-cell">Enviados</th>
                <th className="text-right px-5 py-3 hidden lg:table-cell">Abiertos</th>
                <th className="text-right px-5 py-3">Conversiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((c) => {
                const Icon = CHANNEL_ICONS[c.channel] ?? Globe
                const openRate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(0) : '—'
                return (
                  <tr key={c.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-5 py-3.5 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`flex items-center gap-1.5 w-fit text-xs font-medium px-2 py-0.5 rounded-full ${CHANNEL_COLORS[c.channel]}`}>
                        <Icon className="w-3 h-3" />{c.channel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 hidden sm:table-cell">{c.sent > 0 ? c.sent.toLocaleString('es-ES') : '—'}</td>
                    <td className="px-5 py-3.5 text-right text-slate-400 hidden lg:table-cell">{openRate !== '—' ? `${openRate}%` : '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-400">{c.conversions}</td>
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
