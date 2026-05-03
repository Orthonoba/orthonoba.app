'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Download, Upload, User, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const PATIENTS = [
  { id: '1',  name: 'María González Ruiz',      dni: '12345678A', clinic: 'Clínica Dental Norte',  phone: '+34 612 345 678', cases: 2, lastVisit: '2026-04-28', age: 34 },
  { id: '2',  name: 'Carlos Martínez López',    dni: '23456789B', clinic: 'OrthoSmile Barcelona',  phone: '+34 623 456 789', cases: 1, lastVisit: '2026-04-25', age: 47 },
  { id: '3',  name: 'Ana Fernández Torres',      dni: '34567890C', clinic: 'Dental Vanguard',       phone: '+34 634 567 890', cases: 3, lastVisit: '2026-04-22', age: 28 },
  { id: '4',  name: 'José Ramírez García',       dni: '45678901D', clinic: 'Sonrisa Perfecta',      phone: '+34 645 678 901', cases: 0, lastVisit: '2026-03-15', age: 55 },
  { id: '5',  name: 'Laura Sánchez Moreno',      dni: '56789012E', clinic: 'Clínica Dental Norte',  phone: '+34 656 789 012', cases: 1, lastVisit: '2026-04-20', age: 31 },
  { id: '6',  name: 'Pedro Jiménez Navarro',     dni: '67890123F', clinic: 'OrthoSmile Barcelona',  phone: '+34 667 890 123', cases: 2, lastVisit: '2026-04-18', age: 42 },
  { id: '7',  name: 'Elena Díaz Blanco',         dni: '78901234G', clinic: 'Dental Excellence',     phone: '+34 678 901 234', cases: 1, lastVisit: '2026-04-10', age: 38 },
  { id: '8',  name: 'Roberto Alonso Pérez',      dni: '89012345H', clinic: 'OralTech Bilbao',       phone: '+34 689 012 345', cases: 0, lastVisit: '2026-03-28', age: 61 },
  { id: '9',  name: 'Sofía Castro Herrera',      dni: '90123456I', clinic: 'Sonrisa Perfecta',      phone: '+34 690 123 456', cases: 2, lastVisit: '2026-04-26', age: 25 },
  { id: '10', name: 'Miguel Ortega Vega',        dni: '01234567J', clinic: 'Clínica Dental Norte',  phone: '+34 601 234 567', cases: 1, lastVisit: '2026-04-15', age: 50 },
  { id: '11', name: 'Isabel Molina Reyes',       dni: '11234567K', clinic: 'Dental Vanguard',       phone: '+34 611 234 567', cases: 3, lastVisit: '2026-04-29', age: 36 },
  { id: '12', name: 'Francisco Torres Gil',      dni: '21234567L', clinic: 'OrthoSmile Barcelona',  phone: '+34 621 234 567', cases: 0, lastVisit: '2026-02-20', age: 68 },
  { id: '13', name: 'Carmen López Morales',      dni: '31234567M', clinic: 'Dental Excellence',     phone: '+34 631 234 567', cases: 1, lastVisit: '2026-04-05', age: 44 },
  { id: '14', name: 'Antonio Ruiz Campos',       dni: '41234567N', clinic: 'Clínica Dental Norte',  phone: '+34 641 234 567', cases: 2, lastVisit: '2026-04-30', age: 29 },
  { id: '15', name: 'Lucía Vargas Fuentes',      dni: '51234567O', clinic: 'Sonrisa Perfecta',      phone: '+34 651 234 567', cases: 1, lastVisit: '2026-04-21', age: 33 },
]

const CLINICS = [...new Set(PATIENTS.map((p) => p.clinic))]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [clinic, setClinic] = useState('')

  const filtered = PATIENTS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.dni.includes(search)
    const matchClinic = !clinic || p.clinic === clinic
    return matchSearch && matchClinic
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pacientes</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} pacientes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info('Importando CSV...')} className="flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-300 font-medium px-3 py-2 rounded-lg text-sm transition">
            <Upload className="w-4 h-4" /> Importar
          </button>
          <button onClick={() => toast.success('Exportando...')} className="flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-300 font-medium px-3 py-2 rounded-lg text-sm transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <Link href="/patients/new" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            <Plus className="w-4 h-4" /> Nuevo paciente
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nombre o DNI..." className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={clinic} onChange={(e) => setClinic(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todas las clínicas</option>
          {CLINICS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Paciente</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">DNI</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Clínica</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Teléfono</th>
                <th className="text-center px-5 py-3 font-medium">Casos</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Última visita</th>
                <th className="text-right px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.age} años</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs hidden md:table-cell">{p.dni}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />{p.clinic}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{p.phone}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${p.cases > 0 ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-500'}`}>
                      {p.cases}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{p.lastVisit}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/patients/${p.id}`} className="text-xs text-sky-400 hover:text-sky-300 font-medium transition">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No se encontraron pacientes</p>
          </div>
        )}
      </div>
    </div>
  )
}
