import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, TrendingUp, Calendar, Kanban, DollarSign, Phone, Target, Activity } from 'lucide-react'

export const metadata: Metadata = { title: 'CRM — Orthonoba' }

const STATS = [
  { label: 'Leads activos',      value: '148',    change: '+12%', color: 'text-sky-400',     icon: TrendingUp },
  { label: 'Pacientes CRM',      value: '1.284',  change: '+5%',  color: 'text-emerald-400', icon: Users },
  { label: 'Citas esta semana',  value: '47',     change: '-3%',  color: 'text-amber-400',   icon: Calendar },
  { label: 'Revenue pipeline',   value: '€84.2K', change: '+18%', color: 'text-violet-400',  icon: DollarSign },
]

const RECENT_LEADS = [
  { name: 'Carmen Vázquez',    source: 'Google Ads', status: 'Interesado',  value: '€3.800', phone: '+34 645 001 002', score: 87 },
  { name: 'Roberto Silva',     source: 'Meta',       status: 'Contactado',  value: '€2.200', phone: '+34 612 003 004', score: 72 },
  { name: 'María José Ruiz',   source: 'Referral',   status: 'Propuesta',   value: '€6.400', phone: '+34 689 005 006', score: 94 },
  { name: 'Felipe Torres',     source: 'Web',        status: 'Nuevo',       value: '€1.600', phone: '+34 678 007 008', score: 51 },
  { name: 'Natalia Herrera',   source: 'WhatsApp',   status: 'Ganado',      value: '€5.100', phone: '+34 623 009 010', score: 98 },
]

const STATUS_COLORS: Record<string, string> = {
  Nuevo: 'bg-slate-500/20 text-slate-400',
  Contactado: 'bg-sky-500/20 text-sky-400',
  Interesado: 'bg-violet-500/20 text-violet-400',
  Propuesta: 'bg-amber-500/20 text-amber-400',
  Ganado: 'bg-emerald-500/20 text-emerald-400',
  Perdido: 'bg-red-500/20 text-red-400',
}

const SCORE_COLOR = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'

const CRM_MODULES = [
  { href: '/crm/pipeline',     label: 'Pipeline',       desc: 'Vista Kanban del funnel de ventas',     icon: Kanban,     color: 'border-sky-500/30 bg-sky-500/5' },
  { href: '/crm/leads',        label: 'Leads',          desc: 'Gestión y calificación de leads con IA', icon: Target,     color: 'border-violet-500/30 bg-violet-500/5' },
  { href: '/crm/patients',     label: 'Pacientes CRM',  desc: 'Historial y segmentación de pacientes', icon: Users,      color: 'border-emerald-500/30 bg-emerald-500/5' },
  { href: '/crm/appointments', label: 'Citas',          desc: 'Calendario y gestión de citas',         icon: Calendar,   color: 'border-amber-500/30 bg-amber-500/5' },
]

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CRM Clínico</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestión de relaciones con pacientes y leads · Pipeline de ventas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className={`text-xs font-semibold ${s.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{s.change}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CRM modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CRM_MODULES.map((m) => (
          <Link key={m.href} href={m.href} className={`border rounded-xl p-5 hover:opacity-90 transition group ${m.color}`}>
            <m.icon className="w-6 h-6 text-slate-300 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">{m.label}</h3>
            <p className="text-xs text-slate-400">{m.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent leads table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white text-sm">Leads recientes</h2>
          <Link href="/crm/leads" className="text-xs text-sky-400 hover:text-sky-300 transition">Ver todos →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                <th className="text-left px-5 py-3">Lead</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Fuente</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3 hidden sm:table-cell">Score</th>
                <th className="text-right px-5 py-3">Valor</th>
                <th className="text-right px-5 py-3 hidden lg:table-cell">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {RECENT_LEADS.map((l) => (
                <tr key={l.name} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5 font-medium text-white">{l.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{l.source}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                    <span className={`font-bold text-sm ${SCORE_COLOR(l.score)}`}>{l.score}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-400">{l.value}</td>
                  <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                    <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition justify-end">
                      <Phone className="w-3 h-3" />{l.phone}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
