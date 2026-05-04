'use client'
import type { Metadata } from 'next'
import { useState } from 'react'
import { DollarSign, Plus } from 'lucide-react'
import { toast } from 'sonner'

const COLUMNS = [
  { id: 'new',        label: 'Nuevo',     color: 'border-slate-600' },
  { id: 'contacted',  label: 'Contactado', color: 'border-sky-500/40' },
  { id: 'interested', label: 'Interesado', color: 'border-violet-500/40' },
  { id: 'proposal',   label: 'Propuesta',  color: 'border-amber-500/40' },
  { id: 'won',        label: 'Ganado',     color: 'border-emerald-500/40' },
  { id: 'lost',       label: 'Perdido',    color: 'border-red-500/40' },
]

const SOURCE_COLORS: Record<string, string> = {
  Google: 'bg-amber-500/15 text-amber-400',
  Meta: 'bg-violet-500/15 text-violet-400',
  Referral: 'bg-emerald-500/15 text-emerald-400',
  Web: 'bg-sky-500/15 text-sky-400',
  WhatsApp: 'bg-teal-500/15 text-teal-400',
}

const INITIAL_LEADS = [
  { id: '1',  name: 'Carmen Vázquez',    source: 'Google',   value: 3800, status: 'interested' },
  { id: '2',  name: 'Roberto Silva',     source: 'Meta',     value: 2200, status: 'contacted' },
  { id: '3',  name: 'María José Ruiz',   source: 'Referral', value: 6400, status: 'proposal' },
  { id: '4',  name: 'Felipe Torres',     source: 'Web',      value: 1600, status: 'new' },
  { id: '5',  name: 'Natalia Herrera',   source: 'WhatsApp', value: 5100, status: 'won' },
  { id: '6',  name: 'Jorge Ramírez',     source: 'Google',   value: 3200, status: 'new' },
  { id: '7',  name: 'Lucía Morales',     source: 'Meta',     value: 4500, status: 'contacted' },
  { id: '8',  name: 'Andrés Fuentes',    source: 'Referral', value: 7800, status: 'proposal' },
  { id: '9',  name: 'Claudia Pinto',     source: 'Web',      value: 2900, status: 'lost' },
  { id: '10', name: 'Samuel Castro',     source: 'WhatsApp', value: 1100, status: 'won' },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState(INITIAL_LEADS)

  function moveNext(id: string) {
    const order = COLUMNS.map((c) => c.id)
    setLeads((prev) => prev.map((l) => {
      if (l.id !== id) return l
      const idx = order.indexOf(l.status)
      if (idx < order.length - 1) {
        const next = COLUMNS[idx + 1]
        toast.success(`Movido a "${next?.label}"`)
        return { ...l, status: order[idx + 1] ?? l.status }
      }
      return l
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline CRM</h1>
          <p className="text-slate-400 text-sm mt-0.5">{leads.length} leads en total</p>
        </div>
        <button onClick={() => toast.info('Nuevo lead')} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nuevo lead
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id)
          const total = colLeads.reduce((s, l) => s + l.value, 0)
          return (
            <div key={col.id} className={`flex-none w-56 bg-slate-800/60 border ${col.color} rounded-xl`}>
              <div className="px-3 py-3 border-b border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">{col.label}</span>
                  <span className="bg-slate-700 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3" />€{total.toLocaleString('es-ES')}</p>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-sky-500/40 transition">
                    <p className="text-sm font-semibold text-white mb-1">{lead.name}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] ?? 'bg-slate-700 text-slate-400'}`}>{lead.source}</span>
                      <span className="text-xs font-bold text-emerald-400">€{lead.value.toLocaleString('es-ES')}</span>
                    </div>
                    {col.id !== 'won' && col.id !== 'lost' && (
                      <button onClick={() => moveNext(lead.id)} className="mt-2 w-full text-[10px] text-slate-500 hover:text-sky-400 border border-slate-700 hover:border-sky-500/40 rounded py-1 transition">
                        → Avanzar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
