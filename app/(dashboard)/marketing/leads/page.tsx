'use client'
import { useState } from 'react'
import { Phone, Mail, DollarSign, Plus } from 'lucide-react'
import { toast } from 'sonner'

const COLUMNS = [
  { id: 'new',       label: 'Nuevo',     color: 'border-slate-600' },
  { id: 'contacted', label: 'Contactado', color: 'border-sky-500/40' },
  { id: 'interested',label: 'Interesado', color: 'border-violet-500/40' },
  { id: 'proposal',  label: 'Propuesta',  color: 'border-amber-500/40' },
  { id: 'won',       label: 'Ganado',     color: 'border-emerald-500/40' },
  { id: 'lost',      label: 'Perdido',    color: 'border-red-500/40' },
]

const SOURCE_COLORS: Record<string, string> = {
  'Google': 'bg-sky-500/15 text-sky-400',
  'Meta': 'bg-violet-500/15 text-violet-400',
  'Referral': 'bg-emerald-500/15 text-emerald-400',
  'Web': 'bg-amber-500/15 text-amber-400',
  'WhatsApp': 'bg-teal-500/15 text-teal-400',
}

const INITIAL_LEADS = [
  { id: '1',  name: 'Roberto Silva',       clinic: 'Clínica Norte',   source: 'Google',   value: 2800, date: '2026-04-28', status: 'new',        phone: '+34 612 001 001' },
  { id: '2',  name: 'Marta Jiménez',       clinic: 'OrthoSmile',      source: 'Meta',     value: 4500, date: '2026-04-27', status: 'new',        phone: '+34 623 002 002' },
  { id: '3',  name: 'Luis Fernández',      clinic: 'Dental Norte',    source: 'Web',      value: 1200, date: '2026-04-26', status: 'contacted',  phone: '+34 634 003 003' },
  { id: '4',  name: 'Carmen Vázquez',      clinic: 'OrthoSmile',      source: 'Referral', value: 3600, date: '2026-04-25', status: 'contacted',  phone: '+34 645 004 004' },
  { id: '5',  name: 'Pablo Torres',        clinic: 'Dental Norte',    source: 'Google',   value: 5200, date: '2026-04-24', status: 'interested', phone: '+34 656 005 005' },
  { id: '6',  name: 'Elena Morales',       clinic: 'Sonrisa',         source: 'Meta',     value: 2100, date: '2026-04-23', status: 'interested', phone: '+34 667 006 006' },
  { id: '7',  name: 'Diego Romero',        clinic: 'Clínica Norte',   source: 'WhatsApp', value: 7800, date: '2026-04-22', status: 'proposal',   phone: '+34 678 007 007' },
  { id: '8',  name: 'Silvia Castro',       clinic: 'OrthoSmile',      source: 'Google',   value: 3300, date: '2026-04-20', status: 'proposal',   phone: '+34 689 008 008' },
  { id: '9',  name: 'Alberto Núñez',       clinic: 'Dental Norte',    source: 'Referral', value: 9500, date: '2026-04-18', status: 'won',        phone: '+34 690 009 009' },
  { id: '10', name: 'Beatriz Herrera',     clinic: 'Sonrisa',         source: 'Meta',     value: 1800, date: '2026-04-15', status: 'lost',       phone: '+34 601 010 010' },
  { id: '11', name: 'Fernando Reyes',      clinic: 'Clínica Norte',   source: 'Google',   value: 4200, date: '2026-04-29', status: 'new',        phone: '+34 612 011 011' },
  { id: '12', name: 'Natalia Vargas',      clinic: 'OrthoSmile',      source: 'Web',      value: 6100, date: '2026-04-30', status: 'contacted',  phone: '+34 623 012 012' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState(INITIAL_LEADS)

  function moveToNext(id: string) {
    const order = COLUMNS.map((c) => c.id)
    setLeads((prev) => prev.map((l) => {
      if (l.id !== id) return l
      const idx = order.indexOf(l.status)
      if (idx < order.length - 1) {
        toast.success(`Lead movido a "${COLUMNS[idx + 1]?.label}"`)
        return { ...l, status: order[idx + 1] ?? l.status }
      }
      return l
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM — Pipeline de Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">{leads.length} leads en total</p>
        </div>
        <button onClick={() => toast.info('Nuevo lead')} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nuevo lead
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id)
          const totalValue = colLeads.reduce((s, l) => s + l.value, 0)
          return (
            <div key={col.id} className={`flex-none w-60 bg-slate-800/60 border ${col.color} rounded-xl`}>
              <div className="px-3 py-3 border-b border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">{col.label}</span>
                  <span className="bg-slate-700 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">€{totalValue.toLocaleString('es-ES')}</p>
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-sky-500/40 transition cursor-pointer">
                    <p className="text-sm font-semibold text-white mb-1">{lead.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{lead.clinic}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] ?? 'bg-slate-700 text-slate-400'}`}>{lead.source}</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><DollarSign className="w-3 h-3" />€{lead.value.toLocaleString('es-ES')}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => toast.info(`Llamando a ${lead.name}`)} className="flex-1 flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-sky-400 border border-slate-700 hover:border-sky-500/40 rounded py-1 transition">
                        <Phone className="w-3 h-3" />
                      </button>
                      <button onClick={() => toast.info(`Email a ${lead.name}`)} className="flex-1 flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 rounded py-1 transition">
                        <Mail className="w-3 h-3" />
                      </button>
                      {col.id !== 'won' && col.id !== 'lost' && (
                        <button onClick={() => moveToNext(lead.id)} className="flex-1 flex items-center justify-center text-[10px] text-slate-400 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded py-1 transition">
                          →
                        </button>
                      )}
                    </div>
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
