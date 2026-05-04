'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, LayoutGrid, Table2, Plus, Eye, Pencil, Trash2, ChevronDown, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface DentalCase {
  id: string
  patient: string
  clinic: string
  type: string
  status: 'Nuevo' | 'En Diseño' | 'En Producción' | 'Completado' | 'Cancelado'
  priority: 'Alta' | 'Media' | 'Baja'
  date: string
  doctor: string
}

const MOCK_CASES: DentalCase[] = [
  { id: 'C-001', patient: 'María González', clinic: 'Clínica Providencia', type: 'Retenedor Essix', status: 'Nuevo', priority: 'Media', date: '2026-04-28', doctor: 'Dr. Paredes' },
  { id: 'C-002', patient: 'Carlos Fuentes', clinic: 'Dental Santiago Centro', type: 'Ortodoncia', status: 'En Diseño', priority: 'Alta', date: '2026-04-20', doctor: 'Dra. Vargas' },
  { id: 'C-003', patient: 'Ana Martínez', clinic: 'Clínica Providencia', type: 'Protector Bucal', status: 'En Producción', priority: 'Baja', date: '2026-04-15', doctor: 'Dr. Ramos' },
  { id: 'C-004', patient: 'Roberto Silva', clinic: 'Dental Las Condes', type: 'Prótesis Total', status: 'Completado', priority: 'Alta', date: '2026-04-10', doctor: 'Dr. Paredes' },
  { id: 'C-005', patient: 'Isabel Torres', clinic: 'Clínica Providencia', type: 'Corona Zirconio', status: 'En Diseño', priority: 'Media', date: '2026-04-08', doctor: 'Dra. Vargas' },
  { id: 'C-006', patient: 'Javier López', clinic: 'Dental Santiago Centro', type: 'Retenedor Essix', status: 'Completado', priority: 'Baja', date: '2026-04-05', doctor: 'Dr. Ramos' },
  { id: 'C-007', patient: 'Carmen Ruiz', clinic: 'Dental Las Condes', type: 'Ortodoncia', status: 'En Producción', priority: 'Alta', date: '2026-04-01', doctor: 'Dr. Paredes' },
  { id: 'C-008', patient: 'Luis Morales', clinic: 'Clínica Providencia', type: 'Prótesis Parcial', status: 'Nuevo', priority: 'Media', date: '2026-03-30', doctor: 'Dra. Vargas' },
  { id: 'C-009', patient: 'Sofía Pérez', clinic: 'Dental Las Condes', type: 'Protector Bucal', status: 'Completado', priority: 'Baja', date: '2026-03-25', doctor: 'Dr. Ramos' },
  { id: 'C-010', patient: 'Pedro Castro', clinic: 'Dental Santiago Centro', type: 'Corona Zirconio', status: 'En Diseño', priority: 'Alta', date: '2026-03-20', doctor: 'Dr. Paredes' },
  { id: 'C-011', patient: 'Valentina Rojas', clinic: 'Clínica Providencia', type: 'Ortodoncia', status: 'En Producción', priority: 'Media', date: '2026-03-18', doctor: 'Dra. Vargas' },
  { id: 'C-012', patient: 'Diego Herrera', clinic: 'Dental Las Condes', type: 'Retenedor Essix', status: 'Nuevo', priority: 'Alta', date: '2026-03-15', doctor: 'Dr. Ramos' },
]

const STATUS_COLORS: Record<string, string> = {
  'Nuevo': 'bg-slate-700/80 text-slate-300',
  'En Diseño': 'bg-sky-500/20 text-sky-400',
  'En Producción': 'bg-amber-500/20 text-amber-400',
  'Completado': 'bg-emerald-500/20 text-emerald-400',
  'Cancelado': 'bg-red-500/20 text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'bg-red-500/20 text-red-400',
  Media: 'bg-amber-500/20 text-amber-400',
  Baja: 'bg-slate-700 text-slate-400',
}

const KANBAN_COLUMNS = ['Nuevo', 'En Diseño', 'En Producción', 'Completado'] as const

function KanbanCard({ c }: { c: DentalCase }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-slate-500">{c.id}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
      </div>
      <p className="font-medium text-white text-sm mb-0.5">{c.patient}</p>
      <p className="text-xs text-slate-400 mb-2">{c.type}</p>
      <p className="text-xs text-slate-500 mb-2">{c.clinic}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{c.doctor}</span>
        <span className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString('es-CL')}</span>
      </div>
    </div>
  )
}

const CLINICS = ['Todas las clínicas', 'Clínica Providencia', 'Dental Santiago Centro', 'Dental Las Condes']
const STATUSES = ['Todos', 'Nuevo', 'En Diseño', 'En Producción', 'Completado']
const TYPES = ['Todos los tipos', 'Retenedor Essix', 'Ortodoncia', 'Protector Bucal', 'Prótesis Total', 'Prótesis Parcial', 'Corona Zirconio']
const PRIORITIES = ['Todas', 'Alta', 'Media', 'Baja']

export default function CasesPage() {
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    if (typeof window === 'undefined') return 'table'
    const saved = localStorage.getItem('cases-view')
    return saved === 'kanban' ? 'kanban' : 'table'
  })
  const [search, setSearch] = useState('')
  const [clinic, setClinic] = useState('Todas las clínicas')
  const [status, setStatus] = useState('Todos')
  const [type, setType] = useState('Todos los tipos')
  const [priority, setPriority] = useState('Todas')
  const [showFilters, setShowFilters] = useState(false)

  const toggleView = (v: 'table' | 'kanban') => {
    setView(v)
    localStorage.setItem('cases-view', v)
  }

  const filtered = MOCK_CASES.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.patient.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
    const matchClinic = clinic === 'Todas las clínicas' || c.clinic === clinic
    const matchStatus = status === 'Todos' || c.status === status
    const matchType = type === 'Todos los tipos' || c.type === type
    const matchPriority = priority === 'Todas' || c.priority === priority
    return matchSearch && matchClinic && matchStatus && matchType && matchPriority
  })

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Casos</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} casos encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => toggleView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'table' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Table2 className="w-4 h-4" /> Tabla
              </button>
              <button
                onClick={() => toggleView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'kanban' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Kanban
              </button>
            </div>
            <Link href="/cases/new" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2.5 rounded-lg transition text-sm">
              <Plus className="w-4 h-4" /> Nuevo Caso
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por paciente, ID, tipo…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${showFilters ? 'bg-sky-500/15 border-sky-500/40 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
          >
            <Filter className="w-4 h-4" /> Filtros <ChevronDown className={`w-3 h-3 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Clínica</label>
              <select value={clinic} onChange={(e) => setClinic(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                {CLINICS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['ID', 'Paciente', 'Clínica', 'Tipo', 'Estado', 'Prioridad', 'Fecha', 'Acciones'].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-700/30 transition group">
                      <td className="px-4 py-3 text-xs font-mono text-sky-400">{c.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white">{c.patient}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{c.clinic}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{c.type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{new Date(c.date).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                          <button className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">No se encontraron casos con los filtros seleccionados</div>
            )}
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((col) => {
              const colCases = filtered.filter((c) => c.status === col)
              const colColors: Record<string, string> = {
                'Nuevo': 'text-slate-400 border-slate-600',
                'En Diseño': 'text-sky-400 border-sky-700',
                'En Producción': 'text-amber-400 border-amber-700',
                'Completado': 'text-emerald-400 border-emerald-700',
              }
              const colIcons: Record<string, React.ElementType> = {
                'Nuevo': Clock,
                'En Diseño': AlertCircle,
                'En Producción': AlertCircle,
                'Completado': CheckCircle2,
              }
              const Icon = colIcons[col]
              return (
                <div key={col} className="flex flex-col gap-3">
                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colColors[col]}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{col}</span>
                    </div>
                    <span className="text-xs font-bold">{colCases.length}</span>
                  </div>
                  <div className="space-y-3">
                    {colCases.map((c) => <KanbanCard key={c.id} c={c} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
