'use client'

import { useState } from 'react'
import { Search, Download, Eye, Pencil, Trash2, UserPlus } from 'lucide-react'

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  activeCases: number
  lastVisit: string
  email: string
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P-001', name: 'María González', age: 34, phone: '+56 9 1234 5678', activeCases: 2, lastVisit: '2026-04-28', email: 'maria@mail.com' },
  { id: 'P-002', name: 'Carlos Fuentes', age: 52, phone: '+56 9 2345 6789', activeCases: 1, lastVisit: '2026-04-25', email: 'carlos@mail.com' },
  { id: 'P-003', name: 'Ana Martínez', age: 27, phone: '+56 9 3456 7890', activeCases: 0, lastVisit: '2026-04-20', email: 'ana@mail.com' },
  { id: 'P-004', name: 'Roberto Silva', age: 45, phone: '+56 9 4567 8901', activeCases: 3, lastVisit: '2026-04-18', email: 'roberto@mail.com' },
  { id: 'P-005', name: 'Isabel Torres', age: 38, phone: '+56 9 5678 9012', activeCases: 1, lastVisit: '2026-04-15', email: 'isabel@mail.com' },
  { id: 'P-006', name: 'Javier López', age: 61, phone: '+56 9 6789 0123', activeCases: 0, lastVisit: '2026-04-10', email: 'javier@mail.com' },
  { id: 'P-007', name: 'Carmen Ruiz', age: 29, phone: '+56 9 7890 1234', activeCases: 2, lastVisit: '2026-04-08', email: 'carmen@mail.com' },
  { id: 'P-008', name: 'Luis Morales', age: 43, phone: '+56 9 8901 2345', activeCases: 1, lastVisit: '2026-04-05', email: 'luis@mail.com' },
  { id: 'P-009', name: 'Sofía Pérez', age: 24, phone: '+56 9 9012 3456', activeCases: 0, lastVisit: '2026-03-30', email: 'sofia@mail.com' },
  { id: 'P-010', name: 'Pedro Castro', age: 55, phone: '+56 9 0123 4567', activeCases: 1, lastVisit: '2026-03-25', email: 'pedro@mail.com' },
]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('')
}

const AVATAR_COLORS = [
  'bg-sky-500/20 text-sky-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
]

export default function ClinicPatientsPage() {
  const [search, setSearch] = useState('')
  const patients = MOCK_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const headers = 'ID,Nombre,Edad,Teléfono,Email,Casos Activos,Última Visita'
    const rows = MOCK_PATIENTS.map((p) =>
      `${p.id},${p.name},${p.age},${p.phone},${p.email},${p.activeCases},${p.lastVisit}`
    ).join('\n')
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pacientes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Pacientes de la Clínica</h1>
            <p className="text-slate-400 text-sm mt-1">{MOCK_PATIENTS.length} pacientes registrados</p>
          </div>
          <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2.5 rounded-lg transition">
            <UserPlus className="w-4 h-4" /> Nuevo Paciente
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-lg transition text-sm"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Paciente', 'Edad', 'Teléfono', 'Casos Activos', 'Última Visita', 'Acciones'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {patients.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {initials(p.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{p.age} años</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{p.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.activeCases > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-500'}`}>
                        {p.activeCases} {p.activeCases === 1 ? 'caso' : 'casos'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(p.lastVisit).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {patients.length === 0 && (
            <div className="text-center py-12 text-slate-500">No se encontraron pacientes</div>
          )}
        </div>
      </div>
    </div>
  )
}
