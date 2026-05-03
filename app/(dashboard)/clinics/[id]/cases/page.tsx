'use client'

import { useState } from 'react'
import { Plus, Clock, AlertCircle, CheckCircle2, Pencil } from 'lucide-react'

interface KanbanCase {
  id: string
  patient: string
  type: string
  priority: 'Alta' | 'Media' | 'Baja'
  date: string
  doctor: string
}

interface Column {
  id: string
  label: string
  color: string
  icon: React.ElementType
  cases: KanbanCase[]
}

const priorityColors: Record<string, string> = {
  Alta: 'bg-red-500/20 text-red-400',
  Media: 'bg-amber-500/20 text-amber-400',
  Baja: 'bg-slate-700 text-slate-400',
}

const COLUMNS: Column[] = [
  {
    id: 'nuevo',
    label: 'Nuevo',
    color: 'bg-slate-500/20 text-slate-400 border-slate-600',
    icon: Clock,
    cases: [
      { id: 'C-001', patient: 'María González', type: 'Retenedor Essix', priority: 'Media', date: '2026-04-28', doctor: 'Dr. Paredes' },
      { id: 'C-002', patient: 'Roberto Silva', type: 'Protector Bucal', priority: 'Baja', date: '2026-04-29', doctor: 'Dra. Vargas' },
    ],
  },
  {
    id: 'diseno',
    label: 'En Diseño',
    color: 'bg-sky-500/20 text-sky-400 border-sky-700',
    icon: Pencil,
    cases: [
      { id: 'C-003', patient: 'Ana Martínez', type: 'Ortodoncia', priority: 'Alta', date: '2026-04-15', doctor: 'Dr. Paredes' },
      { id: 'C-004', patient: 'Javier López', type: 'Prótesis Total', priority: 'Media', date: '2026-04-20', doctor: 'Dr. Ramos' },
    ],
  },
  {
    id: 'produccion',
    label: 'En Producción',
    color: 'bg-amber-500/20 text-amber-400 border-amber-700',
    icon: AlertCircle,
    cases: [
      { id: 'C-005', patient: 'Carmen Ruiz', type: 'Corona Zirconio', priority: 'Alta', date: '2026-04-10', doctor: 'Dra. Vargas' },
      { id: 'C-006', patient: 'Luis Morales', type: 'Retenedor Essix', priority: 'Media', date: '2026-04-18', doctor: 'Dr. Paredes' },
    ],
  },
  {
    id: 'completado',
    label: 'Completado',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-700',
    icon: CheckCircle2,
    cases: [
      { id: 'C-007', patient: 'Isabel Torres', type: 'Ortodoncia', priority: 'Alta', date: '2026-04-05', doctor: 'Dr. Ramos' },
      { id: 'C-008', patient: 'Pedro Castro', type: 'Prótesis Parcial', priority: 'Baja', date: '2026-03-30', doctor: 'Dra. Vargas' },
    ],
  },
]

function CaseCard({ c }: { c: KanbanCase }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-slate-500">{c.id}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[c.priority]}`}>{c.priority}</span>
      </div>
      <p className="font-medium text-white text-sm mb-1 group-hover:text-sky-300 transition">{c.patient}</p>
      <p className="text-xs text-slate-400 mb-3">{c.type}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{c.doctor}</span>
        <span className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString('es-CL')}</span>
      </div>
    </div>
  )
}

export default function ClinicCasesKanbanPage() {
  const [columns] = useState<Column[]>(COLUMNS)

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Casos — Kanban</h1>
            <p className="text-slate-400 text-sm mt-1">Clínica Dental Providencia</p>
          </div>
          <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2.5 rounded-lg transition">
            <Plus className="w-4 h-4" /> Nuevo Caso
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {columns.map((col) => (
            <div key={col.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${col.color}`}>
              <col.icon className="w-4 h-4" />
              {col.label}
              <span className="bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded-full">{col.cases.length}</span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${col.color}`}>
                <div className="flex items-center gap-2">
                  <col.icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{col.label}</span>
                </div>
                <span className="text-xs font-bold">{col.cases.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {col.cases.map((c) => (
                  <CaseCard key={c.id} c={c} />
                ))}
              </div>

              {/* Add button */}
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-400 text-sm py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 transition">
                <Plus className="w-4 h-4" /> Agregar caso
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
