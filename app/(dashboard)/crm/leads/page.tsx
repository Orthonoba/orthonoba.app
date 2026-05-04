import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Leads CRM — Orthonoba' }

const LEADS = [
  { id: '1',  name: 'Carmen Vázquez',    email: 'carmen@email.es',   source: 'Google Ads', status: 'Propuesta',   score: 94, value: '€6.400', lastContact: '2026-05-01' },
  { id: '2',  name: 'Roberto Silva',     email: 'rsilva@clinica.es', source: 'Meta',       status: 'Contactado',  score: 72, value: '€2.200', lastContact: '2026-04-30' },
  { id: '3',  name: 'María José Ruiz',   email: 'mj@email.com',      source: 'Referral',   status: 'Ganado',      score: 98, value: '€5.100', lastContact: '2026-05-02' },
  { id: '4',  name: 'Felipe Torres',     email: 'ftorres@mail.es',   source: 'Web',        status: 'Nuevo',       score: 51, value: '€1.600', lastContact: '2026-05-04' },
  { id: '5',  name: 'Natalia Herrera',   email: 'nat@dental.es',     source: 'WhatsApp',   status: 'Interesado',  score: 87, value: '€3.800', lastContact: '2026-05-03' },
  { id: '6',  name: 'Jorge Ramírez',     email: 'jorge@email.es',    source: 'Google Ads', status: 'Nuevo',       score: 45, value: '€3.200', lastContact: '2026-05-04' },
  { id: '7',  name: 'Lucía Morales',     email: 'lucia@mail.com',    source: 'Meta',       status: 'Contactado',  score: 68, value: '€4.500', lastContact: '2026-05-01' },
  { id: '8',  name: 'Andrés Fuentes',    email: 'afuentes@es.com',   source: 'Referral',   status: 'Propuesta',   score: 91, value: '€7.800', lastContact: '2026-04-29' },
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
const GRADE = (s: number) => s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'

export default function LeadsCRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">{LEADS.length} leads activos · Calificados con IA</p>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/pipeline" className="flex items-center gap-2 border border-slate-600 hover:border-sky-500/40 text-slate-300 font-medium px-4 py-2 rounded-lg text-sm transition">
            Ver Kanban
          </Link>
          <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            <Plus className="w-4 h-4" /> Nuevo lead
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Lead</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Fuente</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-center px-5 py-3">Score IA</th>
                <th className="text-right px-5 py-3 hidden sm:table-cell">Valor</th>
                <th className="text-right px-5 py-3 hidden lg:table-cell">Último contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {LEADS.sort((a, b) => b.score - a.score).map((l) => (
                <tr key={l.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-white">{l.name}</p>
                      <p className="text-xs text-slate-500">{l.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{l.source}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${SCORE_COLOR(l.score)}`} />
                      <span className={`font-bold ${SCORE_COLOR(l.score)}`}>{l.score}</span>
                      <span className={`text-xs font-bold px-1.5 rounded ${l.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : l.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {GRADE(l.score)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-400 hidden sm:table-cell">{l.value}</td>
                  <td className="px-5 py-3.5 text-right text-slate-400 text-xs hidden lg:table-cell">{l.lastContact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
